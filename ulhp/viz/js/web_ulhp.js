(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ulhp = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var FASSLIB_VERSION = "0.2.0";
var FASSLIB_VERBOSE = 0;

// round to zero version
//
function d2e(_v) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let v2 = Math.floor(v/2);
  if (v==0) { return 0; }
  if ((v2%2)==0) { return m*v2; }
  return m*(v2+1);
}

// round to zero version
//
function d2u(_v) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let v2 = Math.floor(v/2);
  if (v==0) { return 0; }
  if ((v2%2)==1) { return m*v2; }
  return m*(v2+1);
}

// round to zero version
//
function dqe(_v,q) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let vq = Math.floor(v/q);
  if ((vq%2)==0) { return m*vq; }
  return m*(vq+1);
}


// round to zero
// divide by q, force odd
//
function dqu(_v,q) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let vq = Math.floor(v/q);
  if (v==0) { return 0; }
  if ((vq%2)==1) { return m*vq; }
  return m*(vq+1);
}

// round to zero version
//
function v_divq(v,q) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    let _v = Math.abs(v[i]);
    let m = ((v[i]<0) ? -1 : 1);
    u.push( m*Math.floor(_v / q) );
  }
  return u;
}

function v_div2(v) { return v_divq(v,2); }

function _sgn(v) {
  if (v>0) { return  1; }
  if (v<0) { return -1; }
  return 0;
}

function v_neg(v) {
  if (v.length==2) { return [-v[0], -v[1]]; }
  return [ -v[0], -v[1], -v[2] ];
}

function v_add() {
  if (arguments.length == 0) { return []; }
  let u = v_clone(arguments[0]);

  for (let i=1; i<arguments.length; i++) {
    let v = arguments[i];
    let m = Math.min( u.length, v.length );
    for (let j=0; j<m; j++) { u[j] += v[j]; }
  }

  return u;
}


function v_sub() {
  if (arguments.length == 0) { return []; }
  let u = v_clone(arguments[0]);

  for (let i=1; i<arguments.length; i++) {
    let v = arguments[i];
    let m = Math.min( u.length, v.length );
    for (let j=0; j<m; j++) { u[j] -= v[j]; }
  }

  return u;
}


function v_mul(c,v) {
  if (v.length == 2) {
    return [ c*v[0], c*v[1] ];
  }
  return [ c*v[0], c*v[1], c*v[2] ];
}

function dot_v(u,v) {
  if ((u.length == 2) || (v.length == 2)) {
    return  (u[0]*v[0]) + (u[1]*v[1]);
  }
  return (u[0]*v[0]) + (u[1]*v[1]) + (u[2]*v[2]);
}

function abs_sum_v(v) {
  let s = 0;
  for (let i=0; i<v.length; i++) {
    s += Math.abs(v[i]);
  }
  return s;
}

function v_delta(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push( _sgn(v[i]) );
  }
  return u;
}

function v_print(v) {
  if (v.length == 2)  { console.log(v[0], v[1]); }
  else                { console.log(v[0], v[1], v[2]); }
}

function v_clone(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push(v[i]);
  }
  return u;
}

// Test to see if q is within bounds of volume
// whose corner is at p and volume defined by a,b,g
//
// If volume coordinate is positive, the corresponding p
// coordinate is taken to be lower bound.
// Otherwise, if the volume coordinate is negative,
// corresponding p coordinate is taken to be the
// upper bound.
//
// Works in 2 and 3 dimensions.
// Assumes q,p,a,b,g are all simple arrays (of length 2 or 3)
//
// q - query point
// p - corner point
// a - width like dimension
// b - height like dimension
// g - depth like dimension
//
function _inBounds(q, p, a, b, g) {
  let _a = [0,0,0],
      _b = [0,0,0],
      _g = [0,0,0];

  let _p = [0,0,0],
      _q = [0,0,0];

  _a[0] = a[0];
  _a[1] = a[1];
  _a[2] = ((a.length > 2) ? a[2] : 0);

  _b[0] = b[0];
  _b[1] = b[1];
  _b[2] = ((b.length > 2) ? b[2] : 0);

  _q[0] = q[0];
  _q[1] = q[1];
  _q[2] = ((q.length > 2) ? q[2] : 0);

  _p[0] = p[0];
  _p[1] = p[1];
  _p[2] = ((p.length > 2) ? p[2] : 0);

  if (typeof g === "undefined") {
    if      ((_a[0] == 0) && (_b[0] == 0)) { _g[0] = 1; }
    else if ((_a[1] == 0) && (_b[1] == 0)) { _g[1] = 1; }
    else if ((_a[2] == 0) && (_b[2] == 0)) { _g[2] = 1; }
  }
  else { _g = g; }

  let _d = [
    _a[0] + _b[0] + _g[0],
    _a[1] + _b[1] + _g[1],
    _a[2] + _b[2] + _g[2]
  ];

  for (let xyz=0; xyz<3; xyz++) {
    if ( _d[xyz] < 0 ) {
      if ((q[xyz] >  p[xyz]) ||
          (q[xyz] <= (p[xyz] + _d[xyz]))) { return false; }
    }
    else {
      if ((q[xyz] <  p[xyz]) ||
          (q[xyz] >= (p[xyz] + _d[xyz]))) { return false; }
    }
  }

  return true;

}

function cross3(p,q) {
  let c0 = ((p[1]*q[2]) - (p[2]*q[1])),
      c1 = ((p[2]*q[0]) - (p[0]*q[2])),
      c2 = ((p[0]*q[1]) - (p[1]*q[0]));

  return [c0,c1,c2];
}

// compare vectors a,b
//
// return:
//
//   -1 : a lex < b
//    1 : a lex > b
//    0 : a == b
//
function _cmp_v(a,b) {
  let n = ( (a.length < b.length) ? b.length : a.length );
  for (let i=0; i<n; i++) {
    if (a[i] < b[i]) { return -1; }
    if (a[i] > b[i]) { return  1; }
  }
  return 0;
}

