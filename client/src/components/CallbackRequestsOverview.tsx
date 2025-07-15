import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Phone, Clock, AlertCircle, CheckCircle, XCircle, User, Calendar, Heart } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface CallbackRequest {
  id: number;
  userId: number;
  practiceId: number;
  appointmentId?: number;
  requestType: string;
  requestReason: string;
  preferredCallTime: string;
  urgency: string;
  status: string;
  callbackNotes?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  appointment?: {
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    treatmentType: string;
  };
  triageAssessment?: {
    id: number;
    painLevel: number;
    painDuration: string;
    symptoms: string;
    swelling: boolean;
    trauma: boolean;
    bleeding: boolean;
    infection: boolean;
    urgencyLevel: string;
    triageNotes: string;
    anxietyLevel: string;
    medicalHistory: string;
    currentMedications: string;
    allergies: string;
    previousDentalTreatment: string;
    smokingStatus: string;
    alcoholConsumption: string;
    pregnancyStatus: string;
  };
}

interface CallbackRequestsOverviewProps {
  practiceId: number;
}

export function CallbackRequestsOverview({ practiceId }: CallbackRequestsOverviewProps) {
  const [selectedRequest, setSelectedRequest] = useState<CallbackRequest | null>(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'complete' | 'cancel'>('complete');

  const queryClient = useQueryClient();

  const { data: todaysRequests = [], isLoading: loadingToday } = useQuery({
    queryKey: ['/api/practice', practiceId, 'callback-requests', 'today'],
    queryFn: async () => {
      const response = await fetch(`/api/practice/${practiceId}/callback-requests/today`);
      if (!response.ok) throw new Error('Failed to fetch today\'s callback requests');
      return response.json();
    }
  });

  const { data: previousRequests = [], isLoading: loadingPrevious } = useQuery({
    queryKey: ['/api/practice', practiceId, 'callback-requests', 'previous', 7],
    queryFn: async () => {
      const response = await fetch(`/api/practice/${practiceId}/callback-requests/previous/7`);
      if (!response.ok) throw new Error('Failed to fetch previous callback requests');
      return response.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: number; status: string; notes?: string }) => {
      return apiRequest(`/api/callback-requests/${requestId}/status`, {
        method: "POST",
        body: JSON.stringify({ status, notes }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Callback request status has been updated successfully.",
      });
      setIsStatusDialogOpen(false);
      setSelectedRequest(null);
      setStatusNotes("");
      queryClient.invalidateQueries({ queryKey: ['/api/practice', practiceId, 'callback-requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update callback request status.",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (status: string) => {
    if (selectedRequest) {
      updateStatusMutation.mutate({
        requestId: selectedRequest.id,
        status,
        notes: statusNotes
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'cancellation': return <Calendar className="h-4 w-4" />;
      case 'availability': return <Clock className="h-4 w-4" />;
      case 'emergency': return <AlertCircle className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const renderCallbackRequest = (request: CallbackRequest) => (
    <div key={request.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-teal-100 text-teal-700">
              {request.user.firstName[0]}{request.user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-gray-900">
              {request.user.firstName} {request.user.lastName}
            </h4>
            <p className="text-sm text-gray-600">{request.user.phone}</p>
            <p className="text-xs text-gray-500">
              Requested {format(new Date(request.createdAt), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getUrgencyColor(request.urgency)}>
            {request.urgency}
          </Badge>
          <Badge className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          {getRequestTypeIcon(request.requestType)}
          <span className="capitalize">{request.requestType}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span className="capitalize">{request.preferredCallTime}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-700">{request.requestReason}</p>
      </div>

      {request.triageAssessment && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Clinical Information</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Pain Level:</span> {request.triageAssessment.painLevel}/10
            </div>
            <div>
              <span className="font-medium">Urgency:</span> {request.triageAssessment.urgencyLevel}
            </div>
            {request.triageAssessment.symptoms && (
              <div className="col-span-2">
                <span className="font-medium">Symptoms:</span> {request.triageAssessment.symptoms}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedRequest(request);
            setActionType('complete');
            setIsStatusDialogOpen(true);
          }}
          disabled={request.status === 'completed' || request.status === 'cancelled'}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Complete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedRequest(request);
            setActionType('cancel');
            setIsStatusDialogOpen(true);
          }}
          disabled={request.status === 'completed' || request.status === 'cancelled'}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );

  if (loadingToday) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-teal-600" />
            Callback Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading callback requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-teal-600" />
            Callback Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Today's Requests */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Today's Requests ({todaysRequests.length})</h3>
              {todaysRequests.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No callback requests for today</p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {todaysRequests.map(renderCallbackRequest)}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Previous Requests */}
            {previousRequests.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Previous 7 Days ({previousRequests.length})</h3>
                <ScrollArea className="h-32">
                  <div className="space-y-3">
                    {previousRequests.map(renderCallbackRequest)}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'complete' ? 'Complete' : 'Cancel'} Callback Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                {actionType === 'complete' 
                  ? 'Mark this callback request as completed. Add any notes about the call.'
                  : 'Cancel this callback request. Please provide a reason for cancellation.'
                }
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder={actionType === 'complete' ? 'Call completed, appointment scheduled...' : 'Reason for cancellation...'}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleStatusUpdate(actionType === 'complete' ? 'completed' : 'cancelled')}
                disabled={updateStatusMutation.isPending}
                className={actionType === 'complete' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
              >
                {updateStatusMutation.isPending ? 'Updating...' : (actionType === 'complete' ? 'Complete' : 'Cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}