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

## Registration Flow (Phase 2)

1. User submits name, email, password
2. Password checked against policy
3. User created with `accountStatus: PENDING`
4. Verification email sent to user
5. Approval email sent to admin
6. User clicks verification link → `emailVerifiedAt` set
7. Admin clicks approval link → `accountStatus: ACTIVE`
8. User can log in once both have happened
9. Login is rejected with a clear message if either step is incomplete

---

## Search and Filter Flow (Phase 3)

1. User selects filters (custom fields) and types a search query
2. Filters and query apply together
3. API loads documents the user can see (project-scoped)
4. Filters narrow the set
5. Search query narrows further (filename + extracted text + OCR text)
6. Up to 20 results returned with snippets

Both filter-only and search-only requests still work.

---

## Project Browse Flow

1. User opens Documents page
2. Sees only projects they are members of (admins see all)
3. Selects a project or views all visible projects
4. Applies filters and/or search
5. Opens document drawer or downloads

---

## Delete Flow (Phase 2)

1. User selects document(s)
2. API verifies: admin, or user has membership of the document's project
3. Document marked with `deletedAt` (soft delete)
4. `DeletionLog` row written: actor, project, document, timestamp
5. File moved to `deleted/{projectId}/` in storage
6. After 30 days, scheduled task permanently deletes the file and updates the log
7. Admin can restore from recycle bin within the 30-day window

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
2. Admin adds users via the membership page
3. Assigned users see the project and can upload to it
4. Admin can rename or delete (delete goes to recycle bin)
5. Admin can archive when work is complete

---

## User Management Flow

1. Pending registrations appear in admin queue
2. Admin reviews and approves or rejects
3. Admin can change user role at any time
4. Admin can edit user details
5. Users can change their own name, email, and password