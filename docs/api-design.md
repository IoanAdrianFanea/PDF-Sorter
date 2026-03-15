# API Design

This document lists the main endpoints at a high level.

Swagger/OpenAPI remains the source of truth for exact request/response schemas.

All endpoints require authentication unless stated otherwise.

Documents are company-visible by default.
Some actions are role-restricted.

---

## Auth

POST /auth/register
- Create new user account

POST /auth/login
- Authenticate user

POST /auth/refresh
- Refresh access token

POST /auth/logout
- Log out current user

GET /auth/me
- Get current authenticated user

---

## Users

GET /users
- List users (admin only)

POST /users
- Create user (admin only)

PATCH /users/:id/role
- Update user role (admin only)

---

## Projects

GET /projects
- List projects

POST /projects
- Create project

GET /projects/:id
- Get project details

PATCH /projects/:id
- Update project

---

## Documents

POST /documents/upload
- Upload PDF or image
- Requires project association

GET /documents
- List documents
- Supports filtering by project/status

GET /documents/:id
- Get document metadata/details

GET /documents/:id/download
- Download original file

DELETE /documents/:id
- Delete document (admin only)

---

## Search

GET /documents/search?q={query}
- Search by filename, extracted text, and selected metadata
- Returns contextual snippets where available

---

## Exports

POST /exports
- Export selected documents as ZIP

GET /exports/:id
- Export status (later phase)

GET /exports/:id/download
- Download export archive

---

## Jobs (Later Phase)

GET /jobs/:id
- Job status