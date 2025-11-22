# ⚡ Simple Setup - 3 Steps

## Step 1: Edit .env File

Open `.env` in your editor:
```powershell
code .env
```

Update these 5 lines:

```bash
# 1. Your Gemini API Key (you already have this!)
GEMINI_API_KEY=AIzaSyBvGFqVwDxK1jlDP3FJ5nFbMBetho6gjCI

# 2. Your Google Cloud Project ID
GOOGLE_CLOUD_PROJECT=ai-tutoring-india

# 3. Firebase Project ID (same as above)
FIREBASE_PROJECT_ID=ai-tutoring-india

# 4. Session Secret (any random 32+ character string)
SESSION_SECRET=Kx9mP2nQ7rS8tU3vW4xY5zA6bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW

# 5. JWT Secret (different random 32+ character string)
JWT_SECRET=aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9
```

**Save the file** (Ctrl+S)

---

## Step 2: Start Server

```powershell
npm run dev
```

---

## Step 3: Open in Browser

Visit: **http://localhost:8080**

---

## That's It! 🎉

Your AI tutoring system is running!

### What You Can Do:
- 🎓 Select "Student" to start learning
- 📖 Choose Literacy or Numeracy
- 💬 Chat with the AI tutor
- 🎤 Try voice input (click microphone button)
- 🌐 Switch languages (click globe button)

### Need Help?
- Check `README.md` for full documentation
- Check `WINDOWS_SETUP.md` for Windows-specific tips
- Check `QUICKSTART.md` for deployment guide

---

## Project Structure (Simplified)

```
project-1/
├── agents/          # 5 AI agents
├── config/          # Configuration
├── db/              # Database models
├── public/          # Frontend (HTML/CSS/JS)
├── utils/           # Utilities
├── features/        # Voice, gamification
├── server.js        # Main server
├── package.json     # Dependencies
├── .env             # Your config
└── README.md        # Documentation
```

---

## Common Commands

```powershell
# Start server
npm run dev

# Stop server
Ctrl+C

# Reinstall dependencies
npm install

# Open in browser
start http://localhost:8080
```

---

**Everything is ready!** Just edit `.env` and run `npm run dev` 🚀
