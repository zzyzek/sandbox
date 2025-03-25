https://ar5iv.labs.arxiv.org/html/2210.01098

---

###### 2025-03-24

Here's the idea for a mostly resolving 3d Gilbert curves.

First some assumptions:

* the path starts at the `(0,0,0)` and ends at `(0,w,0)`
* subdivision will be chosen to have:
  - two `1x1x1`
  - two `2x1x1` (congruent shaped blocks)
  - one `1x2x1`
* any subdivison that forces a notch will be localized
  to a single sub-block

Some basic ideas before we get into enumeration:

* even sides give choice to subdivide even/even or odd/odd
* when the major docking axis is even, the path is possible
* when the major docking axis is odd, the only time
  there's a viable path is if all sides are odd
  - otherwise we can try to localize the notch into one
    of the sub-blocks

There are three major configurations, $P_0$, $P_1$, $P_2$:

```
 z
 ^ _ y
 | /|
 |/
 *---> x

     ______          ______          ______
    /B / D/|        /B / D/|        /   C /|
   /-----/ |       /  /  / |       /-----/ |
  /____ /| |      /__/_ / /|      /__/_ /|/|
 |  C  | | |     |  |  | /C|     |  | D| |B|
 |__ __|/|/      |__|__|/|/      |  |__|/|/
 |A | E| /       |A | E| /       |A | E| /
 |__|__|/        |__|__|/        |__|__|/
 ^     v         ^     v         ^     v
```

