import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@skillnex.local" },
    update: {},
    create: {
      fullName: "SKILLNEX Administrator",
      email: "admin@skillnex.local",
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: true
    }
  });
  console.log("Seed complete. Admin: admin@skillnex.local / ChangeMe123!");
}

main().finally(() => prisma.$disconnect());
