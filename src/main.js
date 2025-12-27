// Main entry point - wires everything together

import './style.css';
import {
  getApiKey,
  setApiKey,
  getSessionText,
  resetSession,
  session
} from './session.js';
import { initTyping, clearDisplay, focusInput } from './typing.js';
import { analyzeSession } from './openai.js';
import { renderMindMap, clearMindMap } from './mindmap.js';

// DOM Elements
const typingView = document.getElementById('typing-view');
const mindmapView = document.getElementById('mindmap-view');
const textContainer = document.getElementById('text-container');
const hiddenInput = document.getElementById('hidden-input');
const apiKeyInput = document.getElementById('api-key-input');
const apiKeySaved = document.getElementById('api-key-saved');
const endSessionBtn = document.getElementById('end-session-btn');
const newSessionBtn = document.getElementById('new-session-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const hintEl = document.getElementById('hint');
const mindmapSvg = document.getElementById('mindmap-svg');
const copyMindmapBtn = document.getElementById('copy-mindmap-btn');

// Store current mindmap markdown for copying
let currentMarkdown = '';

// Initialize
function init() {
  // Load saved API key
  const savedKey = getApiKey();
  if (savedKey) {
    apiKeyInput.value = savedKey;
    showApiKeySaved();
  }

  // API key handlers
  apiKeyInput.addEventListener('input', handleApiKeyChange);
  apiKeyInput.addEventListener('blur', () => {
    handleApiKeyChange();
    focusInput();
  });

  // Button handlers
  endSessionBtn.addEventListener('click', handleEndSession);
  newSessionBtn.addEventListener('click', handleNewSession);
  copyMindmapBtn.addEventListener('click', handleCopyMarkdown);

  // Initialize typing
  initTyping(textContainer, hiddenInput, handleSessionStart);
}

// API Key handling
function handleApiKeyChange() {
  const key = apiKeyInput.value.trim();
  setApiKey(key);

  if (key) {
    showApiKeySaved();
  } else {
    hideApiKeySaved();
  }
}

function showApiKeySaved() {
  apiKeyInput.classList.add('saved');
  apiKeySaved.classList.add('visible');
}

function hideApiKeySaved() {
  apiKeyInput.classList.remove('saved');
  apiKeySaved.classList.remove('visible');
}

// Session handling
function handleSessionStart() {
  hintEl.classList.add('hidden');
  endSessionBtn.classList.add('visible');
}

async function handleEndSession() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showError('Please enter your OpenAI API key');
    apiKeyInput.focus();
    return;
  }

  const sessionText = getSessionText();

  if (!sessionText.trim()) {
    showError('No thoughts captured yet. Start typing!');
    return;
  }

  // Show loading
  showView('loading');

  try {
    const markdown = await analyzeSession(apiKey, sessionText);
    currentMarkdown = markdown; // Store for copying
    renderMindMap(mindmapSvg, markdown);
    showView('mindmap');
  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'Failed to analyze. Please try again.');
    showView('typing');
  }
}

function handleNewSession() {
  resetSession();
  clearDisplay();
  clearMindMap(mindmapSvg);
  currentMarkdown = ''; // Clear stored markdown
  hintEl.classList.remove('hidden');
  endSessionBtn.classList.remove('visible');
  showView('typing');
  focusInput();
}

// View management
function showView(view) {
  typingView.classList.remove('active');
  mindmapView.classList.remove('active');
  loadingEl.classList.remove('active');

  endSessionBtn.classList.remove('visible');
  newSessionBtn.classList.remove('visible');
  copyMindmapBtn.classList.remove('visible');

  switch (view) {
    case 'typing':
      typingView.classList.add('active');
      if (session.isActive) {
        endSessionBtn.classList.add('visible');
      }
      break;
    case 'mindmap':
      mindmapView.classList.add('active');
      newSessionBtn.classList.add('visible');
      copyMindmapBtn.classList.add('visible');
      break;
    case 'loading':
      loadingEl.classList.add('active');
      break;
  }
}

// Copy markdown to clipboard
async function handleCopyMarkdown() {
  if (!currentMarkdown) return;

  try {
    await navigator.clipboard.writeText(currentMarkdown);
    copyMindmapBtn.textContent = 'Copied!';
    copyMindmapBtn.classList.add('copied');

    setTimeout(() => {
      copyMindmapBtn.textContent = 'Copy Markdown';
      copyMindmapBtn.classList.remove('copied');
    }, 2000);
  } catch (error) {
    showError('Failed to copy to clipboard');
  }
}

// Error handling
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add('visible');

  setTimeout(() => {
    errorEl.classList.remove('visible');
  }, 5000);
}

// Start the app
init();
