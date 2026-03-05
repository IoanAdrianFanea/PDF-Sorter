# Architecture Overview

This document describes the high-level system structure and design principles.
The goal is to keep the architecture modular, secure, and production-ready without unnecessary complexity.

---

## High-Level Structure

User
  ↓
React Frontend
  ↓
NestJS API (with JWT Auth)
  ↓
SQLite (users + metadata + FTS)
  ↓
Blob Storage (Local or S3)

Phase 3 adds:

API
  ↓
Queue
  ↓
Worker


## Authentication Layer

Security Model:
- Access tokens (short-lived, 15m) sent in Authorization header
- Refresh tokens (long-lived, 7d) stored in HttpOnly cookies
- Refresh token rotation on every refresh request
- Passwords hashed with argon2
- Only token hashes stored in database (never plaintext)

Components:
- AuthController: HTTP endpoints for register/login/refresh/logout/me
- AuthService: Business logic for token generation and validation
- UsersService: User database operations
- JwtStrategy: Passport strategy to validate JWT tokens
- JwtAuthGuard: Decorator to protect routes


## Document Processing Layer

Components:
- DocumentsController: Upload endpoint with validation
- DocumentsService: Orchestrates upload, storage, and extraction
- ExtractionService: PDF text extraction using pdf-parse
- BlobStore interface: Storage abstraction
- LocalBlobStore: Local filesystem implementation

Storage Model:
- Directory structure: ./data/{ownerId}/{documentId}.pdf
- Storage key format: "{ownerId}/{documentId}.pdf"
- Easy to organize by user and migrate to S3

Status Flow:
UPLOADED → PROCESSING → PROCESSED | FAILED

Security:
- All endpoints protected with JwtAuthGuard
- User ID extracted from JWT payload
- All queries filtered by ownerId
- IDOR protection: return 404 for other users' documents

Validation:
- File type: application/pdf only
- File size: 25MB maximum
- Multer middleware handles multipart parsing

## Principles

- Modular monolith
- Clear layering (controller → service → repository)
- Explicit document status model
- User-scoped data access
- Storage behind abstraction
- Security by default (auth on all routes)
- Fail-safe error handling (mark FAILED, never lose uploads)