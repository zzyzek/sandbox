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
Small grids, the path has a good chance of just randomely joining together.
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
cells to createa a new grid of size $N _ 1 \times N _ 1$.

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
Instead, you can just do it randomely, trying to randomely grow the rectangular cuboid
and seeing if it gets stitched up.

For example:

![breakjoin example 1](img/breakjoin_example1.png)

One possible drawback is the unbounded nature of how the region gets break/joined,
as there could be a long corridor across the whole map.
This might be a benefit, as long range global constraints might be captured by
this operation, but it's something to look out for.

---

Here the parameters would be the minimum homogeneous region to start this process,
how much we increment the region each step and a randomness paramter to adjust
how aggressive we are at picking breaks horizontally or vertically away from center.
Another parameter might be picked to prefer horizontal or vertical splits.
One could save homogeneous regions and use that in backtracking.

We'd need some canonical examples to test out the method:

* generic Forest Micro tileset
* 3d path with endpoints at opposite corners
* joined path with restricted barrier (as in example above)
* 2+ paths with left endpoint for each through a barrier
  to a perumted endpoints on right
* various logic gates with paths through corridors
  - make sure they're solvable on the small scale
  - scale up to see they can still be solved
* oarpgo with hard boundary conditions
  - the frame is the one that causes big problems, so
    seeing how it does in those middle frame regions



