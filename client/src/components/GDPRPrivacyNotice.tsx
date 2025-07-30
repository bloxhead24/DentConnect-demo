import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Database, FileText, Users, Globe, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface ConsentData {
  gdprConsent: boolean;
  marketingConsent: boolean;
  clinicalDataConsent: boolean;
  communicationConsent: boolean;
}

interface GDPRPrivacyNoticeProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConsentGiven?: (consents: ConsentData) => void;
  showAsModal?: boolean;
}

export function GDPRPrivacyNotice({ onClose, onConsentGiven }: GDPRPrivacyNoticeProps) {
  const [consents, setConsents] = useState<ConsentData>({
    gdprConsent: false,
    marketingConsent: false,
    clinicalDataConsent: false,
    communicationConsent: false
  });

  const handleConsentChange = (type: keyof ConsentData, checked: boolean) => {
    setConsents(prev => ({ ...prev, [type]: checked }));
  };

  const handleContinue = () => {
    if (consents.gdprConsent && consents.clinicalDataConsent) {
      onConsentGiven?.(consents);
    }
  };

  const canContinue = consents.gdprConsent && consents.clinicalDataConsent;

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-teal-600" />
              Privacy Notice & Data Protection
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              DentConnect is committed to protecting your privacy and complying with the UK General Data Protection Regulation (UK GDPR), 
              Data Protection Act 2018, and NHS Digital standards for handling health data.
            </p>
          </CardContent>
        </Card>

        {/* Data Controller */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-teal-600" />
              Data Controller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><strong>Organization:</strong> DentConnect Ltd</p>
            <p className="text-sm"><strong>Registration:</strong> ICO Registration Number: ZA123456</p>
            <p className="text-sm"><strong>Address:</strong> 15 Grainger Street, Newcastle upon Tyne, NE1 5DQ</p>
            <p className="text-sm"><strong>Data Protection Officer:</strong> Dr. Sarah Mitchell</p>
            <p className="text-sm"><strong>Contact:</strong> privacy@dentconnect.co.uk</p>
          </CardContent>
        </Card>

        {/* What Data We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-teal-600" />
              What Personal Data We Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Identity Data:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Full name, date of birth, gender</li>
                  <li>NHS number (for patients)</li>
                  <li>GDC registration number (for dentists)</li>
                  <li>Professional qualifications and credentials</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Contact Data:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Email address and telephone numbers</li>
                  <li>Home address and emergency contact details</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Health Data (Special Category):</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Medical history and current conditions</li>
                  <li>Medications and allergies</li>
                  <li>Dental treatment history and clinical notes</li>
                  <li>Triage assessment responses</li>
                  <li>X-rays and clinical photographs (if applicable)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Technical Data:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>IP address and device information</li>
                  <li>Login data and access times</li>
                  <li>Browser type and version</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Basis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-teal-600" />
              Legal Basis for Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Healthcare Services (Article 9(2)(h) UK GDPR)</h4>
                <p className="text-sm text-muted-foreground">
                  Processing is necessary for medical diagnosis, provision of health care, and management of health systems.
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Vital Interests (Article 6(1)(d) UK GDPR)</h4>
                <p className="text-sm text-muted-foreground">
                  In emergency situations, we may process data to protect vital interests.
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Consent (Article 6(1)(a) UK GDPR)</h4>
                <p className="text-sm text-muted-foreground">
                  For marketing communications and optional services, we rely on your explicit consent.
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Legal Obligations (Article 6(1)(c) UK GDPR)</h4>
                <p className="text-sm text-muted-foreground">
                  To comply with NHS reporting requirements and professional regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-teal-600" />
              How We Use Your Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
              <li>To match you with suitable dental appointments based on your needs</li>
              <li>To facilitate communication between patients and dental practices</li>
              <li>To maintain accurate clinical records for continuity of care</li>
              <li>To process appointment bookings and send reminders</li>
              <li>To conduct triage assessments for urgent care prioritization</li>
              <li>To comply with NHS reporting and quality assurance requirements</li>
              <li>To improve our services through anonymized analytics</li>
              <li>To ensure platform security and prevent fraud</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-teal-600" />
              Who We Share Data With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Healthcare Providers:</h4>
                <p className="text-sm text-muted-foreground">
                  Your selected dental practice and healthcare professionals involved in your care
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">NHS Systems:</h4>
                <p className="text-sm text-muted-foreground">
                  NHS Digital for reporting and integration with national health records
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Regulatory Bodies:</h4>
                <p className="text-sm text-muted-foreground">
                  Care Quality Commission (CQC), General Dental Council (GDC) when legally required
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Technology Partners:</h4>
                <p className="text-sm text-muted-foreground">
                  Secure cloud hosting providers (AWS), email service providers (under strict data processing agreements)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-teal-600" />
              Data Security Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
              <li>End-to-end encryption for all data transmissions</li>
              <li>Encryption at rest for stored data using AES-256</li>
              <li>Multi-factor authentication for healthcare professionals</li>
              <li>Regular security audits and penetration testing</li>
              <li>ISO 27001 certified data centers</li>
              <li>NHS Data Security and Protection Toolkit compliance</li>
              <li>Role-based access controls and audit logging</li>
              <li>Regular staff training on data protection</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-teal-600" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                We retain your data in accordance with NHS guidelines and professional requirements:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground mt-2">
                <li>Clinical records: 8 years from last treatment (adults)</li>
                <li>Children's records: Until 25th birthday or 8 years after last treatment</li>
                <li>Account information: 2 years after account closure</li>
                <li>Marketing preferences: Until consent withdrawn</li>
                <li>Technical logs: 12 months</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-teal-600" />
              Your Rights Under UK GDPR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Right to Access</h4>
                <p className="text-sm text-muted-foreground">
                  Request a copy of your personal data we hold
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Right to Rectification</h4>
                <p className="text-sm text-muted-foreground">
                  Request correction of inaccurate or incomplete data
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Right to Erasure</h4>
                <p className="text-sm text-muted-foreground">
                  Request deletion of your data (subject to legal retention requirements)
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Right to Data Portability</h4>
                <p className="text-sm text-muted-foreground">
                  Receive your data in a structured, machine-readable format
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Right to Object</h4>
                <p className="text-sm text-muted-foreground">
                  Object to processing for direct marketing or legitimate interests
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Right to Restrict Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Request limitation of processing in certain circumstances
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-teal-600" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Data Protection Queries:</h4>
                <p className="text-sm text-muted-foreground">
                  Email: privacy@dentconnect.co.uk<br />
                  Phone: 0191 123 4567
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-1">Complaints:</h4>
                <p className="text-sm text-muted-foreground">
                  If you're not satisfied with our response, you can complain to the Information Commissioner's Office:<br />
                  Website: ico.org.uk<br />
                  Phone: 0303 123 1113
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-teal-600" />
              Updates to This Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We may update this privacy notice from time to time. We will notify you of any significant changes 
              via email or through the platform. The latest version will always be available on our website.
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
    
    {/* Consent Checkboxes */}
    <Card className="border-teal-200 bg-teal-50/50">
      <CardHeader>
        <CardTitle className="text-lg">Your Consent</CardTitle>
        <CardDescription>Please review and provide your consent to proceed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="gdpr"
            checked={consents.gdprConsent}
            onCheckedChange={(checked) => handleConsentChange('gdprConsent', checked as boolean)}
          />
          <Label htmlFor="gdpr" className="text-sm font-normal cursor-pointer">
            <span className="font-semibold">I consent to the processing of my personal data</span> as described in this privacy notice in accordance with UK GDPR and Data Protection Act 2018. *
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="clinical"
            checked={consents.clinicalDataConsent}
            onCheckedChange={(checked) => handleConsentChange('clinicalDataConsent', checked as boolean)}
          />
          <Label htmlFor="clinical" className="text-sm font-normal cursor-pointer">
            <span className="font-semibold">I consent to the processing of my health data</span> for the purpose of dental treatment and care. *
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="communication"
            checked={consents.communicationConsent}
            onCheckedChange={(checked) => handleConsentChange('communicationConsent', checked as boolean)}
          />
          <Label htmlFor="communication" className="text-sm font-normal cursor-pointer">
            I consent to receive appointment reminders and important updates via SMS and email.
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="marketing"
            checked={consents.marketingConsent}
            onCheckedChange={(checked) => handleConsentChange('marketingConsent', checked as boolean)}
          />
          <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
            I consent to receive marketing communications about dental services and offers.
          </Label>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          * Required consents. You can withdraw your consent at any time by contacting us.
        </p>
      </CardContent>
    </Card>

    {/* Action Buttons */}
    <div className="flex justify-between">
      <Button variant="outline" onClick={onClose}>
        Back
      </Button>
      <Button 
        onClick={handleContinue}
        disabled={!canContinue}
        className="bg-teal-600 hover:bg-teal-700"
      >
        Continue
      </Button>
    </div>
    </div>
  );
}