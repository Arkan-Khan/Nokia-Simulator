/**
 * BootController - Orchestrates the entire boot system
 * Handles power on/off, state management, and screen transitions
 */

class BootController {
  constructor() {
    this.phoneState = new PhoneState();
    this.audioManager = new AudioManager();
    this.assetLoader = new AssetLoader();
    this.screenManager = null;
    this.timeFormatter = TimeFormatter;
    this.timeUpdateInterval = null;
    
    // Asset paths
    this.assets = {
      bootVideo: 'assets/boot/Boot video.mp4',
      bootAudio: 'assets/boot/nokia_boot_audio.mp3',
      keyclickAudio: 'assets/sounds/keyclick.mp3',
      wallpaper: 'assets/wallpapers/Wallpaper1.jpg'
    };
    
    this.isInitialized = false;
  }

  /**
   * Initialize the boot system
   * @param {HTMLElement} screenElement - The phone screen element
   */
  async initialize(screenElement) {
    if (this.isInitialized) return;
    
    // Initialize screen manager
    this.screenManager = new ScreenManager(screenElement);
    
    // Check for saved state in localStorage
    const savedState = localStorage.getItem('nokia5130_state');
    if (savedState === 'HOME_SCREEN') {
      // Restore to home screen if previously booted
      this.phoneState.setState(PhoneStates.HOME_SCREEN);
      
      // Preload assets first, then render home screen
      try {
        await this.preloadAssets();
        await this.renderHomeScreen();
        this.startTimeUpdates();
      } catch (error) {
        console.warn('[BOOT] Asset loading failed, using fallback:', error);
        // Fallback to home screen without wallpaper
        this.screenManager.renderHomeScreen({
          time: this.timeFormatter.formatTime(new Date()),
          date: this.timeFormatter.formatDate(new Date()),
          wallpaper: null,
          battery: null,
          signal: null
        });
        this.startTimeUpdates();
      }
    } else {
      // Start with black screen
      this.screenManager.renderBlackScreen();
      // Preload assets in background
      this.preloadAssets();
    }
    
    // Setup power button
    this.setupPowerButton();
    
    // Setup all button handlers
    this.setupButtonHandlers();
    
    this.isInitialized = true;
  }

  /**
   * Preload all required assets
   */
  async preloadAssets() {
    try {
      // Preload audio assets
      await this.audioManager.preload('boot_sound', this.assets.bootAudio);
      await this.audioManager.preload('keyclick', this.assets.keyclickAudio);
      
      // Load wallpaper
      await this.assetLoader.loadImage('wallpaper', this.assets.wallpaper);
      
    } catch (error) {
      console.warn('[BOOT] Some assets failed to load:', error);
      // Continue without failed assets
    }
  }

  /**
   * Setup power button with long-press detection
   */
  setupPowerButton() {
    const powerButton = document.querySelector('.call-red');
    if (!powerButton) {
      console.error('[BOOT] Power button not found');
      return;
    }

    const longPress = new LongPressDetector(powerButton, () => {
      this.togglePower();
    }, 3000);

  }

