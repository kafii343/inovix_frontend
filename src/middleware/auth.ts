import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      res.status(401).json({ success: false, message: 'Access token required' });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(403).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const authorizeAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Access denied' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }

  next();
};