// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


// Chan's Other Convex Hull Algorithm implemenation
//

var _rnd = Math.random;
var printf = require("printf");

function pnt_cmp(a,b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return  1; }
  return 0;
}

function print_point(P) {
  for (let i=0; i<P.length; i++) {
    console.log(P[i][0], P[i][1], P[i][2]);
  }
}

function cocha_debug_print_t(ctx) {
  for (let t_idx=0; t_idx < ctx._t.length; t_idx++) {

    let t = ctx._t[t_idx];

    for (let i=0; i<ctx.P.length; i++) {
      console.log(ctx.P[i][0], ctx.P[i][2] - t*ctx.P[i][1]);
    }
    console.log("\n\n");

  }
}

function cocha_debug_print(ctx) {
  let foldq = 16;


  for (let i=0; i<ctx.P.length; i++) {
    console.log("#  [" + i.toString() + "] {",
      printf("%0.4f", ctx.P[i][0]),
      printf("%0.4f", ctx.P[i][1]),
      printf("%0.4f", ctx.P[i][2]),
      "} {idx| l:", printf("%3i", ctx.H_nei[i][0]), "r:", printf("%3i", ctx.H_nei[i][1]), "}");
  }

  console.log("#T:", JSON.stringify(ctx.T) );
  console.log("#_t:", JSON.stringify(ctx._t) );

  let qidx = ctx.q_idx;
  for (let qq=0; qq<2; qq++) {
    console.log("#Q[", qidx, "]:")
    for (let i=0; i<ctx.Q[qidx].length; i+=foldq) {

      let a = ctx.Q[qidx].slice(i, i+foldq);
      console.log( "#  " + a.join(",") )
    }
    qidx = 1-qidx;
  }

}

function cocha_json(ctx) {

  console.log("{");
  console.log("  \"p\": [");
  console.log("  \"T\": [");
  console.log("  \"q_idx\": [");
  console.log("  \"Q\": [");
  console.log("  \"H_nei\": [");
  console.log("}");
}

function init_point(N) {
  let P = [];
  for (let i=0; i<N; i++) {
    P.push( [ _rnd(), _rnd(), _rnd() ] );
  }
  return P;
}


//
//      q
//     /
//  p./
//    \
//     \
//      r
//
// p(t) = ( p_x, p_z - t p_y, 0 )
// q(t) = ( q_x, q_z - t q_y, 0 )
// r(t) = ( r_x, r_z - t r_y, 0 )
//
// n(t) = (q-p) X (r-p)
//
// Where `X` is cross product.
// We're concerned when the z component of
// n(t) changes sign:
//
//    n_z(t) = 0
//
// -> ((q_x - p_x)(r_z - p_z) - t(q_x - p_x)(r_y - p_y) -
//    ((rx - pX_x)(q_z - p_z) + t(r_x - p_x)(q_y - p_y) = 0
//
// -> t = (q_x - p_x)(r_z - p_z) - (r_x - p_x)(q_z - p_z)
//        -----------------------------------------------
//        (q_x - p_x)(r_y - p_y) - (r_x - p_x)(q_y - p_y)
//
function _time(p,q,r) {
  let _num = ((q[0] - p[0])*(r[2] - p[2])) - ((r[0] - p[0])*(q[2] - p[2]));
  let _den = ((q[0] - p[0])*(r[1] - p[1])) - ((r[0] - p[0])*(q[1] - p[1]));
  return _num / _den;
}

function _turn(p,q,r) {
  let _den = ((q[0] - p[0])*(r[1] - p[1])) - ((r[0] - p[0])*(q[1] - p[1]));
  return _den;
}

function cocha_idx3(ctx, idx3, idx) {
  if (idx < 0) { idx3[0] = -1; idx3[1] = -1, idx3[2] = -1; return; }

  idx3[0] = ctx.H_nei[idx][0];
  idx3[1] = idx;
  idx3[2] = ctx.H_nei[idx][1];

  return idx3;
}

function cocha_turn3(ctx, idx3) {
  if ((idx3[0] < 0) ||
      (idx3[1] < 0) ||
      (idx3[2] < 0)) { return 1.0; }

  return _turn( ctx.P[idx3[0]], ctx.P[idx3[1]], ctx.P[idx3[2]] );
}

function cocha_time3(ctx, idx3) {
  if ((idx3[0] < 0) ||
      (idx3[1] < 0) ||
      (idx3[2] < 0)) { return ctx.T[1]+1; }

  return _time( ctx.P[idx3[0]], ctx.P[idx3[1]], ctx.P[idx3[2]] );
}

