# Project Plan – Construction Document Indexer

This document outlines the scope and phases of the project.
The system focuses on building a practical internal document indexing and retrieval tool for operational teams in a construction environment.

---

## Goal

Build a multi-user application for uploading, organizing, searching, and retrieving project-related documents.

The system emphasizes:

- fast document retrieval
- project-based organization
- shared company document visibility
- role-based permissions
- support for PDFs and images
- clean architecture
- reproducible setup

Primary users:

- procurement team
- managers
- quantity surveyors

---

## Product Direction

This is not a personal document organizer.

It is a shared company document system where:

- documents are visible across the company by default
- projects are the main organizing structure
- uploadedBy is stored for traceability
- higher-authority users can delete documents
- the main problem being solved is slow manual lookup

---

## Core Features

- Authentication
- Role-based access control
- Project management
- Upload documents (PDF + images)
- Store metadata
- PDF text extraction
- Search by filename/content
- Project-first browsing
- Document preview
- Download original file
- Export selected documents as ZIP

---

## Phases

## Phase 1 – Core Operational MVP

- Authentication
- USER / ADMIN roles
- Project entity
- Upload documents
- Support PDFs and images
- Store document metadata
- PDF text extraction
- Search with snippets
- Project-based document listing
- Document preview/details
- Download original file
- Export selected documents as ZIP

---

## Phase 2 – Operational Usability

- Better sorting and filtering
- Table-style document view
- Improved project navigation
- Better metadata display
- Upload progress indicators
- Processing/error indicators
- Better handling of large document lists

---

## Phase 3 – Processing and Scalability

- Async document processing
- API + worker split
- Queue-based extraction pipeline
- Retry failed jobs
- Background export jobs
- Better performance for larger datasets

---

## Phase 4 – Deployment

- Cloud/local deployment choice based on company needs
- Object storage abstraction (S3-compatible or local)
- HTTPS deployment
- Structured logging
- Environment-based configuration
- Backup/recovery planning

---

## Phase 5 – Later Extensions

- OCR for scanned images/photos
- Email attachment ingestion
- Offline-friendly document viewing
- Native/mobile exploration if business value is proven

---

## Non-Goals (Early Versions)

- Microservices
- Distributed tracing
- AI-heavy automation
- Complex workflow engines
- Native Windows/Android apps in early implementation