# AI Secrets Management on OpenShift — Product Requirements Document (PRD)

**Doc owner**: Peter Double, Principal Product Manager, OpenShift AI
**Engineering leads**: TBD
**Design lead**: TBD
**Version**: 1.0
**Last updated**: Aug 14, 2025

---

## 1) Executive Summary

Enterprise AI teams on Red Hat OpenShift AI need a secure, unified way to manage and inject secrets into MCP servers, agents, notebooks, pipelines, and apps. This product provides a PatternFly-based UI and API for bring‑your‑own (BYO) secret backends such as HashiCorp Vault, AWS Secrets Manager, and Azure Key Vault, with first-class OpenShift integration, RBAC, audit, and ephemeral secret injection into workloads. Values are never stored in plaintext by the product, only references and metadata.

**Primary value**

* Centralize configuration of secret providers across clusters and projects
* Standardize secret reference patterns for MCP env vars and tool credentials
* Enforce RBAC, audit, and policy controls without slowing delivery
* Support enterprise compliance while enabling self-service for AI engineers

**MVP outcome**

* One fully working provider integration end‑to‑end (proposed: HashiCorp Vault) with Add/Edit/Delete flows
* Reference-based secret binding to MCP environment variables and Jupyter runtimes
* Zero plaintext persistence, full audit, and OpenShift-native authZ

---

## 2) Problem Statement

AI teams use ad‑hoc methods for storing API keys and credentials for MCP servers and RAG services. Secrets are duplicated across namespaces and notebooks, rotated inconsistently, and audited poorly. Platform teams lack a consistent, policy‑enforced, and UI‑driven approach that works with their existing enterprise secret stores.

---

## 3) Goals and Non‑Goals

**Goals**

* Provide a unified UI and API to register and manage external secret providers
* Allow users to create secret bindings and map them to environment variables for MCP servers, agents, and runtimes
* Enforce organization, project, and namespace RBAC with full audit trails
* Support ephemeral secret retrieval and runtime injection without persisting values
* Provide import and discovery of existing secrets from a connected provider
* Deliver one E2E provider in MVP with a pluggable design to add others quickly

**Non‑Goals (MVP)**

* Automatic rotation orchestration across providers
* Secrets value editing inside our UI for external providers
* Cross‑cluster replication of provider credentials
* Service-to-service brokering outside of OpenShift workloads
* CLI and Terraform modules, to be targeted in V1.x

---

## 4) Users and Personas

* **AI Engineer**: Creates MCP servers and agents, needs to bind API keys safely
* **Data Scientist**: Launches notebooks and pipelines, needs temporary access to data credentials
* **Platform Engineer**: Configures providers, policies, RBAC, ensures compliance
* **Security/GRC Analyst**: Reviews audit trails and policy attestation
* **Org Admin**: Delegates access across orgs and projects

---

## 5) Scope

**In scope (MVP)**

* Provider connections: Vault (AppRole and Kubernetes auth), AWS Secrets Manager, Azure Key Vault (design and stubs for all, one fully functional E2E in MVP)
* Secret reference model with versioning and labels
* Bindings to MCP env vars and runtime variables for notebooks and jobs
* Policy guardrails: who can bind which secret to which target
* RBAC roles: Org Admin, Project Admin, Secret Editor, Secret Viewer
* Audit log and export to enterprise SIEM via webhook
* OpenShift integration: OAuth/OIDC, namespaces, service accounts

**Future (V1.x)**

* Rotation policies and reminders
* CLI and Terraform provider
* GitOps reconciliation and drift detection
* Native support for GCP Secret Manager
* Bulk operations and templates library

---

## 6) Success Metrics

* 80% of MCP servers in pilot projects use centralized secret bindings within 60 days of launch
* 100% of secret access events are auditable with principal, target, and outcome
* < 250 ms P50 retrieval latency per secret at injection time under typical load
* Zero critical security findings in internal red‑team review

---

## 7) User Stories & Acceptance Criteria (MVP)

### 7.1 Configure a secret provider

**Story**: As a Platform Engineer, I connect our Vault cluster so teams can bind secrets

**Acceptance criteria**

* I can select provider type and auth method and test connectivity
* I can scope the provider to specific orgs/projects/namespaces
* I can store only credentials necessary for the handshake, encrypted with KMS
* Connectivity test and health status are visible in UI and API

### 7.2 Discover and register secrets

**Story**: As an AI Engineer, I can browse available secrets and register references for use

**Acceptance criteria**

* I can filter by path, tag, last rotated date, and owner
* I can create a Secret Reference without retrieving the plaintext value
* I can mark a reference as required or optional in a template
* UI never displays plaintext values, only reference metadata

