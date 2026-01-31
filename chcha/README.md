Chan's Convex Hull Algorithm
===

(Attempt at) Implementation of Chan's Convex Hull Algorithm (ChCHA);

Overview
---

$$
\begin{array}{l}
P = \\{ p _ 0, p _ 1, \dots, p _ {n-1} \\} \\
p _ k = ( x _ k, y _ k, z _ k )
\end{array}
$$

Points are in general position:

* no four points on a plane
* no three points co-linear
* no two points at the same position

Create:

$$
\begin{array}{l}\
\hat{P}(t) = \\{ \hat{p} _ 0 (t), \hat{p} _ 1 (t), \dots, \hat{p} _ {n-1} (t) \\} \\
\hat{p} _ k (t) = ( x _ k, z _ k - t y _ k )
\end{array}
$$

Sort points $\hat{P}(t)$ by their $\hat{x} _ k$ coordinate (ascending).

The algorithm itself is only for the lower hull (convex hull just on the underneath, with the $z$ axis being up/down)
so this needs to be run twice to get the upper hull with the appropriate modification.

Consider just the lower hull.
Assume the point set has been partitioned with the lower hull calculated for the left and right side, $L$,  $R$.

To merge $L$ and $R$, we can consider $T _ 0, T _ 1$ as the start and stop time of the movie,
$t \in [ T _ 0, T _ 1 ]$.
Intuitively $T _ 0 \sim -\infty, T _ 1 \sim \infty$ but we can find finite values that work just as well and remain finite.

Before talking about the algorithm and how to merge hulls, it's informative to talk about a single lower hull as it evolves
with the time parameter $t$.
Take a lower hull, $H$, and consider the point set $\hat{P}(T _ 0)$ of that hull.
As the point system evolves, the construction keeps all $x$ coordinates in place while varying the $y'(t)$ coordinates
(w.r.t. $t$).
As $t$ increases, if the $\hat{P}(t)$ points keep their relative $y'$ position, there will be no change to the lower hull $H$.

The lower hull of $H$ might change if the angle between three successive points (ordered by the $x$ coordinate) goes from
positive to negative or vice versa.
That is, if $( (\hat{p} _ {0}(t) - \hat{p} _ {-1}(t)) \times (\hat{p} _ {1}(t) - \hat{p} _ {0}(t)) ) _ z$ changes sign, where $\times$
is the three dimensional cross product (with two dimensional vectors upgraded to three by adding a 0 component)
and the subscript $( \cdot ) _ z$ takes the last, $z$, component of the cross product.

This is a small equation in the unknown $t$ that can be solved, which, for completeness sake I'll reproduce here:

$$
\begin{array}{ll}
 & ( ([ x _ 1, y' _ 1 (t), 0 ] - [ x _ 0, y' _ 0 (t), 0 ]) \times ([x _ 0, y' _ 0(t), 0 ] - [x _ {-1} , y' _ {-1} (t), 0])) _ z = 0 \\
\to & ( ([ x _ 1, z _ 1 - t y _ 1, 0 ] - [ x _ 0, z _ 0  - t y _ 0, 0 ]) \times ([x _ 0, z _ 0 - y _ 0, 0 ] - [x _ {-1} , z _ {-1} - t y _ {-1}, 0])) _ z = 0 \\
\to & ( ([ x _ 1 - x _ 0, (z _ 1 - z _ 0) - t (y _ 1 - y _ 0), 0 ] ) \times ([x _ 0 - x _ {-1}, (z _ 0 - z _ {-1}) - t (y _ 0 - y _ {-1}), 0 ] )) _ z = 0 \\
\to & (x _ 1 - x _ 0) \dot ((z _ 0 - z _ {-1}) - t (y _ 0 - y _ {-1})) - (x _ 0 - x _ {-1}) \dot ((z _ 1 - z _ 0) - t (y _ 1 - y _ 0)) = 0 \\
\to & (x _ 1 - x _ 0) (z _ 0 - z _ {-1}) - t (x _ 1 - x _ 0) ( y _ 0 - y _ {-1}) = (x _ 0 - x _ {-1}) (z _ 1 - z _ 0) - t (x _ 0 - x _ {-1}) (y _ 1 - y _ 0) \\
\to & t [ (x _ 0 - x _ {-1}) (y _ 1 - y _ 0) - (x _ 1 - x _ 0) ( y _ 0 - y _ {-1}) ] = (x _ 0 - x _ {-1}) (z _ 1 - z _ 0) - (x _ 1 - x _ 0) (z _ 0 - z _ {-1}) \\
\to & t = ( (x _ 0 - x _ {-1}) (z _ 1 - z _ 0) - (x _ 1 - x _ 0) (z _ 0 - z _ {-1}) ) /  [ (x _ 0 - x _ {-1}) (y _ 1 - y _ 0) - (x _ 1 - x _ 0) ( y _ 0 - y _ {-1}) ]
\end{array}
$$

This means we can consider three ordered points in the point set and find the time, $t _ k$, that the 'crossing event' should occur independently of the others.

The recursive algorithm first partitions the point set into $L$ and $R$ lower hulls and then proceeds to merge them.
updating $L$ and $R$ independently can be done by walking the point set in each, finding the appropriate crossing time events and updating their lower hulls
respectively.

The merge between $L$ and $R$ can be done by finding the bridge edge made from a location in $L$ and a location in $R$ to merge them and then updating the bridge
with the idea above.

Initially walk vertices on the convex hull of $L$, $(u ^ -, u, u ^ +)$, and $R$, $(v ^ -, v, v^ +)$,
starting from $u = \hat{p} _ { \lfloor n / 2 \rfloor }, v = \hat{p} _ {\lfloor n/2 \rfloor + 1}$,
then advance $u$ left, $v$ right until until we find a a $(u ^ -, u, v)$ and $(u, v, v ^ +)$ both counter-clockwise
(that is, start from the middle out until we find an initial $(u,v)$ edge).

Merging takes $O(n)$ while the recursion acts on sublists that are half the length for a total runtime of $O(n \log n)$.





License
---

CC0

> To the extent possible under law, the person who associated CC0 with
> this project has waived all copyright and related or neighboring rights
> to this project.
> 
> You should have received a copy of the CC0 legalcode along with this
> work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

References
---

* [Chan's Convex Hull Algorithm (ch3d.pdf)](https://tmc.web.engr.illinois.edu/ch3d/ch3d.pdf) ([site](https://tmc.web.engr.illinois.edu/pub.html#ch3d))
* [NekoSosu/lower-convex-hull-3d](https://github.com/NekoSosu/lower-convex-hull-3d)
