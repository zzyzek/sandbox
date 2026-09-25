// zzn_solve.js
//
// Solver for two-color Zig-Zag Numberlink (k=2 ZZN) on an arbitrary R x C rectangle.
//
// Given endpoints s0,t0 (color 0) and s1,t1 (color 1), find two vertex-disjoint
// paths, s0-t0 and s1-t1, that together visit every cell.
//
// Method:
//
//   1. Reject the instance if it matches the forbidden-pattern catalogue
//      (zzn_patterns.js).
//   2. Solve recursively:
//      - both sides <= 10: exact plug dynamic program (plugdp),
//      - otherwise cut the rectangle in two with a straight "cleave" cut and
//        solve the two halves, placing virtual endpoints on either side of the
//        cut where a path crosses it.
//   3. Single-path (k=1) pieces are checked with the Itai-Papadimitriou-
//      Szwarcfiter (IPS) acceptability test and solved by the same recursion.
//
// Usage:
//
//   node zzn_solve.js R C s0r s0c t0r t0c s1r s1c t1r t1c [--grid]
//
// or, as a module:
//
//   var zzn = require("./zzn_solve.js");
//   var res = zzn.solve(R, C, [s0r,s0c], [t0r,t0c], [s1r,s1c], [t1r,t1c]);
//
"use strict";

var zzn_patterns = require("./zzn_patterns.js");

// Size policy.
//
// BASE_MAX_SIDE    both sides at most this: solve with plugdp
// CLEAVE_REQUIRED  either side at least this: a cleave cut must be found
// PLUG_MAX_WIDTH   largest short side the plugdp fallback will attempt
// EXACT_CHECK      two-path pieces with a short side at most this are checked
//                  for feasibility exactly (plugdp forward pass) instead of by
//                  the pattern catalogue, which was validated on grids with
//                  both sides >= 10
// TRIES_PER_CUT    recursive attempts per cut (feasibility checks are unlimited)
// CALL_BUDGET      cap on recursive calls, to bound the search
//
var BASE_MAX_SIDE   = 10,
    CLEAVE_REQUIRED = 26,
    PLUG_MAX_WIDTH  = 12,
    EXACT_CHECK     = 8,
    TRIES_PER_CUT   = 4,
    CALL_BUDGET     = 200000;

// Results of a recursive solve.
//
var SOLVED     = 1,
    INFEASIBLE = 0,
    FAILED     = -1;

//----------------------------------------------------------------------------
// IPS acceptability (Itai, Papadimitriou, Szwarcfiter 1982)
//----------------------------------------------------------------------------

// Checkerboard color relative to the rectangle's own corner.
//
function ips_color(r, c) { return ((r + c) & 1); }

// Width-3 exception (condition F3): an even-length 3-wide strip rejects some
// endpoint pairs of the right colors.
//
function ips_f3_forbidden(m, n, sr, sc, tr, tc) {
  var vx, vy, wx, wy, L;

  if      (m === 3) { vx = sc; vy = sr; wx = tc; wy = tr; L = n; }
  else if (n === 3) { vx = sr; vy = sc; wx = tr; wy = tc; L = m; }
  else              { return false; }

  if ((L % 2) !== 0) { return false; }

  for (var k = 0; k < 2; k++) {
    var x1 = ( (k === 0) ? vx : wx ),
        y1 = ( (k === 0) ? vy : wy ),
        x2 = ( (k === 0) ? wx : vx ),
        y2 = ( (k === 0) ? wy : vy );
    if (ips_color(x2, y2) !== 0) { continue; }
    if (ips_color(x1, y1) !== 1) { continue; }
    if ( (x1 < (x2 - 1)) ||
         ((y1 === 1) && (x1 < x2)) ) {
      return true;
    }
  }
  return false;
}

// Does an m x n rectangle have a Hamiltonian path from (sr,sc) to (tr,tc)?
//
function ips_ok(m, n, sr, sc, tr, tc) {
  if ((sr === tr) && (sc === tc)) { return ((m * n) === 1); }

  var total = m * n,
      cs    = ips_color(sr, sc),
      ct    = ips_color(tr, tc);

  // Color compatibility: an even rectangle needs one endpoint of each color,
  // an odd one needs both endpoints on the majority (corner) color.
  //
  if ((total % 2) === 0) {
    if (cs === ct) { return false; }
  }
  else {
    if ( (cs !== 0) || (ct !== 0) ) { return false; }
  }

  // F1: a single row or column can only be walked end to end.
  //
  if (m === 1) { return ( ((sc === 0) || (sc === (n - 1))) && ((tc === 0) || (tc === (n - 1))) ); }
  if (n === 1) { return ( ((sr === 0) || (sr === (m - 1))) && ((tr === 0) || (tr === (m - 1))) ); }

  // F2: in a 2-wide strip, the endpoints may not form an interior rung.
  //
  if ((m === 2) || (n === 2)) {
    var adj = ((Math.abs(sr - tr) + Math.abs(sc - tc)) === 1);
    if (adj) {
      if ( (m === 2) && (sr !== tr) && (sc > 0) && (sc < (n - 1)) ) { return false; }
      if ( (n === 2) && (sc !== tc) && (sr > 0) && (sr < (m - 1)) ) { return false; }
    }
    return true;
  }

  if ((m === 3) || (n === 3)) { return !ips_f3_forbidden(m, n, sr, sc, tr, tc); }
  return true;
}

