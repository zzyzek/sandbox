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

var VERBOSE = 0;

var fasslib = require("./fasslib.js");

// pretty hacky and dangerous...
//
for (let key in fasslib) {
  eval( "var " + key + " = fasslib['" + key + "'];" );
}

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

function v_lift(v, dim) {
  let u = v_clone(v);
  if (u.length == dim) { return u; }
  if (u.length > dim) { return u.slice(0,dim) }
  for (let i=v.length; i<dim; i++) { u.push(0); }
  return u;
}

function norm2_v(_v) {
  let _eps = (1.0 / (1024.0*1024.));
  let v = ((_v.length == 2) ? [_v[0], _v[1], 0] : _v );
  let s = (v[0]*v[0]) + (v[1]*v[1]) + (v[2]*v[2]);
  if (s < _eps) { return 0; }
  return Math.sqrt(s);
}

// euler rotation or olinde rodrigues
// https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
//
// rotate point v0 around vector vr by radian theta
//
function rodrigues(_v0, _vr, theta) {
  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let v0 = v_lift(_v0, 3);
  let v_r = v_mul( 1 / norm2_v(_vr), _vr );

  return v_add(
    v_mul(c, v0),
    v_add(
      v_mul( s, cross3(v_r,v0)),
      v_mul( (1-c) * dot_v(v_r, v0), v_r )
    )
  );
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
        //console.log("# [", idx, "][", i, "]: src_pnt:", src_pnt, "src_mid:", src_mid, "dst_mid:", dst_mid, "==>", dst_pnt, ipnt);

        dst_path.push( ipnt );
      }

      let _key = dst_path.map( (_t) => "(" + _t[0].toString() + "," + _t[1].toString() + ")" ).join("");
      if (!(_key in seen_keys)) {

        let n = dst_path.length;
        let info_rot = {
          "size": [size[0], size[1]],
          "s": [ dst_path[0][0], dst_path[0][1] ],
          "t": [ dst_path[n-1][0], dst_path[n-1][1] ],
          "path": dst_path
        };
        prime_hamiltonian_path_library.push(info_rot);

        seen_keys[_key] = 1;

        //let _b = getBounds(dst_path);
        //console.log("# adding rot, size:", size, "b:", _b, "rot:", rot_idx, "key:", _key);
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

        //let _b = getBounds(dst_path);
        //console.log("# adding flipx key:", size, _b, _key);
      }

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

        //let _b = getBounds(dst_path);
        //console.log("# adding flipy key:", size, _b, _key);
      }

      // rotate size components
      //
      size = [ size[1], size[0] ];

    }

  }

  //console.log("#tot:", prime_hamiltonian_path_library.length);

  return prime_hamiltonian_path_library;
}


let P = PRIME_HAMILTONIAN_PATH_TEMPLATE;
let prime_hamlib = enum_prime_hamiltonian_template(P);

