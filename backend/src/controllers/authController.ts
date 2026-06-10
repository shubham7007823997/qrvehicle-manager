import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET as string;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '24h') as `${number}${'s'|'m'|'h'|'d'}` | number;
    const token = jwt.sign(
      { uid: admin.id, email: admin.email, role: admin.role },
      secret,
      { expiresIn }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { uid: admin.id, email: admin.email, name: admin.name, role: admin.role },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/change-password  (protected)
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'Both fields are required' });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.user!.uid } });
    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin not found' });
      return;
    }

    const match = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/auth/me  (protected)
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user!.uid },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin not found' });
      return;
    }

    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
