import { CohereClient } from 'cohere-ai';
import { agentConfig } from '../config/agent-config.js';

// Initialize Cohere AI
const getCohereClient = () => {
    if (!process.env.COHERE_API_KEY) {
        console.warn('⚠️ COHERE_API_KEY is missing. AI features will use fallback mock data.');
        return null;
    }
    return new CohereClient({
        token: process.env.COHERE_API_KEY,
    });
};

/**
 * GapAnalyzerAgent - Analyzes student performance to identify learning gaps
 * Uses Cohere AI
 */
class GapAnalyzerAgent {
    constructor() {
        this.cohere = getCohereClient();
    }

    /**
     * Analyze individual student performance
     */
    async analyzeStudentPerformance(params) {
        const {
            studentId,
            studentName,
            assessmentHistory = [],
            progressData = [],
            timeframe = '30days',
            language = 'en',
        } = params;

        if (!this.cohere) {
            return {
                success: true,
                analysis: {
                    overallPerformance: { grade: 'B', trend: 'stable', summary: 'Mock analysis due to missing API key.' },
                    learningGaps: [],
                    strengths: ['Eagerness to learn'],
                    recommendations: [{ priority: 'high', action: 'Practice basics', rationale: 'Foundation is key' }]
                }
            };
        }

        try {
            const prompt = `
Analyze student performance for ${studentName}.
History: ${JSON.stringify(assessmentHistory)}
Progress: ${JSON.stringify(progressData)}

Return JSON with: overallPerformance, learningGaps, strengths, recommendations.
`;

            const response = await this.cohere.chat({
                message: prompt,
                temperature: 0.3,
            });

            let text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
            return {
                success: true,
                analysis: JSON.parse(text),
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('Error in analyzeStudentPerformance:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate initial diagnostic assessment (10 questions)
     */
    async generateInitialAssessment(params) {
        const {
            studentLevel = 'unknown',
            language = 'en',
            subjects = ['literacy', 'numeracy'],
        } = params;

        // Fallback Mock Data (10 questions)
        const mockAssessment = {
            questions: Array(10).fill(null).map((_, i) => {
                if (i < 5) {
                    // Literacy
                    return {
                        id: `lit_${i}`,
                        subject: 'literacy',
                        question: `Mock Literacy Q${i + 1}: Identify the vowel in 'Cat'.`,
                        options: ['C', 'a', 't', 'None'],
                        correctAnswer: 'a',
                        explanation: "'a' is the vowel."
                    };
                } else {
                    // Numeracy
                    return {
                        id: `num_${i}`,
                        subject: 'numeracy',
                        question: `Mock Numeracy Q${i + 1}: What is ${i} + ${i + 2}?`,
                        options: [`${2 * i + 2}`, `${2 * i + 1}`, `${2 * i + 3}`, '0'],
                        correctAnswer: `${2 * i + 2}`,
                        explanation: `${i} + ${i + 2} = ${2 * i + 2}`
                    };
                }
            })
        };

        if (!this.cohere) {
            console.log('⚠️ Using fallback mock assessment data (No API Key)');
            return {
                success: true,
                response: "I'm having trouble connecting to the cloud, but let's try these practice questions!",
                assessment: mockAssessment,
                timestamp: new Date(),
                isMock: true
            };
        }

        try {
            const prompt = `
Generate a diagnostic assessment with exactly 10 questions (5 Literacy, 5 Numeracy).
Student Level: ${studentLevel}
Language: ${language}
Context: Indian school curriculum.

Return ONLY a JSON object with this structure:
{
  "questions": [
    {
      "id": "unique_id",
      "subject": "literacy|numeracy",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Correct Option",
      "explanation": "Why it is correct"
    },
    ...
  ]
}
`;

            const response = await this.cohere.chat({
                message: prompt,
                temperature: 0.4,
            });

            let text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
            let assessmentData;
            try {
                assessmentData = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON from Cohere:', text);
                throw new Error('Invalid JSON response');
            }

            return {
                success: true,
                response: "Here is your diagnostic test to help me understand what you know!",
                assessment: assessmentData,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('Error in generateInitialAssessment:', error);
            return {
                success: true,
                response: "I'm having trouble connecting, but let's try these practice questions!",
                assessment: mockAssessment,
                timestamp: new Date(),
                isMock: true
            };
        }
    }
}

export default new GapAnalyzerAgent();
