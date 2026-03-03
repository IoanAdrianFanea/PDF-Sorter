# Technical Decisions

This document explains the key architectural and technical decisions made during development.
Each decision prioritizes simplicity, correctness, and production realism.

---

Web Application
- Easier to deploy and demo
- API-first backend design

Multi-User from Early Stage
- Enforces real authorization boundaries
- Prevents "student project" smell

SQLite + FTS for MVP
- Simple setup
- Good performance for indexing
- Easy to migrate later if needed

ZIP Export
- Safe way to provide organized output
- Avoids modifying user file system

Async Processing (Later Phase)
- Improves responsiveness
- Reflects real backend architecture

Storage Abstraction
- Local storage for development
- S3-ready for deployment

Structured Logging
- Request IDs
- Clear error formatting
- Production debugging readiness