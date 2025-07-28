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
| **Cell** | A four egdge cycle in $G _ F$ | |
| **Alternating Cell** | If the cell cycle is an alternating cycle, it's called an alternating cell | |
| **Area** | of cycle $C$ is the number of interior cells of $C$ | |
| **Nested** | Two edge-disjoint cycles are nested if one is entirely in the other | |
| **Intersect** | Two edge-disjoint cycles intersect if they share at least one interior cell | They must share vertices but do not share egdges |
| $G ^ { * }$ | The dual of $G$ (a vertex in $G ^ { * }$ per cell in $G$, an edge in $G ^ { * }$ for adjecent cells in $G$) | |
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

The initial state of the Umans-Lenhart Hamililtonian cycle finding algorithm on solid grid graphs (ULHC:SGG)
is start from a 2-factor.
This section discusses algorithms to efficiently create the initial 2-factor.

As a reminder, the 2-factor is an edge placement connecting all vertices in the solid grid graph such that
all vertices have exactly degree 2.
If a 2-factor doesn't exist, a Hamiltonian cycle can't exist.
The existence of a 2-factor does not necessarily imply the existence of a Hamiltonian cycle.

A valid 2-factor can be thought of as a set of disjoint cycles covering the entire solid grid graph.

### Construction

Umans discusses various strategies, including a linear programming lemthod suggested by Bridgeman, but
Uman settles on a graph construction combined with a perfect edge matching, to find the initial 2-factor.

Each vertex in the solid grid graph is replaced by a widget.
Each vertex's widget construction has one vertex for each neighbor and each of these 'external' widget
verticies are connected to
two 'internal' verticies.

The construction is bipartite.
The internal widget verticies that have an edge match with an external widget vertex correspond to
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
FF runs in someedges like $O(|E| \cdot f)$, where the maximum flow $f$ is on the order of the number of
vertices, so roughly $O(|V|^2)$.
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
alternatinve strip.
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


## ERRATA

pg. 58 of Uman's thesis:

> Let $c'$ be the ~first~ **last**  cell in this search that is alternating.

pg. 59:

> The directed edges are required to ensure that multiple conseqcuitve link edges ~are~ cannot
> appear in a path in $H$.


