
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();

  // If still loading, don't redirect yet
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-messmate-brown"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has permission
  if (allowedRoles && profile) {
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to appropriate page based on role
      if (profile.role === "student") {
        return <Navigate to="/student-dashboard" />;
      } else if (profile.role === "mess_owner") {
        return <Navigate to="/mess-dashboard" />;
      }
      // Default fallback
      return <Navigate to="/" />;
    }
  }

  // User is authenticated and has the right role (or no specific role is required)
  return <>{children}</>;
};

export default ProtectedRoute;
