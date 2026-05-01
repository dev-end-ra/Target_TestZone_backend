// Run this script ONCE to set your account as admin:
// node scripts/makeAdmin.js your-email@example.com

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/target_testzone')
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin', status: 'approved' },
      { new: true }
    );
    if (!user) {
      console.error(`No user found with email: ${email}`);
    } else {
      console.log(`✅ "${user.name}" (${user.email}) is now an admin!`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
