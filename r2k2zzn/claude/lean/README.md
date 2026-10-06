# Lean development: two-colour Zig-Zag Numberlink on rectangles

The statement is in `ZZN/Defs.lean` (instances, paths, solutions; about 60 lines). Everything else
is checked by Lean against it.

## Main results

| Theorem | File | Statement | Axioms |
|---|---|---|---|
| `ZZN.passes_iff_solvable` | `ZZN/Main.lean` | both sides ≥ 11: `Passes I ↔ Solvable I` | standard + 154 `native_decide` |
| `ZZN.Thin.thinBF_iff` | `ZZN/Thin/Fast.lean` | the plug DP accepts ↔ solvable (any rectangle; fast when a side is ≤ 10) | standard |
| `ZZN.solvableB_iff` | `ZZN/Thin/Decide.lean` | every rectangle: `solvableB I = true ↔ Solvable I` | standard + 154 `native_decide` |

`Passes` is the forbidden-pattern catalogue test (`ZZN/Catalogue.lean`, `fires3`). The theorems do
not depend on the catalogue being transcribed faithfully: they state equivalence with whatever
`fires3` computes.

The `native_decide` results are 144 box checks (`ZZN/Box/*`, Theorem A's finite case,
`ZZN/Finite.lean`, `ZZN/Finite2.lean`) and 10 window certificates (`ZZN/Cert/*`, Theorem B,
`ZZN/Win*.lean`).

## Building

- `lake build` builds the library `ZZN` (all proofs except the `native_decide` checks).
- `lake build ZZN.Main` adds Theorem B's window certificates (`ZZN/Final.lean`, about 45 min on 4
  threads) and the 144 box checks (`ZZN/Boxes.lean`, about 17 CPU-hours).
- `lake build ZZN.Thin.Decide` builds the decision procedure for every rectangle (needs `ZZN.Main`).

`precompileModules` is set for `ZZN` and `GridHam` in the lakefile. Without it `native_decide` runs
our functions in the interpreter, about 400 times slower. Cap parallelism with
`LEAN_NUM_THREADS=4`; each Lean process needs about 2 GB of private memory.

## Tools (executables)

- `boxcheck`: run or sample a box check (`boxcheck w h [a]`, `boxcheck sample w h stride`).
- `thintime`: time the plug DP on random thin instances against the unverified solver.
- `movecheck`, `movetime`, `soltime`, `symcheck`, `catcheck`: cross-checks and timings (see
  `restrict/RUNLOG.md`, E25–E33).

## History and plans

`PLAN.md` (status and proof structure), `../restrict/RUNLOG.md` (every run, with timings).
