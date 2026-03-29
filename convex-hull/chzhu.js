#!/usr/bin/env node
//
// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// 2d convex hull  from half plane intersections
// Algorithm by Zhu:
//
// http://zeyuan.allen-zhu.com/paper/2006-thesis.pdf
// https://cp-algorithms.com/geometry/halfplane-intersection.html
//

// See Convex-Hull-Zhu.md for a brief description
//

var _EPS = 1e-9;
var _INF = 1e9;

var njs = require("../lib/numeric.js");
var fasslib = require("../lib/fasslib.js");
var printf = require("../lib/printf.js");


// hp = {
//   p : [x,y],
//   v : [dx,dy],
//   theta : atan2(dy,dx)
// }
//

function _cross2(u,v) { return (u[0]*v[1]) - (u[1]*v[0]); }

function _out_halfplane(hp, p) {
  let dp = njs.sub( p, hp.p );
  let _c = _cross2(hp.v, dp);
  if (_c < -_EPS) { return 1; }
  return 0;
}

function _intersect_halfplane(hp_s, hp_t) {
  let alpha = _cross2( njs.sub(hp_t.p , hp_s.p), hp_t.v ) / _cross2( hp_s.v, hp_t.v );
  return njs.add( hp_s.p, njs.mul( alpha, hp_s.v ) );
}

function _theta_cmp(a,b) {
  if (a.theta < b.theta) { return -1; }
  if (a.theta > b.theta) { return  1; }
  return 0;
}

class _DQ {

  constructor(n) {
    n = ((typeof n === "undefined") ? -1 : n);
    n = ((n<0) ? 2 : n);
    this.size = n;
    this.q = [];
    this.s = 0;
    this.n = 0;
    for (let i=0; i<n; i++) { this.q.push(-1); }
  }

  _grow2() {
    for (let i=0; i<this.size; i++) {
      this.q.push( this.q[i] );
    }
    this.s += this.size;
    this.size *= 2;
    return this.size;
  }

  push_back(v) {
    if (this.n == this.size) { this._grow2(); }
    let idx = (this.s + this.n) % this.size;
    this.q[idx] = v;
    this.n++;
    return v;
  }

  push_front(v) {
    if (this.n == this.size) { this._grow2(); }
    let idx = (this.s + this.size - 1) % this.size;
    this.q[idx] = v;
    this.s = idx;
    this.n++;
  }

  pop_back() {
    if (this.n == 0) { return undefined; }
    let idx = (this.s + this.n-1) % this.size;
    let v = this.q[idx];
    this.n--;
    return v;
  }

  pop_front() {
    if (this.n == 0) { return undefined; }
    let idx = this.s;
    let v = this.q[idx];
    this.s = (idx+1) % this.size;
    this.n--;
    return v;
  }

  peek(pos) {
    if (pos < 0) { pos = this.n + pos; }
    let idx = (this.s + pos) % this.size;
    if ((idx < 0) || (idx >= this.size)) { return undefined; }
    return this.q[idx];
  }

  _debug_string() {
    let q_lines = [ "#dq.size:" + this.size.toString() +
                    ", {s:" +  this.s.toString() +
                    ", n:" +  this.n.toString() + "}" ];

    q_lines.push( "#Q[" + printf("%2i", this.q.length) + "]:" );


    for (let i=0; i<this.size; i++) {
      let pos = ((this.s<=i) ? (i-this.s) : (this.size - this.s + i));

      let _s = ".";

      if (pos >= this.n) {
        q_lines.push(" .");

      }
      else {
        q_lines.push( printf("%2i", this.q[i]) );

        _s = printf("%2i", this.q[i]);
      }

    }

    return q_lines.join(" ");
  }

  _print() {
    console.log(this._debug_string());
  }

}

function _main_dq_spot_test() {
  let dq = new _DQ(20);

  let op_name = [ "push_front", " push_back", " pop_front", "  pop_back" ];

  let n_it = 20;
  for (let it=0; it<n_it; it++) {

    let op = Math.floor( 4*Math.random() );
    let v = Math.floor( 100*Math.random() );
    if      (op == 0) { dq.push_front(v); }
    else if (op == 1) { dq.push_back(v); }
    else if (op == 2) { v = dq.pop_front(); }
    else if (op == 3) { v = dq.pop_back(); }

    let _s = " _";
    if (typeof v !== "undefined") { _s = printf("%2i", v); }

    console.log("[", printf("%2i", it), "/", n_it, "]: op:", op_name[op], "v:", _s, dq._debug_string())
  }

}


