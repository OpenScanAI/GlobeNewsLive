# Issue: Signal Feed should auto-scroll like Crucix.live OSINT Stream / Live News Ticker

**Reference:** https://www.crucix.live/ — the OSINT Stream and Live News Ticker sections auto-scroll continuously, creating a live monitoring feel.

**Current behavior:** The Signal Feed widget (`src/components/SignalFeed.tsx`) is static and only scrolls manually. New CRITICAL signals trigger a jump-to-top, but there is no continuous ticker-like scrolling.

**Expected behavior:**
- The Signal Feed should auto-scroll vertically (continuous slow scroll) so signals flow automatically like a live intelligence terminal.
- When the user hovers over the feed or manually scrolls, auto-scroll should pause.
- When the user scrolls away / mouse-leaves, auto-scroll should resume after a short delay.
- New incoming signals should not break the smooth scroll rhythm.

**Benefits:**
- Better live monitoring experience
- Matches professional intel dashboard patterns (Crucix-style)
- Reduces need for manual interaction to see new signals

**Scope:** `src/components/SignalFeed.tsx` + tailwind animation utilities.

**Status:** ✅ Implemented in commit (pending)
