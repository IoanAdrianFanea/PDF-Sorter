# PDF Sorter / Indexer

PDF Sorter is a multi-user web application for uploading, indexing, searching, and organizing PDFs.

The system focuses on secure document management with full-text search, tag-based organization, and a clean backend architecture.

---

## Features

### Authentication
- JWT authentication
- Refresh token rotation
- Argon2 password hashing
- Per-user document isolation

### Document Processing
- Upload single or multiple PDFs
- Local file storage
- Text extraction using `pdf-parse`
- Page count detection
- Document status tracking

### Document Access
- Document list and metadata
- Extracted text preview
- Download individual PDFs
- Delete single or multiple documents

### Search
- Full-text search across extracted content
- Contextual snippets with highlighting
- Search across document names and content

### Organization
- Tag creation and management
- Attach/remove tags from documents
- Filter documents by tag

### Export
- Download individual PDFs
- Export selected documents as ZIP

---

## Tech Stack

Frontend:
- React
- TypeScript
- Vite

Backend:
- NestJS
- Prisma ORM
- SQLite

Authentication:
- JWT
- Refresh tokens
- Argon2 password hashing

Document Processing:
- `pdf-parse` for text extraction

---

## Architecture Overview

The system follows a modular backend architecture:


Client (React)
│
▼
NestJS API
│
├── Authentication (JWT + refresh tokens)
├── Document module
├── Tag module
├── Export module
│
▼
Prisma ORM
│
▼
SQLite


Uploaded PDFs are stored locally and processed to extract searchable text.

A detailed runtime flow description can be found in:


docs/system-design.md


---

## Project Phases

### Phase 1 – Secure Core MVP ✅

- Authentication
- PDF upload and extraction
- Document metadata and details
- Full-text search with snippets
- Tagging system
- Document deletion
- ZIP export

### Phase 2 – Product Dashboard

- Favorites
- Recent documents view
- Improved filtering and sorting
- Sidebar status counters
- Storage usage indicator
- Profile/account UI
- Upload progress and better loading states

### Phase 3 – Async Processing

- API + worker architecture
- Job queue for document processing
- Background text extraction
- Job status endpoints
- Retry failed jobs

### Phase 4 – Deployment

- S3 object storage
- HTTPS deployment
- Structured production logging
- Environment configuration

---

## Setup

Instructions for running the project locally will be added soon.

---

## Non-Goals

This project intentionally avoids unnecessary complexity:

- Microservices
- Distributed tracing
- Overengineered infrastructure