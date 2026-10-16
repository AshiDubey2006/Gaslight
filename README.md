# Gaslight.exe

> A browser extension that subtly alters the web as you browse.

`gaslight.exe` is a Manifest V3 Chromium extension designed for YouTube. Rather than blocking content or breaking page functionality, it introduces subtle, uncanny distortions into standard UI elements over time. Buttons change wording, interactive cues drift slightly, and procedural sound cues trigger based on session length.

---

## What It Does

As you browse, the extension monitors the DOM using a batched `MutationObserver` to subtly replace everyday text prompts with unsettling or satirical alternatives:

| Default Text | Replaced Text | Style |
|:---|:---|:---|
| `Sign In` | Confess / Submit credentials | Evil Corporate |
| `Skip Ad` | Accept Your Fate / Flee | Paranoid |
| `Accept all cookies` | Surrender your secrets / Give up | Cosmic Horror |
| `Search` | Seek Truth / Desperation | Passive-Aggressive |
| `Subscribe` | Bind your soul / Pledge allegiance | Cosmic Horror |
| `Cancel` | Pretend this never happened | Passive-Aggressive |
| `Refresh` | Question reality again / Denial | Paranoid |
| `Loading...` | Consulting the council... | Cosmic Horror |

---

## Features

- **Four Personalities**:
  - **Passive-Aggressive**: Sarcastic tooltips and subtle judgment.
  - **Paranoid**: Micro-flickers, layout jitters, and alert styling.
  - **Cosmic Horror**: Drifting elements, slow fades, and eerie contrast.
  - **Evil Corporate**: Simulated system notices, corporate jargon, and telemetry warnings.
- **Escalation Stages**: Distortions gradually increase in frequency and intensity the longer a browsing session lasts (Stages 0 through 3).
- **Procedural Sound Engine**: Audio cues (clicks, low static, hums) are generated on the fly via the browser's native Web Audio API (`AudioContext`). No audio asset files are shipped or loaded.
- **Memory Tracking**: Keeps track of interaction counts and session history locally to trigger contextual dialogue based on previous activity.
- **Accessibility & Safety**:
  - Dedicated **Accessibility Mode** to disable visual distortions.
  - **Reduce Motion** toggle for users sensitive to animations.
  - **Reset Button**: One-click storage wipe that returns the page and settings to default instantly.

---

## Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/gaslight-exe.git
   ```
2. Open your browser and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** in the top left.
5. Select the `gaslight-exe-hehe` project directory.
6. Open YouTube to test.

---

## Privacy

- All state and logs are kept strictly in `chrome.storage.local`.
- Zero external network requests, analytics, or trackers.
- Works entirely offline.

---

## License

MIT
