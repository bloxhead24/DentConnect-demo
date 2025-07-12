import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DemoCompleteModal } from "./DemoCompleteModal";
import { useState, useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  const [showDemoComplete, setShowDemoComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Show demo complete modal after 3 seconds of success modal being open
      const timer = setTimeout(() => {
        setShowDemoComplete(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowDemoComplete(false);
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-8 rounded-3xl max-w-sm mx-4 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-check text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Appointment Confirmed!</h3>
          <p className="text-gray-600">Your appointment has been successfully booked. We'll send you a reminder.</p>
          
          <img 
src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%2338BDF8'/%3E%3Ctext x='200' y='100' text-anchor='middle' dy='.3em' fill='white' font-size='24' font-family='Arial'%3E🦷 Success%3C/text%3E%3C/svg%3E" 
            alt="Dentist with patient" 
            className="w-full h-32 object-cover rounded-2xl shadow-soft"
          />
          
          {/* Early Access CTA */}
          <div className="bg-primary/10 rounded-xl p-4 text-left">
            <h4 className="font-bold text-primary mb-2">Love the experience?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Sign up for early access to be the first to use DentConnect when we launch!
            </p>
            <Button 
              onClick={() => window.location.href = "/early-access"} 
              className="w-full mb-2 bg-primary text-sm"
              size="sm"
            >
              Get Early Access
            </Button>
          </div>
          
          <Button 
            className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200" 
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <DemoCompleteModal 
      isOpen={showDemoComplete}
      onClose={() => setShowDemoComplete(false)}
      demoType="patient"
    />
    </>
  );
}
