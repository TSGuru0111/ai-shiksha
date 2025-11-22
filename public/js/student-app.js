// Student App - Main JavaScript
// AI Tutoring System for India

import { initTeacherDashboard } from './teacher-dashboard.js';

// Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : '/api';

// State management
const appState = {
    currentUser: null,
    currentRole: null,
    currentSubject: 'literacy',
    currentLanguage: 'en',
    conversationHistory: [],
    isLoading: false,
    isRecording: false,
    currentQuiz: null, // Track active quiz session
};

// Language translations
const translations = {
    en: {
        askAnything: 'Ask me anything...',
        send: 'Send',
        welcome: 'Welcome! How can I help you today?',
        listening: 'Listening...',
        error: 'Sorry, something went wrong.',
    },
    hi: {
        askAnything: 'कुछ भी पूछें...',
        send: 'भेजें',
        welcome: 'स्वागत है! मैं आज आपकी कैसे मदद कर सकता हूं?',
        listening: 'सुन रहा हूँ...',
        error: 'क्षमा करें, कुछ गलत हो गया।',
    },
    ta: {
        askAnything: 'எதையும் கேளுங்கள்...',
        send: 'அனுப்பு',
        welcome: 'வரவேற்கிறோம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        listening: 'கேட்கிறது...',
        error: 'மன்னிக்கவும், ஏதோ தவறு நடந்துவிட்டது.',
    },
};

// DOM Elements
const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    app: document.getElementById('app'),
    welcomeScreen: document.getElementById('welcome-screen'),
    studentScreen: document.getElementById('student-screen'),
    teacherScreen: document.getElementById('teacher-screen'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendButton: document.getElementById('send-button'),
    voiceButton: document.getElementById('voice-button'),
    languageSelector: document.getElementById('language-selector'),
    languageModal: document.getElementById('language-modal'),
    subjectCards: document.querySelectorAll('.subject-card'),
    roleCards: document.querySelectorAll('.role-card'),
};

// Initialize app
function initializeApp() {
    console.log('🚀 Initializing AI Shiksha...');

    // Hide loading screen after 2 seconds
    setTimeout(() => {
        if (elements.loadingScreen) elements.loadingScreen.style.display = 'none';
        if (elements.app) elements.app.style.display = 'flex';
    }, 2000);

    // Set up event listeners
    setupEventListeners();

    // Check for saved user data
    loadUserData();

    // Add welcome message
    setTimeout(() => {
        addMessage('assistant', translations[appState.currentLanguage].welcome);

        // Suggest initial assessment if new user
        if (!localStorage.getItem('assessmentTaken')) {
            setTimeout(() => {
                addMessage('assistant', 'Would you like to take a quick quiz to check your learning level?');
                addActionButtons([
                    { text: 'Yes, start quiz', action: 'start_diagnostic' },
                    { text: 'No, maybe later', action: 'skip_diagnostic' }
                ]);
            }, 1000);
        }
    }, 2500);
}

// Setup event listeners
function setupEventListeners() {
    // Role selection
    if (elements.roleCards) {
        elements.roleCards.forEach(card => {
            card.addEventListener('click', () => {
                const role = card.dataset.role;
                selectRole(role);
            });
        });
    }

    // Subject selection
    if (elements.subjectCards) {
        elements.subjectCards.forEach(card => {
            card.addEventListener('click', () => {
                selectSubject(card.dataset.subject);
            });
        });
    }

    // Chat input
    if (elements.sendButton) elements.sendButton.addEventListener('click', () => sendMessage());
    if (elements.chatInput) {
        elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Voice input
    if (elements.voiceButton) elements.voiceButton.addEventListener('click', toggleVoiceInput);

    // Language selector
    if (elements.languageSelector) {
        elements.languageSelector.addEventListener('click', () => {
            elements.languageModal.classList.add('active');
        });
    }

    // Language options
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            changeLanguage(lang);
            elements.languageModal.classList.remove('active');
        });
    });

    // Close modal on outside click
    if (elements.languageModal) {
        elements.languageModal.addEventListener('click', (e) => {
            if (e.target === elements.languageModal) {
                elements.languageModal.classList.remove('active');
            }
        });
    }
}

// Role selection
function selectRole(role) {
    appState.currentRole = role;
    elements.welcomeScreen.classList.remove('active');
    if (role === 'student') {
        elements.studentScreen.classList.add('active');
    } else if (role === 'teacher') {
        elements.teacherScreen.classList.add('active');
        initTeacherDashboard();
    }
    localStorage.setItem('userRole', role);
}

