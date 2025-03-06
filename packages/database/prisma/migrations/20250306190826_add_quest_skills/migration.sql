/*
  Warnings:

  - You are about to drop the column `deadline` on the `Quest` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Quest` table. All the data in the column will be lost.
  - You are about to drop the `QuestSkill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestSkill" DROP CONSTRAINT "QuestSkill_questId_fkey";

-- DropForeignKey
ALTER TABLE "QuestSkill" DROP CONSTRAINT "QuestSkill_skillId_fkey";

-- AlterTable
ALTER TABLE "Quest" DROP COLUMN "deadline",
DROP COLUMN "difficulty",
ADD COLUMN     "questSkills" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "inviteCode" SET DEFAULT substring(md5(random()::text) from 1 for 4);

-- DropTable
DROP TABLE "QuestSkill";
