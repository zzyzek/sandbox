// gilbert_ep.js
//
// Generalized Hilbert ("gilbert") curve with arbitrary endpoints.
//
// Given a w x h rectangle and two cells s = (x0,y0) and t = (x1,y1), produce a
// path from s to t that visits every cell once. Steps are orthogonal, except
// that exactly one diagonal step is used when s and t are not color
// compatible (checkerboard coloring: an even rectangle needs endpoints of
// different colors, an odd one needs both on the corner color).
//
// Method:
//
//   The rectangle is split with the same two templates as gilbert2d
//   (https://github.com/jakubcerveny/gilbert):
//
//     - if the major side is more than 3/2 of the minor side, cut the major
//       side in two (pieces L, R),
//     - otherwise halve the minor side and halve the lower half again
//       (pieces A = lower first, B = upper, C = lower second).
//
//   The path visits the pieces in a schedule: the piece holding s first, the
//   piece holding t last. Consecutive pieces are joined at a junction, a pair
//   of adjacent cells on either side of the cleave; these become virtual
//   endpoints of the pieces. Junctions are tried nearest the outer edge of the
//   rectangle first, which is where gilbert2d puts them.
//
//   A piece holding one path segment is solved by the same recursion. If s and
//   t fall in the same piece, the path can leave that piece, cover the others
//   and come back (a loop), so that piece holds two segments.
//
//   Recursion is tried in every form before any non-recursive solver:
//
//     1. the best frame's gilbert2d template, the other template kind, then
//        moved cuts of both (nearest the original cut), each piece visited
//        once,
//     2. loops whose two-segment piece is split by a straight cut into two
//        one-path problems, again solved by the recursion,
//     3. the other seven frames, as in 1.
//
//   Steps 1-3 run first strictly, rejecting any plan whose output has a
//   straight run longer than MAX_RUN (gilbert2d's own curves never exceed 6),
//   then without that limit. Only then come loops whose two-segment piece uses
//   the k=2 Zig-Zag Numberlink solver (zzn_solve.js), and the exact
//   fallbacks below. Counterclockwise loops are tried before clockwise ones.
//   Each rectangle's recursive search has a work budget proportional to its
//   area (within its parent's), so failures deep in the recursion stay cheap.
//
//   Each rectangle picks its orientation (frame) so that its canonical
//   gilbert2d endpoints are as close as possible to its actual endpoints. When
//   s and t are the two corners of one edge the frame is exactly the one
//   gilbert2d would use, and the output is identical to gilbert2d's.
//
//   The diagonal step, when needed, goes as late in the schedule as possible:
//   at a junction, or inside a later piece.
//
//   Fallbacks, for rectangles with a short side of at most PLUG_MAX_SIDE: the
//   exact plug DP from zzn_solve.js, for one orthogonal path, or for a path
//   with one diagonal step p-q as the two orthogonal paths s-p and q-t. A
//   3 x (odd) strip with its endpoints at the middle of a short end and the
//   cell next to it is built directly.
//
// Coordinates are (x, y) with 0 <= x < w, 0 <= y < h. "Counterclockwise" is
// taken with x pointing right and y pointing up; set CCW_SIGN to -1 for
// screen coordinates (y pointing down).
//
// Usage:
//
//   node gilbert_ep.js w h x0 y0 x1 y1        prints the path, one "x y" per line
//
// or, as a module:
//
//   var gep = require("./gilbert_ep.js");
//   var res = gep.gilbert_ep(w, h, x0, y0, x1, y1);
//   // res.status: "ok" | "infeasible" | "error"
//   // res.path:   [[x,y], ...] from (x0,y0) to (x1,y1)     (when "ok")
//   // res.reason: explanation                              (otherwise)
//
"use strict";

var zzn = require("./zzn_solve.js");

// CCW_SIGN         orientation convention for "counterclockwise" (see above)
// CALL_BUDGET      cap on recursive calls plus plans evaluated, plus ...
// CALLS_PER_CELL   ... this many per cell (the plain recursion alone makes on
//                  the order of one call per cell)
// ZZN_BUDGET       cap on k=2 Zig-Zag Numberlink solver calls
// PLUG_MAX_SIDE    largest short side for the exact fallbacks
// DIAG_MAX_AREA    largest area for the exact fallback with a diagonal step ...
// DIAG_NARROW      ... unless the short side is at most this
// MOVED_CUTS       how many moved cuts to try when a template fails
// MAX_RUN          longest straight run allowed in the first (strict) round of
//                  the search; gilbert2d's own curves never exceed 6
// STRICT_TRIES     solved plans the strict round may reject (for too long a
//                  run) in one rectangle before giving up on it
// STRICT_BUDGET    total calls after which strict rounds stop, plus ...
// STRICT_PER_CELL  ... this many per cell (the rest of the search is relaxed)
// LOCAL_BUDGET     calls one rectangle's recursive search may use, plus ...
// LOCAL_PER_CELL   ... this many per cell of the rectangle (within its
//                  parent's); past that it goes to the fallbacks
//
var CCW_SIGN        = 1,
    CALL_BUDGET     = 4000000,
    CALLS_PER_CELL  = 4,
    ZZN_BUDGET      = 1000,
    PLUG_MAX_SIDE   = 12,
    DIAG_MAX_AREA   = 144,
    DIAG_NARROW     = 8,
    MOVED_CUTS      = 16,
    MAX_RUN         = 6,
    STRICT_TRIES    = 32,
    STRICT_BUDGET   = 20000,
    STRICT_PER_CELL = 50,
    LOCAL_BUDGET    = 2000,
    LOCAL_PER_CELL  = 100;

//----------------------------------------------------------------------------
// Cells, boxes and frames
//----------------------------------------------------------------------------
//
// A box is an axis-aligned rectangle of cells {x0, y0, w, h} in global
// coordinates. A frame is an orientation of a box in the style of gilbert2d:
// origin cell p, unit major direction a (length w), unit minor direction b
// (length h). Local coordinates (u, v) map to p + u*a + v*b. The canonical
// gilbert2d path in a frame runs from (0,0) to (w-1,0).
//

function mkpt(x, y) { return { x: x, y: y }; }

function same_pt(a, b) { return ((a.x === b.x) && (a.y === b.y)); }

function in_box(B, q) {
  return ( (q.x >= B.x0) && (q.x < (B.x0 + B.w)) &&
           (q.y >= B.y0) && (q.y < (B.y0 + B.h)) );
}

// The path under construction: parallel coordinate arrays in ctx, appended to
// as pieces are solved and truncated when an attempt fails.
//
function out_push(ctx, x, y) {
  ctx.ox.push(x);
  ctx.oy.push(y);
}

function out_reset(ctx, n) {
  ctx.ox.length = n;
  ctx.oy.length = n;
}

function box_center(B) { return mkpt(B.x0 + ((B.w - 1) / 2), B.y0 + ((B.h - 1) / 2)); }

function frame_pt(F, u, v) {
  return mkpt(F.px + (u * F.ax) + (v * F.bx), F.py + (u * F.ay) + (v * F.by));
}

