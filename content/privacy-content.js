// privacy-content.js
console.log('Privacy content script loaded');

// 1. Style Definitions - Using CSS Reset for Consistency
const styleSheet = document.createElement('style');
styleSheet.textContent = `
.privacy-analyzer-overlay * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.privacy-analyzer-overlay {
    position: fixed;
    top: 24px;
    right: 24px;
    width: 420px;
    max-height: 85vh;
    background: #ffffff;
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    z-index: 999999;
    overflow-y: auto;
}

.privacy-analyzer-overlay h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 16px;
}

.privacy-analyzer-overlay p {
    font-size: 14px;
    line-height: 1.6;
    color: #374151;
    margin-bottom: 12px;
}

.privacy-analyzer-overlay ul {
    list-style: disc;
    margin: 12px 0;
    padding-left: 24px;
}

.privacy-analyzer-overlay li {
    font-size: 14px;
    line-height: 1.6;
    color: #374151;
    margin: 8px 0;
}

.loading-state {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 0;
}

.loader {
    width: 20px;
    height: 20px;
    border: 2px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-text {
    color: #64748b;
    font-size: 14px;
}`;

document.head.appendChild(styleSheet);

// 2. Content Extraction
function extractPrivacyContent() {
    const content = {
        url: window.location.href,
        title: document.title,
        fullText: ''
    };

    const paragraphs = Array.from(document.getElementsByTagName('p'))
        .map(p => p.textContent.trim())
        .filter(text => text.length > 0);
    
    content.fullText = paragraphs.join('\n\n');
    console.log(`Extracted ${paragraphs.length} paragraphs`);
    
    return content;
}

// Helper function to get element's path
function getElementPath(element) {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();
        if (element.id) {
            selector += `#${element.id}`;
        } else if (element.className) {
            selector += `.${element.className.replace(/\s+/g, '.')}`;
        }
        path.unshift(selector);
        element = element.parentNode;
    }
    return path.join(' > ');
}

// Split content into manageable chunks
function chunkContent(content, maxChunkSize = 5000) {
    const chunks = [];
    let currentChunk = '';

    content.paragraphs.forEach(p => {
        if ((currentChunk + p.text).length > maxChunkSize) {
            chunks.push(currentChunk);
            currentChunk = p.text;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + p.text;
        }
    });

    if (currentChunk) chunks.push(currentChunk);
    console.log(`Created ${chunks.length} chunks for analysis`);
    return chunks;
}

// 4. API Integration
async function analyzePrivacyPolicy(text) {
    const prompt = `Analyze this privacy policy and provide a structured summary in the following HTML format:

<div class="summary">
    <h2>Key Points</h2>
    <ul>
        <li>[Brief, important points]</li>
    </ul>

    <h2>Data Collection</h2>
    <ul>
        <li>[What data is collected]</li>
    </ul>

    <h2>Data Usage</h2>
    <ul>
        <li>[How data is used]</li>
    </ul>

    <h2>Your Rights</h2>
    <ul>
        <li>[User rights and controls]</li>
    </ul>
</div>

Policy Text: ${text}`;

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': 'API_KEY'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// 5. Question Generation
async function generateQuestions(text) {
    console.log('Generating questions...');
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': 'AIzaSyDj--K6qjcy4MZ0Acc_hbUMGvcitMOUPTQ'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Based on this privacy policy, generate 5 specific questions users might want to ask. Return as an array of questions.\n\n${text}`
                    }]
                }]
            })
        });
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text
            .split('\n')
            .filter(line => line.trim().length > 0)
            .slice(0, 5);
    } catch (error) {
        console.error('Question generation error:', error);
        return [
            'How is my personal data collected?',
            'What are my privacy rights?',
            'How is my data shared with third parties?',
            'Can I opt out of data collection?',
            'How is my data protected?'
        ];
    }
}

// Add handler for question clicks
async function handleQuestionClick(question) {
    const chatHistory = document.querySelector('.chat-history');
    
    // Add user question to chat
    const questionDiv = document.createElement('div');
    questionDiv.className = 'chat-message user-message';
    questionDiv.textContent = `Q: ${question}`;
    chatHistory.appendChild(questionDiv);

    // Show loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message loading';
    loadingDiv.textContent = 'Getting answer...';
    chatHistory.appendChild(loadingDiv);

    try {
        const content = extractPrivacyContent();
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': 'AIzaSyDj--K6qjcy4MZ0Acc_hbUMGvcitMOUPTQ'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Based on this privacy policy:\n${content.fullText}\n\nAnswer this question:\n${question}`
                    }]
                }]
            })
        });

        const data = await response.json();
        const answer = data.candidates[0].content.parts[0].text;

        // Remove loading message
        loadingDiv.remove();

        // Add answer to chat
        const answerDiv = document.createElement('div');
        answerDiv.className = 'chat-message bot-message';
        answerDiv.textContent = `A: ${answer}`;
        chatHistory.appendChild(answerDiv);

        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
    } catch (error) {
        console.error('Error getting answer:', error);
        loadingDiv.textContent = 'Failed to get answer';
    }
}

// 3. Overlay Creation
function createAnalyzerOverlay() {
    console.log('Creating overlay...');
    const overlay = document.createElement('div');
    overlay.className = 'privacy-analyzer-overlay';
    
    overlay.innerHTML = `
        <h2>Privacy Policy Analysis</h2>
        <div class="loading-state">
            <div class="loader"></div>
            <span class="loading-text">Analyzing privacy policy content...</span>
        </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
}

// 6. UI Updates
function updateOverlayContent(overlay, analysis) {
    console.log('Updating overlay content...');
    const summarySection = overlay.querySelector('.summary-section');
    summarySection.innerHTML = `
        <h2 class="section-header">Privacy Policy Analysis</h2>
        ${analysis}
    `;
    summarySection.classList.add('visible');
}

function displayQuestions(overlay, questions) {
    console.log('Displaying questions...');
    const questionsSection = overlay.querySelector('.questions-section');
    const questionsList = overlay.querySelector('.questions-list');
    
    questionsList.innerHTML = '';
    questions.forEach(question => {
        const button = document.createElement('button');
        button.className = 'question-btn';
        button.textContent = question;
        button.onclick = () => handleQuestionClick(question);
        questionsList.appendChild(button);
    });
    
    questionsSection.style.display = 'block';
    questionsSection.classList.add('visible');
}

// 7. Main Initialization
async function initializeAnalyzer() {
    console.log('Initializing analyzer...');
    try {
        const overlay = createAnalyzerOverlay();
        const content = extractPrivacyContent();
        
        const analysis = await analyzePrivacyPolicy(content.fullText);
        if (analysis) {
            updateOverlayContent(overlay, analysis);
            
            const questions = await generateQuestions(content.fullText);
            displayQuestions(overlay, questions);
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Update initialization
window.addEventListener('load', () => {
    console.log('Starting privacy policy analysis...');
    setTimeout(async () => {
        const overlay = createAnalyzerOverlay();
        const content = extractPrivacyContent();
        const analysis = await analyzePrivacyPolicy(content.fullText);
        
        if (analysis) {
            overlay.innerHTML = analysis;
        }
    }, 1500);
});
