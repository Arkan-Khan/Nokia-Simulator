# Data Model: Nokia 5130 Boot System

**Feature**: Nokia 5130 Boot System  
**Date**: 2025-10-20  
**Purpose**: Define entities, state management, and module interfaces for the boot system implementation.

---

## Core Entities

### 1. PhoneState

**Purpose**: Manages the phone's operational state and enforces valid state transitions.

**States (Enum)**:
```javascript
const PhoneStates = {
  POWERED_OFF: 'POWERED_OFF',     // Initial state, black screen
  BOOTING: 'BOOTING',             // Playing boot animation + audio
  HOME_SCREEN: 'HOME_SCREEN',     // Showing wallpaper, time, date, icons
  POWERING_OFF: 'POWERING_OFF'    // Playing NOKIA fade-out animation
};
```

**Attributes**:
- `currentState` (string): Current phone state from PhoneStates enum
- `stateHistory` (Array<string>): History of states for debugging
- `transitions` (Object): Map of valid state transitions

**Valid State Transitions**:
```
POWERED_OFF → BOOTING → HOME_SCREEN → POWERING_OFF → POWERED_OFF
```

**Methods**:
- `getCurrentState()` → string
- `transitionTo(newState)` → boolean (true if valid transition)
- `canTransition(targetState)` → boolean
- `reset()` → void (returns to POWERED_OFF)

**Business Rules**:
- Cannot transition from BOOTING to POWERING_OFF (must complete boot first)
- Cannot transition from POWERED_OFF to HOME_SCREEN (must boot first)
- State history limited to last 10 states to prevent memory leak

---

### 2. AudioAsset

**Purpose**: Represents a preloaded audio file with playback controls.

**Attributes**:
- `name` (string): Asset identifier ('boot_sound', 'keyclick', etc.)
- `src` (string): File path to audio asset
- `audioElement` (HTMLAudioElement): HTML5 Audio object
- `isLoaded` (boolean): Preload completion status
- `loadError` (Error | null): Error if loading failed

**Methods**:
- `preload()` → Promise<void>
- `play()` → Promise<void>
- `stop()` → void
- `reset()` → void (resets currentTime to 0)

**Business Rules**:
- Audio preloaded asynchronously after page interactive
- If autoplay blocked, silently fail (log warning, continue without audio)
- Multiple simultaneous plays use cloned Audio elements (for keyclick rapid press)

**Example Instances**:
```javascript
{
  name: 'boot_sound',
  src: 'assets/boot/nokia_boot_audio.mp3',
  audioElement: Audio { ... },
  isLoaded: true,
  loadError: null
}
```

---

### 3. UIComponent

**Purpose**: Represents an interactive button element on the phone body.

**Attributes**:
- `elementId` (string): DOM element ID or class selector
- `dataKey` (string): Key identifier from `data-key` attribute ('END', 'OK', '1', etc.)
- `eventHandlers` (Object): Map of event types to handler functions
  - `click` (Function)
  - `mousedown` (Function)
  - `mouseup` (Function)
  - `touchstart` (Function)
  - `touchend` (Function)
- `visualState` (string): Current visual state ('normal', 'hover', 'pressed')

**Button Types**:
- **Power Button**: Red call button (data-key="END")
- **Soft Keys**: Left soft key (data-key="LSK"), Right soft key (data-key="RSK")
- **D-Pad**: Up, Down, Left, Right, Center (data-key="UP"/"DOWN"/"LEFT"/"RIGHT"/"OK")
- **Numeric Keys**: 0-9, *, # (data-key="0" through "9", "*", "#")
- **Green Call Button**: data-key="CALL"

**Methods**:
- `attachEventHandler(eventType, handler)` → void
- `setVisualState(state)` → void
- `triggerFeedback()` → void (visual + audio)

**Business Rules**:
- Red button (END) with long-press (3 seconds) triggers power on/off
- Other buttons trigger keyclick sound (future phase)
- Visual feedback (opacity change) on button press (<50ms latency)
- Existing button mappings preserved (user requirement)

---

### 4. ScreenContext

**Purpose**: Represents the canvas rendering context and manages screen rendering.

**Attributes**:
- `canvas` (HTMLCanvasElement): The screen canvas element
- `ctx` (CanvasRenderingContext2D): 2D rendering context
- `width` (number): Canvas width (240px)
- `height` (number): Canvas height (320px)
- `currentScreen` (string): Active screen ('boot', 'home', 'poweroff', 'black')

