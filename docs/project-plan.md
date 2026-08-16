# Project Plan – Construction Document Indexer

A multi-user document indexing and retrieval tool for construction operations teams.

---

## Current Position

**You are in Phase 2, roughly three-quarters through it.**

Three of the four Phase 2 workstreams are built and wired end to end:

- Admin console (projects, membership, users, pending registrations) — **done**
- Project-scoped visibility across list, search, read, download and export — **done**
- Registration lifecycle (PENDING accounts, email verification, admin approval, password policy) — **done**

The remaining workstream is **Delete Logging and 30-Day Recovery**, which has not been started — there is no `DeletionLog` model, no `deletedAt` column, no recycle bin, and `DELETE /documents/:id` still performs a hard delete of both the row and the file.

Three smaller Phase 2 items are also still open: the 50MB upload limit is still enforced, users cannot change their own email address, and `GET /projects` still returns every project name to any authenticated user regardless of membership.

Phases 3–7 are not started. The `/admin/filters`, `/admin/archive` and `/jobs` pages exist in the frontend as **static mock previews** of Phases 3, 4 and 6 — they render hard-coded data and call no API.

---

## Goal

Build a multi-user application for uploading, organising, searching, and retrieving project-related documents.

Primary users: procurement team, managers, quantity surveyors.

Core problems being solved:
- Time lost in manual document lookup
- No shared, searchable document store
- No project-based organisation
- No audit trail of changes or deletions

---

## Product Direction

This is a project-scoped document system. Documents belong to projects, and a user's access to documents is determined by their project assignments.

Key rules:
- Documents are scoped to projects
- Users see only documents from projects they are assigned to
- Admins see and manage everything
- All destructive actions are logged for auditing
- Self-registration requires admin approval and email verification
- `uploadedBy` is stored for traceability

**Tentative — to confirm with stakeholder:**
- Project-scoped visibility for non-admins — **now implemented in code** (a reversal of the earlier "company-wide" decision). Still needs explicit stakeholder sign-off.
- Custom filters: available to all users vs creator-only

---

## Phase 1 – Core Operational MVP

Status: **complete**

| Item | Notes |
|---|---|
| JWT authentication with access + refresh tokens | Refresh token rotation, HttpOnly cookie |
| Argon2 password hashing | |
| USER / ADMIN role model | Enforced in service layer |
| Project entity + membership | `Project` + `ProjectMembership` in schema |
| Project management endpoints | Create, update, delete, list members, add/remove members |
| User admin endpoints | List, create, get by id, set role |
| Upload authorization | Admins unrestricted; users must be project members |
| PDF + image upload + local storage | Stored under `server/data/` via `LocalBlobStore` |
| PDF text extraction | `pdf-parse`, synchronous, runs on upload |
| Image upload without extraction | JPEG + PNG supported; status set to PROCESSED, no DocumentText created |
| 50MB file size limit | Enforced at controller level |
| Document status tracking | `UPLOADED → PROCESSING → PROCESSED / FAILED` |
| Document list with filtering and sorting | Filter by project, text, date range; sort by upload date, name, status |
| Full-text search with snippets | Searches filename + extracted text, returns `<mark>` highlighted snippets |
| Document details and text preview | First 150 chars of extracted text in list response |
| Download original file | |
| Admin-only delete (single + bulk) | Role enforced in service |
| Status indicators in UI | Coloured badges per document status |
| ZIP export of selected documents | |
| Storage abstraction | `BlobStore` interface, `LocalBlobStore` implementation |

---

## Phase 2 – Access, Admin Console & Auditability

Status: **in progress** — 3 of 4 workstreams complete.

### Admin Console (UI) — complete

| Item | Status | Notes |
|---|---|---|
| Project management page | ✅ done | `AdminProjects` — create, rename, delete, list, member count |
| Project membership page | ✅ done | `ManageMembersModal` — user search, add, remove |
| User management page | ✅ done | `AdminUsers` — list, create, edit name/email/temp password, change role, delete |
| Pending registrations queue | ✅ done | `AdminPending` — approve/reject via `PATCH /users/:id/status`, rejected list included |
| Admin route guard | ✅ done | `AdminGuard` checks `role === 'ADMIN'` via `/auth/me` |

