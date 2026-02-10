# Minikube Setup Guide

**Purpose**: Set up local Kubernetes development environment for Todo AI Chatbot deployment
**Target Audience**: Developers deploying to local Minikube cluster
**Estimated Time**: 15-20 minutes

## Overview

This guide walks you through setting up Minikube, a local Kubernetes cluster that runs on your development machine. Minikube allows you to test Kubernetes deployments locally before deploying to production environments.

## System Requirements

### Minimum Requirements
- **RAM**: 8GB minimum (16GB recommended)
- **CPU**: 4 cores minimum
- **Disk**: 20GB free space
- **OS**: Linux, macOS, or Windows with WSL2

### Recommended Configuration
- **RAM**: 16GB or more
- **CPU**: 6+ cores
- **Disk**: 40GB+ free space
- **Virtualization**: Enabled in BIOS/UEFI

## Prerequisites

Before installing Minikube, ensure you have:

1. **Docker** installed and running
2. **kubectl** (Kubernetes CLI) installed
3. **Helm** (Kubernetes package manager) installed
4. **Virtualization** enabled on your machine

## Tool Installation

### 1. Docker Installation

Docker is required as the container runtime for Minikube.

#### Linux
```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (avoid using sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

#### macOS
```bash
# Using Homebrew
brew install --cask docker

# Or download Docker Desktop from:
# https://docs.docker.com/desktop/install/mac-install/

# Verify installation
docker --version
```

#### Windows
```powershell
# Using Chocolatey (PowerShell as Administrator)
choco install docker-desktop

# Or download Docker Desktop from:
# https://docs.docker.com/desktop/install/windows-install/

# Verify installation
docker --version
```

**Post-Installation:**
- Start Docker Desktop (macOS/Windows)
- Verify Docker is running: `docker ps`
- Expected: Empty list or running containers (no errors)

### 2. kubectl Installation

kubectl is the Kubernetes command-line tool for interacting with clusters.

#### Linux
```bash
# Download latest stable version
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Install kubectl
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

#### macOS
```bash
# Using Homebrew
brew install kubectl

# Verify installation
kubectl version --client
```

#### Windows
```powershell
# Using Chocolatey (PowerShell as Administrator)
choco install kubernetes-cli

# Verify installation
kubectl version --client
```

**Expected Output:**
```
Client Version: v1.28.0 or higher
```

### 3. Helm Installation

Helm is a package manager for Kubernetes that simplifies application deployment.

#### Linux/macOS
```bash
# Download and install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installation
helm version
```

#### Windows
```powershell
# Using Chocolatey (PowerShell as Administrator)
choco install kubernetes-helm

# Verify installation
helm version
```

**Expected Output:**
```
version.BuildInfo{Version:"v3.12.0" or higher}
```

### 4. Minikube Installation

Minikube creates a local Kubernetes cluster on your machine.

#### Linux
```bash
# Download Minikube binary
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install Minikube
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Clean up
rm minikube-linux-amd64

# Verify installation
minikube version
```

#### macOS
```bash
# Using Homebrew
brew install minikube

# Verify installation
minikube version
```

#### Windows
```powershell
# Using Chocolatey (PowerShell as Administrator)
choco install minikube

# Verify installation
minikube version
```

**Expected Output:**
```
minikube version: v1.32.0 or higher
```

## Minikube Configuration

### Start Minikube Cluster

Start Minikube with appropriate resources for the Todo AI Chatbot application:

```bash
# Start Minikube with 4 CPUs and 8GB RAM
minikube start --cpus=4 --memory=8192 --driver=docker

# This will:
# - Download Kubernetes components (first time only)
# - Create a Docker container running Kubernetes
# - Configure kubectl to use the Minikube cluster
# - Take 2-5 minutes on first run
```

**Expected Output:**
```
😄  minikube v1.32.0 on Ubuntu 22.04
✨  Using the docker driver based on user configuration
👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=4, Memory=8192MB) ...
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
🔗  Configuring bridge CNI (Container Networking Interface) ...
🔎  Verifying Kubernetes components...
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" cluster
```

