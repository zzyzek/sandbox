// zzn_solve.c
//
// Solver for two-color Zig-Zag Numberlink (k=2 ZZN) on an arbitrary R x C rectangle.
//
// Given endpoints s0,t0 (color 0) and s1,t1 (color 1), find two vertex-disjoint
// paths, s0-t0 and s1-t1, that together visit every cell.
//
// Method:
//
//   1. Reject the instance if it matches the forbidden-pattern catalogue.
//   2. Solve recursively:
//      - both sides <= 10: exact plug dynamic program (plugdp),
//      - otherwise cut the rectangle in two with a straight "cleave" cut and
//        solve the two halves, placing virtual endpoints on either side of the
//        cut where a path crosses it.
//   3. Single-path (k=1) pieces are checked with the Itai-Papadimitriou-
//      Szwarcfiter (IPS) acceptability test and solved by the same recursion.
//
// Build:  gcc -O2 -o zzn_solve zzn_solve.c
//
// Usage:  ./zzn_solve R C s0r s0c t0r t0c s1r s1c t1r t1c [--grid]
//         ./zzn_solve < instances.txt        (one instance per line)
//

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

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
#define BASE_MAX_SIDE   10
#define CLEAVE_REQUIRED 26
#define PLUG_MAX_WIDTH  12
#define EXACT_CHECK     8
#define TRIES_PER_CUT   4
#define CALL_BUDGET     200000

// Results of a recursive solve.
//
#define SOLVED      1
#define INFEASIBLE  0
#define FAILED     -1

typedef struct { int r, c, color; } end_t;
typedef struct { int r0, c0, h, w; } rect_t;
typedef struct { int r0, c0, r1, c1; } edge_t;

static int imin(int a, int b) { return ( (a < b) ? a : b ); }
static int imax(int a, int b) { return ( (a > b) ? a : b ); }

static void *xmalloc(size_t n) {
  void *p = malloc(n);
  if (!p) { fprintf(stderr, "out of memory\n"); exit(2); }
  return p;
}

static void *xrealloc(void *q, size_t n) {
  void *p = realloc(q, n);
  if (!p) { fprintf(stderr, "out of memory\n"); exit(2); }
  return p;
}

//----------------------------------------------------------------------------
// IPS acceptability (Itai, Papadimitriou, Szwarcfiter 1982)
//----------------------------------------------------------------------------

// Checkerboard color relative to the rectangle's own corner.
//
static int ips_color(int r, int c) { return ((r + c) & 1); }

// Width-3 exception (condition F3): an even-length 3-wide strip rejects some
// endpoint pairs of the right colors.
//
static int ips_f3_forbidden(int m, int n, int sr, int sc, int tr, int tc) {
  int vx, vy, wx, wy, L, k;

  if      (m == 3) { vx = sc; vy = sr; wx = tc; wy = tr; L = n; }
  else if (n == 3) { vx = sr; vy = sc; wx = tr; wy = tc; L = m; }
  else             { return 0; }

  if ((L % 2) != 0) { return 0; }

  for (k = 0; k < 2; k++) {
    int x1 = ( (k == 0) ? vx : wx ),
        y1 = ( (k == 0) ? vy : wy ),
        x2 = ( (k == 0) ? wx : vx ),
        y2 = ( (k == 0) ? wy : vy );
    if (ips_color(x2, y2) != 0) { continue; }
    if (ips_color(x1, y1) != 1) { continue; }
    if ( (x1 < (x2 - 1)) ||
         ((y1 == 1) && (x1 < x2)) ) {
      return 1;
    }
  }
  return 0;
}

// Does an m x n rectangle have a Hamiltonian path from (sr,sc) to (tr,tc)?
//
static int ips_ok(int m, int n, int sr, int sc, int tr, int tc) {
  int total, cs, ct;

  if ((sr == tr) && (sc == tc)) { return ((m * n) == 1); }

  total = m * n;
  cs    = ips_color(sr, sc);
  ct    = ips_color(tr, tc);

  // Color compatibility: an even rectangle needs one endpoint of each color,
  // an odd one needs both endpoints on the majority (corner) color.
  //
  if ((total % 2) == 0) {
    if (cs == ct) { return 0; }
  }
  else {
    if ( (cs != 0) || (ct != 0) ) { return 0; }
  }

  // F1: a single row or column can only be walked end to end.
  //
  if (m == 1) { return ( ((sc == 0) || (sc == (n - 1))) && ((tc == 0) || (tc == (n - 1))) ); }
  if (n == 1) { return ( ((sr == 0) || (sr == (m - 1))) && ((tr == 0) || (tr == (m - 1))) ); }

  // F2: in a 2-wide strip, the endpoints may not form an interior rung.
  //
  if ((m == 2) || (n == 2)) {
    int adj = ((abs(sr - tr) + abs(sc - tc)) == 1);
    if (adj) {
      if ( (m == 2) && (sr != tr) && (sc > 0) && (sc < (n - 1)) ) { return 0; }
      if ( (n == 2) && (sc != tc) && (sr > 0) && (sr < (m - 1)) ) { return 0; }
    }
    return 1;
  }

  if ((m == 3) || (n == 3)) { return !ips_f3_forbidden(m, n, sr, sc, tr, tc); }
  return 1;
}

//----------------------------------------------------------------------------
// plugdp: exact plug dynamic program with path reconstruction
//----------------------------------------------------------------------------
//
// The sweep processes cells column by column, top to bottom. The frontier
// holds R+1 plugs, 3 bits each, packed into a uint64_t:
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

#define PD_EM 0
#define PD_A0 1
#define PD_A1 2
#define PD_O0 3
#define PD_C0 4
#define PD_O1 5
#define PD_C1 6

#define PD_NONE (~(uint64_t)0)

static int      pd_get(uint64_t s, int i)        { return (int)((s >> (3 * i)) & 7); }
static uint64_t pd_set(uint64_t s, int i, int v) { return ((s & ~((uint64_t)7 << (3 * i))) | ((uint64_t)v << (3 * i))); }

static int pd_is_anchor(int v) { return ((v == PD_A0) || (v == PD_A1)); }
static int pd_is_open(int v)   { return ((v == PD_O0) || (v == PD_O1)); }
static int pd_is_close(int v)  { return ((v == PD_C0) || (v == PD_C1)); }
static int pd_color(int v)     { return ( pd_is_anchor(v) ? (v - 1) : ((v - 3) >> 1) ); }
static int pd_anchor(int c)    { return (1 + c); }
static int pd_open(int c)      { return (3 + (2 * c)); }
static int pd_close(int c)     { return (4 + (2 * c)); }
static int pd_sig(int v)       { return ( (v == PD_EM) ? 0 : (1 + pd_color(v)) ); }

