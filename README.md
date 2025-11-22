# AI Shiksha - Smart Learning for India 🇮🇳

An AI-powered tutoring system designed for government schools in India, providing personalized learning in **literacy** and **numeracy** with multilingual support.

![AI Shiksha](https://img.shields.io/badge/AI-Powered-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### For Students
- **Personalized Learning**: AI adapts to individual student levels
- **10-Question Quizzes**: Comprehensive assessments using Cohere AI
- **Multilingual Support**: English, Hindi, Tamil, Telugu, Marathi, Bengali
- **Interactive Chat**: Voice input and text-to-speech capabilities
- **Gamification**: Earn badges and track progress
- **Offline Ready**: Works without internet using service workers

### For Teachers
- **Dashboard Analytics**: View class performance metrics
- **Real-time Activity**: Monitor student assessments live
- **Student Management**: Track individual student progress
- **Performance Insights**: Average scores and completion rates

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **AI Integration**: 
  - Cohere AI (quiz generation)
  - Google Gemini AI (conversational responses)
- **Styling**: Custom CSS with gradient effects and animations

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-shiksha.git
cd ai-shiksha
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
PORT=8080
NODE_ENV=development
```

4. **Run the application**
```bash
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:8080`

## 🎯 Usage

### Student Mode
1. Select **Student** role on the welcome screen
2. Choose a subject: **Literacy**, **Numeracy**, or **Assessment**
3. Start learning through interactive quizzes and exercises
4. Track your progress in the sidebar

### Teacher Mode
1. Select **Teacher** role on the welcome screen
2. View class statistics and recent activity
3. Monitor student performance and assessments

## 🗂️ Project Structure

```
ai-shiksha/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── student-app.js
│   │   └── teacher-dashboard.js
│   └── index.html
├── agents/
│   ├── coordinator-agent.js
│   ├── literacy-tutor-agent.js
│   ├── numeracy-tutor-agent.js
│   ├── gap-analyzer-agent.js
│   └── assessment-agent.js
├── db/
│   └── models.js
├── server.js
├── package.json
└── .env
```

## 🔑 API Endpoints

### Student Endpoints
- `POST /api/chat` - Main chat interface
- `POST /api/literacy/teach` - Literacy concept teaching
- `POST /api/literacy/exercise` - Generate literacy exercises
- `POST /api/numeracy/quiz` - Generate math quizzes
- `POST /api/assessment/diagnostic` - Diagnostic assessment

### Teacher Endpoints
- `GET /api/teacher/dashboard` - Dashboard statistics

### Database Endpoints
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `GET /api/students/:id/progress` - Get student progress
- `GET /api/students/:id/assessments` - Get student assessments

## 🌐 Deployment

### Google Cloud Run

1. **Build Docker image**
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-shiksha
```

2. **Deploy to Cloud Run**
```bash
gcloud run deploy ai-shiksha \
  --image gcr.io/YOUR_PROJECT_ID/ai-shiksha \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=xxx,COHERE_API_KEY=xxx"
```

## 📊 Database Schema

### Tables
- `students` - Student profiles and metadata
- `assessments` - Quiz and test results
- `progress` - Subject-wise learning progress
- `teachers` - Teacher accounts
- `session_logs` - Learning session tracking
- `achievements` - Badges and milestones

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Cohere AI for quiz generation
- Google Gemini for conversational AI
- Government of India's Digital India initiative
- Open-source community

## 📞 Support

For support, email support@aishiksha.com or open an issue in the GitHub repository.

---

**Made with ❤️ for Indian students**
