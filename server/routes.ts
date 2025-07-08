import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
