const { AppError } = require('./errorHandler');

const validateAnalyzeRequest = (req, res, next) => {
    const { text, level } = req.body;
    
    if (!text || typeof text !== 'string') {
        return next(new AppError(400, 'Text content is required and must be a string'));
    }

    if (text.length > 50000) {
        return next(new AppError(400, 'Text content is too long. Maximum 50,000 characters allowed.'));
    }

    if (level && !['simple', 'default', 'detailed'].includes(level)) {
        return next(new AppError(400, 'Invalid analysis level. Must be one of: simple, default, detailed'));
    }

    next();
};

const validateQuestionsRequest = (req, res, next) => {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
        return next(new AppError(400, 'Text content is required and must be a string'));
    }

    if (text.length > 50000) {
        return next(new AppError(400, 'Text content is too long. Maximum 50,000 characters allowed.'));
    }

    next();
};

const validateAnswerRequest = (req, res, next) => {
    const { text, question } = req.body;
    
    if (!text || typeof text !== 'string') {
        return next(new AppError(400, 'Text content is required and must be a string'));
    }

    if (!question || typeof question !== 'string') {
        return next(new AppError(400, 'Question is required and must be a string'));
    }

    if (text.length > 50000) {
        return next(new AppError(400, 'Text content is too long. Maximum 50,000 characters allowed.'));
    }

    if (question.length > 500) {
        return next(new AppError(400, 'Question is too long. Maximum 500 characters allowed.'));
    }

    next();
};

module.exports = {
    validateAnalyzeRequest,
    validateQuestionsRequest,
    validateAnswerRequest
}; 