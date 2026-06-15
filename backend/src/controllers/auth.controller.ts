import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import * as emailService from '../services/email.service';

const generateTokens = (id: string, email: string, role: string) => {
  const accessToken = jwt.sign({ id, email, role }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Identity node matching email parameters exists' });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Atomic runtime mutation block wrapping user profile initialization, cart instantiation, and background operations
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hashedPassword },
      });
      await tx.cart.create({ data: { userId: newUser.id } });
      return newUser;
    });

    const verificationToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    
    // Fire-and-forget background asynchronous communication routines
    emailService.sendVerificationEmail(user.email, verificationToken).catch(console.error);
    emailService.sendWelcomeEmail(user.email, user.name).catch(console.error);

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    res.status(21) .json({
      success: true,
      message: 'Account initialization successful. Verification message transmitted.',
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, message: 'Invalid transactional security credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Stateless identity layers don't require server-side state removal if tokens aren't blacklisted. 
  // Inform the runtime platform to flush the client memory reference layout.
  res.status(200).json({ success: true, message: 'Token identity metrics context destroyed' });
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, isVerified: true, createdAt: true },
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Token param array absent' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Identity node reference context has expired' });
      return;
    }

    const tokens = generateTokens(user.id, user.email, user.role);
    res.status(200).json({ success: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh token frame contains modifications or signature decay' });
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Mitigate identity scanning vectors by returning a 200 state even when the target email does not exist
    if (user) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      await emailService.sendPasswordResetEmail(user.email, token);
    }

    res.status(200).json({ success: true, message: 'If account match registers, an automated notification dispatch sequence fires.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ success: true, message: 'Password sequence reset successful.' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Token mutation mismatch or time lifecycle completed' });
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid verification link schema token' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    
    await prisma.user.update({
      where: { id: decoded.id },
      data: { isVerified: true },
    });

    res.status(200).json({ success: true, message: 'Account status updated to: Verified' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Verification transaction failure, token stale or invalid' });
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, avatar } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { ...(name && { name }), ...(avatar && { avatar }) },
    });
    res.status(200).json({
      success: true,
      user: { id: updatedUser.id, name: updatedUser.name, avatar: updatedUser.avatar, email: updatedUser.email },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      res.status(400).json({ success: false, message: 'Verification password sequence mismatch' });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ success: true, message: 'Credential modifications recorded.' });
  } catch (error) {
    next(error);
  }
};