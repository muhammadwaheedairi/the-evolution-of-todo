---
id: 3
title: Add Phase IV Kubernetes deployment guidance
stage: general
date: 2026-02-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: muhammadwaheed
command: sp.task
labels: [documentation, kubernetes, deployment, phase-iv, helm]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - CLAUDE.md
tests:
---

## Prompt

```text
File: CLAUDE.md
Project: Todo AI Chatbot

Context:
The current CLAUDE.md fully defines rules up to Phase III (AI Chatbot with MCP, OpenAI Agents SDK, ChatKit).
DO NOT modify, rewrite, reorder, or delete any existing Phase III content.
Phase IV instructions must be strictly additive and clearly scoped.

Objective:
Extend CLAUDE.md with Phase IV guidance for Local Kubernetes Deployment using Minikube and Helm Charts.

Scope (Phase IV only):
- Containerization of existing frontend and backend
- Local Kubernetes deployment using Minikube
- Helm charts for orchestration
- No application logic changes
- No feature development
- Infrastructure and deployment only

Core rules to add (Phase IV):
- Infrastructure-as-Code only (no manual kubectl imperative workflows)
- Docker images must be deterministic and non-root
- Helm charts are mandatory (no raw Kubernetes YAML)
- ConfigMaps and Secrets for configuration
- Runtime behavior must remain identical to Phase III
- Stateless guarantees must remain intact across pod restarts

Agent behavior requirements (Phase IV):
- Follow Agentic Dev Stack: spec → plan → tasks → implementation
- No manual coding; all artifacts generated via Claude Code
- Prefer CLI-based verification (docker, minikube, helm)
- Never assume cluster state; always validate
- Fail fast on misconfiguration

Deployment standards to document:
- Docker build strategy (multi-stage)
- Kubernetes resource expectations (Deployments, Services)
- Helm chart structure and values usage
- Environment variable injection
- Local debugging and log inspection via kubectl

Constraints:
- Minikube only (no cloud Kubernetes)
- No weakening of Phase III security rules
- No secrets committed to repository
- No changes to existing API contracts
- No state stored in containers

Success criteria to include:
- Fresh Minikube cluster deploys successfully
- Helm install / upgrade / uninstall works cleanly
- Frontend, backend, and MCP server run correctly
- Chat functionality unchanged from Phase III
- Application survives pod restarts without data loss

Output requirements:
- Append a clearly labeled "Phase IV – Local Kubernetes Deployment" section
- Do not repeat Phase III content
- Keep tone consistent with existing CLAUDE.md
- Be prescriptive, not tutorial-style
```

## Response snapshot

Extended CLAUDE.md with comprehensive Phase IV deployment guidance while preserving all Phase III content. Added new section "Phase IV – Local Kubernetes Deployment" covering:

**Core Content Added:**
- Objective and core principles (Infrastructure as Code, zero drift, reproducibility)
- Technology additions (Docker, Kubernetes/Minikube, Helm 3+)
- Critical requirements (5 mandatory sections: IaC, containerization, K8s deployment, Helm charts, security)
- Deployment workflow following Agentic Dev Stack
- Dockerfile patterns (multi-stage builds for frontend and backend)
- Helm chart structure and organization
- Kubernetes resources required (Deployments, Services, ConfigMaps, Secrets)
- Environment variable injection patterns
- Local development with Minikube (setup, build, deploy, access)
- Deployment verification checklist
- CLI-based verification commands
- Troubleshooting common issues
- Updated project structure showing new Phase IV files
- Phase IV constraints (forbidden vs permitted actions)
- Success criteria for deployment

**Key Standards Documented:**
- Multi-stage Docker builds with non-root users
- Helm-only resource management (no raw YAML)
- ConfigMaps for non-sensitive config, Secrets for sensitive data
- Health checks (liveness and readiness probes)
- Resource limits to prevent exhaustion
- Namespace isolation
- CLI-first verification approach

**Practical Guidance:**
- Complete Minikube setup commands
- Docker image building workflow
- Secret creation examples
- Helm deployment commands
- Troubleshooting guide for common issues
- Verification checklist

Updated metadata: Phase 4, Constitution v2.1.0, Last Updated 2026-02-09

## Outcome

- ✅ Impact: CLAUDE.md extended with Phase IV deployment guidance (strictly additive)
- 🧪 Tests: N/A (documentation update)
- 📁 Files: CLAUDE.md updated with ~400 lines of Phase IV content
- 🔁 Next prompts: Create Phase IV specification (/sp.specify), then plan (/sp.plan), then tasks (/sp.tasks)
- 🧠 Reflection: Successfully added comprehensive deployment guidance while maintaining strict separation from Phase III content. All Phase III rules preserved unchanged. Documentation is prescriptive and CLI-focused as requested.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
