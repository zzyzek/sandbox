Hobby Curve
===


WIP!!!

Calculations / formulas below might have many errors, beware

---

Cubic Bezier Curve [w](https://en.wikipedia.org/wiki/B%C3%A9zier_curve):

$$
\begin{array}{ll}
 \text{ control points } &  {\bf C} _ 0, {\bf C} _ 1, {\bf C} _ 2, {\bf C} _ 3 \in \mathbb{R}^d, d \in \{2,3\} \\
 & 0 \le t \le 1 \\
\end{array}
$$

$$
\begin{array}{lr}
{\bf B}(t)  = &  (1-t)^3 {\bf C} _ 0 \\
 & + 3(1-t)^2 t {\bf C} _ 1 \\
 & + 3(1-t) t^2 {\bf C} _ 2 \\
 & + t^3 {\bf C} _ 3 \\
{\bf B'}(t) = & 3(1-t)^2 ( {\bf C} _ 1 - {\bf C} _ 0) \\
  & + 6(1-t)t({\bf C} _ 2 - {\bf C} _ 1) \\
  & + 3t^2({\bf C} _ 3 - {\bf C} _ 2)   \\
{\bf B''}(t) = & 6(1-t) ( {\bf C} _ 2 - 2 {\bf C} _ 1 + {\bf C} _ 0) \\
  & + 6(1-t)t({\bf C} _ 3 - 2 {\bf C} _ 2 + {\bf C} _ 1) \\
\end{array}
$$


Hobby curve setup:

$$
\begin{array}{ll}
p _ i \in \mathbb{R}^d, & \text{ knot points }\\
v _ i = p _ {i+1} - p _ i, & \\
\ell _ i = |v _ i|, & \text{ knot distance } \\
\tau _ i \in \mathbb{R}, & \text{ tension (default 1) } \\
\alpha _ i = \arg(v _ i), & \text{ knot angle } \\
\kappa _ i = (1/2) \frac{( 1 - \tau _ {i-1}/3) \ell _ {i-1} }{ (1 - \tau _ i /3)\ell _ i}, & \text{ pseudo-curvature } \\
\rho _ i = (\ell _ i / 3) \frac{ 1 + 2 \kappa _ i}{ 1 + \kappa _ i}, & \text{ out velocity } \\
\sigma _ {i+1} = (\ell _ i / 3) \frac{ 1 + 2 /  \kappa _ i}{ 1 + 1 / \kappa _ i}, & \text{ in velocity } \\
\end{array}
$$

$$
A = 
\begin{bmatrix}
 -1 & 1 & 0 & 0 & \dots  & 0 & 0 \\
 \kappa _ 1 & -(1 + \kappa _ 1) & 1 & 0 & \dots  & 0 & 0 \\
 0 & \kappa _ 2 & -(1 + \kappa _ 2) & 1 & \dots  & 0 & 0 \\
 \vdots & \vdots & \vdots & \vdots & \ddots & \vdots & \vdots \\
 0 & 0 & 0 & 0 & \dots & -(1 + \kappa _ {n-1}) & 1 \\
 0 & 0 & 0 & 0 & \dots & 1 & -1 \\
\end{bmatrix}
$$

$$
\begin{array}{ll}
\theta =
\begin{bmatrix}
 \theta _ 0 \\
 \theta _ 1 \\
 \theta _ 2 \\
 \vdots \\
 \theta _ {n-1} \\
 \theta _ {n} \\
\end{bmatrix}
&
r =
\begin{bmatrix}
 \alpha _ 0 + c _ 0 \\
 \alpha _ 1 + \alpha _ 0 \\
 \alpha _ 2 + \alpha _ 1 \\
 \vdots \\
 \alpha _ {n-1} - \alpha _ {n-2} \\
 c _ n - \alpha _ {n-1} \\
\end{bmatrix}
\end{array}
$$

For an open curve, $c _ 0, c _ n$ canonically are 1 but variable depending on the velocity of beginning and endpoint.

For a closed curve $c _ 0 = \alpha _ {n-1}, c _ n = \alpha _ 0$ ?

Solve for $A \theta = r$, giving us $\theta _ i$.

For almost every knot point $p _ i$, we add two Bezier control points with our found $\theta _ i$:

$$
\begin{array}{llllll}
 C ^ + _ i & = &  p _ i & + & \rho _ i & \left[ \begin{array}{l} \cos( \theta _ i) \\ \sin( \theta _ i) \end{array} \right ] \\
 C ^ - _ {i+1} &  = &  p _ {i+1} & - & \sigma _ {i+1} & \left[ \begin{array}{l} \cos( \theta _ {i+1}) \\ \sin( \theta _ {i+1}) \end{array} \right ] \\
\end{array}
$$

---

For 3d, ... ?

---

The algorithm is roughly as follows:

* Given knot points $p _ i$, tension $\tau _ i$
  - calculate $v _ i$, $\ell _ i$, $\alpha _ i$, $\kappa _ i$, $\rho _ i$, $\sigma _ i$
* Solve the tri-diagonal system of equations $A \theta = r$
  - since it's tri-diagonal, simple tricks can be employed to solve quickly in linear time
* Solving for $\theta = [ \theta _ 0, \theta _ 1, \dots, \theta _ n ]$, find the auxiliary control points
  $C ^ + _ i, C ^ - _ i$, giving us the Bezier curve that realizes the Hobby curve

References
---

###### 2026-04-21
