
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#FDF6E3] to-[#F7EFE1]">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#5C2C0C]">
            Find Your Perfect Mess
          </h1>
          <p className="text-xl text-[#8B4513]/80">
            Connect with affordable, quality meal options near your campus. 
            MessMate helps students discover and subscribe to the best mess facilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/discover" 
              className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 border-2 border-[#8B4513] transform hover:scale-105"
            >
              <span>Find Mess Near You</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/manage-mess" 
              className="bg-white text-[#8B4513] border-2 border-[#8B4513] hover:bg-[#FDF6E3] font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center transform hover:scale-105"
            >
              Register Your Mess
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-[#8B4513]/5 rounded-xl"></div>
          <img 
            src="/lovable-uploads/a7f3bc40-daa5-47c0-ba84-59ee36fb094f.png" 
            alt="Students enjoying mess food" 
            className="rounded-xl shadow-lg w-full object-cover max-h-[500px] border-4 border-white"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