function chzhu(H) {

  let L = [];
  L.push( {"p": [ _INF, _INF], "v": [-1, 0], "theta": Math.PI } );
  L.push( {"p": [-_INF, _INF], "v": [ 0,-1], "theta": -Math.PI/2.0 } );
  L.push( {"p": [-_INF,-_INF], "v": [ 1, 0], "theta": 0 });
  L.push( {"p": [ _INF,-_INF], "v": [ 0, 1], "theta": Math.PI/2.0  });
  for (let i=0; i<H.length; i++) { L.push(H[i]); }
  L.sort( _theta_cmp );

  //for (let i=0; i<L.length; i++) { console.log(printf("%2i", i), JSON.stringify(L[i])); }

  let dq_idx = new _DQ(L.length);
  for (let idx=0; idx<L.length; idx++) {

    /*
    console.log("idx:", printf("%2i", idx), dq_idx._debug_string(),
      dq_idx.peek(0), dq_idx.peek(1),
      dq_idx.peek(-1), dq_idx.peek(-2) );

    if (dq_idx.n > 1) {
      console.log("  A:", 
        JSON.stringify(L[ dq_idx.peek(-1) ]), JSON.stringify(L[ dq_idx.peek(-2) ]),
        _intersect_halfplane( L[ dq_idx.peek(-1) ], L[ dq_idx.peek(-2) ] ),
                          _out_halfplane( L[idx], _intersect_halfplane( L[ dq_idx.peek(-1) ], L[ dq_idx.peek(-2) ] ) )) ;
    }
    */

    while ( (dq_idx.n > 1) &&
            (_out_halfplane( L[idx],
                            _intersect_halfplane( L[ dq_idx.peek(-1) ], L[ dq_idx.peek(-2) ] ) )) ) {
      dq_idx.pop_back();
    }

    while ( (dq_idx.n > 1) &&
            (_out_halfplane( L[idx],
                             _intersect_halfplane( L[ dq_idx.peek(0) ], L[ dq_idx.peek(1) ] ) )) ) {
      dq_idx.pop_front();
    }

    if ( (dq_idx.n > 0) &&
         (Math.abs( _cross2( L[idx].v, L[ dq_idx.peek(-1) ].v ) ) < _EPS) ) {
      if (njs.dot( L[idx].v, L[ dq_idx.peek(-1) ].v ) < 0.0) {
        return [];
      }

      if ( _out_halfplane( L[idx], L[ dq_idx.peek(-1) ].p ) ) {
        dq_idx.pop_back();
      }
      else { continue; }
    }

    dq_idx.push_back( idx );

  }


  while ( (dq_idx.n > 2) &&
          ( _out_halfplane( L[ dq_idx.peek(0) ],
                            _intersect_halfplane( L[ dq_idx.peek(-1) ], L[ dq_idx.peek(-2) ] ) ) ) ) {
    dq_idx.pop_back();
  }


  while ( (dq_idx.n > 2) &&
          ( _out_halfplane( L[ dq_idx.peek(-1) ],
                            _intersect_halfplane( L[ dq_idx.peek(0) ], L[ dq_idx.peek(1) ] ) ) ) ) {
    dq_idx.pop_front();
  }

  // empty hull
  //
  if (dq_idx.n < 3) { return []; }

  // fonall collection
  //
  let ch_pnt = [];
  for (let i=0; i < (dq_idx.n - 1); i++) {
    ch_pnt.push( _intersect_halfplane( L[ dq_idx.peek(i) ], L[ dq_idx.peek(i+1) ] ) );
  }
  ch_pnt.push( _intersect_halfplane( L[ dq_idx.peek(-1) ], L[ dq_idx.peek(0) ] ) );

  return ch_pnt;
}



function _main(argv) {

  var fs = require("fs");

  let n = 30;
  let H = [];

  for (let i=0; i<n; i++) {

    let p = njs.mul(2, njs.sub( njs.random([2]), [0.5, 0.5] ) )
    let v = [ -p[1], p[0] ];
    let d = njs.norm2(v);
    v[0] /= d;
    v[1] /= d;

    H.push({
      "p": p,
      "v": v,
      "theta": Math.atan2(v[1], v[0])
    });
  }

  let chp = chzhu(H);

  hp_lines = [];
  for (let i=0; i<H.length; i++) {
    let u0 = njs.add(H[i].p, H[i].v);
    let u1 = njs.add(H[i].p, njs.mul(-1, H[i].v));

    hp_lines.push( printf("%f %f", u0[0], u0[1]) );
    hp_lines.push( printf("%f %f\n\n", u1[0], u1[1]) );

  }
  fs.writeFileSync("hp.gp", hp_lines.join("\n"));


  chp_lines = [];

  //console.log("#chp[", chp.length, "]:");
  chp_lines.push( printf("#chp[%i]", chp.length) );
  for (let i=0; i<chp.length; i++) {
    //console.log(chp[i][0], chp[i][1]);
    chp_lines.push( printf("%f %f", chp[i][0], chp[i][1]) );
  }
  if (chp.length > 0) {
    //console.log(chp[0][0], chp[0][1]);
    chp_lines.push( printf("%f %f", chp[0][0], chp[0][1]) );
  }
  fs.writeFileSync("chp.gp", chp_lines.join("\n"));

}

_main();
