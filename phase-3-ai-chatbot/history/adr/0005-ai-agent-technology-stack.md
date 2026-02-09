# ADR-0005: AI Agent Technology Stack

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-02-06
- **Feature:** Backend AI Infrastructure
- **Context:** Need to select an AI agent technology stack that enables natural language task management while maintaining stateless architecture, MCP protocol compliance, and horizontal scalability requirements.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

We will adopt the OpenAI Agents SDK + Official MCP SDK technology stack consisting of:
- **AI Agent Framework**: OpenAI Agents SDK (openai-agents package) for agent orchestration
- **Tool Protocol**: Official MCP SDK for standardized tool integration
- **Session Management**: SQLAlchemySession for database-backed conversation persistence
- **Models**: GPT-4 or GPT-4-turbo for natural language understanding
- **Integration**: MCPServerStdio for MCP server integration

## Consequences

### Positive

- Production-ready agent framework with built-in MCP integration
- Stateless architecture supporting horizontal scalability
- Database-backed conversation persistence using existing PostgreSQL infrastructure
- Automatic conversation history management without manual implementation
- Built-in guardrails and tracing for debugging and monitoring
- Compliance with constitutional requirements for stateless design
- Direct integration with MCP tools for standardized task operations
- Type-safe agent configuration and execution

### Negative

- Dependency on OpenAI ecosystem and associated costs
- Potential vendor lock-in with OpenAI Agents SDK
- Learning curve for MCP protocol and agent development
- Rate limits and token consumption costs with OpenAI API
- Complexity of managing both agent and MCP server components
- Limited control over conversation storage details (abstracted by SDK)

## Alternatives Considered

Alternative A: OpenAI Assistants API
- Why rejected: Stores conversation history on OpenAI servers, violating stateless architecture requirement

Alternative B: Custom parsing and routing solution
- Why rejected: Less reliable for natural language understanding, more maintenance burden

Alternative C: LangChain agents framework
- Why rejected: Adds unnecessary complexity, doesn't follow MCP protocol requirements

Alternative D: Direct OpenAI API with custom tool calling
- Why rejected: Doesn't follow MCP protocol standards, requires manual conversation management

## References

- Feature Spec: specs/phase3-backend-ai-infrastructure/spec.md
- Implementation Plan: specs/phase3-backend-ai-infrastructure/plan.md
- Research Findings: specs/phase3-backend-ai-infrastructure/research.md
- Related ADRs: ADR-0001, ADR-0004
- Evaluator Evidence: specs/phase3-backend-ai-infrastructure/research.md
