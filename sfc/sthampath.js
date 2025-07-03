// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


// An implemention of the Itai-Papadimitriou-Szwarcfitier algorithm
// to find Hamiltonian paths on 2d rectangular regions with arbitrary
// start and end points.
// Hamilton Paths in Grid Graphs
//
// @article{article,
//  author = {Itai, Alon and Papadimitriou, Christos and Szwarcfiter, Jayme},
//  year = {1982},
//  month = {11},
//  pages = {676-686},
//  title = {Hamilton Paths in Grid Graphs},
//  volume = {11},
//  journal = {SIAM J. Comput.},
//  doi = {10.1137/0211056}
// }
//

// See also:
// https://github.com/whatsacomputertho/grid-solver/blob/main/doc/problem-specification.md
//

// The major ideas are that there are a catalogue of different patterns, that
// can be easily tested for, to determine if a st-path exists within the rectangular region.
//
// They can be broken down to:
//
//   * color compatibility - making sure start and end points have compatible parity
//   * line test - Nx1 graphs need s,t to be at the endpoints for acceptability
//   * partition tests - For Nx2 graphs, endpoints partitioning the graph will make it unacceptable
//   * cul-de-sac tests - For Nx3 graphs, there are configurations that are color compatible but
//      still don't have a Hamiltonian path (see paper, above post)
//
// If a region passes the above tests, it's considered acceptable and has a Hamiltonian path within it.
//
// To find the path, a small region can be extended to fill the desired grid by the following methods:
//
//   * Strip - If a rectangular subdivision, R = (S,R-S), can be done with s,t both in one rectangle, R-S say,
//    and R-S is acceptable, then S is acceptable and can be joined at the corner with a pair of edges.
//   * Split - A split can occur at edge (p,q) if s,t are close enough to opposite sides,
//    there exists a partition of R = (R_p, R_q), points p,q such that s,p \in R_p , q,t \in R_q, and R_p, R_q accetable
//    The single edge *splits* the graph. That is, (p,q) splits (R,s,t)
//   * Stripping and splitting sometimes aren't possible. When they aren't, the remaining subproblem must be
//    one of a finite number of *prime Hamiltonian path problems* which are of the form of a (4,5) rectangle or
//    a rectangle with (n,m), n,m <= 3.
//
// So, the general strategy is whittle down a rectangle by stripping and splitting, ensuring acceptability for
// each shave, until a prime region is encountered. The prime region is the base case and a path is built up
// and connected to the stripped and split subdivision.
//
// When considering a large rectangle to shave down, there are essentially three cases:
//
//   * s-t are close enough together near one side of the rectangle
//   * s-t lie far enough apart and are on far sides of the rectangle
//   * the rectangle is prime
//
// If s-t fall close enough together and the rectangle is large enough, then a strip can be done,
//   connecting both regions with a double edge (a circuit gadget since s-t fall within the same sub-region)
// If s-t are fare enough apart and the rectangle is large enough, a split can be done, connecting
//   both regions with a single edge.
// If a strip or a split can't be done, then the region must be small enough and be prime, reaching our base
//   case that we can then use to bootstrap into the larger solution.
//
// So, the high level algorithm is as follows:
//
// sthampath(s,t, width, height):
//   if s,t are not color compatible: fail
//   if ! isAcceptible(s,t,width,height): fail
//   if isPrime(s,t,width,height): return sthampath_prime_path(s,t,width,height)
//   if hasStrip(s,t,width,height):
//     find strip S, with endpoints v', w', (R-S region with corresponding points v'', w'')
//     P_S = sthampath(v',w', width(S), height(S))
//     P_{R-S} = sthampath(s,t, width - width(S), height)
//     return joined P_S to P_{R-S}, joining v', v'' and w', w''
//   if hasSplit(s,t,width,height):
//     find split edge p,q and region S
//     P_p = sthampath(s,p,width(S), height(S))
//     P_q = sthampath(q,t,width - width(S), height)
//     return joined P_p to P_q at p,q
//   (else sanity fail)
//

var STHAMPATH_VERSION = "0.1.0";

var VERBOSE = 1;

var fasslib = require("./fasslib.js");

// pretty hacky and dangerous...
//
for (let key in fasslib) {
  eval( "var " + key + " = fasslib['" + key + "'];" );
}

var _cmp_v = cmp_v;
var _cmp_v_d = cmp_v_d;

//----

var PRIME_HAMILTONIAN_PATH_TEMPLATE = [
  { "size": [2,2], "s": [0,0], "t": [1,0], "path": [ [0,0], [0,1], [1,1], [1,0] ] },

  { "size": [3,2], "s": [0,0], "t": [0,1], "path": [ [0,0], [1,0], [2,0], [2,1], [1,1], [0,1] ] },
  { "size": [3,2], "s": [0,0], "t": [1,0], "path": [ [0,0], [0,1], [1,1], [2,1], [2,0], [1,0] ] },
  { "size": [3,2], "s": [0,0], "t": [2,1], "path": [ [0,0], [0,1], [1,1], [1,0], [2,0], [2,1] ] },

  { "size": [3,3], "s": [0,0], "t": [0,2],
    "path": [ [0,0], [1,0], [2,0],  [2,1], [2,2], [1,2],  [1,1], [0,1], [0,2] ] },

  { "size": [3,3], "s": [0,0], "t": [0,2],
    "path": [ [0,0], [1,0], [2,0],  [2,1], [1,1], [0,1],  [0,2], [1,2], [2,2] ] },

  { "size": [3,3], "s": [0,0], "t": [0,2],
    "path": [ [0,0], [1,0], [2,0],  [2,1], [2,2], [1,2],  [0,2], [0,1], [1,1] ] },

  { "size": [5,4], "s": [1,0], "t": [1,1],
    "path": [ [1,0], [0,0], [0,1], [0,2], [0,3],
              [1,3], [1,2], [2,2], [2,3], [3,3],
              [4,3], [4,2], [3,2], [3,1], [4,1],
              [4,0], [3,0], [2,0], [2,1], [1,1] ] }

];

var PRIME_HAMILTONIAN_PATH = enum_prime_hamiltonian_template(PRIME_HAMILTONIAN_PATH_TEMPLATE);


//----
//----
//----

// we're still settling on data representation, but one thing that's coming up repeatedly is this representation:.
// s,t are in absolute (world) coordinates, anchor is there to provide the corner of the rectangle (in world coordinates).
// alpha/beta are the oriented, axis-aligned size dimension vectors
//
var REGION_TEMPLATE = {
  "anchor": [0,0],
  "s": [0,0],
  "t": [3,3],
  "alpha": [3,0],
  "beta": [0,3]
};

//----
//----
//----


function guuid() { return crypto.randomUUID(); }

function path_cmp( path_a, path_b ) {
  if (path_a.length < path_b.length) { return -1; }
  if (path_a.length > path_b.length) { return  1; }

  for (let i=0; i<path_a.length; i++) {

    for (let j=0; j<2; j++) {
      if ( path_a[i][j] < path_b[i][j] ) { return -1; }
      if ( path_a[i][j] > path_b[i][j] ) { return  1; }
    }
  }

  return 0;
}

function getBounds(path) {
  let b = [[0,0],[0,0]];
  if (path.length==0) { return b; }

  b[0][0] = path[0][0];
  b[0][1] = path[0][1];

  b[1][0] = path[0][0];
  b[1][1] = path[0][1];

  for (let i=1; i<path.length; i++) {
    if (path[i][0] < b[0][0]) { b[0][0] = path[i][0]; }
    if (path[i][1] < b[0][1]) { b[0][1] = path[i][1]; }

    if (path[i][0] > b[1][0]) { b[1][0] = path[i][0]; }
    if (path[i][1] > b[1][1]) { b[1][1] = path[i][1]; }
  }

  return b;
}

