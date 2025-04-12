
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-foreground py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <Link to="/" className="text-2xl font-bold text-messmate-brown">
            MessMate
          </Link>
          <p className="mt-4 text-muted-foreground">
            Connect with affordable, quality meal options near your campus.
          </p>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-semibold text-lg mb-4">For Students</h3>
          <ul className="space-y-2">
            <li><Link to="/discover" className="text-muted-foreground hover:text-messmate-brown">Find Mess Near You</Link></li>
            <li><Link to="/how-it-works" className="text-muted-foreground hover:text-messmate-brown">How It Works</Link></li>
            <li><Link to="/pricing" className="text-muted-foreground hover:text-messmate-brown">Pricing</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-semibold text-lg mb-4">For Mess Owners</h3>
          <ul className="space-y-2">
            <li><Link to="/register-mess" className="text-muted-foreground hover:text-messmate-brown">Register Your Mess</Link></li>
            <li><Link to="/owner-dashboard" className="text-muted-foreground hover:text-messmate-brown">Mess Dashboard</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-semibold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link to="/about" className="text-muted-foreground hover:text-messmate-brown">About Us</Link></li>
            <li><Link to="/privacy" className="text-muted-foreground hover:text-messmate-brown">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-muted-foreground hover:text-messmate-brown">Terms of Service</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-messmate-brown">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto mt-12 pt-6 border-t border-muted">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} MessMate. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="#" className="text-muted-foreground hover:text-messmate-brown">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-messmate-brown">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-messmate-brown">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
