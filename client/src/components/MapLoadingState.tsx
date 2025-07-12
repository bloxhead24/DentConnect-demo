import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface MapLoadingStateProps {
  isLoading: boolean;
  searchQuery?: string;
}

export function MapLoadingState({ isLoading, searchQuery }: MapLoadingStateProps) {
  const [loadingStep, setLoadingStep] = useState(0);
  
  const loadingSteps = [
    { text: "Locating your position...", icon: "fas fa-location-arrow" },
    { text: "Finding nearby dentists...", icon: "fas fa-search" },
    { text: "Checking availability...", icon: "fas fa-calendar-check" },
    { text: "Matching your preferences...", icon: "fas fa-heart" },
  ];

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 800);

    return () => clearInterval(interval);
  }, [isLoading, loadingSteps.length]);

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30">
      <Card className="bg-white/95 backdrop-blur-sm shadow-floating p-6 mx-4 max-w-sm">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <i className={`${loadingSteps[loadingStep].icon} text-primary text-xl`}></i>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-2 border-primary/20 rounded-full animate-spin border-t-primary"></div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {loadingSteps[loadingStep].text}
            </h3>
            {searchQuery && (
              <p className="text-sm text-gray-600">Searching in {searchQuery}</p>
            )}
          </div>

          {/* Animated Progress Dots */}
          <div className="flex justify-center space-x-1">
            {loadingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === loadingStep ? 'bg-primary scale-125' : 'bg-primary/20'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}