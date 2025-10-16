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
//       ixy : x,y index of point
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

function _sfmt(v, s) {
  s = ((typeof s === "undefined") ? 0 : s);
  let a = [];
  for (let i=0; i<(s - v.length); i++) {
    a.push(" ");
  }
  a.push(v);

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

  console.log("# Jsx Jsy Jex Jey:");

  let idir_descr = [ "+x", "-x", "+y", "-y" ];

  for (let idir=0; idir<4; idir++) {

    console.log("## Jsx,Jsy[", idir_descr[idir], "]");

    for (let j=(grid_info.Gv.length-1); j>=0; j--) {
      let row_s = [];

      for (let i=0; i<grid_info.Gv[j].length; i++) {
        let jsx = grid_info.Jsx[idir][j][i];
        let jsy = grid_info.Jsy[idir][j][i];

        let a = ( (jsx < 0) ? _sp : _ifmt(jsx, _sw) );
        let b = ( (jsy < 0) ? _sp : _ifmt(jsy, _sw) );

        row_s.push( a + "," + b );
      }

      console.log( row_s.join("   ") );
    }
    console.log("");

    console.log("## Jex,Jey[", idir_descr[idir], "]");

    for (let j=(grid_info.Gv.length-1); j>=0; j--) {
      let row_s = [];

      for (let i=0; i<grid_info.Gv[j].length; i++) {
        let jex = grid_info.Jex[idir][j][i];
        let jey = grid_info.Jey[idir][j][i];

        let a = ( (jex < 0) ? _sp : _ifmt(jex, _sw) );
        let b = ( (jey < 0) ? _sp : _ifmt(jey, _sw) );

        row_s.push( a + "," + b );
      }

      console.log( row_s.join("   ") );
    }
    console.log("");
  }
  console.log("");


  console.log("# Sx Sy:");
  //let _sw = 2;
  //let _sp = _sfmt("", _sw);

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

// return the general boundary index that the ray starting at s_ij
// and in the direction of d_ij intersects.
//
// return -1 if an error (ray out of bounds, etc.)
//
function rprp_iray_boundary_intersection_linear(grid_info, s_ij, d_ij) {
  let Lx = grid_info.Lx,
      Ly = grid_info.Ly,
      Sx = grid_info.Sx,
      Sy = grid_info.Sy;

  let max_step = Math.max( Lx.length, Ly.length );

  let B2d = grid_info.B_2d;

  let cur_ij = [ s_ij[0], s_ij[1] ];

  for (let step = 0; step < max_step; step++) {
    if ( (cur_ij[0] < 0) || (cur_ij[0] >= Lx.length) ||
         (cur_ij[1] < 0) || (cur_ij[1] >= Ly.length) ) {
      return -1;
    }

    if (B2d[ cur_ij[1] ][ cur_ij[0] ] >= 0) {
      return B2d[ cur_ij[1] ][ cur_ij[0] ];
    }

    cur_ij[0] += d_ij[0];
    cur_ij[1] += d_ij[1];
  }

  return -1;
}

function _clamp(a, b, c) {
  if (a < b) { return b; }
  if (a > c) { return c; }
  return a;
}

// WIP!!!
// ROUGH DRAFT!!!
//
//
// As implemented:
// * assumes start point is on interior
// * gets furthest boundary
//
// We probably want nearest boundary.
// We're probably going to need to change the underlying structure.
//
function rprp_iray_boundary_intersection(grid_info, s_ij, d_ij) {
  let Lx = grid_info.Lx,
      Ly = grid_info.Ly,
      Sx = grid_info.Sx,
      Sy = grid_info.Sy;
  let B2d = grid_info.B_2d;

  let dir_idx = 0;

  let _L = Lx;
  let _S = Sx;
  if (d_ij[0] == 0) {
    _L = Ly;
    _S = Sy;
    dir_idx = 1;
  }

  let max_step = Math.max( Lx.length, Ly.length );

  let cur_ij = [ s_ij[0], s_ij[1] ];
  let step_ij = [ d_ij[0] * Lx.length, d_ij[1] * Ly.length ];

  let end_ij = [
    _clamp( s_ij[0] + step_ij[0], 0, Lx.length-1 ),
    _clamp( s_ij[1] + step_ij[1], 0, Ly.length-1 )
  ];

  let e_ij = [ end_ij[0], end_ij[1] ];

  let ub = abs_sum_v( v_sub( end_ij, s_ij ) );
  let lb = 0;

  //DEBUG
  //DEBUG
  //DEBUG
  let _dbg_p = [4,2],
      _dbg_d = [1,0];

  if ((s_ij[0] == _dbg_p[0]) && (s_ij[1] == _dbg_p[1]) && (d_ij[0]==_dbg_d[0]) && (d_ij[1] == _dbg_d[1])) {
    console.log(">>>", "s_ij:", s_ij, "e_ij:", e_ij, "d_ij:", d_ij, "ulb:", ub, lb);
  }

  //DEBUG
  //DEBUG
  //DEBUG


  while ((ub - lb) > 1) {
    let d_len = _L[ end_ij[dir_idx] ] - _L[ s_ij[dir_idx] ];
    let s_len = _S[ end_ij[1] ][ end_ij[0] ] - _S[ s_ij[1] ][ s_ij[0] ];

    let ds = Math.floor((ub - lb)/2);

    //DEBUG
    //DEBUG
    //DEBUG
    if ((s_ij[0] == _dbg_p[0]) && (s_ij[1] == _dbg_p[1]) && (d_ij[0]==_dbg_d[0]) && (d_ij[1] == _dbg_d[1])) {
      console.log("  >>>", "ulb:", ub, lb, "ds:", ds, "d_len:", d_len, "s_len:", s_len, "end_ij:", end_ij[0], end_ij[1],
        "_S[][]:", _S[ end_ij[1] ][ end_ij[0] ] , _S[ s_ij[1] ][ s_ij[0] ]);
    }
    //DEBUG
    //DEBUG
    //DEBUG


    if ( (_S[end_ij[1]][end_ij[0]] < 0) ||
         (s_len > d_len) ) {
      ub = ub - ds;
      //end_ij[0] = e_ij[0] - (ds-1)*d_ij[0];
      //end_ij[1] = e_ij[1] - (ds-1)*d_ij[1];
      end_ij[0] = s_ij[0] + ds*d_ij[0];
      end_ij[1] = s_ij[1] + ds*d_ij[1];



      if ((s_ij[0] == _dbg_p[0]) && (s_ij[1] == _dbg_p[1]) && (d_ij[0]==_dbg_d[0]) && (d_ij[1] == _dbg_d[1])) {
        console.log("  ... ub:", ub);
      }

    }
    else {
      lb = lb + ds;
      end_ij[0] = s_ij[0] + ds*d_ij[0];
      end_ij[1] = s_ij[1] + ds*d_ij[1];

      if ((s_ij[0] == _dbg_p[0]) && (s_ij[1] == _dbg_p[1]) && (d_ij[0]==_dbg_d[0]) && (d_ij[1] == _dbg_d[1])) {
        console.log("  ... lb:", lb);
      }
    }

    /*
    if (s_len == d_len) {
      lb = lb + ds;
      end_ij[0] = s_ij[0] + ds*d_ij[0];
      end_ij[1] = s_ij[1] + ds*d_ij[1];
    }
    else {
      ub = ub - ds;
      end_ij[0] = e_ij[0] - (ds-1)*d_ij[0];
      end_ij[1] = e_ij[1] - (ds-1)*d_ij[1];
    }
    */


  }

  if (d_ij[dir_idx] < 0) {

    for (let i=ub; i>=lb; i--) {
      cur_ij[0] = s_ij[0] + i*d_ij[0];
      cur_ij[1] = s_ij[1] + i*d_ij[1];

      if (B2d[ cur_ij[1] ][ cur_ij[0] ] >= 0) {
        return B2d[ cur_ij[1] ][ cur_ij[0] ];
      }

    }

  }
  else {

    for (let i=lb; i<=ub; i++) {
      cur_ij[0] = s_ij[0] + i*d_ij[0];
      cur_ij[1] = s_ij[1] + i*d_ij[1];

      if ((s_ij[0] == _dbg_p[0]) && (s_ij[1] == _dbg_p[1]) && (d_ij[0]==_dbg_d[0]) && (d_ij[1] == _dbg_d[1])) {
        console.log("  ...", "cur_ij:", cur_ij, "B2d[][]:", B2d[cur_ij[1]][cur_ij[0]] );
      }

      if (B2d[ cur_ij[1] ][ cur_ij[0] ] >= 0) {
        return B2d[ cur_ij[1] ][ cur_ij[0] ];
      }

    }
  }


  return -1;
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

  // linear checks still need work as they could cross
  // boundaries but still be valid Gv points.
  // I'm assuming rectangles are at least 2 grid points
  // in each dimension, which means we can use the dual
  // to do the slow test.
  // Maybe in the fiture I'll revisit it...
  //
  /*
  if (l_ij[0] == 1) {
    let prv_bid = B_2d[s_ij[1]][s_ij[0]];
    for (let j=(s_ij[1]+1); j<(s_ij[1] + l_ij[1]); j++) {
      let cur_bid = B_2d[j][ s_ij[0] ];
      if ( Math.abs( prv_bid - cur_bid ) > 1 ) { return false; }
      prv_bid = cur_bid;
    }
    return true;
  }

  if (l_ij[1] == 1) {
    let prv_bid = B_2d[s_ij[1]][s_ij[0]];
    for (let i=(s_ij[0]+1); i<(s_ij[0] + l_ij[0]); i++) {
      let cur_bid = B_2d[ s_ij[1] ][ i ];
      if ( Math.abs( prv_bid - cur_bid ) > 1 ) { return false; }
      prv_bid = cur_bid;
    }
    return true;
  }
  */

  let nx = l_ij[0]-1;
  let ny = l_ij[1]-1;

  for (let j=s_ij[1]; j<(s_ij[1] + ny); j++) {
    for (let i=s_ij[0]; i<(s_ij[0] + nx); i++) {
      if (dualG[j][i].id < 0) { return false; }
    }
  }
  return true;
}

function _rprp_irect_contain_test(grid_info) {

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


            console.log("!!!!", s_ij, l_ij, slow, fast);

            return false;
          }
        }
      }

    }
  }

  return true;
}

