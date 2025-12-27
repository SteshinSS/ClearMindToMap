// Typing view - handles text display and fade effect

import {
  session,
  getTimer,
  addCharacter,
  removeLastCharacter,
  commitLine,
  startSession
} from './session.js';

let textContainer = null;
let hiddenInput = null;
let onSessionStart = null;
let hintElement = null;

export function initTyping(container, input, onStart) {
  textContainer = container;
  hiddenInput = input;
  onSessionStart = onStart;
  hintElement = document.getElementById('hint');

  // Handle character input
  hiddenInput.addEventListener('keypress', handleKeypress);

  // Handle special keys (Enter, Backspace)
  hiddenInput.addEventListener('keydown', handleKeydown);

  // Handle focus/blur for hint
  hiddenInput.addEventListener('focus', handleFocus);
  hiddenInput.addEventListener('blur', handleBlur);

  // Focus input when clicking on the container or document
  document.addEventListener('click', (e) => {
    // Don't steal focus from other inputs
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      focusInput();
    }
  });
}

function handleFocus() {
  // Hide hint when focused
  if (hintElement) {
    hintElement.classList.add('hidden');
  }
}

function handleBlur() {
  // Show hint again if no text has been typed
  if (hintElement && !session.isActive) {
    hintElement.classList.remove('hidden');
  }
}

export function focusInput() {
  if (hiddenInput) {
    hiddenInput.focus();
  }
}

function handleKeypress(e) {
  // Ignore if modifier keys are pressed
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // Only handle printable characters
  if (e.charCode === 0) return;

  e.preventDefault();

  const char = String.fromCharCode(e.charCode);

  // Add to session
  addCharacter(char);

  // Start session on first character
  if (!session.isActive) {
    startSession();
    if (onSessionStart) onSessionStart();
  }

  // Display the character
  displayCharacter(char);
}

function handleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();

    // Move existing text up visually
    moveTextUp();

    // Commit current line to session
    commitLine();

  } else if (e.key === 'Backspace') {
    e.preventDefault();

    // Remove last character from display
    const lastSpan = textContainer.querySelector('span:last-child');
    if (lastSpan) {
      lastSpan.remove();
    }

    // Remove from session
    removeLastCharacter();
  }
}

function displayCharacter(char) {
  const span = document.createElement('span');
  // Use non-breaking space for regular spaces to prevent collapse
  span.innerHTML = char === ' ' ? '&nbsp;' : char;
  span.className = 'letter';
  textContainer.appendChild(span);

  // Schedule fade out
  const fadeDelay = getTimer() * 1000;

  setTimeout(() => {
    span.classList.add('fading');

    // Remove after fade animation completes
    setTimeout(() => {
      span.remove();
    }, 1000); // Match CSS transition duration
  }, fadeDelay);
}

function moveTextUp() {
  const spans = textContainer.querySelectorAll('span');
  const containerRect = textContainer.getBoundingClientRect();

  // Capture positions using getBoundingClientRect for precision
  const positions = [];
  spans.forEach(span => {
    const rect = span.getBoundingClientRect();
    // Distance from left edge of container
    const leftPos = rect.left - containerRect.left;
    // Distance from top of container
    const topPos = rect.top - containerRect.top;
    positions.push({
      span,
      left: leftPos,
      top: topPos
    });
  });

  // Apply absolute positioning preserving exact positions
  positions.forEach(({ span, left, top }) => {
    span.style.position = 'absolute';
    span.style.left = `${left}px`;
    span.style.top = `${top}px`;
    span.style.right = 'auto';
  });

  // Force reflow so browser registers initial positions
  textContainer.offsetHeight;

  // Now animate upward
  positions.forEach(({ span, top }) => {
    span.style.top = `${top - 50}px`;
  });
}

export function clearDisplay() {
  if (textContainer) {
    textContainer.innerHTML = '';
  }
}
