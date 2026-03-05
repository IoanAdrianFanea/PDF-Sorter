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

POST /documents
- Upload one or multiple PDFs

GET /documents
- List documents (supports filters like status/tag/date)

GET /documents/:id
- Document metadata + status + tags

GET /documents/:id/download
- Download original PDF

---

## Search

GET /search?q=...
- Full-text search with snippets

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