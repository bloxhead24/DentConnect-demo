import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Database, Key, UserCheck, FileText, Eye, Server, AlertTriangle, CheckCircle2 } from "lucide-react";

export function SecurityFeatures() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Password Security",
      description: "Industry-standard bcrypt hashing with salt rounds",
      features: ["Minimum 8 characters", "Special character requirements", "No plain text storage"],
      status: "active"
    },
    {
      icon: Key,
      title: "JWT Authentication",
      description: "Secure token-based authentication system",
      features: ["24-hour token expiry", "Secure HTTP-only cookies", "Token refresh mechanism"],
      status: "active"
    },
    {
      icon: Shield,
      title: "Data Encryption",
      description: "End-to-end encryption for sensitive data",
      features: ["AES-256 encryption at rest", "TLS 1.3 in transit", "Encrypted backups"],
      status: "active"
    },
    {
      icon: UserCheck,
      title: "Identity Verification",
      description: "Multi-factor authentication for healthcare professionals",
      features: ["Email verification", "SMS verification", "GDC/GMC validation"],
      status: "partial"
    },
    {
      icon: Database,
      title: "GDPR Compliance",
      description: "Full compliance with UK data protection laws",
      features: ["Right to erasure", "Data portability", "Consent management"],
      status: "active"
    },
    {
      icon: FileText,
      title: "Audit Logging",
      description: "Comprehensive activity tracking for compliance",
      features: ["All access logged", "Data modification tracking", "Login attempt monitoring"],
      status: "active"
    },
    {
      icon: Eye,
      title: "Access Control",
      description: "Role-based permissions and data isolation",
      features: ["Patient data isolation", "Practice-level access", "Admin oversight"],
      status: "active"
    },
    {
      icon: Server,
      title: "Infrastructure Security",
      description: "Enterprise-grade hosting and monitoring",
      features: ["ISO 27001 compliance", "24/7 monitoring", "DDoS protection"],
      status: "active"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Security & Privacy Features</h2>
        <p className="text-gray-600 mt-2">NHS Digital and GDPR compliant data protection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Icon className="h-8 w-8 text-teal-600" />
                  <Badge 
                    variant={feature.status === 'active' ? 'default' : 'secondary'}
                    className={feature.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {feature.status === 'active' ? 'Active' : 'In Progress'}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">{feature.title}</CardTitle>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Demo Environment Notice</h3>
            <p className="text-sm text-amber-800 mt-1">
              This is a demonstration environment. While all security features are implemented, 
              some verification processes (like GDC validation) are simulated for demo purposes. 
              In production, all security measures are fully enforced.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}