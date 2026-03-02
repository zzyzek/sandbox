Notes
---

###### 2026-03-02

As mentioned elsewhere, methods like constraint programming are likely doomed.
The constraints are long reaching so small changes will have drastic effects.

In other words, the eneryg landscape is too jagged and using it, implicitely
or otherwise, is doomed to failure as the noise will overpower any signal.

Problems like random 3SAT and Hamiltonian Cycle effecitvely use flat energy
landscapes to their advantage, traversing it with knowledge that they aren't
undoing the progress they've made and have early backtrack methods to get out
of dead-ends early on.

I remain skeptical that the (uniform) random number partition problem (NPP) has no
method of energy landscape interpretation that makes it amenable to solution,
even very far away from the transition, but I think concsensus is that (uniform random)
NPP is completely unsoluable because of this.

---

One experiment to do is to try and use ideas from lattice reduction more directly
and investigate lattice orthogonality defect reduction techniques.
Maybe try to look at eigenvalues as the algorithm progresses.
There's some indiciation that looking at minimum eigenvalue might give some early
stopping criteria, though I'm unclear as to how that works exactly.

The [orthogonality defect](https://en.wikipedia.org/wiki/Lattice_reduction) is defined
as the product of the basis vector lengths divided by the volume of the parallelepiped
volume:

$$
\delta(B) = \frac{ \prod _ {k=0}^{n-1} ||b _ k|| }{ \sqrt{ \det(B^{T} B) } }
$$

As a refresher, LLL works by Gram-Schmidt orthoganization and then swapping
basis rows to maintain some type of order.

Gram-Schmidt orthogonalization:

$$
\begin{array}{l}
\text{GramSchmidt}(B = [b _ 0, b _ 1, \dots, b _ {m-1}] \in \mathbb{R}^{n,m} ) \\
\ \ b^{ * } _ 0 = b _ 0  \\
\ \ \text{for } k \in [2,3,\dots,(m-1)] \text{ do} \\
\ \ \ \ b ^ { * } _ k \leftarrow b _ k - \sum _ {j=1} ^ {k-1} \frac{ \left< b _ k, b ^ { * } _ j \right> }{ \left< b ^ { * } _ j, b ^ { * } _ j \right> } \cdot b ^ { * } _ j \\
\ \ \text{return } [ b ^ { * } _ 0, b ^ { * } _ 1, \dots, b ^ { * } _ {m-1} ]
\end{array}
$$

In other words, subtract off components to force them parallel.

The GS process doesn't change the defect as it doesn't change $\text{det}(B ^ T B)$.

We can define 
$\mu _ {k,j} = \frac{ \left< b _ k, b ^ { * } _ j \right> }{ \left< b ^ { * } _ j, b ^ { * } _ j \right> }$.

We *weakly reduce* the basis by applying integral linear transformations to constrain $|\mu _ {k,j}| \le 1/2$.
The ordering of the basis along with the triangular structure of the (implied) $\mu$ matrix allows for this.
As before, weak reduction does not change the defect.

Once the basis is weakly reduced, a *strong reduction step* is done by choosing to swap two basis vectors
such that $||b ^ { * } _ k||^2 > 2||b ^{ * } _ {k + 1}||^2$.
If no such basis vectors can be found, this is when LLL stops and the basis is said to be *strongly reduced*.

Strongly reduced basis are within an exponential bound of the optimally reduced basis, giving a strong enough
bound for many applications.

I'm still ignorant of BKZ and I think that's pretty standard now, so it might be good to review.


###### 2025 ...

* integral finite domain of variable values
* constraints of given type that take in 3 variables and we only need modadd
  - modsum (equal can be derived with a `0` variable as input)


To do basic AC3, try this:

```

contradiction = false
Q = []

do:

  foreach v,d_v = Q:
    D(v) -= d_v
    if |D(v)| == 0:
      contradiction = true
      break
  Q = []

  foreach v \in V:
    foreach c \in C(v):
      w,u = C(v)
      foreach d_v in D(v):
        support = false
        foreach d_u in D(u):
          foreach d_w in D(w):
            if C(u,v,w):
              support = true
              break
          if support: break
        if !support:
          Q.push(v, d_v)

while |Q| > 0;

```

The validation needs to come from experimentation, so I don't know how good a chance
this has of succeeding.

Here's my current thoughts on encoding:

* Call $a _ { j , k }$ the number $a _ j \% p _ k$, ($p _ k$ small prime)
* Construct a sum tree on the $a _ { j, k }$ fixing $k$ but varying $j$
* Construct a sum tree on the $\sigma _  j \cdot a _ { j, k }$ for each $q _ h$
  - $H$ distinct trees each summing to $(\sum _ {k} \sigma _ j \cdot a _ {j,k} ) \% q _ h$
  - a top connecting node enforcing the final $q$ sum

The second $q$ sum tree might be superfluous.
The idea is to try and kind of do a 'low pass filter' on the energy function but I'm not
sure if this has any hope of working.

The big problem here is that if the soften doesn't get all of the sigmas,
even one will either create a contradiction or propagate through the whole
subtree.

