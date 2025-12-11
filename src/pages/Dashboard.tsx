import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AdsAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Loader2, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [myAds, setMyAds] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchMyAds();
    fetchFavorites();
  }, [user, navigate]);

  const fetchMyAds = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('ads')
      .select('*, categories(name, icon)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my ads:', error);
      toast.error('Failed to load your ads');
    } else {
      setMyAds(data || []);
    }
    
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('favorites')
      .select('*, ads(*, categories(name, icon))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
    } else {
      setFavorites(data || []);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast.success('Ad deleted successfully');
      fetchMyAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    } finally {
      setDeleteAdId(null);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      toast.success('Removed from favorites');
      fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              )}
              <Button asChild size="sm">
                <Link to="/post-ad">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Ad
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="my-ads" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="my-ads">My Ads ({myAds.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="my-ads">
            {myAds.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't posted any ads yet</p>
                <Button asChild>
                  <Link to="/post-ad">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Ad
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myAds.map((ad) => (
                  <Card key={ad.id} className="p-4">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                      {ad.images && ad.images.length > 0 ? (
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📷</span>
                        </div>
                      )}
                    </div>
                    
                      <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{ad.title}</h3>
                        <span className="text-xs text-muted-foreground">{formatDate(ad.created_at)}</span>
                      </div>
                      
                      <p className="text-xl font-bold text-primary">
                        PKR {ad.price.toLocaleString()}
                      </p>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link to={`/ad/${ad.id}`}>View</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteAdId(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {favorites.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No favorite ads yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((fav) => {
                  const ad = fav.ads;
                  if (!ad) return null;
                  
                  return (
                    <Card key={fav.id} className="p-4">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                        {ad.images && ad.images.length > 0 ? (
                          <img
                            src={ad.images[0]}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">📷</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold line-clamp-1">{ad.title}</h3>
                        
                        <p className="text-xl font-bold text-primary">
                          PKR {ad.price.toLocaleString()}
                        </p>
                        
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link to={`/ad/${ad.id}`}>View</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFavorite(fav.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!deleteAdId} onOpenChange={() => setDeleteAdId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ad? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAdId && handleDeleteAd(deleteAdId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}