// compare vectors a,b using direction axis d_alpha, d_beta, d_gamma
//
// lexigraphical ordering, ordered by the delta alpha, beta and gamma
// vectors.
//
// -1 : a lex < b
//  1 : a lex > b
//  0 : a == b
//
function _cmp_v_d(u,v, d_alpha, d_beta, d_gamma) {
  d_alpha = ((typeof d_alpha == "undefined") ? [1,0,0] : d_alpha);
  d_beta  = ((typeof d_beta  == "undefined") ? [0,1,0] : d_beta);
  d_gamma = ((typeof d_gamma == "undefined") ? [0,0,1] : d_gamma);
  let n = ( (u.length < v.length) ? v.length : u.length );

  let d_abg = [ d_alpha, d_beta, d_gamma ];

  for (let i=0; i<n; i++) {
    let u_val = dot_v(u, d_abg[i]);
    let v_val = dot_v(v, d_abg[i]);

    if (u_val < v_val) { return -1; }
    if (u_val > v_val) { return  1; }
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



if (typeof module !== "undefined") {

  let func_name_map = {
    "d2e": d2e,
    "d2u": d2u,
    "dqe": dqe,
    "dqu": dqu,
    "v_divq": v_divq,
    "v_div2": v_div2,
    "sgn": _sgn,
    "v_neg": v_neg,
    "v_add": v_add,
    "v_add": v_add,
    "v_sub": v_sub,
    "v_sub": v_sub,
    "v_mul": v_mul,
    "dot_v": dot_v,
    "abs_sum_v": abs_sum_v,
    "v_delta": v_delta,
    "v_print": v_print,
    "v_clone": v_clone,
    "inBounds": _inBounds,
    "cross3": cross3,
    "cmp_v" : _cmp_v,
    "cmp_v_d" : _cmp_v_d,
    "v_lift" : v_lift,
    "norm2_v" : norm2_v,
		"rodrigues": rodrigues
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }
}


},{}],2:[function(require,module,exports){
/*
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Prabod Rathnayaka.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

'use strict'

function bfs(rGraph, s, t, parent) {
  var visited = [];
  var queue = [];
  var V = rGraph.length;
  // Create a visited array and mark all vertices as not visited
  for (var i = 0; i < V; i++) {
    visited[i] = false;
  }
  // Create a queue, enqueue source vertex and mark source vertex as visited
  queue.push(s);
  visited[s] = true;
  parent[s] = -1;

  while (queue.length != 0) {
    var u = queue.shift();
    for (var v = 0; v < V; v++) {
      if (visited[v] == false && rGraph[u][v] > 0) {
        queue.push(v);
        parent[v] = u;
        visited[v] = true;
      }
    }
  }
  //If we reached sink in BFS starting from source, then return true, else false
  return (visited[t] == true);
}

module.exports = function fordFulkerson(graph, s, t, resGraph, flowGraph) {
  if (typeof resGraph === "undefined") { resGraph = []; }
  resGraph.length = 0;

  /* Create a residual graph and fill the residual graph
   with given capacities in the original graph as
   residual capacities in residual graph

   Residual graph where rGraph[i][j] indicates
   residual capacity of edge from i to j (if there
   is an edge. If rGraph[i][j] is 0, then there is
   not)
  */
  if (s < 0 || t < 0 || s > graph.length-1 || t > graph.length-1){
    throw new Error("Ford-Fulkerson-Maximum-Flow :: invalid sink or source");
  }
  if(graph.length === 0){
    throw new Error("Ford-Fulkerson-Maximum-Flow :: invalid graph");
  }

  //var rGraph = [];

  for (var u = 0; u < graph.length; u++) {
    var temp = [];
    if(graph[u].length !== graph.length){
      throw new Error("Ford-Fulkerson-Maximum-Flow :: invalid graph. graph needs to be NxN");
    }
    for (v = 0; v < graph.length; v++) {
      temp.push(graph[u][v]);
    }
    resGraph.push(temp);
  }
  var parent = [];
  var maxFlow = 0;

  while (bfs(resGraph, s, t, parent)) {
    var pathFlow = Number.MAX_VALUE;
    for (var v = t; v != s; v = parent[v]) {
      u = parent[v];
      pathFlow = Math.min(pathFlow, resGraph[u][v]);
    }
    for (v = t; v != s; v = parent[v]) {
      u = parent[v];
      resGraph[u][v] -= pathFlow;
      resGraph[v][u] += pathFlow;
    }


    maxFlow += pathFlow;
  }

  if (typeof flowGraph !== "undefined") {
    flowGraph.length = 0;

    for (let i=0; i<graph.length; i++) {
      flowGraph.push([]);
      for (let j=0; j<graph.length; j++) {
        let eflow = 0;
        if (graph[i][j] > 0) {
          eflow = graph[i][j] - resGraph[i][j];
        }
        flowGraph[i].push(eflow);
      }
    }
  }

  // Return the overall flow
  return maxFlow;
}

},{}],3:[function(require,module,exports){
(function (process){(function (){
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// An attempt at (a Javascript) implementation of Umans and Lenhart's 1996
// polynomial time algorithm to find Hamiltonian cycles in 2d solid grid graphs.
//
// We'll see how complicated the algorithm gets but I suspect it's not so bad.
// Proofs of correctness are a different matter, thought.
//
// See:
//
// "An Algorithm for Finding Hamiltonian Cycles in Grid Graphs Without Holes" by Christopeher M. Umans (1996)
// https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=bcc9203a455e521dc9f592805f36346ed336f3f0
//
// "Hamiltonian cycles in solid grid graphs" by Christopher Umans and William Lenhart (1997)
// https://authors.library.caltech.edu/records/ayywg-bkr43
//
// Note that there's prior work by Bridgeman, Everett and Briggs but none of them are available online.
//
// My current understanding of the algorithm is as follows:
//
// * initially construct a 2-factor (add widgets and do perfect edge matching)
// * while (an odd alternating strip exists):
//   - find all simple and chained alternating strips, recording their length
//   - find alternating strips, $b$, whose start is on the shortest path from the adjecent end cells
//     in $G ^ { - } _ { F }$ of some other alternating strip, $a$, recording the $a$ to $b$ link
//   - flip the static alternating strip implied by the linking step above, weighting paths by alternating strip
//     length and giving weight 0 to $a \to b$ links
// * if giant component exists, Hamiltonian cycle found, otherwise, no Hamiltonian cycle exists
//   
// I suspect this presentation is more complicated than needed, but I'm still wading through it.
//
// The idea is that the alternating strip flip is the fundamental operation to try and make progress towards
// connecting disparite loops in the 2-factor to create a larger loop and, ultimately, a giant loop representing
// the Hamiltonian cycle.
//
// "Odd" alternating strip flips always connect two components whereas "even" alternating strips leave the component
// count unchanged.
// So the goal is to find the odd alternating strips to flip.
// The problem is that to get to an odd alternating strip, we might need to make a series of even alternating strip flips.
// The problem is further compounded in that if we make a bad schedule choice of even alternating strip flips, we might
// be making an exponential number of even strip flips.
//
// So the algorithm is essentially trying to find a "static" alternating strip sequence that doesn't extraneously flip
// alternating strips enough to provide polynomial time execution.
// The alternating strip sequence flips should end in an odd alternating strip flip to make progress in reducing the 2-factor
// copmonent count (goal is to create a single component 2-factor, aka a Hamiltonian cycle) but if we get into a situation
// where we have multiple components but only even alternating strips, this means a Hamiltonina cycle is not possilble and
// we can bail out.
//
// Some things I'm still confused about:
//
// * why the shortest path in $G ^ { - } _ F$ from endpoints in the alternating strip (why not any path? what happens if we
//   do exiestence rather than shortest?)
//   - This might be because you only want a single strip in the path (taken care of by shortest path requirement)
//     and shortest path is sufficient to ensure progress
// * all the proofs of correctness about what's present, why, and how it leads to correctness
//
// ---
//
// I'm going to try and implement the algorithm as it stands but some things to consider:
//
// * A simple alterteration to the initial widget addition will allow for a 2-factor creation with a path component
// * The even and odd alternating strip sequences are the fundamental unit of operation and I suspect the copmlexity
//   comes from using only them. Creating other units of operation, either replacing these or extending the library,
//   might lead to more intuitive proofs.
//


// We'll try it this way...
// grid is a one dimensinoal array that we reference appropriately
//   maybe grid has numeric value to determine which neighbors it has?
// Gm, Gp dual graphs
//
//


var fasslib = require("./fasslib.js");
var FF = require("./ff_prabod.js");
var fs = require("fs");

var g_info = {
  "size" : [0,0],
  "grid": [],
  "Gm": [],
  "Gp": []
};

var v_add = fasslib.v_add;
var v_sub = fasslib.v_sub;
var abs_sum_v = fasslib.abs_sum_v;

function debugPrint(grid_info) {
  let size = grid_info.size;
  let grid = grid_info.grid;

  let line = [];

  console.log("#grid (bitmask)");
  for (let y=(size[1]-1); y>=0; y--) {
    line = [];
    for (let x=0; x<size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      line.push( (grid[idx] == 0) ? ' ' : '.' );
    }
    console.log(line.join(""));
  }

  console.log("");
}

function printGrid(grid_info) {
  let size = grid_info.size;
  let grid = grid_info.grid;

  let line = [];

  for (let y=0; y<size[1]; y++) {
    let line = [];
    for (let x=0; x<size[0]; x++) {
      let p = x + (size[0]*y);
      line.push( (grid[p] == 0) ? ' ' : '.' );
    }
    console.log(line.join(""));
  }
}

function dxy2idir(p,q) {
  let dxy = v_sub(q,p);

  let s = abs_sum_v(dxy);
  if (s != 1) { return -1; }

  if (dxy[0] ==  1) { return 0; }
  if (dxy[0] == -1) { return 1; }
  if (dxy[1] ==  1) { return 2; }
  if (dxy[1] == -1) { return 3; }

  return -1;
}

function idx2xy(idx, size) {
  return [ (idx % size[0]), Math.floor(idx / size[0]) ];
}

function xy2idx(p, size) {
  if ((p[0] < 0) || (p[0] >= size[0]) ||
      (p[1] < 0) || (p[1] >= size[1])) {
    return -1;
  }
  return p[0] + p[1]*size[0];
}

function inBounds(p, B) {
  if ((p[0] < B[0][0])) { return false; }
  if ((p[1] < B[0][1])) { return false; }
  if ((p[0] >= B[1][0])) { return false; }
  if ((p[1] >= B[1][1])) { return false; }
  return true;
}

function raise_island(grid_info, p) {
  let g = grid_info.grid;
  let size = grid_info.size;

  let n = size[0]*size[1];

  let flood_g = [];
  for (let i=0; i<n; i++) {
    flood_g.push( g[i] );
  }

  let bounds = [[0,0], [size[0], size[1]]];

  let idx = (p[1]*size[0]) + p[0];

  flood_g[idx] = -1;

  let stack = [
    [ p[0] + 1, p[1] ],
    [ p[0] - 1, p[1] ],
    [ p[0], p[1] + 1 ],
    [ p[0], p[1] - 1 ]
  ];

  while (stack.length > 0) {

    let cur_p = stack.pop();
    if (!inBounds( cur_p, bounds )) { continue; }

    let idx = xy2idx(cur_p, size);
    if (flood_g[idx] != 0) { continue; }

    flood_g[idx] = -1;
    
    stack.push( [ cur_p[0] + 1, cur_p[1] ] );
    stack.push( [ cur_p[0] - 1, cur_p[1] ] );
    stack.push( [ cur_p[0], cur_p[1] + 1 ] );
    stack.push( [ cur_p[0], cur_p[1] - 1 ] );
  }

  for (let i=0; i<n; i++) {
    if (flood_g[i] == 0) { g[i] = 2; }
  }

}

// dilate each point with a 3x3 window
//
function cleanup_heuristic(grid_info) {
  let grid = grid_info.grid;
  let size = grid_info.size;

  let B = [[0,0], [size[0], size[1]]];

  let stack = [];

  let idir_dxy = [
    [ 1, 0 ], [ -1,  0 ],
    [ 0, 1 ], [  0, -1 ]
  ];

  let win_dxy = [
    [-1, -1], [0, -1], [1,-1],
    [-1, 0], [0, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];

  for (let y=0; y<size[1]; y++) {
    for (let x=0; x<size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      if (grid[idx] != 0) { stack.push([x,y]); }
    }
  }

  for (let i=0; i<stack.length; i++) {
    for (let idir=0; idir<win_dxy.length; idir++) {
      let nei_p = v_add( stack[i], win_dxy[idir] );
      if (!inBounds(nei_p, B)) { continue; }

      let idx = xy2idx(nei_p, size);
      grid[idx] = 2;
    }

  }

}

// add in points randomely with probability p_t
// restricted to bounding box B
//
function random_grid(sz, p_t, B) {
  p_t = ((typeof p_t === "undefined") ? 0.5 : p_t );
  B = ((typeof B === "undefined") ? [[0,0], [sz[0], sz[1]]] : B );
  let g = [];
  let n = sz[0]*sz[1];
  for (let i=0; i<n; i++) {
    let p = Math.random();

    let y = Math.floor( i / sz[0] );
    let x = (i % sz[0]);

    if ( (x < B[0][0]) || (y < B[0][1]) ||
         (x >= B[1][0]) || (y >= B[1][1]) ) {
      g.push(0);
      continue;
    }

    if (p < p_t) { g.push(1); }
    else { g.push(0); }
  }

  return g;
}

function random_dilated_solid_grid_graph(sz) {
  let g = [];
  let n = sz[0]*sz[1];
  for (let i=0; i<n; i++) {
    g.push(0);
  }

}

function two_factor_gadget(grid_info) {
  let grid = grid_info.grid;
  let size = grid_info.size;

  let B = [[0,0], [size[0], size[1]]];

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let oppo_idir = [ 1,0, 3,2 ];

  let vtx_map = {};
  let E = [];

  let v_idx = 0;

  let source_v = [],
      sink_v = [];

  let vtx_L = {},
      vtx_R = {};


  // The flow network goes from left (source) to right (sink).
  // The implied graph is bipartite.
  // Convention is that grid parity ( (x+y)%2 ):
  //
  // 0 - internal gadget vertices connect to source (L)
  //     external gadget vertices connect to sink (R)
  // 1 - internal gadget vertices connect to sink (R)
  //     external gadget vertices connect to source (L)
  //
  for (let y=0; y<size[1]; y++) {
    for (let x=0; x<size[0]; x++) {

      let p = [x,y];

      let cur_idx = xy2idx(p, size);
      if (grid[cur_idx] == 0) { continue; }

      let grid_parity = (x + y) % 2;
      let local_v = [];
      for (let idir=0; idir<idir_dxy.length; idir++) {

        let nei_p = v_add(p, idir_dxy[idir]);
        if (!inBounds(nei_p, B)) { continue; }

        let nei_idx = xy2idx(nei_p, size);
        if (grid[nei_idx] != 0) {
          local_v.push( x.toString() + "_" + y.toString() + "." + idir.toString() );
        }

      }

      let base_v_idx = v_idx;

      // what I'm calling external gadget vertices
      //
      for (let i=0; i < local_v.length; i++) {
        E.push([]);
        vtx_map[ local_v[i] ] = v_idx;

        if (grid_parity)  {
          source_v.push( v_idx );
          vtx_L[ local_v[i] ] = v_idx;
        }
        else {
          sink_v.push( v_idx );
          vtx_R[ local_v[i] ] = v_idx;
        }

        v_idx++;
      }

      // what I'm calling internal gadget vertices
      //
      let vtx_a_name = x.toString() + "_" + y.toString() + ".a";
      let vtx_b_name = x.toString() + "_" + y.toString() + ".b";

      E.push([]);
      let vtx_a_idx = v_idx; v_idx++;

      E.push([]);
      let vtx_b_idx = v_idx; v_idx++;

      if (grid_parity == 0)  {
        source_v.push( vtx_a_idx );
        source_v.push( vtx_b_idx );
        vtx_L[ vtx_a_name ] = vtx_a_idx;
        vtx_L[ vtx_b_name ] = vtx_b_idx;
      }
      else {
        sink_v.push( vtx_a_idx );
        sink_v.push( vtx_b_idx );
        vtx_R[ vtx_a_name ] = vtx_a_idx;
        vtx_R[ vtx_b_name ] = vtx_b_idx;
      }

      vtx_map[vtx_a_name] = vtx_a_idx;
      vtx_map[vtx_b_name] = vtx_b_idx;

      // connect internal to external
      // grid parity:
      //
      // 0 : internal -> external
      // 1 : external -> internal
      //
      for (let i=0; i < local_v.length; i++) {
        let t_idx = base_v_idx + i;

        if (grid_parity) {
          E[t_idx].push(vtx_a_idx);
          E[t_idx].push(vtx_b_idx);
        }
        else {
          E[vtx_a_idx].push(t_idx);
          E[vtx_b_idx].push(t_idx);
        }

      }

    }
  }

  // connect external vertices to each other
  //
  for (let y=0; y<size[1]; y++) {
    for (let x=0; x<size[0]; x++) {


      let p = [x,y];
      let cur_idx = xy2idx(p, size);
      if (grid[cur_idx] == 0) { continue; }

      // who choose direction on parity
      // so we only consider half of the external vertices
      //
      let src_grid_parity = (x+y)%2;
      if (src_grid_parity) { continue; }


      for (let idir=0; idir<idir_dxy.length; idir++) {
        let nei_p = v_add(p, idir_dxy[idir]);
        if (!inBounds(nei_p, B)) { continue; }

        let nei_idx = xy2idx(nei_p, size);
        if (grid[nei_idx] != 0) {

          let rdir = oppo_idir[idir];

          let src_key = x.toString() + "_" + y.toString() + "." + idir.toString();
          let dst_key = nei_p[0].toString() + "_" + nei_p[1].toString() + "." + rdir.toString();

          let src_v_idx = vtx_map[src_key];
          let dst_v_idx = vtx_map[dst_key];

          if (src_grid_parity) {
            E[src_v_idx].push(dst_v_idx);
          }
          else {
            E[dst_v_idx].push(src_v_idx);
          }
        }
      }

    }
  }

  let connect_source_sink = 1;

  if (connect_source_sink) {

    let src_v_idx = v_idx; v_idx++;
    let snk_v_idx = v_idx; v_idx++;

    vtx_map["source"] = src_v_idx;
    vtx_map["sink"]   = snk_v_idx;

    E.push([]);
    E.push([]);
    for (let i=0; i<source_v.length; i++) {
      E[src_v_idx].push( source_v[i] );
    }

    for (let i=0; i<sink_v.length; i++) {
      E[ sink_v[i] ].push( snk_v_idx );
    }

  }

  let V = [];
  for (let v=0; v<v_idx; v++) { V.push( "" ); }
  for (let key in vtx_map) {
    let v = vtx_map[key];
    V[v] = key;
  }

  return { "G": vtx_map, "E": E, "V": V };
}

function gadget2dot(gadget_info) {
  let G = gadget_info.G;
  let E = gadget_info.E;

  let v_name_map = {};
  for (let key in G) {
    v_name_map[ G[key] ] = key;
  }

  console.log("digraph G {");
  for (let i=0; i<E.length; i++) {
    for (let j=0; j<E[i].length; j++) {
      console.log( "  ", '"' + v_name_map[i] + '"', "->", '"' + v_name_map[ E[i][j] ] + '"', ";");
    }
  }
  
  console.log("}");
}

function gadget_print(gadget_info) {
  let G = gadget_info.G;
  let E = gadget_info.E;

  let v_name_map = {};
  for (let key in G) {
    v_name_map[ G[key] ] = key;
  }

  for (let i=0; i<E.length; i++) {
    for (let j=0; j<E[i].length; j++) {
      let v = E[i][j];
      console.log("[", i, "->", v, "]:", v_name_map[i], "->", v_name_map[ v ]);
    }
  }
}


function _t0() {
  g_info.size = [3,3];
  g_info.grid = [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1
  ];

  g_info.size = [4,4];
  g_info.grid = [
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1
  ];

  let gadget_info = two_factor_gadget(g_info);

  let n = gadget_info.E.length;

  let ffE = [];
  for (let i=0; i<n; i++) {
    ffE.push([]);
    for (let j=0; j<n; j++) {
      ffE[i].push(0);
    }
  }

  for (let i=0; i<gadget_info.E.length; i++) {
    for (let j=0; j<gadget_info.E[i].length; j++) {
      ffE[i][ gadget_info.E[i][j] ] = 1;
    }
  }


  //console.log(gadget_info);
  //gadget2dot(gadget_info);
  //process.exit();

  let resG = [], flowG = [];
  let flow = FF(ffE, ffE.length-2, ffE.length-1, resG, flowG);



  //console.log(flow);
  //console.log(resG);


  let gi = gadget_info;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  for (let i=0; i<flowG.length; i++) {
    for (let j=0; j<flowG[i].length; j++) {

      if (flowG[i][j] > 0) {

        let u_name = gi.V[i];
        let v_name = gi.V[j];

        if ((u_name == "source") || (u_name == "sink") ||
            (v_name == "source") || (v_name == "sink")) { continue; }

        let u_op = u_name.split(".")[1];
        let v_op = v_name.split(".")[1];

        let u_x = parseInt( u_name.split(".")[0].split("_")[0] );
        let u_y = parseInt( u_name.split(".")[0].split("_")[1] );

        let v_x = parseInt( v_name.split(".")[0].split("_")[0] );
        let v_y = parseInt( v_name.split(".")[0].split("_")[1] );

        if ((u_op == 'a') || (u_op == 'b')) {
          let idir = parseInt(v_op);
          console.log(u_x, u_y);
          console.log(u_x + idir_dxy[idir][0], u_y + idir_dxy[idir][1]);
          console.log("");
        }

        else if ((v_op == 'a') || (v_op == 'b')) {
          let idir = parseInt(u_op);
          console.log(v_x, v_y);
          console.log(v_x + idir_dxy[idir][0], v_y + idir_dxy[idir][1]);
          console.log("");
        }

      }

    }
  }

  process.exit();

  for (let i=0; i<resG.length; i++) {
    for (let j=0; j<resG[i].length; j++) {

      //if (resG[i][j] > 0) { console.log( gi.V[i], "-(", resG[i][j], ")->", gi.V[j] ); }

      if (ffE[i][j] > 0)  {
        let flow_edge = ffE[i][j] - resG[i][j];
        if (flow_edge > 0) {
          //console.log(gi.V[i], "-(", flow_edge, ")->", gi.V[j]);

          let u_name = gi.V[i];
          let v_name = gi.V[j];

          if ((u_name == "source") || (u_name == "sink") ||
              (v_name == "source") || (v_name == "sink")) { continue; }

          let u_op = u_name.split(".")[1];
          let v_op = v_name.split(".")[1];

          let u_x = parseInt( u_name.split(".")[0].split("_")[0] );
          let u_y = parseInt( u_name.split(".")[0].split("_")[1] );

          let v_x = parseInt( v_name.split(".")[0].split("_")[0] );
          let v_y = parseInt( v_name.split(".")[0].split("_")[1] );

          if ((u_op == 'a') || (u_op == 'b')) {
            let idir = parseInt(v_op);
            console.log(u_x, u_y);
            console.log(u_x + idir_dxy[idir][0], u_y + idir_dxy[idir][1]);
            console.log("");
          }

          else if ((v_op == 'a') || (v_op == 'b')) {
            let idir = parseInt(u_op);
            console.log(v_x, v_y);
            console.log(v_x + idir_dxy[idir][0], v_y + idir_dxy[idir][1]);
            console.log("");
          }

        }

      }

    }
  }

}

//----
//----
//----

function ulhp_initTwoFactor(grid_info) {

  let gadget_info = two_factor_gadget(grid_info);

  let n = gadget_info.E.length;

  // init flow graph adjacency matrix
  //
  let ffE = [];
  for (let i=0; i<n; i++) {
    ffE.push([]);
    for (let j=0; j<n; j++) {
      ffE[i].push(0);
    }
  }

  // populate
  //
  for (let i=0; i<gadget_info.E.length; i++) {
    for (let j=0; j<gadget_info.E[i].length; j++) {
      ffE[i][ gadget_info.E[i][j] ] = 1;
    }
  }

  // Ford-Fulkerson is pretty bad run-time (and memory)
  // I think Hopcroft-Karp is going to do much better,
  // at either $O(|E| \sqrt{V})$ or $O(|E| \log(V))$ since
  // it's sparse (?).
  // For now, I'm leaving this in, because the actual
  // algorithm is the priority but this is already way too
  // slow and we need to get to it in the future.
  //
  let resG = [], flowG = [];
  let flow = FF(ffE, ffE.length-2, ffE.length-1, resG, flowG);

  let gi = gadget_info;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let two_factor_idx_edge = [];


  for (let i=0; i<flowG.length; i++) {
    for (let j=0; j<flowG[i].length; j++) {

      if (flowG[i][j] > 0) {

        let u_name = gi.V[i];
        let v_name = gi.V[j];

        if ((u_name == "source") || (u_name == "sink") ||
            (v_name == "source") || (v_name == "sink")) { continue; }

        let u_op = u_name.split(".")[1];
        let v_op = v_name.split(".")[1];

        let u_x = parseInt( u_name.split(".")[0].split("_")[0] );
        let u_y = parseInt( u_name.split(".")[0].split("_")[1] );

        let v_x = parseInt( v_name.split(".")[0].split("_")[0] );
        let v_y = parseInt( v_name.split(".")[0].split("_")[1] );

        if ((u_op == 'a') || (u_op == 'b')) {
          let idir = parseInt(v_op);


          let _p = [u_x, u_y];
          let _q = [u_x + idir_dxy[idir][0], u_y + idir_dxy[idir][1]];

          let src_idx = xy2idx( _p, grid_info.size );
          let dst_idx = xy2idx( _q, grid_info.size );

          two_factor_idx_edge.push( [src_idx, dst_idx] );

        }

        else if ((v_op == 'a') || (v_op == 'b')) {
          let idir = parseInt(u_op);
          let _p = [v_x, v_y];
          let _q = [v_x + idir_dxy[idir][0], v_y + idir_dxy[idir][1]];

          let src_idx = xy2idx( _p, grid_info.size );
          let dst_idx = xy2idx( _q, grid_info.size );

          two_factor_idx_edge.push( [src_idx, dst_idx] );

        }

      }

    }
  }

  let debug = true;


  if (debug) {
    for (let i=0; i<two_factor_idx_edge.length; i++) {
      let edge_idx = two_factor_idx_edge[i];

      let p = idx2xy( edge_idx[0], grid_info.size );
      let q = idx2xy( edge_idx[1], grid_info.size );

      console.log(p[0], p[1]);
      console.log(q[0], q[1]);
      console.log("");
    }
  }

  // one hot encoding of which edges go out of each grid vertex
  //
  let two_deg_grid = [];
  for (let i=0; i<grid_info.grid.length; i++) { two_deg_grid.push(0); }

  let oppo = [ 1,0, 3,2, 5,4 ];

  for (let i=0; i<two_factor_idx_edge.length; i++) {
    let edge_idx = two_factor_idx_edge[i];

    let p_idx = edge_idx[0];
    let q_idx = edge_idx[1];

    let p = idx2xy( p_idx, grid_info.size );
    let q = idx2xy( q_idx, grid_info.size );

    let pq_idir = dxy2idir(p,q);
    let qp_idir = oppo[pq_idir];

    two_deg_grid[p_idx] = (two_deg_grid[p_idx] | (1 << pq_idir));
    two_deg_grid[q_idx] = (two_deg_grid[q_idx] | (1 << qp_idir));

    if (debug) {
      if ((p[0] == 6) && (p[1] == 1)) {
        console.log("#", p, "(", q, ")", pq_idir, "(", qp_idir, ")", two_deg_grid[p_idx], "(", two_deg_grid[q_idx], ")");
      }
    }

  }

  //grid_info["two_deg_grid"] = two_deg_grid;
  grid_info["grid_hook"] = two_deg_grid;

  return;
}

function ulhp_dependency(grid_info) {
  let two_deg_grid = grid_info.grid_hook;

  let depG_size = [ grid_info.size[0]+1, grid_info.size[1]+1 ];
  let depG_grid  = [];
  let depG_n = depG_size[0] * depG_size[1];
  for (let i=0; i<depG_n; i++) { depG_grid.push( 0 ); }

  for (let dep_idx=0; dep_idx < depG_n; dep_idx++) {
    let dep_xy = idx2xy( dep_idx, depG_size );

    let vtx_parity = (dep_xy[0] + dep_xy[1]) % 2;
    let vtx_hook = 0;

    let dep_type = 0;

    let grid_idx_pp = xy2idx( dep_xy, grid_info.size );
    let grid_idx_mp = xy2idx( [ dep_xy[0]-1, dep_xy[1] ], grid_info.size );
    let grid_idx_mm = xy2idx( [ dep_xy[0]-1, dep_xy[1]-1 ], grid_info.size );
    let grid_idx_pm = xy2idx( [ dep_xy[0], dep_xy[1]-1 ], grid_info.size );

    let edge_idir = [-1,-1,-1,-1];

    if ((grid_idx_pp >= 0) && (grid_idx_mp >= 0)) {
      if (grid_info.grid[grid_idx_pp] && grid_info.grid[grid_idx_mp]) {
        edge_idir[2] = 0;
      }
    }

    if ((grid_idx_mp >= 0) && (grid_idx_mm >= 0)) {
      if (grid_info.grid[grid_idx_mp] && grid_info.grid[grid_idx_mm]) {
        edge_idir[1] = 0;
      }
    }

    if ((grid_idx_mm >= 0) && (grid_idx_pm >= 0)) {
      if (grid_info.grid[grid_idx_mm] && grid_info.grid[grid_idx_pm]) {
        edge_idir[3] = 0;
      }
    }

    if ((grid_idx_pm >= 0) && (grid_idx_pp >= 0)) {
      if (grid_info.grid[grid_idx_pm] && grid_info.grid[grid_idx_pp]) {
        edge_idir[0] = 0;
      }
    }

    if (grid_idx_pp >= 0) {
      if (two_deg_grid[grid_idx_pp] & (1 << 1)) { edge_idir[2] = ((edge_idir[2] == -1) ? -1 : 1); }
      if (two_deg_grid[grid_idx_pp] & (1 << 3)) { edge_idir[0] = ((edge_idir[0] == -1) ? -1 : 1); }
    }

    if (grid_idx_mp >= 0) {
      if (two_deg_grid[grid_idx_mp] & (1 << 0)) { edge_idir[2] = ((edge_idir[2] == -1) ? -1 : 1); }
      if (two_deg_grid[grid_idx_mp] & (1 << 3)) { edge_idir[1] = ((edge_idir[1] == -1) ? -1 : 1); }
    }

    if (grid_idx_mm >= 0) {
      if (two_deg_grid[grid_idx_mm] & (1 << 0)) { edge_idir[3] = ((edge_idir[3] == -1) ? -1 : 1); }
      if (two_deg_grid[grid_idx_mm] & (1 << 2)) { edge_idir[1] = ((edge_idir[1] == -1) ? -1 : 1); }
    }

    if (grid_idx_pm >= 0) {
      if (two_deg_grid[grid_idx_pm] & (1 << 1)) { edge_idir[3] = ((edge_idir[3] == -1) ? -1 : 1); }
      if (two_deg_grid[grid_idx_pm] & (1 << 2)) { edge_idir[0] = ((edge_idir[0] == -1) ? -1 : 1); }
    }


    if (vtx_parity == 0) {
      if (edge_idir[0] == 0) { vtx_hook = (vtx_hook | (1 << 0)); }
      if (edge_idir[1] == 0) { vtx_hook = (vtx_hook | (1 << 1)); }

      if (edge_idir[2] == 1) { vtx_hook = (vtx_hook | (1 << 2)); }
      if (edge_idir[3] == 1) { vtx_hook = (vtx_hook | (1 << 3)); }
    }
    if (vtx_parity == 1) {
      if (edge_idir[0] == 1) { vtx_hook = (vtx_hook | (1 << 0)); }
      if (edge_idir[1] == 1) { vtx_hook = (vtx_hook | (1 << 1)); }

      if (edge_idir[2] == 0) { vtx_hook = (vtx_hook | (1 << 2)); }
      if (edge_idir[3] == 0) { vtx_hook = (vtx_hook | (1 << 3)); }
    }

    depG_grid[dep_idx] = vtx_hook;

  }

  grid_info.depG = {
    "size" : depG_size,
    "grid_hook" : depG_grid
  };

  return grid_info;
}

function ulhp_dual(grid_info) {
  let debug = false;

  //let two_deg_grid = grid_info.two_deg_grid;
  let two_deg_grid = grid_info.grid_hook;

  if (debug) {
    for (let y= (grid_info.size[1]-1); y>=0; y--) {
      let a = [];
      for (let x=0; x<grid_info.size[0]; x++) {
        a.push( two_deg_grid[ xy2idx( [x,y], grid_info.size ) ] );
      }
      console.log( "#", a.join(" ") );
    }
  }

  //let dualG_size = [ grid_info.size[0]+2, grid_info.size[1]+2 ];
  let dualG_size = [ grid_info.size[0]+1, grid_info.size[1]+1 ];
  let dualG_grid  = [];
  let dualG_n = dualG_size[0] * dualG_size[1];
  for (let i=0; i<dualG_n; i++) { dualG_grid.push( 0 ); }

  for (let dual_idx=0; dual_idx < dualG_n; dual_idx++) {
    let dual_xy = idx2xy( dual_idx, dualG_size );

    let dual_type = 0;

    let grid_idx_pp = xy2idx( dual_xy, grid_info.size );
    let grid_idx_mp = xy2idx( [ dual_xy[0]-1, dual_xy[1] ], grid_info.size );
    let grid_idx_mm = xy2idx( [ dual_xy[0]-1, dual_xy[1]-1 ], grid_info.size );
    let grid_idx_pm = xy2idx( [ dual_xy[0], dual_xy[1]-1 ], grid_info.size );

    let edge_idir = [-1,-1,-1,-1];

    if ((grid_idx_pp >= 0) && (grid_idx_mp >= 0)) {
      if (grid_info.grid[grid_idx_pp] && grid_info.grid[grid_idx_mp]) {
        edge_idir[2] = 0;
      }
    }

    if ((grid_idx_mp >= 0) && (grid_idx_mm >= 0)) {
      if (grid_info.grid[grid_idx_mp] && grid_info.grid[grid_idx_mm]) {
        edge_idir[1] = 0;
      }
    }

    if ((grid_idx_mm >= 0) && (grid_idx_pm >= 0)) {
      if (grid_info.grid[grid_idx_mm] && grid_info.grid[grid_idx_pm]) {
        edge_idir[3] = 0;
      }
    }

    if ((grid_idx_pm >= 0) && (grid_idx_pp >= 0)) {
      if (grid_info.grid[grid_idx_pm] && grid_info.grid[grid_idx_pp]) {
        edge_idir[0] = 0;
      }
    }

    if ((edge_idir[0] < 0) ||
        (edge_idir[1] < 0) ||
        (edge_idir[2] < 0) ||
        (edge_idir[3] < 0)) {
      dualG_grid[dual_idx] = dualCode(edge_idir);
      continue;
    }


    if (grid_idx_pp >= 0) {
      if (two_deg_grid[grid_idx_pp] & (1 << 1)) { edge_idir[2] = 1; }
      if (two_deg_grid[grid_idx_pp] & (1 << 3)) { edge_idir[0] = 1; }
    }

    if (grid_idx_mp >= 0) {
      if (two_deg_grid[grid_idx_mp] & (1 << 0)) { edge_idir[2] = 1; }
      if (two_deg_grid[grid_idx_mp] & (1 << 3)) { edge_idir[1] = 1; }
    }

    if (grid_idx_mm >= 0) {
      if (two_deg_grid[grid_idx_mm] & (1 << 0)) { edge_idir[3] = 1; }
      if (two_deg_grid[grid_idx_mm] & (1 << 2)) { edge_idir[1] = 1; }
    }

    if (grid_idx_pm >= 0) {
      if (two_deg_grid[grid_idx_pm] & (1 << 1)) { edge_idir[3] = 1; }
      if (two_deg_grid[grid_idx_pm] & (1 << 2)) { edge_idir[0] = 1; }
    }

    dualG_grid[dual_idx] = dualCode(edge_idir);

  }


  if (debug) {
    console.log("#dualG");
    for (let y= (dualG_size[1]-1); y>=0; y--) {
      let a = [];
      for (let x=0; x<dualG_size[0]; x++) {
        a.push( dualG_grid[ xy2idx( [x,y], dualG_size ) ] );
      }
      console.log( "#", a.join(" ") );
    }
  }

  grid_info.dualG = {
    "size" : dualG_size,
    "grid_code" : dualG_grid
  };

  return;
}

function dualCode(edge_idir) {
  // type IV
  //
  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 0)) {
    return 'o';
  }

  // type III
  //
  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 1)) {
    return '-';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 0)) {
    return '|';
  }

  // type II
  //
  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 0)) {
    return '7';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 0)) {
    return 'F';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 1)) {
    return 'L';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 1)) {
    return 'J';
  }

  // Type I
  //
  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 0)) {
    return '>';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 0)) {
    return '<';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 0)) {
    return '^';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 1)) {
    return 'v';
  }

  // type "V" (not specified in paper)
  // cul-de-sac dead end
  //
  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 1)) {
    return 'c';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 1)) {
    return 'p';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 1)) {
    return 'u';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 0)) {
    return 'n';
  }

  return '.';
}

