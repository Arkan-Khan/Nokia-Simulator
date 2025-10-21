# Quickstart: Nokia 5130 Boot System

**Feature**: Nokia 5130 Boot System  
**Date**: 2025-10-20  
**Purpose**: Developer guide for running, testing, and debugging the boot system.

---

## Prerequisites

**Required Assets** (verify these exist in your project):
```
assets/
├── boot/
│   ├── Boot gif.gif             ✅ Required for boot animation
│   └── nokia_boot_audio.mp3     ✅ Required for boot sound
├── sounds/
│   └── keyclick.mp3             ⚠️  Optional (for future keypad phase)
└── wallpapers/
    └── default.jpg              ⚠️  Optional (fallback to blue background)
```

**Browser Requirements**:
- Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+
- JavaScript enabled
- Audio playback enabled (or user will see "Enable sound" prompt)

---

## Running Locally

### Method 1: Direct File Open (Recommended for Quick Testing)

1. Open project root in your file explorer
2. Double-click `index.html`
3. Browser opens with Nokia phone displayed
4. Long-press the red button (bottom-right) for 3 seconds to power on

**Note**: Some browsers restrict local file audio playback. If boot sound doesn't play, use Method 2.

---

### Method 2: Local HTTP Server (Recommended for Development)

**Option A: Using Python** (if installed)
```bash
# Python 3
cd /path/to/nokia-5130-emulator
python -m http.server 8000

# Open browser to: http://localhost:8000
```

**Option B: Using Node.js** (if installed)
```bash
# Install http-server globally (once)
npm install -g http-server

# Run from project root
cd /path/to/nokia-5130-emulator
http-server -p 8000

# Open browser to: http://localhost:8000
```

**Option C: Using VS Code Live Server Extension**
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Browser opens automatically

---

## Testing the Boot Sequence

### 1. Initial State (Powered Off)

**Expected Behavior**:
- ✅ Nokia phone body visible
- ✅ Screen completely black
- ✅ No audio playing
- ✅ Console shows: `[STATE] Current state: POWERED_OFF`

**Troubleshooting**:
- If phone body not visible → Check `Nokia.png` exists in project root
- If screen not black → Open DevTools Console, check for canvas errors

---

### 2. Power On (Long-Press Red Button)

**Actions**:
1. Locate the red button (bottom-right, labeled "END" in code)
2. Click and hold for 3 seconds
3. Release after you feel/see visual feedback

**Expected Behavior**:
- ✅ After 3 seconds, console shows: `[LONGPRESS] Triggered after 3 seconds`
- ✅ Console shows: `[STATE] POWERED_OFF → BOOTING`
- ✅ Boot animation GIF plays on screen (Nokia logo animation)
- ✅ Boot audio plays simultaneously (`nokia_boot_audio.mp3`)
- ✅ After ~6 seconds, console shows: `[BOOT] Animation complete`
- ✅ Console shows: `[STATE] BOOTING → HOME_SCREEN`
- ✅ Home screen appears: wallpaper, time, date, battery/signal icons, soft key labels

**Troubleshooting**:
| Issue | Cause | Solution |
|-------|-------|----------|
| No boot animation | GIF failed to load | Check `assets/boot/Boot gif.gif` exists |
| No boot sound | Autoplay blocked | Click anywhere first, then power on |
| Boot GIF not visible | Canvas render error | Check console for `[BOOT]` errors |
| Home screen doesn't appear | State transition failed | Check console for `[STATE]` errors |

---

### 3. Home Screen Live Updates

**Expected Behavior**:
- ✅ Time displays in HH:MM format (e.g., "14:35")
- ✅ Date displays in "DayOfWeek DD.MM" format (e.g., "Monday 20.10")
- ✅ Time updates automatically every 60 seconds
- ✅ Battery icon shows in top-right (full charge)
- ✅ Signal icon shows in top-left (full bars)
- ✅ Soft key labels at bottom: "Go to" (left), "Menu" (center), "Music" (right)

**Manual Testing**:
1. Power on phone (see step 2)
2. Wait 60 seconds
3. Verify time updates by one minute
4. Check date matches your system date

**Troubleshooting**:
| Issue | Cause | Solution |
|-------|-------|----------|
| Time not updating | Auto-update not started | Check console for `[HOME]` errors |
| Time is wrong | System time incorrect | Sync your system clock |
| Icons not visible | Image assets missing | Check `assets/icons/` folder |

---

### 4. Power Off (Long-Press Red Button)

**Actions**:
1. While phone is on (showing home screen)
2. Long-press red button for 3 seconds
3. Release

**Expected Behavior**:
- ✅ Console shows: `[LONGPRESS] Triggered after 3 seconds`
- ✅ Console shows: `[STATE] HOME_SCREEN → POWERING_OFF`
- ✅ "NOKIA" text appears on screen
- ✅ "NOKIA" fades out over 2-3 seconds
- ✅ Console shows: `[STATE] POWERING_OFF → POWERED_OFF`
- ✅ Screen goes completely black
- ✅ You can now power on again

**Troubleshooting**:
| Issue | Cause | Solution |
|-------|-------|----------|
| No fade-out animation | PowerOffScreen render error | Check console for `[POWEROFF]` errors |
| Phone won't turn off | State stuck in HOME_SCREEN | Refresh page and try again |

---

## Performance Testing

### Measure Initial Load Time

