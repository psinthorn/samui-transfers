# Speedboat & Tour Service Implementation Checklist
## Phase-by-Phase Execution Guide

**Document Version:** 1.0  
**Date:** December 7, 2025  
**Status:** Ready for Implementation  
**Estimated Total Duration:** 7-10 working days

---

## Quick Overview

**Total Tasks:** 87 items across 5 phases  
**Estimated Effort:** 38-50 hours  
**Phases:**
- Phase 1: Database Schema (1 day)
- Phase 2: API Implementation (2-3 days)
- Phase 3: Frontend Components (2-3 days)
- Phase 4: Admin Dashboard (1-2 days)
- Phase 5: Testing & QA (1-2 days)

---

## PHASE 1: DATABASE SCHEMA EXTENSION
**Duration:** 1 day | **Tasks:** 15

### Database Preparation (3 tasks)
- [ ] **1.1** Create backup of current database
  ```bash
  pg_dump samui_transfers > backup_$(date +%Y%m%d).sql
  ```
  - Status: Not Started
  - Assignee: DBA
  - Notes: Keep backup for 30 days minimum

- [ ] **1.2** Verify current schema version
  ```bash
  npm run prisma:status
  ```
  - Status: Not Started
  - Assignee: Developer
  - Expected: All migrations applied

- [ ] **1.3** Document baseline performance metrics
  - Total tables: 15
  - Total connections: ~5k DAU
  - Query response times: <100ms average
  - Status: Not Started
  - Assignee: DevOps

### Schema Creation (6 tasks)
- [ ] **1.4** Add `ServiceType` enum to schema
  ```prisma
  enum ServiceType {
    TRANSFER
    BOAT
    TOUR
    EVENT
    PACKAGE
  }
  ```
  - Status: Not Started
  - Assignee: Developer
  - File: `prisma/schema.prisma`

- [ ] **1.5** Create Speedboat models (4 models)
  - [ ] Speedboat
  - [ ] SpeedboatRate
  - [ ] SpeedboatBooking
  - [ ] SpeedboatCaptainAssignment
  - Status: Not Started
  - Assignee: Developer
  - File: `prisma/schema.prisma`
  - Complexity: Medium (relationships with Driver)

- [ ] **1.6** Create Tour models (5 models)
  - [ ] TourPackage
  - [ ] TourLocation
  - [ ] TourRate
  - [ ] TourSchedule
  - [ ] TourBooking
  - Status: Not Started
  - Assignee: Developer
  - File: `prisma/schema.prisma`
  - Complexity: High (nested relationships)

- [ ] **1.7** Create Event models (2 models)
  - [ ] SpecialEvent
  - [ ] EventRate
  - [ ] EventBooking
  - Status: Not Started
  - Assignee: Developer
  - File: `prisma/schema.prisma`
  - Complexity: Low

- [ ] **1.8** Update Booking model
  - Add `serviceType` field (ServiceType enum)
  - Add `serviceId` field (String optional)
  - Add `isBundle` field (Boolean default false)
  - Add `parentBookingId` field (String optional)
  - Add relations to service-specific tables
  - Status: Not Started
  - Assignee: Developer
  - File: `prisma/schema.prisma`

- [ ] **1.9** Update Driver model
  - Add `isBoatOperator` boolean (default false)
  - Add `isTourGuide` boolean (default false)
  - Add `certifications` Json field
  - Add relations to Speedboat and Tour models
  - Status: Not Started
  - Assignee: Developer
  - File: `prisma/schema.prisma`

- [ ] **1.10** Add indexes and constraints
  - Verify all models have appropriate indexes
  - Check foreign key constraints
  - Validate unique constraints
  - Status: Not Started
  - Assignee: Developer
  - File: `prisma/schema.prisma`

### Migration & Validation (6 tasks)
- [ ] **1.11** Create migration file
  ```bash
  npm run prisma:migration-create "add_speedboat_tour_event_services"
  ```
  - Status: Not Started
  - Assignee: Developer
  - Expected Output: `prisma/migrations/20251207_add_speedboat_tour_event_services/migration.sql`

- [ ] **1.12** Review migration SQL
  - Check for data loss risks
  - Verify all constraints
  - Confirm indexes creation
  - Status: Not Started
  - Assignee: Senior Developer (Code Review)

- [ ] **1.13** Apply migration to development database
  ```bash
  npm run prisma:migrate-dev
  ```
  - Status: Not Started
  - Assignee: Developer
  - Expected: All tables created, schema updated

