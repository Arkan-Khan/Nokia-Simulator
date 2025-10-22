# Feature Specification: Calls, Contacts, Notepad, Clock (Nokia 5130)

**Feature Branch**: `002-calls-contacts-suite`  
**Created**: 2025-10-22  
**Status**: Draft  
**Input**: User description: "now you can refer what we are building and till now we have achieved the bootscreen, homescreen, dialer, calculator, menuscreen, camera, gallery. now i want when i dial and call any number it should show in the call app when i open from the menu as recent calls as a history in list mode just like the gallery list mode but we can note time and date when we call just like the old nokia phones you can search about, well use localstorage to save it since we are client focused here next i want to work with saving contacts and search contact screen when i open the contact app from the menu just match the design and layout of old nokia phone just research on internet and you'll get how it looked earlier the typing must use the phone keypad and that remember the 1 key have 3 alphabets so accordingly have to click to get thr proper alphabet just also reasearch on this and can use localstorage to save contacts. after that we need to build the notepad app and the typing experience using keypad only to get that nostalgic feel. later we need the clock app to be working like the old nokia phone design and interface. note to match the same screen size that we are currently using make sure of this, research on the internet to get the design and app interface and UI UX of the nokia phones make sure it should looks nostalgic and dont go out the of the existing screen size it scroll is happening in listy make sure to navigate using nav buttons only, we'll use keypad of the phone only so no external keyboard buttons will work for now. look at the current code look the constitution file and figure out things"

## User Scenarios & Testing (mandatory)

### User Story 1 - View Recent Calls (Priority: P1)

As a user, after placing a call from the Dialer/Calling screens, I can open the Calls app from the main menu and see a list of recent calls (newest first) showing the number (or contact name if matched) and the date/time of the call.

**Why this priority**: Completes the basic phone experience by recording call activity; directly tied to existing Dialer/Calling flows.

**Independent Test**: Place a call to any number; open Calls app; verify the new entry appears with the correct timestamp, type, and label.

**Acceptance Scenarios**:

1. Given the phone is on the Home/Menu state, When I dial and initiate a call, Then a new call log entry is saved with timestamp and type.
2. Given saved call logs exist, When I open Calls app, Then I see a scrollable list (3–6 visible at once) with focus highlighting and soft keys (LSK=Delete, Center=Call, RSK=Back).
3. Given a call log item is focused, When I press Center, Then the device immediately calls that number/contact.
4. Given a call log item is focused, When I press LSK, Then the entry is deleted after a short confirm prompt.
5. Given many entries, When I navigate with D‑pad, Then the list scrolls in-window (no browser scroll), maintaining 240×320 layout.

---

### User Story 2 - Save and Search Contacts (Priority: P1)

As a user, I can open the Contacts app, add new contacts (name + number) using classic multi‑tap keypad input, and search/filter contacts by typing letters with the keypad.

**Why this priority**: Contacts are core to placing calls; multi‑tap input is essential to the nostalgic experience.

**Independent Test**: Create 2–3 contacts using keypad only; search via keypad; select a contact to see details.

**Acceptance Scenarios**:

1. Given no contacts, When I press "Add" in Contacts, Then I can enter name with multi‑tap and save with a number.
2. Given contacts exist, When I press letter keys (multi‑tap), Then the list filters in real-time to matching names.
3. Given a contact is focused, When I press Center, Then I see a detail view with options like Call and Delete.
4. Given a contact is focused, When I press LSK (Options), Then I can Delete or Edit; Center opens the contact; RSK goes Back.

---

### User Story 3 - Notepad (Priority: P2)

As a user, I can open Notepad, create short notes using keypad multi‑tap input, view a list of notes (newest first), open a note to view/edit, and delete notes.

**Why this priority**: Extends productivity apps with nostalgic input experience, reinforcing keypad-only usage.

**Independent Test**: Create a note, return to list, open and edit, delete; all with keypad and D‑pad only.

**Acceptance Scenarios**:

1. Given Notepad is open, When I press "New", Then a full-screen editor opens with character counter and Save/Back soft keys.
2. Given I am editing, When I use numeric keypad, Then characters enter via multi‑tap rules with on-screen feedback for active key/letter cycle.
3. Given notes exist, When I navigate list with D‑pad, Then focus highlights items and Center opens the note.

---

### User Story 4 - Clock (Priority: P3)

As a user, I can open Clock to see a large time display matching Nokia 5130 styling and access basic time features.

