-- CreateTable
CREATE TABLE "RetailerDetails" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailerDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RetailerDetails_retailerId_key" ON "RetailerDetails"("retailerId");

-- AddForeignKey
ALTER TABLE "RetailerDetails" ADD CONSTRAINT "RetailerDetails_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
