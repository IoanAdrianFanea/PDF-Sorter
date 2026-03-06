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
- Get single document metadata
- Requires JWT authentication
- Validates document ownership (IDOR protection)
- Response: Document object with extractedAt timestamp
- Does NOT include extractedText (too large)

GET /documents/:id/download
- Download original PDF (not yet implemented)

DELETE /documents/:id
- Delete document (not yet implemented)

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
- List tags

POST /tags
- Create tag

DELETE /tags/:id
- Delete tag

POST /documents/:id/tags
- Attach tags to a document

DELETE /documents/:id/tags/:tagId
- Remove tag from a document

---

## Exports

POST /exports
- Export selected/filtered docs as ZIP

GET /exports/:id
- Export status

GET /exports/:id/download
- Download ZIP when ready

---

## Jobs (Phase 3)

GET /jobs/:id
- Job status (queued/processing/done/failed)