//----------------------------------------------------------------------------
// plugdp: exact plug dynamic program with path reconstruction
//----------------------------------------------------------------------------
//
// The sweep processes cells column by column, top to bottom. The frontier
// holds R+1 plugs, 3 bits each, packed into a Number (at most 13 plugs, 39
// bits, well within exact double-precision integers):
//
//   slot i < r      right plug of cell (i, c)
//   slot r          down plug of cell (r-1, c)       -> "up" of the current cell
//   slot i > r      right plug of cell (i-1, c-1)    -> slot r+1 is "left"
//
// Plug values: empty, anchor (fragment attached to an endpoint) of either
// color, and open/close brackets of either color for fragments attached to no
// endpoint. Fragments are disjoint paths in a planar region, so their frontier
// ends nest like brackets.
//

var PD_EM = 0, PD_A0 = 1, PD_A1 = 2,
    PD_O0 = 3, PD_C0 = 4, PD_O1 = 5, PD_C1 = 6;

var POW8 = [];
(function () {
  var p = 1;
  for (var i = 0; i < 20; i++) { POW8.push(p); p *= 8; }
})();

function pd_get(s, i)    { return (Math.floor(s / POW8[i]) % 8); }
function pd_set(s, i, v) { return (s + ((v - pd_get(s, i)) * POW8[i])); }

function pd_is_anchor(v) { return ((v === PD_A0) || (v === PD_A1)); }
function pd_is_open(v)   { return ((v === PD_O0) || (v === PD_O1)); }
function pd_is_close(v)  { return ((v === PD_C0) || (v === PD_C1)); }
function pd_color(v)     { return ( pd_is_anchor(v) ? (v - 1) : ((v - 3) >> 1) ); }
function pd_anchor(c)    { return (1 + c); }
function pd_open(c)      { return (3 + (2 * c)); }
function pd_close(c)     { return (4 + (2 * c)); }

// Frontier position of the bracket matching the one at slot i.
//
function pd_partner(s, i, n) {
  var v = pd_get(s, i), depth = 0, j, w;

  if (pd_is_open(v)) {
    for (j = i + 1; j < n; j++) {
      w = pd_get(s, j);
      if      (pd_is_open(w))  { depth++; }
      else if (pd_is_close(w)) {
        if (depth === 0) { return j; }
        depth--;
      }
    }
  }
  else {
    for (j = i - 1; j >= 0; j--) {
      w = pd_get(s, j);
      if      (pd_is_close(w)) { depth++; }
      else if (pd_is_open(w))  {
        if (depth === 0) { return j; }
        depth--;
      }
    }
  }
  return -1;
}

// All successor states of s after processing cell (r, c). tc is the endpoint
// color at the cell (-1 if none); allow[col] says whether a color has any
// endpoints (a color without endpoints may not open new fragments).
//
function pd_step(s, r, n, tc, can_right, can_down, allow, out) {
  var nout   = 0,
      budget = ( (tc >= 0) ? 1 : 2 ),
      navail = ( can_right ? 1 : 0 ) + ( can_down ? 1 : 0 ),
      up     = pd_get(s, r),
      lf     = pd_get(s, r + 1),
      have   = ( (up !== PD_EM) ? 1 : 0 ) + ( (lf !== PD_EM) ? 1 : 0 );

  if (have > budget) { return 0; }
  var need = budget - have;
  if (need > navail) { return 0; }

  var base = pd_set(pd_set(s, r, PD_EM), r + 1, PD_EM);

  // No plug enters the cell: start a fragment.
  //
  if (have === 0) {
    if (tc >= 0) {
      if (can_right) { out[nout++] = pd_set(base, r,     pd_anchor(tc)); }
      if (can_down)  { out[nout++] = pd_set(base, r + 1, pd_anchor(tc)); }
    }
    else {
      for (var col = 0; col < 2; col++) {
        if (!allow[col]) { continue; }
        out[nout++] = pd_set(pd_set(base, r, pd_open(col)), r + 1, pd_close(col));
      }
    }
    return nout;
  }

  // One plug enters: end it at an endpoint, or pass it on.
  //
  if (have === 1) {
    var p   = ( (up !== PD_EM) ? up : lf ),
        pos = ( (up !== PD_EM) ? r : (r + 1) ),
        pc  = pd_color(p);
    if (need === 0) {
      if (pc !== tc) { return 0; }
      if (pd_is_anchor(p)) { out[nout++] = base; }
      else                 { out[nout++] = pd_set(base, pd_partner(s, pos, n), pd_anchor(pc)); }
    }
    else {
      if (can_right) { out[nout++] = pd_set(base, r,     p); }
      if (can_down)  { out[nout++] = pd_set(base, r + 1, p); }
    }
    return nout;
  }

  // Two plugs enter: join them.
  //
  var cc = pd_color(up);
  if (cc !== pd_color(lf)) { return 0; }

  if ( pd_is_anchor(up) && pd_is_anchor(lf) ) {
    out[nout++] = base;
  }
  else if ( pd_is_anchor(up) || pd_is_anchor(lf) ) {
    var bpos = ( pd_is_anchor(up) ? (r + 1) : r );
    out[nout++] = pd_set(base, pd_partner(s, bpos, n), pd_anchor(cc));
  }
  else if ( pd_is_open(up) && pd_is_close(lf) ) {

    // The two plugs are partners: joining them closes a loop.
    //
    return 0;
  }
  else if ( pd_is_close(up) && pd_is_open(lf) ) {
    out[nout++] = base;
  }
  else if (pd_is_open(up)) {
    out[nout++] = pd_set(base, pd_partner(s, r + 1, n), pd_open(cc));
  }
  else {
    out[nout++] = pd_set(base, pd_partner(s, r, n), pd_close(cc));
  }
  return nout;
}

