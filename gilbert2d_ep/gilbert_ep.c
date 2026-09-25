// gilbert_ep.c
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
//   straight run longer than GEP_MAX_RUN (gilbert2d's own curves never exceed 6),
//   then without that limit. Only then come loops whose two-segment piece uses
//   the k=2 Zig-Zag Numberlink solver (zzn_solve.c), and the exact
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
//   Fallbacks, for rectangles with a short side of at most GEP_PLUG_MAX_SIDE:
//   the exact plug DP from zzn_solve.c, for one orthogonal path, or for a path
//   with one diagonal step p-q as the two orthogonal paths s-p and q-t. A
//   3 x (odd) strip with its endpoints at the middle of a short end and the
//   cell next to it is built directly.
//
// This is a port of gilbert_ep.js and gives the same paths, except where the
// two ZZN solvers or plug DPs return different (equally valid) solutions.
//
// Coordinates are (x, y) with 0 <= x < w, 0 <= y < h. "Counterclockwise" is
// taken with x pointing right and y pointing up; set GEP_CCW_SIGN to -1 for
// screen coordinates (y pointing down).
//
// Build:  gcc -O2 -o gilbert_ep gilbert_ep.c      (zzn_solve.c in the same directory)
//
// Usage:  ./gilbert_ep w h x0 y0 x1 y1       prints the path, one "x y" per line
//         ./gilbert_ep < instances.txt       one "w h x0 y0 x1 y1" per line; prints
//                                            "ok <cells> <diagonals> <fnv1a hash>",
//                                            "infeasible: <reason>" or "error: <reason>"
//

// The ZZN solver is compiled into this file; its main() is renamed out of the
// way.
//
#define main zzn_solve_main
#include "zzn_solve.c"
#undef main

// GEP_CCW_SIGN         orientation convention for "counterclockwise" (see above)
// GEP_CALL_BUDGET      cap on recursive calls plus plans evaluated, plus ...
// GEP_CALLS_PER_CELL   ... this many per cell (the plain recursion alone makes
//                      on the order of one call per cell)
// GEP_ZZN_BUDGET       cap on k=2 Zig-Zag Numberlink solver calls
// GEP_PLUG_MAX_SIDE    largest short side for the exact fallbacks
// GEP_DIAG_MAX_AREA    largest area for the exact fallback with a diagonal step ...
// GEP_DIAG_NARROW      ... unless the short side is at most this
// GEP_MOVED_CUTS       how many moved cuts to try when a template fails
// GEP_MAX_RUN          longest straight run allowed in the first (strict) round
//                      of the search; gilbert2d's own curves never exceed 6
// GEP_STRICT_TRIES     solved plans the strict round may reject (for too long a
//                      run) in one rectangle before giving up on it
// GEP_STRICT_BUDGET    total calls after which strict rounds stop, plus ...
// GEP_STRICT_PER_CELL  ... this many per cell (the rest of the search is relaxed)
// GEP_LOCAL_BUDGET     calls one rectangle's recursive search may use, plus ...
// GEP_LOCAL_PER_CELL   ... this many per cell of the rectangle (within its
//                      parent's); past that it goes to the fallbacks
//
#define GEP_CCW_SIGN        1
#define GEP_CALL_BUDGET     4000000L
#define GEP_CALLS_PER_CELL  4L
#define GEP_ZZN_BUDGET      1000
#define GEP_PLUG_MAX_SIDE   12
#define GEP_DIAG_MAX_AREA   144
#define GEP_DIAG_NARROW     8
#define GEP_MOVED_CUTS      16
#define GEP_MAX_RUN         6
#define GEP_STRICT_TRIES    32
#define GEP_STRICT_BUDGET   20000L
#define GEP_STRICT_PER_CELL 50L
#define GEP_LOCAL_BUDGET    2000L
#define GEP_LOCAL_PER_CELL  100L

#define GEP_LINE     0
#define GEP_LOOP_REC 1
#define GEP_LOOP_ZZN 2

#define GEP_OK         0
#define GEP_INFEASIBLE 1
#define GEP_ERROR      2

//----------------------------------------------------------------------------
// Cells, boxes and frames
//----------------------------------------------------------------------------
//
// A box is an axis-aligned rectangle of cells in global coordinates. A frame
// is an orientation of a box in the style of gilbert2d: origin cell p, unit
// major direction a (length w), unit minor direction b (length h). Local
// coordinates (u, v) map to p + u*a + v*b. The canonical gilbert2d path in a
// frame runs from (0,0) to (w-1,0).
//

typedef struct { int x, y; } gpt_t;
typedef struct { int x0, y0, w, h; } gbox_t;
typedef struct { int px, py, ax, ay, bx, by, w, h; } gframe_t;

static int iabs(int a) { return ( (a < 0) ? -a : a ); }

static gpt_t mkpt(int x, int y) {
  gpt_t q;
  q.x = x;
  q.y = y;
  return q;
}

static int same_pt(gpt_t a, gpt_t b) { return ((a.x == b.x) && (a.y == b.y)); }

static int in_box(gbox_t B, gpt_t q) {
  return ( (q.x >= B.x0) && (q.x < (B.x0 + B.w)) &&
           (q.y >= B.y0) && (q.y < (B.y0 + B.h)) );
}

static long box_area(gbox_t B) { return ((long)B.w * B.h); }

static gpt_t frame_pt(const gframe_t *F, int u, int v) {
  return mkpt(F->px + (u * F->ax) + (v * F->bx), F->py + (u * F->ay) + (v * F->by));
}

// Local coordinates of q, returned as (x = u, y = v).
//
static gpt_t frame_uv(const gframe_t *F, gpt_t q) {
  int dx = q.x - F->px,
      dy = q.y - F->py;
  return mkpt((dx * F->ax) + (dy * F->ay), (dx * F->bx) + (dy * F->by));
}

// The box covered by the local rectangle [u0, u0+w) x [v0, v0+h) of a frame.
//
static gbox_t local_box(const gframe_t *F, int u0, int v0, int w, int h) {
  gpt_t  p = frame_pt(F, u0, v0),
         q = frame_pt(F, u0 + w - 1, v0 + h - 1);
  gbox_t B;

  B.x0 = imin(p.x, q.x);
  B.y0 = imin(p.y, q.y);
  B.w  = iabs(p.x - q.x) + 1;
  B.h  = iabs(p.y - q.y) + 1;
  return B;
}

// The eight frames of a box: each corner, with the major direction along
// either of its two edges. Frames with the major direction along the longer
// side come first, as in gilbert2d's top-level call.
//
static void box_frames(gbox_t B, gframe_t *out) {
  int x1   = B.x0 + B.w - 1,
      y1   = B.y0 + B.h - 1,
      cx[4] = { B.x0, x1, B.x0, x1 },
      cy[4] = { B.y0, B.y0, y1, y1 },
      i;

  for (i = 0; i < 4; i++) {
    gframe_t fx, fy;
    int      ix = ( (cx[i] == B.x0) ? 1 : -1 ),
             iy = ( (cy[i] == B.y0) ? 1 : -1 );

    fx.px = cx[i]; fx.py = cy[i]; fx.ax = ix; fx.ay = 0;  fx.bx = 0;  fx.by = iy; fx.w = B.w; fx.h = B.h;
    fy.px = cx[i]; fy.py = cy[i]; fy.ax = 0;  fy.ay = iy; fy.bx = ix; fy.by = 0;  fy.w = B.h; fy.h = B.w;

    out[i]     = ( (B.w >= B.h) ? fx : fy );
    out[i + 4] = ( (B.w >= B.h) ? fy : fx );
  }
}

// The frames of B ordered by how near (Manhattan distance) their canonical
// endpoints are to s and t, ties in box_frames order. When s and t are the
// corners of one edge the first is the gilbert2d frame running from s to t.
//
static void frames_by_score(gbox_t B, gpt_t s, gpt_t t, gframe_t *out) {
  gframe_t fr[8];
  int      d[8], used[8] = { 0 }, i, k;

  box_frames(B, fr);
  for (i = 0; i < 8; i++) {
    gpt_t e = frame_pt(&fr[i], fr[i].w - 1, 0);
    d[i] = iabs(s.x - fr[i].px) + iabs(s.y - fr[i].py) + iabs(t.x - e.x) + iabs(t.y - e.y);
  }
  for (k = 0; k < 8; k++) {
    int best = -1;
    for (i = 0; i < 8; i++) {
      if ( (!used[i]) && ((best < 0) || (d[i] < d[best])) ) { best = i; }
    }
    used[best] = 1;
    out[k]     = fr[best];
  }
}

//----------------------------------------------------------------------------
// Feasibility tests
//----------------------------------------------------------------------------

// Checkerboard color compatibility of s and t in box B.
//
static int compatible(gbox_t B, gpt_t s, gpt_t t) {
  int cs = ((s.x + s.y) & 1),
      ct = ((t.x + t.y) & 1),
      cc = ((B.x0 + B.y0) & 1);

  if ((box_area(B) % 2) == 0) { return (cs != ct); }
  return ( (cs == cc) && (ct == cc) );
}

// Can B have a path s-t with one diagonal step, by the checkerboard count? A
// diagonal step joins two cells of the same color, so the path is two
// alternating runs; in an odd box they must hold one more corner-colored cell
// than the other color, which is impossible if s and t are both off-color.
//
static int diag_count_ok(gbox_t B, gpt_t s, gpt_t t) {
  int cc = ((B.x0 + B.y0) & 1);
  if ((box_area(B) % 2) == 0) { return 1; }
  return ( (((s.x + s.y) & 1) == cc) || (((t.x + t.y) & 1) == cc) );
}

