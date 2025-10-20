/**
 * Logger - Console logging with meaningful prefixes for debugging
 */

const Logger = {
  /**
   * Log boot-related messages
   * @param {string} message - Log message
   */
  boot(message) {
    console.log(`[BOOT] ${message}`);
  },

  /**
   * Log audio-related messages
   * @param {string} message - Log message
   */
  audio(message) {
    console.log(`[AUDIO] ${message}`);
  },

  /**
   * Log state-related messages
   * @param {string} message - Log message
   */
  state(message) {
    console.log(`[STATE] ${message}`);
  },

  /**
   * Log keypad-related messages
   * @param {string} message - Log message
   */
  keypad(message) {
    console.log(`[KEYPAD] ${message}`);
  },

  /**
   * Log error messages
   * @param {string} module - Module name
   * @param {Error} error - Error object
   */
  error(module, error) {
    console.error(`[${module.toUpperCase()}] Error:`, error);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
} else {
  window.Logger = Logger;
}
