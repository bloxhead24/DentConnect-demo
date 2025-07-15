import { pgTable, text, serial, integer, boolean, timestamp, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: varchar("date_of_birth", { length: 10 }),
  userType: varchar("user_type", { length: 20 }).notNull().default("patient"), // patient or dentist
  // GDPR Compliance
  gdprConsentGiven: boolean("gdpr_consent_given").default(false),
  gdprConsentDate: timestamp("gdpr_consent_date"),
  marketingConsentGiven: boolean("marketing_consent_given").default(false),
  marketingConsentDate: timestamp("marketing_consent_date"),
  dataRetentionDate: timestamp("data_retention_date"),
  // Clinical Data
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  medicalConditions: text("medical_conditions"),
  medications: text("medications"),
  allergies: text("allergies"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Clinical Triage and Safety Assessment
export const triageAssessments = pgTable("triage_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  painLevel: integer("pain_level"), // 1-10 scale
  painDuration: varchar("pain_duration", { length: 50 }),
  symptoms: text("symptoms"),
  swelling: boolean("swelling").default(false),
  trauma: boolean("trauma").default(false),
  bleeding: boolean("bleeding").default(false),
  infection: boolean("infection").default(false),
  urgencyLevel: varchar("urgency_level", { length: 20 }).notNull(), // low, medium, high, emergency
  triageNotes: text("triage_notes"),
  // Enhanced triage fields
  anxietyLevel: varchar("anxiety_level", { length: 20 }).default("none"), // none, mild, moderate, severe
  medicalHistory: text("medical_history"),
  currentMedications: text("current_medications"),
  allergies: text("allergies"),
  previousDentalTreatment: text("previous_dental_treatment"),
  smokingStatus: varchar("smoking_status", { length: 20 }).default("never"), // never, former, current
  alcoholConsumption: varchar("alcohol_consumption", { length: 20 }).default("none"), // none, occasional, regular, excessive
  pregnancyStatus: varchar("pregnancy_status", { length: 20 }).default("not-applicable"), // not-applicable, not-pregnant, pregnant, trying
  requiresApproval: boolean("requires_approval").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Log for Clinical Governance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // booking, appointment, user, etc.
  entityId: integer("entity_id"),
  oldValues: text("old_values"), // JSON string of old values
  newValues: text("new_values"), // JSON string of new values
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Data Processing Records (GDPR)
export const dataProcessingRecords = pgTable("data_processing_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  processingActivity: varchar("processing_activity", { length: 255 }).notNull(),
  lawfulBasis: varchar("lawful_basis", { length: 100 }).notNull(),
  dataCategories: text("data_categories"), // JSON array of data types
  retentionPeriod: varchar("retention_period", { length: 100 }),
  thirdPartySharing: text("third_party_sharing"), // JSON array of sharing details
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  triageAssessmentId: integer("triage_assessment_id").references(() => triageAssessments.id),
  treatmentCategory: varchar("treatment_category", { length: 50 }).notNull(),
  accessibilityNeeds: text("accessibility_needs"), // JSON string
  medications: boolean("medications").default(false),
  allergies: boolean("allergies").default(false),
  lastDentalVisit: varchar("last_dental_visit", { length: 50 }),
  anxietyLevel: varchar("anxiety_level", { length: 20 }).default("comfortable"), // comfortable, nervous, anxious
  specialRequests: text("special_requests"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, confirmed, cancelled, completed
  approvalStatus: varchar("approval_status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const callbackRequests = pgTable("callback_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  practiceId: integer("practice_id").references(() => practices.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  triageAssessmentId: integer("triage_assessment_id").references(() => triageAssessments.id),
  requestType: varchar("request_type", { length: 50 }).notNull().default("cancelled_appointment"), // "cancelled_appointment", "general_inquiry"
  requestReason: text("request_reason"), // Why they need callback
  preferredCallTime: varchar("preferred_call_time", { length: 20 }).default("anytime"), // "morning", "afternoon", "evening", "anytime"
  urgency: varchar("urgency", { length: 20 }).notNull().default("medium"), // "low", "medium", "high", "emergency"
  status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "completed", "cancelled"
  callbackNotes: text("callback_notes"), // Admin notes about the callback
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  updatedAt: true,
});

export const insertTriageAssessmentSchema = createInsertSchema(triageAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertDataProcessingRecordSchema = createInsertSchema(dataProcessingRecords).omit({
  id: true,
  createdAt: true,
});

export const insertCallbackRequestSchema = createInsertSchema(callbackRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type TriageAssessment = typeof triageAssessments.$inferSelect;
export type InsertTriageAssessment = z.infer<typeof insertTriageAssessmentSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type DataProcessingRecord = typeof dataProcessingRecords.$inferSelect;
export type InsertDataProcessingRecord = z.infer<typeof insertDataProcessingRecordSchema>;
export type CallbackRequest = typeof callbackRequests.$inferSelect;
export type InsertCallbackRequest = z.infer<typeof insertCallbackRequestSchema>;

export type PracticeWithAppointments = Practice & {
  availableAppointments: Appointment[];
  dentists?: Dentist[];
};

export type BookingWithDetails = Booking & {
  practice: Practice;
  appointment: Appointment;
  treatment: Treatment;
};
