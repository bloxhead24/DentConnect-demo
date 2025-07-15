import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";

export default function MinimalApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg mb-6 mx-auto w-64 h-16">
            <span className="text-2xl">DentConnect</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Dental Appointment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with local dental practices and book last-minute appointments
          </p>
        </div>

        {/* Treatment Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <CardTitle className="text-xl text-center">Emergency Care</CardTitle>
              <CardDescription className="text-center">
                Severe pain, trauma, or urgent dental issues
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
              >
                Book Emergency
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🕒</span>
              </div>
              <CardTitle className="text-xl text-center">Urgent Treatment</CardTitle>
              <CardDescription className="text-center">
                Moderate pain needing prompt care
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
              >
                Book Urgent
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <CardTitle className="text-xl text-center">Routine Care</CardTitle>
              <CardDescription className="text-center">
                Regular checkups and cleanings
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
              >
                Book Routine
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">😊</span>
              </div>
              <CardTitle className="text-xl text-center">Cosmetic Treatment</CardTitle>
              <CardDescription className="text-center">
                Whitening and aesthetic improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
              >
                Book Cosmetic
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Virtual Consultation */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-8">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">📹</div>
            <CardTitle className="text-2xl">Virtual Consultation</CardTitle>
            <CardDescription className="text-blue-100">
              Connect with a dental professional from home - £24.99 for 30 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
            >
              Start Virtual Consultation
            </Button>
          </CardContent>
        </Card>

        {/* Dentist CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Are you a dental professional?</p>
          <Button 
            variant="outline"
            className="border-teal-500 text-teal-600 hover:bg-teal-50"
            onClick={() => window.open('https://dentconnect.replit.app/', '_blank')}
          >
            🩺 Join as Dentist
          </Button>
        </div>
      </div>
    </div>
  );
}