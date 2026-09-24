# Detecting infeasibility in two-color Zig-Zag Numberlink on rectangles

## 1. The problem

An instance is an R × C grid of cells and four distinct endpoint cells: **s0, t0** (color 0) and **s1, t1** (color 1). A solution is a pair of vertex-disjoint paths, s0 → t0 and s1 → t1, moving between edge-adjacent cells, that together visit **every** cell.

This document describes a test that decides, in polynomial time, when an instance has *no* solution. The test proves infeasibility: every rejection comes with a chain of valid deductions. It is also complete on every instance checked so far: on all 561,538 configurations of the 10 × 10 grid it rejects exactly the infeasible ones.

Throughout, **A** marks the two endpoints of one color and **B** the two endpoints of the other. Coordinates are (row, column) with (0, 0) in the top-left corner.

## 2. Overview

The test runs five stages. Each either finds a contradiction, which proves the instance infeasible, or passes the instance on to the next stage.

```
 instance
    |
    v
 [1] parity ...................... counting argument on the checkerboard
    |
    v
 [2] topology (raw) .............. endpoints alternate around a face?
    |
    v
 [3] propagation + end-state ..... forced moves to a fixed point, then
    |                              topology on what remains
    v
 [4] probing ..................... each undecided edge tried both ways
    |
    v
 [5] corner split ................ case split at the corners (widgets)
    |
    v
 no contradiction found
```

Stages 1 and 2 look only at where the endpoints are. Stages 3–5 reason about which edges the paths must or cannot use.

## 3. Stage 1: parity

Color the grid like a checkerboard: cell (r, c) is **black** if r + c is even and **white** otherwise. A path alternates colors, so a path whose two ends are both black has exactly one more black cell than white. A path with both ends white has one more white. A path with one end of each color has equal numbers.

Write the signed color of a cell as +1 for black and −1 for white. Then a path from u to v contains exactly (sign(u) + sign(v)) / 2 more black cells than white. The two paths cover the grid, so their counts add up to the grid's own imbalance:

```
 2 · (#black − #white in the grid)  =  sign(s0) + sign(t0) + sign(s1) + sign(t1)
```

The grid's imbalance is 0 when R · C is even and +1 when it is odd, since the corner (0, 0) is black. Any instance violating this equation is infeasible.

Parity also decides which local patterns can occur at all. On a grid with both sides odd, every corner is black and exactly three of the four endpoints must be black. So any pattern that places two white endpoints near a corner never appears on such a grid.

## 4. Stage 2: topological compatibility

The grid graph is planar. If four vertices lie on the boundary of one face in the cyclic order s0, s1, t0, t1, then there are no vertex-disjoint paths s0–t0 and s1–t1. Each path would have to cross the other.

Two kinds of face matter at this stage.

**The outer face.** All four endpoints are on the perimeter and the colors alternate going around it:

```
 A . . . . B          going clockwise from the top-left:
 . . . . . .            A (0,0), B (0,5), A (3,5), B (3,0)
 . . . . . .          colors alternate: infeasible
 B . . . . A
```

**A unit-square face.** The four endpoints fill a 2 × 2 block, with each color on a diagonal:

```
 . . . .
 . A B .          the four cells surround one grid point,
 . B A .          in the order A, B, A, B: infeasible at any grid size
 . . . .
```

Stage 3 applies the same test again, after forced moves have changed which cells lie on which face. That repeated test is where most of the method's power comes from.

## 5. Stage 3: colored constraint propagation and the end-state check

### 5.1 State

Every grid edge is **in**, **out**, or **undecided**. Every cell has a color domain, a subset of {0, 1}: an endpoint's domain is its own color, and every other cell starts with both. A cell needs degree exactly 1 if it is an endpoint and 2 otherwise.

### 5.2 Rules

The following rules are applied repeatedly until nothing changes. Each is a deduction that every solution satisfies, so a contradiction proves infeasibility.

