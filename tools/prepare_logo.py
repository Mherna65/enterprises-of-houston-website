#!/usr/bin/env python3
"""Make transparent-background logo assets from assets/src/logo-original.png.

Removes only the white that is connected to the image edges (flood fill), so
whites inside the badge (white hard hat, silver ring highlights) are kept.
Usage: python3 tools/prepare_logo.py [path/to/logo.png]
"""
import sys, os
from collections import deque
from PIL import Image, ImageFilter

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "assets/src/logo-original.png")
im = Image.open(src).convert("RGB")
w, h = im.size
px = im.load()
TH = 232  # a pixel counts as background white if every channel >= TH

def is_bg(x, y):
    r, g, b = px[x, y]
    return min(r, g, b) >= TH and max(r, g, b) - min(r, g, b) < 18

bg = bytearray(w * h)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        q.append((x, y))
while q:
    x, y = q.popleft()
    i = y * w + x
    if bg[i] or not is_bg(x, y):
        continue
    bg[i] = 1
    if x > 0: q.append((x - 1, y))
    if x < w - 1: q.append((x + 1, y))
    if y > 0: q.append((x, y - 1))
    if y < h - 1: q.append((x, y + 1))

mask = Image.frombytes("L", (w, h), bytes(0 if b else 255 for b in bg))
# soften the cut edge: shrink 1px, then light blur for anti-aliasing
mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
# remove the white fringe on edge pixels by un-mixing white
rgba = im.convert("RGBA")
p2, mp = rgba.load(), mask.load()
for y in range(h):
    for x in range(w):
        a = mp[x, y]
        if 0 < a < 255:
            r, g, b, _ = p2[x, y]
            f = a / 255
            un = lambda c: max(0, min(255, int((c - 255 * (1 - f)) / f)))
            p2[x, y] = (un(r), un(g), un(b), a)
        else:
            r, g, b, _ = p2[x, y]
            p2[x, y] = (r, g, b, a)

bbox = mask.point(lambda v: 255 if v > 8 else 0).getbbox()
logo = rgba.crop(bbox)
# pad to square, centered
s = max(logo.size) + 4
sq = Image.new("RGBA", (s, s), (0, 0, 0, 0))
sq.alpha_composite(logo, ((s - logo.size[0]) // 2, (s - logo.size[1]) // 2))
A = os.path.join(root, "assets")
sq.save(os.path.join(A, "logo.png"), optimize=True)  # native resolution, no upscale
R = Image.LANCZOS
sq.resize((256, 256), R).save(os.path.join(A, "logo-256.png"), optimize=True)
sq.resize((128, 128), R).save(os.path.join(A, "logo-128.png"), optimize=True)
sq.resize((32, 32), R).save(os.path.join(A, "favicon-32.png"))
sq.resize((256, 256), R).save(os.path.join(root, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
touch = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
touch.alpha_composite(sq.resize((164, 164), R), (8, 8))
touch.convert("RGB").save(os.path.join(A, "apple-touch-icon.png"))
# link-preview image 1200x630
og = Image.new("RGBA", (1200, 630), (11, 42, 91, 255))
stripe = Image.new("RGBA", (1200, 14), (242, 180, 23, 255))
og.alpha_composite(stripe, (0, 616))
L = sq.resize((540, 540), R) if s >= 540 else sq
og.alpha_composite(L, ((1200 - L.size[0]) // 2, (616 - L.size[1]) // 2))
og.convert("RGB").save(os.path.join(A, "og-image.png"), optimize=True)
print("logo", sq.size, "bbox", bbox)
