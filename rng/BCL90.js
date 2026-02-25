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

// "Fast Linear Computing Expected-Time Maxima and Algorithms Convex Hulls"
// by Jon L. Bentley, Kenneth L. Clarkson, David B. Levine
// 1990
//
// CI - component independence
//
// maxima of a point set (https://en.wikipedia.org/wiki/Maxima_of_a_point_set)
// is defined to be all points that are non-dominated.
//
// A point, p, *dominates* a point, q, if, for every coordinate, p[k] > q[k].
// When comparing two points for domation, there can be one of four states:
//
//  * p dominates q
//  * q dominates p
//  * p equals q
//  * p and q are incomparable
//
// maxima points are **non-dominated** points, not necessarily points
// that domainate all others.
// That is, a point, p, is a maxima if it either dominates or is incomparable
// to all other points in the set.
//
// E.g. S = { [1,0], [0,1] }, both points are incomparable and don't dominate any other
// points, so they are both maxima.
//

var cocha = require("./cocha.js");
var KOS = require("./min_select.js");
var BCL90_STANDALONE = false;

var NAIVE_RUNTIME_COUNT = 0;

var drand = Math.random;

var _example_point_set = [
  [ 0.6904761904761905, 0.23809523809523808 ],
  [ 0.8333333333333334, 0.23809523809523808 ],
  [ 0.9523809523809523, 0.38095238095238093 ],
  [ 0.07142857142857142, 0.16666666666666666 ],
  [ 0.14285714285714285, 0.14285714285714285 ],
  [ 0.5476190476190477, 0.8571428571428571 ],
  [ 0.21428571428571427, 0.21428571428571427 ],
  [ 0.23809523809523808, 0.2619047619047619 ],
  [ 0.16666666666666666, 0.42857142857142855 ],
  [ 0.4523809523809524, 0.8095238095238095 ],
  [ 0.09523809523809523, 0.9523809523809523 ],
  [ 0.7619047619047619, 0.7380952380952381 ],
  [ 0.9285714285714286, 0.2619047619047619 ],
  [ 0.19047619047619047, 0.6190476190476191 ],
  [ 0.5952380952380952, 0.6904761904761905 ],
  [ 0.6428571428571429, 0.6666666666666666 ],
  [ 0.6428571428571429, 0.6190476190476191 ],
  [ 0.5238095238095238, 0.2857142857142857 ],
  [ 0.8333333333333334, 0.4523809523809524 ],
  [ 0.7619047619047619, 0.5952380952380952 ],
  [ 0.23809523809523808, 0.7619047619047619 ],
  [ 0.09523809523809523, 0.8571428571428571 ]
];

// maxima points of the above (values, not indices)
//
var _example_maxima = [
  [ 0.9523809523809523, 0.38095238095238093 ],
  [ 0.5476190476190477, 0.8571428571428571 ],
  [ 0.09523809523809523, 0.9523809523809523 ],
  [ 0.7619047619047619, 0.7380952380952381 ],
  [ 0.8333333333333334, 0.4523809523809524 ]
];

// return:
//
//  'a' a dominates b
//  'b' b dominates a
//  'i' incomparible
//  '=' a==b 
//
function point_domination(a,b) {
  let n = Math.min( a.length, b.length );

  let s = 0;
  for (s=0; s<n; s++) {
    if (a[s] != b[s]) { break; }
  }
  if (s == n) { return '='; }

  if (a[s] > b[s]) {
    for (let j=(s+1); j<n; j++) {
      if (b[j] >= a[j]) { return 'i'; }
    }
    return 'a';
  }

  for (let j=(s+1); j<n; j++) {
    if (a[j] >= b[j]) { return 'i'; }
  }
  return 'b';

}

// O(n^2)
//
// input:
//
//   S : array of points (of arbitrary but same dimension)
//
//
// return:
//
//   array of indices of maxima (non-dominated points)
//
function naive_arg_point_set_maxima(S) {
  let n = S.length;
  let _max_idx = 0;

  let _a = [];

  for (let i=0; i<n; i++) {

    let _maxima = true;
    for (let j=0; j<n; j++) {

      NAIVE_RUNTIME_COUNT++;

      if (i==j) { continue; }
      let d = point_domination( S[i], S[j] );
      if (d == 'b') { _maxima = false; break; }
    }

    if (_maxima) { _a.push(i); }
  }

  return _a;
}

