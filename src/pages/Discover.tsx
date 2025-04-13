
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { MessService } from '@/types/database';

const Discover = () => {
  const [messServices, setMessServices] = useState<MessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMessServices();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // If user is logged in, save their location
          if (user) {
            saveUserLocation(latitude, longitude);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "Please enable location access to find mess services near you.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
    }
  };

  const saveUserLocation = async (latitude: number, longitude: number) => {
    try {
      // Use the RPC function to update user location
      const { error } = await supabase.rpc('update_user_location', {
        user_id: user?.id,
        user_latitude: latitude,
        user_longitude: longitude
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving location:", error.message);
    }
  };

  const fetchMessServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mess_services')
        .select('*');

      if (error) throw error;
      
      if (data) {
        setMessServices(data);
      }
    } catch (error: any) {
      console.error("Error fetching mess services:", error.message);
      toast({
        title: "Failed to load mess services",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const filteredMessServices = messServices
    .filter(mess => 
      mess.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mess.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (userLocation) {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distA - distB;
      }
      return 0;
    });

  const viewMessDetails = (messId: string) => {
    // Check if user is authenticated before navigating to details page
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view mess details",
        variant: "destructive"
      });
      // Redirect to login page with a return URL
      navigate(`/login?redirect=/mess-details/${messId}`);
      return;
    }
    
    // User is authenticated, proceed to mess details
    navigate(`/mess-details/${messId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-[#5C2C0C]">Find Mess Services Near You</h1>
          <p className="text-[#8B4513] max-w-2xl mx-auto text-lg font-medium">
            Discover affordable, quality meal options near your location. Browse through available mess services and find the perfect fit for your dietary preferences and budget.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 max-w-xl mx-auto">
            <Input
              type="text"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={getUserLocation} variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="1" />
                <path d="M12 7V9" />
                <path d="M12 15v2" />
                <path d="M7 12H9" />
                <path d="M15 12h2" />
              </svg>
              Use Current Location
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-messmate-brown"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMessServices.length > 0 ? (
              filteredMessServices.map((mess) => (
                <Card key={mess.id} className="overflow-hidden h-full flex flex-col">
                  <div className="h-48 bg-muted relative">
                    <img
                      src="/placeholder.svg"
                      alt={mess.name}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        // Load mess image if available
                        const fetchMessImage = async () => {
                          const { data } = await supabase
                            .from('mess_images')
                            .select('image_url')
                            .eq('mess_id', mess.id)
                            .eq('is_primary', true)
                            .single();
                          
                          if (data) {
                            (e.target as HTMLImageElement).src = data.image_url;
                          }
                        };
                        fetchMessImage();
                      }}
                    />
                    {userLocation && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          mess.latitude,
                          mess.longitude
                        ).toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{mess.name}</CardTitle>
                    <CardDescription>{mess.address}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-2">
                      {mess.description || "No description available."}
                    </p>
                    <div className="flex gap-2 mt-4">
                      {mess.is_vegetarian && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Veg</span>
                      )}
                      {mess.is_non_vegetarian && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Non-Veg</span>
                      )}
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        ₹{mess.price_monthly}/month
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => viewMessDetails(mess.id)} className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-lg font-medium">No mess services found</h3>
                <p className="text-muted-foreground">Try adjusting your search or location.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Discover;
