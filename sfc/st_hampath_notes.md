s-t Hamiltonian Path Notes
===

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


