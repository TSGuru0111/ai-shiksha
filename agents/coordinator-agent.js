import { VertexAI } from '@google-cloud/vertexai';
import { agentConfig } from '../config/agent-config.js';

// Initialize Vertex AI
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_REGION || 'asia-south1',
});

/**
 * Coordinator Agent - Main orchestrator for the multi-agent system
 * Routes student queries to appropriate specialist agents
 */
class CoordinatorAgent {
    constructor() {
        this.model = vertexAI.getGenerativeModel({
            model: agentConfig.model.name,
            generationConfig: {
                temperature: agentConfig.model.temperature,
                topP: agentConfig.model.topP,
                topK: agentConfig.model.topK,
                maxOutputTokens: agentConfig.model.maxOutputTokens,
            },
            systemInstruction: agentConfig.coordinator.systemInstruction,
        });

        this.conversationHistory = new Map(); // Store conversation context per student
    }

    /**
     * Determine which specialist agent should handle the query
     * @param {string} query - Student's question or request
     * @param {string} studentId - Unique student identifier
     * @returns {Object} - Agent routing decision
     */
    async routeQuery(query, studentId, language = 'en') {
        try {
            const prompt = `
Student Query: "${query}"
Student Language: ${language}

Analyze this query and determine:
1. Which specialist agent should handle it? (literacy, numeracy, assessment, or general)
2. What is the main topic/subject?
3. What is the student's likely intent?
4. Should multiple agents be involved?

Respond in JSON format:
{
  "primaryAgent": "literacy|numeracy|assessment|general",
  "secondaryAgents": [],
  "topic": "specific topic",
  "intent": "learn|practice|assess|help",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback routing based on keywords
            return this.fallbackRouting(query);
        } catch (error) {
            console.error('Error in routeQuery:', error);
            return this.fallbackRouting(query);
        }
    }

    /**
     * Fallback routing logic using keyword matching
     */
    fallbackRouting(query) {
        const lowerQuery = query.toLowerCase();

        // Literacy keywords
        const literacyKeywords = ['read', 'write', 'letter', 'word', 'sentence', 'story', 'grammar', 'spell'];
        // Numeracy keywords
        const numeracyKeywords = ['math', 'number', 'add', 'subtract', 'multiply', 'divide', 'count', 'calculate'];
        // Assessment keywords
        const assessmentKeywords = ['test', 'quiz', 'assess', 'exam', 'practice', 'check'];

        if (literacyKeywords.some(keyword => lowerQuery.includes(keyword))) {
            return {
                primaryAgent: 'literacy',
                topic: 'literacy',
                intent: 'learn',
                confidence: 0.7,
                reasoning: 'Keyword match for literacy topics',
            };
        }

        if (numeracyKeywords.some(keyword => lowerQuery.includes(keyword))) {
            return {
                primaryAgent: 'numeracy',
                topic: 'numeracy',
                intent: 'learn',
                confidence: 0.7,
                reasoning: 'Keyword match for numeracy topics',
            };
        }

        if (assessmentKeywords.some(keyword => lowerQuery.includes(keyword))) {
            return {
                primaryAgent: 'assessment',
                topic: 'assessment',
                intent: 'assess',
                confidence: 0.7,
                reasoning: 'Keyword match for assessment',
            };
        }

        return {
            primaryAgent: 'general',
            topic: 'general',
            intent: 'help',
            confidence: 0.5,
            reasoning: 'No specific match, using general assistance',
        };
    }

    /**
     * Process a student query and coordinate with appropriate agents
     * @param {string} query - Student's question
     * @param {string} studentId - Student identifier
     * @param {Object} context - Additional context (language, level, etc.)
     * @returns {Object} - Response from appropriate agent
     */
    async processQuery(query, studentId, context = {}) {
        try {
            // Get conversation history for this student
            let history = this.conversationHistory.get(studentId) || [];

            // Route the query
            const routing = await this.routeQuery(query, studentId, context.language);

            // Build the conversation prompt
            const conversationPrompt = this.buildConversationPrompt(query, context, routing, history);

            // Generate response
            const result = await this.model.generateContent(conversationPrompt);
            const response = result.response.text();

            // Update conversation history
            history.push({
                role: 'user',
                content: query,
                timestamp: new Date(),
            });
            history.push({
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                routing: routing,
            });

            // Keep only last 10 exchanges
            if (history.length > 20) {
                history = history.slice(-20);
            }

            this.conversationHistory.set(studentId, history);

            return {
                response,
                routing,
                agentUsed: 'coordinator',
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('Error in processQuery:', error);
            throw error;
        }
    }

    /**
     * Build conversation prompt with context
     */
    buildConversationPrompt(query, context, routing, history) {
        const { language = 'en', level = 'intermediate', studentName = 'Student' } = context;

        let prompt = `Student Information:
- Name: ${studentName}
- Learning Level: ${level}
- Preferred Language: ${language}
- Current Topic: ${routing.topic}

`;

        // Add recent conversation history
        if (history.length > 0) {
            prompt += 'Recent Conversation:\n';
            history.slice(-6).forEach(msg => {
                prompt += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`;
            });
            prompt += '\n';
        }

        prompt += `Current Student Query: "${query}"

Routing Decision: This query should be handled by the ${routing.primaryAgent} agent.

Please provide a helpful, encouraging response in ${language}. 
If this is a ${routing.primaryAgent} question, provide appropriate guidance.
Be patient, supportive, and culturally sensitive.`;

        return prompt;
    }

    /**
     * Clear conversation history for a student
     */
    clearHistory(studentId) {
        this.conversationHistory.delete(studentId);
    }

    /**
     * Get conversation history for a student
     */
    getHistory(studentId) {
        return this.conversationHistory.get(studentId) || [];
    }
}

// Export singleton instance
export const coordinatorAgent = new CoordinatorAgent();
export default coordinatorAgent;
