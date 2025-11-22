/**
 * Multilingual Support Utilities
 * Handles translation, localization, and language-specific features
 */

import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI for translations
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_REGION || 'asia-south1',
});

/**
 * Supported languages configuration
 */
export const SUPPORTED_LANGUAGES = {
    en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        fontFamily: 'Inter, sans-serif',
        voiceCode: 'en-IN',
    },
    hi: {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिंदी',
        direction: 'ltr',
        fontFamily: 'Noto Sans Devanagari, sans-serif',
        voiceCode: 'hi-IN',
    },
    ta: {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்',
        direction: 'ltr',
        fontFamily: 'Noto Sans Tamil, sans-serif',
        voiceCode: 'ta-IN',
    },
    te: {
        code: 'te',
        name: 'Telugu',
        nativeName: 'తెలుగు',
        direction: 'ltr',
        fontFamily: 'Noto Sans Telugu, sans-serif',
        voiceCode: 'te-IN',
    },
    mr: {
        code: 'mr',
        name: 'Marathi',
        nativeName: 'मराठी',
        direction: 'ltr',
        fontFamily: 'Noto Sans Devanagari, sans-serif',
        voiceCode: 'mr-IN',
    },
    bn: {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা',
        direction: 'ltr',
        fontFamily: 'Noto Sans Bengali, sans-serif',
        voiceCode: 'bn-IN',
    },
};

/**
 * Common educational terminology in multiple languages
 */
export const EDUCATIONAL_TERMS = {
    // Literacy terms
    vowel: {
        en: 'vowel',
        hi: 'स्वर',
        ta: 'உயிரெழுத்து',
        te: 'అచ్చు',
        mr: 'स्वर',
        bn: 'স্বরবর্ণ',
    },
    consonant: {
        en: 'consonant',
        hi: 'व्यंजन',
        ta: 'மெய்யெழுத்து',
        te: 'హల్లు',
        mr: 'व्यंजन',
        bn: 'ব্যঞ্জনবর্ণ',
    },
    sentence: {
        en: 'sentence',
        hi: 'वाक्य',
        ta: 'வாக்கியம்',
        te: 'వాక్యం',
        mr: 'वाक्य',
        bn: 'বাক্য',
    },

    // Numeracy terms
    addition: {
        en: 'addition',
        hi: 'जोड़',
        ta: 'கூட்டல்',
        te: 'కూడిక',
        mr: 'बेरीज',
        bn: 'যোগ',
    },
    subtraction: {
        en: 'subtraction',
        hi: 'घटाव',
        ta: 'கழித்தல்',
        te: 'తీసివేత',
        mr: 'वजाबाकी',
        bn: 'বিয়োগ',
    },
    multiplication: {
        en: 'multiplication',
        hi: 'गुणा',
        ta: 'பெருக்கல்',
        te: 'గుణకారం',
        mr: 'गुणाकार',
        bn: 'গুণ',
    },
    division: {
        en: 'division',
        hi: 'भाग',
        ta: 'வகுத்தல்',
        te: 'భాగహారం',
        mr: 'भागाकार',
        bn: 'ভাগ',
    },

    // General terms
    lesson: {
        en: 'lesson',
        hi: 'पाठ',
        ta: 'பாடம்',
        te: 'పాఠం',
        mr: 'धडा',
        bn: 'পাঠ',
    },
    practice: {
        en: 'practice',
        hi: 'अभ्यास',
        ta: 'பயிற்சி',
        te: 'అభ్యాసం',
        mr: 'सराव',
        bn: 'অনুশীলন',
    },
    test: {
        en: 'test',
        hi: 'परीक्षा',
        ta: 'தேர்வு',
        te: 'పరీక్ష',
        mr: 'परीक्षा',
        bn: 'পরীক্ষা',
    },
};

/**
 * UI translations for common interface elements
 */
