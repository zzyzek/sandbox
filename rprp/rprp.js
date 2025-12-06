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

// Currently, the scoring function tallies the perimeter of each
// rectangle. This double counts the inteior edges but only
// single counts the exterior.
// Some numbers below are using this double counting.
//
// To get the real value:
//
// * Call the (singly counted) perimeter $S_P$
// * Call the (double interior) counted total $S_R$
// * To get the actual ink value:
//   - $S_I = (S_R - S_P)/2 + S_P = (S_P + S_R) / 2$
//

var fasslib = require("./fasslib.js");
var fw = require("./4w.js");

var norm2_v = fasslib.norm2_v;
var v_sub = fasslib.v_sub;
var v_add = fasslib.v_add;
var v_mul = fasslib.v_mul;
var dot_v = fasslib.dot_v;
var cross3 = fasslib.cross3;
var v_delta = fasslib.v_delta;
var abs_sum_v = fasslib.abs_sum_v;
var cmp_v = fasslib.cmp_v;

var pgon = [
  [0,0], [0,2], [1,2], [1,3], [3,3],
  [3,1], [2,1], [2,0]
];

var pgn_ell = [
  [0,0], [12,0], [12,3], [4,3],
  [4,13], [0,13],
];

// opt. 52
//
var pgn_z = [
  [0,0], [7,0], [7,6], [12,6],
  [12,9], [1,9], [1,2], [0,2],
];

var pgon_pinwheel = [
  [1,-1], [1,1], [0,1], [0,5], [2,5], [2,6],
  [4,6], [4,3], [5,3], [5,0], [3,0], [3,-1],
];

// opt. 96 (w/ double counting)
//
var pgn_pinwheel1 = [
  [0,6], [4,6], [4,0], [9,0],
  [9,4], [14,4], [14,9], [11,9],
  [11,15], [6,15], [6,11], [0,11]
];

