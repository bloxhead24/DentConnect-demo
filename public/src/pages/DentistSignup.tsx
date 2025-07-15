import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DentConnectLogo from "@/components/DentConnectLogo";
import { DemoCompleteModal } from "@/components/DemoCompleteModal";
import { CheckCircle, Shield, AlertCircle, FileText, UserCheck, Calendar } from "lucide-react";

interface DentistSignupData {
  // Personal Information
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Professional Credentials
  gdcNumber: string;
  qualifications: string;
  specializations: string[];
  yearsExperience: number;
  
  // Practice Information
  practiceName: string;
  practiceAddress: string;
  practiceType: string;
  servicesOffered: string[];
  
  // Verification Documents
  gdcCertificate: File | null;
  qualificationCertificates: File | null;
  insuranceCertificate: File | null;
  
  // Terms and Compliance
  agreedToTerms: boolean;
  agreedToGDCGuidelines: boolean;
  agreedToDataSharing: boolean;
}

export default function DentistSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "failed" | null>(null);
  const [showDemoComplete, setShowDemoComplete] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<DentistSignupData>({
    defaultValues: {
      specializations: [],
      servicesOffered: [],
      agreedToTerms: false,
      agreedToGDCGuidelines: false,
      agreedToDataSharing: false,
    },
  });

  const verifyGDCMutation = useMutation({
    mutationFn: async (gdcNumber: string) => {
      return await apiRequest("/api/verify-gdc", {
        method: "POST",
        body: JSON.stringify({ gdcNumber }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data) => {
      if (data.verified) {
        setVerificationStatus("verified");
        toast({
          title: "GDC Number Verified",
          description: "Your professional credentials have been confirmed.",
        });
      } else {
        setVerificationStatus("failed");
        toast({
          title: "Verification Failed",
          description: "Unable to verify GDC number. Please check and try again.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setVerificationStatus("failed");
      toast({
        title: "Verification Error",
        description: "Unable to verify credentials at this time.",
        variant: "destructive",
      });
    },
  });

  const handleDemoSubmission = () => {
    // Instead of submitting the form, complete the demo
    toast({
      title: "Demo Complete!",
      description: "Ready to join as a dentist? Sign up for early access.",
    });
    setCurrentStep(5);
    // Show demo complete modal after 2 seconds
    setTimeout(() => {
      setShowDemoComplete(true);
    }, 2000);
  };

  const specializations = [
    "General Dentistry",
    "Orthodontics",
    "Oral Surgery",
    "Endodontics",
    "Periodontics",
    "Prosthodontics",
    "Pediatric Dentistry",
    "Oral Medicine",
    "Restorative Dentistry",
    "Cosmetic Dentistry",
  ];

  const services = [
    "Emergency Appointments",
    "Same-Day Appointments",
    "Routine Check-ups",
    "Dental Cleaning",
    "Fillings",
    "Root Canal Treatment",
    "Tooth Extraction",
    "Crowns and Bridges",
    "Dental Implants",
    "Teeth Whitening",
    "Orthodontic Treatment",
    "Oral Surgery",
  ];

  const verifyGDC = () => {
    const gdcNumber = form.getValues("gdcNumber");
    if (gdcNumber && gdcNumber.length >= 6) {
      setVerificationStatus("pending");
      verifyGDCMutation.mutate(gdcNumber);
    } else {
      toast({
        title: "Invalid GDC Number",
        description: "Please enter a valid GDC number (minimum 6 characters).",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: DentistSignupData) => {
    if (verificationStatus !== "verified") {
      toast({
        title: "Verification Required",
        description: "Please verify your GDC number before submitting.",
        variant: "destructive",
      });
      return;
    }
    handleDemoSubmission();
  };

  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-primary-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to join DentConnect. Our verification team will review your credentials and get back to you soon.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                What happens next?
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Credential verification (1-2 days)</li>
                <li>• GDC status confirmation</li>
                <li>• Practice verification call</li>
                <li>• Dashboard access setup</li>
              </ul>
            </div>
            <div className="space-y-4">
              <Button onClick={() => window.open('https://dentconnect.replit.app/', '_blank')} className="w-full bg-primary">
                <i className="fas fa-external-link-alt mr-2"></i>
                Sign Up for Early Access
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/"} 
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
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
            Join DentConnect as a Dental Professional
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with patients looking for last-minute appointments and grow your practice.
          </p>
          
          {/* Demo Skip Feature */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl max-w-md mx-auto animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <i className="fas fa-user-md text-blue-600 text-lg"></i>
              <span className="font-bold text-blue-800">Dr Richard - Demo Account</span>
            </div>
            <p className="text-sm text-blue-700 mb-4 leading-relaxed">
              Access the demo account for Dr Richard, a practicing dentist with real patient data, 
              appointment bookings, and revenue analytics to explore the full platform experience.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/dentist-dashboard"}
              className="w-full bg-blue-600 text-white border-blue-600 hover:bg-blue-700 transition-all duration-300"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Login as Dr Richard
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`h-1 w-20 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Credentials</span>
            <span>Practice Details</span>
            <span>Verification</span>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Professional Credentials"}
              {currentStep === 3 && "Practice Information"}
              {currentStep === 4 && "Document Upload & Verification"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with your basic information"}
              {currentStep === 2 && "Please provide your professional qualifications and GDC details"}
              {currentStep === 3 && "Tell us about your practice"}
              {currentStep === 4 && "Upload required documents and complete verification"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Select onValueChange={(value) => form.setValue("title", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr">Dr</SelectItem>
                          <SelectItem value="Prof">Prof</SelectItem>
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                          <SelectItem value="Mrs">Mrs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...form.register("firstName", { required: true })}
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName", { required: true })}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email", { required: true })}
                      placeholder="Enter professional email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...form.register("phone", { required: true })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Professional Credentials */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gdcNumber">GDC Registration Number</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="gdcNumber"
                        {...form.register("gdcNumber", { required: true })}
                        placeholder="Enter GDC number"
                        className={
                          verificationStatus === "verified" ? "border-green-500" :
                          verificationStatus === "failed" ? "border-red-500" : ""
                        }
                      />
                      <Button
                        type="button"
                        onClick={verifyGDC}
                        disabled={verifyGDCMutation.isPending}
                        variant="outline"
                      >
                        {verifyGDCMutation.isPending ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                    {verificationStatus === "verified" && (
                      <div className="flex items-center space-x-2 mt-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">GDC number verified</span>
                      </div>
                    )}
                    {verificationStatus === "failed" && (
                      <div className="flex items-center space-x-2 mt-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Verification failed - please check number</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Textarea
                      id="qualifications"
                      {...form.register("qualifications", { required: true })}
                      placeholder="e.g., BDS (London), MSc Oral Surgery, MFDS RCS"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Specializations</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {specializations.map((spec) => (
                        <label key={spec} className="flex items-center space-x-2">
                          <Checkbox
                            checked={form.watch("specializations").includes(spec)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("specializations");
                              if (checked) {
                                form.setValue("specializations", [...current, spec]);
                              } else {
                                form.setValue("specializations", current.filter(s => s !== spec));
                              }
                            }}
                          />
                          <span className="text-sm">{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      {...form.register("yearsExperience", { required: true, min: 0 })}
                      placeholder="Enter years of experience"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Practice Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="practiceName">Practice Name</Label>
                    <Input
                      id="practiceName"
                      {...form.register("practiceName", { required: true })}
                      placeholder="Enter practice name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="practiceAddress">Practice Address</Label>
                    <Textarea
                      id="practiceAddress"
                      {...form.register("practiceAddress", { required: true })}
                      placeholder="Enter complete practice address"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="practiceType">Practice Type</Label>
                    <Select onValueChange={(value) => form.setValue("practiceType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select practice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nhs">NHS Practice</SelectItem>
                        <SelectItem value="private">Private Practice</SelectItem>
                        <SelectItem value="mixed">Mixed NHS & Private</SelectItem>
                        <SelectItem value="specialist">Specialist Practice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Services Offered</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                      {services.map((service) => (
                        <label key={service} className="flex items-center space-x-2">
                          <Checkbox
                            checked={form.watch("servicesOffered").includes(service)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("servicesOffered");
                              if (checked) {
                                form.setValue("servicesOffered", [...current, service]);
                              } else {
                                form.setValue("servicesOffered", current.filter(s => s !== service));
                              }
                            }}
                          />
                          <span className="text-sm">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Document Upload & Verification */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-blue-900">Document Verification Required</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Please upload the following documents to complete your verification. All documents must be current and clearly readable.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gdcCertificate">GDC Registration Certificate</Label>
                      <Input
                        id="gdcCertificate"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => form.setValue("gdcCertificate", e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload current GDC certificate (PDF, JPG, PNG)</p>
                    </div>

                    <div>
                      <Label htmlFor="qualificationCertificates">Qualification Certificates</Label>
                      <Input
                        id="qualificationCertificates"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => form.setValue("qualificationCertificates", e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload primary dental qualification certificate</p>
                    </div>

                    <div>
                      <Label htmlFor="insuranceCertificate">Professional Indemnity Insurance</Label>
                      <Input
                        id="insuranceCertificate"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => form.setValue("insuranceCertificate", e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload current professional indemnity insurance certificate</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <label className="flex items-start space-x-3">
                      <Checkbox
                        checked={form.watch("agreedToTerms")}
                        onCheckedChange={(checked) => form.setValue("agreedToTerms", !!checked)}
                      />
                      <span className="text-sm">
                        I agree to the DentConnect Terms of Service and Privacy Policy
                      </span>
                    </label>

                    <label className="flex items-start space-x-3">
                      <Checkbox
                        checked={form.watch("agreedToGDCGuidelines")}
                        onCheckedChange={(checked) => form.setValue("agreedToGDCGuidelines", !!checked)}
                      />
                      <span className="text-sm">
                        I confirm I will adhere to GDC professional guidelines and standards
                      </span>
                    </label>

                    <label className="flex items-start space-x-3">
                      <Checkbox
                        checked={form.watch("agreedToDataSharing")}
                        onCheckedChange={(checked) => form.setValue("agreedToDataSharing", !!checked)}
                      />
                      <span className="text-sm">
                        I consent to secure data sharing for appointment booking and patient communication
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      verificationStatus !== "verified" ||
                      !form.watch("agreedToTerms") ||
                      !form.watch("agreedToGDCGuidelines") ||
                      !form.watch("agreedToDataSharing")
                    }
                  >
                    Complete Demo
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <DemoCompleteModal 
        isOpen={showDemoComplete}
        onClose={() => setShowDemoComplete(false)}
        demoType="dentist"
      />
    </div>
  );
}