import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AlertCircle, User, Stethoscope, Mail, Lock, Phone, Calendar, GraduationCap, Award, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";

// Login schemas
const patientLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const dentistLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Quick signup schemas
const patientSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const dentistSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  gdcNumber: z.string().min(6, "Please enter a valid GDC number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PatientLoginData = z.infer<typeof patientLoginSchema>;
type DentistLoginData = z.infer<typeof dentistLoginSchema>;
type PatientSignupData = z.infer<typeof patientSignupSchema>;
type DentistSignupData = z.infer<typeof dentistSignupSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"patient" | "dentist">("patient");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);

  // Form instances
  const patientLoginForm = useForm<PatientLoginData>({
    resolver: zodResolver(patientLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const dentistLoginForm = useForm<DentistLoginData>({
    resolver: zodResolver(dentistLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });



  const dentistSignupForm = useForm<DentistSignupData>({
    resolver: zodResolver(dentistSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      gdcNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handlePatientLogin = async (data: PatientLoginData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email/password
      sessionStorage.setItem('dentconnect_user', JSON.stringify({
        id: 1,
        email: data.email,
        userType: 'patient',
        firstName: 'Demo',
        lastName: 'Patient'
      }));
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in as patient",
      });
      
      setLocation('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDentistLogin = async (data: DentistLoginData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email/password
      sessionStorage.setItem('dentconnect_user', JSON.stringify({
        id: 1,
        email: data.email,
        userType: 'dentist',
        firstName: 'Dr. Richard',
        lastName: 'Thompson',
        practiceId: 1
      }));
      
      toast({
        title: "Welcome back, Dr. Thompson!",
        description: "Redirecting to your dashboard...",
      });
      
      setLocation('/dentist-dashboard');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDentistSignup = async (data: DentistSignupData) => {
    setIsLoading(true);
    setShowVerificationInfo(true);
    
    try {
      // Simulate GDC verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          userType: 'dentist',
          gdprConsentGiven: true,
        }),
      });

      if (!response.ok) throw new Error('Signup failed');
      
      const user = await response.json();
      
      sessionStorage.setItem('dentconnect_user', JSON.stringify({
        ...user,
        userType: 'dentist',
        practiceId: 1
      }));
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to DentConnect. Full verification will be completed within 24 hours.",
      });
      
      setLocation('/dentist-dashboard');
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'patient' | 'dentist') => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (type === 'patient') {
        sessionStorage.setItem('dentconnect_user', JSON.stringify({
          id: 1,
          email: 'demo.patient@example.com',
          userType: 'patient',
          firstName: 'Demo',
          lastName: 'Patient'
        }));
        toast({
          title: "Demo mode activated",
          description: "Logged in as demo patient",
        });
        setLocation('/');
      } else {
        sessionStorage.setItem('dentconnect_user', JSON.stringify({
          id: 1,
          email: 'dr.thompson@newcastle-dental.com',
          userType: 'dentist',
          firstName: 'Dr. Richard',
          lastName: 'Thompson',
          practiceId: 1
        }));
        toast({
          title: "Demo mode activated",
          description: "Logged in as Dr. Richard Thompson",
        });
        setLocation('/dentist-dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header with Logo and Badge */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center mb-4">
              <svg 
                width="60" 
                height="60" 
                viewBox="0 0 60 60" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="mr-3"
              >
                <circle cx="30" cy="30" r="30" fill="#0D9488" />
                <path d="M30 15C28.5 15 27 16 27 18C27 20 28.5 21 30 21C31.5 21 33 20 33 18C33 16 31.5 15 30 15Z" fill="white" />
                <path d="M20 25C20 23 22 21 24 21H36C38 21 40 23 40 25V35C40 40 36 45 30 45C24 45 20 40 20 35V25Z" fill="white" />
                <path d="M25 28H27V32H25V28ZM29 28H31V32H29V28ZM33 28H35V32H33V28Z" fill="#0D9488" />
              </svg>
              <h1 className="text-4xl font-bold text-teal-600">DentConnect</h1>
            </div>
          </Link>
          <p className="text-gray-600 mb-2">Connect with dental care instantly</p>
          
          {/* Demo Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block mb-4">
            <p className="text-amber-800 text-sm font-medium">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Demo Environment - No real appointments will be booked
            </p>
          </div>
          
          {/* Royal College Badge */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-semibold">Nominated for Excellence Award 2025</span>
              <span className="text-xs">Royal College of Surgeons</span>
            </div>
          </div>
        </div>

        {/* Quick demo access */}
        <div className="mb-6 flex justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin('patient')}
            disabled={isLoading}
            className="bg-white"
          >
            <User className="w-4 h-4 mr-2" />
            Try as Patient
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin('dentist')}
            disabled={isLoading}
            className="bg-white"
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Try as Dentist
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Card */}
          <Card className={`border-2 transition-all ${userType === 'patient' ? 'border-teal-500 shadow-lg' : 'border-gray-200'}`}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setUserType('patient')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${userType === 'patient' ? 'bg-teal-100' : 'bg-gray-100'}`}>
                    <User className={`w-6 h-6 ${userType === 'patient' ? 'text-teal-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <CardTitle>Patient Access</CardTitle>
                    <CardDescription>Book appointments instantly</CardDescription>
                  </div>
                </div>
                {userType === 'patient' && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
              </div>
            </CardHeader>
            
            {userType === 'patient' && (
              <CardContent>
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <Form {...patientLoginForm}>
                      <form onSubmit={patientLoginForm.handleSubmit(handlePatientLogin)} className="space-y-4">
                        <FormField
                          control={patientLoginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input {...field} type="email" placeholder="your@email.com" className="pl-10" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={patientLoginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            'Login'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <div className="space-y-4 text-center py-8">
                      <p className="text-gray-600">Create your patient account to book appointments instantly</p>
                      <Link href="/patient-signup">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700">
                          Go to Patient Signup
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>

          {/* Dentist Card */}
          <Card className={`border-2 transition-all ${userType === 'dentist' ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setUserType('dentist')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${userType === 'dentist' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Stethoscope className={`w-6 h-6 ${userType === 'dentist' ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <CardTitle>Dentist Access</CardTitle>
                    <CardDescription>Manage your practice</CardDescription>
                  </div>
                </div>
                {userType === 'dentist' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </div>
            </CardHeader>
            
            {userType === 'dentist' && (
              <CardContent>
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <Form {...dentistLoginForm}>
                      <form onSubmit={dentistLoginForm.handleSubmit(handleDentistLogin)} className="space-y-4">
                        <FormField
                          control={dentistLoginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input {...field} type="email" placeholder="dr.smith@practice.com" className="pl-10" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={dentistLoginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            'Login'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <Form {...dentistSignupForm}>
                      <form onSubmit={dentistSignupForm.handleSubmit(handleDentistSignup)} className="space-y-4">
                        {!showVerificationInfo ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={dentistSignupForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Dr. John" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dentistSignupForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Smith" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={dentistSignupForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Professional Email</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input {...field} type="email" placeholder="dr.smith@practice.com" className="pl-10" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={dentistSignupForm.control}
                              name="gdcNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GDC Number</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input {...field} placeholder="123456" className="pl-10" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={dentistSignupForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={dentistSignupForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Creating account...
                                </>
                              ) : (
                                'Create Account'
                              )}
                            </Button>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">Verification in Progress</h3>
                              <p className="text-sm text-gray-600 mb-4">
                                For demo purposes, verification is instant. In production:
                              </p>
                            </div>
                            
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Full verification process includes:</strong>
                                <ul className="mt-2 space-y-1 text-sm">
                                  <li>• GDC registration verification</li>
                                  <li>• Professional indemnity insurance check</li>
                                  <li>• Practice address verification</li>
                                  <li>• Identity document verification</li>
                                  <li>• CQC registration confirmation</li>
                                  <li>• DBS check validation</li>
                                </ul>
                              </AlertDescription>
                            </Alert>
                            
                            {isLoading && (
                              <div className="text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                <p className="text-sm text-gray-600 mt-2">Completing verification...</p>
                              </div>
                            )}
                          </div>
                        )}
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}