// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// The main structure is the graph_ctx:
//
// {
//   C : <array of boundary points in ccw order>
//   Ct : <array of types of boundary bounts>
//     'c' : convex (relative inward)
//     'r' : reflex (concave, relative inward)
//
//   X : <array of x coordinates of grid points (domain)>
//   Y : <array of y coordinates of grid points (domain)>
//     note that some combinations of points from X,Y will not be valid grid points
//
//   B : <array of [i,j] border points>
//   Bt : <array of border type>
//     'c' : convex
//     'r' : reflex
//     'b' : border
//   Bxy : <array of border xy points>
//   Bij : <2d array [j,i]>
//     values map to B index, -1 if not a border point
//
//   G : <array of grid points>
//   Gt : <array of grid point types>
//     'c' : original boundary point
//     'b' : point on edge, on boundary but not in C
//     'i' : interior point
//   Gxy : <array of grid xy points>
//   Gij : <2d array [j,i]>
//      values map to G index, -1 if invalid grid point
//
//   Js : <3d array, [idir,j,i]>
//     entries map to first general border index point, -1 if invalid
// }
//

var fasslib = require("./fasslib.js");

var norm2_v = fasslib.norm2_v;
var v_sub = fasslib.v_sub;
var v_add = fasslib.v_add;
var v_mul = fasslib.v_mul;
var dot_v = fasslib.dot_v;
var cross3 = fasslib.cross3;
var v_delta = fasslib.v_delta;
var abs_sum_v = fasslib.abs_sum_v;

var pgon = [
  [0,0], [0,2], [1,2], [1,3], [3,3],
  [3,1], [2,1], [2,0]
];

var pgon_pinwheel = [
  [1,-1], [1,1], [0,1], [0,5], [2,5], [2,6],
  [4,6], [4,3], [5,3], [5,0], [3,0], [3,-1],
];

var pgn_pinwheel1 = [
  [0,6], [4,6], [4,0], [9,0],
  [9,4], [14,4], [14,9], [11,9],
  [11,15], [6,15], [6,11], [0,11]
];

// example that can have quarry endpoints floating over
// the sides.
// Used to show various rejection conditions for cleave
// cuts eminating from corners of quarry rectangle.
//
var pgn_balance = [
  [0,6], [5,6], [5,8], [9,8],
  [9,11], [12,11], [12,6], [15,6],
  [15,0], [21,0], [21,9], [19,9],
  [19,17], [14,17], [14,21], [7,21],
  [7,19], [3,19], [3,14], [0,14]
];

// can choose quarry so that it's perched wholly
// on the top of a 2cut
//
var pgn_quarry_share_2cut = [
  [0,8], [7,8], [7,7], [10,7],
  [10,12], [13,12], [13,9], [15,9],
  [15,5], [18,5], [18,2], [22,2],
  [22,0], [27,0], [27,18], [20,18],
  [20,23], [4,23], [4,17], [1,17],
  [1,14], [0,14]
];

var pgn_spiral = [
  [0,0], [35,0], [35,10], [32,10],
  [32,2], [2,2], [2,26], [28,26],
  [28,21], [30,21], [30,17], [27,17],
  [27,6], [6,6], [6,22], [21,22],
  [21,11], [10,11], [10,18], [15,18],
  [15,14], [18,14], [18,20], [9,20],
  [9,8], [25,8], [25,24], [4,24],
  [4,4], [30,4], [30,15], [33,15],
  [33,28], [11,28], [11,29], [0,29]
];

var pgn_spiral1 = [
  [0,0], [11,0], [11,12], [9,12],
  [9,15], [3,15], [3,19], [8,19],
  [8,26], [27,26], [27,10], [16,10],
  [16,20], [19,20], [19,22], [20,22],
  [20,16], [19,16], [19,14], [22,14],
  [22,23], [10,23], [10,15], [13,15],
  [13,8], [31,8], [31,23], [33,23],
  [33,29], [5,29], [5,21], [0,21],
  [0,6], [5,6], [5,10], [3,10],
  [3,13], [7,13], [7,3], [0,3]
];


var pgon_fig1 = [
  [0,3], [0,9], [7,9], [7,10], [10,10],
  [10,8], [12,8],
  [12,4], [11,4],
  [11,1], [8,1], [8,5], [4,5],
  [4,7], [3,7], [3,3]
];

var pgon_fig11 = [
  [ 0, 0],[ 0, 3],[ 3, 3],[ 3, 5],
  [ 5, 5],[ 5, 8],[ 7, 8],[ 7, 4],
  [ 8, 4],[ 8, 6],[10, 6],[10, 0],
  [ 6, 0],[ 6, 1],[ 1, 1],[ 1, 0]
];

var pgon_fig9 = [
  [0,13], [4,13], [4,8], [8,8],
  [8,3], [14,3], [14,13], [23,13],
  [23,10], [16,10], [16,0], [19,0],
  [19,7], [26,7], [26,3], [31,3],
  [31,10], [33,10], [33,8], [37,8],
  [37,17], [34,17], [34,19], [32,19],
  [32,22], [36,22], [36,25], [34,25],
  [34,29], [33,29], [33,27], [31,27],
  [31,28], [28,28], [28,26], [25,26],
  [25,27], [21,27], [21,30], [16,30],
  [16,29], [6,29], [6,26], [12,26],
  [12,20], [10,20], [10,24], [0,24],
  [0,23], [7,23], [7,21], [4,21],
  [4,18], [0,18],
];

var pgon_fig10 = [
  [0,14], [11,14], [11,8], [19,8],
  [19,0], [22,0], [22,5], [25,5],
  [25,19], [28,19], [28,23], [22,23],
  [22,28], [3,28], [3,17], [0,17],
];

var pgon_fig11d = [
  [0,12], [4,12], [4,14], [9,14],
  [9,12], [12,12], [12,8], [2,8],
  [2,5], [12,5], [12,3], [8,3],
  [8,0], [20,0], [20,10], [26,10],
  [26,8], [30,8], [30,14], [28,14],
  [28,16], [20,16], [20,18], [26,18],
  [26,25], [17,25], [17,27], [4,27],
  [4,25], [14,25], [14,21], [12,21],
  [12,20], [4,20], [4,17], [8,17],
  [8,18], [12,18], [12,15], [2,15],
  [2,20], [0,20],
];

let pgn_custom0 = [
  [0,9], [0,13], [3,13], [3,18],
  [6,18], [6,15], [9,15], [9,19],
  [18,19], [18,10], [13,10], [13,4],
  [7,4], [7,0], [3,0], [3,9]
];

/*
let _pgn_custom1 = [
  [0,5], [8,5], [8,0], [11,0],
  [11,2], [15,2], [15,8], [11,8],
  [11,16], [6,16], [6,19], [0,19],
  [0,15], [3,15], [3,10], [0,10],
];
*/

var pgn_custom1 = [
    [0,5], [8,5], [8,0], [11,0],
    [11,2], [15,2], [15,8], [11,8],
    [11,16], [6,16], [6,19], [0,19],
    [0,15], [3,15], [3,8], [0,8],
];

let pgn_clover = [
  [0,2], [10,2], [10,6], [17,6],
  [17,0], [31,0], [31,4], [23,4],
  [23,12], [30,12], [30,27], [20,27],
  [20,19], [8,19], [8,24], [3,24],
  [3,14], [10,14], [10,10], [0,10]
];

var pgn_clover1 = [
  [0,2], [10,2], [10,6], [17,6],
  [17,0], [31,0], [31,4], [23,4],
  [23,12], [30,12], [30,27], [20,27],
  [20,19], [10,19], [10,24], [3,24],
  [3,14], [10,14], [10,10], [0,10],
];

var pgn_clover2 = [
  [0,12], [5,12], [5,9], [2,9],
  [2,1], [10,1], [10,5], [13,5],
  [13,0], [20,0], [20,7], [17,7],
  [17,13], [23,13], [23,19], [15,19],
  [15,16], [8,16], [8,20], [0,20],
];

var pgn_clover3 = [
    [0,2], [10,2], [10,4], [17,4],
    [17,0], [31,0], [31,4], [23,4],
    [23,12], [30,12], [30,27], [20,27],
    [20,19], [8,19], [8,24], [3,24],
    [3,14], [10,14], [10,10], [0,10],
];

var pgn_double_edge_cut = [
  [0,9], [5,9], [5,10], [8,10],
  [8,3], [14,3], [14,0], [19,0],
  [19,6], [16,6], [16,12], [10,12],
  [10,17], [8,17], [8,19], [2,19],
  [2,12], [0,12],
];

var pgn_quarry_corner_convex = [
  [0,6], [5,6], [5,3], [13,3],
  [13,0], [18,0], [18,5], [15,5],
  [15,10], [10,10], [10,17], [5,17],
  [5,10], [0,10],
];


var pgn_left_run = [
  [0,9], [6,9], [6,7], [2,7],
  [2,5], [6,5], [6,3], [10,3],
  [10,0], [13,0], [13,3], [16,3],
  [16,18], [12,18], [12,22], [6,22],
  [6,18], [3,18], [3,15], [6,15],
  [6,11], [0,11],
];

var pgn_bottom_guillotine = [
  [0,0], [3,0], [3,6], [5,6],
  [5,4], [7,4], [7,6], [9,6],
  [9,3], [11,3], [11,6], [13,6],
  [13,2], [16,2], [16,6], [19,6],
  [19,4], [21,4], [21,6], [25,6],
  [25,12], [20,12], [20,15], [14,15],
  [14,10], [8,10], [8,12], [1,12],
  [1,4], [0,4],
];

var pgn_cavity = [
  [0,11], [6,11], [6,0], [19,0],
  [19,3], [31,3], [31,26], [20,26],
  [20,21], [25,21], [25,17], [28,17],
  [28,13], [24,13], [24,7], [18,7],
  [18,5], [9,5], [9,8], [7,8],
  [7,12], [4,12], [4,15], [7,15],
  [7,18], [9,18], [9,20], [11,20],
  [11,28], [8,28], [8,21], [0,21]
];

var pgn_dragon = [
  [0,4], [19,4], [19,0], [27,0],
  [27,2], [31,2], [31,9], [27,9],
  [27,17], [24,17], [24,19], [21,19],
  [21,17], [18,17], [18,19], [15,19],
  [15,17], [12,17], [12,19], [9,19],
  [9,17], [6,17], [6,21], [0,21],
  [0,12], [4,12], [4,9], [0,9],
];

// testing cleave enumerating when a quarry corner has a border
// and open slot available.
//
var pgn_horseshoe = [
  [0,0], [5,0], [5,3], [9,3],
  [9,5], [13,5], [13,0], [17,0],
  [17,3], [20,3], [20,8], [17,8],
  [17,18], [7,18], [7,20], [2,20],
  [2,15], [5,15], [5,11], [2,11],
  [2,8], [0,8],
];

function _write_data(ofn, data) {
  var fs = require("fs");
  return fs.writeFileSync(ofn, JSON.stringify(data, undefined, 2));
}

function _ifmt(v, s) {
  s = ((typeof s === "undefined") ? 0 : s);
  let t = v.toString();

  let a = [];

  for (let i=0; i<(s-t.length); i++) {
    a.push(' ');
  }
  a.push(t);

  return a.join("");
}

function _sfmt(v, s, ws_lr) {
  s = ((typeof s === "undefined") ? 0 : s);
  lr = ((typeof lr === "undefined") ? 'l' : ws_lr);
  let a = [];

  if (ws_lr != 'l') { a.push(v); }
  for (let i=0; i<(s - v.length); i++) { a.push(" "); }
  if (ws_lr == 'l') { a.push(v); }

  return a.join("");
}

function _print_pgon(p, pt) {
  pt = ((typeof pt === "undefined") ? [] : pt);
  for (let i=0; i<p.length; i++) {

    if (i < pt.length) { console.log("#", i, pt[i]); }
    console.log(p[i][0], p[i][1]);
  }

  if (p.length > 0) {
    console.log(p[0][0], p[0][1]);
  }
}

function _print_dual(dualG, pfx) {
  pfx = ((typeof pfx === "undefined") ? "" : pfx);
  for (let j=(dualG.length-1); j>=0; j--) {
    let pl = [];
    for (let i=0; i<dualG[j].length; i++) {

      let v = dualG[j][i].id;
      if (v < 0) { v = '   .'; }
      else { v = _ifmt(v, 4); }

      pl.push( v );
    }
    console.log( pfx + pl.join(" ") );
  }
}

