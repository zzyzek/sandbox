Miscellaneous Notes on Rectilinear Partitions
===

Rectilinear (2D) partitions into rectangles
has many flavors, depending on what you're trying to minimize.


Minimizing *Number* of Rectangles
---

(see [here](https://www.sciencedirect.com/science/article/abs/pii/0734189X84901397))

Given a 2D hole-free rectilinear polygon (connected, simply connected) (SCRP), find the *minimum*
number of rectangles that partition it.

We don't care about the area, shape or edge ("ink") length, all we care about is the
number of rectangles.

* Boundary $B$
* Vertices are *concave* if they're on the boundary and form a $3 \pi / 2$ angle relative to the interior
  - Call $N$ number of concave vertices
* Vertices that are concave share the same $x$ or $y$ coordinate are called *cohorizontal* and *covertical*,
  respectively, and *cogrid* if they're either.
* A *chord* is line between two concave vertices

---

If a rectilinear polygon (RP) doesn't have any cogrid vertices, the following will partition the RP into $N+1$
rectangles:

* Extend a line from one of the concave vertices until it either:
  - reaches the RP edge/boundary
  - hits another extension line from another concave vertex

If the line hits a boundary, this effectively removes the vertex from consideration and splits the RP into
two new RPs.

If the line hits another line extension, this effectively removes two vertices, adds one concave vertex
in one region and a convex vertex in the other region.
This adds two regions, only one of which has a concave vertex, effectively reducing two concave vertices,
adding one and creating two new regions (with one region, only, having the concave vertex).

---

Consider $C = (c _ 0, c _ 1, \dots, c _ {L-1})$ of non-intersecting chords connecting the boundary of $B$
with a chord, $d$, that shares no endpoints with $C$.
Let $w$ be the number of intersections of $d$ with $C$, then $C$ and $d$ partition $B$ into $s = L + w + 2$ regions.

In general:

$$
s = L + w + 2 - |\text{\\# shared endpoints for } d \text{ and } C|
$$

---


Given a SCRP, the minimum rectangular partition is of size $N - L + 1$, where $N$ is the number of concave
vertices on $B$ and $L$ is the maximum number of non-intersecting chords that can be drawn
between cogrid concave vertices.

