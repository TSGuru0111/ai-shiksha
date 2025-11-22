/**
 * Gamification System
 * Implements achievement badges, points, streaks, and rewards with Indian cultural themes
 */

/**
 * Achievement definitions with Indian cultural themes
 */
export const ACHIEVEMENTS = {
    // Literacy Achievements
    'first-word': {
        id: 'first-word',
        name: 'पहला शब्द / First Word',
        description: 'Read your first word successfully',
        icon: '📖',
        category: 'literacy',
        points: 10,
        rarity: 'common',
        culturalTheme: 'Saraswati\'s Blessing',
    },
    'story-master': {
        id: 'story-master',
        name: 'कहानी मास्टर / Story Master',
        description: 'Complete 10 reading comprehension exercises',
        icon: '📚',
        category: 'literacy',
        points: 50,
        rarity: 'rare',
        culturalTheme: 'Panchatantra Scholar',
    },
    'grammar-guru': {
        id: 'grammar-guru',
        name: 'व्याकरण गुरु / Grammar Guru',
        description: 'Master all grammar concepts',
        icon: '✍️',
        category: 'literacy',
        points: 100,
        rarity: 'epic',
        culturalTheme: 'Panini\'s Disciple',
    },

    // Numeracy Achievements
    'number-ninja': {
        id: 'number-ninja',
        name: 'संख्या निंजा / Number Ninja',
        description: 'Solve 50 math problems correctly',
        icon: '🔢',
        category: 'numeracy',
        points: 50,
        rarity: 'rare',
        culturalTheme: 'Aryabhata\'s Student',
    },
    'mental-math-master': {
        id: 'mental-math-master',
        name: 'मानसिक गणित मास्टर / Mental Math Master',
        description: 'Solve 20 problems using mental math',
        icon: '🧠',
        category: 'numeracy',
        points: 75,
        rarity: 'epic',
        culturalTheme: 'Ramanujan\'s Heir',
    },
    'geometry-genius': {
        id: 'geometry-genius',
        name: 'ज्यामिति जीनियस / Geometry Genius',
        description: 'Master all geometry concepts',
        icon: '📐',
        category: 'numeracy',
        points: 100,
        rarity: 'legendary',
        culturalTheme: 'Architect of Taj Mahal',
    },

    // Streak Achievements
    'week-warrior': {
        id: 'week-warrior',
        name: 'सप्ताह योद्धा / Week Warrior',
        description: 'Learn for 7 days in a row',
        icon: '🔥',
        category: 'streak',
        points: 30,
        rarity: 'common',
        culturalTheme: 'Dedicated Learner',
    },
    'month-champion': {
        id: 'month-champion',
        name: 'महीना चैंपियन / Month Champion',
        description: 'Learn for 30 days in a row',
        icon: '🏆',
        category: 'streak',
        points: 150,
        rarity: 'legendary',
        culturalTheme: 'Tapasya Master',
    },

    // Milestone Achievements
    'hundred-club': {
        id: 'hundred-club',
        name: '100 क्लब / Hundred Club',
        description: 'Score 100% on any assessment',
        icon: '💯',
        category: 'milestone',
        points: 50,
        rarity: 'rare',
        culturalTheme: 'Perfect Score',
    },
    'helping-hand': {
        id: 'helping-hand',
        name: 'मदद का हाथ / Helping Hand',
        description: 'Help 5 classmates with their learning',
        icon: '🤝',
        category: 'social',
        points: 40,
        rarity: 'rare',
        culturalTheme: 'Guru-Shishya Tradition',
    },
};

/**
 * Level system based on total points
 */
