import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SearchMode = "open" | "practice" | "mydentist";

interface EnhancedMapSearchProps {
  onLocationChange: (location: string) => void;
  onFilterToggle: () => void;
  onQuestionnaireOpen: () => void;
  searchMode?: "open" | "practice" | "mydentist";
  searchFilters?: {
    urgency?: string;
    anxietyLevel?: string;
    accessibilityNeeds?: string[];
  };
}

export function EnhancedMapSearch({ 
  onLocationChange, 
  onFilterToggle, 
  onQuestionnaireOpen,
  searchMode = "open",
  searchFilters 
}: EnhancedMapSearchProps) {
  const [location, setLocation] = useState("Newcastle upon Tyne");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const locationSuggestions = [
    "Newcastle upon Tyne",
    "Sunderland",
    "Middlesbrough",
    "Durham",
    "Gateshead",
    "South Shields",
  ];

  const handleLocationSubmit = () => {
    setIsSearching(true);
    onLocationChange(location);
    setShowSuggestions(false);
    setTimeout(() => setIsSearching(false), 1500);
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowSuggestions(false);
    onLocationChange(selectedLocation);
  };

  const handleCurrentLocation = () => {
    setIsSearching(true);
    // Simulate getting current location
    setTimeout(() => {
      setLocation("Your current location");
      onLocationChange("Your current location");
      setIsSearching(false);
    }, 1000);
  };

  const searchModeConfig = {
    open: {
      title: "Open Search",
      description: "Any dentist, quickest time",
      icon: "fas fa-bolt",
      color: "text-orange-600 bg-orange-50 border-orange-200"
    },
    practice: {
      title: "My Practice Search", 
      description: "Any dentist within your practice",
      icon: "fas fa-building",
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    mydentist: {
      title: "My Dentist Search",
      description: "Your own dentist only", 
      icon: "fas fa-user-md",
      color: "text-teal-600 bg-teal-50 border-teal-200"
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Mode Indicator - Mobile Optimized */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-gentle">
        <div className="mobile-padding tablet-padding desktop-padding">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className={cn(searchModeConfig[searchMode].icon, "text-teal-600")}></i>
              <div>
                <p className="mobile-text md:text-sm font-medium text-gray-900">{searchModeConfig[searchMode].title}</p>
                <p className="mobile-text-sm md:text-xs text-gray-600">{searchModeConfig[searchMode].description}</p>
              </div>
            </div>
            <Badge className={cn("mobile-text-sm md:text-xs", searchModeConfig[searchMode].color)}>
              <i className={cn(searchModeConfig[searchMode].icon, "mr-1")}></i>
              Active
            </Badge>
          </div>
        </div>
      </Card>

      {/* Main Search Bar - Mobile Optimized */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-gentle">
        <div className="mobile-padding tablet-padding desktop-padding">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              {isSearching ? (
                <i className="fas fa-spinner fa-spin text-primary text-sm"></i>
              ) : (
                <i className="fas fa-search text-primary text-sm"></i>
              )}
            </div>
            <Input
              type="text"
              placeholder="Enter your location or postcode"
              className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent mobile-text md:text-base touch-target"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
              onFocus={() => setShowSuggestions(true)}
            />
            <Button 
              size="sm" 
              variant="ghost" 
              className="p-2 rounded-full hover:bg-primary/10 touch-target"
              onClick={handleCurrentLocation}
            >
              <i className="fas fa-location-arrow text-primary text-sm"></i>
            </Button>
          </div>

          {/* Location Suggestions */}
          {showSuggestions && (
            <div className="mt-3 space-y-1">
              {locationSuggestions
                .filter(suggestion => 
                  suggestion.toLowerCase().includes(location.toLowerCase()) && 
                  suggestion !== location
                )
                .slice(0, 3)
                .map((suggestion) => (
                <div
                  key={suggestion}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors"
                  onClick={() => handleLocationSelect(suggestion)}
                >
                  <i className="fas fa-map-marker-alt text-text-soft text-xs"></i>
                  <span className="text-sm text-text-primary">{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions & Filters */}
      <div className="flex items-center space-x-3">
        {/* Questionnaire Button */}
        <Button
          variant="outline"
          size="sm"
          className="bg-white/95 backdrop-blur-sm hover:bg-primary/10 flex-1 justify-start"
          onClick={onQuestionnaireOpen}
        >
          <i className="fas fa-clipboard-list text-primary mr-2"></i>
          <span>Quick Questions</span>
          {!searchFilters?.urgency && (
            <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
              Recommended
            </Badge>
          )}
        </Button>

        {/* Filter Button */}
        <Button
          variant="outline"
          size="sm"
          className="bg-white/95 backdrop-blur-sm hover:bg-primary/10 px-3"
          onClick={onFilterToggle}
        >
          <i className="fas fa-filter text-primary"></i>
          {(searchFilters?.urgency || searchFilters?.anxietyLevel || (searchFilters?.accessibilityNeeds && searchFilters.accessibilityNeeds.length > 0)) && (
            <div className="w-2 h-2 bg-orange-500 rounded-full absolute -top-1 -right-1"></div>
          )}
        </Button>
      </div>

      {/* Active Filters Display */}
      {(searchFilters?.urgency || searchFilters?.anxietyLevel || (searchFilters?.accessibilityNeeds && searchFilters.accessibilityNeeds.length > 0)) && (
        <Card className="bg-white/95 backdrop-blur-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-primary">Active Filters</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <i className="fas fa-times mr-1"></i>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchFilters?.urgency && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {searchFilters.urgency}
              </Badge>
            )}
            {searchFilters?.anxietyLevel && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                <i className="fas fa-heart mr-1"></i>
                {searchFilters.anxietyLevel}
              </Badge>
            )}
            {searchFilters?.accessibilityNeeds && searchFilters.accessibilityNeeds.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                <i className="fas fa-universal-access mr-1"></i>
                {searchFilters.accessibilityNeeds.length} accessibility needs
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Search Status */}
      {isSearching && (
        <Card className="bg-primary/10 backdrop-blur-sm border-primary/20">
          <div className="p-3 flex items-center space-x-3">
            <i className="fas fa-spinner fa-spin text-primary"></i>
            <div>
              <p className="text-sm font-medium text-primary">Searching for dentists...</p>
              <p className="text-xs text-primary/80">Finding the best matches in your area</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}