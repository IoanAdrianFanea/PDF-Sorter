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
        ├── Auth module          ✅ built
        ├── Projects module      ✅ built
        ├── Documents module     ✅ built
        ├── Exports module       ✅ built
        ├── Users module         ✅ built
        ├── Storage module       ✅ built
        ├── Email module         ✅ built (Phase 2)
        ├── Audit module         ⬜ planned (Phase 2 — delete logging)
        ├── Filters module       ⬜ planned (Phase 3)
        └── Archive module       ⬜ planned (Phase 4)
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
- All deletions logged with actor, project, and timestamp — ⬜ **not yet implemented**

---

## Entities

Legend: ✅ present in `schema.prisma` today · ⬜ planned

### User ✅
- `id`, `email`, `passwordHash`, `role` (USER | ADMIN)
- `fullName`, `language`, `timezone` (last two unused — see backlog)
- `accountStatus` (PENDING | ACTIVE | REJECTED)
- `mustChangePassword`
- `emailVerifiedAt`, `emailVerificationToken` (SHA-256 hash of the emailed token)
- `createdAt`, `updatedAt`

### Project ✅
- `id`, `name` (unique)
- `createdAt`, `updatedAt`
- ⬜ `archivedAt` (nullable — set on archive, cleared on unarchive — Phase 4)

### ProjectMembership ✅
- Composite key: `userId + projectId`
- Determines visibility and upload permission for non-admin users

### Document ✅
- `id`, `projectId`, `uploadedById`
- `originalFilename`, `mimeType`, `sizeBytes`, `storageKey`
- `status` (UPLOADED | QUEUED | PROCESSING | PROCESSED | FAILED — `QUEUED` unused until Phase 6)
- `errorMessage`, `uploadedAt`
- ⬜ `deletedAt` (nullable — soft delete, Phase 2 outstanding)

### DocumentText ✅
- One-to-one with Document
- `extractedText`, `pageCount`, `extractedAt`
- Created for PDFs and (from Phase 3) for images via OCR

### RefreshToken ✅
- `tokenHash` (Argon2 hash — never stored in plaintext)
- `expiresAt`, `revokedAt`

### FilterDefinition ⬜ (Phase 3)
- `id`, `name`, `type` (TEXT | NUMBER | DATE), `createdAt`
- Maximum 5 active per company

### DocumentFilterValue ⬜ (Phase 3)
- Composite key: `documentId + filterDefinitionId`
- `value` (string — typed on read based on definition type)

### DeletionLog ⬜ (Phase 2, outstanding)
- `id`, `documentId`, `projectId`, `actorId`
- `deletedAt`, `restoredAt`, `permanentlyDeletedAt`

### EmailVerification ⬜ (superseded)
Originally planned as a separate table. Implemented instead as two columns on `User`
(`emailVerificationToken`, `emailVerifiedAt`). A dedicated table is only needed if
tokens gain expiry, reissue, or a second purpose such as password reset — both of
which are currently missing.

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
3. Notification email sent to every admin, linking to `/admin/pending`
4. Verification email sent to the user with a single-use link
5. User clicks link → `emailVerifiedAt` set, token cleared
6. Admin approves in the pending queue → `accountStatus: ACTIVE`
7. User can now log in (both must complete)

Note: approval is done in the admin console, not via a link in the email. Verification tokens currently have no stored expiry.

### Tokens
- Access token: short-lived JWT (15m), returned in response body
- Refresh token: longer-lived JWT (7d), HttpOnly cookie
- Refresh token rotation: each use issues a new pair and invalidates the previous
- Logout revokes all refresh tokens for the user
- Passwords hashed with Argon2

---

## Authorization

Enforced in the service layer, not the controller layer.

### Visibility ✅ implemented
- Document list, search, details, text, status counts, download, export: scoped to projects the user is a member of
- Admin sees everything
- Implemented as `getAccessibleProjectIds()` in `DocumentsService` and `ExportsService`, which returns `null` for admins (no restriction)

### Mutations
- Upload: admins anywhere; users only to assigned projects — ✅ implemented
- Delete: admins anywhere; users only on documents in their assigned projects — ⬜ **currently admin-only**
- Project management (create, update, delete): admin only — ✅ implemented
- Project archive: admin only — ⬜ Phase 4
- User management (list, edit, approve, change role): admin only — ✅ implemented
- Filter management (create, edit, delete): admin only — ⬜ Phase 3
- Restore from recycle bin: admin only — ⬜ Phase 2 outstanding

Admin checks are currently repeated inline in each controller/service rather than via a shared `RolesGuard`. Worth consolidating.

---

## Principles

- Project-first organisation
- Project-scoped visibility (non-admins) with admin oversight
- All destructive actions logged and recoverable
- Custom fields configurable by admins
- Storage abstraction for cloud migration
- Synchronous processing now, async queue in Phase 6