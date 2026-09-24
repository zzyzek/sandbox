"""
Four endpoints in the 8x8 top-left sub-region; unique up to diagonal reflection and color swap.
usage: python3 corner4.py [budget_seconds]         (resumable; rerun until it reports DONE)
Stage 1: every parity-compatible pattern solved exactly on 10x10 (./enum exact).
Stage 2: infeasible patterns that are not trivial extensions are re-solved on 12x12
         (./enum check: filters, then exact), to separate corner effects from interference
         by the far edges of the 10x10 grid.
Trivial extension = contains
   - the strongly forbidden pair: mixed colors at (0,1),(1,0);
   - a strongly forbidden 3-endpoint pattern (10x10 corner catalogue), either reflection;
   - a boundary-only 3-endpoint pattern whose fourth endpoint lies on the perimeter.
Excluded as topologically incompatible: raw alternation on the perimeter or a 2x2 block (TOPO).
"""
import itertools, os, re, subprocess, sys, time
S = 8; G1, G2 = 10, 12
BUDGET = float(sys.argv[1]) if len(sys.argv) > 1 else 250.0
D = "corner4"; os.makedirs(D, exist_ok=True); t0 = time.time()
black = lambda p: (p[0] + p[1]) % 2 == 0
refl = lambda p: (p[1], p[0])
cells = [(r, c) for r in range(S) for c in range(S)]

pf = f"{D}/patterns.txt"
if not os.path.exists(pf):
    seen = set(); out = open(pf, "w")
    for P in itertools.combinations(cells, 2):
        rest = [c for c in cells if c not in P]
        for Q in itertools.combinations(rest, 2):
            if P > Q: continue
            if sum(1 if black(p) else -1 for p in P + Q) != 0: continue
            k = min(tuple(sorted((tuple(sorted(map(f, P))), tuple(sorted(map(f, Q)))))) for f in (lambda p: p, refl))
            if k in seen: continue
            seen.add(k)
            (a, b), (c, d) = k
            out.write(f"{a[0]} {a[1]} {b[0]} {b[1]} {c[0]} {c[1]} {d[0]} {d[1]}\n")
    out.close(); del seen
pats = [tuple(map(int, l.split())) for l in open(pf)]

def run(mode, G, lines):
    r = subprocess.run(["./enum", mode], input="\n".join(f"{G} {G} {l}" for l in lines) + "\n",
                       capture_output=True, text=True, timeout=285)
    return [x for x in r.stdout.split() if not x.startswith("CHECKED")] if mode == "exact" else \
           [l.split()[0] for l in r.stdout.splitlines() if not l.startswith("CHECKED")]

# ---- stage 1 ----
rf = f"{D}/stage1.txt"
done = sum(1 for _ in open(rf)) if os.path.exists(rf) else 0
with open(rf, "a") as out:
    while done < len(pats) and time.time() - t0 < BUDGET:
        chunk = pats[done:done + 1500]
        res = run("exact", G1, [" ".join(map(str, p)) for p in chunk]); assert len(res) == len(chunk)
        out.write("\n".join(res) + "\n"); out.flush(); done += len(chunk)
if done < len(pats):
    print(f"stage 1: {done}/{len(pats)} (run again)"); sys.exit(0)

# ---- trivial-extension classification ----
def load3(path):
    strong, bonly, sec = [], [], None
    for l in open(path):
        if l.startswith("== "): sec = l
        m = re.findall(r"\((\d+), (\d+)\)", l)
        if "A=" in l and len(m) == 3 and sec:
            A = frozenset(tuple(map(int, x)) for x in m[:2]); B = tuple(map(int, m[2]))
            for f in (lambda p: p, refl):
                item = (frozenset(map(f, A)), f(B))
                if "strong" in sec: strong.append(item)
                elif "boundary-only (new)" in sec: bonly.append(item)
    return strong, bonly
strong3, bonly3 = load3("corner6_10x10/report.txt")
onper = lambda p: p[0] == 0 or p[1] == 0
def trivial(p):
    P = [(p[0], p[1]), (p[2], p[3])]; Q = [(p[4], p[5]), (p[6], p[7])]
    for x in P:
        for y in Q:
            if {x, y} == {(0, 1), (1, 0)}: return "strong 2-endpoint pair"
    for A, B in ((P, Q), (Q, P)):
        for i in range(2):
            b, partner = B[i], B[1 - i]
            key = (frozenset(A), b)
            if key in strong3: return "strong 3-endpoint pattern"
            if key in bonly3 and onper(partner): return "boundary-only 3-endpoint pattern, fourth on perimeter"
    return None

res1 = [l.strip() for l in open(rf)]
counts = {}
cand = []
for p, r in zip(pats, res1):
    counts[r] = counts.get(r, 0) + 1
    if r.startswith("INFEAS"):
        t = trivial(p)
        counts["trivial: " + t if t else "non-trivial infeasible"] = counts.get("trivial: " + t if t else "non-trivial infeasible", 0) + 1
        if not t: cand.append(p)

# ---- stage 2 ----
sf = f"{D}/stage2.txt"
done2 = sum(1 for _ in open(sf)) if os.path.exists(sf) else 0
with open(sf, "a") as out:
    while done2 < len(cand) and time.time() - t0 < BUDGET:
        chunk = cand[done2:done2 + 20]
        res = run("check", G2, [" ".join(map(str, p)) for p in chunk]); assert len(res) == len(chunk), (len(res), len(chunk))
        out.write("\n".join(res) + "\n"); out.flush(); done2 += len(chunk)
if done2 < len(cand):
    print(f"stage 1 done; stage 2: {done2}/{len(cand)} (run again)"); sys.exit(0)

res2 = [l.strip() for l in open(sf)]
lines = [f"Four endpoints in the 8x8 corner sub-region; {len(pats)} parity-compatible patterns up to reflection and color swap.",
         "Stage 1 (exact, 10x10): " + ", ".join(f"{k}: {v}" for k, v in sorted(counts.items(), key=lambda kv: -kv[1]))]
genuine = [p for p, r in zip(cand, res2) if r in ("COUNTEREXAMPLE",) or r.startswith("REJECTED")]
interf = [p for p, r in zip(cand, res2) if r == "PASS-FEASIBLE"]
lines.append(f"Stage 2 (12x12): still infeasible: {len(genuine)}  "
             f"(exact: {sum(1 for r in res2 if r == 'COUNTEREXAMPLE')}, by the sound filter: {sum(1 for r in res2 if r.startswith('REJECTED'))}); "
             f"feasible on 12x12 (interference in 10x10): {len(interf)}")
def pic(p):
    A = {(p[0], p[1]), (p[2], p[3])}; B = {(p[4], p[5]), (p[6], p[7])}
    rows = max(max(x[0] for x in A | B), 1) + 1; cols = max(max(x[1] for x in A | B), 1) + 1
    return " | ".join("".join("A" if (r, c) in A else "B" if (r, c) in B else "." for c in range(cols)) for r in range(rows))
lines.append("== genuine non-trivial 4-endpoint corner patterns (A = one color's two endpoints, B = the other's):")
for p in genuine: lines.append("   " + pic(p))
lines.append("== infeasible on 10x10 only (far-edge interference):")
for p in interf: lines.append("   " + pic(p))
open(f"{D}/report.txt", "w").write("\n".join(lines) + "\n")
print("\n".join(lines[:4])); print("DONE")