export const UI_TRANSLATIONS = {
    welcome: {
        en: 'Welcome',
        hi: 'स्वागत है',
        ta: 'வரவேற்கிறோம்',
        te: 'స్వాగతం',
        mr: 'स्वागत आहे',
        bn: 'স্বাগতম',
    },
    askAnything: {
        en: 'Ask me anything...',
        hi: 'कुछ भी पूछें...',
        ta: 'எதையும் கேளுங்கள்...',
        te: 'ఏదైనా అడగండి...',
        mr: 'काहीही विचारा...',
        bn: 'যেকোনো কিছু জিজ্ঞাসা করুন...',
    },
    send: {
        en: 'Send',
        hi: 'भेजें',
        ta: 'அனுப்பு',
        te: 'పంపు',
        mr: 'पाठवा',
        bn: 'পাঠান',
    },
    loading: {
        en: 'Loading...',
        hi: 'लोड हो रहा है...',
        ta: 'ஏற்றுகிறது...',
        te: 'లోడ్ అవుతోంది...',
        mr: 'लोड होत आहे...',
        bn: 'লোড হচ্ছে...',
    },
    excellent: {
        en: 'Excellent!',
        hi: 'बहुत बढ़िया!',
        ta: 'அருமை!',
        te: 'అద్భుతం!',
        mr: 'उत्तम!',
        bn: 'চমৎকার!',
    },
    goodTry: {
        en: 'Good try!',
        hi: 'अच्छी कोशिश!',
        ta: 'நல்ல முயற்சி!',
        te: 'మంచి ప్రయత్నం!',
        mr: 'चांगला प्रयत्न!',
        bn: 'ভালো চেষ্টা!',
    },
};

/**
 * Translate text using Gemini AI for context-aware translation
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} context - Context for better translation
 * @returns {Promise<string>} - Translated text
 */
