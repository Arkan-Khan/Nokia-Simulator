/**
 * HomeScreen - Renders the home screen with wallpaper, time, date, and icons using HTML
 */

class HomeScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
  }

  /**
   * Render home screen with all elements using HTML
   * @param {Object} data - Home screen data
   * @param {string} data.time - Current time (HH:MM)
   * @param {string} data.date - Current date (Monday 20.10)
   * @param {HTMLImageElement|null} data.wallpaper - Wallpaper image
   * @param {HTMLImageElement|null} data.battery - Battery icon
   * @param {HTMLImageElement|null} data.signal - Signal icon
   */
  render(data) {
    // Set wallpaper background
    let backgroundStyle = '#1a5fb4'; // Nokia blue fallback
    if (data.wallpaper) {
      backgroundStyle = `url('${data.wallpaper.src}')`;
    }
    
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background: ${backgroundStyle}; background-size: cover; background-position: center;">
        <!-- Status Info (top-left) -->
        <div class="status-info">
          <div>📶 🔋</div>
          <div>No SIM card</div>
          <div style="margin-top: 3px;">${data.date}</div>
        </div>
        
        <!-- Time (top-right) -->
        <div class="time-display">${data.time}</div>
        
        <!-- Soft Keys (bottom with transparent bar) -->
        <div class="soft-keys">
          <div class="soft-key">Go to</div>
          <div class="soft-key">Menu</div>
          <div class="soft-key">Music</div>
        </div>
      </div>
    `;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomeScreen;
} else {
  window.HomeScreen = HomeScreen;
}
