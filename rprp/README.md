Rectangular Partitions of Rectilinear Polygons
===

I'm still trying to make sense of this but I think I might have a basic understanding now.

Consider a rectilinear polygon, $C = (c _ 0, c _ 1, c _ 2, \dots, c _ {n-1}), c _ k \in \mathbb{Z}^2$.

Call the induced *grid* as all intersecting points within the polygon from co-linear boundary edges extended.

That is:

$$
X = \{ x(c _ 0), x(c _ 1), \dots , x(c _ {n-1}) \} \\
Y = \{ y(c _ 0), y(c _ 1), \dots , y(c _ {n-1}) \} \\
G = \{ (x,y) | \forall x,y, x \in X, y \in Y, (x,y) \in \{ \mathsf{interior}(C) \cup \partial(C) \} \}
$$

Where $\mathsf{interior}(C)$ is the interior region of $C$ and $\partial(C)$ is the boundary.

We further label grid points, $p \in G$, as *interior*, *edge*, *indent corner*, *elbow corner* if
point $p$ is completely inside $C$, if it's on the edge of $C$ (only), if it's a reflex/concave edge of $C$ or
if it's a convex edge of $C$, respectively.
Here, "convex" and "concave" are relative to the interior.

A *line segment in/of $G$* is defined by two axis aligned endpoints in $G$.
A *maximal line segment in/of $G$* is a line segment such that has at least one endpoint in $C$, meaning
it has at least one endpoint that is a vertex defined in $C$.

---

From Lemma 5.1 of [Du,Ko,Hu]:

> There exists an optimal rectangular partition of $C$ in which each maximal line segment contains a vertex in $C$.

The proof is relatively straight forward and relies on two facts:

* If an interior line segment (of $G$) weren't maximal, it must have equal number of lines on one side as
  the other, otherwise we could nudge it towards one side and reduce objective function
* If an interior line segment weren't maximal and has equal incident lines on either side, then
  we can nudge it in either direction until it hits another line, reducing objective function

Both of these conditions show that interior (aka non-maximal) line segments can't be optimal.

Since every line is maximal, we have the Lemma.

---

There are only $O(n^2)$ maximal line segments.
Pairs of each of these maximal line segments can be chosen to split the original polygon in two.
A complete split of the polygon means that the two parts of the outer boundary, on a potential subset of $C$,
are contiguous.

On can choose an ordering of partitions such that only contiguous portions of the boundary $C$ are chosen.
Form this judicious ordering of partitions, it's possible to build up optimal solutions to sub partitions,
referenced by their boundary and cutting line segments (potentially not maximal?).
Calculation of sub problems and then re-using those calculations to build answers to optimal partitions
of larger sub-polygons allows for a dynamic programming approach, and thus a polynomial time solution.

The basic unit is the grid point, which informs how to choose the partition.
Choosing the grid point alone doesn't completely describe the partition as there might be some choice as to which
direction the maximal line shoots off from the grid point towards its connecting point on the boundary $C$.
There's only a few choices of directions for corner boundary cuts (4?), so this only acts as a constant factor
inflating the dynamic programming memoize array and doesn't change the order.

There are some further complications if the maximal line is straight, and not a corner, or if a maximal line
cuts off multiple regions (if there are "tabs" coming off the rectilinear polygon that would be cut off by a straight line, say).
These again don't change the order and are only special cases that need to be handled in a reasonable way.

I'm still a little shaky on the runtime and memory foot print as it seems like the basic index is the start and end
of contiguous boundary points on $C$ which would give $O(n^2)$ ($n = |C|$) but I'm surely missing something.

---

My initial implementation is going to be pretty inefficient.

Some terminology:

