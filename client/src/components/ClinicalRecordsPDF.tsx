import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { format } from "date-fns";

interface ClinicalRecordsData {
  patient: {
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
  practice: {
    name: string;
    address: string;
  };
  dentist: {
    name: string;
    title: string;
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
  clinicalNotes: string;
  approvedBy: string;
  approvedAt: string;
  status: string;
}

interface ClinicalRecordsPDFProps {
  data: ClinicalRecordsData;
  onGeneratePDF: () => void;
}

export function ClinicalRecordsPDF({ data, onGeneratePDF }: ClinicalRecordsPDFProps) {
  const generatePDFContent = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Clinical Record - ${data.patient.firstName} ${data.patient.lastName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; display: inline-block; width: 150px; }
        .urgency-emergency { background-color: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; }
        .urgency-high { background-color: #ea580c; color: white; padding: 2px 8px; border-radius: 4px; }
        .urgency-medium { background-color: #ca8a04; color: white; padding: 2px 8px; border-radius: 4px; }
        .urgency-low { background-color: #16a34a; color: white; padding: 2px 8px; border-radius: 4px; }
        .clinical-indicators { display: flex; gap: 10px; flex-wrap: wrap; }
        .indicator { background-color: #fef3c7; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>DentConnect Clinical Record</h1>
        <p><strong>Practice:</strong> ${data.practice.name}</p>
        <p>${data.practice.address}</p>
        <p><strong>Generated:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
    </div>

    <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="field"><span class="field-label">Name:</span> ${data.patient.firstName} ${data.patient.lastName}</div>
        <div class="field"><span class="field-label">Date of Birth:</span> ${data.patient.dateOfBirth}</div>
        <div class="field"><span class="field-label">Email:</span> ${data.patient.email}</div>
        <div class="field"><span class="field-label">Phone:</span> ${data.patient.phone}</div>
    </div>

    <div class="section">
        <div class="section-title">Appointment Details</div>
        <div class="field"><span class="field-label">Date:</span> ${format(new Date(data.appointment.appointmentDate), 'EEEE, dd MMMM yyyy')}</div>
        <div class="field"><span class="field-label">Time:</span> ${data.appointment.appointmentTime}</div>
        <div class="field"><span class="field-label">Duration:</span> ${data.appointment.duration} minutes</div>
        <div class="field"><span class="field-label">Treatment Type:</span> ${data.appointment.treatmentType}</div>
        <div class="field"><span class="field-label">Clinician:</span> ${data.dentist.title} ${data.dentist.name}</div>
    </div>

    <div class="section">
        <div class="section-title">Clinical Triage Assessment</div>
        <div class="field">
            <span class="field-label">Pain Level:</span> 
            ${data.triageAssessment.painLevel}/10
        </div>
        <div class="field"><span class="field-label">Pain Duration:</span> ${data.triageAssessment.painDuration}</div>
        <div class="field">
            <span class="field-label">Urgency Level:</span> 
            <span class="urgency-${data.triageAssessment.urgencyLevel}">${data.triageAssessment.urgencyLevel.toUpperCase()}</span>
        </div>
        <div class="field">
            <span class="field-label">Symptoms:</span><br>
            ${data.triageAssessment.symptoms}
        </div>
        <div class="field">
            <span class="field-label">Clinical Indicators:</span><br>
            <div class="clinical-indicators">
                ${data.triageAssessment.swelling ? '<span class="indicator">Swelling</span>' : ''}
                ${data.triageAssessment.trauma ? '<span class="indicator">Trauma</span>' : ''}
                ${data.triageAssessment.bleeding ? '<span class="indicator">Bleeding</span>' : ''}
                ${data.triageAssessment.infection ? '<span class="indicator">Infection</span>' : ''}
                ${!data.triageAssessment.swelling && !data.triageAssessment.trauma && !data.triageAssessment.bleeding && !data.triageAssessment.infection ? '<span class="indicator">No immediate concerns</span>' : ''}
            </div>
        </div>
        ${data.triageAssessment.triageNotes ? `
        <div class="field">
            <span class="field-label">Additional Notes:</span><br>
            ${data.triageAssessment.triageNotes}
        </div>
        ` : ''}
    </div>

    <div class="section">
        <div class="section-title">Clinical Decision & Approval</div>
        <div class="field"><span class="field-label">Status:</span> ${data.status}</div>
        <div class="field"><span class="field-label">Approved By:</span> ${data.approvedBy}</div>
        <div class="field"><span class="field-label">Approved At:</span> ${format(new Date(data.approvedAt), 'dd/MM/yyyy HH:mm')}</div>
        <div class="field">
            <span class="field-label">Clinical Notes:</span><br>
            ${data.clinicalNotes}
        </div>
    </div>

    <div class="footer">
        <p><strong>Data Protection Notice:</strong> This document contains personal and health data protected under UK GDPR and must be handled in accordance with clinical governance requirements.</p>
        <p><strong>Retention:</strong> This record will be retained for 10 years in accordance with NHS guidelines and CQC requirements.</p>
        <p><strong>Generated by:</strong> DentConnect Clinical Records System</p>
    </div>
</body>
</html>
    `;
    
    return content;
  };

  const handleGeneratePDF = () => {
    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-record-${data.patient.firstName}-${data.patient.lastName}-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onGeneratePDF();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-file-medical text-blue-600"></i>
          <span>Clinical Record Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Patient</p>
            <p className="text-sm text-gray-600">{data.patient.firstName} {data.patient.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Appointment</p>
            <p className="text-sm text-gray-600">
              {format(new Date(data.appointment.appointmentDate), 'MMM d, yyyy')} at {data.appointment.appointmentTime}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Treatment</p>
            <p className="text-sm text-gray-600">{data.appointment.treatmentType}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Urgency</p>
            <Badge className={`text-xs ${
              data.triageAssessment.urgencyLevel === 'emergency' ? 'bg-red-500 text-white' :
              data.triageAssessment.urgencyLevel === 'high' ? 'bg-orange-500 text-white' :
              data.triageAssessment.urgencyLevel === 'medium' ? 'bg-yellow-500 text-white' :
              'bg-green-500 text-white'
            }`}>
              {data.triageAssessment.urgencyLevel.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            onClick={handleGeneratePDF}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <i className="fas fa-download mr-2"></i>
            Generate Clinical Record PDF
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Compliant with CQC record-keeping requirements
          </p>
        </div>
      </CardContent>
    </Card>
  );
}