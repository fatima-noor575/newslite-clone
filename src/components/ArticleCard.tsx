import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string | null;
  category: string;
  publishedAt: string;
}

export const ArticleCard = ({
  id,
  title,
  slug,
  excerpt,
  thumbnailUrl,
  category,
  publishedAt,
}: ArticleCardProps) => {
  return (
    <article className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in">
      <Link to={`/article/${slug}`} className="block">
        <div className="relative overflow-hidden aspect-video bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="category-badge">{category}</span>
          </div>
        </div>
        
        <div className="p-5">
          <h2 className="text-xl font-serif font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h2>
          
          <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
            {excerpt}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <time>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</time>
          </div>
        </div>
      </Link>
    </article>
  );
};