| Structure | Description |
|---|---|
| `C` | Original list of points describing the rectilinear polygon, in counter clockwise order |
| `Ct` | Matching array of corner types. `c` corner (convex relative inwards), `r` reflex (concave relative inward) |
| `G` | Array of grid points take from intersection of lines drawn out from reflex vertices |
| `Gt` | Matching array of grid point types. `c` original boundary point (corner or reflex), `b` point on boundary edge, `i` interior point |
| `X` | Array of x points from `C` |
| `Y` | Array of y points from `C` |
| `dualG` | 2D array of simple rectangles made of four (virtual) grid points, including inadmissible rectangles. Each entry has fields `ixy` x,y index, `G_idx` grid point index, `id` unique id (-1 if inadmissible), `R` four grid points that make up the dual rectangle |
| `G_idx_bp` | Map of x,y grid points to grid index. Key is comma separated string of x and y coordinates (e.g. `3,5`) |
| `Gv` | 2D array mapping 2D grid index to grid information. Each entry has fields `G_idx` grid index, `xy` two element array grid point, `t` type |
| `Gv_bp` | Map of x,y grid points to grid point index. Key is comma separated string of x and y coordinates (e.g. `3,5`) |
| `G_dual_map` | Map of x,y grid points to x,y index. Key is comma separated string of x and y coordinates (e.g. `3,5`) |

An overview is as follows:

* From `C` Construct the initial structures, most notably the grid points, `G`, and `dualG`
* Walk the boundary of `C`
  - for each reflex vertex, start a line, $L$
  - for each line direction
    + if it's an interior point, start a line, $S$, in the orthogonal direction and walk until a reflex or edge boundary point is hit and
      create two region boundaries, keyed on the list of dual rectangles within it
    + if it's a reflex or edge boundary point, create two region boundaries, keyed on the list of dual rectangles within it
* Once all regions are collected, deduplicate regions, note cost of guillotine or 2-cuts and mark rectangular regions as resolved
* While ...


---

