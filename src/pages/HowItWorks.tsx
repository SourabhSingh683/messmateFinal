
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HowItWorksComponent from '@/components/home/HowItWorks';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-16">
          <h1 className="text-4xl font-bold text-messmate-brown text-center mb-8">How MessMate Works</h1>
          <p className="text-xl text-center max-w-3xl mx-auto mb-16">
            Whether you're a student looking for affordable meals or a mess owner wanting to grow your business, 
            our platform makes it easy to connect.
          </p>
        </div>
        <HowItWorksComponent />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