function _print1da(A, hdr, ws, line_pfx, fold) {
  hdr = ((typeof hdr === "undefined") ? "" : hdr);
  ws = ((typeof ws === "undefined") ? 8 : ws);
  line_pfx = ((typeof line_pfx === "undefined") ? "" : line_pfx);
  fold = ((typeof fold === "undefined") ? 12 : fold);
  console.log(hdr);

  let row_s = [ line_pfx ];
  for (let i=0; i<A.length; i++) {
    if (row_s.length == fold) {
      console.log( row_s.join("") );
      row_s = [ line_pfx ];
    }

    let v = _ifmt( JSON.stringify(A[i]), ws );
    row_s.push(v);
  }
  if (row_s.length > 0) {
    console.log( row_s.join("") );
  }
}

function _print2da(A, hdr, ws, line_pfx) {
  hdr = ((typeof hdr === "undefined") ? "" : hdr);
  ws = ((typeof ws === "undefined") ? 3 : ws);
  line_pfx = ((typeof line_pfx === "undefined") ? "  " : line_pfx);
  console.log(hdr);
  for (let j=(A.length-1); j>=0; j--) {
    let row_s = [line_pfx];
    for (let i=0; i<A[j].length; i++) {
      let v = _ifmt( JSON.stringify(A[j][i]), ws );
      let s = ( (v < 0) ? "  ." : _ifmt(v, 3) );
      row_s.push( s );
    }
    console.log(row_s.join(" "));
  }
  console.log("");
}

function _print_rprp(ctx) {

  _print1da(ctx.Cxy, "\n## Cxy:");
  _print1da(ctx.Ct, "\n## Ct:");

  _print1da(ctx.Gxy,   "\n## Gxy:");
  _print1da(ctx.G,  "\n## G:");
  _print1da(ctx.Gt,    "\n## Gt:");
  _print2da(ctx.Gij,   "\n## Gij:");

  _print1da(ctx.Bxy,  "\n## Bxy:");
  _print1da(ctx.B,    "\n## B:");
  _print1da(ctx.Bt,   "\n## Bt:");
  _print2da(ctx.Bij,  "\n## Bij:");

  let idir_descr = [ "+x", "-x", "+y", "-y" ];
  for (let idir=0; idir<4; idir++) {
    _print2da(ctx.Js[idir],   "\n## Js[" + idir_descr[idir] + "]:");
  }

  for (let idir=0; idir<4; idir++) {
    _print2da(ctx.Je[idir],   "\n## Je[" + idir_descr[idir] + "]:");
  }

}

function _print_cleave(cleave) {

  let g = [];
  for (let i=0; i<cleave.length; i+=2) {
    g.push( cleave[i] + cleave[i+1] );
  }
  return g.join(" ");

}

// helper functions
//

function _BBInit(BB,x,y) {
  BB[0][0] = x;
  BB[1][0] = x;

  BB[0][1] = y;
  BB[1][1] = y;
}

function _BBUpdate(BB,x,y) {
  BB[0][0] = Math.min( BB[0][0], x );
  BB[0][1] = Math.min( BB[0][1], y );

  BB[1][0] = Math.max( BB[1][0], x );
  BB[1][1] = Math.max( BB[1][1], y );
}

function _ijkey(p) {
  return p[0].toString() + "," + p[1].toString();
}

function _to_idir(dv) {
  if (dv[0] >  0.5) { return 0; }
  if (dv[0] < -0.5) { return 1; }
  if (dv[1] >  0.5) { return 2; }
  if (dv[1] < -0.5) { return 3; }
  return -1;
}

function dxy2idir( dxy ) {
  if (dxy[0] ==  1) { return 0; }
  if (dxy[0] == -1) { return 1; }
  if (dxy[1] ==  1) { return 2; }
  if (dxy[1] == -1) { return 3; }
  return -1;
}

function _xyKey(xy) {
  return xy[0].toString() + "," + xy[1].toString();
}

function _icmp(a,b) {
  if (a < b) { return -1; }
  if (a > b) { return  1; }
  return 0;
}

function clockwise(pgn) {
  let s = 0;

  for (let i=0; i<pgn.length; i++) {
    let j = (i+1+pgn.length)%pgn.length;
    let u = pgn[i];
    let v = pgn[j];
    s += (v[0]-u[0])*(v[1]+u[1]);
  }

  if (s > 0) { return true; }
  return false;
}

function orderCounterclockwise(pgn) {
  if (!clockwise(pgn)) { return pgn; }
  let ccw = [ pgn[0] ];
  for (let i=(pgn.length-1); i>0; i--) {
    ccw.push( pgn[i] );
  }
  return ccw;
}

// https://jeffe.cs.illinois.edu/teaching/comptop/2023/notes/02-winding-number.html
//
function winding(u, pgn) {
  let w = 0;
  let n = pgn.length;

  for (let i=0; i<n; i++) {
    let p = pgn[i];
    let q = pgn[(i+1)%n];

    let d = ((p[0] - u[0])*(q[1] - u[1])) - ((p[1] - u[1])*(q[0] - u[0]));

    if      ((p[0] <= u[0]) && (u[0] < q[0]) && (d > 0)) { w ++; }
    else if ((q[0] <= u[0]) && (u[0] < p[0]) && (d < 0)) { w --; }

  }

  return w;
}

function windingA(pgn) {
  let n = pgn.length;
  let s = 0;
  for (let i=0; i<n; i++) {
    let p = pgn[i];
    let q = pgn[(i+1)%n];
    s += (q[0] - p[0])*(q[1] + p[1]);
  }
  return s;
}

//
// helper functions

// Returns true if p on boundary of pgn,
// false if not.
//
// slightly modified from:
// https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Vector_formulation
//
// take projection of p onto line segment made from (i,i+1) (ccw ordered)
// boundary points.
// If the the distance of the projected point is within eps and the point
// lies within the line segment (0 <= t <= dl), it's on the boundary.
//
//
function onBoundary(p, pgn) {
  let _eps = (1/1024);
  let n = pgn.length;

  for (let i=0; i<n; i++) {
    let a = [ pgn[i][0], pgn[i][1] ];
    let dn = [ pgn[(i+1)%n][0] - a[0], pgn[(i+1)%n][1] - a[1] ];
    let dl = norm2_v(dn);
    dn[0] /= dl;
    dn[1] /= dl;

    let p_m_a = v_sub(p,a);
    let t = dot_v( p_m_a , dn );
    let u = v_sub( p_m_a, v_mul(t, dn) );

    let dist = norm2_v( u );

    if ((t < (-_eps)) ||
        (t > (dl+_eps))) { continue; }

    if (dist < _eps) { return true; }
  }

  return false;
}

//---

function _rprp_sanity( rl_pgon ) {

  let n = rl_pgon.length;

  // sanity
  //
  for (let cur_idx=0; cur_idx<rl_pgon.length; cur_idx++) {
    let prv_idx = (cur_idx+n-1)%n;
    let dxy = v_sub( rl_pgon[cur_idx], rl_pgon[prv_idx] );
    let adx = Math.abs(dxy[0]);
    let ady = Math.abs(dxy[1]);

    if (((adx == 0) && (ady == 0)) ||
        ((adx != 0) && (ady != 0))) { return 1; }
  }
  //
  // sanity

  return 0;
}

