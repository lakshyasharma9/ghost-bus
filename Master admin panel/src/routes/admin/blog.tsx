import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatusBadge, Button, FilterBar, Input, Select } from "@/components/admin/ui";
import { fmtDate } from "@/lib/admin-mock";
import { useAdminBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from "@/lib/use-admin-api";
import type { BlogPostRow } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react";

const CATEGORIES = ["Guide", "Industry", "Buying Guide", "Production", "Studio", "DJ Guide", "Business", "Comparison"];

function BlogPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<BlogPostRow | null>(null);
  const [creating, setCreating] = useState(false);

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useAdminBlogPosts(params);
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const posts: BlogPostRow[] = (data as any)?.posts ?? [];
  const total = (data as any)?.pagination?.total ?? 0;
  const totalPages = (data as any)?.pagination?.totalPages ?? 1;

  return (
    <div>
      <PageHeader
        title="Blog Management"
        description={`${total} blog posts`}
        actions={
          <Button onClick={() => { setCreating(true); setEditing(null); }}>
            <Plus className="h-4 w-4" /> New Post
          </Button>
        }
      />

      {/* Create / Edit form */}
      {(creating || editing) && (
        <BlogForm
          post={editing}
          onSave={async (formData) => {
            if (editing) {
              await updatePost.mutateAsync({ id: editing.id, ...formData });
            } else {
              await createPost.mutateAsync(formData);
            }
            setEditing(null);
            setCreating(false);
          }}
          onCancel={() => { setEditing(null); setCreating(false); }}
          saving={createPost.isPending || updatePost.isPending}
        />
      )}

      {!creating && !editing && (
        <>
          <FilterBar>
            <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            <span className="ml-auto text-xs text-muted-foreground">{posts.length} of {total}</span>
          </FilterBar>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No blog posts yet. Click "New Post" to create one.</div>
          ) : (
            <div className="space-y-2">
              {posts.map(post => (
                <div key={post.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">{post.title}</p>
                      <StatusBadge status={post.status?.toLowerCase() === 'published' ? 'approved' : post.status?.toLowerCase() === 'draft' ? 'pending' : 'rejected'} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      /{post.slug} · {post.category} · {post.author} · {post.publishedAt ? fmtDate(post.publishedAt) : 'Not published'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(post); setCreating(false); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete this post?')) deletePost.mutate(post.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t text-sm">
                  <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
                  <span className="text-muted-foreground">{page} / {totalPages}</span>
                  <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Blog Form Component ──────────────────────────────────────────────────────
function BlogForm({ post, onSave, onCancel, saving }: {
  post: BlogPostRow | null;
  onSave: (data: Partial<BlogPostRow>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    coverImageUrl: post?.coverImageUrl ?? "",
    category: post?.category ?? "Guide",
    tags: post?.tags?.join(", ") ?? "",
    author: post?.author ?? "GhostBus Team",
    readTime: post?.readTime ?? "",
    status: post?.status ?? "DRAFT",
    seoTitle: post?.seoTitle ?? "",
    seoDescription: post?.seoDescription ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) as any,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 mb-6 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{post ? "Edit Post" : "Create New Post"}</h2>
        <button type="button" onClick={onCancel} className="w-8 h-8 grid place-items-center rounded-full hover:bg-muted">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full" placeholder="Article title" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Slug</label>
          <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full" placeholder="auto-generated-from-title" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Category</label>
          <Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Author</label>
          <Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="w-full" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Read Time</label>
          <Input value={form.readTime} onChange={e => setForm({ ...form, readTime: e.target.value })} className="w-full" placeholder="8 min read" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
          <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Tags (comma separated)</label>
          <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full" placeholder="ghost production, edm, tips" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Cover Image URL</label>
          <Input value={form.coverImageUrl} onChange={e => setForm({ ...form, coverImageUrl: e.target.value })} className="w-full" placeholder="https://images.unsplash.com/..." />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Excerpt</label>
          <textarea rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" placeholder="Short summary for cards" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Content (Markdown) *</label>
          <textarea rows={12} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required className="w-full px-3 py-2 rounded-md border bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" placeholder="# Article heading&#10;&#10;Write your article content in markdown..." />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">SEO Title (optional)</label>
          <Input value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} className="w-full" placeholder="Override page title for SEO" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">SEO Description (optional)</label>
          <Input value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} className="w-full" placeholder="Meta description for search engines" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : (post ? "Update Post" : "Create Post")}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export const Route = createFileRoute("/admin/blog")({ component: BlogPage });
