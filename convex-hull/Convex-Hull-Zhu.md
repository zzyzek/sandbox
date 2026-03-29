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



References
---

* [Half-plane intersections - S&I Algorithm in O(N log N)](https://cp-algorithms.com/geometry/halfplane-intersection.html)
* [New algorithm for Half-plane Intersection and its Practical Value" by Zeyuan Zhu](http://zeyuan.allen-zhu.com/paper/2006-thesis.pdf)