function frame_uv(F, q) {
  var dx = q.x - F.px,
      dy = q.y - F.py;
  return { u: ((dx * F.ax) + (dy * F.ay)), v: ((dx * F.bx) + (dy * F.by)) };
}

// The box covered by the local rectangle [u0, u0+w) x [v0, v0+h) of a frame.
//
function local_box(F, u0, v0, w, h) {
  var p = frame_pt(F, u0, v0),
      q = frame_pt(F, u0 + w - 1, v0 + h - 1);
  return { x0: Math.min(p.x, q.x), y0: Math.min(p.y, q.y),
           w:  (Math.abs(p.x - q.x) + 1), h: (Math.abs(p.y - q.y) + 1) };
}

// The eight frames of a box: each corner, with the major direction along
// either of its two edges. Frames with the major direction along the longer
// side come first, as in gilbert2d's top-level call.
//
function box_frames(B) {
  var x1  = B.x0 + B.w - 1,
      y1  = B.y0 + B.h - 1,
      cs  = [[B.x0, B.y0], [x1, B.y0], [B.x0, y1], [x1, y1]],
      lng = [],
      sht = [];

  for (var i = 0; i < 4; i++) {
    var cx = cs[i][0],
        cy = cs[i][1],
        ix = ( (cx === B.x0) ? 1 : -1 ),
        iy = ( (cy === B.y0) ? 1 : -1 ),
        fx = { px: cx, py: cy, ax: ix, ay: 0, bx: 0, by: iy, w: B.w, h: B.h },
        fy = { px: cx, py: cy, ax: 0, ay: iy, bx: ix, by: 0, w: B.h, h: B.w };
    if (B.w >= B.h) { lng.push(fx); sht.push(fy); }
    else            { lng.push(fy); sht.push(fx); }
  }
  return lng.concat(sht);
}

// The frames of B ordered by how near (Manhattan distance) their canonical
// endpoints are to s and t, ties in box_frames order. When s and t are the
// corners of one edge the first is the gilbert2d frame running from s to t.
//
function frames_by_score(B, s, t) {
  var fr = box_frames(B).map(function (F, i) {
    var e = frame_pt(F, F.w - 1, 0);
    return { F: F, i: i, d: (Math.abs(s.x - F.px) + Math.abs(s.y - F.py) + Math.abs(t.x - e.x) + Math.abs(t.y - e.y)) };
  });

  fr.sort(function (a, b) { return ( (a.d !== b.d) ? (a.d - b.d) : (a.i - b.i) ); });
  return fr.map(function (o) { return o.F; });
}

//----------------------------------------------------------------------------
// Feasibility tests
//----------------------------------------------------------------------------

// Checkerboard color compatibility of s and t in box B.
//
function compatible(B, s, t) {
  var cs = ((s.x + s.y) & 1),
      ct = ((t.x + t.y) & 1),
      cc = ((B.x0 + B.y0) & 1);

  if (((B.w * B.h) % 2) === 0) { return (cs !== ct); }
  return ( (cs === cc) && (ct === cc) );
}

// Can B have a path s-t with one diagonal step, by the checkerboard count? A
// diagonal step joins two cells of the same color, so the path is two
// alternating runs; in an odd box they must hold one more corner-colored cell
// than the other color, which is impossible if s and t are both off-color.
//
function diag_count_ok(B, s, t) {
  var cc = ((B.x0 + B.y0) & 1);
  if (((B.w * B.h) % 2) === 0) { return true; }
  return ( (((s.x + s.y) & 1) === cc) || (((t.x + t.y) & 1) === cc) );
}

// IPS acceptability: does B have an orthogonal Hamiltonian path s-t?
//
function ips_ok(B, s, t) {
  return zzn.ips_ok(B.h, B.w, s.y - B.y0, s.x - B.x0, t.y - B.y0, t.x - B.x0);
}

//----------------------------------------------------------------------------
// Templates and junctions
//----------------------------------------------------------------------------

// Half of a side of length len in direction dir, rounded the way gilbert2d's
// floor division rounds it (up for a negative direction).
//
function half(len, dir) { return ( (dir < 0) ? Math.ceil(len / 2) : Math.floor(len / 2) ); }

// A template of the given kind with the given cut sizes: kind 2 (pieces L,
// R: major side cut at w2) or kind 3 (pieces A, B, C: minor side cut at h2,
// lower part cut at w2).
//
function template_at(F, kind, w2, h2) {
  var w = F.w,
      h = F.h;

  if (kind === 2) {
    return { kind: 2, w2: w2, h2: 0,
             boxes: [ local_box(F, 0, 0, w2, h), local_box(F, w2, 0, w - w2, h) ] };
  }
  return { kind: 3, w2: w2, h2: h2,
           boxes: [ local_box(F, 0, 0, w2, h2),
                    local_box(F, 0, h2, w, h - h2),
                    local_box(F, w2, 0, w - w2, h2) ] };
}

// The template of the other kind for frame F, cut at the midpoint the same
// way (used when the gilbert2d template doesn't work).
//
function flipped_template(F, base) {
  var w2 = half(F.w, F.ax + F.ay),
      h2 = half(F.h, F.bx + F.by);

  if (base.kind === 3) {
    if ( (w2 < 1) || (w2 >= F.w) ) { return null; }
    return template_at(F, 2, w2, 0);
  }
  if ( (h2 < 1) || (h2 >= F.h) || (w2 < 1) || (w2 >= F.w) ) { return null; }
  return template_at(F, 3, w2, h2);
}

// The gilbert2d template for frame F.
//
function make_template(F) {
  var w  = F.w,
      h  = F.h,
      w2 = half(w, F.ax + F.ay),
      h2 = half(h, F.bx + F.by);

  // Long case: two pieces along the major side, preferring an even cut.
  //
  if ((2 * w) > (3 * h)) {
    if ( ((w2 % 2) === 1) && (w > 2) ) { w2++; }
    var T2 = template_at(F, 2, w2, 0);
    T2.gilbert = true;
    return T2;
  }

  // Standard case: lower first, upper, lower second.
  //
  if ( ((h2 % 2) === 1) && (h > 2) ) { h2++; }
  var T = template_at(F, 3, w2, h2);
  T.gilbert = true;
  return T;
}

