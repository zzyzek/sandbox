Molotov Markov
===

A Constraint Based Tiling Generation (CBTG) experiment for Mine Sweeper.

Setup
---

Tiles are 3x3 and consist of either an empty space or a mine.
The center token determines if it's a mine or space in the realization.

If the center token is a space,
the number of mines surrounding the center token is taken as the number.

For example, a mine and a `3` tile, respectively:

```
.*.    ..*
**.    *..
**.    ..*
```

Rules are added for the 2x3 or 3x2 overlap window to other tiles.

A special `0` tile ID is used as the border tile and neighbors all
tiles that have a single empty column at the appropriate edge.
All tiles have a +-Z neighbor, as needed from POMS using a 3D grid.

In the POMS config, there is further a `tileGroup` which indicates
how many mines it has.

* 0-8  : center empty, number of mines in the surrounding eight locations
* 9-17 : center mine, number of mines total minus 8
* -1 : border tile (tile ID 0)

When constructing the POMS config JSON file, the `tileGroup` can be used
to filter the appropriate value at the grid location.

Code
---

* `src/mm_gen.js` - create the POMS config file, tileset image and, as of this writing,
  a `mm_mini.0.poms` file to solve the first "Mine Puzzle" from Christian Steinruecken
* `img/mm_flatTileset.png` - flat tileset, used in the above tileset image creation,
  with images for the various states of the board

Discussion
---

* In general, the problem is NP-Complete because enumeration of a given
  state can be hard and computation can be embedded in a configuration
* For the random mine placement, there looks to be a second order phase
  transition, with the critical density at around the 0.2 mark
* State of the art solvers get in the range of 41%-42% success rate for
  16-30-T99 (expert) levels
* It looks like even the best solvers need about 3.3 guesses for the 16-30-T99 (expert)
  levels


Potential Research
---

#### Solver

I don't have any expectation that a CBTG based solver will outperform the state of the art.

One avenue is to create a simulator that generates a random instance, uses the CBTG solver
to guess and have a referee that makes sure the guess was valid.
If the guess hits a mine, the referee restarts with a new instance.

Using some modification of path consistency might be able to find configurations that are tricky
for other solvers but, again, I suspect state of the art solvers can explore this space
faster and with better accuracy than the CBTG solver.

#### Phase Transition

This is probably the more interesting question: Where is the phase transition and can we get
lower bounds on it.

There's a difference between the infinite Mine Sweep game and the finite Mine Sweeper game,
with edge effects being important in the finite case.
The finite size effects might increase the chance of hitting an impenetrable region.

I suspect the probability of hitting an impenetrable regions, either as a boundary around a small
cluster, on the boundary front of a solution or near the edges and corners.

One tactic might be to try and catalogue some of these impenetrable regions, especially near the
edges or corners, with an eye towards how they can be chained.
The chance of these configurations appearing might determine where the phase transition occurs
and can give insight into the number of guesses needed to fully resolve.

The infinite MS has more of a chance of a solution front wrapping around and informing the blockade.
I would be surprised if the character of the phase transition is any different but the critical point
is probably different as the boundary effects have non negligible chance of becoming impenetrable.





References
---

* [puzzle](https://q4.github.io/mines/index.html) ([Christian Steinruecken](https://q4.github.io/index.html))
* [minesweepergame.com](https://minesweepergame.com/websites.php)


LICENSE
---

Unless otherwise indicated, everything in this directory is under a CC0 license.

> To the extent possible under law, the person who associated CC0 with
> this project has waived all copyright and related or neighboring rights
> to this project.
> 
> You should have received a copy of the CC0 legalcode along with this
> work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

Some third party libraries and digital artifacts were used, so please see individual
files for license details.

