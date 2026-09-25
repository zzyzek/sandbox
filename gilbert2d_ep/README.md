# Gilbert curve with arbitrary endpoints

`gilbert_ep` builds a generalized Hilbert ("gilbert") curve on a `w × h` rectangle from any cell
`(x0,y0)` to any cell `(x1,y1)`. The path visits every cell exactly once, with orthogonal steps only.
The exception is when the endpoints are not color compatible, and then there is exactly one diagonal
step. When the endpoints are the two corners of one edge, the output is identical to `gilbert2d`
(https://github.com/jakubcerveny/gilbert).

## Files

| File | Contents |
|---|---|
| `gilbert_ep.js` | JavaScript implementation (Node); needs `zzn_solve.js` and `zzn_patterns.js` alongside |
| `gilbert_ep.c` | C implementation; `#include`s `zzn_solve.c`, which must be alongside |
| `tests/` | test scripts (see Testing) |

The k=2 Zig-Zag Numberlink solver files (`zzn_solve.js`, `zzn_patterns.js`, `zzn_solve.c`) are used
unchanged.

## Build and run

```
gcc -O2 -o gilbert_ep gilbert_ep.c
./gilbert_ep 64 48 5 7 40 30          # prints the path, one "x y" per line
./gilbert_ep < instances.txt          # one "w h x0 y0 x1 y1" per line; prints
                                      #   "ok <cells> <diagonals> <fnv1a hash>",
                                      #   "infeasible: <reason>" or "error: <reason>"

node gilbert_ep.js 64 48 5 7 40 30    # same output as the C single-instance mode
```

From JavaScript:

```js
var gep = require("./gilbert_ep.js");
var res = gep.gilbert_ep(64, 48, 5, 7, 40, 30);
// res.status: "ok" | "infeasible" | "error"
// res.x, res.y: Int32Array coordinates of the path       (when "ok")
// res.path:     [[x,y], ...], built on first access      (when "ok")
// res.reason:   explanation                              (otherwise)
```

In C, `gilbert_ep(w, h, x0, y0, x1, y1, &res)` fills a `gep_result_t` (`status`, `reason`, and on
`GEP_OK` the path as `res.path[0..res.n-1]`, which the caller frees).

Statuses:

- **ok** means the path was built and checked before being returned. The check covers the endpoints,
  every cell exactly once, unit steps, and the required number of diagonals.
- **infeasible** is always proven. The reason is one of the following:
  - s = t;
  - the IPS test fails, when no diagonal is needed;
  - a diagonal is needed in a single row or column;
  - the color count rules it out: a diagonal is needed and both endpoints are off the corner color
    of an odd rectangle.
- **error** means the search failed, either with no path found or with its budget exhausted. It is
  not a proof of infeasibility. None occurred in the tests below.

## Algorithm

1. **Frame.** Each rectangle takes the gilbert2d orientation whose canonical endpoints are closest
   to its actual endpoints. For endpoints on the corners of one edge, this is gilbert2d's own frame.
   The cut sizes reproduce gilbert2d's arithmetic, including floor division for negative directions.
2. **Template.** The rectangle is split with the gilbert2d template for its frame:
   - if the major side is more than 3/2 of the minor side, it is cut in two (pieces L, R);
   - otherwise the minor side is halved and the lower half halved again (pieces A, B, C).
3. **Schedule.** The pieces are visited with s's piece first and t's piece last. Consecutive pieces
   meet at a junction: adjacent cells on either side of the cleave, which become virtual endpoints.
   Junctions nearest the rectangle's outer edge are tried first, which is where gilbert2d puts them.
4. **One-segment pieces** are solved by the same recursion.
5. **Both endpoints in one piece.** The path leaves that piece, covers the others and comes back,
   so the piece holds two segments and is solved with the k=2 ZZN solver.
   - Counterclockwise loops are tried first, with x pointing right and y up; set
     `CCW_SIGN`/`GEP_CCW_SIGN` to -1 for screen coordinates.
   - Before calling the solver, the parity check and the boundary-interleaving check are applied.
   - If no loop works, the cut is moved (nearest the gilbert2d cut first) so that s and t land in
     different pieces.
6. **Diagonal step.** When needed, it goes as late in the schedule as possible: at a junction, or
   inside a later piece.
7. **Fallbacks,** for rectangles with a short side of at most 12:
   - the exact plug DP from the ZZN solver, for one orthogonal path;
   - for one diagonal step p↘q, the plug DP's two-path case, solving s→p and q→t;
   - a 3 × (odd) strip with its endpoints at the middle of a short end and the cell next to it
     needs its diagonal at an endpoint, so it is built directly.

The tuning constants are at the top of each file: search budgets, fallback limits, and the number of
moved cuts.

## Testing

The scripts expect the implementation one directory up, and the ZZN solver files next to it.

| Script | Checks |
|---|---|
| `ref_corner.py N [gilbert-dir]` + `test_corner.js` | every corner-pair orientation up to N × N against gilbert2d |
| `brute_diag.c` + `test_truth.js` | exhaustive search for a path with the required diagonals, per (s, t), versus gilbert_ep |
| `test_sweep.js K M [seed]`, `test_thin.js` | random sizes and endpoints; random thin strips |
| `batch.js` | JavaScript counterpart of `./gilbert_ep < instances.txt`, for comparing the two implementations line by line |

Results:

- **Gilbert:** identical to `gilbert2d` in all 5,570 corner-endpoint cases up to 32 × 32 where
  `gilbert2d` returns a valid path. In the other 322 orientations, gilbert2d's own output isn't a
  valid path (for example, 3 × 5 run from (0,4) to (0,0)). gilbert_ep returns a valid path in all
  of them.
- **Brute force:** zero misses on 16,396 (s, t) pairs, on grids up to area 36. All infeasible
  verdicts agree.
- **Random sizes and thin strips:** 3,000 random sizes up to 80 × 80 and 3,000 thin strips (2 to 14
  wide, up to 160 long). All either solved or were proven infeasible.
- **C versus JavaScript:** identical output on all 28,288 instances above. That covers status, path
  length, diagonal count and path hash. The C code is clean under AddressSanitizer and
  UndefinedBehaviorSanitizer.

Timings:

| Case | C | JavaScript |
|---|---|---|
| 1024 × 1024, corner endpoints | 0.3 s | 1.9 s |
| 4096 × 4096, corner endpoints | 4.6 s, 146 MB | 19 s |
| 4096 × 4096, arbitrary endpoints | 5.1 s | 23 s |

## Known limits

- **Large two-segment pieces are slow.** A ZZN call on a large two-segment piece can be slow, for
  example about 8 s (C) or 77 s (JS) for one 500 × 500 piece. The time is spent in the pattern
  catalogue's `outerFaceOrder` and `effectiveAlternation`.
- **Test coverage.** The tests are sweeps, not proofs. Beyond the brute-force sizes, a failed search
  reports "error" rather than a wrong answer.