function gnuplot_print(prime_hamlib) {

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

  if (VERBOSE > 0) {
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

function _cmp_v(a,b) {
  let n = ( (a.length < b.length) ? b.length : a.length );
  for (let i=0; i<n; i++) {
    if (a[i] < b[i]) { return -1; }
    if (a[i] > b[i]) { return  1; }
  }
  return 0;
}

function _cmp_v_d(a,b,d_alpha, d_beta, d_gamma) {
  d_alpha = ((typeof d_alpha == "undefined") ? [1,0,0] : d_alpha);
  d_beta = ((typeof d_beta == "undefined") ? [0,1,0] : d_beta);
  d_gamma = ((typeof d_gamma == "undefined") ? [0,0,1] : d_gamma);
  let n = ( (a.length < b.length) ? b.length : a.length );

  let d_abg = [ d_alpha, d_beta, d_gamma ];

  for (let i=0; i<n; i++) {
    let a_val = dot_v(a, d_abg[i]);
    let b_val = dot_v(b, d_abg[i]);

    if (a_val < b_val) { return -1; }
    if (a_val > b_val) { return  1; }
  }

  return 0;
}

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
//  true  - rectangle is admissilbe (has a Hamiltonian path)
//  false - otherwise
//
// The idea is that alpha and beta can flip and point in other axis
// aligned directions.
//
function acceptable_st_hampath(anchor, _u,_v, _alpha, _beta, info) {
  info = ((typeof info === "undefined") ? {} : info);

  info["message"] = "";

  if (!isColorCompatible(anchor, _u, _v, _alpha, _beta)) {

    info["message"] = "inacceptable: color incompatible";

    return false;
  }

  let anchor_parity = abs_sum_v(anchor)%2;

  let alpha = _alpha;
  let beta = _beta;

  let u = _u;
  let v = _v;

  let a = abs_sum_v(alpha);
  let b = abs_sum_v(beta);

  // make alpha longer axis
  //
  if (a < b) {
    alpha = _beta;
    beta = _alpha;

    let t = b;
    b = a;
    a = t;
  }

  let d_alpha = v_delta(alpha);
  let d_beta = v_delta(beta);



  // force u to be lex smaller than v
  //
  if (_cmp_v_d(u,v, d_alpha, d_beta) > 0) {
    u = _v;
    v = _u;
  }

  let u_l1 = abs_sum_v(u);
  let v_l1 = abs_sum_v(v);

  let a0 = a%2;
  let b0 = b%2;

  let u0 = u_l1%2;
  let v0 = v_l1%2;

  if (VERBOSE > 0) {
    console.log("#acceptable_st_hampath:", "alpha:", alpha, "(", d_alpha, ")", "beta:", beta, "(", d_beta, ")", "u:", u, "v:", v);
  }

  // line:
  // only valid possibility is if start and endpoints
  // are at either end
  //
  if (a == 1) {
    if ((u_l1 == 0) && (v_l1 == (a-1))) { return true; }

    info["message"] = "inacceptable: line with u,v not on endpoints";

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

    let tv = v_add(u, d_beta);

    if (_cmp_v(tv, v) != 0) { return true; }

    let u_alpha = dot_v( v_sub(u, anchor), d_alpha );


    //if ((u[0] == 0) || (u[0] == (a-1))) { return true; }
    if ((u_alpha == 0) || (u_alpha == (a-1))) { return true; }

    info["message"] = "inacceptable: Nx2, u,v edge partitions graph";

    return false;
  }

  // cul-de-sac
  // if:
  //   * a = 3
  //   * a*b even
  //   * u,v different colors and u different color than lower left corner
  //     (upper left corner color the same since a=3)
  //   * (u.x < (v.x-1)) or ((u.y==1) && (u.x < v.x))
  // -> inacceptable
  //
  if (b == 3) {

    if ((a0*b0) == 1) { return true; }
    if (u0 == v0) { return true; }
    if (u0 == 0) { return true; }

    let u_a = dot_v(u, d_alpha);
    let u_b = dot_v(u, d_beta);

    let v_a = dot_v(v, d_alpha);
    let v_b = dot_v(v, d_beta);

    if ( (u_a < (v_a-1)) || ((Math.abs(u_b) == 1) && (u_a < v_a)) ) {

      info["message"] = "inacceptable: Nx3, u,v endpoints create cul-de-sac";

      return false;
    }

    return true;
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

    // Nx2

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

    let ret = acceptable_st_hampath([0,0], info.s, info.t, alpha, beta, err_info);

    if (ret != expect) {
      console.log("[", idx, "]: ERROR:", err_info.message, "expected:", expect, "got:", ret, ":", JSON.stringify(info), );
    }
    else {
      console.log("[" , idx, "]: pass");
    }

    //console.log("\n");
  }
}

_test_acceptable();

//for (let i=0; i<prime_hamlib.length; i++) {
//  console.log(i, verifyHampath(prime_hamlib[i].path) );
//}
