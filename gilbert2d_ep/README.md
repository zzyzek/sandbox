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
- **error** means the search failed. It is not a proof of infeasibility. None occurred in the tests
  below.

## Algorithm

1. **Frame.** Each rectangle takes the gilbert2d orientation whose canonical endpoints are closest
   to its actual endpoints. For endpoints on the corners of one edge, this is gilbert2d's own frame.
   The cut sizes reproduce gilbert2d's arithmetic, including floor division for negative directions.
2. **Templates.** A template splits the rectangle into pieces:
   - kind 2: the major side is cut in two (pieces L, R);
   - kind 3: the minor side is halved and the lower half halved again (pieces A, B, C).

   gilbert2d uses kind 2 when the major side is more than 3/2 of the minor side, and kind 3
   otherwise.
3. **Schedule.** The pieces are visited with s's piece first and t's piece last. Consecutive pieces
   meet at a junction: adjacent cells on either side of the cleave, which become virtual endpoints.
   Junctions nearest the rectangle's outer edge are tried first, which is where gilbert2d puts them.
   If s and t share a piece, the path can leave it, cover the others and come back (a loop), so that
   piece holds two segments.
4. **Recursion first.** Every recursive option is tried before any non-recursive solver:
   1. the best frame, each piece visited once: its gilbert2d template, then the other template kind,
      then moved cuts of both, nearest the original cut first;
   2. loops whose two-segment piece is split by a straight cut into two one-path problems, each
      solved by the recursion;
   3. the other seven frames, as in step 1.
5. **Straight-run control.** Steps 1–3 run twice.
   - The first round is strict. A plan is rejected if its actual output contains a straight run
     longer than 6 (`MAX_RUN`), which is the longest gilbert2d itself produces at any size. A cheap
     shape check skips plans whose thin pieces would force hairpins or lines. gilbert2d's own plan
     is exempt when the endpoints are the corners of one edge.
   - The second round has no run limit.
   - Rectangles 3 or less across skip the strict round, because long runs are forced there.
6. **Non-recursive solvers, only after all of the above:**
   - loops whose two-segment piece uses the k=2 ZZN solver, counterclockwise first (x pointing
     right and y up; set `CCW_SIGN`/`GEP_CCW_SIGN` to -1 for screen coordinates);
   - for rectangles with a short side of at most 12, the exact plug DP from the ZZN solver. This
     covers one orthogonal path, or a path with one diagonal step p↘q using the plug DP's two-path
     case (s→p and q→t);
   - a direct construction for 3 × (odd) strips whose endpoints are the middle of a short end and
     the cell next to it.
7. **Diagonal step.** When needed, it goes as late in the schedule as possible: at a junction, or
   inside a later piece.
8. **Bounded work.** Each rectangle's recursive search has a work budget proportional to its area,
   nested inside its parent's. The strict round also has a global budget. If a rectangle's budget
   cuts its search short, it runs the plain search (gilbert2d template, ZZN loops, moved cuts)
   before the exact fallbacks.

The tuning constants are at the top of each file:

| Constant | Meaning |
|---|---|
| `MAX_RUN` | run limit in the strict round |
| `STRICT_TRIES`, `STRICT_BUDGET`, `STRICT_PER_CELL` | caps on strict-round work |
| `LOCAL_BUDGET`, `LOCAL_PER_CELL` | each rectangle's search budget |
| `MOVED_CUTS` | how many moved cuts to try |
| `CALL_BUDGET`, `CALLS_PER_CELL`, `ZZN_BUDGET` | overall search limits |
| `PLUG_MAX_SIDE`, `DIAG_MAX_AREA`, `DIAG_NARROW` | exact fallback limits |

In C, each constant has a `GEP_` prefix.

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
  valid path. gilbert_ep returns a valid path in all of them.
- **Brute force:** zero misses on 16,396 (s, t) pairs, on grids up to area 36. All infeasible
  verdicts agree.
- **Random sizes and thin strips:** 3,000 random sizes up to 80 × 80 and 3,000 thin strips (2 to 14
  wide, up to 160 long). All either solved or were proven infeasible.
- **C versus JavaScript:** identical output on all 28,288 instances above. That covers status, path
  length, diagonal count and path hash. The C code compiles with no warnings under `-Wall -Wextra`
  and is clean under AddressSanitizer and UndefinedBehaviorSanitizer.

Quality:

- **Method share, 3,000 random instances:** 99.6% of cells come from plain recursion and 0.4% from
  two-segment pieces split by recursion. ZZN produces under 0.1% and plug DP about 0.01%.
- **Longest straight run:** at most 6 (gilbert2d's own maximum) in all but 9 of 2,591 random
  instances at least 4 cells across, and all but 21 of 2,386 strip instances at least 4 across.

Timings:

| Case | C | JavaScript |
|---|---|---|
| 1024 × 1024, corner endpoints | 0.4 s | 2.1 s |
| 4096 × 4096, corner endpoints | 6.7 s, 146 MB | — |
| 4096 × 4096, arbitrary endpoints | 7.4 s, 146 MB | 31 s |
| 3,000 random instances up to 80 × 80 (total) | 3.9 s | 20 s |

## Known limits

- **A few long straight runs remain.** Some instances still have runs longer than 6, especially
  where a diagonal step is needed and no strict plan exists, for example 17 × 62 from (0,33) to
  (2,33). In rectangles 3 or less across, long runs are forced.
- **Large two-segment pieces are slow.** When the ZZN solver is reached on a large two-segment
  piece, it can be slow. That is now rare.
- **Test coverage.** The tests are sweeps, not proofs. Beyond the brute-force sizes, a failed search
  reports "error" rather than a wrong answer.
