# Backlog

Potential additions and improvements for future consideration.

---

## Language and Timezone Fields

Remove `language` and `timezone` fields from the `User` schema. Stakeholder confirmed single language is needed — these fields are currently always null and serve no purpose.

---

## Force Password Reset on First Login

Add a `mustChangePassword` boolean field to `User`. When an admin creates a user via `POST /users`, set it to `true`. On first login, the frontend detects the flag and forces the user to the change password screen before accessing the app. On password change, flip to `false`.

---

## Recycling Bin

When a project or document is deleted, move it to a recycling bin rather than permanently deleting. Both should be restorable by an admin. For now, deletion is permanent.

---

## Project Deletion Cascade

Deleting a project currently deletes all documents and files permanently. Revisit once the recycling bin feature is designed — deletion should move everything to the bin instead.

---

## GET /projects/:id

A single project detail endpoint was omitted since `GET /projects/:id/members` covers the membership use case and `GET /projects` covers listing. Add `GET /projects/:id` if the frontend needs to fetch a single project with full details (name + members) in one call.

---

## Restrict Self-Registration

`POST /auth/register` is currently public. For an internal company tool, consider disabling it so only admins can create accounts via `POST /users`.

---

## OCR for Images

Images are uploaded and stored but have no extracted text. Add `tesseract.js` to run OCR on JPEG/PNG uploads the same way `pdf-parse` handles PDFs. Planned for Phase 5.

---

## Metadata Columns

`supplier`, `materialType`, `quantity`, `orderNumber`, `deliveryDate` are accepted as filter params but are not real schema columns — they fall back to text search on filename and extracted text. Add these as proper columns on `Document` in Phase 2 so filters are meaningful.