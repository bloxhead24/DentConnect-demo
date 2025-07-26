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
        "accessibility-option p-3 sm:p-5 cursor-pointer border-2 transition-all duration-300 transform touch-friendly",
        "hover:scale-[1.02] active:scale-[0.98] min-h-[70px] sm:min-h-[80px]",
        selected 
          ? "border-primary bg-gradient-to-r from-primary/10 to-primary/20 shadow-lg shadow-primary/20 scale-[1.02]" 
          : "border-transparent hover:bg-primary/5 hover:shadow-lg"
      )}
      onClick={() => onToggle(need)}
    >
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2 flex-shrink-0",
          selected 
            ? "bg-primary border-primary scale-110 ring-4 ring-primary/30" 
            : "bg-white border-gray-200 hover:border-primary/50"
        )}>
          {/* Care type specific SVG images */}
          {need.id === 'wheelchair' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-blue-600")} fill="currentColor">
              <path d="M18.5 11c-1.56 0-3.02.68-4.03 1.84L12.03 9H8v2h2.5l1.09 2.18A6.996 6.996 0 0 0 7 20c0 .55.45 1 1 1s1-.45 1-1c0-2.76 2.24-5 5-5 .55 0 1-.45 1-1s-.45-1-1-1zm-.5-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
              <circle cx="18.5" cy="17" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M16.5 15h4m-2-2v4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          )}
          {need.id === 'signLanguage' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-purple-600")} fill="currentColor">
              <path d="M12 2C10.89 2 10 2.89 10 4s.89 2 2 2 2-.89 2-2-.89-2-2-2zm-2 8V8h4v2l1 1-1 1v6h-2v-4h-2v4H8v-6l-1-1 1-1z"/>
              <path d="M5 12l1.5-1.5L8 12l-1.5 1.5L5 12zm14 0l-1.5-1.5L16 12l1.5 1.5L19 12z" fill="currentColor"/>
              <path d="M7 16h2v2H7v-2zm8 0h2v2h-2v-2z" fill="currentColor"/>
            </svg>
          )}
          {need.id === 'visualSupport' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-indigo-600")} fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          )}
          {need.id === 'cognitiveSupport' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-cyan-600")} fill="currentColor">
              <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          )}
          {need.id === 'anxietySupport' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-green-600")} fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-bold text-sm sm:text-base leading-tight", selected ? "text-primary" : "text-gray-900")}>
            {need.name}
          </h4>
          <p className={cn("text-xs sm:text-sm mt-1 leading-tight", selected ? "text-primary/80" : "text-gray-600")}>
            {need.description}
          </p>
        </div>
        <div className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0",
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
