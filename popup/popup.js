document.getElementById('send-button').addEventListener('click', async function() {
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