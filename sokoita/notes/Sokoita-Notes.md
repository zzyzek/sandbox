Sokoita Notes
===

###### 2024-12-25

All the below are with the 'no return' addition

* validation0 with just arc consistency has issues
* validation0 with path3 (loop, 4 long, wrapped around on itself path consistency)
  looks to work without any major resolution, just constraint propagation
* xsokoban90.1 has major issues
  - 4-path concistency reduces the search space but doesn't give enough power to solve
* microban.1 has major issues
  - 4-path consistency again reduces the search space but doesn't push it over the edge
  - just a spot check looks like it's making a bad choice at the beginning and not able
    to get out of it

The major limitation is I don't know what the fundamental issues are.

Some candidates:

* This problem (and others like it) just need longer range planning to really make progress
* The local consistency doesn't provide enough power to do this type of search


I have trouble figuring out what strategies to try because the reasons for failure are so opaque.
Getting better visualization and understanding usually needs some sort of starting point to
validate or discredit theories.


Other various notes:

* longer path consistency (6+ path consistency) might give more power
  - at least for the xy plane, the path needs to fold in on itself in order to have any power. I'm not
    so sure about the z direction
    + I think z direction as well. Doing an unrestricted search for two diagonal cells, regardless of their
      direction, will almost, by necessity, be alright since they're AC by the time we get to path consistency
  - paths that only end next to where they start should be considered?
  - for microban.1 and xsokoba90.1 the cell size is decently small, avg/median around 30 with a max of 120 or so,
    so this might be reasonable
  - early dropout might help speed things along (traversing a 6 path and early bail out for invalid neighbors)
  - prioritizing paths, especially longer paths, that have maximum overlap might give a boost in power without
    too much sacrifice in searching the whole space
  - prioritizing the z start or z end might be helpful as the tile count is also low and decisions at the start/end
    might have outsized impact
  - prioritizing certain hot-spots might have better inference power
  - if we have a path long enough that encompasses a small space that repeats, we can further knockout that tile
  - we aren't penalized for choosing tiles with only 1 possibility, so we might be able to make generalized regions
    that extend as far as their single tile choice
    + so choosing a contiguous region has cost, roughly, as the product of all tiles available in it
    + we can choose a contiguous region with one cell position as the test position, with the others
      enumerated around it
    + nevermind, single tile cells have no choice and are fixed, extending the region has no effect
  - finding chains of highly correlated regions could reduce the search space
    + if there are tiles with low support in a particular direction, namely 1, then this reduces the search space
  - there's a cell position in the chain that has many options, we could just replace with a wildcard and
    assume it works out. If there's a tile that has no support even with this wildcard, it still shouldn't if
    we were to enumerate all tile possibilities for that cell location
    + wildcards effectively make it a 'nop', so a wall of them will be equivalent to looking at two disjoint regions


From spot checks, the initial state looks to 'split' into distinct choices, where groups of tiles only belong to
one or the other.
This means:

* some tiles are highly correlated with others
* some tiles, or cells, may be 'hubs' where they can satisfy many configurations

So one idea is to just choose a contiguous block with one cell location chosen as the test cell to find path consistency.
Choosing fully resolved cell locations is effectively a 'nop' so the most non-trivial but potentially tractible test
would be to choose contiguous blocks with cells that have a small number of choices (2, 3, etc)

---

We can classify two types of deadlock:

* simple deadlock, where a pattern gets fixed and will run into the end without being moveable
* cyclic deadlock, where there's a pattern that isn't static but still gets locked into it's own cycle.


An example of a simple deadlock:

```
 $$
 $$
```

An example of a cyclic deadlock:

```
#######
# $   #

```


