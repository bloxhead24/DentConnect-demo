import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-8 rounded-3xl max-w-sm mx-4 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-check text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-text-primary">Appointment Confirmed!</h3>
          <p className="text-text-soft">Your appointment has been successfully booked. We'll send you a reminder.</p>
          
          <img 
            src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
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
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