// refactored RPRP
//
// returns context
//
function RPRPInit(_rl_pgon, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : 1);
  let _eps = (1/(1024));

  let Cxy = [],
      Ct = [];

  let G = [],
      Gt = [],
      Gij = [],
      Gxy = [];

  let B = [],
      Bt = [],
      Bij = [],
      Bxy = [];

  let X = [],
      Y = [];

  let Js = [ [], [], [], [] ],
      Je = [ [], [], [], [] ];

  let idir_dxy = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let x_dup = [],
      y_dup = [];

  let pnt_map = {};
  let corner_type = [];

  if (_rl_pgon.length == 0) { return []; }
  Cxy = orderCounterclockwise( _rl_pgon );
  if ( Cxy.length == 0) { return {}; }
  if (_rprp_sanity( Cxy )) { return {}; }

  for (let i=0; i<Cxy.length; i++) {
    x_dup.push(Cxy[i][0]);
    y_dup.push(Cxy[i][1]);

    let p_prv = [ Cxy[(i+Cxy.length-1)%Cxy.length][0], Cxy[(i+Cxy.length-1)%Cxy.length][1], 0 ];
    let p_cur = [ Cxy[i][0], Cxy[i][1], 0 ];
    let p_nxt = [ Cxy[(i+1)%Cxy.length][0], Cxy[(i+1)%Cxy.length][1], 0 ];

    let v0 = v_sub( p_prv, p_cur );
    let v1 = v_sub( p_nxt, p_cur );

    let _c = cross3( v0, v1 );

    let corner_code = 'X';

    if      (_c[2] < _eps) { corner_code = 'r'; }
    else if (_c[2] > _eps) { corner_code = 'c'; }

    Ct.push(corner_code);
  }

  x_dup.sort( _icmp );
  y_dup.sort( _icmp );

  // X and Y dedup
  //
  X.push( x_dup[0] );
  Y.push( y_dup[0] );

  for (let i=1; i<x_dup.length; i++) {
    if (x_dup[i] == x_dup[i-1]) { continue; }
    X.push(x_dup[i]);
  }

  for (let i=1; i<y_dup.length; i++) {
    if (y_dup[i] == y_dup[i-1]) { continue; }
    Y.push(y_dup[i]);
  }

  // init Gij, Bij, Js
  //

  //DEBUG
  if (_debug) {
    _print1da(Cxy, "\n## Cxy:");
    _print1da(Ct, "\n## Ct:");
  }
  //DEBUG

  for (let j=0; j<Y.length; j++) {
    Gij.push([]);
    Bij.push([]);
    for (let idir=0; idir<4; idir++) {
      Js[idir].push([]);
      Je[idir].push([]);
    }
    for (let i=0; i<X.length; i++) {
      Gij[j].push(-1);
      Bij[j].push(-1);
      for (let idir=0; idir<4; idir++) {
        Js[idir][j].push(-1);
        Je[idir][j].push(-1);
      }
    }
  }

  // populate Bij
  //
  // Bij is a 2d index grid whose entries hold
  // the index of the general border points, if they exist (-1 otherwise).
  // To populate, start at a primitive Cxy border point, map it to the
  // ij grid, find the direction of change and start walking the ij
  // grid, populating Bij as we go until we hig the next primitive border point.
  //
  // Keep the general border point index to ij and xy mapping in B, Bxy respectively.
  //

  let XY = [ X, Y ];

  let xy = Cxy[0];
  let ij = [-1,-1];

  for (let i=0; i<X.length; i++) { if (X[i] == xy[0]) { ij[0] = i; } }
  for (let j=0; j<Y.length; j++) { if (Y[j] == xy[1]) { ij[1] = j; } }

  let b_idx = 0;
  for (let c_idx=0; c_idx < Cxy.length; c_idx++) {
    let c_nxt = (c_idx+1)%Cxy.length;

    let dC = v_sub( Cxy[c_nxt], Cxy[c_idx] );
    let xyd = ( (Math.abs(dC[0]) < _eps) ? 1 : 0 );
    let dij = v_delta( dC );
    let d_idx = ( ((dij[0] + dij[1]) > _eps) ? 1 : -1 );
    for (let idx=ij[xyd], t=0; (idx >= 0) && (idx<XY[xyd].length); idx += d_idx, t++) {

      if (Cxy[c_nxt][xyd] == XY[xyd][idx]) { break; }

      Bij[ ij[1] ][ ij[0] ] = b_idx;
      Bxy.push( [ X[ij[0]], Y[ij[1]] ] );
      B.push( [ ij[0], ij[1] ] );
      Bt.push( (t==0) ? Ct[c_idx] : 'b' );

      b_idx++;

      ij = v_add( ij, dij );
    }

  }

  //DEBUG
  if (_debug) {
    _print1da(Bxy,  "\n## Bxy:");
    _print1da(B,    "\n## B:");
    _print1da(Bt,   "\n## Bt:");
    _print2da(Bij,  "\n## Bij:");
  }
  //DEBUG


  // populate Js ("border jump" structure)
  //
  // Js has four 2d entries, one for each idir (0 +x, 1 -x, 2 +y, 3 -y).
  // Each 2d Js entry holds the index of the first border point
  // encountered if a ray were to start at the ij point and shoot out
  // in the entries direction.
  // If a point starts out of bounds or shoots in a direction that is
  // out of bounds, the entry is -1.
  // By convention, if the starting point is on a border and the ray
  // is in line to the same border, the entry is the index of the
  // first border point encountered after leaving the in line border
  // or the concave (inner corner) if the line border doesn't deposit
  // in an open region.
  //
  // For each direction, we shoot a ray until we hit the border.
  // This should be O(n^2), as we're only touching each entry O(1)
  // times.
  //

  //-----------------------------------------------------
  // I - interior, a - afar, n - near
  //
  //        idir      +x        -x        +y        -y
  // idx  prv nxt   I  a  n   I  a  n   I  a  n   I  a  n
  //  0    0   0    .  .  .   .  .  .   0 -1 -1   1  B  B
  //  1    1   1    .  .  .   .  .  .   1  B  B   0 -1 -1
  //  2    2   2    1  B  B   0 -1 -1   .  .  .   .  .  .
  //  3    3   3    0 -1 -1   1  B  B   .  .  .   .  .  .
  //  4    0   2    1  B  B   0 -1 -1   0 -1 -1   1  B  B
  //  5    0   3    .  .  .   .  .  B   .  .  .   .  .  B
  //  6    1   2    .  .  B   .  .  .   .  .  B   .  .  .
  //  7    1   3    0 -1 -1   1  B  B   1  B  B   0 -1 -1
  //  8    2   0    .  .  B   .  .  .   .  .  .   .  .  B
  //  9    2   1    1  B  B   0 -1 -1   1  B  B   0 -1 -1
  //  10   3   0    0 -1 -1   1  B  B   0 -1 -1   1  B  B
  //  11   3   1    .  .  .   .  .  B   .  .  B   .  .  .
  //
  // Note that the walk is in the opposite direction of the ray,
  // so +x above is indicating the ray is shooting in the +x direction
  // but we look at transitions walking from right to left.
  //
  // Whenever we change from exterior to interior, we need to update
  // the near and far saved indices.
  // There are only a few other cases where the near index needs
  // to be updated.
  //
  // Consider updating the Js structure for the +x direction.
  // We are walking from right to left, so in the opposite of the +x
  // Js portion we're filling out.
  // We start with a near index as -1, representing the outside.
  // As we walk from right to left, we update the point with
  // whatever our current near index is.
  // We update the near index (after the Js entry update) depending on what 
  // point it is:
  //   - if it's a border with outside on right and inside on left,
  //     reset near index to the current border index
  //   - if it's a a border corner with border on the right and
  //     interior or non-contiguous border on left, update the near
  //     index
  //   - otherwise no change to near index
  //
  // In some sense this is a state machine that updates the
  // near index to populate the Js entries with depending on the
  // three-point/two-line-segments we see if the current point
  // is a border.
  //
  // The interior state is unused but kept in case we might
  // want it for the future.
  //
  //-----------------------------------------------------

  // idir to lookup
  //
  let _idir2lu = [
    [  0, -1,  4,  5 ],
    [ -1,  1,  6,  7 ],
    [  8,  9,  2, -1 ],
    [ 10, 11, -1,  3 ]
  ];

  // lookup to Interior, afar, near
  //
  let _lu_Ian = [

    // idir prv, idir nxt
    // e.g. 21 y-up (+y) followed by x-left (-x)
    // note that the cleave can't go back on itself, so e.g. 01 isn't represented
    //
    //  00     11     22     33     02     03     12     13     20     21     30     31
    //
    [ "...", "...", "1BB", "0--", "1BB", "...", "..B", "0--", "..B", "1BB", "0--", "..." ],
    [ "...", "...", "0--", "1BB", "0--", "..B", "...", "1BB", "...", "0--", "1BB", "..B" ],

    [ "0--", "1BB", "...", "...", "0--", "...", "..B", "1BB", "...", "1BB", "0--", "..B" ],
    [ "1BB", "0--", "...", "...", "1BB", "..B", "...", "0--", "..B", "0--", "1BB", "..." ]

  ];

  // begin, end, delta for X and Y directions
  //
  let _ibound = [
    [ [X.length-1, -1, -1], [0,Y.length,1] ],
    [ [0, X.length, 1],     [0,Y.length,1] ],
    [ [0, X.length, 1],     [Y.length-1,-1,-1] ],
    [ [0, X.length, 1],     [0,Y.length,1] ]
  ];

  for (let idir=0; idir<4; idir++) {

    let _interior = 0;
    let afar_B_idx = -1,
        near_B_idx = -1;

    if (idir < 2) {

      for (let j = _ibound[idir][1][0]; j != _ibound[idir][1][1]; j += _ibound[idir][1][2]) {

        afar_B_idx = -1;
        near_B_idx = -1;

        for (let i = _ibound[idir][0][0]; i != _ibound[idir][0][1]; i += _ibound[idir][0][2]) {

          Je[idir][j][i] = afar_B_idx;
          Js[idir][j][i] = near_B_idx;

          if (Bij[j][i] >= 0) {

            let cur_B_idx = Bij[j][i];
            let cur_B_ij = B[cur_B_idx];
            let prv_B_ij = B[(cur_B_idx-1 + B.length) % B.length];
            let nxt_B_ij = B[(cur_B_idx+1) % B.length];

            let _dprv = v_sub( cur_B_ij, prv_B_ij );
            let _dnxt = v_sub( nxt_B_ij, cur_B_ij );

            let _idir_prv = dxy2idir( _dprv );
            let _idir_nxt = dxy2idir( _dnxt );

            let __c = cur_B_idx;
            let __p = (cur_B_idx-1 + B.length) % B.length ;

            let _code = _lu_Ian[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_code[0] == '0') { _interior = 0; }
            else if (_code[0] == '1') { _interior = 1; }

            if      (_code[1] == 'B') { afar_B_idx = cur_B_idx; }
            else if (_code[1] == '-') { afar_B_idx = -1; }

            if      (_code[2] == 'B') { near_B_idx = cur_B_idx; }
            else if (_code[2] == '-') { near_B_idx = -1; }

          }

        }

      }

    }

    else {

      for (let i = _ibound[idir][0][0]; i != _ibound[idir][0][1]; i += _ibound[idir][0][2]) {

        afar_B_idx = -1;
        near_B_idx = -1;

        for (let j = _ibound[idir][1][0]; j != _ibound[idir][1][1]; j += _ibound[idir][1][2]) {

          Je[idir][j][i] = afar_B_idx;
          Js[idir][j][i] = near_B_idx;

          if (Bij[j][i] >= 0) {

            let cur_B_idx = Bij[j][i];
            let cur_B_ij = B[cur_B_idx];
            let prv_B_ij = B[(cur_B_idx-1 + B.length) % B.length];
            let nxt_B_ij = B[(cur_B_idx+1) % B.length];

            let _dprv = v_sub( cur_B_ij, prv_B_ij );
            let _dnxt = v_sub( nxt_B_ij, cur_B_ij );

            let _idir_prv = dxy2idir( _dprv );
            let _idir_nxt = dxy2idir( _dnxt );

            let _code = _lu_Ian[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_code[0] == '0') { _interior = 0; }
            else if (_code[0] == '1') { _interior = 1; }

            if      (_code[1] == 'B') { afar_B_idx = cur_B_idx; }
            else if (_code[1] == '-') { afar_B_idx = -1; }

            if      (_code[2] == 'B') { near_B_idx = cur_B_idx; }
            else if (_code[2] == '-') { near_B_idx = -1; }

          }

        }

      }

    }

    
  }

  //DEBUG
  if (_debug) {
    let idir_descr = [ "+x", "-x", "+y", "-y" ];
    for (let idir=0; idir<4; idir++) {
      _print2da(Js[idir],   "\n## Js[" + idir_descr[idir] + "]:");
    }
  }
  //DEBUG


  // 0000 0001 0010 0011
  //
  //   x    ?    ?    =
  //
  // 0100 0101 0110 0111
  //
  //   ?    L    J   _|_
  //
  // 1000 1001 1010 1011
  //
  //   ?    r    7   T
  //
  // 1100 1101 1110 1111
  //
  //   |    F    -|  .
  //

  let gt_lu = [
    'x', '?', '?', '=',
    '?', 'L', 'J', 't',
    '?', 'r', '7', 'T',
    '|', 'F', 'd', 'i'

  ];

  let g_idx = 0;
  for (let j=0; j<Y.length; j++) {
    for (let i=0; i<X.length; i++) {
      if ( (Js[0][j][i] < 0) &&
           (Js[1][j][i] < 0) &&
           (Js[2][j][i] < 0) &&
           (Js[3][j][i] < 0) ) { continue; }

      let t =
        ((Js[0][j][i] < 0) ? 0 : 1) +
        ((Js[1][j][i] < 0) ? 0 : 2) +
        ((Js[2][j][i] < 0) ? 0 : 4) +
        ((Js[3][j][i] < 0) ? 0 : 8);

      G.push( [i,j] );
      Gxy.push( [X[i], Y[j]] );
      Gt.push( gt_lu[t] );
      Gij[j][i] = g_idx;

      g_idx++;

    }
  }

  let DP_cost = [],
      DP_partition = [],
      DP_bower = [],
      DP_rect = [];
  for (let i=0; i<(2*B.length*B.length); i++) {
    DP_cost.push(-1);
    DP_partition.push("XXXXXXXXXXXX");
    DP_bower.push(-1);
    DP_rect.push(-1);
  }

  // RPRP context
  //
  return {
    "X" : X,
    "Y" : Y,

    "Cxy": Cxy,
    "Ct" : Ct,

    "G"  : G,
    "Gt" : Gt,
    "Gij": Gij,
    "Gxy": Gxy,

    "B"  : B,
    "Bt" : Bt,
    "Bxy": Bxy,
    "Bij": Bij,

    "Js" : Js,
    "Je" : Je,

    "DP_partition": DP_partition,
    "DP_bower": DP_bower,
    "DP_rect": DP_rect,

    "DP_cost" : DP_cost
  };

}

// By convention, border indices are in counterclockwise order.
//
// Is idx in the interval [idx_s, idx_e] (inclusive) or,
// if idx_e < idx_s one of the two intervals [0,idx_e] [idx_s, N-1]
// (inclusive)?
//
// 0 if not in inclusive interval
// 1 if in inclusive interval
//
// In the special case that idx_s == idx_e, return 1 (considered
// in interval)
//
function wrapped_range_contain( idx, idx_s, idx_e ) {
  if (idx < 0) { return 0; }
  if (idx_e > idx_s ) {
    if ((idx >= idx_s) && (idx <= idx_e)) { return 1; }
    return 0;
  }
  if ((idx > idx_e) && (idx < idx_s)) { return 0; }
  return 1;
}

function _ivec_incr(v,b) {
  b = ((typeof b === "undefined") ? 2 : b);
  let carry = 1;

  for (let i=0; (i<v.length) && (carry > 0); i++) {
    carry = 0;
    v[i]++;
    if (v[i] >= b) {
      v[i] = 0;
      carry = 1;
    }
  }

  return carry;
}

function _ivec0(v) {
  for (let i=0; i<v.length; i++) {
    if (v[i] != 0) { return false; }
  }
  return true;
}

// Test for cleave on border.
// That is, cleave is inline with a boundary edge.
//
// Return:
//
// 0 cleave not on boundary edge (oob, inside, etc.)
// 1 cleave is on edge
//
function RPRP_cleave_border(ctx, g, idir) {

  // cleave oob
  //
  if ( ctx.Js[idir][ g[1] ][ g[0] ] < 0 ) { return 0; }

  let dg = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let g_nei = [
    g[0] + dg[idir][0],
    g[1] + dg[idir][1]
  ];

  let _bb = ctx.Bij[g[1]][g[0]]
  let _be = ctx.Bij[g_nei[1]][g_nei[0]]

  // boundary index is within 1 of each other
  //
  if ((_bb < 0) || (_be < 0) ||
      (Math.abs(_be-_bb) != 1)) {
    return 0;
  }

  return 1;
}

