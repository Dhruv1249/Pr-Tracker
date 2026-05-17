pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kubectl
    image: alpine/k8s:1.29.2
    command: [sleep]
    args: ["36000"]
    volumeMounts:
    - name: kubeconfig
      mountPath: /kube/k3s.yaml
      subPath: k3s.yaml
      readOnly: true
    - name: k8s-dir
      mountPath: /mnt/k8s
      readOnly: true
  # Separate container with Helm + kubectl for the monitoring stage
  - name: helm
    image: alpine/helm:3.14.4
    command: [sleep]
    args: ["36000"]
    volumeMounts:
    - name: kubeconfig
      mountPath: /kube/k3s.yaml
      subPath: k3s.yaml
      readOnly: true
    - name: k8s-dir
      mountPath: /mnt/k8s
      readOnly: true
  volumes:
  - name: kubeconfig
    hostPath:
      path: /etc/rancher/k3s
      type: Directory
  - name: k8s-dir
    hostPath:
      path: /home/opc/project/k8s
      type: Directory
'''
        }
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        KUBECONFIG    = '/kube/k3s.yaml'
        APP_NS        = 'jenkins'
        MONITORING_NS = 'monitoring'
        HELM_RELEASE  = 'kube-prometheus-stack'
    }

    stages {

        // ─── 1. Debug ────────────────────────────────────────────────────────
        stage('Debug Kubeconfig') {
            steps {
                container('kubectl') {
                    sh 'kubectl config view --minify'
                    sh 'kubectl get nodes -o wide'
                }
            }
        }

        // ─── 2. Deploy application microservices ─────────────────────────────
        stage('Deploy to K3s') {
            steps {
                container('kubectl') {
                    script {
                        // Double quotes → Groovy GString interpolation of env vars
                        echo "▶ Applying Kubernetes manifests (${env.APP_NS} namespace)…"

                        // Apply secrets — no -n flag needed because both objects in
                        // secrets-prod.yaml have their namespace explicitly declared:
                        //   pr-tracker-secrets  → namespace: jenkins
                        //   grafana-admin-secret → namespace: monitoring
                        sh 'kubectl apply -f /mnt/k8s/secrets-prod.yaml'

                        sh "kubectl apply -f k8s/configmap-prod.yaml   -n ${env.APP_NS}"
                        sh "kubectl apply -f k8s/auth.yaml             -n ${env.APP_NS}"
                        sh "kubectl apply -f k8s/backend.yaml          -n ${env.APP_NS}"
                        sh "kubectl apply -f k8s/ai-agent.yaml         -n ${env.APP_NS}"
                        sh "kubectl apply -f k8s/mongodb.yaml          -n ${env.APP_NS}"
                        sh "kubectl apply -f k8s/service-router.yaml   -n ${env.APP_NS}"
                        sh "kubectl apply -f k8s/frontend.yaml         -n ${env.APP_NS}"
                        sh "kubectl apply -f k8s/ingress.yaml          -n ${env.APP_NS}"
                    }
                }
            }
        }

        // ─── 3a. Apply monitoring K8s manifests ──────────────────────────────
        stage('Apply Monitoring Manifests') {
            steps {
                container('kubectl') {
                    script {
                        echo "▶ Ensuring ${env.MONITORING_NS} namespace exists…"
                        sh "kubectl get namespace ${env.MONITORING_NS} 2>/dev/null || kubectl create namespace ${env.MONITORING_NS}"

                        // secrets-prod.yaml already applied in stage 2 above.
                        // grafana-admin-secret has explicit namespace: monitoring,
                        // so it landed in the right place already.

                        echo '▶ Applying ServiceMonitor…'
                        sh 'kubectl apply -f k8s/monitoring/servicemonitor.yaml'

                        echo '▶ Applying Grafana Ingress + StripPrefix middleware…'
                        sh 'kubectl apply -f k8s/monitoring/grafana-ingress.yaml'

                        echo '▶ Applying auto-provisioned Grafana dashboard ConfigMap…'
                        sh 'kubectl apply -f k8s/monitoring/grafana-dashboard-gateway.yaml'
                    }
                }
            }
        }

        // ─── 3b. Helm upgrade (needs helm binary — runs in helm container) ────
        stage('Helm Upgrade Monitoring') {
            steps {
                container('helm') {
                    script {
                        echo "▶ Upgrading ${env.HELM_RELEASE} via Helm…"
                        sh """
                            helm repo add prometheus-community \\
                              https://prometheus-community.github.io/helm-charts \\
                              2>/dev/null || true
                            helm repo update

                            helm upgrade --install ${env.HELM_RELEASE} \\
                              prometheus-community/kube-prometheus-stack \\
                              --namespace ${env.MONITORING_NS} \\
                              --create-namespace \\
                              -f k8s/monitoring/prometheus-stack-values.yaml \\
                              --wait \\
                              --timeout 8m \\
                              --atomic
                        """
                    }
                }
            }
        }

        // ─── 4. Rollout verification ──────────────────────────────────────────
        stage('Verify Deployment') {
            parallel {
                stage('App pods') {
                    steps {
                        container('kubectl') {
                            sh "kubectl rollout status deployment/service-router -n ${env.APP_NS} --timeout=3m"
                            sh "kubectl rollout status deployment/frontend        -n ${env.APP_NS} --timeout=3m"
                            sh "kubectl rollout status deployment/backend         -n ${env.APP_NS} --timeout=3m"
                            sh "kubectl rollout status deployment/auth            -n ${env.APP_NS} --timeout=3m"
                            sh "kubectl get pods -n ${env.APP_NS} -o wide"
                        }
                    }
                }
                stage('Monitoring pods') {
                    steps {
                        container('kubectl') {
                            sh "kubectl rollout status deployment/${env.HELM_RELEASE}-grafana -n ${env.MONITORING_NS} --timeout=4m"
                            sh "kubectl rollout status statefulset/prometheus-${env.HELM_RELEASE}-prometheus -n ${env.MONITORING_NS} --timeout=4m"
                            sh "kubectl get pods          -n ${env.MONITORING_NS} -o wide"
                            sh "kubectl get servicemonitor -n ${env.MONITORING_NS}"
                        }
                    }
                }
            }
        }

        // ─── 5. Health probe ──────────────────────────────────────────────────
        // Uses env.APP_NS via Groovy GString inside double-quoted sh strings.
        stage('Health Check') {
            steps {
                container('kubectl') {
                    script {
                        def pod = sh(
                            script: "kubectl get pod -n ${env.APP_NS} -l app=service-router -o jsonpath='{.items[0].metadata.name}'",
                            returnStdout: true
                        ).trim()
                        echo "▶ Health-checking pod: ${pod}"
                        def status = sh(
                            script: "kubectl exec -n ${env.APP_NS} ${pod} -- wget -qO- http://localhost:5003/api/health",
                            returnStdout: true
                        ).trim()
                        if (!status.contains('"status":"ok"')) {
                            error "API Gateway health check FAILED. Response: ${status}"
                        }
                        echo "✔  API Gateway /api/health → OK"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline complete — app (${env.APP_NS}) + monitoring (${env.MONITORING_NS}) are live."
        }
        failure {
            echo "Pipeline failed. Debug with: kubectl get events -n ${env.APP_NS} --sort-by=.lastTimestamp"
        }
    }
}
