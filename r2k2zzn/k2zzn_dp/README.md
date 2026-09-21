# Plug DP for k=2 zig-zag numberlink, general R, with path construction

Builds on the general-R feasibility solver by adding `find_path`, which
returns the two actual paths (not just yes/no) when a solution exists.

## Why this needed more than a small addition

`is_feasible` deduplicates profiles as it sweeps -- by design, many
different ways of reaching a profile collapse into one stored state, which
is exactly what keeps the state space small. That's also exactly what
throws away the information needed to reconstruct a path: once two
histories merge into one profile, you can no longer tell which one
actually happened.

`find_path` reruns the same sweep, but this time each column also builds
a small map: for every profile reached, one witness of (source profile,
the per-row left/right/up/down edge choices that produced it in this
column). Any single witness is enough -- it doesn't matter which of
several ways of reaching a profile gets kept. After the forward sweep
confirms feasibility, walking that chain of witnesses backward from the
final all-empty profile recovers exactly which grid edges were used in
every column. From that edge set, tracing out path0 (from s0, following
used edges, until t0) and path1 similarly is a plain graph walk.

## Bug found and fixed after initial delivery

Reported: `findPath(3, 7, [2,0], [2,2], [4,0], [4,2])` returned a path for
path0 but `null` for path1, even though `isFeasible` on the same input
returned `true`.

Root cause: row 4 doesn't exist in a 3-row grid, and nothing checked that.
An out-of-bounds terminal is invisible to `terminal_at` -- it never
matches during the sweep -- so that color is silently never required to
cover any cells at all, and the DP can find a spurious "solution" using
only the other color across the entire grid. That's not a disagreement to
paper over; it's a wrong answer, so all three languages now validate
their input up front (bounds-check all four terminals, require them to be
four distinct cells) and refuse to compute on invalid input:

- Python: raises `ValueError` with a specific message
- JavaScript: throws an `Error` with a specific message
- C: `is_feasible`/`find_path` return `-1` (distinct from 0=infeasible,
  1=feasible) and print why to stderr

Re-validated after the fix: same 39,312-case suite, zero disagreements,
zero invalid witnesses, in all three languages -- the fix only rejects
genuinely invalid input, it doesn't change behavior on anything that was
already being computed correctly.

## Usage

```
python3 plugdp.py
node plugdp.js

gcc -O2 -o plugdp plugdp.c
./plugdp 3 4 0 0 1 2 0 1 2 2     # rows num_cols s0r s0c t0r t0c s1r s1c t1r t1c
```

## Validation

Checked two separate things, not just "does it return something":

1. **Agreement with `is_feasible`** -- `find_path` returns a witness if
   and only if `is_feasible` says the instance is feasible.
2. **Witness validity** -- every returned path pair independently checked
   to start/end at the correct terminals, be a simple path, not overlap
   the other path, and jointly cover every cell of the grid.

All three languages: 39,312 cases (R=1..6, various C), zero feasibility
disagreements, zero invalid witnesses.

## Same limitation as before, now doubled

Profiles are deduplicated once per column, not once per row within a
column (see the general-R README for why this matters at larger R). Path
construction's history maps add one more R-sized array per stored profile
per column, so memory use is proportionally higher than plain feasibility
checking at the same R. Fine for the R range this is meant for (up to
roughly a dozen); not optimized further.