//----
//----
//----

function export_grid(fn, grid_info) {
  fs.writeFileSync(fn, JSON.stringify(grid_info, undefined, 2));
}

function import_grid(fn) {
  return JSON.parse( fs.readFileSync(fn) );
}

function twofactor_code_print(grid_code, sz) {
  let print_grid_size = [ sz[0]*3, sz[1]*3 ];
  let print_grid = [];
  let print_grid_n = print_grid_size[0]*print_grid_size[1];
  for (let i=0; i< print_grid_n; i++) {
    print_grid.push(' ');
  }

  for (let y=0; y<sz[1]; y++) {
    for (let x=0; x<sz[0]; x++) {
      let code = grid_code[ xy2idx( [x,y], sz ) ];
      if (code == ' ') { continue; }

      let base_xy = [3*x+1, 3*y+1];
      print_grid[ xy2idx(base_xy, print_grid_size) ] = '*';

      let nei0_xy = [3*x+1, 3*y+1];
      let nei1_xy = [3*x+1, 3*y+1];

      let nei0_code = '-';
      let nei1_code = '|';

      if (code == 'L') { nei0_xy[0]++; nei1_xy[1]++; }
      if (code == '7') { nei0_xy[0]--; nei1_xy[1]--; }
      if (code == 'F') { nei0_xy[0]++; nei1_xy[1]--; }
      if (code == 'J') { nei0_xy[0]--; nei1_xy[1]++; }

      if (code == '|') { nei0_xy[1]--; nei1_xy[1]++; nei0_code = '|'; }
      if (code == '-') { nei0_xy[0]--; nei1_xy[0]++; nei1_code = '-'; }

      print_grid[ xy2idx(nei0_xy, print_grid_size) ] = nei0_code;
      print_grid[ xy2idx(nei1_xy, print_grid_size) ] = nei1_code;

    }
  }

  for (let y=(print_grid_size[1]-1); y>=0; y--) {

    if (((y+1)%3) == 0) { continue; }

    let pa = [];
    for (let x=0; x<print_grid_size[0]; x++) {
      pa.push(print_grid[ xy2idx( [x,y], print_grid_size ) ]);
    }
    console.log(pa.join(""));
  }
}

