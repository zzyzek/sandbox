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
//   G : <array of grid points>
//   Gt : <array of grid point types>
//     'c' : original boundary point
//     'b' : point on edge, on boundary but not in C
//     'i' : interior point
//   X : <array of x coordinates of grid points (domain)>
//   Y : <array of y coordinates of grid points (domain)>
//     note that some combinats of points from X,Y will not be a grid point
//   dualG: <2D array structures of simple rectangles, including inadmissible rectangles>
//     {
//       ij : x,y index of point
//       G_idx: index of point in G array
//       id : rectangle identifier
//         >= 0 and unique of rectangle is admissible
//         -1 if rectangle is inadmissible
//       R : four x,y points that define the rectangle if rectangle is admissible
//     }
// }
//
// Some auxiliary structures:
//
// {
//   G_idx_bp : <map of xy actual point to grid index>
//   Gv : <2d array of xy indices to structure>
//    {
//      G_idx : <grid index>
//      xy    : <xy actual point>
//      t     : <type of grid point>
//    }
//   Gv_bp : <map xy actual point to xy index point in Gv>
//   G_dualG_map : <map of xy actual grid point to xy index point>
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

function _print_grid_info(grid_info) {
  console.log("# C (contour) (", grid_info.C.length, "):");
  for (let i=0; i<grid_info.C.length; i++) {
    console.log("C[", i, "]:", grid_info.C[i], "(t:", grid_info.Ct[i], ")");
  }
  console.log("");

  console.log("# G (grid) (", grid_info.G.length, "):");
  for (let i=0; i<grid_info.G.length; i++) {
    console.log("G[", i, "]:", grid_info.G[i], "(t:", grid_info.Gt[i], ")");
  }
  console.log("");

  console.log("Gv.G_idx:");
  for (let j=(grid_info.Gv.length-1); j>=0; j--) {
    let _r = [];
    for (let i=0; i<grid_info.Gv[j].length; i++) {
      _r.push( _ifmt(grid_info.Gv[j][i].G_idx, 3) );
      //_r.push( JSON.stringify( grid_info.Gv[j][i] ) );
    }
    console.log(_r.join(" "));
  }
  console.log("");

  console.log("# X (", grid_info.X.length, "):");
  let xs = [];
  for (let i=0; i<grid_info.X.length; i++) {
    xs.push( _ifmt(grid_info.X[i], 3) );
  }
  console.log(xs.join(" "));
  console.log("");

  console.log("# Y (", grid_info.Y.length, "):");
  let ys = [];
  for (let i=0; i<grid_info.Y.length; i++) {
    ys.push( _ifmt(grid_info.Y[i], 3) );
  }
  console.log(ys.join(" "));
  console.log("");

  console.log("# dualG[iy][ix]:");
  for (let j=0; j<grid_info.dualG.length; j++) {
    for (let i=0; i<grid_info.dualG[j].length; i++) {
      console.log("dualG[", j, "][", i, "]:", JSON.stringify(grid_info.dualG[j][i]));
    }
    console.log("");
  }
  console.log("");

  _print_dual(grid_info.dualG);
  console.log("");

  for (let i=0; i<grid_info.B.length; i++) {
    console.log("B[", i, "]:", JSON.stringify(grid_info.B[i]));
  }
  console.log("");

  console.log("# B2d:");
  for (let j=(grid_info.B_2d.length-1); j>=0; j--) {
    let row_s = ["  "];
    for (let i=0; i<grid_info.B_2d[j].length; i++) {
      let v = _ifmt( grid_info.B_2d[j][i] );
      let s = ( (v < 0) ? "  ." : _ifmt(v, 3) );
      row_s.push( s );
    }
    console.log(row_s.join(" "));
  }
  console.log("");

  let _sw = 3;
  let _sp = _sfmt("", _sw);

  let idir_descr = [ "+x", "-x", "+y", "-y" ];

  console.log("# Js Je:");

  for (let idir=0; idir<4; idir++) {

    console.log("## Js,Je[", idir_descr[idir], "]");

    for (let j=(grid_info.Gv.length-1); j>=0; j--) {
      let row_s = [];

      for (let i=0; i<grid_info.Gv[j].length; i++) {
        let js = grid_info.Js[idir][j][i];
        let je = grid_info.Je[idir][j][i];

        let a = ( (js < 0) ? _sp : _ifmt(js, _sw) );
        let b = ( (je < 0) ? _sp : _ifmt(je, _sw) );

        row_s.push( a + "," + b );
      }

      console.log( row_s.join("   ") );
    }
    console.log("");

  }
  console.log("");


  console.log("# Sx Sy:");
  for (let j=(grid_info.Gv.length-1); j>=0; j--) {

    let row_s = [ _ifmt(j, 2) + "," + _ifmt( grid_info.Ly[j], _sw ) + "|"  ];

    for (let i=0; i<grid_info.Gv[j].length; i++) {
      let sx = grid_info.Sx[j][i];
      let sy = grid_info.Sy[j][i];

      let a = ( (sx < 0) ? _sp : _ifmt(sx, _sw) );
      let b = ( (sy < 0) ? _sp : _ifmt(sy, _sw) );

      row_s.push( a + "," + b );
    }

    console.log( row_s.join("   ") );
  }

  let ftr = [ "   " + _sfmt("", _sw) + "|" ];
  for (let i=0; i<grid_info.Lx.length; i++) {
    ftr.push( "  " + _ifmt(grid_info.Lx[i], _sw) + _sp + " " );
  }

  let sep_s = [];
  let sep_len = ftr.join(" ").length;
  for (let i=0; i<sep_len; i++) {
    sep_s.push("-");
  }
  console.log(sep_s.join(""));
  console.log(ftr.join(" "));


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

// Test if a rectangle is wholly contained in rectilinear polygon.
// Assumes structures Sx, Sy, Lx, Ly have been precomputed
//
// input:
//
// s_ij - xy vector of grid start point
// l_ij - xy vector of rectangle width/height
//
// output:
//
// true if rectangle with lower left corner at s_ij and width/height of l_ij
//      in rectilinear polygon
// false otherwise
//
// precomputed auxiliary structures:
//
// Sx holds grid cell running lengths, from left to right, of contiguous region within
//    rectilinear polygon, resetting to 0 at the beginning of every interior
//    edge and -1 for exterior points
// Sy, like Sx, but from bottom to top
// Lx holds total sum of left to right, regardless of interior/exterior
// Ly holds total sum of bottom to top, regardless of interior/exterior
//
function rprp_irect_contain(grid_info, s_ij, l_ij) {
  let Lx = grid_info.Lx,
      Ly = grid_info.Ly,
      Sx = grid_info.Sx,
      Sy = grid_info.Sy;

  if ((s_ij[0] < 0) || (s_ij[1] < 0) ||
      (l_ij[0] < 0) || (l_ij[1] < 0) ||
      (s_ij[0] >= Lx.length) ||
      (s_ij[1] >= Ly.length) ||
      ((s_ij[0] + l_ij[0]) >= Lx.length) ||
      ((s_ij[1] + l_ij[1]) >= Ly.length)) {
    return false;
  }

  let e_ij = [ s_ij[0] + l_ij[0] - 1, s_ij[1] + l_ij[1] - 1 ];

  if ((Sx[s_ij[1]][s_ij[0]] < 0) ||
      (Sx[s_ij[1]][e_ij[0]] < 0) ||
      (Sx[e_ij[1]][s_ij[0]] < 0) ||
      (Sx[e_ij[1]][e_ij[0]] < 0) ||

      (Sy[s_ij[1]][s_ij[0]] < 0) ||
      (Sy[s_ij[1]][e_ij[0]] < 0) ||
      (Sy[e_ij[1]][s_ij[0]] < 0) ||
      (Sy[e_ij[1]][e_ij[0]] < 0)) {

    return false;
  }

  let len_dx = Lx[ e_ij[0] ] - Lx[ s_ij[0] ];
  let len_dy = Ly[ e_ij[1] ] - Ly[ s_ij[1] ];

  let dx0 = Sx[s_ij[1]][ e_ij[0] ] - Sx[s_ij[1]][ s_ij[0] ];
  let dx1 = Sx[e_ij[1]][ e_ij[0] ] - Sx[e_ij[1]][ s_ij[0] ];

  let dy0 = Sy[ e_ij[1] ][s_ij[0]] - Sy[ s_ij[1]][s_ij[0]];
  let dy1 = Sy[ e_ij[1] ][e_ij[0]] - Sy[ s_ij[1]][e_ij[0]];

  if ((dx0 == len_dx) && (dx1 == len_dx) &&
      (dy0 == len_dy) && (dy1 == len_dy)) {
    return true;
  }

  return false;
}

//---

// Assumes rectangles (l_ij) are at least 2 wide and hight
// (in grid points).
// Assumes start is lower left of rectangle.
//
function _rprp_irect_contain_slow(grid_info, s_ij, l_ij) {
  let Gv = grid_info.Gv;
  let B_2d = grid_info.B_2d;
  let dualG = grid_info.dualG;

  if (Gv[s_ij[1]][s_ij[0]].G_idx < 0) { return false; }

  let nx = l_ij[0]-1;
  let ny = l_ij[1]-1;

  for (let j=s_ij[1]; j<(s_ij[1] + ny); j++) {
    for (let i=s_ij[0]; i<(s_ij[0] + nx); i++) {
      if (dualG[j][i].id < 0) { return false; }
    }
  }
  return true;
}

function _rprp_irect_contain_test(grid_info, _debug) {
  _debug = ((typeof _debug === "undefined") ? false : _debug);

  let Gv = grid_info.Gv;

  for (let sj=0; sj<Gv.length; sj++) {
    for (let si=0; si<Gv[sj].length; si++) {

      for (let lj=2; lj<(Gv.length-sj); lj++) {
        for (let li=2; li<(Gv[lj].length - si); li++) {

          let s_ij = [si, sj];
          let l_ij = [li, lj];

          let slow = _rprp_irect_contain_slow(grid_info, s_ij, l_ij);
          let fast = rprp_irect_contain(grid_info, s_ij, l_ij);

          if ( _rprp_irect_contain_slow(grid_info, s_ij, l_ij) !=
               rprp_irect_contain(grid_info, s_ij, l_ij) ) {


            if (_debug) {
              console.log("!!!!", s_ij, l_ij, slow, fast);
            }

            return false;
          }
        }
      }

    }
  }

  return true;
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
    "Je" : Je
  };


}

