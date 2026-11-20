import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../server";
import { authenticate, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate, adminOnly);

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, email: true, role: true, status: true, emailVerified: true, createdAt: true, lastLoginAt: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ users });
});

router.post("/", async (req: AuthRequest, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || String(password).length < 8)
    return res.status(400).json({ message: "Name, email and password (8+ characters) are required." });
  const allowed = ["STUDENT", "JOB_SEEKER", "EMPLOYER", "MENTOR", "ADMIN"];
  if (!allowed.includes(role)) return res.status(400).json({ message: "Invalid role." });
  try {
    const user = await prisma.user.create({ data: { fullName, email: String(email).toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role, emailVerified: true } });
    await prisma.auditLog.create({ data: { actorId: req.user!.id, action: "USER_CREATED", targetId: user.id, details: `Created ${user.role} account` } });
    res.status(201).json({ user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, status: user.status } });
  } catch { res.status(409).json({ message: "Email may already be registered." }); }
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const { fullName, role, status, headline, location } = req.body;
  const allowedRoles = ["ADMIN", "STUDENT", "JOB_SEEKER", "EMPLOYER", "MENTOR"];
  const allowedStatus = ["ACTIVE", "INACTIVE", "SUSPENDED"];
  if (role && !allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role." });
  if (status && !allowedStatus.includes(status)) return res.status(400).json({ message: "Invalid status." });
  if (req.params.id === req.user!.id && (status === "INACTIVE" || status === "SUSPENDED" || role && role !== "ADMIN"))
    return res.status(400).json({ message: "You cannot deactivate or remove your own administrator access." });
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { fullName, role, status, headline, location }, select: { id: true, fullName: true, email: true, role: true, status: true, emailVerified: true } });
    await prisma.auditLog.create({ data: { actorId: req.user!.id, action: "USER_UPDATED", targetId: user.id, details: "Updated user account" } });
    res.json({ user });
  } catch { res.status(404).json({ message: "User not found." }); }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  if (req.params.id === req.user!.id) return res.status(400).json({ message: "You cannot deactivate your own account." });
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: "INACTIVE" }, select: { id: true } });
    await prisma.auditLog.create({ data: { actorId: req.user!.id, action: "USER_DEACTIVATED", targetId: user.id } });
    res.json({ message: "User deactivated." });
  } catch { res.status(404).json({ message: "User not found." }); }
});

export default router;
