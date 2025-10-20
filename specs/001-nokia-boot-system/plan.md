# Implementation Plan: Nokia 5130 Boot System

**Branch**: `001-nokia-boot-system` | **Date**: 2025-10-20 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-nokia-boot-system/spec.md`

## Summary

Implement the foundational boot system for the Nokia 5130 XpressMusic web emulator, enabling users to power on/off the phone with authentic boot animation, audio, and home screen display. This phase focuses on three P1 (MVP) user stories: Power On & Boot Sequence, Power Off Sequence, and Asset Loading & Performance. The implementation will transform the existing prototype (red screen with key display) into a realistic Nokia experience with state management, audio handling, and performance optimization.

**Technical Approach**: Modular JavaScript architecture with dedicated modules for state management (PhoneState), screen rendering (ScreenManager), audio playback (AudioManager), and boot sequencing (BootController). All modules will be ES6+ compatible, vanilla JavaScript (no frameworks), with async asset loading and browser caching for optimal performance.

## Technical Context

**Language/Version**: JavaScript ES6+ (ECMAScript 2015+)  
**Primary Dependencies**: None (vanilla JavaScript), Web Audio API (built-in), Canvas API (built-in)  
**Storage**: Browser Cache API for audio assets, no persistent storage (phone resets to powered-off on page refresh)  
**Testing**: Manual browser testing (Chrome DevTools), Performance profiling via Network tab and Lighthouse  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Client-side web application (single-page, no backend)  
**Performance Goals**: 
- Initial page load < 3 seconds on 3G connection
- Power button interactive within 3 seconds
- Keypad response < 50ms
- Boot sequence completes within 10 seconds (3s long-press + 5-7s animation)  
**Constraints**: 
- Total initial bundle < 10MB
- Individual assets < 5MB
- No external frameworks/libraries
- Must work offline after initial load (cached assets)  
**Scale/Scope**: Single-user browser experience, ~5-10 interactive modules, 4 phone states, 2-3 audio assets for boot phase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Modularity & Clean Architecture

**Requirement**: Every feature MUST be implemented as separate, self-contained modules in logical directories  
**Compliance**: 
- ✅ Components organized in `/components/system/`, `/components/screen/`, `/components/ui/`
- ✅ Assets in `/assets/boot/`, `/assets/sounds/`, `/assets/wallpapers/`
- ✅ Each module has single responsibility: PhoneState (state), ScreenManager (rendering), AudioManager (audio), BootController (orchestration)
- ✅ Well-commented code with JSDoc for all public functions

**Status**: PASS

---

### ✅ II. Performance First

**Requirement**: Async loading, caching, performance budget (<3s load, <50ms keypad response)  
**Compliance**:
- ✅ Boot audio preloaded asynchronously after page interactive
- ✅ Assets cached via browser Cache API
- ✅ Power button functional within 3 seconds (meets budget)
- ✅ Image optimization planned (Nokia.png already optimized at 229x527px)

**Status**: PASS

---

### ✅ III. Nostalgic Accuracy (NON-NEGOTIABLE)

**Requirement**: Faithful recreation of Nokia 5130 boot/home screen behavior  
**Compliance**:
- ✅ 3-second long-press for power on/off (authentic Nokia behavior)
- ✅ Boot animation GIF + audio playback (assets available in `/Boot/`)
- ✅ Home screen with wallpaper, time, date, battery, signal, soft key labels
- ✅ "NOKIA" fade-out on power-off (2-3 seconds)
- ✅ Keyclick sounds on button press (audio in project assets)

**Status**: PASS

---

### ✅ IV. Progressive Implementation

**Requirement**: Boot sequence → Keypad → Navigation → Emulator (no skipping phases)  
**Compliance**:
- ✅ Phase 1: Boot system (this plan) - Power on/off, boot animation, home screen
- 🔜 Phase 2: Keypad interactivity (future - after boot approval)
- 🔜 Phase 3: Navigation (future - after keypad approval)
- 🔜 Phase 4: Emulator integration (future - after navigation approval)

**Status**: PASS - Proceeding in correct order

---

### ✅ V. Asset Efficiency & Management

**Requirement**: File size limits, lazy loading, smart caching  
**Compliance**:
- ✅ Boot GIF: 1.2MB (within 5MB limit)
- ✅ Boot audio: ~500KB MP3 (within 5MB limit)
- ✅ Initial bundle: ~2MB total (well under 10MB limit)
- ✅ Keyclick audio preloaded but not blocking boot
- ✅ Game assets NOT loaded (future phase)

**Status**: PASS

---

**Overall Constitution Compliance**: ✅ ALL GATES PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```
specs/001-nokia-boot-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Best practices for Web Audio API, Canvas rendering, state machines
├── data-model.md        # Phase 1 output - PhoneState, AudioAsset, UIComponent, TimeDisplay entities
├── quickstart.md        # Phase 1 output - How to run and test the boot system
├── checklists/
│   └── requirements.md  # Specification quality checklist (completed)
└── contracts/           # N/A for client-side (no API contracts needed)
```

### Source Code (repository root)

Based on constitutional requirements and existing index.html structure, we'll organize as a modular client-side web application:

```
nokia-5130-emulator/
├── index.html                    # Main HTML entry point (existing, will be refactored)
├── Nokia.png                     # Phone body image (existing)
├── keyclick.mp3                  # Keyclick sound (existing)
│
├── assets/                       # Asset repository (constitution-mandated structure)
│   ├── boot/
│   │   ├── Boot gif.gif         # Boot animation (existing)
│   │   └── nokia_boot_audio.mp3 # Boot sound (existing)
│   ├── sounds/
│   │   └── keyclick.mp3         # Keyclick sound (linked from root)
│   ├── wallpapers/
│   │   └── default.jpg          # Default Nokia wallpaper (TBD - need asset)
│   ├── icons/                    # For battery, signal icons
│   │   ├── battery-full.png
│   │   └── signal-full.png
│   ├── apps/                     # Future - app icons
│   ├── games/                    # Future - .jar/.kar files
│   └── ringtones/               # Future - ringtone audio files
│
├── components/                   # Modular JavaScript components (constitution-mandated)
│   ├── system/
│   │   ├── PhoneState.js        # State machine: POWERED_OFF, BOOTING, HOME_SCREEN, POWERING_OFF
│   │   ├── AudioManager.js      # Audio preloading, caching, playback
│   │   └── AssetLoader.js       # Async asset loading with fallbacks
│   ├── screen/
│   │   ├── ScreenManager.js     # Canvas rendering coordinator
│   │   ├── BootScreen.js        # Boot animation rendering
│   │   ├── HomeScreen.js        # Home screen rendering (wallpaper, time, date, icons)
│   │   └── PowerOffScreen.js    # Power-off animation (NOKIA fade-out)
│   ├── ui/
│   │   ├── ButtonHandler.js     # Button event handling (existing mappings preserved)
│   │   └── LongPressDetector.js # 3-second long-press detection (mouse + touch)
│   └── utils/
│       ├── TimeFormatter.js     # Time/date formatting for home screen
│       └── Logger.js            # Console logging with prefixes ([BOOT], [AUDIO], etc.)
│
├── styles/
│   └── main.css                 # Extracted CSS from index.html (BEM naming convention)
│
└── scripts/
    ├── boot.js                  # Boot sequence orchestration (BootController)
    └── main.js                  # Application entry point, module initialization
