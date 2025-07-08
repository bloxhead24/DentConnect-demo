import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DemoCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoType: "patient" | "dentist";
}

export function DemoCompleteModal({ isOpen, onClose, demoType }: DemoCompleteModalProps) {
  const handleEarlyAccess = () => {
    window.open("https://dentconnect.replit.app/", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-8 rounded-3xl max-w-md mx-4 text-center">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-500">
            <i className="fas fa-star text-white text-xl"></i>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Demo Complete!
            </h3>
            <p className="text-gray-600">
              You've experienced the {demoType === "patient" ? "patient booking" : "dentist dashboard"} flow. 
              Ready to join the revolution in dental care?
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-award text-white text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  🏆 Nominated for Innovation Award
                </p>
                <p className="text-xs text-blue-600">
                  Royal College of Surgeons - National Contribution to Dentistry 2024
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleEarlyAccess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Sign Up for Early Access
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Continue Demo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}