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

- [x] T001 Create modular folder structure per implementation plan
- [x] T002 [P] Extract CSS from index.html to styles/main.css with BEM naming convention
- [x] T003 [P] Create simple battery and signal icon assets in assets/icons/
- [x] T004 [P] Organize existing assets into constitution-mandated folder structure
- [x] T005 [P] Create default Nokia wallpaper asset in assets/wallpapers/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Create PhoneState.js in components/system/ with state machine logic
- [x] T007 [P] Create AudioManager.js in components/system/ with HTML5 Audio preloading
- [x] T008 [P] Create AssetLoader.js in components/system/ with async image loading
- [x] T009 [P] Create Logger.js in components/utils/ with prefixed console logging
- [x] T010 [P] Create TimeFormatter.js in components/utils/ with time/date formatting
- [x] T011 [P] Create LongPressDetector.js in components/ui/ with mouse+touch support
- [x] T012 [P] Create ButtonHandler.js in components/ui/ with existing button mappings preserved

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Power On & Boot Sequence (Priority: P1) 🎯 MVP

**Goal**: Enable users to power on the phone with authentic Nokia boot animation and audio

**Independent Test**: Load webpage, long-press red button for 3 seconds, verify boot animation plays, audio plays, and home screen appears after ~6 seconds

### Implementation for User Story 1

- [x] T013 [P] [US1] Create BootScreen.js in components/screen/ with MP4 video animation rendering
- [x] T014 [P] [US1] Create ScreenManager.js in components/screen/ as canvas coordinator
- [x] T015 [US1] Create BootController.js in scripts/ to orchestrate boot sequence
- [x] T016 [US1] Implement power-on detection in BootController using LongPressDetector
- [x] T017 [US1] Implement state transition from POWERED_OFF to BOOTING in BootController
- [x] T018 [US1] Implement simultaneous boot audio and animation playback in BootController
- [x] T019 [US1] Implement automatic transition from boot animation to home screen in BootController
- [x] T020 [US1] Add fallback text "NOKIA" animation if boot video fails to load in BootScreen.js
- [x] T021 [US1] Add error handling for autoplay restrictions in AudioManager.js
- [x] T022 [US1] Refactor index.html to use modular scripts and remove inline CSS/JS

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 3 - Power Off Sequence (Priority: P1) 🎯 MVP

**Goal**: Enable users to power off the phone with nostalgic NOKIA fade-out animation

**Independent Test**: With phone powered on, long-press red button for 3 seconds, verify "NOKIA" text appears and fades out over 2-3 seconds, then screen goes black

### Implementation for User Story 3

- [x] T023 [P] [US3] Create PowerOffScreen.js in components/screen/ with fade-out animation
- [x] T024 [US3] Implement power-off detection in BootController using LongPressDetector
- [x] T025 [US3] Implement state transition from HOME_SCREEN to POWERING_OFF in BootController
- [x] T026 [US3] Implement NOKIA text fade-out animation in PowerOffScreen.js
- [x] T027 [US3] Implement automatic transition from power-off animation to black screen in BootController
- [x] T028 [US3] Add state transition from POWERING_OFF to POWERED_OFF in BootController
- [x] T029 [US3] Ensure power button works for both power-on and power-off based on current state

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

- [x] T038 [P] [US2] Create HomeScreen.js in components/screen/ with wallpaper, time, date, icons rendering
- [x] T039 [US2] Implement time display formatting in TimeFormatter.js with locale support
- [x] T040 [US2] Implement date display formatting in TimeFormatter.js with Nokia 5130 style
- [x] T041 [US2] Implement automatic time updates every 60 seconds in HomeScreen.js
- [x] T042 [US2] Implement battery indicator rendering in HomeScreen.js (static full charge)
- [x] T043 [US2] Implement signal indicator rendering in HomeScreen.js (static full bars)
- [x] T044 [US2] Implement soft key labels rendering in HomeScreen.js ("Go to", "Menu", "Music")
- [x] T045 [US2] Integrate HomeScreen rendering into BootController after boot animation completes
- [x] T046 [US2] Implement wallpaper background rendering in HomeScreen.js with fallback to blue
- [x] T047 [US2] Add time update management: start on HOME_SCREEN, stop on other states

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 5 should all work independently

