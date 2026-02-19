Chan's (Other) Convex Hull Algorithm
===

(Attempt at) Implementation of Chan's (Other) Convex Hull Algorithm (COCHA).

This is a discussion and implementation of Chan's algorithm presented in his 2003 paper
"A Minimalist’s Implementation of the 3-d Divide-and-Conquer Convex Hull Algorithm" ([see](https://tmc.web.engr.illinois.edu/ch3d/ch3d.pdf)).

The algorithm find the lower hull point set of a set 3d points in general position (no co-planar, co-linear or duplicate points).
The basic idea is to convert the 3d problem into a 2d "kinetic" problem by transforming
points $p _ k = (x _ k, y _ k, z _ k) \to \hat{p} _ k(t) = (x _ k, z _ k - t y _ k) = (\hat{x} _ k, \hat{y} _ k )$,
and then keeping track of the lower hull as time progresses.

The kinetic 2d lower hull is constructed recursively by partitioning the list and then merging.
Merging can be done efficiently by noticing that updates to each partitioned lower hull
can be used to create new updates to a new, merged, lower hull by updating
a bridge edge, $(u,v)$, as updates to the left and right partition are considered.



???
---

We sort the $\hat{p} _ k$ by $x$ coordinate so that the kinetics only move in the $\hat{y}$ dimension.

As time progresses for contiguous triples of 2d points $( \hat{p} _ {k-1}(t), \hat{p} _ k, \hat{p} _ {k+1} )$, the linkage
will change orientation at a single, easily calculable, time.
A snapshot of the lower hull, in isolation, could be updated by considering only the discrete time steps of when contiguous
linkages change orientation, and updating the lower hull snapshot, depending on if a point pokes through the snapshot and needs
to be added or a point already on the lower hull boundary retreats behind the boundary interface and needs to be removed.




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
The event list, however, are the events of points being added or removed from the lower (2d) hull and
can have points being added or removed more than once at various times.
It turns out points can only ever appear maximum twice in the event list, bounding the size by $(2n)$.

Say we're in the bulk of the recursion.
We assume we recursively have a snapshot of the lower left hull, $H _ L (t _ 0)$, and right hull, $H _ R (t _ 0)$ at $t _ 0 = -\infty$.
Additionally, we recursively have event queues for the left and right points, $Q _ L, Q _ R$, where each event in their respective queues is ordered by time.

From the initial left and right hulls, $H _ L(t _ 0), H _ R(t _ 0)$, we find the *bridge*, $(u,v)$ that joins the left and right hulls into a parent lower hull,
$H (t _ 0)$, encompassing all of the points.

Now we walk the event queues, taking the next timed event as it appears in the left or right event queue and updating the index in each appropriately.

Take $q _ {\ell} \in Q _ L$ and $q _ r \in Q _ R$ as
the current queue events and $t _ c \in [t _ {\ell}, t _ r]$ as
the first time either a bridge update or an event occurs
within $[t _ {\ell}, t _ r]$.

There are six possibilities:

* $q _ {\ell}$ has a hull vertex insertion or deletion that is to the left of $(u,v)$
* $q _ r$ has a hull vertex insertion or deletion that is to the right of $(u,v)$
* $(u ^ - (t _ c) , u (t _ c), v (t _ c))$ becomes clockwise, making $(u ^ -, v)$ the new bridge
* $(u (t _ c), v (t _ c), v ^ + (t _ c))$ becomes clockwise, making $(v, v ^ +)$ the new bridge
* $(u (t _ c), u + ^ (t _ c ), v (t _ c))$ becomes counter-clockwise, making $(u ^ +, v)$ the new bridge
* $(u (t _ c), v (t _ c), v ^ + (t _ c))$ becomes counter-clockwise, making $(u v ^ +)$ the new bridge

In Chan's implementation, every iteration considers the next event but processes an update that occurs at minimum $t _ c \in [t _ {\ell}, t _ r]$.
Meaning, if the current event from either the left or right queue happens after the bridge update events, the bridge updates are processed
without updating the queue event, with the queue events left to be processed at a future iteration.

Processing bridge updates, events from the left queue and events from the right event queue adds events to our next event queue in addition to updating the snapshots
of the left hull, right hull and our next, parent, hull.

Walking events and updating the bridge to merge into our new event queue while maintaining the lower hull is linear, at most adding $2n$ new events.
Since merging takes $O(n)$, with the recursion on sublists that are half the length, this gives a total runtime of $O(n \log n)$.

Some other points:

As the merging proceeds, the lower hull snapshot ( $H(t), H _ L (t), H _ R (t)$ ) gets updated, ending at $T _ 1 = {\infty}$.
The hull snapshots are reset by rewinding them so they're in the $T _ 0$ state for the next iteration of the algorithm.
This is the "... go back in time to update points" section (lines `95-104`) in the provided code.

Note that the snapshot of the hull is stored in the `next`, `prev` pointers from the `Point` struct.
This means the snapshot of the hull only ever gets updated from events that push points in between the $(u,v)$ bridge.

At every step of the merge, we're considering the current left and right event $q _ {\ell} \in Q _ L, q _ r \in Q _ R$
along with the events surrounding bridge points and taking the minimum time event.
The neighbor bridge possibilities "bleed" into the hull snapshot for $H _ L(t), H _ R(t)$ as $(u ^ -, u, u ^ +), (v ^ -, v, v ^ +)$.
$u^+, v^-$ might not be part of the joined hull of $H(t)$ but will be part of $H _ L(t)$ or $H _ R(t).
As we walk $Q _ L$ and $Q _ R$, we update the bridge events if they occur first, without advancing our indices into $Q _ L, Q _ R$.
After all bridge events are updated, then we can make progress on $Q _ L, Q _ R$.
As we advance in processing $Q _ L, Q _ R$ events, we might get to a point where the bridge events are again the minimum, in which
case we repeat the above.

---

Summary:

* The `hull` function takes in a doubly linked list, `list`, list length and event return event queue `A`, 
  and input event queue `B`
* Function `hull` returns an event queue in `A` along with updating the `next`, `prev` pointers in `list`
  that represent the current convex hull snapshot $H(T _ 0)$
  - `list` is of size $n$
  - `A` is bounded by $2n$
    + `A` has `NIL` sentinel node terminator
* For function `hull`:
  - finds $(u,v)$ bridge
  - recursively calls `hull` on the left and right `list`, storing events in queue `B`
  - walks events in `B`, adding to `A` event queue with minimum of event for left `B`, right `B`
    or $(u,v)$ bridge
    + three indices, one for left `B`, one for right `B` and one for output event queue `A`
    + if event is drawn from left/right `B`, left/right index updated accordingly
    + if event updates bridge, left/right `B` index untouched
    + in all cases, output event queue index updated as a new event is added
  - after `A` event queue updated, reverse walk `A` to update pointers to update so hull snapshot is $H(T _ 0)$
    + call current `A` event $q$
    + if $q$ is to the left/right of $(u,v)$ bridge , update neighbor pointers from $q$
      - if $q$ is on $u$ or $v$, update $u$ or $v$ to the appropriate neighbor point
    + if $q$ is (strictly) between $(u,v)$ bridge (e.g. non-inclusive), update pointers of $u$, $v$ to
      insert event queue point $q$ (update $H(t)$ )
      - update $u$, $v$ by setting it to new event queue point depending on whether $q$ is in the left or
        right side
  
The `hull` function finds the $(u,v)$ bridge, recursively calls `hull` to find the left and right event queues,
then merges the left and right queues, with the $(u,v)$ bridge to create a new event queue.
The new event queue is then reminded, updating the $(u,v)$ bridge and updating neighbor pointers of event queue
points to create the implicit $H(T _ 0)$ snapshot.
That is, a post condition of the `hull` function is that, $H(T _ 0)$ is held in the `next` and `prev` pointers
for event queue points.




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
