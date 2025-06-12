// background.js
const config = {
    apiBaseUrl: 'http://localhost:3000', // Development
    // apiBaseUrl: 'https://your-production-domain.com', // Production
};

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(async () => {
    console.log('[Extension] Installed/Updated');
    await OfflineManager.initCache();
    await StorageManager.clearAll(); // Clear old data on update
});

// Listen for online/offline events
self.addEventListener('online', () => {
    console.log('[Extension] Back online');
});

self.addEventListener('offline', () => {
    console.log('[Extension] Gone offline');
});

// Message handling from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab ? sender.tab.id : 'popup';
    
    // Validate message format
    if (!message || !message.action) {
        console.error(`[Tab ${tabId}] Invalid message format`);
        sendResponse({ error: 'Invalid message format' });
        return true;
    }

    // Handle different message types
    switch (message.action) {
        case 'analyzePrivacyPolicy':
            if (!message.text) {
                sendResponse({ error: 'No text provided for analysis' });
                return true;
            }
            handleAnalysis(message.text, message.level, sendResponse);
            break;
        case 'generateQuestions':
            if (!message.text) {
                sendResponse({ error: 'No text provided for questions' });
                return true;
            }
            handleQuestions(message.text, sendResponse);
            break;
        case 'getAnswer':
            if (!message.text || !message.question) {
                sendResponse({ error: 'Missing text or question' });
                return true;
            }
            handleAnswer(message.text, message.question, sendResponse);
            break;
        default:
            console.error(`[Tab ${tabId}] Unknown action:`, message.action);
            sendResponse({ error: 'Unknown action' });
    }
    
    // Required for async response
    return true;
});

// API Handlers
async function handleAnalysis(text, level = 'default', sendResponse) {
    try {
        console.log('Handling analysis request:', { textLength: text.length, level });

        const response = await fetch(`${config.apiBaseUrl}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: text, 
                level: level 
            })
        });

        console.log('Server response status:', response.status);
        const responseText = await response.text();
        console.log('Raw server response:', responseText);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        if (!data || !data.analysis) {
            throw new Error('Invalid response data: missing analysis');
        }
        
        sendResponse({ success: true, data });
    } catch (error) {
        console.error('Analysis error:', error);
        sendResponse({ 
            success: false, 
            error: error.message || 'Failed to analyze privacy policy. Please try again.' 
        });
    }
}

async function handleQuestions(text, sendResponse) {
    try {
        // Sanitize and validate input
        const sanitizedText = Sanitizer.sanitizeText(text);
        const validation = Sanitizer.validateInput(sanitizedText, {
            required: true,
            minLength: 100,
            maxLength: 50000
        });

        if (!validation.isValid) {
            sendResponse({ 
                success: false, 
                error: `Invalid input: ${validation.errors.join(', ')}` 
            });
            return;
        }

        // Check if offline
        if (!OfflineManager.isOnline()) {
            const cachedQuestions = await StorageManager.getCachedAnalysis(`${text}_questions`);
            if (cachedQuestions) {
                sendResponse({ success: true, data: cachedQuestions, source: 'cache' });
                return;
            }
            sendResponse({ 
                success: false, 
                error: 'You are offline and no cached questions are available.' 
            });
            return;
        }

        const response = await fetch(`${config.apiBaseUrl}/api/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: sanitizedText })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate response data
        if (!data || !Array.isArray(data)) {
            throw new Error('Invalid response data');
        }
        
        // Cache the questions
        await StorageManager.cacheAnalysis(`${text}_questions`, data);
        
        sendResponse({ success: true, data });
    } catch (error) {
        console.error('Question generation error:', error);
        sendResponse({ 
            success: false, 
            error: 'Failed to generate questions. Please try again.' 
        });
    }
}

async function handleAnswer(text, question, sendResponse) {
    try {
        // Sanitize and validate input
        const sanitizedText = Sanitizer.sanitizeText(text);
        const sanitizedQuestion = Sanitizer.sanitizeText(question);
        
        const textValidation = Sanitizer.validateInput(sanitizedText, {
            required: true,
            minLength: 100,
            maxLength: 50000
        });

        const questionValidation = Sanitizer.validateInput(sanitizedQuestion, {
            required: true,
            minLength: 10,
            maxLength: 500
        });

        if (!textValidation.isValid || !questionValidation.isValid) {
            sendResponse({ 
                success: false, 
                error: 'Invalid input parameters' 
            });
            return;
        }

        // Check if offline
        if (!OfflineManager.isOnline()) {
            const cachedAnswer = await StorageManager.getCachedAnalysis(`${text}_${question}`);
            if (cachedAnswer) {
                sendResponse({ success: true, data: cachedAnswer, source: 'cache' });
                return;
            }
            sendResponse({ 
                success: false, 
                error: 'You are offline and no cached answer is available.' 
            });
            return;
        }

        const response = await fetch(`${config.apiBaseUrl}/api/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: sanitizedText, 
                question: sanitizedQuestion 
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate response data
        if (!data || typeof data.answer !== 'string') {
            throw new Error('Invalid response data');
        }
        
        // Cache the answer
        await StorageManager.cacheAnalysis(`${text}_${question}`, data);
        
        sendResponse({ success: true, data });
    } catch (error) {
        console.error('Answer generation error:', error);
        sendResponse({ 
            success: false, 
            error: 'Failed to get answer. Please try again.' 
        });
    }
}

// Enhanced message listening with structured logging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab ? sender.tab.id : 'popup';
    
    // Log message based on type
    switch (message.action) {
        case 'findPrivacyPolicy':
            console.log(`[Tab ${tabId}] Searching for privacy policy`);
            break;
            
        case 'extractContent':
            console.log(`[Tab ${tabId}] Extracting content`);
            if (message.content) {
                const preview = Sanitizer.sanitizeText(message.content).substring(0, 100);
                console.log('Content preview:', preview + '...');
                console.log('Content length:', message.content.length);
            }
            break;
            
        default:
            console.log(`[Tab ${tabId}]`, Sanitizer.sanitizeJSON(message));
    }

    // Log any errors
    if (message.error) {
        console.error(`[Tab ${tabId}] Error:`, Sanitizer.sanitizeText(message.error));
    }

    return true;
});

// Periodic cleanup
setInterval(async () => {
    await StorageManager.cleanupOldData();
}, 24 * 60 * 60 * 1000); // Run once per day

// Log extension lifecycle
console.log('[Extension] Background script loaded');