function pd_sig(v) { return ( (v === PD_EM) ? 0 : (1 + pd_color(v)) ); }

// Slots 0..upto of s agree with those of t in emptiness and color. Within a
// column these never change again after the cell that sets them, so any state
// that disagrees with the column's end state can be dropped.
//
function pd_prefix_match(s, t, upto) {
  for (var j = 0; j <= upto; j++) {
    if (pd_sig(pd_get(s, j)) !== pd_sig(pd_get(t, j))) { return false; }
  }
  return true;
}

// Forward pass of plugdp. Stores the state set at the start of each column in
// ckpt (if given) and returns whether the instance is feasible.
//
function plugdp_forward(R, C, n, term, allow, ckpt) {
  var out = [0, 0, 0, 0],
      cur = new Set([0]),
      r, c;

  for (c = 0; c < C; c++) {
    if (c > 0) {
      var shifted = new Set();
      cur.forEach(function (s) { shifted.add(s * 8); });
      cur = shifted;
    }
    if (ckpt) { ckpt.push(Array.from(cur)); }

    for (r = 0; r < R; r++) {
      var nxt = new Set(),
          tc  = term[(r * C) + c],
          cr  = (c < (C - 1)),
          cd  = (r < (R - 1));
      cur.forEach(function (s) {
        var m = pd_step(s, r, n, tc, cr, cd, allow, out);
        for (var j = 0; j < m; j++) { nxt.add(out[j]); }
      });
      cur = nxt;
      if (cur.size === 0) { return false; }
    }
  }
  return cur.has(0);
}

// Set up the sweep (transposed so that the short side is swept) and return
// { R, C, n, term, allow, tr }.
//
function plugdp_setup(h, w, ends) {
  var tr = (h > w),
      R  = ( tr ? w : h ),
      C  = ( tr ? h : w ),
      term  = new Int8Array(R * C).fill(-1),
      allow = [false, false];

  for (var i = 0; i < ends.length; i++) {
    var er = ( tr ? ends[i].c : ends[i].r ),
        ec = ( tr ? ends[i].r : ends[i].c );
    term[(er * C) + ec] = ends[i].color;
    allow[ends[i].color] = true;
  }
  return { R: R, C: C, n: R + 1, term: term, allow: allow, tr: tr };
}

// Exact feasibility only (no path reconstruction).
//
function plugdp_feasible(h, w, ends) {
  var S = plugdp_setup(h, w, ends);
  return plugdp_forward(S.R, S.C, S.n, S.term, S.allow, null);
}

// Solve an h x w instance exactly. ends: array of {r, c, color} in local
// coordinates (2 endpoints for one path, 4 for two). Returns an array of
// edges [r0, c0, r1, c1] in local coordinates, or null if infeasible.
//
function plugdp_solve(h, w, ends) {
  var S     = plugdp_setup(h, w, ends),
      tr    = S.tr,
      R     = S.R,
      C     = S.C,
      n     = S.n,
      term  = S.term,
      allow = S.allow;

  var out  = [0, 0, 0, 0],
      ckpt = [],
      cur  = new Set([0]),
      r, c, k, q;

  if (plugdp_forward(R, C, n, term, allow, ckpt) === false) { return null; }

  // Backward pass: rerun each column from its checkpoint, keeping predecessor
  // links and dropping states that disagree with the known end-of-column state.
  //
  var edges  = [],
      target = 0;

  for (c = C - 1; c >= 0; c--) {
    var keys  = [ckpt[c]],
        preds = [null];

    for (r = 0; r < R; r++) {
      var map  = new Map(),
          nk   = [],
          np   = [],
          tc2  = term[(r * C) + c],
          cr2  = (c < (C - 1)),
          cd2  = (r < (R - 1)),
          prev = keys[r];

      for (q = 0; q < prev.length; q++) {
        var m2 = pd_step(prev[q], r, n, tc2, cr2, cd2, allow, out);
        for (k = 0; k < m2; k++) {
          var sk = out[k];
          if (!pd_prefix_match(sk, target, r)) { continue; }
          if (map.has(sk)) { continue; }
          map.set(sk, nk.length);
          nk.push(sk);
          np.push(q);
        }
      }
      keys.push(nk);
      preds.push(np);
    }

    var idx = keys[R].indexOf(target);
    if (idx < 0) { throw new Error("plugdp: reconstruction lost the target state"); }

    for (r = R; r >= 1; r--) {
      var after = keys[r][idx];
      if (pd_get(after, r - 1) !== PD_EM) { edges.push([r - 1, c, r - 1, c + 1]); }
      if (pd_get(after, r)     !== PD_EM) { edges.push([r - 1, c, r, c]); }
      idx = preds[r][idx];
    }
    target = keys[0][idx] / 8;
  }

  if (tr) {
    edges = edges.map(function (e) { return [e[1], e[0], e[3], e[2]]; });
  }
  return edges;
}

