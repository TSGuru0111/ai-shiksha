/**
 * Adaptive Learning Algorithm
 * Personalizes learning paths based on student performance and progress
 */

/**
 * Calculate mastery level for a topic
 * @param {Array} attempts - Array of attempt objects with {correct, total, timestamp}
 * @returns {Object} - Mastery information
 */
export function calculateMasteryLevel(attempts) {
    if (!attempts || attempts.length === 0) {
        return {
            level: 0,
            status: 'not-started',
            confidence: 0,
        };
    }

    // Recent attempts weighted more heavily
    const weightedScore = attempts.reduce((acc, attempt, index) => {
        const recencyWeight = (index + 1) / attempts.length; // More recent = higher weight
        const accuracy = attempt.correct / attempt.total;
        return acc + (accuracy * recencyWeight);
    }, 0) / attempts.length;

    // Calculate consistency (standard deviation of recent attempts)
    const recentAccuracies = attempts.slice(-5).map(a => a.correct / a.total);
    const avgAccuracy = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
    const variance = recentAccuracies.reduce((acc, val) => acc + Math.pow(val - avgAccuracy, 2), 0) / recentAccuracies.length;
    const consistency = 1 - Math.sqrt(variance);

    // Final mastery level (0-100)
    const masteryLevel = Math.round((weightedScore * 0.7 + consistency * 0.3) * 100);

    // Determine status
    let status;
    if (masteryLevel >= 90) status = 'mastered';
    else if (masteryLevel >= 70) status = 'proficient';
    else if (masteryLevel >= 50) status = 'developing';
    else if (masteryLevel >= 30) status = 'struggling';
    else status = 'needs-support';

    return {
        level: masteryLevel,
        status,
        confidence: consistency,
        totalAttempts: attempts.length,
        recentAccuracy: avgAccuracy,
    };
}

/**
 * Determine optimal next topic based on learning graph
 * @param {Object} studentProgress - Map of topic -> mastery data
 * @param {Object} curriculumGraph - Directed graph of topic dependencies
 * @returns {Object} - Recommended next topic
 */
export function getNextTopic(studentProgress, curriculumGraph) {
    const masteredTopics = new Set();
    const availableTopics = [];

    // Identify mastered topics
    for (const [topic, progress] of Object.entries(studentProgress)) {
        const mastery = calculateMasteryLevel(progress.attempts);
        if (mastery.level >= 70) {
            masteredTopics.add(topic);
        }
    }

    // Find topics where prerequisites are met
    for (const [topic, data] of Object.entries(curriculumGraph)) {
        const prerequisites = data.prerequisites || [];
        const allPrereqsMet = prerequisites.every(prereq => masteredTopics.has(prereq));

        if (allPrereqsMet && !masteredTopics.has(topic)) {
            const currentMastery = studentProgress[topic]
                ? calculateMasteryLevel(studentProgress[topic].attempts)
                : { level: 0, status: 'not-started' };

            availableTopics.push({
                topic,
                difficulty: data.difficulty || 'medium',
                importance: data.importance || 5,
                currentMastery: currentMastery.level,
                status: currentMastery.status,
            });
        }
    }

    // Sort by importance and current mastery (prioritize important topics that are started but not mastered)
    availableTopics.sort((a, b) => {
        // Prioritize topics that are started (20-70% mastery)
        const aInProgress = a.currentMastery > 20 && a.currentMastery < 70;
        const bInProgress = b.currentMastery > 20 && b.currentMastery < 70;

        if (aInProgress && !bInProgress) return -1;
        if (!aInProgress && bInProgress) return 1;

        // Then by importance
        return b.importance - a.importance;
    });

    return availableTopics[0] || null;
}

/**
 * Calculate optimal difficulty for next question
 * @param {Array} recentPerformance - Last N question results
 * @returns {string} - 'easy', 'medium', or 'hard'
 */
export function calculateOptimalDifficulty(recentPerformance) {
    if (!recentPerformance || recentPerformance.length === 0) {
        return 'easy'; // Start easy
    }

    const recentAccuracy = recentPerformance.slice(-5).reduce((acc, result) => {
        return acc + (result.correct ? 1 : 0);
    }, 0) / Math.min(5, recentPerformance.length);

    // Adaptive difficulty based on performance
    if (recentAccuracy >= 0.8) return 'hard';
    if (recentAccuracy >= 0.6) return 'medium';
    return 'easy';
}

/**
 * Generate personalized learning path
 * @param {Object} params - Student data and goals
 * @returns {Object} - Structured learning path
 */
