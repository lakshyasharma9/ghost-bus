import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getPublishedPosts,
  getPostBySlug,
  adminGetPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
} from '../controllers/blog.controller.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', getPublishedPosts);
router.get('/:slug', getPostBySlug);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, authorize('ADMIN'), adminGetPosts);
router.post('/admin', authenticate, authorize('ADMIN'), adminCreatePost);
router.put('/admin/:id', authenticate, authorize('ADMIN'), adminUpdatePost);
router.delete('/admin/:id', authenticate, authorize('ADMIN'), adminDeletePost);

export default router;