// we can figure out whether it's an insertion or deletion
// by context.
// If the current hull point has it's neighbors pointing
// back to it, we know it needs to be deleted.
// If the current hull point doesn't have it's neighbors
// pointing to it, it's an insertion.
//
function cocha_H_indel(ctx, idx) {

  if (idx < 0) { return -1; }

  let idx_prv = ctx.H_nei[idx][0],
      idx_nxt = ctx.H_nei[idx][1];

  // insert
  //
  if ( (idx_prv >= 0) &&
       (ctx.H_nei[idx_prv][1] != idx) ) {
    ctx.H_nei[idx_prv][1] = idx;
    if (idx_nxt >= 0) { ctx.H_nei[idx_nxt][0] = idx; }
  }

  // delete
  //
  else if ( (idx_nxt >= 0) &&
            (ctx.H_nei[idx_nxt][0] != idx) ) {
    ctx.H_nei[idx_nxt][0] = idx;
    if (idx_prv >= 0) { ctx.H_nei[idx_prv][1] = idx; }
  }

  return 0;
}

// wip (still buggy 2026-02-18)
//
//
// input:
//
// ctx - cocha context
//
//
//
// ctx:
//
// P - point list
// Q - event list, sorted by event time, entries of which are indices into point list P
//     current event list is q_idx
// H_nei - point list with index pointers to neighbors for implicit lower hull
//         0 idx -> -x (left)
//         1 idx -> +x (right)
//         -1 indicates no neighbor
//
//
function cocha_recur(ctx, s_idx, e_idx_ni, q_idx, q_s) {

  let debug = 1;

  let idx_mid = -1,
      idx_u = -1,
      idx_v = -1;
  let t6 = [0,0,0,0,0,0],
      t_prv = 0,
      t_cur = 0;
  let min_idx = -1,
      min_val = 0;
  let _r = -1;

  let idx_u3 = [-1,-1,-1],
      idx_v3 = [-1,-1,-1],
      idx_l3 = [-1,-1,-1],
      idx_r3 = [-1,-1,-1],

      idx_u0u1v1 = [ -1,-1,-1 ],
      idx_u1u2v1 = [ -1,-1,-1 ],

      idx_u1v0v1 = [ -1,-1,-1 ],
      idx_u1v1v2 = [ -1,-1,-1 ];

  let q_l_n = 0,
      q_r_n = 0;

  let n = (e_idx_ni - s_idx);
  let n2 = Math.floor(n/2);
  idx_mid = s_idx + n2;

  let iq_cur = q_idx;
  let iq_nxt = 1-q_idx;

  //DEBUG
  let pfx = printf("#[%2i,%2i]", s_idx, e_idx_ni);
  console.log("#recur[", iq_cur, "]:", "se:[", s_idx, e_idx_ni, "]", "(n:", n, ")")

  if (n==1) {
    ctx.Q[iq_nxt][0] = s_idx;
    ctx.H_nei[s_idx][0] = -1;
    ctx.H_nei[s_idx][1] = -1;
    return 0;
  }

  q_l_n = cocha_recur(ctx, s_idx, idx_mid, iq_nxt, q_s);
  if (q_l_n < 0) { return q_l_n; }

  q_r_n = cocha_recur(ctx, idx_mid, e_idx_ni, iq_nxt, q_s + q_l_n);
  if (q_r_n < 0) { return q_r_n; }

  idx_u = idx_mid-1;
  idx_v = idx_mid;

  //DEBUG
  console.log(pfx, "initial idx_u:", idx_u, "idx_v:", idx_v);

  do {

    cocha_idx3(ctx, idx_u3, idx_u);
    cocha_idx3(ctx, idx_v3, idx_v);

    // move v right
    //
    if (cocha_turn3(ctx, [ idx_u3[1], idx_v3[1], idx_v3[2] ] ) < 0) {
      idx_v = idx_v3[2];
    }

    // move u left
    //
    else if (cocha_turn3(ctx, [ idx_u3[0], idx_u3[1], idx_v3[1] ] ) < 0) {
      idx_u = idx_u3[0];
    }

    else { break; }

  } while (1);

  t_cur = ctx.T[0]-1;
  t_nxt = ctx.T[1]+1;

  //DEBUG
  console.log(pfx, "idx_u:", idx_u, "idx_v:", idx_v, "(idx_mid:", idx_mid, ")",
    "t:", t_cur,
    "Ql:", JSON.stringify( ctx.Q[iq_cur].slice(s_idx, idx_mid) ),
    "Qr:", JSON.stringify( ctx.Q[iq_cur].slice(idx_mid, e_idx_ni) ) );

  let q_n_idx = 0;
  let q_l_idx = s_idx;
  let q_r_idx = idx_mid;
  while (1) {

    cocha_idx3(ctx, idx_u3, idx_u);
    cocha_idx3(ctx, idx_v3, idx_v);
    cocha_idx3(ctx, idx_l3, ctx.Q[iq_cur][q_l_idx]);
    cocha_idx3(ctx, idx_r3, ctx.Q[iq_cur][q_r_idx]);

    t6[0] = cocha_time3(ctx, idx_l3);
    t6[1] = cocha_time3(ctx, idx_r3);

    t6[2] = cocha_time3(ctx, [idx_u3[1], idx_u3[2], idx_v3[1]]);
    t6[3] = cocha_time3(ctx, [idx_u3[0], idx_u3[1], idx_v3[1]]);

    t6[4] = cocha_time3(ctx, [idx_u3[1], idx_v3[0], idx_v3[1]]);
    t6[5] = cocha_time3(ctx, [idx_u3[1], idx_v3[1], idx_v3[2]]);

    t_nxt = ctx.T[1]+1;
    let tm_idx = -1;
    for (let _i=0; _i<6; _i++) {
      if ((t6[_i] > t_cur) &&
          (t6[_i] < t_nxt)) {
        t_nxt = t6[_i];
        tm_idx = _i;
      }
    }


    if (tm_idx == -1) {

      if (debug) { console.log(pfx, "k:", q_n_idx, "no event found, stopping"); }

      break;
    }

    if (debug) {
      console.log(pfx, "T-:", ctx.T[0]-1, "T+:", ctx.T[1]+1);
      console.log(pfx, "k:", q_n_idx, "tidx_event:", tm_idx, "(t6:", JSON.stringify(t6.map( (_) => {return printf("%0.2f",_);} )), ")");
      console.log(pfx, "t6[0]:", t6[0], idx_l3);
      console.log(pfx, "t6[1]:", t6[1], idx_r3);
      console.log(pfx, "t6[2]:", t6[2], [idx_u3[1], idx_u3[2], idx_v3[1]]);
      console.log(pfx, "t6[3]:", t6[3], [idx_u3[0], idx_u3[1], idx_v3[1]]);
      console.log(pfx, "t6[4]:", t6[4], [idx_u3[1], idx_v3[0], idx_v3[1]]);
      console.log(pfx, "t6[5]:", t6[5], [idx_u3[1], idx_v3[1], idx_v3[2]]);

    }

    // event is left of bridge
    //
    if (tm_idx == 0) {
      if (ctx.P[idx_l3[1]][0] < ctx.P[idx_u3[1]][0]) {

        if (debug) { console.log(pfx, "c.0:", ctx.Q[iq_cur][q_l_idx]); }

        ctx.Q[iq_nxt][q_n_idx] = ctx.Q[iq_cur][q_l_idx];
        cocha_H_indel(ctx, ctx.Q[iq_nxt][q_n_idx]);
        q_l_idx++;
      }
    }

    // event is right of bridge
    //
    else if (tm_idx == 1) {
      if (ctx.P[idx_r3[1]][0] > ctx.P[idx_v3[1]][0]) {

        if (debug) { console.log(pfx, "c.1:", ctx.Q[iq_cur][q_l_idx]); }

        ctx.Q[iq_nxt][q_n_idx] = ctx.Q[iq_cur][q_r_idx];
        cocha_H_indel(ctx, ctx.Q[iq_nxt][q_n_idx]);
        q_r_idx++;
      }
    }

    // (u,u^+,v)
    // u <- u^+
    //
    else if (tm_idx == 2) {

      if (debug) { console.log(pfx, "c.2:", idx_u3[2]); }

      ctx.Q[iq_nxt][q_n_idx] = idx_u3[2];
      idx_u = idx_u3[2];
    }

    // (u^-,u,v)
    // u <- u^-
    //
    else if (tm_idx == 3) {

      if (debug) { console.log(pfx, "c.3:", idx_u3[1]); }

      ctx.Q[iq_nxt][q_n_idx] = idx_u3[1];
      idx_u = idx_u3[0];
    }

    // (u,v^-,v)
    // v <- v^-
    //
    else if (tm_idx == 4) {

      if (debug) { console.log(pfx, "c.4:", idx_v3[0]); }

      ctx.Q[iq_nxt][q_n_idx] = idx_v3[0];
      idx_v = idx_v3[0];
    }

    // (u,v,v^+)
    // v <- v^+
    //
    else if (tm_idx == 5) {

      if (debug) { console.log(pfx, "c.5:", idx_v3[1]); }

      ctx.Q[iq_nxt][q_n_idx] = idx_v3[1];
      idx_v = idx_v3[2];
    }

    q_n_idx++;
    t_cur = t_nxt;

  }
  ctx.Q[iq_nxt][q_n_idx] = -1;


  ctx.H_nei[ idx_u ][1] = idx_v;
  ctx.H_nei[ idx_v ][0] = idx_u;

  cocha_idx3( ctx, idx_u3, idx_u );
  cocha_idx3( ctx, idx_v3, idx_v );

  for (let k = (q_n_idx-1); k >= 0; k--) {

    if (debug) {
      console.log(pfx, "rewind: k:", k, "(", q_n_idx, ")", "Q[", iq_nxt, "]:", JSON.stringify(ctx.Q[iq_nxt]) );
    }

    let _idx = ctx.Q[iq_nxt][k];
    let _idx3 = [-1,-1,-1];

    cocha_idx3(ctx, _idx3, _idx);
    cocha_idx3(ctx, idx_u3, idx_u);
    cocha_idx3(ctx, idx_v3, idx_v);

    let _u = ctx.P[idx_u];
    let _v = ctx.P[idx_v];
    let _w_cur = ctx.P[_idx];

    if ((_w_cur[0] > _u[0]) &&
        (_w_cur[0] < _v[0])) {
      ctx.H_nei[ idx_u ][1] = _idx;
      ctx.H_nei[ idx_v ][0] = _idx;

      ctx.H_nei[ _idx ][0] = idx_u;
      ctx.H_nei[ _idx ][1] = idx_v;

      if (_idx < idx_mid) { idx_u = _idx; }
      else                { idx_v = _idx; }
    }
    else {
      cocha_H_indel(ctx, _idx);

      if      (_idx == idx_u) { idx_u = idx_u3[0]; }
      else if (_idx == idx_v) { idx_v = idx_v3[2]; }
    }

  }

  return 0;
}

