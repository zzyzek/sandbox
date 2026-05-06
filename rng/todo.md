TODO
===

###### 2026-05-06

* debugging SPoIF
  - looks like there's multiple things wrong:
    + sweep is not perimeter but whole sub grid? fixed, `gnuplot_cube` needs to be radius ds/2, not ds
    + sweep is 1 more side length than it should be? fixed from above (double size overlapped and caused visual artifact
      to make it look like it was whole grid)
    + frustrum fence posts aren't as long as they need to be, fixed (see below)
      - hacked lengths that look right, I'll have to go back and justify them
      - sqrt(3) is the length of the diagonal, the actual side lengths should be 1/2 (1 total span),
        with a gotcha of needing to scale the radius by 2*ir + 1 in the appropriate places
* add naive rng
  - get the basics working even if slow
  - once working, we can optimize
* optimize
  - measure, don't guess
  - some likely places (but make sure to confirm before implementing):
    + early breakout for cluster collection (as soon as one fails, can break)
    + only test subset of directions based on direction of Nq plane normal
    + sort q points by distance and maybe max discrepency angle (?) to try
      and find representative points that will secure the fence (posts)
    + naive rng can maybe be sped up by ordering by distance (and maybe
      max discrepency angle) and using the partition trick to discard
      points

        
        



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
