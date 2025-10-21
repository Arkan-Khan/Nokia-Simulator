# Research: Nokia 5130 Boot System

**Feature**: Nokia 5130 Boot System  
**Date**: 2025-10-20  
**Purpose**: Document best practices and technical decisions for Web Audio API, Canvas rendering, state management, and long-press detection.

---

## 1. Web Audio API for Nokia Sounds

### Decision: Use HTML5 Audio Elements with Async Preloading

**Rationale**:
- Web Audio API is overkill for simple sound playback (boot sound, keyclick)
- HTML5 `<audio>` elements provide sufficient control with simpler API
- Built-in browser caching via `preload="auto"`
- Better cross-browser compatibility for basic playback

**Implementation Pattern**:
```javascript
class AudioManager {
  constructor() {
    this.assets = new Map(); // audioName → Audio element
  }

  /**
   * Preload audio asset asynchronously
   * @param {string} name - Asset identifier (e.g., 'boot_sound')
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
      audio.currentTime = 0; // Reset to start
      await audio.play();
    } catch (e) {
      console.warn(`[AUDIO] Autoplay blocked for ${name}:`, e.message);
      // Fallback: silent failure (visual-only boot)
    }
  }
}
```

**Autoplay Restrictions Workaround**:
- Audio preloaded but not played until user interaction (power button press)
- First user click enables audio context for subsequent plays
- If autoplay blocked, boot animation proceeds silently with console warning

**Alternatives Considered**:
- **Web Audio API**: Too complex for simple playback, requires AudioContext management
- **Howler.js library**: Violates constitution (no external dependencies)

---

## 2. Canvas Rendering for Phone Screen

### Decision: Canvas 2D Context with Manual GIF Frame Extraction

**Rationale**:
- Nokia screen is 240x320 canvas (matches physical screen dimensions)
- Boot GIF needs to play once, then transition to home screen
- No library needed - use `drawImage()` for GIF frames or fallback to static "NOKIA" text

**Implementation Pattern**:

**Option A: Native GIF Rendering (Recommended)**
```javascript
class BootScreen {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
  }

  /**
   * Render boot animation using Image element
   * @param {string} gifSrc - Path to boot GIF
   * @returns {Promise<void>} Resolves when animation completes
   */
  async playBootAnimation(gifSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Clear screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw GIF (browser animates automatically)
        this.ctx.drawImage(img, 0, 0, 240, 320);
        
        // GIF duration: approximately 5-7 seconds (manual timing)
        setTimeout(() => {
          console.log('[BOOT] Animation complete');
          resolve();
        }, 6000); // 6 seconds for Nokia boot GIF
      };
      
      img.onerror = (e) => {
        console.error('[BOOT] Failed to load GIF:', e);
        this.renderFallbackBoot(); // Text-based fallback
        setTimeout(resolve, 3000); // Shorter fallback duration
      };
      
      img.src = gifSrc;
    });
  }

  /**
   * Fallback: Text-based boot animation
   */
  renderFallbackBoot() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, 240, 320);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('NOKIA', 120, 160);
    
    console.log('[BOOT] Using fallback text animation');
  }
}
```

**Home Screen Rendering**:
```javascript
class HomeScreen {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
  }

  /**
   * Render home screen with wallpaper, time, date, icons
   * @param {Object} data - { time, date, battery, signal, wallpaper }
   */
  render(data) {
    // 1. Draw wallpaper
    if (data.wallpaper) {
      this.ctx.drawImage(data.wallpaper, 0, 0, 240, 320);
    } else {
      this.ctx.fillStyle = '#1a5fb4'; // Nokia blue fallback
      this.ctx.fillRect(0, 0, 240, 320);
    }
    
    // 2. Draw status bar (top 20px)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, 240, 20);
    
    // 3. Draw time (center-top)
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(data.time, 120, 14);
    
    // 4. Draw battery icon (top-right)
    if (data.battery) {
      this.ctx.drawImage(data.battery, 210, 4, 12, 12);
    }
    
    // 5. Draw signal icon (top-left)
    if (data.signal) {
      this.ctx.drawImage(data.signal, 10, 4, 12, 12);
    }
    
    // 6. Draw date (below time)
    this.ctx.font = '12px Arial';
    this.ctx.fillText(data.date, 120, 40);
    
    // 7. Draw soft key labels (bottom)
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Go to', 10, 310);
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Menu', 120, 310);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('Music', 230, 310);
  }
}
```

**Alternatives Considered**:
- **SVG rendering**: Harder to position pixel-perfect, Canvas is standard for games/emulators
- **GIF parsing libraries**: Violates constitution (no dependencies)

---

## 3. State Machine for Phone States

### Decision: Enum-Based State with Transition Validation

**Rationale**:
- Four states: `POWERED_OFF`, `BOOTING`, `HOME_SCREEN`, `POWERING_OFF`
- Prevent invalid transitions (e.g., BOOTING → POWERING_OFF directly)
- Event-driven state changes triggered by user actions or timers

