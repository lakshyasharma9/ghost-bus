import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['info', 'warn', 'error'] 
    : ['error'],
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Check your DATABASE_URL in .env — make sure you are using the Supabase connection pooler URL (port 6543), not the direct URL (port 5432).');
    // Do not exit — let server start so you can debug via API
  }
}

async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

connectDatabase();

process.on('beforeExit', disconnectDatabase);

export default prisma;
