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

---

## Core Features

- Authentication (per-user isolation)
- Upload single/multiple PDFs
- Extract and index text
- Document status tracking
- Tagging + filtering
- Download PDF
- Export selected/filtered documents as ZIP

---

## Phases

Phase 1 – Secure Core MVP

- ✅ Auth (JWT with refresh token rotation, argon2 password hashing)
- ✅ User model with refresh token storage
- ✅ Upload + extraction (single/multiple PDFs with pdf-parse, page count capture)
- ✅ Document details (metadata with page count and text preview)
- ✅ Search + snippets (contextual search with highlighting)
- ✅ Delete (single document, bulk delete with cascade)

- Tags (not yet implemented)
- Export ZIP (not yet implemented)
- Basic filter/sort (optional if simple)

---

Phase 2 – Product Dashboard

- Favorites
- Recent documents view
- Improved filter/sort UI
- Sidebar counters (processed / processing / failed)
- Storage usage indicator
- Profile/account dropdown
- Upload progress & better loading states

---

Phase 3 – Async Processing

- API + Worker split
- Queue for document processing
- Background text extraction
- Job status endpoints
- Retry failed jobs

---

Phase 4 – Deployment

- S3 object storage
- HTTPS deployment
- Structured production logging
- Environment configuration

---

## Non-Goals

- Microservices
- Distributed tracing
- Overengineered infrastructure