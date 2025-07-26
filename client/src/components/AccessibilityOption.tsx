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
        <div className="relative flex items-center justify-center">
          {/* Main accessibility circle */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            selected ? "bg-primary text-white scale-110" : "bg-primary/10 text-primary"
          )}>
            <i className={`${need.icon} text-lg`}></i>
          </div>
          
          {/* Small decorative icons around the circle */}
          {need.id === 'wheelchair' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-building text-blue-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-door-open text-blue-600 text-xs"></i>
              </div>
            </>
          )}
          {need.id === 'signLanguage' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-hands text-purple-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-comment text-purple-600 text-xs"></i>
              </div>
            </>
          )}
          {need.id === 'visualSupport' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <i className="fas fa-font text-indigo-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <i className="fas fa-volume-up text-indigo-600 text-xs"></i>
              </div>
            </>
          )}
          {need.id === 'cognitiveSupport' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-cyan-100 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-cyan-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-100 rounded-full flex items-center justify-center">
                <i className="fas fa-book-open text-cyan-600 text-xs"></i>
              </div>
            </>
          )}
          {need.id === 'anxietySupport' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-leaf text-green-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-heart text-green-600 text-xs"></i>
              </div>
            </>
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
