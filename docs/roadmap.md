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
- Image upload without extraction (OCR planned for Phase 5)
- 50MB file size limit
- Document status tracking
- Full-text search with snippets
- Document list with filtering and sorting
- Document details and text preview
- Download original file
- Admin-only delete (single + bulk)
- ZIP export
- Storage abstraction (BlobStore interface)

---

## Phase 2 – Operational Usability

Status: **not started**

- Formal metadata columns as real schema fields (supplier, delivery date, material type, quantity, order number)
- Filtering and sorting based on those columns
- Table-style document view (desktop layout)
- Improved project navigation
- Upload progress indicators
- Processing and error state indicators
- Better UX for large document lists

---

## Phase 3 – Async Processing

Status: **not started**

- Queue-based document processing
- Background text extraction with retry
- Background export jobs
- Job status endpoints

---

## Phase 4 – Deployment

Status: **not started**

- HTTPS
- S3-compatible object storage (replaces LocalBlobStore)
- Structured logging
- Environment configuration
- Backup strategy

---

## Phase 5 – Future

Status: **not started**

- OCR for scanned images and site photos
- Email attachment ingestion
- Offline document access
- Native app evaluation (Windows, Android)