Notes
---

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

