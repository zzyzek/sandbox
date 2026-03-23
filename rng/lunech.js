#!/usr/bin/node
// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


var njs = require("./numeric.js");
var cocha = require("./cocha.js");
var fasslib = require("./fasslib.js");
var printf = require("./printf.js");

var ch = require("convex-hull");

// convention?
// H : half plane
// s : sign
// P : plane
// L : line
// t : time
//

// return sign of which side u is to half plane defined
// by Nxyzd.
//
// Nxyzd is 4x1 vector, where first three entries are
// normal and last entry is distance from origin to point
// on notrmal plane.
//
// Consider v as the point on the plane defined by Nxyzd.
//
// (u-v) is direction to u with v as origin.
// Nxyz . (u-v) gives the sign of which side u is on
// Nxyzd, with 0 being u on plane.
//
function _Hs(u, Nxyzd) {
  let d = Nxyzd[3];

  let _Nv = [
    Nxyzd[0],
    Nxyzd[1],
    Nxyzd[2]
  ];

  let v = [
    d*Nxyzd[0],
    d*Nxyzd[1],
    d*Nxyzd[2]
  ];

  return njs.dot( _Nv, njs.sub(u, v) );
}

// return "time" value of line to plane intersection
// line(t) = v0 + t v
// plane(u) = Np . ( u - p )
//
// -> Np . ( v0 + t v - p ) = 0
// -> t = ( (Np . p) - (Np . v0) ) / (Np . v)
//
function _PLt(Np, p, v0, v) {
  let _eps = 1/(1024*1024*1024);
  let _d = njs.dot(Np,v);
  if (Math.abs(_d) < _eps) { return NaN; }

  let t = (njs.dot(Np,p) - njs.dot(Np,v0)) / _d;
  return t;
}

// evaluate line: V(t) = v0 + t v
//
function _Lt( v0, v, t ) { return njs.add(v0, njs.mul(t, v)); }


// Three points to plane equation,
// returns 4x1 vector,
// where first three elemenst are normal,
// last is distance to plane from origin.
//
function _v3H(p0, p1, p2) {
  let _eps = 1/(1024*1024*1024);
  let p10 = njs.sub(p1,p0);
  let p20 = njs.sub(p2,p0);
  let Np = cross3(p10,p20);
  let Pk = -njs.dot(Np, p0);
  return [ Np[0], Np[1], Np[2], Pk ]
}



// 3d cross product.
//
function cross3(p,q) {
  let c0 = ((p[1]*q[2]) - (p[2]*q[1])),
      c1 = ((p[2]*q[0]) - (p[0]*q[2])),
      c2 = ((p[0]*q[1]) - (p[1]*q[0]));

  return [c0,c1,c2];
}

// tst_c in lune created by pnt_a, pnt_b?
//
function in_lune(pnt_a, pnt_b, tst_c) {
  let dist_ca = njs.norm2( njs.sub(tst_c, pnt_a) );
  let dist_cb = njs.norm2( njs.sub(tst_c, pnt_b) );
  let dist_ab = njs.norm2( njs.sub(pnt_a, pnt_b) );

  if ((dist_ca <= dist_ab) &&
      (dist_cb <= dist_ab)) {
    return 1;
  }

  return 0;
}



//----
//----
//----

function _icmp(a,b) {
  if (a<b) { return -1; }
  if (a>b) { return 1; }
  return 0;
}

function _pcmp(a,b) {
  let M = [a.length, b.length];
  let m = Math.min(m[0],m[1]);
  let idx = 0;
  for (idx=0; idx<m; idx++) {
    if (a[idx] < b[idx]) { return -1; }
    if (a[idx] > b[idx]) { return 1; }
  }
  if (a.length < b.length) { return -1; }
  if (a.length > b.length) { return 1; }
  return 0;
}

function _vnei_eq(A,B) {
  let n = A.length;
  let m = B.length;
  if (n != m) { return -1; }
  for (let i=0; i<n; i++) {
    let s = A[i].length;
    let t = B[i].length;

    if (s != t) { console.log("#i:", i, "A[i].length:", A[i].length, "B[i].length:", B[i].length); return -2; }

    for (let j=0; j<s; j++) {
      if (A[i][j] != B[i][j]) { return -3; }
    }

  }

  return 1;
}


function prof_s(ctx, name) {
  if (!(name in ctx)) {
    ctx[name] = { "s": 0, "e": 0, "c": 0, "t":0 };
  }
  ctx[name].s = Date.now();
  return ctx[name].s
}

function prof_e(ctx, name) {
  ctx[name].e = Date.now();
  ctx[name].t += (ctx[name].e - ctx[name].s);
  ctx[name].c++;
  return ctx[name].e;
}

function prof_avg(ctx, name) {
  if (!(name in ctx)) { return 0; }
  if (ctx[name].c == 0) { return 0; }
  return ctx[name].t / (1000*ctx[name].c);
}

function prof_reset(ctx) {
  for (let name in ctx) {
    ctx[name].s = 0;
    ctx[name].e = 0;
    ctx[name].t = 0;
    ctx[name].c = 0;
  }
  return ctx;
}

function prof_print(ctx) {
  for (let name in ctx) {
    console.log("#", name, (ctx[name].t / ctx[name].c) / 1000, "s", "(", ctx[name].t, "ms /", ctx[name].c, ")");
  }
}

var PROF_CTX = {};
var STAT_CTX = {
  "win_r":[]
};

function _clamp(a, l,u) {
  if (a <  l) { return l; }
  if (a >= u) { return u; }
  return a;
}

function ixyz2idx(ixyz,nxyz) {
  let nx = nxyz[0];
  let ny = ((typeof nxyz[1] === "undefined") ? nx : nxyz[1]);
  let nz = ((typeof nxyz[2] === "undefined") ? nx : nxyz[2]);

  return ixyz[0] + (ixyz[1]*nx) + (ixyz[2]*nx*ny);
}

