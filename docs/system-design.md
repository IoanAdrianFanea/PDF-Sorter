# System Design

This document describes how the system behaves at runtime.

---

## Access Model

1. User logs in
2. User can browse company documents
3. User can upload new documents to a project
4. Documents are visible across the company
5. Role determines destructive/admin capabilities

uploadedBy is stored for traceability.

---

## Document Status Model

Documents move through:

UPLOADED → PROCESSING → PROCESSED / FAILED

Later versions may introduce:

UPLOADED → QUEUED → PROCESSING → PROCESSED / FAILED

---

## Upload Flow

1. User uploads a PDF or image
2. API validates authentication
3. API validates file type and size
4. API validates selected project
5. API creates document record
6. API stores file through BlobStore
7. If file is a PDF, extraction runs
8. Extracted text is stored
9. Document status becomes PROCESSED

If processing fails:
- document status becomes FAILED
- error message is stored

---

## Search Flow

1. User enters a search query
2. User optionally filters by project
3. API searches filenames, extracted text, and useful metadata
4. API returns matching documents with snippets
5. User opens details or downloads the file

Primary purpose:
reduce time lost in manual document lookup

---

## Project Browsing Flow

1. User selects a project
2. System lists project documents
3. User sorts/filters the list
4. User opens the needed document

This reflects the real business workflow, where documents are mainly organized by project.

---

## Retrieval Flow

Typical use case:

1. User looks for a delivery-related document
2. User finds it via project view or search
3. User checks details/preview
4. User downloads it or uses it operationally

---

## Delete Flow

1. Admin requests deletion
2. API verifies role/authorization
3. File removed from storage
4. Related database records removed
5. System returns success/failure result

Delete is intentionally restricted.

---

## Export Flow

1. User selects one or more documents
2. API validates access
3. API creates ZIP archive
4. User downloads ZIP

Later versions may support async export jobs.

---

## Future Intake Enhancements

Possible future additions:

- OCR for scanned/image documents
- ingestion from email attachments
- improved metadata extraction
- offline-friendly viewing for downloaded files