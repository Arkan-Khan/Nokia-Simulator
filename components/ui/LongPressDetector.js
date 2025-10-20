/**
 * LongPressDetector - Detects long press (3 seconds) on elements for both mouse and touch
 */

class LongPressDetector {
  constructor(element, callback, duration = 3000) {
    this.element = element;
    this.callback = callback;
    this.duration = duration;
    this.timer = null;
    this.isPressed = false;
    
    this.setupListeners();
  }

  setupListeners() {
    // Mouse events
    this.element.addEventListener('mousedown', (e) => this.onPressStart(e));
    this.element.addEventListener('mouseup', () => this.onPressEnd());
    this.element.addEventListener('mouseleave', () => this.onPressEnd());
    
    // Touch events
    this.element.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent context menu
      this.onPressStart(e);
    }, { passive: false });
    
    this.element.addEventListener('touchend', () => this.onPressEnd());
    this.element.addEventListener('touchcancel', () => this.onPressEnd());
  }

  onPressStart(event) {
    if (this.isPressed) return; // Prevent double-trigger
    
    this.isPressed = true;
    console.log('[LONGPRESS] Started');
    
    this.timer = setTimeout(() => {
      console.log('[LONGPRESS] Triggered after 3 seconds');
      this.callback();
      this.isPressed = false;
    }, this.duration);
  }

  onPressEnd() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.isPressed) {
      console.log('[LONGPRESS] Cancelled (released early)');
      this.isPressed = false;
    }
  }

  destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isPressed = false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LongPressDetector;
} else {
  window.LongPressDetector = LongPressDetector;
}