//-------
//-------
//-------
function load_custom_C1(grid_info) {
  let debug = true;

  grid_info.size = [ 4, 5 ];
  grid_info.grid = [
    0, 1, 1, 1,
    0, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
  ];

  // for ease, y downwards, we'll reverse y after
  //
  let grid_code_rev = [
    'F', '-', '-', '7',
    '|', 'F', '-', 'J',
    'L', 'J', 'F', '7',
    ' ', 'F', 'J', '|',
    ' ', 'L', '-', 'J'
  ];

  let grid_code = [];

  // reverse
  //
  for (let y=0; y<grid_info.size[1]; y++) {
    let yr = grid_info.size[1] - y - 1;
    for (let x=0; x<grid_info.size[0]; x++) {
      let src_idx = xy2idx( [x, yr], grid_info.size );
      grid_code.push( grid_code_rev[src_idx] );
    }
  }

  if (debug) {
    // print debug
    //
    for (let y=0; y<grid_info.size[1]; y++) {
      let pa = [];
      for (let x=0; x<grid_info.size[0]; x++) {
        pa.push( grid_code[ xy2idx( [x,grid_info.size[1] - y - 1], grid_info.size ) ] );
      }
      console.log(pa.join(""));
    }
    twofactor_code_print(grid_code, grid_info.size);
  }



  // convert to two_deg_grid
  //
  let _c2i = {
    " " : -1,

    "-" : (1 << 0) | (1 << 1),
    "|" : (1 << 2) | (1 << 3),

    "F" : (1 << 0) | (1 << 3),
    "L" : (1 << 0) | (1 << 2),
    "J" : (1 << 1) | (1 << 2),
    "7" : (1 << 1) | (1 << 3)
  };

  let two_deg_grid = [];
  for (let idx=0; idx<grid_code.length; idx++) {
    two_deg_grid.push( _c2i[ grid_code[idx] ] );
  }

  //grid_info["two_deg_grid"] = two_deg_grid;
  grid_info["grid_hook"] = two_deg_grid;

  ulhp_dual(grid_info);
  ulhp_dependency(g_info);

  if (debug) {
    console.log("#######################");
    console.log("#######################");
    console.log("#######################");

    console.log(grid_info);
  }

  return grid_info;
}


