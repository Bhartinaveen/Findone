const supabase = require('../config/supabaseClient');
const { generateEmbedding } = require('./embeddingService');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use a sequence of models to handle availability issues
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-pro"];
let currentModelIdx = 0;

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

async function getChatResponse(userQuery, relevantProducts, mode = 'search', chatHistory = []) {
    let prompt = '';
    const historyString = chatHistory && chatHistory.length > 0
        ? 'Chat History:\\n' + chatHistory.map(msg => `${msg.role === 'bot' ? 'Assistant' : 'User'}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`).join('\\n')
        : 'No previous chat history.';

    if (mode === 'compare') {
        prompt = `
      You are a highly intelligent product comparison assistant. 
      You have access to live data and context through Google Search.
      
      ${historyString}
      
      Current User Query: ${userQuery}

      Please structure your response in a well-defined manner:
      1. **Comparison**: Compare the products objectively based on specs, features, price, and real-world value.
      2. **Counter Questions**: Ask 1-2 quick follow-up questions to understand the user's specific needs better (e.g., their budget, what they prioritize). ONLY ask about budget if it is not already provided in the chat history or query.
      3. **Final Answer/Suggestion**: Give a clear, definitive and smart recommendation on which product is better and whether they should buy it right now.
      
      CRITICAL RULES ON CURRENCY: 
      - ALWAYS use Indian Rupees (INR / ₹) for all prices and budgets. NEVER use USD or $.
      - If the user provides a number without a currency symbol (e.g., "20000"), ASSUME IT IS IN INDIAN RUPEES (₹20,000). Never assume dollars.
      
      Format your response clearly using Markdown. Be concise, realistic, and friendly.
    `;
    } else {
        prompt = `
      You are a helpful product recommendation assistant. 
      You have access to the following products based on the query:
      ${JSON.stringify(relevantProducts)}

      ${historyString}
      
      Current User Query: ${userQuery}

      1. Recommend products that best fit the user's need, considering their chat history context.
      2. If no products are relevant, politely say so.
      3. Be concise and friendly.
      4. Format your response in Markdown.
      5. CRITICAL RULES ON CURRENCY:
         - Always use Indian Rupees (INR / ₹) for all prices and budgets. Never use USD or $.
         - If the user provides a number without a currency symbol (e.g., "20000"), ASSUME IT IS IN INDIAN RUPEES (₹20,000). Never assume dollars.
    `;
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const modelOptions = { model: MODEL_CANDIDATES[currentModelIdx] };
            if (mode === 'compare') {
                modelOptions.tools = [{ googleSearch: {} }];
            }
            const currentModel = genAI.getGenerativeModel(modelOptions);

            const result = await currentModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error(`Gemini API Error (Attempt ${attempt}):`, error.message);

            // Fallback strategy: Switch to next candidate model if current one 404s or 503s
            if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('503') || error.message.includes('429')) {
                currentModelIdx = (currentModelIdx + 1) % MODEL_CANDIDATES.length;
                console.log(`Switching to backup model for Chat: ${MODEL_CANDIDATES[currentModelIdx]}`);
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
