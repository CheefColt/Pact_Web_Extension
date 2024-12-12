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

// Add search styles to existing styleSheet
styleSheet.textContent += `
.search-container {
    margin-bottom: 16px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
}

.search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
}

.search-input:focus {
    border-color: #3b82f6;
}

.highlight {
    background-color: #fef08a;
    padding: 2px;
    border-radius: 2px;
}

.jump-links {
    margin-top: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.jump-link {
    padding: 4px 8px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
}`;

// Add to existing styles
styleSheet.textContent += `
.search-stats {
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
}

.search-highlight {
    background-color: #fef08a;
    padding: 2px 0;
}

.search-highlight.active {
    background-color:rgb(253, 114, 71);
}

.navigation-controls {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.nav-button {
    padding: 4px 8px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
}

.nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}`;

// Update search styles
styleSheet.textContent += `
.highlight {
    background-color: #fef08a;
    border-radius: 2px;
    padding: 2px 4px;
}

.highlight.active {
    background-color: #f97316;
    color: white;
}`;

// Add to existing styles
styleSheet.textContent += `
.notification-panel {
    margin-top: 16px;
    margin-bottom: 16px;
}

.notification-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.notification-count {
    background: #ef4444;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.notification-item {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    animation: slideIn 0.3s ease;
}

.notification-high {
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.notification-medium {
    background: #fff7ed;
    border: 1px solid #fed7aa;
}

.notification-low {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
}

.notification-icon {
    font-size: 16px;
}

.notification-content {
    flex: 1;
}

.notification-title {
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 14px;
}

.notification-description {
    font-size: 12px;
    color: #4b5563;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}`;

// Add after existing styles
styleSheet.textContent += `
.notification-panel {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.notification-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
}

.notification-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.notification-item {
    padding: 12px;
    border-radius: 6px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.notification-high {
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.notification-medium {
    background: #fff7ed;
    border: 1px solid #fed7aa;
}

.notification-low {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
}`;

document.head.appendChild(styleSheet);

