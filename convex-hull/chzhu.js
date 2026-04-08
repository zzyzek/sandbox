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
// We go from a half plane reprsentation to a point representation,
// so the output wil necessary be (2d) points.
//
// Not designed for ergonomic usage but many functions exposed
// for hackability.
//
// Standard usage:
//
// var chzu = require("./chzhu.js");
//
// let H = [];
// ...
// for (let i=0; i<N; i++) {
//   ...
//   H.push({"p": p, "v": v, "theta": theta });
//   ...
// }
//
// let chp = chzhu.hull(H);
//

// See Convex-Hull-Zhu.md for a brief description
//

var _EPS = 1e-9;
var _INF = 1e9;

var njs = require("../lib/numeric.js");
var printf = require("../lib/printf.js");
var avljs = require("../lib/avl.js");


// template of halfplane strcutrue:
//
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

function ochzhu_init(opt) {
  opt = ((typeof opt === "undefined") ? {} : opt);

  let ctx = {
    "debug": 0,
    "empty": false,
    "unbounded": true,
    "INF": _INF,
    "EPS": _EPS,
    "inf_seg_count": 4,
    "T": new avljs.AVLTree()
  };

  if (typeof opt.debug !== "undefined") { ctx.debug = opt.debug; }
  if (typeof opt.EPS !== "undefined") { ctx.EPS = opt.EPS; }
  if (typeof opt.INF !== "undefined") { ctx.INF = opt.INF; }

  let _inf = ctx.INF;

  let sq = [
    [ _inf, _inf ],
    [-_inf, _inf ],
    [-_inf,-_inf ],
    [ _inf,-_inf ]
  ];

  for (let i=0; i<sq.length; i++) {
    let p = sq[i];

    let u = njs.sub( sq[(i+1)%sq.length], sq[i] );
    let ul = njs.norm2(u);
    let v = njs.mul( 1/ul, u );
    let theta = Math.atan2( v[1], v[0] );

    let hp = { "p": p, "v": v, "theta": theta };

    if (ctx.debug) { console.log("#init:", JSON.stringify(hp)); }

    ctx.T.insert( theta, { "p": p, "v": v, "theta": theta } );
  }

  return ctx;
}

