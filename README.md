# custom-deployment-pipeline

![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=flat&logo=jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Bash](https://img.shields.io/badge/Bash-4EAA25?style=flat&logo=gnubash&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

> A fully automated CI/CD pipeline that containerizes and deploys a multi-tier web application — with both Docker Compose–style local orchestration via Jenkins and production-grade Kubernetes manifests for Minikube.

---

## Overview

This project implements a **Pipeline-as-Code** deployment engine for a multi-tier web application comprising a Next.js frontend, FastAPI backend, and MongoDB database.

A single Jenkins pipeline run:

- Pulls the latest source from remote repositories using credential-safe `.netrc` caching
- Tears down stale containers and networks for a clean slate
- Patches runtime environment configuration via `sed`
- Builds fresh Docker images for all three services
- Deploys all services into a clean, isolated `app-network` bridge topology
- Verifies the deployment with a live container status check

For production-grade workloads, the project also ships complete **Kubernetes manifests** covering deployments, services, secrets, and health probes — ready to run on Minikube.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, Tailwind CSS |
| Backend | FastAPI (Python 3.10) |
| Database | MongoDB 6.0 |
| Containerization | Docker |
| CI/CD | Jenkins |
| Orchestration | Kubernetes (Minikube) |

---

## Project Structure

```
custom-deployment-pipeline/
├── Jenkinsfile                        # CI/CD pipeline definition
├── backend/
│   ├── Dockerfile                     # FastAPI container
│   └── requirements.txt               # Python dependencies
├── frontend/
│   └── Dockerfile                     # Next.js container
├── database/
│   └── Dockerfile                     # MongoDB container
└── k8s/
    ├── secret.yaml.example            # Secret template (copy and fill values)
    ├── deployment.yaml                # Backend deployment (2 replicas)
    ├── service.yaml                   # Backend NodePort service
    ├── frontend-deployment.yaml       # Frontend deployment
    ├── frontend-service.yaml          # Frontend NodePort service
    ├── mongo-deployment.yaml          # MongoDB deployment
    └── mongo-service.yaml             # MongoDB ClusterIP service
```

---

## Architecture

### Jenkins + Docker (Local)

```
┌──────────────────────────────────────────────────────────┐
│                    Docker Bridge Network                  │
│                       (app-network)                       │
│                                                           │
│   ┌─────────────┐    ┌──────────────┐   ┌─────────────┐  │
│   │   Next.js   │───▶│   FastAPI    │──▶│   MongoDB   │  │
│   │  Frontend   │    │   Backend    │   │  + Volume   │  │
│   │   :3000     │    │   :8000      │   │   :27017    │  │
│   └─────────────┘    └──────────────┘   └─────────────┘  │
└──────────────────────────────────────────────────────────┘
            ▲
            │  triggers
   ┌─────────────────┐
   │    Jenkins      │
   │    Pipeline     │
   │  (Jenkinsfile)  │
   └─────────────────┘
```

All three services run inside a dedicated `app-network` Docker bridge. Containers communicate using their service names as hostnames — no hardcoded IPs.

### Kubernetes (Minikube)

```
                        ┌─────────────────────┐
                        │      Minikube        │
                        │                      │
  Browser ──────────────▶  frontend-service    │
  (NodePort :30081)     │  (Next.js Pod)       │
                        │        │             │
  API Client ───────────▶  backend-service     │
  (NodePort :30080)     │  (FastAPI x2 Pods)   │
                        │        │             │
                        │  mongo-service        │
                        │  (ClusterIP only)    │
                        │  (MongoDB Pod)       │
                        └─────────────────────┘
```

---

## Jenkins CI/CD Pipeline

The `Jenkinsfile` defines a **parameterized pipeline** with 6 targeted deployment stages. Individual stages can be triggered independently for faster iteration during development.

```
Clone  →  Clean  →  Database  →  Backend  →  Frontend  →  Status Check
```

| Stage | Description |
|---|---|
| **Pull Corporate Base Branches** | Securely clones source from private GitLab using Jenkins credentials — token never hardcoded |
| **Clean Environment** | Removes existing containers and resets the Docker bridge network |
| **Build & Run Database** | Builds and launches the MongoDB container on `app-network` |
| **Build & Run Backend** | Patches CORS origins and MongoDB hostname via `sed`, then builds and runs FastAPI |
| **Build & Run Frontend** | Aligns API endpoint URLs, builds and runs the Next.js container |
| **Live Status Check** | Verifies all three containers are running via `docker ps` |

---

## Kubernetes Deployment

All three services are deployed on Kubernetes with proper separation of concerns. Manifests live under `k8s/`.

### Service Exposure Strategy

| Service | Type | Port | Reason |
|---|---|---|---|
| Backend | NodePort | 30080 | External access for API calls |
| Frontend | NodePort | 30081 | External access for browser |
| MongoDB | ClusterIP | 27017 | Internal only — never exposed externally |

### Backend

- **2 replicas** for high availability
- MongoDB connection URL injected via Kubernetes Secret (never in plaintext)
- Liveness and readiness probes on `GET /`
- Resource limits: 256Mi–512Mi memory, 250m–500m CPU

### Frontend

- **1 replica** — Next.js dev mode does not support multiple instances
- Extended liveness probe delay (60s) to allow for Next.js compilation
- Resource limits: 512Mi–1024Mi memory, 250m–1000m CPU

### Database

- **1 replica** — single MongoDB instance
- ClusterIP service — internal cluster access only
- `emptyDir` volume for data persistence across pod restarts

---

## Running Locally

### Prerequisites

- Docker
- Minikube
- kubectl
- Jenkins (for CI/CD pipeline)

### Jenkins Pipeline

Configure a Jenkins job pointing to this repository's `Jenkinsfile`. Ensure your GitLab credentials are stored in Jenkins as a secret and referenced in the pipeline — no tokens in source.

### Kubernetes (Minikube)

```bash
# 1. Start Minikube
minikube start --driver=docker --force

# 2. Point Docker to Minikube's daemon
eval $(minikube docker-env)

# 3. Build all images inside Minikube's context
docker build -t custom-backend:latest ./backend
docker build -t custom-database:latest ./database
docker build -t custom-frontend:latest ./frontend

# 4. Create your secret from the example template
cp k8s/secret.yaml.example k8s/secret.yaml
# Edit k8s/secret.yaml and fill in your base64-encoded MongoDB URL

# 5. Deploy in dependency order
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# 6. Verify all pods are healthy
kubectl get pods
kubectl get services

# 7. Get access URLs
minikube service frontend-service --url
minikube service backend-service --url
```

---

## Key Design Decisions

**`.netrc` credential caching**
Credentials are stored in `.netrc` rather than passed as CLI arguments. This keeps secrets out of the process list and shell history, which is especially important in shared Jenkins environments.

**Runtime endpoint patching via `sed`**
The frontend source references staging API URLs. Rather than maintaining separate environment-specific branches, `sed` rewrites the relevant constants at build time — a lightweight alternative to a full environment variable system.

**Named Docker volume for MongoDB**
Persistent storage is attached at the volume level, not the container level. This means data survives `docker rm` and `docker rmi` cycles between pipeline runs without needing an external database.

**Dedicated bridge network**
All containers share a single `app-network` bridge. Services communicate using their container names as DNS hostnames, avoiding hardcoded IPs and making the topology portable across machines.

**Kubernetes Secrets for sensitive config**
The MongoDB connection URL is base64-encoded and injected into backend pods as an environment variable via a Kubernetes Secret — never committed to the manifest in plaintext.

**ClusterIP for MongoDB**
MongoDB is intentionally unreachable from outside the cluster. Only the backend pods can connect to it via the internal `mongo-service` ClusterIP, reducing the attack surface.

**`imagePullPolicy: IfNotPresent`**
Since images are built directly into Minikube's Docker daemon (not pushed to a registry), this policy ensures Kubernetes uses the locally built images instead of trying to pull from Docker Hub.

---

## Key DevOps Concepts Demonstrated

- Parameterized Jenkins pipeline with selective stage execution
- Docker multi-container networking via custom bridge network
- Kubernetes Secrets for sensitive configuration management
- Liveness vs Readiness probes with tuned delay values
- ClusterIP vs NodePort service types based on security requirements
- Resource requests and limits for container stability
- Volume mounts for MongoDB data persistence
- `imagePullPolicy: IfNotPresent` for local image usage without a registry
- Debugging `OOMKilled` and `CrashLoopBackOff` issues in production pods

---

## Roadmap

- [ ] Replace `sed` endpoint patching with Docker `--env` / `.env` file injection
- [ ] Add automated test stage (`pytest`) before image builds
- [ ] Implement container health checks and pipeline rollback on failure
- [ ] Push built images to a container registry (GHCR or Docker Hub)
- [ ] Integrate Prometheus + Grafana for runtime observability
- [ ] Add Horizontal Pod Autoscaler (HPA) for the backend deployment
- [ ] Migrate MongoDB from `emptyDir` to a PersistentVolumeClaim for durable storage

---

## Author

**Pranav**
[GitHub Profile](https://github.com/pranav)
