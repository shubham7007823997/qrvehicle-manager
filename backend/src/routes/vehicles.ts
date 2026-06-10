import { Router } from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import {
  listVehicles,
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getQRCode,
  getVehicleHistory,
  bulkImport,
} from '../controllers/vehicleController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.includes('spreadsheet') ||
      file.mimetype.includes('excel') ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls');
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
});

const vehicleBodyRules = [
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('driverName').trim().notEmpty().withMessage('Driver name is required'),
  body('driverMobile').trim().matches(/^\d{10}$/).withMessage('Driver mobile must be 10 digits'),
  body('emergencyContact').trim().matches(/^\d{10}$/).withMessage('Emergency contact must be 10 digits'),
  body('vehicleType').trim().notEmpty().withMessage('Vehicle type is required'),
  body('insuranceExpiry').optional({ checkFalsy: true }).isDate().withMessage('Invalid date'),
];

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES — no authentication, no token needed
// Anyone who scans a QR code hits GET /api/vehicles/:id
// ─────────────────────────────────────────────────────────────────────────────

router.get(
  '/:id',
  [param('id').trim().notEmpty().withMessage('Vehicle ID required')],
  validate,
  getVehicle   // ← public, no authenticate middleware
);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES — all routes below require a valid JWT
// ─────────────────────────────────────────────────────────────────────────────

router.use(authenticate);

// GET /api/vehicles  — list with pagination + search
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim(),
  ],
  validate,
  listVehicles
);

// POST /api/vehicles/bulk  — must be before /:id routes to avoid collision
router.post('/bulk', upload.single('file'), bulkImport);

// POST /api/vehicles
router.post('/', vehicleBodyRules, validate, createVehicle);

// PUT /api/vehicles/:id
router.put(
  '/:id',
  [param('id').notEmpty(), ...vehicleBodyRules.map((r) => r.optional())],
  validate,
  updateVehicle
);

// DELETE /api/vehicles/:id
router.delete('/:id', [param('id').notEmpty()], validate, deleteVehicle);

// GET /api/vehicles/:id/qrcode
router.get('/:id/qrcode', [param('id').notEmpty()], validate, getQRCode);

// GET /api/vehicles/:id/history
router.get('/:id/history', [param('id').notEmpty()], validate, getVehicleHistory);

export default router;
