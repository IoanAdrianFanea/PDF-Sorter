# Roadmap

Development stages for the Construction Document Indexer.

---

## Phase 1 – Core Operational MVP

Status: **mostly complete** — see `project-plan.md` for outstanding items.

### Complete
- Authentication (JWT + refresh token rotation)
- USER / ADMIN roles
- Project entity + membership
- PDF upload with project association
- PDF text extraction
- Document status tracking
- Full-text search with snippets
- Document list with filtering and sorting
- Document details and text preview
- Download original file
- Admin-only delete (single + bulk)
- ZIP export
- Storage abstraction (BlobStore interface)

### Remaining
- Image upload support (PDF + images)
- Project management endpoints (create, get, update)
- User admin endpoints (list, create, update role)

---

## Phase 2 – Operational Usability

- Table-style document view
- Formal metadata columns (supplier, delivery date, material type, quantity, order number)
- Improved filtering and column-based sorting
- Upload progress indicators
- Processing and error state indicators
- Better UX for large document lists

---

## Phase 3 – Async Processing

- Queue-based document processing
- Background text extraction
- Retry on failure
- Background export jobs
- Job status endpoints

---

## Phase 4 – Deployment

- HTTPS
- S3-compatible object storage (replaces LocalBlobStore)
- Structured logging
- Environment configuration
- Backup strategy

---

## Phase 5 – Future

- OCR for scanned images
- Email attachment ingestion
- Offline document access
- Native app evaluation (Windows, Android)
