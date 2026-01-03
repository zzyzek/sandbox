#!/usr/bin/env node
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var printf = require("./printf.js");
var fasslib = require("./fasslib.js");

var v_add = fasslib.v_add;
var cmp_v = fasslib.cmp_v;
var ibvec_incr = fasslib.ibvec_incr;
var ivec0 = fasslib.ivec0;

var IDIR_DXY = [
  [1,0], [-1,0], [0,1], [0,-1]
];

function r2k2zzn_print(ctx, pfx) {
  pfx = ((typeof pfx === "undefined") ? "" : pfx);
  console.log(pfx + "size:", "W:",ctx.size[0], "H:", ctx.size[1]);

  console.log(pfx + "s[", ctx.s.length, "]:", JSON.stringify(ctx.s));
  console.log(pfx + "t[", ctx.t.length, "]:", JSON.stringify(ctx.t));

  console.log(pfx + "p_cur:", JSON.stringify(ctx.p_cur), "p_idx:", JSON.stringify(ctx.p_idx));

  console.log(pfx + "path_idx:", ctx.path_idx);
  for (let i=0; i<ctx.path.length; i++) {
    console.log(pfx + "  path[", i, "]:", JSON.stringify(ctx.path[i]));
  }

  console.log(pfx + "\n" + pfx + "grid:");

  for (let j=(ctx.size[1]-1); j>=0; j--) {
    let a = [];
    for (let i=0; i<ctx.size[0]; i++) {
      a.push( printf("%3d", ctx.grid[j][i]) );
    }
    console.log(pfx + a.join(" "));
  }

  console.log(pfx + "");
}

function r2k2zzn_gnuplot_print_path(ctx) {
  for (let path_idx=0; path_idx < ctx.path.length; path_idx++) {

    for (let i=0; i<ctx.path[path_idx].length; i++) {
      console.log( ctx.path[path_idx][i][0], ctx.path[path_idx][i][1] );
    }
    console.log("\n");
  }
}

function r2k2zzn_init(w,h, s0,t0, s1,t1) {
  let ctx = {
    "size": [w,h],
    "s" : [ [s0[0], s0[1]], [s1[0], s1[1]] ],
    "t" : [ [t0[0], t0[1]], [t1[0], t1[1]] ],
    "path" : [ [], [] ],
    "grid": [],

    "p_cur": [-1,-1],
    "p_idx": -1,

    "path_start" : false,

    "path_idx" : -1,

    "_node_count": 0
  };

  for (let j=0; j<h; j++) {
    ctx.grid.push([]);
    for (let i=0; i<w; i++) {
      ctx.grid[j].push(-1);
    }
  }

  ctx.grid[ ctx.s[0][1] ][ ctx.s[0][0] ] = -2;
  ctx.grid[ ctx.t[0][1] ][ ctx.t[0][0] ] = -3;

  ctx.grid[ ctx.s[1][1] ][ ctx.s[1][0] ] = -4;
  ctx.grid[ ctx.t[1][1] ][ ctx.t[1][0] ] = -5;

  return ctx;
}

//             __        
//   ___ ___  / /  _____ 
//  (_-</ _ \/ / |/ / -_)
// /___/\___/_/|___/\__/ 
//                       

