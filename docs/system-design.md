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
5. BlobStore saves file to ./storage/{ownerId}/{documentId}.pdf
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

## Search Flow

1. User enters a query.
2. API searches SQLite FTS (scoped to ownerId).
3. API returns results with snippets.

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