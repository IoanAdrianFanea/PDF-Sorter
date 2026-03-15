# Architecture Overview

This document describes the high-level system structure and design principles.

The goal is to keep the architecture modular, secure, and production-aware without unnecessary complexity.

---

## High-Level Structure

User
  ↓
Frontend Client
  ↓
NestJS API
  ↓
Database (users + projects + documents + extracted text + metadata)
  ↓
Blob Storage (Local or S3-compatible)

Later phases introduce:

API
  ↓
Queue
  ↓
Worker

---

## Core Domain Model

Company
  ↓
Users
  ↓
Projects
  ↓
Documents

Important rules:

- documents are company-visible by default
- projects are the main organizational unit
- uploadedBy is stored for traceability
- delete/user-management actions are role-restricted

---

## Main Entities

### User
Represents a company user who can access the system.

Key properties:
- id
- email
- passwordHash
- role
- createdAt
- updatedAt

### Project
Represents a construction project or site grouping.

Key properties:
- id
- name
- code (optional)
- createdAt
- updatedAt

### Document
Represents an uploaded operational document.

Key properties:
- id
- projectId
- uploadedById
- originalFilename
- mimeType
- sizeBytes
- storageKey
- status
- errorMessage
- createdAt
- updatedAt

### DocumentText
Stores extracted searchable text for PDFs.

Key properties:
- documentId
- extractedText
- pageCount
- extractedAt

---

## Role Model

Two initial roles are enough:

### USER
Can:
- log in
- upload documents
- browse project documents
- search documents
- preview/download/export documents

### ADMIN
Can do everything USER can, plus:
- delete documents
- manage users
- manage higher-level system actions

This keeps authorization realistic without overengineering.

---

## Document Processing Layer

### Components

**DocumentsController**
- upload
- list
- get details
- download
- delete
- search

**DocumentsService**
- orchestrates metadata storage
- project association
- file storage
- extraction
- search
- deletion

**ExtractionService**
- extracts text from PDFs

**BlobStore**
- abstract storage interface

**LocalBlobStore**
- local filesystem implementation

**Future S3BlobStore**
- cloud object storage implementation

---

## Storage Strategy

Files are stored independently from database metadata.

Suggested key structure:

`/data/{projectId}/{documentId}`

This gives:

- project-based grouping
- easier migration to S3/object storage
- stable storage abstraction

---

## Document Status Model

Documents move through this state flow:

UPLOADED → PROCESSING → PROCESSED | FAILED

Later async version:

UPLOADED → QUEUED → PROCESSING → PROCESSED | FAILED

---

## Security Model

- all endpoints require authentication
- authorization enforced at API layer
- destructive actions restricted by role
- uploadedBy stored for audit/traceability
- documents are not private per-user records

---

## Architectural Principles

- modular monolith
- controller → service → persistence separation
- project-first organization
- shared company visibility
- role-based destructive actions
- storage abstraction
- fail-safe error handling
- production-aware, not overengineered