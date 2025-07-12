import React from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";

function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-teal-600 mb-2">
            🦷 DentConnect
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Find available dental appointments near you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              What type of treatment do you need?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 text-left flex-col items-start p-4 border-2 hover:border-teal-500 hover:bg-teal-50"
                onClick={() => alert("🚨 Emergency treatment selected!")}
              >
                <div className="font-semibold text-red-600">🚨 Emergency</div>
                <div className="text-sm text-gray-600">Immediate dental care needed</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 text-left flex-col items-start p-4 border-2 hover:border-orange-500 hover:bg-orange-50"
                onClick={() => alert("⚡ Urgent treatment selected!")}
              >
                <div className="font-semibold text-orange-600">⚡ Urgent</div>
                <div className="text-sm text-gray-600">Pain relief and urgent care</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 text-left flex-col items-start p-4 border-2 hover:border-green-500 hover:bg-green-50"
                onClick={() => alert("✅ Routine treatment selected!")}
              >
                <div className="font-semibold text-green-600">✅ Routine</div>
                <div className="text-sm text-gray-600">Regular check-up and cleaning</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 text-left flex-col items-start p-4 border-2 hover:border-purple-500 hover:bg-purple-50"
                onClick={() => alert("✨ Cosmetic treatment selected!")}
              >
                <div className="font-semibold text-purple-600">✨ Cosmetic</div>
                <div className="text-sm text-gray-600">Aesthetic dental treatments</div>
              </Button>
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800">
                🏆 Demo Status: Working!
              </p>
              <p className="text-xs text-blue-600">
                This simplified version confirms React is functioning correctly
              </p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => window.location.href = "/"}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Back to Full Demo
              </Button>
              <Button 
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
                variant="outline"
                className="border-teal-600 text-teal-600 hover:bg-teal-50"
              >
                Early Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Router() {
  return <SimpleLanding />;
}

function App() {
  return <Router />;
}

export default App;