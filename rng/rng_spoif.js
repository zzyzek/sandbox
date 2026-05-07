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

var _rnd = srand("lunenetwork");

var DEBUG_LEVEL = 0;

var _debug_stat = {
  "count": {},
  "val": {}
};

var prof_ctx = { };

function poisson_point(N, D) {
  D = ((typeof D === "undefined") ? 2 : D);
  let pnt = [];
  for (let i=0; i<N; i++) {
    let p = [];
    for (let j=0; j<D; j++) {
      //p.push( Math.random() );
      p.push( _rnd() );
    }
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

function in_lune(pnt_a, pnt_b, tst_c) {

  let dist_ca = njs.norm2( njs.sub(tst_c, pnt_a) );
  let dist_cb = njs.norm2( njs.sub(tst_c, pnt_b) );
  let dist_ab = njs.norm2( njs.sub(pnt_a, pnt_b) );

  //console.log("# pnt_a(", pnt_a, "), pnt_b(", pnt_b, "), tst_c(", tst_c, ")");
  //console.log("# dist_ca:", dist_ca, "dist_cb:", dist_cb, "dist_ab:", dist_ab);

  if ((dist_ca <= dist_ab) &&
      (dist_cb <= dist_ab)) {
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
    console.log("#", name, (ctx[name].t / ctx[name].c) / 1000, "s", "(", ctx[name].t, "/", ctx[name].c, ")");
  }
}

// secure posts of increasing fence
//
// point - array of points, assumed to be within [0,1]^3 cube (uniform)
//
function lune_network_3d_SPoIF(point) {
  let n = point.length;

  let _debug = 0;

  //DEBUG
  //DEBUG
  //DEBUG
  //_debug = 4;
  //_debug = -1;
  //DEBUG
  //DEBUG
  //DEBUG

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
    "point_grid_bp": [],
    "grid_cell_size": [-1,-1,-1],
    "bbox": [[0,0,0], [1,1,1]],

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
  // point_grid_bp maps index to 3d grid index
  //
  for (let i=0; i<n; i++) {
    info.P.push( [ point[i][0], point[i][1], point[i][2] ] );
    let ix = Math.floor(info.P[i][0]*grid_n);
    let iy = Math.floor(info.P[i][1]*grid_n);
    let iz = Math.floor(info.P[i][2]*grid_n);
    info.grid[iz][iy][ix].push(i);
    info.point_grid_bp.push( [ix,iy,iz] );
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

    //DEBUG
    //DEBUG
    //DEBUG
    //if (p_idx > 0) { return; }
    //DEBUG
    //DEBUG
    //DEBUG


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
    //

    let win_center = njs.add( [ds/2,ds/2,ds/2], njs.mul( ds, cell_origin ) );
    let dp = njs.sub( p, win_center );
    let del_p = njs.sub( win_center, p );

    //DEBUG
    //DEBUG
    //DEBUG
    //DEBUG
    //fs.writeFileSync("data/p" + p_idx.toString() + ".gp", printf("%f %f %f", dp[0], dp[1], dp[2]));
    if (_debug > 3) {
      fs.writeFileSync("data/p" + p_idx.toString() + ".gp", printf("%f %f %f", p[0], p[1], p[2]));
    }
    //DEBUG
    //DEBUG
    //DEBUG
    //DEBUG

    if (_debug > 0) {
      console.log("#ds:", ds, "grid_n:", grid_n);
      console.log("#cell_center:", JSON.stringify(cell_origin),
        "grid_occ:", info.grid[ip[2]][ip[1]][ip[0]].length);
      console.log("#win_center:", JSON.stringify(win_center));
      console.log("#p:", JSON.stringify(p), "(", p_idx, ")");
      console.log("#dp:", JSON.stringify(dp) );
    }

    let sweep_q_idx = [];

    //----
    //WIP!!! ## 2026-05-05
    //STILL TODO:
    //major testing
    //current issue is when p is near edge, we need
    //to mark the fence post as secured if it crosses the boundary.
    //eventually we want to check to make sure if the post is outside
    //the convex hull, it's also marked (maybe a callback that takes
    //in the context, maybe marking cells as a preprocessing step).
    //Still the idea of pairwise visibility to consider and how
    //not to choke on some cases that might show up naturally.
    //----

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

            //DEBUG
            if (_debug > 1) {
              console.log("# oob secure idir:", idir, "fpi:", fpi, "(v:", JSON.stringify(v), ")", JSON.stringify(BB));
            }
            
            fencePostSecure[idir][fpi] = 1;
          }
        }
      }

      //DEBUG
      //DEBUG
      //DEBUG
      if (_debug > 3) {
        let _flines = [];
        for (let idir=0; idir<6; idir++) {
          for (let fpi=0; fpi<fencePost_v[idir].length; fpi++) {
            //let v = njs.mul( Math.sqrt(3)*ds*((2*ir)+1), fencePost_v[idir][fpi] );
            //let v = njs.mul( ds*(ir+1), fencePost_v[idir][fpi] );
            let v = njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] );

            let vt = njs.add( v, win_center );
            //_flines.push("0 0 0");
            //_flines.push(printf("%f %f %f\n\n", v[0], v[1], v[2]));
            _flines.push(printf("%f %f %f", win_center[0], win_center[1], win_center[2]));
            _flines.push(printf("%f %f %f\n\n", vt[0], vt[1], vt[2]));
          }
        }
        fs.writeFileSync("data/f" + ir.toString() + ".gp", _flines.join("\n"));
      }
      //DEBUG
      //DEBUG
      //DEBUG

      //DEBUG
      //DEBUG
      //DEBUG
      if (_debug > 3) {
        console.log("## sweep ir:", ir, "(", sweep.path.length, ")", JSON.stringify(sweep.path));
        for (let path_idx=0; path_idx<sweep.path.length; path_idx++) {
          let ixyz = sweep.path[path_idx];
          let cxyz = njs.add( [ds/2,ds/2,ds/2], njs.mul( ds, ixyz ) );
          gnuplot_cube("data/cubpath" + ir.toString() + "_" + path_idx.toString() + ".gp", cxyz, ds/2);
        }
      }
      //DEBUG
      //DEBUG
      //DEBUG

      if (_debug > 2) { console.log(sweep.path.length, sweep); }


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

      //DEBUG
      //DEBUG
      //DEBUG
      if (_debug > 3) {
        let _qlines = [];
        let _qPlines = [];
        for (let sqi=0; sqi<sweep_q_idx.length; sqi++) {
          let q_idx = sweep_q_idx[sqi];
          let q = info.P[q_idx];
          _qlines.push( printf("%f %f %f\n\n", q[0], q[1], q[2]));

          let dqp = njs.sub(q, p);
          let Ndqp = njs.mul( 1/njs.norm2(dqp), dqp );
          gnuplot_plane("data/qP_ir" + ir.toString() + "_qi" + q_idx.toString() + ".gp", Ndqp, q, (2*ir+1)*ds);
        }
        fs.writeFileSync("data/Q" + ir.toString() + ".gp", _qlines.join("\n"));
      }
      //DEBUG
      //DEBUG
      //DEBUG

      // for all q points, test to see if it secures the fence posts.
      //
      for (let sqi=0; sqi<sweep_q_idx.length; sqi++) {
        let q_idx = sweep_q_idx[sqi];
        let q = info.P[q_idx];
        let dq = njs.sub( q, win_center );

        //let qt = njs.sub( njs.sub( p, q ), dp );
        let dqp = njs.sub(q,p);
        let Nqp = njs.mul( 1 / njs.norm2(dqp), dqp );

        //DEBUG
        //DEBUG
        //DEBUG
        //DEBUG
        if (_debug > 3) {
          gnuplot_plane("data/qp" + sqi.toString() + ".gp", Nqp, dq, ds, 32);
        }
        //DEBUG
        //DEBUG
        //DEBUG
        //DEBUG

        //let qt = njs.add( njs.sub( p, q ), del_p );
        //let Nqt = njs.mul( 1 / njs.norm2(qt), qt );

        if (_debug > 0) {
          console.log("#q[", sqi, "]:", JSON.stringify(q));
          //console.log("#qt:", JSON.stringify(qt), "Nqt:", JSON.stringify(Nqt), "(", njs.norm2(Nqt), ")");
          console.log("#dq:", JSON.stringify(dq), "Nqp:", JSON.stringify(Nqp), "(", njs.norm2(Nqp), ")");
        }

        for (let idir=0; idir<6; idir++) {
          for (let cluster_idx=0; cluster_idx < fencePostCluster.length; cluster_idx++) {

            // count the number of secured posts in this fence cluster
            //
            let n_cluster_secure = 0;
            for (let fpci=0; fpci<fencePostCluster[cluster_idx].length; fpci++) {
              let fpi = fencePostCluster[cluster_idx][fpci];
              //let fpv = njs.add( win_center, njs.mul( ds*(ir+1), fencePost_v[idir][fpi] ) );
              //let fpv = njs.mul( ds*(ir+1), fencePost_v[idir][fpi] );
              let fpv = njs.mul( ds*((2*ir)+1), fencePost_v[idir][fpi] );
              //fpv = njs.mul( Math.sqrt(3)*ds*((2*ir)+1), fencePost_v[idir][fpi] );

              //let u = njs.sub( fpv, qt );
              //let s = njs.dot( Nqt, u );

              let s = njs.dot( Nqp, njs.sub( fpv, dq ) );

              if (_debug > 0) {
                //console.log("# u:", JSON.stringify(u), "s:", s);
                console.log( printf("# fpci: %i, fpi: %i, fpv: [%f %f %f] (wc: [%f %f %f] + (ds:%f * (ir+1):%f) fP_v:[%f %f %f]) s:%f",
                  fpci, fpi, fpv[0], fpv[1], fpv[2],
                  win_center[0], win_center[1], win_center[2],
                  ds, ir+1,
                  fencePost_v[idir][fpi][0],
                  fencePost_v[idir][fpi][1],
                  fencePost_v[idir][fpi][2], s) );
              }

              if (s > 0) { n_cluster_secure++; }
            }

            if (_debug > 0) {
              console.log("## cluster_idx:", cluster_idx, "n_cluster_secure:", n_cluster_secure);
            }

            // if we've secured all posts, mark the relevant posts as secure
            //
            if (n_cluster_secure == fencePostCluster[cluster_idx].length) {

              if (_debug > 2) {
                console.log("#q_idx:", q_idx,
                  "n_cluster_secure:", n_cluster_secure, "/", fencePostCluster[cluster_idx].length, ",",
                  "securing idir:", idir,
                  "cluster:", cluster_idx,
                  "(", JSON.stringify(fencePostCluster[cluster_idx]), ")");
              }

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

      if (_debug > 1) { console.log("#fpsecure (", n_secure, "):", fencePostSecure); }

      if (n_secure == n_secure_max) {
        if (_debug > 2) {
          console.log("#SECURE", "ir:", ir, "p_idx:", p_idx);
        }

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

    if (_debug > 1) { console.log("###IR!!!:", ir); }

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

    if (_debug == -1) { console.log("#", p_idx, "/", info.P.length, "(", added, info.E.length, ")"); }

  }

  return info;
}

//DEBUG
//DEBUG
//DEBUG
// seed random here
//

function gnuplot_rng3d(ofn, ctx) {
  let _lines =[];
  for (let i=0; i<ctx.E.length; i++) {
    let p_idx = ctx.E[i][0];
    let q_idx = ctx.E[i][1];

    let p = ctx.P[p_idx];
    let q = ctx.P[q_idx];

    _lines.push( printf("%f %f %f", p[0], p[1], p[2]) );
    _lines.push( printf("%f %f %f\n\n", q[0], q[1], q[2]) );
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

function grid_sweep_perim_2d(ctx, pnt, ir) {
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

function print_fence(fence) {
  for (let i=0; i<fence.length; i++) {
    let dxy = [ Math.random()/64, Math.random()/64 ];
    dxy = [0,0];
    let pv = fence[i];
    console.log(pv[0][0] + dxy[0], pv[0][1] + dxy[1] );
    console.log(pv[0][0] + pv[1][0] + dxy[0], pv[0][1] + pv[1][1] + dxy[1] );
    console.log("\n");
  }

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


function cli_main(argv) {

  console.log("#", JSON.stringify(argv));

  let n = 1000;
  let seed = 1337;

  let rnd = srand(seed);

  let P = [];
  for (let i=0; i<n; i++) {
    P.push( [rnd(), rnd(), rnd()] );
  }

  let rng_info = lune_network_3d_SPoIF(P);
  gnuplot_rng3d("/dev/stdout", rng_info);

}

function export_f() {
  exports["spoif3d"] = lune_network_3d_SPoIF;
  exports["naive_rng_E"] = naive_relnei_E;
}

if      (typeof require === "undefined")  { export_f(); }
else if (require.main === module)         { cli_main(process.argv.slice(1)); }
else                                      { export_f(); }
