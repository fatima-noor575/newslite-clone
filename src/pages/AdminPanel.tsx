import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AdsAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Trash2,
  ArrowLeft,
  Plus,
  Eye,
  FileText,
  Users,
  BarChart3,
} from 'lucide-react';
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

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[] | null;
  created_at: string;
  location: string | null;
  user_id: string;
  categories: { name: string } | null;
  profiles: { name: string; phone: string | null } | null;
}

interface Stats {
  totalAds: number;
  totalUsers: number;
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalAds: 0,
    totalUsers: 0,
  });
  const [ads, setAds] = useState<Ad[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [deleteItemId, setDeleteItemId] = useState<{ id: string; type: string } | null>(null);
  
  // Modal states
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

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
      // Fetch all stats
      const { count: adsCount } = await supabase.from('ads').select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      setStats({
        totalAds: adsCount || 0,
        totalUsers: usersCount || 0,
      });

      // Fetch all ads with categories
      const { data: adsData } = await supabase
        .from('ads')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      
      // Fetch profiles separately to join with ads
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, phone');
      
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      const adsWithProfiles = (adsData || []).map(ad => ({
        ...ad,
        profiles: profilesMap.get(ad.user_id) || null
      })) as Ad[];
      
      setAds(adsWithProfiles);

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

  const deleteAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast.success('Ad deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    } finally {
      setDeleteItemId(null);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ads</p>
                <p className="text-2xl font-bold">{stats.totalAds}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="ads" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="ads" className="gap-2">
              <FileText className="h-4 w-4" />
              Advertisements
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="h-4 w-4" />
              News Articles
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users ({stats.totalUsers})
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Categories ({categories.length})
            </TabsTrigger>
          </TabsList>

          {/* Advertisements Tab */}
          <TabsContent value="ads">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Advertisement Management</h2>
              </div>

              {ads.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No ads found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell>
                            <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                              {ad.images && ad.images.length > 0 ? (
                                <img
                                  src={ad.images[0]}
                                  alt={ad.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">
                                  📷
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {ad.title}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{ad.profiles?.name || 'Unknown'}</p>
                              <p className="text-muted-foreground text-xs">{ad.profiles?.phone || 'No phone'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{ad.categories?.name || 'N/A'}</span>
                          </TableCell>
                          <TableCell className="font-semibold">
                            PKR {ad.price.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(ad.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedAd(ad);
                                  setViewModalOpen(true);
                                }}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteItemId({ id: ad.id, type: 'ad' })}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">News Article Management</h2>
                <Button asChild>
                  <Link to="/admin/articles">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Articles
                  </Link>
                </Button>
              </div>
              <p className="text-muted-foreground text-center py-8">
                Click "Manage Articles" to create, edit, and delete news articles for your website.
              </p>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">User Management</h2>
              {allUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.phone || 'Not provided'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(u.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteItemId({ id: u.user_id, type: 'user' })}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Add New Category</h3>
                <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="cat-name">Name</Label>
                    <Input
                      id="cat-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g., Furniture"
                    />
                  </div>
                  <div className="w-full sm:w-32 space-y-2">
                    <Label htmlFor="cat-icon">Icon (Emoji)</Label>
                    <Input
                      id="cat-icon"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      placeholder="e.g., 🪑"
                    />
                  </div>
                  <div className="self-end">
                    <Button type="submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </form>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Existing Categories</h3>
                {categories.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No categories yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteItemId({ id: cat.id, type: 'category' })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* View Ad Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ad Details</DialogTitle>
            <DialogDescription>
              Viewing ad information
            </DialogDescription>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4">
              {selectedAd.images && selectedAd.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedAd.images.slice(0, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{selectedAd.title}</h3>
                <p className="text-2xl font-bold text-primary mt-2">
                  PKR {selectedAd.price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedAd.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{selectedAd.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p>{selectedAd.categories?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Posted by</p>
                  <p>{selectedAd.profiles?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Posted on</p>
                  <p>{formatDate(selectedAd.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
                if (deleteItemId?.type === 'ad') {
                  deleteAd(deleteItemId.id);
                } else if (deleteItemId?.type === 'user') {
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