/**
 * PowerOffScreen - Handles power-off animation (NOKIA fade-out)
 */

class PowerOffScreen {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Play NOKIA fade-out animation
   * @param {number} duration - Fade duration in milliseconds
   * @returns {Promise<void>} Resolves when animation completes
   */
  async playFadeOut(duration = 2500) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Clear screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 240, 320);
        
        // Draw NOKIA text with fading opacity
        const opacity = 1 - progress;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.font = 'bold 36px "Nokia Sans", Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('NOKIA', 120, 160);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PowerOffScreen;
} else {
  window.PowerOffScreen = PowerOffScreen;
}