//                   .----------------------------. (1,1)
// (ln(N) / N)^{1/d} |          D             | C |
//                   |------------------------*---|
//                   |                      / |   |
//                   |                     P  |   |
//                   |                        |   |
//                   |          A             | B |
//                   |                        |   |
//                   |                        |   |
//                   |                        |   |
//                   |                        |   |
//                   .----------------------------.
//             (0,0)

// spot cehck: working
//
// BCL M1 algorithm, extended to arbitrary dimension
//
// returns index (from S) of a maxima
// -1 error
//
function M1(S, dim) {
  let n = S.length;
  if (n == 0) { return { "p":[], "idx": [] }; }

  dim = ((typeof dim === "undefined") ? S[0].length : dim);

  let C_count = 0;
  let C_BD = [];

  let slnn = Math.pow( Math.log(n) / n, 1/dim );
  let P = [];
  for (let i=0; i<dim; i++) { P.push( 1-slnn ); }

  for (let i=0; i<n; i++) {
    let Q = S[i];
    let d = point_domination(P, Q);

    if      (d == 'a') { }
    else if (d == 'b') { C_count++; C_BD.push(i); }
    else               { C_BD.push(i); }
  }

  let S_tmp = [];
  for (let i=0; i<C_BD.length; i++) {
    S_tmp.push( S[ C_BD[i] ] );
  }

  if (C_count == 0) { return naive_arg_point_set_maxima(S); }
  let idx_tmp = naive_arg_point_set_maxima(S_tmp);

  let p_max = [];
  let idx_max = [];
  for (let i=0; i<idx_tmp.length; i++) {
    p_max.push( S[C_BD[idx_tmp[i]]] );
    idx_max.push( C_BD[idx_tmp[i]] );
  }

  return {
    "p" : p_max,
    "idx" : idx_max
  };

}

// needs some more testing
// uses min_select.js (as KOS) to find N(1-(ln N / N)^{1/K}) order
// statistic
//
function M2(S, dim) {
  let n = S.length;
  if (n == 0) { return { "p":[], "idx": [] }; }
  dim = ((typeof dim === "undefined") ? S[0].length : dim);

  let k_ordstat  = Math.floor( n * (1 - Math.pow( (Math.log(n)/n), 1/dim)) );

  let C_count = 0;
  let C_BD = [];

  let P = [];
  for (let d=0; d<dim; d++) {
    let a_ci = [];
    for (let i=0; i<n; i++) { a_ci.push(S[i][d]); }
    P.push( KOS.select(a_ci, k_ordstat) );
  }

  for (let i=0; i<n; i++) {
    let Q = S[i];
    let d = point_domination(P, Q);

    if      (d == 'a') { }
    else if (d == 'b') { C_count++; C_BD.push(i); }
    else               { C_BD.push(i); }
  }

  let S_tmp = [];
  for (let i=0; i<C_BD.length; i++) {
    S_tmp.push( S[ C_BD[i] ] );
  }

  if (C_count == 0) { return naive_arg_point_set_maxima(S); }
  let idx_tmp = naive_arg_point_set_maxima(S_tmp);

  let p_max = [];
  let idx_max = [];
  for (let i=0; i<idx_tmp.length; i++) {
    p_max.push( S[C_BD[idx_tmp[i]]] );
    idx_max.push( C_BD[idx_tmp[i]] );
  }

  return {
    "p" : p_max,
    "idx" : idx_max
  };


}