function xyz2idx(xyz,nxyz) {
  let nx = nxyz[0];
  let ny = ((typeof nxyz[1] === "undefined") ? nx : nxyz[1]);
  let nz = ((typeof nxyz[2] === "undefined") ? nx : nxyz[2]);

  let ixyz = [
    Math.floor(xyz[0]*nx),
    Math.floor(xyz[1]*ny),
    Math.floor(xyz[2]*nz)
  ];

  return ixyz2idx(ixyz, nxyz);
}

function idx2xyz(idx, nxyz) {
  let nx = nxyz[0];
  let ny = ((typeof nxyz[1] === "undefined") ? nx : nxyz[1]);
  let nz = ((typeof nxyz[2] === "undefined") ? nx : nxyz[2]);

  let xyz = [-1,-1,-1];

  xyz[0] = idx%nx;
  idx = Math.floor(idx / nx);
  xyz[1] = idx%ny;
  idx = Math.floor(idx / ny);
  xyz[2] = idx;

  return xyz;
}

function gnuplot_print_grid(ds, grid_n) {

  for (let iy=0; iy<=grid_n; iy++) {
    for (let ix=0; ix<=grid_n; ix++) {
      for (let iz=0; iz<=grid_n; iz++) {
        console.log(ix*ds, iy*ds, iz*ds);
      }
      console.log("\n");
    }
  }

  for (let iy=0; iy<=grid_n; iy++) {
    for (let iz=0; iz<=grid_n; iz++) {
      for (let ix=0; ix<=grid_n; ix++) {
        console.log(ix*ds, iy*ds, iz*ds);
      }
      console.log("\n");
    }
  }

  for (let ix=0; ix<=grid_n; ix++) {
    for (let iz=0; iz<=grid_n; iz++) {
      for (let iy=0; iy<=grid_n; iy++) {
        console.log(ix*ds, iy*ds, iz*ds);
      }
      console.log("\n");
    }
  }

}

// lightly tested
//
function _p_inside_convex_hull_3d(p, Q, face_idx_list) {
  for (let face_idx=0; face_idx<face_idx_list.length; face_idx++) {
    let fv = face_idx_list[face_idx];

    let u = [ Q[fv[0]][0], Q[fv[0]][1], Q[fv[0]][2] ] ;
    let v = [ Q[fv[1]][0], Q[fv[1]][1], Q[fv[1]][2] ] ;
    let w = [ Q[fv[2]][0], Q[fv[2]][1], Q[fv[2]][2] ] ;

    let c3 = fasslib.cross3( njs.sub(v,u), njs.sub(w,u) );
    let s = njs.dot( c3, njs.sub(u,p) );

    if (s < 0) { return false; }
  }

  return true;
}

// return intersection of half planes
//
// this won't work as laid out here.
// I made the mistake of thinking the cloud points of intersections
// of (Q,face_idx_list) was good enough to bound the dual convex hull
// (or that it actually was the convex hull).
// It's not.
// The cloud points can span a large area for half planes that are
// on opposite sides, say, of the convex hull.
// There are probably faster algorithms but a naive O(n^4) is to
// solve for the point intersection of half planes, then take
// that point and compare to all other half planes, rejecting
// if it's not inside.
//
// ...
//
//

function _convex_hull_dual_points_3d_experiment(p, Q, face_idx_list, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  if (Q.length == 0) { return []; }
  if (face_idx_list.length == 0) { return []; }

  //PROFILING
  prof_s(PROF_CTX,"dual:face_experiment");
  //PROFILING


  let E = {};

  let dual_pnt = [];
  for (let _fi=0; _fi < face_idx_list.length; _fi++) {
    let fv = face_idx_list[_fi];


    let u = njs.sub( [ Q[fv[0]][0], Q[fv[0]][1], Q[fv[0]][2] ], p );
    let v = njs.sub( [ Q[fv[1]][0], Q[fv[1]][1], Q[fv[1]][2] ], p );
    let w = njs.sub( [ Q[fv[2]][0], Q[fv[2]][1], Q[fv[2]][2] ], p ) ;

    let d_u = njs.norm2(u);
    let d_v = njs.norm2(v);
    let d_w = njs.norm2(w);

    u = njs.mul( 1 / d_u, u );
    v = njs.mul( 1 / d_v, v );
    w = njs.mul( 1 / d_w, w );

    let s = njs.solve( [ u, v, w ], [ d_u, d_v, d_w ] );

    let ds = njs.norm2(s);

    console.log("# _fi:", _fi, "u:", JSON.stringify(u), "d_u:", d_u);
    console.log("# _fi:", _fi, "u:", JSON.stringify(v), "d_u:", d_v);
    console.log("# _fi:", _fi, "u:", JSON.stringify(w), "d_u:", d_w);
    console.log("# _fi:", _fi, "s:", JSON.stringify(s), "d_s:", ds);
    console.log("#");

    //let s0 = njs.mul( 1/ds, s );
    //let s1 = njs.mul( 1/(ds*ds), s );
    //dual_pnt.push(njs.add(s0, p));
    //dual_pnt.push(njs.add(s1, p));

    dual_pnt.push(njs.add(s, p));

    //????
    //let t = njs.mul( 1/njs.norm2(s), s );
    //dual_pnt.push(njs.add(t, p));

    //DEBUG
    //DEBUG
    //DEBUG
    let _fv = [ fv[0], fv[1], fv[2] ];
    _fv.sort(_icmp);

    let e0 = _fv[0] + ":" + _fv[1];
    let e1 = _fv[0] + ":" + _fv[2];
    let e2 = _fv[1] + ":" + _fv[2];

    if (!(e0 in E)) { E[e0] = []; }
    if (!(e1 in E)) { E[e1] = []; }
    if (!(e2 in E)) { E[e2] = []; }

    E[e0].push(_fi);
    E[e1].push(_fi);
    E[e2].push(_fi);

  }

  let DVnei = [];
  for (let i=0; i<dual_pnt.length; i++) { DVnei.push([]); }
  for (let key in E) {
    let dv0 = E[key][0];
    let dv1 = E[key][1];

    DVnei[dv0].push(dv1);
    DVnei[dv1].push(dv0);

  }

  let DE_lines = [];
  for (let i=0; i<dual_pnt.length; i++) {

    for (let j=0; j<DVnei[i].length; j++) {
      let vnei = dual_pnt[ DVnei[i][j] ];
      DE_lines.push( printf("%f %f %f", dual_pnt[i][0], dual_pnt[i][1], dual_pnt[i][2]) );
      DE_lines.push( printf("%f %f %F", vnei[0], vnei[1], vnei[2]) );
      DE_lines.push("\n\n");
    }
  }
  var fs = require("fs");
  fs.writeFileSync("dvn.gp", DE_lines.join("\n"));


  //DEBUG
  //DEBUG
  //DEBUG

  //PROFILING
  prof_e(PROF_CTX,"dual:face_experiment");
  //PROFILING

  return dual_pnt;
}

