const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 1. Test Embedding (simplest)
    console.log("Testing text-embedding-004...");
    try {
        const eModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const eResult = await eModel.embedContent("Test");
        console.log("SUCCESS: Embeddings working!");
    } catch (e) {
        console.log("FAILED: Embeddings - " + e.message.split('\n')[0]);
    }

    // 2. Test Chat
    const models = ["gemini-2.5-flash", "gemini-pro"];
    for (const modelName of models) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`SUCCESS: ${modelName} worked! Response: ${response.text()}`);
            return;
        } catch (error) {
            console.log(`FAILED: ${modelName} - ${error.message.split('\n')[0]}`);
        }
    }
}

testModels();
