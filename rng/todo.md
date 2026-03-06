TODO
===

###### 2026-03-05

* algorithm implemented but something looks clearly wrong, testing needs to be done
  - looks better but still has bugs
  - ~make sure single point rng works (`lunech_rng_point_naive`)~
  - do a comparison test with full naive rng
    + in progress, still has bugs
  - focus on one point for visualization to see what's going on
* get meta data so we can visualize

###### 2026-02-28

* ~normalize vertex triple return of cocha (ccw rel. face normal)~
* ~add mirror point on boundary for convex hull test~
  - needed to be randomized because of x-sorting for cocha
* ~test $p$ inside/outside convex hull~

###### 2026-01-15

nixed, moved onto convex hull algorithm

* Make C/C++ implementation
* Generate $\pi/4 + \epsilon$ data and show still has linear performance
  - or not? figure out how to rotate? How to avoid this scenario?
* Scale to 1M+ points
* Get visualization working
* Get test cases with restricted regions
