This is a Locoride frontend project.

## what is Locoride?
Locoride is a cutting-edge platform designed to revolutionize urban transportation. By leveraging advanced technologies, Locoride aims to provide efficient, eco-friendly, and cost-effective mobility solutions for city dwellers. The platform integrates various modes of transport, including ride-sharing, bike rentals, and public transit, into a seamless user experience. With real-time data analytics and AI-driven optimizations, Locoride ensures that users can navigate the city with ease, reducing traffic congestion and minimizing environmental impact.

## Features
- Multi-modal transportation options
- Real-time data analytics
- AI-driven route optimization
- Eco-friendly mobility solutions
- Cost-effective transportation services
- Seamless user experience
- Reduced traffic congestion
- Minimal environmental impact
- Cutting-edge urban mobility platform
- Efficient city navigation
- Advanced technologies
- Ride-sharing, bike rentals, and public transit integration
- Smart transportation solutions
- Sustainable urban development
- Innovative mobility services
- Urban transportation revolution
- City dwellers
- Eco-conscious commuters
- Smart city initiatives
- Sustainable transportation systems
- Green mobility solutions
- Urban mobility trends
- Future of transportation
- Mobility as a service

## Technologies
### Frontend
- React
- Next.js
- TypeScript
- Tailwind CSS
### Backend
- Golang
- Gin
- Node.js
- Express
### Database
- PostgreSQL
- MongoDB
- Redis
### Cloud and DevOps
- AWS
- Docker
- Kubernetes
- Vercel
- Google Maps API

- Google Fonts
- Font Awesome
- Unsplash
- Pexels
- Freepik
- Balsamiq
- Webflow

## Getting Started
Dowonload rpositories and install dependencies 

```bash
git clone https://github.com/psinthorn/locoride.git
npm run install --legacy-peer-deps

```
to run the frontend development server:

```bash
npm run dev
# or
pnpm dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Deploy on Vercel
### we are using Vercel for frontend deployment on 1st version
- [Vercel](https://vercel.com/)
- [Vercel Documentation](https://vercel.com/docs)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


# Corporate Identity
- [Logo](https://drive.google.com/file/d/1J9Q6J9Q9)
- [Color Palette](https://drive.google)
- [Typography](https://drive.google)
- [Iconography](https://drive.google)
- [Illustrations](https://drive.google)
- [Photography](https://drive.google)
- [Video](https://drive.google)
- [Audio](https://drive.google)
- [3D Assets](https://drive.google)
- [Animations](https://drive.google)
- [Design System](https://drive.google)
- [Brand Guidelines](https://drive.google)
- [Brand Assets](https://drive.google)

- color color='#f97316'

## Authentication & Authorization

Implemented with NextAuth (v5 beta) + Prisma.

Features:
- Email magic link (Nodemailer)
- Google & GitHub OAuth providers
- Database session strategy
- `User.role` column (default USER)
- Middleware protection for `/Admin` (requires ADMIN)
- API route guard helper `requireRole()`

### Environment Variables (frontend/.env.local)
```
DATABASE_URL=postgresql://user:pass@host:5432/db
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=secret
EMAIL_FROM="Support <no-reply@example.com>"
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=CHANGE_ME
```

Generate secret:
```
openssl rand -base64 32
```

### Promote an Admin User
After first sign-in:
```
node -e "(async()=>{const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();await p.user.update({where:{email:'admin@example.com'},data:{role:'ADMIN'}});console.log('Admin set');process.exit(0)})();"
```

### Extend Route Protection
Edit `frontend/middleware.ts` and add entries to `roleProtectedRoutes`.

### Client Hook
Use `useRole()` for conditional UI (e.g. show admin links).

### Admin Role Management UI
Navigate to `/Admin/users` as an ADMIN to view all users and adjust roles.

### Protected Admin API
- `GET /api/admin/users` – list users (ADMIN)
- `PATCH /api/admin/users/:id/role` – change a user role (ADMIN)

