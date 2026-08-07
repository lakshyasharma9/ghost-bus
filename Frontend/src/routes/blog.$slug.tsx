import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Clock, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Blog — GhostBus` },
      { name: "description", content: "GhostBus blog article — ghost production guides and industry insights." },
    ],
  }),
  component: BlogArticlePage,
});

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  category: string;
  tags: string[];
  author: string;
  readTime: string | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

function BlogArticlePage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    apiClient.get(`/blog/${slug}`)
      .then((res: any) => setPost(res.data?.data?.post ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-app py-32 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container-app py-32 text-center">
        <h1 className="text-2xl font-semibold mb-2">Post not found</h1>
        <p className="text-muted-foreground mb-6">This article doesn't exist or hasn't been published yet.</p>
        <Link to="/blog" className="text-primary font-medium hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="container-app pt-12 pb-24">
      <div className="max-w-3xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">{post.category}</span>
            {post.readTime && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {post.readTime}
              </span>
            )}
            {post.publishedAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            By <span className="font-medium text-foreground">{post.author}</span>
          </div>
        </div>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-10">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article body — render markdown as formatted text */}
        <article className="prose prose-lg max-w-none">
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-br from-foreground to-[#1a1a1a] text-background rounded-3xl">
          <h2 className="font-display text-2xl font-semibold mb-2">Ready to buy exclusive ghost produced tracks?</h2>
          <p className="text-background/70 text-sm mb-5">Browse our catalog of release-ready productions across all major EDM genres.</p>
          <Link to="/tracks" className="inline-flex h-11 px-5 items-center gap-2 rounded-full bg-background text-foreground font-medium hover:scale-[1.02] transition">
            Browse Tracks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Simple Markdown Renderer ──────────────────────────────────────────────────
function MarkdownRenderer({ content }: { content: string }) {
  // Convert markdown to HTML-like rendering
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-1 mb-4">
          {listItems.map((item, i) => <li key={i} className="text-foreground/80">{item}</li>)}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(<h1 key={i} className="font-display text-3xl font-semibold mt-8 mb-4">{trimmed.slice(2)}</h1>);
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={i} className="font-display text-2xl font-semibold mt-6 mb-3">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={i} className="font-semibold text-xl mt-5 mb-2">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      // Bold/italic inline support
      const formatted = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');
      elements.push(
        <p key={i} className="text-foreground/80 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    }
  });
  flushList();

  return <div>{elements}</div>;
}
