# Implementation Plan: Media Player (Ringtones, Music, Videos)

**Branch**: `003-media-player` | **Date**: 2025-10-22 | **Spec**: ../spec.md  
**Input**: Feature specification from `/specs/003-media-player/spec.md`

## Summary

Add a Media Player with three folders: Ringtones (auto-play focused), Music (controls, Home RSK opens), and Videos (landscape playback with remapped keys). Listings are manifest-only (no fallback). Ensure instant, debounced focus playback and hard stop of audio/video on exit.

## Technical Context

**Language/Version**: JavaScript (ES6+) in browser  
**Primary Dependencies**: HTML5 Audio/Video elements (no external libs)  
**Storage**: Local file URLs served by dev server; no persistent DB  
**Testing**: Manual browser verification  
**Target Platform**: Modern desktop browsers (Chrome/Edge)  
**Project Type**: Web single-app (vanilla JS modules)  
**Performance Goals**: 60 FPS UX feel; ≤200ms focus→sound; ≤150ms control response  
**Constraints**: No directory scanning; manifest.json only; maintain 240×320 UI except rotated videos  
**Scale/Scope**: Lists O(10–200) items; single-threaded UI

## Constitution Check

- Modularity: Add `MediaPlayerScreen.js`, no framework; route via `ScreenManager`, `boot.js` ✔
- Performance: Debounce focus playback; stop previous streams; preload minimal ✔
- Nostalgic Accuracy: Nokia-style lists, soft-keys, key mappings; landscape video with remap ✔
- Progressive Implementation: After core OS/apps; self-contained feature ✔
- Asset Efficiency: Manifest-only loading; no upfront heavy loads ✔

GATE: Pass

## Project Structure

### Documentation (this feature)
```
specs/003-media-player/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md            # created by /speckit.tasks (future)
```

### Source Code (repository root)
```
components/
├── screen/
│   ├── MediaPlayerScreen.js   # root + folders + lists + playback UIs
│   └── ... existing screens
├── system/
│   └── PhoneState.js          # add MEDIA state
└── utils/
    └── MediaManifest.js       # load and validate manifests

scripts/
└── boot.js                    # key routing: Menu→Media, Home RSK→Music
```

**Structure Decision**: Single web app; add one screen module + small util; integrate state and routing.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Landscape rotation on Videos | Authentic UX, remapped keys | Fixed portrait would harm video UX |