// IPS acceptability: does B have an orthogonal Hamiltonian path s-t?
//
static int gep_ips_ok(gbox_t B, gpt_t s, gpt_t t) {
  return ips_ok(B.h, B.w, s.y - B.y0, s.x - B.x0, t.y - B.y0, t.x - B.x0);
}

// Checkerboard excess (cells of the corner color minus the others) of a path
// from a to b.
//
static int path_excess(gbox_t B, gpt_t a, gpt_t b) {
  int cc = ((B.x0 + B.y0) & 1),
      ca = ((a.x + a.y) & 1),
      cb = ((b.x + b.y) & 1);
  if (ca != cb) { return 0; }
  return ( (ca == cc) ? 1 : -1 );
}

//----------------------------------------------------------------------------
// Templates and junctions
//----------------------------------------------------------------------------

// gilbert: the template is gilbert2d's own for its frame; canonical: and the
// endpoints are gilbert2d's too (the corners of one edge, in frame order).
//
typedef struct {
  int    kind, w2, h2, n;
  int    gilbert, canonical;
  gbox_t box[3];
} gtmpl_t;

// A junction: x in the piece being left, y in the piece being entered.
//
typedef struct {
  gpt_t x, y;
  int   diag, rank, tie, idx;
} gjunc_t;

// Junctions of one pair of pieces, sorted by rank; rank r occupies
// c[start[r]] .. c[start[r+1]-1].
//
typedef struct {
  gjunc_t *c;
  int      n, nrank;
  int     *start;
} gjlist_t;

// Half of a side of length len in direction dir, rounded the way gilbert2d's
// floor division rounds it (up for a negative direction).
//
static int half(int len, int dir) { return ( (dir < 0) ? ((len + 1) / 2) : (len / 2) ); }

// A template of the given kind with the given cut sizes: kind 2 (pieces L,
// R: major side cut at w2) or kind 3 (pieces A, B, C: minor side cut at h2,
// lower part cut at w2).
//
static gtmpl_t template_at(const gframe_t *F, int kind, int w2, int h2) {
  gtmpl_t T;

  memset(&T, 0, sizeof(T));
  T.kind = kind;
  T.w2   = w2;
  if (kind == 2) {
    T.n      = 2;
    T.box[0] = local_box(F, 0, 0, w2, F->h);
    T.box[1] = local_box(F, w2, 0, F->w - w2, F->h);
    return T;
  }
  T.h2     = h2;
  T.n      = 3;
  T.box[0] = local_box(F, 0, 0, w2, h2);
  T.box[1] = local_box(F, 0, h2, F->w, F->h - h2);
  T.box[2] = local_box(F, w2, 0, F->w - w2, h2);
  return T;
}

// The gilbert2d template for frame F.
//
static gtmpl_t make_template(const gframe_t *F) {
  int w  = F->w,
      h  = F->h,
      w2 = half(w, F->ax + F->ay),
      h2 = half(h, F->bx + F->by);

  // Long case: two pieces along the major side, preferring an even cut.
  //
  gtmpl_t T;

  if ((2 * w) > (3 * h)) {
    if ( ((w2 % 2) == 1) && (w > 2) ) { w2++; }
    T = template_at(F, 2, w2, 0);
  }

  // Standard case: lower first, upper, lower second.
  //
  else {
    if ( ((h2 % 2) == 1) && (h > 2) ) { h2++; }
    T = template_at(F, 3, w2, h2);
  }
  T.gilbert = 1;
  return T;
}

// The template of the other kind for frame F, cut at the midpoint the same
// way (used when the gilbert2d template doesn't work). Returns 0 if there is
// none.
//
static int flipped_template(const gframe_t *F, const gtmpl_t *base, gtmpl_t *out) {
  int w2 = half(F->w, F->ax + F->ay),
      h2 = half(F->h, F->bx + F->by);

  if (base->kind == 3) {
    if ( (w2 < 1) || (w2 >= F->w) ) { return 0; }
    *out = template_at(F, 2, w2, 0);
    return 1;
  }
  if ( (h2 < 1) || (h2 >= F->h) || (w2 < 1) || (w2 >= F->w) ) { return 0; }
  *out = template_at(F, 3, w2, h2);
  return 1;
}

typedef struct { int d, w2, h2; } gcut_t;

static int cut_cmp(const void *pa, const void *pb) {
  const gcut_t *a = pa, *b = pb;
  if (a->d  != b->d)  { return ( (a->d  < b->d)  ? -1 : 1 ); }
  if (a->h2 != b->h2) { return ( (a->h2 < b->h2) ? -1 : 1 ); }
  if (a->w2 != b->w2) { return ( (a->w2 < b->w2) ? -1 : 1 ); }
  return 0;
}

// Moved cuts, for when the template at its own cut fails: the same kind of
// template with its cut(s) shifted, only where s and t land in different
// pieces, nearest the original cut first (at most GEP_MOVED_CUTS of them, the
// original cut itself excluded). Returns the number written to out.
//
static int moved_part(gpt_t l, int w2, int h2) { return ( (l.y >= h2) ? 1 : ( (l.x < w2) ? 0 : 2 ) ); }

static int moved_templates(const gframe_t *F, const gtmpl_t *base, gpt_t s, gpt_t t, gtmpl_t *out) {
  gpt_t   ls  = frame_uv(F, s),
          lt  = frame_uv(F, t);
  int     cap = ( (base->kind == 2) ? (F->w + 1) : (GEP_MOVED_CUTS + (4 * (F->w + F->h + 2))) ),
          n   = 0, w2, h2, d, dh, q, i;
  gcut_t *cand = xmalloc((size_t)cap * sizeof(gcut_t));

  if (base->kind == 2) {
    for (w2 = 1; w2 < F->w; w2++) {
      if ( (ls.x < w2) == (lt.x < w2) ) { continue; }
      if (w2 == base->w2)                { continue; }
      cand[n].d = iabs(w2 - base->w2); cand[n].w2 = w2; cand[n].h2 = 0; n++;
    }
  }
  else {

    // Rings of increasing distance from the original cut, stopping once a
    // ring completes GEP_MOVED_CUTS candidates (the same result as sorting
    // all of them).
    //
    for (d = 1; (d <= (F->w + F->h)) && (n < GEP_MOVED_CUTS); d++) {
      for (dh = -d; dh <= d; dh++) {
        int rest = d - iabs(dh),
            dws[2], nd;
        h2 = base->h2 + dh;
        if ( (h2 < 1) || (h2 >= F->h) ) { continue; }
        if (rest == 0) { dws[0] = 0; nd = 1; }
        else           { dws[0] = -rest; dws[1] = rest; nd = 2; }
        for (q = 0; q < nd; q++) {
          w2 = base->w2 + dws[q];
          if ( (w2 < 1) || (w2 >= F->w) )                        { continue; }
          if (moved_part(ls, w2, h2) == moved_part(lt, w2, h2)) { continue; }
          if (n == cap) { cap *= 2; cand = xrealloc(cand, (size_t)cap * sizeof(gcut_t)); }
          cand[n].d = d; cand[n].w2 = w2; cand[n].h2 = h2; n++;
        }
      }
    }
  }

  if (n > 1) { qsort(cand, (size_t)n, sizeof(gcut_t), cut_cmp); }
  n = imin(n, GEP_MOVED_CUTS);
  for (i = 0; i < n; i++) { out[i] = template_at(F, base->kind, cand[i].w2, cand[i].h2); }
  free(cand);
  return n;
}

// Rank of a junction between pieces ia and ib (0 is best): how far the
// junction is from the outer edge of the rectangle along its cleave. For
// kind 2 either end of the cleave is an outer edge (ties go to v = 0, the
// canonical edge); for kind 3 the far end from the point where the three
// pieces meet is.
//
static void junction_rank(const gframe_t *F, const gtmpl_t *T, int ia, int ib, gpt_t x, gpt_t y, int *rank, int *tie) {
  gpt_t lx = frame_uv(F, x),
        ly = frame_uv(F, y);
  int   lo = imin(ia, ib),
        hi = imax(ia, ib);

  *tie = 0;
  if (T->kind == 2) {
    int rx = imin(lx.y, F->h - 1 - lx.y),
        ry = imin(ly.y, F->h - 1 - ly.y);
    *rank = imin(rx, ry);
    *tie  = imin(lx.y, ly.y);
    return;
  }
  if      ( (lo == 0) && (hi == 1) ) { *rank = imin(lx.x, ly.x); }
  else if ( (lo == 1) && (hi == 2) ) { *rank = imin(F->w - 1 - lx.x, F->w - 1 - ly.x); }
  else                               { *rank = imin(lx.y, ly.y); }
}

static int junc_cmp(const void *pa, const void *pb) {
  const gjunc_t *a = pa, *b = pb;
  if (a->rank != b->rank) { return ( (a->rank < b->rank) ? -1 : 1 ); }
  if (a->tie  != b->tie)  { return ( (a->tie  < b->tie)  ? -1 : 1 ); }
  return ( (a->idx < b->idx) ? -1 : ( (a->idx > b->idx) ? 1 : 0 ) );
}

