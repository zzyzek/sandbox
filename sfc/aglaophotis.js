// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// See gilbert2d_aglaophotis for the enumeration of subdivision schemes.
//
// This is going to get a little complicated but I think it's still possible.
//
// One big issue is understanding what the base case is, but we'll defer that for now.
//
//   B
//  A C
//
// Let's start out with 00, both end points (labelled p_s, p_e) in A.
// Call boundary bounts with subcripts on the region (A_0, A_1, B_0, B_1, C_0, C_1).
//
// Calculate relative position of p_s, p_e in A
// Calculate A_0, A_1
// infer B_0 from A_0, calculate B_1
// infer C_0 from A_1, C_1 from B_1
//
// recur(A, p_s -> A_0)
// recur(B, B_0 -> B_1)
// recur(C, C_0 -> C_1)
// recur(A, A_1 -> p_e)
//
// Where  the A recursion is the tricky part.
//
//
//
//
//

var fasslib = require("./fasslib.js");

// pretty hacky and dangerous...
//
for (let key in fasslib) {
  eval( "var " + key + " = fasslib['" + key + "'];" );
}

function _cmp_v(a,b) {
  let n = ( (a.length < b.length) ? b.length : a.length );
  for (i=0; i<n; i++) {
    if (a[i] < b[i]) { return -1; }
    if (a[i] > b[i]) { return  1; }
  }
  return 0;
}

function ZigZag2D_corner(p_anchor, _p, _q, _alpha, _beta) {

  let p = v_sub(_p, p_anchor);
  let q = v_sub(_q, p_anchor);

  let d_pq = v_sub(q, p);
  let ps = abs_sum_v(d_pq);

  let a = abs_sum_v(_alpha);
  let b = abs_sum_v(_beta);

  let alpha = v_clone(_alpha);
  let beta  = v_clone(_beta);

  let d_alpha = v_delta(_alpha);
  let d_beta = v_delta(_beta);

  let cell_parity = (a*b) % 2;
  let path_parity = (ps+1)  % 2;

  if (cell_parity != path_parity) { return []; }

  // odd, endpoint should be on opposite corner
  //
  if ( ps == (a+b) ) {
  }

  // even.
  // If q sits on beta axis (height-like axis, aka 'up'),
  // then swap out alpha and beta to standardize.
  // q is on the corner and should be set to be a valid
  // ending point, so we don't need to worry about it being
  // on an even axis (since it already is).
  //
  else if ( dot_v( d_beta, d_pq ) == (b-1) ) {
    alpha = v_clone(_beta);
    beta = v_clone(_alpha);

    a = abs_sum_v(alpha);
    b = abs_sum_v(beta);

    d_alpha = v_delta(alpha);
    d_beta = v_delta(beta);
  }

  d_alpha = v_delta(alpha);
  d_beta = v_delta(beta);

  let b_dir = 1;

  let pnt = [];

  let cur_p = v_clone(p);

  for (let i=0; i<a; i++) {
    pnt.push( v_add(p_anchor, cur_p) );
    for (let j=1; j<b; j++) {
      cur_p = v_add( cur_p, v_mul(b_dir, d_beta) );
      pnt.push( v_add(p_anchor, cur_p) );
    }
    b_dir *= -1;
    cur_p = v_add( cur_p, d_alpha);
  }

  return pnt;
}

// we consider lower left cell to be parity 0.
//
function ZigZag2D_corner_border(p_anchor, _p, _q, _alpha, _beta) {

  let p = v_sub(_p, p_anchor);
  let q = v_sub(_q, p_anchor);

  let d_pq = v_sub(q, p);
  let ps = abs_sum_v(d_pq);

  let a = abs_sum_v(_alpha);
  let b = abs_sum_v(_beta);

  let alpha = v_clone(_alpha);
  let beta  = v_clone(_beta);

  let d_alpha = v_delta(_alpha);
  let d_beta = v_delta(_beta);

  let cell_parity = (a*b) % 2;
  let path_parity = (ps+1)  % 2;

  if (cell_parity != path_parity) {
    console.log("## !!!", cell_parity, "(", a, "*", b, ")", path_parity, "(", ps, "+", 1, ")" );
    return [];
  }

  // odd cell count.
  // endpoint should land on parity 0 cell
  //
  if ( ps == (a+b) ) {
  }

  // even cell count.
  // If q sits on beta axis (height-like axis, aka 'up'),
  // then swap out alpha and beta to standardize.
  // q is on the corner and should be set to be a valid
  // ending point, so we don't need to worry about it being
  // on an even axis (since it already is).
  //
  else if ( dot_v( d_beta, d_pq ) == (b-1) ) {
    alpha = v_clone(_beta);
    beta = v_clone(_alpha);

    a = abs_sum_v(alpha);
    b = abs_sum_v(beta);

    d_alpha = v_delta(alpha);
    d_beta = v_delta(beta);
  }


  console.log("#zigzag_cb:",
    "alpha:", alpha, "(", d_alpha, ",", a, ")",
    "beta:", beta, "(", d_beta, ",", b, ")",
    "p:", p, "q:", q, "(anchor:", p_anchor,")");

}

