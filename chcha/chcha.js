// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


var _rnd = Math.random;

function pnt_cmp(a,b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return  1; }
  return 0;
}

function print_point(P) {
  for (let i=0; i<P.length; i++) {
    console.log(P[i][0], P[i][1], P[i][2]);
  }
}

function init_point(N) {
  let P = [];
  for (let i=0; i<N; i++) {
    P.push( [ _rnd(), _rnd(), _rnd() ] );
  }
  return P;
}


//
//      q
//     /
//  p./
//    \
//     \
//      r
//
// p(t) = ( p_x, p_z - t p_y, 0 )
// q(t) = ( q_x, q_z - t q_y, 0 )
// r(t) = ( r_x, r_z - t r_y, 0 )
//
// n(t) = (q-p) X (r-p)
//
// Where `X` is cross product.
// We're concerned when the z component of
// n(t) changes sign:
//
//    n_z(t) = 0
//
// -> ((q_x - p_x)(r_z - p_z) - t(q_x - p_x)(r_y - p_y) -
//    ((rx - pX_x)(q_z - p_z) + t(r_x - p_x)(q_y - p_y) = 0
//
// -> t = (q_x - p_x)(r_z - p_z) - (r_x - p_x)(q_z - p_z)
//        -----------------------------------------------
//        (q_x - p_x)(r_y - p_y) - (r_x - p_x)(q_y - p_y)
//
function _time(p,q,r) {
  let _num = ((q[0] - p[0])*(r[2] - p[2])) - ((r[0] - p[0])*(q[2] - p[2]));
  let _den = ((q[0] - p[0])*(r[1] - p[1])) - ((r[0] - p[0])*(q[1] - p[1]));
  return _num / _den;
}

// Q - even list, sorted by event time, entries of which are indices into point list P
// Q_l - left event list, sorted by event time
// Q_r - right even tlist, sorted by event time
// u_idx - index
function chcha(ctx) {
  let Q = [];

  let Q_l = ctx.Q_l;
  let Q_r = ctx.Q_r;

  let u_idx,v_idx;

  let l_idx = 0,
      r_idx = 2*n2,
      q_idx = 0,
      t_prv = T_0,
      t_cur = T_0;
  while (1) {

    let t6 = [
      time3(Q_l, l_idx),
      time3(Q_r, r_idx),

    ];

    t_prv = t_cur;
  }


}

let P = init_point(20);
P.sort(pnt_cmp);
print_point(P);