// All junctions from piece ia to piece ib, sorted by rank: pairs of cells
// (x in piece ia, y in piece ib) that are orthogonally adjacent, or
// diagonally adjacent when a diagonal step is allowed.
//
static void junctions(const gframe_t *F, const gtmpl_t *T, int ia, int ib, int allow_diag, gjlist_t *J) {
  gbox_t X   = T->box[ia],
         Y   = T->box[ib];
  int    x1  = X.x0 + X.w - 1,
         y1  = X.y0 + X.h - 1,
         cap = 8 * ((2 * (X.w + X.h)) + 4),
         xx, yy, dx, dy, i, r;

  J->c = xmalloc((size_t)cap * sizeof(gjunc_t));
  J->n = 0;

  for (yy = X.y0; yy <= y1; yy++) {
    int edge_row = ( (yy == X.y0) || (yy == y1) ),
        step     = ( edge_row ? 1 : imax(1, X.w - 1) );

    for (xx = X.x0; xx <= x1; xx += step) {
      for (dy = -1; dy <= 1; dy++) {
        for (dx = -1; dx <= 1; dx++) {
          int   dg = ( (dx != 0) && (dy != 0) );
          gpt_t q  = mkpt(xx + dx, yy + dy);
          if ( (dx == 0) && (dy == 0) ) { continue; }
          if ( dg && (!allow_diag) )    { continue; }
          if (!in_box(Y, q))            { continue; }

          J->c[J->n].x    = mkpt(xx, yy);
          J->c[J->n].y    = q;
          J->c[J->n].diag = dg;
          J->c[J->n].idx  = J->n;
          junction_rank(F, T, ia, ib, J->c[J->n].x, q, &J->c[J->n].rank, &J->c[J->n].tie);
          J->n++;
        }
      }
    }
  }

  if (J->n > 1) { qsort(J->c, (size_t)J->n, sizeof(gjunc_t), junc_cmp); }

  J->nrank = ( (J->n > 0) ? (J->c[J->n - 1].rank + 1) : 0 );
  J->start = xmalloc((size_t)(J->nrank + 1) * sizeof(int));
  for (r = 0, i = 0; r <= J->nrank; r++) {
    while ( (i < J->n) && (J->c[i].rank < r) ) { i++; }
    J->start[r] = i;
  }
}

static void jlist_free(gjlist_t *J) {
  free(J->c);
  free(J->start);
}

// Piece schedules: lists of piece indices, s's piece first and t's last. If
// s and t share a piece the schedule is a loop starting and ending there.
// Returns the number of schedules; len[i] is the length of sched[i].
//
static int schedules(const gtmpl_t *T, int is, int it, int sched[2][4], int *len) {
  int o[2], n = 0, i;

  if (T->kind == 2) {
    if (is != it) { sched[0][0] = is; sched[0][1] = it; len[0] = 2; }
    else          { sched[0][0] = is; sched[0][1] = 1 - is; sched[0][2] = is; len[0] = 3; }
    return 1;
  }
  if (is != it) {
    sched[0][0] = is; sched[0][1] = 3 - is - it; sched[0][2] = it; len[0] = 3;
    return 1;
  }

  for (i = 0; i < 3; i++) {
    if (i != is) { o[n++] = i; }
  }
  sched[0][0] = is; sched[0][1] = o[0]; sched[0][2] = o[1]; sched[0][3] = is; len[0] = 4;
  sched[1][0] = is; sched[1][1] = o[1]; sched[1][2] = o[0]; sched[1][3] = is; len[1] = 4;
  return 2;
}

// Orientation of a loop: the signed area of the polygon through the exit
// junction, the pieces visited, and the re-entry junction. For kind 3 the
// order of the three pieces alone decides it; for kind 2 (one other piece)
// the positions of the exit and re-entry do. Points are doubled to keep them
// integral.
//
static int loop_is_ccw(const gtmpl_t *T, const int *sched, const gjunc_t *c0, const gjunc_t *cL) {
  long long px[4], py[4], area = 0;
  int       n = 0, i;

  if (T->kind == 3) {
    for (i = 0; i < 3; i++) {
      gbox_t B = T->box[sched[i]];
      px[n] = (2LL * B.x0) + B.w - 1;
      py[n] = (2LL * B.y0) + B.h - 1;
      n++;
    }
  }
  else {
    gbox_t B1 = T->box[sched[1]],
           B0 = T->box[sched[0]];
    px[0] = c0->x.x + c0->y.x;          py[0] = c0->x.y + c0->y.y;
    px[1] = (2LL * B1.x0) + B1.w - 1;   py[1] = (2LL * B1.y0) + B1.h - 1;
    px[2] = cL->x.x + cL->y.x;          py[2] = cL->x.y + cL->y.y;
    px[3] = (2LL * B0.x0) + B0.w - 1;   py[3] = (2LL * B0.y0) + B0.h - 1;
    n = 4;
  }

  for (i = 0; i < n; i++) {
    int j = (i + 1) % n;
    area += (px[i] * py[j]) - (px[j] * py[i]);
  }
  return ((GEP_CCW_SIGN * area) > 0);
}

//----------------------------------------------------------------------------
// Search context and output path
//----------------------------------------------------------------------------
//
// Paths are appended to ctx->path as they are built; a failed attempt
// truncates what it added.
//

// A solved (or failed) two-segment piece: key = box, the four endpoints and a
// flag; p0 = s..xo, p1 = xi..t. Entries are allocated one by one so that
// pointers to them stay valid while the memo grows.
//
#define GEP_MKEY 13

typedef struct {
  int    key[GEP_MKEY];
  int    ok;
  gpt_t *p0, *p1;
  int    n0, n1;
} gzmemo_t;

typedef struct {
  gzmemo_t **e;
  int        n, cap;
  int       *slot;
  size_t     scap;
} gmemo_t;

static size_t memo_hash(const int *k, size_t cap) {
  uint64_t h = 1469598103934665603ULL;
  int      i;
  for (i = 0; i < GEP_MKEY; i++) { h = (h ^ (uint32_t)k[i]) * 1099511628211ULL; }
  return (size_t)(h & (cap - 1));
}

static gzmemo_t *memo_find(const gmemo_t *M, const int *key) {
  size_t i;

  if (M->scap == 0) { return NULL; }
  i = memo_hash(key, M->scap);
  while (M->slot[i]) {
    gzmemo_t *e = M->e[M->slot[i] - 1];
    if (memcmp(e->key, key, sizeof(e->key)) == 0) { return e; }
    i = (i + 1) & (M->scap - 1);
  }
  return NULL;
}

// A new entry for key (not already present), with nothing solved yet.
//
static gzmemo_t *memo_add(gmemo_t *M, const int *key) {
  gzmemo_t *e = xmalloc(sizeof(gzmemo_t));
  size_t    i;
  int       j;

  memcpy(e->key, key, sizeof(e->key));
  e->ok = 0;
  e->p0 = e->p1 = NULL;
  e->n0 = e->n1 = 0;

  if (M->n == M->cap) {
    M->cap = ( (M->cap > 0) ? (2 * M->cap) : 64 );
    M->e   = xrealloc(M->e, (size_t)M->cap * sizeof(gzmemo_t *));
  }
  M->e[M->n++] = e;

  if ((2 * (size_t)M->n) > M->scap) {
    M->scap = ( (M->scap > 0) ? (2 * M->scap) : 256 );
    while ((2 * (size_t)M->n) > M->scap) { M->scap *= 2; }
    free(M->slot);
    M->slot = xmalloc(M->scap * sizeof(int));
    memset(M->slot, 0, M->scap * sizeof(int));
    for (j = 0; j < M->n; j++) {
      i = memo_hash(M->e[j]->key, M->scap);
      while (M->slot[i]) { i = (i + 1) & (M->scap - 1); }
      M->slot[i] = j + 1;
    }
    return e;
  }

  i = memo_hash(key, M->scap);
  while (M->slot[i]) { i = (i + 1) & (M->scap - 1); }
  M->slot[i] = M->n;
  return e;
}

static void memo_free(gmemo_t *M) {
  int i;
  for (i = 0; i < M->n; i++) {
    free(M->e[i]->p0);
    free(M->e[i]->p1);
    free(M->e[i]);
  }
  free(M->e);
  free(M->slot);
}

typedef struct {
  gpt_t    *path;
  long      n, cap;

  long      calls, call_limit, strict_limit, local_limit;
  int       zzn_calls, plug_calls, budget_hit;

  // Failure cache: open addressing on (box, s, t).
  //
  int      *fkey;
  size_t    fcap, fcnt;

  gmemo_t   zm, rm;
  int       strict_left;
} gctx_t;

static void push_pt(gctx_t *ctx, gpt_t q) {
  if (ctx->n == ctx->cap) {
    ctx->cap  = ( (ctx->cap > 0) ? (2 * ctx->cap) : 1024 );
    ctx->path = xrealloc(ctx->path, (size_t)ctx->cap * sizeof(gpt_t));
  }
  ctx->path[ctx->n++] = q;
}

static size_t fkey_hash(const int *k, size_t cap) {
  uint64_t h = 1469598103934665603ULL;
  int      i;
  for (i = 0; i < 8; i++) { h = (h ^ (uint32_t)k[i]) * 1099511628211ULL; }
  return (size_t)(h & (cap - 1));
}

static int fail_has(const gctx_t *ctx, const int *k) {
  size_t i = fkey_hash(k, ctx->fcap);
  while (ctx->fkey[9 * i]) {
    if (memcmp(ctx->fkey + (9 * i) + 1, k, 8 * sizeof(int)) == 0) { return 1; }
    i = (i + 1) & (ctx->fcap - 1);
  }
  return 0;
}

