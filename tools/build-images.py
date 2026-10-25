#!/usr/bin/env python3
"""Build images/*.webp (+ -m mobile), og.jpg and icons for the $PUMP v2 site.

  python3 tools/build-images.py SRC_DIR [SRC_DIR2 ...]   # first dir that has a stem wins

Cutout stems (hero-cutout, community-cutout, layer-*) are chroma-keyed:
magenta (#ff00ff-ish) or near-white backgrounds become transparent.
"""
import sys, glob
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'images'; OUT.mkdir(exist_ok=True)
# stem -> (max w, max h, cutout?, mobile width)
SPEC = {
  'hero-cutout': (1300, 1600, True, 760), 'hero-bg': (2400, 1400, False, 1100),
  'layer-pills-fg': (2400, 1400, True, 1200), 'layer-btc': (2000, 900, True, 1000),
  'story-banner': (2400, 1100, False, 1100),
  'step-01': (1100, 830, False, None), 'step-02': (1100, 830, False, None), 'step-03': (1100, 830, False, None),
  'community-cutout': (1200, 1200, True, 700), 'buy-scene': (2000, 1200, False, 1000), 'faq-bg': (1920, 1100, False, 1000),
}
ALIAS = {'step-01': ['step-01-hold'], 'step-02': ['step-02-fees'], 'step-03': ['step-03-claim', 'step-03-btc']}

def key(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    c = a[2:-2:max(1, a.shape[0]//40), :][:, [2, -3]].reshape(-1, 3).mean(0)  # sample edge colour
    if c[0] > 180 and c[2] > 180 and c[1] < 90:   # magenta screen
        d = np.minimum(r, b) - g                    # magenta-ness
        alpha = np.clip(1 - (d - 60) / 120, 0, 1)
        spill = np.clip(np.minimum(r, b) - g * 1.0, 0, None) * (1 - alpha) * 0 + 0
        # despill: pull r/b down towards g where pinkish
        m = np.minimum(r, b) > g + 20
        lim = np.maximum(g, np.maximum(r, b) * 0.0)
        r2 = np.where(m, np.minimum(r, np.maximum(g, b * 0 + g + 25)), r)
        b2 = np.where(m, np.minimum(b, g + 25), b)
        a[..., 0], a[..., 2] = r2, b2
    else:                                           # white screen: flood from border only
        from scipy import ndimage
        wh = (r > 238) & (g > 238) & (b > 238)
        lab, _ = ndimage.label(wh)
        border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        bg = np.isin(lab, list(border))
        bg = ndimage.binary_dilation(bg, iterations=1)
        alpha = (~bg).astype(np.float32)
    out = Image.fromarray(np.dstack([a, alpha * 255]).astype(np.uint8), 'RGBA')
    al = out.getchannel('A').filter(ImageFilter.GaussianBlur(0.8))
    out.putalpha(al)
    bbox = al.point(lambda v: 255 if v > 8 else 0).getbbox()
    return out.crop(bbox) if bbox else out

def save(im, path, mw, mh, alpha, q=82):
    im = im.copy().convert('RGBA' if alpha else 'RGB'); im.thumbnail((mw, mh), Image.LANCZOS)
    im.save(path, 'WEBP', quality=q, method=6, alpha_quality=90); return im.size

def find(dirs, stem):
    for d in dirs:
        for s in [stem] + ALIAS.get(stem, []):
            for ext in ('png', 'jpg', 'jpeg', 'webp'):
                p = Path(d) / f'{s}.{ext}'
                if p.exists(): return p
    return None

def build(stem, src):
    im = Image.open(src); mw, mh, cut, mob = SPEC[stem]
    if cut and im.mode != 'RGBA': im = key(im)
    print(stem, save(im, OUT / f'{stem}.webp', mw, mh, cut), '<-', src)
    if mob: save(im, OUT / f'{stem}-m.webp', mob, mob * 2, cut, 76)

def og(src):
    im = Image.open(src).convert('RGB'); r = 1200 / 630
    if im.width / im.height > r:
        w = int(im.height * r); im = im.crop(((im.width - w) // 2, 0, (im.width + w) // 2, im.height))
    else:
        h = int(im.width / r); im = im.crop((0, (im.height - h) // 2, im.width, (im.height + h) // 2))
    im.resize((1200, 630), Image.LANCZOS).save(ROOT / 'og.jpg', quality=86, optimize=True, progressive=True); print('og <-', src)

def icons(src):
    im = Image.open(src).convert('RGBA'); s = min(im.size)
    im = im.crop(((im.width - s) // 2, 0, (im.width + s) // 2, s))
    for n, sz in (('icon-512.png', 512), ('icon-192.png', 192), ('apple-touch-icon.png', 180), ('favicon-32.png', 32)):
        im.resize((sz, sz), Image.LANCZOS).save(ROOT / n)
    im.resize((48, 48), Image.LANCZOS).save(ROOT / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)]); print('icons <-', src)

if __name__ == '__main__':
    dirs = sys.argv[1:]
    for stem in SPEC:
        p = find(dirs, stem)
        print('MISSING', stem) if not p else build(stem, p)
    gal = []
    for d in dirs:
        gal += sorted(glob.glob(f'{d}/scroll-*.*'))
    seen = {}
    for p in gal:
        seen.setdefault(Path(p).stem, p)
    for i, (stem, p) in enumerate(sorted(seen.items())[:12], 1):
        print(f'gallery-{i:02d}', save(Image.open(p), OUT / f'gallery-{i:02d}.webp', 900, 1100, False, 80), '<-', p)
    o = find(dirs, 'og-new') or find(dirs, 'og')
    if o: og(o)
    import shutil
    if (Path(dirs[0]) / 'favicon.ico').exists():
        for n in ('favicon.ico', 'favicon-32.png', 'apple-touch-icon.png'): shutil.copy(Path(dirs[0]) / n, ROOT / n)
        f = Path(dirs[0]) / 'favicon-512.png'
        im = Image.open(f).convert('RGBA'); im.save(ROOT / 'icon-512.png'); im.resize((192, 192), Image.LANCZOS).save(ROOT / 'icon-192.png'); print('icons <- pack')
    else:
        f = find(dirs, 'favicon-src') or find(dirs, 'favicon')
        if f: icons(f)
