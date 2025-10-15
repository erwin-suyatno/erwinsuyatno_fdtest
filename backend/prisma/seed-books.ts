import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📚 Starting book seed...');

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.error('❌ No admin user found. Please run the main seed first.');
    process.exit(1);
  }

  console.log(`👤 Using admin user: ${admin.name} (${admin.email})`);

  // Check if books already exist
  const existingBooks = await prisma.book.count();
  if (existingBooks > 0) {
    console.log('📚 Books already exist, skipping book creation');
    return;
  }

  const sampleBooks = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian social science fiction novel about totalitarian control and surveillance.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      rating: 4,
      uploadedById: admin.id
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      description: 'A romantic novel of manners that critiques the British landed gentry of the early 19th century.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      description: 'A coming-of-age story about teenage rebellion and alienation in post-World War II America.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      rating: 4,
      uploadedById: admin.id
    },
    {
      title: 'Lord of the Flies',
      author: 'William Golding',
      description: 'A story about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      rating: 4,
      uploadedById: admin.id
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      description: 'A fantasy novel about a hobbit who goes on an unexpected journey to win a share of a dragon\'s treasure.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: 'The Chronicles of Narnia',
      author: 'C.S. Lewis',
      description: 'A series of fantasy novels about children who discover the magical world of Narnia.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: 'Harry Potter and the Philosopher\'s Stone',
      author: 'J.K. Rowling',
      description: 'The first book in the Harry Potter series, following a young wizard\'s journey at Hogwarts School.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      description: 'A philosophical novel about a young Andalusian shepherd who travels from Spain to Egypt in search of treasure.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      rating: 4,
      uploadedById: admin.id
    },
    {
      title: 'The Kite Runner',
      author: 'Khaled Hosseini',
      description: 'A story about friendship, betrayal, and redemption set against the backdrop of Afghanistan\'s tumultuous history.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: 'The Book Thief',
      author: 'Markus Zusak',
      description: 'A story about a young girl living with her foster family in Nazi Germany during World War II.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      description: 'An epic high-fantasy novel about the quest to destroy the One Ring and defeat the Dark Lord Sauron.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      rating: 5,
      uploadedById: admin.id
    },
    {
      title: 'The Hunger Games',
      author: 'Suzanne Collins',
      description: 'A dystopian novel about a televised fight to the death between teenagers in a post-apocalyptic world.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      rating: 4,
      uploadedById: admin.id
    },
    {
      title: 'The Da Vinci Code',
      author: 'Dan Brown',
      description: 'A mystery thriller novel about a symbologist who becomes involved in a conspiracy involving the Catholic Church.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      rating: 4,
      uploadedById: admin.id
    }
  ];

  // Create books
  for (const bookData of sampleBooks) {
    const book = await prisma.book.create({
      data: bookData
    });
    console.log(`✅ Created book: "${book.title}" by ${book.author} (Rating: ${book.rating}/5)`);
  }

  console.log(`📚 Successfully created ${sampleBooks.length} sample books!`);
}

main()
  .catch((e) => {
    console.error('❌ Book seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
