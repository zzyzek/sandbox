#!/usr/bin/node
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


// Chan's (Other) Convex Hull Algorithm implemenation
//

var COCHA_VERSION = "0.2.0";


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

  console.log("#T:", JSON.stringify(ctx.T), "{", ctx.T_BEG, ctx.T_END, "}" );
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
  for (let i=0; i<ctx.P.length; i++) {
    console.log("   ", JSON.stringify(ctx.P[i]), (i<(ctx.P.length-1)) ? "," : "" );
  }
  console.log("  ],");
  console.log("  \"T_BEG\":", ctx.T_BEG, ", \"T_END\":", ctx.T_END, ",");
  console.log("  \"q_idx\":", ctx.q_idx, ",");
  console.log("  \"Q\": [");
  console.log("   ", JSON.stringify(ctx.Q[0]), ",");
  console.log("   ", JSON.stringify(ctx.Q[1]) );
  console.log("  ],");
  console.log("  \"H_nei\": [");
  for (let i=0; i<ctx.P.length; i++) {
    console.log("   ", JSON.stringify(ctx.H_nei[i]), (i<(ctx.P.length-1)) ? "," : "" );
  }
  console.log("  ]");
  console.log("}");
}

function rand_point(N) {
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
      (idx3[2] < 0)) { return ctx.T_END; }

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
  if ( (idx_prv < 0) ||
       (ctx.H_nei[idx_prv][1] != idx) ) {
    if (idx_prv >= 0) { ctx.H_nei[idx_prv][1] = idx; }
    if (idx_nxt >= 0) { ctx.H_nei[idx_nxt][0] = idx; }
  }

  // delete
  //
  else {
    if (idx_nxt >= 0) { ctx.H_nei[idx_nxt][0] = ctx.H_nei[idx][0]; }
    if (idx_prv >= 0) { ctx.H_nei[idx_prv][1] = ctx.H_nei[idx][1]; }
  }

  return 0;
}

