/**
 * LockScreen - Handles lock screen display and unlock animations
 */

class LockScreen {
  constructor(ctx) {
    this.ctx = ctx;
    this.unlockCode = ['*']; // Red button + * to unlock
    this.userInput = [];
    this.unlockTimeout = null;
    this.isUnlocking = false;
  }

  /**
   * Render lock screen with instructions
   */
  render() {
    // Draw wallpaper background
    this.ctx.fillStyle = '#1a5fb4';
    this.ctx.fillRect(0, 0, 240, 320);
    
    // Draw lock icon in center
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'normal 48px "Nokia Sans", Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🔒', 120, 120);
    
    // Draw unlock instructions
    this.ctx.font = 'normal 16px "Nokia Sans", Arial, sans-serif';
    this.ctx.fillText('Press Red + * to unlock', 120, 180);
    
    // Draw current input
    if (this.userInput.length > 0) {
      this.ctx.font = 'normal 20px "Nokia Sans", Arial, sans-serif';
      this.ctx.fillText(this.userInput.join(''), 120, 220);
    }
  }

  /**
   * Handle button press on lock screen
   * @param {string} key - Button key pressed
   * @returns {boolean} True if unlock sequence completed
   */
  handleButtonPress(key) {
    // Clear any existing timeout
    if (this.unlockTimeout) {
      clearTimeout(this.unlockTimeout);
    }

    // Add key to user input
    this.userInput.push(key);
    
    // Check if unlock sequence is complete
    if (this.userInput.length >= this.unlockCode.length) {
      const isCorrect = this.userInput.slice(-this.unlockCode.length).join('') === this.unlockCode.join('');
      
      if (isCorrect) {
        this.isUnlocking = true;
        return true; // Unlock successful
      } else {
        // Wrong sequence, clear input
        this.userInput = [];
      }
    }

    // Set timeout to clear input after 2 seconds
    this.unlockTimeout = setTimeout(() => {
      this.userInput = [];
    }, 2000);

    return false;
  }

  /**
   * Play unlock animation
   * @returns {Promise<void>}
   */
  async playUnlockAnimation() {
    return new Promise((resolve) => {
      const duration = 1000; // 1 second animation
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Clear screen
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, 240, 320);
        
        // Draw diagonal stroke animation
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        // Calculate stroke position (top-right to bottom-left)
        const startX = 200;
        const startY = 20;
        const endX = 40;
        const endY = 300;
        
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete, clear screen
          this.ctx.fillStyle = '#fff';
          this.ctx.fillRect(0, 0, 240, 320);
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Play lock animation
   * @returns {Promise<void>}
   */
  async playLockAnimation() {
    return new Promise((resolve) => {
      const duration = 1000; // 1 second animation
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Clear screen
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, 240, 320);
        
        // Draw diagonal stroke animation (reverse)
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        // Calculate stroke position (bottom-left to top-right)
        const startX = 40;
        const startY = 300;
        const endX = 200;
        const endY = 20;
        
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Reset lock screen state
   */
  reset() {
    this.userInput = [];
    this.isUnlocking = false;
    if (this.unlockTimeout) {
      clearTimeout(this.unlockTimeout);
      this.unlockTimeout = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LockScreen;
} else {
  window.LockScreen = LockScreen;
}
