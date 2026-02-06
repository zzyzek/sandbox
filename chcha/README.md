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

There are a few distinct concepts that, in my opinion, get a bit muddled in Chan's paper.
There's the original 3d points, $p _ k$, and their 2d counterparts, $\hat{p} _ k(t)$, projected into the plane with a time parameter as a function of time.
There is the current lower projected 2d lower hull, $H(t)$, at a time, $t$, that is used to inform point addition and deletion events that will be used
to construct the 3d convex hull.
Distinct from both the original points and the lower hull, there's a list of *events* that indicate which of the $\hat{p} _ k$ have been added during
the course of the algorithm.

Chan calls these "movies of the lower hull".
I find it easier to call them event lists (queues) and I'll label them as $Q, Q _ L, Q _ R$ below.

During the algorithm, $H(t)$ will only every be a snapshot of the lower hull for a snapshot of time $t$ and so, for example, can only ever be as big as the original
point list.
The event list, however, since it's the events of points being added or removed from the lower (2d) hull, can have points being added or removed more than once at various times.
It turns out points can only ever appear maximum twice in the event list, bounding the event list by $(2n)$.

Say we're in the bulk of the recursion.
We assume we recursively have a snapshot of the lower left hull, $H _ L (t _ 0)$, and right hull, $H _ R (t _ 0)$ at $t _ 0 = -\infty$.
Additionally, we recursively have event queues for the left and right points, $Q _ L, Q _ R$, where each event in their respective queues is ordered by time.

From the initial left and right hulls, $H _ L(t _ 0), H _ R(t _ 0)$, we find the *bridge*, $(u,v)$ that joins the left and right hulls into a parent lower hull,
$H (t _ 0)$, encompassing all of the points.

Now we walk the event queues, taking the next timed event as it appears in the left or right event queue and updating the index in each appropriately.

Take $q _ {\ell} \in Q _ L$ and $q _ r \in Q _ R$ as the current queue events and $t _ c \in [t _ {\ell}, t _ r]$ as the current time, $t _ c$, within
range under consideration.

There are six possibilities:

* $q _ {\ell}$ has a hull vertex insertion or deletion that is to the left of $(u,v)$
* $q _ r$ has a hull vertex insertion or deletion that is to the right of $(u,v)$
* $(u ^ - (t _ c) , u (t _ c), v (t _ c))$ becomes clockwise, making $(u ^ -, v)$ the new bridge
* $(u (t _ c), v (t _ c), v ^ + (t _ c))$ becomes clockwise, making $(v, v ^ +)$ the new bridge
* $(u (t _ c), u + ^ (t _ c ), v (t _ c))$ becomes counter-clockwise, making $(u ^ +, v)$ the new bridge
* $(u (t _ c), v (t _ c), v ^ + (t _ c))$ becomes counter-clockwise, making $(u v ^ +)$ the new bridge

In Chan's implementation, every iteration takes the next event but takes the minimum time of the six possibilities and updates accordingly.
Meaning, if the current event from either the left or right queue happens after the bridge update events, the bridge updates are processed
without updating the queue event and are left to potentially be processed the next iteration.

Processing bridge updates, events from the left queue and events from the right event queue adds events to our next event queue in addition to updating the snapshots
of the left hull, right hull and our next, parent, hull.

Walking events and updating the bridge to merge into our new event queue while maintaining the lower hull is linear, at most adding $2n$ new events.
Since merging takes $O(n)$, with the recursion on sublists that are half the length, this gives a total runtime of $O(n \log n)$.


Appendix
---

### Time Calculation

Solving for when a triplet of points, $(p _ {-1}(t), p _ 0(t), p _ {+1}(t))$ ( $p _ k(t) = (x _ k, z _ k - t y _ k)$ ),
changes from clockwise to counterclockwise, or vice versa, is a straight forward calculation:

