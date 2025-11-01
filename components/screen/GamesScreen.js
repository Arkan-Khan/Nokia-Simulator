 

/**
 * GamesScreen - Display and manage games list with FreeJ2ME-Web integration
 * Handles list display, navigation, game selection, and emulator lifecycle
 */

class GamesScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.gamesManifest = new GamesManifest();
    this.games = [];
    this.selectedIndex = 0;
    this.isShowingList = true;
    this.isEmulatorRunning = false;
    this.emulatorInstance = null;
  }

  /**
   * Initialize and load games manifest
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.games = await this.gamesManifest.load();
      this.selectedIndex = 0;
    } catch (error) {
      console.error('[GAMES_SCREEN] Failed to initialize:', error);
      this.games = [];
    }
  }

  /**
   * Render games list screen
   */
  renderGamesList() {
    if (!this.games || this.games.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Build games list HTML with Nokia-style rows and icons
    const gamesHTML = this.games.map((game, index) => {
      const focused = index === this.selectedIndex;
      const sizeText = game.sizeKb ? `${game.sizeKb} KB` : '';
      const iconHTML = game.icon 
        ? `<img src="${game.icon}" style="width:24px;height:24px;margin-right:8px;border-radius:4px;" alt="${game.title}">` 
        : '';
      
      return `<div class="game-row${focused ? ' focused' : ''}" style="padding:6px 8px;display:flex;justify-content:space-between;align-items:center;background:${focused ? 'rgba(255,100,150,0.4)' : 'transparent'};border-radius:6px;margin:2px 6px;">
        <div style="display:flex;align-items:center;">
          ${iconHTML}
          <span style="font-size:12px;font-weight:bold;">${game.title}</span>
        </div>
        <span style="font-size:9px;opacity:0.85;">${sizeText}</span>
      </div>`;
    }).join('');

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Games</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div class="games-list" style="position:absolute;top:18px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;padding:2px 0;">
          <div class="inner" style="position:absolute;top:0;left:0;right:0;">${gamesHTML}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Options</div><div>Play</div><div>Back</div>
        </div>
      </div>`;

    this.isShowingList = true;
    
    // Scroll focused row into view
    this.scrollToFocused();
  }

  /**
   * Scroll the focused game into view
   */
  scrollToFocused() {
    const container = this.screenElement.querySelector('.games-list');
    const inner = this.screenElement.querySelector('.games-list .inner');
    const rows = inner ? Array.from(inner.children) : [];
    const focusedEl = rows[this.selectedIndex];
    
    if (container && inner && focusedEl) {
      const viewHeight = container.clientHeight;
      const rTop = focusedEl.offsetTop;
      const rBottom = rTop + focusedEl.offsetHeight;
      let top = parseInt(inner.style.top || '0', 10);
      
      if (rBottom + top > viewHeight) {
        top = viewHeight - rBottom;
      }
      if (rTop + top < 0) {
        top = -rTop;
      }
      
      inner.style.top = `${top}px`;
    }
  }

  /**
   * Render empty state when no games available
   */
  renderEmptyState() {
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Games</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:18px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center;">
          <div style="font-size:12px;margin-bottom:8px;opacity:0.7;">No games available</div>
          <div style="font-size:9px;opacity:0.5;">Add games to assets/games/</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div></div><div></div><div>Back</div>
        </div>
      </div>`;

    this.isShowingList = true;
  }

  /**
   * Navigate up in the list
   */
  navigateUp() {
    if (!this.isShowingList || this.games.length === 0) return;
    
    this.selectedIndex--;
    if (this.selectedIndex < 0) {
      this.selectedIndex = this.games.length - 1; // Wrap around
    }
    
    this.updateSelection();
  }

  /**
   * Navigate down in the list
   */
  navigateDown() {
    if (!this.isShowingList || this.games.length === 0) return;
    
    this.selectedIndex++;
    if (this.selectedIndex >= this.games.length) {
      this.selectedIndex = 0; // Wrap around
    }
    
    this.updateSelection();
  }

  /**
   * Update visual selection in the list
   */
  updateSelection() {
    // Re-render the entire list to update focus state
    this.renderGamesList();
  }

  /**
   * Handle game selection
   */
  async selectGame() {
    if (!this.isShowingList || this.games.length === 0) return;
    
    const selectedGame = this.games[this.selectedIndex];
    if (!selectedGame) return;
    
    console.log(`[GAMES] Launching game: ${selectedGame.title}`);
    
    try {
      await this.launchGame(selectedGame);
    } catch (error) {
      console.error('[GAMES] Failed to launch game:', error);
      this.showError(`Failed to launch ${selectedGame.title}`);
    }
  }

  /**
   * Launch a game in the FreeJ2ME emulator
   * @param {Object} game - Game object from manifest
   */
  async launchGame(game) {
    console.log(`[GAMES] Loading JAR: ${game.jar}`);
    
    this.isShowingList = false;
    this.isEmulatorRunning = true;
    
    // Show loading state
    this.renderLoadingState(game.title);
    
    // Initialize emulator (will be implemented in next tasks)
    await this.initializeEmulator(game);
  }

  /**
   * Handle back navigation
   */
  handleBack() {
    if (!this.isShowingList) {
      // If emulator is running, stop it and return to list
      this.stopEmulator();
      this.renderGamesList();
      return true;
    }
    
    // Return false to let boot.js handle returning to MENU
    return false;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopEmulator();
    // Ensure panel is hidden if leaving Games
    try {
      const panel = document.getElementById('controls-panel');
      if (panel) panel.style.display = 'none';
    } catch (_) {}
  }

  /**
   * Stop the emulator and clean up resources
   */
  stopEmulator() {
    if (this.isEmulatorRunning && this.emulatorInstance) {
      console.log('[GAMES] Stopping emulator');
      
      // Clean up emulator resources
      if (this.emulatorInstance.iframe) {
        this.emulatorInstance.iframe.remove();
        this.emulatorInstance.iframe = null;
      }
      
      this.isEmulatorRunning = false;
      this.emulatorInstance = null;
      // Hide the controls panel when emulator stops
      try {
        const panel = document.getElementById('controls-panel');
        if (panel) panel.style.display = 'none';
      } catch (_) {}
      // Notify host that emulator has stopped
      try { window.dispatchEvent(new CustomEvent('games_emulator_state', { detail: { running: false } })); } catch(_) {}
    }
  }

  /**
   * Render loading state while game initializes
   * @param {string} gameTitle - Title of the game being loaded
   */
  renderLoadingState(gameTitle) {
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Loading...</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:18px;left:0;right:0;bottom:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#060606;">
          <div style="font-size:12px;margin-bottom:12px;text-align:center;padding:0 10px;">${gameTitle}</div>
          <div style="font-size:10px;opacity:0.7;">Loading game...</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div></div><div></div><div>Cancel</div>
        </div>
      </div>`;
  }

  /**
   * Initialize FreeJ2ME emulator for the selected game
   * @param {Object} game - Game object with jar path
   */
  async initializeEmulator(game) {
    try {
      // Create iframe container for FreeJ2ME
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;background:#000;';
      
      // Build FreeJ2ME URL with jar parameter
      // NOTE: run.html prepends "/app/freej2me-web/web/jar/" to the provided jar param (see freej2me-web/web/src/main.js)
      // Our JARs live at "/assets/games/..." relative to the server root.
      // To navigate from "/app/freej2me-web/web/jar/" to "/app/assets/..." we need to go up three levels: ../../../
      // Therefore, pass a path like "../../../assets/games/<file>.jar"
      const jarPath = '../../../' + game.jar;
  // Render game at its native 240x320 and let emulator scale it down to fit (centered, no crop)
  // fractionScale=true allows smooth fractional zoom inside the iframe
  const params = new URLSearchParams({ jar: jarPath, w: '240', h: '320', fit: 'contain', fractionScale: 'true' });
      iframe.src = `freej2me-web/web/run.html?${params.toString()}`;      // Store emulator instance
      this.emulatorInstance = {
        iframe: iframe,
        game: game
      };
      // Show the controls help panel while emulator is active
      try {
        const panel = document.getElementById('controls-panel');
        if (panel) panel.style.display = 'block';
  } catch (_) {}
  // Notify host that emulator is starting
  try { window.dispatchEvent(new CustomEvent('games_emulator_state', { detail: { running: true } })); } catch(_) {}
      
      // Wait for iframe to load
      await new Promise((resolve, reject) => {
        iframe.onload = () => {
          console.log('[GAMES] FreeJ2ME iframe loaded');
          resolve();
        };
        iframe.onerror = (error) => {
          console.error('[GAMES] FreeJ2ME iframe failed to load:', error);
          reject(error);
        };
        
        // Clear loading screen and add iframe
        this.screenElement.innerHTML = '';
        this.screenElement.appendChild(iframe);
        
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Emulator load timeout')), 10000);
      });
      
      console.log('[GAMES] Emulator initialized successfully');
      
    } catch (error) {
      console.error('[GAMES] Failed to initialize emulator:', error);
      this.isEmulatorRunning = false;
      this.emulatorInstance = null;
      // Hide panel on failure
      try {
        const panel = document.getElementById('controls-panel');
        if (panel) panel.style.display = 'none';
  } catch (_) {}
  // Notify host that emulator stopped/failed
  try { window.dispatchEvent(new CustomEvent('games_emulator_state', { detail: { running: false } })); } catch(_) {}
  throw error;
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Error</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:18px;left:0;right:0;bottom:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#060606;">
          <div style="font-size:11px;color:#e74c3c;margin-bottom:12px;text-align:center;padding:0 10px;">${message}</div>
          <div style="font-size:9px;opacity:0.7;">Press Back to return</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div></div><div></div><div>Back</div>
        </div>
      </div>`;
    
    this.isShowingList = true;
    this.isEmulatorRunning = false;
  }
}
