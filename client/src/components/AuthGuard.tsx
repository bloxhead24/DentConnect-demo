import { useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";

interface AuthGuardProps {
  children: ReactNode;
  requiredUserType?: "patient" | "dentist";
  redirectTo?: string;
}

export function AuthGuard({ children, requiredUserType, redirectTo = "/login" }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      // Check basic password protection first
      const isPasswordAuthenticated = sessionStorage.getItem('dentconnect_authenticated') === 'true';
      if (!isPasswordAuthenticated) {
        setLocation('/');
        return;
      }

      // Check user authentication
      const userStr = sessionStorage.getItem('dentconnect_user');
      if (!userStr) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue",
          variant: "destructive",
        });
        setLocation(redirectTo);
        return;
      }

      // Check user type if required
      if (requiredUserType) {
        try {
          const user = JSON.parse(userStr);
          if (user.userType !== requiredUserType) {
            toast({
              title: "Access denied",
              description: `This page is only accessible to ${requiredUserType}s`,
              variant: "destructive",
            });
            setLocation('/');
            return;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          toast({
            title: "Authentication error",
            description: "Please log in again",
            variant: "destructive",
          });
          setLocation(redirectTo);
          return;
        }
      }
    };

    checkAuth();
  }, [requiredUserType, redirectTo, setLocation, toast]);

  return <>{children}</>;
}