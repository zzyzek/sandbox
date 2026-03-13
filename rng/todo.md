TODO
===


###### 2026-03-13

* We need to get a better handle on the steeple cut and dual
  - do some simpler tests to see if the steeple cut points are always
    on the steeple face scaffold graph
    + run 10k+ experiments with varying N random points around origin
      comparing steeple optimization against naive steeple cut, see if
      there are any scenarios they dont' match up
    + will offer a spot test to see if there are any obvious contradictions
      and will give at least a little evidence if the steeple optimization can
      be done

###### 2026-03-06

* profiling
  - ~parts are very slow. I suspect it's the dual calculation but first
    step is to confirm, then figure out how to optimize~
  - From a spot test of 2k random points:
    + around 55s total
    + 60% in dual calculation, 1/3 of that in candidate collect, 2/3 in candidate test
    + 30% in naive rng
  - naive rng can probably have a few heuristics to speed it up (initial half plane tests to exclude
    points) but the focus now should be the dual calculation
  - I suspect the dual calculation (what I'm calling the 'steeple cut') can be sped up dramatically
  - 3d convex hull is also relatively slow, but a much lower priority than the steeple cut and the naive rng
* automated tests
  - comparitive examples
  - timing (plots)
* description, visualization, figures
* code cleanup
* still should get some meta data for visualization (low priority)

###### 2026-03-05

* algorithm implemented but something looks clearly wrong, testing needs to be done
  - ~looks better but still has bugs~
    + bugs look cleared
    + needs some automated testing
  - ~make sure single point rng works (`lunech_rng_point_naive`)~
  - ~do a comparison test with full naive rng~ (done)
    + ~in progress, still has bugs~
  - ~focus on one point for visualization to see what's going on~
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
