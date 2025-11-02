# Nokia 5130 XpressMusic Simulator

> A nostalgic journey back to the golden era of mobile phones

**Built as a small "AI + SpecKit" experiment** – turning a fun idea into something tangible. This project recreates the iconic Nokia 5130 XpressMusic experience right in your browser, complete with that satisfying keypad click and all the feels from the early 2000s.

**[🎮 Try the Live Demo](https://nokia.zodx.tech/)** | **[⭐ Star on GitHub](https://github.com/Arkan-Khan/Nokia-Simulator)**

Built with **[SpecKit](https://github.com/github/spec-kit)** – the memory layer for AI coding tools.

---

## What Makes This Special

This isn't just a skin – it's a **fully functional simulator** that brings back the real Nokia experience:

### Authentic Experience
- **Classic keypad feel** – Click those on-screen buttons just like the real device
- **Familiar Symbian UI** – Old-school soft keys (LSK/RSK), status bars, and that iconic menu navigation
- **Real sound effects** – Satisfying keyclick feedback, boot sounds, and ambient tracks

### Working Apps
Complete with all your favorites:
- **Clock** – Because we all checked the time obsessively
- **Calculator** – For those quick math moments
- **Camera** – Capture "photos" with authentic quality vibes
- **Calls** – Full call log and dialer interface
- **Contacts** – With old-school multi-tap typing!
- **Gallery** – View your captured memories
- **Notepad** – Write notes the hard way (multi-tap FTW)
- **Media Player** – Music, ringtones, and even a sample video
- **Games** – Real J2ME games via FreeJ2ME-Web!

### Media Library
Preloaded with nostalgia:
- Classic Nokia ringtones
- A nostalgic Honey Singh playlist (Bluetooth era King 👑)
- Sample video with authentic screen rotation

### Games Powered by Real J2ME
Integrated via **[FreeJ2ME-Web](https://github.com/zb3/freej2me-web)** – play actual J2ME games in the browser!

> Mobile: The UI is mobile‑responsive and you can play using the on‑screen Nokia keypad. However, J2ME emulation is CPU/GPU intensive in mobile browsers, so games may feel laggy. For the smoothest experience, use a laptop or desktop browser.

---

## Quick Start Guide

### 1. Power On
Press and hold the **red button** for ~3 seconds to boot up. Enjoy the authentic boot animation with sound!

### 2. Navigation Basics
- **D-pad:** Up/Down/Left/Right to navigate
- **Center button:** Select (OK)
- **LSK (Left Soft Key):** Above the green call button
- **RSK (Right Soft Key):** Above the red end button

### 3. Making Calls
From the home screen:
- Dial numbers directly with the keypad (just like the real thing!)
- Press the **green call button** to place a (simulated) call
- Check your call history in the **Calls** app

### 4. Exploring Apps
- Press **center/OK** to open the Menu
- Browse through: Clock, Calculator, Camera, Calls, Contacts, Gallery, Notepad, Media, Games
- **Pro tip:** Contacts and Notepad use old-school multi-tap typing – press number keys multiple times for letters!

### 5. Media Player
- **Ringtones:** Browse and preview classic Nokia tones
- **Music:** Nostalgic playlist with playback controls
  - D-pad to navigate, OK to play/pause
  - Up/Down to adjust volume
- **Videos:** Sample video with authentic screen rotation

### 6. Camera & Gallery
- Open **Camera** and press OK to capture
- View your masterpieces in **Gallery**

### 7. Playing Games
- Navigate to **Applications > Games** from the Menu
- Select from pre-installed J2ME titles
- **Controls:**
  - Arrow keys for movement
  - Enter for OK/action
  - LSK/RSK to access game menu
- Look for the help panel in the top-right corner when gaming (on mobile, tap the small “i” button)

---

## Local Storage

All your data persists in your browser:
- Contacts
- Notes
- Call history
- Photos

Just like a real phone (but without running out of memory)!

Tip: To reset all data, clear the site data (localStorage) for this origin in your browser settings.

---

## Audio Experience

- **Keyclick feedback** on every press
- **Ambient background music** that starts after your first interaction
- Intelligently pauses during:
  - Boot sequence
  - Camera capture
  - Media playback
  - Game sessions
  - When the tab is hidden or the screen sleeps (resumes when active)

---

## Current Limitations

- Mobile responsive: yes, but games may feel laggy on phones; desktop is recommended for smooth gameplay
- "Go to" feature not yet implemented
- Some assets are intentionally lightweight for demo purposes

---

## Run Locally

Use any static file server to serve the repository root (browsers can block media on file:// URLs):

1. Clone the repo
2. Start a static server in the project directory (Node, Python, or your favorite tool)
3. Open `index.html` in your browser via http:// URL

Notes:
- Assets are referenced with relative paths; serving from the repo root keeps paths working.
- FreeJ2ME runs inside `freej2me-web/web/run.html` via an iframe.

---

## Supported Browsers

- Desktop: Latest Chrome, Edge, Firefox (recommended for best game performance)
- Mobile: Chrome (Android), Safari (iOS) — playable but games may feel laggy due to mobile browser constraints

---

## Performance on Mobile

Running a full J2ME emulator in the browser is demanding. Mobile browsers often throttle timers/animation and have tighter CPU/GPU budgets, which can make games feel slower or stutter.

Tips:
- Keep the tab active (foreground)
- Disable battery saver / low power mode
- Close other heavy tabs/apps
- For the best experience, play on a laptop or desktop

---

## Under the Hood

**Tech Stack:**
- Vanilla JavaScript with modular screen classes
- Custom ScreenManager for navigation flow
- FreeJ2ME-Web vendored and embedded via iframe
- Smart audio management with autoplay policy compliance
- Asset manifest system for media organization

**No frameworks, just pure nostalgic engineering.**

---

## Keyboard Cheat Sheet (Games)

| Key | Action |
|-----|--------|
| **Arrow Keys** | Move/Navigate |
| **Enter** | OK/Action |
| **LSK/RSK** | Game menu |

A help panel appears in the top-right when you're gaming!

### On‑screen Nokia Keypad Mapping (Games)

| Nokia Key | Emulator Key |
|-----------|--------------|
| D‑pad Up/Down/Left/Right | Arrow Up/Down/Left/Right |
| OK / Green Call          | Enter |
| LSK                      | Escape (FreeJ2ME menu) |
| RSK                      | Exit emulator (back to list) |


---

## Contributing

This project was built for **fun and nostalgia**, but there's so much more we can add:

**Wishlist:**
- Enhanced mobile game performance and optional low‑power mode
- Customizable key bindings (per‑game overrides)
- More apps (Messages, Settings, etc.)
- More J2ME games
- Additional themes

**PRs and issue reports are welcome!** Let's make this even better together.

---

## Show Your Support

If this brings back memories or just makes you smile:
- **[Star the repo](https://github.com/Arkan-Khan/Nokia-Simulator)**
- Report bugs or suggest features
- Share with fellow Nokia enthusiasts

---

## Links

- **[Live Demo](https://nokia.zodx.tech/)** – Experience it now!
- **[GitHub Repository](https://github.com/Arkan-Khan/Nokia-Simulator)** – Check out the code
- **[SpecKit](https://github.com/github/spec-kit)** – The AI coding tool that made this possible

---

## Credits & Licenses

- J2ME emulation by **[FreeJ2ME‑Web](https://github.com/zb3/freej2me-web)** (see upstream repository for license and attribution)
- Web runtime for FreeJ2ME uses Leaningtech’s loader (CheerpJ/Web tech) as referenced in the vendored `freej2me-web/web/run.html`


## Special Thanks

To everyone who remembers:
- Multi-tap typing messages
- Sharing songs via Bluetooth
- Bounce being the height of mobile gaming
- That indestructible build quality
- The satisfaction of sliding that XpressMusic cover

**Built with ❤️ and a heavy dose of nostalgia**

---

*Have fun! 🎵📟📼*