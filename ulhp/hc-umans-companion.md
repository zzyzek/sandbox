Umans Hamiltonian Cycle in Solid Grid Graphs Companion
===

I'm trying to work through Umans (and Lenhart's) HC thesis and paper.

### current todo

* go through case enumeration for claim 3 ( $d(F \oplus s, H) < d(f,H)$ ) of Theorem 5
  (dependency graph local enumeration of cell)
* go through inductive case analysis of theorem 10

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
| **Alternating Cell** | **overloaded term.** Either, an independent cell whose 4 edges are alternating when traversing in a clockwise or counter clockwise direction (so (up,left,down,right) of `[1,0,1,0]` or `[0,1,0,1]`) **or** If the cell cycle is in an alternating cycle, it's called an alternating cell | Umans thesis mostly uses the first definition later in his thesis |
| **Area** | of cycle $C$ is the number of interior cells of $C$ | |
| **Nested** | Two edge-disjoint cycles are nested if one is entirely in the other | |
| **Intersect** | Two edge-disjoint cycles intersect if they share at least one interior cell | They must share vertices but do not share edges |
| $G ^ { * }$ | The dual of $G$ (a vertex in $G ^ { * }$ per cell in $G$, an edge in $G ^ { * }$ for adjacent cells in $G$) | |
| $G ^ { + } _ F$ | The dependency graph | Add a border of vertices, see below |
| $G ^ { - } _ F$ | Dual of $G$ with no edge present in $G ^ { - } _ F$ if neighboring cells have an edge in $F$ | $G ^ { * }$ with edges removed that cross $F$ |
| **Border edge** | w.r.t. to $G _ F$. An edge bordering two cells, one of which connects to the outside component and one which connects to an interior component | |
| **Border cell** | w.r.t. to $G _ F$. A cell bordering an interior component of $F$ and the outside component | Type `I`, `II`, `III`, `IV`, see below |
| **Boundary** $B$ | Set of border cells | |
| **Boundary** | Set of border cells that is a simple cycle or has endpoints on the outer face | Whether a string of border cells completely encloses a region in $F$. Type `IV` cells on boundary implies a type `III` neighbor (otherwise its an internal `+` region) |
| **Alternating Strip** | An array of cells, starting with a type `I` and ending with a type `III` (odd) or type `IV` then (rotated) type `III` (even) (with 'C' cells in between) | See below |
| **Alternating Strip Sequence** | An array of alternating strips | |
| **Static Alternating Strip Sequence** | An alternating strip sequence but with extra criteria that makes finding them polynomial | See below |

note: enabled/engaged/active for edges

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


candidates:

* static alternating strip sequence, SASS
* mondo/muddled alternating strip sequence, MASS
  - disordered alternating strip sequence DASS

## List of Theorems, Lemmas and Corollaries


> **[U96] Lemma 2.1**: Every cycle in a bipartite graph has even length.

> **[U96] Lemma 2.2**: If $G$ is bipartite then $G ^ { * }$ is also bipartite.

> **[U96] Lemma 2.3**: A perfect matching exists in $G ^ { * }$ iff a 2-factor exists in $G$.

> **[U96] Theorem 2.1**: A matching $M$ in $G$ is maximal iff there exists no augmenting path w.r.t. $M$.

> **[U96] Theorem 2.2**: An alternating search tree rooted at $r$ and built by repeatedly adding pairs of alternating
> edges will find an augmenting path starting at $r$ if one exists.

> **[U96] Theorem 2.3**: A blocked alternating search tree may be ignored in subsequent searches.

> **[U96] Lemma 3.1**: Let $F _ 1$, $F _ 2$ be 2-factors of $G$ and let $S = F _ 1 \oplus F _ 2$. Then $S$ contains an alternating cycle

> **[U96] Lemma 3.2**: Let $C$ be an alternating cycle in $G _ F$. Then $F \oplus C$ is a 2-factor of $G$.

> **[U96] Lemma 3.3**: Let $F _ 1$ and $F _ 2$ be 2-factors of $G$. Let $S = F _ 1 \oplus F _ 2$. $S$ can be partitioned into
> edge disjoint alternating cycles.

