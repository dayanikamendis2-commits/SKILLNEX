import { Router } from "express";
import { prisma } from "../server";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);
const seekerRoles = ["STUDENT", "JOB_SEEKER"];
const employerRoles = ["EMPLOYER", "ADMIN"];

router.get("/", async (req: AuthRequest, res) => {
  const q = String(req.query.q || "").trim();
  const location = String(req.query.location || "").trim();
  const mode = String(req.query.mode || "").trim();
  const type = String(req.query.type || "").trim();
  const skills = String(req.query.skills || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  const jobs = await prisma.job.findMany({ where: { status: "PUBLISHED", ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { companyName: { contains: q, mode: "insensitive" as const } }, { skills: { hasSome: [q] } }] } : {}), ...(location ? { location: { contains: location, mode: "insensitive" as const } } : {}), ...(mode ? { workMode: mode } : {}), ...(type ? { employmentType: type } : {}) }, include: { employer: { select: { fullName: true, avatarUrl: true } }, _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" } });
  const saved = await prisma.savedJob.findMany({ where: { userId: req.user!.id }, select: { jobId: true } });
  const savedIds = new Set(saved.map(x => x.jobId));
  res.json({ jobs: jobs.map(j => ({ ...j, saved: savedIds.has(j.id), matchScore: skills.length ? Math.round(skills.filter(s => j.skills.some(k => k.toLowerCase() === s)).length / skills.length * 100) : null })) });
});

router.post("/", async (req: AuthRequest, res) => {
  if (!employerRoles.includes(req.user!.role)) return res.status(403).json({ message: "Only employer accounts can publish jobs." });
  const b = req.body;
  if (!b.title?.trim() || !b.companyName?.trim() || !b.description?.trim()) return res.status(400).json({ message: "Job title, company and description are required." });
  const job = await prisma.job.create({ data: { employerId: req.user!.id, title: String(b.title).trim(), companyName: String(b.companyName).trim(), location: b.location || null, workMode: b.workMode || "On-site", employmentType: b.employmentType || "Full-time", salaryMin: b.salaryMin ? Number(b.salaryMin) : null, salaryMax: b.salaryMax ? Number(b.salaryMax) : null, currency: b.currency || "LKR", description: String(b.description), responsibilities: b.responsibilities || null, requirements: b.requirements || null, skills: Array.isArray(b.skills) ? b.skills.map(String).slice(0, 40) : [], applicationDeadline: b.applicationDeadline ? new Date(b.applicationDeadline) : null, status: b.publish ? "PUBLISHED" : "DRAFT" } });
  res.status(201).json({ job });
});

router.get("/mine", async (req: AuthRequest, res) => {
  if (!employerRoles.includes(req.user!.role)) return res.status(403).json({ message: "Employer access required." });
  const jobs = await prisma.job.findMany({ where: { employerId: req.user!.id }, include: { _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" } });
  res.json({ jobs });
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  if (!employerRoles.includes(req.user!.role)) return res.status(403).json({ message: "Employer access required." });
  const allowed = ["DRAFT", "PUBLISHED", "PAUSED", "CLOSED"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid job status." });
  const existing = await prisma.job.findFirst({ where: { id: req.params.id, employerId: req.user!.id } });
  if (!existing) return res.status(404).json({ message: "Job post not found." });
  const job = await prisma.job.update({ where: { id: existing.id }, data: { status: req.body.status } });
  res.json({ job });
});

router.get("/applications/mine", async (req: AuthRequest, res) => {
  const applications = await prisma.jobApplication.findMany({ where: { applicantId: req.user!.id }, include: { job: { include: { employer: { select: { fullName: true } } } } }, orderBy: { appliedAt: "desc" } });
  res.json({ applications });
});
router.get("/applications/inbox", async (req: AuthRequest, res) => {
  if (!employerRoles.includes(req.user!.role)) return res.status(403).json({ message: "Employer access required." });
  const applications = await prisma.jobApplication.findMany({ where: { job: { employerId: req.user!.id } }, include: { applicant: { select: { id: true, fullName: true, email: true, headline: true, location: true } }, job: true }, orderBy: { appliedAt: "desc" } });
  res.json({ applications });
});
router.post("/:id/apply", async (req: AuthRequest, res) => {
  if (!seekerRoles.includes(req.user!.role)) return res.status(403).json({ message: "Student or Job Seeker accounts can apply to jobs." });
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job || job.status !== "PUBLISHED") return res.status(404).json({ message: "This job is no longer available." });
  if (job.applicationDeadline && job.applicationDeadline < new Date()) return res.status(400).json({ message: "The application deadline has passed." });
  try { const application = await prisma.jobApplication.create({ data: { jobId: job.id, applicantId: req.user!.id, coverLetter: req.body.coverLetter || null, cvUrl: req.body.cvUrl || null } }); res.status(201).json({ application }); }
  catch { res.status(409).json({ message: "You have already applied for this job." }); }
});
router.post("/:id/save", async (req: AuthRequest, res) => {
  const existing = await prisma.savedJob.findUnique({ where: { userId_jobId: { userId: req.user!.id, jobId: req.params.id } } });
  if (existing) { await prisma.savedJob.delete({ where: { id: existing.id } }); return res.json({ saved: false }); }
  await prisma.savedJob.create({ data: { userId: req.user!.id, jobId: req.params.id } }); res.json({ saved: true });
});
router.get("/saved/list", async (req: AuthRequest, res) => { const saved = await prisma.savedJob.findMany({ where: { userId: req.user!.id }, include: { job: true }, orderBy: { createdAt: "desc" } }); res.json({ jobs: saved.map(s => s.job) }); });
router.patch("/applications/:id/status", async (req: AuthRequest, res) => {
  if (!employerRoles.includes(req.user!.role)) return res.status(403).json({ message: "Employer access required." });
  const allowed = ["UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "REJECTED", "OFFER"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid application status." });
  const app = await prisma.jobApplication.findFirst({ where: { id: req.params.id, job: { employerId: req.user!.id } } });
  if (!app) return res.status(404).json({ message: "Application not found." });
  const updated = await prisma.jobApplication.update({ where: { id: app.id }, data: { status: req.body.status } }); res.json({ application: updated });
});
router.post("/applications/:id/interviews", async (req: AuthRequest, res) => {
  if (!employerRoles.includes(req.user!.role)) return res.status(403).json({ message: "Employer access required." });
  const app = await prisma.jobApplication.findFirst({ where: { id: req.params.id, job: { employerId: req.user!.id } } });
  if (!app) return res.status(404).json({ message: "Application not found." });
  const scheduledAt = new Date(req.body.scheduledAt); if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt <= new Date()) return res.status(400).json({ message: "Choose a future interview date and time." });
  const interview = await prisma.interview.create({ data: { applicationId: app.id, candidateId: app.applicantId, employerId: req.user!.id, scheduledAt, durationMins: Math.min(180, Math.max(15, Number(req.body.durationMins) || 30)), meetingUrl: req.body.meetingUrl || null, notes: req.body.notes || null } });
  await prisma.jobApplication.update({ where: { id: app.id }, data: { status: "INTERVIEW" } }); res.status(201).json({ interview });
});

router.get("/alerts", async (req: AuthRequest, res) => { const alerts = await prisma.jobAlert.findMany({ where:{userId:req.user!.id}, orderBy:{createdAt:"desc"} }); res.json({alerts}); });
router.post("/alerts", async (req: AuthRequest, res) => { const alert = await prisma.jobAlert.create({ data:{userId:req.user!.id,keywords:req.body.keywords||null,location:req.body.location||null,workMode:req.body.workMode||null} }); res.status(201).json({alert}); });
router.get("/interviews/mine", async (req: AuthRequest, res) => { const interviews = await prisma.interview.findMany({ where:{ OR:[{candidateId:req.user!.id},{employerId:req.user!.id}] }, include:{ application:{include:{job:true,applicant:{select:{fullName:true,email:true}}}} }, orderBy:{scheduledAt:"asc"} }); res.json({interviews}); });

router.post("/ats/analyze", async (req: AuthRequest, res) => {
  const { jobId, cvText } = req.body;
  if (!cvText || String(cvText).length < 30) return res.status(400).json({ message: "Paste CV text (at least 30 characters) to run the ATS review." });
  const job = await prisma.job.findUnique({ where: { id: String(jobId || "") } }); if (!job) return res.status(404).json({ message: "Job not found." });
  const text = String(cvText).toLowerCase(); const matched = job.skills.filter(skill => text.includes(skill.toLowerCase())); const missing = job.skills.filter(skill => !text.includes(skill.toLowerCase()));
  const score = job.skills.length ? Math.round(matched.length / job.skills.length * 100) : null;
  res.json({ score, matchedSkills: matched, missingSkills: missing, suggestions: [!text.includes("experience") ? "Add a clear experience or project section." : null, !text.includes("education") ? "Include your education and qualifications." : null, missing.length ? `Highlight relevant evidence for: ${missing.join(", ")}.` : null].filter(Boolean), disclaimer: "This is a keyword-based ATS pre-screening aid, not a real AI decision or guarantee of selection." });
});
export default router;