function _mk_path_region(size, path) {
  let n = path.length;
  let info = {
    "size": [size[0], size[1]],
    "s": [ path[0][0], path[0][1] ],
    "t": [ path[n-1][0], path[n-1][1] ],
    "path": path
  };
  return info;
}

function _mk_pathkey(path) {
  _key = path.map( (_t) => "(" + _t[0].toString() + "," + _t[1].toString() + ")" ).join("");
  return _key;
}

function enum_prime_hamiltonian_template(template) {
  let _eps = (1.0 / (1024.0*1024.));

  let prime_hamiltonian_path_library = [];

  let seen_keys = {};

  for (let idx=0; idx<template.length; idx++) {
    let info = template[idx];

    size = [ info.size[0], info.size[1] ];
    for (let rot_idx=0; rot_idx<4; rot_idx++) {
      let src_mid = [ (info.size[0]-1)/2, (info.size[1]-1)/2 ];
      let dst_mid = [ (size[0]-1)/2, (size[1]-1)/2 ];

      // rotate
      //

      let dst_path = [];
      for (let i=0; i<info.path.length; i++) {
        let src_pnt = info.path[i];
        let dst_pnt = v_add( dst_mid, rodrigues( v_sub( src_pnt, src_mid ), [0,0,1], Math.PI*rot_idx/2 ) );
        let ipnt = [ Math.floor(dst_pnt[0]+_eps), Math.floor(dst_pnt[1]+_eps) ];
        dst_path.push( ipnt );
      }

      //let _key = dst_path.map( (_t) => "(" + _t[0].toString() + "," + _t[1].toString() + ")" ).join("");
      let _key = _mk_pathkey(dst_path);
      if (!(_key in seen_keys)) {

        /*
        let n = dst_path.length;
        let info_rot = {
          "size": [size[0], size[1]],
          "s": [ dst_path[0][0], dst_path[0][1] ],
          "t": [ dst_path[n-1][0], dst_path[n-1][1] ],
          "path": dst_path
        };
        prime_hamiltonian_path_library.push(info_rot);
        */
        prime_hamiltonian_path_library.push( _mk_path_region(size, dst_path) );

        seen_keys[_key] = 1;
      }

      // reverse path (from rotation)
      //
      let rev_rot_path = [];
      for (let i=0; i<dst_path.length; i++) {
        rev_rot_path.push( dst_path[ dst_path.length-1-i ] );
      }

      _key = _mk_pathkey(rev_rot_path);
      if (!(_key in seen_keys)) {
        prime_hamiltonian_path_library.push( _mk_path_region(size, rev_rot_path) );
        seen_keys[_key] = 1;
      }

      // flip
      // Since we're rotating, we only need to flip in one dimension
      //

      let flipx_path = [];
      for (let i=0; i<dst_path.length; i++) {
        let src_pnt = dst_path[i];
        let flip_pnt = [ size[0] - src_pnt[0] - 1, src_pnt[1] ];
        flipx_path.push( flip_pnt );
      }

      _key = flipx_path.map( (_t) => "(" + _t[0].toString() + "," + _t[1].toString() + ")" ).join("");
      if (!(_key in seen_keys)) {

        n = flipx_path.length;
        let info_flip = {
          "size": [size[0], size[1]],
          "s": [ flipx_path[0][0], flipx_path[0][1] ],
          "t": [ flipx_path[n-1][0], flipx_path[n-1][1] ],
          "path": flipx_path
        };
        prime_hamiltonian_path_library.push(info_flip);

        seen_keys[_key] = 1;
      }

      // reverse path (from flipx)
      //
      let rev_flipx_path = [];
      for (let i=0; i<flipx_path.length; i++) {
        rev_flipx_path.push( flipx_path[ flipx_path.length-1-i ] );
      }

      _key = _mk_pathkey(rev_flipx_path);
      if (!(_key in seen_keys)) {
        prime_hamiltonian_path_library.push( _mk_path_region(size, rev_flipx_path) );
        seen_keys[_key] = 1;
      }


      // flip y
      //
      let flipy_path = [];
      for (let i=0; i<dst_path.length; i++) {
        let src_pnt = dst_path[i];

        let flip_pnt = [ src_pnt[0], size[1] - src_pnt[1] - 1 ];
        flipy_path.push( flip_pnt );
      }

      _key = flipy_path.map( (_t) => "(" + _t[0].toString() + "," + _t[1].toString() + ")" ).join("");
      if (!(_key in seen_keys)) {

        n = flipy_path.length;
        let info_flip = {
          "size": [size[0], size[1]],
          "s": [ flipy_path[0][0], flipy_path[0][1] ],
          "t": [ flipy_path[n-1][0], flipy_path[n-1][1] ],
          "path": flipy_path
        };
        prime_hamiltonian_path_library.push(info_flip);

        seen_keys[_key] = 1;
      }

      // reverse path (from flipy)
      //
      let rev_flipy_path = [];
      for (let i=0; i<flipy_path.length; i++) {
        rev_flipy_path.push( flipy_path[ flipy_path.length-1-i ] );
      }

      _key = _mk_pathkey(rev_flipy_path);
      if (!(_key in seen_keys)) {
        prime_hamiltonian_path_library.push( _mk_path_region(size, rev_flipy_path) );
        seen_keys[_key] = 1;
      }


      // rotate size components
      //
      size = [ size[1], size[0] ];

    }

  }

  //console.log("#tot:", prime_hamiltonian_path_library.length);

  return prime_hamiltonian_path_library;
}

function gnuplot_print_path(path, anchor) {
  anchor = ((typeof anchor === "undefined") ? [0,0] : anchor);

  for (let idx=0; idx<path.length; idx++) {
    console.log(path[idx][0] + anchor[0], path[idx][1] + anchor[1]);
  }
  console.log("\n");
}

function gnuplot_print_hamlib(prime_hamlib) {

  let st_gadget = true;

  let mm = Math.ceil( Math.sqrt(prime_hamlib.length) );
  let F = mm+2;

  for (let idx=0; idx<prime_hamlib.length; idx++) {
    let info = prime_hamlib[idx];
    let p = info.path;

    let dxy = [ F*(idx%mm), F*Math.floor(idx/mm)];

    console.log("#", idx, info.size, "s:", info.s, "t:", info.t);

    if (st_gadget) {
      let s_pnt = p[0];
      let e_pnt = p[ p.length-1 ];

      let _R = 1/8;

      for (let i=0; i<=32; i++) {
        let u = [ dxy[0] + s_pnt[0] + _R*Math.cos( 2*Math.PI*i/32 ),
                  dxy[1] + s_pnt[1] + _R*Math.sin( 2*Math.PI*i/32 ) ];
        console.log(u[0], u[1]);
      }
      console.log("\n\n");

      console.log( dxy[0] + e_pnt[0] + _R, dxy[1] + e_pnt[1] + _R );
      console.log( dxy[0] + e_pnt[0] - _R, dxy[1] + e_pnt[1] + _R );
      console.log( dxy[0] + e_pnt[0] - _R, dxy[1] + e_pnt[1] - _R );
      console.log( dxy[0] + e_pnt[0] + _R, dxy[1] + e_pnt[1] - _R );
      console.log( dxy[0] + e_pnt[0] + _R, dxy[1] + e_pnt[1] + _R );
      console.log("\n\n");
    }

    for (let i=0; i<p.length; i++) {
      //let _p = v_add( [ F*(idx%mm), F*Math.floor(idx/mm)], p[i]);
      let _p = v_add( dxy, p[i]);
      console.log(_p[0], _p[1]);
    }
    console.log("\n\n");
  }

}