- [ ] **1.14** Regenerate Prisma Client
  ```bash
  npm run prisma:generate
  ```
  - Status: Not Started
  - Assignee: Developer
  - Expected: `node_modules/.prisma/client/` updated

- [ ] **1.15** Validate schema compilation
  ```bash
  npm run prisma:validate
  ```
  - Status: Not Started
  - Assignee: Developer
  - Expected: ✅ No errors

- [ ] **1.16** Document schema changes
  - Create changelog entry
  - Update API documentation
  - Document new models
  - Status: Not Started
  - Assignee: Tech Writer
  - File: `SCHEMA_CHANGELOG_DECEMBER_2025.md`

---

## PHASE 2: API IMPLEMENTATION
**Duration:** 2-3 days | **Tasks:** 28

### Speedboat API Endpoints (8 tasks)
- [ ] **2.1** Create boat inventory endpoints
  - [ ] `POST /api/admin/speedboats` - Create boat
  - [ ] `GET /api/admin/speedboats` - List all boats
  - [ ] `PUT /api/admin/speedboats/[id]` - Update boat
  - [ ] `DELETE /api/admin/speedboats/[id]` - Retire boat
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/speedboats/route.ts`

- [ ] **2.2** Create boat rating endpoints
  - [ ] `POST /api/admin/speedboats/[id]/rates` - Create rate
  - [ ] `GET /api/admin/speedboats/[id]/rates` - List rates
  - [ ] `PUT /api/admin/speedboats-rates/[id]` - Update rate
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/speedboats-rates/route.ts`

- [ ] **2.3** Create captain assignment endpoints
  - [ ] `POST /api/admin/speedboats/[id]/captains` - Assign captain
  - [ ] `GET /api/admin/speedboats/[id]/captains` - List assigned captains
  - [ ] `PUT /api/admin/speedboats-captains/[id]` - Update assignment
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/speedboats-captains/route.ts`

- [ ] **2.4** Create speedboat booking endpoint
  - [ ] `POST /api/bookings/speedboat` - Create booking
  - [ ] `GET /api/bookings/speedboat/[id]` - Get booking
  - [ ] `PUT /api/bookings/speedboat/[id]` - Update booking
  - [ ] `POST /api/bookings/speedboat/[id]/cancel` - Cancel booking
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/bookings/speedboat/route.ts`

- [ ] **2.5** Create boat availability check
  - Endpoint: `GET /api/speedboats/availability`
  - Query params: `date, duration, passengerCount`
  - Response: List of available boats with prices
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/speedboats/availability/route.ts`

- [ ] **2.6** Create boat status endpoints
  - [ ] `GET /api/speedboats/[id]/maintenance-schedule` - Get maintenance info
  - [ ] `POST /api/admin/speedboats/[id]/maintenance` - Schedule maintenance
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/speedboats/[id]/maintenance/route.ts`

### Tour API Endpoints (10 tasks)
- [ ] **2.7** Create tour package endpoints
  - [ ] `POST /api/admin/tours` - Create tour
  - [ ] `GET /api/admin/tours` - List all tours
  - [ ] `PUT /api/admin/tours/[id]` - Update tour
  - [ ] `DELETE /api/admin/tours/[id]` - Archive tour
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/tours/route.ts`

- [ ] **2.8** Create tour location endpoints
  - [ ] `POST /api/admin/tours/[id]/locations` - Add location
  - [ ] `GET /api/admin/tours/[id]/locations` - List locations
  - [ ] `PUT /api/admin/tour-locations/[id]` - Update location
  - [ ] `DELETE /api/admin/tour-locations/[id]` - Remove location
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/tour-locations/route.ts`

- [ ] **2.9** Create tour rate endpoints
  - [ ] `POST /api/admin/tours/[id]/rates` - Add pricing tier
  - [ ] `GET /api/admin/tours/[id]/rates` - List rates
  - [ ] `PUT /api/admin/tour-rates/[id]` - Update rate
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/tour-rates/route.ts`

- [ ] **2.10** Create tour schedule endpoints
  - [ ] `POST /api/admin/tours/[id]/schedules` - Add tour date
  - [ ] `GET /api/admin/tours/[id]/schedules` - List dates
  - [ ] `PUT /api/admin/tour-schedules/[id]` - Update schedule
  - [ ] `DELETE /api/admin/tour-schedules/[id]` - Remove date
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/tour-schedules/route.ts`

