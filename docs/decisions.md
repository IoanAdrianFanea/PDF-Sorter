# Technical Decisions

This document explains the key architectural and technical decisions made during development.

Each decision prioritizes realism, simplicity, and operational usefulness.

---

## Shared Company Document Model

Decision:
Documents are visible across the company by default.

Why:
- the workflow is collaborative
- users are not managing private personal libraries
- the main business problem is retrieval speed, not user isolation

uploadedBy is still stored for traceability.

---

## Project-First Organization

Decision:
Projects are the primary organizing entity.

Why:
- the business already organizes documents by project
- it matches how users search in real life
- it is more domain-accurate than tag-first organization

---

## Simple Role System

Decision:
Introduce roles early.

Initial roles:
- USER
- ADMIN

Why:
- shared visibility requires authorization boundaries
- delete/manage actions must be restricted
- this adds realism without much complexity

---

## File Scope

Decision:
Support PDFs and images first.

Why:
- documents arrive by email, scans, and photos
- this matches the real workflow
- avoids unnecessary file-type complexity early

---

## Web-First Delivery

Decision:
Build the core system as a web application first.

Why:
- easier to develop and deploy
- accessible from office and site
- strong portfolio signal
- native apps can be explored later if still valuable

---

## SQLite for Early Stages

Decision:
Use SQLite initially.

Why:
- simple setup
- fast iteration
- good enough for MVP and portfolio scope
- easy to replace later if needed

---

## Storage Abstraction

Decision:
Keep storage behind an interface.

Why:
- local storage works for development
- S3-compatible/object storage can be added later
- business logic remains storage-agnostic

---

## Synchronous First, Async Later

Decision:
Process uploads synchronously first, then add queue/worker later.

Why:
- faster delivery of working MVP
- simpler debugging
- still leaves room for production-style scaling

---

## Search-Focused Product

Decision:
Prioritize search and retrieval over automation.

Why:
- the largest pain point is time wasted finding documents
- fast retrieval gives immediate business value
- advanced automation can wait