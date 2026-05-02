# Technical Decisions

Key decisions made during development, with rationale.

---

## Shared Company Document Model

Documents are company-visible by default.

Rationale: the workflow is collaborative. Users are not managing private libraries. The main business problem is retrieval speed, not user isolation. `uploadedBy` is stored for traceability but does not restrict access.

---

## Project-First Organisation

Projects are the primary organising entity. Documents belong to projects.

Rationale: the business already organises documents by project. It matches how users look for things in real life.

---

## Role-Based Authorization

Two roles: USER and ADMIN.

- Users can upload to assigned projects, and browse/search/download/export everything
- Admins can do all of that plus delete documents and upload to any project

Rationale: shared visibility requires authorization boundaries. Delete and user-management actions must be restricted without complex permissions.

---

## Upload Restricted to Assigned Projects (non-admins)

Non-admin users can only upload to projects they are members of via `ProjectMembership`.

Rationale: prevents users from adding documents to unrelated projects by mistake.

---

## Admin-Only Delete

Only admins can delete documents.

Rationale: deletion is irreversible. In a shared company system, accidental or malicious deletion must be restricted.

---

## Synchronous Processing First

Text extraction runs synchronously on upload. No queue or worker yet.

Rationale: simpler to build and debug. Still correct. A queue-based pipeline is planned for Phase 3 when scale demands it.

---

## SQLite for Development

SQLite via Prisma for the current phase.

Rationale: zero infrastructure, fast iteration. Prisma abstracts the database layer, so migration to Postgres is straightforward later if needed.

---

## Storage Abstraction

Files are stored behind a `BlobStore` interface. Current implementation is `LocalBlobStore`.

Rationale: keeps business logic storage-agnostic. An S3-compatible implementation can be added in Phase 4 without touching service code.

---

## Storage Key Format

Current: `{userId}/{documentId}.pdf`

Note: the architecture document originally suggested `{projectId}/{documentId}`. The current format pre-dates project association. This should be revisited when image upload support is added, as it will also require a more generic key structure (no `.pdf` extension assumption).

---

## Web-First Delivery

The current frontend is a browser web app.

Rationale: fastest way to validate workflows. Stakeholders have expressed interest in Windows and Android native apps. The backend is intentionally API-first so a native client can be added later. The web frontend is treated as the primary interface until workflows are stable enough to justify a native build.

---

## No Tags

Tags were removed as a core feature during the Phase 0.5 refactor.

Projects are the organising structure. Tags added complexity without matching how the business actually groups documents.