1. **Degree.** A cell cannot have more in-edges than it needs. It cannot have fewer non-out edges than it needs. If its undecided edges are exactly enough to reach its degree, they are all in. If it has reached its degree, its remaining edges are out.
2. **Edge color.** An edge whose two cells have no color in common is out.
3. **Color support.** A cell keeps color c only if it has at least as many non-out edges to cells that could be c as its degree requires.
4. **Chains.** Cells joined by in-edges share one domain: the intersection of their domains. An in-edge that closes a cycle is a contradiction, as is a chain holding endpoints of both colors.
5. **Completed paths.** If a chain joins s_c and t_c, then path c is finished, and no cell outside that chain can have color c.
6. **Choice rule.** For each cell, enumerate the ways to choose its remaining edges. A choice is impossible if it would close a cycle, join the two colors, or finish path c while some cell outside is forced to color c (a *premature completion*). An edge used by every possible choice is in. An edge used by none is out.
7. **Counting.** Suppose two cells each need exactly one more edge, and both can only choose from the same two cells a and b, each of which can accept only one more edge. Then a and b are used up by those two cells, and all other undecided edges of a and b are out.

**Example.** An 11 × 11 grid with s0 = (0,0), t0 = (0,1), s1 = (1,1), t1 = (2,0):

```
 A A . .      Cell (1,0) touches only s0 (A), s1 (B) and t1 (B).
 . B . .      Rule 3: it has only one possible color-0 neighbor, so it is color 1.
 B . . .      Rule 2: its edge to s0 is out, so s0 must go straight to t0,
 . . . .      which finishes path 0 after two cells.
              Rule 5: every other cell is color 1.
              Rule 1: (1,0) must join s1 and t1, which finishes path 1 after
              three cells. The remaining cells now have empty domains.
```

### 5.3 The end-state check

Once propagation has reached its fixed point, the decided edges change the geometry. Stage 3 then removes the settled parts and runs the topological test again, on every face of what remains.

**Contracting chains.** Follow the in-edges out from each endpoint. Every cell on that chain has its degree fixed and is removed. The cell where the chain stops becomes that color's *effective endpoint*.

**Example.** A 12 × 12 grid with s0 = (0,0), t0 = (0,10), s1 = (1,0), t1 = (1,10). Raw topology passes, since only three endpoints are on the perimeter. Propagation forces the corner cell (0,11) to join t0 and (1,11). Then (1,11) is color 0, so its edge to t1 is out, and it must continue down to (2,11). After contraction:

```
 A . . . . . . . . . # #       # : removed (fixed by forced moves)
 B . . . . . . . . . B #       a : effective end of path A
 . . . . . . . . . . . a
 . . . . . . . . . . . .       new outer boundary, clockwise from (0,0):
                                 A (0,0), B (1,10), a (2,11), B (1,0)
                               colors alternate: infeasible
```

t1 was not on the perimeter, but once t0's chain is removed it lies on the new outer boundary.

**Contracting blobs.** Sometimes both endpoints of a color sit in a small group of cells whose only connections to the outside are decided, even though the edges inside the group are not. If exactly two in-edges leave the group, that path passes out of the group once and back in once. So outside the group it is a single path between the two exits, and the group is removed.

**Example.** s0 = (0,0) and t0 = (1,1) sit diagonally in a corner. Propagation forces (0,1) → (0,2) and (1,0) → (2,0), and the counting rule shows t0 cannot use (1,2). The group {s0, (0,1), (1,0), t0} is contracted to its two exits.

**Forced segments as obligations.** Propagation can force a run of cells that belongs to neither endpoint's chain, a middle stretch of some path whose color may still be unknown. Its interior is removed and its two ends are kept. Every solution must then connect, with vertex-disjoint paths, s_c → (segment) → t_c for whichever color c owns it. The test enumerates:

- which color owns each segment;
- the order in which that color's path visits its segments;
- which direction it traverses each one.

If every assignment has two required connections interleaving on some face, the instance is infeasible. Enumeration is limited to at most four segments.

**Example.** On a 5 × 7 grid with s0 = (0,0), t0 = (1,3), s1 = (1,4), t1 = (4,0), stages 3–4 force the segment `=` below, but cannot tell its color:

