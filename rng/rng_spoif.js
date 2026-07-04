#!/usr/bin/env node
// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


// I'm settling on the Shrinking Posts on Increasing Fence algorithm,
// so this program is a separation of `lunenetwork.js` to try and
// make the source more compact and easier to work on.
//
// The Relative Neighborhood Graph (RNG) is calculated from a set of points
// in (Euclidean) space by joining any two points that don't have another
// in the middle of their lune.
//
// If the distance between two points is $d$, the lune is the intersection
// of the two spheres of radius $d$.
//
// The motivation was to create a graph that "matched the human perception
// of the shape of the set".
//
// Here, we restrict ourselves to random 2d and 3d points in Euclidean space.
// That is, we assume a Poisson process for point distribution and try to
// create relatively run-time efficient algorithms to find the RNG from
// these set of points.
//
// I'm starting with 2d to work out some proofs of concept but hope to extend
// to 3d.
//
// The naive algorithm would be to start with a fully connected graph of all
// points, then remove edges when considering all triples of points.
// This algorithm has $O(n^3)$ and can be improved on.
//
// In general, the RNG is a sub-graph of the Delaunay Triangulation (DT) and,
// in general, one can't do better than the run-time efficiency of DT.
// DT has worst case $O(n^2)$ in 2d and 3d (I believe), so that's a hard
// upper bound.
//
// To construct the RNG from the DT, you can restrict the lune tests
// to only the neighbors implied by the DT. DT has an upper bound of
// degree 6 in 2d so this yields an O(n^2) RNG algorithm in 2d.
// It looks like DT in 3d has worst case O(n) degree but the average
// edge count is bounded by O(n^2), so in the aggregate, doing the same
// greedy algorithm will yield O(n^2) to extract the RNG.
//
// When the points are in general position (e.g. random), some optimizations
// can be employed as the maximum vertex degree of a neighborhood graph
// is almost surely bounded. Note that this *not* true for general position points
// for the DT, and for the DT with general position points, the maximum degree is
// bounded by O( lg n / lg lg n ).
//
// The idea that we're trying to implement here is an expected linear
// time algorithm for the construction of the RNG assuming random point placement.
//
// The major idea is, for each point, run the naive relative neighborhood graph algorithm (NRNGA)
// on the neighboring points in a small region.
// If the number of neighboring points is finite, then NRNGA will be constant time.
// To know how many neighbors to pick, we expand a grid aligned "fence" until markers
// on the fence ("fence posts") are partioned from the plane from the anchor point, $p$,
// to it's neighbors, $q$.
// Here the plane is defined as
// $N _ {q,p} = (q-p) / |q-p|$, $P _ {q,p}(u) = N _ {q,p} \cdot (u - q)$.
//
// The degree is bounded for the 2d/3d RNG, so we have some hope of guaranteeing
// only needing to consider finite local regions when constructing the RNG
// from random points.
// For points placed within a unit cube, it looks like, for the most part,
// one only need consider a cubic region roughly of side length $7/\sqrt{n}$
// centered at the anchor point $p$, with
// (I'm guessing) an exponential falloff as $k>7$ for sizes $k/\sqrt{n}$.
//
// Large constants for each step can affect practical runtime, so I'm hoping
// to employ additional heuristics to speed up the calculation.
//
// A spot check looks like the 3d Shrinking Posts of Increasing Fence (SPoIF)
// is working but I need to do more testing.
// The `lune_network_3d_SPoIF` below is the current 'reference' implemenetation
// that hopefully is correct and asymptotically linear but without constant
// runtime heuristic optimizations.
//



var njs = require("./numeric.js");
var srand = require("./seedrandom.js");
var fs = require("fs");
var printf = require("./printf.js");

var fasslib = require("./fasslib.js");
var PQ = require("./priority-queue.js");

var RND = srand("rng_spoif");

var DEBUG_LEVEL = 0;

var _EPS = (1.0 / (1024.0*1024.0*1024.0));

var _debug_stat = {
  "count": {},
  "val": {}
};

var prof_ctx = { };

function poisson_point(N, D, _rnd) {
  D = ((typeof D === "undefined") ? 2 : D);
  _rnd = ((typeof _rnd === "undefined") ? Math.random : _rnd);

  let pnt = [];
  for (let i=0; i<N; i++) {
    let p = [];
    for (let j=0; j<D; j++) { p.push( _rnd() ); }
    pnt.push(p);
  }
  return pnt;
}

function gnuplot_plane(ofn, Np, p0, r, nseg) {
  p0 = ((typeof p0 === "undefined") ? [0,0,0] : p0);
  r = ((typeof r === "undefined") ? 1 : r);
  nseg = ((typeof nseg === "undefined") ? 32 : nseg);

  let q = njs.random([3]);
  let Nq = njs.mul( 1 / njs.norm2(q), q );

  let u = njs.sub( Nq, njs.mul( njs.dot(Np,Nq), Np ) );
  let Nu = njs.mul( 1 / njs.norm2(u) , u );

  let _lines = [];
  for (let i=0; i<=nseg; i++) {
    let theta =2 * Math.PI * i / nseg;

    let v = fasslib.rodrigues(Nu, Np, theta);
    let vt = njs.add(p0, njs.mul( r, v ) );

    _lines.push( printf("%f %f %f", vt[0], vt[1], vt[2]) );
  }

  _lines.push("\n\n");
  _lines.push( printf("%f %f %f", p0[0], p0[1], p0[2]));
  _lines.push( printf("%f %f %f",
    r*Np[0] + p0[0],
    r*Np[1] + p0[1],
    r*Np[2] + p0[2]));
  _lines.push("\n\n");

  let u0 = njs.add(p0, njs.mul(r, Nu));
  let u1 = njs.add(p0, njs.mul(r, fasslib.rodrigues(Nu, Np, Math.PI/2) ));
  let u2 = njs.add(p0, njs.mul(r, fasslib.rodrigues(Nu, Np, Math.PI) ));
  let u3 = njs.add(p0, njs.mul(r, fasslib.rodrigues(Nu, Np, -Math.PI/2) ));

  _lines.push( printf("%f %f %f", u0[0], u0[1], u0[2]) );
  _lines.push( printf("%f %f %f", u2[0], u2[1], u2[2]) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", u1[0], u1[1], u1[2]) );
  _lines.push( printf("%f %f %f", u3[0], u3[1], u3[2]) );
  _lines.push("\n\n");

  fs.writeFileSync(ofn, _lines.join("\n"));
}

function gnuplot_cube(ofn, p0, r) {
  p0 = ((typeof p0 === "undefined") ? [0,0,0] : p0);
  r = ((typeof r === "undefined") ? 1 : r);

  let _lines = [];

  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] + r, p0[2] + r) );
  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] + r, p0[2] + r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] - r, p0[2] + r) );
  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] - r, p0[2] + r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] - r, p0[2] - r) );
  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] - r, p0[2] - r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] + r, p0[2] - r) );
  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] + r, p0[2] - r) );
  _lines.push("\n\n");

  //---

  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] + r, p0[2] + r) );
  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] - r, p0[2] + r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] + r, p0[2] + r) );
  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] - r, p0[2] + r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] + r, p0[2] - r) );
  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] - r, p0[2] - r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] + r, p0[2] - r) );
  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] - r, p0[2] - r) );
  _lines.push("\n\n");

  //---

  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] + r, p0[2] + r) );
  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] + r, p0[2] - r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] + r, p0[2] + r) );
  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] + r, p0[2] - r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] - r, p0[2] + r) );
  _lines.push( printf("%f %f %f", p0[0] - r, p0[1] - r, p0[2] - r) );
  _lines.push("\n\n");

  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] - r, p0[2] + r) );
  _lines.push( printf("%f %f %f", p0[0] + r, p0[1] - r, p0[2] - r) );
  _lines.push("\n\n");

  fs.writeFileSync(ofn, _lines.join("\n"));
}

function print_point(pnt, disconnect) {
  for (let i=0; i<pnt.length; i++) {
    if (pnt[i].length == 2) {
      console.log(pnt[i][0], pnt[i][1]);
    }
    else {
      console.log(pnt[i][0], pnt[i][1], pnt[i][2]);
    }
    if (disconnect) { console.log("\n"); }
  }
  console.log("");
}

function __in_lune(pnt_a, pnt_b, tst_c) {

  let dist_ca = njs.norm2( njs.sub(tst_c, pnt_a) );
  let dist_cb = njs.norm2( njs.sub(tst_c, pnt_b) );
  let dist_ab = njs.norm2( njs.sub(pnt_a, pnt_b) );

  if ((dist_ca <= dist_ab) &&
      (dist_cb <= dist_ab)) {
    return true;
  }

  return false;
}

function in_lune(pnt_a, pnt_b, tst_c) {

  let dist2_ca = njs.norm2Squared( njs.sub(tst_c, pnt_a) );
  let dist2_cb = njs.norm2Squared( njs.sub(tst_c, pnt_b) );
  let dist2_ab = njs.norm2Squared( njs.sub(pnt_a, pnt_b) );

  if ((dist2_ca <= dist2_ab) &&
      (dist2_cb <= dist2_ab)) {
    return true;
  }

  return false;
}

function _lerp(v0, v1, t) {
  return v0 + ((v1-v0)*t)
}

// euler rotation or olinde rodrigues
// https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
//
function rodrigues(v0, _vr, theta) {
  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let v_r = njs.mul( 1 / njs.norm2(_vr), _vr );

  return njs.add(
    njs.mul(c, v0),
    njs.add(
      njs.mul( s, cross3(v_r,v0)),
      njs.mul( (1-c) * njs.dot(v_r, v0), v_r )
    )
  );
}


function lune_points( a, b, seg, connect ) {
  seg = ((typeof seg === "undefined") ? 8 : seg);
  connect = ((typeof connect === "undefined") ? true : connect);

  let ba = njs.sub(b,a);
  let theta = -Math.atan2(ba[1], ba[0]);
  let r = njs.norm2(ba);

  let _pi3 = Math.PI/3;

  let p = [];

  let bxy = [ [1,0], [0,1] ];

  let p0 = [];

  for (let idx=0; idx<seg; idx++) {
    let t = _lerp( theta - _pi3, theta + _pi3, idx / seg);
    let m = [ [ Math.cos(t), -Math.sin(t) ], [ Math.sin(t), Math.cos(t) ] ];
    let bt = njs.mul( r, njs.dot(m, bxy) );
    p.push( njs.add(a, bt[0]) );

    if (p0.length == 0) {
      p0 = njs.clone(p[0]);
    }
  }

  theta += Math.PI;

  for (let idx=0; idx<seg; idx++) {
    let t = _lerp( theta - _pi3, theta + _pi3, idx / seg);
    let m = [ [ Math.cos(t), -Math.sin(t) ], [ Math.sin(t), Math.cos(t) ] ];
    let bt = njs.mul( r, njs.dot(m, bxy) );
    p.push( njs.add(b, bt[0]) );

  }

  if (connect) {
    p.push(p0);
  }

  return p;
}


// 3D vector to idir
//
function v2idir(v) {
  let max_xyz = 0;
  let max_val = v[0];
  for (let xyz=0; xyz<3; xyz++) {
    if (Math.abs(v[xyz]) > max_val) {
      max_xyz = xyz;
      max_val = Math.abs(v[xyz]);
    }
  }

  if (v[max_xyz] < 0) { return (2*max_xyz)+1; }
  return 2*max_xyz;
}

// (3D) angle between p and q vectors
//
function v3theta(p,q) {
  let s = njs.norm2( cross3(p,q) );
  let c = njs.dot(p,q);
  return Math.atan2(s,c);
}

// plane equation:
//
// P(u) = N_p \dot (u - p)
//
function plane_f(u, Np, p) {
  return njs.dot( Np, njs.sub(u, p) );
}

// Np here is 4 vector plane, where first
// three elements are normal, fourth is distance
// to origin.
//
// Return plane equation, using derived point on
// plane from reduced representation.
//
// Np = [nx, ny, nz, nw]
//
// P(u) = [nx,ny,nz] \dot (u - [ nw*nx, nw*ny, nw*nz ] )
//
function _Pf(u, Np) {
  let Pp = [
    Np[3]*Np[0],
    Np[3]*Np[1],
    Np[3]*Np[2]
  ];

  let _u = [ u[0], u[1], u[2] ];
  let _Np = [ Np[0], Np[1], Np[2] ];

  return plane_f(_u, _Np, Pp);
}

// return "time" value of line to plane intersection
// line(t) = v0 + t v
// plane(u) = Np . ( u - p )
//
// -> Np . ( v0 + t v - p ) = 0
// -> t = ( (Np . p) - (Np . v0) ) / (Np . v)
//
function t_plane_line(Np, p, v0, v) {
  let _eps = 1/(1024*1024*1024);
  let _d = njs.dot(Np,v);
  if (Math.abs(_d) < _eps) { return NaN; }

  let t = (njs.dot(Np,p) - njs.dot(Np,v0)) / _d;
  return t;
}

// evaluate line
//
// V(t) = v0 + t v
//
function Vt( v0, v, t ) {
  return njs.add(v0, njs.mul(t, v));
}

// 3d cross product.
//
function cross3(p,q) {
  let c0 = ((p[1]*q[2]) - (p[2]*q[1])),
      c1 = ((p[2]*q[0]) - (p[0]*q[2])),
      c2 = ((p[0]*q[1]) - (p[1]*q[0]));

  return [c0,c1,c2];
}

// Three points to plane equation,
// returns 4x1 vector,
// where first three elemenst are normal,
// last is distance to plane from origin.
//
function p3toP(p0, p1, p2) {
  let _eps = 1/(1024*1024*1024);

  let p10 = njs.sub(p1,p0);
  let p20 = njs.sub(p2,p0);

  let Np = cross3(p10,p20);

  let Pk = -njs.dot(Np, p0);

  return [ Np[0], Np[1], Np[2], Pk ]
}




//---
//---
//---

function check_cmp(res, edge) {
  let resE = [];
  let n = res.P.length;

  for (let i=0; i<n; i++) {
    resE.push([]);
    for (let j=0; j<n; j++) {
      resE[i].push(0);
    }
  }

  for (let p_idx in res.Ve_map) {
    for (let q_idx in res.Ve_map[p_idx]) {
      resE[p_idx][q_idx] = 1;
      resE[q_idx][p_idx] = 1;
    }
  }

  /*
  for (let i=0; i<res.E.length; i++) {
    let a = res.E[i][0];
    let b = res.E[i][1];

    resE[a][b] = 1;
    resE[b][a] = 1;
  }
  */

  let mismatch_count = 0;

  for (let i=0; i<n; i++) {
    for (let j=0; j<n; j++) {
      if (resE[i][j] != edge[i][j]) {

        if (DEBUG_LEVEL > 0) {
          console.log("# mismatch", i, j);
        }
          console.log("# mismatch", i, j, "(res:", resE[i][j], "edge:", edge[i][j], ")");

        mismatch_count++;
      }
    }
  }

  if (mismatch_count > 0) { return false; }
  return true;
}

function _check_cmp(res, edge) {
  let resE = [];
  let n = res.P.length;

  for (let i=0; i<n; i++) {
    resE.push([]);
    for (let j=0; j<n; j++) {
      resE[i].push(0);
    }
  }

  for (let i=0; i<res.E.length; i++) {
    let a = res.E[i][0];
    let b = res.E[i][1];

    resE[a][b] = 1;
    resE[b][a] = 1;
  }

  let mismatch_count = 0;

  for (let i=0; i<n; i++) {
    for (let j=0; j<n; j++) {
      if (resE[i][j] != edge[i][j]) {

        if (DEBUG_LEVEL > 0) {
          console.log("# mismatch", i, j);
        }
          console.log("# mismatch", i, j, "(res:", resE[i][j], "edge:", edge[i][j], ")");

        mismatch_count++;
      }
    }
  }

  if (mismatch_count > 0) { return false; }
  return true;
}

