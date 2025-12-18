Rectilinear Partition Hamiltonian Path
===

This is highly speculative and I have no idea whether this will work out.
This is a free form document as a place for my notes.

An idea given to me by GPT 5.
Try to modify the dynamic programming solution of the rectangular partition of
rectilinear polygons to find Hamiltonian paths and cycles.

To start, lets try it on the Hamiltonian Cycle problem.

Glossary
---

| | |
|---|---|
| $\rho(u)$ | parity of cell $u$ |
| $R(n,m)$ | rectangle of dimensions $n \times m$ |
| $C(R(n,m),s,t)$ | color compatibility of rectangle $R(n,m)$ with endpoints $s$ and $t$ |
| $A(R(n,m),s,t)$ | rectangle $R(n,m)$ with endpoints $s$ and $t$ is acceptable |
| $\sigma(R)$ | position of lower left coordinate of rectangle $R$ |
| $\mu(R)$ | majority color of $R$ or lower left color if color count equal |
| MIRPRP | minimum ink rectangular partition of rectilinear polygons |

Hamiltonian Cycles on Solid Grid Graphs
---

The boundary of solid grid graph can be thought of as a rectilinear polygon.

The idea is to allow for 1-cut and 2-cuts, where there are docking points
on the constructed line cut interface that allow the partitioned regions to join
up.

If we call $N$ the number of nodes in the solid grid graph, then the boundary is
$O(N)$.
Allowing for 2-cuts gives us $O(N^2)$ choices of cuts, with two docking points along
the interface for a total of $O(N^4)$.

That is, assuming this tactic works at all, the number of nodes in the DAG is roughly
$O(N^4)$.
The number of bower points is $O(N)$, so this might inflate the run-time to $O(N^5)$.

If the partitioned area is a simple rectangle, than the admissible test for an s-t Hamiltonian
path can be done.

As a reminder, for rectangle $R = R(n,m)$ with endpoints $s,t$, an *acceptable* configuration, $A(R _ {n,m} ,s,t)$ is when:

* $C(R _ {n,m}, s,t)$ (*color compatible*)
  - $\rho(s) \ne \rho(t)$ when  $n \cdot m \equiv 0 \bmod 2$
  - $\rho(s) = \rho(t) = \mu(R _ {n,m})$ when $n \cdot m \equiv 1 \bmod 2$
* $s = \sigma(R _ {1,m} ), t = \sigma(R _ {1,m}) + (0,m-1)$ (*1-line constrained*)
  - and all other symmetric cases
* $s _ x \ne t _ x$ when $R _ {2,m}$ (*2-layer constrained*)
  - and color compatible
  - and all other symmetric cases
* $\rho(s) \ne \mu(R _ {3,2k}) \text{ and either } \left( (s _ x \ge t _ x) \text{ or } ( t _ y \text{ and } s _ x + 1 \ge t _ x ) \right)$ (*3-stack constrained*)
  - and color compatible
  - and all other symmetric cases

The above is in the positive but [IPS][IPS] uses negation tests to filter.

A rough draft of an algorithm:

* For the first cut, choose all possible valid 1-cut and 2-cuts, along with all possible
  color compatible docking points along the cut interface
* For each configuration:
  - if the configuration is a simple rectangle, test $A(R _ {n,m},s,t)$ and return
  - otherwise, choose a bower point for the quarry rectangle
  - the quarry rectangle must contain exactly one dock point
  - as in MIRPRP, choose a valid cleave cut from the quarry rectangle, and enumerate
    a sibling docking point compatible with the configuration
  - recur

So the DP index is border point $b _ 0$, border point $b _ 1$, adit point $a$, docking point $d _ 0$ and docking point $d _ 1$.
The DAG degree is unbounded but the nodes are bounded by $O(N^4)$.

Roadmap
---

###### 2025-12-18

I'm going to walk away from this for a bit but I wanted to give a rough roadmap when I'm ready to pick this up again.

* It's probably best to work on a dual graph
* The same basic idea for the minimum ink rectangular partition of rectilinear polygons (MIRPRP) but here the
  grid points (on the dual) will be every integer location rather than on the grid lines implied by the reflex vertices
  - I think a lot of the algorithms will have to be rewritten/modified from mirprp but it's going to be faster the second
    time through and I can re-use code
