import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testConnection() {
    console.log('Testing Gemini API with @google/generative-ai...');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is missing in .env file');
        return;
    }
    console.log('API Key length:', apiKey.length);
    console.log('API Key starts with:', apiKey.substring(0, 4));

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-1.5-flash';

    console.log(`\nTesting model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = 'Hello';
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        console.log(`✅ SUCCESS! Response: ${response}`);
    } catch (error) {
        console.error('❌ FAILED!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error statusText:', error.response.statusText);
        }
        console.error('Full error:', JSON.stringify(error, null, 2));
    }
}

testConnection();
