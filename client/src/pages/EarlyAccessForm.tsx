import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DentConnectLogo from "@/components/DentConnectLogo";
import { CheckCircle, Sparkles, Users, Calendar, Shield } from "lucide-react";

interface EarlyAccessFormData {
  name: string;
  email: string;
  userType: "patient" | "dentist";
  organization?: string;
  message?: string;
}

export default function EarlyAccessForm() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<EarlyAccessFormData>({
    defaultValues: {
      userType: "patient",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: EarlyAccessFormData) => {
      return await apiRequest("/api/early-access", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Thank you for your interest. We'll be in touch soon!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EarlyAccessFormData) => {
    submitMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-primary-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
            <p className="text-gray-600 mb-6">
              We've received your early access request. Our team will review your application and get back to you within 48 hours.
            </p>
            <div className="bg-primary/10 rounded-lg p-4 mb-4">
              <p className="text-sm text-primary font-medium">
                What happens next?
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Email confirmation within 24 hours</li>
                <li>• Beta access invitation</li>
                <li>• Onboarding support</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = "/"} 
              className="w-full"
            >
              Back to Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-primary-light">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <DentConnectLogo width={300} height={75} className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Get Early Access to DentConnect
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Be among the first to experience the future of dental appointments. 
            Join our exclusive beta program and help shape the platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Benefits Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Beta Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Priority Access</h4>
                    <p className="text-sm text-gray-600">First access to new features and updates</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Free Premium Features</h4>
                    <p className="text-sm text-gray-600">Complete access during beta period</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Direct Support</h4>
                    <p className="text-sm text-gray-600">Dedicated support team assistance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-gray-600">Patients on Waitlist</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-600">Practices Interested</div>
              </Card>
            </div>
          </div>

          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Request Early Access</CardTitle>
              <CardDescription>
                Fill out the form below and we'll send you an invitation to join our beta program.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...form.register("name", { required: true })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email", { required: true })}
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <Label>I am a:</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="patient"
                        {...form.register("userType")}
                        className="text-primary"
                      />
                      <span>Patient</span>
                      <Badge variant="secondary">Most Popular</Badge>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="dentist"
                        {...form.register("userType")}
                        className="text-primary"
                      />
                      <span>Dental Professional</span>
                    </label>
                  </div>
                </div>

                {form.watch("userType") === "dentist" && (
                  <div>
                    <Label htmlFor="organization">Practice/Organization</Label>
                    <Input
                      id="organization"
                      {...form.register("organization")}
                      placeholder="Enter your practice name"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Additional Comments (Optional)</Label>
                  <Textarea
                    id="message"
                    {...form.register("message")}
                    placeholder="Tell us about your specific needs or questions..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Request Early Access"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy.
                  We'll only contact you about DentConnect updates.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}