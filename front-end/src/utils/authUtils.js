/**
 * Verifies the OAuth state parameter to prevent CSRF attacks
 * @param {string} state - The state parameter from the OAuth callback
 * @throws {Error} If state verification fails
 */
export function verifyOAuthState(state) {
  // Get stored state from localStorage
  const storedState = localStorage.getItem('oauth_state');
  
  // Clear the stored state immediately to prevent reuse
  localStorage.removeItem('oauth_state');
  
  if (!storedState) {
    throw new Error('No stored state found');
  }
  
  if (state !== storedState) {
    throw new Error('State mismatch');
  }
}

/**
 * Generates a secure random state parameter for OAuth
 * @returns {string} A secure random state string
 */
export function generateOAuthState() {
  // Generate a random string of 32 characters
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const state = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Store the state in localStorage
  localStorage.setItem('oauth_state', state);
  
  return state;
}

/**
 * Cleans up OAuth state from localStorage
 */
export function cleanupOAuthState() {
  localStorage.removeItem('oauth_state');
}

// Generate a random string for OAuth state parameter
export const generateRandomString = (length) => {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}; 