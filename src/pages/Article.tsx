import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AdsAuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Loader2, Shield, Newspaper, Share2, Facebook, Twitter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail_url: string | null;
  category: string;
  published_at: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  published_at: string;
}

const Article = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        navigate('/news');
        return;
      }
      
      setArticle(data);

      // Fetch related articles from same category
      const { data: related } = await supabase
        .from('articles')
        .select('id, title, slug, thumbnail_url, published_at')
        .eq('category', data.category)
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(3);

      setRelatedArticles(related || []);
    } catch (error) {
      console.error('Error fetching article:', error);
      navigate('/news');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/news" className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-lg">
                  <Newspaper className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-primary font-serif">NewsHub</h1>
              </Link>
            </div>
          </div>
        </header>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/news" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Newspaper className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-primary font-serif">NewsHub</h1>
            </Link>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              {!user && (
                <Button asChild size="sm">
                  <Link to="/auth">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/news')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Button>

          <article className="animate-fade-in">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 text-sm font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 text-foreground leading-tight">
              {article.title}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <time>
                  {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Share:</span>
                <button className="hover:text-primary transition-colors">
                  <Facebook className="h-4 w-4" />
                </button>
                <button className="hover:text-primary transition-colors">
                  <Twitter className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {article.thumbnail_url && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed font-medium">
              {article.excerpt}
            </p>
            
            {/* Content */}
            <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {article.content}
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/article/${related.slug}`}
                    className="group"
                  >
                    <article className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={related.thumbnail_url || 'https://via.placeholder.com/400x250'}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                        <time className="text-xs text-muted-foreground mt-2 block">
                          {formatDistanceToNow(new Date(related.published_at), { addSuffix: true })}
                        </time>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">© {new Date().getFullYear()} NewsHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Article;