//          ____
//       __/    \__  0 < theta < pi
//      /          \
//     v           |
//-----------.-------------
//     ^           |
//      \         /
//       --     --   0 > theta > -pi
//         \___/
//
function ochzhu_add(ctx, hp) {
  if (typeof ctx === "undefined") { ctx = ochzhu_init(); }

  let _inf = ((typeof ctx.INF === "undefined") ? _INF : ctx.INF);
  let _eps = ((typeof ctx.EPS === "undefined") ? _EPS : ctx.EPS);
  let _debug = ((typeof ctx.debug === "undefined") ? 0 : ctx.debug);


  if (_debug) {
    console.log("#hp:", JSON.stringify(hp));
    console.log("#T:\n", ctx.T.toString());
  }


  if (ctx.empty) { return ctx; }

  if (ctx.T.size < 2) {

    if (_debug) { console.log("# T.size < 2 (", ctx.T.size, "), inserting", JSON.stringify(hp)); }

    ctx.T.insert( hp.theta, hp );
    return ctx;
  }


  while (ctx.T.size > 1) {
    let nod_lt = ctx.T.below(hp.theta);
    if (nod_lt == null) { nod_lt = ctx.T.maxNode(); }

    let nod_m2 = ctx.T.prev(nod_lt);
    if (nod_m2 == null) { nod_m2 = ctx.T.maxNode(); }

    let c2 = _cross2( nod_lt.data.v, nod_m2.data.v );

    if (_debug) {
      console.log("## lt:", nod_lt.data.theta, "m2:", nod_m2.data.theta, "hp:", hp.theta, "cross:", c2);
      console.log("## _int(lt,m2):", _intersect_halfplane( nod_lt.data, nod_m2.data ) );
    }

    if (_out_halfplane( hp,
                        _intersect_halfplane( nod_lt.data, nod_m2.data ) ) ){

      if (_debug) { console.log("#lt.rem:", nod_lt.key); }

      if ((nod_lt.data.p[0] == _inf) || (nod_lt.data.p[0] == -_inf) ||
          (nod_lt.data.p[1] == _inf) || (nod_lt.data.p[1] == -_inf)) {
        ctx.inf_seg_count--;
        if (ctx.inf_seg_count==0) { ctx.unbounded = false; }
      }

      ctx.T.remove( nod_lt.key );
      continue;
    }

    break;
  }

  if (_debug) { console.log("#cp.1"); }

  while (ctx.T.size > 1) {
    let nod_gt = ctx.T.above(hp.theta);
    if (nod_gt == null) { nod_gt = ctx.T.minNode(); }

    let nod_p2 = ctx.T.next(nod_gt);
    if (nod_p2 == null) { nod_p2 = ctx.T.minNode(); }

    let c2 = _cross2( nod_gt.data.v, nod_p2.data.v );

    if (_debug) {
      console.log("## gt:", nod_gt.data.theta, "p2:", nod_p2.data.theta, "hp:", hp.theta, "cross:", c2);
      console.log("## _int(gt,p2):", _intersect_halfplane( nod_gt.data, nod_p2.data ) );
    }

    if (_out_halfplane( hp,
                        _intersect_halfplane( nod_gt.data, nod_p2.data ) ) ){

      if (_debug) { console.log("#gt.rem:", nod_gt.key); }

      if ((nod_gt.data.p[0] == _inf) || (nod_gt.data.p[0] == -_inf) ||
          (nod_gt.data.p[1] == _inf) || (nod_gt.data.p[1] == -_inf)) {
        ctx.inf_seg_count--;
        if (ctx.inf_seg_count==0) { ctx.unbounded = false; }
      }

      ctx.T.remove( nod_gt.key );
      continue;
    }

    break;
  }

  if (_debug) { console.log("#cp.2"); }

  if (ctx.T.size < 2) {

    if (_debug) { console.log("#T.sz<2 (", ctx.T.size, "), insert:", JSON.stringify(hp)); }

    ctx.T.insert( hp.theta, hp );
    return ctx;
  }


  if (_debug) { console.log("#cp.3"); }

  if (ctx.T.size > 0) {

    let nod_eq = ctx.T.find(hp.theta);
    if (nod_eq != null) {

      if (_debug) { console.log("#cp.nod_eq"); }

      let hp_eq = nod_eq.data;

      // half plane creates empty space
      //
      if (njs.dot( hp.v, hp_eq.v ) < 0.0) {

        if (_debug) { console.log("#cp.nod_eq.empty"); }

        ctx.empty = true;
        return ctx;
      }

      // remove the redundant half plane (on wrong
      // side of current hp)
      // hp will be added below
      //
      if ( _out_halfplane(hp, hp_eq.p) ) {

        if (_debug) { console.log("#cp.nod_eq.rem"); }

        if ((hp_eq.p[0] == _inf) || (hp_eq.p[0] == -_inf) ||
            (hp_eq.p[1] == _inf) || (hp_eq.p[1] == -_inf)) {
          ctx.inf_seg_count--;
          if (ctx.inf_seg_count==0) { ctx.unbounded = false; }
        }

        ctx.T.remove( hp_eq.theta );
      }

      // parallel and outside of the convex hull, ignore hp
      //
      else {

        if (_debug) { console.log("#cp.nod_eq.ignore"); }

        return ctx;
      }

      if (_debug) { console.log("#cp.nod_eq.continue"); }


    }

  }

  let nod_gt = ctx.T.above(hp.theta);
  if (nod_gt == null) { nod_gt = ctx.T.minNode(); }
  let hp_gt = nod_gt.data;

  let nod_lt = ctx.T.below(hp.theta);
  if (nod_lt == null) { nod_lt = ctx.T.maxNode(); }
  let hp_lt = nod_lt.data;

  if (_debug) {
    console.log("# hp.theta:", hp.theta, "gt.theta:", hp_gt.theta, "lt.theta:", hp_lt.theta);
    console.log("#??? cross2:", _cross2( hp.v, hp_gt.v ), _cross2( hp.v, hp_lt.v ));
  }

  if ((ctx.T.size > 0) &&
      ( (Math.abs( _cross2( hp.v, hp_gt.v ) ) < _EPS) ||
        (Math.abs( _cross2( hp.v, hp_lt.v ) ) < _EPS) ) ) {

    if (_debug) { console.log("# xxx"); }

    if ((njs.dot( hp.v, hp_lt.v ) < 0.0) ||
        (njs.dot( hp.v, hp_gt.v ) < 0.0)) {

      if (_debug) { console.log("# parallel, EMPTY"); }

      ctx.empty = true;
      return ctx;
    }

    if ( _out_halfplane(hp, hp_lt.p) ) {

      if (_debug) { console.log("# parallel, remove hp_lt (", hp_lt.theta, ")"); }

      if ((hp_lt.p[0] == _inf) || (hp_lt.p[0] == -_inf) ||
          (hp_lt.p[1] == _inf) || (hp_lt.p[1] == -_inf)) {
        ctx.inf_seg_count--;
        if (ctx.inf_seg_count==0) { ctx.unbounded = false; }
      }

      ctx.T.remove( hp_lt.theta );
    }
    else if ( _out_halfplane(hp, hp_gt.p) ) {

      if (_debug) { console.log("# parallel, remove hp_gt (", hp_gt.theta, ")"); }

      if ((hp_gt.p[0] == _inf) || (hp_gt.p[0] == -_inf) ||
          (hp_gt.p[1] == _inf) || (hp_gt.p[1] == -_inf)) {
        ctx.inf_seg_count--;
        if (ctx.inf_seg_count==0) { ctx.unbounded = false; }
      }

      ctx.T.remove( hp_gt.theta );
    }
    else {

      if (_debug) { console.log("# parallel, ignore"); }

      return ctx;
    }

  }

  let cross_gtlt = _cross2( hp_gt.v, hp_lt.v );

  // special case where hp_gt, hp_lt are parallel,
  // add hp
  //
  if (Math.abs(cross_gtlt) < _EPS) {

    if (_debug) { console.log("#hp.insert. (|cross_gtlt| == 0)"); }

    ctx.T.insert( hp.theta, hp );
    return ctx;
  }

  if (_debug) {
    console.log("## cross_gtlt:", cross_gtlt);
    console.log("## _int(gt:", hp_gt.theta, "lt:", hp_lt.theta, "):",
                        _intersect_halfplane( hp_gt, hp_lt ),
      "out:", _out_halfplane( hp,
                        _intersect_halfplane( hp_gt, hp_lt ) ) );
  }

  // Find intersection point of neighboring (left/right)
  // halfplanes, hp_lt, hp_gt, call it pnt_nei.
  // The average of the plane normals for hp_lt, hp_gt,
  // call it N_nei, will be in the direction of the interior of the hull.
  // If (pnt_nei - hp.p) is the same direction N_nei,
  // hp must be wholly behind the intersection point,
  // so we can discard it.
  //
  //

  let pnt_nei = _intersect_halfplane( hp_lt, hp_gt );
  let n_lt = [ -hp_lt.v[1], hp_lt.v[0] ];
  let n_gt = [ -hp_gt.v[1], hp_gt.v[0] ];
  let n_nei = njs.mul( 0.5, njs.add( n_lt, n_gt ) );

  let n_hp  = [-hp.v[1], hp.v[0] ];
  let n_mhp = [ hp.v[1],-hp.v[0] ];

  let pnt_hp = _intersect_halfplane( {"p": pnt_nei, "v": n_mhp, "theta": 0 },
                                     hp );

  if (_debug) {
    console.log("## pnt_nei:", JSON.stringify(pnt_nei));
    console.log("## pnt_hp:", JSON.stringify(pnt_hp));
    console.log("##", "n_lt:", JSON.stringify(n_lt), "n_gt:", JSON.stringify(n_gt));
    console.log("##", "n_nei:", JSON.stringify(n_nei) );
    console.log("##", "pnt_nei-hp.p:", JSON.stringify(njs.sub(pnt_nei,hp.p)));
    console.log("##", "pnt_nei-pnt_hp:", JSON.stringify(njs.sub(pnt_nei,pnt_hp)));
    console.log("##", "dot(n_nei, pnt_nei-hp.p):", njs.dot( n_nei, njs.sub( pnt_nei, hp.p ) ) );
    console.log("##", "dot(n_nei, pnt_nei-npt_hp):", njs.dot( n_nei, njs.sub( pnt_nei, pnt_hp ) ) );
  }

  if (njs.dot( n_nei, njs.sub( pnt_nei, pnt_hp ) ) < -_EPS) {
    if (_debug) { console.log("#hp.insert:", JSON.stringify(hp)); }
    ctx.T.insert( hp.theta, hp );
  }


  /*
  if (_out_halfplane( hp,
                      _intersect_halfplane( hp_gt, hp_lt ) )) {
    console.log("#hp.insert:", JSON.stringify(hp));
    ctx.T.insert( hp.theta, hp );
  }
  */

  if (_debug) {
    console.log("#T.fin:\n", ctx.T.toString());
    console.log("#cp.4\n\n");
  }

  return ctx;
}

