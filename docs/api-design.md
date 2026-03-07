# API Design

This document lists the main endpoints at a high level.
Swagger/OpenAPI is the source of truth for full request/response schemas.

All endpoints are authenticated unless noted.
All document/tag/export operations are scoped to the authenticated user.

---

## Auth

POST /auth/register
- Create new user account
- Request: { email, password }
- Response: { accessToken }
- Sets refresh token in HttpOnly cookie

POST /auth/login
- Authenticate user
- Request: { email, password }
- Response: { accessToken }
- Sets refresh token in HttpOnly cookie

POST /auth/refresh
- Get new access token using refresh token
- Reads refresh token from HttpOnly cookie
- Response: { accessToken }
- Rotates refresh token (revokes old, issues new)

POST /auth/logout
- Revoke all refresh tokens
- Requires JWT authentication
- Clears refresh token cookie

GET /auth/me
- Get current authenticated user
- Requires JWT authentication
- Response: user object (without passwordHash)

---

## Documents

POST /documents/upload
- Upload a single PDF file
- Content-Type: multipart/form-data
- Field name: 'file'
- Max size: 25MB
- Requires JWT authentication
- Request: FormData with PDF file
- Response: { id: string, status: DocumentStatus }
- Synchronous processing (Phase 1)

GET /documents
- List all documents for authenticated user
- Requires JWT authentication
- Response: Document[] (ordered by uploadedAt desc)
- Fields: id, originalFilename, mimeType, sizeBytes, uploadedAt, status, errorMessage, extractedAt

GET /documents/:id
- Get single document metadata with details
- Requires JWT authentication
- Validates document ownership (IDOR protection)
- Response: Document object with:
  - id, originalFilename, mimeType, sizeBytes, uploadedAt, status, errorMessage
  - extractedAt: timestamp when text was extracted
  - pageCount: number of pages in PDF (null if not available)
  - textPreview: first 150 characters of extracted text with "..." suffix
- Does NOT include full extractedText (use /documents/:id/text for that)

GET /documents/:id/text
- Get full extracted text for a document
- Requires JWT authentication
- Validates document ownership (IDOR protection)
- Response: { documentId: string, extractedText: string, extractedAt: string }
- Returns 404 if no text extracted yet

GET /documents/:id/download
- Download original PDF (not yet implemented)

DELETE /documents/:id
- Delete a single document
- Requires JWT authentication
- Validates document ownership (IDOR protection)
- Deletes physical file from storage
- Cascade deletes DocumentText and DocumentTag records
- Response: { success: true }
- Returns 404 if document not found or not owned by user

POST /documents/bulk-delete
- Delete multiple documents in one request
- Requires JWT authentication
- Request: { documentIds: string[] }
- Validates ownership for each document
- Processes each delete individually
- Response: { deleted: number, failed: string[] }
- Returns count of successfully deleted documents
- Returns array of IDs that failed to delete

---

## Search

GET /documents/search?q={query}
- Search documents by content with contextual snippets
- Requires JWT authentication
- Query parameter: q (string, min 2 characters)
- Searches inside DocumentText.extractedText (case-insensitive)
- Returns max 20 results ordered by uploadedAt DESC
- Response: { results: SearchResult[] }
- SearchResult: { documentId: string, filename: string, snippet: string }
- Snippet format: "... text before <mark>match</mark> text after ..."
- Only searches documents owned by authenticated user

---

## Tags

GET /tags
- List all tags for authenticated user
- Returns: { tags: [{ id, name, createdAt }] }
- Ordered alphabetically by name

POST /tags
- Create new tag
- Body: { name: string }
- Validates: name required, non-empty
- Returns: { id, name, ownerId, createdAt, updatedAt }
- 409 Conflict if tag name already exists for user

DELETE /tags/:id
- Delete tag and remove from all documents
- Validates ownership
- Cascade deletes all DocumentTag records
- Returns: 200 OK on success

POST /documents/:id/tags
- Attach tag to document
- Body: { tagId: string }
- Validates: both document and tag owned by authenticated user
- Creates DocumentTag record
- Returns: document with updated tags array

DELETE /documents/:id/tags/:tagId
- Remove tag from document
- Validates: document ownership
- Deletes DocumentTag record
- Returns: 200 OK on success

GET /documents?tagId={tagId}
- Filter documents by tag
- Works with existing pagination/sorting
- Returns only documents with specified tag

---

## Exports

GET /documents/:id/download
- Download single document PDF
- Returns: PDF file with Content-Disposition: attachment
- Validates ownership
- Filename preserved from original upload

POST /exports
- Export multiple documents as ZIP archive
- Body: { documentIds: string[] }
- Validates: all documents owned by authenticated user
- Returns: ZIP file stream with timestamp filename
- Uses archiver library for ZIP creation
- Continues on individual file errors
- Export selected/filtered docs as ZIP

GET /exports/:id
- Export status

GET /exports/:id/download
- Download ZIP when ready

---

## Jobs (Phase 3)

GET /jobs/:id
- Job status (queued/processing/done/failed)