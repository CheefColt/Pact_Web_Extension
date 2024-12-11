// popup.js - Consolidated version
document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const container = document.querySelector('.container');

  // Create privacy policy button once
  const existingBtn = document.getElementById('findPrivacy');
  if (!existingBtn) {
    const findPrivacyBtn = document.createElement('button');
    findPrivacyBtn.id = 'findPrivacy';
    findPrivacyBtn.textContent = 'Find Privacy Policy';
    findPrivacyBtn.style.marginBottom = '10px';
    container.insertBefore(findPrivacyBtn, chatBox);

    // Add click handler
    findPrivacyBtn.addEventListener('click', async () => {
      try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "findPrivacyPolicy"
        });

        if (response?.link) {
          console.log('Navigating to:', response.link);
          const newTab = await chrome.tabs.create({ url: response.link });

          // Wait for page load
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === newTab.id && info.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              
              setTimeout(async () => {
                console.log('Extracting content...');
                chrome.tabs.sendMessage(newTab.id, {
                  action: "extractContent"
                });

                // After navigation, get content
                const content = await chrome.tabs.sendMessage(newTab.id, {
                  action: "getPrivacyContent"
                });

                // Process in chunks
                const chunks = chunkContent(content);
                const summaries = [];

                // Show progress
                const message = document.createElement('div');
                message.textContent = `Processing ${chunks.length} sections...`;
                chatBox.appendChild(message);

                // Process each chunk
                for (const chunk of chunks) {
                  const summary = await summarizeChunk(chunk);
                  summaries.push(summary);
                }

                // Display final summary
                const finalSummary = summaries.join('\n\n');
                const summaryElement = document.createElement('div');
                summaryElement.textContent = finalSummary;
                chatBox.appendChild(summaryElement);
              }, 1000); // Small delay to ensure DOM is ready
            }
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }

  // Chat functionality
  sendButton.addEventListener('click', async function() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;

    const chatBox = document.getElementById('chat-box');
    
    // Create user message element
    const userMessage = document.createElement('div');
    userMessage.textContent = 'You: ' + userInput;
    userMessage.style.color = 'blue';
    chatBox.appendChild(userMessage);

    // Clear the input field
    document.getElementById('user-input').value = '';

    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;

    // Fetch response from Gemini API
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
              text: userInput
            }]
          }]
        })
      });

      const data = await response.json();
      const botResponse = data.candidates[0].content.parts[0].text;

      // Create bot message element
      const botMessage = document.createElement('div');
      botMessage.textContent = 'Bot: ' + botResponse;
      botMessage.style.color = 'green';
      chatBox.appendChild(botMessage);

      // Scroll to the bottom of the chat box
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
      console.error('Error fetching response from Gemini API:', error);
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Bot: Sorry, something went wrong.';
      errorMessage.style.color = 'red';
      chatBox.appendChild(errorMessage);
    }
  });
});

// popup.js
function chunkContent(text, size = 5000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// popup.js
async function summarizeChunk(chunk) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': 'AIzaSyDj--K6qjcy4MZ0Acc_hbUMGvcitMOUPTQ'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Summarize this privacy policy text in key points:\n${chunk}`
        }]
      }]
    })
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}