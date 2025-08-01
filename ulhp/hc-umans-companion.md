Umans Hamiltonian Cycle in Solid Grid Graphs Companion
===

I'm trying to work through Umans (and Lenhart's) HC thesis and paper.

### Glossary


| Term | Description | Notes |
|---|---|---|
| **Grid Graph** | Graph (finite) whose vertices lie on integer coordinates | |
| **Solid Grid Graph** | A grid graph without holes | |
| **2-factor** | A spanning subgraph of $G$ where all vertices have degree 2 | 2-factor *of* $G$. Disjoint cycles in a (solid) grid graph $G$. |
| $G _ F$ | $F$ is a 2-factor of $G$ with edge parities assigned to whether the edge appears in $F$ or not | Graph version of $F$ with edge parities matching $F$  in $G$ |
| $G _ a \oplus G _ b$ | Symmetric difference ($\oplus$). Edge if exactly one edge in $G _ a$ or $G _ b$ | Also called "flipping" (esp. w.r.t. a cycle or path). Essentially the `xor` operation on graph edges. |
| **Alternating cycle** | A cycle in $G _ F$ whose edges alternate parity | Flipping alternating cycles keeps 2-factor property |
| **Cell** | A four edge cycle in $G _ F$ | |
| **Alternating Cell** | If the cell cycle is an alternating cycle, it's called an alternating cell | |
| **Area** | of cycle $C$ is the number of interior cells of $C$ | |
| **Nested** | Two edge-disjoint cycles are nested if one is entirely in the other | |
| **Intersect** | Two edge-disjoint cycles intersect if they share at least one interior cell | They must share vertices but do not share edges |
| $G ^ { * }$ | The dual of $G$ (a vertex in $G ^ { * }$ per cell in $G$, an edge in $G ^ { * }$ for adjacent cells in $G$) | |
| $G ^ { + } _ F$ | The dependency graph | Add a border of vertices, see below |
| $G ^ { - } _ F$ | Dual of $G$ with no edge present in $G ^ { - } _ F$ if neighboring cells have an edge in $F$ | $G ^ { * }$ with edges removed that cross $F$ |
| **Border cell** | w.r.t. to $G _ F$. A cell bordering different components (of $F$) | Type `I`, `II`, `III`, `IV`, see below |
| **Boundary** | Set of border cells that is a simple cycle or has endpoints on the outer face | Whether a string of border cells completely encloses a region in $F$. Type `IV` cells on boundary implies a type `III` neighbor (otherwise its an internal `+` region) |
| **Alternating Strip** | An array of cells, starting with a type `I` and ending with a type `III` (odd) or type `IV` then (rotated) type `III` (even) (with 'C' cells in between) | See below |
| **Alternating Strip Sequence** | An array of alternating strips | |
| **Static Alternating Strip Sequence** | An alternating strip sequence but with extra criteria that makes finding them polynomial | See below |

Proof of correctness is complicated, as is the main algorithm itself, but I hope giving the algorithm first will motivate the proofs of correctness.

As far as I can tell, the algorithm is as follows:

* start from a 2-factor
* do:
  - find all simple alternating strips and record length
  - find all chained alternating strips and record length
  - for all simple and chained alternating strips, $a$, of even length:
    + find the shortest path, $p$, through $G ^ { - } _ F$ between side cells at the end of the strip $a$
    + record any beginning cells that $p$ passes through (linking step)
    + simple and alternating strips are connected via the linking step in a (potentially implicit) graph
      by which paths, $p$, pass through the beginning of other alternating strips
  - find the shortest path through the connection graph, weighting transitions by the length of the strip
* while (there's an odd alternating strip somewhere)

The shortest path gives an alternating strip sequence, where each element in the sequence is an alternating strip.
The alternating strip sequence is then used to flip the appropriate cells/edges to make progress.

Proof of correctness that an odd alternating strip must exist iff there's a Hamiltonian cycle (and we can stop
when all we have left are even alternating strips), that progressively choosing and flipping alternating strip
sequences makes progress, etc. all need proof.


