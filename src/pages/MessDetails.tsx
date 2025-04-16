
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { MessService } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, MapPin, Phone, Mail, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const MessDetails = () => {
  const { messId } = useParams<{ messId: string }>();
  const [mess, setMess] = useState<MessService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMessDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!messId) {
          setError("Mess ID is missing");
          return;
        }

        console.log('Fetching mess details for ID:', messId);
        
        const { data, error } = await supabase
          .from('mess_services')
          .select('*')
          .eq('id', messId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching mess details:', error);
          setError(error.message);
          return;
        }

        if (!data) {
          setError("Mess not found");
          return;
        }

        console.log('Mess details fetched successfully:', data);
        setMess(data);
      } catch (error: any) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessDetails();
  }, [messId, user, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const renderMessDetails = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Load Mess Details</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleBack}>
              Go Back
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#8B4513] hover:bg-[#5C2C0C]"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (!mess) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Mess Not Found</h2>
          <p className="text-muted-foreground mb-6">The mess you're looking for doesn't exist or has been removed.</p>
          <Button variant="default" onClick={handleBack}>
            Go Back to Search
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
          <img
            src="/placeholder.svg"
            alt={mess.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{mess.name}</h1>
            <div className="flex items-center text-white/90">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{mess.address}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About this Mess</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{mess.description || "No description available."}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-[#8B4513] mt-0.5" />
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-sm text-muted-foreground">{mess.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-[#8B4513] mt-0.5" />
                    <div>
                      <h3 className="font-medium">Subscription</h3>
                      <p className="text-sm text-muted-foreground">₹{mess.price_monthly}/month</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Food Type</h3>
                  <div className="flex space-x-2">
                    {mess.is_vegetarian && (
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        Vegetarian
                      </span>
                    )}
                    {mess.is_non_vegetarian && (
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                        <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                        Non-Vegetarian
                      </span>
                    )}
                  </div>
                </div>
                
                <Button className="mt-8 w-full lg:w-auto bg-[#8B4513] hover:bg-[#5C2C0C]">
                  Subscribe to this Mess
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <CardTitle>Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">Menu coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">The mess owner hasn't added menu details yet.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Be the first to review this mess.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center" 
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </Button>
        
        {renderMessDetails()}
      </div>
    </Layout>
  );
};

export default MessDetails;
