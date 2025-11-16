// prisma/seed.cjs
const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("DB URL:", process.env.DATABASE_URL);

  const adminEmail = "admin@gauhati.ac.in";
  const adminPassword = "admin123";

  console.log("Seeding admin user...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin already exists:", adminEmail);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN, // uses your enum Role { ADMIN, TEACHER, STUDENT }
    },
  });

  console.log("✅ Admin user created:", adminEmail);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
