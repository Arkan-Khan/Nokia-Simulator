---
description: "Task list for Games Launcher implementation"
---

# Tasks: Games Launcher (JAR via FreeJ2ME-Web)

**Input**: Design documents from `/specs/004-games-launcher/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not requested - manual verification only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Status**: Phase 1-3 COMPLETE ✅ | Currently implementing Phase 4 (Game Launch)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Project root: `c:\Users\arkan\Desktop\Code\Nokia\`
- Components: `components/screen/`, `components/utils/`, `components/system/`
- Assets: `assets/games/`
- Scripts: `scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create basic structure and manifest for games feature

- [X] T001 Create games asset directory and manifest.json at `assets/games/manifest.json`
- [X] T002 [P] Add Bounce Tales JAR to `assets/games/` directory
- [X] T003 [P] Add City Bloxx JAR to `assets/games/` directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add GAMES state to PhoneStates enum in `components/system/PhoneState.js`
- [X] T005 Add GAMES state transitions (HOME_SCREEN ↔ GAMES, MENU ↔ GAMES) in `components/system/PhoneState.js`
- [X] T006 Create GamesManifest utility class in `components/utils/GamesManifest.js`
- [X] T007 Implement manifest loading and validation logic in `components/utils/GamesManifest.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Games (Priority: P1) 🎯 MVP

**Goal**: Display manifest-driven list of games with D-pad navigation and lazy loading

**Independent Test**: Open Applications; verify both Bounce Tales and City Bloxx appear with focus highlight and Back soft key. Navigate with D-pad; no JAR loading occurs. Press RSK to return to Menu.

### Implementation for User Story 1

- [X] T008 [US1] Create GamesScreen.js skeleton in `components/screen/GamesScreen.js`
- [X] T009 [US1] Implement renderGamesList method with Nokia-style UI in `components/screen/GamesScreen.js`
- [X] T010 [US1] Add D-pad navigation (up/down arrows, 2/8 keys) handler in `components/screen/GamesScreen.js`
- [X] T011 [US1] Implement focus highlight and visual feedback in `components/screen/GamesScreen.js`
- [X] T012 [US1] Add soft key labels (LSK: Options, RSK: Back) in `components/screen/GamesScreen.js`
- [X] T013 [US1] Implement RSK back navigation to Menu in `components/screen/GamesScreen.js`
- [X] T014 [US1] Initialize GamesScreen instance in `components/screen/ScreenManager.js` constructor
- [X] T015 [US1] Add renderGamesScreen method to ScreenManager in `components/screen/ScreenManager.js`
- [X] T016 [US1] Add GAMES state handler to boot.js in `scripts/boot.js` (Menu → Games routing)
- [X] T017 [US1] Add input mapping for Games screen navigation in `scripts/boot.js`
- [X] T018 [US1] Ensure no JAR assets are loaded until selection (lazy load validation)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Launch and Play (Priority: P1)

**Goal**: Launch selected game in embedded FreeJ2ME-Web runtime with proper input mapping and resource cleanup

**Independent Test**: Select Bounce Tales; verify emulator canvas appears in 240×320 viewport; test phone keys (2/4/6/8, OK, soft keys) and keyboard (arrows, Enter, Esc) work correctly; press RSK to exit and verify resources are freed.

### Implementation for User Story 2

- [ ] T019 [US2] Implement game selection handler (OK key press) in `components/screen/GamesScreen.js`
- [ ] T020 [US2] Add emulator container initialization in `components/screen/GamesScreen.js`
- [ ] T021 [US2] Integrate FreeJ2ME-Web launcher initialization in `components/screen/GamesScreen.js`
- [ ] T022 [US2] Implement JAR loading logic with selected game path in `components/screen/GamesScreen.js`
- [ ] T023 [US2] Configure FreeJ2ME-Web canvas to fit 240×320 viewport (152×202 px display area) in `components/screen/GamesScreen.js`
- [ ] T024 [US2] Map phone keypad inputs to emulator (2/4/6/8 → arrows, OK → fire, LSK/RSK → softkeys) in `components/screen/GamesScreen.js`
- [ ] T025 [US2] Map keyboard inputs to emulator (arrows, Enter, Esc, number keys) in `components/screen/GamesScreen.js`
- [ ] T026 [US2] Implement input debouncing to prevent double-processing in `components/screen/GamesScreen.js`
- [ ] T027 [US2] Add exit handler (RSK/Esc press during gameplay) in `components/screen/GamesScreen.js`
- [ ] T028 [US2] Implement emulator cleanup (stop loops, remove canvas, free audio) in `components/screen/GamesScreen.js`
- [ ] T029 [US2] Return to Games list after exit with focus restored in `components/screen/GamesScreen.js`
- [ ] T030 [US2] Add END key handler to return to Menu from running game in `scripts/boot.js`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Error Handling (Priority: P2)

**Goal**: Display friendly error messages when JAR fails to load and allow user to return to list

**Independent Test**: Temporarily break a manifest entry (invalid JAR path); selecting it shows an error message; RSK returns to list without crash.

### Implementation for User Story 3

- [ ] T031 [US3] Add try-catch wrapper around JAR loading in `components/screen/GamesScreen.js`
- [ ] T032 [US3] Implement error message display with Nokia-style dialog in `components/screen/GamesScreen.js`
- [ ] T033 [US3] Add error recovery: RSK dismisses error and returns to list in `components/screen/GamesScreen.js`
- [ ] T034 [US3] Add logging for failed game loads in `components/screen/GamesScreen.js`
- [ ] T035 [US3] Validate manifest entries on load (check JAR path exists) in `components/utils/GamesManifest.js`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge cases

- [ ] T036 [P] Add loading indicator for large JARs (>1MB) in `components/screen/GamesScreen.js`
- [ ] T037 [P] Performance testing: verify list opens in ≤200ms
- [ ] T038 [P] Performance testing: verify game startup ≤3s for 400KB JAR
- [ ] T039 [P] Edge case testing: Test both games (Bounce Tales, City Bloxx) launch and play
- [ ] T040 [P] Edge case testing: Verify keyboard and phone keys work without conflicts
- [ ] T041 [P] Edge case testing: Verify RSK/END exit releases all resources (CPU/audio)
- [ ] T042 Add inline code documentation and JSDoc comments
- [ ] T043 Update README.md with Games feature description (if applicable)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) and User Story 2 (P1) are tightly coupled - recommend sequential
  - User Story 3 (P2) depends on User Story 2 being complete
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 being complete (needs list UI to launch from)
- **User Story 3 (P2)**: Depends on User Story 2 being complete (error handling for launch flow)

### Within Each User Story

- Core screen structure before UI rendering
- UI rendering before input handling
- Input handling before integration with ScreenManager
- ScreenManager integration before boot.js routing

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel (different JAR files)
- **Phase 2**: T006 and T007 can run in parallel with T004 and T005 (different files)
- **Phase 3 (US1)**: T008-T013 can be worked on in rapid sequence; T014-T017 integrate after
- **Phase 4 (US2)**: T019-T026 are sequential (same file, dependent logic)
- **Phase 5 (US3)**: T031-T034 are sequential in same file; T035 can be parallel
- **Phase 6**: T036-T041 can all run in parallel (testing and different concerns)

---

## Parallel Example: User Story 1

```bash
# Core screen implementation (sequential):
Task T008: "Create GamesScreen.js skeleton"
Task T009: "Implement renderGamesList method"
Task T010: "Add D-pad navigation handler"
Task T011: "Implement focus highlight"

