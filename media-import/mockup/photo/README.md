# Photo mockups

The second image of every project (2026-10-28): one of Ravit's licensed stock photos (Envato Elements, registered to
MyMuse) with the site on the device's white screen. The stock photos themselves are not in this public repo (the
licence does not allow redistributing them); Ravit has them. Output: `media-import/photo/<slug>-photo.jpg`.

1. `node tablet.js <slug> <url>` → `<slug>/tab-l.png` (1180×820 @2) and `tab-p.png` (820×1180 @2), from the live site
   (same cookie/age-gate handling as `../remake/capture.js`). Phones and desktops use the remake captures
   (`phone.png`, `laptop.png`, `g1/g2.png`); sites that block capture and the apps only have those.
2. `node detect.js <photo>…` lists the white screens (index, corner quad). A screen must fill ≥ 90% of its quad;
   bright windows at the edges also show up, so pick the index by its box.
3. `node compose.js <photo> <out.jpg> <index>=<screenshot>[@x0,y0,x1,y1,x2,y2,x3,y3] …` puts each screenshot on its
   screen in perspective, cropped from the top to the screen's shape. The mask is the screen's own white, holes filled,
   so fingers and bezels stay on top and the rounded corners come from the photo. Give the corners by hand
   (TL TR BR BL) when a hand hides one.

`plan.txt` is the 2026-10-28 assignment: slug, photo, screens. Rules kept: no team portraits on the screen (Samurai uses
`g2`, Studio Gur `laptop`), portrait tablets only for sites whose tablet layout renders well.
