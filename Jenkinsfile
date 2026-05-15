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

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        KUBECONFIG = '/kube/k3s.yaml'
    }

    stages {
        stage('Wait for GitHub Actions') {
            steps {
                container('kubectl') {
                    script {
                        def remoteUrl = (env.GIT_URL ?: sh(script: 'git config --get remote.origin.url', returnStdout: true).trim()).trim()
                        def repoSlug = remoteUrl
                                .replaceFirst(/^git@github\.com:/, '')
                                .replaceFirst(/^https?:\/\/github\.com\//, '')
                                .replaceFirst(/\.git$/, '')

                        if (!repoSlug.contains('/')) {
                            error "Unable to determine GitHub repository slug from remote URL: ${remoteUrl}"
                        }

                        def commitSha = (env.GIT_COMMIT ?: sh(script: 'git rev-parse HEAD', returnStdout: true).trim()).trim()
                        def apiToken = (env.GITHUB_TOKEN ?: env.GITHUB_API_TOKEN ?: '').trim()
                        def pollSeconds = (env.GITHUB_ACTIONS_POLL_SECONDS ?: '30') as Integer
                        def discoveryTimeoutSeconds = (env.GITHUB_ACTIONS_DISCOVERY_TIMEOUT_SECONDS ?: '120') as Integer
                        def maxWaitSeconds = (env.GITHUB_ACTIONS_MAX_WAIT_SECONDS ?: '7200') as Integer
                        def startedAt = System.currentTimeMillis()
                        def sawAnyRuns = false

                        while (true) {
                            def apiUrl = "https://api.github.com/repos/${repoSlug}/actions/runs?head_sha=${java.net.URLEncoder.encode(commitSha, 'UTF-8')}&per_page=100"
                            def connection = new URL(apiUrl).openConnection()
                            connection.requestMethod = 'GET'
                            connection.connectTimeout = 10000
                            connection.readTimeout = 10000
                            connection.setRequestProperty('Accept', 'application/vnd.github+json')
                            connection.setRequestProperty('X-GitHub-Api-Version', '2022-11-28')
                            if (apiToken) {
                                connection.setRequestProperty('Authorization', "Bearer ${apiToken}")
                            }

                            def responseCode = connection.responseCode
                            def responseText = ''
                            def responseStream = responseCode >= 200 && responseCode < 300 ? connection.inputStream : connection.errorStream
                            if (responseStream != null) {
                                responseText = responseStream.getText('UTF-8')
                            }

                            if (responseCode < 200 || responseCode >= 300) {
                                error "GitHub Actions API request failed for ${repoSlug}@${commitSha} (${responseCode}): ${responseText}"
                            }

                            def payload = new groovy.json.JsonSlurperClassic().parseText(responseText)
                            def workflowRuns = payload?.workflow_runs ?: []
                            if (workflowRuns) {
                                sawAnyRuns = true
                            }

                            def activeRuns = workflowRuns.findAll { run -> run.status != 'completed' }

                            if (activeRuns) {
                                echo "GitHub Actions still running for ${commitSha}: ${activeRuns.collect { run -> "${run.name ?: run.workflow_id} (${run.status})" }.join(', ')}"
                            } else if (sawAnyRuns || (System.currentTimeMillis() - startedAt) >= (discoveryTimeoutSeconds * 1000L)) {
                                echo "GitHub Actions are finished, skipped, or absent for ${commitSha}; continuing Jenkins."
                                break
                            } else {
                                echo "No GitHub Actions runs registered yet for ${commitSha}; waiting for conditional workflows to appear."
                            }

                            if ((System.currentTimeMillis() - startedAt) >= (maxWaitSeconds * 1000L)) {
                                error "Timed out waiting for GitHub Actions to finish for ${commitSha}"
                            }

                            sleep time: pollSeconds, unit: 'SECONDS'
                        }
                    }
                }
            }
        }

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
