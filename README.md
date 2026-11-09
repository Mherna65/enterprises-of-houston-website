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
- Hours: Always on call — 24/7, including emergency call-outs (structured data: Mo-Su 00:00-23:59)
- Email: mhernandez2962@yahoo.com (contact, footer, form action, main.js TO, structured data)

## About section
- assets/about/miguel-iii-and-jr.jpg/.webp (father-and-son studio headshot in safety vests, 4:3).

## Videos
- assets/video/job-slab-prep.mp4 (~4.4 MB), job-trenching.mp4 (~3.6 MB), job-sawcut-prep.mp4 (~2.8 MB), job-concrete-pour.mp4 (~2.0 MB): H.264, 720x1280, no audio, faststart; HDR iPhone sources tone-mapped to SDR. Each has a matching *-poster.jpg.
- Section "On the Job" (#on-the-job). Add a 2nd video by copying a <figure class="video-card"> in .video-grid; it becomes 2-up automatically.
- Videos lazy-load (main.js) and autoplay muted + looped by themselves when in view (no tap), pause when scrolled away; if a phone blocks autoplay (e.g. iOS Low Power Mode) they start on the first touch/scroll.

## Hosting
- Live: https://enterprises-of-houston-website.onrender.com (Render free static site, publish path ./, no build)
- Repo: https://github.com/Mherna65/enterprises-of-houston-website
- Push to `main` and Render redeploys automatically. If a custom domain is added later, update canonical, og:url, og:image, twitter:image and JSON-LD url/image/logo in index.html.

## Placeholders still to replace (search for PLACEHOLDER / TODO)
- Project photos: 3 remaining 'Photo coming soon' blocks in #projects (Excavation, Demolition, Drainage & Detention). 4 slots already use stills from the job videos (assets/projects/*-still.jpg/.webp).
- Quote form backend (currently opens visitor's email app via mailto)
