/**
 * GamesManifest - Load and validate games manifest
 * Provides access to available games from manifest.json
 */

class GamesManifest {
  constructor() {
    this.games = [];
    this.isLoaded = false;
    this.manifestPath = 'assets/games/manifest.json';
  }

  /**
   * Load games from manifest.json
   * @returns {Promise<Array>} Array of game items
   */
  async load() {
    try {
      const response = await fetch(this.manifestPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate manifest structure
      if (!Array.isArray(data)) {
        throw new Error('Manifest must be an array of game items');
      }
      
      // Validate each game item
      this.games = data.filter(game => this.validateGameItem(game));
      
      if (this.games.length === 0) {
        console.warn('[GAMES] No valid games found in manifest');
      }
      
      this.isLoaded = true;
      console.log(`[GAMES] Loaded ${this.games.length} games from manifest`);
      
      return this.games;
      
    } catch (error) {
      console.error('[GAMES] Failed to load manifest:', error);
      this.games = [];
      this.isLoaded = false;
      throw error;
    }
  }

  /**
   * Validate a single game item structure
   * @param {Object} game - Game item to validate
   * @returns {boolean} True if valid
   */
  validateGameItem(game) {
    if (!game || typeof game !== 'object') {
      console.warn('[GAMES] Invalid game item: not an object', game);
      return false;
    }
    
    // Required fields
    if (!game.id || typeof game.id !== 'string') {
      console.warn('[GAMES] Invalid game item: missing or invalid id', game);
      return false;
    }
    
    if (!game.title || typeof game.title !== 'string') {
      console.warn('[GAMES] Invalid game item: missing or invalid title', game);
      return false;
    }
    
    if (!game.jar || typeof game.jar !== 'string') {
      console.warn('[GAMES] Invalid game item: missing or invalid jar path', game);
      return false;
    }
    
    // Optional: sizeKb
    if (game.sizeKb !== undefined && typeof game.sizeKb !== 'number') {
      console.warn('[GAMES] Invalid game item: sizeKb must be a number', game);
      return false;
    }
    
    return true;
  }

  /**
   * Get all games
   * @returns {Array} Array of game items
   */
  getGames() {
    return this.games;
  }

  /**
   * Get a game by ID
   * @param {string} id - Game ID
   * @returns {Object|null} Game item or null if not found
   */
  getGameById(id) {
    return this.games.find(game => game.id === id) || null;
  }

  /**
   * Check if manifest is loaded
   * @returns {boolean} True if loaded
   */
  isManifestLoaded() {
    return this.isLoaded;
  }

  /**
   * Get total number of games
   * @returns {number} Number of games
   */
  getGameCount() {
    return this.games.length;
  }
}
