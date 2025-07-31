# DentConnect - Real-time Dental Appointment Marketplace

## Overview
DentConnect is a modern web application that connects patients with last-minute dental appointment cancellations at local practices. It functions as a real-time marketplace, enabling patients to instantly book available dental appointments while helping practices fill cancelled slots. The platform aims to improve access to urgent dental care and optimize practice efficiency by reducing revenue loss from empty chairs.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system, Radix UI primitives, and shadcn/ui styling
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (using Neon for serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with JSON responses

### Key Design Decisions
- **Full-stack TypeScript**: Ensures type safety across the entire application.
- **Shared Schema**: Common type definitions between frontend and backend via `shared/schema.ts`.
- **Component-based Architecture**: Modular React components with clear separation of concerns.
- **Accessibility First**: Comprehensive accessibility features built into UI components.
- **Mobile-first Design**: Responsive design optimized for mobile devices, including responsive grids, navigation, and text sizes.
- **Professional UI/UX**: Calming teal/turquoise color scheme, smooth animations, and professional card designs, aiming for a healthcare-appropriate aesthetic. Includes professional logo design and credibility enhancements like the Royal College of Surgeons nomination badge.
- **Comprehensive Patient Journey**: Multi-step patient flow for treatment selection, accessibility needs, practice viewing, and booking.
- **Robust Appointment Management**: System for practices to list available appointments, real-time updates, and booking notifications.
- **Security**: Industry-standard bcrypt hashing for passwords, JWT authentication, audit logging, and GDPR compliance features (including privacy notices, consent management).
- **Authentication**: Streamlined login and dedicated signup pages for patients and dentists with role-based routing.
- **Compliance Framework**: Includes GDPR data protection, clinical triage system, appointment approval workflow, clinical records management, and audit trail system.
- **Integrated Calendar System**: Full calendar functionality in the dentist dashboard with multi-view modes and color-coded appointment statuses.
- **Triage & Approval System**: End-to-end workflow for patient assessment, dentist approval, and comprehensive data preservation of triage fields.
- **Optimized Search**: AI-powered smart search with interactive map options and budget/accessibility filtering.
- **Unified Booking Status Navigation**: Consistent navigation to comprehensive booking details from various interfaces.
- **Practice Connection Tag Management**: Editable practice tags for dentists with validation and duplicate prevention.

### Core Features
- **Real-time Appointment Booking**: Patients can instantly book last-minute cancellations.
- **Comprehensive Patient Triage**: Multi-step assessment for symptoms, pain, medical history, and accessibility.
- **Dentist Dashboard**: Manage appointments, view patient triage data, approve/reject bookings, and manage practice details.
- **Interactive Map View**: Displays nearby practices with real-time availability using OpenStreetMap.
- **Secure Authentication**: Patient and dentist logins with robust security measures.
- **Demo Environment**: Password-protected demo with clear disclaimers for testing purposes.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **wouter**: Lightweight React router.
- **date-fns**: Date formatting and manipulation.

### UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Type-safe CSS class variants.
- **lucide-react**: Icon library.
- **leaflet.js**: Interactive map integration with OpenStreetMap.

### Development Dependencies
- **vite**: Build tool and development server.
- **tsx**: TypeScript execution for server.
- **esbuild**: Fast JavaScript bundler for production.