// heuristic maxima algorithm
//
function M3(S, dim) {
  let n = S.length;
  if (n == 0) { return { "p":[], "idx": [] }; }

  let maxima_idx = [ 0 ];

  for (let i=1; i<n; i++) {

    // S[ M[j] ] dominates S[i] -> put j at front of M
    // S[i] dominates S[ M[j] ] -> remove j from M and shift remaining
    // S[i] == S[ M[j] ]        -> break
    // S[i] dominates or incomparable to all of S[ M[j] ] -> add i
    //
    let j = 0;
    while (j < maxima_idx.length) {

      let _domcode = point_domination( S[ maxima_idx[j] ], S[i] );

      if (_domcode == 'a') {
        let _t = maxima_idx[j];
        maxima_idx[j] = maxima_idx[0];
        maxima_idx[0] = _t;
        break;
      }

      else if (_domcode == 'b') {
        for (let s=j; s<(maxima_idx.length-1); s++) {
          maxima_idx[s] = maxima_idx[s+1];
        }
        maxima_idx.pop();
      }

      else if (_domcode == '=') { break; }

      // incomparable, _domcode == 'i'
      //
      else {
        j++;
      }

    }

    if (j == maxima_idx.length) {
      maxima_idx.push(i);
    }

  }

  let p_max = [];
  for (let i=0; i<maxima_idx.length; i++) {
    p_max.push( S[ maxima_idx[i] ] );
  }

  return {
    "p" : p_max,
    "idx" : maxima_idx
  };

}

//---

// still need to clean up some ways we think about how to return
// the convex hull.
// Right now, it's vertex list for 2d and vertex triples for 3d.
// We want to pick one or the other...
//
//                   .-------------------------------. (1,1)
// sqrt( ln(N) / N ) | C[1] |                 | C[0] |
//                   |------*-----------------*------|
//                   |      |                 |      |
//                   |      |                 |      |
//                   |      |                 |      |
//                   |      |       A         |      |
//                   |      |                 |      |
//                   |      |                 |      |
//                   |      |                 |      |
//                   |------*-----------------*------|
//                   | C[2] |                 | C[3] |
//                   .-------------------------------.
//             (0,0)
//
//
// note that N has to be pretty large before we start seeing savings.
//
// We're taking points *outside* of A, so in the corners and
// side strips. The C[.] counters are only sued to see if we
// can restrict our attention to B (= outside A).
//
// Consider the proportion of the B area (for 3d):
// p=l(n)/n
// 1 - (1-(2*(p^(1/3))))^3
//
//        100 0.9773054763140018
//       1000 0.7627063613354528
//      10000 0.4775435936101511
//     100000 0.26440782506313243
//    1000000 0.1371718709227634
//   10000000 0.06871190939047511
//  100000000 0.033752163483562136
// 1000000000 0.01639014014977558
//
//
function H1(S,dim, CHA) {
  let n = S.length;
  if (n == 0) { return { "p":[], "idx": [] }; }
  dim = ((typeof dim === "undefined") ? S[0].length : dim);
  if (typeof CHA  === "undefined") {
    if (dim == 1) {
      let dat = { "p" : [S[0], S[0]], "idx": [0,0] };
      for (let i=1; i<n; i++) {
        if (dat.p[0] > S[i]) { dat.p[0] = S[i]; dat.idx[0] = i; }
        if (dat.p[1] < S[i]) { dat.p[1] = S[i]; dat.idx[1] = i; }
      }
      return dat;
    }
    if      (dim == 2) { CHA = cocha.hull2d; }
    else if (dim == 3) { CHA = cocha.hull3d; }
    else               { return -1; }
    //else               { CHA = convex_null_naive; }
  }

  let m = (1<<dim);

  let B_idx = [];
  let B = [];
  let slnn = Math.pow( Math.log(n) / n, 1/dim );

  let C = [];
  for (let i=0; i<m; i++) { C.push(0); }

  for (let idx=0; idx<n; idx++) {
    for (let j=0; j<dim; j++) {
      if ( (S[idx][j] < slnn) ||
           (S[idx][j] > (1-slnn)) ) {
        B_idx.push(idx);
        B.push( S[idx] );
        break;
      }
    }
  }


  for (let i=0; i<B_idx.length; i++) {
    let idx = B_idx[i];
    let p = S[idx];

    for (let j=0; j<m; j++) {
      let _c = 0;
      for (let d=0; d<dim; d++) {
        if ( j & (1<<d) ) {
          if ( p[d] > (1-slnn) ) { _c++; }
          else { break; }
        }
        else {
          if ( p[d] < slnn ) { _c++; }
          else { break; }
        }
      }
      if (_c == dim) { C[j]++; }
    }

  }

  for (let i=0; i<m; i++) {
    if (C[i] == 0) {
      return CHA(S);
    }
  }

  let B_ch = CHA(B);

  let vtx_list = [];
  if (dim == 2) {
    for (let i=0; i<B_ch.length; i++) {
      vtx_list.push( B_idx[ B_ch[i] ] );
    }
  }
  else {
    for (let i=0; i<B_ch.length; i++) {
      vtx_list.push( [B_idx[ B_ch[i][0] ] , B_idx[ B_ch[i][1] ], B_idx[B_ch[i][2] ] ]);
    }
  }

  return vtx_list;
}


