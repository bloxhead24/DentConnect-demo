import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { insertBookingSchema, insertUserSchema } from "@shared/schema";
import { securityHeaders, corsOptions, validateInput, apiRateLimiter, requestLogger, antiMalwareCheck, ipReputationCheck, contentIntegrityCheck } from "./security";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Create user if doesn't exist
      let userId = bookingData.userId;
      if (!userId) {
        const user = await storage.createUser({
          email: req.body.email || "guest@example.com",
          firstName: req.body.firstName || "Guest",
          lastName: req.body.lastName || "User",
          userType: "patient",
        });
        userId = user.id;
      }

      // Book the appointment
      await storage.bookAppointment(bookingData.appointmentId, userId);
      
      // Create booking record
      const booking = await storage.createBooking({
        ...bookingData,
        userId,
      });
      
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
