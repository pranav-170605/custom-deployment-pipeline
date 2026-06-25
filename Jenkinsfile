pipeline {
    agent any

    parameters {
        choice(
            name: 'EXECUTION_STEP', 
            choices: [
                '1. Run All Stages (Complete Deployment)', 
                '2. Pull Base Branches Only', 
                '3. Reset Network Environment Only', 
                '4. Build & Run Database Only', 
                '5. Build & Run Backend Only', 
                '6. Build & Run Frontend Only'
            ], 
            description: 'Select targeted container deployment phase.'
        )
    }

    environment {
        DOCKER_BIN   = '/usr/bin/docker'
        LOCAL_WS     = '/mnt/c/Users/Infokalash/custom-deployment-pipeline'
    }

    stages {
        stage('Step 1: Pull Corporate Base Branches') {
            when {
                expression { params.EXECUTION_STEP == '1. Run All Stages (Complete Deployment)' || params.EXECUTION_STEP == '2. Pull Base Branches Only' }
            }
            steps {
                echo "Securely downloading corporate source baselines..."
                
                // 🔒 Dynamic .netrc file injection prevents URL parsing errors entirely
                withCredentials([string(credentialsId: 'gitlab-repo-access', variable: 'GITLAB_TOKEN')]) {
                    sh '''
                        echo "machine repo.corp.infokalash.com login pranav-170605 password ${GITLAB_TOKEN}" > ~/.netrc
                        chmod 600 ~/.netrc
                    '''
                }
                
                // 1. Pull experimental Backend branch
                dir('backend') { 
                    deleteDir()
                    sh 'git clone -b feature/eda-api-dockerization https://repo.corp.infokalash.com/ik-products/eda/backend.git .' 
                    sh "cp ${env.LOCAL_WS}/backend/Dockerfile ."
                }
                
                // 2. Pull experimental Frontend branch
                dir('frontend') { 
                    deleteDir()
                    sh 'git clone -b feature/eda-ui-optimization https://repo.corp.infokalash.com/ik-products/eda/frontend.git .' 
                    sh "cp ${env.LOCAL_WS}/frontend/Dockerfile ."
                }
                
                // 🧼 Clear the temporary credentials file immediately after cloning is finished
                sh 'rm -f ~/.netrc'
            }
        }

        stage('Step 2: Clean Environment') {
            when {
                expression { params.EXECUTION_STEP == '1. Run All Stages (Complete Deployment)' || params.EXECUTION_STEP == '3. Reset Network Environment Only' }
            }
            steps {
                echo 'Cleaning up existing container instances and resetting bridge networks...'
                sh "${DOCKER_BIN} rm -f app-frontend app-backend app-database || true"
                sh "${DOCKER_BIN} network rm app-network || true"
                sh "${DOCKER_BIN} network create app-network"
            }
        }

        stage('Step 3: Build & Run Database') {
            when {
                expression { params.EXECUTION_STEP == '1. Run All Stages (Complete Deployment)' || params.EXECUTION_STEP == '4. Build & Run Database Only' }
            }
            steps {
                echo 'Building and launching Database using your local configuration...'
                sh "${DOCKER_BIN} build -t custom-database:latest ${env.LOCAL_WS}/database"
                sh "${DOCKER_BIN} run -d --name app-database --network app-network -v eda_mongodb_data:/data/db -p 27017:27017 custom-database:latest"
                sh 'sleep 4'
            }
        }

        stage('Step 4: Build & Run Backend') {
            when {
                expression { params.EXECUTION_STEP == '1. Run All Stages (Complete Deployment)' || params.EXECUTION_STEP == '5. Build & Run Backend Only' }
            }
            steps {
                echo 'Applying runtime CORS patches and building Python FastAPI Backend container...'
                sh """
                    find backend/ -name "main.py" -exec sed -i '1s/^/from fastapi.middleware.cors import CORSMiddleware\\n/' {} + || true
                    find backend/ -name "main.py" -exec sed -i '/app = FastAPI()/a app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])' {} + || true

                    find backend/ -name "mongodb.py" -exec sed -i 's|localhost:27017|app-database:27017|g' {} + || true
                    find backend/ -name "mongodb.py" -exec sed -i 's|127.0.0.1:27017|app-database:27017|g' {} + || true
                    find backend/ -name "mongodb.py" -exec sed -i 's|localhost|app-database|g' {} + || true
                """
                sh "${DOCKER_BIN} build -t custom-backend:latest ./backend"
                sh "${DOCKER_BIN} run -d --name app-backend --network app-network -e MONGO_URL=mongodb://app-database:27017/ -e MONGODB_URL=mongodb://app-database:27017/ -p 8000:8000 custom-backend:latest"
            }
        }

        stage('Step 5: Build & Run Frontend') {
            when {
                expression { params.EXECUTION_STEP == '1. Run All Stages (Complete Deployment)' || params.EXECUTION_STEP == '6. Build & Run Frontend Only' }
            }
            steps {
                echo 'Aligning client endpoints and building Next.js Frontend container...'
                sh """
                    rm -rf frontend/.next frontend/node_modules/.cache || true

                    find frontend/src/ -name "axios.tsx" -exec sed -i 's|baseURL: "http://192.168.4.201:31211"|baseURL: "http://192.168.49.2:30080"|g' {} + || true
                    find frontend/src/ -name "axios.ts" -exec sed -i 's|baseURL: "http://192.168.4.201:31211"|baseURL: "http://192.168.49.2:30080"|g' {} + || true

                    find frontend/src/ -type f -exec sed -i 's|"/register"|"/users/register"|g' {} + || true
                    find frontend/src/ -type f -exec sed -i "s|'/register'|'/users/register'|g" {} + || true
                    find frontend/src/ -type f -exec sed -i 's|"/login"|"/users/login"|g' {} + || true
                    find frontend/src/ -type f -exec sed -i "s|'/login'|'/users/login'|g" {} + || true
                """
                sh "${DOCKER_BIN} build -t custom-frontend:latest ./frontend"
                sh "${DOCKER_BIN} run -d --name app-frontend --network app-network -p 3000:3000 custom-frontend:latest"
            }
        }

        stage('Step 6: Live Status Check') {
            steps {
                sh "${DOCKER_BIN} ps"
            }
        }
    }
}
