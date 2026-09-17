#!/usr/bin/env node
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


// helper script to enumerate and solve instances
//
// usage:
//
// node ./r2k2zzn.js [op] w,h [s0x,s0y,t0x,t0y,s1x,s1y,t1x,t1y]
//
// op:
//
//   solve - solve an instance with a start/end positions specified
//   enum  - enumerate solutions for rectangle of widht w, height h
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

function _swapv2(v) { let t = v[0]; v[0] = v[1]; v[1] = t; }

function _r2k2zzn_normalize(_s0,_t0, _s1,_t1, _w,_h) {
  let w = _w, h = _h,
      s0 = [_s0[0], _s0[1]],
      t0 = [_t0[0], _t0[1]],
      s1 = [_s1[0], _s1[1]],
      t1 = [_t1[0], _t1[1]];

  let normalize_info = {
    "order" : [ "swap_wh", "swap_st0", "swap_st1", "swap_st0st1" ],
    "swap_wh" : false,
    "swap_st0" : false,
    "swap_st1" : false,
    "swap_st0st1" : false
  };

  if (_h > _w) {
    w = _h; h = _w;
    _swapv2(s0); _swapv2(t0);
    _swapv2(s1); _swapv2(t1);

    normalize_info.swap_wh = true;
  }

  if (cmp_v(t0, s0) < 0) {
    let t = t0; t0 = s0; s0 = t;
    normalize_info.swap_st0 = true;
  }

  if (cmp_v(t1,s1) < 0) {
    let t = t1; t1 = s1; s1 = t;
    normalize_info.swap_st1 = true;
  }

  if (cmp_v(s1,s0) < 0) {
    let t = s0; s0 = s1; s1 = t;
    t = t0; t0 = t1; t1 = t;
    normalize_info.swap_st0st1 = true;
  }

  return {
    "w": w, "h": h,
    "s0": s0, "t0": t0,
    "s1": s1, "t1": t1,
    "normalize_info": normalize_info
  };

}


