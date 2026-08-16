# Project Access Validation

## Goal
Validate the refactor from owner-based document access to project-based permissions with project-scoped document visibility.

## Status
Scenarios 1–4 were signed off against the original *company-wide visibility* behaviour. Visibility has since been tightened to project scope in Phase 2, so scenarios 1, 2 and 4 need re-running against the new behaviour, and scenario 5 is new.

## Scope
This validation covers:
- project listing
- upload authorization
- project-scoped document visibility
- export/download access
- delete policy

## Test Users
- Admin user
- Regular user with project membership
- Regular user without project membership

## Test Data
- Project A
- Project B
- Document uploaded to Project A
- Document uploaded to Project B

---

## Scenario 1: Regular user with project membership

### Setup
- User: regular-user-1
- Membership: assigned to Project A

### Expected
- Can fetch `/projects`
- Sees Project A
- Does not see unrelated projects
- Can upload to Project A
- Can view documents
- Cannot delete documents unless admin

### Result
- [x] Passed (against company-wide visibility)
- [ ] Re-verified against project-scoped visibility

### Notes
`GET /projects` without `?scope=uploadable` still returns **all** projects to any authenticated user. Only `?scope=uploadable` filters by membership. Confirm whether the bare project list should also be scoped.

---

## Scenario 2: Regular user without membership

### Setup
- User: regular-user-2
- Membership: no assignment to Project A

### Expected
- Cannot upload to Project A
- Does not see unauthorized projects in `/projects`

### Result
- [x] Passed (against company-wide visibility)
- [ ] Re-verified against project-scoped visibility

### Notes
Upload rejection is enforced (`ForbiddenException`). Project list scoping — see scenario 1 note.

---

## Scenario 3: Admin user

### Setup
- User: admin-user
- Role: ADMIN

### Expected
- Sees all projects
- Can upload to any project
- Can delete documents

### Result
- [x] Passed
- [ ] Failed

### Notes
...

---

## Scenario 4: Document flow regression check

### Expected
- Document list works
- Search works
- Preview/read works
- Download/export works
- Delete is admin-only

### Result
- [x] Passed (against company-wide visibility)
- [ ] Re-verified against project-scoped visibility

### Notes
...

---

## Scenario 5: Project-scoped visibility (new — not yet run)

### Setup
- regular-user-1 assigned to Project A only
- Document A in Project A, Document B in Project B

### Expected
- `GET /documents` returns Document A only
- `GET /documents/search` never surfaces Document B
- `GET /documents/status-counts` counts Document A only
- `GET /documents/:id` for Document B returns 404 (not 403)
- `GET /documents/:id/text` for Document B returns 404
- `GET /documents/:id/download` for Document B returns 404
- `POST /exports` including Document B returns 404 and exports nothing
- Admin gets all of the above unrestricted

### Result
- [ ] Passed
- [ ] Failed

### Notes
...