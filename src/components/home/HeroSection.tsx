
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#FDF6E3] to-[#F7EFE1] dark:from-[#1a0f06] dark:to-[#25150a] transition-colors duration-500">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#5C2C0C] dark:text-[#F7EFE1] transition-all duration-500">
            Find Your Perfect Mess
          </h1>
          <p className="text-xl text-[#8B4513]/80 dark:text-[#E9DBC5] transition-colors duration-500">
            Connect with affordable, quality meal options near your campus. 
            MessMate helps students discover and subscribe to the best mess facilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/discover" 
              className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white font-semibold py-3 px-6 rounded-lg 
                        shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 
                        border-2 border-[#8B4513] transform hover:scale-105 group"
            >
              <span>Find Mess Near You</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/manage-mess" 
              className="bg-white text-[#8B4513] border-2 border-[#8B4513] hover:bg-[#FDF6E3] 
                        font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg 
                        transition-all duration-300 flex items-center justify-center 
                        transform hover:scale-105 dark:bg-[#25150a] dark:text-[#F7EFE1] 
                        dark:border-[#F7EFE1]/70 dark:hover:bg-[#2c190c]"
            >
              Register Your Mess
            </Link>
          </div>
        </div>
        <div className="relative animate-fade-in">
          <div className="absolute inset-0 bg-[#8B4513]/5 rounded-xl dark:bg-[#8B4513]/20"></div>
          <div className="rounded-xl overflow-hidden shadow-lg transform transition-all duration-700 hover:scale-[1.02] hover:shadow-xl border-4 border-white dark:border-[#3A1E0C]">
            <img 
              src="/lovable-uploads/a7f3bc40-daa5-47c0-ba84-59ee36fb094f.png" 
              alt="Students enjoying mess food" 
              className="w-full object-cover max-h-[500px]"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-[#8B4513] rounded-full flex items-center justify-center opacity-90 shadow-lg transform transition-transform duration-500 hover:scale-110 text-white font-bold">
            <div className="text-center">
              <div className="text-xs">Starting</div>
              <div className="text-lg">₹999</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