export const LEVELS = [
    { level: 1, minPoints: 0, title: 'Beginner / शुरुआती', icon: '🌱' },
    { level: 2, minPoints: 100, title: 'Learner / सीखने वाला', icon: '📖' },
    { level: 3, minPoints: 250, title: 'Student / विद्यार्थी', icon: '🎓' },
    { level: 4, minPoints: 500, title: 'Scholar / विद्वान', icon: '📚' },
    { level: 5, minPoints: 1000, title: 'Expert / विशेषज्ञ', icon: '⭐' },
    { level: 6, minPoints: 2000, title: 'Master / मास्टर', icon: '🏆' },
    { level: 7, minPoints: 5000, title: 'Guru / गुरु', icon: '👑' },
];

/**
 * Calculate current level from points
 * @param {number} totalPoints - Total points earned
 * @returns {Object} - Current level information
 */
export function calculateLevel(totalPoints) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalPoints >= LEVELS[i].minPoints) {
            const nextLevel = LEVELS[i + 1];
            return {
                ...LEVELS[i],
                pointsToNext: nextLevel ? nextLevel.minPoints - totalPoints : 0,
                progress: nextLevel
                    ? ((totalPoints - LEVELS[i].minPoints) / (nextLevel.minPoints - LEVELS[i].minPoints)) * 100
                    : 100,
            };
        }
    }
    return LEVELS[0];
}

/**
 * Check if student earned an achievement
 * @param {string} achievementId - Achievement ID to check
 * @param {Object} studentData - Student's data
 * @returns {boolean} - True if earned
 */
export function checkAchievement(achievementId, studentData) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return false;

    const { stats } = studentData;

    switch (achievementId) {
        case 'first-word':
            return stats.wordsRead >= 1;

        case 'story-master':
            return stats.readingExercisesCompleted >= 10;

        case 'grammar-guru':
            return stats.grammarTopicsMastered >= 10;

        case 'number-ninja':
            return stats.mathProblemsSolved >= 50;

        case 'mental-math-master':
            return stats.mentalMathSolved >= 20;

        case 'geometry-genius':
            return stats.geometryTopicsMastered >= 8;

        case 'week-warrior':
            return stats.currentStreak >= 7;

        case 'month-champion':
            return stats.currentStreak >= 30;

        case 'hundred-club':
            return stats.perfectScores >= 1;

        case 'helping-hand':
            return stats.peersHelped >= 5;

        default:
            return false;
    }
}

/**
 * Award achievement to student
 * @param {string} studentId - Student ID
 * @param {string} achievementId - Achievement ID
 * @param {Object} db - Database instance
 * @returns {Promise<Object>} - Achievement data
 */
export async function awardAchievement(studentId, achievementId, db) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
        throw new Error('Achievement not found');
    }

    // Check if already earned
    const existingAchievements = await db.Achievement.getStudentAchievements(studentId);
    const alreadyEarned = existingAchievements.some(a => a.achievementId === achievementId);

    if (alreadyEarned) {
        return { alreadyEarned: true };
    }

    // Award achievement
    await db.Achievement.awardToStudent(studentId, achievementId);

    return {
        success: true,
        achievement,
        message: `🎉 Congratulations! You earned: ${achievement.name}`,
    };
}

/**
 * Calculate daily streak
 * @param {Array} sessionLogs - Array of session logs
 * @returns {Object} - Streak information
 */
export function calculateStreak(sessionLogs) {
    if (!sessionLogs || sessionLogs.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastActive: null };
    }

    // Sort by date
    const sortedLogs = sessionLogs.sort((a, b) =>
        new Date(b.startTime) - new Date(a.startTime)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(sortedLogs[0].startTime);
    lastDate.setHours(0, 0, 0, 0);

    // Check if active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceLastActive = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastActive === 0) {
        currentStreak = 1;
    } else if (daysSinceLastActive > 1) {
        return { currentStreak: 0, longestStreak: 0, lastActive: lastDate };
    }

    // Calculate streaks
    for (let i = 1; i < sortedLogs.length; i++) {
        const currentDate = new Date(sortedLogs[i].startTime);
        currentDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            tempStreak++;
            if (i === sortedLogs.length - 1 || daysSinceLastActive <= 1) {
                currentStreak = tempStreak;
            }
        } else if (daysDiff > 1) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }

        lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
        currentStreak,
        longestStreak,
        lastActive: new Date(sortedLogs[0].startTime),
    };
}

