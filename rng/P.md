...
===

Consider a vertex set $V = \{ v | v \in \mathbb{R}^d \}$, $n = |V|$, where
we will be considering only $d \in \{2,3\}$ with a Euclidean distance metric.

Relative Neighborhood Graph (RNG)
---

The relative neighborhood graph, $\text{RNG}(V) = (V,E)$, is defined to be the
graph with sets of edges such that:

$$
\begin{array}{ll}
& (p,q) \in E \\
\to &
 \forall v \in V / \{p,q\}, \\
 & |p-q| \le \max( |p-v|, |q-v| )
\end{array}
$$

![lune2d](img/lune2d.png)

Take $p,q \in \mathbb{R}^d$, with $r _ {p,q} = |p-q|$.
Take the circle of radius $r _ {p,q}$ centered at $p$, $C _ p$,
and the circle of radius $r _ {p,q}$ centered at $q$, $C _ q$.
Call the intersection of the two circles, $R = C _ p \cap C _ q$,
the *lune* created by points $p,q$.

The relative neighborbood graph consists all edges, $(p,q)$, such
that there are no points in the lune between them.

In the illustration above, since $v$ is outside the lune region, $R$,
the edge, $(p,q)$,  is part of the relative neighborhood graph,
$(p,q) \in E$.

### Naive Relative Neighborhood Graph Algorithm

A naive $O(n^3)$ algorithm can be constructed to find the relative neighborhood
graph by considering all triples of points.

```
NaiveRelativeNeighborhoodGraph(V):
  E = {}
  for p in V:
    for q in V / p:

      accept_edge = true

      for v in V / {p,q}:
        if dist(p,v) < dist(p,q) and
           dist(q,v) < dist(p,q):
          accept_edge = false
          break

      if accept_edge:
        E += (p,q)

  return E
```

For a given point, $p$, if we had some knowledge about which
points in $V$ could never yield an edge connection, we could
speed up the above algorithm by not doing the distance calculations
in the first place.

This observation is the basis of many algorithms to speed up the relative
neighborhood graph algorithm.

Elimination Heuristics
---

Consider $p,q \in V$, and the hyperplane with normal ${\bf N} _ {q,p} = (q-p) / |q-p|$ passing
through $q$.

Regardless of whether $(p,q)$ is in $E$, for any point, $v$, lying on
the other side of the half plane, $(p,v) \notin E$ (triangle inequality).
This means when trying to find which edges $p$ has, for any given $q$,
we can eliminate any point that lies on the other side of the half plane
from consideration to connect to $p$.

The heuristic is rough but easy to calculate.

Finite Degree For Random Points
---

The average and maximum degree are almost surely constant for
the relative neighborhood graph in 2d and 3d when points are random.
The more specific condition is that there are no isosceles triangles
in the point set.

$$
\max _ {v \in V} \deg(v) < c < \infty
$$

Grid Binning
---

Consider $n = |V|$ randomely chosen points in $[0 \dots 1]^d$, $d \in \{2,3\}$
(unit square, unit cube).

Choose a uniform grid with $m = \lceil n ^ {\frac{1}{d}} \rceil$ number of cells
and each cell having dimension $n^{-\frac{1}{d}}$.
We've chosen bin size to be roughly $m \sim n ^ {\frac{1}{d}}$ bins on a
side, giving us $m ^ d \sim n$ bins in total.

Process each point, $p \in V$, putting them in the appropriate bin,
adding them to a linear linked list if there's a collision.
This can be processed in $O(n)$ time, with $O(n)$ space.

This will give most bins constant occupancy.
Some bins will have max load roughly $(\ln(n) / \ln(\ln(n)))$ but
this happens so infrequently so as not to affect any amortized run-time
analysis that we will do.




Appendix
---


Binning Runtime
---

This will be a rough outline of why binning from a Poisson process
still gives linear run
time, even though individual bins can have non-constant max load.

Define the load of cell $k$ to be $L _ k$ and
the max load of a cell to be $L _ {\text{max}}$.

$$
L _ {\text{max}} \sim \frac{ \ln(n) }{ \ln( \ln( n ) ) }
$$

Naively, this might lead one to think that if the max load
of a cell is non-constant the total run time might be super-linear.

To see why not:

$$
\begin{array}{l}
\text{w.h.p. } \forall \epsilon \in (0,1), \\
\sum _ k ^ n \mathbb{1} \{ L _ k \ge (1-\epsilon) \frac{ \ln(n) }{ \ln(\ln(n)) } \} \sim n ^ { \epsilon + o(1) } \\
\end{array}
$$

Say we have an algorithm that is $O(m^{\alpha})$, for some fixed $\alpha$.
The cost of processing all non-constant buckets is then, roughly:

$$
n^{\epsilon} \left[ \frac{ \ln(n) }{ \ln(\ln(n)) } \right] ^ {\alpha} \\
$$

If we want to find when this cost is super linear:

$$
\begin{array}{ll}
& n^{\epsilon} \left[ \frac{ \ln(n) }{ \ln(\ln(n)) } \right] ^ {\alpha} > n \\
\to & \epsilon \ln(n) + \alpha \left[ \ln(\ln(n)) - \ln(\ln(\ln(n))) \right] > \ln(n) \\
\to & \alpha > \frac{ (1-\epsilon) \ln(n) }{ \ln(\ln(n)) - \ln(\ln(\ln(n))) } \\
\to & \alpha \to \infty
\end{array}
$$

Meaning, no matter what polynomial time algorithm we throw at the large buckets,
they're still so small and so infrequent that we can never choose a finite exponent
polynomial time algorithm to make the amortized run-time super linear.