Looks like there is a blog description of the algorithm ([here](https://nanoexplanations.wordpress.com/2011/12/16/polygon-rectangulation-part-3-minimum-length-rectangulation/)).

From the blog:

> Fact: It suffices to consider sub-figures whose boundary consists of a
> contiguous piece of the original boundary and at
> most two contiguous constructed lines.

Where, here, a *figure* is a 2D hole free rectilinear polygon.

We want to create sub-figures from an original figure.
Start with a figure without any constructed lines and consider the following method:

* If $F$ has no constructed lines, choose any vertex of $F$ (choose a **convex** point on the perimeter/boundary)
* If $F$ has a single constructed line (a Guillotine cut), choose either endpoint
  of the constructed line
* If $F$ has two constructed lines (a 2-cut), choose the point where the constructed
  lines meet

Call the candidate point $p _ F$.

For all grid points, consider valid points, $q$, that construct a rectangle entirely within $F$ (rectangle, fully within $F$ that has corners $p _ F$ and $q$).

So the algorithm works recursively on a (sub) region $F$ with a candidation point derived from two, one or none constructed lines passed along with it.
The *none* condition only happens at the root, where an initial point is chosen to kick off the recursion.

For a region $F$ and a candidate point $p _ F$, consider all grid points, $m _ k$, such that $R _ { p _ F, m _ k }$
(the rectangle made by $p _ F$ and $m _ k$) lies completely in $F$.
For each of the candidate points, take a bite out of $F$ with $R _ { p _ F, m _ k }$ and recur, choosing the new candidate
point appropriately (from the 1 or 2-cut partition used to create $R _ { p _ F, m _ k }$) and, when the recursion bubbles
back up, save the minimum value.

When starting from the full region, only one valid candidate point needs to be chosen as we know it has to be part of some minimum
rectangle and we loop through all possible rectangles with the candidate point.
The other points can be argued the same, where we recur/enumerate all possibilities with our subdivision scheme.

A superficial description is that a rectangular piece is chosen, then further rectangular pieces are cut, that share the
same corner as the previous, until the whole cake is removed.
Cutting each piece is only done from the stump of the last one and so keeps the contiguous boundary, eating away at it,
rectangular piece by rectangular piece.
At each step of the recursion, all rectangular pieces are chosen
but since it's only eating away at the boundary from the ends (aka keeping a contiguous boundary),
we know its polynomial time bounded.

It looks like Lingas et al. (and the blog post) suggest ordering by area, but I'm not sure if this is necessary or a "nice to have".
Lingas et al. have various methods to speed up matching point enumeration but these are effectively heuristics without
addressing the overall runtime.
Kim et al. use/refine Lingas et al.s heuristics and maybe give a tighter bound on runtime with it (?) but the "naive" algorithm
of enumerating all valid matching points provides an overall bound of $O(N^4)$.

---

I still don't understand how to implement this.

Here's a review:

* Every maximal cut line must have at least one end anchored on a reflex vertex
  - That is, there exists a minimum ink partition s.t. every maximal cut line has at least one reflex vertex anchor
  - Any maximal cut line that does not end on a reflex vertex is superfluous and can be removed
  - The other end of a maximal cut line can be another cut line, the boundary edge or a reflex vertex
* Every reflex vertex must have at least one cut line emanating from it. In the case of 2-cut lines emanating,
  each must have a reflex vertex at their other end

---

###### 2025-09-10

OK, I think I have a better understanding of how this algorithm works.

Kim, Lee and Ahn is a little terse to read but I think they provide a much clearer view of what's going on.

For a given figure (rectilinear polygon, potentially subdivided from the original), choose an origin point on
the boundary of the figure (details of which point to choose might be important, so more on this later).
This origin point, $\sigma$, must be part of a rectangle, so consider all grid points on the interior of the figure which
we'll call candidate points, $\rho$.

For each candidate point, $\rho$, try to construct a rectangle using $\sigma$ as the origin and $\rho$ as the corner points, where
the rectangle has non-zero area and lies completely inside the figure.
Call it $R _ { \sigma \rho }$.

The rectangle $R _ { \sigma \rho }$ will have some number of edges exposed to the interior of the figure (up to 4 potentially?).
For each of those edges, extend them in the appropriate directions so that they're maximal.
That is, each line has to have at least one endpoint on a reflex vertex, where the reflex vertex is from the original perimeter
of the rectilinear polygon.

The case analysis is going to be a bit hairy but the idea is that the number of combinations of maximal lines is finite.
Each of these choices will partition the sub-figure further, making progress at eating away at the perimeter of the original rectilinear
polygon.

If no rectangle exists with positive area, doesn't lie within the figure or has no choices for maximal edge cuts, reject it.

There's an implicit DP matrix here that has the start and end of the original rectilinear polygon, the grid point of where the
cut is and the choice of the cut lines (where their anchor is).
This gives a hand-waivy $O( N^3 )$ run-time.
I guess the size can be reduced but, at worst, the DP matrix is being filled out.

I don't think the actual choice of origin point matters too much but I think the suggestion is to use the candidate point from
the previous step as the new origin (and choose an arbitrary origin to start).

So, to summarize, choosing an origin point, $\sigma$, must have a rectangle containing it, so we look for all possibilities.
For each rectangle, we make sure to choose maximal cut lines that will reduce the perimeter.
Every rectangle that can't have it's edges extended into a maximal cut is invalid.
Since there must be a rectangle with the origin point and we've enumerated all possibilities of rectangle choices as well as the
choices for maximal cut lines, we've exhausted the possibility space to guarantee a solution.

###### 2025-09-17

From my understanding, the choice of origin point is inconsequential, from a worst case perspective.
The origin point ($\sigma$) might have a practical implication in run time but I don't think it matters
overall.

We might want to make sure to choose it in an ordered way (lex smallest, for example) but I don't think it matters.

The number of possibilities of maximal line segments to choose that will enclose the rectangle $R _ { \sigma \rho }$ is naively
bounded by $3^4 = 81$ (each line can be maximal left, maximal right or maximal both) but this is an overestimate as
there are only two possibilities for maximal line segments that are anchored by the origin point, $\rho$.
This puts the upper bound at 36 ($2^2 3^2 = 36$) and can be further lowered if the rectangle shares one or more edges with the boundary.

###### 2025-09-21

I think I finally understand this now.
There's still some specifics I need to understand but I think I have the basics.

Here is the key fact from the nanoexplantaions blog:

> It suffices to consider a region with an original contiguous boundary segment and at most two contiguous and
> connected constructed lines.

Kim et al. state this as well but not as clearly or explitily.

This leaves out some details, but I think they are:

* Given a region, $Q$, that has a contiguous original boundary and at most two constructed lines
* Consider an origin point $a$
  - If $Q$ is a 2-cut, $a$ is taken to the meeting point of the two constructed lines
  - If $Q$ is a 1-cut, $a$ is taken to be the endpoint of either end of the 1-cut
  - If $Q = P$, $a$ can be taken to be any bend point on the boundary
* Consider a matching point, $b$, in $Q$, such that $R _ { a,b }$ lies completely in $Q$
  - Use the short edges of $R _ {a,b}$ ( *billet* ) to extend its line segments to be maximal
  - This will create a certain number of partitions into sub-regions
  - Reject the matching point $b$, and thus the $R _ {a,b}$, if:
    + Any sub-regions is more than a 2-cut
    + Any sub-regions doesn't have a contiguous outer boundary
    + $R _ {a,b}$ is known to be non-minimal (has floating interior edges, etc)

A lot of the work in various papers goes on to show that only a certain subset of matching points
need to be considered, so the rejection is implicit by only considering known possible matching points
in the first place.

Kim et al. partition into 1, 2C and 2R cases, with 1 further partitioned into 1R and 1C.

For a 2-cut, the two constructed lines will be in-line with some portion of the boundary.
When the constructed lines are extended to include the boundary colinear line, you can then
extrapolate to create a kitty corner $\kappa$ point.

This $\kappa$ point creates a rectangle, $R _ {a, \kappa}$, not necessarily contained in $Q$.

If the two constructed lines create a reflex joint in $Q$, it's called 2R.
If the two constructed lines create an interior convex joint in $Q$, it's called 2C.
If there is only one constructed line, it's called either a 1, 1C or 1R, where 1C is when
it's not 1R and I'm not exactly sure what's considered a 1R.

The overall point is that since we're partitioning regions with only two constructed lines
and contiguous outer boundary, we now have a dynamic programming solution whose indices are the
indices of the contiguous boundary (so, two total) and whether it's interior/exterior (2R,2C,1, etc.).

### 2C

In $Q$, in the case of 2C, if the matching point, $b$, is in quadrent `III` from $R _ {a, \kappa}$
(so diagonal opposite), unless $R _ {a,b}$ shares a non-trivial edge with $Q$, this can never
be the case.
In this case, $R _ {a,b}$ will always have edges that are redundant.

Matching point $b$ can't be in quadrent `I` relative to $R _ {a, \kappa}$ (I believe) as this
would create a larger than 2-cut.

So the matching point, $b$, must be in quadrent `II` or `IV` relative to $R _ {a, \kappa}$.
I'm not sure there's much more optimization that can be done and these are the main areas
where matching points need to be considered.

### 2R

In $Q$, in the case of 2R, the claim is that no matching points $b$ can be within $R _ {a, \kappa}$.
This can be easily seen as any matching point, $b$, that extends the constructed line outward will
have the edge of the constructed rectangle, $R _ {a,b}$, to be redundant/moveable.
The exception is that if the rectangle, $R _ {a,b}$ shares an edge with the boundary $Q$.

Otherwise, any point outside of $R _ {a,\kappa}$ needs to be considered.

### 1

I have to think about this case a bit to see where the candidate point, $a$, can be chosen,
but I think these are simpler cases.

---


###### 2025-09-29

We have some new terms:

* *quarry (rectangle)* - rectangle chosen during the algorithm
  - *adit (vertex)* - $a$ grid vertex of quarry ($a$ grid vertex of rectangle chosen during algorithm)
  - *quarry corner vertex* - any of the four grid point corners that make up the the quarry rectangle
  - *bower vertex* - $b$ grid vertex, kitty corner opposite of $a$ within the (quarry) rectangle
* *billet (edge)* - side of quarry (side rectangle chosen during the algorithm)
* *cleave (line)* - a partition cut starting from a quarry vertex (a cleave must end at the original
  outer boundary) (if there are two cleaves in-line, with a middle billet joining them, it is possibile
  to combine them into a single cut)
* *clean cut* - if a (cleave) cut is a one or 2-cut of the subregion

Overall, we will choose an adit vertex and then choose a bower vertex.

The adit, $a$, and bower, $b$, vertex will create a quarry rectangle, $R _ {a, b}$ with four billet edges.
The billet edges might share none, some or all of their length with a previously constructed cut line
or the original boundary of the rectilinear polygon.

As a first attempt, we assume the adit, $a$, vertex is chosen
and loop through all bower, $b$, vertices to test the following:

* The quarry rectangle, $R _ {a,b}$, is completely in the current region $Q$ with positive area (no degenerate line $(a,b)$)
* there is a choice of cleave lines from the quarry corner vertices that:
  - lie within $Q$ and not just on the edge or outside of it (that is, the direction of the cleave cut shoots into the body of $Q$).
  - isn't redundant by allowing a billet to slide between them
  - creates a one or 2-cut of the subregion

That is, if any cleave line creates a more than 2-cut (three cut or more), it can be rejected.

If a quarry rectangle, $R _ {a,b}$, is chosen, there are four corners to consider, each of which has, at most,
two cleave cuts that can come out of them.
Each cleave cut can exist or not, yielding an upper bound of $2^8$ possible cleave cuts.

Many of these can rejected before hand because the cleave cuts won't be in the considered region, $Q$,
or will be parallel to a neighboring cleave cut, implying a slideable billet.


Here's a first attempt at pseudo-code:

* Given: grid point $a$, region $Q$
* Foreach grid point, $b \in GP(Q)$:
  - if $(a,b)$ colinear, continue
  - if $R _ {a,b} \notin Q$, continue
  - Foreach cleave cut choice, $D = (d _ {\sigma(0)}, d  _ {\sigma(1)} , \dots, d _ {\sigma(k)} )$
    + if any of the cleave cuts start on the boundary of $Q$, continue
    + if any of the cleave start out of $Q$, continue
    + if there are two parallel cleave cuts in $D$, continue
    + if there is a cleave cut that doesn't create a one or 2-cut subregion of $Q$, continue
    + otherwise, recur on each subregion created from the cleave cut(s)

I think the major complexity is figuring out if the cleave cuts partition the subregions cleanly.

---

Thinking out loud:

Some more glossary terms:

* *interleaved boundary points* - grid points on the boundary that aren't part of the original boundary point description
* *primitive boundary points* - original boundary points
* *general boundary points* - all boundary points, including primitive and interleaved boundary points

A note on cleave cuts:

The cleave cut must not extend all the way.
It must go until it hits some boundary then terminate.
There are cases where extending the cleave cut will create a cut prematurely that might not be there.

A simple example is a cleave cut that goes to the left, runs into a border plateau that then goes to a pit then
eventaully terminates at a border.
If the edge of the pit would choose to be open, say with a cut upwards at the pit edge,
this would get missed by prematurely choosing the extended cleave cut.

```

 |   ?           |
 | ? *---*...*---*
 |   |   |   |   

```

The 2-cut property needs to be maintained and terminating the cleave cut at the first border still maintains that.
Whichever subsequent quarry rectangle or cleave cuts chosen will maintain the 2-cut property.

Moving on:

* Given two general boundary points, $p _ s$, $p _ t$, with the assumption that the outer boundary trace
  goes in counter clockwise order
  - call the region under question $Q$
  - The initial choise is on primitive boundary points
* For non colinear $(p _ s, p _ t)$, there are up to two choices for the joining point of the constructed lines
  - 0 index for first, which is lower in y (so lower left or lower right)
  - 1 index for second, which is upper y (upper right or upper left)
* For colinear $(p _ s, p _ t)$, there is a single cut line
* Choose an *adit* grid point, $a$:
  - For non colinear $(p _ s, p _ t)$, we enumerate $a$ at both endpoints of the two choices of where the constructed lines meet 
  - For colinear $(p _ s, p _ t)$, we enumerate two choices of $a$ at either end of the constructed line
  - Choose $a$ to be a primitive boundary point to bootstrap
* From $a$, choose a *bower* point $b$
  - $b$ must be within $Q$
  - The *quarry rectangle*, $R _ {a,b}$, must be wholly in $Q$
  - There are some other optimizations to further restrict $b$ and thus $R _ {a,b}$ which we'll ignore for now
* Call the constructed line(s) (alt. cut lines) $\ell _ h$ for the horizontal and $\ell _ v$ for the vertical, if they exist (one must exist)
* Call the line segments of the quarry rectangle, $R _ {a,b}$ *billets*, labelled $\ell _ 0$ for the bottom, $\ell _ 1$ for the left,
  $\ell _ 2$ for the top and $\ell _ 3$ for the right
  - some or all of the billets will be part of either the outer boundary or the constructed lines $\ell _ h$, $\ell _ v$
* Call the four corners of the quarry rectangle $p _ 0, p _ 1, p _ 2, p _ 3$, representing the lower right, lower left, upper
  left and upper right corners respectively (each of the $p _ 0, p _ 1, p _ 2, p _ 2 \in GP(Q)$)
* For quarry corner $p _ j$, $j \in \{0,1,2,3\}$,  consider potential cleave cuts $d _ {2j}$ and $d _ {2j + 1}$
* Choose all combinations of cleave cuts
  - Create a forced virtual $d _ k$ if its $p _ j$ is on a constructed line edge or a boundary edge (that isn't a corner)
  - In a particular combination, reject the combination if:
    + any $d _ k$ shoots off outside of $Q$
    + any $d _ k$ has a neighbor $d _ {k \pm 1 mod 8}$ parallel and chosen or forced (might need multiple passes)
    + any maximal $d _ k$ lines don't have at least one end on a convex primitive border vertex
  - The above is meant to enumerate all 1-cut or 2-cut scenarios
  - Implicitely, this should not create any 3 (or more) cut partitions but this should be verified
    (the parallel test should take care of it but I'm not confident)
* For each combination, record the rectangle cost, partition the remaining regions and recur
  - extend each cleave cut till the first time it hits the outer boundary (it should be impossible for a cleave cut to hit a constructed line)
  - the first place the cleave cut hits the outer boundary marks the start or end of the 1-cut or 2-cut subregion
  - walk the cleave cut in the opposite direction until it hits another cleave cut or an outer boundary, marking the intersection as the
    new adit point $a'$ for the subregion or as the corresponding start/end of the outer boundary for the new subregion
  - edges of the quarry rectangle need to be walked to see if they slice off any subregions by 1-cuts, adding the subregions to the queue
    with the start and end of the 1-cut slice

For the sake of clarity, the quarry rectangle $R _ {a,b}$ is not part of the 1-cut or 2-cut and is, in some sense,
chosen as the pivot region from where the remaining region is partitioned into 1-cuts or 2-cuts.

Billets will be moveable/redundant if the cleave cut is parallel to an edge or cleave cut not on a corner,
so this is what the parallel test is trying to capture.
If the parallel edge starts on a corner, the billet won't necessarily be redundant, so we need to be careful of this case.

Every adit point, $a$, must be part of a quarry rectangle in the final partition.
So, for example, if we have a 1-cut that has $a$ at one of its corners, there must be a bower point, $b$, that
can be chosen to create the rectangle.
In this case, the bower point, $b$, will be on the outer boundary and three of the the billets will be part of the outer boundary.

---

TODO:

* cadrp:
  - button to load from text input
  - save border draws
  - grab side of polygon to move
  - 1 or 2 cut mode to draw cut lines
  - toggle Q area
  - quarry rectangle select
  - cleave cut cycle
* implementation
* writeup





References
---

* ["Rectangular Partitions of a Rectilinear Polygon" by Kim, Lee, Ahn](https://arxiv.org/pdf/2111.01970)
* ["Minimum Edge Length Partitioning of Rectilinear Polygons" by Lingas, Pinter, Rivest, Shamir](https://people.csail.mit.edu/rivest/pubs/LPRS82.pdf)
* ["Design and Analysis of Approxmiation Algorithms" by Du, Ko, Hu](https://link.springer.com/book/10.1007/978-1-4614-1701-9)
* ["The Structure of Optimal Partitions of Orthogonal Polygons into Fat Rectangles Rectangles" by O'Rourke, Tewari](https://scholarworks.smith.edu/cgi/viewcontent.cgi?article=1200&context=csc_facpubs)
* ["Polygon rectangulation, part 3: Minimum-length rectangulation", Nanoexplanations, blog of Aaron Sterling](https://nanoexplanations.wordpress.com/2011/12/16/polygon-rectangulation-part-3-minimum-length-rectangulation/)


