/**
 * Voice Learning Module
 * Implements voice input, text-to-speech, and voice-based interactions
 * Supports multiple Indian languages
 */

/**
 * Voice recognition configuration for Indian languages
 */
const VOICE_CONFIG = {
    en: { lang: 'en-IN', voice: 'Google हिन्दी' },
    hi: { lang: 'hi-IN', voice: 'Google हिन्दी' },
    ta: { lang: 'ta-IN', voice: 'Google தமிழ்' },
    te: { lang: 'te-IN', voice: 'Google తెలుగు' },
    mr: { lang: 'mr-IN', voice: 'Google मराठी' },
    bn: { lang: 'bn-IN', voice: 'Google বাংলা' },
};

/**
 * Voice Learning Class
 */
export class VoiceLearning {
    constructor(language = 'en') {
        this.language = language;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.voices = [];

        this.initializeVoiceRecognition();
        this.loadVoices();
    }

    /**
     * Initialize speech recognition
     */
    initializeVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = VOICE_CONFIG[this.language]?.lang || 'en-IN';
    }

    /**
     * Load available voices
     */
    loadVoices() {
        this.voices = this.synthesis.getVoices();

        // Reload voices when they change (some browsers load async)
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => {
                this.voices = this.synthesis.getVoices();
            };
        }
    }

    /**
     * Start listening for voice input
     * @param {Function} onResult - Callback for results
     * @param {Function} onError - Callback for errors
     * @returns {Promise} - Promise that resolves when listening starts
     */
    startListening(onResult, onError) {
        return new Promise((resolve, reject) => {
            if (!this.recognition) {
                reject(new Error('Speech recognition not available'));
                return;
            }

            this.recognition.onstart = () => {
                this.isListening = true;
                resolve();
            };

            this.recognition.onresult = (event) => {
                const results = Array.from(event.results);
                const transcript = results
                    .map(result => result[0].transcript)
                    .join('');

                const isFinal = results[results.length - 1].isFinal;

                onResult({
                    transcript,
                    isFinal,
                    confidence: results[results.length - 1][0].confidence,
                });
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                onError(event.error);
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };

            try {
                this.recognition.start();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Stop listening
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    /**
     * Speak text using text-to-speech
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options
     * @returns {Promise} - Promise that resolves when speech completes
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech synthesis not available'));
                return;
            }

            // Cancel any ongoing speech
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Set language
            utterance.lang = VOICE_CONFIG[this.language]?.lang || 'en-IN';

            // Find appropriate voice
            const preferredVoice = this.voices.find(voice =>
                voice.lang === utterance.lang ||
                voice.name.includes(VOICE_CONFIG[this.language]?.voice)
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            // Set options
            utterance.rate = options.rate || 0.9; // Slightly slower for clarity
            utterance.pitch = options.pitch || 1;
            utterance.volume = options.volume || 1;

            utterance.onend = () => resolve();
            utterance.onerror = (event) => reject(event);

            this.synthesis.speak(utterance);
        });
    }

    /**
     * Pause speech
     */
    pause() {
        if (this.synthesis) {
            this.synthesis.pause();
        }
    }

    /**
     * Resume speech
     */
    resume() {
        if (this.synthesis) {
            this.synthesis.resume();
        }
    }

    /**
     * Stop speech
     */
    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    /**
     * Change language
     * @param {string} newLanguage - New language code
     */
    setLanguage(newLanguage) {
        this.language = newLanguage;
        if (this.recognition) {
            this.recognition.lang = VOICE_CONFIG[newLanguage]?.lang || 'en-IN';
        }
    }

    /**
     * Check if voice features are supported
     * @returns {Object} - Support status
     */
    static checkSupport() {
        return {
            recognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
            synthesis: !!window.speechSynthesis,
            fullSupport: !!(window.SpeechRecognition || window.webkitSpeechRecognition) && !!window.speechSynthesis,
        };
    }

    /**
     * Get supported languages
     * @returns {Array} - Array of supported language codes
     */
    static getSupportedLanguages() {
        return Object.keys(VOICE_CONFIG);
    }
}

/**
 * Voice-based assessment helper
 * Allows students to answer questions verbally
 */
export class VoiceAssessment {
    constructor(voiceLearning) {
        this.voiceLearning = voiceLearning;
    }

    /**
     * Conduct voice-based question
     * @param {string} question - Question to ask
     * @param {Object} options - Assessment options
     * @returns {Promise<Object>} - Student's answer
     */
    async askQuestion(question, options = {}) {
        // Speak the question
        await this.voiceLearning.speak(question, { rate: 0.8 });

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Listen for answer
        return new Promise((resolve, reject) => {
            let finalTranscript = '';

            this.voiceLearning.startListening(
                (result) => {
                    if (result.isFinal) {
                        finalTranscript = result.transcript;
                        this.voiceLearning.stopListening();
                        resolve({
                            answer: finalTranscript,
                            confidence: result.confidence,
                        });
                    }
                },
                (error) => {
                    reject(error);
                }
            );

            // Timeout after 30 seconds
            setTimeout(() => {
                this.voiceLearning.stopListening();
                if (finalTranscript) {
                    resolve({ answer: finalTranscript, confidence: 0.5 });
                } else {
                    reject(new Error('No answer received'));
                }
            }, 30000);
        });
    }

    /**
     * Provide voice feedback
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {string} explanation - Explanation text
     */
    async provideFeedback(isCorrect, explanation) {
        const feedback = isCorrect
            ? '🎉 Excellent! That\'s correct! ' + explanation
            : '🤔 Not quite. Let me explain: ' + explanation;

        await this.voiceLearning.speak(feedback);
    }
}

/**
 * Voice navigation helper
 * Allows students to navigate the app using voice commands
 */
export class VoiceNavigation {
    constructor(voiceLearning) {
        this.voiceLearning = voiceLearning;
        this.commands = {
            en: {
                'go to literacy': () => this.navigateTo('literacy'),
                'go to math': () => this.navigateTo('numeracy'),
                'go to numeracy': () => this.navigateTo('numeracy'),
                'take a test': () => this.navigateTo('assessment'),
                'show my progress': () => this.navigateTo('progress'),
                'help': () => this.showHelp(),
                'repeat': () => this.repeatLast(),
            },
            hi: {
                'साक्षरता पर जाओ': () => this.navigateTo('literacy'),
                'गणित पर जाओ': () => this.navigateTo('numeracy'),
                'परीक्षा लो': () => this.navigateTo('assessment'),
                'मेरी प्रगति दिखाओ': () => this.navigateTo('progress'),
                'मदद': () => this.showHelp(),
                'दोहराओ': () => this.repeatLast(),
            },
        };
    }

    /**
     * Start listening for voice commands
     */
    startCommandListening() {
        this.voiceLearning.startListening(
            (result) => {
                if (result.isFinal) {
                    this.processCommand(result.transcript.toLowerCase());
                }
            },
            (error) => {
                console.error('Voice command error:', error);
            }
        );
    }

    /**
     * Process voice command
     * @param {string} command - Voice command
     */
    processCommand(command) {
        const langCommands = this.commands[this.voiceLearning.language] || this.commands.en;

        for (const [trigger, action] of Object.entries(langCommands)) {
            if (command.includes(trigger)) {
                action();
                return;
            }
        }

        // Command not recognized
        this.voiceLearning.speak('Sorry, I didn\'t understand that command. Say "help" for available commands.');
    }

    /**
     * Navigate to section
     * @param {string} section - Section to navigate to
     */
    navigateTo(section) {
        // Trigger navigation event
        window.dispatchEvent(new CustomEvent('voice-navigate', { detail: { section } }));
        this.voiceLearning.speak(`Navigating to ${section}`);
    }

    /**
     * Show help
     */
    showHelp() {
        const helpText = 'You can say: Go to literacy, Go to math, Take a test, or Show my progress';
        this.voiceLearning.speak(helpText);
    }

    /**
     * Repeat last message
     */
    repeatLast() {
        // This would repeat the last spoken message
        this.voiceLearning.speak('Repeating last message');
    }
}

/**
 * Voice pronunciation helper
 * Helps students learn correct pronunciation
 */
export class PronunciationHelper {
    constructor(voiceLearning) {
        this.voiceLearning = voiceLearning;
    }

    /**
     * Teach pronunciation of a word
     * @param {string} word - Word to teach
     * @param {Object} options - Teaching options
     */
    async teachWord(word, options = {}) {
        // Speak the word slowly
        await this.voiceLearning.speak(word, { rate: 0.6 });

        await new Promise(resolve => setTimeout(resolve, 500));

        // Speak at normal speed
        await this.voiceLearning.speak(word, { rate: 0.9 });

        if (options.practice) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.voiceLearning.speak('Now you try!');

            // Listen to student's pronunciation
            return this.assessPronunciation(word);
        }
    }

    /**
     * Assess student's pronunciation
     * @param {string} targetWord - Expected word
     * @returns {Promise<Object>} - Assessment result
     */
    async assessPronunciation(targetWord) {
        return new Promise((resolve, reject) => {
            this.voiceLearning.startListening(
                (result) => {
                    if (result.isFinal) {
                        const similarity = this.calculateSimilarity(
                            targetWord.toLowerCase(),
                            result.transcript.toLowerCase()
                        );

                        resolve({
                            spoken: result.transcript,
                            target: targetWord,
                            similarity,
                            feedback: this.getPronunciationFeedback(similarity),
                        });
                    }
                },
                reject
            );
        });
    }

    /**
     * Calculate similarity between words
     * @param {string} word1 - First word
     * @param {string} word2 - Second word
     * @returns {number} - Similarity score (0-1)
     */
    calculateSimilarity(word1, word2) {
        // Simple Levenshtein distance-based similarity
        const longer = word1.length > word2.length ? word1 : word2;
        const shorter = word1.length > word2.length ? word2 : word1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Get pronunciation feedback
     * @param {number} similarity - Similarity score
     * @returns {string} - Feedback message
     */
    getPronunciationFeedback(similarity) {
        if (similarity >= 0.9) return 'Perfect! Excellent pronunciation! 🎉';
        if (similarity >= 0.7) return 'Very good! Almost perfect! 👍';
        if (similarity >= 0.5) return 'Good try! Let\'s practice again. 💪';
        return 'Keep practicing! You\'ll get it! 🌟';
    }
}

export default {
    VoiceLearning,
    VoiceAssessment,
    VoiceNavigation,
    PronunciationHelper,
};
