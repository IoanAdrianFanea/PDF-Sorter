# Copilot Rules – PDF Sorter / Indexer

Goal:
- Implement features using normal professional standards.
- Keep project structure clean and conventional.
- Optimize for backend hiring signal (auth, authz, async, reproducibility, deployability).
- Documentation must stay simple.
- Do NOT edit documentation until I explicitly say: "update documentation now".


============================
1) STACK
============================

Frontend
- React + Vite + TypeScript
- react-router-dom for routing

Backend
- NestJS + TypeScript

Database
- SQLite (MVP) with FTS5

PDF Extraction
- pdf-parse (or another reasonable library if needed)

Async Queue (Phase 3)
- Redis + BullMQ (standard with Nest)

File Storage
- Local filesystem for dev/MVP
- Storage abstraction layer so it can switch to S3 later

Dependencies
- You may add libraries if they clearly help.
- Use them in a normal, standard way.
- Prefer widely-used libraries and keep the dependency list small.


============================
2) STRUCTURE RULES (IMPORTANT)
============================

Keep structure professional and conventional.

Backend (NestJS)
- Use standard Nest structure:
  - Modules
  - Controllers
  - Services
  - (Optional) Repositories / data access layer
- Keep controllers focused on routing + validation.
- Put business logic inside services.
- Use DTOs for request bodies and query params.
- Use class-validator + class-transformer for validation.
- Use dependency injection properly.
- Centralize error handling (filters/interceptors) instead of ad-hoc try/catch everywhere.
- Enforce authorization in service layer (not just controller checks).

Frontend (React)
- Use routing:
  - /login
  - /documents
  - /documents/:id (opens document drawer)
  - /jobs
  - /jobs/:id (opens job drawer)
- Organize code into folders:
  - pages/
  - components/
  - hooks/
  - api/ (client wrappers)
  - types/
- Keep UI simple and clean.
- Avoid putting everything inside one file long-term.
  (One-file prototype is allowed temporarily, then refactor into standard structure.)
- Keep state in page-level components and pass props down.


============================
3) PROJECT SCOPE + PRIORITIES
============================

The project is a document indexing + organization tool with production realism.

Must-have user features:
- Login/logout
- Upload PDFs (single/multiple)
- Document status: UPLOADED/QUEUED/PROCESSING/PROCESSED/FAILED
- Search (FTS) with snippets
- Tags (manual tagging + filtering)
- Download PDFs
- Export selected/filtered docs as ZIP

Must-have engineering signals:
- Strict per-user ownership boundaries (authz everywhere)
- Reproducible setup (migrations, .env.example, clean run commands)
- Structured logging with request IDs + basic timings
- Swagger/OpenAPI for API docs
- A few high-value tests (especially authorization)

Later phases:
- API + Worker split
- Queue jobs for processing and exports
- Job status endpoints and UI (Jobs page)


============================
4) AUTH / AUTHZ RULES (CRITICAL)
============================

- Every document/tag/export must be scoped to the authenticated user.
- User A must never access User B's documents (IDOR protection).
- Apply ownership filtering at query level (ownerId in WHERE clause).
- Never trust client-provided ownerId.
- Prefer server-side derived userId from auth context.

Minimum tests to include (high priority):
- User A cannot download User B document
- User A cannot export User B documents
- User A cannot fetch User B document by id
- (Optional) search/list returns only user-owned docs


============================
5) ASYNC / QUEUE RULES (WHEN IMPLEMENTED)
============================

- Keep Phase 1 synchronous if needed, but keep the status model from day 1.
- When queue is introduced:
  - API handles upload + enqueue
  - Worker handles extraction/indexing/export
- Jobs must update document/export status deterministically.
- On failure: mark FAILED and store a safe error message.
- Provide basic retry mechanism (simple endpoint is fine).


============================
6) STORAGE RULES
============================

- All file operations go through a storage abstraction (BlobStore).
- Local storage is used in dev/MVP.
- Swapping to S3 must not require rewriting business logic.
- Do not mix storage logic into controllers.


============================
7) OVERENGINEERING
============================

- Keep a clean modular monolith.
- Do not introduce microservices, Kafka, CQRS, event sourcing, Kubernetes, etc.
- Avoid enterprise patterns unless explicitly asked.
- Solve the problem directly and cleanly.


============================
8) DOCUMENTATION RULES (MOST IMPORTANT)
============================

CRITICAL RULE:
- When implementing a feature, DO NOT modify any documentation files.
- Only update documentation after I explicitly say:
  "update documentation now".

While coding:
- Focus only on code.
- If documentation will need updating, mention it in chat,
  but do not edit files.


============================
9) DOCUMENTATION STYLE
============================

Documentation must be:
- Simple language
- Short sentences
- Bullet points preferred
- No academic vocabulary
- No long theoretical explanations
- Focused on what the system does and why


============================
10) WHAT EACH DOC FILE IS FOR
============================

docs/roadmap.md
- High-level phases.
- Changes rarely.

docs/project-plan.md
- Goals, scope, stack, milestones.

docs/architecture.md
- Big picture components.
- Mention API + Worker + Queue once Phase 3 exists.

docs/system-design.md
- Runtime flows:
  upload → store → extract → index → search
  export → zip → download
- Include async version once queue exists.

docs/api-design.md
- Endpoints with small JSON examples only.
- Swagger is the source of truth; this file is a quick overview.

docs/decisions.md
- Key decisions + 2-3 bullets why.
- Keep entries brief.


============================
11) WORKFLOW WITH COPILOT
============================

1. Implement one feature.
2. I review and refine it.
3. When I say "update documentation now",
   update only the relevant docs.
4. Do not rewrite unrelated documentation sections.



============================
12) LEARNING PRIORITY (CRITICAL)
============================

This project is also for learning.

When generating or refactoring code:

- Focus explanations on React fundamentals and TypeScript types.
- Do NOT explain CSS or styling unless explicitly asked.
- Keep patterns conventional and interview-safe.
- Avoid obscure or overly clever patterns.

If using:
- useEffect
- useState
- routing
- union types
- async/await
- generic components

Briefly explain in simple terms why they are used.

Goal:
I want to be able to:
- Review Copilot-generated code confidently.
- Spot common React mistakes.
- Explain React fundamentals in interviews.
- Explain TypeScript types used in this project.