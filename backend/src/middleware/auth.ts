import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'greenloop_jwt_secret_production_ready_key_2026_super_secure';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        isBanned: true,
        isSuspended: true,
        suspendedUntil: true,
        banReason: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'User account not found.' });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({
        message: `Your account has been permanently suspended: ${user.banReason || 'Violation of community safety guidelines'}.`,
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
      } else {
        // Automatically lift expired suspension
        await prisma.user.update({
          where: { id: user.id },
          data: { isSuspended: false, suspendedUntil: null },
        });
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired authentication session.' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, fullName: true, isBanned: true },
      });
      if (user && !user.isBanned) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        };
      }
    }
  } catch (e) {
    // Ignore error in optional auth
  }
  next();
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied: insufficient permissions.' });
      return;
    }

    next();
  };
};
