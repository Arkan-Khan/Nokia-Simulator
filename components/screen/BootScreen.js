/**
 * BootScreen - Handles boot animation rendering (Video or fallback text)
 */

class BootScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
  }

  /**
   * Play boot animation using MP4 video
   * @param {string} videoSrc - Path to boot video
   * @returns {Promise<void>} Resolves when animation completes
   */
  async playBootAnimation(videoSrc) {
    return new Promise((resolve, reject) => {
      // Show black screen first (like before)
      this.screenElement.innerHTML = `
        <div class="screen-content" style="background: #000; width: 100%; height: 100%;"></div>
      `;
      
      const video = document.createElement('video');
      video.src = videoSrc;
      video.muted = true; // Mute video since we have separate audio
      video.loop = false;
      video.preload = 'auto';
      
      // Timeout fallback - if video doesn't load in 3 seconds, use fallback
      const timeoutId = setTimeout(() => {
        this.renderFallbackBoot();
        setTimeout(() => {
          resolve();
        }, 3000);
      }, 3000);
      
      video.addEventListener('loadedmetadata', () => {
        clearTimeout(timeoutId);
        
        // Calculate delay to sync video with audio (assuming audio is ~6 seconds)
        const audioDuration = 6000; // 6 seconds
        const videoDuration = video.duration * 1000; // Convert to milliseconds
        // Start video earlier - only 1.5 seconds delay maximum
        const syncDelay = Math.min(1500, Math.max(0, audioDuration - videoDuration));
        
        // Start video playback after sync delay
        setTimeout(() => {
          // Show video in screen
          this.screenElement.innerHTML = `
            <div class="screen-content" style="background: #000;">
              <video style="width: 100%; height: 100%; object-fit: cover;" autoplay muted></video>
            </div>
          `;
          
          const videoElement = this.screenElement.querySelector('video');
          videoElement.src = videoSrc;
          
          videoElement.play().then(() => {
            // Video started successfully
          }).catch(e => {
            console.error('[BOOT] Video play failed:', e);
            this.renderFallbackBoot();
            setTimeout(() => resolve(), 3000);
          });
          
          videoElement.addEventListener('ended', () => {
            resolve();
          });
        }, syncDelay);
      });
      
      video.addEventListener('error', (e) => {
        console.error('[BOOT] Failed to load video:', e);
        clearTimeout(timeoutId);
        this.renderFallbackBoot();
        setTimeout(() => {
          resolve();
        }, 3000);
      });
      
      video.load();
    });
  }

  /**
   * Fallback: Text-based boot animation
   */
  renderFallbackBoot() {
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background: #000; display: flex; align-items: center; justify-content: center;">
        <div style="color: white; font-size: 36px; font-weight: bold; font-family: 'Nokia Sans', Arial, sans-serif;">NOKIA</div>
      </div>
    `;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BootScreen;
} else {
  window.BootScreen = BootScreen;
}
