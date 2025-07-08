s-t Hamiltonian Path Notes
===

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






References
===

* [The Open Problems Project: Problem 54: Traveling Salesman Problem in Solid Grid Graphs](https://topp.openproblem.net/p54)
* [github/whatsacomputertho/grid-solver: Problem Specification](https://github.com/whatsacomputertho/grid-solver/blob/main/doc/problem-specification.md)
* [Hamiltonian Cycles in Rectangular Grid Graphs](https://medium.com/@pascal.sommer.ch/generating-hamiltonian-cycles-in-rectangular-grid-graphs-316c94ecefe0)


