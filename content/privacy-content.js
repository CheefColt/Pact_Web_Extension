// privacy-content.js
console.log('Privacy content script loaded');

// Style Definitions
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

.header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
}

.header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.close-button {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}

.analysis-content {
    margin-bottom: 24px;
}

.analysis-content h2 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 16px 0 12px;
}

.analysis-content ul {
    list-style: disc;
    margin: 8px 0;
    padding-left: 24px;
}

.analysis-content li {
    font-size: 14px;
    line-height: 1.6;
    color: #374151;
    margin: 6px 0;
}

.loading-state {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    margin: 16px 0;
}

.loader {
    width: 20px;
    height: 20px;
    border: 2px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.loading-text {
    color: #64748b;
    font-size: 14px;
}

.questions-section {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.question-btn {
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
    transition: all 0.2s ease;
}

.question-btn:hover {
    background: #f1f5f9;
    border-color: #3b82f6;
}

.answer-section {
    margin-top: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 14px;
    color: #374151;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.chat-section {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.chat-history {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 16px;
    padding: 8px;
}

.chat-message {
    margin: 8px 0;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
}

.user-message {
    background: #f0f9ff;
    margin-left: 20%;
    border-bottom-right-radius: 4px;
}

.bot-message {
    background: #f8fafc;
    margin-right: 20%;
    border-bottom-left-radius: 4px;
}

.chat-input-container {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: #f8fafc;
    border-radius: 8px;
}

.chat-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
}

.chat-input:focus {
    border-color: #3b82f6;
}

.send-button {
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.send-button:hover {
    background: #2563eb;
}

.chat-loading {
    color: #64748b;
    font-style: italic;
    padding: 8px;
}

.level-selector {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.level-selector h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
}

.level-options {
    display: flex;
    gap: 12px;
}

.level-option {
    flex: 1;
    position: relative;
}

.level-option input[type="radio"] {
    display: none;
}

.level-option label {
    display: block;
    padding: 10px;
    text-align: center;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
}

.level-option input[type="radio"]:checked + label {
    border-color: #3b82f6;
    background: #f0f9ff;
    color: #1d4ed8;
}

.analyze-button {
    width: 100%;
    padding: 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 12px;
}

.analyze-button:hover {
    background: #2563eb;
}`;

document.head.appendChild(styleSheet);

// Create Overlay
function createAnalyzerOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'privacy-analyzer-overlay';
    
    overlay.innerHTML = `
        <div class="header">
            <h2>Privacy Policy Analysis</h2>
            <button class="close-button">×</button>
        </div>
        <div class="level-selector">
            <h3>Select Analysis Level</h3>
            <div class="level-options">
                <div class="level-option">
                    <input type="radio" id="simple" name="level" value="simple">
                    <label for="simple">Simple</label>
                </div>
                <div class="level-option">
                    <input type="radio" id="default" name="level" value="default" checked>
                    <label for="default">Default</label>
                </div>
                <div class="level-option">
                    <input type="radio" id="detailed" name="level" value="detailed">
                    <label for="detailed">Detailed</label>
                </div>
            </div>
            <button class="analyze-button">Analyze Privacy Policy</button>
        </div>
        <div class="analysis-content"></div>
        <div class="questions-section" style="display: none;">
            <h2>Ask Questions</h2>
            <div class="questions-list"></div>
            <div class="answer-section"></div>
        </div>
        <div class="chat-section">
            <h2>Chat About Policy</h2>
            <div class="chat-history"></div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" placeholder="Ask anything about the privacy policy...">
                <button class="send-button">Send</button>
            </div>
        </div>
    `;

    // Add chat handlers
    const chatInput = overlay.querySelector('.chat-input');
    const sendButton = overlay.querySelector('.send-button');
    const chatHistory = overlay.querySelector('.chat-history');

    async function handleChat() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Clear input
        chatInput.value = '';

        // Add user message
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user-message';
        userDiv.textContent = message;
        chatHistory.appendChild(userDiv);

        // Add loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-loading';
        loadingDiv.textContent = 'Getting response...';
        chatHistory.appendChild(loadingDiv);

        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;

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
                            text: `Based on this privacy policy:\n${content}\n\nUser Question: ${message}\n\nProvide a clear and concise answer:`
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            // Remove loading
            loadingDiv.remove();

            // Add bot response
            const botDiv = document.createElement('div');
            botDiv.className = 'chat-message bot-message';
            botDiv.textContent = data.candidates[0].content.parts[0].text;
            chatHistory.appendChild(botDiv);
            
            // Scroll to bottom
            chatHistory.scrollTop = chatHistory.scrollHeight;
        } catch (error) {
            loadingDiv.textContent = 'Failed to get response. Please try again.';
        }
    }

    sendButton.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    overlay.querySelector('.close-button').addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);

    // Add analyze button handler
    const analyzeButton = overlay.querySelector('.analyze-button');
    analyzeButton.addEventListener('click', async () => {
        const selectedLevel = overlay.querySelector('input[name="level"]:checked').value;
        const content = extractPrivacyContent();
        
        // Show loading state
        overlay.querySelector('.analysis-content').innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <span class="loading-text">Analyzing privacy policy...</span>
            </div>
        `;
        
        const analysis = await analyzePrivacyPolicy(content, selectedLevel);
        if (analysis) {
            overlay.querySelector('.analysis-content').innerHTML = analysis;
        }
    });

    return overlay;
}