//----------------------------------------------------------------------------
// Hamiltonian cycle of an endpoint-free rectangle
//----------------------------------------------------------------------------

// A Hamiltonian cycle of an h x w rectangle (even area, both sides >= 2) that
// uses every edge along one side ("top", "bottom", "left" or "right"). Returns
// the cells in cycle order, local coordinates.
//
// Built in a frame where the chosen side is the top row. With an even frame
// width: walk the top row, then snake back through the columns below it. With
// an odd width (so an even height): walk down the left column, then snake back
// up through the rows to its right, ending along the top row.
//
function ham_cycle(h, w, side) {
  var sideways = ((side === "left") || (side === "right")),
      fh       = ( sideways ? w : h ),
      fw       = ( sideways ? h : w ),
      cyc      = [],
      r, c;

  if ((fw % 2) === 0) {
    for (c = 0; c < fw; c++) { cyc.push([0, c]); }
    for (c = fw - 1; c >= 0; c--) {
      if (((fw - 1 - c) % 2) === 0) { for (r = 1; r < fh; r++)   { cyc.push([r, c]); } }
      else                          { for (r = fh - 1; r >= 1; r--) { cyc.push([r, c]); } }
    }
  }
  else {
    for (r = 0; r < fh; r++) { cyc.push([r, 0]); }
    for (r = fh - 1; r >= 0; r--) {
      if (((fh - 1 - r) % 2) === 0) { for (c = 1; c < fw; c++)   { cyc.push([r, c]); } }
      else                          { for (c = fw - 1; c >= 1; c--) { cyc.push([r, c]); } }
    }
  }

  return cyc.map(function (p) {
    if (side === "top")    { return [p[0], p[1]]; }
    if (side === "bottom") { return [h - 1 - p[0], p[1]]; }
    if (side === "left")   { return [p[1], p[0]]; }
    return [p[1], w - 1 - p[0]];
  });
}

//----------------------------------------------------------------------------
// Recursive solver
//----------------------------------------------------------------------------

// Endpoints of a (sub)instance are {r, c, color} in global coordinates, two
// per color in order: ends[2*col], ends[2*col+1]. A rectangle is
// {r0, c0, h, w}. Solutions are appended to ctx.edges as [r0, c0, r1, c1] in
// global coordinates; a failed attempt truncates what it added.
//

function same_cell(a, b) { return ((a.r === b.r) && (a.c === b.c)); }

function all_distinct(ends) {
  for (var i = 0; i < ends.length; i++) {
    for (var j = i + 1; j < ends.length; j++) {
      if (same_cell(ends[i], ends[j])) { return false; }
    }
  }
  return true;
}

function in_rect(rect, e) {
  return ( (e.r >= rect.r0) && (e.r < (rect.r0 + rect.h)) &&
           (e.c >= rect.c0) && (e.c < (rect.c0 + rect.w)) );
}

// Feasibility check for a sub-instance before trying to solve it: the exact
// IPS test for one path, the forbidden-pattern catalogue for two.
//
function sub_feasible(rect, ends) {
  if (ends.length === 2) {
    return ips_ok(rect.h, rect.w,
                  ends[0].r - rect.r0, ends[0].c - rect.c0,
                  ends[1].r - rect.r0, ends[1].c - rect.c0);
  }
  if (!all_distinct(ends)) { return false; }
  var p = function (e) { return [e.r - rect.r0, e.c - rect.c0]; };
  if (zzn_patterns.findForbiddenPattern(rect.h, rect.w, p(ends[0]), p(ends[1]), p(ends[2]), p(ends[3])) !== null) { return false; }
  if (Math.min(rect.h, rect.w) <= EXACT_CHECK) {
    var local = ends.map(function (e) { return { r: e.r - rect.r0, c: e.c - rect.c0, color: e.color }; });
    return plugdp_feasible(rect.h, rect.w, local);
  }
  return true;
}

// Base case: exact plugdp on the rectangle.
//
function solve_base(ctx, rect, ends) {
  var local = ends.map(function (e) { return { r: e.r - rect.r0, c: e.c - rect.c0, color: e.color }; });
  var edges = plugdp_solve(rect.h, rect.w, local);
  if (edges === null) { return INFEASIBLE; }
  for (var i = 0; i < edges.length; i++) {
    var e = edges[i];
    ctx.edges.push([e[0] + rect.r0, e[1] + rect.c0, e[2] + rect.r0, e[3] + rect.c0]);
  }
  return SOLVED;
}