/**
 * Generate leaderboard
 * @param {Array} students - Array of student data
 * @param {string} period - 'daily', 'weekly', 'monthly', 'alltime'
 * @param {string} metric - 'points', 'streak', 'accuracy'
 * @returns {Array} - Sorted leaderboard
 */
export function generateLeaderboard(students, period = 'weekly', metric = 'points') {
    const now = new Date();
    let cutoffDate = new Date();

    switch (period) {
        case 'daily':
            cutoffDate.setDate(now.getDate() - 1);
            break;
        case 'weekly':
            cutoffDate.setDate(now.getDate() - 7);
            break;
        case 'monthly':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
        case 'alltime':
            cutoffDate = new Date(0);
            break;
    }

    return students
        .map(student => ({
            studentId: student.id,
            name: student.name,
            value: getMetricValue(student, metric, cutoffDate),
            avatar: student.avatar || '👤',
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10) // Top 10
        .map((student, index) => ({
            ...student,
            rank: index + 1,
            badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
        }));
}

/**
 * Get metric value for leaderboard
 */
function getMetricValue(student, metric, cutoffDate) {
    switch (metric) {
        case 'points':
            return student.stats?.totalPoints || 0;
        case 'streak':
            return student.stats?.currentStreak || 0;
        case 'accuracy':
            return student.stats?.averageAccuracy || 0;
        default:
            return 0;
    }
}

/**
 * Generate motivational message based on progress
 * @param {Object} studentData - Student's data
 * @param {string} language - Language code
 * @returns {string} - Motivational message
 */
export function getMotivationalMessage(studentData, language = 'en') {
    const messages = {
        en: [
            '🌟 You\'re doing great! Keep learning!',
            '💪 Every question you answer makes you smarter!',
            '🎯 Focus and determination will lead to success!',
            '📚 Knowledge is power. Keep going!',
            '🚀 You\'re on your way to becoming a master!',
        ],
        hi: [
            '🌟 आप बहुत अच्छा कर रहे हैं! सीखते रहें!',
            '💪 हर सवाल आपको और स्मार्ट बनाता है!',
            '🎯 ध्यान और दृढ़ संकल्प सफलता की ओर ले जाएगा!',
            '📚 ज्ञान ही शक्ति है। आगे बढ़ते रहें!',
            '🚀 आप मास्टर बनने के रास्ते पर हैं!',
        ],
    };

    const langMessages = messages[language] || messages.en;
    return langMessages[Math.floor(Math.random() * langMessages.length)];
}

/**
 * Create quest/challenge system
 * @param {string} type - Quest type
 * @param {Object} params - Quest parameters
 * @returns {Object} - Quest definition
 */
export function createQuest(type, params = {}) {
    const quests = {
        daily: {
            id: `daily-${Date.now()}`,
            name: 'Daily Challenge',
            description: 'Complete 3 lessons today',
            target: 3,
            reward: { points: 20, badge: 'daily-warrior' },
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        weekly: {
            id: `weekly-${Date.now()}`,
            name: 'Weekly Quest',
            description: 'Master 2 new topics this week',
            target: 2,
            reward: { points: 100, badge: 'week-master' },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        special: {
            id: `special-${Date.now()}`,
            name: params.name || 'Special Quest',
            description: params.description || 'Complete special challenge',
            target: params.target || 1,
            reward: params.reward || { points: 50 },
            expiresAt: params.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    };

    return quests[type] || quests.daily;
}

export default {
    ACHIEVEMENTS,
    LEVELS,
    calculateLevel,
    checkAchievement,
    awardAchievement,
    calculateStreak,
    generateLeaderboard,
    getMotivationalMessage,
    createQuest,
};
