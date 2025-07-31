import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Heart,
  Stethoscope,
  Activity,
  Clock,
  CreditCard,
  MessageSquare,
  Filter,
  Download,
  ChevronRight
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface PatientManagementProps {
  practiceId: number;
}

export function PatientManagement({ practiceId }: PatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch all patients with their booking history
  const { data: patients = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/practice/${practiceId}/patients`],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const filteredPatients = patients?.filter((patient: any) => {
    const matchesSearch = searchTerm === "" ||
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === "all" || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getAnxietyColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "moderate": return "bg-amber-100 text-amber-800 border-amber-200";
      case "high": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold">{patients?.length || 0}</p>
              </div>
              <User className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold">
                  {patients?.filter(p => p.status === "active").length || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Spend</p>
                <p className="text-2xl font-bold">£148</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>
            Search and manage your patient records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Patient List */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Total Visits</TableHead>
                  <TableHead>Anxiety Level</TableHead>
                  <TableHead>Medical Alerts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients?.map((patient: any) => (
                  <TableRow 
                    key={patient.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowPatientDetails(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-gray-500">DOB: {format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {patient.email}
                        </p>
                        <p className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {patient.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{format(new Date(patient.lastVisit), 'dd MMM yyyy')}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{patient.totalVisits}</span>
                        <span className="text-sm text-gray-500">(£{patient.totalSpent})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAnxietyColor(patient.anxietyLevel)}>
                        {patient.anxietyLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {patient.medicalAlerts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.medicalAlerts.map((alert: string, index: number) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {alert}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete patient profile and history
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <ScrollArea className="h-[600px] pr-4">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="communications">Communications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Full Name</span>
                          <span className="text-sm font-medium">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Date of Birth</span>
                          <span className="text-sm font-medium">
                            {format(new Date(selectedPatient.dateOfBirth), 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">NHS Number</span>
                          <span className="text-sm font-medium">{selectedPatient.nhsNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email</span>
                          <span className="text-sm font-medium">{selectedPatient.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone</span>
                          <span className="text-sm font-medium">{selectedPatient.phone}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Visit Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Visits</span>
                          <span className="text-sm font-medium">{selectedPatient.totalVisits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Visit</span>
                          <span className="text-sm font-medium">
                            {format(new Date(selectedPatient.lastVisit), 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Spent</span>
                          <span className="text-sm font-medium">£{selectedPatient.totalSpent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Upcoming Appointments</span>
                          <span className="text-sm font-medium">{selectedPatient.upcomingAppointments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Member Since</span>
                          <span className="text-sm font-medium">
                            {format(new Date(selectedPatient.registeredDate), 'MMM yyyy')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      View Records
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="medical">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Medical Alerts</h4>
                          {selectedPatient.medicalAlerts.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedPatient.medicalAlerts.map((alert: string, index: number) => (
                                <Badge key={index} variant="destructive">
                                  {alert}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No medical alerts</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Anxiety Level</h4>
                          <Badge className={getAnxietyColor(selectedPatient.anxietyLevel)}>
                            {selectedPatient.anxietyLevel}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}