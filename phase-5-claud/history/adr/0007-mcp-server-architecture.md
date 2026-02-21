# ADR-0007: MCP Server Architecture

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-02-06
- **Feature:** Backend AI Infrastructure
- **Context:** Need to determine how to implement the Model Context Protocol (MCP) server to integrate with the OpenAI Agents SDK for standardized tool access while maintaining security and user isolation requirements.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

We will implement an embedded MCP server architecture with:
- **Server Type**: MCPServerStdio integrated with OpenAI Agents SDK
- **Location**: Backend module at `src/mcp/` for encapsulation
- **Tools**: 5 standardized MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- **Integration**: Direct connection to existing task_service.py functions
- **Security**: User_id validation in all tools to maintain data isolation
- **Protocol**: Official MCP SDK for standardization and compliance

## Consequences

### Positive

- Standardized protocol compliance using official MCP SDK
- Tight integration with OpenAI Agents SDK via MCPServerStdio
- Reuse of existing business logic in task_service.py functions
- Maintains security with user_id validation in all tools
- Encapsulated architecture with clear module separation
- Compliant with constitutional requirements for MCP integration
- Direct access to backend services without external dependencies
- Consistent with existing Python/FastAPI patterns

### Negative

- Additional complexity with MCP server management
- Need to maintain MCP protocol compliance
- Potential performance overhead from protocol translation
- Learning curve for MCP protocol development
- Additional error handling requirements for MCP communication
- Need to ensure secure connection between agent and MCP server

## Alternatives Considered

Alternative A: External MCP server as separate service
- Why rejected: Adds network complexity, deployment overhead, and potential security concerns

Alternative B: Direct function registration without MCP protocol
- Why rejected: Violates constitutional requirement for MCP protocol compliance

Alternative C: Custom tool protocol instead of MCP
- Why rejected: Non-standard approach, reduces interoperability, violates constitutional requirements

Alternative D: Pre-built MCP server from external provider
- Why rejected: Loss of control over tool implementation, potential security concerns, vendor lock-in

## References

- Feature Spec: specs/phase3-backend-ai-infrastructure/spec.md
- Implementation Plan: specs/phase3-backend-ai-infrastructure/plan.md
- Research Findings: specs/phase3-backend-ai-infrastructure/research.md
- Related ADRs: ADR-0005
- Evaluator Evidence: specs/phase3-backend-ai-infrastructure/research.md
