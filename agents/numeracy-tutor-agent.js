import { CohereClient } from 'cohere-ai';
import { agentConfig } from '../config/agent-config.js';

// Initialize Cohere AI
// We use a lazy initialization or check for key to prevent immediate crash if key is missing
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
 * NumeracyTutorAgent - Specialized in teaching mathematics and numerical reasoning
 * Uses Cohere AI for generation
 */
class NumeracyTutorAgent {
    constructor() {
        this.cohere = getCohereClient();
    }

    /**
     * Teach a math concept or solve a problem
     */
    async teach(params) {
        const {
            studentId,
            query,
            context = [],
            studentLevel = 'beginner',
            language = 'en',
            topic = 'general',
        } = params;

        if (!this.cohere) {
            return {
                success: true,
                response: "I'm ready to help with math! (AI connection pending...)",
                topic,
                timestamp: new Date()
            };
        }

        try {
            const prompt = `
Role: You are a friendly and patient math tutor for a student in India.
Student Query: "${query}"
Student Level: ${studentLevel}
Language: ${language}
Topic: ${topic}

Instructions:
Instructions:
1. Respond naturally and conversationally in the requested language (${language}).
2. Do NOT use labels like "Solution:", "Step 1:", etc. unless it's a list. Just speak directly.
3. Provide a step-by-step explanation using real-world examples from Indian daily life (e.g., market prices, cricket scores).
4. Keep the tone encouraging and simple.
5. If the student asks for a solution, explain the method first.
`;

            const response = await this.cohere.chat({
                message: prompt,
                temperature: 0.3,
            });

            return {
                success: true,
                response: response.text,
                topic,
                level: studentLevel,
                language,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('Error in NumeracyTutorAgent.teach:', error);
            return {
                success: false,
                response: "I'm having trouble with the numbers right now. Can we try again?",
                error: error.message,
            };
        }
    }

    /**
     * Generate a math quiz with 10 questions
     */
    async generateQuiz(params) {
        const {
            topic = 'arithmetic',
            difficulty = 'easy',
            language = 'en',
        } = params;

        // Fallback Mock Data (10 questions)
        const mockQuiz = Array(10).fill(null).map((_, i) => ({
            question: `Mock Question ${i + 1}: If 1 kg of potatoes costs ₹${20 + i * 5}, how much for 2 kg?`,
            options: [`₹${40 + i * 10}`, `₹${30 + i * 10}`, `₹${50 + i * 10}`, `₹${25 + i * 10}`],
            correctAnswer: `₹${40 + i * 10}`,
            explanation: `2 kg * ₹${20 + i * 5} = ₹${40 + i * 10}. Simple multiplication!`
        }));

        if (!this.cohere) {
            console.log('⚠️ Using fallback mock quiz data (No API Key)');
            return {
                success: true,
                response: "Here is a practice quiz for you!",
                quiz: mockQuiz,
                timestamp: new Date(),
                isMock: true
            };
        }

        try {
            const prompt = `
Generate a math quiz with exactly 10 questions.
Topic: ${topic}
Difficulty: ${difficulty}
Language: ${language}
Context: Indian daily life scenarios (markets, festivals, travel).

Return ONLY a JSON array of objects. No markdown formatting.
Structure:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The correct option text (must match one of the options exactly)",
    "explanation": "Brief explanation of the solution"
  },
  ...
]
`;

            const response = await this.cohere.chat({
                message: prompt,
                temperature: 0.4,
            });

            let text = response.text;
            // Clean up potential markdown code blocks
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            let quizData;
            try {
                quizData = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON from Cohere:', text);
                throw new Error('Invalid JSON response');
            }

            return {
                success: true,
                response: "I've prepared 10 math questions for you. Let's solve them!",
                quiz: quizData,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('Error in generateQuiz:', error);
            // Return fallback on error
            return {
                success: true,
                response: "I had trouble generating new questions, but here are some practice ones!",
                quiz: mockQuiz,
                timestamp: new Date(),
                isMock: true
            };
        }
    }
}

export default new NumeracyTutorAgent();
