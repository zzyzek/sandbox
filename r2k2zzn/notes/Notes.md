Notes
===

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



