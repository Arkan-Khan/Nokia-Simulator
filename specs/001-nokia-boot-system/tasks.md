# Tasks: Nokia 5130 Boot System

**Input**: Design documents from `/specs/001-nokia-boot-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Manual browser testing only - no automated tests requested in specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Client-side web app**: `components/`, `assets/`, `styles/`, `scripts/` at repository root
- Paths shown below assume modular client-side structure - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create modular folder structure per implementation plan
- [ ] T002 [P] Extract CSS from index.html to styles/main.css with BEM naming convention
- [ ] T003 [P] Create simple battery and signal icon assets in assets/icons/
- [ ] T004 [P] Organize existing assets into constitution-mandated folder structure
- [ ] T005 [P] Create default Nokia wallpaper asset in assets/wallpapers/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 [P] Create PhoneState.js in components/system/ with state machine logic
- [ ] T007 [P] Create AudioManager.js in components/system/ with HTML5 Audio preloading
- [ ] T008 [P] Create AssetLoader.js in components/system/ with async image loading
- [ ] T009 [P] Create Logger.js in components/utils/ with prefixed console logging
- [ ] T010 [P] Create TimeFormatter.js in components/utils/ with time/date formatting
- [ ] T011 [P] Create LongPressDetector.js in components/ui/ with mouse+touch support
- [ ] T012 [P] Create ButtonHandler.js in components/ui/ with existing button mappings preserved

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Power On & Boot Sequence (Priority: P1) 🎯 MVP

**Goal**: Enable users to power on the phone with authentic Nokia boot animation and audio

**Independent Test**: Load webpage, long-press red button for 3 seconds, verify boot animation plays, audio plays, and home screen appears after ~6 seconds

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create BootScreen.js in components/screen/ with GIF animation rendering
- [ ] T014 [P] [US1] Create ScreenManager.js in components/screen/ as canvas coordinator
- [ ] T015 [US1] Create BootController.js in scripts/ to orchestrate boot sequence
- [ ] T016 [US1] Implement power-on detection in BootController using LongPressDetector
- [ ] T017 [US1] Implement state transition from POWERED_OFF to BOOTING in BootController
- [ ] T018 [US1] Implement simultaneous boot audio and animation playback in BootController
- [ ] T019 [US1] Implement automatic transition from boot animation to home screen in BootController
- [ ] T020 [US1] Add fallback text "NOKIA" animation if boot GIF fails to load in BootScreen.js
- [ ] T021 [US1] Add error handling for autoplay restrictions in AudioManager.js
- [ ] T022 [US1] Refactor index.html to use modular scripts and remove inline CSS/JS

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 3 - Power Off Sequence (Priority: P1) 🎯 MVP

**Goal**: Enable users to power off the phone with nostalgic NOKIA fade-out animation

**Independent Test**: With phone powered on, long-press red button for 3 seconds, verify "NOKIA" text appears and fades out over 2-3 seconds, then screen goes black

### Implementation for User Story 3

- [ ] T023 [P] [US3] Create PowerOffScreen.js in components/screen/ with fade-out animation
- [ ] T024 [US3] Implement power-off detection in BootController using LongPressDetector
- [ ] T025 [US3] Implement state transition from HOME_SCREEN to POWERING_OFF in BootController
- [ ] T026 [US3] Implement NOKIA text fade-out animation in PowerOffScreen.js
- [ ] T027 [US3] Implement automatic transition from power-off animation to black screen in BootController
- [ ] T028 [US3] Add state transition from POWERING_OFF to POWERED_OFF in BootController
- [ ] T029 [US3] Ensure power button works for both power-on and power-off based on current state

**Checkpoint**: At this point, User Stories 1 AND 3 should both work independently

---

## Phase 5: User Story 5 - Asset Loading & Performance (Priority: P1) 🎯 MVP

**Goal**: Ensure smooth, responsive experience with proper asset caching and performance optimization

**Independent Test**: Test on throttled 3G connection, verify page interactive within 3 seconds, boot assets load without blocking, audio cached after first load

### Implementation for User Story 5

- [ ] T030 [P] [US5] Implement async asset preloading in AssetLoader.js without blocking page render
- [ ] T031 [US5] Implement browser cache utilization for audio assets in AudioManager.js
- [ ] T032 [US5] Add performance monitoring and logging in Logger.js for load times
- [ ] T033 [US5] Optimize asset loading order: critical assets first, non-critical in background
- [ ] T034 [US5] Implement asset loading progress feedback (optional enhancement)
- [ ] T035 [US5] Add memory management to prevent asset loading leaks
- [ ] T036 [US5] Validate performance targets: <3s interactive, <10s boot sequence
- [ ] T037 [US5] Test asset caching: verify second boot uses cached audio (0ms network time)

**Checkpoint**: At this point, User Stories 1, 3, AND 5 should all work with optimal performance

---

## Phase 6: User Story 2 - Home Screen Live Updates (Priority: P2)

**Goal**: Display live time updates and accurate status indicators on home screen

**Independent Test**: After boot sequence, observe home screen for 1 minute, verify time updates every minute and date is accurate

### Implementation for User Story 2

- [ ] T038 [P] [US2] Create HomeScreen.js in components/screen/ with wallpaper, time, date, icons rendering
- [ ] T039 [US2] Implement time display formatting in TimeFormatter.js with locale support
- [ ] T040 [US2] Implement date display formatting in TimeFormatter.js with Nokia 5130 style
- [ ] T041 [US2] Implement automatic time updates every 60 seconds in HomeScreen.js
- [ ] T042 [US2] Implement battery indicator rendering in HomeScreen.js (static full charge)
- [ ] T043 [US2] Implement signal indicator rendering in HomeScreen.js (static full bars)
- [ ] T044 [US2] Implement soft key labels rendering in HomeScreen.js ("Go to", "Menu", "Music")
- [ ] T045 [US2] Integrate HomeScreen rendering into BootController after boot animation completes
- [ ] T046 [US2] Implement wallpaper background rendering in HomeScreen.js with fallback to blue
- [ ] T047 [US2] Add time update management: start on HOME_SCREEN, stop on other states

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 5 should all work independently

---

## Phase 7: User Story 4 - Basic Keypad Interactivity (Priority: P2)

**Goal**: Enable keypad interaction with audio feedback and visual effects

**Independent Test**: With phone powered on, press various keypad buttons, verify keyclick sound plays and visual feedback shows

### Implementation for User Story 4

- [ ] T048 [P] [US4] Implement keyclick sound playback in ButtonHandler.js using AudioManager
- [ ] T049 [US4] Implement visual feedback (opacity change) for button presses in ButtonHandler.js
- [ ] T050 [US4] Implement hover state for keypad buttons in ButtonHandler.js (desktop only)
- [ ] T051 [US4] Implement rapid key press handling without audio overlap in ButtonHandler.js
- [ ] T052 [US4] Add touch event support for mobile devices in ButtonHandler.js
- [ ] T053 [US4] Integrate ButtonHandler with existing button mappings in index.html
- [ ] T054 [US4] Add keyclick sound preloading during boot sequence in BootController
- [ ] T055 [US4] Implement button press response time validation (<50ms target)

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T056 [P] Add comprehensive error handling across all modules
- [ ] T057 [P] Add JSDoc comments to all public functions per constitution
- [ ] T058 [P] Optimize performance: measure and validate all targets
- [ ] T059 [P] Add cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] T060 [P] Add mobile device testing (touch events, responsive design)
- [ ] T061 [P] Validate all functional requirements (FR-001 through FR-030)
- [ ] T062 [P] Validate all success criteria (SC-001 through SC-008)
- [ ] T063 [P] Run quickstart.md validation checklist
- [ ] T064 [P] Performance audit: check memory usage, load times, responsiveness
- [ ] T065 [P] Code cleanup and refactoring for maintainability

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 5 (P1)**: Can start after Foundational (Phase 2) - Affects all other stories but can be implemented in parallel
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for home screen display
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Models before services
- Services before controllers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All screen components (BootScreen, HomeScreen, PowerOffScreen) can be developed in parallel
- All utility modules (Logger, TimeFormatter) can be developed in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all screen components for User Story 1 together:
Task: "Create BootScreen.js in components/screen/ with GIF animation rendering"
Task: "Create ScreenManager.js in components/screen/ as canvas coordinator"

# Launch all utility components together:
Task: "Create Logger.js in components/utils/ with prefixed console logging"
Task: "Create TimeFormatter.js in components/utils/ with time/date formatting"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 3, 5 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Power On & Boot)
4. Complete Phase 4: User Story 3 (Power Off)
5. Complete Phase 5: User Story 5 (Asset Loading & Performance)
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Core MVP!)
3. Add User Story 3 → Test independently → Deploy/Demo (Power cycle complete!)
4. Add User Story 5 → Test independently → Deploy/Demo (Performance optimized!)
5. Add User Story 2 → Test independently → Deploy/Demo (Live updates!)
6. Add User Story 4 → Test independently → Deploy/Demo (Keypad interaction!)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Boot sequence)
   - Developer B: User Story 3 (Power off)
   - Developer C: User Story 5 (Performance)
3. P1 stories complete and integrate independently
4. Then add P2 stories (US2, US4) in parallel

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing only - no automated tests per specification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 65
- **Setup**: 5 tasks
- **Foundational**: 7 tasks  
- **User Story 1 (P1)**: 10 tasks
- **User Story 3 (P1)**: 7 tasks
- **User Story 5 (P1)**: 8 tasks
- **User Story 2 (P2)**: 10 tasks
- **User Story 4 (P2)**: 8 tasks
- **Polish**: 10 tasks

**Parallel Opportunities**: 35 tasks can run in parallel
**Independent Test Criteria**: Each user story has clear, measurable test criteria
**Suggested MVP Scope**: User Stories 1, 3, 5 (P1 stories only)
**Format Validation**: All tasks follow required checklist format with checkboxes, IDs, labels, and file paths
