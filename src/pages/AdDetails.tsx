import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AdsAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft, MapPin, Calendar, User, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function AdDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchAdDetails();
  }, [id]);

  const fetchAdDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*, categories(name, icon), profiles(name, phone)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data || (data.status !== 'approved' && data.user_id !== user?.id)) {
        navigate('/');
        toast.error('Ad not found or not available');
        return;
      }

      setAd(data);

      if (user) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('ad_id', id)
          .maybeSingle();
        
        setIsFavorite(!!favData);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
      toast.error('Failed to load ad details');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to save favorites');
      navigate('/auth');
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('ad_id', id);
        
        if (error) throw error;
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, ad_id: id });
        
        if (error) throw error;
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ads
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="p-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                {ad.images && ad.images.length > 0 ? (
                  <img
                    src={ad.images[currentImageIndex]}
                    alt={ad.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">📷</span>
                  </div>
                )}
              </div>
              
              {ad.images && ad.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {ad.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${ad.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-foreground whitespace-pre-wrap">{ad.description}</p>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Price & Title */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="mb-2">
                    {ad.categories?.icon} {ad.categories?.name}
                  </Badge>
                  <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>
                  <p className="text-4xl font-bold text-primary">
                    PKR {ad.price.toLocaleString()}
                  </p>
                </div>
                {user && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={toggleFavorite}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                  </Button>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{ad.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </Card>

            {/* Seller Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Seller Information
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{ad.profiles?.name}</p>
                {ad.profiles?.phone && (
                  <p className="text-sm text-muted-foreground">{ad.profiles.phone}</p>
                )}
              </div>
              <Button className="w-full mt-4">Contact Seller</Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}