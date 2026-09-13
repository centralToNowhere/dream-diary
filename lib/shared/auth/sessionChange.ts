const SESSION_CHANGE_EVENT = 'auth:session-change';

export function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function subscribeToSessionChange(listener: () => void) {
  window.addEventListener(SESSION_CHANGE_EVENT, listener);
  return () => window.removeEventListener(SESSION_CHANGE_EVENT, listener);
}
