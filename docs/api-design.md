# API Design

All endpoints require `Authorization: Bearer <accessToken>` unless marked Public.

Swagger/OpenAPI is the source of truth for exact schemas — this document is a human-readable summary.

---

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account, returns access token, sets refresh cookie |
| POST | `/auth/login` | Public | Login, returns access token, sets refresh cookie |
| POST | `/auth/refresh` | Cookie | Rotate refresh token, returns new access token |
| POST | `/auth/logout` | JWT | Revoke refresh tokens, clear cookie |
| GET | `/auth/me` | JWT | Current user (no passwordHash) |
| PATCH | `/auth/me` | JWT | Update `fullName`, `language`, `timezone` |

---

## Projects

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/projects` | JWT | List projects. `?scope=uploadable` returns only projects the user can upload to |

**Not yet implemented:**
- `POST /projects` — create project
- `GET /projects/:id` — project detail
- `PATCH /projects/:id` — update project

---

## Documents

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/documents/upload` | JWT | Upload PDF. Body: `multipart/form-data` with `file` + `projectId` |
| GET | `/documents` | JWT | List documents with optional filters (see below) |
| GET | `/documents/search` | JWT | Full-text search. `?q=query` |
| GET | `/documents/:id` | JWT | Document metadata + 150-char text preview |
| GET | `/documents/:id/text` | JWT | Full extracted text |
| GET | `/documents/:id/download` | JWT | Download original file |
| DELETE | `/documents/:id` | JWT + ADMIN | Delete document and file |
| POST | `/documents/bulk-delete` | JWT + ADMIN | Body: `{ documentIds: string[] }` |

### List Documents — Query Params

| Param | Type | Description |
|---|---|---|
| `projectId` | string | Filter by project |
| `mainFilter` | string | Text search across filename and extracted text |
| `supplier` | string | Text search (no dedicated column yet) |
| `materialType` | string | Text search (no dedicated column yet) |
| `quantity` | string | Text search (no dedicated column yet) |
| `orderNumber` | string | Text search (no dedicated column yet) |
| `deliveryDateFrom` | ISO date string | Applied to `uploadedAt` (no dedicated deliveryDate column yet) |
| `deliveryDateTo` | ISO date string | Applied to `uploadedAt` |
| `sortBy` | enum | `upload-newest` \| `upload-oldest` \| `name-asc` \| `name-desc` \| `status` |

---

## Exports

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/exports` | JWT | Export selected docs as ZIP. Body: `{ documentIds: string[] }` |

---

## Users (not yet implemented)

Planned for Phase 1 completion:

- `GET /users` — list users (admin only)
- `POST /users` — create user (admin only)
- `PATCH /users/:id/role` — update role (admin only)

---

## Jobs (Phase 3)

- `GET /jobs/:id` — job status (not implemented)