**Why this priority**: Complements the home time display with a dedicated app; nostalgic look and feel.

**Independent Test**: Open Clock; verify correct time/date formatting and soft keys.

**Acceptance Scenarios**:

1. Given Clock is opened, When the system time changes, Then the display updates once per minute.
2. Given Clock is opened, When I navigate to Alarms, Then I can view list and enable/disable alarms; create/edit via LSK Options.
3. Given Clock is opened, When I navigate to Stopwatch, Then I can Start/Stop/Reset using soft keys and D‑pad.
4. Given Clock is opened, When I navigate to Timer, Then I can set a duration with D‑pad and Start/Cancel via soft keys.

---

### Edge Cases

- Call placed to a number that matches an existing contact: list should show the contact name with the number secondary.
- Very long call history or contacts list: list virtualization maintains smooth navigation without visual jump.
- Multi‑tap timing: rapid presses on the same key cycle letters; pause commits the character. Timeout default assumed 800–1000ms.
- Duplicate contacts or identical names: secondary sort by creation time; show number in list to distinguish.
- Storage limits: if localStorage approaches quota, show a warning and prevent data loss.

## Requirements (mandatory)

### Functional Requirements

- FR-001: Calls app MUST display a list of recent calls (newest first), with number or matched contact name, date and time.
- FR-002: System MUST automatically save a call log entry upon initiating a call from the Dialer/Calling screen.
- FR-003: Call log entries MUST persist in local storage across sessions; deleting the app state must not erase logs unless explicitly cleared.
- FR-004: Calls app list MUST be navigable using D‑pad only, with focus highlight and soft keys (e.g., Options/Select/Back or Delete/Call/Back).
- FR-005: Calls app MUST use soft keys mapping: LSK=Delete (with confirm), Center=Call, RSK=Back; selecting an item with Center initiates immediate call back.
- FR-006: Contacts app MUST support creating, listing, searching, viewing, editing, and deleting contacts using keypad-only input and D‑pad.
- FR-007: Contacts app MUST implement multi‑tap keypad input for text fields (names) with on‑screen letter cycling feedback.
- FR-008: Contacts MUST persist in local storage and load at startup; format changes MUST include basic migration handling.
- FR-009: Notepad app MUST allow creating, listing, editing, and deleting notes via keypad multi‑tap; newest first ordering.
- FR-010: Notepad notes MUST persist in local storage across sessions.
- FR-011: Clock app MUST show large time/date and update no less than once per minute while open.
- FR-012: All screens MUST maintain the existing 240×320 layout, Nokia‑style UI, and avoid browser scrolling; navigation via D‑pad and soft keys only.
- FR-013: No external keyboard typing MUST be required or used; only the on‑phone keypad is recognized for text input.

### Key Entities (data)

- CallLogEntry: id, timestamp, number, type (outgoing/incoming/missed) [default: outgoing only], duration [optional], contactId [optional]
- Contact: id, name, primaryNumber, otherNumbers [optional], createdAt, updatedAt
- Note: id, title [first line], body, createdAt, updatedAt
- Alarm [if in scope]: id, time, enabled, repeatDays, label

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: After placing a call, a call log entry appears in the Calls app within 1 second.
- SC-002: Users can create and find a contact using keypad-only input in under 30 seconds (80% of attempts for 3 test contacts).
- SC-003: Multi‑tap input responds correctly to fast presses with <100ms perceived latency and correct letter cycling in 95% of cases.
- SC-004: Lists (Calls, Contacts, Notes) remain navigable at 60 FPS feel (no jank) for at least 500 items.
- SC-005: All data (call logs, contacts, notes) persists across sessions and browser refreshes with 0% data loss in normal use.

---

## Assumptions

- Screen size is fixed at 240×320; all lists use in‑screen scrolling controlled by D‑pad, never page scroll.
- Multi‑tap mapping uses classic 2–9 letter groups; `1` is punctuation; `0` is space. Timeout 900ms unless user continues typing.
- Sounds (keyclick) continue to function; no new sounds required for these apps.

## Decisions

- Contacts input: Classic Nokia multi‑tap on keys 2–9; `1` punctuation, `0` space; ~900ms commit timeout.
- Calls app select behavior: Soft‑key driven (LSK=Delete, Center=Call, RSK=Back) without a separate detail screen.
- Clock scope: Full set (Alarms, Stopwatch, Timer) with simple sub‑screens and D‑pad navigation.