```
 A . a = = = =       a, b : open ends of the forced segment
 . . . A B . b
 . . . . . . .       new outer boundary (interior of the segment removed):
 . . . . . . .         A (0,0), a, A (1,3), B (1,4), b, B (4,0)
 B . . . . . .
```

| Segment's color | Required disjoint connections | Crossing |
|---|---|---|
| A, entered at a | A–a, b–A, B–B | b–A crosses B–B |
| A, entered at b | A–b, a–A, B–B | A–b crosses B–B |
| B, entered at a | B–a, b–B, A–A | B–a crosses A–A |
| B, entered at b | B–b, a–B, A–A | a–B crosses A–A |

All four assignments cross, so the instance is infeasible.

## 6. Stage 4: probing

Propagation only draws conclusions that follow without a case split. Probing adds one level of case analysis. For every undecided edge, set it **in** and run stage 3. If that leads to a contradiction, the edge must be **out**: record that and propagate. Then do the same with the edge set **out**. Repeat until no probe forces anything.

In the 5 × 7 example above, probing is what forces the segment. Setting (0,3)–(0,4) out contradicts immediately. Setting (0,3)–t0 in, or (0,4)–s1 in, puts the other color's endpoint on the new boundary in alternating order. The remaining edges of the segment then follow by degree.

## 7. Stage 5: the corner split (widget deduction)

### 7.1 Widgets

A *widget* is a pair of endpoints of different colors at (1,2) and (2,1), relative to a corner. On its own, a widget is harmless: some solution always exists. It still forces something.

- The corner cell (0,0) must connect (0,1) and (1,0).
- Cell (1,1) cannot take both (0,1) and (1,0), since that closes a loop. It cannot take both widget endpoints, since that joins the colors.
- So exactly one widget endpoint claims the corner. Of the four ways (1,1) could do that, propagation kills two, and two fillings remain:

```
 X at (1,2), Y at (2,1)

 X claims the corner            Y claims the corner
 x x x x → (top edge)           y y x x → (top edge)
 x x X .                        y y X .
 y Y . .                        y Y . .
 y . . .                        y . . .
 ↓ (left edge)                  ↓ (left edge)
```

In **both** fillings, color X runs along the top edge next to the corner and color Y runs along the left edge. So the widget behaves like two endpoints pinned to the boundary, in a fixed order.

Neither filling alone contradicts anything, so single-edge probing cannot see this. But two widgets at adjacent corners are infeasible together. On 12 × 12 with s0 = (1,2), t0 = (2,10), s1 = (1,9), t1 = (2,1), reading clockwise from the left edge, the boundary carries 1, 0 (top-left widget), then 1, 0 (top-right widget), which alternates.

### 7.2 The rule

For each corner that has an endpoint in its 3 × 3 window, enumerate the choices for the edges of the diagonal cell (1,1). Run stage 3 on each and keep the survivors. If no choice survives, the instance is infeasible. If several corners each have more than one survivor, try every combination of survivors across those corners. If no combination survives stage 3, the instance is infeasible.

This is an exhaustive case split, so it is sound. It costs at most a few hundred runs of stage 3.

## 8. Patterns found along the way

The method grew out of cataloguing small infeasible configurations. Each pattern below is caught by the general stages, and none needs a special rule.

**The corner-blocking pair** (strongly forbidden, at any grid size). The corner cell's only two neighbors are different colors, so it cannot be covered:

```
 . A        caught by stage 3 (rule 3: the corner cell has no color left)
 B .
```

**Enclosures.** An endpoint beside a corner forces its path through the corner and along the other edge. When the other endpoint of the same color is further along the first edge, that path closes a loop around the corner region. The loop traps whatever lies inside it:

```
 . A . A . .       path A: (0,1) → corner → down the left edge → ... → back to (0,3)
 . B . . . .       B is inside the loop, so B's partner must be inside too.
 . . . . . .       If it is on the far perimeter: infeasible
```

This is caught by stage 3: forced chain from the corner, then the new-boundary check. The far A may be anywhere along the edge, so these are families of patterns, not a finite list.

**Edge closure** (four endpoints, on any edge, at any grid size):

