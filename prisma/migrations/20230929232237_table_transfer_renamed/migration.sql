/*
  Warnings:

  - You are about to drop the `transfer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transfer" DROP CONSTRAINT "transfer_newTeamId_fkey";

-- DropForeignKey
ALTER TABLE "transfer" DROP CONSTRAINT "transfer_playerId_fkey";

-- DropForeignKey
ALTER TABLE "transfer" DROP CONSTRAINT "transfer_previousTeamId_fkey";

-- DropTable
DROP TABLE "transfer";

-- CreateTable
CREATE TABLE "transfers" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "previousTeamId" INTEGER NOT NULL,
    "newTeamId" INTEGER NOT NULL,
    "transferFee" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_previousTeamId_fkey" FOREIGN KEY ("previousTeamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_newTeamId_fkey" FOREIGN KEY ("newTeamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
