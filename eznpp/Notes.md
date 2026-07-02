Notes
---

###### 2026-07-02

No, I've fundamentally failed to understand.
Whatever method I was thinking of is wrong.

Consider [1,2,1] with prime 3, and cluster [1,1,.], [.,1,1].
Each cluster is 0 (mod 3) but total is 1 mod 3.

The clusters need to be independent, at least, within
the prime base vector.

A simpler test is to choose a bag of clusters,
where the bag is made up from repeated independent
partitions within a prime vector,
enumerate solutions and see if there's an independent
set that matches within each prime vector base.


###### 2026-07-01

In the middle of debugging:

I'm choosing a whole cluster and flipping sign there.
The last cluster never gets past 4 matched (of 80).
It shouldn't be that bad?



###### 2026-06-30

An idea that most likely won't work but at least attempts
to address the rocky energy landscape:

* Take small clusters of answers mod p and create an energy
  function that attempts to maximize number of clusters satisfied

In more detail:

* $A = (a _ 0, a _ 1, \dots, a _ {n-1})$, each $a _ k$ fixed but
  assumed to be drawn uniformly from $[1,M = 2^m]$, with $m < n$
* Take $P = (p _ 0, p _ 1, p _ 1, \dots, p _ {S-1})$, a list
  of primes such that $\prod _ {k=0}^{S-1} p _ k \ge \sum _ {k=0} ^ {n-1} a _ k$
  - we can leave out $2$ (so only odd primes) as it won't add anything to
    our algorithm
* Take $L = \beta n$, ( $\beta > 1$ )
* For each prime, $p _ k$, take a sub-cluster size to be $w _ k = \alpha \lg(p _ k)$
  ( $\alpha > 1$ )
* Create $\eta _ k = \lceil L / w _ k \rceil$ clusters, chosen randomely
  - for each cluster, find a solution $\bmod p _ k$,
  - call the solution cluster
    $\kappa _ {k,j} = ( \sigma _ {k,j,0}, \sigma _ {k,j,1}, \dots, \sigma _ {k,j, w _ k})$
  - do your best to find $\eta _ k$ solution clusters with the sub-cluster size $w _ k$
    but if a cluster can't be found or numbers need to be fudged, fudge them
* Create an energy function $E(\sigma)$, with $\sigma = (\sigma _ 0, \sigma _ 1, \dots, \sigma _ {n-1})$,
  $\sigma _ k = \pm 1$:
  - $c _ k = S( \gamma _ k \cdot (\text{no. } \kappa _ {k,j} \text{ that match } \sigma) / \eta _ k - \mu _ k )$
  - $S(u) = 1 / ( 1 + e^{-u} )$ (sigmoid function)

The sigmoid function is probably premature but it's trying to weight clusters less that
already have enough satisfied to fully cover the $\bmod p$ column while weighting
clusters that have fewer clusters satisfied more.

$\gamma _ k$  and $\mu _ k$  are terms to rescale and recenter the sigmoid so that the $1/2$
point is roughly where the number of clusters is expected to cover the whole $\bmod p _ k$ column.
Covering each prime is essentially a coupon collector, which scales as $n \lg(n)$, so we expect
about $n \lg(n) / w _ k$ clusters before we cover each prime.

Note that I believe it should be number of clusters fully alike as we're not really concerned
about partial satisfaction by clusters.
In other words, we let the number of clusters satisfied (fully) try to smooth out the energy
function, rather than allow for partial clusters satisfied to smooth it out.

I suspect this doesn't do much to smooth out the energy function but it's an attempt to.

As of this writing, this is all pure speculation and has no evidence, one way or the other.

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