//
// input:
//
// ctx      : cocha context
// s_idx    : start index of point list (P)
// e_idx_ni : end index (non-inclusive) of point list (P)
// q_idx    : which index (0,1) the current event list is (e.g. ctx.Q[q_idx])
// q_s      : start position of current event list (e.g. ctx.Q[q_idx][q_s:...])
//
// return:
//
// >=0      : number of events in event list (q_idx_cur)
// -1       : error
//
//
// ctx:
//
// P : point list
// Q : event list, sorted by event time, entries of which are indices into point list P
//     current event list is q_idx_cur, starting at q_s,
//     uses 1-q_idx_cur as backbuffer event queue
// H_nei : point list with index pointers to neighbors for implicit lower hull
//         0 idx -> -x (left)
//         1 idx -> +x (right)
//         -1 indicates no neighbor
// T_BEG : -INF
// T_END :  INF
//
//
// cocha_lower_hull_3d_recur only computes the lower hull, so needs to be called twice (for example,
// with z negated in second call).
//
//
function cocha_lower_hull_3d_recur(ctx, s_idx, e_idx_ni, q_idx_cur, q_s) {
  let debug = ctx._debug;

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

  // iq_cur is the the current event queue we're pushing new events into
  // iq_tmp is the 'temporary' event queue that we use for the recursive
  //        partitions
  //
  let iq_cur = q_idx_cur;
  let iq_tmp = 1-iq_cur;

  //DEBUG
  let pfx = printf("#[%2i,%2i]", s_idx, e_idx_ni);
  if (debug) {
    console.log(pfx, "q_idx:", q_idx_cur, "q_s:", q_s, "{", s_idx, idx_mid, e_idx_ni, "}");
  }

  if (n==1) {
    ctx.Q[iq_cur][q_s] = s_idx;
    ctx.H_nei[s_idx][0] = -1;
    ctx.H_nei[s_idx][1] = -1;
    return 1;
  }

  q_l_n = cocha_lower_hull_3d_recur(ctx, s_idx, idx_mid, iq_tmp, q_s);
  if (q_l_n < 0) { return q_l_n; }

  q_r_n = cocha_lower_hull_3d_recur(ctx, idx_mid, e_idx_ni, iq_tmp, q_s + q_l_n);
  if (q_r_n < 0) { return q_r_n; }

  idx_u = idx_mid-1;
  idx_v = idx_mid;

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

  t_cur = ctx.T_BEG;
  t_nxt = ctx.T_END;

  if (debug) {
    console.log("");
    console.log(pfx, "idx_u:", idx_u, "idx_v:", idx_v, "(idx_mid:", idx_mid, ")",
      "t:", t_cur,
      "Ql" + printf("[%i][%i:%i]", iq_tmp, q_s, q_s+q_l_n) + ":", JSON.stringify( ctx.Q[iq_tmp].slice(q_s, q_s+q_l_n) ),
      "Qr" + printf("[%i][%i:%i]", iq_tmp, q_s+q_l_n, q_s+q_l_n+q_r_n) + ":", JSON.stringify( ctx.Q[iq_tmp].slice(q_s+q_l_n, q_s+q_l_n+q_r_n) ) );
  }

  let q_n = 0;
  let q_l_idx = q_s;
  let q_r_idx = q_s + q_l_n;
  while (1) {

    t6[0] = ctx.T_END;
    t6[1] = ctx.T_END;

    idx_l3[0] = -1; idx_l3[1] = -1; idx_l3[2] = -1;
    idx_r3[0] = -1; idx_r3[1] = -1; idx_r3[2] = -1;

    if (q_l_idx < (q_s + q_l_n)) {
      cocha_idx3(ctx, idx_l3, ctx.Q[iq_tmp][q_l_idx]);
      t6[0] = cocha_time3(ctx, idx_l3);
    }

    if (q_r_idx < (q_s + q_l_n + q_r_n)) {
      cocha_idx3(ctx, idx_r3, ctx.Q[iq_tmp][q_r_idx]);
      t6[1] = cocha_time3(ctx, idx_r3);
    }

    cocha_idx3(ctx, idx_u3, idx_u);
    cocha_idx3(ctx, idx_v3, idx_v);

    t6[2] = cocha_time3(ctx, [idx_u3[1], idx_u3[2], idx_v3[1]]);
    t6[3] = cocha_time3(ctx, [idx_u3[0], idx_u3[1], idx_v3[1]]);

    t6[4] = cocha_time3(ctx, [idx_u3[1], idx_v3[0], idx_v3[1]]);
    t6[5] = cocha_time3(ctx, [idx_u3[1], idx_v3[1], idx_v3[2]]);

    if (debug) {
      console.log(pfx, "uv:{", idx_u, idx_v, "}", "T[", ctx.T_BEG, ctx.T_END, "], t6:",
        "(t6:", JSON.stringify(t6.map( (_) => {return printf("%0.4f",_);} )), ")");
    }

    t_nxt = ctx.T_END;
    let tm_idx = -1;
    for (let _i=0; _i<6; _i++) {
      if ((t6[_i] > t_cur) &&
          (t6[_i] < t_nxt)) {
        t_nxt = t6[_i];
        tm_idx = _i;
      }
    }

    if (debug) {
      console.log(pfx, "t_cur:", t_cur, "t_nxt:", t_nxt, "T-:", ctx.T_BEG, "T+:", ctx.T_END);
      console.log(pfx, "k:", q_n, "tidx_event:", tm_idx, "(t6:", JSON.stringify(t6.map( (_) => {return printf("%0.2f",_);} )), ")");
      console.log(pfx, "t6[0]:", t6[0], "(l^-,l,l^+):", idx_l3);
      console.log(pfx, "t6[1]:", t6[1], "(r^-,r,r^+):", idx_r3);
      console.log(pfx, "t6[2]:", t6[2], "(u,u^+,v):", [idx_u3[1], idx_u3[2], idx_v3[1]], "(uv: (", idx_u, idx_v, "))");
      console.log(pfx, "t6[3]:", t6[3], "(u^-,u,v):", [idx_u3[0], idx_u3[1], idx_v3[1]]);
      console.log(pfx, "t6[4]:", t6[4], "(u,v^-,v):", [idx_u3[1], idx_v3[0], idx_v3[1]]);
      console.log(pfx, "t6[5]:", t6[5], "(u,v,v^+):", [idx_u3[1], idx_v3[1], idx_v3[2]], "(uv: (", idx_u, idx_v, "))");

    }


    if (tm_idx == -1) {

      if (debug) { console.log(pfx, "k:", q_n, "no event found, stopping"); }

      break;
    }

    // event is left of bridge
    //
    if (tm_idx == 0) {
      if (ctx.P[idx_l3[1]][0] < ctx.P[idx_u3[1]][0]) {

        if (debug) { console.log(pfx, "c.0:", ctx.Q[iq_tmp][q_l_idx]); }

        ctx.Q[iq_cur][q_s + q_n] = ctx.Q[iq_tmp][q_l_idx];
        q_n++;
      }

      if (debug) { console.log(pfx, "c.0.indel:", ctx.Q[iq_tmp][q_l_idx]); }

      cocha_H_indel(ctx, ctx.Q[iq_tmp][q_l_idx]);
      q_l_idx++;
    }

    // event is right of bridge
    //
    else if (tm_idx == 1) {
      if (ctx.P[idx_r3[1]][0] > ctx.P[idx_v3[1]][0]) {

        if (debug) { console.log(pfx, "c.1:", ctx.Q[iq_tmp][q_r_idx]); }

        ctx.Q[iq_cur][q_s + q_n] = ctx.Q[iq_tmp][q_r_idx];
        q_n++;
      }

      if (debug) { console.log(pfx, "c.1.indel:", ctx.Q[iq_tmp][q_r_idx]); }

      cocha_H_indel(ctx, ctx.Q[iq_tmp][q_r_idx]);
      q_r_idx++;
    }

    // (u,u^+,v)
    // u <- u^+
    //
    else if (tm_idx == 2) {

      if (debug) { console.log(pfx, "c.2:", idx_u3[2]); }

      ctx.Q[iq_cur][q_s + q_n] = idx_u3[2];
      idx_u = idx_u3[2];
      q_n++;
    }

    // (u^-,u,v)
    // u <- u^-
    //
    else if (tm_idx == 3) {

      if (debug) { console.log(pfx, "c.3:", idx_u3[1]); }

      ctx.Q[iq_cur][q_s + q_n] = idx_u3[1];
      idx_u = idx_u3[0];
      q_n++;
    }

    // (u,v^-,v)
    // v <- v^-
    //
    else if (tm_idx == 4) {

      if (debug) { console.log(pfx, "c.4:", idx_v3[0]); }

      ctx.Q[iq_cur][q_s + q_n] = idx_v3[0];
      idx_v = idx_v3[0];
      q_n++;
    }

    // (u,v,v^+)
    // v <- v^+
    //
    else if (tm_idx == 5) {


      ctx.Q[iq_cur][q_s + q_n] = idx_v3[1];
      idx_v = idx_v3[2];
      q_n++;

      if (debug) { console.log(pfx, "c.5: adding v", idx_v3[1], "(Q[", iq_cur, "][", q_s + q_n, "]:", ctx.Q[iq_cur][q_s + q_n]); }
    }

    t_cur = t_nxt;

  }

  if (debug) {
    console.log(pfx, "Q[", iq_cur, "]:", JSON.stringify(ctx.Q[iq_cur].slice(q_s,q_s+q_n)));
  }


  ctx.H_nei[ idx_u ][1] = idx_v;
  ctx.H_nei[ idx_v ][0] = idx_u;

  for (let k = (q_n-1); k >= 0; k--) {

    if (debug) {
      console.log(pfx, "rewind: k:", k, "(", q_n, ")", "Q[", iq_cur, "]:", JSON.stringify(ctx.Q[iq_cur]) );
    }

    let _idx = ctx.Q[iq_cur][q_s + k];
    let _idx3 = [-1,-1,-1];

    cocha_idx3(ctx, _idx3, _idx);
    cocha_idx3(ctx, idx_u3, idx_u);
    cocha_idx3(ctx, idx_v3, idx_v);

    let _u = ctx.P[idx_u];
    let _v = ctx.P[idx_v];
    let _w_cur = ctx.P[_idx];

    if ((_w_cur[0] <= _u[0]) ||
        (_w_cur[0] >= _v[0])) {
      cocha_H_indel(ctx, _idx);

      if      (_idx == idx_u) { idx_u = idx_u3[0]; }
      else if (_idx == idx_v) { idx_v = idx_v3[2]; }
    }
    else {
      ctx.H_nei[ idx_u ][1] = _idx;
      ctx.H_nei[ idx_v ][0] = _idx;

      ctx.H_nei[ _idx ][0] = idx_u;
      ctx.H_nei[ _idx ][1] = idx_v;

      if (ctx.P[_idx][0] < ctx.P[idx_mid][0]) { idx_u = _idx; }
      else                { idx_v = _idx; }
    }

  }

  return q_n;
}

