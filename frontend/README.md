# Samui Transfers — Frontend

A Next.js frontend for booking private transfers on Koh Samui. Visitors enter pickup and drop‑off to see price and route, choose a vehicle, and submit a booking request.

## Features
- Google Places Autocomplete for pickup/drop‑off
- Route preview on Google Maps with clear pickup/drop‑off markers
- Dynamic map loading (client‑only) with duplicate‑script protection
- Mobile‑first UI with Tailwind CSS
- Vehicle highlights (Minibus, SUV) with media
- Clean booking form with validation and live trip summary
- Email notifications (admin + customer) via Nodemailer
- Company and “Managed by” details pulled from environment variables

## Tech Stack
- Next.js (App Router) and React
- Tailwind CSS
- @react-google-maps/api and react-google-places-autocomplete
- Nodemailer (API route)
- Deployed on Vercel

## Getting Started
Prerequisites:
- Node.js 18+ (LTS)
- A Google Maps API key with Places enabled
- SMTP credentials to send email

Install and run:
```bash
npm install
npm run dev
# open http://localhost:3000
```

Build and start:
```bash
npm run build
npm start
```

## Environment Variables
Create a .env.local in frontend/ (do not commit). Example:

```dotenv
# Client (exposed in browser)
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key

# SMTP (server-only)
# SSL (465)
SMTP_SSL_HOST=smtp.yourhost.com
SMTP_SSL_PORT=465
SMTP_SSL_USER=your_user
SMTP_SSL_PASS=your_pass
# Or STARTTLS (587)
# SMTP_HOST=smtp.yourhost.com
# SMTP_PORT=587
# SMTP_USER=your_user
# SMTP_PASS=your_pass

# Company details (used in email templates)
COMPANY_NAME=Samui Transfers
BOOKING_EMAIL=booking@samui-transfers.com
SUPPORT_EMAIL=info@samui-transfers.com
SUPPORT_PHONE=(+66) 99 108 7999
SUPPORT_WHATSAPP=66991087999
COMPANY_ADDRESS=9/38 Moo 6, Bo Phut, Ko Samui, Surat Thani 84320, Thailand
COMPANY_FACEBOOK=https://www.facebook.com/profile.php?id=61578880422159
COMPANY_WEBSITE=https://samui-transfers.com

# Managed by (email footer)
MANAGED_BY_NAME=Samui Transfers Co., Ltd.
MANAGED_BY_REG=0105551234567
MANAGED_BY_WEBSITE=https://www.f2.co.th
MANAGED_BY_EMAIL=management@samui-transfers.com
MANAGED_BY_PHONE=(+66) 64 027 0528
```

Notes:
- Only prefix values needed on the client with NEXT_PUBLIC_ (e.g., Google Maps key).
- Restart the dev server after editing .env.local.

## Key Paths
- app/page.tsx — Home page, client‑only map sections loaded via dynamic import
- components/Home/SearchSection.js — Pickup/drop‑off inputs, vehicle list
- components/Home/InputItem.js — Google Places Autocomplete input
- components/Home/GoogleMapsSection.js — Map, markers, and route rendering
- components/form/BookingForm.js — Booking flow container
- components/form/StepNavigation.tsx — Step indicator for booking
- pages/api/booking.js — Sends admin and customer emails via Nodemailer
- public/icons/ — SVG markers (pickup/drop‑off/person)

## Implementation Details
- Maps: useJsApiLoader({ id: "google-maps", libraries: ["places"] }) to inject the script once.
- DirectionsRenderer is rendered only when a valid DirectionsResult exists (prevents setDirections errors).
- Email templates use inline CSS compatible with major email clients; buttons spaced with margins (not gap/flex).

## Deployment (Vercel)
1) Push to a Git repository connected to Vercel.
2) Add Environment Variables in Vercel Project Settings (same keys as .env.local).
3) Deploy. Vercel will build and host the Next.js app.

## Troubleshooting
- “Google API already loaded”: ensure only useJsApiLoader is used; remove any LoadScript wrappers.
- Directions InvalidValueError: render DirectionsRenderer only with a valid result.
- Emails not sending: verify SMTP vars and ports (SSL 465 vs STARTTLS 587).

## License
No license specified. All rights reserved
