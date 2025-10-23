
Rodrigues Formula
---

We're given $\omega = (\omega_x, \omega_y, \omega_z)$ ( $|\omega| = 1$ ) and $\theta \in [0, \pi)$:

$$
\begin{array}{l}
{ \omega } = (\omega_x, \omega_y, \omega_z),  |\omega| = 1 , theta \in [0, \pi) \\
I(3) = \left[ 
\begin{array}{rrr}
 1 & 0 & 0 \\
 0 & 1 & 0 \\
 0 & 0 & 1 
\end{array}
 \right] \\
W = \left[ 
\begin{array}{rrr}
 0 & -\omega_z & \omega_y \\
 \omega_z &  0 &  -\omega_x \\
 -\omega_y & \omega_x & 0 \\
\end{array}
 \right] \\
R _ { \omega}(\theta)  = I(3) + W \sin(\theta) + W^2 ( 1 - \cos(\theta)) & \\
= \left[
\begin{array}{rrr}
c _ \theta + \omega_x^2(1-c_{\theta}) &  - \omega_z s_\theta + \omega_x \omega _ y (1-c_\theta) & \omega_y s_\theta + \omega_x \omega_z (1 - c_\theta)  \\
\omega_z s_\theta + \omega_x \omega_y (1-c_\theta) & c_\theta + \omega_y^2(1-c_\theta) & -\omega_x s_\theta + \omega_y \omega_z(1-c_\theta) \\
- \omega_y s_\theta + \omega_x \omega_z (1 - c_\theta) & \omega_x s_\theta + \omega_y \omega_z(1-c_\theta) & c_\theta + \omega_z^2(1-c_\theta) 
\end{array}
\right]
\end{array}
$$

From $R \in SO(3)$, find $\omega, \theta$
---

$$
\begin{array}{ll}
Tr(R) & =  3 c_\theta + (\omega_x^2 + \omega_y^2 + \omega_z^2)(1-c_\theta) \\
  &  = 1 - 2c_\theta \\
& \to \theta = \arccos(\frac{1-Tr(R)}{2})
\end{array}
$$

$$
\begin{array}{ll}
R - R^t & = \left[
\begin{array}{rrr}
0 & - 2 \omega_z s_\theta & 2 \omega_y s_\theta \\
2 \omega_z s_\theta & 0 & -2 \omega_x s_\theta \\
-2 \omega_y s_\theta & 2 \omega_x s_\theta & 0 
\end{array}
\right] \\
\end{array}
$$

$$
\begin{array}{llr}
& \to R_{1,0} = & -2 \omega_z s_\theta \\
 & \to \omega_z =&  \frac{-R_{1,0}}{2 s_\theta} \\
 & \to \omega_y =&  \frac{R_{2,0}}{2 s_\theta} \\
 & \to \omega_x =&  \frac{-R_{2,1}}{2 s_\theta} \\
\end{array}
$$

References
---

* [Wikipedia: Rodrigues Rotation Formula](https://en.wikipedia.org/wiki/Rodrigues'_rotation_formula#Matrix_notation)
* ["Walks in Rotation Spaces Return Home when Doubled and Scaled" by Jean-Pierre Eckmann and Tsvi Tlustys](https://doi.org/10.1103/xk8y-hycn)
* [YT: "The Mystery of Spinors" by Richard Behiel](https://www.youtube.com/watch?v=b7OIbMCIfs4w)
