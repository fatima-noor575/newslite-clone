import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AdsAuthContext';
import { AdCard } from '@/components/AdCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const { user } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAds, setTotalAds] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAds();
  }, [selectedCategory, currentPage]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchAds = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ads')
        .select('*, categories(name, icon), profiles(name)', { count: 'exact' })
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setAds(data || []);
      setTotalAds(count || 0);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAds();
  };

  const totalPages = Math.ceil(totalAds / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary">ClassifiedsHub</h1>
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button asChild size="sm">
                    <Link to="/post-ad">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Ad
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Login</Link>
                </Button>
              )}
            </div>
          </div>
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={(id) => {
              setSelectedCategory(id);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border">
            <p className="text-muted-foreground text-lg mb-4">No ads found</p>
            {user && (
              <Button asChild>
                <Link to="/post-ad">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Ad
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  id={ad.id}
                  title={ad.title}
                  price={ad.price}
                  location={ad.location}
                  images={ad.images}
                  createdAt={ad.created_at}
                  categoryName={ad.categories?.name}
                />
              ))}
            </div>

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
    </div>
  );
}