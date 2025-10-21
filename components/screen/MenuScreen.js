/**
 * MenuScreen - Renders the main menu with 3x3 grid of app icons
 */

class MenuScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.currentFocus = { row: 1, col: 1 }; // Center position (0-indexed)
    this.apps = [];
    this.iconsLoaded = false;
    this.currentViewRow = 0; // Which 3x3 view we're showing
  }

  /**
   * Initialize apps dynamically from available icons
   */
  initializeApps() {
    // List of available icons (you can add more as needed)
    const iconFiles = [
      'Application.svg', 'Calculator.svg', 'call.svg',
      'Camera.svg', 'Clock.svg', 'Contacts.svg', 'Gallery.svg',
      'Internet.svg', 'Media Player.svg', 'Messaging.svg', 'Notepad.svg', 'Settings.svg'
    ];

    this.apps = iconFiles.map((iconFile, index) => {
      const name = iconFile.replace('.svg', '').replace(/([A-Z])/g, ' $1').trim();
      return {
        name: name,
        icon: iconFile,
        index: index
      };
    });
  }

  /**
   * Render menu screen with 3x3 grid
   * @param {string} wallpaperSrc - Wallpaper background
   */
  render(wallpaperSrc = null) {
    let backgroundStyle = '#1a5fb4'; // Nokia blue fallback
    if (wallpaperSrc) {
      backgroundStyle = `url('${wallpaperSrc}')`;
    }

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background: ${backgroundStyle}; background-size: cover; background-position: center;">
        <!-- Status Bar (top) -->
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

    // Load icons dynamically on first render, then refresh the grid/name
    this.ensureIconsLoaded().then(() => {
      this.updateFocus();
    }).catch(() => {});
  }

  /**
   * Ensure icons are loaded (manifest first, then directory listing fallback)
   */
  async ensureIconsLoaded() {
    if (this.iconsLoaded && this.apps.length > 0) return;
    try {
      await this.loadIconsFromManifest();
      this.iconsLoaded = true;
      return;
    } catch (_) {
      // Fall through to directory listing
    }
    try {
      await this.loadIconsFromDirectory();
      this.iconsLoaded = true;
    } catch (e) {
      console.error('[MENU] Failed to load icons dynamically:', e);
      this.apps = [];
      this.iconsLoaded = true;
    }
  }

  async loadIconsFromManifest() {
    const res = await fetch('assets/icons/manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest.json not found');
    const files = await res.json();
    if (!Array.isArray(files)) throw new Error('manifest.json invalid');
    const svgFiles = files.filter(f => typeof f === 'string' && f.toLowerCase().endsWith('.svg'));
    this.setAppsFromFiles(svgFiles);
  }

  async loadIconsFromDirectory() {
    const res = await fetch('assets/icons/', { cache: 'no-store' });
    if (!res.ok) throw new Error('icons directory listing not available');
    const html = await res.text();
    // Parse anchors ending with .svg (works with many simple dev servers)
    const matches = Array.from(html.matchAll(/href=["']([^"']+\.svg)["']/gi)).map(m => decodeURIComponent(m[1]));
    // Normalize to filenames only and dedupe
    const files = Array.from(new Set(matches.map(href => href.split('/').pop()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));
    this.setAppsFromFiles(files);
  }

  setAppsFromFiles(iconFiles) {
    this.apps = iconFiles.map((iconFile, index) => {
      const base = iconFile.replace(/\.svg$/i, '');
      // Convert file name to a readable name (handle spaces, dashes, camel case)
      const withSpaces = base.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
      const name = withSpaces.trim();
      return { name, icon: iconFile, index };
    });
  }

  /**
   * Render the 3x3 app grid with sliding window
   */
  renderAppGrid() {
    let gridHTML = '';
    const startIndex = this.currentViewRow * 9; // Start of current 3x3 view
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const appIndex = startIndex + (row * 3) + col;
        const app = this.apps[appIndex];
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
    const currentApp = this.getCurrentApp();
    return currentApp ? currentApp.name : '';
  }

  /**
   * Navigate focus in direction with simple logic
   * @param {string} direction - 'up', 'down', 'left', 'right'
   */
  navigate(direction) {
    const currentAppIndex = this.getCurrentAppIndex();
    let newAppIndex = currentAppIndex;
    const col = currentAppIndex % 3;
    
    console.log(`[MENU] Navigating ${direction} from app ${currentAppIndex} (${this.apps[currentAppIndex]?.name})`);
    
    switch (direction) {
      case 'up': {
        // Move up in same column; wrap to last item in column
        if (currentAppIndex - 3 >= 0) {
          newAppIndex = currentAppIndex - 3;
        } else {
          const lastInColumn = col + 3 * Math.floor((this.apps.length - 1 - col) / 3);
          newAppIndex = lastInColumn;
        }
        break;
      }
      case 'down': {
        // Move down in same column; wrap to first item in column
        if (currentAppIndex + 3 < this.apps.length) {
          newAppIndex = currentAppIndex + 3;
        } else {
          newAppIndex = col;
        }
        break;
      }
      case 'left': {
        // Linear left with wrap across entire list
        newAppIndex = (currentAppIndex - 1 + this.apps.length) % this.apps.length;
        break;
      }
      case 'right': {
        // Linear right with wrap across entire list
        newAppIndex = (currentAppIndex + 1) % this.apps.length;
        break;
      }
    }
    
    console.log(`[MENU] Moving to app ${newAppIndex} (${this.apps[newAppIndex]?.name})`);
    
    // Update focus position based on new app index
    this.updateFocusToApp(newAppIndex);
  }

  /**
   * Get current app index
   */
  getCurrentAppIndex() {
    const currentApp = this.getCurrentApp();
    return currentApp ? currentApp.index : 0;
  }

  /**
   * Update focus to specific app index
   */
  updateFocusToApp(appIndex) {
    const app = this.apps[appIndex];
    if (!app) return;
    
    // Calculate which 3x3 view this app belongs to
    this.currentViewRow = Math.floor(appIndex / 9);
    
    // Calculate position within the current 3x3 view
    const viewIndex = appIndex % 9;
    this.currentFocus.row = Math.floor(viewIndex / 3);
    this.currentFocus.col = viewIndex % 3;
    
    console.log(`[MENU] Updated focus: viewRow=${this.currentViewRow}, focus=${this.currentFocus.row},${this.currentFocus.col}`);
    
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
    const startIndex = this.currentViewRow * 9;
    const appIndex = startIndex + (this.currentFocus.row * 3) + this.currentFocus.col;
    return this.apps[appIndex];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuScreen;
} else {
  window.MenuScreen = MenuScreen;
}