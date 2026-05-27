# Backlog

Potential additions and improvements for future consideration.

---

## To Confirm With Stakeholder

- Project-scoped visibility (non-admins see only assigned projects) — confirm before Phase 2
- Custom filters: available to all users vs creator-only — confirm before Phase 3
- Compression threshold (suggested 5MB) — needs concrete number
- Password policy specifics (length, character mix, etc.)

---

## Language and Timezone Fields

Remove `language` and `timezone` fields from the `User` schema. Stakeholder confirmed single language is needed — these fields are currently always null and serve no purpose.

---

## Force Password Reset on First Login

Add a `mustChangePassword` boolean field to `User`. When an admin creates a user via `POST /users`, set it to `true`. On first login, the frontend detects the flag and forces the user to the change password screen. Less relevant once self-registration is the default path, but useful for admin-created accounts.

---

## Print Document Button

Add a print button in the document actions section, with a preview. Low priority — included in Phase 5 if time allows, otherwise moves here.

---

## GET /projects/:id

A single project detail endpoint was omitted since `GET /projects/:id/members` covers the membership use case and `GET /projects` covers listing. Add if the admin console needs to fetch a single project with members in one call.

---

## Restrict Self-Registration

`POST /auth/register` is currently public. Once admin approval is implemented in Phase 2, self-registration becomes safer. Optionally disable it entirely for closed-deployment customers.

---

## Email Attachment Ingestion

Forward an email with attachments to a project-specific address; attachments uploaded automatically. Phase 7.

---

## Offline-Friendly Viewing

Cache recently viewed documents for offline access. Phase 7.

---

## Native App for All Platforms

Single app for laptop, tablet, and phone. To be evaluated after web is stable. Phase 7.

---

## Storage Limits per User or Project

Originally considered but removed — stakeholder confirmed no upload quotas. Could be reintroduced if cloud costs become a concern.

---

## Permanent Project Deletion Cascade

Permanent deletion (after 30-day window or via admin override) cascades:
- All documents permanently removed
- All deletion logs retained
- ProjectMembership rows removed
- DocumentFilterValue rows removed