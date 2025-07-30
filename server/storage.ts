import { 
  users, practices, treatments, dentists, appointments, bookings, triageAssessments, callbackRequests,
  auditLogs, dataProcessingRecords,
  type User, type InsertUser, type Practice, type InsertPractice,
  type Treatment, type InsertTreatment, type Dentist, type InsertDentist,
  type Appointment, type InsertAppointment,
  type Booking, type InsertBooking, type CallbackRequest, type InsertCallbackRequest,
  type TriageAssessment, type InsertTriageAssessment,
  type AuditLog, type InsertAuditLog, type DataProcessingRecord, type InsertDataProcessingRecord,
  type PracticeWithAppointments, type BookingWithDetails
} from "@shared/schema";
import { hashPassword } from "./auth-utils";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  updateLoginAttempts(email: string, success: boolean, ip: string): Promise<void>;
  
  // Practice operations
  getPractices(): Promise<Practice[]>;
  getPractice(id: number): Promise<Practice | undefined>;
  getPracticeByConnectionTag(connectionTag: string): Promise<Practice | undefined>;
  getPracticesWithAppointments(location?: string): Promise<PracticeWithAppointments[]>;
  
  // Treatment operations
  getTreatments(): Promise<Treatment[]>;
  getTreatmentsByCategory(category: string): Promise<Treatment[]>;
  
  // Dentist operations
  getDentists(): Promise<Dentist[]>;
  getDentistsByPractice(practiceId: number): Promise<Dentist[]>;
  getDentist(id: number): Promise<Dentist | undefined>;
  
  // Appointment operations
  getAvailableAppointments(practiceId: number, date?: Date): Promise<Appointment[]>;
  bookAppointment(appointmentId: number, userId: number): Promise<Appointment>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getPracticeAppointments(practiceId: number): Promise<Appointment[]>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(bookingId: number, updateData: any): Promise<Booking>;
  getUserBookings(userId: number): Promise<BookingWithDetails[]>;
  getPendingBookings(practiceId: number): Promise<any[]>;
  getApprovedBookings(practiceId: number): Promise<any[]>;
  approveBooking(bookingId: number, approvedBy: string): Promise<Booking>;
  rejectBooking(bookingId: number, rejectedBy: string): Promise<Booking>;
  
  // Triage assessment operations
  createTriageAssessment(assessment: InsertTriageAssessment): Promise<TriageAssessment>;
  
  // Callback request operations
  createCallbackRequest(request: InsertCallbackRequest): Promise<CallbackRequest>;
  getCallbackRequests(practiceId: number, date?: Date): Promise<any[]>;
  getTodaysCallbackRequests(practiceId: number): Promise<any[]>;
  getPreviousDaysCallbackRequests(practiceId: number, days: number): Promise<any[]>;
  updateCallbackRequestStatus(requestId: number, status: string, notes?: string): Promise<CallbackRequest>;
  
  // Audit logging operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: { userId?: number; action?: string; resourceType?: string; startDate?: Date; endDate?: Date }): Promise<AuditLog[]>;
  
  // GDPR operations
  exportUserData(userId: number): Promise<any>;
  deleteUserData(userId: number): Promise<void>;
  updateGDPRConsent(userId: number, consent: { gdpr: boolean; marketing: boolean }): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private practices: Map<number, Practice> = new Map();
  private treatments: Map<number, Treatment> = new Map();
  private dentists: Map<number, Dentist> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private bookings: Map<number, Booking> = new Map();
  private triageAssessments: Map<number, TriageAssessment> = new Map();
  private callbackRequests: Map<number, CallbackRequest> = new Map();
  private auditLogs: Map<number, AuditLog> = new Map();
  private dataProcessingRecords: Map<number, DataProcessingRecord> = new Map();
  
  private currentUserId = 1;
  private currentPracticeId = 1;
  private currentTreatmentId = 1;
  private currentDentistId = 1;
  private currentAppointmentId = 1;
  private currentBookingId = 1;
  private currentCallbackRequestId = 1;
  private currentAuditLogId = 1;
  private currentDataProcessingRecordId = 1;

  constructor() {
    this.initializeData();
    this.initializeDemoUsers();
  }

  private async initializeDemoUsers() {
    try {
      // Create demo patient account
      await this.createUser({
        email: 'patient@demo.com',
        password: 'DemoPassword123!',
        firstName: 'Demo',
        lastName: 'Patient',
        phone: '07123456789',
        dateOfBirth: '1985-03-15',
        userType: 'patient',
        nhsNumber: '9434765870',
        gdprConsentGiven: true,
        marketingConsentGiven: false
      });

      // Create demo dentist account (Dr. Richard Thompson)
      await this.createUser({
        email: 'dentist@demo.com',
        password: 'DemoPassword123!',
        firstName: 'Dr. Richard',
        lastName: 'Thompson',
        phone: '0191 232 4567',
        dateOfBirth: '1975-08-20',
        userType: 'dentist',
        gdcNumber: '83457',
        gdprConsentGiven: true,
        marketingConsentGiven: false
      });

      console.log('Demo users initialized successfully');
    } catch (error) {
      console.error('Error initializing demo users:', error);
    }
  }

  private initializeData() {
    // Sample practices with detailed information across Northeast England
    const samplePractices: Practice[] = [
      {
        id: 1,
        name: "Dr. Richard Thompson - Newcastle Dental Excellence",
        address: "15 Grainger Street, Newcastle upon Tyne, NE1 5DQ",
        postcode: "NE1 5DQ",
        latitude: 54.9738,
        longitude: -1.6131,
        phone: "0191 232 4567",
        rating: 4.9,
        reviewCount: 247,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: true,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri: 8:00-18:00, Sat: 9:00-17:00",
        imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        connectionTag: "DEMO",
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Gateshead Smile Studio",
        address: "67 High Street, Gateshead, NE8 1EQ",
        postcode: "NE8 1EQ",
        latitude: 54.9533,
        longitude: -1.6103,
        phone: "0191 987 6543",
        rating: 4.7,
        reviewCount: 142,
        wheelchairAccess: true,
        signLanguage: false,
        visualSupport: true,
        cognitiveSupport: false,
        disabledParking: true,
        openingHours: "Mon-Fri 8:30-17:30, Sat 9:00-13:00",
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Durham Cathedral Dental",
        address: "22 Silver Street, Durham, DH1 3RB",
        postcode: "DH1 3RB",
        latitude: 54.7767,
        longitude: -1.5711,
        phone: "0191 386 2345",
        rating: 4.9,
        reviewCount: 198,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: true,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 9:00-17:00, Sat 9:00-12:00",
        imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 4,
        name: "North Shields Dental Practice",
        address: "89 Bedford Street, North Shields, NE29 0AT",
        postcode: "NE29 0AT",
        latitude: 55.0167,
        longitude: -1.4436,
        phone: "0191 257 8901",
        rating: 4.5,
        reviewCount: 87,
        wheelchairAccess: true,
        signLanguage: false,
        visualSupport: false,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 8:00-18:00, Sat 9:00-13:00",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 5,
        name: "Consett Family Dentistry",
        address: "15 Middle Street, Consett, DH8 5QQ",
        postcode: "DH8 5QQ",
        latitude: 54.8544,
        longitude: -1.8320,
        phone: "01207 234 567",
        rating: 4.6,
        reviewCount: 103,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: true,
        cognitiveSupport: false,
        disabledParking: true,
        openingHours: "Mon-Fri 9:00-17:00, Sat 9:00-12:00",
        imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 6,
        name: "Hexham Dental Care",
        address: "34 Fore Street, Hexham, NE46 1LU",
        postcode: "NE46 1LU",
        latitude: 54.9742,
        longitude: -2.1267,
        phone: "01434 345 678",
        rating: 4.8,
        reviewCount: 156,
        wheelchairAccess: true,
        signLanguage: false,
        visualSupport: true,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 8:30-17:30, Sat 9:00-14:00",
        imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 7,
        name: "Darlington Dental Surgery",
        address: "56 Bondgate, Darlington, DL3 7JJ",
        postcode: "DL3 7JJ",
        latitude: 54.5253,
        longitude: -1.5581,
        phone: "01325 456 789",
        rating: 4.7,
        reviewCount: 211,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: false,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 9:00-18:00, Sat 9:00-13:00",
        imageUrl: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 8,
        name: "Chester-le-Street Dental",
        address: "12 Market Place, Chester-le-Street, DH3 3QF",
        postcode: "DH3 3QF",
        latitude: 54.9200,
        longitude: -1.5800,
        phone: "0191 388 5678",
        rating: 4.4,
        reviewCount: 76,
        wheelchairAccess: true,
        signLanguage: false,
        visualSupport: true,
        cognitiveSupport: false,
        disabledParking: true,
        openingHours: "Mon-Fri 8:00-17:00, Sat 9:00-12:00",
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 9,
        name: "Sunderland City Dental",
        address: "78 Fawcett Street, Sunderland, SR1 1RH",
        postcode: "SR1 1RH",
        latitude: 54.9069,
        longitude: -1.3838,
        phone: "0191 567 8901",
        rating: 4.6,
        reviewCount: 134,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: true,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 8:30-18:00, Sat 9:00-14:00",
        imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 10,
        name: "Middlesbrough Advanced Dentistry",
        address: "78 Linthorpe Road, Middlesbrough, TS1 2AT",
        postcode: "TS1 2AT",
        latitude: 54.5742,
        longitude: -1.2349,
        phone: "01642 456 789",
        rating: 4.9,
        reviewCount: 234,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: true,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 9:00-17:00, Sat 9:00-12:00",
        imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 11,
        name: "Hartlepool Dental Centre",
        address: "45 Church Street, Hartlepool, TS24 7DS",
        postcode: "TS24 7DS",
        latitude: 54.6869,
        longitude: -1.2155,
        phone: "01429 234 567",
        rating: 4.5,
        reviewCount: 92,
        wheelchairAccess: true,
        signLanguage: false,
        visualSupport: true,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 9:00-17:00, Sat 9:00-13:00",
        imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 12,
        name: "Stockton Smile Clinic",
        address: "23 High Street, Stockton-on-Tees, TS18 1SP",
        postcode: "TS18 1SP",
        latitude: 54.5707,
        longitude: -1.3182,
        phone: "01642 345 678",
        rating: 4.7,
        reviewCount: 167,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: false,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 8:00-18:00, Sat 9:00-14:00",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 13,
        name: "Berwick Dental Practice",
        address: "67 Marygate, Berwick-upon-Tweed, TD15 1BA",
        postcode: "TD15 1BA",
        latitude: 55.7707,
        longitude: -2.0107,
        phone: "01289 456 789",
        rating: 4.6,
        reviewCount: 89,
        wheelchairAccess: true,
        signLanguage: false,
        visualSupport: true,
        cognitiveSupport: false,
        disabledParking: true,
        openingHours: "Mon-Fri 9:00-17:00, Sat 9:00-12:00",
        imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 14,
        name: "Whitby Bay Dental",
        address: "89 Park View, Whitley Bay, NE26 2TH",
        postcode: "NE26 2TH",
        latitude: 55.0424,
        longitude: -1.4481,
        phone: "0191 252 3456",
        rating: 4.8,
        reviewCount: 143,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: true,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 8:30-17:30, Sat 9:00-13:00",
        imageUrl: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
      {
        id: 15,
        name: "Tynemouth Dental Surgery",
        address: "34 Front Street, Tynemouth, NE30 4DZ",
        postcode: "NE30 4DZ",
        latitude: 55.0178,
        longitude: -1.4217,
        phone: "0191 257 4567",
        rating: 4.7,
        reviewCount: 156,
        wheelchairAccess: true,
        signLanguage: false,
        visualSupport: true,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 9:00-18:00, Sat 9:00-14:00",
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        connectionTag: null,
        createdAt: new Date(),
      },
    ];

    // Sample treatments
    const sampleTreatments: Treatment[] = [
      { id: 1, name: "Emergency Treatment", category: "emergency", description: "Urgent dental care for severe pain or trauma", duration: 60, price: 150 },
      { id: 2, name: "Tooth Extraction", category: "urgent", description: "Removal of damaged or impacted teeth", duration: 45, price: 120 },
      { id: 3, name: "Dental Filling", category: "urgent", description: "Treatment for cavities and tooth decay", duration: 30, price: 80 },
      { id: 4, name: "Routine Check-up", category: "routine", description: "General dental examination and cleaning", duration: 30, price: 45 },
      { id: 5, name: "Dental Cleaning", category: "routine", description: "Professional teeth cleaning and polishing", duration: 30, price: 40 },
      { id: 6, name: "Teeth Whitening", category: "cosmetic", description: "Professional whitening treatment", duration: 90, price: 300 },
      { id: 7, name: "Dental Veneers", category: "cosmetic", description: "Cosmetic improvement of tooth appearance", duration: 120, price: 800 },
    ];

    // Sample dentists - 5 specialists
    const sampleDentists: Dentist[] = [
      // Newcastle Dental Centre dentists
      {
        id: 1,
        practiceId: 1,
        name: "Richard Thompson",
        title: "Dr.",
        specialization: "General Dentistry & Emergency Care",
        experience: 15,
        qualifications: "BDS (Newcastle), MFDS RCS (Eng), Royal College Undergraduate Award 2025",
        imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Thompson is the principal dentist with expertise in emergency dental care and advanced restorative procedures. Winner of the Royal College of Surgeons Undergraduate Award 2025.",
        languages: JSON.stringify(["English", "Spanish"]),
        availableDays: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
        createdAt: new Date(),
      },
      {
        id: 2,
        practiceId: 1,
        name: "Sarah Johnson",
        title: "Dr.",
        specialization: "Pediatric Dentistry & Family Care",
        experience: 12,
        qualifications: "BDS (Newcastle), MSc Paediatric Dentistry, MFDS RCS (Eng)",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Johnson specializes in pediatric dentistry and anxiety-free dental care for children and families. She creates a calm, nurturing environment for young patients.",
        languages: JSON.stringify(["English", "French"]),
        availableDays: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
        createdAt: new Date(),
      },
      {
        id: 3,
        practiceId: 1,
        name: "Michael Chen",
        title: "Dr.",
        specialization: "Cosmetic Dentistry & Smile Design",
        experience: 18,
        qualifications: "BDS (King's College London), MSc Aesthetic Dentistry, FFGDP (UK)",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Chen is our lead cosmetic specialist, renowned for creating stunning smile transformations using the latest aesthetic techniques and digital smile design technology.",
        languages: JSON.stringify(["English", "Mandarin", "Cantonese"]),
        availableDays: JSON.stringify(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
        createdAt: new Date(),
      },
      {
        id: 4,
        practiceId: 1,
        name: "Emily Rodriguez",
        title: "Dr.",
        specialization: "Oral Surgery & Implantology",
        experience: 14,
        qualifications: "BDS (Manchester), FDS RCS (Oral Surgery), Diploma in Implant Dentistry",
        imageUrl: "https://images.unsplash.com/photo-1594824694996-aec4a6f4ed73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Rodriguez specializes in complex oral surgery procedures and dental implants, providing comprehensive surgical solutions with a focus on patient comfort and optimal outcomes.",
        languages: JSON.stringify(["English", "Spanish", "Portuguese"]),
        availableDays: JSON.stringify(["Monday", "Wednesday", "Thursday", "Friday"]),
        createdAt: new Date(),
      },
      {
        id: 5,
        practiceId: 1,
        name: "James Wilson",
        title: "Dr.",
        specialization: "Endodontics & Root Canal Therapy",
        experience: 16,
        qualifications: "BDS (Edinburgh), MSc Endodontology, MEndo RCS (Ed)",
        imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Wilson is our endodontic specialist, expert in root canal treatments and saving natural teeth. He uses advanced microscopy and digital techniques for precise treatment.",
        languages: JSON.stringify(["English", "German"]),
        availableDays: JSON.stringify(["Monday", "Tuesday", "Thursday", "Friday"]),
        createdAt: new Date(),
      },
    ];

    // Sample appointments for today with dentist assignments
    const today = new Date();
    const sampleAppointments: Appointment[] = [
      { id: 1, practiceId: 1, dentistId: 1, userId: null, treatmentId: 4, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), appointmentTime: "09:00", duration: 30, treatmentType: "emergency", status: "available", createdAt: new Date() },
      { id: 2, practiceId: 1, dentistId: 1, userId: null, treatmentId: 4, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0), appointmentTime: "11:00", duration: 30, treatmentType: "emergency", status: "available", createdAt: new Date() },
      { id: 3, practiceId: 1, dentistId: 2, userId: null, treatmentId: 4, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), appointmentTime: "14:00", duration: 30, treatmentType: "emergency", status: "available", createdAt: new Date() },
      { id: 4, practiceId: 1, dentistId: 2, userId: null, treatmentId: 4, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), appointmentTime: "16:00", duration: 30, treatmentType: "emergency", status: "available", createdAt: new Date() },
      { id: 5, practiceId: 2, dentistId: 31, userId: null, treatmentId: 3, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), appointmentTime: "10:00", duration: 45, treatmentType: "root-canal", status: "available", createdAt: new Date() },
      { id: 6, practiceId: 2, dentistId: 32, userId: null, treatmentId: 3, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), appointmentTime: "15:00", duration: 45, treatmentType: "root-canal", status: "available", createdAt: new Date() },
      { id: 7, practiceId: 3, dentistId: 33, userId: null, treatmentId: 1, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30), appointmentTime: "09:30", duration: 30, treatmentType: "check-up", status: "available", createdAt: new Date() },
      { id: 8, practiceId: 3, dentistId: 34, userId: null, treatmentId: 2, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0), appointmentTime: "13:00", duration: 60, treatmentType: "cleaning", status: "available", createdAt: new Date() },
    ];

    // Initialize data
    samplePractices.forEach(practice => {
      this.practices.set(practice.id, practice);
      this.currentPracticeId = Math.max(this.currentPracticeId, practice.id + 1);
    });

    sampleTreatments.forEach(treatment => {
      this.treatments.set(treatment.id, treatment);
      this.currentTreatmentId = Math.max(this.currentTreatmentId, treatment.id + 1);
    });

    sampleDentists.forEach(dentist => {
      this.dentists.set(dentist.id, dentist);
      this.currentDentistId = Math.max(this.currentDentistId, dentist.id + 1);
    });

    sampleAppointments.forEach(appointment => {
      this.appointments.set(appointment.id, appointment);
      this.currentAppointmentId = Math.max(this.currentAppointmentId, appointment.id + 1);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser & { password: string }): Promise<User> {
    // Hash the password before storing
    const passwordHash = await hashPassword(insertUser.password);
    
    // Set GDPR data retention date (2 years from signup)
    const dataRetentionDate = new Date();
    dataRetentionDate.setFullYear(dataRetentionDate.getFullYear() + 2);
    
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      phone: insertUser.phone || null,
      dateOfBirth: insertUser.dateOfBirth || null,
      userType: insertUser.userType || 'patient',
      nhsNumber: insertUser.nhsNumber || null,
      gdcNumber: insertUser.gdcNumber || null,
      emailVerified: false,
      emailVerificationToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      twoFactorSecret: null,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastLoginAt: null,
      lastLoginIp: null,
      gdprConsentGiven: insertUser.gdprConsentGiven || false,
      gdprConsentDate: insertUser.gdprConsentGiven ? new Date() : null,
      marketingConsentGiven: insertUser.marketingConsentGiven || false,
      marketingConsentDate: insertUser.marketingConsentGiven ? new Date() : null,
      dataRetentionDate: dataRetentionDate,
      dataExportRequested: false,
      dataExportRequestedAt: null,
      accountDeletionRequested: false,
      accountDeletionRequestedAt: null,
      emergencyContact: insertUser.emergencyContact || null,
      medicalConditions: insertUser.medicalConditions || null,
      medications: insertUser.medications || null,
      allergies: insertUser.allergies || null,
    };
    
    // Remove password from user object before storing
    const { password, ...userWithoutPassword } = insertUser;
    
    this.users.set(user.id, user);
    return user;
  }

  async getPractices(): Promise<Practice[]> {
    return Array.from(this.practices.values());
  }

  async getPractice(id: number): Promise<Practice | undefined> {
    return this.practices.get(id);
  }

  async getPracticeByConnectionTag(connectionTag: string): Promise<Practice | undefined> {
    return Array.from(this.practices.values()).find(practice => practice.connectionTag === connectionTag);
  }

  async getPracticesWithAppointments(location?: string): Promise<PracticeWithAppointments[]> {
    const practices = Array.from(this.practices.values());
    return practices.map(practice => ({
      ...practice,
      availableAppointments: Array.from(this.appointments.values()).filter(
        appointment => appointment.practiceId === practice.id && appointment.status === "available"
      ),
    }));
  }

  async getTreatments(): Promise<Treatment[]> {
    return Array.from(this.treatments.values());
  }

  async getTreatmentsByCategory(category: string): Promise<Treatment[]> {
    return Array.from(this.treatments.values()).filter(treatment => treatment.category === category);
  }

  async getDentists(): Promise<Dentist[]> {
    return Array.from(this.dentists.values());
  }

  async getDentistsByPractice(practiceId: number): Promise<Dentist[]> {
    return Array.from(this.dentists.values()).filter(dentist => dentist.practiceId === practiceId);
  }

  async getDentist(id: number): Promise<Dentist | undefined> {
    return this.dentists.get(id);
  }

  async getAvailableAppointments(practiceId: number, date?: Date): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => 
        appointment.practiceId === practiceId && 
        appointment.status === "available" &&
        (!date || appointment.appointmentDate.toDateString() === date.toDateString())
    );
  }

  async bookAppointment(appointmentId: number, userId: number): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    if (appointment.status !== "available") {
      throw new Error("Appointment not available");
    }
    
    const updatedAppointment = {
      ...appointment,
      userId,
      status: "booked" as const,
    };
    
    this.appointments.set(appointmentId, updatedAppointment);
    return updatedAppointment;
  }

  async createBooking(insertBooking: any): Promise<Booking> {
    const booking: Booking = {
      id: this.currentBookingId++,
      userId: insertBooking.userId,
      appointmentId: insertBooking.appointmentId,
      triageAssessmentId: insertBooking.triageAssessmentId || null,
      treatmentCategory: insertBooking.treatmentCategory,
      accessibilityNeeds: insertBooking.accessibilityNeeds || null,
      medications: insertBooking.medications || null,
      allergies: insertBooking.allergies || null,
      lastDentalVisit: insertBooking.lastDentalVisit || null,
      anxietyLevel: insertBooking.anxietyLevel || null,
      specialRequests: insertBooking.specialRequests || null,
      status: insertBooking.status || 'pending_approval',
      approvalStatus: insertBooking.approvalStatus || 'pending',
      approvedBy: undefined,
      approvedAt: undefined,
      rejectedBy: undefined,
      rejectedAt: undefined,
      createdAt: new Date(),
      updatedAt: undefined
    };
    
    console.log(`[MemStorage] Creating booking with status: ${booking.status}`);
    console.log(`[MemStorage] Full booking data including medical fields:`, booking);
    
    this.bookings.set(booking.id, booking);
    return booking;
  }

  async updateBooking(bookingId: number, updateData: any): Promise<Booking> {
    const existingBooking = this.bookings.get(bookingId);
    if (!existingBooking) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }
    
    const updatedBooking: Booking = {
      ...existingBooking,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }

  async getUserBookings(userId: number): Promise<BookingWithDetails[]> {
    const userBookings = Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
    
    return userBookings.map(booking => {
      const appointment = this.appointments.get(booking.appointmentId);
      const practice = appointment ? this.practices.get(appointment.practiceId) : undefined;
      const treatment = appointment ? this.treatments.get(appointment.treatmentId) : undefined;
      
      return {
        ...booking,
        practice: practice!,
        appointment: appointment!,
        treatment: treatment!,
      };
    });
  }

  async getPendingBookings(practiceId: number): Promise<any[]> {
    console.log(`[MemStorage] Getting pending bookings for practice ${practiceId}`);
    console.log(`[MemStorage] Total bookings in storage: ${this.bookings.size}`);
    console.log(`[MemStorage] All bookings:`, Array.from(this.bookings.values()));
    
    const practiceBookings = Array.from(this.bookings.values())
      .filter(booking => {
        const appointment = this.appointments.get(booking.appointmentId);
        console.log(`[MemStorage] Checking booking ${booking.id}: appointment=${appointment?.id}, practiceId=${appointment?.practiceId}, approvalStatus=${booking.approvalStatus}`);
        return appointment && appointment.practiceId === practiceId && booking.approvalStatus === 'pending';
      });
    
    console.log(`[MemStorage] Found ${practiceBookings.length} practice bookings for practice ${practiceId}`);
    console.log(`[MemStorage] Practice bookings:`, practiceBookings);
    
    return practiceBookings.map(booking => {
      const user = this.users.get(booking.userId);
      const appointment = this.appointments.get(booking.appointmentId);
      const triageAssessment = booking.triageAssessmentId ? 
        this.triageAssessments.get(booking.triageAssessmentId) : null;
      
      return {
        id: booking.id,
        userId: booking.userId,
        appointmentId: booking.appointmentId,
        triageAssessmentId: booking.triageAssessmentId,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth
        } : {
          firstName: 'Test',
          lastName: 'Patient',
          email: 'test@example.com',
          phone: '07700 900123',
          dateOfBirth: '1990-01-01'
        },
        appointment: appointment ? {
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          duration: appointment.duration,
          treatmentType: appointment.treatmentType
        } : null,
        triageAssessment: triageAssessment ? {
          id: triageAssessment.id,
          painLevel: triageAssessment.painLevel,
          painDuration: triageAssessment.painDuration,
          symptoms: triageAssessment.symptoms,
          swelling: triageAssessment.swelling,
          trauma: triageAssessment.trauma,
          bleeding: triageAssessment.bleeding,
          infection: triageAssessment.infection,
          urgencyLevel: triageAssessment.urgencyLevel,
          triageNotes: triageAssessment.triageNotes,
          anxietyLevel: triageAssessment.anxietyLevel,
          medicalHistory: triageAssessment.medicalHistory,
          currentMedications: triageAssessment.currentMedications,
          allergies: triageAssessment.allergies,
          previousDentalTreatment: triageAssessment.previousDentalTreatment,
          smokingStatus: triageAssessment.smokingStatus,
          alcoholConsumption: triageAssessment.alcoholConsumption,
          pregnancyStatus: triageAssessment.pregnancyStatus
        } : null,
        status: booking.status,
        approvalStatus: booking.approvalStatus,
        createdAt: booking.createdAt,
        specialRequests: booking.specialRequests,
        treatmentCategory: booking.treatmentCategory,
        accessibilityNeeds: booking.accessibilityNeeds,
        medications: booking.medications,
        allergies: booking.allergies,
        lastDentalVisit: booking.lastDentalVisit,
        anxietyLevel: booking.anxietyLevel
      };
    });
  }

  async getApprovedBookings(practiceId: number): Promise<any[]> {
    const practiceBookings = Array.from(this.bookings.values())
      .filter(booking => {
        const appointment = this.appointments.get(booking.appointmentId);
        return appointment && appointment.practiceId === practiceId && booking.approvalStatus === 'approved';
      });
    
    return practiceBookings.map(booking => {
      const user = this.users.get(booking.userId);
      const appointment = this.appointments.get(booking.appointmentId);
      const triageAssessment = booking.triageAssessmentId ? 
        this.triageAssessments.get(booking.triageAssessmentId) : null;
      
      console.log(`[MemStorage] APPROVED: Looking for triage assessment ${booking.triageAssessmentId}`);
      console.log(`[MemStorage] APPROVED: Found triage assessment:`, triageAssessment);
      console.log(`[MemStorage] APPROVED: All triage assessments:`, Array.from(this.triageAssessments.keys()));
      
      return {
        id: booking.id,
        userId: booking.userId,
        appointmentId: booking.appointmentId,
        triageAssessmentId: booking.triageAssessmentId,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth
        } : null,
        appointment: appointment ? {
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          duration: appointment.duration,
          treatmentType: appointment.treatmentType
        } : null,
        triageAssessment: triageAssessment ? {
          id: triageAssessment.id,
          painLevel: triageAssessment.painLevel,
          painDuration: triageAssessment.painDuration,
          symptoms: triageAssessment.symptoms,
          swelling: triageAssessment.swelling,
          trauma: triageAssessment.trauma,
          bleeding: triageAssessment.bleeding,
          infection: triageAssessment.infection,
          urgencyLevel: triageAssessment.urgencyLevel,
          triageNotes: triageAssessment.triageNotes,
          anxietyLevel: triageAssessment.anxietyLevel,
          medicalHistory: triageAssessment.medicalHistory,
          currentMedications: triageAssessment.currentMedications,
          allergies: triageAssessment.allergies,
          previousDentalTreatment: triageAssessment.previousDentalTreatment,
          smokingStatus: triageAssessment.smokingStatus,
          alcoholConsumption: triageAssessment.alcoholConsumption,
          pregnancyStatus: triageAssessment.pregnancyStatus
        } : null,
        status: booking.status,
        approvalStatus: booking.approvalStatus,
        approvedAt: booking.approvedAt,
        createdAt: booking.createdAt,
        specialRequests: booking.specialRequests,
        treatmentCategory: booking.treatmentCategory,
        accessibilityNeeds: booking.accessibilityNeeds,
        medications: booking.medications,
        allergies: booking.allergies,
        lastDentalVisit: booking.lastDentalVisit,
        anxietyLevel: booking.anxietyLevel
      };
    });
  }

  async getPracticeAppointments(practiceId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.practiceId === practiceId);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointment: Appointment = {
      id: this.currentAppointmentId++,
      practiceId: insertAppointment.practiceId,
      dentistId: insertAppointment.dentistId,
      userId: insertAppointment.userId || null,
      treatmentId: insertAppointment.treatmentId,
      appointmentDate: insertAppointment.appointmentDate,
      appointmentTime: insertAppointment.appointmentTime,
      duration: insertAppointment.duration,
      treatmentType: insertAppointment.treatmentType,
      status: insertAppointment.status || 'available',
        createdAt: new Date(),
    };
    
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async createTriageAssessment(insertAssessment: InsertTriageAssessment): Promise<TriageAssessment> {
    const assessment: TriageAssessment = {
      ...insertAssessment,
      id: Date.now(), // Simple ID generation
      createdAt: new Date(),
    };
    
    // Store the assessment in memory
    this.triageAssessments.set(assessment.id, assessment);
    
    return assessment;
  }

  async approveBooking(bookingId: number, approvedBy: string): Promise<Booking> {
    const existingBooking = this.bookings.get(bookingId);
    if (!existingBooking) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }
    
    const updatedBooking: Booking = {
      ...existingBooking,
      approvalStatus: 'approved',
      approvedBy: approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.bookings.set(bookingId, updatedBooking);
    console.log(`[MemStorage] Approved booking ${bookingId} by ${approvedBy}`);
    return updatedBooking;
  }

  async rejectBooking(bookingId: number, rejectedBy: string): Promise<Booking> {
    const existingBooking = this.bookings.get(bookingId);
    if (!existingBooking) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }
    
    const updatedBooking: Booking = {
      ...existingBooking,
      approvalStatus: 'rejected',
      rejectedBy: rejectedBy,
      rejectedAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.bookings.set(bookingId, updatedBooking);
    console.log(`[MemStorage] Rejected booking ${bookingId} by ${rejectedBy}`);
    return updatedBooking;
  }

  // Callback request methods
  async createCallbackRequest(insertRequest: InsertCallbackRequest): Promise<CallbackRequest> {
    const request: CallbackRequest = {
      ...insertRequest,
      id: this.currentCallbackRequestId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertRequest.status || 'pending',
      callbackNotes: insertRequest.callbackNotes || null,
      triageAssessmentId: insertRequest.triageAssessmentId || null,
    };
    this.callbackRequests.set(request.id, request);
    return request;
  }

  async getCallbackRequests(practiceId: number, date?: Date): Promise<any[]> {
    const requests = Array.from(this.callbackRequests.values())
      .filter(request => request.practiceId === practiceId);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return requests.filter(request => 
        request.createdAt >= startOfDay && request.createdAt <= endOfDay
      ).map(request => this.enrichCallbackRequest(request));
    }
    
    return requests.map(request => this.enrichCallbackRequest(request));
  }

  async getTodaysCallbackRequests(practiceId: number): Promise<any[]> {
    const today = new Date();
    return this.getCallbackRequests(practiceId, today);
  }

  async getPreviousDaysCallbackRequests(practiceId: number, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);  
    startDate.setHours(0, 0, 0, 0);
    
    const requests = Array.from(this.callbackRequests.values())
      .filter(request => 
        request.practiceId === practiceId && 
        request.createdAt >= startDate
      );
    
    return requests.map(request => this.enrichCallbackRequest(request));
  }

  async updateCallbackRequestStatus(requestId: number, status: string, notes?: string): Promise<CallbackRequest> {
    const request = this.callbackRequests.get(requestId);
    if (!request) {
      throw new Error(`Callback request with ID ${requestId} not found`);
    }
    
    const updatedRequest: CallbackRequest = {
      ...request,
      status,
      callbackNotes: notes || request.callbackNotes,
      updatedAt: new Date(),
    };
    
    this.callbackRequests.set(requestId, updatedRequest);
    return updatedRequest;
  }

  private enrichCallbackRequest(request: CallbackRequest): any {
    const user = this.users.get(request.userId);
    const appointment = request.appointmentId ? this.appointments.get(request.appointmentId) : null;
    const triageAssessment = request.triageAssessmentId ? this.triageAssessments.get(request.triageAssessmentId) : null;
    
    return {
      ...request,
      user: user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
      } : null,
      appointment: appointment ? {
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        duration: appointment.duration,
        treatmentType: appointment.treatmentType,
      } : null,
      triageAssessment: triageAssessment || null,
    };
  }

  // New authentication and security methods
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    // Check if account is locked
    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      return null;
    }
    
    // Verify password
    const { verifyPassword } = await import('./auth-utils');
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) return null;
    
    return user;
  }

  async updateLoginAttempts(email: string, success: boolean, ip: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) return;
    
    if (success) {
      // Reset failed attempts on successful login
      await this.updateUser(user.id, {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip
      });
    } else {
      // Increment failed attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const updates: Partial<User> = {
        failedLoginAttempts: failedAttempts
      };
      
      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const { calculateLockoutTime } = await import('./auth-utils');
        updates.accountLockedUntil = calculateLockoutTime();
      }
      
      await this.updateUser(user.id, updates);
    }
  }

  // Audit logging
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const auditLog: AuditLog = {
      ...log,
      id: this.currentAuditLogId++,
      createdAt: log.createdAt || new Date()
    };
    
    this.auditLogs.set(auditLog.id, auditLog);
    return auditLog;
  }

  async getAuditLogs(filters?: { 
    userId?: number; 
    action?: string; 
    resourceType?: string; 
    startDate?: Date; 
    endDate?: Date 
  }): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    
    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.resourceType) {
        logs = logs.filter(log => log.resourceType === filters.resourceType);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.createdAt <= filters.endDate!);
      }
    }
    
    return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // GDPR compliance methods
  async exportUserData(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    // Collect all user data
    const userData = {
      personalInfo: user,
      bookings: await this.getUserBookings(userId),
      appointments: Array.from(this.appointments.values()).filter(a => a.userId === userId),
      triageAssessments: Array.from(this.triageAssessments.values()).filter(t => t.userId === userId),
      callbackRequests: Array.from(this.callbackRequests.values()).filter(c => c.userId === userId),
      auditLogs: Array.from(this.auditLogs.values()).filter(a => a.userId === userId),
      exportedAt: new Date()
    };
    
    // Mark data export as requested
    await this.updateUser(userId, {
      dataExportRequested: true,
      dataExportRequestedAt: new Date()
    });
    
    return userData;
  }

  async deleteUserData(userId: number): Promise<void> {
    // Mark for deletion rather than immediate deletion (soft delete)
    await this.updateUser(userId, {
      accountDeletionRequested: true,
      accountDeletionRequestedAt: new Date()
    });
    
    // In production, this would schedule deletion after 30 days
    // For demo, we'll just mark it as requested
  }

  async updateGDPRConsent(userId: number, consent: { gdpr: boolean; marketing: boolean }): Promise<User> {
    const updates: Partial<User> = {
      gdprConsentGiven: consent.gdpr,
      gdprConsentDate: consent.gdpr ? new Date() : null,
      marketingConsentGiven: consent.marketing,
      marketingConsentDate: consent.marketing ? new Date() : null
    };
    
    if (consent.gdpr) {
      // Reset data retention date when consent is given
      const retentionDate = new Date();
      retentionDate.setFullYear(retentionDate.getFullYear() + 2);
      updates.dataRetentionDate = retentionDate;
    }
    
    return this.updateUser(userId, updates);
  }

  async getPracticeAppointments(practiceId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.practiceId === practiceId
    );
  }
}

