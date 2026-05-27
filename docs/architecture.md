# Architecture Overview

Modular monolith. Controller → service → persistence separation throughout.

---

## High-Level Structure

```
Client (React + Vite)
        │
        ▼
NestJS API  (port 3000)
        │
        ├── Auth module
        ├── Projects module
        ├── Documents module
        ├── Exports module
        ├── Users module
        ├── Filters module (Phase 3)
        ├── Archive module (Phase 4)
        ├── Audit module (Phase 2)
        └── Email module (Phase 2)
        │
        ▼
Prisma ORM
        │
        ▼
SQLite (dev.db)
        +
Local file storage (server/data/) — replaced by OneDrive in Phase 5
```

---

## Domain Model

```
User
  └── ProjectMembership → Project → Document → DocumentText
                                  └── DocumentFilterValue → FilterDefinition (Phase 3)
                                  └── DeletionLog (Phase 2)
  └── RefreshToken
  └── EmailVerification (Phase 2)
```

Rules:
- Documents belong to a project
- Non-admin users can only see documents from projects they are members of
- Admins see and manage everything
- `uploadedById` stored on every document for traceability
- All deletions logged with actor, project, and timestamp

---

## Entities

### User
- `id`, `email`, `passwordHash`, `role` (USER | ADMIN)
- `fullName`
- `accountStatus` (PENDING | ACTIVE | REJECTED — Phase 2)
- `emailVerifiedAt` (Phase 2)
- `createdAt`, `updatedAt`

### Project
- `id`, `name` (unique)
- `archivedAt` (nullable — set on archive, cleared on unarchive — Phase 4)
- `createdAt`, `updatedAt`

### ProjectMembership
- Composite key: `userId + projectId`
- Determines visibility and upload permission for non-admin users

### Document
- `id`, `projectId`, `uploadedById`
- `originalFilename`, `mimeType`, `sizeBytes`, `storageKey`
- `status` (UPLOADED | QUEUED | PROCESSING | PROCESSED | FAILED)
- `errorMessage`, `uploadedAt`
- `deletedAt` (nullable — soft delete, Phase 2)

### DocumentText
- One-to-one with Document
- `extractedText`, `pageCount`, `extractedAt`
- Created for PDFs and (from Phase 3) for images via OCR

### FilterDefinition (Phase 3)
- `id`, `name`, `type` (TEXT | NUMBER | DATE), `createdAt`
- Maximum 5 active per company

### DocumentFilterValue (Phase 3)
- Composite key: `documentId + filterDefinitionId`
- `value` (string — typed on read based on definition type)

### DeletionLog (Phase 2)
- `id`, `documentId`, `projectId`, `actorId`
- `deletedAt`, `restoredAt`, `permanentlyDeletedAt`

### RefreshToken
- `tokenHash` (never stored in plaintext)
- `expiresAt`, `revokedAt`

### EmailVerification (Phase 2)
- `id`, `userId`, `tokenHash`, `purpose` (EMAIL_VERIFY | ADMIN_APPROVAL)
- `expiresAt`, `consumedAt`

---

## Document Processing Flow

```
Upload request
    → validate auth + project visibility
    → check membership (or admin)
    → create Document record (status: UPLOADED)
    → save file via BlobStore
    → update storageKey
    → set status: PROCESSING
    → if PDF: extract text (pdf-parse), save DocumentText
    → if image and OCR enabled (Phase 3): OCR, save DocumentText
    → if image and OCR not enabled: skip extraction
    → set status: PROCESSED

On any failure:
    → set status: FAILED, store errorMessage
```

---

## Storage

Files stored via `BlobStore` interface.

Current implementation: `LocalBlobStore`.

### Storage key (current)
`{userId}/{documentId}.{ext}`

### Storage key (Phase 4 — OneDrive)
```
{root}/
  ├── active/{projectId}/{documentId}.{ext}
  ├── archived/{projectId}.zip
  └── deleted/{projectId}/{documentId}.{ext}    (during 30-day window)
```

### Compression (Phase 4)
- Files above threshold (suggested 5MB+) compressed before storage
- Skip compression if file is already compressed (PDF, JPEG)

---

## Authentication & Account Lifecycle (Phase 2)

### Registration flow
1. User submits registration form
2. User created with `accountStatus: PENDING`, `emailVerifiedAt: null`
3. Email sent to admin with approve/reject link
4. Email sent to user with verification link
5. User clicks link → `emailVerifiedAt` set
6. Admin approves → `accountStatus: ACTIVE`
7. User can now log in (both must complete)

### Tokens
- Access token: short-lived JWT (15m), returned in response body
- Refresh token: longer-lived JWT (7d), HttpOnly cookie
- Refresh token rotation: each use issues a new pair and invalidates the previous
- Logout revokes all refresh tokens for the user
- Passwords hashed with Argon2

---

## Authorization

Enforced in the service layer, not the controller layer.

### Visibility (Phase 2 onwards)
- Document list, search, download, export: scoped to projects the user is a member of
- Admin sees everything

### Mutations
- Upload: admins anywhere; users only to assigned projects
- Delete: admins anywhere; users only on documents in their assigned projects
- Project management (create, update, delete, archive): admin only
- User management (list, edit, approve, change role): admin only
- Filter management (create, edit, delete): admin only
- Restore from recycle bin: admin only

---

## Principles

- Project-first organisation
- Project-scoped visibility (non-admins) with admin oversight
- All destructive actions logged and recoverable
- Custom fields configurable by admins
- Storage abstraction for cloud migration
- Synchronous processing now, async queue in Phase 6