# zzn (Python)

Decide and solve two-colour Zig-Zag Numberlink on rectangles: given an R × C grid and endpoints
s0, t0 (colour A) and s1, t1 (colour B), find two disjoint paths s0 → t0 and s1 → t1 covering every
cell, or report that none exists. The algorithm is described in
[`docs/ALGORITHM.md`](../../docs/ALGORITHM.md); its correctness is proved in Lean (`lean/`).

Pure Python 3.8+, no dependencies.

## Library

```python
import sys; sys.path.insert(0, "lib/python")      # or copy the zzn/ package
from zzn import Instance, decide, solve, explain, render

inst = Instance(12, 12, (0, 0), (0, 11), (11, 0), (11, 11))   # R, C, s0, t0, s1, t1; cells (row, col)
decide(inst)                # True
p0, p1 = solve(inst)        # lists of (row, col), p0 from s0 to t0, p1 from s1 to t1
print(render(inst, (p0, p1)))

bad = Instance(12, 12, (0, 0), (11, 11), (0, 11), (11, 0))
decide(bad), solve(bad)     # False, None
explain(bad)                # 'catalogue entry T1 fires'

trace = []
solve(Instance(16, 13, (5, 2), (12, 10), (6, 9), (13, 3)), trace)
for step in trace: print(step)   # reductions, moves and thin solves, as tuples
```

| Function | |
|---|---|
| `decide(inst) -> bool` | solvability: plug DP if a side ≤ 10, else the catalogue |
| `solve(inst, trace=None) -> (p0, p1) or None` | a solution (checked before it is returned) |
| `explain(inst) -> str` | which catalogue entry fires, or that the DP decided |
| `fires(R, C, s0, t0, s1, t1) -> str or None` | the catalogue alone (entry name or None) |
| `acceptable(R, C, s, t)`, `hamiltonian_path(R, C, s, t)` | Hamiltonian paths in rectangles (IPS) |
| `solve_paths(R, C, [((r, c), colour), ...])` | the plug DP for one or two colours |
| `check_solution(inst, sol)`, `render(inst, sol)` | verification and an ASCII picture |

`Instance` is a named tuple; the four endpoints must be distinct and inside the grid
(`ValueError` otherwise). `solve` raises `SolverError` only on an internal error (never observed).

## Command line

```
python3 lib/python/zzn_cli.py R C s0r s0c t0r t0c s1r s1c t1r t1c [--decide] [--grid] [--trace] [--json]
python3 lib/python/zzn_cli.py [options] < instances.txt     # one instance per line
python3 -m zzn ...                                           # from lib/python
```

```
$ python3 zzn_cli.py 12 12 0 0 11 11 0 11 11 0
unsolvable: catalogue entry T1 fires
$ python3 zzn_cli.py 6 6 0 0 0 5 5 0 5 5 --grid
solvable
A: 0,0 0,1 0,2 0,3 0,4 0,5
B: 5,0 4,0 3,0 2,0 1,0 1,1 2,1 3,1 4,1 5,1 5,2 4,2 3,2 2,2 1,2 1,3 2,3 3,3 4,3 5,3 5,4 4,4 3,4 2,4 1,4 1,5 2,5 3,5 4,5 5,5
AaaaaA
bbbbbb
bbbbbb
bbbbbb
bbbbbb
BbbbbB
```

`--trace` lists the steps (reductions, moves with their cuts, thin solves). Sizes of pieces are
given in the orientation in which they were solved (possibly transposed).

## Performance

Instances with both sides ≥ 11 take milliseconds to a fraction of a second (reductions are linear
in size; moves happen on boxes with sides ≤ 22). Thin instances use the plug DP, which in pure
Python is slow for widths 9–10 (seconds to minutes for long grids); the C library is about 50×
faster.

## Tests

```
python3 tests/test_random.py 300 1 3 30                   # random instances: valid solutions, decide == solve
python3 tests/test_random.py 300 3 11 12 --exact ./zf     # also against an exact solver (1/0 per line)
```
