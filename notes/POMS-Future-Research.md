Future Research Directions for Punch Out Model Synthesis
===

Some untested ideas about future work for POMS.


Tile Group Stamping (engineering)
---

As an artifact from the tile constraint generation process,
many tiles have only one or just a few neighbors and are
part of a larger structure.

For example, the Kenney "Marble" tile set.
One attempt at creating a tile set that could be fed into POMS
subdivided the tiles into smaller (non uniform) cuboids
with each smaller cuboid being its own tile value.

This inflated the tile count, which had the double drawback
of requiring more memory for equivalent grid sizes and
also slowed down AC4 as AC4 grows as some polynomial in terms
of domain size.

To mitigate the speed, at least, one can potentially "stamp out"
the collection of POMS tiles derived from the source tile,
including some portion of the AC4 counts, as much of the rest
of the structure is completely determined as soon as one tile is
chosen.
This should save AC4 from doing a lot of work because it's
not decrementing AC4 counts from tiles that will eventually be removed,
and can just remove them wholesale.

There's still some details to be worked out but I suspect this
can be done and can give orders of magnitude speedup on a variety
of tilesets.
This might even make tiered bit packing feasible.



Automated Biome Selection via Spectral Clustering (theoretical)
---

The idea:

* Take the tile constraints and create an implied adjacency matrix
  - Though not clear what method is "best", one simple method
    is to create a vertex for every tile and connect two tiles
    together if they share a tile constraint in any direction
* Run the matrix through a spectral clustering algorithm
* Use the resulting labels to infer tile groupings (i.e. "biomes")

The idea is that there's a lot of information encoded in the implied
tile constraint graph, however it's interpreted, which can then be used
to find groupings of tiles.
For example, for the OARPGO tile set, water tiles will tend to cluster with
water tiles, green forest tiles will tend to cluster with other green forest
tiles, etc.

In principle, the resulting grouped tiles can then be weighted by regions to prefer one
biome or another.
It's not clear (to me) how to guess the biome count (maybe some relative
eigenvalue size, some eigenvalue cutoff, etc?) but if you make a best effort
guess, you can then use it to differentiate individual tiles into groupings/biomes.

The spectral clustering itself is very nearly a "one-liner" in Python:

```
A = []
N = len(poms_data["weight"])
for r in range(N):
  A.append([])
  for c in range(N):
    A[r].append(0)

for rule in poms_data["rule"]:
  src_tile = rule[0]
  dst_tile = rule[1]
  idir = rule[2]
  val = rule[3]
  if (val < 0.5): continue

  A[src_tile][dst_tile] = 1
  A[dst_tile][src_tile] = 1

model = skl_cluster.SpectralClustering(n_clusters=N_CLUSTER, affinity='precomputed', assign_labels='cluster_qr')
labels = model.fit_predict(A)
```

Fiddling with individual tile probabilities is notoriously finicky, so there's some work
to do to figure out how to actually use the information effectively.

Kintsugi Method (theoretical)
---

###### 2024-10-03

This is very speculative so it needs to be validated.

### The Problem

A toy setup to highlight the problem:

* Take a tile set with only paths and a start/end cap
* Remove start/end cap from the rest of the grid except at opposite corners
* Keep all the rest of the tiles indeterminate to start
* A path is now forced that starts/ends at either corner

If the grid is small enough, this will find an answer.
As the grid grows, the chance of finding a solution in reasonable
time, or at all, becomes small.

The paths from either endcap go through a random (self avoiding) walk.
Small grids, the path has a good chance of just randomly joining together.
As the grid gets bigger, the chance that the two random walks collide (in
reasonable time) gets more difficult.

This problem is
hard because of the limitations of the algorithm, not the problem itself.
For more complicated tile sets, there might be subtle constraints
that aren't obvious or require deep knowledge to figure out how to
find solutions.
We'd like a solution that works for a wide variety of these "silly"
problems.

### Warmup

Take the Forest Micro tile set.

Let's say we want to find a solution for a large grid of size $N \times N$.
If $N$ is large enough, both POMS with just the random block choice scheduler and
BMS with the minimum entropy cell choice heuristic (maximum entropy heuristic)
have major difficulties.

So, come up with a schedule of $K$ sizes, $N _ 0 < N _ 1 < N _ 2 < \cdots < N _ {K-1} < N$.
Start with the $N _ 0 \times N _ 0$ grid and find a solution.
If $N _ 0$ is small enough, this should be likely.

Once a solution has been found for $N _ 0$, break the solution apart from the middle, horizontally
and vertically, and fill in the middle section (in the shape of a "plus") with indeterminate
cells to create a new grid of size $N _ 1 \times N _ 1$.

Once a solution has been found for $N _ 1 \times N _ 1$, repeat until $N \times N$ is reached.

The difference between sizes needs to be large enough to not run into contradictions from
the boundary of the break but small enough so that solutions can still be found.
For example, with the Forest Micro tile set, 10-20 might do just fine.

