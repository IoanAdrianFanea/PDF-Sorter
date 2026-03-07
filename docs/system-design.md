# System Design

This document describes the main runtime flows (authentication, upload, processing, search, export).
It focuses on the "how the system behaves" view rather than implementation details.

---

## Authentication Flow

### Registration
1. User submits email + password
2. API validates input (email format, password length)
3. API checks if user exists
4. API hashes password with argon2
5. API creates user in database
6. API generates access token (15m) and refresh token (7d)
7. API returns access token in response body
8. API sets refresh token in HttpOnly cookie

### Login
1. User submits email + password
2. API finds user by email
3. API verifies password hash with argon2
4. API generates tokens and sets cookie (same as registration)

### Token Refresh
1. Frontend sends refresh request (refresh token in cookie)
2. API verifies refresh token signature
3. API finds stored token hash in database
4. API verifies token hash matches (argon2)
5. API revokes old refresh token (sets revokedAt)
6. API generates new tokens
7. API returns new access token and sets new refresh cookie

### Protected Request
1. Frontend sends request with Authorization: Bearer {accessToken}
2. JwtStrategy validates token signature
3. JwtStrategy extracts user ID from token payload
4. API verifies user exists
5. Request proceeds with authenticated user

### Logout
1. User sends logout request (requires auth)
2. API revokes all active refresh tokens for user
3. API clears refresh token cookie

---

## Document Status Model

Documents move through a simple state machine:

UPLOADED → QUEUED → PROCESSING → PROCESSED / FAILED

Notes:
- Phase 1 may skip QUEUED and do processing synchronously.
- Phase 2 introduces a queue and worker process, making QUEUED meaningful.

---

## Upload Flow (Phase 1 - Implemented)

### Frontend Upload Process
1. User drags/drops PDF or selects via file input (Upload.tsx)
2. Frontend validates file type (application/pdf only)
3. Frontend creates FormData with file
4. Frontend sends POST /documents/upload with Bearer token
5. Frontend updates UI to show upload status (pending → uploading → success/error)
6. Frontend navigates to documents list after completion

### Backend Processing
1. JwtAuthGuard validates authentication
2. FileInterceptor (Multer) parses multipart/form-data
3. DocumentsController validates:
   - File exists
   - File size ≤ 25MB
   - MIME type is application/pdf
4. DocumentsService creates Document record (status: UPLOADED)
5. BlobStore saves file to ./data/{ownerId}/{documentId}.pdf
6. Document updated with storageKey
7. Status changed to PROCESSING
8. ExtractionService reads PDF and extracts text using pdf-parse
9. Text normalized (collapse whitespace)
10. DocumentText record created/updated via upsert
11. Status changed to PROCESSED
12. Returns {id, status} to frontend

### Error Handling
- If any step fails after document creation, status set to FAILED
- Error message stored in document.errorMessage
- Frontend displays error message to user

---

## Upload Flow (Phase 2 – Async)

1. User uploads PDF(s).
2. API stores file + metadata, marks document QUEUED.
3. API enqueues ProcessDocument job.
4. Worker marks document PROCESSING.
5. Worker extracts text and updates SQLite FTS.
6. Worker marks PROCESSED or FAILED.

---

## Search Flow (Phase 1 - Implemented)

### Frontend Search Process
1. User types query in header search bar
2. Frontend validates query (minimum 2 characters)
3. Frontend sends GET /documents/search?q={query} with Bearer token
4. Frontend displays results with highlighted snippets
5. User clicks result → opens document drawer on right side
6. Document drawer fetches full metadata

### Backend Search Process
1. JwtAuthGuard validates authentication
2. SearchQueryDto validates query (minimum 2 characters)
3. DocumentsService fetches all user's documents with DocumentText
4. Filter documents where originalFilename OR extractedText contains query (case-insensitive)
5. Limit to 20 results (ordered by uploadedAt DESC)
6. Generate snippet for each match:
   - If found in text: Extract ~80 characters before and after match
   - If found only in filename: Show "Filename: {highlighted name}"
   - Normalize whitespace (collapse to single spaces)
   - Add "..." prefix/suffix if text is clipped
   - Highlight match with <mark> tags
7. Return { results: [{ documentId, filename, snippet }] }

### Snippet Generation Logic
- Case-insensitive matching
- Shows contextual text around first match
- HTML <mark> tags for highlighting (rendered with yellow background)
- Does NOT return full extractedText field (too large)
- Clean whitespace handling

### Security
- Only searches documents where ownerId = authenticated user
- Document drawer validates ownership before showing details
- All queries scoped by user ID

---

## Document Details Flow (Implemented)

### Page Count Capture
1. During PDF extraction, pdf-parse returns numpages field
2. Backend stores pageCount in DocumentText table
3. Frontend displays actual page count in document drawer
4. Falls back to "N/A" if page count not available

### Text Preview Generation
1. Backend extracts first 150 characters of DocumentText.extractedText
2. Appends "..." if text is longer than 150 characters
3. Returned in GET /documents/:id as textPreview field
4. Frontend displays in document drawer "Extracted Text" section
5. Full text available via GET /documents/:id/text endpoint

---

## Delete Flow (Implemented)

### Single Document Delete
1. User clicks "Delete Document" in document drawer
2. Frontend shows confirmation dialog
3. On confirm, sends DELETE /documents/:id with Bearer token
4. Backend validates authentication and ownership
5. Backend deletes physical file from storage (./data/{ownerId}/{documentId}.pdf)
6. Backend deletes document from database (cascade deletes DocumentText and DocumentTag)
7. Frontend closes drawer and removes document from UI list
8. Document permanently deleted (survives page refresh)