static void fail_add(gctx_t *ctx, const int *k) {
  size_t i;

  if ((2 * (ctx->fcnt + 1)) > ctx->fcap) {
    int    *old  = ctx->fkey;
    size_t  ocap = ctx->fcap, j;

    ctx->fcap *= 2;
    ctx->fkey  = xmalloc(ctx->fcap * 9 * sizeof(int));
    memset(ctx->fkey, 0, ctx->fcap * 9 * sizeof(int));
    for (j = 0; j < ocap; j++) {
      if (old[9 * j]) {
        i = fkey_hash(old + (9 * j) + 1, ctx->fcap);
        while (ctx->fkey[9 * i]) { i = (i + 1) & (ctx->fcap - 1); }
        memcpy(ctx->fkey + (9 * i), old + (9 * j), 9 * sizeof(int));
      }
    }
    free(old);
  }

  i = fkey_hash(k, ctx->fcap);
  while (ctx->fkey[9 * i]) { i = (i + 1) & (ctx->fcap - 1); }
  ctx->fkey[9 * i] = 1;
  memcpy(ctx->fkey + (9 * i) + 1, k, 8 * sizeof(int));
  ctx->fcnt++;
}

static int gen(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t t);

//----------------------------------------------------------------------------
// Plans
//----------------------------------------------------------------------------
//
// A plan is a schedule plus one junction per consecutive pair of pieces. Its
// segments are the pieces with their (virtual) endpoints. The shape step
// checks a plan cheaply and works out where its diagonal step, if any, goes;
// the solve step then recurses.
//

typedef struct {
  int     k, loop, pref, idx;
  int     forced, own, allow_zzn, strict;
  int     sched[4];
  gjunc_t jn[3];
} gplan_t;

typedef struct {
  gplan_t *p;
  int      n, cap;
} gplans_t;

// Segment i of a plan: its box and endpoints.
//
static void plan_seg(const gtmpl_t *T, const gplan_t *P, int i, gpt_t s, gpt_t t, gbox_t *B, gpt_t *a, gpt_t *b) {
  *B = T->box[P->sched[i]];
  *a = ( (i == 0)    ? s : P->jn[i - 1].y );
  *b = ( (i == P->k) ? t : P->jn[i].x );
}

// The longest straight run a one-path piece is likely to force, from its
// shape: a 1-wide piece is a single line; in a 2- or 3-wide piece, the part
// beyond both endpoints along its length has to be covered out and back,
// which (a hairpin in 2 rows, and in practice in 3) runs its whole length.
//
static int forced_run(gbox_t B, gpt_t a, gpt_t b) {
  int L = imax(B.w, B.h),
      pa, pb;

  if (imin(B.w, B.h) == 1) { return L; }
  if (imin(B.w, B.h) > 3)  { return 0; }

  pa = ( (B.w >= B.h) ? (a.x - B.x0) : (a.y - B.y0) );
  pb = ( (B.w >= B.h) ? (b.x - B.x0) : (b.y - B.y0) );
  return ( imax(imin(pa, pb), L - 1 - imax(pa, pb)) + 1 );
}

// Fill in loop, pref and forced; returns 0 if the plan is ruled out.
//
static int plan_shape(const gtmpl_t *T, gplan_t *P, gpt_t s, gpt_t t, int need_diag) {
  int ndiag = 0, j, i;

  P->loop   = (P->sched[0] == P->sched[P->k]);
  P->pref   = 0;
  P->forced = 0;

  for (j = 0; j < P->k; j++) {
    if (P->jn[j].diag) { ndiag++; P->pref = (2 * j) + 1; }
  }

  for (i = 0; i <= P->k; i++) {
    gbox_t B;
    gpt_t  a, b;

    plan_seg(T, P, i, s, t, &B, &a, &b);
    if ( P->loop && ((i == 0) || (i == P->k)) ) { continue; }

    if (same_pt(a, b)) {
      if (box_area(B) != 1) { return 0; }
      continue;
    }
    if (compatible(B, a, b)) {
      if (!gep_ips_ok(B, a, b)) { return 0; }
    }
    else {
      ndiag++;
      P->pref = 2 * i;
    }
    P->forced = imax(P->forced, forced_run(B, a, b));
  }

  return (ndiag == ( need_diag ? 1 : 0 ));
}

static void shape_into(gplans_t *L, const gtmpl_t *T, const int *sched, int k, const gjunc_t *jn, gpt_t s, gpt_t t, int need_diag, int allow_zzn, int strict) {
  gplan_t P;
  int     j, all0 = 1;

  memset(&P, 0, sizeof(P));
  P.k = k;
  for (j = 0; j <= k; j++) { P.sched[j] = sched[j]; }
  for (j = 0; j < k; j++)  { P.jn[j] = jn[j]; if (jn[j].rank != 0) { all0 = 0; } }
  if (!plan_shape(T, &P, s, t, need_diag)) { return; }

  // gilbert2d's own plan is exempt when the endpoints are gilbert2d's (the
  // template is gilbert2d's, the frame is canonical, every junction at rank 0).
  //
  P.own = ( T->gilbert && T->canonical && all0 );
  if ( strict && (!P.own) && (P.forced > GEP_MAX_RUN) ) { return; }
  P.allow_zzn = allow_zzn;
  P.strict    = strict;

  if (L->n == L->cap) {
    L->cap = ( (L->cap > 0) ? (2 * L->cap) : 64 );
    L->p   = xrealloc(L->p, (size_t)L->cap * sizeof(gplan_t));
  }
  P.idx = L->n;
  L->p[L->n++] = P;
}

// Position of a boundary cell going around box B, or -1 for an interior cell
// (or a box too thin to have an interior).
//
static int gep_perim_index(gbox_t B, gpt_t q) {
  int x = q.x - B.x0,
      y = q.y - B.y0,
      w = B.w,
      h = B.h;

  if ( (w < 2) || (h < 2) ) { return -1; }
  if (y == 0)               { return x; }
  if (x == (w - 1))         { return (w - 1) + y; }
  if (y == (h - 1))         { return (w - 1) + (h - 1) + (w - 1 - x); }
  if (x == 0)               { return (2 * (w - 1)) + (h - 1) + (h - 1 - y); }
  return -1;
}

// Quick necessary conditions for the two-segment piece B with paths s-xo and
// xi-t: distinct endpoints, the checkerboard count, and (when all four are on
// the boundary) no interleaving of the two pairs around it.
//
static int zzn_quick(gbox_t B, gpt_t s, gpt_t xo, gpt_t xi, gpt_t t) {
  gpt_t e[4];
  int   k[4], p, q, box_ex;

  e[0] = s; e[1] = xo; e[2] = xi; e[3] = t;
  for (p = 0; p < 4; p++) {
    for (q = p + 1; q < 4; q++) {
      if (same_pt(e[p], e[q])) { return 0; }
    }
  }

  box_ex = ( ((box_area(B) % 2) == 1) ? 1 : 0 );
  if ((path_excess(B, s, xo) + path_excess(B, xi, t)) != box_ex) { return 0; }

  for (p = 0; p < 4; p++) { k[p] = gep_perim_index(B, e[p]); }
  if ( (k[0] >= 0) && (k[1] >= 0) && (k[2] >= 0) && (k[3] >= 0) ) {
    int lo = imin(k[0], k[1]),
        hi = imax(k[0], k[1]),
        i2 = ( (k[2] > lo) && (k[2] < hi) ),
        i3 = ( (k[3] > lo) && (k[3] < hi) );
    if (i2 != i3) { return 0; }
  }
  return 1;
}

// Solve the two-segment piece of a loop plan with the k=2 ZZN solver
// (memoized). Returns the memo entry, or NULL.
//
static gzmemo_t *solve_zzn_piece(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t xo, gpt_t xi, gpt_t t) {
  int       key[GEP_MKEY] = { B.x0, B.y0, B.w, B.h, s.x, s.y, xo.x, xo.y, xi.x, xi.y, t.x, t.y, 0 },
            pts[8], i, k;
  result_t  res;
  gzmemo_t *m = memo_find(&ctx->zm, key);

  if (m != NULL) { return ( m->ok ? m : NULL ); }

  ctx->zzn_calls++;
  if (ctx->zzn_calls > GEP_ZZN_BUDGET) { ctx->budget_hit = 1; return NULL; }

  pts[0] = s.y - B.y0;  pts[1] = s.x - B.x0;
  pts[2] = xo.y - B.y0; pts[3] = xo.x - B.x0;
  pts[4] = xi.y - B.y0; pts[5] = xi.x - B.x0;
  pts[6] = t.y - B.y0;  pts[7] = t.x - B.x0;
  zzn_solve(B.h, B.w, pts, &res);

  m     = memo_add(&ctx->zm, key);
  m->ok = (res.status == ZZN_SOLVED);
  if (!m->ok) { return NULL; }

  for (k = 0; k < 2; k++) {
    gpt_t *p = xmalloc((size_t)res.len[k] * sizeof(gpt_t));
    for (i = 0; i < res.len[k]; i++) { p[i] = mkpt((res.path[k][i] % B.w) + B.x0, (res.path[k][i] / B.w) + B.y0); }
    if (k == 0) { m->p0 = p; m->n0 = res.len[k]; }
    else        { m->p1 = p; m->n1 = res.len[k]; }
    free(res.path[k]);
  }
  return m;
}

typedef struct { int vert, c, longer, idx; long num, den; } gtcut_t;

static int tcut_cmp(const void *pa, const void *pb) {
  const gtcut_t *a = pa, *b = pb;
  long           l = a->num * b->den,
                 r = b->num * a->den;

  if (l != r)                 { return ( (l < r) ? -1 : 1 ); }
  if (a->longer != b->longer) { return ( (a->longer < b->longer) ? -1 : 1 ); }
  if (a->vert != b->vert)     { return ( a->vert ? -1 : 1 ); }
  if (a->c != b->c)           { return ( (a->c < b->c) ? -1 : 1 ); }
  return 0;
}

