const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with error handling
let genAI;
let model;

try {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
} catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
}

const prompts = {
    simple: `You are a privacy expert helping users understand privacy policies. Analyze this privacy policy and provide:

1. A one-sentence summary of what this privacy policy is about
2. 3-4 key points about data collection and usage
3. The most important thing users should know
4. Any potential privacy risks or concerns

Format the response with clear headings and bullet points. Use simple, non-technical language that anyone can understand.`,

    default: `You are a privacy expert helping users understand privacy policies. Analyze this privacy policy and provide:

1. OVERVIEW (2-3 sentences about what this policy covers)

2. KEY POINTS:
   - What personal data is collected
   - How the data is used
   - Who the data is shared with
   - User rights and choices

3. IMPORTANT CONSIDERATIONS:
   - Privacy risks
   - User controls
   - Notable practices (good or concerning)

4. RECOMMENDATIONS:
   - Specific actions users can take
   - Settings to review
   - Things to be aware of

Use clear bullet points and simple language. Focus on practical implications for users.`,

    detailed: `You are a privacy expert helping users understand privacy policies. Provide a comprehensive analysis with the following sections:

1. EXECUTIVE SUMMARY
   - Brief overview of the policy
   - Scope and applicability
   - Last updated date (if available)

2. DATA COLLECTION & USAGE
   - Types of personal data collected
   - Purpose of collection
   - Legal basis for processing
   - Retention periods

3. DATA SHARING & THIRD PARTIES
   - Who has access to the data
   - Third-party services used
   - International data transfers
   - Data protection measures

4. USER RIGHTS & CONTROLS
   - Available privacy settings
   - Opt-out mechanisms
   - Data access and deletion
   - Cookie preferences

5. PRIVACY IMPLICATIONS
   - Potential risks
   - Security measures
   - Notable practices
   - Areas of concern

6. RECOMMENDATIONS
   - Immediate actions to take
   - Settings to review
   - Best practices
   - Additional protections

Format each section with clear headings and bullet points. Provide specific examples where relevant.`
};

const getPromptForLevel = (level, text) => {
    const basePrompt = `${prompts[level] || prompts.default}

IMPORTANT GUIDELINES:
- Focus on practical implications for users
- Use clear, non-technical language
- Highlight both positive and concerning aspects
- Provide actionable recommendations
- Be objective and factual

Privacy Policy Text:
${text}

Remember to maintain the structured format with clear headings and bullet points.`;

    return basePrompt;
};

const generateAnalysis = async (text, level = 'default') => {
    try {
        if (!model) {
            throw new Error('Gemini AI model not initialized. Check API key configuration.');
        }

        console.log(`Generating analysis for text length: ${text.length}, level: ${level}`);
        const prompt = getPromptForLevel(level, text);
        
        const result = await model.generateContent(prompt);
        if (!result || !result.response) {
            throw new Error('No response received from Gemini AI');
        }

        const response = await result.response;
        const analysisText = response.text();
        
        if (!analysisText) {
            throw new Error('Empty analysis received from Gemini AI');
        }

        console.log('Analysis generated successfully');
        return analysisText;
    } catch (error) {
        console.error('Analysis generation error:', error);
        throw new Error(`Failed to analyze privacy policy: ${error.message}`);
    }
};

const generateQuestions = async (text) => {
    try {
        if (!model) {
            throw new Error('Gemini AI model not initialized. Check API key configuration.');
        }

        const prompt = `As a privacy expert, generate 5 important questions about this privacy policy. Focus on:
- Data collection and usage
- User rights and controls
- Privacy risks and concerns
- Data sharing practices
- Security measures

Return ONLY the questions, one per line. Make them clear and specific.

Privacy Policy Text:
${text}`;

        const result = await model.generateContent(prompt);
        if (!result || !result.response) {
            throw new Error('No response received from Gemini AI');
        }

        const response = await result.response;
        const questions = response.text().split('\n').filter(q => q.trim());
        
        if (!questions.length) {
            throw new Error('No questions generated');
        }

        return questions;
    } catch (error) {
        console.error('Questions generation error:', error);
        throw new Error(`Failed to generate questions: ${error.message}`);
    }
};

const generateAnswer = async (text, question) => {
    try {
        if (!model) {
            throw new Error('Gemini AI model not initialized. Check API key configuration.');
        }

        const prompt = `As a privacy expert, provide a clear and concise answer to this question about the privacy policy. Focus on:
- Being factual and accurate
- Using simple language
- Providing specific examples if relevant
- Adding context if necessary

Privacy Policy Text:
${text}

Question: ${question}

Provide a direct and helpful answer in 2-3 sentences.`;

        const result = await model.generateContent(prompt);
        if (!result || !result.response) {
            throw new Error('No response received from Gemini AI');
        }

        const response = await result.response;
        const answer = response.text();
        
        if (!answer) {
            throw new Error('Empty answer received from Gemini AI');
        }

        return answer;
    } catch (error) {
        console.error('Answer generation error:', error);
        throw new Error(`Failed to generate answer: ${error.message}`);
    }
};

module.exports = {
    generateAnalysis,
    generateQuestions,
    generateAnswer
}; 