// Add debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create Overlay
function createAnalyzerOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'privacy-analyzer-overlay';
    
    overlay.innerHTML = `
        <div class="header">
            <h2>Privacy Policy Analysis</h2>
            <button class="close-button">×</button>
        </div>
        <div class="notification-panel">
            <div class="notification-header">
                <h3>Privacy Alerts</h3>
                <span class="notification-count">0</span>
            </div>
            <div class="notification-list"></div>
        </div>
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Search in privacy policy...">
            <div class="search-stats"></div>
            <div class="navigation-controls">
                <button class="nav-button prev-match" disabled>Previous</button>
                <button class="nav-button next-match" disabled>Next</button>
            </div>
            <div class="jump-links"></div>
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

    // Add search state tracking
    let searchState = {
        matches: [],
        currentIndex: -1,
        query: ''
    };

    function performSearch(searchText) {
        // Reset state
        searchState = {
            matches: [],
            currentIndex: -1,
            query: searchText
        };

        if (!searchText) {
            clearHighlights();
            updateUI();
            return;
        }

        const content = overlay.querySelector('.analysis-content');
        const allElements = content.querySelectorAll('p, li');
        const searchRegex = new RegExp(escapeRegExp(searchText), 'gi');

        allElements.forEach(element => {
            const originalText = element.textContent;
            if (searchRegex.test(originalText)) {
                element.innerHTML = originalText.replace(searchRegex, match => 
                    `<mark class="highlight">${match}</mark>`
                );
                searchState.matches.push(...element.querySelectorAll('.highlight'));
            }
        });

        if (searchState.matches.length > 0) {
            searchState.currentIndex = 0;
            highlightCurrentMatch();
        }

        updateUI();
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function clearHighlights() {
        const highlights = overlay.querySelectorAll('.highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.textContent = parent.textContent;
        });
    }

    function highlightCurrentMatch() {
        searchState.matches.forEach(match => match.classList.remove('active'));
        const currentMatch = searchState.matches[searchState.currentIndex];
        if (currentMatch) {
            currentMatch.classList.add('active');
            currentMatch.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    function updateUI() {
        const prevButton = overlay.querySelector('.prev-match');
        const nextButton = overlay.querySelector('.next-match');
        const statsDiv = overlay.querySelector('.search-stats');

        prevButton.disabled = !searchState.matches.length || searchState.currentIndex <= 0;
        nextButton.disabled = !searchState.matches.length || 
            searchState.currentIndex >= searchState.matches.length - 1;

        statsDiv.textContent = searchState.matches.length ? 
            `${searchState.matches.length} matches (${searchState.currentIndex + 1}/${searchState.matches.length})` :
            searchState.query ? 'No matches found' : '';
    }

    // Event Listeners
    overlay.querySelector('.search-input').addEventListener('input', 
        debounce(e => performSearch(e.target.value.trim()), 300)
    );

    overlay.querySelector('.prev-match').addEventListener('click', () => {
        if (searchState.currentIndex > 0) {
            searchState.currentIndex--;
            highlightCurrentMatch();
            updateUI();
        }
    });

    overlay.querySelector('.next-match').addEventListener('click', () => {
        if (searchState.currentIndex < searchState.matches.length - 1) {
            searchState.currentIndex++;
            highlightCurrentMatch();
            updateUI();
        }
    });

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

    // Add notification handling
    function addNotification(notification) {
        const list = overlay.querySelector('.notifications-list');
        const item = document.createElement('div');
        item.className = `notification-item notification-${notification.priority}`;
        
        item.innerHTML = `
            <div class="notification-icon">${notification.icon}</div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-description">${notification.description}</div>
            </div>
        `;

        list.appendChild(item);
        updateNotificationCount();
    }

    function updateNotificationCount() {
        const count = overlay.querySelectorAll('.notification-item').length;
        overlay.querySelector('.notification-count').textContent = count;
    }

    // Initialize content analysis
    const content = extractPrivacyContent();
    checkPrivacyAlerts(content, overlay);
    analyzePrivacyPolicy(content);

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

// Add search handler
function handleSearch(query, overlay) {
    const content = overlay.querySelector('.analysis-content');
    const jumpLinks = overlay.querySelector('.jump-links');
    
    // Clear previous highlights and links
    clearHighlights(overlay);
    jumpLinks.innerHTML = '';
    
    if (!query) return;

    const regex = new RegExp(query, 'gi');
    const elements = content.querySelectorAll('p, li');
    let matchCount = 0;
    
    elements.forEach((element, index) => {
        const text = element.textContent;
        if (regex.test(text)) {
            element.innerHTML = text.replace(regex, match => 
                `<mark class="highlight" id="match-${index}">${match}</mark>`
            );
            
            // Create jump link
            const section = element.closest('section');
            if (section) {
                const title = section.querySelector('h2').textContent;
                const link = document.createElement('button');
                link.className = 'jump-link';
                link.textContent = `${title} (Match ${++matchCount})`;
                link.onclick = () => document.getElementById(`match-${index}`)
                    .scrollIntoView({ behavior: 'smooth' });
                jumpLinks.appendChild(link);
            }
        }
    });
}

function clearHighlights(overlay) {
    const highlights = overlay.querySelectorAll('.highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.textContent = parent.textContent;
    });
}

// Add privacy checks function
function checkPrivacyAlerts(text, overlay) {
    const alerts = [
        {
            pattern: /sell.*personal.*information|sell.*data/i,
            priority: 'high',
            icon: '🚨',
            title: 'Data Selling',
            description: 'This policy indicates your data may be sold'
        },
        {
            pattern: /share.*third.?part|share.*partner/i,
            priority: 'high',
            icon: '⚠️',
            title: 'Third-party Sharing',
            description: 'Your data may be shared with third parties'
        },
        {
            pattern: /track.*behavior|monitor.*activity/i,
            priority: 'medium',
            icon: '👁️',
            title: 'Activity Tracking',
            description: 'Your online activity is being monitored'
        }
    ];

    const notificationList = overlay.querySelector('.notification-list');
    let alertCount = 0;

    alerts.forEach(alert => {
        if (alert.pattern.test(text)) {
            alertCount++;
            const item = document.createElement('div');
            item.className = `notification-item notification-${alert.priority}`;
            item.innerHTML = `
                <div>${alert.icon}</div>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px">${alert.title}</div>
                    <div style="font-size: 12px; color: #4b5563">${alert.description}</div>
                </div>
            `;
            notificationList.appendChild(item);
        }
    });

    overlay.querySelector('.notification-count').textContent = alertCount || '0';
    overlay.querySelector('.notification-panel').style.display = alertCount ? 'block' : 'none';
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