function r2k2zzn_init(_w,_h, _s0,_t0, _s1,_t1, normalize) {
  normalize = ((typeof normalize === "undefined") ? 0 : normalize);

  let normalize_info = {
    "order" : [ "swap_wh", "swap_st0", "swap_st1", "swap_st0st1" ],
    "swap_wh" : false,
    "swap_st0" : false,
    "swap_st1" : false,
    "swap_st0st1" : false
  };

  let w = _w, h = _h,
      s0 = [_s0[0], _s0[1]],
      t0 = [_t0[0], _t0[1]],
      s1 = [_s1[0], _s1[1]],
      t1 = [_t1[0], _t1[1]];

  if (normalize) {

    if (_h > _w) {
      w = _h; h = _w;
      _swapv2(s0); _swapv2(t0);
      _swapv2(s1); _swapv2(t1);

      normalize_info.swap_wh = true;
    }

    if (cmp_v(t0, s0) < 0) {
      let t = t0; t0 = s0; s0 = t;
      normalize_info.swap_st0 = true;
    }

    if (cmp_v(t1,s1) < 0) {
      let t = t1; t1 = s1; s1 = t;
      normalize_info.swap_st1 = true;
    }

    if (cmp_v(s1,s0) < 0) {
      let t = s0; s0 = s1; s1 = t;
      t = t0; t0 = t1; t1 = t;
      normalize_info.swap_st0st1 = true;
    }

  }

  //console.log("w:", w, "h:", h);
  //console.log("s0:", JSON.stringify(s0), "t0:", JSON.stringify(t0) );
  //console.log("s1:", JSON.stringify(s1), "t1:", JSON.stringify(t1) );

  let ctx = {
    "size": [w,h],
    "s" : [ [s0[0], s0[1]], [s1[0], s1[1]] ],
    "t" : [ [t0[0], t0[1]], [t1[0], t1[1]] ],
    "path" : [ [], [] ],
    "grid": [],

    "p_cur": [-1,-1],
    "p_idx": -1,

    "path_start" : false,

    "normalize_info": normalize_info,

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
  "solve": r2k2zzn_solve,
  "color_compatible": color_compatible,
  "peripheral_compatible": peripheral_compatible,
  "corner_compatible": corner_compatible,
  "print": r2k2zzn_print
};

// return:
//
// 0 - if a==b, a==c, a==d, b==c, b==d or c==d 
// 1 - if all distinct
//
function distinct(a,b,c,d) {

  if (cmp_v(a,b) == 0) { return 0; }
  if (cmp_v(a,c) == 0) { return 0; }
  if (cmp_v(a,d) == 0) { return 0; }
  if (cmp_v(b,c) == 0) { return 0; }
  if (cmp_v(b,d) == 0) { return 0; }
  if (cmp_v(c,d) == 0) { return 0; }

  return 1;
}

// string key for memz lookup
//
function stst_key(s0, t0, s1, t1) {
  let key = 
  s0[0].toString() + "," + s0[1].toString() + ":" +
  t0[0].toString() + "," + t0[1].toString() + ";" +
  s1[0].toString() + "," + s1[1].toString() + ":" +
  t1[0].toString() + "," + t1[1].toString() + "";
  return key;
}

// add to memez with all valid permuatations of (s0,t0), (s1,t1)
// pairs
//
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

// mark memz with reflection symmetry for start/end pairs
//
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

// WIP!!!
function mark_rotation_stst(M, s0, t0, s1, t1, w, h) {
  if (w != h) { return; }

  let cur_s0 = [s0[0], s0[1]],
      cur_t0 = [t0[0], t0[1]],
      cur_s1 = [s1[0], s1[1]],
      cur_t1 = [t1[0], t1[1]];

  for (let i=0; i<4; i++) {

    let nxt_s0 = [ cur_s0[1], h-1-cur_s0[0] ],
        nxt_t0 = [ cur_t0[1], h-1-cur_t0[0] ],
        nxt_s1 = [ cur_s1[1], h-1-cur_s1[0] ],
        nxt_t1 = [ cur_t1[1], h-1-cur_t1[0] ];

    mark_flip_stst(M, cur_s0, cur_t0, cur_s1, cur_t1, w, h);

    cur_s0 = nxt_s0;
    cur_t0 = nxt_t0;
    cur_s1 = nxt_s1;
    cur_t1 = nxt_t1;

  }

}

// umbrella function to apply all valid symmetry
// memz memoizations
//
function mark_stst(M, s0, t0, s1, t1, w,h) {
  let key = stst_key(s0, t0, s1, t1);
  M[key] = 1;
  mark_flip_stst(M, s0, t0, s1, t1,w,h);

  if (w==h) {
    mark_rotation_stst(M, s0, t0, s1, t1, w, h);
  }
}

// if (w*h) even, s0 and t0 must be different parity
// and s1, t1 must be different parity
//
// if (w*h) odd, then all but one s or t must
// be majority color
//
// return:
// 0 - color incompatible
// 1 - color compatible
//
function color_compatible(s0,t0,s1,t1,w,h) {
  let grid_parity = (w*h)%2;

  let s0_parity = (s0[0] + s0[1])%2;
  let t0_parity = (t0[0] + t0[1])%2;

  let s1_parity = (s1[0] + s1[1])%2;
  let t1_parity = (t1[0] + t1[1])%2;

  let parity_sum = s0_parity + t0_parity + s1_parity + t1_parity;

  if (grid_parity == 0) {
    return ((parity_sum == 2) ? 1 : 0);
  }

  return ((parity_sum == 1) ? 1 : 0);
}

function _peripheral2xy(p_idx, w,h) {
  let n = (2*w) + (2*(h-2));

  if ((p_idx < 0) || (p_idx >= n)) { return -1; }

  if (p_idx < w) { return [p_idx, 0]; }
  if (p_idx < (w+(h-1))) { return [w-1, p_idx-(w-1)]; }
  if (p_idx < ((2*w)+(h-2))) { return [(w) + (h-2) + (w-1) - p_idx, h-1]; }
  return [0, (2*w) + (2*(h-2))  - p_idx];
}

function _xy2peripheral(xy, w,h) {
  if ((xy[0] > 0) && (xy[0] < (w-1)) &&
      (xy[1] > 0) && (xy[1] < (h-1))) { return -1; }

  if (xy[1] == 0) { return xy[0]; }
  if (xy[0] == (w-1)) { return xy[1] + (w-1); }
  if (xy[1] == (h-1)) { return (w) + (h-2) + (w-1) - xy[0]; }
  if (xy[0] == 0) { return (2*w) + (2*(h-2)) - xy[1]; }

  return -1;
}

function r1_compatible(_s0,_t0,_s1,_t1, _w,_h) {
  let info = _r2k2zzn_normalize(_s0,_t0, _s1,_t1, _w,_h);

  let w = info.w, h = info.h,
      s0 = info.s0, t0 = info.t0,
      s1 = info.s1, t1 = info.t1;

  if (h != 1) { return 0; }
  if (w <  4) { return 0; }

  if ((s0[1] != 0) || (t0[1] != 0) ||
      (s1[1] != 0) || (t1[1] != 0)) { return 0; }      

  if ((s0[0] != 0) || (t1[0] != (w-1))) { return 0; }
  if (t0[0] != (s1[0]-1)) { return 0; }

  return 1;
}

function r2_compatible(_s0,_t0,_s1,_t1, _w,_h) {
  let info = _r2k2zzn_normalize(_s0,_t0, _s1,_t1, _w,_h);

  let w = info.w, h = info.h,
      s0 = info.s0, t0 = info.t0,
      s1 = info.s1, t1 = info.t1;

  if (h != 2) { return 0; }
  if (w <  2) { return 0; }

  if (color_compatible(s0,t0, s1,t1, w,h) == 0) { return 0; }
  if (corner_compatible(s0,t0, s1,t1, w,h) == 0) { return 0; }

  if ((s0[1] != 0) || (t0[1] != 0) ||
      (s1[1] != 0) || (t1[1] != 0)) { return 0; }      

  if ((s0[0] != 0) || (t1[0] != (w-1))) { return 0; }
  if (t0[0] != (s1[0]-1)) { return 0; }

  return 1;
}


// indices into boundary
// checks to see if there is an alternating sequence
//
// return:
//
//   1 - peripheral compatible
//   0 - peripheral incompatible (alternating start/end on boundary)
//
function peripheral_compatible(u0,v0,u1,v1, w,h) {

  let info = [
    { "idx": u0, "p": 0 },
    { "idx": v0, "p": 0 },
    { "idx": u1, "p": 1 },
    { "idx": v1, "p": 1 }
  ].sort( function(a,b) {
    return (a.idx < b.idx) ? -1 : ((a.idx > b.idx) ? 1 : 0);
  });

  let m = info.length;

  for (let i=0; i<m; i++) {
    let ip = (i+1)%m;
    let im = (i+m-1)%m;

    if ( (info[i].p != info[ip].p) &&
         (info[i].p != info[im].p) ) { return 0; }
  }

  return 1;
}

// check to see if path endpoints from different paths
// box in a corner.
// If the corner is boxed in, no path is possible.
//
// return:
//
//   1 - corner compatible (no boxed in corner)
//   0 - conrner incompatible (boxed in corner)
//
function corner_compatible(s0,t0, s1,t1, w,h) {
  let corner_info = [
    { "p": [  0,  0], "nei": [ [  1,  0], [  0,  1] ], "nei_path_id": [-1,-1] },
    { "p": [w-1,  0], "nei": [ [w-2,  0], [w-1,  1] ], "nei_path_id": [-1,-1] },
    { "p": [w-1,h-1], "nei": [ [w-1,h-2], [w-2,h-1] ], "nei_path_id": [-1,-1] },
    { "p": [  0,h-1], "nei": [ [  1,h-1], [  0,h-2] ], "nei_path_id": [-1,-1] }
  ];

  let n_path = 2;
  let corner_count = 0;

  for (let i=0; i<corner_info.length; i++) {
    let ci = corner_info[i];
    if ( (cmp_v( ci.p, s0 ) == 0) ||
         (cmp_v( ci.p, t0 ) == 0) ||
         (cmp_v( ci.p, s1 ) == 0) ||
         (cmp_v( ci.p, t1 ) == 0) ) { continue; }

    if ( (cmp_v( ci.nei[0], s0 ) == 0) ||
         (cmp_v( ci.nei[0], t0 ) == 0) ) {
      ci.nei_path_id[0] = 0;
    }

    if ( (cmp_v( ci.nei[1], s0 ) == 0) ||
         (cmp_v( ci.nei[1], t0 ) == 0) ) {
      ci.nei_path_id[1] = 0;
    }

    if ( (cmp_v( ci.nei[0], s1 ) == 0) ||
         (cmp_v( ci.nei[0], t1 ) == 0) ) {
      ci.nei_path_id[0] = 1;
    }

    if ( (cmp_v( ci.nei[1], s1 ) == 0) ||
         (cmp_v( ci.nei[1], t1 ) == 0) ) {
      ci.nei_path_id[1] = 1;
    }

    if ((ci.nei_path_id[0] < 0) ||
        (ci.nei_path_id[1] < 0)) { continue; }

    if (ci.nei_path_id[0] != ci.nei_path_id[1]) { return 0; }
    if (ci.nei_path_id[0] == ci.nei_path_id[1]) { corner_count++; }

  }

  if (corner_count == n_path) { return 0; }

  return 1;
}


function _enum_peripheral(w,h, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let c = (2*w) + (2*(h-2));

  // u,v index on rectangular boundary
  //
  let uvuv = [0,0, 0,0];
  let C = [c,c, c,c];

  let Memz = {};
  let soln = [];

  let it = 0,
      //it_est = c*(c-1)*(c-2)*(c-3),
      it_est = c*c*c*c,
      _every = 100;

  do {

    it++;
    if (_debug > 0) {
      if ((it%_every) == 0) {
        console.log("[", it, ",\"/\",", it_est, "]");
      }
    }

    let t1 = _peripheral2xy(uvuv[0], w,h);
    let s1 = _peripheral2xy(uvuv[1], w,h);
    let t0 = _peripheral2xy(uvuv[2], w,h);
    let s0 = _peripheral2xy(uvuv[3], w,h);

    /*
    console.log("wh:", w,h, "uvuv:", uvuv,
      "stst:", s0,t0,s1,t1,
      "distinct:", distinct(s0,t0,s1,t1), 
      "cc:", color_compatible(s0,t0,s1,t1,w,h));
      */

    if (!distinct(s0,t0,s1,t1)) { ibvec_incr(uvuv,C); continue; }
    if (color_compatible(s0,t0,s1,t1,w,h) == 0) { ibvec_incr(uvuv,C); continue; }
    if (peripheral_compatible(uvuv[0],uvuv[1],uvuv[2],uvuv[3],w,h) == 0) { ibvec_incr(uvuv,C); continue; }
    if (corner_compatible(s0,t0,s1,t1,w,h) == 0) { ibvec_incr(uvuv,C); continue; }

    let key = stst_key(s0,t0,s1,t1);
    if (!(key in Memz)) {
      let ctx = r2k2zzn_init(w,h, s0,t0, s1,t1);
      let r = r2k2zzn_solve(ctx);
      soln.push( {"key":key, "S": [s0,s1], "T":[t0,t1], "r": r, "ctx": ctx } );
    }

    mark_stst(Memz,s0,t0,s1,t1,w,h);
    ibvec_incr(uvuv,C);

  } while (!ivec0(uvuv));

  return soln;
}

// enumerate all color compatible (s0,t0), (s1,t1)
// pairs, solution or no, applying flip, permutation
// or rotation symmetry of start/end pairs as necessary
//
function _enum(w,h, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let stst = [0,0, 0,0, 0,0, 0,0];
  let B = [w,h,w,h,w,h,w,h];

  let Memz = {};

  let soln = [];

  let _it = 0,
      _it_est = Math.pow(w*h,4),
      _it_every = 1000;

  do {

    _it++;
    if ((_debug > 0) && ((_it % _it_every)==0)) {
      console.log("[", _it, "\"/\"", _it_est, "]");
    }

    let t1 = [stst[0], stst[1]];
    let s1 = [stst[2], stst[3]];
    let t0 = [stst[4], stst[5]];
    let s0 = [stst[6], stst[7]];


    if (!distinct(s0,t0,s1,t1)) { ibvec_incr(stst,B); continue; }
    if (color_compatible(s0,t0,s1,t1,w,h) == 0) { ibvec_incr(stst,B); continue; }
    if (corner_compatible(s0,t0,s1,t1,w,h) == 0) { ibvec_incr(stst,B); continue; }

    let key = stst_key(s0,t0,s1,t1);
    if (!(key in Memz)) {

      console.log("###", stst);

      let ctx = r2k2zzn_init(w,h, s0,t0, s1,t1, 1);
      let r = r2k2zzn_solve(ctx);
      //console.log("s0:", s0, "t0:", t0, "s1:", s1, "t1:", t1, ":::", r);

      soln.push( {"key":key, "S": [s0,s1], "T":[t0,t1], "r": r, "ctx": ctx } );
    }

    mark_stst(Memz,s0,t0,s1,t1,w,h);
    ibvec_incr(stst,B);

  } while (!ivec0(stst));


  if (_debug > 1) {
    console.log("memz:");
    for (let key in Memz) { console.log(key); }
  }

  if (_debug > 0) {
    for (let i=0; i<soln.length; i++) {
      console.log(soln[i].key, JSON.stringify(soln[i].ctx.path));
    }
  }

  return soln;

}



//if (typeof module !== "undefined") {

if ((typeof require !== "undefined") &&
      (require.main === module)) {


  function _main_enum_data() {

    let wh_sched = [
      [2,2],
      [3,2], [3,3],
      [4,2], [4,3], [4,4],
      [5,2], [5,3], [5,4], [5,5],
      [6,2], [6,3], [6,4]  ];
    //wh_sched = [ [2,2], [3,2], [3,3] ];

    let _data = {
      "WH": wh_sched,
      "s": []
    };


    for (let sched_idx=0; sched_idx < wh_sched.length; sched_idx++) {
      let wh = wh_sched[sched_idx];

      let soln = _enum(wh[0], wh[1]);

      _data.s.push(soln);
    }

    //console.log(JSON.stringify(_data));
    console.log("var r2k2zzn_enum = " + JSON.stringify(_data) + ";");

  }

  function _main_enum_wh(w,h,_debug) {
    _debug = ((typeof _debug === "undefined") ? 0 : _debug);

    let wh_sched = [ [w,h] ];
    let _data = {
      "WH": wh_sched,
      "s": []
    };

    for (let sched_idx=0; sched_idx < wh_sched.length; sched_idx++) {
      let wh = wh_sched[sched_idx];
      let soln = _enum(wh[0], wh[1], _debug);
      _data.s.push(soln);
    }


    console.log( JSON.stringify(_data) );

  }

  function _main_enum_peripheral_data(w,h,_debug) {
    _debug = ((typeof _debug === "undefined") ? 0 : _debug);

    let wh_sched = [ [w,h] ];
    let _data = {
      "WH": wh_sched,
      "s": []
    };


    for (let sched_idx=0; sched_idx < wh_sched.length; sched_idx++) {
      let wh = wh_sched[sched_idx];
      let soln = _enum_peripheral(wh[0], wh[1], _debug);
      _data.s.push(soln);
    }

    console.log( JSON.stringify(_data) );
  }

  function _main(argv) {
    let _debug = 0;

    let op = "help";
    let w = -1,
        h = -1;

    let stst = [ -1,-1, -1,-1, -1,-1, -1,-1 ];

    if (argv.length > 0) {
      op = argv[0];

      if (argv.length > 1) {
        let a = argv[1].split(",");

        w = parseInt(a[0]);
        h = w;
        if (a.length > 1) {
          h = parseInt(a[1]);
        }

        if (argv.length > 2) {
          let sta = argv[2].split(",");

          for (let i=0; i<sta.length; i++) {
            stst[i] = parseInt(sta[i]);
          }
        }

      }
    }

    if (op == "init") {
      let s0 = [stst[0], stst[1]];
      let t0 = [stst[2], stst[3]];
      let s1 = [stst[4], stst[5]];
      let t1 = [stst[6], stst[7]];
      let ctx = r2k2zzn_init(w,h, s0,t0, s1,t1, 1 );
      console.log( JSON.stringify(ctx) );
      return;
    }

    if (op == "r1") {
      let s0 = [stst[0], stst[1]];
      let t0 = [stst[2], stst[3]];
      let s1 = [stst[4], stst[5]];
      let t1 = [stst[6], stst[7]];
      console.log("r1_compatible:", r1_compatible(s0,t0, s1,t1, w,h));
      return;
    }

    if (op == "enum.data") {
      _main_enum_data();
      return;
    }

    if (op == "enum.wh") {
      _main_enum_wh(w,h, 1);
      return;
    }

    else if (op == "enum_peripheral.data") {
      _main_enum_peripheral_data(w,h);
      return;
    }

    else if (op == "enum_peripheral.data.i") {
      _main_enum_peripheral_data(w,h, 1);
      return;
    }


    else if ((op == "help") ||
        (w < 0) ||
        (h < 0)) {
      console.log("prog <op> w,h [s0x,s0y,t0x,t0y,s1x,s1y,t1x,t1y]");
      console.log("");
      console.log(" op - help,enum,enum_peripheral,solve");
      console.log("");
      return;
    }

    if (op == "enum") {
      let soln = _enum(w,h);
      return;
    }

    if (op == "enum_peripheral") {
      let soln = _enum_peripheral(w,h);
      return;
    }

    else if (op == "solve") {
      for (let i=0; i<stst.length; i+=2) {
        if ((stst[i]   < 0) || (stst[i]   >= w) ||
            (stst[i+1] < 0) || (stst[i+1] >= h)) {
          console.log("one of s0,t0,s1,t1 out of bounds");
          return;
        }
      }

      let s0 = [stst[0], stst[1]];
      let t0 = [stst[2], stst[3]];

      let s1 = [stst[4], stst[5]];
      let t1 = [stst[6], stst[7]];

      let ctx = r2k2zzn_init(w,h, s0,t0, s1,t1);
      let r = r2k2zzn_solve(ctx);
      console.log("#got:", r, "(", ctx._node_count, ")");
      if (r >= 0) {
        r2k2zzn_gnuplot_print_path(ctx);
      }
    }

    else {
      console.log("unknown op:", op);
    }

  }

  function __debug_main(argv) {

    op = "10x1";
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


  //console.log(process.argv);
  _main(process.argv.slice(2));

}


if (typeof module !== "undefined") {
  var r2k2zzn = R2K2ZZN_func_name_map;

  for (let fname in R2K2ZZN_func_name_map) {
    module.exports[fname] = R2K2ZZN_func_name_map[fname];
  }

}