function ochzhu_hull(ctx) {

  // empty hull
  //
  if (ctx.T.size < 3) { return []; }

  // fonall collection
  //
  let nod = ctx.T.minNode();

  let ch_pnt = [];
  while (nod != null) {
    let nod_nxt = ctx.T.next(nod);
    if (nod_nxt == null) { nod_nxt = ctx.T.minNode(); }

    let _pnt = _intersect_halfplane( nod.data, nod_nxt.data );

    if (ch_pnt.length > 0) {
      if (njs.norm2( njs.sub(_pnt, ch_pnt[ ch_pnt.length-1 ]) ) > _EPS) {
        ch_pnt.push( _pnt );
      }
    }
    else {
      ch_pnt.push( _pnt );
    }

    nod = ctx.T.next(nod);
  }

  let _pnt = _intersect_halfplane( ctx.T.minNode().data, ctx.T.maxNode().data );
  if (ch_pnt.length > 0) {

    if ((njs.norm2( njs.sub(_pnt, ch_pnt[0]) ) > _EPS) &&
        (njs.norm2( njs.sub(_pnt, ch_pnt[ch_pnt.length-1]) ) > _EPS)) {
      ch_pnt.push( _pnt );
    }
  }

  //if (ch_pnt.length < 3) { return []; }

  return ch_pnt;
}