//gnuplot_print(prime_hamlib);
//process.exit();


//----

function isColorCompatible(anchor, u,v, alpha, beta) {
  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  let u_l1 = abs_sum_v(u);
  let v_l1 = abs_sum_v(v);

  let a0 = a%2;
  let b0 = b%2;

  let u0 = u_l1%2;
  let v0 = v_l1%2;

  let anchor_parity = abs_sum_v(anchor)%2;

  if (VERBOSE > 1) {
    console.log("# alpha:", a,"beta:", b,"u_l1:", u_l1,"v_l1:", v_l1, "a0:", a0,"b0:", b0,"u0:", u0,"v0:", v0);
  }

  if ( (a0*b0) == 0 ) {

    // |V_0| == |V_1|

    if (u0 != v0) { return true; }
  }
  else {

    // |V_0| == |V_1| + 1
    // u,v belong to majority color
    //
    //if ((u0 == v0) && (u0 == 0)) { return true; }
    if ((u0 == v0) && (u0 == anchor_parity)) { return true; }

  }

  return false;
}

//function isColorCompatible_anchor(anchor,u,v, alpha, beta) { return isColorCompatible( v_sub(u,anchor), v_sub(v,anchor), alpha, beta ); }

function spotcheck_colorcompat() {
  let anchor = [0,0];
  console.log(">>>", isColorCompatible(anchor,[0,0], [3,0], [4,0], [0,3]));
  console.log(">>>", isColorCompatible(anchor,[0,0], [0,3], [3,0], [0,4]));
  console.log(">>>", isColorCompatible(anchor,[0,0], [3,3], [4,0], [0,4]));
  console.log(">>>", isColorCompatible(anchor,[0,0], [2,4], [3,0], [0,5]));
}

//---
//

// Test for an acceptable 2d Hamiltonian path:
//
// input:
//   anchor - reference point vector for rectangle (2x1)
//   _u     - start point of Hamiltonian path (2x1)
//   _v     - end point of Hamiltonian path (2x1)
//   alpha  - width like vector (2x)
//   beta   - height like vector (2x1)
//
// return:
//
//  true  - rectangle is acceptable (has a Hamiltonian path)
//  false - otherwise
//
// The idea is that alpha and beta can flip and point in other axis
// aligned directions.
// One could potentially normalize to transoform the working s,t to
// always assume axis x is the wider, y is the shorter and then
// transform after computations have been done.
// I've chosen to transform _s,_t to start at (0,0) but otherwise
// keep directions as they're specified from _alpha,_beta.
//
function acceptable_st_hampath(anchor, _s,_t, _alpha, _beta, info) {
  info = ((typeof info === "undefined") ? {} : info);
  info["message"] = "";

  if (cmp_v(_s,_t) == 0) {
    info["message"] = "unacceptable: s,t same point";
    return false;
  }

  if ( (!inBounds(_s, anchor, _alpha, _beta)) ||
       (!inBounds(_t, anchor, _alpha, _beta)) ) {
    info["message"] = "unacceptable: s,t out of bounds";
    return false;
  }

  if (!isColorCompatible(anchor, _s, _t, _alpha, _beta)) {
    info["message"] = "unacceptable: color incompatible";
    return false;
  }

  let anchor_parity = abs_sum_v(anchor)%2;

  let alpha = _alpha;
  let beta = _beta;

  let s = v_sub(_s, anchor)
  let t = v_sub(_t, anchor);

  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  if ((a==0) || (b==0)) {
    info["message"] = "unacceptable: zero area";
    return false;
  }

  // make alpha longer axis
  //
  if (a < b) {
    alpha = _beta;
    beta = _alpha;

    let tmp = b;
    b = a;
    a = tmp;
  }

  let d_alpha = v_delta(alpha);
  let d_beta = v_delta(beta);

  // force u to be lex smaller than v
  //
  if (_cmp_v_d(s,t, d_alpha, d_beta) > 0) {
    s = v_sub(_t, anchor);
    t = v_sub(_s, anchor);
  }

  let s_l1 = abs_sum_v(s);
  let t_l1 = abs_sum_v(t);

  let a0 = a%2;
  let b0 = b%2;

  let s0 = s_l1%2;
  let t0 = t_l1%2;

  if (VERBOSE > 1) {
    console.log("#acceptable_st_hampath:", "alpha:", alpha, "(", d_alpha, ")", "beta:", beta, "(", d_beta, ")", "s:", s, "t:", t);
  }

  // line:
  // only valid possibility is if start and endpoints
  // are at either end
  //
  if (b == 1) {
    if ((s_l1 == 0) && (t_l1 == (a-1))) { return true; }
    info["message"] = "unacceptable: line with s,t not on endpoints";
    return false;
  }

  // column partition:
  // If u,v are right on top of each other, their
  // removal would split the graph, ensuring no
  // solution, unless they're at either end.
  // Otherwise, they're already color compatible,
  // so a path is possible.
  //
  if (b == 2) {
    if (_cmp_v(t, v_add(s, d_beta)) != 0) { return true; }

    let s_alpha = dot_v( s, d_alpha );
    if ((s_alpha == 0) || (s_alpha == (a-1))) { return true; }

    info["message"] = "unacceptable: Nx2, u,v edge partitions graph";
    return false;
  }

  // cul-de-sac
  // if:
  //   * b = 3
  //   * a*b even
  //   * s,t different colors and s different color than lower left corner
  //     (upper left corner color the same since b=3)
  //   * (u.x < (v.x-1)) or ((u.y==1) && (u.x < v.x))
  // -> unacceptable
  //
  if (b == 3) {
    if ((a0*b0) == 1) { return true; }
    if (s0 == t0) { return true; }
    if (s0 == 0) { return true; }


    let s_a = dot_v(s, d_alpha);
    let s_b = dot_v(s, d_beta);

    let t_a = dot_v(t, d_alpha);
    let t_b = dot_v(t, d_beta);

    if ( (s_a < (t_a-1)) || ((Math.abs(s_b) == 1) && (s_a < t_a)) ) {
      info["message"] = "unacceptable: Nx3, s,t endpoints create cul-de-sac";
      return false;
    }
  }

  return true;
}

function verifyHampath(path) {
  if (path.length == 0) {
    //console.log("#path.length==0");
    return false;
  }

  let b = getBounds(path);
  let n = (b[1][0] - b[0][0] + 1) * (b[1][1] - b[0][1] + 1);

  if (n != path.length) {
    //console.log("#n", n, "!= path.length", path.length);
    return false;
  }

  let seen = {};

  let prv_pnt = [ path[0][0], path[0][1] ];
  seen[ prv_pnt[0].toString() + "," + prv_pnt[1].toString() ] = 1;

  for (let i=1; i<path.length; i++) {
    let key = path[i][0].toString() + "," + path[i][1].toString();
    if (key in seen) {
      //console.log("#key:", key, "seen", "(", i, ")");
      return false;
    }
    seen[key] = 1;

    let dxy = v_sub(path[i], prv_pnt).map( (_t) => Math.round(_t) );
    if (dxy[0] == 0) {
      if (Math.abs(dxy[1]) != 1) {
        //console.log("# dxy:", dxy, "(", i, ")");
        return false;
      }
    }
    else if (dxy[1] == 0) {
      if (Math.abs(dxy[0]) != 1) {
        //console.log("# dxy:", dxy, "(", i, ")");
        return false;
      }
    }
    else {
      //console.log("# dxy:", dxy, "(", i, ")");
      return false;
    }

    prv_pnt = [ path[i][0], path[i][1] ];

  }

  return true;
}

