import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

interface GDPRPrivacyNoticeProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentGiven: (consents: ConsentData) => void;
  showAsModal?: boolean;
}

export interface ConsentData {
  gdprConsent: boolean;
  marketingConsent: boolean;
  clinicalDataConsent: boolean;
  communicationConsent: boolean;
}

export function GDPRPrivacyNotice({ isOpen, onClose, onConsentGiven, showAsModal = true }: GDPRPrivacyNoticeProps) {
  const [consents, setConsents] = useState<ConsentData>({
    gdprConsent: false,
    marketingConsent: false,
    clinicalDataConsent: false,
    communicationConsent: false
  });

  const handleConsentChange = (type: keyof ConsentData, checked: boolean) => {
    setConsents(prev => ({ ...prev, [type]: checked }));
  };

  const handleSubmit = () => {
    onConsentGiven(consents);
    onClose();
  };

  const canProceed = consents.gdprConsent && consents.clinicalDataConsent;

  const content = (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-shield-alt text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-2">Data Protection Notice</h2>
        <p className="text-gray-600">
          DentConnect is committed to protecting your privacy and complying with UK GDPR, CQC, and GDC requirements.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">Data Use</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What Data We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Badge className="bg-blue-100 text-blue-800 mt-1">Personal</Badge>
                <div>
                  <p className="font-medium">Personal Information</p>
                  <p className="text-sm text-gray-600">Name, email, phone number, date of birth</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="bg-red-100 text-red-800 mt-1">Health</Badge>
                <div>
                  <p className="font-medium">Health & Clinical Data</p>
                  <p className="text-sm text-gray-600">Medical conditions, medications, allergies, symptoms, triage assessments</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="bg-green-100 text-green-800 mt-1">Usage</Badge>
                <div>
                  <p className="font-medium">System Usage</p>
                  <p className="text-sm text-gray-600">Appointment bookings, preferences, accessibility needs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lawful Basis for Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">Healthcare Provision (Article 6(1)(c) & Article 9(2)(h))</p>
                <p className="text-sm text-gray-600">
                  We process your health data to provide healthcare services and meet our obligations under UK healthcare regulations.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-medium">Legitimate Interest (Article 6(1)(f))</p>
                <p className="text-sm text-gray-600">
                  We process personal data to operate our booking platform and ensure clinical safety.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="font-medium">Consent (Article 6(1)(a) & Article 9(2)(a))</p>
                <p className="text-sm text-gray-600">
                  We ask for your consent for marketing communications and non-essential data processing.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Clinical records</span>
                  <Badge variant="outline">10 years (NHS guidelines)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Appointment history</span>
                  <Badge variant="outline">7 years (CQC requirement)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Marketing preferences</span>
                  <Badge variant="outline">Until withdrawn</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your GDPR Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-eye text-blue-600"></i>
                    <span className="font-medium">Right to Access</span>
                  </div>
                  <p className="text-sm text-gray-600">View all your personal data</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-edit text-green-600"></i>
                    <span className="font-medium">Right to Rectification</span>
                  </div>
                  <p className="text-sm text-gray-600">Correct inaccurate data</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-trash text-red-600"></i>
                    <span className="font-medium">Right to Erasure</span>
                  </div>
                  <p className="text-sm text-gray-600">Delete your data (where legally permitted)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-download text-purple-600"></i>
                    <span className="font-medium">Right to Portability</span>
                  </div>
                  <p className="text-sm text-gray-600">Export your data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Protection Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Data Protection Officer</p>
                <p className="text-sm text-gray-600">dpo@dentconnect.uk</p>
                <p className="text-sm text-gray-600">+44 (0) 191 123 4567</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Information Commissioner's Office</p>
                <p className="text-sm text-gray-600">Report concerns: ico.org.uk</p>
                <p className="text-sm text-gray-600">Helpline: 0303 123 1113</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Required Consents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="gdprConsent"
                checked={consents.gdprConsent}
                onCheckedChange={(checked) => handleConsentChange("gdprConsent", !!checked)}
              />
              <div>
                <Label htmlFor="gdprConsent" className="text-sm font-medium">
                  I have read and understood the privacy notice <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Required to use DentConnect services
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="clinicalDataConsent"
                checked={consents.clinicalDataConsent}
                onCheckedChange={(checked) => handleConsentChange("clinicalDataConsent", !!checked)}
              />
              <div>
                <Label htmlFor="clinicalDataConsent" className="text-sm font-medium">
                  I consent to processing of my health data for clinical care <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Required for appointment booking and clinical safety
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="communicationConsent"
                checked={consents.communicationConsent}
                onCheckedChange={(checked) => handleConsentChange("communicationConsent", !!checked)}
              />
              <div>
                <Label htmlFor="communicationConsent" className="text-sm font-medium">
                  I consent to SMS/email appointment reminders
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Appointment confirmations and reminders
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketingConsent"
                checked={consents.marketingConsent}
                onCheckedChange={(checked) => handleConsentChange("marketingConsent", !!checked)}
              />
              <div>
                <Label htmlFor="marketingConsent" className="text-sm font-medium">
                  I consent to marketing communications
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Optional: Updates about new services and offers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canProceed}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Accept & Continue
        </Button>
      </div>
    </div>
  );

  if (showAsModal) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Protection & Privacy Notice</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            {content}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}