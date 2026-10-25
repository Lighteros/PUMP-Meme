# Pretty Unreal Massive Pair ($PUMP)

Static scroll-animation site for https://prettyunrealmassivepair.lol (v2).

- Sections: sticky header + chapter rail → pinned hero (bg / BTC coins / mascot cutout / pill foreground parallax) → CA strip → scroll ribbons → story + banner + 3 steps → pinned "P·U·M·P" pill-split beat → horizontal gallery → buy → community → FAQ → footer.
- Motion: GSAP 3 + ScrollTrigger + Lenis, vendored in `js/vendor/` (CSP `script-src 'self'`). `prefers-reduced-motion` falls back to a static page.
- Config: `CONFIG.ca`, `CONFIG.x`, `CONFIG.tg` at the top of `js/main.js`. Until a valid Solana mint is set, the CA shows "TBA", copy is disabled and Buy (pump.fun) / Chart (DexScreener) / Solscan show SOON.
- Art: `python3 tools/build-images.py <pack dir>` rebuilds `images/*.webp` (+ `-m` mobile), `og.jpg` and icons.
- Fonts self-hosted: DM Sans, Bebas Neue.

$PUMP is a Solana community token. Rewards are variable and not guaranteed.