// corner border tests
//
function zz2dcb_test() {

  let v_idir = [
    [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]
  ];

  let ab_suite = [
    [ [4,0,0], [0,4,0] ],
    [ [5,0,0], [0,4,0] ],
    [ [4,0,0], [0,5,0] ],
    [ [5,0,0], [0,5,0] ]
  ];

  // debugging
  ab_suite = [
    [ [4,0,0], [0,4,0] ],
  ];
  // debugging

  let start_pos = [0,0,0];

  for (let test_idx=0; test_idx < ab_suite.length; test_idx++) {
    let alpha = ab_suite[test_idx][0];
    let beta = ab_suite[test_idx][1];

    let region_parity = 0;
    if ((alpha[0]%2) && (beta[1]%2)) { region_parity = 1; }

    let a = Math.abs(alpha[0]);
    let b = Math.abs(beta[1]);

    let d_alpha = v_delta(alpha);
    let d_beta = v_delta(beta);

    for (let ii=1; ii<a; ii+=2) {

      let p = v_clone(start_pos);

      let q = v_add( start_pos, v_mul(ii, d_alpha) );
      if (region_parity == 1) {
        if ((ii+1) >= a) { continue; }
        q = v_add( q , d_alpha );
      }

      console.log("#>>>> alpha:", alpha, "beta:", beta, "start_pos:", start_pos, "q:", q, "region_parity:", region_parity);

      ZigZag2D_corner_border(start_pos, p, q, alpha, beta);

      start_pos = v_add(v_idir[0], v_mul((test_idx+1), [6,0,0]));
    }


  }


}

//zz2dcb_test();
//process.exit();