### Bulk Delete
1. User selects multiple documents via checkboxes
2. Bottom action bar appears with Delete button
3. User clicks Delete → confirmation dialog shows count
4. On confirm, sends POST /documents/bulk-delete with documentIds array
5. Backend processes each document individually
6. Backend returns { deleted: count, failed: [] }
7. Frontend shows result if any failures occurred
8. Frontend removes deleted documents from UI list
9. Selection cleared automatically

### Cascade Delete Implementation
1. Prisma schema configured with onDelete: Cascade on all foreign keys
2. Document deletion automatically removes:
   - DocumentText record (extracted text + page count)
   - DocumentTag records (tag associations)
   - Physical PDF file from storage
3. Migration applied to database schema
4. Prevents foreign key constraint violations

### Delete Security
- All delete operations validate document ownership
- User can only delete their own documents
- Returns 404 if document not found or not owned by user
- Physical file deletion handles missing files gracefully (ENOENT)

---

## Tags Flow (Implemented)

### Tag Creation
1. User creates tag from sidebar or document drawer
2. Frontend validates tag name (non-empty)
3. Sends POST /tags with { name } and Bearer token
4. Backend validates authentication and DTO
5. Backend creates tag with ownerId from JWT
6. Returns 409 Conflict if tag name already exists for user
7. Tag stored in database with unique constraint [ownerId, name]
8. Frontend updates tag list immediately via React Context

### Tag Attachment
1. User opens document drawer
2. User clicks "+" button in tags section
3. Dropdown menu shows all user's tags
4. User selects tag(s) to attach
5. Sends POST /documents/:id/tags with { tagId } and Bearer token
6. Backend validates document and tag ownership
7. Backend creates DocumentTag record (many-to-many join)
8. Frontend refreshes document tags immediately

### Tag Removal
1. User hovers over tag in document drawer
2. "×" button appears next to tag name
3. User clicks "×" button
4. Sends DELETE /documents/:id/tags/:tagId with Bearer token
5. Backend validates ownership and removes DocumentTag record
6. Frontend removes tag from UI immediately

### Tag Deletion
1. User hovers over tag in sidebar
2. "×" button appears next to tag name
3. User clicks "×" button
4. Confirmation dialog appears: "Delete tag? This will remove it from all documents."
5. On confirm, sends DELETE /tags/:id with Bearer token
6. Backend validates tag ownership
7. Backend deletes tag (cascade deletes all DocumentTag records)
8. Frontend notifies all components via callback registry
9. Documents list refreshes to remove deleted tag
10. Document drawer removes tag from current document
11. Sidebar removes tag from tag list

### Tag Filtering
1. User clicks tag in sidebar
2. Frontend sends GET /documents?tagId={tagId} with Bearer token
3. Backend filters documents WHERE documentTags.tagId = tagId AND ownerId = userId
4. Frontend displays filtered document list
5. Sidebar highlights selected tag filter

### Tag Synchronization
- React Context (TagsContext) provides shared state across app
- Sidebar, document drawer, and documents page all use same tag state
- Creating tag in any component updates all components immediately
- Callback registry pattern for tag deletion notifications
- Components register callbacks on mount, unregister on unmount
- Prevents stale state and ensures real-time UI updates

### Tag Security
- All tag operations validate user ownership
- Tag names unique per user (constraint: [ownerId, name])
- User can only see and manage their own tags
- Attaching tag validates both document and tag ownership
- Returns 404 if tag or document not found or not owned by user

---

## Export Flow (Implemented)

### Single Document Download
1. User clicks Download button in document drawer (Documents or Search page)
2. Frontend sends GET /documents/:id/download with Bearer token
3. Backend validates authentication and document ownership
4. Backend retrieves PDF from storage via BlobStore.getPdf()
5. Backend streams PDF with Content-Disposition: attachment header
6. Frontend creates blob URL and triggers browser download
7. Browser downloads file with original filename
8. Frontend cleans up blob URL after download

### Multi-Document Export (ZIP)
1. User selects multiple documents via checkboxes
2. User clicks Export button in BulkActionBar
3. ExportModal opens showing count of documents to export
4. User confirms export
5. Frontend sends POST /exports with { documentIds: [...] } and Bearer token
6. Backend validates all documents belong to authenticated user
7. Backend creates ZIP archive using archiver library
8. Backend streams each PDF into ZIP archive
9. Backend finalizes ZIP and streams to response
10. Frontend receives ZIP blob and triggers download
11. Browser downloads ZIP file with timestamp in filename

### Multi-Select Support
- Available on both Documents and Search pages
- Checkboxes for individual selection
- Select All checkbox for bulk selection
- Selected items highlighted with blue background
- BulkActionBar appears when items selected
- Export and Delete actions work on selection
- Selection cleared after export completes

### Export Security
- All export operations validate document ownership
- User can only export their own documents
- Returns 404 if any document not found or not owned
- Continues processing on individual file errors
- ZIP contains only successfully retrieved documents

---

## Export Flow

Phase 1 (sync):
1. User selects documents or filters.
2. API validates ownership.
3. API generates ZIP and streams it back.

Phase 2 (async):
1. User requests export.
2. API enqueues ExportZip job.
3. Worker builds ZIP and stores it temporarily.
4. User downloads ZIP when job is DONE.