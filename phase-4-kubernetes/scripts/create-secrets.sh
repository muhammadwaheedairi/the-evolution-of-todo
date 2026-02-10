#!/bin/bash

# Secret Creation Script for Todo AI Chatbot
# Purpose: Securely create Kubernetes Secrets for the application
# Usage: ./scripts/create-secrets.sh [--namespace todo-app]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
NAMESPACE="todo-app"
SECRET_NAME="todo-app-secrets"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--namespace NAMESPACE]"
            echo ""
            echo "Options:"
            echo "  --namespace    Kubernetes namespace (default: todo-app)"
            echo "  --help         Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo "=========================================="
echo "Todo AI Chatbot - Secret Creation"
echo "=========================================="
echo ""
echo "Namespace: $NAMESPACE"
echo "Secret Name: $SECRET_NAME"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    echo "Install kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${YELLOW}Namespace '$NAMESPACE' does not exist.${NC}"
    read -p "Create namespace? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl create namespace "$NAMESPACE"
        echo -e "${GREEN}✓ Namespace created${NC}"
    else
        echo -e "${RED}Aborted. Please create namespace first.${NC}"
        exit 1
    fi
fi

# Check if secret already exists
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" &> /dev/null; then
    echo -e "${YELLOW}Warning: Secret '$SECRET_NAME' already exists in namespace '$NAMESPACE'${NC}"
    read -p "Delete and recreate? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete secret "$SECRET_NAME" -n "$NAMESPACE"
        echo -e "${GREEN}✓ Existing secret deleted${NC}"
    else
        echo -e "${YELLOW}Aborted. Use 'kubectl delete secret $SECRET_NAME -n $NAMESPACE' to delete manually.${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Please provide the following secret values:${NC}"
echo ""

# Prompt for JWT_SECRET
echo -e "${BLUE}1. JWT_SECRET${NC}"
echo "   Purpose: Secret key for JWT token signing"
echo "   Requirements: Minimum 32 characters, alphanumeric + special chars"
echo "   Example: your-super-secret-jwt-key-change-this-in-production"
echo ""
read -p "   Enter JWT_SECRET: " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}Error: JWT_SECRET cannot be empty${NC}"
    exit 1
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${YELLOW}Warning: JWT_SECRET is less than 32 characters (current: ${#JWT_SECRET})${NC}"
    read -p "   Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Prompt for OPENROUTER_API_KEY
echo -e "${BLUE}2. OPENROUTER_API_KEY${NC}"
echo "   Purpose: OpenRouter API key for AI agent functionality"
echo "   Requirements: Must start with 'sk-or-v1-'"
echo "   Get your key: https://openrouter.ai/keys"
echo ""
read -p "   Enter OPENROUTER_API_KEY: " OPENROUTER_API_KEY

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo -e "${RED}Error: OPENROUTER_API_KEY cannot be empty${NC}"
    exit 1
fi

if [[ ! $OPENROUTER_API_KEY =~ ^sk-or-v1- ]]; then
    echo -e "${YELLOW}Warning: OPENROUTER_API_KEY should start with 'sk-or-v1-'${NC}"
    read -p "   Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Prompt for DATABASE_URL
echo -e "${BLUE}3. DATABASE_URL${NC}"
echo "   Purpose: PostgreSQL connection string for Neon database"
echo "   Format: postgresql://user:password@host:5432/database?sslmode=require"
echo "   Example: postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech:5432/neondb?sslmode=require"
echo ""
read -p "   Enter DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL cannot be empty${NC}"
    exit 1
fi

if [[ ! $DATABASE_URL =~ ^postgresql:// ]]; then
    echo -e "${YELLOW}Warning: DATABASE_URL should start with 'postgresql://'${NC}"
    read -p "   Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "Creating Kubernetes Secret"
echo "=========================================="
echo ""

# Create the secret
kubectl create secret generic "$SECRET_NAME" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --namespace="$NAMESPACE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Secret created successfully!${NC}"
    echo ""
    echo "Secret details:"
    kubectl describe secret "$SECRET_NAME" -n "$NAMESPACE"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Deploy application: helm install todo-app ./helm --namespace=$NAMESPACE --values=helm/values-dev.yaml"
    echo "2. Verify deployment: kubectl get pods -n $NAMESPACE"
    echo "3. Access application: minikube service todo-app-frontend -n $NAMESPACE"
    echo ""
    echo -e "${YELLOW}Security reminder:${NC}"
    echo "- Never commit secrets to version control"
    echo "- Rotate secrets regularly"
    echo "- Use different secrets for different environments"
else
    echo -e "${RED}Error: Failed to create secret${NC}"
    exit 1
fi