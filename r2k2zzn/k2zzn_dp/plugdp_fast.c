/*
 * Fast plug DP feasibility solver for k=2 zig-zag numberlink on an R x C grid.
 *
 * Differences from plugdp.c:
 *  1. Cell-by-cell ("broken profile") transitions, with the state set
 *     deduplicated after every cell, not once per column.
 *  2. State = R+1 frontier slots, 3 bits each, packed into one uint64.
 *     Bridges are encoded as nested brackets (open/close) instead of
 *     fragment IDs: fragments in the processed region are disjoint paths in
 *     a planar region, so their frontier endpoints nest properly. States are
 *     therefore canonical with no renumbering step.
 *  3. The grid is transposed so the sweep runs along the longer side.
 *  4. O(1) checkerboard pre-filter.
 *
 * Frontier layout before processing cell (r, c):
 *   F[0..r-1]  right plugs of cells (0..r-1, c)
 *   F[r]       down plug of cell (r-1, c)          -> "up" of the current cell
 *   F[r+1..R]  right plugs of cells (r..R-1, c-1)  -> F[r+1] is "left"
 * Processing (r, c) reads F[r], F[r+1] and writes right -> F[r], down -> F[r+1].
 */

/*
 * Fast plug DP for k=2 zig-zag numberlink, with explicit path construction.
 *
 * Same state encoding and transitions as plugdp_fast.c (cell-by-cell,
 * 3-bit bracket-encoded frontier packed in a uint64, transposed so the
 * sweep runs along the longer side, O(1) checkerboard filter).
 *
 * Path construction:
 *   Forward pass  : keep a checkpoint (the state set) at the start of each
 *                   column. Nothing else is stored.
 *   Backward pass : for c = C-1 .. 0, re-run column c from its checkpoint,
 *                   this time storing a predecessor index per state, and
 *                   pruning against the known end-of-column target T:
 *                   after cell r, slots 0..r never change emptiness or color
 *                   again within the column (later cells only flip a slot's
 *                   kind: bridge->anchor, open<->close), so any state whose
 *                   slots 0..r differ from T in emptiness/color is dropped.
 *                   Tracing back gives this column's edges and the state at
 *                   the column's start; shifted back, that is the target
 *                   for column c-1.
 *   Edges         : after processing cell (r,c) the new state has
 *                   slot r   = right plug  -> edge (r,c)-(r,c+1) used iff nonempty
 *                   slot r+1 = down plug   -> edge (r,c)-(r+1,c) used iff nonempty
 *   Paths         : walk the resulting degree<=2 graph from s0 and from s1.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#define MAX_ROWS_FAST 20   /* (R+1) * 3 bits <= 63 */

typedef uint64_t u64;
enum { EM = 0, A0 = 1, A1 = 2, O0 = 3, C0 = 4, O1 = 5, C1 = 6 };

static inline int  gv(u64 s, int i)        { return (int)((s >> (3 * i)) & 7); }
static inline u64  sv(u64 s, int i, int v) { return (s & ~((u64)7 << (3 * i))) | ((u64)v << (3 * i)); }
static inline int  is_anchor(int v) { return v == A0 || v == A1; }
static inline int  is_open(int v)   { return v == O0 || v == O1; }
static inline int  is_close(int v)  { return v == C0 || v == C1; }
static inline int  color_of(int v)  { return is_anchor(v) ? v - 1 : (v - 3) >> 1; }
static inline int  anchor_v(int c)  { return 1 + c; }
static inline int  open_v(int c)    { return 3 + 2 * c; }
static inline int  close_v(int c)   { return 4 + 2 * c; }

static int partner(u64 s, int i, int n) {
    int v = gv(s, i), depth = 0;
    if (is_open(v)) {
        for (int j = i + 1; j < n; j++) {
            int w = gv(s, j);
            if (is_open(w)) depth++;
            else if (is_close(w)) { if (depth == 0) return j; depth--; }
        }
    } else {
        for (int j = i - 1; j >= 0; j--) {
            int w = gv(s, j);
            if (is_close(w)) depth++;
            else if (is_open(w)) { if (depth == 0) return j; depth--; }
        }
    }
    return -1; /* unreachable for well-formed states */
}