$$
\begin{array}{ll}
 & ( ([ x _ 1, y' _ 1 (t), 0 ] - [ x _ 0, y' _ 0 (t), 0 ]) \times ([x _ 0, y' _ 0(t), 0 ] - [x _ {-1} , y' _ {-1} (t), 0])) _ z = 0 \\
\to & ( ([ x _ 1, z _ 1 - t y _ 1, 0 ] - [ x _ 0, z _ 0  - t y _ 0, 0 ]) \times ([x _ 0, z _ 0 - y _ 0, 0 ] - [x _ {-1} , z _ {-1} - t y _ {-1}, 0])) _ z = 0 \\
\to & ( ([ x _ 1 - x _ 0, (z _ 1 - z _ 0) - t (y _ 1 - y _ 0), 0 ] ) \times ([x _ 0 - x _ {-1}, (z _ 0 - z _ {-1}) - t (y _ 0 - y _ {-1}), 0 ] )) _ z = 0 \\
\to & (x _ 1 - x _ 0) \dot ((z _ 0 - z _ {-1}) - t (y _ 0 - y _ {-1})) - (x _ 0 - x _ {-1}) \dot ((z _ 1 - z _ 0) - t (y _ 1 - y _ 0)) = 0 \\
\to & (x _ 1 - x _ 0) (z _ 0 - z _ {-1}) - t (x _ 1 - x _ 0) ( y _ 0 - y _ {-1}) = (x _ 0 - x _ {-1}) (z _ 1 - z _ 0) - t (x _ 0 - x _ {-1}) (y _ 1 - y _ 0) \\
\to & t [ (x _ 0 - x _ {-1}) (y _ 1 - y _ 0) - (x _ 1 - x _ 0) ( y _ 0 - y _ {-1}) ] = (x _ 0 - x _ {-1}) (z _ 1 - z _ 0) - (x _ 1 - x _ 0) (z _ 0 - z _ {-1}) \\
\to & t = \frac{ (x _ 0 - x _ {-1}) (z _ 1 - z _ 0) - (x _ 1 - x _ 0) (z _ 0 - z _ {-1}) }{ (x _ 0 - x _ {-1}) (y _ 1 - y _ 0) - (x _ 1 - x _ 0) ( y _ 0 - y _ {-1}) } \\
\end{array}
$$

That is, if $( (\hat{p} _ {0}(t) - \hat{p} _ {-1}(t)) \times (\hat{p} _ {1}(t) - \hat{p} _ {0}(t)) ) _ z$ changes sign, where $\times$
is the three dimensional cross product (with two dimensional vectors upgraded to three by adding a 0 component)
and the subscript $( \cdot ) _ z$ takes the last, $z$, component of the cross product.


### Finding an Initial $(u,v)$ Bridge From Two Kinetic 2d Lower Hulls

We have lower hulls $H _ L( t _ 0)$ and $H _ R(t _ 0)$ at $t _ 0 = -\infty$.
A initial *bridge* is an edge, $(u,v)$ with $u \in H _ L(t _ 0)$, $v \in H _ R(t _ 0)$, that creates a convex hull $H ( t _ 0)$.

Intuitively, we start from the middle out until we find an initial $(u,v)$ edge that's a proper bridge candidate.

To find the initial $(u,v)$ edge, we can initially walk vertices on the convex hull
of $H _  L(t _ 0)$, $(u ^ -, u, u ^ +)$, and $H _ R( t _ 0)$, $(v ^ -, v, v^ +)$ from inward out until we find a suitable bridge.
Starting from $u = \hat{p} _ { \lfloor n / 2 \rfloor }, v = \hat{p} _ {\lfloor n/2 \rfloor + 1}$,
both of which must be part of the lower hull of $H _ L ( t _ 0)$, H _ R (t _ 0)$ respectively,
we can then advance $u$ left and $v$ right until until we find a a $(u ^ -, u, v)$ and $(u, v, v ^ +)$ both counter-clockwise.



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
