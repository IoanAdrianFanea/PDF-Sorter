# Construction Document Indexer

A multi-user web application for uploading, organising, searching, and retrieving project-related documents for construction operations.

Built for shared company use — documents are company-visible by default, organised by project, and access is controlled by role.

---

## What It Does

- Authenticated users log in and browse documents across the company
- Documents are grouped by project — projects are the primary organising unit
- Users upload PDFs to projects they are assigned to
- Uploaded PDFs are text-extracted and made searchable immediately
- Full-text search with contextual snippets runs across all documents
- Admins can delete documents and have unrestricted upload access
- Selected documents can be downloaded individually or exported as a ZIP

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router v7

**Backend**
- NestJS 11
- Prisma ORM + SQLite (via better-sqlite3)
- JWT authentication (access + refresh token rotation)
- Argon2 password hashing
- `pdf-parse` for text extraction
- `archiver` for ZIP export
- `cookie-parser` for HttpOnly refresh token cookie

---

## Project Structure

```
/
├── client/          React frontend
├── server/          NestJS backend
├── docs/            Architecture and planning documents
└── .gitignore
```

---

## Running Locally

### Prerequisites

- Node.js 20+
- npm

### 1. Server

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL="file:./dev.db"
FRONTEND_URL="http://localhost:5173"

JWT_ACCESS_SECRET="your-access-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
JWT_ACCESS_TOKEN_EXPIRATION="15m"
JWT_REFRESH_TOKEN_EXPIRATION="7d"
```

Apply database migrations and start:

```bash
npm run db:migrate     # applies all Prisma migrations and creates dev.db
npm run start:dev      # starts server on http://localhost:3000 with hot reload
```

Other useful server commands:

```bash
npm run db:studio      # opens Prisma Studio (database browser)
npm run db:generate    # regenerates Prisma client after schema changes
npm run build          # compiles to dist/
```

### 2. Client

```bash
cd client
npm install
npm run dev            # starts Vite dev server on http://localhost:5173
```

The client reads `VITE_API_URL` from environment. If not set, it defaults to `http://localhost:3000`. Create `client/.env.local` to override:

```env
VITE_API_URL=http://localhost:3000
```

---

## Storage

Uploaded files are stored locally under `server/data/` at:

```
server/data/{userId}/{documentId}.pdf
```

This directory is gitignored. It is created automatically on first upload.

In a later phase this will be abstracted behind an S3-compatible interface using the existing `BlobStore` abstraction.

---

## Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `DATABASE_URL` | `server/.env` | SQLite file path |
| `FRONTEND_URL` | `server/.env` | Allowed CORS origin (currently unused in code — CORS allows all localhost) |
| `JWT_ACCESS_SECRET` | `server/.env` | Signs access tokens |
| `JWT_REFRESH_SECRET` | `server/.env` | Signs refresh tokens |
| `JWT_ACCESS_TOKEN_EXPIRATION` | `server/.env` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_TOKEN_EXPIRATION` | `server/.env` | Refresh token TTL (e.g. `7d`) |
| `VITE_API_URL` | `client/.env.local` | Backend base URL |

---

## Roles

| Role | Capabilities |
|---|---|
| `USER` | Login, upload to assigned projects, browse, search, download, export |
| `ADMIN` | Everything a USER can do, plus delete documents and upload to any project |

Users are assigned to projects via `ProjectMembership`. Admins bypass membership checks.

---

## API Overview

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /auth/register` | Public | Creates user account |
| `POST /auth/login` | Public | Returns access token, sets refresh cookie |
| `POST /auth/refresh` | Cookie | Rotates refresh token |
| `POST /auth/logout` | JWT | Revokes refresh tokens, clears cookie |
| `GET /auth/me` | JWT | Returns current user |
| `PATCH /auth/me` | JWT | Updates profile fields (fullName, language, timezone) |
| `GET /projects` | JWT | Lists projects (supports `?scope=uploadable`) |
| `POST /documents/upload` | JWT | Uploads PDF, extracts text, links to project |
| `GET /documents` | JWT | Lists documents with filters and sorting |
| `GET /documents/search` | JWT | Full-text search with snippets (`?q=query`) |
| `GET /documents/:id` | JWT | Document metadata and text preview |
| `GET /documents/:id/text` | JWT | Full extracted text |
| `GET /documents/:id/download` | JWT | Downloads original PDF |
| `DELETE /documents/:id` | JWT + ADMIN | Deletes document and file |
| `POST /documents/bulk-delete` | JWT + ADMIN | Bulk delete |
| `POST /exports` | JWT | Exports selected documents as ZIP |

---

## Phase Status

See `docs/project-plan.md` for full detail.

**Phase 1 – Core Operational MVP** — mostly complete. Two items outstanding:
- Image upload support (currently PDF-only)
- Project creation and user management endpoints (currently read-only via API)

**Phase 2 onwards** — not started.

---

## Non-Goals (Current Phases)

- Microservices
- Distributed tracing
- Email ingestion
- OCR for scanned images
- Offline sync
- Native Windows / Android apps (to be evaluated after workflows are stable)
