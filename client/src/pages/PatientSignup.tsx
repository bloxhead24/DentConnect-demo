import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { Link, useLocation } from "wouter";
import DentConnectLogo from "../components/DentConnectLogo";
import { ArrowLeft, User, Mail, Phone, Calendar, Check, Shield, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export default function PatientSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    gdprConsent: false,
    marketingConsent: false
  });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userType: "patient",
          gdprConsentGiven: data.gdprConsent,
          marketingConsentGiven: data.marketingConsent
        })
      });
      if (!response.ok) throw new Error("Failed to create account");
      return await response.json();
    },
    onSuccess: async (user) => {
      // Auto-login after successful signup
      try {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            userType: "patient"
          })
        });
        if (!loginRes.ok) throw new Error("Login failed");
        const loginResponse = await loginRes.json();
        
        sessionStorage.setItem('dentconnect_user', JSON.stringify(loginResponse));
        
        toast({
          title: "Account created successfully!",
          description: "Welcome to DentConnect. You can now book appointments.",
        });
        
        setLocation("/");
      } catch (error) {
        toast({
          title: "Account created",
          description: "Please log in with your credentials.",
        });
        setLocation("/login");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      if (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email)) {
        toast({
          title: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      if (currentStep === 2 && (!formData.phone || !formData.dateOfBirth)) {
        toast({
          title: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final step - validate passwords
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    if (!formData.gdprConsent) {
      toast({
        title: "Privacy policy consent required",
        description: "Please accept the privacy policy to continue",
        variant: "destructive"
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Step 1 of 3: Basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </CardContent>
          </>
        );

      case 2:
        return (
          <>
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Contact details</CardTitle>
              <CardDescription>
                Step 2 of 3: How can we reach you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </CardContent>
          </>
        );

      case 3:
        return (
          <>
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Secure your account</CardTitle>
              <CardDescription>
                Step 3 of 3: Create a password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11"
                />
                <p className="text-xs text-gray-500">Minimum 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="gdpr"
                    checked={formData.gdprConsent}
                    onCheckedChange={(checked) => setFormData({ ...formData, gdprConsent: checked as boolean })}
                  />
                  <Label htmlFor="gdpr" className="text-sm font-normal cursor-pointer">
                    I agree to the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and understand how my data will be used
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.marketingConsent}
                    onCheckedChange={(checked) => setFormData({ ...formData, marketingConsent: checked as boolean })}
                  />
                  <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                    I'd like to receive updates about appointments and dental health tips
                  </Label>
                </div>
              </div>
            </CardContent>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Button>
          </Link>

          <div className="text-center mb-8">
            <DentConnectLogo width={200} height={40} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Join DentConnect</h1>
            <p className="text-gray-600 mt-2">Find and book dental appointments instantly</p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-8 max-w-xs mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step <= currentStep 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-gray-400 border-gray-300'
                }`}>
                  {step < currentStep ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-20 h-1 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Card className="shadow-xl">
            <form onSubmit={handleSubmit}>
              {renderStep()}
              
              <CardContent className="pt-0">
                <div className="flex space-x-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? (
                      "Creating account..."
                    ) : currentStep < totalSteps ? (
                      "Continue"
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>

          {/* Privacy notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">Your data is secure</p>
                <p>We use industry-standard encryption to protect your personal information. Your data will only be shared with the dental practices you book with.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}