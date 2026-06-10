import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateVehicleDto, UpdateVehicleDto } from '../types/vehicle';

// Generate sequential vehicle ID using a DB counter inside a transaction
async function generateVehicleId(): Promise<string> {
  const counter = await prisma.$transaction(async (tx) => {
    // Upsert row with id=1, then increment
    const updated = await tx.vehicleCounter.upsert({
      where: { id: 1 },
      create: { id: 1, count: 10001 },
      update: { count: { increment: 1 } },
    });
    return updated.count;
  });
  return `VH${counter}`;
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createVehicle(data: CreateVehicleDto, baseUrl: string) {
  const id = await generateVehicleId();
  const qrUrl = `${baseUrl}/vehicle/${id}`;

  const vehicle = await prisma.vehicle.create({
    data: {
      id,
      vehicleNumber: data.vehicleNumber.toUpperCase().trim(),
      driverName: data.driverName.trim(),
      driverMobile: data.driverMobile.trim(),
      driverPhoto: data.driverPhoto || null,
      emergencyContact: data.emergencyContact.trim(),
      emergencyContactName: data.emergencyContactName?.trim() || null,
      vehicleType: data.vehicleType,
      companyName: data.companyName?.trim() || null,
      insuranceNumber: data.insuranceNumber?.trim() || null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
      qrUrl,
    },
  });

  return vehicle;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getVehicleById(id: string) {
  return prisma.vehicle.findUnique({ where: { id } });
}

export async function getAllVehicles(page: number, limit: number, search?: string) {
  const where: Prisma.VehicleWhereInput = search
    ? {
        OR: [
          { vehicleNumber: { contains: search, mode: 'insensitive' } },
          { driverName: { contains: search, mode: 'insensitive' } },
          { driverMobile: { contains: search } },
          { companyName: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return { vehicles, total };
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateVehicle(
  id: string,
  data: UpdateVehicleDto,
  changedBy?: string
) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) return null;

  // Build update payload — only include fields that are explicitly provided
  const updateData: Prisma.VehicleUpdateInput = {};
  if (data.vehicleNumber !== undefined) updateData.vehicleNumber = data.vehicleNumber.toUpperCase().trim();
  if (data.driverName !== undefined) updateData.driverName = data.driverName.trim();
  if (data.driverMobile !== undefined) updateData.driverMobile = data.driverMobile.trim();
  if (data.driverPhoto !== undefined) updateData.driverPhoto = data.driverPhoto || null;
  if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact.trim();
  if (data.emergencyContactName !== undefined) updateData.emergencyContactName = data.emergencyContactName?.trim() || null;
  if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType;
  if (data.companyName !== undefined) updateData.companyName = data.companyName?.trim() || null;
  if (data.insuranceNumber !== undefined) updateData.insuranceNumber = data.insuranceNumber?.trim() || null;
  if (data.insuranceExpiry !== undefined) updateData.insuranceExpiry = data.insuranceExpiry ? new Date(data.insuranceExpiry) : null;
  if (data.address !== undefined) updateData.address = data.address?.trim() || null;
  if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;

  // Compute diff for history
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(updateData) as Array<keyof typeof updateData>) {
    const oldVal = (existing as Record<string, unknown>)[key as string];
    const newVal = updateData[key];
    if (String(oldVal) !== String(newVal)) {
      changes[key as string] = { from: oldVal, to: newVal };
    }
  }

  const [updated] = await prisma.$transaction([
    prisma.vehicle.update({ where: { id }, data: updateData }),
    ...(Object.keys(changes).length > 0
      ? [
          prisma.vehicleHistory.create({
            data: { vehicleId: id, changedBy: changedBy || null, changes },
          }),
        ]
      : []),
  ]);

  return updated;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteVehicle(id: string) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.vehicle.delete({ where: { id } }); // cascades history
  return true;
}

// ── Bulk Import ───────────────────────────────────────────────────────────────

export async function bulkCreateVehicles(
  vehicles: CreateVehicleDto[],
  baseUrl: string
): Promise<{ created: number; errors: string[] }> {
  const results = { created: 0, errors: [] as string[] };

  for (const v of vehicles) {
    if (!v.vehicleNumber || !v.driverName || !v.driverMobile || !v.emergencyContact) {
      results.errors.push(`Skipped row: missing required fields for "${v.vehicleNumber || 'unknown'}"`);
      continue;
    }
    try {
      await createVehicle(v, baseUrl);
      results.created++;
    } catch (err) {
      results.errors.push(
        `Failed "${v.vehicleNumber}": ${(err as Error).message}`
      );
    }
  }

  return results;
}

// ── History ───────────────────────────────────────────────────────────────────

export async function getVehicleHistory(vehicleId: string) {
  return prisma.vehicleHistory.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
