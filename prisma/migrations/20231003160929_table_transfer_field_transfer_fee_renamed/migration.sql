/*
  Warnings:

  - You are about to drop the column `transferFee` on the `transfers` table. All the data in the column will be lost.
  - Added the required column `fee` to the `transfers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transfers" DROP COLUMN "transferFee",
ADD COLUMN     "fee" DECIMAL(12,2) NOT NULL;
