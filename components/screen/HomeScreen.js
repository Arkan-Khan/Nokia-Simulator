/**
 * HomeScreen - Renders the home screen with wallpaper, time, date, and icons
 */

class HomeScreen {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Render home screen with all elements
   * @param {Object} data - Home screen data
   * @param {string} data.time - Current time (HH:MM)
   * @param {string} data.date - Current date (Monday 20.10)
   * @param {HTMLImageElement|null} data.wallpaper - Wallpaper image
   * @param {HTMLImageElement|null} data.battery - Battery icon
   * @param {HTMLImageElement|null} data.signal - Signal icon
   */
  render(data) {
    // 1. Draw wallpaper or blue background
    if (data.wallpaper) {
      this.ctx.drawImage(data.wallpaper, 0, 0, 240, 320);
    } else {
      // Nokia blue fallback
      this.ctx.fillStyle = '#1a5fb4';
      this.ctx.fillRect(0, 0, 240, 320);
    }
    
    // 2. Draw status bar (top 20px)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, 240, 20);
    
    // 3. Draw time (center-top)
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'normal 18px "Nokia Sans", Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(data.time, 120, 16);
    
    // 4. Draw battery icon (top-right)
    if (data.battery) {
      this.ctx.drawImage(data.battery, 210, 4, 12, 12);
    } else {
      // Simple battery icon fallback
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(210, 4, 12, 8);
      this.ctx.fillRect(222, 6, 2, 4);
    }
    
    // 5. Draw signal icon (top-left)
    if (data.signal) {
      this.ctx.drawImage(data.signal, 10, 4, 12, 12);
    } else {
      // Simple signal icon fallback
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(10, 8, 2, 4);
      this.ctx.fillRect(13, 6, 2, 6);
      this.ctx.fillRect(16, 4, 2, 8);
      this.ctx.fillRect(19, 2, 2, 10);
    }
    
    // 6. Draw date (below time)
    this.ctx.font = 'normal 22px "Nokia Sans", Arial, sans-serif';
    this.ctx.fillText(data.date, 120, 55);
    
    // 7. Draw soft key labels (bottom)
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'normal 20px "Nokia Sans", Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Go to', 10, 310);
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Menu', 120, 310);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('Music', 230, 310);
    
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomeScreen;
} else {
  window.HomeScreen = HomeScreen;
}
