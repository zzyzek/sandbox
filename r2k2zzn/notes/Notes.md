Notes
===

###### 2026-09-24

It looks like there are about 20-70 patterns to watch
out for, including weakly infeasible patterns.

The rough draft of an algorithm is as follows:

* If $n \le w$ or $m \le w$, `plugdp` 
* If $n > w$ and $m > w$, then:
  - choose a $(0,4)$ split, $(1,3)$ split, $(2,2)$ independent split or $(2,2)$ cross split
    in that preference order

The cosntant, $w$, is finite but needs to be large enough to accomodate the splits
that need to occur.
That is, I still need to figure out what $w$ is. $w \ge 10$ and almost surely $w \le 22$.

##### $(0,4)$ split

aka *strip*

If there's a strip of length $D _ 0 \ge 3$ from an edge to an endpoint, $u _ 0$,
with no other endpoints in the strip, partition the rectangle $R = (R-S,S)$, with
$|S| = 2 \lfloor (D _ 0 - 1) / 2 \rfloor$
with all four endpoints in $(R-S)$
and no endpoints in $S$.

Recursively solve $(R-S)$.

Create a Hamiltonian cycle in $S$ (always possibile since $S$ even) and join
at the corner to either of the two paths in $(R-S)$.

##### $(1,3)$ split

Choose a cleave cut that partitions $R = (R _ 3, R _ 1)$ with exactly one endpoint
in $R _ 1$ and the other three endpoints in $R _ 3$, with $|R _ 1| \ge 10$,
$|R _ 3| \ge 10$ and with Chebyshev distance of the nearest endpoints to the cleave $\ge 2$.

Choose a virtual endpoint in $R _ 1$ that matches a sibling virtual endpoint in $R _ 3$
with the color of endpoint in $R _ 1$.

Recursively solve for $k=2$ ZZN on $R _ 3$ and IPS HamPath on $R _ 1$.

##### $(2,2)$ independent split

Choose a cleave cut that partitions $R = (R _ 2, S _ 2)$ such that
two endpoints of the same color are in $R _ 2$ and the other two endpoints are
in $S _ 2$.

There's some fiddling with how far the endpoints need to be to the cleave
and some convincing that if there's a cleave far enough from the endpoints
that the solution exists, but, if so, then IPS can be run on $R _ 2$ and $S _ 2$
independently.

##### $(2,2)$ cross split

This, in my opinion, is the difficult case.

To re-iterate, the instance is feasible (color compatible, topological compatible,
no forbidden patterns/is admissible, etc.) but the endpoints appear in a "cross" pattern.

Qualitiatively, the endpoints are far enough apart from each other, so that no $(0,3)$ split
can occur, are diagonal from each other, so no $(1,3)$ split can occur
and are in a "cross" pattern, so no $(2,2)$ independent split can occur.
Further, qualitatively, one of the paths will need to streak across diagonally while
the other will need to meander around and endpoint of other path.

The goal is to choose a cleave cut, $R = (U _ 2, V _ 2)$, with two new virtual endpoints per
sub-rectangle, that act as docks from the original endpoints to the cleave partition line.

If the cleave cut is far enough away from each of the endpoints, and the clave line is
long enough, then there should always be a choice of virtual endpoint locations to ensure
no forbidden pattern is triggered, ensuring a solution and allowing the recursion to go through.

##### Discussion

All instances with $n \le 10$  or $m \le 10$ can have `plugdp` run to find a solution.

For instances with $n, m > w$, the idea is that we can always find a cleave to
recur into one of the split cases.
The buffer between endpoints and the cleave cut means that $w$ probably needs to be greater
than 10.
I don't think it needs to be greater than 30 and we might be able to get away with 20 (maybe 25).

A kind of worst case is when all endpoints are roughly equidistant from each other and the corners
and are roughly on a diagonal, alternating with each other.

I think Chebyshve distance 2 from the edge is enough to neutralize any constraint issue, and
distance 4 from endpoints is enough, with maybe an extra for parity issues (so 5).

So:

```
|2s5t5s5t2| => 4 + 4 + 15 = 23
```

If distance is 6:

```
|2s6t6s6t2| => 4 + 4 + 18 = 26
```


So choose $w=26$ with the understanding that anything $\le 12$ on a side will be taken by `plugdp`.

The algorithm is probably pretty straight forward.
Formal verification is going to be more challenging.

Here's an empherical testing schedule:

* $n=[24,25,\dots,32],m=[24,25,\dots,32]$, place $s _ 0, t _ 0, s _ 1, t _ 1$ in a 'cross' pattern,
  each near the corner in a $4 \cross 4$ window
* $n=[24,25,\dots,32],m=[24,25,\dots,32]$, place $s _ 0, t _ 0, s _ 1, t _ 1$ randomly, restricted to the
  leftmost strip of $24$