**Implementation Pattern**:
```javascript
const PhoneStates = Object.freeze({
  POWERED_OFF: 'POWERED_OFF',
  BOOTING: 'BOOTING',
  HOME_SCREEN: 'HOME_SCREEN',
  POWERING_OFF: 'POWERING_OFF'
});

class PhoneState {
  constructor() {
    this.currentState = PhoneStates.POWERED_OFF;
    this.stateHistory = []; // For debugging
    
    // Valid state transitions
    this.transitions = {
      [PhoneStates.POWERED_OFF]: [PhoneStates.BOOTING],
      [PhoneStates.BOOTING]: [PhoneStates.HOME_SCREEN],
      [PhoneStates.HOME_SCREEN]: [PhoneStates.POWERING_OFF],
      [PhoneStates.POWERING_OFF]: [PhoneStates.POWERED_OFF]
    };
  }

  /**
   * Transition to new state with validation
   * @param {string} newState - Target state from PhoneStates enum
   * @returns {boolean} Success status
   */
  transitionTo(newState) {
    const validTransitions = this.transitions[this.currentState] || [];
    
    if (!validTransitions.includes(newState)) {
      console.error(
        `[STATE] Invalid transition: ${this.currentState} → ${newState}`
      );
      return false;
    }
    
    console.log(`[STATE] ${this.currentState} → ${newState}`);
    this.stateHistory.push(this.currentState);
    this.currentState = newState;
    return true;
  }

  /**
   * Check if transition is valid
   * @param {string} targetState
   * @returns {boolean}
   */
  canTransition(targetState) {
    const validTransitions = this.transitions[this.currentState] || [];
    return validTransitions.includes(targetState);
  }

  getCurrentState() {
    return this.currentState;
  }
}
```

**Alternatives Considered**:
- **XState library**: Overkill for 4 states, violates no-dependency rule
- **Simple boolean flags**: Harder to maintain, no transition validation

---

## 4. Long-Press Detection (Mouse + Touch)

### Decision: Unified Event Handler with 3-Second Timer

**Rationale**:
- Detect both mouse (mousedown/mouseup) and touch (touchstart/touchend)
- 3-second threshold for power on/off
- Cancel if user moves away from button or releases early

**Implementation Pattern**:
```javascript
class LongPressDetector {
  constructor(element, callback, duration = 3000) {
    this.element = element;
    this.callback = callback;
    this.duration = duration;
    this.timer = null;
    this.isPressed = false;
    
    this.setupListeners();
  }

  setupListeners() {
    // Mouse events
    this.element.addEventListener('mousedown', (e) => this.onPressStart(e));
    this.element.addEventListener('mouseup', () => this.onPressEnd());
    this.element.addEventListener('mouseleave', () => this.onPressEnd());
    
    // Touch events
    this.element.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent context menu
      this.onPressStart(e);
    }, { passive: false });
    
    this.element.addEventListener('touchend', () => this.onPressEnd());
    this.element.addEventListener('touchcancel', () => this.onPressEnd());
  }

  onPressStart(event) {
    if (this.isPressed) return; // Prevent double-trigger
    
    this.isPressed = true;
    console.log('[LONGPRESS] Started');
    
    this.timer = setTimeout(() => {
      console.log('[LONGPRESS] Triggered after 3 seconds');
      this.callback();
      this.isPressed = false;
    }, this.duration);
  }

  onPressEnd() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.isPressed) {
      console.log('[LONGPRESS] Cancelled (released early)');
      this.isPressed = false;
    }
  }
}
```

**Usage**:
```javascript
const redButton = document.querySelector('.call-red');
const longPress = new LongPressDetector(redButton, () => {
  // Trigger power on/off based on current state
  bootController.togglePower();
}, 3000);
```

**Alternatives Considered**:
- **CSS :active pseudo-class**: No way to detect 3-second duration
- **Separate mouse/touch handlers**: Code duplication, harder to maintain

---

## 5. Asset Loading Strategies

### Decision: Parallel Async Loading with Fallbacks

**Rationale**:
- Load critical assets (boot GIF, boot audio) in parallel after page interactive
- Non-blocking: page renders immediately, assets load in background
- Fallbacks for missing assets (text animation, silent boot)

**Implementation Pattern**:
```javascript
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
      // Add audio loading similarly
    });
    
    const results = await Promise.allSettled(promises);
    
    const summary = {
      loaded: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      total: results.length
    };
    
    console.log(`[ASSET] Loaded ${summary.loaded}/${summary.total} assets`);
    return summary;
  }
}
```

**Loading Strategy**:
1. Page loads → HTML/CSS render immediately (< 1 second)
2. Power button becomes interactive (existing event listeners)
3. Background: Preload boot GIF, boot audio, keyclick audio in parallel
4. If user presses power before assets loaded → wait or show loading indicator
5. Fallback: If GIF fails, use text "NOKIA" animation

**Alternatives Considered**:
- **Sequential loading**: Slower, no benefit for independent assets
- **Blocking loader**: Violates performance budget (3-second interactive requirement)

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Audio | HTML5 Audio elements | Simpler than Web Audio API, built-in caching |
| Canvas | 2D Context with native GIF | No library needed, browser handles GIF animation |
| State | Enum-based state machine | Clean transitions, validation built-in |
| Long-press | Unified mouse+touch handler | Single code path, prevents context menu |
| Assets | Parallel async loading | Non-blocking, meets <3s interactive requirement |

---

**Phase 0 Complete** ✅  
**Next**: Generate `data-model.md` (Phase 1)

