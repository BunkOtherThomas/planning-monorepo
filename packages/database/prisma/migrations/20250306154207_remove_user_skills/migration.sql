/*
  Warnings:

  - You are about to drop the `TaggedSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSkill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaggedSkill" DROP CONSTRAINT "TaggedSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "TaggedSkill" DROP CONSTRAINT "TaggedSkill_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSkill" DROP CONSTRAINT "UserSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "UserSkill" DROP CONSTRAINT "UserSkill_userId_fkey";

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "inviteCode" SET DEFAULT substring(md5(random()::text) from 1 for 4);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "skills" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "TaggedSkill";

-- DropTable
DROP TABLE "UserSkill";
