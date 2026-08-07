/**
 * Script to create an ADMIN user in the database.
 * Run: node scripts/create-admin.js
 * 
 * This creates the master admin account needed to access the Admin Panel.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ghostbus.io';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GhostBus@Admin2026!';
const ADMIN_NAME = 'Master Admin';

async function main() {
  console.log('🔧 GhostBus Admin Setup\n');
  console.log(`📧 Email:    ${ADMIN_EMAIL}`);
  console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
  console.log('');

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log('✅ Admin user already exists with ADMIN role.');
      console.log(`   ID: ${existing.id}`);
      console.log('   You can log in to the Master Admin Panel now.');
    } else {
      // Upgrade existing user to ADMIN
      const updated = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'ADMIN', isVerified: true },
      });
      console.log(`✅ Upgraded existing user to ADMIN role.`);
      console.log(`   ID: ${updated.id}`);
    }
    await prisma.$disconnect();
    return;
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      fullName: ADMIN_NAME,
      username: 'ghostbus_admin',
      role: 'ADMIN',
      isVerified: true,
      sellerModeEnabled: false,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log(`   ID: ${admin.id}`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Start the backend: cd Backend && npm start');
  console.log('   2. Open the Admin Panel: http://localhost:8080/admin/login');
  console.log(`   3. Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('   4. IMPORTANT: Change password after first login!');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  prisma.$disconnect();
  process.exit(1);
});
