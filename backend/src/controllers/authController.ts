import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'greenloop_jwt_secret_production_ready_key_2026_super_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.nativeEnum(UserRole).default(UserRole.INDIVIDUAL),
  phoneNumber: z.string().optional(),
  organizationName: z.string().optional(),
  neighborhood: z.string().default('Anna Nagar'),
  city: z.string().default('Chennai'),
  latitude: z.number().optional().default(13.0827),
  longitude: z.number().optional().default(80.2707),
  bio: z.string().optional(),
});

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Map neighborhood names to default Chennai coordinates if not provided
const neighborhoodCoordinates: Record<string, { lat: number; lng: number }> = {
  'Anna Nagar': { lat: 13.0850, lng: 80.2100 },
  'Ashok Nagar': { lat: 13.0373, lng: 80.2123 },
  'Guindy': { lat: 13.0067, lng: 80.2025 },
  'Guindy Industrial Estate': { lat: 13.0125, lng: 80.2080 },
  'Adyar': { lat: 13.0012, lng: 80.2565 },
  'Velachery': { lat: 12.9780, lng: 80.2210 },
  'T. Nagar': { lat: 13.0418, lng: 80.2341 },
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existing) {
      res.status(400).json({ message: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const coords = neighborhoodCoordinates[validated.neighborhood] || { lat: 13.0827, lng: 80.2707 };

    const user = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        passwordHash,
        fullName: validated.fullName,
        role: validated.role,
        phoneNumber: validated.phoneNumber,
        organizationName: validated.organizationName,
        neighborhood: validated.neighborhood,
        city: validated.city,
        latitude: validated.latitude || coords.lat,
        longitude: validated.longitude || coords.lng,
        bio: validated.bio,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phoneNumber: true,
        organizationName: true,
        neighborhood: true,
        city: true,
        latitude: true,
        longitude: true,
        bio: true,
        avatarUrl: true,
        verificationStatus: true,
        ratingAvg: true,
        ratingCount: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Account created successfully! Welcome to GreenLoop.',
      user,
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.errors });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email address or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email address or password.' });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({
        message: `Your account has been permanently suspended: ${user.banReason || 'Violation of terms'}`,
        code: 'ACCOUNT_BANNED',
      });
      return;
    }

    if (user.isSuspended && user.suspendedUntil) {
      if (new Date() < new Date(user.suspendedUntil)) {
        res.status(403).json({
          message: `Your account is temporarily suspended until ${user.suspendedUntil.toISOString().split('T')[0]}.`,
          code: 'ACCOUNT_SUSPENDED',
          suspendedUntil: user.suspendedUntil,
        });
        return;
      }
    }

    const token = generateToken(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      organizationName: user.organizationName,
      neighborhood: user.neighborhood,
      city: user.city,
      latitude: user.latitude,
      longitude: user.longitude,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      verificationStatus: user.verificationStatus,
      ratingAvg: user.ratingAvg,
      ratingCount: user.ratingCount,
      createdAt: user.createdAt,
    };

    res.json({
      message: 'Login successful!',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const quickLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    let targetEmail = 'ananya@greenloop.demo';

    if (role === 'NGO') targetEmail = 'rha_chennai@greenloop.demo';
    else if (role === 'BUSINESS') targetEmail = 'coromandel@greenloop.demo';
    else if (role === 'ARTISAN' || role === 'MARKETPLACE') targetEmail = 'ecokrafts@greenloop.demo';
    else if (role === 'COMMUNITY_ADMIN' || role === 'ADMIN') targetEmail = 'admin@greenloop.demo';
    else if (role === 'PEER') targetEmail = 'karthik@greenloop.demo';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      res.status(404).json({ message: `Demo user for role ${role} not found. Please run seed script.` });
      return;
    }

    const token = generateToken(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      organizationName: user.organizationName,
      neighborhood: user.neighborhood,
      city: user.city,
      latitude: user.latitude,
      longitude: user.longitude,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      verificationStatus: user.verificationStatus,
      ratingAvg: user.ratingAvg,
      ratingCount: user.ratingCount,
      createdAt: user.createdAt,
    };

    res.json({
      message: `Signed in as demo persona: ${user.fullName}`,
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Quick login error:', error);
    res.status(500).json({ message: 'Server error during quick login.' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phoneNumber: true,
        organizationName: true,
        neighborhood: true,
        city: true,
        latitude: true,
        longitude: true,
        bio: true,
        avatarUrl: true,
        verificationStatus: true,
        ratingAvg: true,
        ratingCount: true,
        createdAt: true,
        isSuspended: true,
        isBanned: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Get unread notification count
    const unreadNotifications = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    res.json({
      user,
      unreadNotifications,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error fetching user.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const { fullName, phoneNumber, organizationName, bio, neighborhood } = req.body;
    const coords = neighborhood ? (neighborhoodCoordinates[neighborhood] || undefined) : undefined;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName || undefined,
        phoneNumber: phoneNumber || undefined,
        organizationName: organizationName || undefined,
        bio: bio || undefined,
        neighborhood: neighborhood || undefined,
        latitude: coords?.lat || undefined,
        longitude: coords?.lng || undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phoneNumber: true,
        organizationName: true,
        neighborhood: true,
        city: true,
        latitude: true,
        longitude: true,
        bio: true,
        avatarUrl: true,
        verificationStatus: true,
        ratingAvg: true,
        ratingCount: true,
      },
    });

    res.json({
      message: 'Profile updated successfully.',
      user: updated,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};