import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPractices(): Promise<Practice[]> {
    return await db.select().from(practices);
  }

  async getPractice(id: number): Promise<Practice | undefined> {
    const [practice] = await db.select().from(practices).where(eq(practices.id, id));
    return practice || undefined;
  }

  async getPracticeByConnectionTag(connectionTag: string): Promise<Practice | undefined> {
    const [practice] = await db.select().from(practices).where(eq(practices.connectionTag, connectionTag));
    return practice || undefined;
  }

  async getPracticesWithAppointments(location?: string): Promise<PracticeWithAppointments[]> {
    const allPractices = await db.select().from(practices);
    const allAppointments = await db.select().from(appointments);
    const allDentists = await db.select().from(dentists);
    
    return allPractices.map(practice => {
      const availableAppointments = allAppointments.filter(
        apt => apt.practiceId === practice.id && apt.status === 'available'
      );
      const practiceDentists = allDentists.filter(
        dentist => dentist.practiceId === practice.id
      );
      
      return {
        ...practice,
        availableAppointments,
        dentists: practiceDentists
      };
    });
  }

  async getTreatments(): Promise<Treatment[]> {
    return await db.select().from(treatments);
  }

  async getTreatmentsByCategory(category: string): Promise<Treatment[]> {
    return await db.select().from(treatments).where(eq(treatments.category, category));
  }

  async getDentists(): Promise<Dentist[]> {
    return await db.select().from(dentists);
  }

  async getDentistsByPractice(practiceId: number): Promise<Dentist[]> {
    return await db.select().from(dentists).where(eq(dentists.practiceId, practiceId));
  }

  async getDentist(id: number): Promise<Dentist | undefined> {
    const [dentist] = await db.select().from(dentists).where(eq(dentists.id, id));
    return dentist || undefined;
  }

  async getAvailableAppointments(practiceId: number, date?: Date): Promise<Appointment[]> {
    return await db.select().from(appointments).where(
      and(
        eq(appointments.practiceId, practiceId),
        eq(appointments.status, 'available')
      )
    );
  }

  async bookAppointment(appointmentId: number, userId: number): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ status: 'booked' })
      .where(eq(appointments.id, appointmentId))
      .returning();
    return appointment;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBooking(bookingId: number, updateData: any): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))
      .returning();
    return booking;
  }

  async getUserBookings(userId: number): Promise<BookingWithDetails[]> {
    const userBookings = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        appointmentId: bookings.appointmentId,
        triageAssessmentId: bookings.triageAssessmentId,
        treatmentCategory: bookings.treatmentCategory,
        accessibilityNeeds: bookings.accessibilityNeeds,
        medications: bookings.medications,
        allergies: bookings.allergies,
        lastDentalVisit: bookings.lastDentalVisit,
        anxietyLevel: bookings.anxietyLevel,
        specialRequests: bookings.specialRequests,
        status: bookings.status,
        approvalStatus: bookings.approvalStatus,
        approvedBy: bookings.approvedBy,
        approvedAt: bookings.approvedAt,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        // User details
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userPhone: users.phone,
        userDateOfBirth: users.dateOfBirth,
        // Appointment details
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        appointmentDuration: appointments.duration,
        appointmentTreatmentType: appointments.treatmentType,
        appointmentStatus: appointments.status,
        // Practice details
        practiceId: practices.id,
        practiceName: practices.name,
        practiceAddress: practices.address,
        practicePhone: practices.phone,
        practicePostcode: practices.postcode,
        practiceLatitude: practices.latitude,
        practiceLongitude: practices.longitude,
        // Treatment details
        treatmentId: treatments.id,
        treatmentName: treatments.name,
        treatmentCategory: treatments.category,
        treatmentPrice: treatments.price,
        treatmentDescription: treatments.description
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(appointments, eq(bookings.appointmentId, appointments.id))
      .innerJoin(practices, eq(appointments.practiceId, practices.id))
      .innerJoin(treatments, eq(appointments.treatmentId, treatments.id))
      .where(eq(bookings.userId, userId))
      .orderBy(bookings.createdAt);

    // Transform the results to match the expected structure
    return userBookings.map(booking => ({
      id: booking.id,
      userId: booking.userId,
      appointmentId: booking.appointmentId,
      triageAssessmentId: booking.triageAssessmentId,
      treatmentCategory: booking.treatmentCategory,
      accessibilityNeeds: booking.accessibilityNeeds,
      medications: booking.medications,
      allergies: booking.allergies,
      lastDentalVisit: booking.lastDentalVisit,
      anxietyLevel: booking.anxietyLevel,
      specialRequests: booking.specialRequests,
      status: booking.status,
      approvalStatus: booking.approvalStatus,
      approvedBy: booking.approvedBy,
      approvedAt: booking.approvedAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      practice: {
        id: booking.practiceId,
        name: booking.practiceName,
        address: booking.practiceAddress,
        phone: booking.practicePhone,
        postcode: booking.practicePostcode,
        latitude: booking.practiceLatitude,
        longitude: booking.practiceLongitude
      },
      appointment: {
        id: booking.appointmentId,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        duration: booking.appointmentDuration,
        treatmentType: booking.appointmentTreatmentType,
        status: booking.appointmentStatus
      },
      treatment: {
        id: booking.treatmentId,
        name: booking.treatmentName,
        category: booking.treatmentCategory,
        price: booking.treatmentPrice,
        description: booking.treatmentDescription
      },
      user: {
        firstName: booking.userFirstName,
        lastName: booking.userLastName,
        email: booking.userEmail,
        phone: booking.userPhone,
        dateOfBirth: booking.userDateOfBirth
      }
    }));
  }

  async getApprovedBookings(practiceId: number): Promise<any[]> {
    const bookingsQuery = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        appointmentId: bookings.appointmentId,
        triageAssessmentId: bookings.triageAssessmentId,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userPhone: users.phone,
        userDateOfBirth: users.dateOfBirth,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        duration: appointments.duration,
        treatmentType: appointments.treatmentType,
        status: bookings.status,
        approvalStatus: bookings.approvalStatus,
        approvedAt: bookings.approvedAt,
        createdAt: bookings.createdAt,
        specialRequests: bookings.specialRequests,
        treatmentCategory: bookings.treatmentCategory,
        accessibilityNeeds: bookings.accessibilityNeeds,
        medications: bookings.medications,
        allergies: bookings.allergies,
        lastDentalVisit: bookings.lastDentalVisit,
        anxietyLevel: bookings.anxietyLevel,
        // Triage assessment details
        triagePainLevel: triageAssessments.painLevel,
        triagePainDuration: triageAssessments.painDuration,
        triageSymptoms: triageAssessments.symptoms,
        triageSwelling: triageAssessments.swelling,
        triageTrauma: triageAssessments.trauma,
        triageBleeding: triageAssessments.bleeding,
        triageInfection: triageAssessments.infection,
        triageUrgencyLevel: triageAssessments.urgencyLevel,
        triageNotes: triageAssessments.triageNotes,
        triageAnxietyLevel: triageAssessments.anxietyLevel,
        triageMedicalHistory: triageAssessments.medicalHistory,
        triageCurrentMedications: triageAssessments.currentMedications,
        triageAllergies: triageAssessments.allergies,
        triagePreviousDentalTreatment: triageAssessments.previousDentalTreatment,
        triageSmokingStatus: triageAssessments.smokingStatus,
        triageAlcoholConsumption: triageAssessments.alcoholConsumption,
        triagePregnancyStatus: triageAssessments.pregnancyStatus
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(appointments, eq(bookings.appointmentId, appointments.id))
      .leftJoin(triageAssessments, eq(bookings.triageAssessmentId, triageAssessments.id))
      .where(and(
        eq(appointments.practiceId, practiceId),
        eq(bookings.approvalStatus, 'approved')
      ))
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);

    return bookingsQuery.map(row => ({
      id: row.id,
      userId: row.userId,
      appointmentId: row.appointmentId,
      user: {
        firstName: row.userFirstName,
        lastName: row.userLastName,
        email: row.userEmail,
        phone: row.userPhone,
        dateOfBirth: row.userDateOfBirth
      },
      appointment: {
        appointmentDate: row.appointmentDate,
        appointmentTime: row.appointmentTime,
        duration: row.duration,
        treatmentType: row.treatmentType
      },
      status: row.status,
      approvalStatus: row.approvalStatus,
      approvedAt: row.approvedAt,
      createdAt: row.createdAt,
      specialRequests: row.specialRequests,
      treatmentCategory: row.treatmentCategory,
      accessibilityNeeds: row.accessibilityNeeds,
      medications: row.medications,
      allergies: row.allergies,
      lastDentalVisit: row.lastDentalVisit,
      anxietyLevel: row.anxietyLevel,
      triageAssessment: row.triageAssessmentId ? {
        id: row.triageAssessmentId,
        painLevel: row.triagePainLevel,
        painDuration: row.triagePainDuration,
        symptoms: row.triageSymptoms,
        swelling: row.triageSwelling,
        trauma: row.triageTrauma,
        bleeding: row.triageBleeding,
        infection: row.triageInfection,
        urgencyLevel: row.triageUrgencyLevel,
        triageNotes: row.triageNotes,
        anxietyLevel: row.triageAnxietyLevel,
        medicalHistory: row.triageMedicalHistory,
        currentMedications: row.triageCurrentMedications,
        allergies: row.triageAllergies,
        previousDentalTreatment: row.triagePreviousDentalTreatment,
        smokingStatus: row.triageSmokingStatus,
        alcoholConsumption: row.triageAlcoholConsumption,
        pregnancyStatus: row.triagePregnancyStatus
      } : null
    }));
  }

  async getPendingBookings(practiceId: number): Promise<any[]> {
    // Get all bookings with pending approval status for this practice, including triage assessments
    const bookingsQuery = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        appointmentId: bookings.appointmentId,
        triageAssessmentId: bookings.triageAssessmentId,
        treatmentCategory: bookings.treatmentCategory,
        specialRequests: bookings.specialRequests,
        status: bookings.status,
        approvalStatus: bookings.approvalStatus,
        createdAt: bookings.createdAt,
        accessibilityNeeds: bookings.accessibilityNeeds,
        medications: bookings.medications,
        allergies: bookings.allergies,
        lastDentalVisit: bookings.lastDentalVisit,
        anxietyLevel: bookings.anxietyLevel,
        // User details
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userPhone: users.phone,
        userDateOfBirth: users.dateOfBirth,
        // Appointment details  
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        duration: appointments.duration,
        treatmentType: appointments.treatmentType,
        // Triage assessment details
        triagePainLevel: triageAssessments.painLevel,
        triagePainDuration: triageAssessments.painDuration,
        triageSymptoms: triageAssessments.symptoms,
        triageSwelling: triageAssessments.swelling,
        triageTrauma: triageAssessments.trauma,
        triageBleeding: triageAssessments.bleeding,
        triageInfection: triageAssessments.infection,
        triageUrgencyLevel: triageAssessments.urgencyLevel,
        triageNotes: triageAssessments.triageNotes,
        triageAnxietyLevel: triageAssessments.anxietyLevel,
        triageMedicalHistory: triageAssessments.medicalHistory,
        triageCurrentMedications: triageAssessments.currentMedications,
        triageAllergies: triageAssessments.allergies,
        triagePreviousDentalTreatment: triageAssessments.previousDentalTreatment,
        triageSmokingStatus: triageAssessments.smokingStatus,
        triageAlcoholConsumption: triageAssessments.alcoholConsumption,
        triagePregnancyStatus: triageAssessments.pregnancyStatus
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(appointments, eq(bookings.appointmentId, appointments.id))
      .leftJoin(triageAssessments, eq(bookings.triageAssessmentId, triageAssessments.id))
      .where(
        and(
          eq(appointments.practiceId, practiceId),
          eq(bookings.status, 'pending_approval')
        )
      )
      .orderBy(bookings.createdAt);

    // Transform the flat result into the expected nested structure
    return bookingsQuery.map(row => ({
      id: row.id,
      userId: row.userId,
      appointmentId: row.appointmentId,
      triageAssessmentId: row.triageAssessmentId,
      user: {
        firstName: row.userFirstName,
        lastName: row.userLastName,
        email: row.userEmail,
        phone: row.userPhone,
        dateOfBirth: row.userDateOfBirth
      },
      appointment: {
        appointmentDate: row.appointmentDate,
        appointmentTime: row.appointmentTime,
        duration: row.duration,
        treatmentType: row.treatmentType
      },
      triageAssessment: row.triageAssessmentId ? {
        id: row.triageAssessmentId,
        painLevel: row.triagePainLevel || 0,
        painDuration: row.triagePainDuration || '',
        symptoms: row.triageSymptoms || '',
        swelling: row.triageSwelling || false,
        trauma: row.triageTrauma || false,
        bleeding: row.triageBleeding || false,
        infection: row.triageInfection || false,
        urgencyLevel: row.triageUrgencyLevel || 'low',
        triageNotes: row.triageNotes || '',
        anxietyLevel: row.triageAnxietyLevel || 'none',
        medicalHistory: row.triageMedicalHistory || '',
        currentMedications: row.triageCurrentMedications || '',
        allergies: row.triageAllergies || '',
        previousDentalTreatment: row.triagePreviousDentalTreatment || '',
        smokingStatus: row.triageSmokingStatus || 'never',
        alcoholConsumption: row.triageAlcoholConsumption || 'none',
        pregnancyStatus: row.triagePregnancyStatus || 'not-applicable'
      } : null,
      status: row.status,
      approvalStatus: row.approvalStatus,
      createdAt: row.createdAt,
      treatmentCategory: row.treatmentCategory,
      specialRequests: row.specialRequests,
      accessibilityNeeds: row.accessibilityNeeds,
      medications: row.medications,
      allergies: row.allergies,
      lastDentalVisit: row.lastDentalVisit,
      anxietyLevel: row.anxietyLevel
    }));
  }

  async approveBooking(bookingId: number, approvedBy: string): Promise<Booking> {
    // For demo purposes, we'll use a fixed dentist user ID (1)
    // In production, this would be the actual dentist user ID
    const dentistUserId = 1;
    
    console.log('Approving booking with:', { bookingId, dentistUserId });
    
    const [booking] = await db
      .update(bookings)
      .set({
        status: 'approved',
        approvalStatus: 'approved',
        approvedBy: dentistUserId,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // Update the associated appointment status to 'booked'
    await db
      .update(appointments)
      .set({
        status: 'booked',
        userId: booking.userId
      })
      .where(eq(appointments.id, booking.appointmentId));

    return booking;
  }

  async rejectBooking(bookingId: number, rejectedBy: string): Promise<Booking> {
    // For demo purposes, we'll use a fixed dentist user ID (1)
    // In production, this would be the actual dentist user ID
    const dentistUserId = 1;
    
    const [booking] = await db
      .update(bookings)
      .set({
        status: 'rejected',
        approvalStatus: 'rejected',
        approvedBy: dentistUserId,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return booking;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointmentData = {
      ...insertAppointment,
      appointmentDate: insertAppointment.appointmentDate instanceof Date 
        ? insertAppointment.appointmentDate 
        : new Date(insertAppointment.appointmentDate)
    };
    
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }

  async createTriageAssessment(insertAssessment: InsertTriageAssessment): Promise<TriageAssessment> {
    const [assessment] = await db
      .insert(triageAssessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async createCallbackRequest(insertRequest: InsertCallbackRequest): Promise<CallbackRequest> {
    const [request] = await db
      .insert(callbackRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getCallbackRequests(practiceId: number, date?: Date): Promise<any[]> {
    const query = db
      .select({
        id: callbackRequests.id,
        userId: callbackRequests.userId,
        practiceId: callbackRequests.practiceId,
        appointmentId: callbackRequests.appointmentId,
        requestType: callbackRequests.requestType,
        requestReason: callbackRequests.requestReason,
        preferredCallTime: callbackRequests.preferredCallTime,
        urgency: callbackRequests.urgency,
        status: callbackRequests.status,
        callbackNotes: callbackRequests.callbackNotes,
        createdAt: callbackRequests.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          dateOfBirth: users.dateOfBirth,
        },
        appointment: {
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          duration: appointments.duration,
          treatmentType: appointments.treatmentType,
        },
        triageAssessment: {
          id: triageAssessments.id,
          painLevel: triageAssessments.painLevel,
          painDuration: triageAssessments.painDuration,
          symptoms: triageAssessments.symptoms,
          swelling: triageAssessments.swelling,
          trauma: triageAssessments.trauma,
          bleeding: triageAssessments.bleeding,
          infection: triageAssessments.infection,
          urgencyLevel: triageAssessments.urgencyLevel,
          triageNotes: triageAssessments.triageNotes,
          anxietyLevel: triageAssessments.anxietyLevel,
          medicalHistory: triageAssessments.medicalHistory,
          currentMedications: triageAssessments.currentMedications,
          allergies: triageAssessments.allergies,
          previousDentalTreatment: triageAssessments.previousDentalTreatment,
          smokingStatus: triageAssessments.smokingStatus,
          alcoholConsumption: triageAssessments.alcoholConsumption,
          pregnancyStatus: triageAssessments.pregnancyStatus,
        },
      })
      .from(callbackRequests)
      .innerJoin(users, eq(callbackRequests.userId, users.id))
      .leftJoin(appointments, eq(callbackRequests.appointmentId, appointments.id))
      .leftJoin(triageAssessments, eq(callbackRequests.triageAssessmentId, triageAssessments.id))
      .where(eq(callbackRequests.practiceId, practiceId));

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return query.where(and(
        eq(callbackRequests.practiceId, practiceId),
        gte(callbackRequests.createdAt, startOfDay),
        lte(callbackRequests.createdAt, endOfDay)
      ));
    }

    return query;
  }

  async getTodaysCallbackRequests(practiceId: number): Promise<any[]> {
    const today = new Date();
    return this.getCallbackRequests(practiceId, today);
  }

  async getPreviousDaysCallbackRequests(practiceId: number, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    return db
      .select({
        id: callbackRequests.id,
        userId: callbackRequests.userId,
        practiceId: callbackRequests.practiceId,
        appointmentId: callbackRequests.appointmentId,
        requestType: callbackRequests.requestType,
        requestReason: callbackRequests.requestReason,
        preferredCallTime: callbackRequests.preferredCallTime,
        urgency: callbackRequests.urgency,
        status: callbackRequests.status,
        callbackNotes: callbackRequests.callbackNotes,
        createdAt: callbackRequests.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          dateOfBirth: users.dateOfBirth,
        },
        appointment: {
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          duration: appointments.duration,
          treatmentType: appointments.treatmentType,
        },
        triageAssessment: {
          id: triageAssessments.id,
          painLevel: triageAssessments.painLevel,
          painDuration: triageAssessments.painDuration,
          symptoms: triageAssessments.symptoms,
          swelling: triageAssessments.swelling,
          trauma: triageAssessments.trauma,
          bleeding: triageAssessments.bleeding,
          infection: triageAssessments.infection,
          urgencyLevel: triageAssessments.urgencyLevel,
          triageNotes: triageAssessments.triageNotes,
          anxietyLevel: triageAssessments.anxietyLevel,
          medicalHistory: triageAssessments.medicalHistory,
          currentMedications: triageAssessments.currentMedications,
          allergies: triageAssessments.allergies,
          previousDentalTreatment: triageAssessments.previousDentalTreatment,
          smokingStatus: triageAssessments.smokingStatus,
          alcoholConsumption: triageAssessments.alcoholConsumption,
          pregnancyStatus: triageAssessments.pregnancyStatus,
        },
      })
      .from(callbackRequests)
      .innerJoin(users, eq(callbackRequests.userId, users.id))
      .leftJoin(appointments, eq(callbackRequests.appointmentId, appointments.id))
      .leftJoin(triageAssessments, eq(callbackRequests.triageAssessmentId, triageAssessments.id))
      .where(and(
        eq(callbackRequests.practiceId, practiceId),
        gte(callbackRequests.createdAt, startDate)
      ))
      .orderBy(callbackRequests.createdAt);
  }

  async updateCallbackRequestStatus(requestId: number, status: string, notes?: string): Promise<CallbackRequest> {
    const updateData: any = { status, updatedAt: new Date() };
    if (notes) {
      updateData.callbackNotes = notes;
    }
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const [request] = await db
      .update(callbackRequests)
      .set(updateData)
      .where(eq(callbackRequests.id, requestId))
      .returning();
    return request;
  }
}

export const storage = new MemStorage();
