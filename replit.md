# DentConnect - Real-time Dental Appointment Marketplace

## Overview

DentConnect is a modern web application that connects patients with last-minute dental appointment cancellations at local practices. The platform serves as a real-time marketplace where patients can instantly book available dental appointments while helping practices fill their cancelled slots.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with JSON responses

### Key Design Decisions

1. **Full-stack TypeScript**: Ensures type safety across the entire application
2. **Shared Schema**: Common type definitions between frontend and backend via `shared/schema.ts`
3. **Component-based Architecture**: Modular React components with clear separation of concerns
4. **Accessibility First**: Comprehensive accessibility features built into the UI components
5. **Mobile-first Design**: Responsive design optimized for mobile devices

## Key Components

### Database Schema
- **Users**: Patient and dentist profiles with user type differentiation
- **Practices**: Dental practice information including location and accessibility features
- **Dentists**: Detailed dentist profiles with specializations, experience, and photos
- **Treatments**: Available dental treatments categorized by urgency
- **Appointments**: Available time slots with booking status and dentist assignments
- **Bookings**: Patient appointment reservations with booking details

### Frontend Components
- **TreatmentSelection**: Multi-step onboarding for treatment type selection
- **AccessibilityForm**: Accessibility needs assessment and selection
- **MapView**: Interactive map showing nearby practices with availability
- **BookingFlow**: Multi-step appointment booking process
- **PracticeBottomSheet**: Practice details and appointment selection

### API Endpoints
- **GET /api/practices**: Retrieve practices with available appointments
- **GET /api/treatments**: Fetch available treatments by category
- **GET /api/dentists**: Fetch all dentists with profiles and specializations
- **GET /api/dentists/practice/:practiceId**: Get dentists for specific practice
- **GET /api/appointments/:practiceId**: Get available appointments for a practice
- **POST /api/bookings**: Create new appointment booking

## Data Flow

1. **Patient Journey**:
   - Select treatment type (emergency, urgent, routine, cosmetic)
   - Specify accessibility needs
   - View nearby practices on interactive map
   - Select practice and view available appointments
   - Complete booking flow with personal details
   - Receive booking confirmation

2. **Practice Integration**:
   - Practices can list available appointments
   - Real-time availability updates
   - Booking notifications and management

3. **Booking Process**:
   - Multi-step form validation
   - Real-time availability checking
   - Secure booking creation with user session

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **date-fns**: Date formatting and manipulation

### UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for server
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Migrations**: Drizzle Kit manages schema migrations

### Environment Configuration
- **Development**: Hot reload with Vite dev server
- **Production**: Served static files with Express server
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Deployment Commands
- `npm run dev`: Development mode with hot reload
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Push database schema changes

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

✓ **Complete Demo Experience with Early Access Integration** (July 08, 2025)
→ Both patient and dentist demos now redirect to early access signup
→ Demo completion modals appear after booking/signup flows
→ Fixed form submission issues by bypassing API calls in demo mode
→ Streamlined user journey from demo to early access registration

✓ **Enhanced Map Search Experience** (July 08, 2025)
→ Added comprehensive questionnaire flow during search
→ Interactive medical history and anxiety assessment
→ Advanced search filtering with real-time practice matching
→ Mobile-first design with Uber-inspired map interface

✓ **Mobile App Design System** (July 08, 2025) 
→ Calming teal/turquoise color scheme (inspired by Headspace)
→ Smooth animations and transitions throughout user journey
→ Enhanced accessibility features and questionnaire integration
→ Professional healthcare imagery and visual cues

✓ **Enhanced Navigation & Credibility Features** (July 08, 2025)
→ Added navigation buttons between patient and dentist views
→ Enhanced early access buttons with hover effects and importance highlighting
→ Integrated Royal College of Surgeons nomination badge for credibility
→ Improved header layouts across both patient and dentist interfaces

## Changelog

Changelog:
- July 08, 2025. Initial setup and mobile app enhancement
- July 08, 2025. Added navigation buttons and Royal College of Surgeons badge