// The two pieces of a cut, and the cells on either side of it. A vertical cut
// at p splits off columns [0,p) (piece a) from [p,w) (piece b); a horizontal
// cut does the same with rows. cross(q) gives the pair of cells, one on each
// side, at position q along the cut.
//
function make_cut(rect, vertical, p) {
  var cut = { vertical: vertical, p: p };
  if (vertical) {
    cut.a   = { r0: rect.r0, c0: rect.c0,     h: rect.h, w: p };
    cut.b   = { r0: rect.r0, c0: rect.c0 + p, h: rect.h, w: rect.w - p };
    cut.len = rect.h;
    cut.cross = function (q) {
      return [ { r: rect.r0 + q, c: rect.c0 + p - 1 }, { r: rect.r0 + q, c: rect.c0 + p } ];
    };
    cut.along = function (e) { return (e.r - rect.r0); };
  }
  else {
    cut.a   = { r0: rect.r0,     c0: rect.c0, h: p,          w: rect.w };
    cut.b   = { r0: rect.r0 + p, c0: rect.c0, h: rect.h - p, w: rect.w };
    cut.len = rect.w;
    cut.cross = function (q) {
      return [ { r: rect.r0 + p - 1, c: rect.c0 + q }, { r: rect.r0 + p, c: rect.c0 + q } ];
    };
    cut.along = function (e) { return (e.c - rect.c0); };
  }
  return cut;
}

// Every cut, best first. Prefer cuts across the longer side, near the middle,
// and at least a few cells away from every endpoint.
//
function cut_candidates(rect, ends) {
  var cands   = [],
      prefer_v = (rect.w >= rect.h);

  [true, false].forEach(function (vertical) {
    var len = ( vertical ? rect.w : rect.h );
    for (var p = 1; p < len; p++) {
      var clear = len;
      for (var i = 0; i < ends.length; i++) {
        var x = ( vertical ? (ends[i].c - rect.c0) : (ends[i].r - rect.r0) ),
            d = ( (x <= (p - 1)) ? ((p - 1) - x) : (x - p) );
        clear = Math.min(clear, d);
      }
      var score = Math.abs(p - (len / 2)) +
                  (3 * Math.max(0, 3 - clear)) +
                  ( (vertical === prefer_v) ? 0 : (0.5 * Math.max(rect.h, rect.w)) );
      cands.push({ vertical: vertical, p: p, score: score });
    }
  });
  cands.sort(function (x, y) { return ( (x.score - y.score) || (x.p - y.p) ); });
  return cands;
}

// Endpoint-free piece f next to solved piece s: find an edge of s's solution
// running along the cut, and splice in a Hamiltonian cycle of f that uses the
// parallel edge on f's side (cell edge rotation).
//
function splice_cycle(ctx, cut, s_is_a, start) {
  var f       = ( s_is_a ? cut.b : cut.a ),
      side    = ( cut.vertical ? (s_is_a ? "left" : "right") : (s_is_a ? "top" : "bottom") ),
      line_s  = ( cut.vertical ? (s_is_a ? (cut.a.c0 + cut.a.w - 1) : cut.b.c0) : (s_is_a ? (cut.a.r0 + cut.a.h - 1) : cut.b.r0) ),
      line_f  = ( cut.vertical ? (s_is_a ? cut.b.c0 : (cut.a.c0 + cut.a.w - 1)) : (s_is_a ? cut.b.r0 : (cut.a.r0 + cut.a.h - 1)) ),
      found   = -1,
      i;

  for (i = start; (i < ctx.edges.length) && (found < 0); i++) {
    var e = ctx.edges[i];
    if (e === null) { continue; }
    if ( cut.vertical && (e[1] === line_s) && (e[3] === line_s) ) { found = i; }
    if ( (!cut.vertical) && (e[0] === line_s) && (e[2] === line_s) ) { found = i; }
  }
  if (found < 0) { return false; }

  var e0 = ctx.edges[found],
      x1 = [e0[0], e0[1]], x2 = [e0[2], e0[3]],
      y1 = ( cut.vertical ? [x1[0], line_f] : [line_f, x1[1]] ),
      y2 = ( cut.vertical ? [x2[0], line_f] : [line_f, x2[1]] );

  var cyc = ham_cycle(f.h, f.w, side).map(function (p) { return [p[0] + f.r0, p[1] + f.c0]; });
  ctx.edges[found] = null;
  for (i = 0; i < cyc.length; i++) {
    var u = cyc[i], v = cyc[(i + 1) % cyc.length];
    var is_skip = ( ((u[0] === y1[0]) && (u[1] === y1[1]) && (v[0] === y2[0]) && (v[1] === y2[1])) ||
                    ((u[0] === y2[0]) && (u[1] === y2[1]) && (v[0] === y1[0]) && (v[1] === y1[1])) );
    if (!is_skip) { ctx.edges.push([u[0], u[1], v[0], v[1]]); }
  }
  ctx.edges.push([x1[0], x1[1], y1[0], y1[1]]);
  ctx.edges.push([x2[0], x2[1], y2[0], y2[1]]);
  return true;
}

