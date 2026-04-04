# 🇩🇪 Learn German with Us

> An interactive, mobile-first German language tutor — type English, hear both languages, and learn visually.

**🔗 Live Demo:** `[Update with your link]`
**📸 Preview:** `[Add screenshot here]`

---

## What it does

A single-file web app that turns any English phrase into a fully narrated German lesson. Add phrases to your personal list, attach a visual aid photo, then tap play — the tutor speaks English first, then reveals and speaks the German translation while an animated AI character lip-syncs along.

---

## Features

| Feature | Details |
|---|---|
| **AI Translation** | Claude (claude-sonnet-4) translates any English phrase to German instantly |
| **Text-to-Speech** | Browser Web Speech API speaks English → then German sequentially |
| **Animated Tutor** | SVG 3D character with mouth animation, sound waves, and speaking indicators |
| **Visual Learning** | Attach a photo to any phrase — shown as a card thumbnail and floating frame on the lesson screen |
| **Phrase Library** | Save, play, and delete phrases — all persisted in browser `localStorage` |
| **Two-Screen Flow** | Page 1 to build your list · Page 2 as a clean record-ready lesson view |
| **Mobile-first** | Built for phones — responsive, touch-friendly, purple glassmorphism UI |

---

## Tech Stack

```
Frontend      →  Vanilla HTML · CSS · JavaScript (single file, zero dependencies)
Translation   →  Anthropic API  (claude-sonnet-4-20250514)
Text-to-Speech→  Web Speech API (SpeechSynthesis — built into modern browsers)
Storage       →  localStorage   (phrases + base64 photos stored in browser)
Fonts         →  Google Fonts   (Playfair Display · Nunito)
```

---

## Architecture

See diagram below — or open `architecture.svg` in the repo root.

```
┌─────────────────────────────────────────────┐
│                  Browser                    │
│                                             │
│  Page 1 (Phrase Manager)                    │
│  ├─ Input + Photo Upload                    │
│  ├─ → Anthropic API (translate)             │
│  ├─ Save to localStorage                    │
│  └─ Phrase list with thumbnails             │
│                                             │
│  Page 2 (Lesson View)                       │
│  ├─ SVG Tutor character (animated)          │
│  ├─ English card → SpeechSynthesis (en-US)  │
│  ├─ German card reveal + animation          │
│  └─ German card → SpeechSynthesis (de-DE)   │
└─────────────────────────────────────────────┘
```

---

## Getting Started

No install. No server. No build step.

```bash
# 1. Download the file
curl -O learn-german.html   # or just open it from your downloads

# 2. Open in Chrome or Edge (best Web Speech API support)
open learn-german.html
```

> **Note:** The app uses the Anthropic API for translation. It works out-of-the-box inside Claude Artifacts. To self-host, add your own API key to the fetch headers in `translateText()`.

---

## File Structure

```
learn-german.html     ← entire app (HTML + CSS + JS, self-contained)
README.md             ← this file
```

---

## Browser Support

| Browser | Translation | Speech |
|---|---|---|
| Chrome / Edge | ✅ | ✅ Best voices |
| Firefox | ✅ | ⚠️ Limited voices |
| Safari (iOS) | ✅ | ✅ Works well |

---

## Built with

- [Anthropic Claude API](https://docs.anthropic.com) — translation engine
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — text-to-speech
- [Google Fonts](https://fonts.google.com) — Playfair Display, Nunito

---

*Made with ❤️ for language learners everywhere.*