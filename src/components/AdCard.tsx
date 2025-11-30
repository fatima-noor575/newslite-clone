import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AdsAuthContext';
import { toast } from 'sonner';

interface AdCardProps {
  id: string;
  title: string;
  price: number;
  location?: string;
  images: string[];
  createdAt: string;
  categoryName?: string;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
}

export const AdCard = ({
  id,
  title,
  price,
  location,
  images,
  createdAt,
  categoryName,
  isFavorite = false,
  onFavoriteChange
}: AdCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }

    setLoading(true);
    try {
      if (favorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('ad_id', id);
        
        if (error) throw error;
        setFavorite(false);
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, ad_id: id });
        
        if (error) throw error;
        setFavorite(true);
        toast.success('Added to favorites');
      }
      
      onFavoriteChange?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/ad/${id}`}>
      <div className="group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {images && images.length > 0 ? (
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📷</span>
            </div>
          )}
          
          {user && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleFavorite}
              disabled={loading}
            >
              <Heart className={`h-4 w-4 ${favorite ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
          )}
          
          {categoryName && (
            <Badge className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm">
              {categoryName}
            </Badge>
          )}
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-2xl font-bold text-primary">
            PKR {price.toLocaleString()}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {location && <span className="line-clamp-1">{location}</span>}
            <span className="text-xs">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};