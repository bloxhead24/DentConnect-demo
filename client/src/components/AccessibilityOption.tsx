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
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2",
          selected 
            ? "bg-primary border-primary scale-110 ring-4 ring-primary/30" 
            : "bg-white border-gray-200 hover:border-primary/50"
        )}>
          {/* Care type specific SVG images */}
          {need.id === 'wheelchair' && (
            <svg viewBox="0 0 24 24" className={cn("w-6 h-6", selected ? "text-white" : "text-blue-600")} fill="currentColor">
              <path d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c2.67 0 8 1.33 8 4v2H4v-2c0-2.67 5.33-4 8-4zm-1-9v2H9.5v6H11v-2h1v2h1.5V7H12V5h-1zm-7 7.5L2.5 8l1.42-1.42L6 8.67l3.54-3.54L11 6.58 6.42 11.08 4 8.5z"/>
            </svg>
          )}
          {need.id === 'signLanguage' && (
            <svg viewBox="0 0 24 24" className={cn("w-6 h-6", selected ? "text-white" : "text-purple-600")} fill="currentColor">
              <path d="M12 3c-1.27 0-2.4.8-2.82 2H7v2h2.05c-.05.33-.05.67 0 1H7v2h2.18c.42 1.2 1.55 2 2.82 2s2.4-.8 2.82-2H17v-2h-2.05c.05-.33.05-.67 0-1H17V5h-2.18C14.4 3.8 13.27 3 12 3zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
            </svg>
          )}
          {need.id === 'visualSupport' && (
            <svg viewBox="0 0 24 24" className={cn("w-6 h-6", selected ? "text-white" : "text-indigo-600")} fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          )}
          {need.id === 'cognitiveSupport' && (
            <svg viewBox="0 0 24 24" className={cn("w-6 h-6", selected ? "text-white" : "text-cyan-600")} fill="currentColor">
              <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          )}
          {need.id === 'anxietySupport' && (
            <svg viewBox="0 0 24 24" className={cn("w-6 h-6", selected ? "text-white" : "text-green-600")} fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
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