//----
//----
//----

function print_E(pnt, edge) {

  for (let i=0; i<edge.length; i++) {
    let a = edge[i][0];
    let b = edge[i][1];

    let p = pnt[a];
    let q = pnt[b];

    if (p.length == 2) {
      console.log(p[0], p[1]);
      console.log(q[0], q[1]);
    }
    else {
      console.log(p[0], p[1], p[2]);
      console.log(q[0], q[1], q[2]);
    }
    console.log("\n");
  }
}

function print_E_naive(pnt, edge) {

  for (let i=0; i<edge.length; i++) {
    for (let j=0; j<edge.length; j++) {

      if (edge[i][j] == 0) { continue; }

      let p = pnt[i];
      let q = pnt[j];

      if (p.length == 2) {
        console.log(p[0], p[1]);
        console.log(q[0], q[1]);
      }
      else {
        console.log(p[0], p[1], p[2]);
        console.log(q[0], q[1], q[2]);
      }
      console.log("\n");
    }
  }
}


//-----------
//-----------
//-----------
//-----------
//-----------
//-----------
//-----------
//-----------
//-----------

function naive_relnei_E(pnt) {
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

// dimension independent but defaults to 3d
//
function oob(p, B) {
  B = ((typeof B === "undefined") ? [[0,0,0], [1,1,1]] : B);

  for (i=0; i<p.length; i++) {
    if (p[i] < B[0][i]) { return true; }
    if (p[i] >= B[1][i]) { return true; }
  }

  return false;
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
    console.log("#", name, (ctx[name].t / ctx[name].c) / 1000, "s", "(", ctx[name].t, "ms / #", ctx[name].c, ")");
  }
}

// cruft?
//
// secure posts of increasing fence
//
// point - array of points, assumed to be within [0,1]^3 cube (uniform)
//
// this is the 'slow' version, unoptimized but presumably working
//
function lune_network_3d_SPoIF_slo(point) {
  let n = point.length;

  let _debug = 0;

  let _eps = 1 / (1024*1024*1024);
  let v_idir = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1]
  ];

  let fL = 1/2;
  let fencePost_v = [
    [ [ fL,-fL,-fL ], [ fL,  0,-fL ], [ fL, fL,-fL ],
      [ fL,-fL,  0 ], [ fL,  0,  0 ], [ fL, fL,  0 ],
      [ fL,-fL, fL ], [ fL,  0, fL ], [ fL, fL, fL ] ],
    [ [-fL,-fL,-fL ], [-fL,  0,-fL ], [-fL, fL,-fL ],
      [-fL,-fL,  0 ], [-fL,  0,  0 ], [-fL, fL,  0 ],
      [-fL,-fL, fL ], [-fL,  0, fL ], [-fL, fL, fL ] ],

    [ [-fL, fL,-fL ], [  0, fL,-fL ], [ fL, fL,-fL ],
      [-fL, fL,  0 ], [  0, fL,  0 ], [ fL, fL,  0 ],
      [-fL, fL, fL ], [  0, fL, fL ], [ fL, fL, fL ] ],
    [ [-fL,-fL,-fL ], [  0,-fL,-fL ], [ fL,-fL,-fL ],
      [-fL,-fL,  0 ], [  0,-fL,  0 ], [ fL,-fL,  0 ],
      [-fL,-fL, fL ], [  0,-fL, fL ], [ fL,-fL, fL ] ],

    [ [-fL,-fL, fL ], [-fL,  0, fL ], [-fL, fL, fL ],
      [  0,-fL, fL ], [  0,  0, fL ], [  0, fL, fL ],
      [ fL,-fL, fL ], [ fL,  0, fL ], [ fL, fL, fL ] ],
    [ [-fL,-fL,-fL ], [-fL,  0,-fL ], [-fL, fL,-fL ],
      [  0,-fL,-fL ], [  0,  0,-fL ], [  0, fL,-fL ],
      [ fL,-fL,-fL ], [ fL,  0,-fL ], [ fL, fL,-fL ] ]
  ];

  let idir_v = [ [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1] ];

  let grid_s = Math.cbrt(n);
  let grid_n = Math.ceil(grid_s);
  let ds = 1 / grid_n;

  let info = {
    "n": n,
    "dim": 3,
    "start": [0,0,0],
    "size": [1,1,1],
    "grid_cell_size": [-1,-1,-1],
    "bbox": [[0,0,0], [1,1,1]],

    "P_idx_grid_bp": [],

    "grid": [],
    "grid_s": grid_s,
    "grid_n": grid_n,
    "grid_cell_size": [ ds, ds, ds],
    "grid_start": [0,0,0],
    "grid_size": [1,1,1],

    "P": [],
    "E": []
  };

  let BB = info.bbox;

  // init grid
  //
  for (let i=0; i<grid_n; i++) {
    info.grid.push([]);
    for (let j=0; j<grid_n; j++) {
      info.grid[i].push([]);
      for (let k=0; k<grid_n; k++) {
        info.grid[i][j].push([]);
      }
    }
  }

  // populate grid with index,
  // P_idx_grid_bp maps index to 3d grid index
  //
  for (let i=0; i<n; i++) {
    info.P.push( [ point[i][0], point[i][1], point[i][2] ] );
    let ix = Math.floor(info.P[i][0]*grid_n);
    let iy = Math.floor(info.P[i][1]*grid_n);
    let iz = Math.floor(info.P[i][2]*grid_n);
    info.grid[iz][iy][ix].push(i);
    info.P_idx_grid_bp.push( [ix,iy,iz] );
  }

  if (_debug > 0) {
    //grid stats (debugging)
    //
    let grid_occ = [];
    let grid_occ_mM = [-1,-1];
    let grid_occ_mean = 0.0;
    let grid_occ_freq = {};
    for (let k=0; k<grid_n; k++) {
      for (let j=0; j<grid_n; j++) {
        for (let i=0; i<grid_n; i++) {
          let m = info.grid[k][j][i].length;
          grid_occ.push( m );
          if (grid_occ_mM[0] < 0) { grid_occ_mM[0] = m; }
          if (grid_occ_mM[1] < 0) { grid_occ_mM[1] = m; }
          if (grid_occ_mM[0] > m) { grid_occ_mM[0] = m; }
          if (grid_occ_mM[1] < m) { grid_occ_mM[1] = m; }
          grid_occ_mean += m;

          if (!(m in grid_occ_freq)) { grid_occ_freq[m] = 0; }
          grid_occ_freq[m]++;
        }
      }
    }
    grid_occ_mean /= (grid_n*grid_n*grid_n);
    grid_occ.sort( function(a,b) { if (a<b) { return -1; } if (a>b) { return 1; } return 0; } );
    console.log("# grid mM:", grid_occ_mM[0], grid_occ_mM[1],
                "grid_mean:", grid_occ_mean,
                "grid_med:", grid_occ[ Math.floor( grid_occ.length/2 ) ],
                "grid_freq:", JSON.stringify(grid_occ_freq) );
  }


  for (let p_idx = 0; p_idx < info.P.length; p_idx++) {


    let p = info.P[p_idx];

    //PROFILING
    //PROFILING
    let prof_ctx = {};
    prof_s( prof_ctx, p_idx.toString() );
    //PROFILING
    //PROFILING

    let Wp = [ p[0]*grid_n, p[1]*grid_n, p[2]*grid_n ];
    let ip = Wp.map( Math.floor );

    let fencePostSecure = [
      [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0],
      [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0],
      [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0]
    ];

    let fencePostCluster = [ [0,1,3,4], [1,2,4,5], [3,4,6,7], [4,5,7,8] ];

    let sweep0 = grid_sweep_perim_3d(info, p, 0);
    let cell_origin = sweep0.path[0];

    // we do calculations relative to the window center, which is the halfway
    // point inside of the center cell.
    // win_center : center point inside center cell
    // del_p      : the amount to translate win_center to reach p (p should be
    //              inside the center cell).
    // dpp        : vector from p to q
    // Nqp        : normal vector from p to q
    // dq         : vector from win_center to q
    // fpv        : fence post vector, centered at 0, scaled to the size of
    //              the current cell fence
    //

    let win_center = njs.add( [ds/2,ds/2,ds/2], njs.mul( ds, cell_origin ) );
    let dp = njs.sub( p, win_center );
    let del_p = njs.sub( win_center, p );

    let sweep_q_idx = [];

    let ir = 0;
    for (ir=0; ir<grid_n; ir++) {
      let sweep = grid_sweep_perim_3d(info, p, ir);

      for (let idir=0; idir<6; idir++) {
        for (let fpi=0; fpi<fencePost_v[idir].length; fpi++) {
          //let v = njs.add( win_center, njs.mul( ds*(ir+1), fencePost_v[idir][fpi] ) );
          let v = njs.add( win_center, njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] ) );

          if ( (v[0] < BB[0][0]) || (v[0] > BB[1][0]) ||
               (v[1] < BB[0][1]) || (v[1] > BB[1][1]) ||
               (v[2] < BB[0][2]) || (v[2] > BB[1][2]) ) {
            fencePostSecure[idir][fpi] = 1;
          }
        }
      }

      // collect q indicies.
      // previous q points might secure more portions of the fence, so
      // we keep q points from previous radius and append the current
      // perimeter.
      //
      for (let path_idx=0; path_idx<sweep.path.length; path_idx++) {
        let ixyz = sweep.path[path_idx];
        let grid_bin = info.grid[ ixyz[2] ][ ixyz[1] ][ ixyz[0] ];
        for (let bin_idx=0; bin_idx<grid_bin.length; bin_idx++) {
          let q_idx = grid_bin[bin_idx];
          if (q_idx == p_idx) { continue; }
          sweep_q_idx.push(q_idx);
        }
      }

      // for all q points, test to see if it secures the fence posts.
      //
      for (let sqi=0; sqi<sweep_q_idx.length; sqi++) {
        let q_idx = sweep_q_idx[sqi];
        let q = info.P[q_idx];
        let dq = njs.sub( q, win_center );

        let dqp = njs.sub(q,p);
        let Nqp = njs.mul( 1 / njs.norm2(dqp), dqp );

        for (let idir=0; idir<6; idir++) {
          for (let cluster_idx=0; cluster_idx < fencePostCluster.length; cluster_idx++) {

            // count the number of secured posts in this fence cluster
            //
            let n_cluster_secure = 0;
            for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
              let fpi = fencePostCluster[cluster_idx][fpci];
              let fpv = njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] );

              let s = njs.dot( Nqp, njs.sub( fpv, dq ) );

              if (s > 0) { n_cluster_secure++; }
            }

            // if we've secured all posts, mark the relevant posts as secure
            //
            if (n_cluster_secure == fencePostCluster[cluster_idx].length) {

              for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
                let fpi = fencePostCluster[cluster_idx][fpci];
                fencePostSecure[idir][fpi] = 1;
              }
            }

          }
        }

      }

      let n_secure = 0, n_secure_max = 0;
      for (let idir=0; idir<6; idir++) {
        for (let fpsi=0; fpsi<fencePostSecure[idir].length; fpsi++) {
          n_secure += fencePostSecure[idir][fpsi];
          n_secure_max++;
        }
      }

      if (n_secure == n_secure_max) {

        //PROFILING
        //PROFILING
        prof_e( prof_ctx, p_idx.toString() );
        if (_debug > 0) {
          prof_print(prof_ctx);
        }
        //PROFILING
        //PROFILING

        break;
      }

    }

    // naive RNG relative to p_idx
    //
    let added = 0;
    for (let sqi=0; sqi<sweep_q_idx.length; sqi++) {
      let q_idx = sweep_q_idx[sqi];
      let _found = true;
      for (let sqj=0; sqj<sweep_q_idx.length; sqj++) {
        if (sqi == sqj) { continue; }
        let u_idx = sweep_q_idx[sqj];
        if (in_lune(info.P[p_idx], info.P[q_idx], info.P[u_idx])) {
          _found = false;
          break;
        }
      }
      if (_found) {
        info.E.push( [p_idx, q_idx] );
        added++;
      }
    }

  }

  return info;
}

//--------------------------
//--------------------------
//
// To facilitate incremental updates to the relative
// neighborhood graph (and in particular for the space
// colonization algorithm), there are auxiliary
// functions to add, remove and swap vertices:
//
//   SPoIF_add_2d
//   SPoIF_rem_2d
//   SPoIF_swap_2d
//
// Adding only adds a new point without updating
// the relative neighborhood graph whereas remove
// and swap updates the edges accordingly.
// Adding or removing points can leave the relative
// neighborhood graph in an indeterminate state.
// Only swap preserves integrity of the RNG.
//
//
//
//
// I'm unsure the status of the following:
//
// SPoIF_add_3d
// SPoIF_rem_3d
// SPoIF_swap_3d
//

// add pnt to SPoIF context.
//
// - add pnt to end of P array
// - add pnt to grid (bin in appropriate grid cell)
// - update grid backpointer to map P index to grid cell
//
// - does *not* update Ve_map as this requires a
//   relative neighborhood graph calculation
//
// return:
//   index of newly created point (index in P)
//
function SPoIF_add_2d(info, pnt) {
  let grid_n = info.grid_n;

  let idx = info.P.length;

  info.P.push( [ pnt[0], pnt[1] ] );
  let ix = Math.floor(info.P[idx][0]*grid_n);
  let iy = Math.floor(info.P[idx][1]*grid_n);

  info.grid[iy][ix].push(idx);
  info.P_idx_grid_bp.push( [ix,iy] );

  info.Ve_map[idx] = {};

  return idx;
}

function SPoIF_add_3d(info, pnt) {
  let grid_n = info.grid_n;

  let idx = info.P.length;

  info.P.push( [ pnt[0], pnt[1], pnt[2] ] );
  let ix = Math.floor(info.P[idx][0]*grid_n);
  let iy = Math.floor(info.P[idx][1]*grid_n);
  let iz = Math.floor(info.P[idx][2]*grid_n);
  info.grid[iz][iy][ix].push(idx);
  info.P_idx_grid_bp.push( [ix,iy,iz] );

  info.Ve_map[idx] = {};

  return idx;
}