- [ ] **2.11** Create tour booking endpoints
  - [ ] `POST /api/bookings/tour` - Create booking
  - [ ] `GET /api/bookings/tour/[id]` - Get booking
  - [ ] `PUT /api/bookings/tour/[id]` - Update booking
  - [ ] `POST /api/bookings/tour/[id]/cancel` - Cancel booking
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/bookings/tour/route.ts`

- [ ] **2.12** Create tour search & filter
  - Endpoint: `GET /api/tours/search`
  - Query: `type, date, groupSize, island, priceMax`
  - Response: Filtered tour packages with availability
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/tours/search/route.ts`

### Event API Endpoints (6 tasks)
- [ ] **2.13** Create event endpoints
  - [ ] `POST /api/admin/events` - Create event
  - [ ] `GET /api/admin/events` - List events
  - [ ] `PUT /api/admin/events/[id]` - Update event
  - [ ] `DELETE /api/admin/events/[id]` - Cancel event
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/events/route.ts`

- [ ] **2.14** Create event rate endpoints
  - [ ] `POST /api/admin/events/[id]/rates` - Add pricing tier
  - [ ] `GET /api/admin/events/[id]/rates` - List rates
  - [ ] `PUT /api/admin/event-rates/[id]` - Update rate
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/admin/event-rates/route.ts`

- [ ] **2.15** Create event booking endpoints
  - [ ] `POST /api/bookings/event` - Register for event
  - [ ] `GET /api/bookings/event/[id]` - Get registration
  - [ ] `PUT /api/bookings/event/[id]` - Update registration
  - [ ] `POST /api/bookings/event/[id]/cancel` - Cancel registration
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/bookings/event/route.ts`

- [ ] **2.16** Create event search endpoint
  - Endpoint: `GET /api/events/upcoming`
  - Query: `limit, theme, dateFrom, dateTo`
  - Response: Upcoming events with availability
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/events/upcoming/route.ts`

### Cross-Service Endpoints (4 tasks)
- [ ] **2.17** Update booking list endpoint
  - Filter by `serviceType` parameter
  - Support: TRANSFER, BOAT, TOUR, EVENT
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/bookings/route.ts` (update existing)

- [ ] **2.18** Create booking summary endpoint
  - Endpoint: `GET /api/bookings/summary`
  - Response: Count by service type, revenue by type
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/bookings/summary/route.ts`

- [ ] **2.19** Create availability calendar
  - Endpoint: `GET /api/availability-calendar`
  - Query: `month, year, serviceType`
  - Response: Calendar with available dates
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/availability-calendar/route.ts`

- [ ] **2.20** Create pricing calculator
  - Endpoint: `GET /api/calculate-price`
  - Query: `serviceType, serviceId, date, quantity`
  - Response: Breakdown of costs (base + surcharges + tax)
  - Status: Not Started
  - Assignee: Backend Developer
  - File: `app/api/calculate-price/route.ts`

### API Validation & Tests (4 tasks)
- [ ] **2.21** Add input validation to all endpoints
  - [ ] Validate required fields
  - [ ] Check data types
  - [ ] Verify foreign key references
  - [ ] Check date/time validity
  - Status: Not Started
  - Assignee: Backend Developer
  - Framework: Zod or Joi

- [ ] **2.22** Add authentication checks
  - [ ] Public endpoints (search, availability)
  - [ ] User endpoints (my bookings)
  - [ ] Admin endpoints (/admin/*)
  - Status: Not Started
  - Assignee: Backend Developer
  - Framework: NextAuth.js

- [ ] **2.23** Create API unit tests
  - [ ] Test CRUD for each model
  - [ ] Test availability calculations
  - [ ] Test pricing calculations
  - [ ] Test error handling
  - Status: Not Started
  - Assignee: QA Engineer
  - Framework: Jest + Supertest

- [ ] **2.24** Create API integration tests
  - [ ] Full booking flow (boat, tour, event)
  - [ ] Payment integration
  - [ ] Cancellation workflows
  - Status: Not Started
  - Assignee: QA Engineer
  - Framework: Jest

### API Documentation (4 tasks)
- [ ] **2.25** Document all new endpoints in OpenAPI/Swagger
  - File: `docs/api-schema.yaml`
  - Include: request/response examples
  - Status: Not Started
  - Assignee: Tech Writer

- [ ] **2.26** Create API endpoint usage guide
  - File: `docs/API_ENDPOINTS_GUIDE.md`
  - Include: authentication, error codes, rate limits
  - Status: Not Started
  - Assignee: Tech Writer

- [ ] **2.27** Add TypeScript types for all models
  - File: `lib/types/speedboat.ts`, `lib/types/tour.ts`, etc.
  - Status: Not Started
  - Assignee: Backend Developer

- [ ] **2.28** Create error handling documentation
  - Common errors and solutions
  - Error codes reference
  - Status: Not Started
  - Assignee: Tech Writer

---

## PHASE 3: FRONTEND COMPONENTS
**Duration:** 2-3 days | **Tasks:** 26

### Speedboat Components (6 tasks)
- [ ] **3.1** Create `SpeedboatCard` component
  - Display: boat name, capacity, type, price
  - Image: boat photo
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/speedboat/SpeedboatCard.tsx`

