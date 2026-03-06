# Project Plan – PDF Sorter / Indexer

This document outlines the scope and phases of the project.
It focuses on delivering a secure, production-aware PDF indexing and organization tool without overengineering.

---

## Goal

Build a multi-user web app for uploading, indexing, organizing, and exporting PDFs.

The system emphasizes:
- Secure multi-user boundaries
- Full-text search
- Tag-based organization
- Async processing (later phase)
- Clean architecture
- Reproducible setup


## Core Features

- Authentication (per-user isolation)
- Upload single/multiple PDFs
- Extract and index text (SQLite FTS)
- Document status tracking
- Tagging + filtering
- Download PDF
- Export selected/filtered documents as ZIP


## Phases

Phase 1 – Secure MVP
- ✅ Auth (JWT with refresh token rotation, argon2 password hashing)
- ✅ User model with refresh token storage
- ✅ Upload + extraction (single/multiple PDFs with pdf-parse, page count capture)
- ✅ Document details (metadata with page count and text preview)
- ✅ Search + snippets (contextual search with highlighting)
- ✅ Delete (single document, bulk delete with cascade)
- Tags (not yet implemented)
- Export ZIP (not yet implemented)

Phase 2 – Production Layer
- Structured logging
- Validation
- Swagger docs
- Authorization tests

Phase 3 – Async Processing
- API + Worker split
- Queue
- Job status endpoints

Phase 4 – Deployment
- S3 storage
- HTTPS
- Production logging


## Non-Goals

- Microservices
- Distributed tracing
- Overengineered infrastructure