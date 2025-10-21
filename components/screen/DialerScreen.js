/**
 * DialerScreen - Renders the dialer interface with white background
 */

class DialerScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.dialedNumber = '';
    this.maxDigits = 18;
  }

  /**
   * Render dialer screen with white background
   * @param {string} dialedNumber - Currently dialed number
   */
  render(dialedNumber = '') {
    this.dialedNumber = dialedNumber;
    
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background: #fff; color: #000;">
        <!-- Status Bar (top) -->
        <div class="dialer-status-bar">
          <div class="dialer-signal">📶</div>
          <div class="dialer-time">${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}</div>
          <div class="dialer-battery">🔋</div>
        </div>
        
        <!-- Dialer Content -->
        <div class="dialer-content">
          <div class="dialed-number">${this.dialedNumber || 'Enter number'}</div>
        </div>
        
        <!-- Soft Keys (bottom) -->
        <div class="dialer-soft-keys">
          <div class="soft-key">Call</div>
          <div class="soft-key">Back</div>
        </div>
      </div>
    `;
  }

  /**
   * Add digit to dialed number
   * @param {string} digit - Digit to add
   */
  addDigit(digit) {
    if (this.dialedNumber.length < this.maxDigits) {
      this.dialedNumber += digit;
      this.render(this.dialedNumber);
    }
  }

  /**
   * Remove last digit
   */
  removeDigit() {
    if (this.dialedNumber.length > 0) {
      this.dialedNumber = this.dialedNumber.slice(0, -1);
      this.render(this.dialedNumber);
    }
  }

  /**
   * Clear all digits
   */
  clearNumber() {
    this.dialedNumber = '';
    this.render('');
  }

  /**
   * Get current dialed number
   * @returns {string} Current dialed number
   */
  getDialedNumber() {
    return this.dialedNumber;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DialerScreen;
} else {
  window.DialerScreen = DialerScreen;
}