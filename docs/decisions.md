# Technical Decisions

## Web-Based Application

Decision:
Use a web application instead of desktop app.

Why:
Easier to deploy and test.
Still allows local-first storage.


## SQLite for MVP

Decision:
Use SQLite database.

Why:
Simple setup.
Good enough for local indexing.


## ZIP Export Instead of Direct File System Sorting

Decision:
Export sorted documents as ZIP file.

Why:
Web apps cannot safely modify local file system.
ZIP provides folder structure in downloadable format.


## Local Storage

Decision:
Store PDFs locally on server.

Why:
Avoid sending documents externally.
Maintain privacy.