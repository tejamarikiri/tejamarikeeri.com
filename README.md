
# Markeeri Teja — Portfolio

This repository contains an interactive, design-forward portfolio built to showcase projects, certifications, and a small experimental AI assistant called "Pengu." The site pairs polished UI with subtle 3D and animated elements to deliver a modern, memorable presentation.

## Project purpose
To present technical work and credentials with high information density while keeping an approachable, creative presentation. The site balances clarity (label-cards, clear headings) with visual personality (3D accents, animated micro-interactions) so reviewers can scan and engage quickly.

## Creative design highlights
- Glass-like label-cards: translucent panels used across projects, certifications and contact blocks for a cohesive aesthetic.
- Motion and micro-interactions: parallax on the hero, hover lifts, and soft transitions improve perceived quality and guide attention.
- Background + particles: a muted ambient video combines with a lightweight Three.js particle layer for subtle depth and motion without heavy GPU use.

## 3D icons & animations
- Purposeful 3D: tiny Three.js scenes act as decorative "3D icons" (particles, small shapes) — they add depth while being tuned for performance (low particle counts, capped DPR).
- Pengu avatar: when WebGL is available, Pengu uses a compact Three.js canvas to render an expressive avatar; fallback imagery is used when necessary.
- Animation strategy: animations are intentionally restrained and polished — they emphasize hierarchy and readability rather than showiness.

## Pengu — the interactive assistant (emphasized)
Pengu is a small on-site assistant: a playful penguin persona that helps visitors find projects, certifications, and contact details.

Key behaviors:
- Minimal footprint: a round penguin icon sits in the bottom-right. Click to open a compact chat panel.
- Visuals: a small Three.js-rendered avatar when available, otherwise `assets/penguin.png` fallback.
- Interaction model: client-side scripted answers that point to page sections, list entries, and provide links; voice input hooks are present for optional speech features.
- Extensibility & safety: the UI is designed to be connected to a server-side AI proxy (recommended) so API keys remain secret. Pengu ships as a modular front-end component ready for backend integration.

## License
This repository is provided under the MIT License. See `LICENSE` for details.

---

If you'd like, I can:
- Persist the chosen theme (light/dark) across visits using `localStorage`.
- Scaffold a minimal secure backend to prototype Pengu using a server-side AI proxy.
- Replace provider icons with crisp SVG assets in `assets/` for higher fidelity.

Tell me which enhancement you'd like next and I'll implement it.