function load_custom_C0(grid_info) {
  let debug = true;

  grid_info.size = [ 4, 5 ];
  grid_info.grid = [
    0, 1, 1, 1,
    0, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 0,
    1, 1, 1, 0,
  ];

  // for ease, y downwards, we'll reverse y after
  //
  let grid_code_rev = [
    'F', '-', '7', ' ',
    '|', 'F', 'J', ' ',
    'L', 'J', 'F', '7',
    ' ', 'F', 'J', '|',
    ' ', 'L', '-', 'J'
  ];

  let grid_code = [];

  // reverse
  //
  for (let y=0; y<grid_info.size[1]; y++) {
    let yr = grid_info.size[1] - y - 1;
    for (let x=0; x<grid_info.size[0]; x++) {
      let src_idx = xy2idx( [x, yr], grid_info.size );
      grid_code.push( grid_code_rev[src_idx] );
    }
  }

  if (debug) {
    // print debug
    //
    for (let y=0; y<grid_info.size[1]; y++) {
      let pa = [];
      for (let x=0; x<grid_info.size[0]; x++) {
        pa.push( grid_code[ xy2idx( [x,grid_info.size[1] - y - 1], grid_info.size ) ] );
      }
      console.log(pa.join(""));
    }
    twofactor_code_print(grid_code, grid_info.size);
  }



  // convert to two_deg_grid
  //
  let _c2i = {
    " " : -1,

    "-" : (1 << 0) | (1 << 1),
    "|" : (1 << 2) | (1 << 3),

    "F" : (1 << 0) | (1 << 3),
    "L" : (1 << 0) | (1 << 2),
    "J" : (1 << 1) | (1 << 2),
    "7" : (1 << 1) | (1 << 3)
  };

  let two_deg_grid = [];
  for (let idx=0; idx<grid_code.length; idx++) {
    two_deg_grid.push( _c2i[ grid_code[idx] ] );
  }

  //grid_info["two_deg_grid"] = two_deg_grid;
  grid_info["grid_hook"] = two_deg_grid;

  ulhp_dual(grid_info);
  ulhp_dependency(g_info);

  if (debug) {
    console.log("#######################");
    console.log("#######################");
    console.log("#######################");

    console.log(grid_info);
  }

  return grid_info;
}

