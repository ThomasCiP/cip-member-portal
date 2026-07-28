#!/usr/bin/env python3
"""Build the App Store Connect "geographic regions" file for Australia.

App Store Connect wants a .geojson containing exactly one MultiPolygon.

Source: geoBoundaries gbOpen AUS ADM0 (simplified), CC BY 4.0 —
https://www.geoboundaries.org. The raw download is 3.6 MB across 3167 polygons,
almost all of which are reefs, sandbars and rocks. This script drops the ones
below a minimum area, simplifies the coastline with Douglas-Peucker, and emits a
single MultiPolygon.

Tuning notes (don't raise TOLERANCE without re-running the checks):
  At TOLERANCE = 0.01 the simplification cuts straight across Darwin Harbour and
  puts *Darwin* outside the boundary. 0.005 keeps every capital, every mainland
  centre tested, Tasmania, Kangaroo Island, Thursday Island, and the external
  territories (Norfolk, Christmas, Cocos) inside, at ~370 KB.

Usage: python3 scripts/build-geo-regions.py [OUTPUT.geojson]
"""
import json
import math
import sys
import urllib.request

SRC_URL = ("https://github.com/wmgeolab/geoBoundaries/raw/bdfb316/"
           "releaseData/gbOpen/AUS/ADM0/geoBoundaries-AUS-ADM0_simplified.geojson")
MIN_AREA_DEG2 = 0.0001   # ~1.2 km^2: keeps Thursday Is; drops reefs
TOLERANCE = 0.005        # Douglas-Peucker, ~550 m
PRECISION = 4            # ~11 m
OUT = sys.argv[1] if len(sys.argv) > 1 else "australia-regions.geojson"

# Every capital plus coastal and island edge cases. All must land inside.
CHECKS = {
    "Sydney": (151.209, -33.868), "Melbourne": (144.963, -37.814),
    "Brisbane": (153.026, -27.470), "Perth": (115.857, -31.953),
    "Adelaide": (138.600, -34.929), "Hobart": (147.327, -42.882),
    "Canberra": (149.128, -35.282), "Darwin": (130.845, -12.463),
    "Cairns": (145.770, -16.920), "Menai NSW": (151.011, -34.013),
    "Byron Bay": (153.612, -28.643), "Broome": (122.236, -17.955),
    "Geraldton": (114.612, -28.774), "Townsville": (146.816, -19.259),
    "Newcastle": (151.784, -32.927), "Wollongong": (150.894, -34.425),
    "Gold Coast": (153.430, -28.017), "Launceston": (147.139, -41.435),
    "Alice Springs": (133.881, -23.699), "Kangaroo Is": (137.216, -35.776),
    "Norfolk Is": (167.954, -29.041), "Christmas Is": (105.690, -10.447),
    "Cocos (West Is)": (96.826, -12.188), "Thursday Is": (142.219, -10.583),
    "Devonport": (146.351, -41.179), "Port Hedland": (118.606, -20.310),
    "Esperance": (121.891, -33.861), "Mackay": (149.186, -21.144),
    "Bunbury": (115.639, -33.327), "Palmerston NT": (130.983, -12.486),
}


def ring_area(ring):
    """Signed shoelace area. Sign gives winding direction."""
    s = 0.0
    for i in range(len(ring) - 1):
        s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    return s / 2.0


def rdp(points, eps):
    """Douglas-Peucker. Iterative, so long coastlines can't blow the stack."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        lo, hi = stack.pop()
        if hi <= lo + 1:
            continue
        x1, y1 = points[lo][:2]
        x2, y2 = points[hi][:2]
        dx, dy = x2 - x1, y2 - y1
        den = dx * dx + dy * dy
        worst, wi = -1.0, lo
        for i in range(lo + 1, hi):
            px, py = points[i][:2]
            d = (math.hypot(px - x1, py - y1) if den == 0
                 else abs(dy * px - dx * py + x2 * y1 - y2 * x1) / math.sqrt(den))
            if d > worst:
                worst, wi = d, i
        if worst > eps:
            keep[wi] = True
            stack.append((lo, wi))
            stack.append((wi, hi))
    return [p for p, k in zip(points, keep) if k]


def clean(ring, ccw):
    """Simplify, round, dedupe, close, and fix winding to RFC 7946."""
    out = []
    for c in rdp(ring, TOLERANCE):
        p = [round(c[0], PRECISION), round(c[1], PRECISION)]
        if not out or out[-1] != p:
            out.append(p)
    if out[0] != out[-1]:
        out.append(out[0])
    if len(out) < 4:
        return None
    if (ring_area(out) > 0) != ccw:
        out.reverse()
    return out


def point_in_ring(pt, ring):
    x, y = pt
    inside = False
    for i in range(len(ring) - 1):
        x1, y1 = ring[i][:2]
        x2, y2 = ring[i + 1][:2]
        if ((y1 > y) != (y2 > y)) and (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1):
            inside = not inside
    return inside


print(f"→ fetching {SRC_URL.rsplit('/', 1)[-1]}…")
with urllib.request.urlopen(SRC_URL, timeout=180) as r:
    src = json.load(r)

geom = src["features"][0]["geometry"]
raw = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]

kept, dropped = [], 0
for poly in raw:
    if abs(ring_area(poly[0])) < MIN_AREA_DEG2:
        dropped += 1
        continue
    ext = clean(poly[0], ccw=True)
    if ext is None:
        dropped += 1
        continue
    rings = [ext]
    for hole in poly[1:]:
        h = clean(hole, ccw=False)
        if h is not None:
            rings.append(h)
    kept.append((abs(ring_area(poly[0])), rings))

kept.sort(key=lambda t: -t[0])
coords = [r for _, r in kept]

doc = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {"name": "Australia"},
        "geometry": {"type": "MultiPolygon", "coordinates": coords},
    }],
}
with open(OUT, "w") as f:
    json.dump(doc, f, separators=(",", ":"))

# --- verify -----------------------------------------------------------------
missing = [n for n, pt in CHECKS.items()
           if not any(point_in_ring(pt, p[0]) and not any(point_in_ring(pt, h) for h in p[1:])
                      for p in coords)]
winding_ok = (all(ring_area(p[0]) > 0 for p in coords)
              and all(ring_area(h) < 0 for p in coords for h in p[1:]))
closed_ok = all(r[0] == r[-1] and len(r) >= 4 for p in coords for r in p)

pts = sum(len(r) for p in coords for r in p)
xs = [c[0] for p in coords for r in p for c in r]
ys = [c[1] for p in coords for r in p for c in r]
import os
print(f"  polygons: {len(coords)} (dropped {dropped} below {MIN_AREA_DEG2} deg^2)")
print(f"  points:   {pts}")
print(f"  bbox:     lon {min(xs):.3f}..{max(xs):.3f}  lat {min(ys):.3f}..{max(ys):.3f}")
print(f"  size:     {os.path.getsize(OUT)/1024:.0f} KB")
print(f"  {'PASS' if closed_ok else 'FAIL'}  rings closed, >=4 points")
print(f"  {'PASS' if winding_ok else 'FAIL'}  RFC 7946 winding")
print(f"  {'PASS' if not missing else 'FAIL — OUTSIDE: ' + ', '.join(missing)}"
      f"  all {len(CHECKS)} locations inside")
if missing or not winding_ok or not closed_ok:
    sys.exit(1)
print(f"\n✓ {OUT}")