// Subject selection
function selectSubject(subject) {
    appState.currentSubject = subject;
    elements.subjectCards.forEach(card => {
        card.classList.remove('active');
        if (card.dataset.subject === subject) {
            card.classList.add('active');
        }
    });

    const subjectNames = {
        literacy: 'Literacy',
        numeracy: 'Numeracy',
        assessment: 'Assessment',
    };

    addMessage('system', `Switched to ${subjectNames[subject]} mode`);

    // Suggest activities based on subject
    if (subject === 'literacy') {
        addActionButtons([
            { text: 'Practice Words', action: 'practice_words' },
            { text: 'Story Time', action: 'story_time' },
            { text: 'Writing Help', action: 'writing_help' }
        ]);
    } else if (subject === 'numeracy') {
        addActionButtons([
            { text: 'Math Quiz', action: 'math_quiz' },
            { text: 'Learn Concept', action: 'learn_math' },
            { text: 'Solve Problem', action: 'solve_problem' }
        ]);
    }
}

// Change language
function changeLanguage(lang) {
    appState.currentLanguage = lang;
    elements.chatInput.placeholder = translations[lang]?.askAnything || translations['en'].askAnything;
    const langText = document.querySelector(`[data-lang="${lang}"]`)?.textContent;
    if (langText && elements.languageSelector) {
        elements.languageSelector.querySelector('.text').textContent = langText;
    }
    localStorage.setItem('userLanguage', lang);
    addMessage('system', `Language changed to ${lang.toUpperCase()}`);
}