// Solve the two-segment piece B (paths s-xo and xi-t) by recursion: a
// straight cut with s and xo on one side and xi and t on the other, each side
// then being an ordinary one-path problem. Cuts whose sides force no long
// straight run come first (and, with strict set, are the only ones tried);
// within that, cuts nearest the middle, the longer side's first on ties.
// Memoized. Returns the memo entry, or NULL.
//
static gzmemo_t *rec_two_piece(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t xo, gpt_t xi, gpt_t t, int strict) {
  int       key[GEP_MKEY] = { B.x0, B.y0, B.w, B.h, s.x, s.y, xo.x, xo.y, xi.x, xi.y, t.x, t.y, strict },
            n = 0, pass, i, vert, cc;
  gzmemo_t *m = memo_find(&ctx->rm, key);
  gtcut_t  *cuts;

  if (m != NULL) { return ( m->ok ? m : NULL ); }
  if (!zzn_quick(B, s, xo, xi, t)) {
    memo_add(&ctx->rm, key);
    return NULL;
  }

  cuts = xmalloc((size_t)(B.w + B.h) * sizeof(gtcut_t));
  for (vert = 1; vert >= 0; vert--) {
    int len   = ( vert ? B.w : B.h ),
        other = ( vert ? B.h : B.w );
    for (cc = 1; cc < len; cc++) {
      int ss  = ( vert ? (s.x < (B.x0 + cc))  : (s.y < (B.y0 + cc)) ),
          so  = ( vert ? (xo.x < (B.x0 + cc)) : (xo.y < (B.y0 + cc)) ),
          si  = ( vert ? (xi.x < (B.x0 + cc)) : (xi.y < (B.y0 + cc)) ),
          st  = ( vert ? (t.x < (B.x0 + cc))  : (t.y < (B.y0 + cc)) );
      if ( (ss != so) || (si != st) || (ss == si) ) { continue; }
      cuts[n].vert   = vert;
      cuts[n].c      = cc;
      cuts[n].num    = iabs((2 * cc) - len);
      cuts[n].den    = len;
      cuts[n].longer = ( (len >= other) ? 0 : 1 );
      cuts[n].idx    = n;
      n++;
    }
  }
  if (n > 1) { qsort(cuts, (size_t)n, sizeof(gtcut_t), tcut_cmp); }

  for (pass = 0; pass < ( strict ? 1 : 2 ); pass++) {
    for (i = 0; i < n; i++) {
      gbox_t P, Q, tmp;
      long   start = ctx->n, mid;
      int    frc;

      if (cuts[i].vert) {
        P.x0 = B.x0;             P.y0 = B.y0; P.w = cuts[i].c;       P.h = B.h;
        Q.x0 = B.x0 + cuts[i].c; Q.y0 = B.y0; Q.w = B.w - cuts[i].c; Q.h = B.h;
      }
      else {
        P.x0 = B.x0; P.y0 = B.y0;             P.w = B.w; P.h = cuts[i].c;
        Q.x0 = B.x0; Q.y0 = B.y0 + cuts[i].c; Q.w = B.w; Q.h = B.h - cuts[i].c;
      }
      if (!in_box(P, s)) { tmp = P; P = Q; Q = tmp; }

      frc = imax(forced_run(P, s, xo), forced_run(Q, xi, t));
      if ( (pass == 0) && (frc > GEP_MAX_RUN) )  { continue; }
      if ( (pass == 1) && (frc <= GEP_MAX_RUN) ) { continue; }
      if ( (!compatible(P, s, xo)) || (!compatible(Q, xi, t)) ) { continue; }
      if ( (!gep_ips_ok(P, s, xo)) || (!gep_ips_ok(Q, xi, t)) ) { continue; }

      if (gen(ctx, P, s, xo)) {
        mid = ctx->n;
        if (gen(ctx, Q, xi, t)) {
          m     = memo_add(&ctx->rm, key);
          m->ok = 1;
          m->n0 = (int)(mid - start);
          m->n1 = (int)(ctx->n - mid);
          m->p0 = xmalloc((size_t)m->n0 * sizeof(gpt_t));
          m->p1 = xmalloc((size_t)m->n1 * sizeof(gpt_t));
          memcpy(m->p0, ctx->path + start, (size_t)m->n0 * sizeof(gpt_t));
          memcpy(m->p1, ctx->path + mid, (size_t)m->n1 * sizeof(gpt_t));
          ctx->n = start;
          free(cuts);
          return m;
        }
      }
      ctx->n = start;
      if (ctx->budget_hit) { free(cuts); return NULL; }
    }
  }

  free(cuts);
  memo_add(&ctx->rm, key);
  return NULL;
}

// The two-segment piece of a loop plan: by recursion if possible, otherwise
// (when allowed) with the k=2 ZZN solver.
//
static gzmemo_t *solve_two_piece(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t xo, gpt_t xi, gpt_t t, int allow_zzn, int strict) {
  gzmemo_t *r = rec_two_piece(ctx, B, s, xo, xi, t, strict);
  if ( (r != NULL) || (!allow_zzn) || ctx->budget_hit ) { return r; }
  return solve_zzn_piece(ctx, B, s, xo, xi, t);
}

// Longest straight run (in cells) in the output from index start on.
//
static int longest_run(const gctx_t *ctx, long start) {
  const gpt_t *P    = ctx->path;
  int          best = ( (ctx->n > start) ? 1 : 0 ),
               run  = 1;
  long         i;

  for (i = start + 1; i < ctx->n; i++) {
    int ok = ( (i >= (start + 2)) &&
               ((P[i].x - P[i - 1].x) == (P[i - 1].x - P[i - 2].x)) &&
               ((P[i].y - P[i - 1].y) == (P[i - 1].y - P[i - 2].y)) );
    run  = ( ok ? (run + 1) : 2 );
    best = imax(best, run);
  }
  return best;
}

// Solve a plan: the two-segment piece first (if any), then each one-segment
// piece recursively. Appends the whole path; returns 1, or 0 (nothing added).
//
static int plan_solve(gctx_t *ctx, const gtmpl_t *T, const gplan_t *P, gpt_t s, gpt_t t) {
  long      start = ctx->n;
  gzmemo_t *zm    = NULL;
  int       i, j;

  ctx->calls++;
  if (ctx->calls > ctx->call_limit) { ctx->budget_hit = 1; return 0; }

  if (P->loop) {
    gbox_t B;
    gpt_t  a, b, a2, b2;
    plan_seg(T, P, 0, s, t, &B, &a, &b);
    plan_seg(T, P, P->k, s, t, &B, &a2, &b2);
    zm = solve_two_piece(ctx, B, a, b, a2, b2, P->allow_zzn, P->strict);
    if (zm == NULL) { return 0; }
  }

  for (i = 0; i <= P->k; i++) {
    gbox_t B;
    gpt_t  a, b;

    if ( P->loop && (i == 0) )    { for (j = 0; j < zm->n0; j++) { push_pt(ctx, zm->p0[j]); } continue; }
    if ( P->loop && (i == P->k) ) { for (j = 0; j < zm->n1; j++) { push_pt(ctx, zm->p1[j]); } continue; }

    plan_seg(T, P, i, s, t, &B, &a, &b);
    if (!gen(ctx, B, a, b)) {
      ctx->n = start;
      return 0;
    }
  }

  // Strict round: reject the plan if what it produced has a straight run
  // longer than GEP_MAX_RUN (gilbert2d's own plan excepted).
  //
  if ( P->strict && (!P->own) && (longest_run(ctx, start) > GEP_MAX_RUN) ) {
    ctx->n = start;
    ctx->strict_left--;
    return 0;
  }
  return 1;
}

static int plan_cmp(const void *pa, const void *pb) {
  const gplan_t *a = pa, *b = pb;
  int            q;

  if (a->pref != b->pref) { return ( (a->pref > b->pref) ? -1 : 1 ); }
  for (q = 0; q < a->k; q++) {
    if (a->jn[q].tie != b->jn[q].tie) { return ( (a->jn[q].tie < b->jn[q].tie) ? -1 : 1 ); }
  }
  return ( (a->idx < b->idx) ? -1 : ( (a->idx > b->idx) ? 1 : 0 ) );
}

// Try shaped plans in order: diagonal step as late as possible, then junction
// tie order. Returns 1 if one solved. Empties the list.
//
static int try_plans(gctx_t *ctx, const gtmpl_t *T, gplans_t *L, gpt_t s, gpt_t t) {
  int i, ok = 0;

  if (L->n == 0) { return 0; }

  qsort(L->p, (size_t)L->n, sizeof(gplan_t), plan_cmp);
  for (i = 0; i < L->n; i++) {
    if ( L->p[i].strict && ((ctx->strict_left <= 0) || (ctx->calls > ctx->strict_limit)) ) { break; }
    if (ctx->calls > ctx->local_limit)                                                     { break; }
    if (plan_solve(ctx, T, &L->p[i], s, t))          { ok = 1; break; }
    if (ctx->budget_hit)                             { break; }
  }
  L->n = 0;
  return ok;
}

