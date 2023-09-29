/*
  Warnings:

  - You are about to drop the column `code` on the `players` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "players_code_key";

-- AlterTable
ALTER TABLE "players" DROP COLUMN "code";
