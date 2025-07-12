import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { ArrowLeft, Check } from "lucide-react";
import type { TreatmentType, AccessibilityNeed } from "../lib/types";


interface BudgetOption {
  id: string;
  name: string;
  range: string;
  symbols: string;
  description: string;
  popular?: boolean;
}

interface BudgetSelectionProps {
  selectedTreatment: TreatmentType | null;
  selectedAccessibility: AccessibilityNeed[];
  onBudgetSelect: (budget: BudgetOption) => void;
  onBack: () => void;
  selectedBudget?: BudgetOption | null;
}

const budgetOptions: BudgetOption[] = [
  {
    id: "basic",
    name: "Essential Care",
    range: "Budget-conscious",
    symbols: "£",
    description: "NHS and cost-effective private options"
  },
  {
    id: "standard",
    name: "Standard Care", 
    range: "Mid-range budget",
    symbols: "££",
    description: "Private care with quality materials",
    popular: true
  },
  {
    id: "premium",
    name: "Premium Care",
    range: "Higher budget",
    symbols: "£££",
    description: "Advanced treatments and premium materials"
  },
  {
    id: "luxury",
    name: "Specialist Care",
    range: "No budget limits",
    symbols: "££££",
    description: "Top-tier specialists and exclusive treatments"
  },
  {
    id: "flexible",
    name: "Show All Options",
    range: "Any budget range",
    symbols: "£-££££",
    description: "View all available practices regardless of pricing"
  }
];

export default function BudgetSelection({ 
  selectedTreatment, 
  selectedAccessibility, 
  onBudgetSelect, 
  onBack,
  selectedBudget 
}: BudgetSelectionProps) {
  const [hoveredBudget, setHoveredBudget] = useState<string | null>(null);

  const handleBudgetSelect = (budget: BudgetOption) => {
    onBudgetSelect(budget);
    // Navigation is handled immediately by the parent component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-center">Treatment Budget</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Header Information */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-pound-sign text-2xl text-green-600"></i>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What's Your Budget Range?</h2>
            <p className="text-gray-600 mt-2">
              Help us show practices that match your budget preferences
            </p>
          </div>

          {selectedTreatment && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-sm px-3 py-1",
                selectedTreatment.category === "emergency" ? "border-red-200 text-red-700 bg-red-50" :
                selectedTreatment.category === "urgent" ? "border-orange-200 text-orange-700 bg-orange-50" :
                selectedTreatment.category === "routine" ? "border-blue-200 text-blue-700 bg-blue-50" :
                "border-purple-200 text-purple-700 bg-purple-50"
              )}
            >
              {selectedTreatment.category} • {selectedTreatment.name}
            </Badge>
          )}
        </div>

        {/* Budget Options */}
        <div className="space-y-3">
          {budgetOptions.map((budget) => (
            <Card
              key={budget.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 border-2",
                selectedBudget?.id === budget.id
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                  : hoveredBudget === budget.id
                  ? "border-primary/30 shadow-md scale-[1.01]"
                  : "border-gray-200 hover:border-gray-300",
                budget.popular && "ring-2 ring-primary/20"
              )}
              onClick={() => handleBudgetSelect(budget)}
              onMouseEnter={() => setHoveredBudget(budget.id)}
              onMouseLeave={() => setHoveredBudget(null)}
            >
              {budget.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-3 py-1 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                      selectedBudget?.id === budget.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {budget.symbols}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{budget.name}</CardTitle>
                      <p className="text-sm text-gray-600">{budget.range}</p>
                    </div>
                  </div>
                  
                  {selectedBudget?.id === budget.id && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700">{budget.description}</p>
                
                {budget.id === "basic" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">NHS Options</Badge>
                    <Badge variant="outline" className="text-xs">Essential Care</Badge>
                  </div>
                )}
                
                {budget.id === "standard" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Private Practice</Badge>
                    <Badge variant="outline" className="text-xs">Quality Materials</Badge>
                  </div>
                )}
                
                {budget.id === "premium" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Advanced Tech</Badge>
                    <Badge variant="outline" className="text-xs">Premium Materials</Badge>
                  </div>
                )}
                
                {budget.id === "luxury" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Specialist Care</Badge>
                    <Badge variant="outline" className="text-xs">Top-Tier Service</Badge>
                  </div>
                )}
                
                {budget.id === "flexible" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">All Options</Badge>
                    <Badge variant="outline" className="text-xs">Compare Prices</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Appointment Fee Information */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <i className="fas fa-calendar-check text-green-600 mt-0.5"></i>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900">Simple Appointment Booking</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p><strong>Appointment Booking Fee: £5</strong></p>
                  <p>Treatment costs are assessed by your dentist during the appointment.</p>
                  <p>Each practice provides guidance on typical treatment ranges for planning.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">Budget Filtering</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>• Matches you with practices in your preferred price range</p>
                  <p>• All practices provide their own transparent pricing</p>
                  <p>• Many offer payment plans and financing options</p>
                  <p>• You can adjust your budget selection anytime</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Summary */}
        {selectedAccessibility.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Selected Accessibility Needs</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAccessibility.map((need) => (
                  <Badge key={need.id} variant="outline" className="text-xs">
                    {need.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      

    </div>
  );
}