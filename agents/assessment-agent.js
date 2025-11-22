import { VertexAI } from '@google-cloud/vertexai';
import { agentConfig } from '../config/agent-config.js';

// Initialize Vertex AI
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_REGION || 'asia-south1',
});

/**
 * Assessment Agent - Creates and evaluates personalized assessments
 * Generates adaptive tests and provides detailed feedback
 */
class AssessmentAgent {
    constructor() {
        this.model = vertexAI.getGenerativeModel({
            model: agentConfig.model.name,
            generationConfig: {
                temperature: 0.6, // Lower temperature for consistent assessment
                topP: agentConfig.model.topP,
                topK: agentConfig.model.topK,
                maxOutputTokens: agentConfig.model.maxOutputTokens,
            },
            systemInstruction: agentConfig.assessmentAgent.systemInstruction,
        });
    }

    /**
     * Generate a personalized assessment
     * @param {Object} params - Assessment parameters
     * @returns {Object} - Generated assessment
     */
    async generateAssessment(params) {
        const {
            subject,
            topics = [],
            difficulty = 'medium',
            questionCount = 10,
            questionTypes = ['multiple-choice', 'short-answer'],
            studentLevel = 'intermediate',
            language = 'en',
        } = params;

        try {
            const prompt = `
Generate a personalized assessment:
- Subject: ${subject}
- Topics: ${topics.join(', ')}
- Difficulty: ${difficulty}
- Number of Questions: ${questionCount}
- Question Types: ${questionTypes.join(', ')}
- Student Level: ${studentLevel}
- Language: ${language}

Create ${questionCount} questions that:
1. Test understanding, not just memorization
2. Progress from easier to harder
3. Use Indian context and examples
4. Are culturally appropriate
5. Are clear and unambiguous

For each question, provide:
- Question text
- Question type
- Options (if multiple choice)
- Correct answer
- Explanation of the correct answer
- Point value

Format as JSON array:
[
  {
    "id": 1,
    "type": "multiple-choice",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "B",
    "explanation": "...",
    "points": 1,
    "topic": "..."
  },
  ...
]`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Extract JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

            return {
                success: true,
                assessmentId: this.generateAssessmentId(),
                subject,
                topics,
                difficulty,
                questionCount: questions.length,
                questions,
                language,
                createdAt: new Date(),
            };
        } catch (error) {
            console.error('Error in generateAssessment:', error);
            throw error;
        }
    }

