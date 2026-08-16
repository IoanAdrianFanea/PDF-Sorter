# Server

NestJS backend for the Construction Document Indexer.

## Stack

- NestJS 11
- Prisma ORM with SQLite (better-sqlite3)
- JWT (access + refresh token rotation)
- Argon2 password hashing
- pdf-parse for text extraction
- archiver for ZIP export
- nodemailer for verification and admin-notification emails

## Setup

```bash
npm install
```

Create `.env` in this directory (see `.env.example`):

```env
DATABASE_URL="file:./dev.db"
FRONTEND_URL="http://localhost:5173"

JWT_ACCESS_SECRET="generate-a-random-secret"
JWT_REFRESH_SECRET="generate-a-different-random-secret"
JWT_ACCESS_TOKEN_EXPIRATION="15m"
JWT_REFRESH_TOKEN_EXPIRATION="7d"

# Optional. If host/user/pass are blank, emails are logged to the console instead of sent.
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="DocIndex <noreply@yourdomain.com>"
```

## Commands

```bash
# Development
npm run start:dev        # watch mode with hot reload, port 3000

# Database
npm run db:migrate       # run migrations (creates dev.db if missing)
npm run db:generate      # regenerate Prisma client after schema changes
npm run db:studio        # open Prisma Studio browser at localhost:5555

# Build
npm run build            # compile TypeScript to dist/
npm run start:prod       # run compiled output

# Tests
npm run test             # unit tests
npm run test:e2e         # end-to-end tests
npm run test:cov         # coverage report
```

## Module Structure

```
src/
├── auth/           JWT auth, refresh tokens, register/verify-email/login/logout/me,
│                   own-profile update, own-password change, password policy decorator
├── documents/      Upload, list, status counts, search, text, download, delete, bulk-delete
├── email/          Nodemailer transport — verification and admin-notification emails
├── exports/        Single-file download and ZIP export of selected documents
├── prisma/         PrismaService wrapper
├── projects/       Project CRUD and membership management
├── storage/        BlobStore interface + LocalBlobStore implementation
└── users/          Admin user management, account status (approve/reject), roles
```

## File Storage

Uploaded files are written to `./data/{userId}/{documentId}.{ext}` relative to the server working directory, where the extension is derived from the mime type (`pdf`, `jpg`, `png`).

The `data/` directory is gitignored and created automatically.

## Authentication Flow

- `POST /auth/register` creates a `PENDING`, email-unverified account and returns a message only — no tokens
- The user receives a verification link; every admin receives a notification to review the request in `/admin/pending`
- `POST /auth/login` rejects the attempt until the email is verified **and** an admin has set the account to `ACTIVE`
- On success it returns an access token (JSON) plus `mustChangePassword`, and sets a refresh token (HttpOnly cookie)
- Access tokens expire after 15 minutes
- `POST /auth/refresh` issues a new pair and invalidates the old refresh token (rotation)
- `POST /auth/logout` revokes all refresh tokens for the user and clears the cookie
- `PATCH /auth/me/password` also revokes all refresh tokens
- All protected endpoints require `Authorization: Bearer <accessToken>`

## Authorization

Admin checks are performed inline in controllers; project-scoping is enforced in the service layer. Non-admins only see documents belonging to projects they are a member of - `getAccessibleProjectIds()` in `DocumentsService` and `ExportsService` returns `null` for admins (unrestricted) and the user's project IDs otherwise.
