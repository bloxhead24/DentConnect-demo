import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { insertBookingSchema, insertUserSchema, insertCallbackRequestSchema, insertTriageAssessmentSchema } from "@shared/schema";
import { securityHeaders, corsOptions, validateInput, apiRateLimiter, requestLogger, antiMalwareCheck, ipReputationCheck, contentIntegrityCheck } from "./security";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment - responds quickly with 200 status
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Root health check for deployment platforms that check '/'
  // This will be handled by Vite in development, but we need it for production health checks
  if (process.env.NODE_ENV === 'production') {
    app.get("/", (req, res) => {
      // Check if this is a health check request (typically has specific user agents or headers)
      const userAgent = req.get('User-Agent') || '';
      const isHealthCheck = userAgent.includes('kube-probe') || 
                           userAgent.includes('healthcheck') || 
                           userAgent.includes('ELB-HealthChecker') ||
                           req.get('X-Health-Check') === 'true';
      
      if (isHealthCheck) {
        return res.status(200).json({
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      }
      
      // For production, serve the main application
      return res.sendFile(path.join(__dirname, "..", "dist", "public", "index.html"));
    });
  }

  // Serve test page for debugging
  app.get("/test", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "test-simple.html"));
  });

  // Serve map test page
  app.get("/test-map", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "test-map.html"));
  });

  // Test CSP in production mode endpoint
  app.get("/test-csp", (req, res) => {
    const nonce = res.locals.nonce || 'no-nonce';
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CSP Production Test</title>
        </head>
        <body>
          <h1>CSP Production Test</h1>
          <p>Environment: ${process.env.NODE_ENV}</p>
          <p>Nonce: ${nonce}</p>
          <script src="https://example.com/test.js"></script>
          <script>
            console.log('Inline script test - should work with unsafe-inline');
            document.body.innerHTML += '<p>Inline script executed!</p>';
          </script>
        </body>
      </html>
    `);
  });

  // Serve fallback HTML for older browsers
  app.get("/fallback", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/src/fallback.html"));
  });
  
  // Serve fast loading version
  app.get("/fast", (req, res) => {
    res.redirect("/?fast=true");
  });
  // Minimal middleware for development
  if (process.env.NODE_ENV === 'production') {
    app.use(cors(corsOptions));
    app.use(securityHeaders);
    app.use(requestLogger);
    app.use(antiMalwareCheck);
    app.use(ipReputationCheck);
    app.use(contentIntegrityCheck);
    app.use(validateInput);
    app.use(apiRateLimiter);
  }

  // Practice routes
  app.get("/api/practices", async (req, res) => {
    try {
      const location = req.query.location as string;
      const practices = await storage.getPracticesWithAppointments(location);
      res.json(practices);
    } catch (error) {
      console.error("Error fetching practices:", error);
      res.status(500).json({ message: "Failed to fetch practices" });
    }
  });

  // Find practice by connection tag with appointments (must come before :id route)
  app.get("/api/practices/tag/:connectionTag", async (req, res) => {
    try {
      const connectionTag = req.params.connectionTag;
      const practice = await storage.getPracticeByConnectionTag(connectionTag);
      if (!practice) {
        return res.status(404).json({ message: "Practice not found with connection tag" });
      }
      
      // Get appointments and dentists for this practice
      const appointments = await storage.getAvailableAppointments(practice.id);
      const dentists = await storage.getDentistsByPractice(practice.id);
      
      const practiceWithAppointments = {
        ...practice,
        availableAppointments: appointments,
        dentists: dentists
      };
      
      res.json(practiceWithAppointments);
    } catch (error) {
      console.error("Error fetching practice by connection tag:", error);
      res.status(500).json({ message: "Failed to fetch practice by connection tag" });
    }
  });

  app.get("/api/practices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const practice = await storage.getPractice(id);
      if (!practice) {
        return res.status(404).json({ message: "Practice not found" });
      }
      res.json(practice);
    } catch (error) {
      console.error("Error fetching practice:", error);
      res.status(500).json({ message: "Failed to fetch practice" });
    }
  });

  // Treatment routes
  app.get("/api/treatments", async (req, res) => {
    try {
      const category = req.query.category as string;
      const treatments = category 
        ? await storage.getTreatmentsByCategory(category)
        : await storage.getTreatments();
      res.json(treatments);
    } catch (error) {
      console.error("Error fetching treatments:", error);
      res.status(500).json({ message: "Failed to fetch treatments" });
    }
  });

  // Appointment routes
  app.get("/api/appointments/:practiceId", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const appointments = await storage.getAvailableAppointments(practiceId, date);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Dentist routes
  app.get("/api/dentists", async (req, res) => {
    try {
      const dentists = await storage.getDentists();
      res.json(dentists);
    } catch (error) {
      console.error("Error fetching dentists:", error);
      res.status(500).json({ message: "Failed to fetch dentists" });
    }
  });

  app.get("/api/dentists/practice/:practiceId", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const dentists = await storage.getDentistsByPractice(practiceId);
      res.json(dentists);
    } catch (error) {
      console.error("Error fetching dentists:", error);
      res.status(500).json({ message: "Failed to fetch dentists" });
    }
  });

  app.get("/api/dentists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dentist = await storage.getDentist(id);
      if (!dentist) {
        return res.status(404).json({ message: "Dentist not found" });
      }
      res.json(dentist);
    } catch (error) {
      console.error("Error fetching dentist:", error);
      res.status(500).json({ message: "Failed to fetch dentist" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      console.log("User creation request body:", req.body);
      
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        console.error("User validation failed:", result.error);
        return res.status(400).json({ error: "Invalid user data", details: result.error.issues });
      }
      
      const user = await storage.createUser(result.data);
      console.log("User created successfully:", user);
      res.status(201).json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Get user by email
  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user by email:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      console.log("Booking request body:", req.body);
      
      // Extract the booking data we need
      const bookingData = {
        userId: req.body.userId,
        appointmentId: req.body.appointmentId,
        treatmentCategory: req.body.treatmentCategory,
        specialRequests: req.body.specialRequests,
        status: "pending_approval", // Set to pending_approval for dental review
        approvalStatus: "pending", // Keep pending for dental approval
        triageAssessmentId: req.body.triageAssessmentId,
        accessibilityNeeds: req.body.accessibilityNeeds,
        medications: req.body.medications,
        allergies: req.body.allergies,
        lastDentalVisit: req.body.lastDentalVisit,
        anxietyLevel: req.body.anxietyLevel
      };
      
      console.log("Parsed booking data:", bookingData);
      
      // Validate core required fields only (skip schema validation for now to allow medical fields)
      if (!bookingData.userId || !bookingData.appointmentId || !bookingData.treatmentCategory) {
        return res.status(400).json({ error: "Missing required booking data: userId, appointmentId, or treatmentCategory" });
      }
      
      // Book the appointment
      await storage.bookAppointment(bookingData.appointmentId, bookingData.userId);
      
      // Create booking record with all medical data
      const booking = await storage.createBooking(bookingData);
      console.log("Booking created successfully:", booking);
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Update booking with triage assessment
  app.patch("/api/bookings/:bookingId", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const updateData = req.body;
      
      console.log("Updating booking:", bookingId, "with data:", updateData);
      
      const updatedBooking = await storage.updateBooking(bookingId, updateData);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // Get all bookings for a user with detailed information
  app.get("/api/users/:userId/bookings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log("Fetching bookings for user:", userId);
      
      const bookings = await storage.getUserBookings(userId);
      console.log("Found bookings:", bookings);
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Get available appointments for approval dashboard
  app.get("/api/practice/:practiceId/available-appointments", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const appointments = await storage.getAvailableAppointments(practiceId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available appointments" });
    }
  });

  // Get pending bookings for approval dashboard
  app.get("/api/practice/:practiceId/pending-bookings", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const pendingBookings = await storage.getPendingBookings(practiceId);
      res.json(pendingBookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending bookings" });
    }
  });

  // Get approved bookings for overview dashboard
  app.get("/api/practice/:practiceId/approved-bookings", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const approvedBookings = await storage.getApprovedBookings(practiceId);
      res.json(approvedBookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch approved bookings" });
    }
  });

  // Get all appointments for a practice (for calendar view)
  app.get("/api/practice/:practiceId/appointments", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const appointments = await storage.getPracticeAppointments(practiceId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice appointments" });
    }
  });

  // Approve a booking
  app.post("/api/bookings/:bookingId/approve", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const approvedBy = req.body.approvedBy || 'Dr. Richard Thompson';
      
      const booking = await storage.approveBooking(bookingId, approvedBy);
      res.json(booking);
    } catch (error) {
      console.error("Error approving booking:", error);
      res.status(500).json({ error: "Failed to approve booking" });
    }
  });

  // Reject a booking
  app.post("/api/bookings/:bookingId/reject", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const rejectedBy = req.body.rejectedBy || 'Dr. Richard Thompson';
      
      const booking = await storage.rejectBooking(bookingId, rejectedBy);
      res.json(booking);
    } catch (error) {
      console.error("Error rejecting booking:", error);
      res.status(500).json({ error: "Failed to reject booking" });
    }
  });

  // Appointment creation route
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = {
        ...req.body,
        appointmentDate: new Date(req.body.appointmentDate)
      };
      
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Early Access Registration
  app.post("/api/early-access", async (req, res) => {
    try {
      const { name, email, userType, organization, message } = req.body;
      
      // In a real app, this would save to database
      console.log("Early access request:", { name, email, userType, organization, message });
      
      res.json({ 
        success: true, 
        message: "Early access request submitted successfully" 
      });
    } catch (error) {
      console.error("Error processing early access request:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // GDC Verification
  app.post("/api/verify-gdc", async (req, res) => {
    try {
      const { gdcNumber } = req.body;
      
      // Mock GDC verification - in real app, this would call GDC API
      const isValid = gdcNumber && gdcNumber.length >= 6;
      
      res.json({ 
        verified: isValid,
        details: isValid ? {
          name: "Dr. Sample Name",
          status: "Active",
          registrationDate: "2015-01-01"
        } : null
      });
    } catch (error) {
      console.error("Error verifying GDC:", error);
      res.status(500).json({ message: "Failed to verify GDC number" });
    }
  });

  // Dentist Signup
  app.post("/api/dentist-signup", async (req, res) => {
    try {
      // In a real app, this would save to database and process documents
      console.log("Dentist signup request received");
      
      res.json({ 
        success: true, 
        message: "Dentist application submitted successfully",
        applicationId: Date.now().toString()
      });
    } catch (error) {
      console.error("Error processing dentist signup:", error);
      res.status(500).json({ message: "Failed to process application" });
    }
  });

  // Dentist Dashboard Stats
  app.get("/api/dentist/stats/:period", async (req, res) => {
    try {
      // Mock dashboard stats
      const stats = {
        totalPatients: 1247,
        todayAppointments: 8,
        monthlyRevenue: 18500,
        averageRating: 4.8,
        cancelledAppointments: 12,
        completedAppointments: 156,
        pendingBookings: 23,
        availableSlots: 15,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dentist stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Dentist Recent Appointments
  app.get("/api/dentist/recent-appointments", async (req, res) => {
    try {
      // Mock recent appointments
      const appointments = [
        {
          id: 1,
          patientName: "Sarah Johnson",
          treatmentType: "Routine Cleaning",
          appointmentTime: "09:00",
          status: "scheduled",
          revenue: 80,
        },
        {
          id: 2,
          patientName: "Michael Chen",
          treatmentType: "Tooth Filling",
          appointmentTime: "10:30",
          status: "completed",
          revenue: 150,
        },
        {
          id: 3,
          patientName: "Emma Wilson",
          treatmentType: "Root Canal",
          appointmentTime: "14:00",
          status: "scheduled",
          revenue: 400,
        },
        {
          id: 4,
          patientName: "James Brown",
          treatmentType: "Emergency Treatment",
          appointmentTime: "16:30",
          status: "cancelled",
          revenue: 0,
        },
      ];
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching recent appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/bookings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      console.log("User creation request body:", req.body);
      
      // Validate with schema
      const validatedData = insertUserSchema.parse(req.body);
      
      // Create user
      const user = await storage.createUser(validatedData);
      
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Triage assessment routes
  app.post("/api/triage-assessments", async (req, res) => {
    try {
      console.log("Triage assessment request body:", req.body);
      
      // Validate with schema
      const result = insertTriageAssessmentSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Triage assessment validation failed:", result.error);
        return res.status(400).json({ error: "Invalid triage assessment data", details: result.error.issues });
      }
      
      // Create triage assessment
      const triageAssessment = await storage.createTriageAssessment(result.data);
      console.log("Triage assessment created successfully:", triageAssessment);
      
      res.status(201).json(triageAssessment);
    } catch (error) {
      console.error("Error creating triage assessment:", error);
      res.status(500).json({ message: "Failed to create triage assessment" });
    }
  });

  // Callback request routes
  app.post("/api/callback-requests", async (req, res) => {
    try {
      console.log("Callback request body:", req.body);
      
      // Validate with schema
      const validatedData = insertCallbackRequestSchema.parse(req.body);
      
      // Create callback request
      const callbackRequest = await storage.createCallbackRequest(validatedData);
      
      res.json(callbackRequest);
    } catch (error) {
      console.error("Error creating callback request:", error);
      res.status(500).json({ message: "Failed to create callback request" });
    }
  });

  app.get("/api/practice/:practiceId/callback-requests", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      
      const callbackRequests = await storage.getCallbackRequests(practiceId, date);
      res.json(callbackRequests);
    } catch (error) {
      console.error("Error fetching callback requests:", error);
      res.status(500).json({ message: "Failed to fetch callback requests" });
    }
  });

  app.get("/api/practice/:practiceId/callback-requests/today", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const callbackRequests = await storage.getTodaysCallbackRequests(practiceId);
      res.json(callbackRequests);
    } catch (error) {
      console.error("Error fetching today's callback requests:", error);
      res.status(500).json({ message: "Failed to fetch today's callback requests" });
    }
  });

  app.get("/api/practice/:practiceId/callback-requests/previous/:days", async (req, res) => {
    try {
      const practiceId = parseInt(req.params.practiceId);
      const days = parseInt(req.params.days);
      const callbackRequests = await storage.getPreviousDaysCallbackRequests(practiceId, days);
      res.json(callbackRequests);
    } catch (error) {
      console.error("Error fetching previous days callback requests:", error);
      res.status(500).json({ message: "Failed to fetch previous days callback requests" });
    }
  });

  app.post("/api/callback-requests/:requestId/status", async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const { status, notes } = req.body;
      
      const callbackRequest = await storage.updateCallbackRequestStatus(requestId, status, notes);
      res.json(callbackRequest);
    } catch (error) {
      console.error("Error updating callback request status:", error);
      res.status(500).json({ message: "Failed to update callback request status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
