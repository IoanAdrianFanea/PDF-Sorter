# Project Plan – Construction Document Indexer

A multi-user document indexing and retrieval tool for construction operations teams.

---

## Current Position

**Phase 2 is complete. Phase 3 is next.**

All four Phase 2 workstreams are built and wired end to end:

- Admin console (projects, membership, users, pending registrations, recycle bin) — **done**
- Project-scoped visibility across list, search, read, download, export and the project list itself — **done**
- Registration lifecycle (PENDING accounts, email verification, admin approval, password policy) — **done**
- Delete logging and 30-day recovery (soft delete, `DeletionLog`, recycle bin, scheduled purge) — **done**

The smaller Phase 2 items are closed too: the 50MB upload limit is gone, users can change their own email address (with re-verification), `GET /projects` is membership-scoped for non-admins, and the Register page now sends the full name it collects.

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
| 50MB file size limit | Removed in Phase 2 — uploads are no longer size-capped |
| Document status tracking | `UPLOADED → PROCESSING → PROCESSED / FAILED` |
| Document list with filtering and sorting | Filter by project, text, date range; sort by upload date, name, status |
| Full-text search with snippets | Searches filename + extracted text, returns `<mark>` highlighted snippets |
| Document details and text preview | First 150 chars of extracted text in list response |
| Download original file | |
| Admin-only delete (single + bulk) | Widened in Phase 2: project members can delete in their own projects |
| Status indicators in UI | Coloured badges per document status |
| ZIP export of selected documents | |
| Storage abstraction | `BlobStore` interface, `LocalBlobStore` implementation |

---

## Phase 2 – Access, Admin Console & Auditability

Status: **complete** — all 4 workstreams delivered.

### Admin Console (UI) — complete

| Item | Status | Notes |
|---|---|---|
| Project management page | ✅ done | `AdminProjects` — create, rename, delete, list, member count |
| Project membership page | ✅ done | `ManageMembersModal` — user search, add, remove |
| User management page | ✅ done | `AdminUsers` — list, create, edit name/email/temp password, change role, delete |
| Pending registrations queue | ✅ done | `AdminPending` — approve/reject via `PATCH /users/:id/status`, rejected list included |
| Recycle bin page | ✅ done | `AdminRecycleBin` at `/admin/recycle-bin` — list, restore, permanent delete |
| Admin route guard | ✅ done | `AdminGuard` checks `role === 'ADMIN'` via `/auth/me` |

### Project-Scoped Visibility — complete

| Item | Status | Notes |
|---|---|---|
| Users see only documents from assigned projects | ✅ done | `getAccessibleProjectIds` in `DocumentsService` and `ExportsService` |
| Admins see everything | ✅ done | Admins resolve to `null` (no project restriction) |
| Applies to list, search, details, text, status counts | ✅ done | Soft-deleted rows excluded from all of them |
| Applies to download and export | ✅ done | Enforced in `ExportsService` |
| Project list scoping | ✅ done | `GET /projects` is membership-scoped for non-admins; admins see all. `?scope=uploadable` still accepted and resolves identically |
| 50MB upload limit removed | ✅ done | `MAX_UPLOAD_BYTES` check and Multer `limits` both removed; mime-type allowlist kept |

### Authentication and Account Lifecycle — complete

| Item | Status | Notes |
|---|---|---|
| Self-registration creates a `PENDING` user | ✅ done | `accountStatus` defaults to `PENDING` in schema |
| Email sent to admin for approval | ✅ done | `EmailService.sendAdminApprovalNotification`, sent per-admin |
| Email sent to user to verify their address | ✅ done | SHA-256 hashed token, `GET /auth/verify-email`, `VerifyEmail` page |
| Both approval and verification required before login | ✅ done | Both checked in `AuthService.login` with distinct messages |
| Password policy enforcement | ✅ done | `IsStrongPassword`: min 10 chars, upper, lower, digit, special. Mirrored client-side on Register |
| Registration stores the full name | ✅ done | `RegisterDto.fullName` → `UsersService.create`; sent by the Register page |
| Users can change their own name | ✅ done | `PATCH /auth/me` |
| Users can change their own password | ✅ done | `PATCH /auth/me/password`, revokes all refresh tokens |
| Users can change their own email | ✅ done | `PATCH /auth/me` — 409 on duplicate, clears `emailVerifiedAt` and sends a new verification link |
| Admins can edit other users' details | ✅ done | `PATCH /users/:id` — name, email, temporary password (forces `mustChangePassword`) |

