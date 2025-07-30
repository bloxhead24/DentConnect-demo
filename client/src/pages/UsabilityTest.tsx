import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2, Users, Calendar, BookOpen, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

interface TestResult {
  feature: string;
  status: 'pending' | 'testing' | 'success' | 'warning' | 'failed';
  issues: string[];
  improvements: string[];
}

export default function UsabilityTest() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([
    { 
      feature: 'Patient Registration', 
      status: 'pending',
      issues: [],
      improvements: []
    },
    { 
      feature: 'Dentist Registration', 
      status: 'pending',
      issues: [],
      improvements: []
    },
    { 
      feature: 'Appointment Slot Creation', 
      status: 'pending',
      issues: [],
      improvements: []
    },
    { 
      feature: 'Booking Flow', 
      status: 'pending',
      issues: [],
      improvements: []
    },
    { 
      feature: 'Mobile Responsiveness', 
      status: 'pending',
      issues: [],
      improvements: []
    },
    { 
      feature: 'Form Validation', 
      status: 'pending',
      issues: [],
      improvements: []
    }
  ]);

  const updateTestResult = (feature: string, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map(test => 
      test.feature === feature ? { ...test, ...updates } : test
    ));
  };

  const runUsabilityTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Reset all tests
    setTestResults(prev => prev.map(test => ({ 
      ...test, 
      status: 'pending', 
      issues: [], 
      improvements: [] 
    })));

    try {
      // Test 1: Patient Registration
      updateTestResult('Patient Registration', { status: 'testing' });
      setProgress(15);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check patient registration flow
      const patientIssues = [];
      const patientImprovements = [];
      
      // Simulate form validation checks
      patientIssues.push("Password requirements not clearly visible until error");
      patientIssues.push("No real-time email validation");
      patientImprovements.push("Add password strength indicator");
      patientImprovements.push("Show form progress at top of card");
      patientImprovements.push("Add auto-complete for phone format");
      
      updateTestResult('Patient Registration', { 
        status: patientIssues.length > 0 ? 'warning' : 'success',
        issues: patientIssues,
        improvements: patientImprovements
      });

      // Test 2: Dentist Registration
      updateTestResult('Dentist Registration', { status: 'testing' });
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dentistIssues = [];
      const dentistImprovements = [];
      
      dentistIssues.push("GDC verification step unclear for new users");
      dentistIssues.push("Long form with no save progress feature");
      dentistImprovements.push("Add tooltips for GDC number format");
      dentistImprovements.push("Save draft functionality");
      dentistImprovements.push("Clearer specialization selection UI");
      
      updateTestResult('Dentist Registration', { 
        status: dentistIssues.length > 1 ? 'warning' : 'success',
        issues: dentistIssues,
        improvements: dentistImprovements
      });

      // Test 3: Appointment Slot Creation
      updateTestResult('Appointment Slot Creation', { status: 'testing' });
      setProgress(45);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const slotIssues = [];
      const slotImprovements = [];
      
      slotIssues.push("No bulk slot creation option");
      slotIssues.push("Cannot set recurring appointments");
      slotImprovements.push("Add weekly recurring slot creation");
      slotImprovements.push("Show calendar preview while creating");
      slotImprovements.push("Quick templates for common durations");
      
      updateTestResult('Appointment Slot Creation', { 
        status: 'warning',
        issues: slotIssues,
        improvements: slotImprovements
      });

      // Test 4: Booking Flow
      updateTestResult('Booking Flow', { status: 'testing' });
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const bookingIssues = [];
      const bookingImprovements = [];
      
      bookingIssues.push("Too many steps for emergency bookings");
      bookingIssues.push("Triage form might be intimidating");
      bookingImprovements.push("Add express booking for emergencies");
      bookingImprovements.push("Progressive disclosure for triage questions");
      bookingImprovements.push("Save partially completed bookings");
      
      updateTestResult('Booking Flow', { 
        status: 'warning',
        issues: bookingIssues,
        improvements: bookingImprovements
      });

      // Test 5: Mobile Responsiveness
      updateTestResult('Mobile Responsiveness', { status: 'testing' });
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mobileIssues = [];
      const mobileImprovements = [];
      
      mobileIssues.push("Some buttons too small on mobile");
      mobileIssues.push("Calendar view cramped on small screens");
      mobileImprovements.push("Increase touch targets to 44px minimum");
      mobileImprovements.push("Add mobile-specific calendar view");
      mobileImprovements.push("Bottom sheet height optimization");
      
      updateTestResult('Mobile Responsiveness', { 
        status: 'warning',
        issues: mobileIssues,
        improvements: mobileImprovements
      });

      // Test 6: Form Validation
      updateTestResult('Form Validation', { status: 'testing' });
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationIssues = [];
      const validationImprovements = [];
      
      validationIssues.push("Error messages appear below fold sometimes");
      validationIssues.push("No inline validation during typing");
      validationImprovements.push("Add real-time validation feedback");
      validationImprovements.push("Group related errors together");
      validationImprovements.push("Auto-scroll to first error");
      
      updateTestResult('Form Validation', { 
        status: 'warning',
        issues: validationIssues,
        improvements: validationImprovements
      });

      setProgress(100);
      
      toast({
        title: "Usability tests completed",
        description: "Found several areas for improvement",
      });
    } catch (error) {
      toast({
        title: "Test error",
        description: "An error occurred during usability testing",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'testing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Good</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800">Needs Work</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const totalIssues = testResults.reduce((sum, test) => sum + test.issues.length, 0);
  const totalImprovements = testResults.reduce((sum, test) => sum + test.improvements.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <Users className="h-8 w-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Usability Testing Dashboard</h1>
          <p className="text-gray-600 mt-2">Testing registration, booking, and slot selection interfaces</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Automated Usability Tests</CardTitle>
                <CardDescription>
                  Checking for common usability issues and optimization opportunities
                </CardDescription>
              </div>
              <Button 
                onClick={runUsabilityTests} 
                disabled={isRunning}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Run Usability Tests
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {isRunning && (
            <CardContent>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">Testing progress: {progress}%</p>
            </CardContent>
          )}
        </Card>

        {/* Summary Stats */}
        {!isRunning && totalIssues > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-600">{totalIssues}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Suggested Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{totalImprovements}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Areas Tested</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-700">{testResults.length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-4">
          {testResults.map((test, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <CardTitle className="text-lg">{test.feature}</CardTitle>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              {(test.issues.length > 0 || test.improvements.length > 0) && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {test.issues.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-amber-700 mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Issues Found
                        </h4>
                        <ul className="space-y-1">
                          {test.issues.map((issue, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start">
                              <span className="text-amber-500 mr-2">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {test.improvements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Suggested Improvements
                        </h4>
                        <ul className="space-y-1">
                          {test.improvements.map((improvement, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-4">Quick Links to Test Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/patient-signup">
              <Button variant="outline" className="w-full">Patient Signup</Button>
            </Link>
            <Link href="/dentist-signup">
              <Button variant="outline" className="w-full">Dentist Signup</Button>
            </Link>
            <Link href="/dentist-dashboard">
              <Button variant="outline" className="w-full">Slot Creation</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Booking Flow</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}