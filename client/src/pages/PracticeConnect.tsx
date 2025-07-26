import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { TreatmentType, AccessibilityNeed } from "../lib/types";
import { cn } from "../lib/utils";
import { EarlyAccessPopup } from "../components/EarlyAccessPopup";
import { Building, UserCheck, Shield, Clock, CheckCircle, Zap, Key, IdCard } from "lucide-react";

interface PracticeConnectProps {
  selectedTreatment: TreatmentType | null;
  selectedAccessibility: AccessibilityNeed[];
  searchMode: "practice" | "mydentist";
  onBack: () => void;
  onConnect: (practiceTag: string) => void;
}

export default function PracticeConnect({ 
  selectedTreatment, 
  selectedAccessibility, 
  searchMode, 
  onBack, 
  onConnect 
}: PracticeConnectProps) {
  const [practiceTag, setPracticeTag] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError("");

    // Simulate practice tag verification and immediate connection
    setTimeout(() => {
      const validTags = ["NDC2024", "SMILE123", "DENTAL456", "DEMO", "TEST", "DRRICHARD"];
      
      if (validTags.includes(practiceTag.toUpperCase())) {
        // Store the authenticated practice tag for immediate diary access
        sessionStorage.setItem('authenticatedPracticeTag', practiceTag.toUpperCase());
        sessionStorage.setItem('searchMode', searchMode);
        onConnect(practiceTag);
        // Show early access popup after successful connection
        setTimeout(() => setShowEarlyAccess(true), 1500);
      } else {
        setError("Practice tag not recognized. Please check with your practice or try 'DEMO' for the demo.");
      }
      setIsConnecting(false);
    }, 1500);
  };

  const handleDemoConnect = () => {
    setPracticeTag("DEMO");
    sessionStorage.setItem('authenticatedPracticeTag', 'DEMO');
    sessionStorage.setItem('searchMode', searchMode);
    onConnect("DEMO");
    // Show early access popup after demo connection
    setTimeout(() => setShowEarlyAccess(true), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-6 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-blue-50">
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Practice Connection</h1>
            <p className="text-sm text-gray-600">Secure access to your dental appointments</p>
          </div>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className={cn(
            "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
            searchMode === "mydentist" 
              ? "bg-gradient-to-br from-teal-500 to-green-500" 
              : "bg-gradient-to-br from-blue-500 to-indigo-500"
          )}>
            {searchMode === "mydentist" ? (
              <UserCheck className="w-12 h-12 text-white" />
            ) : (
              <Building className="w-12 h-12 text-white" />
            )}
          </div>
          
          <Badge className={cn(
            "text-lg px-8 py-3 mb-4 rounded-full",
            searchMode === "mydentist" 
              ? "bg-teal-600 hover:bg-teal-700" 
              : "bg-blue-600 hover:bg-blue-700"
          )}>
            {searchMode === "mydentist" ? "My Dentist Search" : "My Practice Search"}
          </Badge>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {searchMode === "mydentist" 
              ? "Connect to Your Personal Dentist"
              : "Connect to Your Dental Practice"
            }
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {searchMode === "mydentist" 
              ? "Access your personal dentist's appointment diary with your secure practice connection tag. Maintain continuity of care with your trusted dental professional."
              : "Access your practice's appointment system using your secure connection tag. View available appointments with any dentist at your registered practice."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Connection Form */}
          <div className="space-y-6">
            {/* Selected Treatment Display */}
            {selectedTreatment && (
              <Card className="bg-white/70 backdrop-blur-sm border-2 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Selected Treatment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center`} 
                         style={{ backgroundColor: selectedTreatment.color + '20' }}>
                      <i className={`${selectedTreatment.icon} text-xl`} 
                         style={{ color: selectedTreatment.color }}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedTreatment.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{selectedTreatment.category} treatment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Practice Tag Entry */}
            <Card className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  {searchMode === "mydentist" ? (
                    <IdCard className="w-12 h-12 text-teal-600" />
                  ) : (
                    <Key className="w-12 h-12 text-blue-600" />
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {searchMode === "mydentist" ? "Personal Connection Tag" : "Practice Connection Tag"}
                </CardTitle>
                <p className="text-gray-600">
                  Enter your secure identifier to access appointments
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Connection Tag
                    </label>
                    <Input
                      type="text"
                      value={practiceTag}
                      onChange={(e) => setPracticeTag(e.target.value.toUpperCase())}
                      placeholder="Enter your practice tag"
                      className="text-center text-xl tracking-wider font-mono h-14 text-gray-900 font-bold border-2"
                      maxLength={10}
                      disabled={isConnecting}
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Example: DEMO, NDC2024, SMILE123
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-red-300">
                      <i className="fas fa-exclamation-triangle"></i>
                      <AlertDescription className="ml-2">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={!practiceTag || isConnecting}
                    className={cn(
                      "w-full py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300",
                      searchMode === "mydentist" 
                        ? "bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700" 
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    )}
                  >
                    {isConnecting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-3"></i>
                        Connecting Securely...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-3" />
                        Connect to {searchMode === "mydentist" ? "My Dentist" : "My Practice"}
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Access */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Demo Access</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleDemoConnect}
                  className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                  disabled={isConnecting}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Try Demo Mode (Use tag: DEMO)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Information & Benefits */}
          <div className="space-y-6">
            {/* How It Works */}
            <Card className="bg-white/70 backdrop-blur-sm border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span>How It Works</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Secure Connection</h4>
                      <p className="text-sm text-gray-600">Enter your practice-provided connection tag for secure access</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Instant Access</h4>
                      <p className="text-sm text-gray-600">
                        {searchMode === "mydentist" 
                          ? "View your personal dentist's available appointments"
                          : "Browse all available dentists at your practice"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Quick Booking</h4>
                      <p className="text-sm text-gray-600">Book your preferred appointment time with just a few clicks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className={cn(
              "border-2",
              searchMode === "mydentist" ? "border-teal-200 bg-gradient-to-br from-teal-50 to-green-50" : "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center space-x-3",
                  searchMode === "mydentist" ? "text-teal-900" : "text-blue-900"
                )}>
                  <i className={cn(
                    "fas fa-star",
                    searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                  )}></i>
                  <span>
                    {searchMode === "mydentist" ? "Personal Dentist Benefits" : "Practice Benefits"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={cn(
                      "w-5 h-5",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )} />
                    <span className="text-sm font-medium">
                      {searchMode === "mydentist" 
                        ? "Continuity of care with your trusted dentist"
                        : "Access to your complete dental records"
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={cn(
                      "w-5 h-5",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )} />
                    <span className="text-sm font-medium">
                      {searchMode === "mydentist" 
                        ? "Personalized treatment approach"
                        : "Familiar practice environment"
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={cn(
                      "w-5 h-5",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )} />
                    <span className="text-sm font-medium">Priority booking access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={cn(
                      "w-5 h-5",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )} />
                    <span className="text-sm font-medium">Secure, encrypted connection</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-gray-50 border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <Shield className="w-6 h-6 text-gray-600" />
                  <span>Security & Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Your connection tag is encrypted and secure</p>
                  <p>• Only you can access your appointment data</p>
                  <p>• GDPR compliant data protection</p>
                  <p>• No personal information stored on external servers</p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">
                    <i className="fas fa-info-circle mr-2"></i>
                    Lost your tag? Contact your practice reception for a secure replacement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Early Access Popup */}
      <EarlyAccessPopup 
        isOpen={showEarlyAccess}
        onClose={() => setShowEarlyAccess(false)}
        trigger="practice-connected"
        title="Practice Connected! 🏥"
        description="You're connected to your practice. Get early access to book real appointments."
      />
    </div>
  );
}