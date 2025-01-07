Sokoita
---

###### 2025-01-06

This is an experiment in creating a Sokoban solver and generation.

As of this writing only solving has been attempted.

This sub directory is a bit messy but the current working prototype is
a "no return" Sokoban tile set.

There are some optimizations and attempts at increasing the power of the solver,
which I'll touch on briefly below, but this method has a major limitation
which prevents it from solving all but the simplest of levels.

The local consistency property of the constraint based tiling generation
approach means that it can get trapped in local minima when attempting to
find a solution without a good hope of making it out.

Glossary
---

| Term/Acronym | Name | Description |
|---|---|---|
| cell | A grid cell | A grid cell position in a rectangular cuboid region |
| tile | A tile value | The values, or domain, available at each cell |
| CBTG | Constraint Based Tiling Generation | A CSP restricted to the grid, with homogeneous domain for each cell and a constraint in each dimension direction |
| block | A rectangular cuboid region in the grid | |
| AC | Arc consistency | Each tile located in a cell has at least one valid support in each dimension direction |
| AC3 | Arc Consistency 3 (algorithm) | |
| AC4 | Arc Consistency 4 (algorithm) | |
| PC | Path Consistency | For variables (cells) $A,B,C$, for each combination of values for $A,C$, $B$ has support |
| PCR | Path Consistency Region | For a (contiguous) region of cells, every tile has at least one configuration that it's part of |
| PCRKO | Path Consistency Region Knockout (algorithm) | See below |

Problem Setup
---

### Rule Creation

There are 10 basic tile types (` _ <space> # . $ * @ + x X`) representing the boundary tile,
empty (movable) space, wall, goal, crate, crate on goal, agent, agent on goal, no return, and no return on goal respectively.

The no-return code is an extra token placed behind a non-push agent move.
Should the agent push a crate, an empty space will be left behind, allowing the agent to immediately
turn around after a successful crate push move.

The no-return code is there to try and help agent moves and reduce the chance of agent "ping-ponging" back and forth
between adjacent tiles.
For corridors, this will force an agent to go to the end.

In an optimal solution, there should be no repeated game state, so the no-return code is there to help mitigate
repeated game states that might occur.

From these basic tile types, a super tile is created in a cross pattern.
For example:

```
  .
 #@$
  x
```

Would represent an agent at the center, a wall to the agents left, a crate on the right, a goal
above and a no-return on an empty space below.

Each super tile is created and checked for validity to make sure at most one agent is present, that
the no-return code and/or push move is valid, etc.

From the library of super tiles, neighbor super tiles are matched in the spatial $(x,y)$ and a rule
is created.
A rule is created in the $z$ direction if a valid transition occurs (agent move, agent push crate move,
etc.), with the $z$ dimension acting as the effective time dimension.

### Initial Setup

To solve a level, an `XSB` file is loaded in and constraints are added which remove all but the
appropriate wall, agent, crate and goal super tiles at the various initial positions ($z=0$).
The last $z$ position has all "transitional" super tiles removed, only keeping crates on goals.

Optimizations
---

As of this writing, the major optimization that's done is the path consistency region knockout
(PCRKO) (called `knockout_npath_consistency_opt` in `sokoita_poms.cpp`).

The PCRKO proceeds by choosing a rectangular cuboid region, choosing a schedule of traversal,
and iterating through all tiles within the cuboid region.
If and only if all solutions are enumerated in a PCRKO, any tiles that had no support can be
removed (knocked out).

Naively, the PCRKO would be a combinatorial explosion, but for many regions, the tiles are highly
correlated, allowing for early termination of search.
A schedule is chosen to traverse the block.
At each cell location, the tiles are enumerated, checking to make sure they have a valid connection
to previously chosen tiles.

If the cell tile choice gets to the end of the block, a support count for each tile in the current
path is incremented and the rest of the search space is recursively enumerated.
If there is a contradiction, the next tile is chosen.

If a tile choice at a particular cell location within the PCRKO block has a contradiction, we know
no further search needs to be done.

To prevent intractable enumeration, a permutation threshold is set to exit the PCRKO loop.
In such a case, the full enumeration wasn't fulfilled and no statement about tile support can
be made, so no tiles can be knocked out.

Pseudo code for PCRKO:

```

pcrko_r( idx, path, support, block, sched, cur_threshold, max_threshold ):
  foreach tile at block[ sched[idx] ]:
    cur_threshold++
    if (cur_threshold >= max_threshold):
      return -1
    path[idx] = tile
    if ! (tile AC with all tiles with lower schedule in path):
      continue
    if idx == (|block| - 1):
      increment support for each tile in path
    else:
      dt = pcrko_r( idx+1, path, support, block, sched, cur_threshold, max_threshold )
      if (dt < 0): return dt
      cur_threshold += dt
  return cur_threshold


PCRKO( block, sched, max_threshold ):
  init support block (array of arrays, with integer count for each tile in block) = {0}
  path = [ -1, -1, ... , -1 ]
  dt = pcrko_r( 0, path, support, block, sched, 0, max_threshold)
  Q = []
  if (dt >= 0):
    foreach zero valued (cell,tile) pair in support:
      Q.push( (cell,tile) )
  return Q
 
```

