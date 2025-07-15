import { db } from './db';
import { 
  users, practices, treatments, dentists, appointments, bookings, sessions,
  type User, type InsertUser, type Practice, type InsertPractice,
  type Treatment, type InsertTreatment, type Dentist, type InsertDentist,
  type Appointment, type InsertAppointment,
  type Booking, type InsertBooking, type PracticeWithAppointments, type BookingWithDetails,
  type Session, type InsertSession
} from "@shared/schema";
import { eq, and, gte, sql } from 'drizzle-orm';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  
  // Session operations
  async createSession(sessionData: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(sessionData).returning();
    return result[0];
  }
  
  async getSession(sessionId: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
    return result[0];
  }
  
  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  
  // Practice operations
  async getPractices(): Promise<Practice[]> {
    return await db.select().from(practices);
  }
  
  async getPractice(id: number): Promise<Practice | undefined> {
    const result = await db.select().from(practices).where(eq(practices.id, id)).limit(1);
    return result[0];
  }
  
  async getPracticeByTag(tag: string): Promise<Practice | undefined> {
    const result = await db.select().from(practices).where(eq(practices.practiceTag, tag)).limit(1);
    return result[0];
  }
  
  async createPractice(practiceData: InsertPractice): Promise<Practice> {
    const result = await db.insert(practices).values(practiceData).returning();
    return result[0];
  }
  
  async getPracticesWithAppointments(location?: string): Promise<PracticeWithAppointments[]> {
    const allPractices = await db.select().from(practices);
    
    const practicesWithAppointments: PracticeWithAppointments[] = [];
    
    for (const practice of allPractices) {
      const availableAppointments = await db.select()
        .from(appointments)
        .where(and(
          eq(appointments.practiceId, practice.id),
          eq(appointments.status, 'available')
        ));
      
      const practiceDentists = await db.select()
        .from(dentists)
        .where(eq(dentists.practiceId, practice.id));
      
      practicesWithAppointments.push({
        ...practice,
        availableAppointments,
        dentists: practiceDentists
      });
    }
    
    return practicesWithAppointments;
  }
  
  // Treatment operations
  async getTreatments(): Promise<Treatment[]> {
    return await db.select().from(treatments);
  }
  
  async getTreatmentsByCategory(category: string): Promise<Treatment[]> {
    return await db.select().from(treatments).where(eq(treatments.category, category));
  }
  
  // Dentist operations
  async getDentists(): Promise<Dentist[]> {
    return await db.select().from(dentists);
  }
  
  async getDentistsByPractice(practiceId: number): Promise<Dentist[]> {
    return await db.select().from(dentists).where(eq(dentists.practiceId, practiceId));
  }
  
  async getDentist(id: number): Promise<Dentist | undefined> {
    const result = await db.select().from(dentists).where(eq(dentists.id, id)).limit(1);
    return result[0];
  }
  
  // Appointment operations
  async getAvailableAppointments(practiceId: number, date?: Date): Promise<Appointment[]> {
    let query = db.select().from(appointments)
      .where(and(
        eq(appointments.practiceId, practiceId),
        eq(appointments.status, 'available')
      ));
    
    if (date) {
      query = query.where(and(
        eq(appointments.practiceId, practiceId),
        eq(appointments.status, 'available'),
        gte(appointments.appointmentDate, date)
      ));
    }
    
    return await query;
  }
  
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointmentData).returning();
    return result[0];
  }
  
  async bookAppointment(appointmentId: number, userId: number): Promise<Appointment> {
    const result = await db.update(appointments)
      .set({ userId, status: 'booked' })
      .where(and(
        eq(appointments.id, appointmentId),
        eq(appointments.status, 'available')
      ))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Appointment not available for booking');
    }
    
    return result[0];
  }
  
  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(bookingData).returning();
    return result[0];
  }
  
  async getUserBookings(userId: number): Promise<BookingWithDetails[]> {
    const userBookings = await db.select({
      booking: bookings,
      practice: practices,
      appointment: appointments,
      treatment: treatments
    })
    .from(bookings)
    .innerJoin(appointments, eq(bookings.appointmentId, appointments.id))
    .innerJoin(practices, eq(appointments.practiceId, practices.id))
    .innerJoin(treatments, eq(appointments.treatmentId, treatments.id))
    .where(eq(bookings.userId, userId));
    
    return userBookings.map(({ booking, practice, appointment, treatment }) => ({
      ...booking,
      practice,
      appointment,
      treatment
    }));
  }
}