// it's clunky but face_idx_list are the faces of the convex hull,
// which have indices of Q. Q holds the original points, so
// the convex hull points are a subset of Q, held within the unique
// indices of face_idx_list
//
function _convex_hull_dual_points_3d_On4(p, Q, face_idx_list, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  if (Q.length == 0) { return []; }
  if (face_idx_list.length == 0) { return []; }

  // plan:
  // - dedup points
  // - consider points as planes from p orogin
  // - do O(n^3) to catalogue points
  // - do O(n^4) rejecting/accepting points
  // - return accepted points

  let idx_list = [];
  for (let face_idx=0; face_idx<face_idx_list.length; face_idx++) {
    let fv = face_idx_list[face_idx];
    for (let i=0; i<fv.length; i++) { idx_list.push(fv[i]); }
  }
  idx_list.sort( (a,b) => { return ( (a<b) ? -1 : ((a>b) ? 1 : 0 )); });


  let uniq_idx = [ idx_list[0] ];
  for (let i=1; i<(idx_list.length); i++) {
    if (idx_list[i] != idx_list[i-1]) { uniq_idx.push(idx_list[i]); }
  }

  //PROFILING
  prof_s(PROF_CTX,"dual:candidate_collect");
  //PROFILING

  let candidate_pnt = [];
  let nei_ijk = [];
  for (let i=0; i<uniq_idx.length; i++) {
    for (let j=(i+1); j<uniq_idx.length; j++) {
      for (let k=(j+1); k<uniq_idx.length; k++) {

        let fv = [ uniq_idx[i], uniq_idx[j], uniq_idx[k] ];

        let u = njs.sub( [ Q[fv[0]][0], Q[fv[0]][1], Q[fv[0]][2] ], p );
        let v = njs.sub( [ Q[fv[1]][0], Q[fv[1]][1], Q[fv[1]][2] ], p );
        let w = njs.sub( [ Q[fv[2]][0], Q[fv[2]][1], Q[fv[2]][2] ], p ) ;

        let d_u = njs.norm2(u);
        let d_v = njs.norm2(v);
        let d_w = njs.norm2(w);

        u = njs.mul( 1 / d_u, u );
        v = njs.mul( 1 / d_v, v );
        w = njs.mul( 1 / d_w, w );

        let s = njs.solve( [ u, v, w ], [ d_u, d_v, d_w ] );

        candidate_pnt.push(s);

        nei_ijk.push( [uniq_idx[i],uniq_idx[j],uniq_idx[k]] );
      }
    }
  }

  //PROFILING
  prof_e(PROF_CTX,"dual:candidate_collect");
  //PROFILING

  if (_debug > 1) {
    console.log("#???", candidate_pnt.length);

    let fs = require("fs");
    let c_lines = [ ];

    c_lines.push( printf("#p: %f %f %f", p[0], p[1], p[2]));

    for (let i=0; i<candidate_pnt.length; i++) {
      let _p = njs.add( candidate_pnt[i], p );
      if (njs.norm2(_p) > 5) { continue; }
      c_lines.push( printf("%f %f %f\n\n", _p[0], _p[1], _p[2] ) );
    }

    for (let i=0; i<Q.length; i++) {
      c_lines.push( printf("#Q[%i] |Q[%i]-p| %f", i, i, njs.norm2(njs.sub(Q[i],p))) );
      c_lines.push( printf("%f %f %f\n\n\n", Q[i][0],  Q[i][1],  Q[i][2] )); 
    }

    c_lines.push("\n\n");
    for (let i=0; i<face_idx_list.length; i++) {
      let fv = face_idx_list[i];

      c_lines.push(printf("%f %f %f", Q[fv[0]][0], Q[fv[0]][1], Q[fv[0]][2] ));
      c_lines.push(printf("%f %f %f", Q[fv[1]][0], Q[fv[1]][1], Q[fv[1]][2] ));
      c_lines.push(printf("%f %f %f", Q[fv[2]][0], Q[fv[2]][1], Q[fv[2]][2] ));
      c_lines.push(printf("%f %f %f", Q[fv[0]][0], Q[fv[0]][1], Q[fv[0]][2] ));
      c_lines.push("\n\n");

    }

    fs.writeFileSync("dbg_cp.gp", c_lines.join("\n"));
  }

  //PROFILING
  prof_s(PROF_CTX,"dual:candidate_test");
  //PROFILING


  let _eps = (1.0 / (1024.0*1024.0));
  let valid_pnt = [];
  for (let i=0; i<candidate_pnt.length; i++) {

    let valid = true;
    for (let j=0; j<uniq_idx.length; j++) {
      let idx = uniq_idx[j];
      let v = njs.sub( [ Q[idx][0], Q[idx][1], Q[idx][2] ], p );

      let s = njs.norm2(v);
      let Nv = njs.mul( 1/s, v );

      let d = njs.dot( candidate_pnt[i], Nv );

      //DEBUG
      //DEBUG
      //console.log("# Nv:", JSON.stringify(Nv), "v:", JSON.stringify(v), "(Q[", idx, "]", JSON.stringify(Q[idx]), "-p:", JSON.stringify(p));
      //DEBUG
      //DEBUG

      if ( d > (s+_eps) ) {

        //DEBUG
        //DEBUG
        //console.log("#### d:", d, "s:", s);
        //DEBUG
        //DEBUG

        valid = false;
        break;
      }

    }

    if (valid) {
      let dp = njs.add( candidate_pnt[i], p );
      valid_pnt.push( dp );

      //console.log("#valid", JSON.stringify(dp), "(p:", JSON.stringify(p), ")");

      /*
      //DEBUG
      let u  = Q[ nei_ijk[i][0] ];
      let v  = Q[ nei_ijk[i][1] ];
      let w  = Q[ nei_ijk[i][2] ];
      console.log(dp[0], dp[1], dp[2]);
      console.log(u[0], u[1], u[2], "\n\n");

      console.log(dp[0], dp[1], dp[2]);
      console.log(v[0], v[1], v[2], "\n\n");

      console.log(dp[0], dp[1], dp[2]);
      console.log(w[0], w[1], w[2], "\n\n");
      */
    }
  }

  //PROFILING
  prof_e(PROF_CTX,"dual:candidate_test");
  //PROFILING

  if (_debug > 1) {
    let fs = require("fs");
    let v_lines = [];
    for (let i=0; i<valid_pnt.length; i++) {
      v_lines.push( printf("%f %f %f\n\n", valid_pnt[i][0],  valid_pnt[i][1],  valid_pnt[i][2] ) ); 
    }
    fs.writeFileSync("dbg_v.gp", v_lines.join("\n"));
  }

  return valid_pnt;
}