// Moved cuts, for when the template at its own cut fails: the same kind of
// template with its cut(s) shifted, only where s and t land in different
// pieces, nearest the original cut first (at most MOVED_CUTS of them, the
// original cut itself excluded).
//
function moved_templates(F, base, s, t) {
  var ls   = frame_uv(F, s),
      lt   = frame_uv(F, t),
      cand = [],
      w2, h2, d, dh;

  var part = function (l, w2, h2) { return ( (l.v >= h2) ? 1 : ( (l.u < w2) ? 0 : 2 ) ); };

  if (base.kind === 2) {
    for (w2 = 1; w2 < F.w; w2++) {
      if ( (ls.u < w2) === (lt.u < w2) ) { continue; }
      if (w2 === base.w2)                 { continue; }
      cand.push({ d: Math.abs(w2 - base.w2), w2: w2, h2: 0 });
    }
  }
  else {

    // Rings of increasing distance from the original cut, stopping once a
    // ring completes MOVED_CUTS candidates (the same result as sorting all).
    //
    for (d = 1; (d <= (F.w + F.h)) && (cand.length < MOVED_CUTS); d++) {
      for (dh = -d; dh <= d; dh++) {
        var rest = d - Math.abs(dh),
            dws  = ( (rest === 0) ? [0] : [-rest, rest] );
        h2 = base.h2 + dh;
        if ( (h2 < 1) || (h2 >= F.h) ) { continue; }
        for (var q = 0; q < dws.length; q++) {
          w2 = base.w2 + dws[q];
          if ( (w2 < 1) || (w2 >= F.w) )                 { continue; }
          if (part(ls, w2, h2) === part(lt, w2, h2))     { continue; }
          cand.push({ d: d, w2: w2, h2: h2 });
        }
      }
    }
  }

  cand.sort(function (a, b) { return ( (a.d !== b.d) ? (a.d - b.d) : ((a.h2 - b.h2) || (a.w2 - b.w2)) ); });
  return cand.slice(0, MOVED_CUTS).map(function (c) { return template_at(F, base.kind, c.w2, c.h2); });
}

// Rank of a junction between pieces ia and ib (0 is best): how far the
// junction is from the outer edge of the rectangle along its cleave. For
// kind 2 either end of the cleave is an outer edge (ties go to v = 0, the
// canonical edge); for kind 3 the far end from the point where the three
// pieces meet is. Returns [rank, tie].
//
function junction_rank(F, tmpl, ia, ib, x, y) {
  var lx = frame_uv(F, x),
      ly = frame_uv(F, y),
      lo = Math.min(ia, ib),
      hi = Math.max(ia, ib);

  if (tmpl.kind === 2) {
    var rx = Math.min(lx.v, F.h - 1 - lx.v),
        ry = Math.min(ly.v, F.h - 1 - ly.v);
    return [ Math.min(rx, ry), Math.min(lx.v, ly.v) ];
  }
  if ( (lo === 0) && (hi === 1) ) { return [ Math.min(lx.u, ly.u), 0 ]; }
  if ( (lo === 1) && (hi === 2) ) { return [ Math.min(F.w - 1 - lx.u, F.w - 1 - ly.u), 0 ]; }
  return [ Math.min(lx.v, ly.v), 0 ];
}

// All junctions from piece ia to piece ib, bucketed by rank: pairs of cells
// (x in piece ia, y in piece ib) that are orthogonally adjacent, or
// diagonally adjacent when a diagonal step is allowed.
//
function junctions(F, tmpl, ia, ib, allow_diag) {
  var X       = tmpl.boxes[ia],
      Y       = tmpl.boxes[ib],
      x1      = X.x0 + X.w - 1,
      y1      = X.y0 + X.h - 1,
      buckets = [];

  for (var yy = X.y0; yy <= y1; yy++) {
    var edge_row = ( (yy === X.y0) || (yy === y1) ),
        step     = ( edge_row ? 1 : Math.max(1, X.w - 1) );

    for (var xx = X.x0; xx <= x1; xx += step) {
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          var dg = ( (dx !== 0) && (dy !== 0) );
          if ( (dx === 0) && (dy === 0) ) { continue; }
          if ( dg && (!allow_diag) )      { continue; }

          var q = mkpt(xx + dx, yy + dy);
          if (!in_box(Y, q)) { continue; }

          var p  = mkpt(xx, yy),
              rk = junction_rank(F, tmpl, ia, ib, p, q);
          while (buckets.length <= rk[0]) { buckets.push([]); }
          buckets[rk[0]].push({ x: p, y: q, diag: dg, tie: rk[1], rank: rk[0] });
        }
      }
    }
  }

  buckets.forEach(function (b) { b.sort(function (m, n) { return (m.tie - n.tie); }); });
  return buckets;
}

// Piece schedules: lists of piece indices, s's piece first and t's last. If
// s and t share a piece the schedule is a loop starting and ending there.
//
function schedules(tmpl, is, it) {
  if (tmpl.kind === 2) { return [ ( (is !== it) ? [is, it] : [is, 1 - is, is] ) ]; }
  if (is !== it)       { return [ [is, 3 - is - it, it] ]; }

  var o = [0, 1, 2].filter(function (i) { return (i !== is); });
  return [ [is, o[0], o[1], is], [is, o[1], o[0], is] ];
}

// Orientation of a loop: the signed area of the polygon through the exit
// junction, the pieces visited, and the re-entry junction. For kind 3 the
// order of the three pieces alone decides it; for kind 2 (one other piece)
// the positions of the exit and re-entry do.
//
function loop_is_ccw(tmpl, sched, c0, cL) {
  var poly = [],
      area = 0,
      mid  = function (c) { return mkpt((c.x.x + c.y.x) / 2, (c.x.y + c.y.y) / 2); };

  if (tmpl.kind === 3) {
    for (var j = 0; j < 3; j++) { poly.push(box_center(tmpl.boxes[sched[j]])); }
  }
  else {
    poly = [ mid(c0), box_center(tmpl.boxes[sched[1]]), mid(cL), box_center(tmpl.boxes[sched[0]]) ];
  }

  for (var i = 0; i < poly.length; i++) {
    var a = poly[i],
        b = poly[(i + 1) % poly.length];
    area += (a.x * b.y) - (b.x * a.y);
  }
  return ((CCW_SIGN * area) > 0);
}

//----------------------------------------------------------------------------
// Plans
//----------------------------------------------------------------------------
//
// A plan is a schedule plus one junction per consecutive pair of pieces. Its
// segments are the pieces with their (virtual) endpoints. The shape step
// checks a plan cheaply and works out where its diagonal step, if any, goes;
// the solve step then recurses.
//

// The longest straight run a one-path piece is likely to force, from its
// shape: a 1-wide piece is a single line; in a 2- or 3-wide piece, the part
// beyond both endpoints along its length has to be covered out and back,
// which (a hairpin in 2 rows, and in practice in 3) runs its whole length.
//
function forced_run(B, a, b) {
  var L  = Math.max(B.w, B.h),
      pa, pb;

  if (Math.min(B.w, B.h) === 1) { return L; }
  if (Math.min(B.w, B.h) > 3)   { return 0; }

  pa = ( (B.w >= B.h) ? (a.x - B.x0) : (a.y - B.y0) );
  pb = ( (B.w >= B.h) ? (b.x - B.x0) : (b.y - B.y0) );
  return ( Math.max(Math.min(pa, pb), L - 1 - Math.max(pa, pb)) + 1 );
}

