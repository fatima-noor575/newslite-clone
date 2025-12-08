import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AdsAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Shield, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ARTICLES_PER_PAGE = 9;

const CATEGORIES = ['All', 'Technology', 'Business', 'Environment', 'Space', 'Automotive', 'Sports', 'Politics'];

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  category: string;
  published_at: string;
  content: string;
}

export default function News() {
  const { user, isAdmin } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, currentPage]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .order('published_at', { ascending: false });

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query
        .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        if (currentPage === 1 && selectedCategory === 'All' && !searchQuery) {
          setFeaturedArticle(data[0]);
          setArticles(data.slice(1));
        } else {
          setFeaturedArticle(null);
          setArticles(data);
        }
      } else {
        setFeaturedArticle(null);
        setArticles([]);
      }
      
      setTotalArticles(count || 0);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 border-b border-border/50">
            <Link to="/news" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Newspaper className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary font-serif">NewsHub</h1>
                <p className="text-xs text-muted-foreground">Pakistan's Tech & Business News</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/">Classifieds</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Login</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary"
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              size="sm"
            >
              Search
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : articles.length === 0 && !featuredArticle ? (
          <div className="text-center py-20 bg-card rounded-xl border">
            <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-2">No articles found</p>
            <p className="text-muted-foreground">Check back later for new content</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <Link 
                to={`/article/${featuredArticle.slug}`}
                className="block mb-10 group"
              >
                <article className="relative overflow-hidden rounded-2xl bg-card border shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto md:h-[400px] overflow-hidden">
                      <img
                        src={featuredArticle.thumbnail_url || 'https://via.placeholder.com/800x450'}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary w-fit mb-4">
                        {featuredArticle.category}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground group-hover:text-primary transition-colors line-clamp-3">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>
                      <time className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="group"
                >
                  <article className="bg-card border rounded-xl overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={article.thumbnail_url || 'https://via.placeholder.com/400x250'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary mb-3">
                        {article.category}
                      </span>
                      <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <time className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                      </time>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="lg"
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

      {/* Footer */}
      <footer className="border-t mt-16 py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <Newspaper className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-primary font-serif">NewsHub</h3>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Your trusted source for technology, business, and current affairs news from Pakistan and around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CATEGORIES.slice(1, 5).map((cat) => (
                  <li key={cat}>
                    <button 
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Classifieds</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Login</Link></li>
                {isAdmin && <li><Link to="/admin" className="hover:text-primary transition-colors">Admin Panel</Link></li>}
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} NewsHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
