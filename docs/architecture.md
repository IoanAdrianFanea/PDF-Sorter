# Architecture Overview

## High-Level Structure

User (Browser)
    ↓
React Frontend
    ↓
NestJS Backend
    ↓
Local Storage (PDF files)
    ↓
SQLite Database (metadata + text)


## Main Components

Frontend
- Upload interface
- Search interface
- Results list
- Export button

Backend
- Documents module
- Extraction service
- Storage service
- Search service
- Export service

Storage
- data/inbox
- data/processed

Database
- Documents table
- Full-text search index


## Design Principles

- Clean monolith
- Clear separation of responsibilities
- No overengineering
- Local-first storage