// Returns null if the plan is ruled out, else { segs, loop, pref, forced }.
//
function plan_shape(tmpl, sched, jn, s, t, need_diag) {
  var k     = jn.length,
      loop  = (sched[0] === sched[k]),
      segs  = [],
      ndiag = 0,
      pref  = 0,
      frc   = 0;

  for (var j = 0; j < k; j++) {
    if (jn[j].diag) { ndiag++; pref = (2 * j) + 1; }
  }

  for (var i = 0; i <= k; i++) {
    var B = tmpl.boxes[sched[i]],
        a = ( (i === 0) ? s : jn[i - 1].y ),
        b = ( (i === k) ? t : jn[i].x );
    segs.push({ box: B, a: a, b: b });
    if ( loop && ((i === 0) || (i === k)) ) { continue; }

    if (same_pt(a, b)) {
      if ((B.w * B.h) !== 1) { return null; }
      continue;
    }
    if (compatible(B, a, b)) {
      if (!ips_ok(B, a, b)) { return null; }
    }
    else {
      ndiag++;
      pref = 2 * i;
    }
    frc = Math.max(frc, forced_run(B, a, b));
  }

  if (ndiag !== ( need_diag ? 1 : 0 )) { return null; }
  return { segs: segs, loop: loop, pref: pref, forced: frc };
}

// Position of a boundary cell going around box B, or -1 for an interior cell
// (or a box too thin to have an interior).
//
function perim_index(B, q) {
  var x = q.x - B.x0,
      y = q.y - B.y0,
      w = B.w,
      h = B.h;

  if ( (w < 2) || (h < 2) ) { return -1; }
  if (y === 0)              { return x; }
  if (x === (w - 1))        { return (w - 1) + y; }
  if (y === (h - 1))        { return (w - 1) + (h - 1) + (w - 1 - x); }
  if (x === 0)              { return (2 * (w - 1)) + (h - 1) + (h - 1 - y); }
  return -1;
}

// Quick necessary conditions for the two-segment piece B with paths s-xo and
// xi-t: distinct endpoints, the checkerboard count, and (when all four are on
// the boundary) no interleaving of the two pairs around it.
//
function zzn_quick(B, s, xo, xi, t) {
  var e = [s, xo, xi, t];

  for (var p = 0; p < 4; p++) {
    for (var q = p + 1; q < 4; q++) {
      if (same_pt(e[p], e[q])) { return false; }
    }
  }

  var box_ex = ( (((B.w * B.h) % 2) === 1) ? 1 : 0 );
  if ((path_excess(B, s, xo) + path_excess(B, xi, t)) !== box_ex) { return false; }

  var k = e.map(function (c) { return perim_index(B, c); });
  if (k.every(function (v) { return (v >= 0); })) {
    var lo = Math.min(k[0], k[1]),
        hi = Math.max(k[0], k[1]),
        i2 = ( (k[2] > lo) && (k[2] < hi) ),
        i3 = ( (k[3] > lo) && (k[3] < hi) );
    if (i2 !== i3) { return false; }
  }
  return true;
}

// Solve the two-segment piece of a loop plan with the k=2 ZZN solver
// (memoized). Returns [path0, path1], each a flat [x0, y0, x1, y1, ...] list
// of global cells, or null.
//
function solve_zzn_piece(ctx, B, s, xo, xi, t) {
  var key = [B.x0, B.y0, B.w, B.h, s.x, s.y, xo.x, xo.y, xi.x, xi.y, t.x, t.y].join(","),
      loc = function (q) { return [q.y - B.y0, q.x - B.x0]; },
      flat = function (p) {
        var f = [];
        for (var i = 0; i < p.length; i++) { f.push(p[i][1] + B.x0, p[i][0] + B.y0); }
        return f;
      },
      res, out;

  if (ctx.zmemo.has(key)) { return ctx.zmemo.get(key); }

  ctx.zzn_calls++;
  if (ctx.zzn_calls > ZZN_BUDGET) { ctx.budget_hit = true; return null; }

  res = zzn.solve(B.h, B.w, loc(s), loc(xo), loc(xi), loc(t));
  out = ( (res.status === "solved") ? [ flat(res.paths[0]), flat(res.paths[1]) ] : null );
  ctx.zmemo.set(key, out);
  return out;
}

// Solve the two-segment piece B (paths s-xo and xi-t) by recursion: a
// straight cut with s and xo on one side and xi and t on the other, each side
// then being an ordinary one-path problem. Cuts whose sides force no long
// straight run come first (and, with strict set, are the only ones tried);
// within that, cuts nearest the middle, the longer side's first on ties.
// Memoized. Returns [path0, path1] as flat coordinate lists, or null.
//
function rec_two_piece(ctx, B, s, xo, xi, t, strict) {
  var key  = [B.x0, B.y0, B.w, B.h, s.x, s.y, xo.x, xo.y, xi.x, xi.y, t.x, t.y, ( strict ? 1 : 0 )].join(","),
      cuts = [],
      c;

  if (ctx.rmemo.has(key))           { return ctx.rmemo.get(key); }
  if (!zzn_quick(B, s, xo, xi, t)) { ctx.rmemo.set(key, null); return null; }

  var add = function (vert, c, len, other) {
    var side = function (q) { return ( vert ? (q.x < (B.x0 + c)) : (q.y < (B.y0 + c)) ); };
    if ( (side(s) !== side(xo)) || (side(xi) !== side(t)) || (side(s) === side(xi)) ) { return; }
    cuts.push({ vert: vert, c: c, off: (Math.abs((2 * c) - len) / len), longer: ( (len >= other) ? 0 : 1 ) });
  };
  for (c = 1; c < B.w; c++) { add(true, c, B.w, B.h); }
  for (c = 1; c < B.h; c++) { add(false, c, B.h, B.w); }

  cuts.sort(function (a, b) {
    if (a.off !== b.off)       { return (a.off - b.off); }
    if (a.longer !== b.longer) { return (a.longer - b.longer); }
    if (a.vert !== b.vert)     { return ( a.vert ? -1 : 1 ); }
    return (a.c - b.c);
  });

  for (var pass = 0; pass < ( strict ? 1 : 2 ); pass++) {
  for (var i = 0; i < cuts.length; i++) {
    var P = ( cuts[i].vert ? { x0: B.x0, y0: B.y0, w: cuts[i].c, h: B.h }
                           : { x0: B.x0, y0: B.y0, w: B.w, h: cuts[i].c } ),
        Q = ( cuts[i].vert ? { x0: (B.x0 + cuts[i].c), y0: B.y0, w: (B.w - cuts[i].c), h: B.h }
                           : { x0: B.x0, y0: (B.y0 + cuts[i].c), w: B.w, h: (B.h - cuts[i].c) } ),
        start = ctx.ox.length;

    if (!in_box(P, s)) { var tmp = P; P = Q; Q = tmp; }
    cuts[i].forced = Math.max(forced_run(P, s, xo), forced_run(Q, xi, t));
    if ( (pass === 0) && (cuts[i].forced > MAX_RUN) )  { continue; }
    if ( (pass === 1) && (cuts[i].forced <= MAX_RUN) ) { continue; }
    if ( (!compatible(P, s, xo)) || (!compatible(Q, xi, t)) ) { continue; }
    if ( (!ips_ok(P, s, xo)) || (!ips_ok(Q, xi, t)) )         { continue; }

    if (gen(ctx, P, s, xo)) {
      var mid = ctx.ox.length;
      if (gen(ctx, Q, xi, t)) {
        var f0 = [], f1 = [], q;
        for (q = start; q < mid; q++)           { f0.push(ctx.ox[q], ctx.oy[q]); }
        for (q = mid; q < ctx.ox.length; q++)   { f1.push(ctx.ox[q], ctx.oy[q]); }
        out_reset(ctx, start);
        ctx.rmemo.set(key, [f0, f1]);
        return [f0, f1];
      }
    }
    out_reset(ctx, start);
    if (ctx.budget_hit) { return null; }
  }
  }

  ctx.rmemo.set(key, null);
  return null;
}

