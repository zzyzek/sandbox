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

### KNT87

* Now they believe the KN85 algorithm was 8 regions, not 6 for some reason
* GNG has now turned into ARN (all region neighbors)


### BEY91

Closely related is the Delaunay triangulation.

BEY show that the expected maximum degree of $DT(V)$ is $\Theta( \frac{ \log n }{ \log \log n } )$.

From the paper:

> In both cases, the strategy for the upper bound is to show that if a site has high degree ...
> then either it touches an unusually large empty sphere or its DT neighbors are
> unusually close to each other.



Refernces
---

* [JT] "Relative Neighborhood Graphs and Their Relatives" by Jerzy W. Jaromczyk and Godfried T. Toussainty
* [KN85] "Computing Relative Neighbourhood Graphs in the Plane" by J. Katajainen and O. Nevalainen (1985)
* [KNT86] "A Linear Expected-Time Algorithm For Computing Planar Relative Neighboourhood Graphs" by J. Katajainen, O. Nevalainen, J. Teuhola (1986)
* [BEY91] "The Expected Extremes in a Delaunay Triangulation" by M. Bern, D. Eppstein, F. Yao
