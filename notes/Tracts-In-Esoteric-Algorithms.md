This is a nascent idea to make a small series in esoteric algorithms.
I'm not sure if this will become a reality but I'd like to take some
notes for potential future reference.

Some rough criteria:

* The algorithm is fairly well contained, without needing a lot of context
* The algorithm is not widely known, talked about or implemented
* The algorithm is interesting

I make no claims about objectivity of the above points.

I've found a good rule of thumb that flag it as a candidate for an esoteric algorithm:

* If the algorithm has a paper published but has minimal supporting exposition
  (blog posts, reviews, etc.)
* If the algorithm is talked about but has no FOSS implementation that's easily accessible

Tracts should be short, less than 100 pages, with maybe 20-50 pages as a good goal.

Some proposed structure:

* Introduction
  - context
  - terminology
* Algorithm
  - pseudo code
* Proof
  - runtime analysis
  - any auxiliary mathematical exposition
* Examples
  - pictures and usage

I find myself implementing a lot of algorithms that are not well known,
so the list below is mostly what I've been working on.
Most of them are known in the literature but lack public implemenetations
and often lack supporting tutorials, documentation and other literature
accomponying more celebrated results.

Candidates:

* Zhu's (2d) convex hull algorithm from half plane representeation
  - potential 'online' upgrade
  - input is halfplanes, output is vertices on convex hull
* Chan's (other) (3d) convex hull algorithm
  - input is points in space, output is points on convex hull
* Linear time algorithm of convex hull for random points in unit square/cube
* (2d) rectangular partition of rectilinear polygons
  - polynomial time dynamic programming solution
* (2d) Hamiltonian cycles on solid grid graphs
  - Umans and Lenhart polynomial time algorithm
* (3d) relative neighborhood graph
  - still speculative (in research) but idea is linear time algorithm for points uniform in unit cube
* Gilbert curve
  - 2d/3d
* (2d) Hamiltonian paths in rectangles
  - polynomial time algorithm
* GJK `(X)`
  - I don't have a good sense for when this algorithm fails
* Hyperplane Separation Theorem Algorithm (Separation of Axis Theorem) `(X)`
  - Naively $O(n^2)$, I'm not sure if that can be sped up or there are some heuristics to help
* Hobby curve `(XX)`
* WikiSort `(XX)`
* GrailSort `(XX)`
* Strong generating sets / Schreier-sims `(X)`
* median of medians
  - in-place linear algorithm to find k'th largest element in an unsorted array
* distinct elements in streams `(XX)` (Chakraborty, Vinodchandran, Meel)
* root finding in the complex plane (epsilon bounds) (?) `(X)`


Where:

- `(X)` : I presumably know how the algorithm works but have never implemented it
- `(XX)` : I don't know how the algorithm works and I haven't implemented it


###### 2026-04-09
