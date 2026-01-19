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

function naive_arg_point_set_maxima(S) {
  let n = S.length;
  let _max_idx = 0;

  for (let i=0; i<n; i++) {

    let _maxima = true;
    for (let j=0; j<n; j++) {
      if (i==j) { continue; }
      let d = point_domination( S[i], S[j] );
      if (d == 'b') { _maxima = false; break; }
    }

    if (_maxima) { return i; }
  }

  return -1;
}

// untested
//
//                   .----------------------------. (1,1)
// sqrt( ln(N) / N ) |          D             | C |
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
//
function M1_2d(S) {
  let n = S.length;

  let C_count = 0;
  let C_BD = [];

  let slnn = 1 - Math.sqrt( Math.log(n) / n );
  let P = [ 1 - slnn, 1 - slnn ];

  for (let i=0; i<n; i++) {
    let Q = S[i];
    let d = point_dominate(P, Q);

    if      (d == 'a') { }
    else if (d == 'b') { C_count++; C_BD.push(i); }
    else               { C_BD.push(i); }
  }

  if (C_count == 0) { return naive_arg_point_set_maxima(S); }
  return naive_arg_point_set_maxima(C_BD);
}

function M1(S, dim) {
  let n = S.length;
  if (n == 0) { return -1; }

  dim = ((typeof dim === "undefined") ? S[0].length : dim);

  let C_count = 0;
  let C_BD = [];

  let slnn = 1 - Math.pow( Math.log(n) / n, 1/dim );
  let P = [];
  for (let i=0; i<dim; i++) { P.push( 1- slnn ); }

  for (let i=0; i<n; i++) {
    let Q = S[i];
    let d = point_dominate(P, Q);

    if      (d == 'a') { }
    else if (d == 'b') { C_count++; C_BD.push(i); }
    else               { C_BD.push(i); }
  }

  if (C_count == 0) { return naive_arg_point_set_maxima(S); }
  return naive_arg_point_set_maxima(C_BD);
}


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

function _main() {
  _point_domination_spot_test();
}

_main();
