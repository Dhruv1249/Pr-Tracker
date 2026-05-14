pipeline {
    agent any

    environment {
        KUBECONFIG = '/etc/rancher/k3s/k3s.yaml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Deploy to K3s') {
            steps {
                script {
                    echo 'Applying Kubernetes manifests...'
                    sh 'kubectl apply -f k8s/configmap-prod.yaml'
                    sh 'kubectl apply -f k8s/secrets-prod.yaml'
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

        stage('Verify Deployment') {
            steps {
                sh 'kubectl get pods -n default'
            }
        }
    }
}
