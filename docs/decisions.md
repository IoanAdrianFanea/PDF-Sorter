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

---

## File Upload Implementation

Multipart Form Data
- Standard for file uploads
- Multer middleware (@nestjs/platform-express)
- FileInterceptor handles parsing
- File available as Buffer in memory

pdf-parse Library Version
- Using v1.1.1 (not latest v2.x)
- v1.x has simple functional API: pdfParse(buffer)
- v2.x changed to class-based API causing compatibility issues
- Dynamic require() due to CommonJS module format

Synchronous Processing (Phase 1)
- Upload → Extract → Store happens in single request
- Simple implementation for MVP
- Status transitions tracked in database
- Errors caught and stored in document record

Storage Abstraction Early
- BlobStore interface from day 1
- LocalBlobStore for development
- Easy to swap to S3BlobStore later
- Business logic doesn't depend on storage details

Text Normalization
- Collapse all whitespace to single spaces
- Remove leading/trailing whitespace
- Makes search more reliable
- Prevents formatting artifacts from affecting results

---

## Search Implementation

Case-Insensitive In-Memory Search
- SQLite doesn't support case-insensitive LIKE on all text efficiently
- Fetch user's documents with text, filter in application layer
- Simple and works well for MVP scale (hundreds of documents per user)
- Easy to migrate to FTS5 later if needed

Filename + Content Search
- Search matches against both originalFilename and extractedText
- Users can find documents by remembering filename or content
- Filename-only matches show "Filename: [highlighted]" snippet
- Content matches show contextual text snippet
- Improves discoverability without complex query syntax

Snippet Generation in Service Layer
- Keep snippet logic close to search logic
- Private helper methods in DocumentsService
- Text matches: Extract ~80 chars before/after first match
- Filename matches: Show full filename with highlighting
- HTML <mark> tags for client-side highlighting
- Consistent whitespace normalization

Search UI Integration
- Header search bar navigates to /search page
- Dedicated Search page with results list
- Click result opens document drawer (same as Documents page)
- Preserves query in URL for shareable search links
- Document drawer on right side (consistent UX)

Response Size Optimization
- Return only snippet, not full extractedText
- Prevents large response payloads
- Client fetches full document only when drawer opens

---

## Document Details Implementation

Page Count Capture
- pdf-parse library returns numpages field naturally
- Store in DocumentText.pageCount (nullable Int)
- Captured during initial extraction (no reprocessing needed)
- Displayed in document drawer properties section
- Shows actual page count or "N/A" if not available

Text Preview Strategy
- Generate preview at query time (not stored)
- First 150 characters with "..." suffix
- Small enough for list/detail responses
- Large enough to be useful preview
- Full text available via separate endpoint
- Keeps response sizes manageable

---

## Delete Implementation

Cascade Delete via Prisma Schema
- All foreign keys configured with onDelete: Cascade
- Document → DocumentText (one-to-one)
- Document → DocumentTag (one-to-many)
- Document → User (many-to-one, cascade on user delete)
- Tag → DocumentTag (one-to-many)
- Prevents foreign key constraint violations
- Database handles related record cleanup automatically

Physical File Deletion
- BlobStore.deletePdf() added to storage abstraction
- LocalBlobStore uses fs.unlink() to remove file
- Ignores ENOENT errors (file already deleted)
- File deleted before database record (fail-safe)
- If file delete fails, error thrown and database unchanged

Bulk Delete Strategy
- Sequential processing (not parallel)
- Each document validated for ownership individually
- Continues on failure (doesn't abort entire batch)
- Returns both success count and failed IDs
- Frontend shows result only if failures occurred
- Simple and reliable for MVP scale

Delete vs Archive
- Hard delete chosen for Phase 1 simplicity
- Physical file removed from storage
- Database records permanently removed
- No soft delete or trash bin
- User prompted with confirmation dialog
- Archive/restore can be added in later phase if needed

---

## Tags Implementation

React Context for Shared State
- TagsContext provides global tag state across app
- Eliminates duplicate tag fetching in multiple components
- Single source of truth for tags list
- Context exposed via custom useTags() hook
- Components can read/refresh tags without prop drilling

Callback Registry Pattern
- Cross-component notifications for tag deletion
- registerTagDeleteCallback() allows any component to listen for deletions
- Returns unsubscribe function for cleanup
- Enables loose coupling between sidebar and document views
- Documents list and drawer respond to tag deletions in real-time
- Prevents stale state when tags deleted from sidebar

Cascade Delete for Tags
- DELETE /tags/:id removes tag from database
- Prisma onDelete: Cascade removes all DocumentTag records
- Tag automatically removed from all associated documents
- Simpler than manual cleanup in application code
- Atomic database operation

Tag Name Uniqueness Per User
- Unique constraint on [ownerId, name] in Tag model
- Prevents duplicate tag names within user's tag list
- Returns 409 Conflict on duplicate
- Different users can have tags with same name
- Enforces clean tag organization

Tag Attachment Validation
- Both document and tag ownership validated on attach
- Prevents user from attaching another user's tag
- Prevents cross-user tag manipulation (IDOR protection)
- Returns 404 if either resource not found or not owned

---

## Export Implementation

archiver Library for ZIP Creation
- Industry-standard ZIP creation for Node.js
- Streaming API (efficient for large files)
- Maximum compression level (zlib level 9)
- Handles archive finalization automatically
- Works well with Express response streaming

BlobStore.getPdf() Method
- Added to storage abstraction for file retrieval
- Returns Buffer for in-memory processing
- Keeps storage details abstracted
- Easy to swap to S3 later (would return stream or signed URL)
- Consistent with existing BlobStore interface

Browser File Download Pattern
- Create Blob from response
- Create temporary object URL with URL.createObjectURL()
- Create hidden anchor element with download attribute
- Programmatically click anchor to trigger download
- Clean up object URL with URL.revokeObjectURL()
- Standard pattern for client-side downloads

Content-Disposition Header
- attachment forces download (not inline preview)
- filename="..." preserves original filename
- Backend sets header before streaming
- Frontend parses header to get suggested filename
- Falls back to generated filename if header missing

Multi-Select UI Pattern
- Checkboxes independent of row clicks
- Row click opens detail drawer
- Checkbox toggles selection state
- Select All in header for convenience
- Visual feedback with blue highlight on selected items
- BulkActionBar slides up from bottom when items selected
- Actions (Export, Delete) work on current selection

Export on Search Page
- Full parity with Documents page functionality
- Checkboxes work with search results
- Multi-select export from filtered results
- Consistent UX across both pages
- Selection persists during drawer open/close