// Input:
//
// ctx  - rprp context
// g_s  - border grid point (ij) start of region (ccw)
// g_e  - border grid point (ij) end of region
// g_a  - origin of quarry rectangle (adit)
// g_b  - end of quarry rectangle (bower)
//
//
// Output:
//
// [ q0, q1, ... , q11 ]
//
// 12 element array of indicating what type of ray it is:
//
// 'x' - out of bounds of the rectilinear polygon
// 'X' - out of bounds of the region
// 'c' - corner border point
// 'b' - flat edge border
// '.' - open (cleave cut potenteially allowed)
//
// The cleave profile is meant to be used in the cleave enumeration step.
//
// Create a cleave cut profile, an array of character codes indicating
// whether a cleave cut off of the quarry rectangle endpoints is possible
// and, if not, what type of ray it is.
//
// Note that if it's a 2-cut, g_a is the intersection point of the lines
// eminating from g_s and g_e.
// If it's a 1-cut, then g_a should be g_s or g_e.
//
// No checks are done to see if the rectangle is valid, whether g_a
// is a valid endpoint, etc.
//
function RPRPCleaveProfile(ctx, g_s, g_e, g_a, g_b) {
  let X = ctx.X,
      Y = ctx.Y;
  let Bij = ctx.Bij;

  // boundary start and end index
  //
  let b_idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let b_idx_e = Bij[ g_e[1] ][ g_e[0] ];

  if ((b_idx_s < 0) || (b_idx_e < 0)) { return []; }

  // grid rectangle corners
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];

  let cleave_profile = [ '~', '~', '~', '~', '~', '~', '~', '~' ];

  for (let i=0; i<cleave_idir.length; i++) {
    let g = Rg[ Math.floor(i/2) ];

    let b_c_idx = ctx.Js[ cleave_idir[i] ][ g[1] ][ g[0] ];

    // cleave oob
    //
    if (b_c_idx < 0) {
      cleave_profile[i] = 'x';
      continue;
    }

    // cleave is within polygon but not in considered region
    //
    if ( ! wrapped_range_contain( b_c_idx, b_idx_s, b_idx_e ) ) {
      cleave_profile[i] = 'X';
      continue;
    }

    // cleave inline with boundary edge
    //
    if ( RPRP_cleave_border(ctx, g, cleave_idir[i] ) ) {
      cleave_profile[i] = 'b';
      continue;
    }

    // cleave on corner
    //
    if ((b_c_idx == b_idx_s) || (b_c_idx == b_idx_e)) {
      cleave_profile[i] = 'c';
      continue;
    }

    // cleave open
    //
    cleave_profile[i] = '.';
    continue;

  }

  return cleave_profile;
}

// Cleave cut index around the quarry rectangle:
//
//   5     6
// 4 ._____. 7
//   |     |
// 3 ._____. 0
//   2     1
//
//

// Input:
//
// rprp_info      - rprp context
// grid_quarry    - grid points of quarry rectangle, in standard order (idx 0 lower right, idx 3 upper right)
// cleave_choice  - character indicator for each cleave choice (aka cleave profile)
//                `-` open
//                `*` cleave cut
//                `x` invalid direction (out of bounds)
//                `X` invalid direction (out of bounds in other region)
// cleave_border_type - character indicator for each cleave choice what type of general grid point it
//                      ends on for the rectilinear polygon border
//                      `b` border (flat)
//                      `*` corner (convex or concave)
//
// Output:
//
//  1 - cleave_choice is valid
//  0 - otherwise
//
// This checks to see if the cleave_choice is valid given a quarry rectangle and current state.
// The main checks are:
//
// Bridge   - make sure a cleave cut isn't in between two lines (it can move otherwise)
// Float    - make sure each cleave cut, when extended, ends on a convex border corner
// Parallel - make sure no two cleave cuts are parallel (quarry edge can move otherwise)
//
// Parallel tests are easy as it's wholly embedded in the cleave_choice.
// Bridge tests are easy enough because we can see if the end of the cleave cut
//   ends on a flat border and if there's a cleave cut perpendicular to where the cleave cut starts.
// Float tests are harder as we need to look in the other direction, both from potential cleave
//   cuts shooting off of the quarry rectangle in the other direction or look to see if the border
//   intersects the quarry rectangle on the side of the cleave cut. See below for a discussion of
//   the test.
//

// STILL WRONG
// pgc_custom1 is failing for both the cleave enumeration and the side cleave
// there are more special cases here that we're not taking into account.
//

function RPRP_valid_cleave(ctx, quarry, cleave_choice, cleave_border_type, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let R = quarry;

  let Js = ctx.Js;

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let quarry_point_type = ['~', '~', '~', '~'];

  for (let i=0; i<4; i++) {
    let b_id = Bij[ R[i][1] ][ R[i][0] ];

    if (b_id < 0) {
      quarry_point_type[i] = '.';
      continue;
    }

    quarry_point_type[i] = Bt[b_id];
  }

  if (_debug) { console.log("#vc.cp0"); }

  let redux = [];
  for (let i=0; i<cleave_choice.length; i++) {
    let _code = '^';
    if      (cleave_choice[i] == '-') { _code = '-'; }
    else if (cleave_choice[i] == '*') { _code = '*'; }
    else if (cleave_choice[i] == 'c') { _code = '*'; }
    else if (cleave_choice[i] == 'b') { _code = '*'; }
    //else if (cleave_choice[i] == 'b') { _code = 'b'; }
    else if (cleave_choice[i] == 'x') { _code = 'x'; }
    else if (cleave_choice[i] == 'X') { _code = 'x'; }
    //else { console.log("!!!!", i, cleave_choice[i]); }

    redux.push( _code );
  }

  // quarry rectangle edge is 'undocked', not
  // buffetted by a border perimeter
  //

  let oppo_idir  = [1,0, 3,2];
  let cleave_idir = [ 0,3, 3,1, 1,2, 2,0 ];

  let R_b_idx = [
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1]
  ];

  for (let idx=0; idx < 8; idx++) {
    let r_idx = Math.floor(idx/2);
    let idir = cleave_idir[idx];
    let rdir = oppo_idir[idir];

    let B = Js[ idir ][ R[r_idx][1] ][ R[r_idx][0] ];
    if (B < 0) { B = Bij[ R[r_idx][1] ][ R[r_idx][0] ]; }

    let b = Js[ rdir ][ R[r_idx][1] ][ R[r_idx][0] ];
    if (b < 0) { b = Bij[ R[r_idx][1] ][ R[r_idx][0] ]; }

    R_b_idx[r_idx][idir] = B;
    R_b_idx[r_idx][rdir] = b;
  }

  //console.log(R_b_idx);

  let _undock = [ 1, 1, 1, 1 ];

  let _rcur = 0,
      _rnxt = 1;
  if ( (R_b_idx[_rcur][0] != R_b_idx[_rnxt][0]) ||
       (R_b_idx[_rcur][1] != R_b_idx[_rnxt][1]) ) {
    _undock[0] = 0;
  }

  _rcur = 1; _rnxt = 2;
  if ( (R_b_idx[_rcur][2] != R_b_idx[_rnxt][2]) ||
       (R_b_idx[_rcur][3] != R_b_idx[_rnxt][3]) ) {
    _undock[1] = 0;
  }

  _rcur = 2; _rnxt = 3;
  if ( (R_b_idx[_rcur][0] != R_b_idx[_rnxt][0]) ||
       (R_b_idx[_rcur][1] != R_b_idx[_rnxt][1]) ) {
    _undock[2] = 0;
  }

  _rcur = 3; _rnxt = 0;
  if ( (R_b_idx[_rcur][2] != R_b_idx[_rnxt][2]) ||
       (R_b_idx[_rcur][3] != R_b_idx[_rnxt][3]) ) {
    _undock[3] = 0;
  }

  /*
  if ( (Js[0][ R[1][1] ][ R[1][0] ] != Js[0][ R[0][1] ][ R[0][0] ]) ||
       (Js[1][ R[1][1] ][ R[1][0] ] != Js[1][ R[0][1] ][ R[0][0] ]) ) {
    _undock[0] = 0;
  }

  if ( (Js[2][ R[1][1] ][ R[1][0] ] != Js[2][ R[2][1] ][ R[2][0] ]) ||
       (Js[3][ R[1][1] ][ R[1][0] ] != Js[3][ R[2][1] ][ R[2][0] ]) ) {
    _undock[1] = 0;
  }

  if ( (Js[0][ R[2][1] ][ R[2][0] ] != Js[0][ R[3][1] ][ R[3][0] ]) ||
       (Js[1][ R[2][1] ][ R[2][0] ] != Js[1][ R[3][1] ][ R[3][0] ]) ) {
    _undock[2] = 0;
  }

  if ( (Js[2][ R[0][1] ][ R[0][0] ] != Js[2][ R[3][1] ][ R[3][0] ]) ||
       (Js[3][ R[0][1] ][ R[0][0] ] != Js[3][ R[3][1] ][ R[3][0] ]) ) {
    _undock[3] = 0;
  }
  */



  if (_debug) { console.log("#vc.cp1:", cleave_choice.join(""), redux.join(""), JSON.stringify(_undock) ); }

  // each corner needs at least one cleave cut
  //
  if ((redux[0] == '-') && (redux[1] == '-')) { return 0; }
  if ((redux[2] == '-') && (redux[3] == '-')) { return 0; }
  if ((redux[4] == '-') && (redux[5] == '-')) { return 0; }
  if ((redux[6] == '-') && (redux[7] == '-')) { return 0; }

  if (_debug) { console.log("#vc.cp2"); }

  // parallel cleave cuts means middle billet is moveable
  //
  if ((_undock[3] == 1) && (redux[0] == '*') && (redux[7] == '*')) { return 0; }
  if ((_undock[0] == 1) && (redux[1] == '*') && (redux[2] == '*')) { return 0; }
  if ((_undock[1] == 1) && (redux[3] == '*') && (redux[4] == '*')) { return 0; }
  if ((_undock[2] == 1) && (redux[5] == '*') && (redux[6] == '*')) { return 0; }


  if (_debug) { console.log("#vc.cp3, redux:", redux.join(""), "cbt:", cleave_border_type.join("") ); }

  // bridge tests
  // cleave line bridges two borders, so is moveable, invalidating choice
  //
  // if there's a cleave line that ends on a flat boundary edge
  // and there's a cleave line going orthogonal, it's a bridge (-> invalid)
  //
  if ((redux[0] == '*') && (redux[1] == '*') && (cleave_border_type[0] == 'b')) { return 0; }
  if ((redux[1] == '*') && (redux[0] == '*') && (cleave_border_type[1] == 'b')) { return 0; }

  if ((redux[2] == '*') && (redux[3] == '*') && (cleave_border_type[2] == 'b')) { return 0; }
  if ((redux[3] == '*') && (redux[2] == '*') && (cleave_border_type[3] == 'b')) { return 0; }

  if ((redux[4] == '*') && (redux[5] == '*') && (cleave_border_type[4] == 'b')) { return 0; }
  if ((redux[5] == '*') && (redux[4] == '*') && (cleave_border_type[5] == 'b')) { return 0; }

  if ((redux[6] == '*') && (redux[7] == '*') && (cleave_border_type[6] == 'b')) { return 0; }
  if ((redux[7] == '*') && (redux[6] == '*') && (cleave_border_type[7] == 'b')) { return 0; }

  if (_debug) { console.log("#vc.cp4, redux:", redux.join(""), "cbt:", cleave_border_type.join("") ); }


  // float tests
  // at least one end must be on a corner
  //

  // we'll use cleave 5 (upper left corner, pointing upwards) as an example:
  //
  // IF   cleave_5 is present and ends on a border (upwards)
  // AND  opposite of cleave_5 (cleave_2) exists and ends on a border or
  //        cleave_2 doesn't exist at all
  // AND  origin point of cleave_5 (quarry_point_2) has the same endpoint as
  //        origin of clave_2 (quarry_point_1)
  // AND  cleave_5 doesn't start on an original corner border
  // THEN cleave cut is floating
  //
  // It's verbose but the idea is that if cleave 5 ends on a border
  // then either there must be a corner butting the quarry rectangle
  // (determined from the endpoint tests) or the opposive cleave 2 has
  // to end on a corner.
  //


  if (_debug) { console.log("#cc.cp5"); }

  //let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];
  let oppo_cleave = [ 3, 6, 5, 0,
                      7, 2, 1, 4 ];
  //let oppo_idir = [ 1,0, 3,2 ];

  for (cleave_idx = 0; cleave_idx < 8; cleave_idx++) {
    let r_idx = Math.floor(cleave_idx/2);
    let rev_cleave_idx = oppo_cleave[cleave_idx];
    let rev_r_idx = Math.floor(rev_cleave_idx/2);
    let idir = cleave_idir[cleave_idx];
    let rdir = oppo_idir[idir];

    if ((quarry_point_type[r_idx] != 'c') &&
        (redux[cleave_idx] == '*') && (cleave_border_type[cleave_idx] == 'b') &&
        (((redux[rev_cleave_idx] == '*') && (cleave_border_type[rev_cleave_idx] == 'b')) ||
          (redux[rev_cleave_idx] == '-')) &&
        (Js[idir][ R[r_idx][1] ][ R[r_idx][0] ] == Js[idir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]) &&
        (Js[rdir][ R[r_idx][1] ][ R[r_idx][0] ] == Js[rdir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ])) {

      if (_debug) {
        console.log("#vc.cp5.5: cleave_idx:", cleave_idx, "rect_idx:", r_idx);
        console.log("qpt[", r_idx, "]:", quarry_point_type[r_idx],
          "redux[", cleave_idx, "]:", redux[cleave_idx],
          "cbt[", cleave_idx, "]:", cleave_border_type[cleave_idx],
          "redux[", rev_cleave_idx, "]:", redux[rev_cleave_idx],
          "cbt[", rev_cleave_idx, "]:", cleave_border_type[rev_cleave_idx],
          "js[", idir, "][", R[r_idx][1], "][", R[r_idx][0], "]:", Js[idir][ R[r_idx][1] ][ R[r_idx][0] ],
          "js[", idir, "][", R[rev_r_idx][1], "][", R[rev_r_idx][0], "]:", Js[idir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]);

      }

      return 0;
    }

  }

  if (_debug) { console.log("#vc.cp6"); }

  return 1;
}


