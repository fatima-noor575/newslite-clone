import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AdsAuthContext';
import { Newspaper, LogOut, Shield } from 'lucide-react';

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-news-hover transition-colors">
            <Newspaper className="h-8 w-8" />
            <span className="font-serif">NewsHub</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};