/**
 * Firestore Database Schema for AI Tutoring System
 * Collections and document structures
 */

export const firestoreSchema = {
    // Users Collection - Base user information
    users: {
        collectionName: 'users',
        documentStructure: {
            uid: 'string', // Firebase Auth UID
            email: 'string',
            role: 'string', // 'student', 'teacher', 'admin', 'parent'
            name: 'string',
            phoneNumber: 'string',
            language: 'string', // Preferred language code
            createdAt: 'timestamp',
            updatedAt: 'timestamp',
            active: 'boolean',
        },
    },

    // Students Collection
    students: {
        collectionName: 'students',
        documentStructure: {
            studentId: 'string', // Same as user UID
            name: 'string',
            grade: 'number', // 1-8
            section: 'string',
            schoolId: 'string',
            teacherId: 'string',
            dateOfBirth: 'timestamp',
            language: 'string', // Primary language
            secondaryLanguages: 'array<string>',
            learningLevel: 'string', // 'beginner', 'intermediate', 'advanced'
            subjects: 'array<string>',
            enrollmentDate: 'timestamp',
            parentId: 'string',
            active: 'boolean',
            createdAt: 'timestamp',
            updatedAt: 'timestamp',
        },
        subcollections: {
            progress: {
                documentStructure: {
                    subject: 'string',
                    topic: 'string',
                    masteryLevel: 'number', // 0-100
                    lastPracticed: 'timestamp',
                    totalAttempts: 'number',
                    successfulAttempts: 'number',
                    timeSpent: 'number', // minutes
                    notes: 'string',
                },
            },
            assessments: {
                documentStructure: {
                    assessmentId: 'string',
                    subject: 'string',
                    topics: 'array<string>',
                    totalQuestions: 'number',
                    correctAnswers: 'number',
                    score: 'number', // percentage
                    grade: 'string',
                    completedAt: 'timestamp',
                    timeSpent: 'number', // minutes
                    results: 'array<object>',
                },
            },
        },
    },

    // Teachers Collection
    teachers: {
        collectionName: 'teachers',
        documentStructure: {
            teacherId: 'string', // Same as user UID
            name: 'string',
            schoolId: 'string',
            subjects: 'array<string>',
            grades: 'array<number>',
            classes: 'array<string>', // Class IDs
            email: 'string',
            phoneNumber: 'string',
            language: 'string',
            joinedDate: 'timestamp',
            active: 'boolean',
            createdAt: 'timestamp',
            updatedAt: 'timestamp',
        },
    },

    // Schools Collection
    schools: {
        collectionName: 'schools',
        documentStructure: {
            schoolId: 'string',
            name: 'string',
            address: 'object', // { street, city, state, pincode }
            district: 'string',
            state: 'string',
            type: 'string', // 'government', 'aided', 'private'
            medium: 'array<string>', // Languages of instruction
            totalStudents: 'number',
            totalTeachers: 'number',
            grades: 'array<number>',
            contactEmail: 'string',
            contactPhone: 'string',
            principalName: 'string',
            active: 'boolean',
            createdAt: 'timestamp',
            updatedAt: 'timestamp',
        },
    },

    // Learning Content Collection
    content: {
        collectionName: 'content',
        documentStructure: {
            contentId: 'string',
            type: 'string', // 'lesson', 'exercise', 'video', 'reading'
            subject: 'string',
            topic: 'string',
            grade: 'number',
            language: 'string',
            title: 'string',
            description: 'string',
            content: 'object', // Varies by type
            difficulty: 'string', // 'easy', 'medium', 'hard'
            estimatedTime: 'number', // minutes
            tags: 'array<string>',
            createdBy: 'string',
            createdAt: 'timestamp',
            updatedAt: 'timestamp',
            active: 'boolean',
        },
    },

    // Analytics Collection
    analytics: {
        collectionName: 'analytics',
        documentStructure: {
            analyticsId: 'string',
            type: 'string', // 'daily', 'weekly', 'monthly'
            schoolId: 'string',
            classId: 'string',
            subject: 'string',
            date: 'timestamp',
            metrics: 'object', // Various metrics
            studentCount: 'number',
            averageScore: 'number',
            topicPerformance: 'object',
            learningGaps: 'array<object>',
            generatedAt: 'timestamp',
        },
    },

    // Achievements Collection (Gamification)
    achievements: {
        collectionName: 'achievements',
        documentStructure: {
            achievementId: 'string',
            name: 'string',
            description: 'string',
            icon: 'string', // Icon identifier
            category: 'string', // 'literacy', 'numeracy', 'streak', 'milestone'
            criteria: 'object', // Criteria to earn
            points: 'number',
            rarity: 'string', // 'common', 'rare', 'epic', 'legendary'
            culturalTheme: 'string', // Indian cultural reference
            active: 'boolean',
            createdAt: 'timestamp',
        },
    },

    // Student Achievements (Earned badges)
    student_achievements: {
        collectionName: 'student_achievements',
        documentStructure: {
            studentId: 'string',
            achievementId: 'string',
            earnedAt: 'timestamp',
            progress: 'number', // 0-100 for partially completed achievements
        },
    },

    // Study Groups (Peer Learning)
    study_groups: {
        collectionName: 'study_groups',
        documentStructure: {
            groupId: 'string',
            name: 'string',
            schoolId: 'string',
            subject: 'string',
            grade: 'number',
            members: 'array<string>', // Student IDs
            facilitatorId: 'string', // Teacher ID
            active: 'boolean',
            createdAt: 'timestamp',
            lastActivity: 'timestamp',
        },
    },

    // Parent Access
    parent_access: {
        collectionName: 'parent_access',
        documentStructure: {
            parentId: 'string',
            name: 'string',
            phoneNumber: 'string',
            email: 'string',
            studentIds: 'array<string>', // Children
            language: 'string',
            smsNotifications: 'boolean',
            emailNotifications: 'boolean',
            createdAt: 'timestamp',
            updatedAt: 'timestamp',
        },
    },

    // Session Logs (for tracking usage)
    session_logs: {
        collectionName: 'session_logs',
        documentStructure: {
            sessionId: 'string',
            studentId: 'string',
            startTime: 'timestamp',
            endTime: 'timestamp',
            duration: 'number', // minutes
            activitiesCompleted: 'array<object>',
            agentsUsed: 'array<string>',
            topicsCovered: 'array<string>',
            device: 'string',
            online: 'boolean', // Was session online or offline
        },
    },
};