function cocha_hull3d(ctx) {
  let n = cocha_lower_hull_3d_recur(ctx, 0, ctx.P.length,0,0,0);
  ctx.q_n = n;

  if (ctx._debug > 0) {
    console.log("# got:", n, "Q[0]:", JSON.stringify(ctx.Q[0].slice(0,n)));
  }

  let vtx_list = [];
  for (let i=0; i<n; i++) {
    let idx = ctx.Q[0][i];

    let l_idx = ctx.P[ctx.H_nei[idx][0]][3];
    let m_idx = ctx.P[idx][3];
    let r_idx = ctx.P[ctx.H_nei[idx][1]][3];

    //vtx_list.push( [ ctx.H_nei[idx][0], idx, ctx.H_nei[idx][1] ] );
    vtx_list.push( [ l_idx, m_idx, r_idx ] );
    cocha_H_indel(ctx, idx);
  }

  for (let i=0; i<ctx.P.length; i++) { ctx.P[i][2] = -ctx.P[i][2]; }

  n = cocha_lower_hull_3d_recur(ctx, 0, ctx.P.length,0,0,0);
  ctx.q_n = n;

  if (ctx._debug > 0) {
    console.log("# got:", n, "Q[0]:", JSON.stringify(ctx.Q[0].slice(0,n)));
  }

  for (let i=0; i<n; i++) {
    let idx = ctx.Q[0][i];

    let l_idx = ctx.P[ctx.H_nei[idx][0]][3];
    let m_idx = ctx.P[idx][3];
    let r_idx = ctx.P[ctx.H_nei[idx][1]][3];

    //vtx_list.push( [ ctx.H_nei[idx][0], idx, ctx.H_nei[idx][1] ] );
    vtx_list.push( [ l_idx, m_idx, r_idx ] );
    cocha_H_indel(ctx, idx);
  }

  for (let i=0; i<ctx.P.length; i++) { ctx.P[i][2] = -ctx.P[i][2]; }

  return vtx_list;
}