// Send message
async function sendMessage(text = null) {
    const message = text || elements.chatInput.value.trim();

    if (!message || appState.isLoading) return;

    // Add user message
    addMessage('user', message);
    elements.chatInput.value = '';

    // Show loading
    appState.isLoading = true;
    const loadingId = addMessage('assistant', '...', true);

    try {
        // Handle special commands
        if (message.toLowerCase().includes('quiz') || message.toLowerCase().includes('test')) {
            if (appState.currentSubject === 'numeracy') {
                await generateMathQuiz();
                removeMessage(loadingId);
                appState.isLoading = false;
                return;
            } else if (appState.currentSubject === 'literacy') {
                await generateLiteracyExercise();
                removeMessage(loadingId);
                appState.isLoading = false;
                return;
            }
        }

        // Determine endpoint
        let endpoint = '/chat';
        let requestBody = {
            query: message,
            studentId: getUserId(),
            language: appState.currentLanguage,
            level: 'intermediate',
            studentName: 'Student',
        };

        if (appState.currentSubject === 'literacy') {
            endpoint = '/literacy/teach';
            requestBody = {
                topic: message,
                studentLevel: 'intermediate',
                language: appState.currentLanguage,
            };
        } else if (appState.currentSubject === 'numeracy') {
            endpoint = '/numeracy/teach';
            requestBody = {
                topic: message,
                studentLevel: 'intermediate',
                language: appState.currentLanguage,
            };
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error('Failed to get response');

        const data = await response.json();
        removeMessage(loadingId);

        // Handle response
        const aiMessage = data.response || data.content || 'I apologize, but I couldn\'t process that request.';
        addMessage('assistant', aiMessage);

        // Speak response if voice was used
        if (appState.usedVoice) {
            speakText(aiMessage);
            appState.usedVoice = false;
        }

    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        addMessage('assistant', translations[appState.currentLanguage]?.error || 'Sorry, something went wrong.');
    } finally {
        appState.isLoading = false;
    }
}

// Generate Math Quiz
async function generateMathQuiz() {
    try {
        const response = await fetch(`${API_BASE_URL}/numeracy/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: 'general math',
                difficulty: 'medium',
                language: appState.currentLanguage
            }),
        });

        const data = await response.json();
        if (data.quiz) {
            addMessage('assistant', data.response);
            const questions = Array.isArray(data.quiz) ? data.quiz : [data.quiz];
            startQuizSession(questions);
        }
    } catch (error) {
        console.error('Quiz error:', error);
        addMessage('assistant', 'Failed to load quiz.');
    }
}

// Generate Literacy Exercise
async function generateLiteracyExercise() {
    try {
        const response = await fetch(`${API_BASE_URL}/literacy/exercise`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: 'vocabulary',
                type: 'mixed',
                language: appState.currentLanguage
            }),
        });

        const data = await response.json();
        if (data.exercise) {
            addMessage('assistant', data.response);
            const questions = Array.isArray(data.exercise) ? data.exercise : [data.exercise];
            startQuizSession(questions);
        }
    } catch (error) {
        console.error('Exercise error:', error);
        addMessage('assistant', 'Failed to load exercise.');
    }
}

// Start a multi-question quiz session
function startQuizSession(questions) {
    if (!questions || questions.length === 0) return;

    appState.currentQuiz = {
        questions: questions,
        currentIndex: 0,
        score: 0,
        total: questions.length
    };

    addMessage('assistant', `Starting quiz with ${questions.length} questions. Good luck!`);
    renderQuizQuestion(questions[0]);
}

// Render current quiz question
function renderQuizQuestion(data) {
    const quizDiv = document.createElement('div');
    quizDiv.className = 'quiz-container';

    // Progress indicator
    let progressHtml = '';
    if (appState.currentQuiz) {
        progressHtml = `<div class="quiz-progress">Question ${appState.currentQuiz.currentIndex + 1} of ${appState.currentQuiz.total}</div>`;
    }

    quizDiv.innerHTML = `
        ${progressHtml}
        <div class="quiz-question">${data.question}</div>
        <div class="quiz-options">
            ${data.options.map(opt => `<button class="quiz-option">${opt}</button>`).join('')}
        </div>
        <div class="quiz-feedback"></div>
        <div class="quiz-controls" style="display:none; margin-top: 10px;">
            <button class="next-btn action-btn">Next Question ➡️</button>
        </div>
    `;

    elements.chatMessages.appendChild(quizDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    const feedbackDiv = quizDiv.querySelector('.quiz-feedback');
    const controlsDiv = quizDiv.querySelector('.quiz-controls');
    const nextBtn = quizDiv.querySelector('.next-btn');

    // Add click handlers for options
    quizDiv.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return; // Prevent multiple clicks

            const selected = btn.textContent;
            const isCorrect = selected === data.correctAnswer;

            // Visual feedback
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
            if (!isCorrect) {
                // Highlight correct answer
                quizDiv.querySelectorAll('.quiz-option').forEach(opt => {
                    if (opt.textContent === data.correctAnswer) opt.classList.add('correct');
                });
            }

            // Text feedback
            feedbackDiv.innerHTML = isCorrect
                ? `<div class="feedback-success">✅ Correct! ${data.explanation || ''}</div>`
                : `<div class="feedback-error">❌ The correct answer is ${data.correctAnswer}. ${data.explanation || ''}</div>`;

            // Update score
            if (appState.currentQuiz && isCorrect) {
                appState.currentQuiz.score++;
                incrementStat('badgesEarned'); // Simple gamification
            }

            // Disable all buttons
            quizDiv.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);

            // Show Next button
            if (appState.currentQuiz) {
                controlsDiv.style.display = 'block';

                // Check if last question
                if (appState.currentQuiz.currentIndex >= appState.currentQuiz.total - 1) {
                    nextBtn.textContent = 'Finish Quiz 🏆';
                }
            }
        });
    });

    // Handle Next Button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!appState.currentQuiz) return;

            appState.currentQuiz.currentIndex++;

            if (appState.currentQuiz.currentIndex < appState.currentQuiz.total) {
                // Next question
                renderQuizQuestion(appState.currentQuiz.questions[appState.currentQuiz.currentIndex]);
            } else {
                // Quiz finished
                const percentage = Math.round((appState.currentQuiz.score / appState.currentQuiz.total) * 100);
                let message = `Quiz Complete! You got ${appState.currentQuiz.score} out of ${appState.currentQuiz.total} (${percentage}%).`;

                if (percentage >= 80) message += " Excellent work! 🌟";
                else if (percentage >= 50) message += " Good job! Keep practicing. 👍";
                else message += " Don't give up! Try again to improve. 💪";

                addMessage('assistant', message);

                // Reset quiz state
                appState.currentQuiz = null;
                incrementStat('lessonsCompleted');
                updateProgressStats();
            }
        });
    }
}

// Add action buttons
function addActionButtons(actions) {
    const container = document.createElement('div');
    container.className = 'action-buttons';

    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = action.text;
        btn.onclick = () => handleAction(action.action);
        container.appendChild(btn);
    });

    elements.chatMessages.appendChild(container);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Handle actions
function handleAction(action) {
    switch (action) {
        case 'start_diagnostic':
            addMessage('user', 'Start diagnostic test');
            generateDiagnosticAssessment();
            break;
        case 'math_quiz':
            addMessage('user', 'Give me a math quiz');
            generateMathQuiz();
            break;
        case 'practice_words':
            addMessage('user', 'Practice vocabulary');
            generateLiteracyExercise();
            break;
        // Add other cases...
        default:
            sendMessage(action.replace('_', ' '));
    }
}

// Generate Diagnostic Assessment
async function generateDiagnosticAssessment() {
    try {
        const loadingId = addMessage('assistant', 'Generating your personalized assessment...', true);

        const response = await fetch(`${API_BASE_URL}/assessment/diagnostic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentLevel: 'unknown',
                language: appState.currentLanguage
            }),
        });

        removeMessage(loadingId);
        const data = await response.json();

        if (data.assessment && data.assessment.questions && data.assessment.questions.length > 0) {
            addMessage('assistant', data.response);
            startQuizSession(data.assessment.questions);
            localStorage.setItem('assessmentTaken', 'true');
        } else {
            addMessage('assistant', 'Could not generate assessment questions. Please try again.');
        }
    } catch (error) {
        console.error('Diagnostic error:', error);
        addMessage('assistant', 'Failed to load assessment.');
    }
}

