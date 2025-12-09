-- CreateTable
CREATE TABLE "FarmerProgram" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "programsId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmerProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FarmerProgram_programsId_idx" ON "FarmerProgram"("programsId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmerProgram_farmerId_programsId_key" ON "FarmerProgram"("farmerId", "programsId");

-- AddForeignKey
ALTER TABLE "FarmerProgram" ADD CONSTRAINT "FarmerProgram_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerProgram" ADD CONSTRAINT "FarmerProgram_programsId_fkey" FOREIGN KEY ("programsId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