/* ---- open-addressing set of u64, sentinel = all ones ---- */
typedef struct { u64 *k; size_t cap, cnt; } HS;
#define SENT (~(u64)0)
static void hs_init(HS *h, size_t cap) { h->cap = cap; h->cnt = 0; h->k = malloc(cap * sizeof(u64)); memset(h->k, 0xff, cap * sizeof(u64)); }
static void hs_clear(HS *h) { memset(h->k, 0xff, h->cap * sizeof(u64)); h->cnt = 0; }
static inline size_t hs_idx(u64 key, size_t cap) { key ^= key >> 31; key *= 0x9E3779B97F4A7C15ULL; key ^= key >> 29; return (size_t)key & (cap - 1); }
static void hs_add(HS *h, u64 key);
static void hs_grow(HS *h) {
    u64 *old = h->k; size_t oc = h->cap;
    h->cap *= 2; h->cnt = 0; h->k = malloc(h->cap * sizeof(u64)); memset(h->k, 0xff, h->cap * sizeof(u64));
    for (size_t i = 0; i < oc; i++) if (old[i] != SENT) hs_add(h, old[i]);
    free(old);
}
static void hs_add(HS *h, u64 key) {
    if ((h->cnt + 1) * 2 > h->cap) hs_grow(h);
    size_t i = hs_idx(key, h->cap);
    while (h->k[i] != SENT) { if (h->k[i] == key) return; i = (i + 1) & (h->cap - 1); }
    h->k[i] = key; h->cnt++;
}

static long long g_peak_states = 0;
long long plugdp_fast_peak_states(void) { return g_peak_states; }

