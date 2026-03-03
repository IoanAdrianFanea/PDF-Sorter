# API Design

This document lists the main endpoints at a high level.
Swagger/OpenAPI is the source of truth for full request/response schemas.

All endpoints are authenticated unless noted.
All document/tag/export operations are scoped to the authenticated user.

---

## Auth

POST /auth/login
- Log in

POST /auth/logout
- Log out

GET /me
- Get current user

(Optional) POST /auth/register
- Create account

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