// swap two indices in SPoIF context
//
// - update values in P
// - update grid cells where each are located
// - update grid index backpointer (P_idx_grid_bp)
// - update Ve_map
//
// A little subtlety comes up when both a_idx and b_idx
// have the same neighbor.
//
function SPoIF_swap_2d(info, a_idx, b_idx) {
  let a_sched = [], b_sched = [];

  //console.log("SWAP", a_idx, b_idx);
  //console.log("Ve:", info.Ve_map);

  if (a_idx in info.Ve_map) {
    for (let a_nei_idx in info.Ve_map[a_idx]) {
      a_sched.push( a_nei_idx );
    }
  }

  if (b_idx in info.Ve_map) {
    for (let b_nei_idx in info.Ve_map[b_idx]) {
      b_sched.push( b_nei_idx );
    }
  }

  let a_orig = info.Ve_map[a_idx];
  let b_orig = info.Ve_map[b_idx];

  let a_nxt = {};
  let b_nxt = {};

  let _all_nei = {};
  _all_nei[a_idx] = 1;
  _all_nei[b_idx] = 1;
  for (let _nei_idx in a_orig) { _all_nei[_nei_idx] = 1; }
  for (let _nei_idx in b_orig) { _all_nei[_nei_idx] = 1; }

  //console.log("a_sched:", a_sched);
  //console.log("b_sched:", b_sched);


  for (let _nei_idx in _all_nei) {

    //console.log("_all_nei:", _all_nei, "_nei_idx:", _nei_idx);
    //console.log(info.Ve_map);

    if ((a_idx in info.Ve_map[_nei_idx]) &&
        (b_idx in info.Ve_map[_nei_idx])) {
      continue;
    }

    if (a_idx in info.Ve_map[_nei_idx]) {
      delete info.Ve_map[_nei_idx][a_idx];
      info.Ve_map[_nei_idx][b_idx] = 1;
    }

    else if (b_idx in info.Ve_map[_nei_idx]) {
      delete info.Ve_map[_nei_idx][b_idx];
      info.Ve_map[_nei_idx][a_idx] = 1;
    }

  }

  delete info.Ve_map[a_idx];
  delete info.Ve_map[b_idx];

  //console.log("a_orig:", a_orig);
  //console.log("b_orig:", b_orig);

  info.Ve_map[b_idx] = a_orig;
  info.Ve_map[a_idx] = b_orig;

  let u = [ info.P[a_idx][0], info.P[a_idx][1] ];
  let v = [ info.P[b_idx][0], info.P[b_idx][1] ];

  info.P[a_idx][0] = v[0];
  info.P[a_idx][1] = v[1];

  info.P[b_idx][0] = u[0];
  info.P[b_idx][1] = u[1];

  let a_ixyz = info.P_idx_grid_bp[ a_idx ];
  let b_ixyz = info.P_idx_grid_bp[ b_idx ];

  let a_g = info.grid[ a_ixyz[1] ][ a_ixyz[0] ];
  let b_g = info.grid[ b_ixyz[1] ][ b_ixyz[0] ];

  let _n = a_g.length;
  let _m = b_g.length;

  for (let i=0; i<_n; i++) {
    if      (a_g[i] == a_idx) { a_g[i] = b_idx; }
    else if (a_g[i] == b_idx) { a_g[i] = a_idx; }
  }

  if ((a_ixyz[1] != b_ixyz[1]) &&
      (a_ixyz[0] != b_ixyz[0])) {

    for (let i=0; i<_m; i++) {
      if (b_g[i] == b_idx) { b_g[i] = a_idx; }
    }

  }

  return info;
}



function SPoIF_swap_3d(info, a_idx, b_idx) {
  let a_sched = [], b_sched = [];

  if (a_idx in info.Ve_map) {
    for (let a_nei_idx in info.Ve_map[a_idx]) {
      a_sched.push( a_nei_idx );
    }
  }

  if (b_idx in info.Ve_map) {
    for (let b_nei_idx in info.Ve_map[b_idx]) {
      b_sched.push( b_nei_idx );
    }
  }

  let a_orig = info.Ve_map[a_idx];
  let b_orig = info.Ve_map[b_idx];

  let a_nxt = {};
  let b_nxt = {};

  let _all_nei = {};
  _all_nei[a_idx] = 1;
  _all_nei[b_idx] = 1;
  for (let _nei_idx in a_orig) { _all_nei[_nei_idx] = 1; }
  for (let _nei_idx in b_orig) { _all_nei[_nei_idx] = 1; }

  for (let _nei_idx in _all_nei) {
    if ((a_idx in info.Ve_map[_nei_idx]) &&
        (b_idx in info.Ve_map[_nei_idx])) {
      continue;
    }

    if (a_idx in info.Ve_map[_nei_idx]) {
      delete info.Ve_map[_nei_idx][a_idx];
      info.Ve_map[_nei_idx][b_idx] = 1;
    }

    else if (b_idx in info.Ve_map[_nei_idx]) {
      delete info.Ve_map[_nei_idx][b_idx];
      info.Ve_map[_nei_idx][a_idx] = 1;
    }

  }

  delete info.Ve_map[a_idx];
  delete info.Ve_map[b_idx];

  info.Ve_map[b_idx] = a_orig;
  info.Ve_map[a_idx] = b_orig;

  let u = [ info.P[a_idx][0], info.P[a_idx][1], info.P[a_idx][2] ];
  let v = [ info.P[b_idx][0], info.P[b_idx][1], info.P[b_idx][2] ];

  info.P[a_idx][0] = v[0];
  info.P[a_idx][1] = v[1];
  info.P[a_idx][2] = v[2];

  info.P[b_idx][0] = u[0];
  info.P[b_idx][1] = u[1];
  info.P[b_idx][2] = u[2];

  let a_ixyz = info.P_idx_grid_bp[ a_idx ];
  let b_ixyz = info.P_idx_grid_bp[ b_idx ];

  let a_g = info.grid[ a_ixyz[2] ][ a_ixyz[1] ][ a_ixyz[0] ];
  let b_g = info.grid[ b_ixyz[2] ][ b_ixyz[1] ][ b_ixyz[0] ];

  let _n = a_g.length;
  let _m = b_g.length;

  for (let i=0; i<_n; i++) {
    if      (a_g[i] == a_idx) { a_g[i] = b_idx; }
    else if (a_g[i] == b_idx) { a_g[i] = a_idx; }
  }

  if ((a_ixyz[2] != b_ixyz[2]) &&
      (a_ixyz[1] != b_ixyz[1]) &&
      (a_ixyz[0] != b_ixyz[0])) {

    for (let i=0; i<_m; i++) {
      if (b_g[i] == b_idx) { b_g[i] = a_idx; }
    }

  }

  return info;
}

// remove point referenced by index
//
// - moves last point in P to deleted points index location
// - removes point from grid cell
// - updates grid index backpointer (P_idx_grid_bp)
//   with moved point
//
function SPoIF_rem_2d(info, pnt_idx) {

  let _idx = info.P.length-1;

  // remove occurances of old pnt_idx in rng edges
  //
  if (pnt_idx in info.Ve_map) {
    for (let q_idx in info.Ve_map[pnt_idx]) {
      delete info.Ve_map[q_idx][pnt_idx];
    }
    delete info.Ve_map[pnt_idx];
  }

  // remap newly swapped point to the old pnt_idx
  //
  if (_idx in info.Ve_map) {
    let _m = info.Ve_map[_idx];
    for (let nei_idx in info.Ve_map[_idx]) {
      delete info.Ve_map[nei_idx][_idx];
      info.Ve_map[nei_idx][pnt_idx] = 1;
    }
    delete info.Ve_map[_idx];
    info.Ve_map[pnt_idx] = _m;
  }

  let _q = info.P[pnt_idx];
  info.P[pnt_idx] = info.P[_idx];
  info.P[_idx] = _q;

  info.P.pop();

  let _ixyz = info.P_idx_grid_bp[pnt_idx];
  info.P_idx_grid_bp[pnt_idx] = info.P_idx_grid_bp[_idx];
  info.P_idx_grid_bp[_idx] = _ixyz;

  info.P_idx_grid_bp.pop();

  let _n = info.grid[ _ixyz[1] ][ _ixyz[0] ].length;
  for (let i=0; i<_n; i++) {
    if (info.grid[ _ixyz[1] ][ _ixyz[0] ][i] == pnt_idx) {

      let _t = info.grid[ _ixyz[1] ][ _ixyz[0] ][_n-1];
      info.grid[ _ixyz[1] ][ _ixyz[0] ][i] =
        info.grid[ _ixyz[1] ][ _ixyz[0] ][_n-1];
      info.grid[ _ixyz[1] ][ _ixyz[0] ][_n-1] = _t;
      info.grid[ _ixyz[1] ][ _ixyz[0] ].pop();
      break;
    }
  }

  return info;
}

function SPoIF_rem_3d(info, pnt_idx) {

  let _idx = info.P.length-1;

  // remove occurances of old pnt_idx in rng edges
  //
  if (pnt_idx in info.Ve_map) {
    for (let q_idx in info.Ve_map[pnt_idx]) {
      delete info.Ve_map[q_idx][pnt_idx];
    }
    delete info.Ve_map[pnt_idx];
  }

  // remap newly swapped point to the old pnt_idx
  //
  if (_idx in info.Ve_map) {
    let _m = info.Ve_map[_idx];
    for (let nei_idx in info.Ve_map[_idx]) {
      delete info.Ve_map[nei_idx][_idx];
      info.Ve_map[nei_idx][pnt_idx] = 1;
    }
    delete info.Ve_map[_idx];
    info.Ve_map[pnt_idx] = _m;
  }

  let _q = info.P[pnt_idx];
  info.P[pnt_idx] = info.P[_idx];
  info.P[_idx] = _q;

  info.P.pop();

  let _ixyz = info.P_idx_grid_bp[pnt_idx];
  info.P_idx_grid_bp[pnt_idx] = info.P_idx_grid_bp[_idx];
  info.P_idx_grid_bp[_idx] = _ixyz;

  info.P_idx_grid_bp.pop();

  let _n = info.grid[ _ixyz[2] ][ _ixyz[1] ][ _ixyz[0] ].length;
  for (let i=0; i<_n; i++) {
    if (info.grid[ _ixyz[2] ][ _ixyz[1] ][ _ixyz[0] ][i] == pnt_idx) {

      let _t = info.grid[ _ixyz[2] ][ _ixyz[1] ][ _ixyz[0] ][_n-1];
      info.grid[ _ixyz[2] ][ _ixyz[1] ][ _ixyz[0] ][i] =
        info.grid[ _ixyz[2] ][ _ixyz[1] ][ _ixyz[0] ][_n-1];
      info.grid[ _ixyz[2] ][ _ixyz[1] ][ _ixyz[0] ][_n-1] = _t;
      info.grid[ _ixyz[2] ][ _ixyz[1] ][ _ixyz[0] ].pop();
      break;
    }
  }

  return info;
}

// cruft?
//
function SPoIF_alloc(point) {
  let n = point.length;

  let _debug = 0;

  let _eps = 1 / (1024*1024*1024);

  let grid_s = Math.cbrt(n);
  let grid_n = Math.ceil(grid_s);
  let ds = 1 / grid_n;

  let info = {
    "n": n,
    "dim": 3,
    "start": [0,0,0],
    "size": [1,1,1],
    "grid_cell_size": [-1,-1,-1],
    "bbox": [[0,0,0], [1,1,1]],

    "grid": [],
    "grid_s": grid_s,
    "grid_n": grid_n,
    "grid_cell_size": [ ds, ds, ds],
    "grid_start": [0,0,0],
    "grid_size": [1,1,1],

    // location in grid of index point
    // (entries are [x,y,z])
    //
    "P_idx_grid_bp": [],

    // point list
    //
    "P": [],

    // vertex edge map
    //
    "Ve_map": {},

    "P_dirty" : [],

    "prof": {}
  };

  prof_s( info.prof, "init" );

  let BB = info.bbox;

  // init grid
  //
  for (let i=0; i<grid_n; i++) {
    info.grid.push([]);
    for (let j=0; j<grid_n; j++) {
      info.grid[i].push([]);
      for (let k=0; k<grid_n; k++) {
        info.grid[i][j].push([]);
      }
    }
  }


  // populate grid with index,
  // P_idx_grid_bp maps index to 3d grid index
  //
  for (let i=0; i<n; i++) {
    info.P.push( [ point[i][0], point[i][1], point[i][2] ] );
    let ix = Math.floor(info.P[i][0]*grid_n);
    let iy = Math.floor(info.P[i][1]*grid_n);
    let iz = Math.floor(info.P[i][2]*grid_n);
    info.grid[iz][iy][ix].push(i);
    info.P_idx_grid_bp.push( [ix,iy,iz] );

    //info.Ve.push([]);
    //info.Ve_map.push({});
    info.Ve_map[i] = {};

  }

  prof_e( info.prof, "init" );

}