### 7.3 Bind secrets to MCP server env vars

**Story**: As an AI Engineer, I can bind secret references to environment variables on my MCP server or agent

**Acceptance criteria**

* I can add, edit, remove bindings in a single panel
* Validation ensures I have permission to bind the chosen secret to the target
* On deploy, the runtime receives resolved env vars via ephemeral injection
* Audit event records principal, secret ref, target object, and status

### 7.4 Notebook and job runtime bindings

**Story**: As a Data Scientist, I can attach secret references to notebook pods and batch jobs

**Acceptance criteria**

* I can attach bindings at project or per‑runtime level
* Revoking a binding prevents new pod mounts without affecting running pods
* Rotation reminder shows age and last used timestamp

### 7.5 RBAC and policy enforcement

**Story**: As an Org Admin, I can delegate who may bind which secrets to which targets

**Acceptance criteria**

* Policy matrix supports allow/deny by role, provider, path prefix, and target type
* Conflict resolution is deterministic and surfaced in UI
* Policy changes are versioned and auditable

### 7.6 Audit and export

**Story**: As a Security Analyst, I can view and export an immutable audit log

**Acceptance criteria**

* Every access, bind, rotate, revoke, and failure is recorded with timestamp, actor, target, correlation ID
* Export via API and webhook in JSONL format
* Tamper‑evident storage using append‑only backend with periodic hash anchoring

---

## 8) UX Requirements

**Design principles**

* Security‑forward defaults and least privilege
* Clear separation between references and values
* Familiar PatternFly components and OpenShift look‑and‑feel

**Key screens**

1. **Providers** list with health, scope, and auth method
2. **Provider details** with connection config, scopes, and status history
3. **Secrets catalog** showing external secrets, tags, version, last rotation
4. **Secret reference** details and bindings tab
5. **Bindings** panel inside MCP server, agent, notebook, and job configuration
6. **Policies** matrix editor and simulator
7. **Audit** explorer with filters and export

**Accessibility**

* WCAG 2.2 AA compliant UI controls and focus states

---

## 9) Functional Requirements

**R1 Provider management**

* Create, read, update, disable providers with scoped visibility
* Supported auth modes in MVP design: Vault AppRole, Vault Kubernetes auth, AWS IAM role via STS, Azure workload identity

**R2 Secret discovery**

* List secrets from provider by path prefix and tags without fetching values
* Show metadata: name, path, labels, last rotated, version count, owner when available

**R3 Secret references**

* Internal object stores only provider ID, external path, optional version selector, and labels
* References are globally unique per project and can be templated

**R4 Bindings**

* Map reference → env var name for a target runtime
* Support required/optional and default fallback values defined by policy

**R5 Injection**

* Resolve references at deploy or pod admission time
* Inject via ephemeral volume or env var set from in‑memory retrieval
* No plaintext values persisted to DB, logs, or CRDs

**R6 RBAC & policy**

* Role model: Org Admin, Project Admin, Secret Editor, Secret Viewer
* Policy matrix by provider, path prefix, target type, and action

**R7 Audit**

* Immutable append‑only log with JSONL export and webhook

**R8 Error handling**

* Clear error codes for auth failures, permission denials, missing versions, rate limits

**R9 Multi‑tenancy**

* Hard isolation by namespace with optional org scoping for shared providers

**R10 API coverage**

* 100% UI functionality available via REST/JSON and OpenAPI spec

---

## 10) Non‑Functional Requirements

* **Security**: FIPS‑compatible crypto, envelope encryption with cluster KMS, mTLS everywhere
* **Performance**: P50 < 250 ms per secret retrieval, P95 < 500 ms under 500 QPS cluster‑wide
* **Scalability**: 10k registered references per project, 100k per cluster
* **Reliability**: 99.9% monthly availability target, graceful degradation when a provider is degraded
* **Observability**: Metrics, traces, and logs with OpenTelemetry and Prometheus
* **Compliance**: SOC 2 Type II alignment; FedRAMP ready posture where applicable

---

## 11) Architecture Overview

**High‑level components**

* **UI**: PatternFly React app embedded in RHOAI console
* **API service**: Quarkus or Node/TypeScript service with OpenAPI, mTLS, OIDC authN via OpenShift OAuth
* **Provider plugins**: Isolated connectors for Vault, AWS, Azure with clear interfaces
* **Policy engine**: Deterministic evaluator for allow/deny decisions
* **Injection controller**: Kubernetes controller or admission webhook to resolve references and inject at runtime
* **Audit service**: Append‑only store with periodic hash chaining and export webhooks

**OpenShift integrations**

* OAuth for SSO and identity mapping to RBAC
* ServiceAccounts and Secrets CSI where applicable
* Optional External Secrets Operator for sync scenarios when required by policy

