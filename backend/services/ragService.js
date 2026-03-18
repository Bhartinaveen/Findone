const supabase = require('../config/supabaseClient');
const { generateEmbedding } = require('./embeddingService');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use a sequence of models to handle availability issues
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-pro"];
let currentModelIdx = 0;
let model = genAI.getGenerativeModel({ model: MODEL_CANDIDATES[currentModelIdx] });

async function searchProducts(query) {
    // Graceful embedding failure
    try {
        const embedding = await generateEmbedding(query);
        if (!embedding) return [];

        const { data: products, error } = await supabase.rpc('match_products', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 5
        });

        if (error) {
            console.error("Error searching products:", error);
            return [];
        }
        return products;
    } catch (e) {
        console.warn("Search failed due to API/Embedding error:", e.message);
        return [];
    }
}

async function getChatResponse(userQuery, relevantProducts) {
    const prompt = `
      You are a helpful product recommendation assistant. 
      You have access to the following products based on the user's query:
      ${JSON.stringify(relevantProducts)}

      1. Recommend products that best fit the user's need.
      2. If no products are relevant, politely say so.
      3. Be concise and friendly.
      4. Format your response in Markdown.
      
      User Query: ${userQuery}
    `;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error(`Gemini API Error (Attempt ${attempt}):`, error.message);

            // Fallback strategy: Switch to next candidate model if current one 404s or 503s
            if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('503') || error.message.includes('429')) {
                currentModelIdx = (currentModelIdx + 1) % MODEL_CANDIDATES.length;
                console.log(`Switching to backup model for Chat: ${MODEL_CANDIDATES[currentModelIdx]}`);
                model = genAI.getGenerativeModel({ model: MODEL_CANDIDATES[currentModelIdx] });
            }

            // Retry on 503 or 429
            if ((error.message.includes('503') || error.message.includes('429')) && attempt < 3) {
                const delay = 3000 * attempt;
                console.log(`Waiting ${delay}ms before retrying chat generation...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            if (attempt === 3) {
                return "I'm having trouble connecting to the AI due to high demand. Please try again later.";
            }
        }
    }
    return "I'm having trouble connecting to the AI due to high demand. Please try again later.";
}

module.exports = { searchProducts, getChatResponse };
