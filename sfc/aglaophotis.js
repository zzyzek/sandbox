// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


// Assume a cuboid of size $W,H,D \in \mathbb{N}$, with $n = W \cdot H \cdot D$ and
// endpoints within the cuboid (not necessarily on the boundary), $\omega_0 = (x_0,y_0,z_0)$,
// $\omega_{n-1} = (x_{n-1},y_{n-1},z_{n-1})$.
// A Hamiltonian path starting at $\omega_0$ and ending at $\omega_{n-1}$ that stays completely inside
// the cuboid region is possible under the following condition:
//
// $$
// | \omega_{n-1} |_1 - | \omega_0 |_1 \equiv (n+1)  \pmod{2}
// $$
//
// uh, no, it's more subtle.
// Take a 3x3. Label lower left as 0 parity.
// Path starting at 0 and ending at 0 works.
// Path starting at 0 and ending at 1 doesn't work.
// Path starting at 1 doesn't work
//
// If the number of cells is odd, that means there's one extra 0 parity cell.
//
//
// With $|\cdot|_1$ being the 1-norm ($|x| + |y| + |z|$).
//
// I guess one way to look at it is if there are an even number of cells, there are an equal
// number of even and odd parity cells, which means if a path starts even, it has to end odd,
// and vice versa.
//
// The idea is to subdivide using some subdivision scheme. We ensure that each subdivided region will have
// exactly one or two endpoints on the boundary, with one endpoint being the case where the initially
// specified endpoint is completely enclosed by the region and two endpoints if both initial endpoints are
// within the region or no endpoints are in the region.
//
// The subdivision scheme happens at a high level so we can give information to each subdivided region
// to ensure that boundary endpoint locations are valid.
//
//
//

function *Aglaophotis2DAsync(p, q, alpha, beta) {
}


