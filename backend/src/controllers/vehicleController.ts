import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import * as vehicleService from '../services/vehicleService';
import { generateQRCode } from '../services/qrService';
import { CreateVehicleDto, UpdateVehicleDto } from '../types/vehicle';
import { AuthRequest } from '../middleware/auth';

const getBaseUrl = (req: Request): string =>
  process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

// GET /api/vehicles
export const listVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string)?.trim() || undefined;

    const { vehicles, total } = await vehicleService.getAllVehicles(page, limit, search);

    res.json({
      success: true,
      data: {
        vehicles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('List vehicles error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
  }
};

// POST /api/vehicles
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const dto: CreateVehicleDto = req.body;
    const vehicle = await vehicleService.createVehicle(dto, getBaseUrl(req));
    res.status(201).json({ success: true, data: vehicle });
  } catch (err: unknown) {
    console.error('Create vehicle error:', err);
    // Prisma unique constraint violation
    if ((err as { code?: string }).code === 'P2002') {
      res.status(409).json({ success: false, message: 'Vehicle number already exists' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create vehicle' });
  }
};

// GET /api/vehicles/:id  — public (no auth)
export const getVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }
    res.json({ success: true, data: vehicle });
  } catch (err) {
    console.error('Get vehicle error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle' });
  }
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dto: UpdateVehicleDto = req.body;
    const updated = await vehicleService.updateVehicle(
      req.params.id,
      dto,
      req.user?.email
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error('Update vehicle error:', err);
    if ((err as { code?: string }).code === 'P2002') {
      res.status(409).json({ success: false, message: 'Vehicle number already exists' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to update vehicle' });
  }
};

// DELETE /api/vehicles/:id
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await vehicleService.deleteVehicle(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
  }
};

// GET /api/vehicles/:id/qrcode
export const getQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    const qr = await generateQRCode(vehicle.qrUrl);

    res.json({
      success: true,
      data: {
        vehicleId: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        qrUrl: vehicle.qrUrl,
        qrDataUrl: qr.dataUrl,
        qrSvg: qr.svgString,
      },
    });
  } catch (err) {
    console.error('QR code error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
};

// GET /api/vehicles/:id/history
export const getVehicleHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    const history = await vehicleService.getVehicleHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
};

// POST /api/vehicles/bulk — Excel or JSON array
export const bulkImport = async (req: Request, res: Response): Promise<void> => {
  try {
    const baseUrl = getBaseUrl(req);
    let vehiclesData: CreateVehicleDto[] = [];

    if (req.file) {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

      vehiclesData = rows.map((row) => ({
        vehicleNumber: String(row['Vehicle Number'] ?? row['vehicleNumber'] ?? ''),
        driverName: String(row['Driver Name'] ?? row['driverName'] ?? ''),
        driverMobile: String(row['Driver Mobile'] ?? row['driverMobile'] ?? ''),
        emergencyContact: String(row['Emergency Contact'] ?? row['emergencyContact'] ?? ''),
        emergencyContactName: String(row['Emergency Contact Name'] ?? row['emergencyContactName'] ?? ''),
        vehicleType: String(row['Vehicle Type'] ?? row['vehicleType'] ?? 'Car'),
        companyName: String(row['Company Name'] ?? row['companyName'] ?? ''),
        insuranceNumber: String(row['Insurance Number'] ?? row['insuranceNumber'] ?? ''),
        insuranceExpiry: String(row['Insurance Expiry'] ?? row['insuranceExpiry'] ?? ''),
        address: String(row['Address'] ?? row['address'] ?? ''),
        notes: String(row['Notes'] ?? row['notes'] ?? ''),
      }));
    } else if (Array.isArray(req.body)) {
      vehiclesData = req.body as CreateVehicleDto[];
    } else {
      res.status(400).json({ success: false, message: 'Provide an Excel file or JSON array' });
      return;
    }

    if (vehiclesData.length === 0) {
      res.status(400).json({ success: false, message: 'No vehicle data found in file' });
      return;
    }

    const result = await vehicleService.bulkCreateVehicles(vehiclesData, baseUrl);

    res.json({
      success: true,
      data: result,
      message: `${result.created} vehicles imported${result.errors.length ? `, ${result.errors.length} errors` : ''}`,
    });
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ success: false, message: 'Bulk import failed' });
  }
};
