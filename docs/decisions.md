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