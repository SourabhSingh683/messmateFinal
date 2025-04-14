
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { ChevronLeft, CameraIcon, User, AtSign, MapPin, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Profile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setAvatar(profile.avatar_url || null);
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }
    
    try {
      setLoading(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      // Upload avatar to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const avatarUrl = data.publicUrl;
      
      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatar(avatarUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully."
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please log in to view your profile.</p>
              <Button className="mt-4" asChild>
                <a href="/login">Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1">Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-[#5C2C0C]">Your Profile</h1>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#8B4513]/10 to-[#E67E22]/5 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#F5F5DC]">
                      <User className="h-16 w-16 text-[#8B4513]" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 h-8 w-8 bg-[#8B4513] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#5C2C0C] transition-colors group-hover:scale-110">
                  <CameraIcon className="h-4 w-4 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                    disabled={loading}
                  />
                </label>
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-[#5C2C0C]">
                  {firstName} {lastName}
                </h2>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-[#8B4513] mt-2">
                  <div className="flex items-center justify-center md:justify-start">
                    <AtSign className="h-4 w-4 mr-1" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profile?.role || 'User'}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {profile?.created_at 
                        ? `Joined ${new Date(profile.created_at).toLocaleDateString()}` 
                        : 'Recently joined'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="border border-[#C4A484]/20 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-[#5C2C0C]">Edit Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user.email} 
                        disabled 
                        className="bg-gray-50" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#8B4513] hover:bg-[#5C2C0C] text-white transition-colors duration-300"
                    >
                      {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <Card className="border border-[#C4A484]/20 shadow-md p-6">
                <h3 className="text-xl font-bold text-[#5C2C0C] mb-4">Your Subscriptions</h3>
                <SubscriptionsTab userId={user.id} />
              </Card>
            </TabsContent>
            
            <TabsContent value="payments">
              <Card className="border border-[#C4A484]/20 shadow-md p-6">
                <h3 className="text-xl font-bold text-[#5C2C0C] mb-4">Payment History</h3>
                <PaymentsTab userId={user.id} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

// Subscriptions Tab Component
const SubscriptionsTab = ({ userId }: { userId: string }) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            mess_services(name, address)
          `)
          .eq('student_id', userId);
          
        if (error) throw error;
        
        setSubscriptions(data || []);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [userId]);
  
  if (loading) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }
  
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-[#8B4513]">You don't have any active subscriptions.</p>
        <Button 
          className="mt-4 bg-[#8B4513] hover:bg-[#5C2C0C] text-white"
          onClick={() => window.location.href = '/discover'}
        >
          Browse Mess Services
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {subscriptions.map((sub) => (
        <div key={sub.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-[#5C2C0C]">{sub.mess_services?.name}</h4>
              <p className="text-sm text-muted-foreground">{sub.mess_services?.address}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              sub.status === 'active' ? 'bg-green-100 text-green-800' : 
              sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {sub.status}
            </span>
          </div>
          <div className="mt-2 text-sm grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Start Date:</span>
              <span className="ml-1">{new Date(sub.start_date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">End Date:</span>
              <span className="ml-1">{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'Ongoing'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Payments Tab Component
const PaymentsTab = ({ userId }: { userId: string }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            mess_services(name)
          `)
          .eq('student_id', userId)
          .order('payment_date', { ascending: false });
          
        if (error) throw error;
        
        setPayments(data || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [userId]);
  
  if (loading) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }
  
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-[#8B4513]">No payment records found.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-sm text-[#8B4513]">
          <tr>
            <th className="p-3 rounded-tl-lg">Date</th>
            <th className="p-3">Mess Service</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Method</th>
            <th className="p-3 rounded-tr-lg">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="p-3 text-sm">
                {new Date(payment.payment_date).toLocaleDateString()}
              </td>
              <td className="p-3 text-sm font-medium">{payment.mess_services?.name || 'Unknown'}</td>
              <td className="p-3 text-sm">₹{payment.amount}</td>
              <td className="p-3 text-sm">{payment.payment_method}</td>
              <td className="p-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Profile;
