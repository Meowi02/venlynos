# Visual-first design rules (Apple/Notion aesthetic)

When changing frontend:
- Open http://localhost:3001 via Playwright (1440×900), wait for network idle.
- Save full-page screenshot to ./tmp/.
- Compare to /context/style-guide.md and /context/design-principles.md.
- Propose concise diffs; apply HIGH-priority items first.
- Re-screenshot and summarize differences.
- Check console/network logs; fix obvious errors.

Tokens:
- bg #F7F7F8, surface #FFFFFF, border #E7E7EA
- text #0A0A0B / #4A4A50 / #8C8C92
- accent #3478F6 only for primary CTA & charts
- radius 20–24px cards; 12px buttons; gentle shadows (0 1px 2px / 0.06)
- type Inter/SF: 12, 14, 16, 20, 24, 32; lh 1.45–1.6; 8px spacing grid
