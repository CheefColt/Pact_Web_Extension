// background.js

// Log when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Extension] Installed/Updated');
});

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
        console.log('Content preview:', message.content.substring(0, 100) + '...');
        console.log('Content length:', message.content.length);
      }
      break;
      
    default:
      console.log(`[Tab ${tabId}]`, message);
  }

  // Log any errors
  if (message.error) {
    console.error(`[Tab ${tabId}] Error:`, message.error);
  }

  return true;
});

// Log extension lifecycle
console.log('[Extension] Background script loaded');