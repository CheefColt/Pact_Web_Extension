// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const extractButton = document.getElementById('extractButton');
    const privacyButton = document.getElementById('privacyButton');
    const analyzeButton = document.getElementById('analyzeButton');
    const analysisLevel = document.getElementById('analysisLevel');
    const statusDiv = document.getElementById('status');
    const outputDiv = document.getElementById('output');
    const loadingDiv = document.getElementById('loading');

    let currentPrivacyPolicy = null;
    let currentTab = null;

    function showStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = type;
    }

    function showLoading(show) {
        loadingDiv.style.display = show ? 'flex' : 'none';
        analyzeButton.disabled = show;
        privacyButton.disabled = show;
        extractButton.disabled = show;
    }

    function showAnalysisControls(show) {
        analyzeButton.style.display = show ? 'block' : 'none';
        analysisLevel.style.display = show ? 'block' : 'none';
    }

    function formatAnalysisResult(text) {
        // Split into sections based on numbered headings
        const sections = text.split(/(?=\d+\.)/);
        
        // Process each section
        const formattedSections = sections.map(section => {
            // Skip empty sections
            if (!section.trim()) return '';

            // Convert numbered lists to HTML
            section = section.replace(/^\d+\.\s+/gm, '<h1>') // Main headings
                           .replace(/([A-Z\s&]{2,}:)/g, '<h2>$1</h2>') // Subheadings
                           .replace(/(?:^|\n)[-•]\s+([^\n]+)/g, '<li>$1</li>') // List items
                           .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>'); // Wrap lists

            return section;
        });

        return `<div class="analysis-result">${formattedSections.join('')}</div>`;
    }

    async function getPageContent(tabId) {
        try {
            const [{result}] = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    // Helper function to clean text
                    function cleanText(text) {
                        return text
                            .replace(/\s+/g, ' ')
                            .replace(/\n+/g, '\n')
                            .trim();
                    }

                    // Try to find the main content
                    const selectors = [
                        'main',
                        'article',
                        '.privacy-policy',
                        '.privacy',
                        '#privacy-policy',
                        '#privacy',
                        '.legal',
                        '#legal',
                        '.content',
                        '.main-content',
                        '#content',
                        '#main-content',
                        '.container',
                        '#container',
                        'body'
                    ];

                    for (const selector of selectors) {
                        const elements = document.querySelectorAll(selector);
                        for (const element of elements) {
                            const text = cleanText(element.innerText);
                            if (text.length > 500) {
                                return text;
                            }
                        }
                    }

                    return cleanText(document.body.innerText);
                }
            });
            return result;
        } catch (error) {
            console.error('Error getting page content:', error);
            throw new Error('Failed to extract page content');
        }
    }

    async function findPrivacyPolicy() {
        try {
            showLoading(true);
            showStatus('Searching for privacy policy...', 'info');
            outputDiv.textContent = '';
            currentPrivacyPolicy = null;
            showAnalysisControls(false);

            // Get the active tab
            [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!currentTab) {
                throw new Error('Could not access the current tab');
            }

            // Execute script to find privacy policy
            const [{result}] = await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: () => {
                    const patterns = [
                        'privacy policy',
                        'privacy notice',
                        'privacy statement',
                        'data protection',
                        'data privacy',
                        'privacy',
                        'gdpr',
                        'ccpa'
                    ];

                    // First check if we're already on a privacy policy page
                    const currentUrl = window.location.href.toLowerCase();
                    const currentTitle = document.title.toLowerCase();
                    
                    if (patterns.some(p => currentUrl.includes(p) || currentTitle.includes(p))) {
                        return {
                            type: 'current_page'
                        };
                    }

                    // Try to find a privacy policy link
                    const links = Array.from(document.getElementsByTagName('a'));
                    const privacyLinks = links.filter(link => {
                        const text = (link.textContent || '').toLowerCase();
                        const href = (link.href || '').toLowerCase();
                        return patterns.some(pattern => text.includes(pattern) || href.includes(pattern));
                    });

                    if (privacyLinks.length > 0) {
                        // Sort links by relevance
                        privacyLinks.sort((a, b) => {
                            const aText = a.textContent.toLowerCase();
                            const bText = b.textContent.toLowerCase();
                            const aScore = patterns.reduce((score, pattern) => 
                                score + (aText.includes(pattern) ? 1 : 0), 0);
                            const bScore = patterns.reduce((score, pattern) => 
                                score + (bText.includes(pattern) ? 1 : 0), 0);
                            return bScore - aScore;
                        });

                        return {
                            type: 'link',
                            url: privacyLinks[0].href,
                            text: privacyLinks[0].textContent.trim()
                        };
                    }

                    return { type: 'not_found' };
                }
            });

            if (result.type === 'not_found') {
                throw new Error('No privacy policy found on this page');
            }

            if (result.type === 'current_page') {
                showStatus('Found privacy policy on current page', 'success');
                currentPrivacyPolicy = await getPageContent(currentTab.id);
                outputDiv.textContent = currentPrivacyPolicy;
                showAnalysisControls(true);
            } else if (result.type === 'link') {
                showStatus(`Found privacy policy link. Loading content...`, 'info');
                
                // Update the current tab instead of creating a new one
                await chrome.tabs.update(currentTab.id, { url: result.url });

                // Wait for the page to load
                await new Promise((resolve) => {
                    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                        if (tabId === currentTab.id && info.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve();
                        }
                    });
                });

                // Get the content after a short delay to ensure the page is fully loaded
                await new Promise(resolve => setTimeout(resolve, 1000));
                currentPrivacyPolicy = await getPageContent(currentTab.id);

                // Show the content and analysis controls
                showStatus('Privacy policy content loaded', 'success');
                outputDiv.textContent = currentPrivacyPolicy;
                showAnalysisControls(true);
            }

        } catch (error) {
            console.error('Error:', error);
            showStatus(error.message || 'Failed to find privacy policy', 'error');
            showAnalysisControls(false);
        } finally {
            showLoading(false);
        }
    }

    async function extractAllText() {
        try {
            showLoading(true);
            showStatus('Extracting text...', 'info');
            outputDiv.textContent = '';
            currentPrivacyPolicy = null;
            showAnalysisControls(false);

            const content = await getPageContent(currentTab.id);
            outputDiv.textContent = content;
            showStatus('Text extracted successfully!', 'success');

        } catch (error) {
            console.error('Error:', error);
            showStatus(error.message || 'Failed to extract text', 'error');
        } finally {
            showLoading(false);
        }
    }

    async function analyzePrivacyPolicy() {
        if (!currentPrivacyPolicy) {
            showStatus('No privacy policy content to analyze', 'error');
            return;
        }

        try {
            showLoading(true);
            showStatus('Analyzing privacy policy...', 'info');

            // Send analysis request to background script
            const response = await chrome.runtime.sendMessage({
                action: 'analyzePrivacyPolicy',
                text: currentPrivacyPolicy,
                level: analysisLevel.value
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to analyze privacy policy');
            }

            showStatus('Analysis complete!', 'success');
            outputDiv.innerHTML = formatAnalysisResult(response.data.analysis);

        } catch (error) {
            console.error('Analysis failed:', error);
            showStatus(error.message || 'Failed to analyze privacy policy', 'error');
        } finally {
            showLoading(false);
        }
    }

    privacyButton.addEventListener('click', findPrivacyPolicy);
    extractButton.addEventListener('click', extractAllText);
    analyzeButton.addEventListener('click', analyzePrivacyPolicy);
});