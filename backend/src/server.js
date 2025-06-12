const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { 
    validateAnalyzeRequest, 
    validateQuestionsRequest, 
    validateAnswerRequest 
} = require('./middleware/validator');
const { 
    generateAnalysis, 
    generateQuestions, 
    generateAnswer 
} = require('./utils/ai');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));
app.use(express.json({ limit: '10mb' }));

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use(limiter);

// Health check endpoint (both /health and /api/health)
app.get(['/health', '/api/health'], (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/analyze', validateAnalyzeRequest, async (req, res, next) => {
    try {
        const { text, level = 'default' } = req.body;
        console.log('Received analysis request:', { 
            textLength: text.length, 
            level 
        });
        
        const analysis = await generateAnalysis(text, level);
        console.log('Analysis completed');
        
        res.json({ analysis });
    } catch (error) {
        console.error('Analysis error:', error);
        next(error);
    }
});

app.post('/api/questions', validateQuestionsRequest, async (req, res, next) => {
    try {
        const { text } = req.body;
        const questions = await generateQuestions(text);
        res.json({ questions });
    } catch (error) {
        next(error);
    }
});

app.post('/api/answer', validateAnswerRequest, async (req, res, next) => {
    try {
        const { text, question } = req.body;
        const answer = await generateAnswer(text, question);
        res.json({ answer });
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('CORS enabled for all origins');
}); 