**Secret reference syntax**

* `secretref://<provider>/<path>[#version]` used internally and surfaced in UI

---

## 12) Data Model (MVP)

**Provider**

* id, type, name, auth\_method, scopes, status, created\_by, created\_at, updated\_at

**SecretReference**

* id, provider\_id, path, version\_selector, labels, owner\_project, created\_by, created\_at

**Binding**

* id, target\_kind, target\_id, env\_name, reference\_id, required, created\_by, created\_at

**Policy**

* id, scope, subject\_roles\[], provider\_ids\[], path\_prefixes\[], target\_kinds\[], actions\[], effect

**AuditEvent**

* id, ts, actor, action, target, provider\_id, path\_hash, outcome, correlation\_id

---

## 13) APIs (illustrative)

**Create provider**

```
POST /api/v1/providers
{
  "type": "vault",
  "name": "corp-vault",
  "auth_method": "approle",
  "config": { "address": "https://vault.corp:8200" },
  "scopes": { "orgs": ["Finance"], "projects": ["GenAI"] }
}
```

**List secrets (metadata only)**

```
GET /api/v1/providers/{id}/secrets?path=kv/data/&tag=prod
```

**Create secret reference**

```
POST /api/v1/references
{
  "provider_id": "p-123",
  "path": "kv/data/openai/api-key",
  "version_selector": "latest",
  "labels": {"team":"mlops"}
}
```

**Bind reference to MCP env var**

```
POST /api/v1/bindings
{
  "target_kind": "mcp-server",
  "target_id": "mcp-abc",
  "env_name": "OPENAI_API_KEY",
  "reference_id": "r-789",
  "required": true
}
```

**Resolve at runtime (controller to provider plugin)**

```
POST /internal/resolve
{
  "reference_id": "r-789",
  "service_account": "mcp-abc-sa",
  "pod_uid": "...",
  "correlation_id": "..."
}
```

---

## 14) Security & Compliance

* No plaintext secret values stored or logged by product
* Envelope encryption with cluster KMS for any provider credential material
* mTLS between services and to provider endpoints where supported
* Admission webhook runs with least privilege and is namespace‑scoped
* Audit log is append‑only with periodic Merkle hash anchoring
* Support for customer‑managed keys and FIPS mode clusters

---

## 15) RBAC Model

* **Org Admin**: Full control within org scope
* **Project Admin**: Manage bindings and references in project
* **Secret Editor**: Create references and bindings where allowed by policy
* **Secret Viewer**: Read metadata and view bindings without values

Policy evaluation order

1. Explicit deny by path prefix or target type
2. Explicit allow by role and provider
3. Inherit project defaults

---

## 16) Observability

* Prometheus metrics: provider\_health, resolve\_latency\_ms, inject\_success\_total, inject\_failure\_total, policy\_denies\_total
* Tracing with OpenTelemetry and correlation IDs propagated to pods
* Structured logs in JSON with redaction rules

---

## 17) Migration & Compatibility

* Coexist with External Secrets Operator when teams require file‑based mounts
* Provide a shim to translate existing Kubernetes Secret refs into external references without exposing values

---

## 18) Rollout Plan

* **Alpha**: One provider fully functional E2E (Vault recommended), limited to non‑prod clusters
* **Beta**: Add AWS and Azure providers, enable webhook injection and policy simulator
* **GA**: Hardening, scale, HA, docs, and support posture

Backward compatibility

* Maintain API stability with versioned endpoints and CRDs when introduced

---

## 19) Risks & Mitigations

* **Provider API limits**: Implement caching and exponential backoff
* **Misconfigured policies**: Provide simulator and dry‑run with clear messaging
* **Secret sprawl**: Promote templates and labels, add usage analytics
* **Plaintext leakage**: Strict redaction, contract tests, and log guards

---

## 20) Open Questions

* Preferred first provider for MVP E2E: Vault vs AWS
* Do we require ESO compatibility in MVP or provide guidance only
* Should we support SOPS‑encrypted config artifacts in V1.x
* Need for cross‑cluster federation of provider connections in GA

---

## 21) Documentation & Enablement

* Admin guide for provider setup and scoping
* Engineer guide for creating references and bindings
* Security guide explaining audit, RBAC, and compliance posture
* Quickstart with sample MCP server, notebook, and agent bindings

---

## 22) Future Enhancements (V1.x and beyond)

* Automated rotation with policy hooks and notifications
* Secrets linting and drift detection in GitOps workflows
* CLI, Terraform provider, and Backstage plugin
* GCP Secret Manager and CyberArk integration
* Service account broker for temporary credentials
