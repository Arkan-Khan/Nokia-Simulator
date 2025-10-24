# Implementation Plan: Games Launcher (JAR via FreeJ2ME-Web)

**Branch**: `004-games-launcher` | **Date**: 2025-10-22 | **Spec**: ../spec.md  
**Input**: Feature specification from `/specs/004-games-launcher/spec.md`

## Summary

Add Applications screen listing games from `assets/games/manifest.json` and launch selected JAR in-phone using the embedded FreeJ2ME-Web runtime. Lazy-load JARs; map phone + keyboard inputs; cleanly stop on exit.

## Technical Context

**Language/Version**: JavaScript (ES6+) in browser  
**Primary Dependencies**: FreeJ2ME-Web (WebAssembly runtime)  
**Storage**: Local assets served by the dev server  
**Testing**: Manual verification with Bounce Tales and City Bloxx  
**Target Platform**: Modern desktop browsers (Chrome/Edge)  
**Project Type**: Web single-app (vanilla JS modules)  
**Performance Goals**: List open ≤200ms; game start ≤3s for ~400KB JAR  
**Constraints**: Manifest-only listing; fixed 240×320 viewport  
**Scale/Scope**: Tens of games

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
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)
```
assets/games/
└── manifest.json           # [{ title, jar, sizeKb }]

components/
├── screen/
│   ├── GamesScreen.js      # list + launch + in-phone emulator view
│   └── ... existing screens
├── utils/
│   └── GamesManifest.js    # load and validate manifest
└── system/
    └── PhoneState.js       # add GAMES state

scripts/
└── boot.js                 # routing: Menu → Applications, input handling
```

**Structure Decision**: Single web app; add one screen + util; embed FreeJ2ME-Web into our screen.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Embedding external runtime | Needed to run JARs | Linking out breaks in-phone UX |