function _test_acceptable() {
  let examples = [
    // Nx1
    //
    { "expect": true,   "info": { "size": [5, 1], "s": [0,0], "t": [4,0], "path": [] } },
    { "expect": true,   "info": { "size": [1, 5], "s": [0,0], "t": [0,4], "path": [] } },
    { "expect": true,   "info": { "size": [5, 1], "s": [4,0], "t": [0,0], "path": [] } },
    { "expect": true,   "info": { "size": [1, 5], "s": [0,4], "t": [0,0], "path": [] } },

    { "expect": false,  "info": { "size": [5, 1], "s": [1,0], "t": [4,0], "path": [] } },
    { "expect": false,  "info": { "size": [5, 1], "s": [0,0], "t": [3,0], "path": [] } },
    { "expect": false,  "info": { "size": [5, 1], "s": [0,0], "t": [1,0], "path": [] } },

    { "expect": false,  "info": { "size": [1,5], "s": [0,1], "t": [0,4], "path": [] } },
    { "expect": false,  "info": { "size": [1,5], "s": [0,0], "t": [0,3], "path": [] } },
    { "expect": false,  "info": { "size": [1,5], "s": [0,0], "t": [0,1], "path": [] } },

    // Nx2
    //
    { "expect": true,   "info": { "size": [5, 2], "s": [0,0], "t": [0,1], "path": [] } },
    { "expect": false,  "info": { "size": [5, 2], "s": [1,0], "t": [1,1], "path": [] } },
    { "expect": false,  "info": { "size": [5, 2], "s": [2,0], "t": [2,1], "path": [] } },
    { "expect": false,  "info": { "size": [5, 2], "s": [3,0], "t": [3,1], "path": [] } },
    { "expect": true,   "info": { "size": [5, 2], "s": [4,0], "t": [4,1], "path": [] } },

    { "expect": true,   "info": { "size": [5, 2], "s": [0,0], "t": [1,0], "path": [] } },
    { "expect": false,   "info": { "size": [5, 2], "s": [0,0], "t": [1,1], "path": [] } },
    { "expect": false,   "info": { "size": [5, 2], "s": [0,0], "t": [2,0], "path": [] } },
    { "expect": true,   "info": { "size": [5, 2], "s": [0,0], "t": [2,1], "path": [] } },

    { "expect": true,   "info": { "size": [5, 2], "s": [1,0], "t": [2,0], "path": [] } },
    { "expect": false,   "info": { "size": [5, 2], "s": [1,0], "t": [2,1], "path": [] } },
    { "expect": false,   "info": { "size": [5, 2], "s": [1,0], "t": [3,0], "path": [] } },
    { "expect": true,   "info": { "size": [5, 2], "s": [1,0], "t": [3,1], "path": [] } },

    { "expect": true,   "info": { "size": [5, 2], "s": [0,1], "t": [0,0], "path": [] } },
    { "expect": false,  "info": { "size": [5, 2], "s": [1,1], "t": [1,0], "path": [] } },
    { "expect": false,  "info": { "size": [5, 2], "s": [2,1], "t": [2,0], "path": [] } },
    { "expect": false,  "info": { "size": [5, 2], "s": [3,1], "t": [3,0], "path": [] } },
    { "expect": true,   "info": { "size": [5, 2], "s": [4,1], "t": [4,0], "path": [] } },

    { "expect": true,   "info": { "size": [2, 5], "s": [0,0], "t": [1,0], "path": [] } },
    { "expect": false,  "info": { "size": [2, 5], "s": [0,1], "t": [1,1], "path": [] } },
    { "expect": false,  "info": { "size": [2, 5], "s": [0,2], "t": [1,2], "path": [] } },
    { "expect": false,  "info": { "size": [2, 5], "s": [0,3], "t": [1,3], "path": [] } },
    { "expect": true,   "info": { "size": [2, 5], "s": [0,4], "t": [1,4], "path": [] } },

    // Nx3
    //
    { "expect": true,   "info": { "size": [4, 3], "s": [0,0], "t": [3,2], "path": [] } },
    { "expect": false,  "info": { "size": [4, 3], "s": [0,1], "t": [3,1], "path": [] } },
    { "expect": false,  "info": { "size": [4, 3], "s": [0,1], "t": [1,1], "path": [] } },
    { "expect": true,  "info": { "size": [4, 3], "s": [0,1], "t": [0,2], "path": [] } },
    { "expect": true,   "info": { "size": [4, 3], "s": [1,0], "t": [2,0], "path": [] } },

    { "expect": true,   "info": { "size": [3, 4], "s": [0,0], "t": [2,3], "path": [] } },
    { "expect": false,  "info": { "size": [3, 4], "s": [1,0], "t": [1,3], "path": [] } },
    { "expect": false,  "info": { "size": [3, 4], "s": [1,0], "t": [1,1], "path": [] } },
    { "expect": true,  "info": { "size": [3, 4], "s": [1,0], "t": [2,0], "path": [] } },
    { "expect": true,   "info": { "size": [3, 4], "s": [0,1], "t": [0,2], "path": [] } },

  ];

  for (let idx=0; idx<examples.length; idx++) {
    let expect = examples[idx].expect;
    let info = examples[idx].info;

    let alpha = [ info.size[0], 0 ];
    let beta = [ 0, info.size[1] ];

    let err_info = {};

    let anchor = [ Math.floor(Math.random()*20) - 10, Math.floor(Math.random()*20) - 10 ];


    //let ret = acceptable_st_hampath([0,0], info.s, info.t, alpha, beta, err_info);
    let ret = acceptable_st_hampath(  anchor, v_add(anchor, info.s), v_add(anchor, info.t), alpha, beta, err_info);

    if (ret != expect) {
      console.log("[", idx, "]: ERROR:", err_info.message, "expected:", expect, "got:", ret, ":", JSON.stringify(info), );
    }
    else {
      let sfx = "";
      if (VERBOSE > 0) { sfx = " (anchor: [" + anchor[0].toString() + "," + anchor[1].toString() + "])"; }
      console.log("[" , idx, "]: pass" + sfx);
    }

    //console.log("\n");
  }
}

//_test_acceptable();



//----

// WIP - NEEDS TESTING
//
// still not sure about this
// the multidirectionality of alpha and beta mean things
// get a little confusing.
//
// anchor : corner point of rectangle
// _s     : start point (world coordinates)
// _t     : end point (world coordinates)
// alpha  : width like vector
// beta   : height like vector
// info   : holds return information (info.prime element if found)
//
// return:
//
//   true : is a prime hamiltonian path rectanglar region
//   false: is not a prime hamitlonian path rectangular region
//
function isPrime(anchor, _s,_t, alpha, beta, info) {
  info = ((typeof info === "undefined") ? {} : info);

  let primelib = PRIME_HAMILTONIAN_PATH;

  let s = v_sub(_s,anchor);
  let t = v_sub(_t,anchor);

  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  let d_alpha = v_delta(alpha);
  let d_beta = v_delta(beta);

  let sz = v_add(alpha, beta);
  for (i=0; i<sz.length; i++) { sz[i] = Math.abs(sz[i]); }

  //console.log(s,t,a,b,d_alpha,d_beta, sz);

  for (let i=0; i<primelib.length; i++) {
    let pr = primelib[i];

    let pr_s = [ dot_v( d_alpha, pr.s ), dot_v( d_beta, pr.s ) ];
    let pr_t = [ dot_v( d_alpha, pr.t ), dot_v( d_beta, pr.t ) ];

    //console.log(i, "pr.s:", pr.s, "pr.t:", pr.t, "pr.size:", pr.size, "--> pr_st{", pr_s, pr_t, "}");
    //console.log("  ", _cmp_v(sz,pr.size), _cmp_v_d(s,pr_s,d_alpha,d_beta), _cmp_v_d(t,pr_t,d_alpha,d_beta));

    if ( (_cmp_v(sz, pr.size) == 0) &&
         (_cmp_v_d(s, pr_s, d_alpha, d_beta) == 0) &&
         (_cmp_v_d(t, pr_t, d_alpha, d_beta) == 0) ) {

      info["prime"] = pr;
      return true;
    }
  }

  return false;
}

