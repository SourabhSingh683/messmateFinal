
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfile } from '@/types/auth';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();

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
          {user ? (
            <AuthenticatedMenu profile={profile} signOut={signOut} />
          ) : (
            <GuestMenu />
          )}
        </div>
      </div>
    </header>
  );
};

const GuestMenu = () => (
  <>
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
  </>
);

const AuthenticatedMenu = ({ 
  profile, 
  signOut 
}: { 
  profile: UserProfile | null; 
  signOut: () => Promise<void>;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2">
        <span className="hidden sm:inline-block">
          {profile ? `${profile.first_name} ${profile.last_name}` : 'Menu'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
        </svg>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      {profile && (
        <>
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{profile.first_name} {profile.last_name}</p>
            <p className="text-xs text-muted-foreground">Role: {profile.role === 'student' ? 'Student' : 'Mess Owner'}</p>
          </div>
          <DropdownMenuSeparator />
        </>
      )}
      
      {profile?.role === 'student' && (
        <DropdownMenuItem asChild>
          <Link to="/student-dashboard" className="w-full cursor-pointer">
            Dashboard
          </Link>
        </DropdownMenuItem>
      )}
      
      {profile?.role === 'mess_owner' && (
        <>
          <DropdownMenuItem asChild>
            <Link to="/mess-dashboard" className="w-full cursor-pointer">
              Mess Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/manage-mess" className="w-full cursor-pointer">
              Manage Mess
            </Link>
          </DropdownMenuItem>
        </>
      )}
      
      <DropdownMenuItem asChild>
        <Link to="/profile" className="w-full cursor-pointer">
          Profile
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default Navbar;
