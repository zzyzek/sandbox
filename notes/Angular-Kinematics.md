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
\mu(t) \in \mathbb{R}^3 &, \text{ center of mass in world coordinates } \\
r(t) \in \mathbb{R}^3 &, \text{ position of point in world coordinates } \\
F(t) \in \mathbb{R}^3 &, \text{ force } \\
\tau(t) = r(t) \times F(t) &, \text{ torque } \\
\Im   \in \mathbb{R}^{3,3} &, \text{ inertial tensor } \\
\Im _ {\hat{n}} = \hat{n}^T \cdot \Im \cdot \hat{n} &, \text{ moment of inertial about } \hat{n} \\
L(t) = \Im \cdot \omega(t) &, \text{ angular momemtum } \\
\end{array}
$$

Using Euler's method:

$$
Q(t + \Delta t) = R( \hat{\omega}(t), |\omega(t)| \Delta t ) \cdot Q(t)
$$


In general, the inertial tensor is defined as:

$$
\Im = \int _ {V} \left[ \begin{array}{ccc}
  y^2 + z^2 & -xy & -xz \\
  -xy & x^2 + z^2 & -yz \\
  -xz & -yz & x^2 + y^2
\end{array}
\right]
\rho dV
$$

For the case of a rigid body defined by point masses:

$$
\Im = \sum _ k m _ k \left[ \begin{array}{ccc}
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
\Delta \omega = Q \cdot \Im ^{-1} \cdot Q ^{-1} \cdot \Delta L
\end{array}
$$

With $Q ^ T = Q ^{-1}$ since $Q$ is orthogonal (and real).

---

For a rigid body, the inertial tensor, $\Im _ { \ell }$, relative to the center of mass,
need only be calculated once at initialization.

Call the global inertial tensor $\Im _ { G }$.

Initialize $\Im _ {\ell}$, $Q(t)$, $\tau(t)$, $\omega(t)$.

$$
\Im _ {G} = Q \Im _ {\ell} ^ {-1} Q ^T
$$

If we consider forces $F _ k (t)$ acting on a rigid body at world coordinates $r _ k (t)$,
then the update loop is as follows:

$$
\begin{array}{ll}
\tau(t + \Delta t) & = \sum _ k (r _ k(t) - \mu(t)) \times F _ k(t) \\
\Delta L (t + \Delta t) & = \tau(t + \Delta t) \Delta t \\
\Delta \omega ( t + \Delta t) & = Q(t) \Im _ {\ell} ^ {-1} Q(t) ^ T \Delta L(t + \Delta t) \\
 & = Q(t) \Im _ {\ell} ^ {-1} Q(t) ^ T \tau(t + \Delta t)  \Delta t \\
\to \omega (t + \Delta t) - \omega(t) & = Q(t) \Im _ {\ell} ^ {-1} Q(t) ^ T \tau(t + \Delta t)  \Delta t \\
\to  \omega(t + \Delta t) & =  \omega(t) + Q(t) \Im _ {\ell} ^ {-1} Q(t) ^ T \tau(t + \Delta t)  \Delta t \\
\theta(t + \Delta t) & = | \omega(t + \Delta t)| \\
Q(t + \Delta t) & = R( \omega(t + \Delta t) / \theta( t + \Delta t), \theta(t + \Delta t) \Delta t) Q(t) \\
\end{array}
$$




Misc
---

$$
\begin{array}{l}
r = [ x, y, z ] \\
\Im = ( |r|^2 I - r^T r )
\end{array}
$$


References
---

* [Game Physics: Motion Dynamics Fundamentals - Allen Chou (2013)](https://allenchou.net/2013/12/game-physics-motion-dynamics-fundamentals/)
* [Game Physics: Motion Dynamics Implementations - Allen Chou (2013)](https://allenchou.net/2013/12/game-physics-motion-dynamics-implementations/)
