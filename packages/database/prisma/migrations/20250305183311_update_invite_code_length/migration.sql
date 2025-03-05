-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "inviteCode" SET DEFAULT substring(md5(random()::text) from 1 for 4);
