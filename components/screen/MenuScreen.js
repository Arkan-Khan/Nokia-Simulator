/**
 * MenuScreen - Renders the main menu with 3x3 grid of app icons
 */

class MenuScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.currentFocus = { row: 1, col: 1 }; // Center position (0-indexed)
    this.apps = [
      { name: 'Calendar', icon: 'Calendar.svg', row: 0, col: 0 },
      { name: 'Messaging', icon: 'Messaging.svg', row: 0, col: 1 },
      { name: 'Sync', icon: 'File.svg', row: 0, col: 2 },
      { name: 'Internet', icon: 'Internet.svg', row: 1, col: 0 },
      { name: 'Media Player', icon: 'Media Player.svg', row: 1, col: 1 },
      { name: 'Radio', icon: 'Phone.svg', row: 1, col: 2 },
      { name: 'Settings', icon: 'Profiles.svg', row: 2, col: 0 },
      { name: 'Camera', icon: 'Camera.svg', row: 2, col: 1 },
      { name: 'Gallery', icon: 'Gallery.svg', row: 2, col: 2 },
      { name: 'Calculator', icon: 'Calculator.svg', row: 3, col: 0 },
      { name: 'Clock', icon: 'Clock.svg', row: 3, col: 1 },
      { name: 'Contacts', icon: 'Contacts.svg', row: 3, col: 2 }
    ];
    
    this.currentViewRow = 0; // Which 3x3 view we're showing (0, 1, 2, 3)
  }

  /**
   * Render menu screen with 3x3 grid
   * @param {string} wallpaperSrc - Wallpaper background
   */
  render(wallpaperSrc = null) {
    const backgroundStyle = wallpaperSrc ? `url('${wallpaperSrc}')` : '#1a5fb4';
    
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background: ${backgroundStyle}; background-size: cover; background-position: center;">
        <!-- Status Bar -->
        <div class="menu-status-bar">
          <div class="menu-signal">📶</div>
          <div class="menu-time">${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}</div>
          <div class="menu-battery">🔋</div>
        </div>
        
        <!-- App Name Display -->
        <div class="app-name-display">${this.getCurrentAppName()}</div>
        
        <!-- App Grid -->
        <div class="app-grid">
          ${this.renderAppGrid()}
        </div>
        
        <!-- Soft Keys -->
        <div class="menu-soft-keys">
          <div class="soft-key">Options</div>
          <div class="soft-key">Select</div>
          <div class="soft-key">Exit</div>
        </div>
      </div>
    `;
  }

  /**
   * Render the 3x3 app grid
   */
  renderAppGrid() {
    let gridHTML = '';
    
    // Show 3x3 grid starting from currentViewRow
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const actualRow = this.currentViewRow + row;
        const app = this.apps.find(a => a.row === actualRow && a.col === col);
        const isFocused = this.currentFocus.row === row && this.currentFocus.col === col;
        
        if (app) {
          gridHTML += `
            <div class="app-icon ${isFocused ? 'focused' : ''}" data-row="${row}" data-col="${col}">
              <img src="assets/icons/${app.icon}" alt="${app.name}" />
            </div>
          `;
        } else {
          gridHTML += `
            <div class="app-icon" data-row="${row}" data-col="${col}">
              <!-- Empty slot -->
            </div>
          `;
        }
      }
    }
    
    return gridHTML;
  }

  /**
   * Get current focused app name
   */
  getCurrentAppName() {
    const actualRow = this.currentViewRow + this.currentFocus.row;
    const app = this.apps.find(a => a.row === actualRow && a.col === this.currentFocus.col);
    return app ? app.name : '';
  }

  /**
   * Navigate focus in direction with proper row/column behavior
   * @param {string} direction - 'up', 'down', 'left', 'right'
   */
  navigate(direction) {
    const newFocus = { ...this.currentFocus };
    let newViewRow = this.currentViewRow;
    
    switch (direction) {
      case 'up':
        // Column-wise: loop within column
        if (newFocus.row > 0) {
          newFocus.row = newFocus.row - 1;
        } else {
          // At top of current view: go to previous view
          if (newViewRow > 0) {
            newViewRow = newViewRow - 1;
            newFocus.row = 2; // Bottom of previous view
          } else {
            // At first view top: go to last view bottom
            newViewRow = Math.floor((this.apps.length - 1) / 3);
            newFocus.row = 2;
          }
        }
        break;
      case 'down':
        // Column-wise: loop within column
        if (newFocus.row < 2) {
          newFocus.row = newFocus.row + 1;
        } else {
          // At bottom of current view: go to next view
          const maxViewRow = Math.floor((this.apps.length - 1) / 3);
          if (newViewRow < maxViewRow) {
            newViewRow = newViewRow + 1;
            newFocus.row = 0; // Top of next view
          } else {
            // At last view bottom: go to first view top
            newViewRow = 0;
            newFocus.row = 0;
          }
        }
        break;
      case 'left':
        // Column-wise: go left
        if (newFocus.col > 0) {
          newFocus.col = newFocus.col - 1;
        } else {
          // At left edge: go to last column of previous row
          if (newFocus.row > 0) {
            newFocus.row = newFocus.row - 1;
            newFocus.col = 2;
          } else {
            // At top-left: slide to previous view and focus on previous app
            if (newViewRow > 0) {
              newViewRow = newViewRow - 1;
              // Focus on the last app of the previous view (which is the previous app)
              newFocus.row = 2;
              newFocus.col = 2;
            } else {
              // At first view: go to last view
              const maxViewRow = Math.floor((this.apps.length - 1) / 3);
              newViewRow = maxViewRow;
              newFocus.row = 2;
              newFocus.col = 2;
            }
          }
        }
        break;
      case 'right':
        // Column-wise: loop around
        if (newFocus.col < 2) {
          newFocus.col = newFocus.col + 1;
        } else {
          // At right edge: go to first column of next row
          if (newFocus.row < 2) {
            newFocus.row = newFocus.row + 1;
            newFocus.col = 0;
          } else {
            // At bottom-right: slide to next view and focus on next app
            const maxViewRow = Math.floor((this.apps.length - 1) / 3);
            if (newViewRow < maxViewRow) {
              newViewRow = newViewRow + 1;
              // Focus on the first app of the new view (which is the next app)
              newFocus.row = 0;
              newFocus.col = 0;
            } else {
              // At last view: go to first view
              newViewRow = 0;
              newFocus.row = 0;
              newFocus.col = 0;
            }
          }
        }
        break;
    }
    
    this.currentViewRow = newViewRow;
    this.currentFocus = newFocus;
    this.updateFocus();
  }

  /**
   * Update focus display
   */
  updateFocus() {
    // Re-render the grid to show correct apps
    const appGrid = document.querySelector('.app-grid');
    if (appGrid) {
      appGrid.innerHTML = this.renderAppGrid();
    }
    
    // Update app name
    const appNameDisplay = document.querySelector('.app-name-display');
    if (appNameDisplay) {
      appNameDisplay.textContent = this.getCurrentAppName();
    }
  }

  /**
   * Get currently focused app
   */
  getCurrentApp() {
    const actualRow = this.currentViewRow + this.currentFocus.row;
    return this.apps.find(a => a.row === actualRow && a.col === this.currentFocus.col);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuScreen;
} else {
  window.MenuScreen = MenuScreen;
}