// single vertex RNG
//
// input:
//
// info   : lune_network context
// p_idx  : index of point (info.P[p_idx])
//
// adds edges to info.Ve
//
function lune_network_2d_SPoIF_RNGv(info, p_idx) {

  let ds                = info.ds;
  let grid_s            = info.grid_s;
  let grid_n            = info.grid_n;
  let BB                = info.bbox;
  let idir_v            = info.idir_v;
  let fencePostCluster  = info.fencePostCluster;
  let fencePost_v       = info.fencePost_v;
  let fpR_v             = info.fpR_v;
  let fpR_max_ir        = info.fpR_max_ir;

  let p = info.P[p_idx];

  let N_IDIR = 4;

  let Wp = [ p[0]*grid_n, p[1]*grid_n ];
  let ip = Wp.map( Math.floor );

  let v_idir = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let idir_oppo = [ 1,0, 3,2 ];

  let fencePostSecure = [
    [0,0,0], [0,0,0],
    [0,0,0], [0,0,0]
  ];

  // short circuit if we've secured the fence
  // (worth ~50% speed increase)
  //
  let n_fp_secure = 0,
      n_fp_max = 3*4;

  let sweep0 = grid_sweep_perim_2d(info, p, 0);
  let cell_origin = sweep0.path[0];

  //DEBUG
  //console.log("rngv2d:", p_idx, p, cell_origin, sweep0 );

  // we do calculations relative to the window center, which is the halfway
  // point inside of the center cell.
  //
  // win_center : center point inside center cell
  // del_p      : the amount to translate win_center to reach p (p should be
  //              inside the center cell).
  // dpp        : vector from p to q
  // Nqp        : normal vector from p to q
  // dq         : vector from win_center to q
  // fpv        : fence post vector, centered at 0, scaled to the size of
  //              the current cell fence
  //

  let win_center = njs.add( [ds/2,ds/2], njs.mul( ds, cell_origin ) );
  let dp = njs.sub( p, win_center );
  let del_p = njs.sub( win_center, p );

  let q_sched = [];

  prof_s( info.prof, "rng.sweep" );

  let ir = 0;
  for (ir=0; ir<grid_n; ir++) {
    let sweep = grid_sweep_perim_2d(info, p, ir);

    //DEBUG
    //console.log("#p:", p, "sweep:", sweep);

    prof_s( info.prof, "rng.sweep.oob");

    // mark fence posts that fall out of bounds
    //
    for (let idir=0; idir<N_IDIR; idir++) {
      for (let cluster_idx=0; cluster_idx < fencePostCluster.length; cluster_idx++) {

        let n_cluster_secure = 0;
        for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
          let fpi = fencePostCluster[cluster_idx][fpci];

          let v = [0,0];
          if (ir <= fpR_max_ir) {
            v = njs.add( win_center, fpR_v[ir][idir][fpi] );
          } else {
            v = njs.add( win_center, njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] ) );
          }

          if (oob(v, BB)) { n_cluster_secure++; }
        }

        if (n_cluster_secure == fencePostCluster[cluster_idx].length) {
          for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
            let fpi = fencePostCluster[cluster_idx][fpci];
            if (fencePostSecure[idir][fpi] == 0) { n_fp_secure++; }
            fencePostSecure[idir][fpi] = 1;
          }
        }

      }
    }

    prof_e( info.prof, "rng.sweep.oob");

    if (n_fp_secure == n_fp_max) { break; }

    prof_s( info.prof, "rng.sweep.collect");

    // collect q indicies.
    // previous q points might secure more portions of the fence, so
    // we keep q points from previous radius and append the current
    // perimeter.
    //
    for (let path_idx=0; path_idx<sweep.path.length; path_idx++) {
      let ixy = sweep.path[path_idx];
      let grid_bin = info.grid[ ixy[1] ][ ixy[0] ];
      for (let bin_idx=0; bin_idx<grid_bin.length; bin_idx++) {
        let q_idx = grid_bin[bin_idx];
        if (q_idx == p_idx) { continue; }

        q_sched.push([
          q_idx,
          info.P[q_idx],
          njs.norm2( njs.sub( info.P[q_idx], p ) )
        ]);
      }
    }
    prof_e( info.prof, "rng.sweep.collect");

    // median is ir == 3, so collect lower than ir but otherwise
    // skip secure computation until we get to ir == 3
    // (worth ~15% speed increase)
    //
    if (ir < 2) { continue; }

    prof_s( info.prof, "rng.sweep.sort");

    // order by distance. helps in combination with running fence post count short
    // circuit.
    // (worth ~25% speed increase)
    //
    q_sched.sort( function (a,b) { return ((a[2]<b[2]) ? -1 : ((a[2]>b[2]) ? 1 : 0)); } );

    prof_e( info.prof, "rng.sweep.sort");

    prof_s( info.prof, "rng.sweep.secure");

    // for all q points, test to see if it secures the fence posts.
    //
    for (let sqi =0; sqi < q_sched.length; sqi++) {
      let q_idx = q_sched[sqi][0];

      let q = info.P[q_idx];

      let dq = njs.sub( q, win_center );
      let dqp = njs.sub(q,p);
      let Nqp = njs.mul( 1 / njs.norm2(dqp), dqp );

      // don't consider opposite fence post face that can never
      // be closed off by the {q,Nqp} cutting plane
      // (worth ~25% speed increase)
      //
      let q_idir_oppo = idir_oppo[ v2idir(Nqp) ];

      // cache for secured posts to avoid recomputation
      // of dot product.
      // (worth ~100% speedup)
      //
      let fps_cache = [
        [0,0,0], [0,0,0],
        [0,0,0], [0,0,0]
      ];

      for (let idir=0; idir<N_IDIR; idir++) {

        if (q_idir_oppo == idir) { continue; }

        for (let cluster_idx=0; cluster_idx < fencePostCluster.length; cluster_idx++) {

          // count the number of secured posts in this fence post cluster
          //
          let n_cluster_secure = 0;
          for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
            let fpi = fencePostCluster[cluster_idx][fpci];

            if (fps_cache[cluster_idx][fpci] == 1) {
              n_cluster_secure++;
              continue;
            }

            let fpv = [0,0];
            if (ir <= fpR_max_ir) { fpv = fpR_v[ir][idir][fpi]; }
            else                  { fpv = njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] ); }

            let s = njs.dot( Nqp, njs.sub( fpv, dq ) );
            if (s > 0) {
              fps_cache[cluster_idx][fpci] = 1;
              n_cluster_secure++;
            }
          }

          // if we know we've secured all fence posts in the cluster
          // from the cluster secure count,
          // mark all fence posts in the cluster as secure
          //
          if (n_cluster_secure == fencePostCluster[cluster_idx].length) {
            for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
              let fpi = fencePostCluster[cluster_idx][fpci];
              if (fencePostSecure[idir][fpi] == 0) { n_fp_secure++; }
              fencePostSecure[idir][fpi] = 1;
            }
          }

          if (n_fp_secure == n_fp_max) { break; }
        }

        if (n_fp_secure == n_fp_max) { break; }
      }

      if (n_fp_secure == n_fp_max) { break; }
    }

    prof_e( info.prof, "rng.sweep.secure");

    if (n_fp_secure == n_fp_max) { break; }

    prof_s( info.prof, "rng.sweep.end");

    // check to see if we've secured all fence posts
    // and stop if we have
    //
    let _ns = 0, _ns_max = 0;
    for (let idir=0; idir<N_IDIR; idir++) {
      for (let fpsi=0; fpsi<fencePostSecure[idir].length; fpsi++) {
        _ns += fencePostSecure[idir][fpsi];
        _ns_max++;
      }
    }

    prof_e( info.prof, "rng.sweep.end");

    if (_ns == _ns_max) { break; }

  }

  prof_e( info.prof, "rng.sweep" );

  let _q_idx_list = [];
  for (let i=0; i<q_sched.length; i++) { _q_idx_list.push( q_sched[i][0] ); }

  lune_network_SPoIF_RNGv_naive(info, p_idx, _q_idx_list);
}


// single vertex RNG
//
// input:
//
// info   : lune_network context
// p_idx  : index of point (info.P[p_idx])
//
// adds edges to info.E, info.Ve
//
function lune_network_3d_SPoIF_RNGv(info, p_idx) {

  let ds                = info.ds;
  let grid_s            = info.grid_s;
  let grid_n            = info.grid_n;
  let BB                = info.bbox;
  let idir_v            = info.idir_v;
  let fencePostCluster  = info.fencePostCluster;
  let fencePost_v       = info.fencePost_v;
  let fpR_v             = info.fpR_v;
  let fpR_max_ir        = info.fpR_max_ir;

  let p = info.P[p_idx];

  let Wp = [ p[0]*grid_n, p[1]*grid_n, p[2]*grid_n ];
  let ip = Wp.map( Math.floor );

  let v_idir = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1]
  ];

  let idir_oppo = [ 1,0, 3,2, 5,4 ];

  let fencePostSecure = [
    [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0],
    [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0],
    [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0]
  ];

  // short circuit if we've secured the fence
  // (worth ~50% speed increase)
  //
  let n_fp_secure = 0,
      n_fp_max = 3*3*6;

  let sweep0 = grid_sweep_perim_3d(info, p, 0);
  let cell_origin = sweep0.path[0];

  // we do calculations relative to the window center, which is the halfway
  // point inside of the center cell.
  //
  // win_center : center point inside center cell
  // del_p      : the amount to translate win_center to reach p (p should be
  //              inside the center cell).
  // dpp        : vector from p to q
  // Nqp        : normal vector from p to q
  // dq         : vector from win_center to q
  // fpv        : fence post vector, centered at 0, scaled to the size of
  //              the current cell fence
  //

  let win_center = njs.add( [ds/2,ds/2,ds/2], njs.mul( ds, cell_origin ) );
  let dp = njs.sub( p, win_center );
  let del_p = njs.sub( win_center, p );

  let q_sched = [];

  prof_s( info.prof, "rng.sweep" );

  let ir = 0;
  for (ir=0; ir<grid_n; ir++) {
    let sweep = grid_sweep_perim_3d(info, p, ir);

    prof_s( info.prof, "rng.sweep.oob");

    // mark fence posts that fall out of bounds
    //
    for (let idir=0; idir<6; idir++) {
      for (let cluster_idx=0; cluster_idx < fencePostCluster.length; cluster_idx++) {

        let n_cluster_secure = 0;
        for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
          let fpi = fencePostCluster[cluster_idx][fpci];

          let v = [0,0,0];
          if (ir <= fpR_max_ir) {
            v = njs.add( win_center, fpR_v[ir][idir][fpi] );
          } else {
            v = njs.add( win_center, njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] ) );
          }

          if (oob(v, BB)) { n_cluster_secure++; }
        }

        if (n_cluster_secure == fencePostCluster[cluster_idx].length) {
          for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
            let fpi = fencePostCluster[cluster_idx][fpci];
            if (fencePostSecure[idir][fpi] == 0) { n_fp_secure++; }
            fencePostSecure[idir][fpi] = 1;
          }
        }

      }
    }

    prof_e( info.prof, "rng.sweep.oob");

    if (n_fp_secure == n_fp_max) { break; }

    prof_s( info.prof, "rng.sweep.collect");

    // collect q indicies.
    // previous q points might secure more portions of the fence, so
    // we keep q points from previous radius and append the current
    // perimeter.
    //
    for (let path_idx=0; path_idx<sweep.path.length; path_idx++) {
      let ixyz = sweep.path[path_idx];
      let grid_bin = info.grid[ ixyz[2] ][ ixyz[1] ][ ixyz[0] ];
      for (let bin_idx=0; bin_idx<grid_bin.length; bin_idx++) {
        let q_idx = grid_bin[bin_idx];
        if (q_idx == p_idx) { continue; }

        q_sched.push([
          q_idx,
          info.P[q_idx],
          njs.norm2( njs.sub( info.P[q_idx], p ) )
        ]);
      }
    }
    prof_e( info.prof, "rng.sweep.collect");

    // median is ir == 3, so collect lower than ir but otherwise
    // skip secure computation until we get to ir == 3
    // (worth ~15% speed increase)
    //
    if (ir < 2) { continue; }

    prof_s( info.prof, "rng.sweep.sort");

    // order by distance. helps in combination with running fence post count short
    // circuit.
    // (worth ~25% speed increase)
    //
    q_sched.sort( function (a,b) { return ((a[2]<b[2]) ? -1 : ((a[2]>b[2]) ? 1 : 0)); } );

    prof_e( info.prof, "rng.sweep.sort");

    prof_s( info.prof, "rng.sweep.secure");

    // for all q points, test to see if it secures the fence posts.
    //
    for (let sqi =0; sqi < q_sched.length; sqi++) {
      let q_idx = q_sched[sqi][0];

      let q = info.P[q_idx];

      let dq = njs.sub( q, win_center );
      let dqp = njs.sub(q,p);
      let Nqp = njs.mul( 1 / njs.norm2(dqp), dqp );

      // don't consider opposite fence post face that can never
      // be closed off by the {q,Nqp} cutting plane
      // (worth ~25% speed increase)
      //
      let q_idir_oppo = idir_oppo[ v2idir(Nqp) ];

      // cache for secured posts to avoid recomputation
      // of dot product.
      // (worth ~100% speedup)
      //
      let fps_cache = [
        [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0],
        [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0],
        [0,0,0, 0,0,0, 0,0,0], [0,0,0, 0,0,0, 0,0,0]
      ];

      for (let idir=0; idir<6; idir++) {

        if (q_idir_oppo == idir) { continue; }

        for (let cluster_idx=0; cluster_idx < fencePostCluster.length; cluster_idx++) {

          // count the number of secured posts in this fence post cluster
          //
          let n_cluster_secure = 0;
          for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
            let fpi = fencePostCluster[cluster_idx][fpci];

            if (fps_cache[cluster_idx][fpci] == 1) {
              n_cluster_secure++;
              continue;
            }

            let fpv = [0,0,0];
            if (ir <= fpR_max_ir) { fpv = fpR_v[ir][idir][fpi]; }
            else                  { fpv = njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] ); }

            let s = njs.dot( Nqp, njs.sub( fpv, dq ) );
            if (s > 0) {
              fps_cache[cluster_idx][fpci] = 1;
              n_cluster_secure++;
            }
          }

          // if we know we've secured all fence posts in the cluster
          // from the cluster secure count,
          // mark all fence posts in the cluster as secure
          //
          if (n_cluster_secure == fencePostCluster[cluster_idx].length) {
            for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
              let fpi = fencePostCluster[cluster_idx][fpci];
              if (fencePostSecure[idir][fpi] == 0) { n_fp_secure++; }
              fencePostSecure[idir][fpi] = 1;
            }
          }

          if (n_fp_secure == n_fp_max) { break; }
        }

        if (n_fp_secure == n_fp_max) { break; }
      }

      if (n_fp_secure == n_fp_max) { break; }
    }

    prof_e( info.prof, "rng.sweep.secure");

    if (n_fp_secure == n_fp_max) { break; }

    prof_s( info.prof, "rng.sweep.end");

    // check to see if we've secured all fence posts
    // and stop if we have
    //
    let _ns = 0, _ns_max = 0;
    for (let idir=0; idir<6; idir++) {
      for (let fpsi=0; fpsi<fencePostSecure[idir].length; fpsi++) {
        _ns += fencePostSecure[idir][fpsi];
        _ns_max++;
      }
    }

    prof_e( info.prof, "rng.sweep.end");

    if (_ns == _ns_max) { break; }

  }

  prof_e( info.prof, "rng.sweep" );

  let _q_idx_list = [];
  for (let i=0; i<q_sched.length; i++) { _q_idx_list.push( q_sched[i][0] ); }

  lune_network_SPoIF_RNGv_naive(info, p_idx, _q_idx_list);
}

// Here, q_list holds indices of neighbors (p_idx should be excluded)
//
// runs naive RNG relative to p_idx, puts edges ino info.E, info.Ve
//
// dimension independent
//
function lune_network_SPoIF_RNGv_naive(info, p_idx, q_list) {

  let p = info.P[p_idx];

  prof_s( info.prof, "rng.naive" );

  // naive RNG relative to p_idx
  // q_list holds all our q index points we've
  // considered so far
  //
  let added = 0;
  for (let sqi=0; sqi<q_list.length; sqi++) {
    let q_idx = q_list[sqi];
    let _found = true;

    for (let sqj=0; sqj<q_list.length; sqj++) {
      if (sqi == sqj) { continue; }
      let u_idx = q_list[sqj];
      if (in_lune(info.P[p_idx], info.P[q_idx], info.P[u_idx])) {
        _found = false;
        break;
      }
    }

    if (_found) {
      info.Ve_map[p_idx][q_idx] = 1;
      info.Ve_map[q_idx][p_idx] = 1;

      added++;
    }
  }

  prof_e( info.prof, "rng.naive" );
}

// WIP
//
// note that this is meant for incremental updates given a hint list.
// If this is used for incremental updates, the edges will need to be
// removed before call or this function needs to be altered to accomodate.
//
// See `Notes.md` for thought process...all experimental and untested
//
function lune_network_3d_SPoIF_RNGv_heuristic(info, p_idx, q_list, hint_list) {

  let q_sched = [];
  let h_sched = [];

  let p = info.P[p_idx];

  for (let i=0; i<q_list.length; i++) {
    let q_idx = q_list[i];
    let q = info.P[q_idx];
    q_sched.push( [ q_idx, q, njs.norm2( njs.sub(p,q) ) ] );
  }

  for (let i=0; i<h_list.length; i++) {
    let h_idx = h_list[i];
    let h = info.P[h_idx];
    h_sched.push( [ h_idx, h, njs.norm2( njs.sub(p,h) ) ] );
  }

  q_sched.sort( function(a,b) { return ((a[2] < b[2]) ? -1 : ((a[2] > b[2]) ?  1 : 0 )); } );
  h_sched.sort( function(a,b) { return ((a[2] < b[2]) ?  1 : ((a[2] > b[2]) ? -1 : 0 )); } );

  let candidate_list = [];

  for (let i_h=0; i_h < h_sched.length; i_h++) {

    let h = info.P[ h_sched[i_h][0] ];
    let dhp = njs.sub(h,p);
    let Nhp = njs.mul( 1 / njs.norm2(dhp), dhp );

    for (let i_q=0; i_q < q_sched.length; i_q++) {

      let q = info.P[ q_sched[i_q][0] ];
      let dqp = njs.sub(q,p);
      let Nqp = njs.mul( 1 / njs.norm2(dqp), dqp );

      let dqh = njs.sub(q,h);

      let s = njs.dot( Nhp, dqh );

      // remove q point from candidate list
      //
      if (s > 0) {
        q_sched[i_q] = q_sched[ q_sched.length-1 ];
        q_sched.pop();
        i_q--;
        continue;
      }

    }

  }

  for (let i=0; i<q_sched.length; i++) {
    candidate_list.push( q_sched[i_q][0] );
  }

  return lune_network_SPoIF_RNGv_naive(info, p_idx, candidate_list);

}