// 'offline' algorithm of Zhu's 2d half plane intersection.
// return points on convex hull.
//
// Note:
//
// * does not deduplicate points
// * does not check for pathological cases
//   - could degrade to two (unique) points
//   - could have infinite box as point
//
// caller will need to check these conditions if desired
//
function chzhu(H, opt) {
  opt = ((typeof opt === "undefined") ? { "debug": 0, "INF": _INF, "EPS": _EPS } : opt);
  let _inf = ((typeof opt.INF === "undefined") ? _INF : opt.INF );
  let _eps = ((typeof opt.EPS === "undefined") ? _EPS : opt.EPS );
  let _debug = ((typeof opt.debug === "undefined") ? 0 : opt.debug );

  let L = [];
  L.push( {"p": [ _inf, _inf], "v": [-1, 0], "theta": Math.PI } );
  L.push( {"p": [-_inf, _inf], "v": [ 0,-1], "theta": -Math.PI/2.0 } );
  L.push( {"p": [-_inf,-_inf], "v": [ 1, 0], "theta": 0 });
  L.push( {"p": [ _inf,-_inf], "v": [ 0, 1], "theta": Math.PI/2.0  });
  for (let i=0; i<H.length; i++) { L.push(H[i]); }
  L.sort( _theta_cmp );

  let dq_idx = new _DQ(L.length);
  for (let idx=0; idx<L.length; idx++) {

    if (_debug) {
      console.log("\n#chzu, theta:", L[idx].theta, printf("[%f,%f]", L[idx].p[0], L[idx].p[1]), "dq.n:", dq_idx.n);
      if (dq_idx.n>1) {
        console.log("#chzhu, -1,-2, cross:", _cross2(L[dq_idx.peek(-1)].v, L[dq_idx.peek(-2)].v),
          L[dq_idx.peek(-1)].v, L[dq_idx.peek(-2)].v);
      }
    }

    while ( (dq_idx.n > 1) &&
            (_out_halfplane( L[idx],
                            _intersect_halfplane( L[ dq_idx.peek(-1) ], L[ dq_idx.peek(-2) ] ) )) ) {

      if (_debug > 1) { console.log("#chzu.pop_back"); }

      dq_idx.pop_back();
    }

    if (_debug > 1) {
      if (dq_idx.n>1) {
        console.log("#chzhu, 0,1, cross:", _cross2(L[dq_idx.peek(0)].v, L[dq_idx.peek(1)].v),
          L[dq_idx.peek(0)].v, L[dq_idx.peek(1)].v);
      }
    }

    while ( (dq_idx.n > 1) &&
            (_out_halfplane( L[idx],
                             _intersect_halfplane( L[ dq_idx.peek(0) ], L[ dq_idx.peek(1) ] ) )) ) {

      if (_debug > 1) { console.log("#chzu.pop_front"); }

      dq_idx.pop_front();
    }

    if ( (dq_idx.n > 0) &&
         (Math.abs( _cross2( L[idx].v, L[ dq_idx.peek(-1) ].v ) ) < _eps) ) {

      if (_debug > 1) { console.log("#chzhu cp.a"); }

      if (njs.dot( L[idx].v, L[ dq_idx.peek(-1) ].v ) < 0.0) {

        if (_debug > 1) { console.log("#chzhu cp.b"); }

        return [];
      }

      if ( _out_halfplane( L[idx], L[ dq_idx.peek(-1) ].p ) ) {

        if (_debug > 1) { console.log("#chzhu cp.c"); }

        dq_idx.pop_back();
      }
      else {
 
        if (_debug > 1) { console.log("#chzhu cp.d"); }

        continue;
      }
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

//---------------------
//               _    
//   __ _  ___ _(_)__ 
//  /  ' \/ _ `/ / _ \
// /_/_/_/\_,_/_/_//_/
//                    
//---------------------


if (typeof module !== "undefined") {
  module.exports["hull"] = chzhu;
  module.exports["_cross2"] = _cross2;
  module.exports["_out_halfplane"] = _out_halfplane;
  module.exports["_intersect_halfplane"] = _intersect_halfplane;
  module.exports["dequeue"] = _DQ;

  module.exports["EPS"] = function(_e) { if (typeof _e !== "undefined") { _EPS = _e; } return _EPS; };
  module.exports["INF"] = function(_i) { if (typeof _i !== "undefined") { _INF = _i; } return _INF; };
}

if ((typeof require !== "undefined") &&
    (require.main === module)) {

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

  function _show_help() {
    console.log("");
    console.log("Zhu's 2d convex hull from half plane intersections usage:");
    console.log("");
    console.log("  chzhu.js [op] [val]");
    console.log("");
    console.log("  op:      (offline|online)\.(stdout|gnuplot)\.(stdin|random)");
    console.log("  val:     number of vertices (default 30)");
    console.log("");
    console.log(" gnuplot output will be to hp.gp and chp.gp output files");
    console.log("");
  }

  function _read_halfplanes(fn) {
    let _debug = 0;
    var fs = require("fs");

    let H = [];

    let TXT = fs.readFileSync(fn, 'utf8');
    let lines = TXT.split("\n");

    let pq_a = [];
    let _p = [0,0],
        _q = [0,0];
    let _state_idx = 0;

    for (let line_no=0; line_no<lines.length; line_no++) {

      let line = lines[line_no].trim();
      if (line.length == 0) {
        _state_idx = 0;
        continue; 
      }
      if (line[0] == '#') { continue; }

      let tok = line.split(" ");
      if (tok.length < 2) {
        console.log("#WARNING: line_no:", line_no, "mangled line, ignoring");
        continue;
      }

      let x = parseFloat(tok[0]);
      let y = parseFloat(tok[1]);

      if (_state_idx==0) {
        _p[0] = x;
        _p[1] = y;
        _state_idx++;
      }
      else if (_state_idx == 1) {
        _q[0] = x;
        _q[1] = y;
        pq_a.push( [[_p[0],_p[1]],[_q[0], _q[1]]] );
        _state_idx++;
      }
      else {
        console.log("#WARNING: line_no:", line_no, "runaway line");
      }


    }

    for (let i=0; i<pq_a.length; i++) {
      
      if (_debug) { console.log(pq_a[i][0], pq_a[i][1]); }

      let _p = [ pq_a[i][0][0], pq_a[i][0][1] ];
      let _v = njs.sub( pq_a[i][1], pq_a[i][0] );
      _v = njs.mul( 1/njs.norm2(_v), _v );
      let _theta = Math.atan2( _v[1], _v[0] );
      let hp = {
        "p": _p,
        "v": _v,
        "theta": _theta
      };

      H.push(hp);
    }

    return H;
  }

  function _rand_halfplanes(n) {
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
    return H;
  }

  function _main(argv) {
    var fs = require("fs");

    let _debug = 0;

    let op = "",
        op_val = 20;

    if (argv.length > 1) {
      op = argv[1];
      if (argv.length > 2) {
        op_val = parseInt(argv[2]);
      }
    }

    let op_tok = op.split(".");
    if (op_tok.length < 2) { op_tok.push("gnuplot"); }
    if (op_tok.length < 3) { op_tok.push(""); }

    if (op == "") {
      _show_help();
      return;
    }

    else if (op == "help") {
      _show_help();
      return;
    }

    else if (op_tok[0] == 'offline') {

      let n = op_val;
      let H = [];

      if (op_tok[2] == 'stdin') { H = _read_halfplanes('/dev/stdin'); }
      else                      { H = _rand_halfplanes(n); }

      let chp = chzhu(H);

      hp_lines = [ printf("#offline: line segments of halfplane[%i]:", H.length) ];
      for (let i=0; i<H.length; i++) {
        let u0 = njs.add(H[i].p, H[i].v);
        let u1 = njs.add(H[i].p, njs.mul(-1, H[i].v));
        hp_lines.push( printf("%f %f", u0[0], u0[1]) );
        hp_lines.push( printf("%f %f\n\n", u1[0], u1[1]) );
      }
      if (op_tok[1] == "gnuplot") { fs.writeFileSync("hp.gp", hp_lines.join("\n")); }
      else                        { console.log(hp_lines.join("\n")); }

      chp_lines = [];
      chp_lines.push( printf("#chp[%i]", chp.length) );
      for (let i=0; i<chp.length; i++) { chp_lines.push( printf("%f %f", chp[i][0], chp[i][1]) ); }
      if (chp.length > 0) { chp_lines.push( printf("%f %f", chp[0][0], chp[0][1]) ); }

      if (op_tok[1] == "gnuplot") { fs.writeFileSync("chp.gp", chp_lines.join("\n")); }
      else                        { console.log(chp_lines.join("\n")); }

    }

    else if (op_tok[0] == 'online') {
      let n = op_val;
      let H = [];

      if (op_tok[2] == "random")      { H = _random_halfplanes(n); }
      else if (op_tok[2] == 'stdin')  { H = _read_halfplanes('/dev/stdin'); }

      else {

        let H_sched = [
          {"p":[-0.2712908839240762,-0.5300671866627775],"v":[0.8901843350216208,-0.45560053740323336],"theta":-0.4730467191564198},
          {"p":[0.6466875590795107,0.4432999732622438],"v":[-0.5654043581563023,0.8248138649282395],"theta":2.1717197397540717},
          {"p":[-0.6576288327302611,-0.5569733802202501],"v":[0.6462925964436723,-0.7630896931436675],"theta":-0.8680803576380286},
          {"p":[-0.9414089710751159,0.46026245649457254],"v":[-0.4392240500010806,-0.8983775564319538],"theta":-2.0255310939256743},
          {"p":[0.9326585310356279,0.1901386135728127],"v":[-0.199758429448323,0.9798451764765387],"theta":1.7719077018746798},
          {"p":[-0.4548544330322657,0.07659409100163739],"v":[-0.16605466541083322,-0.9861165489409942],"theta":-1.7376237559723076},
          {"p":[0.11730742983199738,0.6204161675529414],"v":[-0.9825900849900963,0.18578677261623144],"theta":2.954720138816385},
          {"p":[0.3614520398069989,0.23257848404733217],"v":[-0.5411138872468009,0.8409493213200523],"theta":2.142557431906785},
          {"p":[0.28252778058285655,-0.15546909012252907],"v":[0.48210637068851797,0.876112691005869],"theta":1.0677389769028265},

          {"p":[-0.2233916978787227,0.07483679209117255],"v":[-0.31765191070497284,-0.948207394838007],"theta":-1.894048437845164},
          {"p":[0.21927101693356477,0.3972991333917233],"v":[-0.8755110362450986,0.4831981223194411],"theta":2.637288744322482},
          {"p":[-0.08167108413193613,-0.40047445663743053],"v":[0.9798320421095956,-0.19982284467832923],"theta":-0.201177115732756},
          {"p":[0.4670400101928385,-0.9521204837711332],"v":[0.8978035642307697,0.4403961399178315],"theta":0.45603985795586527},
          {"p":[-0.5223141494222538,-0.6670871754336063],"v":[0.7873641010934739,-0.616488258046547],"theta":-0.6642747486658663},
          {"p":[-0.06955206513877643,-0.5895037323243191],"v":[0.9931117086970241,-0.1171713875008616],"theta":-0.11744116786086746},
          {"p":[0.4558756618069517,0.6397303514577328],"v":[-0.8143799739950255,0.5803320238931001],"theta":2.5224563206677693},
          {"p":[-0.22306979214705036,0.27857822930962284],"v":[-0.7805855068966966,-0.6250490112165822],"theta":-2.466398334469599},
          {"p":[0.8398727325983981,-0.9442959353503029],"v":[0.7472133903209499,0.6645841928040958],"theta":0.726937203018892},
          {"p":[0.91509070747564,0.031241520651549948],"v":[-0.034120474948360714,0.9994177270737689],"theta":1.6049234257623421},

          {"p":[0.47019383065929565,0.15879318355802408],"v":[-0.3199645338022077,0.9474295209189632],"theta":1.8964883797250642},
          {"p":[-0.7224526446114972,-0.21708672094043013],"v":[0.2877746431157286,-0.9576981543156564],"theta":-1.2788939545592999},
          {"p":[0.5998725244416443,-0.33002613257217783],"v":[0.4820266704198972,0.8761565436632359],"theta":1.0678299449652555},
          {"p":[-0.06549896643669362,0.6805356275969738],"v":[-0.9954002668124983,-0.09580349069635927],"theta":-3.045642001932132},
          {"p":[0.7056415526418522,0.016521247669492478],"v":[-0.023406673289250318,0.9997260262919688],"theta":1.5942051379227915},
          {"p":[-0.11864927726526986,-0.0771829650553526],"v":[0.5452909508104947,-0.8382468484665997],"theta":-0.9940601567999274},
          {"p":[-0.04757477905926688,0.7562749143811702],"v":[-0.9980272250469809,-0.06278262550278439],"theta":-3.078768710150415},
          {"p":[0.9374891186094225,0.6417468292638944],"v":[-0.5648679024310825,0.8251813454042142],"theta":2.1710694885255126},
          {"p":[-0.006484917618307495,0.5033683531989253],"v":[-0.9999170238923661,-0.012881976953610055],"theta":-3.128710320325588},
          {"p":[0.1323772365552971,0.3805239349040188],"v":[-0.944480556763468,0.328567311057825],"theta":2.8068063862293022},
          {"p":[0.8169278493230072,0.5576987035093084],"v":[-0.5638215158058107,0.8258966632178859],"theta":2.1698019693898773}
        ];

        H_sched = [
         {"p":[0.6278943151579064,0.2913077970693969],"v":[-0.4208562777102188,0.9071273303742421],"theta":2.005185384742233},
         {"p":[-0.4681725631043392,-0.19991658302619175],"v":[0.39270947472241796,-0.9196625840291875],"theta":-1.1672204189877315},
         {"p":[0.02542942583782226,-0.05253139581511812],"v":[0.9000852844785805,0.4357137600135126],"theta":0.45083111624615557},
         {"p":[-0.11156978898276027,0.13865337867528948],"v":[-0.7790920180254294,-0.6269095847481232],"theta":-2.4640124917306476},
         {"p":[0.30160754406027124,-0.14554511257382696],"v":[0.43460732103611843,0.9006200511324453],"theta":1.1211941054892616},
         {"p":[-0.1357904272366377,-0.22658689950726885],"v":[0.8577628850029749,-0.5140455554825595],"theta":-0.5398945640694456},
         {"p":[-0.5137785135862876,0.8208679905635261],"v":[-0.8476565372937176,-0.530545374858008],"theta":-2.5823488263767116},
         {"p":[0.00402002940451629,0.05505259348569069],"v":[-0.9973445365186319,0.07282771091030771],"theta":3.0687004103534026},
         {"p":[0.22429431790927223,0.14209880467393665],"v":[-0.5351750166829116,0.8447412038716031],"theta":2.1355112441236166},
         {"p":[-0.37458932762958286,0.3799230439060488],"v":[-0.7120875910392439,-0.7020906370889206],"theta":-2.3632634629948863}
        ];

        H = H_sched;
      }

      if (_debug) {
        console.log("let H = [");
        for (let i=0; i<H.length; i++) {
          console.log("      ", JSON.stringify(H[i]), ",");
        }
        console.log("];");
      }


      hp_lines = [ printf("#online: line segments of halfplane[%i]:", H.length) ];
      for (let i=0; i<H.length; i++) {
        let u0 = njs.add(H[i].p, H[i].v);
        let u1 = njs.add(H[i].p, njs.mul(-1, H[i].v));
        hp_lines.push( printf("%f %f", u0[0], u0[1]) );
        hp_lines.push( printf("%f %f\n\n", u1[0], u1[1]) );

      }
      if (op_tok[1] == "gnuplot") { fs.writeFileSync("o_hp.gp", hp_lines.join("\n")); }
      else { console.log(hp_lines.join("\n")); }

      let ochz = ochzhu_init();
      for (let i=0; i<H.length; i++) {


        ochzhu_add(ochz, H[i]);

        if (_debug > 1) {
          let chp = ochzhu_hull(ochz);

          chp_lines = [];
          chp_lines.push( printf("#chp[%i]", chp.length) );
          for (let i=0; i<chp.length; i++) { chp_lines.push( printf("%f %f", chp[i][0], chp[i][1]) ); }
          if (chp.length > 0) { chp_lines.push( printf("%f %f", chp[0][0], chp[0][1]) ); }

          if (op_tok[1] == "gnuplot") { fs.writeFileSync("o_chp." + i.toString() + ".gp", chp_lines.join("\n")); }
          else { console.log(chp_lines.join("\n")); }
        }


      }

      if (_debug) { console.log("## empty:", ochz.empty); }

      let chp = ochzhu_hull(ochz);

      if (_debug) {
        for (let i=0; i<chp.length; i++) {
          console.log("#[", i, "]:", JSON.stringify(chp[i]));
        }
      }


      chp_lines = [];
      chp_lines.push( printf("#chp[%i] (empty:%i,unbounded:%i,_m:%i)", chp.length, ochz.empty ? 1 : 0, ochz.unbounded ? 1 : 0, ochz.inf_seg_count) );
      for (let i=0; i<chp.length; i++) { chp_lines.push( printf("%f %f", chp[i][0], chp[i][1]) ); }
      if (chp.length > 0) { chp_lines.push( printf("%f %f", chp[0][0], chp[0][1]) ); }

      if (op_tok[1] == "gnuplot") { fs.writeFileSync("o_chp.gp", chp_lines.join("\n")); }
      else { console.log(chp_lines.join("\n")); }


      /*
      chp = chzhu(H);
      chp_lines = [];
      chp_lines.push( printf("#chp[%i]", chp.length) );
      for (let i=0; i<chp.length; i++) { chp_lines.push( printf("%f %f", chp[i][0], chp[i][1]) ); }
      if (chp.length > 0) { chp_lines.push( printf("%f %f", chp[0][0], chp[0][1]) ); }
      if (op_tok[1] == "gnuplot") { fs.writeFileSync("c_chp.gp", chp_lines.join("\n")); }
      else { console.log(chp_lines.join("\n")); }
      for (let i=0; i<chp.length; i++) { console.log("#chzu[", i, "]:", chp[i][0], chp[i][1]); }
      */

    }

  }

  _main(process.argv.slice(1));
}
