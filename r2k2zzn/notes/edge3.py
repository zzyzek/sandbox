"""
Three endpoints in the 6x6 top-left sub-region of a 10x10 grid; fourth endpoint in the opposite corner.
usage: python3 corner6.py R C [budget_seconds]        (resumable; rerun until DONE)
Pattern: s0=a, t0=b (same color, unordered), s1=x, all in rows/cols 0..5, up to diagonal reflection.
Excluded: patterns containing the strongly forbidden mixed pair at (0,1),(1,0).
Fourth endpoint t1, color forced by parity:
   black: boundary (9,9), interior (8,8)          (both on the diagonal)
   white: boundary (9,8) and (8,9), interior (8,7) and (7,8)   (mirror pairs; must agree)
Decided by ./enum exact (plain alternation check, exact plug DP; filter consulted on infeasible ones).
"""
import itertools, json, os, subprocess, sys, time
R, C = int(sys.argv[1]), int(sys.argv[2]); S = 6
DEPTH, SPAN, OFF = 4, 6, int(sys.argv[4]) if len(sys.argv) > 4 else 5   # edge region: rows 0..DEPTH-1, pattern columns OFF..OFF+SPAN-1
BUDGET = float(sys.argv[3]) if len(sys.argv) > 3 else 250.0
D = f"edge3_{R}x{C}_off{OFF}"; os.makedirs(D, exist_ok=True); t0 = time.time()
SQ = (R == C)
black = lambda p: (p[0] + p[1]) % 2 == 0
cells = [(r, c) for r in range(DEPTH) for c in range(SPAN)]
def norm(a, b, x):          # translate so the leftmost endpoint is in column 0
    m = min(p[1] for p in (a, b, x)); f = lambda p: (p[0], p[1] - m)
    return (tuple(sorted((f(a), f(b)))), f(x))
def canon(a, b, x):         # up to translation along the edge and left-right reflection
    o = norm(a, b, x); w = max(p[1] for p in (a, b, x)); rf = lambda p: (p[0], w - p[1])
    return min(o, norm(rf(a), rf(b), rf(x)))
pats = sorted({canon(a, b, x) for a, b in itertools.combinations(cells, 2) for x in cells if x not in (a, b)})
def has_block(a, b, x): return False
cf = f"{D}/combos.json"
if not os.path.exists(cf):
    combos, npar, nblock = [], 0, 0
    for (a0, b0), x0 in pats:
        sh = lambda p: (p[0], p[1] + OFF); a, b, x = sh(a0), sh(b0), sh(x0)
        s = sum(1 if black(p) else -1 for p in (a, b, x))
        need = 2 * ((R * C) % 2) - s                   # color the fourth endpoint must have (+1 black, -1 white)
        if need not in (1, -1): npar += 1; continue
        t1_black = (need == 1)
        mid = C // 2
        pick = lambda opts: [next(p for p in opts if black(p) == t1_black)]
        places = {'B': pick([(R - 1, mid), (R - 1, mid + 1)]), 'I': pick([(R - 3, mid), (R - 3, mid + 1)])}
        for kind, ys in places.items():
            for y in ys:
                combos.append([[list(a0), list(b0)], list(x0), kind, list(y),
                               f"{R} {C} {a[0]} {a[1]} {b[0]} {b[1]} {x[0]} {x[1]} {y[0]} {y[1]}"])
    json.dump({"combos": combos, "npar": npar, "nblock": nblock}, open(cf, "w"))
meta = json.load(open(cf)); combos = meta["combos"]
rf = f"{D}/results.txt"
done = sum(1 for _ in open(rf)) if os.path.exists(rf) else 0
with open(rf, "a") as out:
    while done < len(combos) and time.time() - t0 < BUDGET:
        chunk = combos[done:done + 60]
        r = subprocess.run(["./enum", "exact"], input="\n".join(c[4] for c in chunk) + "\n", capture_output=True, text=True, timeout=280)
        res = r.stdout.split(); assert len(res) == len(chunk)
        for x in res: out.write(x + "\n")
        out.flush(); done += len(chunk)
print(f"patterns={len(pats)} excluded(corner block)={meta['nblock']} parity-impossible={meta['npar']} "
      f"solves={len(combos)} done={done}", "DONE" if done >= len(combos) else "(run again)")
if done < len(combos): sys.exit(0)

# ---- report ----
res = [l.strip() for l in open(rf)]
by = {}
for c, r in zip(combos, res):
    k = (tuple(map(tuple, c[0])), tuple(c[1]))
    by.setdefault(k, {}).setdefault(c[2], []).append(r)
def st(rs):   # T raw alternation, X infeasible, F feasible, ? mirror positions disagree
    v = {'T' if r == "TOPO" else 'X' if r.startswith("INFEAS") else 'F' for r in rs}
    return v.pop() if len(v) == 1 else '?'
names = {('F','F'): 'free', ('T','F'): 'boundary-only, explained by raw alternation', ('X','F'): 'boundary-only (new)',
         ('X','X'): 'strong', ('T','X'): 'strong (boundary case also raw alternation)', ('F','X'): 'interior-only',
         ('F','T'): '?', }
groups = {}
for k, v in by.items(): groups.setdefault((st(v['B']), st(v['I'])), []).append(k)
missed = sum(1 for r in res if r == "INFEAS_MISSED")
out = []
out.append(f"{R}x{C}: three endpoints within rows 0-{DEPTH-1} of the top edge, spanning <= {SPAN} columns, placed from column {OFF}; fourth endpoint on the bottom edge / interior")
out.append(f"patterns (up to translation along the edge and left-right reflection): {len(pats)}; "
           f"cannot occur by parity: {meta['npar']}; exact solves: {len(combos)}; infeasible solves missed by the forced-move filter: {missed}")
out.append("A = the two endpoints of one color, B = one endpoint of the other; the fourth endpoint is B's partner.")
for key, ks in sorted(groups.items(), key=lambda kv: -len(kv[1])):
    out.append(f"  {len(ks):6d}  boundary={key[0]} interior={key[1]}  {names.get(key, 'mirror disagreement' if '?' in key else '?')}")
def pic(k):
    (a, b), x = k; rows = max(p[0] for p in (a, b, x)) + 1
    return ["".join("A" if (r, c) in (a, b) else "B" if (r, c) == x else "." for c in range(SPAN)) for r in range(rows)]
for key in [('X','X'), ('T','X'), ('X','F'), ('F','X')] + [k for k in groups if '?' in k]:
    ks = sorted(groups.get(key, []))
    if not ks: continue
    out.append(f"== {names.get(key, 'mirror disagreement')}: {len(ks)}")
    for k in ks: out.append(f"   A={list(k[0])} B={k[1]}   " + " | ".join(pic(k)))
open(f"{D}/report.txt", "w").write("\n".join(out) + "\n")
print("\n".join(out[:12]))
