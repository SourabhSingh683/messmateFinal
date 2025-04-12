
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="border-b border-muted py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-messmate-brown flex items-center">
          MessMate
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/discover" className="text-foreground hover:text-messmate-brown transition-colors">
            Discover
          </Link>
          <Link to="/how-it-works" className="text-foreground hover:text-messmate-brown transition-colors">
            How It Works
          </Link>
          <Link to="/pricing" className="text-foreground hover:text-messmate-brown transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="text-foreground hover:text-messmate-brown transition-colors">
            About
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-foreground hover:text-messmate-brown flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
            </svg>
            <span>Log In</span>
          </Link>
          <Link to="/signup">
            <Button className="bg-messmate-brown hover:bg-messmate-brown-dark">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