/* returns 1 feasible, 0 infeasible, -1 invalid input */
int is_feasible_fast(int R, int C, int s0r, int s0c, int t0r, int t0c,
                     int s1r, int s1c, int t1r, int t1c) {
    int tr[4] = { s0r, t0r, s1r, t1r }, tcl[4] = { s0c, t0c, s1c, t1c }, tcol[4] = { 0, 0, 1, 1 };
    if (R < 1 || C < 1) return -1;
    for (int i = 0; i < 4; i++) {
        if (tr[i] < 0 || tr[i] >= R || tcl[i] < 0 || tcl[i] >= C) return -1;
        for (int j = 0; j < i; j++) if (tr[i] == tr[j] && tcl[i] == tcl[j]) return -1;
    }
    /* checkerboard filter: black = (r+c) even */
    int grid_imb = (R * C) % 2;           /* #black - #white */
    int term_sum = 0;
    for (int i = 0; i < 4; i++) term_sum += ((tr[i] + tcl[i]) % 2 == 0) ? 1 : -1;
    if (2 * grid_imb != term_sum) return 0;

    /* transpose so rows = shorter side */
    if (R > C) {
        int t = R; R = C; C = t;
        for (int i = 0; i < 4; i++) { int x = tr[i]; tr[i] = tcl[i]; tcl[i] = x; }
    }
    if (R > MAX_ROWS_FAST) return -1;

    int *term = malloc(sizeof(int) * R * C);
    for (int i = 0; i < R * C; i++) term[i] = -1;
    for (int i = 0; i < 4; i++) term[tr[i] * C + tcl[i]] = tcol[i];

    int n = R + 1;
    u64 mask = (n * 3 == 64) ? ~(u64)0 : (((u64)1 << (3 * n)) - 1);
    HS cur, nxt; hs_init(&cur, 1024); hs_init(&nxt, 1024);
    hs_add(&cur, 0);
    g_peak_states = 1;
    int result = 0;

    for (int c = 0; c < C; c++) {
        if (c > 0) { /* shift: F'[0] = empty, F'[i+1] = F[i]; F[R] is always empty here */
            hs_clear(&nxt);
            for (size_t i = 0; i < cur.cap; i++) if (cur.k[i] != SENT) hs_add(&nxt, (cur.k[i] << 3) & mask);
            HS t = cur; cur = nxt; nxt = t;
        }
        int can_right = c < C - 1;
        for (int r = 0; r < R; r++) {
            int can_down = r < R - 1;
            int tc = term[r * C + c];
            int budget = tc >= 0 ? 1 : 2;
            int navail = can_right + can_down;
            hs_clear(&nxt);
            for (size_t i = 0; i < cur.cap; i++) {
                u64 s = cur.k[i];
                if (s == SENT) continue;
                int up = gv(s, r), lf = gv(s, r + 1);
                int have = (up != EM) + (lf != EM);
                if (have > budget) continue;
                int need = budget - have;
                if (need > navail) continue;
                u64 base = sv(sv(s, r, EM), r + 1, EM);
                if (have == 0) {
                    if (tc >= 0) {
                        int v = anchor_v(tc);
                        if (can_right) hs_add(&nxt, sv(base, r, v));
                        if (can_down)  hs_add(&nxt, sv(base, r + 1, v));
                    } else {
                        for (int col = 0; col <= 1; col++)
                            hs_add(&nxt, sv(sv(base, r, open_v(col)), r + 1, close_v(col)));
                    }
                } else if (have == 1) {
                    int p = up != EM ? up : lf;
                    int pos = up != EM ? r : r + 1;
                    int pc = color_of(p);
                    if (need == 0) { /* terminal cell */
                        if (pc != tc) continue;
                        if (is_anchor(p)) hs_add(&nxt, base);
                        else hs_add(&nxt, sv(base, partner(s, pos, n), anchor_v(pc)));
                    } else {
                        if (can_right) hs_add(&nxt, sv(base, r, p));
                        if (can_down)  hs_add(&nxt, sv(base, r + 1, p));
                    }
                } else { /* have == 2, non-terminal */
                    int col = color_of(up);
                    if (col != color_of(lf)) continue;
                    if (is_anchor(up) && is_anchor(lf)) {
                        hs_add(&nxt, base);
                    } else if (is_anchor(up) || is_anchor(lf)) {
                        int bpos = is_anchor(up) ? r + 1 : r;
                        hs_add(&nxt, sv(base, partner(s, bpos, n), anchor_v(col)));
                    } else if (is_open(up) && is_close(lf)) {
                        continue; /* partners: would close a terminal-free loop */
                    } else if (is_close(up) && is_open(lf)) {
                        hs_add(&nxt, base);
                    } else if (is_open(up)) { /* open, open: inner partner (close) becomes open */
                        int b2 = partner(s, r + 1, n);
                        hs_add(&nxt, sv(base, b2, open_v(col)));
                    } else { /* close, close: inner partner (open) becomes close */
                        int a1 = partner(s, r, n);
                        hs_add(&nxt, sv(base, a1, close_v(col)));
                    }
                }
            }
            HS t = cur; cur = nxt; nxt = t;
            if ((long long)cur.cnt > g_peak_states) g_peak_states = cur.cnt;
            if (cur.cnt == 0) goto done;
        }
    }
    for (size_t i = 0; i < cur.cap; i++) if (cur.k[i] == 0) { result = 1; break; }
done:
    free(cur.k); free(nxt.k); free(term);
    return result;
}

/* ---------- hash map: u64 key -> int32 index into a dense array ---------- */
#define SENT (~(u64)0)
typedef struct {
    u64 *hk; int32_t *hv; size_t cap;   /* hash table */
    u64 *keys; int32_t *pred; size_t cnt, dcap;  /* dense arrays, insertion order */
    int track_pred;
} Layer;