export async function translateWithContext(text, targetLang, context = 'educational') {
    if (targetLang === 'en') return text;

    try {
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
        });

        const prompt = `Translate the following ${context} text to ${SUPPORTED_LANGUAGES[targetLang].nativeName} (${targetLang}):

Text: "${text}"

Requirements:
- Maintain educational tone
- Use age-appropriate language for school students
- Preserve any technical terms appropriately
- Keep formatting and structure
- Be culturally appropriate for Indian context

Provide only the translation, no explanations.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Fallback to original text
    }
}

/**
 * Get educational term in specific language
 * @param {string} term - Term key
 * @param {string} lang - Language code
 * @returns {string} - Translated term
 */
export function getEducationalTerm(term, lang = 'en') {
    return EDUCATIONAL_TERMS[term]?.[lang] || term;
}

/**
 * Get UI translation
 * @param {string} key - UI element key
 * @param {string} lang - Language code
 * @returns {string} - Translated UI text
 */
export function getUITranslation(key, lang = 'en') {
    return UI_TRANSLATIONS[key]?.[lang] || UI_TRANSLATIONS[key]?.en || key;
}

/**
 * Detect language from text (simple heuristic)
 * @param {string} text - Input text
 * @returns {string} - Detected language code
 */
export function detectLanguage(text) {
    // Simple Unicode range detection
    const devanagariRange = /[\u0900-\u097F]/;
    const tamilRange = /[\u0B80-\u0BFF]/;
    const teluguRange = /[\u0C00-\u0C7F]/;
    const bengaliRange = /[\u0980-\u09FF]/;

    if (devanagariRange.test(text)) {
        // Could be Hindi or Marathi - default to Hindi
        return 'hi';
    }
    if (tamilRange.test(text)) return 'ta';
    if (teluguRange.test(text)) return 'te';
    if (bengaliRange.test(text)) return 'bn';

    return 'en'; // Default to English
}

/**
 * Handle code-mixing (common in Indian classrooms)
 * Identifies mixed language content and provides appropriate response
 * @param {string} text - Mixed language text
 * @returns {Object} - Analysis of language mix
 */
export function analyzeCodeMixing(text) {
    const languages = [];

    if (/[a-zA-Z]/.test(text)) languages.push('en');
    if (/[\u0900-\u097F]/.test(text)) languages.push('hi');
    if (/[\u0B80-\u0BFF]/.test(text)) languages.push('ta');
    if (/[\u0C00-\u0C7F]/.test(text)) languages.push('te');
    if (/[\u0980-\u09FF]/.test(text)) languages.push('bn');

    return {
        isCodeMixed: languages.length > 1,
        languages,
        primaryLanguage: languages[0] || 'en',
        suggestion: languages.length > 1
            ? 'Code-mixing detected. Will respond in mixed format.'
            : 'Single language detected.',
    };
}

/**
 * Format numbers according to Indian numbering system
 * @param {number} num - Number to format
 * @param {string} lang - Language code
 * @returns {string} - Formatted number
 */
export function formatIndianNumber(num, lang = 'en') {
    // Indian numbering system: 1,00,000 instead of 100,000
    const numStr = num.toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);

    const formatted = otherNumbers !== ''
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;

    // For Hindi, use Devanagari numerals
    if (lang === 'hi' || lang === 'mr') {
        const devanagariNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return formatted.split('').map(char => {
            const digit = parseInt(char);
            return isNaN(digit) ? char : devanagariNumerals[digit];
        }).join('');
    }

    return formatted;
}

/**
 * Get culturally appropriate examples for a concept
 * @param {string} concept - Math/literacy concept
 * @param {string} lang - Language code
 * @returns {Array} - Array of culturally relevant examples
 */
export function getCulturalExamples(concept, lang = 'en') {
    const examples = {
        addition: {
            en: [
                'If you have 5 mangoes and your friend gives you 3 more, how many do you have?',
                'A cricket team scores 25 runs in the first over and 15 in the second. Total runs?',
                'You have ₹50 and earn ₹30 more. How much money do you have now?',
            ],
            hi: [
                'अगर आपके पास 5 आम हैं और आपका दोस्त आपको 3 और देता है, तो कुल कितने हैं?',
                'एक क्रिकेट टीम पहले ओवर में 25 रन बनाती है और दूसरे में 15। कुल रन?',
                'आपके पास ₹50 हैं और आप ₹30 और कमाते हैं। अब कुल कितने पैसे हैं?',
            ],
        },
        vowels: {
            en: [
                'The word "India" has 3 vowels: I, i, a',
                'In "mango", the vowels are: a, o',
                'Find the vowels in "education": e, u, a, i, o',
            ],
            hi: [
                '"भारत" में स्वर हैं: आ, अ',
                '"आम" में स्वर हैं: आ, अ',
                '"शिक्षा" में स्वर खोजें: इ, आ',
            ],
        },
    };

    return examples[concept]?.[lang] || examples[concept]?.en || [];
}

/**
 * Convert text to speech-friendly format for Indian languages
 * @param {string} text - Text to convert
 * @param {string} lang - Language code
 * @returns {string} - Speech-friendly text
 */
export function toSpeechFriendly(text, lang) {
    // Remove special characters that might confuse TTS
    let speechText = text.replace(/[*_~`]/g, '');

    // Expand common abbreviations
    const abbreviations = {
        en: {
            'Dr.': 'Doctor',
            'Mr.': 'Mister',
            'Mrs.': 'Misses',
            'Rs.': 'Rupees',
            '₹': 'Rupees',
        },
        hi: {
            '₹': 'रुपये',
        },
    };

    const langAbbr = abbreviations[lang] || {};
    for (const [abbr, full] of Object.entries(langAbbr)) {
        speechText = speechText.replace(new RegExp(abbr, 'g'), full);
    }

    return speechText;
}

/**
 * Get language-specific font family
 * @param {string} lang - Language code
 * @returns {string} - CSS font-family value
 */
export function getLanguageFont(lang) {
    return SUPPORTED_LANGUAGES[lang]?.fontFamily || 'Inter, sans-serif';
}

/**
 * Check if language is RTL (Right-to-Left)
 * @param {string} lang - Language code
 * @returns {boolean} - True if RTL
 */
export function isRTL(lang) {
    return SUPPORTED_LANGUAGES[lang]?.direction === 'rtl';
}

export default {
    SUPPORTED_LANGUAGES,
    EDUCATIONAL_TERMS,
    UI_TRANSLATIONS,
    translateWithContext,
    getEducationalTerm,
    getUITranslation,
    detectLanguage,
    analyzeCodeMixing,
    formatIndianNumber,
    getCulturalExamples,
    toSpeechFriendly,
    getLanguageFont,
    isRTL,
};
