import { AccessibilityNeed } from "../lib/types";
import { Card } from "../components/ui/card";
import { cn } from "../lib/utils";

interface AccessibilityOptionProps {
  need: AccessibilityNeed;
  selected: boolean;
  onToggle: (need: AccessibilityNeed) => void;
}

export function AccessibilityOption({ need, selected, onToggle }: AccessibilityOptionProps) {
  const categoryColors = {
    mobility: { bg: "#3B82F6", bgLight: "#DBEAFE", text: "#1E40AF" },
    sensory: { bg: "#8B5CF6", bgLight: "#EDE9FE", text: "#6B21A8" },
    cognitive: { bg: "#06B6D4", bgLight: "#CFFAFE", text: "#0E7490" },
    emotional: { bg: "#10B981", bgLight: "#D1FAE5", text: "#047857" },
    default: { bg: "#6B7280", bgLight: "#F3F4F6", text: "#374151" }
  };

  const colors = categoryColors[need.category as keyof typeof categoryColors] || categoryColors.default;

  return (
    <Card
      className={cn(
        "accessibility-option p-5 cursor-pointer border-2 transition-all duration-300 transform hover:scale-[1.02] rounded-xl",
        selected 
          ? "border-2 shadow-lg scale-[1.02]" 
          : "border-transparent hover:shadow-lg"
      )}
      style={{
        borderColor: selected ? colors.bg : "transparent",
        background: selected ? colors.bgLight : undefined
      }}
      onClick={() => onToggle(need)}
    >
      <div className="flex items-center space-x-4">
        <div 
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg relative text-white",
            selected ? "scale-110" : "hover:scale-105"
          )}
          style={{
            background: selected 
              ? `linear-gradient(135deg, ${colors.bg}, ${colors.bg}CC)` 
              : `linear-gradient(135deg, ${colors.bg}20, ${colors.bg}40)`,
            color: selected ? "white" : colors.text
          }}
        >
          <i className={`${need.icon} text-xl`}></i>
          {selected && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-75 duration-200">
              <i className="fas fa-check text-white text-xs"></i>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 
            className="font-bold text-base"
            style={{ 
              color: selected ? colors.text : "#111827" 
            }}
          >
            {need.name}
          </h4>
          <p 
            className="text-sm leading-relaxed"
            style={{ 
              color: selected ? colors.text + "CC" : "#6B7280" 
            }}
          >
            {need.description}
          </p>
          {need.category && (
            <span 
              className="inline-block px-2 py-1 text-xs font-medium rounded-full mt-1"
              style={{
                backgroundColor: colors.bg + "20",
                color: colors.text
              }}
            >
              {need.category.charAt(0).toUpperCase() + need.category.slice(1)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
