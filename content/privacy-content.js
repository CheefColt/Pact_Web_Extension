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
        <div class="loading-state">
            <div class="loader"></div>
            <span class="loading-text">Analyzing privacy policy...</span>
        </div>
        <div class="analysis-content"></div>
        <div class="questions-section" style="display: none;">
            <h2>Ask Questions</h2>
            <div class="questions-list"></div>
            <div class="answer-section"></div>
        </div>
    `;

    overlay.querySelector('.close-button').addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
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
async function analyzePrivacyPolicy(text) {
    const prompt = `Analyze this privacy policy and provide a summary strictly in this HTML format:

<section>
    <h2>Key Points</h2>
    <ul>
        <li>[key point]</li>
    </ul>
</section>
<section>
    <h2>Data Collection</h2>
    <ul>
        <li>[data point]</li>
    </ul>
</section>
<section>
    <h2>Data Usage</h2>
    <ul>
        <li>[usage point]</li>
    </ul>
</section>

Privacy Policy: ${text}`;

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