import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { useToast } from "../hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User, Mail, Phone, Calendar, Check, Shield, Info, AlertCircle, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription } from "../components/ui/alert";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
}

interface ValidationState {
  email: 'idle' | 'valid' | 'invalid';
  password: 'idle' | 'weak' | 'medium' | 'strong';
  passwordMatch: boolean;
  phone: 'idle' | 'valid' | 'invalid';
}

export default function EnhancedPatientSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState<FormData>({
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
  
  const [validation, setValidation] = useState<ValidationState>({
    email: 'idle',
    password: 'idle',
    passwordMatch: true,
    phone: 'idle'
  });

  // Real-time email validation
  useEffect(() => {
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidation(prev => ({
        ...prev,
        email: emailRegex.test(formData.email) ? 'valid' : 'invalid'
      }));
    } else {
      setValidation(prev => ({ ...prev, email: 'idle' }));
    }
  }, [formData.email]);

  // Real-time password strength check
  useEffect(() => {
    if (formData.password) {
      let strength: 'weak' | 'medium' | 'strong' = 'weak';
      if (formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password)) {
        strength = 'strong';
      } else if (formData.password.length >= 6) {
        strength = 'medium';
      }
      setValidation(prev => ({ ...prev, password: strength }));
    } else {
      setValidation(prev => ({ ...prev, password: 'idle' }));
    }
  }, [formData.password]);

  // Real-time password match check
  useEffect(() => {
    setValidation(prev => ({
      ...prev,
      passwordMatch: !formData.confirmPassword || formData.password === formData.confirmPassword
    }));
  }, [formData.password, formData.confirmPassword]);

  // Phone number formatting
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.startsWith('44')) {
      // UK format
      if (cleaned.length > 2) formatted = '+44 ' + cleaned.slice(2);
      if (cleaned.length > 6) formatted = '+44 ' + cleaned.slice(2, 6) + ' ' + cleaned.slice(6);
      if (cleaned.length > 10) formatted = '+44 ' + cleaned.slice(2, 6) + ' ' + cleaned.slice(6, 10) + ' ' + cleaned.slice(10, 13);
    } else if (cleaned.startsWith('0')) {
      // UK local format
      if (cleaned.length > 5) formatted = cleaned.slice(0, 5) + ' ' + cleaned.slice(5);
      if (cleaned.length > 9) formatted = cleaned.slice(0, 5) + ' ' + cleaned.slice(5, 9) + ' ' + cleaned.slice(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, phone: formatted });
    
    // Validate phone number
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 10 && cleaned.length <= 13) {
      setValidation(prev => ({ ...prev, phone: 'valid' }));
    } else if (cleaned.length > 0) {
      setValidation(prev => ({ ...prev, phone: 'invalid' }));
    } else {
      setValidation(prev => ({ ...prev, phone: 'idle' }));
    }
  };

  const createUserMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userType: "patient",
          gdprConsentGiven: data.gdprConsent,
          marketingConsentGiven: data.marketingConsent
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create account");
      }
      return await response.json();
    },
    onSuccess: async (response) => {
      if (response.token && response.user) {
        sessionStorage.setItem('dentconnect_user', JSON.stringify(response.user));
        sessionStorage.setItem('dentconnect_token', response.token);
        
        toast({
          title: "Account created successfully!",
          description: "Welcome to DentConnect. You can now book appointments.",
        });
        
        setLocation("/");
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

  const getPasswordStrengthColor = () => {
    switch (validation.password) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-amber-600';
      case 'weak': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getPasswordStrengthText = () => {
    switch (validation.password) {
      case 'strong': return 'Strong password';
      case 'medium': return 'Medium strength';
      case 'weak': return 'Weak password';
      default: return 'Enter a password';
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email) {
          toast({
            title: "Please fill in all fields",
            variant: "destructive"
          });
          return false;
        }
        if (validation.email === 'invalid') {
          toast({
            title: "Invalid email address",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 2:
        if (!formData.phone || !formData.dateOfBirth) {
          toast({
            title: "Please fill in all fields",
            variant: "destructive"
          });
          return false;
        }
        if (validation.phone === 'invalid') {
          toast({
            title: "Invalid phone number",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 3:
        if (!formData.password || !formData.confirmPassword) {
          toast({
            title: "Please enter and confirm your password",
            variant: "destructive"
          });
          return false;
        }
        if (validation.password === 'weak') {
          toast({
            title: "Password too weak",
            description: "Please use at least 8 characters with uppercase and numbers",
            variant: "destructive"
          });
          return false;
        }
        if (!validation.passwordMatch) {
          toast({
            title: "Passwords don't match",
            variant: "destructive"
          });
          return false;
        }
        if (!formData.gdprConsent) {
          toast({
            title: "Privacy policy consent required",
            description: "Please accept the privacy policy to continue",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    if (validateCurrentStep()) {
      createUserMutation.mutate(formData);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
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
                    className={`pl-10 pr-10 h-11 ${validation.email === 'invalid' ? 'border-red-500' : ''}`}
                    autoComplete="email"
                  />
                  {validation.email !== 'idle' && (
                    <div className="absolute right-3 top-3.5">
                      {validation.email === 'valid' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
                {validation.email === 'invalid' && (
                  <p className="text-xs text-red-600">Please enter a valid email address</p>
                )}
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
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`pl-10 pr-10 h-11 ${validation.phone === 'invalid' ? 'border-red-500' : ''}`}
                    autoComplete="tel"
                  />
                  {validation.phone !== 'idle' && (
                    <div className="absolute right-3 top-3.5">
                      {validation.phone === 'valid' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
                {validation.phone === 'invalid' && (
                  <p className="text-xs text-red-600">Please enter a valid UK phone number</p>
                )}
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
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your date of birth helps us provide age-appropriate dental care recommendations
                </AlertDescription>
              </Alert>
            </CardContent>
          </>
        );

      case 3:
        return (
          <>
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Secure your account</CardTitle>
              <CardDescription>
                Step 3 of 3: Create a strong password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="space-y-1">
                  <p className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                    {getPasswordStrengthText()}
                  </p>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      {formData.password.length >= 8 ? '✓' : '•'} At least 8 characters
                    </p>
                    <p className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(formData.password) ? '✓' : '•'} One uppercase letter
                    </p>
                    <p className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(formData.password) ? '✓' : '•'} One number
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`pr-10 h-11 ${!validation.passwordMatch && formData.confirmPassword ? 'border-red-500' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {!validation.passwordMatch && formData.confirmPassword && (
                  <p className="text-xs text-red-600">Passwords don't match</p>
                )}
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="gdpr"
                    checked={formData.gdprConsent}
                    onCheckedChange={(checked) => setFormData({ ...formData, gdprConsent: checked as boolean })}
                  />
                  <Label htmlFor="gdpr" className="text-sm font-normal cursor-pointer">
                    I agree to the <Link href="/privacy-policy" className="text-teal-600 hover:underline">Privacy Policy</Link> and understand how my data will be used
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.marketingConsent}
                    onCheckedChange={(checked) => setFormData({ ...formData, marketingConsent: checked as boolean })}
                  />
                  <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                    Send me helpful reminders and dental health tips (optional)
                  </Label>
                </div>
              </div>
            </CardContent>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            {renderStep()}
            
            <CardContent className="pt-0">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Shield className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : currentStep === totalSteps ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}