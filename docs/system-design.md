# System Design

This document describes the main runtime flows (upload, processing, search, export).
It focuses on the “how the system behaves” view rather than implementation details.

---

## Document Status Model

Documents move through a simple state machine:

UPLOADED → QUEUED → PROCESSING → PROCESSED / FAILED

Notes:
- Phase 1 may skip QUEUED and do processing synchronously.
- Phase 2 introduces a queue and worker process, making QUEUED meaningful.

---

## Upload Flow (Phase 1)

1. User uploads PDF(s).
2. API validates file type/size.
3. API stores file (LocalBlobStore).
4. API extracts text (pdf-parse).
5. API stores metadata + extracted text in SQLite.
6. API marks document PROCESSED or FAILED.

---

## Upload Flow (Phase 2 – Async)

1. User uploads PDF(s).
2. API stores file + metadata, marks document QUEUED.
3. API enqueues ProcessDocument job.
4. Worker marks document PROCESSING.
5. Worker extracts text and updates SQLite FTS.
6. Worker marks PROCESSED or FAILED.

---

## Search Flow

1. User enters a query.
2. API searches SQLite FTS (scoped to ownerId).
3. API returns results with snippets.

---

## Export Flow

Phase 1 (sync):
1. User selects documents or filters.
2. API validates ownership.
3. API generates ZIP and streams it back.

Phase 2 (async):
1. User requests export.
2. API enqueues ExportZip job.
3. Worker builds ZIP and stores it temporarily.
4. User downloads ZIP when job is DONE.