function load_custom7_1(grid_info) {

  let debug = false;

  grid_info.size = [ 7, 15 ];
  grid_info.grid = [
    0, 0, 1, 1, 1, 1, 1,
    0, 0, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 0, 0,
    1, 1, 1, 1, 0, 0, 0,
    1, 1, 1, 1, 0, 0, 0
  ];

  // for ease, y downwards, we'll reverse y after
  //
  let grid_code_rev = [
    'F', '-', '-', '7', ' ', ' ', ' ',
    'L', '7', 'F', 'J', ' ', ' ', ' ',
    ' ', 'L', 'J', 'F', '7', ' ', ' ',
    'F', '7', 'F', 'J', 'L', '7', ' ',
    '|', 'L', 'J', 'F', '7', '|', ' ',
    'L', '7', 'F', 'J', '|', '|', ' ',
    ' ', 'L', 'J', 'F', 'J', 'L', '7',
    'F', '7', 'F', 'J', 'F', '7', '|',
    '|', 'L', 'J', 'F', 'J', 'L', 'J',
    'L', '7', 'F', 'J', 'F', '7', ' ',
    ' ', '|', '|', 'F', 'J', '|', ' ',
    ' ', '|', 'L', 'J', 'F', 'J', ' ',
    ' ', 'L', '7', 'F', 'J', 'F', '7',
    ' ', ' ', '|', 'L', '-', 'J', '|',
    ' ', ' ', 'L', '-', '-', '-', 'J'

  ];

  let grid_code = [];

  // reverse
  //
  for (let y=0; y<grid_info.size[1]; y++) {
    let yr = grid_info.size[1] - y - 1;
    for (let x=0; x<grid_info.size[0]; x++) {
      let src_idx = xy2idx( [x, yr], grid_info.size );
      grid_code.push( grid_code_rev[src_idx] );
    }
  }

  if (debug) {
    // print debug
    //
    for (let y=0; y<grid_info.size[1]; y++) {
      let pa = [];
      for (let x=0; x<grid_info.size[0]; x++) {
        pa.push( grid_code[ xy2idx( [x,grid_info.size[1] - y - 1], grid_info.size ) ] );
      }
      console.log(pa.join(""));
    }
    twofactor_code_print(grid_code, grid_info.size);
  }



  // convert to two_deg_grid
  //
  let _c2i = {
    " " : -1,

    "-" : (1 << 0) | (1 << 1),
    "|" : (1 << 2) | (1 << 3),

    "F" : (1 << 0) | (1 << 3),
    "L" : (1 << 0) | (1 << 2),
    "J" : (1 << 1) | (1 << 2),
    "7" : (1 << 1) | (1 << 3)
  };

  let two_deg_grid = [];
  for (let idx=0; idx<grid_code.length; idx++) {
    two_deg_grid.push( _c2i[ grid_code[idx] ] );
  }

  //grid_info["two_deg_grid"] = two_deg_grid;
  grid_info["grid_hook"] = two_deg_grid;

  ulhp_dual(grid_info);
  ulhp_dependency(g_info);

  if (debug) {
    console.log("#######################");
    console.log("#######################");
    console.log("#######################");

    console.log(grid_info);
  }

  return grid_info;
}

