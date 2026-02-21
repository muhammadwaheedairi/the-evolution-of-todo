# Helm Skill - Testing
#
# Usage:
#   make test      # Run all tests
#   make clean     # Remove test resources

NAMESPACE := helm-skill-test
RELEASE := helm-skill-test
CHART := charts/helm-skill-test

.PHONY: all test clean lint template install status help

help:
	@echo "Helm Skill Test Commands:"
	@echo "  make test     - Run all tests (lint, template, install, verify, clean)"
	@echo "  make clean    - Remove test resources"
	@echo "  make lint     - Lint chart"
	@echo "  make template - Render templates"
	@echo "  make install  - Install chart to cluster"

# === Full Test ===

test: lint template install wait-ready verify clean
	@echo "✓ All Helm skill tests passed"

# === Lint ===

lint:
	@echo "Linting chart..."
	@helm lint $(CHART) --strict
	@echo "  ✓ Lint passed"

# === Template ===

template:
	@echo "Rendering templates..."
	@helm template $(RELEASE) $(CHART) --debug > /dev/null
	@echo "  ✓ Template render passed"

# === Install ===

install: namespace
	@echo "Installing chart..."
	@helm upgrade --install $(RELEASE) $(CHART) -n $(NAMESPACE) --wait --timeout 2m
	@echo "  ✓ Chart installed"

namespace:
	@kubectl create namespace $(NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -

# === Wait ===

wait-ready:
	@echo "Waiting for deployment..."
	@kubectl wait deployment/$(RELEASE) --for=condition=Available --timeout=120s -n $(NAMESPACE)
	@echo "  ✓ Deployment ready"

# === Verify ===

verify: verify-release verify-pods
	@echo "  ✓ All verifications passed"

verify-release:
	@echo "Verifying release..."
	@helm status $(RELEASE) -n $(NAMESPACE) > /dev/null
	@echo "    ✓ Release exists"

verify-pods:
	@echo "Verifying pods..."
	@kubectl get pods -n $(NAMESPACE) -l app.kubernetes.io/instance=$(RELEASE) -o jsonpath='{.items[0].status.phase}' | grep -q Running
	@echo "    ✓ Pod is Running"

# === Status ===

status:
	@echo "=== Helm Skill Test Status ==="
	@helm list -n $(NAMESPACE) 2>/dev/null || echo "No releases found"
	@kubectl get all -n $(NAMESPACE) 2>/dev/null || echo "No resources found"

# === Cleanup ===

clean:
	@echo "Cleaning up..."
	@helm uninstall $(RELEASE) -n $(NAMESPACE) --ignore-not-found 2>/dev/null || true
	@kubectl delete namespace $(NAMESPACE) --ignore-not-found --wait=false
	@echo "  ✓ Cleanup complete"
