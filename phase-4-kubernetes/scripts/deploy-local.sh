#!/bin/bash

# Deployment Helper Script for Todo AI Chatbot
# Purpose: Automated deployment to local Minikube cluster
# Usage: ./scripts/deploy-local.sh [--skip-build] [--skip-secrets]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
SKIP_BUILD=false
SKIP_SECRETS=false
NAMESPACE="todo-app"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-secrets)
            SKIP_SECRETS=true
            shift
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-build       Skip building Docker images"
            echo "  --skip-secrets     Skip creating Kubernetes secrets"
            echo "  --namespace NAME   Kubernetes namespace (default: todo-app)"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo "=========================================="
echo "Todo AI Chatbot - Local Deployment"
echo "=========================================="
echo ""
echo "Namespace: $NAMESPACE"
echo ""

# Get repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Step 1: Verify prerequisites
echo -e "${BLUE}Step 1: Verifying prerequisites...${NC}"
echo ""

# Check if required tools are installed
MISSING_TOOLS=()

if ! command -v docker &> /dev/null; then
    MISSING_TOOLS+=("docker")
fi

if ! command -v minikube &> /dev/null; then
    MISSING_TOOLS+=("minikube")
fi

if ! command -v kubectl &> /dev/null; then
    MISSING_TOOLS+=("kubectl")
fi

if ! command -v helm &> /dev/null; then
    MISSING_TOOLS+=("helm")
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo -e "${RED}Error: Missing required tools: ${MISSING_TOOLS[*]}${NC}"
    echo "Run: ./scripts/verify-environment.sh"
    exit 1
fi

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo -e "${YELLOW}Minikube is not running${NC}"
    read -p "Start Minikube now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting Minikube..."
        minikube start --cpus=4 --memory=8192 --driver=docker
        echo -e "${GREEN}✓ Minikube started${NC}"
    else
        echo -e "${RED}Aborted. Start Minikube manually: minikube start${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Prerequisites verified${NC}"
echo ""

# Step 2: Configure Docker environment
echo -e "${BLUE}Step 2: Configuring Docker environment...${NC}"
echo ""

eval $(minikube docker-env)
echo -e "${GREEN}✓ Docker environment configured for Minikube${NC}"
echo ""

# Step 3: Build images
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${BLUE}Step 3: Building Docker images...${NC}"
    echo ""

    "$REPO_ROOT/scripts/build-images.sh"

    echo -e "${GREEN}✓ Images built successfully${NC}"
    echo ""
else
    echo -e "${YELLOW}Step 3: Skipping image build (--skip-build)${NC}"
    echo ""

    # Verify images exist
    if ! docker images | grep -q "todo-frontend.*latest"; then
        echo -e "${RED}Error: Frontend image not found${NC}"
        echo "Run without --skip-build or build manually"
        exit 1
    fi

    if ! docker images | grep -q "todo-backend.*latest"; then
        echo -e "${RED}Error: Backend image not found${NC}"
        echo "Run without --skip-build or build manually"
        exit 1
    fi
fi

# Step 4: Create namespace
echo -e "${BLUE}Step 4: Creating namespace...${NC}"
echo ""

if kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${YELLOW}Namespace '$NAMESPACE' already exists${NC}"
else
    kubectl create namespace "$NAMESPACE"
    echo -e "${GREEN}✓ Namespace created${NC}"
fi
echo ""

# Step 5: Create secrets
if [ "$SKIP_SECRETS" = false ]; then
    echo -e "${BLUE}Step 5: Creating Kubernetes secrets...${NC}"
    echo ""

    if kubectl get secret todo-app-secrets -n "$NAMESPACE" &> /dev/null; then
        echo -e "${YELLOW}Secrets already exist${NC}"
        read -p "Recreate secrets? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            "$REPO_ROOT/scripts/create-secrets.sh" --namespace "$NAMESPACE"
        else
            echo "Using existing secrets"
        fi
    else
        "$REPO_ROOT/scripts/create-secrets.sh" --namespace "$NAMESPACE"
    fi

    echo -e "${GREEN}✓ Secrets configured${NC}"
    echo ""
else
    echo -e "${YELLOW}Step 5: Skipping secret creation (--skip-secrets)${NC}"
    echo ""

    # Verify secrets exist
    if ! kubectl get secret todo-app-secrets -n "$NAMESPACE" &> /dev/null; then
        echo -e "${RED}Error: Secrets not found${NC}"
        echo "Run without --skip-secrets or create manually"
        exit 1
    fi
fi

# Step 6: Lint Helm chart
echo -e "${BLUE}Step 6: Validating Helm chart...${NC}"
echo ""

cd "$REPO_ROOT/helm"
helm lint .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Helm chart validation passed${NC}"
else
    echo -e "${RED}Error: Helm chart validation failed${NC}"
    exit 1
fi
echo ""

# Step 7: Deploy with Helm
echo -e "${BLUE}Step 7: Deploying application...${NC}"
echo ""

cd "$REPO_ROOT"

# Check if release already exists
if helm list -n "$NAMESPACE" | grep -q "todo-app"; then
    echo -e "${YELLOW}Release 'todo-app' already exists${NC}"
    read -p "Upgrade existing release? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        helm upgrade todo-app ./helm \
          --namespace="$NAMESPACE" \
          --values=helm/values-dev.yaml
        echo -e "${GREEN}✓ Application upgraded${NC}"
    else
        echo "Skipping deployment"
    fi
else
    helm install todo-app ./helm \
      --namespace="$NAMESPACE" \
      --values=helm/values-dev.yaml
    echo -e "${GREEN}✓ Application deployed${NC}"
fi
echo ""

# Step 8: Wait for pods to be ready
echo -e "${BLUE}Step 8: Waiting for pods to be ready...${NC}"
echo ""

echo "Waiting for pods to start (this may take 30-60 seconds)..."
kubectl wait --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=todo-app \
  --namespace="$NAMESPACE" \
  --timeout=120s

echo -e "${GREEN}✓ All pods are ready${NC}"
echo ""

# Step 9: Display deployment status
echo "=========================================="
echo "Deployment Status"
echo "=========================================="
echo ""

echo "Pods:"
kubectl get pods -n "$NAMESPACE"
echo ""

echo "Services:"
kubectl get services -n "$NAMESPACE"
echo ""

# Step 10: Get access URL
echo "=========================================="
echo "Access Information"
echo "=========================================="
echo ""

MINIKUBE_IP=$(minikube ip)
NODE_PORT=$(kubectl get service todo-app-frontend -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].nodePort}')

echo -e "${GREEN}Application URL: http://$MINIKUBE_IP:$NODE_PORT${NC}"
echo ""
echo "Or use: minikube service todo-app-frontend -n $NAMESPACE"
echo ""

# Offer to open in browser
read -p "Open application in browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    minikube service todo-app-frontend -n "$NAMESPACE"
fi

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:     kubectl logs -n $NAMESPACE deployment/todo-app-backend -f"
echo "  Check status:  kubectl get pods -n $NAMESPACE"
echo "  Restart:       kubectl rollout restart deployment -n $NAMESPACE"
echo "  Uninstall:     helm uninstall todo-app -n $NAMESPACE"
