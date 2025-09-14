$O(1)$ Rectangle Inclusion Testing in 2D Hole Free Rectilinear Polygons
===


A common task for rectilinear polygon subdivision is to test if a rectangle
is fully contained within the a rectilinear polygon.

Kim, Lee and Ahn offer a method but I'm having trouble understanding what it is
and they dont' provide any reference implementation.

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


The idea is to construct two $O(N^2)$ arrays that hold the runs of contiguous lines from left to right and
bottom to top.

I'm mostly concerned with doing rectangle inclusion in the implied grid, so the focus will be on that,
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

We create two auxiliary 2D arrays naming them $S _ x$ and $S _ y$ both of the same size as $G$.

To fill the $S _ x$ we start from the left of $G$ and sweep right.
If $G$ holds an exterior point, we mark the entry as $-1$.
If the left neighbor of $G$ is an exterior point, we set the value to $0$ in $S _ x$.
Otherwise we add the difference of the current point in $G$ to it's left neighbor in $G$
to the value of the left neighbor in $S _ x$.

We do the same for $S _ y$ but go from the bottom up, using the bottom neighbor instead of the
left neighbor.

Here is an example (taken from Fig. 11 of Kim, Lee and Ahn):

`[[0,0],[0,3],[3,3],[3,5],[5,5],[5,8],[7,8],[7,4],[8,4],[8,6],[10,6],[10,0],[6,0],[6,1],[1,1],[1,0]]`

```
-1 -1 
```

Additionally, we keep two additional linear arrays holding the maximum distance in the $x$ and $y$ directions,
which we'll call $L _ x$ and $L _ y$.


### Constant Time Inclusion Testing

To test for for rectangle inclusion, we compare the four endpoints of the rectangle to the entries
in $S _ x$ and $S _ y$.
We compare the difference of the top pair with the bottom pair and make sure they're both equal
to the maximum distance in $L _ x$.
We then compare the difference of the left pair with the right pair, make sure they're equal
and hold the value of the maximum distaance stored in $L _ y$.

If they're unequal, this means the boundary has crept into the rectangle.
If they're equal to each other but not equal to the maximum distance, this means the rectangle has been
cleaved into separate parts.

No holes are allowed, by construction, so the only way an exterior region could be in the body
of the rectangle is if it originated from the boundary, so testing the boundary for maximum
length is all that needs to be done.

Since we only test a finite number of points, the lookup is $O(1)$.

This assumes rectangle lookup is being done along grid lines, either through knowledge
of mapping source points to the integer grid or feeding the integer grid point locations
explicitely.

To do arbitrary Euclidean rectangle testing, I don't see how to avoid the $O(\lg(N))$ lookup
to convert from Euclidean space to index space for the $G, S _ x, S _ y, L _ x, L _ y$ lookups.

### Conclusion



References
---

* ["Rectangular Partitions of a Rectilinear Polygon" by Hwi Kim, Jaegun Lee, Hee-Kap Ahn](https://arxiv.org/pdf/2111.01970)