// Init function to set up all data structures and return
// the rprp data context.
//
// Return:
//
// {
//  C  : [ ... ]  // Contour array (primitive boundary points)
//  G  : []       // Grid array
//  Gv : [][]     // Grid 2d structure (element keys: { G_idx })
//  X  : []       // unique ordered X point array (asc)
//  Y  : []       // unique ordered Y point array (asc)
//  dualG : [][]  // information about each (dual) grid rectangle
//  B  : []       // general boundary points array
//  B_2d : [][]   // 2d array,
//                //  -1 no general boundary point,
//                //  general boundary index otherwise
//  Js  : [][]    // border jump structure (start)
//  Je  : [][]    // border jump structure (end)
//  Sx  : [][]    // start x structure
//  Sy  : [][]    // start y structure
//  Lx  : [][]    // max contig length x structure
//  Ly  : [][]    // max contig length y structure
//
// }
//
// All 2d arrays are [Y][X] indexed
//
//

function rectilinearGridPoints(_rl_pgon) {
  let _eps = (1/(1024));

  let x_dup = [],
      y_dup = [];

  let pnt_map = {};
  let corner_type = [];

  if (_rl_pgon.length == 0) { return []; }

  let rl_pgon = orderCounterclockwise( _rl_pgon );
  let n = rl_pgon.length;

  // sanity
  //
  for (let cur_idx=0; cur_idx<rl_pgon.length; cur_idx++) {
    let prv_idx = (cur_idx+n-1)%n;
    let dxy = v_sub( rl_pgon[cur_idx], rl_pgon[prv_idx] );
    let adx = Math.abs(dxy[0]);
    let ady = Math.abs(dxy[1]);

    if (((adx == 0) && (ady == 0)) ||
        ((adx != 0) && (ady != 0))) { return {}; }
  }
  //
  // sanity


  for (let i=0; i<rl_pgon.length; i++) {
    x_dup.push(rl_pgon[i][0]);
    y_dup.push(rl_pgon[i][1]);

    let p_prv = [ rl_pgon[(i+n-1)%n][0], rl_pgon[(i+n-1)%n][1], 0 ];
    let p_cur = [ rl_pgon[i][0], rl_pgon[i][1], 0 ];
    let p_nxt = [ rl_pgon[(i+1)%n][0], rl_pgon[(i+1)%n][1], 0 ];

    let v0 = v_sub( p_prv, p_cur );
    let v1 = v_sub( p_nxt, p_cur );

    let _c = cross3( v0, v1 );

    let corner_code = 'X';

    if      (_c[2] < _eps) { corner_code = 'r'; }
    else if (_c[2] > _eps) { corner_code = 'c'; }

    corner_type.push(corner_code);

    let key = rl_pgon[i][0].toString() + "," + rl_pgon[i][1].toString();
    pnt_map[key] = corner_code;
  }

  x_dup.sort( _icmp );
  y_dup.sort( _icmp );

  let Xinv = {},
      Yinv = {};

  let x_dedup = [ x_dup[0] ],
      y_dedup = [ y_dup[0] ];

  Xinv[ x_dup[0].toString() ] = 0;
  Yinv[ x_dup[1].toString() ] = 0;

  for (let i=1; i<x_dup.length; i++) {
    if (x_dup[i] == x_dup[i-1]) { continue; }

    Xinv[ x_dup[i].toString() ] = x_dedup.length;

    x_dedup.push(x_dup[i]);

  }

  for (let i=1; i<y_dup.length; i++) {
    if (y_dup[i] == y_dup[i-1]) { continue; }

    Yinv[ y_dup[i].toString() ] = y_dedup.length;

    y_dedup.push(y_dup[i]);
  }

  let grid_xy = [];
  let type_xy = [];

  let dualG = [];
  let dualCell = [];
  let g_id = 0;

  // create:
  //  G - grid flat array (grid_xy)
  //  Gt - grid flat type (type_xy)
  //  dualG - 2d dual of graph
  //
  for (let j=0; j<y_dedup.length; j++) {
    dualG.push([]);
    for (let i=0; i<x_dedup.length; i++) {
      let g = [ x_dedup[i], y_dedup[j] ] ;

      let _type = 'i';
      let _key = g[0].toString() + "," + g[1].toString();

      if      ( _key in pnt_map )                       { _type = 'c'; }
      else if ( onBoundary(g, rl_pgon) )                { _type = 'b'; }
      else if ( Math.abs(winding(g, rl_pgon)) < _eps )  { _type = 'x'; }

      let g_idx = -1;
      if (_type != 'x') {

        g_idx = grid_xy.length;

        grid_xy.push( g );
        type_xy.push( _type );
      }

      dualG[j].push( {"ij":[i,j], "G_idx": g_idx, "id": -1 } );
    }
  }

  let dualG_ele_idx = 0;

  for (let j=0; j<dualG.length; j++) {
    for (let i=0; i< dualG[j].length; i++) {
      let dg = dualG[j][i];

      let ij = dg.ij;

      if ((ij[0] >= (x_dedup.length-1)) ||
          (ij[1] >= (y_dedup.length-1))) { continue; }

      let R = [
        [ x_dedup[ij[0]],      y_dedup[ij[1]] ],
        [ x_dedup[ij[0] + 1],  y_dedup[ij[1]] ],
        [ x_dedup[ij[0] + 1],  y_dedup[ij[1] + 1] ],
        [ x_dedup[ij[0]],      y_dedup[ij[1] + 1] ]
      ];

      let mp = [0,0];
      for (let i=0; i<R.length; i++) {
        mp[0] += R[i][0];
        mp[1] += R[i][1];
      }
      mp[0] /= R.length;
      mp[1] /= R.length;

      if ( Math.abs(winding(mp, rl_pgon)) < _eps ) { continue; }

      dualG[j][i]["R"] = R;
      dualG[j][i]["id"] = dualG_ele_idx;
      dualG[j][i]["midpoint"] = mp;

      dualCell.push({"R": R, "midpoint": mp, "ij": [i,j]});

      dualG_ele_idx++;
    }
  }

  // grid point xy key to grid index map
  //
  let G = grid_xy;
  let Gt = type_xy;
  let G_idx_bp = {};
  for (let i=0; i<G.length; i++) {
    let g = G[i];
    let key = g[0].toString() + "," + g[1].toString();
    G_idx_bp[key] = i;
  }
  //grid_ctx["G_idx_bp"] = G_idx_bp;

  // grid point (actual) xy key to daul entry
  // dual entry is lower left hand corner point
  //
  let G_dualG_map = {};
  for (let j=0; j<dualG.length; j++) {
    for (let i=0; i<dualG[j].length; i++) {
      let g_idx = dualG[j][i].G_idx;
      if (g_idx < 0) { continue; }
      let key = G[g_idx][0].toString() + "," + G[g_idx][1].toString();
      G_dualG_map[key] = [i,j];
    }
  }
  //grid_ctx["G_dualG_map"] = G_dualG_map;

  // grid index xy to information about grid poitn:
  // each entry contains:
  // {
  //   G_idx  : <grid index>
  //   xy     : <xy point (actual)>
  //   t      : <type [cbix], x being invalid>
  // }
  //
  // Gv_bp maps grid xy point (actual) to grid index
  //
  let Gv = [];
  let Gv_bp = {};
  for (let j=0; j<dualG.length; j++) {
    Gv.push([]);
    for (let i=0; i<dualG[j].length; i++) {
      let dg = dualG[j][i];

      let _xy = [-1,-1];
      let _type = "x";

      if (dg.G_idx >= 0) {
        _xy = G[dg.G_idx];
        _type = Gt[dg.G_idx];
      }

      Gv[j].push( { "G_idx": dg.G_idx, "xy": _xy, "t": _type } );
      Gv_bp[ _xy[0].toString() + "," + _xy[1].toString() ] = [i,j];

    }
  }

  //---
  //---
  //---

  let B = [];
  let B_2d = [];

  let _b_id = 0;

  for (let j=0; j<dualG.length; j++) {
    B_2d.push([]);
    for (let i=0; i<dualG[j].length; i++) {
      B_2d[j].push(-1);
    }
  }

  for (let c_idx=0; c_idx < rl_pgon.length; c_idx++) {
    let c_cur_xy = rl_pgon[c_idx];
    let c_nxt_xy = rl_pgon[(c_idx+1) % rl_pgon.length];

    let c_cur_key = _xyKey(c_cur_xy);
    let c_nxt_key = _xyKey(c_nxt_xy);

    let cur_ij = Gv_bp[ c_cur_key ];
    let nxt_ij = Gv_bp[ c_nxt_key ];



    let n_m_c_ij = v_sub(nxt_ij, cur_ij);
    let d = abs_sum_v(n_m_c_ij );
    let dxy = v_delta( n_m_c_ij );

    let _ij = [ cur_ij[0], cur_ij[1] ];
    for (i=0; i<d; i++) {

      let g = Gv[ _ij[1] ][ _ij[0] ];

      B.push( { "xy": [ g.xy[0], g.xy[1] ], "ij": [ _ij[0], _ij[1] ], "t": g.t, "b_id": _b_id } );
      B_2d[ _ij[1] ][ _ij[0] ] = _b_id;

      _b_id++;

      _ij = v_add( _ij, dxy );
    }

  }

  // Sx Sy Lx and Ly are auxiliary structures to do
  // quick rectangular inclusion testing
  //
  // Sx holds running sum from left to right of longest strip
  // Sy holds running sum from bottom to top of longest strip
  // Lx holds running sum of total length from left to right
  // Ly holds running sum of total length from bottom to top
  //
  // All are in grid coordinates
  //
  let Sx = [], Sy = [];
  let Lx = [], Ly = [];

  Lx.push(0);
  for (let i=1; i<x_dedup.length; i++) {
    Lx.push( Lx[i-1] + (x_dedup[i] - x_dedup[i-1]) );
  }

  Ly.push(0);
  for (let i=1; i<y_dedup.length; i++) {
    Ly.push( Ly[i-1] + (y_dedup[i] - y_dedup[i-1]) );
  }

  for (let j=0; j<Gv.length; j++) {
    Sx.push([]);
    Sy.push([]);
    for (let i=0; i<Gv[j].length; i++) {
      Sx[j].push(-1);
      Sy[j].push(-1);
    }
  }

  // rl_pgon ordered counterclockwise.
  //
  // We walk the border structure, initializing
  // Sx and Sy anywhere the border starts from
  // left to right or bottom to top.
  // We keep a previous, current and next
  // index into the border, and see if
  // the current vertex is in line or
  // at a corner.
  // If it's inline, then
  //

  for (let idx=0; idx<B.length; idx++) {
    let idx_prv = (idx + B.length - 1)%B.length;
    let idx_nxt = (idx + B.length + 1)%B.length;

    let prv_ij = B[idx_prv].ij;
    let cur_ij = B[idx].ij;
    let nxt_ij = B[idx_nxt].ij;

    let prv_xy = B[idx_prv].xy;
    let cur_xy = B[idx].xy;
    let nxt_xy = B[idx_nxt].xy;


    let _i = cur_ij[0];
    let _j = cur_ij[1];

    let _u = v_sub( cur_ij, prv_ij );
    let _v = v_sub( nxt_ij, cur_ij );

    let _dprv = v_delta(_u);
    let _dnxt = v_delta(_v);

    // if we're on the edge of the grid and on
    // the border, initialize Sx or Sy to 0,
    // as appropriate.
    //
    if (_i == 0) { Sx[ _j ][ _i ] = 0; }
    if (_j == 0) { Sy[ _j ][ _i ] = 0; }

    // prv-cur-nxt on horizontal line, init Sy to 0
    // Mark Sx to -2 so that on second pass we
    // fill in with neighbor value.
    //
    if ( (_dprv[0] > 0.5) && (_dnxt[0] > 0.5) ) {
      Sy[ _j ][ _i ] = 0;
      //Sx[ _j ][ _i ] = -2;
    }

    // prv-cur-nxt on vertical line, init Sx to 0.
    // Mark Sy to -2 so that on second pass we
    // fill in with neighbor value.
    //
    if ( (_dprv[1] < -0.5) && (_dnxt[1] < -0.5) ) {
      Sx[ _j ][ _i ] = 0;
      //Sy[ _j ][ _i ] = -2;
    }

    // cur vertex is at bend point
    //
    if ( Math.abs(dot_v( _dnxt, _dprv )) < _eps ) {

      // prv *           cur * <- * prv
      //     |               |
      //     v               v
      // cur * -> * nxt      * nxt
      //
      if ( ((_dprv[1] < -0.5) && (_dnxt[0] >  0.5))  ||
           ((_dprv[0] < -0.5) && (_dnxt[1] < -0.5)) ) {
        Sx[ _j ][ _i ] = 0;
      }

      // prv *                      * nxt
      //     |                      ^
      //     v                      |
      // cur * -> * nxt    prv * -> * cur
      //
      if ( ((_dprv[1] < -0.5) && (_dnxt[0] > 0.5)) ||
           ((_dprv[0] >  0.5) && (_dnxt[1] > 0.5)) ) {
        Sy[ _j ][ _i ] = 0;
      }

    }

  }

  for (let j=0; j<Gv.length; j++) {
    let x_start = 0;
    for (let i=0; i<Gv[j].length; i++) {
      if (Gv[j][i].G_idx < 0) {
        x_start = -1;
        continue;
      }

      if ((Gv[j][i].G_idx >= 0) &&
          (x_start < 0)) {
        x_start = Lx[i];
      }

      if (Sx[j][i] ==  0) { x_start = Lx[i]; }
      Sx[j][i] = Lx[i] - x_start;
    }
  }

  for (let i=0; i<Lx.length; i++) {
    let y_start = 0;
    for (let j=0; j<Ly.length; j++) {
      if (Gv[j][i].G_idx < 0) {
        y_start = -1;
        continue;
      }

      if ((Gv[j][i].G_idx >= 0) &&
          (y_start < 0)) {
        y_start = Ly[j];
      }

      if (Sy[j][i] ==  0) { y_start = Ly[j]; }
      Sy[j][i] = Ly[j] - y_start;
    }
  }


  // Jx Jy structures
  //

  let Js = [ [], [], [], [] ],
      Je = [ [], [], [], [] ];

  for (let j=0; j<Gv.length; j++) {
    for (let i=0; i<Gv[j].length; i++) {
      for (let idir=0; idir<4; idir++) {

        if (i==0) {
          Js[idir].push([]);
          Je[idir].push([]);
        }

        Js[idir][j].push(-1);
        Je[idir][j].push(-1);
      }
    }
  }


  let idir_dxy = [ [1,0], [-1,0], [0,1], [0,-1] ];
  let _ibound = [
    [ [Gv[0].length-1, -1, -1], [0,Gv.length,1] ],
    [ [0, Gv[0].length, 1], [0,Gv.length,1] ],
    [ [0, Gv[0].length, 1], [Gv.length-1,-1,-1] ],
    [ [0, Gv[0].length, 1], [0,Gv.length,1] ]
  ];

  //-----------------------------------------------------
  // I - interior, a - afar, n - near
  //
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
  // so +x above is indicating the ray is shotting in the +x direction
  // but we look at transitions walking from right to left.
  //
  // Whenever we change from exterior to interior, we need to update
  // the near and far saved indices.
  // There are only a few other cases where the near index needs
  // to be updated.
  //
  //-----------------------------------------------------

  let _idir2lu = [
    [  0, -1,  4,  5 ],
    [ -1,  1,  6,  7 ],
    [  8,  9,  2, -1 ],
    [ 10, 11, -1,  3 ]
  ];

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

          if (B_2d[j][i] >= 0) {

            let cur_B_idx = B_2d[j][i];
            let cur_B_ij = B[cur_B_idx].ij;
            let prv_B_ij = B[(cur_B_idx-1 + B.length) % B.length].ij;
            let nxt_B_ij = B[(cur_B_idx+1) % B.length].ij;

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

          if (B_2d[j][i] >= 0) {

            let cur_B_idx = B_2d[j][i];
            let cur_B_ij = B[cur_B_idx].ij;
            let prv_B_ij = B[(cur_B_idx-1 + B.length) % B.length].ij;
            let nxt_B_ij = B[(cur_B_idx+1) % B.length].ij;

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


  return {
    "C": rl_pgon,
    "Ct": corner_type,
    "G": grid_xy, "Gt": type_xy,

    "X": x_dedup, "Y": y_dedup,
    "Xinv": Xinv, "Yinv": Yinv,

    "dualG" : dualG,
    "dualCell": dualCell,
    "G_idx_bp": G_idx_bp,
    "G_dualG_map": G_dualG_map,
    "Gv": Gv,
    "Gv_bp": Gv_bp,
    "B": B,
    "B_2d": B_2d,

    "Sx" : Sx,
    "Sy" : Sy,
    "Lx" : Lx,
    "Ly" : Ly,

    "Js": Js,
    "Je": Je
  };
}

// from grid point g, follow a line out in idir direction until
// it hits the boundary
//
// _code: 
//   'f' - return first boundary point hit (default)
//   'l' - return last boundary hit
//
// return -1 if g not inside or ray shoots outside of boundary
//
function ray_boundary_intersection(rprp_info, g, idir, _code) {
  _code = ((typeof _code === "undefined") ? 'f' : _code);
  let J = rprp_info.Js;
  if (_code != 'f') { J = rprp_info.Je; }
  return J[idir][ g[1] ][ g[0] ];
}

function boundary_index_on_fence( b_idx, b_idx_s, b_idx_e ) {
  if (b_idx_e > b_idx_s) {
    if ((b_idx >= b_idx_s) && (b_idx <= b_idx_e)) { return true; }
    return false;
  }
  if ((b_idx > b_idx_e) && (b_idx < b_idx_s)) { return false; }
  return true;
}

function bidx_in_R( b_idx, b_idx_s, b_idx_e ) {
  if (b_idx < 0) { return false; }
  return boundary_index_on_fence( b_idx, b_idx_s, b_idx_e );
}

// is idx in the interval [idx_s, idx_e] (inclusive) or,
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

//------

// lightly tested
// ... I'm still al ittle iffy but works for some simple test cases
//
// The idea is to extend rays out from the grid point to where they
// meet the border using the border jump structure (Js).
// If any of the J[idir] indicies are -1, then the grid point is either
// completely oustide the rectangle or on the border, so return -1.
//
// If the ray in the x line or the ray in the y line both have border
// indices that are within the region, the point must be within the
// region.
// The same logic applies if the x line or y line are outside of
// the region.
//
// The final case is when the border indices on both the x and y lines have
// one endpoint inside the region and one endpoint outside the region.
// From the grid point, see which direction (idir) the grid point is from
// the vertical line and horizontal line implied by the adit point.
// This determines if the grid point is left or right of vertical cut
// and up or down from the horizontal cut.
//
// If the border index in the horizontal and vertical direction
// are both within the region, the point is inside (return 1).
// Otherwise, the point is outside (return 0).
//
// For example, if the grid point is to the left of the adit x point
// and up from the adit y point, and the border index from the ray
// traced out to the left from the grid point is within the region
// and the border index from the ray traced out up from the grid
// point is in the region, the grid point is in the 2-cut region.
// If either of the border indicies traced out from the grid
// point in the direction away from the cut line are *not* in
// the region, the grid point is not within the region.
//
// All this might be overkill.
// I'm trying to get an O(1) operation.
// As this only uses some simple vector subtraction, border
// inclusion (bidx_in_R, which does simple range tests) tests and
// uses the precomputed J (border jump structure), we don't need to
// walk individual grid points until we hit a boundary, avoiding
// the potential O(n) blowup.
//
// For 1cut, grid_adit should never be used as the grid_pnt rays
// will have two border indices completely outside or inside
// in either the vertical or horizontal orientations.
//
// Input:
//
//   rprp_info    - context
//   grid_pnt     - [ix,iy] grid point
//   border_idx0  - index of first border
//   border_idx1  - index of second border (ccw from idx0 to idx1)
//   grid_adit    - intersection of 2-cut from border indicies.
//                  in the case of a 1-cut, grid_adit is unused, so
//                  can either be left undefined or be one of the two endpoints of
//                  the 1-cut line.
//
// Return:
//
//   1 - if grid_pnt within the region defined by the 2-cut or 1-cut border_idx0, border_idx1 and adit grid point
//   0 - otherwise (outside of region, on border outside of rectangle).
//
function ijpoint_inside_cut_region(rprp_info, grid_pnt, border_idx0, border_idx1, grid_adit) {

  let J = rprp_info.Js;

  let jval = [
    J[0][ grid_pnt[1] ][ grid_pnt[0] ],
    J[1][ grid_pnt[1] ][ grid_pnt[0] ],
    J[2][ grid_pnt[1] ][ grid_pnt[0] ],
    J[3][ grid_pnt[1] ][ grid_pnt[0] ]
  ];

  let jval_in = [
    bidx_in_R( jval[0], border_idx0, border_idx1 ),
    bidx_in_R( jval[1], border_idx0, border_idx1 ),
    bidx_in_R( jval[2], border_idx0, border_idx1 ),
    bidx_in_R( jval[3], border_idx0, border_idx1 )
  ];

  //console.log("\n## p in R 2cut: grid_pnt:", grid_pnt, "border:[", border_idx0, border_idx1, "], adit:", grid_adit);
  //console.log("g:", grid_pnt, "jval:", jval, "...", jval_in);

  // grid point is completely outside of polygon or is on border
  //
  if ((jval[0] < 0) || (jval[1] < 0) ||
      (jval[2] < 0) || (jval[3] < 0)) {
    return 0;
  }

  // x line or y line lies completely in region, so point is inside region
  //
  if ( (jval_in[0] && jval_in[1]) ||
       (jval_in[2] && jval_in[3]) ) {
    return 1;
  }

  // x line or y line lies completely outside region, so point is outside region
  //
  if ( ((!jval_in[0]) && (!jval_in[1])) ||
       ((!jval_in[2]) && (!jval_in[3])) ) {
    return 0;
  }

  /*
  let g_B = [
    rprp_info.B[ jval[0] ].ij,
    rprp_info.B[ jval[1] ].ij,
    rprp_info.B[ jval[2] ].ij,
    rprp_info.B[ jval[3] ].ij,
  ];
  */

  // which side of the cut line is the point on
  //

  let pnt_idir_cut = [
    ((grid_pnt[0] > grid_adit[0]) ? 0 : 1),
    ((grid_pnt[1] > grid_adit[1]) ? 2 : 3)
  ];

  // If border point in the direction away from the cut line
  // are both inside region, point is inside region.
  //
  if (jval_in[ pnt_idir_cut[0] ] && jval_in[ pnt_idir_cut[1] ]) {
    return 1;
  }

  return 0;
}

function point_on_border(rprp_info, grid_pnt) {

}

//------

// rprp_info
// g grid origin point
// dg axis aligned unit vector direction
//
// returns if the cleave cut starts inside the rectangle
//
function cleaveGridInside(rprp_info, g, dg) {
  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;
  let Sx = rprp_info.Sx;
  let Sy = rprp_info.Sy;

  let Js = rprp_info.Js;
  let Je = rprp_info.Je;

  let Gsize = [ Gv[0].length, Gv.length ];

  let g_nei = [ g[0] + dg[0], g[1] + dg[1] ];

  let idir = _to_idir(dg);

  if ( (g_nei[0] < 0) ||
       (g_nei[1] < 0) ||
       (g_nei[0] >= Gsize[0]) ||
       (g_nei[1] >= Gsize[1]) ) {
    return false;
  }

  let uxy = [
    Sx[ g[1] ][ g[0] ],
    Sy[ g[1] ][ g[0] ]
  ];

  let vxy = [
    Sx[ g_nei[1] ][ g_nei[0] ],
    Sy[ g_nei[1] ][ g_nei[0] ]
  ];

  if ((dg[0] == 1) && (dg[1] == 0)) {
    if ((uxy[0] < 0) || (vxy[0] < 0)) { return false; }
    if (Sx[ g[1] ][ g[0] ] > Sx[ g_nei[1] ][ g_nei[0] ]) { return false; }
  }

  else if ((dg[0] == -1) && (dg[1] == 0)) {
    if ((uxy[0] < 0) || (vxy[0] < 0)) { return false; }
    if (Sx[ g_nei[1] ][ g_nei[0] ] > Sx[ g[1] ][ g[0] ]) { return false; }
  }

  else if ((dg[0] == 0) && (dg[1] == 1)) {
    if ((uxy[1] < 0) || (vxy[1] < 0)) { return false; }
    if (Sy[ g[1] ][ g[0] ] > Sy[ g_nei[1] ][ g_nei[0] ]) { return false; }
  }

  else if ((dg[0] == 0) && (dg[1] == -1)) {
    if ((uxy[1] < 0) || (vxy[1] < 0)) { return false; }
    if (Sy[ g_nei[1] ][ g_nei[0] ] > Sy[ g[1] ][ g[0] ]) { return false; }
  }

  return true;
}

function cleaveGridOnBorder(rprp_info, g, dg) {
  let B2d = rprp_info.B_2d;

  if (!cleaveGridInside(rprp_info, g, dg)) { return false; }
  let g_nei = [ g[0] + dg[0], g[1] + dg[1] ];

  let _bb = B2d[g[1]][g[0]]
  let _be = B2d[g_nei[1]][g_nei[0]]

  if ((_bb < 0) || (_be < 0) ||
      (Math.abs(_be-_bb) != 1)) {
    return false;
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

// Point version of cleaveProfile where start, end, adit and bower
// points are specified in xy point coordinates instead of grid coordinates.
//
function cleaveProfilePoint(rprp_info, p_s, p_e, a, b) {

  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;
  let B2d = rprp_info.B_2d;

  let Sx = rprp_info.Sx;
  let Sy = rprp_info.Sy;

  let g_s = Gv_bp[ _ijkey(p_s) ];
  let g_e = Gv_bp[ _ijkey(p_e) ];

  let g_a = Gv_bp[ _ijkey(a) ];
  let g_b = Gv_bp[ _ijkey(b) ];

  return cleaveProfile(rprp_info, g_s, g_e, g_a, g_b);
}

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

// Input:
//
// rprp_info    - rprp context
// g_s          - border grid point (ij) start of region (ccw)
// g_e          - border grid point (ij) end of region
// g_a          - origin of quarry rectangle (adit)
// g_b          - end of quarry rectangle (bower)
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
function cleaveProfile(rprp_info, g_s, g_e, g_a, g_b) {

  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;
  let B2d = rprp_info.B_2d;

  // boundary start and end index
  //
  let b_idx_s = B2d[ g_s[1] ][ g_s[0] ];
  let b_idx_e = B2d[ g_e[1] ][ g_e[0] ];

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
  let cleave_dxy = [
    [  1,  0 ], [  0, -1 ],
    [  0, -1 ], [ -1,  0 ],
    [ -1,  0 ], [  0,  1 ],
    [  0,  1 ], [  1,  0 ]
  ];

  let Gsize = [ Gv[0].length, Gv.length ];

  let cleave_profile = [ '~', '~', '~', '~', '~', '~', '~', '~' ];

  for (let i=0; i<cleave_dxy.length; i++) {
    let g = Rg[ Math.floor(i/2) ];

    let _b_c_idx = ray_boundary_intersection(rprp_info, g, cleave_idir[i]);

    let b_c_idx = rprp_info.Js[ cleave_idir[i] ][ g[1] ][ g[0] ];

    if (b_c_idx < 0) {
      cleave_profile[i] = 'x';
      continue;
    }

    if (!boundary_index_on_fence( b_c_idx, b_idx_s, b_idx_e )) {
      cleave_profile[i] = 'X';
      continue;
    }

    if (cleaveGridOnBorder(rprp_info, g, cleave_dxy[i])) {
      cleave_profile[i] = 'b';
      continue;
    }

    if ((b_c_idx == b_idx_s) || (b_c_idx == b_idx_e)) {
      cleave_profile[i] = 'c';
      continue;
    }

    cleave_profile[i] = '.';
    continue;

  }

  return cleave_profile;
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
    else if (cleave_choice[i] == 'x') { _code = 'x'; }
    else if (cleave_choice[i] == 'X') { _code = 'x'; }
    //else { console.log("!!!!", i, cleave_choice[i]); }

    redux.push( _code );
  }

  // quarry rectangle edge is 'undocked', not
  // buffetted by a border perimeter
  //
  let _undock = [ 1, 1, 1, 1 ];

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


  if (_debug) { console.log("#vc.cp3"); }

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

  let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];
  let oppo_cleave = [ 3, 6, 5, 0,
                      7, 2, 1, 4 ];
  let oppo_idir = [ 1,0, 3,2 ];

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
//  true  - cleave_choice is valid
//  false - otherwise
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
function valid_cleave_choice(rprp_info, grid_quarry, cleave_choice, cleave_border_type, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let Js = rprp_info.Js;
  let R = grid_quarry;

  let B = rprp_info.B;
  let B2d = rprp_info.B_2d;

  let quarry_point_type = ['~', '~', '~', '~'];

  for (let i=0; i<4; i++) {
    let b_id = B2d[ R[i][1] ][ R[i][0] ];

    if (b_id < 0) {
      quarry_point_type[i] = '.';
      continue;
    }

    quarry_point_type[i] = B[b_id].t;
  }

  if (_debug) { console.log("#vcc.cp0"); }

  let redux = [];
  for (let i=0; i<cleave_choice.length; i++) {
    let _code = '^';
    if      (cleave_choice[i] == '-') { _code = '-'; }
    else if (cleave_choice[i] == '*') { _code = '*'; }
    else if (cleave_choice[i] == 'c') { _code = '*'; }
    else if (cleave_choice[i] == 'b') { _code = '*'; }
    else if (cleave_choice[i] == 'x') { _code = 'x'; }
    else if (cleave_choice[i] == 'X') { _code = 'x'; }
    //else { console.log("!!!!", i, cleave_choice[i]); }

    redux.push( _code );
  }

  // quarry rectangle edge is 'undocked', not
  // buffetted by a border perimeter
  //
  let _undock = [ 1, 1, 1, 1 ];

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



  if (_debug) { console.log("#vcc.cp1:", cleave_choice.join(""), redux.join(""), JSON.stringify(_undock) ); }

  // each corner needs at least one cleave cut
  //
  if ((redux[0] == '-') && (redux[1] == '-')) { return false; }
  if ((redux[2] == '-') && (redux[3] == '-')) { return false; }
  if ((redux[4] == '-') && (redux[5] == '-')) { return false; }
  if ((redux[6] == '-') && (redux[7] == '-')) { return false; }

  if (_debug) { console.log("#vcc.cp2"); }

  // parallel cleave cuts means middle billet is moveable
  //
  if ((_undock[3] == 1) && (redux[0] == '*') && (redux[7] == '*')) { return false; }
  if ((_undock[0] == 1) && (redux[1] == '*') && (redux[2] == '*')) { return false; }
  if ((_undock[1] == 1) && (redux[3] == '*') && (redux[4] == '*')) { return false; }
  if ((_undock[2] == 1) && (redux[5] == '*') && (redux[6] == '*')) { return false; }


  if (_debug) { console.log("#vcc.cp3"); }

  // bridge tests
  // cleave line bridges two borders, so is moveable, invalidating choice
  //
  // if there's a cleave line that ends on a flat boundary edge
  // and there's a cleave line going orthogonal, it's a bridge (-> invalid)
  //
  if ((redux[0] == '*') && (redux[1] == '*') && (cleave_border_type[0] == 'b')) { return false; }
  if ((redux[1] == '*') && (redux[0] == '*') && (cleave_border_type[1] == 'b')) { return false; }

  if ((redux[2] == '*') && (redux[3] == '*') && (cleave_border_type[2] == 'b')) { return false; }
  if ((redux[3] == '*') && (redux[2] == '*') && (cleave_border_type[3] == 'b')) { return false; }

  if ((redux[4] == '*') && (redux[5] == '*') && (cleave_border_type[4] == 'b')) { return false; }
  if ((redux[5] == '*') && (redux[4] == '*') && (cleave_border_type[5] == 'b')) { return false; }

  if ((redux[6] == '*') && (redux[7] == '*') && (cleave_border_type[6] == 'b')) { return false; }
  if ((redux[7] == '*') && (redux[6] == '*') && (cleave_border_type[7] == 'b')) { return false; }

  if (_debug) { console.log("#vcc.cp4"); }


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


  if (_debug) { console.log("#vcc.cp5"); }

  let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];
  let oppo_cleave = [ 3, 6, 5, 0,
                      7, 2, 1, 4 ];
  let oppo_idir = [ 1,0, 3,2 ];

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
        console.log("#vcc.cp5.5: cleave_idx:", cleave_idx, "rect_idx:", r_idx);
        console.log("qpt[", r_idx, "]:", quarry_point_type[r_idx],
          "redux[", cleave_idx, "]:", redux[cleave_idx],
          "cbt[", cleave_idx, "]:", cleave_border_type[cleave_idx],
          "redux[", rev_cleave_idx, "]:", redux[rev_cleave_idx],
          "cbt[", rev_cleave_idx, "]:", cleave_border_type[rev_cleave_idx],
          "js[", idir, "][", R[r_idx][1], "][", R[r_idx][0], "]:", Js[idir][ R[r_idx][1] ][ R[r_idx][0] ],
          "js[", idir, "][", R[rev_r_idx][1], "][", R[rev_r_idx][0], "]:", Js[idir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]);

      }

      return false;
    }

  }

  if (_debug) { console.log("#vcc.cp6"); }

  return true;
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

  let cleave_cuts = [];

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
      cleave_cuts.push(cleave_choice);
    }

    _ivec_incr(bvec);
  } while ( !_ivec0(bvec) );

  return cleave_cuts;
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
function enumerateCleaveCut(rprp_info, g_s, g_e, g_a, g_b, cleave_profile, _debug) {

  //let _debug = false;
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;

  let B = rprp_info.B;
  let B2d = rprp_info.B_2d;

  let Sx = rprp_info.Sx;
  let Sy = rprp_info.Sy;

  let Js = rprp_info.Js;

  // boundary start and end index
  //
  let b_idx_s = B2d[ g_s[1] ][ g_s[0] ];
  let b_idx_e = B2d[ g_e[1] ][ g_e[0] ];

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
  let cleave_dxy = [
    [  1,  0 ], [  0, -1 ],
    [  0, -1 ], [ -1,  0 ],
    [ -1,  0 ], [  0,  1 ],
    [  0,  1 ], [  1,  0 ]
  ];

  let Gsize = [ Gv[0].length, Gv.length ];

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

      let _type = B[b_idx].t;
      if      (_type == 'b') { cleave_border_type[i] = 'b'; }
      else if (_type == 'c') { cleave_border_type[i] = '*'; }
    }



  }

  let cleave_cuts = [];

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
        valid_cleave_choice( rprp_info, Rg, cleave_choice, cleave_border_type, _debug ) );
    }

    if (valid_cleave_choice( rprp_info, Rg, cleave_choice, cleave_border_type )) {
      cleave_cuts.push(cleave_choice);
    }

    _ivec_incr(bvec);
  } while ( !_ivec0(bvec) );

  return cleave_cuts;
}

