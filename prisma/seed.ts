import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { username: "teacher" },
    update: {},
    create: {
      username: "teacher",
      password,
      name: "Teacher User",
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { username: "student" },
    update: {},
    create: {
      username: "student",
      password,
      name: "Student User",
      role: "STUDENT",
    },
  });

  console.log({ admin, teacher, student });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
