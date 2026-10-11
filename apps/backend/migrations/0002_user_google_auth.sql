-- Google sign-in: auth columns for the User table.
--
-- passwordHash must become nullable, but NEVER use a DROP TABLE/rebuild here:
-- D1 always enforces foreign keys (PRAGMA foreign_keys=OFF is unsupported) and
-- PRAGMA defer_foreign_keys does not stop ON DELETE CASCADE actions - a rebuild
-- of "User" would silently wipe Monitor/MonitorCheck/Alert rows.
-- Instead: column swap (ADD -> copy -> DROP COLUMN -> RENAME COLUMN), no table drop.
ALTER TABLE "User" ADD COLUMN "passwordHash_new" TEXT;
UPDATE "User" SET "passwordHash_new" = "passwordHash";
ALTER TABLE "User" DROP COLUMN "passwordHash";
ALTER TABLE "User" RENAME COLUMN "passwordHash_new" TO "passwordHash";

-- Google account link + unique index (multiple NULLs are allowed in SQLite).
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