> **[U96] Lemma 3.4**: Let $F _ 1$ and $F _ 2$ be 2-factors of $G$. Let $S = F _ 1 \oplus F _ 2$. An alternating cycle in $S$
> of minimal area intersects no other cycle in $S$.

> **[U96] Lemma 3.5**: Let $F _ 1$ and $F _ 2$ be 2-factors of $G$. Let $S = F _ 1 \oplus F _ 2$. $S$ can be partitioned into
> edge disjoint non-intersecting alternating cycles.

> **[U96] Corollary 3.1**: Let $F$ be a 2-factor of $G$, a grid graph without holes, and $H$ be a Hamiltonian
> cycle in $G$. Then $F \oplus A = H$, where A is a sequence of edge-disjoint non-intersecting alternating cycles in $G _ F$.

> **[U96] Lemma 4.1**: If directions are assigned to successive edges along a path of even length in $G ^ + _ F$
> satisfying the edge direction rules of an oriented dependency graph, then either:
> 
> 1. the directions of the edges at the end of the path are the same (w.r.t. a fixed orientation of the path) and the edges
> at the edges at the ends have different parities, or
>
> 2. the directions of the edges at the end of the path are different (w.r.t. a fixed orientation of the path) and the
> edges at the ends have the same parity

> **[U96] Lemma 4.2**: Every dependency graph $G ^ + _ F$ can be oriented.

> **[U96] Lemma 4.3**: The oriented dependency graph $G ^ + _ F$ contains no directed cycle.

> **[U96] Lemma 4.4**: Let $C$ be a cycle in $G _ F$ and let $G ^ + _ F$ be the oriented dependency graph for $G _ F$.
> Then $C$ is alternating iff every edge of $C$ is crossed by an edge of $G ^ + _ F$ oriented in the same direction
> w.r.t. the interior of the cycle.

> **[U96] Lemma 4.5**: Let $R$ be an alternating cell region in $G _ F$. An alternating path in $G ^ + _ F$ can
> cross n more than one border edge of $R$.


> **[U96] Lemma 4.6**: If $A = (a _ 1, a _ 2, a _ 3, \dots , a _ n)$ is an alternating cell sequence in $G _ F$ and
> $B = ( b _ 1, b _ 2, \dots, b _ n)$ is an alternating cell sequence in $G _ {(F \oplus A)}$, then
>
> $(a _ 1, a _ 1, \dots, a _ n, b _ 1, b _ 2, \dots, b _ n)$
>
> is an alternating cell sequence in $G _ F$.


> **[U96] Lemma 4.7**: Let $R$ be an alternating cell region in $G _ F$. Then there exists an alternating cell sequence
> consisting of exactly the interior cells of $R$ with no repeated cells.

> **[U96] Lemma 4.8**: Let $c _ 1, c _ 2, \dots, c _ n$ be the interior cells of a region $R$ in $G _ F$, and let $S$ be the set
> of border edges of $R$. Then $F \oplus S = F \oplus c _ 1 \oplus c _ 2 \oplus \dots \oplus c _ n$.

> **[U96] Theorem 4.1**: Let $F _ 1$ and $F _ 2$ be 2-factors of $G$. Then $F \oplus A = F _ 2$, where $A$ is alternating cell
> sequence in $G _ F$.


> **[U96] Lemma 5.1**: If a boundary $B$ in $G _ F$ contains a Type `IV` border cell, then $B$ contains a type `III` border cell.

> **[U96] Lemma 5.2**: If $G _ F$ contains a boundary $B$ consisting of entirely type `II` cells, then $G$ is not Hamiltonian.

> **[U96] Lemma 5.3**: Let $C$ be an alternating cycle with area two in $G _ F$ whose interior edge $e$ is in $F$,
> and let $e _ 1$ and $e _ 2$ be edges in $F - C - \{ e \}$. Then the following hold:
>
> 1. the 2-factor $F \oplus C$ contains the same number of components as $F$ does, and
>
> 2. edges $e _ 1$ and $e _ 2$ are in the same component in $F \oplus C$ iff they are in the same component in $F$