- [ ] **3.2** Create `SpeedboatServiceSelector` component
  - Choose trip type: DAY_TRIP, ISLAND_HOPPING, etc.
  - Display available boats
  - Show prices
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/speedboat/SpeedboatServiceSelector.tsx`

- [ ] **3.3** Create `SpeedboatTripDetails` component
  - Select date and time
  - Choose departure/return port
  - Passenger count
  - Special requests
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/speedboat/SpeedboatTripDetails.tsx`

- [ ] **3.4** Create `SpeedboatBookingSummary` component
  - Show selected boat, date, passengers
  - Display calculated price
  - Show inclusions/exclusions
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/speedboat/SpeedboatBookingSummary.tsx`

- [ ] **3.5** Create `SpeedboatReviewForm` component
  - Rating (1-5 stars)
  - Photo upload
  - Review text
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/speedboat/SpeedboatReviewForm.tsx`

- [ ] **3.6** Create speedboat listing page
  - Endpoint: `/boats` or `/services/boats`
  - Filter by: type, capacity, price
  - Sort options
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/boats/page.tsx`

### Tour Components (8 tasks)
- [ ] **3.7** Create `TourPackageCard` component
  - Display: tour name, duration, price
  - Show islands covered
  - Rating/reviews
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/tours/TourPackageCard.tsx`

- [ ] **3.8** Create `TourItineraryDisplay` component
  - Timeline of stops
  - Map visualization (if available)
  - Activities at each stop
  - Duration per stop
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/tours/TourItineraryDisplay.tsx`

- [ ] **3.9** Create `TourDateSelector` component
  - Calendar view of available dates
  - Show guide assigned
  - Display availability/capacity
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/tours/TourDateSelector.tsx`

- [ ] **3.10** Create `TourGroupSizeSelector` component
  - Input group size
  - Show price per person
  - Calculate total
  - Show capacity warnings
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/tours/TourGroupSizeSelector.tsx`

- [ ] **3.11** Create `TourAddOnsSelector` component
  - Checkboxes for add-ons: photos, meals, etc.
  - Show extra cost
  - Calculate total with add-ons
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/tours/TourAddOnsSelector.tsx`

- [ ] **3.12** Create `TourBookingFlow` component
  - Multi-step form combining above components
  - Step 1: Select tour
  - Step 2: Choose date
  - Step 3: Group size + add-ons
  - Step 4: Review & pay
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/tours/TourBookingFlow.tsx`

- [ ] **3.13** Create `TourReviewForm` component
  - Rating (1-5 stars)
  - Review text
  - Photo gallery from guide
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/tours/TourReviewForm.tsx`

- [ ] **3.14** Create tour listing page
  - Endpoint: `/tours`
  - Filter by: type, duration, price, islands
  - Sort options
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/tours/page.tsx`

### Event Components (5 tasks)
- [ ] **3.15** Create `EventCard` component
  - Display: event name, date, venue, capacity
  - Show theme and inclusions
  - Available tiers
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/events/EventCard.tsx`

- [ ] **3.16** Create `EventDetailsDisplay` component
  - Full event description
  - Timeline/schedule
  - Entertainment details
  - Venue map/location
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/events/EventDetailsDisplay.tsx`

- [ ] **3.17** Create `EventTierSelector` component
  - Show available tiers (EARLY_BIRD, REGULAR, VIP)
  - Display prices and dates
  - Show availability
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/events/EventTierSelector.tsx`

- [ ] **3.18** Create `EventGuestManager` component
  - Add/remove guests
  - Guest name field
  - Total guest count
  - Special requests per guest
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/events/EventGuestManager.tsx`

- [ ] **3.19** Create event listing page
  - Endpoint: `/events` or `/special-events`
  - Filter by: theme, date range
  - Sort: upcoming first
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/events/page.tsx`

