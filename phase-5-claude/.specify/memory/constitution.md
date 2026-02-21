<!-- SYNC IMPACT REPORT
Version change: 2.1.0 → 3.0.0 (MAJOR)
Modified principles:
- Stateless Design → Extended with Dapr state management patterns
- API-First Architecture → Extended with event-driven patterns
- Database Integrity → Extended with event sourcing patterns
Added sections:
- Event-Driven Architecture Standards (NEW - Phase V)
- Dapr Integration Standards (NEW - Phase V)
- Microservices Architecture Standards (NEW - Phase V)
- Kafka Standards (NEW - Phase V)
- Oracle Cloud Deployment Standards (NEW - Phase V)
- CI/CD Standards (NEW - Phase V)
- Advanced Task Features Standards (NEW - Phase V)
- Event Schema Standards (NEW - Phase V)
- Service Communication Patterns (NEW - Phase V)
- Observability Standards (NEW - Phase V)
- Updated Database Standards with new fields (due_date, priority, tags, recurrence_pattern)
- Updated Success Criteria with Phase V criteria
- Updated Quality Gates with Phase V gates
Removed sections: None (all Phase I-IV content preserved)
Templates requiring updates:
- .specify/templates/plan-template.md ⚠ pending (add event-driven architecture section)
- .specify/templates/spec-template.md ⚠ pending (add microservices requirements)
- .specify/templates/tasks-template.md ⚠ pending (add Dapr/Kafka deployment tasks)
Runtime docs:
- README.md ⚠ pending (add Oracle Cloud deployment instructions)
- CLAUDE.md ⚠ pending (add Phase V context)
Follow-up TODOs:
- Document Kafka cluster setup on Minikube and OCI
- Document Dapr installation and component configuration
- Create event schema documentation
- Add Oracle Cloud free tier setup guide
- Document GitHub Actions CI/CD pipeline setup
- Create microservices communication diagram
-->

# Todo AI Chatbot Constitution

## Core Principles

### Security First
All user data must be protected and isolated. Security is the highest priority. JWT authentication must be enforced on every API route **including chat endpoints**, with multi-user task isolation fully enforced. All data must be properly isolated by user_id, and stateless authentication must be maintained with no shared sessions. **All MCP tools must validate user_id before execution. All conversation data must be isolated by user. All Kubernetes Secrets must be encrypted at rest. No secrets in container images or Helm values files.**

### Stateless Design
Backend services should be horizontally scalable. No shared sessions are allowed; only stateless authentication using JWT tokens. The frontend and backend must share auth secrets via environment variables only. **AI agents must be stateless - no in-memory conversation state. All conversation history must persist in database. Server restarts must not lose conversation context. Kubernetes pods must be stateless and replaceable.**

### Type Safety
All data structures must be strictly typed. All components must be properly typed (no 'any' types). All functions must have descriptive names (no single letters except loops). All async operations must be properly awaited. **All MCP tool schemas must be strictly typed. All agent responses must follow typed schemas. All Helm values must be validated against schemas.**

### API-First Architecture
Frontend and backend communicate only via REST API. All endpoints must follow REST conventions. All endpoints must include user_id in path for user-specific resources. All POST/PUT requests must validate request body. **Chat endpoint must follow same authentication patterns as REST endpoints. Natural language inputs must be validated before agent processing. Kubernetes Services must expose stable endpoints.**

### Database Integrity
All database operations must be transactional. All tables must have created_at and updated_at timestamps. All foreign keys must have proper constraints. All user-owned resources must have user_id foreign key. All queries must filter by user_id for user-specific data. No cascading deletes (explicit handling required). **Conversation and message tables must maintain referential integrity. All conversation history must be retrievable and ordered by timestamp. Database must be accessible from Kubernetes cluster.**

### **AI Agent Architecture**
**All AI interactions must be deterministic and reproducible. Agent behavior must be consistent across sessions. Tool execution must be atomic and transactional. Agent must not hallucinate or invent data - only use actual MCP tool responses. System prompts must be version-controlled and documented. Agent behavior must be identical in Kubernetes deployment.**

### **Conversational Interface First**
**Natural language is the primary interface. Chat UI must be intuitive and conversational. Agent responses must be human-friendly, not JSON dumps. Agent must confirm actions before execution when appropriate. Error messages must be conversational, not technical.**

### **Infrastructure as Code**
**All infrastructure must be defined as code, never manually configured. Kubernetes resources must be managed via Helm charts only. No imperative kubectl commands in production workflows. All deployment configurations must be version-controlled. Infrastructure changes must be reproducible and deterministic. Local and production deployments must use identical patterns.**

### **Event-Driven Architecture (NEW - Phase V)**
**Asynchronous communication via events for decoupled services. All task operations must publish events to Kafka. Services must subscribe to relevant event topics. Events must be immutable and append-only. Event schema must be versioned and backward-compatible. No synchronous calls between microservices for business logic (use events). Request-response only for queries, not commands.**

### **Microservices Independence (NEW - Phase V)**
**Each microservice must be independently deployable. Services must not share databases (bounded contexts). Services communicate only via events or Dapr service invocation. Each service must have its own Helm chart. Service failures must not cascade (circuit breakers required). Services must be horizontally scalable.**

### **Dapr-First Integration (NEW - Phase V)**
**All cross-service communication must use Dapr building blocks. No direct Kafka client code (use Dapr Pub/Sub). No direct state management libraries (use Dapr State). Secrets must use Dapr Secrets API. Scheduled tasks must use Dapr Jobs API (not cron). Service-to-service calls must use Dapr Service Invocation. All Dapr components configured via YAML (no code configuration).**

---

## Key Standards

### Authentication
JWT-based auth required for all protected endpoints **including chat API**. Authentication must use **custom JWT implementation with Argon2 password hashing**. This ensures consistent authentication patterns across frontend and backend, with proper token validation and user session management. **Chat endpoint must validate JWT tokens exactly like REST endpoints.**

### Authorization
User can only access their own tasks (enforced at API level). All database queries MUST filter by user_id. ALWAYS verify user_id in URL matches authenticated user. **All MCP tools MUST receive and validate user_id parameter. Agent cannot access data from other users under any circumstance.**

### Error Handling
All API endpoints must return proper HTTP status codes. All API endpoints must include proper error handling. All errors return proper error messages with status codes (400, 401, 404, 500). **Agent must handle tool errors gracefully and inform user conversationally. Network failures to OpenAI API must be handled with retry logic. Invalid natural language inputs must receive helpful clarification prompts. Container failures must be logged and pods must restart automatically.**

### Validation
All user inputs must be validated on both frontend and backend. All POST/PUT requests must validate request body. All forms validate user input before submission. **Natural language inputs must be sanitized before agent processing. Agent intent must be validated before tool execution. Tool parameters extracted by agent must be validated against schemas. Helm values must be validated before deployment.**

### Response Format
All API responses must follow consistent JSON structure. All successful operations return appropriate status (200, 201, 204). **Chat endpoint must return: conversation_id, assistant response text, and tool_calls array. Agent responses must be formatted as natural language, not raw data structures.**

