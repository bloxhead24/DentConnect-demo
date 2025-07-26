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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-6 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="hover:bg-blue-50 transition-all duration-300 rounded-xl px-4 py-2"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Practice Connection
            </h1>
            <p className="text-sm text-gray-600">Secure access to your dental appointments</p>
          </div>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative">
            <div className={cn(
              "w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center relative shadow-2xl",
              searchMode === "mydentist" 
                ? "bg-gradient-to-br from-teal-500 via-teal-600 to-green-600" 
                : "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
            )}>
              {/* Animated Ring */}
              <div className={cn(
                "absolute inset-0 rounded-full animate-spin",
                searchMode === "mydentist" 
                  ? "border-4 border-transparent border-t-teal-300/50" 
                  : "border-4 border-transparent border-t-blue-300/50"
              )}></div>
              
              {searchMode === "mydentist" ? (
                <UserCheck className="w-16 h-16 text-white drop-shadow-lg" />
              ) : (
                <Building className="w-16 h-16 text-white drop-shadow-lg" />
              )}
            </div>
          </div>
          
          <Badge className={cn(
            "text-lg px-10 py-4 mb-6 rounded-full shadow-lg border-2 border-white/50 backdrop-blur-sm font-semibold",
            searchMode === "mydentist" 
              ? "bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          )}>
            {searchMode === "mydentist" ? "My Dentist Search" : "My Practice Search"}
          </Badge>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {searchMode === "mydentist" 
              ? "Connect to Your Personal Dentist"
              : "Connect to Your Dental Practice"
            }
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {searchMode === "mydentist" 
              ? "Access your personal dentist's appointment diary with your secure practice connection tag. Maintain continuity of care with your trusted dental professional."
              : "Access your practice's appointment system using your secure connection tag. View available appointments with any dentist at your registered practice."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Connection Form */}
          <div className="space-y-8">
            {/* Selected Treatment Display */}
            {selectedTreatment && (
              <Card className="bg-white/80 backdrop-blur-md border-2 border-blue-200/50 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 px-6 py-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Selected Treatment</CardTitle>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative`} 
                         style={{ backgroundColor: selectedTreatment.color + '20' }}>
                      {/* Dental treatment specific icons */}
                      {selectedTreatment.name.toLowerCase().includes('cleaning') && (
                        <i className="fas fa-broom text-2xl text-blue-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('filling') && (
                        <i className="fas fa-fill-drip text-2xl text-gray-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('crown') && (
                        <i className="fas fa-crown text-2xl text-yellow-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('root canal') && (
                        <i className="fas fa-drill text-2xl text-orange-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('extraction') && (
                        <i className="fas fa-procedures text-2xl text-red-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('whitening') && (
                        <i className="fas fa-star text-2xl text-blue-400"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('braces') && (
                        <i className="fas fa-grip-horizontal text-2xl text-indigo-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('implant') && (
                        <i className="fas fa-hammer text-2xl text-gray-700"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('bridge') && (
                        <i className="fas fa-bridge text-2xl text-cyan-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('denture') && (
                        <i className="fas fa-teeth-open text-2xl text-pink-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('checkup') && (
                        <i className="fas fa-search text-2xl text-green-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('x-ray') && (
                        <i className="fas fa-x-ray text-2xl text-purple-600"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('veneer') && (
                        <i className="fas fa-layer-group text-2xl text-blue-500"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('gum') && (
                        <i className="fas fa-seedling text-2xl text-green-500"></i>
                      )}
                      {selectedTreatment.name.toLowerCase().includes('emergency') && (
                        <i className="fas fa-plus-circle text-2xl text-red-500"></i>
                      )}
                      
                      {/* Fallback to category icons if no specific treatment match */}
                      {!['cleaning', 'filling', 'crown', 'root canal', 'extraction', 'whitening', 'braces', 'implant', 'bridge', 'denture', 'checkup', 'x-ray', 'veneer', 'gum', 'emergency'].some(keyword => selectedTreatment.name.toLowerCase().includes(keyword)) && (
                        <>
                          {selectedTreatment.category === 'emergency' && (
                            <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                          )}
                          {selectedTreatment.category === 'urgent' && (
                            <i className="fas fa-clock text-2xl text-orange-600"></i>
                          )}
                          {selectedTreatment.category === 'routine' && (
                            <i className="fas fa-tooth text-2xl text-blue-600"></i>
                          )}
                          {selectedTreatment.category === 'cosmetic' && (
                            <i className="fas fa-smile text-2xl text-purple-600"></i>
                          )}
                          {!['emergency', 'urgent', 'routine', 'cosmetic'].includes(selectedTreatment.category) && (
                            <i className="fas fa-tooth text-2xl text-blue-600"></i>
                          )}
                        </>
                      )}
                      
                      {/* Animated pulse ring for urgent/emergency treatments */}
                      {(selectedTreatment.category === 'emergency' || selectedTreatment.category === 'urgent') && (
                        <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{selectedTreatment.name}</h3>
                      <p className="text-gray-600 capitalize mb-2">{selectedTreatment.category} treatment</p>
                      
                      {/* Treatment category badge */}
                      <div className="flex items-center space-x-2">
                        {selectedTreatment.category === 'emergency' && (
                          <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">URGENT CARE</span>
                        )}
                        {selectedTreatment.category === 'urgent' && (
                          <span className="px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700 rounded-full">PRIORITY</span>
                        )}
                        {selectedTreatment.category === 'routine' && (
                          <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">ROUTINE</span>
                        )}
                        {selectedTreatment.category === 'cosmetic' && (
                          <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-purple-700 rounded-full">COSMETIC</span>
                        )}
                        {selectedTreatment.category === 'preventive' && (
                          <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">PREVENTIVE</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Practice Tag Entry */}
            <Card className="bg-white/80 backdrop-blur-md border-2 border-gray-200/50 shadow-2xl rounded-3xl overflow-hidden">
              <div className={cn(
                "bg-gradient-to-r px-8 py-8 text-center",
                searchMode === "mydentist" 
                  ? "from-teal-500/10 via-teal-400/5 to-green-500/10" 
                  : "from-blue-500/10 via-blue-400/5 to-indigo-500/10"
              )}>
                <div className="flex justify-center mb-6">
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center shadow-xl",
                    searchMode === "mydentist" 
                      ? "bg-gradient-to-br from-teal-500 to-green-500" 
                      : "bg-gradient-to-br from-blue-500 to-indigo-500"
                  )}>
                    {searchMode === "mydentist" ? (
                      <IdCard className="w-10 h-10 text-white" />
                    ) : (
                      <Key className="w-10 h-10 text-white" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {searchMode === "mydentist" ? "Personal Connection" : "Practice Connection"}
                </CardTitle>
                <p className="text-gray-600 text-lg">
                  Enter your secure identifier to access appointments
                </p>
              </div>
              
              <CardContent className="p-8 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-lg font-bold text-gray-800 mb-4 text-center">
                      Connection Tag
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={practiceTag}
                        onChange={(e) => setPracticeTag(e.target.value.toUpperCase())}
                        placeholder="Enter your practice tag"
                        className={cn(
                          "text-center text-2xl tracking-wider font-mono h-16 text-gray-900 font-bold border-3 rounded-2xl shadow-inner transition-all duration-300",
                          searchMode === "mydentist" 
                            ? "border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-200" 
                            : "border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                        )}
                        maxLength={10}
                        disabled={isConnecting}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transform scale-x-0 transition-transform duration-300 peer-focus:scale-x-100"></div>
                    </div>
                    <p className="text-gray-500 mt-3 text-center font-medium">
                      Example: <span className="font-mono text-gray-700">DEMO</span>, <span className="font-mono text-gray-700">NDC2024</span>, <span className="font-mono text-gray-700">SMILE123</span>
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-red-300 rounded-xl bg-red-50">
                      <i className="fas fa-exclamation-triangle text-red-500"></i>
                      <AlertDescription className="ml-2 font-medium">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={!practiceTag || isConnecting}
                    className={cn(
                      "w-full py-5 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-3xl",
                      searchMode === "mydentist" 
                        ? "bg-gradient-to-r from-teal-600 via-teal-600 to-green-600 hover:from-teal-700 hover:via-teal-700 hover:to-green-700 shadow-teal-500/25" 
                        : "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 shadow-blue-500/25"
                    )}
                  >
                    {isConnecting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-3"></i>
                        Connecting Securely...
                      </>
                    ) : (
                      <>
                        <Shield className="w-6 h-6 mr-3" />
                        Connect to {searchMode === "mydentist" ? "My Dentist" : "My Practice"}
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Access */}
                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-6 py-2 bg-white text-gray-500 font-semibold rounded-full border-2 border-gray-200">Demo Access</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleDemoConnect}
                  className="w-full py-4 text-lg font-semibold border-3 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 rounded-2xl"
                  disabled={isConnecting}
                >
                  <Zap className="w-5 h-5 mr-3" />
                  Try Demo Mode (Use tag: DEMO)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Information & Benefits */}
          <div className="space-y-8">
            {/* How It Works */}
            <Card className="bg-white/80 backdrop-blur-md border-2 border-gray-200/50 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 px-6 py-6">
                <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span>How It Works</span>
                </CardTitle>
              </div>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">Secure Connection</h4>
                      <p className="text-gray-600 leading-relaxed">Enter your practice-provided connection tag for secure access to your appointment system</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-lg font-bold text-white">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">Instant Access</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {searchMode === "mydentist" 
                          ? "View your personal dentist's available appointments with complete appointment history"
                          : "Browse all available dentists at your practice with real-time scheduling"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">Quick Booking</h4>
                      <p className="text-gray-600 leading-relaxed">Book your preferred appointment time with instant confirmation and calendar integration</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className={cn(
              "border-2 shadow-xl rounded-2xl overflow-hidden",
              searchMode === "mydentist" 
                ? "border-teal-200/50 bg-gradient-to-br from-teal-50 via-white to-green-50" 
                : "border-blue-200/50 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
            )}>
              <div className={cn(
                "bg-gradient-to-r px-6 py-6",
                searchMode === "mydentist" 
                  ? "from-teal-500/10 to-green-500/10" 
                  : "from-blue-500/10 to-indigo-500/10"
              )}>
                <CardTitle className={cn(
                  "flex items-center space-x-3 text-xl font-bold",
                  searchMode === "mydentist" ? "text-teal-900" : "text-blue-900"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    searchMode === "mydentist" ? "bg-teal-500" : "bg-blue-500"
                  )}>
                    <i className="fas fa-star text-white"></i>
                  </div>
                  <span>
                    {searchMode === "mydentist" ? "Personal Dentist Benefits" : "Practice Benefits"}
                  </span>
                </CardTitle>
              </div>
              <CardContent className="p-8">
                <div className="space-y-5">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className={cn(
                      "w-6 h-6 flex-shrink-0",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )} />
                    <span className="text-gray-700 font-medium text-lg">
                      {searchMode === "mydentist" 
                        ? "Continuity of care with your trusted dentist"
                        : "Access to your complete dental records"
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <CheckCircle className={cn(
                      "w-6 h-6 flex-shrink-0",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )} />
                    <span className="text-gray-700 font-medium text-lg">
                      {searchMode === "mydentist" 
                        ? "Personalized treatment approach"
                        : "Familiar practice environment"
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <CheckCircle className={cn(
                      "w-6 h-6 flex-shrink-0",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )} />
                    <span className="text-gray-700 font-medium text-lg">Priority booking access and flexible scheduling</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <CheckCircle className={cn(
                      "w-6 h-6 flex-shrink-0",
                      searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                    )} />
                    <span className="text-gray-700 font-medium text-lg">Secure, encrypted connection with GDPR compliance</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200/50 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-500/10 to-gray-400/10 px-6 py-6">
                <CardTitle className="flex items-center space-x-3 text-xl font-bold text-gray-900">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <span>Security & Privacy</span>
                </CardTitle>
              </div>
              <CardContent className="p-8">
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="font-medium">Your connection tag is encrypted and secure</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="font-medium">Only you can access your appointment data</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="font-medium">GDPR compliant data protection standards</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="font-medium">No personal information stored on external servers</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-blue-700 font-medium flex items-center">
                    <i className="fas fa-info-circle mr-3 text-blue-600"></i>
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