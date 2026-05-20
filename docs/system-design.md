# System Design

Runtime behaviour of the system.

---

## Access Model

1. User logs in (or is created by an admin)
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

1. User selects a project and file (PDF, JPEG, or PNG — max 50MB)
2. API validates JWT
3. API checks membership (admin bypasses)
4. Document record created (`status: UPLOADED`)
5. File saved to `LocalBlobStore` (`server/data/{userId}/{documentId}.{ext}`)
6. `storageKey` written back to document record
7. `status` set to `PROCESSING`
8. If PDF: `pdf-parse` extracts text, `DocumentText` record created
9. If image: extraction skipped, no `DocumentText` record created
10. `status` set to `PROCESSED`

On any failure: `status` set to `FAILED`, `errorMessage` stored.

---

## Search Flow

1. User types a query (minimum 2 characters)
2. API loads all documents that have extracted text
3. Filters in memory: filename and extracted text (case-insensitive)
4. Returns up to 20 results with contextual `<mark>` highlighted snippets
5. User opens document detail or downloads

Note: images without extracted text will only match on filename. OCR planned for Phase 5.
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

---

## Project Management Flow

1. Admin creates a project via `POST /projects`
2. Admin adds users to the project via `POST /projects/:id/members`
3. Users assigned to the project can upload documents to it
4. Admin can rename the project via `PATCH /projects/:id`
5. Admin can remove members via `DELETE /projects/:id/members/:userId`
6. Admin can delete the project via `DELETE /projects/:id` — permanently deletes all documents and memberships

---

## User Management Flow

1. Admin creates a user via `POST /users` with a temporary password
2. User logs in and should change their password (enforced manually for now — see backlog)
3. Admin can change a user's role via `POST /users/:id/role`
4. Users can only view their own profile; admins can view any profile