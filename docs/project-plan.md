# Project Plan – Construction Document Indexer

A shared internal document indexing and retrieval tool for construction operations teams.

---

## Goal

Build a multi-user application for uploading, organising, searching, and retrieving project-related documents.

Primary users: procurement team, managers, quantity surveyors.

Core problems being solved:
- Time lost in manual document lookup
- No shared, searchable document store
- No project-based organisation

---

## Product Direction

This is a shared company document system, not a personal document organiser.

Key rules:
- Documents are company-visible by default
- Projects are the main organising structure
- `uploadedBy` is stored for traceability
- Only admins can delete documents
- Upload access is restricted to assigned project members (admins can upload anywhere)

---

## Phase 1 – Core Operational MVP

### ✅ Done

| Item | Notes |
|---|---|
| JWT authentication with access + refresh tokens | Refresh token rotation, HttpOnly cookie |
| Argon2 password hashing | |
| USER / ADMIN role model | Enforced in service layer |
| Project entity | `Project` + `ProjectMembership` in schema |
| Upload authorization | Admins unrestricted; users must be project members |
| PDF upload + local storage | Stored under `server/data/` via `LocalBlobStore` |
| PDF text extraction | `pdf-parse`, synchronous, runs on upload |
| Document status tracking | `UPLOADED → PROCESSING → PROCESSED / FAILED` |
| Document list with filtering | Filter by project, text, supplier, material type, quantity, order number, date range |
| Document sorting | Upload date (asc/desc), name (asc/desc), status |
| Full-text search with snippets | Company-wide, searches filename + extracted text, returns `<mark>` highlighted snippets |
| Document details and text preview | First 150 chars of extracted text in list response |
| Download original PDF | |
| Admin-only delete (single + bulk) | Role enforced in service |
| ZIP export of selected documents | |
| Storage abstraction | `BlobStore` interface, `LocalBlobStore` implementation |
| Profile update endpoint | `PATCH /auth/me` — fullName, language, timezone |

### ❌ Outstanding (Phase 1)

| Item | Notes |
|---|---|
| Image upload support | Controller and client both hard-code `application/pdf`; plan requires PDF + images |
| Project creation endpoint | `POST /projects` does not exist — projects must be created directly in the DB |
| Project detail / update endpoints | `GET /projects/:id` and `PATCH /projects/:id` do not exist |
| User admin endpoints | `GET /users`, `POST /users`, `PATCH /users/:id/role` not implemented — no users controller |

---

## Phase 2 – Operational Usability

- Better sorting and filtering in the document list
- Table-style document view (desktop layout)
- Improved project navigation
- Upload progress indicators
- Processing / error state indicators
- Better UX for large document lists
- Formal metadata fields (supplier, delivery date, material type) as schema columns rather than text search fallback

---

## Phase 3 – Async Processing

- Queue-based document processing pipeline
- API + worker architecture
- Background text extraction
- Retry failed jobs
- Background export jobs
- Job status endpoints

---

## Phase 4 – Deployment

- Cloud or on-prem deployment
- HTTPS
- Object storage (S3-compatible), replacing `LocalBlobStore`
- Structured logging
- Environment-based configuration
- Backup strategy

---

## Phase 5 – Future Enhancements

- OCR for scanned images / site photos
- Email attachment ingestion
- Offline-friendly document viewing
- Native Windows / Android apps (to be evaluated after web workflows are stable)

---

## Known Technical Notes

- Storage key format is currently `{userId}/{documentId}.pdf` — architecture doc suggests `{projectId}/{documentId}`. To revisit when image support is added.
- List endpoint accepts `supplier`, `materialType`, `quantity`, `orderNumber` as filter params but these are not schema columns — they fall back to filename + extracted text search. Real columns needed before these filters are meaningful.
- The `/jobs` route exists in the frontend as a mock-data preview of Phase 3 functionality. It is clearly labelled and does not connect to the backend.
- `User` has `fullName`, `language`, `timezone` fields added in the last migration. Useful but low priority.