var _convex_hull_dual_points_3d = _convex_hull_dual_points_3d_On4;

// return:
//
//   true  : tst_c in lune of pnt_a and pnt_b
//   false : otherwise
//
function in_lune(pnt_a, pnt_b, tst_c) {
  let dist_ca = njs.norm2( njs.sub(tst_c, pnt_a) );
  let dist_cb = njs.norm2( njs.sub(tst_c, pnt_b) );
  let dist_ab = njs.norm2( njs.sub(pnt_a, pnt_b) );

  if ((dist_ca <= dist_ab) &&
      (dist_cb <= dist_ab)) {
    return true;
  }

  return false;
}

// run O(n^2) naive relative neighborhood graph calculation
// for a single point, anchor_p
//
// return:
//
//   array of index neigbors
//
function lunech_rng_point_naive(anchor_p, pnt) {
  let n = pnt.length;

  //console.log("rng_pnt:", n);

  let nei_idx = [];

  for (let j=0; j<n; j++) {
    let is_nei = true;
    for (let k=0; k<n; k++) {
      if (j==k) { continue; }


      //DEBUG
      //console.log("rng_pnt: anchor:", JSON.stringify(anchor_p), "p[", j, "]:", JSON.stringify(pnt[j]),
      //  "tst[", k, "]:", JSON.stringify(pnt[k]),
      //  in_lune(anchor_p, pnt[j], pnt[k]) );

      if (in_lune(anchor_p, pnt[j], pnt[k])) {
        is_nei = false;
        break;
      }
    }
    if (is_nei) { nei_idx.push(j); }
  }

  return nei_idx;
}



// run O(n^3) naive relative neighborhood graph calculation
// on array of points `pnt`
//
// return:
//
// {
//   "P" : pnt,
//   "A" : adjacency matrix,
//         1 if pnt[i] and pnt[j] connected,
//         0 otherwise
//   "E" : array of edges (index tuples)
// }
//
function relative_neighborhood_graph_naive(pnt) {
  let n = pnt.length;

  let A = [];

  for (let i=0; i<n; i++) {
    A.push([]);
    for (let j=0; j<n; j++) {
      A[i].push( (i==j) ? 0 : 1 );
    }
  }

  for (let i=0; i<pnt.length; i++) {
    for (let j=0; j<pnt.length; j++) {
      if (i==j) { continue; }
      for (let k=0; k<n; k++) {
        if ((i==k) || (j==k)) { continue; }
        if (in_lune(pnt[i], pnt[j], pnt[k])) {
          A[i][j] = 0;
          A[j][i] = 0;
        }
      }
    }

  }

  let E = [];

  for (let i=0; i<n; i++) {
    for (let j=0; j<n; j++) {
      if (A[i][j] > 0.5) { E.push([i,j]); }
    }
  }

  return { "P": pnt, "E": E, "A": A };
}

function relative_neighborhood_graph_naive_V_nei(pnt) {
  let n = pnt.length;

  let V_nei = [];
  for (let i=0; i<pnt.length; i++) { V_nei.push([]); }

  let A = [];

  for (let i=0; i<n; i++) {
    A.push([]);
    for (let j=0; j<n; j++) {
      A[i].push( (i==j) ? 0 : 1 );
    }
  }

  for (let i=0; i<pnt.length; i++) {
    for (let j=0; j<pnt.length; j++) {
      if (i==j) { continue; }

      let rng_ij = true;

      for (let k=0; k<n; k++) {
        if ((i==k) || (j==k)) { continue; }
        if (in_lune(pnt[i], pnt[j], pnt[k])) {
          rng_ij = false;
          break;
        }
      }

      if (rng_ij) {
        V_nei[i].push(j);
      }
    }

  }

  for (let i=0; i<V_nei.length; i++) {
    V_nei[i].sort(_icmp);
  }

  return V_nei;
}



function boundingBox(pnt) {
  let mM = [ [0,0], [0,0], [0,0] ];
  if (pnt.length==0) { return mM; }

  mM[0][0] = pnt[0][0];
  mM[0][1] = pnt[0][0];

  mM[1][0] = pnt[0][1];
  mM[1][1] = pnt[0][1];

  mM[2][0] = pnt[0][2];
  mM[2][1] = pnt[0][2];

  for (let i=1; i<pnt.length; i++) {
    for (let j=0; j<3; j++) {
      mM[j][0] = Math.min( pnt[i][j], mM[j][0] );
      mM[j][1] = Math.max( pnt[i][j], mM[j][1] );
    }
  }

  return mM;
}