// The two-segment piece of a loop plan: by recursion if possible, otherwise
// (when allowed) with the k=2 ZZN solver.
//
function solve_two_piece(ctx, B, s, xo, xi, t, allow_zzn, strict) {
  var r = rec_two_piece(ctx, B, s, xo, xi, t, strict);
  if ( (r !== null) || (!allow_zzn) || ctx.budget_hit ) { return r; }
  return solve_zzn_piece(ctx, B, s, xo, xi, t);
}

// Solve a plan: the two-segment piece first (if any), then each one-segment
// piece recursively. Appends the whole path and returns true, or returns
// false having appended nothing.
//
function plan_solve(ctx, shape) {
  var segs  = shape.segs,
      k     = segs.length - 1,
      start = ctx.ox.length,
      zp    = null,
      q;

  ctx.calls++;
  if (ctx.calls > ctx.call_limit) { ctx.budget_hit = true; return false; }

  if (shape.loop) {
    zp = solve_two_piece(ctx, segs[0].box, segs[0].a, segs[0].b, segs[k].a, segs[k].b, shape.allow_zzn, shape.strict);
    if (zp === null) { return false; }
  }

  for (var i = 0; i <= k; i++) {
    if ( shape.loop && ((i === 0) || (i === k)) ) {
      var f = zp[ (i === 0) ? 0 : 1 ];
      for (q = 0; q < f.length; q += 2) { out_push(ctx, f[q], f[q + 1]); }
      continue;
    }
    if (!gen(ctx, segs[i].box, segs[i].a, segs[i].b)) {
      out_reset(ctx, start);
      return false;
    }
  }

  // Strict round: reject the plan if what it produced has a straight run
  // longer than MAX_RUN (gilbert2d's own plan excepted).
  //
  if ( shape.strict && (!shape.own) && (longest_run(ctx, start) > MAX_RUN) ) {
    out_reset(ctx, start);
    ctx.strict_left--;
    return false;
  }
  return true;
}

// Longest straight run (in cells) in the output from index start on.
//
function longest_run(ctx, start) {
  var X    = ctx.ox,
      Y    = ctx.oy,
      best = ( (X.length > start) ? 1 : 0 ),
      run  = 1;

  for (var i = start + 1; i < X.length; i++) {
    var ok = ( (i >= (start + 2)) &&
               ((X[i] - X[i - 1]) === (X[i - 1] - X[i - 2])) &&
               ((Y[i] - Y[i - 1]) === (Y[i - 1] - Y[i - 2])) );
    run  = ( ok ? (run + 1) : 2 );
    best = Math.max(best, run);
  }
  return best;
}

// Try shaped plans in order: diagonal step as late as possible, then junction
// tie order. Returns true if one solved.
//
function try_plans(ctx, plans) {
  plans.sort(function (m, n) {
    if (m.pref !== n.pref) { return (n.pref - m.pref); }
    for (var q = 0; q < m.ties.length; q++) {
      if (m.ties[q] !== n.ties[q]) { return (m.ties[q] - n.ties[q]); }
    }
    return 0;
  });

  for (var i = 0; i < plans.length; i++) {
    if ( plans[i].strict && ((ctx.strict_left <= 0) || (ctx.calls > ctx.strict_limit)) ) { return false; }
    if (ctx.calls > ctx.local_limit)                                                     { return false; }
    if (plan_solve(ctx, plans[i])) { return true; }
    if (ctx.budget_hit)            { return false; }
  }
  return false;
}

function shape_into(plans, tmpl, sc, jn, s, t, need_diag, allow_zzn, strict) {
  var sh = plan_shape(tmpl, sc, jn, s, t, need_diag);
  if (sh === null) { return; }

  // gilbert2d's own plan is exempt when the endpoints are gilbert2d's (the
  // template is gilbert2d's, the frame is canonical, every junction at rank 0).
  //
  var own = ( (tmpl.gilbert === true) && (tmpl.canonical === true) &&
              jn.every(function (c) { return (c.rank === 0); }) );
  if ( strict && (!own) && (sh.forced > MAX_RUN) ) { return; }
  sh.own = own;
  sh.ties      = jn.map(function (c) { return c.tie; });
  sh.allow_zzn = allow_zzn;
  sh.strict    = strict;
  plans.push(sh);
}

// Plans of a schedule that visits each piece once, by lowest total junction
// rank (junctions nearest the outer edges first).
//
function try_line(ctx, tmpl, sc, J, s, t, need_diag, strict) {
  var maxr = J.map(function (b) { return (b.length - 1); }),
      top  = maxr.reduce(function (m, n) { return (m + n); }, 0);

  for (var sum = 0; sum <= top; sum++) {
    var plans = [];

    rank_tuples(maxr, sum).forEach(function (tu) {
      var combos = [[]];
      tu.forEach(function (r, j) {
        var nxt = [];
        combos.forEach(function (c) { J[j][r].forEach(function (cand) { nxt.push(c.concat([cand])); }); });
        combos = nxt;
      });
      combos.forEach(function (jn) { shape_into(plans, tmpl, sc, jn, s, t, need_diag, false, strict); });
    });

    if (try_plans(ctx, plans)) { return true; }
    if (ctx.budget_hit)        { return false; }
  }
  return false;
}

// Plans of a loop schedule with the given orientation. The two virtual
// endpoints of the two-segment piece (its exit and re-entry) are chosen
// first, nearest the outer edges; the middle junction (kind 3) second.
//
function try_loop(ctx, tmpl, sc, J, s, t, need_diag, want_ccw, allow_zzn, strict) {
  var k  = J.length,
      X  = tmpl.boxes[sc[0]],
      J0 = J[0],
      JL = J[k - 1],
      JM = ( (k === 3) ? J[1] : null ),
      m0 = J0.length - 1,
      mL = JL.length - 1;

  // For kind 3 the orientation is fixed by the schedule.
  //
  if ( (tmpl.kind === 3) && (loop_is_ccw(tmpl, sc, null, null) !== want_ccw) ) { return false; }

  for (var sum = 0; sum <= (m0 + mL); sum++) {
    for (var r0 = Math.max(0, sum - mL); r0 <= Math.min(sum, m0); r0++) {
      var A0 = J0[r0],
          AL = JL[sum - r0];

      for (var i = 0; i < A0.length; i++) {
        for (var j = 0; j < AL.length; j++) {
          var c0 = A0[i],
              cL = AL[j];
          if ( (tmpl.kind === 2) && (loop_is_ccw(tmpl, sc, c0, cL) !== want_ccw) ) { continue; }
          if (!zzn_quick(X, s, c0.x, cL.y, t)) { continue; }

          var nmid = ( (JM === null) ? 1 : JM.length );
          for (var mr = 0; mr < nmid; mr++) {
            var plans = [],
                mids  = ( (JM === null) ? [null] : JM[mr] );

            mids.forEach(function (cm) {
              var jn = ( (cm === null) ? [c0, cL] : [c0, cm, cL] );
              shape_into(plans, tmpl, sc, jn, s, t, need_diag, allow_zzn, strict);
            });

            if (try_plans(ctx, plans)) { return true; }
            if (ctx.budget_hit)        { return false; }
          }
        }
      }
    }
  }
  return false;
}