    /**
     * Evaluate student responses
     * @param {Object} params - Evaluation parameters
     * @returns {Object} - Evaluation results
     */
    async evaluateResponses(params) {
        const {
            assessmentId,
            questions,
            studentResponses,
            studentId,
            language = 'en',
        } = params;

        try {
            let totalPoints = 0;
            let earnedPoints = 0;
            const results = [];

            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                const studentAnswer = studentResponses[i];

                totalPoints += question.points || 1;

                // Evaluate the response
                const evaluation = await this.evaluateSingleResponse({
                    question,
                    studentAnswer,
                    language,
                });

                if (evaluation.isCorrect) {
                    earnedPoints += question.points || 1;
                }

                results.push({
                    questionId: question.id,
                    question: question.question,
                    studentAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect: evaluation.isCorrect,
                    feedback: evaluation.feedback,
                    points: evaluation.isCorrect ? (question.points || 1) : 0,
                });
            }

            const percentage = (earnedPoints / totalPoints) * 100;

            return {
                success: true,
                assessmentId,
                studentId,
                totalQuestions: questions.length,
                correctAnswers: results.filter(r => r.isCorrect).length,
                totalPoints,
                earnedPoints,
                percentage: percentage.toFixed(2),
                grade: this.calculateGrade(percentage),
                results,
                completedAt: new Date(),
            };
        } catch (error) {
            console.error('Error in evaluateResponses:', error);
            throw error;
        }
    }

    /**
     * Evaluate a single response
     * @param {Object} params - Single response parameters
     * @returns {Object} - Evaluation result
     */
    async evaluateSingleResponse(params) {
        const { question, studentAnswer, language } = params;

        try {
            // For multiple choice, simple comparison
            if (question.type === 'multiple-choice' || question.type === 'true-false') {
                const isCorrect = studentAnswer.trim().toLowerCase() ===
                    question.correctAnswer.trim().toLowerCase();

                return {
                    isCorrect,
                    feedback: isCorrect
                        ? this.getPositiveFeedback(language)
                        : `${this.getEncouragingFeedback(language)} ${question.explanation}`,
                };
            }

            // For open-ended questions, use AI to evaluate
            const prompt = `
Question: ${question.question}
Correct Answer: ${question.correctAnswer}
Student's Answer: ${studentAnswer}
Language: ${language}

Evaluate if the student's answer is correct or partially correct.
Consider:
1. Is the core concept understood?
2. Is the answer substantially correct even if worded differently?
3. Are there any misconceptions?

Respond in JSON format:
{
  "isCorrect": true/false,
  "partialCredit": 0.0-1.0,
  "feedback": "constructive feedback in ${language}",
  "misconceptions": ["any identified misconceptions"]
}`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback
            return {
                isCorrect: false,
                feedback: 'Unable to evaluate. Please review with teacher.',
            };
        } catch (error) {
            console.error('Error in evaluateSingleResponse:', error);
            return {
                isCorrect: false,
                feedback: 'Evaluation error occurred.',
            };
        }
    }

    /**
     * Generate adaptive next question based on performance
     * @param {Object} params - Adaptive parameters
     * @returns {Object} - Next question
     */
    async generateAdaptiveQuestion(params) {
        const {
            subject,
            topic,
            previousPerformance,
            studentLevel,
            language = 'en',
        } = params;

        const difficulty = this.calculateNextDifficulty(previousPerformance);

        try {
            const prompt = `
Generate one adaptive question:
- Subject: ${subject}
- Topic: ${topic}
- Difficulty: ${difficulty}
- Student Level: ${studentLevel}
- Language: ${language}
- Previous Performance: ${previousPerformance.correct}/${previousPerformance.total} correct

Create a question that:
1. Matches the calculated difficulty
2. Tests understanding of ${topic}
3. Uses Indian context
4. Provides appropriate challenge

Format as JSON.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (error) {
            console.error('Error in generateAdaptiveQuestion:', error);
            throw error;
        }
    }

    /**
     * Calculate next difficulty based on performance
     */
    calculateNextDifficulty(performance) {
        const accuracy = performance.correct / performance.total;

        if (accuracy >= 0.8) return 'hard';
        if (accuracy >= 0.6) return 'medium';
        return 'easy';
    }

    /**
     * Calculate letter grade from percentage
     */
    calculateGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    }

    /**
     * Generate assessment ID
     */
    generateAssessmentId() {
        return `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get positive feedback in different languages
     */
    getPositiveFeedback(language) {
        const feedback = {
            en: 'Excellent! That\'s correct! 🎉',
            hi: 'बहुत बढ़िया! सही है! 🎉',
            ta: 'அருமை! சரியானது! 🎉',
            te: 'అద్భుతం! సరైనది! 🎉',
            mr: 'उत्तम! बरोबर आहे! 🎉',
            bn: 'চমৎকার! সঠিক! 🎉',
        };
        return feedback[language] || feedback.en;
    }

    /**
     * Get encouraging feedback for incorrect answers
     */
    getEncouragingFeedback(language) {
        const feedback = {
            en: 'Good try! Let\'s learn from this:',
            hi: 'अच्छी कोशिश! आइए इससे सीखें:',
            ta: 'நல்ல முயற்சி! இதிலிருந்து கற்போம்:',
            te: 'మంచి ప్రయత్నం! దీని నుండి నేర్చుకుందాం:',
            mr: 'चांगला प्रयत्न! चला यातून शिकूया:',
            bn: 'ভালো চেষ্টা! এটি থেকে শিখি:',
        };
        return feedback[language] || feedback.en;
    }
}

// Export singleton instance
export const assessmentAgent = new AssessmentAgent();
export default assessmentAgent;
