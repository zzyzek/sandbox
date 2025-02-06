Relative Neighborhood Graph Notes
===

We only deal in $\mathbb{R}$ space.

Definitions
---

* $d$ - dimension
* $V$ - set of points/vertices (in dimension $d$)
* $n = |V|$
* $\delta _ p (x,y) = \delta _ {p, (x,y)}$ - distance between points $x$ and $y$ ($p$ not specified $\to p=2$)
  - $\delta _ 2 (x,y) = \delta _ {x,y}$
* $L _ p$ - distance metric for $1 < p < \infty$ ($\to \delta _ p (x,y) = [ \sum _ {i=0} ^ {d-1} | x _ i - y _ i | ^ p ]^ \frac{1}{p}$)
  - $L _ 1 \to \delta _ 1 (x,y) = \sum _ {i=0} ^ d |x _ i - y _ i |$
  - $L _ 2$ - Euclidean distance metric
  - $L _ { \infty } \to \delta _ { \infty } (x,y)  = \max _ {0 \le i < d}  |x _ i - y _ i |$
  - $L _ \rho$ for $\rho \in ( 1, \{ 1 < p < \infty \}, \infty )$

$$
\begin{array}{l}
B(x,r) = \\{ y | \delta(x,y) < r \\} \\
\bar{B}(x,r) = \\{ y | \delta(x,y) \le r \\} \\
\Lambda _ {p,q} = B(p, \delta _ {p,q}) \cap B(q, \delta _ {q,p}) \\
RNG(V) = \\{ (p,q) | \Lambda _ {p,q} \cap V = \emptyset \\} \\
\Gamma _ {p,q} = B( \frac{p+q}{2}, \frac{ \delta _ {p,q} }{2} ) \\
GG(V) = \\{ (p,q) | \Gamma _ {p,q} \cap V = \emptyset \\} \\
U _ {p,q} (\beta) = B( p + \beta \frac{q-p}{2}, \beta \frac{ \delta _ {p,q} }{2} ) \cap B( q + \beta \frac{p-q}{2}, \beta \frac{ \delta _ {q,p} }{2} ) \\
G _ { \beta } (V) = \\{ (p,q) | U _ {p,q} (\beta) \cap V = \emptyset \\} \\
\end{array}
$$

* $RNG(V)$ : relative neighborhood graph
* $GG(V)$ : Gabrial graph
* $G _ { \beta } (V)$ : $\beta$-skeleton neighborhood graph
  - $G _ 2 (V) = RNG(V)$
  - $G _ 1 (V) = GG(V)$
* $MST(V)$ : minimum spanning tree
* $DT(V)$ : Delaunay triangulation

Sizes
---

* $d=2$, $\beta \ge 1$, $\rho=2$, $G _ { \beta } (V)$ can be constructed in $O( |V| \lg |V| )$ time
* $d=2$, $MST(V) \subseteq RNG(V) \subseteq DT(V)$
  - $|MST(V)| \le |RNG(V)| \le |DT(V)|$
* $L _ p$, $1 \le \beta \le 2$, $MST(V) \subseteq G _ { \beta } (V) \subseteq DT(V)$
* $L _ p$, $|V|-1 \le |RNG(V)| \le 3 |V| - 6$
  - $L _ 2$, $d=2$, $|V| \ge 8$, $|V|-1 \le |RNG(V)| \le 3|V| - 10$
* $L _ p$,  $|V|-1 \le |GG(V)| \le 3|V| - 8$
* $L _ 1$ or $L _ { \infty }$, $|RNG(V)| = \Theta( |V|^2 )$
* $d \ge 4$, $|RNG(V)| = \Omega( |V|^2 )$
* $L _ 2$, $d = 3$, $|RNG(V)| = O(|V| ^ { \frac{4}{3} })$
* $L _ p$, no isosceles triangles $\to max _ { v \in V } \deg(v) < c$
  - in this case $|RNG(V)| \le c|V|$
  - $L _ p$, $\forall d$, if $\forall x,y,u,v \in V, \delta _ p (x,y) \ne \delta _ p (u,v) \to |RNG(V) \le c |V|$

