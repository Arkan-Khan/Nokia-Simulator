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
    this.buttonHandler = null;
    this.screenTimeout = null;
    
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
   * @param {HTMLCanvasElement} canvas - The phone screen canvas
   */
  async initialize(canvas) {
    if (this.isInitialized) return;
    
    // Initialize screen manager
    this.screenManager = new ScreenManager(canvas);
    
    // Start with black screen
    this.screenManager.renderBlackScreen();
    
    // Preload assets in background
    this.preloadAssets();
    
    // Setup power button
    this.setupPowerButton();
    
    // Setup button handler
    this.setupButtonHandler();
    
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
      
      // Preload image assets
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
   * Setup button handler for keypad interaction
   */
  setupButtonHandler() {
    this.buttonHandler = new ButtonHandler(this.audioManager);
    
    // Listen for button press events
    document.addEventListener('buttonPress', (e) => {
      this.handleButtonPress(e.detail.key);
    });
  }

  /**
   * Toggle power on/off based on current state
   */
  async togglePower() {
    const currentState = this.phoneState.getCurrentState();
    
    if (currentState === PhoneStates.POWERED_OFF) {
      await this.initiateBoot();
    } else if (currentState === PhoneStates.HOME_SCREEN || currentState === PhoneStates.DIALER) {
      await this.initiateShutdown();
    }
    // Ignore if in BOOTING, LOCKED, UNLOCKING, or POWERING_OFF states
  }

  /**
   * Handle button press based on current state
   * @param {string} key - Button key pressed
   */
  async handleButtonPress(key) {
    const currentState = this.phoneState.getCurrentState();
    
    // Clear screen timeout on any button press
    this.clearScreenTimeout();
    
    switch (currentState) {
      case PhoneStates.LOCKED:
        await this.handleLockedState(key);
        break;
      case PhoneStates.HOME_SCREEN:
        await this.handleHomeState(key);
        break;
      case PhoneStates.DIALER:
        await this.handleDialerState(key);
        break;
      default:
        // Ignore button presses in other states
        break;
    }
  }

  /**
   * Handle button press when locked
   * @param {string} key - Button key pressed
   */
  async handleLockedState(key) {
    const lockScreen = this.screenManager.getLockScreen();
    const unlocked = lockScreen.handleButtonPress(key);
    
    if (unlocked) {
      // Play unlock animation
      if (this.phoneState.transitionTo(PhoneStates.UNLOCKING)) {
        await this.screenManager.getLockScreen().playUnlockAnimation();
        
        // Transition to home screen
        if (this.phoneState.transitionTo(PhoneStates.HOME_SCREEN)) {
          await this.renderHomeScreen();
          this.startTimeUpdates();
        }
      }
    } else {
      // Show lock screen again
      this.screenManager.renderLockScreen();
      this.startScreenTimeout();
    }
  }

  /**
   * Handle button press when on home screen
   * @param {string} key - Button key pressed
   */
  async handleHomeState(key) {
    if (key === 'END') {
      // Lock the phone
      await this.lockPhone();
    } else if (key === 'CALL') {
      // Go to dialer
      if (this.phoneState.transitionTo(PhoneStates.DIALER)) {
        this.screenManager.renderDialerScreen(this.assetLoader.getImage('wallpaper'));
        this.startScreenTimeout();
      }
    }
  }

  /**
   * Handle button press when on dialer screen
   * @param {string} key - Button key pressed
   */
  async handleDialerState(key) {
    const dialerScreen = this.screenManager.getDialerScreen();
    
    if (key === 'END') {
      // Lock the phone
      await this.lockPhone();
    } else if (key === 'CALL') {
      // Go back to home screen
      if (this.phoneState.transitionTo(PhoneStates.HOME_SCREEN)) {
        await this.renderHomeScreen();
        this.startTimeUpdates();
      }
    } else if (key === 'OK') {
      // Clear number
      dialerScreen.clearNumber();
      this.screenManager.renderDialerScreen(this.assetLoader.getImage('wallpaper'));
    } else if (key >= '0' && key <= '9') {
      // Add digit
      dialerScreen.addDigit(key);
      this.screenManager.renderDialerScreen(this.assetLoader.getImage('wallpaper'));
    } else if (key === '*') {
      // Add * to number
      dialerScreen.addDigit('*');
      this.screenManager.renderDialerScreen(this.assetLoader.getImage('wallpaper'));
    } else if (key === '#') {
      // Add # to number
      dialerScreen.addDigit('#');
      this.screenManager.renderDialerScreen(this.assetLoader.getImage('wallpaper'));
    }
  }

  /**
   * Lock the phone
   */
  async lockPhone() {
    if (this.phoneState.transitionTo(PhoneStates.UNLOCKING)) {
      // Play lock animation
      await this.screenManager.getLockScreen().playLockAnimation();
      
      // Transition to locked state
      if (this.phoneState.transitionTo(PhoneStates.LOCKED)) {
        this.screenManager.renderLockScreen();
        this.startScreenTimeout();
      }
    }
  }

  /**
   * Start screen timeout (auto-lock after 3 seconds)
   */
  startScreenTimeout() {
    this.clearScreenTimeout();
    this.screenTimeout = setTimeout(() => {
      const currentState = this.phoneState.getCurrentState();
      if (currentState === PhoneStates.HOME_SCREEN || currentState === PhoneStates.DIALER) {
        this.lockPhone();
      } else if (currentState === PhoneStates.LOCKED) {
        this.screenManager.renderBlackScreen();
      }
    }, 3000);
  }

  /**
   * Clear screen timeout
   */
  clearScreenTimeout() {
    if (this.screenTimeout) {
      clearTimeout(this.screenTimeout);
      this.screenTimeout = null;
    }
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
      
      // Transition to lock screen
      if (this.phoneState.transitionTo(PhoneStates.LOCKED)) {
        this.screenManager.renderLockScreen();
        this.startScreenTimeout();
      }
    } catch (error) {
      console.error('[BOOT] Boot sequence failed:', error);
      // Fallback to lock screen even if boot fails
      if (this.phoneState.transitionTo(PhoneStates.LOCKED)) {
        this.screenManager.renderLockScreen();
        this.startScreenTimeout();
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
        this.screenManager.renderBlackScreen();
      }
    } catch (error) {
      console.error('[BOOT] Shutdown sequence failed:', error);
      // Fallback to powered off
      if (this.phoneState.transitionTo(PhoneStates.POWERED_OFF)) {
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