// Solve two independent sub-instances, then add the crossing edges.
//
function solve_pair(ctx, ra, ea, rb, eb, crossings) {
  var start = ctx.edges.length;
  if (solve_rect(ctx, ra, ea) !== SOLVED) { ctx.edges.length = start; return false; }
  if (solve_rect(ctx, rb, eb) !== SOLVED) { ctx.edges.length = start; return false; }
  for (var i = 0; i < crossings.length; i++) {
    var x = crossings[i];
    ctx.edges.push([x[0].r, x[0].c, x[1].r, x[1].c]);
  }
  return true;
}

// Try one cut. Returns true if the rectangle was solved with it.
//
function try_cut(ctx, rect, ends, cut) {
  var in_a  = ends.map(function (e) { return in_rect(cut.a, e); }),
      na    = in_a.filter(Boolean).length,
      k     = ends.length / 2,
      tries = 0,
      q, q0, q1, i;

  // All endpoints on one side: solve it, then splice a Hamiltonian cycle of
  // the other (endpoint-free) side into its solution.
  //
  if ( (na === 0) || (na === ends.length) ) {
    var s_is_a = (na === ends.length),
        s      = ( s_is_a ? cut.a : cut.b ),
        f      = ( s_is_a ? cut.b : cut.a );
    if ( (((f.h * f.w) % 2) !== 0) || (Math.min(f.h, f.w) < 2) ) { return false; }
    if (!sub_feasible(s, ends)) { return false; }
    var start = ctx.edges.length;
    if (solve_rect(ctx, s, ends) !== SOLVED) { ctx.edges.length = start; return false; }
    if (!splice_cycle(ctx, cut, s_is_a, start)) { ctx.edges.length = start; return false; }
    return true;
  }

  // Order crossing positions by distance from a reference coordinate.
  //
  var positions = function (ref) {
    var qs = [];
    for (var z = 0; z < cut.len; z++) { qs.push(z); }
    qs.sort(function (x, y) { return ( (Math.abs(x - ref) - Math.abs(y - ref)) || (x - y) ); });
    return qs;
  };
  var endp = function (e, color) { return { r: e.r, c: e.c, color: color }; };

  // One path, one endpoint on each side: it crosses the cut once.
  //
  if (k === 1) {
    var ea = ( in_a[0] ? ends[0] : ends[1] ),
        eb = ( in_a[0] ? ends[1] : ends[0] ),
        qs = positions(cut.along(ea));
    for (i = 0; i < qs.length; i++) {
      var x = cut.cross(qs[i]);
      var sa = [endp(ea, 0), endp(x[0], 0)],
          sb = [endp(x[1], 0), endp(eb, 0)];
      if ( (!sub_feasible(cut.a, sa)) || (!sub_feasible(cut.b, sb)) ) { continue; }
      if (solve_pair(ctx, cut.a, sa, cut.b, sb, [x])) { return true; }
      if (++tries >= TRIES_PER_CUT) { return false; }
    }
    return false;
  }

  // Two paths, one endpoint alone on its side: that path crosses once. The
  // lone side becomes a one-path instance, the other a two-path instance.
  //
  if ( (na === 1) || (na === 3) ) {
    var lone_in_a = (na === 1), li = -1;
    for (i = 0; i < 4; i++) {
      if (in_a[i] === lone_in_a) { li = i; }
    }
    var lc      = li >> 1,
        lone    = ends[li],
        mate    = ends[li ^ 1],
        oc      = 1 - lc,
        r_lone  = ( lone_in_a ? cut.a : cut.b ),
        r_rest  = ( lone_in_a ? cut.b : cut.a ),
        qs1     = positions(cut.along(lone));

    for (i = 0; i < qs1.length; i++) {
      var xx     = cut.cross(qs1[i]),
          v_lone = ( lone_in_a ? xx[0] : xx[1] ),
          v_rest = ( lone_in_a ? xx[1] : xx[0] );
      var s1 = [endp(lone, 0), endp(v_lone, 0)],
          s3 = [];
      s3[2 * lc]       = endp(mate, lc);
      s3[(2 * lc) + 1] = endp(v_rest, lc);
      s3[2 * oc]       = endp(ends[2 * oc], oc);
      s3[(2 * oc) + 1] = endp(ends[(2 * oc) + 1], oc);
      if ( (!sub_feasible(r_lone, s1)) || (!sub_feasible(r_rest, s3)) ) { continue; }
      if (solve_pair(ctx, r_lone, s1, r_rest, s3, [xx])) { return true; }
      if (++tries >= TRIES_PER_CUT) { return false; }
    }
    return false;
  }

  // Two paths, two endpoints on each side.
  //
  var same_a = (in_a[0] === in_a[1]);

  // Each side holds both endpoints of one color: two one-path instances.
  //
  if (same_a) {
    var ca  = ( in_a[0] ? 0 : 1 ),
        cb  = 1 - ca,
        pa  = [endp(ends[2 * ca], 0), endp(ends[(2 * ca) + 1], 0)],
        pb  = [endp(ends[2 * cb], 0), endp(ends[(2 * cb) + 1], 0)];
    if ( (!sub_feasible(cut.a, pa)) || (!sub_feasible(cut.b, pb)) ) { return false; }
    return solve_pair(ctx, cut.a, pa, cut.b, pb, []);
  }

  // Each side holds one endpoint of each color: both paths cross the cut, each
  // at its own position; both sides are two-path instances.
  //
  var a0 = ( in_a[0] ? ends[0] : ends[1] ), b0 = ( in_a[0] ? ends[1] : ends[0] ),
      a1 = ( in_a[2] ? ends[2] : ends[3] ), b1 = ( in_a[2] ? ends[3] : ends[2] ),
      r0 = cut.along(a0), r1 = cut.along(a1),
      pairs = [];

  for (q0 = 0; q0 < cut.len; q0++) {
    for (q1 = 0; q1 < cut.len; q1++) {
      if (q0 !== q1) { pairs.push([q0, q1]); }
    }
  }
  pairs.sort(function (x, y) {
    return ( ((Math.abs(x[0] - r0) + Math.abs(x[1] - r1)) - (Math.abs(y[0] - r0) + Math.abs(y[1] - r1))) ||
             (x[0] - y[0]) || (x[1] - y[1]) );
  });

  for (i = 0; i < pairs.length; i++) {
    var x0 = cut.cross(pairs[i][0]),
        x1 = cut.cross(pairs[i][1]);
    var sa2 = [endp(a0, 0), endp(x0[0], 0), endp(a1, 1), endp(x1[0], 1)],
        sb2 = [endp(x0[1], 0), endp(b0, 0), endp(x1[1], 1), endp(b1, 1)];
    if ( (!sub_feasible(cut.a, sa2)) || (!sub_feasible(cut.b, sb2)) ) { continue; }
    if (solve_pair(ctx, cut.a, sa2, cut.b, sb2, [x0, x1])) { return true; }
    if (++tries >= TRIES_PER_CUT) { return false; }
  }
  return false;
}

