-- CreateTable: admins
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vehicle_counter
CREATE TABLE "vehicle_counter" (
    "id" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 10000,

    CONSTRAINT "vehicle_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vehicles
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverMobile" TEXT NOT NULL,
    "driverPhoto" TEXT,
    "emergencyContact" TEXT NOT NULL,
    "emergencyContactName" TEXT,
    "vehicleType" TEXT NOT NULL,
    "companyName" TEXT,
    "insuranceNumber" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "address" TEXT,
    "notes" TEXT,
    "qrUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vehicle_history
CREATE TABLE "vehicle_history" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "changedBy" TEXT,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNumber_key" ON "vehicles"("vehicleNumber");

-- CreateIndex
CREATE INDEX "vehicles_vehicleNumber_idx" ON "vehicles"("vehicleNumber");
CREATE INDEX "vehicles_driverName_idx" ON "vehicles"("driverName");
CREATE INDEX "vehicles_driverMobile_idx" ON "vehicles"("driverMobile");
CREATE INDEX "vehicles_createdAt_idx" ON "vehicles"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "vehicle_history" ADD CONSTRAINT "vehicle_history_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
