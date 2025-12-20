const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API KEY found in .env");
    process.exit(1);
}

async function checkModels() {
    console.log("Checking available models for key: " + apiKey.substring(0, 10) + "...");

    // Manual fetch because SDK listModels might be tricky to access directly depending on version
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("\nAVAILABLE MODELS:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) console.log(`- ${m.name.replace('models/', '')}`);
            });
        } else {
            console.log("Error listing models:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

checkModels();
