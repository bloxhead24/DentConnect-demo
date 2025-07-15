import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Stethoscope, Users, MapPin, Clock, Shield, Star } from "lucide-react";

function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg mb-6 mx-auto" style={{ width: 300, height: 75 }}>
            <span className="text-3xl">DentConnect</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Dental Appointment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with local dental practices and book last-minute appointments. 
            Real-time availability, instant booking, and comprehensive accessibility support.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Clock className="w-12 h-12 text-teal-500 mx-auto mb-4" />
              <CardTitle>Real-time Availability</CardTitle>
              <CardDescription>
                See live appointment slots from local practices
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-teal-500 mx-auto mb-4" />
              <CardTitle>Secure & Verified</CardTitle>
              <CardDescription>
                All practices are verified and GDC registered
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <MapPin className="w-12 h-12 text-teal-500 mx-auto mb-4" />
              <CardTitle>Local Practices</CardTitle>
              <CardDescription>
                Find nearby dental practices with availability
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Book Your Appointment?
          </h2>
          <div className="space-y-4 space-x-0 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center items-center">
            <Button 
              size="lg" 
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 text-lg"
              onClick={() => window.location.href = '/early-access'}
            >
              <Users className="w-5 h-5 mr-2" />
              Book as Patient
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-teal-500 text-teal-500 hover:bg-teal-50 px-8 py-3 text-lg"
              onClick={() => window.location.href = '/dentist-signup'}
            >
              <Stethoscope className="w-5 h-5 mr-2" />
              Join as Dentist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleLanding;