
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-messmate-brown dark:text-white">About MessMate</h1>
          
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-messmate-orange dark:text-blue-300">Our Mission</h2>
              <p className="text-lg mb-6 dark:text-gray-300">
                MessMate is on a mission to revolutionize how students and professionals find, manage, and enjoy mess services. 
                We believe good food shouldn't be complicated, and finding reliable meal services shouldn't be a hassle.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-messmate-orange dark:text-blue-300">Who We Are</h2>
              <p className="text-lg mb-6 dark:text-gray-300">
                Founded in 2023, MessMate brings together a passionate team of food enthusiasts, tech innovators, and former students 
                who understand the challenges of finding good, reliable meal services. 
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white/20 dark:bg-gray-800/50 p-6 rounded-lg shadow-sm hover-scale hover-shadow">
                  <h3 className="text-xl font-semibold mb-3 text-messmate-brown dark:text-white">For Students</h3>
                  <p className="dark:text-gray-300">Find and subscribe to the best mess services near your location. Discover menus, read reviews, and manage your meal plans in one place.</p>
                </div>
                
                <div className="bg-white/20 dark:bg-gray-800/50 p-6 rounded-lg shadow-sm hover-scale hover-shadow">
                  <h3 className="text-xl font-semibold mb-3 text-messmate-brown dark:text-white">For Mess Owners</h3>
                  <p className="dark:text-gray-300">Grow your mess service with powerful management tools. Manage customers, inventory, menus, and receive payments online.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-messmate-orange dark:text-blue-300">Our Values</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-messmate-orange/20 dark:bg-blue-900/30 p-2 rounded-full mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-messmate-orange dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-messmate-brown dark:text-white">Quality First</h3>
                    <p className="dark:text-gray-300">We believe everyone deserves access to quality meals that nourish both body and soul.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-messmate-orange/20 dark:bg-blue-900/30 p-2 rounded-full mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-messmate-orange dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-messmate-brown dark:text-white">Community Connection</h3>
                    <p className="dark:text-gray-300">Food brings people together, and we're building a community around shared meals and experiences.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-messmate-orange/20 dark:bg-blue-900/30 p-2 rounded-full mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-messmate-orange dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-messmate-brown dark:text-white">Innovation</h3>
                    <p className="dark:text-gray-300">We're constantly exploring new ways to improve the mess service experience through technology.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-messmate-orange/20 dark:bg-blue-900/30 p-2 rounded-full mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-messmate-orange dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-messmate-brown dark:text-white">Transparency</h3>
                    <p className="dark:text-gray-300">Clear information about menus, pricing, and reviews helps everyone make better decisions.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default About;
