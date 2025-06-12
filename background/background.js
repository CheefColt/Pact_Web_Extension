// background.js
console.log('[Extension] Background script loaded');

// Handle installation/update events
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Extension] Installed/Updated');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Background] Received message:', request);

    // Handle different message types
    switch (request.action) {
        case 'analyzePrivacyPolicy':
            handleAnalysis(request.text, request.level)
                .then(analysis => {
                    console.log('[Background] Analysis complete:', analysis);
                    sendResponse({ success: true, data: analysis });
                })
                .catch(error => {
                    console.error('[Background] Analysis error:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Will send response asynchronously

        case 'generateQuestions':
            generateQuestions(request.text)
                .then(questions => {
                    console.log('[Background] Questions generated:', questions);
                    sendResponse({ success: true, data: questions });
                })
                .catch(error => {
                    console.error('[Background] Questions generation error:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Will send response asynchronously

        default:
            console.warn('[Background] Unknown action:', request.action);
            sendResponse({ success: false, error: 'Unknown action' });
            return false;
    }
});

// Helper function to analyze privacy policy text
async function handleAnalysis(text, level = 'default') {
    if (!text) {
        throw new Error('No text provided for analysis');
    }

    console.log(`[Background] Analyzing text (${text.length} chars) with level: ${level}`);

    try {
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, level })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Background] Server error:', error);
            throw new Error('Analysis failed: ' + error);
        }

        const data = await response.json();
        if (!data.analysis) {
            throw new Error('No analysis data received from server');
        }

        return data.analysis;
    } catch (error) {
        console.error('[Background] Analysis error:', error);
        throw new Error('Failed to analyze privacy policy: ' + error.message);
    }
}

// Helper function to generate questions
async function generateQuestions(text) {
    if (!text) {
        throw new Error('No text provided for question generation');
    }

    console.log(`[Background] Generating questions for text (${text.length} chars)`);

    try {
        const response = await fetch('http://localhost:3000/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Background] Server error:', error);
            throw new Error('Question generation failed: ' + error);
        }

        const data = await response.json();
        if (!data.questions) {
            throw new Error('No questions received from server');
        }

        return data.questions;
    } catch (error) {
        console.error('[Background] Questions generation error:', error);
        throw new Error('Failed to generate questions: ' + error.message);
    }
} 