Algorithms
---


* $\text{runtime}( \text{Alg} _ {RNG}(V) ) = \Theta( |V|^3 )$ (naive)
* $\text{runtime}( \text{Alg}( DT(V) ) _ {RNG} ) = O( |V|^2 )$ (Delaunay triangulation speedup)

NOTE: I don't know what JT is smoking but it looks like $d=2, L _ 2, O(n)$ is completely missed in the table, even
though he talks about it explicitely.
I also don't trust that a generic condition $d=3, L _ 2, O(n)$ hadn't been discovered at that point.

### KN85

I'm only going to talk about the generic case.

Assume $|V|=n$ points in the unit square, distributed generically (Poisson point process).

The bulk of the KN85 algorithm works by considering radial regions for each point, computing the nearest neighbor in
the six radial slices and noticing that this graph, called the "goegraphic neighbourhood graph" (GNG), is a superset of the
relative neighbourhood graph (RNG) of the point in question.
To find nearest points to construct the GNG, the cells are walked in a spiral fashion, effectively considering nearer
cells first to do the distance test (maybe Bresenham's circle drawing would be more effective?).

For a point $p$ far enough away from the edge, the $GNG(p)$ is effectively bounded, so one can just do a naive algorithm
on the points in $GNG(p)$.
The "spiral out" walk starts to falter when the points are too close to the boundary and special consideration needs to be
taken.

Cell sizes are (I believe) chosen to be roughly $\frac{1}{\sqrt(n)}$.
The grid is further partitioned into "outer", "middle" and "inner" regions.
The outer region cells are defined to be the cells in the band of $C \log(n)$ from the edge.
The middle region are from $2C \log(n)$ to the outer band.
The inner cells are the rest.

In some "generic" configuration,
the outer cells (and maybe the middle cells?) only contain a small number of points, so I think
the idea is that you can just run a naive algorithm on those points without blowing your budget.

Under generic conditions (for $d=2$, $L _ 2$), the algorithm works in expected linear time ($O(n)$).

Some takeaways:

* $RNG(v) \subseteq GNG(v)$ ($v$ a single point)
* There are six regions, most likey due to the maximum (generic) neighbor count
* The special handling of border cells/points is handled in another algorithm/paper which
  I'm trying to find
* The worst case complexity comes from "pathological" cases when the points are exactly on the circle
  and don't trigger the removal because of the open nature of the regions

UPDATE:

To understand why special consideration needs to be done for points near the edge, both in the 6
region and 8 region case, consider a point very near one of the sides.
Let's say it's the closest point to the edge.

This means it needs to walk the entire row/column of grid cells in order to determine if it has a neighbor
or its hit an edge.
K&N claim that the uppermost point needs to do $O(n)$ work but I don't see why.
Instead, consider a special case where there are $\sqrt{n}$ points in the upper row (on average one
point per grid cell, $O(\sqrt{n})$ cells, so $O(\sqrt{n})$ points) ordered by decreasing height from left to right.
The left most point needs to traverse the whole top row on the right to fill $R _ 1$.
The next point will have the first point at it's left neighbor, $R _ 3$, but again needs to traverse
the whole right top row to fill it's $R _ 1$ wedge.
Doing this for all points in the top row gives $\sum _ {k=1} ^ {\sqrt{n}} k = O(n)$.
I'd have to think about it but I suspect random permutation doesn't save you.

This happens for both 6 and 8 regions.


### KNT87

* Now they believe the KN85 algorithm was 8 regions
  - 8 regions, up from 6, to help simplify the algorithm
  - They do other tricks so as not to handle edge cells as a special case and
    8 regions allows for an additional heuristic to stop the spiral search
* GNG has now turned into ARN (all region neighbors)

On futher reading, I suspect this gives an $O(n)$ algorithm for $d=2, L _ 2$, and points in generic position.
I also suspect that this can be adapted pretty easily to 3d, but I need to investigate more.

The following focuses on $d=2, L _ 2$ and generic point positions.

The basis of the algorithm is:

* Assume $n$ points on unit square $((0,0), (1,0), (1,1), (0,1))$
* Partition the grid into $\frac{1}{\sqrt{n}}$ sized cells, using a linked list
  to store multiple points
* For each point $p = (x _ p, y _ p)$, create 8 radial regions centered at $p$
* Add virtual points $((0, y _ p), (1, y _ p), (x _ p, 0), (x _ p, 1))$ as sentials
  for edge detection
* Spiral walk out from $p$, cataloging nearest point $q _ i$ in each region
  - Call a radial region "closed" if a $q _ j$ point is found in it
* Do this until no two adjacent radial regions are open or until the grid cells have
  been exhausted
* Call $SI _ p$ the square ("influence") centered at $p$ with side length $8 \cdot \max _ {j} ( d _ {\infty} (p, q _ j) )$
* Walk all grid cells in $SI _ p$ and collect points into list $L$
* Use the $q _ j$ and $L$ to find the $RNG(p)$

The idea is that, for a point $p$, the $RNG(p)$ is a sub graph if the $ARN(p)$, both of which are degree bounded.
Constructing the $ARN(p)$ might need to walk many cells if, say, $p$ was near the boundary (conider $p$ near the
bottom left edge, with the radial region creating a thin sliver of cells all the way up to top left).

With the condition that no two radial regions are open, we get some guarantees about how far we need to search
to find all $RNG(p)$ points.
Specifically, creating a square of radius $4 \cdot \max _ j ( d _ {\infty} (p,q _ j) )$ (total
side $8 \cdot \max _ j ( d _ {\infty} (p,q _ j) )$) gives us a small region to scan to guarantee
to find the $RNG(p)$ points.

The idea is that for points $p,q,v$, if the angle formed by $\theta(p,v,q) \ge \frac{\pi}{2}$, then $v \in \text{lune}(p,q)$.
Meaning, if the angle is too sharp between three points, the edge between the endpoints must be booted out of the $RNG$.

> [This] ... is a direct consequence of the cosine law of triangles

So if you have a point $q$ that's outside of $SI _ p$, there are a few cases:

* If $q$ is within a closed radial region, the point closer to $p$ that closed it precludes $(p,q)$ from being in the $RNG$
* If $q$ is in an open radial region, that means the neighboring radial regions, $R _ l, R _ r$, must be closed
  - naively, you might think there's a "worst case" scenario if the points closing $R _ l$ and $R _ r$ leave a narrow
    $\frac{\pi}{12}$ sliver because the $\frac{\pi}{3}$ angle they sweep only encroaches $\frac{\pi}{6}$ past the radial boundary,
    but in this extreme case, the points in $R _ l$ and $R _ r$ would preclude $p$ because of the triangle inequality,
    giving us more wiggle room and more information to work with

I think there's a nice picture that can be drawn, but I'm going to use words and hope that I have the inclination to do the
picture later:

* Consider $p$, $SI _ p$ with the "radius" of $SI _ p$ to be $4 c$ (total width $8 c$)
  - $c = c _ { \text{max},p } = \text{max} _ { j } ( d _ {\infty} (p, q _ j) )$, where $j$ is over closed radial regions only
* w.l.o.g. consider $q$ to be the point in the radial region $R _ 1$, with $R _ 1$ "open" and $R _ 2$ and $R _ 8$ closded
* Call $q _ 2$ and $q _ 8$ the points in $R _ 1$ and $R _ 8$ that closed them
* $|p,q _ 2| \le \sqrt{2} c$, $|p, q _ 8| \le \sqrt{2} c$, $|p, q| \ge 2 c$

Hm, I might be missing something but the way I see it, the $\theta _ 2 = \text{ang}(q,q _ 2,p)$ and $\theta _ 8 = \text{ang}(q, q _ 8, p)$
would exclude $(p,q)$ if the outer square is $3c$ radius ($6c$ on a side total).

That is, the worst case happens when $q _ 2$ is directly above $p$ (in radial region $R _ 2$), and when $q _ 8$ diagonal down from $p$,
making regions above the $q _ 2$ horizontal line and to the right of the diganal line of perpendicular to $q _ 8$ regions where
$q$ would imply $\theta _ 2$ and $\theta _ 8$ to be greater than $\frac{\pi}{2}$.
In this case, it means either $q _ 2$ or $q _ 8$ is in the lune of $(p,q)$, excluding $(p,q)$ from the $RNG$.

The region to avoid is when $q$ is inside a box of radius $3c$ (side $6c$), so I'm confused as to the $4c$ requirement in the paper.

| |
|---|
| ![KNT, lemma 2](img/rng_knt_lemma2.svg) |

This hasn't exploited the fact that there's a potential angle restriction for $\theta(q _ 2, p, q _ 8)$ but I'm not sure that
gives actionable information.

At any rate, the idea is that past a certain point, in the case that $R _ 2$ and $R _ 8$ are closed,
any $q$ chosen in radial region $R _ 1$ will have an angle too large
for one of $\theta _ 2 = \theta(q, q _ 2, p)$ or $\theta _ 8 = \theta(q, q _ 8, p)$ so that $q _ 2$ or $q _ 8$ falls
within the lune of $(p,q)$, excluding $(p,q)$ from the $RNG$.

Once we have our $ARN$ with no two open radial regions next to each other, we can then bound the box to sweep/check
for other points.



### BEY91

Closely related is the Delaunay triangulation.

BEY show that the expected maximum degree of $DT(V)$ is $\Theta( \frac{ \log n }{ \log \log n } )$.

From the paper:

> In both cases, the strategy for the upper bound is to show that if a site has high degree ...
> then either it touches an unusually large empty sphere or its DT neighbors are
> unusually close to each other.

### Ideas

Here's an idea for an algorithm:

* $n = |V|$, $v \in [0, 1)^2$ uniformly random
* Construct a grid, $G$, with cell size $(\sqrt{n},\sqrt{n})$
  - fill grid with points from $V$, with a linear linked list for duplicates
  - call the grid cells centered at $v$ of grid (integral) radius $r$ $G _ r (v)$
* For each point $v \in V$:
  - $P = \{v\}$
  - grid fence relative radius resolution point $F _ {r,u,l,d} = \{\infty\}$
  - for $r = \{0,1,\dots,\lceil \sqrt{n} \rceil\}$:
    + for all $u \in G _ r (v) - P$
      - find direction, $\{r,u,l,d\}$ and which relative grid radius, $r _ q$, secures the fence
      - if $r _ q < F _ {dir(u-v)}$:
        + $F _ {dir(u-v)} = r _ q$
      - $P = P \cup \{u\}$
    + if all $F _ {r,u,l,d} \le r$, break
  - Construct the $RNG(v)$ testing only points $u \in G _ r (v)$



Refernces
---

* [JT] "Relative Neighborhood Graphs and Their Relatives" by Jerzy W. Jaromczyk and Godfried T. Toussainty
* [KN85] "Computing Relative Neighbourhood Graphs in the Plane" by J. Katajainen and O. Nevalainen (1985)
* [KNT86] "A Linear Expected-Time Algorithm For Computing Planar Relative Neighboourhood Graphs" by J. Katajainen, O. Nevalainen, J. Teuhola (1986)
* [BEY91] "The Expected Extremes in a Delaunay Triangulation" by M. Bern, D. Eppstein, F. Yao
