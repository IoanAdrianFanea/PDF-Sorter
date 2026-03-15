# Phase 0.5 – Product Realignment

This phase bridges the gap between the current web-based PDF sorter and the new target product: a project-based construction document system designed for company use.

The goal of this phase is to avoid continuing development on features that no longer match the business need, and to reshape the system so implementation can continue in the right direction.

---

## Why This Phase Exists

The original project direction was:

- web-based
- user-owned documents
- PDF-first
- tag-based organization
- portfolio-oriented generic document tool

After stakeholder feedback, the desired product is now closer to:

- company-shared document system
- project-based organization
- delivery / materials / equipment document retrieval
- PDF + images
- native-friendly usage (Windows + Android)
- Excel-like operational document browsing
- access from office and site
- eventual offline-friendly viewing of downloaded files

Because of this change, the current roadmap should not be followed directly without adjustment.

---

## Current State (What Already Exists)

The current project already provides a useful technical base.

### Backend / System
- authentication with JWT + refresh tokens
- user model
- document upload pipeline
- PDF text extraction
- document status model
- document search
- document details view
- document deletion
- ZIP export
- modular backend structure
- storage abstraction
- clean separation between frontend and backend

### Frontend / UI
- web-based interface
- document upload flow
- document list view
- document details drawer
- search flow
- bulk select / export / delete flows

### Engineering Value Kept
Even though the product direction changed, the following work remains valuable:
- auth architecture
- upload pipeline
- extraction flow
- storage abstraction
- document metadata model
- search logic
- backend modular structure

This means the project is **not being restarted from zero**.
Instead, it is being **redirected**.

---

## What Must Change

The current system reflects the old product assumptions in several places.

### 1. Ownership Model Must Change
Old model:
- documents belong to a user
- users only see their own files

New model:
- documents belong to the company
- documents are visible across the company by default
- uploadedBy is stored only for traceability
- destructive actions are role-restricted

Impact:
- remove user-scoped document access as the main rule
- introduce shared access model
- add roles such as USER / ADMIN

---

### 2. Main Organization Model Must Change
Old model:
- tags are a core feature
- organization is flexible but generic

New model:
- projects are the core organizing structure
- documents belong to projects
- project view becomes the main navigation model

Impact:
- tags are no longer a core feature
- project entity must be introduced early
- document listing/search/filtering should be project-aware

---

### 3. File Scope Must Change
Old model:
- PDF-centric

New model:
- PDF + images
- scans and photos are part of the real workflow

Impact:
- upload validation must support image formats
- extraction/search behavior must account for image files not always having text
- OCR becomes a later feature, not a day-one requirement

---

### 4. Platform Direction Must Change
Old model:
- web app is the final product direction

New model:
- Windows + Android are desired business platforms
- mobile and desktop will likely need different UX patterns

Impact:
- backend should remain API-first
- frontend strategy must be reconsidered
- UI should be redesigned around operational workflows, not only browser views

---

### 5. UI Model Must Change
Old model:
- generic card/list document UI

New model:
- desktop/tablet usage should feel more like an operations table
- users want an Excel-like document view
- phone UX will need a different layout

Impact:
- one UI is not enough
- large-screen/table layout should support filtering by columns
- mobile view should use simpler stacked cards / grouped navigation
- document type grouping may be required because not all document classes share the same metadata columns

---

## Features to Keep

These features still align strongly with the new direction and should be preserved.

- authentication
- refresh token flow
- upload pipeline
- storage abstraction
- PDF extraction
- document search
- document details retrieval
- ZIP export
- backend modular structure
- status tracking
- production-aware architecture approach

---

## Features to Drop or Downgrade

These features no longer match the business direction as core priorities.

### Drop as Core Product Features
- user-private document model
- user-scoped document isolation
- tag-first organization
- tag-centric filtering as a main workflow
- portfolio-style dashboard features that do not support operational use

### Downgrade to Optional / Later
- favorites
- recent documents dashboard widgets
- profile polish work
- advanced personal document management ideas
- AI tagging / auto-tag suggestions
- overly generic filter systems not tied to project workflow