// Add message to chat
function addMessage(role, content, isLoading = false) {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.id = messageId;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = role === 'user' ? '👤' : '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (isLoading) {
        contentDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    } else {
        // Use marked to parse markdown if available, otherwise plain text
        if (typeof marked !== 'undefined') {
            contentDiv.innerHTML = marked.parse(content);
        } else {
            contentDiv.textContent = content;
        }
    }

    if (role !== 'system') {
        messageDiv.appendChild(avatarDiv);
    }
    messageDiv.appendChild(contentDiv);

    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    return messageId;
}

// Remove message
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

// Voice input toggle
function toggleVoiceInput() {
    if (appState.isRecording) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

// Start voice input
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = getLanguageCode(appState.currentLanguage);
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        appState.isRecording = true;
        elements.voiceButton.classList.add('recording');
        elements.chatInput.placeholder = translations[appState.currentLanguage]?.listening || 'Listening...';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.chatInput.value = transcript;
        appState.usedVoice = true;
        sendMessage(); // Auto-send
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();
        addMessage('system', 'Could not hear you. Please try again.');
    };

    recognition.onend = () => {
        stopVoiceInput();
    };

    recognition.start();
    appState.recognition = recognition;
}

// Stop voice input
function stopVoiceInput() {
    appState.isRecording = false;
    elements.voiceButton.classList.remove('recording');
    elements.chatInput.placeholder = translations[appState.currentLanguage]?.askAnything || 'Ask me anything...';
    if (appState.recognition) {
        appState.recognition.stop();
    }
}

// Text to Speech
function speakText(text) {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(appState.currentLanguage);
    window.speechSynthesis.speak(utterance);
}

// Get language code
function getLanguageCode(lang) {
    const codes = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
    };
    return codes[lang] || 'en-IN';
}

// Get or create user ID
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Load user data
function loadUserData() {
    const savedRole = localStorage.getItem('userRole');
    const savedLanguage = localStorage.getItem('userLanguage');

    if (savedLanguage) {
        appState.currentLanguage = savedLanguage;
        changeLanguage(savedLanguage);
    }
    updateProgressStats();
}

// Update stats
function updateProgressStats() {
    const lessons = localStorage.getItem('lessonsCompleted') || '0';
    const streak = localStorage.getItem('streakDays') || '0';
    const badges = localStorage.getItem('badgesEarned') || '0';

    if (document.getElementById('lessons-completed'))
        document.getElementById('lessons-completed').textContent = lessons;
    if (document.getElementById('streak-days'))
        document.getElementById('streak-days').textContent = streak;
    if (document.getElementById('badges-earned'))
        document.getElementById('badges-earned').textContent = badges;

    // Update achievements list
    const list = document.getElementById('achievement-list');
    if (list) {
        list.innerHTML = '';
        const badgeCount = parseInt(badges);
        if (badgeCount > 0) {
            // Add a generic badge for every 5 points or just show the count visually
            const badgeItem = document.createElement('div');
            badgeItem.className = 'achievement-item';
            badgeItem.innerHTML = `
                <span class="achievement-icon">🌟</span>
                <div class="achievement-info">
                    <span class="achievement-title">Rising Star</span>
                    <span class="achievement-desc">Earned ${badgeCount} points</span>
                </div>
            `;
            list.appendChild(badgeItem);
        } else {
            list.innerHTML = '<div class="empty-state">No badges yet. Keep learning!</div>';
        }
    }
}

// Increment stat
function incrementStat(key) {
    const current = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, current + 1);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

export { appState };
