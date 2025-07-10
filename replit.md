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

✓ **CRITICAL FIX: Resolved Google "Compromised Site" Security Issues** (July 10, 2025)
→ Removed external Replit script (replit-dev-banner.js) that was triggering malware detection
→ Enhanced security headers with comprehensive Content Security Policy, HSTS, and XSS protection
→ Replaced all external Unsplash image URLs with safe inline SVG placeholders
→ Fixed OpenStreetMap external dependencies with secure SVG alternatives
→ Added proper robots.txt, sitemap.xml, and security.txt files for legitimacy
→ Enhanced input sanitization to remove script tags, JavaScript protocols, and data URIs
→ Improved CORS configuration for Replit domains while blocking unauthorized origins
→ Added security-focused meta tags for content protection and frame denial

✓ **Comprehensive Early Access Integration Throughout User Journey** (July 10, 2025)
→ Added EarlyAccessPopup component to all major user journey completion points
→ Integrated early access prompts in SearchModeSelection, BudgetSelection, PracticeConnect, and AccessibilityForm
→ Early access popups appear after key task completions with contextual titles and descriptions
→ Comprehensive coverage ensures users encounter early access opportunities throughout demo experience
→ All popups redirect to https://dentconnect.replit.app/ for seamless early access signup
→ Enhanced user engagement with strategic popup timing and relevant messaging for each journey stage

✓ **Enhanced Virtual Consultation Pricing and Early Access Integration** (July 10, 2025)
→ Updated virtual consultation pricing to £24.99 for patients (30 minutes)
→ Set dentist earnings to £20 per 30-minute virtual consultation
→ All demo flows now redirect to early access signup (https://dentconnect.replit.app/)
→ Added virtual consultation fee notes to dentist dashboard Quick Actions section
→ Updated BookingFlow success screen to redirect to early access instead of home
→ Enhanced VirtualConsultation component with clear pricing structure for both user types
→ Virtual consultations prominently displayed at start of patient flow and in dentist dashboard

✓ **Simplified Pricing Model with Practice Dashboard** (July 10, 2025)
→ Removed all specific treatment pricing and replaced with simple £5 appointment booking fee
→ Treatment costs now assessed by dentist during appointment based on individual needs
→ Added comprehensive practice pricing management dashboard with treatment price range guidance
→ Updated budget selection to focus on practice filtering rather than specific cost estimates
→ Created PricingManagement component allowing practices to submit price ranges for patient guidance
→ Enhanced booking flow to clearly show £5 booking fee with treatment costs determined during visit

✓ **Enhanced Open Search with AI and Interactive Map Options** (July 10, 2025)
→ Replaced open search popup with dedicated OpenSearchView page following consistent design patterns
→ Added AI-powered smart search with animated loading screens and step-by-step progress tracking
→ Integrated interactive map view with pulsing animations and multi-stage loading process
→ Enhanced search options with budget-aware pricing and accessibility integration
→ Created comprehensive Northeast England map showing Newcastle, Gateshead, Durham, and North Shields practices
→ AI search analyzes preferences, budget, accessibility needs, and availability with real-time progress indicators
→ Map view displays practices with real coordinates and connects to modern booking flow
→ Added demo disclaimers throughout booking forms noting no data storage or real appointments

✓ **Complete Appointment Booking Flow with Demo Completion Modal** (July 10, 2025)
→ Added budget selection step after preferences using £ symbols (£, ££, £££, ££££, flexible)
→ Enhanced 6-step onboarding: Treatment → Preferences → Budget → Search Mode → Practice Connect → Authenticated Diary  
→ Comprehensive booking flow with personal details, medical information, and appointment confirmation
→ Urgent appointment matching system with AI-powered practice finder and time-sensitive booking
→ Demo completion modal appears after booking with early access redirect to https://dentconnect.replit.app/
→ Professional budget selection with treatment cost ranges and payment plan information
→ Full medical form integration including emergency contacts, medications, allergies, and special requests
→ Enhanced user journey tracking with budget preferences influencing practice recommendations

✓ **Unified Practice Tag Authentication with Smart Diary Filtering** (July 10, 2025)
→ Single practice tag works for both My Practice and My Dentist modes
→ Same tag but different appointment filtering: Practice mode shows all dentists, Dentist mode shows specific dentist only
→ Direct connection to authenticated practice diary bypassing map entirely
→ Enhanced onboarding flow: Treatment → Preferences → Search Mode → Practice Connect → Authenticated Diary
→ Quick Book option for earliest available appointment based on mode
→ Professional visual design with mode-specific color themes (blue for practice, teal for dentist)
→ Demo-friendly with test tags ("DEMO", "NDC2024", "SMILE123", "DENTAL456", "TEST")
→ Clear visual confirmation of connected practice and dentist (when applicable)
→ Full diary access with proper filtering based on search mode

✓ **Enhanced Search Mode System with Smart Appointment Booking** (July 10, 2025)
→ Created dedicated search mode selection page before map opens
→ Three search options with distinct appointment flows:
  • **Open Search**: Shows all available appointments with standard grid selection
  • **My Practice Search**: Auto-highlights next available appointment + option to browse all practice appointments
  • **My Dentist Search**: Auto-highlights next available appointment with personal dentist + full diary access
→ Professional card-based interface with feature comparisons and smart recommendations
→ Integrated into 4-step onboarding flow: Treatment → Preferences → Search Mode → Map
→ Smart recommendations based on treatment urgency (emergency = Open Search, routine = My Dentist)
→ Search mode indicator displayed on map page to show active selection
→ Enhanced appointment booking with Quick Book buttons for practice/dentist modes
→ Full diary view component with weekly/monthly calendar interfaces for detailed appointment browsing

✓ **Professional Directions Page with Enhanced Dentist Profiles** (July 09, 2025)
→ Created comprehensive directions page with real OpenStreetMap routing
→ Added animated destination markers with bouncing effects and user location pulsing
→ Implemented professional 3-tab dentist profile system (Profile, Medical Form, Contact)
→ Added medical history form with emergency contacts, medications, allergies, and insurance
→ Integrated Google Maps navigation and practice calling functionality
→ Enhanced UI with calming teal theme gradients and professional card designs
→ Added location sharing, address copying, and emergency instruction features

✓ **Real Map Integration with OpenStreetMap** (July 09, 2025)
→ Integrated Leaflet.js with OpenStreetMap tiles for authentic street-level mapping
→ Added real geographic data showing actual streets, buildings, and landmarks
→ Implemented interactive map centered on Northeast England (Newcastle upon Tyne)
→ Custom dental practice markers with professional styling and hover effects
→ Real coordinates for practices across Newcastle, Gateshead, Durham, North Shields, Consett, Hexham, Darlington
→ Enhanced zoom controls and mobile-optimized map interface

✓ **Complete Demo Experience with Direct Early Access Redirect** (July 08, 2025)
→ Removed all form submissions and replaced with direct redirects to https://dentconnect.replit.app/
→ Patient booking flow now shows "Complete Demo" button that redirects to early access
→ Dentist signup flow now shows "Complete Demo" button that redirects to early access
→ Early access form replaced with simple redirect button
→ All early access buttons throughout the app now redirect to external site

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