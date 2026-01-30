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

initially walk vertices on the convex hull of $L$, $(u ^ -, u, u ^ +)$, and $R$, $(v ^ -, v, v^ +)$,
starting from $u = \hat{p} _ { \lfloor n / 2 \rfloor }, v = \hat{p} _ {\lfloor n/2 \rfloor + 1}$,
then advance $u$ left, $v$ right until until we find a a $(u ^ -, u, v)$ and $(u, v, v ^ +)$ both counter-clockwise
(that is, start from the middle out until we find an initial $(u,v)$ edge).

> WIP
> WIP
> WIP

If we consider the snapshot of 'kinetic' picture for $\hat{P}$, all points will be be moving in vertical
directions fixed by their $x$ coordinate.
At $t = T _ 0$, the $y' _ k = z _ k - t y _ k$ coordinates will be at their maxima, as the $z _ k$ contribution will be only a constant
shift overtaken by the $y _ k$ coefficient.
As $t \to T _ 1$, 

(WIP) From there, we advance $t$ and catalogue what happens to locally around our $(u,v)$ edge and updating the edge accordingly.

> WIP
> WIP
> WIP


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