// Frontier position of the bracket matching the one at slot i.
//
static int pd_partner(uint64_t s, int i, int n) {
  int v = pd_get(s, i), depth = 0, j, w;

  if (pd_is_open(v)) {
    for (j = i + 1; j < n; j++) {
      w = pd_get(s, j);
      if      (pd_is_open(w))  { depth++; }
      else if (pd_is_close(w)) {
        if (depth == 0) { return j; }
        depth--;
      }
    }
  }
  else {
    for (j = i - 1; j >= 0; j--) {
      w = pd_get(s, j);
      if      (pd_is_close(w)) { depth++; }
      else if (pd_is_open(w))  {
        if (depth == 0) { return j; }
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
static int pd_step(uint64_t s, int r, int n, int tc, int can_right, int can_down, const int *allow, uint64_t *out) {
  int nout   = 0,
      budget = ( (tc >= 0) ? 1 : 2 ),
      navail = ( can_right ? 1 : 0 ) + ( can_down ? 1 : 0 ),
      up     = pd_get(s, r),
      lf     = pd_get(s, r + 1),
      have   = ( (up != PD_EM) ? 1 : 0 ) + ( (lf != PD_EM) ? 1 : 0 ),
      need, col, cc;
  uint64_t base;

  if (have > budget) { return 0; }
  need = budget - have;
  if (need > navail) { return 0; }

  base = pd_set(pd_set(s, r, PD_EM), r + 1, PD_EM);

  // No plug enters the cell: start a fragment.
  //
  if (have == 0) {
    if (tc >= 0) {
      if (can_right) { out[nout++] = pd_set(base, r,     pd_anchor(tc)); }
      if (can_down)  { out[nout++] = pd_set(base, r + 1, pd_anchor(tc)); }
    }
    else {
      for (col = 0; col < 2; col++) {
        if (!allow[col]) { continue; }
        out[nout++] = pd_set(pd_set(base, r, pd_open(col)), r + 1, pd_close(col));
      }
    }
    return nout;
  }

  // One plug enters: end it at an endpoint, or pass it on.
  //
  if (have == 1) {
    int p   = ( (up != PD_EM) ? up : lf ),
        pos = ( (up != PD_EM) ? r : (r + 1) ),
        pc  = pd_color(p);
    if (need == 0) {
      if (pc != tc) { return 0; }
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
  cc = pd_color(up);
  if (cc != pd_color(lf)) { return 0; }

  if ( pd_is_anchor(up) && pd_is_anchor(lf) ) {
    out[nout++] = base;
  }
  else if ( pd_is_anchor(up) || pd_is_anchor(lf) ) {
    int bpos = ( pd_is_anchor(up) ? (r + 1) : r );
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

// Slots 0..upto of s agree with those of t in emptiness and color. Within a
// column these never change again after the cell that sets them, so any state
// that disagrees with the column's end state can be dropped.
//
static int pd_prefix_match(uint64_t s, uint64_t t, int upto) {
  int j;
  for (j = 0; j <= upto; j++) {
    if (pd_sig(pd_get(s, j)) != pd_sig(pd_get(t, j))) { return 0; }
  }
  return 1;
}

// A set of states with insertion order, optionally recording a predecessor
// index for each state.
//
typedef struct {
  uint64_t *tab;
  int32_t  *tix;
  size_t    cap;
  uint64_t *key;
  int32_t  *pred;
  size_t    n, dcap;
} layer_t;

static void layer_init(layer_t *L, int with_pred) {
  L->cap  = 1024;
  L->tab  = xmalloc(L->cap * sizeof(uint64_t));
  L->tix  = xmalloc(L->cap * sizeof(int32_t));
  memset(L->tab, 0xff, L->cap * sizeof(uint64_t));
  L->dcap = 512;
  L->n    = 0;
  L->key  = xmalloc(L->dcap * sizeof(uint64_t));
  L->pred = ( with_pred ? xmalloc(L->dcap * sizeof(int32_t)) : NULL );
}

static void layer_free(layer_t *L) {
  free(L->tab); free(L->tix); free(L->key); free(L->pred);
  memset(L, 0, sizeof(*L));
}

static void layer_clear(layer_t *L) {
  memset(L->tab, 0xff, L->cap * sizeof(uint64_t));
  L->n = 0;
}

static size_t layer_hash(uint64_t k, size_t cap) {
  k ^= (k >> 31);
  k *= 0x9E3779B97F4A7C15ULL;
  k ^= (k >> 29);
  return ((size_t)k & (cap - 1));
}

static int32_t layer_find(const layer_t *L, uint64_t k) {
  size_t i = layer_hash(k, L->cap);
  while (L->tab[i] != PD_NONE) {
    if (L->tab[i] == k) { return L->tix[i]; }
    i = (i + 1) & (L->cap - 1);
  }
  return -1;
}

static void layer_add(layer_t *L, uint64_t k, int32_t pred) {
  size_t i, j;

  // Grow the hash table at half load, and the dense arrays as needed.
  //
  if (((L->n + 1) * 2) > L->cap) {
    free(L->tab); free(L->tix);
    L->cap *= 2;
    L->tab  = xmalloc(L->cap * sizeof(uint64_t));
    L->tix  = xmalloc(L->cap * sizeof(int32_t));
    memset(L->tab, 0xff, L->cap * sizeof(uint64_t));
    for (j = 0; j < L->n; j++) {
      i = layer_hash(L->key[j], L->cap);
      while (L->tab[i] != PD_NONE) { i = (i + 1) & (L->cap - 1); }
      L->tab[i] = L->key[j];
      L->tix[i] = (int32_t)j;
    }
  }
  if (L->n == L->dcap) {
    L->dcap *= 2;
    L->key   = xrealloc(L->key, L->dcap * sizeof(uint64_t));
    if (L->pred) { L->pred = xrealloc(L->pred, L->dcap * sizeof(int32_t)); }
  }

  i = layer_hash(k, L->cap);
  while (L->tab[i] != PD_NONE) {
    if (L->tab[i] == k) { return; }
    i = (i + 1) & (L->cap - 1);
  }
  L->tab[i]    = k;
  L->tix[i]    = (int32_t)L->n;
  L->key[L->n] = k;
  if (L->pred) { L->pred[L->n] = pred; }
  L->n++;
}

// The sweep of one instance: rows R (the short side), columns C, endpoint
// colors per cell, and whether the grid was transposed.
//
typedef struct {
  int R, C, n, tr;
  int allow[2];
  signed char *term;
} sweep_t;

static void sweep_setup(sweep_t *S, int h, int w, const end_t *ends, int nends) {
  int i;
  S->tr = (h > w);
  S->R  = ( S->tr ? w : h );
  S->C  = ( S->tr ? h : w );
  S->n  = S->R + 1;
  S->allow[0] = S->allow[1] = 0;
  S->term = xmalloc((size_t)S->R * S->C);
  memset(S->term, -1, (size_t)S->R * S->C);
  for (i = 0; i < nends; i++) {
    int er = ( S->tr ? ends[i].c : ends[i].r ),
        ec = ( S->tr ? ends[i].r : ends[i].c );
    S->term[(er * S->C) + ec] = (signed char)ends[i].color;
    S->allow[ends[i].color] = 1;
  }
}

// Forward pass. If ckpt is given, stores the state set at the start of each
// column (ckpt[c], ckpt_n[c]). Returns whether the instance is feasible.
//
static int plugdp_forward(const sweep_t *S, uint64_t **ckpt, size_t *ckpt_n) {
  layer_t  cur, nxt, tmp;
  uint64_t out[4];
  int      r, c, feasible = 0;
  size_t   d;

  layer_init(&cur, 0);
  layer_init(&nxt, 0);
  layer_add(&cur, 0, -1);

  for (c = 0; c < S->C; c++) {
    if (c > 0) {
      layer_clear(&nxt);
      for (d = 0; d < cur.n; d++) { layer_add(&nxt, cur.key[d] << 3, -1); }
      tmp = cur; cur = nxt; nxt = tmp;
    }
    if (ckpt) {
      ckpt[c]   = xmalloc((cur.n + 1) * sizeof(uint64_t));
      ckpt_n[c] = cur.n;
      memcpy(ckpt[c], cur.key, cur.n * sizeof(uint64_t));
    }
    for (r = 0; r < S->R; r++) {
      int tc = S->term[(r * S->C) + c];
      layer_clear(&nxt);
      for (d = 0; d < cur.n; d++) {
        int m = pd_step(cur.key[d], r, S->n, tc, (c < (S->C - 1)), (r < (S->R - 1)), S->allow, out), k;
        for (k = 0; k < m; k++) { layer_add(&nxt, out[k], -1); }
      }
      tmp = cur; cur = nxt; nxt = tmp;
      if (cur.n == 0) { goto done; }
    }
  }
  feasible = (layer_find(&cur, 0) >= 0);

done:
  layer_free(&cur);
  layer_free(&nxt);
  return feasible;
}

// Exact feasibility only (no path reconstruction).
//
static int plugdp_feasible(int h, int w, const end_t *ends, int nends) {
  sweep_t S;
  int     ok;
  sweep_setup(&S, h, w, ends, nends);
  ok = plugdp_forward(&S, NULL, NULL);
  free(S.term);
  return ok;
}

// Solve an h x w instance exactly (local coordinates). Appends the solution's
// edges to *edges (growing it as needed) and returns 1, or returns 0 if the
// instance is infeasible.
//
static int plugdp_solve(int h, int w, const end_t *ends, int nends, edge_t **edges, int *ne, int *cap) {
  sweep_t   S;
  uint64_t **ckpt, out[4], target = 0;
  size_t    *ckpt_n, d;
  layer_t   *lay;
  int        c, r, k, ok;

  sweep_setup(&S, h, w, ends, nends);
  ckpt   = xmalloc(S.C * sizeof(uint64_t *));
  ckpt_n = xmalloc(S.C * sizeof(size_t));
  memset(ckpt, 0, S.C * sizeof(uint64_t *));

  ok = plugdp_forward(&S, ckpt, ckpt_n);
  if (!ok) {
    for (c = 0; c < S.C; c++) { free(ckpt[c]); }
    free(ckpt); free(ckpt_n); free(S.term);
    return 0;
  }

  // Backward pass: rerun each column from its checkpoint, keeping predecessor
  // links and dropping states that disagree with the known end-of-column state.
  //
  lay = xmalloc((S.R + 1) * sizeof(layer_t));
  for (c = S.C - 1; c >= 0; c--) {
    int32_t idx;

    layer_init(&lay[0], 1);
    for (d = 0; d < ckpt_n[c]; d++) { layer_add(&lay[0], ckpt[c][d], -1); }
    free(ckpt[c]);
    ckpt[c] = NULL;

    for (r = 0; r < S.R; r++) {
      int tc = S.term[(r * S.C) + c];
      layer_init(&lay[r + 1], 1);
      for (d = 0; d < lay[r].n; d++) {
        int m = pd_step(lay[r].key[d], r, S.n, tc, (c < (S.C - 1)), (r < (S.R - 1)), S.allow, out);
        for (k = 0; k < m; k++) {
          if (pd_prefix_match(out[k], target, r)) { layer_add(&lay[r + 1], out[k], (int32_t)d); }
        }
      }
    }

    idx = layer_find(&lay[S.R], target);
    if (idx < 0) { fprintf(stderr, "plugdp: reconstruction lost the target state\n"); exit(3); }

    for (r = S.R; r >= 1; r--) {
      uint64_t after = lay[r].key[idx];
      int      e[2][4], m = 0, j;

      if (pd_get(after, r - 1) != PD_EM) { e[m][0] = r - 1; e[m][1] = c; e[m][2] = r - 1; e[m][3] = c + 1; m++; }
      if (pd_get(after, r)     != PD_EM) { e[m][0] = r - 1; e[m][1] = c; e[m][2] = r;     e[m][3] = c;     m++; }

      for (j = 0; j < m; j++) {
        if (*ne == *cap) {
          *cap  = ( (*cap > 0) ? (2 * (*cap)) : 256 );
          *edges = xrealloc(*edges, (size_t)(*cap) * sizeof(edge_t));
        }
        (*edges)[*ne].r0 = ( S.tr ? e[j][1] : e[j][0] );
        (*edges)[*ne].c0 = ( S.tr ? e[j][0] : e[j][1] );
        (*edges)[*ne].r1 = ( S.tr ? e[j][3] : e[j][2] );
        (*edges)[*ne].c1 = ( S.tr ? e[j][2] : e[j][3] );
        (*ne)++;
      }
      idx = lay[r].pred[idx];
    }
    target = lay[0].key[idx] >> 3;
    for (r = 0; r <= S.R; r++) { layer_free(&lay[r]); }
  }

  free(lay); free(ckpt); free(ckpt_n); free(S.term);
  return 1;
}

//----------------------------------------------------------------------------
// Hamiltonian cycle of an endpoint-free rectangle
//----------------------------------------------------------------------------

#define SIDE_TOP    0
#define SIDE_BOTTOM 1
#define SIDE_LEFT   2
#define SIDE_RIGHT  3

// A Hamiltonian cycle of an h x w rectangle (even area, both sides >= 2) that
// uses every edge along one side. Writes the cells in cycle order to cyc
// (2 ints per cell, local coordinates).
//
// Built in a frame where the chosen side is the top row. With an even frame
// width: walk the top row, then snake back through the columns below it. With
// an odd width (so an even height): walk down the left column, then snake back
// up through the rows to its right, ending along the top row.
//
static void ham_cycle(int h, int w, int side, int *cyc) {
  int sideways = ((side == SIDE_LEFT) || (side == SIDE_RIGHT)),
      fh       = ( sideways ? w : h ),
      fw       = ( sideways ? h : w ),
      n = 0, r, c, i;

  if ((fw % 2) == 0) {
    for (c = 0; c < fw; c++) { cyc[2 * n] = 0; cyc[(2 * n) + 1] = c; n++; }
    for (c = fw - 1; c >= 0; c--) {
      if (((fw - 1 - c) % 2) == 0) {
        for (r = 1; r < fh; r++) { cyc[2 * n] = r; cyc[(2 * n) + 1] = c; n++; }
      }
      else {
        for (r = fh - 1; r >= 1; r--) { cyc[2 * n] = r; cyc[(2 * n) + 1] = c; n++; }
      }
    }
  }
  else {
    for (r = 0; r < fh; r++) { cyc[2 * n] = r; cyc[(2 * n) + 1] = 0; n++; }
    for (r = fh - 1; r >= 0; r--) {
      if (((fh - 1 - r) % 2) == 0) {
        for (c = 1; c < fw; c++) { cyc[2 * n] = r; cyc[(2 * n) + 1] = c; n++; }
      }
      else {
        for (c = fw - 1; c >= 1; c--) { cyc[2 * n] = r; cyc[(2 * n) + 1] = c; n++; }
      }
    }
  }

  for (i = 0; i < n; i++) {
    int fr = cyc[2 * i], fc = cyc[(2 * i) + 1];
    if      (side == SIDE_TOP)    { cyc[2 * i] = fr;         cyc[(2 * i) + 1] = fc; }
    else if (side == SIDE_BOTTOM) { cyc[2 * i] = h - 1 - fr; cyc[(2 * i) + 1] = fc; }
    else if (side == SIDE_LEFT)   { cyc[2 * i] = fc;         cyc[(2 * i) + 1] = fr; }
    else                          { cyc[2 * i] = fc;         cyc[(2 * i) + 1] = w - 1 - fr; }
  }
}

//----------------------------------------------------------------------------
// Forbidden-pattern catalogue (see zzn_pattern_catalogue.md)
//----------------------------------------------------------------------------
//
// Corner patterns are written for the top-left corner. They are tested in all
// eight "frames": each of the four corners, with and without transposition,
// mapped to the top-left. Colors may be either way round.
//

// Catalogue data, generated from zzn_patterns.js.
//
static const int BOUNDARY3_EVEN[][6] = {
  { 0, 0,  1, 1,  1, 2 },
  { 0, 1,  0, 2,  1, 1 },
  { 0, 1,  0, 2,  1, 2 },
  { 0, 1,  0, 3,  1, 1 },
  { 0, 1,  0, 4,  1, 1 },
  { 0, 1,  0, 4,  1, 2 },
  { 0, 1,  0, 5,  1, 1 },
  { 0, 1,  1, 2,  1, 1 },
  { 0, 1,  1, 2,  1, 3 },
  { 0, 1,  1, 2,  2, 2 },
  { 0, 1,  1, 2,  3, 1 },
  { 0, 1,  1, 3,  0, 3 },
  { 0, 1,  2, 1,  1, 3 },
  { 0, 1,  2, 1,  2, 2 },
  { 0, 1,  2, 1,  3, 1 },
  { 0, 2,  2, 1,  1, 0 },
  { 0, 3,  1, 1,  1, 0 },
  { 0, 4,  1, 1,  1, 0 },
  { 0, 4,  2, 1,  1, 0 },
  { 0, 4,  2, 1,  1, 2 },
  { 0, 5,  1, 1,  1, 0 },
};
#define N_BOUNDARY3_EVEN ((int)(sizeof(BOUNDARY3_EVEN) / sizeof(BOUNDARY3_EVEN[0])))

static const int BOUNDARY3_ODD[][6] = {
  { 0, 0,  1, 1,  1, 2 },
  { 0, 0,  1, 1,  2, 2 },
  { 0, 1,  0, 2,  1, 1 },
  { 0, 1,  0, 4,  1, 1 },
  { 0, 4,  1, 1,  1, 0 },
};
#define N_BOUNDARY3_ODD ((int)(sizeof(BOUNDARY3_ODD) / sizeof(BOUNDARY3_ODD[0])))

static const int CORNER4_EVEN[][8] = {
  { 0, 1,  0, 3,    1, 1,  1, 3 },
  { 0, 1,  0, 6,    0, 7,  1, 1 },
  { 0, 1,  0, 6,    1, 1,  7, 0 },
  { 0, 1,  0, 6,    1, 2,  6, 0 },
  { 0, 1,  0, 7,    1, 1,  6, 0 },
  { 0, 1,  1, 3,    1, 1,  1, 2 },
  { 0, 1,  1, 3,    1, 2,  2, 2 },
  { 0, 1,  1, 3,    1, 2,  3, 1 },
  { 0, 1,  2, 2,    1, 1,  1, 2 },
  { 0, 1,  2, 2,    1, 2,  3, 1 },
  { 0, 1,  2, 2,    1, 3,  3, 0 },
  { 0, 1,  7, 0,    1, 1,  6, 0 },
  { 0, 2,  1, 1,    2, 1,  3, 0 },
  { 0, 2,  2, 0,    1, 2,  2, 1 },
  { 0, 3,  2, 1,    3, 1,  4, 0 },
  { 0, 6,  2, 1,    1, 2,  6, 0 },
  { 1, 2,  2, 2,    1, 3,  2, 1 },
  { 1, 2,  3, 1,    1, 3,  2, 1 },
  { 0, 1,  1, 2,    0, 4,  2, 2 },
  { 0, 1,  1, 2,    0, 4,  3, 1 },
  { 0, 1,  1, 2,    1, 3,  2, 0 },
  { 0, 1,  1, 2,    1, 3,  4, 0 },
  { 0, 1,  1, 2,    2, 0,  2, 2 },
  { 0, 1,  1, 2,    2, 2,  4, 0 },
  { 0, 1,  1, 2,    3, 1,  4, 0 },
  { 0, 1,  1, 3,    0, 3,  0, 4 },
  { 0, 1,  1, 3,    0, 3,  2, 0 },
  { 0, 1,  1, 3,    0, 3,  4, 0 },
  { 0, 1,  2, 1,    0, 2,  2, 2 },
  { 0, 1,  2, 1,    0, 2,  3, 1 },
  { 0, 1,  2, 1,    0, 4,  1, 3 },
  { 0, 1,  2, 1,    0, 4,  2, 2 },
  { 0, 1,  2, 1,    0, 4,  3, 1 },
  { 0, 1,  2, 1,    1, 3,  4, 0 },
  { 0, 1,  2, 1,    2, 2,  4, 0 },
  { 0, 1,  2, 1,    3, 1,  4, 0 },
};
#define N_CORNER4_EVEN ((int)(sizeof(CORNER4_EVEN) / sizeof(CORNER4_EVEN[0])))

static const int CORNER4_ODD[][8] = {
  { 0, 0,  0, 1,    1, 1,  2, 0 },
  { 0, 0,  1, 4,    0, 2,  1, 3 },
  { 0, 0,  2, 3,    0, 2,  1, 3 },
};
#define N_CORNER4_ODD ((int)(sizeof(CORNER4_ODD) / sizeof(CORNER4_ODD[0])))

typedef struct { int r, c, col; } pt_t;

typedef struct {
  int R, C, fr, fc, tr;
  int H, W;
} frame_t;

static frame_t frame_make(int R, int C, int k) {
  frame_t f;
  f.R  = R; f.C = C;
  f.fr = ((k >> 2) & 1);
  f.fc = ((k >> 1) & 1);
  f.tr = (k & 1);
  f.H  = ( f.tr ? C : R );
  f.W  = ( f.tr ? R : C );
  return f;
}

// Grid coordinates to frame coordinates, and back.
//
static void frame_to(const frame_t *f, int r, int c, int *a, int *b) {
  int x = ( f->fr ? (f->R - 1 - r) : r ),
      y = ( f->fc ? (f->C - 1 - c) : c );
  *a = ( f->tr ? y : x );
  *b = ( f->tr ? x : y );
}

static void frame_back(const frame_t *f, int a, int b, int *r, int *c) {
  int x = ( f->tr ? b : a ),
      y = ( f->tr ? a : b );
  *r = ( f->fr ? (f->R - 1 - x) : x );
  *c = ( f->fc ? (f->C - 1 - y) : y );
}

// Color of the endpoint at frame cell (a, b), or -1.
//
static int view_at(const pt_t *fp, int a, int b) {
  int i;
  for (i = 0; i < 4; i++) {
    if ( (fp[i].r == a) && (fp[i].c == b) ) { return fp[i].col; }
  }
  return -1;
}

static int view_empty(const pt_t *fp, const int *cells, int ncells) {
  int i;
  for (i = 0; i < ncells; i++) {
    if (view_at(fp, cells[2 * i], cells[(2 * i) + 1]) >= 0) { return 0; }
  }
  return 1;
}

static int perim_index(int R, int C, int r, int c) {
  if (r == 0)       { return c; }
  if (c == (C - 1)) { return ((C - 1) + r); }
  if (r == (R - 1)) { return ((C - 1) + (R - 1) + (C - 1 - c)); }
  if (c == 0)       { return ((2 * (C - 1)) + (R - 1) + (R - 1 - r)); }
  return -1;
}

static int alternating(const int *cols) {
  return ( (cols[0] != cols[1]) && (cols[1] != cols[2]) && (cols[2] != cols[3]) );
}

// Local strongly forbidden corner patterns L2..L5 (frame coordinates).
//
static int local_patterns(const pt_t *fp, int H, int W, const char **id) {
  int a, b;

  // L2 corner block: different colors at (0,1) and (1,0), corner cell empty.
  //
  a = view_at(fp, 0, 1); b = view_at(fp, 1, 0);
  if ( (a >= 0) && (b >= 0) && (a != b) && (view_at(fp, 0, 0) < 0) ) { *id = "L2 corner block"; return 1; }

  // L3 corner wedge: A at (0,2) and (1,1), B at (1,0); (0,0), (0,1) empty.
  //
  a = view_at(fp, 0, 2);
  if ( (a >= 0) && (view_at(fp, 1, 1) == a) && (view_at(fp, 1, 0) == (1 - a)) &&
       (view_at(fp, 0, 0) < 0) && (view_at(fp, 0, 1) < 0) ) {
    *id = "L3 corner wedge";
    return 1;
  }

  // L4 corner fork: A at (0,0) and (1,1), B at (0,2); (0,1), (1,0) empty.
  //
  a = view_at(fp, 0, 0);
  if ( (a >= 0) && (view_at(fp, 1, 1) == a) && (view_at(fp, 0, 2) == (1 - a)) && (H >= 3) &&
       (view_at(fp, 0, 1) < 0) && (view_at(fp, 1, 0) < 0) ) {
    *id = "L4 corner fork";
    return 1;
  }

  // L5 corner trap: B at (0,0), A at (0,2) and (2,0); (0,1), (1,0), (1,1) empty.
  //
  b = view_at(fp, 0, 0);
  if ( (b >= 0) && (view_at(fp, 0, 2) == (1 - b)) && (view_at(fp, 2, 0) == (1 - b)) &&
       (view_at(fp, 0, 1) < 0) && (view_at(fp, 1, 0) < 0) && (view_at(fp, 1, 1) < 0) ) {
    *id = "L5 corner trap";
    return 1;
  }

  (void)W;
  return 0;
}

// E1 edge closure on the top edge: A at (0,k),(1,k+1), B at (0,k+3),(1,k+2).
//
static int edge_closure(const pt_t *fp, int W) {
  int k, a;
  for (k = 0; (k + 3) < W; k++) {
    a = view_at(fp, 0, k);
    if ( (a >= 0) && (view_at(fp, 1, k + 1) == a) &&
         (view_at(fp, 0, k + 3) == (1 - a)) && (view_at(fp, 1, k + 2) == (1 - a)) ) {
      return 1;
    }
  }
  return 0;
}

// B: boundary-only corner patterns. Infeasible when the fourth endpoint (the
// partner of the lone B) is on the perimeter outside the 6 x 6 corner window.
//
static int boundary_only(const pt_t *fp, int H, int W, int odd) {
  const int (*list)[6] = ( odd ? BOUNDARY3_ODD : BOUNDARY3_EVEN );
  int       n          = ( odd ? N_BOUNDARY3_ODD : N_BOUNDARY3_EVEN ),
            i, A, j;

  for (i = 0; i < n; i++) {
    for (A = 0; A < 2; A++) {
      int bi = -1, fi = -1;
      if (view_at(fp, list[i][0], list[i][1]) != A) { continue; }
      if (view_at(fp, list[i][2], list[i][3]) != A) { continue; }
      if (view_at(fp, list[i][4], list[i][5]) != (1 - A)) { continue; }
      for (j = 0; j < 4; j++) {
        if (fp[j].col != (1 - A)) { continue; }
        if ( (fp[j].r == list[i][4]) && (fp[j].c == list[i][5]) ) { bi = j; }
        else                                                      { fi = j; }
      }
      if ( (bi < 0) || (fi < 0) ) { continue; }
      if ( ( (fp[fi].r == 0) || (fp[fi].c == 0) || (fp[fi].r == (H - 1)) || (fp[fi].c == (W - 1)) ) &&
           (!( (fp[fi].r < 6) && (fp[fi].c < 6) )) ) {
        return 1;
      }
    }
  }
  return 0;
}

// C/D: whole-configuration corner patterns (grids with both sides >= 10).
//
static int corner_config(const pt_t *fp, int odd) {
  const int (*list)[8] = ( odd ? CORNER4_ODD : CORNER4_EVEN );
  int       n          = ( odd ? N_CORNER4_ODD : N_CORNER4_EVEN ),
            i, A;

  for (i = 0; i < n; i++) {
    for (A = 0; A < 2; A++) {
      if ( (view_at(fp, list[i][0], list[i][1]) == A) &&
           (view_at(fp, list[i][2], list[i][3]) == A) &&
           (view_at(fp, list[i][4], list[i][5]) == (1 - A)) &&
           (view_at(fp, list[i][6], list[i][7]) == (1 - A)) ) {
        return 1;
      }
    }
  }
  return 0;
}

// Forced rewrites at a corner (frame coordinates): R3 widget, R2 diagonal
// pair, R1 corner hop. Fills the settled cells and the endpoint moves; returns
// the number of settled cells (0 if no rewrite applies).
//
static int rewrite_at(const pt_t *fp, int H, int W, int *removed, int *moves, int *nmoves) {
  static const int widget_empty[] = { 0,0, 0,1, 0,2, 0,3, 1,0, 1,1, 2,0, 3,0 },
                   widget_rm[]    = { 0,0, 0,1, 0,2, 1,0, 1,1, 2,0, 1,2, 2,1 },
                   diag_empty[]   = { 0,1, 1,0, 0,2, 2,0 },
                   diag_rm[]      = { 0,0, 0,1, 1,0, 1,1 },
                   hop_empty[]    = { 0,0, 1,0 },
                   hop_rm[]       = { 0,0, 0,1 };
  int x, y;

  x = view_at(fp, 1, 2); y = view_at(fp, 2, 1);
  if ( (x >= 0) && (y >= 0) && (x != y) && (H >= 4) && (W >= 4) && view_empty(fp, widget_empty, 8) ) {
    memcpy(removed, widget_rm, sizeof(widget_rm));
    moves[0] = 1; moves[1] = 2; moves[2] = 0; moves[3] = 3;
    moves[4] = 2; moves[5] = 1; moves[6] = 3; moves[7] = 0;
    *nmoves = 2;
    return 8;
  }

  x = view_at(fp, 0, 0);
  if ( (x >= 0) && (view_at(fp, 1, 1) == x) && (H >= 3) && (W >= 3) && view_empty(fp, diag_empty, 4) ) {
    memcpy(removed, diag_rm, sizeof(diag_rm));
    moves[0] = 0; moves[1] = 0; moves[2] = 0; moves[3] = 2;
    moves[4] = 1; moves[5] = 1; moves[6] = 2; moves[7] = 0;
    *nmoves = 2;
    return 4;
  }

  if ( (view_at(fp, 0, 1) >= 0) && (H >= 2) && view_empty(fp, hop_empty, 2) ) {
    memcpy(removed, hop_rm, sizeof(hop_rm));
    moves[0] = 0; moves[1] = 1; moves[2] = 1; moves[3] = 0;
    *nmoves = 1;
    return 2;
  }
  return 0;
}

// Face walks of the grid graph on cells not removed. After corner rewrites the
// region has no holes, so the outer face is the longest walk. pos[cell] gets
// the position of the cell along the outer face, -2 if it occurs more than
// once, -1 if not at all.
//
static void outer_face(int R, int C, const unsigned char *rem, int *pos) {
  static const int dr[4] = { -1, 0, 1, 0 }, dc[4] = { 0, 1, 0, -1 };
  int            N = R * C, a0, d0, best_len = 0, *best, *walk, i;
  unsigned char *used;

#define OK_CELL(r, c) ( ((r) >= 0) && ((r) < R) && ((c) >= 0) && ((c) < C) && (!rem[((r) * C) + (c)]) )

  used = xmalloc((size_t)4 * N);
  best = xmalloc((size_t)8 * N * sizeof(int));
  walk = xmalloc((size_t)8 * N * sizeof(int));
  memset(used, 0, (size_t)4 * N);

  for (a0 = 0; a0 < N; a0++) {
    for (d0 = 0; d0 < 4; d0++) {
      int r0 = a0 / C, c0 = a0 % C, r = r0, c = c0, d = d0, len = 0;
      if (rem[a0] || used[(a0 * 4) + d0] || (!OK_CELL(r0 + dr[d0], c0 + dc[d0]))) { continue; }
      do {
        int vr, vc, rev, nd = -1, k;
        used[(((r * C) + c) * 4) + d] = 1;
        walk[len++] = (r * C) + c;
        vr  = r + dr[d];
        vc  = c + dc[d];
        rev = (d + 2) % 4;
        for (k = 1; k <= 4; k++) {
          int dd = (rev + k) % 4;
          if (OK_CELL(vr + dr[dd], vc + dc[dd])) { nd = dd; break; }
        }
        r = vr; c = vc; d = nd;
      } while ( (!( (r == r0) && (c == c0) && (d == d0) )) && (len < (8 * N)) );
      if (len > best_len) {
        best_len = len;
        memcpy(best, walk, (size_t)len * sizeof(int));
      }
    }
  }
#undef OK_CELL

  for (i = 0; i < N; i++) { pos[i] = -1; }
  for (i = 0; i < best_len; i++) { pos[best[i]] = ( (pos[best[i]] == -1) ? i : -2 ); }
  free(used); free(best); free(walk);
}

// R: apply every applicable rewrite (at most one per corner, disjoint cells),
// then test whether the effective endpoints alternate around the outer face.
//
static int effective_alternation(int R, int C, const pt_t *pts) {
  pt_t           eff[4];
  unsigned char *rem;
  int           *pos, k, i, j, any = 0, res = 0, order[4], cols[4];

  memcpy(eff, pts, sizeof(eff));
  rem = xmalloc((size_t)R * C);
  pos = xmalloc((size_t)R * C * sizeof(int));
  memset(rem, 0, (size_t)R * C);

  for (k = 0; k < 8; k++) {
    frame_t f = frame_make(R, C, k);
    pt_t    fp[4];
    int     removed[16], moves[8], nmoves = 0, nrm, clash = 0, cell[16];

    for (i = 0; i < 4; i++) {
      frame_to(&f, eff[i].r, eff[i].c, &fp[i].r, &fp[i].c);
      fp[i].col = eff[i].col;
    }
    nrm = rewrite_at(fp, f.H, f.W, removed, moves, &nmoves);
    if (nrm == 0) { continue; }

    for (i = 0; i < nrm; i++) {
      int r, c;
      frame_back(&f, removed[2 * i], removed[(2 * i) + 1], &r, &c);
      cell[i] = (r * C) + c;
      if (rem[cell[i]]) { clash = 1; }
    }
    for (i = 0; i < nmoves; i++) {
      int r, c;
      frame_back(&f, moves[(4 * i) + 2], moves[(4 * i) + 3], &r, &c);
      if (rem[(r * C) + c]) { clash = 1; }
    }
    if (clash) { continue; }

    for (i = 0; i < nrm; i++) { rem[cell[i]] = 1; }
    for (i = 0; i < nmoves; i++) {
      int fr, fcc, tr, tc;
      frame_back(&f, moves[4 * i],       moves[(4 * i) + 1], &fr, &fcc);
      frame_back(&f, moves[(4 * i) + 2], moves[(4 * i) + 3], &tr, &tc);
      for (j = 0; j < 4; j++) {
        if ( (eff[j].r == fr) && (eff[j].c == fcc) ) { eff[j].r = tr; eff[j].c = tc; break; }
      }
    }
    any = 1;
  }

  if (!any) { goto done; }
  for (i = 0; i < 4; i++) {
    if (rem[(eff[i].r * C) + eff[i].c]) { goto done; }
    for (j = 0; j < i; j++) {
      if ( (eff[i].r == eff[j].r) && (eff[i].c == eff[j].c) ) { goto done; }
    }
  }

  outer_face(R, C, rem, pos);
  for (i = 0; i < 4; i++) {
    order[i] = pos[(eff[i].r * C) + eff[i].c];
    if (order[i] < 0) { goto done; }
  }
  for (i = 0; i < 4; i++) {
    int rank = 0;
    for (j = 0; j < 4; j++) {
      if (order[j] < order[i]) { rank++; }
    }
    cols[rank] = eff[i].col;
  }
  res = alternating(cols);

done:
  free(rem);
  free(pos);
  return res;
}

// Returns the id of the first catalogue entry that matches, or NULL. Every
// match proves the instance infeasible (see the catalogue for conditions).
//
static const char *find_forbidden_pattern(int R, int C, const int *s0, const int *t0, const int *s1, const int *t1) {
  pt_t pts[4];
  int  i, j, k, s = 0, idx[4], all_perim = 1, cols[4], odd = ((R * C) % 2);

  pts[0].r = s0[0]; pts[0].c = s0[1]; pts[0].col = 0;
  pts[1].r = t0[0]; pts[1].c = t0[1]; pts[1].col = 0;
  pts[2].r = s1[0]; pts[2].c = s1[1]; pts[2].col = 1;
  pts[3].r = t1[0]; pts[3].c = t1[1]; pts[3].col = 1;

  // P parity: two paths cover the grid, so the checkerboard imbalance of the
  // grid equals half the signed sum of the endpoint colors.
  //
  for (i = 0; i < 4; i++) { s += ( (((pts[i].r + pts[i].c) % 2) == 0) ? 1 : -1 ); }
  if ((2 * odd) != s) { return "P parity"; }

  // T1 perimeter alternation.
  //
  for (i = 0; i < 4; i++) {
    idx[i] = perim_index(R, C, pts[i].r, pts[i].c);
    if (idx[i] < 0) { all_perim = 0; }
  }
  if (all_perim) {
    for (i = 0; i < 4; i++) {
      int rank = 0;
      for (j = 0; j < 4; j++) {
        if (idx[j] < idx[i]) { rank++; }
      }
      cols[rank] = pts[i].col;
    }
    if (alternating(cols)) { return "T1 perimeter alternation"; }
  }

  // T2 unit-square alternation.
  //
  {
    int rmin = pts[0].r, rmax = pts[0].r, cmin = pts[0].c, cmax = pts[0].c;
    for (i = 1; i < 4; i++) {
      rmin = imin(rmin, pts[i].r); rmax = imax(rmax, pts[i].r);
      cmin = imin(cmin, pts[i].c); cmax = imax(cmax, pts[i].c);
    }
    if ( ((rmax - rmin) == 1) && ((cmax - cmin) == 1) &&
         (pts[0].r != pts[1].r) && (pts[0].c != pts[1].c) ) {
      return "T2 unit-square alternation";
    }
  }

  // L1 isolated endpoint: every neighbour is an endpoint of the other color.
  //
  for (i = 0; i < 4; i++) {
    static const int dr[4] = { -1, 1, 0, 0 }, dc[4] = { 0, 0, -1, 1 };
    int blocked = 1;
    for (k = 0; k < 4; k++) {
      int nr = pts[i].r + dr[k], nc = pts[i].c + dc[k], hit = 0;
      if ( (nr < 0) || (nr >= R) || (nc < 0) || (nc >= C) ) { continue; }
      for (j = 0; j < 4; j++) {
        if ( (pts[j].r == nr) && (pts[j].c == nc) && (pts[j].col != pts[i].col) ) { hit = 1; }
      }
      if (!hit) { blocked = 0; }
    }
    if (blocked) { return "L1 isolated endpoint"; }
  }

  // L6 double corner closure: each color has both endpoints on the two
  // neighbours of an empty corner cell, at different corners.
  //
  {
    static const int cr[4] = { 0, 0, 1, 1 }, cc[4] = { 0, 1, 0, 1 };
    int closed[2] = { 0, 0 };
    for (k = 0; k < 4; k++) {
      int r0 = ( cr[k] ? (R - 1) : 0 ), c0 = ( cc[k] ? (C - 1) : 0 ),
          dr = ( cr[k] ? -1 : 1 ),      dc = ( cc[k] ? -1 : 1 ),
          e1 = -1, e2 = -1, corner_empty = 1;
      for (j = 0; j < 4; j++) {
        if ( (pts[j].r == r0) && (pts[j].c == (c0 + dc)) ) { e1 = pts[j].col; }
        if ( (pts[j].r == (r0 + dr)) && (pts[j].c == c0) ) { e2 = pts[j].col; }
        if ( (pts[j].r == r0) && (pts[j].c == c0) )        { corner_empty = 0; }
      }
      if ( (e1 >= 0) && (e1 == e2) && corner_empty ) { closed[e1] = 1; }
    }
    if ( closed[0] && closed[1] && ((R * C) > 6) ) { return "L6 double corner closure"; }
  }

  // Corner and edge patterns, in every frame.
  //
  for (k = 0; k < 8; k++) {
    frame_t     f = frame_make(R, C, k);
    pt_t        fp[4];
    const char *id = NULL;

    for (i = 0; i < 4; i++) {
      frame_to(&f, pts[i].r, pts[i].c, &fp[i].r, &fp[i].c);
      fp[i].col = pts[i].col;
    }
    if (local_patterns(fp, f.H, f.W, &id))     { return id; }
    if (edge_closure(fp, f.W))                 { return "E1 edge closure"; }
    if (boundary_only(fp, f.H, f.W, ( ((R % 2) == 1) && ((C % 2) == 1) ))) { return "B boundary-only corner pattern"; }
    if ( (R >= 10) && (C >= 10) && corner_config(fp, odd) ) { return "C4 corner configuration"; }
  }

  if (effective_alternation(R, C, pts)) { return "R effective alternation"; }
  return NULL;
}

//----------------------------------------------------------------------------
// Recursive solver
//----------------------------------------------------------------------------
//
// Endpoints of a (sub)instance are end_t in global coordinates, two per color
// in order: ends[2*col], ends[2*col+1]. Solutions are appended to ctx->edges in
// global coordinates; a failed attempt truncates what it added. A spliced-out
// edge is marked by r0 = -1.
//

#define CACHE_KEY_LEN 16

typedef struct {
  edge_t  *edges;
  int      ne, cap;
  long     calls;
  int      budget_hit;

  // Failure cache: open addressing on the (rect, endpoints) key.
  //
  int     *fkey;
  int     *fval;
  size_t   fcap, fcnt;
} ctx_t;

static int solve_rect(ctx_t *ctx, rect_t rect, const end_t *ends, int nends);

static void push_edge(ctx_t *ctx, int r0, int c0, int r1, int c1) {
  if (ctx->ne == ctx->cap) {
    ctx->cap   = ( (ctx->cap > 0) ? (2 * ctx->cap) : 1024 );
    ctx->edges = xrealloc(ctx->edges, (size_t)ctx->cap * sizeof(edge_t));
  }
  ctx->edges[ctx->ne].r0 = r0;
  ctx->edges[ctx->ne].c0 = c0;
  ctx->edges[ctx->ne].r1 = r1;
  ctx->edges[ctx->ne].c1 = c1;
  ctx->ne++;
}

static void make_key(rect_t rect, const end_t *ends, int nends, int *key) {
  int i;
  key[0] = rect.r0; key[1] = rect.c0; key[2] = rect.h; key[3] = rect.w;
  for (i = 0; i < 4; i++) {
    key[4 + (3 * i)]     = ( (i < nends) ? ends[i].r : -1 );
    key[4 + (3 * i) + 1] = ( (i < nends) ? ends[i].c : -1 );
    key[4 + (3 * i) + 2] = ( (i < nends) ? ends[i].color : -1 );
  }
}

static size_t key_hash(const int *key, size_t cap) {
  uint64_t h = 1469598103934665603ULL;
  int      i;
  for (i = 0; i < CACHE_KEY_LEN; i++) { h = (h ^ (uint64_t)(uint32_t)key[i]) * 1099511628211ULL; }
  return ((size_t)h & (cap - 1));
}

static int cache_get(ctx_t *ctx, const int *key, int *val) {
  size_t i = key_hash(key, ctx->fcap);
  while (ctx->fval[i] != 99) {
    if (memcmp(&ctx->fkey[i * CACHE_KEY_LEN], key, CACHE_KEY_LEN * sizeof(int)) == 0) { *val = ctx->fval[i]; return 1; }
    i = (i + 1) & (ctx->fcap - 1);
  }
  return 0;
}

static void cache_put(ctx_t *ctx, const int *key, int val) {
  size_t i, j;

  if (((ctx->fcnt + 1) * 2) > ctx->fcap) {
    int    *ok = ctx->fkey, *ov = ctx->fval;
    size_t  oc = ctx->fcap;
    ctx->fcap *= 2;
    ctx->fkey  = xmalloc(ctx->fcap * CACHE_KEY_LEN * sizeof(int));
    ctx->fval  = xmalloc(ctx->fcap * sizeof(int));
    for (j = 0; j < ctx->fcap; j++) { ctx->fval[j] = 99; }
    for (j = 0; j < oc; j++) {
      if (ov[j] == 99) { continue; }
      i = key_hash(&ok[j * CACHE_KEY_LEN], ctx->fcap);
      while (ctx->fval[i] != 99) { i = (i + 1) & (ctx->fcap - 1); }
      memcpy(&ctx->fkey[i * CACHE_KEY_LEN], &ok[j * CACHE_KEY_LEN], CACHE_KEY_LEN * sizeof(int));
      ctx->fval[i] = ov[j];
    }
    free(ok);
    free(ov);
  }
  i = key_hash(key, ctx->fcap);
  while (ctx->fval[i] != 99) { i = (i + 1) & (ctx->fcap - 1); }
  memcpy(&ctx->fkey[i * CACHE_KEY_LEN], key, CACHE_KEY_LEN * sizeof(int));
  ctx->fval[i] = val;
  ctx->fcnt++;
}

static int same_cell(end_t a, end_t b) { return ((a.r == b.r) && (a.c == b.c)); }

static int all_distinct(const end_t *ends, int nends) {
  int i, j;
  for (i = 0; i < nends; i++) {
    for (j = i + 1; j < nends; j++) {
      if (same_cell(ends[i], ends[j])) { return 0; }
    }
  }
  return 1;
}

static int in_rect(rect_t rect, end_t e) {
  return ( (e.r >= rect.r0) && (e.r < (rect.r0 + rect.h)) &&
           (e.c >= rect.c0) && (e.c < (rect.c0 + rect.w)) );
}

static end_t endp(int r, int c, int color) {
  end_t e;
  e.r = r; e.c = c; e.color = color;
  return e;
}

// Feasibility check for a sub-instance before trying to solve it: the exact
// IPS test for one path; for two, the forbidden-pattern catalogue, plus an
// exact plugdp check on thin pieces.
//
static int sub_feasible(rect_t rect, const end_t *ends, int nends) {
  int   p[4][2], i;
  end_t local[4];

  if (nends == 2) {
    return ips_ok(rect.h, rect.w,
                  ends[0].r - rect.r0, ends[0].c - rect.c0,
                  ends[1].r - rect.r0, ends[1].c - rect.c0);
  }
  if (!all_distinct(ends, nends)) { return 0; }
  for (i = 0; i < 4; i++) {
    p[i][0] = ends[i].r - rect.r0;
    p[i][1] = ends[i].c - rect.c0;
    local[i] = endp(p[i][0], p[i][1], ends[i].color);
  }
  if (find_forbidden_pattern(rect.h, rect.w, p[0], p[1], p[2], p[3]) != NULL) { return 0; }
  if (imin(rect.h, rect.w) <= EXACT_CHECK) { return plugdp_feasible(rect.h, rect.w, local, 4); }
  return 1;
}

// Base case: exact plugdp on the rectangle.
//
static int solve_base(ctx_t *ctx, rect_t rect, const end_t *ends, int nends) {
  end_t   local[4];
  edge_t *e  = NULL;
  int     ne = 0, cap = 0, i;

  for (i = 0; i < nends; i++) { local[i] = endp(ends[i].r - rect.r0, ends[i].c - rect.c0, ends[i].color); }
  if (!plugdp_solve(rect.h, rect.w, local, nends, &e, &ne, &cap)) { free(e); return INFEASIBLE; }
  for (i = 0; i < ne; i++) {
    push_edge(ctx, e[i].r0 + rect.r0, e[i].c0 + rect.c0, e[i].r1 + rect.r0, e[i].c1 + rect.c0);
  }
  free(e);
  return SOLVED;
}

// A cut: pieces a (columns/rows [0,p)) and b ([p, len)), and the crossing
// cells at position q along it.
//
typedef struct {
  int    vertical, p, len;
  rect_t a, b, rect;
} cut_t;

static cut_t make_cut(rect_t rect, int vertical, int p) {
  cut_t cut;
  cut.vertical = vertical;
  cut.p        = p;
  cut.rect     = rect;
  cut.a        = rect;
  cut.b        = rect;
  if (vertical) {
    cut.a.w  = p;
    cut.b.c0 = rect.c0 + p;
    cut.b.w  = rect.w - p;
    cut.len  = rect.h;
  }
  else {
    cut.a.h  = p;
    cut.b.r0 = rect.r0 + p;
    cut.b.h  = rect.h - p;
    cut.len  = rect.w;
  }
  return cut;
}

static void cut_cross(const cut_t *cut, int q, end_t *xa, end_t *xb) {
  if (cut->vertical) {
    *xa = endp(cut->rect.r0 + q, cut->rect.c0 + cut->p - 1, 0);
    *xb = endp(cut->rect.r0 + q, cut->rect.c0 + cut->p, 0);
  }
  else {
    *xa = endp(cut->rect.r0 + cut->p - 1, cut->rect.c0 + q, 0);
    *xb = endp(cut->rect.r0 + cut->p, cut->rect.c0 + q, 0);
  }
}

static int cut_along(const cut_t *cut, end_t e) {
  return ( cut->vertical ? (e.r - cut->rect.r0) : (e.c - cut->rect.c0) );
}

typedef struct { int vertical, p; double score; } cand_t;

static int cand_cmp(const void *x, const void *y) {
  const cand_t *a = x, *b = y;
  if (a->score < b->score) { return -1; }
  if (a->score > b->score) { return 1; }
  return (a->p - b->p);
}

// Every cut, best first. Prefer cuts across the longer side, near the middle,
// and at least a few cells away from every endpoint.
//
static int cut_candidates(rect_t rect, const end_t *ends, int nends, cand_t *out) {
  int prefer_v = (rect.w >= rect.h), n = 0, v, p, i;

  for (v = 1; v >= 0; v--) {
    int len = ( v ? rect.w : rect.h );
    for (p = 1; p < len; p++) {
      int clear = len;
      for (i = 0; i < nends; i++) {
        int x = ( v ? (ends[i].c - rect.c0) : (ends[i].r - rect.r0) ),
            d = ( (x <= (p - 1)) ? ((p - 1) - x) : (x - p) );
        clear = imin(clear, d);
      }
      out[n].vertical = v;
      out[n].p        = p;
      out[n].score    = (double)abs((2 * p) - len) / 2.0 +
                        (3.0 * imax(0, 3 - clear)) +
                        ( (v == prefer_v) ? 0.0 : (0.5 * imax(rect.h, rect.w)) );
      n++;
    }
  }
  qsort(out, (size_t)n, sizeof(cand_t), cand_cmp);
  return n;
}

// Endpoint-free piece f next to solved piece s: find an edge of s's solution
// running along the cut, and splice in a Hamiltonian cycle of f that uses the
// parallel edge on f's side (cell edge rotation).
//
static int splice_cycle(ctx_t *ctx, const cut_t *cut, int s_is_a, int start) {
  rect_t f      = ( s_is_a ? cut->b : cut->a );
  int    side   = ( cut->vertical ? (s_is_a ? SIDE_LEFT : SIDE_RIGHT) : (s_is_a ? SIDE_TOP : SIDE_BOTTOM) ),
         line_s = ( cut->vertical ? (s_is_a ? (cut->a.c0 + cut->a.w - 1) : cut->b.c0) : (s_is_a ? (cut->a.r0 + cut->a.h - 1) : cut->b.r0) ),
         line_f = ( cut->vertical ? (s_is_a ? cut->b.c0 : (cut->a.c0 + cut->a.w - 1)) : (s_is_a ? cut->b.r0 : (cut->a.r0 + cut->a.h - 1)) ),
         found  = -1, i, n, *cyc;
  int    x1r, x1c, x2r, x2c, y1r, y1c, y2r, y2c;

  for (i = start; (i < ctx->ne) && (found < 0); i++) {
    edge_t e = ctx->edges[i];
    if (e.r0 < 0) { continue; }
    if ( cut->vertical && (e.c0 == line_s) && (e.c1 == line_s) )        { found = i; }
    if ( (!cut->vertical) && (e.r0 == line_s) && (e.r1 == line_s) )     { found = i; }
  }
  if (found < 0) { return 0; }

  x1r = ctx->edges[found].r0; x1c = ctx->edges[found].c0;
  x2r = ctx->edges[found].r1; x2c = ctx->edges[found].c1;
  y1r = ( cut->vertical ? x1r : line_f ); y1c = ( cut->vertical ? line_f : x1c );
  y2r = ( cut->vertical ? x2r : line_f ); y2c = ( cut->vertical ? line_f : x2c );

  n   = f.h * f.w;
  cyc = xmalloc((size_t)2 * n * sizeof(int));
  ham_cycle(f.h, f.w, side, cyc);

  ctx->edges[found].r0 = -1;
  for (i = 0; i < n; i++) {
    int ur = cyc[2 * i] + f.r0,             uc = cyc[(2 * i) + 1] + f.c0,
        vr = cyc[2 * ((i + 1) % n)] + f.r0, vc = cyc[(2 * ((i + 1) % n)) + 1] + f.c0;
    int skip = ( ((ur == y1r) && (uc == y1c) && (vr == y2r) && (vc == y2c)) ||
                 ((ur == y2r) && (uc == y2c) && (vr == y1r) && (vc == y1c)) );
    if (!skip) { push_edge(ctx, ur, uc, vr, vc); }
  }
  push_edge(ctx, x1r, x1c, y1r, y1c);
  push_edge(ctx, x2r, x2c, y2r, y2c);
  free(cyc);
  return 1;
}

// Solve two independent sub-instances, then add the crossing edges.
//
static int solve_pair(ctx_t *ctx, rect_t ra, const end_t *ea, int na, rect_t rb, const end_t *eb, int nb,
                      const end_t *cross, int ncross) {
  int start = ctx->ne, i;
  if (solve_rect(ctx, ra, ea, na) != SOLVED) { ctx->ne = start; return 0; }
  if (solve_rect(ctx, rb, eb, nb) != SOLVED) { ctx->ne = start; return 0; }
  for (i = 0; i < ncross; i++) {
    push_edge(ctx, cross[2 * i].r, cross[2 * i].c, cross[(2 * i) + 1].r, cross[(2 * i) + 1].c);
  }
  return 1;
}

// Crossing positions ordered by distance from a reference coordinate.
//
static int pos_ref;
static int pos_cmp(const void *x, const void *y) {
  int a = *(const int *)x, b = *(const int *)y,
      d = abs(a - pos_ref) - abs(b - pos_ref);
  return ( (d != 0) ? d : (a - b) );
}

static int *positions(int len, int ref) {
  int *qs = xmalloc((size_t)len * sizeof(int)), i;
  for (i = 0; i < len; i++) { qs[i] = i; }
  pos_ref = ref;
  qsort(qs, (size_t)len, sizeof(int), pos_cmp);
  return qs;
}

typedef struct { int q0, q1, d; } qpair_t;

static int qpair_cmp(const void *x, const void *y) {
  const qpair_t *a = x, *b = y;
  if (a->d != b->d)   { return (a->d - b->d); }
  if (a->q0 != b->q0) { return (a->q0 - b->q0); }
  return (a->q1 - b->q1);
}

// Try one cut. Returns 1 if the rectangle was solved with it.
//
static int try_cut(ctx_t *ctx, rect_t rect, const end_t *ends, int nends, const cut_t *cut) {
  int in_a[4], na = 0, k = nends / 2, tries = 0, i;

  (void)rect;
  for (i = 0; i < nends; i++) {
    in_a[i] = in_rect(cut->a, ends[i]);
    na     += in_a[i];
  }

  // All endpoints on one side: solve it, then splice a Hamiltonian cycle of
  // the other (endpoint-free) side into its solution.
  //
  if ( (na == 0) || (na == nends) ) {
    int    s_is_a = (na == nends), start;
    rect_t s      = ( s_is_a ? cut->a : cut->b ),
           f      = ( s_is_a ? cut->b : cut->a );
    if ( (((f.h * f.w) % 2) != 0) || (imin(f.h, f.w) < 2) ) { return 0; }
    if (!sub_feasible(s, ends, nends)) { return 0; }
    start = ctx->ne;
    if (solve_rect(ctx, s, ends, nends) != SOLVED) { ctx->ne = start; return 0; }
    if (!splice_cycle(ctx, cut, s_is_a, start))    { ctx->ne = start; return 0; }
    return 1;
  }

  // One path, one endpoint on each side: it crosses the cut once.
  //
  if (k == 1) {
    end_t ea = ( in_a[0] ? ends[0] : ends[1] ),
          eb = ( in_a[0] ? ends[1] : ends[0] );
    int  *qs = positions(cut->len, cut_along(cut, ea)), ok = 0;

    for (i = 0; (i < cut->len) && (!ok); i++) {
      end_t x[2], sa[2], sb[2];
      cut_cross(cut, qs[i], &x[0], &x[1]);
      sa[0] = endp(ea.r, ea.c, 0);     sa[1] = endp(x[0].r, x[0].c, 0);
      sb[0] = endp(x[1].r, x[1].c, 0); sb[1] = endp(eb.r, eb.c, 0);
      if ( (!sub_feasible(cut->a, sa, 2)) || (!sub_feasible(cut->b, sb, 2)) ) { continue; }
      if (solve_pair(ctx, cut->a, sa, 2, cut->b, sb, 2, x, 1)) { ok = 1; break; }
      if (++tries >= TRIES_PER_CUT) { break; }
    }
    free(qs);
    return ok;
  }

  // Two paths, one endpoint alone on its side: that path crosses once. The
  // lone side becomes a one-path instance, the other a two-path instance.
  //
  if ( (na == 1) || (na == 3) ) {
    int    lone_in_a = (na == 1), li = -1, lc, oc, ok = 0, *qs;
    end_t  lone, mate;
    rect_t r_lone, r_rest;

    for (i = 0; i < 4; i++) {
      if (in_a[i] == lone_in_a) { li = i; }
    }
    lc     = li >> 1;
    oc     = 1 - lc;
    lone   = ends[li];
    mate   = ends[li ^ 1];
    r_lone = ( lone_in_a ? cut->a : cut->b );
    r_rest = ( lone_in_a ? cut->b : cut->a );
    qs     = positions(cut->len, cut_along(cut, lone));

    for (i = 0; i < cut->len; i++) {
      end_t x[2], v_lone, v_rest, s1[2], s3[4];
      cut_cross(cut, qs[i], &x[0], &x[1]);
      v_lone = ( lone_in_a ? x[0] : x[1] );
      v_rest = ( lone_in_a ? x[1] : x[0] );
      s1[0] = endp(lone.r, lone.c, 0);
      s1[1] = endp(v_lone.r, v_lone.c, 0);
      s3[2 * lc]       = endp(mate.r, mate.c, lc);
      s3[(2 * lc) + 1] = endp(v_rest.r, v_rest.c, lc);
      s3[2 * oc]       = endp(ends[2 * oc].r, ends[2 * oc].c, oc);
      s3[(2 * oc) + 1] = endp(ends[(2 * oc) + 1].r, ends[(2 * oc) + 1].c, oc);
      if ( (!sub_feasible(r_lone, s1, 2)) || (!sub_feasible(r_rest, s3, 4)) ) { continue; }
      if (solve_pair(ctx, r_lone, s1, 2, r_rest, s3, 4, x, 1)) { ok = 1; break; }
      if (++tries >= TRIES_PER_CUT) { break; }
    }
    free(qs);
    return ok;
  }

  // Two paths, two endpoints on each side, each side holding both endpoints of
  // one color: two one-path instances.
  //
  if (in_a[0] == in_a[1]) {
    int   ca = ( in_a[0] ? 0 : 1 ), cb = 1 - ca;
    end_t pa[2], pb[2];
    pa[0] = endp(ends[2 * ca].r, ends[2 * ca].c, 0); pa[1] = endp(ends[(2 * ca) + 1].r, ends[(2 * ca) + 1].c, 0);
    pb[0] = endp(ends[2 * cb].r, ends[2 * cb].c, 0); pb[1] = endp(ends[(2 * cb) + 1].r, ends[(2 * cb) + 1].c, 0);
    if ( (!sub_feasible(cut->a, pa, 2)) || (!sub_feasible(cut->b, pb, 2)) ) { return 0; }
    return solve_pair(ctx, cut->a, pa, 2, cut->b, pb, 2, NULL, 0);
  }

  // Each side holds one endpoint of each color: both paths cross the cut, each
  // at its own position; both sides are two-path instances.
  //
  {
    end_t    a0 = ( in_a[0] ? ends[0] : ends[1] ), b0 = ( in_a[0] ? ends[1] : ends[0] ),
             a1 = ( in_a[2] ? ends[2] : ends[3] ), b1 = ( in_a[2] ? ends[3] : ends[2] );
    int      r0 = cut_along(cut, a0), r1 = cut_along(cut, a1), np = 0, q0, q1, ok = 0;
    qpair_t *pairs = xmalloc((size_t)cut->len * cut->len * sizeof(qpair_t));

    for (q0 = 0; q0 < cut->len; q0++) {
      for (q1 = 0; q1 < cut->len; q1++) {
        if (q0 == q1) { continue; }
        pairs[np].q0 = q0;
        pairs[np].q1 = q1;
        pairs[np].d  = abs(q0 - r0) + abs(q1 - r1);
        np++;
      }
    }
    qsort(pairs, (size_t)np, sizeof(qpair_t), qpair_cmp);

    for (i = 0; i < np; i++) {
      end_t x[4], sa[4], sb[4];
      cut_cross(cut, pairs[i].q0, &x[0], &x[1]);
      cut_cross(cut, pairs[i].q1, &x[2], &x[3]);
      sa[0] = endp(a0.r, a0.c, 0);     sa[1] = endp(x[0].r, x[0].c, 0);
      sa[2] = endp(a1.r, a1.c, 1);     sa[3] = endp(x[2].r, x[2].c, 1);
      sb[0] = endp(x[1].r, x[1].c, 0); sb[1] = endp(b0.r, b0.c, 0);
      sb[2] = endp(x[3].r, x[3].c, 1); sb[3] = endp(b1.r, b1.c, 1);
      if ( (!sub_feasible(cut->a, sa, 4)) || (!sub_feasible(cut->b, sb, 4)) ) { continue; }
      if (solve_pair(ctx, cut->a, sa, 4, cut->b, sb, 4, x, 2)) { ok = 1; break; }
      if (++tries >= TRIES_PER_CUT) { break; }
    }
    free(pairs);
    return ok;
  }
}

// Solve a (sub)instance on rect without the failure cache.
//
static int solve_rect_uncached(ctx_t *ctx, rect_t rect, const end_t *ends, int nends) {
  cand_t *cands;
  int     n, i;

  ctx->calls++;
  if (ctx->calls > CALL_BUDGET) { ctx->budget_hit = 1; return FAILED; }

  if ((rect.h * rect.w) == 1) { return ( ((nends == 2) && same_cell(ends[0], ends[1])) ? SOLVED : INFEASIBLE ); }
  if ( (rect.h <= BASE_MAX_SIDE) && (rect.w <= BASE_MAX_SIDE) ) { return solve_base(ctx, rect, ends, nends); }

  cands = xmalloc((size_t)(rect.h + rect.w) * sizeof(cand_t));
  n     = cut_candidates(rect, ends, nends, cands);
  for (i = 0; i < n; i++) {
    int   start = ctx->ne;
    cut_t cut   = make_cut(rect, cands[i].vertical, cands[i].p);
    if (try_cut(ctx, rect, ends, nends, &cut)) { free(cands); return SOLVED; }
    ctx->ne = start;
    if (ctx->budget_hit) { free(cands); return FAILED; }
  }
  free(cands);

  if (imax(rect.h, rect.w) >= CLEAVE_REQUIRED) { return FAILED; }
  if (imin(rect.h, rect.w) <= PLUG_MAX_WIDTH)  { return solve_base(ctx, rect, ends, nends); }
  return FAILED;
}

// Solve a (sub)instance on rect. Returns SOLVED, INFEASIBLE (proved by the
// exact base solver) or FAILED (no cleave cut worked and no base solver
// applies, or the call budget ran out).
//
static int solve_rect(ctx_t *ctx, rect_t rect, const end_t *ends, int nends) {
  int key[CACHE_KEY_LEN], res;

  make_key(rect, ends, nends, key);
  if (cache_get(ctx, key, &res)) { return res; }

  res = solve_rect_uncached(ctx, rect, ends, nends);
  if ( (res != SOLVED) && (!ctx->budget_hit) ) { cache_put(ctx, key, res); }
  return res;
}

//----------------------------------------------------------------------------
// Top level
//----------------------------------------------------------------------------

#define ZZN_SOLVED     0
#define ZZN_INFEASIBLE 1
#define ZZN_ERROR      2

typedef struct {
  int         status;
  const char *reason;
  int        *path[2];
  int         len[2];
} result_t;

// Walk the path starting at s through the edge set (adjacency: at most two
// neighbours per cell). Writes cells as r*C+c; returns the length or -1.
//
static int walk_path(const int *adj, const int *deg, int C, int N, int s, int t, int *out) {
  int len = 0, prev = -1, cur = s;
  out[len++] = cur;
  while (cur != t) {
    int next = -1, j;
    for (j = 0; j < deg[cur]; j++) {
      if (adj[(2 * cur) + j] != prev) { next = adj[(2 * cur) + j]; break; }
    }
    if ( (next < 0) || (len >= N) ) { return -1; }
    prev = cur;
    cur  = next;
    out[len++] = cur;
  }
  (void)C;
  return len;
}

// Check that the two paths join their endpoints with unit steps, use no cell
// twice, and cover every cell. Returns NULL or a description of the fault.
//
static const char *verify(int R, int C, const int *pts, int *const *path, const int *len) {
  unsigned char *seen = xmalloc((size_t)R * C);
  const char    *bad  = NULL;
  int            k, i;

  memset(seen, 0, (size_t)R * C);
  for (k = 0; (k < 2) && (!bad); k++) {
    if (len[k] <= 0)                                                  { bad = "missing path"; break; }
    if (path[k][0] != ((pts[4 * k] * C) + pts[(4 * k) + 1]))          { bad = "path starts at the wrong cell"; break; }
    if (path[k][len[k] - 1] != ((pts[(4 * k) + 2] * C) + pts[(4 * k) + 3])) { bad = "path ends at the wrong cell"; break; }
    for (i = 0; i < len[k]; i++) {
      int a = path[k][i];
      if (seen[a]) { bad = "cell used twice"; break; }
      seen[a] = 1;
      if (i > 0) {
        int b = path[k][i - 1];
        if ((abs((a / C) - (b / C)) + abs((a % C) - (b % C))) != 1) { bad = "non-adjacent step"; break; }
      }
    }
  }
  for (i = 0; (i < (R * C)) && (!bad); i++) {
    if (!seen[i]) { bad = "cell not covered"; }
  }
  free(seen);
  return bad;
}

// Solve an instance. pts = s0r s0c t0r t0c s1r s1c t1r t1c. On ZZN_SOLVED,
// res->path[k] holds path k as cells r*C+c (caller frees).
//
static void zzn_solve(int R, int C, const int *pts, result_t *res) {
  ctx_t       ctx;
  end_t       ends[4];
  rect_t      whole;
  const char *pat, *bad;
  int         i, r, N = R * C, *adj, *deg;

  memset(res, 0, sizeof(*res));
  for (i = 0; i < 4; i++) {
    if ( (pts[2 * i] < 0) || (pts[2 * i] >= R) || (pts[(2 * i) + 1] < 0) || (pts[(2 * i) + 1] >= C) ) {
      res->status = ZZN_ERROR; res->reason = "endpoint outside the grid"; return;
    }
    ends[i] = endp(pts[2 * i], pts[(2 * i) + 1], i >> 1);
  }
  if (!all_distinct(ends, 4)) { res->status = ZZN_ERROR; res->reason = "the four endpoints must be distinct"; return; }

  pat = find_forbidden_pattern(R, C, pts, pts + 2, pts + 4, pts + 6);
  if (pat) { res->status = ZZN_INFEASIBLE; res->reason = pat; return; }

  memset(&ctx, 0, sizeof(ctx));
  ctx.fcap = 1024;
  ctx.fkey = xmalloc(ctx.fcap * CACHE_KEY_LEN * sizeof(int));
  ctx.fval = xmalloc(ctx.fcap * sizeof(int));
  for (i = 0; i < (int)ctx.fcap; i++) { ctx.fval[i] = 99; }

  whole.r0 = 0; whole.c0 = 0; whole.h = R; whole.w = C;
  r = solve_rect(&ctx, whole, ends, 4);

  free(ctx.fkey);
  free(ctx.fval);
  if (r == INFEASIBLE) { free(ctx.edges); res->status = ZZN_INFEASIBLE; res->reason = "exhaustive search (plugdp)"; return; }
  if (r != SOLVED) {
    free(ctx.edges);
    res->status = ZZN_ERROR;
    res->reason = ( ctx.budget_hit ? "search budget exhausted" : "no cleave cut found" );
    return;
  }

  // Assemble the edge set and walk the two paths.
  //
  adj = xmalloc((size_t)2 * N * sizeof(int));
  deg = xmalloc((size_t)N * sizeof(int));
  memset(deg, 0, (size_t)N * sizeof(int));
  for (i = 0; i < ctx.ne; i++) {
    edge_t e = ctx.edges[i];
    int    a, b;
    if (e.r0 < 0) { continue; }
    a = (e.r0 * C) + e.c0;
    b = (e.r1 * C) + e.c1;
    if ( (deg[a] >= 2) || (deg[b] >= 2) ) { fprintf(stderr, "internal error: vertex of degree > 2\n"); exit(3); }
    adj[(2 * a) + deg[a]++] = b;
    adj[(2 * b) + deg[b]++] = a;
  }
  free(ctx.edges);

  for (i = 0; i < 2; i++) {
    res->path[i] = xmalloc((size_t)N * sizeof(int));
    res->len[i]  = walk_path(adj, deg, C, N, (pts[4 * i] * C) + pts[(4 * i) + 1],
                             (pts[(4 * i) + 2] * C) + pts[(4 * i) + 3], res->path[i]);
  }
  free(adj);
  free(deg);

  bad = verify(R, C, pts, res->path, res->len);
  if (bad) { fprintf(stderr, "internal error, invalid solution: %s\n", bad); exit(3); }
  res->status = ZZN_SOLVED;
}

//----------------------------------------------------------------------------
// Command line
//----------------------------------------------------------------------------

static void print_grid(int R, int C, const int *pts, const result_t *res) {
  char *g = xmalloc((size_t)R * C);
  int   r, c, k, i;

  for (k = 0; k < 2; k++) {
    for (i = 0; i < res->len[k]; i++) { g[res->path[k][i]] = ( k ? 'b' : 'a' ); }
  }
  for (k = 0; k < 4; k++) { g[(pts[2 * k] * C) + pts[(2 * k) + 1]] = ( (k < 2) ? 'A' : 'B' ); }
  for (r = 0; r < R; r++) {
    for (c = 0; c < C; c++) { putchar(g[(r * C) + c]); }
    putchar('\n');
  }
  free(g);
}

static void run_one(int R, int C, const int *pts, int grid) {
  result_t res;
  zzn_solve(R, C, pts, &res);
  if      (res.status == ZZN_INFEASIBLE) { printf("infeasible: %s\n", res.reason); }
  else if (res.status == ZZN_ERROR)      { printf("error: %s\n", res.reason); }
  else {
    printf("solved: path lengths %d and %d\n", res.len[0], res.len[1]);
    if (grid) { print_grid(R, C, pts, &res); }
    free(res.path[0]);
    free(res.path[1]);
  }
  fflush(stdout);
}

int main(int argc, char **argv) {
  int  v[10], grid = 0, nv = 0, i;
  char line[512];

  for (i = 1; i < argc; i++) {
    if      (strcmp(argv[i], "--grid") == 0) { grid = 1; }
    else if (nv < 10)                        { v[nv++] = atoi(argv[i]); }
  }

  if (nv == 10) {
    run_one(v[0], v[1], v + 2, grid);
    return 0;
  }
  if (nv != 0) {
    fprintf(stderr, "usage: %s R C s0r s0c t0r t0c s1r s1c t1r t1c [--grid]\n", argv[0]);
    fprintf(stderr, "   or: %s < instances.txt\n", argv[0]);
    return 1;
  }

  while (fgets(line, sizeof(line), stdin)) {
    if (sscanf(line, "%d %d %d %d %d %d %d %d %d %d",
               &v[0], &v[1], &v[2], &v[3], &v[4], &v[5], &v[6], &v[7], &v[8], &v[9]) != 10) {
      continue;
    }
    run_one(v[0], v[1], v + 2, grid);
  }
  return 0;
}