**Using Chrome DevTools**:
1. Open DevTools (F12)
2. Go to "Network" tab
3. Check "Disable cache"
4. Reload page (Ctrl+R)
5. Look at bottom status bar for total load time

**Target Metrics**:
- ✅ DOMContentLoaded: < 1 second
- ✅ Page fully loaded: < 3 seconds
- ✅ Power button interactive: < 3 seconds

**How to Verify**: Try powering on immediately after page load. If long-press works, page is interactive.

---

### Measure Boot Sequence Time

**Stopwatch Method**:
1. Power on phone (start timer)
2. Wait for home screen to appear (stop timer)
3. Total time should be: 3s (long-press) + 6s (animation) = ~9 seconds

**Target**: < 10 seconds total

---

### Check Asset Caching

**Using Chrome DevTools**:
1. Open DevTools → Network tab
2. Power on phone (boot audio plays)
3. Power off phone
4. Power on again
5. Check Network tab: `nokia_boot_audio.mp3` should show "(from disk cache)"

**Target**: Second boot should use cached audio (0ms network time)

---

### Test on Throttled Connection

**Simulate 3G Network**:
1. Open DevTools → Network tab
2. Change throttling dropdown from "No throttling" to "Slow 3G"
3. Hard refresh page (Ctrl+Shift+R)
4. Verify page interactive within 3 seconds

**Target**: Even on 3G, power button should work within 3 seconds

---

## Debugging Tips

### Enable Verbose Logging

The boot system uses prefixed console logs. To filter:

**Chrome DevTools Console Filters**:
- Show only boot logs: Type `[BOOT]` in filter box
- Show only audio logs: Type `[AUDIO]` in filter box
- Show only state logs: Type `[STATE]` in filter box
- Show all system logs: Type `[` in filter box

---

### Common Console Messages

**Normal Operation**:
```
[ASSET] Image loaded: boot_gif
[AUDIO] Preloaded: boot_sound
[STATE] Current state: POWERED_OFF
[LONGPRESS] Started
[LONGPRESS] Triggered after 3 seconds
[STATE] POWERED_OFF → BOOTING
[AUDIO] Playing: boot_sound
[BOOT] Animation started
[BOOT] Animation complete
[STATE] BOOTING → HOME_SCREEN
[HOME] Rendered home screen
[HOME] Auto-update started
```

**Error Scenarios**:
```
[AUDIO] Autoplay blocked for boot_sound: NotAllowedError
  → Solution: Click anywhere on page first

[ASSET] Image failed: boot_gif
  → Solution: Check assets/boot/Boot gif.gif exists

[STATE] Invalid transition: BOOTING → POWERING_OFF
  → Solution: Wait for boot to complete before powering off

[BOOT] Failed to load GIF: Error
  → Solution: Using fallback text animation (expected behavior)
```

---

### Browser Compatibility Issues

**Safari (iOS/macOS)**:
- Autoplay restrictions are strictest
- **Solution**: Always require user interaction (power button press) before audio

**Firefox**:
- GIF animation may stutter on slower machines
- **Solution**: Acceptable (constitution allows for device limitations)

**Mobile Chrome**:
- Long-press may trigger context menu
- **Solution**: `preventDefault()` on touchstart (already implemented)

---

## Manual Test Checklist

Before marking boot system as complete, verify:

### Functional Requirements

- [ ] FR-001: Phone body image renders with black screen on load
- [ ] FR-002: Long-press (3s) on red button detected (mouse + touch)
- [ ] FR-003: Boot animation GIF and audio play simultaneously
- [ ] FR-004: Transition to home screen after animation completes
- [ ] FR-005: Power-off shows "NOKIA" fade-out, then black screen
- [ ] FR-006: Short press (<3s) on red button does nothing
- [ ] FR-007: Cannot trigger multiple boot sequences simultaneously

### Home Screen Display

- [ ] FR-008: Default wallpaper displayed (or blue fallback)
- [ ] FR-009: Current time displayed in HH:MM format
- [ ] FR-010: Current date displayed in "Day DD.MM" format
- [ ] FR-011: Battery icon in top-right
- [ ] FR-012: Signal icon in top-right
- [ ] FR-013: Soft key labels: "Go to", "Menu", "Music"
- [ ] FR-014: Time updates every 60 seconds automatically

### Performance

- [ ] FR-020: Initial page load < 1 second on 3G
- [ ] FR-021: Power button interactive < 3 seconds
- [ ] FR-022: Boot assets preloaded without blocking
- [ ] FR-023: Audio cached after first load

### Error Handling

- [ ] FR-027: Autoplay restriction detected, prompt shown (if blocked)
- [ ] FR-028: Fallback text "NOKIA" if GIF fails to load
- [ ] FR-029: Phone functions without audio if sound fails
- [ ] FR-030: Errors logged with meaningful prefixes

---

## Next Steps After Boot System Complete

Once all checklist items pass:

1. ✅ Tag this phase: `git tag v1-boot`
2. ✅ Commit changes: `git commit -m "feat: implement Nokia 5130 boot system"`
3. 🔜 Proceed to next phase: Keypad Interactivity (P2 user stories)
4. 🔜 Run `/speckit.tasks` to generate task breakdown for keypad phase

---

**Questions or Issues?**

If you encounter problems not covered here:
1. Check browser console for error messages
2. Verify all required assets exist in correct folders
3. Test in different browser (Chrome recommended for development)
4. Review `data-model.md` for expected module behavior

**Phase 1 Quickstart Complete** ✅  
**Ready for Implementation** 🚀

