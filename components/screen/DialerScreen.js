/**
 * DialerScreen - Handles dialer functionality with number input
 */

class DialerScreen {
  constructor(ctx) {
    this.ctx = ctx;
    this.phoneNumber = '';
    this.maxDigits = 15; // Maximum phone number length
  }

  /**
   * Render dialer screen with wallpaper and number display
   * @param {HTMLImageElement|null} wallpaper - Wallpaper image
   */
  render(wallpaper) {
    // Draw wallpaper or blue background
    if (wallpaper) {
      this.ctx.drawImage(wallpaper, 0, 0, 240, 320);
    } else {
      this.ctx.fillStyle = '#1a5fb4';
      this.ctx.fillRect(0, 0, 240, 320);
    }
    
    // Draw number display area
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 20, 220, 60);
    
    // Draw phone number
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'normal 24px "Nokia Sans", Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.phoneNumber || 'Enter number', 120, 50);
    
    // Draw call button (green)
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(20, 100, 80, 40);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'normal 16px "Nokia Sans", Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Call', 60, 120);
    
    // Draw clear button (red)
    this.ctx.fillStyle = '#f44336';
    this.ctx.fillRect(140, 100, 80, 40);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'normal 16px "Nokia Sans", Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Clear', 180, 120);
    
    // Draw soft key labels
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'normal 16px "Nokia Sans", Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Back', 10, 310);
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Dialer', 120, 310);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('Lock', 230, 310);
  }

  /**
   * Add digit to phone number
   * @param {string} digit - Digit to add
   */
  addDigit(digit) {
    if (this.phoneNumber.length < this.maxDigits) {
      this.phoneNumber += digit;
    }
  }

  /**
   * Clear phone number
   */
  clearNumber() {
    this.phoneNumber = '';
  }

  /**
   * Remove last digit
   */
  backspace() {
    if (this.phoneNumber.length > 0) {
      this.phoneNumber = this.phoneNumber.slice(0, -1);
    }
  }

  /**
   * Get current phone number
   * @returns {string}
   */
  getPhoneNumber() {
    return this.phoneNumber;
  }

  /**
   * Reset dialer state
   */
  reset() {
    this.phoneNumber = '';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DialerScreen;
} else {
  window.DialerScreen = DialerScreen;
}
