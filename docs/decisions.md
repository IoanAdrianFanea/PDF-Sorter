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
- Admins can do all of that plus delete documents, manage projects, and manage users

Rationale: shared visibility requires authorization boundaries. Delete and management actions must be restricted without complex permissions.

---

## Upload Restricted to Assigned Projects (non-admins)

Non-admin users can only upload to projects they are members of via `ProjectMembership`.

Rationale: prevents users from adding documents to unrelated projects by mistake.

---

## Admin-Only Delete

Only admins can delete documents.

Rationale: deletion is irreversible. In a shared company system, accidental or malicious deletion must be restricted.

---

## Admin-Controlled User Creation

Users are created by admins via `POST /users`. Self-registration via `POST /auth/register` still exists but may be restricted in a later phase.

Rationale: for an internal company tool, it makes more sense for an admin to provision accounts rather than allow open sign-up.

---

## Image Upload Without OCR

Images (JPEG, PNG) are accepted on upload but text extraction is skipped. Status is set to `PROCESSED` with no `DocumentText` record.

Rationale: OCR requires a separate library (`tesseract.js`) and adds complexity. Storing images now without OCR unblocks the use case. OCR will be added in Phase 5 without changing the upload contract.

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

Current: `{userId}/{documentId}.{ext}` where ext is derived from mime type.

Extension mapping: `application/pdf` → `.pdf`, `image/jpeg` → `.jpg`, `image/png` → `.png`.

---

## Web-First Delivery

The current frontend is a browser web app.

Rationale: fastest way to validate workflows. Stakeholders have expressed interest in Windows and Android native apps. The backend is intentionally API-first so a native client can be added later. The web frontend is treated as the primary interface until workflows are stable enough to justify a native build.

---

## No Tags

Tags were removed as a core feature during the Phase 0.5 refactor.

Projects are the organising structure. Tags added complexity without matching how the business actually groups documents.

---

## Two User Creation Methods (create vs createUser)

`UsersService` has two creation methods intentionally:

- `create(email, passwordHash)` — used by auth during self-registration. Auth service handles hashing before calling this.
- `createUser(dto)` — used by the admin endpoint. Accepts a plain password and hashes it internally.

They serve different callers with different contracts. Merging them would either expose hashing logic to the auth service or force the admin endpoint into an awkward flow. Kept separate for clarity.