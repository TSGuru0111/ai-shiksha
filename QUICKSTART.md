# 🚀 Quick Start Guide - AI Shiksha

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Google Cloud account
- ✅ Firebase account (uses same Google account)
- ✅ Gemini API key

## Step 1: Get Your Gemini API Key (5 minutes)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key - you'll need it in Step 3

## Step 2: Set Up Google Cloud (10 minutes)

### Option A: Using Google Cloud Console (Web UI)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project called "ai-tutoring-india"
3. Enable these APIs:
   - Vertex AI API
   - Cloud Run API
   - Cloud Firestore API
   - Cloud Build API
4. Create Firestore database:
   - Go to Firestore
   - Click "Create Database"
   - Choose "Native Mode"
   - Select "asia-south1 (Mumbai)"

### Option B: Using Command Line (Faster)

```bash
# Install Google Cloud SDK first if you haven't
# Visit: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Create project
gcloud projects create ai-tutoring-india --name="AI Tutoring System"

# Set as active project
gcloud config set project ai-tutoring-india

# Enable required APIs
gcloud services enable aiplatform.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com

# Create Firestore database
gcloud firestore databases create --location=asia-south1
```

## Step 3: Configure Your Project (2 minutes)

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` file with your details:
```env
# Your Google Cloud Project ID (from Step 2)
GOOGLE_CLOUD_PROJECT=ai-tutoring-india

# Your Gemini API Key (from Step 1)
GEMINI_API_KEY=your-api-key-here

# Keep these as default
GOOGLE_CLOUD_REGION=asia-south1
NODE_ENV=development
PORT=8080
```

## Step 4: Install Dependencies (Already Running)

The dependencies are currently being installed. Once complete, you'll see:
```
added XXX packages
```

If it's not running, execute:
```bash
npm install
```

## Step 5: Test Locally (1 minute)

```bash
# Start the development server
npm run dev
```

You should see:
```
🚀 AI Tutoring System server running on port 8080
📍 Environment: development
🌍 Region: asia-south1
🔗 Health check: http://localhost:8080/health
```

Open your browser to: **http://localhost:8080**

## Step 6: Try It Out!

1. **Select "Student"** role
2. **Choose a subject** (Literacy or Numeracy)
3. **Ask a question** like:
   - "Teach me about vowels"
   - "How do I add two numbers?"
   - "Help me write a story"
4. **Try voice input** by clicking the 🎤 button
5. **Change language** by clicking the 🌐 button

## Step 7: Deploy to Production (Optional)

### Deploy Backend to Cloud Run

```bash
gcloud run deploy ai-tutoring-system \
  --source . \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=your-key-here"
```

### Deploy Frontend to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init

# Select:
# - Firestore
# - Hosting
# - Choose existing project: ai-tutoring-india
# - Public directory: public
# - Single-page app: Yes

# Deploy
firebase deploy
```

## 🎯 Testing the AI Agents

### Test Literacy Tutor
```bash
curl -X POST http://localhost:8080/api/literacy/teach \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "What are vowels?",
    "studentLevel": "beginner",
    "language": "en"
  }'
```

### Test Numeracy Tutor
```bash
curl -X POST http://localhost:8080/api/numeracy/teach \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "How to add numbers?",
    "studentLevel": "beginner",
    "language": "en"
  }'
```

### Test Chat (Coordinator)
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Help me learn to read",
    "studentId": "test-student-123",
    "language": "en"
  }'
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@google-cloud/vertexai'"
**Solution:** Wait for `npm install` to complete, or run:
```bash
npm install @google-cloud/vertexai
```

### Issue: "GOOGLE_CLOUD_PROJECT is not set"
**Solution:** Make sure you created the `.env` file and added your project ID

### Issue: "Failed to get response from AI"
**Solution:** 
1. Check your Gemini API key is correct
2. Verify you have internet connection
3. Check Cloud Console for API quota limits

### Issue: "Port 8080 already in use"
**Solution:** Change the PORT in `.env` file:
```env
PORT=3000
```

### Issue: Voice input not working
**Solution:** 
- Use Chrome or Edge browser
- Allow microphone permissions
- Voice input works best in English, Hindi, Tamil

## 📊 Monitoring Your App

### Check Server Health
```bash
curl http://localhost:8080/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T..."
}
```

### View Logs (Local)
Logs appear in your terminal where you ran `npm run dev`

### View Logs (Cloud Run)
```bash
gcloud run logs read ai-tutoring-system --region=asia-south1
```

## 💡 Tips for Best Experience

1. **Use Chrome or Edge** for best compatibility
2. **Enable microphone** for voice input
3. **Try different languages** - switch using 🌐 button
4. **Ask specific questions** - the AI works better with clear queries
5. **Be patient** - first API call may take a few seconds

## 🎓 Example Questions to Try

### Literacy
- "Teach me the alphabet"
- "How do I write a sentence?"
- "What is a noun?"
- "Help me read this story"

### Numeracy
- "What is addition?"
- "How do I multiply numbers?"
- "Explain fractions to me"
- "Help me solve 25 + 37"

### Mixed
- "I want to take a test"
- "Show me my progress"
- "What should I learn next?"

## 📞 Need Help?

1. Check the **README.md** for detailed documentation
2. Review **PROJECT_SUMMARY.md** for architecture details
3. Check **server.js** for available API endpoints
4. Review **agent-config.js** for agent capabilities

## 🎉 You're All Set!

Your AI-powered tutoring system is ready to help students learn! 

Next steps:
- Customize the UI colors in `public/css/styles.css`
- Add more languages in `config/agent-config.js`
- Create custom assessments
- Set up teacher accounts
- Deploy to production

---

**Happy Teaching! 🎓📚**
