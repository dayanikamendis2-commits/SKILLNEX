# SKILLNEX MVP Scope

## Included in this starter
1. Responsive application shell and dashboard.
2. Authentication UI: sign in, sign up, forgot password, reset password and email verification.
3. Secure password hashing and JWT authentication.
4. Admin-only user management: list, create, edit, role assignment, status management and soft deactivation.
5. PostgreSQL schema and Prisma seed.
6. Dashboard summary endpoint.

## Important implementation notes
- Password reset tokens expire after 30 minutes.
- Email verification is required for newly registered non-admin accounts.
- Configure SMTP before production use.
- A development-only reset link is returned when SMTP is not configured. Never expose this in production.
- The frontend currently stores a "remember me" token in localStorage and a non-remembered session token in sessionStorage. Before production, consider an HttpOnly Secure SameSite cookie strategy and CSRF protection.
- Add server-side validation, stronger rate limits, structured logging, tests, backup strategy and deployment hardening before public launch.

## Next development phases
- Career profile and Career DNA assessment
- Jobs, internships and applications
- CV upload, CV studio and AI CV analysis
- Skill gap analysis and career roadmap
- Learning content and progress
- Mock interview lab
- Portfolio builder and public profile
- Employer and mentor workspaces
- Notifications, moderation, analytics and audit-log viewer
- Dedicated React Native mobile applications
