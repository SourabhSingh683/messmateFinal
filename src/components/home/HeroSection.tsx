
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Utensils, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const heroImage = '/lovable-uploads/b802a6dc-65c7-44fe-b9f4-22fb71a658fd.png';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/discover?search=${encodeURIComponent(searchQuery)}`);
  };

  const getStartedPath = user 
    ? profile?.role === 'mess_owner' 
      ? '/mess-dashboard' 
      : '/student-dashboard'
    : '/signup';

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-[#FDF6E3]/30 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <motion.div 
            className="flex flex-col justify-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-2">
              <motion.h1 
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-[#8B4513] dark:text-[#E67E22]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Find the Perfect Mess Service Near You
              </motion.h1>
              <motion.p 
                className="max-w-[600px] text-muted-foreground md:text-xl dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Connect with the best mess services in your area. Enjoy home-cooked meals, hassle-free subscriptions, and a community of food lovers.
              </motion.p>
            </div>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                onClick={() => navigate(getStartedPath)} 
                className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white transition-all duration-300 transform hover:scale-105 h-12 px-6"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => navigate('/discover')} 
                variant="outline" 
                className="border-[#8B4513] text-[#8B4513] hover:bg-[#FDF6E3] dark:border-[#E67E22] dark:text-[#E67E22] dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 h-12 px-6"
              >
                Explore Mess Services
              </Button>
            </motion.div>
            <motion.form 
              onSubmit={handleSearch} 
              className="flex max-w-md items-center gap-2 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location or name..."
                  className="pl-10 border-[#8B4513]/20 focus:border-[#8B4513] dark:bg-gray-800 dark:border-gray-700 pr-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button 
                type="submit" 
                className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white h-12 px-6 transition-all duration-300 hover:shadow-md"
              >
                Search
              </Button>
            </motion.form>
            <motion.div 
              className="flex items-center gap-4 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium bg-gradient-to-br ${
                      ['from-red-400 to-red-500', 'from-blue-400 to-blue-500', 'from-green-400 to-green-500', 'from-purple-400 to-purple-500'][i]
                    }`}
                  >
                    <Utensils className="h-3 w-3 text-white" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">4,000+</span> students served daily
              </p>
            </motion.div>
          </motion.div>
          <motion.div 
            className="mx-auto flex-1 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={heroImage}
              alt="Students enjoying mess food"
              className="aspect-video rounded-xl object-cover w-full max-w-[600px] shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] border border-gray-200 dark:border-gray-800"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
