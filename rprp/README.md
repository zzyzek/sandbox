Rectangular Partitions of Rectilinear Polygons
===

I'm still trying to make sense of this but I think I might have a basic undrestanding now.

Consider a rectilinear polygon, $C = (c _ 0, c _ 1, c _ 2, \dots, c _ {n-1}), c _ k \in \mathbb{Z}^2$.


Call the induced *grid* as all intersecting points within the polygon from colinear boundary edges extended.



That is:

$$
X = \{ x(c _ 0), x(c _ 1), \dots , x(c _ {n-1}) \} \\
Y = \{ y(c _ 0), y(c _ 1), \dots , y(c _ {n-1}) \} \\
G = \{ (x,y) | \forall x,y, x \in X, y \in Y, (x,y) \in \{ \mathsf{interior}(C) \cup \partial(C) \} \}
$$

Where $\mathsf{interior}(C)$ is the interior region of $C$ and $\partial(C)$ is the boundary.

We further label grid points, $p \in G$, as *interior*, *edge*, *indent corner*, *elbow corner* if
point $p$ is completely inside $C$, if it's on the edge of $C$ (only), if it's a reflex/concave edge of $C$ or
if it's a convex edge of $C$, respectively.
Here, "convex" and "concave" are relative to the interior.

A *line segment in/of $G$* is defined by two axis aligned endpoints in $G$.
A *maximal line segment in/of $G$* is a line segment such that has at least one endpoint in $C$, meaning
it has at least one endpoint that is a vertex defined in $C$.

---

From Lemma 5.1 of [Du,Ko,Hu]:

> There exists an optimal rectangular partition of $C$ in which each maximal line segment contains a vertex in $C$.

The proof is relatively straight forward and relies on two facts:

* If an interior line segment (of $G$) weren't maximal, it must have equal number of lines on one side as
  the other, otherwise we could nudge it towards one side and reduce objective function
* If an interior line segment weren't maximal and has equal incident lines on either side, then
  we can nudge it in either direction until it hits another line, reducing objective function

Both of these conditions show that interior (aka non-maximal) line segments can't be optimal.

Since every line is maximal, we have the Lemma.

---

There are only $O(n^2)$ maximal line segments.
Pairs of each of these maximal line segments can be chosen to split the original polygon in two.
A complete split of the polygon means that the two parts of the outer boundary, on a potential subset of $C$,
are contiguous.

By a judicious ordering of partitions, it's possible to build up optimal solutions to sub partitions,
referenced by their boundary and cutting line segments (potentially not maximal?).
Calculation of sub problems and then re-using those calculations to build answers to optimal partitions
of larger sub-polygons allows for a dynamic programming approach, and thus a polynomial time solution.



References
---

* ["Rec, path);tangular Partitions of a Rectilinear Polygon" by Kim, Lee, Ahn](https://arxiv.org/pdf/2111.01970)
* ["Minimum Edge Length Partitioning of Rectilinear Polygons" by Lingas, Pinter, Rivest, Shamir](https://people.csail.mit.edu/rivest/pubs/LPRS82.pdf)
* ["Design and Analysis of Approxmiation Algorithms" by Du, Ko, Hu](https://link.springer.com/book/10.1007/978-1-4614-1701-9)
