<!--
SYNC IMPACT REPORT
==================
Version change: N/A (initial version) → 1.0.0
Constitution type: MAJOR (Initial ratification)

Modified principles: N/A (new constitution)
Added sections:
  - Core Principles (5 principles established)
  - Technical Standards
  - Development Workflow
  - Governance

Templates status:
  ✅ plan-template.md - reviewed, compatible with constitution
  ✅ spec-template.md - reviewed, compatible with constitution
  ✅ tasks-template.md - reviewed, compatible with constitution
  ✅ agent-file-template.md - reviewed, compatible with constitution
  ✅ checklist-template.md - reviewed, compatible with constitution

Follow-up TODOs: None
==================
-->

# Nokia 5130 XpressMusic Web Emulator Constitution

## Core Principles

### I. Modularity & Clean Architecture

**MUST Requirements:**
- Every feature MUST be implemented as a separate, self-contained module
- Components MUST be organized in logical directories: `/components/ui`, `/components/keypad`, `/components/screen`, `/components/system`
- Each JavaScript module MUST have a single, well-defined responsibility
- All code MUST be well-commented explaining the "why" behind implementation decisions
- Assets MUST be organized in dedicated folders: `/assets/apps`, `/assets/games`, `/assets/ringtones`, `/assets/wallpapers`, `/assets/boot`, `/assets/sounds`

**Rationale:** A modular architecture ensures maintainability, reusability, and makes it easier to add new features (apps, games, themes) without affecting existing functionality. Clear separation of concerns is critical for a complex simulation like a phone OS.

### II. Performance First

**MUST Requirements:**
- Large assets (boot sound, games, wallpapers) MUST use async loading with proper error handling
- Caching strategies MUST be implemented for frequently accessed resources (sounds, icons, wallpapers)
- Emulator assets MUST use lazy loading - only load when user launches a game
- All audio files MUST be preloaded on boot to avoid delays during interaction
- Image assets MUST be optimized (compressed, appropriate dimensions) before integration
- Performance budget: Initial page load < 3 seconds on 3G connection, keypad response < 50ms

**Rationale:** Client-side execution in browsers demands careful resource management. Poor performance would break the nostalgic experience. Users expect instant feedback on keypad presses, just like the original Nokia phone.

### III. Nostalgic Accuracy (NON-NEGOTIABLE)

**MUST Requirements:**
- UI MUST faithfully recreate the Nokia 5130 XpressMusic visual design: color scheme (blue-black-red gradient), font styles, icon layouts
- Boot sequence MUST match the original: 3-second long press → boot animation GIF + audio → home screen
- Power-off sequence MUST match the original: 3-second long press → "NOKIA" fade-out → black screen
- Keypad behavior MUST replicate original: distinct keyclick sound on every press, correct button mapping
- Home screen MUST display: wallpaper, time, battery icon, network signal, date, soft key labels ("Go to", "Music", "Menu")
- Sound feedback (keyclick, ringtones) MUST use authentic Nokia audio samples where possible

**Rationale:** This is a nostalgia project. Accuracy is paramount. Any deviation from the original Nokia 5130 experience diminishes the emotional connection users expect from this simulation.

### IV. Progressive Implementation

**MUST Requirements:**
- Development MUST proceed in this exact order:
  1. Boot sequence (power on/off, boot animation, home screen)
  2. Keypad interactivity (click sounds, button mapping, visual feedback)
  3. Basic navigation (menu system, soft keys, directional keys)
  4. Emulator integration (FreeJ2ME-Web for .jar games)
- Each phase MUST be fully functional and tested before proceeding to the next
- NO implementation of later phases until current phase is approved and stable
- Clarifying questions MUST be asked before starting each new phase

**Rationale:** Building a complex simulation requires a solid foundation. Rushing ahead creates technical debt and integration nightmares. Each phase builds upon the previous, and skipping steps leads to rework.

### V. Asset Efficiency & Management

**MUST Requirements:**
- .jar game files MUST be converted to .kar format for FreeJ2ME-Web compatibility
- Game assets MUST NOT be loaded until user selects a game to play
- Audio assets MUST be cached after first load to avoid repeated network requests
- Wallpapers MUST be loaded dynamically based on user selection, not all at once
- Default assets MUST be specified: default wallpaper, default ringtone, default game set
- File size limits: Individual assets < 5MB, total initial bundle < 10MB (excluding emulator and games)

**Rationale:** The project includes multiple large assets (games, audio, animations). Loading everything upfront would create unacceptable wait times. Smart asset management ensures fast initial load while maintaining full functionality.

## Technical Standards

**Technology Stack:**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Emulator**: FreeJ2ME-Web (WebAssembly-based Java ME emulator)
- **Audio**: Web Audio API for keyclick sounds and ringtones
- **Storage**: LocalStorage for user preferences (wallpaper, ringtone selection), IndexedDB for cached game data
- **Build Tools**: No complex build system required initially; vanilla JS preferred for simplicity
- **Browser Compatibility**: Must support modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