# Integration tasks (after core is done):
Task T014: "Initialize GamesScreen in ScreenManager"
Task T015: "Add renderGamesScreen method to ScreenManager"
Task T016: "Add GAMES state handler to boot.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup (manifest + JARs)
2. Complete Phase 2: Foundational (state management + manifest loader)
3. Complete Phase 3: User Story 1 (browse games list)
4. **CHECKPOINT**: Test list independently
5. Complete Phase 4: User Story 2 (launch and play)
6. **CHECKPOINT**: Test full flow (browse → select → play → exit)
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Games list works!
3. Add User Story 2 → Test independently → Full game launch works!
4. Add User Story 3 → Test independently → Error handling complete
5. Polish phase → Performance and edge cases validated

### Timeline Estimate

- **Phase 1**: 30 minutes (create manifest, add JARs)
- **Phase 2**: 1 hour (state management, manifest loader)
- **Phase 3**: 2-3 hours (games list UI with navigation)
- **Phase 4**: 4-6 hours (FreeJ2ME-Web integration, input mapping, cleanup)
- **Phase 5**: 1 hour (error handling)
- **Phase 6**: 1-2 hours (polish and testing)

**Total Estimated Time**: 9-13 hours

---

## Notes

- **FreeJ2ME-Web Integration**: The most complex part is T021-T026 (Phase 4) - embedding the emulator runtime
- **Input Mapping**: Critical to map both phone keypad AND keyboard correctly (T024-T026)
- **Resource Cleanup**: Must ensure T028 properly releases all emulator resources to avoid memory leaks
- **Lazy Loading**: T018 is critical - verify no JAR loads happen until selection (performance requirement)
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

---

## Success Metrics

After implementation, verify these criteria from spec.md:

- **SC-001**: Games list opens in ≤200ms with 0 JAR loads (measure with T037)
- **SC-002**: Game startup ≤3s for 400KB JAR on typical desktop (measure with T038)
- **SC-003**: Back/Exit releases emulator 100% of attempts (verify with T041)
- **SC-004**: Input latency feels instant ≤100ms (verify with T039)