### Cross-Service Components (4 tasks)
- [ ] **3.20** Create `ServiceTypeSelector` component
  - Radio buttons: TRANSFER, BOAT, TOUR, EVENT
  - Show icon/description for each
  - Conditionally load service components
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/booking/ServiceTypeSelector.tsx`

- [ ] **3.21** Create `BookingFlow` update
  - Add service type selection as step 1
  - Load service-specific components
  - Unified booking summary
  - Unified payment processor
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/booking/BookingFlow.tsx` (update)

- [ ] **3.22** Update `MyBookings` page
  - Filter bookings by service type
  - Show service-specific details
  - Appropriate action buttons (rate, reschedule, etc.)
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/bookings/page.tsx` (update)

- [ ] **3.23** Create `AvailabilityCalendar` component
  - Show available dates for selected service
  - Color-code: available/unavailable/sold-out
  - Click to select date
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/common/AvailabilityCalendar.tsx`

### Component Tests (3 tasks)
- [ ] **3.24** Create component unit tests
  - Test each component in isolation
  - Mock props and API calls
  - Test state changes and interactions
  - Status: Not Started
  - Assignee: Frontend Developer
  - Framework: Jest + React Testing Library

- [ ] **3.25** Create component integration tests
  - Test component combinations
  - Test full booking flows
  - Test form submissions
  - Status: Not Started
  - Assignee: Frontend Developer
  - Framework: Jest + React Testing Library

- [ ] **3.26** Test responsive design
  - Mobile (375px)
  - Tablet (768px)
  - Desktop (1024px+)
  - Status: Not Started
  - Assignee: Frontend Developer / QA

---

## PHASE 4: ADMIN DASHBOARD
**Duration:** 1-2 days | **Tasks:** 12

### Speedboat Admin (4 tasks)
- [ ] **4.1** Create `/admin/speedboats` page
  - List all boats with status
  - Add/edit/delete functionality
  - Quick actions: maintenance, retire
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/speedboats/page.tsx`

- [ ] **4.2** Create speedboat form component
  - Create new boat modal/page
  - Edit existing boat modal
  - Validation: capacity > crew
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/admin/SpeedboatForm.tsx`

- [ ] **4.3** Create boat rates management
  - Page: `/admin/speedboats/[id]/rates`
  - List existing rates
  - Add/edit rate tiers
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/speedboats/[id]/rates/page.tsx`

- [ ] **4.4** Create captain assignment interface
  - Page: `/admin/speedboats/[id]/captains`
  - Select and assign captains
  - View certification expiry
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/speedboats/[id]/captains/page.tsx`

### Tour Admin (4 tasks)
- [ ] **4.5** Create `/admin/tours` page
  - List all tours
  - Add/edit/delete functionality
  - Quick filter: active/archived
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/tours/page.tsx`

- [ ] **4.6** Create tour form component
  - Multi-step form for new tour
  - General info, locations, rates, schedules
  - Validation: dates, prices, etc.
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/admin/TourForm.tsx`

- [ ] **4.7** Create tour itinerary builder
  - Page: `/admin/tours/[id]/itinerary`
  - Add/reorder/delete locations
  - Set timing for each stop
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/tours/[id]/itinerary/page.tsx`

- [ ] **4.8** Create tour schedule manager
  - Page: `/admin/tours/[id]/schedules`
  - Calendar view of scheduled dates
  - Add new tour dates
  - Assign guides
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/tours/[id]/schedules/page.tsx`

### Event Admin (2 tasks)
- [ ] **4.9** Create `/admin/events` page
  - List all events
  - Add/edit/delete functionality
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/events/page.tsx`

- [ ] **4.10** Create event form component
  - Create/edit event modal
  - Set dates, capacity, pricing tiers
  - Manage entertainment details
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/components/admin/EventForm.tsx`

