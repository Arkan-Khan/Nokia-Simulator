/**
 * AssetLoader - Handles async loading of images and other assets
 */

class AssetLoader {
  constructor() {
    this.assets = {
      images: new Map(),
      audio: new Map()
    };
  }

  /**
   * Load image asset asynchronously
   * @param {string} name - Asset identifier
   * @param {string} src - Image path
   * @returns {Promise<HTMLImageElement>}
   */
  async loadImage(name, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.assets.images.set(name, img);
        console.log(`[ASSET] Image loaded: ${name}`);
        resolve(img);
      };
      img.onerror = (e) => {
        console.error(`[ASSET] Image failed: ${name}`, e);
        reject(new Error(`Failed to load ${name}`));
      };
      img.src = src;
    });
  }

  /**
   * Load multiple assets in parallel
   * @param {Array} assetList - [{ type, name, src }, ...]
   * @returns {Promise<Object>} Results object with success/failure status
   */
  async loadMultiple(assetList) {
    const promises = assetList.map(asset => {
      if (asset.type === 'image') {
        return this.loadImage(asset.name, asset.src)
          .catch(e => ({ error: e, name: asset.name }));
      }
      // Add other asset types as needed
      return Promise.resolve({ error: new Error('Unknown asset type'), name: asset.name });
    });
    
    const results = await Promise.allSettled(promises);
    
    const summary = {
      loaded: results.filter(r => r.status === 'fulfilled' && !r.value.error).length,
      failed: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length,
      total: results.length
    };
    
    console.log(`[ASSET] Loaded ${summary.loaded}/${summary.total} assets`);
    return summary;
  }

  /**
   * Get loaded image asset
   * @param {string} name - Asset identifier
   * @returns {HTMLImageElement|null}
   */
  getImage(name) {
    return this.assets.images.get(name) || null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssetLoader;
} else {
  window.AssetLoader = AssetLoader;
}
