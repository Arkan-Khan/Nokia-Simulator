/**
 * ScreenManager - Coordinates all screen rendering operations
 */

class ScreenManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.currentScreen = 'black';
    
    // Initialize screen components
    this.bootScreen = new BootScreen(this.ctx);
    this.homeScreen = new HomeScreen(this.ctx);
    this.powerOffScreen = new PowerOffScreen(this.ctx);
    this.lockScreen = new LockScreen(this.ctx);
    this.dialerScreen = new DialerScreen(this.ctx);
  }

  /**
   * Clear screen to black
   */
  clear() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, 240, 320);
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
   * Render power-off animation
   * @returns {Promise<void>}
   */
  async renderPowerOffAnimation() {
    this.currentScreen = 'poweroff';
    return await this.powerOffScreen.playFadeOut();
  }

  /**
   * Render lock screen
   */
  renderLockScreen() {
    this.currentScreen = 'locked';
    this.lockScreen.render();
  }

  /**
   * Render dialer screen
   * @param {HTMLImageElement|null} wallpaper - Wallpaper image
   */
  renderDialerScreen(wallpaper) {
    this.currentScreen = 'dialer';
    this.dialerScreen.render(wallpaper);
  }

  /**
   * Get lock screen instance
   * @returns {LockScreen}
   */
  getLockScreen() {
    return this.lockScreen;
  }

  /**
   * Get dialer screen instance
   * @returns {DialerScreen}
   */
  getDialerScreen() {
    return this.dialerScreen;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScreenManager;
} else {
  window.ScreenManager = ScreenManager;
}
