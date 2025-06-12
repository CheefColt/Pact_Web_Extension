// privacy-content.js
console.log('[Content] Script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Content] Received message:', request);

    switch (request.action) {
        case 'findPrivacyPolicy':
            findPrivacyPolicyLink()
                .then(link => {
                    console.log('[Content] Found privacy policy link:', link);
                    sendResponse({ success: true, link });
                })
                .catch(error => {
                    console.error('[Content] Error finding privacy policy:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Will send response asynchronously

        case 'getPrivacyContent':
            extractPrivacyPolicyContent()
                .then(content => {
                    console.log('[Content] Extracted content length:', content.length);
                    sendResponse({ success: true, content });
                })
                .catch(error => {
                    console.error('[Content] Error extracting content:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Will send response asynchronously

        default:
            console.warn('[Content] Unknown action:', request.action);
            sendResponse({ success: false, error: 'Unknown action' });
            return false;
    }
});

// Function to find privacy policy link
async function findPrivacyPolicyLink() {
    const privacyKeywords = ['privacy', 'privacy policy', 'privacy notice', 'data protection'];
    let links = Array.from(document.getElementsByTagName('a'));
    
    // Sort links by relevance
    links.sort((a, b) => {
        const aText = (a.textContent || '').toLowerCase();
        const bText = (b.textContent || '').toLowerCase();
        const aRelevance = privacyKeywords.some(keyword => aText.includes(keyword)) ? 1 : 0;
        const bRelevance = privacyKeywords.some(keyword => bText.includes(keyword)) ? 1 : 0;
        return bRelevance - aRelevance;
    });

    // Find the most relevant privacy policy link
    for (const link of links) {
        const text = (link.textContent || '').toLowerCase();
        const href = link.href || '';
        
        if (privacyKeywords.some(keyword => text.includes(keyword)) ||
            privacyKeywords.some(keyword => href.includes(keyword))) {
            return link.href;
        }
    }

    throw new Error('No privacy policy link found on this page');
}

// Function to extract privacy policy content
async function extractPrivacyPolicyContent() {
    // Try to find the main content container
    const possibleContainers = [
        document.querySelector('main'),
        document.querySelector('article'),
        document.querySelector('.content'),
        document.querySelector('.main-content'),
        document.querySelector('#content'),
        document.querySelector('#main'),
        document.body
    ].filter(Boolean);

    if (possibleContainers.length === 0) {
        throw new Error('Could not find content container');
    }

    // Get the container with the most relevant content
    const container = possibleContainers.reduce((best, current) => {
        const currentText = current.textContent || '';
        const bestText = best.textContent || '';
        return currentText.length > bestText.length ? current : best;
    });

    // Clean up the content
    const content = cleanContent(container);
    if (!content) {
        throw new Error('No content found in the privacy policy page');
    }

    return content;
}

// Helper function to clean up content
function cleanContent(element) {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true);

    // Remove script and style elements
    const unwanted = clone.querySelectorAll('script, style, iframe, img, svg, noscript');
    unwanted.forEach(el => el.remove());

    // Get text content and clean it up
    let text = clone.textContent || '';
    text = text
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim();               // Remove leading/trailing whitespace

    return text;
}