`

| `W%2` | `H%2` | `D%2` | Configuration |  A  |  B  |  C  |  D  |  E  | notch |
|-------|-------|-------|---------------|-----|-----|-----|-----|-----|-------|
|   0   |   0   |   0   | $P_0$				  | 000 | 000 | 000 | 000 | 000 |       |
|   0   |   0   |   1   | $P_1$				  | 000 | 010 | 000 | 010 | 000 |       |
|   0   |   1   |   0   | $P_0$				  | 000 | 001 | 000 | 001 | 000 |       |
|   0   |   1   |   1   | $P_1$				  | 010 | 111 | 010 | 111 | 010 |       |
|   1   |   0   |   0   | $P_0$				  | 000 | 000 | 100 | 010 | 001 |   C   |
|   1   |   0   |   1   | $P_1$				  | 000 | 010 | 110 | 011 | 010 |   C   |
|   1   |   1   |   0   | $P_0$				  | 000 | 001 | 101 | 011 | 001 |   C   |
|   1   |   1   |   1   | $P_2$				  | 010 | 011 | 111 | 011 | 010 |       |

Here, $A$, $B$, $C$, $D$, $E$ have their parity in their local axis directions.

Each of the local axis direction has the first axis, $\alpha$ in the direction of connectors,
the second axis, $\beta$ "in-plane" and such that $\alpha \times \beta = \gamma$, where $\gamma$
is the third axis.
All three axies, $\alpha$, $\beta$, $\gamma$, should be on three sides of the enclosing
rectangular cuboid.

So, if we consider the originating cube as having $\alpha$, $\beta$, $\gamma$ as the
original basis vectors (e.g. $(1,0,0), (0,1,0), (0,0,1)$ to start), then the
recursion can be done by using these basis vectors, with length and in axis adjustments.

$\alpha, \beta, \gamma \in \mathbb{R}^3$ but we'll abuse notation to say
$f(\alpha) = (f(\alpha_x), f(\alpha_y), f(\alpha_z)$.
For example $\lfloor \alpha \rfloor = ( \lfloor \alpha_x \rfloor, \lfloor \alpha_y \rfloor, \lfloor \alpha_z \rfloor)$
and $\frac{\alpha}{2} = ( \frac{\alpha_x}{2}, \frac{\alpha_y}{2}, \frac{\alpha_z}{2} )$.

Further, let $\alpha_{2e}$, $\beta_{2e}$, $\gamma_{2e}$ be
$\frac{\alpha}{2}, \frac{\beta}{2}, \frac{\gamma}{2}$ with
1 added to the major axis direction to force it to be even, respectively.

That is, $\alpha_{2e}$ is integer division of 2 and adding one to force it to be even.
Call the remaining value $\alpha_{2*} = \alpha - \alpha_{2e}$, which could be even or
odd depending on what $\alpha$ is.

A more complicated way of saying this is:

$$
\begin{array}{l}
\alpha_{2e} = 2 \cdot \lfloor \frac{\alpha}{4} \rfloor + \lfloor 2 \cdot \{ \frac{\alpha}{4} \} \rfloor \\
\alpha_{2 * } = \alpha - \alpha_{2e} \\
\beta_{2e} = 2 \cdot \lfloor \frac{\beta}{4} \rfloor + \lfloor 2 \cdot \{ \frac{\beta}{4} \} \rfloor \\
\beta_{2 * } = \beta - \beta_{2e} \\
\gamma_{2e} = 2 \cdot \lfloor \frac{\gamma}{4} \rfloor + \lfloor 2 \cdot \{ \frac{\gamma}{4} \} \rfloor \\
\gamma_{2 * } = \gamma - \gamma_{2e}
\end{array}
$$


| `whd` | Config. |   A   |   B   |   C   |   D   |   E   |
|-------|---------|-------|-------|-------|-------|-------|
| `000` |  $P_0$  | $\beta_{2e}, \gamma_{2e}, \alpha_{2e}$ | $\gamma, \alpha_{2e}, \beta_{2*}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\gamma, -\alpha_{2 * }, \beta_{2 * }$ | $-\beta_{2e}, \gamma_{2e}, -\alpha_{2 * }$ |
| `001` |  $P_1$  | $\gamma_{2e}, \alpha_{2e}, \beta_{2e}$ | $\beta, \gamma_{2 * }, \alpha_{2e}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\beta, \gamma_{2 * }, -\alpha_{2 * }$ | $-\gamma_{2 e}, \alpha_{2 * }, \beta_{2e}$ |
| `010` |  $P_0$  | $\beta_{2e}, \gamma_{2e}, \alpha_{2e}$ | $\gamma, \alpha_{2e}, \beta_{2*}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\gamma, -\alpha_{2 * }, \beta_{2 * }$ | $-\beta_{2e}, \gamma_{2e}, -\alpha_{2 * }$ |
| `011` |  $P_1$  | $\gamma_{2e}, \alpha_{2e}, \beta_{2e}$ | $\beta, \gamma_{2 * }, \alpha_{2e}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\beta, \gamma_{2 * }, -\alpha_{2 * }$ | $-\gamma_{2 e}, \alpha_{2 * }, \beta_{2e}$ |
| `100` |  $P_0$  | $\beta_{2e}, \gamma_{2e}, \alpha_{2e}$ | $\gamma, \alpha_{2e}, \beta_{2*}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\gamma, -\alpha_{2 * }, \beta_{2 * }$ | $-\beta_{2e}, \gamma_{2e}, -\alpha_{2 * }$ |
| `101` |  $P_1$  | $\gamma_{2e}, \alpha_{2e}, \beta_{2e}$ | $\beta, \gamma_{2 * }, \alpha_{2e}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\beta, \gamma_{2 * }, -\alpha_{2 * }$ | $-\gamma_{2 e}, \alpha_{2 * }, \beta_{2e}$ |
| `110` |  $P_0$  | $\beta_{2e}, \gamma_{2e}, \alpha_{2e}$ | $\gamma, \alpha_{2e}, \beta_{2*}$ | $\alpha, -\beta_{2 * }, -\gamma_{2 * }$ | $-\gamma, -\alpha_{2 * }, \beta_{2 * }$ | $-\beta_{2e}, \gamma_{2e}, -\alpha_{2 * }$ |
| `111` |  $P_2$  | $\beta_{2e}, \gamma, \alpha_{2e}$ | $\gamma_{2e}, \alpha, \beta_{2 * }$ | $\alpha, \beta_{2 * }, \gamma_{2 * }$ | $-\beta_{2e}, \gamma_{2 * }, -\beta_{2 e}$ | $-\gamma_{2e}, -\alpha_{2 e}, \beta_{2e}$ |


###### 2025-03-17

Things are really bad for the 3D Gilbert curve.
Not only are non-contiguous path jumps most likely
unbounded, but it's not clear that the jump is even
bounded.

For example, a 5x5x5 has a jump of 2.
Removing the initial orientation so that the width
is anchored and doing larger realizations (8x11x11?)
shows even bigger jumps.

Unlike the 2D Gilbert curve, the 3D gilbert curve
doesn't do any adaptive reshaping, other than a blind
force of the A block to be even.
This causes problems in other blocks downstream.

There *might* be a way to fix this, but I'm still
thinking about it.

The observation is this:

As a coarse metric, just having a path be possible
with anchored start and endpoints means that the
parity of the path through the rectangular cuboid
has to match the parity of the width.

So consider the parity table:

| (W,H,D) | width endpoint | path endpoint | Possible path |
|---------|----------------|---------------|---------------|
| (0,0,0) | 0 | 0 | y |
| (0,0,1) | 0 | 0 | y |
| (0,1,0) | 0 | 0 | y |
| (0,1,1) | 0 | 0 | y |
| (1,0,0) | 1 | 0 | n |
| (1,0,1) | 1 | 0 | n |
| (1,1,0) | 1 | 0 | n |
| (1,1,1) | 1 | 1 | y |

For the case where the width is odd and the whole path is even,
no path from the start point to end point is possible without
a jump.

What we can try to do is the same in the 2D case, where we
try to push the jump to a specific block, making sure it's
in a particular location and there's only one.

So, as a first attempt, consider each of the three cases:

* `(1,0,0)`
  - choose `h2` to be even, creating an even `W` case so that blocks `A` and `E` are viable
  - blocks `B` and `D` inherit their width from the even `H`, so are viable
  - block `C` has odd width from `W`, so has a jump
* `(1,0,1)`
  - no way to do this without introducing multiple jumps
  - instead, introduce a new block subdivision, where `A`, `E` connect to
    `B`, `D` "logs" ( `1x2x1`, both on top ), that connect to `C` on bottom (`2x1x1`)
  - chose `d2` to be even to make `A`, `E` viable, `h` makes the new `B`, `D` viable,
    and `C` absorbs the inviability
* `(1,1,0)`
  - `h2` even, making `A`, `E` viable
  - `d` even, making `B`, `D` viable
  - `C` inherits the odd `w`, absorbing the inviability
  - some choice on `w2` parity


