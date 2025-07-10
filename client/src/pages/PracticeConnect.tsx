import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError("");

    // Simulate practice tag verification and immediate connection
    setTimeout(() => {
      const validTags = ["NDC2024", "SMILE123", "DENTAL456", "DEMO", "TEST"];
      
      if (validTags.includes(practiceTag.toUpperCase())) {
        // Store the authenticated practice tag for immediate diary access
        sessionStorage.setItem('authenticatedPracticeTag', practiceTag.toUpperCase());
        sessionStorage.setItem('searchMode', searchMode);
        onConnect(practiceTag);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Button>
          <h1 className="text-xl font-bold text-center">Connect to Practice</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Search Mode Display */}
        <div className="text-center">
          <Badge className={cn(
            "text-lg px-6 py-3 mb-4",
            searchMode === "mydentist" 
              ? "bg-teal-600 text-white" 
              : "bg-blue-600 text-white"
          )}>
            <i className={cn(
              "mr-3 text-xl",
              searchMode === "mydentist" ? "fas fa-user-md" : "fas fa-building"
            )}></i>
            {searchMode === "mydentist" ? "My Dentist Search" : "My Practice Search"}
          </Badge>
          
          <p className="text-gray-600 text-sm">
            {searchMode === "mydentist" 
              ? "Connect with your personal dentist using your practice tag"
              : "Access your familiar practice appointments with your practice tag"
            }
          </p>
        </div>

        {/* Selected Treatment Display */}
        {selectedTreatment && (
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center`} 
                     style={{ backgroundColor: selectedTreatment.color + '20' }}>
                  <i className={`${selectedTreatment.icon} text-xl`} 
                     style={{ color: selectedTreatment.color }}></i>
                </div>
                <div>
                  <h3 className="font-medium">{selectedTreatment.name}</h3>
                  <p className="text-sm text-gray-600">{selectedTreatment.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Practice Tag Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                searchMode === "mydentist" ? "bg-teal-100" : "bg-blue-100"
              )}>
                <i className={cn(
                  "text-xl",
                  searchMode === "mydentist" ? "fas fa-id-card text-teal-600" : "fas fa-key text-blue-600"
                )}></i>
              </div>
              <div>
                <h3 className="text-lg font-bold">Practice Connection Tag</h3>
                <p className="text-sm text-gray-600 font-normal">
                  Enter your unique practice identifier
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice Tag
                </label>
                <Input
                  type="text"
                  value={practiceTag}
                  onChange={(e) => setPracticeTag(e.target.value.toUpperCase())}
                  placeholder="e.g., NDC2024, SMILE123"
                  className="text-center text-lg tracking-wider font-mono"
                  maxLength={10}
                  disabled={isConnecting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This tag was provided by your dental practice
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={!practiceTag || isConnecting}
                className={cn(
                  "w-full py-3 text-lg font-semibold",
                  searchMode === "mydentist" 
                    ? "bg-teal-600 hover:bg-teal-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isConnecting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    Connecting to {searchMode === "mydentist" ? "Your Dentist" : "Practice"}...
                  </>
                ) : (
                  <>
                    <i className="fas fa-link mr-3"></i>
                    Connect to {searchMode === "mydentist" ? "My Dentist" : "My Practice"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Access */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">For demo purposes</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleDemoConnect}
          className="w-full py-3 border-dashed"
          disabled={isConnecting}
        >
          <i className="fas fa-fast-forward mr-3"></i>
          Skip Authentication (Demo Mode)
        </Button>

        {/* Help Information */}
        <Card className={cn(
          "border-2",
          searchMode === "mydentist" ? "border-teal-200 bg-teal-50" : "border-blue-200 bg-blue-50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <i className={cn(
                "fas fa-info-circle mt-0.5",
                searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
              )}></i>
              <div className="text-sm">
                <p className={cn(
                  "font-medium mb-2",
                  searchMode === "mydentist" ? "text-teal-900" : "text-blue-900"
                )}>
                  {searchMode === "mydentist" ? "Personal Dentist Connection" : "Practice Connection"}
                </p>
                <ul className={cn(
                  "space-y-1 text-sm",
                  searchMode === "mydentist" ? "text-teal-700" : "text-blue-700"
                )}>
                  <li>• Your practice tag was provided during registration</li>
                  <li>• Contact reception if you've lost your tag</li>
                  <li>• This ensures secure access to your appointments</li>
                  {searchMode === "mydentist" && (
                    <li>• Links you directly to your personal dentist</li>
                  )}
                </ul>
                <p className={cn(
                  "mt-2 text-xs",
                  searchMode === "mydentist" ? "text-teal-600" : "text-blue-600"
                )}>
                  Demo tags: DEMO, NDC2024, SMILE123, DENTAL456, TEST
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}