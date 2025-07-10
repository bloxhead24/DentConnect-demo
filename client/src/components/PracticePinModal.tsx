import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Practice } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PracticePinModalProps {
  practice: Practice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  searchMode: "practice" | "mydentist";
}

export function PracticePinModal({ practice, isOpen, onClose, onSuccess, searchMode }: PracticePinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    // Simulate PIN verification (in real app, this would call an API)
    setTimeout(() => {
      if (pin === "1234" || pin === "demo") { // Demo PINs
        onSuccess();
        setPin("");
        setError("");
      } else {
        setError("Invalid PIN. Please check with your practice or try 'demo' for the demo.");
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleSkipForDemo = () => {
    onSuccess();
    setPin("");
    setError("");
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  if (!practice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              searchMode === "mydentist" 
                ? "bg-teal-600" 
                : "bg-blue-600"
            )}>
              <i className={cn(
                "text-white text-lg",
                searchMode === "mydentist" ? "fas fa-user-md" : "fas fa-building"
              )}></i>
            </div>
            <div>
              <h3 className="text-xl font-bold">Practice Authentication</h3>
              <p className="text-sm text-gray-600 font-normal">
                {searchMode === "mydentist" ? "Access your dentist" : "Access practice appointments"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Practice Information */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h4 className="font-medium text-gray-900">{practice.name}</h4>
                <p className="text-sm text-gray-600">{practice.address}</p>
              </div>
            </div>
          </div>

          {/* Search Mode Badge */}
          <div className="text-center">
            <Badge className={cn(
              "text-sm px-4 py-2",
              searchMode === "mydentist" 
                ? "bg-teal-600 text-white" 
                : "bg-blue-600 text-white"
            )}>
              <i className={cn(
                "mr-2",
                searchMode === "mydentist" ? "fas fa-user-md" : "fas fa-building"
              )}></i>
              {searchMode === "mydentist" ? "My Dentist Search" : "My Practice Search"}
            </Badge>
          </div>

          {/* PIN Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice PIN
              </label>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your practice PIN"
                className="text-center text-lg tracking-widest"
                maxLength={6}
                disabled={isVerifying}
              />
              <p className="text-xs text-gray-500 mt-1">
                This PIN was provided by your dental practice
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={!pin || isVerifying}
                className={cn(
                  "w-full py-3 text-lg font-semibold",
                  searchMode === "mydentist" 
                    ? "bg-teal-600 hover:bg-teal-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isVerifying ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Verifying PIN...
                  </>
                ) : (
                  <>
                    <i className="fas fa-unlock mr-2"></i>
                    Access {searchMode === "mydentist" ? "My Dentist" : "Practice"} Appointments
                  </>
                )}
              </Button>

              {/* Demo Skip Button */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">For demo purposes</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleSkipForDemo}
                className="w-full py-3 border-dashed"
                disabled={isVerifying}
              >
                <i className="fas fa-fast-forward mr-2"></i>
                Skip PIN (Demo Mode)
              </Button>
            </div>
          </form>

          {/* Help Text */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Need your practice PIN?</p>
                <p className="text-blue-700">
                  Contact your dental practice reception or check your patient portal. 
                  For this demo, you can use PIN "demo" or "1234".
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full"
            disabled={isVerifying}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}