s-t Hamiltonian Path Notes
===

###### 2025-07-09

Finding Hamiltonian cycles in solid grid graphs (and quad-quad graphs) is polynomial time solvable [10.1109/SFCS.1997.646138](https://ieeexplore.ieee.org/document/646138).

I'm still working through the algorithm but the idea is to start from a list of disjoint cycles in the solid grid graph (called a 2-factor),
then progressively merge until a full cycle is created or no more progress can be made.

The Umans and Lenhart paper glosses over the details of finding the initial 2-factor.
Umans bachelors thesis goes into more detail and here are some notes on that process.

Umans provides two ways to find an initial 2-factor.
The first is to create a linear programming problem with each edge assigned to a variable, $x _ i \in E(G)$ ($n = |E(G)|$)  with $0 \le x _ i \le 1$ for all $0 \le i < n$.
The objective function attempts to maximize the number of edges subject to the degree requirement, for each $x _ i$, $\sum _ {x _ i \in E(G)} x _ i \le 2$.

The maximum value of this LP problem happens to be integral and I guess Bridgeman's bachelors thesis provides more detail on proof of correctness.

Uman goes on to create a perfect edge matching construction to find the 2-factor.

An edge matching on a graph $G$ is an edge partition such that every vertex is included exactly once for one of the edge partitions.
A perfect edge matching is an edge matching that contains the largets possilbe $|E(G)|/2$ edges (which is only possible for even number of vertices).


Uman's construction essentially adds a widget that forces degree two at each vertex and then uses standard methods (Ford Fulkerson, etc.) to find
a perfect matching.

Call the original (solid, grid) graph $G$ and the induced graph $G ^ { * }$.
For all $u _ k \in G$, create a new vertex  $v _ k \in G ^ { * }$  create two new vertices per edge, $v _ { u _ k , u _ j}, v _ { u _ j, u _ k } \in G ^ { * }$
for all $(u _ k, u _ j) \in G$.
Create edges $(v _ k, v _ { u _ k, u _ j })$, $(v _ j, v _ {u _ j, u _ k})$ and $( v _ { u _ k, u _ j }, v _ {u _ j, u _ k} )$.

Introduce one more vertex per $w _ k$ and connect $w _ k$ to all neighbors of $v _ k$ (so each $w _ k$ will have maximum degree 4).

A perfect matching on these widgets in $G ^ { * }$ force each vertex to have degree 2 in the original graph $G$.

This graphic might be helpful:

![uman 2-factor widget](viz/uman_2factor_widget.png)

Where the circle on the left represents the original vertex ($u _ k$) and the widget on the right represents the transformation,
with the circle going the newly created $v _ k$, the squares being the $v _ { u _ k, u _ j}$ and the triangle being the extra $w _ k$ vertex.

A moments reflection will show that any perfect edge matching forces exactly two of the $v _ { u _ k, u _ j }$ to have edges that connect
to a vertex induced from the original neighbor graph, with $w _ k$ absorbing the perfect matching edges for the other two induced edges
not used.
It's complicated to describe but the idea is that the perfect edge matching induces a 2-factor encoded in the induced graph edge matching
and that's easily recoverable into the original desired 2-factor.

To find a perfect edge matching, as mentioned above, LP can be used. Another option is to do max-flow-min-cut (Ford Fulkerson)
since the induced graph ($G ^ { * }$ is bipartite.
Quickly, put weights $1$ on each edge, push one partition of the bipartite to the left, the other to the right and connect a source node
to all left nodes and a sink node to all right nodes with each new edge weighted $1$ then use max-flow min-cut to find the flow.
All interior edges that have a flow imply an edge between the vertices.

FF does an augmenting path in $O(E)$ and makes at least $1$ unit of progress.
There are $O(V)$ vertices, so $O(V)$ maximum flow, yielding $O(V E)$.

---

Once an initial 2-factor is found, Uman's algorithm proceeds to merge paths.

Some preliminaries:

Consider a 2-factor (Fig. 2):

```
     *---*---*---*---* . *---*---*
     |   '   '   '   |III*   '   |
     *---* . *---*---* . *---* . *
     ' II|   | II.III.IV '   |   |
 *---* . *---* . *---* . *---* . *
 |   | II. I ' II|   |III|   '   |
 * . *---* . *---* . * . *---*---*
 |   '   |   |   '   |
 *---* . *---* . *---*
     |   '   '   |
     *---*---*---*

```

All cells labelled `I`, `II`, `III` and `IV` are called *boundary cells*.
I think the idea is that the 2-factor separates 'interior' and 'exterior'
and boundary cells lay on the 'outside' of the enclosed cycle regions.

With this construction, there can be paths within paths that aren't technically
on the 'outside', so I'm not sure if boundary cells are defined in terms of inside/outside
parity or whether they really are supposed to be inside/outside.

Section 2 offers some clarity:

* $F$ is a (given, fixed) 2-factor of $G$
  with an implied graph, where the concept of a 2-factor and the graph from it
  are used pretty much interchangeably in the paper ($F \subseteq G$),
* a *cell* is a unit square in $G$ (four vertices, four edges) (note that $G$ is the full
  grid graph, so $G$ is the 'background' (subset of) the integral lattice)
* a *border* is a [cut](https://en.wikipedia.org/wiki/Cut_(graph_theory)) into $(S, V(G) - S)$
  - $S$ is connected (if $u,v \in G, S, (u,v) \in E(G) \to (u,v) \in E(S)$) ($S$ [node-induced subgraph](https://en.wikipedia.org/wiki/Induced_subgraph))
  - $V(G)-S$ is connected
  - no edge of $F$ crosses the cut
* a *boundary cell* is a cell that has an edge that crosses a *border*
* For graph $F$ and graph $C$, $F \oplus C$ is the `xor` of the two,
  adding an edge if it exists in exactly one of $F$ or $C$ and removing it otherwise.
  - Also called *flipping*
* an *alternating cycle* is a cycle/loop through $G$ that alternates being in $F$ and not in $F$
  (not necessarily vertex distinct?)
* an *alternating strip* is a row or column of cells in $G$ that have an alternating odd or even
  alternating strip pattern in $F$


The odd and even alternating strip patterns look like:

```

  * . *                                  * . *---*
  |   |                                  |   '   '
  * . *                                  * . *---*

  * . *---* . *                          * . *---* . *---*
  |   '   |   |                          |   '   |   '   '
  * . *---* . *                          * . *---* . *---*

  * . *---* . *---* . *                  * . *---* . *---* . *---*
  |   '   |   '   |   |                  |   '   |   '   |   '   '
  * . *---* . *---* . *                  * . *---* . *---* . *---*

```

Where the pattern can be inferred from the above to continue indefinitely.


I'm still working through this but it looks like it looks for odd and even $1 \times k$ cells (called "odd/even alternating strips")
whose outer boundary edges can be 'flipped'.
The flipping either merges cycles or puts the resulting flipped graph into a state where a next flip can
merge cycles.

Observation 1:

> Flipping a type `III` boundary cell reduces the number of $F$ components by 1

If the cell is of type `III`, the opposite edges lay on two distinct cycle paths.
Flipping the edges in a type `III` opens the sides of the two paths and joins them,
reducing the number of cycles by 1.

Lemma 2:

> Flipping the last two cells of an odd alternating strip of length at least three leaves the
> number of components in the 2-factor unchanged.

If the two paths are distinct, the rightmost flip joins them, the next flip separates them.
If the two paths are the same, the rightmost flip separates them, the next flip joins them.

Lemma 3:

> Let $s$ be an alternating strip that begins on a boundary cell.
> If $s$ is odd, the number of 2-factor components is reduced by one.
> If $s$ is even and does not end on a boundary cell, the number of 2-factor
> components remains the same.

For the odd case, by Lemma 2 and induction, cells flipped from the end to the beginning
leave the count unchanged.
The first cell is now a type `III` and, by construction, on the border, reducing the 2-factor
component count by 1.

For the even case, the rightmost flip increases the 2-factor component count by 1 since,
by construction, it's not on the border (note: the cut could weave horizontially through
the last cell).
The remainder of the strip is now odd, reducing the 2-factor component count by 1, leaving
the total component count unchanged.

---

It looks like the general strategy is:

* If $G$ is Hamiltonian, it must contain an alternating strip
* The strip might be even, in which case flipping it will not improve
  the 2-factor component count
* *but* after flipping an even alternating strip, an odd alternating strip
  might appear, which we can then use to make progress

The tactic will be to try and choose a sequence of even alternating strip choices
that remains polynomial time bounded until we can make progress or we prove
we can't make any more progress.

This also answers a question I had in that the "stable" state is when there's a
full Hamiltonian tour where, presumably, we only have a choice of even alternating
strips to choose from.
(note to self: see if even alternating strip flips give an MCMC to sample Hamiltonian
cycles in solid grid graphs).

To that end, they define:

* An *alternating strip sequence* is either:
  - An odd alternating strip
  - A sequence of alternating strip sequences $(s, a _ 0, a _ 1, \dots, a _ {n-1})$, where:
    + $G$ contain no type `III` boundary cells
    + $s$ is an even alternating strip sequence in $G$
    + $a _ 0$ begins on a boundary cell from $F \oplus s$

That is, an alternating strip sequence is a odd alternating strip preceeded by all even alternating strips,
where the alternating strip element works on the graph after the alternating strip has been applied to it
and all but the last alternating strip sequence element work on a graph without a type `III` boundary cell.

It's a clunky way of saying apply even alternating strip flips until you can get to an odd alternatip strip flip.

When said this way, Lemma 4 is probably obvious:

> Applying an alternating strip sequence reduces the 2-factor component count by one

Flipping even alternating strips does nothing for the 2-factor component count and
the last odd alternating strip reduces it by one.

This case of even alternating strip ending on a boundary cell
is precluded since that would mean the existence of a type `III`
which, by construction, doesn't exist.

---

Here's a quick recap of where we are and where we're going:

* We can find an initial 2-factor of the solid grid graph $G$ by using max-flow min-cut on the transformed
  graph $G ^ { * }$
* From the 2-factor, we progressively find alternating strip sequences to make progress in merging
  cycles in the 2-factor to try and get to a single giant cycle (try to keep reducing the 2-factor component count)
  - Look for type `III` boundary cells and, if found, flip them (reducing the component count)
  - If no type `III` boundary cells exist, look for a sequence of even alternating strip sequences to land
    into an odd alternating strip sequence

What's still needed:

* Prove that, if $G$ is Hamiltonian, an alternating strip sequence always exists (implying we can make progress)
* Prove that we can always find an alternating strip sequence in polynomial time
* Prove that we can detect if $G$ is not Hamiltonian in polynomial time

---

Their Theorem 5:

> If $G$ is Hamiltonian with $F$ a 2-factor of $G$, then $F$ contains an alternating strip sequence


It looks like their strategy is to show that the meta-graph of 2-factors is connected, allowing
for transitions from one 2-factor representation to another.

They introduce a dependency graph to help facilitate the proof.





###### 2025-07-04

Bug has been fixed.

There's a lot of superfluous calculation in terms of testing whether edges are near
each other but hopefully this should generalize to arbitrary 2d sheets embedded in higher dimensions.

I started looking into the polynomial time algorithm for solid grid graphs by Umans and Lenhart.
It looks like the basic idea is to create a bunch of disparite cycles in different regions and then
do local moves to join them.

There's something about finding runs "strip sequences" that I don't quite understand.
I guess the idea is to choose which strip sequences to flip so that some type of progress is
always being made.

###### 2025-07-03

My strip function is wrong. Consider the following examples:


```
 . . . . .      s t

 s . . . t      . .

 . . . . .      . .

 . . . . .      . .
 

 *_. ._._.      s t
   | |   |      | |
 s ._. t_.      . .
 |              | |
 . *_._._.      . .
 |       |      | |
 ._._._._.      ._.

```

Where the `*` show the bug.

Here, I call the $R$ region the larger rectangle (here $5 \times 4$ and $2 \times 4$ resp.)
with an $S$, $T$ split, with $s,t \in T$ ( $T = R-S$ in the paper) and $S = R-T$ .

For the left graph, the initial edge from $s$ has to go up
but the $S$ region for the split has been chosen so it joins
directly to $s$.

Joining to $s$ (or $t$) directly to the adjoining region is, in general, fine, as can be seen by the right graph.

From Itai etal, I believe the issue is choosing a $(p,q)$ edge in the $S$ region that has a matching parallel
line in $T$.
For the $5 \times 4$ rectangle above, the $T$ region doesn't have such an edge, which is why we get the bug.

For any stripped region, the start and end points are always going to be adjacent, so this means that
every strip is essentially finding a Hamiltonian cycle, not just a path.
So maybe a better way to is to store that information (path vs. cycle) and when merging a cycle to a path,
or just when merging two strips together, keep in mind which one is the cycle and only splice in the path
when we know we have a parallel $(p,q)$ edge.

---






References
===

* [The Open Problems Project: Problem 54: Traveling Salesman Problem in Solid Grid Graphs](https://topp.openproblem.net/p54)
* [github/whatsacomputertho/grid-solver: Problem Specification](https://github.com/whatsacomputertho/grid-solver/blob/main/doc/problem-specification.md)
* [Hamiltonian Cycles in Rectangular Grid Graphs](https://medium.com/@pascal.sommer.ch/generating-hamiltonian-cycles-in-rectangular-grid-graphs-316c94ecefe0)