### Project-Scoped Visibility — document scoping complete, two items outstanding

| Item | Status | Notes |
|---|---|---|
| Users see only documents from assigned projects | ✅ done | `getAccessibleProjectIds` in `DocumentsService` and `ExportsService` |
| Admins see everything | ✅ done | Admins resolve to `null` (no project restriction) |
| Applies to list, search, details, text, status counts | ✅ done | |
| Applies to download and export | ✅ done | Enforced in `ExportsService` |
| Project list scoping | ⚠️ partial | `GET /projects` (default `scope=all`) returns **every** project name to any authenticated user. Only `?scope=uploadable` filters by membership. Document contents are safe, but project names leak |
| 50MB upload limit removed | ❌ not done | Still enforced twice in `documents.controller.ts` (`MAX_UPLOAD_BYTES` + Multer `limits`) |

### Authentication and Account Lifecycle — complete (two items outstanding)

| Item | Status | Notes |
|---|---|---|
| Self-registration creates a `PENDING` user | ✅ done | `accountStatus` defaults to `PENDING` in schema |
| Email sent to admin for approval | ✅ done | `EmailService.sendAdminApprovalNotification`, sent per-admin |
| Email sent to user to verify their address | ✅ done | SHA-256 hashed token, `GET /auth/verify-email`, `VerifyEmail` page |
| Both approval and verification required before login | ✅ done | Both checked in `AuthService.login` with distinct messages |
| Password policy enforcement | ✅ done | `IsStrongPassword`: min 10 chars, upper, lower, digit, special. Mirrored client-side on Register |
| Users can change their own name | ✅ done | `PATCH /auth/me` |
| Users can change their own password | ✅ done | `PATCH /auth/me/password`, revokes all refresh tokens |
| Users can change their own email | ❌ not done | `ProfileDto` accepts only `fullName`/`language`/`timezone`; the email field in `ProfileSettingsModal` is `disabled` |
| Admins can edit other users' details | ✅ done | `PATCH /users/:id` — name, email, temporary password (forces `mustChangePassword`) |

Known gaps in this workstream:
- The verification email says the link is valid for 24 hours, but no expiry is stored or checked. Tokens are currently valid indefinitely until consumed.
- The Register page collects a full name but never sends it; `UsersService.create` always writes `fullName: ''`.
- The password policy applies to `RegisterDto` and `ChangePasswordDto` only. `CreateUserDto` (admin create) has no policy at all, and `AdminEditUserDto` uses a plain 8-character minimum. This is deliberate for temporary passwords, but worth confirming.

### Delete Logging and 30-Day Recovery — not started

| Item | Status | Notes |
|---|---|---|
| All file deletions logged with actor, timestamp, project | ❌ not started | No `DeletionLog` model in the schema |
| Soft delete with 30-day restoration window | ❌ not started | No `deletedAt` column on `Document` |
| Recycle bin / restore UI for admins | ❌ not started | No route, page or API |
| Users can delete files from their assigned projects | ❌ not started | `deleteDocument` is still admin-only (`ForbiddenException` for non-admins) |
| Permanent deletion after 30 days | ❌ not started | No scheduled task |

`DocumentsService.deleteDocument` currently deletes the blob and the database row immediately and irreversibly.

---

## Phase 3 – Custom Filters & Search

Status: **not started** — UI mock exists

The `/admin/filters` page exists but is a static mock: hard-coded filter names, a disabled "Add New Filter" form, and no API calls. No `FilterDefinition` or `DocumentFilterValue` tables exist, and no OCR dependency is installed.

### Custom Filters (Admin-Configurable Fields)
- Admin defines custom filter fields via a settings page
- Maximum 5 active filters at a time
- Each filter has a name and a type (text, date, number — to be designed)
- Once created, filters are available to all users
- Filters appear on upload forms (data entry) and document list (filtering)
- Schema: `FilterDefinition` table + `DocumentFilterValue` table

### Search + Filter Together
- Users select filters and a search query together
- Both apply simultaneously to narrow results to an exact document
- Filter-only and search-only modes both still work
- Date filter applies to the document date (custom filter), not the upload date

