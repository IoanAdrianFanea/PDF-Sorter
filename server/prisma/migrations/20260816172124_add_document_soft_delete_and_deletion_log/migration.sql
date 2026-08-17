-- AlterTable
ALTER TABLE "Document" ADD COLUMN "deletedAt" DATETIME;

-- CreateTable
CREATE TABLE "DeletionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT NOT NULL,
    "deletedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restoredAt" DATETIME,
    "permanentlyDeletedAt" DATETIME,
    CONSTRAINT "DeletionLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DeletionLog_documentId_idx" ON "DeletionLog"("documentId");

-- CreateIndex
CREATE INDEX "DeletionLog_projectId_idx" ON "DeletionLog"("projectId");

-- CreateIndex
CREATE INDEX "DeletionLog_actorId_idx" ON "DeletionLog"("actorId");

-- CreateIndex
CREATE INDEX "DeletionLog_deletedAt_idx" ON "DeletionLog"("deletedAt");

-- CreateIndex
CREATE INDEX "Document_deletedAt_idx" ON "Document"("deletedAt");
