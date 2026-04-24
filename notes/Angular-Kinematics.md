Angular Kinematic Notes
===

###### 2026-04-24

$$
\begin{array}{ll}
Q(t) \in \mathbb{R}^{3,3} &, \text{ orientation, local axis } \\
\omega(t) \in \mathbb{R}^3 &, \text{ angular velocity } \\
\ \ \hat{\omega(t)} \in \mathbb{R}^3 &, \text{ normalized axis of rotation } \\
\ \ |\omega(t)| \in \mathbb{R} &, \text{ angle of rotation } \\
R( \hat{n}, \theta ) \in \mathbb{R}^{3,3} &, \text{ rotation matrix about axis } \hat{n}, \theta \text{ angle } \\
r(t) \in \mathbb{R}^3 &, \text{ relative position of point from center of mass } \\
F(t) \in \mathbb{R}^3 &, \text{ force } \\
\tau(t) = r(t) \times F(t) &, \text{ torque } \\
I \in \mathbb{R}^{3,3} &, \text{ inertial tensor } \\
I _ {\hat{n}} = \hat{n}^T I \hat{n} &, \text{ moment of inertial about } \hat{n} \\
L(t) = I \omega(t) &, \text{ angular momemtum } \\
\end{array}
$$

Using Euler's method:

$$
Q(t + \Delta t) = R( \hat{\omega}(t), |\omega(t)| \Delta t ) Q(t)
$$


In general, the inertial tensor is defined as:

$$
I = \int _ {V} \left[ \begin{array}{ccc}
  y^2 + z^2 & -xy & -xz \\
  -xy & x^2 + z^2 & -yz \\
  -xz & -yz & x^2 + y^2
\end{array}
\right]
\rho dV
$$

For the case of a rigid body defined by point masses:

$$
I = \sum _ k m _ k \left[ \begin{array}{ccc}
  y _ k ^2 + z _ k ^2 & -x _ k y _ k & -x _ k z _ k \\
  -x _ k y _ k  & x _ k ^2 + z _ k ^2 & -y _ k z _ k  \\
  -x _ k z _ k & -y _ k z _ k  & x _ k ^2 + y _ k^2
\end{array}
\right]
$$

Angular impulse $\Delta L$:

$$
\begin{array}{l}
\Delta L = \tau(t) \Delta t \\
\Delta \omega = Q I ^{-1} Q ^{-1} \Delta L
\end{array}
$$

With $Q ^ T = Q ^{-1}$ since $Q$ is orthogonal (and real).

---



References
---

* [Game Physics: Motion Dynamics Fundamentals - Allen Chou (2013)](https://allenchou.net/2013/12/game-physics-motion-dynamics-fundamentals/)
* [Game Physics: Motion Dynamics Implementations - Allen Chou (2013)](https://allenchou.net/2013/12/game-physics-motion-dynamics-implementations/)
