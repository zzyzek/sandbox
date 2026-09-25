# Reference gilbert2d paths for every pair of corners of one edge.
# Output: one JSON object per line {w,h,s,t,path} (compatible cases only).
import sys, json
sys.path.insert(0, sys.argv[2] if len(sys.argv) > 2 else 'gilbert-master')
from gilbert2d import generate2d
N = int(sys.argv[1])
for w in range(1, N+1):
  for h in range(1, N+1):
    x1, y1 = w-1, h-1
    seen = set()
    for (cx, cy) in [(0,0),(x1,0),(0,y1),(x1,y1)]:
      ix = 1 if cx == 0 else -1
      iy = 1 if cy == 0 else -1
      for (ax, ay, bx, by, L, M) in [(ix*w,0,0,iy*h,w,h),(0,iy*h,ix*w,0,h,w)]:
        tx, ty = cx + (L-1)*(1 if ax>0 else -1 if ax<0 else 0), cy + (L-1)*(1 if ay>0 else -1 if ay<0 else 0)
        if (cx,cy) == (tx,ty): continue
        key=(cx,cy,tx,ty)
        if key in seen: continue
        seen.add(key)
        area = w*h
        cs, ct, cc = (cx+cy)&1, (tx+ty)&1, 0
        compat = (cs != ct) if area % 2 == 0 else (cs == cc and ct == cc)
        if not compat: continue
        path = list(generate2d(cx, cy, ax, ay, bx, by))
        print(json.dumps({"w":w,"h":h,"s":[cx,cy],"t":[tx,ty],"path":path}))