### Driver/Staff Admin (2 tasks)
- [ ] **4.11** Update `/admin/drivers` page
  - Add boat operator flag
  - Add tour guide flag
  - Manage certifications
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/drivers/page.tsx` (update)

- [ ] **4.12** Create staff certification manager
  - Page: `/admin/staff-certifications`
  - View all certifications
  - Expiry alerts/notifications
  - Renewal reminders
  - Status: Not Started
  - Assignee: Frontend Developer
  - File: `app/app/admin/staff-certifications/page.tsx`

---

## PHASE 5: TESTING & QA
**Duration:** 1-2 days | **Tasks:** 6

### Functional Testing (2 tasks)
- [ ] **5.1** Test speedboat booking flow
  - Select boat → Choose date → Review → Pay
  - Test all boat types and trip durations
  - Verify capacity constraints
  - Test cancellation with refund
  - Test with multiple payment methods
  - Status: Not Started
  - Assignee: QA Engineer
  - Test Cases: 12+ scenarios

- [ ] **5.2** Test tour booking flow
  - Select tour → Choose date → Group size → Add-ons → Review → Pay
  - Test all tour types and group sizes
  - Verify pricing calculations
  - Test guide assignment
  - Test payment processing
  - Status: Not Started
  - Assignee: QA Engineer
  - Test Cases: 15+ scenarios

- [ ] **5.3** Test event registration flow
  - Select event → Choose tier → Add guests → Review → Pay
  - Test capacity limits
  - Test tier availability dates
  - Test sold-out handling
  - Status: Not Started
  - Assignee: QA Engineer
  - Test Cases: 10+ scenarios

### Performance Testing (1 task)
- [ ] **5.4** Performance & load testing
  - Test database query performance (< 100ms)
  - Test API response times (< 500ms)
  - Load testing: 1000 concurrent users
  - Monitor memory/CPU usage
  - Status: Not Started
  - Assignee: DevOps/QA
  - Tools: k6, JMeter

### Security Testing (1 task)
- [ ] **5.5** Security audit
  - Check SQL injection vulnerability
  - Verify authentication on admin endpoints
  - Test authorization (user can't modify other's bookings)
  - Check sensitive data encryption
  - Status: Not Started
  - Assignee: Security Team / Senior Dev

### Deployment Preparation (2 tasks)
- [ ] **5.6** Create deployment checklist
  - Database backup before migration
  - Feature flags for gradual rollout
  - Monitoring alerts
  - Rollback plan
  - Status: Not Started
  - Assignee: DevOps
  - File: `DEPLOYMENT_CHECKLIST_SPEEDBOAT_TOUR.md`

- [ ] **5.7** Documentation & training
  - Update user docs
  - Create admin guide
  - Train support team
  - Create FAQ
  - Status: Not Started
  - Assignee: Tech Writer / Product Manager
  - Files: Multiple MD files

---

## Task Status Legend

| Status | Symbol | Meaning |
|--------|--------|---------|
| Not Started | ☐ | Task ready to begin |
| In Progress | 🔄 | Currently being worked on |
| Blocked | ⚠️ | Waiting for dependency |
| Completed | ✅ | Task finished and tested |
| On Hold | ⏸️ | Temporarily paused |

---

## Dependency Map

```
PHASE 1 (Database) ━━━━┓
                        ├─→ PHASE 2 (API)
                        ├─→ PHASE 3 (Frontend)
                        
PHASE 2 (API) ━━━━┓
                   ├─→ PHASE 4 (Admin)
                   
PHASE 3 (Frontend) ━┛
                     ├─→ PHASE 5 (Testing)
                     
PHASE 4 (Admin) ━━━┛

Critical Path: Phase 1 → Phase 2 → Phase 5
Parallel Work: Phase 3 & 4 can start after Phase 1
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Migration fails on production | Low | High | Test on staging first, have rollback |
| Performance degradation | Medium | Medium | Run load tests, optimize indexes |
| Breaking existing transfers | Low | Critical | Feature flags, extensive testing |
| Staff certification outdated | Medium | Medium | Alert system, renewal tracking |
| Double-booking race condition | Low | Medium | Database constraints, transaction logic |

---

## Success Criteria

✅ **All 87 tasks completed**  
✅ **Zero test failures in Phase 5**  
✅ **No breaking changes to existing transfer bookings**  
✅ **All new features performant (< 500ms API response)**  
✅ **100% code coverage for business logic**  
✅ **User & admin documentation complete**  
✅ **Staff trained on new admin features**  
✅ **Deployment successful with zero downtime**  

---

## Timeline Estimate

```
Week 1:
  Mon: Phase 1 (Database)
  Tue-Wed: Phase 2 (API) & Phase 3 (Frontend) in parallel
  Thu: Phase 4 (Admin)
  Fri: Phase 5 (Testing) + final fixes

Week 2:
  Mon: Production deployment
  Tue-Fri: Monitoring & hotfixes
```

**Total: 1.5 weeks if all resources available**  
**Realistic: 2-3 weeks with standard team capacity**

---

## Sign-Off

**Prepared by:** Architecture Team  
**Date:** December 7, 2025  
**Status:** Ready for Execution  
**Next Action:** Executive Approval → Phase 1 Start

