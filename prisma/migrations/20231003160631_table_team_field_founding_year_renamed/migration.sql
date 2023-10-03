/*
  Warnings:

  - You are about to drop the column `foundingYear` on the `teams` table. All the data in the column will be lost.
  - Added the required column `foundingDate` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "foundingYear",
ADD COLUMN     "foundingDate" DATE NOT NULL;
