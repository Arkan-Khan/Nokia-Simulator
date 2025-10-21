/**
 * AudioManager - Handles audio preloading, caching, and playback
 * Uses HTML5 Audio elements for simple, reliable audio handling
 */

class AudioManager {
  constructor() {
    this.assets = new Map(); // audioName → Audio element
    this.isAudioEnabled = false;
  }

  /**
   * Preload audio asset asynchronously
   * @param {string} name - Asset identifier (e.g., 'boot_sound', 'keyclick')
   * @param {string} src - Audio file path
   * @returns {Promise<void>}
   */
  async preload(name, src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;
      
      audio.addEventListener('canplaythrough', () => {
        this.assets.set(name, audio);
        console.log(`[AUDIO] Preloaded: ${name}`);
        resolve();
      }, { once: true });
      
      audio.addEventListener('error', (e) => {
        console.error(`[AUDIO] Failed to load ${name}:`, e);
        reject(e);
      });
      
      audio.load();
    });
  }

  /**
   * Play audio with error handling
   * @param {string} name - Asset identifier
   * @returns {Promise<void>}
   */
  async play(name) {
    const audio = this.assets.get(name);
    if (!audio) {
      console.warn(`[AUDIO] Asset not loaded: ${name}`);
      return;
    }
    
    try {
      // For keyclick, create a new audio instance to allow overlapping
      if (name === 'keyclick') {
        const newAudio = audio.cloneNode();
        newAudio.currentTime = 0;
        await newAudio.play();
        this.isAudioEnabled = true;
      } else {
        audio.currentTime = 0; // Reset to start
        await audio.play();
        this.isAudioEnabled = true; // Mark audio as enabled after successful play
      }
    } catch (e) {
      if (e.name === 'NotAllowedError') {
        console.warn(`[AUDIO] Autoplay blocked for ${name}. User interaction required.`);
        // Don't throw error - continue without audio
      } else {
        console.error(`[AUDIO] Playback error for ${name}:`, e);
      }
    }
  }

  /**
   * Check if audio asset is loaded
   * @param {string} name - Asset identifier
   * @returns {boolean}
   */
  isLoaded(name) {
    return this.assets.has(name);
  }

  /**
   * Get audio asset element
   * @param {string} name - Asset identifier
   * @returns {HTMLAudioElement|null}
   */
  getAsset(name) {
    return this.assets.get(name) || null;
  }

  /**
   * Play keyclick sound (for rapid successive plays)
   * @returns {Promise<void>}
   */
  async playKeyclick() {
    if (!this.isLoaded('keyclick')) {
      console.warn('[AUDIO] Keyclick not loaded');
      return;
    }

    try {
      // Clone audio for rapid successive plays
      const originalAudio = this.assets.get('keyclick');
      const audio = originalAudio.cloneNode();
      audio.currentTime = 0;
      await audio.play();
    } catch (e) {
      // Silently fail for keyclick (visual feedback still works)
      console.debug('[AUDIO] Keyclick play failed:', e.message);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
} else {
  window.AudioManager = AudioManager;
}
