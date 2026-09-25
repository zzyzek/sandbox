# Catalogue of forbidden patterns for two-color Zig-Zag Numberlink on rectangles

This catalogue lists local endpoint patterns that make a k = 2 Zig-Zag Numberlink instance on an R × C rectangle infeasible, together with the exact conditions under which each applies. `zzn_patterns.js` tests every entry explicitly.

**Scope: grids with both sides at least 10.** The proved entries hold on any grid; the verified entries, and all the validation below, are stated for this range only. Smaller grids have size-dependent effects and are handled by the plug DP.

Each entry is one of two kinds:

- **Proved.** A short argument, using only the cells shown, shows no solution exists. These hold on every grid size, provided their conditions are met.
- **Verified.** The pattern was found infeasible by an exact solver in the setting described, and has been re-checked on larger grids, but has no written proof. These carry the conditions they were tested under, and must not be applied outside them.

The catalogue is not complete: some infeasible instances match no entry. The general test in `zzn_infeasible.js` chains deductions and catches more (see the writeup `zzn_infeasibility.md`). A catalogue match is proof of infeasibility (or, for verified entries, strong evidence); no match proves nothing.

## Conventions

- An instance has endpoints s0, t0 (one color) and s1, t1 (the other). A solution is two vertex-disjoint paths, s0–t0 and s1–t1, covering every cell.
- In the pictures, **A** is one color and **B** the other, in either assignment. `.` is a cell that holds **no endpoint** ("empty"); its path color is unknown.
- Corner patterns are drawn at the top-left corner, cells (row, col) with (0,0) the corner cell. Each applies at all four corners and in both orientations (reflected across the corner's diagonal). Edge patterns are drawn on the top edge and apply on all four edges.
- A pattern lists only the endpoints it involves. Its conditions say which other cells must be empty.

## 1. Global checks

**P — parity.** Colour cell (r, c) black when r + c is even. Counting black minus white cells along the two paths gives

```
 2 · (#black − #white)  =  sign(s0) + sign(t0) + sign(s1) + sign(t1)      (+1 black, −1 white)
```

where the left side is 0 when R·C is even and 2 when it is odd. Any instance violating it is infeasible.

**T1 — perimeter alternation.** All four endpoints on the perimeter, with colors alternating around it. The grid is planar, so two disjoint paths joining alternating points on one face cannot exist.

**T2 — unit-square alternation.** The four endpoints fill a 2 × 2 block, each color on a diagonal: they alternate around the grid point in the middle.

```
 A . . . B        . . . .
 . . . . .        . A B .
 B . . . A        . B A .
    T1               T2
```

## 2. Proved local patterns

**L1 — isolated endpoint.** An endpoint all of whose neighbours are endpoints of the other color. It needs one neighbour of its own color and has none.

```
 B A .
 A . .        B at the corner, both neighbours A
```

**L2 — corner block.** Condition: the corner cell (0,0) is empty.

```
 . A          The empty corner cell has only two neighbours, so both must be on its path;
 B .          they hold different colors, so the paths would join.
```

If the corner cell is itself an endpoint, it needs only one neighbour and this pattern blocks nothing.

**L3 — corner wedge.** Condition: (0,0) and (0,1) empty.

```
 . . A        The corner cell must join (0,1) and B at (1,0), so (0,1) lies on B's path and needs
 B A .        one more neighbour of that color. Its other neighbours, (0,2) and (1,1), are both A.
```

**L4 — corner fork.** Condition: (0,1) and (1,0) empty.

```
 A . B        (0,1) has neighbours A, A and B and needs two of the same color: it must join the two
 . A .        A endpoints. That completes path A (three cells), and (1,0) is left with only one
              usable neighbour, (2,0).
```

**L5 — corner trap.** Condition: (0,1), (1,0) and (1,1) empty.

```
 B . A        B leaves the corner through (0,1) or (1,0); say (0,1). (0,1) then needs a second
 . . .        B-colored neighbour, and only (1,1) is left. (1,0) needs two neighbours, and the only
 A . .        ones left are (1,1) and A at (2,0). So (1,1) would join both colors. The other case
              is symmetric.
```

**L6 — double corner closure.** Condition: the grid has more than six cells.

```
 . A . . . . B .        At one corner, the two neighbours of the empty corner cell are the two endpoints
 A . . . . . . B        of one color; at another corner, the same holds for the other color. Each empty
                        corner cell must join its two neighbours, so each path is exactly three cells.
```

**E1 — edge closure.** On any edge. No further condition (the two cells between the pairs are empty by construction).

```
 . . A . . B . .        Cell x = (0,k+1) sits between the two A's, cell y = (0,k+2) between the two B's.
 . . . A B . . .        An edge x–y would give x color A and y color B, so it is not used. Then x must join
                        both A's and y both B's: each path closes after three cells.
```

## 3. Proved rewrites and the effective-alternation test

A rewrite is a local pattern that is harmless on its own but forces part of a path through a corner. The forced cells are *settled*: removed from the grid. An endpoint whose path is forced along the settled cells gets a new *effective* position, the first unsettled cell on its path.

**R1 — corner hop.** Condition: an endpoint E at (0,1); (0,0) and (1,0) empty.

```
 . E . .      The empty corner cell must join (0,1) and (1,0). So E's path runs E → (0,0) → (1,0).
 . . . .      Settled: (0,0), (0,1). E is effectively at (1,0), on the left edge.
```

**R2 — diagonal pair.** Condition: A at (0,0) and (1,1); (0,1), (1,0), (0,2), (2,0) empty.

```
 A . .        (0,1) cannot join both A's: that completes path A and leaves (1,0) with one usable
 . A .        neighbour. So (0,1) uses (0,2) and one A; likewise (1,0) uses (2,0) and one A. Path A is
 . . .        A → (0,1) or (1,0) → out, and back in through the other → A.
              Settled: (0,0), (0,1), (1,0), (1,1). A's effective endpoints: (0,2) and (2,0).
```

**R3 — widget.** Condition: X at (1,2), Y at (2,1), different colors; (0,0), (0,1), (0,2), (0,3), (1,0), (1,1), (2,0), (3,0) empty.

```
 X claims the corner            Y claims the corner
 x x x x →                      y y x x →
 x x X .                        y y X .
 y Y . .                        y Y . .
 y . . .                        y . . .
 ↓                              ↓
```

The corner cell must join (0,1) and (1,0). Cell (1,1) takes exactly one of X, Y (both would join the colors) and exactly one of (0,1), (1,0) (both would close a loop through the corner). If X takes (0,1), then (0,2) is left with one usable neighbour; symmetrically for Y and (1,0). So the two fillings above are the only ones. Both settle the same eight cells, {(0,0), (0,1), (0,2), (1,0), (1,1), (2,0), X, Y}, and in both X continues from (0,3) and Y from (3,0). So X is effectively at (0,3) and Y at (3,0).

**R — effective alternation.** Apply every applicable rewrite, at most one per corner and without overlapping cells. If the four effective endpoints then lie on the outer face of the remaining region, each once, and their colors alternate around it, the instance is infeasible (the planar argument of T1, on the smaller region).

Example: 12 × 12 with s0 = (0,0), t0 = (0,10), s1 = (1,0), t1 = (1,10). At the top-right corner, t0 hops (R1) down to (1,11). t1 now touches the settled cells, so it lies on the new outer face, and the order around it is A, B, A, B.

```
 A . . . . . . . . . # #        # settled, a effective end of A
 B . . . . . . . . . B a
```

Two widgets at adjacent corners, such as s0 = (1,2), t0 = (2,10), s1 = (1,9), t1 = (2,1) on 12 × 12, are caught the same way.

## 4. Verified entries

### 4.1 Boundary-only corner patterns (B)

Three endpoints in the corner: two of color A and one of color B. These are infeasible when **B's partner (the fourth endpoint) is on the perimeter outside the 6 × 6 corner window** (rows and columns 0–5 of the corner frame), and **no other endpoint is inside that window**.

Why the condition: the patterns were found by exact solving with the fourth endpoint at the far corner of 10 × 10, 10 × 11 and 11 × 11 grids. Most are enclosures: a forced path through the corner loops back to the second A and traps B, so B's partner must be inside the loop. Perimeter cells near the pattern can be inside the loop, which is why the rule is limited to the far perimeter. Applied without this condition, these patterns rejected 40 feasible 10 × 10 instances.

For grids with at least one even side, use the even list (identical on 10 × 10 and 10 × 11). For grids with both sides odd, use the odd list.

Even list (21 patterns):

```
B1            B2            B3            B4            B5            B6            B7
A . .         . A A         . A A         . A . A       . A . . A     . A . . A     . A . . . A
. A B         . B .         . . B         . B . .       . B . . .     . . B . .     . B . . . .

B8        B9        B10       B11       B12       B13       B14
. A .     . A . .   . A .     . A .     . A . B   . A . .   . A .
. B A     . . A B   . . A     . . A     . . . A   . . . B   . . .
                    . . B     . . .               . A . .   . A B
                              . B .

B15           B16           B17           B18           B19           B20           B21
. A           . . A         . . . A       . . . . A     . . . . A     . . . . A     . . . . . A
. .           B . .         B A . .       B A . . .     B . . . .     . . B . .     B A . . . .
. A           . A .                                     . A . . .     . A . . .
. B
```

Odd × odd list (5 patterns):

```
b1          b2          b3          b4          b5
A . .       A . .       . A A       . A . . A   . . . . A
. A B       . A .       . B .       . B . . .   B A . . .
            . . B
```

### 4.2 Corner configurations for grids with R·C even (C)

Whole configurations: all four endpoints, near one corner, with A one color's pair and B the other's. Each was found infeasible by the exact solver on 10 × 10 and again on 12 × 12. **Apply only on grids with both sides at least 10 and R·C even**, where they were tested. C1–C18 come from the complete four-endpoint search in the 8 × 8 corner region; C19–C36 are infeasible configurations that needed several deductions in a row, found during the 10 × 10 validation. Several (C2–C5, C12, …) are enclosure patterns whose far endpoint lies beyond the 6 × 6 window of section 4.1.

```
C1                C2                C3                C4                C5                C6
. A . A           . A . . . . A B   . A . . . . A     . A . . . . A     . A . . . . . A   . A . .
. B . B           . B . . . . . .   . B . . . . .     . . B . . . .     . B . . . . . .   . B B A
                                    . . . . . . .     . . . . . . .     . . . . . . . .
                                    . . . . . . .     . . . . . . .     . . . . . . . .
                                    . . . . . . .     . . . . . . .     . . . . . . . .
                                    . . . . . . .     . . . . . . .     . . . . . . . .
                                    . . . . . . .     B . . . . . .     B . . . . . . .
                                    B . . . . . .

C7        C8        C9        C10       C11       C12
. A . .   . A . .   . A .     . A .     . A . .   . A
. . B A   . . B A   . B B     . . B     . . . B   . B
. . B .   . . . .   . . A     . . A     . . A .   . .
          . B . .             . B .     B . . .   . .
                                                  . .
                                                  . .
                                                  B .
                                                  A .

C13             C14             C15             C16             C17             C18
. . A           . . A           . . . A         . . . . . . A   . . . .         . . . .
. A .           . . B           . . . .         . . B . . . .   . . A B         . . A B
. B .           A B .           . A . .         . A . . . . .   . B A .         . B . .
B . .                           . B . .         . . . . . . .                   . A . .
                                B . . .         . . . . . . .
                                                . . . . . . .
                                                B . . . . . .

C19         C20         C21         C22         C23         C24
. A . . B   . A . . B   . A . .     . A . .     . A .       . A .
. . A . .   . . A . .   . . A B     . . A B     . . A       . . A
. . B . .   . . . . .   B . . .     . . . .     B . B       . . B
            . B . . .               . . . .                 . . .
                                    B . . .                 B . .

C25         C26         C27         C28         C29         C30
. A .       . A . B B   . A . B     . A . B     . A B       . A B
. . A       . . . A .   . . . A     . . . A     . . .       . . .
. . .                   B . . .     . . . .     . A B       . A .
. B .                               . . . .                 . B .
B . .                               B . . .

C31         C32         C33         C34         C35         C36
. A . . B   . A . . B   . A . . B   . A . .     . A .       . A
. . . B .   . . . . .   . . . . .   . . . B     . . .       . .
. A . . .   . A B . .   . A . . .   . A . .     . A B       . A
                        . B . . .   . . . .     . . .       . B
                                    B . . .     B . .       B .
```

### 4.3 Corner configurations for grids with R·C odd (D)

Grids with both sides odd need three endpoints of one checkerboard color and one of the other, so the configurations in 4.2 cannot occur there, and a different set can. These three were found by the complete 11 × 11 coverage check (section 5): they were the only infeasible 11 × 11 configurations that no other entry rejects. Each was verified infeasible by the exact solver on 11 × 11 and again on 13 × 13. **Apply only on grids with both sides at least 10 and R·C odd.** They are tested in `zzn_patterns.js` with the same code as 4.2 and reported under the same identifier, `C4 corner configuration`.

```
D1         D2              D3
A A .      A . B . .       A . B .
. B .      . . . B A       . . . B
B . .                      . . . A
```

## 5. Validation

"Exact" means the plug-DP solver, which decides feasibility exhaustively. Counts are up to symmetry, after parity and T1/T2.

| Grid | Checked | Feasible rejected | Infeasible caught |
|---|---|---|---|
| 10 × 10 | all 561,538 | 0 | 1,803 of 1,803 |
| 10 × 11 | all 1,649,374: 4,197 rejections solved exactly, and every other configuration proved feasible | 0 | all |
| 11 × 11 | all 807,180: 318 rejections solved exactly, and every other configuration proved feasible | 0 | all (3 by construction: D1–D3) |
| 12 × 12 | all 2,446,945 screened; the 895 rejections by R, B and C solved exactly | 0 | not measured |

Notes:

- On 10 × 10 the complete catch is partly by construction: C19–C36 and L6 were added from the 10 × 10 data.
- On 12 × 12 the other 2,510 rejections came from proved entries (L1, L2, L3, E1, L6) and were not re-solved.
- "Every other configuration proved feasible" means each configuration the catalogue passes was shown feasible, either by a rectangle decomposition checked with the Itai–Papadimitriou–Szwarcfiter conditions, by exactly solving a smaller grid obtained by deleting endpoint-free boundary strips, or by exactly solving the full grid (`coverage_shard.py` in the coverage package).
- On 11 × 11 that check found three infeasible configurations the catalogue missed; they became D1–D3, so the complete catch on 11 × 11 is by construction.
- Coverage on 12 × 12 is being run.
- The four grids above represent the three parity classes (even × even, even × odd, odd × odd). Other shapes in scope, such as 11 × 12, 13 × 13 or long thin rectangles like 10 × 30, have not been screened.
- The C entries are applied on every in-scope grid with R·C even. They were solved exactly on 10 × 10 and 12 × 12, and every C rejection on 10 × 11 was confirmed infeasible, but they have no proof.

## 6. Using `zzn_patterns.js`

```
node zzn_patterns.js 12 12 1 2 2 10 1 9 2 1      # R C s0r s0c t0r t0c s1r s1c t1r t1c
node zzn_patterns.js < instances.txt             # one instance per line
```

Each line of output is `FORBIDDEN <entry> @ <where>` or `NONE`. From JavaScript:

```js
const { findForbiddenPattern } = require('./zzn_patterns.js');
findForbiddenPattern(12, 12, [1, 2], [2, 10], [1, 9], [2, 1]);
// -> { id: 'R effective alternation', where: 'boundary after rewrites' }
```

Entries are tried in the order P, T1, T2, L1, L6, then at each corner L2–L5, E1, B, C (or D on grids with R·C odd), and finally R.