// Every combination of one rank per junction summing to sum.
//
function rank_tuples(maxr, sum) {
  var out = [],
      cur = [];

  var rec = function (j, left) {
    if (j === (maxr.length - 1)) {
      if (left <= maxr[j]) { out.push(cur.concat([left])); }
      return;
    }
    for (var r = 0; (r <= maxr[j]) && (r <= left); r++) {
      cur.push(r);
      rec(j + 1, left - r);
      cur.pop();
    }
  };
  rec(0, sum);
  return out;
}

// Try the plans of template tmpl of one kind (mode):
//
//   "line"      schedules that visit each piece once,
//   "loop_rec"  loop schedules, the two-segment piece solved by recursion only,
//   "loop_zzn"  loop schedules, the two-segment piece may use the ZZN solver.
//
// Loops are tried counterclockwise first, then clockwise. With strict set,
// plans with a piece forcing a straight run longer than MAX_RUN are
// skipped, except gilbert2d's own plan.
//
function try_template(ctx, F, tmpl, s, t, need_diag, mode, strict) {
  var is = -1,
      it = -1;

  for (var i = 0; i < tmpl.boxes.length; i++) {
    if (in_box(tmpl.boxes[i], s)) { is = i; }
    if (in_box(tmpl.boxes[i], t)) { it = i; }
  }

  var scheds = schedules(tmpl, is, it),
      jcache = scheds.map(function (sc) {
        var out = [];
        if ((sc[0] === sc[sc.length - 1]) !== (mode !== "line")) { return out; }
        for (var j = 0; j < (sc.length - 1); j++) { out.push(junctions(F, tmpl, sc[j], sc[j + 1], need_diag)); }
        return out;
      });

  for (var pass = 0; pass < 2; pass++) {
    for (var si = 0; si < scheds.length; si++) {
      var sc   = scheds[si],
          J    = jcache[si],
          loop = (sc[0] === sc[sc.length - 1]),
          ok   = false;

      if (loop !== (mode !== "line"))                        { continue; }
      if (J.some(function (b) { return (b.length === 0); })) { continue; }

      if (loop)            { ok = try_loop(ctx, tmpl, sc, J, s, t, need_diag, (pass === 0), (mode === "loop_zzn"), strict); }
      else if (pass === 0) { ok = try_line(ctx, tmpl, sc, J, s, t, need_diag, strict); }

      if (ok)             { return true; }
      if (ctx.budget_hit) { return false; }
    }
  }
  return false;
}

//----------------------------------------------------------------------------
// Recursion
//----------------------------------------------------------------------------

// A single row or column walked from end to end (appended).
//
function line_path(ctx, s, t) {
  var dx = Math.sign(t.x - s.x),
      dy = Math.sign(t.y - s.y),
      x  = s.x,
      y  = s.y;

  out_push(ctx, x, y);
  while ( (x !== t.x) || (y !== t.y) ) {
    x += dx;
    y += dy;
    out_push(ctx, x, y);
  }
}

// Walk the path from s to t through a plugdp edge list (local coordinates of
// box B) and append it. Returns true, or false having appended nothing.
//
function walk_edges(ctx, B, edges, s, t) {
  var adj   = new Map(),
      start = ctx.ox.length,
      len   = 1,
      prev  = null,
      cur   = s;

  var key = function (q) { return ((q.y * 65536) + q.x); },
      add = function (a, b) {
        if (!adj.has(key(a))) { adj.set(key(a), []); }
        adj.get(key(a)).push(b);
      };
  edges.forEach(function (e) {
    var a = mkpt(e[1] + B.x0, e[0] + B.y0),
        b = mkpt(e[3] + B.x0, e[2] + B.y0);
    add(a, b);
    add(b, a);
  });

  out_push(ctx, s.x, s.y);
  while (!same_pt(cur, t)) {
    var nb   = adj.get(key(cur)) || [],
        next = null;
    for (var i = 0; i < nb.length; i++) {
      if ( (prev === null) || (!same_pt(nb[i], prev)) ) { next = nb[i]; break; }
    }
    if ( (next === null) || (len > (B.w * B.h)) ) {
      out_reset(ctx, start);
      return false;
    }
    prev = cur;
    cur  = next;
    out_push(ctx, cur.x, cur.y);
    len++;
  }
  return true;
}

function loc_end(B, q, color) { return { r: (q.y - B.y0), c: (q.x - B.x0), color: color }; }

// Exact single-path fallback: the plug DP with one color.
//
function plug_path(ctx, B, s, t) {
  var edges = zzn.plugdp_solve(B.h, B.w, [ loc_end(B, s, 0), loc_end(B, t, 0) ]);
  return ( (edges !== null) && walk_edges(ctx, B, edges, s, t) );
}

// Checkerboard excess (cells of the corner color minus the others) of a path
// from a to b.
//
function path_excess(B, a, b) {
  var cc = ((B.x0 + B.y0) & 1),
      ca = ((a.x + a.y) & 1),
      cb = ((b.x + b.y) & 1);
  if (ca !== cb) { return 0; }
  return ( (ca === cc) ? 1 : -1 );
}

// Exact fallback with one diagonal step p-q: two orthogonal paths s-p and q-t
// that together cover the box, which is a k=2 plug DP instance. Diagonal
// pairs nearest t are tried first (gilbert2d puts its diagonal near the end).
//
function plug_diag_path(ctx, B, s, t) {
  var box_ex = ( (((B.w * B.h) % 2) === 1) ? 1 : 0 ),
      pairs  = [];

  for (var y = B.y0; y < (B.y0 + B.h); y++) {
    for (var x = B.x0; x < (B.x0 + B.w); x++) {
      for (var dy = -1; dy <= 1; dy += 2) {
        for (var dx = -1; dx <= 1; dx += 2) {
          var p = mkpt(x, y),
              q = mkpt(x + dx, y + dy);
          if (!in_box(B, q)) { continue; }
          if ( same_pt(p, s) || same_pt(p, t) || same_pt(q, s) || same_pt(q, t) ) { continue; }
          if ((path_excess(B, s, p) + path_excess(B, q, t)) !== box_ex) { continue; }
          pairs.push({ p: p, q: q, d: (Math.abs(q.x - t.x) + Math.abs(q.y - t.y) + Math.abs(p.x - t.x) + Math.abs(p.y - t.y)) });
        }
      }
    }
  }
  pairs.sort(function (m, n) { return (m.d - n.d); });

  for (var i = 0; i < pairs.length; i++) {
    var pp    = pairs[i].p,
        qq    = pairs[i].q,
        edges = zzn.plugdp_solve(B.h, B.w, [ loc_end(B, s, 0), loc_end(B, pp, 0), loc_end(B, qq, 1), loc_end(B, t, 1) ]);
    if (edges === null) { continue; }

    var start = ctx.ox.length;
    if ( walk_edges(ctx, B, edges, s, pp) &&
         walk_edges(ctx, B, edges, qq, t) ) {
      return true;
    }
    out_reset(ctx, start);
  }
  return false;
}

