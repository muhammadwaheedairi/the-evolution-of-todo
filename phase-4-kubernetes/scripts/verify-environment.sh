#!/bin/bash

# Environment Verification Script for Todo AI Chatbot Kubernetes Deployment
# Purpose: Verify all required tools are installed and properly configured
# Usage: ./scripts/verify-environment.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo "=========================================="
echo "Todo AI Chatbot - Environment Verification"
echo "=========================================="
echo ""

# Function to check command existence
check_command() {
    local cmd=$1
    local name=$2
    local min_version=$3

    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -n 1)
        echo -e "${GREEN}✓${NC} $name is installed: $version"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $name is NOT installed"
        echo "   Install: See docs/deployment/minikube-setup.md"
        ((FAILED++))
        return 1
    fi
}

# Function to check Docker
check_docker() {
    echo "Checking Docker..."
    if command -v docker &> /dev/null; then
        local version=$(docker --version)
        echo -e "${GREEN}✓${NC} Docker is installed: $version"

        # Check if Docker daemon is running
        if docker ps &> /dev/null; then
            echo -e "${GREEN}✓${NC} Docker daemon is running"
            ((PASSED+=2))
        else
            echo -e "${RED}✗${NC} Docker daemon is NOT running"
            echo "   Start Docker Desktop or run: sudo systemctl start docker"
            ((FAILED++))
        fi
    else
        echo -e "${RED}✗${NC} Docker is NOT installed"
        echo "   Install: See docs/deployment/minikube-setup.md"
        ((FAILED++))
    fi
    echo ""
}

# Function to check Minikube
check_minikube() {
    echo "Checking Minikube..."
    if command -v minikube &> /dev/null; then
        local version=$(minikube version --short)
        echo -e "${GREEN}✓${NC} Minikube is installed: $version"
        ((PASSED++))

        # Check if Minikube is running
        if minikube status &> /dev/null; then
            local status=$(minikube status -o json 2>/dev/null | grep -o '"Host":"[^"]*"' | cut -d'"' -f4)
            if [ "$status" = "Running" ]; then
                echo -e "${GREEN}✓${NC} Minikube cluster is running"

                # Get cluster info
                local ip=$(minikube ip 2>/dev/null)
                echo "   Cluster IP: $ip"

                # Check resources
                local cpus=$(minikube profile list -o json 2>/dev/null | grep -o '"CPUs":[0-9]*' | cut -d':' -f2 | head -1)
                local memory=$(minikube profile list -o json 2>/dev/null | grep -o '"Memory":[0-9]*' | cut -d':' -f2 | head -1)

                if [ -n "$cpus" ] && [ -n "$memory" ]; then
                    echo "   Resources: ${cpus} CPUs, ${memory}MB RAM"

                    # Warn if resources are below recommended
                    if [ "$cpus" -lt 4 ]; then
                        echo -e "${YELLOW}⚠${NC}  Warning: Less than 4 CPUs allocated (recommended: 4+)"
                        ((WARNINGS++))
                    fi

                    if [ "$memory" -lt 8192 ]; then
                        echo -e "${YELLOW}⚠${NC}  Warning: Less than 8GB RAM allocated (recommended: 8GB+)"
                        ((WARNINGS++))
                    fi
                fi

                ((PASSED++))
            else
                echo -e "${YELLOW}⚠${NC}  Minikube cluster is not running"
                echo "   Start: minikube start --cpus=4 --memory=8192 --driver=docker"
                ((WARNINGS++))
            fi
        else
            echo -e "${YELLOW}⚠${NC}  Minikube cluster is not running"
            echo "   Start: minikube start --cpus=4 --memory=8192 --driver=docker"
            ((WARNINGS++))
        fi
    else
        echo -e "${RED}✗${NC} Minikube is NOT installed"
        echo "   Install: See docs/deployment/minikube-setup.md"
        ((FAILED++))
    fi
    echo ""
}

# Function to check kubectl
check_kubectl() {
    echo "Checking kubectl..."
    if command -v kubectl &> /dev/null; then
        local version=$(kubectl version --client --short 2>/dev/null || kubectl version --client 2>&1 | head -n 1)
        echo -e "${GREEN}✓${NC} kubectl is installed: $version"
        ((PASSED++))

        # Check if kubectl can connect to cluster
        if kubectl cluster-info &> /dev/null; then
            echo -e "${GREEN}✓${NC} kubectl can connect to cluster"
            local context=$(kubectl config current-context 2>/dev/null)
            echo "   Current context: $context"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠${NC}  kubectl cannot connect to cluster"
            echo "   Ensure Minikube is running: minikube start"
            ((WARNINGS++))
        fi
    else
        echo -e "${RED}✗${NC} kubectl is NOT installed"
        echo "   Install: See docs/deployment/minikube-setup.md"
        ((FAILED++))
    fi
    echo ""
}

# Function to check Helm
check_helm() {
    echo "Checking Helm..."
    if command -v helm &> /dev/null; then
        local version=$(helm version --short)
        echo -e "${GREEN}✓${NC} Helm is installed: $version"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Helm is NOT installed"
        echo "   Install: See docs/deployment/minikube-setup.md"
        ((FAILED++))
    fi
    echo ""
}

# Function to check system resources
check_system_resources() {
    echo "Checking System Resources..."

    # Check available memory (Linux/macOS)
    if command -v free &> /dev/null; then
        local total_mem=$(free -g | awk '/^Mem:/{print $2}')
        echo "   Total RAM: ${total_mem}GB"

        if [ "$total_mem" -lt 8 ]; then
            echo -e "${YELLOW}⚠${NC}  Warning: Less than 8GB RAM available (recommended: 8GB+)"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓${NC} Sufficient RAM available"
            ((PASSED++))
        fi
    elif command -v sysctl &> /dev/null; then
        # macOS
        local total_mem=$(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024))
        echo "   Total RAM: ${total_mem}GB"

        if [ "$total_mem" -lt 8 ]; then
            echo -e "${YELLOW}⚠${NC}  Warning: Less than 8GB RAM available (recommended: 8GB+)"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓${NC} Sufficient RAM available"
            ((PASSED++))
        fi
    fi

    # Check available disk space
    local available_disk=$(df -h . | awk 'NR==2 {print $4}')
    echo "   Available disk space: $available_disk"

    echo ""
}

# Function to check Docker environment
check_docker_env() {
    echo "Checking Docker Environment..."

    if [ -n "$DOCKER_HOST" ]; then
        echo -e "${GREEN}✓${NC} Docker environment is configured"
        echo "   DOCKER_HOST: $DOCKER_HOST"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC}  Docker environment not set for Minikube"
        echo "   Run: eval \$(minikube docker-env)"
        echo "   Note: Required for building images locally"
        ((WARNINGS++))
    fi
    echo ""
}

# Run all checks
check_docker
check_minikube
check_kubectl
check_helm
check_system_resources
check_docker_env

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ All checks passed! Environment is ready for deployment.${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Build Docker images: cd frontend && docker build -t todo-frontend:latest ."
        echo "2. Deploy with Helm: helm install todo-app ./helm --namespace=todo-app"
        echo "3. See helm/README.md for detailed deployment instructions"
        exit 0
    else
        echo -e "${YELLOW}⚠ Environment is mostly ready, but there are warnings.${NC}"
        echo "Review warnings above and address if needed."
        exit 0
    fi
else
    echo -e "${RED}✗ Environment verification failed.${NC}"
    echo "Please install missing tools and re-run this script."
    echo "See docs/deployment/minikube-setup.md for installation instructions."
    exit 1
fi
