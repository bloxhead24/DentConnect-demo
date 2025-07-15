import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DentConnectLogo } from "../components/DentConnectLogo";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Link } from "wouter";
import { Lock, Mail, User, Building, Shield } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  practiceTag: z.string().min(3, "Practice tag must be at least 3 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const practiceTagSchema = z.object({
  practiceTag: z.string().min(3, "Practice tag must be at least 3 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type PracticeTagForm = z.infer<typeof practiceTagSchema>;

export default function DentistLogin() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [practiceVerified, setPracticeVerified] = useState(false);
  const [practiceDetails, setPracticeDetails] = useState<any>(null);
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      practiceTag: "",
    },
  });

  const practiceTagForm = useForm<PracticeTagForm>({
    resolver: zodResolver(practiceTagSchema),
    defaultValues: {
      practiceTag: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      localStorage.setItem('dentist_session', data.sessionToken);
      localStorage.setItem('dentist_user', JSON.stringify(data.user));
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      // Redirect to dentist dashboard
      window.location.href = '/dentist-dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      return await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          userType: 'dentist',
        }),
      });
    },
    onSuccess: (data) => {
      localStorage.setItem('dentist_session', data.sessionToken);
      localStorage.setItem('dentist_user', JSON.stringify(data.user));
      toast({
        title: "Registration successful",
        description: "Welcome to DentConnect!",
      });
      // Redirect to dentist dashboard
      window.location.href = '/dentist-dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    },
  });

  const practiceTagMutation = useMutation({
    mutationFn: async (data: PracticeTagForm) => {
      return await apiRequest('/api/auth/verify-practice-tag', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setPracticeVerified(true);
      setPracticeDetails(data.practice);
      registerForm.setValue('practiceTag', practiceTagForm.getValues().practiceTag);
      toast({
        title: "Practice verified",
        description: `Connected to ${data.practice.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Practice verification failed",
        description: error.message || "Invalid practice tag",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const onVerifyPracticeTag = (data: PracticeTagForm) => {
    practiceTagMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <DentConnectLogo className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900">Dentist Portal</h1>
          <p className="text-gray-600 mt-2">Manage your practice appointments</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Login to Your Account
                </CardTitle>
                <CardDescription>
                  Enter your credentials to access your practice dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        {...loginForm.register("password")}
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Register Your Practice
                </CardTitle>
                <CardDescription>
                  Create an account to start managing your appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!practiceVerified ? (
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        First, verify your practice with your unique practice tag
                      </AlertDescription>
                    </Alert>
                    
                    <form onSubmit={practiceTagForm.handleSubmit(onVerifyPracticeTag)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="practiceTag">Practice Tag</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="practiceTag"
                            type="text"
                            placeholder="Enter your practice tag"
                            className="pl-10"
                            {...practiceTagForm.register("practiceTag")}
                          />
                        </div>
                        {practiceTagForm.formState.errors.practiceTag && (
                          <p className="text-sm text-red-500">{practiceTagForm.formState.errors.practiceTag.message}</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        disabled={practiceTagMutation.isPending}
                      >
                        {practiceTagMutation.isPending ? "Verifying..." : "Verify Practice"}
                      </Button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                      <p>Don't have a practice tag?</p>
                      <p>Contact support to get registered.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        ✅ Practice verified: {practiceDetails?.name}
                      </AlertDescription>
                    </Alert>
                    
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            {...registerForm.register("firstName")}
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500">{registerForm.formState.errors.firstName.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Smith"
                            {...registerForm.register("lastName")}
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                            {...registerForm.register("email")}
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            className="pl-10"
                            {...registerForm.register("password")}
                          />
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            className="pl-10"
                            {...registerForm.register("confirmPassword")}
                          />
                        </div>
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Link href="/" className="text-teal-600 hover:text-teal-700 text-sm">
            ← Back to Patient Portal
          </Link>
        </div>
      </div>
    </div>
  );
}