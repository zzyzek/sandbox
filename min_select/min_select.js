#!/usr/bin/node
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

function _swap(a,i,j) {
  let t = a[i];
  a[i] = a[j];
  a[j] = t;
}

function bubble_sort(a,s,n) {
  let m = -1;

  for (let i=s; i<(s+n); i++) {
    m = s+n - (i-s);
    for (let j=(s+1); j<m; j++) {
      if (a[j-1] > a[j]) { _swap(a, j-1, j); }
    }
  }
}

function k_select_recur(a, s, n, kl) {
  let v=-1, b=-1, e=-1, m=-1;
  let g = Math.floor(n/5);

  if (g==0) {
    if (n>0) {
      bubble_sort(a,s,n);
      _swap(a,s,s+kl);
    }
    return a[s];
  }

  for (let i=0; i<g; i++) {
    bubble_sort(a, s+5*i, s+5);
    _swap(a, s+i, s+(5*i)+2);
  }

  k_select_recur(a,s,g,Math.floor(n/10));

  v = a[s];

  for (b=(s+1), e=(s+n-1); (e-b)>0; ) {
    if (a[b] > v) { _swap(a,b,e); e--; }
    else          { b++; }
  }

  if (a[b] > v) { b--; }
  _swap(a,s,b);

  m = b-s;
  if (m == kl) {
    _swap(a,s,s+kl);
    return a[0];
  }

  else if (kl < m) {
    k_select_recur(a,s,m,kl);
  }

  else {
    // m = b-s -> s = b-m -> s+m = b
    k_select_recur(a, s + (m+1), n - (m+1), kl - (m+1) );
    _swap(a, s, b+1);
  }

  return a[0];
}

function k_select(a, kl) {
  return k_select_recur(a, 0, a.length, kl);
}



if (typeof module !== "undefined") {
  module.exports["_select"] = k_select_recur;
  module.exports["select"] = k_select;
}

if ((typeof require !== "undefined") &&
    (require.main === module)) {

  function _S(a) { return JSON.stringify(a); }

  function icmp(u,v) {
    if (u<v) { return -1; }
    if (u>v) { return 1; }
    return 0;
  }

  function _main(argv) {

    let n = 37;

    let a = [],
        b = [],
        _orig = [];

    let n_it = 10;

    let pass = true;

    /*
    let A = [0, 1, 13, 5, 2, 7,  7, 7 ];
    let B = [];
    for (let i=0; i<A.length; i++) { B.push(A[i]); }
    B.sort(icmp);
    console.log("select 7 from", _S(A), _S(B));
    let v_A = k_select_recur(A, 0, A.length, 7);
    console.log(">>>", v_A);
    return;
    */

    /*
    let A = [3,9,7,4,0];
    console.log("select 3 from", A, A.sort(icmp));
    let v_A = k_select_recur(A, 0, A.length, 3);
    console.log(">>>", v_A);
    return;
    */

    for (let n=20; n<45; n++) {

      for (let it=0; it<n_it; it++) {

        _orig = [];
        b = [];

        for (let i=0; i<n; i++) { _orig.push( Math.floor(Math.random()*2*n) ); }
        for (let i=0; i<n; i++) { b.push(_orig[i]); }
        b.sort( (_u,_v) => { if (_u<_v) { return -1; } if (_u>_v) { return 1; } return 0; } );

        for (let k=0; k<n; k++) {
          a = [];
          for (let i=0; i<n; i++) { a.push( _orig[i] ); }

          let v_a = k_select_recur(a, 0, n, k);

          console.log("it:", it, "k:", k, "n:", n, "val_a:", v_a, "val_b:", b[k]);

          if (v_a != b[k]) { pass = false; console.log("NOOOOO", it, k, a, b, _orig); }
        }
      }

      if (pass) { console.log("pass"); }
      else { console.log("FAIL"); }

    }

  }

  _main(process.argv.slice(1));
}


