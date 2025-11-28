import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Article = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
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
        navigate('/');
        return;
      }
      
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Button>

        <article className="animate-fade-in">
          <div className="mb-6">
            <span className="category-badge">{article.category}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            {article.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Clock className="h-4 w-4" />
            <time>
              Published {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
            </time>
          </div>

          {article.thumbnail_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.thumbnail_url}
                alt={article.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {article.excerpt}
            </p>
            
            <div className="text-foreground whitespace-pre-wrap leading-relaxed">
              {article.content}
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t mt-20 py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">© 2024 NewsHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Article;