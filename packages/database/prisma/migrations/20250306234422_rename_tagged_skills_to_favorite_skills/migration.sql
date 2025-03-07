/*
  Warnings:

  - You are about to drop the column `taggedSkills` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "inviteCode" SET DEFAULT substring(md5(random()::text) from 1 for 4);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "taggedSkills",
ADD COLUMN     "favoriteSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];
