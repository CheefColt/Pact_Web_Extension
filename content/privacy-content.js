// privacy-content.js
console.log('Privacy content script loaded');

function extractPrivacyContent() {
    const content = {
        url: window.location.href,
        title: document.title,
        fullText: '',
        totalLength: 0
    };

    // Get all paragraphs and combine
    const paragraphs = Array.from(document.getElementsByTagName('p'));
    console.log(`Found ${paragraphs.length} paragraphs`);
    
    content.fullText = paragraphs
        .map(p => p.textContent.trim())
        .filter(text => text.length > 0)
        .join('\n\n');
    
    content.totalLength = content.fullText.length;
    console.log(`Total content length: ${content.totalLength} characters`);
    
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

// Analyze privacy policy using Gemini API
async function analyzePrivacyPolicy(text) {
    const prompt = `Analyze this privacy policy text and provide:
1. Simple summary in bullet points
2. Key points about personal data usage
3. Important user considerations

Text:
${text}`;

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

// Add styles first
const styleSheet = document.createElement('style');
styleSheet.textContent = `
.privacy-analyzer-overlay {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    max-height: 80vh; /* 80% of viewport height */
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    font-family: Arial, sans-serif;
    overflow-y: auto;
    scrollbar-width: thin;
}

/* Custom scrollbar styling for webkit browsers */
.privacy-analyzer-overlay::-webkit-scrollbar {
    width: 8px;
}

.privacy-analyzer-overlay::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.privacy-analyzer-overlay::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.privacy-analyzer-overlay::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Rest of your existing styles... */
.loader {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-radius: 50%;
    border-top: 3px solid #3498db;
    animation: spin 1s linear infinite;
    margin-right: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-text {
    display: flex;
    align-items: center;
    color: #666;
    margin: 10px 0;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    padding: 5px;
    font-size: 18px;
}
`;
document.head.appendChild(styleSheet);

// Create and show overlay
function createAnalyzerOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'privacy-analyzer-overlay';
    
    overlay.innerHTML = `
        <div class="close-button">×</div>
        <h2 style="margin-top: 0; color: #333;">Privacy Policy Analyzer</h2>
        <div class="loading-text">
            <div class="loader"></div>
            <span>Analyzing privacy policy...</span>
        </div>
    `;

    // Add close button handler
    overlay.querySelector('.close-button').onclick = () => overlay.remove();
    
    document.body.appendChild(overlay);
    return overlay;
}

// Update overlay with analysis
function updateOverlayContent(overlay, analysis) {
    const content = overlay.querySelector('.loading-text');
    content.innerHTML = `
        <div style="white-space: pre-line; line-height: 1.5;">
            ${analysis}
        </div>
    `;
}

// Update main execution
window.addEventListener('load', () => {
    setTimeout(async () => {
        console.log('Starting privacy policy analysis...');
        
        // Create overlay first
        const overlay = createAnalyzerOverlay();
        
        // Get and analyze content
        const content = extractPrivacyContent();
        const analysis = await analyzePrivacyPolicy(content.fullText);
        
        if (analysis) {
            console.log('Analysis complete, updating overlay');
            updateOverlayContent(overlay, analysis);
        } else {
            updateOverlayContent(overlay, 'Failed to analyze privacy policy');
        }
    }, 1500);
});