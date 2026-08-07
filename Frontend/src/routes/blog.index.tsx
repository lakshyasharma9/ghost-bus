import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — GhostBus Ghost Production Marketplace" },
      { name: "description", content: "GhostBus blog — guides, tutorials, and industry insights for DJs, artists, and ghost producers." },
    ],
  }),
  component: BlogIndexPage,
});

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string;
  tags: string[];
  author: string;
  readTime: string | null;
  publishedAt: string | null;
}

const CATEGORIES = ["All", "Guide", "Industry", "Buying Guide", "Production", "Studio", "DJ Guide", "Business", "Comparison"];

function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: "50" };
    if (category !== "All") params.category = category;

    apiClient.get("/blog", { params })
      .then((res: any) => setPosts(res.data?.data?.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="container-app pt-12 pb-24">
      <div className="max-w-3xl mb-12">
        <div className="label-eyebrow mb-3">Blog</div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">GhostBus Blog</h1>
        <p className="text-xl text-muted-foreground">Guides, tutorials, and industry insights for DJs, artists, and ghost producers.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-10 -mx-4 px-4 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 h-9 px-4 rounded-full border text-sm font-medium transition ${
              category === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-card hover:border-primary/40 hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-2xl">
          <p className="font-semibold mb-1">No blog posts yet</p>
          <p className="text-sm text-muted-foreground">Check back soon for guides and industry insights.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}` as any}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(6,2,38,0.12)] transition-all"
            >
              {/* Article image */}
              <div className="aspect-video bg-gradient-to-br from-accent to-muted flex items-center justify-center overflow-hidden">
                {post.coverImageUrl ? (
                  <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{post.category}</span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">{post.category}</span>
                  {post.readTime && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{post.readTime}</span>
                  )}
                </div>
                <h2 className="font-semibold leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
                {post.excerpt && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>}
                <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium">
                  Read more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