* There are two basic objects, rectangles and the cut regions
  - rectangles can be base rectangles or quarry rectangles and have box bounds (lower left point, upper right point) along with two docking
    points, where each docking point is on the boundary, specified by a base grid position and an `idir` in the direction
    it connects to
    + docking points must be distinct unless the quarry rectangle is a degenerate 1x1, in which case the two docking points
      are the same
    + docking points must acceptable (color compatible and pass 1-line constraint, 2-layer constraint and 3-stack constraints)
  - the cut region is specified by two boundary points, an adit point and two docking points where, as above, the docking
    points are on the constructed line boundary, are specified by base grid position and an `idir` where the connect across the
    cut
    + by supposition, the cut region is not a simple rectangle so the only constraint is that the docking points are color compatible
      with the region, are position distinct and are on the constructed cut line
    + maybe we just don't ant to deal with the degenerate (initial) condition where the boundary points are the same
* Suppose an initial cut is chosen and we have region $R _ 0$ and region $R _ 1$
  - $R _ 0$ enumerates all docking points on the boundary, and, for each docking point choice,  enumerates all quarry rectangles
    + for a particular quarry rectangle, it's chosen to contain exactly one docking point, and enumerates the other choice of its
      docking point, making sure it's acceptable and on a dockable edge
    + choose cleave cuts from the quarry rectangle, enumerating admissible docking points for each region considered
  - do the same for $R _ 1$
  - try to find a valid matching of docking points to connect $R _ 0$ and $R _ 1$
    + if no such match exists, no Hamiltonian cycle possible

There's a lot of enumeration of rectangles, regions and their docking points but the number of nodes in the DAG are polynomially bounded.
The total number of rectangles are bounded by `(#grid points) x (#grid points) x (#perimeter)`, so $O(N^3)$.
The total number of regions are bounded by `(#boundary) x (#boundary) x (#adit (~#grid points)) x (#perimeter) x (#perimeter)`, so $O(N^5)$.

We have to be careful about what $N$ we mean but here $N$, is the number of base grid points.
In practice, the number of regions will be much less as the boundary will most likely be $O(\sqrt N)$, the number of adit points will most likely
be constant (2) and the cut line perimeter will most likely be $O(\sqrt N)$, giving around $O(N^2)$.
The number of rectangles will also probably be less than the worst case as the perimeter is, again, most likely $O(\sqrt N)$ and there won't be a
lot of choices that only include exactly one docking point from the parent region (so maybe $O(N ^ {\frac{3}{2})$ ?).

Some test cases to consider:

* all simple differentiating rectangles as spot checks
* `z`, cross, `u` shapes
* stair cases and zig zag stair cases

If there's a SGG RPRP decomposition, this implies a Hamiltonian cycle but the other direction is not clear at all to me.
I'm not completely sure, but I strongly suspect that there are SGG Hamiltonian cycles that can't be represented by an SGG RPRP decomposition.
This is a little worrying but might not be a deal breaker as there might be a large space of possible SGG HC.
If it's true that a SGG HC implies a SGG RPRP decomposition, then there might be a way to MCMC your way to the whole ensemble.


The stair case model is the main one that worries me.
If the stair case is wide, then the path can look like a "stream" flowing in the direction of the zig-zag border.
This means any partition that cleaves through that stream will have a number of docking points proportional to the
stream width.



References
---

* [IPS]: ["Hamiltonian Paths in Grid Graphs" by Itai, Alon and Papadimitriou, Christos H. and Szwarcfiter, Jayme Luiz](https://epubs.siam.org/doi/10.1137/0211056)
* ["Problem Specification" by whatsacomputertho](https://github.com/whatsacomputertho/grid-solver/blob/main/doc/problem-specification.md)
* ["Hamiltonian cycles in solid grid graphs" by Umans, C. and Lenhart, W.](https://ieeexplore.ieee.org/document/646138)
* ["An Algorithm for Finding Hamiltonian Cycles in Grid Graphs Without Holes" by Umans, C.](https://users.cms.caltech.edu/~umans/papers/uthesis.ps)
