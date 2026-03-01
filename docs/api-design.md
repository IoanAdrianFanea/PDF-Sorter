# API Design

## POST /documents

Description:
Upload one or multiple PDFs.

Request:
multipart/form-data

Response:
{
  "uploaded": 10,
  "failed": 1
}


## GET /documents

Description:
List all documents.

Response:
[
  {
    "id": "123",
    "filename": "invoice.pdf",
    "createdAt": "2026-03-01"
  }
]


## GET /search?q=keyword

Description:
Search documents by keyword.

Response:
[
  {
    "id": "123",
    "filename": "invoice.pdf",
    "snippet": "Payment due..."
  }
]


## GET /documents/:id/download

Description:
Download original PDF.


## POST /exports

Description:
Export selected or filtered documents as ZIP.

Request:
{
  "documentIds": ["123", "456"]
}

Response:
{
  "exportId": "abc123"
}


## GET /exports/:id/download

Description:
Download generated ZIP file.