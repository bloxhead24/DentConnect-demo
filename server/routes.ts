import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { insertBookingSchema, insertUserSchema } from "@shared/schema";
import { securityHeaders, corsOptions, validateInput, apiRateLimiter, requestLogger, antiMalwareCheck, ipReputationCheck, contentIntegrityCheck } from "./security";
import { authenticate, authenticateDentist, hashPassword, verifyPassword, createSession, validateSession, invalidateSession } from "./auth";
import { sendBookingNotification, sendWelcomeEmail } from "./email-service";
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

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, userType, practiceTag } = req.body;
      
      // Validate input
      if (!email || !password || !firstName || !lastName || !userType) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      // For dentists, verify practice tag
      let practiceId = null;
      if (userType === 'dentist') {
        if (!practiceTag) {
          return res.status(400).json({ message: "Practice tag is required for dentists" });
        }
        
        const practice = await storage.getPracticeByTag(practiceTag);
        if (!practice) {
          return res.status(404).json({ message: "Invalid practice tag" });
        }
        practiceId = practice.id;
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userType,
        practiceId,
        verified: false,
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null
      });
      
      // Create session
      const session = await createSession(user.id);
      
      // Send welcome email
      if (userType === 'dentist' && practiceId) {
        const practice = await storage.getPractice(practiceId);
        await sendWelcomeEmail(user, practice);
      } else {
        await sendWelcomeEmail(user);
      }
      
      res.status(201).json({ 
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          practiceId: user.practiceId
        },
        sessionToken: session.id
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session
      const session = await createSession(user.id);
      
      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          practiceId: user.practiceId
        },
        sessionToken: session.id
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", authenticate, async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');
      if (sessionToken) {
        await invalidateSession(sessionToken);
      }
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        practiceId: user.practiceId
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Practice tag verification
  app.post("/api/auth/verify-practice-tag", async (req, res) => {
    try {
      const { practiceTag } = req.body;
      
      if (!practiceTag) {
        return res.status(400).json({ message: "Practice tag is required" });
      }
      
      const practice = await storage.getPracticeByTag(practiceTag);
      if (!practice) {
        return res.status(404).json({ message: "Invalid practice tag" });
      }
      
      res.json({ 
        valid: true,
        practice: {
          id: practice.id,
          name: practice.name,
          address: practice.address,
          practiceTag: practice.practiceTag
        }
      });
    } catch (error) {
      console.error("Practice tag verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Create user if doesn't exist
      let userId = bookingData.userId;
      let patient;
      if (!userId) {
        patient = await storage.createUser({
          email: req.body.email || "guest@example.com",
          firstName: req.body.firstName || "Guest",
          lastName: req.body.lastName || "User",
          userType: "patient",
          password: "temporary_password",
          verified: false,
          verificationToken: null,
          resetToken: null,
          resetTokenExpiry: null,
          practiceId: null
        });
        userId = patient.id;
      } else {
        patient = await storage.getUser(userId);
      }

      // Book the appointment
      const bookedAppointment = await storage.bookAppointment(bookingData.appointmentId, userId);
      
      // Create booking record
      const booking = await storage.createBooking({
        ...bookingData,
        userId,
      });
      
      // Send email notification to practice
      try {
        // Get appointment details for email
        const appointment = await storage.getAvailableAppointments(bookedAppointment.practiceId);
        const appointmentDetails = appointment.find(a => a.id === bookedAppointment.id);
        
        if (appointmentDetails) {
          const practice = await storage.getPractice(bookedAppointment.practiceId);
          const treatments = await storage.getTreatments();
          const treatment = treatments.find(t => t.id === appointmentDetails.treatmentId);
          
          if (practice && treatment && patient) {
            await sendBookingNotification({
              patient,
              practice,
              appointment: appointmentDetails,
              treatment
            });
          }
        }
      } catch (emailError) {
        console.error("Failed to send booking notification email:", emailError);
        // Don't fail the booking if email fails
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
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

  const httpServer = createServer(app);
  return httpServer;
}