There's some choice in where to put the break but the middle seemed natural enough.
One could do it on the side but, with Forest Micro in particular, there might be
boundary restrictions, which might make it more difficult than it needs to be
or might bias it in weird ways.

This only works for highly homogeneous grids and any other constraints might
cause issues with this algorithm.
For example, say there's a restriction in the middle of the grid.
Does that go in the initial realization or the last one?
What if the restrictions are non trivial.

Anyway, this particular method is very brittle but last time I tested
it with Forest Micro it worked.

### Discussion

The warmup above works by exploiting a type of symmetry.
The middle region of the grid is homogeneous so we can kind of waive
our hands and have some reasonable expectation of finding a realization
as we inflate the model.

Another way to see this is if there are corners marked out on the large $N \times N$
grid with "teleporters" to the other corner regions.

So one method is to mark of regions that are too complex, the boundary edges of the grid
and maybe the start and end cap of the path, with a large middle homogeneous region.
The large middle homogeneous region can then be considered in isolation, effectively,
with wild card edges as it's boundary conditions.

So do the 'warmup' method for the middle region, starting from a small square, then
breaking and expanding until it hits some non identical region, leaving the middle
indeterminate cross region later for processing.

![breakjoin example](img/breakjoin_example.png)

Doing this expansion for homogeneous regions sidesteps the issue
of having a 'teleport' matching for regions and, presumably, even
can be done in isolation, putting the region back in when its finished
and the boundary conditions match up.

So the break line/cross can even be chosen with some more variability,
and maybe a seam can be chosen with some cost function informed by
the ambient or edge 'constraidedness' factor.

Calculating a cost heuristic to carve a seam might be difficult and finicky.
Instead, you can just do it randomly, trying to randomly grow the rectangular cuboid
and seeing if it gets stitched up.

For example:

![breakjoin example 1](img/breakjoin_example1.png)

One possible drawback is the unbounded nature of how the region gets break/joined,
as there could be a long corridor across the whole map.
This might be a benefit, as long range global constraints might be captured by
this operation, but it's something to look out for.

---

Here the parameters would be the minimum homogeneous region to start this process,
how much we increment the region each step and a randomness parameter to adjust
how aggressive we are at picking breaks horizontally or vertically away from center.
Another parameter might be picked to prefer horizontal or vertical splits.
One could save homogeneous regions and use that in backtracking.

We'd need some canonical examples to test out the method:

* generic Forest Micro tileset
* 3d path with endpoints at opposite corners
* joined path with restricted barrier (as in example above)
* 2+ paths with left endpoint for each through a barrier
  to a permuted endpoints on right
* various logic gates with paths through corridors
  - make sure they're solvable on the small scale
  - scale up to see they can still be solved
* oarpgo with hard boundary conditions
  - the frame is the one that causes big problems, so
    seeing how it does in those middle frame regions


---

Thinking about it more, there are many tricky details.
Consider a path tileset with a "frame" on the border
of the grid that isn't homogeneous but with a middle
block homogeneous and endpoints on either corner.

We then can't easily match the reduced middle block
to the outer frame.

One thing to notice is that we can take out a chunk
of the non homogeneous region, in the best case the
endpoints at either end, and then connect it back up
to the homogeneous/breakjoin region:

![breakjoin example 2](img/breakjoin_example2.png)

But this now needs to have knowledge about which
disparate regions we want to match.

Maybe some measure of constraidedness?
Maybe taking random endpoint chunks?

---

Rough idea:

* Take a block that has a partial non-homogenous region that
  bleeds into a homogeneous region (leaked block)
* Try to solve
* Take the border of the solved region and transplant it to
  another leaked block
  - if there's a solution, mark it as such
  - otherwise mark it as constrained

This might give some indication as to whether blocks are constrained
or not.

Some more thoughts on this:

* say it's on the top, with the upper U as fully resolved, a middle section that's partially resolved
  and the lower U that's unresolved/homogeneous
* the problem is that constrained sections might 'escape' through the middle partially resolved regions
* try the solution, or library of solutions, for the leaked block (bottom U section) and transplant
  the border to other leaked blocks
* if the block is big enough, the escape might become less probable, so something like BMS will need
  to do more work. WFC might fail outright
* use whatever method you want to find 'constraidedness', either BMS soften count or WFC fail count,
  to get a sense for how constrained a block section is

---

One point to highlight is that the only real signal we have is whether a block is solveable or not,
so we might need to use the solver to inform us which blocks are becoming difficult or constrained.

If a contradiction occurs in a homogeneous region, especially if other areas of the homogeneous
region are resolving fine, is that the contradiction has originated from some other place and leaked
into the homogeneous region.

---

Updated idea:

* search for constrained regions
  - choose a block size, $B _ C$
  - go through in half block steps, $\frac{B _ C}{2}$ and choose a 3x3 superblock ($3 \cdot B _ C$ on a side)
  - pin the edges (to indeterminate) and the interior (trapped) block
  - solve
  - unpin the interior block and set boundary to solved boundary
  - try to solve
  - repeat T times to and see how many times you were able to solve
  - keep a lookup table, $G _ C$ (Constrained Block Grid), of all half block steps and their constrained counts
* find homogeneous regions
  - choose atomic homogeneous block size $B _ H$ ($= B _ C$?)
  - take each cell as center and calculate hash of AC4 profile for the cell block size $B _ H$
  - save each hash value into homogeneous grid $G _ H$
* progressively solve
  - initially choose all constrained blocks above a threshold constrained count $\tau$
    + set the rest of the grid to prefatory state
    + pin the whole grid
    + unpin the constrained blocks above threshold
  - loop until timeout or solve
    + setup warp on homogeneous regions
      - find bounding box of isolated (island) unpinned homogeneous regions
      - unpin cells in each bounding box
      - for all unpinned homogeneous cells on the boundary, setup warp to horizontal or
        vertical sibling homogeneous cells
    + try to solve unpinned regions
    + dilate unpinned regions

There's a lot of magic that happens with the 'setup warp' step.
One problem is that disparate active regions need not be aligned in any way
and it's non trivial to figure out how to stitch them together.

Here are some rough ideas on the warp setup:

* isolate the homogeneous region
* mark each active regions with an ID and inactive regions with a marker
* run a discrete voronoi region to find the interface in the inactive region
* walk balk the voronoi interface until it hits the active region, warping appropriately
  - keep the interface region as a schedule of the interface for each region
  - calculate the centers of mass for each region
  - pick a representative point on each interface region
  - translate the whole interface region linearly towards the center of mass until
    some condition, when at least one point is at or below a minimum distance to the
    active region
  - any pieces of the walked interface region that fall outside are dropped
  - when the interface region is placed, extend with indeterminate boundary along
    the voronoi interface for that length

For each face of a cell in the voronoi interface, there will be a unique ID attached to it.
We want contiguous boundaries to line up as much as possible.
Another point is that if anything gets within a block size, we discard for the
future.

Case studies:

* Forest micro should have a row of constrained blocks at the top and bottom along with
  a homogeneous region connecting them
* corner path should have essentially a diagonal interface, with most of it matching,
  and intially small, so that it'll properly connect and match up
* path with far from corner points
  - warping will shrink ends of map in addition to other corner point closer,
    helping chances of path pairing
* path with passage should have passage as a mildly constrained region
* path at either corner but with a non-homogeneous border ("jagged frame")
  - interior homogeneous region can be shrunk but don't know how to connect it
    to outer frame
* path at corners with large width middle corridor
  - ???
* forest micro with choke point in middle

I suspect this is a type of entropy minimization.
The constrained region and subsequent preference on solving constrained region blocks first
is analagous to Gumin's min. entropy cell choice and is effectively a max entropy heuristic
on the block level.
The region shrinking is also, I suspect, an entropy reduction technique, trying to effectively
compress a region or the domain of interest to allow for better use of information (discarding bits,
preferring more relevant bits, etc.).

Highlighting constrained regions and the landscrape shrinking are both distinct concepts but
are complementary and, in some sense, necessary.
Using just constrained regions would result meandering (corner path far from ends) whereas
just region shrinking wouldn't know how to shrink, in general (jagged frame).

---

There's significant problems with the above:

* far from corner path needs a warp to the corner in order for it to be repulsive from
  the corner
* large middle corridor warping is non trivial

Biasing alone can't do it because of forest micro river count.
One could imagine starting from a seed and growing from there, but, at least for the naive method,
then you might get into a situation where you've taken the right fork instead of the left and
need to unwind from a cul-de-sac.

Warping to the corner, if it can be done, might still give paths that meander in opposite
directions.
As the region is enlarged, the problem only deepens.

I think we're convincing ourselves that any one shot preprocessing step could run into significant
problems without recourse.

There are two key pieces of information:

* we can have some hope of identifying constrained blocks, even during runtime, though it'll
  be at a significant cost
* homogeneous regions give a 'blank canvas' for us to have a lot of maneuverability

---

So, another embryonic idea:

* map obstinate regions
* create a neighbor warp region where they all overlap
  from a block width path through the homogeneous region,
  choosing the relative warp region location based off of
  a discretized voronoi region to give some semblance of direction
  ... or maybe even just biased in the direction of other obstinate regions
* solve
* throw away the warp region
* dilate
* loop

The idea is that we'll constantly identify obstinate regions and provide
the chance for them to resolve through the warp region.
If there's a bad choice, they'll have another chance throughout the run.

A bad situation can arise if an obstinate region meanders into a cul-de-sac
of resolved regions around it, but maybe we can identify those and find a way
to soften out of it.

