import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { getModels } from './db/models.js';
import coordinatorAgent from './agents/coordinator-agent.js';
import literacyTutorAgent from './agents/literacy-tutor-agent.js';
import numeracyTutorAgent from './agents/numeracy-tutor-agent.js';
import assessmentAgent from './agents/assessment-agent.js';
import gapAnalyzerAgent from './agents/gap-analyzer-agent.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Get database models (SQLite - no initialization needed!)
const models = getModels();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined')); // Logging
app.use(express.static('public')); // Serve frontend files

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check endpoint (for Cloud Run)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'AI Tutoring System for India',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            api: '/api',
            docs: '/api/docs',
        },
    });
});

// ==================== AI AGENT ENDPOINTS ====================

/**
 * POST /api/chat
 * Main chat endpoint - routes to coordinator agent
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { query, studentId, language = 'en', level = 'intermediate', studentName } = req.body;

        if (!query || !studentId) {
            return res.status(400).json({ error: 'Missing required fields: query, studentId' });
        }

        const context = { language, level, studentName };
        const response = await coordinatorAgent.processQuery(query, studentId, context);

        res.json(response);
    } catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: 'Failed to process query', details: error.message });
    }
});

/**
 * POST /api/literacy/teach
 * Literacy tutor - teach a concept
 */
