/**
 * Language & Conversational Style Detector
 * Identifies script, language, formality, and cadence from user message
 * so Guruji mirrors the user naturally without algorithmic imitation.
 */

// Devanagari Unicode range: \u0900-\u097F
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
// Other Indian scripts
const BENGALI_REGEX = /[\u0980-\u09FF]/;
const GUJARATI_REGEX = /[\u0A80-\u0AFF]/;
const GURMUKHI_PUNJABI_REGEX = /[\u0A00-\u0A7F]/;
const TAMIL_REGEX = /[\u0B80-\u0BFF]/;
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;
const KANNADA_REGEX = /[\u0C80-\u0CFF]/;
const MALAYALAM_REGEX = /[\u0D00-\u0D7F]/;

// Common Hinglish markers (Roman script Hindi vocabulary & conversational fillers)
const HINGLISH_PATTERNS = [
  /\b(kya|kyun|kyu|kaise|kab|kahan|kaha|kis|kisko|kiske|kuch|kuchh|mera|meri|mere|mujhe|mujhko|hum|humko|tum|tumhara|tumhari|aap|aapka|aapki|hoga|hogi|honge|hai|hain|tha|thi|the|nahi|nhi|raha|rahi|rahe|karo|karna|karu|batao|bataiye|samajh|dekho|dekh|baat|scene|yaar|bhai|bhaiya|guru|guruji|chahiye|lag|lagta|lagti|achha|accha|theek|thik|zyada|jyada|paisa|shaadi|shadi|naukri)\b/i,
  /\b(job ka|career ka|paisa kab|shadi kab|kundli me|kundali mein|dasha chal|graha|rashi)\b/i,
];

// Casual / slang markers
const CASUAL_SLANG_PATTERNS = [
  /\b(bhai|bro|yaar|scene|tension|stress|plz|pls|pls tell|btao|batao na|kya scene hai|kuch batao|kaisa rahega)\b/i,
];

// Respectful / formal markers
const RESPECTFUL_PATTERNS = [
  /\b(kripya|kripya karke|batayein|bataiye|kahiye|namaste|pranam|charan sparsh|aashirwad|dhanyawad|shukriya|please guide|kindly explain|would like to understand)\b/i,
];

export function detectLanguageAndStyle(userMessage = '') {
  const text = String(userMessage || '').trim();
  if (!text) {
    return {
      language: 'english',
      script: 'latin',
      formality: 'standard',
      style: 'conversational',
      promptInstruction: 'Respond in clear, warm, conversational English.',
    };
  }

  // 1. Script checks
  if (DEVANAGARI_REGEX.test(text)) {
    // Check if Marathi specific markers exist (e.g. आहे, काय, बद्दल, सांग, कधी)
    if (/\b(काय|आहे|नाही|कधी|बद्दल|सांगा|होईल|माझ्या|माझे|कसे)\b/.test(text)) {
      return {
        language: 'marathi',
        script: 'devanagari',
        formality: 'respectful',
        style: 'conversational',
        promptInstruction: 'The user spoke in Marathi (Devanagari). Respond in natural, warm, culturally grounded Marathi. Do NOT switch to Hindi or English unless quoting a specific Sanskrit term.',
      };
    }

    const isRespectful = RESPECTFUL_PATTERNS.some(p => p.test(text)) || /बताइए|कृपया|प्रणाम|नमस्ते/.test(text);
    return {
      language: 'hi',
      langCode: 'hi',
      script: 'devanagari',
      formality: isRespectful ? 'respectful' : 'standard',
      style: isRespectful ? 'respectful' : 'conversational',
      promptInstruction: `The user addressed you in Hindi (Devanagari script). Respond in natural, respectful Hindi (Devanagari script) with a warm, grounded Guruji tone. Do not switch to English.`,
    };
  }

  if (GUJARATI_REGEX.test(text)) {
    return {
      language: 'gu',
      langCode: 'gu',
      script: 'gujarati',
      formality: 'respectful',
      style: 'conversational',
      promptInstruction: 'The user spoke in Gujarati. Respond in natural, respectful Gujarati in Gujarati script.',
    };
  }

  if (BENGALI_REGEX.test(text)) {
    return {
      language: 'bn',
      langCode: 'bn',
      script: 'bengali',
      formality: 'respectful',
      style: 'conversational',
      promptInstruction: 'The user spoke in Bengali. Respond in natural, respectful Bengali in Bengali script.',
    };
  }

  if (GURMUKHI_PUNJABI_REGEX.test(text)) {
    return {
      language: 'pa',
      langCode: 'pa',
      script: 'gurmukhi',
      formality: 'respectful',
      style: 'conversational',
      promptInstruction: 'The user spoke in Punjabi. Respond in natural, respectful Punjabi in Gurmukhi script.',
    };
  }

  if (TAMIL_REGEX.test(text) || TELUGU_REGEX.test(text) || KANNADA_REGEX.test(text) || MALAYALAM_REGEX.test(text)) {
    return {
      language: 'dravidian',
      script: 'indic',
      formality: 'respectful',
      style: 'conversational',
      promptInstruction: 'The user wrote in a South Indian Dravidian script. Respond in the exact same language and script naturally and respectfully.',
    };
  }

  // 2. Latin script: Distinguish Hinglish vs English
  const isHinglish = HINGLISH_PATTERNS.some(p => p.test(text));
  const isCasual = CASUAL_SLANG_PATTERNS.some(p => p.test(text));
  const isRespectful = RESPECTFUL_PATTERNS.some(p => p.test(text));

  if (isHinglish) {
    if (isCasual) {
      return {
        language: 'hinglish',
        langCode: 'hinglish',
        script: 'latin',
        formality: 'casual',
        style: 'casual',
        promptInstruction: `The user asked casually in Hinglish (Roman script Hindi, e.g. "bhai meri job ka scene kab tak clear hoga?").
Respond in natural, conversational Hinglish (Hindi written in Latin/English alphabet). Speak like a warm, experienced elder/Guruji who understands their situation directly. Do not lecture them, do not force pure Devanagari Hindi, and do not sound robotic. Be honest, direct, and reassuring.`,
      };
    }
    return {
      language: 'hinglish',
      langCode: 'hinglish',
      script: 'latin',
      formality: isRespectful ? 'respectful' : 'conversational',
      style: isRespectful ? 'respectful' : 'conversational',
      promptInstruction: `The user asked in Hinglish (Hindi written in Latin alphabet, e.g. "meri career ki situation kab tak better hogi?").
Respond in natural, warm, conversational Hinglish. Do not translate into formal English or Devanagari script. Keep the voice grounded and personal.`,
    };
  }

  // 3. English: Formal vs Casual
  if (isCasual) {
    return {
      language: 'english',
      script: 'latin',
      formality: 'casual',
      style: 'conversational',
      promptInstruction: `The user spoke in conversational/casual English.
Respond in natural, warm, direct English. Avoid stiff academic phrasing or robotic formatting. Speak personally as a wise mentor who has studied their chart.`,
    };
  }

  if (isRespectful) {
    return {
      language: 'english',
      script: 'latin',
      formality: 'respectful',
      style: 'reflective',
      promptInstruction: `The user spoke in polite/thoughtful English.
Respond in measured, insightful, warm English with depth and clarity. Answer directly first.`,
    };
  }

  return {
    language: 'english',
    script: 'latin',
    formality: 'standard',
    style: 'conversational',
    promptInstruction: `The user asked in English. Respond in clear, warm, conversational English with a grounded Guruji tone. Answer directly first without introductory filler.`,
  };
}

export default detectLanguageAndStyle;
