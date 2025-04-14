
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown, User, LogOut, Settings, Home, Search, Info, CreditCard } from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white bg-opacity-95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#8B4513] dark:text-white">
                MessMate
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/')
                  ? 'text-[#5C2C0C] dark:text-white font-bold'
                  : 'text-gray-600 hover:text-[#8B4513] dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/discover"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/discover')
                  ? 'text-[#5C2C0C] dark:text-white font-bold'
                  : 'text-gray-600 hover:text-[#8B4513] dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Find a Mess
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/about')
                  ? 'text-[#5C2C0C] dark:text-white font-bold'
                  : 'text-gray-600 hover:text-[#8B4513] dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              About
            </Link>
            <Link
              to="/pricing"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/pricing')
                  ? 'text-[#5C2C0C] dark:text-white font-bold'
                  : 'text-gray-600 hover:text-[#8B4513] dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Pricing
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#C4A484] text-[#8B4513] hover:bg-[#FDF6E3] hover:text-[#5C2C0C] dark:border-gray-600 dark:text-gray-200"
                  >
                    {profile?.first_name || 'Account'} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuLabel className="dark:text-gray-300">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:border-gray-700" />
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {profile?.role === 'student' && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/student-dashboard')}
                      className="cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'mess_owner' && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/mess-dashboard')}
                      className="cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Mess Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="dark:border-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="border-[#C4A484] text-[#8B4513] hover:bg-[#FDF6E3] hover:text-[#5C2C0C] dark:border-gray-600 dark:text-gray-200"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-[#8B4513] hover:bg-[#5C2C0C] text-white dark:bg-[#8B4513] dark:hover:bg-[#5C2C0C]"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-[#8B4513] hover:bg-[#FDF6E3] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8B4513] dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 dark:bg-gray-900">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/')
                ? 'bg-[#FDF6E3] text-[#5C2C0C] dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-[#FDF6E3] hover:text-[#8B4513] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
            onClick={toggleMobileMenu}
          >
            <Home className="inline-block h-5 w-5 mr-2" />
            Home
          </Link>
          <Link
            to="/discover"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/discover')
                ? 'bg-[#FDF6E3] text-[#5C2C0C] dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-[#FDF6E3] hover:text-[#8B4513] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
            onClick={toggleMobileMenu}
          >
            <Search className="inline-block h-5 w-5 mr-2" />
            Find a Mess
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/about')
                ? 'bg-[#FDF6E3] text-[#5C2C0C] dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-[#FDF6E3] hover:text-[#8B4513] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
            onClick={toggleMobileMenu}
          >
            <Info className="inline-block h-5 w-5 mr-2" />
            About
          </Link>
          <Link
            to="/pricing"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/pricing')
                ? 'bg-[#FDF6E3] text-[#5C2C0C] dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-[#FDF6E3] hover:text-[#8B4513] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
            onClick={toggleMobileMenu}
          >
            <CreditCard className="inline-block h-5 w-5 mr-2" />
            Pricing
          </Link>
          
          {user ? (
            <>
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      <User className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {profile?.first_name || ''} {profile?.last_name || ''}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-[#FDF6E3] hover:text-[#8B4513] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={toggleMobileMenu}
                  >
                    <User className="inline-block h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  {profile?.role === 'student' && (
                    <Link
                      to="/student-dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-[#FDF6E3] hover:text-[#8B4513] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      onClick={toggleMobileMenu}
                    >
                      <Home className="inline-block h-5 w-5 mr-2" />
                      Student Dashboard
                    </Link>
                  )}
                  {profile?.role === 'mess_owner' && (
                    <Link
                      to="/mess-dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-[#FDF6E3] hover:text-[#8B4513] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      onClick={toggleMobileMenu}
                    >
                      <Settings className="inline-block h-5 w-5 mr-2" />
                      Mess Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <LogOut className="inline-block h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2 px-4">
                <Button
                  variant="outline"
                  className="flex-1 border-[#C4A484] text-[#8B4513] hover:bg-[#FDF6E3] hover:text-[#5C2C0C] dark:border-gray-600 dark:text-gray-200"
                  onClick={() => {
                    navigate('/login');
                    toggleMobileMenu();
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1 bg-[#8B4513] hover:bg-[#5C2C0C] text-white dark:bg-[#8B4513] dark:hover:bg-[#5C2C0C]"
                  onClick={() => {
                    navigate('/signup');
                    toggleMobileMenu();
                  }}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
