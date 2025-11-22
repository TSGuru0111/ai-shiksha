/**
 * Database Seeder - Populates the database with sample data
 * Run this to create example students and assessments for the teacher dashboard
 */

import { getModels } from './db/models.js';

const models = getModels();

// Sample student data
const sampleStudents = [
    {
        name: 'Rajesh Kumar',
        grade: 5,
        section: 'A',
        language: 'hi',
        learningLevel: 'beginner'
    },
    {
        name: 'Priya Sharma',
        grade: 6,
        section: 'B',
        language: 'en',
        learningLevel: 'intermediate'
    },
    {
        name: 'Arun Patel',
        grade: 5,
        section: 'A',
        language: 'hi',
        learningLevel: 'advanced'
    },
    {
        name: 'Meera Reddy',
        grade: 7,
        section: 'C',
        language: 'te',
        learningLevel: 'intermediate'
    },
    {
        name: 'Vikram Singh',
        grade: 6,
        section: 'B',
        language: 'en',
        learningLevel: 'beginner'
    },
    {
        name: 'Lakshmi Iyer',
        grade: 8,
        section: 'A',
        language: 'ta',
        learningLevel: 'advanced'
    },
    {
        name: 'Amit Verma',
        grade: 5,
        section: 'C',
        language: 'hi',
        learningLevel: 'intermediate'
    },
    {
        name: 'Sneha Desai',
        grade: 7,
        section: 'A',
        language: 'mr',
        learningLevel: 'advanced'
    },
    {
        name: 'Karthik Menon',
        grade: 6,
        section: 'B',
        language: 'en',
        learningLevel: 'intermediate'
    },
    {
        name: 'Ananya Das',
        grade: 8,
        section: 'C',
        language: 'bn',
        learningLevel: 'beginner'
    }
];

// Assessment topics and subjects
const subjects = ['literacy', 'numeracy'];
const literacyTopics = ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Writing'];
const numeracyTopics = ['Addition', 'Subtraction', 'Multiplication', 'Fractions'];

function getRandomScore() {
    // Generate scores with realistic distribution (mostly 50-90%)
    const random = Math.random();
    if (random < 0.1) return 30 + Math.floor(Math.random() * 20); // 10% low scores (30-50)
    if (random < 0.4) return 50 + Math.floor(Math.random() * 20); // 30% medium scores (50-70)
    if (random < 0.8) return 70 + Math.floor(Math.random() * 15); // 40% good scores (70-85)
    return 85 + Math.floor(Math.random() * 15); // 20% excellent scores (85-100)
}

function getRandomGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

function getRandomDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
}

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Create students
        console.log('👨‍🎓 Creating sample students...');
        const createdStudents = [];

        for (const studentData of sampleStudents) {
            const student = await models.Student.create(studentData);
            createdStudents.push(student);
            console.log(`   ✓ Created: ${student.name} (${student.id})`);
        }

        console.log(`\n✅ Created ${createdStudents.length} students\n`);

        // Create assessments for each student
        console.log('📝 Creating sample assessments...');
        let assessmentCount = 0;

        for (const student of createdStudents) {
            // Create 2-4 assessments per student
            const numAssessments = 2 + Math.floor(Math.random() * 3);

            for (let i = 0; i < numAssessments; i++) {
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const topics = subject === 'literacy' ? literacyTopics : numeracyTopics;
                const topic = topics[Math.floor(Math.random() * topics.length)];

                const totalQuestions = 10;
                const correctAnswers = Math.floor(totalQuestions * getRandomScore() / 100);
                const score = (correctAnswers / totalQuestions) * 100;

                await models.Student.addAssessment(student.id, {
                    subject: subject,
                    topics: [topic],
                    totalQuestions: totalQuestions,
                    correctAnswers: correctAnswers,
                    score: score,
                    grade: getRandomGrade(score),
                    results: Array(totalQuestions).fill(null).map((_, idx) => ({
                        questionNumber: idx + 1,
                        correct: idx < correctAnswers
                    }))
                });

                assessmentCount++;

                // Show progress every 10 assessments
                if (assessmentCount % 10 === 0) {
                    console.log(`   Created ${assessmentCount} assessments...`);
                }
            }
        }

        console.log(`\n✅ Created ${assessmentCount} assessments\n`);

        // Create a teacher
        console.log('👨‍🏫 Creating sample teacher...');
        const teacher = await models.Teacher.create({
            name: 'Ms. Anjali Gupta',
            email: 'anjali.gupta@school.edu',
            subjects: ['literacy', 'numeracy']
        });
        console.log(`   ✓ Created: ${teacher.name} (${teacher.id})\n`);

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 Database seeding completed!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Summary:`);
        console.log(`   • ${createdStudents.length} students created`);
        console.log(`   • ${assessmentCount} assessments created`);
        console.log(`   • 1 teacher created`);
        console.log(`\n💡 Now visit http://localhost:8080 and select "Teacher" role!`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeder
seedDatabase();
