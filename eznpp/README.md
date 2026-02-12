Easy NPP
===

There's some indication that there's no such thing as "easy" number partition problem.

This sub-directory is experimentation for that idea.

These ideas are most likely dead ends but I'd like to experiment with it all the same.

---

The idea explored in `eznpp_modcluster.py` is almost surely doomed to failure.

The idea was to create small groups of numbers within a prime column that could
be enumerated to show that they zero out.
Have enough of these groups and you can define an energy of sorts and try to maximize
the number of clusters that still has a solution.

The problem, I think, is that making progress in any one cluster randomizes everything
else all around it, invalidating any progress.

At some point, it's no better than random chance and just thrashes around.

Choosing coefficients has long range consequences, so that any local progress made
comes at randomizing everything around it.

---


