# SKILLNEX — AI-Powered Career Development & Professional Growth Platform

A responsive web application starter for desktop, tablet and mobile. This first MVP includes:
- Responsive SKILLNEX dashboard and navigation
- Login, registration, forgot-password and reset-password screens
- JWT authentication with bcrypt password hashing
- Role-aware user management API (Admin)
- PostgreSQL database schema using Prisma
- Profile and dashboard API foundations

## Technology
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Styling: Custom responsive CSS

## Requirements
- Node.js 20+
- PostgreSQL 15+
- npm

## 1. Configure the backend
```bash
cd backend
copy .env.example .env
```
Edit `backend/.env` and set `DATABASE_URL`, `JWT_SECRET`, and (optionally) SMTP settings.

Example:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/skillnex?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

## 2. Install and initialize the database
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
The seed script creates an admin account:
- Email: `admin@skillnex.local`
- Password: `ChangeMe123!`

Change this password immediately after your first login.

## 3. Run the frontend
Open a second terminal:
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173`.

## Authentication notes
- Registration creates a Student account by default. Users cannot self-register as Admin.
- Password reset endpoints are implemented. To send real emails, configure SMTP variables in `backend/.env`. If SMTP is not configured, the development API returns the reset token in its response; do not enable this behavior in production.
- Email verification token generation is implemented; configure SMTP to deliver the verification link.
- Use HTTPS, a strong JWT secret, rate limiting, secure deployment secrets and production email delivery before launch.

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/users` (Admin)
- `POST /api/users` (Admin)
- `PATCH /api/users/:id` (Admin)
- `DELETE /api/users/:id` (Admin; soft-deactivates)
- `GET /api/dashboard/summary`

## Current scope
This is the first runnable foundation, not the finished 16-module SKILLNEX platform. Job marketplace, AI services, CV analysis, learning content, interviews, mentor booking and native mobile apps are planned modules to build on this base.