// A 3 x L strip (L odd) with one endpoint in the middle of a short end and
// the other right next to it has only solutions whose diagonal step touches
// an endpoint, which the searches above can't express. Built directly, in a
// frame with u across the strip and v along it, from (1,0) to (1,1):
//
//   (1,0) (2,0), down the far column to (2,L-1), snake back up columns 0 and
//   1 to row 2, then (0,1) (0,0) and the diagonal step to (1,1).
//
function strip3_path(ctx, B, s, t) {
  var fr = box_frames(B);

  for (var i = 0; i < fr.length; i++) {
    var F = fr[i];
    if ( (F.w !== 3) || ((F.h % 2) === 0) ) { continue; }

    var ls  = frame_uv(F, s),
        lt  = frame_uv(F, t),
        fwd = ( (ls.u === 1) && (ls.v === 0) && (lt.u === 1) && (lt.v === 1) ),
        rev = ( (lt.u === 1) && (lt.v === 0) && (ls.u === 1) && (ls.v === 1) );
    if ( (!fwd) && (!rev) ) { continue; }

    var L   = F.h,
        loc = [[1, 0], [2, 0]],
        v;
    for (v = 1; v < L; v++) { loc.push([2, v]); }
    for (v = L - 1; v >= 2; v--) {
      if (((L - 1 - v) % 2) === 0) { loc.push([1, v]); loc.push([0, v]); }
      else                         { loc.push([0, v]); loc.push([1, v]); }
    }
    loc.push([0, 1]);
    loc.push([0, 0]);
    loc.push([1, 1]);

    if (!fwd) { loc.reverse(); }
    loc.forEach(function (q) {
      var c = frame_pt(F, q[0], q[1]);
      out_push(ctx, c.x, c.y);
    });
    return true;
  }
  return false;
}

// Append a path from s to t covering box B. Returns true, or false having
// appended nothing.
//
function gen(ctx, B, s, t) {
  var key   = B.x0 + "," + B.y0 + "," + B.w + "," + B.h + "|" + s.x + "," + s.y + "|" + t.x + "," + t.y,
      start = ctx.ox.length;

  if (ctx.fail.has(key)) { return false; }

  if (gen_uncached(ctx, B, s, t)) { return true; }
  out_reset(ctx, start);
  if (!ctx.budget_hit) { ctx.fail.set(key, true); }
  return false;
}

function gen_uncached(ctx, B, s, t) {
  var need_diag = !compatible(B, s, t);

  ctx.calls++;
  if (ctx.calls > ctx.call_limit) { ctx.budget_hit = true; return false; }

  if ((B.w * B.h) === 1) {
    if (!same_pt(s, t)) { return false; }
    out_push(ctx, s.x, s.y);
    return true;
  }
  if (same_pt(s, t))                            { return false; }
  if ( (!need_diag) && (!ips_ok(B, s, t)) )     { return false; }
  if ( need_diag && (!diag_count_ok(B, s, t)) ) { return false; }
  if ( (B.w === 1) || (B.h === 1) ) {
    if (need_diag) { return false; }
    line_path(ctx, s, t);
    return true;
  }

  // Recursion is tried in every form before a non-recursive solver:
  //
  //   1. the best frame, each piece visited once: its gilbert2d template,
  //      the other kind of template, then moved cuts of both,
  //   2. loops whose two-segment piece is split by recursion,
  //   3. the other frames, as in 1,
  //   4. loops using the ZZN solver, then the exact fallbacks.
  //
  // Steps 1-3 run twice: first strictly (no straight run longer than MAX_RUN,
  // at most STRICT_TRIES solved plans rejected for one), then without that
  // restriction. Rectangles 3 or less across skip the strict round, since
  // long runs are forced there, and so does everything once the search has
  // used its strict budget. Steps 1-3 together may use LOCAL_BUDGET +
  // LOCAL_PER_CELL * area calls (within the parent's allowance); step 4 is
  // bounded by the parent's allowance.
  //
  var frames = frames_by_score(B, s, t),
      F      = frames[0],
      Fe     = frame_pt(F, F.w - 1, 0),
      base   = make_template(F),
      strict = true,
      saved  = ctx.strict_left,
      found  = false,
      round;

  base.canonical = ( (F.px === s.x) && (F.py === s.y) && same_pt(Fe, t) );

  var attempt = function (Fr, T, mode) {
    return try_template(ctx, Fr, T, s, t, need_diag, mode, strict);
  };

  var line_with_moves = function (Fr) {
    if (ctx.calls > ctx.local_limit) { return false; }

    var T = ( (Fr === F) ? base : make_template(Fr) ),
        U = flipped_template(Fr, T),
        m;

    // Built lazily: the gilbert2d template usually works outright.
    //
    var tries = [
      function () { return [T]; },
      function () { return ( (U === null) ? [] : [U] ); },
      function () { return moved_templates(Fr, T, s, t); },
      function () { return ( (U === null) ? [] : moved_templates(Fr, U, s, t) ); }
    ];

    for (var k = 0; k < tries.length; k++) {
      var list = tries[k]();
      for (m = 0; (m < list.length) && (ctx.calls <= ctx.local_limit); m++) {
        if (attempt(Fr, list[m], "line")) { return true; }
        if (ctx.budget_hit)                { return false; }
      }
      if (ctx.calls > ctx.local_limit) { return false; }
    }
    return false;
  };

  var round_search = function () {
    if (line_with_moves(F))           { return true; }
    if (ctx.budget_hit)               { return false; }
    if (attempt(F, base, "loop_rec")) { return true; }
    if (ctx.budget_hit)               { return false; }
    for (var f = 1; f < frames.length; f++) {
      if (line_with_moves(frames[f])) { return true; }
      if (ctx.budget_hit)             { return false; }
    }
    return false;
  };

  var first    = ( ((Math.min(B.w, B.h) <= 3) || (ctx.calls > ctx.strict_limit)) ? 1 : 0 ),
      outer    = ctx.local_limit;

  ctx.local_limit = Math.min(outer, ctx.calls + LOCAL_BUDGET + (LOCAL_PER_CELL * B.w * B.h));
  for (round = first; (round < 2) && (!found) && (!ctx.budget_hit) && (ctx.calls <= ctx.local_limit); round++) {
    strict          = (round === 0);
    ctx.strict_left = STRICT_TRIES;
    found           = round_search();
  }
  var cut = (ctx.calls > ctx.local_limit);
  ctx.strict_left = saved;
  ctx.local_limit = outer;
  if (found)          { return true; }
  if (ctx.budget_hit) { return false; }

  // Step 4. If the budget cut steps 1-3 short, first the plain search that
  // needs no extended options: the gilbert2d template, then (around the ZZN
  // loops) its moved cuts.
  //
  strict = false;
  if ( cut && attempt(F, base, "line") ) { return true; }
  if (ctx.budget_hit)                    { return false; }
  if (attempt(F, base, "loop_zzn"))      { return true; }
  if (ctx.budget_hit)                    { return false; }
  if (cut) {
    var mv = moved_templates(F, base, s, t);
    for (var m = 0; m < mv.length; m++) {
      if (attempt(F, mv[m], "line")) { return true; }
      if (ctx.budget_hit)             { return false; }
    }
  }

  if ( need_diag && ((B.w === 3) || (B.h === 3)) ) {
    if (strip3_path(ctx, B, s, t)) { return true; }
  }

  if (Math.min(B.w, B.h) <= PLUG_MAX_SIDE) {
    if (!need_diag) {
      ctx.plug_calls++;
      return plug_path(ctx, B, s, t);
    }
    if ( ((B.w * B.h) <= DIAG_MAX_AREA) || (Math.min(B.w, B.h) <= DIAG_NARROW) ) {
      ctx.plug_calls++;
      return plug_diag_path(ctx, B, s, t);
    }
  }
  return false;
}

