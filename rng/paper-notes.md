Paper Notes
===

###### 2026-07-07

The goal is a paper artifact for the relative neighborhood graph.

I'm still flailing a little to find a good path forward and stopping point
but this file is for notes relating to the paper artifact.

Here are the basics I would like to see in a paper:

* 2d/3d expected linear time algorithm for relative neighborhood graph
  for points drawn uniformly in the unit square/cube (respectively)
* maximum bounds on RNG neighbors for 2d/3d
  - 2d it's 6
  - 3d it's 12? (13? kissing number?)
* plot of runtimes for N 100, 1k, 10k, 100k, 1M, 10M, 100M, 1B

Stretch goals are:

* 2d/3d addition of bounding box with exclusion zones based on initial
  bounding box
* 2d/3d exclusion zone overlays for arbitrary geometry
* Show how to hook up into space colonization algorithm for (potential) speedup

Voronoi regions are typically used, so this might be more for academic interest than
anything else.

---

I'm decided. The RNG paper should just focus on 3d expected linear time algorithm.

The rest I think can be a paper on its own but:

* I don't want to get bogged down in adding everything when an isolated result is present
* The addons to making it usable in other contexts is a separate idea that maybe deserves its
  own paper
* Using it in the context of space colonization algorithm is, again, maybe another paper or
  a software package that can be focused on

I need to get used to publishing isolated ideas rather than trying to push everything into a
single paper.