// go through all possibilities of cleave cuts from quarry rectangle (end points).
// Maximum is 2^8 = 256 but this is reduced by only considering cleave cuts for
// '.' entries of the cleave profile.
//
// This function returns a list of cleave cuts that pass tests,
// where a cleave cut realization can be removed from consideration if it has:
//
// * bridges:   cleave cut has endpoints on flat borders, so is moveable
// * floats:    maximum edge of cleave cut does not end on a primitive convex border point
// * parallel:  there is another cleave cut parallel to it
//
// cleave cuts will also not be chosen the go outside of the region, as defined
// by the counterclockwise trace of the general border grid point g_s to the general
// border grid point g_e.
//
// This function takes as input grid points, as opposed to `enumerateCleaveCutPoint`, which
// takes in general points.
//
function RPRP_cleave_enumerate(ctx, g_s, g_e, g_a, g_b, cleave_profile, _debug) {

  //let _debug = false;
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js;

  // boundary start and end index
  //
  let b_idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let b_idx_e = Bij[ g_e[1] ][ g_e[0] ];

  if (_debug) {
    console.log(">>>", b_idx_s, b_idx_e, g_s, g_e, g_a, g_b);
  }

  if ((b_idx_s < 0) || (b_idx_e < 0)) { return []; }

  let cleave_a = [];

  // grid rectangle corners
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];

  let bvec = [],
      bvec_idx = [];
  for (let i=0; i<cleave_profile.length; i++) {
    if (cleave_profile[i] == '.') {
      bvec.push(0);
      bvec_idx.push(i);
    }
  }

  if (_debug) {
    console.log("::>>", cleave_profile.join(""));
  }

  let cleave_border_type = [ '~', '~', '~', '~', '~', '~', '~', '~' ];

  for (let i=0; i<cleave_profile.length; i++) {

    if ((cleave_profile[i] == 'x') || (cleave_profile[i] == 'X')) {
      cleave_border_type[i] = 'x';
      continue;
    }

    if (cleave_profile[i] == 'b') {
      cleave_border_type[i] = 'b';
      continue;
    }

    if (cleave_profile[i] == 'c') {
      cleave_border_type[i] = '*';
      continue;
    }

    if (cleave_profile[i] == '.') {
      let r_idx = Math.floor(i/2);
      let b_idx = Js[ cleave_idir[i] ][ Rg[r_idx][1] ][ Rg[r_idx][0] ];

      let _type = Bt[b_idx];

      if      (_type == 'b') { cleave_border_type[i] = 'b'; }
      else if (_type == 'c') { cleave_border_type[i] = '*'; }
    }

  }

  let cleave_choices = [];

  do {

    let b_idx = 0;
    let cleave_choice = [];
    for (let i=0; i<cleave_profile.length; i++) {
      cleave_choice.push( cleave_profile[i] );
      if (cleave_profile[i] == '.') {
        cleave_choice[i] = ( bvec[b_idx] ? '*' : '-' );
        b_idx++;
      }

    }

    if (_debug) {
      console.log(">>>", JSON.stringify(bvec), cleave_choice.join(""),
        RPRP_valid_cleave( ctx, Rg, cleave_choice, cleave_border_type, _debug ) );
    }

    if (RPRP_valid_cleave( ctx, Rg, cleave_choice, cleave_border_type )) {
      cleave_choices.push(cleave_choice);
    }

    _ivec_incr(bvec);
  } while ( !_ivec0(bvec) );

  return cleave_choices;
}

function _cleave_cmp(a,b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return  1; }
  return 0;
}