### OCR for Images
- Pulled forward from Phase 5 — required so images participate in search
- `tesseract.js` or similar runs after image upload, populates `DocumentText`
- Same flow as PDF extraction but for JPEG/PNG

---

## Phase 4 – Archive & Storage Structure

Status: **not started** — UI mock exists

The `/admin/archive` page and `ArchiveProjectModal` exist but are presentational only — the modal has no confirm handler and the page renders hard-coded rows. `Project` has no `archivedAt` column.

### Project Archive
- Admin can archive a project from the project management page
- On archive: all project files zipped, `archivedAt` set
- On unarchive: zip extracted, files restored to original structure, `archivedAt` cleared
- Dedicated archive page lists archived projects
- Admin can download zip without unarchiving
- Admin can permanently delete archived projects

### OneDrive Storage Structure
- Root folder configurable by admin
- Inside root:
  - `active/` — folder per project containing live files
  - `archived/` — zip per archived project
  - `deleted/` — folder per project containing soft-deleted files (during 30-day window)

### File Compression
- Large files compressed before storage (threshold to be defined, suggested 5MB+)
- Compression applied where it reduces size meaningfully (PDFs and JPEGs are already compressed, may skip)

---

## Phase 5 – Deployment

Status: **not started** — SMTP brought forward into Phase 2

- HTTPS
- OneDrive integration (replaces `LocalBlobStore`)
- ~~SMTP setup for transactional emails (approval, verification)~~ — **done early**: `nodemailer` transport in `EmailService`, configured via `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`, falls back to console logging when unconfigured
- Structured logging — only Nest's default `Logger` is used today
- Environment-based configuration — partially done via `@nestjs/config` and `.env.example`
- Backup strategy
- Print document button with print preview (if time allows)

---

## Phase 6 – Async Processing

Status: **not started** — UI mock exists

- Queue-based document processing pipeline
- API + worker architecture
- Background text extraction (PDF and OCR)
- Background compression and archive jobs
- Retry failed jobs
- Job status endpoints
- Jobs page becomes real (currently mock data)

The `QUEUED` status already exists in the `DocumentStatus` enum but is never set — extraction still runs synchronously inside `uploadDocument`.

---

## Phase 7 – Future

Status: **not started**

- Native app evaluation (laptop, tablet, phone — single app, all platforms)
- Email attachment ingestion
- Offline-friendly document viewing

---

## Known Technical Notes

- Storage key format is `{userId}/{documentId}.{ext}` where ext is derived from mime type. Will change to project-based key in Phase 4.
- The `/jobs` route exists in the frontend as a mock-data preview of Phase 6 functionality. Its banner incorrectly says "Phase 3 – Async Processing"; async processing is Phase 6.
- `/admin/filters` and `/admin/archive` are likewise mock-data previews of Phases 3 and 4.
- `User` has `language`, `timezone` fields that are unused. Candidates for removal — see backlog.
- Search loads every accessible document with extracted text into memory and filters in JavaScript (`searchDocuments`). Fine at current scale, but it will need a SQL/FTS rewrite before real data volumes.
- `listDocuments` is hard-capped at 50 rows with no pagination, and search at 20.
- `AuthService.refresh` matches the most recent non-revoked token for the user rather than looking up the presented token, so concurrent sessions on multiple devices can invalidate each other.
- `POST /projects` has no membership bootstrap — a newly created project has no members until an admin adds them.

---

## Immediate Next Steps (to close Phase 2)

1. Add `deletedAt` to `Document` and a `DeletionLog` model; migrate.
2. Convert `deleteDocument` / `bulkDeleteDocuments` to soft delete plus log write, and exclude soft-deleted rows from every read path.
3. Widen delete permission: users may delete within their assigned projects; admins anywhere.
4. Build the recycle bin page (list, restore, permanent delete) behind `AdminGuard`.
5. Add the 30-day purge task.
6. Remove the 50MB limit from `documents.controller.ts`.
7. Decide whether `GET /projects` should be membership-scoped by default (it currently is not).
8. Allow self-service email change (`ProfileDto` + `updateMe`, re-verification recommended), and enable the disabled field in `ProfileSettingsModal`.
9. Send `fullName` from the Register page, and add an expiry to the email verification token.