### Password Security
All passwords must be hashed (never stored in plain text). All passwords must be hashed with **Argon2** (not bcrypt per constitution update). Never store plaintext passwords.

### Environment Variables
All secrets must be stored in .env files (never hardcoded). All environment variables must be validated on startup. **OpenAI API keys must be in environment variables. MCP server configuration must be environment-driven. Kubernetes Secrets must be used for sensitive data in cluster.**

---

## Technical Constraints

### Frontend Framework
Frontend Framework: Next.js 16+ with App Router (not Pages Router). Frontend must be built using Next.js 16+ App Router. Use Server Components (no 'use client') as default, Client Components only for interactivity. **ChatKit UI must be implemented as Client Component due to interactivity requirements.**

### Backend Framework
Backend Framework: FastAPI with async/await. Backend must be built using Python FastAPI. **All MCP tool handlers must be async. OpenAI Agent SDK must use async/await patterns. Chat endpoint must handle concurrent requests properly.**

### Database
Database: Neon Serverless PostgreSQL only. All data must be persisted in Neon Serverless PostgreSQL database. **Conversation and message tables must be in same database. No separate conversation store allowed. Database must be accessible from Kubernetes pods.**

### ORM
ORM: SQLModel for all database operations. All backend logic must be implemented using Python FastAPI with SQLModel ORM. **Conversation and Message models must use SQLModel. All conversation queries must use SQLModel sessions.**

### **AI Framework**
**AI Framework: OpenAI Agents SDK for agent orchestration. All agent logic must use official OpenAI Python SDK. Agent configuration must be centralized and version-controlled.**

### **MCP Protocol**
**MCP Protocol: Official MCP SDK for tool definitions. All task operations must be exposed as MCP tools. MCP server must be separate module from FastAPI routes. Tool schemas must follow MCP specification exactly.**

### Authentication Library
Authentication Library: **Custom JWT with Argon2 hashing** (not Better Auth). Authentication must use custom JWT implementation with Argon2 password hashing for maximum security.

### **Chat UI Library**
**Chat UI Library: OpenAI ChatKit for conversational interface. ChatKit must be properly configured with domain allowlist. Chat interface must handle streaming responses if implemented.**

### Styling
Styling: Tailwind CSS only (no inline styles, no CSS modules). **ChatKit components must use Tailwind for custom styling.**

### TypeScript
TypeScript: Strict mode enabled on frontend. **ChatKit integration must be properly typed.**

### Python Version
Python Version: 3.11+. **OpenAI SDK and MCP SDK must be compatible with Python 3.11+.**

### **Container Runtime (NEW - Phase IV)**
**Container Runtime: Docker for containerization. All services must run in containers. Base images must be official and minimal (Alpine or Distroless preferred). Containers must run as non-root users. Multi-stage builds required for production images.**

### **Orchestration Platform (NEW - Phase IV)**
**Orchestration Platform: Kubernetes (Minikube for local). All deployments must use Kubernetes. Minikube required for local development. No Docker Compose in Phase IV. All Kubernetes resources managed via Helm.**

### **Package Manager**
**Package Manager: Helm 3+ for Kubernetes deployments. All Kubernetes resources must be defined in Helm charts. No raw Kubernetes YAML files. Helm values must be environment-specific (dev, staging, prod).**

### **Event Streaming Platform (NEW - Phase V)**
**Event Streaming: Apache Kafka via Strimzi operator. All inter-service events must flow through Kafka. Kafka must be self-hosted (no managed services for free tier). Strimzi operator manages Kafka lifecycle on Kubernetes. KRaft mode (no ZooKeeper). Minimum 3 broker replicas for production.**

### **Service Mesh / Sidecar (NEW - Phase V)**
**Service Mesh: Dapr v1.14+ for all microservices. All services must have Dapr sidecar. Dapr components configured via Kubernetes CRDs. All 5 building blocks required: Pub/Sub, State Management, Service Invocation, Jobs API, Secrets Management. No direct service-to-service HTTP calls (use Dapr).**

### **Cloud Platform (NEW - Phase V)**
**Cloud Platform: Oracle Cloud Infrastructure (OCI) Always Free tier. Oracle Kubernetes Engine (OKE) for production cluster. 4 OCPUs, 24GB RAM (free tier limits). All deployments must fit within free tier. No paid services allowed. Self-hosted Kafka (Strimzi) instead of managed streaming.**

### **CI/CD Platform (NEW - Phase V)**
**CI/CD: GitHub Actions for automated pipelines. All tests must run on push. Docker images built and pushed automatically. Deployment to OKE automated via GitHub Actions. Secrets managed via GitHub Secrets. No manual deployments to production.**

---

## Code Quality Standards

All API endpoints must include proper error handling. All database queries must use parameterized statements (no raw SQL). All functions must have descriptive names (no single letters except loops). All magic numbers must be defined as constants. All async operations must be properly awaited. No console.log in production code (use proper logging). All components must be properly typed (no 'any' types). **All MCP tool handlers must have comprehensive error handling. All agent system prompts must be clear and unambiguous. All conversation flows must be logged for debugging. All Dockerfiles must follow best practices (layer caching, minimal layers). All Helm charts must be linted and validated.**

**NEW Phase V Requirements:**
- **All event handlers must be idempotent (safe to replay)**
- **All events must have correlation IDs for tracing**
- **All Dapr component configurations must be validated**
- **All microservices must have structured logging (JSON format)**
- **All Kafka topics must have retention policies defined**
- **All service-to-service calls must have timeouts and retries**
- **All event schemas must be documented and versioned**

---

## API Design Standards

All endpoints must follow REST conventions. All endpoints must include user_id in path for user-specific resources. All POST/PUT requests must validate request body. All successful operations return appropriate status (200, 201, 204). All errors return proper error messages with status codes (400, 401, 404, 500). All endpoints must check JWT token validity before processing. **Chat endpoint must accept: user_id, message, optional conversation_id. Chat endpoint must return: conversation_id, response, tool_calls array.**

---

## **AI Agent Standards**

### **System Prompt Requirements**
**System prompt must clearly define agent role as task management assistant. System prompt must list all available MCP tools with descriptions. System prompt must instruct agent to confirm destructive actions (delete). System prompt must be stored in separate configuration file, not hardcoded.**

### **Intent Recognition**
**Agent must correctly map natural language to tool calls:**
- **"add/create/remember" → add_task tool**
- **"show/list/display" → list_tasks tool**
- **"complete/done/finish" → complete_task tool**
- **"delete/remove/cancel" → delete_task tool**
- **"update/change/rename" → update_task tool**

### **Response Quality**
**Agent responses must be conversational and friendly. Agent must confirm successful actions ("I've added 'Buy milk' to your tasks"). Agent must ask for clarification on ambiguous requests. Agent must not expose internal errors to users - translate to friendly messages.**

### **Context Management**
**Agent must use conversation history for context. Agent must remember previous messages in same conversation. Agent must handle multi-turn interactions (follow-up questions). Conversation context must be loaded from database on every request.**

---

## **MCP Server Standards**

