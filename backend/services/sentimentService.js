const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use a sequence of models to handle availability issues
const MODEL_CANDIDATES = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.5-pro"];
let currentModelIndex = 0;
let model = genAI.getGenerativeModel({ model: MODEL_CANDIDATES[currentModelIndex] });

async function analyzeReviews(reviewsText) {
    if (!reviewsText || reviewsText.length < 50) {
        return {
            positive: 50,
            negative: 50,
            summary: "Not enough reviews found to analyze sentiment reliably.",
            review_count: 0
        };
    }

    const prompt = `
    Analyze the sentiment of the following product reviews to help a buyer make a decision.
    Return a JSON object with:
    - positive: number (percentage 0-100)
    - negative: number (percentage 0-100)
    - summary: string (Concise purchase advice, highlighting key pros and cons. E.g., "Excellent build quality and battery, but heavy and slow charging. Recommended for power users.")
    - review_count: number (How many distinct reviews you can identify)
    
    Rules:
    1. positive + negative MUST = 100.
    2. Be objective and critical. If reviews mention many issues, reflect it in the percentage.
    3. The summary must be helpful and mention specific product attributes found in the text.
    
    Reviews Text:
    "${reviewsText.slice(0, 15000)}"
    `;

    // Retry Logic for 429 Errors
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log("Raw AI Response:", text);

            // Cleanup markdown if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error(`Sentiment Analysis Attempt ${attempt} Failed:`, error.message);

            // Fallback strategy: Switch to next candidate model if current one 404s or 503s repeatedly
            if (error.message.includes('404') || error.message.includes('503') || error.message.includes('429')) {
                currentModelIndex = (currentModelIndex + 1) % MODEL_CANDIDATES.length;
                console.log(`Switching to backup model: ${MODEL_CANDIDATES[currentModelIndex]}`);
                model = genAI.getGenerativeModel({ model: MODEL_CANDIDATES[currentModelIndex] });
            }

            // If Rate Limit (429) or Service Overloaded (503), wait and retry
            if ((error.message.includes('429') || error.message.includes('503')) && attempt < 3) {
                const delay = 5000 * attempt; // 5s, 10s
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // If final attempt or non-retriable error
            if (attempt === 3) {
                console.warn("Gemini API failed. Falling back to keyword analysis.");
                return fallbackAnalysis(reviewsText);
            }
        }
    }
}

function fallbackAnalysis(text) {
    const lower = text.toLowerCase();

    // Simple Sentiment Dictionaries
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'nice', 'awesome', 'perfect', 'happy', 'worth', 'value', 'like', 'fast', 'easy'];
    const negativeWords = ['bad', 'poor', 'worst', 'hate', 'waste', 'slow', 'broken', 'issue', 'problem', 'dirty', 'defective', 'useless', 'terrible', 'horrible', 'cheap'];

    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach(w => { posCount += (lower.split(w).length - 1); });
    negativeWords.forEach(w => { negCount += (lower.split(w).length - 1); });

    const total = posCount + negCount;
    let posPercent = 50;
    let negPercent = 50;

    if (total > 0) {
        posPercent = Math.round((posCount / total) * 100);
        negPercent = 100 - posPercent;
    }

    return {
        positive: posPercent,
        negative: negPercent,
        summary: `(Offline Mode) Analysis based on keywords: Found ${posCount} positive markers and ${negCount} negative markers. AI Service is currently overloaded.`,
        review_count: 0
    };
}

module.exports = { analyzeReviews };

