const supabase = require('../config/supabaseClient');
const { generateEmbedding } = require('./embeddingService');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Fallback to flash, but handle errors gracefully
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        if (error.message.includes("404") || error.message.includes("not found")) {
            return "⚠️ **API Error:** The Gemini API Key appears to be invalid or missing access to the 'gemini-2.5-flash' model. Please verify your key at [aistudio.google.com](https://aistudio.google.com).";
        }
        return "I'm having trouble connecting to the AI. Please try again later.";
    }
}

module.exports = { searchProducts, getChatResponse };
