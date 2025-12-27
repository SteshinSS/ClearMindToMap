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

export function initTyping(container, input, onStart) {
  textContainer = container;
  hiddenInput = input;
  onSessionStart = onStart;

  // Handle character input
  hiddenInput.addEventListener('keypress', handleKeypress);

  // Handle special keys (Enter, Backspace)
  hiddenInput.addEventListener('keydown', handleKeydown);

  // Focus input when clicking on the container or document
  document.addEventListener('click', (e) => {
    // Don't steal focus from other inputs
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      focusInput();
    }
  });

  // Initial focus
  setTimeout(focusInput, 100);
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
  const containerWidth = textContainer.offsetWidth;

  // Capture positions from the RIGHT edge (for right-aligned text stability)
  const positions = [];
  spans.forEach(span => {
    // Distance from right edge = containerWidth - offsetLeft - spanWidth
    const rightPos = containerWidth - span.offsetLeft - span.offsetWidth;
    positions.push({
      span,
      right: rightPos
    });
  });

  // Apply absolute positioning using 'right' to keep text stable
  positions.forEach(({ span, right }) => {
    span.style.position = 'absolute';
    span.style.right = `${right}px`;
    span.style.left = 'auto';

    // Use margin-top for upward animation
    const currentMargin = parseInt(span.style.marginTop) || 0;
    span.style.marginTop = `${currentMargin - 50}px`;
  });
}

export function clearDisplay() {
  if (textContainer) {
    textContainer.innerHTML = '';
  }
}
