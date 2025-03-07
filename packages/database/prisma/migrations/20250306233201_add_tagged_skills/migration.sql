-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "inviteCode" SET DEFAULT substring(md5(random()::text) from 1 for 4);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "taggedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];
