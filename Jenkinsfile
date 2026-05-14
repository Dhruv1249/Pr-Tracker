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
    command:
    - sleep
    args:
    - "36000"
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

    environment {
        KUBECONFIG = '/kube/k3s.yaml'
    }

    stages {
        stage('Debug Kubeconfig') {
            steps {
                container('kubectl') {
                    sh 'ls -lah /kube'
                    sh 'cat /kube/k3s.yaml'
                    sh 'kubectl config view'
                    sh 'kubectl get nodes'
                }
            }
        }
        stage('Deploy to K3s') {
            steps {
                container('kubectl') {
                    script {
                        echo 'Applying Kubernetes manifests...'
                        // Deploying using manifests from SCM and local secrets
                        sh 'kubectl apply -f k8s/configmap-prod.yaml'
                        sh 'kubectl apply -f /mnt/k8s/secrets-prod.yaml'
                        sh 'kubectl apply -f k8s/auth.yaml'
                        sh 'kubectl apply -f k8s/backend.yaml'
                        sh 'kubectl apply -f k8s/ai-agent.yaml'
                        sh 'kubectl apply -f k8s/mongodb.yaml'
                        sh 'kubectl apply -f k8s/service-router.yaml'
                        sh 'kubectl apply -f k8s/frontend.yaml'
                        sh 'kubectl apply -f k8s/ingress.yaml'
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                container('kubectl') {
                    sh 'kubectl get pods -n jenkins'
                }
            }
        }
    }
}