// return an array of arrays representing the available cuts
// for the quarry rectangle.
//
// Example:
//
// [
//   [[3,15,[2,3]],[28,3,[2,3]]],
//   [[28,30,[2,3]],[30,15,[2,3]]],
//   [[3,15,[2,3]],[28,30,[2,3]],[30,3,[2,3]]]
// ]
//
// * Find the cleave profile
// * Use the cleave profile to enumerate valid cleave choices
// * Find border points implied by clave choices to create cut
//   schedule
//
// Finding fence portions for the cuts can get a little complicated
// so it's easier to add two cuts per cleave in the cleave enumeration
// and remove duplicates at the end.
//
// In more detail:
//
// w.l.o.g., consider the bottom right endpoint of Rg (Rg_0).
// We say the 'even' cleave, if it exists, is the one shooting out to the right
// and the 'odd' cleave, if it exists, is the one shooting down.
//
// If the even cleave exists, add the two-cut (Js[0][Rg_0], Js[2][Rg_0], Rg_0).
// If the odd cleave cut next to it (clockwise) exists, add an additional
// two-cut of (Js[0][Rg_0], Js[3][Rg_0], Rg_0), otherwise add a 1-cut
// (Js[0][Rg_0], Js[1][Rg_0], Rg_0).
//
// If the odd cleave cut exists, add the two-cut of (Js[3][Rg_0], Js[1][Rg_0], Rg_0).
// If the previouse (counterclockwise) even cleave exists, add the two-cut
// (Js[0][Rg_0], Js[3][Rg_0], Rg_0), otherwise add the one-cut (Js[3][Rg_0], Js[2][Rg_0], Rg_0).
//
// Do this for all endpoints around Rg, rotating the idirs etc clockwise by pi/2 at endpoint
// location.
//
// ---
//
// At the end, remove duplicate one-cut and two-cuts and put them in a cleave cut schedule.
//
// ---
//
// Discussion:
//
// All one-cut and two-cuts should be non-overlapping (besides shared endpoints), so the
// deduplication sort that orders by first border index should be sufficient.
//
// Cleave cuts should only ever be on quarry rectangle (Rg) endpoints that are proper interior grid points.
// If a quarry rectangle endpoint has an open grid line in one direction and a border edge in the other,
// it is an error (I believe) for a cleave cut to be present on the open grid line.
// Should the minimum cut involve a cleave cut at this grid line, the cleave will be discovered
// during the recursion when processing the sub-region.
//
//
function RPRPQuarryCleaveCuts(ctx, g_s, g_e, g_a, g_b, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  let Js = ctx.Js;
  let Bij = ctx.Bij;
  let B = ctx.B;

  //
  //  5    6    7
  //     2---3
  //  4  |   |  0
  //     1---0
  //  3    2    1
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let oppo = [ 1,0, 3,2 ];

  let cleave_sched = [];

  // Cleave profile is the pattern (e.g. b...XXxx),
  // Cleave choice is an enumeration of those patterns, choosing a cleave if valid
  //   (e.g. b-*-XXxx, b--*XXxx, b-**XXxx)
  // Side cleave cuts are guillotine cuts that are shaved off of the quarry rectangle
  //   side whose regions don't include the quarry rectangle endpoints..
  //
  // The cleave_choices is the one we use to create the actual two-cut border points and
  // quarry adit point.
  // For every cleave_choice (deduplicated) realization, we add all the side_cleve_cuts to it
  //   and put it in the schedule.
  //
  let cleave_profile = RPRPCleaveProfile( ctx, g_s, g_e, g_a, g_b );
  let cleave_choices = RPRP_cleave_enumerate( ctx, g_s, g_e, g_a, g_b, cleave_profile );
  let side_cleave_cuts = RPRP_enumerate_quarry_side_region( ctx, g_s, g_e, g_a, g_b );

  // lookup tables for even/odd idirs along with their perpendicular directions.
  //
  let lu_e_idir = [ 0, 3, 1, 2 ];
  let lu_e_tdir = [ 2, 0, 3, 1 ];

  let lu_o_idir = [ 3, 1, 2, 0 ];

  for (let cci=0; cci < cleave_choices.length; cci++) {
    let cc = cleave_choices[cci];

    if (_debug) { console.log("qcc"); }

    let cleave_cuts = [];
    for (let i=0; i<4; i++) {
      let even_cleave_idx = 2*i;
      let odd_cleave_idx = (2*i)+1;

      let e_idir = lu_e_idir[i];
      let e_tdir = lu_e_tdir[i];

      let o_idir = lu_o_idir[i];
      let o_tdir = oppo[e_idir];

      // An even cleave cut implies at least one two-cut with one cut in
      // the even cleave direction and another in the orthogonal direction
      // counterclockwise.
      //
      if (cc[even_cleave_idx] == '*') {
        cleave_cuts.push([
          Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
          Js[ e_tdir ][ Rg[i][1] ][ Rg[i][0] ],
          [ Rg[i][0], Rg[i][1] ]
        ]);

        if (_debug) { console.log("qcc: cci:", cci, "i:", i, "e.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the clockwise neighbor (the 'odd' cleave cut) exists,
        // add another two-cut.
        //
        if (cc[odd_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug) { console.log("qcc: cci:", cci, "i:", i, "e.1a:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

        // Otherwise add a one-cut in-line with the quarry edge and the even cleave line,
        // taking the adit point as one of the 1-cut endpoints.
        //
        else {

          let _a = B[ Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ] ];

          cleave_cuts.push([
            Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ _a[0], _a[1] ]
            //[ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug) { console.log("qcc: cci:", cci, "i:", i, "e.1b:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

      }

      // An odd cleave cut implies at least one two-cut with one constructed
      // line in the direction of the odd cleave cut and the other in orthogonal
      // direction clockwise.
      //
      if (cc[odd_cleave_idx] == '*') {

        cleave_cuts.push([
          Js[ o_tdir ][ Rg[i][1] ][ Rg[i][0] ],
          Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
          [ Rg[i][0], Rg[i][1] ]
        ]);

        if (_debug) { console.log("qcc: cci:", cci, "i:", i, "o.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the previous counterclockwise neighbor (the 'even' cleave cut) exists,
        // add another two cut with both the even and odd constructed lines.
        //
        if (cc[even_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug) { console.log("qcc: cci:", cci, "i:", i, "o.1a:", cleave_cuts[ cleave_cuts.length-1] ); }

        }

        // Otherwise add a one-cut in-line with the Rectangle edge and odd cleave cut,
        // taking the adit poitn as one of the endpoints.
        //
        else {
          let _a = B[ Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ] ];

          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ oppo[o_idir] ][ Rg[i][1] ][ Rg[i][0] ],
            [ _a[0], _a[1] ]
            //[ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug) { console.log("qcc: cci:", cci, "i:", i, "o.1b:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

      }

    }

    // add side cleave cuts
    //
    for (let i=0; i<side_cleave_cuts.length; i++) {
      let cc = [ side_cleave_cuts[i][0], side_cleave_cuts[i][1], ctx.B[side_cleave_cuts[i][0]] ];
      cleave_cuts.push( cc );
    }

    if (cleave_cuts.length == 0) { continue; }

    // sort and deduplicate
    //
    let dedup_cleave_cuts = [];
    cleave_cuts.sort( _cleave_cmp );

    dedup_cleave_cuts.push( cleave_cuts[0] );
    for (let i=1; i<cleave_cuts.length; i++) {
      if (cleave_cuts[i-1][0] != cleave_cuts[i][0]) {
        dedup_cleave_cuts.push( cleave_cuts[i] );
      }
    }

    cleave_sched.push( dedup_cleave_cuts );

  }

  return cleave_sched;
};


//------
//------
//------

// We want to enumerate boundary pairs that define a tab guillotine cut that
// are made from the sides of the quarry rectangle.
// That is, we want to return all boundary regions that starts and end on one side
// of a quarry rectangle.
//
// The cleave cuts will be handled elsewhere.
//
// We walk each side of the quarry rectangle, using the `Js` structure in one
// direction to find the next general boundary point and then using it in the other direction
// to find the origin general boundary point.
//
// Return a list of general boundary index points enumerating the tab guillotine cuts
// implied by the quarry rectangle.
//
function RPRP_enumerate_quarry_side_region(ctx, g_s, g_e, g_a, g_b, _debug) {

  _debug = ((typeof _debug === "undefined") ? false : _debug);

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js;

  let guillotine_list = [];

  // grid rectangle corners (cw)
  //
  //  2-->--3
  //  |     |
  //  ^     v
  //  |     |
  //  1--<--0
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let s_idx = Bij[ g_s[1] ][ g_s[0] ];
  let e_idx = Bij[ g_e[1] ][ g_e[0] ];

  let oppo = [1,0, 3,2];
  let billet_idir = [ 1, 2, 0, 3 ];
  let ltgt_f = [ -1, 1, 1, -1 ];

  // We start from Rg_0 (lower right) and go clockwise around.
  //
  // From the start point Rg_i, we take the current base point, g_cur,
  // as the first non interior grid point from Rg_i, where Rg_i
  // could itself be the first non-interior point.
  // We then advance to the next border point and then look backwards.
  // This gives us a candidate 1-cut.
  // If the candidate 1-cut is within the bounds of the quarry rectangle
  // side *and* it's advanced past our current base point, we add it
  // to the guillotine list.
  //
  // If we're still within bounds, advance the current base point, g_cur,
  // to the next border corner (by using the border jump structure, Js)
  // and continue.
  //
  // The quarry rectangle is always ordered in clockwise order so
  // the order should be correct.
  // Additional checks need to be done to make sure the 1-cuts
  // are within the fenced region.
  //

  for (let r_idx=0; r_idx < Rg.length; r_idx++) {

    let r_nxt = (r_idx + 1) % Rg.length;
    let idir = billet_idir[r_idx];
    let rdir = oppo[idir];

    // See if our current base point is on the border already and,
    // if it is, take it.
    // If not, we're on an interior point so advance to the first
    // border point in the appropriate direction.
    //
    let b_idx_cur = Bij[ Rg[r_idx][1] ][ Rg[r_idx][0] ];
    if (b_idx_cur < 0) {
      b_idx_cur = Js[idir][ Rg[r_idx][1] ][ Rg[r_idx][0] ];
    }

    let g_cur = [ B[ b_idx_cur ][0], B[ b_idx_cur ][1] ];

    // xy is the axis dimension we're iterating towards.
    // _c is the factor so that we can do the less than or greater
    // than tests below.
    //

    let xy = r_idx % 2;
    let _c = ltgt_f[r_idx];

    if (_debug) {
      console.log("\nqsr: Rg:", Rg, "r_idx:", r_idx);
      console.log("b_idx_cur:", b_idx_cur, "g_cur:", g_cur, "xy:", xy, "_c:", _c, "idir:", idir, "rdir:", rdir);
    }

    while ((b_idx_cur >= 0) &&
           ( (_c*(g_cur[ xy ] - Rg[r_nxt][ xy ])) < 0)) {

      // shoot ahead to next border point
      //
      let b_idx_nxt = Js[idir][ g_cur[1] ][ g_cur[0] ];
      if (b_idx_nxt < 0) { break; }
      let g_nxt = [ B[ b_idx_nxt ][0], B[ b_idx_nxt ][1] ];

      // then look back to see border point behind us
      //
      let b_idx_prv = Js[rdir][ g_nxt[1] ][ g_nxt[0] ];
      let g_prv = [ B[ b_idx_prv ][0], B[ b_idx_prv ][1] ];

      if (_debug) {
        console.log("  b_idx_[prv|cur|nxt]:", b_idx_prv, b_idx_cur, b_idx_nxt, ", g_[prv|cur|nxt]:", g_prv, g_cur, g_nxt);
      }

      // make sure 1-cut is within bounds of quarry rectangle side and
      // has made progress past the current g_cur pointer.
      //
      if ( ((_c*(g_prv[xy] - Rg[r_idx][xy])) >= 0) &&
           ((_c*(g_nxt[xy] - Rg[r_nxt][xy])) <= 0) &&
           ((_c*(g_prv[xy] - g_cur[xy])) >= 0) ) {

        let se = [
          Math.min(s_idx, e_idx),
          Math.max(s_idx, e_idx)
        ];

        let np = [
          Math.min(b_idx_prv, b_idx_nxt),
          Math.max(b_idx_prv, b_idx_nxt)
        ];

        // We don't take sides that are borders and
        // we dont' want to go where we came from
        //
        let _d = abs_sum_v( v_sub(B[b_idx_prv], B[b_idx_nxt]) );

        if (_debug) {
          console.log("    _d:", _d, "|d idx|:", Math.abs(b_idx_nxt - b_idx_prv),
            "se:", se, "np:", np, "wrc:",
            wrapped_range_contain( b_idx_nxt, e_idx, s_idx ),
            wrapped_range_contain( b_idx_prv, e_idx, s_idx ));

        }

        if ((_d != Math.abs(b_idx_nxt - b_idx_prv)) &&
            ( ((se[0] != np[0]) || (se[1] != np[1])) ) &&
            wrapped_range_contain( b_idx_nxt, s_idx, e_idx ) &&
            wrapped_range_contain( b_idx_prv, s_idx, e_idx ) ) {
          guillotine_list.push( [b_idx_nxt, b_idx_prv] );

          if (_debug) {
            console.log("  +++:", b_idx_nxt, b_idx_prv, "(se:", s_idx, e_idx,
              "contain(i,e,s):",
              wrapped_range_contain( b_idx_nxt, e_idx, s_idx ),
              wrapped_range_contain( b_idx_prv, e_idx, s_idx ));
          }

        }

      }

      // advance and repeat
      //
      g_cur = g_nxt;
      b_idx_cur = b_idx_nxt;

    }

  }

  return guillotine_list;
}


// lightly tested
//
// ctx - RPRP context
// ij  - point being tested
// g_s - grid general border start point (counterclockwise)
// g_e - grid general border end point
// g_a - intersection of constructed lines if 2-cut, g_s or g_e if 1-cut
//
// If the grid point ij has one or non border jump points within
//   the border start and end region, it must be outside.
//
// If the grid point ij has three or four border jump points within
//   the border start and end regoin, it must be inside.
//
// If the grid point ij has exactly two shared border jump points,
//   it can be inside or outside but the rays eminating from the origin ij
//   point must cross the constructed edge cuts.
//   They further must not be inline
//
function RPRP_point_in_region(ctx, ij, g_s, g_e, g_a, _debug) {
  let Bij = ctx.Bij;
  let Js = ctx.Js;

  // degenerate
  //
  if ( ((ij[0] == g_a[0]) && (ij[1] == g_a[1])) ||
       ((ij[0] == g_s[0]) && (ij[1] == g_s[1])) ||
       ((ij[0] == g_e[0]) && (ij[1] == g_e[1])) ) {
    return 1;
  }

  // ij OOB
  //
  if ((Js[0][ ij[1] ][ ij[0] ] < 0) &&
      (Js[1][ ij[1] ][ ij[0] ] < 0) &&
      (Js[2][ ij[1] ][ ij[0] ] < 0) &&
      (Js[3][ ij[1] ][ ij[0] ] < 0)) {

    if (_debug) { console.log("#pir.0"); }

    return 0;
  }

  if (typeof g_s === "undefined") {
 
    if (_debug) { console.log("#pir.1 t"); }

    return 1;
  }

  // sanity
  //
  let idx_s = Bij[ g_s[1] ][ g_s[0] ],
      idx_e = Bij[ g_e[1] ][ g_e[0] ];
  if ((idx_s < 0) || (idx_e < 0)) {

    if (_debug) { console.log("#pir.2 error"); }

    return -1;
  }

  //---

  // If ij is already on border, we can do a wrapped range test
  //
  let ij_b_idx = Bij[ ij[1] ][ ij[0] ];
  if (ij_b_idx >= 0) {

    if (_debug) { console.log("#pir.3 boundary"); }

    return wrapped_range_contain( ij_b_idx, idx_s, idx_e );
  }

  let b_count = 0;
  for (let idir=0; idir<4; idir++)  {
    b_count += wrapped_range_contain( Js[idir][ ij[1] ][ ij[0] ], idx_s, idx_e );
  }

  if (b_count < 2) {

    if (_debug) { console.log("#pir.4 b_count", b_count); }

    return 0;
  }
  if (b_count > 2) {

    if (_debug) { console.log("#pir.5 b_count", b_count); }

    return 1;
  }

  let ij3 = [ ij[0], ij[1], 0 ];
  let a3 = [ g_a[0], g_a[1], 0 ];
  let s3 = [ g_s[0], g_s[1], 0 ];
  let e3 = [ g_e[0], g_e[1], 0 ];

  // ij to the right of (g_s -> g_a) and (g_a -> g_e)
  // then inside (return 1)
  // else outside (return 0)
  //
  let zsa = cross3( v_sub( a3, s3 ), v_sub( ij3, s3 ) );
  let zae = cross3( v_sub( e3, a3 ), v_sub( ij3, a3 ) );

  if (_debug) {
    console.log("#pir.6 zsa", zsa, "zae", zae);
  }

  if ((zsa[2] < 0) && (zae[2] < 0)) { return 1; }
  return 0;
}

// lightly tested
//
// Input
//   g_a and g_b are grid endpoints of the rectangle R_g (in any order)
//
// Return:
//
//   1 - if rectangle is wholly contained in the rectilinear polygon
//   0 - otherwise
//
// If the area is 0, we can immediately return 0.
//
// Consider two endpoints from a rectangle side, R_g[p] and R_g[q].
//
// R_g is ordered clockwise with the first point in the lower right:
//
//   2---3
//   |   |
//   1---0
//
// For a cardinal direction, if R_g[p] and R_g[q] agree on the last
// general border index point, then they must have an unbroken line
// segment between them that lies completely within the original polygon.
//
// For example, if R_g[0] shoots right and hits the last general border endpoint b,
// and R_g[1] shoots right to hit the same last general border endpoint b, then
// there must be a an unbroken line between them.
// If R_g[1] had a different endpoint, the rectilinear polygon must have had
// a portion of it's boundary jutting through the area between them.
//
// We do this for all neighboring pairs of R_g in each of the appropriate directions.
//
// Note that this must be the last endpoint, so using the Je structure and not the Js,
// beacuse using the first general border endpoint would give corners for borders
// that are colinear with the R_g side.
//
// If the R_g point is the last general border endpoint in the appropriate
// direction, we lookup the endpoint from the Bij structure instead of the Je.
// If the point is the last point on the boundary, the Js and Je structures
// take the ray starting from the point in the cardinal direction which, in
// this case, goes out of bounds.
//
// If all endpoints match up and the area is non-zero, we have a valid rectangle.
// 
//
function RPRP_valid_R(ctx, g_a, g_b) {
  let Je = ctx.Je;
  let Bij = ctx.Bij;

  // 2---3
  // |   |
  // 1---0
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let pq_idir = [
    [ 0, 1, 0 ], [ 0, 1, 1 ],
    [ 1, 2, 2 ], [ 1, 2, 3 ],
    [ 2, 3, 0 ], [ 2, 3, 1 ],
    [ 3, 0, 2 ], [ 3, 0, 3 ]
  ];

  let area = abs_sum_v( v_sub(Rg[0], Rg[1]) ) * abs_sum_v( v_sub(Rg[1], Rg[2]) );

  //console.log("## valid_R area =", area, "g_a:", g_a, "g_b:", g_b);

  if (area == 0) { return 0; }

  for (let idx=0; idx<pq_idir.length; idx++) {
    let p = pq_idir[idx][0];
    let q = pq_idir[idx][1];
    let idir = pq_idir[idx][2];

    // If the ray endpoint is out of bounds, we could be on the
    // border.
    // If we aren't on a border, we know it's not a valid rectangle
    // (we're in a dead-zone).
    // Otherwise, compare the endpoints to make sure they match up.
    //
    let p_b_idx = Je[idir][ Rg[p][1] ][ Rg[p][0] ];
    if (p_b_idx < 0) { p_b_idx = Bij[ Rg[p][1] ][ Rg[p][0] ]; }

    let q_b_idx = Je[idir][ Rg[q][1] ][ Rg[q][0] ];
    if (q_b_idx < 0) { q_b_idx = Bij[ Rg[q][1] ][ Rg[q][0] ]; }

    if ((p_b_idx < 0) || (q_b_idx < 0)) { return 0; }
    if (p_b_idx != q_b_idx) { return 0; }
  }

  return 1;
}


// WIP!!!
// still has bug...

// Test for valid quarry rectangle.
//
// The rectangle is defined by g_a and g_b, must be wholly contained
// in the region defined by the 1-cut or 2-cut defined by
// g_s, g_e, g_a.
//
//
// Input:
//
//   g_s - start region point on general border point (counterclockwise order)
//   g_e - end region point on general border point
//   g_a - adit point of cut and quarry rectangle
//   g_b - bower point of quarry rectangle
//
// Output:
//
//   1 - valid quarry rectangle
//   0 - otherwise
//
// Test for valid rectangle in addition to making sure all endoints of quarry
// rectangle fall within the region.
//
function RPRP_valid_quarry(ctx, g_s, g_e, g_a, g_b) {

  if (RPRP_valid_R(ctx, g_a, g_b) == 0) {

    //console.log("### vq.0:", g_s, g_e, g_a, g_b, " valid_R==0!");

    return 0;
  }

  // 2---3
  // |   |
  // 1---0
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  for (let i=0; i<Rg.length; i++) {
    if (RPRP_point_in_region(ctx, Rg[i], g_s, g_e, g_a) == 0) {

      //console.log("### vq.1:", g_s, g_e, g_a, g_b, "Rg[", i, "]:", Rg[i], " pir==0!");

      return 0;
    }
  }

  let cleave_profile = RPRPCleaveProfile(ctx, g_s, g_e, g_a, g_b);
  
  if ((cleave_profile[0] == 'b') && (cleave_profile[7] == 'b')) { return 0; }
  if ((cleave_profile[1] == 'b') && (cleave_profile[2] == 'b')) { return 0; }
  if ((cleave_profile[3] == 'b') && (cleave_profile[4] == 'b')) { return 0; }
  if ((cleave_profile[5] == 'b') && (cleave_profile[6] == 'b')) { return 0; }

  return 1;
}

// untested
//
//
// The dynamic programming array is of size |B| x |B| x 2.
// Here it's giving back a single index, so it's considering
// a flattened array, but it can be thought of as the
// first dimension of the start general border point, g_s,
// the end general border point, g_e, and what corner the
// adit point, g_a, is on.
//
// If a 1-cut, the adit index is 0 if on g_s or 1 if on g_e.
// For a 2-cut, g_s and g_e are not inline, so the adit
// index is taken to be 0 if to the right of the (g_s,g_e) line
// and 1 otherwise.
//
function RPRP_DP_idx(ctx, g_s, g_e, g_a) {
  let B = ctx.B;
  let Bij = ctx.Bij;

  let n = B.length;

  let idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let idx_e = Bij[ g_e[1] ][ g_e[0] ];

  let mM = [
    [ Math.min(g_s[0], g_e[0]),
      Math.max(g_s[0], g_e[0]) ],
    [ Math.min(g_s[1], g_e[1]),
      Math.max(g_s[1], g_e[1]) ]
  ];

  //....

  let t = -1;
  if      ((g_a[0] == g_s[0]) && (g_a[1] == g_s[1])) { t=0; }
  else if ((g_a[0] == g_e[0]) && (g_a[1] == g_e[1])) { t=1; }
  else {

    let s3 = [g_s[0], g_s[1], 0];
    let e3 = [g_e[0], g_e[1], 0];
    let a3 = [g_a[0], g_a[1], 0];

    let v = cross3( v_sub(a3,s3), v_sub(e3,s3) );

    if (v[2] > 0) { t = 0; }
    else          { t = 1; }

  }

  if (t<0) { return -1; }

  let dp_idx = (2*idx_s) + (2*n*idx_e) + t;

  return dp_idx;
}

function _Ink(g_a, g_b) {
  let dx = (g_b[0] - g_a[0]);
  let dy = (g_b[1] - g_a[1]);

  return Math.abs(2*(dx+dy))
}

function _ws(n, s, pfx) {
  n = ((typeof n === "undefined") ? 0 : n);
  s = ((typeof s === "undefined") ? ' ' : s);
  pfx = ((typeof pfx === "undefined") ? "" : pfx);
  let a = [];
  for (let i=0; i<n; i++) { a.push(s); }
  return pfx + a.join("");
}

//WIP!!
function RPRP_MIRP(ctx, g_s, g_e, g_a, lvl, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  lvl = ((typeof lvl === "undefined") ? 0 : lvl);

  //DEBUG
  //DEBUG
  _debug = 1;
  //DEBUG
  //DEBUG

  let B = ctx.B,
      Bt = ctx.Bt,
      Bij = ctx.Bij,
      Bxy = ctx.Bxy,
      G = ctx.G,
      Gt = ctx.Gt,
      Gij = ctx.Gij,
      Gxy = ctx.Gxy,
      X = ctx.X,
      Y = ctx.Y,
      Js = ctx.Js;

  if (typeof g_s === "undefined") {
    g_s = B[0];
    g_e = B[0];
    g_a = B[0];
  }

  let b_s = Bij[ g_s[1] ][ g_s[0] ];
  let b_e = Bij[ g_e[1] ][ g_e[0] ];

  if (_debug) {
    console.log("\n" + _ws(2*lvl), "mirp." + lvl.toString() + ".beg:",
      "g_s:", JSON.stringify(g_s), "(" + b_s.toString() + ")",
      "g_e:", JSON.stringify(g_e), "(" + b_e.toString() + ")",
      "g_a:", g_a);
  }

  let dp_idx = RPRP_DP_idx(ctx, g_s, g_e, g_a);
  if ( ctx.DP_cost[dp_idx] >= 0 ) { return ctx.DP_cost[dp_idx]; }

  let _min_cost = -1,
      _min_partition = [],
      _min_bower = [-1,-1],
      _min_rect = [];

  for (let j=0; j<Y.length; j++) {
    for (let i=0; i<X.length; i++) {
      let g_b = [i,j];
      if (!RPRP_valid_quarry(ctx, g_s, g_e, g_a, g_b)) { continue; }

      if (_debug) {
        console.log( _ws(2*lvl), "mirp." + lvl.toString() + ".qry:", "g_s:", g_s, "g_e:", g_e, "g_a:", g_a, "g_b:", g_b);
        //console.log( _ws(2*lvl), "mirp." + lvl.toString() + ":", "g_a:", g_a, "g_b:", g_b);
      }

      let rect_cost = _Ink(g_a, g_b);

      let cut_sched = RPRPQuarryCleaveCuts(ctx, g_s, g_e, g_a, g_b);

      if (_debug) {
        console.log(_ws(2*lvl), "mirp." + lvl.toString() + ":", "cut_sched:", JSON.stringify(cut_sched));
      }

      if (cut_sched.length == 0) {
        if (_min_cost < 0) { _min_cost = rect_cost; }
        continue;
      }

      for (let sched_idx=0; sched_idx < cut_sched.length; sched_idx++) {
        let cuts = cut_sched[sched_idx];

        if (_debug) {
          let _str_sched = [];
          for (let _i=0; _i<cuts.length; _i++) {
            _str_sched.push( "s:" +
              "[" + B[cuts[_i][0]][0].toString() + "," + B[cuts[_i][0]][1].toString() + "]" +
              "(" + cuts[_i][0].toString() +")" +
              " e:" +
              "[" + B[cuts[_i][1]][0].toString() + "," + B[cuts[_i][1]][1].toString() + "]" +
              "(" + cuts[_i][1].toString() +")" + 
              " a:[" + cuts[_i][2][0].toString() + "," + cuts[_i][2][1].toString() + "]"
            );
          }
          console.log(_ws(2*lvl), "mirp." + lvl.toString() + ":", "cut_sched[", sched_idx, "]:{", _str_sched.join(" , ") + "}");
        }

        let _cur_cost = rect_cost;
        for (let cut_idx=0; cut_idx < cuts.length; cut_idx++) {

          let _c = RPRP_MIRP(ctx, B[cuts[cut_idx][0]], B[cuts[cut_idx][1]], cuts[cut_idx][2], lvl+1);
          if (_c < 0) { _cur_cost = -1; break; }

          _cur_cost += _c;
        }

        if ((_min_cost < 0) ||
            (_cur_cost < _min_cost)) {
          _min_cost = _cur_cost;

          _min_partition = cut_sched[sched_idx];
          _min_bower = [ g_b[0], g_b[1] ];
          _min_rect = [ [g_a[0], g_a[1]], [g_b[0], g_b[1]] ];
        }

      }
    }
  }

  if (_min_cost >= 0) {
    ctx.DP_cost[dp_idx]       = _min_cost;
    ctx.DP_rect[dp_idx]       = _min_rect;
    ctx.DP_bower[dp_idx]      = _min_bower;
    ctx.DP_partition[dp_idx]  = _min_partition;


    console.log("DPCOST!", _min_cost, _min_rect, _min_bower, _min_partition);

  }

  console.log( _ws(2*lvl), "mirp." + lvl.toString(), "<<<");

  return _min_cost;

  /*
  console.log(g_s, g_e, g_a);
  console.log(" 0:", B[0], RPRP_DP_idx(ctx, B[0], B[0], B[0]));


  //for (let j=0; j<Y.length; j++) {
  for (let j=(Y.length-1); j>=0; j--) {

    let row_s = [];

    for (let i=0; i<X.length; i++) {

      let g_b = [i,j];

      //row_s.push( RPRP_valid_R(ctx, g_a, g_b) ? '*' : '.' );
      row_s.push( RPRP_valid_quarry(ctx, g_s, g_e, g_a, g_b) ? '*' : '.' );


    }
    console.log( row_s.join("") );
  }

  console.log( B.length, B.length*B.length*2, RPRP_DP_idx(ctx, g_s, g_e, g_a) );
  */

}



//------
//------
//------
//------
//------
//------
//------


function _main_example() {
  //let grid_info = RPRPInit(pgn_pinwheel1);
  let grid_info = RPRPInit(pgn_bottom_guillotine);
  _print_rprp(grid_info);
}

function _main_checks() {

  let grid_info_0 = RPRPInit(pgn_pinwheel1);
  let cp_0 = RPRPCleaveProfile(grid_info_0, [3,1], [1,2], [3,2], [2,4]);
  let cc_0 = RPRP_cleave_enumerate(grid_info_0,  [3,1], [1,2], [3,2], [2,4], cp_0);
  let v_0 = _expect( cc_0, [], _sfmt("pgn_pinwheel_0", 16, 'r') );

  let grid_info_1 = RPRPInit(pgn_pinwheel1);
  let cp_1 = RPRPCleaveProfile(grid_info_1, [3,1], [1,2], [3,2], [2,3]);
  let cc_1 = RPRP_cleave_enumerate(grid_info_1,  [3,1], [1,2], [3,2], [2,3], cp_1);
  let v_1 = _expect( cc_1,
    [ ['-','c','X','c','-','*','-','*'] ],
    _sfmt("pgn_pinwheel_1", 16, 'r') );


  let grid_info_2 = RPRPInit(pgn_balance);
  let cp_2 = RPRPCleaveProfile(grid_info_2, [7,1], [5,4], [7,4], [2,5]);
  let cc_2 = RPRP_cleave_enumerate(grid_info_2, [7,1], [5,4], [7,4], [2,5], cp_2);
  let v_2 = _expect( cc_2, 
    [ ["-","c","*","-","*","-","*","-"],
      ["-","c","*","-","*","-","-","*"]],
    _sfmt("pgn_balance_2", 16,'r') );

  let grid_info_3 = RPRPInit(pgn_clover);
  let cp_3 = RPRPCleaveProfile(grid_info_3, [5,7], [6,5], [6,7], [3,3]);
  let cc_3 = RPRP_cleave_enumerate(grid_info_3, [5,7], [6,5], [6,7], [3,3], cp_3);
  let v_3 = _expect( cc_3,
    [ ['x','b','b','-','b','x','X','X'] ],
    _sfmt("pgn_clover_3", 16, 'r') );

  /*
  let grid_info_3a = RPRPInit(pgn_clover3);
  let cp_3a = RPRPCleaveProfile(grid_info_3a, [5,7], [6,5], [6,7], [3,3]);
  let cc_3a = RPRP_cleave_enumerate(grid_info_3a, [5,7], [6,5], [6,7], [3,3], cp_3a);
  let v_3a = _expect( cc_3a,
    [ ['x','b','b','-','b','x','X','X'] ],
    _sfmt("pgn_clover_3a", 16, 'r') );
  */

  let grid_info_4 = RPRPInit(pgn_clover);
  let cp_4 = RPRPCleaveProfile(grid_info_4, [3,3], [3,4], [3,3], [6,7]);
  let cc_4 = RPRP_cleave_enumerate(grid_info_4, [3,3], [3,4], [3,3], [6,7], cp_4);
  let v_4 = _expect( cc_4,
    [ ['x','b','X','X','b','x','*','-'],
      ['x','b','X','X','b','x','-','*'] ],
    _sfmt("pgn_clover_4", 16, 'r') );

  let grid_info_5 = RPRPInit(pgn_clover1);
  let cp_5 = RPRPCleaveProfile(grid_info_5, [2,3], [2,4], [2,3], [5,7]);
  let cc_5 = RPRP_cleave_enumerate(grid_info_5, [2,3], [2,4], [2,3], [5,7], cp_5);
  let v_5 = _expect( cc_5,
    [ ['x','b','X','X','-','b','*','-'],
      ['x','b','X','X','-','b','-','*'] ],
    _sfmt("pgn_clover_5", 16, 'r') );

  let grid_info_6 = RPRPInit(pgn_clover2);
  let cp_6 = RPRPCleaveProfile(grid_info_6, [4,2], [2,4], [2,2], [7,7]);
  let cc_6 = RPRP_cleave_enumerate(grid_info_6, [4,2], [2,4], [2,2], [7,7], cp_6);
  let v_6 = _expect( cc_6,
    [ ['*','-','X','X','*','-','*','-'],
      ['-','*','X','X','*','-','*','-'],
      ['*','-','X','X','-','*','*','-'],
      ['-','*','X','X','-','*','*','-'],
      ['*','-','X','X','*','-','-','*'],
      ['-','*','X','X','*','-','-','*'],
      ['*','-','X','X','-','*','-','*'],
      ['-','*','X','X','-','*','-','*'] ],
    _sfmt("pgn_clover_6", 16, 'r') );

  let grid_info_7 = RPRPInit(pgn_double_edge_cut);
  let cp_7 = RPRPCleaveProfile(grid_info_7, [6,2], [5,1], [6,1], [3,5]);
  let cc_7 = RPRP_cleave_enumerate(grid_info_7, [6,2], [5,1], [6,1], [3,5], cp_7);
  let v_7 = _expect( cc_7,
    [ ['X','X','x','x','*','-','x','x'],
      ['X','X','x','x','-','*','x','x'],
      ['X','X','x','x','*','*','x','x'] ],
    _sfmt("pgn_clover_7", 16, 'r') );


  let grid_info_8 = RPRPInit(pgn_quarry_corner_convex);
  let cp_8 = RPRPCleaveProfile(grid_info_8, [4,2], [3,1], [4,1], [1,4]);
  let cc_8 = RPRP_cleave_enumerate(grid_info_8, [4,2], [3,1], [4,1], [1,4], cp_8);
  let v_8 = _expect( cc_8, [], _sfmt("pgn_corner_8", 16, 'r') );

  let grid_info_9 = RPRPInit(pgn_left_run);
  let cp_9 = RPRPCleaveProfile(grid_info_9, [6,1], [4,1], [6,1], [3,7]);
  let cc_9 = RPRP_cleave_enumerate(grid_info_9, [6,1], [4,1], [6,1], [3,7], cp_9);
  let v_9 = _expect( cc_9, [], _sfmt("pgn_corner_9", 16, 'r') );

  //----
  // guillotine tests
  //
  let grid_info_10 = RPRPInit(pgn_bottom_guillotine);

  let g_s = [-1,-1], g_e = [-1,-1], g_a = [-1,-1], g_b = [-1, -1];

  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [5,5];

  //let cp_10 = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_10 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_10 = _expect( cut_10,
     //[[7,10],[53,6],[46,52],[11,46]],
     [[7,10],[46,52],[11,46]],
    _sfmt("pgn_guillotine_10", 16, 'r') );

  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [4,5];

  //let cp_11 = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_11 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_11 = _expect( cut_11,
    //[[7,10],[53,6]],
    [[7,10]],
    _sfmt("pgn_guillotine_11", 16, 'r') );


  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [13,5];

  //let cp_12  = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_12 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_12 = _expect( cut_12,
    //[[27,31],[18,26],[12,17],[7,10],[53,6],[46,52]],
    [[27,31],[18,26],[12,17],[7,10],[46,52]],
    _sfmt("pgn_guillotine_12", 16, 'r') );


  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [12,5];

  //let cp_13 = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_13 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_13 = _expect( cut_13,
    //[[18,26],[12,17],[7,10],[53,6],[46,52]],
    [[18,26],[12,17],[7,10],[46,52]],
    _sfmt("pgn_guillotine_13", 16, 'r') );

  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [9,5];

  //let cp_14 = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_14 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_14 = _expect( cut_14,
    //[[12,17],[7,10],[53,6],[46,52]],
    [[12,17],[7,10],[46,52]],
    _sfmt("pgn_guillotine_14", 16, 'r') );

  /*
  let grid_info_15 = RPRPInit(pgn_clover3);
  let cp_15 = RPRPCleaveProfile(grid_info_15, [5,7], [6,5], [6,7], [3,3]);
  let cc_15 = RPRP_cleave_enumerate(grid_info_15, [5,7], [6,5], [6,7], [3,3], cp_15);
  let v_15 = _expect( cc_15,
    [ ],
    _sfmt("pgn_clover_15", 16, 'r') );
    */

}

function _expect( q, v, _verbose ) {
  _verbose = ((typeof _verbose === "undefined") ? "" : _verbose);
  if (JSON.stringify(q) != JSON.stringify(v)) {
    if (_verbose.length) { console.log(_verbose + ":", "EXPECT FAILED: got:", JSON.stringify(q), ", expected:", JSON.stringify(v)); }
    return false;
  }
  if (_verbose) { console.log(_verbose + ":", "expect pass"); }
  return true;
}

function _main_rprpinit_test() {
  //RPRPInit( pgn_pinwheel1 );
  //RPRPInit( pgn_spiral1, 1 );
  RPRPInit( pgn_balance, 1 );
}

function _main_pir_test() {
  let ctx = RPRPInit( pgn_pinwheel1 );

  let g_s = ctx.G[0],
      g_e = ctx.G[0],
      g_a = ctx.G[0];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }

  console.log("\n");

  g_s = [2,4];
  g_e = [4,3];
  g_a = [2,3];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

  g_s = [1,2];
  g_e = [4,3];
  g_a = [1,3];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

  g_s = [4,3];
  g_e = [1,2];
  g_a = [1,3];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

  g_s = [1,1];
  g_e = [3,1];
  g_a = [3,1];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

  g_s = [3,1];
  g_e = [1,1];
  g_a = [1,1];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

}

function _main_custom() {

  let g_s = [1,4],
      g_e = [2,5],
      g_a = [1,5],
      g_b = [4,3];

  let grid_info_x = RPRPInit(pgn_custom1);

  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, 1);

  console.log(cp_x.join(""));
  for (let i=0; i<cc_x.length; i++) {
    console.log(cc_x[i].join(""));
  }

  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, 1);

  console.log(cc_x);
  console.log(cs_x);


  //let v_x = _expect( cc_x, [], _sfmt("pgn_corner_x", 16, 'r') );


}