// Extract Content
function extractPrivacyContent() {
    const paragraphs = Array.from(document.getElementsByTagName('p'))
        .map(p => p.textContent.trim())
        .filter(text => text.length > 0);
    return paragraphs.join('\n\n');
}

// API Integration
async function analyzePrivacyPolicy(text, level = 'default') {
    const prompts = {
        simple: `Analyze this privacy policy and provide 6-8 key points in simple, easy-to-understand English. Return in this HTML format:
            <section>
                <h2>Simple Privacy Summary</h2>
                <ul>[6-8 bullet points in basic language]</ul>
            </section>`,
        default: `Analyze this privacy policy and provide 13-15 points with moderate detail. Return in this HTML format:
            <section>
                <h2>Privacy Policy Analysis</h2>
                <ul>[13-15 bullet points in moderate language]</ul>
            </section>`,
        detailed: `Analyze this privacy policy and provide 15-18 detailed points using technical terms where appropriate. Return in this HTML format:
            <section>
                <h2>Detailed Privacy Analysis</h2>
                <ul>[15-18 bullet points with technical details]</ul>
            </section>`
    };

    const prompt = prompts[level] + `\n\nPrivacy Policy Text: ${text}`;

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

// Generate Questions
async function generateQuestions(text) {
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
                        text: `Based on this privacy policy, generate 5 relevant questions. Return ONLY the questions separated by newlines.\n\n${text}`
                    }]
                }]
            })
        });
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text.split('\n').filter(q => q.trim());
    } catch (error) {
        console.error('Question generation error:', error);
        return [
            'How is my data collected?',
            'What are my privacy rights?',
            'How is my data shared?',
            'Can I opt out of data collection?',
            'How is my data protected?'
        ];
    }
}

// Handle Question Click
async function handleQuestionClick(question, answerSection) {
    answerSection.innerHTML = `
        <div class="loading-state">
            <div class="loader"></div>
            <span class="loading-text">Finding answer...</span>
        </div>
    `;
    
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
                        text: `Based on this privacy policy:\n${content}\n\nProvide a concise answer to: ${question}`
                    }]
                }]
            })
        });

        const data = await response.json();
        answerSection.innerHTML = `<p>${data.candidates[0].content.parts[0].text}</p>`;
    } catch (error) {
        answerSection.innerHTML = '<p>Failed to get answer. Please try again.</p>';
    }
}

// Initialize
window.addEventListener('load', () => {
    setTimeout(async () => {
        try {
            const overlay = createAnalyzerOverlay();
            const content = extractPrivacyContent();
            
            // Get analysis and questions
            const [analysis, questions] = await Promise.all([
                analyzePrivacyPolicy(content),
                generateQuestions(content)
            ]);
            
            // Update analysis content
            if (analysis) {
                const analysisContent = overlay.querySelector('.analysis-content');
                overlay.querySelector('.loading-state').style.display = 'none';
                analysisContent.innerHTML = analysis;
            }
            
            // Display questions
            if (questions) {
                const questionsSection = overlay.querySelector('.questions-section');
                const questionsList = overlay.querySelector('.questions-list');
                const answerSection = overlay.querySelector('.answer-section');
                
                questionsSection.style.display = 'block';
                questions.forEach(question => {
                    const button = document.createElement('button');
                    button.className = 'question-btn';
                    button.textContent = question;
                    button.onclick = () => handleQuestionClick(question, answerSection);
                    questionsList.appendChild(button);
                });
            }
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }, 1500);
});