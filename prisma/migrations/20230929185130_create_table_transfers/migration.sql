-- CreateTable
CREATE TABLE "transfer" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "previousTeamId" INTEGER NOT NULL,
    "newTeamId" INTEGER NOT NULL,
    "trasnferFee" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_previousTeamId_fkey" FOREIGN KEY ("previousTeamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_newTeamId_fkey" FOREIGN KEY ("newTeamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
