import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const ARTICLES_PER_PAGE = 6;

const Index = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
      
      if (count) setTotalArticles(count);

      // Get paginated articles
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-foreground">
            Latest News & Stories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with breaking news, in-depth analysis, and exclusive stories from around the world
          </p>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  slug={article.slug}
                  excerpt={article.excerpt}
                  thumbnailUrl={article.thumbnail_url}
                  category={article.category}
                  publishedAt={article.published_at}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t mt-20 py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">© 2024 NewsHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;