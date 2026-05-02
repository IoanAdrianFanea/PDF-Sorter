# System Design

Runtime behaviour of the system.

---

## Access Model

1. User registers or logs in
2. User can browse all company documents
3. User can upload to projects they are assigned to (admins can upload anywhere)
4. Documents are visible across the company
5. Role determines delete and admin capabilities

`uploadedBy` is stored for traceability, not access control.

---

## Document Status Flow

```
UPLOADED → PROCESSING → PROCESSED
                      → FAILED
```

Later (Phase 3):

```
UPLOADED → QUEUED → PROCESSING → PROCESSED
                              → FAILED
```

---

## Upload Flow

1. User selects a project and file
2. API validates JWT
3. API checks membership (admin bypasses)
4. Document record created (`status: UPLOADED`)
5. File saved to `LocalBlobStore` (`server/data/{userId}/{documentId}.pdf`)
6. `storageKey` written back to document record
7. `status` set to `PROCESSING`
8. `pdf-parse` extracts text from file path
9. `DocumentText` record created
10. `status` set to `PROCESSED`

On any failure: `status` set to `FAILED`, `errorMessage` stored.

---

## Search Flow

1. User types a query (minimum 2 characters)
2. API loads all documents that have extracted text
3. Filters in memory: filename and extracted text (case-insensitive)
4. Returns up to 20 results with contextual `<mark>` highlighted snippets
5. User opens document detail or downloads

Note: in-memory filtering is acceptable at current scale. SQL `LIKE` or FTS can replace it without changing the API contract.

---

## Project Browse Flow

1. User navigates to Documents
2. Selects a project from the filter dropdown (or views all)
3. Applies additional text / metadata filters if needed
4. Opens document drawer or downloads

---

## Delete Flow

1. Admin selects document(s)
2. API verifies `role === ADMIN`
3. Physical file removed from `LocalBlobStore`
4. Database record deleted (cascades to `DocumentText`)

---

## Export Flow

1. User selects one or more documents
2. `POST /exports` with `documentIds`
3. API streams a ZIP archive containing the selected files
4. Browser downloads the archive
