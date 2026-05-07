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


// Notes for future me:
//
// For 
//
// When calculating the sweep 
// the R1 octent wedge might intersect the topmost square at i_radius=1
// but subsequent intersections will all be on the rightmost face.
// So gathering points for comparison should use all of i_radius=1
// and then higher i_radius can use only the sides.
//
function grid_sweep_2d(ctx, pnt, i_radius, r_idx) {
  let pi8 = Math.PI / 8;
  let theta = r_idx * pi8;

  let wedge_ends = [
    [ [ 1, 0], [ 1, 1] ],
    [ [ 1, 1], [ 0, 1] ],

    [ [ 0, 1], [-1, 1] ],
    [ [-1, 1], [-1, 0] ],

    [ [-1, 0], [-1,-1] ],
    [ [-1,-1], [ 0,-1] ],

    [ [ 0,-1], [ 1,-1] ],
    [ [ 1,-1], [ 1, 0] ]
  ];

  let face_dir = [
    [ 0, 1],
    [-1, 0],
    [ 0,-1],
    [ 1, 0]
  ];

  let cell_size = ctx.grid_cell_size;

  let ipnt = [
    Math.floor(pnt[0] / cell_size[0]),
    Math.floor(pnt[1] / cell_size[1])
  ];

  let info = {
    "path": [],
    "p": [ pnt[0], pnt[1] ],
    "s": [], "S": [],
    "v": [], "V": [],
    "n": 0
  };

  let grid_bbox = [ [ 0, 0 ], [ ctx.grid_n, ctx.grid_n ] ];

  let q_dir = Math.floor(((r_idx+1)%8)/2);
  let vdir = face_dir[q_dir];

  let s_wedge = njs.mul(i_radius, wedge_ends[r_idx][0]);
  let e_wedge = njs.mul(i_radius, wedge_ends[r_idx][1]);

  let n = Math.abs( (e_wedge[0] - s_wedge[0]) + (e_wedge[1] - s_wedge[1]) );
  n = i_radius;

  let s_ipnt = [ ipnt[0] + s_wedge[0], ipnt[1] + s_wedge[1] ];
  let cur_ipnt = [0,0];

  info.s = s_ipnt;
  info.S = [ s_ipnt[0]*cell_size[0], s_ipnt[1]*cell_size[1] ];
  info.v = vdir;
  info.V = [vdir[0]*cell_size[0], vdir[1]*cell_size[1]];
  info.n = n;

  if (i_radius == 0) {
    info.path.push([s_ipnt[0], s_ipnt[1]]);
    return info;
  }

  let grid_path = [];

  if ((r_idx%2)==1) {
    let cdir = face_dir[ (q_dir+3)%4 ];
    let _p = [ s_ipnt[0] - cdir[0], s_ipnt[1] - cdir[1] ];
    if (!oob(_p, grid_bbox)) {
      grid_path.push( _p );
    }
  }

  for (let i=0; i<=n; i++) {
    let _p = [ s_ipnt[0] + vdir[0]*i, s_ipnt[1] + vdir[1]*i ];
    cur_ipnt = _p;
    if (oob(_p, grid_bbox)) { continue; }
    grid_path.push( _p );
  }

  if ((r_idx%2)==0) {
    let cdir = face_dir[ (q_dir+1)%4 ];
    let _p = [ cur_ipnt[0] + cdir[0], cur_ipnt[1] + cdir[1] ];
    if (!oob(_p, grid_bbox)) {
      grid_path.push( [ cur_ipnt[0] + cdir[0], cur_ipnt[1] + cdir[1] ] );
    }
  }


  info.path = grid_path;
  return info;
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


// WIP!!!
//
// 2026-05-05: ir gets up to max (22 for 10k test)
// which shouldn't really be possible.
// it also shows 1/3 or so as having ir 0, which is suspicious.
// we need to verify that fence posts are being secured the way
// we think they are.
//

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
  _debug = 4;
  _debug = -1;
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


function __cruft() {
  let res0 = gen_instance_2d_fence(10000);
  print_edge(res0.P, res0.E);
  process.exit();

  var prof_ctx = {};
  for (let n=10000; n<100000; n+=1000) {
    console.log(n);
    prof_s(prof_ctx, "n" + n.toString());
    let res0 = gen_instance_2d_fence(n);

    prof_e(prof_ctx, "n" + n.toString());

    prof_print(prof_ctx);
    
    //print_edge(res0.P, res0.E);
  }


  process.exit();

  let res1 = gen_instance_2d(res0.P.length, undefined, res0.P);
  print_edge(res1.P, res1.E);

  let _lp = lune_points( res0.P[157], res0.P[33] );
  print_point(_lp);

  process.exit();

}


//test_grid_sweep_perim_2d();
//process.exit();


function fence_secure(fence, ir) {
  for (let i=0; i<fence.length; i++) {
    if (fence[i] < 0) { return false; }
    if (fence[i] > ir) { return false; }
  }
  return true;
}

function _gen_instance_2d_fence(n, B) {
  let info = {
    "dim": 2,
    "start": [0,0],
    "size": [1,1],
    "point": [],
    "point_grid_bp": [],
    "grid_cell_size": [-1,-1],
    "bbox": [[0,0], [1,1]],
    "grid": [],
    "edge": []
  };

  let grid_s = Math.sqrt(n);
  let grid_n = Math.ceil(grid_s);

  let ds = 1 / grid_n;

  info.grid_cell_size[0] = ds;
  info.grid_cell_size[1] = ds;
  info.grid_n = grid_n;
  info.grid_s = grid_s;


  //PROFILING
  prof_s(prof_ctx, "init_grid");
  //PROFILING


  // alloc grid
  //
  for (let i=0; i<grid_n; i++) {
    info.grid.push([]);
    for (let j=0; j<grid_n; j++) {
      info.grid[i].push([]);
    }
  }

  let grid_size  = [ 1, 1 ];
  let grid_start = [ 0,0 ];
  let grid_cell_size = [ ds, ds ];

  info.start = grid_start;
  info.size = grid_size;

  // alloc and create random points
  //
  for (let i=0; i<n; i++) {
    let pnt = [ Math.random()*grid_size[0] + grid_start[0], Math.random()*grid_size[1] + grid_start[1] ];
    info.point.push(pnt);
    info.point_grid_bp.push([-1,-1]);
    //info.edge.push([]);
  }

  //PROFILING
  prof_e(prof_ctx, "init_grid");
  //PROFILING

  //PROFILING
  prof_s(prof_ctx, "setup");
  //PROFILING


  // push points into grid, linear linked list/array for dups
  //
  for (let i=0; i<n; i++) {
    //let ix = Math.floor(info.point[i][0]*grid_s);
    //let iy = Math.floor(info.point[i][1]*grid_s);
    let ix = Math.floor(info.point[i][0]*grid_n);
    let iy = Math.floor(info.point[i][1]*grid_n);
    info.grid[iy][ix].push(i);
    info.point_grid_bp[i] = [ix,iy];
  }

  //PROFILING
  prof_e(prof_ctx, "setup");
  //PROFILING


  let P = info.point;
  let G = info.grid;

  let E = [];

  let octant_dir_map = [ 0, 1, 1, 2, 2, 3, 3, 0 ];

  // 0 - right
  // 1 - left
  // 2 - up
  // 3 - down
  //

  // octant_index_2d(p,q)

  for (let p_idx=0; p_idx < P.length; p_idx++) {
    let pnt = P[p_idx];

    let i_anch_x = Math.floor(pnt[0] / ds);
    let i_anch_y = Math.floor(pnt[1] / ds);

    let fence_q = [-1,-1,-1,-1];

    let iR = 0;
    while (iR < grid_n) {

      if (fence_secure(i_r, fence_q)) { break; }

      for (let g_idx=0; g_idx < G[i_anch_y][i_anch_x].length; g_idx++) {
        let q_idx = G[i_anch_y][i_anch_x][g_idx];
        if (q_idx == p_idx) { continue; }

      }

      iR++;
    }

  }

}

/*
let a = lune_points([0,0], [0,1], 32, 1);
print_point(a);
console.log("\n");

a = lune_points([0,0], [Math.sqrt(2), -1], 32, 1);
print_point(a);
console.log("\n");

a = lune_points([0,0], [1, -Math.sqrt(2)/2], 32, 1);
print_point(a);
console.log("\n");

process.exit();
*/

// trying to figure out why there's a polynomial time blowup
//

//info = gen_instance_2d(3000, [[0,0],[1,1]]);
//process.exit();

function cell_stat_experiment() {

  for (let it=0; it<10; it++) {
    console.log("#it:", it);
    let info = gen_instance_2d(10000, [[0,0],[1,1]]);
  }

  for (let dist in _debug_stat.count) {
    console.log("#", dist, _debug_stat.val[dist], _debug_stat.count[dist] );
    console.log( dist, _debug_stat.val[dist] / _debug_stat.count[dist]);
  }
  process.exit();
}

function __main() {
  let _single_run = false;
  if (_single_run) {
    let info = gen_instance_2d(1000, [[0,0],[1,1]]);
    print_point(info.point, 1);
    process.exit();

  }
  else {

    for (let t=100; t<5000; t+=100) {

      let s_t = new Date().getTime();

      let info = gen_instance_2d(t, [[0,0],[1,1]]);
      //print_point(info.point, 1);

      let e_t = new Date().getTime();

      console.log("##", t, (e_t - s_t)/1000);
    }
    process.exit();

  }

}

// CRUF!!!

function _xxx() {
  let anchor_pnt = [ Math.random(), Math.random() ];

  for (let ir=0; ir<5; ir++) {
    for (let r_idx=0; r_idx<8; r_idx++) {
      console.log("###", ir, r_idx);
      let gp = grid_sweep_2d([0.05,0.05], anchor_pnt, ir, r_idx);


      for (let ii=0; ii<gp.n; ii++) {
        //console.log(gp.s[0] + gp.v[0]*ii, gp.s[1] + gp.v[1]*ii);
        console.log(gp.S[0] + gp.V[0]*ii, gp.S[1] + gp.V[1]*ii);
      }

      console.log("");

      //console.log(gp);
    }
    console.log("\n");
  }

  process.exit();

  let naive_res = naive_relnei_E(pnt);
  let A = naive_res.A;

  let print_lune = true;
  let print_graph = true;

  //print_point(pnt);
  if (print_lune) {
    for (let i=0; i<N; i++) {
      for (let j=(i+1); j<N; j++) {
        if (A[i][j] < 0.5) { continue; }
        let a = pnt[i];
        let b = pnt[j];
        let lune_pnt = lune_points(a,b);
        print_point(lune_pnt);
      }
    }
  }

  if (print_graph) {
    for (let i=0; i<N; i++) {
      for (let j=(i+1); j<N; j++) {
        if (A[i][j] < 0.5) { continue; }
        let a = pnt[i];
        let b = pnt[j];
        console.log(a[0], a[1]);
        console.log(b[0], b[1]);
        console.log("");
      }
    }
  }

}

function failing0() {
  let P = [
    [0.44584097480654905,0.2630677410107003,0.978063734762359],
    [0.8792005129276691,0.9569835189557732,0.4981144569316643],

    // !!
    [0.7302476517208656,0.4085662385644728,0.8950140702477447],
    // !!

    [0.4021124780579683,0.3027373978303754,0.6800684457807135],

    // !!
    [0.40536140905436313,0.6930924860922895,0.8439412700390785],
    // !!

    [0.8046564969848393,0.02887287542893153,0.9445998333212928],
    [0.4472281866578808,0.7399787104118357,0.940831312948197],
    [0.4024911152400458,0.9972875928707101,0.6140172162073474],
    [0.45340850104715535,0.48780232400880913,0.2571819484664662],
    [0.1309191022868963,0.29401818315842815,0.024937234825944187]
  ];

  let res_fence = gen_instance_3d_fence(P.length, [[0,0,0],[1,1,1]], P);
  let res_naive = naive_relnei_E(P);

  print_point(res_fence.P, 1);
  print_E(res_fence.P, res_fence.E);

  let _cmp_res = check_cmp(res_fence, res_naive.A);

  if (!_cmp_res) {
    console.log("# mismatch!!");
  }
}

function failing1() {
  let P = [

[0.48236153119999786,0.5829562578210701,0.5894499262133782],
[0.40226423198824285,0.18571662125302568,0.8676381195370179],
[0.33215985928550007,0.7072200784349136,0.8788649781571626],
[0.48895317751943884,0.3456950558866528,0.7701554499785753],
[0.2902892853701606,0.17521479079563637,0.9474716241453544],
[0.2801319609391316,0.9000756739056867,0.10790588342455201],
[0.7257716226289987,0.9872984729307688,0.6558161569627607],
[0.20155954725594033,0.05141859488332581,0.4873397088251342],

  //!!
[0.38641533071261625,0.19886654954131305,0.1412455118739861],
  //!!

[0.9430324013584659,0.5791526363231108,0.8927393680820273],
[0.4569842977471846,0.9361777812913996,0.8644125468436177],
[0.044553879420293645,0.643883319861713,0.9199383885412326],
[0.3995710006357906,0.3124296141199602,0.7713934061210598],
[0.052040577538081334,0.47600458330531326,0.4871463395672549],

//!!
[0.37520407169511805,0.7350236931845794,0.1331874245080567],
[0.7484014367367805,0.3342644552089469,0.12295008151606544],
//!!

[0.8238535262366712,0.9172865900773475,0.629972129987517],
[0.26076817231777033,0.798646842066488,0.1639779261157275],
[0.1922848467550962,0.6117787464338532,0.9838191584318533],
[0.9281548838754002,0.8630286046201179,0.16849134805951754]
];


  let res_fence = gen_instance_3d_fence(P.length, [[0,0,0],[1,1,1]], P);
  let res_naive = naive_relnei_E(P);

  print_point(res_fence.P, 1);
  print_E(res_fence.P, res_fence.E);

  let _cmp_res = check_cmp(res_fence, res_naive.A);

  let p_idx = 14;
  let q_idx = 15;
  let u_idx = 8;

  let info = res_fence.info;

  let cell_size = info.grid_cell_size;
  console.log("#ds:", cell_size);

  console.log("# u_idx:", u_idx, "in lune(", p_idx, q_idx,"):", in_lune(P[p_idx], P[q_idx], P[u_idx]));
  console.log("# u_idx:", u_idx, "in lune(", q_idx, p_idx,"):", in_lune(P[q_idx], P[p_idx], P[u_idx]));

  let p_ixyz = [
    Math.floor( P[p_idx][0] / cell_size[0]),
    Math.floor( P[p_idx][1] / cell_size[1]),
    Math.floor( P[p_idx][2] / cell_size[2])
  ]

  let q_ixyz = [
    Math.floor( P[q_idx][0] / cell_size[0]),
    Math.floor( P[q_idx][1] / cell_size[1]),
    Math.floor( P[q_idx][2] / cell_size[2])
  ]

  let u_ixyz = [
    Math.floor( P[u_idx][0] / cell_size[0]),
    Math.floor( P[u_idx][1] / cell_size[1]),
    Math.floor( P[u_idx][2] / cell_size[2])
  ];
  console.log("# p_idx:", p_idx, "P[", p_idx,"]:", P[p_idx], "ixyz:", p_ixyz);
  console.log("# q_idx:", q_idx, "P[", q_idx,"]:", P[q_idx], "ixyz:", q_ixyz);
  console.log("# u_idx:", u_idx, "P[", u_idx,"]:", P[u_idx], "ixyz:", u_ixyz);

  for (let u_idx=0; u_idx < P.length; u_idx++) {
    if ((u_idx == p_idx) || (u_idx == q_idx)){ continue; }
    if (in_lune(P[p_idx], P[q_idx], P[u_idx])) {
      console.log("##!!!! u_idx:", u_idx, "in lune(", p_idx, q_idx, ")");
    }
  }

  //let u_idx = 15;
  //P = res_fence.P;
  //console.log("#0: u_idx", u_idx, "in lune(", p_idx, q_idx, ")?", in_lune(P[p_idx], P[q_idx], P[u_idx]));
  //P = res_naive.P;
  //console.log("#1: u_idx", u_idx, "in lune(", p_idx, q_idx, ")?", in_lune(P[p_idx], P[q_idx], P[u_idx]));

  //console.log("#???", res_naive.A[14][15], res_naive.A[15][14]);

  if (!_cmp_res) {
    console.log("# mismatch!!");
  }
  else {
    console.log("# ok, match");
  }
}

function debug_bad_2d(fn) {
  let data = fs.readFileSync( fn ).toString().split("\n");

  let _pnt = [];

  for (let i=0; i<data.length; i++) {
    if (data[i].length == 0) { continue; }
    if (data[i][0] == '#') { continue; }
    let tok = data[i].split(" ");
    if (tok.length != 2) { continue; }
    let x = parseFloat(tok[0]);
    let y = parseFloat(tok[1]);
    _pnt.push([x,y]);
  }

  console.log("##...", _pnt.length);


  let info = gen_instance_2d_fence(_pnt.length, _pnt);
  let naive_res = naive_relnei_E(_pnt);

  let _cmp_res = check_cmp(info, naive_res.A);

  console.log("# _cmp:", _cmp_res);

}


/*
  //console.log("# DEBUG BAD 2d 100");
  //debug_bad_2d("bad.100");
  console.log("# DEBUG BAD 2d 400");
  debug_bad_2d("bad_2d.400");
  process.exit();
*/

function main_test2d() {
  let Ntest = [
    10,10,10,20,20,20,30,30,30,
    /*
    10,10,10,20,20,20,30,30,30,
    10,10,10,20,20,20,30,30,30,
    10,10,10,20,20,20,30,30,30,
    10,10,10,20,20,20,30,30,30,
    10,10,10,20,20,20,30,30,30,
    */
    50,50,
    100,100,
    200,200,
    300,400,
    500, 600,
    700, 800,
    900, 1000
  ];

  console.log("# main_test_2d");

  for (let n_idx=0; n_idx < Ntest.length; n_idx++) {
    let N = Ntest[n_idx];
    let _pnts = poisson_point(N, 2);

    console.log("## test N:", N, "(", n_idx, "/", Ntest.length, ")");


    console.log("# fence start");

    let info = gen_instance_2d_fence(N, _pnts);

    console.log("# fence done");

    //print_point(info.P, 1);
    //print_E(info.P, info.E);

    console.log("# naive start");

    let naive_res = naive_relnei_E(info.P);

    console.log("# naive done");

    //print_E(naive_res.P, naive_res.E);

    let _cmp_res = check_cmp(info, naive_res.A);

    if (!_cmp_res) {
      console.log("#check failed, points:");
      print_point(info.P);
      break;
    }

    console.log("#", N, "{", n_idx,"}", _cmp_res);

  }


}

function _avgAdeg(A) {
  let tot = 0;
  for (let i=0; i<A.length; i++) {
    for (let j=0; j<A[i].length; j++) {
      if (A[i][j] > 0) { tot++; }
    }
  }

  return tot / A.length;
}

function main_test3d() {

  //failing0();
  //failing1();
  //return;

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

  //Ntest = [ 1000, 2000, 3000 ];

  /*
  Ntest = [];
  for (let i=0; i<100; i++) {
    Ntest.push(20);
  }
  */

  for (let n_idx=0; n_idx < Ntest.length; n_idx++) {
    let N = Ntest[n_idx];
    let _pnts = poisson_point(N, 3);


    console.log("# fence start");

    let info = gen_instance_3d_fence(N, [[0,0,0],[1,1,1]], _pnts);

    console.log("# fence done");

    //print_point(info.P, 1);
    //print_E(info.P, info.E);

    console.log("# naive start");

    let naive_res = naive_relnei_E(info.P);

    console.log("# naive done");

    console.log("## naive avg deg:", _avgAdeg(naive_res.A));

    //print_E(naive_res.P, naive_res.E);

    let _cmp_res = check_cmp(info, naive_res.A);

    if (!_cmp_res) {
      console.log("#check failed, points:");
      print_point(info.P);
      break;
    }

    console.log("#", N, "{", n_idx,"}", _cmp_res);

  }


  process.exit();


  let _n = 100000;
  let _pnt = poisson_point(_n, 2);
  let res = gen_instance_2d_fence(_n, _pnt);

  process.exit();
}

function main_test3d_sf() {

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


    console.log("# fence start");

    let info = lune_network_3d_shrinking_fence(_pnts, [[0,0,0],[1,1,1]]);

    console.log("# fence done");

    console.log("# naive start");

    let naive_res = naive_relnei_E(info.P);

    console.log("# naive done");

    console.log("## naive avg deg:", _avgAdeg(naive_res.A));

    let _cmp_res = check_cmp(info, naive_res.A);

    if (!_cmp_res) {
      console.log("#check failed, points:");
      print_point(info.P);
      break;
    }

    console.log("#", N, "{", n_idx,"}", _cmp_res);

  }

  process.exit();

}


function main_perf_test3d_sf() {

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
    let info = lune_network_3d_shrinking_fence(N, [[0,0,0],[1,1,1]], _pnts);
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