### Verify Minikube Status

```bash
# Check Minikube status
minikube status

# Expected output:
# minikube
# type: Control Plane
# host: Running
# kubelet: Running
# apiserver: Running
# kubeconfig: Configured
```

### Enable Useful Addons

Minikube provides addons for additional functionality:

```bash
# Enable metrics-server for resource monitoring
minikube addons enable metrics-server

# Enable ingress (optional, for future enhancements)
minikube addons enable ingress

# Verify enabled addons
minikube addons list | grep enabled
```

**Recommended Addons:**
- `metrics-server`: Monitor pod CPU and memory usage
- `ingress`: HTTP/HTTPS routing (optional for Phase IV)
- `dashboard`: Kubernetes web UI (optional)

### Configure Docker Environment

Configure your shell to use Minikube's Docker daemon (avoids pushing images to registry):

```bash
# Set Docker environment variables
eval $(minikube docker-env)

# Verify you're using Minikube's Docker
docker ps | grep kube

# Expected: You should see Kubernetes system containers
```

**Important:** Run `eval $(minikube docker-env)` in every new terminal session where you build images.

## Verification

After installation, verify all tools are working correctly:

```bash
# Run the verification script
./scripts/verify-environment.sh

# Or manually verify each tool:
docker --version          # Should show Docker 24.0.0+
minikube version          # Should show v1.32.0+
kubectl version --client  # Should show v1.28.0+
helm version              # Should show v3.12.0+
minikube status           # Should show all components Running
```

## Common Issues and Solutions

### Issue: Minikube fails to start

**Symptoms:**
```
❌  Exiting due to PROVIDER_DOCKER_NOT_RUNNING
```

**Solution:**
```bash
# Ensure Docker is running
docker ps

# If Docker is not running, start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux):
sudo systemctl start docker
```

### Issue: Insufficient resources

**Symptoms:**
```
❌  Requested memory allocation (8192MB) is more than available
```

**Solution:**
```bash
# Check available resources
docker info | grep Memory

# Start with lower resources if needed
minikube start --cpus=2 --memory=4096 --driver=docker

# Note: Application may not run optimally with reduced resources
```

### Issue: kubectl not configured

**Symptoms:**
```
The connection to the server localhost:8080 was refused
```

**Solution:**
```bash
# Reconfigure kubectl to use Minikube
minikube update-context

# Verify configuration
kubectl config current-context
# Expected: minikube
```

### Issue: Docker environment not set

**Symptoms:**
```
Error: image not found when deploying
```

**Solution:**
```bash
# Set Docker environment in current terminal
eval $(minikube docker-env)

# Rebuild images
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .
```

## Useful Minikube Commands

```bash
# Start Minikube
minikube start

# Stop Minikube (preserves cluster state)
minikube stop

# Delete Minikube cluster (removes everything)
minikube delete

# Access Minikube dashboard
minikube dashboard

# Get Minikube IP address
minikube ip

# SSH into Minikube node
minikube ssh

# View Minikube logs
minikube logs

# Check resource usage
kubectl top nodes
kubectl top pods -A
```

## Next Steps

After completing this setup:

1. ✅ All required tools installed
2. ✅ Minikube cluster running
3. ✅ kubectl configured to use Minikube
4. ✅ Docker environment configured

**You're ready to deploy the Todo AI Chatbot application!**

Proceed to the main deployment guide: `helm/README.md`

## Additional Resources

- **Minikube Documentation**: https://minikube.sigs.k8s.io/docs/
- **kubectl Cheat Sheet**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- **Helm Documentation**: https://helm.sh/docs/
- **Docker Documentation**: https://docs.docker.com/

---

**Last Updated**: 2026-02-09
**Tested On**: Ubuntu 22.04, macOS 14, Windows 11 with WSL2