function _main_custom_1() {

  let g_s = [1,4],
      g_e = [2,5],
      g_a = [1,5],
      g_b = [10,3];

  let grid_info_x = RPRPInit(pgn_dragon);

  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, 1);

  console.log(cp_x.join(""));
  for (let i=0; i<cc_x.length; i++) {
    console.log(cc_x[i].join(""));
  }

  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, 1);

  console.log(cc_x);
  console.log(cs_x);


  //let v_x = _expect( cc_x, [], _sfmt("pgn_corner_x", 16, 'r') );


}

function _main_custom_2() {
  let _debug = 0;

  let g_s = [2,5],
      g_e = [3,6],
      g_a = [2,6],
      g_b = [6,3];

  let grid_info_x = RPRPInit(pgn_horseshoe);

  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);

  //console.log(cp_x.join(""));
  //for (let i=0; i<cc_x.length; i++) { console.log(cc_x[i].join("")); }

  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  //console.log(cc_x);
  //console.log(cs_x);

  let cic = RPRPQuarryCleaveCuts(grid_info_x, g_s, g_e, g_a, g_b);

  for (let i=0; i<cic.length; i++) {
    console.log( "cleave_sched[", i, "]:", _print_cleave(cc_x[i]), JSON.stringify(cic[i]));
  }


  //let v_x = _expect( cc_x, [], _sfmt("pgn_corner_x", 16, 'r') );


}

