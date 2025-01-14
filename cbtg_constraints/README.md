Constraint Based Tiling Generation (CBTG) Constraints
===

Some notes on CBTG constraints.

As of this writing, these ideas are not validated.
This document should be viewed as free form notes of
raw ideas that might not work out.

---


A CBTG model can be conditioned
to set up and solve more complex problems that need long range or global information
for their constraints.

There are three constraints that I'll focus on that lend themselves well to solving
some common constraint based puzzles.

* Counting constraints (e.g. 99 elements, exactly 5 in a row, less than 3 in column, etc.)
* Set constraints (e.g. elements $\{a,b,c\}$ need to appear exactly once in an area)
* Connectivity constraints (e.g. there needs to be a connected path

I'm having trouble formalising the setup but the idea is that there's a base tile set
that's been set up with other nearest neighbor constraints on it and
we want to add various other constraints overlaid on the base tile set.

A naive approach would cross product the base tile set with all combinations of
the added constraint condition.

For example, say we had a 9x9 grid of walls and spaces and we wanted to impose
row and column wall count constraints.
We might naively try to do this by altering the tile set to add a row and column
count modifier.
This inflates the tileset by a factor of 80x or more (9 row counts, 9 column counts).

The modification is polynomially sized, essentially, but squaring or cubing the tile
set count is practically infeasible.

Instead, we can add isolated new tiles that keep summary information of the underlying
tile set and decouple the row and column constraints into their own.
The additional "constraint tiles" are placed in another plane on top or bottom of the
underlying tile set and rules are added to make sure things are consistent.

I'm trying to come up with strategies for setting up more complex constraints.
I'm not sure if they'll always transfer well to every problem but I have
some idea of specific problems and how to solve them.

Canonical Problems
---

### Minesweeper (MS)

A grid, say 30x24, is seeded with some number of mines, 99 say, but hidden
from the player.
The player must reveal grid spaces.
A revealed grid space will hold the number of mines in the eight surrounding
cells.
If a player reveals a mine, the game is lost.

Here, there is a global mine count constraint.
For example, 99 mines in the expert 30x24 grid.

So the main constraint that needs to be satisfied is a counting constraint.

Here's a small example with solution:

```
.....   1111x
2.11.   2x111
.432.   x4321
2....   2xx2x
...21   12221
```

### Dungeons and Diagrams (Dnd)

There is a 9x9 grid that has walls and spaces, monsters and treasure chests.
On the periphery of the grid are row and column wall count constraints.

The rules are:

* The borders of the 9x9 grid are considered walls
* A treasure chest must exist in a 3x3 space room with walls all around, except
  for one entrance into the room
* A monster must exist in a dead end. That is, exactly three walls and one space
  in each of the neighboring positions
* Dead ends must always have a monster in them
* Aside from a treasure room, all spaces must be buffetted by walls, so only corridors
  can exist, with no 2x2, or larger, space regions
* The space path must be connected
* There must be exactly the number of walls in each row and column matching the wall
  count constraints on the periphery
* Diagonals don't count as neighbors
* There must be a unique solution

For example, here is the problem as presented to the player with
the solved instance beside it:

```
  31344041      31344041
2 ........    2 ...##...
2 ......t.    2 ...##.t.
2 t.......    2 t..##...
4 ........    4 ##....##
2 m.......    2 m..##...
3 ...t....    3 #.#t..#.
3 ........    3 #.#...#.
2 m......m    2 m.#...#m
```

Many of the constraints can effectively be made local, like the monster, corridor and
treasure tile constraints.
The row and column count as well as the connectivity constraint are long range or global
and are harder with purely local rules.

Here, there are counting constraints for the row and column wall count as well as the
connectivity constraint.

### Sudoku (Su)

A 9x9 grid, further subdivided into nine 3x3 smaller grids, evenly spaced.
There are nine symbols, typically represented as the numbers 1 to 9.
Each row and column can only have one symbol of one type and each 3x3 grid
can only have one symbol of one type.

For example, here is the initial configuration as presented to the player along
with the solution beside it:

```
 ... ..3 .27      568 913 427
 1.. ..4 6.3      197 254 683
 ... 6.. .1.      342 687 915

 685 .7. 132      685 479 132
 7.. 16. 5.8      734 162 598
 .19 5.. ..4      219 538 764

 9.. .4. .71      926 345 871
 ... 726 ...      851 726 349
 .73 891 .5.      473 891 256
```

Here, there are set containment constraints where each
region must contain exactly one each of a set.



Counting Constraints
---

We'll use MS as an example.

The MS tile set can be constructed from 3x3 super tiles with all configurations
of mines, with the middle tile represnting the display tile.

For example:

```
.*.
*..
...
```

Would be a `2` tile.

Add rules for the 2x3 or 3x2 overlap with other super tiles.

To set up the problem, ignoring the mine count condition, super tiles are restricted on the edge to make sure they have
a row and/or column of spaces.

To set up the count constraint, add another class of tiles that are colored green or red and have a count.
For this example, We'll use a maximum count of 99.

For each color and each number, modify a simple oriented path and bend tile set with each combination.
There are four straight paths and eight bend tiles.

A small ASCII picture:

```
                          v            ^
r0         g50        r87 |         g3 |
  .->      <-.-<          .          >-.
  |                       |
  ^                       v
```

Etc.

This adds 100x2x12 = 2400 new tiles.
Call these newly added tiles the counting tile set.

For each counting tile, add a transition in the $(x,y)$ plane that:

* must connect to the appropriate dock for the path
* green can neighbor green of the same number in the same direction
* red can neighbor green of the same color and the same direction
* green can neighor a red of exactly one less number modifier in the same direction
* red can neighbor a red of exactly one less number modifier in the same direction

For the $z$ connections:

* red tiles can only sit above a super tile with a mine at its center
* green tiles can only sit above super tiles with an empty space at its center

We'll use a 32x24x2 grid with a 99 mine count constraint:

* From the 32x24x2 grid, remove all counting tiles from $z=0$
* Remove all MS tiles from $z=1$
* Trace a Hamiltonian path through the $z=1$ $(x,y)$ plane, for example a zig-zag
  pattern, and remove all counting tiles that don't have a path modifier matching
  the traced path
* From the start of the path, remove all but the red tiles with a 98 modifier
  and the green tiles with a 99 modifier
* From the end of the path, remove all but the red and green tiles with a 0 modifier


The problem is now set up to solve.

Note:

* MS is easily generated and this setup is overkill. The construction is for
  illustrative purposes to highlight the counting constraint
* A CBTG solver might have trouble finding a realization or might bias results

Set Constraints
---

We'll use Su.

The base Sudoku is a 9x9 grid with tiles labeled 1-9.

Construct new tiles, with each as follows:

* A primary label from $\{1,2,3,4,5,6,7,8,9\}$ (exists label)
* A secondary label from $\{1,2,3,4,5,6,7,8,9\}$ (transfer label)
* One of three colors (red, blue, green) (transition label)

This gives a total of 9x9x12x3 = 2916 new tiles.

Create rules for the tiles where:

* Red can transition to blue or green, blue only to green, green only back to red in the same $(x,y)$ plane, further:
  - Red can only transition to blue if there is a secondary label that matches the secondary
    label of the tile below it or the secondary label matches the base label
* Each primary label can only connect to the appropriate path dock in the same $(x,y)$ plane
* Only primary labels can connect to other tiles of the same primary label in the $(x,y)$ plane
* Only tiles of the same secondary label can connect in the $z$ direction

Construct a 9x9x28 grid, with:

* The middle layer restricted to only tiles from the base tile set (1-9),
* A group of 9 layers with only straight right paths (group R)
* A group of 9 layers with only straight down paths (group D)
* A group of 9 layers with a Hamiltonian path that recursively has smaller Hamiltonian
  paths on the 3x3 sub-regions (group H)

For group R and L, remove all green tiles.
For group H, remove all green tiles except at the end of each of the sub paths in the 3x3 regions

For group R, remove all but primary label 1 from the first slice, all but 2 from the second, etc.
For group L, remove all but primary label 1 from the first slice, all but 2 from the second, etc.
For group H, remove all but primary label 1 from the first slice, all but 2 from the second, etc.

The end effect should be that each of the R, L and H layers has set inclusion for one label for
each global constraint direction.
The secondary labels communicate which of the base choice is made while the primary label keeps
track of whether the set item has been seen.

The green transition for the H layers allows for a reset of the set inclusion so that it can restart
for each of the 3x3 sub grids.
The start tile can either be red or blue, depending.
The last tile in the path can be blue which allows for the green
reset transition.



Connectivity Constraints
---

We'll use the DnD.


The underlying tile set is a 3x3 super tile set consisting of walls, spaces
and special tokens denoting a tile room center.

For example:

```
...   ..#   #.#
.t.   t..   ..#
...   ...   ##.
```

To realize the problem, ignoring connectivity constraints,
a post processing step would need to be done to place
a treasure room chest somewhere in the 3x3 treasure room, add monsters
to each of the dead ends and sum the walls for each row and column to
give the row and column constraints.

To set up the problem for solution, ignoring the row and column constraints or
the connectivity constraints, all monster locations would have tiles restricted to alcove
tiles and tresure rooms would be removed from everywhere except where they intersect
the placed chest.

Setting up the problem, with the above caveats, doesn't enforce the connectivity
constraints and solving the problem doesn't enforce the row or column constraints
nor does it enforce the connectivity constraints.

The count constraints can be modeled as per MS, with only straight paths, one on top
and one below, with walls signalling the color transition.
These tiles require 12x2x2 = 48 new tiles.

I'm still working through how to implement the connectivity constraints.
There are two ideas that would need to be validated.


The first is to add an additional $M$ count tiles, where $M$ is the maximum length
of the longest path.

Since DnD is on a two dimensional grid of length $N$, this would require at least on
the order of $M = O(N^2)$ additional tiles.

The construction is to create a tile that simulates a flood fill.
For each integer from $\{0 .. M\}$, create a tile that has all combinations of
in and out docks, with at least one in dock and one out dock.

For example:

```
._______.   ._______.
| s ^   |   | 3 v   |
|       |   |       |
|>     <|   |>     >|
|       |   |       |
|   v   |   |   ^   |
.-------.   .-------.
```

For each $k \in \{ 0 \dots M \}$, there are 14 choices of in and out docks.

The rules for joining these numbered tiles are:

* The $s$ tile (number 0, not to be confused with the boundary tile) must come in from the edge of the boundary
* A tile placed must have a space in the $z$ plane below it
* Any positive tile placed in the $(x,y)$ must have come from
  a tile numbered exactly one less than it
* A tile can have an edge/border tile, a wall tile coming out or another positive
  tile number whose numebr is exactly one greater
* For two or more numbered tiles that go into another numbered tile, the minimum
  (or maybe maximum?) number is chosen

To set up the problem, the start $s$ tile is removed from the whole domain except a chose
start location.
The $s$ tile is the start of the flood fill and can spread out through the rest of the grid.

The space constraint in the $z$ below will enforce the corridor constraint and
the placement in plane constraints will enforce connectivity.

Since there are additional $M$ tiles added that need to increase as the grid size grows,
this as the potential to scale badly.

A rough idea that I still need to think about more and validate is to try and encode
a kind of binary counter into tiles, stacking $(x,y)$ planes and using them as bit counters.

So, the first plane would have tiles that flip their color after every advance.
The plane above would follow the underlying plane but only flip their color if
there's a a $1 \to 0$ transition, effectively implementing carry logic.

There's a complication that comes up when paths join up again, and for this, the minimum (or maximum)
needs to be chosen.
I think a way to do this is to encode another state of which direction was chosen (adding another 4 multiplier?)
and use this to communicate downwards throught the layers.
The high level rule should be to default to choosing the direction from the layer above and transition accordingly.

---

Here's the current idea:

We need to keep track of whether there's a 0, 1 or 0 with carry bit.
We only need to keep track of incoming directions.
The rules in the $(x,y)$ plane and for $\pm z$ should take care of the rest.

For in plane, there are configurations like the following:

```

1 > 0 < 0     1 > 0c < 0    1 > 1 < 0
    ^             ^             ^
    0             0             0
```

Each is permissible.
For the rule above it, this should be taken care of the rules.

```
w 0 w     w 1 w
  ^         ^
  0c        0c
```

Hopefully, this shouldn't be more than $3^4 \cdot 2^3 = 648$.

These define the in-plane rules and provide the super tile set.

To connect the $\pm z$ direction, there's one set of rules
that toggle the bit, with carry, for the underlying space configuration.

The top most layer that connects to a boundary tile will only take the maximum bit.

The middle layers will have rules that toggle the middle bit if there's a carry below
it but only allow a matching middle bit to the one above it.

So, from left to right, left being the top most layer:

```
A                   B.0               C.0
1 > 1 < 0           0 > 0 < 1         0c > 1 < 1
    ^                   ^                  ^
    0                   0                  0c

                    B.1               C.1
                    0 > 0c < 1        0c > 0c < 1
                        ^                  ^
                        0                  0
```

Only A, B.0 and C.0 is allowed, since A only allows a downward
connection to the left transition of B.0, and B.0 only allows the left
transition from C.0.

Each of the A, B and C tiles will have connection rules to either
a super tile with a wall at its center or the super tile
that allows the allows the appropriate transition.





