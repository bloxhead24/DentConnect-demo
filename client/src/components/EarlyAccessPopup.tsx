import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EarlyAccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "questionnaire" | "search-complete" | "preferences-complete" | "mode-selected" | "practice-connected";
  title?: string;
  description?: string;
}

export function EarlyAccessPopup({ isOpen, onClose, trigger, title, description }: EarlyAccessPopupProps) {
  const [showDelay, setShowDelay] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => setShowDelay(true), 1000);
      return () => clearTimeout(timer);
    }
    setShowDelay(false);
  }, [isOpen]);

  const handleEarlyAccess = () => {
    window.open('https://dentconnect.replit.app/', '_blank');
    onClose();
  };

  const handleContinue = () => {
    onClose();
  };

  const getTriggerContent = () => {
    switch (trigger) {
      case "questionnaire":
        return {
          title: "Great Progress! 🎯",
          description: "You've completed your preferences. See how DentConnect makes dental care accessible.",
          icon: "fas fa-clipboard-check"
        };
      case "search-complete":
        return {
          title: "Search Complete! 🔍",
          description: "You've experienced our AI-powered search. Ready to revolutionize dental appointments?",
          icon: "fas fa-search"
        };
      case "preferences-complete":
        return {
          title: "Preferences Set! ⚙️",
          description: "You've customized your experience. Join early access for personalized dental care.",
          icon: "fas fa-cogs"
        };
      case "mode-selected":
        return {
          title: "Mode Selected! 🎯",
          description: "You've chosen your search approach. Experience the full platform with early access.",
          icon: "fas fa-route"
        };
      case "practice-connected":
        return {
          title: "Connected Successfully! 🏥",
          description: "You've linked to your practice. Get full access to advanced booking features.",
          icon: "fas fa-link"
        };
      default:
        return {
          title: "Interested in More? 🚀",
          description: "You're exploring DentConnect's features. Join early access for the complete experience.",
          icon: "fas fa-star"
        };
    }
  };

  const content = getTriggerContent();
  const finalTitle = title || content.title;
  const finalDescription = description || content.description;

  if (!showDelay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <i className={`${content.icon} text-2xl text-blue-600`}></i>
            </div>
            
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                {finalTitle}
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                {finalDescription}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Early Access CTA */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardContent className="p-4 text-center">
            <Badge className="bg-blue-600 text-white mb-3">
              🚀 Limited Early Access
            </Badge>
            
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Ready for the Full Experience?
            </h3>
            
            <p className="text-blue-800 mb-4 text-xs">
              Join dental practices and patients already using DentConnect's 
              revolutionary appointment marketplace.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleEarlyAccess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <i className="fas fa-rocket mr-2"></i>
                Get Early Access Now
              </Button>
              
              <Button 
                onClick={handleContinue}
                variant="outline"
                className="w-full text-blue-600 border-blue-300"
              >
                Continue Demo
              </Button>
              
              <div className="text-xs text-blue-700">
                • No commitment required • Free during beta
                <br />
                • Priority onboarding • Direct feedback channel
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}