---

## Building the 2-factor graph

### Introduction

The initial state of the Umans-Lenhart Hamiltonian cycle finding algorithm on solid grid graphs (ULHC:SGG)
is start from a 2-factor.
This section discusses algorithms to efficiently create the initial 2-factor.

As a reminder, the 2-factor is an edge placement connecting all vertices in the solid grid graph such that
all vertices have exactly degree 2.
If a 2-factor doesn't exist, a Hamiltonian cycle can't exist.
The existence of a 2-factor does not necessarily imply the existence of a Hamiltonian cycle.

A valid 2-factor can be thought of as a set of disjoint cycles covering the entire solid grid graph.

### Construction

Umans discusses various strategies, including a linear programming method suggested by Bridgeman, but
Uman settles on a graph construction combined with a perfect edge matching, to find the initial 2-factor.

Each vertex in the solid grid graph is replaced by a widget.
Each vertex's widget construction has one vertex for each neighbor and each of these 'external' widget
vertices are connected to
two 'internal' vertices.

The construction is bipartite.
The internal widget vertices that have an edge match with an external widget vertex correspond to
one side of an edge in a valid 2-factor of the original solid grid graph.

A valid 2-factor exists iff a perfect edge matching exists.

### Algorithm

There is a standard reduction of the perfect edge matching to a maximum-flow, minimum-cut
problem.
In the widget graph, vertices are bipartite, so can separated into disjoint but covering $L$ and $R$ sets.
A source is added connecting a directed edge from the source to each of the vertices in $L$.
Each of the $L$ vertices have an edge that got to their neighboring $R$ vertices.
Each of the $R$ vertices has an edge going to a sink vertex.

All edge weights are given weight 1 and Ford-Fulkerson (FF), say, is run to find a maximum flow.

A maximum flow of  $2 |V|$ corresponds to the existence of a perfect edge matching.