app.post('/api/literacy/teach', async (req, res) => {
    try {
        const response = await literacyTutorAgent.teach(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/literacy/teach:', error);
        res.status(500).json({ error: 'Failed to teach literacy concept', details: error.message });
    }
});

/**
 * POST /api/literacy/reading
 * Literacy tutor - help with reading
 */
app.post('/api/literacy/reading', async (req, res) => {
    try {
        const response = await literacyTutorAgent.helpWithReading(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/literacy/reading:', error);
        res.status(500).json({ error: 'Failed to help with reading', details: error.message });
    }
});

/**
 * POST /api/literacy/writing
 * Literacy tutor - help with writing
 */
app.post('/api/literacy/writing', async (req, res) => {
    try {
        const response = await literacyTutorAgent.helpWithWriting(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/literacy/writing:', error);
        res.status(500).json({ error: 'Failed to help with writing', details: error.message });
    }
});

/**
 * POST /api/literacy/exercise
 * Literacy tutor - generate Duolingo-style exercise
 */
app.post('/api/literacy/exercise', async (req, res) => {
    try {
        const response = await literacyTutorAgent.generateDuolingoExercise(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/literacy/exercise:', error);
        res.status(500).json({ error: 'Failed to generate exercise', details: error.message });
    }
});

/**
 * POST /api/numeracy/teach
 * Numeracy tutor - teach a math concept
 */
app.post('/api/numeracy/teach', async (req, res) => {
    try {
        const response = await numeracyTutorAgent.teach(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/numeracy/teach:', error);
        res.status(500).json({ error: 'Failed to teach numeracy concept', details: error.message });
    }
});

/**
 * POST /api/numeracy/quiz
 * Numeracy tutor - generate math quiz
 */
app.post('/api/numeracy/quiz', async (req, res) => {
    try {
        const response = await numeracyTutorAgent.generateQuiz(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/numeracy/quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz', details: error.message });
    }
});

/**
 * POST /api/numeracy/solve
 * Numeracy tutor - solve a problem
 */
app.post('/api/numeracy/solve', async (req, res) => {
    try {
        const response = await numeracyTutorAgent.solveProblem(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/numeracy/solve:', error);
        res.status(500).json({ error: 'Failed to solve problem', details: error.message });
    }
});

/**
 * POST /api/assessment/diagnostic
 * Generate initial diagnostic assessment
 */
app.post('/api/assessment/diagnostic', async (req, res) => {
    try {
        const response = await gapAnalyzerAgent.generateInitialAssessment(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/assessment/diagnostic:', error);
        res.status(500).json({ error: 'Failed to generate diagnostic', details: error.message });
    }
});

/**
 * POST /api/assessment/generate
 * Generate a personalized assessment
 */
app.post('/api/assessment/generate', async (req, res) => {
    try {
        const response = await assessmentAgent.generateAssessment(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/assessment/generate:', error);
        res.status(500).json({ error: 'Failed to generate assessment', details: error.message });
    }
});

/**
 * POST /api/assessment/evaluate
 * Evaluate student responses
 */
app.post('/api/assessment/evaluate', async (req, res) => {
    try {
        const response = await assessmentAgent.evaluateResponses(req.body);

        // Save assessment results to Firestore
        if (response.success && req.body.studentId) {
            await models.Student.addAssessment(req.body.studentId, {
                assessmentId: response.assessmentId,
                subject: req.body.subject || 'general',
                topics: req.body.topics || [],
                totalQuestions: response.totalQuestions,
                correctAnswers: response.correctAnswers,
                score: parseFloat(response.percentage),
                grade: response.grade,
                results: response.results,
            });
        }

        res.json(response);
    } catch (error) {
        console.error('Error in /api/assessment/evaluate:', error);
        res.status(500).json({ error: 'Failed to evaluate assessment', details: error.message });
    }
});

/**
 * POST /api/analytics/student
 * Analyze individual student performance
 */
app.post('/api/analytics/student', async (req, res) => {
    try {
        const { studentId } = req.body;

        // Get student data
        const student = await models.Student.getById(studentId);
        const assessments = await models.Student.getAssessments(studentId);
        const progress = await models.Student.getProgress(studentId);

        // Analyze with Gap Analyzer Agent
        const analysis = await gapAnalyzerAgent.analyzeStudentPerformance({
            studentId,
            studentName: student?.name || 'Student',
            assessmentHistory: assessments,
            progressData: progress,
            ...req.body,
        });

        res.json(analysis);
    } catch (error) {
        console.error('Error in /api/analytics/student:', error);
        res.status(500).json({ error: 'Failed to analyze student', details: error.message });
    }
});

/**
 * POST /api/analytics/class
 * Analyze class-wide performance
 */
app.post('/api/analytics/class', async (req, res) => {
    try {
        const response = await gapAnalyzerAgent.analyzeClassPerformance(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/analytics/class:', error);
        res.status(500).json({ error: 'Failed to analyze class', details: error.message });
    }
});

/**
 * POST /api/analytics/learning-path
 * Generate personalized learning path
 */
app.post('/api/analytics/learning-path', async (req, res) => {
    try {
        const response = await gapAnalyzerAgent.generateLearningPath(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/analytics/learning-path:', error);
        res.status(500).json({ error: 'Failed to generate learning path', details: error.message });
    }
});

// ==================== DATABASE ENDPOINTS ====================

/**
 * GET /api/students/:id
 * Get student by ID
 */
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await models.Student.getById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student', details: error.message });
    }
});

/**
 * POST /api/students
 * Create new student
 */
app.post('/api/students', async (req, res) => {
    try {
        const student = await models.Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Failed to create student', details: error.message });
    }
});

/**
 * GET /api/students/:id/progress
 * Get student progress
 */
app.get('/api/students/:id/progress', async (req, res) => {
    try {
        const progress = await models.Student.getProgress(req.params.id, req.query.subject);
        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress', details: error.message });
    }
});

/**
 * POST /api/students/:id/progress
 * Add student progress
 */
app.post('/api/students/:id/progress', async (req, res) => {
    try {
        await models.Student.addProgress(req.params.id, req.body);
        res.status(201).json({ success: true, message: 'Progress added' });
    } catch (error) {
        console.error('Error adding progress:', error);
        res.status(500).json({ error: 'Failed to add progress', details: error.message });
    }
});

/**
 * GET /api/students/:id/assessments
 * Get student assessments
 */
app.get('/api/students/:id/assessments', async (req, res) => {
    try {
        const assessments = await models.Student.getAssessments(req.params.id);
        res.json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ error: 'Failed to fetch assessments', details: error.message });
    }
});

/**
 * GET /api/schools/:id/students
 * Get students by school
 */
app.get('/api/schools/:id/students', async (req, res) => {
    try {
        const students = await models.Student.getBySchool(req.params.id, req.query.grade);
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students', details: error.message });
    }
});

/**
 * GET /api/teachers/:id/students
 * Get students by teacher
 */
app.get('/api/teachers/:id/students', async (req, res) => {
    try {
        const students = await models.Teacher.getByTeacher(req.params.id);
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students', details: error.message });
    }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

// ==================== TEACHER ENDPOINTS ====================

/**
 * GET /api/teacher/dashboard
 * Get teacher dashboard stats
 */
app.get('/api/teacher/dashboard', async (req, res) => {
    try {
        // Mock teacher ID for now
        const stats = await models.Teacher.getClassStats('teacher_1');
        res.json(stats);
    } catch (error) {
        console.error('Error in /api/teacher/dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AI Tutoring System server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌍 Region: ${process.env.GOOGLE_CLOUD_REGION || 'asia-south1'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
