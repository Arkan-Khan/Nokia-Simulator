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
    
  // Ambient background audio state
  this.ambient = null;
  this.ambientResumeTimer = null;
    
    // Asset paths
    this.assets = {
      bootVideo: 'assets/boot/Boot video.mp4',
      bootAudio: 'assets/boot/nokia_boot_audio.mp3',
      keyclickAudio: 'assets/sounds/keyclick.mp3',
      wallpaper: 'assets/wallpapers/Wallpaper1.jpg',
      cameraShutter: 'assets/sounds/camera-capture.mp3'
    };
    
    this.isInitialized = false;
    // Suppress click events for certain keys during Games hold handling
    this._gamesHoldKeysDown = new Set();
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
      // Ensure power hint is hidden when restoring to home
      this.hidePowerHint();
    } else {
      // Start with black screen
      this.screenManager.renderBlackScreen();
      // Preload assets in background
      this.preloadAssets();
      // Show power hint on initial load (powered off)
      this.showPowerHint();
    }
    
    // Setup power button
    this.setupPowerButton();
    
    // Setup all button handlers
    this.setupButtonHandlers();
    
    // Setup ambient background audio (starts on first user interaction)
    this.setupAmbientAudio();
    
    // Listen for game emulator state to manage ambient audio
    window.addEventListener('games_emulator_state', (e) => {
      const running = !!(e && e.detail && e.detail.running);
      if (running) this.pauseAmbient(); else this.maybeResumeAmbient();
    });
    
    this.isInitialized = true;
  }

  /**
   * Show the right-side power hint panel
   */
  showPowerHint() {
    try {
      const dismissed = localStorage.getItem('nokia5130_power_tip_dismissed');
      if (dismissed === '1') return; // respect user dismissal on mobile
      const panel = document.getElementById('power-panel');
      if (panel) panel.style.display = 'block';
      // Hide i button when panel is shown
      const toggle = document.getElementById('power-tip-toggle');
      if (toggle) toggle.style.display = 'none';
    } catch {}
  }

  /**
   * Hide the right-side power hint panel
   */
  hidePowerHint() {
    try {
      const panel = document.getElementById('power-panel');
      if (panel) panel.style.display = 'none';
      // Also hide i button when phone is on
      const toggle = document.getElementById('power-tip-toggle');
      if (toggle) toggle.style.display = 'none';
    } catch {}
  }

  // Ambient audio setup and control
  setupAmbientAudio() {
    try {
      this.ambient = new Audio('assets/sounds/scizzie - aquatic ambience.mp3');
      this.ambient.loop = true;
      this.ambient.volume = 0.3; // 30%
      this.ambient.preload = 'auto';
    } catch {}

    const tryStart = async () => {
      this.maybeResumeAmbient();
      ['pointerdown','click','keydown','touchstart'].forEach(evt => {
        window.removeEventListener(evt, tryStart);
        document.removeEventListener(evt, tryStart);
      });
    };
    ['pointerdown','click','keydown','touchstart'].forEach(evt => {
      window.addEventListener(evt, tryStart, { once: true });
      document.addEventListener(evt, tryStart, { once: true });
    });

    // Pause ambient when tab is not active or page is hidden, resume when active
    const onVisibility = () => {
      if (document.hidden) this.pauseAmbient(); else this.maybeResumeAmbient();
    };
    const onBlur = () => this.pauseAmbient();
    const onFocus = () => this.maybeResumeAmbient();
    const onPageHide = () => this.pauseAmbient();
    const onPageShow = () => this.maybeResumeAmbient();
    try {
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('blur', onBlur);
      window.addEventListener('focus', onFocus);
      window.addEventListener('pagehide', onPageHide);
      window.addEventListener('pageshow', onPageShow);
    } catch {}
  }

  pauseAmbient() {
    if (this.ambient) {
      try { this.ambient.pause(); } catch {}
    }
    if (this.ambientResumeTimer) { clearTimeout(this.ambientResumeTimer); this.ambientResumeTimer = null; }
  }

  pauseAmbientFor(ms = 2500) {
    this.pauseAmbient();
    this.ambientResumeTimer = setTimeout(() => this.maybeResumeAmbient(), ms);
  }

  async maybeResumeAmbient() {
    if (!this.ambient) return;
    // Do not play during booting
    const st = this.phoneState.getCurrentState();
    if (st === PhoneStates.BOOTING) return;
    // Do not play during media playback modes
    const mode = this.screenManager && this.screenManager.mediaGetMode ? (this.screenManager.mediaGetMode() || '') : '';
    if (mode === 'ringtones' || mode === 'musicplay' || mode === 'videoplay') return;
    try {
      if (this.ambient.paused) await this.ambient.play();
    } catch (e) {
      // Likely blocked until user gesture; will retry on interaction
    }
  }

  updateAmbientByMediaMode() {
    const mode = this.screenManager && this.screenManager.mediaGetMode ? (this.screenManager.mediaGetMode() || '') : '';
    if (mode === 'ringtones' || mode === 'musicplay' || mode === 'videoplay') this.pauseAmbient();
    else this.maybeResumeAmbient();
  }

  /**
   * Preload all required assets
   */
  async preloadAssets() {
    try {
      // Preload audio assets
      await this.audioManager.preload('boot_sound', this.assets.bootAudio);
      await this.audioManager.preload('keyclick', this.assets.keyclickAudio);
      await this.audioManager.preload('camera_shutter', this.assets.cameraShutter);
      
      // Load wallpaper
      try {
        await this.assetLoader.loadImage('wallpaper', this.assets.wallpaper);
      } catch (e) {
        console.warn('[BOOT] Wallpaper failed, will render without');
      }
      
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
      // Pointer-based press/release for hold + multi-key in Games only
      button.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const key = button.getAttribute('data-key');
        this.handleButtonDown(key);
      });
      const upHandler = (e) => {
        e.preventDefault();
        const key = button.getAttribute('data-key');
        this.handleButtonUp(key);
      };
      button.addEventListener('pointerup', upHandler);
      button.addEventListener('pointercancel', upHandler);
      button.addEventListener('pointerleave', upHandler);

      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const key = button.getAttribute('data-key');
        const currentState = this.phoneState.getCurrentState();
        // If in Games and emulator is running, we may be doing hold semantics; suppress click for holdable keys
        if (currentState === PhoneStates.GAMES) {
          const gs = this.screenManager && this.screenManager.gamesScreen;
          if (gs && gs.isEmulatorRunning) {
            const holdable = (key === 'UP' || key === 'DOWN' || key === 'LEFT' || key === 'RIGHT' || key === 'OK' || key === 'CALL' || key === 'LSK');
            if (holdable && this._gamesHoldKeysDown.has(key)) {
              return; // ignore click; pointer handlers already handled
            }
          }
        }
        // Play keyclick for most keys, but suppress during camera shutter
            if (currentState !== PhoneStates.POWERED_OFF) {
              // Suppress keyclick sounds while playing games in emulator to reduce spam
              let suppressClick = false;
              try {
                if (currentState === PhoneStates.CAMERA && (key === 'OK' || key === 'CALL')) suppressClick = true;
                const gs = this.screenManager && this.screenManager.gamesScreen;
                if (currentState === PhoneStates.GAMES && gs && gs.isEmulatorRunning) {
                  // During emulator play, do not play keyclicks for holdable/rapid keys
                  const holdable = (key === 'UP' || key === 'DOWN' || key === 'LEFT' || key === 'RIGHT' || key === 'OK' || key === 'CALL' || key === 'LSK');
                  if (holdable) suppressClick = true;
                }
              } catch(_) {}
              if (!suppressClick) {
                this.audioManager.play('keyclick').catch(() => {});
              }
            }
        this.handleButtonPress(key);
      });
    });
  }

  /**
   * Pointer down handler for hold + multi-key in Games
   */
  handleButtonDown(key) {
    const currentState = this.phoneState.getCurrentState();
    if (currentState !== PhoneStates.GAMES) return; // only special-case in Games
    const gs = this.screenManager && this.screenManager.gamesScreen;
    if (!(gs && gs.isEmulatorRunning)) return;
    // Map holdable keys to emulator keydown
    let mapped = null;
    if (key === 'UP') mapped = 'ArrowUp';
    else if (key === 'DOWN') mapped = 'ArrowDown';
    else if (key === 'LEFT') mapped = 'ArrowLeft';
    else if (key === 'RIGHT') mapped = 'ArrowRight';
    else if (key === 'OK' || key === 'CALL') mapped = 'Enter';
    else if (key === 'LSK') mapped = 'Escape';
    // Note: RSK remains as back/exit via click; we don't send Escape for RSK
    if (mapped) {
      this._gamesHoldKeysDown.add(key);
      try { gs.sendEmulatorKeyDown(mapped); } catch {}
    }
  }

  /**
   * Pointer up/cancel/leave handler for hold + multi-key in Games
   */
  handleButtonUp(key) {
    const currentState = this.phoneState.getCurrentState();
    if (currentState !== PhoneStates.GAMES) return; // only special-case in Games
    const gs = this.screenManager && this.screenManager.gamesScreen;
    if (!(gs && gs.isEmulatorRunning)) return;
    // Map holdable keys to emulator keyup
    let mapped = null;
    if (key === 'UP') mapped = 'ArrowUp';
    else if (key === 'DOWN') mapped = 'ArrowDown';
    else if (key === 'LEFT') mapped = 'ArrowLeft';
    else if (key === 'RIGHT') mapped = 'ArrowRight';
    else if (key === 'OK' || key === 'CALL') mapped = 'Enter';
    else if (key === 'LSK') mapped = 'Escape';
    if (mapped) {
      this._gamesHoldKeysDown.delete(key);
      try { gs.sendEmulatorKeyUp(mapped); } catch {}
    }
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
    } else if (currentState === PhoneStates.CAMERA) {
      this.handleCameraButton(key);
    } else if (currentState === PhoneStates.GALLERY) {
      this.handleGalleryButton(key);
    } else if (currentState === PhoneStates.CALLS) {
      this.handleCallsButton(key);
    } else if (currentState === PhoneStates.CONTACTS) {
      this.handleContactsButton(key);
    } else if (currentState === PhoneStates.NOTEPAD) {
      this.handleNotepadButton(key);
    } else if (currentState === PhoneStates.CLOCK) {
      this.handleClockButton(key);
    } else if (currentState === PhoneStates.MEDIA) {
      this.handleMediaButton(key);
    } else if (currentState === PhoneStates.GAMES) {
      this.handleGamesButton(key);
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

  /** Camera controls */
  handleCameraButton(key) {
    if (key === 'OK' || key === 'CALL') {
      // Shutter sound
      this.audioManager.play('camera_shutter').catch(()=>{});
      // Briefly pause ambient during capture
      this.pauseAmbientFor(2500);
      const item = this.screenManager.capturePhoto();
      if (item) {
        this.screenManager.cameraScreen && this.screenManager.cameraScreen.showPreview(item.dataUrl, 2500);
      }
    } else if (key === 'RSK') {
      this.screenManager.stopCamera();
      this.phoneState.transitionTo(PhoneStates.MENU);
      const wallpaper = this.assetLoader.getImage('wallpaper');
      this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
    } else if (key === 'END') {
      this.screenManager.stopCamera();
      this.phoneState.transitionTo(PhoneStates.HOME_SCREEN);
      this.renderHomeScreen();
    }
  }

  /** Gallery controls */
  handleGalleryButton(key) {
    if (key === 'UP') this.screenManager.galleryNavigate('up');
    else if (key === 'DOWN') this.screenManager.galleryNavigate('down');
    else if (key === 'OK') this.screenManager.galleryOpen();
    else if (key === 'LSK') {
      // Delete in list view
      if (this.screenManager.galleryScreen && !this.screenManager.galleryScreen.viewing) {
        this.screenManager.galleryScreen.deleteFocused();
      }
    }
    else if (key === 'RSK') {
      // If viewing image, go back to list; else exit to menu
      if (this.screenManager.galleryScreen && this.screenManager.galleryScreen.viewing) {
        this.screenManager.renderGalleryList();
      } else {
        this.phoneState.transitionTo(PhoneStates.MENU);
        const wallpaper = this.assetLoader.getImage('wallpaper');
        this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
      }
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
    } else if (key === 'RSK') {
      // Music quick access
      this.phoneState.transitionTo(PhoneStates.MEDIA);
      this.screenManager.renderMediaMusic();
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
        } else if (name.includes('camera')) {
          this.phoneState.transitionTo(PhoneStates.CAMERA);
          this.screenManager.renderCamera();
          return;
        } else if (name.includes('gallery')) {
          this.phoneState.transitionTo(PhoneStates.GALLERY);
          this.screenManager.renderGalleryList();
          return;
        } else if (name.includes('call')) {
          this.phoneState.transitionTo(PhoneStates.CALLS);
          this.screenManager.renderCallsList();
          return;
        } else if (name.includes('contact')) {
          this.phoneState.transitionTo(PhoneStates.CONTACTS);
          this.screenManager.renderContactsList();
          // Wire callbacks for exit and call
          this.screenManager.contactsScreen.exitToMenu = () => {
            this.phoneState.transitionTo(PhoneStates.MENU);
            const wallpaper = this.assetLoader.getImage('wallpaper');
            this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
          };
          this.screenManager.contactsScreen.callFocused = () => {
            const filtered = this.screenManager.contactsScreen.getFiltered ? this.screenManager.contactsScreen.getFiltered() : [];
            const idx = this.screenManager.contactsScreen.listIndex || 0;
            const c = filtered[idx];
            const num = c?.number || '';
            if (num) {
              try { CallLogStore.add({ number: num, type: 'outgoing' }); } catch {}
              this.phoneState.transitionTo(PhoneStates.CALLING);
              this.screenManager.dialerScreen && this.screenManager.dialerScreen.setNumber && this.screenManager.dialerScreen.setNumber(num);
              this.renderCallingScreen();
            }
          };
          return;
        } else if (name.includes('media')) {
          this.phoneState.transitionTo(PhoneStates.MEDIA);
          this.screenManager.renderMediaRoot();
          return;
        } else if (name.includes('game') || name.includes('application')) {
          this.phoneState.transitionTo(PhoneStates.GAMES);
          this.screenManager.renderGamesScreen();
          return;
        } else if (name.includes('note')) {
          this.phoneState.transitionTo(PhoneStates.NOTEPAD);
          this.screenManager.renderNotepadList();
          // Ensure RSK exits to menu
          this.screenManager.notepadScreen.exitToMenu = () => {
            this.phoneState.transitionTo(PhoneStates.MENU);
            const wallpaper = this.assetLoader.getImage('wallpaper');
            this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
          };
          return;
        } else if (name.includes('clock')) {
          this.phoneState.transitionTo(PhoneStates.CLOCK);
          this.screenManager.renderClock();
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
      const number = this.screenManager.getDialedNumber();
      try { CallLogStore.add({ number, type: 'outgoing' }); } catch {}
      this.phoneState.transitionTo(PhoneStates.CALLING);
      this.renderCallingScreen();
    } else if (key === 'RSK' || key === 'END') {
      // Back button - return to home screen
      // Clear dialer buffer so next dial starts fresh
      try { this.screenManager.dialerScreen && this.screenManager.dialerScreen.setNumber && this.screenManager.dialerScreen.setNumber(''); } catch {}
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

  /** Calls app controls */
  handleCallsButton(key) {
    if (key === 'UP') this.screenManager.callsNavigate('up');
    else if (key === 'DOWN') this.screenManager.callsNavigate('down');
    else if (key === 'LSK') this.screenManager.callsDelete();
    else if (key === 'OK' || key === 'CALL') {
      const num = this.screenManager.callsGetFocusedNumber();
      if (num) {
        try { CallLogStore.add({ number: num, type: 'outgoing' }); } catch {}
        this.phoneState.transitionTo(PhoneStates.CALLING);
        // Seed dialer number for display
        this.screenManager.dialerScreen && this.screenManager.dialerScreen.setNumber && this.screenManager.dialerScreen.setNumber(num);
        this.renderCallingScreen();
      }
    } else if (key === 'RSK' || key === 'END') {
      this.phoneState.transitionTo(PhoneStates.MENU);
      const wallpaper = this.assetLoader.getImage('wallpaper');
      this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
    }
  }

  /** Contacts app controls */
  handleContactsButton(key) {
    // Delegate to screen; it handles list/view/edit/multi-tap flows and calls callbacks
    this.screenManager.contactsHandleKey(key);
  }

  /** Notepad app controls */
  handleNotepadButton(key) {
    this.screenManager.notepadHandleKey(key);
  }

  /** Clock app controls */
  handleClockButton(key) {
    if (this.screenManager.clockScreen) {
      // Ensure we always clean up clock timers when exiting the app
      const cleanupClock = () => {
        try {
          this.screenManager.clockScreen.stopClockTick && this.screenManager.clockScreen.stopClockTick();
          this.screenManager.clockScreen.stopStopwatchTick && this.screenManager.clockScreen.stopStopwatchTick();
          this.screenManager.clockScreen.stopTimerTick && this.screenManager.clockScreen.stopTimerTick();
        } catch {}
      };

      this.screenManager.clockScreen.exitToMenu = () => {
        cleanupClock();
        this.phoneState.transitionTo(PhoneStates.MENU);
        const wallpaper = this.assetLoader.getImage('wallpaper');
        this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
      };
    }
    this.screenManager.clockHandleKey(key);
  }

  /** Media controls */
  handleMediaButton(key) {
    // Back behavior depends on sub-mode
    const mode = this.screenManager.mediaGetMode ? this.screenManager.mediaGetMode() : '';
    if (key === 'RSK') {
      if (mode === 'root') {
        this.phoneState.transitionTo(PhoneStates.MENU);
        const wallpaper = this.assetLoader.getImage('wallpaper');
        this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
        // Leaving media entirely - may resume ambient
        this.maybeResumeAmbient();
      } else {
        this.screenManager.mediaBack();
        // Update ambient after navigating back to a new media mode
        setTimeout(()=> this.updateAmbientByMediaMode(), 0);
      }
      return;
    }
    if (mode === 'videoplay') {
      if (key === 'UP') this.screenManager.mediaVolume(+0.1);
      else if (key === 'DOWN') this.screenManager.mediaVolume(-0.1);
      else if (key === 'LEFT') this.screenManager.mediaSeek(-5);
      else if (key === 'RIGHT') this.screenManager.mediaSeek(+5);
      else if (key === 'OK') this.screenManager.mediaTogglePlay();
      else if (key === 'LSK') this.screenManager.mediaBack();
      this.pauseAmbient();
      return;
    }
    if (mode === 'musicplay') {
      if (key === 'UP') this.screenManager.mediaVolume(+0.1);
      else if (key === 'DOWN') this.screenManager.mediaVolume(-0.1);
      else if (key === 'LEFT') this.screenManager.mediaScreen.musicPrev && this.screenManager.mediaScreen.musicPrev();
      else if (key === 'RIGHT') this.screenManager.mediaScreen.musicNext && this.screenManager.mediaScreen.musicNext();
      else if (key === 'OK') this.screenManager.mediaTogglePlay();
      else if (key === 'LSK') this.screenManager.mediaBack();
      this.pauseAmbient();
      return;
    }
    // In root/lists: navigate and actions
    if (key === 'UP') this.screenManager.mediaNavigate('up');
    else if (key === 'DOWN') this.screenManager.mediaNavigate('down');
    else if (key === 'OK' || key === 'CALL' || key === 'LSK') this.screenManager.mediaOpen();
    // After any navigation/open, sync ambient based on mode (ringtones autoplay, etc.)
    setTimeout(()=> this.updateAmbientByMediaMode(), 0);
  }

  /**
   * Handle games button presses
   */
  handleGamesButton(key) {
    const gs = this.screenManager.gamesScreen;
    const running = gs && gs.isEmulatorRunning;
    if (running) {
      // Map Nokia keypad to emulator keyboard
      if (key === 'UP') gs.sendEmulatorKey('ArrowUp');
      else if (key === 'DOWN') gs.sendEmulatorKey('ArrowDown');
      else if (key === 'LEFT') gs.sendEmulatorKey('ArrowLeft');
      else if (key === 'RIGHT') gs.sendEmulatorKey('ArrowRight');
      else if (key === 'OK' || key === 'CALL') gs.sendEmulatorKey('Enter');
      else if (key === 'LSK') gs.sendEmulatorKey('Escape');
      else if (key === 'RSK') {
        // Back out of emulator
        const handled = this.screenManager.gamesBack();
        if (!handled) {
          this.phoneState.transitionTo(PhoneStates.MENU);
          const wallpaper = this.assetLoader.getImage('wallpaper');
          this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
        }
      } else if (key === 'END') {
        // End key returns to home
        this.phoneState.transitionTo(PhoneStates.HOME_SCREEN);
        this.renderHomeScreen();
      }
      return;
    }

    // Navigation in games list
    if (key === 'UP' || key === '2') {
      this.screenManager.gamesNavigate('up');
    } else if (key === 'DOWN' || key === '8') {
      this.screenManager.gamesNavigate('down');
    } else if (key === 'OK' || key === 'CALL') {
      this.screenManager.gamesSelect();
    } else if (key === 'RSK') {
      // Let GamesScreen handle back (returns false if should go to MENU)
      const handled = this.screenManager.gamesBack();
      if (!handled) {
        this.phoneState.transitionTo(PhoneStates.MENU);
        const wallpaper = this.assetLoader.getImage('wallpaper');
        this.screenManager.renderMenuScreen(wallpaper ? wallpaper.src : null);
      }
    } else if (key === 'END') {
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
      // Hide power hint immediately when booting starts
      this.hidePowerHint();
      // Pause ambient during boot sequence
      this.pauseAmbient();
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
        // Ensure assets (including wallpaper) are ready before first render
        try { await this.preloadAssets(); } catch {}
        // Save state to localStorage
        localStorage.setItem('nokia5130_state', PhoneStates.HOME_SCREEN);
        await this.renderHomeScreen();
        this.startTimeUpdates();
        this.hidePowerHint();
        // Try resuming ambient once we're on home
        this.maybeResumeAmbient();
      }
    } catch (error) {
      console.error('[BOOT] Boot sequence failed:', error);
      // Fallback to home screen even if boot fails
      if (this.phoneState.transitionTo(PhoneStates.HOME_SCREEN)) {
        await this.renderHomeScreen();
        this.startTimeUpdates();
        this.hidePowerHint();
        this.maybeResumeAmbient();
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
        this.showPowerHint();
      }
    } catch (error) {
      console.error('[BOOT] Shutdown sequence failed:', error);
      // Fallback to powered off
      if (this.phoneState.transitionTo(PhoneStates.POWERED_OFF)) {
        // Clear state from localStorage
        localStorage.removeItem('nokia5130_state');
        this.screenManager.renderBlackScreen();
         this.showPowerHint();
      }
    }
  }

  /**
   * Render home screen with current data
   */
  async renderHomeScreen() {
    const homeData = {
      time: this.timeFormatter.getCurrentTime(true),
      date: this.timeFormatter.getCurrentDate(),
      wallpaper: this.assetLoader.getImage('wallpaper'),
      battery: null,
      signal: null
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
