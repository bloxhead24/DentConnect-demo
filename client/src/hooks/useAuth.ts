import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "./use-toast";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: "patient" | "dentist";
  practiceId?: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = sessionStorage.getItem('dentconnect_user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, userType: "patient" | "dentist") => {
    try {
      // For demo purposes, we'll simulate an API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      sessionStorage.setItem('dentconnect_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('dentconnect_user');
    sessionStorage.removeItem('dentconnect_token');
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    setLocation('/login');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      sessionStorage.setItem('dentconnect_user', JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPatient: user?.userType === 'patient',
    isDentist: user?.userType === 'dentist',
    login,
    logout,
    updateUser,
  };
}