// secure posts of increasing fence (relative neighborhood graph)
//
// point - array of points, assumed to be within [0,1]^2 square (uniform)
//
function lune_network_2d_SPoIF(point) {
  let n = point.length;

  let _debug = 0;

  let _eps = 1 / (1024*1024*1024);

  let grid_s = Math.sqrt(n);
  let grid_n = Math.ceil(grid_s);
  let ds = 1 / grid_n;

  let N_IDIR = 4;

  let v_idir = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let idir_oppo = [ 1,0, 3,2 ];

  //     0 1 2
  //
  //       ^ (+y)
  //       |
  //  2    |     2
  //  1    *-->  1
  //  0    (+x)  0
  //
  //     0 1 2
  //



  let fL = 1/2;
  let fencePost_v = [
    [ [ fL,-fL ], [ fL,  0 ], [ fL, fL ] ],
    [ [-fL,-fL ], [-fL,  0 ], [-fL, fL ] ],

    [ [-fL, fL ], [  0, fL ], [ fL, fL ] ],
    [ [-fL,-fL ], [  0,-fL ], [ fL,-fL ] ]
  ];


  // precompute fence post vectors for common ir (0,1,2,3)
  // (worth ~30%-40% speed increase)
  //
  let fpR_v = [], fpR_max_ir = 3;
  for (let ir=0; ir<=fpR_max_ir; ir++) {
    fpR_v.push([]);
    for (let idir=0; idir<N_IDIR; idir++) {
      fpR_v[ir].push([]);
      for (let fpi=0; fpi<fencePost_v[idir].length; fpi++) {
        let fpv = njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] );
        fpR_v[ir][idir].push( fpv );
      }
    }
  }


  let idir_v = [ [1,0], [-1,0], [0,1], [0,-1] ];
  let fencePostCluster = [ [0,1], [1,2] ];

  let info = {
    "n": n,
    "dim": 2,
    "start": [0,0],
    "size": [1,1],
    "P_idx_grid_bp": [],
    "grid_cell_size": [-1,-1],
    "bbox": [[0,0], [1,1]],

    "grid": [],
    "grid_s": grid_s,
    "grid_n": grid_n,
    "grid_cell_size": [ ds, ds],
    "grid_start": [0,0],
    "grid_size": [1,1],

    "ds": ds,

    "P": [],

    // vertex edge map
    //
    "Ve_map": {},

    "P_label": [],
    "P_dirty": [],
    "P_dirty_queue": [],

    "fpR_v": fpR_v,
    "fpR_max_ir": fpR_max_ir,
    "fencePost_v" : fencePost_v,
    "fencePostCluster" : fencePostCluster,
    "idir_v" : idir_v,

    "prof": {}
  };

  prof_s( info.prof, "init" );

  let BB = info.bbox;

  // init grid
  //
  for (let i=0; i<grid_n; i++) {
    info.grid.push([]);
    for (let j=0; j<grid_n; j++) {
      info.grid[i].push([]);
    }
  }


  // populate grid with index,
  // P_idx_grid_bp maps index to 3d grid index
  //
  for (let i=0; i<n; i++) {
    info.P.push( [ point[i][0], point[i][1] ] );
    let ix = Math.floor(info.P[i][0]*grid_n);
    let iy = Math.floor(info.P[i][1]*grid_n);
    info.grid[iy][ix].push(i);
    info.P_idx_grid_bp.push( [ix,iy] );

    info.Ve_map[i] = {};

    info.P_dirty.push(0);
    info.P_label.push('.');
  }

  prof_e( info.prof, "init" );
  prof_s( info.prof, "rng.tot" );

  // calculate single vertex RNG
  //
  for (let p_idx = 0; p_idx < info.P.length; p_idx++) {
    lune_network_2d_SPoIF_RNGv(info, p_idx);
  }

  prof_e( info.prof, "rng.tot" );

  return info;
}

// secure posts of increasing fence (relative neighborhood graph)
//
// point - array of points, assumed to be within [0,1]^3 cube (uniform)
//
function lune_network_3d_SPoIF(point) {
  let n = point.length;

  let _debug = 0;

  let _eps = 1 / (1024*1024*1024);

  let grid_s = Math.cbrt(n);
  let grid_n = Math.ceil(grid_s);
  let ds = 1 / grid_n;

  let v_idir = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1]
  ];

  let idir_oppo = [ 1,0, 3,2, 5,4 ];


  //          4      7 2
  //          ^     /
  //          |   (+y)
  //        (+z) /
  //          | /
  //  1 -(-x)-.-(+x)-> 0
  //         /|
  //        / (-z)
  //     (-y) |
  //      /   5
  //     3         2 5 8 (+z)
  //             1 4 7
  //           0 3 6
  //
  //              6 7 8 (+y)
  //     8        3 4 5        8
  //   7 5        0 1 2      7 5
  // 6 4 2                 6 4 2 (+x)
  // 3 1    6 7 8          3 1
  // 0      3 4 5          0
  //        0 1 2
  //
  //               2 5 8
  //             1 4 7
  //           0 3 6
  //
  //

  let fL = 1/2;
  let fencePost_v = [
    [ [ fL,-fL,-fL ], [ fL,  0,-fL ], [ fL, fL,-fL ],
      [ fL,-fL,  0 ], [ fL,  0,  0 ], [ fL, fL,  0 ],
      [ fL,-fL, fL ], [ fL,  0, fL ], [ fL, fL, fL ] ],
    [ [-fL,-fL,-fL ], [-fL,  0,-fL ], [-fL, fL,-fL ],
      [-fL,-fL,  0 ], [-fL,  0,  0 ], [-fL, fL,  0 ],
      [-fL,-fL, fL ], [-fL,  0, fL ], [-fL, fL, fL ] ],

    [ [-fL, fL,-fL ], [  0, fL,-fL ], [ fL, fL,-fL ],
      [-fL, fL,  0 ], [  0, fL,  0 ], [ fL, fL,  0 ],
      [-fL, fL, fL ], [  0, fL, fL ], [ fL, fL, fL ] ],
    [ [-fL,-fL,-fL ], [  0,-fL,-fL ], [ fL,-fL,-fL ],
      [-fL,-fL,  0 ], [  0,-fL,  0 ], [ fL,-fL,  0 ],
      [-fL,-fL, fL ], [  0,-fL, fL ], [ fL,-fL, fL ] ],

    [ [-fL,-fL, fL ], [-fL,  0, fL ], [-fL, fL, fL ],
      [  0,-fL, fL ], [  0,  0, fL ], [  0, fL, fL ],
      [ fL,-fL, fL ], [ fL,  0, fL ], [ fL, fL, fL ] ],
    [ [-fL,-fL,-fL ], [-fL,  0,-fL ], [-fL, fL,-fL ],
      [  0,-fL,-fL ], [  0,  0,-fL ], [  0, fL,-fL ],
      [ fL,-fL,-fL ], [ fL,  0,-fL ], [ fL, fL,-fL ] ]
  ];


  // precompute fence post vectors for common ir (0,1,2,3)
  // (worth ~30%-40% speed increase)
  //
  let fpR_v = [], fpR_max_ir = 3;
  for (let ir=0; ir<=fpR_max_ir; ir++) {
    fpR_v.push([]);
    for (let idir=0; idir<6; idir++) {
      fpR_v[ir].push([]);
      for (let fpi=0; fpi<fencePost_v[idir].length; fpi++) {
        let fpv = njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] );
        fpR_v[ir][idir].push( fpv );
      }
    }
  }


  let idir_v = [ [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1] ];
  let fencePostCluster = [ [0,1,3,4], [1,2,4,5], [3,4,6,7], [4,5,7,8] ];

  let info = {
    "n": n,
    "dim": 3,
    "start": [0,0,0],
    "size": [1,1,1],
    "P_idx_grid_bp": [],
    "grid_cell_size": [-1,-1,-1],
    "bbox": [[0,0,0], [1,1,1]],

    "grid": [],
    "grid_s": grid_s,
    "grid_n": grid_n,
    "grid_cell_size": [ ds, ds, ds],
    "grid_start": [0,0,0],
    "grid_size": [1,1,1],

    "ds": ds,

    "P": [],

    // vertex edge map
    //
    "Ve_map": {},

    "P_label": [],
    "P_dirty": [],

    "fpR_v": fpR_v,
    "fpR_max_ir": fpR_max_ir,
    "fencePost_v" : fencePost_v,
    "fencePostCluster" : fencePostCluster,
    "idir_v" : idir_v,

    "prof": {}
  };

  prof_s( info.prof, "init" );

  let BB = info.bbox;

  // init grid
  //
  for (let i=0; i<grid_n; i++) {
    info.grid.push([]);
    for (let j=0; j<grid_n; j++) {
      info.grid[i].push([]);
      for (let k=0; k<grid_n; k++) {
        info.grid[i][j].push([]);
      }
    }
  }


  // populate grid with index,
  // P_idx_grid_bp maps index to 3d grid index
  //
  for (let i=0; i<n; i++) {
    info.P.push( [ point[i][0], point[i][1], point[i][2] ] );
    let ix = Math.floor(info.P[i][0]*grid_n);
    let iy = Math.floor(info.P[i][1]*grid_n);
    let iz = Math.floor(info.P[i][2]*grid_n);
    info.grid[iz][iy][ix].push(i);
    info.P_idx_grid_bp.push( [ix,iy,iz] );

    //info.Ve_map.push({});
    info.Ve_map[i] = {};

    info.P_dirty.push(0);
    info.P_label.push('.');
  }

  prof_e( info.prof, "init" );
  prof_s( info.prof, "rng.tot" );

  // calculate single vertex RNG
  //
  for (let p_idx = 0; p_idx < info.P.length; p_idx++) {
    lune_network_3d_SPoIF_RNGv(info, p_idx);
  }

  prof_e( info.prof, "rng.tot" );

  return info;
}

function gnuplot_rng2d(ofn, ctx) {
  let _lines =[];

  for (let p_idx=0; p_idx < ctx.P.length; p_idx++) {
    for (let q_idx in ctx.Ve_map[p_idx]) {

      let p = ctx.P[p_idx];
      let q = ctx.P[q_idx];

      _lines.push( printf("%f %f", p[0], p[1]) );
      _lines.push( printf("%f %f\n\n", q[0], q[1]) );
    }
  }

  fs.writeFileSync(ofn, _lines.join("\n"));
}

function gnuplot_rng3d(ofn, ctx) {
  let _lines =[];

  for (let p_idx=0; p_idx < ctx.P.length; p_idx++) {
    for (let q_idx in ctx.Ve_map[p_idx]) {

      let p = ctx.P[p_idx];
      let q = ctx.P[q_idx];

      _lines.push( printf("%f %f %f", p[0], p[1], p[2]) );
      _lines.push( printf("%f %f %f\n\n", q[0], q[1], q[2]) );
    }
  }

  fs.writeFileSync(ofn, _lines.join("\n"));
}

// enumerate points on outer shell of cube of side
// length 2*ir + 1, centered at pnt.
//
// return:
//
// {
//   "path": [
//     [ix0, iy0],
//     [ix1, iy1],
//     ...
//     [ix_{m-1}, iy_{m-1}]
//   ]
// }
//
function grid_sweep_perim_2d(ctx, pnt, ir) {
  let info = {
    "path": []
  };

  let grid_n = ctx.grid_n;
  let cell_size = ctx.grid_cell_size;
  let cell_offset = [0,0];

  let _grid_bbox = [[0,0], [grid_n, grid_n]];

  let ipnt = [
    Math.floor(pnt[0] / cell_size[0]),
    Math.floor(pnt[1] / cell_size[1])
  ];

  let mxyz = [ ipnt[0] - ir, ipnt[1] - ir ];
  let Mxyz = [ ipnt[0] + ir+1, ipnt[1] + ir+1 ];

  for (let ix=mxyz[0]; ix<Mxyz[0]; ix++) {
    if (!oob([ix,mxyz[1]], _grid_bbox)) {
      info.path.push([ix,mxyz[1]]);
    }
    if (mxyz[1] == (Mxyz[1]-1)) { continue; }
    if (!oob([ix,Mxyz[1]-1], _grid_bbox)) {
      info.path.push([ix,Mxyz[1]-1]);
    }
  }

  for (let iy=(mxyz[1]+1); iy<(Mxyz[1]-1); iy++) {
    if (!oob([mxyz[0], iy], _grid_bbox)) {
      info.path.push([mxyz[0], iy]);
    }
    if (mxyz[0] == (Mxyz[0]-1)) { continue; }
    if (!oob([Mxyz[0]-1, iy], _grid_bbox)) {
      info.path.push([Mxyz[0]-1, iy]);
    }
  }

  return info;
}



// enumerate points on outer shell of cube of side
// length 2*ir + 1, centered at pnt.
//
// return:
//
// {
//   "path": [
//     [ix0, iy0, iz0],
//     [ix1, iy1, iz1],
//     ...
//     [ix_{m-1}, iy_{m-1}, iz_{m-1}]
//   ]
// }
//
function grid_sweep_perim_3d(ctx, pnt, ir) {
  let info = {
    "path": []
  };

  let grid_n = ctx.grid_n;
  let cell_size = ctx.grid_cell_size;
  let cell_offset = [0,0,0];

  let _grid_bbox = [[0,0,0], [grid_n, grid_n, grid_n]];

  let ipnt = [
    Math.floor(pnt[0] / cell_size[0]),
    Math.floor(pnt[1] / cell_size[1]),
    Math.floor(pnt[2] / cell_size[2])
  ];

  let mxyz = [ ipnt[0] - ir, ipnt[1] - ir, ipnt[2] - ir ];
  let Mxyz = [ ipnt[0] + ir+1, ipnt[1] + ir+1, ipnt[2] + ir+1 ];

  for (let ix=mxyz[0]; ix<Mxyz[0]; ix++) {
    for (let iy=mxyz[1]; iy<Mxyz[1]; iy++) {
      if (!oob([ix,iy,mxyz[2]], _grid_bbox)) {
        info.path.push([ix,iy,mxyz[2]]);
      }
      if (mxyz[2] == (Mxyz[2]-1)) { continue; }
      if (!oob([ix,iy,Mxyz[2]-1], _grid_bbox)) {
        info.path.push([ix,iy,Mxyz[2]-1]);
      }
    }
  }

  for (let iy=mxyz[1]; iy<Mxyz[1]; iy++) {
    for (let iz=(mxyz[2]+1); iz<(Mxyz[2]-1); iz++) {
      if (!oob([mxyz[0], iy, iz], _grid_bbox)) {
        info.path.push([mxyz[0], iy, iz]);
      }
      if (mxyz[0] == (Mxyz[0]-1)) { continue; }
      if (!oob([Mxyz[0]-1, iy, iz], _grid_bbox)) {
        info.path.push([Mxyz[0]-1, iy, iz]);
      }
    }
  }

  for (let ix=(mxyz[0]+1); ix<(Mxyz[0]-1); ix++) {
    for (let iz=(mxyz[2]+1); iz<(Mxyz[2]-1); iz++) {
      if (!oob([ix, mxyz[1], iz], _grid_bbox)) {
        info.path.push([ix, mxyz[1], iz]);
      }
      if (mxyz[1] == (Mxyz[1]-1)) { continue; }
      if (!oob([ix, Mxyz[1]-1, iz], _grid_bbox)) {
        info.path.push([ix, Mxyz[1]-1, iz]);
      }
    }
  }

  return info;
}

