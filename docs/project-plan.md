# Project Plan — PDF Sorter for Construction Site Manager

## 1) Goal
Build a **local-first** document intake + search tool for a construction site manager who receives many PDFs (drawings, RFIs, concrete tickets, delivery notes, invoices, etc.). The app should **organize PDFs automatically** and make it **fast to find specific details** (e.g., “C30/37 concrete”, supplier, date, pour location).

Success looks like:
- Drag/drop PDFs → they get stored, named, and filed automatically
- Search returns results in seconds with filters (project, type, date, supplier)
- No sensitive PDFs are accidentally uploaded or committed to Git

---

## 2) Target User
- Primary: Construction site manager 
- Secondary: Any project/site manager dealing with large volumes of PDF attachments

User constraints:
- Minimal time to learn
- Needs quick search + clear folder structure
- Documents can be sensitive (client/supplier info)

---

## 3) Core Problems
1. **Document overload**: PDFs arrive via email constantly.
2. **Manual filing**: Dragging PDFs into folders + renaming is slow and inconsistent.
3. **Hard to search**: PDFs aren’t indexed; finding a detail takes ages.
4. **Inconsistent formats**: Some PDFs are text-based; some are scanned images.

---

## 4) MVP Scope (Phase 1)
### Must-have features
- Local web app (runs on the user’s machine)
- Upload PDFs via drag & drop (and/or “watch folder” later)
- Store PDFs in a local `data/` directory (not in repo)
- Extract text from PDFs (text-based PDFs first)
- Keyword search across extracted text
- Basic document list page (name, date added, type guess)
- Basic auto-sorting into folders based on simple rules (filename/content keywords)

### Out of scope for MVP (Phase 1)
- Email integration (Gmail/Outlook)
- OCR for scanned PDFs
- Semantic search / embeddings
- Multi-user accounts / cloud sync

---

## 5) Tech Stack Decision 
### Frontend
- **React + Vite + TypeScript**
Reason: widely used in industry, fast dev loop, strong portfolio value.

### Backend
- **Node.js + NestJS + TypeScript**
Reason: shows enterprise patterns (modules, DI, DTO validation), clean API structure, common in SWE roles.

### Database
- **SQLite for MVP**
Reason: zero setup, local-first. Upgrade path to Postgres if needed.

### Search
- **Phase 1:** SQLite FTS (or a simple DB text search if needed)
- **Phase 2:** Postgres FTS or a dedicated search index
Reason: start simple and fast, scale later.

### Background processing (later)
- **Phase 2:** BullMQ + Redis (job queue)
Reason: heavy tasks (PDF extraction/OCR) should not block API requests.

### PDF processing
- **Phase 1:** `pdf-parse` for text extraction from text PDFs
- **Phase 2:** OCR fallback (Tesseract) for scanned PDFs via worker
Reason: implement reliable basics first, then handle tougher cases.

### AI usage
- Default: **AI off**
- Later: optional AI-based classification / entity extraction (opt-in)
Reason: sensitive data; safest default is local-only processing.

---

## 6) Architecture Overview
High-level flow:
1. User uploads PDF in the UI
2. Backend saves file to local disk (`data/inbox/` then `data/processed/`)
3. Backend extracts text + basic metadata
4. Backend writes metadata + extracted text to DB
5. Search queries the DB/index and returns results to UI

Components:
- **Client (React/TS):** upload UI, list/search UI, document preview
- **Server (NestJS/TS):** API endpoints, storage manager, extraction service
- **Storage (local disk):** PDF files + derived artifacts
- **Database (SQLite):** metadata + extracted text + indexing tables

---

## 7) Security & Privacy Principles (Non-negotiables)
- **Never commit PDFs**: `data/` folder and `*.pdf` are in `.gitignore`
- **No raw PDFs sent externally**: local processing by default
- **External AI is opt-in**: requires explicit config + UI toggle
- **Minimal data sharing** (if AI enabled later):
  - only send extracted text snippets necessary for the task
  - redact obvious sensitive info when possible
- **No document contents in logs**
- **Secrets in `.env`, template in `.env.example`**
- Local data stored under `data/` for easy backup/delete

---

## 8) Repository Structure
Planned structure:

- `client/` — React frontend
- `server/` — NestJS backend
- `data/` — local PDFs + indexes (ignored by Git)
- `docs/` — documentation, decisions, diagrams
- `.env.example` — env template
- `.gitignore` — excludes PDFs/secrets/build artifacts
- `README.md` — setup + features + screenshots
- `docker-compose.yml` — optional later for Postgres/Redis
- `LICENSE` — MIT

---

## 9) API Sketch (Initial)
- `POST /documents` — upload PDF
- `GET /documents` — list documents (filters: type, date, project)
- `GET /documents/:id` — get metadata + file path reference
- `GET /search?q=...` — keyword search (later add filters)

---

## 10) Milestones / Roadmap
### Phase 1 — MVP (Vertical slice)
- [ ] NestJS API running locally
- [ ] Upload endpoint saves to `data/inbox/`
- [ ] Extract text with `pdf-parse`
- [ ] Store in SQLite
- [ ] Search endpoint returns matching docs
- [ ] React UI: upload + search + results list

### Phase 2 — Automation
- [ ] Auto-classify document type (rules first)
- [ ] Auto-file into folder structure (project/type/year)
- [ ] Add background jobs (BullMQ + Redis)
- [ ] Add OCR fallback for scanned PDFs

### Phase 3 — “AI that helps”
- [ ] Entity extraction (e.g., concrete grade, supplier, date)
- [ ] Semantic search (embeddings) — optional and privacy-controlled
- [ ] Highlight matches in PDF viewer

---

## 11) Definition of Done (for MVP)
- Can upload 20+ PDFs without crashing
- Search works reliably and returns correct results
- Files are stored locally and never committed
- App is usable by a non-technical user with minimal instructions