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
        └── Users module (internal, no controller yet)
        │
        ▼
Prisma ORM
        │
        ▼
SQLite (dev.db)
        +
Local file storage (server/data/)
```

---

## Domain Model

```
User
  └── ProjectMembership → Project
  └── uploadedDocuments → Document → DocumentText
  └── RefreshToken
```

Rules:
- Documents belong to a project, not a user
- Documents are company-visible by default
- `uploadedById` stored for traceability
- Only admins can delete

---

## Entities

### User
- `id`, `email`, `passwordHash`, `role` (USER | ADMIN)
- `fullName`, `language`, `timezone` (optional profile fields)
- `createdAt`, `updatedAt`

### Project
- `id`, `name` (unique), `createdAt`, `updatedAt`

### ProjectMembership
- Composite key: `userId + projectId`
- Determines upload permission for non-admin users

### Document
- `id`, `projectId`, `uploadedById`
- `originalFilename`, `mimeType`, `sizeBytes`, `storageKey`
- `status` (UPLOADED | QUEUED | PROCESSING | PROCESSED | FAILED)
- `errorMessage`, `uploadedAt`

### DocumentText
- One-to-one with Document
- `extractedText`, `pageCount`, `extractedAt`

### RefreshToken
- `tokenHash` (never stored in plaintext)
- `expiresAt`, `revokedAt`

---

## Document Processing Flow

```
Upload request
    → validate auth
    → validate project exists
    → check membership (or admin)
    → create Document record (status: UPLOADED)
    → save file via BlobStore
    → update storageKey
    → set status: PROCESSING
    → extract text (pdf-parse)
    → save DocumentText
    → set status: PROCESSED

On any failure:
    → set status: FAILED, store errorMessage
```

---

## Storage

Files stored via `BlobStore` interface. Current implementation: `LocalBlobStore`.

Storage key format: `{userId}/{documentId}.pdf`

Path on disk: `server/data/{storageKey}`

The interface is designed to be swapped for an S3-compatible implementation in a later phase without changing business logic.

---

## Authentication

- Access token: short-lived JWT (15m), returned in response body
- Refresh token: longer-lived JWT (7d), stored as HttpOnly cookie
- Refresh token rotation: each use issues a new pair and invalidates the previous
- Logout revokes all refresh tokens for the user
- Passwords hashed with Argon2

---

## Role Enforcement

Enforced in the service layer, not the controller layer.

- Upload: admins bypass membership check; users must have a `ProjectMembership` row
- Delete: service checks `user.role === ADMIN` before proceeding
- Search and list: company-wide, no role restriction

---

## Principles

- Project-first organisation
- Shared company visibility
- Role-based destructive actions
- Storage abstraction for future migration
- Synchronous processing now, async queue in a later phase
