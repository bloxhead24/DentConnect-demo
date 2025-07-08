import { useState } from "react";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TreatmentSelection from "./TreatmentSelection";
import AccessibilityForm from "./AccessibilityForm";
import MapView from "./MapView";
import DentConnectLogo from "@/components/DentConnectLogo";
import { Stethoscope, Users, MapPin, Clock, Shield, Star } from "lucide-react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<"treatment" | "accessibility" | "map">("treatment");
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(null);
  const [selectedAccessibility, setSelectedAccessibility] = useState<AccessibilityNeed[]>([]);

  const handleTreatmentSelect = (treatment: TreatmentType) => {
    setSelectedTreatment(treatment);
    setCurrentStep("accessibility");
  };

  const handleAccessibilityComplete = (needs: AccessibilityNeed[]) => {
    setSelectedAccessibility(needs);
    setCurrentStep("map");
  };

  const handleBack = () => {
    if (currentStep === "accessibility") {
      setCurrentStep("treatment");
      setSelectedTreatment(null);
    } else if (currentStep === "map") {
      setCurrentStep("accessibility");
    }
  };

  // Show landing page when no treatment is selected
  if (currentStep === "treatment" && !selectedTreatment) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
        {/* Header */}
        <div className="bg-white shadow-soft">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <DentConnectLogo width={200} height={40} className="drop-shadow-sm" />
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/dentist-signup"}
                className="hidden sm:flex"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                For Dentists
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/dentist-dashboard"}
                className="hidden sm:flex text-primary"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              🚀 Beta Launch - Early Access Available
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Last-Minute 
              <span className="text-primary"> Dental Appointments</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect with dental practices that have last-minute cancellations. Book same-day appointments 
              and get the dental care you need, when you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setCurrentStep("treatment")}
                className="px-8 py-6 text-lg"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Find Appointments Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = "/early-access"}
                className="px-8 py-6 text-lg"
              >
                Get Early Access
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Same-Day Booking</CardTitle>
                <CardDescription>
                  Book appointments within hours, not weeks. Perfect for urgent dental needs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Verified Practices</CardTitle>
                <CardDescription>
                  All dental practices are GDC-verified with full credentials and insurance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Quality Care</CardTitle>
                <CardDescription>
                  Read reviews and choose from highly-rated dental professionals in your area.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Trusted by Patients & Dentists
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-gray-600">Appointments Booked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-gray-600">Dental Practices</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">2 hours</div>
                <div className="text-gray-600">Average Booking Time</div>
              </div>
            </div>
          </div>

          {/* Dentist CTA Section */}
          <Card className="bg-primary text-white">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Are you a dental professional?</h3>
                  <p className="text-primary-foreground/80 mb-6">
                    Join DentConnect to fill your last-minute cancellations and grow your practice. 
                    Connect with patients who need urgent dental care.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={() => window.location.href = "/dentist-signup"}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Join as Dentist
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => window.location.href = "/dentist-dashboard"}
                      className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
                    >
                      View Dashboard Demo
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-semibold mb-4">Benefits for Dentists</h4>
                    <ul className="text-sm space-y-2 text-left">
                      <li>• Reduce lost revenue from cancellations</li>
                      <li>• Fill slots with verified patients</li>
                      <li>• Manage availability in real-time</li>
                      <li>• Professional dashboard and analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <DentConnectLogo width={200} height={40} className="drop-shadow-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/dentist-signup"}
              className="hidden sm:flex"
            >
              For Dentists
            </Button>
            <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
              <i className="fas fa-bell text-text-soft"></i>
            </button>
            <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
              <i className="fas fa-user text-text-soft"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {currentStep === "treatment" && (
          <TreatmentSelection 
            onTreatmentSelect={handleTreatmentSelect}
            selectedTreatment={selectedTreatment}
          />
        )}
        
        {currentStep === "accessibility" && (
          <AccessibilityForm 
            onComplete={handleAccessibilityComplete}
            onBack={handleBack}
            selectedNeeds={selectedAccessibility}
          />
        )}
        
        {currentStep === "map" && (
          <MapView 
            selectedTreatment={selectedTreatment}
            selectedAccessibility={selectedAccessibility}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