### Avoid for Now
- full offline sync
- true multi-platform native rollout immediately
- email ingestion
- OCR-heavy automation
- complicated metadata extraction pipelines
- overbuilt admin systems

---

## New Primary Focus Areas

This phase should redirect effort into the features that matter most for the company use case.

### 1. Shared Company Access Model
Implement:
- shared document visibility
- uploadedBy for traceability
- USER / ADMIN role model
- admin-only delete permissions

### 2. Project-Based Domain
Implement:
- Project entity
- documents linked to projectId
- project-first navigation and filtering
- project as the main organizational container

### 3. Document Type / Group Strategy
Because not all documents share the same fields, introduce grouping.

Possible examples:
- materials deliveries
- equipment / plant deliveries
- tools
- general supporting documents

This allows:
- different metadata fields by group
- different column sets in the desktop table view
- cleaner operational filtering

### 4. Table-Based Desktop Workflow
Design a large-screen document screen that behaves like an operations table:
- rows = documents
- columns = key metadata
- column sorting
- per-column filtering
- project filter
- document-type/group filter

This should become the main desktop experience.

### 5. Mobile-Specific Workflow
Do not force the desktop table onto phones.

Mobile flow should instead be:
project list
→ document group
→ document list
→ document details / preview

This will be much more usable on Android-sized screens.

### 6. Native-Friendly Architecture
Keep backend API-first and plan the frontend so it can support:
- desktop client
- mobile client
- possibly continued web admin/testing access

The backend should not assume browser-specific behavior.

---

## Recommended Transition Strategy

Instead of immediately rewriting everything, do the transition in layers.

---

## Step 1 – Freeze Old Product Direction
Before adding new features, stop work on:
- tags expansion
- personal dashboard features
- personal-library assumptions
- UI polish based on old workflow

Goal:
avoid investing more time into the wrong direction

---

## Step 2 – Realign the Backend Domain
Refactor the backend data model to reflect the new business rules.

Priority changes:
- add roles to users
- add Project entity
- attach documents to projects
- remove ownerId as the main access boundary
- keep uploadedById for traceability
- change delete authorization from owner-based to role-based

This is the most important technical shift.

---

## Step 3 – Define Metadata Strategy
Because not all documents have the same fields, avoid forcing one giant flat schema too early.

Recommended short-term approach:
- keep base document fields common
- add documentGroup / documentType
- allow optional metadata fields depending on group

Example:
Base fields:
- filename
- project
- uploadedBy
- uploadedAt
- status
- supplier (optional)
- deliveryDate (optional)

Then allow group-specific fields later.

This prevents early overengineering while still enabling table filtering.

---

## Step 4 – Redesign the UI Information Architecture
The UI should no longer be thought of as “upload page + document list”.

Instead use:

### Desktop / Large Screen
Projects
→ group/type view
→ table view
→ details / preview

### Mobile
Projects
→ group/type cards
→ compact document list
→ document details

This means the product becomes workflow-driven, not page-driven.

---

## Step 5 – Decide Platform Delivery Strategy
Because the stakeholder wants Windows + Android, the implementation plan should not assume the browser UI is the final form.

Practical strategy:
- keep current backend as shared API
- treat the current web frontend as a temporary interface / development client
- redesign the frontend with cross-platform thinking
- only after workflows are clear, choose the final client approach

Important:
the biggest mistake here would be trying to build both full Windows and Android versions immediately before the workflow is stable.

The workflow should be validated first.

---

## Step 6 – Build the New MVP Around Business Use
The next MVP should prove:

- users can open a project
- users can upload delivery-related docs into that project
- users can browse them quickly
- users can filter/search efficiently
- users can open/download what they need
- admins can manage deletion safely

If this works well, the product is already valuable.

---

## Deliverables of Phase 0.5

By the end of this phase, the project should have:

- updated domain model
- updated roadmap
- updated UI direction
- clear distinction between desktop and mobile workflows
- decision on grouping strategy for documents
- decision on native/client strategy
- frozen list of dropped features
- clean next implementation target

This phase is complete when the project is no longer an old PDF sorter with extra patches, but a clearly defined construction document system ready for the next build phase.