/**
 * Firestore Security Rules Reference
 * See firestore.rules for actual implementation
 */
export const securityRulesGuidelines = {
    students: 'Students can read/write own data. Teachers can read their students. Admins have full access.',
    teachers: 'Teachers can read/write own data. Admins have full access.',
    schools: 'All authenticated users can read. Only admins can write.',
    content: 'All authenticated users can read. Teachers and admins can write.',
    analytics: 'Teachers and admins can read. Only admins can write.',
    achievements: 'All can read. Only admins can write.',
    study_groups: 'Members can read. Teachers can create/manage.',
    parent_access: 'Parents can read own data. Admins can manage.',
};

/**
 * Firestore Indexes Reference
 * See firestore.indexes.json for actual implementation
 */
export const requiredIndexes = [
    {
        collection: 'students',
        fields: ['schoolId', 'grade', 'createdAt'],
        description: 'Query students by school and grade',
    },
    {
        collection: 'students/progress',
        fields: ['studentId', 'subject', 'timestamp'],
        description: 'Query student progress by subject over time',
    },
    {
        collection: 'assessments',
        fields: ['studentId', 'completedAt'],
        description: 'Query student assessments chronologically',
    },
    {
        collection: 'analytics',
        fields: ['schoolId', 'date'],
        description: 'Query analytics by school and date',
    },
];

export default firestoreSchema;
