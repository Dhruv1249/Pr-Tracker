#!/usr/bin/env bash
# =============================================================================
# deploy-monitoring.sh
# One-shot, idempotent script to deploy the complete PR Tracker observability
# stack (Prometheus + Grafana + Alertmanager) into a K3s cluster.
#
# Usage (from the project root):
#   bash k8s/monitoring/deploy-monitoring.sh
#
# Prerequisites:
#   - helm >= 3.x  in PATH
#   - kubectl      configured to talk to your K3s cluster
#   - GRAFANA_ADMIN_PASSWORD env var set (or prompted interactively)
# =============================================================================
set -euo pipefail

CHART_RELEASE="kube-prometheus-stack"
MONITORING_NS="monitoring"
APP_NS="jenkins"
VALUES_FILE="k8s/monitoring/prometheus-stack-values.yaml"
TIMEOUT="8m"

# ──────────────────────────────────────────────────────────────────────────────
# Colour helpers
# ──────────────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}✔${NC}  $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
error() { echo -e "${RED}✘${NC}  $*" >&2; exit 1; }

# ──────────────────────────────────────────────────────────────────────────────
# 0. Pre-flight checks
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   PR Tracker — Observability Stack Deployment            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

command -v helm    >/dev/null 2>&1 || error "helm not found. Install from https://helm.sh/docs/intro/install/"
command -v kubectl >/dev/null 2>&1 || error "kubectl not found."

kubectl cluster-info >/dev/null 2>&1 || error "kubectl cannot reach the cluster. Check your KUBECONFIG."
info "Cluster reachable."

[[ -f "$VALUES_FILE" ]] || error "Values file not found: $VALUES_FILE. Run from the project root."

# ──────────────────────────────────────────────────────────────────────────────
# 1. Apply secrets-prod.yaml (contains grafana-admin-secret + app secrets)
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "─── Step 1 — Applying prod secrets ───────────────────────────"

SECRETS_FILE="${SECRETS_FILE:-k8s/secrets-prod.yaml}"
[[ -f "$SECRETS_FILE" ]] || error "Secrets file not found: $SECRETS_FILE. Set SECRETS_FILE env var or run from project root."

# Ensure monitoring namespace exists before applying the grafana-admin-secret
kubectl get namespace "$MONITORING_NS" >/dev/null 2>&1 \
  || kubectl create namespace "$MONITORING_NS"

kubectl apply -f "$SECRETS_FILE"
info "Prod secrets applied (includes grafana-admin-secret in $MONITORING_NS namespace)."

# ──────────────────────────────────────────────────────────────────────────────
# 2. Helm repo — add / update (idempotent)
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "─── Step 2 — Helm repository ─────────────────────────────────"

helm repo list 2>/dev/null | grep -q "prometheus-community" \
  && info "prometheus-community repo already registered." \
  || helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update >/dev/null
info "Helm repos updated."

# ──────────────────────────────────────────────────────────────────────────────
# 3. Deploy kube-prometheus-stack
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "─── Step 3 — Deploying kube-prometheus-stack ─────────────────"

helm upgrade --install "$CHART_RELEASE" \
  prometheus-community/kube-prometheus-stack \
  --namespace "$MONITORING_NS" \
  --create-namespace \
  -f "$VALUES_FILE" \
  --wait \
  --timeout "$TIMEOUT" \
  --atomic              # rolls back automatically on failure

info "kube-prometheus-stack deployed."

# ──────────────────────────────────────────────────────────────────────────────
# 4. Apply monitoring CRDs and manifests
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "─── Step 4 — Applying manifests ──────────────────────────────"

kubectl apply -f k8s/monitoring/servicemonitor.yaml
info "ServiceMonitor applied."

kubectl apply -f k8s/monitoring/grafana-ingress.yaml
info "Grafana Ingress + StripPrefix middleware applied."

kubectl apply -f k8s/monitoring/grafana-dashboard-gateway.yaml
info "API Gateway dashboard ConfigMap applied (auto-imported by Grafana)."

# ──────────────────────────────────────────────────────────────────────────────
# 5. Ensure service-router Service has the named 'http' port Prometheus needs
#    (idempotent — kubectl apply is a no-op if nothing changed)
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "─── Step 5 — Refreshing service-router Service ───────────────"

if [[ -f "k8s/service-router.yaml" ]]; then
  kubectl apply -f k8s/service-router.yaml -n "$APP_NS"
  info "service-router.yaml applied to namespace $APP_NS."
else
  warn "k8s/service-router.yaml not found — skipping."
fi

# ──────────────────────────────────────────────────────────────────────────────
# 6. Wait for Prometheus and Grafana pods to become Ready
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "─── Step 6 — Waiting for pods to be Ready ────────────────────"

kubectl rollout status deployment/"${CHART_RELEASE}-grafana" \
  -n "$MONITORING_NS" --timeout=4m
info "Grafana pod is Ready."

kubectl rollout status statefulset/prometheus-"${CHART_RELEASE}-prometheus" \
  -n "$MONITORING_NS" --timeout=4m
info "Prometheus pod is Ready."

# ──────────────────────────────────────────────────────────────────────────────
# 7. Verify ServiceMonitor is discovered
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "─── Step 7 — Verification ────────────────────────────────────"

kubectl get servicemonitor service-router-metrics \
  -n "$MONITORING_NS" >/dev/null 2>&1 \
  && info "ServiceMonitor 'service-router-metrics' exists." \
  || warn "ServiceMonitor not found — check namespace and labels."

kubectl get pods -n "$MONITORING_NS" --field-selector=status.phase=Running \
  | grep -E "prometheus|grafana|alertmanager" \
  && info "All monitoring pods running." \
  || warn "Some pods may still be initializing — check with: kubectl get pods -n $MONITORING_NS"

# ──────────────────────────────────────────────────────────────────────────────
# 8. Print access info
# ──────────────────────────────────────────────────────────────────────────────
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null || echo "<node-ip>")

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅  Observability stack is LIVE                        ║"
echo "╠══════════════════════════════════════════════════════════╣"
printf "║   Grafana  : http://%-36s║\n" "${NODE_IP}/grafana"
printf "║   Prometheus: http://%-35s║\n" "${NODE_IP}:9090  (cluster-internal)"
echo "║   Username : admin                                       ║"
echo "║   Password : <value you entered above>                   ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║   Useful commands:                                       ║"
echo "║   kubectl get pods -n monitoring                         ║"
echo "║   kubectl get servicemonitor -n monitoring               ║"
echo "║   kubectl logs -n monitoring -l app.kubernetes.io/       ║"
echo "║     name=grafana -f                                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