function zz2dc_test() {

  let p = [];


  p = ZigZag2D_corner( [0,0,0], [0,0,0], [2,0,0], [3,0,0], [0,5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [6,0,0], [6,0,0], [6,10,0], [3,0,0], [0,5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  return;

  p = ZigZag2D_corner( [0,0,0], [0,0,0], [4,4,0], [5,0,0], [0,5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [7,0,0], [7,0,0], [10,0,0], [4,0,0], [0,5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [0,7,0], [0,7,0], [0,10,0], [5,0,0], [0,4,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }


  console.log("\n\n");


  p = ZigZag2D_corner( [-1,0,0], [-1,0,0], [-5,4,0], [-5,0,0], [0,5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [-8,0,0], [-8,0,0], [-11,0,0], [-4,0,0], [0,5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [-1,7,0], [-1,7,0], [-1,10,0], [-5,0,0], [0,4,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }



  console.log("\n\n");



  p = ZigZag2D_corner( [-1,-1,0], [-1,-1,0], [-5,-5,0], [-5,0,0], [0,-5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [-8,-1,0], [-8,-1,0], [-11,-1,0], [-4,0,0], [0,-5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [-1,-7,0], [-1,-7,0], [-1,-10,0], [-5,0,0], [0,-4,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }


  console.log("\n\n");



  p = ZigZag2D_corner( [ 1,-1,0], [ 1,-1,0], [ 5,-5,0], [ 5,0,0], [0,-5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [ 8,-1,0], [ 8,-1,0], [ 11,-1,0], [ 4,0,0], [0,-5,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [ 1,-7,0], [ 1,-7,0], [ 1,-10,0], [ 5,0,0], [0,-4,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }


  console.log("\n\n");

  p = ZigZag2D_corner( [ 5,5,0], [ 5,5,0], [ 8,5,0], [ 4,0,0], [0,4,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [ -6,6,0], [ -6,6,0], [ -9,6,0], [-4,0,0], [0,4,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [ -6,-6,0], [ -6,-6,0], [ -9,-6,0], [-4,0,0], [0,-4,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

  p = ZigZag2D_corner( [ 6,-6,0], [ 6,-6,0], [ 9,-6,0], [4,0,0], [0,-4,0] );
  for (let i=0; i<p.length; i++) { console.log(p[i][0], p[i][1]); }

  console.log("\n\n");

}

zz2dc_test();
process.exit();



// zig zag realization with starting path point in corener and
// end point on boundary
//
/*
function ZigZagPath2D_corner_boundary(p_anchor, _p, _q, _alpha, _beta) {

  let p = v_sub(_p, p_anchor);
  let q = v_sub(_q, p_anchor);

  let alpha = v_clone(_alpha);
  let beta = v_clone(_beta);

  if      ( _cmp_v(p, _alpha) == 0 ) { alpha = v_mul(-1, _alpha); }
  else if ( _cmp_v(p, _beta)  == 0 ) {
  }
  else if ( _cmp_v(p, v_add(_alpha, _beta)) == 0 ) {
  }

  let u = v_add(p, _alpha);
  if ( _cmp_v(u, _alpha) == 0 ) {
  }




  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);





}
*/

function feasible2DTwoPath(p_anchor, _p0,_q0,_p1,_q1, alpha, beta, info) {
  info = ((typeof info === "undefined") ? {} : info);

  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  let n_cell = a*b;

  let p0 = v_sub(_p0, p_anchor);
  let q0 = v_sub(_q0, p_anchor);
  let p1 = v_sub(_p1, p_anchor);
  let q1 = v_sub(_q1, p_anchor);


  let cell_parity = n_cell % 2;
  let p_sum_parity = abs_sum_v( v_add(p0,q0,p1,q1) ) % 2;

  if (cell_parity == p_sum_parity) {
    info["status"] = false;
    info["comment"] = "fail: parity mismatch between points and number of cells";
    return false;
  }

  let ab = v_add(alpha, beta);

  console.log(ab);

  let _b = [p0,q0,p1,q1];
  let boundary_count = 0;
  for (let i=0; i<_b.length; i++) {
    let _p = _b[i];
    if ( (_p[0] == 0) ||
         (_p[1] == 0) ||
         (_p[0] == (ab[0]-1)) ||
         (_p[1] == (ab[1]-1)) ) {
      boundary_count++;
    }
  }

  console.log(boundary_count);

  let _b_sort = [];

  if (boundary_count == 4) {
    let m = _b.length;
    _b.sort( _cmp_v );

    let p0_idx = 0;
    for (let i=0 ; i<m; i++) {
      if (_cmp_v(_b[i], p0) == 0) { p0_idx = i; break; }
    }

    if ( (_cmp_v(_b[p0_idx], p0) == 0) &&
         (_cmp_v(_b[(p0_idx+2)%m], q0) == 0) ) {
      info["status"] = false;
      info["comment"] = "fail: crossing paths";
      return false;
    }

  }


  info["status"] = true;
  info["comment"] = "default";
  return true;
}

let info = {};
feasible2DTwoPath([0,0,0], [0,0,0], [2,2,0], [2,0,0], [0,2,0], [3,0,0], [0,3,0], info);

console.log(info);

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
  let info = {
    "n_interior": 0,
    "p_interior": [ [-1,-1], [-1,-1] ],

    "n_boundary": 0,
    "p_boundary": [ [-1,-1], [-1,-1] ],
  };

  info.n_interior = 2;
  info.p_interior[0][0] = 0;
  info.p_interior[0][1] = 0;

  info.p_interior[1][1] = 0;
  info.p_interior[1][0] = width-1;

  if (((width%2) == 1) &&
      ((height%2) == 0)) {
    info.p_interior[1][0] = width-2;
  }

  let pnt = [];

  let g2xy = Aglaophotis2DAsync(p, alpha, beta, info);
  for (let hv = g2xy.next() ; !hv.done ; hv = g2xy.next()) {
    let v= hv.value;
    pnt.push( [v[0], v[1], v[2]] );
  }

  return pnt;
}

function main() {
  let p = Aglaophotis2D(5,4);

  //p = Aglaophotis2D(4,5);
  //p = Aglaophotis2D(5,4);
  //p = Aglaophotis2D(5,5);

  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1]);
  }
}

//main();
