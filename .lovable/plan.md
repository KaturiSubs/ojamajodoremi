
# Countdown Site — Build Plan

A single-admin, retro/Y2K/spooky/anime-flavored countdown page with an admin panel for managing all placeholders, plus a secrets subsystem visitors can discover and submit guesses through.

## Pages / Routes

- `/` — Public countdown page
  - Full-bleed custom background (image or video) with CRT scanlines + subtle VHS/chromatic-aberration overlay
  - Big flip-clock style DD : HH : MM : SS countdown, glowing/glitchy monospace
  - Custom background music tries to autoplay (muted-first fallback if the browser blocks it, then unmutes on first user gesture — required by every modern browser); no visible mute button; **Up / Down arrow keys change volume**; volume persisted in localStorage
  - When countdown hits zero → the countdown block is replaced by an inline embedded YouTube premiere player
  - Hidden things live here (see Secrets)
- `/secret/$slug` — Secret challenge page
  - Caption "What is their secret?" + a single textbox
  - Correct answer → redirect to a configured next URL (another secret slug, external URL, etc.)
  - Wrong answer → box shakes, glows red, "You are wrong." message; the attempt (with slug, guess, timestamp, IP/user-agent) is saved for the admin
- `/auth` — Admin sign-in (email + password only, no public signup)
- `/_authenticated/admin` — Admin dashboard with tabs:
  - **Countdown**: set target datetime + timezone, set YouTube video URL/ID
  - **Media**: upload/replace background (image or mp4/webm) and background music (mp3/ogg); default volume slider
  - **Secrets**: CRUD list of secrets. Each secret has: slug, hint/label (optional), correct answer(s), "on correct" redirect target, and how it's discovered (hotspot coords, konami/key sequence, or hidden route slug)
  - **Hotspots**: visual editor to place clickable invisible regions on the background (x/y/width/height in %) each linked to a secret slug
  - **Submissions**: read-only log of all guess attempts (slug, guess, correct?, when)
  - **Files**: uploaded files browser (delete/replace)

## Retro / Y2K / Spooky Look

- Palette: near-black background, phosphor green + magenta accents, blood-red for errors
- Typography: pixel/mono display font (VT323 or similar) for the clock, subtle Japanese kana as decorative glyphs
- Effects: CRT scanlines, faint flicker, occasional glitch shudder on the clock, chromatic-aberration hover on interactive elements
- All colors as semantic tokens in `src/styles.css`; no hardcoded colors in components

## Secrets (as you described)

Three discovery mechanisms, all routing to the same `/secret/$slug` challenge page:

1. **Hidden clickable hotspots** on the background — invisible divs with a very slight cursor change on hover
2. **Konami-style key sequences** — configured per secret in admin (e.g. `↑↑↓↓←→←→BA`)
3. **Hidden routes** — typing `/secret/<slug>` directly works if the slug exists

Wrong guesses always log to the admin submissions tab. Right guesses redirect to whatever the admin configured (another `/secret/<slug>`, an external URL, an image, etc.).

## Admin Access

- Lovable Cloud auth, email + password
- Public signup disabled; you (the single admin) are seeded via a one-time "claim admin" flow: the first user to sign up becomes admin and no further admins can be created from the UI
- `admin` role stored in a separate `user_roles` table + `has_role()` security-definer function (never on profiles)
- `/_authenticated/admin` gated by role check; non-admins are redirected

## Data Model (Lovable Cloud)

- `site_settings` (single row): countdown_target_at, timezone, youtube_url, background_file_id, music_file_id, default_volume
- `secrets`: id, slug (unique), label, correct_answers (text[]), on_correct_redirect, discovery_type (`hotspot` | `key_sequence` | `route`), key_sequence (nullable)
- `hotspots`: id, secret_id, x_pct, y_pct, width_pct, height_pct
- `secret_submissions`: id, secret_slug, guess, is_correct, created_at, user_agent
- `user_roles`: id, user_id, role (enum: `admin`)
- Storage buckets: `media` (public — background + music), served via public URLs

All tables get explicit GRANTs + RLS. Public reads only for `site_settings`, `secrets` (label/slug/discovery only — never the answer), and `hotspots`. Answer checking happens in a server function so the correct answer never ships to the browser.

## Post-Countdown Behavior

Client re-checks every second; when `now >= target`, the countdown component unmounts and a lite YouTube embed (`youtube-nocookie.com/embed/<id>`) mounts in its place, autoplay enabled.

## What You Do After I Build It

1. Sign up once at `/auth` to claim the admin account
2. Open `/_authenticated/admin` and set the target date, upload your background + music, paste the (future) YouTube URL, and add your secrets

---

## Technical Notes

- TanStack Start + Lovable Cloud (Supabase). Countdown/audio/hotkeys are all client-only components mounted inside the SSR route.
- Autoplay: audio element starts `muted autoplay`; on the first `pointerdown`/`keydown` we unmute to the persisted volume. This is the only reliable cross-browser path; no visible controls, as you asked.
- Volume: Up/Down arrow keys adjust in 5% steps, clamped 0–100, persisted in localStorage.
- Answer checking: `checkSecret` server fn compares against `correct_answers` case-insensitively (trimmed) and inserts into `secret_submissions` either way; returns `{ correct, redirect? }` only.
- Storage: `media` bucket public-read; admin-only write via RLS keyed on `has_role(auth.uid(),'admin')`.
- Admin gate lives in `src/routes/_authenticated/admin.tsx` with a `beforeLoad` role check calling a `requireAdmin` server fn.
- No secrets to add on your side — Lovable Cloud auth handles login; the encryption keys we need are auto-provisioned.

Approve this and I'll enable Lovable Cloud, scaffold the schema, and build the public page + admin panel with placeholder content you can immediately edit.
