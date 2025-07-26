import { AccessibilityNeed } from "../lib/types";
import { Card } from "../components/ui/card";
import { cn } from "../lib/utils";

interface AccessibilityOptionProps {
  need: AccessibilityNeed;
  selected: boolean;
  onToggle: (need: AccessibilityNeed) => void;
}

export function AccessibilityOption({ need, selected, onToggle }: AccessibilityOptionProps) {
  return (
    <Card
      className={cn(
        "accessibility-option p-5 cursor-pointer border-2 transition-all duration-300 transform hover:scale-[1.02]",
        selected 
          ? "border-primary bg-gradient-to-r from-primary/10 to-primary/20 shadow-lg shadow-primary/20 scale-[1.02]" 
          : "border-transparent hover:bg-primary/5 hover:shadow-lg"
      )}
      onClick={() => onToggle(need)}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          {/* Main accessibility circle */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            selected ? "bg-primary text-white scale-110" : "bg-primary/10 text-primary"
          )}>
            <i className={`${need.icon} text-lg`}></i>
          </div>
          
          {/* Relevant care images */}
          {need.id === 'wheelchair' && (
            <div className="w-8 h-8 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full text-blue-600" fill="currentColor">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
              </svg>
            </div>
          )}
          {need.id === 'signLanguage' && (
            <div className="w-8 h-8 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full text-purple-600" fill="currentColor">
                <path d="M9.5 11H11v1.5h-1.5V11zm1.5-1.5H9.5V8H11v1.5zm3.5 0V8h1.5v1.5H14.5zm0 3V11H16v1.5h-1.5z"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          )}
          {need.id === 'visualSupport' && (
            <div className="w-8 h-8 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full text-indigo-600" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
          )}
          {need.id === 'cognitiveSupport' && (
            <div className="w-8 h-8 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full text-cyan-600" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          )}
          {need.id === 'anxietySupport' && (
            <div className="w-8 h-8 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full text-green-600" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className={cn("font-bold", selected ? "text-primary" : "text-gray-900")}>
            {need.name}
          </h4>
          <p className={cn("text-sm", selected ? "text-primary/80" : "text-gray-600")}>
            {need.description}
          </p>
        </div>
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          selected ? "bg-primary border-primary scale-110" : "border-gray-300 bg-white"
        )}>
          {selected && (
            <i className="fas fa-check text-white text-xs animate-in zoom-in-50 duration-200"></i>
          )}
        </div>
      </div>
    </Card>
  );
}