function HULL3D(P) {
  let ctx = cocha_init(P);
  return cocha_hull3d(ctx);
}

//----
//----


function cocha_lower_hull_2d_recur(ctx, s_idx, e_idx_ni) {

  let n = (e_idx_ni - s_idx);
  let n2 = Math.floor(n/2);
  let idx_mid = s_idx + n2;

  if (n==1) {
    ctx.H_nei[s_idx][0] = -1;
    ctx.H_nei[s_idx][1] = -1;
    return 1;
  }

  let n_l = cocha_lower_hull_2d_recur(ctx, s_idx, idx_mid);
  if (n_l < 0) { return n_l; }

  let n_r = cocha_lower_hull_2d_recur(ctx, idx_mid, e_idx_ni);
  if (n_r < 0) { return n_r; }

  let idx_u = idx_mid-1;
  let idx_v = idx_mid;

  let idx_u3 = [-1,-1,-1],
      idx_v3 = [-1,-1,-1];

  do {
    cocha_idx3(ctx, idx_u3, idx_u);
    cocha_idx3(ctx, idx_v3, idx_v);

    if (cocha_turn3(ctx, [ idx_u3[1], idx_v3[1], idx_v3[2] ]) < 0) {
      idx_v = idx_v3[2];
    }

    else if (cocha_turn3(ctx, [ idx_u3[0], idx_u3[1], idx_v3[1] ]) < 0) {
      idx_u = idx_u3[0];
    }

    else { break; }

  } while (1);

  ctx.H_nei[idx_u][1] = idx_v;
  ctx.H_nei[idx_v][0] = idx_u;

  return 1;
}

function HULL2D(_P) {
  let n = _P.length;

  let P = [];
  for (let i=0; i<n; i++) {
    P.push( [ _P[i][0], _P[i][1], i ] );
  }

  P.sort(pnt_cmp);
  let ctx = {
    "_debug": 1,
    "P": P,
    "H_nei": []
  };
  for (let i=0; i<n; i++) { ctx.H_nei.push( [-1,-1] ); }

  cocha_lower_hull_2d_recur(ctx, 0, n);

  for (let i=0; i<P.length; i++) {
    console.log(P[i][0], P[i][1]);
    console.log("\n");
  }

  let cur_idx = 0;
  while (cur_idx >= 0) {
    console.log( P[cur_idx][0], P[cur_idx][1] );
    cur_idx = ctx.H_nei[cur_idx][1];
  }

  return ctx;
}

//----
//----

