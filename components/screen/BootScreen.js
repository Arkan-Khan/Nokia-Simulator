/**
 * BootScreen - Handles boot animation rendering (GIF or fallback text)
 */

class BootScreen {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Play boot animation using MP4 video
   * @param {string} videoSrc - Path to boot video
   * @returns {Promise<void>} Resolves when animation completes
   */
  async playBootAnimation(videoSrc) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.muted = true; // Mute video since we have separate audio
      video.loop = false;
      video.style.display = 'none';
      video.preload = 'auto';
      document.body.appendChild(video);
      
      
      // Timeout fallback - if video doesn't load in 3 seconds, use fallback
      const timeoutId = setTimeout(() => {
        if (document.body.contains(video)) {
          document.body.removeChild(video);
        }
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
        
        // Clear screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 240, 320);
        
        let videoStarted = false;
        let animationComplete = false;
        
        // Start video playback after sync delay
        setTimeout(() => {
          video.play().then(() => {
            videoStarted = true;
          }).catch(e => {
            console.error('[BOOT] Video play failed:', e);
            this.renderFallbackBoot();
            setTimeout(() => resolve(), 3000);
          });
        }, syncDelay);
        
        // Draw video frames to canvas
        const drawFrame = () => {
          if (videoStarted && !video.paused && !video.ended) {
            // Draw video frame
            this.ctx.drawImage(video, 0, 0, 240, 320);
            requestAnimationFrame(drawFrame);
          } else if (videoStarted && video.ended && !animationComplete) {
            animationComplete = true;
            if (document.body.contains(video)) {
              document.body.removeChild(video);
            }
            resolve();
          } else if (!videoStarted) {
            // During sync delay, keep showing black screen
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, 240, 320);
            requestAnimationFrame(drawFrame);
          } else {
            requestAnimationFrame(drawFrame);
          }
        };
        
        // Start drawing frames immediately
        drawFrame();
      });
      
      video.addEventListener('error', (e) => {
        console.error('[BOOT] Failed to load video:', e);
        clearTimeout(timeoutId);
        if (document.body.contains(video)) {
          document.body.removeChild(video);
        }
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
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, 240, 320);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 36px "Nokia Sans", Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('NOKIA', 120, 160);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BootScreen;
} else {
  window.BootScreen = BootScreen;
}
