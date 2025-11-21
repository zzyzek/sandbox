$O(1)$ Rectangle Inclusion Testing in 2D Hole Free Rectilinear Polygons
===


A common task for rectilinear polygon subdivision is to test if a rectangle
is fully contained within the a rectilinear polygon.

Kim, Lee and Ahn offer a method but I'm having trouble understanding what it is
and they don't' provide any reference implementation.

The problem is a bit trivial but a fun programming exercise.
This post details a solution without regard to how novel it is.

I claim no new insight here.
This algorithm might be well known or my solution might be a trivial
alteration or a verbatim construction.

---

> Given a rectilinear 2D polygon without holes, $P$, with $P$ given as a list of
> vertices, $P = ( p _ 0, p _ 1, \dots, p _ {N-1} ) = ( (x _ 0, y _ 0), (x _ 1, y _ 1), \dots, (x _ {N-1}, y _ {N-1}) )$,
> using an $O(N^2)$ preprocessing step and $O(N^2)$ space, we can test for
> rectangle inclusion in $O(1)$ time.

The idea is to construct a lookup table in each of the four cardinal directions (*right, left, up, down*)
that stores the nearest visible border point and the farthest visible border point.
The initial construction requires a pass for each cardinal direction and each point, yielding an $O(N^2)$
pre-processing setup cost.

The concern is mostly with doing rectangle inclusion in the implied grid, so the focus will be on that,
but a small modification will allow for arbitrary rectangle inclusion testing while still keeping the $O(1)$
test.

### Construct the Grid

The implicit grid is constructed by extending vertical and horizontal lines out from every point, $p _ j$,
and finding the intersection points.
Each intersecting point will be on the interior, boundary or exterior.

In the worst case, the number of grid points will be $N^2$.

We can create a 2D array of grid points, each holding the mapped position in the original
Euclidean space.

Call this grid $G$, where $G ( i, j )$ represents the $i$'th column and $j$'th row
and holds a point.


### Distance Encoding

We create eight auxiliary 2D arrays naming them $J _ {s,d}$ and $J _ {e,d}$ for $d$ encoding the
cardinal direction ( $d \in \\{0,1,2,3\\}$ , 0 right, 1 left, 2 up , 3 down).
Each $J _ s$ and $J _ e$ are of the same size as $G$ ( $N^2$ ).

To fill the $J _ {s,0}$ ( $x+$ ) we start from the right of $G$ and sweep left.
If $G$ holds an exterior point, we mark the entry as $-1$.

If we see a border point at grid point, $b _ k = G(i,j)$, we look at the next and previous
grid points, $b _ {k+1}$, $b _ {k-1}$.

Depending on how the $(b _ {k-1}, b _ k, b _ {k+1}$ line segment appears in the grid,
the current start value can be updated.
The boundary is encoded as a counterclockwise direction, giving us an idea of whether
there's a transition from outside to in, inside to out, remain inside or remain outside
for the $b _ k$ point in question.

Whenever there's a bend or an inside-out transition, we update the nearest pointer.
Whenever there's a straight line, we update the far pointer.

A transition from inside to out results in the indicator value `-1`.
Any start updates the indicator value to 0, with the start jump current value
being updated whenever a bend is encountered to update it to it's nearest.

Each of the $J _ {s,d}$ and $J _ {e,d}$ are populated from the sweeps.


### Constant Time Inclusion Testing

To test for rectangle inclusion, take the far jump pointer, $J _ e$, for each of the endpoints and,
for each pair of endpoints in-line, confirm they're identical.

### Cleave Line Query

The $J _ s$ provides a facility to know what the nearest corner border point is for any
point on the interior of the polygon.

### Conclusion



References
---

* ["Rectangular Partitions of a Rectilinear Polygon" by Hwi Kim, Jaegun Lee, Hee-Kap Ahn](https://arxiv.org/pdf/2111.01970)