function r2k2zzn_solve_r(ctx, lvl, _debug) {
  lvl = ((typeof lvl === "undefined") ?  0 : lvl );
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let _size = ctx.size;
  let grid = ctx.grid;

  let valid_marker = -1;

  let s_cur_marker = -((ctx.path_idx+1)*2 + 0);
  let t_cur_marker = -((ctx.path_idx+1)*2 + 1);

  let s_nxt_marker = -((ctx.path_idx+2)*2 + 0);
  let t_nxt_marker = -((ctx.path_idx+2)*2 + 1);
  
  let p = [ ctx.p_cur[0], ctx.p_cur[1] ];
  let p_idx = ctx.p_idx;

  ctx._node_count++;

  let node_id = ctx._node_count;

  let path_start = ctx.path_start;


  if ((p[0] < 0) || (p[0] >= _size[0]) ||
      (p[1] < 0) || (p[1] >= _size[1])) {
    return -1;
  }

  let gv = grid[ p[1] ][ p[0] ];


  let pfx = printf("%" + lvl.toString() + "s", "#");
  if (_debug > 0) {
    console.log(pfx + "---------------------------");
    console.log(pfx + " lvl:", lvl, "p:", p, "(", p_idx, ")", "gv:", gv, "node:", ctx._node_count);
    console.log(pfx + " path_idx:", ctx.path_idx, "(s,t)_marker:", "(", s_cur_marker, ",", t_cur_marker, ") (", s_nxt_marker, t_nxt_marker, ")");
    r2k2zzn_print(ctx, pfx);
    console.log(pfx + "---------------------------\n\n");
  }


  if (gv >= 0) {

    if (_debug > 0) {
      console.log(pfx + "trample, backing up");
    }

    return -1;
  }

  // we're starting a new path
  //
  else if ((gv == s_nxt_marker) && ctx.path_start) {

    ctx.path_start = false;
    ctx.path_idx++;

    if (_debug > 0) {
      console.log( pfx + "S_MARKER", s_nxt_marker, "path_idx:", ctx.path_idx);
    }

    // fall through
    //
  }

  // we're ending a current path.
  //
  // MARK the current position in the grid (path end, at the
  // t-marker position).
  // DON'T increment path_idx, this will be picked up by the s_marker
  // conditional above.
  //
  //
  //
  else if (gv == t_cur_marker) {

    if (_debug > 0) {
      console.log(pfx + "tmarker...");
    }

    if (ctx.path_idx == 1) {
      if ( ctx.p_idx == ((_size[0]*_size[1])-1) ) {

        if (_debug > 0) { console.log(pfx + "tmarker solution, success"); }

        ctx.path[ ctx.path_idx ].push( [p[0], p[1]] );
        ctx.grid[ p[1] ][ p[0] ] = ctx.p_idx;
        return ctx.p_idx;
      }

      if (_debug > 0) { console.log(pfx + "tmarker fail, backing up"); }

      return -1;
    }

    ctx.path_start = true;
    ctx.grid[ p[1] ][ p[0] ] = ctx.p_idx;
    ctx.path[ ctx.path_idx ].push( [p[0], p[1]] );

    ctx.p_cur[0] = ctx.s[ ctx.path_idx+1 ][0];
    ctx.p_cur[1] = ctx.s[ ctx.path_idx+1 ][1];
    ctx.p_idx++;


    if (_debug > 0) {
      console.log( pfx + "T_MARKER", t_cur_marker, "path_idx now:", ctx.path_idx, "p_cur now:", JSON.stringify(ctx.p_cur) );
      console.log( pfx + "  t_marker recur: parent:", node_id, "-> child:", ctx._node_count+1);
    }

    let r = r2k2zzn_solve_r(ctx,lvl+1, _debug); 
    if (r >= 0) { return r; }

    ctx.p_idx--;
    ctx.p_cur[0] = p[0];
    ctx.p_cur[1] = p[1];

    ctx.path[ ctx.path_idx ].pop();
    ctx.grid[ p[1] ][ p[0] ] = gv;
    ctx.path_start = false;


    return -1;
  }

  // we've collided with a start or end marker not
  // in our current path
  //
  else if (gv != valid_marker) {
 
    if (_debug > 0) {
      console.log( pfx + "collision, backing up (p:", JSON.stringify(p), ")");
    }

    return -1;
  }

  grid[ p[1] ][ p[0] ] = p_idx;
  ctx.path[ ctx.path_idx ].push( [p[0], p[1]] );

  // recur on each neighbor
  //
  for (let idir=0; idir<4; idir++) {
    let q = v_add( p, IDIR_DXY[idir] );

    ctx.p_cur[0] = q[0];
    ctx.p_cur[1] = q[1];
    ctx.p_idx++;

    if (_debug > 0) {
      console.log( pfx + "  main recur: parent:", node_id, "-> child:", ctx._node_count+1);
    }

    let r = r2k2zzn_solve_r(ctx,lvl+1, _debug);
    if (r >= 0) { return r; }

    ctx.p_cur[0] = p[0];
    ctx.p_cur[1] = p[1];
    ctx.p_idx--;
  }

  grid[ p[1] ][ p[0] ] = gv;
  ctx.path[ ctx.path_idx ].pop();

  // we were at a start marker, so undo the path_idx increment above
  //
  if (path_start) { ctx.path_idx--; }

  return -1;
}

