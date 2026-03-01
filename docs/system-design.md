# System Design

## Upload Flow

1. User selects files or folder.
2. Frontend sends files to backend.
3. Backend stores files in data/inbox.
4. Text is extracted using pdf-parse.
5. File is moved to data/processed.
6. Metadata + extracted text saved to SQLite.


## Search Flow

1. User enters search query.
2. Backend queries SQLite FTS index.
3. Matching documents returned.
4. User can preview or download file.


## Export Flow

1. User selects export option.
2. Backend selects relevant documents.
3. Files are grouped into virtual folders.
4. ZIP archive is created.
5. ZIP is streamed to user.
6. Temporary ZIP file is deleted.


## Data Storage

Stored once:
- Original PDF file
- Extracted text
- Metadata

ZIP files:
- Created on demand
- Deleted after download or expiry