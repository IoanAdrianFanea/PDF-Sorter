-- Phase 2 preparation:
-- 1) Backfill nullable transition fields on Document
-- 2) Drop legacy ownerId from Document
-- 3) Enforce required projectId/uploadedById

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Ensure a fallback project exists for legacy documents.
INSERT OR IGNORE INTO "Project" ("id", "name", "createdAt", "updatedAt")
VALUES ('legacy_project_phase2', 'Legacy Imported Documents', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Backfill uploader from legacy owner for transition rows.
UPDATE "Document"
SET "uploadedById" = "ownerId"
WHERE "uploadedById" IS NULL;

-- Backfill project using fallback project for transition rows.
UPDATE "Document"
SET "projectId" = (
  SELECT "id"
  FROM "Project"
  WHERE "name" = 'Legacy Imported Documents'
  LIMIT 1
)
WHERE "projectId" IS NULL;

-- Grant membership to all existing users for the fallback project.
INSERT OR IGNORE INTO "ProjectMembership" ("userId", "projectId", "createdAt")
SELECT
  u."id",
  p."id",
  CURRENT_TIMESTAMP
FROM "User" u
CROSS JOIN (
  SELECT "id"
  FROM "Project"
  WHERE "name" = 'Legacy Imported Documents'
  LIMIT 1
) p;

-- Redefine Document with strict Phase 2 requirements.
CREATE TABLE "new_Document" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "originalFilename" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL,
  "errorMessage" TEXT,
  CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Document" (
  "id",
  "projectId",
  "uploadedById",
  "originalFilename",
  "storageKey",
  "mimeType",
  "sizeBytes",
  "uploadedAt",
  "status",
  "errorMessage"
)
SELECT
  "id",
  "projectId",
  "uploadedById",
  "originalFilename",
  "storageKey",
  "mimeType",
  "sizeBytes",
  "uploadedAt",
  "status",
  "errorMessage"
FROM "Document";

DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";

CREATE INDEX "Document_projectId_idx" ON "Document"("projectId");
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
