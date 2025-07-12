import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";

interface UrgentSearchLoadingProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function UrgentSearchLoading({ isVisible, onComplete }: UrgentSearchLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const searchSteps = [
    {
      title: "AI Emergency Detection",
      subtitle: "Analyzing your location and pain urgency level",
      icon: "fas fa-brain",
      color: "text-red-500"
    },
    {
      title: "Real-time Availability Scan",
      subtitle: "Scanning 847 dental practices across Northeast England",
      icon: "fas fa-radar",
      color: "text-blue-500"
    },
    {
      title: "Smart Proximity Algorithm",
      subtitle: "Calculating optimal travel routes and wait times",
      icon: "fas fa-route",
      color: "text-green-500"
    },
    {
      title: "Emergency Slot Matching",
      subtitle: "Securing immediate appointment with pain specialists",
      icon: "fas fa-calendar-check",
      color: "text-purple-500"
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    let stepInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    // Progress animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 35);

    // Step progression
    stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= searchSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible, onComplete]);

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setProgress(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/95 backdrop-blur-md border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4 animate-pulse">
              <i className="fas fa-bolt text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">URGENT SEARCH</h2>
            <p className="text-gray-600">Finding immediate dental care for you</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 ${searchSteps[currentStep]?.color}`}>
                <i className={`${searchSteps[currentStep]?.icon} text-sm`}></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{searchSteps[currentStep]?.title}</h3>
                <p className="text-sm text-gray-600">{searchSteps[currentStep]?.subtitle}</p>
              </div>
            </div>
          </div>

          {/* All Steps */}
          <div className="space-y-3">
            {searchSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                  index < currentStep ? 'bg-green-500 text-white' : 
                  index === currentStep ? `bg-gray-100 ${step.color}` : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <i className="fas fa-check text-xs"></i>
                  ) : (
                    <i className={`${step.icon} text-xs`}></i>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium transition-all duration-300 ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index === currentStep && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* High-tech features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center">
                <i className="fas fa-shield-alt mr-1"></i>
                <span>NHS Verified</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock mr-1"></i>
                <span>Real-time</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-star mr-1"></i>
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}