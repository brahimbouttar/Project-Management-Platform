import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not set. Using a dev-only fallback. Set JWT_SECRET in production.');
}

const getSecret = (): string => {
  return JWT_SECRET || 'dev-secret-key-change-in-production-1234567890';
};

export class AuthService {
  static generateToken(user: { id: string; email: string; username: string; role: string }): string {
    const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' as any };
    return jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      getSecret(),
      options
    );
  }

  static async register(email: string, username: string, password: string, displayName: string) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      throw new Error(existingUser.email === email ? 'Email already in use' : 'Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword, displayName },
    });

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`[SECURITY] Failed login attempt for non-existent email: ${email}`);
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.warn(`[SECURITY] Failed login attempt for user: ${user.email} (${user.id})`);
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, displayName: true, avatar: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateProfile(userId: string, data: { displayName?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, username: true, displayName: true, avatar: true, role: true, createdAt: true, updatedAt: true },
    });
    return user;
  }
}
