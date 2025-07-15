import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { apiRequest } from "../lib/queryClient";

interface PendingBooking {
  id: number;
  userId: number;
  appointmentId: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  appointment: {
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    treatmentType: string;
  };
  triageAssessment: {
    painLevel: number;
    painDuration: string;
    symptoms: string;
    swelling: boolean;
    trauma: boolean;
    bleeding: boolean;
    infection: boolean;
    urgencyLevel: string;
    triageNotes: string;
  };
  status: string;
  approvalStatus: string;
  createdAt: string;
}

interface AppointmentApprovalDashboardProps {
  practiceId: number;
}

export function AppointmentApprovalDashboard({ practiceId }: AppointmentApprovalDashboardProps) {
  const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: pendingBookings = [], isLoading } = useQuery({
    queryKey: ["/api/bookings/pending", practiceId],
    queryFn: () => apiRequest(`/api/bookings/pending/${practiceId}`),
  });

  const approveBookingMutation = useMutation({
    mutationFn: (data: { bookingId: number; approved: boolean; notes: string }) =>
      apiRequest(`/api/bookings/approve`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/pending"] });
      setSelectedBooking(null);
      setApprovalNotes("");
    },
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      default: return "bg-green-500 text-white";
    }
  };

  const handleApprove = (approved: boolean) => {
    if (!selectedBooking) return;
    
    approveBookingMutation.mutate({
      bookingId: selectedBooking.id,
      approved,
      notes: approvalNotes,
    });
  };

  const urgentBookings = pendingBookings.filter((booking: PendingBooking) => 
    booking.triageAssessment.urgencyLevel === "emergency" || booking.triageAssessment.urgencyLevel === "high"
  );

  const routineBookings = pendingBookings.filter((booking: PendingBooking) => 
    booking.triageAssessment.urgencyLevel === "medium" || booking.triageAssessment.urgencyLevel === "low"
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading pending approvals...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="fas fa-clipboard-check text-white text-sm"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold">Appointment Approvals</h3>
              <p className="text-sm text-gray-600">Clinical governance and patient safety review</p>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-4 mt-4">
            <Badge className="bg-red-100 text-red-800">
              {urgentBookings.length} Urgent
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {routineBookings.length} Routine
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="urgent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="urgent" className="flex items-center space-x-2">
            <i className="fas fa-exclamation-triangle text-red-500"></i>
            <span>Urgent ({urgentBookings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="routine" className="flex items-center space-x-2">
            <i className="fas fa-clock text-blue-500"></i>
            <span>Routine ({routineBookings.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="urgent" className="space-y-4">
          {urgentBookings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-600">No urgent approvals pending</h3>
                <p className="text-sm text-gray-500 mt-2">All urgent cases have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            urgentBookings.map((booking: PendingBooking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onReview={() => setSelectedBooking(booking)}
                urgent={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="routine" className="space-y-4">
          {routineBookings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-600">No routine approvals pending</h3>
                <p className="text-sm text-gray-500 mt-2">All routine cases have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            routineBookings.map((booking: PendingBooking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onReview={() => setSelectedBooking(booking)}
                urgent={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <i className="fas fa-user-md text-blue-600"></i>
              <span>Clinical Review & Approval</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contact</p>
                      <p className="text-sm text-gray-600">{selectedBooking.user.email}</p>
                      <p className="text-sm text-gray-600">{selectedBooking.user.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-gray-600">{selectedBooking.user.dateOfBirth}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Appointment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(selectedBooking.appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.appointment.appointmentTime} ({selectedBooking.appointment.duration} minutes)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Treatment Type</p>
                      <p className="text-sm text-gray-600">{selectedBooking.appointment.treatmentType}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <i className="fas fa-stethoscope text-red-600"></i>
                    <span>Clinical Triage Assessment</span>
                    <Badge className={cn("ml-2", getUrgencyColor(selectedBooking.triageAssessment.urgencyLevel))}>
                      {selectedBooking.triageAssessment.urgencyLevel.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Pain Level</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-4 h-4 rounded-full",
                                i < selectedBooking.triageAssessment.painLevel
                                  ? "bg-red-500"
                                  : "bg-gray-200"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {selectedBooking.triageAssessment.painLevel}/10
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-gray-600">{selectedBooking.triageAssessment.painDuration}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Symptoms</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedBooking.triageAssessment.symptoms}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Clinical Indicators</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBooking.triageAssessment.swelling && (
                        <Badge className="bg-orange-100 text-orange-800">Swelling</Badge>
                      )}
                      {selectedBooking.triageAssessment.trauma && (
                        <Badge className="bg-red-100 text-red-800">Trauma</Badge>
                      )}
                      {selectedBooking.triageAssessment.bleeding && (
                        <Badge className="bg-red-100 text-red-800">Bleeding</Badge>
                      )}
                      {selectedBooking.triageAssessment.infection && (
                        <Badge className="bg-yellow-100 text-yellow-800">Infection</Badge>
                      )}
                      {!selectedBooking.triageAssessment.swelling && 
                       !selectedBooking.triageAssessment.trauma && 
                       !selectedBooking.triageAssessment.bleeding && 
                       !selectedBooking.triageAssessment.infection && (
                        <Badge className="bg-green-100 text-green-800">No immediate concerns</Badge>
                      )}
                    </div>
                  </div>

                  {selectedBooking.triageAssessment.triageNotes && (
                    <div>
                      <p className="text-sm font-medium">Additional Notes</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedBooking.triageAssessment.triageNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Clinical Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="approvalNotes">Clinical Notes & Decision Rationale</Label>
                    <Textarea
                      id="approvalNotes"
                      placeholder="Enter your clinical assessment, decision rationale, and any special instructions..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove(false)}
                        disabled={approveBookingMutation.isPending}
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Reject Booking
                      </Button>
                      <Button
                        onClick={() => handleApprove(true)}
                        disabled={approveBookingMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <i className="fas fa-check mr-2"></i>
                        {approveBookingMutation.isPending ? "Processing..." : "Approve Booking"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingCard({ booking, onReview, urgent }: { booking: PendingBooking; onReview: () => void; urgent: boolean }) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      default: return "bg-green-500 text-white";
    }
  };

  return (
    <Card className={cn(urgent ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              urgent ? "bg-red-100" : "bg-blue-100"
            )}>
              <i className={cn(
                "fas fa-user text-lg",
                urgent ? "text-red-600" : "text-blue-600"
              )}></i>
            </div>
            <div>
              <p className="font-medium">
                {booking.user.firstName} {booking.user.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(booking.appointment.appointmentDate), 'MMM d, yyyy')} at {booking.appointment.appointmentTime}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={cn("text-xs", getUrgencyColor(booking.triageAssessment.urgencyLevel))}>
                  {booking.triageAssessment.urgencyLevel.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500">
                  Pain: {booking.triageAssessment.painLevel}/10
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {booking.appointment.treatmentType}
            </Badge>
            <Button
              size="sm"
              onClick={onReview}
              className={cn(
                urgent ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              <i className="fas fa-clipboard-check mr-1"></i>
              Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}