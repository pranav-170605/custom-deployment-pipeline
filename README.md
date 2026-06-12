# custom-deployment-pipeline

![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=flat&logo=jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Bash](https://img.shields.io/badge/Bash-4EAA25?style=flat&logo=gnubash&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

> A fully automated CI/CD pipeline that containerizes and deploys a multi-tier full-stack application — FastAPI backend, Next.js frontend, and MongoDB database — on an isolated Docker bridge network, triggered by a single Jenkins build.

---

## Overview

This project implements a **Pipeline-as-Code** deployment engine for a multi-tier full-stack application. Rather than manually configuring services, updating IP addresses in source code, and spinning up containers by hand, the entire environment lifecycle is automated through a Jenkinsfile.

A single pipeline run:
- pulls the latest source from remote repositories
- tears down stale containers and networks
- patches runtime environment configuration
- builds fresh Docker images
- and deploys all three services into a clean, isolated network topology

The result is a reproducible, hands-off deployment that works identically on every run.

---

## Architecture

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

All three services run inside a dedicated `app-network` Docker bridge. Containers resolve each other by service name rather than IP address, making the topology stable across restarts. MongoDB state is persisted via a named Docker volume, surviving full pipeline rebuilds.

---

## Pipeline Stages

```
Clone  →  Clean  →  Patch Endpoints  →  Inject CORS  →  Build  →  Deploy
```

| Stage | Description |
|---|---|
| **Clone** | Fetches the latest codebase from remote using `.netrc` credential caching to prevent authentication parsing issues |
| **Clean Environment** | Stops and removes stale containers, prunes the `app-network` bridge, and provisions a fresh isolated network |
| **Patch Endpoints** | `sed` stream-edits API base URLs in the frontend at runtime, transitioning from staging IPs to local container hostnames |
| **Inject CORS** | Automatically inserts FastAPI CORS middleware configuration to allow cross-container requests from the frontend |
| **Build Images** | Builds Docker images for the backend and frontend from their respective `Dockerfile`s |
| **Deploy** | Launches all three containers on `app-network` with correct port bindings, environment variables, and volume mounts |

---

## Tech Stack

| Layer | Technology |
|---|---|
| CI/CD Automation | Jenkins (Pipeline-as-Code / Groovy) |
| Containerization | Docker, Docker Networks, Docker Volumes |
| Scripting | Bash, GNU `sed`, `find`, `chmod` |
| Backend | FastAPI (Python) |
| Frontend | Next.js (TypeScript / React) |
| Database | MongoDB |

---

## Repository Structure

```
custom-deployment-pipeline/
├── backend/          # FastAPI application source
├── frontend/         # Next.js application source
├── database/         # MongoDB init scripts and configuration
└── Jenkinsfile       # Pipeline-as-Code definition
```

---

## Key Design Decisions

**`.netrc` credential caching**
Credentials are stored in `.netrc` rather than passed as CLI arguments. This prevents secrets from appearing in Jenkins build logs and process lists, while keeping the pipeline script clean and portable.

**Runtime endpoint patching via `sed`**
The frontend source references staging API URLs. Rather than maintaining separate environment builds, the pipeline rewrites these endpoints at deploy time using `sed` regex patterns — decoupling the application source from infrastructure topology.

**Named Docker volume for MongoDB**
Persistent storage is attached at the volume level, not the container level. Application data survives `docker rm`, image rebuilds, and full pipeline re-runs without any manual backup step.

**Dedicated bridge network**
All containers share a single `app-network` bridge. Services communicate using Docker's internal DNS (e.g. `http://backend:8000`), eliminating hardcoded IPs and making the setup portable across different host machines.

---

## Roadmap

- [ ] Replace `sed` endpoint patching with Docker `--env` / `.env` file injection
- [ ] Add automated test stage (`pytest`) before image builds
- [ ] Implement container health checks and pipeline rollback on failure
- [ ] Push built images to a container registry (GHCR or Docker Hub)
- [ ] Integrate Prometheus + Grafana for runtime observability

---

## Author

**Pranav** — Electronics & Telecommunications Engineering  
[GitHub Profile](https://github.com/pranav)
