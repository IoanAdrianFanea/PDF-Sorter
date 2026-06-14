-- AlterTable
ALTER TABLE "User" ADD COLUMN "emailVerificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" DATETIME;

-- Back-fill: all existing ACTIVE users are considered email-verified
-- (they existed before this feature was introduced)
UPDATE "User" SET "emailVerifiedAt" = datetime('now') WHERE "accountStatus" = 'ACTIVE';
