import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import HowItWorks from '@/components/home/HowItWorks';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Bell, Shield, MapPin } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <HeroSection />
      <HowItWorks />
      
      {/* Featured Mess Services Section */}
      <section className="py-16 bg-[#FDF6E3]/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#5C2C0C]">
              Find Your Perfect Mess
            </h2>
            <p className="text-[#8B4513] text-lg max-w-2xl mx-auto">
              Discover quality mess services tailored to your needs. Browse our selection and find the perfect match for your dietary preferences and budget.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#C4A484]/20">
              <div className="h-48 bg-gradient-to-br from-[#E67E22]/80 to-[#D35400]/80 flex items-center justify-center text-white">
                <Search className="h-16 w-16" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#5C2C0C]">Find Nearby Mess</h3>
                <p className="text-[#8B4513] mb-4">
                  Locate mess services near your location with our advanced search functionality.
                </p>
                <Button 
                  onClick={() => navigate('/discover')}
                  className="w-full bg-[#8B4513] hover:bg-[#5C2C0C] text-white flex items-center justify-center"
                >
                  Explore Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#C4A484]/20">
              <div className="h-48 bg-gradient-to-br from-[#2980B9]/80 to-[#3498DB]/80 flex items-center justify-center text-white">
                <Bell className="h-16 w-16" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#5C2C0C]">Get Notifications</h3>
                <p className="text-[#8B4513] mb-4">
                  Receive timely updates about meal schedules, special menus, and exclusive offers.
                </p>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="w-full bg-[#8B4513] hover:bg-[#5C2C0C] text-white flex items-center justify-center"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#C4A484]/20">
              <div className="h-48 bg-gradient-to-br from-[#27AE60]/80 to-[#2ECC71]/80 flex items-center justify-center text-white">
                <Shield className="h-16 w-16" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#5C2C0C]">Verified Providers</h3>
                <p className="text-[#8B4513] mb-4">
                  All mess services on our platform are thoroughly verified for quality and hygiene.
                </p>
                <Button 
                  onClick={() => navigate('/discover')}
                  className="w-full bg-[#8B4513] hover:bg-[#5C2C0C] text-white flex items-center justify-center"
                >
                  Browse Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/discover')}
              size="lg"
              className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white px-8 py-6 text-lg"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Find Mess Near You
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#5C2C0C]">
              What Our Users Say
            </h2>
            <p className="text-[#8B4513] text-lg max-w-2xl mx-auto">
              Don't just take our word for it. Here's what students and mess owners have to say about MessMate.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FDF6E3] p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-[#8B4513] rounded-full flex items-center justify-center text-white font-bold">
                  AK
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-[#5C2C0C]">Arun Kumar</h4>
                  <p className="text-sm text-[#8B4513]">Student</p>
                </div>
              </div>
              <p className="text-[#5C2C0C]">
                "MessMate has made finding affordable and quality food so much easier! I've been able to discover great mess services near my campus."
              </p>
            </div>
            
            <div className="bg-[#FDF6E3] p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-[#8B4513] rounded-full flex items-center justify-center text-white font-bold">
                  PR
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-[#5C2C0C]">Priya Rao</h4>
                  <p className="text-sm text-[#8B4513]">Mess Owner</p>
                </div>
              </div>
              <p className="text-[#5C2C0C]">
                "My mess service has grown tremendously since joining MessMate. The platform makes it easy to manage subscriptions and connect with students."
              </p>
            </div>
            
            <div className="bg-[#FDF6E3] p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-[#8B4513] rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-[#5C2C0C]">Sanjay Mehta</h4>
                  <p className="text-sm text-[#8B4513]">Student</p>
                </div>
              </div>
              <p className="text-[#5C2C0C]">
                "I love the subscription management features. It helps me track my payments and meal schedules effortlessly. Definitely recommend it!"
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#8B4513] to-[#5C2C0C] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Mess?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
            Join thousands of students who have found their ideal mess service through MessMate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/discover')}
              size="lg"
              className="bg-white text-[#5C2C0C] hover:bg-gray-100 px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-white"
            >
              <Search className="mr-2 h-5 w-5" />
              Find a Mess
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              size="lg"
              variant="outline"
              className="border-3 border-white text-white hover:bg-white/20 px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Create an Account
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