function enumerateCleaveCutPoint(rprp_info, p_s, p_e, a, b, cleave_profile) {
  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;

  let B = rprp_info.B;
  let B2d = rprp_info.B_2d;

  let Sx = rprp_info.Sx;
  let Sy = rprp_info.Sy;

  let Js = rprp_info.Js;

  let g_s = Gv_bp[ _ijkey(p_s) ];
  let g_e = Gv_bp[ _ijkey(p_e) ];

  let g_a = Gv_bp[ _ijkey(a) ];
  let g_b = Gv_bp[ _ijkey(b) ];

  return enumerateCleaveCut(rprp_info, g_s, g_e, g_a, g_b, cleave_profile);

}

//WIP!!
function MIRP(rprp_info, g_s, g_e, g_a) {

  let Gv = rprp_info.Gv;

  let B = rprp_info.B;
  let B2d = rprp_info.B_2d;

}

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
//
function RPRP_enumerate_quarry_side_region(ctx, g_s, g_e, g_a, g_b, _debug) {

  _debug = ((typeof _debug === "undefined") ? false : _debug);

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js;

  let guillotine_list = [];

  // grid rectangle corners (ccw)
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

  // It's easier for me to think in a consistent 'left to right'
  // and 'down to up'. So we traverse the quarry rectangle
  // from left to right for the both the (1,0) line and the (2,3)
  // line.
  // This makes the range tests for Rl easier but it means
  // we have to potentially reverse the order of the guillotine
  // cut depending on which quarry side we're on.
  //

  let Rside_idir = [0,2,0,2];
  let oppo_idir = [ 1,0, 3,2 ];

  // single dimension crossing point
  //
  let Rl = [
    Rg[0][0], Rg[2][1],
    Rg[3][0], Rg[3][1]
  ];

  let g_beg = [
    Rg[1], Rg[1],
    Rg[2], Rg[0]
  ];

  let cut_order = [ 1, 0, 0, 1 ];

  for (let r_idx=0; r_idx<Rg.length; r_idx++) {

    if (_debug) {
      console.log("");
    }

    let g_r = g_beg[r_idx];
    let idir = Rside_idir[r_idx];
    let rdir = oppo_idir[idir];

    let b_jmp = Bij[ g_r[1] ][ g_r[0] ];
    if (b_jmp < 0) {
      b_jmp = Js[idir][ g_r[1] ][ g_r[0] ];
    }

    let g_b = B[b_jmp];
    let guillotine_list = [];
    let ldim = r_idx % 2;

    if (_debug) {
      console.log("r_idx:", r_idx, "idir:", idir, "rdir:", rdir, "b_idx:", b_jmp, "g_b:", g_b, "ldim:", ldim);
    }

    while ((b_jmp >= 0) &&
           (g_b[ldim] <= Rl[r_idx])) {

      let b_jmp_nxt = Js[idir][ g_b[1] ][ g_b[0] ];
      if (b_jmp_nxt < 0) { break; }

      let g_b_nxt = B[b_jmp_nxt];
      if (g_b_nxt[ldim] > Rl[r_idx]) { break; }

      let b_jmp_prv = Js[rdir][ g_b_nxt[1] ][ g_b_nxt[0] ];

      if (cut_order[r_idx]) { guillotine_list.push( [b_jmp_nxt, b_jmp_prv] ); }
      else                  { guillotine_list.push( [b_jmp_prv, b_jmp_nxt] ); }

      b_jmp = b_jmp_nxt;
      g_b = g_b_nxt;
    }

    if (_debug) {
      console.log("r_idx:", r_idx, "idir:", idir, "::", guillotine_list);
    }

  }

  return guillotine_list;
}


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
//
function enumerateQuarrySideRegion(rprp_info, g_s, g_e, g_a, g_b, _debug) {

  _debug = ((typeof _debug === "undefined") ? false : _debug);

  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;

  let B = rprp_info.B;
  let B2d = rprp_info.B_2d;

  let Js = rprp_info.Js;

  // grid rectangle corners (ccw)
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

  // It's easier for me to think in a consistent 'left to right'
  // and 'down to up'. So we traverse the quarry rectangle
  // from left to right for the both the (1,0) line and the (2,3)
  // line.
  // This makes the range tests for Rl easier but it means
  // we have to potentially reverse the order of the guillotine
  // cut depending on which quarry side we're on.
  //

  let Rside_idir = [0,2,0,2];
  let oppo_idir = [ 1,0, 3,2 ];

  // single dimension crossing point
  //
  let Rl = [
    Rg[0][0], Rg[2][1],
    Rg[3][0], Rg[3][1]
  ];

  let g_beg = [
    Rg[1], Rg[1],
    Rg[2], Rg[0]
  ];

  let cut_order = [ 1, 0, 0, 1 ];

  for (let r_idx=0; r_idx<Rg.length; r_idx++) {

    if (_debug) {
      console.log("");
    }

    let g_r = g_beg[r_idx];
    let idir = Rside_idir[r_idx];
    let rdir = oppo_idir[idir];

    let b_jmp = B2d[ g_r[1] ][ g_r[0] ];
    if (b_jmp < 0) {
      b_jmp = Js[idir][ g_r[1] ][ g_r[0] ];
    }

    let g_b = B[b_jmp].ij;
    let guillotine_list = [];
    let ldim = r_idx % 2;

    if (_debug) {
      console.log("r_idx:", r_idx, "idir:", idir, "rdir:", rdir, "b_idx:", b_jmp, "g_b:", g_b, "ldim:", ldim);
    }

    while ((b_jmp >= 0) &&
           (g_b[ldim] <= Rl[r_idx])) {

      let b_jmp_nxt = Js[idir][ g_b[1] ][ g_b[0] ];
      if (b_jmp_nxt < 0) { break; }

      let g_b_nxt = B[b_jmp_nxt].ij;
      if (g_b_nxt[ldim] > Rl[r_idx]) { break; }

      let b_jmp_prv = Js[rdir][ g_b_nxt[1] ][ g_b_nxt[0] ];

      if (cut_order[r_idx]) { guillotine_list.push( [b_jmp_nxt, b_jmp_prv] ); }
      else                  { guillotine_list.push( [b_jmp_prv, b_jmp_nxt] ); }

      b_jmp = b_jmp_nxt;
      g_b = g_b_nxt;
    }

    if (_debug) {
      console.log("r_idx:", r_idx, "idir:", idir, "::", guillotine_list);
    }

  }

}


