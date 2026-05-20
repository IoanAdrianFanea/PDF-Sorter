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
| POST | `/projects` | JWT + ADMIN | Create project |
| GET | `/projects/:id` | JWT + ADMIN | Get project details + members |
| PATCH | `/projects/:id` | JWT + ADMIN | Update project name |
| DELETE | `/projects/:id` | JWT + ADMIN | Delete project and all its documents permanently |
| GET | `/projects/:id/members` | JWT + ADMIN | Get project members |
| POST | `/projects/:id/members` | JWT + ADMIN | Add user to project |
| DELETE | `/projects/:id/members/:userId` | JWT + ADMIN | Remove user from project |

### POST /projects — Body

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Project name (must be unique) |

### PATCH /projects/:id — Body

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | New project name |

### POST /projects/:id/members — Body

| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | string | ✅ | ID of user to add to project |

### Project Response Object (`GET /projects/:id`)

```json
{
    "id": "...",
    "name": "...",
    "createdAt": "...",
    "members": [
        {
            "userId": "...",
            "email": "...",
            "fullName": "...",
            "role": "USER | ADMIN"
        }
    ]
}
```

### Member Response Object (`GET /projects/:id/members`)

```json
[
    {
        "userId": "...",
        "email": "...",
        "fullName": "...",
        "role": "USER | ADMIN"
    }
]
```

---

## Documents

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/documents/upload` | JWT | Upload file (PDF, JPEG, PNG — max 50MB). Body: `multipart/form-data` with `file` + `projectId` |
| GET | `/documents` | JWT | List documents with optional filters (see below) |
| GET | `/documents/search` | JWT | Full-text search. `?q=query` |
| GET | `/documents/:id` | JWT | Document metadata + 150-char text preview |
| GET | `/documents/:id/text` | JWT | Full extracted text (PDFs only — images have no extracted text until OCR is added) |
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

## Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | JWT + ADMIN | List all users |
| GET | `/users/:id` | JWT | Fetch single user. Admins can fetch anyone; users can only fetch their own (403 otherwise) |
| POST | `/users` | JWT + ADMIN | Create user with temporary password |
| POST | `/users/:id/role` | JWT + ADMIN | Set user role |

### POST /users — Body

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | ✅ | User email address |
| `password` | string | ✅ | Temporary password, user should change on first login |
| `fullName` | string | ✅ | Display name |
| `role` | `USER` \| `ADMIN` | ✅ | Assigned role |

### POST /users/:id/role — Body

| Field | Type | Required | Description |
|---|---|---|---|
| `role` | `USER` \| `ADMIN` | ✅ | New role to assign |

### User Response Object

All endpoints return the same user shape (no passwordHash):

| Field | Type |
|---|---|
| `id` | string |
| `email` | string |
| `fullName` | string |
| `role` | `USER` \| `ADMIN` |
| `createdAt` | ISO date string |

---

## Jobs (Phase 3)

- `GET /jobs/:id` — job status (not implemented)