function cocha_hull(ctx) {
  return cocha_recur(ctx, 0, ctx.P.length,0,0,0);
}


function _xxx() {
  let P = init_point(20);
  P.sort(pnt_cmp);
  print_point(P);
}

function cocha_init(P) {
  let n = P.length;

  P.sort(pnt_cmp);

  let ctx = {
    "P" : P,
    "T" : [0,0],
    "q_idx": 0,
    "Q": [ [], [] ],
    "H_nei" : [],

    "_t" : []
  };

  // time bounds
  //
  for (let i=1; i<(n-1); i++) {
    let t = _time(ctx.P[i-1], ctx.P[i], ctx.P[i+1]);
    if (i==1) {
      ctx.T[0] = t;
      ctx.T[1] = t;
    }
    if (t < ctx.T[0]) { ctx.T[0] = t; }
    if (t > ctx.T[1]) { ctx.T[1] = t; }
  }

  for (let i=0; i<n; i++) {
    ctx.Q[0].push(-1);
    ctx.Q[0].push(-1);
    ctx.Q[1].push(-1);
    ctx.Q[1].push(-1);
    ctx.H_nei.push( [-1,-1] );
  }

  for (let i=1; i<(n-1); i++) {
    ctx._t.push( _time(ctx.P[i-1], ctx.P[i], ctx.P[i+1]) );
  }
  ctx._t.sort( function(a,b) {
    if (a<b) { return -1; }
    if (a>b) { return  1; }
    return 0;
  } );

  return ctx;
}

