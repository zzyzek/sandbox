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
//   t fall in the same piece, the path leaves that piece, covers the others
//   and comes back, so that piece holds two segments (s to the exit, the
//   re-entry to t); it is solved with the k=2 Zig-Zag Numberlink solver
//   (zzn_solve.c). Counterclockwise loops are tried before clockwise ones. If
//   no loop works, the cut is moved (nearest the gilbert2d cut first) so that
//   s and t land in different pieces.
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

// GEP_CCW_SIGN        orientation convention for "counterclockwise" (see above)
// GEP_CALL_BUDGET     cap on recursive calls plus plans evaluated, plus ...
// GEP_CALLS_PER_CELL  ... this many per cell (the plain recursion alone makes
//                     on the order of one call per cell)
// GEP_ZZN_BUDGET      cap on k=2 Zig-Zag Numberlink solver calls
// GEP_PLUG_MAX_SIDE   largest short side for the exact fallbacks
// GEP_DIAG_MAX_AREA   largest area for the exact fallback with a diagonal step ...
// GEP_DIAG_NARROW     ... unless the short side is at most this
// GEP_MOVED_CUTS      how many moved cuts to try when s and t share a piece
//
#define GEP_CCW_SIGN       1
#define GEP_CALL_BUDGET    4000000L
#define GEP_CALLS_PER_CELL 4L
#define GEP_ZZN_BUDGET     1000
#define GEP_PLUG_MAX_SIDE  12
#define GEP_DIAG_MAX_AREA  144
#define GEP_DIAG_NARROW    8
#define GEP_MOVED_CUTS     8

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

