import { 
  users, practices, treatments, dentists, appointments, bookings, sessions,
  type User, type InsertUser, type Practice, type InsertPractice,
  type Treatment, type InsertTreatment, type Dentist, type InsertDentist,
  type Appointment, type InsertAppointment,
  type Booking, type InsertBooking, type PracticeWithAppointments, type BookingWithDetails,
  type Session, type InsertSession
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Practice operations
  getPractices(): Promise<Practice[]>;
  getPractice(id: number): Promise<Practice | undefined>;
  getPracticeByTag(tag: string): Promise<Practice | undefined>;
  getPracticesWithAppointments(location?: string): Promise<PracticeWithAppointments[]>;
  createPractice(practice: InsertPractice): Promise<Practice>;
  
  // Treatment operations
  getTreatments(): Promise<Treatment[]>;
  getTreatmentsByCategory(category: string): Promise<Treatment[]>;
  
  // Dentist operations
  getDentists(): Promise<Dentist[]>;
  getDentistsByPractice(practiceId: number): Promise<Dentist[]>;
  getDentist(id: number): Promise<Dentist | undefined>;
  
  // Appointment operations
  getAvailableAppointments(practiceId: number, date?: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
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
  private sessions: Map<string, Session> = new Map();
  
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
    // Sample practices with all required fields
    const samplePractices: Practice[] = [
      {
        id: 1,
        name: "Newcastle Dental Centre",
        address: "123 Grey Street, Newcastle upon Tyne, NE1 6EE",
        postcode: "NE1 6EE",
        latitude: 54.9783,
        longitude: -1.6178,
        phone: "0191 123 4567",
        email: "info@newcastledental.co.uk",
        practiceTag: "NDC2024",
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
        name: "Gateshead Smile Studio",
        address: "67 High Street, Gateshead, NE8 1EQ",
        postcode: "NE8 1EQ",
        latitude: 54.9533,
        longitude: -1.6103,
        phone: "0191 987 6543",
        email: "info@gatesheadsmile.co.uk",
        practiceTag: "GSS2024",
        rating: 4.7,
        reviewCount: 142,
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
        name: "Durham Cathedral Dental",
        address: "22 Silver Street, Durham, DH1 3RB",
        postcode: "DH1 3RB",
        latitude: 54.7767,
        longitude: -1.5711,
        phone: "0191 386 2345",
        email: "info@durhamdental.co.uk",
        practiceTag: "DCD2024",
        rating: 4.9,
        reviewCount: 198,
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

    // Initialize practices
    samplePractices.forEach(practice => {
      this.practices.set(practice.id, practice);
    });

    // Sample treatments
    const sampleTreatments: Treatment[] = [
      { id: 1, name: "Emergency Dental Care", category: "emergency", description: "Urgent dental care for emergencies", duration: 60, price: 150 },
      { id: 2, name: "Routine Cleaning", category: "routine", description: "Standard dental cleaning", duration: 45, price: 75 },
      { id: 3, name: "Urgent Dental Care", category: "urgent", description: "Urgent dental issues", duration: 30, price: 120 },
      { id: 4, name: "Teeth Whitening", category: "cosmetic", description: "Professional teeth whitening", duration: 90, price: 200 },
    ];

    sampleTreatments.forEach(treatment => {
      this.treatments.set(treatment.id, treatment);
    });

    // Sample dentists
    const sampleDentists: Dentist[] = [
      {
        id: 1,
        practiceId: 1,
        name: "Dr. Sarah Johnson",
        title: "Dr.",
        specialization: "General Dentistry",
        experience: 8,
        qualifications: "BDS Newcastle University",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
        bio: "Experienced general dentist with focus on preventive care",
        languages: JSON.stringify(["English", "Spanish"]),
        availableDays: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
        createdAt: new Date(),
      },
      {
        id: 2,
        practiceId: 2,
        name: "Dr. Michael Smith",
        title: "Dr.",
        specialization: "Orthodontics",
        experience: 12,
        qualifications: "BDS, MSc Orthodontics",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
        bio: "Specialist in orthodontic treatment and teeth alignment",
        languages: JSON.stringify(["English"]),
        availableDays: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
        createdAt: new Date(),
      },
    ];

    sampleDentists.forEach(dentist => {
      this.dentists.set(dentist.id, dentist);
    });

    // Sample appointments
    const sampleAppointments: Appointment[] = [
      {
        id: 1,
        practiceId: 1,
        dentistId: 1,
        userId: null,
        treatmentId: 1,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "available",
        createdAt: new Date(),
      },
      {
        id: 2,
        practiceId: 2,
        dentistId: 2,
        userId: null,
        treatmentId: 2,
        appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: "available",
        createdAt: new Date(),
      },
    ];

    sampleAppointments.forEach(appointment => {
      this.appointments.set(appointment.id, appointment);
    });

    this.currentUserId = 1;
    this.currentPracticeId = 4;
    this.currentTreatmentId = 5;
    this.currentDentistId = 3;
    this.currentAppointmentId = 3;
    this.currentBookingId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      userType: insertUser.userType || "patient",
      createdAt: new Date(),
      practiceId: insertUser.practiceId || null,
      verified: insertUser.verified || false,
      verificationToken: insertUser.verificationToken || null,
      resetToken: insertUser.resetToken || null,
      resetTokenExpiry: insertUser.resetTokenExpiry || null,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Session operations
  async createSession(session: InsertSession): Promise<Session> {
    const newSession: Session = {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      createdAt: new Date(),
    };
    this.sessions.set(session.id, newSession);
    return newSession;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  // Practice operations
  async getPractices(): Promise<Practice[]> {
    return Array.from(this.practices.values());
  }

  async getPractice(id: number): Promise<Practice | undefined> {
    return this.practices.get(id);
  }

  async getPracticeByTag(tag: string): Promise<Practice | undefined> {
    for (const practice of Array.from(this.practices.values())) {
      if (practice.practiceTag === tag) {
        return practice;
      }
    }
    return undefined;
  }

  async getPracticesWithAppointments(location?: string): Promise<PracticeWithAppointments[]> {
    const practices = Array.from(this.practices.values());
    return practices.map(practice => ({
      ...practice,
      availableAppointments: Array.from(this.appointments.values()).filter(
        appointment => appointment.practiceId === practice.id && appointment.status === "available"
      ),
      dentists: Array.from(this.dentists.values()).filter(
        dentist => dentist.practiceId === practice.id
      ),
    }));
  }

  async createPractice(practice: InsertPractice): Promise<Practice> {
    const newPractice: Practice = {
      id: this.currentPracticeId++,
      name: practice.name,
      address: practice.address,
      postcode: practice.postcode,
      latitude: practice.latitude,
      longitude: practice.longitude,
      phone: practice.phone || null,
      email: practice.email,
      practiceTag: practice.practiceTag,
      rating: practice.rating || 0,
      reviewCount: practice.reviewCount || 0,
      wheelchairAccess: practice.wheelchairAccess || false,
      signLanguage: practice.signLanguage || false,
      visualSupport: practice.visualSupport || false,
      cognitiveSupport: practice.cognitiveSupport || false,
      disabledParking: practice.disabledParking || false,
      openingHours: practice.openingHours || null,
      imageUrl: practice.imageUrl || null,
      createdAt: new Date(),
    };
    
    this.practices.set(newPractice.id, newPractice);
    return newPractice;
  }

  // Treatment operations
  async getTreatments(): Promise<Treatment[]> {
    return Array.from(this.treatments.values());
  }

  async getTreatmentsByCategory(category: string): Promise<Treatment[]> {
    return Array.from(this.treatments.values()).filter(
      treatment => treatment.category === category
    );
  }

  // Dentist operations
  async getDentists(): Promise<Dentist[]> {
    return Array.from(this.dentists.values());
  }

  async getDentistsByPractice(practiceId: number): Promise<Dentist[]> {
    return Array.from(this.dentists.values()).filter(
      dentist => dentist.practiceId === practiceId
    );
  }

  async getDentist(id: number): Promise<Dentist | undefined> {
    return this.dentists.get(id);
  }

  // Appointment operations
  async getAvailableAppointments(practiceId: number, date?: Date): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.practiceId === practiceId && appointment.status === "available"
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newAppointment: Appointment = {
      id: this.currentAppointmentId++,
      practiceId: appointment.practiceId,
      dentistId: appointment.dentistId,
      userId: appointment.userId || null,
      treatmentId: appointment.treatmentId,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status || "available",
      createdAt: new Date(),
    };
    
    this.appointments.set(newAppointment.id, newAppointment);
    return newAppointment;
  }

  async bookAppointment(appointmentId: number, userId: number): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) throw new Error("Appointment not found");
    
    const updatedAppointment = { ...appointment, userId, status: "booked" as const };
    this.appointments.set(appointmentId, updatedAppointment);
    return updatedAppointment;
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const newBooking: Booking = {
      id: this.currentBookingId++,
      userId: booking.userId,
      appointmentId: booking.appointmentId,
      practiceId: booking.practiceId,
      dentistId: booking.dentistId,
      treatmentId: booking.treatmentId,
      appointmentDate: booking.appointmentDate,
      status: booking.status || "confirmed",
      totalAmount: booking.totalAmount || 0,
      paymentStatus: booking.paymentStatus || "pending",
      patientName: booking.patientName,
      patientEmail: booking.patientEmail,
      patientPhone: booking.patientPhone || null,
      medicalHistory: booking.medicalHistory || null,
      allergies: booking.allergies || null,
      medications: booking.medications || null,
      emergencyContact: booking.emergencyContact || null,
      emergencyPhone: booking.emergencyPhone || null,
      specialRequests: booking.specialRequests || null,
      createdAt: new Date(),
    };
    
    this.bookings.set(newBooking.id, newBooking);
    return newBooking;
  }

  async getUserBookings(userId: number): Promise<BookingWithDetails[]> {
    const userBookings = Array.from(this.bookings.values()).filter(
      booking => booking.userId === userId
    );
    
    return userBookings.map(booking => ({
      ...booking,
      practice: this.practices.get(booking.practiceId)!,
      appointment: this.appointments.get(booking.appointmentId)!,
      treatment: this.treatments.get(booking.treatmentId)!,
    }));
  }
}

export const storage = new MemStorage();