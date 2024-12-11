// content.js

console.log('Content script loaded');

// Find privacy policy link
function findPrivacyPolicyLink() {
  const patterns = [/privacy\s*policy/i, /privacy/i];
  const links = Array.from(document.getElementsByTagName('a'));
  return links.find(link => 
    patterns.some(p => p.test(link.textContent) || p.test(link.href))
  )?.href;
}

// Simple content extraction
function getPageContent() {
  const paragraphs = Array.from(document.getElementsByTagName('p'))
    .map(p => p.textContent.trim())
    .filter(text => text.length > 0);
  
  console.log(`Found ${paragraphs.length} paragraphs`);
  return paragraphs.join('\n\n');
}

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.action);
  
  if (request.action === "findPrivacyPolicy") {
    const link = findPrivacyPolicyLink();
    console.log('Found link:', link);
    sendResponse({link});
  }
  
  if (request.action === "getContent") {
    const content = getPageContent();
    console.log('Content length:', content.length);
    sendResponse({content});
  }
  
  return true;
});