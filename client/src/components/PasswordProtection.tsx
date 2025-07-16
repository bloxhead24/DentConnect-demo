import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield } from 'lucide-react';

interface PasswordProtectionProps {
  onAuthenticated: () => void;
}

export function PasswordProtection({ onAuthenticated }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === 'ToothPick') {
      // Store authentication in sessionStorage
      sessionStorage.setItem('dentconnect_authenticated', 'true');
      onAuthenticated();
    } else {
      setError('Incorrect password. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            DentConnect Demo
          </CardTitle>
          <CardDescription className="text-gray-600">
            This demo is temporarily password-protected during our pilot testing phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Enter Access Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Demo'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <i className="fas fa-award text-blue-600"></i>
                <span className="font-bold text-blue-800">Royal College of Surgeons</span>
              </div>
              <p className="text-sm text-blue-700">National Contribution to Dentistry 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}