// WIP
//
// We do a lazy evaluation by trying to find the first Nx2 or 2xN strip
// that will work.
//
// For each rectangular region outer edge, E:
//
//  * take u = closest(_s,_t,E)
//  * take dividing 2 vertices away from E towards u
//    creating S and R-S (with R-S containing _s, _t)
//  * check if R-S acceptable, if so, return with lower left
//    with q on adjacent edge and p directly above it
//
// If all edges checked without an acceptable strip, return false
//
// Input:
//
//   anchor - corner of rectangular region
//   _s     - start point of Hamiltonian path
//   _t     - end point of Hamiltonian path
//   alpha  - width like dimension vector
//   beta   - height like dimension vector
//   info   - (optional) structure to hold additional information
//
// Return:
//
//   true  - has strip
//   false - otherwise
//
// If it has a strip, info will hold the region "S" and "T"
// that have the anchor point, s start point, t endpoint, alpha and
// beta dimension vectors.
//
function hasStrip(anchor, _s, _t, alpha, beta, info) {
  info = ((typeof info === "undefined") ? {} : info);

  let s = v_sub(_s,anchor);
  let t = v_sub(_t,anchor);

  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  let d_alpha = v_delta(alpha);
  let d_beta = v_delta(beta);

  let s_a = dot_v(s, d_alpha);
  let s_b = dot_v(s, d_beta);

  let t_a = dot_v(t, d_alpha);
  let t_b = dot_v(t, d_beta);

  let d_2alpha = v_mul(2, d_alpha);
  let d_2beta = v_mul(2, d_beta);

  let res = false;

  // strip on 'left'
  //
  if (Math.min(s_a,t_a) > 1) {

    res = acceptable_st_hampath( v_add(anchor, d_2alpha), _s, _t, v_sub(alpha, d_2alpha), beta );
    if (res) {
      info["comment"] = "strip.a";
      info["S"] = {
        "anchor": v_clone(anchor),
        "s": v_add(anchor, d_alpha),
        "t": v_add(anchor, d_alpha, d_beta),
        "alpha": v_clone(d_2alpha),
        "beta": v_clone(beta)
      };

      info["T"] = {
        "anchor": v_add(anchor, d_2alpha),
        "s": v_clone(_s),
        "t": v_clone(_t),
        "alpha": v_sub(alpha, d_2alpha),
        "beta": v_clone(beta)
      };
      return true;
    }

  }

  // strip on 'right'
  //
  if (Math.max(s_a,t_a) < (a-1)) {

    res = acceptable_st_hampath( anchor, _s, _t, v_sub(alpha, d_2alpha), beta );
    if (res) {
      info["comment"] = "strip.A";

      info["T"] = {
        "anchor": v_clone(anchor),
        "s": v_clone(_s),
        "t": v_clone(_t),
        "alpha": v_sub(alpha, d_2alpha),
        "beta": v_clone(beta)
      };

      let t_anch = v_add(anchor, v_sub(alpha, d_2alpha));

      info["S"] = {
        "anchor": t_anch,
        "s": v_clone(t_anch),
        "t": v_add(t_anch, d_beta),
        "alpha": v_clone(d_2alpha),
        "beta": v_clone(beta)
      };

      return true;
    }

  }

  // strip on 'top'
  //
  if (Math.max(s_b,t_b) < (b-1)) {

    res = acceptable_st_hampath( anchor, _s, _t, alpha, v_sub(beta, d_2beta) );
    if (res) {
      info["comment"] = "strip.B";


      info["T"] = {
        "anchor": v_clone(anchor),
        "s": v_clone(_s),
        "t": v_clone(_t),
        "alpha": v_clone(alpha),
        "beta": v_sub(beta, d_2beta)
      };

      let t_anch = v_add(anchor, v_sub(beta, d_2beta));

      info["S"] = {
        "anchor": t_anch,
        "s": v_clone(t_anch),
        "t": v_add(t_anch, d_alpha),
        "alpha": v_clone(alpha),
        "beta": v_clone(d_2beta)
      };

      return true;
    }

  }

  // strip on 'bottom'
  //
  if (Math.min(s_b,t_b) > 1) {

    res = acceptable_st_hampath( v_add(anchor, d_2beta), _s, _t, alpha, v_sub(beta, d_2beta) );
    if (res) {
      info["comment"] = "strip.b";

      let p = v_add(anchor, d_beta);
      let q = v_add(anchor, d_alpha, d_beta);

      /*
      let is_swap = false;
      if ( abs_sum_v( v_sub(p,_s) ) != 1 ) {
        let _tmp = p;
        p = q;
        q = _tmp;

        is_swap = true;
      }
      */

      //console.log("## hasStrip: strip.b, p:", p, "q:", q, "(", is_swap, "), _s:", _s, "_t:", _t);

      info["S"] = {
        "anchor": v_clone(anchor),
        //"s": v_add(anchor, d_beta),
        //"t": v_add(anchor, d_alpha, d_beta),
        "s": p,
        "t": q,
        "alpha": v_clone(alpha),
        "beta": v_clone(d_2beta)
      };

      let t_anch = v_add(anchor, d_2beta);

      info["T"] = {
        "anchor": t_anch,
        "s": v_clone(_s),
        "t": v_clone(_t),
        "alpha": v_clone(alpha),
        "beta": v_sub(beta, d_2beta)
      };

      return true;
    }

  }

  return false;
}

function _test_strip() {
  let examples = [
    { "expect": true,  "info": { "size": [5,4], "s":[2,0], "t":[4,3], "path": [] } },
    { "expect": true,  "info": { "size": [5,4], "s":[0,0], "t":[2,3], "path": [] } },

    { "expect": true,  "info": { "size": [4,5], "s":[0,4], "t":[3,2], "path": [] } },
    { "expect": true,  "info": { "size": [4,5], "s":[0,2], "t":[3,0], "path": [] } },

    { "expect": false,  "info": { "size": [4,4], "s":[1,0], "t":[3,3], "path": [] } },
  ];

  for (let i=0; i<examples.length; i++) {
    let example = examples[i];
    let expect = example.expect;
    let info = example.info;

    let anchor = [0,0];

    let alpha = [ info.size[0], 0 ];
    let beta = [ 0, info.size[1] ];

    let strip_info = {};
    let res = hasStrip( anchor, v_add(anchor, info.s), v_add(anchor, info.t), alpha, beta, strip_info);

    console.log("got:", res, "expect:", expect, "...", strip_info);
  }

}


//_test_strip();
//process.exit();

//----
//----
//----