### **Tool Definition Requirements**
**All 5 tools must be defined: add_task, list_tasks, complete_task, delete_task, update_task. Each tool must have clear description and typed parameters. Tool schemas must include user_id as required parameter. Tool responses must be standardized JSON format.**

### **Tool Execution Standards**
**Tools must be wrappers around existing task services (code reuse). Tools must validate all parameters before execution. Tools must handle errors and return structured error responses. Tools must log execution for audit trail.**

### **MCP Protocol Compliance**
**MCP server must implement official MCP specification. Tool schemas must validate using MCP SDK validators. MCP server must be independently testable (separate from FastAPI app).**

---

## **Conversation Management Standards**

### **Conversation Persistence**
**All conversations must persist in database. Each message must store: role (user/assistant), content, timestamp. Conversation history must be retrievable by conversation_id. Conversations must be filterable by user_id.**

### **Stateless Request Handling**
**Chat endpoint must fetch conversation history on every request. Server memory must not store any conversation state. Multiple backend instances must handle same conversation consistently. Server restarts must not affect ongoing conversations.**

### **Conversation Lifecycle**
**New conversations created automatically when conversation_id not provided. Conversations persist indefinitely unless explicitly deleted. Users can only access their own conversations. Conversation IDs must be unique and non-guessable.**

---

## **Natural Language Processing Standards**

### **Input Validation**
**Natural language inputs must be sanitized (no SQL injection via chat). Maximum message length enforced (prevent abuse). Empty messages rejected with friendly error. Repeated identical messages rate-limited.**

### **Intent Extraction**
**Agent must extract task details from natural language accurately. Agent must handle varied phrasings ("add task buy milk" vs "remember to buy milk"). Agent must ask for missing required information (task title). Agent must handle multi-action requests appropriately.**

### **Error Recovery**
**Agent must handle unrecognized intents gracefully ("I didn't understand, can you rephrase?"). Agent must provide examples of valid commands when confused. Agent must recover from partial failures (some tools succeed, some fail).**

---

## **OpenAI Integration Standards**

### **API Key Security**
**OpenAI API key must be in environment variables only. API key must never be exposed in frontend code. API key must be validated on backend startup.**

### **Rate Limiting**
**Implement rate limiting on chat endpoint to prevent OpenAI quota abuse. Track tokens used per user/conversation. Implement exponential backoff for OpenAI API failures.**

### **Model Selection**
**Use GPT-4 or GPT-4-turbo for best natural language understanding. Model version must be configurable via environment variable. Fallback model strategy if primary model unavailable.**

---

## **ChatKit Standards**

### **Domain Allowlist**
**Production frontend domain must be added to OpenAI domain allowlist. Domain key must be obtained and stored in environment variables. Local development (localhost) must work without domain key.**

### **UI/UX Requirements**
**Chat interface must be primary interface (not secondary to forms). Chat must show conversation history on load. Chat must indicate when agent is processing (loading state). Chat must show which tools were executed (transparency).**

### **Message Rendering**
**User messages and agent messages must be visually distinct. Timestamps must be shown for all messages. Tool execution results can be shown (optional, for transparency). Error messages must be user-friendly, not technical.**

---

## **Kubernetes Deployment Standards (NEW - Phase IV)**

### **Resource Definitions**
**All Kubernetes resources must be defined in Helm charts. Deployments must specify resource limits (CPU, memory). Services must use ClusterIP for internal, LoadBalancer/NodePort for external. ConfigMaps for non-sensitive configuration, Secrets for sensitive data.**

### **Pod Configuration**
**Pods must be stateless and horizontally scalable. Pods must have liveness and readiness probes. Pods must run as non-root users (securityContext). Pods must have resource requests and limits defined.**

### **Service Discovery**
**Services must use DNS-based discovery (service-name.namespace.svc.cluster.local). Backend must be accessible to frontend via Service. Database must be accessible via Service or external endpoint.**

### **High Availability**
**Deployments must have minimum 2 replicas for production. Rolling updates must be configured (maxSurge, maxUnavailable). Pod disruption budgets should be defined for critical services.**

### **Namespace Isolation**
**Application must run in dedicated namespace (not default). Resources must be labeled consistently (app, component, version). Network policies should restrict pod-to-pod communication.**

---

## **Containerization Standards (NEW - Phase IV)**

### **Dockerfile Best Practices**
**Use official base images (node:alpine, python:slim). Multi-stage builds required (build stage + runtime stage). Minimize layers (combine RUN commands). Copy only necessary files (use .dockerignore). Run as non-root user (USER directive).**

### **Image Security**
**No secrets in images (use environment variables). Scan images for vulnerabilities before deployment. Use specific image tags (not :latest). Keep base images updated regularly.**

### **Image Optimization**
**Minimize image size (remove build dependencies). Use layer caching effectively (COPY package files first). Clean up package manager caches. Use .dockerignore to exclude unnecessary files.**

### **Container Configuration**
**Environment variables for all configuration. Health check endpoints exposed (/health, /ready). Graceful shutdown handling (SIGTERM). Logs to stdout/stderr (not files).**

---

## **Helm Chart Standards (NEW - Phase IV)**

### **Chart Structure**
**Chart must follow standard structure (Chart.yaml, values.yaml, templates/). Templates must use Helm templating ({{ .Values.* }}). Values must be organized by component (frontend, backend, database). Chart must have README with installation instructions.**

### **Values Organization**
**Separate values files for environments (values-dev.yaml, values-prod.yaml). Common values in values.yaml, environment-specific overrides in separate files. Secrets must NOT be in values files (use Kubernetes Secrets). All configurable parameters documented in values.yaml comments.**