function _grid_sweep_perim_2d(ctx, pnt, ir) {
  let face_dir = [
    [ 0, 1],
    [-1, 0],
    [ 0,-1],
    [ 1, 0]
  ];

  let cell_size = ctx.grid_cell_size;

  let cell_offset = [0,0];

  let ipnt = [
    Math.floor(pnt[0] / cell_size[0]),
    Math.floor(pnt[1] / cell_size[1])
  ];

  // fence is r, u, l, d
  //   [p0 , v] (p0 + v(t))
  //
  // in world coordinates
  //
  let info = {
    "path": [],
    "p": [ pnt[0], pnt[1] ],
    "i_p": [ ipnt[0], ipnt[1] ],
    "fence" : [
      [[0,0], [0,0]],
      [[0,0], [0,0]],
      [[0,0], [0,0]],
      [[0,0], [0,0]]
    ],
    "perim_bbox": [],
    "n": 0
  };

  let grid_bbox = [ [ 0, 0 ], [ ctx.grid_n, ctx.grid_n ] ];


  let perim_bbox = [
    [ ipnt[0] - ir, ipnt[1] - ir ],
    [ ipnt[0] + ir + 1, ipnt[1] + ir + 1]
  ];

  let virt_bbox = [
    [ perim_bbox[0][0], perim_bbox[0][1] ],
    [ perim_bbox[1][0], perim_bbox[1][1] ]
  ];

  if (perim_bbox[0][0] < grid_bbox[0][0]) { perim_bbox[0][0] = grid_bbox[0][0]; }
  if (perim_bbox[0][1] < grid_bbox[0][1]) { perim_bbox[0][1] = grid_bbox[0][1]; }

  if (perim_bbox[1][0] > grid_bbox[1][0]) { perim_bbox[1][0] = grid_bbox[1][0]; }
  if (perim_bbox[1][1] > grid_bbox[1][1]) { perim_bbox[1][1] = grid_bbox[1][1]; }

  info.perim_bbox = perim_bbox;

  // right fence, lower right start, move up
  //
  info.fence[0][0][0] = perim_bbox[1][0]*cell_size[0] + cell_offset[0];
  info.fence[0][0][1] = perim_bbox[0][1]*cell_size[1] + cell_offset[1];

  info.fence[0][1][0] = 0;
  info.fence[0][1][1] = (perim_bbox[1][1] - perim_bbox[0][1])*cell_size[1] ;

  // top fence, upper right, move left
  //
  info.fence[1][0][0] = perim_bbox[1][0]*cell_size[0] + cell_offset[0];
  info.fence[1][0][1] = perim_bbox[1][1]*cell_size[1] + cell_offset[1];

  info.fence[1][1][0] = (perim_bbox[0][0] - perim_bbox[1][0])*cell_size[0];
  info.fence[1][1][1] = 0;

  // left fence, upper left, move down
  //
  info.fence[2][0][0] = perim_bbox[0][0]*cell_size[0] + cell_offset[0];
  info.fence[2][0][1] = perim_bbox[1][1]*cell_size[1] + cell_offset[1];

  info.fence[2][1][0] = 0;
  info.fence[2][1][1] = (perim_bbox[0][1] - perim_bbox[1][1])*cell_size[1];

  // bottom fence, lower left, move right
  //
  info.fence[3][0][0] = perim_bbox[0][0]*cell_size[0] + cell_offset[0];
  info.fence[3][0][1] = perim_bbox[0][1]*cell_size[1] + cell_offset[1];

  info.fence[3][1][0] = (perim_bbox[1][0] - perim_bbox[0][0])*cell_size[0];
  info.fence[3][1][1] = 0;


  //console.log("#bbox: [[", perim_bbox[0][0], perim_bbox[0][1], "],[", perim_bbox[1][0], perim_bbox[1][1], "]], ipnt:", ipnt);

  let use_fence_perim = false;

  if (use_fence_perim) {

    let dx = perim_bbox[1][0] - perim_bbox[0][0],
        dy = perim_bbox[1][1] - perim_bbox[0][1];

    let ix = perim_bbox[0][0],
        iy = perim_bbox[0][1];
    for (ix=perim_bbox[0][0]; ix<perim_bbox[1][0]; ix++) {
      let idx = info.path.length-1;
      if ((idx >= 0) &&
          (info.path[idx][0] == ix) &&
          (info.path[idx][1] == iy)) { continue; }
      info.path.push([ix,iy]);
    }

    ix = perim_bbox[1][0]-1;
    for (iy=perim_bbox[0][1]; iy<perim_bbox[1][1]; iy++) {
      let idx = info.path.length-1;
      if ((idx >= 0) &&
          (info.path[idx][0] == ix) &&
          (info.path[idx][1] == iy)) { continue; }
      info.path.push([ix,iy]);
    }

    iy = perim_bbox[1][1]-1;
    for (ix=(perim_bbox[1][0]-1); ix>=perim_bbox[0][0]; ix--) {
      let idx = info.path.length-1;
      if ((idx >= 0) &&
          (info.path[idx][0] == ix) &&
          (info.path[idx][1] == iy)) { continue; }
      info.path.push([ix,iy]);
    }

    ix = perim_bbox[0][0];
    for (iy=(perim_bbox[1][1]-1); iy>=perim_bbox[0][1]; iy--) {
      let idx = info.path.length-1;
      if ((idx >= 0) &&
          (info.path[idx][0] == ix) &&
          (info.path[idx][1] == iy)) { continue; }
      info.path.push([ix,iy]);
    }
  }
  else {

    let dx = virt_bbox[1][0] - virt_bbox[0][0],
        dy = virt_bbox[1][1] - virt_bbox[0][1];

    let ix = virt_bbox[0][0],
        iy = virt_bbox[0][1];
    for (ix=virt_bbox[0][0]; ix<virt_bbox[1][0]; ix++) {
      if ((ix < grid_bbox[0][0]) || (ix >= grid_bbox[1][0]) ||
          (iy < grid_bbox[0][1]) || (iy >= grid_bbox[1][1])) {
        continue;
      }

      let idx = info.path.length-1;
      if ((idx >= 0) &&
          (info.path[idx][0] == ix) &&
          (info.path[idx][1] == iy)) { continue; }

      info.path.push([ix,iy]);
    }

    ix = virt_bbox[1][0]-1;
    for (iy=virt_bbox[0][1]; iy<virt_bbox[1][1]; iy++) {
      if ((ix < grid_bbox[0][0]) || (ix >= grid_bbox[1][0]) ||
          (iy < grid_bbox[0][1]) || (iy >= grid_bbox[1][1])) {
        continue;
      }

      let idx = info.path.length-1;
      if ((idx >= 0) &&
          (info.path[idx][0] == ix) &&
          (info.path[idx][1] == iy)) { continue; }

      info.path.push([ix,iy]);
    }

    iy = virt_bbox[1][1]-1;
    for (ix=(virt_bbox[1][0]-1); ix>virt_bbox[0][0]; ix--) {
      if ((ix < grid_bbox[0][0]) || (ix >= grid_bbox[1][0]) ||
          (iy < grid_bbox[0][1]) || (iy >= grid_bbox[1][1])) {
        continue;
      }

      let idx = info.path.length-1;
      if ((idx >= 0) &&
          (info.path[idx][0] == ix) &&
          (info.path[idx][1] == iy)) { continue; }

      info.path.push([ix,iy]);
    }

    ix = virt_bbox[0][0];
    for (iy=(virt_bbox[1][1]-1); iy>virt_bbox[0][1]; iy--) {
      if ((ix < grid_bbox[0][0]) || (ix >= grid_bbox[1][0]) ||
          (iy < grid_bbox[0][1]) || (iy >= grid_bbox[1][1])) {
        continue;
      }

      let idx = info.path.length-1;
      if ((idx >= 0) &&
          (info.path[idx][0] == ix) &&
          (info.path[idx][1] == iy)) { continue; }

      info.path.push([ix,iy]);
    }

  }

  return info;
}

function check_answer(ctx) {

  let info = ctx.info;

  let grid_n = info.grid_n;

  let P = info.P;
  let E = info.E;
  let A = info.A;

  let cell_size = info.grid_cell_size;

  let v_idir = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1]
  ];

  let p_nei = [];
  for (let i=0; i<P.length; i++) {
    p_nei.push([]);
  }

  for (let e_idx=0; e_idx < E.length; e_idx++) {
    let p_idx = E[e_idx][0];
    let q_idx = E[e_idx][0];
    p_nei[p_idx].push(q_idx);
    p_nei[q_idx].push(p_idx);
  }

  let bbox = [ [0,0,0], [1,1,1] ];
  let grid_bbox = [[0,0,0], [grid_n, grid_n, grid_n]];
  for (let p_idx=0; p_idx < p_nei.length; p_idx++) {

    for (let nei_idx=0; nei_idx < p_nei[p_idx].length; nei_idx++) {
      let q_idx = p_nei[p_idx][nei_idx];

      let r = njs.norm2( P[p_idx], P[q_idx] );

      if (nei_idx == 0) {
        for (let xyz=0; xyz<3; xyz++) {
          bbox[0][xyz] = P[p_idx][xyz] - r;
          bbox[1][xyz] = P[p_idx][xyz] + r;
        }
      }

      for (let xyz=0; xyz<3; xyz++) {
        if ((P[q_idx][xyz]-r) < bbox[0][xyz]) {
          bbox[0][xyz] = P[q_idx][xyz]-r;
        }
        if ((P[q_idx][xyz]+r) > bbox[1][xyz]) {
          bbox[1][xyz] = P[q_idx][xyz]+r;
        }
      }

    }

    let isxyz = [
      Math.floor( bbox[0][0] / cell_size[0] ),
      Math.floor( bbox[0][1] / cell_size[1] ),
      Math.floor( bbox[0][2] / cell_size[2] )
    ];

    let iexyz = [
      Math.ceil( bbox[1][0] / cell_size[0] ),
      Math.ceil( bbox[1][1] / cell_size[1] ),
      Math.ceil( bbox[1][2] / cell_size[2] )
    ];


    let pnt_idx = [];
    for (let iz=isxyz[2]; iz<iexyz[2]; iz++) {
      for (let iy=isxyz[1]; iy<iexyz[1]; iy++) {
        for (let ix=isxyz[0]; ix<iexyz[0]; ix++) {
          if (oob([ix,iy,iz], grid_bbox)) { continue; }
          let grid_bin = info.grid[iz][iy][ix];

          for (let i=0; i<grid_bin.length; i++) {
            pnt_idx.push(grid_bin[i]);
          }

        }
      }
    }

    for (let i=0; i<pnt_idx.length; i++) {
      let q_idx = pnt_idx[i];
      if (p_idx == q_idx) { continue; }

      let pq_connect = 1;
      for (let j=0; j<pnt_idx.length; j++) {
        let u_idx = pnt_idx[j];
        if (u_idx == p_idx) { continue; }
        if (u_idx == q_idx) { continue; }

        if (in_lune(P[p_idx], P[q_idx], P[u_idx])) {
          pq_connect = 0;
          break;
        }

      }

      if ( A[p_idx][q_idx] != pq_connect ) {
        console.log("!!!ERROR: p_idx:", p_idx, "q_idx:", q_idx, "A:", A[p_idx][q_idx], "pq_connect:", pq_connect);
        return 0;
      }

    }

  }

  return 1;
}

function print_edge(P, E) {
  for (let i=0; i<P.length; i++) {
    console.log("#", i);
    console.log(P[i][0], P[i][1], "\n");
  }

  for (let e_idx=0; e_idx<E.length; e_idx++) {
    let p = P[E[e_idx][0]];
    let q = P[E[e_idx][1]];

    console.log(p[0], p[1]);
    console.log(q[0], q[1]);
    console.log("");
  }

}

// run through some small examples to validate
//
function main_test3d() {

  let _debug = 0;

  let Ntest = [
    10,10,10,20,20,20,30,30,30,
    50,50,
    100,100,
    200,200,
    300,400,
    500, 600,
    700, 800,
    900, 1000
  ];

  for (let n_idx=0; n_idx < Ntest.length; n_idx++) {
    let N = Ntest[n_idx];
    let _pnts = poisson_point(N, 3);

    let _perf = {};


    if (_debug > 1) { console.log("# fence start"); }

    prof_s(_perf, "spoif");
    let info = lune_network_3d_SPoIF(_pnts);
    prof_e(_perf, "spoif");

    if (_debug > 1) { console.log("# fence done"); }
    if (_debug > 1) { console.log("# naive start"); }

    prof_s(_perf, "naive");
    let naive_res = naive_relnei_E(info.P);
    prof_e(_perf, "naive");

    if (_debug > 1) { console.log("# naive done"); }

    let _cmp_res = check_cmp(info, naive_res.A);

    if (!_cmp_res) {
      console.log("#check failed, points:");
      print_point(info.P);
      break;
    }

    console.log("#", N, "{", n_idx,"}", _cmp_res);

    if (_debug > 1) { prof_print(_perf); }
  }

}

function main_perf_test3d() {

  let Ntest = [
    10,20,30,40, 50,
    60,70,80,90,
    100, 200, 300,400, 500,
    600, 700, 800, 900,
    1000, 2000,3000, 4000, 5000,
    6000, 7000, 8000, 9000,
    10000, 20000, 30000, 40000, 50000,
    60000, 70000, 80000, 90000,
    100000
  ];

  for (let n_idx=0; n_idx < Ntest.length; n_idx++) {
    let N = Ntest[n_idx];
    let _pnts = poisson_point(N, 3);

    prof_s(prof_ctx, "tot");
    let info = lune_network_3d_SPoIF(_pnts);
    prof_e(prof_ctx, "tot");

    console.log(N, prof_avg(prof_ctx, "tot"));

    prof_reset(prof_ctx);
  }

  process.exit();

}


function create_A(info) {
  let n = info.P.length;

  let A = [];
  for (let i=0; i<n; i++) {
    A.push([]);
    for (let j=0; j<n; j++) {
      A[i].push(0);
    }
  }

  let E = info.E;

  for (let i=0; i<E.length; i++) {
    A[ E[i][0] ][ E[i][1] ] = 1;
    A[ E[i][1] ][ E[i][0] ] = 1;
  }

  return A;
}

//----
//----
//----

function _debug_rng_print_E(rng_info) {
  for (let p_idx=0; p_idx<rng_info.P.length; p_idx++) {
    let v = rng_info.P[p_idx];
    for (let nei_idx in rng_info.Ve_map[p_idx]) {
      let w = rng_info.P[nei_idx];
      console.log(...v);
      console.log(...w);
      console.log("\n\n");
    }
  }

}

function _debug_rng_ofn_E(ofn, rng_info) {

  let _lines = [];

  for (let p_idx=0; p_idx<rng_info.P.length; p_idx++) {
    let v = rng_info.P[p_idx];
    for (let nei_idx in rng_info.Ve_map[p_idx]) {
      let w = rng_info.P[nei_idx];

      if      (v.length == 2) { _lines.push( printf("%f %f", v[0], v[1]) ); }
      else if (v.length == 3) { _lines.push( printf("%f %f %f", v[0], v[1], v[2]) ); }

      if      (w.length == 2) { _lines.push( printf("%f %f", w[0], w[1]) ); }
      else if (w.length == 3) { _lines.push( printf("%f %f %f", w[0], w[1], w[2]) ); }

      _lines.push("\n");
    }
  }

  fs.writeFileSync(ofn, _lines.join("\n"));

}

function _clamp(v, a,b) {
  if (v < a) { return a; }
  if (v > b) { return b; }
  return v;
}

//==========
//==========
//==========
//
// simple frontier queue
//

function frontierQ() {
  this.reset();
  return this;
};

frontierQ.prototype.reset = function() {
  this.frontier = [];
  this.processed = {};
  this.frontier_bp = {};
  this.state = 0;
  this.msg = "";
  return this;
}

frontierQ.prototype.add = function(v) {
  if (v in this.processed) { return this.frontier_bp[v]; }
  this.processed[v] = 0;
  let idx = this.frontier.length;
  this.frontier.push(v);
  this.frontier_bp[v] = idx;
  return idx;
}

