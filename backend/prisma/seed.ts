import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // Create admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  let admin;
  if (existingAdmin) {
    console.log('👤 Admin user already exists');
    admin = existingAdmin;
  } else {
    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        passwordHash,
        isVerified: true,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified
    });

    console.log('🔑 Admin credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  }

  console.log('🌱 Admin setup complete. Run the following commands to seed data:');
  console.log('   npm run seed:users  - Create 100 diverse users');
  console.log('   npm run seed:books  - Create 100 diverse books');
  console.log('   npm run seed:all    - Run both user and book seeders');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