function cocha_print_hull(ctx, vtx_list) {

  for (let i=0; i<vtx_list.length; i++) {
    let uvw = vtx_list[i];
    console.log( ctx.P[ uvw[0] ][0],  ctx.P[ uvw[0] ][1],  ctx.P[ uvw[0] ][2] );
    console.log( ctx.P[ uvw[1] ][0],  ctx.P[ uvw[1] ][1],  ctx.P[ uvw[1] ][2] );
    console.log( ctx.P[ uvw[2] ][0],  ctx.P[ uvw[2] ][1],  ctx.P[ uvw[2] ][2] );
    console.log( ctx.P[ uvw[0] ][0],  ctx.P[ uvw[0] ][1],  ctx.P[ uvw[0] ][2] );
    console.log("\n\n");
  }

}


function cocha_reset(ctx) {

  let n = ctx.P.length;

  for (let i=0; i<n; i++) {
    ctx.Q[0][2*i] = -1;
    ctx.Q[0][2*i+1] = -1;
    ctx.Q[1][2*i] = -1;
    ctx.Q[1][2*i+1] = -1;

    ctx.H_nei[i][0] = -1;
    ctx.H_nei[i][1] = -1;
  }

}

function cocha_init(_P) {
  let n = _P.length;

  let P = [];
  for (let i=0; i<_P.length; i++) {
    P.push( [_P[i][0], _P[i][1], _P[i][2], i ] );
  }

  P.sort(pnt_cmp);

  let ctx = {
    "_debug": 0,

    "P" : P,
    "T" : [0,0],
    "q_idx": 0,
    "q_n": 0,
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

  // perhaps if I were more clever, I could
  // find reasonable upper bounds dependent
  // on values of coordinates.
  //
  ctx.T_BEG = -1e99;
  ctx.T_END =  1e99;

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


//------------
//       ___ 
//  ____/ (_)
// / __/ / / 
// \__/_/_/  
//           
//------------


var long_opt = [
  "h", "(help)",
  "v", "(version)",
  "V", ":(verbose)",
  //"P", "(print-point)",
  //"u", "(print-vertex)",
  "I", ":(input-format)",
  "O", ":(output-format)",
  "s", "(sort-index)",
  "i", ":(input-file)",
];

var long_opt_desc = [
  "help (this screen)",
  "version",
  "verbosity level",
  //"print input points",
  //"print index vertex points (default print Euclidean points)",
  "input format (2d,3d)",
  "output format (faces,point,point-faces,index,json,gnuplot)",
  "print index in sorted order",
  "input file (first line number of points proceeding by each 3d point on a line)",
  ""
];

function show_version(fp) { fp.write( COCHA_VERSION + "\n" ); }
function show_help(fp) {
  fp.write("\ncocha : Chan's Other Convex Hull Algorithm\n");
  fp.write("version ");
  show_version(fp);
  fp.write("\n");

  for (let i=0; i<long_opt.length; i+=2) {
    let s = "  -" + long_opt[i] + ",--" + long_opt[i+1].replace( /:?\(/, '').replace( /\)$/, '' );
    fp.write( s );

    for (let space=0; space < (24-s.length); space++) { fp.write(" "); }
    fp.write( long_opt_desc[Math.floor(i/2)] + "\n");
  }
  fp.write("\n");
}

function _run_2d(opt) {
  var fs = require("fs");
  let _n = -1;
  let P = [];

  let dat = fs.readFileSync(opt.ifn, 'utf8');
  let lines = dat.split("\n");
  for (let line_no=0; line_no<lines.length; line_no++) {
    let line = lines[line_no].trim();

    if (line.length == 0) { continue; }
    if (line_no == 0) { _n = parseInt(line); continue; }

    let tok = line.split(" ");
    if (tok.length != 2) { continue; }

    let x = parseFloat(tok[0]);
    let y = parseFloat(tok[1]);

    P.push([x,y]);
  }

  if (P.length == 0) {
    process.stderr.write("no points\n");
    return -1;
  }

  let vtx_list = HULL2D(P);
  //console.log(ctx);

}

function _main() {
  var getopt = require("posix-getopt");
  var fs = require("fs");
  let DEBUG_LEVEL = 0;

  let _ret = 0;

  let exec = 1;
  let _opt = {
    //"print_point": false,
    //"print_index": false,
    "input_format": "3d",
    "output_format": "faces",
    "sort_index" : false,
    "ifn": ""
  };


  let parser = new getopt.BasicParser(long_opt.join(""), process.argv);
  while ((arg_opt = parser.getopt()) !== undefined) {
    switch (arg_opt.option) {

      case 'h': show_help(process.stdout); exec=0; _ret=0; break;
      case 'v': show_version(process.stdout); exec=0; _ret=0; break;
      case 'V': DEBUG_LEVEL = parseInt(arg_opt.optarg); break;
      //case 'P': _opt.print_point = true; break;
      //case 'u': _opt.print_index = true; break;
      case 'I': _opt.input_format = arg_opt.optarg; break;
      case 'O': _opt.output_format = arg_opt.optarg; break;
      case 's': _opt.sort_index = true; break;
      case 'i': _opt.ifn = arg_opt.optarg; break;
      default:
        process.stderr.write("invalid option '" + arg_opt.option + "'\n");
        show_help(process.stderr);
        exec=0;
        break;
    }
  }

  if (exec==0) { return _ret; }

  if (_opt.ifn.length == 0) {
    show_help(process.stderr);
    return -1;
  }

  if (_opt.input_format == '2d') {
    return _run_2d(_opt);
  }

  let _n = -1;
  let P = [];

  let dat = fs.readFileSync(_opt.ifn, 'utf8');
  let lines = dat.split("\n");
  for (let line_no=0; line_no<lines.length; line_no++) {
    let line = lines[line_no].trim();

    if (line.length == 0) { continue; }
    if (line_no == 0) { _n = parseInt(line); continue; }

    let tok = line.split(" ");
    if (tok.length != 3) { continue; }

    let x = parseFloat(tok[0]);
    let y = parseFloat(tok[1]);
    let z = parseFloat(tok[2]);

    P.push([x,y,z]);
  }

  if (P.length == 0) {
    process.stderr.write("no points\n");
    return -1;
  }

  let cocha_ctx = cocha_init(P);
  cocha_ctx._debug = DEBUG_LEVEL;
  let vlist = cocha_hull3d(cocha_ctx);

  if (_opt.output_format.search(/point/) == 0) {
    for (let i=0; i<P.length; i++) {
      console.log(cocha_ctx.P[i][0], cocha_ctx.P[i][1], cocha_ctx.P[i][2]);
      console.log("\n\n");
    }
  }

  if (_opt.output_format.search(/index/) >= 0) {

    if (_opt.sort_index) {
      for (let i=0; i<vlist.length; i++) {
        vlist[i].sort( (a,b) => { if (a<b) { return -1; } if (a>b) { return 1; } return 0; });
      }

      vlist.sort( (a,b) => {
        let _n = Math.min(a.length,b.length);
        for (let _i=0; _i<_n; _i++) {
          if (a[_i]<b[_i]) { return -1; }
          if (a[_i]>b[_i]) { return  1; }
        }
        return 0;
      });
    }

    for (let i=0; i<vlist.length; i++) {
      console.log(vlist[i][0], vlist[i][1], vlist[i][2]);
    }

  }

  else if (_opt.output_format.search(/json/) >= 0) {
    cocha_json(cocha_ctx);
  }

  else if (_opt.output_format.search(/gnuplot/) >= 0) {
    for (let i=0; i<P.length; i++) {
      console.log(cocha_ctx.P[i][0], cocha_ctx.P[i][1], cocha_ctx.P[i][2]);
      console.log("\n\n");
    }

    for (let i=0; i<vlist.length; i++) {
      let p = cocha_ctx.P[vlist[i][0]];
      let q = cocha_ctx.P[vlist[i][1]];
      let r = cocha_ctx.P[vlist[i][2]];

      console.log(p[0], p[1], p[2]);
      console.log(q[0], q[1], q[2]);
      console.log(r[0], r[1], r[2]);
      console.log(p[0], p[1], p[2]);
      console.log("\n");
    }
  }

  else {
    cocha_print_hull(cocha_ctx, vlist);
  }

}


if (typeof module !== "undefined") {
  //module.exports["rand_point"] = rand_point;
  module.exports["_reset"] = cocha_reset;
  module.exports["_lower_hull_3d_recur"] = cocha_lower_hull_3d_recur;
  module.exports["_indel"] = cocha_H_indel;
  module.exports["_idx3"] = cocha_idx3;
  module.exports["_turn3"] = cocha_turn3;
  module.exports["_time3"] = cocha_time3;

  module.exports["_init"] = cocha_init;
  module.exports["_hull3d"] = cocha_hull3d;
  module.exports["hull3d"] = HULL3D;

  module.exports["_lower_hull_2d_recur"] = cocha_lower_hull_2d_recur;
  module.exports["hull2d"] = HULL2D;

  module.exports["_time"] = _time;
  module.exports["_turn"] = _turn;
}

if ((typeof require !== "undefined") &&
    (require.main === module)) {
  _main(process.argv.slice(1));
}



