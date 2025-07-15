import { pgTable, text, serial, integer, boolean, timestamp, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  userType: varchar("user_type", { length: 20 }).notNull().default("patient"), // patient or dentist
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
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  wheelchairAccess: boolean("wheelchair_access").default(false),
  signLanguage: boolean("sign_language").default(false),
  visualSupport: boolean("visual_support").default(false),
  cognitiveSupport: boolean("cognitive_support").default(false),
  disabledParking: boolean("disabled_parking").default(false),
  openingHours: text("opening_hours"),
  imageUrl: varchar("image_url", { length: 500 }),
  connectionTag: varchar("connection_tag", { length: 50 }).unique(), // Unique identifier for practice connection
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
  appointmentTime: varchar("appointment_time", { length: 10 }).notNull(), // Time in HH:MM format
  duration: integer("duration").notNull(), // Duration in minutes
  treatmentType: varchar("treatment_type", { length: 100 }).notNull(), // Type of treatment
  status: varchar("status", { length: 20 }).notNull().default("available"), // available, booked, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  treatmentCategory: varchar("treatment_category", { length: 50 }).notNull(),
  accessibilityNeeds: text("accessibility_needs"), // JSON string
  medications: boolean("medications").default(false),
  allergies: boolean("allergies").default(false),
  lastDentalVisit: varchar("last_dental_visit", { length: 50 }),
  anxietyLevel: varchar("anxiety_level", { length: 20 }).default("comfortable"), // comfortable, nervous, anxious
  specialRequests: text("special_requests"),
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

export type PracticeWithAppointments = Practice & {
  availableAppointments: Appointment[];
  dentists?: Dentist[];
};

export type BookingWithDetails = Booking & {
  practice: Practice;
  appointment: Appointment;
  treatment: Treatment;
};