frontierQ.prototype.nxt = function() {
  if (this.frontier.length == 0) {
    this.state = -1;
    this.msg = "nxt underflow";
    return undefined;
  }
  let v = this.frontier.pop();
  this.processed[v] = 1;
  delete this.frontier_bp[v];
  return v;
}

//
//==========
//==========
//==========


// NOT-WORKING, IN ACTIVE DEVELOPMENT
// this is a mess...
//
function sca_spoif_2d_opt(A, V) {
  let _eps = _EPS;

  let it=0, max_it = 10000;

  //DEBUG
  max_it = 256;
  max_it = 1024;

  // 1/16 is way too low, 1/4 looks to be working
  // better strategy is to increase jitter if the collision
  // count goes haywire.
  //
  let A_jitter = 2*Math.PI*(1/32);
  A_jitter = Math.PI/4;

  let n_a = A.length;
  let n_v = V.length;

  let D_add = 1/8;
  D_add = 1 / ((n_a + n_v));

  //D_add *= 2;
  D_add /= 2;


  //let D_kill = 1 / (Math.sqrt(n_a + n_v));
  let D_kill = 1 / (n_a + n_v);

  let D_vv_kill = D_kill / 4;

  //DEBUG
  //console.log("#D_add:", D_add, "D_kill:", D_kill);
  console.log("#D_add:", D_add, "D_kill:", D_kill, "D_vv_kill:", D_vv_kill);

  let P = [];
  for (let i=0; i<n_a; i++) { P.push( A[i] ); }
  for (let i=0; i<n_v; i++) { P.push( V[i] ); }

  let rng_info = lune_network_2d_SPoIF(P);

  //DEBUG
  //_debug_rng_print_E(rng_info);
  //_debug_print(rng_info);
  for (let i=0; i<rng_info.P.length; i++) {
    console.log("P[", i, "]:", rng_info.P[i]);
  }

  let perf = {};

  prof_s(perf, "tot");

  let processQ= {};
  for (let _idx = 0; _idx < (n_a+n_v); _idx++) {
    processQ[ _idx ] = 0;
  }


  while ((n_a > 0) &&
         (it < max_it)) {

    //DEBUG
    console.log("#it:", it, "n_a:", n_a, "n_v:", n_v);
    _debug_rng_ofn_E(".debug/sca_spoif_2d_" + it.toString() + ".gp", rng_info);
    //_debug_print(rng_info);
    //

    //DEBUG
    let _vv = [];
    for (let v_idx in processQ) {
      _vv.push( v_idx.toString() + ":" + processQ[v_idx] );
    }
    console.log("### processQ:", _vv.join(" "));


    let updateQ = new frontierQ();

    // process vein nodes that have at least one auxin node
    // and add newly created vein nodes to Vnew for later
    // processing below
    //
    let _processed = [];
    for (let v_idx in processQ) {
      if (v_idx < n_a) { continue; }

      let _auxin_count = 0;
      for (let u_idx in rng_info.Ve_map[v_idx]) {
        if (u_idx < n_a) {
          let dav = njs.sub( rng_info.P[nei_idx], rng_info.P[v_idx] );
          let ndav = njs.mul( 1 / njs.norm2(dav), dav );
          F_s[0] += ndav[0];
          F_s[1] += ndav[1];

          _auxin_count++;
        }
      }

      // no auxin neighbors, mark for removal and skip
      //
      if (_auxin_count == 0) {
        _processed.push( v_idx );
        continue;
      }

      let d_jit_a = (RND() - 0.5)*A_jitter;
      let _c = Math.cos(d_jit_a);
      let _s = Math.sin(d_jit_a);
      F_s = njs.dot( [ [ _c , _s ], [ -_s, _c ] ], F_s );
      F_s = njs.mul( 1 / njs.norm2(F_s), F_s );

      //DEBUG
      console.log("atan2:", Math.atan2(F_s[1], F_s[0]), "F_s:", F_s, "(", njs.norm2(F_s), ")");

      let _v  = njs.add( rng_info.P[v_idx], njs.mul( D_add, F_s ) );
      _v[0] = _clamp( _v[0], 0, 1-_eps );
      _v[1] = _clamp( _v[1], 0, 1-_eps );

      //DEBUG
      console.log("# adding _v:", _v);

      // ADD vein node but mark it for updateing, where
      // the RNG will be updated below
      //
      let _v_add_idx = SPoIF_add_2d(rng_info, Vnew[i]);
      updateQ.add( _v_add_idx );
    }

    for (let i=0; i<_processed.length; i++) {
      delete processQ[ _processed[i] ];
    }

    // update RNG for only select nodes that have been touched.
    // if edges are removed or added, add them to the updateQ if
    // they haven't already been processed.
    //
    for (let cur_idx = updateQ.nxt(); (typeof cur_idx !== "undefined"); cur_idx = updateQ.nxt()) {

      // remove RNG for vertex so it can recalculate fresh
      //
      let _prv_nei = {};
      for (let nei_idx in rng_info.Ve_map[cur_idx]) {
        _prv_nei[nei_idx] = 1;
        delete rng_info.Ve_map[cur_idx][nei_idx];
        delete rng_info.Ve_map[nei_idx][cur_idx];
      }

      // run local RNG for v, updating it's neighbors
      //
      lune_network_2d_SPoIF_RNGv(rng_info, cur_idx);

      for (let nei_idx in _prv_nei) {
        if (nei_idx in rng_info.Ve_map[cur_idx]) { continue; }
        updateQ.add(nei_idx);
      }

      for (let nei_idx in rng_info.Ve_map[cur_idx]) {
        if (nei_idx in _prv_nei) { continue; }
        updateQ.add(nei_idx);
      }

    }

    updateQ.reset();

    for (let v_idx in processQ) {
      if (v_idx >= n_a) { continue; }

    }



    prof_s(perf, "rng.tot");
    prof_s(perf, "rng.0");

    // FOCUS: this is where the optimization needs to happen
    //   - keep track of dirtied nodes, either newly created ones,
    //     nodes touched by removal or otherwise
    //   - breadth first search (or whatever) on dirtied nodes to update RNG,
    //     making sure not to double process or double dirty
    //     nodes already processed
    //     
    //rng_info = lune_network_2d_SPoIF( rng_info.P );
    while (_v_idx_dirty_Q.length > 0) {
      let _v_idx = _v_idx_dirty_Q.pop();

      // save neighbors of v before we run a local RNG for v
      // and remove neighbors of v in Ve_map so that the
      // RNG can run fresh.
      //
      let _prv_nei = {};
      for (let _u_idx in rng_info.Ve_map[_v_idx]) {
        _prv_nei[_u_idx] = 1;
        delete rng_info.Ve_map[_v_idx][_u_idx];
      }

      // run local RNG for v, updating it's neighbors
      //
      lune_network_2d_SPoIF_RNGv(rng_info, _v_idx);

      // if we've added new edges, add them to the queue.
      // if the edge was there before the local RNG, it isn't dirtied
      // otherwise, add it to the queue
      //
      let _a_nei_count = 0;
      for (let _u_idx in rng_info.Ve_map[_v_idx]) {

        // neighbor is an auxin node...
        // add auxin neighbor to processing list,
        // increment neighbor count so we can
        // use it to know to update the vein node below
        //
        if (_u_idx < n_a) {

          _dirty_node[_u_idx] = 'a';
          _dirty_node[_v_idx] = 'v';

          _a_nei_count++;
        }

        if (_u_idx in _prv_nei) { continue; }
        if (!(_u_idx in _v_idx_dirty_map)) { _v_idx_dirty_Q.push(_u_idx); }
        _v_idx_dirty_map[_u_idx] = 1;
      }

      // if vein node has no auxin neighbors, remove it from the current vein
      //   processing queue
      // otherwise add it if it's not there already
      //
      //if (_a_nei_count == 0)  { delete cur_v_pull[_v_idx]; }
      //else                    { cur_v_pull[_v_idx] = 1; }

      // if v previously had an edge that was removed from the new local RNG
      // calculation, add the neighbor to the queue.
      //
      for (let _u_idx in _prv_nei) {
        if (_u_idx in rng_info.Ve_map[_v_idx]) { continue; }
        if (!(_u_idx in _v_idx_dirty_map)) { _v_idx_dirty_Q.push(_u_idx); }
        _v_idx_dirty_map[_u_idx] = 1;

        _dirty_node[_u_idx] = ((_u_idx < n_a) ? 'a' : 'v');
        _dirty_node[_v_idx] = 'v';
      }

    }

    // reset dirty queue
    //
    _v_idx_dirty_map = {};
    _v_idx_dirty_Q = [];

    prof_e(perf, "rng.0");
    prof_s(perf, "vswap");

    let nxt_a_pull = {};
    for (let a_idx in cur_a_pull) { nxt_a_pull[a_idx] = cur_a_pull[a_idx]; }

    for (let a_idx in cur_a_pull) {
      let n_v_nei = 0,
          n_v_near = 0;

      for (let nei_idx in rng_info.Ve_map[a_idx]) {
        if (nei_idx < n_a) { continue; }

        n_v_nei++;

        let dist = njs.norm2( njs.sub( rng_info.P[a_idx], rng_info.P[nei_idx] ) );
        if ( dist < D_kill ) { n_v_near++; }
      }

      if (n_v_nei == 0) {
        delete cur_a_pull[ a_idx ];
        continue;
      }

      // removal of auxin shouldn't affect the auxin to vein
      // relative neighborhood graph, so Ve_map above can
      // still be altered but the auxin-vein edges will
      // remain untouched.
      //
      if ((n_v_near > 0) &&
          (n_v_near == n_v_nei)) {

        let _idx_keep = n_a-1,
            _idx_rem = a_idx;

        if ( _idx_rem in nxt_a_pull) {
          delete nxt_a_pull[ _idx_rem ];
        }
        if ( _idx_keep in nxt_a_pull ) {
          delete nxt_a_pull[ _idx_keep ];
          nxt_a_pull[ _idx_rem ] = 1;
        }

        SPoIF_swap_2d( rng_info, a_idx, n_a-1 );

        // WIP!!!
        //if (a_idx in _v_idx_dirty_map) { delete _v_idx_dirty_map[a_idx]; }
        //_v_idx_dirty_map[ n_a-1 ] = 1;

        SPoIF_rem_2d( rng_info, n_a-1 );
        n_a--;
        a_idx--;

      }

    }

    cur_a_pull = nxt_a_pull;


    /*
    for (let a_idx=0; a_idx < n_a; a_idx++) {
      let n_v_nei = 0,
          n_v_near = 0;
      for (let nei_idx in rng_info.Ve_map[a_idx]) {
        if (nei_idx < n_a) { continue; }

        n_v_nei++;

        let dist = njs.norm2( njs.sub( rng_info.P[a_idx], rng_info.P[nei_idx] ) );

        if ( dist < D_kill ) { n_v_near++; }

      }

      // removal of auxin shouldn't affect the auxin to vein
      // relative neighborhood graph, so Ve_map above can
      // still be altered but the auxin-vein edges will
      // remain untouched.
      //
      if ((n_v_near > 0) &&
          (n_v_near == n_v_nei)) {


        SPoIF_swap_2d( rng_info, a_idx, n_a-1 );

        // WIP!!!
        //if (a_idx in _v_idx_dirty_map) { delete _v_idx_dirty_map[a_idx]; }
        //_v_idx_dirty_map[ n_a-1 ] = 1;

        SPoIF_rem_2d( rng_info, n_a-1 );
        n_a--;
        a_idx--;

      }


    }
    */

    prof_e(perf, "vswap");

    prof_s(perf, "rng.1");

    // FOCUS: this is where the optimization needs to happen
    // !!!!
    //
    rng_info = lune_network_2d_SPoIF( rng_info.P );

    //TEMPORARY:
    // cur_v_pull has current vein nodes with at least one auxin neighbor.
    // redoing the rng network above might remove some vertices from that
    // list, so we need to do the slow thing of going through all vein nodes
    // and seeing if they have any auxin neighbors.
    // this destroys the optimization but when we optimize this portion,
    // we can incrementally update the cur_v_pull as well
    //
    cur_v_pull = {};
    for (let v_idx = n_a; v_idx < (n_a+n_v); v_idx++) {
      for (let v_nei in rng_info.Ve_map[v_idx]) {
        if (v_nei < n_a) {
          cur_v_pull[v_idx] = 1;
          break;
        }
      }
    }

 
    /*
    while (_v_idx_dirty_Q.length > 0) {
      let _v_idx = _v_idx_dirty_Q.pop();

      // save neighbors of v before we run a local RNG for v
      // and remove neighbors of v in Ve_map so that the
      // RNG can run fresh.
      //
      let _prv_nei = {};
      for (let _u_idx in rng_info.Ve_map[_v_idx]) {
        _prv_nei[_u_idx] = 1;
        delete rng_info.Ve_map[_v_idx][_u_idx];
      }

      // run local RNG for v, updating it's neighbors
      //
      lune_network_2d_SPoIF_RNGv(rng_info, _v_idx);

      // if we've added new edges, add them to the queue.
      // if the edge was there before the local RNG, it isn't dirtied
      // otherwise, add it to the queue
      //
      for (let _u_idx in rng_info.Ve_map[_v_idx]) {
        if (_u_idx in _prv_nei) { continue; }
        if (!(_u_idx in _v_idx_dirty_map)) { _v_idx_dirty_Q.push(_u_idx); }
        _v_idx_dirty_map[_u_idx] = 1;
      }

      // if v previously had an edge that was removed from the new local RNG
      // calculation, add the neighbor to the queue.
      //
      for (let _u_idx in _prv_nei) {
        if (_u_idx in rng_info.Ve_map[_v_idx]) { continue; }
        if (!(_u_idx in _v_idx_dirty_map)) { _v_idx_dirty_Q.push(_u_idx); }
        _v_idx_dirty_map[_u_idx] = 1;
      }

    }
    */


    prof_e(perf, "rng.1");
    prof_e(perf, "rng.tot");

    console.log("#fin: n_a:", n_a, "n_v:", n_v, "P.length:", rng_info.P.length);

    it++;
  }

  if (it == max_it) { console.log("#MAX_IT reached:", max_it); }

  prof_e(perf, "tot");

  prof_print(perf);

  //DEBUG
  _debug_rng_ofn_E(".debug/sca_spoif_2d_fin.gp", rng_info);
}