// Plans of a schedule that visits each piece once (one or two junctions), by
// lowest total junction rank (junctions nearest the outer edges first).
//
static int try_line(gctx_t *ctx, const gtmpl_t *T, const int *sc, int k, gjlist_t *J, gpt_t s, gpt_t t, int need_diag, int strict) {
  gplans_t L;
  int      m0  = J[0].nrank - 1,
           m1  = ( (k == 2) ? (J[1].nrank - 1) : 0 ),
           top = m0 + m1,
           sum, r0, i, j, res = 0;
  gjunc_t  jn[3];

  memset(&L, 0, sizeof(L));
  for (sum = 0; (sum <= top) && (!res); sum++) {
    for (r0 = 0; (r0 <= m0) && (r0 <= sum); r0++) {
      int r1 = sum - r0;

      if (k == 1) {
        if (r1 != 0) { continue; }
        for (i = J[0].start[r0]; i < J[0].start[r0 + 1]; i++) {
          jn[0] = J[0].c[i];
          shape_into(&L, T, sc, 1, jn, s, t, need_diag, 0, strict);
        }
        continue;
      }

      if (r1 > m1) { continue; }
      for (i = J[0].start[r0]; i < J[0].start[r0 + 1]; i++) {
        for (j = J[1].start[r1]; j < J[1].start[r1 + 1]; j++) {
          jn[0] = J[0].c[i];
          jn[1] = J[1].c[j];
          shape_into(&L, T, sc, 2, jn, s, t, need_diag, 0, strict);
        }
      }
    }

    res = try_plans(ctx, T, &L, s, t);
    if (ctx->budget_hit) { break; }
  }
  free(L.p);
  return res;
}

// Plans of a loop schedule with the given orientation. The two virtual
// endpoints of the two-segment piece (its exit and re-entry) are chosen
// first, nearest the outer edges; the middle junction (kind 3) second.
//
static int try_loop(gctx_t *ctx, const gtmpl_t *T, const int *sc, int k, gjlist_t *J, gpt_t s, gpt_t t, int need_diag, int want_ccw, int allow_zzn, int strict) {
  gbox_t    X   = T->box[sc[0]];
  gjlist_t *J0  = &J[0],
           *JL  = &J[k - 1],
           *JM  = ( (k == 3) ? &J[1] : NULL );
  int       m0  = J0->nrank - 1,
            mL  = JL->nrank - 1,
            sum, r0, i, j, mr, q, res = 0;
  gplans_t  L;
  gjunc_t   jn[3];

  // For kind 3 the orientation is fixed by the schedule.
  //
  if ( (T->kind == 3) && (loop_is_ccw(T, sc, NULL, NULL) != want_ccw) ) { return 0; }

  memset(&L, 0, sizeof(L));
  for (sum = 0; (sum <= (m0 + mL)) && (!res); sum++) {
    for (r0 = imax(0, sum - mL); (r0 <= imin(sum, m0)) && (!res); r0++) {
      int rL = sum - r0;

      for (i = J0->start[r0]; (i < J0->start[r0 + 1]) && (!res); i++) {
        for (j = JL->start[rL]; (j < JL->start[rL + 1]) && (!res); j++) {
          const gjunc_t *c0 = &J0->c[i],
                        *cL = &JL->c[j];
          int            nmid = ( (JM == NULL) ? 1 : JM->nrank );

          if ( (T->kind == 2) && (loop_is_ccw(T, sc, c0, cL) != want_ccw) ) { continue; }
          if (!zzn_quick(X, s, c0->x, cL->y, t)) { continue; }

          for (mr = 0; (mr < nmid) && (!res); mr++) {
            if (JM == NULL) {
              jn[0] = *c0;
              jn[1] = *cL;
              shape_into(&L, T, sc, 2, jn, s, t, need_diag, allow_zzn, strict);
            }
            else {
              for (q = JM->start[mr]; q < JM->start[mr + 1]; q++) {
                jn[0] = *c0;
                jn[1] = JM->c[q];
                jn[2] = *cL;
                shape_into(&L, T, sc, 3, jn, s, t, need_diag, allow_zzn, strict);
              }
            }
            res = try_plans(ctx, T, &L, s, t);
            if (ctx->budget_hit) { free(L.p); return res; }
          }
        }
      }
    }
  }
  free(L.p);
  return res;
}

// Try the plans of template T of one kind (mode):
//
//   GEP_LINE      schedules that visit each piece once,
//   GEP_LOOP_REC  loop schedules, the two-segment piece solved by recursion only,
//   GEP_LOOP_ZZN  loop schedules, the two-segment piece may use the ZZN solver.
//
// Loops are tried counterclockwise first, then clockwise. With strict set,
// plans with a piece forcing a straight run longer than GEP_MAX_RUN are
// skipped, except gilbert2d's own plan.
//
static int try_template(gctx_t *ctx, const gframe_t *F, const gtmpl_t *T, gpt_t s, gpt_t t, int need_diag, int mode, int strict) {
  int      sched[2][4], len[2], ns, is = -1, it = -1, i, j, pass, res = 0;
  int      want_loop = (mode != GEP_LINE);
  gjlist_t J[2][3];

  for (i = 0; i < T->n; i++) {
    if (in_box(T->box[i], s)) { is = i; }
    if (in_box(T->box[i], t)) { it = i; }
  }

  ns = schedules(T, is, it, sched, len);
  for (i = 0; i < ns; i++) {
    if ((sched[i][0] == sched[i][len[i] - 1]) != want_loop) { continue; }
    for (j = 0; j < (len[i] - 1); j++) { junctions(F, T, sched[i][j], sched[i][j + 1], need_diag, &J[i][j]); }
  }

  for (pass = 0; (pass < 2) && (!res) && (!ctx->budget_hit); pass++) {
    for (i = 0; (i < ns) && (!res) && (!ctx->budget_hit); i++) {
      int k     = len[i] - 1,
          loop  = (sched[i][0] == sched[i][k]),
          empty = 0;

      if (loop != want_loop) { continue; }
      for (j = 0; j < k; j++) {
        if (J[i][j].n == 0) { empty = 1; }
      }
      if (empty) { continue; }

      if (loop)           { res = try_loop(ctx, T, sched[i], k, J[i], s, t, need_diag, (pass == 0), (mode == GEP_LOOP_ZZN), strict); }
      else if (pass == 0) { res = try_line(ctx, T, sched[i], k, J[i], s, t, need_diag, strict); }
    }
  }

  for (i = 0; i < ns; i++) {
    if ((sched[i][0] == sched[i][len[i] - 1]) != want_loop) { continue; }
    for (j = 0; j < (len[i] - 1); j++) { jlist_free(&J[i][j]); }
  }
  return res;
}

//----------------------------------------------------------------------------
// Base cases and fallbacks
//----------------------------------------------------------------------------

// A single row or column walked from end to end.
//
static void line_path(gctx_t *ctx, gpt_t s, gpt_t t) {
  int   dx = ( (t.x > s.x) ? 1 : ( (t.x < s.x) ? -1 : 0 ) ),
        dy = ( (t.y > s.y) ? 1 : ( (t.y < s.y) ? -1 : 0 ) );
  gpt_t q  = s;

  push_pt(ctx, q);
  while (!same_pt(q, t)) {
    q = mkpt(q.x + dx, q.y + dy);
    push_pt(ctx, q);
  }
}

// Walk the path from s to t through a plugdp edge list (local coordinates of
// box B) and append it. Returns 1, or 0 (nothing added).
//
static int walk_edges(gctx_t *ctx, gbox_t B, const edge_t *edges, int ne, gpt_t s, gpt_t t) {
  long  N     = box_area(B),
        start = ctx->n;
  int  *adj   = xmalloc((size_t)(2 * N) * sizeof(int)),
       *deg   = xmalloc((size_t)N * sizeof(int)),
        cur   = ((s.y - B.y0) * B.w) + (s.x - B.x0),
        end   = ((t.y - B.y0) * B.w) + (t.x - B.x0),
        prev  = -1,
        i, ok = 1;
  long  len   = 1;

  memset(deg, 0, (size_t)N * sizeof(int));
  for (i = 0; i < ne; i++) {
    int a = (edges[i].r0 * B.w) + edges[i].c0,
        b = (edges[i].r1 * B.w) + edges[i].c1;
    if ( (deg[a] < 2) && (deg[b] < 2) ) {
      adj[(2 * a) + deg[a]++] = b;
      adj[(2 * b) + deg[b]++] = a;
    }
  }

  push_pt(ctx, s);
  while (cur != end) {
    int next = -1;
    for (i = 0; i < deg[cur]; i++) {
      if (adj[(2 * cur) + i] != prev) { next = adj[(2 * cur) + i]; break; }
    }
    if ( (next < 0) || (len > N) ) { ok = 0; break; }
    prev = cur;
    cur  = next;
    push_pt(ctx, mkpt((cur % B.w) + B.x0, (cur / B.w) + B.y0));
    len++;
  }

  free(adj);
  free(deg);
  if (!ok) { ctx->n = start; }
  return ok;
}

static end_t loc_end(gbox_t B, gpt_t q, int color) { return endp(q.y - B.y0, q.x - B.x0, color); }

// Exact single-path fallback: the plug DP with one color.
//
static int plug_path(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t t) {
  end_t   ends[2];
  edge_t *edges = NULL;
  int     ne = 0, cap = 0, ok = 0;

  ends[0] = loc_end(B, s, 0);
  ends[1] = loc_end(B, t, 0);
  if (plugdp_solve(B.h, B.w, ends, 2, &edges, &ne, &cap)) { ok = walk_edges(ctx, B, edges, ne, s, t); }
  free(edges);
  return ok;
}

typedef struct { gpt_t p, q; int d, idx; } gdpair_t;

static int dpair_cmp(const void *pa, const void *pb) {
  const gdpair_t *a = pa, *b = pb;
  if (a->d != b->d) { return ( (a->d < b->d) ? -1 : 1 ); }
  return ( (a->idx < b->idx) ? -1 : ( (a->idx > b->idx) ? 1 : 0 ) );
}