//--------------
//--------------
//--------------


function _point_domination_spot_test() {
  let a = [1,2,3],
      b = [0,1,2];

  console.log(a,b, point_domination(a,b));

  a = [1,2,3];
  b = [0,1,4];
  console.log(a,b, point_domination(a,b));

  a = [1,2,3];
  b = [1,2,3];
  console.log(a,b, point_domination(a,b));

  a = [3,2,1];
  b = [10,9,11];
  console.log(a,b, point_domination(a,b));
}

if (typeof module !== "undefined") {
}

if ((typeof require !== "undefined") &&
    (require.main === module)) {
  BCL90_STANDALONE = true;
}

function rand_point(n, d) {
  let a = [];
  for (let i=0; i<n; i++) {
    let v = [];
    for (let j=0; j<d; j++) {
      v.push(Math.random());
    }
    a.push(v);
  }
  return a;
}

if (BCL90_STANDALONE) {

  function _main(argv) {

    let _gnuplot = true;

    let op = "help";
    if (argv.length > 0) { op = argv[0]; }

    if (op == "help") {
      console.log("...");
    }

    else if (op == "spot_dom") {
      _point_domination_spot_test();
    }

    else if (op == "m1_example") {
      let v = M1(_example_point_set);
      console.log(v);
    }

    else if (op == "m2_example") {
      let v = M2(_example_point_set);
      console.log(v);
    }

    else if (op == "m1_experiment") {

      let n_it = 100;
      for (let n = 20; n<100000; n *= 2) {
        for (let it=0; it<n_it; it++) {

          NAIVE_RUNTIME_COUNT = 0;

          let p = rand_point(n, 3);
          let v = M1(p);

          console.log(n, NAIVE_RUNTIME_COUNT);
          //console.log(v);
        }
      }

    }

    else if (op == "m3_example") {
      let v = M3(_example_point_set);
      console.log(v);
    }

    else if (op == "h1_example") {
      let a = [],
          dim = 2,
          n = 3000;
      for (let i=0; i<n; i++) { a.push( [ drand(), drand() ] ); }

      let vl = H1(a, dim);
      
      for (let i=0; i<n; i++) {
        console.log(a[i][0], a[i][1]);
        console.log("\n");
      }

      for (let i=0; i<vl.length; i++) {
        let idx = vl[i];
        console.log(a[idx][0], a[idx][1]);
      }
      console.log("\n");
    }

    else if (op == "h1_3d_example") {

      let a = [],
          dim = 3,
          n = 1000;

      if (argv.length > 1) {
        n = parseInt(argv[1]);
        console.log("##n:", n);
      }


      for (let i=0; i<n; i++) { a.push( [ drand(), drand(), drand() ] ); }

      let vl = H1(a, dim);

      for (let i=0; i<n; i++) {
        console.log(a[i][0], a[i][1], a[i][2]);
        console.log("\n");
      }

      console.log("#vl:", vl.length);
      for (let i=0; i<vl.length; i++) {
        let idx3 = vl[i];
        console.log(a[idx3[0]][0], a[idx3[0]][1], a[idx3[0]][2]);
        console.log(a[idx3[1]][0], a[idx3[1]][1], a[idx3[1]][2]);
        console.log(a[idx3[2]][0], a[idx3[2]][1], a[idx3[2]][2]);
        console.log("\n");0
      }
      console.log("\n");
    }

    else if (op == "m1") {

      let a = [],
          dim = 2,
          n = 1000;

      for (let i=0; i<n; i++) {
        a.push( [ drand(), drand() ] );
      }

      let v = M1(a);

      for (let i=0; i<n; i++) {
        console.log(a[i][0], a[i][1]);
      }

      console.log("\n\n");

      console.log("#", JSON.stringify(v));

    }

    else if (op == "m3") {
    }

    else {
      console.log("xxx");
    }

  }

  _main(process.argv.slice(2));

}
