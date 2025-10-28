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
  selectGame() {
    // To be implemented
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
  }

  /**
   * Stop the emulator and clean up resources
   */
  stopEmulator() {
    if (this.isEmulatorRunning && this.emulatorInstance) {
      // Will be implemented in Phase 4
      this.isEmulatorRunning = false;
      this.emulatorInstance = null;
    }
  }
}
