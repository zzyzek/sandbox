// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var fasslib = require("./fasslib.js");

var norm2_v = fasslib.norm2_v;
var v_sub = fasslib.v_sub;
var v_mul = fasslib.v_mul;
var dot_v = fasslib.dot_v;
var cross3 = fasslib.cross3;

var pgon = [
  [1,0],
  [1,2],
  [0,2],
  [0,4],
  [2,4],
  [2,5],
  [4,5],
  [4,3],
  [5,3],
  [5,1],
  [3,1],
  [3,0],
];

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

function _icmp(a,b) {
  if (a < b) { return -1; }
  if (a > b) { return  1; }
  return 0;
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

function rectilinearGridPoints(rl_pgon) {
  let _eps = (1/(1024));

  let x_dup = [],
      y_dup = [];

  let pnt_map = {};
  let boundary_type = [];

  if (rl_pgon.length == 0) { return []; }

  let n = rl_pgon.length;

  for (let i=0; i<rl_pgon.length; i++) {
    x_dup.push(rl_pgon[i][0]);
    y_dup.push(rl_pgon[i][1]);

    let key = rl_pgon[i][0].toString() + "," + rl_pgon[i][1].toString();
    pnt_map[key] = 1;


    let p_prv = [ rl_pgon[(i+n-1)%n][0], rl_pgon[(i+n-1)%n][1], 0 ];
    let p_cur = [ rl_pgon[i][0], rl_pgon[i][1], 0 ];
    let p_nxt = [ rl_pgon[(i+1)%n][0], rl_pgon[(i+1)%n][1], 0 ];

    let v0 = v_sub( p_prv, p_cur );
    let v1 = v_sub( p_nxt, p_cur );

    let _c = cross3( v0, v1 );

    if      (_c[2] < _eps) { boundary_type.push("reflex"); }
    else if (_c[2] > _eps) { boundary_type.push("interior"); }
    else { boundary_type.push("XXX"); }

  }

  x_dup.sort( _icmp );
  y_dup.sort( _icmp );

  let x_dedup = [ x_dup[0] ],
      y_dedup = [ y_dup[0] ];

  for (let i=1; i<x_dup.length; i++) {
    if (x_dup[i] == x_dup[i-1]) { continue; }
    x_dedup.push(x_dup[i]);
  }

  for (let i=1; i<y_dup.length; i++) {
    if (y_dup[i] == y_dup[i-1]) { continue; }
    y_dedup.push(y_dup[i]);
  }

  let grid_xy = [];
  let type_xy = [];

  let dualG = [];
  let g_id = 0;

  for (let j=0; j<y_dedup.length; j++) {
    dualG.push([]);
    for (let i=0; i<x_dedup.length; i++) {
      let g = [ x_dedup[i], y_dedup[j] ] ;

      let _type = 'i';
      let _key = g[0].toString() + "," + g[1].toString();

      console.log("#g:", g, "onBoundary:", onBoundary(g, rl_pgon));

      if (_key in pnt_map) { _type = 'c'; }
      else if (onBoundary(g, rl_pgon)) { _type = 'b'; }
      else if ( Math.abs(winding(g, rl_pgon)) < _eps ) { _type = 'x'; }

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
      dualG_ele_idx++;
    }
  }



  return { "C": rl_pgon, "Ct": boundary_type, "G": grid_xy, "Gt": type_xy, "X": x_dedup, "Y": y_dedup, "dualG" : dualG };
}

function cataloguePartitions( grid_ctx ) {
  let C = grid_ctx.C;
  let G = grid_ctx.G;
  let Gt = grid_ctx.Gt;
  let X = grid_ctx.X;
  let Y = grid_ctx.X;
  let R = grid_ctx.dualG;

  for (let c_idx=0; c_idx < C.length; c_idx++) {

  }
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


let grid_info = rectilinearGridPoints(pgon);

_print_pgon(pgon, grid_info.Ct);

let grid_p = grid_info.G;

for (let i=0; i<grid_p.length; i++) {
  console.log("\n#winding:", winding(grid_p[i], pgon) );
  console.log(grid_p[i][0], grid_p[i][1], "\n");
}

_print_dual(grid_info.dualG, '#');

//_ok(pgon);

