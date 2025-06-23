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

var fasslib = require("./fasslib.js");

// pretty hacky and dangerous...
//
for (let key in fasslib) {
  eval( "var " + key + " = fasslib['" + key + "'];" );
}

// p      - base (lower left) start point of rectangle region
// alpha  - width like vector
// beta   - height like vector
// info   - info
//
function *Aglaophotis2DAsync(p, alpha, beta, info) {

  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  let a0 = (a%2);
  let b0 = (b%2);

  let d_alpha = v_delta(alpha);
  let d_beta  = v_delta(beta);

  let alpha2  = v_div2(alpha);
  let beta2   = v_div2(beta);

  let a2 = abs_sum_v(alpha2);
  let b2 = abs_sum_v(beta2);

  let dst_a2_parity = 0;
  let dst_b2_parity = 0;

  // force odd
  //
  if ((a0 == 1) &&
      (b0 == 1)) {
    dst_a2_parity = 1;
    dst_b2_parity = 1;
  }

  if ((a2%2) != dst_a2_parity) {
    alpha2 = v_add(alpha2, d_alpha);
    a2 = abs_sum_v(alpha2);
  }

  if ((b2%2) != dst_b2_parity) {
    beta2 = v_add(beta2, d_beta);
    b2 = abs_sum_v(beta2);
  }




  console.log(p, alpha, beta, alpha2, beta2, a2, b2);

}

function Aglaophotis2D(width, height) {
  let p = [0,0,0],
      alpha = [ width, 0, 0 ],
      beta  = [ 0, height, 0 ];
  let info = { };

  let pnt = [];

  let g2xy = Aglaophotis2DAsync(p, alpha, beta, info);
  for (let hv = g2xy.next() ; !hv.done ; hv = g2xy.next()) {
    let v= hv.value;
    pnt.push( [v[0], v[1], v[2]] );
  }

  return pnt;
}

function main() {
  let p = Aglaophotis2D(4,4);

  //p = Aglaophotis2D(4,5);
  //p = Aglaophotis2D(5,4);
  //p = Aglaophotis2D(5,5);

  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1]);
  }
}

main();