// WIP!!
//
// - collect all points in window centered at grid point (done)
// - need to figure out what hapens at grid edges
// - need to do an initial convex hull
// - need to check window has enough points for convex hull
// - windowed convex hull test for center point inclusion
// - naive rng
//
function lunech3d(P) {
  let _debug = 0;

  CHA = cocha.hull3d;

  let n = P.length;

  let V_nei = [];
  for (let i=0; i<n; i++) { V_nei.push([]); }


  let grid_s = Math.pow(n, 1/3);
  let grid_n = Math.ceil(grid_s);
  let ds = 1/ grid_n;
  let grid_cell_size = [ds,ds,ds];
  let nxyz = [grid_n, grid_n, grid_n];

  let M = grid_n*grid_n*grid_n;

  //STAT
  STAT_CTX.win_r = [];
  for (let i=0; i<grid_n; i++) { STAT_CTX.win_r.push(0); }
  //STAT


  // we assume points within a 1x1x1 cube for now
  //
  let mx = 0,  Mx = 1,
      my = 0,  My = 1,
      mz = 0,  Mz = 1;

  let grid_idx = [];
  for (let i=0; i<M; i++) { grid_idx.push([]); }

  if (_debug) {
    console.log("# n:", n, "grid_s:", grid_s, "grid_n:", grid_n, "ds:", ds, "grid_cell_size:", grid_cell_size);
  }


  for (let i=0; i<(grid_n*grid_n*grid_n); i++) {
    grid_idx.push([]);
  }

  for (let i=0; i<n; i++) {
    let g_idx = xyz2idx(P[i], nxyz);
    grid_idx[g_idx].push(i);
  }

  if (_debug > 0) {
    for (let i=0; i<M; i++) {
      let ixyz = idx2xyz(i, nxyz);
      console.log("#grid[", i, "/", M, "](", JSON.stringify(ixyz), "):", JSON.stringify(grid_idx[i]));
    }
  }

  let winFactor = 3;

  // for each anchor point, take the collection of grid cells
  // in an increasing radius until we've found a convex hull that
  // encompases the anchor point and whose dual does not exceed
  // winFactor * radius.
  // To make sure we have a chance of creating a convex hull for
  // anchor points near the edge, put a virtual 'mirror point'
  // on the edge face if the cell collection butts up against
  // the edge.
  //
  for (let anchor_idx=0; anchor_idx<P.length; anchor_idx++) {

    let anchor_grid_idx = xyz2idx(P[anchor_idx], nxyz);
    let anchor_ixyz = idx2xyz(anchor_grid_idx, nxyz);

    let anchor_p = P[anchor_idx];

    for (let iwin_radius=1; iwin_radius<grid_n; iwin_radius++) {

      //STAT
      STAT_CTX.win_r[iwin_radius]++;
      //STAT

      let se_ixyz = [ [-1,-1], [-1,-1], [-1,-1] ];
      for (let d=0; d<3; d++) {
        se_ixyz[d][0] = _clamp(anchor_ixyz[d]-iwin_radius, 0, nxyz[d]);
        se_ixyz[d][1] = _clamp(anchor_ixyz[d]+iwin_radius+1, 0, nxyz[d]);
      }

      if (_debug) {
        console.log("#anchor_idx:", anchor_idx,
          "wr:", iwin_radius,
          "g_idx:", anchor_grid_idx,
          "anchor_ixyz:", anchor_ixyz,
          "se_ixyz:", se_ixyz,
          "grid_n:", grid_n);
      }

      let pnt_list = [];
      let idx_list = [];

      let mirror_point = [ -1,-1, -1,-1, -1,-1 ];
      let mirror_base_idx = -1;

      for (let iz=se_ixyz[2][0]; iz<se_ixyz[2][1]; iz++) {
        for (let iy=se_ixyz[1][0]; iy<se_ixyz[1][1]; iy++) {
          for (let ix=se_ixyz[0][0]; ix<se_ixyz[0][1]; ix++) {

            if (ix == (nxyz[0]-1))  { mirror_point[0] = 1; }
            if (ix == 0)            { mirror_point[1] = 1; }

            if (iy == (nxyz[1]-1))  { mirror_point[2] = 1; }
            if (iy == 0)            { mirror_point[3] = 1; }

            if (iz == (nxyz[2]-1))  { mirror_point[4] = 1; }
            if (iz == 0)            { mirror_point[5] = 1; }

            let _t_ixyz = [ix,iy,iz];
            let _tg = ixyz2idx(_t_ixyz, nxyz);

            for (let i=0; i<grid_idx[_tg].length; i++) {
              let vidx = grid_idx[_tg][i];

              // ignore the current point we're considering from
              // convex hull calculation.
              //
              if (vidx == anchor_idx) { continue; }

              idx_list.push( vidx );
              pnt_list.push( P[vidx] );
            }

          }
        }
      }

      mirror_base_idx = pnt_list.length;

      // issues happen when coordinates are exactly the same (esp. x), so add in a fudge factor
      //
      let fr = njs.mul( 1/(1024.0*1024.0), njs.sub( njs.random([3]), [0.5,0.5,0.5] )  );
      if (mirror_point[0] == 1) { pnt_list.push([Mx+2*fr[0], anchor_p[1]+fr[1], anchor_p[2]+fr[2]]); }

      fr = njs.mul( 1/(1024.0*1024.0), njs.sub( njs.random([3]), [0.5,0.5,0.5] )  );
      if (mirror_point[1] == 1) { pnt_list.push([mx-2*fr[0], anchor_p[1]+fr[1], anchor_p[2]+fr[2]]); }

      fr = njs.mul( 1/(1024.0*1024.0), njs.sub( njs.random([3]), [0.5,0.5,0.5] )  );
      if (mirror_point[2] == 1) { pnt_list.push([anchor_p[0]+fr[0], My+2*fr[1], anchor_p[2]+fr[2]]); }

      fr = njs.mul( 1/(1024.0*1024.0), njs.sub( njs.random([3]), [0.5,0.5,0.5] )  );
      if (mirror_point[3] == 1) { pnt_list.push([anchor_p[0]+fr[0], my-2*fr[1], anchor_p[2]+fr[2]]); }

      fr = njs.mul( 1/(1024.0*1024.0), njs.sub( njs.random([3]), [0.5,0.5,0.5] )  );
      if (mirror_point[4] == 1) { pnt_list.push([anchor_p[0]+fr[0], anchor_p[1]+fr[1], Mz+2*fr[2]]); }

      fr = njs.mul( 1/(1024.0*1024.0), njs.sub( njs.random([3]), [0.5,0.5,0.5] )  );
      if (mirror_point[5] == 1) { pnt_list.push([anchor_p[0]+fr[0], anchor_p[1]+fr[1], mz-2*fr[2]]); }

      // add in mirror points, with placeholder -1 for index
      //
      for (let idir=0; idir<6; idir++) { if (mirror_point[idir]==1) {idx_list.push(-1); } }

      if (pnt_list.length < 4) { continue; }

      //PROFILING
      prof_s(PROF_CTX, "cha");
      //PROFILING


      // find convex hull
      //
      let face_vtx_idx_list = CHA(pnt_list);

      //PROFILING
      prof_e(PROF_CTX, "cha");
      //PROFILING

      //PROFILING
      prof_s(PROF_CTX, "p_inside_ch");
      //PROFILING

      let p_inside = _p_inside_convex_hull_3d(anchor_p, pnt_list, face_vtx_idx_list);

      //PROFILING
      prof_e(PROF_CTX, "p_inside_ch");
      //PROFILING


      // if convex hull doesn't completely encompass our current point (anchor_p),
      // try again.
      //
      if (!p_inside) { continue; }

      // otherwise, take the dual of of the convex hull (intersection
      // of points taken as normals from anchor_p) then see if the dual
      // points are within threshold grid distance.
      // We can't run COCHA on the dual as more than 3 points could be co-planar
      // now.
      //

      //PROFILING
      prof_s(PROF_CTX,"dual");
      //PROFILING

      let pnt_dual = _convex_hull_dual_points_3d(anchor_p, pnt_list, face_vtx_idx_list, _debug);
      let bbox = boundingBox(pnt_dual);

      //PROFILING
      prof_e(PROF_CTX,"dual");
      //PROFILING

      let ibbox = [
        [ Math.floor( grid_n * bbox[0][0] ), Math.floor( grid_n * bbox[0][1] ) ],
        [ Math.floor( grid_n * bbox[1][0] ), Math.floor( grid_n * bbox[1][1] ) ],
        [ Math.floor( grid_n * bbox[2][0] ), Math.floor( grid_n * bbox[2][1] ) ]
      ];
      for (let i=0; i<3; i++) {
        ibbox[i][0] = _clamp(ibbox[i][0], 0, grid_n-1);
        ibbox[i][1] = _clamp(ibbox[i][1], 0, grid_n-1);
      }

      let _wf = winFactor;
      let thresh_mM = [
        [ Math.floor(anchor_ixyz[0] - (_wf*iwin_radius)), Math.floor(anchor_ixyz[0] + (_wf*iwin_radius)) ],
        [ Math.floor(anchor_ixyz[1] - (_wf*iwin_radius)), Math.floor(anchor_ixyz[1] + (_wf*iwin_radius)) ],
        [ Math.floor(anchor_ixyz[2] - (_wf*iwin_radius)), Math.floor(anchor_ixyz[2] + (_wf*iwin_radius)) ]
      ];


      let within_threshold = true;
      for (let i=0; i<3; i++) {
        if ((ibbox[i][0]  < thresh_mM[i][0]) ||
            (ibbox[i][1] >= thresh_mM[i][1])) {
          within_threshold = false;
          break;
        }
      }

      if (!within_threshold) {

        if (_debug > 1) {
          console.log("# not within threshold, extending...");
          console.log("## iwin_radius:", iwin_radius);
          console.log("## bbox(pnt_dual):", JSON.stringify(bbox));
          console.log("## ixyz:", JSON.stringify(anchor_ixyz), "ibbox:", JSON.stringify(ibbox));
          console.log("## thresh_mM:", JSON.stringify(thresh_mM), "(thresh param:", winFactor, ")");
          console.log("####");

          let fs = require("fs");
          let d_lines = [ printf("#ibbox: %s, thresh_mM: %s", JSON.stringify(ibbox), JSON.stringify(thresh_mM)) ];
          for (let _i=0; _i<pnt_dual.length; _i++) {
            d_lines.push( printf("%f %f %f\n\n", pnt_dual[_i][0], pnt_dual[_i][1], pnt_dual[_i][2] ));
          }
          fs.writeFileSync("dbg_d.gp", d_lines.join("\n"));
        }

        continue;
      }

      let candidate_point = [],
          candidate_point_idx = [];
      for (let iz=ibbox[2][0]; iz<=ibbox[2][1]; iz++) {
        for (let iy=ibbox[1][0]; iy<=ibbox[1][1]; iy++) {
          for (let ix=ibbox[0][0]; ix<=ibbox[0][1]; ix++) {
            let ig = ixyz2idx([ix,iy,iz], [grid_n,grid_n,grid_n]);
            for (let j=0; j<grid_idx[ig].length; j++) {
              let ip = grid_idx[ig][j];
              if (ip == anchor_idx) { continue; }
              candidate_point.push( P[ip] );
              candidate_point_idx.push( ip );
            }
          }
        }
      }

      if (_debug > 1) {
        console.log("#ibbox:", JSON.stringify(ibbox));
      }

      //PROFILING
      prof_s(PROF_CTX,"rng_point_naive");
      //PROFILING

      let _rng_idx = lunech_rng_point_naive(anchor_p, candidate_point);

      //PROFILING
      prof_e(PROF_CTX,"rng_point_naive");
      //PROFILING

      let anchor_p_rng = [];
      for (let i=0; i<_rng_idx.length; i++) {
        anchor_p_rng.push( candidate_point_idx[ _rng_idx[i] ] );
      }

      for (let i=0; i<anchor_p_rng.length; i++) {
        let nei_idx = anchor_p_rng[i];
        V_nei[anchor_idx].push(nei_idx);
      }

      break;
    }

  }


  if (_debug > 1) {
    gnuplot_print_grid(ds, grid_n);
    for (let i=0; i<P.length; i++) {
      console.log(P[i][0], P[i][1], P[i][2]);
      console.log("\n");
    }
  }

  return V_nei;
}

