Notes
===

| Name | Size | Mine Count | Proportion (Min / (Cell Count)) |
|------|------|------------|------------|
| Beginner | 9x9 | 10 |  0.1 |
| Intermediate | 16x16 | 40 | 0.15625 |
| Expert | 16x30 | 99 | 0.20625 |

Rough Thoughts
---

Here's what I gather to be a rough overview of the problem:

* In general, the problem is NP-Complete because enumeration of a given
  state can be hard and computation can be embedded in a configuration
* For the random mine placement, there looks to be a second order phase
  transition, with the critial density at around the 0.2 mark
* State of the art solvers get in the range of 41%-42% success rate for
  16-30-T99 (expert) levels
* It looks like even the best solvers need about 3.3 guesses for the 16-30-T99 (expert)
  levels

My take on this is that there's effectively a giant connected component region
of no mines.
This giant component means that large regions will be exposed from 0 mine tiles.
The giant component that has constrained regions that might stop progress have
some sort of probability of getting through it, based on the density of mines.

There will be some configurations that, under a random initial seed guess that
opens all or large regions of the giant component, that are impenetrable.
That is, there are small configurations that require guessing.

My bet is that there's probably an expected number of around 3 of these impenetrable
regions.

These impenetrable regions can either be small or along an interface through resolution.
It looks like edge effects are important where the corners and sides provide bounded
regions that are hard to make progress into.
There also looks like a bad initial guess in a small open region might have a high
chance of creating an impenetrable border.

So that means there's a big difference between the finite Mine Sweeper problem
and the infinite Mine Sweeper, with edge effects significantly altering the probability
of success.


References
---

* [puzzle](https://q4.github.io/mines/index.html) ([Christian Steinruecken](https://q4.github.io/index.html))
* [minesweepergame.com](https://minesweepergame.com/websites.php)