```
 . . A . . B . .     cell (0,3) lies between the two A's, cell (0,4) between the two B's.
 . . . A B . . .     The edge between them would join the colors, so it is out.
                     Each path then closes after three cells, leaving the grid uncovered.
```

Caught by stage 3 (rules 2 and 1).

**Widgets**, as in section 7.

## 9. Validation

"Exact" below means the plug-DP solver, which decides feasibility exhaustively.

**Soundness: does the test ever reject a feasible instance?**

| Check | Configurations | Feasible ones rejected |
|---|---|---|
| Exhaustive, 4×4, 4×6, 5×5, 5×7, 6×6, 7×7 (C implementation) | all | 0 |
| Exhaustive, 6×6 (JavaScript implementation) | 8,719 | 0 |
| Random feasible 10×10 (C implementation) | 12,500 | 0 |
| Random feasible 10×10 (JavaScript implementation) | 1,500 | 0 |

**Completeness: does the test catch every infeasible instance?**

| Grid | Configurations | Infeasible | Missed by the test |
|---|---|---|---|
| 10×10, complete enumeration | 561,538 | 1,803 | 0 |
| 6×6, complete enumeration | 8,719 | 347 | 0 |
| 7×7, complete enumeration (stages 1–4) | all | — | 0 |
| 5×7, complete enumeration (stages 1–4) | all | — | 2 |

The 10×10 and 6×6 counts are up to symmetry, after the raw topological check. On 10 × 10, stages 1–4 caught 1,802 of the 1,803 infeasible configurations; the last was a two-widget configuration, caught in the JavaScript implementation by the corner split. The two 5 × 7 misses occur in a grid only five rows tall, where the plug DP is the right tool anyway. The corner split was not run on 5 × 7.

## 10. Cost

Let N = R · C.

- **Stages 1–2** take constant time.
- **Stage 3.** One pass of propagation is O(N), since each cell has at most four edges and at most six edge choices. Every pass that doesn't stop decides at least one edge or narrows at least one domain, so there are O(N) passes: O(N²) to reach the fixed point. The end-state check walks every face in O(N) and tries at most a constant number of segment assignments.
- **Stage 4** reruns stage 3 at most twice per edge per round, over O(N) rounds: O(N⁴) in the worst case. In practice a handful of rounds suffice.
- **Stage 5** is a constant number of stage-3 runs.

The whole test is polynomial.

## 11. Limitations and open questions

- **A pass is not a proof of feasibility.** The claim that "no contradiction" implies a solution exists is the conjecture this work set out to support. It has been checked exhaustively only on grids up to 10 × 10, and it fails on some thin grids (5 × 7). 11 × 11 and 12 × 12 have not been enumerated; they need many CPU-hours of exact solving.
- **Depth of reasoning.** Probing is one level deep, the corner split branches only on each corner's diagonal cell, and segment assignments are capped at four segments. Instances needing deeper case analysis may exist on larger grids.
- **Special-purpose rules are unnecessary and risky.** During exploration, finite rules derived from catalogued patterns turned out to be redundant with stages 3–5, and three of them rejected feasible 10 × 10 configurations. They had been derived with the other endpoints far away, and failed when an endpoint sat on the corner cell or close to the pattern. The general stages avoid this, because every step is a deduction about the actual instance.
- **Finding the paths.** Constructing a solution, when one exists, is a separate problem, handled here by the plug DP with path reconstruction.

## 12. The JavaScript implementation

`zzn_infeasible.js` exports `checkInfeasible(R, C, s0, t0, s1, t1)`, where each endpoint is `[row, col]`. It returns:

- `{ infeasible: true, reason }`, where `reason` is one of `parity`, `topology`, `propagation`, `probing`, `corner split`;
- `{ infeasible: false, reason: null }` if no contradiction was found.

Stage 3 runs inside `propagation`, including its end-state check.

From the command line:

```
node zzn_infeasible.js 12 12 1 2 2 10 1 9 2 1     # one instance
node zzn_infeasible.js < instances.txt            # one "R C s0r s0c t0r t0c s1r s1c t1r t1c" per line
```

Each line of output is `INFEASIBLE <reason>` or `NO-CONTRADICTION`.