function r2k2zzn_solve(ctx, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  for (let j=0; j<ctx.size[1]; j++) {
    for (let i=0; i<ctx.size[0]; i++) {
      ctx.grid[j][i] = -1;
    }
  }

  for (let path_idx=0; path_idx<ctx.s.length; path_idx++) {
    ctx.path[path_idx] = [];
    ctx.grid[ ctx.s[path_idx][1] ][ ctx.s[path_idx][0] ] = -((path_idx+1)*2 + 0);
    ctx.grid[ ctx.t[path_idx][1] ][ ctx.t[path_idx][0] ] = -((path_idx+1)*2 + 1);
  }

  ctx._node_count = 0;

  ctx.path_start = false;
  ctx.p_idx = 0;
  ctx.p_cur = [ ctx.s[0][0], ctx.s[0][1] ];
  ctx.path_idx = 0;
  ctx.path[0].push( [ ctx.p_cur[0], ctx.p_cur[1] ] );

  ctx.grid[ ctx.p_cur[1] ][ ctx.p_cur[0] ] = ctx.p_idx;

  let p = [ ctx.p_cur[0], ctx.p_cur[1] ];

  for (let idir=0; idir<4; idir++) {
    let q = v_add( p, IDIR_DXY[idir] );

    ctx.p_cur[0] = q[0];
    ctx.p_cur[1] = q[1];
    ctx.p_idx++;

    let r = r2k2zzn_solve_r(ctx, 0, _debug);
    if (r >= 0) { return r; }

    ctx.p_cur[0] = p[0];
    ctx.p_cur[1] = p[1];
    ctx.p_idx--;

  }

  if (_debug > 0) {
    console.log("-------------");
    r2k2zzn_print(ctx);
    console.log("-------------");
  }

  if (ctx.p_idx==0) { return -1; }
  return ctx.p_idx;
  //return r2k2zzn_solve_r(ctx);
}


//-------
//-------
//-------

var R2K2ZZN_func_name_map = {
  "init": r2k2zzn_init,
  "print": r2k2zzn_print
};


