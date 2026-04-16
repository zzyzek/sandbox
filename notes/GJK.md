Gilbert–Johnson–Keerthi algorithm
===

The Gilbert Johnson Keerthi (GJK) algorithm tests for convex set
intersection.
Depending on the input format of the convex sets, the test can be done
in constant time.

The idea is to determine if the origin point is in the Minkowski difference
of the two sets, telling us that the two sets intersect iff so.

Consider convex hull $P$ and convex hull $Q$.
We'll simplify the discussion and consider only half plane intersections
in $\mathbb{R}^3$ where $P,Q$ can also be given by their vertices, when
necessary.

Define the *support* of a convex hull, $H$,  and directional vector $d, $S(H,d)$,
to be the furthest point on hull $H$ in direction $d$.
One way to see this is to sweep a plane perpendicular to $d$ in the $d$ direction,
recording the maximum point the plane intersects with $H$.
Alternatively, take a plane from infinity in direction $-d$ and record where it
first hits the hull $H$.

For our hulls, $P,Q$, we can test each vertex on the hull by considering the
dot product of $p _ j \cdot d$.
That is, $S(H,d) = \text{arg}\max _ {h _ j} h _ j \cdot d$.
Note that convex hulls $P,Q$ sit in world coordinates, so $p _ j$ and $q _ j$
are relative to the origin.

Now consider four directional vectors, $D = (d _ 0, d _ 1, d _ 2, d _ 3)$, and
$-D = (-d _ 0, -d _ 1, -d _ 2, -d _ 3)$ and their corresponding support points
$S(P, D) = (s _ 0, s _ 1, s _ 2, s _ 3)$ and $S(Q, -D) = (t _ 0, t _ 1, t _ 2, t _ 3)$.

These four points in $P$ and the corresponding four points in $Q$ define a simplex
in the interior of $P$ and $Q$ respectively.
If the simplex $S(P,D)$ overlap with $S(-Q,-D)$, then the origin will be included
in the Minkowski difference.

We can calculate the simplex of the Minkowski difference easily by
subtracting $S(P,D) - S(Q,-D) = (s _ 0 - t _ 0, s _ 1 - t _ 1, s _ 2 - t _ 2, s _ 3 - t _ 3)$
and then testing to see if the origin is in the resulting simplex.

If we find evidence that the origin is not within the Minkowski difference of $P,Q$,
then we can stop early.

The GJK algorithm proceeds by picking points until a simplex is fully defined
and continually testing the origin point in the Minkowski difference.

I haven't given stopping conditions, when we know the origin is outside of the Minkowski
difference, nor have I given the algorithm to build the simplex.
Before I do, I'll note that if $P,Q$ are ill-conditioned, the GJK algorithm can loop
forever, trying to continually build the simplex without finding evidence that
the origin is outside of the Minkowski difference.

As I understand it, the basic algorithm is:

* Initialize our simplex vertices $V = []$
* Choose a random direction $d$
* $u = S(P,d) + S(Q,-d)$
* $V = V \cup u$
* ...


References
---

* [Implementing GJK - Casey Muratori (YouTube, 2006)](https://www.youtube.com/watch?v=Qupqu1xe7Io)
* [Gilbert-Johnson-Keerthi Distance Algorithm - Wikipedia](https://en.wikipedia.org/wiki/Gilbert%E2%80%93Johnson%E2%80%93Keerthi_distance_algorithm)
* [Improving the GJK algorithm for faster and more reliable distance queries between convex objects - M. Montanari, N. Petrinic, E. Barbieri](https://ora.ox.ac.uk/objects/uuid:69c743d9-73de-4aff-8e6f-b4dd7c010907/download_file)
* [Collision Detection Accelerated: An Optimization Perspective - Montaut etal](https://arxiv.org/pdf/2205.09663)
* [the Gilbert–Johnson–Keerthi algorithm explained as simply as possible - computerwebsite.net](https://computerwebsite.net/writing/gjk)
* [Papers I Have Loved - C. Muratori (YouTube, 2016)](https://www.youtube.com/watch?v=SDS5gLSiLg0)