// Solve a (sub)instance on rect. Returns SOLVED, INFEASIBLE (proved by the
// exact base solver) or FAILED (no cleave cut worked and no base solver
// applies, or the call budget ran out).
//
function solve_rect(ctx, rect, ends) {
  var key = rect.r0 + "," + rect.c0 + "," + rect.h + "," + rect.w + "|" +
            ends.map(function (e) { return e.r + "," + e.c + "," + e.color; }).join("|");
  if (ctx.failed.has(key)) { return ctx.failed.get(key); }

  var res = solve_rect_uncached(ctx, rect, ends);
  if ( (res !== SOLVED) && (!ctx.budget_hit) ) { ctx.failed.set(key, res); }
  return res;
}

// solve_rect without the failure cache.
//
function solve_rect_uncached(ctx, rect, ends) {
  ctx.calls++;
  if (ctx.calls > CALL_BUDGET) { ctx.budget_hit = true; return FAILED; }

  if ((rect.h * rect.w) === 1) { return ( ((ends.length === 2) && same_cell(ends[0], ends[1])) ? SOLVED : INFEASIBLE ); }
  if ( (rect.h <= BASE_MAX_SIDE) && (rect.w <= BASE_MAX_SIDE) ) { return solve_base(ctx, rect, ends); }

  var cands = cut_candidates(rect, ends);
  for (var i = 0; i < cands.length; i++) {
    var start = ctx.edges.length;
    if (try_cut(ctx, rect, ends, make_cut(rect, cands[i].vertical, cands[i].p))) { return SOLVED; }
    ctx.edges.length = start;
    if (ctx.budget_hit) { return FAILED; }
  }

  if (Math.max(rect.h, rect.w) >= CLEAVE_REQUIRED) { return FAILED; }
  if (Math.min(rect.h, rect.w) <= PLUG_MAX_WIDTH)  { return solve_base(ctx, rect, ends); }
  return FAILED;
}

//----------------------------------------------------------------------------
// Top level
//----------------------------------------------------------------------------

// Walk the path starting at cell s through the undirected edge set.
//
function walk_path(adj, s, t, W) {
  var path = [s],
      prev = -1,
      cur  = (s[0] * W) + s[1];

  while ( (path[path.length - 1][0] !== t[0]) ||
          (path[path.length - 1][1] !== t[1]) ) {
    var nb   = adj.get(cur) || [],
        next = -1;
    for (var i = 0; i < nb.length; i++) {
      if (nb[i] !== prev) { next = nb[i]; break; }
    }
    if (next < 0) { return null; }
    prev = cur;
    cur  = next;
    path.push([Math.floor(cur / W), cur % W]);
    if (path.length > adj.size + 2) { return null; }
  }
  return path;
}

