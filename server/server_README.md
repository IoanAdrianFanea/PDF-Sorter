# Server

NestJS backend for the Construction Document Indexer.

## Stack

- NestJS 11
- Prisma ORM with SQLite (better-sqlite3)
- JWT (access + refresh token rotation)
- Argon2 password hashing
- pdf-parse for text extraction
- archiver for ZIP export

## Setup

```bash
npm install
```

Create `.env` in this directory:

```env
DATABASE_URL="file:./dev.db"
FRONTEND_URL="http://localhost:5173"

JWT_ACCESS_SECRET="generate-a-random-secret"
JWT_REFRESH_SECRET="generate-a-different-random-secret"
JWT_ACCESS_TOKEN_EXPIRATION="15m"
JWT_REFRESH_TOKEN_EXPIRATION="7d"
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
├── auth/           JWT auth, refresh tokens, login/register/logout/me
├── documents/      Upload, list, search, download, delete, bulk-delete
├── exports/        ZIP export of selected documents
├── prisma/         PrismaService wrapper
├── projects/       Project listing with scope filter
├── storage/        BlobStore interface + LocalBlobStore implementation
└── users/          UsersService (used internally by auth)
```

## File Storage

Uploaded files are written to `./data/{userId}/{documentId}.pdf` relative to the server working directory.

The `data/` directory is gitignored and created automatically.

## Authentication Flow

- `POST /auth/login` returns an access token (JSON) and sets a refresh token (HttpOnly cookie)
- Access tokens expire after 15 minutes
- `POST /auth/refresh` issues a new pair and invalidates the old refresh token (rotation)
- `POST /auth/logout` revokes all refresh tokens for the user and clears the cookie
- All protected endpoints require `Authorization: Bearer <accessToken>`
