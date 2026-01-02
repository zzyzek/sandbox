Notes
===

###### 2026-01-01

Here's the chain of thought:

* Stable Gilbert curve without notches can happen if we fudge the endpoints
* Generalized fudging of endpoints leads to finding a space filling st-Hamiltonian
  path with arbitrary endpoints within a rectangular region
  - st-Hamiltonian paths on grid graphs is still an open problem so we're hoping to
    sidestep the issue by restricting ourselves to rectangles
* The "follow your nose" idea implementing an st-Gilbert curve is to choose
  a subdivision as normal, try to push endpoints into their standard position (near the edge)
  and then fudge boundaries until each of the sub rectangles, with their own endpoints,
  is valid (*admissible*)
* Subdivision will be one of three cases:
  - two endpoints, both on the boundary
  - two endpoints, one on the boundary proper and one of the non-proper interior (interior + boundary,
    one endpoint is the start or end point originally specified)
  - four endpoints, two on the boundary proper and two on the non-proper interior (both specified
    initial endpoints land in the subdivision)
* For the four endpoint case, the general form is a slight modification of the *zig-zag numberlink* puzzle
  with $k=2$ (aka "Flow Free" (k=2))
  - in general (arbitrary $k$), it's NP-Complete
  - for non-rectangular regions or other restrictions (holes, arbitrary (2d) regions, restrictions on path, etc.)
    it's NP-Complete
  - for $k=2$ on a rectangular region without any other restrictions, it's unknown if it's polynomial time or not

So, if we solve the rectangular 2D $k=2$ zig-zag numberlink problem (R2K2-ZZN) then we have at least a naive way
of creating an st-Gilbert curve.

Focusing on R2K2-ZZN, speaking with Microsoft's Copilot, it suggested the following strategy:

* Consider a solution to a particular R2K2-ZZN instance
* Consider a vertical slice and count the number of crossings of the two paths, $P _ 0$, $P _ 1$, through
  that slice
* It might be reasonable to think that a normalized form would bound the number of crossings of both
  paths to be finite, no matter the size of the rectangle
  - Something about bigon removal by isotopy? The idea is to push extraneous crossings down. In the discrete
    setting, this translates to some local moves to push the path around and might be heavy on the special cases
* If so, call the crossing bound $C$
* The finite bound $C$ implies a dynamic programming solution

Notice that for a vertical cut between column $j$ and $j+1$, there are only a few possibilities for states at a row $i$:

* no horizontal edge
* one of the two paths, $P _ 0$ or $P _ 1$, crosses it

There are some other restrictions, like if $s _ {\rho}$ and $t _ {\rho}$ are on opposite sides of the cut the number of
$P _ {\rho}$ crossings must be odd.
If $s _ {\rho}$ and $t _ {\rho}$ are on the same side, the number of crossings must be even.
There might be some other topological considerations in terms of admissible positions.

Putting the restrictiosn aside for a moment, this means the state can be represented as a catalogue of where the crossings occur.
For a rectangle of $n$ rows and $m$ columns, the number of possible positions for a crossing edge is $n$, which can from one of two
possibile paths, where the number of crossings is bounded by $C$.

Doing some hand-waiving, this gives an $O( n^C )$ bound ($O( (2n)^C )$ is maybe a bit more enlightening).
It's hard to say but it might be reasonable to assume $C \le 8$ (4 crossing per path?).

This is more complicated and it's not clear that this strategy will work out.
If the number of crossings is bounded, though, that's a massive restriction that we can leverage for a polynomial time algorithm (almost surely).

---

The number of crossings for a path $P _ {\rho}$ is $2 \kappa + 1$ is $s _ {\rho}$ and $t _ {\rho}$ and $2 \kappa$ if $s _ {\rho}$ and $t _ {\rho}$
are on the same side.

Example:

$s _ 0$ and $t _ 0$ lie on the left side of a cleave at $(j,j+1)$.
Further, there's a single crossing edge pair at row $\nu _ 0$ and $\omega _ 0$,
with $\nu _ 0 > \omega _ 0$.

Further say the we're bounding the number of crossings to 4.

In such a case, there are only a few "production rules" to find $\nu' _ 0 > \omega' _ 0$
at cleave $(j+1, j+2)$.

The pair might disappear, shift up or down but keep their relative position,
or have a new pair appear above them, in between them or below them.