The Ford-Fulkerson can be used but I think Hopcroft-Karp can be used to speed things up.
Here, aside from the source and sink, the widget graph is degree bound, so the number of edges
is a constant factor of the number of vertices.
FF runs in something like $O(|E| \cdot f)$, where the maximum flow $f$ is on the order of the number of
vertices, so roughly $O(|V|^2)$ (vertices are degree bound, so $|V| \sim |E|$).
Hopcroft-Karp looks to run in something like $O(|E| \sqrt{|V|} \sim O(|V|^{3/2})$.

It looks like for sparse (random) graphs, Hopcroft-Karp gets closer to $O(|E| \log(|V|))$, so we
might expect it to be even better.


## ULHP:SGG Algorithm Overview

I think the algorithm itself is pretty easy to state:

The algorithm starts by finding an initial 2-factor.
If no such 2-factor exists, no Hamiltonian cycle can exist.

From the initial 2-factor, it scans the graph to find some patterns of *cells*.
These patterns, described shortly, are linear chains of cells.

A set of linear chains is collected and the edges on the perimeter
are then *flipped*.

The flipping of edges reduces the component count of the 2-factor.

If no more patterns can be found, the algorithm terminates with either
a giant cycle which is the Hamiltonian cycle on the solid grid graph or
a collection of disjoint cycles and a proof that no Hamiltonian cycle
exists.

---

The core of the algorithm is finding the patterns of cells to flip.

The basic pattern is one of two linear string of cells, either in
the vertical or horizontal direction, called *even alternating strip*
or *odd alternating strip*.

Using the alternating strip, either odd or even, the perimeter of edges is flipped.
An odd alternating strip always reduces the 

It is a fact of solid grid graphs that there must exist an even
alternative strip.
If a Hamiltonian cycle in a solid grid graph exists with a multi-component 2-factor,
without an odd alternating strip present, there exists a series of flips
of an even alternating strip to produce an odd alternating strip, which
can then be used to reduce the 2-factor component count.

One of the main difficulties in the ULHP algorithm is finding an efficient
schedule of even alternating strips to flip.



## Implementation details

I'm still working through this, so this is going to be a scratch space for my thoughts.


We need:

* a structure to hold each original grid cell and potential edges
* a structure to hold the current list of cycles (the 2-factor)
* a structure to hold the dual of the graph, along with which regions
  each cell belongs to
  - the structure should include the region information or should allow its calculation
  - we want to calculate the distance between points in the same region as well
    as pairwise distance
  - if two points lie on the same minimum path?


## Notes

The "type" of a cell in the dual graph (e.g. type `III`) is often modified by whether it's "boundary" or not,
where boundary means the four vertices of the dual cell belong to different 2-factor components.

For the bulk algorithm:

* If there's a type `III` boundary cell, we can just choose it and make progress as this
  will join disparate components in the 2-factor
* For the more complicated case where only raw even alternating strip sequences are present,
  or there are type `III` cells that aren't boundary, we then go through and identify the even
  alternating strips, the odd alternating strips and chain even and odd alternating strips
  - raw alternating strips are labeled `BEGIN`
  - `CHAIN` alternating strips begin from the ending of a previous alternating strip (`BEGIN` or `CHAIN`,
    so this process has to be iterated until no more strips are identified)
  - we then find paths from the orthogonal neighboring cells of the ending cell in a strip. The path
    from the neighboring end cells will inform whether the odd alternating strip can/will join
    2-factor components and terminate the alternating strip sequence


---

If you take an alternating path through $G _ F$ ($G _ F$ has extra labels for parity but is otherwise
the full grid graph, I guess), flipping these edges can be thought of as a kind of "Jacobs Ladder", where
the edges are knocked into the new position.

If you start with a $G _ F$ that has each vertex as degree 2, then this procedure will keep all degrees
the same but allows you to shuffle the edges around.

I don't have a good idea of why it's so, but the dependency graph and following a cycle along same oriented
vectors, is, I believe, this idea, formalized.
The dependency graph maybe helps with proofs but, as far as I can tell, is a (complicated?) way of tracing
out an alternating path or cycle in $G _ F$.

---

Looking at section 3.3 "Distance Between 2-Factors".

> Let $F _ 1$ and $F _ 2$ be 2-factors of $G$ with $S$ a partition of $F _ 1 \oplus F _ 2$
> into edge-disjoint non-crossing cycles that alternate w.r.t. $F _ 1$.
> Label each outermost cycle 1 and each nested cycle 1 or -1 if the direction of the dependency
> graph is aligned or opposite, respectively.
> Remove all labeled cycles and repeat.

Since it's an alternating cycle, the dependency graph directions on the border (flux?) has to be the same, either pointing
outward on the boundary or inward.
In some sense, this feels like a winding with dependency graph directions pointing inward or outward that are analogous
to whether its clockwise or counterclockwise.

The procedure only does the outermost and directly embedded cycles, then peels them off and repeats.

$\ell( C, S)$ is the $\{-1,1\}$ label, then they define a distance function:

$$
d( F _ 1, F _ 2 ) = \min _ S \sum _ {C \in S} \ell(C, S) \cdot area(C)
$$

---

The workhorse of the algorithm is Theorem 5:

> If $G$ is Hamiltonian with a multi-component 2-factor, $F$,
> then $F$ contains an alternating strip sequence.

If $S$ is the set of cycles with each edge of any cycle in $S$ alternating
w.r.t. $F$ and $H$ a  Hamiltonian cycle, they claim:

* At least one cycle must cross a boundary
* A cell-to-cell walk along the boundary continuing on to an alternating strip
* Flipping this walk will result in a new 2-factor that is closer to $H$

---

So now, Lemma 6:

> $F _ 1, F _ 2$ be 2-factors of $G$ with $S = F _ 1 \oplus F _ 2$.
> $S$ can be partitioned into edge-disjoint non-crossing cycles that alternate
> w.r.t. $F _ 1$.

By doing an enumeration of cases around a single vertex, it can be seen that
the resulting 'on' edges $S$ can only have even degree $\{0,2,4\}$.

If we label the resulting edges in $S$ depending on whether then came from $F _ 1$
or $F _ 2$ (from both means the edges in $S$ cancel out),
then each vertex in $S$ has either exactly one edge from each of $F _ 1$ and $F _ 2$
(2 in total) or exactly two edges from $F _ 1$ and from $F _ 2$ (4 in total).

This means there is always a choice when walking on $S$ to choose a path that
alternates.

The proof they give on partitioning into disjoint cycles is a proof by contradiction
assuming a cycle of minimum area.
I think there's a simpler proof that just lets you partition any crossing path
into two disjoint cycles maybe with a 'dead region' in the middle, but their
proof is obviously sufficient.

```
    *===*---*
    :       |
*---*---*===*===*
:   :       |   |
*   *---*===*   *
|               :
*===*---*===*---*
```

The above can be split into 2 cycles with a third, "middle", cycle discarded.

---

The dependency graph is used to assign the $\pm 1$ label to alternating cycles.

The cycles themselves effectively have a parity that can be captures by
the 'flux' of the dependency graph.


---

Section 3.4, proof of theorem 5.

Here's my attempt at an overview:

* $F$ 2-factor, $H$ Hamiltonian cycle (we're trying to find), $S = F \oplus H$
* If there's a type `III` boundary cell, then theorem 5 trivially true, so non-trivial case is when
  only type `II` and type `I` boundary cells are present (no type `III` boundary -> no type `IV` boundary)
* $F \oplus H$ must cross a boundary
* From a crossing boundary edge, walk along the boundary *cells* until you hit a type `I` boundary cell
* From the type `I` boundary cell, shoot out in an axis-aligned direction to find an alterating strip
  (which must exist)
* Show that this alternating strip reduces the distance metric

A bit more detail:

* if $F \oplus H$ doesn't cross a boundary, this means boundary region untouched, but another application of $F$,
  $F \oplus F \oplus H = H$, implying $H$ is multi-component -> contradictoin
* a type `I` boundary cell must exist in the walk because .... (? working on it)
  - note that this is a *cell* walk, walking on cells, potentially crossing different circuits in $S$
  - looks like some argument about crossing.
  - if not, must only encounter type `II` boundary cells
  - If $\ell(C,S) = 1$ then it exits $C$, contradicting Lemma 7 (regurgitating, I don't see this)
  - If $\ell(C,S) = -1$ then $C$ is nested in some other $C'$, with the walk not able to cross
    $C'$, so must get back to beginning edge $e$ -> contradiction (again, regurgitating, I don't quite see this)
* once a type `I` boundary cell is chosen, it's probably easy to see that an alternating strip exists
  - I think it's just a matter of looking at the first forced cell, then following your nose until you get to
    a terminating odd or even cell in the alternating strip
* as far as I can tell, showing that flipping the alternating strip reduces the distance metric is a case
  analysis of the dependency graph edges on each of the cells being flipped

This proof relies on two phases:

* Find an edge of some cycle, $e \in C, C \in S$, that's on the boundary
* Phase I
  - walk cells from $e$, inward if $\ell(C,S) = 1$ and outward if $\ell(C,S) = -1$
    + here *inward* means opposite of the edge of the dependency graph and *outward* means in the same direction
      as the dependency graph edge
  - stop when an type `I` boundary cell, $c _ I$, is encountered
* Phase II
  - from $c _ I$, shoot out (away from the dark edge) in an axis-aligned direction until
    a type `III` cell is encountered
    + depending on the orientation of the type `III` cell, the strip will be even or odd

---

### We only need to consider type `II` and `I` boundary cells

If $G$ contains a type `III` boundary cell, then Theorem 5 holds trivially.

The presence of a type `IV` boundary cell implies the presence of a type `III` boundary cell:

See:

```
    |  |
  --*  *--
     IV
  --*  *--
    |  |
```

`IV` is connected to the boundary, so one of the four paths out must contain a type `III`.

So we're only concerned with $G$ when it contains type `I` and type `II` boundary cells.

$H$ is a Hamiltonian cycle with a two-factor $F$ that is multi-component.
$S = F \oplus H$.

$F$ must cross the outer boundary.
If $F$ didn't, $F$ would leave the boundary unchanged
but $F \oplus (F \oplus H) = H$, meaning $H$ is multi-component, contradicting its Hamiltonicity.

---

### We must encounter a type `I` boundary cell during our cell walk in Phase I

Call $e$ our starting edge on $C$ and we proceed along cells, in the opposite of the dependency
graph direction if $\ell(C,S) = 1$ and in the same direction as the dependency graph edge if $\ell(C,S) = -1$.

We've chosen the edge $e$ to be a bridge between *two different components* in the 2-factor,
so it can't encounter a cul-de-sac (dead-end) as the boundary edges that run between these two components
must separate them, thus making a gorge between them.
From our setup, the only possibility now is type `I`, type `II` and type `V` boundary cells, but
a type `V` boundary cell will never appear without a type `I` cell above it.

So now, if we don't encounter a type `I` cell, these must be a series of 'stacked' type `II` cells.
Running off the edge with different types of outer boundary cells is not possible as will be shown below.

Since these are stacked type `II` cells, and so long as we're running along type `II` cells,
the dependency graph direction as we walk these type `II` cells has the same direction.

In the case $\ell(C,S) = 1$, we're moving "away" from the egress to the outer boundary.
We can't get to an egress on the other end, purely moving with type `II` boundary cells, as
we'd end up at an egress mouth that must have a dependecy graph direction in the opposite
direction as the dependency graph direction implied by the boundary of $C$ (contradiction) (Lemma 7).

In the case of $\ell(C,S) = -1$, the cycle $C$ must exist in a cycle of $C'$ with $\ell(C',S) = 1$.
$C'$ has a dependency graph direction along its skin opposite to that of $C$.
We're moving in a diagonal direction following type `II` boundary cells, all with the same dependency graph
direction, which will eventually lead to the outer boundary border.
But once we get to the outer border, we must have crossed $C'$ with a dependency graph direction along its skin
in the opposite direction (contradiction).

The existence of $C$ puts constraints on what type of cells can appear.

---

### Phase II produces an alternating strip

Once we find a type `I` boundary cell from Phase I, we then trace out a cell path opposite to
the dark edge of $c _ I$ until we hit a type `III` cell in either orientation.

$c _ I$ is a type `I` boundary cell, and so has a type `V` cell directly underneath it.

The type `V` cell forces light edges for the third cell edges.
This, in turn, forces either:

* a wall, resulting in a type `III` cell
* a type `III` cell in the opposite orientation, or
* a type `V` cell

If there's a type `V` cell, then by induction we eventually get to a type `III` cell.

A janky enumeration of cases:

```

    *---*             *---*
     c_I               c_I
 ---*   *---   =>  ---*   *---
    |   |             |   |
    *---*             *---*
                       iii
 ???*???*???         ?*---*?
    ?   ?             ?   ?


                      *---*
                       c_I
               =>  ---*   *---
                      |   |
                      *---*
                       
                   ---*   *---
                      |iii|
                     ?*   *?
                      ?   ?
  

                      *---*
                       c_I
               =>  ---*   *---
                      |   |
                      *---*
                       
                   ---*   *---
                      |   |
                      *---*
                          
                       ...
  
```

---

### Flipping the Phase II alternating strip reduces distance

In [UL97] this is claim 3:

$$
d( F \oplus s, H) < d(F, H)
$$

Let $s = ( c _ I, c _ 1, c _ 2, \dots, c _ {III} ) = ( s _ 0, s _ 1, s _ 2, \dots, s _ {m-1} )$
( $c _ I$ the type `I` boundary cell chosen from Phase I, $c _ {III}$ the ending ceall of the
alternating strip of Phase II).


(need to validate) The dependency graph direction from $s _ 0$ to $s _ {m-1}$ ($c _ I$ to $c _ {III}$)
is the same, implying (?) that $c _ I$ is on the immediate interior of a cycle $C$ with $\ell(C,S) = 1$.

$c _ {III}$ is itself an alternating strip.

(need to validate) An enumeration of cases when flipping the single end cell, $c _ {III}$,
shares edges with no cycles in $S$ or $C$, shares edge(s) with just $S$, with just $C$ and with $S$ and $C$.
In each case, the distance is reduced by one and inductively produces another type `III` cell as it
eats away at the end of the strip on the way to $c _ I$.

(need to validate) The distance metric assumes minimum $S$ which might not be maintained throughout the strip
flip but the claim is that the minimum $S'$ can only be smaller, so we're able to ignore the case when this happens.

---

There's some discussion on whether a type `III` boundary cell appears after this process and an omission
of a proof, but I'm confused as to the requirement of this, since we're guaranteed that the distance
is strictly decreasing and is integral, so it must eventually terminate at $d(F, H) = 0$.

### Comments

While choosing an alternating strip from the above procedure will guarantee a distance reduction,
the distance reduction is integral and the distance has an upper bound of the area of the region,
identifying which edge, $e$, to choose that sits on a boundary of a cycle might be difficult.

Choosing alternating strips to flip without care might lead to an increase in distance.

---

Lemma 8:

> Let $G$ be type `III` boundary cell free and $s$ be an (even) alternating strip in $G$.
> Let $x$ and $y$ be two vertices in $G ^ - _ F$ not on $s$.
> If there's a path, $p$, from $x$ to $y$ that does not cross the end cell of $s$,
> then there will still be a path $p'$ from $x$ to $y$ in $G ^ - _ {F \oplus s}$ .
> For a point, $v$, on path $p$ not on $s$, $v$ will also be present in $p'$ in $G ^ - _ {F \oplus s}$ .

In other words, for $G$ without type `III` boundary cells, paths independent of an alternating strip $s$
stay independent after the flip.

As a reminder, $G ^ - _ F$ is the dual graph of $G$ with edges that cross $F$ removed.
So islands formed by the $F$ boundary.

The intuition is that even alternating strip flips don't merge cycles, so paths outside of the alternating
strip flip remain unaffected.
If there were a type `III` bounary cell, cycles might get merged and have long ranging effects on connectivity
and other paths.

---

Lemma 9:

I don't really understand what this is saying.

It's saying fixing a boundary cell type uniquely determines the rest of the boundary? Surely that's not true.

---

Theorem 10:

> Let $G$ be type `III` boundary cell free and $A = (a _ 0, a _ 1, \dots, a _ {k-1})$ be
> an alternating strip sequence that begins on the boundary, then there exists
> a static alternating strip sequence, $A'$ that is equal to or less than the
> area of $A$

In other words, any alternating strip sequence on the boundary of $G$ (type `III` boundary cell free)
is either a static alternating strip sequence to begin with or can be whittled down to a static
alternating strip sequence (maybe with a different start point but still on the boundary?).



## ERRATA

pg. 58 of Uman's thesis:

> Let $c'$ be the ~first~ **last**  cell in this search that is alternating.

pg. 59:

> The directed edges are required to ensure that multiple consecutive link edges ~are~ cannot
> appear in a path in $H$.