if (typeof module !== "undefined") {

  function distinct(a,b,c,d) {

    if (cmp_v(a,b) == 0) { return 0; }
    if (cmp_v(a,c) == 0) { return 0; }
    if (cmp_v(a,d) == 0) { return 0; }
    if (cmp_v(b,c) == 0) { return 0; }
    if (cmp_v(b,d) == 0) { return 0; }
    if (cmp_v(c,d) == 0) { return 0; }

    return 1;
  }

  function stst_key(s0, t0, s1, t1) {
    let key = 
    s0[0].toString() + "," + s0[1].toString() + ":" +
    t0[0].toString() + "," + t0[1].toString() + ";" +
    s1[0].toString() + "," + s1[1].toString() + ":" +
    t1[0].toString() + "," + t1[1].toString() + "";
    return key;
  }

  function mark_perm_stst(M, s0, t0, s1, t1) {

    M[ stst_key(s0,t0,s1,t1) ] = 1;
    M[ stst_key(t0,s0,s1,t1) ] = 1;
    M[ stst_key(s0,t0,t1,s1) ] = 1;
    M[ stst_key(t0,s0,t1,s1) ] = 1;

    M[ stst_key(s1,t1,s0,t0) ] = 1;
    M[ stst_key(t1,s1,s0,t0) ] = 1;
    M[ stst_key(s1,t1,t0,s0) ] = 1;
    M[ stst_key(t1,s1,t0,s0) ] = 1;

  }

  function mark_flip_stst(M, s0, t0, s1, t1, w,h) {

    mark_perm_stst(M, s0, t0, s1, t1);

    let sh0 = [ s0[0], h-1-s0[1] ];
    let th0 = [ t0[0], h-1-t0[1] ];

    let sh1 = [ s1[0], h-1-s1[1] ];
    let th1 = [ t1[0], h-1-t1[1] ];

    mark_perm_stst(M, sh0, th0, sh1, th1);

    let sw0 = [ w-1-s0[0], s0[1] ];
    let tw0 = [ w-1-t0[0], t0[1] ];

    let sw1 = [ w-1-s1[0], s1[1] ];
    let tw1 = [ w-1-t1[0], t1[1] ];

    mark_perm_stst(M, sw0, tw0, sw1, tw1);

    let swh0 = [ w-1-s0[0], h-1-s0[1] ];
    let twh0 = [ w-1-t0[0], h-1-t0[1] ];

    let swh1 = [ w-1-s1[0], h-1-s1[1] ];
    let twh1 = [ w-1-t1[0], h-1-t1[1] ];

    mark_perm_stst(M, swh0, twh0, swh1, twh1);
  }

  function mark_stst(M, s0, t0, s1, t1, w,h) {
    let key = stst_key(s0, t0, s1, t1);
    M[key] = 1;
    mark_flip_stst(M, s0, t0, s1, t1);
  }

  function color_compatible(s0,t0,s1,t1,w,h) {
    let grid_parity = (w*h)%2;

    let s0_parity = (s0[0] + s0[1])%2;
    let t0_parity = (t0[0] + t0[1])%2;

    let s1_parity = (s1[0] + s1[1])%2;
    let t1_parity = (t1[0] + t1[1])%2;

    if (grid_parity == 0) {
      if ((s0_parity == t0_parity) ||
          (s1_parity == t1_parity)) {
        return 0;
      }
      return 1;
    }

    let parity_sum = s0_parity + t0_parity + s1_parity + t1_parity;
    if (parity_sum == 1) { return 1; }
    return 0;
  }

  function _enum(w,h) {

    let stst = [0,0, 0,0, 0,0, 0,0];
    let B = [w,h,w,h,w,h,w,h];

    let Memz = {};

    let soln = [];

    do {

      let t1 = [stst[0], stst[1]];
      let s1 = [stst[2], stst[3]];
      let t0 = [stst[4], stst[5]];
      let s0 = [stst[6], stst[7]];

      if ( (cmp_v(s0, [0,0]) == 0) &&
           (cmp_v(t0, [1,0]) == 0) &&
           (cmp_v(s1, [2,0]) == 0) &&
           (cmp_v(t1, [0,2]) == 0) ) {

        let _key = stst_key(s0,t0,s1,t1);
        let cc = color_compatible(s0,t0,s1,t1,w,h);
        console.log("!!!", "(", w,h, ")", s0, t0, s1,t1, distinct(s0,t0,s1,t1), _key in Memz, cc);
      }

      if (!distinct(s0,t0,s1,t1)) { ibvec_incr(stst,B); continue; }
      if (color_compatible(s0,t0,s1,t1,w,h) == 0) { ibvec_incr(stst,B); continue; }

      let key = stst_key(s0,t0,s1,t1);
      if (!(key in Memz)) {

        let ctx = r2k2zzn_init(w,h, s0,t0, s1,t1);
        let r = r2k2zzn_solve(ctx);
        console.log("s0:", s0, "t0:", t0, "s1:", s1, "t1:", t1, ":::", r);

        soln.push( {"key":key, "S": [s0,s1], "T":[t0,t1], "r": r, "ctx": ctx } );
      }

      mark_stst(Memz,s0,t0,s1,t1,w,h);
      ibvec_incr(stst,B);

    } while (!ivec0(stst));


    for (let i=0; i<soln.length; i++) {
      console.log(soln[i].key, JSON.stringify(soln[i].ctx.path));
    }

  }

  function _main(argv) {
    let _debug = 0;

    let op = "10x1";
    op = "7x2";
    op = "10x3";

    _enum(3,3);
    return;

    if (op == "10x1") {
      let ctx = r2k2zzn_init(10,1, [0,0], [3,0], [9,0], [4,0]);

      if (_debug > 0) { r2k2zzn_print(ctx); }

      let r = r2k2zzn_solve(ctx, _debug);
      console.log("#GOT:", r, "(", ctx._node_count, ")");
      if (_debug > 0) { r2k2zzn_print(ctx); }

      if (r >= 0) {
        r2k2zzn_gnuplot_print_path(ctx);
      }
    }

    if (op == "7x2") {
      let ctx = r2k2zzn_init(7,2, [0,0], [3,1], [6,1], [3,0]);

      if (_debug > 0) { r2k2zzn_print(ctx); }

      let r = r2k2zzn_solve(ctx, _debug);
      console.log("#GOT:", r, "(", ctx._node_count, ")");
      if (_debug > 0) { r2k2zzn_print(ctx); }

      if (r >= 0) {
        r2k2zzn_gnuplot_print_path(ctx);
      }
    }

    else if (op == "10x3") {

      let ctx = r2k2zzn_init(10,3, [0,0], [1,1], [9,2], [8,1]);
      //r2k2zzn_print(ctx);

      let r = r2k2zzn_solve(ctx);
      console.log("#GOT:", r, "(", ctx._node_count, ")");

      if (_debug > 0) { r2k2zzn_print(ctx); }

      if (r >= 0) {
        r2k2zzn_gnuplot_print_path(ctx);
      }
    }

  }

  _main(process.argv.slice(2));

}
else {

  var r2k2zzn = R2K2ZZN_func_name_map;
}
