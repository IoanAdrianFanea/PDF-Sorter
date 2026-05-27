# Project Plan – Construction Document Indexer

A multi-user document indexing and retrieval tool for construction operations teams.

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
- Project-scoped visibility for non-admins (currently a reversal of earlier "company-wide" decision)
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

Status: **next**

### Admin Console (UI)
- Project management page — create, rename, delete, list projects
- Project membership page — add and remove users from projects
- User management page — list users, edit user details, change roles
- Pending registrations queue — review and approve new user signups

### Project-Scoped Visibility
- Users see only documents from projects they are assigned to
- Admins see everything
- Applies to list, search, download, and export
- 50MB upload limit removed (no storage cap)

### Authentication and Account Lifecycle
- Self-registration creates a `PENDING` user
- Email sent to admin for approval
- Email sent to user to verify their email address
- Both approval and email verification required before login
- Password policy enforcement (length, character mix — exact rules to be defined)
- Users can change their own name, email, password
- Admins can edit other users' details

### Delete Logging and 30-Day Recovery
- All file deletions logged with actor, timestamp, project
- Soft delete with 30-day restoration window
- Recycle bin / restore UI for admins
- Users can only delete files from projects they are assigned to
- Admins can delete from any project
- Permanent deletion happens after 30 days

---

## Phase 3 – Custom Filters & Search

Status: **not started**

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

Status: **not started**

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

Status: **not started**

- HTTPS
- OneDrive integration (replaces `LocalBlobStore`)
- SMTP setup for transactional emails (approval, verification)
- Structured logging
- Environment-based configuration
- Backup strategy
- Print document button with print preview (if time allows)

---

## Phase 6 – Async Processing

Status: **not started**

- Queue-based document processing pipeline
- API + worker architecture
- Background text extraction (PDF and OCR)
- Background compression and archive jobs
- Retry failed jobs
- Job status endpoints
- Jobs page becomes real (currently mock data)

---

## Phase 7 – Future

Status: **not started**

- Native app evaluation (laptop, tablet, phone — single app, all platforms)
- Email attachment ingestion
- Offline-friendly document viewing

---

## Known Technical Notes

- Storage key format is `{userId}/{documentId}.{ext}` where ext is derived from mime type. Will change to project-based key in Phase 4.
- The `/jobs` route exists in the frontend as a mock-data preview of Phase 6 functionality.
- `User` has `language`, `timezone` fields that are unused. Candidates for removal — see backlog.