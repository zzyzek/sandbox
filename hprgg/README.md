Hamiltonian Paths on Rectangular Grid Graphs
---

Finding Hamiltonian paths in 2d rectangular graphs is polynomial time solveable (Itai, Szwarcfiter 1982).

$$
\begin{array}{ll}
 G = (V, E) & \\
 R(m,n) & \text{ Rectangle of width, height } m, n \in \mathbb{Z} \\
 V _ {x,y} & \text{ Vertex at } x,y \in \mathbb{Z}\\
 E _ {u,v} & \text{ Edge from point } u = (u _ x, u _ y) \text{ to } v = (v _ x, v _ y) \\
 s \in V & \text{ Start vertex of Hamiltonian path} \\
 t \in V & \text{ End vertex of Hamiltonian path} \\
 c(\cdot) : V \to \{0,1\} & v \in V, c(v) = v _ x + v _ y  ( \bmod 2 ) \\
\end{array}
$$

Where $c(\dot)$ is called the "color" function, assigning a color to 0 or 1 as appropriate.

We'll call a Hamiltonian path from $s$ to $t$ in a rectangular grid graph as an $st$-Hamiltonian path.

For an $st$-Hamiltonian path to exist, it must have the following properties:

###### Color Compatibility 

$$
\begin{array}{ll}
 & (|V| \equiv 0 (\bmod 2) \text{ and } c(s) \ne c(t)) \\
\text{ or } & (|V| \equiv 1 (\bmod 2) \text{ and } c(s) = c(t) = c(V _ {0,0}))
\end{array}
$$

###### $1 \cross n$ Rectangle Compatibility

$$
\begin{array}{ll}
 & R (m,n=1)  \\
 \text{ and } & (( s = V _ {0,0}, t = V _ {m-1,0}) \\
 \text{ or } & (s = V _ {m-1,0}, t = V _ {0,0} )) \\
\end{array}
$$

###### $2 \cross n$ Rectangle Compatibility

$$
\begin{array}{ll}
 & R (m,n=2) \\
 \text{ and } & (( s _ x = 0 \text { or } s _ x = m-1 ) \\
 \text{ or } & ( t _ x = 0 \text { or } t _ x = m-1 ) \\
 \text{ or } & ( t _ x \ne s _ x ))
\end{array}
$$


###### $3 \cross n$ Rectangle Compatibility

$$
\begin{array}{ll}
 & R (m,n=3) \\
 \text{ and } & ((|V| \equiv 1 (\bmod 2)) \\
 \text{ or } & \ (|V| \equiv 0 (\bmod 2) \\
 \text{ and } & \ \ c(s) \ne c(t) \\
 \text{ and } & \ \ c(s) \ne c(V _ {0,0}) \\
 \text{ and } & \ \ (( s _ x < t _ x -1 ) \\
 \text{ or } & \ \ \ (( s _ y = 2 ) \text{ and } (s _ x < t _ x))))) 
\end{array}
$$

### Antipodes

Endpoints $s,t$ are called *antipodes* if, for $R(m,n) (m \ge n)$, $s _ x \in \{0,1\}, t _ x \in \{m-2, m-1\}$.
That is, $s,t$ fall within the left and rightmost width 2 strips of the rectangle.


### Comments

As intuition, as a rectangle increases, the number of Hamiltonian paths increases at such a rate
that the only thing precluding it would be color compatibility.
For small or intermediate sizes, special cases need to be considered to make sure a path isn't precluded
but these fall into a small set of classes that are easily tested.

IPS prsents an algorithm for construction that relies on subdiving the rectangle
till manageable sizes are obtained, making sure that each step retains an admissible
Hamiltonian path in each sub-rectangle.

The algorithm needs to consider some extra cases for configurations, specific to the method
of subdivision.

### Stripping

A rectangle, $R$, has a *separation* if it can be partitioned into two disjoint sub-rectangles, $R _ 0$, $R _ 1$.

A $strip$ for a Hamiltonian path problem on $(R,s,t)$ if:

* $S, R-S$ is a separation of $R$
* $s,t \in R-S$
* $(R-S,s,t) is acceptable$

### Splitting

If $\text{Acceptable}(R,s,t)$, $(p,q) \in E(R,s,t)$, $(p,q)$ *splits* $(R,s,t)$ if $R _ p, R _ q$ partitions $R$ such that:

* $s,p \in R _ p$, $\text{Acceptable}(R _ p, s, p)$
* $q,t \in R _ q$, $\text{Acceptable}(R _ q, q, t)$

### Prime Problems

$(R,s,t)$ is *prime* if it cannot be stripped or split.

Note that $(R,s,t)$ can be both acceptable and prime.

### Proof Structure (IPS)

A Hamiltonian path is *forbidden* if it is not $1\cross n$, $2 \cross n$ or $3 \cross n$ compatible.

> *Lemma 3.1*: If $(G,s,t)$ is forbidden, then there is no Hamiltonian path from $s$ to $t$ in $G$.

A Hamiltonian path is *acceptable* if it is color compatible and not forbidden.
That is, a Hamiltonian path is *acceptable* if it is color compatible,
$1\cross n$, $2 \cross n$ and $3 \cross n$ compatible.

> *Theorem 3.1*: If a Hamiltonian path exists from $s$ to $t$ in $G$, then $(G,s,t)$ is acceptable.

Note: $\text{HamPath}(G,s,t) \to \text{ Acceptable}(G,s,t)$, proving that acceptability is necessary for a Hamiltonian path
but, at this point, acceptability is insufficient to provie Hamiltonicity.

> *Lemma 3.2.1*: If $\text{Acceptable}(R,s,t)$, $S$ strips $R$ and $\text{HamPath}(R-S,s,t)$ then $\text{HamPath}(R,s,t)$.

> *Lemma 3.2.2*: $\text{Acceptable}(R(m,n),s,t)$ with $R(m,n)$ unable to be stripped, and $2 \le n \le m$, $(n,m) \ne (4,5), (4,4)$, then
> $s,t$ are antipodes.

> *Lemma 3.2.3*: $(p,q) \in E(R,s,t)$, $(p,q)$ splits $(R,s,t)$ into $R _ p, R _ q$, if $\text{HamPath}(R _ p, s, p)$, $\text{HamPath}(R _ q, q, t)$,
then $\text{HamPath}(R,s,t)$.

> *Lemma 3.2.4*: $\text{Acceptable}(R(m,n),s,t)$ but $(R(m,n),s,t)$ cannot be stripped or split, then $(n,m) = (4,5)$ or $n, m \le 3$.

> *Lemma 3.2.5*: $\text{Acceptable}(R(5,4),s,t) \to \text{ HamPath}(R(5,4),s,t)$.

> *Lemma 3.2.6*: $\text{Acceptable}(R,s,t) \to \text{ HamPath}(R,s,t)$.

> *Theorem 3.2*: $\text{Acceptable}(R,s,t) \iff \text{ HamPath}(R,s,t)$.


### Discussion

Acceptibility is shown to be necessary (all Hamiltonian paths must be acceptable).

Sufficiency is shown by:

* showing that stripping and splitting reduce the problem and allow for Hamiltonian paths in the sub problems
* showing that acceptibility is sufficient for the small, finite number of cases cases that stripping and splitting
  can't be done









References
---

* ["Hamiltonian Paths in Grid Graphs" by A. Itai, J. L. Szwarcfiter](https://epubs.siam.org/doi/10.1137/0211056)


