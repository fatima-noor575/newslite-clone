import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AdsAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Trash2, ArrowLeft, Plus } from 'lucide-react';
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

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAds: 0, totalUsers: 0, pendingAds: 0 });
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [deleteItemId, setDeleteItemId] = useState<{ id: string; type: string } | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      toast.error('Unauthorized access');
      return;
    }

    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const { count: adsCount } = await supabase.from('ads').select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      setStats({
        totalAds: adsCount || 0,
        totalUsers: usersCount || 0,
        pendingAds: pendingCount || 0,
      });

      // Fetch pending ads
      const { data: pendingData } = await supabase
        .from('ads')
        .select('*, categories(name), profiles(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      setPendingAds(pendingData || []);

      // Fetch all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      setAllUsers(usersData || []);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateAdStatus = async (adId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status })
        .eq('id', adId);

      if (error) throw error;

      toast.success(`Ad ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast.error('Failed to update ad status');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleteItemId(null);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name || !newCategory.icon) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: newCategory.name, icon: newCategory.icon });

      if (error) throw error;

      toast.success('Category added successfully');
      setNewCategory({ name: '', icon: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleteItemId(null);
    }
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
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Ads</h3>
            <p className="text-3xl font-bold">{stats.totalAds}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Pending Ads</h3>
            <p className="text-3xl font-bold text-warning">{stats.pendingAds}</p>
          </Card>
        </div>

        <Tabs defaultValue="pending-ads" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending-ads">Pending Ads ({stats.pendingAds})</TabsTrigger>
            <TabsTrigger value="users">Users ({stats.totalUsers})</TabsTrigger>
            <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-ads">
            {pendingAds.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending ads</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingAds.map((ad) => (
                  <Card key={ad.id} className="p-4">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                      {ad.images && ad.images.length > 0 ? (
                        <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📷</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2">{ad.title}</h3>
                      <p className="text-xl font-bold text-primary">PKR {ad.price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">By {ad.profiles?.name}</p>
                      <Badge>{ad.categories?.name}</Badge>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => updateAdStatus(ad.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => updateAdStatus(ad.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.phone || 'No phone'}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteItemId({ id: user.user_id, type: 'user' })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Add New Category</h3>
                <form onSubmit={addCategory} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Name</Label>
                      <Input
                        id="cat-name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="e.g., Furniture"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-icon">Icon (Emoji)</Label>
                      <Input
                        id="cat-icon"
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                        placeholder="e.g., 🪑"
                      />
                    </div>
                  </div>
                  <Button type="submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </form>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Existing Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteItemId({ id: cat.id, type: 'category' })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteItemId?.type}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteItemId?.type === 'user') {
                  deleteUser(deleteItemId.id);
                } else if (deleteItemId?.type === 'category') {
                  deleteCategory(deleteItemId.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}