**Methods**:
- `clear()` → void (fills with black)
- `drawImage(img, x, y, width, height)` → void
- `drawText(text, x, y, style)` → void
- `setScreen(screenType)` → void

**Screen Types**:
- **Black Screen**: Powered-off state (filled with #000)
- **Boot Screen**: Animated GIF or fallback text "NOKIA"
- **Home Screen**: Wallpaper, time, date, battery, signal, soft key labels
- **PowerOff Screen**: "NOKIA" text with fade-out animation

---

### 5. TimeDisplay

**Purpose**: Manages live time and date display on the home screen.

**Attributes**:
- `currentTime` (string): Formatted time string (HH:MM)
- `currentDate` (string): Formatted date string ("Monday 20.10")
- `updateInterval` (number): Interval ID for auto-update (60000ms = 1 minute)
- `is24Hour` (boolean): Time format based on user's locale

**Methods**:
- `getFormattedTime()` → string
- `getFormattedDate()` → string
- `startAutoUpdate(callback)` → void
- `stopAutoUpdate()` → void

**Business Rules**:
- Time updates every 60 seconds automatically
- Date format: "DayOfWeek DD.MM" (e.g., "Monday 20.10")
- Time format: Based on user's system locale (24-hour vs. 12-hour)
- Auto-update only active when phone in HOME_SCREEN state

**Example Output**:
```javascript
{
  currentTime: "14:35",
  currentDate: "Monday 20.10",
  is24Hour: true
}
```

---

## Module Interfaces

### PhoneState.js

**Exports**: `PhoneState` class

**Public API**:
```javascript
class PhoneState {
  constructor()
  getCurrentState() → string
  transitionTo(newState: string) → boolean
  canTransition(targetState: string) → boolean
  reset() → void
}
```

**Dependencies**: None

---

### AudioManager.js

**Exports**: `AudioManager` class

**Public API**:
```javascript
class AudioManager {
  constructor()
  async preload(name: string, src: string) → Promise<void>
  async play(name: string) → Promise<void>
  isLoaded(name: string) → boolean
  getAsset(name: string) → HTMLAudioElement | null
}
```

**Dependencies**: None

---

### AssetLoader.js

**Exports**: `AssetLoader` class

**Public API**:
```javascript
class AssetLoader {
  constructor()
  async loadImage(name: string, src: string) → Promise<HTMLImageElement>
  async loadMultiple(assetList: Array<Asset>) → Promise<Object>
  getImage(name: string) → HTMLImageElement | null
}
```

**Dependencies**: None

---

### ScreenManager.js

**Exports**: `ScreenManager` class

**Public API**:
```javascript
class ScreenManager {
  constructor(canvas: HTMLCanvasElement)
  clear() → void
  renderBlackScreen() → void
  renderBootAnimation(gifSrc: string) → Promise<void>
  renderHomeScreen(data: HomeScreenData) → void
  renderPowerOffAnimation() → Promise<void>
}
```

**Dependencies**: 
- `BootScreen.js`
- `HomeScreen.js`
- `PowerOffScreen.js`

---

### BootScreen.js

**Exports**: `BootScreen` class

**Public API**:
```javascript
class BootScreen {
  constructor(ctx: CanvasRenderingContext2D)
  async playBootAnimation(gifSrc: string) → Promise<void>
  renderFallbackBoot() → void
}
```

**Dependencies**: None

---

### HomeScreen.js

**Exports**: `HomeScreen` class

**Public API**:
```javascript
class HomeScreen {
  constructor(ctx: CanvasRenderingContext2D)
  render(data: HomeScreenData) → void
}

// HomeScreenData interface:
{
  time: string,           // "14:35"
  date: string,           // "Monday 20.10"
  wallpaper: HTMLImageElement | null,
  battery: HTMLImageElement | null,
  signal: HTMLImageElement | null
}
```

**Dependencies**: None

---

### PowerOffScreen.js

**Exports**: `PowerOffScreen` class

**Public API**:
```javascript
class PowerOffScreen {
  constructor(ctx: CanvasRenderingContext2D)
  async playFadeOut(duration: number) → Promise<void>
}
```

**Dependencies**: None

---

### LongPressDetector.js

**Exports**: `LongPressDetector` class

**Public API**:
```javascript
class LongPressDetector {
  constructor(element: HTMLElement, callback: Function, duration: number)
  setupListeners() → void
  destroy() → void
}
```

**Dependencies**: None

---

### ButtonHandler.js

**Exports**: `ButtonHandler` class

**Public API**:
```javascript
class ButtonHandler {
  constructor()
  attachButtonListeners(buttons: NodeList, onClick: Function) → void
  playKeyclickSound() → void
  triggerVisualFeedback(button: HTMLElement) → void
}
```

**Dependencies**: 
- `AudioManager.js` (for keyclick sound)

---

### TimeFormatter.js

**Exports**: `TimeFormatter` utility object

**Public API**:
```javascript
const TimeFormatter = {
  getCurrentTime(is24Hour: boolean) → string,
  getCurrentDate() → string,
  formatTime(date: Date, is24Hour: boolean) → string,
  formatDate(date: Date) → string
}
```

**Dependencies**: None

---

### Logger.js

**Exports**: `Logger` utility object

**Public API**:
```javascript
const Logger = {
  boot(message: string) → void,      // Logs with [BOOT] prefix
  audio(message: string) → void,     // Logs with [AUDIO] prefix
  state(message: string) → void,     // Logs with [STATE] prefix
  keypad(message: string) → void,    // Logs with [KEYPAD] prefix
  error(module: string, error: Error) → void
}
```

**Dependencies**: None

---

## Data Flow Diagrams

### Power On Sequence

```
User Long-Press Red Button (3 seconds)
  ↓
LongPressDetector triggers callback
  ↓
BootController.initiateBoot()
  ↓
PhoneState.transitionTo(BOOTING)
  ↓
AudioManager.play('boot_sound')
  ↓
ScreenManager.renderBootAnimation()
  ↓
Wait for animation (6 seconds)
  ↓
PhoneState.transitionTo(HOME_SCREEN)
  ↓
ScreenManager.renderHomeScreen({ time, date, wallpaper, battery, signal })
  ↓
TimeDisplay.startAutoUpdate()
```

### Power Off Sequence

```
User Long-Press Red Button (3 seconds) [while in HOME_SCREEN]
  ↓
LongPressDetector triggers callback
  ↓
BootController.initiateShutdown()
  ↓
TimeDisplay.stopAutoUpdate()
  ↓
PhoneState.transitionTo(POWERING_OFF)
  ↓
ScreenManager.renderPowerOffAnimation()
  ↓
Wait for fade-out (2-3 seconds)
  ↓
PhoneState.transitionTo(POWERED_OFF)
  ↓
ScreenManager.renderBlackScreen()
```

### Asset Loading Sequence

```
Page Load
  ↓
HTML/CSS rendered immediately (<1s)
  ↓
Button event listeners attached (power button interactive)
  ↓
[BACKGROUND] AssetLoader.loadMultiple([boot_gif, boot_audio, keyclick])
  ↓
Assets preloaded in parallel (non-blocking)
  ↓
Each asset → onLoad or onError
  ↓
Logger reports success/failure
  ↓
Power button ready (if assets loaded) or fallback ready (if failed)
```

---

## Validation Rules

### State Transitions

| From State | Valid Next States | Invalid Transitions |
|------------|-------------------|---------------------|
| POWERED_OFF | BOOTING | HOME_SCREEN, POWERING_OFF |
| BOOTING | HOME_SCREEN | POWERED_OFF, POWERING_OFF |
| HOME_SCREEN | POWERING_OFF | POWERED_OFF, BOOTING |
| POWERING_OFF | POWERED_OFF | BOOTING, HOME_SCREEN |

### Asset Requirements

| Asset | Type | Max Size | Required | Fallback |
|-------|------|----------|----------|----------|
| nokia_boot_audio.mp3 | Audio | 5MB | Yes | Silent boot |
| Boot gif.gif | Image | 5MB | Yes | Text "NOKIA" |
| keyclick.mp3 | Audio | 1MB | No | Visual-only |
| default wallpaper | Image | 2MB | No | Blue background |
| battery-full.png | Image | 10KB | No | Skip icon |
| signal-full.png | Image | 10KB | No | Skip icon |

### Performance Constraints

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Initial page interactive | <3 seconds | <5 seconds |
| Boot sequence total | <10 seconds | <15 seconds |
| Home screen render | <100ms | <200ms |
| Keypad response | <50ms | <100ms |
| Memory usage | <50MB | <100MB |

---

**Phase 1 Data Model Complete** ✅  
**Next**: Generate `quickstart.md` (Phase 1)

