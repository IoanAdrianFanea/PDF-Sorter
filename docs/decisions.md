# Key Technical Decisions

## Stack Choice
Frontend: React + TypeScript  
Backend: NestJS + TypeScript  

Reason: This stack is widely used in industry and showcases skills employers look for.

---

## Local Storage
All PDFs are stored locally in the `data/` folder.

Reason: Documents may be sensitive, so nothing is uploaded externally by default.

---

## Database
SQLite for MVP.

Reason: No setup required and perfect for a single-user local app.

---

## Search Approach
Start with keyword search, add semantic search later.

Reason: Keyword search is simple, fast, and reliable for MVP.