> **[U96] Lemma 5.4**: Let $s$ be an odd alternating strip in $G _ F$, let $e _ 1$, $e _ 2$ be edges in $F - s - \{ \text{the interior edges of s} \}$,
> and let two vertices belong to the cell at the beginning of $s$ be labeled as in Fig. 5.6(a). Then the following hold:
>
> 1. the 2-factor $F \oplus s$ contains one fewer components than $F$ does, and
>
> 2. edges $e _ 1$ and $e _ 2$ are in the same component in $F \oplus s$ iff either they are in the same component in $F$
> or one is in the same component of $F$ as a vertex $x$ and the other is in the same component of $F$ as a vertex $y$.

*note here that odd alternating strip in [U96] is a* **border** *alternating strip in [UL97]*

> **[U96] Lemma 5.5**: Let $s$ be an even alternating strip in $G _ F$. If the alternating cell at the end of
> $s$ is not a type `III` border cell, $F \oplus s$ has the same number of components as $F$ does.

> **[U96] Lemma 5.6**: Let $s$ be an even alternating strip in $G _ F$ that begins on a border cell and does
> not end with a type `III` border cell. Then the alternating cell at the end of $s$ is a type `I` border cell
> in $G _ {(F \oplus s)}$ .

> **[U96] Lemma 5.7**: Let $G _ F$ contain no type `III` border cells, and let $s$ be an even alternating strip
> in $G _ F$. If $G _ {(F \oplus s)}$ contains a type `III` border cell, then it contains a type `III` border cell
> on the boundary created by $s$.


> **[U96] Lemma 5.8**: Let $R$ be an alternating cell region in $G _ F$, and let $c$ be a type `I` border
> cell in $R$ such that the dependency arc that crosses $c$'s dark edge is oriented in the same
> direction as the dependency arcs that cross $R$, w.r.t. the interiors of $c$ and $R$. Then $c$ begins
> an alternating strip that is wholly contained within $R$.


> **[U96] Lemma 6.1**: There exists an alternating cell sequence in $A$ in $G _ { F _ 1 }$ of length no greater
> than the $I(F _ 1, S)$ such that $F _ 1 \oplus A = F _ 2$.


> **[U96] Lemma 6.2**: Let $c$ be an improving cell in $G _ F$, and let $F _ 1 '= F _ 1 \oplus c$. There exists
> a partition $S'$ of $F _ 1 ' \oplus F _ 2$ into edge-disjoint non-intersecting alternating cycles such
> that $I(F _ 1', S') = I(F _ 1, S ) - 1$.


> **[U96] Lemma 6.3**: Let $F _ 1$, $F _ 2, $S$, and $G$ be defined as above. If $S$ contains an edge $e$ that
> crosses a boundary in $G _ {F _ 1 }$ consisting of entirely type `I` and type `II` border cells with at least
> one type `I` border cell, then there exists a type `I` border cell $c$ on that boundary with the following two
> properties:
>
> 1. cell $c$ is on the immediate interior of a positively oriented cycle $C$ in $S$, and
>
> 2. the dependency arc that crosses the dark edge of $c$ is oriented in the same direction as
> the dependency arcs that cross $C$, w.r.t. the interiors of $c$ and $C$.


> **[U96] Lemma 6.4**: Let $F _ 1$, $F _ 2, $S$, and $G$ be defined in Lemma 6.3 and let $c$ be the type `I` border
> cell identified in Lemma 6.3. Then there exists an alternating strip that begins at $c$ and ends at an
> improving cell.

> **[U96] Lemma 6.5**: Let $s$ be the alternating strip of length $n$ identified in Lemma 6.4, let $F _ 1$, $F _ 2$, $S$,
> and $G$ be defined as in Lemma 6.4, and let $F _ 1 ' = F _ 1 \oplus s$. There exists a partition $S'$ of $F _ 1 ' \oplus F _ 2$
> into edge-disjoint non-intersecting alternating cycles such that $I( S', F _ 1 ') = I (S, F _ 1) - n$.

> **[U96] Lemma 6.6**: Let $A$ be an alternating strip sequence in $G _ F$. Then $F \oplus A$ has one fewer
> components than $F$ does.

> **[U96] Lemma 6.7**: Let $F$ be a 2-factor in $G$ with More than one component. If $G$ is Hamiltonian
> then an alternating strip sequence exists in $G _ F$.