// opt. 98
var pgn_pinwheel_sym = [
  [0,6], [4,6], [4,0], [9,0],
  [9,4], [15,4], [15,9], [11,9],
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

var pgn_bb_test = [
  [0,13], [2,13], [2,9], [1,9],
  [1,7], [3,7], [3,0], [11,0],
  [11,7], [16,7], [16,13], [13,13],
  [13,16], [8,16], [8,15], [5,15],
  [5,17], [0,17]
];


// testing bridge in well
//
var pgn_bb_test1= [
  [0,8], [3,8], [3,0], [8,0],
  [8,8], [12,8], [12,11], [15,11],
  [15,2], [17,2], [17,13], [12,13],
  [12,16], [6,16], [6,20], [0,20],
  [0,14], [3,14], [3,11], [0,11],
];

function _write_data(ofn, data) {
  var fs = require("fs");
  return fs.writeFileSync(ofn, JSON.stringify(data, undefined, 2));
}

function _ERROR(s) {
  console.log("ERROR:", s);
}

// human readable debug identifiers
// 'four character words' js with array of 4 character words
//
function _debid() {
  let n = 2;
  let m = fw.word.length;
  let a = [];
  for (let i=0; i<n; i++) {
    let idx = Math.floor( Math.random()*m );
    a.push( fw.word[idx] );
  }
  return a.join("-");
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


/*
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
*/

function cmp_dp_key(_a,_b) {

  let v_a = _a.split(";");
  let v_b = _b.split(";");

  let a_se = v_a[0].split(":");
  let b_se = v_b[0].split(":");

  let a_adit = v_b[1].split(",");
  let b_adit = v_b[1].split(",");

  if ( parseInt(a_se[0]) < parseInt(b_se[0])) { return -1; }
  if ( parseInt(a_se[0]) > parseInt(b_se[0])) { return  1; }
  if ( parseInt(a_se[1]) < parseInt(b_se[1])) { return -1; }
  if ( parseInt(a_se[1]) > parseInt(b_se[1])) { return  1; }

  if ( parseInt(a_adit[0]) < parseInt(b_adit[0])) { return -1; }
  if ( parseInt(a_adit[0]) > parseInt(b_adit[0])) { return  1; }

  if ( parseInt(a_adit[1]) < parseInt(b_adit[1])) { return -1; }
  if ( parseInt(a_adit[1]) > parseInt(b_adit[1])) { return  1; }

  return 0;
}

function _print_dp(ctx) {
  let X = ctx.X;
  let Y = ctx.Y;

  let key_a = [];
  for (let key in ctx.DP_cost) { key_a.push(key); }
  key_a.sort( cmp_dp_key );

  for (let i=0; i<key_a.length; i++) {
    let dp_idx = key_a[i];
    if (ctx.DP_cost[dp_idx] >= 0) {
      console.log( dp_idx, ":", ctx.DP_cost[dp_idx]);
      console.log("  R:", JSON.stringify(ctx.DP_rect[dp_idx][0]), JSON.stringify(ctx.DP_rect[dp_idx][1]));
      console.log("  P.1cut:", JSON.stringify(ctx.DP_partition[dp_idx][0]));
      console.log("  P.2cut:", JSON.stringify(ctx.DP_partition[dp_idx][1]));
    }
  }

  if ("partition" in ctx) {
    let plist = ctx.partition;

    for (let i=0; i<plist.length; i++) {
      console.log(plist[i]);
    }
  }

}

function __print_dp(ctx) {
  let X = ctx.X;
  let Y = ctx.Y;


  for (let dp_idx=0; dp_idx < ctx.DP_cost.length; dp_idx++) {
    if (ctx.DP_cost[dp_idx] >= 0) {
      console.log( dp_idx, ":", ctx.DP_cost[dp_idx]);
      console.log("  R:", JSON.stringify(ctx.DP_rect[dp_idx][0]), JSON.stringify(ctx.DP_rect[dp_idx][1]));
      console.log("  P.1cut:", JSON.stringify(ctx.DP_partition[dp_idx][0]));
      console.log("  P.2cut:", JSON.stringify(ctx.DP_partition[dp_idx][1]));
    }
  }

  if ("partition" in ctx) {
    let plist = ctx.partition;

    for (let i=0; i<plist.length; i++) {
      console.log(plist[i]);
    }
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

  for (let idir=0; idir<4; idir++) {
    _print2da(ctx.Jf[idir],   "\n## Jf[" + idir_descr[idir] + "]:");
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
      Je = [ [], [], [], [] ],
      Jf = [ [], [], [], [] ];

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

  if (_debug) {
    _print1da(Cxy, "\n## Cxy:");
    _print1da(Ct, "\n## Ct:");
  }

  for (let j=0; j<Y.length; j++) {
    Gij.push([]);
    Bij.push([]);
    for (let idir=0; idir<4; idir++) {
      Js[idir].push([]);
      Je[idir].push([]);
      Jf[idir].push([]);
    }
    for (let i=0; i<X.length; i++) {
      Gij[j].push(-1);
      Bij[j].push(-1);
      for (let idir=0; idir<4; idir++) {
        Js[idir][j].push(-1);
        Je[idir][j].push(-1);
        Jf[idir][j].push(-1);
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

  if (_debug) {
    _print1da(Bxy,  "\n## Bxy:");
    _print1da(B,    "\n## B:");
    _print1da(Bt,   "\n## Bt:");
    _print2da(Bij,  "\n## Bij:");
  }


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

  // Below is a lookup table of when to update the near and afar
  // indices.
  // The `idir` is the counterclockwise direction of the border
  // segment encountered (e.g. 2,2 -> up up).
  // `B` means update border index, 1/0 means update indicator,
  // -1 means intialize with special value -1 and `.` means no change.
  //
  // So, for example, if we're populating the Js[+x] structure,
  // we're sweeping from right to left and say
  // we encounter a 2,0 (up, right) border segment, the `B` code
  // indicates update the current index (we don't update
  // the Je[+x] current index).
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

  // An additional "jump flip" structure is created that records
  // the the next change from border to interior or interior to
  // border.
  //
  // 0 - set distance to 0 for current point then increment distance
  // R - update current point with distance but reset distance to 0
  //     afterwards (and increment, setting it to 1 for next round).
  // . - update current point with distance and update distance (increment)
  //
  //
  //-----------------------------------------------------
  //        idir   +x -x +y -y
  // idx  prv nxt   f  f  f  f
  //  0    0   0    .  .  0  0
  //  1    1   1    .  .  0  0
  //  2    2   2    0  0  .  .
  //  3    3   3    0  0  .  .
  //
  //  4    0   2    0  R  R  0
  //  5    0   3    0  R  0  R
  //  6    1   2    R  0  R  0
  //  7    1   3    R  0  0  R
  //  8    2   0    R  0  0  R
  //  9    2   1    0  R  0  R
  //  10   3   0    R  0  R  0
  //  11   3   1    0  R  R  0
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

  /*
  // lookup to Interior, afar, near
  //
  let _lu_Ian = [

    // idir_prv, idir_nxt
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
  */

  //  idx:                0   1   2   3   4   5   6   7   8   9  10  11
  //  idir_prv,idir_nxt: 00  11  22  33  02  03  12  13  20  21  30  31

  // Interior code lookup
  //
  let _lu_I = [
    "..101..0.10.",
    "..010..1.01.",
    "01..0..1.10.",
    "10..1..0.01."
  ];

  // afar code lookup
  //
  let _lu_afar = [
    "..B-B..-.B-.",
    "..-B-..B.-B.",
    "-B..-..B.B-.",
    "B-..B..-.-B."
  ];

  // near code lookup
  //
  let _lu_near = [
    "..B-B.B-BB-.",
    "..-B-B.B.-BB",
    "-B..-.BB.B-B",
    "B-..BB.-B-B."
  ];

  // flip code lookup
  //
  let _lu_f = [
    "..0000RRR0R0",
    "..00RR000R0R",
    "00..R0R000RR",
    "00..0R0RRR00"
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
        near_B_idx = -1,
        dist_B = -1;

    if (idir < 2) {

      for (let j = _ibound[idir][1][0]; j != _ibound[idir][1][1]; j += _ibound[idir][1][2]) {

        afar_B_idx = -1;
        near_B_idx = -1;
        dist_B = -1;

        let f_reset = 0;

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

            let _lu = _idir2lu[ _idir_prv ][ _idir_nxt ];

            let _I_code = _lu_I[idir][_lu];
            let _afar_code = _lu_afar[idir][_lu];
            let _near_code = _lu_near[idir][_lu];

            if      (_I_code == '0') { _interior = 0; }
            else if (_I_code == '1') { _interior = 1; }

            if      (_afar_code == 'B') { afar_B_idx = cur_B_idx; }
            else if (_afar_code == '-') { afar_B_idx = -1; }

            if      (_near_code == 'B') { near_B_idx = cur_B_idx; }
            else if (_near_code == '-') { near_B_idx = -1; }

            /*
            let _code = _lu_Ian[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_code[0] == '0') { _interior = 0; }
            else if (_code[0] == '1') { _interior = 1; }

            if      (_code[1] == 'B') { afar_B_idx = cur_B_idx; }
            else if (_code[1] == '-') { afar_B_idx = -1; }

            if      (_code[2] == 'B') { near_B_idx = cur_B_idx; }
            else if (_code[2] == '-') { near_B_idx = -1; }
            */


            let _f_code = _lu_f[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_f_code == '0') { dist_B = 0; }
            else if (_f_code == 'R') { f_reset = 1; }
          }

          Jf[idir][j][i] = dist_B;

          if (f_reset) { dist_B = 0; }
          f_reset = 0;

          dist_B++;

        }

      }

    }

    else {

      for (let i = _ibound[idir][0][0]; i != _ibound[idir][0][1]; i += _ibound[idir][0][2]) {

        afar_B_idx = -1;
        near_B_idx = -1;
        dist_B = -1;

        let f_reset = 0;

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

            let _lu = _idir2lu[ _idir_prv ][ _idir_nxt ];

            let _I_code = _lu_I[idir][_lu];
            let _afar_code = _lu_afar[idir][_lu];
            let _near_code = _lu_near[idir][_lu];

            if      (_I_code == '0') { _interior = 0; }
            else if (_I_code == '1') { _interior = 1; }

            if      (_afar_code == 'B') { afar_B_idx = cur_B_idx; }
            else if (_afar_code == '-') { afar_B_idx = -1; }

            if      (_near_code == 'B') { near_B_idx = cur_B_idx; }
            else if (_near_code == '-') { near_B_idx = -1; }

            /*
            let _code = _lu_Ian[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_code[0] == '0') { _interior = 0; }
            else if (_code[0] == '1') { _interior = 1; }

            if      (_code[1] == 'B') { afar_B_idx = cur_B_idx; }
            else if (_code[1] == '-') { afar_B_idx = -1; }

            if      (_code[2] == 'B') { near_B_idx = cur_B_idx; }
            else if (_code[2] == '-') { near_B_idx = -1; }
            */

            let _f_code = _lu_f[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_f_code == '0') { dist_B = 0; }
            else if (_f_code == 'R') { f_reset = 1; }
          }

          Jf[idir][j][i] = dist_B;

          if (f_reset) { dist_B = 0; }
          f_reset = 0;

          dist_B++;

        }

      }

    }

    
  }

  if (_debug) {
    let idir_descr = [ "+x", "-x", "+y", "-y" ];
    for (let idir=0; idir<4; idir++) {
      _print2da(Js[idir],   "\n## Js[" + idir_descr[idir] + "]:");
    }
  }


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

  for (let j=0; j<Y.length; j++) {
    for (let i=0; i<X.length; i++) {

      for (let idir=0; idir<4; idir++) {
        if (Gij[j][i] < 0) { Jf[idir][j][i] = -1; }
      }

    }
  }

  let DP_cost = {},
      DP_partition = {},
      DP_bower = {},
      DP_rect = {};

  /*
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
  */

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
    "Jf" : Jf,

    "DP_root_key": "",
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

function RPRP_valid_cleave(ctx, quarry, cleave_choice, cleave_border_type, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let R = quarry;

  let Js = ctx.Js;
  let Jf = ctx.Jf;

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

  if (_debug > 1) { console.log("#vc.cp0"); }

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

  let R_idir_B = [
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1]
  ];

  let R_B = [
    Bij[ R[0][1] ][ R[0][0] ],
    Bij[ R[1][1] ][ R[1][0] ],
    Bij[ R[2][1] ][ R[2][0] ],
    Bij[ R[3][1] ][ R[3][0] ]
  ];

  let R_Bt = [
    ((R_B[0] < 0) ? '.' : Bt[ R_B[0] ]),
    ((R_B[1] < 0) ? '.' : Bt[ R_B[1] ]),
    ((R_B[2] < 0) ? '.' : Bt[ R_B[2] ]),
    ((R_B[3] < 0) ? '.' : Bt[ R_B[3] ])
  ];

  let Rl = [
    R[0][0] - R[1][0],
    R[2][1] - R[1][1],
    R[3][0] - R[2][0],
    R[3][1] - R[0][1]
  ];

  // We're testing to see if there's a portion of the boundary
  // that butts up against the quarry rectangle (without piercing through).
  // If the quarry side is free floating, we call it 'undocked' (dock == 1).
  //
  // The bridge tests, seeing if two cleave cuts are parallel and thus
  // allowing the quarry rectangle side to move, relies on the quarry rectangle
  // side being undocked.
  // If there was a portion of the boundary that butted up against the quarry
  // rectangle side, this doesn't invalidate parallel cleave cuts on that side.
  //
  for (let idx=0; idx < 8; idx++) {
    let r_idx = Math.floor(idx/2);
    let idir = cleave_idir[idx];
    let rdir = oppo_idir[idir];

    let B = Js[ idir ][ R[r_idx][1] ][ R[r_idx][0] ];
    if (B < 0) { B = Bij[ R[r_idx][1] ][ R[r_idx][0] ]; }

    let b = Js[ rdir ][ R[r_idx][1] ][ R[r_idx][0] ];
    if (b < 0) { b = Bij[ R[r_idx][1] ][ R[r_idx][0] ]; }

    //let B = B = Bij[ R[r_idx][1] ][ R[r_idx][0] ];
    //if (B < 0) { Js[ idir ][ R[r_idx][1] ][ R[r_idx][0] ]; }

    //let b = Bij[ R[r_idx][1] ][ R[r_idx][0] ];
    //if (b < 0) { b = Js[ rdir ][ R[r_idx][1] ][ R[r_idx][0] ]; }

    R_idir_B[r_idx][idir] = B;
    R_idir_B[r_idx][rdir] = b;
  }

  // Check to see border jump values match in the two
  // in-line directions of each of the quarry rectangle edges.
  //
  // If they don't, there's a border buffetting them, and
  // the side is lablled as docked.
  //

  //let _undock = [ 1, 1, 1, 1 ];
  //let _dock = [ 0, 0, 0, 0 ];

  let _rcur = -1,
      _rnxt = -1;

  //-----
  //-----
  //-----
  let _dock = [-1,-1,-1,-1];

  // bottom edge of quarry rectangle
  //
  _rcur = 0; _rnxt = 1;

  //let idir_sched = [ 0, 3, 1, 2 ];
  let idir_sched = [ 1, 2, 0, 3 ];

  for (let r_idx=0; r_idx<4; r_idx++) {

    let _rcur = r_idx;
    let _rnxt = (r_idx+1)%4;

    let _idir = idir_sched[r_idx];
    let _rdir = oppo_idir[_idir];

    if (R_Bt[_rcur] == '.') {

      _dock[r_idx] = 1;

      if (Jf[_idir][ R[_rcur][1] ][ R[_rcur][0] ] >= Rl[r_idx]) {

        if (_debug) { console.log("#qi.dock.a.0 (R line", r_idx, "undocked)"); }

        _dock[r_idx] = 0;
      }
      else  {
        if (_debug) { console.log("#qi.dock.a.1 (R line", r_idx, "docked)"); }
      }

    }

    // quarry endpoint on boundary
    //
    else {

      _dock[r_idx] = 1;

      // If the quarry endpoint is on a boundary in-line with
      // the quarry edge, then automatically docked.
      //
      if (Jf[_idir][ R[_rcur][1] ][ R[_rcur][0] ] > 0) {

        if (_debug) { console.log("#qi.dock.b.1 (R line", r_idx, "docked",
            "R_B[", _rcur, "]:", R_B[_rcur],
            "Jf:", Jf[_idir][R[_rcur][1] ][ R[_rcur][0] ],
            ")"); }

        _dock[r_idx] = 1;
      }

      // otherwise the quarry endpoint is on the boundary but quarry
      // edge is at least partially not on the boundary as it starts
      // from _rcur going in _idir direction.
      //
      // If the border jump point from _rcur is either the boundary point
      // of _rnxt or _rcur and _rnxt have the same border jump point,
      // the quarry edge must be undocked.
      //
      else if ( (R_idir_B[_rcur][_idir] == R_B[_rnxt]) ||
                (R_idir_B[_rcur][_idir] == R_idir_B[_rnxt][_idir]) ) {

        if (_debug) { console.log("#qi.dock.b.0 (R line", r_idx, "undocked)"); }

        _dock[r_idx] = 0;
      }

      else {

        if (_debug) { console.log("#qi.dock.c.1 (R line", r_idx, "docked)"); }

      }


    }

  }

  //-----
  //-----
  //-----

  /*


  _rcur = 0; _rnxt = 1;
  if ( (R_idir_B[_rcur][0] != R_idir_B[_rnxt][0]) ||
       (R_idir_B[_rcur][1] != R_idir_B[_rnxt][1]) ) {
    //_undock[0] = 0;
    _dock[0] = 1;
  }

  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][0] == R_Bt[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][1] == R_Bt[_rnxt])) ) {
    _dock[0] = 1;
  }

  // STILL BUGGY
  // working on it.
  // If either corner is on a border, it's docked
  // If either has a corner facing inwoards, then its docked
  // else, it's undocked.


  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][0] == R_B[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][1] == R_B[_rnxt])) ) { 
    _dock[0] = 0;
  }


  _rcur = 1; _rnxt = 2;
  if ( (R_idir_B[_rcur][2] != R_idir_B[_rnxt][2]) ||
       (R_idir_B[_rcur][3] != R_idir_B[_rnxt][3]) ) {
    //_undock[1] = 0;
    _dock[1] = 1;
  }

  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][3] == R_B[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][2] == R_B[_rnxt])) ) { 
    _dock[1] = 0;
  }


  _rcur = 2; _rnxt = 3;
  if ( (R_idir_B[_rcur][0] != R_idir_B[_rnxt][0]) ||
       (R_idir_B[_rcur][1] != R_idir_B[_rnxt][1]) ) {
    //_undock[2] = 0;
    _dock[2] = 1;
  }

  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][1] == R_B[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][0] == R_B[_rnxt])) ) { 
    _dock[2] = 0;
  }


  _rcur = 3; _rnxt = 0;
  if ( (R_idir_B[_rcur][2] != R_idir_B[_rnxt][2]) ||
       (R_idir_B[_rcur][3] != R_idir_B[_rnxt][3]) ) {
    //_undock[3] = 0;
    _dock[3] = 1;
  }

  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][3] == R_B[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][2] == R_B[_rnxt])) ) { 
    _dock[3] = 0;
  }

  */

  //---






  //if (_debug > 1) { console.log("#vc.cp1:", cleave_choice.join(""), redux.join(""), JSON.stringify(_undock) ); }
  if (_debug > 1) {
    console.log("#vc.cp1:", cleave_choice.join(""), redux.join(""), JSON.stringify(_dock) );
    console.log("#vc.cp1.1:", "R_idir_B:", JSON.stringify(R_idir_B), "R_B:", JSON.stringify(R_B), "R_Bt:", R_Bt.join(""));
  }

  // each corner needs at least one cleave cut
  //
  if ((redux[0] == '-') && (redux[1] == '-')) { return 0; }
  if ((redux[2] == '-') && (redux[3] == '-')) { return 0; }
  if ((redux[4] == '-') && (redux[5] == '-')) { return 0; }
  if ((redux[6] == '-') && (redux[7] == '-')) { return 0; }

  if (_debug > 1) { console.log("#vc.cp2"); }

  // parallel cleave cuts means middle billet is moveable
  //
  //if ((_undock[3] == 1) && (redux[0] == '*') && (redux[7] == '*')) { return 0; }
  //if ((_undock[0] == 1) && (redux[1] == '*') && (redux[2] == '*')) { return 0; }
  //if ((_undock[1] == 1) && (redux[3] == '*') && (redux[4] == '*')) { return 0; }
  //if ((_undock[2] == 1) && (redux[5] == '*') && (redux[6] == '*')) { return 0; }

  if ((_dock[3] == 0) && (redux[0] == '*') && (redux[7] == '*')) { return 0; }
  if ((_dock[0] == 0) && (redux[1] == '*') && (redux[2] == '*')) { return 0; }
  if ((_dock[1] == 0) && (redux[3] == '*') && (redux[4] == '*')) { return 0; }
  if ((_dock[2] == 0) && (redux[5] == '*') && (redux[6] == '*')) { return 0; }


  if (_debug > 1) { console.log("#vc.cp3, redux:", redux.join(""), "cbt:", cleave_border_type.join("") ); }

  // bridge tests
  // cleave line bridges two borders, so is moveable, invalidating choice
  //
  // if there's a cleave line that ends on a flat boundary edge
  // and there's a cleave line going orthogonal, it's a bridge (-> invalid)
  //
  // These set of tests look only at the cleave line to see if it itself is
  // moveable.
  //
  if ((redux[0] == '*') && (redux[1] == '*') && (cleave_border_type[0] == 'b')) { return 0; }
  if ((redux[1] == '*') && (redux[0] == '*') && (cleave_border_type[1] == 'b')) { return 0; }

  if ((redux[2] == '*') && (redux[3] == '*') && (cleave_border_type[2] == 'b')) { return 0; }
  if ((redux[3] == '*') && (redux[2] == '*') && (cleave_border_type[3] == 'b')) { return 0; }

  if ((redux[4] == '*') && (redux[5] == '*') && (cleave_border_type[4] == 'b')) { return 0; }
  if ((redux[5] == '*') && (redux[4] == '*') && (cleave_border_type[5] == 'b')) { return 0; }

  if ((redux[6] == '*') && (redux[7] == '*') && (cleave_border_type[6] == 'b')) { return 0; }
  if ((redux[7] == '*') && (redux[6] == '*') && (cleave_border_type[7] == 'b')) { return 0; }


  // We also need to test if the cleave line then makes the quarry rectangle edge moveable
  //
  //if ((redux[0] == '*') && 

  if (_debug > 1) { console.log("#vc.cp4, redux:", redux.join(""), "cbt:", cleave_border_type.join("") ); }


  // float tests
  // at least one end must be on a corner
  //

  // we'll use cleave 5 (upper left corner, pointing upwards) as an example:
  //
  // IF   cleave_5 is present and ends on a border (upwards) (that is, it doesn't end on a corner)
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


  if (_debug > 1) { console.log("#vc.cp5"); }

  //let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];
  let oppo_cleave = [ 3, 6, 5, 0,
                      7, 2, 1, 4 ];
  //let oppo_idir = [ 1,0, 3,2 ];

  // These tests are still pretty janky.
  // I'm nervous that these are too ad-hoc, don't account for every case and/or
  // mark some configurations as floats when they're not.
  //

  if (_debug > 2) {
    console.log("#vc cc:", cleave_choice.join(""),
      "cbt:", cleave_border_type.join(""),
      "redux:", redux.join("") );
  }

  // trying to simplify the float cleave tests
  //
  for (cleave_idx = 0; cleave_idx < 8; cleave_idx++) {
    let r_idx = Math.floor(cleave_idx/2);
    let rev_cleave_idx = oppo_cleave[cleave_idx];
    let rev_r_idx = Math.floor(rev_cleave_idx/2);
    let idir = cleave_idir[cleave_idx];
    let rdir = oppo_idir[idir];

    let l_idx_lu = [ 0,3, 1,0, 2,1, 3,2 ];
    let l_idx = l_idx_lu[cleave_idx];

    let cleave_endpoint = [-1,-1];

    // If the cleave position isn't a constructed line or a cleave choice,
    // we can ignore it.
    //
    if ((cleave_choice[cleave_idx] != '*') &&
        (cleave_choice[cleave_idx] != 'c')) {

      if (_debug > 2) { console.log("#vc.skip.0 (not a cleave/constructed line, cc[", cleave_idx, "] =", cleave_choice[cleave_idx], ")"); }

      continue;
    }

    if ( Bij[ R[r_idx][1] ][ R[r_idx][0] ] >= 0 ) {

      if (_debug > 2) { console.log("#vc.skip.1 (on border/corner, B:", Bij[ R[r_idx][1] ][ R[r_idx][0] ],")"); }

      continue;
    }

    cleave_endpoint[0] = B[ Js[idir][ R[r_idx][1] ][ R[r_idx][0] ] ];

    if ((cleave_choice[rev_cleave_idx] == '*') ||
        (cleave_choice[rev_cleave_idx] == 'c') ||
        (Jf[rdir][ R[r_idx][1] ][ R[r_idx][0] ] <= Rl[l_idx])) {
      cleave_endpoint[1] = B[ Js[rdir][ R[r_idx][1] ][ R[r_idx][0] ] ];
    }

    else {
      cleave_endpoint[1] = R[rev_r_idx];
    }

    let _corner_count = 0;

    let _b0 = Bij[ cleave_endpoint[0][1] ][ cleave_endpoint[0][0] ];
    let _b1 = Bij[ cleave_endpoint[1][1] ][ cleave_endpoint[1][0] ];

    if ( (_b0 >= 0) && (Bt[_b0] == 'c') ) { _corner_count++; }
    if ( (_b1 >= 0) && (Bt[_b1] == 'c') ) { _corner_count++; }

    if (_corner_count == 0) {
      if (_debug > 2) { console.log("#vc.float! (cleave_endpoint:", JSON.stringify(cleave_endpoint)); }
      return 0;
    }

  }

  /*

  for (cleave_idx = 0; cleave_idx < 8; cleave_idx++) {
    let r_idx = Math.floor(cleave_idx/2);
    let rev_cleave_idx = oppo_cleave[cleave_idx];
    let rev_r_idx = Math.floor(rev_cleave_idx/2);
    let idir = cleave_idir[cleave_idx];
    let rdir = oppo_idir[idir];

    // If the cleave position isn't a constructed line or a cleave choice,
    // we can ignore it.
    //
    if ((cleave_choice[cleave_idx] != '*') &&
        (cleave_choice[cleave_idx] != 'c')) {

      if (_debug > 2) { console.log("#vc.skip.0 (cc[", cleave_idx, "] =", cleave_choice[cleave_idx], ")"); }

      continue;
    }

    // If the cleave away ends on a corner,
    // ignore it.
    //
    if ((cleave_border_type[cleave_idx] == 'c') ||
        (cleave_border_type[cleave_idx] == '*')) {

      if (_debug > 2) { console.log("#vc.skip.1 (cbt[", cleave_idx, "] =", cleave_border_type[cleave_idx], ")"); }

      continue;
    }

    // If the cleave is rooted on a corner to begin with,
    // ignore it.
    //
    if (quarry_point_type[r_idx] == 'c') {

      if (_debug > 2) { console.log("#vc.skip.2 (qpt[", r_idx , "] =", quarry_point_type[r_idx], ")"); }
 
      continue;
    }


    // If there's a wedge between the the current cleave root and the opposite cleave root,
    // that must mean there's a corner in the middle so we can ignore it.
    //
    if ((Js[idir][ R[r_idx][1] ][ R[r_idx][0] ] != Js[idir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]) ||
        (Js[rdir][ R[r_idx][1] ][ R[r_idx][0] ] != Js[rdir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ])) {

      if (_debug > 2) { console.log("#vc.skip.3 (Js:",
        Js[idir][ R[r_idx][1] ][ R[r_idx][0] ], "!=", Js[idir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ], "||",
        Js[rdir][ R[r_idx][1] ][ R[r_idx][0] ], "!=", Js[rdir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]);
      }

      continue;
    }

    // if ...
    //if (cleave_border_type[rev_cleave_idx] == 'x') {
    if (cleave_border_type[rev_cleave_idx] == '*') {

      if (_debug > 2) { console.log("#vc.skip.4 (cbt[", rev_cleave_idx, "]:", cleave_border_type[rev_cleave_idx], ")"); }

      continue;
    }

    */


    // so now:
    // * there's a cleave cut or constructed line in the idir direction
    // * that doesn't end on a corner in the idir direction
    // * that isn't itself rooted from a corner
    // * with no wedge buffetting the side of the quarry
    //
    // That should mean the cleave cut in the idir direction ends on a border,
    // is connected to a free floating side of the quarry rectangle.
    // What's left is to check to see if there's a cleave cut in the opposite
    // direciton that lands on a corner.
    // If so, ignore, otherwise, this cleave cut is floating.
    //

    /*
    if ( ((cleave_choice[rev_cleave_idx] == '*') ||
          (cleave_choice[rev_cleave_idx] == 'c')) &&
         (cleave_border_type[rev_cleave_idx] != 'b') ) {

      if (_debug > 2) {
        console.log("#vc.skip.5 (cc[", rev_cleave_idx, "]:", cleave_choice[rev_cleave_idx],
        ", cbt[", rev_cleave_idx, "]:", cleave_border_type[rev_cleave_idx], ")");
      }

      continue;
    }
    */

    /*
    if (_debug > 1) {
      console.log("#vc.cp5.10: floating cleave cut found", "cleave_idx:", cleave_idx, "rect_idx:", r_idx);
    }

    return 0;
    */

    /*

    if ( (quarry_point_type[r_idx] != 'c') &&
         ((cleave_choice[cleave_idx] == '*') || (cleave_choice[cleave_idx] == 'c')) &&
         (cleave_border_type[cleave_idx] == 'b') &&
        //(redux[cleave_idx] == '*') && (cleave_border_type[cleave_idx] == 'b') &&
         (((redux[rev_cleave_idx] == '*') && (cleave_border_type[rev_cleave_idx] == 'b')) ||
           (redux[rev_cleave_idx] == '-') ||
           (cleave_border_type[rev_cleave_idx] == 'x')) &&
         (Js[idir][ R[r_idx][1] ][ R[r_idx][0] ] == Js[idir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]) &&
         (Js[rdir][ R[r_idx][1] ][ R[r_idx][0] ] == Js[rdir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ])) {

      if (_debug > 1) {
        console.log("#vc.cp5.5: cleave_idx:", cleave_idx, "rect_idx:", r_idx);
        console.log("qpt[", r_idx, "]:", quarry_point_type[r_idx],
          "redux[", cleave_idx, "]:", redux[cleave_idx],
          "cbt[", cleave_idx, "]:", cleave_border_type[cleave_idx],
          "redux[", rev_cleave_idx, "]:", redux[rev_cleave_idx],
          "cbt[", rev_cleave_idx, "]:", cleave_border_type[rev_cleave_idx],
          "js[", idir, "][", R[r_idx][1], "][", R[r_idx][0], "]:", Js[idir][ R[r_idx][1] ][ R[r_idx][0] ],
          "js[", idir, "][", R[rev_r_idx][1], "][", R[rev_r_idx][0], "]:", Js[idir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]);

        console.log("  QQ.0:", (quarry_point_type[r_idx] != 'c') );
        console.log("  QQ.1:", ((cleave_choice[cleave_idx] == '*') || (cleave_choice[cleave_idx] == 'c'))
          && (cleave_border_type[cleave_idx] == 'b') );
        //(redux[cleave_idx] == '*') && (cleave_border_type[cleave_idx] == 'b') &&
        console.log("  QQ.2:", (((redux[rev_cleave_idx] == '*') && (cleave_border_type[rev_cleave_idx] == 'b'))));
        console.log("  QQ.3:", (redux[rev_cleave_idx] == '-'));
        console.log("  QQ.4:",  (cleave_border_type[rev_cleave_idx] == 'x'));
        console.log("  QQ.5:",
          (Js[idir][ R[r_idx][1] ][ R[r_idx][0] ] == Js[idir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]) &&
          (Js[rdir][ R[r_idx][1] ][ R[r_idx][0] ] == Js[rdir][ R[rev_r_idx][1] ][ R[rev_r_idx][0] ]));


      }

      return 0;
    }
    else {

      if (_debug > 1) {
        console.log("NOPE!!!!",
          "qpt:", quarry_point_type.join(""),
          "cc:", cleave_choice.join(""),
          "redux:", redux.join(""),
          "cbt:", cleave_border_type.join("")
          );
      }
    }
    */

  //}

  if (_debug > 1) { console.log("#vc.cp6"); }

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

  //DEBUG
  //DEBUG
  //DEBUG
  //_debug=1;
  //DEBUG
  //DEBUG
  //DEBUG

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js;

  // boundary start and end index
  //
  let b_idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let b_idx_e = Bij[ g_e[1] ][ g_e[0] ];

  if (_debug > 1) {
    console.log("#ce.beg:s,e,g_s,g_e,g_a,g_b:", b_idx_s, b_idx_e, g_s, g_e, g_a, g_b);
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

  let cleave_nei = [ 1,0, 3,2, 5,4, 7,6 ];

  let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];

  let bvec = [],
      bvec_idx = [];
  for (let i=0; i<cleave_profile.length; i++) {
    if (cleave_profile[i] == '.') {
      bvec.push(0);
      bvec_idx.push(i);
    }
  }

  if (_debug > 1) {
    console.log("#ce.profile:", cleave_profile.join(""));
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
      else if (cleave_profile[i] == 'c') {
        cleave_choice[i] = '*';
      }

    }

    if (_debug > 1) {
      console.log("#ce.enum:bvec,cc,valid:", JSON.stringify(bvec), cleave_choice.join(""),
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
/*
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
*/

//WIP!!!
//UNTESTED!!!

// enumerate *docked* border edges to quarry edge by border index pairs
//
function RPRP_quarry_edge_ranges(ctx, g_a, g_b, g_s, g_e, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let X = ctx.X,
      Y = ctx.Y,
      Gij = ctx.Gij,
      B = ctx.B,
      Bij = ctx.Bij,
      Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;

  if ( (typeof g_s === "undefined") ||
       (typeof g_e === "undefined") ) {
    g_s = B[0];
    g_e = B[0];
  }

  //
  //  5    6    7
  //     2->-3
  //     |   |
  //  4  ^   v  0
  //     |   |
  //     1-<-0
  //  3    2    1
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let oppo_idir = [ 1,0, 3,2 ];

  let r_edge_idir = [1,2,0,3];
  let idir_ij = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let perim_range = [];

  for (let r_idx=0; r_idx<4; r_idx++) {
    let r_nxt = (r_idx+1)%4;
    let idir = r_edge_idir[r_idx];
    let rdir = oppo_idir[idir];

    let u = Rg[r_idx];
    let v = Rg[r_nxt];

    if (_debug > 1) {
      console.log("\nr_idx:", r_idx, "u:", u, "v:", v);
    }

    // b0 start of pit
    // b1 end of pit
    //

    // We're enumerating docked border edges to quarry rectangle.
    // b1 represents the *last* grid point on a border for this
    // edge,
    // b0 represents the *first* grid point on a border for
    // this edge

    let b1 = Bij[ u[1] ][ u[0] ];
    if (b1 < 0) {
      let w = v_add( u, v_mul( Jf[idir][ u[1] ][ u[0] ], idir_ij[idir] ) );
      let _d = dot_v( v_sub( v, w ), idir_ij[idir] );

      if (_debug > 2) {
        console.log("  _d1:", _d, "v-w:", v_sub(v,w), "idir[", idir, "]:", idir_ij[idir]);
      }

      if (_d < 0) { continue; }
      b1 = Bij[ w[1] ][ w[0] ];
    }
    let b1_ij = B[b1];

    // If b0 isn't already on a border,
    // skip ahead to border.
    // Once on the border, skip ahead to transition
    // point for start of iteration.
    //
    let b0 = Bij[ v[1] ][ v[0] ];
    if (b0 < 0) {

      let w = v_add( v, v_mul( Jf[rdir][ v[1] ][ v[0] ], idir_ij[rdir] ) );
      let _d = dot_v( v_sub( u, w ), idir_ij[rdir] );

      if (_debug > 2) {
        console.log("  _d0:", _d, "u-w:", v_sub(u,w), "rdir[", rdir, "]:", idir_ij[rdir]);
      }

      if (_d < 0) { continue; }
      b0 = Bij[ w[1] ][ w[0] ];
    }
    let b0_ij = B[b0];

    if (_debug > 2) {
      console.log("r_idx:", r_idx, "b0:", b0, "b1:", b1);
    }
   
    let max_iter = Math.max( X.length, Y.length ),
        iter = 0;

    let cur_b = b0;
    while ( wrapped_range_contain(cur_b, b0, b1) &&
            (cur_b != b1) ) {

      let _g = B[ cur_b ];


      // record flip distance to next transition,
      // add it to create _h (if 0, _h will just be _g),
      // and get the next border index point
      //
      let _dj = Jf[ rdir ][ _g[1] ][ _g[0] ];
      let _h = v_add( _g, v_mul( _dj, idir_ij[rdir] ) );
      let nxt_b = Bij[ _h[1] ][ _h[0] ];

      if (_debug > 1) {
        console.log("  r_idx:", r_idx, "_g:", JSON.stringify(_g), "cur_b:", cur_b, "dj[", rdir, "]:", _dj);
      }


      // if the flip extands past the quarry corner, clamp
      // nxt_b to b1, re-use _d below to indicate termination
      //
      let _d = dot_v( v_sub( b1_ij, _h ), idir_ij[rdir] );
      if (_d < 0) { nxt_b = b1; }

      // Make sure to add non-trivial dock ranges and, if so,
      // add our range.
      // Break if we've shot past
      //
      if (cur_b != nxt_b) {

        if (_debug > 1) {
          console.log("  perim:", cur_b, nxt_b);
        }

        perim_range.push( [cur_b, nxt_b] );
      }
      if (_d < 0) { break; }

      // increment, check oob
      //
      _h = v_add( _h, idir_ij[rdir] );
      if ( (_h[0] < 0) || (_h[1] < 0) ||
           (_h[0] >= X.length) || (_h[1] >= Y.length) ) {
        break;
      }
      nxt_b = Bij[ _h[1] ][ _h[0] ];

      // advance to first border point
      //
      if (Bij[ _h[1] ][ _h[0] ] < 0) {
        let _dhj = Jf[rdir][ _h[1] ][ _h[0] ];
        _h = v_add( _h, v_mul( _dhj, idir_ij[rdir] ) );
        nxt_b = Bij[ _h[1] ][ _h[0] ];

        if (_debug > 2) {
          console.log("  ##advance h>>:", JSON.stringify(_h), "nxt_b:", nxt_b, "(_dhj:", _dhj, ")");
        }

      }

      cur_b = nxt_b;

      iter++;
      if (iter >  max_iter) {
        console.log("SANITY ERROR: quarry_edge_ranges, exceeded max_iter:", iter, ">", max_iter );
        return undefined;
      }

      continue;

    }

  }

  if (perim_range.length == 0) { return []; }

  perim_range.sort( _cleave_cmp );
  let merged_perim = [ [perim_range[0][0], perim_range[0][1]] ];
  for (let i=1; i<perim_range.length; i++) {
    if (perim_range[i][0] == perim_range[i-1][1]) {
      merged_perim[ merged_perim.length-1 ][1] = perim_range[i][1];
    }
    else {
      merged_perim.push( [perim_range[i][0], perim_range[i][1]] );
    }
    
  }

  return merged_perim;
}


function __RPRP_quarry_edge_ranges(ctx, g_a, g_b, g_s, g_e, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let X = ctx.X,
      Y = ctx.Y,
      Gij = ctx.Gij,
      B = ctx.B,
      Bij = ctx.Bij,
      Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;

  if ( (typeof g_s === "undefined") ||
       (typeof g_e === "undefined") ) {
    g_s = B[0];
    g_e = B[0];
  }

  //
  //  5    6    7
  //     2->-3
  //     |   |
  //  4  ^   v  0
  //     |   |
  //     1-<-0
  //  3    2    1
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let oppo_idir = [ 1,0, 3,2 ];

  let r_edge_idir = [1,2,0,3];
  let idir_ij = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let perim_range = [];

  for (let r_idx=0; r_idx<4; r_idx++) {
    let r_nxt = (r_idx+1)%4;
    let idir = r_edge_idir[r_idx];
    let rdir = oppo_idir[idir];

    let u = Rg[r_idx];
    let v = Rg[r_nxt];

    console.log("\nr_idx:", r_idx, "u:", u, "v:", v);

    // b0 start of pit
    // b1 end of pit
    //
    // b0 and b1 denote start and end of sequence.
    // At each point in the iteration, we want to
    // add a cut segment which we'll do by
    // adding the current boundary point and the next
    // one.
    // After addition, current will be set to next
    // then jumped forward until b1 is reached.
    //

    let b1 = Bij[ u[1] ][ u[0] ];
    if (b1 < 0) {
      let w = v_add( u, v_mul( Jf[idir][ u[1] ][ u[0] ], idir_ij[idir] ) );
      let _d = dot_v( v_sub( v, w ), idir_ij[idir] );

      console.log("  _d1:", _d, "v-w:", v_sub(v,w), "idir[", idir, "]:", idir_ij[idir]);

      if (_d < 0) { continue; }
      b1 = Bij[ w[1] ][ w[0] ];
    }

    let b1_ij = B[b1];
    b1_ij = v_add( b1_ij, v_mul( Jf[idir][ b1_ij[1] ][ b1_ij[0] ], idir_ij[idir] ) );
    b1 = Bij[ b1_ij[1] ][ b1_ij[0] ];

    /*
    if (b1 >= 0) {

      // Skip to transition point (towards next Rg point).
      // If we've skipped past it, nothing to be done.
      //
      let w = v_add( u, v_mul( Jf[idir][ u[1] ][ u[0] ], idir_ij[idir] ) );

      let _d = dot_v( v_sub( v, w ), idir_ij[idir] );

      console.log("  _d1:", _d, "v-w:", v_sub(v,w), "idir[", idir, "]:", idir_ij[idir]);

      if (_d < 0) { continue; }
      b1 = Bij[ w[1] ][ w[0] ];
    }
    */

    // If b0 isn't already on a border,
    // skip ahead to border.
    // Once on the border, skip ahead to transition
    // point for start of iteration.
    //
    let b0 = Bij[ v[1] ][ v[0] ];
    if (b0 < 0) {

      let w = v_add( v, v_mul( Jf[rdir][ v[1] ][ v[0] ], idir_ij[rdir] ) );
      let _d = dot_v( v_sub( u, w ), idir_ij[rdir] );

      console.log("  _d0:", _d, "u-w:", v_sub(u,w), "rdir[", rdir, "]:", idir_ij[rdir]);

      if (_d < 0) { continue; }
      b0 = Bij[ w[1] ][ w[0] ];
    }

    let b0_ij = B[b0];
    b0_ij = v_add( b0_ij, v_mul( Jf[rdir][ b0_ij[1] ][ b0_ij[0] ], idir_ij[rdir] ) );
    b0 = Bij[ b0_ij[1] ][ b0_ij[0] ];

    console.log("r_idx:", r_idx, "b0:", b0, "b1:", b1);
   
    let max_iter = Math.max( X.length, Y.length ),
        iter = 0;


    // cur_b holds *end* of border
    // nxt_b holds *Beginning* of next border
    //

    //let b1_ij = B[b1];

    let cur_b = b0;
    while ( wrapped_range_contain(cur_b, b0, b1) &&
            (cur_b != b1) ) {

      let _g = B[ cur_b ];
      let _h = v_add( _g, idir_ij[rdir] );
      if ( (_h[0] < 0) || (_h[1] < 0) ||
           (_h[0] >= X.length) || (_h[1] >= Y.length) ) {
        break;
      }

      if (Bij[ _h[1] ][ _h[0] ] < 0) {
        _h = v_add( _h, v_mul( Jf[rdir][ _h[1] ][ _h[0] ], idir_ij[rdir] ) );
      }

      let _d = dot_v( v_sub( b1_ij, _h ), idir_ij[rdir] );
      if (_d < 0) { break; }

      let nxt_b = Bij[ _h[1] ][ _h[0] ];


      console.log("[", r_idx, "]: adding perim", cur_b, nxt_b);

      perim_range.push( [cur_b, nxt_b] );

      _g = v_add( B[ nxt_b ], v_mul( Jf[rdir][ _h[1] ][ _h[0] ], idir_ij[rdir] ) );
      cur_b = Bij[ _g[1] ][ _g[0] ];

      iter++;
      if (iter >  max_iter) {
        console.log("SANITY ERROR: quarry_edge_ranges, exceeded max_iter:", iter, ">", max_iter );
        return undefined;
      }

      continue;

      /*

      let _dj = Jf[rdir][ _g[1] ][ _g[0] ];

      let _h = [-1,-1];
      if (_dj == 0) {

        // _g is on a border but a 0 Jf indicates it's at a
        // transition.
        // Move ahead one in rdir direction.
        // If it's on a border, we're done, as it repreesents the
        // beginning of the border.
        // If not, we're in an open region and we need to shoot ahead
        // till where the border transitions.
        //

        _h = v_add( _g, idir_ij[rdir] );
        if (Bij[_h[1]][_h[0]] < 0) {
          _h = v_add( _h, v_mul( Jf[rdir][ _h[1] ][ _h[0] ], idir_ij[rdir] ) )
        }
      }
      else {

        // If _g is already on the border, move ahead to
        // where the current border line ends or turns.
        //
        _h = v_add( _g, v_mul( _dj, idir_ij[rdir] ) );
      }

      console.log("_h:", _h, "cur_b:", cur_b, "b0:", b0, "b1:", b1,
        "(dj:", _dj, ", Jf[", rdir, "][", _g[1], "][", _g[0], "]:", Jf[rdir][ _g[1] ][ _g[0] ], ")");

      let nxt_b = Bij[ _h[1] ][ _h[0] ];
      if (nxt_b != cur_b) {

        console.log(" perim.add:", "[", cur_b, nxt_b, "]");

        perim_range.push( [cur_b, nxt_b] );
      }

      _h = v_add( _h, idir_ij[rdir] );
      if ( (_h[0] < 0) || (_h[1] < 0) ||
           (_h[0] >= X.length) || (_h[1] >= Y.length) ) {
        break;
      }

      if ( Gij[ _h[1] ][ _h[0] ] < 0 ) { break; }

      cur_b = nxt_b;

      */

    }

  }

  return perim_range;
}



// next attempt at doing the validation and getting relevant information
// for quarry choice
//
// To avoid a combinatorial explosion, one-cuts are returned with a [-1,-1]
// adit placeholder.
//
// Return:
//
// {
//   valid    : 0 invalid, 1 valid
//   side_cut     : array of tuples representing start and end general boundary
//                  indices of guillotine cut
//   corner_cuts  : array of array of triples, where each triple consists of
//                  the start general boundary index, the end general boundary index
//                  and the adit grid point
//                  If it's a 1-cut, adit point is [-1,-1] with the assumption that
//                  the adit point will be iterated over at a higher level.
//   b_s      : general boundary start index
//   b_e      : general boundary end index
//   g_s      : general boundary start grid point
//   g_e      : general boundary end grid point
//   g_a      : adit point of quarry rectangle
//   g_b      : bower point of quarry rectangle
// }
//

function RPRPQuarryInfo(ctx, g_s, g_e, g_a, g_b, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  let oppo = [ 1,0, 3,2 ];

  let B = ctx.B;
  let Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;
  let Bij = ctx.Bij;

  let quarry_info = {
    "valid": 0,
    "side_cut": [],
    "corner_cuts": [],
    "b_s" : -1,   "b_e" : -1,
    "g_s" : g_s,  "g_e" : g_e,
    "g_a" : g_a,  "g_b" : g_b,
    "comment": ""
  };

  let candidate_corner_cuts = [];

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

  if (!RPRP_valid_R(ctx, g_a, g_b)) {
    quarry_info.comment = "invalid quarry rectangle";
    return quarry_info;
  }

  // quarry rectangle could be wholly contained in the rectilinear polygon
  // but not contained in the region we're considering.
  // It suffices to test each endpoint of the potentialy quarry rectangle
  // to be in the region.
  //
  for (let i=0; i<Rg.length; i++) {
    if (RPRP_point_in_region(ctx, Rg[i], g_s, g_e, g_a, _debug) == 0) {
      quarry_info.comment = "endpoint outside of fenced region (Rg[" + i.toString() + ":" + JSON.stringify(Rg[i]) + ")";
      return quarry_info;
    }
  }


  // If it's a 1cut,
  // make sure the quarry rectangle shares a non-degenerate edge
  // with the cut.
  // Exclude the special case when g_s == g_e, which should only
  // happen for the initial pick.
  //
  if ( ((g_s[0] == g_e[0]) ||
        (g_s[1] == g_e[1])) &&
       ((g_s[0] != g_e[0]) ||
        (g_s[1] != g_e[1])) ) {

    // free dimension for 1cut
    //
    let c_xy = ((g_s[0] == g_e[0]) ? 1 : 0);

    // order (g_s, g_e) line segment
    //
    let cut_ls = [
      [ Math.min(g_s[0], g_e[0]), Math.min(g_s[1], g_e[1]) ],
      [ Math.max(g_s[0], g_e[0]), Math.max(g_s[1], g_e[1]) ]
    ];


    let overlap = false;

    for (let r_idx=0; r_idx<Rg.length; r_idx++) {

      // free dimension for Rg line segment
      //
      let rl_xy = ((r_idx%2) ? 1 : 0);
      if (rl_xy != c_xy) { continue; }

      let r0 = Rg[r_idx];
      let r1 = Rg[(r_idx+1)%Rg.length];

      // order edge Rg line segment
      //
      let R_l = [
        [ Math.min(r0[0], r1[0]), Math.min(r0[1], r1[1]) ],
        [ Math.max(r0[0], r1[0]), Math.max(r0[1], r1[1]) ]
      ];

      // if line segments don't non-degeneratiely intersect, skip
      //
      // if ( A _ right <= B _ left ) or
      //    ( B _ right <= A _ left ) then
      //   line segments non-overlapping
      //
      if ( (cut_ls[0][c_xy] >= R_l[1][rl_xy]) ||
           (R_l[0][rl_xy] >= cut_ls[1][c_xy]) ) {
        continue;
      }

      overlap = true;
      break;
    }

    // if it's a 1-cut and the quarry edge doesn't non-degenerately share 
    // an edge with the cut, invalid choice, early return.
    //
    if (!overlap) {
      quarry_info.comment = "quarry doesn't share non-degenerate 1cut edge";
      return quarry_info;
    }

  }

  //---

  let idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let idx_e = Bij[ g_e[1] ][ g_e[0] ];

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
  let cleave_profile = RPRPCleaveProfile( ctx, g_s, g_e, g_a, g_b, _debug );

  for (let i=0; i<cleave_profile.length; i++) {
    let cur_tok = cleave_profile[i];
    let nei_tok = ((i%2) ? cleave_profile[(i+1)%8] : cleave_profile[(i+8-1)%8]);

    if (((cur_tok == 'b') || (cur_tok == 'c') || (cur_tok == '*')) &&
        ((nei_tok == 'b') || (nei_tok == 'c') || (nei_tok == '*'))) {
      quarry_info.comment = "cleave profile has bridge";
      return quarry_info;
    }
  }

  let cleave_choices = RPRP_cleave_enumerate( ctx, g_s, g_e, g_a, g_b, cleave_profile, _debug );
  let side_cleave_cuts = RPRP_enumerate_quarry_side_region( ctx, g_s, g_e, g_a, g_b, _debug );

  if (_debug > 1) {
    console.log("qci: profile:", cleave_profile.join(""));
    console.log("qci: cc:", JSON.stringify(cleave_choices));
    console.log("qci: scc:", JSON.stringify(side_cleave_cuts));
  }

  let forced_corner = false;
  for (let r_idx=0; r_idx<4; r_idx++) {
    if ((cleave_profile[2*r_idx] == '.') &&
        (cleave_profile[2*r_idx+1] == '.')) {
      forced_corner = true;
    }
  }

  if (forced_corner && (cleave_choices.length == 0)) {
    quarry_info.comment = "forced corner but no possible cleave cuts";
    return quarry_info;
  }

  // lookup tables for even/odd idirs along with their perpendicular directions.
  //
  let lu_e_idir = [ 0, 3, 1, 2 ];
  let lu_e_tdir = [ 2, 0, 3, 1 ];

  let lu_o_idir = [ 3, 1, 2, 0 ];

  for (let cci=0; cci < cleave_choices.length; cci++) {
    let cc = cleave_choices[cci];

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
      // We know the orthogonal direction must be a cut, either a quarry edge
      // that runs into a border or a quarry edge that turns into a cleave cut,
      // otherwise it wouldn't be a valid cleave choice.
      //
      if (cc[even_cleave_idx] == '*') {
        cleave_cuts.push([
          Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
          Js[ e_tdir ][ Rg[i][1] ][ Rg[i][0] ],
          [ Rg[i][0], Rg[i][1] ]
        ]);

        if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "e.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the clockwise neighbor (the 'odd' cleave cut) exists,
        // add another two-cut.
        //
        if (cc[odd_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "e.1a:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

        // Otherwise add a one-cut in-line with the quarry edge and the even cleave line,
        // taking the adit point as one of the 1-cut endpoints.
        //
        else {

          let _a = B[ Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ] ];

          let ipp = (even_cleave_idx + 2) % 8;
          let ip3 = (even_cleave_idx + 3) % 8;

          let is_one_cut = false;

          if ( (cc[ipp] != '*') &&
               (cleave_profile[ip3] != 'X') ) {
            is_one_cut = true;
          }

          let cw_i = (i+1)%4;

          if ( Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ] !=
               Js[ oppo[e_idir] ][ Rg[cw_i][1] ][ Rg[cw_i][0] ] ) {
            is_one_cut = true;
          }


          if (is_one_cut) {

            // we'll be enumerating adit points for the 1-cut, so use
            // a placeholder adit the invalid point [-1,-1]
            //
            cleave_cuts.push([
                Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ],
                Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
                [ -1, -1 ]
                //[ _a[0], _a[1] ]
              ]);

            if (_debug > 1) {console.log("qci: cci:", cci, "i:", i, "e.1b:", cleave_cuts[ cleave_cuts.length-1] ); }

          }
        }

      }

      // An odd cleave cut implies at least one two-cut with one constructed line.
      // If a cleave cut exists in an odd direction, 90 deg. clockwise has a
      // quarry boundary, so makes up the other constructed line cut of a 2-cut.
      //
      // If the even cleave cut exists (in the counterclockwise 90 deg. direction),
      // then we adda nother 2-cut.
      //
      // If the even cleave cut doesn't exist, we have a 1-cut in the counterclockwise
      // 180 deg. direction.
      //
      //
      //
      if (cc[odd_cleave_idx] == '*') {

        cleave_cuts.push([
          Js[ o_tdir ][ Rg[i][1] ][ Rg[i][0] ],
          Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
          [ Rg[i][0], Rg[i][1] ]
        ]);

        if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "o.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the previous counterclockwise neighbor (the 'even' cleave cut) exists,
        // add another two cut with both the even and odd constructed lines.
        //
        if (cc[even_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "o.1a:", cleave_cuts[ cleave_cuts.length-1] ); }

        }

        // Otherwise add a one-cut in-line with the Rectangle edge and odd cleave cut,
        // taking the adit poitn as one of the endpoints.
        //
        else {
          let _a = B[ Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ] ];

          let imm = (odd_cleave_idx + 8 - 2) % 8;
          let im3 = (odd_cleave_idx + 8 - 3) % 8;

          let is_one_cut = false;

          if ( (cc[imm] != '*') &&
               (cleave_profile[im3] != 'X') ) {
            is_one_cut = true;
          }

          let cc_i = (i+4-1)%4;

          if ( Js[ oppo[o_idir] ][ Rg[i][1] ][ Rg[i][0] ] !=
               Js[ oppo[o_idir] ][ Rg[cc_i][1] ][ Rg[cc_i][0] ] ) {
            is_one_cut = true;
          }

          if (is_one_cut) {

            // we'll be enumerating adit points for the 1-cut, so use
            // a placeholder adit the invalid point [-1,-1]
            //
            cleave_cuts.push([
              Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
              Js[ oppo[o_idir] ][ Rg[i][1] ][ Rg[i][0] ],
              [ -1, -1 ]
              //[ _a[0], _a[1] ]
            ]);

            if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "o.1b:", cleave_cuts[ cleave_cuts.length-1] ); }
          }

        }

      }

    }

    if (cleave_cuts.length == 0) { continue; }

    if (_debug > 1) {
      // we should put a sanity here to make sure the
      // deduplication is removing actual duplicates...
      //
      console.log("dup cleave cut(", cleave_cuts.length, ")");
      for (let _i=0; _i<cleave_cuts.length; _i++) {
        console.log("  [", _i, "]:", cleave_cuts[_i]);
      }
    }

    // sort and deduplicate
    //
    let dedup_cleave_cuts = [];
    cleave_cuts.sort( _cleave_cmp );

    // Hack for now, remove cleave cut that has whole exterior range.
    // two cut choice doesn't do region bounds testing, so this filters
    // out regions that cross into the excluded region.
    //
    let _cleave_cuts = [];
    for (let i=0; i<cleave_cuts.length; i++) {
      let cc = cleave_cuts[i];
      if (((cc[0] == idx_e) && (cc[1] == idx_s)) ) { continue; }
      _cleave_cuts.push( cleave_cuts[i] );
    }
    cleave_cuts = _cleave_cuts;

    // sanity checks
    //

    for (let i=0; i<cleave_cuts.length; i++) {

      let cc = cleave_cuts[i];

      if ( (wrapped_range_contain( cc[0], idx_s, idx_e ) == 0) ||
           (wrapped_range_contain( cc[1], idx_s, idx_e ) == 0) ||
           ((cc[0] == idx_e) && (cc[1] == idx_s)) ) {
        quarry_info.valid = -1;
        quarry_info.comment = "SANITY ERROR: nonsense cleave cut:" + cc.toString();
        return quarry_info;
      }

      if (i>0) {
        if ( (cleave_cuts[i-1][0] == cc[0]) &&
             (cleave_cuts[i-1][1] != cc[1]) ) {
          quarry_info.valid = -1;
          quarry_info.comment = "SANITY ERROR: nonsense cleave cut:" + cleave_cuts[i-1].toString() + " " + cc.toString();
          return quarry_info;
        }
      }

    }

    dedup_cleave_cuts.push( cleave_cuts[0] );
    for (let i=1; i<cleave_cuts.length; i++) {
      if (cleave_cuts[i-1][0] != cleave_cuts[i][0]) {
        dedup_cleave_cuts.push( cleave_cuts[i] );
      }
    }

    //quarry_info.two_cuts.push( dedup_cleave_cuts );
    //quarry_info.corner_cuts.push( dedup_cleave_cuts );
    candidate_corner_cuts.push( dedup_cleave_cuts );

  }

  // since the above batch cuts need to enumerate the adit points in the
  // main MIRP recursion, we're going to try only adding the one-cuts
  // here and let the adit enumeration happen in MIRP.
  //
  for (let i=0; i<side_cleave_cuts.length; i++) {

    //quarry_info.one_cuts.push([ side_cleave_cuts[i][0],
    //                            side_cleave_cuts[i][1],
    //                            [-1,-1] ]);
    quarry_info.side_cut.push([ side_cleave_cuts[i][0],
                                side_cleave_cuts[i][1],
                                [-1,-1] ]);
  }


  // We need to check that the cleave cuts yield a valid result.
  // For example, if there must be a cleave cut but there aren't
  // returned, this is an invalid quarry.
  //
  // To test for this, we catalogue all one-cuts, cleave cuts
  // and docked border ranges on the border of the quarry rectangle.
  // This should sweep out the entire perimeter of the rectilinear
  // polygon.
  // If not, some are missed and it's not a valid quarry.
  //

  let border_range = RPRP_quarry_edge_ranges(ctx, g_a, g_b, g_s, g_e, _debug);
  border_range.push( [idx_e, idx_s] );

  // consolidate/merge border ranges
  //
  let _tmp_br = [ [ border_range[0][0], border_range[0][1] ] ];
  for (let i=1; i<border_range.length; i++) {

    if ( border_range[i][0] == border_range[i-1][1] ) {
      _tmp_br[ _tmp_br.length-1 ][1] = border_range[i][1];
    }
    else {
      _tmp_br.push( [border_range[i][0], border_range[i][1]] );
    }

  }
  border_range = _tmp_br;


  /*
  if ((border_range.length == 1) &&
      (candidate_corner_cuts.length == 0)) {
    if (border_range[0][0] != border_range[0][1]) {
      quarry_info.comment = "non-sweeping border cut";
      return quarry_info;
    }

    // quarry is rectangle with no cuts?
    //
    quarry_info.valid = 1;
    return quarry_info;
  }
  */


  //console.log("border_range:", JSON.stringify(border_range));

  // one final check to make sure all partition ranges have been
  // accounted for.
  //
  let idx_range = [];
  let fin_corner_idx = [];
  
  if (_debug > 1) {
    console.log("seab:", JSON.stringify([g_s, g_e, g_a,g_b]));
  }

  let _found_partition = false;

  // maybe we can walk the boundary of the quarry to catalogue the
  // docked border and as them as ranges
  //
  let _n = ((candidate_corner_cuts.length==0) ? 1 : candidate_corner_cuts.length);
  //for (let sched_idx=0; sched_idx<candidate_corner_cuts.length; sched_idx++) {
  for (let sched_idx=0; sched_idx<_n; sched_idx++) {

    let _range = [];
    for (let i=0; i<quarry_info.side_cut.length; i++) {
      _range.push( [quarry_info.side_cut[i][0], quarry_info.side_cut[i][1] ] );
    }

    if (sched_idx < candidate_corner_cuts.length) {
      let corner_cut_batch = candidate_corner_cuts[sched_idx];
      for (let i=0; i<corner_cut_batch.length; i++) {
        _range.push( [corner_cut_batch[i][0], corner_cut_batch[i][1] ] );
      }
    }

    for (let i=0; i<border_range.length; i++) {
      _range.push( [border_range[i][0], border_range[i][1]] );
    }

    _range.sort( _cleave_cmp );

    if (_debug > 2) {
      console.log("  sched_idx:", sched_idx, "_range:", JSON.stringify(_range));
    }

    let _range_valid = true;
    //let se_found = [ false, false ];

    for (let i=0; i<_range.length; i++) {

      //if ( (_range[i][0] <= idx_s) && (idx_s <= _range[i][1]) ) { se_found[0] = true; }
      //if ( (_range[i][0] <= idx_e) && (idx_e <= _range[i][1]) ) { se_found[1] = true; }

      /*
      for (let b=_range[i][0]; b != _range[i][1]; b = ((b+1)%B.length) ) {
        if (!wrapped_range_contain(b, idx_s, idx_e)) {
          if (_debug > 1) { console.log("RANGE INVALID:", b, idx_s, idx_e, i); }
          _range_valid = false;
        }
      }
      */

      if ((i > 0) && (_range[i][0] != _range[i-1][1])) {

        if (_debug > 1) {
          console.log("RANGE INVALID.1:[", i, "]:",_range[i-1], _range[i], JSON.stringify( quarry_info.side_cut), JSON.stringify(candidate_corner_cuts));
        }

        _range_valid = false;
      }
    }

    if ( (!_range_valid) || (_range.length==0) ) {

      //console.log("_range invalid:", JSON.stringify(_range));

      continue;
    }

    let _fin_range = [ [_range[0][0], _range[0][1] ] ];
    for (let i=1; i<_range.length; i++) {
      if ( _range[i][0] == _range[i-1][1] ) {
        _fin_range[ _fin_range.length-1 ][1] = _range[i][1];
      }
      else {
        _fin_range.push( [ _range[i][0], _range[i][1] ] );
      }
    }

    if ( (_fin_range.length == 1) &&
         (_fin_range[0][0] == _fin_range[0][1]) ) {

      _found_partition = true;

      if (sched_idx < candidate_corner_cuts.length) {
        fin_corner_idx.push(sched_idx);
      }
    }
    else {
      //console.log("NOT adding sched_idx:", sched_idx, "(fin_range:", JSON.stringify(_fin_range), ")");
    }


    //if ( _range_valid && se_found[0] && se_found[1]) { fin_corner_idx.push(sched_idx); }

  }

  //if (fin_corner_idx.length == 0) {
  if (!_found_partition) {


    /*
    //DEBUG
    //DEBUG
    //DEBUG
    console.log("no valid cuts?? candidate_corner_cuts:", JSON.stringify(candidate_corner_cuts));
    console.log("  >>> cleave_profile:", cleave_profile.join(""));
    console.log("  >>> cleave_choices:", JSON.stringify(cleave_choices));
    console.log("  >>> side_cleave_cuts:", side_cleave_cuts);
    //DEBUG
    //DEBUG
    //DEBUG
    */

    quarry_info.comment = "no valid cuts";
    return quarry_info;
  }

  for (let i=0; i<fin_corner_idx.length; i++) {
    quarry_info.corner_cuts.push( candidate_corner_cuts[ fin_corner_idx[i] ] );
  }

  quarry_info.valid = 1;
  return quarry_info;
};



