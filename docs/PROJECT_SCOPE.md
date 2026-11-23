# SKILLNEX Project Scope — Upgrade Build

## Proposal-aligned modules represented in the web workspace
1. Authentication and User Management
2. AI Career DNA and Career Guidance
3. Job and Internship Management
4. AI Job Compatibility Engine
5. AI CV and Resume Studio
6. AI Skill Gap Analyzer
7. AI Career Roadmap Generator
8. AI Mock Interview Lab
9. Learning and Development Center
10. Professional Portfolio Builder
11. Digital Skill Passport
12. Career Market Insights
13. Professional Communication Studio
14. Mentor Connect and Professional Community
15. Employer and Recruitment Management
16. Administration and Platform Management

## Implemented in this upgrade
- Centered sign-in, registration and password recovery pages.
- Black, white and grey responsive visual theme.
- Responsive sidebar navigation with a dedicated Sign Out control.
- Module workspace pages with create, edit, search and delete interactions.
- Browser-local persistence for module records and preferences.
- Database-backed administrator user management using the existing API.
- Existing roles: ADMIN, STUDENT, JOB_SEEKER, EMPLOYER and MENTOR.
- Roles & Permissions overview.
- Settings sections for profile draft, appearance, notifications, security, privacy and language/region.

## Not yet implemented as production services
- Persisting each career module's records to PostgreSQL (module records are browser-local).
- Python/FastAPI AI inference and external AI provider integration.
- CV file parsing, ATS analysis and PDF generation.
- Real job-board integration, employer verification and full application workflow.
- Mentor booking, calendar synchronization and real-time community messaging.
- Server-enforced granular permissions for every role and module.
- Digital credential issuer verification, QR code services and secure document storage.
- Audit-log administration UI, platform-wide moderation and advanced analytics.
- React Native mobile application, Socket.IO services, Docker and Swagger/OpenAPI deployment setup.

AI module pages are input/record workspaces only until a real AI service is configured. The interface does not claim that placeholder records are AI-generated analysis.