// still needs testing
//
// input:
//
//   anchor - corner point of rectangle
//   _s     - start point (world coordinates)
//   _t     - end point (world coordinates)
//   alpha  - width like vector
//   beta   - height like vector
//   info   - structure for results
//
// output:
//
//   true  - has split
//   false - otherwise
//
// If a split is found, the region information will be available in
// the info stcuture under the 'S','T' keys. Region information holds:
//
// <region>
// {
//   "anchor": [ ... ],
//   "s": [ ... ],
//   "t": [ ... ],
//   "alpha": [ ... ],
//   "beta" : [ ... ]
// }
//
function hasSplit(_anchor, _s, _t, alpha, beta, info) {
  info = ((typeof info === "undefined") ? {} : info);

  let anchor = [0,0];

  let s = v_sub(_s,_anchor);
  let t = v_sub(_t,_anchor);

  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  let d_alpha = v_delta(alpha);
  let d_beta = v_delta(beta);

  let s_a = dot_v(s, d_alpha);
  let s_b = dot_v(s, d_beta);

  let t_a = dot_v(t, d_alpha);
  let t_b = dot_v(t, d_beta);

  let d_2alpha = v_mul(2, d_alpha);
  let d_2beta = v_mul(2, d_beta);

  let res = false;

  let a_dir = sgn(t_a - s_a);
  let b_dir = sgn(t_b - s_b);

  if (a_dir != 0) {

    // u,v local s,t for simplicity

    let flip_st = false;

    let u = v_clone(s);
    let v = v_clone(t);
    if (a_dir < 0) {
      u = v_clone(t);
      v = v_clone(s);
      flip_st = true;
    }

    let u_a = dot_v(u, d_alpha);
    let v_a = dot_v(v, d_alpha);

    for (let idx_a = u_a; idx_a < v_a; idx_a++) {
      for (let idx_b = 0; idx_b < b; idx_b++) {

        let p = v_add( v_mul( idx_a, d_alpha ), v_mul( idx_b, d_beta ) );
        let q = v_add( p, d_alpha);

        let da = v_mul(idx_a+1, d_alpha);

        let p_info = {};
        let q_info = {};

        let validP = acceptable_st_hampath( anchor, u, p, da, beta, p_info);
        let validQ = acceptable_st_hampath( v_add(anchor, da), q, v, v_sub(alpha, da), beta, q_info);

        //console.log("##a.idx_ab:", idx_a, idx_b, "p:", p, "q:", q, "validPQ:", validP, validQ, p_info.message, q_info.message);

        if (validP && validQ) {
          info["comment"] = "split.a";

          if (flip_st) {

            info["T"] = {
              "anchor": v_clone(_anchor),
              "s": v_add(_anchor, p),
              "t": v_add(_anchor, u),
              "alpha": v_clone(da),
              "beta": v_clone(beta)
            };

            info["S"] = {
              "anchor": v_add(_anchor, da),
              "s": v_add(_anchor, v),
              "t": v_add(_anchor, q),
              "alpha": v_sub(alpha, da),
              "beta": v_clone(beta)
            };

          }
          else {

            info["S"] = {
              "anchor": v_clone(_anchor),
              "s": v_add(_anchor, u),
              "t": v_add(_anchor, p),
              "alpha": v_clone(da),
              "beta": v_clone(beta)
            };

            info["T"] = {
              "anchor": v_add(_anchor, da),
              "s": v_add(_anchor, q),
              "t": v_add(_anchor, v),
              "alpha": v_sub(alpha, da),
              "beta": v_clone(beta)
            };

          }

          return true;
        }

      }

    }

  }

  if (b_dir != 0) {

    // u,v local s,t for simplicity

    let flip_st = false;

    let u = v_clone(s);
    let v = v_clone(t);
    if (b_dir < 0) {
      u = v_clone(t);
      v = v_clone(s);
      flip_st = true;
    }

    let u_b = dot_v(u, d_beta);
    let v_b = dot_v(v, d_beta);

    for (let idx_b = u_b; idx_b < v_b; idx_b++) {
      for (let idx_a = 0; idx_a < a; idx_a++) {

        let p = v_add( v_mul( idx_a, d_alpha ), v_mul( idx_b, d_beta ) );
        let q = v_add( p, d_beta);

        //!!!!

        let db = v_mul(idx_b+1, d_beta);

        let validP = acceptable_st_hampath( anchor, u, p, alpha, db);
        let validQ = acceptable_st_hampath( v_add(anchor, db), q, v, alpha, v_sub(beta, db));

        //console.log("##b.idx_ab:", idx_a, idx_b, "p:", p, "q:", q, "validPQ:", validP, validQ);

        if (validP && validQ) {
          info["comment"] = "split.b";

          if (flip_st) {

            info["T"] = {
              "anchor": v_clone(_anchor),
              "s": v_add(_anchor, p),
              "t": v_add(_anchor, u),
              "alpha": v_clone(alpha),
              "beta": v_clone(db)
            };

            info["S"] = {
              "anchor": v_add(_anchor, db),
              "s": v_add(_anchor, v),
              "t": v_add(_anchor, q),
              "alpha": v_clone(alpha),
              "beta": v_sub(beta, db)
            };

          }
          else {

            info["S"] = {
              "anchor": v_clone(_anchor),
              "s": v_add(_anchor, u),
              "t": v_add(_anchor, p),
              "alpha": v_clone(alpha),
              "beta": v_clone(db)
            };

            info["T"] = {
              "anchor": v_add(_anchor, db),
              "s": v_add(_anchor, q),
              "t": v_add(_anchor, v),
              "alpha": v_clone(alpha),
              "beta": v_sub(beta, db)
            };

          }

          return true;
        }

      }

    }


  }

  return res;
}

function _test_split() {
  let examples = [
    { "expect": true,  "info": { "size": [5,4], "s":[0,0], "t":[4,3], "path": [] } },
    { "expect": true,  "info": { "size": [2,5], "s":[0,0], "t":[1,4], "path": [] } },
  ];

  for (let i=0; i<examples.length; i++) {
    let example = examples[i];
    let expect = example.expect;
    let info = example.info;

    let anchor = [0,0];

    let alpha = [ info.size[0], 0 ];
    let beta = [ 0, info.size[1] ];

    let strip_info = {};
    let res = hasSplit( anchor, v_add(anchor, info.s), v_add(anchor, info.t), alpha, beta, strip_info);

    console.log("got:", res, "expect:", expect, "...", strip_info);
  }

}


//_test_split();
//process.exit();


//----

function spotcheck() {
  let anchor = [0,0];
  let s = [0,0];
  let t = [1,0];

  let alpha = [2,0];
  let beta = [0,2];

  let res0 = acceptable_st_hampath(anchor, s, t, alpha, beta);
  let res1 = isPrime(anchor, s, t, alpha, beta);
  console.log(res0, res1);
}

//spotcheck();

//----
//----
//----

// return region
//
function realize_prime_sthampath(anchor, _s, _t, alpha, beta, prime_info) {
  prime_info = ((typeof info === "undefined") ? {} : info);
  prime_info["path"] = [];

  let prime = prime_info["prime"];

  let region = {
    "anchor": v_clone(anchor),
    "s": v_clone(_s),
    "t": v_clone(_t),
    "path": []
  };

  for (let idx=0; idx<prime.path.length; idx++) {
    region.path.push( v_add(anchor, prime.path[idx]) );
  }


  return region;
}