**Code Quality Standards:**
- Vanilla JavaScript preferred over frameworks to minimize dependencies and bundle size
- Use semantic HTML5 elements where appropriate
- CSS must use BEM (Block Element Modifier) naming convention for maintainability
- All functions must have JSDoc comments describing parameters, return values, and purpose
- Error handling must be comprehensive: try-catch for async operations, fallbacks for missing assets
- Console logging must be meaningful and filterable by module (use prefixes like `[BOOT]`, `[KEYPAD]`, `[EMULATOR]`)

**Security Considerations:**
- All user-uploaded .jar files (future feature) must be validated before conversion
- No eval() or Function() constructor usage for dynamic code execution
- Content Security Policy must be defined in HTML meta tag
- External resources (if any) must use HTTPS only

## Development Workflow

**Planning & Clarification:**
1. Before implementing any feature, the developer (Cursor AI) MUST ask clarifying questions about:
   - Expected behavior and edge cases
   - Asset availability and format
   - User interaction patterns
   - Performance expectations
2. Proposed implementation approach MUST be outlined before coding begins
3. User approval MUST be obtained before proceeding with code generation

**Implementation Process:**
1. Create/update module files following the established folder structure
2. Implement core functionality with comprehensive error handling
3. Add logging for debugging and monitoring
4. Test manually in browser with console open to verify no errors
5. Optimize for performance (check load times, memory usage, interaction responsiveness)
6. Document any assumptions or limitations in code comments

**Testing Expectations:**
- Manual testing MUST be performed for each phase before moving to the next
- Browser console MUST show no errors during normal operation
- Performance MUST be validated: initial load time, keypad response time, game launch time
- Cross-browser testing MUST be performed for major browsers before feature is considered complete

**Version Control:**
- Commit messages MUST follow conventional commits format: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Each phase completion MUST be tagged: `v1-boot`, `v2-keypad`, `v3-navigation`, `v4-emulator`
- Feature branches MUST be used for experimental features

## Governance

**Constitution Authority:**
This constitution supersedes all other development practices and preferences. Any deviation from these principles MUST be explicitly justified and approved.

**Amendment Process:**
1. Proposed amendments MUST be documented with rationale
2. Version number MUST be incremented according to semantic versioning:
   - MAJOR: Principle removal or complete redefinition (e.g., removing modularity requirement)
   - MINOR: New principle added or existing principle materially expanded
   - PATCH: Clarifications, wording improvements, typo fixes
3. Amendment approval requires explicit user consent
4. After amendment, all affected templates and documentation MUST be updated for consistency

**Compliance Review:**
- Every feature implementation MUST verify compliance with Core Principles
- Performance metrics MUST be measured and documented
- Asset management MUST be audited to ensure efficiency targets are met
- Code reviews (manual or automated) MUST check for architectural violations

**Complexity Justification:**
If any implementation requires violating a principle (e.g., loading all assets upfront for a specific reason), it MUST be justified in writing with:
- Why the violation is necessary
- What simpler alternatives were considered and why they were rejected
- What mitigation strategies will be employed to minimize negative impact

**Runtime Guidance:**
For day-to-day development decisions not explicitly covered by this constitution, refer to established web development best practices, performance optimization guides, and accessibility standards.

---

## Project Status & Achievements

### ✅ COMPLETED (v1.1.0)

- Core OS: Boot sequence (video+audio), long‑press power, power‑off fade
- State persistence via localStorage
- Home screen: wallpaper, time/date, soft keys (Go to / Menu / Music)
- Input & audio: keyclick with rapid presses, audio preload pipeline
- Menu: dynamic app icons (auto from assets), 3×3 grid, linear row nav, column loop, sliding window, correct soft‑key sizing
- Dialer & Calling: white dialer, right‑aligned number, blue calling with animated dots
- Calculator app: D‑pad operators, center=equals, soft keys Back/Equals
- Camera app: live preview, shutter sound, portrait crop (240×320), post‑capture preview with auto‑return
- Gallery app: local photo store, list view with pink focus + auto‑scroll, Delete/Open/Back, fullscreen viewer
- Calls app: recent calls list, dd/mm/yy + time, soft keys (Delete/Call/Back), logs saved on call
- Contacts app: list/filter with multi‑tap search (# backspace, * clear), view, add/edit with classic multi‑tap
- Notepad app: multi‑tap editor, list, edit/delete
- Clock app: time/date view, Alarms (new/edit/toggle/delete), Stopwatch, Timer

### 🚧 IN PROGRESS

- UI polish and cross‑browser validation
- Notepad app: multi‑tap editor, list, edit/delete
- Clock app: main time/date, Alarms/Stopwatch/Timer scaffolding

### 📋 PLANNED (next)

- FreeJ2ME‑Web integration and app launcher plumbing
- Media Player: folders (Ringtones, Videos), dynamic lists, ringtone autoplay on focus, video playback controls
- Settings: profiles, ringtone preview, brightness mock
- Performance: lazy image decode, memory caps for photos, audio recycling
- PWA/offline caching and basic tests

---

**Version**: 1.1.0 | **Ratified**: 2025-10-20 | **Last Amended**: 2025-10-21
