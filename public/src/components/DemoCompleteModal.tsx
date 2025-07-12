import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DemoCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoType: "patient" | "dentist";
}

export function DemoCompleteModal({ isOpen, onClose, demoType }: DemoCompleteModalProps) {
  const handleEarlyAccess = () => {
    window.open('https://dentconnect.replit.app/', '_blank');
    onClose();
  };

  const handleContinueDemo = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-check text-2xl text-green-600"></i>
            </div>
            
            <div>
              <DialogTitle className="text-2xl font-bold text-green-600 mb-2">
                Demo Complete!
              </DialogTitle>
              <p className="text-gray-600">
                You've experienced the full {demoType === "patient" ? "patient booking" : "dentist dashboard"} journey
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Demo Summary */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">What You've Experienced:</h4>
              <div className="space-y-2 text-sm">
                {demoType === "patient" ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Treatment type selection with urgency levels</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Accessibility needs assessment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Budget preference selection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Smart search mode options</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Practice authentication system</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Appointment booking with real-time availability</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Professional practice registration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>GDC verification process</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Dashboard with appointment management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check text-green-600"></i>
                      <span>Revenue tracking and analytics</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Early Access CTA */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="p-6 text-center">
              <Badge className="bg-blue-600 text-white mb-3">
                🚀 Limited Early Access
              </Badge>
              
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Ready to Transform Dental Care?
              </h3>
              
              <p className="text-blue-800 mb-4 text-sm">
                Join hundreds of dental practices and thousands of patients already experiencing 
                the future of dental appointment booking.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleEarlyAccess}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Get Early Access Now
                </Button>
                
                <div className="text-xs text-blue-700">
                  • No commitment required • Free during beta
                  <br />
                  • Priority onboarding • Direct feedback to our team
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Continue Demo Option */}
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={handleContinueDemo}
              className="text-gray-600 hover:text-gray-800"
            >
              Continue Exploring Demo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}