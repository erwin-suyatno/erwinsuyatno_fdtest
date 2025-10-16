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

// Comprehensive book data
const bookTitles = [
  'The Great Gatsby', 'To Kill a Mockingbird', '1984', 'Pride and Prejudice', 'The Catcher in the Rye',
  'Lord of the Flies', 'The Hobbit', 'The Chronicles of Narnia', 'Harry Potter and the Philosopher\'s Stone',
  'The Alchemist', 'The Kite Runner', 'The Book Thief', 'The Lord of the Rings', 'The Hunger Games',
  'The Da Vinci Code', 'Wuthering Heights', 'Jane Eyre', 'Moby Dick', 'The Scarlet Letter',
  'The Adventures of Huckleberry Finn', 'The Picture of Dorian Gray', 'Dune', 'Foundation',
  'The Martian', 'Ender\'s Game', 'The Handmaid\'s Tale', 'Brave New World', 'Fahrenheit 451',
  'The Time Machine', 'The War of the Worlds', 'The Hitchhiker\'s Guide to the Galaxy',
  'The Wheel of Time', 'A Song of Ice and Fire', 'The Stormlight Archive', 'Mistborn',
  'The Kingkiller Chronicle', 'The Girl with the Dragon Tattoo', 'Gone Girl', 'The Silence of the Lambs',
  'The Bourne Identity', 'The Girl on the Train', 'Big Little Lies', 'The Woman in the Window',
  'Sharp Objects', 'The Girl Who Kicked the Hornet\'s Nest', 'The Girl Who Played with Fire',
  'The Snowman', 'The Cuckoo\'s Calling', 'The Casual Vacancy', 'The Silkworm', 'Career of Evil',
  'The Notebook', 'Me Before You', 'The Fault in Our Stars', 'Eleanor & Park', 'The Time Traveler\'s Wife',
  'The Seven Husbands of Evelyn Hugo', 'It Ends with Us', 'The Hating Game', 'Red, White & Royal Blue',
  'The Kiss Quotient', 'The Unhoneymooners', 'Beach Read', 'The Invisible Life of Addie LaRue',
  'The Midnight Library', 'Where the Crawdads Sing', 'Sapiens', 'Educated', 'Becoming',
  'The Immortal Life of Henrietta Lacks', 'Born a Crime', 'The Glass Castle', 'Wild',
  'Into the Wild', 'The Diary of a Young Girl', 'Long Walk to Freedom', 'I Know Why the Caged Bird Sings',
  'The Autobiography of Malcolm X', 'The Power of Now', 'Atomic Habits', 'The 7 Habits of Highly Effective People',
  'Thinking, Fast and Slow', 'Rich Dad Poor Dad', 'The Lean Startup', 'Good to Great',
  'The 4-Hour Workweek', 'Outliers', 'Blink', 'The Tipping Point', 'Freakonomics',
  'The Black Swan', 'Nudge', 'Predictably Irrational', 'The Art of War', 'The 48 Laws of Power',
  'How to Win Friends and Influence People', 'Getting Things Done', 'Deep Work', 'Clean Code',
  'The Pragmatic Programmer', 'Design Patterns', 'Code Complete', 'The Mythical Man-Month',
  'Refactoring', 'Test Driven Development', 'Agile Software Development', 'The Clean Architecture',
  'Domain-Driven Design', 'Patterns of Enterprise Application Architecture', 'Working Effectively with Legacy Code',
  'The Art of Computer Programming', 'Introduction to Algorithms', 'Structure and Interpretation of Computer Programs',
  'The Body Keeps the Score', 'When Breath Becomes Air', 'Being Mortal', 'The Emperor of All Maladies',
  'The Gene', 'The Checklist Manifesto', 'Better', 'Complications', 'The Spirit Catches You and You Fall Down',
  'The Man Who Mistook His Wife for a Hat', 'The Brain That Changes Itself', 'The Power of Habit',
  'Why We Sleep', 'The Sleep Revolution'
];

const authors = [
  'F. Scott Fitzgerald', 'Harper Lee', 'George Orwell', 'Jane Austen', 'J.D. Salinger',
  'William Golding', 'J.R.R. Tolkien', 'C.S. Lewis', 'J.K. Rowling', 'Paulo Coelho',
  'Khaled Hosseini', 'Markus Zusak', 'Suzanne Collins', 'Dan Brown', 'Emily Brontë',
  'Charlotte Brontë', 'Herman Melville', 'Nathaniel Hawthorne', 'Mark Twain', 'Oscar Wilde',
  'Frank Herbert', 'Isaac Asimov', 'Andy Weir', 'Orson Scott Card', 'Margaret Atwood',
  'Aldous Huxley', 'Ray Bradbury', 'H.G. Wells', 'Douglas Adams', 'Robert Jordan',
  'George R.R. Martin', 'Brandon Sanderson', 'Patrick Rothfuss', 'Stieg Larsson',
  'Gillian Flynn', 'Thomas Harris', 'Robert Ludlum', 'Paula Hawkins', 'Liane Moriarty',
  'A.J. Finn', 'Nicholas Sparks', 'Jojo Moyes', 'John Green', 'Rainbow Rowell',
  'Audrey Niffenegger', 'Taylor Jenkins Reid', 'Colleen Hoover', 'Sally Thorne',
  'Casey McQuiston', 'Helen Hoang', 'Christina Lauren', 'Emily Henry', 'V.E. Schwab',
  'Matt Haig', 'Delia Owens', 'Yuval Noah Harari', 'Tara Westover', 'Michelle Obama',
  'Rebecca Skloot', 'Trevor Noah', 'Jeannette Walls', 'Cheryl Strayed', 'Jon Krakauer',
  'Anne Frank', 'Nelson Mandela', 'Maya Angelou', 'Malcolm X', 'Eckhart Tolle',
  'James Clear', 'Stephen Covey', 'Malcolm Gladwell', 'Steven Levitt', 'Nassim Nicholas Taleb',
  'Richard Thaler', 'Dan Ariely', 'Sun Tzu', 'Robert Greene', 'Dale Carnegie',
  'David Allen', 'Cal Newport', 'Robert Kiyosaki', 'Eric Ries', 'Jim Collins',
  'Tim Ferriss', 'Daniel Kahneman', 'Robert Cialdini', 'Charles Duhigg', 'Robert Martin',
  'Andy Hunt', 'Gang of Four', 'Steve McConnell', 'Fred Brooks', 'Kent Beck',
  'Martin Fowler', 'Eric Evans', 'Donald Knuth', 'Thomas Cormen', 'Harold Abelson',
  'Bessel van der Kolk', 'Paul Kalanithi', 'Atul Gawande', 'Siddhartha Mukherjee',
  'Anne Fadiman', 'Oliver Sacks', 'Norman Doidge', 'Arianna Huffington', 'Matthew Walker'
];