export function generateLearningPath(params) {
    const {
        studentProgress,
        curriculumGraph,
        targetTopics = [],
        timeframe = 30, // days
        dailyTimeAvailable = 30, // minutes
    } = params;

    const path = {
        phases: [],
        estimatedDuration: 0,
        dailySchedule: [],
    };

    let currentTopics = targetTopics.length > 0
        ? targetTopics
        : [getNextTopic(studentProgress, curriculumGraph)?.topic].filter(Boolean);

    const topicsPerPhase = Math.ceil(currentTopics.length / 4) || 1;
    const phaseCount = Math.ceil(currentTopics.length / topicsPerPhase);

    for (let i = 0; i < phaseCount; i++) {
        const phaseTopics = currentTopics.slice(i * topicsPerPhase, (i + 1) * topicsPerPhase);

        path.phases.push({
            phase: i + 1,
            duration: Math.ceil(timeframe / phaseCount),
            topics: phaseTopics,
            goals: phaseTopics.map(topic => `Master ${topic}`),
            activities: [
                'Watch introduction video',
                'Complete practice exercises',
                'Take mini-assessment',
                'Review and reinforce',
            ],
            milestones: [
                `Complete ${phaseTopics.length} topics`,
                'Achieve 70% mastery',
                'Pass phase assessment',
            ],
        });
    }

    // Generate daily schedule
    const totalDays = timeframe;
    for (let day = 1; day <= totalDays; day++) {
        const phase = Math.floor((day - 1) / (timeframe / phaseCount));
        const currentPhase = path.phases[phase] || path.phases[path.phases.length - 1];

        path.dailySchedule.push({
            day,
            phase: phase + 1,
            topics: currentPhase.topics,
            timeAllocated: dailyTimeAvailable,
            activities: [
                { activity: 'Review previous lesson', duration: 5 },
                { activity: 'New concept learning', duration: 15 },
                { activity: 'Practice exercises', duration: 10 },
            ],
        });
    }

    path.estimatedDuration = timeframe;

    return path;
}

/**
 * Identify learning gaps from assessment results
 * @param {Array} assessmentResults - Array of assessment result objects
 * @returns {Array} - Identified gaps with severity
 */
export function identifyLearningGaps(assessmentResults) {
    const topicPerformance = {};

    // Aggregate performance by topic
    assessmentResults.forEach(result => {
        result.results?.forEach(question => {
            const topic = question.topic || 'general';
            if (!topicPerformance[topic]) {
                topicPerformance[topic] = { correct: 0, total: 0, errors: [] };
            }
            topicPerformance[topic].total++;
            if (question.isCorrect) {
                topicPerformance[topic].correct++;
            } else {
                topicPerformance[topic].errors.push({
                    question: question.question,
                    studentAnswer: question.studentAnswer,
                    correctAnswer: question.correctAnswer,
                });
            }
        });
    });

    // Identify gaps
    const gaps = [];
    for (const [topic, performance] of Object.entries(topicPerformance)) {
        const accuracy = performance.correct / performance.total;

        if (accuracy < 0.7) {
            let severity;
            if (accuracy < 0.3) severity = 'critical';
            else if (accuracy < 0.5) severity = 'high';
            else severity = 'medium';

            gaps.push({
                topic,
                severity,
                accuracy: Math.round(accuracy * 100),
                totalQuestions: performance.total,
                incorrectCount: performance.total - performance.correct,
                commonErrors: performance.errors.slice(0, 3),
                recommendation: getRecommendation(topic, accuracy),
            });
        }
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    gaps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return gaps;
}

/**
 * Get recommendation based on topic and accuracy
 */
function getRecommendation(topic, accuracy) {
    if (accuracy < 0.3) {
        return `Review foundational concepts in ${topic}. Consider one-on-one tutoring.`;
    } else if (accuracy < 0.5) {
        return `Practice more exercises in ${topic}. Focus on understanding core concepts.`;
    } else {
        return `Continue practicing ${topic}. You're making good progress!`;
    }
}

/**
 * Calculate learning velocity (topics mastered per week)
 * @param {Object} studentProgress - Student progress data
 * @param {number} weeks - Number of weeks to analyze
 * @returns {Object} - Velocity metrics
 */
export function calculateLearningVelocity(studentProgress, weeks = 4) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));

    let topicsMastered = 0;
    let topicsStarted = 0;
    let totalTimeSpent = 0;

    for (const [topic, data] of Object.entries(studentProgress)) {
        const recentAttempts = data.attempts?.filter(a =>
            new Date(a.timestamp) >= cutoffDate
        ) || [];

        if (recentAttempts.length > 0) {
            topicsStarted++;
            const mastery = calculateMasteryLevel(recentAttempts);
            if (mastery.level >= 70) {
                topicsMastered++;
            }
            totalTimeSpent += data.timeSpent || 0;
        }
    }

    return {
        topicsPerWeek: topicsMastered / weeks,
        topicsStarted,
        topicsMastered,
        averageTimePerTopic: topicsStarted > 0 ? totalTimeSpent / topicsStarted : 0,
        velocity: topicsMastered / weeks > 1 ? 'fast' : topicsMastered / weeks > 0.5 ? 'steady' : 'slow',
    };
}

/**
 * Predict time to mastery for a topic
 * @param {string} topic - Topic name
 * @param {Object} studentProgress - Current progress
 * @param {Object} learningVelocity - Student's learning velocity
 * @returns {number} - Estimated days to mastery
 */
export function predictTimeToMastery(topic, studentProgress, learningVelocity) {
    const currentMastery = studentProgress[topic]
        ? calculateMasteryLevel(studentProgress[topic].attempts)
        : { level: 0 };

    const remainingMastery = 70 - currentMastery.level; // Target is 70%

    if (remainingMastery <= 0) return 0;

    // Estimate based on learning velocity
    const averageProgressPerDay = (learningVelocity.topicsPerWeek / 7) * 10; // 10% per topic
    const estimatedDays = Math.ceil(remainingMastery / averageProgressPerDay);

    return Math.max(1, Math.min(estimatedDays, 90)); // Between 1-90 days
}

export default {
    calculateMasteryLevel,
    getNextTopic,
    calculateOptimalDifficulty,
    generateLearningPath,
    identifyLearningGaps,
    calculateLearningVelocity,
    predictTimeToMastery,
};
