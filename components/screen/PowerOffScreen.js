/**
 * PowerOffScreen - Handles power-off animation (NOKIA fade-out)
 */

class PowerOffScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
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
        
        // Calculate opacity for fade effect
        const opacity = 1 - progress;
        
        // Update screen content with fading NOKIA text
        this.screenElement.innerHTML = `
          <div class="screen-content" style="background: #000; display: flex; align-items: center; justify-content: center;">
            <div style="color: rgba(255, 255, 255, ${opacity}); font-size: 36px; font-weight: bold; font-family: 'Nokia Sans', Arial, sans-serif;">NOKIA</div>
          </div>
        `;
        
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
