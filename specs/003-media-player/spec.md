# Feature Specification: Media Player (Ringtones, Music, Videos)

**Feature Branch**: `003-media-player`  
**Created**: 2025-10-22  
**Status**: Draft  
**Input**: User description: "Media Player – folders (Ringtones, Videos, Music), manifest-only listing (no fallback), ringtone autoplay on focus with debounce, video landscape with remapped keys; Home RSK opens Music; how can users add videos to play?"

## User Scenarios & Testing (mandatory)

### User Story 1 - Browse and Play Ringtones (Priority: P1)

As a user, I can open Media → Ringtones and see a list loaded dynamically from a manifest file; the first tone auto-plays on open, and moving focus plays the focused tone.

**Why this priority**: Validates dynamic listing and instant feedback; aligns with Nokia UX.

**Independent Test**: Open Ringtones; observe first item auto-plays; move focus up/down; each focused item plays within 200ms; exit stops playback.

**Acceptance Scenarios**:

1. Given Ringtones manifest exists, When I open Ringtones, Then list renders and first item plays automatically with 150ms debounce.
2. Given a tone is playing, When I navigate to another item, Then previous stops and new starts with minimal overlap.
3. Given I exit Media, When I return to Home/Menu, Then no audio continues playing.

---

### User Story 2 - Music with Controls and Home RSK (Priority: P1)

As a user, I can open Media → Music and play tracks with play/pause and volume up/down; pressing Home screen RSK opens Music directly.

**Why this priority**: Core music experience and quick access from Home.

**Independent Test**: From Home RSK, open Music; first track auto-plays; OK toggles play/pause; UP/DOWN adjust volume; exit stops playback.

**Acceptance Scenarios**:

1. Given Music list opens, When I press OK on a track, Then a control screen opens with title centered, vertical volume bar, and a bottom progress bar.
2. Given the control screen, When I press LEFT/RIGHT, Then previous/next track plays; OK toggles play/pause; UP/DOWN changes volume and the volume UI updates.
3. Given I press RSK on the control screen or list, Then I return to the previous screen (list → Media root, control → list) and playback stops when exiting to root.

---

### User Story 3 - Videos in Landscape with Remapped Keys (Priority: P2)

As a user, I can open Media → Videos, select a video, and the phone rotates to landscape to play; OK toggles play/pause, LEFT/RIGHT seek, UP/DOWN volume, LSK returns to videos list, RSK hidden.

**Why this priority**: Provides authentic video playback with intuitive controls.

**Independent Test**: Open a video; verify rotation and control mapping; LSK returns to list; exit stops playback and restores portrait.

**Acceptance Scenarios**:

1. Given a video is selected, When playback starts, Then UI rotates to landscape and keys are remapped per spec.
2. Given playback, When I press LEFT/RIGHT, Then seek by a fixed interval (e.g., 5s) and update position.
3. Given playback, When I press LSK, Then video stops and the list screen appears; RSK has no action.

---

### Edge Cases

- Missing or invalid manifests: Media sections show a friendly error and no items; no fallback scanning is attempted.
- Rapid navigation in Ringtones/Music: debounce ensures only the latest focused item plays; previous source is stopped.
- Video rotation: Ensure portrait is restored on exit even if error occurs during playback.

## Requirements (mandatory)

### Functional Requirements

- FR-001: Media root MUST show folders: Ringtones, Music, Videos with folder icons.
- FR-002: Ringtones list MUST load from `assets/ringtones/manifest.json` only; first item auto-plays; focus changes play focused with 150ms debounce; stop on exit.
- FR-003: Music list MUST load from `assets/music/manifest.json` only; no autoplay on focus; OK opens control screen with title, vertical volume bar, and bottom progress; LEFT/RIGHT prev/next; OK play/pause; UP/DOWN volume; RSK back.
- FR-004: Videos list MUST load from `assets/videos/manifest.json` only; selecting an item enters landscape playback with key remapping (OK play/pause, LEFT/RIGHT seek ±5s, UP/DOWN volume); LSK returns to list; RSK hidden.
- FR-005: Home screen RSK MUST open Music directly.
- FR-006: Media playback MUST not continue when navigating away from Media screens.
- FR-007: Users MUST be able to add media by placing files and updating the corresponding manifest.json in assets/ringtones, assets/music, or assets/videos. [Locked: no auto-scan]

### Key Entities (data)

- MediaItem: id, title, file, duration [optional], type (ringtone | music | video)
- Manifest: items[] of MediaItem (title + file required)

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: Focus-to-sound latency ≤ 200ms for Ringtones/Music 95% of the time.
- SC-002: No audio/video continues playing after exit (0% leakage across 50 navigations).
- SC-003: Video control response (play/pause/seek/volume) ≤ 150ms perceived.
- SC-004: Home RSK opens Music in ≤ 300ms with first track audible.

## Clarifications

- Session 2025-10-22
  - Q: How can users add their own media? → A: Place files in assets/ringtones, assets/music, or assets/videos and update the respective manifest.json (no directory fallback).

# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