// navie slow version
// trying to get baseline algorithm to compare against
//
// there are still connections between vein nodes
// that look to be quite long, so I'm not sure if
// it's working as expected.
//
//
function sca_spoif_2d(A, V) {
  let _eps = _EPS;

  let it=0, max_it = 10000;

  //DEBUG
  max_it = 256;
  max_it = 1024;

  // 1/16 is way too low, 1/4 looks to be working
  // better strategy is to increase jitter if the collision
  // count goes haywire.
  //
  let A_jitter = 2*Math.PI*(1/32);
  A_jitter = Math.PI/4;

  let n_a = A.length;
  let n_v = V.length;

  let D_add = 1/8;
  D_add = 1 / ((n_a + n_v));

  //D_add *= 2;
  D_add /= 2;



  //let D_kill = 1 / (Math.sqrt(n_a + n_v));
  let D_kill = 1 / (n_a + n_v);

  let D_vv_kill = D_kill / 4;

  //DEBUG
  //console.log("#D_add:", D_add, "D_kill:", D_kill);
  console.log("#D_add:", D_add, "D_kill:", D_kill, "D_vv_kill:", D_vv_kill);

  let P = [];
  for (let i=0; i<n_a; i++) { P.push( A[i] ); }
  for (let i=0; i<n_v; i++) { P.push( V[i] ); }

  let rng_info = lune_network_2d_SPoIF(P);

  //DEBUG
  //_debug_rng_print_E(rng_info);
  //_debug_print(rng_info);
  for (let i=0; i<rng_info.P.length; i++) {
    console.log("P[", i, "]:", rng_info.P[i]);
  }

  let perf = {};

  prof_s(perf, "tot");

  while ((n_a > 0) &&
         (it < max_it)) {

    //rng_info = lune_network_2d_SPoIF(rng_info.P);

    //DEBUG
    console.log("#it:", it, "n_a:", n_a, "n_v:", n_v);
    _debug_rng_ofn_E(".debug/sca_spoif_2d_" + it.toString() + ".gp", rng_info);
    //_debug_print(rng_info);

    let cur_v_idx = [];
    for (let v_idx = n_a; v_idx < (n_a+n_v); v_idx++) {

      //console.log(">>>", v_idx);

      // collect all vein nodes that have at least one auxin neighbor
      //
      for (let v_nei in rng_info.Ve_map[v_idx]) {
        if (v_nei < n_a) {
          cur_v_idx.push(v_idx);
          break;
        }
      }
    }

    //console.log("cur_v_idx:", cur_v_idx);

    let Vnew = [];
    for (let i=0; i<cur_v_idx.length; i++) {
      let v_idx = cur_v_idx[i];

      let F_s = [0,0];
      for (let nei_idx in rng_info.Ve_map[v_idx]) {

        // add normalized auxin-vein vector
        //
        if (nei_idx < n_a) {
          let dav = njs.sub( rng_info.P[nei_idx], rng_info.P[v_idx] );
          let ndav = njs.mul( 1 / njs.norm2(dav), dav );
          F_s[0] += ndav[0];
          F_s[1] += ndav[1];
        }
      }


      let d_jit_a = (RND() - 0.5)*A_jitter;
      let _c = Math.cos(d_jit_a);
      let _s = Math.sin(d_jit_a);
      F_s = njs.dot( [ [ _c , _s ], [ -_s, _c ] ], F_s );
      F_s = njs.mul( 1 / njs.norm2(F_s), F_s );

      //console.log("atan2:", Math.atan2(F_s[1], F_s[0]), "jit_angle:", jit_angle, "F_s:", F_s);
      console.log("atan2:", Math.atan2(F_s[1], F_s[0]), "F_s:", F_s, "(", njs.norm2(F_s), ")");

      let _v  = njs.add( rng_info.P[v_idx], njs.mul( D_add, F_s ) );
      _v[0] = _clamp( _v[0], 0, 1-_eps );
      _v[1] = _clamp( _v[1], 0, 1-_eps );

      let _valid_v = true;

      /*
      for (let j=n_a; j<rng_info.P.length; j++) {
        let d = njs.norm2( njs.sub( rng_info.P[j], _v ) );
        if (d < D_vv_kill) {
          console.log("rejecting.0 _v:", _v, "too close to v_idx{", j, "}:", rng_info.P[j], "(", d, "/", D_vv_kill, ") (cur v_idx:", v_idx, ")");
          _valid_v = false;
          break;
        }
      }

      for (let j=0; j<Vnew.length; j++) {
        let d = njs.norm2( njs.sub( rng_info.P[j], _v ) );
        if (d < D_vv_kill) {
          console.log("rejecting.1 _v:", _v);
          _valid_v = false;
          break;
        }
      }
      */

      if (_valid_v) {
        console.log("# adding _v:", _v);
        Vnew.push( _v );
      }

    }

    //DEBUG
    //console.log("Vnew:", Vnew);

    // need to do collision check here (D_add)
    //
    for (let i=0; i<Vnew.length; i++) {
      SPoIF_add_2d(rng_info, Vnew[i]);
      n_v++;
    }

    prof_s(perf, "rng.tot");
    prof_s(perf, "rng.0");

    rng_info = lune_network_2d_SPoIF( rng_info.P );

    prof_e(perf, "rng.0");
    prof_s(perf, "vswap");

    //let a_kill = [];
    for (let a_idx=0; a_idx < n_a; a_idx++) {
      let n_v_nei = 0,
          n_v_near = 0;
      for (let nei_idx in rng_info.Ve_map[a_idx]) {
        if (nei_idx < n_a) { continue; }

        n_v_nei++;

        let dist = njs.norm2( njs.sub( rng_info.P[a_idx], rng_info.P[nei_idx] ) );

        //console.log("dist(a_idx:", a_idx, ", nei_idx:", nei_idx, "):", dist, "D_kill:", D_kill);

        if ( dist < D_kill ) { n_v_near++; }

      }

      // removal of auxin shouldn't affect the auxin to vein
      // relative neighborhood graph, so Ve_map above can
      // still be altered but the auxin-vein edges will
      // remain untouched.
      //
      if ((n_v_near > 0) &&
          (n_v_near == n_v_nei)) {

        //a_kill.push( a_idx );
        SPoIF_swap_2d( rng_info, a_idx, n_a-1 );
        SPoIF_rem_2d( rng_info, n_a-1 );
        n_a--;
        a_idx--;

      }


    }

    prof_e(perf, "vswap");

    /*
    console.log("a_kill:", a_kill);

    for (let i=0; i<a_kill.length; i++) {
      let a_idx = a_kill[i];

      SPoIF_swap_2d( rng_info, a_idx, n_a-i-1 );
      SPoIF_rem_2d( rng_info, n_a-i-1 );
      n_a--;

      //console.log("KILLED:", a_idx, "now:");
      //_debug_print(rng_info);
    }
    */

    prof_s(perf, "rng.1");

    rng_info = lune_network_2d_SPoIF( rng_info.P );

    prof_e(perf, "rng.1");
    prof_e(perf, "rng.tot");

    console.log("#fin: n_a:", n_a, "n_v:", n_v, "P.length:", rng_info.P.length);

    it++;
  }

  if (it == max_it) { console.log("#MAX_IT reached:", max_it); }

  //DEBUG
  _debug_rng_ofn_E(".debug/sca_spoif_2d_fin.gp", rng_info);

  prof_e(perf, "tot");

  prof_print(perf);

}

// we're going to assume in unie cube for the time being
//
function sca_spoif_3d(A, V) {

  let n_a = A.length;
  let n_v = V.length;

  let P = [];
  for (let i=0; i<n_a; i++) { P.push( A[i] ); }
  for (let i=0; i<n_v; i++) { P.push( V[i] ); }

  let rng_info = lune_network_3d_SPoIF(P);

  // dedup Vertex edge lists
  //
  let Ve = rng_info.Ve;
  for (let i=0; i<Ve.length; i++) {
    Ve[i].sort( function(a,b) { if (a<b) { return -1; } if (a>b) { return 1; } return 0; } );

    let _a = [ Ve[i][0] ];
    for (let j=1; j<Ve[i].length; j++) {
      if (Ve[i][j] != _a[ _a.length-1 ]) {
        _a.push( Ve[i][j] );
      }
    }
    Ve[i] = _a;
  }

  let L_A = [],
      L_V = [];

  for (let i=0; i<n_a; i++) {
    for (let j=0; j<Ve[i].length; j++) {
      if (Ve[i][j] >= n_a) { L_A.push(i); break; }
    }
  }

  for (let i=n_a; i<(n_a+n_v); i++) {
    for (let j=0; j<Ve[i].length; j++) {
      if (Ve[i][j] < n_a) { L_V.push(i); break; }
    }
  }



  console.log(rng_info);

  console.log("L_A:", JSON.stringify(L_A));
  console.log("L_V:", JSON.stringify(L_V));

  while (L_A.length > 0) {

    let _lvp = [];

    // BIRTH
    //
    for (let _idx=0; _idx<L_V.length; _idx++) {
    }

    // UPDATE
    //
    for (let _idx=0; _idx<_lvp.length; _idx++) {
    }
  }



}

//----
//----
//----

//DEBUG
//DEBUG
//DEBUG
function spoif_spotcheck() {

  let _n = 10000;
  _n = 1000;
  let _P = [];
  for (let i=0; i<_n; i++) {
    _P.push( [ _rnd(), _rnd(), _rnd() ] );
  }
  let info = lune_network_3d_SPoIF(_P);

  gnuplot_rng3d("data/rng_spoif_n1000.gp", info);

  let naive_res = naive_relnei_E(info.P);

  let _cmp_res = check_cmp(info, naive_res.A);
  console.log(_cmp_res);

}
//DEBUG
//DEBUG
//DEBUG

function WS(n, ws) {
  n = ((typeof n === "undefined") ? 0 : n);
  ws = ((typeof ws === "undefined") ? " " : ws);
  let _s = [];
  for (let i=0; i<n; i++) { _s.push(ws); }
  return _s.join("");
}

function _debug_print(info) {
  console.log(info);

  let _max_w = 0;

  if (info.dim == 3) {

    for (let iz=0; iz<info.grid.length; iz++) {
      for (let iy=0; iy<info.grid[iz].length; iy++) {
        let _ele_w = 0;
        for (let ix=0; ix<info.grid[iz][iy].length; ix++) {
          for (let i=0; i<info.grid[iz][iy][ix].length; i++) {
            let s = printf("%i", info.grid[iz][iy][ix][i]);
            _ele_w += s.length;
            if (i>0) { _ele_w++; }
          }
        }
        if (_ele_w > _max_w) { _max_w = _ele_w; }
      }
    }

    for (let iz=0; iz<info.grid.length; iz++) {

      console.log("# z=", iz);
      for (let iy=0; iy<info.grid[iz].length; iy++) {
        let _row = [];
        for (let ix=0; ix<info.grid[iz][iy].length; ix++) {
          let _ele = [];
          for (let i=0; i<info.grid[iz][iy][ix].length; i++) {
            let s = printf("%i", info.grid[iz][iy][ix][i]);
            _ele.push( s );
          }
          if (_ele.length == 0) { _ele.push('.'); }

          let _ele_s = _ele.join(",");

          if (_ele_s.length < _max_w) {
            _ele_s = WS(_max_w - _ele_s.length, " ") + _ele_s;
          }

          _row.push( _ele_s );
        }
        console.log( _row.join(" ") );
      }
      console.log("");
    }

  }
  else if (info.dim == 2) {

    for (let iy=0; iy<info.grid.length; iy++) {
      for (let ix=0; ix<info.grid[iy].length; ix++) {
        let _ele_w = 0;
        for (let i=0; i<info.grid[iy][ix].length; i++) {
          let s = printf("%i", info.grid[iy][ix][i]);
          _ele_w += s.length;
          if (i>0) { _ele_w++; }
        }
        if (_ele_w > _max_w) { _max_w = _ele_w; }
      }
    }

    for (let iy=0; iy<info.grid.length; iy++) {
      let _row = [];
      for (let ix=0; ix<info.grid[iy].length; ix++) {
        let _ele = [];
        for (let i=0; i<info.grid[iy][ix].length; i++) {
          let s = printf("%i", info.grid[iy][ix][i]);
          _ele.push( s );
        }
        if (_ele.length == 0) { _ele.push('.'); }

        let _ele_s = _ele.join(",");

        if (_ele_s.length < _max_w) {
          _ele_s = WS(_max_w - _ele_s.length, " ") + _ele_s;
        }

        _row.push( _ele_s );
      }
      console.log( _row.join(" ") );
    }

  }

  for (let idx=0; idx<info.P.length; idx++) {

    let nei_a = [];
    for (let nei_idx in info.Ve_map[idx]) { nei_a.push(nei_idx); }
    let nei_s = nei_a.join(",");

    if (info.P[idx].length == 3) {
      console.log( printf("[%i] {%f,%f,%f} _%3i,%3i,%3i_ (%s %i) :{%s}",
        idx, info.P[idx][0], info.P[idx][1], info.P[idx][2],
        info.P_idx_grid_bp[idx][0],
        info.P_idx_grid_bp[idx][1],
        info.P_idx_grid_bp[idx][2],
        info.P_label[idx],
        info.P_dirty[idx],
        nei_s) );
    }

    else if (info.P[idx].length == 2) {
      console.log( printf("[%i] {%f,%f} _%3i,%3i_ (%s %i) :{%s}",
        idx, info.P[idx][0], info.P[idx][1],
        info.P_idx_grid_bp[idx][0],
        info.P_idx_grid_bp[idx][1],
        info.P_label[idx],
        info.P_dirty[idx],
        nei_s) );
    }

  }

}

function cli_main(argv) {

  let seed = 1337;
  let rnd = srand(seed);

  let N = 200;

  console.log("#", JSON.stringify(argv));

  let op = "";

  if (argv.length > 1) {
    op = argv[1];
    if (argv.length > 2) {
      N = parseInt(argv[2]);
    }
  }

  if ((op == '') || (op == '3d')) {
    let P = poisson_point(N, 3, rnd);
    let rng_info = lune_network_3d_SPoIF(P);
    gnuplot_rng3d("/dev/stdout", rng_info);
  }

  else if (op == 'opt_check2d') {
    let P = poisson_point(N, 2, rnd);
    let rng_info = lune_network_2d_SPoIF(P);
    let naive_res = naive_relnei_E(P);
    console.log( check_cmp(rng_info, naive_res.A) );
  }

  else if (op == 'opt_dev2d') {
    let P = poisson_point(N, 2, rnd);
    let rng_info = lune_network_2d_SPoIF(P);
    //_debug_print(rng_info);
    prof_print(rng_info.prof);
  }

  else if (op == '2d') {
    let P = poisson_point(N, 2, rnd);
    let rng_info = lune_network_2d_SPoIF(P);
    gnuplot_rng2d("/dev/stdout", rng_info);
  }

  else if (op == 'opt_check') {
    let P = poisson_point(N, 3, rnd);
    let rng_info = lune_network_3d_SPoIF(P);
    let naive_res = naive_relnei_E(P);
    console.log( check_cmp(rng_info, naive_res.A) );
  }

  // optimization development
  //
  else if (op == 'opt_dev') {
    let P = poisson_point(N, 3, rnd);
    let rng_info = lune_network_3d_SPoIF(P);

    prof_print(rng_info.prof);
  }

  else if (op == 'debug_print') {
    let P = poisson_point(N, 3, rnd);
    let rng_info = lune_network_3d_SPoIF(P);
    _debug_print(rng_info);
  }

  else if (op == 'debug_swap') {
    let P = poisson_point(N, 3, rnd);
    let rng_info = lune_network_3d_SPoIF(P);

    let a_idx = 0;
    let b_idx = 1;
    if (argv.length > 3) {
      tok = argv[3].split(",");
      if (tok.length > 0) {
        a_idx = parseInt(tok[0]);
        if (tok.length > 1) {
          b_idx = parseInt(tok[1]);
        }
      }
    }

    SPoIF_swap(rng_info, a_idx, b_idx);
    _debug_print(rng_info);
  }

  else if (op == 'sca2d') {
    let A = poisson_point(N, 2, rnd);
    let V = [ [0, 0] ];
    sca_spoif_2d(A, V);
  }

  else if (op == 'sca2d.opt') {
    let A = poisson_point(N, 2, rnd);
    let V = [ [0, 0] ];
    sca_spoif_2d_opt(A, V);
  }

  else if (op == 'sca3d') {
    let A = poisson_point(N, 3, rnd);
    let V = [ [0, 0, 0] ];
    sca_spoif_3d(A, V);
  }

}

function export_f() {
  exports["spoif3d"] = lune_network_3d_SPoIF;
  exports["naive_rng_E"] = naive_relnei_E;
}

if      (typeof require === "undefined")  { export_f(); }
else if (require.main === module)         { cli_main(process.argv.slice(1)); }
else                                      { export_f(); }