> **[U96] Lemma 6.8**: If $A = (a _ 1, a _ 2, \dots, a _ n)$, $n \ge 3$ is an alternating strip sequence in $G _ F$,
> then $G _ i = G _ {(F \oplus A _ {1,i} ) }$ contains no type `III` border cells, for all $i < n-1$ .

> **[U96] Lemma 6.9**: Let $G$ be a Hamiltonian grid graph without holes, $F$ a 2-factor in $G$,
> and $H$ a Hamiltonian cycle in $G$. Then $F \oplus A _ 1 \oplus A _ 2 \oplus \dots \oplus A _ k = H$,
> where each $A _ i$ is an alternating strip sequence in $G _ {(F \oplus A _ 1 \oplus A _ 2 \oplus \dots \oplus A _ {i - 1})}$
> and $k$ is the number of components in $F$ minus one.


> **[U96] Lemma 7.1**: Let $G _ F$ contain no type `III` border cells, let $s$ be an even alternating strip
> in $G _ F$, and let $x$ and $y$ be two vertices in $G ^ { * } _ F$ that correspond to cells not in $s$.
> If there exists a path $p$ between $x$ and $y$ in $G ^ { * } _ F$ that does not include the vertex in $G ^ { * } _ F$
> that corresponds to the alternating cell at the end of $s$, then there exists a path $p'$ between $x$ and $y$ in $G ^ { * } _ {(F \oplus s)}$,
> with the following properties:
>
> 1. vertex $v$ on $p$ corresponds to an alternating cell in $G _ F$ iff $v$ is also on $p'$ and corresponds to an alternating cell in
> $G _ {(F \oplus s)}$, and
>
> 2. if $v$ is a vertex on $p$ that corresponds to a cell in $G _ F$ that is not in $s$, then $v$ is a vertex on $p'$ in $G ^ { * } _ {(F \oplus s)}$.


> **[U96] Lemma 7.2**: Let $G _ F$ contain no type `III` border cells.
> Let $A = ( a _ 1, a _ 2, \dots, a _ n )$ be an alternating strip sequence in $G _ F$, $1 \le k < i < n$, and
> let $x$ and $y$ be the vertices in $G _ {(F \oplus A _ { 1, k })}$ that correspond to the cells on either
> side of the cell at the beginning of $a _ k$. If $x$ and $y$ are not on any of the strips $a _ {k+1}, a _ {k+2}, \dots, a _ i$,
> then the alternating cell at the beginning of $a _ k$ in $G _ {(F \oplus A _ {1, i})}$ is not on the boundary created by $a _ i$.


> **[U96] Lemma 7.3**: Let $G _ F$ contain no type `III` border cells. If there exists an alternating strip
> sequence $A = ( a _ 1, a _ 2, \dots, a _ k)$ in $G _ F$ that begins on boundary $B$, then there exists a static
> alternating strip sequence $A'$ in $G _ F$ that also begins on $B$ with total area no greater
> than that of $A$.

> **[U96] Lemma 8.1**: Let $A = ( a _ 1, a _ 2, \dots, a _ n )$ be a sequence of alternating strips obtained via the
> shortest path method. Let $x$ and $y$ be two vertices in $G ^ { * } _ F$ that correspond to the cells
> on either side of the alternating cell $c$ at the end of $a _ j$. Then the path between $x$ and $y$ does not
> contain the vertex corresponding to the alternating cell at the end of $a _ i$, for $1 \le i < j < n$.

> **[U96] Lemma 8.2**: Let $A = ( a _ 1, a _ 2, \dots, a _ n )$ be a sequence of alternating strips obtained via the
> shortest path method that satisfies the static property, and let $x _ 1$ and $x _ 2$ be the two vertices in
> $G ^ { * } _ F$ that correspond to the two cells in $G _ F$ that share a dark edge with the alternating cell at the end of $a _ i$,
> and let $y$ be the vertex in $G ^ { * } _ F$ that corresponds to the cell at the beginning of $a _ {i+1}$.
> If there exists a path $p$ in $G ^ { * } _ F$ between $x _ 1$ and $x _ 2$ that includes $y$, then there exists
> a path in $G ^ { * } _ {(F \oplus A _ {1,i})}$ between $x _ 1$ and $x  _ 2$ that includes $y$, for $1 \le i < n$.



