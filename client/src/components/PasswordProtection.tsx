import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in this session
    const auth = sessionStorage.getItem("demo_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
      // Also set the key that AuthGuard checks
      sessionStorage.setItem("dentconnect_authenticated", "true");
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === "AppleTooth") {
      sessionStorage.setItem("demo_authenticated", "true");
      sessionStorage.setItem("dentconnect_authenticated", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">DentConnect Pilot Demo</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              This is a protected pilot demo. Please enter the password to continue.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter demo password"
                  className={error ? "border-red-500" : ""}
                  autoFocus
                />
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Incorrect password. Please try again.</span>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">
                Access Demo
              </Button>
            </form>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 text-center">
                <strong>Note:</strong> This is a demonstration environment. No real appointments will be booked.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}