* $n=[24,25,\dots,32],m=[24,25,\dots,32]$, place $s _ 0, t _ 0, s _ 1, t _ 1$ placed randomely



###### 2026-09-23

The goal is to find a finite number of patterns that classify when
an initial configuration is good or bad.
The working premise is that the number of classifiable patterns
is finite, so can be tested for.
If the pattern matches pass, so there's no reason why there wouldn't be
a solution, then the idea is to then use some type of recursive algorithm
to descend onto a solution.

It's clear there are a few necessary conditions:

We'll be using $R(n,m)$ with $n$ rows, $m$ columns.
$s _ 0, t _ 0,  s _ 1, t _ 1$ will be endpoints,
which can be references as e.g. $s  _ 0 = (s _ {0,x}, s _ {0,y})$,
where $s _ {0,x}$ is the column and $s _ {0,y}$ is the row ($R(n,m)$ is
reversed in this way as $R(\text{rows},\test{columns})$ has the y-axis
first).

* color compatibility
* topological compatibility
  - endpoints around the perimeter can't alternate
  - a $2 \cross 2$ square can't have an alternating endpoint pattern
* constraint compatibility
  - follow local constraints to extend path to make sure no contradictions
    are encountered
  - do a topological compatibility test after constraint propagation has settled

The above conditions are necessary but insufficient.

There are some solutions where inference needs to be done.

---

Let's settle on terminology: *weakly forbidden patterns* or a *weak forbiddent pattern*.
This is a pattern that on it's own might not create a contradiction but paired with some
other pattern might.

For example:

```
. A .       . B .
A . .  ...  . . B
. . .       . . .
  :           :
```

The corner is forced but doesn't necessary preclude an answer on it's own.
When both appear, it's infeasible.

Call a *strongly forbidden pattern* or *strong forbidden pattern* one that is infeasible.

For example:

```
. A .
B . . ...
. . .
  :
```

Catalogue of implied weak widgets:

```
A B .         a A B .         a A .         a A b & .
@ . . ...     @ . . . ...     a B . ...     a a B . .
. . .         . . . .         @ . .         a a . . . ...
  :             :             . . .         @ . . . .
                                :           . . . . .
                                                :


a A .
a @ . ...
B . .
. . .
  :
```

Some enumeration is necessary for the folowing:

```
A a B .       A b B .
a a . . ...   a & . . ...
@ . . .       @ . . .
. . . .       . . . .
  :             :
```

```
a a A .         b b A .
a @ . . ...     b & . . ...
B . . .         B . . .
. . . .         . . . .
  :               :
```

Needs verification but might be a catalogue of strongly forbidden patterns and weakly forbidden
patterns for 2 endpoints.
Not confirmed but I think they all appear near the corner.

---

For 3 endpoints, here are some strongly forbidden patterns (excluding 2-endpoint strong forbidden patterns):

```

A.B...     ..A...     B.A...
.A....     BA....     ......
                      A.....

odd/even    odd       odd/even
```

```
. . A .         B A .
B A . . ...     A . . ...
. . . .         . . .
  :               :

```

Weakly forbidden patterns conditioned on fourth endpoint (`B`) being on perimeter:

```
.AA...  .AA...  .A.A..  .A..A.  .A..A.  .A...A  .A....  .A....  .A....  .A....
.B....  ..B...  .B....  .B....  ..B...  .B....  .BA...  ..AB..  ..A...  ..A...
......  ......  ......  ......  ......  ......  ......  ......  ..B...  ......
                                                                        .B....

.A.B..  .A....  .A....  .A....  ..A...  ...A..  ....A.  ....A.  .....A
...A..  ...B..  ......  ......  B.....  BA....  BA....  B.....  BA....
......  .A....  .AB...  .A....  .A....  ......  ......  .A....  ......
                        .B....
```

Worked out:

```
A a a @ .       a A A .       a A A @ .
a A B . . ...   a B . . ...   a . B . . ...
@ . . . .       @ . . .       . . . . .
. . . . .       . . . .           :
    :             :

a A a @ .       a A a @ .       a A a @ .
a B A . . ...   a a A . . ...   a a a . .
@ & . . .       a a B . .       a A B . . ...
. . . . .       @ . . . .       @ . . . .
    :               :           . . . . .
                                    :

b b A @ .
B b & . .
a A . . . ...
@ . . . .
. . . . .
    :
```

boundary:

```
A.....   A.....   .AA...   .A..A.   ....A.
.AB...   .A....   .B....   .B....   BA....
         ..B...
```

This is the weak 2-forbidden pattern with an extra endpoint at (row=0,col=5):

```
....A.    bbbbA.
..B...    bbB&..
.A.... => aA....
......    @.....
          ......
```

---

Patterns of note:

```
. . A .
. . A . ...
. B . .
. . . .
  :
```



