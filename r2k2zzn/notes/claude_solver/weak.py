import itertools, random, subprocess, sys, json
R = C = int(sys.argv[1]) if len(sys.argv) > 1 else 10
W = int(sys.argv[2]) if len(sys.argv) > 2 else 3
def col(p): return 1 if (p[0] + p[1]) % 2 == 0 else -1
def parity_ok(pts): return 2 * ((R * C) % 2) == sum(col(p) for p in pts)
def run(lines):
    out = []
    for i in range(0, len(lines), 400):
        r = subprocess.run(["./enum", "check"], input="\n".join(lines[i:i+400]) + "\n", capture_output=True, text=True, timeout=280)
        out += [l.split()[0] for l in r.stdout.splitlines() if not l.startswith("CHECKED")]
    return out
def line(s0, t0, s1, t1): return f"{R} {C} {s0[0]} {s0[1]} {t0[0]} {t0[1]} {s1[0]} {s1[1]} {t1[0]} {t1[1]}"
TL = [(r, c) for r in range(W) for c in range(W)]
# patterns at top-left: ('same', a, b) -> s0=a,t0=b ; ('mixed', a, b) -> s0=a, t1=b
pats = [('same', a, b) for a, b in itertools.combinations(TL, 2)] + [('mixed', a, b) for a, b in itertools.permutations(TL, 2)]
def full(p, q):  # p at TL, q = (c,d) complementary cells
    k, a, b = p; c, d = q
    return (a, b, c, d) if k == 'same' else (a, c, d, b)   # mixed: s0=a,t0=c,s1=d,t1=b
# strong test: other two terminals in the middle region
rng = random.Random(0)
mid = [(r, c) for r in range(3, R - 3) for c in range(3, C - 3)]
tests = {}
for p in pats:
    cand = [q for q in itertools.permutations(mid, 2) if parity_ok(full(p, q))]
    tests[p] = rng.sample(cand, min(6, len(cand)))
lines = [line(*full(p, q)) for p in pats for q in tests[p]]
res = run(lines); i = 0; strong = set()
for p in pats:
    n = len(tests[p]); rr = res[i:i + n]; i += n
    if n and all(x != "PASS-FEASIBLE" for x in rr): strong.add(p)
print(f"{R}x{C}, window {W}: {len(pats)} two-terminal corner patterns, {len(strong)} strongly forbidden (infeasible with every middle placement tried)")
print("  strong:", sorted((k, a, b) for k, a, b in strong))
# pairing with complementary patterns at TR and BR windows
corners = {'TR': lambda r, c: (r, C - 1 - c), 'BR': lambda r, c: (R - 1 - r, C - 1 - c)}
weak = {}
for name, f in corners.items():
    Q = [(f(*x), f(*y)) for x, y in itertools.permutations(TL, 2)]
    combos = []
    for p in pats:
        if p in strong: continue
        for q in Q:
            pts = full(p, q)
            if len(set(pts)) < 4 or not parity_ok(pts): continue
            c_, d_ = f(*q[0]), f(*q[1])          # partner mapped back to the top-left frame (f is an involution)
            qk = ('same',) + tuple(sorted((c_, d_))) if p[0] == 'same' else ('mixed', c_, d_)
            if qk in strong or ('same', d_, c_) in strong: continue
            combos.append((p, q, line(*pts)))
    res = run([c[2] for c in combos])
    for (p, q, l), r in zip(combos, res):
        if r in ("COUNTEREXAMPLE", "REJECTED(forced)"):   # infeasible and not plain parity/perimeter/2x2 alternation
            weak.setdefault(p, []).append((name, q, r))
    print(f"  {name}: {len(combos)} combinations tested", flush=True)
# drop pairs whose partner is itself strong-forbidden when placed at TL (reflect back)
def refl(p):  # reflect across the main diagonal
    k, a, b = p; return (k, (a[1], a[0]), (b[1], b[0]))
onper = lambda x: x[0] == 0 or x[1] == 0
seen = set(); rows = []
for p in sorted(weak):
    if refl(p) in seen: continue
    seen.add(p); rows.append(p)
for title, cond in [("both terminals off the perimeter", lambda p: not onper(p[1]) and not onper(p[2])),
                    ("at least one terminal on the perimeter", lambda p: onper(p[1]) or onper(p[2]))]:
    sel = [p for p in rows if cond(p)]
    print(f"weakly forbidden, {title}: {len(sel)} (up to diagonal reflection)")
    for p in sel:
        print(f"  {p[0]:5s} s0{p[1]} {'t0' if p[0]=='same' else 't1'}{p[2]}  partners={len(weak[p])}  e.g. {[(n, q) for n, q, _ in weak[p][:3]]}")
