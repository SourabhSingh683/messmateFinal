import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="py-16 md:py-24 bg-messmate-beige-light">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-messmate-brown">
            Find Your Perfect Mess
          </h1>
          <p className="text-xl text-messmate-brown/80">
            Connect with affordable, quality meal options near your campus. 
            MessMate helps students discover and subscribe to the best mess facilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/discover" 
              className="messmate-btn-primary flex items-center justify-center gap-2"
            >
              <span>Find Mess Near You</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <Link 
              to="/manage-mess" 
              className="messmate-btn-secondary flex items-center justify-center"
            >
              Register Your Mess
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-messmate-brown/5 rounded-xl"></div>
          <img 
            src="/lovable-uploads/a7f3bc40-daa5-47c0-ba84-59ee36fb094f.png" 
            alt="Students enjoying mess food" 
            className="rounded-xl shadow-lg w-full object-cover max-h-[500px]"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
