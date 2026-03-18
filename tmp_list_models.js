const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Note: fetch is available in Node 18+
async function listModels() {
    try {
        console.log("Listing models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();
