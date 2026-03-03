Plane Calculations
===

Consider 3D plane. There are a few ways to represent them.

One is the plane equation:

$$
P(x,y,z) = A x + B y + C z = D
$$

If we take the vector

$$
\vec{n} = (A,B,C) / ||(A,B,C)|| = (n _ x, n _ y, n _ z)
$$

This defines the normal to the plane.

Consider three points, $p _ 0, p _ 1, p _ 2$ as distinct, non-colinear
points that lie on a plane.

We can define:

$$
\begin{array}{l}
q _ 0 = p _ 1 - p _ 0 \\
q _ 1 = p _ 2 - p _ 0 \\
\vec{n} = (q _ 0 \times q _ 1) / || q _ 0 \times q _ 1 || \\
\end{array}
$$

Yet another plane equation is:

$$
\begin{array}{l}
P(u) = \vec{n} \cdot ( u - p _ 0) = 0
\end{array}
$$

Where any $p _ 0$ can be taken on the plane, including $p _ 0$ from above.

If $u$ is on the plane, The difference, $u - p _ 0$, will be orthogonal to the plane, so the
dot product with $\vec{n}$ must be 0.

To find the distance of the normal to the plane, given a point $p _ 0$:

$$
d = \vec{n} \cdot p _ 0
$$

As any point on the plane projected onto the normal will be of $d$ length.

---

Let's settle on a representation of a plane by a 4x1 vector $(n _ x, n _ y, n _ z, d)$.

Consider three skew planes,
$P = (P _ x, P _ y, P _ z, P _ d), Q = (Q _ x, Q _ y, Q _ z, Q _ d), R = (R _ x, R _ y, R _ z, R _ d)$.
We want to find the (unique) intersection point, $v$:

$$
\begin{array}{l}
\vec{n _ P} \cdot ( v - P _ d \vec{n _ P} ) = 0 \\
\vec{n _ Q} \cdot ( v - Q _ d \vec{n _ Q} ) = 0 \\
\vec{n _ R} \cdot ( v - R _ d \vec{n _ R} ) = 0 \\
\end{array}
$$

Which resolves to three simultaneous equations:

$$
\left[
 \begin{array}{lll} 
P _ x & P _ y & P _ z \\
Q _ x & Q _ y & Q _ z  \\
R _ x & R _ y & R _ z
\end{array}
\right]
\left[
\begin{array}{l}
v _ x \\
v _ y \\
v _ z
\end{array}
\right]
=
\left[
\begin{array}{l}
P _ d \\
Q _ d \\
R _ d \\
\end{array}
\right]
$$

###### 2026-03-03