// Exact fallback with one diagonal step p-q: two orthogonal paths s-p and q-t
// that together cover the box, which is a k=2 plug DP instance. Diagonal
// pairs nearest t are tried first (gilbert2d puts its diagonal near the end).
//
static int plug_diag_path(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t t) {
  int       box_ex = ( ((box_area(B) % 2) == 1) ? 1 : 0 ),
            n      = 0, x, y, dx, dy, i, ok = 0;
  gdpair_t *pairs  = xmalloc((size_t)(4 * box_area(B)) * sizeof(gdpair_t));

  for (y = B.y0; y < (B.y0 + B.h); y++) {
    for (x = B.x0; x < (B.x0 + B.w); x++) {
      for (dy = -1; dy <= 1; dy += 2) {
        for (dx = -1; dx <= 1; dx += 2) {
          gpt_t p = mkpt(x, y),
                q = mkpt(x + dx, y + dy);
          if (!in_box(B, q)) { continue; }
          if ( same_pt(p, s) || same_pt(p, t) || same_pt(q, s) || same_pt(q, t) ) { continue; }
          if ((path_excess(B, s, p) + path_excess(B, q, t)) != box_ex) { continue; }
          pairs[n].p   = p;
          pairs[n].q   = q;
          pairs[n].d   = iabs(q.x - t.x) + iabs(q.y - t.y) + iabs(p.x - t.x) + iabs(p.y - t.y);
          pairs[n].idx = n;
          n++;
        }
      }
    }
  }
  if (n > 1) { qsort(pairs, (size_t)n, sizeof(gdpair_t), dpair_cmp); }

  for (i = 0; (i < n) && (!ok); i++) {
    end_t   ends[4];
    edge_t *edges = NULL;
    int     ne = 0, cap = 0;
    long    start = ctx->n;

    ends[0] = loc_end(B, s, 0);
    ends[1] = loc_end(B, pairs[i].p, 0);
    ends[2] = loc_end(B, pairs[i].q, 1);
    ends[3] = loc_end(B, t, 1);
    if (plugdp_solve(B.h, B.w, ends, 4, &edges, &ne, &cap)) {
      if ( walk_edges(ctx, B, edges, ne, s, pairs[i].p) &&
           walk_edges(ctx, B, edges, ne, pairs[i].q, t) ) {
        ok = 1;
      }
      else {
        ctx->n = start;
      }
    }
    free(edges);
  }
  free(pairs);
  return ok;
}

// A 3 x L strip (L odd) with one endpoint in the middle of a short end and
// the other right next to it has only solutions whose diagonal step touches
// an endpoint, which the searches above can't express. Built directly, in a
// frame with u across the strip and v along it, from (1,0) to (1,1):
//
//   (1,0) (2,0), down the far column to (2,L-1), snake back up columns 0 and
//   1 to row 2, then (0,1) (0,0) and the diagonal step to (1,1).
//
static int strip3_path(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t t) {
  gframe_t fr[8];
  int      i;

  box_frames(B, fr);
  for (i = 0; i < 8; i++) {
    const gframe_t *F = &fr[i];
    gpt_t           ls, lt;
    int             fwd, rev, L, v, n = 0, j;
    gpt_t          *loc;
    long            start = ctx->n;

    if ( (F->w != 3) || ((F->h % 2) == 0) ) { continue; }

    ls  = frame_uv(F, s);
    lt  = frame_uv(F, t);
    fwd = ( (ls.x == 1) && (ls.y == 0) && (lt.x == 1) && (lt.y == 1) );
    rev = ( (lt.x == 1) && (lt.y == 0) && (ls.x == 1) && (ls.y == 1) );
    if ( (!fwd) && (!rev) ) { continue; }

    L   = F->h;
    loc = xmalloc((size_t)(3 * L) * sizeof(gpt_t));
    loc[n++] = mkpt(1, 0);
    loc[n++] = mkpt(2, 0);
    for (v = 1; v < L; v++) { loc[n++] = mkpt(2, v); }
    for (v = L - 1; v >= 2; v--) {
      if (((L - 1 - v) % 2) == 0) { loc[n++] = mkpt(1, v); loc[n++] = mkpt(0, v); }
      else                        { loc[n++] = mkpt(0, v); loc[n++] = mkpt(1, v); }
    }
    loc[n++] = mkpt(0, 1);
    loc[n++] = mkpt(0, 0);
    loc[n++] = mkpt(1, 1);

    for (j = 0; j < n; j++) {
      gpt_t q = ( fwd ? loc[j] : loc[n - 1 - j] );
      push_pt(ctx, frame_pt(F, q.x, q.y));
    }
    free(loc);
    (void)start;
    return 1;
  }
  return 0;
}

//----------------------------------------------------------------------------
// Recursion
//----------------------------------------------------------------------------

// Each frame is tried as: its gilbert2d template, the other kind of template,
// then moved cuts of both, each piece visited once.
//
static int line_with_moves(gctx_t *ctx, const gframe_t *Fr, const gtmpl_t *base, gpt_t s, gpt_t t, int need_diag, int strict) {
  gtmpl_t list[GEP_MOVED_CUTS], U;
  int     hasU, stage, n, m;

  if (ctx->calls > ctx->local_limit) { return 0; }

  // Built lazily: the gilbert2d template usually works outright.
  //
  hasU = flipped_template(Fr, base, &U);
  for (stage = 0; stage < 4; stage++) {
    n = 0;
    if      (stage == 0)           { list[n++] = *base; }
    else if ( (stage == 1) && hasU ) { list[n++] = U; }
    else if (stage == 2)           { n = moved_templates(Fr, base, s, t, list); }
    else if ( (stage == 3) && hasU ) { n = moved_templates(Fr, &U, s, t, list); }

    for (m = 0; (m < n) && (ctx->calls <= ctx->local_limit); m++) {
      if (try_template(ctx, Fr, &list[m], s, t, need_diag, GEP_LINE, strict)) { return 1; }
      if (ctx->budget_hit)                                                    { return 0; }
    }
    if (ctx->calls > ctx->local_limit) { return 0; }
  }
  return 0;
}

// One round of the recursive search (see gen_uncached).
//
static int round_search(gctx_t *ctx, const gframe_t *frames, const gtmpl_t *base, gpt_t s, gpt_t t, int need_diag, int strict) {
  int f;

  if (line_with_moves(ctx, &frames[0], base, s, t, need_diag, strict))             { return 1; }
  if (ctx->budget_hit)                                                             { return 0; }
  if (try_template(ctx, &frames[0], base, s, t, need_diag, GEP_LOOP_REC, strict))  { return 1; }
  if (ctx->budget_hit)                                                             { return 0; }
  for (f = 1; f < 8; f++) {
    gtmpl_t T = make_template(&frames[f]);
    if (line_with_moves(ctx, &frames[f], &T, s, t, need_diag, strict))            { return 1; }
    if (ctx->budget_hit)                                                           { return 0; }
  }
  return 0;
}

static int gen_uncached(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t t) {
  int      need_diag = !compatible(B, s, t),
           saved, found = 0, first, round, cut;
  long     outer;
  gframe_t frames[8];
  gtmpl_t  base;
  gpt_t    Fe;

  ctx->calls++;
  if (ctx->calls > ctx->call_limit) { ctx->budget_hit = 1; return 0; }

  if (box_area(B) == 1) {
    if (!same_pt(s, t)) { return 0; }
    push_pt(ctx, s);
    return 1;
  }
  if (same_pt(s, t))                            { return 0; }
  if ( (!need_diag) && (!gep_ips_ok(B, s, t)) ) { return 0; }
  if ( need_diag && (!diag_count_ok(B, s, t)) ) { return 0; }
  if ( (B.w == 1) || (B.h == 1) ) {
    if (need_diag) { return 0; }
    line_path(ctx, s, t);
    return 1;
  }

  // Recursion is tried in every form before a non-recursive solver:
  //
  //   1. the best frame, each piece visited once: its gilbert2d template,
  //      the other kind of template, then moved cuts of both,
  //   2. loops whose two-segment piece is split by recursion,
  //   3. the other frames, as in 1,
  //   4. loops using the ZZN solver, then the exact fallbacks.
  //
  // Steps 1-3 run twice: first strictly (no straight run longer than
  // GEP_MAX_RUN, at most GEP_STRICT_TRIES solved plans rejected for one), then
  // without that restriction. Rectangles 3 or less across skip the strict
  // round, since long runs are forced there, and so does everything once the
  // search has used its strict budget. Steps 1-3 together may use
  // GEP_LOCAL_BUDGET + GEP_LOCAL_PER_CELL * area calls (within the parent's
  // allowance); step 4 is bounded by the parent's allowance.
  //
  frames_by_score(B, s, t, frames);
  Fe             = frame_pt(&frames[0], frames[0].w - 1, 0);
  base           = make_template(&frames[0]);
  base.canonical = ( (frames[0].px == s.x) && (frames[0].py == s.y) && same_pt(Fe, t) );

  saved = ctx->strict_left;
  outer = ctx->local_limit;
  first = ( ((imin(B.w, B.h) <= 3) || (ctx->calls > ctx->strict_limit)) ? 1 : 0 );

  ctx->local_limit = ctx->calls + GEP_LOCAL_BUDGET + (GEP_LOCAL_PER_CELL * box_area(B));
  if (outer < ctx->local_limit) { ctx->local_limit = outer; }

  for (round = first; (round < 2) && (!found) && (!ctx->budget_hit) && (ctx->calls <= ctx->local_limit); round++) {
    ctx->strict_left = GEP_STRICT_TRIES;
    found = round_search(ctx, frames, &base, s, t, need_diag, (round == 0));
  }
  cut              = (ctx->calls > ctx->local_limit);
  ctx->strict_left = saved;
  ctx->local_limit = outer;
  if (found)           { return 1; }
  if (ctx->budget_hit) { return 0; }

  // Step 4. If the budget cut steps 1-3 short, first the plain search that
  // needs no extended options: the gilbert2d template, then (around the ZZN
  // loops) its moved cuts.
  //
  if ( cut && try_template(ctx, &frames[0], &base, s, t, need_diag, GEP_LINE, 0) ) { return 1; }
  if (ctx->budget_hit)                                                             { return 0; }
  if (try_template(ctx, &frames[0], &base, s, t, need_diag, GEP_LOOP_ZZN, 0))      { return 1; }
  if (ctx->budget_hit)                                                             { return 0; }
  if (cut) {
    gtmpl_t mv[GEP_MOVED_CUTS];
    int     nm = moved_templates(&frames[0], &base, s, t, mv), m;
    for (m = 0; m < nm; m++) {
      if (try_template(ctx, &frames[0], &mv[m], s, t, need_diag, GEP_LINE, 0)) { return 1; }
      if (ctx->budget_hit)                                                      { return 0; }
    }
  }

  if ( need_diag && ((B.w == 3) || (B.h == 3)) ) {
    if (strip3_path(ctx, B, s, t)) { return 1; }
  }

  if (imin(B.w, B.h) <= GEP_PLUG_MAX_SIDE) {
    if (!need_diag) {
      ctx->plug_calls++;
      return plug_path(ctx, B, s, t);
    }
    if ( (box_area(B) <= GEP_DIAG_MAX_AREA) || (imin(B.w, B.h) <= GEP_DIAG_NARROW) ) {
      ctx->plug_calls++;
      return plug_diag_path(ctx, B, s, t);
    }
  }
  return 0;
}

