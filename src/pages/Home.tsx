
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-messmate-brown dark:text-white">
            Welcome to MessMate
          </h1>
          <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
            The ultimate platform for connecting mess services with students.
            Find affordable meal plans, manage your mess service, or subscribe to a local mess.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link to="/discover">
              <Button className="bg-messmate-orange hover:bg-messmate-orange-dark text-white px-8 py-6 text-lg">
                Find a Mess
              </Button>
            </Link>
            <Link to="/create-mess">
              <Button variant="outline" className="border-messmate-orange text-messmate-orange hover:bg-messmate-orange/10 px-8 py-6 text-lg">
                Register Your Mess
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
