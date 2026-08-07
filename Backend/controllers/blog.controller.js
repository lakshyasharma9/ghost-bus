import prisma from '../config/database.js';
import { errorResponse, successResponse } from '../utils/response.js';

// ─── Public: Get Published Posts ──────────────────────────────────────────────
export async function getPublishedPosts(req, res) {
  try {
    const { category, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = { status: 'PUBLISHED' };
    if (category && category !== 'All') where.category = category;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip, take: limitNum,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          coverImageUrl: true, category: true, tags: true,
          author: true, readTime: true, publishedAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return successResponse(res, 200, 'Blog posts', {
      posts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getPublishedPosts:', err);
    return errorResponse(res, 500, 'Failed to fetch blog posts');
  }
}

// ─── Public: Get Single Post by Slug ──────────────────────────────────────────
export async function getPostBySlug(req, res) {
  try {
    const { slug } = req.params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post || post.status !== 'PUBLISHED') {
      return errorResponse(res, 404, 'Post not found');
    }

    return successResponse(res, 200, 'Blog post', { post });
  } catch (err) {
    console.error('getPostBySlug:', err);
    return errorResponse(res, 500, 'Failed to fetch blog post');
  }
}

// ─── Admin: List All Posts ────────────────────────────────────────────────────
export async function adminGetPosts(req, res) {
  try {
    const { status, category, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'all') where.status = status.toUpperCase();
    if (category && category !== 'all') where.category = category;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return successResponse(res, 200, 'All blog posts', {
      posts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('adminGetPosts:', err);
    return errorResponse(res, 500, 'Failed to fetch posts');
  }
}

// ─── Admin: Create Post ───────────────────────────────────────────────────────
export async function adminCreatePost(req, res) {
  try {
    const {
      title, slug, excerpt, content, coverImageUrl,
      category, tags, author, readTime, status,
      publishedAt, seoTitle, seoDescription,
    } = req.body;

    if (!title?.trim()) return errorResponse(res, 400, 'Title is required');
    if (!content?.trim()) return errorResponse(res, 400, 'Content is required');

    // Auto-generate slug from title if not provided
    const finalSlug = slug?.trim() || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug: finalSlug } });
    if (existing) return errorResponse(res, 409, 'A post with this slug already exists');

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        coverImageUrl: coverImageUrl || null,
        category: category || 'Guide',
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
        author: author || 'GhostBus Team',
        readTime: readTime || null,
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        publishedAt: status === 'PUBLISHED' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
    });

    return successResponse(res, 201, 'Blog post created', { post });
  } catch (err) {
    console.error('adminCreatePost:', err);
    if (err.code === 'P2002') return errorResponse(res, 409, 'Slug already exists');
    return errorResponse(res, 500, 'Failed to create post');
  }
}

// ─── Admin: Update Post ───────────────────────────────────────────────────────
export async function adminUpdatePost(req, res) {
  try {
    const { id } = req.params;
    const {
      title, slug, excerpt, content, coverImageUrl,
      category, tags, author, readTime, status,
      publishedAt, seoTitle, seoDescription,
    } = req.body;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 404, 'Post not found');

    // If publishing for the first time, set publishedAt
    const wasPublished = existing.status === 'PUBLISHED';
    const isNowPublished = status === 'PUBLISHED';
    const finalPublishedAt = isNowPublished && !wasPublished
      ? (publishedAt ? new Date(publishedAt) : new Date())
      : existing.publishedAt;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug: slug.trim() }),
        ...(excerpt !== undefined && { excerpt: excerpt?.trim() || null }),
        ...(content !== undefined && { content: content.trim() }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()) }),
        ...(author !== undefined && { author }),
        ...(readTime !== undefined && { readTime }),
        ...(status !== undefined && { status: status.toUpperCase() }),
        publishedAt: finalPublishedAt,
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
      },
    });

    return successResponse(res, 200, 'Blog post updated', { post });
  } catch (err) {
    console.error('adminUpdatePost:', err);
    if (err.code === 'P2002') return errorResponse(res, 409, 'Slug already exists');
    return errorResponse(res, 500, 'Failed to update post');
  }
}

// ─── Admin: Delete Post ───────────────────────────────────────────────────────
export async function adminDeletePost(req, res) {
  try {
    const { id } = req.params;
    await prisma.blogPost.delete({ where: { id } });
    return successResponse(res, 200, 'Blog post deleted');
  } catch (err) {
    console.error('adminDeletePost:', err);
    if (err.code === 'P2025') return errorResponse(res, 404, 'Post not found');
    return errorResponse(res, 500, 'Failed to delete post');
  }
}
