import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { registerSchema, loginSchema } from '@linkvault/shared';
import { db } from '../db/index.js';
import { users, refreshTokens } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

const generateTokens = (userId: string) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('Secrets JWT not configured');
  }

  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

// POST /auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name: body.name,
        email: body.email,
        password: hashedPassword,
      })
      .returning();

    const { accessToken, refreshToken } = generateTokens(newUser.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: newUser.id,
      token: refreshToken,
      expiresAt,
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).success(
      {
        accessToken,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      'User created and logged in successfully'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    setRefreshTokenCookie(res, refreshToken);

    res.success(
      {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      'Login successful'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      throw new AppError(401, 'Refresh token not provided');
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const decoded = jwt.verify(refreshTokenFromCookie, process.env.JWT_REFRESH_SECRET) as {
      userId: string;
    };

    const storedToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, refreshTokenFromCookie),
    });

    if (!storedToken) {
      clearRefreshTokenCookie(res);
      throw new AppError(401, 'Invalid refresh token');
    }

    if (new Date() > storedToken.expiresAt) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshTokenFromCookie));
      clearRefreshTokenCookie(res);
      throw new AppError(401, 'Refresh token expired');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.success(
      {
        accessToken,
      },
      'Token refreshed successfully'
    );
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      clearRefreshTokenCookie(res);
      res.error('Invalid refresh token', 401);
      return;
    }
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (refreshTokenFromCookie) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshTokenFromCookie));
    }

    clearRefreshTokenCookie(res);
    res.success(null, 'Logout successful');
  } catch (error) {
    next(error);
  }
});

export default router;