const descriptions = [
  'A timeless classic that explores themes of love, loss, and redemption.',
  'An epic journey through the depths of human emotion and experience.',
  'A gripping tale that will keep you on the edge of your seat until the very end.',
  'A masterful work that combines beautiful prose with profound insights.',
  'An unforgettable story that challenges our understanding of the world.',
  'A powerful narrative that explores the complexities of human relationships.',
  'A thought-provoking examination of society and its impact on individuals.',
  'A beautifully crafted story that resonates with readers of all ages.',
  'An inspiring tale of courage, determination, and the power of the human spirit.',
  'A compelling read that offers both entertainment and enlightenment.',
  'A groundbreaking work that has influenced generations of readers.',
  'An intimate portrait of characters that feel real and relatable.',
  'A masterclass in storytelling that demonstrates the power of literature.',
  'A profound exploration of themes that are both universal and deeply personal.',
  'A work of art that combines beautiful language with compelling narrative.',
  'An essential read for anyone interested in understanding the human condition.',
  'A story that will stay with you long after you turn the final page.',
  'A brilliant examination of the forces that shape our lives.',
  'A captivating tale that weaves together multiple storylines with skill.',
  'An important work that sheds light on crucial social issues.',
  'A beautifully written novel that explores the depths of human emotion.',
  'A compelling story that offers both entertainment and food for thought.',
  'An expertly crafted narrative that demonstrates the power of storytelling.',
  'A profound work that challenges readers to think deeply about important issues.',
  'A masterful blend of plot, character, and theme that creates an unforgettable reading experience.'
];

const thumbnailUrls = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop'
];

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

function getRandomRating(): number {
  const weights = [1, 2, 3, 4, 5];
  const probabilities = [0.05, 0.1, 0.2, 0.3, 0.35];
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += probabilities[i];
    if (random <= cumulative) {
      return weights[i];
    }
  }
  
  return 5;
}

async function main() {
  console.log('🌱 Starting comprehensive seed with 100 users and 100 books...');

  // Create admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  let admin;
  if (existingAdmin) {
    console.log('👤 Admin user already exists');
    admin = existingAdmin;
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        passwordHash,
        isVerified: true,
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user created');
  }

  // Create 100 users
  console.log('👥 Creating 100 diverse users...');
  const existingUsers = await prisma.user.count({
    where: { role: { not: 'ADMIN' } }
  });

  if (existingUsers < 100) {
    const users = [];
    const usedEmails = new Set<string>();

    for (let i = 0; i < 100 - existingUsers; i++) {
      let firstName: string;
      let lastName: string;
      let email: string;
      
      do {
        firstName = getRandomElement(firstNames);
        lastName = getRandomElement(lastNames);
        email = generateRandomEmail(firstName, lastName);
      } while (usedEmails.has(email));
      
      usedEmails.add(email);

      const name = `${firstName} ${lastName}`;
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 10);
      const role = getRandomElement(roles);
      const isVerified = Math.random() > 0.2;

      users.push({
        name,
        email,
        passwordHash,
        role,
        isVerified
      });
    }

    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await prisma.user.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`✅ Created user batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`);
    }
  } else {
    console.log('👥 Users already exist, skipping user creation');
  }

  // Create 100 books
  console.log('📚 Creating 100 diverse books...');
  const existingBooks = await prisma.book.count();

  if (existingBooks < 100) {
    const books = [];
    const usedTitles = new Set<string>();

    for (let i = 0; i < 100 - existingBooks; i++) {
      let title: string;
      
      do {
        title = getRandomElement(bookTitles);
      } while (usedTitles.has(title));
      
      usedTitles.add(title);

      const author = getRandomElement(authors);
      const description = getRandomElement(descriptions);
      const thumbnailUrl = getRandomElement(thumbnailUrls);
      const rating = getRandomRating();

      books.push({
        title,
        author,
        description,
        thumbnailUrl,
        rating,
        uploadedById: admin.id
      });
    }

    const batchSize = 10;
    for (let i = 0; i < books.length; i += batchSize) {
      const batch = books.slice(i, i + batchSize);
      await prisma.book.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`✅ Created book batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(books.length / batchSize)}`);
    }
  } else {
    console.log('📚 Books already exist, skipping book creation');
  }

  console.log('🎉 Comprehensive seed completed!');
  console.log('📊 Summary:');
  console.log(`   👤 Users: ${await prisma.user.count()}`);
  console.log(`   📚 Books: ${await prisma.book.count()}`);
  console.log('🔑 Default user password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