```

**Structure Decision**: Client-side web application with modular architecture. Existing `index.html` will be refactored to extract inline CSS/JS into separate files per constitution. Button mappings (`.button` divs with `data-key` attributes) will be preserved as-is per user requirement. Phone body image (`Nokia.png`) used as-is. This structure satisfies constitutional Principle I (Modularity) by separating concerns into system, screen, and UI components while maintaining performance (Principle II) through async loading.

## Complexity Tracking

*No constitutional violations - this section left empty.*

---

## Phase 0: Research & Best Practices

**Objective**: Resolve technical unknowns and document best practices for Web Audio API, Canvas rendering, and state management.

### Research Tasks

1. **Web Audio API for Nokia sounds**
   - How to preload audio without blocking page load
   - Browser autoplay restrictions and workarounds
   - Audio caching strategies (Cache API vs. simple preload)
   - Multiple audio instance handling (overlapping keyclick sounds)

2. **Canvas rendering for phone screen**
   - Drawing animated GIFs on canvas (native vs. library-free approach)
   - Rendering static home screen with text, icons, wallpaper
   - Animation timing for smooth 60fps boot sequence
   - Pixel-perfect positioning for Nokia 5130 screen dimensions (240x320)

3. **State machine for phone states**
   - JavaScript patterns for POWERED_OFF → BOOTING → HOME_SCREEN → POWERING_OFF
   - Preventing invalid state transitions
   - Event-driven state changes vs. polling

4. **Long-press detection (mouse + touch)**
   - Cross-browser touch event handling
   - Preventing context menu on long-press (mobile)
   - Accurate 3-second timing without drift

5. **Asset loading strategies**
   - Async image/audio loading without race conditions
   - Fallback handling (missing boot GIF → text-based animation)
   - Performance: parallel loading vs. sequential

**Output**: `research.md` with decisions, rationale, and code patterns

---

## Phase 1: Design & Data Models

**Objective**: Define data structures, module interfaces, and implementation quickstart guide.

### Deliverables

1. **`data-model.md`** - Entity definitions:
   - **PhoneState**: State enum, transition rules, current state tracking
   - **AudioAsset**: Preloading status, Audio element refs, playback methods
   - **UIComponent**: Button mappings (preserved from existing), event handlers
   - **TimeDisplay**: Time formatting, auto-update intervals

2. **Module Interfaces** (documented in `data-model.md`):
   - `PhoneState.js`: `getCurrentState()`, `transitionTo(newState)`, `canTransition(targetState)`
   - `AudioManager.js`: `preload(assetName)`, `play(assetName)`, `isLoaded(assetName)`
   - `ScreenManager.js`: `render(screenType)`, `clear()`, `drawImage()`, `drawText()`
   - `BootController.js`: `initiateBoot()`, `initiateShutdown()`, `onBootComplete()`

3. **`quickstart.md`** - Developer guide:
   - How to run locally (open `index.html` in browser)
   - How to test boot sequence (long-press red button)
   - How to verify audio (check console for `[AUDIO] Preloaded: boot_sound`)
   - How to measure performance (Chrome DevTools Network + Performance tabs)
   - Troubleshooting common issues (autoplay blocked, missing assets)

4. **Agent Context Update**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`
   - Add Web Audio API, Canvas API, State Machine pattern to technology context

**Output**: `data-model.md`, `quickstart.md`, updated agent context file

---

## Phase 2: Implementation Planning (Tasks)

**Note**: Task breakdown will be generated by `/speckit.tasks` command (separate from `/speckit.plan`).

**Expected Task Phases**:
1. Setup: Folder structure creation, asset organization
2. Foundational: PhoneState, AudioManager, AssetLoader base modules
3. User Story 1 (P1): Power On & Boot Sequence
4. User Story 3 (P1): Power Off Sequence
5. User Story 5 (P1): Asset Loading & Performance
6. User Story 2 (P2): Home Screen Live Updates
7. Polish: Error handling, logging, performance optimization

---

## Next Steps

1. ✅ Constitution Check complete - ALL GATES PASSED
2. 🔄 Generate `research.md` (Phase 0)
3. 🔄 Generate `data-model.md` (Phase 1)
4. 🔄 Generate `quickstart.md` (Phase 1)
5. 🔄 Update agent context
6. ⏳ Run `/speckit.tasks` to generate implementation task list
7. ⏳ Begin implementation (after user approval of plan)

**Ready for Phase 0 execution** ✅
