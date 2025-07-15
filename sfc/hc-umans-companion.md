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




