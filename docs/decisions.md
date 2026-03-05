# Technical Decisions

This document explains the key architectural and technical decisions made during development.
Each decision prioritizes simplicity, correctness, and production realism.

---

## Authentication Strategy

JWT with Refresh Token Rotation
- Access tokens returned in JSON (sent in Authorization header)
- Refresh tokens stored in HttpOnly cookies (XSS protection)
- Separate secrets for access and refresh tokens
- Token rotation on refresh (old token revoked, new issued)
- Prevents replay attacks and token theft

argon2 for Password Hashing
- More secure than bcrypt
- Industry standard for password storage
- Prevents rainbow table attacks

Never Store Plaintext Tokens
- Only token hashes stored in database
- Refresh tokens hashed before storage
- Prevents database compromise from exposing tokens

---

## Stack Decisions

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

---

## File Upload Implementation

Multipart Form Data
- Standard for file uploads
- Multer middleware (@nestjs/platform-express)
- FileInterceptor handles parsing
- File available as Buffer in memory

pdf-parse Library Version
- Using v1.1.1 (not latest v2.x)
- v1.x has simple functional API: pdfParse(buffer)
- v2.x changed to class-based API causing compatibility issues
- Dynamic require() due to CommonJS module format

Synchronous Processing (Phase 1)
- Upload → Extract → Store happens in single request
- Simple implementation for MVP
- Status transitions tracked in database
- Errors caught and stored in document record

Storage Abstraction Early
- BlobStore interface from day 1
- LocalBlobStore for development
- Easy to swap to S3BlobStore later
- Business logic doesn't depend on storage details

Text Normalization
- Collapse all whitespace to single spaces
- Remove leading/trailing whitespace
- Makes search more reliable
- Prevents formatting artifacts from affecting results