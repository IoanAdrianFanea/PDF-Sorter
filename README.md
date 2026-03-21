# PDF Sorter / Indexer

PDF Sorter / Indexer is a multi-user document indexing and retrieval system being built for a company use case in a construction environment.

The project started as a PDF sorting tool, but has since been realigned into a shared, project-based document system for operational teams who need to upload, organize, search, and retrieve project documents quickly.

The goal is to reduce time lost in manual document lookup while keeping the architecture clean, secure, and production-aware.

---

## Purpose

This system is being built for a real company workflow rather than as a generic personal document manager.

It is designed around a shared company document model where:

- documents are visible across the company by default
- projects are the main organizing unit
- uploadedBy is stored for traceability
- destructive actions are role-restricted
- the main problem being solved is fast retrieval of operational documents

Primary users include:

- procurement teams
- managers
- quantity surveyors
- other operational staff working across office and site contexts

---

## Current Product Direction

This is not a personal PDF library.

The system is evolving into a practical internal document platform for project-related files such as delivery, materials, equipment, and supporting operational documents.

Current product direction:

- company-shared document access
- project-based organization
- support for PDFs and images
- search-focused retrieval
- role-based permissions
- clean backend architecture
- storage abstraction for local or future object storage
- web-first delivery with room for later desktop/mobile-friendly workflows

---

## Core Features

### Authentication
- JWT authentication
- Refresh token rotation
- Argon2 password hashing
- Authenticated API access

### Access Control
- USER / ADMIN role model
- Company-wide document visibility
- Project-based upload permissions
- Admin-only destructive actions such as delete

### Projects
- Project-based document organization
- Project listing for authenticated users
- Project association required during upload

### Document Processing
- Upload single or multiple PDFs
- Support for PDFs and images
- Local blob/file storage
- Text extraction for PDFs
- Page count detection
- Document status tracking
- Failure status and error handling

### Document Access
- Document list and metadata
- Project-aware browsing
- Extracted text preview/details
- Download original files
- Export selected documents as ZIP

### Search
- Full-text search across extracted content
- Search across filenames and useful metadata
- Contextual snippets where available

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- NestJS
- Prisma ORM
- SQLite

### Authentication
- JWT
- Refresh tokens
- Argon2 password hashing

### Document Processing
- PDF text extraction
- Modular upload and processing flow

### Storage
- Local filesystem storage in development
- Storage abstraction for later S3-compatible/object storage

---

## Architecture Overview

The system follows a modular monolith structure:

User  
↓  
Frontend Client  
↓  
NestJS API  
↓  
Database (users + projects + documents + extracted text + metadata)  
↓  
Blob Storage (Local or S3-compatible)

Later phases may introduce:

API  
↓  
Queue  
↓  
Worker

Key architectural rules:

- documents are company-visible by default
- projects are the main organizational structure
- uploadedBy is stored for traceability
- delete and user-management actions are role-restricted
- storage is abstracted behind a blob storage interface

A more detailed overview can be found in:

- `docs/architecture.md`
- `docs/system-design.md`
- `docs/api-design.md`
- `docs/decisions.md`

---

## Current Domain Model

### User
Represents a company user who can access the system.

### Project
Represents the main organizational container for documents.

### Document
Represents an uploaded operational document associated with a project.

### DocumentText
Stores extracted searchable text for supported files such as PDFs.

---

## Runtime Behavior

### Upload Flow
1. User uploads a PDF or image
2. API validates authentication
3. API validates file type and size
4. API validates the selected project
5. API creates the document record
6. API stores the file through the blob storage layer
7. If the file is a PDF, extraction runs
8. Extracted text is stored
9. Document status becomes `PROCESSED`

If processing fails:
- document status becomes `FAILED`
- error details are stored

### Search Flow
1. User enters a search query
2. User optionally filters by project
3. API searches filenames, extracted text, and relevant metadata
4. API returns matching documents with snippets
5. User opens details or downloads the document

---

## Roadmap

### Phase 1 – Core Operational MVP
- Authentication
- USER / ADMIN roles
- Projects
- Upload documents
- PDF text extraction
- Search with snippets
- Project-based document listing
- Document preview/details
- Download original files
- Export selected documents as ZIP

### Phase 2 – Operational Usability
- Better sorting and filtering
- Table-style document view
- Improved project navigation
- Better metadata display
- Upload progress indicators
- Processing/error indicators
- Better handling of larger document lists

### Phase 3 – Processing and Scalability
- Async document processing
- API + worker split
- Queue-based extraction pipeline
- Retry failed jobs
- Background export jobs
- Job status endpoints

### Phase 4 – Deployment
- Cloud or on-prem friendly deployment
- HTTPS
- Object storage
- Structured logging
- Environment-based configuration
- Backup and recovery planning

### Phase 5 – Later Extensions
- OCR for scanned images/photos
- Email attachment ingestion
- Offline-friendly viewing
- Further platform exploration if business value is proven

---

## Current Status

The project has already moved beyond the original tag-based PDF organizer concept and is being actively refactored into a company-ready, project-first document system.

Completed or in progress:
- authentication architecture
- upload pipeline
- text extraction flow
- search
- export
- transition from owner-based access to company-visible documents
- transition from tag-based organization to project-based organization
- role-based access control foundations

This means the project is not being restarted from zero; it is being redirected into a more realistic internal product.

---

## Non-Goals (Early Versions)

To keep the system practical and focused, early versions intentionally avoid:

- microservices
- distributed tracing
- overengineered infrastructure
- AI-heavy automation
- complex workflow engines
- immediate multi-platform native rollout
- full offline sync in early implementation

---

## Documentation

Project documentation lives in the `docs/` directory.

Recommended reading order:

1. `docs/project-plan.md`
2. `docs/architecture.md`
3. `docs/system-design.md`
4. `docs/api-design.md`
5. `docs/decisions.md`
6. `docs/roadmap.md`

---

## Local Setup

Setup instructions are still being cleaned up as the project is actively evolving.

Planned local setup documentation will cover:

- backend installation
- frontend installation
- environment variables
- Prisma migration flow
- local storage setup
- running the client and server locally

---

## Why This Project Matters

This project is being built around a real operational problem: teams waste time manually searching through project documents spread across different files and folders.

The aim is to provide a shared internal system that makes project document retrieval faster, clearer, and more reliable, while keeping the implementation maintainable and realistic.