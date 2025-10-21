/**
 * ScreenManager - Coordinates all screen rendering operations
 */

class ScreenManager {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.currentScreen = 'black';
    
    // Initialize screen components
    this.bootScreen = new BootScreen(this.screenElement);
    this.homeScreen = new HomeScreen(this.screenElement);
    this.dialerScreen = new DialerScreen(this.screenElement);
    this.powerOffScreen = new PowerOffScreen(this.screenElement);
  }

  /**
   * Clear screen to black
   */
  clear() {
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background: #000; width: 100%; height: 100%;"></div>
    `;
    this.currentScreen = 'black';
  }

  /**
   * Render black screen (powered off state)
   */
  renderBlackScreen() {
    this.clear();
  }

  /**
   * Render boot animation
   * @param {string} videoSrc - Path to boot video
   * @returns {Promise<void>}
   */
  async renderBootAnimation(videoSrc) {
    this.currentScreen = 'boot';
    return await this.bootScreen.playBootAnimation(videoSrc);
  }

  /**
   * Render home screen
   * @param {Object} data - Home screen data
   */
  renderHomeScreen(data) {
    this.currentScreen = 'home';
    this.homeScreen.render(data);
  }

  /**
   * Render dialer screen
   * @param {string} dialedNumber - Currently dialed number
   */
  renderDialerScreen(dialedNumber = '') {
    this.currentScreen = 'dialer';
    this.dialerScreen.render(dialedNumber);
  }

  /**
   * Add digit to dialer
   * @param {string} digit - Digit to add
   */
  addDialerDigit(digit) {
    if (this.currentScreen === 'dialer') {
      this.dialerScreen.addDigit(digit);
    }
  }

  /**
   * Remove last digit from dialer
   */
  removeDialerDigit() {
    if (this.currentScreen === 'dialer') {
      this.dialerScreen.removeDigit();
    }
  }

  /**
   * Get current dialed number
   * @returns {string} Current dialed number
   */
  getDialedNumber() {
    return this.dialerScreen ? this.dialerScreen.getDialedNumber() : '';
  }

  /**
   * Render power-off animation
   * @returns {Promise<void>}
   */
  async renderPowerOffAnimation() {
    this.currentScreen = 'poweroff';
    return await this.powerOffScreen.playFadeOut();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScreenManager;
} else {
  window.ScreenManager = ScreenManager;
}
