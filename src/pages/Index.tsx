import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ARTICLES_PER_PAGE = 12;

const Index = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Technology', 'Mobile', 'Auto', 'Business', 'Startups', 'Telecom'];

  useEffect(() => {
    fetchArticles();
  }, [currentPage, selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let query = supabase.from('articles').select('*', { count: 'exact' });
      
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { count } = await query;
      if (count) setTotalArticles(count);

      let dataQuery = supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);
      
      if (selectedCategory !== 'All') {
        dataQuery = dataQuery.eq('category', selectedCategory);
      }

      const { data, error } = await dataQuery;

      if (error) throw error;
      
      if (data && data.length > 0 && currentPage === 1) {
        setFeaturedArticle(data[0]);
        setArticles(data.slice(1));
      } else {
        setArticles(data || []);
        setFeaturedArticle(null);
      }
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
      
      <main className="container mx-auto px-4 py-6">
        {/* Category Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <section className="mb-12 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-card rounded-lg overflow-hidden border shadow-lg">
                  <a 
                    href={`/article/${featuredArticle.slug}`}
                    className="relative aspect-video lg:aspect-auto overflow-hidden group"
                  >
                    {featuredArticle.thumbnail_url ? (
                      <img
                        src={featuredArticle.thumbnail_url}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}
                  </a>
                  <div className="p-6 lg:p-8 flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded mb-4 w-fit">
                      FEATURED
                    </span>
                    <a href={`/article/${featuredArticle.slug}`}>
                      <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4 text-foreground leading-tight hover:text-primary transition-colors">
                        {featuredArticle.title}
                      </h2>
                    </a>
                    <p className="text-muted-foreground text-lg mb-4 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-primary">{featuredArticle.category}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{new Date(featuredArticle.published_at).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Latest Articles Grid */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  {selectedCategory === 'All' ? 'Latest Stories' : `${selectedCategory} News`}
                </h2>
              </div>
              
              {articles.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border">
                  <p className="text-muted-foreground text-lg">
                    No articles available in this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article, index) => (
                    <div
                      key={article.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ArticleCard
                        id={article.id}
                        title={article.title}
                        slug={article.slug}
                        excerpt={article.excerpt}
                        thumbnailUrl={article.thumbnail_url}
                        category={article.category}
                        publishedAt={article.published_at}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t mt-20 py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">© 2024 ProPK News. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;