//------
//------
//------
//------
//------
//------
//------

function _ijpoint_inside_spot_test() {
  let grid_info = rectilinearGridPoints(pgn_pinwheel1);

  console.log("pgn_pinwheel1:");
  console.log(pgn_pinwheel1);
  console.log("----");

  _print_grid_info(grid_info);
  console.log("");


  let _gpnt = [3,4];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 16, 11, [2,3]) );

  _gpnt = [3,4];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 11, 16, [2,3]) );

  _gpnt = [2,2];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 16, 11, [2,3]) );

  _gpnt = [0,1];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 16, 11, [2,3]) );

  _gpnt = [1,1];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 16, 11, [2,3]) );



  _gpnt = [2,3];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 1, 14, [3,2]) );

  _gpnt = [2,3];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 14, 1, [3,2]) );


  _gpnt = [2,3];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 1, 11, [4,2]) );

  _gpnt = [2,3];
  console.log("g:", _gpnt, "-->", ijpoint_inside_cut_region(grid_info, _gpnt, 14, 1, [4,2]) );

}

function _main_foo() {
  let grid_info = RPRPInit(pgn_bottom_guillotine);

  let g_s = [-1,-1], g_e = [-1,-1], g_a = [-1,-1], g_b = [-1, -1];
  let cp;

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [5,5];
  console.log(g_s, g_e, g_a, g_b);

  cp = RPRPCleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  RPRP_enumerate_quarry_side_region(grid_info, g_s, g_e, g_a, g_b, true);

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [4,5];
  console.log(g_s, g_e, g_a, g_b);

  cp = RPRPCleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  RPRP_enumerate_quarry_side_region(grid_info, g_s, g_e, g_a, g_b, true);

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [13,5];

  console.log(g_s, g_e, g_a, g_b);

  cp = RPRPCleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  RPRP_enumerate_quarry_side_region(grid_info, g_s, g_e, g_a, g_b, true);

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [12,5];
  console.log(g_s, g_e, g_a, g_b);

  cp = RPRPCleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  RPRP_enumerate_quarry_side_region(grid_info, g_s, g_e, g_a, g_b, true);

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [9,5];

  console.log(g_s, g_e, g_a, g_b);

  cp = RPRPCleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  RPRP_enumerate_quarry_side_region(grid_info, g_s, g_e, g_a, g_b, true);


}



