// content/content.js
console.log('Content script loaded');

// Example: Highlight all paragraphs on the page
const paragraphs = document.querySelectorAll('p');
paragraphs.forEach(p => {
  p.style.backgroundColor = 'yellow';
});