// to join paths:
//
// * we assume a region is returned, with a valid path internal to the region
// * if s and t are in different regions, start at s and go until you reach p,
//   then switch to q-t
// * if s and t are in the same region, start at s, go to p, switch to p' in the other
//   region and go to q', then switch from q' to q and follow to t.
//
function sthampath(anchor, _s, _t, alpha, beta, info) {
  info = ((typeof info === "undefined") ? { "parent": "0" } : info);
  if (!("region" in info)) { info["region"] = []; }

  let verbose_level = -1;

  let s = v_sub(_s,anchor);
  let t = v_sub(_t,anchor);

  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  let d_alpha = v_delta(alpha);
  let d_beta = v_delta(beta);

  let _uid = guuid();

  if (!acceptable_st_hampath(anchor, _s, _t, alpha, beta)) {
    info["comment"] = "ERROR: unacceptable path";
    return false;
  }

  if (VERBOSE > verbose_level) {
    console.log("#", _uid, "(par:", info.parent, ")", "s:", _s, "t:", _t, "anchor:", anchor, "alpha:", alpha, "beta:", beta );
  }

  let pr_info = {},
      strip_info = {},
      split_info = {};

  if ((a == 1) || (b == 1)) {

    if (VERBOSE > verbose_level) {
      console.log("#", _uid, " lin");
    }

    let v_ts = v_sub(_t, _s);
    let dv = v_delta( v_ts );
    let n = abs_sum_v( v_ts ) + 1;
    let _path = [];
    for (let idx=0; idx<n; idx++) {
      _path.push( v_add(_s, v_mul(idx, dv)) );
    }

    info.region = {
      "anchor": v_clone(anchor),
      "s": v_clone(_s),
      "t": v_clone(_t),
      "alpha": v_clone(alpha),
      "beta": v_clone(beta),
      "path": _path
    };

    if (VERBOSE > verbose_level) {
      console.log("#", _uid,"   ab==1 (", a, b, ") s:", _s, "t:", _t, "dv:", dv, "path:", _path);
    }

    return true;
  }


  if (isPrime(anchor, _s, _t, alpha, beta, pr_info)) {

    if (VERBOSE > verbose_level) {
      console.log("#", _uid," prime");
    }

    let pr_path = pr_info.prime.path;
    let _path = [];
    for (let idx=0; idx<pr_path.length; idx++) {
      _path.push( v_add(anchor, pr_path[idx]) );
    }

    info.region = {
      "anchor": v_clone(anchor),
      "s": v_clone(_s),
      "t": v_clone(_t),
      "alpha": v_clone(alpha),
      "beta": v_clone(beta),
      "path": _path
    };

    console.log("##", _uid," primepath:", _path);

    return true;
  }

  if (hasStrip(anchor, _s, _t, alpha, beta, strip_info)) {


    let S = strip_info.S;
    let T = strip_info.T;

    if (VERBOSE > verbose_level) {
      console.log("#", _uid, " strip", strip_info.comment, "S.st:", S.s, S.t, "T.st:", T.s, T.t);
    }

    let infoS = { "parent": _uid },
        infoT = { "parent": _uid };

    //let retS = sthampath( S.anchor, S.s, S.t, S.alpha, S.beta, infoS );
    //if (!retS) {
    //  info["comment"] = "ERROR: " + _uid + " sanity, hasStrip but S invalid";
    //  info.comment += " (S:" + infoS.comment + ")";
    //  return false;
    //}
    //let spath = infoS.region.path;

    let retT = sthampath( T.anchor, T.s, T.t, T.alpha, T.beta, infoT );
    if (!retT) {
      info["comment"] = "ERROR: " + _uid + " sanity, hasStrip but T invalid";
      info.comment += " (T:" + infoT.comment + ")";
      return false;
    }
    let tpath = infoT.region.path;

    //console.log("##", _uid, strip_info.comment, "spath:", spath, "tpath:", tpath);

    let require_splice = true;
    let d_pq = v_sub( S.t, S.s );
    let d_ab = d_alpha;
    if ( Math.abs( dot_v( d_alpha, d_pq ) ) > 0 ) {
      d_ab = d_beta;
    }

    let _path = [];
    for (let t_idx=0; t_idx<tpath.length; t_idx++) {

      if (require_splice) {

        // WIP
        // * need to find a sort of dimension agnostic way to test for edge being
        //   next to the S region
        //
        // * consider edge from realized path for region T
        // * make sure it's parallel to S region
        // * make sure it's next to S region
        let del_ab = dot_v( v_sub( S.s, tpath[t_idx] ), d_ab );
        if ( require_splice &&
             ( t_idx > 0 ) &&
             ( Math.abs( dot_v( v_sub( tpath[t_idx], tpath[t_idx-1] ), d_pq ) ) == 1 ) &&
             ( Math.abs( del_ab ) == 1 ) ) {
             //( Math.abs( dot_v( v_sub( S.s, tpath[t_idx] ), d_ab ) ) == 1 ) ) {

          console.log("## FOUND pq edge, t_idx:{", t_idx-1, t_idx, "}: tpath:", tpath[t_idx-1], tpath[t_idx],
                      "del(tpath[", t_idx, t_idx-1,"]:", v_sub(tpath[t_idx], tpath[t_idx-1]),
                      "d_pq:", d_pq, "d_ab:", d_ab, "del_ab:", del_ab, "S(orig).st:", S.s, S.t); 

          let d_del = v_mul( del_ab, d_ab );
          let S_s = v_add( tpath[t_idx-1], d_del );
          let S_t = v_add( tpath[t_idx],   d_del );

          console.log("###   d_del:", d_del, "S_s:", S_s, "S_t:", S_t);

          let retS = sthampath( S.anchor, S_s, S_t, S.alpha, S.beta, infoS );
          if (!retS) {
            info["comment"] = "ERROR: " + _uid + " sanity, hasStrip but S invalid";
            info.comment += " (S:" + infoS.comment + ")";
            return false;
          }
          let spath = infoS.region.path;
          for (let s_idx=0; s_idx<spath.length; s_idx++) {
            _path.push( [ spath[s_idx][0], spath[s_idx][1] ] );
          }
          require_splice = false;
        }

      }

      let pnt = v_clone( tpath[t_idx] );
      _path.push( pnt );

    }

    info.region = {
      "anchor": v_clone(anchor),
      "s": v_clone(_s),
      "t": v_clone(_t),
      "alpha": v_clone(alpha),
      "beta": v_clone(beta),
      "path": _path
    };

    return true;
  }

  if (hasSplit(anchor, _s, _t, alpha, beta, split_info)) {

    let S = split_info.S;
    let T = split_info.T;

    if (VERBOSE > verbose_level) {
      console.log("#", _uid, " split S.st:", S.s, S.t, "T.st:", T.s, T.t);
    }

    let infoS = { "parent": _uid },
        infoT = { "parent": _uid };

    let retS = sthampath( S.anchor, S.s, S.t, S.alpha, S.beta, infoS );
    let retT = sthampath( T.anchor, T.s, T.t, T.alpha, T.beta, infoT );

    if ((!retS) || (!retT)) {
      info["comment"] = "ERROR: " + _uid + " sanity, hasSplit but S or T invalid (" + retS.toString() + " " + retT.toString() + ")";
      info.comment += " (S:" + infoS.comment + ")";
      info.comment += " (T:" + infoT.comment + ")";
      return false;
    }

    //DEBUG
    //console.log("### split.infoS:", infoS);
    //console.log("### split.infoT:", infoT);

    let spath = infoS.region.path;
    let tpath = infoT.region.path;

    let _path = [];
    for (let idx=0; idx<spath.length; idx++) {
      _path.push( [ spath[idx][0], spath[idx][1] ] );
    }
    for (let idx=0; idx<tpath.length; idx++) {
      _path.push( [ tpath[idx][0], tpath[idx][1] ] );
    }

    info.region = {
      "anchor": v_clone(anchor),
      "s": v_clone(_s),
      "t": v_clone(_t),
      "alpha": v_clone(alpha),
      "beta": v_clone(beta),
      "path": _path
    };

    return true;
  }

  // sanity, we shouldn't be able to get here.
  //

  let debug_info = " (fin: s:" + _s.toString() + " t:" + _t.toString() + " anchor:" + anchor.toString();
  debug_info += " alpha:" + alpha.toString() + " beta:" + beta.toString() + ")";
  info["comment"] = "ERROR: sanity error" + debug_info;
  return false;

}

