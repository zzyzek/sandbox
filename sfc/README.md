Space Filling Curves
===

Peano-like Curves
---

The 3x3 base point template, that starts in the lower left and ends in the upper right,
has some two choices in how the 'S-curve' is oriented (right to start or up to start).

This gives a base $2^9 = 512$ raw number of distinct curves.
Apparently, $2^4 \cdot 2 = 32$ are palindromes and the remaining $512 - 32 = 480$
have central symmetry, yielding only $272$ distinct Peaon-like curves.


Stability Experiments
---

I think "stability" is synonymous with "continuity" but stability is more indicative of what's going on.

We want to make sure that for some progression of curve families, things settle down so that a point
on the curve maps to a converging point in the domain (2d or 3d).
The Hilbert curve has this, so the Gilbert curve should have this too.

One problem is that if the Gilbert curve is right on the cusp of doing an eccentric split, the
points won't be stable.
Another is that, at least as outlined in the current paper, the 3d Gilbert curve is not stable
at all as it's dependent on the low order parity bits.

For the 2d Gilbert curve, the eccentric splits only happen on the "high order" bits, so after a certain
point, things should settle down and converge.

Consider a Gilbert curve with height, $h$, as a free parameter for a given ratio, $\nu$, such
that the width, $w = \nu h$.
Since the 2d Gilbert curves converge, we can ask two basic questions:

* For a fixed $\nu$ (maybe within the range of $\frac{3}{4} < \nu < \frac{3}{2}$), is the Gilbert curve
  stable and, if so, how quickly
* For two Gilbert curves, with $\nu _ 0$ and $\nu _ 1$ respectively, are they stable with respect to each
  other and, if so, how quickly do they converge

For the first question, some limited experiments on my part would indicate yes and the exponent is $1/2$.
That is, as $h$ increases (linearly) the error between successive curves drops as $\frac{1}{x^{1/2}}$.

For the second question, this is a little more complicated and I'm running some experiments to see
what that looks like.

### Details

Some scripts of relevance:

* `stability.js` that runs the experiments, generating two Gilbert curves and outputs their difference
* `mean-discrepency.sh` uses datamash on the generated output files from `stability.js` to find the average error/distance
  for the curve comparison run
* `dhmviz.py` (differential heat map viz) that makes an animation of the differences from `stability.js`
* `simple-regression.py` calculates the coefficient and exponent from `mean-discrepency.sh`

As of this writing, all these scripts have input files and directories hard coded, as I'm still in the middle of trying
to figure out an experiment schedule.

A note on calculating the difference: This is done for successive Gilbert curve realizations. So 128 is compared with 129,
129 with 130, and so on.
I was comparing with the base 128 all the way up to 1024 but the discrepency was pretty chaotic.

The artifacts that I would like to create to tell the narrative are:

* An animation of $\nu = 1$ for $h = (128, \dots, 1024)$
* A plot of the mean discrepency for the above ( $\nu = 1$, $h = (128, \dots, 1024)$ ) along with a curve chosen from `simple-regression.py`
* A heatmap with $\nu _ 0$ on the x-axis, $\nu _ 1$ on the y-axis and the exponent from `simple-regression.py` on the z-axis

Note that the range of $3/4$ was chosen as that's the width fraction that will cause an eccentric split after the first subdivision
and $3/2$ causes an eccentric split outright.
  

Harmony
---

The idea with the eccentric splits is that they promote harmony.

| |
|---|
| ![harmony example](harmonious_example.svg) |

In the figure, the diagram shows a potential split of the Gilbert curve vs. a straight subdivision
if the width is smaller than 3/4 of the height, say.
The top figure shows how the Gilbert curve makes a more harmonious split by reducing the average defect.
The bottom split uses a simple subdivision which could promote longer rectangles instead of trying to make
them more square like.


References
---

* [Peano](https://www.cut-the-knot.org/Curriculum/Geometry/Peano.shtml#number) ([All Peano Curves](https://www.cut-the-knot.org/Curriculum/Geometry/PeanoComplete.shtml))
* [The Performance of Space-Filling Curves for Dimension Reduction](https://people.csail.mit.edu/jaffer/CNS/PSFCDR)
* [coherence](https://www.sciencedirect.com/science/article/abs/pii/B9780080507545500189)
* [3d Hilbert curve without double length edges (SO)](https://math.stackexchange.com/questions/2411867/3d-hilbert-curve-without-double-length-edges)