---

## Phase 7: User Story 4 - Basic Keypad Interactivity (Priority: P2)

**Goal**: Enable keypad interaction with audio feedback and visual effects

**Independent Test**: With phone powered on, press various keypad buttons, verify keyclick sound plays and visual feedback shows

### Implementation for User Story 4

- [x] T048 [P] [US4] Implement keyclick sound playback in ButtonHandler.js using AudioManager
- [x] T049 [US4] Implement visual feedback (opacity change) for button presses in ButtonHandler.js
- [x] T050 [US4] Implement hover state for keypad buttons in ButtonHandler.js (desktop only)
- [x] T051 [US4] Implement rapid key press handling without audio overlap in ButtonHandler.js
- [x] T052 [US4] Add keyclick sound to all number keys (0-9, *, #) in ButtonHandler.js
- [x] T053 [US4] Add keyclick sound to navigation keys (up, down, left, right, center) in ButtonHandler.js
- [x] T054 [US4] Add keyclick sound to soft keys (left, right) in ButtonHandler.js
- [x] T055 [US4] Add keyclick sound to call keys (green, red) in ButtonHandler.js
- [x] T056 [US4] Ensure keyclick sounds don't play when phone is powered off
- [x] T057 [US4] Test keyclick audio with rapid button presses (no audio overlap issues)

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, AND 5 should all work independently

---

## Phase 8: User Story 6 - Dialer Functionality (Priority: P2)

**Goal**: Enable dialer functionality with white background and calling animation

**Independent Test**: Press any number key from home screen, verify dialer opens with white background and number display

### Implementation for User Story 6

- [x] T058 [P] [US6] Create DialerScreen.js in components/screen/ with white background
- [x] T059 [US6] Implement number input display with right-aligned text
- [x] T060 [US6] Implement 15-18 digit limit for dialed numbers
- [x] T061 [US6] Implement soft key changes: "Go to" → "Call", "Music" → "Back"
- [x] T062 [US6] Implement calling animation with blue background and animated dots
- [x] T063 [US6] Implement call controls: green button starts call, red button ends call
- [x] T064 [US6] Add DIALER and CALLING states to PhoneState.js
- [x] T065 [US6] Integrate DialerScreen into ScreenManager.js
- [x] T066 [US6] Implement number key navigation from home screen to dialer
- [x] T067 [US6] Implement calling screen with "Calling..." animation
- [x] T068 [US6] Implement call end functionality returning to dialer

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, 5, AND 6 should all work independently

---

## Phase 9: User Story 7 - Menu System (Priority: P2)

**Goal**: Enable menu navigation with 3x3 grid and sliding view system

**Independent Test**: Press center button from home screen, verify menu opens with 3x3 grid and navigation works

### Implementation for User Story 7

- [x] T069 [P] [US7] Create MenuScreen.js in components/screen/ with 3x3 grid layout
- [x] T070 [US7] Implement 12 app icons with proper asset loading
- [x] T071 [US7] Implement sliding view system for navigation through all apps
- [x] T072 [US7] Implement focus highlighting with pink/reddish overlay
- [x] T073 [US7] Implement D-pad navigation with column-wise looping
- [x] T074 [US7] Implement row-wise navigation with sliding between views
- [x] T075 [US7] Implement app name display above grid (not below icons)
- [x] T076 [US7] Implement soft key styling: smaller text for Options/Exit, normal for Select
- [x] T077 [US7] Implement black background for soft keys to hide apps behind
- [x] T078 [US7] Add MENU state to PhoneState.js
- [x] T079 [US7] Integrate MenuScreen into ScreenManager.js
- [x] T080 [US7] Implement center button navigation from home screen to menu
- [x] T081 [US7] Implement menu exit functionality returning to home screen

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, 5, 6, AND 7 should all work independently

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