  /**
   * Setup all button handlers with keyclick sounds
   */
  setupButtonHandlers() {
    const buttons = document.querySelectorAll('.button');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const currentState = this.phoneState.getCurrentState();
        
        // Don't play keyclick when powered off
        if (currentState !== PhoneStates.POWERED_OFF) {
          this.audioManager.play('keyclick').catch(() => {
            // Ignore audio errors
          });
        }
        
        const key = button.getAttribute('data-key');
        this.handleButtonPress(key);
      });
    });
  }

  /**
   * Handle button press based on current state
   * @param {string} key - Button key
   */
  handleButtonPress(key) {
    const currentState = this.phoneState.getCurrentState();
    
    if (currentState === PhoneStates.POWERED_OFF) {
      return; // Ignore all button presses when powered off
    }
    
    if (currentState === PhoneStates.HOME_SCREEN) {
      this.handleHomeScreenButton(key);
    } else if (currentState === PhoneStates.MENU) {
      this.handleMenuButton(key);
    } else if (currentState === PhoneStates.DIALER) {
      this.handleDialerButton(key);
    } else if (currentState === PhoneStates.CALLING) {
      this.handleCallingButton(key);
    } else if (currentState === PhoneStates.CALCULATOR) {
      this.handleCalculatorButton(key);
    }
  }

  /**
   * Handle calculator button presses
   */
  handleCalculatorButton(key) {
    if (/^[0-9]$/.test(key)) {
      this.screenManager.calculatorAddDigit(key);
    } else if (key === 'UP') {
      this.screenManager.calculatorNavigate('up');
    } else if (key === 'DOWN') {
      this.screenManager.calculatorNavigate('down');
    } else if (key === 'LEFT') {
      this.screenManager.calculatorNavigate('left');
    } else if (key === 'RIGHT') {
      this.screenManager.calculatorNavigate('right');
    } else if (key === 'OK') {
      this.screenManager.calculatorEquals();
    } else if (key === 'RSK') {
      this.phoneState.transitionTo(PhoneStates.MENU);
      const wallpaper = this.assetLoader.getImage('wallpaper');
      this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
    } else if (key === 'END') {
      this.phoneState.transitionTo(PhoneStates.HOME_SCREEN);
      this.renderHomeScreen();
    }
  }

  /**
   * Handle home screen button presses
   * @param {string} key - Button key
   */
  handleHomeScreenButton(key) {
    // Check if it's a number key (0-9, *, #)
    if (/^[0-9*#]$/.test(key)) {
      // Switch to dialer and add the digit
      this.phoneState.transitionTo(PhoneStates.DIALER);
      this.screenManager.renderDialerScreen(key);
    } else if (key === 'OK') {
      // Center button - open menu
      this.phoneState.transitionTo(PhoneStates.MENU);
      const wallpaper = this.assetLoader.getImage('wallpaper');
      this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
    }
  }

  /**
   * Handle menu button presses
   * @param {string} key - Button key
   */
  handleMenuButton(key) {
    if (key === 'UP') {
      this.screenManager.navigateMenu('up');
    } else if (key === 'DOWN') {
      this.screenManager.navigateMenu('down');
    } else if (key === 'LEFT') {
      this.screenManager.navigateMenu('left');
    } else if (key === 'RIGHT') {
      this.screenManager.navigateMenu('right');
    } else if (key === 'OK') {
      // Select current app
      const currentApp = this.screenManager.getCurrentMenuApp();
      if (currentApp) {
        console.log(`[MENU] Selected app: ${currentApp.name}`);
        const name = (currentApp.name || '').toLowerCase();
        if (name.includes('calc')) {
          this.phoneState.transitionTo(PhoneStates.CALCULATOR);
          this.screenManager.renderCalculator();
          return;
        }
      }
    } else if (key === 'RSK' || key === 'END') {
      // Exit menu - return to home screen
      this.phoneState.transitionTo(PhoneStates.HOME_SCREEN);
      this.renderHomeScreen();
    }
  }

  /**
   * Handle dialer button presses
   * @param {string} key - Button key
   */
  handleDialerButton(key) {
    if (/^[0-9*#]$/.test(key)) {
      // Add digit to dialer
      this.screenManager.addDialerDigit(key);
    } else if (key === 'LSK' || key === 'CALL') {
      // Call button - start calling
      this.phoneState.transitionTo(PhoneStates.CALLING);
      this.renderCallingScreen();
    } else if (key === 'RSK' || key === 'END') {
      // Back button - return to home screen
      this.phoneState.transitionTo(PhoneStates.HOME_SCREEN);
      this.renderHomeScreen();
    }
  }

  /**
   * Handle calling button presses
   * @param {string} key - Button key
   */
  handleCallingButton(key) {
    if (key === 'END' || key === 'RSK') {
      // End call - stop animation and return to home screen
      this.stopCallingAnimation();
      this.phoneState.transitionTo(PhoneStates.HOME_SCREEN);
      this.renderHomeScreen();
    }
  }

  /**
   * Render calling screen
   */
  renderCallingScreen() {
    const dialedNumber = this.screenManager.getDialedNumber();
    
    this.screenManager.screenElement.innerHTML = `
      <div class="screen-content" style="background: #1a5fb4; color: white;">
        <!-- Status Bar (top) -->
        <div class="dialer-status-bar">
          <div class="dialer-signal">📶</div>
          <div class="dialer-time">${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}</div>
          <div class="dialer-battery">🔋</div>
        </div>
        
        <!-- Calling Content -->
        <div class="calling-content">
          <div class="calling-status">Calling<span id="calling-dots">...</span></div>
          <div class="calling-number">${dialedNumber}</div>
        </div>
        
        <!-- Soft Keys (bottom) -->
        <div class="calling-soft-keys">
          <div class="soft-key"></div>
          <div class="soft-key">End call</div>
        </div>
      </div>
    `;
    
    // Start animated dots
    this.startCallingAnimation();
  }

  /**
   * Start calling animation with animated dots
   */
  startCallingAnimation() {
    const dotsElement = document.getElementById('calling-dots');
    if (!dotsElement) return;
    
    let dotCount = 0;
    const maxDots = 3;
    
    this.callingAnimationInterval = setInterval(() => {
      dotCount = (dotCount + 1) % (maxDots + 1);
      dotsElement.textContent = '.'.repeat(dotCount);
    }, 500);
  }

  /**
   * Stop calling animation
   */
  stopCallingAnimation() {
    if (this.callingAnimationInterval) {
      clearInterval(this.callingAnimationInterval);
      this.callingAnimationInterval = null;
    }
  }

  /**
   * Toggle power on/off based on current state
   */
  async togglePower() {
    const currentState = this.phoneState.getCurrentState();
    
    if (currentState === PhoneStates.POWERED_OFF) {
      await this.initiateBoot();
    } else if (currentState === PhoneStates.HOME_SCREEN) {
      await this.initiateShutdown();
    }
    // Ignore if in BOOTING or POWERING_OFF states
  }

  /**
   * Initiate boot sequence
   */
  async initiateBoot() {
    
    // Transition to booting state
    if (!this.phoneState.transitionTo(PhoneStates.BOOTING)) {
      console.error('[BOOT] Invalid state transition');
      return;
    }

    try {
      // Start boot audio and animation simultaneously
      const audioPromise = this.audioManager.play('boot_sound');
      const animationPromise = this.screenManager.renderBootAnimation(this.assets.bootVideo);
      
      // Add a timeout to ensure we don't get stuck
      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
          console.warn('[BOOT] Boot sequence timeout, proceeding to home screen');
          resolve();
        }, 8000); // 8 second timeout
      });
      
      // Wait for either completion or timeout
      await Promise.race([
        Promise.all([audioPromise, animationPromise]),
        timeoutPromise
      ]);
      
      // Add small delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Transition to home screen
      if (this.phoneState.transitionTo(PhoneStates.HOME_SCREEN)) {
        // Save state to localStorage
        localStorage.setItem('nokia5130_state', PhoneStates.HOME_SCREEN);
        await this.renderHomeScreen();
        this.startTimeUpdates();
      }
    } catch (error) {
      console.error('[BOOT] Boot sequence failed:', error);
      // Fallback to home screen even if boot fails
      if (this.phoneState.transitionTo(PhoneStates.HOME_SCREEN)) {
        await this.renderHomeScreen();
        this.startTimeUpdates();
      }
    }
  }

  /**
   * Initiate shutdown sequence
   */
  async initiateShutdown() {
    
    // Stop time updates
    this.stopTimeUpdates();
    
    // Transition to powering off state
    if (!this.phoneState.transitionTo(PhoneStates.POWERING_OFF)) {
      console.error('[BOOT] Invalid state transition');
      return;
    }

    try {
      // Play power-off animation
      await this.screenManager.renderPowerOffAnimation();
      
      // Transition to powered off
      if (this.phoneState.transitionTo(PhoneStates.POWERED_OFF)) {
        // Clear state from localStorage
        localStorage.removeItem('nokia5130_state');
        this.screenManager.renderBlackScreen();
      }
    } catch (error) {
      console.error('[BOOT] Shutdown sequence failed:', error);
      // Fallback to powered off
      if (this.phoneState.transitionTo(PhoneStates.POWERED_OFF)) {
        // Clear state from localStorage
        localStorage.removeItem('nokia5130_state');
        this.screenManager.renderBlackScreen();
      }
    }
  }

  /**
   * Render home screen with current data
   */
  async renderHomeScreen() {
    const homeData = {
      time: this.timeFormatter.getCurrentTime(true), // 24-hour format
      date: this.timeFormatter.getCurrentDate(),
      wallpaper: this.assetLoader.getImage('wallpaper'),
      battery: null, // Will add battery icon later
      signal: null   // Will add signal icon later
    };

    this.screenManager.renderHomeScreen(homeData);
  }

  /**
   * Start automatic time updates
   */
  startTimeUpdates() {
    this.stopTimeUpdates(); // Clear any existing interval
    
    this.timeUpdateInterval = setInterval(() => {
      if (this.phoneState.getCurrentState() === PhoneStates.HOME_SCREEN) {
        this.renderHomeScreen();
      }
    }, 60000); // Update every minute
    
  }

  /**
   * Stop automatic time updates
   */
  stopTimeUpdates() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BootController;
} else {
  window.BootController = BootController;
}