//
// increment v with carry, subject to v_base
//
// return:
//
//   false  : v all zero
//   true   : otherwise
//
function _vec_incr( v, v_base ) {
  let nz = false;
  let idx = v.length-1;
  let carry = true;
  while (carry && (idx >= 0)) {
    carry = false;
    v[idx]++;
    if (v[idx] >= v_base[idx]) {
      v[idx] %= v_base[idx];
      carry = true;
    }
    if (v[idx] != 0) { nz = true; }
    idx--;
  }
  return nz;
}

function test_suite( w_range, h_range ) {
  let st = [0,0,0,0];

  let Fx = 7,
      Fy = 7;

  let dx = 0,
      dy = 0;

  let wmod = (w_range[1]*(w_range[1]-1)/2) - ((w_range[0]+1)*w_range[0]/2);
  let hmod = (h_range[1]*(h_range[1]-1)/2) - ((h_range[0]+1)*h_range[0]/2);

  wmod = w_range[1]*w_range[1]*w_range[1];
  hmod = h_range[1]*h_range[1]*h_range[1];

  let dxy = [0,0];

  for (let w = w_range[0]; w < w_range[1]; w++) {

    for (let h = h_range[0]; h < h_range[1]; h++) {


      let st = [0,0,0,0];
      let stb = [w,h,w,h];

      do {

        let s = [st[0], st[1]];
        let t = [st[2], st[3]];

        let alpha = [w, 0];
        let beta  = [0, h];

        let info = {};

        let expect = acceptable_st_hampath([0,0], s, t, alpha, beta, info);
        let ret = sthampath([0,0], s, t, alpha, beta, info);

        console.log("## w:", w, "h:", h, "s:", s, "t:", t, "got:", ret, "expect:", expect);

        if (expect != ret) {
          console.log("FAIL!!!");
        }

        if (ret) {
          gnuplot_print_path(info.region.path, [ Fx*dxy[0], Fy*dxy[1] ] );
        }

        _vec_incr(dxy, [wmod, hmod]);
      } while (_vec_incr(st, stb));

    }

  }

  return true;
}



if (typeof module !== "undefined") {

  let func_name_map = {
    "sthampath": sthampath,
    "acceptable_st_hampath": acceptable_st_hampath,
    "isColorCompatible": isColorCompatible,
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }

}

//----
//----
//----

function _show_version(fp) {
  fp = ((typeof fp === "undefined") ? process.stderr : fp);
  fp.write("version: " + STHAMPATH_VERSION + "\n");
}

function _show_help(fp, msg, hide_version) {
  fp = ((typeof fp === "undefined") ? process.stderr : fp);
  msg = ((typeof msg === "undefined") ? "" : msg);
  hide_version = ((typeof hide_version === "undefined") ? false : hide_version);

  if (msg.length > 0) {
    fp.write("\n");
    fp.write(msg + "\n");
  }

  fp.write("\n");
  fp.write("Create a Hamiltonian path on a rectangular 2D grid graph with endpoints s and t.\n");

  if (!hide_version) {
    fp.write("\n");
    _show_version(fp);
  }

  fp.write("\n");
  fp.write("usage:\n");
  fp.write("\n");
  fp.write("  node sthampath.js ...\n");
  fp.write("\n");
  fp.write("  ...\n");
  fp.write("\n");
  fp.write("example:\n");
  fp.write("\n");
  fp.write("  node sthampath.js x y z \n");
  fp.write("\n");
}


// assumes argv is 'unix style', with first argument
// as program (source) file (not, for example 'node').
//
function _main(argv) {

  if (argv.length <= 1) {
    _show_help(process.stderr);
    return -1;
  }

  let op = "";

  if (argv.length > 1) {
    op = argv[1];
  }

  if (op == "help") {
    _show_help(process.stdout);
    return 0;
  }

  else if (op == "version") {
    _show_version(process.stdout);
    return 0;
  }

  else if (op == "test_strip") {
    _test_strip();
  }

  else if (op == "test_split") {
    _test_split();
  }

  else if (op == "test_acceptable") {
    _test_acceptable();
  }

  else if (op == "test_suite") {

    if (argv.length < 4) {
      _show_help(process.stderr, "provide Wrange (#,#), Hrange (#,#)");
      return -1;
    }

    let wrange = argv[2].split(",").map( (_) => parseInt(_) );
    let hrange = argv[3].split(",").map( (_) => parseInt(_) );

    if ((wrange.length == 0) ||
        (hrange.length == 0)) {
      _show_help(process.stderr, "invalid W,H range");
      return -1;
    }

    if (wrange.length == 1) { wrange.push(wrange[0]+1); }
    if (hrange.length == 1) { hrange.push(hrange[0]+1); }

    if (isNaN(wrange[0]) || (wrange[0] == 0) || (wrange[1] <= wrange[0]) ||
        isNaN(hrange[0]) || (hrange[0] == 0) || (hrange[1] <= hrange[0])) {
      _show_help(process.stderr, "invalid W,H range");
      return -1;
    }

    let ret = test_suite(wrange, hrange);

    console.log("got:", ret);

  }

  else if (op == "print_prime") {
    gnuplot_print_hamlib(PRIME_HAMILTONIAN_PATH);
  }

  else if (op == "st") {

    if (argv.length < 6) {
      _show_help(process.stderr, "provide s (<int>,<int>), t (<int>,<int>) width, height");
      return -1;
    }

    let s = argv[2].split(",").map( (_) => parseInt(_) );
    let t = argv[3].split(",").map( (_) => parseInt(_) );
    let width = parseInt(argv[4]);
    let height = parseInt(argv[5]);

    let alpha = [ width, 0 ];
    let beta = [ 0, height ];

    let info = {};

    let ret = sthampath([0,0], s, t, alpha, beta, info);

    console.log("##", ret, (!ret) ? info.comment : "" );

    if (ret) {
      gnuplot_print_path(info.region.path);
    }

    //console.log("#", ret, info);
  }

  else if (op == "split") {

    if (argv.length < 6) {
      _show_help(process.stderr, "provide s (#,#), t (#,#) anchor (#,#) alpha (#,#) beta (#,#)");
      return -1;
    }

    let s = argv[2].split(",").map( (_) => parseInt(_) );
    let t = argv[3].split(",").map( (_) => parseInt(_) );
    let anchor = argv[4].split(",").map( (_) => parseInt(_) );
    let alpha = argv[5].split(",").map( (_) => parseInt(_) );
    let beta = argv[6].split(",").map( (_) => parseInt(_) );

    let split_info = {};

    let ret = hasSplit(anchor, s, t, alpha, beta, split_info);

    console.log("##", ret, (!ret) ? split_info.comment : "" );
    console.log( JSON.stringify(split_info, undefined, 2) );

  }

  else {
    _show_help(process.stderr, "invalid op")
    return -1;
  }

  return 0;
}

if ((typeof require !== "undefined")  &&
    (require.main === module)) {
  let ret = _main(process.argv.slice(1));

  process.exitCode = ret;
}

