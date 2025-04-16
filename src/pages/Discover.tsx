
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
import { ChevronLeft, MapPin, Search, Star, Loader, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import MessFilters from '@/components/discover/MessFilters';

const Discover = () => {
  const [messServices, setMessServices] = useState<MessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 10000]);
  const [maxDistance, setMaxDistance] = useState<number>(20);
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [nonVegOnly, setNonVegOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(1);
  
  // Rating data (to be fetched later)
  const [messRatings, setMessRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchMessServices();
    fetchRatings();
    getUserLocation();
  }, []);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('mess_id, rating');
      
      if (error) throw error;
      
      if (data) {
        // Calculate average ratings per mess
        const ratingsMap: Record<string, {sum: number, count: number}> = {};
        
        data.forEach(review => {
          if (!ratingsMap[review.mess_id]) {
            ratingsMap[review.mess_id] = { sum: 0, count: 0 };
          }
          ratingsMap[review.mess_id].sum += review.rating;
          ratingsMap[review.mess_id].count += 1;
        });
        
        // Convert to average ratings
        const averageRatings: Record<string, number> = {};
        Object.keys(ratingsMap).forEach(messId => {
          averageRatings[messId] = ratingsMap[messId].sum / ratingsMap[messId].count;
        });
        
        setMessRatings(averageRatings);
      }
    } catch (error: any) {
      console.error("Error fetching ratings:", error.message);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Got user location:", latitude, longitude);
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
      console.log("Saving user location:", latitude, longitude);
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
      setError(null);
      console.log("Fetching mess services");
      
      // Fixed direct query to mess_services table
      const { data, error } = await supabase
        .from('mess_services')
        .select('*');

      if (error) {
        console.error("Error fetching mess services:", error);
        setError(error.message);
        throw error;
      }
      
      console.log("Fetched mess services:", data);
      if (data && data.length > 0) {
        setMessServices(data);
      } else {
        console.log("No mess services found");
        // Setting empty array instead of null
        setMessServices([]);
      }
    } catch (error: any) {
      console.error("Error fetching mess services:", error.message);
      setError(error.message);
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

  const resetFilters = () => {
    setPriceRange([1000, 10000]);
    setMaxDistance(20);
    setVegOnly(false);
    setNonVegOnly(false);
    setMinRating(1);
  };

  const getMessRating = (messId: string) => {
    return messRatings[messId] || 4.5; // Default to 4.5 if no ratings
  };

  const filteredMessServices = messServices
    .filter(mess => {
      // Search term filter
      const matchesSearch = mess.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           mess.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Price filter
      const matchesPrice = mess.price_monthly >= priceRange[0] && mess.price_monthly <= priceRange[1];
      
      // Distance filter
      let matchesDistance = true;
      if (userLocation) {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, mess.latitude, mess.longitude);
        matchesDistance = distance <= maxDistance;
      }
      
      // Veg/Non-veg filter
      let matchesDietType = true;
      if (vegOnly && !mess.is_vegetarian) {
        matchesDietType = false;
      }
      if (nonVegOnly && !mess.is_non_vegetarian) {
        matchesDietType = false;
      }
      
      // Rating filter
      const messRating = getMessRating(mess.id);
      const matchesRating = messRating >= minRating;
      
      return matchesSearch && matchesPrice && matchesDistance && matchesDietType && matchesRating;
    })
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
    
    console.log("Navigating to mess details:", messId);
    
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

  const handleRefresh = () => {
    fetchMessServices();
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

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 max-w-xl mx-auto mb-4">
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
            <Button onClick={getUserLocation} variant="outline" className="flex-shrink-0">
              <MapPin className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
          </div>
          
          <div className="flex space-x-2 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-[#8B4513]"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center text-[#8B4513]"
              disabled={loading}
            >
              <Loader className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <MessFilters 
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          vegOnly={vegOnly}
          setVegOnly={setVegOnly}
          nonVegOnly={nonVegOnly}
          setNonVegOnly={setNonVegOnly}
          minRating={minRating}
          setMinRating={setMinRating}
          resetFilters={resetFilters}
          isOpen={showFilters}
          setIsOpen={setShowFilters}
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading mess services...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white/50 rounded-lg border border-[#C4A484]/20">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-medium text-[#5C2C0C] mb-2">Error Loading Mess Services</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="default" className="bg-[#8B4513] hover:bg-[#5C2C0C]">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMessServices.length > 0 ? (
              filteredMessServices.map((mess) => {
                const distance = userLocation ? 
                  calculateDistance(userLocation.lat, userLocation.lng, mess.latitude, mess.longitude) : null;
                const rating = getMessRating(mess.id);
                
                return (
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
                              .maybeSingle();
                            
                            if (data) {
                              (e.target as HTMLImageElement).src = data.image_url;
                            }
                          };
                          fetchMessImage();
                        }}
                      />
                      {distance !== null && (
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {distance.toFixed(1)} km away
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
                          {rating.toFixed(1)}
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
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 bg-white/50 rounded-lg border border-[#C4A484]/20">
                <h3 className="text-lg font-medium text-[#5C2C0C]">No mess services found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
                <Button onClick={handleRefresh} className="mt-4 bg-[#8B4513] hover:bg-[#5C2C0C]">
                  Refresh Listing
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Discover;
