import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Sample data for generating diverse users
const firstNames = [
  'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indra', 'Joko',
  'Kartika', 'Lina', 'Maya', 'Nina', 'Oscar', 'Putri', 'Qori', 'Rina', 'Sari', 'Tina',
  'Umar', 'Vina', 'Wati', 'Xena', 'Yani', 'Zaki', 'Aisha', 'Bella', 'Cinta', 'Diana',
  'Elena', 'Fiona', 'Grace', 'Hana', 'Iris', 'Julia', 'Kira', 'Luna', 'Mira', 'Nora',
  'Oliver', 'Peter', 'Quinn', 'Ryan', 'Sam', 'Tom', 'Umar', 'Victor', 'Will', 'Xavier',
  'Yusuf', 'Zain', 'Aaron', 'Brian', 'Carl', 'David', 'Eric', 'Frank', 'Gary', 'Henry',
  'Ivan', 'Jack', 'Kevin', 'Leo', 'Mike', 'Nick', 'Owen', 'Paul', 'Quincy', 'Robert',
  'Steve', 'Tony', 'Ulysses', 'Vincent', 'Walter', 'Xander', 'Yusuf', 'Zachary'
];

const lastNames = [
  'Sari', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Rahayu', 'Sari', 'Wijaya', 'Kusuma', 'Pratama',
  'Saputra', 'Rahayu', 'Sari', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Rahayu', 'Sari', 'Wijaya',
  'Kusuma', 'Pratama', 'Saputra', 'Rahayu', 'Sari', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Rahayu',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const domains = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'protonmail.com', 'zoho.com', 'mail.com', 'yandex.com', 'aol.com'
];

const roles: ('USER' | 'MEMBER')[] = ['USER', 'MEMBER'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomEmail(firstName: string, lastName: string): string {
  const domain = getRandomElement(domains);
  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}@${domain}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`
  ];
  return getRandomElement(variations);
}

async function main() {
  console.log('👥 Starting user seed...');

  // Check if users already exist (excluding admin)
  const existingUsers = await prisma.user.count({
    where: { role: { not: 'ADMIN' } }
  });

  if (existingUsers >= 100) {
    console.log('👥 Users already exist, skipping user creation');
    return;
  }

  console.log(`📊 Found ${existingUsers} existing users, creating ${100 - existingUsers} new users...`);

  const users = [];
  const usedEmails = new Set<string>();

  // Get admin user for reference
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.error('❌ No admin user found. Please run the main seed first.');
    process.exit(1);
  }

  for (let i = 0; i < 100 - existingUsers; i++) {
    let firstName: string;
    let lastName: string;
    let email: string;
    
    // Ensure unique email
    do {
      firstName = getRandomElement(firstNames);
      lastName = getRandomElement(lastNames);
      email = generateRandomEmail(firstName, lastName);
    } while (usedEmails.has(email));
    
    usedEmails.add(email);

    const name = `${firstName} ${lastName}`;
    const password = 'password123'; // Default password for all users
    const passwordHash = await bcrypt.hash(password, 10);
    const role = getRandomElement(roles);
    const isVerified = Math.random() > 0.2; // 80% verified users

    users.push({
      name,
      email,
      passwordHash,
      role,
      isVerified
    });
  }

  // Create users in batches
  const batchSize = 10;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await prisma.user.createMany({
      data: batch,
      skipDuplicates: true
    });
    console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)} (${batch.length} users)`);
  }

  console.log(`👥 Successfully created ${users.length} users!`);
  console.log('🔑 Default password for all users: password123');
}

main()
  .catch((e) => {
    console.error('❌ User seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
