/**
 * ButtonHandler - Handles keypad interaction with audio and visual feedback
 */

class ButtonHandler {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.buttonStates = new Map(); // Track button press states
    this.setupButtonListeners();
  }

  /**
   * Setup button event listeners
   */
  setupButtonListeners() {
    document.querySelectorAll('.button').forEach(button => {
      const key = button.getAttribute('data-key');
      
      // Mouse events
      button.addEventListener('mousedown', (e) => this.handleButtonPress(e, key));
      button.addEventListener('mouseup', (e) => this.handleButtonRelease(e, key));
      button.addEventListener('mouseleave', (e) => this.handleButtonRelease(e, key));
      
      // Touch events
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleButtonPress(e, key);
      }, { passive: false });
      
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleButtonRelease(e, key);
      }, { passive: false });
      
      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this.handleButtonRelease(e, key);
      }, { passive: false });
    });
  }

  /**
   * Handle button press
   * @param {Event} event - Button press event
   * @param {string} key - Button key
   */
  handleButtonPress(event, key) {
    if (this.buttonStates.get(key)) return; // Already pressed
    
    this.buttonStates.set(key, true);
    
    // Visual feedback
    event.target.style.opacity = '0.6';
    event.target.style.transform = 'scale(0.95)';
    
    // Audio feedback (no delay for rapid clicks)
    this.playKeyclick();
    
    // Trigger custom event for other components
    const customEvent = new CustomEvent('buttonPress', {
      detail: { key, event }
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Handle button release
   * @param {Event} event - Button release event
   * @param {string} key - Button key
   */
  handleButtonRelease(event, key) {
    if (!this.buttonStates.get(key)) return; // Not pressed
    
    this.buttonStates.set(key, false);
    
    // Reset visual feedback
    event.target.style.opacity = '1';
    event.target.style.transform = 'scale(1)';
  }

  /**
   * Play keyclick sound with optimized handling for rapid clicks
   */
  playKeyclick() {
    if (this.audioManager.isLoaded('keyclick')) {
      // Clone audio for rapid successive plays
      const originalAudio = this.audioManager.getAsset('keyclick');
      if (originalAudio) {
        const audio = originalAudio.cloneNode();
        audio.currentTime = 0;
        audio.volume = 0.7; // Slightly lower volume for keyclicks
        audio.play().catch(() => {
          // Silently fail for keyclicks
        });
      }
    }
  }

  /**
   * Get button element by key
   * @param {string} key - Button key
   * @returns {HTMLElement|null}
   */
  getButton(key) {
    return document.querySelector(`[data-key="${key}"]`);
  }

  /**
   * Simulate button press programmatically
   * @param {string} key - Button key
   */
  simulatePress(key) {
    const button = this.getButton(key);
    if (button) {
      this.handleButtonPress({ target: button }, key);
      setTimeout(() => {
        this.handleButtonRelease({ target: button }, key);
      }, 100);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ButtonHandler;
} else {
  window.ButtonHandler = ButtonHandler;
}