function __main_foo() {
  let grid_info = rectilinearGridPoints(pgn_bottom_guillotine);

  let g_s = [-1,-1], g_e = [-1,-1], g_a = [-1,-1], g_b = [-1, -1];
  let cp;

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [5,5];
  console.log(g_s, g_e, g_a, g_b);

  cp = cleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  enumerateQuarrySideRegion(grid_info, g_s, g_e, g_a, g_b, true);

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [4,5];
  console.log(g_s, g_e, g_a, g_b);

  cp = cleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  enumerateQuarrySideRegion(grid_info, g_s, g_e, g_a, g_b, true);

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [13,5];

  console.log(g_s, g_e, g_a, g_b);

  cp = cleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  enumerateQuarrySideRegion(grid_info, g_s, g_e, g_a, g_b, true);

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [12,5];
  console.log(g_s, g_e, g_a, g_b);

  cp = cleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  enumerateQuarrySideRegion(grid_info, g_s, g_e, g_a, g_b, true);

  console.log("===");

  g_s = [1,4]; g_e = [2,4];
  g_a = [1,4]; g_b = [9,5];

  console.log(g_s, g_e, g_a, g_b);

  cp = cleaveProfile(grid_info, g_s, g_e, g_a, g_b);
  enumerateQuarrySideRegion(grid_info, g_s, g_e, g_a, g_b, true);


}

function _main_example() {
  let grid_info = rectilinearGridPoints(pgn_pinwheel1);
  _print_grid_info(grid_info);
}

function _main_irect_contain_test() {
  let v = false;

  let grid_info_0 = rectilinearGridPoints(pgn_pinwheel1);
  v = _rprp_irect_contain_test(grid_info_0);

  console.log("pgn_pinwhee_0 contain (slow==fast):", v ? "pass" : "FAIL");
}

function _main_guillotine() {

  let grid_info_0 = RPRPInit(pgn_bottom_guilltine);
  RPRP_enumerate_quarry_side_region(grid_info_0, [2,4], [1,4], [1,4], [12,5]);

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

  if      (op == 'check')       { _main_checks(process.argv.slice(2)); }
  else if (op == 'example')     { _main_example(process.argv.slice(2)); }
  else if (op == 'ijspot')      { _ijpoint_inside_spot_test(); }
  else if (op == 'contain')     { _main_irect_contain_test(); }
  else if (op == 'guillotine')  { _main_guillotine(); }
  else if (op == 'foo')         { _main_foo(); }
  else if (op == 'rprpi')       { _main_rprpinit_test(); }
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
    "rectilinearGridPoints" : rectilinearGridPoints
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }
}


