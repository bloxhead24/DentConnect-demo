import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { DentConnectLogo } from "../components/DentConnectLogo";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function EarlyAccessForm() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <DentConnectLogo width={300} height={75} className="mx-auto mb-6" />
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Demo
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Join the DentConnect Revolution
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Be among the first to access our revolutionary dental appointment marketplace. 
            Connect with local practices and book last-minute appointments with ease.
          </p>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-calendar-plus text-white text-3xl"></i>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                <p className="text-gray-600 mb-6">
                  Join our early access program and be the first to experience the future of dental appointments.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <i className="fas fa-award text-blue-600"></i>
                  <span className="font-bold text-blue-800">Royal College of Surgeons</span>
                </div>
                <p className="text-sm text-blue-700">National Contribution to Dentistry 2025</p>
              </div>

              <Button 
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Join Early Access
              </Button>

              <p className="text-sm text-gray-500">
                You'll be redirected to our main registration page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}