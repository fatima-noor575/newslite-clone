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
    <article className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
      <Link to={`/article/${slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-4xl text-muted-foreground/20">📰</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-sm backdrop-blur-sm">
              {category}
            </span>
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-serif font-bold mb-2 text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
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