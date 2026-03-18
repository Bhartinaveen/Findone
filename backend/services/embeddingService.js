const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function generateEmbedding(text) {
    if (!text) return null;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const result = await model.embedContent(text);
            const embedding = result.embedding;
            
            // Critical fix for dimension mismatch: Ensure we return exactly what the DB expects
            // Some models return 3072, but our Supabase schema is 768.
            const values = embedding.values;
            if (values.length > 768) {
                console.log(`Original embedding dimension ${values.length}, slicing to 768...`);
                return values.slice(0, 768);
            }
            return values;
        } catch (error) {
            console.error(`Error generating embedding (Attempt ${attempt}):`, error.message);

            if ((error.message.includes('503') || error.message.includes('429')) && attempt < 3) {
                const delay = 3000 * attempt;
                console.log(`Waiting ${delay}ms before retrying embedding...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            if (attempt === 3) {
                return null;
            }
        }
    }
}

module.exports = { generateEmbedding };