// The frame whose canonical endpoints are nearest (Manhattan distance) to s
// and t. When s and t are the corners of one edge this is the gilbert2d frame
// running from s to t.
//
static gframe_t choose_frame(gbox_t B, gpt_t s, gpt_t t) {
  gframe_t fr[8];
  int      best = -1, bd = -1, i;

  box_frames(B, fr);
  for (i = 0; i < 8; i++) {
    gpt_t e = frame_pt(&fr[i], fr[i].w - 1, 0);
    int   d = iabs(s.x - fr[i].px) + iabs(s.y - fr[i].py) + iabs(t.x - e.x) + iabs(t.y - e.y);
    if ( (best < 0) || (d < bd) ) { best = i; bd = d; }
  }
  return fr[best];
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

typedef struct {
  int    kind, w2, h2, n;
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
  if ((2 * w) > (3 * h)) {
    if ( ((w2 % 2) == 1) && (w > 2) ) { w2++; }
    return template_at(F, 2, w2, 0);
  }

  // Standard case: lower first, upper, lower second.
  //
  if ( ((h2 % 2) == 1) && (h > 2) ) { h2++; }
  return template_at(F, 3, w2, h2);
}

typedef struct { int d, w2, h2; } gcut_t;

static int cut_cmp(const void *pa, const void *pb) {
  const gcut_t *a = pa, *b = pb;
  if (a->d  != b->d)  { return ( (a->d  < b->d)  ? -1 : 1 ); }
  if (a->h2 != b->h2) { return ( (a->h2 < b->h2) ? -1 : 1 ); }
  if (a->w2 != b->w2) { return ( (a->w2 < b->w2) ? -1 : 1 ); }
  return 0;
}

// Moved cuts for when the gilbert2d cut puts s and t in one piece and that
// fails: the same kind of template with its cut(s) shifted so that s and t
// land in different pieces, nearest the gilbert2d cut first (at most
// GEP_MOVED_CUTS of them). Returns the number written to out.
//
static int moved_templates(const gframe_t *F, const gtmpl_t *base, gpt_t s, gpt_t t, gtmpl_t *out) {
  gpt_t   ls   = frame_uv(F, s),
          lt   = frame_uv(F, t);
  gcut_t *cand = xmalloc((size_t)(F->w + 1) * (F->h + 1) * sizeof(gcut_t));
  int     n    = 0, w2, h2, i;

  if (base->kind == 2) {
    for (w2 = 1; w2 < F->w; w2++) {
      if ( (ls.x < w2) == (lt.x < w2) ) { continue; }
      cand[n].d = iabs(w2 - base->w2); cand[n].w2 = w2; cand[n].h2 = 0; n++;
    }
  }
  else {
    for (h2 = 1; h2 < F->h; h2++) {
      for (w2 = 1; w2 < F->w; w2++) {
        int ps = ( (ls.y >= h2) ? 1 : ( (ls.x < w2) ? 0 : 2 ) ),
            pt = ( (lt.y >= h2) ? 1 : ( (lt.x < w2) ? 0 : 2 ) );
        if (ps == pt) { continue; }
        cand[n].d = iabs(w2 - base->w2) + iabs(h2 - base->h2); cand[n].w2 = w2; cand[n].h2 = h2; n++;
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

typedef struct {
  int    key[12];
  int    ok;
  gpt_t *p0, *p1;
  int    n0, n1;
} gzmemo_t;

typedef struct {
  gpt_t    *path;
  long      n, cap;

  long      calls, call_limit;
  int       zzn_calls, plug_calls, budget_hit;

  // Failure cache: open addressing on (box, s, t).
  //
  int      *fkey;
  size_t    fcap, fcnt;

  gzmemo_t *zm;
  int       nzm, capzm;
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

// Fill in loop and pref; returns 0 if the plan is ruled out.
//
static int plan_shape(const gtmpl_t *T, gplan_t *P, gpt_t s, gpt_t t, int need_diag) {
  int ndiag = 0, j, i;

  P->loop = (P->sched[0] == P->sched[P->k]);
  P->pref = 0;

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
  }

  return (ndiag == ( need_diag ? 1 : 0 ));
}

static void shape_into(gplans_t *L, const gtmpl_t *T, const int *sched, int k, const gjunc_t *jn, gpt_t s, gpt_t t, int need_diag) {
  gplan_t P;
  int     j;

  memset(&P, 0, sizeof(P));
  P.k = k;
  for (j = 0; j <= k; j++) { P.sched[j] = sched[j]; }
  for (j = 0; j < k; j++)  { P.jn[j] = jn[j]; }
  if (!plan_shape(T, &P, s, t, need_diag)) { return; }

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
  int       key[12] = { B.x0, B.y0, B.w, B.h, s.x, s.y, xo.x, xo.y, xi.x, xi.y, t.x, t.y },
            pts[8], i, k;
  result_t  res;
  gzmemo_t *m;

  for (i = 0; i < ctx->nzm; i++) {
    if (memcmp(ctx->zm[i].key, key, sizeof(key)) == 0) { return ( ctx->zm[i].ok ? &ctx->zm[i] : NULL ); }
  }

  ctx->zzn_calls++;
  if (ctx->zzn_calls > GEP_ZZN_BUDGET) { ctx->budget_hit = 1; return NULL; }

  pts[0] = s.y - B.y0;  pts[1] = s.x - B.x0;
  pts[2] = xo.y - B.y0; pts[3] = xo.x - B.x0;
  pts[4] = xi.y - B.y0; pts[5] = xi.x - B.x0;
  pts[6] = t.y - B.y0;  pts[7] = t.x - B.x0;
  zzn_solve(B.h, B.w, pts, &res);

  if (ctx->nzm == ctx->capzm) {
    ctx->capzm = ( (ctx->capzm > 0) ? (2 * ctx->capzm) : 16 );
    ctx->zm    = xrealloc(ctx->zm, (size_t)ctx->capzm * sizeof(gzmemo_t));
  }
  m = &ctx->zm[ctx->nzm++];
  memcpy(m->key, key, sizeof(key));
  m->ok = (res.status == ZZN_SOLVED);
  m->p0 = m->p1 = NULL;
  m->n0 = m->n1 = 0;
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
    zm = solve_zzn_piece(ctx, B, a, b, a2, b2);
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
    if (plan_solve(ctx, T, &L->p[i], s, t)) { ok = 1; break; }
    if (ctx->budget_hit)                    { break; }
  }
  L->n = 0;
  return ok;
}

// Plans of a schedule that visits each piece once (one or two junctions), by
// lowest total junction rank (junctions nearest the outer edges first).
//
static int try_line(gctx_t *ctx, const gtmpl_t *T, const int *sc, int k, gjlist_t *J, gpt_t s, gpt_t t, int need_diag) {
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
          shape_into(&L, T, sc, 1, jn, s, t, need_diag);
        }
        continue;
      }

      if (r1 > m1) { continue; }
      for (i = J[0].start[r0]; i < J[0].start[r0 + 1]; i++) {
        for (j = J[1].start[r1]; j < J[1].start[r1 + 1]; j++) {
          jn[0] = J[0].c[i];
          jn[1] = J[1].c[j];
          shape_into(&L, T, sc, 2, jn, s, t, need_diag);
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
static int try_loop(gctx_t *ctx, const gtmpl_t *T, const int *sc, int k, gjlist_t *J, gpt_t s, gpt_t t, int need_diag, int want_ccw) {
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
              shape_into(&L, T, sc, 2, jn, s, t, need_diag);
            }
            else {
              for (q = JM->start[mr]; q < JM->start[mr + 1]; q++) {
                jn[0] = *c0;
                jn[1] = JM->c[q];
                jn[2] = *cL;
                shape_into(&L, T, sc, 3, jn, s, t, need_diag);
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

// Try every plan of template T. Loop schedules are tried counterclockwise
// first, then clockwise.
//
static int try_template(gctx_t *ctx, const gframe_t *F, const gtmpl_t *T, gpt_t s, gpt_t t, int need_diag) {
  int      sched[2][4], len[2], ns, is = -1, it = -1, i, j, pass, res = 0;
  gjlist_t J[2][3];

  for (i = 0; i < T->n; i++) {
    if (in_box(T->box[i], s)) { is = i; }
    if (in_box(T->box[i], t)) { it = i; }
  }

  ns = schedules(T, is, it, sched, len);
  for (i = 0; i < ns; i++) {
    for (j = 0; j < (len[i] - 1); j++) { junctions(F, T, sched[i][j], sched[i][j + 1], need_diag, &J[i][j]); }
  }

  for (pass = 0; (pass < 2) && (!res) && (!ctx->budget_hit); pass++) {
    for (i = 0; (i < ns) && (!res) && (!ctx->budget_hit); i++) {
      int k     = len[i] - 1,
          loop  = (sched[i][0] == sched[i][k]),
          empty = 0;

      for (j = 0; j < k; j++) {
        if (J[i][j].n == 0) { empty = 1; }
      }
      if (empty) { continue; }

      if (loop)            { res = try_loop(ctx, T, sched[i], k, J[i], s, t, need_diag, (pass == 0)); }
      else if (pass == 0)  { res = try_line(ctx, T, sched[i], k, J[i], s, t, need_diag); }
    }
  }

  for (i = 0; i < ns; i++) {
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

static int gen_uncached(gctx_t *ctx, gbox_t B, gpt_t s, gpt_t t) {
  int      need_diag = !compatible(B, s, t),
           shared    = 0,
           i;
  gframe_t F;
  gtmpl_t  base;

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

  F    = choose_frame(B, s, t);
  base = make_template(&F);

  if (try_template(ctx, &F, &base, s, t, need_diag)) { return 1; }
  if (ctx->budget_hit)                                { return 0; }

  // If s and t share a piece and the loop failed, move the cut.
  //
  for (i = 0; i < base.n; i++) {
    if ( in_box(base.box[i], s) && in_box(base.box[i], t) ) { shared = 1; }
  }
  if (shared) {
    gtmpl_t mv[GEP_MOVED_CUTS];
    int     nm = moved_templates(&F, &base, s, t, mv);
    for (i = 0; i < nm; i++) {
      if (try_template(ctx, &F, &mv[i], s, t, need_diag)) { return 1; }
      if (ctx->budget_hit)                                 { return 0; }
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
  int         need_diag, ok, i;
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
  ctx.call_limit = GEP_CALL_BUDGET + (GEP_CALLS_PER_CELL * box_area(B));
  ctx.fcap       = 1024;
  ctx.fkey = xmalloc(ctx.fcap * 9 * sizeof(int));
  memset(ctx.fkey, 0, ctx.fcap * 9 * sizeof(int));

  ok = gen(&ctx, B, s, t);

  free(ctx.fkey);
  for (i = 0; i < ctx.nzm; i++) {
    free(ctx.zm[i].p0);
    free(ctx.zm[i].p1);
  }
  free(ctx.zm);

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
