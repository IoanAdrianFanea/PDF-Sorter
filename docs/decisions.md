# Technical Decisions

Key decisions made during development, with rationale.

---

## Project-Scoped Visibility

Non-admin users see only documents from projects they are assigned to. Admins see everything.

Rationale: stakeholder requirement. Initially the system was company-wide visible, but feedback indicated users should not see documents from projects they have no involvement in. Admins retain full visibility for oversight and management.

Note: this reverses the earlier "Shared Company Document Model" decision. To be confirmed with stakeholder before Phase 2 implementation begins.

---

## Project-First Organisation

Projects are the primary organising entity. Documents belong to projects.

Rationale: the business already organises documents by project. Visibility, archive, and storage structure all align around projects.

---

## Role-Based Authorization

Two roles: USER and ADMIN.

- Users can upload, search, download, and export within their assigned projects
- Admins can do all of that anywhere, plus manage projects, users, custom filters, archive, and recycle bin

Rationale: simpler than per-action permissions. The combination of role + project membership covers every access need so far.

---

## Self-Registration with Admin Approval

Users self-register, but accounts are `PENDING` until admin approves. Email verification is also required.

Rationale: an internal company tool can't accept open sign-ups. Admin approval prevents unauthorised access. Email verification prevents typos and confirms the user controls the address.

---

## Admin-Controlled Destructive Actions

Project deletion, user role changes, archive, permanent delete from recycle bin, and filter management are admin-only.

Rationale: these actions affect other users' work. Centralising them under admin oversight reduces the chance of accidental loss.

---

## Soft Delete with 30-Day Recovery

Deleted documents are not removed immediately. They are marked deleted, logged, and moved to a `deleted/` storage location. After 30 days they are permanently removed.

Rationale: deletion mistakes happen. A 30-day window lets admins restore accidentally deleted files without needing backups. Logging provides audit history.

---

## Project Archive with Zip Storage

When a project is archived, all files are zipped. The project becomes inaccessible from main views but the zip is downloadable. Unarchive extracts the zip and restores the original structure.

Rationale: completed projects don't need to clutter the working view. Zipping reduces storage and signals immutability. Reversibility matters because work sometimes resumes on "completed" projects.

---

## Custom Filters

Admins define up to 5 custom filter fields. These become metadata fields on documents and search/filter options for users.

Rationale: every construction firm uses different metadata (supplier, order number, material grade, etc.) and auto-extracting from raw PDF text is unreliable. A simple admin-defined schema lets each company configure what matters to them without code changes.

---

## Search and Filter Combined

Search and filters apply together, not separately. Users can pre-filter and then search, or search and then narrow with filters.

Rationale: the use case is "find this exact document" not "browse." Combining the two is essential for that.

---

## OCR Pulled Forward to Phase 3

Images need OCR to be searchable. Originally Phase 5, now in Phase 3 alongside custom filters and search work.

Rationale: site photos and scanned delivery notes are common. Without OCR, image-based documents are effectively invisible to search.

---

## File Compression Above a Threshold

Large files are compressed before storage. Threshold tentatively set at 5MB. PDFs and JPEGs may be skipped as they are already compressed.

Rationale: reduces cloud storage costs. Compressing small files saves negligible space while adding processing overhead — only worth doing above a threshold.

---

## OneDrive Folder Structure

Storage is organised under a configurable root folder, with subfolders for `active`, `archived`, and `deleted`.

Rationale: gives the admin a coherent view of all files outside the app. Reflects the access model directly: active projects are visible, archived projects are zipped, deleted files wait in a holding area.

---

## Synchronous Processing First, Async Later

Text extraction runs synchronously on upload. No queue or worker yet.

Rationale: simpler to build and debug. A queue-based pipeline is planned for Phase 6 when scale or processing time demands it.

---

## SQLite for Development

SQLite via Prisma for the current phase.

Rationale: zero infrastructure, fast iteration. Prisma abstracts the database layer, so migration to Postgres is straightforward later if needed.

---

## Storage Abstraction

Files stored behind a `BlobStore` interface. Current implementation is `LocalBlobStore`. OneDrive implementation in Phase 5.

Rationale: keeps business logic storage-agnostic. Migrating to cloud storage doesn't touch service code.

---

## Web-First Delivery

The current frontend is a browser web app. Native app for all platforms (single app — laptop, tablet, phone) planned for Phase 7.

Rationale: fastest way to validate workflows. Once web is stable enough, a single cross-platform native app will replace the laptop web + native phone hybrid that was initially considered.

---

## No Tags

Tags were removed during the Phase 0.5 refactor. Projects and custom filters cover the organising and grouping needs.

---

## Two User Creation Methods (create vs createUser)

`UsersService` has two creation methods intentionally:

- `create(email, passwordHash)` — used by auth during self-registration. Auth service handles hashing before calling this.
- `createUser(dto)` — used by the admin endpoint. Accepts a plain password and hashes it internally.

They serve different callers with different contracts. Kept separate for clarity.