#!/bin/bash

# Image Build Script for Todo AI Chatbot
# Purpose: Build Docker images for frontend and backend in Minikube's Docker daemon
# Usage: ./scripts/build-images.sh [--frontend-only | --backend-only]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default: build both
BUILD_FRONTEND=true
BUILD_BACKEND=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend-only)
            BUILD_BACKEND=false
            shift
            ;;
        --backend-only)
            BUILD_FRONTEND=false
            shift
            ;;
        --help)
            echo "Usage: $0 [--frontend-only | --backend-only]"
            echo ""
            echo "Options:"
            echo "  --frontend-only    Build only frontend image"
            echo "  --backend-only     Build only backend image"
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
echo "Todo AI Chatbot - Image Build"
echo "=========================================="
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    echo "Start Docker Desktop or run: sudo systemctl start docker"
    exit 1
fi

# Check if Minikube is running
if ! command -v minikube &> /dev/null; then
    echo -e "${YELLOW}Warning: Minikube is not installed${NC}"
    echo "Images will be built in local Docker daemon (not Minikube)"
    echo ""
elif ! minikube status &> /dev/null; then
    echo -e "${YELLOW}Warning: Minikube is not running${NC}"
    echo "Images will be built in local Docker daemon (not Minikube)"
    echo "To use Minikube's Docker daemon:"
    echo "  1. Start Minikube: minikube start"
    echo "  2. Configure Docker: eval \$(minikube docker-env)"
    echo "  3. Run this script again"
    echo ""
else
    # Check if Docker environment is configured for Minikube
    if [ -z "$DOCKER_HOST" ]; then
        echo -e "${YELLOW}Warning: Docker environment not configured for Minikube${NC}"
        echo "Run: eval \$(minikube docker-env)"
        echo ""
        read -p "Configure now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            eval $(minikube docker-env)
            echo -e "${GREEN}✓ Docker environment configured${NC}"
            echo ""
        fi
    else
        echo -e "${GREEN}✓ Using Minikube's Docker daemon${NC}"
        echo ""
    fi
fi

# Get repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Build frontend image
if [ "$BUILD_FRONTEND" = true ]; then
    echo -e "${BLUE}Building frontend image...${NC}"
    echo "Location: $REPO_ROOT/frontend"
    echo ""

    cd "$REPO_ROOT/frontend"

    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        echo -e "${RED}Error: Dockerfile not found in frontend/${NC}"
        exit 1
    fi

    # Build image
    START_TIME=$(date +%s)
    docker build -t todo-frontend:latest .
    END_TIME=$(date +%s)
    BUILD_TIME=$((END_TIME - START_TIME))

    echo ""
    echo -e "${GREEN}✓ Frontend image built successfully${NC}"
    echo "Build time: ${BUILD_TIME}s"

    # Show image details
    IMAGE_SIZE=$(docker images todo-frontend:latest --format "{{.Size}}")
    echo "Image size: $IMAGE_SIZE"
    echo ""
fi

# Build backend image
if [ "$BUILD_BACKEND" = true ]; then
    echo -e "${BLUE}Building backend image...${NC}"
    echo "Location: $REPO_ROOT/backend"
    echo ""

    cd "$REPO_ROOT/backend"

    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        echo -e "${RED}Error: Dockerfile not found in backend/${NC}"
        exit 1
    fi

    # Build image
    START_TIME=$(date +%s)
    docker build -t todo-backend:latest .
    END_TIME=$(date +%s)
    BUILD_TIME=$((END_TIME - START_TIME))

    echo ""
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
    echo "Build time: ${BUILD_TIME}s"

    # Show image details
    IMAGE_SIZE=$(docker images todo-backend:latest --format "{{.Size}}")
    echo "Image size: $IMAGE_SIZE"
    echo ""
fi

# Summary
echo "=========================================="
echo "Build Summary"
echo "=========================================="
echo ""

if [ "$BUILD_FRONTEND" = true ]; then
    docker images todo-frontend:latest --format "Frontend: {{.Repository}}:{{.Tag}} ({{.Size}})"
fi

if [ "$BUILD_BACKEND" = true ]; then
    docker images todo-backend:latest --format "Backend:  {{.Repository}}:{{.Tag}} ({{.Size}})"
fi

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Create Kubernetes secrets: ./scripts/create-secrets.sh --namespace todo-app"
echo "2. Deploy application: ./scripts/deploy-local.sh"
echo "3. Access application: minikube service todo-app-frontend -n todo-app"