//------
//------
//------

// Take line segment from g_s to g_e and return all grid
// points within interior on the line.
// Meant for g_s and g_e to be on boundary but this isn't nceessary.
//
function RPRP_enumerate_one_cut_adit_points(ctx, g_s, g_e, _debug) {
  _debug = ((typeof _debug === "undefined") ? false : _debug);

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js,
      Je = ctx.Je;

  let oppo_idir = [ 1,0, 3,2 ];

  let adit_points = [];

  if ((g_s[0] != g_e[0]) &&
      (g_s[1] != g_e[1])) { return []; }

  let _m = [ Math.min(g_s[0], g_e[0]), Math.min(g_s[1], g_e[1]) ];
  let _M = [ Math.max(g_s[0], g_e[0]), Math.max(g_s[1], g_e[1]) ];

	let dij = v_delta( v_sub(_M, _m) );

	let idir = dxy2idir(dij);
	let rdir = oppo_idir[idir];

	let b_M = Je[idir][ _M[1] ][ _M[0] ];
	let b_m = Je[rdir][ _m[1] ][ _m[0] ];

	let g_M = _M,
			g_m = _m;
	if (b_M >= 0) { g_M = B[b_M]; }
	if (b_m >= 0) { g_m = B[b_m]; }

	// If we have a 1-cut, we know there's going to be at least one adit point at either
	// end of the 1-cut to consider.
	// So we can add it and then iterate through the rest.
	//
	let cur_ij = [ g_m[0], g_m[1] ];
	adit_points.push( [cur_ij[0], cur_ij[1] ] );
	do {
		cur_ij = v_add(cur_ij, dij );

    adit_points.push( [cur_ij[0], cur_ij[1] ] );
	} while (cmp_v(cur_ij, g_M) != 0);

  return adit_points;
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

    if (_debug > 1) {
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

      if (_debug > 1) {
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

        if (_debug > 1) {
          console.log("    _d:", _d, "|d idx|:", Math.abs(b_idx_nxt - b_idx_prv),
            "se:", se, "np:", np, "wrc:",
            wrapped_range_contain( b_idx_nxt, e_idx, s_idx ),
            wrapped_range_contain( b_idx_prv, e_idx, s_idx ));

        }

        // I'm having bounds dyslexia.
        // b_idx_nxt is the **start**, b_idx_prv is the **end**
        // Find fnence distance from **start** to **end**.
        // If **end** is less than start, add B.length
        //
        let __s = b_idx_nxt;
        let __e = b_idx_prv;

        let border_diff = __e - __s;
        if (border_diff < 0) { border_diff += B.length; }
        //if (__e < __s) { border_diff = __e + B.length - __s; }

        if (_debug > 1) {
          console.log(">>>>border_diff:", border_diff, "(prv:", b_idx_prv, "nxt:", b_idx_nxt, ")");
        }

        //if ((_d != Math.abs(b_idx_nxt - b_idx_prv)) &&
        if ((_d != border_diff) &&
            ( ((se[0] != np[0]) || (se[1] != np[1])) ) &&
            wrapped_range_contain( b_idx_nxt, s_idx, e_idx ) &&
            wrapped_range_contain( b_idx_prv, s_idx, e_idx ) ) {
          guillotine_list.push( [b_idx_nxt, b_idx_prv] );

          if (_debug) {
            console.log("  qsr.ADD(guillotine):", b_idx_nxt, b_idx_prv, "(se:", s_idx, e_idx,
              "contain(i,e,s):",
              wrapped_range_contain( b_idx_nxt, e_idx, s_idx ),
              wrapped_range_contain( b_idx_prv, e_idx, s_idx ),
              ")");
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

    if (_debug > 2) { console.log("#pir.0"); }

    return 0;
  }

  if (typeof g_s === "undefined") {
 
    if (_debug > 2) { console.log("#pir.1 t"); }

    return 1;
  }

  // sanity
  //
  let idx_s = Bij[ g_s[1] ][ g_s[0] ],
      idx_e = Bij[ g_e[1] ][ g_e[0] ];
  if ((idx_s < 0) || (idx_e < 0)) {

    if (_debug > 2) { console.log("#pir.2 error"); }

    return -1;
  }

  //---

  // If ij is already on border, we can do a wrapped range test
  //
  let ij_b_idx = Bij[ ij[1] ][ ij[0] ];
  if (ij_b_idx >= 0) {

    if (_debug > 2) { console.log("#pir.3 boundary"); }

    return wrapped_range_contain( ij_b_idx, idx_s, idx_e );
  }

  let b_count = 0;
  for (let idir=0; idir<4; idir++)  {
    b_count += wrapped_range_contain( Js[idir][ ij[1] ][ ij[0] ], idx_s, idx_e );
  }

  if (b_count < 2) {

    if (_debug > 2) { console.log("#pir.4 b_count", b_count); }

    return 0;
  }
  if (b_count > 2) {

    if (_debug > 2) { console.log("#pir.5 b_count", b_count); }

    return 1;
  }

  // degenerate if ij is on (g_s, g_a) or (g_a, g_e) constructed
  // line.
  //
  for (let xy=0; xy<2; xy++) {
    let yx = 1-xy;
    if ((ij[xy] == g_s[xy]) && (ij[xy] == g_a[xy])) {
      let mM = [ Math.min(g_s[yx], g_a[yx]), Math.max(g_s[yx], g_a[yx]) ];
      if ( (ij[yx] >= mM[0]) && (ij[yx] <= mM[1]) ) {
        return 1;
      }
    }

    if ((ij[xy] == g_a[xy]) && (ij[xy] == g_e[xy])) {
      let mM = [ Math.min(g_a[yx], g_e[yx]), Math.max(g_a[yx], g_e[yx]) ];
      if ( (ij[yx] >= mM[0]) && (ij[yx] <= mM[1]) ) {
        return 1;
      }
    }
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

  if (_debug > 2) { console.log("#pir.6 zsa", zsa, "zae", zae); }

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
// ???
// this might be cruft at this point, consider removing

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

// reverse index to get border cut points and 't' value
// (which corner the quarry adit point is)
//
function RPRP_DPidx2b(ctx, dp_idx) {
  let n = ctx.B.length;
  let _idx = dp_idx;

  let t = _idx % 2;
  _idx = Math.floor( _idx / 2 );

  let idx_s = _idx % n;
  _idx = Math.floor( _idx / n );

  let idx_e = _idx % n;
  
  return [ idx_s, idx_e, t ];
}

// lightly tested
//
function RPRP_DPidx2g(ctx, dp_idx) {

  let s_e_t = RPRP_DPidx2b(ctx, dp_idx);

  let g_s = ctx.B[ s_e_t[0] ];
  let g_e = ctx.B[ s_e_t[1] ];

  let g_a = [-1,-1];

  // g_s in line with g_e (1-cut)
  //
  if ((g_s[0] == g_e[0]) ||
      (g_s[1] == g_e[1])) {

    if (s_e_t[2] == 0) {
      g_a[0] = g_s[0];
      g_a[1] = g_e[1];
    }

    else {
      g_a[0] = g_e[0];
      g_a[1] = g_s[1];
    }

    return [ g_s, g_e, g_a ];
  }

  // g_s diagonal to g-e
  //

  let g_a0 = [ g_s[0], g_e[1] ];
  let g_a1 = [ g_e[0], g_s[1] ];

  let s_3 = [g_s[0], g_s[1], 0];
  let e_3 = [g_e[0], g_e[1], 0];
  let a0_3 = [g_a0[0], g_a0[1], 0];
  let a1_3 = [g_a1[0], g_a1[1], 0];

  let v0 = cross3( v_sub(a0_3, s_3), v_sub(e_3, s_3) );
  let v1 = cross3( v_sub(a1_3, s_3), v_sub(e_3, s_3) );

  let t0 = ((v0[2] > 0) ? 0 : 1);
  let t1 = ((v1[2] > 0) ? 0 : 1);

  g_a = g_a0;
  if (s_e_t[2] == t1) { g_a = g_a1; }


  return [ g_s, g_e, g_a ];
}

// The one-cuts need to take the adit point in-line with
// the cut line, exploding the number of adit points
// available for the DP array.
// Instead, we use a DP hash with a custom key.
//
function RPRP_DP_idx(ctx, g_s, g_e, g_a) {
  let B = ctx.B;
  let Bij = ctx.Bij;

  let idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let idx_e = Bij[ g_e[1] ][ g_e[0] ];

  let key = idx_s.toString() + ":" +
            idx_e.toString() + ";" +
            g_a[0].toString() + "," + g_a[1].toString();

  return key;
}

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
function _RPRP_DP_idx(ctx, g_s, g_e, g_a) {
  let B = ctx.B;
  let Bij = ctx.Bij;

  let n = B.length;

  let idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let idx_e = Bij[ g_e[1] ][ g_e[0] ];

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
  let dx = Math.abs(g_b[0] - g_a[0]);
  let dy = Math.abs(g_b[1] - g_a[1]);

  return 2*(dx+dy);
}

function _ws(n, s, pfx) {
  n = ((typeof n === "undefined") ? 0 : n);
  s = ((typeof s === "undefined") ? ' ' : s);
  pfx = ((typeof pfx === "undefined") ? "" : pfx);
  let a = [];
  for (let i=0; i<n; i++) { a.push(s); }
  return pfx + a.join("");
}

// try to separate out bower list for future optimizations.
//
//
function RPRP_candidate_bower(ctx, g_s, g_e, g_a, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let X = ctx.X,
      Y = ctx.Y;

  let candidate_bower = [];

  for (let j=0; j<Y.length; j++) {
    for (let i=0; i<X.length; i++) {
      candidate_bower.push([i,j]);
    }
  }
  
  return candidate_bower;
}

//WIP!!

function _dbg_mirp_beg(_debug, _pfx,  g_s, g_e, b_s, b_e, g_a) {
  if (_debug) {
    console.log("\n" + _pfx + ".beg:",
      "g_s:", JSON.stringify(g_s), "(" + b_s.toString() + ")",
      "g_e:", JSON.stringify(g_e), "(" + b_e.toString() + ")",
      "g_a:", g_a);
  }
}

function _dbg_mirp_dp(_debug, _pfx, ctx, dp_idx, g_s, g_e, g_a) {
  if (_debug) {
    console.log( _pfx + ".memz: DP_cost[", dp_idx, "] ->", ctx.DP_cost[dp_idx],
      "(g_s:", JSON.stringify(g_s), "g_e:", JSON.stringify(g_e), "g_a:", JSON.stringify(g_a), ")");
  }
}

function _dbg_mirp_bower(_debug, _pfx, candidate_bower) {
  if (_debug > 0) {
    console.log( _pfx + "bower:", JSON.stringify(candidate_bower));
  }
}

function _dbg_mirp_quarry_skip(_debug, _pfx, g_s, g_e, g_a, g_b, comment) {
  if (_debug > 1) {
    //console.log( _ws(2*lvl), "skipping", g_s, g_e, g_a, g_b, "(", qi.comment, ")");
    console.log( _pfx, "skipping", g_s, g_e, g_a, g_b, "(", comment, ")");
  }
}


function _dbg_mirp_quarry_info(_debug, _pfx, lvl, g_s, g_e, g_a, g_b, qi, a_pnt, b_pnt, quarry_rect_cost) {
  if (_debug) {
    console.log( _pfx, "considering:", "(g_s:", g_s, "g_e:", g_e, "g_a:", g_a, "g_b:", g_b, ")",
      "(#side:", qi.side_cut.length, "#corner:", qi.corner_cuts.length, ")");
    console.log( _pfx, "side_cut:", JSON.stringify(qi.side_cut));
    console.log( _pfx, "corner_cuts:", JSON.stringify(qi.corner_cuts));
    console.log( _pfx, "mirp." + lvl.toString(),
      "ink:", quarry_rect_cost, _Ink(a_pnt, b_pnt), "(g_ab:", g_a, g_b, "ab_pnt:", a_pnt, b_pnt, ")");
  }
}


function RPRP_MIRP(ctx, g_s, g_e, g_a, lvl, _debug, _debug_str) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  _debug_str = ((typeof _debug_str === "undefined") ? "" : _debug_str);
  lvl = ((typeof lvl === "undefined") ? 0 : lvl);

  let _debug_id = _debid();
  let _pfx = _ws(2*lvl) + "mirp." + lvl.toString() + "(" + _debug_str + " -> " + _debug_id + ")";
  _debug_str = _debug_id;

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

  let _min_cost = -1,
      _min_partition = [],
      _min_bower = [-1,-1],
      _min_rect = [];

  let _init = false;
  if (typeof g_s === "undefined") {
    g_s = B[0];
    g_e = B[0];
    g_a = B[0];
    _init = true;
  }

  let b_s = Bij[ g_s[1] ][ g_s[0] ];
  let b_e = Bij[ g_e[1] ][ g_e[0] ];

  _dbg_mirp_beg(_debug, _pfx, g_s, g_e, b_s, b_e, g_a);

  // default to first entry on border.
  //
  if (_init) { ctx.DP_root_key = [0,0,[g_a[0],g_a[1]]]; }

  // See if it's already memoized, if so, return it
  //
  let dp_idx = RPRP_DP_idx(ctx, g_s, g_e, g_a);
  if ( (dp_idx in ctx.DP_cost) && (ctx.DP_cost[dp_idx] >= 0) ) {

    _dbg_mirp_dp(_debug, _pfx, ctx, dp_idx, g_s, g_e, g_a);

    return ctx.DP_cost[dp_idx];
  }

  // We get a list of bower points, check for a valid rectangle
  // and quarry and, if valid:
  //
  // * store the result if it's a simple rectangle
  // * recur on all side cuts, enumerating through each potential adit point
  // * recur on all corner cuts, either taking the two cuts as is
  //   or enumerating adit cuts
  //
  let candidate_bower = RPRP_candidate_bower(ctx, g_s, g_e, g_a);

  _dbg_mirp_bower(_debug, _pfx, candidate_bower );

  for (let bower_idx = 0; bower_idx < candidate_bower.length; bower_idx++) {
    let g_b = candidate_bower[bower_idx];

    let qi = RPRPQuarryInfo(ctx, g_s, g_e, g_a, g_b, _debug);
    if (qi.valid == 0) {

      if (_debug) {
        console.log( _pfx, "skip [", JSON.stringify(g_a), JSON.stringify(g_b), "]", "(", qi.comment, ")");
      }

      _dbg_mirp_quarry_skip(_debug, _pfx, g_s, g_e, g_a, g_b, qi.comment);
      continue;
    }

    if (_debug) {
      console.log( _pfx, "considering quarry: [", JSON.stringify(g_a), JSON.stringify(g_b), "]");
    }


    let a_pnt = Gxy[ Gij[ g_a[1] ][ g_a[0] ] ];
    let b_pnt = Gxy[ Gij[ g_b[1] ][ g_b[0] ] ];

    let quarry_rect_cost = _Ink(a_pnt, b_pnt);

    let _min_corner_cut_cost = 0;
    let _min_corner_cut_sched_idx = -1;

    let _min_side_cut_cost = 0;
    let _min_side_cut = [];

    _dbg_mirp_quarry_info(_debug, _pfx, lvl, g_s, g_e, g_a, g_b, qi, a_pnt, b_pnt, quarry_rect_cost);

    for (let sched_idx=0; sched_idx < qi.side_cut.length; sched_idx++) {
      let one_cut = qi.side_cut[sched_idx];

      let candidate_adit = RPRP_enumerate_one_cut_adit_points(ctx, B[one_cut[0]], B[one_cut[1]], _debug);

      let _min_idx = -1;
      let _min_g_a = [-1,-1];

      let one_cut_cost = 0;
      for (let adit_idx=0; adit_idx < candidate_adit.length; adit_idx++) {
        let g_a = candidate_adit[adit_idx];

        let _cost = RPRP_MIRP(ctx, B[one_cut[0]], B[one_cut[1]], g_a, lvl+1, _debug, _debug_str);

        if (_debug) {
          console.log( _pfx, "cost of ", one_cut[0], one_cut[1], JSON.stringify(g_a), ":", _cost);
        }

        if ( (_cost > 0) &&
             ((_min_idx < 0) ||
              (_cost < one_cut_cost)) ) {
          one_cut_cost = _cost;
          _min_idx = adit_idx;
          _min_g_a = [ g_a[0], g_a[1] ];

          if (_debug) {
            console.log( _pfx, "updating side_cut, current min cost (", _cost, ", _min_idx:", adit_idx, ", g_a:", JSON.stringify(g_a), ")");
          }

        }

        if (_debug) {
          console.log( _pfx, "side_cut[", sched_idx, "]", "_cost:", _cost,
            "one_cut_cost:", one_cut_cost, "min_idx:", _min_idx, "g_a:", JSON.stringify(_min_g_a) );
        }


      }

      //ERROR
      if (_min_idx < 0) {
        _ERROR("MIRP" + lvl.toString() + ": no valid side one cut found: " +
               "sched[" + sched_idx.toString() + "]: " + JSON.stringify(qi.side_cut[sched_idx]));
        return -1;
      }

      //if (one_cut_cost >= 0) {

      if (_debug > 0) {
        console.log(_pfx, "ADDING one_cut_cost:", one_cut_cost, "one_cut[", one_cut[0], one_cut[1], JSON.stringify(_min_g_a), "]");
      }

        _min_side_cut_cost += one_cut_cost;
        //_min_one_cut.push( one_cut[_min_idx] );
        _min_side_cut.push( [ one_cut[0], one_cut[1], _min_g_a ] );
      //}

      if (_debug) {
        console.log( _pfx, "one_cut[", sched_idx, "] (#", candidate_adit.length, "):", one_cut_cost, ", _min_side_cut_cost:", _min_side_cut_cost);
      }

    }

    // take min of sched....
    //
    for (let sched_idx=0; sched_idx<qi.corner_cuts.length; sched_idx++) {
      let cut_batch = qi.corner_cuts[sched_idx];

      //console.log(_pfx, "corner>>>>", sched_idx, JSON.stringify(cut_batch));

      let cur_cut_cost = 0;
      for (let ci=0; ci<cut_batch.length; ci++) {

        let cut = cut_batch[ci];

        let _g_s = B[cut[0]];
        let _g_e = B[cut[1]];
        let _g_a = cut[2];


        if ( (_g_s[0] != _g_e[0]) &&
             (_g_s[1] != _g_e[1]) ) {

          // two-cut
          //
          cur_cut_cost += RPRP_MIRP(ctx, _g_s, _g_e, _g_a, lvl+1, _debug, _debug_str);
          continue;
        }

        //else one-cut
        //
        let _min_one_cut_cost = -1;
        let candidate_adit = RPRP_enumerate_one_cut_adit_points(ctx, _g_s, _g_e, _debug);

        //console.log(">>> candidate_adit:", JSON.stringify(candidate_adit));

        for (let adit_idx=0; adit_idx < candidate_adit.length; adit_idx++) {

          let _cost = RPRP_MIRP(ctx, _g_s, _g_e, candidate_adit[adit_idx], lvl+1, _debug, _debug_str);
          if (_cost < 0) { continue; }

          // update min cost and update adit point used
          // inside of the actual corner cut schedule.
          // The adit point will be used to construct the key
          // in the DP array/structure.
          //
          if ( (_min_one_cut_cost < 0) ||
               (_cost < _min_one_cut_cost) ) {
            _min_one_cut_cost = _cost;
            qi.corner_cuts[sched_idx][ci][2][0] = candidate_adit[adit_idx][0];
            qi.corner_cuts[sched_idx][ci][2][1] = candidate_adit[adit_idx][1];
          }
        }

        // sanity
        //
        if (_min_one_cut_cost < 0) {
          if (_debug) {
            console.log(_pfx, "SANITY ERROR: _min_one_cut_cost < 0! cut_batch[", sched_idx, "]:", JSON.stringify(cut_batch));
          }
          return -1;
        }

        cur_cut_cost += _min_one_cut_cost;
      }

      if (_debug) {
        console.log( _pfx, "cur_cut_cost:", cur_cut_cost, "(sched_idx:", sched_idx, ")");
      }

      if ((_min_corner_cut_sched_idx < 0) ||
          (cur_cut_cost < _min_corner_cut_cost)) {
        _min_corner_cut_cost = cur_cut_cost;
        _min_corner_cut_sched_idx = sched_idx;
      }

    }

    if ((_min_cost < 0) ||
        ((quarry_rect_cost + _min_side_cut_cost + _min_corner_cut_cost) < _min_cost) ) {

      let _corner_cut_batch  = [];
      if (_min_corner_cut_sched_idx >= 0) {
        _corner_cut_batch = qi.corner_cuts[_min_corner_cut_sched_idx];
      }

      _min_cost = quarry_rect_cost + _min_side_cut_cost + _min_corner_cut_cost;
      _min_rect = [ [ g_a[0], g_a[1] ], [ g_b[0], g_b[1] ] ];
      _min_partition = [ _min_side_cut, _corner_cut_batch ];
      //_min_partition = [ min_side_cut, min_corner_cuts ];

      if (_debug) {
        console.log(_pfx, "updating min: _min_cost:", _min_cost, "_min_rect:", _min_rect,
          "_min_part:", JSON.stringify(_min_partition), "(_min_core_cut_sched_idx:", _min_corner_cut_sched_idx,")");
      }

    }

    if (_debug) {
      //console.log( _ws(2*lvl), "_min_cost:", _min_cost, "scost:", quarry_rect_cost + _min_side_cut_cost + _min_corner_cut_cost,
      console.log( _pfx, "_min_cost:", _min_cost, "scost:", quarry_rect_cost + _min_side_cut_cost + _min_corner_cut_cost,
      "(", quarry_rect_cost, "+", _min_side_cut_cost, "+", _min_corner_cut_cost, ")");
    }

  }

  if (_min_cost >= 0) {
    ctx.DP_cost[dp_idx]       = _min_cost;
    ctx.DP_rect[dp_idx]       = _min_rect;
    ctx.DP_bower[dp_idx]      = _min_bower;
    ctx.DP_partition[dp_idx]  = _min_partition;


    if (_debug) {
      console.log(_pfx, "DPCOST[", dp_idx, "]:", _min_cost, JSON.stringify(_min_rect), JSON.stringify(_min_bower), JSON.stringify(_min_partition));
    }

  }

  if (_debug) {
    //console.log( _ws(2*lvl), "mirp." + lvl.toString(), "<<<", "(_min_cost:", _min_cost, ")");
    console.log( _pfx, "<<<", "(_min_cost:", _min_cost, ")");
  }


  //_init = false;
  if (_init) {
    let plist = [];
    let Qkey = [ ctx.DP_root_key ];

    while (Qkey.length > 0) {
      let p = Qkey.pop();
      plist.push(p);

      let key = RPRP_DP_idx(ctx, B[p[0]], B[p[1]], p[2]);


      //console.log("???", key, ctx.DP_partition);
      //_print_dp(ctx);

      if (key in ctx.DP_partition) {

        let one_cut = ctx.DP_partition[key][0];
        let two_cut = ctx.DP_partition[key][1];

        for (let i=0; i<one_cut.length; i++) { Qkey.push( one_cut[i] ); }
        for (let i=0; i<two_cut.length; i++) { Qkey.push( two_cut[i] ); }
      }

      else {
        console.log("KEY ERROR:", key, "not found in DP_partition");
      }
    }

    ctx["partition"] = plist;

    /*
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    _print_dp(ctx);
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    */

  }

  return _min_cost;
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
    //[ ['-','c','X','c','-','*','-','*'] ],
    [ ['-','*','X','*','-','*','-','*'] ],
    _sfmt("pgn_pinwheel_1", 16, 'r') );


  let grid_info_2 = RPRPInit(pgn_balance);
  let cp_2 = RPRPCleaveProfile(grid_info_2, [7,1], [5,4], [7,4], [2,5]);
  let cc_2 = RPRP_cleave_enumerate(grid_info_2, [7,1], [5,4], [7,4], [2,5], cp_2);
  let v_2 = _expect( cc_2, 
    //[ ["-","c","*","-","*","-","*","-"],
    //  ["-","c","*","-","*","-","-","*"]],
    [ ["-","*","*","-","*","-","*","-"],
      ["-","*","*","-","*","-","-","*"]],
    _sfmt("pgn_balance_2", 16,'r') );

  if (!v_2) {
    let _e = [ ["-","*","*","-","*","-","*","-"],
            ["-","*","*","-","*","-","-","*"]];

    for (let i=0; i<cc_2.length; i++) {
      console.log("got:", cc_2[i].join(""));
    }
    for (let i=0; i<_e.length; i++) {
      console.log("xct:", _e[i].join(""));
    }
  }

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

  console.log("NO");

  /*
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
  */


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

//
//
function _main_custom_7() {
  let _debug = 1;

  let g_s = [3,1],
      g_e = [4,4],
      g_a = [3,4],
      g_b = [6,1];

  let grid_info_x = RPRPInit(pgn_bb_test);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);
  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  console.log("valid:", RPRP_valid_quarry(grid_info_x, g_s, g_e, g_a, g_b));

  console.log("profile:", cp_x);
  console.log("cleave_enum:", cc_x);
  console.log("cleave_side:", cs_x);

}

//
//
function _main_custom_8() {
  let _debug = 1;

  let g_s = [1,5],
      g_e = [2,6],
      g_a = [1,6],
      g_b = [3,2];

  let grid_info_x = RPRPInit(pgn_bb_test1);
  _print_rprp(grid_info_x);

  let qi = RPRPQuarryInfo(grid_info_x, g_s, g_e, g_a, g_b);
  console.log("valid:", qi.valid, "(", qi.comment,")");
  console.log("one_cut:", JSON.stringify(qi.one_cut));
  console.log("two_cuts:", JSON.stringify(qi.two_cuts));

}

// This has a bridge ([1,1] to [3,1])
// but we've decided to let it go.
// It's a special case that should get subsumed by
// the recursion.
// It's not an error to recur from this quarry rectangle
// but it means the calculation won't be optimal.
//
// Intead of mkaing a special heuristic to optimize away
// this case, we let it be and know that if the recursion
// is working properly, it won't be considered as optimal.
//
function _main_custom_9() {
  let _debug = 1;

  let g_s = [1,5],
      g_e = [2,6],
      g_a = [1,6],
      g_b = [3,1];

  let grid_info_x = RPRPInit(pgn_bb_test1);
  _print_rprp(grid_info_x);

  let qi = RPRPQuarryInfo(grid_info_x, g_s, g_e, g_a, g_b);
  console.log("valid:", qi.valid, "(", qi.comment,")");
  console.log("one_cut:", JSON.stringify(qi.one_cut));
  console.log("two_cuts:", JSON.stringify(qi.two_cuts));

}

function _main_custom_10() {
  let _debug = 1;

  let g_s = [0,1],
      g_e = [1,1],
      g_a = [0,1],
      g_b = [1,2];

  let g_a1 = [1,1];

  let grid_info_x = RPRPInit(pgn_ell);
  _print_rprp(grid_info_x);

  let l_idx = RPRP_DP_idx(grid_info_x, g_s, g_e, g_a);
  let r_idx = RPRP_DP_idx(grid_info_x, g_s, g_e, g_a1);


  console.log("g_s:", g_s, "g_e:", g_e, "g_a0:", g_a, "g_a1:", g_a1, "g_b:", g_b);

  console.log("l_idx:", l_idx, "r_idx:", r_idx);

  console.log(RPRP_DPidx2b(grid_info_x, l_idx), RPRP_DPidx2b(grid_info_x, r_idx));
  console.log(RPRP_DPidx2g(grid_info_x, l_idx), RPRP_DPidx2g(grid_info_x, r_idx));
}

function _main_custom_11() {
  let _debug = 1;

  let g_s = [0,0],
      g_e = [0,0],
      g_a = [0,0],
      g_b = [1,1];


  let ctx = RPRPInit(pgn_ell);
  _print_rprp(ctx);

  let qi = RPRPQuarryInfo(ctx, g_s, g_e, g_a, g_b);

  console.log(JSON.stringify(qi, undefined, 2));

}

function _main_mirp_square() {
  let ctx_sq = RPRPInit( [[0,0], [10,0], [10,10], [0,10]] );
  let v_sq = RPRP_MIRP(ctx_sq);
  console.log("mirp.sq:", v_sq);
  return;
}


function _main_mirp_L() {

  let _u = undefined;

  let ctx_L = RPRPInit( pgn_ell );
  let v_L = RPRP_MIRP(ctx_L, _u, _u, _u, 0, 2);
  _print_dp(ctx_L);
  console.log("mirp.L:", v_L);
  return;
}

function _main_mirp_z() {
  let ctx_z = RPRPInit( pgn_z );

  //let v_z = RPRP_MIRP(ctx_z);
  let _u = undefined;
  let v_z = RPRP_MIRP(ctx_z, _u, _u, _u, 0, 2);

  _print_dp(ctx_z);
  console.log("mirp.z:", v_z);
  return;
}

function _main_mirp_pinwheel() {
  let ctx = RPRPInit( pgn_pinwheel_sym );
  let _u = undefined;
  let v = RPRP_MIRP(ctx, _u, _u, _u, 0, 2);

  _print_dp(ctx);

  console.log("mirp:", v);
  return;
}

function _main_mirp_test() {
  let ctx = RPRPInit( pgn_pinwheel1 );
  let _u = undefined;
  let v = RPRP_MIRP(ctx, _u, _u, _u, 0, 2);

  _print_dp(ctx);

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

function _main_cli(argv) {
  let pgn_a = JSON.parse(argv[0]);
  //let g_s = JSON.parse(argv[1]);
  //let g_e = JSON.parse(argv[2]);
  //let g_a = JSON.parse(argv[3]);
  //let g_b = JSON.parse(argv[4]);

  let ctx = RPRPInit( pgn_a );
  _print_rprp(ctx);

}

async function _main_data(argv) {

  let _debug = 0;

  let data = "";
  for await (let chunk of process.stdin) {
    data += chunk;
  }

  let data_info = JSON.parse(data);

  if ("debug" in data_info) { _debug = data_info.debug; }

  if (data_info.op == "QuarryInfo") {

    let ctx = RPRPInit(data_info.C);
    let qi = RPRPQuarryInfo( ctx,
                             data_info.g_s, 
                             data_info.g_e, 
                             data_info.g_a, 
                             data_info.g_b, _debug);
    console.log("{");
    console.log('  "valid":', qi.valid, ",");

    if (qi.side_cut.length == 0) { console.log('  "side_cut": [],'); }
    else {
      console.log('  "side_cut": [');
      for (let i=0; i<qi.side_cut.length; i++) {
        let sfx = ((i == (qi.side_cut.length-1)) ? "" : ",");
        console.log( JSON.stringify(qi.side_cut[i]) + sfx );
      }
      console.log('  ],');
    }

    if (qi.corner_cuts.length == 0) { console.log('  "corner_cuts": [],'); }
    else {
      console.log('  "corner_cuts": [');
      for (let i=0; i<qi.corner_cuts.length; i++) {
        let sfx = ((i == (qi.corner_cuts.length-1)) ? "" : ",");
        console.log( "    " + JSON.stringify(qi.corner_cuts[i]) + sfx );
      }
      console.log('  ],');
    }

    console.log('  "b_s": ' + JSON.stringify(qi.b_s) + ', "b_e": ' + JSON.stringify(qi.b_e) + ',');
    console.log('  "g_s": ' + JSON.stringify(qi.g_s) + ', "g_e": ' + JSON.stringify(qi.g_e) + ',');
    console.log('  "g_a": ' + JSON.stringify(qi.g_a) + ', "g_b": ' + JSON.stringify(qi.g_b) + ',');
    console.log('  "comment": ' + JSON.stringify(qi.comment) );

    console.log("}");
  }

  else if (data_info.op == "MIRP") {
    let ctx = RPRPInit(data_info.C);
    let _u = undefined;
    let v = RPRP_MIRP(ctx, _u, _u, _u, 0, _debug);

    _print_dp(ctx);

    console.log("mirp:", v);

    if (("expect" in data_info) &&
        ("return" in data_info.expect)) {
      if (v == data_info.expect.return) { console.log("pass"); }
      else { console.log("FAIL: got:", v, "expect:", data_info.expect.return); }
    }
    return;
  }

  else if (data_info.op == "quarry_edge_ranges") {
    let ctx = RPRPInit(data_info.C);
    _print_rprp(ctx);

    let res = RPRP_quarry_edge_ranges(ctx,
                                    data_info.g_a,
                                    data_info.g_b,
                                    data_info.g_s,
                                    data_info.g_e, _debug);

    if (_debug) { console.log(res); }

    if (("expect" in data_info) &&
        ("return" in data_info.expect)) {
      let result_str = JSON.stringify(res);
      let expect_str = JSON.stringify(data_info.expect.return);
      if (result_str == expect_str) { console.log("pass"); }
      else { console.log("FAIL: got:", result_str, "expect:", expect_str); }
    }
    return;

  }

  else if (data_info.op == "print") {
    let ctx = RPRPInit(data_info.C);
    _print_rprp(ctx);
  }

}


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
  else if (op == 'mirp.sq')    { _main_mirp_square(); }
  else if (op == 'mirp.L')    { _main_mirp_L(); }
  else if (op == 'mirp.z')    { _main_mirp_z(); }
  else if (op == 'mirp.pinwheel')    { _main_mirp_pinwheel(); }

  else if (op == "cli") { _main_cli(process.argv.slice(3)); }
  else if (op == "data") { _main_data(process.argv.slice(3)); }

  else if (op == 'custom')  { _main_custom(); }
  else if (op == 'custom.1')  { _main_custom_1(); }
  else if (op == 'custom.2')  { _main_custom_2(); }
  else if (op == 'custom.3')  { _main_custom_3(); }
  else if (op == 'custom.4')  { _main_custom_4(); }
  else if (op == 'custom.5')  { _main_custom_5(); }
  else if (op == 'custom.6')  { _main_custom_6(); }
  else if (op == 'custom.7')  { _main_custom_7(); }
  else if (op == 'custom.8')  { _main_custom_8(); }
  else if (op == 'custom.9')  { _main_custom_9(); }
  else if (op == 'custom.10')  { _main_custom_10(); }
  else if (op == 'custom.11')  { _main_custom_11(); }
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
    "init" : RPRPInit,
    "fasslib": fasslib,
    "mirp": RPRP_MIRP,
    "QuarryInfo": RPRPQuarryInfo
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }
}


