import * as jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface JwtPayload {
  id: string;
  role: string;
}

export const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET ?? 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRE ?? '7d';

  // Explicitly set the options with proper typing for expiresIn
  const options = {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn']
  };

  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    secret,
    options
  );
};

export const verifyToken = (token: string): JwtPayload | null => {
  const secret = process.env.JWT_SECRET ?? 'fallback_secret';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};