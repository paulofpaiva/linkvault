import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware.js';
import { fetchPageTitle } from '../utils/linkScraper.js';

const router = Router();

router.use(requireAuth);

// GET /scraper/fetch-title?url=...
router.get('/fetch-title', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.error('URL is required', 400);
    }

    try {
      new URL(url);
    } catch {
      return res.error('Invalid URL', 400);
    }

    const title = await fetchPageTitle(url);

    res.success({ title }, 'Title fetched successfully');
  } catch (error) {
    next(error);
  }
});

export default router;

