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
    this.menuScreen = new MenuScreen(this.screenElement);
    this.dialerScreen = new DialerScreen(this.screenElement);
    this.powerOffScreen = new PowerOffScreen(this.screenElement);
    this.calculatorScreen = new CalculatorScreen(this.screenElement);
    this.cameraScreen = new CameraScreen(this.screenElement);
    this.galleryScreen = new GalleryScreen(this.screenElement);
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
   * Render menu screen
   * @param {string} wallpaperSrc - Wallpaper background
   */
  renderMenuScreen(wallpaperSrc = null) {
    this.currentScreen = 'menu';
    this.menuScreen.render(wallpaperSrc);
  }

  /**
   * Navigate menu in direction
   * @param {string} direction - 'up', 'down', 'left', 'right'
   */
  navigateMenu(direction) {
    if (this.currentScreen === 'menu') {
      this.menuScreen.navigate(direction);
    }
  }

  /**
   * Get current focused app in menu
   */
  getCurrentMenuApp() {
    return this.menuScreen ? this.menuScreen.getCurrentApp() : null;
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
   * Render calculator
   */
  renderCalculator() {
    this.currentScreen = 'calculator';
    this.calculatorScreen.render();
  }

  calculatorAddDigit(d) {
    if (this.currentScreen === 'calculator') this.calculatorScreen.addDigit(d);
  }

  calculatorNavigate(dir) {
    if (this.currentScreen === 'calculator') this.calculatorScreen.navigateOperator(dir);
  }

  calculatorEquals() {
    if (this.currentScreen === 'calculator') this.calculatorScreen.equals();
  }

  // Camera
  renderCamera() {
    this.currentScreen = 'camera';
    return this.cameraScreen.render();
  }
  stopCamera() {
    this.cameraScreen.stopPreview();
  }
  capturePhoto() {
    return this.cameraScreen.capture();
  }

  // Gallery
  renderGalleryList() {
    this.currentScreen = 'gallery';
    this.galleryScreen.renderList();
  }
  galleryNavigate(dir) {
    this.galleryScreen.navigate(dir);
  }
  galleryOpen() {
    this.galleryScreen.renderImage();
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
