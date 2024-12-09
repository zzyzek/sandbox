Notes
===

###### 2024-12-09

Notes on setup and implementation:

* The problem setup looks to be working and POMS (BMS really) works on solving at least
  some trivially solveable cases
* The overlap supertile is in a cross pattern (3x1, 1x3)
  - using a 2x2 supertile window allows player agents to be created spontaneously (as well as crates?)
  - the 5 tiles in the cross supertile provide enough to keep the conservation of crates an agents
    and the 9370 unique tiles is manageable enough
* Groups in the POMS config file are labelled as:
  - 0: default (shouldn't appear except for the boundary 0 tile)
  - 1: transitional, tiles that can't appear in an end configuration
  - 2: goal, supertiles that have at least one storage tile which all must be occupied by crates
  - 3: trap, a simple deadlock configuration (crate at center with walls in an L configuration)
* Z is the 'time' direction, with X/Y being the spatial dimensions
* The problem is setup so that an initial configuration is forced for Z=0 and other restrictions:
  - remove 0 boundary tile everywhere
  - remove trap deadlock tiles as we know they can't occur in a solution
  - remove transition tiles from last Z position
  - remove transitional tiles from last Z position
  - this should only allow goal tiles and non trap, non transitional tiles, forcing a solution
    at Z=T
* Name in POMS file has encoded tile, 5 characters long with each character code meaning (following xsb format):
  - '\_'   boundary tile (not an XSB code)
  - ' '   empty/moveable tile
  - '#'   wall tile
  - '.'   goal/storage/platform tile
  - '$'   crate tile
  - '\*'   crate on storage tile
  - '+'   player on storage tile
* `sokoita_rulegen.js` assumes a normalized XSB format with no spaces on the outside
  - calculated by flood filling interior (player starting point) with wall and subtracting the flooded from
    the original
* Summary
  - 9,370 unique tiles (including traps)
  - 8,903,224 rules
* `sokoita_rulegen.js` has options for tile weighting to try and attenuate the player tile (custom weightings)
* `bakaban`, `validation1` seem to work as expected, `validation1` works but takes a while, `xsokoban90.1` just churns
  without finding a solution


Notes on failure of solution:

* During solving, the end configuration often 'clones' the player, so multiple agents are running around in the end
  configuration
  - A frustrated region can 'emit' players, and I think this is why they appear in the first place
  - I imagine this could happen for crates as well, though I haven't directly noticed this
  - Tried to mitigate with player probability attenuation
* When getting to critical regions where progress needs to be done, it's highly frustrated
  - I suspect this acts as a kind of 'negative pressure' for the region, biasing agent meandering because it can
    locally resolve

In my opinion, the failure of this naive method highlight the shortcomings of the constraint based tiling generation (CBTG)
methods.

There's almost a requirement that some type of global information or planning is needed, so the locality of the CBTG method
is doomed to churn in a local energy minima.

Biasing a wave front that starts at Z/T=0 onwards runs the risk of making a big mistake early on that won't be recoverable from.

Providing (spatially/temporal) global constraints might help, like disallowing repeated states or forcing crate and player
counts on fully resolved regions, but this doesn't address the core issue of 'planning'.

The central idea of why this method had any hope of working was that solutions could be found via stochastic moves of the player,
avoiding (local) pitfalls.

So, some things to try:

* provide global checks to allow for early backtracking when:
  - there's a repeated state
  - there's a crate or player count violation
* provide facilities to automatically deduce higher order deadlock prevention

Ideally, we could deduce features about the problem from just the rule set (for the more general problem) but I'm having trouble
seeing how to do this in any reliable, efficient or general way.



