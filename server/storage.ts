import { 
  users, practices, treatments, dentists, appointments, bookings,
  type User, type InsertUser, type Practice, type InsertPractice,
  type Treatment, type InsertTreatment, type Dentist, type InsertDentist,
  type Appointment, type InsertAppointment,
  type Booking, type InsertBooking, type PracticeWithAppointments, type BookingWithDetails
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Practice operations
  getPractices(): Promise<Practice[]>;
  getPractice(id: number): Promise<Practice | undefined>;
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
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: number): Promise<BookingWithDetails[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private practices: Map<number, Practice> = new Map();
  private treatments: Map<number, Treatment> = new Map();
  private dentists: Map<number, Dentist> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private bookings: Map<number, Booking> = new Map();
  
  private currentUserId = 1;
  private currentPracticeId = 1;
  private currentTreatmentId = 1;
  private currentDentistId = 1;
  private currentAppointmentId = 1;
  private currentBookingId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Sample practices with detailed information
    const samplePractices: Practice[] = [
      {
        id: 1,
        name: "Newcastle Dental Centre",
        address: "123 Grey Street, Newcastle upon Tyne, NE1 6EE",
        postcode: "NE1 6EE",
        latitude: 54.9783,
        longitude: -1.6178,
        phone: "0191 123 4567",
        rating: 4.8,
        reviewCount: 156,
        wheelchairAccess: true,
        signLanguage: true,
        visualSupport: false,
        cognitiveSupport: true,
        disabledParking: true,
        openingHours: "Mon-Fri 9:00-18:00, Sat 9:00-14:00",
        imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Sunderland Family Dental",
        address: "45 High Street, Sunderland, SR1 3EX",
        postcode: "SR1 3EX",
        latitude: 54.9069,
        longitude: -1.3838,
        phone: "0191 987 6543",
        rating: 4.6,
        reviewCount: 89,
        wheelchairAccess: true,
        signLanguage: false,
        visualSupport: true,
        cognitiveSupport: false,
        disabledParking: true,
        openingHours: "Mon-Fri 8:30-17:30, Sat 9:00-13:00",
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        createdAt: new Date(),
      },
      {
        id: 3,
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

    // Sample dentists
    const sampleDentists: Dentist[] = [
      // Newcastle Dental Centre dentists
      {
        id: 1,
        practiceId: 1,
        name: "Sarah Johnson",
        title: "Dr.",
        specialization: "General Dentistry & Emergency Care",
        experience: 12,
        qualifications: "BDS (Newcastle), MFDS RCS (Eng)",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Johnson specializes in emergency dental care and has been serving the Newcastle community for over a decade.",
        languages: JSON.stringify(["English", "French"]),
        availableDays: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
        createdAt: new Date(),
      },
      {
        id: 2,
        practiceId: 1,
        name: "Michael Chen",
        title: "Dr.",
        specialization: "Cosmetic Dentistry",
        experience: 8,
        qualifications: "BDS (London), MSc Aesthetic Dentistry",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Chen is passionate about creating beautiful smiles through advanced cosmetic dental procedures.",
        languages: JSON.stringify(["English", "Mandarin"]),
        availableDays: JSON.stringify(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
        createdAt: new Date(),
      },
      // Sunderland Family Dental dentists
      {
        id: 3,
        practiceId: 2,
        name: "Emma Thompson",
        title: "Dr.",
        specialization: "Family Dentistry & Pediatrics",
        experience: 15,
        qualifications: "BDS (Edinburgh), PG Cert Pediatric Dentistry",
        imageUrl: "https://images.unsplash.com/photo-1594824475135-d4c37a8ca551?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Thompson has extensive experience in family dentistry and making children feel comfortable during dental visits.",
        languages: JSON.stringify(["English", "Spanish"]),
        availableDays: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
        createdAt: new Date(),
      },
      {
        id: 4,
        practiceId: 2,
        name: "James Wilson",
        title: "Dr.",
        specialization: "Restorative Dentistry",
        experience: 10,
        qualifications: "BDS (Manchester), MSc Restorative Dentistry",
        imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Wilson focuses on restoring damaged teeth and helping patients maintain optimal oral health.",
        languages: JSON.stringify(["English"]),
        availableDays: JSON.stringify(["Monday", "Wednesday", "Thursday", "Friday", "Saturday"]),
        createdAt: new Date(),
      },
      // Middlesbrough Advanced Dentistry dentists
      {
        id: 5,
        practiceId: 3,
        name: "Priya Patel",
        title: "Dr.",
        specialization: "Oral Surgery & Implants",
        experience: 18,
        qualifications: "BDS (Birmingham), FDS RCS (Eng), MSc Oral Surgery",
        imageUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Dr. Patel is a leading oral surgeon specializing in dental implants and complex surgical procedures.",
        languages: JSON.stringify(["English", "Hindi", "Gujarati"]),
        availableDays: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
        createdAt: new Date(),
      },
      {
        id: 6,
        practiceId: 3,
        name: "Robert Anderson",
        title: "Prof.",
        specialization: "Orthodontics & Advanced Dentistry",
        experience: 22,
        qualifications: "BDS (Leeds), MSc Orthodontics, PhD Dental Sciences",
        imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        bio: "Professor Anderson is a renowned orthodontist and researcher in advanced dental technologies.",
        languages: JSON.stringify(["English", "German"]),
        availableDays: JSON.stringify(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
        createdAt: new Date(),
      },
    ];

    // Sample appointments for today with dentist assignments
    const today = new Date();
    const sampleAppointments: Appointment[] = [
      { id: 1, practiceId: 1, dentistId: 1, userId: null, treatmentId: 4, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), status: "available", createdAt: new Date() },
      { id: 2, practiceId: 1, dentistId: 1, userId: null, treatmentId: 4, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0), status: "available", createdAt: new Date() },
      { id: 3, practiceId: 1, dentistId: 2, userId: null, treatmentId: 4, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), status: "available", createdAt: new Date() },
      { id: 4, practiceId: 1, dentistId: 2, userId: null, treatmentId: 4, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), status: "available", createdAt: new Date() },
      { id: 5, practiceId: 2, dentistId: 3, userId: null, treatmentId: 3, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), status: "available", createdAt: new Date() },
      { id: 6, practiceId: 2, dentistId: 4, userId: null, treatmentId: 3, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), status: "available", createdAt: new Date() },
      { id: 7, practiceId: 3, dentistId: 5, userId: null, treatmentId: 1, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30), status: "available", createdAt: new Date() },
      { id: 8, practiceId: 3, dentistId: 6, userId: null, treatmentId: 2, appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0), status: "available", createdAt: new Date() },
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      userType: insertUser.userType || 'patient',
    };
    this.users.set(user.id, user);
    return user;
  }

  async getPractices(): Promise<Practice[]> {
    return Array.from(this.practices.values());
  }

  async getPractice(id: number): Promise<Practice | undefined> {
    return this.practices.get(id);
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

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const booking: Booking = {
      ...insertBooking,
      id: this.currentBookingId++,
      createdAt: new Date(),
      accessibilityNeeds: insertBooking.accessibilityNeeds || null,
      medications: insertBooking.medications || null,
      allergies: insertBooking.allergies || null,
      lastDentalVisit: insertBooking.lastDentalVisit || null,
      anxietyLevel: insertBooking.anxietyLevel || null,
      specialRequests: insertBooking.specialRequests || null,
    };
    this.bookings.set(booking.id, booking);
    return booking;
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
}

export const storage = new MemStorage();
