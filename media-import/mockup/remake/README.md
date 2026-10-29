# Project mockup generator

Used for the 2026-10-25 image remake (`media-import/remake/<slug>/`). Run from this folder; each project gets a work
folder `<slug>/` (not committed).

1. `node capture.js <slug> <url>` → `laptop.png` (1440×900 @1.5), `phone.png` (390×844 @3), `g1.png`, `g2.png`
   (landscape sections), `card-*.jpg` (largest photos), `brand.json` (colours by painted area). Clicks age gates and
   cookie bars, hides floating widgets (incl. `#vplugin`).
2. `node shot.js <slug> <name> <url> [scrollY] [m|d]` → one extra frame (`m` = mobile, `d` = 390 wide without mobile
   zoom, for sites that overflow sideways). `WAIT=ms` waits for sliders; `BGIMG=file.jpg` paints a frame over an
   Elementor background video (headless Chromium does not play YouTube backgrounds — use the video's
   `i.ytimg.com/vi/<id>/maxres1.jpg` frames).
3. Optional `<slug>/over.json`: `light`, `dark`, `band`, `accent`, `accent2`, `name` (English outline text), and
   `layout`: `desk` (laptop + phone + taped cards), `trio` (three phones, needs `phone2.png`/`phone3.png`),
   `browser` (angled browser + phone), `iso` (laptop, g1, g2 stacked isometric). Vary the layouts between projects.
4. `node tc.js <slug>` (status-bar colour under the camera island), then `node mockup.js <slug>` → `mockup.jpg`
   (2400×1350). `node msheet.js out.jpg <slug>…` makes a contact sheet for review.
5. `PORTRAIT=1 node mockup.js <slug>` → `mockup-m.jpg` (1080×1920) for the project's mobile hero (`heroMobile`): the
   phone centred and above the title zone (bottom ~30%), flanked by `phone2`/`phone3` or the two cards. Check it cropped
   to 390×844 (cover) before uploading.
6. `TRANSPARENT=1 node mockup.js <slug>` (and with `PORTRAIT=1`) → `mockup-t.webp` / `mockup-m-t.webp`: everything painted in
   the band colour is left transparent (the `browser` blob becomes a window, `trio`/`iso` keep only a white glow), so the
   site's colour shows through. These are what the projects use since 2026-10-27 (`media-import/transparent/`). In Neon
   the project colour equals the band, so they look like the opaque version.


## Brand book 2026 (`mockup26.js`)

`node mockup26.js <slug> [variant 0-3]` → `m26.jpg` (2400×1350), `PORTRAIT=1` → `m26-m.jpg` (1080×1920). Uses the same
captures (`laptop.png`, else `tab-l.png`/`g1.png`, and `phone.png`). A porcelain room, side sun with leaf shadows, two
painted slabs in the brand colours (variant = colour pair; give neighbouring projects different variants), the laptop
and phone in the top ~60% (desktop: phone on the left, the title sits bottom right) and above the bottom 30% (mobile).
The project heroes since 2026-10-29 (`media-import/brand26/`, migration `projects_2026`).
