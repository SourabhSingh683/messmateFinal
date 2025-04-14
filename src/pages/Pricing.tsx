
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-messmate-brown dark:text-white">Simple, Transparent Pricing</h1>
            <p className="text-lg max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
              Choose the plan that's right for your mess service. All plans include access to our core features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover-scale hover-shadow transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <h3 className="text-xl font-bold text-messmate-brown dark:text-white">Starter</h3>
                <div className="mt-4 flex items-baseline text-messmate-brown dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">₹499</span>
                  <span className="ml-1 text-2xl font-medium">/month</span>
                </div>
                <p className="mt-5 text-gray-500 dark:text-gray-400">Perfect for small mess services just getting started.</p>
              </div>
              
              <div className="px-8 pt-6 pb-8">
                <ul className="space-y-4">
                  {["Up to 50 customers", "Basic inventory management", "Weekly menu planning", "Email support"].map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-gray-700 dark:text-gray-300">{feature}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button className="w-full bg-messmate-orange hover:bg-messmate-orange-dark text-white transition-all duration-200 hover:shadow-md">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Pro Plan - Most Popular */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden hover-scale hover-shadow transition-all duration-300 border-2 border-messmate-orange dark:border-blue-500 transform scale-105">
              <div className="absolute inset-x-0 top-0 transform translate-y-px">
                <div className="flex justify-center transform -translate-y-1/2">
                  <span className="inline-flex rounded-full bg-messmate-orange px-4 py-1 text-sm font-semibold tracking-wider uppercase text-white">
                    Most Popular
                  </span>
                </div>
              </div>
              
              <div className="p-8 bg-gradient-to-br from-messmate-orange/10 to-messmate-orange/5 dark:from-blue-900/30 dark:to-blue-900/10">
                <h3 className="text-xl font-bold text-messmate-brown dark:text-white">Pro</h3>
                <div className="mt-4 flex items-baseline text-messmate-brown dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">₹999</span>
                  <span className="ml-1 text-2xl font-medium">/month</span>
                </div>
                <p className="mt-5 text-gray-500 dark:text-gray-400">All the essentials for running a growing mess service.</p>
              </div>
              
              <div className="px-8 pt-6 pb-8">
                <ul className="space-y-4">
                  {[
                    "Up to 200 customers",
                    "Advanced inventory management",
                    "Menu planning with analytics",
                    "Customer feedback system",
                    "Priority email support",
                    "Subscription management"
                  ].map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-gray-700 dark:text-gray-300">{feature}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button className="w-full bg-messmate-orange hover:bg-messmate-orange-dark text-white transition-all duration-200 hover:shadow-md">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover-scale hover-shadow transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <h3 className="text-xl font-bold text-messmate-brown dark:text-white">Enterprise</h3>
                <div className="mt-4 flex items-baseline text-messmate-brown dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">₹1999</span>
                  <span className="ml-1 text-2xl font-medium">/month</span>
                </div>
                <p className="mt-5 text-gray-500 dark:text-gray-400">Advanced features for large mess services with multiple locations.</p>
              </div>
              
              <div className="px-8 pt-6 pb-8">
                <ul className="space-y-4">
                  {[
                    "Unlimited customers",
                    "Multi-location support",
                    "AI-powered inventory forecasting",
                    "Advanced analytics dashboard",
                    "Dedicated account manager",
                    "24/7 phone & email support",
                    "Custom integrations"
                  ].map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-gray-700 dark:text-gray-300">{feature}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button className="w-full bg-messmate-orange hover:bg-messmate-orange-dark text-white transition-all duration-200 hover:shadow-md">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6 text-messmate-brown dark:text-white">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-left p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm hover-shadow glass-card">
                <h3 className="text-lg font-semibold mb-2 text-messmate-brown dark:text-white">Can I change plans later?</h3>
                <p className="text-gray-600 dark:text-gray-300">Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.</p>
              </div>
              
              <div className="text-left p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm hover-shadow glass-card">
                <h3 className="text-lg font-semibold mb-2 text-messmate-brown dark:text-white">Is there a free trial?</h3>
                <p className="text-gray-600 dark:text-gray-300">Yes, all plans come with a 14-day free trial so you can test the features before committing.</p>
              </div>
              
              <div className="text-left p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm hover-shadow glass-card">
                <h3 className="text-lg font-semibold mb-2 text-messmate-brown dark:text-white">Do you offer refunds?</h3>
                <p className="text-gray-600 dark:text-gray-300">If you're not satisfied within the first 30 days, we offer a full refund, no questions asked.</p>
              </div>
              
              <div className="text-left p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm hover-shadow glass-card">
                <h3 className="text-lg font-semibold mb-2 text-messmate-brown dark:text-white">What payment methods do you accept?</h3>
                <p className="text-gray-600 dark:text-gray-300">We accept all major credit cards, UPI, and bank transfers for Enterprise plans.</p>
              </div>
            </div>
            
            <div className="mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-6">Have more questions? We're here to help.</p>
              <Link to="/contact">
                <Button variant="outline" className="hover-scale button-glass">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