---

> **[UL97] Observation 1**: Flipping a type `III` boundary cell (which is also an alternating strip of length one)
> reduces the number of components in $F$ by one.

> **[UL97] Lemma 2**: Flipping the last two cells of an odd alternating strip of length at least three
> leaves the number of components of the 2-factor unchanged.

> **[UL97] Lemma 3**: Let $s$ be an alternating strip that begins on
> a boundary cell. Then flipping $s$ reduces the number of components
> of the 2-factor by one if $s$ is an odd alternating strip and leaves the
> number of components unchanged if $s$ is an even alternating strip that does
> not end on a boundary cell.

> **[UL97] Lemma 4**: Flipping the alternating strips of an alternating strip
> sequence in succession results in a new 2-factor with one fewer
> components than the original 2-factor.

> **[UL97] Theorem 5**: (existence of Alternating Strip Sequences) Let $F$ be
> a 2-factor of $G$ with more than one component. If $G$ is Hamiltonian then $G$ w.r.t.
> $F$ contains an alternating strip sequence.

> **[UL97] Theorem 5, Claim 1**: Phase `I` must reach a type `I` boundary cell.

> **[UL97] Theorem 5, Claim 2**: Phase `II` proceeds along exactly the cells of an alternating strip.

> **[UL97] Theorem 5, Claim 3**: $d( F \oplus s, H ) < d( F, H )$.

> **[UL97] Lemma 6**: Let $F _ 1$ and $F _ 2$ be 2-factors of $G$ and let $S = F _ 1 \oplus F _ 2$.
> Then $S$ can be partitioned into edge-disjoint non-crossing cycles that alternate w.r.t. $F _ 1$.

> **[UL97] Lemma 7**: A cycle $C$ in $G$ alternates w.r.t. $F$ iff every edge of $G ^ + _ F$
> that crosses $C$ is directed uniformly w.r.t. the interior of $C$.

> **[UL97] Lemma 8**: Let $G$ contain no type `III` boundary cells, let $s$ be an even alternating
> strip in $G$, and let $x$ and $y$ be two vertices in $G ^ - _ F$ that correspond to cells
> not in $s$. If there exists a path $p$ between $x$ and $y$ in $G ^ - _ F$ ( $G ^ - _ {(F \oplus s)}$ )
> that does not include the vertex corresponding to the ending (beginning) cell of $s$,
> then there exists a path $p'$ between $x$ and $y$ in $G ^ - _ {(F \oplus s)}$ ( $G ^ - _ F$ ).
> Furthermore, if $v$ is a vertex on $p$ that corresponds to a cell in $G$ that is not in $s$,
> then $v$ is a vertex on $p'$ in $G ^ - _ {(F \oplus s)}$ ( $G ^ - _ F$ ).

> **[UL97] Lemma 9**: If $G$ contains no type `III` boundary cells then a boundary $B$ is
> uniquely determined by any boundary cell in $B$.

**note:** *I have no idea what this lemma is trying to say*

> **[UL97] Theorem 10**: (Existence of Static Alternating Strip Sequences) Let $G$ contain
> no type `III` boundary cells and let $A = ( a _ 1, a _ 2, \dots, a _ k)$ be an alternating
> strip sequence that begins on boundary $B$. Then there exists a static alternating strip sequence $A'$
> that begins on $B$ iwth total area no greater than that of $A$.

> **[UL97] Theorem 11**: The Hamiltonian cycle problem for quad-quad graphs (and solid grid graphs) is in $\mathcal{P}$.


---

[UL97] Lemma 8 is poorly worded. Here is a cleaner version:

> **[UL97] Lemma 8 (cleaned up)**: Let $G$ contain no type `III` boundary cells, let $s$ be an even alternating
> strip in $G$. Let $x$ and $y$ be two cells in $G ^ - _ F$ not in $s$.
> If path, $p$, exists between $x$ and $y$ in $G ^ - _ F$,
> where $p$ misses the ending cell of $s$,
> then a path $p'$ exists between $x$ and $y$ in $G ^ - _ {(F \oplus s)}$.
> If $v$, is a vertex on $p$, with $v \not\in s$, then $v$ is also a vertex on $p'$ in $G ^ - _ {(F \oplus s)}$.