static void layer_init(Layer *L, size_t cap, int track_pred) {
    L->cap = cap; L->hk = malloc(cap * sizeof(u64)); L->hv = malloc(cap * sizeof(int32_t));
    memset(L->hk, 0xff, cap * sizeof(u64));
    L->dcap = cap / 2 + 1; L->keys = malloc(L->dcap * sizeof(u64));
    L->track_pred = track_pred; L->pred = track_pred ? malloc(L->dcap * sizeof(int32_t)) : NULL;
    L->cnt = 0;
}
static void layer_free(Layer *L) { free(L->hk); free(L->hv); free(L->keys); free(L->pred); }
static void layer_clear(Layer *L) { memset(L->hk, 0xff, L->cap * sizeof(u64)); L->cnt = 0; }
static inline size_t hidx(u64 key, size_t cap) { key ^= key >> 31; key *= 0x9E3779B97F4A7C15ULL; key ^= key >> 29; return (size_t)key & (cap - 1); }
static void layer_grow(Layer *L) {
    free(L->hk); free(L->hv);
    L->cap *= 2; L->hk = malloc(L->cap * sizeof(u64)); L->hv = malloc(L->cap * sizeof(int32_t));
    memset(L->hk, 0xff, L->cap * sizeof(u64));
    for (size_t d = 0; d < L->cnt; d++) {
        size_t i = hidx(L->keys[d], L->cap);
        while (L->hk[i] != SENT) i = (i + 1) & (L->cap - 1);
        L->hk[i] = L->keys[d]; L->hv[i] = (int32_t)d;
    }
    L->dcap = L->cap / 2 + 1;
    L->keys = realloc(L->keys, L->dcap * sizeof(u64));
    if (L->track_pred) L->pred = realloc(L->pred, L->dcap * sizeof(int32_t));
}
static inline void layer_add(Layer *L, u64 key, int32_t pred) {
    if ((L->cnt + 1) * 2 > L->cap) layer_grow(L);
    size_t i = hidx(key, L->cap);
    while (L->hk[i] != SENT) { if (L->hk[i] == key) return; i = (i + 1) & (L->cap - 1); }
    L->hk[i] = key; L->hv[i] = (int32_t)L->cnt;
    L->keys[L->cnt] = key;
    if (L->track_pred) L->pred[L->cnt] = pred;
    L->cnt++;
}
static int layer_find(const Layer *L, u64 key) {
    size_t i = hidx(key, L->cap);
    while (L->hk[i] != SENT) { if (L->hk[i] == key) return L->hv[i]; i = (i + 1) & (L->cap - 1); }
    return -1;
}

/* ---------- one cell transition: calls emit(new_state) for every successor ---------- */
typedef struct { int r, R, n, tc, can_right, can_down; } CellCtx;

#define EMIT(x) do { out[nout++] = (x); } while (0)
static int step_cell(u64 s, const CellCtx *cx, u64 *out) {
    int r = cx->r, n = cx->n, tc = cx->tc, nout = 0;
    int budget = tc >= 0 ? 1 : 2;
    int navail = cx->can_right + cx->can_down;
    int up = gv(s, r), lf = gv(s, r + 1);
    int have = (up != EM) + (lf != EM);
    if (have > budget) return 0;
    int need = budget - have;
    if (need > navail) return 0;
    u64 base = sv(sv(s, r, EM), r + 1, EM);
    if (have == 0) {
        if (tc >= 0) {
            int v = anchor_v(tc);
            if (cx->can_right) EMIT(sv(base, r, v));
            if (cx->can_down)  EMIT(sv(base, r + 1, v));
        } else {
            for (int col = 0; col <= 1; col++) EMIT(sv(sv(base, r, open_v(col)), r + 1, close_v(col)));
        }
    } else if (have == 1) {
        int p = up != EM ? up : lf, pos = up != EM ? r : r + 1, pc = color_of(p);
        if (need == 0) {
            if (pc != tc) return 0;
            if (is_anchor(p)) EMIT(base);
            else EMIT(sv(base, partner(s, pos, n), anchor_v(pc)));
        } else {
            if (cx->can_right) EMIT(sv(base, r, p));
            if (cx->can_down)  EMIT(sv(base, r + 1, p));
        }
    } else {
        int col = color_of(up);
        if (col != color_of(lf)) return 0;
        if (is_anchor(up) && is_anchor(lf)) EMIT(base);
        else if (is_anchor(up) || is_anchor(lf)) {
            int bpos = is_anchor(up) ? r + 1 : r;
            EMIT(sv(base, partner(s, bpos, n), anchor_v(col)));
        } else if (is_open(up) && is_close(lf)) return 0;
        else if (is_close(up) && is_open(lf)) EMIT(base);
        else if (is_open(up)) EMIT(sv(base, partner(s, r + 1, n), open_v(col)));
        else EMIT(sv(base, partner(s, r, n), close_v(col)));
    }
    return nout;
}