// Append a path from s to t covering box B. Returns 1, or 0 (nothing added).
//
static int gen(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t t) {
  int  key[8] = { B.x0, B.y0, B.w, B.h, s.x, s.y, t.x, t.y },
       ok;
  long start  = ctx->n;

  if (fail_has(ctx, key)) { return 0; }

  ok = gen_uncached(ctx, B, s, t);
  if (!ok) {
    ctx->n = start;
    if (!ctx->budget_hit) { fail_add(ctx, key); }
  }
  return ok;
}

//----------------------------------------------------------------------------
// Top level
//----------------------------------------------------------------------------

typedef struct {
  int         status;
  const char *reason;
  gpt_t      *path;
  long        n;
  long        calls;
  int         zzn_calls, plug_calls;
} gep_result_t;

// Check a path: correct endpoints, every cell exactly once, unit steps except
// for exactly the required number of diagonal steps. Returns NULL or a fault.
//
static const char *gep_verify(int w, int h, gpt_t s, gpt_t t, const gpt_t *path, long n, int need_diag) {
  unsigned char *seen  = xmalloc((size_t)w * h);
  const char    *bad   = NULL;
  int            ndiag = 0;
  long           i;

  memset(seen, 0, (size_t)w * h);
  if      (n != ((long)w * h))           { bad = "wrong number of cells"; }
  else if (!same_pt(path[0], s))         { bad = "path starts at the wrong cell"; }
  else if (!same_pt(path[n - 1], t))     { bad = "path ends at the wrong cell"; }

  for (i = 0; (i < n) && (!bad); i++) {
    gpt_t q = path[i];
    if ( (q.x < 0) || (q.x >= w) || (q.y < 0) || (q.y >= h) ) { bad = "cell outside the grid"; break; }
    if (seen[((long)q.y * w) + q.x])                           { bad = "cell used twice"; break; }
    seen[((long)q.y * w) + q.x] = 1;

    if (i > 0) {
      int ax = iabs(q.x - path[i - 1].x),
          ay = iabs(q.y - path[i - 1].y);
      if      ( (ax + ay) == 1 )         { }
      else if ( (ax == 1) && (ay == 1) ) { ndiag++; }
      else                               { bad = "non-adjacent step"; }
    }
  }
  if ( (!bad) && (ndiag != ( need_diag ? 1 : 0 )) ) { bad = "wrong number of diagonal steps"; }
  free(seen);
  return bad;
}

// Generate the curve. On GEP_OK, res->path holds res->n cells from (x0,y0) to
// (x1,y1) (caller frees).
//
static void gilbert_ep(int w, int h, int x0, int y0, int x1, int y1, gep_result_t *res) {
  gbox_t      B;
  gpt_t       s = mkpt(x0, y0),
              t = mkpt(x1, y1);
  gctx_t      ctx;
  int         need_diag, ok;
  const char *bad;

  memset(res, 0, sizeof(*res));
  B.x0 = 0; B.y0 = 0; B.w = w; B.h = h;

  if ( (w < 1) || (h < 1) )                 { res->status = GEP_ERROR; res->reason = "empty rectangle"; return; }
  if ( (!in_box(B, s)) || (!in_box(B, t)) ) { res->status = GEP_ERROR; res->reason = "endpoint outside the rectangle"; return; }

  need_diag = !compatible(B, s, t);

  if ( same_pt(s, t) && (box_area(B) > 1) )     { res->status = GEP_INFEASIBLE; res->reason = "start and end are the same cell"; return; }
  if ( (!need_diag) && (!gep_ips_ok(B, s, t)) ) { res->status = GEP_INFEASIBLE; res->reason = "no orthogonal path (IPS)"; return; }
  if ( need_diag && ((w == 1) || (h == 1)) )    { res->status = GEP_INFEASIBLE; res->reason = "no path in a single row or column"; return; }
  if ( need_diag && (!diag_count_ok(B, s, t)) ) { res->status = GEP_INFEASIBLE; res->reason = "both endpoints off the corner color of an odd rectangle"; return; }

  memset(&ctx, 0, sizeof(ctx));
  ctx.call_limit   = GEP_CALL_BUDGET + (GEP_CALLS_PER_CELL * box_area(B));
  ctx.strict_limit = GEP_STRICT_BUDGET + (GEP_STRICT_PER_CELL * box_area(B));
  ctx.local_limit  = ctx.call_limit;
  ctx.fcap       = 1024;
  ctx.fkey = xmalloc(ctx.fcap * 9 * sizeof(int));
  memset(ctx.fkey, 0, ctx.fcap * 9 * sizeof(int));

  ok = gen(&ctx, B, s, t);

  free(ctx.fkey);
  memo_free(&ctx.zm);
  memo_free(&ctx.rm);

  res->calls      = ctx.calls;
  res->zzn_calls  = ctx.zzn_calls;
  res->plug_calls = ctx.plug_calls;

  if (!ok) {
    free(ctx.path);
    res->status = GEP_ERROR;
    res->reason = ( ctx.budget_hit ? "search budget exhausted" : "no path found" );
    return;
  }

  bad = gep_verify(w, h, s, t, ctx.path, ctx.n, need_diag);
  if (bad) { fprintf(stderr, "internal error, invalid path: %s\n", bad); exit(3); }

  res->status = GEP_OK;
  res->path   = ctx.path;
  res->n      = ctx.n;
}

//----------------------------------------------------------------------------
// Command line
//----------------------------------------------------------------------------

// One batch line: status, and for a path its length, diagonal count and an
// FNV-1a hash of the "x y" lines (for comparing implementations).
//
static void run_batch_one(int w, int h, int x0, int y0, int x1, int y1) {
  gep_result_t res;
  uint32_t     hsh = 2166136261u;
  char         buf[64];
  long         i;
  int          ndiag = 0, k, len;

  gilbert_ep(w, h, x0, y0, x1, y1, &res);
  if (res.status == GEP_INFEASIBLE) { printf("infeasible: %s\n", res.reason); return; }
  if (res.status == GEP_ERROR)      { printf("error: %s\n", res.reason); return; }

  for (i = 0; i < res.n; i++) {
    if ( (i > 0) && (iabs(res.path[i].x - res.path[i - 1].x) == 1) && (iabs(res.path[i].y - res.path[i - 1].y) == 1) ) { ndiag++; }
    len = snprintf(buf, sizeof(buf), "%d %d\n", res.path[i].x, res.path[i].y);
    for (k = 0; k < len; k++) { hsh = (hsh ^ (unsigned char)buf[k]) * 16777619u; }
  }
  printf("ok %ld %d %08x\n", res.n, ndiag, hsh);
  free(res.path);
}

int main(int argc, char **argv) {
  gep_result_t res;
  int          v[6], i;
  char         line[256];

  if (argc == 7) {
    for (i = 0; i < 6; i++) { v[i] = atoi(argv[i + 1]); }
    gilbert_ep(v[0], v[1], v[2], v[3], v[4], v[5], &res);
    if (res.status != GEP_OK) {
      fprintf(stderr, "%s: %s\n", ( (res.status == GEP_INFEASIBLE) ? "infeasible" : "error" ), res.reason);
      return 2;
    }
    for (i = 0; i < res.n; i++) { printf("%d %d\n", res.path[i].x, res.path[i].y); }
    free(res.path);
    return 0;
  }
  if (argc != 1) {
    fprintf(stderr, "usage: %s w h x0 y0 x1 y1\n", argv[0]);
    fprintf(stderr, "   or: %s < instances.txt\n", argv[0]);
    return 1;
  }

  while (fgets(line, sizeof(line), stdin)) {
    if (sscanf(line, "%d %d %d %d %d %d", &v[0], &v[1], &v[2], &v[3], &v[4], &v[5]) != 6) { continue; }
    run_batch_one(v[0], v[1], v[2], v[3], v[4], v[5]);
    fflush(stdout);
  }
  return 0;
}
