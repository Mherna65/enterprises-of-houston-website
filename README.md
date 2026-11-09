# Enterprises of Houston & Contractors, LLC — website

Static site: open index.html or serve the folder (e.g. `python3 -m http.server`). No build step.

## Logo assets
Source: assets/src/logo-original.png. Regenerate all logo files with:
    python3 tools/prepare_logo.py
It flood-fills the white from the image edges to transparent (whites inside the badge are kept) and writes
assets/logo.png (497px native, no upscaling), logo-256.png, logo-128.png, favicon-32.png,
apple-touch-icon.png, og-image.png (1200x630 link preview) and favicon.ico.

## Contact info (filled in)
- Primary phone (all Call buttons, footer, structured data): Miguel Hernandez Jr., Owner, (281) 425-5099
- Second contact (Contact section only): Miguel Hernandez III, (281) 515-6659
- Hours: Always on call — 24/7 (structured data: Mo-Su 00:00-23:59)
- Email: mhernandez2962@yahoo.com (contact, footer, form action, main.js TO, structured data)

## Placeholders still to replace (search for PLACEHOLDER / TODO / yourdomain)
- Domain: https://www.yourdomain.com/ (canonical, og:url, og:image, twitter:image, JSON-LD image/logo)
- Project photos: 6 .photo-slot blocks in #projects
- Quote form backend (currently opens visitor's email app via mailto)
