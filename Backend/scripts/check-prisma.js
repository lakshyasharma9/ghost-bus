import prisma from '../config/database.js';
const keys = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
console.log('Prisma model keys:', keys);
await prisma.$disconnect();
