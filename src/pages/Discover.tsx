
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { MessService } from '@/types/database';
import { ChevronLeft, MapPin, Search, Star, Loader } from 'lucide-react';

const Discover = () => {
  const [messServices, setMessServices] = useState<MessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
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
        console.log("Fetched mess services:", data);
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
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    
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

  const handleBack = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate(-1);
    }, 100);
  };

  const viewMessDetails = (messId: string) => {
    setIsNavigating(true);
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view mess details",
        variant: "destructive"
      });
      setTimeout(() => {
        navigate(`/login?redirect=/mess/${messId}`);
      }, 100);
      return;
    }
    
    setTimeout(() => {
      navigate(`/mess/${messId}`);
    }, 100);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={handleBack}
            disabled={isNavigating}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1">Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-[#5C2C0C]">Find Mess Services Near You</h1>
        </div>
        
        <div className="mb-8 max-w-2xl mx-auto text-center">
          <p className="text-[#8B4513] max-w-2xl mx-auto text-lg font-medium mb-6">
            Discover affordable, quality meal options near your location. Browse through available mess services and find the perfect fit for your dietary preferences and budget.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 max-w-xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={getUserLocation} variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading mess services...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMessServices.length > 0 ? (
              filteredMessServices.map((mess) => (
                <Card key={mess.id} className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 border border-[#C4A484]/30">
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
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          mess.latitude,
                          mess.longitude
                        ).toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-[#5C2C0C]">{mess.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                      {mess.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pb-2">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {mess.description || "No description available."}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {mess.is_vegetarian && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                          Veg
                        </span>
                      )}
                      {mess.is_non_vegetarian && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                          Non-Veg
                        </span>
                      )}
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        ₹{mess.price_monthly}/month
                      </span>
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-amber-500 stroke-amber-500" />
                        4.5
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => viewMessDetails(mess.id)} 
                      className="w-full bg-[#8B4513] hover:bg-[#5C2C0C] text-white"
                      disabled={isNavigating}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-white/50 rounded-lg border border-[#C4A484]/20">
                <h3 className="text-lg font-medium text-[#5C2C0C]">No mess services found</h3>
                <p className="text-muted-foreground">Try adjusting your search or location.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Discover;
