
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

const Signup = () => {
  const { signUp, user, isLoading } = useAuth();
  const [userType, setUserType] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    messName: '',
    agreeToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to homepage
  if (user && !isLoading) {
    return <Navigate to="/" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive"
      });
      return;
    }

    if (userType === 'mess_owner' && !formData.messName) {
      toast({
        title: "Mess name required",
        description: "Please provide a name for your mess service",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: userType,
          messName: userType === 'mess_owner' ? formData.messName : undefined
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-messmate-brown">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Join MessMate to connect with mess services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <RadioGroup 
                    defaultValue="student" 
                    className="flex gap-4"
                    value={userType}
                    onValueChange={(value) => setUserType(value as UserRole)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="cursor-pointer">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mess_owner" id="mess_owner" />
                      <Label htmlFor="mess_owner" className="cursor-pointer">Mess Owner</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                {userType === 'mess_owner' && (
                  <div className="space-y-2">
                    <Label htmlFor="messName">Mess Name</Label>
                    <Input 
                      id="messName" 
                      placeholder="Name of your mess service" 
                      value={formData.messName}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Input 
                    type="checkbox" 
                    id="agreeToTerms" 
                    className="w-4 h-4"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm font-normal">
                    I agree to the{' '}
                    <Link to="/terms" className="text-messmate-brown hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-messmate-brown hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-messmate-brown hover:bg-messmate-brown-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing up...
                    </span>
                  ) : "Sign Up"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-messmate-brown hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