//---

function rprp_init(rl_pgn) {
}

function rectilinearGridPoints(_rl_pgon) {
  let _eps = (1/(1024));

  let x_dup = [],
      y_dup = [];

  let pnt_map = {};
  let corner_type = [];

  if (_rl_pgon.length == 0) { return []; }

  let rl_pgon = orderCounterclockwise( _rl_pgon );

  let n = rl_pgon.length;

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

      dualG[j].push( {"ixy":[i,j], "G_idx": g_idx, "id": -1 } );
    }
  }


  let dualG_ele_idx = 0;

  for (let j=0; j<dualG.length; j++) {
    for (let i=0; i< dualG[j].length; i++) {
      let dg = dualG[j][i];

      let ixy = dg.ixy;

      if ((ixy[0] >= (x_dedup.length-1)) ||
          (ixy[1] >= (y_dedup.length-1))) { continue; }

      let R = [
        [ x_dedup[ixy[0]],      y_dedup[ixy[1]] ],
        [ x_dedup[ixy[0] + 1],  y_dedup[ixy[1]] ],
        [ x_dedup[ixy[0] + 1],  y_dedup[ixy[1] + 1] ],
        [ x_dedup[ixy[0]],      y_dedup[ixy[1] + 1] ]
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

      dualCell.push({"R": R, "midpoint": mp, "ixy": [i,j]});

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

    let cur_ixy = Gv_bp[ c_cur_key ];
    let nxt_ixy = Gv_bp[ c_nxt_key ];

    let n_m_c_ixy = v_sub(nxt_ixy, cur_ixy);
    let d = abs_sum_v(n_m_c_ixy );
    let dxy = v_delta( n_m_c_ixy );

    let _ixy = [ cur_ixy[0], cur_ixy[1] ];
    for (i=0; i<d; i++) {

      let g = Gv[ _ixy[1] ][ _ixy[0] ];

      B.push( { "xy": [ g.xy[0], g.xy[1] ], "ixy": [ _ixy[0], _ixy[1] ], "t": g.t, "b_id": _b_id } );
      B_2d[ _ixy[1] ][ _ixy[0] ] = _b_id;

      _b_id++;

      _ixy = v_add( _ixy, dxy );
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

    let prv_ixy = B[idx_prv].ixy;
    let cur_ixy = B[idx].ixy;
    let nxt_ixy = B[idx_nxt].ixy;

    let prv_xy = B[idx_prv].xy;
    let cur_xy = B[idx].xy;
    let nxt_xy = B[idx_nxt].xy;


    let _i = cur_ixy[0];
    let _j = cur_ixy[1];

    let _u = v_sub( cur_ixy, prv_ixy );
    let _v = v_sub( nxt_ixy, cur_ixy );

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

      //if (Sx[j][i] == -2) { Sx[j][i] = Sx[j][i-1]; }
      //else                { Sx[j][i] = Lx[i] - x_start; }
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


      //if (Sy[j][i] == -2) { Sy[j][i] = Sy[j-1][i]; }
      //else                { Sy[j][i] = Ly[j] - y_start; }
      Sy[j][i] = Ly[j] - y_start;
    }
  }


  // Jx Jy structures
  //

  let Jsx = [ [], [], [], [] ],
      Jex = [ [], [], [], [] ],
      Jsy = [ [], [], [], [] ],
      Jey = [ [], [], [], [] ];

  for (let j=0; j<Gv.length; j++) {
    for (let i=0; i<Gv[j].length; i++) {
      for (let idir=0; idir<4; idir++) {

        if (i==0) {
          Jsx[idir].push([]);
          Jex[idir].push([]);
          Jsy[idir].push([]);
          Jey[idir].push([]);
        }

        Jsx[idir][j].push(-1);
        Jex[idir][j].push(-1);

        Jsy[idir][j].push(-1);
        Jey[idir][j].push(-1);

      }
    }
  }


  //WIP!!!!
  // the question is what kind of api do I want to enable.
  // I want fast lookups to find the nearest and most distant
  // boundary edge from an axis aligned ray.
  // One question is whether I want the 

  let idir_dxy = [ [1,0], [-1,0], [0,1], [0,-1] ];
  let _ibound = [
    [ [Gv[0].length-1, 0, -1], [0,Gv.length-1,1] ],
    [ [0, Gv[0].length-1, 1], [0,Gv.length-1,1] ],
    [ [0, Gv[0].length-1, 1], [Gv.length-1,0,-1] ],
    [ [0, Gv[0].length-1, 1], [0,Gv.length-1,1] ]
  ];

  //-----------------------------------------------------
  // p - parity, a - afar, n - near
  //
  //
  //                  +x        -x        +y        -y
  // idx  prv nxt   p  a  n   p  a  n   p  a  n   p  a  n
  //  0    0   0    .  .  .   .  .  .
  //  1    1   1    .  .  .   .  .  .
  //  2    2   2    1 -1 -1   0  B  B
  //  3    3   3    0  B  B   
  //  4    0   2    1  B  B
  //  5    0   3    1  .  .
  //  6    1   2    1  .  B
  //  7    1   3    0 -1 -1
  //  8    2   0    1  .  B
  //  9    2   1    1  B  B
  //  10   3   0    0 -1 -1
  //  11   3   1    .  .  .
  //
  // Note that the walk is in the opposite direction of the ray,
  // so +x above is indicating the ray is shotting in the +x direction
  // but we look at transitions walking from right to left.
  //
  //-----------------------------------------------------

  let _idir2lu = [
    [  0, -1,  4,  5 ],
    [ -1,  1,  6,  7 ],
    [  8,  9,  2, -1 ],
    [ 10, 11, -1,  3 ]
  ];

  let _lu = [
    [ "...", "...", "1--", "0BB", "1BB", "1..", "1.B", "0--", "1.B", "1BB", "0--", "..." ],

    [ "...", "...", "1--", "0BB", "1BB", "1..", "1.B", "0--", "1.B", "1BB", "0--", "..." ],
    [ "...", "...", "1--", "0BB", "1BB", "1..", "1.B", "0--", "1.B", "1BB", "0--", "..." ],
    [ "...", "...", "1--", "0BB", "1BB", "1..", "1.B", "0--", "1.B", "1BB", "0--", "..." ]
  ];

  let idir = 0;
  let _dxy = idir_dxy[idir];

  for (let j=0; j<Gv.length; j++) {

    let _parity = 0;
    let afar_B_idx = -1,
        near_B_idx = -1;

    for (let i=(Gv[j].length-1); i>=0; i--) {

      Jex[idir][j][i] = afar_B_idx;
      Jsx[idir][j][i] = near_B_idx;

      if (B_2d[j][i] >= 0) {


        let cur_B_idx = B_2d[j][i];
        let cur_B_ixy = B[cur_B_idx].ixy;
        let prv_B_ixy = B[(cur_B_idx-1 + B.length) % B.length].ixy;
        let nxt_B_ixy = B[(cur_B_idx+1) % B.length].ixy;

        let _dprv = v_sub( cur_B_ixy, prv_B_ixy );
        let _dnxt = v_sub( nxt_B_ixy, cur_B_ixy );

        let _dnp = dot_v( _dnxt, _dprv );

        // in-line, bottom outside
        //
        if      ( (_dprv[0] ==  1) && (_dprv[1] ==  0) &&
                  (_dnxt[0] ==  1) && (_dnxt[1] ==  0) ) {
        }

        // in-line, top outside
        //
        else if ( (_dprv[0] == -1) && (_dprv[1] ==  0) &&
                  (_dnxt[0] == -1) && (_dnxt[1] ==  0) ) {
        }

        // in-line, right outside
        //
        else if ( (_dprv[0] ==  0) && (_dprv[1] ==  1) &&
                  (_dnxt[0] ==  0) && (_dnxt[1] ==  1) ) {
          _parity = 1;
          afar_B_idx = cur_B_idx;
          near_B_idx = cur_B_idx;
        }

        // in-line, left outside
        //
        else if ( (_dprv[0] ==  0) && (_dprv[1] == -1) &&
                  (_dnxt[0] ==  0) && (_dnxt[1] == -1) ) {
          _parity = 0;
          afar_B_idx = -1;
          near_B_idx = -1;
        }


        // bend, lower right outside
        //
        else if ( (_dprv[0] ==  1) && (_dprv[1] ==  0) &&
                  (_dnxt[0] ==  0) && (_dnxt[1] ==  1) ) {
          _parity = 1;
          afar_B_idx = cur_B_idx;
          near_B_idx = cur_B_idx;
        }

        // bend, lower left outside
        //
        else if ( (_dprv[0] ==  1) && (_dprv[1] ==  0) &&
                  (_dnxt[0] ==  0) && (_dnxt[1] == -1) ) {
          _parity = 1;
        }

        // bend, upper right outside
        //
        else if ( (_dprv[0] == -1) && (_dprv[1] ==  0) &&
                  (_dnxt[0] ==  0) && (_dnxt[1] ==  1) ) {
          _parity = 1;
          near_B_idx = cur_B_idx;
        }

        // bend, upper left outside
        //
        else if ( (_dprv[0] == -1) && (_dprv[1] ==  0) &&
                  (_dnxt[0] ==  0) && (_dnxt[1] == -1) ) {
          _parity = 0;
          afar_B_idx = -1;
          near_B_idx = -1;
        }


        // bend, lower right outside
        //
        else if ( (_dprv[0] ==  0) && (_dprv[1] ==  1) &&
                  (_dnxt[0] ==  1) && (_dnxt[1] ==  0) ) {
          _parity = 1;
          near_B_idx = cur_B_idx;
        }

        // bend, upper right outside
        //
        else if ( (_dprv[0] ==  0) && (_dprv[1] ==  1) &&
                  (_dnxt[0] == -1) && (_dnxt[1] ==  0) ) {
          _parity = 1;
          near_B_idx = cur_B_idx;
          afar_B_idx = cur_B_idx;
        }

        // bend, lower left outside
        //
        else if ( (_dprv[0] ==  0) && (_dprv[1] == -1) &&
                  (_dnxt[0] ==  1) && (_dnxt[1] ==  0) ) {
          _parity = 0;
          near_B_idx = -1;
          afar_B_idx = -1;
        }

        // bend, upper left outside
        //
        else if ( (_dprv[0] ==  0) && (_dprv[1] == -1) &&
                  (_dnxt[0] == -1) && (_dnxt[1] ==  0) ) {
        }


        //console.log("### cur_B_idx:", cur_B_idx, "prv_B_idx:", prv_B_idx, "nxt_B_idx:", nxt_B_idx);
        console.log("### cur_B_ixy:", cur_B_ixy, "prv_B_ixy:", prv_B_ixy, "nxt_B_ixy:", nxt_B_ixy);

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

    "Jsx" : Jsx,
    "Jsy" : Jsy,
    "Jex" : Jex,
    "Jey" : Jey

  };
}

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

// CRUFT!!
// this will need to change, vestigae of a failed attempt
//
function addRegionGuillotine(grid_ctx, g_s_idx, g_e_idx) {
  let _debug = 1;
  let _eps = (1/1024);

  let G = grid_ctx.G;
  let Gt = grid_ctx.Gt;
  let dualG = grid_ctx.dualG;
  let G_dualG_map = grid_ctx.G_dualG_map;

  if (_debug) { console.log("#### guillotine g_se:", g_s_idx, g_e_idx, "(", G[g_s_idx], G[g_e_idx], ")"); }

  let s_xy  = G[g_s_idx];
  let s_t   = Gt[g_s_idx];

  let e_xy  = G[g_e_idx];
  let e_t   = Gt[g_e_idx];

  let L_dxy = v_sub(e_xy, s_xy);
  let L_dir = v_delta(L_dxy);

  let s_ij = G_dualG_map[ _xyKey(s_xy) ];
  let e_ij = G_dualG_map[ _xyKey(e_xy) ];

  let L_seg = [ s_xy, e_xy ];
  let iL_seg = [ s_ij, e_ij ];

  if ((iL_seg[0][0] > iL_seg[1][0]) ||
      (iL_seg[0][1] > iL_seg[1][1])) {
    let t = iL_seg[0];
    iL_seg[0] = iL_seg[1];
    iL_seg[1] = t;
  }


  if (_debug) {
    console.log("#### L_seg:", L_seg, "iL_seg:", iL_seg);
  }

  let Gflood = [];
  for (let j=0; j<dualG.length; j++) {
    Gflood.push([]);
    for (let i=0; i<dualG[j].length; i++) {
      Gflood[j].push( ((dualG[j][i].id < 0) ? -2 : -1) );
    }
  }

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let iBB = [
    [ [0,0], [0,0] ],
    [ [0,0], [0,0] ]
  ];

  let L_ortho = ( ( Math.abs(L_dxy[0]) < _eps ) ?  [1, 0] : [0,1] );

  for (let flood_id=0; flood_id<2; flood_id++) {

    // arg...
    //let dir_sign = ((flood_id == 0) ? -1 : 1)
    let dir_sign = ((flood_id == 0) ? -1 : 0)
    //let dir_sign = ((flood_id == 0) ? 1 : 0)

    let q_ij = [ [ iL_seg[0][0] + (dir_sign*L_ortho[0]), iL_seg[0][1] + (dir_sign*L_ortho[1]) ] ];

    _BBInit( iBB[flood_id], q_ij[0][0], q_ij[0][1] );

    if (_debug > 1) {
      console.log("iBB[", flood_id, "] init:", iBB[flood_id], "(", q_ij[0][0], q_ij[0][1], ")");
    }

    while (q_ij.length > 0) {
      let c_ij = q_ij.pop();

      if (Gflood[ c_ij[1] ][ c_ij[0] ] >= 0) { continue; }

      Gflood[ c_ij[1] ][ c_ij[0] ] = flood_id;

      _BBUpdate( iBB[flood_id], c_ij[0], c_ij[1] );

      if (_debug > 1) {
        console.log("iBB[", flood_id, "] update:", iBB[flood_id], "(", c_ij[0], c_ij[1], ")");
      }

      for (let idir=0; idir<idir_dxy.length; idir++) {
        let dxy = idir_dxy[idir];

        let nei_ij = v_add(c_ij, dxy);

        // oob, already visited or inadmissible
        //
        if ((nei_ij[1] < 0) ||
            (nei_ij[1] >= Gflood.length) ||
            (nei_ij[0] < 0) ||
            (nei_ij[0] >= Gflood[ nei_ij[1] ].length)) {
          continue;
        }

        if (Gflood[ nei_ij[1] ][ nei_ij[0] ] >= 0) {
          continue;
        }

        if (dualG[ nei_ij[1] ][ nei_ij[0] ].id < 0) {
          continue;
        }

        // check to see if it crosses the horizontal or vertical
        // cut line segment
        //
        if ( L_ortho[1] > _eps ) {

          if ( (c_ij[0] >= iL_seg[0][0]) &&
               (c_ij[0] < iL_seg[1][0]) &&
               (nei_ij[0] >= iL_seg[0][0]) &&
               (nei_ij[0] < iL_seg[1][0]) ) {

            let s2 = [
              (c_ij[1] >= iL_seg[0][1]) ? 1 : -1,
              (nei_ij[1] >= iL_seg[0][1]) ? 1 : -1,
            ];

            if (s2[0] != s2[1]) { continue; }

          }

        }

        else {

          if ( (c_ij[1] >= iL_seg[0][1]) &&
               (c_ij[1] < iL_seg[1][1]) &&
               (nei_ij[1] >= iL_seg[0][1]) &&
               (nei_ij[1] < iL_seg[1][1]) ) {

            let s2 = [
              (c_ij[0] >= iL_seg[0][0]) ? 1 : -1,
              (nei_ij[0] >= iL_seg[0][0]) ? 1 : -1,
            ];

            if (s2[0] != s2[1]) { continue; }

          }

        }

        q_ij.push( nei_ij );

      }

    }

  }

  if (_debug) {
    console.log("Gflood:");
    for (let j=(Gflood.length-1); j>=0; j--) {
      let a = [];
      for (let i=0; i<Gflood[j].length; i++) {
        a.push( _ifmt(Gflood[j][i], 2) );
      }
      console.log( a.join(" ") );
    }
  }


  let regions_id = [ [], [] ];

  for (let j=0; j<Gflood.length; j++) {
    for (let i=0; i<Gflood[j].length; i++) {
      if (Gflood[j][i] < 0) { continue; }
      regions_id[ Gflood[j][i] ].push( dualG[j][i].id );
    }
  }

  let a0 = ((iBB[0][1][0] - iBB[0][0][0] + 1)*(iBB[0][1][1] - iBB[0][0][1] + 1));
  let a1 = ((iBB[1][1][0] - iBB[1][0][0] + 1)*(iBB[1][1][1] - iBB[1][0][1] + 1));

  let shape = [
    (a0 == regions_id[0].length) ? 'U' : 'Z',
    (a1 == regions_id[1].length) ? 'U' : 'Z',
  ];

  let regions_key = [
    regions_id[0].map( function(_v) { return _v.toString(); } ).join(","),
    regions_id[1].map( function(_v) { return _v.toString(); } ).join(",")
  ];

  if (_debug) {
    console.log("#### iBB:", JSON.stringify(iBB));
    console.log("#### [", regions_key[0], "], [", regions_key[1], "] (", shape, ")", "(", a0, a1, ")", JSON.stringify(iBB));
  }

  return { "region": regions_id, "region_key":regions_key, "shape": shape };
}


// CRUFT!!
// this will need to change, vestigae of a failed attempt
//
// three grid point indices are specified, representing the start,
// mid (internal) and end grid point.
//
// From these, a horizontal and vertical line segment are determined.
//
// The index dual grid is then flood filled with a flood id.
// Simple left/right cuts aren't sufficient as the line segment
// cuts could only carve out a small region and other areas
// of the rectilinear polygon could snake around.
//
// Flood fill is done by checking to make sure neighbors stay
// within index grid bounds, don't traverse into an inadmissible cell
// and haven't already been allocated.
// Assuming all these basic checks pass, the current flood point
// is checked against its neighbor to see if it crosses one of the
// line segments.
// If it doesn't add it to the flood queue and proceed.
//
// After the flood fill, regions are collected and an area check
// is done against the index bounding box to see if it's a simple
// rectangle (shape code 'U' for simple rectangle, 'Z' for non-simple
// rectangle).
//
// returns:
// {
//   region : [ <array of dual cell id>, <array of dual cell id> ]
//   region_key : [ <string of first region>, <string of second region> ]
//   shape : [ <shape code of first region>, <shape code of second region> ]
// }
//
function addRegionTwoCut(grid_ctx, g_s_idx, g_m_idx, g_e_idx) {
  let _debug = 1;
  let _eps = (1/1024);

  let G = grid_ctx.G;
  let Gt = grid_ctx.Gt;
  let dualG = grid_ctx.dualG;
  let G_dualG_map = grid_ctx.G_dualG_map;

  if (_debug) { console.log("#### 2-cut g_sme:", g_s_idx, g_m_idx, g_e_idx, "(", G[g_s_idx], G[g_m_idx], G[g_e_idx], ")"); }

  let s_xy  = G[g_s_idx];
  let s_t   = Gt[g_s_idx];

  let m_xy  = G[g_m_idx];
  let m_t   = Gt[g_m_idx];

  let e_xy  = G[g_e_idx];
  let e_t   = Gt[g_e_idx];

  let L_dxy = v_sub(m_xy, s_xy);
  let S_dxy = v_sub(e_xy, m_xy);

  let s_ij = G_dualG_map[ _xyKey(s_xy) ];
  let m_ij = G_dualG_map[ _xyKey(m_xy) ];
  let e_ij = G_dualG_map[ _xyKey(e_xy) ];


  let H_seg = [ s_xy, m_xy ];
  let V_seg = [ m_xy, e_xy ];

  let iH_seg = [ s_ij, m_ij ];
  let iV_seg = [ m_ij, e_ij ];

  if ( Math.abs(L_dxy[0]) < _eps ) {
    H_seg = [ m_xy, e_xy ];
    V_seg = [ s_xy, m_xy ];

    iH_seg = [ m_ij, e_ij ];
    iV_seg = [ s_ij, m_ij ];
  }

  if (iH_seg[0][0] > iH_seg[1][0]) {
    let t = iH_seg[0];
    iH_seg[0] = iH_seg[1];
    iH_seg[1] = t;
  }

  if (iV_seg[0][1] > iV_seg[1][1]) {
    let t = iV_seg[0];
    iV_seg[0] = iV_seg[1];
    iV_seg[1] = t;
  }

  if (_debug) {
    console.log("#### H_seg:", H_seg, "V_seg:", V_seg, "iH_seg:", iH_seg, "iV_seg:", iV_seg);
  }

  let Gflood = [];
  for (let j=0; j<dualG.length; j++) {
    Gflood.push([]);
    for (let i=0; i<dualG[j].length; i++) {
      Gflood[j].push( ((dualG[j][i].id < 0) ? -2 : -1) );
    }
  }

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let iBB = [
    [ [0,0], [0,0] ],
    [ [0,0], [0,0] ]
  ];

  for (let flood_id=0; flood_id<2; flood_id++) {

    //let dx = ((flood_id == 0) ? -1 : 1)
    let dx = ((flood_id == 0) ? -1 : 0)
    let q_ij = [ [ iV_seg[0][0] + dx, iV_seg[0][1] ] ];

    _BBInit( iBB[flood_id], q_ij[0][0], q_ij[0][1] );

    if (_debug > 1) {
      console.log("iBB[", flood_id, "] init:", iBB[flood_id], "(", q_ij[0][0], q_ij[0][1], ")");
    }

    while (q_ij.length > 0) {
      let c_ij = q_ij.pop();

      if (Gflood[ c_ij[1] ][ c_ij[0] ] >= 0) { continue; }

      Gflood[ c_ij[1] ][ c_ij[0] ] = flood_id;

      _BBUpdate( iBB[flood_id], c_ij[0], c_ij[1] );

      if (_debug > 1) {
        console.log("iBB[", flood_id, "] update:", iBB[flood_id], "(", c_ij[0], c_ij[1], ")");
      }

      for (let idir=0; idir<idir_dxy.length; idir++) {
        let dxy = idir_dxy[idir];

        let nei_ij = v_add(c_ij, dxy);

        // oob, already visited or inadmissible
        //
        if ((nei_ij[1] < 0) ||
            (nei_ij[1] >= Gflood.length) ||
            (nei_ij[0] < 0) ||
            (nei_ij[0] >= Gflood[ nei_ij[1] ].length)) {
          continue;
        }

        if (Gflood[ nei_ij[1] ][ nei_ij[0] ] >= 0) {
          continue;
        }

        if (dualG[ nei_ij[1] ][ nei_ij[0] ].id < 0) {
          continue;
        }

        // check to see if it crosses the horizontal or vertical
        // cut line segment
        //
        if ( (c_ij[0] >= iH_seg[0][0]) &&
             (c_ij[0] < iH_seg[1][0]) &&
             (nei_ij[0] >= iH_seg[0][0]) &&
             (nei_ij[0] < iH_seg[1][0]) ) {

          let s2 = [
            (c_ij[1] >= iH_seg[0][1]) ? 1 : -1,
            (nei_ij[1] >= iH_seg[0][1]) ? 1 : -1,
          ];

          if (s2[0] != s2[1]) { continue; }

        }

        if ( (c_ij[1] >= iV_seg[0][1]) &&
             (c_ij[1] < iV_seg[1][1]) &&
             (nei_ij[1] >= iV_seg[0][1]) &&
             (nei_ij[1] < iV_seg[1][1]) ) {

          let s2 = [
            (c_ij[0] >= iV_seg[0][0]) ? 1 : -1,
            (nei_ij[0] >= iV_seg[0][0]) ? 1 : -1,
          ];

          if (s2[0] != s2[1]) { continue; }

        }

        q_ij.push( nei_ij );

      }

    }

  }

  if (_debug) {
    console.log("Gflood:");
    for (let j=(Gflood.length-1); j>=0; j--) {
      let a = [];
      for (let i=0; i<Gflood[j].length; i++) {
        a.push( _ifmt(Gflood[j][i], 2) );
      }
      console.log( a.join(" ") );
    }
  }


  let regions_id = [ [], [] ];

  for (let j=0; j<Gflood.length; j++) {
    for (let i=0; i<Gflood[j].length; i++) {
      if (Gflood[j][i] < 0) { continue; }
      regions_id[ Gflood[j][i] ].push( dualG[j][i].id );
    }
  }

  let a0 = ((iBB[0][1][0] - iBB[0][0][0] + 1)*(iBB[0][1][1] - iBB[0][0][1] + 1));
  let a1 = ((iBB[1][1][0] - iBB[1][0][0] + 1)*(iBB[1][1][1] - iBB[1][0][1] + 1));

  let shape = [
    (a0 == regions_id[0].length) ? 'U' : 'Z',
    (a1 == regions_id[1].length) ? 'U' : 'Z',
  ];

  let regions_key = [
    regions_id[0].map( function(_v) { return _v.toString(); } ).join(","),
    regions_id[1].map( function(_v) { return _v.toString(); } ).join(",")
  ];

  if (_debug) {
    console.log("#### iBB:", JSON.stringify(iBB));
    console.log("#### [", regions_key[0], "], [", regions_key[1], "] (", shape, ")", "(", a0, a1, ")", JSON.stringify(iBB));
  }

  return { "region": regions_id, "region_key":regions_key, "shape": shape };

}

// CRUFT!!
// vestigae of a failed attempt
//
function cataloguePartitions( grid_ctx ) {
  let _eps = (1/1024);

  let debug = true;

  let C = grid_ctx.C;
  let Ct = grid_ctx.Ct;
  let G = grid_ctx.G;
  let Gt = grid_ctx.Gt;
  let X = grid_ctx.X;
  let Y = grid_ctx.Y;
  let dualG = grid_ctx.dualG;

  let Gv = grid_ctx.Gv;
  let Gv_bp = grid_ctx.Gv_bp;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];


  let raw_regions = [];

  // Go through each point on the boundary.
  //
  // If it's a reflex vertex (convex w.r.t. interior), cast a ray out
  // in the opposite direction if its two neighboring boundary points.
  //
  // The first ray is called the 'l' line segment.
  //
  // If l end hits a boundary, either another reflex or edge,
  // tie it off and add the two sub polygons to the region list.
  //
  // If the l end hits an interior point, cast an 's' ray out in the two
  // orthogonal directions.
  //
  // If the s end hits an interior point, ignore and continue
  // If the s end hits an edge, ignore and stop
  // If the s end hits a reflex vertex, add the two polygons
  // to the region list.
  //
  // If the single l line segment hits a boundary, since it's anchored
  // at a reflex vertex it could be part of the optimal solution, so
  // we add the polygon subdivisions to the catalgoue.
  //
  // If the second s line segment hits an edge of the boundary but
  // not a reflex vertex, this represents a potentially unachored
  // line segment and might not be part of an optimal solution.
  // For the case of an s line segments that does hit an edge (but
  // not a reflex) boundary that *is* part of the optimal solution,
  // this case will be handled by the straight l line segment
  // originating from a reflex, so we can safely ignore it
  // coming from s since its handled by the l ray casting.
  //
  // Whether we're partioning the polygon by a single l line
  // or by the two l,s lines, the partitioned rectangles both
  // have a contiguous portion of the original C rectilinear polygon
  // perimeter.
  // The contiguous portion of the perimeter alone does not provide
  // us enough information to reconstruct the polygon partition, as there
  // are multiple partitions that have the same perimeter sweep,
  // but the number of possibilities is small and bounded
  // (max of 2? worst case when there are two reflex vertices
  // with two choices for the partition?).
  //
  // The purpose of this function is to catalogue the polygon
  // partitions but this information will be used later
  // to recursively calculate the value of the polygon
  // partition by calculating the edge cost of simple
  // rectangles, then filling in more complex polygonal
  // regions as they turn into simple rectangles.
  //
  for (let c_idx=0; c_idx < C.length; c_idx++) {

    let c_xy = C[c_idx];
    let c_type = Ct[c_idx];

    if (debug) {
      console.log("...", c_xy, c_type);
    }

    if (c_type != 'r') { continue; }


    let _key = c_xy[0].toString() + "," + c_xy[1].toString();
    let src_ixy = Gv_bp[_key];

    if (debug) {
      console.log(">>> c_idx:", c_idx, c_type, "src_ixy:", src_ixy);
    }

    let l_dxy_choice = [
      v_delta( v_sub( C[c_idx], C[(c_idx+C.length-1)%C.length] ) ),
      v_delta( v_sub( C[c_idx], C[(c_idx+1)%C.length] ) )
    ];

    for (let l_dxy_choice_idx=0; l_dxy_choice_idx < l_dxy_choice.length; l_dxy_choice_idx++) {
      let l_dxy = l_dxy_choice[ l_dxy_choice_idx ];
      let l_ixy = [ src_ixy[0] + l_dxy[0], src_ixy[1] + l_dxy[1] ];

      let ls_g_idx = Gv[ src_ixy[1] ][ src_ixy[0] ].G_idx;

      let s_dxy_choice = [];
      for (let idir=0; idir < 4; idir++) {
        if ( Math.abs(dot_v( idir_dxy[idir], l_dxy )) > _eps ) { continue; }
        s_dxy_choice.push( idir_dxy[idir] );
      }

      if (debug) { console.log(" __ l_dxy:", l_dxy, "l_ixy", l_ixy); }

      while ((l_ixy[1] >= 0) && (l_ixy[1] < Gv.length) &&
             (l_ixy[0] >= 0) && (l_ixy[1] < Gv[ l_ixy[1] ].length)) {

        let l_gv = Gv[ l_ixy[1] ][ l_ixy[0] ];

        if (debug) { console.log("  l_gv:", l_gv, "l_ixy:", l_ixy); }

        let le_g_idx = l_gv.G_idx;
        if (le_g_idx < 0) { break; }

        let le_g_ixy   = G[ le_g_idx ];
        let le_g_type  = Gt[ le_g_idx ];

        if (le_g_type == 'b') {

          if (debug) { console.log("    l>>> edge"); }

          let grid_pnt_s = G[ls_g_idx];
          let grid_pnt_e = G[le_g_idx];
          let cut_cost = abs_sum_v( v_sub(grid_pnt_e, grid_pnt_s) );

          let region_info = addRegionGuillotine(grid_ctx, ls_g_idx, le_g_idx);
          raw_regions.push({
            "region": region_info.region[0],
            "region_key": region_info.region_key[0],
            "shape": region_info.shape[0],
            "cut_type": "guillotine",
            "cut_segment": [ [grid_pnt_s, grid_pnt_e] ],
            "cut_cost" : cut_cost
          });
          raw_regions.push({
            "region": region_info.region[1],
            "region_key": region_info.region_key[1],
            "shape": region_info.shape[1],
            "cut_type": "guillotine",
            "cut_segment": [ [grid_pnt_s, grid_pnt_e] ],
            "cut_cost": cut_cost
          });

          break;
        }

        if (le_g_type == 'c') {

          if (debug) { console.log("    l>>> src_reflex", src_ixy, "to dst_boundary", le_g_ixy); }

          let grid_pnt_s = G[ls_g_idx];
          let grid_pnt_e = G[le_g_idx];
          let cut_cost = abs_sum_v( v_sub(grid_pnt_e, grid_pnt_s) );

          let region_info = addRegionGuillotine(grid_ctx, ls_g_idx, le_g_idx);
          raw_regions.push({
            "region": region_info.region[0],
            "region_key": region_info.region_key[0],
            "shape": region_info.shape[0],
            "cut_type": "guillotine",
            "cut_segment": [[grid_pnt_s, grid_pnt_s]],
            "cut_cost" : cut_cost
          });
          raw_regions.push({
            "region": region_info.region[1],
            "region_key": region_info.region_key[1],
            "shape": region_info.shape[1],
            "cut_type": "guillotine",
            "cut_segment": [[grid_pnt_s, grid_pnt_s]],
            "cut_cost" : cut_cost
          });

          break;

        }

        if (le_g_type == 'i') {

          if (debug) { console.log("    l>>> interior", s_dxy_choice); }

          for (let s_dxy_choice_idx=0; s_dxy_choice_idx < s_dxy_choice.length; s_dxy_choice_idx++) {
            let s_dxy = s_dxy_choice[ s_dxy_choice_idx ];
            let s_ixy = [ l_ixy[0] + s_dxy[0], l_ixy[1] + s_dxy[1] ];

            while ((s_ixy[1] >= 0) && (s_ixy[1] < Gv.length) &&
                   (s_ixy[0] >= 0) && (s_ixy[1] < Gv[ s_ixy[1] ].length)) {

              let s_gv = Gv[ s_ixy[1] ][ s_ixy[0] ];

              if (debug) { console.log("    s_gv:", s_gv, "s_ixy:", s_ixy); }

              let se_g_idx = s_gv.G_idx;
              if (se_g_idx < 0) { break; }

              let se_g_ixy   = G[ se_g_idx ];
              let se_g_type  = Gt[ se_g_idx ];

              if (se_g_type == 'b') {
                if (debug)  { console.log("      s>>> edge (skip,end)"); }
                break;
              }

              else if (se_g_type == 'i') {
                if (debug) { console.log("      s>>> interior (skip)"); }
              }

              if (se_g_type == 'c') {

                let grid_pnt_s = G[ls_g_idx];
                let grid_pnt_i = G[le_g_idx];
                let grid_pnt_e = G[se_g_idx];
                let cut_cost = abs_sum_v( v_sub(grid_pnt_e, grid_pnt_i) ) + abs_sum_v( v_sub(grid_pnt_i, grid_pnt_s) );

                if (debug) {
                  console.log("      s>>> reflex (partition)",
                    "2cut-seg: [", grid_pnt_s, grid_pnt_i, "]",
                    "[", grid_pnt_i, grid_pnt_e, "]",
                    "(cost:", cut_cost, ")");
                }

                let region_info = addRegionTwoCut(grid_ctx, ls_g_idx, le_g_idx, se_g_idx);
                raw_regions.push({
                  "region": region_info.region[0],
                  "region_key": region_info.region_key[0],
                  "shape": region_info.shape[0],
                  "cut_type": "2cut",
                  "cut_segment": [ [grid_pnt_s, grid_pnt_i], [grid_pnt_i, grid_pnt_e] ],
                  "cut_cost": cut_cost
                });
                raw_regions.push({
                  "region": region_info.region[1],
                  "region_key": region_info.region_key[1],
                  "shape": region_info.shape[1],
                  "cut_type": "2cut",
                  "cut_segment": [ [grid_pnt_s, grid_pnt_i], [grid_pnt_i, grid_pnt_e] ],
                  "cut_cost": cut_cost
                });

                break;
              }

              s_ixy = [ s_ixy[0] + s_dxy[0], s_ixy[1] + s_dxy[1] ];
            }

          }

          // must keep goin because the l line could still find
          // a partition that hits an edge or reflex
          //

        }

        l_ixy = [ l_ixy[0] + l_dxy[0], l_ixy[1] + l_dxy[1] ];
      }


    }

  }

  let all_region_map = {};
  let all_region_name = [];

  // dedup regions
  //
  for (let i=0; i<raw_regions.length; i++) {
    let key = raw_regions[i].region_key;
    if (key in all_region_map) { continue; }

    let region_info = raw_regions[i];

    region_info["child_key"] = [];
    region_info["child_region"] = [];
    region_info["cost"] = ( (region_info.shape == 'U') ? region_info.cut_cost : -1 );

    all_region_map[key] = region_info;
    all_region_name.push( key );
  }

  let _jstr = JSON.stringify;

  for (let src_idx = 0; src_idx < all_region_name.length; src_idx++) {
    let region_a_key = all_region_name[src_idx];
    let region_a = all_region_map[ region_a_key ];

    for (let dst_idx = (src_idx+1); dst_idx < all_region_name.length; dst_idx++) {
      let region_b_key = all_region_name[dst_idx];
      let region_b = all_region_map[ region_b_key ];

      // comm[0] = A only
      // comm[1] = B only
      // comm[2] = A \cap B
      //
      let comm = commRegion( region_a.region, region_b.region );

      console.log(" ...[", src_idx, dst_idx, "]:", region_a_key, region_b_key, region_a.region, region_b.region, comm);

      // |B| = |A \cap B| -> B \in A
      //
      if (comm[2].length == region_b.region.length) {

        let c_a = regionRectCost(grid_ctx, region_a.region);
        let c_b = regionRectCost(grid_ctx, region_b.region);
        console.log(" B in A (", _jstr(region_b.region), "in", _jstr(region_a.region), ")",
          "A-B:", _jstr(comm[0]), "(cost ab:", c_a, c_b, ")",
          "(cut_cost:", region_a.cost, region_b.cost, ")" );

        region_a.child_region.push( [ comm[0], comm[2] ] );
        region_a.child_key.push( [ _regionKey(comm[0]), region_b.region_key ] );
      }

      // |A| = |A \cap B| -> A \in B
      //
      else if (comm[2].length == region_a.region.length) {

        let c_a = regionRectCost(grid_ctx, region_a.region);
        let c_b = regionRectCost(grid_ctx, region_b.region);
        console.log(" A in B (", _jstr(region_a.region), "in", _jstr(region_b.region), ") B-A:", _jstr(comm[1]),
          "(cost ab:", c_a, c_b, ")",
          "(cut_cost:", region_a.cost, region_b.cost, ")" );

        region_b.child_region.push( [ comm[1], comm[2] ] );
        region_b.child_key.push( [ _regionKey(comm[1]), region_a.region_key ] );
      }

    }
  }

  console.log("region dag:");
  for (let src_idx = 0; src_idx < all_region_name.length; src_idx++) {
    let region_key = all_region_name[src_idx];
    let region_info = all_region_map[ region_key ];
    console.log( region_key, ":", _jstr( region_info.child_key ) );
  }


  let nxt_region_map = {};
  for (let src_idx = 0; src_idx < all_region_name.length; src_idx++) {
    let region_key = all_region_name[src_idx];
    let region_info = all_region_map[ region_key ];

    for (let child_pair_idx = 0; child_pair_idx < region_info.child_key.length; child_pair_idx++) {
      let child_pair_key = region_info.child_key[ child_pair_idx ];

      for (let cpi = 0; cpi < child_pair_key.length; cpi++) {

        let child_key = child_pair_key[cpi];

        if (!(child_key in all_region_map)) {

          let child_region = region_info.child_region[ child_pair_idx ][ cpi ];
          let child_cost = regionRectCost( grid_ctx, child_region );

          let child_cut_cost = child_cost;
          let child_shape = 'U';
          if (child_cost < 0) {
            child_shape = 'Z';
          }

          nxt_region_map[child_key] = {
            "region": child_region,
            "region_key": child_key,
            "shape": child_shape,
            "cut_type": "derived",
            "cust_segment": [],
            "cut_cost": child_cost,
            "cost": child_cut_cost,
            "child_key": [],
            "child_region": []
          };
        }

      }

    }
  }


  grid_ctx["region_map"] = all_region_map;
  grid_ctx["region_name"] = all_region_name;

  console.log("### writing all_region_map.json");
  _write_data( "all_region_map.json", all_region_map );

  console.log("### writing grid_ctx.json");
  _write_data( "grid_ctx.json", grid_ctx);

  resolveEdgeCost(grid_ctx, all_region_map, all_region_name);

}


// clunky, hopefully can be updated with rectangle inclusion
// testing
//
function regionRectCost(grid_ctx, region) {
  let _debug = true;

  let dualG = grid_ctx.dualG;
  let dualCell = grid_ctx.dualCell;
  let Gv = grid_ctx.Gv;

  let B = grid_ctx.B;
  let B_2d = grid_ctx.B_2d;

  let cost = 0;

  let iBB = [ [0,0], [1,1] ];

  for (let idx=0; idx<region.length; idx++) {
    let region_id = region[idx];
    let dual_ij = dualCell[ region_id ].ixy;

    if (idx == 0) { _BBInit( iBB, dual_ij[0], dual_ij[1] ); }
    _BBUpdate( iBB, dual_ij[0], dual_ij[1] );
  }

  // check to make sure region is rectangular.
  // If not, return -1
  //
  let bbA = ((iBB[1][0] - iBB[0][0] + 1)*(iBB[1][1] - iBB[0][1] + 1));
  if (bbA != region.length) { return -1; }

  let ix = 0,
      iy = 0;

  let cur_dixy = [
    [0,0], [0,1],
    [1,0], [0,0]
  ];

  let nei_dixy = [
    [1,0], [1,1],
    [1,1], [0,1]
  ];

  let d_ixy = [ [1,0], [1,0], [0,1], [0,1] ];
  let s_ixy = [
    [ iBB[0][0], iBB[0][1] ],
    [ iBB[0][0], iBB[1][1] ],
    [ iBB[1][0], iBB[0][1] ],
    [ iBB[0][0], iBB[0][1] ]
  ];

  let n_idir = [
    iBB[1][0] - iBB[0][0] + 1,
    iBB[1][0] - iBB[0][0] + 1,
    iBB[1][1] - iBB[0][1] + 1,
    iBB[1][1] - iBB[0][1] + 1
  ];

  let cost4 = [];


  if (_debug) {
    console.log("#### s_ixy:", s_ixy, n_idir);
  }

  // for each side of the rectangle, trace out right, left,
  // top, bottom.
  // Consider each grid point and it's directional neighbor
  // on the perimeter of the boundary.
  // If:
  //   - index grid point is out of bounds
  //   - index of neighbor grid point is out of bounds
  //   - index of point and neighbor are within 1 on B (C + grid point
  //     boundary points)
  // then skip.
  // If both current and directional neighbor grid point are on the B perimeter
  // (with additional grid points), but they're not next to each other index-wise,
  // then there must be an empty space between them.
  //
  // Otherwise, there's empty space between the points, so count
  // the distance.
  //
  for (let idir=0; idir<4; idir++) {

    for (let idx_ixy=0; idx_ixy < n_idir[idir]; idx_ixy++) {

      let ix = s_ixy[idir][0] + (idx_ixy*d_ixy[idir][0]),
          iy = s_ixy[idir][1] + (idx_ixy*d_ixy[idir][1]);

      let nei_ixy = [ ix + nei_dixy[idir][0], iy + nei_dixy[idir][1] ];
      let cur_ixy = [ ix + cur_dixy[idir][0], iy + cur_dixy[idir][1] ];

      if ((cur_ixy[1] < 0) || (cur_ixy[1] >= Gv.length) ||
          (cur_ixy[0] < 0) || (cur_ixy[0] >= Gv[ cur_ixy[1] ].length)) {
        continue;
      }

      if ((nei_ixy[1] < 0) || (nei_ixy[1] >= Gv.length) ||
          (nei_ixy[0] < 0) || (nei_ixy[0] >= Gv[ nei_ixy[1] ].length)) {
        continue;
      }

      if (Gv[cur_ixy[1]][cur_ixy[0]].G_idx < 0) { continue; }

      let b_idx1 = B_2d[ nei_ixy[1] ][ nei_ixy[0] ];
      let b_idx0 = B_2d[ cur_ixy[1] ][ cur_ixy[0] ];

      if (_debug) {
        console.log("### idir:", idir, "ixy:", ix, iy, "nei_ixy:", nei_ixy, "cur_ixy:", cur_ixy, "b_idx01:", b_idx0, b_idx1);
      }

      if ((b_idx1 >= 0) &&
          (b_idx0 >= 0) &&
          ( ( ((b_idx0+1)%B.length) == b_idx1 ) ||
            ( ((b_idx1+1)%B.length) == b_idx0 ) )) {
        continue;
      }


      let g0_info = Gv[ nei_ixy[1] ][ nei_ixy[0] ];
      let g1_info = Gv[ cur_ixy[1] ][ cur_ixy[0] ];
      let cur_cost = abs_sum_v( v_sub( g1_info.xy, g0_info.xy ) );
      cost += cur_cost;
      cost4.push(cur_cost);

      if (_debug) {
        console.log("###", "nei_ixy:", nei_ixy, "cur_ixy:", cur_ixy, "ginfo:", g0_info, g1_info, "(", g1_info.xy, g0_info.xy, ")");
      }

    }

  }

  if (_debug) {
    console.log("#regionRectCost: iBB:", JSON.stringify(iBB), "region:", region, "cost:", cost, cost4);
  }

  return cost;
}

// aborted
//
function resolveEdgeCost(grid_ctx, region_map, region_name) {

  for (let idx=0; idx<region_name.length; idx++) {
    let region = region_map[region_name[idx]];
    if (region.cost >= 0) { continue; }

    let sub_cost = [];
    for (let child_idx=0; child_idx < region.child_key.length; child_idx++) {
      let child_region = region.child_region[child_idx];
      let child_key = region.child_key[child_idx];



    }

  }

}


function _regionKey( region_id ) {
  return region_id.map( function(_v) { return _v.toString(); } ).join(",");
}


// returns array[3] of arrays of region ids
//
// A only | B only | A and B in common
//
// assumes a_region and b_region are sorted and have unique
// region ids.
//
// like the `comm` unix tool
//
function commRegion(a_region, b_region) {
  let comm = [ [], [], [] ];

  let a_idx = 0,
      b_idx = 0;

  let a_n = a_region.length,
      b_n = b_region.length;

  while ( (a_idx < a_n) && (b_idx < b_n) ) {
    if (a_region[a_idx] < b_region[b_idx]) {
      comm[0].push( a_region[a_idx] );
      a_idx++;
      continue;
    }

    if (a_region[a_idx] > b_region[b_idx]) {
      comm[1].push( b_region[b_idx] );
      b_idx++;
      continue;
    }

    comm[2].push( a_region[a_idx] );
    a_idx++;
    b_idx++;
  }

  for ( ; a_idx < a_n; a_idx++) { comm[0].push( a_region[a_idx] ); }
  for ( ; b_idx < b_n; b_idx++) { comm[1].push( b_region[b_idx] ); }

  return comm;
}

function _ixykey(p) {
  return p[0].toString() + "," + p[1].toString();
}

// UNTESTED!!!
// rprp_info
// g gird origin point
// dg axis aligned unit vector direction
//
// returns if the cleave cut starts inside the rectangle
//
function cleaveGridInside(rprp_info, g, dg) {
  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;
  let Sx = rprp_info.Sx;
  let Sy = rprp_info.Sy;

  let Gsize = [ Gv[0].length, Gv.length ];

  let g_nei = [ g[0] + dg[0], g[1] + dg[1] ];

  //console.log("cleaveGridInside: g:", g, "dg:", dg, "g_nei:", g_nei, "Gsize:", Gsize);

  if ( (g_nei[0] < 0) ||
       (g_nei[1] < 0) ||
       (g_nei[0] >= Gsize[0]) ||
       (g_nei[1] >= Gsize[1]) ) {
    return false;
  }

  //console.log("  cleaveGridInside: Sx[", g[1], "][", g[0], "]:", Sx[g[1]][g[0]]);
  //console.log("  cleaveGridInside: Sx[", g_nei[1], "][", g_nei[0], "]:", Sx[g_nei[1]][g_nei[0]]);

  //console.log("  cleaveGridInside: Sy[", g[1], "][", g[0], "]:", Sy[g[1]][g[0]]);
  //console.log("  cleaveGridInside: Sy[", g_nei[1], "][", g_nei[0], "]:", Sy[g_nei[1]][g_nei[0]]);

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

    if (Sx[ g[1] ][ g[0] ] > Sx[ g_nei[1] ][ g_nei[0] ]) {
      console.log("  cgi.0");
      return false;
    }
  }

  else if ((dg[0] == -1) && (dg[1] == 0)) {

    if ((uxy[0] < 0) || (vxy[0] < 0)) { return false; }

    if (Sx[ g_nei[1] ][ g_nei[0] ] > Sx[ g[1] ][ g[0] ]) {
      console.log("  cgi.1");
      return false;
    }
  }

  else if ((dg[0] == 0) && (dg[1] == 1)) {

    if ((uxy[1] < 0) || (vxy[1] < 0)) { return false; }

    if (Sy[ g[1] ][ g[0] ] > Sy[ g_nei[1] ][ g_nei[0] ]) {
      console.log("  cgi.2");
      return false;
    }
  }

  else if ((dg[0] == 0) && (dg[1] == -1)) {

    if ((uxy[1] < 0) || (vxy[1] < 0)) { return false; }

    if (Sy[ g_nei[1] ][ g_nei[0] ] > Sy[ g[1] ][ g[0] ]) {
      console.log("  cgi.3");
      return false;
    }
  }

  //console.log("  cgi.t");

  return true;
}

//UNTESTED!!!!
function cleaveGridOnBorder(rprp_info, g, dg) {
  let B2d = rprp_info.B_2d;

  if (!cleaveGridInside(rprp_info, g, dg)) { return false; }

  console.log("cleaveGridOnBorder: g:", g, "dg:", dg);

  let g_nei = [ g[0] + dg[0], g[1] + dg[1] ];

  let _bb = B2d[g[1]][g[0]]
  let _be = B2d[g_nei[1]][g_nei[0]]

  if ((_bb < 0) || (_be < 0) ||
      (Math.abs(_be-_bb) != 1)) {
    return false;
  }

  return true;
}

//UNTESTED!!!
function cleaveGridInline(rprp_info, g, dg, h, dh) {
  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;
  let Sx = rprp_info.Sx;
  let Sy = rprp_info.Sy;

  let Gsize = [ Gv[0].length, Gv.length ];

  console.log("#########################");
  console.log("cleaveGridInline: inside:",
    cleaveGridInside(rprp_info, g, dg),
    "onborder:",
    cleaveGridOnBorder(rprp_info, g, dg));



  if (!cleaveGridInside(rprp_info, g, dg)) { return false; }
  if (cleaveGridOnBorder(rprp_info, g, dg)) { return false; }

  console.log("cleaveGridInline: g:", g, "dg:", dg, "h:", h, "dh:", dh);

  // cleave and constructed line not parallele
  //
  if ( (dg[0] != dh[0]) || (dg[1] != dh[1]) ) { return false; }

  // cleave root is same as constructed line end
  //
  if ((g[0] == h[0]) && (g[1] == h[1])) { return true; }


  let dga = v_delta( v_sub( g, h ) );

  // segment from adit to cleave is same direction as
  // cleave direction
  //
  if ((dga[0] == dg[0]) && (dga[1] == dg[1])) { return true; }

  return false;
}


// WIP!!!
// return a list of cleave lines
//
// p_s : xy point on boundary that starts the region
// p_e : xy point on boundary that ends the region, counterclockwise from p_s
// a : adit point, at the intersection of two constructed lines from p_s, p_e
//     or one of p_s or p_e if a guillotine cut
// b : bower point defining quarry rectangle R_{a,b}
//
function cleaveProfile(rprp_info, p_s, p_e, a, b) {

  let Gv = rprp_info.Gv;
  let Gv_bp = rprp_info.Gv_bp;

  let Sx = rprp_info.Sx;
  let Sy = rprp_info.Sy;

  let g_s = Gv_bp[ _ixykey(p_s) ];
  let g_e = Gv_bp[ _ixykey(p_e) ];

  let g_a = Gv_bp[ _ixykey(a) ];
  let g_b = Gv_bp[ _ixykey(b) ];

  console.log("cleaveProfile:");
  console.log("p_s:", p_s, "p_e:", p_e, "a:", a, "b:", b);
  console.log("g_s:", g_s, "g_e:", g_e, "g_a:", g_a, "g_b:", g_b);

  let cleave_a = [];

  let Rdxy = [ Math.abs(b[0]-a[0]), Math.abs(b[1]-a[1]) ];
  if ((Rdxy[0] == 0) || (Rdxy[1] == 0)) { return []; }

  let Rp = [
    [ Math.max( a[0], b[0] ), Math.min( a[1], b[1] ) ],
    [ Math.min( a[0], b[0] ), Math.min( a[1], b[1] ) ],
    [ Math.min( a[0], b[0] ), Math.max( a[1], b[1] ) ],
    [ Math.max( a[0], b[0] ), Math.max( a[1], b[1] ) ]
  ];

  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let cleave_dxy = [
    [  1,  0 ], [  0, -1 ],
    [  0, -1 ], [ -1,  0 ],
    [ -1,  0 ], [  0,  1 ],
    [  0,  1 ], [  1,  0 ]
  ];

  let Gsize = [ Gv[0].length, Gv.length ];

  let cleave_profile = [ '~', '~', '~', '~', '~', '~', '~', '~' ];

  for (let i=0; i<cleave_dxy.length; i++) {
    let p = Rp[ Math.floor(i/2) ];
    let g = Rg[ Math.floor(i/2) ];

    console.log("\n##cleave_dxy[", i, "]:", cleave_dxy[i], "p:", p, "g:", g);

    if (!cleaveGridInside(rprp_info, g, cleave_dxy[i])) {
      cleave_profile[i] = 'x';
      continue;
    }

    if (cleaveGridOnBorder(rprp_info, g, cleave_dxy[i])) {
      cleave_profile[i] = 'b';
      continue;
    }

    let cl_dxy = [
      v_delta( v_sub( g_s, g_a ) ),
      v_delta( v_sub( g_e, g_a ) )
    ];

    if ( (cleaveGridInline(rprp_info, g, cleave_dxy[i], g_a, cl_dxy[0])) ||
         (cleaveGridInline(rprp_info, g, cleave_dxy[i], g_a, cl_dxy[1])) ) {
      cleave_profile[i] = 'c';
      continue;
    }

    cleave_profile[i] = '.';

  }

  console.log("");
  console.log("cleave_profile:", cleave_profile.join(""));
  console.log("");

  return cleave_profile;
}

function _ok(P) {

  let all_x_pnt = [],
      all_y_pnt = [],
      x_pnt = [],
      y_pnt = [];

  for (let i=0; i<P.length; i++) {
    all_x_pnt.push(P[i][0]);
    all_y_pnt.push(P[i][1]);
  }

  all_x_pnt.sort( _icmp );
  all_y_pnt.sort( _icmp );

  x_pnt.push(all_x_pnt[0]);
  y_pnt.push(all_y_pnt[0]);

  for (let i=1; i<all_x_pnt.length; i++) {
    if (all_x_pnt[i] != all_x_pnt[i-1]) {
      x_pnt.push(all_x_pnt[i]);
    }
  }

  for (let i=1; i<all_y_pnt.length; i++) {
    if (all_y_pnt[i] != all_y_pnt[i-1]) {
      y_pnt.push(all_y_pnt[i]);
    }
  }

  for (let i=0; i<x_pnt.length; i++) {
    for (let j=0; j<y_pnt.length; j++) {
      console.log("\n\n", x_pnt[i], y_pnt[j]);
    }
  }

}

function _main_fig11() {

  let pgn = orderCounterclockwise(pgon_fig11d);

  //let grid_info = rectilinearGridPoints(pgon_fig11);
  //grid_info = rectilinearGridPoints(pgon_fig11d);

  let grid_info = rectilinearGridPoints(pgn);

  console.log("clockwise(pgn):", clockwise(pgn),
    "( pgn is", clockwise(pgn) ? "cw" : "ccw", ")");

  //console.log(grid_info);

  _print_grid_info(grid_info);

  console.log(">>>>", _rprp_irect_contain_test(grid_info));

}

function _main1() {

  let grid_info = rectilinearGridPoints(pgon);

  _print_dual(grid_info.dualG, '#');
  console.log("");

  _print_grid_info(grid_info);

  cataloguePartitions(grid_info);
  return;
}

function _main() {
  let grid_info = rectilinearGridPoints(pgon);

  _print_pgon(pgon, grid_info.Ct);

  let grid_p = grid_info.G;
  let grid_pt = grid_info.Gt;

  for (let i=0; i<grid_p.length; i++) {
    console.log("\n#winding:", winding(grid_p[i], pgon), grid_pt[i] );
    console.log(grid_p[i][0], grid_p[i][1], "\n");
  }


  //console.log(grid_info);
  //console.log(grid_info.dualG);

  //_ok(pgon);
}

function _main_iray_boundary_test() {
  //let grid_info = rectilinearGridPoints(pgn_pinwheel1);

  let grid_info = rectilinearGridPoints(pgn_spiral1);

  _print_grid_info(grid_info);

  let ny = grid_info.B_2d.length;
  let nx = grid_info.B_2d[0].length;

  let idir_dxy = [
    [1,0], [-1,0], [0,1], [0,-1]
  ];

  for (let j=0; j<ny; j++) {
    for (let i=0; i<nx; i++) {

      for (let idir=0; idir<idir_dxy.length; idir++) {
        console.log("s_ij:", i,j, "d_ij:", idir_dxy[idir],
          "b_idx:", rprp_iray_boundary_intersection_linear(grid_info, [i,j], idir_dxy[idir]),
          rprp_iray_boundary_intersection(grid_info, [i,j], idir_dxy[idir]) );
      }

    }
  }
}

function _main_pinwheel1() {
  let grid_info = rectilinearGridPoints(pgn_pinwheel1);

  console.log("pgn_pinwheel1:");
  console.log(pgn_pinwheel1);
  console.log("----");

  // test case 0  .c.c....
  //cleaveProfile(grid_info, [4,6], [9,4], [9,6], [6,9]);

  // test case 1 .c.....c
  //cleaveProfile(grid_info, [11,9], [9,4], [9,9], [6,6]);

  // test case 2 xbc...xx
  //cleaveProfile(grid_info, [11,9], [9,4], [9,9], [14,6]);

  // test case 3 xxb...xx
  //cleaveProfile(grid_info, [11,9], [9,4], [9,9], [14,4]);

  // test case 4  ..cc..bb
  //cleaveProfile(grid_info, [4,6], [9,4], [9,6], [11,9]);

  // test case 5  .cbb....
  //cleaveProfile(grid_info, [4,6], [9,4], [9,6], [4,9]);

  // test case 6  .cbbbx..
  //cleaveProfile(grid_info, [4,6], [9,4], [9,6], [4,11]);

  // test case 7  .c.cxxxb
  cleaveProfile(grid_info, [4,6], [9,4], [9,6], [6,15]);

}

//_main1();
//_main_fig11();

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

if ((typeof require !== "undefined") &&
    (require.main === module)) {
  //_main(process.argv.slice(1));
  //_main_pinwheel1(process.argv.slice(1));
  _main_iray_boundary_test();
}

