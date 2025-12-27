// Main entry point - wires everything together

import './style.css';
import {
  getApiKey,
  setApiKey,
  getSessionText,
  getSessionDuration,
  getLineCount,
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
const sessionInfoEl = document.getElementById('session-info');
const mindmapSvg = document.getElementById('mindmap-svg');

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

  // Initialize typing
  initTyping(textContainer, hiddenInput, handleSessionStart);

  // Update session info periodically
  setInterval(updateSessionInfo, 1000);
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

function updateSessionInfo() {
  if (session.isActive) {
    sessionInfoEl.textContent = `${getSessionDuration()} | ${getLineCount()} lines`;
  }
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
  hintEl.classList.remove('hidden');
  endSessionBtn.classList.remove('visible');
  sessionInfoEl.textContent = '';
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
      break;
    case 'loading':
      loadingEl.classList.add('active');
      break;
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