PCRKO is effectively a straight forward deterministic enumeration of a small region
to determine which tiles have no support.

The above is a simplified recursive function.
The PCRKO function in `sokoita_poms.cpp` is an iterative approach, keeping
a vector of tile indices and jumping back to the appropriate position
should overflow occur.

The current implementation uses a Gilbert curve as the enumeration schedule, with
the hope being that the "wrinkles" provide a good chance of mixing the path
neighbors together and increases the chance of a contradiction, should they be present.

A "zigzag" curve is also available but not currently enabled.
It's unclear how much extra power the Gilbert curve provides and this would
need to be (or should be) validated in future work.

Currently, the PCRKO is run progressively on blocks of increasing size from `(2x2x1)` to
`(5x5x5)` with a threshold ranging from 10k to 100k.
As a point of observation, the `(3x3x2)` block seems to provide the highest knockout count.

With PCRKO, Sokoita is able to solve the Microban 1-5 levels, as well as the validation
levels.

The current implementation fails to find solutions for Microban 6.

Limitations
---

The current barrier preventing progress is that the agent gets a
doppelganger at the end of the grid, locking the latter half of the potential solution
in an invalid state that's too far from the frustrated region.
The doppelganger spawns out of the frustrated region, with the frustrated region
providing a buffer from the $z=0$ initial constraint that forces a single agent.

The optimizations allow for local solution solving and a small region of consistency
but has a limited range, preventing any idea of long range planning.

From the problem setup, there is no intrinsic reason why doppelganger agents can't appear.
The initial condition at $z=0$, with a singe agent is the initial condition, forces
a single agent for any solution.
The doppelganger appears at the end precisely
because the $z=0$ stage is too far removed from the end, allowing the frustrated
region to spawn spurious agents.

In general, there's no intrinsic property of the CBTG setup that allows for long
range planning, and I believe this is a fundamental limitation of this approach.


Future Ideas
---

* Enforce an extrinsic "unique player" constraint, noticing if a cell has an agent fully resolved and
  knocking out any agent tiles too far away from the resolved cell (difficulty=easy, priority=high)
* Allow for a non-block but contiguous path consistency region, trying to skirt along the edge
  of some highly entropic region (difficulty=medium, priority=medium)
* Allow an extrinsic additional CBTG instance with a 'distance field' (Dijkstra map, distance map) that
  enforces unique agent and can potentially used for other heuristics in the future (difficulty=high, priority=low)

TODO
---

* Implement a doppelganger knockout when an agent is realized in an $(x,y)$ plane.
* Consider doing a non block PCRKO, choosing 
* Visualization of knockout locations

LICENSE
---

CC0

To the extent possible under law, the person who associated CC0 with
this project has waived all copyright and related or neighboring rights
to this project.

You should have received a copy of the CC0 legalcode along with this
work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.


References
---

* [wikipedia](https://en.wikipedia.org/wiki/Sokoban)
* [sokoban levels chipwiki](https://wiki.bitbusters.club/index.php?title=Sokoban_level&mobileaction=toggle_view_desktop)
* [rolling stone solver](https://webdocs.cs.ualberta.ca/~games/Sokoban/)
* [boxoban levels](https://github.com/google-deepmind/boxoban-levels )
* [sneezingtiger](http://sneezingtiger.com/sokoban/index.html)
* [YASS](https://github.com/joriswit/YASS) ([wiki](http://www.sokobano.de/wiki/index.php?title=Sokoban_solver_%22scribbles%22_by_Brian_Damgaard_about_the_YASS_solver))
* [sokosolution](http://sokobano.de/wiki/index.php?title=Sokoban_solver_%22scribbles%22_by_Florent_Diedler_about_the_Sokolution_solver)
* [cstheory](https://cs.stackexchange.com/questions/109807/multi-agent-sokoban-solvers-state-of-the-art)
* [nethack sokoban](https://nethackwiki.com/wiki/Sokoban_Level_3a)
* [XSokoban](https://www.cs.cornell.edu/andru/xsokoban.html)
* [Skinner microban](https://www.sokobanonline.com/play/web-archive/david-w-skinner/microban)
* [Virkkala Sokoban Master's Thesis](https://weetu.net/Timo-Virkkala-Solving-Sokoban-Masters-Thesis.pdf)
* [David W. Skinner](http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm)
* [sokoban-maps (gh)](https://github.com/begoon/sokoban-maps)
* [arduboy tiny sokoban](https://github.com/akkera102/05_tiny_sokoban)
* [sokoban wiki](http://sokobano.de/wiki/index.php?title=Main_Page)
* [game-sokoban.com](http://www.game-sokoban.com/index.php?mode=about)
* [github.com/dangarfield/sokoban-solver](https://github.com/dangarfield/sokoban-solver)
* [github.com/KnightofLuna/sokoban-solver](https://github.com/KnightofLuna/sokoban-solver)
* [github.com/csdankim/MCTS_Sokoban](https://github.com/csdankim/MCTS_Sokoban)
* [github.com/xbandrade/sokoban-solver-generator](https://github.com/xbandrade/sokoban-solver-generator)
