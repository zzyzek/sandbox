TODO
===

###### 2026-07-04

I've now found at least two bugs in swap and rem.
I don't know how this managed to work at all in the
first place but this makes me nervous.

* fix bugs in swap and rem 2d
* add a consistency check function to make sure
  grid, bp, etc. are in a state we think they should be
* add stress tests that randomly insert, swap and remove points
  to test

###### 2026-07-03

Working through 2d SCA optimization.

The basic loop is:

* ADD vein
  - if a new vein node is added, mark it for processing
  - update RNG with all newly created vein nodes and
    update vein nodes and auxin neighbors that have
    been marked for processing
* KILL auxin
  - if an auxin node is deleted, mark all neighbors for
    processing
  - update RNG for each marked node
  - if marked nodes have a differing RNG, mark each neighbor
    whose connectivity changed for processing
  



```
P[0:n_a]          : auxin nodes
P[n_a:(n_a+n_v)]  : vein nodes

ctx = RNG(P)

processQ.reset()

for nod in G:
  if nod is vein and has at least one auxin neighbor:
    processQ.add(nod)
  if nod is auxin and has at least one vein neighbor:
    processQ.add(nod)


while (n_a > 0) and (it < n_it):

  updateQ.reset()

  for nod in processQ:
    if nod is auxin: continue
    if vein node, nod, has no auxin neighbors:
      processQ.rem(nod)
      continue
    updateQ.add(nod)
    v = spawn vein node from nod in direction of auxin neighbors
    updateQ.add(v)

  for nod in updateQ:
    if nod not in ctx: ctx.add(nod)

    prv_nei = RNG_nei(nod)
    RNGv(nod) # single vertex RNG calculation
    cur_nei = RNG_nei(nod)

    for nei_nod in RNG_nei(nod):
      updateQ.add(nei_nod)
      processQ.add(nei_nod)

  updateQ.reset()

  for nod in processQ:
    if nod is vein: continue
    if auxin node, nod, has no vein neighbors:
      processQ.rem(nod)
      continue

    if all vein nodes of auxin node, nod, within kill distance:
      processQ.rem(nod)
      for nei_nod in RNG_nei(nod):
        updateQ.add(nei_nod)
      ctx.rem(nod)

  for nod in updateQ:
 
    prv_nei = RNG_nei(nod)
    RNGv(nod) # single vertex RNG calculation
    cur_nei = RNG_nei(nod)

    for nei_nod in RNG_nei(nod):
      updateQ.add(nei_nod)
      processQ.add(nei_nod)

    
    
      

  

```

* do an initial RNG on all auxin and vein nodes
* add all vein nodes that have an auxin neighbor and auxin
  nodes that have a vein neighbor to a processing queue, pq
* while |pq| > 0:
  - initialize an update queue, uq, empty
  - initialize update queue process, uqp, empty
  - foreach vein v in pq:
    + if v has no auxin neighbors, remove from pq
    + otherwise add new vein node in appropriate location
    + add new vein node to uq
  - foreach v in uq:
    + if v in uqp, skip
    + add v to pq, uqp
    + recalculate local RNG relative to v
    + add all neighbors (auxin and vein) of v
      to pq, uq
  - foreach a in pq:
    + if a has no vein neighbors, remove from pq, skip
    + 
  


###### 2026-06-23

* afaict, slow version of 2d sca is working
  - vein jitter in placement, with a wedge of PI/4, is necessary
    to circumvent pathological cases (where auxin nodes are opposite
    and it just sits in place)
  - vein removal if they land on top of each other should probably happen
    but for now it looks like it's not needed
  - the algorithm is very slow with the two calls to recreate the whole RNG
    being the culprit (simple perf validation confirms)
* the major todo is now to update the RNG incrementally with the added and/or removed
  nodes
  - each removed node will 'dirty' neighboring nodes by removing the edge
    + for each dirtied neighbor node, $u$, keep a record of edges and recalculate local
      RNG
    + any new edges that differ from the previous record of $u$ are added to the dirtied list,
      with already dirtied or already processed nodes being ignored
    + repeat until no more dirtied queued
  - each added node, $v$, needs to have a local RNG run
    + for each new edge from $v$ to $u$, $u$ needs to be added to a dirtied list
    + $u$'s previous neighbor list is saved and the RNG is recalculated for $u$
    + any edges from $v$ to $w$ that differ from the saved list need to have $w$
      added to the dirtied list, unless $w$ is already dirtied or already processed
    + repeat until no more diried queued

###### 2026-06-09

* (RESOLVED) implementing slow 2d space colonization algorithm (redos rng every round)
  - need to remove vein nodes that are too close
  - crash on `... 120` w/ `D_add = 2 / (n_a + n_v)` ( `D_kill = 1/(n_a + n_v)` )

