import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AdsAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Shield, ChevronRight, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

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

const ARTICLES_PER_PAGE = 12;
const NEWS_CATEGORIES = ['Technology', 'Business', 'Telecom', 'Apps', 'Mobile', 'Broadband', 'Policy', 'Security'];

export default function Home() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    fetchArticles();
    fetchTrendingArticles();
  }, [selectedCategory, currentPage]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .order('published_at', { ascending: false })
        .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      if (data && data.length > 0 && currentPage === 1 && !selectedCategory && !searchQuery) {
        setFeaturedArticle(data[0]);
        setArticles(data.slice(1));
      } else {
        setArticles(data || []);
        if (currentPage !== 1 || selectedCategory || searchQuery) {
          setFeaturedArticle(null);
        }
      }
      setTotalArticles(count || 0);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingArticles = async () => {
    try {
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, category, published_at')
        .order('published_at', { ascending: false })
        .limit(5);
      
      setTrendingArticles(data as Article[] || []);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-4">
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="hover:text-primary transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">Pro</span>
                <span className="text-accent">Pakistan</span>
              </h1>
            </Link>
            
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted border-0"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Category Navigation */}
        <nav className="border-t border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                All News
              </button>
              {NEWS_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden bg-card border-b border-border p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-0"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : articles.length === 0 && !featuredArticle ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Article */}
              {featuredArticle && (
                <Link to={`/article/${featuredArticle.slug}`} className="block group">
                  <article className="news-card overflow-hidden">
                    <div className="relative aspect-video">
                      {featuredArticle.thumbnail_url ? (
                        <img
                          src={featuredArticle.thumbnail_url}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-6xl">📰</span>
                        </div>
                      )}
                      <div className="featured-overlay" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <span className="news-category-accent mb-3 inline-block">
                          {featuredArticle.category}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-white/80 line-clamp-2 mb-3">
                          {featuredArticle.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Clock className="h-4 w-4" />
                          {formatDate(featuredArticle.published_at)}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Article Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <Link key={article.id} to={`/article/${article.slug}`} className="block group">
                    <article className="news-card overflow-hidden hover-scale">
                      <div className="aspect-video relative">
                        {article.thumbnail_url ? (
                          <img
                            src={article.thumbnail_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-4xl">📰</span>
                          </div>
                        )}
                        <span className="news-category absolute top-3 left-3">
                          {article.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="news-headline text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="news-excerpt text-sm line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 news-meta">
                          <Clock className="h-3 w-3" />
                          {formatDate(article.published_at)}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Trending Section */}
              <div className="news-card p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <h3 className="font-bold text-lg">Trending Now</h3>
                </div>
                <div className="space-y-4">
                  {trendingArticles.map((article, index) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="flex gap-3 group"
                    >
                      <span className="text-2xl font-bold text-muted-foreground/50">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {article.category}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories Widget */}
              <div className="news-card p-4">
                <h3 className="font-bold text-lg mb-4 pb-3 border-b border-border">
                  Categories
                </h3>
                <div className="space-y-2">
                  {NEWS_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1);
                      }}
                      className="flex items-center justify-between w-full p-2 hover:bg-muted transition-colors text-left"
                    >
                      <span className="text-sm">{category}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                <span className="text-primary">Pro</span>
                <span className="text-accent">Pakistan</span>
              </h3>
              <p className="text-background/70 text-sm">
                Your trusted source for technology, telecom, and business news from Pakistan.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-background/70">
                {NEWS_CATEGORIES.slice(0, 4).map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                        window.scrollTo(0, 0);
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
              <h4 className="font-bold mb-4">More</h4>
              <ul className="space-y-2 text-sm text-background/70">
                {NEWS_CATEGORIES.slice(4).map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                        window.scrollTo(0, 0);
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-6 text-center text-sm text-background/50">
            © {new Date().getFullYear()} ProPakistan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
