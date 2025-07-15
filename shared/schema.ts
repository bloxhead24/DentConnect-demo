import { pgTable, text, serial, integer, boolean, timestamp, real, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  userType: varchar("user_type", { length: 20 }).notNull().default("patient"), // patient or dentist
  practiceId: integer("practice_id").references(() => practices.id), // for dentist users
  verified: boolean("verified").default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  resetToken: varchar("reset_token", { length: 255 }),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const practices = pgTable("practices", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  postcode: varchar("postcode", { length: 10 }).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }).notNull(), // for booking notifications
  practiceTag: varchar("practice_tag", { length: 50 }).notNull().unique(), // unique tag for practice access
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  wheelchairAccess: boolean("wheelchair_access").default(false),
  signLanguage: boolean("sign_language").default(false),
  visualSupport: boolean("visual_support").default(false),
  cognitiveSupport: boolean("cognitive_support").default(false),
  disabledParking: boolean("disabled_parking").default(false),
  openingHours: text("opening_hours"),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // emergency, urgent, routine, cosmetic
  description: text("description"),
  duration: integer("duration"), // in minutes
  price: real("price"),
});

export const dentists = pgTable("dentists", {
  id: serial("id").primaryKey(),
  practiceId: integer("practice_id").references(() => practices.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(), // Dr., Prof., etc.
  specialization: varchar("specialization", { length: 255 }),
  experience: integer("experience"), // years of experience
  qualifications: text("qualifications"),
  imageUrl: varchar("image_url", { length: 500 }),
  bio: text("bio"),
  languages: text("languages"), // JSON array of languages spoken
  availableDays: text("available_days"), // JSON array of days
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  practiceId: integer("practice_id").references(() => practices.id).notNull(),
  dentistId: integer("dentist_id").references(() => dentists.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  treatmentId: integer("treatment_id").references(() => treatments.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("available"), // available, booked, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  practiceId: integer("practice_id").references(() => practices.id).notNull(),
  dentistId: integer("dentist_id").references(() => dentists.id).notNull(),
  treatmentId: integer("treatment_id").references(() => treatments.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // confirmed, cancelled, completed
  totalAmount: real("total_amount").default(0),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, paid, refunded
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  patientEmail: varchar("patient_email", { length: 255 }).notNull(),
  patientPhone: varchar("patient_phone", { length: 20 }),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  medications: text("medications"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session management for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPracticeSchema = createInsertSchema(practices).omit({
  id: true,
  createdAt: true,
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({
  id: true,
});

export const insertDentistSchema = createInsertSchema(dentists).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Practice = typeof practices.$inferSelect;
export type InsertPractice = z.infer<typeof insertPracticeSchema>;
export type Treatment = typeof treatments.$inferSelect;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type Dentist = typeof dentists.$inferSelect;
export type InsertDentist = z.infer<typeof insertDentistSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type PracticeWithAppointments = Practice & {
  availableAppointments: Appointment[];
  dentists?: Dentist[];
};

export type BookingWithDetails = Booking & {
  practice: Practice;
  appointment: Appointment;
  treatment: Treatment;
};