###### 2026-05-31

* space colonization algorithm (SCA) is too intertwined with
  relative neighborhood graph (RNG), so it's best to put it here.
* The idea for SCA:
  - after initial setup, auxin nodes are only ever removed and vein nodes
    are only ever added
  - This means we can create a list data structure that has auxins in the left
    part as a contiguous array of points and vein nodes in the remainder of the list
  - I guess it doesn't matter about auxin only removing and vein only adding,
    but both add and remove operations can be done efficiently
    + auxin add puts it at the first vein node, first vein node goes to the end
    + auxin remove swaps removed node with end, swaps vein node with end of auxin list
      pops the last entry off
    + vein node add puts it at the end
    + vein node remove swaps it with last then pops
  - adding/removing auxin/vein nodes needs to have bookkeeping done to remove relative
    neighborhood graph edges that were present to the removed node and 'dirty' the neighbor
    nodes
    + we've settled on dictionary neighbor along with various backpointer structures, so
      all this is a little tedious but can be done
  - see main loop below
* implement slow SCA in 2d for reference
    

main loop:

```
place initial auxin nodes, A
place initial vein node, V
calculate initial relative neighborhood graph, G
while |auxin| > 0:
  collect vein nodes with connections to auxin nodes, U
  W = {}, D = {}
  foreach v in U:
    create new vein node in appropriate direction from auxin influences on v into W

  foreach w in W:
    if w collides with any in V, continue
    otherwise add w to V (and place in space)
    add w to D

  foreach v in D:
    calculate local neighborhood graph of v
    add any neighbors of v to D unless they already exist (could be auxin or vein)

  foreach a in A:
    if all vein neighbors of a are withink kill distance, remove a

```
    

###### 2026-05-12

* calling base SPoIF implemented
  - still slow, but I'd like to focus on features (API, grid marking, convex hull wrapping, etc.)
* features to be implemented
  - API
  - convex hull marking and initial grid marking
  - grid marking from image bitmask
* space colonization will give guide on what API to implement and give better scaffolding
  to test the OOB grid marking


###### 2026-05-08

* optimization of SPoIF
  - current optimizations give about 10x over naive implementation
    + cache secure calculation for fence posts from $(p,q)$ cutting plane ( ~ 2x speedup )
    + early bail out if fence secured ( ~ 1.5x speedup )
    + skip opposite frustum of $(p,q)$ plane ( ~ 1.25x speedup )
    + order $q$ points by distance ( ~ 1.15x speedup )
    + start with ir=1 ( ~ 1.15 speedup )
    + above estimates don't come out to 10x but 10x is observed
  - securing the fence and naive rng on the secured points are now roughly equal runtimes
  - naive rng can probably be sped up by using the cutting plane to remove points, say
    by an initial pass
  - we're throwing away a lot of information as each rng relative to the anchor point $p$
    is done in isolation
    + isolation makes it embarrassingly parallel, which might be good for hardware speedups
    + previous rng of neighbors can seed the rng for the next
    + could do a breadth first search order by how many neighboring points have been seeded


There are two main sections to speed up:

* Fence securitization
* RNG realtive to anchor point calculation

For fence securitization:

* partial RNG neighbors of anchor point can be prioritized to secure fence
  - the idea is that RNG neighbors have a higher likelyhood of securing the fence
  - obviously a rough heuristic, so we'll see if it helps
  - might want to consider low discrepency angle order to try and jump around as much as possible
    + one idea is to use a butterfly sfc ( [ [0,0], [1,0], [0,1], [1,1] ] -> [ [0,0], [1,1], [1,0], [0,1] ])
      mapped to the unit sphere
* partial RNG can be used to toss out portions of domain
  - can order $q$ neighbor points by distance, take top $k$ ( $k=10$ say ), and toss out values that
    fall on the otherside of the cutting plane

The rough goal is to get 10k points processed within 1s.
Currently it's at 9s per 10k, so another 10x speedup would be required.


###### 2026-05-06

* debugging SPoIF (resolved)
  - looks like there's multiple things wrong:
    + sweep is not perimeter but whole sub grid? fixed, `gnuplot_cube` needs to be radius ds/2, not ds
    + sweep is 1 more side length than it should be? fixed from above (double size overlapped and caused visual artifact
      to make it look like it was whole grid)
    + frustrum fence posts aren't as long as they need to be, fixed (see below)
      - hacked lengths that look right, I'll have to go back and justify them
      - sqrt(3) is the length of the diagonal, the actual side lengths should be 1/2 (1 total span),
        with a gotcha of needing to scale the radius by 2*ir + 1 in the appropriate places
* add naive rng (done)
  - get the basics working even if slow
  - once working, we can optimize
* optimize (wip)
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