function _main(argv) {
  let debug = true;

  let export_import = 'import';

  export_import = "example7.1_grid";
  export_import = "example7.1_two-factor";

  export_import = "custom7.1";

  if (argv.length > 1)  {
    export_import = argv[1];
  }

  //----
  //----


  if (export_import == 'import') {
    g_info = import_grid("./test_grid0.json");
  }

  else if (export_import == 'test') {

    g_info.size = [3,3];
    g_info.grid = [ 1,1,1, 1,1,1, 1,1,1 ];

  }

  // No ham cycle possible
  //
  else if (export_import == "custom_C0") {

    load_custom_C0( g_info );

    debugPrint(g_info);
    return;
  }

  // No ham cycle possible
  //
  else if (export_import == "custom_C1") {
    load_custom_C1( g_info );

    debugPrint(g_info);
    return;
  }

  // Custom 7.1
  //
  else if (export_import == "custom7.1") {
    load_custom7_1( g_info );
    return;
  }

  // Figure 7.1 example graph
  // with initial two-factor already provided
  //
  else if (export_import == "example7.1_two-factor") {

    g_info.size = [ 7, 15 ];
    g_info.grid = [
      0, 0, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 0, 0,
      1, 1, 1, 1, 0, 0, 0,
      1, 1, 1, 1, 0, 0, 0
    ];

    // for ease, y downwards, we'll reverse y after
    //
    let grid_code_rev = [
      'F', '-', '-', '7', ' ', ' ', ' ',
      'L', '7', 'F', 'J', ' ', ' ', ' ',
      ' ', 'L', 'J', 'F', '7', ' ', ' ',
      'F', '7', 'F', 'J', 'L', '7', ' ',
      '|', 'L', 'J', 'F', '7', '|', ' ',
      'L', '7', 'F', 'J', '|', '|', ' ',
      ' ', 'L', 'J', 'F', 'J', 'L', '7',
      'F', '7', 'F', 'J', 'F', '7', '|',
      '|', 'L', 'J', 'F', 'J', 'L', 'J',
      'L', '7', 'F', 'J', 'F', '7', ' ',
      ' ', '|', '|', 'F', 'J', 'L', '7',
      ' ', '|', 'L', 'J', 'F', '-', 'J',
      ' ', 'L', '7', 'F', 'J', 'F', '7',
      ' ', ' ', '|', 'L', '-', 'J', '|',
      ' ', ' ', 'L', '-', '-', '-', 'J'

    ];

    let grid_code = [];

    // reverse
    //
    for (let y=0; y<g_info.size[1]; y++) {
      let yr = g_info.size[1] - y - 1;
      for (let x=0; x<g_info.size[0]; x++) {
        let src_idx = xy2idx( [x, yr], g_info.size );
        grid_code.push( grid_code_rev[src_idx] );
      }
    }

    if (debug) {
      // print debug
      //
      for (let y=0; y<g_info.size[1]; y++) {
        let pa = [];
        for (let x=0; x<g_info.size[0]; x++) {
          pa.push( grid_code[ xy2idx( [x,g_info.size[1] - y - 1], g_info.size ) ] );
        }
        console.log(pa.join(""));
      }
      twofactor_code_print(grid_code, g_info.size);
    }



    // convert to two_deg_grid
    //
    let _c2i = {
      " " : -1,

      "-" : (1 << 0) | (1 << 1),
      "|" : (1 << 2) | (1 << 3),

      "F" : (1 << 0) | (1 << 3),
      "L" : (1 << 0) | (1 << 2),
      "J" : (1 << 1) | (1 << 2),
      "7" : (1 << 1) | (1 << 3)
    };

    let two_deg_grid = [];
    for (let idx=0; idx<grid_code.length; idx++) {
      two_deg_grid.push( _c2i[ grid_code[idx] ] );
    }

    //g_info["two_deg_grid"] = two_deg_grid;
    g_info["grid_hook"] = two_deg_grid;

    ulhp_dual(g_info);

    console.log("#######################");
    console.log("#######################");
    console.log("#######################");

    console.log(g_info);

    return;
  }

  // Figure 7.1 from Uman's thesis,
  // just the grid
  //
  else if (export_import == "example7.1_grid") {

    g_info.size = [ 7, 15 ];
    g_info.grid = [
      0, 0, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 0, 0,
      1, 1, 1, 1, 0, 0, 0,
      1, 1, 1, 1, 0, 0, 0,

      /*
      1, 1, 1, 1, 0, 0, 0,
      1, 1, 1, 1, 0, 0, 0,
      0, 1, 1, 1, 1, 0, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1
      */
    ];

    ulhp_initTwoFactor(g_info);

    ulhp_dual(g_info);

    return;
  }

  else {

    g_info.size = [24,24];
    g_info.grid = random_grid(g_info.size, 0.25, [[4,4],[20,20]]);
    cleanup_heuristic(g_info);
    raise_island(g_info, [0,0]);
    export_grid("grid_info.json", g_info)
  }

  ulhp_initTwoFactor(g_info);
  return;




  let nv = 0;
  for (let i=0; i<g_info.grid.length; i++) {
    if (g_info.grid[i] > 0) { nv++; }
  }
  console.log("# num1:", nv);

  let gadget_info = two_factor_gadget(g_info);

  let n = gadget_info.E.length;

  let ffE = [];
  for (let i=0; i<n; i++) {
    ffE.push([]);
    for (let j=0; j<n; j++) {
      ffE[i].push(0);
    }
  }

  for (let i=0; i<gadget_info.E.length; i++) {
    for (let j=0; j<gadget_info.E[i].length; j++) {
      ffE[i][ gadget_info.E[i][j] ] = 1;
    }
  }

  // Ford-Fulkerson is pretty bad run-time (and memory)
  // I think Hopcroft-Karp is going to do much better,
  // at either $O(|E| \sqrt{V})$ or $O(|E| \log(V))$ since
  // it's sparse (?).
  // For now, I'm leaving this in, because the actual
  // algorithm is the priority but this is already way too
  // slow and we need to get to it in the future.
  //
  let resG = [], flowG = [];
  let flow = FF(ffE, ffE.length-2, ffE.length-1, resG, flowG);

  let gi = gadget_info;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  if (export_import == 'test') {
    for (let i=0; i<flowG.length; i++) {
      for (let j=0; j<flowG[i].length; j++) {

        if (flowG[i][j] > 0) {

          let u_name = gi.V[i];
          let v_name = gi.V[j];

          console.log(u_name, "-(", flowG[i][j], ")->", v_name);

        }

      }
    }

    return;
  }


  for (let i=0; i<flowG.length; i++) {
    for (let j=0; j<flowG[i].length; j++) {

      if (flowG[i][j] > 0) {

        let u_name = gi.V[i];
        let v_name = gi.V[j];

        if ((u_name == "source") || (u_name == "sink") ||
            (v_name == "source") || (v_name == "sink")) { continue; }

        let u_op = u_name.split(".")[1];
        let v_op = v_name.split(".")[1];

        let u_x = parseInt( u_name.split(".")[0].split("_")[0] );
        let u_y = parseInt( u_name.split(".")[0].split("_")[1] );

        let v_x = parseInt( v_name.split(".")[0].split("_")[0] );
        let v_y = parseInt( v_name.split(".")[0].split("_")[1] );

        if ((u_op == 'a') || (u_op == 'b')) {
          let idir = parseInt(v_op);
          console.log(u_x, u_y);
          console.log(u_x + idir_dxy[idir][0], u_y + idir_dxy[idir][1]);
          console.log("");
        }

        else if ((v_op == 'a') || (v_op == 'b')) {
          let idir = parseInt(u_op);
          console.log(v_x, v_y);
          console.log(v_x + idir_dxy[idir][0], v_y + idir_dxy[idir][1]);
          console.log("");
        }

      }

    }
  }


  //printGrid( g_info );

}

if (typeof module !== "undefined") {
  module.exports["fasslib"] = fasslib;
  module.exports["FF"] = FF;

  module.exports["idx2xy"] = idx2xy;
  module.exports["xy2idx"] = xy2idx;
  module.exports["dxy2idir"] = dxy2idir;
  module.exports["inBounds"] = inBounds;
  module.exports["dualCode"] = dualCode;

  module.exports["two_factor_gadget"] = two_factor_gadget;
  module.exports["grid_info"] = g_info;

  module.exports["dual"] = ulhp_dual;
  module.exports["dependency"] = ulhp_dependency;

  module.exports["custom"] = load_custom7_1;
  module.exports["custom_C0"] = load_custom_C0;
  module.exports["custom_C1"] = load_custom_C1;

}

if ((typeof require !== "undefined") &&
    (require.main === module)) {
  _main(process.argv.slice(1));
}

}).call(this)}).call(this,require('_process'))
},{"./fasslib.js":1,"./ff_prabod.js":2,"_process":5,"fs":4}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[3])(3)
});
