# k=2 Zig-Zag Numberlink solver

Solves two-color Zig-Zag Numberlink on an R × C rectangle: given endpoints s0, t0 (color 0) and s1, t1
(color 1), find two vertex-disjoint paths s0–t0 and s1–t1 that together visit every cell. Rows and
columns are numbered from 0.

## Files

| File | Contents |
|---|---|
| `zzn_solve.c` | C implementation (self-contained, including the pattern catalogue) |
| `zzn_solve.js` | JavaScript implementation (Node) |
| `zzn_patterns.js` | forbidden-pattern catalogue, required by `zzn_solve.js` |

## Build and run

```
gcc -O2 -o zzn_solve zzn_solve.c
./zzn_solve 30 30 2 3 25 20 5 27 28 1 --grid      # one instance; --grid prints the solution
./zzn_solve < instances.txt                        # one "R C s0r s0c t0r t0c s1r s1c t1r t1c" per line

node zzn_solve.js 30 30 2 3 25 20 5 27 28 1 --grid
```

Each instance prints one line:

- `solved: path lengths N0 and N1`, followed by the grid with `--grid` (`A`, `B` endpoints, `a`, `b`
  path cells);
- `infeasible: <reason>`, where the reason is the catalogue entry that matched (see
  `zzn_pattern_catalogue.md`) or `exhaustive search (plugdp)`;
- `error: <reason>` if no cleave cut could be found (see Limits).

From JavaScript:

```js
var zzn = require("./zzn_solve.js");
var res = zzn.solve(30, 30, [2, 3], [25, 20], [5, 27], [28, 1]);
// res.status: "solved" | "infeasible" | "error"
// res.paths:  [path0, path1], each a list of [r, c] from s to t   (when solved)
// res.reason: explanation                                          (otherwise)
```

In C, `zzn_solve(R, C, pts, &res)` fills a `result_t` (`status`, `reason`, and each path as cells
`r*C + c`).

Every returned solution is checked before it is returned: correct endpoints, unit steps, no cell used
twice, every cell covered.

## Algorithm

1. **Catalogue check.** An instance matching a forbidden pattern is reported infeasible.
2. **Base case.** If both sides are at most 10, an exact plug dynamic program (plugdp) solves it and
   returns the paths.
3. **Cleave cuts.** Otherwise every straight cut is tried, best first: across the longer side, near the
   middle, and at least 3 cells from every endpoint.
   - **All endpoints on one side:** solve that side recursively. Give the other side, which must have
     even area and both sides at least 2, a Hamiltonian cycle containing every edge along the cut, and
     splice it in by rotating one edge across the cut.
   - **One endpoint alone on its side:** that path crosses the cut once. Place a virtual endpoint on
     each side of the crossing; the lone side is a one-path instance, the other side recursive.
   - **Two endpoints of the same color on each side:** two one-path instances.
   - **One endpoint of each color on each side:** both paths cross, at distinct positions; both sides
     recursive.

   For each cut, every crossing position (or pair of positions) is checked before recursing: one-path
   pieces with the Itai–Papadimitriou–Szwarcfiter (IPS) test, two-path pieces with the catalogue.
4. **One-path pieces** are solved by the same recursion, with plugdp as the base case.
5. **Size policy:** either side at least 26: a cut must be found. Otherwise, with a side above 10: try
   cuts, then fall back to plugdp.

Constants, defined at the top of both files:

| Constant | Value | Meaning |
|---|---|---|
| `BASE_MAX_SIDE` | 10 | both sides at most this: plugdp |
| `CLEAVE_REQUIRED` | 26 | either side at least this: a cut must be found |
| `PLUG_MAX_WIDTH` | 12 | the plugdp fallback is used only when the short side is at most this |
| `EXACT_CHECK` | 8 | two-path pieces with a short side at most this are checked exactly by plugdp, not by the catalogue |
| `TRIES_PER_CUT` | 4 | recursive attempts per cut (feasibility checks are not limited) |
| `CALL_BUDGET` | 200000 | cap on recursive calls |

`EXACT_CHECK`, the failure cache and the call budget were added during testing. The catalogue was
validated only on grids with both sides at least 10, and without the exact check a thin sub-instance
that passed the catalogue but was infeasible sent the search into exhaustive backtracking.

## Validation

| Test | JavaScript | C |
|---|---|---|
| Every configuration of 5×5, 6×6, 5×8, 7×7 vs the exact solver | base case checked on 5×5, 6×6, 5×8 | 59,026 correct |
| 3,000 random configurations each of 11×11, 12×12, 10×11 vs known truth | 9,000 correct | 9,000 correct |
| 621 random instances, 26×26 to 100×100, 60×200, 10×100 | all solved | all solved |
| 720 adversarial instances (corner clusters, edges, perimeter, X crossings, two corners, center) | no errors | no errors; statuses identical to JavaScript |
| Catalogue, C vs JavaScript, entry by entry | — | 608,738 configurations, 0 differences |
| Address and undefined-behavior sanitizers | — | clean on 550 mixed instances |

The C version is roughly 4–6 times faster than the JavaScript. Most instances solve in well under a
second. The slowest seen was about 27 s, in JavaScript, on one 100 × 100 instance.

## Limits

- **Infeasibility of large instances** is decided by the catalogue. Its completeness has been checked
  exhaustively on 10×10, 10×11, 11×11 and 12×12 only. A larger infeasible instance that the catalogue
  misses would show up as `error: no cleave cut found` or `error: search budget exhausted`, not as
  `infeasible`.
- **An `error`** means the search found nothing. It is not a proof that the instance is infeasible.
- **Wide middle-sized rectangles:** a rectangle with a short side above 12 and a long side below 26 that
  admits no cut is reported as an error, because plugdp is impractical at that width.
