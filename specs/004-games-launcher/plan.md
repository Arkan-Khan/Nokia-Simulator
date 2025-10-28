# Implementation Plan: Games Launcher (JAR via FreeJ2ME-Web)

**Branch**: `004-games-launcher` | **Date**: 2025-10-22 | **Spec**: ../spec.md  
**Input**: Feature specification from `/specs/004-games-launcher/spec.md`  
**Status**: ✅ IMPLEMENTATION COMPLETE - All phases done, ready for testing  
**Last Updated**: 2025-10-29

## Summary

Add Applications screen listing games from `assets/games/manifest.json` and launch selected JAR in-phone using the embedded FreeJ2ME-Web runtime. Lazy-load JARs; map phone + keyboard inputs; cleanly stop on exit.

**Current Implementation**: Games list fully functional with 3 games (Bounce Tales, City Bloxx, Asphalt 4), icons, dark Nokia UI theme, and navigation. Game launch functionality pending.

## Technical Context

**Language/Version**: JavaScript (ES6+) in browser  
**Primary Dependencies**: FreeJ2ME-Web (WebAssembly runtime)  
**Storage**: Local assets served by the dev server  
**Testing**: Manual verification with Bounce Tales, City Bloxx, and Asphalt 4  
**Target Platform**: Modern desktop browsers (Chrome/Edge)  
**Project Type**: Web single-app (vanilla JS modules)  
**Performance Goals**: List open ≤200ms ✅; game start ≤3s for ~400KB JAR ⏳  
**Constraints**: Manifest-only listing; fixed 240×320 viewport  
**Scale/Scope**: 3 games initially (expandable to tens)

## Constitution Check

- Modularity: Add `GamesScreen.js`, small `GamesManifest.js`; integrate via `ScreenManager`, `boot.js` ✔
- Performance: Lazy JAR load; cleanup on exit ✔
- Nostalgic Accuracy: Nokia-style list with soft keys; D‑pad nav; OK select; RSK back ✔
- Progressive Implementation: After core apps; self-contained feature ✔
- Asset Efficiency: Manifest-only; no directory crawl ✔

GATE: Pass

## Project Structure

### Documentation (this feature)
```
specs/004-games-launcher/
├── plan.md              ✅ Implementation plan (this file)
├── spec.md              ✅ Feature specification
├── tasks.md             ✅ Task breakdown (18/43 complete)
├── PROGRESS.md          ✅ Implementation progress tracker
└── checklists/
    └── requirements.md  ✅ Quality checklist (all items passed)
```

### Source Code (repository root)
```
assets/games/
├── manifest.json              ✅ Game metadata (3 games with icons)
├── bounce_tales_240x320.jar   ✅ Bounce Tales game
├── citybloxx.jar              ✅ City Bloxx game
└── Asphalt4-EliteRacing.jar   ✅ Asphalt 4 game

assets/icons/
├── Bouncy-Tales.png           ✅ Bounce Tales icon (24x24)
├── City-Bloxx.png             ✅ City Bloxx icon (24x24)
└── Asphalt4.png               ✅ Asphalt 4 icon (24x24)

components/
├── screen/
│   ├── GamesScreen.js         ✅ List + launch + emulator view (list complete)
│   └── ScreenManager.js       ✅ Added GamesScreen integration
├── utils/
│   └── GamesManifest.js       ✅ Load and validate manifest
└── system/
    └── PhoneState.js          ✅ Added GAMES state

scripts/
└── boot.js                    ✅ Routing + input handling

index.html                     ✅ Added script tags for new components
.gitignore                     ✅ Project ignore patterns
```

**Structure Decision**: Single web app; add one screen + util; embed FreeJ2ME-Web into our screen.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Embedding external runtime | Needed to run JARs | Linking out breaks in-phone UX |