/* slot "signature" for pruning: 0 empty, 1 color0, 2 color1 */
static inline int sig(int v) { return v == EM ? 0 : 1 + color_of(v); }
static int prefix_matches(u64 s, u64 T, int upto) {
    for (int j = 0; j <= upto; j++) if (sig(gv(s, j)) != sig(gv(T, j))) return 0;
    return 1;
}

/*
 * Returns 1 feasible (paths filled), 0 infeasible, -1 invalid input.
 * path0/path1 receive (row,col) pairs, interleaved: path0[2*i], path0[2*i+1].
 * Each buffer must hold 2*R*C ints. *len0, *len1 = number of cells.
 */
int find_paths_fast(int R, int C, int s0r, int s0c, int t0r, int t0c,
                    int s1r, int s1c, int t1r, int t1c,
                    int *path0, int *len0, int *path1, int *len1) {
    int tr[4] = { s0r, t0r, s1r, t1r }, tcl[4] = { s0c, t0c, s1c, t1c }, tcol[4] = { 0, 0, 1, 1 };
    *len0 = *len1 = 0;
    if (R < 1 || C < 1) return -1;
    for (int i = 0; i < 4; i++) {
        if (tr[i] < 0 || tr[i] >= R || tcl[i] < 0 || tcl[i] >= C) return -1;
        for (int j = 0; j < i; j++) if (tr[i] == tr[j] && tcl[i] == tcl[j]) return -1;
    }
    int term_sum = 0;
    for (int i = 0; i < 4; i++) term_sum += ((tr[i] + tcl[i]) % 2 == 0) ? 1 : -1;
    if (2 * ((R * C) % 2) != term_sum) return 0;

    int transposed = 0;
    if (R > C) {
        transposed = 1;
        int t = R; R = C; C = t;
        for (int i = 0; i < 4; i++) { int x = tr[i]; tr[i] = tcl[i]; tcl[i] = x; }
    }
    if (R > MAX_ROWS_FAST) return -1;

    int *term = malloc(sizeof(int) * R * C);
    for (int i = 0; i < R * C; i++) term[i] = -1;
    for (int i = 0; i < 4; i++) term[tr[i] * C + tcl[i]] = tcol[i];

    int n = R + 1;
    u64 mask = (((u64)1 << (3 * n)) - 1);
    u64 outbuf[4];

    /* ---------------- forward pass with column checkpoints ---------------- */
    u64 **ckpt = calloc(C, sizeof(u64 *));
    size_t *ckpt_n = calloc(C, sizeof(size_t));
    Layer cur, nxt;
    layer_init(&cur, 1024, 0); layer_init(&nxt, 1024, 0);
    layer_add(&cur, 0, -1);
    int feasible = 0;

    for (int c = 0; c < C && cur.cnt > 0; c++) {
        if (c > 0) {
            layer_clear(&nxt);
            for (size_t d = 0; d < cur.cnt; d++) layer_add(&nxt, (cur.keys[d] << 3) & mask, -1);
            Layer t = cur; cur = nxt; nxt = t;
        }
        ckpt_n[c] = cur.cnt;
        ckpt[c] = malloc(cur.cnt * sizeof(u64));
        memcpy(ckpt[c], cur.keys, cur.cnt * sizeof(u64));
        for (int r = 0; r < R; r++) {
            CellCtx cx = { r, R, n, term[r * C + c], c < C - 1, r < R - 1 };
            layer_clear(&nxt);
            for (size_t d = 0; d < cur.cnt; d++) {
                int k = step_cell(cur.keys[d], &cx, outbuf);
                for (int q = 0; q < k; q++) layer_add(&nxt, outbuf[q], -1);
            }
            Layer t = cur; cur = nxt; nxt = t;
            if (cur.cnt == 0) break;
        }
    }
    if (cur.cnt > 0 && layer_find(&cur, 0) >= 0) feasible = 1;
    layer_free(&cur); layer_free(&nxt);

    if (!feasible) {
        for (int c = 0; c < C; c++) free(ckpt[c]);
        free(ckpt); free(ckpt_n); free(term);
        return 0;
    }

    /* ---------------- backward pass: per-column pruned re-run ---------------- */
    /* edge arrays in (transposed) coordinates */
    signed char *right = malloc(R * C), *down = malloc(R * C);  /* -1 none, else color */
    memset(right, -1, R * C); memset(down, -1, R * C);

    u64 target = 0;  /* state at end of column C-1 */
    Layer *lay = malloc(sizeof(Layer) * (R + 1));
    for (int c = C - 1; c >= 0; c--) {
        layer_init(&lay[0], 1024, 1);
        for (size_t d = 0; d < ckpt_n[c]; d++) layer_add(&lay[0], ckpt[c][d], -1);
        free(ckpt[c]); ckpt[c] = NULL;
        for (int r = 0; r < R; r++) {
            CellCtx cx = { r, R, n, term[r * C + c], c < C - 1, r < R - 1 };
            layer_init(&lay[r + 1], 1024, 1);
            for (size_t d = 0; d < lay[r].cnt; d++) {
                int k = step_cell(lay[r].keys[d], &cx, outbuf);
                for (int q = 0; q < k; q++)
                    if (prefix_matches(outbuf[q], target, r)) layer_add(&lay[r + 1], outbuf[q], (int32_t)d);
            }
            /* earlier layer's hash table no longer needed, only keys+pred */
            free(lay[r].hk); lay[r].hk = NULL; free(lay[r].hv); lay[r].hv = NULL;
        }
        int idx = layer_find(&lay[R], target);
        if (idx < 0) { fprintf(stderr, "internal error: target not reachable in column %d\n", c); exit(2); }
        for (int r = R; r >= 1; r--) {
            u64 after = lay[r].keys[idx];
            int ru = gv(after, r - 1), dn = gv(after, r);
            if (ru != EM) right[(r - 1) * C + c] = (signed char)color_of(ru);
            if (dn != EM) down[(r - 1) * C + c] = (signed char)color_of(dn);
            idx = lay[r].pred[idx];
        }
        u64 start = lay[0].keys[idx];
        target = start >> 3;   /* un-shift: state at end of column c-1 */
        for (int r = 0; r <= R; r++) { free(lay[r].hk); free(lay[r].hv); free(lay[r].keys); free(lay[r].pred); }
    }
    free(lay); free(ckpt); free(ckpt_n);

    /* ---------------- walk the edge graph ---------------- */
    int *paths[2] = { path0, path1 }, *lens[2] = { len0, len1 };
    char *seen = calloc(R * C, 1);
    for (int col = 0; col <= 1; col++) {
        int r = tr[2 * col], c = tcl[2 * col], len = 0;
        int pr = -1, pc = -1;
        for (;;) {
            seen[r * C + c] = 1;
            int orr = transposed ? c : r, occ = transposed ? r : c;
            paths[col][2 * len] = orr; paths[col][2 * len + 1] = occ; len++;
            if (r == tr[2 * col + 1] && c == tcl[2 * col + 1]) break;
            int nr = -1, nc = -1;
            int cand[4][3] = {
                { r, c + 1, right[r * C + c] },
                { r + 1, c, down[r * C + c] },
                { r, c - 1, c > 0 ? right[r * C + c - 1] : -1 },
                { r - 1, c, r > 0 ? down[(r - 1) * C + c] : -1 },
            };
            for (int k = 0; k < 4; k++) {
                if (cand[k][2] != col) continue;
                if (cand[k][0] == pr && cand[k][1] == pc) continue;
                nr = cand[k][0]; nc = cand[k][1]; break;
            }
            if (nr < 0) { fprintf(stderr, "internal error: path %d broke at (%d,%d)\n", col, r, c); exit(2); }
            pr = r; pc = c; r = nr; c = nc;
        }
        *lens[col] = len;
    }
    free(seen); free(right); free(down); free(term);
    return 1;
}
