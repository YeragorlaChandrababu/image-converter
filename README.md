# Meta Photo Lab — GitHub Pages

A static, client-side photo formatter that crops an input image to 3024×4032 (3:4 portrait), exports a high-quality JPEG, and writes a clean EXIF profile based on publicly observed Ray-Ban Meta JPEG metadata.

## Files
- `index.html` — UI
- `style.css` — responsive dark/glass UI
- `app.js` — crop, JPEG export, EXIF writer, save/share/Base64
- `.github/workflows/pages.yml` — automatic GitHub Pages deployment from `main`

## Deploy
1. Create a GitHub repository and push these files to the `main` branch.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions**.
4. Push to `main`; the included workflow deploys the site.

## Local use
Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Technical notes
- Official Ray-Ban specs list 3024×4032 as the default portrait capture for Ray-Ban Meta.
- Output is center-cropped to 3:4 and re-encoded as JPEG at quality 95.
- A fresh, GPS-free EXIF block is written with `Meta AI` / `Ray-Ban Meta Smart Glasses 2` plus standard capture-style fields.
- Unique identifiers and GPS from the source are not copied.
- No image is uploaded to a server.
- This is a format/metadata test tool, not a way to prove that a photo was captured by physical Meta glasses. Instagram can change its detection rules, so the glasses label/feature is not guaranteed.
