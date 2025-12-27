// Session state management

export const session = {
  log: [],           // Array of completed lines
  currentLine: '',   // Current line being typed
  startTime: null,   // Session start timestamp
  isActive: false,   // Whether a session is in progress
};

// Timer setting (seconds before text fades)
const DEFAULT_TIMER = 10;

export function getTimer() {
  return parseInt(localStorage.getItem('timer')) || DEFAULT_TIMER;
}

export function setTimer(value) {
  localStorage.setItem('timer', value);
}

// API Key management
export function getApiKey() {
  return localStorage.getItem('openai_api_key') || '';
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem('openai_api_key', key);
  } else {
    localStorage.removeItem('openai_api_key');
  }
}

// Session actions
export function startSession() {
  session.startTime = new Date();
  session.isActive = true;
}

export function addCharacter(char) {
  session.currentLine += char;
}

export function removeLastCharacter() {
  session.currentLine = session.currentLine.slice(0, -1);
}

export function commitLine() {
  if (session.currentLine.trim()) {
    session.log.push(session.currentLine);
    session.currentLine = '';
  }
}

export function getSessionText() {
  // Include current line if not empty
  const lines = [...session.log];
  if (session.currentLine.trim()) {
    lines.push(session.currentLine);
  }
  return lines.join('\n');
}

export function getSessionDuration() {
  if (!session.startTime) return '0:00';
  const duration = Math.floor((new Date() - session.startTime) / 1000);
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getLineCount() {
  return session.log.length + (session.currentLine.trim() ? 1 : 0);
}

export function resetSession() {
  session.log = [];
  session.currentLine = '';
  session.startTime = null;
  session.isActive = false;
}