function spot_test2() {
  let p2 = init_point(2);
  p2.sort(pnt_cmp);
  print_point(p2);
  let ctx_p2 = cocha_init(p2);
  cocha_hull(ctx_p2);
  cocha_debug_print(ctx_p2);
}

function spot_test3() {
  let p3 = init_point(3);
  p3.sort(pnt_cmp);
  print_point(p3);
  let ctx_p3 = cocha_init(p3);
  let r = cocha_hull(ctx_p3);

  console.log(">>>", r);

  cocha_debug_print(ctx_p3);
}

function p_test(p) {

  let ctx = cocha_init(p);
  let r = cocha_hull(ctx);

  cocha_debug_print_t(ctx);
  cocha_debug_print(ctx);

}

function spot_test_n(n) {
  let p = init_point(n);
  p.sort(pnt_cmp);
  print_point(p);
  let ctx_p = cocha_init(p);
  let r = cocha_hull(ctx_p);

  console.log(">>>", r);

  cocha_debug_print(ctx_p);
}

function _main() {
  let p4 = [
    [0.19934746276184268,0.5246896249209678,0.49728295677020107],
    [0.32598849126298624,0.5198095632590565,0.10786006506005597],
    [0.34205050821642347,0.6682797687562593,0.12721906420107543],
    [0.6762058975092623,0.5403964802687037,0.8982490015897476]
  ];

  p_test(p4);
}


//spot_test2();
//spot_test3();
//spot_test_n(4);

_main();