Known gaps in this workstream:
- The verification email says the link is valid for 24 hours, but no expiry is stored or checked. Tokens are currently valid indefinitely until consumed.
- The password policy applies to `RegisterDto` and `ChangePasswordDto` only. `CreateUserDto` (admin create) has no policy at all, and `AdminEditUserDto` uses a plain 8-character minimum. This is deliberate for temporary passwords, but worth confirming.

### Delete Logging and 30-Day Recovery — complete

| Item | Status | Notes |
|---|---|---|
| All file deletions logged with actor, timestamp, project | ✅ done | `DeletionLog` model; `documentId` is a plain string and context is denormalised so the row outlives the document |
| Soft delete with 30-day restoration window | ✅ done | `Document.deletedAt` (indexed); retention lives in `DELETION_RETENTION_DAYS` |
| Soft-deleted rows hidden from every read path | ✅ done | List, search, details, text, status counts, download, export |
| File moved rather than unlinked | ✅ done | `BlobStore.moveFile` → `deleted/{userId}/{documentId}.{ext}` |
| Recycle bin / restore UI for admins | ✅ done | `GET /recycle-bin`, `POST /recycle-bin/:id/restore`, `DELETE /recycle-bin/:id` behind `AdminGuard` |
| Users can delete files from their assigned projects | ✅ done | Admins anywhere; members within their projects; everyone else gets 404 |
| Permanent deletion after 30 days | ✅ done | `PurgeTask` via `@nestjs/schedule`, daily at 03:00; idempotent and tolerant of missing files |

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

- Storage key format is `{userId}/{documentId}.{ext}` where ext is derived from mime type, and `deleted/{userId}/{documentId}.{ext}` while a document sits in the recycle bin. Will change to project-based keys in Phase 4.
- The `/jobs` route exists in the frontend as a mock-data preview of Phase 6 functionality. Its banner incorrectly says "Phase 3 – Async Processing"; async processing is Phase 6.
- `/admin/filters` and `/admin/archive` are likewise mock-data previews of Phases 3 and 4.
- `User` has `language`, `timezone` fields that are unused. Candidates for removal — see backlog.
- Search loads every accessible document with extracted text into memory and filters in JavaScript (`searchDocuments`). Fine at current scale, but it will need a SQL/FTS rewrite before real data volumes.
- `listDocuments` is hard-capped at 50 rows with no pagination, and search at 20.
- `AuthService.refresh` matches the most recent non-revoked token for the user rather than looking up the presented token, so concurrent sessions on multiple devices can invalidate each other.
- `POST /projects` has no membership bootstrap — a newly created project has no members until an admin adds them.
- Deleting a project still hard-deletes its documents by cascade, bypassing the recycle bin. Only per-document deletion is recoverable.
- The purge task runs in-process on a single API instance. If the API is ever scaled out, every instance will run it — the conditional-delete claim makes that safe, but it is wasted work.

---

## Immediate Next Steps (to open Phase 3)

1. Design the `FilterDefinition` / `DocumentFilterValue` schema and migrate (max 5 active filters).
2. Build filter CRUD endpoints and turn `/admin/filters` into a real page.
3. Surface custom filters on the upload form and the document list.
4. Combine filters and search in a single query path.
5. Add OCR for images (`tesseract.js` or similar) so images participate in search.
6. Backlog carry-over from Phase 2: add an expiry to email verification tokens, and decide whether project deletion should route through the recycle bin.