By taking $F \oplus s$ as the starting point and $F$ as the ending, the above lemma can be reversed.





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
* From the type `I` boundary cell, shoot out in an axis-aligned direction to find an alternating strip
  (which must exist)
* Show that this alternating strip reduces the distance metric

A bit more detail:

* if $F \oplus H$ doesn't cross a boundary, this means boundary region untouched, but another application of $F$,
  $F \oplus F \oplus H = H$, implying $H$ is multi-component -> contradiction
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
we'd end up at an egress mouth that must have a dependency graph direction in the opposite
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
( $c _ I$ the type `I` boundary cell chosen from Phase I, $c _ {III}$ the ending cell of the
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
If there were a type `III` boundary cell, cycles might get merged and have long ranging effects on connectivity
and other paths.

---

Lemma 9:

> If $G$ contains no type `III` boundary cells then a boundary $B$
> is uniquely determined by any boundary cell in $B$

I don't really understand what this is saying.

It's saying fixing a boundary cell type uniquely determines the rest of the boundary? Surely that's not true.



---

Theorem 10:

> Let $G$ be type `III` boundary cell free and $A = (a _ 0, a _ 1, \dots, a _ {k-1})$ be
> an alternating strip sequence that begins on the boundary, then there exists
> a static alternating strip sequence, $A'$ that is equal to or less than the
> area of $A$

In other words, for any alternating strip sequence that begins on a boundary of a type `III` boundary cell
free $G$, a static alternating strip sequence exists that starts somewhere on the same boundary that is
no bigger in area.

This is Lemma 7.3 in the thesis by Umans.

I still don't know what Lemma 9 is saying, which is used in [UL97], so I'm going to try and go
through the proof using both [UL97] and [U96].

Proof by induction.
Here's an overview:

* Assume an alternating strip sequence $A = (a _ 0, a _ 1, \dots, a _ {k-1})$ that begins on a boundary
* Proof by induction on the existence of $S = (s _ 0, s _ 1, \dots, s _ {n-1})$ (that also begins on a boundary)
* (Base case) If a type `III` border cell is present in $a _ 0$, or in adjacent cell, $c$, after any application of
  $a _ 0$, then trivially true by taking $S = (a _ 0)$ or $S = (a _ 0, c)$ respectively
  - subsequently can assume no type `III` cell in $a _ 0$ or after an application of $a _ 0$
* Find the largest $i$ s.t. $s _ i$ shares area or an edge with $A$
  - if no such $i$ exists, $(a _ 0, s _ 0, s _ 1, \dots, s _ {n-1})$ is the static alternating strip sequence with area no bigger by inductive step
* case analysis for when a $s _ i$ is separate, edge-adjacent but non-overlapping (side, top) or area overlapping 


---

I'm having trouble understanding what the paper is saying, so I'm going to the thesis.

In [U96], Lemma 7.1:

> Let $G _ F$ be type `III` boundary cell free, let $s$ be and alternating strip in $G _ F$,
> let $x$, $y$ be two vertices in $G ^ * _ F$ not on $s$.
> If a path, $p$, exists between $x$ and $y$, and $p$ misses the end of strip $s$ ($|s| = m, s _ {m-1} \not\in p$),
> with $p'$ a path between $x$ and $y$ in $G ^ * _ { ( F \oplus s ) }$, then:
> 
> $v \in p, v \in s \to v \in p', v \text{alternating cell} (G _ {(F \oplus s)})$
>
> $v \in p' \& \text{alternating cell} (G _ {(F \oplus s)}) \to v \in p, v \in s$
>
> $v \in p, v \not\in s \to v \in p'$

Basically, strip flipping doesn't alter connectivity outside of the strip.

Proof is simply flipping an even alternating strip and looking at the valid immediate boundary
covered by the pre-conditions of the Lemma.


```

     '''''''              '''''''
    '       '            '       '
   '         '          '         '
   '         '          '         '
    ' *---* '            ' * ' * '
    '''''''''            ' | ' | '
   ---* ' *---          ---* ' *---
    ' | ' | '            '''''''''
    ' *---* '            ' *---* '
    '''''''''            ' | ' | '
   ---* ' *---          ---* ' *---
    ' | ' | '            '''''''''
    ' *---* '            ' *---* '
    '''''''''            ' | ' | '
  ----* ' *----         ---* ' *---
      | ' |              '''''''''
      * ' *              ' *---* '
        '
```

The only cells that would be affected by the flip still have
the same connectivity after the flip, except for the last cell in the
flip, which is excluded from the lemma in the first place.

---

Lemma 7.2:

> Let $G _ F$ be type `III` border cell free, $A = (a _ 1, a _ 2, \dots, a _ n)$ be
> an alternating strip sequence, $1 \le k < i < n$, $x$, $y$ cells in $G _ {( F \oplus A _ {1,k} )}$,
> where $x$ and $y$ are either side of $a _ {k,0}$.
> If $x$ and $y$ aren't on any strips $a _ {k+1}, a _ {k+2}, \dots, a _ {i}$, then $a _ {k,0}$ in
> $G _ {(F \oplus A _ {1,i})}$ is not on the outer boundary after $a _ i$ has been applied/flipped.


In other words, if subsequent flips ($a _ {k+1}, a _ {k+1}, \dots, a _ i$) aren't near the beginning
of $a _ k$, then the beginning of $a _ k$ doesn't lie on the outer border.

"If strips are separate enough, $a _ {k,0}$ doesn't like on the boundary."

The only time regions get merged is if there's a type `III` border cell.
By construction, this isn't present, so all we're doing is shifting things around.

This shifting is limited, by Lemma 7.1, so we know $x$ and $y$ at the beginning of $a _ k$,
if connected and are on the outer border, stay connected and on the outer border after flipping
$a _ k$.

The first cell of $a _ k$ now has an outlet depositing the connectivity to the center of the
border loop created by $x,y$.
The other end of that $a _ k$ connectivity goes down, away from the outlet into the border loop
pool (created by $x,y$).

I almost see this but I'm not quite there.

The region connected by the cell $a _ {k,0}$ must feed into the $x,y$ region, forcing
a pinched vertex in the 2-factor to be degree 1 (contradiction).
The dual region can have degree 1 and 3 but these conditions are restrictive, so I
don't quite see why this would imply a degree 1 in the 2-factor outright.

---

Lemma 7.3 is the engine of the algorithm:

> Let $G _ F$ be type `III` border cell free.
> If there is an alternating strip sequence $A = (a _ 1, a _ 2, \dots, a _ k)$ that begins on
> the outer boundary, then there exists a static alternating strip sequence $A'$ that also
> begins on the outer boundary with area no greater than that of $A$.

The proof is by induction.
Assume a static alternating strip sequence $S = (s _ 1, s _ 2, \dots, s _ n)$ that begins on the
boundary of $G _ {(F \oplus a _ 1)}$ with area no greater than $A _ {2,n}$, with
$s _ i$ being the last strip sequence that shares edges or an area with $a _ 1$.

To be explicit, for $s _ t$, $t < i$, these don't touch $a _ 1$ so can be added without worry.

If $i$ doesn't exist, then $A' = (a _ 1, s _ 1, s _ 2, \dots, s _ n)$.
If $a _ 1$ is odd, then $A$ is a static alternating strip sequence to begin with.
If there's a type `III` border cell as a result of applying $a _ 1$, then $A' = (a _ 1, c)$.
Going forward, we can assume these degenerate cases don't exist.

The inductive step assumes $S$ is of less area than $A _ {2,n}$,
so it becomes a case analysis on how to adjoin $S$ to $a _ 1$.

* Case 1: $S$ shares a side edge with $a _ 1$
* Case 2: $S$ starts at the end of $a _ 1$ and goes back up into it
* Case 3: $S$ starts at the end of $a _ 1$ and goes away from it
* Case 4: ???

Having a path go perpendicular into, out of or across the middle of $a _ 1$ is precluded
by Case 1, as other cells above and below would need to be included, making it not a strip.

Case 3 handles strips that go in different directions (perpendicular to $a _ 1$).


---

[U96] Chapter 8 (pg. 58-59).

Under the "Candidate Chain Strips" section, the wording is confusing on how to label
chain strips.

The procedure is as follows:

* For every type `II` cell (parity configuration of an "L", however rotated), $c$
* That has an alternating cell beside it that shares an edge (that is, type `III`
  whose rotation makes it share a dark edge), $c''$
* Choose the *other* dark edge in $c$ and walk away from that edge until you hit
  an alternating cell (type `III`)

In other words, for a type `II` cell, $c _ {II}$, that has, as it's neighbor, a type `III` cell, $c _ {III}$,
pretend to flip the shared edge between $c _ {II}$ and $c _ {III}$, making $c _ {II}$ into a type `I` cell, then
walk down the dual graph, away from the remaining 'on' edge in $c _ {II}$ until you hit a type `III` cell.

If none exists, don't do anything.
If a type `III` does exist, add a **chain** node with the appropriate **odd** or **even** node and length of strip weight.

This is done for *both* directions, if applicable, for every type `II` cell encountered.
That is, a type `II` cell might have two type `III` cell neighbors on both of its active edges, in which
case both directions should be tested.

Only type `II` cells with a type `III` neighbor can ever be considered in the static alternating strip sequence.
To turn a type `II` into a type `I` that would then continue on the alternating strip sequence, the neighboring edge
to the neighboring type `III` edge would need to be flipped and the strip would continue onward, pushing off against
the remaining active edge in the (now altered and turned into a type `I`) type `II` cell.

---

So here's what I think is going on:

* an odd alternating strip (e.g. a type `III` cell) will change the component
  count, decreasing it if the starts on the bridge between different boundaries
* an even alternating strip "pushes" the bridge down to where the strip ends
* starting from a bridge between two different boundaries, a chain of even
  alternating strips that end in an odd one will keep pushing the bridge
  outward until we get to the odd alternating strip, which will connect them

The complexity comes from proving that such alternating strips always exist
when a Hamiltonian cycle is present and that we can find a static, and thus
"efficient", sequence of strips to flip to consistently make quick progress.


---

A note on the alternating strip sequence graph:

* the labels are necessary:
  - chain nodes can only be connected to adjacent begin/chain strips that end
    right next to them
  - begin nodes can be connected if they're in the same region as the ending
    of an alternating strip

Figure 8.1 shows a begin strip of 10, call it `begin.10`,from the top that ends next to a chain.
We can follow that chain, but only because we've chosen that `begin.10` strip.

The `begin.10` can then continue from the begin 4 strip (upwards) but notably *not*
the chain in the lower left hand corner, even though that chain is on the outer boundary.

Finally, we don't want to loop back and connect to the `begin.8` and `begin.6` in the spine
of the `begin.10` strip, though I'm not sure this actually matters.

...

So this is a bit wrong.

The linking procedure is:

* If it's a `begin` node and on the *shortest* path
  between the two neighboring end cells
* If it's a `chain` node that begins on either of
  the two neighboring end cells and the neighboring end
  cells are connected

All this is ensuring that the flip is identifying a bridge cell and pushing
it around for eventually 2-factor component connection.

Since the chain needs to have it's neighboring alternating strip activated,
in addition to keeping the bridge cell, it can only be linked from
the parent alternating strip.

I just wonder if the shortest path is an actual requirement.
It won't matter because there must be a begin cell somewhere in the
line of fire for some connection.


## ERRATA

pg. 58 of Uman's thesis:

> Let $c'$ be the ~first~ **last**  cell in this search that is alternating.

pg. 59:

> The directed edges are required to ensure that multiple consecutive link edges ~are~ cannot
> appear in a path in $H$.

pg. 52:

> The bottom most and topmost vertical dark edges *are* ~not~ implied by the degree constraint - ...


References
---

* [UL97] "Hamiltonian Cycles in Solid Grid Graphs (Extended Abstract)" by C. Umans, W. Lenhart, 1997 ([ref](https://ieeexplore.ieee.org/document/646138))
* [U96]  "An Algorithm for Finding Hamiltonian Cycles in Grid Graphs Without Holes" by C. M. Umans, Bachelor thesis, 1996 ([ref](https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=bcc9203a455e521dc9f592805f36346ed336f3f0))
