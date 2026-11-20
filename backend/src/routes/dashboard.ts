import { Router } from "express";
import { prisma } from "../server";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.get("/summary", authenticate, async (req: AuthRequest, res) => {
  const [totalUsers, activeUsers, students, employers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } })
  ]);
  res.json({
    user: req.user,
    stats: { totalUsers, activeUsers, students, employers },
    careerReadiness: 78,
    appliedJobs: 5,
    completedCourses: 12,
    skillMatch: 85,
    upcomingInterviews: 2
  });
});
export default router;
