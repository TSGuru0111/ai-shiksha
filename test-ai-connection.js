import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';

async function testConnection() {
    console.log('Testing AI Connection...');
    console.log('Project:', process.env.GOOGLE_CLOUD_PROJECT);
    console.log('Location:', process.env.GOOGLE_CLOUD_REGION);

    try {
        const vertexAI = new VertexAI({
            project: process.env.GOOGLE_CLOUD_PROJECT,
            location: process.env.GOOGLE_CLOUD_REGION || 'asia-south1',
        });

        const model = vertexAI.getGenerativeModel({
            model: 'gemini-1.5-flash-001',
        });

        const prompt = 'Say "Hello, I am working!" if you can hear me.';
        console.log('Sending prompt:', prompt);

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        console.log('----------------------------------------');
        console.log('AI Response:', response);
        console.log('----------------------------------------');
        console.log('✅ Connection Successful!');
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        if (error.message.includes('API key not valid')) {
            console.log('👉 Please check your GEMINI_API_KEY in .env file');
        }
    }
}

testConnection();
