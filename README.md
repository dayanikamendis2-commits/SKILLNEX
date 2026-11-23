# SKILLNEX — AI-Powered Career Development & Professional Growth Platform

SKILLNEX is a responsive career-development platform starter built from the supplied project proposal. This upgraded build includes a monochrome interface, centered authentication, an expanded 16-module workspace, administrator user management, role overview and account settings.

## Technology
- Frontend: React, TypeScript, Vite, React Router, Lucide React
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT and bcrypt password hashing
- Email: Nodemailer (SMTP configuration required)
- Styling: Responsive custom CSS, black / white / grey theme

## Prerequisites
- Node.js 20+
- npm
- PostgreSQL 15+

## 1. Configure the backend
From the project root:

```powershell
cd backend
copy .env.example .env
```

Edit `backend/.env` locally. Set your own PostgreSQL password and a long random JWT secret. Example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/skillnex?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

If PostgreSQL is running on another port, use that port in `DATABASE_URL`. Do not commit `.env` or real credentials.

## 2. Install and initialize the backend

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The seed creates the initial administrator:
- Email: `admin@skillnex.local`
- Password: `ChangeMe123!`

Change the default password after the first login. Keep the backend terminal running.

## 3. Start the frontend
Open a second terminal at the project root:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Included capabilities

### Authentication and account management
- Centered, responsive login, registration, forgot-password and reset-password pages
- Remember Me
- JWT authentication and bcrypt password hashing
- Email verification and password recovery flows (SMTP required for delivery)
- Administrator user management: create, edit, assign existing roles, activate/deactivate accounts
- Existing roles: Administrator, Student, Job Seeker, Employer and Mentor
- Roles & Permissions overview
- Sidebar Sign Out and responsive navigation

### Proposal-aligned workspace modules
- AI Career DNA & Career Guidance
- Jobs & Internships
- AI Job Compatibility
- AI CV & Resume Studio
- AI Skill Gap Analyzer
- AI Career Roadmap
- AI Mock Interview Lab
- Learning & Development Center
- Professional Portfolio Builder
- Digital Skill Passport
- Career Market Insights
- Professional Communication Studio
- Mentor Connect & Professional Community
- Employer & Recruitment Management
- Administration foundations and Career Analytics

Each workspace module currently supports creating, editing, searching and deleting local workspace records. These module records are stored in the browser's local storage on the current device. They are not yet synchronized to PostgreSQL or shared between users.

### Settings
- Profile draft fields
- Monochrome appearance preferences, compact layout and contrast preferences
- Notification preferences
- Security and session guidance
- Privacy and profile visibility preferences
- Language, time zone and date format preferences

Settings preferences are stored locally in the current browser. Profile update API, account export/deletion and server-side preference synchronization still need backend implementation.

## Important implementation notes
This ZIP is an expanded, runnable MVP foundation—not a production-complete delivery of every proposal capability. The supplied proposal specifies a separate Python/FastAPI AI service, mobile app, real-time communication, file/object storage, job/recruitment workflows, mentor scheduling, credential verification and platform-wide moderation. These integrations are not included as live services in this build.

AI-related pages provide input and record-management workspaces. They clearly indicate that live AI analysis, scoring and generation require a configured AI service and provider credentials; no simulated AI results are presented as real analysis.

The user-management API is database-backed. Other proposal module records and browser settings are currently local to each browser. Before production, implement backend APIs and database models for those modules, add fine-grained permission enforcement, configure SMTP and AI services, add secure file storage, tests, audit coverage and deployment secrets.

## Existing API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `GET /api/auth/me`
- `GET /api/users` (Admin)
- `POST /api/users` (Admin)
- `PATCH /api/users/:id` (Admin)
- `DELETE /api/users/:id` (Admin; soft deactivates)
- `GET /api/dashboard/summary`
- `GET /api/health`

## Security
Never upload `.env` files, database passwords, SMTP credentials or JWT secrets to GitHub. Replace the seeded administrator password before using the app beyond local development.
