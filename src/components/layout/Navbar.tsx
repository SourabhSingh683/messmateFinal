
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfile } from '@/types/auth';
import { User, Menu, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="nav-glass py-4 sticky top-0 z-50 transition-all duration-300">
      <div className="responsive-container flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-messmate-orange flex items-center hover-scale">
          MessMate
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/discover" className="text-messmate-brown hover:text-messmate-orange transition-colors hover-scale">
            Discover
          </Link>
          <Link to="/how-it-works" className="text-messmate-brown hover:text-messmate-orange transition-colors hover-scale">
            How It Works
          </Link>
          <Link to="/pricing" className="text-messmate-brown hover:text-messmate-orange transition-colors hover-scale">
            Pricing
          </Link>
          <Link to="/about" className="text-messmate-brown hover:text-messmate-orange transition-colors hover-scale">
            About
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
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
    <Link to="/login" className="text-messmate-brown hover:text-messmate-orange flex items-center gap-1 transition-colors hover-scale">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
      </svg>
      <span>Log In</span>
    </Link>
    <Link to="/signup">
      <Button className="bg-messmate-orange hover:bg-messmate-orange-dark text-white transition-all duration-200 hover:scale-105 hover:shadow-md">
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
      <Button variant="outline" className="flex items-center gap-2 hover-scale button-glass">
        <span className="hidden sm:inline-block">
          {profile ? `${profile.first_name} ${profile.last_name}` : 'Menu'}
        </span>
        <User className="h-5 w-5" />
        <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56 glass-card">
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
        <DropdownMenuItem asChild className="hover-scale">
          <Link to="/student-dashboard" className="w-full cursor-pointer">
            Dashboard
          </Link>
        </DropdownMenuItem>
      )}
      
      {profile?.role === 'mess_owner' && (
        <>
          <DropdownMenuItem asChild className="hover-scale">
            <Link to="/mess-dashboard" className="w-full cursor-pointer">
              Mess Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover-scale">
            <Link to="/manage-mess" className="w-full cursor-pointer">
              Manage Mess
            </Link>
          </DropdownMenuItem>
        </>
      )}
      
      <DropdownMenuItem asChild className="hover-scale">
        <Link to="/profile" className="w-full cursor-pointer">
          Profile
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem 
        onClick={() => signOut()} 
        className="cursor-pointer text-destructive focus:text-destructive hover-scale"
      >
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default Navbar;
