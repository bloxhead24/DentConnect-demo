import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GDPRPrivacyNotice } from "@/components/GDPRPrivacyNotice";
import { SecurityFeatures } from "@/components/SecurityFeatures";
import { ArrowLeft, Shield, FileText, Lock, Download, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/login')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Privacy & Security</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                GDPR Compliant
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <Lock className="h-3 w-3 mr-1" />
                NHS Digital Standards
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Privacy Notice
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Features
            </TabsTrigger>
            <TabsTrigger value="rights" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Your Rights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Notice</CardTitle>
                <CardDescription>
                  How we collect, use, and protect your personal data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GDPRPrivacyNotice />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityFeatures />
          </TabsContent>

          <TabsContent value="rights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Data Rights</CardTitle>
                <CardDescription>
                  Exercise your rights under UK GDPR
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-teal-200 bg-teal-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Download className="h-5 w-5 text-teal-600" />
                        Request Your Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a copy of all personal data we hold about you in a portable format.
                      </p>
                      <Button variant="outline" className="w-full">
                        Request Data Export
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-600" />
                        Delete Your Account
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Permanently delete your account and all associated data (subject to legal requirements).
                      </p>
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                        Request Account Deletion
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Processing Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-sm">Healthcare Services</h4>
                        <p className="text-sm text-gray-600">
                          We process your health data to match you with suitable dental appointments and facilitate healthcare delivery.
                        </p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-sm">Communication</h4>
                        <p className="text-sm text-gray-600">
                          We use your contact details to send appointment reminders and important healthcare updates.
                        </p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-sm">Service Improvement</h4>
                        <p className="text-sm text-gray-600">
                          We analyze anonymized usage data to improve our matching algorithms and user experience.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Our Data Protection Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">
                        For any questions about how we handle your data or to exercise your rights:
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Email:</strong> privacy@dentconnect.co.uk
                        </p>
                        <p className="text-sm">
                          <strong>Phone:</strong> 0191 123 4567
                        </p>
                        <p className="text-sm">
                          <strong>Post:</strong> Data Protection Officer, DentConnect Ltd, 15 Grainger Street, Newcastle upon Tyne, NE1 5DQ
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}