# Project Access Validation

## Goal
Validate the refactor from owner-based document access to project-based upload permissions with company-wide document visibility.

## Scope
This validation covers:
- project listing
- upload authorization
- company-wide document visibility
- export/download access
- admin-only delete policy

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
- [x] Passed
- [ ] Failed

### Notes
...

---

## Scenario 2: Regular user without membership

### Setup
- User: regular-user-2
- Membership: no assignment to Project A

### Expected
- Cannot upload to Project A
- Does not see unauthorized projects in `/projects`

### Result
- [x] Passed
- [ ] Failed

### Notes
...

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
- [x] Passed
- [ ] Failed

### Notes
...