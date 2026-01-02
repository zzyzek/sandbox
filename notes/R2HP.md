Hamiltonian Paths in 2D Rectangles
===

Companion to Itai, Papadimitriou and Szwarcfiter (IPS).

Glossary
---

| Term | Description |
|---|---|
| $s$ | $s \in \mathbb{Z}^2$, start of Hamiltonian path |
| $t$ | $t \in \mathbb{Z}^2$, end of Hamiltonian path |
| $R = R(m,n)$ | rectangle region of width $m$ and height $n$ |
| $(R,s,t)$ | Hamiltonian path problem |
| $V(R)$ | vertices in rectangle $R$ |
| separation of rectangle $R$ | A partition of $R$ into two subrectangles ( $V(R) = V(R _ 0) \cup V(R _ 1)$, $V(R _ 0) \cap V(R _ 1) = \emptyset$ ) |
| acceptable | $(R,s,t)$ has no forbidden patterns |
| strip | |
| split | |

Stripping
---

$S$ strips $(R,s,t)$ if

1. $S, R-S$ is a *separation* of $R$
2. $s,t \in R - S$
3. $(R - S, s, t)$ is *acceptable*

> *Lemma 3.2.1* Let $(R,s,t) be an acceptable Hamiltonian path problem with $S$ that strips $R$.
> If $(R-S,s,t)$ has a solution, then $(R,s,t)$ also has a solution.

I think IPS is just wrong and $S$ must have $\min(S _ w, S _ h) \ge 2$.
It's not forced even, but it must be at least of size 2 in the smaller dimension.

If $\min(S _ w, S _ h) \ge 2$, then there exists an edge $(p,q) \in R-S$ that faces $S$ that can be joined
as follows:

```
 S      R-S          S      R-S
* * : *-*-* t       *-* : *-*-* t
    : |   | |       | | : |   | |
* * : *-* *-*       * * : *-* *-*
    :   |           | | :   |
* * : p-* s-*       * *-:-p-* s-*
    : |     |       |   :       |
* * : q-*-*-*       *-*-:-q-*-*-*
```

* $\min(S _ w, S _ h) \ge 2$ with $R-S$ even width or even height (or both), then $s,t$ are opposite color
  and $p,q$ will be opposite color, with the corresponding join also being opposite color, thus color
  compatible
* $\min(S _ w, S _ h) \ge 2$ with $R-S$ odd width and even height, then $s,t$ are both the majority color,
  then the only admissible strip is of even width.
  - odd width strip would make $s,t$ color incompatible
  - even width means $p,q$ opposite color and color compatible, as well as the joining $p,q$ siblings

Comments:

* $m,n$ both even, then width can be $k \ge 2$
* $m,n$ one even, one odd, then strip must be even ($2k$) as:
  - removing a column of odd elements would leave $R-S$ with both sides odd,
    making $s,t$ color incompatible
  - removing a column of even elements would leave $R-S$ with both sides odd,
    making $s,t$ color incompatible
* $m,n$ both odd, the strip must be even ($2k$) as removing an odd column of elements would leave $R$ even,
  making $s,t$ color incompatible

### Antipodes

$m \ge n$, $u,v \in V(R(m,n))$, $u,v$ antipodes if:

* $v _ x \le 1$
* $w _ x \ge m-2$

Examples:

```
v * * * * *   v * * * * *   * * * * * *   * * * * * w
* * * * w *   * * * * * *   * v * * w *   * * * * * *
* * * * * *   * * * * * w   * * * * * *   * v * * * *
```

> *Lemma 3.2.2* Let $(R(m,n),s,t)$:
> * be acceptable
> * has $2 \le n \le m$
> * has $(m,n) \notin \{ (5,4), (4,4) \}$
> * unstrippable
> then $s,t$ ar antipodes




