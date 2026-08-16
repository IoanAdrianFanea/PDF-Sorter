# System Design

Runtime behaviour of the system.

---

## Access Model

1. User registers (or is created by an admin)
2. Self-registered users wait for admin approval and verify their email
3. Once active, user can log in
4. User sees only documents from projects they are assigned to
5. Admins see all projects and all documents
6. Role and project membership together determine all access

`uploadedBy` is stored for traceability.

---

## Document Status Flow

```
UPLOADED → PROCESSING → PROCESSED
                      → FAILED
```

Later (Phase 6):

```
UPLOADED → QUEUED → PROCESSING → PROCESSED
                              → FAILED
```

---

## Upload Flow

1. User selects a project and file (PDF, JPEG, or PNG)
2. API validates JWT and user is active
3. API checks project membership (admin bypasses)
4. Document record created (`status: UPLOADED`)
5. File saved to `BlobStore`
6. `storageKey` written back to document record
7. `status` set to `PROCESSING`
8. If PDF: `pdf-parse` extracts text, `DocumentText` record created
9. If image and OCR enabled (Phase 3): OCR runs, `DocumentText` created
10. If image and OCR not enabled: extraction skipped
11. `status` set to `PROCESSED`

On any failure: `status` set to `FAILED`, `errorMessage` stored.

---

## Registration Flow (Phase 2) — implemented

1. User submits email and password (the form also collects a name, but it is not yet sent to the API)
2. Password checked against policy (10+ chars, upper, lower, digit, special)
3. User created with `accountStatus: PENDING`
4. Verification email sent to user
5. Notification email sent to every admin
6. User clicks verification link → `emailVerifiedAt` set, token cleared (single use)
7. Admin approves in `/admin/pending` → `accountStatus: ACTIVE`
8. User can log in once both have happened
9. Login is rejected with a clear message if either step is incomplete

If SMTP is not configured, emails are written to the server log instead of being sent, so the flow remains testable in development.

---

## Search and Filter Flow (Phase 3) — NOT YET IMPLEMENTED

Target behaviour:

1. User selects filters (custom fields) and types a search query
2. Filters and query apply together
3. API loads documents the user can see (project-scoped)
4. Filters narrow the set
5. Search query narrows further (filename + extracted text + OCR text)
6. Up to 20 results returned with snippets

Both filter-only and search-only requests still work.

Current behaviour: `GET /documents/search` loads every project-scoped document that has extracted text, filters case-insensitively in memory on filename and text, and returns up to 20 `<mark>`-highlighted snippets. `GET /documents` supports a separate set of ad-hoc text filters (`supplier`, `materialType`, `quantity`, `orderNumber`) that are all matched against filename and extracted text because no dedicated columns exist yet. The two paths are not yet combined.

---

## Project Browse Flow

1. User opens Documents page
2. Sees only projects they are members of (admins see all)
3. Selects a project or views all visible projects
4. Applies filters and/or search
5. Opens document drawer or downloads

---

## Delete Flow (Phase 2) — NOT YET IMPLEMENTED

Target behaviour:

1. User selects document(s)
2. API verifies: admin, or user has membership of the document's project
3. Document marked with `deletedAt` (soft delete)
4. `DeletionLog` row written: actor, project, document, timestamp
5. File moved to `deleted/{projectId}/` in storage
6. After 30 days, scheduled task permanently deletes the file and updates the log
7. Admin can restore from recycle bin within the 30-day window

Current behaviour:

1. Admin selects document(s) — non-admins are rejected outright
2. Blob is deleted from storage
3. Document row is deleted, cascading to `DocumentText`
4. Nothing is logged and nothing can be restored

---

## Archive Flow (Phase 4)

### Archive
1. Admin opens project management page
2. Selects "Archive" on a project
3. All files in the project zipped into `archived/{projectId}.zip`
4. `archivedAt` set on the project
5. Project hidden from main views; appears in archive page

### Unarchive
1. Admin opens archive page
2. Selects "Unarchive" on a project
3. Zip extracted, files restored to `active/{projectId}/`
4. `archivedAt` cleared
5. Project re-appears in main views

### Download (without unarchive)
1. Admin downloads zip directly from archive page
2. Project remains archived

### Permanent delete
1. Admin can permanently delete an archived project
2. Zip removed from storage
3. Database records purged

---

## Export Flow

1. User selects one or more documents (within their visible scope)
2. `POST /exports` with `documentIds`
3. API verifies user can see all requested documents
4. API streams a ZIP archive containing the selected files
5. Browser downloads the archive

---

## Project Management Flow

1. Admin creates a project via the project management page (name only)
2. Admin adds users via the membership modal
3. Assigned users see the project and can upload to it
4. Admin can rename or delete (delete is currently permanent and cascades to documents — the recycle bin is Phase 2 outstanding work)
5. Admin can archive when work is complete — Phase 4, UI stub only

Note: a newly created project has no members. Even the creating admin must add members explicitly before non-admins can use it.

---

## User Management Flow

1. Pending registrations appear in the admin queue at `/admin/pending`
2. Admin reviews and approves or rejects
3. Admin can change user role at any time
4. Admin can edit user details (name, email, temporary password)
5. Users can change their own name and password — **self-service email change is not implemented yet**