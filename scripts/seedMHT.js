import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import { physicsQuestions } from './seedData/physics.js';
import { chemistryQuestions } from './seedData/chemistry.js';
import { mathsQuestions } from './seedData/maths.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/target_testzone';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing mock test if present
    const existing = await Test.findOne({ title: 'MHT-CET Mock Test 1' });
    if (existing) {
      await Question.deleteMany({ testId: existing._id });
      await Test.deleteOne({ _id: existing._id });
      console.log('🗑️  Removed existing MHT-CET Mock Test 1');
    }

    // Create the Test document
    const test = await Test.create({
      title: 'MHT-CET Mock Test 1',
      type: 'MHTCET-PCM',
      durationSeconds: 10800, // 3 hours
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      totalQuestions: 150,
      liveAt: new Date(),     // Live immediately
      isActive: true,
    });

    console.log(`📝 Created test: ${test.title} [${test._id}]`);

    // Tag each question with testId, subject, marks, negativeMarks
    const buildQuestions = (arr, subject) =>
      arr.map(q => ({
        ...q,
        testId: test._id,
        subject,
        marks: 2,
        negativeMarks: 0,
        questionImage: null,
      }));

    const allQuestions = [
      ...buildQuestions(physicsQuestions, 'Physics'),
      ...buildQuestions(chemistryQuestions, 'Chemistry'),
      ...buildQuestions(mathsQuestions, 'Mathematics'),
    ];

    await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${allQuestions.length} questions (50 Physics + 50 Chemistry + 50 Maths)`);
    console.log(`\n🎉 Seed complete! Test ID: ${test._id}`);
    console.log(`   Use this ID in your frontend if needed.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
