const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateProductDescription = async (productDetails) => {
    const { name, category, fabric, occasion, colors } = productDetails;
    
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('API Key missing. Please add GEMINI_API_KEY to your .env file.');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Models to try in order
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];
    
    const colorString = colors && colors.length > 0 ? colors.join(', ') : 'Exquisite palette';

    const prompt = `
        You are a fashion copywriter for Indian ethnic wear.
        Write a short and clear product description for a saree with the following details:
        - Name: ${name || 'Exquisite Saree'}
        - Category: ${category || 'Ethnic Wear'}
        - Fabric: ${fabric || 'Premium weaving'}
        - Colors: ${colorString}
        - Occasion: ${occasion || 'Special occasions'}
        
        Keep it to 2 short sentences only (max 45 words).
        Use simple English and focus on fabric feel, color appeal, and occasion use.
        Avoid poetic language, fluff, and repeated adjectives.
        Return only the description text.
    `;

    const safetySettings = [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ];

    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`AI Attempting with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            // Check if response was blocked
            if (response.promptFeedback?.blockReason) {
                console.warn(`Model ${modelName} blocked the prompt:`, response.promptFeedback.blockReason);
                continue;
            }

            const text = response.text();
            if (text) {
                return text.trim();
            }
        } catch (error) {
            console.error(`Error with model ${modelName}:`, error.message);
            lastError = error;
            continue;
        }
    }

    // If we reach here, both models failed
    if (lastError && (lastError.message.includes('429') || lastError.message.toLowerCase().includes('quota'))) {
        throw new Error('AI limit reached. Please wait or write your own description for now.');
    }
    
    throw new Error(lastError ? lastError.message : 'Failed to generate description with AI.');
};

module.exports = {
    generateProductDescription
};
