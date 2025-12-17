Rectilinear Partition Hamiltiona Path
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





References
---

* [IPS]: ["Hamiltonian Paths in Grid Graphs" by Itai, Alon and Papadimitriou, Christos H. and Szwarcfiter, Jayme Luiz](https://epubs.siam.org/doi/10.1137/0211056)
* ["Problem Specification" by whatsacomputertho](https://github.com/whatsacomputertho/grid-solver/blob/main/doc/problem-specification.md)
* ["Hamiltonian cycles in solid grid graphs" by Umans, C. and Lenhart, W.](https://ieeexplore.ieee.org/document/646138)
* ["An Algorithm for Finding Hamiltonian Cycles in Grid Graphs Without Holes" by Umans, C.](https://users.cms.caltech.edu/~umans/papers/uthesis.ps)