// Check that paths[0] joins s0-t0 and paths[1] joins s1-t1, with unit steps,
// no cell used twice, and every cell covered.
//
function verify(R, C, pts, paths) {
  var seen = new Uint8Array(R * C);
  for (var k = 0; k < 2; k++) {
    var p = paths[k];
    if ( (p === null) || (p.length === 0) ) { return "missing path " + k; }
    if ( (p[0][0] !== pts[2 * k][0]) || (p[0][1] !== pts[2 * k][1]) ) { return "path " + k + " starts at the wrong cell"; }
    var last = p[p.length - 1];
    if ( (last[0] !== pts[(2 * k) + 1][0]) || (last[1] !== pts[(2 * k) + 1][1]) ) { return "path " + k + " ends at the wrong cell"; }
    for (var i = 0; i < p.length; i++) {
      var idx = (p[i][0] * C) + p[i][1];
      if (seen[idx]) { return "cell (" + p[i][0] + "," + p[i][1] + ") used twice"; }
      seen[idx] = 1;
      if ( (i > 0) && ((Math.abs(p[i][0] - p[i - 1][0]) + Math.abs(p[i][1] - p[i - 1][1])) !== 1) ) { return "non-adjacent step"; }
    }
  }
  for (var j = 0; j < (R * C); j++) {
    if (!seen[j]) { return "cell (" + Math.floor(j / C) + "," + (j % C) + ") not covered"; }
  }
  return null;
}

// Solve an instance. Returns
//   { status: "solved",     paths: [path0, path1] }   (each a list of [r, c])
//   { status: "infeasible", reason: ... }
//   { status: "error",      reason: ... }             (no cleave cut found)
//
function solve(R, C, s0, t0, s1, t1) {
  var pts = [s0, t0, s1, t1];

  for (var i = 0; i < 4; i++) {
    if ( (pts[i][0] < 0) || (pts[i][0] >= R) || (pts[i][1] < 0) || (pts[i][1] >= C) ) {
      throw new Error("endpoint (" + pts[i][0] + "," + pts[i][1] + ") is outside the grid");
    }
  }
  var ends = pts.map(function (p, j) { return { r: p[0], c: p[1], color: (j >> 1) }; });
  if (!all_distinct(ends)) { throw new Error("the four endpoints must be distinct cells"); }

  var pat = zzn_patterns.findForbiddenPattern(R, C, s0, t0, s1, t1);
  if (pat !== null) { return { status: "infeasible", reason: "forbidden pattern " + pat.id + " at " + pat.where }; }

  var ctx = { edges: [], calls: 0, budget_hit: false, failed: new Map() },
      res = solve_rect(ctx, { r0: 0, c0: 0, h: R, w: C }, ends);

  if (res === INFEASIBLE) { return { status: "infeasible", reason: "exhaustive search (plugdp)" }; }
  if (res !== SOLVED) {
    var why = ( ctx.budget_hit ? "search budget exhausted" : "no cleave cut found" );
    return { status: "error", reason: why };
  }

  var adj = new Map(),
      add = function (a, b) {
        if (!adj.has(a)) { adj.set(a, []); }
        adj.get(a).push(b);
      };
  ctx.edges.forEach(function (e) {
    if (e === null) { return; }
    var a = (e[0] * C) + e[1], b = (e[2] * C) + e[3];
    add(a, b);
    add(b, a);
  });

  var paths = [walk_path(adj, s0, t0, C), walk_path(adj, s1, t1, C)],
      bad   = verify(R, C, pts, paths);
  if (bad !== null) { throw new Error("internal error, invalid solution: " + bad); }
  return { status: "solved", paths: paths };
}

module.exports = {
  solve:        solve,
  plugdp_solve: plugdp_solve,
  ips_ok:       ips_ok,
  ham_cycle:    ham_cycle,
  verify:       verify
};

//----------------------------------------------------------------------------
// Command line
//----------------------------------------------------------------------------

function render(R, C, paths) {
  var g = [];
  for (var r = 0; r < R; r++) { g.push(new Array(C).fill(".")); }
  paths[0].forEach(function (p) { g[p[0]][p[1]] = "a"; });
  paths[1].forEach(function (p) { g[p[0]][p[1]] = "b"; });
  [paths[0][0], paths[0][paths[0].length - 1]].forEach(function (p) { g[p[0]][p[1]] = "A"; });
  [paths[1][0], paths[1][paths[1].length - 1]].forEach(function (p) { g[p[0]][p[1]] = "B"; });
  return g.map(function (row) { return row.join(""); }).join("\n");
}

if (require.main === module) {
  var args = process.argv.slice(2),
      grid = (args.indexOf("--grid") >= 0),
      v    = args.filter(function (a) { return a !== "--grid"; }).map(Number);

  if (v.length !== 10) {
    console.log("usage: node zzn_solve.js R C s0r s0c t0r t0c s1r s1c t1r t1c [--grid]");
    process.exit(1);
  }

  var res = solve(v[0], v[1], [v[2], v[3]], [v[4], v[5]], [v[6], v[7]], [v[8], v[9]]);
  if (res.status !== "solved") {
    console.log(res.status + ": " + res.reason);
  }
  else {
    console.log("solved: path lengths " + res.paths[0].length + " and " + res.paths[1].length);
    if (grid) { console.log(render(v[0], v[1], res.paths)); }
  }
}
