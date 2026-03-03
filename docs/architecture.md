# Architecture Overview

This document describes the high-level system structure and design principles.
The goal is to keep the architecture modular, secure, and production-ready without unnecessary complexity.

---

## High-Level Structure

User
  ↓
React Frontend
  ↓
NestJS API
  ↓
SQLite (metadata + FTS)
  ↓
Blob Storage (Local or S3)

Phase 3 adds:

API
  ↓
Queue
  ↓
Worker


## Principles

- Modular monolith
- Clear layering (controller → service → repository)
- Explicit document status model
- User-scoped data access
- Storage behind abstraction