### **Template Best Practices**
**Use named templates for reusable components (_helpers.tpl). Include resource limits in all Deployments. Use consistent labeling (app.kubernetes.io/* labels). Include annotations for documentation.**

### **Chart Validation**
**Lint charts before deployment (helm lint). Dry-run before actual deployment (helm install --dry-run). Validate rendered templates (helm template). Test chart installation in clean namespace.**

### **Chart Versioning**
**Chart version must follow semantic versioning. Chart version must increment with changes. appVersion must match application version. Chart must be packaged and stored (helm package).**

---

## **Secrets Management Standards (NEW - Phase IV)**

### **Kubernetes Secrets**
**All sensitive data must use Kubernetes Secrets. Secrets must be base64 encoded (Kubernetes requirement). Secrets must be mounted as environment variables or volumes. Secrets must never be in Helm values files or Git.**

### **Secret Creation**
**Secrets created manually or via CI/CD (not in Helm charts). Secret names must be referenced in Helm templates. Document required secrets in README. Provide example secret creation commands.**

### **Secret Rotation**
**Secrets should be rotatable without redeploying application. Pods must restart when secrets change (use checksum annotations). Document secret rotation procedure. Test secret rotation in development.**

### **Secret Scope**
**Secrets scoped to namespace (not cluster-wide). Separate secrets for different environments. Minimal secret access (RBAC policies). Audit secret access regularly.**

---

## **Local Development Standards (NEW - Phase IV)**

### **Minikube Setup**
**Minikube required for local Kubernetes development. Minikube must have sufficient resources (CPU, memory). Minikube addons enabled as needed (ingress, metrics-server). Document Minikube installation and configuration.**

### **Local Deployment**
**Local deployment must mirror production architecture. Use same Helm charts with dev values. Local database can be in-cluster or external. Document local deployment procedure step-by-step.**

### **Development Workflow**
**Code changes must be testable in Minikube. Image building must be fast (use Minikube Docker daemon). Hot reload should work where possible. Document troubleshooting common issues.**

### **Resource Constraints**
**Local deployments should use minimal resources. Reduce replicas to 1 for local (override in values-dev.yaml). Use smaller resource limits locally. Document minimum system requirements.**

---

## **Event-Driven Architecture Standards (NEW - Phase V)**

### **Event Publishing**
**All task CRUD operations must publish events to Kafka. Events must be published after successful database commit (transactional outbox pattern preferred). Event publishing failures must be logged and retried. Events must include: event_type, aggregate_id, user_id, timestamp, payload, correlation_id.**

### **Event Consumption**
**Services must subscribe to relevant topics via Dapr Pub/Sub. Event handlers must be idempotent (safe to replay). Failed event processing must use dead letter queue. Event handlers must not block (async processing). Consumer groups must be configured for load balancing.**

### **Event Ordering**
**Events for same aggregate (task_id) must maintain order. Use Kafka partition keys (task_id) for ordering guarantees. Cross-aggregate ordering not guaranteed (eventual consistency). Services must handle out-of-order events gracefully.**

### **Event Sourcing Patterns**
**Task state changes must be event-sourced (append-only log). Current state derived from event replay. Events are immutable (never delete or modify). Snapshots can be used for performance (optional). Event store is source of truth.**

### **Communication Patterns**
**Commands (create, update, delete) → Publish events asynchronously. Queries (list, get) → Direct database reads (CQRS pattern). No synchronous service-to-service calls for commands. Use Dapr Service Invocation only for queries if needed.**

---

## **Dapr Integration Standards (NEW - Phase V)**

### **Dapr Sidecar Architecture**
**Every microservice must have Dapr sidecar container. Dapr sidecar injected via Kubernetes annotations. Services communicate with Dapr via HTTP/gRPC on localhost. Dapr handles all cross-cutting concerns (retry, timeout, tracing). Dapr version must be consistent across all services (v1.14+).**

### **Pub/Sub Building Block (REQUIRED)**
**All event publishing/subscribing via Dapr Pub/Sub API. Dapr abstracts Kafka complexity (no direct Kafka client). Pub/Sub component configured via YAML (pubsub.yaml). Topic names must be consistent across services. Subscription configuration via Dapr annotations or programmatic API.**

**Example Topics:**
- `task-events` - All task CRUD operations (created, updated, deleted, completed)
- `reminders` - Scheduled reminder notifications
- `recurring-tasks` - Recurring task generation events

### **State Management Building Block (REQUIRED)**
**Conversation state and task cache via Dapr State API. State store component configured via YAML (statestore.yaml). State operations: get, set, delete, bulk operations. State must support TTL for cache expiration. State store can be Redis or PostgreSQL (configured via component).**

### **Service Invocation Building Block (REQUIRED)**
**Service-to-service calls via Dapr Service Invocation. Use only for synchronous queries (not commands). Dapr provides service discovery, load balancing, retry. Service invocation format: `http://localhost:3500/v1.0/invoke/<service-id>/method/<method-name>`. Timeouts and retries configured in Dapr.**

### **Jobs API Building Block (REQUIRED)**
**Scheduled reminders via Dapr Jobs API (not cron). Jobs configured programmatically or via API. Job schedules support cron expressions. Jobs must be idempotent (safe to run multiple times). Job execution tracked and logged. Use Jobs API for: due date reminders, recurring task generation.**

### **Secrets Management Building Block (REQUIRED)**
**All secrets accessed via Dapr Secrets API. Secrets component configured via YAML (secrets.yaml). Secrets stored in Kubernetes Secrets (local) or OCI Vault (cloud). Services never access secrets directly. Secrets referenced by name in Dapr components. Secrets rotation handled by Dapr.**

### **Dapr Component Configuration**
**All Dapr components defined as Kubernetes CRDs. Component YAML files in `dapr-components/` directory. Components scoped to namespace. Component metadata includes connection strings, credentials. Components validated before deployment. Example components: pubsub.yaml, statestore.yaml, secrets.yaml.**

### **Dapr Observability**
**Dapr provides distributed tracing (Zipkin/Jaeger). Dapr metrics exposed via Prometheus. Dapr logs structured (JSON format). Correlation IDs propagated across services. Dapr dashboard for local debugging.**

---

## **Microservices Architecture Standards (NEW - Phase V)**

### **Service Boundaries**
**Three microservices required:**
1. **Task Service** - Existing backend, handles task CRUD, publishes task events
2. **Notification Service** - Subscribes to task events, sends reminders via Dapr Jobs API
3. **Recurring Task Service** - Handles recurring task patterns, generates tasks on schedule

**Each service must:**
- Have independent deployment lifecycle
- Own its data (no shared databases for business logic)
- Communicate via events (Dapr Pub/Sub)
- Be horizontally scalable
- Have health check endpoints

### **Service Responsibilities**

**Task Service:**
- User authentication and authorization
- Task CRUD operations
- Publish task events to Kafka
- Manage task state (database)
- Expose REST API for frontend
- Handle chat interface (MCP tools)

**Notification Service:**
- Subscribe to task-events topic
- Schedule reminders for tasks with due dates
- Use Dapr Jobs API for scheduled notifications
- Send notifications (log-based initially, email/SMS later)
- Track notification delivery status

**Recurring Task Service:**
- Manage recurring task patterns (daily, weekly, monthly)
- Generate task instances based on recurrence rules
- Publish task-created events for generated tasks
- Handle recurrence pattern updates
- Support skip/pause of recurring tasks

### **Service Communication**
**Commands (state changes):**
- Task Service → Publishes events → Kafka → Other services subscribe
- No direct HTTP calls for commands

**Queries (read operations):**
- Frontend → Task Service (REST API)
- Service-to-service queries via Dapr Service Invocation (if needed)

**Scheduled Operations:**
- Notification Service → Dapr Jobs API → Trigger reminders
- Recurring Task Service → Dapr Jobs API → Generate recurring tasks

### **Data Ownership**
**Task Service owns:**
- users table
- tasks table
- conversations table
- messages table

**Notification Service owns:**
- notifications table (notification history)
- reminder_schedules table (scheduled reminders)

**Recurring Task Service owns:**
- recurring_patterns table (recurrence definitions)
- recurring_instances table (generated task tracking)

**Shared data access:**
- Services can read from other services' databases for queries (read-only)
- Services NEVER write to other services' databases
- Prefer event-driven updates over direct database reads

### **Service Deployment**
**Each service has:**
- Separate Dockerfile
- Separate Helm chart (or sub-chart in umbrella chart)
- Independent scaling configuration
- Separate resource limits
- Dapr sidecar annotation

---

## **Kafka Standards (NEW - Phase V)**

### **Kafka Deployment**
**Kafka deployed via Strimzi operator on Kubernetes. KRaft mode (no ZooKeeper dependency). Minimum 3 broker replicas for production. 1 broker for local Minikube. Kafka cluster managed via Strimzi CRDs (Kafka, KafkaTopic, KafkaUser).**

### **Topic Configuration**
**Required topics:**
- `task-events` - Partitions: 3, Replication: 3, Retention: 7 days
- `reminders` - Partitions: 3, Replication: 3, Retention: 1 day
- `recurring-tasks` - Partitions: 3, Replication: 3, Retention: 7 days

**Topic naming:**
- Lowercase with hyphens (task-events, not TaskEvents)
- Plural nouns (events, not event)
- Domain-specific (task-events, not events)

**Topic configuration:**
- Retention based on use case (7 days default)
- Compaction for state topics (if needed)
- Partition count based on parallelism needs
- Replication factor 3 for production, 1 for local

### **Event Schema**
**All events must follow standardized schema:**
```json
{
  "event_id": "uuid",
  "event_type": "task.created | task.updated | task.deleted | task.completed",
  "aggregate_id": "task_id",
  "user_id": "uuid",
  "timestamp": "ISO8601",
  "correlation_id": "uuid",
  "payload": {
    // Event-specific data
  },
  "metadata": {
    "service": "task-service",
    "version": "1.0.0"
  }
}
```

**Event types:**
- `task.created` - New task added
- `task.updated` - Task title/description/priority/tags changed
- `task.deleted` - Task removed
- `task.completed` - Task marked complete
- `task.due_date_set` - Due date added/changed
- `reminder.scheduled` - Reminder scheduled for task
- `reminder.sent` - Reminder notification sent
- `recurring_task.generated` - Recurring task instance created

### **Kafka Access**
**Services access Kafka only via Dapr Pub/Sub. No direct Kafka client libraries in service code. Dapr Pub/Sub component handles Kafka connection. Kafka credentials in Dapr secrets component. Consumer groups managed by Dapr.**

### **Kafka Monitoring**
**Kafka metrics exposed via Prometheus. Strimzi operator provides Kafka exporter. Monitor: lag, throughput, partition distribution. Kafka logs aggregated in centralized logging. Kafka UI (optional) for local debugging.**

---

## **Oracle Cloud Deployment Standards (NEW - Phase V)**

### **OCI Free Tier Constraints**
**Always Free resources:**
- 4 OCPUs (ARM-based Ampere A1)
- 24 GB RAM
- 200 GB block storage
- 10 GB object storage
- 2 load balancers

**All deployments must fit within free tier limits. No paid services allowed. Resource limits enforced in Helm charts. Monitoring to prevent exceeding free tier.**

### **OKE Cluster Setup**
**Oracle Kubernetes Engine (OKE) cluster configuration:**
- Node pool: 2 nodes (ARM-based)
- 2 OCPUs per node, 12 GB RAM per node
- Kubernetes version: Latest stable
- Network: VCN with public/private subnets
- Load balancer: OCI Load Balancer (free tier)

### **Cluster Components**
**Required cluster components:**
- Dapr control plane (dapr-system namespace)
- Strimzi operator (kafka namespace)
- Kafka cluster (3 brokers)
- Ingress controller (nginx or OCI native)
- Metrics server
- Prometheus (monitoring)
- Grafana (dashboards)

### **Resource Allocation**
**Resource limits per service (production):**
- Task Service: 1 OCPU, 2 GB RAM, 2 replicas
- Notification Service: 0.5 OCPU, 1 GB RAM, 1 replica
- Recurring Task Service: 0.5 OCPU, 1 GB RAM, 1 replica
- Frontend: 0.5 OCPU, 1 GB RAM, 2 replicas
- Kafka: 1 OCPU, 4 GB RAM, 3 brokers
- Dapr control plane: 0.5 OCPU, 1 GB RAM

**Total: ~4 OCPUs, ~20 GB RAM (within free tier)**

### **Networking**
**OCI networking configuration:**
- VCN with CIDR 10.0.0.0/16
- Public subnet for load balancer
- Private subnet for worker nodes
- Security lists for ingress/egress
- Network security groups for pod communication

### **Storage**
**OCI block storage for persistent volumes:**
- Kafka data: 50 GB per broker (150 GB total)
- PostgreSQL (external Neon, not in OCI)
- Logs: 10 GB (ephemeral, rotated)

### **OCI-Specific Configurations**
**Helm values for OCI:**
- Node selectors for ARM architecture
- Storage class: oci-bv (OCI block volume)
- Load balancer annotations for OCI LB
- Ingress annotations for OCI-specific features

---

## **CI/CD Standards (NEW - Phase V)**

### **GitHub Actions Workflow**
**Required workflows:**
1. **Test Workflow** - Run on every push/PR
   - Lint code (frontend + backend)
   - Run unit tests
   - Run integration tests
   - Check code coverage

2. **Build Workflow** - Run on push to main
   - Build Docker images (frontend, backend, services)
   - Tag images with commit SHA and version
   - Push images to container registry (OCIR or Docker Hub)
   - Scan images for vulnerabilities

3. **Deploy Workflow** - Run on push to main (after build)
   - Deploy to OKE cluster via kubectl/helm
   - Run smoke tests
   - Notify on success/failure

### **Container Registry**
**Image storage:**
- Oracle Cloud Infrastructure Registry (OCIR) - preferred for OCI
- Docker Hub - alternative (public images)
- Images tagged with: latest, version (v1.0.0), commit SHA

### **Deployment Strategy**
**Rolling updates:**
- Zero-downtime deployments
- Health checks before routing traffic
- Automatic rollback on failure
- Blue-green deployment for major changes (optional)

### **Secrets Management in CI/CD**
**GitHub Secrets required:**
- `OCI_AUTH_TOKEN` - OCI authentication
- `KUBECONFIG` - OKE cluster access
- `DOCKER_USERNAME` / `DOCKER_PASSWORD` - Container registry
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - Neon PostgreSQL connection

### **Pipeline Stages**
**Stage 1: Test (on every push)**
- Checkout code
- Setup dependencies
- Run linters
- Run tests
- Upload coverage reports

**Stage 2: Build (on main branch)**
- Build Docker images
- Tag images
- Push to registry
- Scan for vulnerabilities

**Stage 3: Deploy (on main branch, manual approval for prod)**
- Update kubeconfig
- Deploy via Helm upgrade
- Run smoke tests
- Verify deployment

### **Deployment Environments**
**Three environments:**
1. **Development** - Minikube (local)
2. **Staging** - OKE cluster (staging namespace)
3. **Production** - OKE cluster (production namespace)

**Environment promotion:**
- Dev → Staging (automatic on main push)
- Staging → Production (manual approval required)

---

## **Advanced Task Features Standards (NEW - Phase V)**

### **Recurring Tasks**
**Recurrence patterns supported:**
- Daily (every N days)
- Weekly (specific days of week)
- Monthly (specific day of month or last day)
- Custom cron expressions (advanced)

**Recurrence fields:**
- `recurrence_pattern` - JSON field with pattern definition
- `recurrence_end_date` - Optional end date for recurrence
- `is_recurring` - Boolean flag
- `parent_recurring_id` - Link to recurring pattern (for instances)

**Recurrence behavior:**
- Recurring pattern stored separately from task instances
- Task instances generated by Recurring Task Service
- Completing instance doesn't affect pattern
- Deleting pattern stops future generation

### **Due Dates and Reminders**
**Due date fields:**
- `due_date` - Timestamp (nullable)
- `due_time` - Time component (nullable, defaults to end of day)
- `reminder_offset` - Minutes before due date to remind (default: 60)

**Reminder behavior:**
- Notification Service schedules reminders via Dapr Jobs API
- Reminders sent at `due_date - reminder_offset`
- Reminders logged in notifications table
- Overdue tasks highlighted in UI

### **Task Priorities**
**Priority levels:**
- `high` - Urgent, show at top
- `medium` - Normal priority (default)
- `low` - Can be deferred

**Priority field:**
- `priority` - Enum field (high, medium, low)
- Default: medium
- Affects sort order in UI

### **Tags and Categories**
**Tags implementation:**
- `tags` - JSON array field (e.g., ["work", "urgent", "meeting"])
- Tags are user-defined (no predefined list)
- Tags used for filtering and grouping
- Tags autocomplete in UI (based on user's existing tags)

**Tag operations:**
- Add tag to task
- Remove tag from task
- Filter tasks by tag
- List all user's tags

### **Search and Filter**
**Search capabilities:**
- Full-text search on title and description
- Filter by: status (pending/completed), priority, tags, due date range
- Sort by: created_at, due_date, priority, title (alphabetical)
- Combine filters (AND logic)

**Search implementation:**
- PostgreSQL full-text search (tsvector)
- Indexed search fields for performance
- Search via REST API and chat interface

### **Natural Language Support**
**Chat interface must support:**
- "Add recurring task 'standup' every weekday"
- "Set due date for task 5 to tomorrow 3pm"
- "Show high priority tasks due this week"
- "Tag task 3 with 'urgent' and 'work'"
- "Search for tasks about 'meeting'"

---

## Database Standards

All tables must have created_at and updated_at timestamps. All foreign keys must have proper constraints. All user-owned resources must have user_id foreign key. All queries must filter by user_id for user-specific data. No cascading deletes (explicit handling required). **Conversations table must have user_id foreign key. Messages table must have conversation_id and user_id foreign keys. Conversation history queries must order by created_at ASC. Database must be accessible from Kubernetes pods (connection string in Secret).**

**NEW Phase V Fields (tasks table):**
- `due_date` - Timestamp (nullable) - When task is due
- `priority` - Enum (high, medium, low) - Task priority level
- `tags` - JSON array - User-defined tags for organization
- `recurrence_pattern` - JSON (nullable) - Recurring task pattern definition
- `is_recurring` - Boolean - Flag for recurring tasks
- `parent_recurring_id` - Integer (nullable) - Link to recurring pattern

**NEW Phase V Tables:**

**notifications table:**
- `id` - Integer (primary key)
- `user_id` - UUID (foreign key → users.id, indexed)
- `task_id` - Integer (foreign key → tasks.id, indexed)
- `notification_type` - Enum (reminder, overdue)
- `sent_at` - Timestamp
- `status` - Enum (pending, sent, failed)
- `created_at` - Timestamp

**recurring_patterns table:**
- `id` - Integer (primary key)
- `user_id` - UUID (foreign key → users.id, indexed)
- `task_template` - JSON (title, description, priority, tags)
- `pattern_type` - Enum (daily, weekly, monthly, custom)
- `pattern_config` - JSON (pattern-specific configuration)
- `start_date` - Timestamp
- `end_date` - Timestamp (nullable)
- `is_active` - Boolean
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Migration Strategy:**
- Alembic migrations for all schema changes
- Backward-compatible migrations (add columns, not drop)
- Default values for new fields (priority: medium, tags: [], is_recurring: false)
- Data migration scripts for existing tasks
- Test migrations on staging before production

---

## Security Requirements

JWT tokens must expire within 7 days. All passwords must be hashed with **Argon2** (strongest algorithm). All API requests must validate JWT token. All database connections must use SSL. All environment variables must be validated on startup. CORS must be configured properly (no wildcard in production). Rate limiting should be considered for API endpoints. **Chat endpoint must enforce same authentication as REST endpoints. MCP tools must never bypass user_id validation. OpenAI API keys must be rotated periodically. Conversation data must be as protected as task data. Container images must be scanned for vulnerabilities. Kubernetes Secrets must be encrypted at rest. Pod security policies must enforce non-root containers.**

**NEW Phase V Security Requirements:**
- **Event payloads must not contain sensitive data (passwords, tokens)**
- **Kafka topics must have ACLs configured (user isolation)**
- **Dapr mTLS must be enabled for service-to-service communication**
- **Dapr Secrets API must be used for all secret access**
- **OCI security lists must restrict unnecessary ports**
- **Container images scanned before deployment (Trivy or similar)**
- **Network policies must isolate microservices**
- **Service accounts must have minimal RBAC permissions**
- **Audit logs for all event publishing/consumption**
- **Rate limiting on event publishing to prevent abuse**

---

## Deployment Standards

Frontend must deploy to Vercel **or Kubernetes**. Backend must be containerizable **and deployed to Kubernetes**. All environment variables must be documented in .env.example. Database migrations must be version controlled. All services must have health check endpoints. **OpenAI domain allowlist must be configured before production deployment. MCP server must be tested in production-like environment. Chat endpoint must handle production load (concurrent conversations).**

**Phase IV Requirements:**
- **All services must be containerized (Docker)**
- **All deployments must use Helm charts (no raw YAML)**
- **Minikube required for local Kubernetes development**
- **All configuration via ConfigMaps and Secrets**
- **Health checks and readiness probes required**
- **Resource limits defined for all pods**
- **Deployment must be reproducible (Infrastructure as Code)**
- **Zero application behavior drift from Phase III**

**NEW Phase V Requirements:**
- **All microservices deployed to Kubernetes (Minikube local, OKE production)**
- **Dapr control plane installed on all clusters**
- **Kafka cluster deployed via Strimzi operator**
- **All Dapr components configured via Kubernetes CRDs**
- **Event-driven workflows tested end-to-end before deployment**
- **CI/CD pipeline automated via GitHub Actions**
- **Deployment to OCI free tier (no paid services)**
- **Zero-downtime deployments with rolling updates**
- **Automated rollback on deployment failure**
- **Smoke tests run after every deployment**
- **All services must fit within OCI free tier resource limits**
- **Monitoring and alerting configured (Prometheus + Grafana)**

---

## **Success Criteria (Updated for Phases 3, 4 & 5)**

Users can sign up and sign in successfully. Each user can only see and manage their own tasks. All CRUD operations work correctly. JWT authentication works end-to-end. Frontend and backend communicate properly via API. Application works when deployed (not just locally). No security vulnerabilities in authentication flow. Database properly isolates user data.

**Phase 3 Criteria:**
- **Users can manage tasks via natural language chat interface**
- **Agent correctly interprets all 5 task operation intents**
- **Conversation history persists across server restarts**
- **Multiple conversations can exist per user**
- **Agent responses are conversational and helpful**
- **All MCP tools execute correctly when called by agent**
- **User data isolation maintained in chat interactions**
- **ChatKit UI properly configured and deployed**
- **OpenAI domain allowlist configured correctly**
- **No conversation state lost on backend restart (stateless verification)**

**Phase 4 Criteria:**
- **Fresh Minikube cluster deploys successfully from Helm charts**
- **Frontend, backend, and MCP server run correctly in Kubernetes**
- **Chat functionality behaves identically to Phase III (zero drift)**
- **Application survives pod restarts without state loss**
- **Helm install / upgrade / uninstall works cleanly**
- **All secrets managed via Kubernetes Secrets (not hardcoded)**
- **Pods run as non-root users (security compliance)**
- **Resource limits prevent resource exhaustion**
- **Health checks enable automatic pod recovery**
- **Local deployment reproducible on any developer machine**

**NEW Phase 5 Criteria:**

**Part A - Advanced Features:**
- **Users can create recurring tasks (daily, weekly, monthly patterns)**
- **Users can set due dates and receive reminders**
- **Users can assign priorities (high, medium, low) to tasks**
- **Users can add tags to tasks for organization**
- **Users can search and filter tasks by multiple criteria**
- **Users can sort tasks by various fields (date, priority, title)**
- **All advanced features work via chat interface (natural language)**

**Part B - Event-Driven Architecture:**
- **All task operations publish events to Kafka successfully**
- **Notification Service receives and processes task events**
- **Recurring Task Service generates tasks based on patterns**
- **Events maintain order for same task (partition key working)**
- **Event schema validation passes for all events**
- **Dead letter queue handles failed event processing**
- **Event replay works correctly (idempotent handlers)**

**Part C - Dapr Integration:**
- **All 5 Dapr building blocks operational (Pub/Sub, State, Service Invocation, Jobs, Secrets)**
- **Services communicate only via Dapr (no direct calls)**
- **Dapr Pub/Sub abstracts Kafka successfully**
- **Dapr Jobs API schedules reminders correctly**
- **Dapr State Management stores conversation state**
- **Dapr Secrets API provides secure secret access**
- **Dapr mTLS secures service-to-service communication**

**Part D - Microservices:**
- **Task Service, Notification Service, Recurring Task Service all operational**
- **Each service independently deployable**
- **Service failures don't cascade (circuit breakers work)**
- **Services scale independently**
- **Each service has own database/state (bounded contexts)**

**Part E - Local Deployment (Minikube):**
- **Kafka cluster deploys successfully via Strimzi**
- **Dapr control plane installs correctly**
- **All microservices deploy with Dapr sidecars**
- **Event-driven workflows work end-to-end locally**
- **All Dapr components configured and functional**

**Part F - Cloud Deployment (Oracle Cloud):**
- **OKE cluster created within free tier limits**
- **All services deploy to OKE successfully**
- **Kafka cluster runs on OKE (Strimzi)**
- **Application fits within 4 OCPU, 24GB RAM limits**
- **CI/CD pipeline deploys automatically via GitHub Actions**
- **Zero-downtime deployments work (rolling updates)**
- **Monitoring and logging operational (Prometheus + Grafana)**
- **Application accessible via OCI Load Balancer**

---

## **Quality Gates (Updated for Phases 3, 4 & 5)**

All API endpoints return proper status codes. All forms validate user input before submission. All errors show user-friendly messages. Application handles network errors gracefully. No TypeScript errors in frontend. No Python type errors in backend. Database schema matches SQLModel definitions.

**Phase 3 Quality Gates:**
- **All natural language test scenarios pass (add, list, complete, delete, update)**
- **Agent does not hallucinate or invent tasks**
- **Conversation persistence verified after backend restart**
- **Multi-user chat isolation verified (user A cannot see user B's chats)**
- **MCP tools handle all edge cases (invalid IDs, missing parameters)**
- **Chat endpoint handles concurrent requests without corruption**
- **OpenAI API errors handled gracefully (retry, fallback messages)**
- **ChatKit renders properly across browsers (Chrome, Firefox, Safari)**

**Phase 4 Quality Gates:**
- **All Docker images build successfully without errors**
- **All Helm charts pass linting (helm lint)**
- **Helm dry-run succeeds before actual deployment**
- **All pods reach Ready state within 60 seconds**
- **Health checks pass for all services**
- **No secrets in container images or Helm values files**
- **All containers run as non-root (verified via securityContext)**
- **Resource limits prevent OOMKilled errors**
- **Application behavior identical to Phase III (regression testing)**
- **Deployment reproducible across different machines**

**NEW Phase 5 Quality Gates:**
- **All event schemas validate against defined JSON schemas**
- **Event handlers are idempotent (replay safe)**
- **Kafka topics created with correct partition/replication config**
- **All Dapr components pass validation (dapr components)**
- **Dapr sidecars inject successfully for all services**
- **Event ordering maintained for same aggregate (partition key)**
- **Dead letter queue captures failed events**
- **No direct Kafka client code (only Dapr Pub/Sub)**
- **No direct service-to-service HTTP calls (only Dapr)**
- **All microservices independently deployable**
- **Service failures don't cascade (circuit breakers work)**
- **Recurring task generation works correctly (cron patterns)**
- **Reminders scheduled and sent correctly (Dapr Jobs API)**
- **Advanced features (priority, tags, due dates) work via chat**
- **Search and filter return correct results**
- **Database migrations backward-compatible**
- **CI/CD pipeline runs successfully end-to-end**
- **Deployment to OKE succeeds within free tier limits**
- **Zero-downtime deployments verified (rolling updates)**
- **Monitoring dashboards show all services healthy**
- **Event tracing works across services (correlation IDs)**

---

## Development Workflow

### Agentic Dev Stack Adherence
All development must follow the Agentic Dev Stack workflow: spec → plan → tasks → implementation. Each phase must be completed before moving to the next, with proper documentation and validation at each step. **All AI agent features must be spec-driven. MCP tool definitions must be planned before implementation. Conversation flows must be documented in specs. Infrastructure changes must follow same workflow (spec → plan → tasks → implementation). Event-driven architecture must be spec-driven. Microservices boundaries must be planned before implementation. Dapr component configurations must be documented in specs.**

### Spec-Driven Development
Spec-driven development (spec → plan → tasks → implementation) is mandatory. All features must begin with a clear specification that defines scope, requirements, acceptance criteria, and success metrics before any implementation begins. **AI agent system prompts must be specified before coding. Natural language test scenarios must be part of acceptance criteria. Deployment architecture must be specified before containerization. Event schemas must be documented before implementation. Microservices communication patterns must be specified upfront.**

### Success Criteria Enforcement
Success criteria must be met before considering any feature complete. **Phase 5 must meet all Phase 2 criteria PLUS Phase 3 criteria PLUS Phase 4 criteria PLUS new event-driven, microservices, and cloud deployment criteria listed above.**

### **Blueprint-Based Infrastructure (NEW - Phase V)**
**Infrastructure deployment must follow blueprint patterns. Kafka cluster deployment via Strimzi blueprints. Dapr installation via official Helm charts. OKE cluster setup via Terraform or OCI CLI (documented). CI/CD pipelines via GitHub Actions templates. All infrastructure changes version-controlled and reproducible.**

---

## **Tool Execution Standards**

### **Atomicity**
**Each tool execution must be atomic (complete or fail, no partial states). Failed tool execution must not corrupt database. Agent must report tool failures clearly to user.**

### **Idempotency**
**Where possible, tools should be idempotent (safe to retry). Duplicate add_task calls should be handled intelligently (warn user). Complete already-completed tasks should be no-op, not error.**

### **Audit Trail**
**All tool executions should be logged with: user_id, tool_name, parameters, result, timestamp. Logs should be queryable for debugging. Failed tool executions must be logged with error details.**

---

## Governance

All development activities must comply with these constitutional principles. Any deviation requires formal amendment to this constitution with proper justification and approval. All pull requests and code reviews must verify compliance with these principles before approval. **AI agent behavior changes require constitutional review. MCP tool additions require spec and constitutional approval. Infrastructure changes require constitutional review (Phase IV). Event schema changes require constitutional review (Phase V). Microservices boundary changes require architectural review and constitutional approval. Dapr component additions require spec and constitutional approval.**

---

## **Architecture Decision Guidelines (NEW - Phase V)**

### **When to Use Kafka vs Direct Calls**
**Use Kafka (Event-Driven) for:**
- Task state changes (created, updated, deleted, completed)
- Notifications and reminders (asynchronous by nature)
- Recurring task generation (scheduled events)
- Cross-service communication where eventual consistency acceptable
- Operations that need audit trail (event log)
- Fan-out scenarios (one event, multiple consumers)

**Use Direct Calls (Request-Response) for:**
- User authentication (immediate response required)
- Task queries (list, get) - read operations
- Real-time validation (form submission feedback)
- Operations requiring immediate consistency
- Frontend to backend API calls

**Rule of Thumb:** Commands → Events (async), Queries → Direct calls (sync)

### **When to Use Dapr vs Native Libraries**
**Use Dapr for:**
- All service-to-service communication (Service Invocation)
- All event publishing/subscribing (Pub/Sub)
- All state management (State API)
- All secret access (Secrets API)
- All scheduled jobs (Jobs API)
- Cross-cutting concerns (retry, timeout, tracing)

**Use Native Libraries for:**
- Database access (SQLModel ORM)
- Business logic implementation
- Data validation (Pydantic)
- Frontend UI components (React, Next.js)
- Testing frameworks (pytest, jest)

**Rule of Thumb:** Infrastructure concerns → Dapr, Business logic → Native libraries

### **Event Schema Design Principles**
**All events must include:**
- `event_id` - Unique identifier (UUID)
- `event_type` - Semantic type (task.created, task.updated)
- `aggregate_id` - Entity ID (task_id)
- `user_id` - User who triggered event
- `timestamp` - ISO8601 timestamp
- `correlation_id` - For distributed tracing
- `payload` - Event-specific data
- `metadata` - Service name, version

**Schema versioning:**
- Add new fields (backward compatible)
- Never remove fields (deprecate instead)
- Version in metadata.version field
- Support multiple versions simultaneously

### **Microservices Communication Patterns**

**Pattern 1: Command → Event → Handler**
```
Frontend → Task Service (REST API)
Task Service → Publishes event → Kafka
Notification Service ← Subscribes ← Kafka
Notification Service → Schedules reminder (Dapr Jobs)
```

**Pattern 2: Query → Direct Response**
```
Frontend → Task Service (REST API)
Task Service → Database (read)
Task Service → Response → Frontend
```

**Pattern 3: Scheduled Job → Event**
```
Dapr Jobs API → Triggers → Recurring Task Service
Recurring Task Service → Generates task → Publishes event → Kafka
Task Service ← Subscribes ← Kafka → Creates task instance
```

### **Testing Event-Driven Flows**
**Local testing (Minikube):**
1. Deploy Kafka cluster (Strimzi)
2. Deploy all microservices with Dapr sidecars
3. Publish test event to Kafka
4. Verify event consumed by subscriber
5. Check database for expected state changes
6. Verify correlation IDs in logs

**Integration testing:**
- Use Testcontainers for Kafka
- Mock Dapr components for unit tests
- End-to-end tests in staging environment
- Chaos testing (kill pods, network failures)

---

## **Phase V Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                    Chat Interface + Task UI                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (JWT Auth)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Task Service (FastAPI)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ REST API     │  │ MCP Tools    │  │ Auth         │          │
│  │ Endpoints    │  │ (AI Agent)   │  │ (JWT)        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                             │                                    │
│                             ▼                                    │
│                    ┌─────────────────┐                          │
│                    │ Dapr Sidecar    │                          │
│                    │ - Pub/Sub       │                          │
│                    │ - State         │                          │
│                    │ - Secrets       │                          │
│                    └─────────────────┘                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ Publishes Events
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    Apache Kafka (Strimzi)                        │
│  Topics: task-events, reminders, recurring-tasks                │
└────────────┬────────────────────────────────────┬───────────────┘
             │                                    │
             ▼                                    ▼
┌────────────────────────────┐    ┌─────────────────────────────┐
│  Notification Service      │    │ Recurring Task Service      │
│  ┌──────────────────────┐  │    │ ┌─────────────────────────┐ │
│  │ Event Handler        │  │    │ │ Pattern Manager         │ │
│  │ (task.created)       │  │    │ │ (cron patterns)         │ │
│  └──────────────────────┘  │    │ └─────────────────────────┘ │
│           │                 │    │           │                 │
│           ▼                 │    │           ▼                 │
│  ┌──────────────────────┐  │    │ ┌─────────────────────────┐ │
│  │ Dapr Sidecar         │  │    │ │ Dapr Sidecar            │ │
│  │ - Jobs API           │  │    │ │ - Jobs API              │ │
│  │ - Pub/Sub            │  │    │ │ - Pub/Sub               │ │
│  └──────────────────────┘  │    │ └─────────────────────────┘ │
└────────────────────────────┘    └─────────────────────────────┘
             │                                    │
             └────────────────┬───────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Neon PostgreSQL  │
                    │ (External)       │
                    └──────────────────┘

Deployment Targets:
- Local: Minikube (1 Kafka broker, minimal resources)
- Production: Oracle Cloud OKE (3 Kafka brokers, HA setup)
```

---

**Version**: 3.0.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-12
**Phase**: 5 - Advanced Cloud Deployment (Event-Driven + Dapr + OCI)
**Previous Version**: 2.1.0 (Phase 4 - Local Kubernetes Deployment)

**Major Changes in v3.0.0:**
- Added Event-Driven Architecture with Apache Kafka
- Added Dapr integration (all 5 building blocks)
- Added Microservices architecture (3 services)
- Added Oracle Cloud Infrastructure deployment
- Added CI/CD with GitHub Actions
- Added advanced task features (recurring, priorities, tags, due dates)
- Added comprehensive event schema standards
- Added architecture decision guidelines

