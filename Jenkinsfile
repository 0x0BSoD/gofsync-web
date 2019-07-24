pipeline {
  agent {
    kubernetes {
      label 'gofsync'
      defaultContainer 'jnlp'
      yaml """
apiVersion: v1
kind: Pod
metadata:
labels:
  component: ci
spec:
  # Use service account that can deploy to all namespaces
  serviceAccountName: cd-jenkins
  containers:
  - name: nodejs
    image: node:10
    command:
    - cat
    tty: true
  - name: docker
    image: docker:dind
    command:
    - cat
    tty: true
  - name: kubectl
    image: gcr.io/cloud-builders/kubectl
    command:
    - cat
    tty: true
"""
}
  }
  post {
     failure {
       updateGitlabCommitStatus name: 'build', state: 'failed'
     }
     success {
       updateGitlabCommitStatus name: 'build', state: 'success'
     }
   }
  stages {
    stage('Build') {
      steps {
        container('nodejs') {
          sh """
            ls -l
            npm install
            npm run build
          """
        }
      }
    }
    stage('Docker') {
      steps {
        container('docker') {
          sh """
            docker build -t 10.107.236.69:5000/gofsync_web:v1.4 .
            docker push localhost:8081/gofsync-api
          """
        }
      }
    }
  }
}
