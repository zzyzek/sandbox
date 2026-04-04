2D Convex Hull Algorithm from Half Planes by Zhu
===

We are given a list of half planes, $H = (H _ 0, H _ 1, \dots, H _ {n-1})$ in 2D,
defined by a point on the half plane (line), $p$, and a vector $v$:

$$
H _ k = p _ k + t v _ k
$$

We would like to find the vertices of the convex hull defined by the intersection of half planes.

Suppose we knew, a priori, the convex hull was bounded by a square defined by four half plane intersections,
$S = (S _ 0, S _ 1, S _ 2, S _ 3)$.
Create an initial guess at the convex hull by the square and then proceed
update this list by intersecting it with each of the $H _ k$.

Naively, this would require $O(n^2)$ comparisons, as we would need to compare each $H _ k$ to our
current list, as each intersection will, at most, introduce an additional line to our convex hull.

Instead, we sort the half planes, $H \cup S$, by the angle defined by $v _ k$ and update the intersections
as appropriate.
Note that either the half plane intersects the last half plane in the current list or it completely obscures it,
allowing us to remove the last half plane:

![Zhu half plane options for adding to list](img/zhu_ch_order.svg)


Each line will only ever be added at most once to our list and removed at most once from our list, providing
us with a linear time processing.
Total run-time is $O(n \log n)$ because of the initial angle sort but this might be improved if a bucket
sort on angle is used.

---

Online Version
---

*Warning, speculative*

Here is the idea for an online version of the algorithm:

* Instead of sorting initially, keep halfplanes in a self balancing tree (e.g. AVL)
  whose key is angle
* Start off with large square (four halfplanes)
* When considering new halfplane:
  - find neighboring two halfplanes (by angle, wrapping around if necessary)
  - walk in each direction removing half planes as necessary
  - you'll be left with a half plane and two neighboring half planes whose angles are greater/less than respectively
  - see if the halfplane is under the lt,gt neighbor intersection point, if so, discard halfplane
  - otherwise add it
* At any point you can walk the tree and find neighboring intersection points to find the convex hull
  point representation

I'm still a little fuzzy on correctness and run-time but I think there's the same guarantee as the offline
version in that each half plane is only ever inserted or removed at most once.
If I'm not completely wrong, the run-time should now be $O( n \log n )$, inheriting the run-time from insert/delete
into the AVL tree.

Notes on my implementation:

* I twisted the four half planes at "infinity" to try and overcome some pathologies of parallel lines
  - I may need to take care of parallel lines more intentionally
* I had to do a final pass to discard nearly identical convex hull points
  - I suspect this is an artifact of using twisted half planes at infinity, but I need to confirm


References
---

* [Half-plane intersections - S&I Algorithm in O(N log N)](https://cp-algorithms.com/geometry/halfplane-intersection.html)
* [New algorithm for Half-plane Intersection and its Practical Value" by Zeyuan Zhu](http://zeyuan.allen-zhu.com/paper/2006-thesis.pdf)


