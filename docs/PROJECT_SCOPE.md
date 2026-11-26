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
- Responsive sidebar navigation with role-filtered navigation and a dedicated Sign Out control.
- Role-specific dashboard content and quick-access workspaces for Student, Job Seeker, Employer, Mentor and Administrator.
- Employer recruitment overview metrics and owned job-post status management (Draft, Published, Paused, Closed).
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

## Recruitment Hub extension
The platform includes a database-backed recruitment workflow: employer job posts, job discovery, saved jobs, applications, employer pipeline status changes, interview scheduling, job-alert preferences and a keyword-based CV/role comparison endpoint. Google and Facebook OAuth 2.0 routes are included and require provider credentials in the backend environment. AI-based semantic ranking and automated email/push delivery remain future integrations; the current CV comparison is transparent keyword matching and must not be represented as a final hiring decision.


## Role-specific workspace update
- Student and Job Seeker dashboards now present different career and opportunity actions.
- Employer dashboard shortcuts focus on company/recruitment work; the recruitment workspace displays job and applicant counts and supports changing the status of jobs owned by the signed-in employer.
- Mentor dashboard shortcuts focus on mentor profile, session planning and community records.
- Administrator dashboard shortcuts focus on user administration, role overview, recruitment, learning and platform activity.
- Sidebar navigation is filtered by role while retaining the existing monochrome visual theme and layout.
- Decorative role label in the dashboard heading was removed. Status indicators remain where they communicate real workflow states.

## Functional boundaries
- Job vacancy status changes are persisted through the authenticated API and are restricted to the owning employer (administrator accounts can manage only vacancies they own).
- Career, learning, mentor, community and portfolio record pages still use browser-local storage. They are not multi-user database workflows.
- Mentor appointment booking, mentor availability calendar, employer verification, job moderation, audit-log UI, granular permission editor, notifications delivery, real AI inference and CV PDF generation are not yet production-connected.
- AI/ATS keyword comparison remains a transparent keyword-based helper, not an AI hiring decision.
