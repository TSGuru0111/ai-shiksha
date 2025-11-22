/**
 * ADK-Based Coordinator Agent
 * Uses Google's Agent Development Kit (Genkit) for proper multi-agent orchestration
 */

import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';

// Configure Genkit with Google AI
configureGenkit({
    plugins: [
        googleAI({
            apiKey: process.env.GEMINI_API_KEY,
        }),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
});

/**
 * Agent routing schema
 */
const AgentRoutingSchema = z.object({
    primaryAgent: z.enum(['literacy', 'numeracy', 'assessment', 'general']),
    secondaryAgents: z.array(z.string()).optional(),
    topic: z.string(),
    intent: z.enum(['learn', 'practice', 'assess', 'help']),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
});

/**
 * Student query schema
 */
const StudentQuerySchema = z.object({
    query: z.string(),
    studentId: z.string(),
    language: z.string().default('en'),
    level: z.string().default('intermediate'),
    studentName: z.string().optional(),
    context: z.object({
        previousTopics: z.array(z.string()).optional(),
        currentSubject: z.string().optional(),
    }).optional(),
});

/**
 * Define the coordinator flow using ADK
 */
export const coordinatorFlow = defineFlow(
    {
        name: 'coordinatorFlow',
        inputSchema: StudentQuerySchema,
        outputSchema: z.object({
            response: z.string(),
            routing: AgentRoutingSchema,
            agentUsed: z.string(),
            timestamp: z.date(),
        }),
    },
    async (input) => {
        const { query, studentId, language, level, studentName, context } = input;

        // Step 1: Analyze and route the query
        const routing = await analyzeQuery(query, language, context);

        // Step 2: Get response from appropriate agent
        let response;
        switch (routing.primaryAgent) {
            case 'literacy':
                response = await invokeLiteracyAgent(query, { language, level, studentName });
                break;
            case 'numeracy':
                response = await invokeNumeracyAgent(query, { language, level, studentName });
                break;
            case 'assessment':
                response = await invokeAssessmentAgent(query, { language, level, studentId });
                break;
            default:
                response = await invokeGeneralAgent(query, { language, level, studentName });
        }

        return {
            response,
            routing,
            agentUsed: routing.primaryAgent,
            timestamp: new Date(),
        };
    }
);

/**
 * Analyze query and determine routing using Gemini
 */
async function analyzeQuery(query, language, context) {
    const { generate } = await import('@genkit-ai/ai');
    const { gemini15Flash } = await import('@genkit-ai/googleai');

    const prompt = `Analyze this student query and determine which specialist agent should handle it.

Student Query: "${query}"
Language: ${language}
Context: ${JSON.stringify(context || {})}

Available Agents:
- literacy: Reading, writing, grammar, vocabulary, language skills
- numeracy: Math, arithmetic, geometry, problem-solving
- assessment: Tests, quizzes, evaluations
- general: General questions, help, guidance

Respond in JSON format:
{
  "primaryAgent": "literacy|numeracy|assessment|general",
  "secondaryAgents": [],
  "topic": "specific topic",
  "intent": "learn|practice|assess|help",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

    const result = await generate({
        model: gemini15Flash,
        prompt,
        config: {
            temperature: 0.3, // Lower for more consistent routing
        },
    });

    try {
        const jsonMatch = result.text().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return AgentRoutingSchema.parse(parsed);
        }
    } catch (error) {
        console.error('Error parsing routing response:', error);
    }

    // Fallback routing
    return {
        primaryAgent: 'general',
        topic: 'general',
        intent: 'help',
        confidence: 0.5,
        reasoning: 'Fallback routing due to parsing error',
    };
}

/**
 * Invoke Literacy Agent
 */
async function invokeLiteracyAgent(query, options) {
    const { generate } = await import('@genkit-ai/ai');
    const { gemini15Flash } = await import('@genkit-ai/googleai');

    const systemPrompt = `You are a Literacy Tutor Agent for government school students in India.

Your teaching approach:
- Use phonics-based methods for early readers
- Incorporate storytelling with Indian cultural context
- Provide examples using familiar objects and situations
- Break down complex words into manageable parts
- Use visual descriptions and mnemonics
- Encourage practice through relatable exercises
- Celebrate small victories to build confidence

Adapt to the student's level: ${options.level}
Respond in: ${options.language}
Be patient, encouraging, and culturally sensitive.`;

    const result = await generate({
        model: gemini15Flash,
        prompt: `${systemPrompt}\n\nStudent: ${query}`,
        config: {
            temperature: 0.8,
            maxOutputTokens: 2048,
        },
    });

    return result.text();
}

/**
 * Invoke Numeracy Agent
 */
async function invokeNumeracyAgent(query, options) {
    const { generate } = await import('@genkit-ai/ai');
    const { gemini15Flash } = await import('@genkit-ai/googleai');

    const systemPrompt = `You are a Numeracy Tutor Agent for government school students in India.

Your teaching approach:
- Use visual representations (describe diagrams, number lines)
- Provide real-world examples from Indian context (₹ rupees, cricket, markets)
- Break down problems into step-by-step solutions
- Use concrete objects before moving to abstract concepts
- Encourage mental math and estimation
- Connect math to daily life situations

Adapt to the student's level: ${options.level}
Respond in: ${options.language}
Be patient and celebrate problem-solving efforts.`;

    const result = await generate({
        model: gemini15Flash,
        prompt: `${systemPrompt}\n\nStudent: ${query}`,
        config: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        },
    });

    return result.text();
}

/**
 * Invoke Assessment Agent
 */
async function invokeAssessmentAgent(query, options) {
    const { generate } = await import('@genkit-ai/ai');
    const { gemini15Flash } = await import('@genkit-ai/googleai');

    const systemPrompt = `You are an Assessment Agent for government school students in India.

Your responsibilities:
- Create personalized assessments based on student's level
- Generate questions that test understanding, not just memorization
- Provide immediate, constructive feedback
- Adapt difficulty based on performance
- Use culturally relevant contexts

Student Level: ${options.level}
Language: ${options.language}`;

    const result = await generate({
        model: gemini15Flash,
        prompt: `${systemPrompt}\n\nRequest: ${query}`,
        config: {
            temperature: 0.6,
            maxOutputTokens: 2048,
        },
    });

    return result.text();
}

/**
 * Invoke General Agent
 */
async function invokeGeneralAgent(query, options) {
    const { generate } = await import('@genkit-ai/ai');
    const { gemini15Flash } = await import('@genkit-ai/googleai');

    const systemPrompt = `You are a helpful AI tutor for government school students in India.

Provide friendly, encouraging responses that help students learn.
Language: ${options.language}
Student Level: ${options.level}`;

    const result = await generate({
        model: gemini15Flash,
        prompt: `${systemPrompt}\n\nStudent: ${query}`,
        config: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        },
    });

    return result.text();
}

/**
 * Main coordinator function that can be called from Express
 */
export async function processStudentQuery(params) {
    try {
        const result = await runFlow(coordinatorFlow, params);
        return result;
    } catch (error) {
        console.error('Error in coordinator flow:', error);
        throw error;
    }
}

/**
 * Initialize ADK coordinator
 */
export function initializeADKCoordinator() {
    console.log('✅ Google ADK Coordinator initialized');
    console.log('📊 Flows registered: coordinatorFlow');
    return {
        processQuery: processStudentQuery,
        flow: coordinatorFlow,
    };
}

export default {
    coordinatorFlow,
    processStudentQuery,
    initializeADKCoordinator,
};
