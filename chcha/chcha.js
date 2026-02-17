// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


var _rnd = Math.random;

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

function chcha_debug_print(ctx) {
  print_point(ctx.P);
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

function chcha_idx3(ctx, idx3, idx) {
  if (idx < 0) { idx3[0] = -1; idx3[1] = -1, idx3[2] = -1; return; }

  idx3[0] = ctx.H_nei[idx][0];
  idx3[1] = idx;
  idx3[2] = ctx.H_nei[idx][1];

  return idx3;
}

function chcha_turn3(ctx, idx3) {
  if ((idx3[0] < 0) ||
      (idx3[1] < 0) ||
      (idx3[2] < 0)) { return 1.0; }

  return _turn( ctx.P[idx3[0]], ctx.P[idx3[1]], ctx.P[idx3[2]] );
}

function chcha_time3(ctx, idx3) {
  if ((idx3[0] < 0) ||
      (idx3[1] < 0) ||
      (idx3[2] < 0)) { return ctx.T[1]; }

  return _time( ctx.P[idx3[0]], ctx.P[idx3[1]], ctx.P[idx3[2]] );
}

// we can figure out whether it's an insertion or deletion
// by context.
// If the current hull point has it's neighbors pointing
// back to it, we know it needs to be deleted.
// If the current hull point doesn't have it's neighbors
// pointing to it, it's an insertion.
//
function chcha_H_indel(ctx, idx) {

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

// untested
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
function chcha_recur(ctx, s_idx, e_idx_ni, q_idx) {

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

  let n = (e_idx_ni - s_idx);
  let n2 = Math.floor(n/2);
  let idx_mid = s_idx + n2;

  let iq_cur = q_idx;
  let iq_nxt = 1-q_idx;

  if (n==1) {
    let idx = ctx.Q[iq_cur][s_idx];
    ctx.H_nei[idx][0] = -1;
    ctx.H_nei[idx][1] = -1;
    return 0;
  }

  _r = chcha_recur(ctx, s_idx, idx_mid, iq_nxt);
  if (_r < 0) { return _r; }

  _r = chcha_recur(ctx, idx_mid, e_idx_ni, iq_nxt);
  if (_r < 0) { return _r; }

  idx_u = idx_mid;
  idx_v = idx_mid+1;

  do {

    chcha_idx3(ctx, idx_u3, idx_u);
    chcha_idx3(ctx, idx_v3, idx_v);

    // move v right
    //
    if (chcha_turn3(ctx, [ idx_u3[1], idx_v3[1], idx_v3[2] ] ) < 0) {
      idx_v = idx_v3[2];
    }

    // move u left
    //
    else if (chcha_turn3(ctx, [ idx_u3[0], idx_u3[1], idx_v3[1] ] ) < 0) {
      idx_u = idx_u3[0];
    }

    else { break; }

  } while (1);

  let t_cur = ctx.T[0];
  let t_nxt = ctx.T[1];

  let q_n_idx = 0;
  let q_l_idx = s_idx;
  let q_r_idx = idx_mid;
  while (1) {

    chcha_idx3(ctx, idx_u3, idx_u);
    chcha_idx3(ctx, idx_v3, idx_v);
    chcha_idx3(ctx, idx_l3, ctx.Q[iq_cur][q_l_idx]);
    chcha_idx3(ctx, idx_r3, ctx.Q[iq_cur][q_r_idx]);

    t[0] = chcha_time3(ctx, idx_l3);
    t[1] = chcha_time3(ctx, idx_r3);

    t[2] = chcha_time3(ctx, [idx_u3[1], idx_u3[2], idx_v3[1]]);
    t[3] = chcha_time3(ctx, [idx_u3[0], idx_u3[1], idx_v3[1]]);

    t[4] = chcha_time3(ctx, [idx_u3[1], idx_v3[0], idx_v3[1]]);
    t[5] = chcha_time3(ctx, [idx_u3[1], idx_v3[1], idx_v3[2]]);

    t_nxt = ctx.T[1];
    let tm_idx = -1;
    for (let _i=0; _i<6; _i++) {
      if ((t[_i] > t_cur) &&
          (t[_i] < t_nxt)) {
        t_nxt = t[_i];
        tm_idx = _i;
      }
    }
    if (tm_idx == -1) { break; }

    // event is left of bridge
    //
    else if (tm_idx == 0) {
      if (ctx.P[idx_l3[1]][0] < ctx.P[idx_u3[1]][0]) {
        ctx.Q[iq_nxt][q_n_idx] = ctx.Q[iq_cur][q_l_idx];
        chcha_H_nei_update(ctx, ctx.Q[iq_nxt][q_n_idx]);
        q_l_idx++;
      }
    }

    // event is right of bridge
    //
    else if (tm_idx == 1) {
      if (ctx.P[idx_r3[1]][0] > ctx.P[idx_v3[1]][0]) {
        ctx.Q[iq_nxt][q_n_idx] = ctx.Q[iq_cur][q_r_idx];
        chcha_H_nei_update(ctx, ctx.Q[iq_nxt][q_n_idx]);
        q_r_idx++;
      }
    }

    // (u,u^+,v)
    // u <- u^+
    //
    else if (tm_idx == 2) {
      ctx.Q[iq_nxt][q_n_idx] = idx_u3[2];
      idx_u = idx_u3[2];
    }

    // (u^-,u,v)
    // u <- u^-
    //
    else if (tm_idx == 3) {
      ctx.Q[iq_nxt][q_n_idx] = idx_u3[1];
      idx_u = idx_u3[0];
    }

    // (u,v^-,v)
    // v <- v^-
    //
    else if (tm_idx == 4) {
      ctx.Q[iq_nxt][q_n_idx] = idx_v3[0];
      idx_v = idx_v3[0];
    }

    // (u,v,v^+)
    // v <- v^+
    //
    else if (tm_idx == 5) {
      ctx.Q[iq_nxt][q_n_idx] = idx_v3[1];
      idx_v = idx_v3[2];
    }

    q_n_idx++;

  }
  ctx.Q[iq_nxt][q_n_idx] = -1;


  ctx.H_nei[ u_idx ][1] = v_idx;
  ctx.H_nei[ v_idx ][0] = u_idx;

  chcha_idx3( ctx, idx_u3, idx_u );
  chcha_idx3( ctx, idx_v3, idx_v );

  for (let k = (q_n_idx-1); k >= 0; k--) {
    let _idx = ctx.Q[iq_nxt][k];
    let _idx3 = [-1,-1,-1];

    chcha_idx3(ctx, _idx3, _idx);
    chcha_idx3(ctx, idv_u3, idx_u);
    chcha_idx3(ctx, idv_v3, idx_v);

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
      chcha_H_nei_update(ctx, _idx);

      if      (_idx == idx_u) { idx_u = idx_u3[0]; }
      else if (_idx == idx_v) { idx_v = idx_v3[2]; }
    }

  }

  return 0;
}


let P = init_point(20);
P.sort(pnt_cmp);

function chcha_init(P) {
  let n = P.length;

  P.sort(pnt_cmp);

  let ctx = {
    "p" : P,
    "T" : [0,0],
    "q_idx": 0,
    "Q": [ [], [] ],
    "H_nei" : []
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
    ctx.Q[1].push(-1);
    ctx.H_nei.push( [-1,-1] );
  }

  return ctx;
}

print_point(P);