if (typeof module !== "undefined") {

  module.exports["steeple_cut_3d_On4"] = _convex_hull_dual_points_3d_On4;
}


if ((typeof require !== "undefined") &&
    (require.main === module)) {

  function _main(argv) {

    var fs = require("fs");

    //let ifn = "./data/p200.gp";
    let ifn = "";
    let op = '',
        op_val = '20';
    let N = -1;

    if (argv.length > 0) {
      op = argv[0];
      if (argv.length > 1) {
        op_val = argv[1];
        //N = parseInt(argv[1]);
      }
    }

    if (op == 'help') {
      console.log("");
      console.log("provide op [N|ifn]");
      console.log("");
      console.log("  op     one of (lunech3d|file|help|inside_ch_test|dual3d_test)");
      console.log("\n");
      return 0;
    }

    let Porig = [];
    if (op == 'file') {
      ifn = op_val;

      if (ifn.length > 0) {
        let dat = fs.readFileSync(ifn, 'utf8');
        let lines = dat.split("\n");
        for (let line_no=0; line_no<lines.length; line_no++) {
          let line = lines[line_no].trim();
          if (line.length == 0) { continue; }
          if (line[0] == '#') { continue; }

          let tok = line.split(" ");
          if (tok.length != 3) { continue; }

          let x = parseFloat(tok[0]);
          let y = parseFloat(tok[1]);
          let z = parseFloat(tok[2]);
          Porig.push([x,y,z]);
        }
      }
      else {
        console.log("provide filename");
        return -1;
      }

      N = Porig.length;
    }

    else {
      N = parseInt(op_val);
      for (let i=0; i<N; i++) {
        Porig.push([Math.random(),Math.random(),Math.random()]);
      }
    }


    // test _p_inside_convex_hull_3d function
    //
    if (op == 'inside_ch_test') {

      /*
      let n = 20;
      let pnt = [];
      for (let i=0; i<n; i++) {
        pnt.push( njs.sub( njs.random([3]), [0.5, 0.5, 0.5] ) );
        console.log(pnt[i][0], pnt[i][1], pnt[i][2], "\n\n");
      }
      */

      let pnt = Porig;

      let fv_idx = cocha.hull3d(pnt);

      // print out convex hull lines
      //
      for (let i=0; i<fv_idx.length; i++) {
        let vi = fv_idx[i];
        for (let j=0; j<vi.length; j++) {
          console.log( pnt[vi[0]][0], pnt[vi[0]][1], pnt[vi[0]][2] );
          console.log( pnt[vi[1]][0], pnt[vi[1]][1], pnt[vi[1]][2] );
          console.log( pnt[vi[2]][0], pnt[vi[2]][1], pnt[vi[2]][2] );
          console.log( pnt[vi[0]][0], pnt[vi[0]][1], pnt[vi[0]][2] );
          console.log("\n");
        }
      }

      let iN = 32;
      for (let iz=0; iz<iN; iz++) {
        for (let iy=0; iy<iN; iy++) {
          for (let ix=0; ix<iN; ix++) {

            let x = 2.0 * ((ix / iN) - 0.5);
            let y = 2.0 * ((iy / iN) - 0.5);
            let z = 2.0 * ((iz / iN) - 0.5);

            if (_p_inside_convex_hull_3d( [x,y,z], pnt, fv_idx )) {
              console.log(x,y,z);
              console.log("\n");
            }

          }
        }
      }


      //console.log(fv_idx);

    }

    // this is all experimental...
    //
    else if (op == 'dual3d_test') {
      /*
      let n = 20;
      let pnt = [];


      for (let i=0; i<n; i++) {
        //pnt.push( njs.sub( njs.random([3]), [0.5, 0.5, 0.5] ) );
        pnt.push( njs.add( njs.random([3]), [0.5, 0.5, 0.5] ) );
        //console.log(pnt[i][0], pnt[i][1], pnt[i][2], "\n\n");
      }
      */

      let pnt = Porig;

      let fv_idx = cocha.hull3d(pnt);

      /*
      for (let i=0; i<fv_idx.length; i++) {
        let fv = fv_idx[i];

        console.log(pnt[fv[0]][0], pnt[fv[0]][1], pnt[fv[0]][2]);
        console.log(pnt[fv[1]][0], pnt[fv[1]][1], pnt[fv[1]][2]);
        console.log(pnt[fv[2]][0], pnt[fv[2]][1], pnt[fv[2]][2]);
        console.log(pnt[fv[0]][0], pnt[fv[0]][1], pnt[fv[0]][2]);
        console.log("\n\n");
      }
      */

      let com = [0,0,0];
      for (let j=0; j<pnt.length; j++) {
        com[0] += pnt[j][0];
        com[1] += pnt[j][1];
        com[2] += pnt[j][2];
      }
      com = njs.mul( 1/pnt.length, com );
      console.log("#com:", JSON.stringify(com));
      console.log(com[0], com[1], com[2], "\n\n");

      let dual_pnt = _convex_hull_dual_points_3d(com, pnt, fv_idx);
      dual_pnt.sort( (a,b) => { return (a[0] < b[0]) ? -1 : ((a[0] > b[0]) ? 1 : 0); });

      //console.log(dual_pnt);

      /*
      for (let i=0; i<dual_pnt.length; i++) {
        let q = dual_pnt[i];
        let p = com;
        let v = njs.add( njs.mul( 1/8, njs.sub( q, p ) ), q );

        console.log(q[0], q[1], q[2]);
        console.log(v[0], v[1], v[2]);
        console.log("\n\n");
      }
      */


      //let wtf = [];
      //for (let i=0; i<n; i++) { wtf.push( njs.add( njs.random([3]), [0.5, 0.5, 0.5] ) ); }
      //dual_pnt= wtf;

      for (let i=0; i<dual_pnt.length; i++) {
        console.log(dual_pnt[i][0], dual_pnt[i][1], dual_pnt[i][2], "\n\n" );
      }

      return;

      let dual_idx = cocha.hull3d(dual_pnt);

      //console.log(dual_idx);

      for (let i=0; i<dual_idx.length; i++) {
        let fv = dual_idx[i];
        console.log(dual_pnt[fv[0]][0], dual_pnt[fv[0]][1], dual_pnt[fv[0]][2]);
        console.log(dual_pnt[fv[1]][0], dual_pnt[fv[1]][1], dual_pnt[fv[1]][2]);
        console.log(dual_pnt[fv[2]][0], dual_pnt[fv[2]][1], dual_pnt[fv[2]][2]);
        console.log(dual_pnt[fv[0]][0], dual_pnt[fv[0]][1], dual_pnt[fv[0]][2]);
        console.log("\n\n");
      }

    }

    else if (op == 'dual_cmp') {

      n = Porig.length;
      P = Porig;

      let F = cocha.hull3d(P);

      let anchor_p = [0.5, 0.5, 0.5];

      let slo = _convex_hull_dual_points_3d_On4(anchor_p, P, F);
      let fst = _convex_hull_dual_points_3d_experiment(anchor_p, P, F);

      let ch_lines = [ printf("%f %f %f\n\n", anchor_p[0], anchor_p[1], anchor_p[2]) ];
      for (let i=0; i<F.length; i++) {
        let fv = F[i];
        ch_lines.push( printf("%f %f %f", P[fv[0]][0], P[fv[0]][1], P[fv[0]][2]) );
        ch_lines.push( printf("%f %f %f", P[fv[1]][0], P[fv[1]][1], P[fv[1]][2]) );
        ch_lines.push( printf("%f %f %f", P[fv[2]][0], P[fv[2]][1], P[fv[2]][2]) );
        ch_lines.push( printf("%f %f %f", P[fv[0]][0], P[fv[0]][1], P[fv[0]][2]) );
        ch_lines.push("\n\n");
      }

      let slo_lines = [];
      for (let i=0; i<slo.length; i++) {
        slo_lines.push( printf("%f %f %f\n\n", slo[i][0], slo[i][1], slo[i][2]) );
      }

      let fst_lines = [];
      for (let i=0; i<fst.length; i++) {
        fst_lines.push( printf("%f %f %f\n\n", fst[i][0], fst[i][1], fst[i][2]) );
      }

      fs.writeFileSync("ch.gp",ch_lines.join("\n"));
      fs.writeFileSync("slo.gp",slo_lines.join("\n"));
      fs.writeFileSync("fst.gp",fst_lines.join("\n"));


    }

    else if (op == 'lunech3d') {
      //let n = 16000;
      //let n = N;
      //let P = [];
      //for (let i=0; i<n; i++) { P.push([Math.random(),Math.random(),Math.random()]); }

      n = Porig.length;
      P = Porig;

      //PROFILING
      prof_s(PROF_CTX, "lunech3d");
      //PROFILING

      let rng_nei_idx = lunech3d(P);

      //PROFILING
      prof_e(PROF_CTX, "lunech3d");
      //PROFILING


      for (let i=0; i<rng_nei_idx.length; i++) {
        rng_nei_idx[i].sort(_icmp);
      }

      let slow_confirm = false;
      if (slow_confirm) {
        let slow_rng_nei_idx = relative_neighborhood_graph_naive_V_nei(P);
        console.log("##", rng_nei_idx.length, slow_rng_nei_idx.length, _vnei_eq(rng_nei_idx, slow_rng_nei_idx));

        for (let i=0; i<rng_nei_idx.length; i++) {
          console.log("#[v", i, "]:", JSON.stringify(rng_nei_idx[i]), JSON.stringify(slow_rng_nei_idx[i]));
        }
      }

      let p_lines = ["#P"];
      for (let i=0; i<P.length; i++) {
        p_lines.push( printf("%f %f %f\n\n", P[i][0], P[i][1], P[i][2]) );
      }
      //fs.writeFileSync("dbg_p" + n.toString() + ".gp", p_lines.join("\n"));
      console.log(p_lines.join("\n"));

      let ch_lines = ["#CH"];
      for (let i=0; i<rng_nei_idx.length; i++) {
        let p = P[i];
        for (let j=0; j<rng_nei_idx[i].length; j++) {
          let q = P[ rng_nei_idx[i][j] ];
          ch_lines.push( printf("%f %f %f", p[0], p[1], p[2]));
          ch_lines.push( printf("%f %f %f\n\n", q[0], q[1], q[2]));
          //console.log(p[0], p[1], p[2]);
          //console.log(q[0], q[1], q[2]);
          //console.log("\n\n");
        }
      }
      console.log(ch_lines.join("\n"));


      //PROFILING
      prof_print(PROF_CTX);
      let s_tok = [ [], [] ];
      for (let i=0; i<STAT_CTX.win_r.length; i++) {
        s_tok[0].push( STAT_CTX.win_r[i].toString() );
        s_tok[1].push( (STAT_CTX.win_r[i] / P.length).toString() );
      }
      console.log("# stat.win_r:", s_tok[0].slice(1).join(" "));
      console.log("# stat.win_r/n:", s_tok[1].slice(1).join(" "));
      //PROFILING

    }
  }

  _main(process.argv.slice(2));
}



