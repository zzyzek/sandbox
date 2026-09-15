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





References
---

* ["Hamiltonian Paths in Grid Graphs" by A. Itai, J. L. Szwarcfiter](https://epubs.siam.org/doi/10.1137/0211056)


