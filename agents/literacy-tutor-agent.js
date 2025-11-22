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
 * LiteracyTutorAgent - Specialized in teaching reading, writing, and language skills
 * Uses Cohere AI
 */
class LiteracyTutorAgent {
    constructor() {
        this.cohere = getCohereClient();
    }

    /**
     * Teach a literacy concept or respond to a student query
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
                response: "I'm ready to help you read and write! (AI connection pending...)",
                topic,
                timestamp: new Date()
            };
        }

        try {
            const prompt = `
Role: You are a friendly literacy tutor for a student in India.
Student Query: "${query}"
Student Level: ${studentLevel}
Language: ${language}
Topic: ${topic}

Instructions:
1. Respond naturally and conversationally in the requested language (${language}).
2. Do NOT use labels like "Response:", "Correction:", or "Explanation:". Just speak directly to the student.
3. If asked for a story, write a short, simple story (max 150 words) set in India.
4. If asked for a definition, explain simply with an example sentence.
5. Gently correct any grammar mistakes within your response, without making it a separate section.
`;

            const response = await this.cohere.chat({
                message: prompt,
                temperature: 0.5,
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
            console.error('Error in LiteracyTutorAgent.teach:', error);
            return {
                success: false,
                response: "I'm having a little trouble thinking right now. Can you ask me that again?",
                error: error.message,
            };
        }
    }

    /**
     * Generate a Duolingo-style interactive exercise (10 questions)
     */
    async generateDuolingoExercise(params) {
        const {
            topic = 'vocabulary',
            difficulty = 'easy',
            language = 'en',
            type = 'multiple-choice'
        } = params;

        // Fallback Mock Data (10 questions)
        const mockExercise = Array(10).fill(null).map((_, i) => ({
            question: `Mock Question ${i + 1}: What is the Hindi word for 'School'?`,
            options: ['Vidyalaya', 'Bazaar', 'Ghar', 'Dukan'],
            correctAnswer: 'Vidyalaya',
            explanation: "'Vidyalaya' means School. 'Ghar' is Home, 'Bazaar' is Market."
        }));

        if (!this.cohere) {
            console.log('⚠️ Using fallback mock exercise data (No API Key)');
            return {
                success: true,
                response: "Let's practice with these words!",
                exercise: mockExercise,
                timestamp: new Date(),
                isMock: true
            };
        }

        try {
            const prompt = `
Generate 10 literacy exercises (Duolingo style).
Topic: ${topic}
Type: ${type}
Difficulty: ${difficulty}
Language: ${language}
Context: Indian daily life.

Return ONLY a JSON array of objects. No markdown.
Structure:
[
  {
    "question": "Question text (e.g., Translate 'Apple' to Hindi)",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Correct Option",
    "explanation": "Brief explanation"
  },
  ...
]
`;

            const response = await this.cohere.chat({
                message: prompt,
                temperature: 0.5,
            });

            let text = response.text;
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            let exerciseData;
            try {
                exerciseData = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON from Cohere:', text);
                throw new Error('Invalid JSON response');
            }

            return {
                success: true,
                response: "Here are 10 practice questions for you!",
                exercise: exerciseData,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('Error in generateDuolingoExercise:', error);
            return {
                success: true,
                response: "Let's practice with these instead!",
                exercise: mockExercise,
                timestamp: new Date(),
                isMock: true
            };
        }
    }
}

export default new LiteracyTutorAgent();