//----------------------------------------------------------------------------
// Top level
//----------------------------------------------------------------------------

// Check a path given as coordinate arrays: correct endpoints, every cell
// exactly once, unit steps except for exactly the required number of diagonal
// steps. Returns null or a fault.
//
function verify(w, h, s, t, xs, ys, need_diag) {
  var seen  = new Uint8Array(w * h),
      n     = xs.length,
      ndiag = 0;

  if (n !== (w * h))                              { return "path has " + n + " cells, expected " + (w * h); }
  if ( (xs[0] !== s.x) || (ys[0] !== s.y) )       { return "path starts at the wrong cell"; }
  if ( (xs[n - 1] !== t.x) || (ys[n - 1] !== t.y) ) { return "path ends at the wrong cell"; }

  for (var i = 0; i < n; i++) {
    var x = xs[i],
        y = ys[i];
    if ( (x < 0) || (x >= w) || (y < 0) || (y >= h) ) { return "cell outside the grid"; }
    if (seen[(y * w) + x])                             { return "cell (" + x + "," + y + ") used twice"; }
    seen[(y * w) + x] = 1;

    if (i > 0) {
      var ax = Math.abs(x - xs[i - 1]),
          ay = Math.abs(y - ys[i - 1]);
      if      ( (ax + ay) === 1 )          { }
      else if ( (ax === 1) && (ay === 1) ) { ndiag++; }
      else                                 { return "non-adjacent step at index " + i; }
    }
  }
  if (ndiag !== ( need_diag ? 1 : 0 )) { return ndiag + " diagonal steps"; }
  return null;
}

// Generate the curve. See the header for the result format.
//
function gilbert_ep(w, h, x0, y0, x1, y1) {
  var B = { x0: 0, y0: 0, w: w, h: h },
      s = mkpt(x0, y0),
      t = mkpt(x1, y1);

  if ( (w < 1) || (h < 1) )                 { return { status: "error", reason: "empty rectangle" }; }
  if ( (!in_box(B, s)) || (!in_box(B, t)) ) { return { status: "error", reason: "endpoint outside the rectangle" }; }

  var need_diag = !compatible(B, s, t);

  if ( same_pt(s, t) && ((w * h) > 1) )         { return { status: "infeasible", reason: "start and end are the same cell" }; }
  if ( (!need_diag) && (!ips_ok(B, s, t)) )     { return { status: "infeasible", reason: "no orthogonal path (IPS)" }; }
  if ( need_diag && ((w === 1) || (h === 1)) )  { return { status: "infeasible", reason: "no path in a single row or column" }; }
  if ( need_diag && (!diag_count_ok(B, s, t)) ) { return { status: "infeasible", reason: "both endpoints off the corner color of an odd rectangle" }; }

  var ctx = { calls: 0, call_limit: (CALL_BUDGET + (CALLS_PER_CELL * w * h)),
              strict_limit: (STRICT_BUDGET + (STRICT_PER_CELL * w * h)),
              local_limit: (CALL_BUDGET + (CALLS_PER_CELL * w * h)),
              zzn_calls: 0, plug_calls: 0, budget_hit: false,
              fail: new Map(), zmemo: new Map(), rmemo: new Map(), ox: [], oy: [], strict_left: 0 },
      stats = function () { return { calls: ctx.calls, zzn_calls: ctx.zzn_calls, plug_calls: ctx.plug_calls }; };

  if (!gen(ctx, B, s, t)) {
    return { status: "error", reason: ( ctx.budget_hit ? "search budget exhausted" : "no path found" ), stats: stats() };
  }

  var xs  = Int32Array.from(ctx.ox),
      ys  = Int32Array.from(ctx.oy),
      bad = verify(w, h, s, t, xs, ys, need_diag);
  if (bad !== null) { throw new Error("internal error, invalid path: " + bad); }

  ctx.ox = ctx.oy = null;

  // path ([[x,y], ...]) is built on first use; x and y are the same path as
  // flat arrays, which is much lighter for large rectangles.
  //
  var res = { status: "ok", x: xs, y: ys, stats: stats() },
      pairs = null;
  Object.defineProperty(res, "path", {
    enumerable: true,
    get: function () {
      if (pairs === null) {
        pairs = new Array(xs.length);
        for (var i = 0; i < xs.length; i++) { pairs[i] = [xs[i], ys[i]]; }
      }
      return pairs;
    }
  });
  return res;
}

module.exports = {
  gilbert_ep: gilbert_ep,
  compatible: function (w, h, x0, y0, x1, y1) { return compatible({ x0: 0, y0: 0, w: w, h: h }, mkpt(x0, y0), mkpt(x1, y1)); }
};

//----------------------------------------------------------------------------
// Command line
//----------------------------------------------------------------------------

if (require.main === module) {
  var v = process.argv.slice(2).map(Number);

  if ( (v.length !== 6) || v.some(isNaN) ) {
    console.log("usage: node gilbert_ep.js w h x0 y0 x1 y1");
    process.exit(1);
  }

  var res = gilbert_ep(v[0], v[1], v[2], v[3], v[4], v[5]);
  if (res.status !== "ok") {
    console.error(res.status + ": " + res.reason);
    process.exit(2);
  }

  // Write in chunks: one string for millions of lines would be too large.
  //
  var chunk = [];
  for (var i = 0; i < res.x.length; i++) {
    chunk.push(res.x[i] + " " + res.y[i]);
    if (chunk.length === 65536) {
      process.stdout.write(chunk.join("\n") + "\n");
      chunk = [];
    }
  }
  if (chunk.length > 0) { process.stdout.write(chunk.join("\n") + "\n"); }
}
