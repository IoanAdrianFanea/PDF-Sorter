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


## Principles

- Modular monolith
- Clear layering (controller → service → repository)
- Explicit document status model
- User-scoped data access
- Storage behind abstraction