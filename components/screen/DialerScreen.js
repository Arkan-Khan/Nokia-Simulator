/**
 * DialerScreen - Renders the dialer interface with white background
 */

class DialerScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.number = '';
  }

  render(initialDigit = '') {
    // If rendering with an initial digit (i.e., starting from Home), start fresh
    if (initialDigit) {
      this.number = '';
      this.addDigit(initialDigit);
      return; // addDigit will re-render
    }
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000; color:#fff;">
        <div class="dialer-status-bar">
          <div class="dialer-signal">📶</div>
          <div class="dialer-time">${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}</div>
          <div class="dialer-battery">🔋</div>
        </div>
        <div class="dialer-content">
          <div class="dialed-number">${this.number}</div>
        </div>
        <div class="dialer-soft-keys">
          <div class="soft-key">Call</div>
          <div class="soft-key"></div>
          <div class="soft-key">Back</div>
        </div>
      </div>`;
  }

  addDigit(d) {
    if (this.number.length < 18) this.number += d;
    this.render();
  }

  removeDigit() {
    if (this.number.length > 0) this.number = this.number.slice(0, -1);
    this.render();
  }

  getDialedNumber() {
    return this.number;
  }

  setNumber(num) {
    this.number = String(num || '');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DialerScreen;
} else {
  window.DialerScreen = DialerScreen;
}