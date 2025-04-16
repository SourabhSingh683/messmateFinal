
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-orange-300/20 dark:bg-orange-500/10 blur-3xl" 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 0.6, 
          scale: 1,
          x: [0, 20, 0],
          y: [0, 15, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-yellow-400/20 dark:bg-yellow-600/10 blur-3xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 0.6, 
          scale: 1,
          x: [0, -20, 0],
          y: [0, -15, 0]
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
      />
      
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between py-16 relative z-10">
        <motion.div 
          className="lg:w-1/2 max-w-xl mb-12 lg:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-[#8B4513] dark:text-amber-400">Mess</span> Service
            <span className="block">Simplified</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Connecting students with the best mess services in your area. Discover, compare, and subscribe to mess services effortlessly.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              onClick={() => navigate('/discover')}
              size="lg"
              className="bg-gradient-to-r from-[#8B4513] to-amber-600 hover:from-[#5C2C0C] hover:to-amber-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base font-semibold py-6"
            >
              Find Mess Services
            </Button>
            
            <Button 
              onClick={() => navigate('/create-mess')}
              variant="outline" 
              size="lg"
              className="border-2 border-[#8B4513] dark:border-amber-500 text-[#8B4513] dark:text-amber-400 hover:bg-[#8B4513]/10 dark:hover:bg-amber-500/10 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base font-semibold py-6"
            >
              Register Your Mess
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="lg:w-1/2 relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <motion.div
            className="relative z-10 overflow-hidden rounded-3xl shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1627662168223-7df99068099a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Delicious food" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white">
                <p className="text-2xl font-bold">Discover authentic meals</p>
                <p className="text-sm opacity-80">Expertly prepared by local mess services</p>
              </div>
            </div>
          </motion.div>
          
          {/* Floating badges */}
          <motion.div 
            className="absolute -top-10 -right-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{ 
              opacity: { duration: 0.8, delay: 0.9 },
              y: { duration: 0.5, delay: 0.9 },
              rotate: { duration: 2, repeat: Infinity, delay: 1.5 }
            }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="absolute -bottom-8 -left-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              rotate: [0, -5, 0, 5, 0],
            }}
            transition={{ 
              opacity: { duration: 0.8, delay: 1.1 },
              y: { duration: 0.5, delay: 1.1 },
              rotate: { duration: 2, repeat: Infinity, delay: 2 }
            }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8B4513] dark:text-amber-400">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mess Services</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="text-white dark:text-gray-900 fill-current"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
