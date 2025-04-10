References
---

* [lozenge tilings (viz)](https://ar5iv.labs.arxiv.org/html/2210.01098)
* [lutanhho.net](https://lutanho.net/pic2html/draw_sfc.html)
* [Zhang etal paper](https://www.researchgate.net/publication/220859824_A_Pseudo-hilbert_Scan_Algorithm_for_Arbitrarily-Sized_Rectangle_Region)


---

###### 2025-04-10

Some notes on terminology:

* `defect` : measure of how far away a cuboid is from being a cube, defined as $\lambda(w,h,d) = \frac{ w \cdot h \cdot d }{ (\text{min}(w,h,d))^3 }$
  or $\lambda(w,h) = \frac{ w \cdot h }{ (\text{min}(w,h))^2 }$
* `eccentric` : state of a cuboid if it's past a certain defect threshold (e.g. $\frac{2}{3}$)
* `loaf` : the cuboid subdivision that represents the bulk recursion step (maybe should be called jakub/cervany subdivision?)


###### 2025-04-04

OK, so I think we've come through.

All the complicated analysis below points to trying to choose a $\sigma$ to split
and $\rho$ that will make the appropriate inequality work out.

From inspection of the $\sigma$, $\rho$ graph on when regions switch from below/above,
the crossover point is when $\sigma = \frac{3}{2}$ ( $\rho = \frac{2}{3}$ ).

So, say we fix $\sigma = \frac{3}{2}$ and $\rho = \frac{2}{3}$.

We have:

$$
\begin{array}{ll}
 & \rho = \frac{2}{3}, \sigma \ge \frac{3}{2} \to \\
 & \text{min}( \rho \sigma s, s ) = s \\
 & \text{min}( (1-\rho) \sigma s, \frac{s}{2} ) = \frac{s}{2} \\
\to & \lambda(V _ 0) = \sigma \\
\to & \lambda(V _ 1) = 4(1-\rho)^2 \sigma + \rho^2 \sigma \\
 & = \frac{8 sigma}{9} \\
\to & \lambda(V _ 1) < \lambda(V _ 0)
\end{array}
$$

To be more verbose, choosing $\sigma \ge \frac{3}{2}$ means the minimum
axis for the $A$ and $B$ volumes are $\frac{s}{2}$ and $s$ respectively.
Choosing $\rho = \frac{2}{3}$ puts us in the negative region for the
$g _ A g _ B$ constraint polynomial ( $\frac{3}{5} < \frac{2}{3} < 1$ ).

---

When $d << w \sim h$ or $h << w \sim d$, call $\eta s$ the longer dimension and $s$ the small one
( $\eta > 1$ ).
Split at the half way point as in the 2d case.

So:

$$
\begin{array}{ll}
 & \lambda(V _ 0) = \eta^2 \\
 & \text{min}(\frac{\eta s}{2}, s) = \frac{\eta s}{2} \\
\to & \lambda(V _ 1) = (\frac{1}{2}) ( \frac{ \frac{\eta^2}{4} }{ \frac{\eta^3}{8} } ) + ( \frac{1}{2} ) ( \frac{ \frac{\eta}{2} \eta }{ \frac{\eta^3}{8} } ) \\
  & = \frac{3}{\eta} \\
 & \lambda(V _ 1) < \lambda(V _ 0) \\
\to & \frac{3}{\eta} < \eta^2 \\
\to & \eta > 3^{\frac{1}{3}} \\
\to & \eta _ { * } = \frac{3}{2} > 3^{\frac{1}{3}} \\
 & \text{min}(\frac{\eta s}{2}, s) = s \\
\to & (\frac{1}{2}) ( \frac{\eta^2}{4} ) + (\frac{1}{2}) (\frac{\eta^2}{2}) \\
 & = \frac{3 \eta^2}{8} < \eta^2
\end{array}
$$

So choosing the split threshold to be $\frac{3}{2}$ in this case will yield progress.

---

In the case of $w = s << h \sim d = \eta s$, this is effectively like the case where $w >> h \sim d$,
and we can use the same threshold for $\eta = \frac{3}{2}$ with $\rho = \frac{2}{3}$.

---

That should cover all the special cases.
There still might be some fiddling if the assumption that the equal dimensions are too disparate,
so we should think about that a bit more.

A quick recap:

* The bulk recursion is handled jakub split (`gilbert3d_case.html`)
* There are six special cases when one dimension is significantly greater
  than or less than the other two:
  - $S _ 0$ : When $w >> h \sim d$, with a single split at the halfway point in $W$ (effectively making two copies)
  - $S _ 1$ : $d > (\frac{3}{2}) h$,  split in $d$ then again in $w$ (a pseudo 2d split)
    + $h << w \sim d$, take the split in $d$ at the halfway point and the other split at the halfway point in $w$
    + $d >> w \sim h$, take the split in $d$ to be $\frac{2}{3}$ with the remaining $\frac{1}{3}$ split in $w$ at the halfway point
  - $S _ 2$ : $h > (\frac{3}{2}) \text{min}(w,d)$
    + $h >> w \sim d$, split in $h$, top $\frac{2}{3}$ and remaining $\frac{1}{3}$ at the halfway point in $w$
    + $h \sim w >> d$, split at the halfway point in $h$ and again at the halfway point in $w$
    + $h \sim d >> w$, split in $h$, top $\frac{2}{3}$ and remaining $\frac{1}{3}$ at the halfway point in $w$

So I think this highlights the unequal dimensions.
We need to figure out how to choose what "similar" means to choose
between the $\frac{2}{3}$ and the $\frac{1}{2}$ split case.

Most of the complexity comes from requiring the split to be in the $w$ dimension because of the start/end path restriction,
in addition to needing non-halfway splits to ensure defect reduction when the $w$ splits would make the split volumes too
"plank-like".

I'm a little wary because the `gilbert3d` code has some $\frac{4}{3}$ constants floating around, maybe suggesting there
are better bounds/thresholds to split on (or that the ones I've calculated are incorrect).

---

So, instead, let's just choose $\rho = \frac{2}{3}$ everywhere there's a special case split.

---

One issue that needs to be careful with is when splitting in the $w$ dimension.
If this becomes a sheet of 1, we need to be sure to catch it and handle the recursion properly.

###### 2025-04-03

This is me thinking out loud a bit.

For the uneven cases, where the bulk volume strays from being
cube like (the defect is significantly greater than 1), we have
a few choices to split:

* Choose a $\sigma$ proportion of one or two axies relative to the
  third as the threshold to split on but otherwise split at the
  halfway point, either with one split or two
* Choose one split point at the halfway mark in one dimension but
  at the $\rho$ point in the other

In my case analysis below, one of the pathological cases is when
two of the dimensions are significantly smaller than the third,
leading to a choice of second split point that's larger than $\frac{1}{2}$.

I'm not sure this pathological case is so relevant and it might be better
to analyze based on small defect deviations.

---

I'm still working through calculations but I wanted to put them here
for some reference.

This is for the case where $w \sim h = s$, $d = \sigma s$.
We're splitting half in the $w$ axis but we have a choice of $\rho$
for the split point in the $h$ axis (see below ASCII diagram).

$A$ and $B$ are the smaller volumes, $V _ 0$ is the original volume and
$V _ 1$ is the new partitioned volume.

$$
\begin{array}{ll}
  \lambda(V _ 0) = \sigma \\
  \lambda(V _ 1) = (1-\rho) \lambda(A) + \rho \lambda(B)  \\
  l _ B  \to \rho \sigma s < s \to \rho < \frac{1}{\sigma} \\
  g _ B  \to \rho \sigma s > s \to \rho > \frac{1}{\sigma} \\
  l _ A  \to (1-\rho) \sigma s < \frac{s}{2} \to \rho > 1- \frac{1}{2 \sigma} \\
  g _ A  \to (1-\rho) \sigma s > \frac{s}{2} \to \rho < 1 - \frac{1}{2 \sigma} \\
\end{array}
$$

$$
\begin{array}{ll}
  l _ B l _ A & \to \lambda(V _ 1) = \frac{(2-\rho)}{\rho (1-\rho) \sigma^2 }, (\sigma < \frac{3}{2}) \\
  l _ B g _ A & \to \lambda(V _ 1) = 4 (1-\rho)^2 \sigma + \frac{1}{\rho \sigma^2} \\
  g _ B l _ A & \to \lambda(V _ 1) = \frac{1}{2(1-\rho)\sigma^2} + \sigma \rho^2 \\
  g _ B g _ A & \to \lambda(V _ 1) = 4(1-\rho)^2\sigma + \rho^2 \sigma, (\sigma > \frac{3}{2}) \\
\end{array}
$$

$$
\begin{array}{l}
 \lambda(V _ 1) < \lambda(V _ 0) \to \\
  l _ B l _ A \to \rho^2 \sigma^3 + \rho(-\frac{1}{2} - \sigma^3) + 1 < 0, (\{ \frac{ (\frac{1}{2} + \sigma^3) \pm \sqrt{ (\frac{1}{2} + \sigma^3)^2 - 4\sigma^3 }}{2 \sigma^3} \} ) \\
  l _ B g _ A \to (3\sigma^3)\rho^3 - (8\sigma^3)\rho^2 + (4 \sigma^3) \rho + 1 < 0 \\
  g _ B l _ A \to -\rho^3 + \rho^2 + \rho - 1 + \frac{1}{2\sigma} < 0 \\
  g _ B g _ A \to 5 \rho^2 - 8 \rho + 3 < 0, ( \{ 1, \frac{3}{5} \} ) \\
\end{array}
$$

For convenience, here's some gnuplot commands:

```
ll(x,c) = (x*x*c*c*c) + (x*(-0.5 - (c*c*c))) +1
lg(x,c) = (3*c*c*c*x*x*x) - (8*c*c*c*x*x) + (4*c*c*c)*x + 1
gl(x,c) = (-x*x*x) + (x*x) + (x) -1 + (1.0/(2.0*c))
gg(x,c) = (5.0*x*x) - (8.0*x) + 3

plot [0:1] ll(x,1), ll(x,1.25), ll(x,1.5), ll(x,1.75), ll(x,2), ll(x,3), 0
plot [0:1] lg(x,1), lg(x,1.25), lg(x,1.5), lg(x,1.75), lg(x,2), lg(x,3), 0
plot [0:1] gl(x,1), gl(x,1.25), gl(x,1.5), gl(x,1.75), gl(x,2), gl(x,3), 0
plot [0:1] gg(x,1), 0
```

Assuming all the above equations are derived correctly, and I don't have any other errors in logic,
there's a defect reduction when those inequalities hold.
That is, for values of $\rho$ that the respective inequality is less than zero (if a value of $\rho$ exists) will
lead to a reduction in defect.

So, ideally, we're trying to find a fixed $\sigma$ as the threshold value to go from
the bulk recursion to this special case recursion, with a fixed $\rho$ that will ensure progress.



###### 2025-04-02

See `gilbert3d_case.html` for the bulk recursion atlas.

The issue I'm fussing with now are the cases where one dimension
is significantly larger than the others.

There are six cases:

$$
\begin{array}{l}
w >> h,d \\
h >> w,d \\
d >> w,h \\
w,h >> d \\
w,d >> h \\
h,d >> w \\
\end{array}
$$

Where we assume the begin/end are on the width axis.

How and why to split the cuboid for the recursion
make questions of motivation more apparent.

Here are some proposals of what qualities we want keep during the recursion:

* for powers of two, the recursion should reduce to the Hilbert curve case
* the recursion should not introduce any more notches than is forced by
  initial conditions (start/end path conditions and cuboid size)
* for two dimension that are powers of two but the other exactly 1, it should
  reduce to the 2d Hilbert curve case
  - There's a pathological case that should be ignored when $w=1$ and $h,d>1$
* keep the bulk cuboid region as cube like as possible
* when splitting, maximize entropy (principle of maximum entropy)
* the number of edges aligned with the axies should be relatively proportional to the
  dimension of the cuboid
* the algorithm should remain efficient
  - that is, maximum recursion should be $O(\lg(\text{max}(w,h,d)))$

There's tension between choosing maximum entropy splits and trying to keep regions
as cube like as possible.

We can introduce a "defect" term, $\lambda$:

$$
\lambda(w,h,d) = \frac{ w \cdot h \cdot d }{ (\text{min}(w,h,d))^3 }
$$

So maybe one concept is to try and reduce the average defect, where sub-cuboid
regions defects are weighted by their volume proportion.
Another take on this is that the defect is (potentially) effectively encoding some type of entropy
in the system.

So, take the case that $w$ and $d$ and small but $h$ is large.
Call $w,d = \varepsilon$ and $h = s$.

```
         .___
        /   /|
       /   / |
      /   /  |
     /   /  /
    /   /  /
   /__ /  / h
  |   |  /
d |   | /
  s___e/
    w

         ._____
        /     /|
       /  B  / |
      /_____/  |
     /  /  /| /
    /  /  / |/ sigma h
   /__/_ /  / 
  |  |  |  /
d |A |  | / (1-sigma)h
  s__|__e/
   w/2
     w
```

Before the recursion, the defect would be $\lambda _ 0 = \frac{ w \cdot h \cdot d }{ \text{min}(w,h,d) } = \frac{ s \varepsilon^2 }{\varepsilon^3 } = \frac{s}{\varepsilon}$.
Since the start and end of the path are on the base $w$ edge (labeled `s`, `e`), we're constrained in how we split.

Say we split along the $w$ edge in half, and some portion of $h$, call it $\sigma$.

The defect for $A$ will be $\lambda(A) = \frac{ (1-\sigma) s \varepsilon \frac{\varepsilon}{2} }{ (\frac{\varepsilon}{2})^3 } = 4 (1-\sigma) \frac{s}{\varepsilon}$
and the defect for $B$ will be $\lambda(B) = \sigma \frac{s}{\varepsilon}$.

The relative volume for $A$ is $\frac{1-\sigma}{2}$ and the relative volume for $B$ is $\sigma$, so the average defect for the subdivided cuboids is:

$$
\begin{array}{ll}
 & 2 \cdot (\frac{1-\sigma}{2}) \cdot [4 \cdot (1-\sigma) \cdot \frac{s}{\varepsilon}] + \sigma \cdot [ \sigma \cdot \frac{s}{\varepsilon} ] \\
= & \frac{s}{\varepsilon} \cdot [ 4 \cdot (1-\sigma)^2 + \sigma^2 ] \\
= & \frac{s}{\varepsilon} \cdot [ 5 \sigma^2 - 8 \sigma + 4 ] \\
\end{array}
$$

We want to know when we've reduced the average defect, so:

$$
\begin{array}{ll}
& \frac{s}{\varepsilon} \cdot [ 5 \sigma^2 - 8 \sigma + 4 ]  < \frac{s}{\varepsilon} \\
= &  5 \sigma^2 - 8 \sigma + 4 < 1 \\
= &  5 \sigma^2 - 8 \sigma + 3 < 0 \\
= & (\sigma - 1) \cdot (\sigma - \frac{3}{5}) < 0
\end{array}
$$

When $\frac{3}{5} < \sigma < 1$, we reduce the average defect.
Taking the derivative and solving when zero yields an optimum
when $\sigma = \frac{4}{5}$.

So, as a recap, in the extreme case where:

* $w$ and $d$ are some small dimension, call them $\varepsilon$ each
* $h$ is long, relative to $w$ and $d$, taking $h$ to be $s$
* we have to split on $w$ and we do so at the halfway mark
* we split the "far" cuboid, keeping $w$ and $d$ as $\varepsilon$ but taking
  the new depth to be $\sigma \cdot d$

We make progress if $\sigma > \frac{3}{5}$ and optimally so when $\sigma = \frac{4}{5}$
(taking the two smaller regions as $(\varepsilon,\frac{\varepsilon}{2},(1-\sigma) \cdot s)$ ).

I'm taking two dimensions equal as a simplifying step.

If we do a back-of-the-envelope calculation for the case when two dimension are equal ($s$) and
one axis is small ($\varepsilon$) with the split happening as in the bulk 2d case:

```
      ___________
    /__________  |
   |           | |
   |     B     | |
   |___________|/|
   |     |     | |
s/2|  A  |     | |
   |_____|_____|/ epsilon
    (s/2)

```

$$
\begin{array}{ll}
\lambda(V _ 0) & = \frac{s^2}{\varepsilon^2} \\
\lambda(A) & = \frac{ (\frac{s}{2})^2 \cdot \varepsilon }{ \varepsilon^3 } \\
  & = (\frac{1}{4}) \cdot (\frac{s^2}{\varepsilon^2}) \\
\lambda(B) & = \frac{ s \cdot \frac{s}{2} \cdot \varepsilon }{\varepsilon^3 } \\
  & = (\frac{1}{2}) \cdot (\frac{ s^2}{\varepsilon^2}) \\
\lambda(V _ 1) & = 2 \cdot (\frac{1}{4}) \cdot \lambda(A) + (\frac{1}{2}) \cdot \lambda(B) \\
 & = (\frac{1}{2}) ( (\frac{1}{4}) \cdot \frac{s^2}{\varepsilon}  + (\frac{1}{2}) \cdot \frac{s^2}{\varepsilon^2} ) \\
 & = (\frac{3}{8}) \cdot \frac{s^2}{\varepsilon^2}
\end{array}
$$

implying an average defect reduction ($1 \to \frac{3}{8}$).


---

One note, for the 2d case, is that using this average defect argument, the average
defect actually goes up because of the long strip on top.
This is spurious as the long strip will split and we can think of the recursion
as actually creating four sub-squares, as in the standard Hilbert recursion case,
keeping the average defect the same.

So the argument is more about when we can reduce the average defect by splitting
long strips.

As motivation for the $\frac{3}{2}$ constant when splitting in the 2d case,
consider:

```
           V                           V_1
   _________________            _________________
  |                 |          |        |        |
  |                 | h        |   A    |        | h
  |_________________|          |________|________|
       \sigma h                \sigma h/2

```

The defect $\lambda(V) = \sigma$, whereas $\lambda(V _ 1) = \frac{2}{\sigma}$, assuming
$\frac{\sigma h}{2} < h$ or $\sigma < 2$.

To know when the crossover point happens, we want to find when we gain by splitting:

$$
\begin{array}{ll}
 & \lambda(V _ 1) < \lambda(V) \\
 \to & \frac{2}{\sigma} < \sigma \\
 \to & \sigma > \sqrt{2} \\
\end{array}
$$

So, presumably, $\frac{3}{2} = 1.5$ was chosen because it's a nice fraction that is
close to, but larger than, $\sqrt{2} \approx 1.4142 \dots$.

---

For the 3d case, where $h,d = s$ and $w = \sigma s$, we have ( $\frac{\sigma s}{2} < s \to \sigma < 2$ ):

$$
\begin{array}{ll}
 & \lambda(V _ 1)  < \lambda(V _ 0) \\
\to & \frac{4}{\sigma^2} < \sigma \\
\to & \sigma > 4^{\frac{1}{3}}
\end{array}
$$

Making the same choice of $\frac{3}{2}$ a little suspicious ( $4^{\frac{1}{3}} \approx 1.5874 \dots$ ).
Maybe $\frac{5}{3} \approx 1.666 \dots$ would be a better ratio.

---

To motivate the $\frac{4}{3}$ choice:

If we assume $w \approx h$ and $d = s, w = h = \sigma s$, with $\frac{\sigma s}{2} < s \to \sigma < 2$ :

$$
\begin{array}{ll}
 \lambda(V _ 0) & = \frac{\sigma^2 s^3}{s^3} = \sigma^2 \\
 \lambda(V _ 1) & = \frac{ (\frac{\sigma s}{2})^2 s }{ (\frac{\sigma s}{2})^3 } = \frac{2}{\sigma} \\
 \to & \lambda(V _ 1) < \lambda(V _ 0) \\
 \to & \frac{2}{\sigma} < \sigma^2 \\
 \to & \sigma > 2^{\frac{1}{3}}
\end{array}
$$

Making the choice of $\frac{4}{3}$ a simple fraction that's near $2^{\frac{1}{3}} \approx 1.25992 \cdots$ .

---


###### 2025-03-24

Here's the idea for a mostly resolving 3d Gilbert curves.

First some assumptions:

* the path starts at the `(0,0,0)` and ends at `(0,w,0)`
* subdivision will be chosen to have:
  - two `1x1x1`
  - two `2x1x1` (congruent shaped blocks)
  - one `1x2x1`
* any subdivision that forces a notch will be localized
  to a single sub-block

Some basic ideas before we get into enumeration:

* even sides give choice to subdivide even/even or odd/odd
* when the major docking axis is even, the path is possible
* when the major docking axis is odd, the only time
  there's a viable path is if all sides are odd
  - otherwise we can try to localize the notch into one
    of the sub-blocks

There are three major configurations, $P_0$, $P_1$, $P_2$:

```
 z
 ^ _ y
 | /|
 |/
 *---> x

     ______          ______          ______
    /B / D/|        /B / D/|        /   C /|
   /-----/ |       /  /  / |       /-----/ |
  /____ /| |      /__/_ / /|      /__/_ /|/|
 |  C  | | |     |  |  | /C|     |  | D| |B|
 |__ __|/|/      |__|__|/|/      |  |__|/|/
 |A | E| /       |A | E| /       |A | E| /
 |__|__|/        |__|__|/        |__|__|/
 ^     v         ^     v         ^     v
```

`

| `W%2` | `H%2` | `D%2` | Configuration |  A  |  B  |  C  |  D  |  E  | notch |
|-------|-------|-------|---------------|-----|-----|-----|-----|-----|-------|
|   0   |   0   |   0   | $P_0$				  | 000 | 000 | 000 | 000 | 000 |       |
|   0   |   0   |   1   | $P_1$				  | 000 | 010 | 000 | 010 | 000 |       |
|   0   |   1   |   0   | $P_0$				  | 000 | 001 | 000 | 001 | 000 |       |
|   0   |   1   |   1   | $P_1$				  | 010 | 111 | 010 | 111 | 010 |       |
|   1   |   0   |   0   | $P_0$				  | 000 | 000 | 100 | 010 | 001 |   C   |
|   1   |   0   |   1   | $P_1$				  | 000 | 010 | 110 | 011 | 010 |   C   |
|   1   |   1   |   0   | $P_0$				  | 000 | 001 | 101 | 011 | 001 |   C   |
|   1   |   1   |   1   | $P_2$				  | 010 | 011 | 111 | 011 | 010 |       |

Here, $A$, $B$, $C$, $D$, $E$ have their parity in their local axis directions.

Each of the local axis direction has the first axis, $\alpha$ in the direction of connectors,
the second axis, $\beta$ "in-plane" and such that $\alpha \times \beta = \gamma$, where $\gamma$
is the third axis.
All three axies, $\alpha$, $\beta$, $\gamma$, should be on three sides of the enclosing
rectangular cuboid.

So, if we consider the originating cube as having $\alpha$, $\beta$, $\gamma$ as the
original basis vectors (e.g. $(1,0,0), (0,1,0), (0,0,1)$ to start), then the
recursion can be done by using these basis vectors, with length and in axis adjustments.

$\alpha, \beta, \gamma \in \mathbb{R}^3$ but we'll abuse notation to say
$f(\alpha) = (f(\alpha_x), f(\alpha_y), f(\alpha_z) )$.
For example $\lfloor \alpha \rfloor = ( \lfloor \alpha_x \rfloor, \lfloor \alpha_y \rfloor, \lfloor \alpha_z \rfloor)$
and $\frac{\alpha}{2} = ( \frac{\alpha_x}{2}, \frac{\alpha_y}{2}, \frac{\alpha_z}{2} )$.

Further, let $\alpha_{2e}$, $\beta_{2e}$, $\gamma_{2e}$ be
$\frac{\alpha}{2}, \frac{\beta}{2}, \frac{\gamma}{2}$ with
1 added to the major axis direction to force it to be even, respectively.
Call $\alpha_{2q}, \beta_{2q}, \gamma_{2q}$ be 
$\frac{\alpha}{2}, \frac{\beta}{2}, \frac{\gamma}{2}$ with 1 added to
the major axis direction to force it to be odd, respectively.

That is, $\alpha_{2e}$ is integer division of 2 and adding one to force it to be even.
Call the remaining value $\alpha_{2*} = \alpha - \alpha_{2e}$, which could be even or
odd depending on what $\alpha$ is.
$\alpha_{2q}$ is integer division of 2 and one added to force an odd value.


A more complicated way of saying this is:

$$
\begin{array}{l}
\alpha_{2e} = 2 \cdot \lfloor \frac{\alpha}{4} \rfloor + \lfloor 2 \cdot \{ \frac{\alpha}{4} \} \rfloor \\
\alpha_{2q} = 2 \cdot \lfloor \frac{\alpha}{4} \rfloor + 1 \\
\alpha_{2 * } = \alpha - \alpha_{2e} \\
\alpha_{2 q + } = \alpha - \alpha_{2q} \\
\beta_{2e} = 2 \cdot \lfloor \frac{\beta}{4} \rfloor + \lfloor 2 \cdot \{ \frac{\beta}{4} \} \rfloor \\
\beta_{2q} = 2 \cdot \lfloor \frac{\beta}{4} \rfloor + 1 \\
\beta_{2 * } = \beta - \beta_{2e} \\
\beta_{2 q+ } = \beta - \beta_{2q} \\
\gamma_{2e} = 2 \cdot \lfloor \frac{\gamma}{4} \rfloor + \lfloor 2 \cdot \{ \frac{\gamma}{4} \} \rfloor \\
\gamma_{2q} = 2 \cdot \lfloor \frac{\gamma}{4} \rfloor + 1 \\
\gamma_{2 * } = \gamma - \gamma_{2e} \\
\gamma_{2 q+ } = \gamma - \gamma_{2q}
\end{array}
$$


| `whd` | Config. |   A   |   B   |   C   |   D   |   E   |
|-------|---------|-------|-------|-------|-------|-------|
| `000` |  $P_0$  | $\beta_{2e}, \gamma_{2e}, \alpha_{2e}$ | $\gamma, \alpha_{2e}, \beta_{2*}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\gamma, -\alpha_{2 * }, \beta_{2 * }$ | $-\beta_{2e}, \gamma_{2e}, -\alpha_{2 * }$ |
| `001` |  $P_1$  | $\gamma_{2e}, \alpha_{2e}, \beta_{2e}$ | $\beta, \gamma_{2 * }, \alpha_{2e}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\beta, \gamma_{2 * }, -\alpha_{2 * }$ | $-\gamma_{2 e}, -\alpha_{2 * }, \beta_{2e}$ |
| `010` |  $P_0$  | $\beta_{2e}, \gamma_{2e}, \alpha_{2e}$ | $\gamma, \alpha_{2e}, \beta_{2*}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\gamma, -\alpha_{2 * }, \beta_{2 * }$ | $-\beta_{2e}, \gamma_{2e}, -\alpha_{2 * }$ |
| `011` |  $P_1$  | $\gamma_{2e}, \alpha_{2q}, \beta_{2e}$ | $\beta, \gamma_{2 * }, \alpha_{2q}$ | $\alpha, -\beta_{2 * }, -\gamma_{2e}$ | $-\beta, \gamma_{2 * }, -\alpha_{2q+}$ | $-\gamma_{2 e}, -\alpha_{2 q + }, \beta_{2e}$ |
| `100` |  $P_0$  | $\beta_{2e}, \gamma_{2e}, \alpha_{2e}$ | $\gamma, \alpha_{2e}, \beta_{2*}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\gamma, -\alpha_{2 * }, \beta_{2 * }$ | $-\beta_{2e}, \gamma_{2e}, -\alpha_{2 * }$ |
| `101` |  $P_1$  | $\gamma_{2e}, \alpha_{2e}, \beta_{2e}$ | $\beta, \gamma_{2 * }, \alpha_{2e}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\beta, \gamma_{2 * }, -\alpha_{2 * }$ | $-\gamma_{2 e}, -\alpha_{2 * }, \beta_{2e}$ |
| `110` |  $P_0$  | $\beta_{2e}, \gamma_{2e}, \alpha_{2e}$ | $\gamma, \alpha_{2e}, \beta_{2*}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\gamma, -\alpha_{2 * }, \beta_{2 * }$ | $-\beta_{2e}, \gamma_{2e}, -\alpha_{2 * }$ |
| `111` |  $P_2$  | $\beta_{2e}, \gamma, \alpha_{2e}$ | $\gamma_{2e}, \alpha, \beta_{2 * }$ | $\alpha, \beta_{2 * }, \gamma_{2 * }$ | $-\beta_{2e}, \gamma_{2 * }, -\alpha_{2 * }$ | $-\gamma_{2e}, -\alpha_{2 * }, \beta_{2e}$ |

This degrades into a special case analysis but, conceptually, this is pretty straight forward.

There are a few key cases:

* Choose all major sub cuboids have an even anchor axis (cases `000`, `001`, `010`)
* A notch is forced so localize to cuboid $C$ (cases `100`, `101`, `110`)
* The special case of `111`, choose all anchor cuboid axies to be even except
  for $C$, which we choose to be all odd
* The complicated case of `011`, where we choose $B$ and $D$ to have all odd cuboid
  dimensions, choosing other cuboids to have even anchor direction ($\alpha$ is even, so
  we can subdivided it into two odd portions, allowing us to force $B$ and $D$ to be all
  odd cuboids)

All configurations of cuboids alternate between $P_0$ and $P_1$, except for `111` which has $P_2$.
For the configurations where a notch is forced, we shunt the notch to the $C$ cuboid.
For each of the sub-cuboids that we know don't need a notch, we choose the anchor axis direction
to be even, except for the special case of $B$ and $D$ for `011` and $C$ for `111`.

There's some "don't care" states for cuboid dimensions.
We should go through and label them, as this might provide an avenue to
optimize various aspects of the subdivision (making it more parsimonious in some way)
but, for simplicity, the above defaults to even for each of the dimensions when choosing the first ($A$) cuboid.




###### 2025-03-17

Things are really bad for the 3D Gilbert curve.
Not only are non-contiguous path jumps most likely
unbounded, but it's not clear that the jump is even
bounded.

For example, a 5x5x5 has a jump of 2.
Removing the initial orientation so that the width
is anchored and doing larger realizations (8x11x11?)
shows even bigger jumps.

Unlike the 2D Gilbert curve, the 3D Gilbert curve
doesn't do any adaptive reshaping, other than a blind
force of the A block to be even.
This causes problems in other blocks downstream.

There *might* be a way to fix this, but I'm still
thinking about it.

The observation is this:

As a coarse metric, just having a path be possible
with anchored start and endpoints means that the
parity of the path through the rectangular cuboid
has to match the parity of the width.

So consider the parity table:

| (W,H,D) | width endpoint | path endpoint | Possible path |
|---------|----------------|---------------|---------------|
| (0,0,0) | 0 | 0 | y |
| (0,0,1) | 0 | 0 | y |
| (0,1,0) | 0 | 0 | y |
| (0,1,1) | 0 | 0 | y |
| (1,0,0) | 1 | 0 | n |
| (1,0,1) | 1 | 0 | n |
| (1,1,0) | 1 | 0 | n |
| (1,1,1) | 1 | 1 | y |

For the case where the width is odd and the whole path is even,
no path from the start point to end point is possible without
a jump.

What we can try to do is the same in the 2D case, where we
try to push the jump to a specific block, making sure it's
in a particular location and there's only one.

So, as a first attempt, consider each of the three cases:

* `(1,0,0)`
  - choose `h2` to be even, creating an even `W` case so that blocks `A` and `E` are viable
  - blocks `B` and `D` inherit their width from the even `H`, so are viable
  - block `C` has odd width from `W`, so has a jump
* `(1,0,1)`
  - no way to do this without introducing multiple jumps
  - instead, introduce a new block subdivision, where `A`, `E` connect to
    `B`, `D` "logs" ( `1x2x1`, both on top ), that connect to `C` on bottom (`2x1x1`)
  - chose `d2` to be even to make `A`, `E` viable, `h` makes the new `B`, `D` viable,
    and `C` absorbs the inviability
* `(1,1,0)`
  - `h2` even, making `A`, `E` viable
  - `d` even, making `B`, `D` viable
  - `C` inherits the odd `w`, absorbing the inviability
  - some choice on `w2` parity


