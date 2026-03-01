# Project Plan – PDF Sorter

## Goal

Build a web-based PDF sorting and search tool.

The app allows users to:
- Upload PDFs (single or folder)
- Search documents
- Organize them virtually
- Export sorted results as a ZIP file

The system is local-first. Files are stored locally on the server.


## Tech Stack

Frontend:
- React + Vite + TypeScript

Backend:
- NestJS + TypeScript

Database:
- SQLite

PDF Extraction:
- pdf-parse


## MVP Scope (Phase 1)

### 1. Upload

User action:
- Upload single PDFs
- Upload multiple PDFs
- Upload a folder of PDFs

System behavior:
- Store each PDF locally
- Extract text
- Save metadata + extracted text in database

Definition of done:
- 20+ PDFs upload reliably
- Failed files are reported clearly


### 2. Search

User action:
- Enter keyword search

System behavior:
- Query SQLite full-text index
- Return matching documents with snippet

Definition of done:
- Results are fast
- Clicking result opens preview or allows download


### 3. Export ZIP

User action:
- Export all documents
- Export selected documents
- Export current filtered results

System behavior:
- Create ZIP file
- Inside ZIP, documents are grouped into folders
- ZIP is downloaded
- Temporary ZIP is removed after download

Definition of done:
- ZIP structure matches expected folder grouping
- Download works reliably


## Non-Goals (MVP)

- No microservices
- No distributed architecture
- No complex background job system


## Definition of Done (Project)

- Upload works
- Search works
- Export works
- Code follows clean Nest + React structure
- Documentation is simple and clear