function _main_custom_3() {
  let _debug = 1;

  let g_s = [0,2],
      g_e = [0,2],
      g_a = [0,2],
      g_b = [1,3];

  let grid_info_x = RPRPInit(pgn_pinwheel1);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);

}

// BUG
// degenerate error where thinks there's a 1-cut that falls out of bounds (1,0) (3,0) line
//
// fixed?
//
function _main_custom_4() {
  let _debug = 1;

  let g_s = [1,1],
      g_e = [3,1],
      g_a = [1,1],
      g_b = [3,0];

  let grid_info_x = RPRPInit(pgn_pinwheel1);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);
  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  console.log("profile:", cp_x);
  console.log("cleave_enum:", cc_x);
  console.log("cleave_side:", cs_x);

}

//
//
function _main_custom_5() {
  let _debug = 1;

  let g_s = [3,0],
      g_e = [3,0],
      g_a = [3,0],
      g_b = [1,1];

  let grid_info_x = RPRPInit(pgn_pinwheel1);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);
  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  console.log("profile:", cp_x);
  console.log("cleave_enum:", cc_x);
  console.log("cleave_side:", cs_x);

}

//
//
function _main_custom_6() {
  let _debug = 1;

  let g_s = [1,2],
      g_e = [4,3],
      g_a = [1,3],
      g_b = [4,1];

  let grid_info_x = RPRPInit(pgn_pinwheel1);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);
  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  console.log("profile:", cp_x);
  console.log("cleave_enum:", cc_x);
  console.log("cleave_side:", cs_x);

}

function _main_mirp_test() {
  let ctx = RPRPInit( pgn_pinwheel1 );
  let v = RPRP_MIRP(ctx);

  console.log("mirp:", v);
  return;

  let ctx_1 = RPRPInit( pgn_pinwheel1 );
  RPRP_MIRP(ctx_1, [3,1], [1,2], [3,2]);

  let ctx_2 = RPRPInit( pgn_cavity );
  RPRP_MIRP(ctx_2, [8,1], [7,2], [7,1]);

  let ctx_3 = RPRPInit( pgn_cavity );
  RPRP_MIRP(ctx_3, [7,2], [8,1], [7,1]);

  let ctx_4 = RPRPInit( pgn_bottom_guillotine );
  RPRP_MIRP(ctx_4, [1,4], [2,4], [1,4]);

  let ctx_5 = RPRPInit( pgn_bottom_guillotine );
  RPRP_MIRP(ctx_5, [2,4], [1,4], [1,4]);

  let ctx_6 = RPRPInit( pgn_bottom_guillotine );
  RPRP_MIRP(ctx_6, [2,4], [1,4], [2,4]);

  //console.log(">>> 9,2", RPRP_point_in_region( ctx_2, [9,2], [8,1], [7,2], [7,1]  ));
  //console.log(">>> 7,1", RPRP_point_in_region( ctx_2, [7,1], [8,1], [7,2], [7,1] ,  1) );
  //console.log(">>> 6,0", RPRP_point_in_region( ctx_2, [6,0], [8,1], [7,2], [7,1]  ));
}

//       ___ 
//  ____/ (_)
// / __/ / / 
// \__/_/_/  
//           

if ((typeof require !== "undefined") &&
    (require.main === module)) {

  let op = "check";

  if (process.argv.length > 2) {
    op = process.argv[2];
  }

  if      (op == 'check')   { _main_checks(process.argv.slice(2)); }
  else if (op == 'example') { _main_example(process.argv.slice(2)); }
  else if (op == 'rprpi')   { _main_rprpinit_test(); }
  else if (op == 'pir')     { _main_pir_test(); }
  else if (op == 'mirp')    { _main_mirp_test(); }
  else if (op == 'custom')  { _main_custom(); }
  else if (op == 'custom.1')  { _main_custom_1(); }
  else if (op == 'custom.2')  { _main_custom_2(); }
  else if (op == 'custom.3')  { _main_custom_3(); }
  else if (op == 'custom.4')  { _main_custom_4(); }
  else if (op == 'custom.5')  { _main_custom_5(); }
  else if (op == 'custom.6')  { _main_custom_6(); }
}

//                          __    
//  _____ __ ___  ___  ____/ /____
// / -_) \ // _ \/ _ \/ __/ __(_-<
// \__/_\_\/ .__/\___/_/  \__/___/
//        /_/                     

if (typeof module !== "undefined") {
  let func_name_map = {
    "winding" : winding,
    "windingA" : windingA,
    "init" : RPRPInit
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }
}


