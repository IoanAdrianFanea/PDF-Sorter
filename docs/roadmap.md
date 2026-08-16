# Roadmap

Development stages for the Construction Document Indexer.

---

## Phase 1 – Core Operational MVP

Status: **complete**

- Authentication (JWT + refresh token rotation)
- USER / ADMIN roles
- Project entity + membership
- Project management endpoints (create, update, delete, members)
- User admin endpoints (list, create, get, set role)
- PDF + image upload (JPEG, PNG) with project association
- PDF text extraction
- Image upload without extraction (OCR coming in Phase 3)
- Document status tracking
- Status indicator badges in UI
- Full-text search with snippets
- Document list with filtering and sorting
- Document details and text preview
- Download original file
- Admin-only delete (single + bulk)
- ZIP export
- Storage abstraction (BlobStore interface)

---

## Phase 2 – Access, Admin Console & Auditability

Status: **in progress** (~75%)

Done:
- Admin console: project management page (create, rename, delete, list)
- Admin console: project membership page (add/remove users)
- Admin console: user management page (list, create, edit, change role, delete)
- Admin console: pending registrations queue (approve / reject)
- Project-scoped visibility (users see only assigned projects, admins see all) — list, search, details, text, download, export
- Self-registration with admin approval
- Email verification on signup (with SMTP transport, console fallback in dev)
- Password policy (10+ chars, upper, lower, digit, special)
- User self-service profile editing — name and password

Outstanding:
- Remove upload size limit (still 50MB)
- Scope `GET /projects` by membership (currently returns all projects to every user)
- Self-service email change (field currently disabled)
- Delete logging with full audit trail
- 30-day soft delete and recycle bin
- Recycle bin / restore UI
- Non-admin delete within assigned projects

---

## Phase 3 – Custom Filters & Search

Status: **not started** (static UI mock at `/admin/filters`)

- Admin-configurable custom filter fields (max 5)
- Filter management page
- Search + filter combined for precise lookup
- OCR for images (pulled forward from Phase 5)
- Document-date filtering replaces upload-date filtering

---

## Phase 4 – Archive & Storage Structure

Status: **not started** (static UI mock at `/admin/archive`)

- Project archive (zip on archive, restore on unarchive)
- Archive page
- OneDrive folder structure (active / archived / deleted)
- File compression above size threshold

---

## Phase 5 – Deployment

Status: **not started** (SMTP already delivered as part of Phase 2)

- HTTPS
- OneDrive integration (replaces LocalBlobStore)
- ~~SMTP for approval and verification emails~~ — done early
- Structured logging
- Environment configuration (partially done via `@nestjs/config`)
- Backup strategy
- Print document button (if time allows)

---

## Phase 6 – Async Processing

Status: **not started** (static UI mock at `/jobs`)

- Queue-based document processing
- Background text extraction (PDF and OCR)
- Background compression and archive jobs
- Retry on failure
- Job status endpoints
- Real Jobs page

---

## Phase 7 – Future

Status: **not started**

- Native app for all platforms (single app — laptop, tablet, phone)
- Email attachment ingestion
- Offline document access