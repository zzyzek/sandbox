/*
 * Complete enumeration test of the premise:
 *   color compatible AND forced-move consistent AND topologically compatible
 *   ==> feasible (k=2 zig-zag numberlink on R x C).
 *
 * usage: ./enum R C [shard_index shard_count] [--soundness]
 *
 * Configurations are unordered endpoint pairs {s0,t0}, {s1,t1}, colors
 * interchangeable, reduced by the rectangle's symmetry group (4 elements,
 * 8 if square). Each canonical configuration is classified:
 *   PARITY   rejected by checkerboard balance
 *   TOPO     rejected by perimeter alternation
 *   FORCED   rejected by forced-move propagation
 *   OK       passes all three -> must be feasible; checked with a DFS witness
 *            search, and with the exact BFS DP if the DFS gives up.
 * Any OK configuration that is infeasible is printed as COUNTEREXAMPLE.
 * With --soundness, rejected configurations are also run through the exact
 * DP; any that turn out feasible are printed as UNSOUND (a filter bug).
 */
#include "plugdp_fast_path.c"
#include <time.h>

static int R_, C_, N_;
static int term_color_grid[512];

/* ---------------- symmetry ---------------- */
static int xform(int t, int cell) {
    int r = cell / C_, c = cell % C_;
    int nr, nc;
    switch (t) {
        case 0: nr = r;          nc = c;          break;
        case 1: nr = R_ - 1 - r; nc = c;          break;
        case 2: nr = r;          nc = C_ - 1 - c; break;
        case 3: nr = R_ - 1 - r; nc = C_ - 1 - c; break;
        case 4: nr = c;          nc = r;          break;  /* square only */
        case 5: nr = C_ - 1 - c; nc = r;          break;
        case 6: nr = c;          nc = R_ - 1 - r; break;
        default:nr = C_ - 1 - c; nc = R_ - 1 - r; break;
    }
    return nr * C_ + nc;
}
static void norm(int *p) { /* p[0..3]: pair A = p0,p1; pair B = p2,p3 */
    int t;
    if (p[0] > p[1]) { t = p[0]; p[0] = p[1]; p[1] = t; }
    if (p[2] > p[3]) { t = p[2]; p[2] = p[3]; p[3] = t; }
    if (p[0] > p[2] || (p[0] == p[2] && p[1] > p[3])) {
        t = p[0]; p[0] = p[2]; p[2] = t; t = p[1]; p[1] = p[3]; p[3] = t;
    }
}
static int is_canonical(const int *p) {
    int ng = (R_ == C_) ? 8 : 4;
    for (int t = 1; t < ng; t++) {
        int q[4]; for (int i = 0; i < 4; i++) q[i] = xform(t, p[i]);
        norm(q);
        for (int i = 0; i < 4; i++) { if (q[i] < p[i]) return 0; if (q[i] > p[i]) break; }
    }
    return 1;
}

/* ---------------- filters ---------------- */
static int parity_ok(const int *p) {
    int s = 0;
    for (int i = 0; i < 4; i++) { int r = p[i] / C_, c = p[i] % C_; s += ((r + c) % 2 == 0) ? 1 : -1; }
    return 2 * ((R_ * C_) % 2) == s;
}
static int perim_index(int cell) { /* clockwise from (0,0); -1 if interior */
    int r = cell / C_, c = cell % C_;
    if (r == 0) return c;
    if (c == C_ - 1) return (C_ - 1) + r;
    if (r == R_ - 1) return (C_ - 1) + (R_ - 1) + (C_ - 1 - c);
    if (c == 0) return 2 * (C_ - 1) + (R_ - 1) + (R_ - 1 - r);
    return -1;
}
static int topo_ok(const int *p) {
    /* inner faces: a 2x2 block holding all four terminals with each color on a diagonal */
    {
        int r[4], c[4];
        for (int i = 0; i < 4; i++) { r[i] = p[i] / C_; c[i] = p[i] % C_; }
        int rmin = r[0], cmin = c[0], rmax = r[0], cmax = c[0];
        for (int i = 1; i < 4; i++) { if (r[i] < rmin) rmin = r[i]; if (r[i] > rmax) rmax = r[i]; if (c[i] < cmin) cmin = c[i]; if (c[i] > cmax) cmax = c[i]; }
        if (rmax - rmin == 1 && cmax - cmin == 1 && r[0] != r[1] && c[0] != c[1]) return 0;
    }
    int idx[4], col[4] = { 0, 0, 1, 1 };
    for (int i = 0; i < 4; i++) { idx[i] = perim_index(p[i]); if (idx[i] < 0) return 1; }
    /* sort colors by perimeter index */
    for (int i = 0; i < 4; i++) for (int j = i + 1; j < 4; j++)
        if (idx[j] < idx[i]) { int t = idx[i]; idx[i] = idx[j]; idx[j] = t; t = col[i]; col[i] = col[j]; col[j] = t; }
    return !(col[0] != col[1] && col[1] != col[2] && col[2] != col[3]);
}

/* forced-move propagation. edges: horizontal h(r,c) between (r,c),(r,c+1); vertical v(r,c) between (r,c),(r+1,c) */
static int uf[512], ufcol[512];
static int find(int x) { while (uf[x] != x) { uf[x] = uf[uf[x]]; x = uf[x]; } return x; }
static int forced_ok_basic(const int *p) {
    int R = R_, C = C_, N = N_;
    static signed char hst[512], vst[512];   /* 0 unknown, 1 in, -1 out */
    memset(hst, 0, N); memset(vst, 0, N);
    int req[512], tcol[512];
    for (int i = 0; i < N; i++) { req[i] = 2; tcol[i] = -1; uf[i] = i; ufcol[i] = -1; }
    int cols[4] = { 0, 0, 1, 1 };
    for (int i = 0; i < 4; i++) { req[p[i]] = 1; tcol[p[i]] = cols[i]; ufcol[p[i]] = cols[i]; }
    /* edges between terminals of different color can never be used */
    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {
        int a = r * C + c;
        if (c + 1 < C) { int b = a + 1; if (tcol[a] >= 0 && tcol[b] >= 0 && tcol[a] != tcol[b]) hst[a] = -1; }
        else hst[a] = -1;
        if (r + 1 < R) { int b = a + C; if (tcol[a] >= 0 && tcol[b] >= 0 && tcol[a] != tcol[b]) vst[a] = -1; }
        else vst[a] = -1;
    }
    int changed = 1;
    while (changed) {
        changed = 0;
        for (int a = 0; a < N; a++) {
            int r = a / C, c = a % C;
            signed char *e[4]; int nb[4], ne = 0;
            if (c + 1 < C) { e[ne] = &hst[a];     nb[ne++] = a + 1; }
            if (c > 0)     { e[ne] = &hst[a - 1]; nb[ne++] = a - 1; }
            if (r + 1 < R) { e[ne] = &vst[a];     nb[ne++] = a + C; }
            if (r > 0)     { e[ne] = &vst[a - C]; nb[ne++] = a - C; }
            int in = 0, unk = 0;
            for (int k = 0; k < ne; k++) { if (*e[k] == 1) in++; else if (*e[k] == 0) unk++; }
            if (in > req[a] || in + unk < req[a]) return 0;
            if (unk == 0) continue;
            if (in == req[a]) {
                for (int k = 0; k < ne; k++) if (*e[k] == 0) *e[k] = -1;
                changed = 1;
            } else if (in + unk == req[a]) {
                for (int k = 0; k < ne; k++) if (*e[k] == 0) {
                    *e[k] = 1; changed = 1;
                    int x = find(a), y = find(nb[k]);
                    if (x == y) return 0;                         /* cycle */
                    if (ufcol[x] >= 0 && ufcol[y] >= 0 && ufcol[x] != ufcol[y]) return 0; /* colors joined */
                    uf[x] = y; if (ufcol[y] < 0) ufcol[y] = ufcol[x];
                }
            }
        }
    }
    return 1;
}



/* ================= colored constraint propagation + settled face check ================= */
static signed char HS_[512], VS_[512];
static unsigned char DOM_[512];
static int REQ_[512], TCOL_[512], IST_[512];

static inline signed char *eptr(int a, int d) {
    int C = C_, N = N_;
    switch (d) {
        case 0: return a >= C ? &VS_[a - C] : NULL;
        case 1: return a % C < C - 1 ? &HS_[a] : NULL;
        case 2: return a < N - C ? &VS_[a] : NULL;
        default: return a % C > 0 ? &HS_[a - 1] : NULL;
    }
}
static inline int eget(int a, int d) { signed char *q = eptr(a, d); return q ? *q : -1; }
static inline int nbr(int a, int d) { return d == 0 ? a - C_ : d == 1 ? a + 1 : d == 2 ? a + C_ : a - 1; }

/* face alternation on the region left after contracting settled structure */
static int settled_faces_ok(const int *p) {
    int N = N_;
    static char removed[512], inS[512];
    memset(removed, 0, N);
    int eff[4], cols[4] = { 0, 0, 1, 1 };
    for (int col = 0; col < 2; col++) {
        int sc = p[2 * col], tc = p[2 * col + 1];
        int starts[2], prevs[2], nstart = 0;
        /* blob: closure of s_c over undecided edges */
        memset(inS, 0, N);
        int q[512], qh = 0, qt = 0; q[qt++] = sc; inS[sc] = 1;
        while (qh < qt) { int a = q[qh++]; for (int d = 0; d < 4; d++) if (eget(a, d) == 0 && !inS[nbr(a, d)]) { inS[nbr(a, d)] = 1; q[qt++] = nbr(a, d); } }
        int blob = inS[tc];
        if (blob) {
            for (int i = 0; i < qt && blob; i++) if (DOM_[q[i]] != (1 << col)) blob = 0;
            int nin = 0;
            for (int i = 0; i < qt && blob; i++) for (int d = 0; d < 4; d++)
                if (eget(q[i], d) == 1 && !inS[nbr(q[i], d)]) { if (nin < 2) { starts[nin] = nbr(q[i], d); prevs[nin] = q[i]; } nin++; }
            if (blob && nin != 2) blob = 0;
        }
        if (blob) { for (int i = 0; i < qt; i++) removed[q[i]] = 1; nstart = 2; }
        else { starts[0] = sc; prevs[0] = -1; starts[1] = tc; prevs[1] = -1; nstart = 2; }
        for (int k = 0; k < nstart; k++) {
            int cur = starts[k], prev = prevs[k];
            for (;;) {
                int nxt = -1;
                for (int d = 0; d < 4; d++) if (eget(cur, d) == 1 && nbr(cur, d) != prev && !removed[nbr(cur, d)]) { nxt = nbr(cur, d); break; }
                if (nxt < 0) break;
                removed[cur] = 1; prev = cur; cur = nxt;
            }
            eff[2 * col + k] = cur;
        }
        if (eff[2 * col] == eff[2 * col + 1]) return 1;          /* color fully settled */
        if (!blob && (IST_[eff[2 * col]] && eff[2 * col] != sc)) return 1;
    }
    for (int i = 0; i < 4; i++) removed[eff[i]] = 0;
    static char used[2048]; memset(used, 0, 4 * N);
    static int walk[4096];
    for (int a0 = 0; a0 < N; a0++) for (int d0 = 0; d0 < 4; d0++) {
        if (removed[a0] || used[a0 * 4 + d0] || eget(a0, d0) == -1 || removed[nbr(a0, d0)]) continue;
        int a = a0, d = d0, n = 0;
        do {
            used[a * 4 + d] = 1; walk[n++] = a;
            int v = nbr(a, d), rev = (d + 2) % 4, nd = -1;
            for (int k = 1; k <= 4; k++) { int dd = (rev + k) % 4; if (eget(v, dd) != -1 && !removed[nbr(v, dd)]) { nd = dd; break; } }
            a = v; d = nd;
        } while (!(a == a0 && d == d0) && n < 4096);
        int cnt[4] = { 0, 0, 0, 0 }, seq[8], ns = 0;
        for (int i = 0; i < n; i++) for (int t = 0; t < 4; t++) if (walk[i] == eff[t]) { cnt[t]++; if (ns < 8) seq[ns++] = cols[t]; }
        if (cnt[0] == 1 && cnt[1] == 1 && cnt[2] == 1 && cnt[3] == 1 &&
            seq[0] != seq[1] && seq[1] != seq[2] && seq[2] != seq[3]) return 0;
    }
    return 1;
}

static int segments_ok(const int *p);
static int propagate(const int *p) {
    int N = N_;
    static unsigned char cdom[512]; static int ct[512][2];
    int iter = 0;
restart:
    if (++iter > 100000) return 1;
    for (;;) {
        int changed = 0;
        /* components of in-edges */
        for (int i = 0; i < N; i++) uf[i] = i;
        for (int a = 0; a < N; a++) for (int d = 1; d <= 2; d++) if (eget(a, d) == 1) {
            int x = find(a), y = find(nbr(a, d));
            if (x == y) return 0;
            uf[x] = y;
        }
        for (int i = 0; i < N; i++) { cdom[i] = 3; ct[i][0] = ct[i][1] = 0; }
        for (int a = 0; a < N; a++) { int x = find(a); cdom[x] &= DOM_[a]; if (IST_[a]) ct[x][TCOL_[a]]++; }
        for (int a = 0; a < N; a++) {
            int x = find(a);
            if (!cdom[x] || (ct[x][0] && ct[x][1])) return 0;
            if (DOM_[a] != cdom[x]) { DOM_[a] = cdom[x]; changed = 1; }
        }
        /* rule 5: completed path */
        for (int col = 0; col < 2; col++) {
            int done = -1;
            for (int a = 0; a < N; a++) if (ct[find(a)][col] == 2) { done = find(a); break; }
            if (done < 0) continue;
            for (int a = 0; a < N; a++) if (find(a) != done && (DOM_[a] & (1 << col))) {
                DOM_[a] &= ~(1 << col); changed = 1; if (!DOM_[a]) return 0;
            }
        }
        /* rule 2 */
        for (int a = 0; a < N; a++) for (int d = 1; d <= 2; d++) {
            signed char *e = eptr(a, d); if (!e) continue;
            int b = nbr(a, d);
            if (!(DOM_[a] & DOM_[b])) { if (*e == 1) return 0; if (*e == 0) { *e = -1; goto restart; } }
        }
        /* per cell: color support, degree + combination rule */
        int need[512], ucnt[512], ulist[512][4];
        for (int a = 0; a < N; a++) {
            for (int col = 0; col < 2; col++) if (DOM_[a] & (1 << col)) {
                int sup = 0;
                for (int d = 0; d < 4; d++) { int e = eget(a, d); if (e != -1 && (DOM_[nbr(a, d)] & (1 << col))) sup++; }
                if (sup < REQ_[a]) { DOM_[a] &= ~(1 << col); changed = 1; }
            }
            if (!DOM_[a]) return 0;
            int in = 0, u = 0, ud[4];
            for (int d = 0; d < 4; d++) { int e = eget(a, d); if (e == 1) in++; else if (e == 0) ud[u++] = d; }
            int k = REQ_[a] - in;
            if (k < 0 || k > u) return 0;
            need[a] = k; ucnt[a] = u; for (int i = 0; i < u; i++) ulist[a][i] = ud[i];
            if (u == 0) continue;
            /* enumerate subsets of size k of the undecided edges */
            int inAll = (1 << u) - 1, inAny = 0, nallowed = 0;
            for (int m = 0; m < (1 << u); m++) {
                if (__builtin_popcount(m) != k) continue;
                int X = find(a), ys[4], ny = 0, ok = 1;
                unsigned char dm = cdom[X]; int tot0 = ct[X][0], tot1 = ct[X][1];
                for (int i = 0; i < u && ok; i++) if (m & (1 << i)) {
                    int y = find(nbr(a, ud[i]));
                    if (y == X) ok = 0;
                    for (int j = 0; j < ny; j++) if (ys[j] == y) ok = 0;
                    ys[ny++] = y; dm &= cdom[y]; tot0 += ct[y][0]; tot1 += ct[y][1];
                }
                if (ok && !dm) ok = 0;
                if (ok && tot0 && tot1) ok = 0;
                for (int col = 0; col < 2 && ok; col++) {
                    int tot = col ? tot1 : tot0;
                    if (tot == 2) {       /* this choice completes path col: no forced-col cell may remain outside */
                        for (int b = 0; b < N && ok; b++) {
                            if (DOM_[b] != (1 << col)) continue;
                            int fb = find(b), inU = (fb == X);
                            for (int j = 0; j < ny; j++) if (fb == ys[j]) inU = 1;
                            if (!inU) ok = 0;
                        }
                    }
                }
                if (ok) { nallowed++; inAll &= m; inAny |= m; }
            }
            if (!nallowed) return 0;
            for (int i = 0; i < u; i++) {
                signed char *e = eptr(a, ud[i]);
                if (inAll & (1 << i)) { *e = 1; goto restart; }
                if (!(inAny & (1 << i))) { *e = -1; goto restart; }
            }
        }
        /* counting rule: two cells each needing one edge from the same pair {a,b}, each of which takes one more */
        for (int x = 0; x < N; x++) {
            if (need[x] != 1 || ucnt[x] != 2) continue;
            int a1 = nbr(x, ulist[x][0]), b1 = nbr(x, ulist[x][1]);
            for (int y = x + 1; y < N; y++) {
                if (need[y] != 1 || ucnt[y] != 2) continue;
                int a2 = nbr(y, ulist[y][0]), b2 = nbr(y, ulist[y][1]);
                if (!((a1 == a2 && b1 == b2) || (a1 == b2 && b1 == a2))) continue;
                if (need[a1] != 1 || need[b1] != 1) continue;
                int caps[2] = { a1, b1 };
                for (int j = 0; j < 2; j++) for (int d = 0; d < 4; d++) {
                    int z = nbr(caps[j], d);
                    if (eget(caps[j], d) == 0 && z != x && z != y) { *eptr(caps[j], d) = -1; goto restart; }
                }
            }
        }
        if (!changed) break;
    }
    if (!settled_faces_ok(p)) return 0;
    return segments_ok(p);
}


/* ---- obligation check: every forced segment must be traversed; required connections must not cross on any face ---- */
static int segments_ok(const int *p) {
    int N = N_;
    static int indeg[512], removed[512], openend[512];
    for (int a = 0; a < N; a++) { indeg[a] = 0; for (int d = 0; d < 4; d++) if (eget(a, d) == 1) indeg[a]++; }
    for (int a = 0; a < N; a++) { removed[a] = indeg[a] >= 1 && indeg[a] == REQ_[a]; openend[a] = (indeg[a] >= 1 && indeg[a] < REQ_[a]) || (IST_[a] && indeg[a] == 0); }
    /* components of in-edges */
    for (int i = 0; i < N; i++) uf[i] = i;
    for (int a = 0; a < N; a++) for (int d = 1; d <= 2; d++) if (eget(a, d) == 1) { int x = find(a), y = find(nbr(a, d)); if (x != y) uf[x] = y; }
    /* collect per component: open ends, terminal colors */
    static int cend[512][2], cne[512], cterm[512][2];
    for (int i = 0; i < N; i++) { cne[i] = 0; cterm[i][0] = cterm[i][1] = 0; }
    for (int a = 0; a < N; a++) {
        int x = find(a);
        if (IST_[a]) cterm[x][TCOL_[a]]++;
        if (openend[a]) { if (cne[x] < 2) cend[x][cne[x]] = a; cne[x]++; }
    }
    int anchor[2][2], na[2] = { 0, 0 };
    int frag[8][2], fdom[8], nf = 0;
    for (int x = 0; x < N; x++) {
        if (find(x) != x) continue;
        int t0 = cterm[x][0], t1 = cterm[x][1];
        if (t0 == 2 || t1 == 2) return 1;                 /* a completed path: skip */
        if (t0 + t1 == 1) {
            int col = t0 ? 0 : 1;
            if (cne[x] != 1 || na[col] >= 2) return 1;
            anchor[col][na[col]++] = cend[x][0];
        } else if (cne[x] == 2) {
            if (nf >= 4) return 1;                       /* too many segments: skip (sound) */
            frag[nf][0] = cend[x][0]; frag[nf][1] = cend[x][1]; fdom[nf] = DOM_[x]; nf++;
        }
    }
    if (na[0] != 2 || na[1] != 2) return 1;
    /* use the color domain of a segment's cells */
    for (int f = 0; f < nf; f++) fdom[f] = DOM_[frag[f][0]] & DOM_[frag[f][1]];
    /* face walks on the region graph */
    static char used[2048]; static int walk[4096], wstart[1024], wlen[1024]; int nw = 0, wtot = 0;
    memset(used, 0, 4 * N);
    for (int a0 = 0; a0 < N; a0++) for (int d0 = 0; d0 < 4; d0++) {
        if (removed[a0] || used[a0 * 4 + d0] || eget(a0, d0) == -1 || removed[nbr(a0, d0)]) continue;
        if (nw >= 1024) return 1;
        int a = a0, d = d0, n = 0; wstart[nw] = wtot;
        do {
            used[a * 4 + d] = 1; if (wtot < 4096) walk[wtot++] = a; n++;
            int v = nbr(a, d), rev = (d + 2) % 4, nd = -1;
            for (int k = 1; k <= 4; k++) { int dd = (rev + k) % 4; if (eget(v, dd) != -1 && !removed[nbr(v, dd)]) { nd = dd; break; } }
            a = v; d = nd;
        } while (!(a == a0 && d == d0) && n < 4096);
        wlen[nw++] = n;
        if (wtot >= 4096) return 1;
    }
    /* enumerate: color of each segment, order and orientation within each color */
    int pos[512];
    for (int mask = 0; mask < (1 << nf); mask++) {
        int okc = 1;
        for (int f = 0; f < nf; f++) if (!(fdom[f] & (1 << ((mask >> f) & 1)))) okc = 0;
        if (!okc) continue;
        int fl[2][8], nfl[2] = { 0, 0 };
        for (int f = 0; f < nf; f++) { int c = (mask >> f) & 1; fl[c][nfl[c]++] = f; }
        /* iterate permutations x orientations for each color (at most 4 segments total) */
        int perm0[8], perm1[8];
        for (int i = 0; i < nfl[0]; i++) perm0[i] = i;
        int done0 = 0;
        while (!done0) {
            for (int o0 = 0; o0 < (1 << nfl[0]); o0++) {
                for (int i = 0; i < nfl[1]; i++) perm1[i] = i;
                int done1 = 0;
                while (!done1) {
                    for (int o1 = 0; o1 < (1 << nfl[1]); o1++) {
                        /* build connections */
                        int cu[16], cv[16], nc = 0;
                        for (int c = 0; c < 2; c++) {
                            int *perm = c ? perm1 : perm0, o = c ? o1 : o0, prev = anchor[c][0];
                            for (int i = 0; i < nfl[c]; i++) {
                                int f = fl[c][perm[i]], fl0 = (o >> i) & 1;
                                int x = frag[f][fl0], y = frag[f][1 - fl0];
                                cu[nc] = prev; cv[nc] = x; nc++; prev = y;
                            }
                            cu[nc] = prev; cv[nc] = anchor[c][1]; nc++;
                        }
                        /* crossing test on every face */
                        int dead = 0;
                        for (int w = 0; w < nw && !dead; w++) {
                            for (int i = 0; i < nc; i++) { pos[cu[i]] = -1; pos[cv[i]] = -1; }
                            int multi = 0;
                            for (int i = 0; i < wlen[w]; i++) {
                                int a = walk[wstart[w] + i];
                                for (int k = 0; k < nc; k++) if (a == cu[k] || a == cv[k]) { if (pos[a] >= 0 && pos[a] != i) pos[a] = -2; else if (pos[a] == -1) pos[a] = i; break; }
                            }
                            (void)multi;
                            for (int i = 0; i < nc && !dead; i++) for (int j = i + 1; j < nc && !dead; j++) {
                                int A = pos[cu[i]], B = pos[cv[i]], P = pos[cu[j]], Q = pos[cv[j]];
                                if (A < 0 || B < 0 || P < 0 || Q < 0) continue;
                                if (A > B) { int t = A; A = B; B = t; }
                                int pin = (P > A && P < B), qin = (Q > A && Q < B);
                                if (pin != qin) dead = 1;
                            }
                        }
                        if (!dead) return 1;     /* some assignment survives */
                    }
                    /* next permutation of perm1 */
                    int i = nfl[1] - 2; while (i >= 0 && perm1[i] > perm1[i + 1]) i--;
                    if (i < 0) done1 = 1; else { int j = nfl[1] - 1; while (perm1[j] < perm1[i]) j--; int t = perm1[i]; perm1[i] = perm1[j]; perm1[j] = t;
                        for (int l = i + 1, r = nfl[1] - 1; l < r; l++, r--) { t = perm1[l]; perm1[l] = perm1[r]; perm1[r] = t; } }
                }
            }
            int i = nfl[0] - 2; while (i >= 0 && perm0[i] > perm0[i + 1]) i--;
            if (i < 0) done0 = 1; else { int j = nfl[0] - 1; while (perm0[j] < perm0[i]) j--; int t = perm0[i]; perm0[i] = perm0[j]; perm0[j] = t;
                for (int l = i + 1, r = nfl[0] - 1; l < r; l++, r--) { t = perm0[l]; perm0[l] = perm0[r]; perm0[r] = t; } }
        }
    }
    return 0;   /* every assignment forces a crossing */
}

static int forced_ok(const int *p) {
    int N = N_;
    memset(HS_, 0, N); memset(VS_, 0, N);
    for (int i = 0; i < N; i++) { REQ_[i] = 2; TCOL_[i] = -1; IST_[i] = 0; DOM_[i] = 3; }
    int cols[4] = { 0, 0, 1, 1 };
    for (int i = 0; i < 4; i++) { REQ_[p[i]] = 1; TCOL_[p[i]] = cols[i]; IST_[p[i]] = 1; DOM_[p[i]] = 1 << cols[i]; }
    for (int a = 0; a < N; a++) { if (a % C_ == C_ - 1) HS_[a] = -1; if (a / C_ == R_ - 1) VS_[a] = -1; }
    if (!propagate(p)) return 0;
    /* probing: an edge whose setting leads to a contradiction is forced the other way */
    static signed char sh[512], sv[512]; static unsigned char sd[512];
    int changed = 1;
    while (changed) {
        changed = 0;
        for (int a = 0; a < N && !changed; a++) for (int d = 1; d <= 2 && !changed; d++) {
            signed char *e = eptr(a, d);
            if (!e || *e != 0) continue;
            for (int val = 1; val >= -1; val -= 2) {
                memcpy(sh, HS_, N); memcpy(sv, VS_, N); memcpy(sd, DOM_, N);
                *e = (signed char)val;
                int ok = propagate(p);
                memcpy(HS_, sh, N); memcpy(VS_, sv, N); memcpy(DOM_, sd, N);
                if (!ok) {
                    *e = (signed char)(-val);
                    if (!propagate(p)) return 0;
                    changed = 1;
                    break;
                }
            }
        }
    }
    return 1;
}

/* ---------------- DFS witness search with dead-state memo ---------------- */
static Layer dead;
static long long dfs_nodes, dfs_cap;
static int dfs_abort;
static u64 dfs_mask;
static int dfs(int k, u64 s) {
    if (k == R_ * C_) return s == 0;
    int r = k % R_, c = k / R_;
    if (r == 0 && c > 0) s = (s << 3) & dfs_mask;
    u64 key = s | ((u64)k << 55);
    if (layer_find(&dead, key) >= 0) return 0;
    if (++dfs_nodes > dfs_cap) { dfs_abort = 1; return 0; }
    CellCtx cx = { r, R_, R_ + 1, term_color_grid[r * C_ + c], c < C_ - 1, r < R_ - 1 };
    u64 out[4]; int n = step_cell(s, &cx, out);
    for (int i = 0; i < n; i++) { if (dfs(k + 1, out[i])) return 1; if (dfs_abort) return 0; }
    layer_add(&dead, key, -1);
    return 0;
}

/* exact BFS; rows = R_ (caller guarantees R_ <= C_) */
static int bfs_feasible(void) {
    int n = R_ + 1; u64 mask = dfs_mask, outb[4];
    Layer cur, nxt; layer_init(&cur, 1024, 0); layer_init(&nxt, 1024, 0);
    layer_add(&cur, 0, -1);
    for (int c = 0; c < C_; c++) {
        if (c > 0) { layer_clear(&nxt); for (size_t d = 0; d < cur.cnt; d++) layer_add(&nxt, (cur.keys[d] << 3) & mask, -1); Layer t = cur; cur = nxt; nxt = t; }
        for (int r = 0; r < R_; r++) {
            CellCtx cx = { r, R_, n, term_color_grid[r * C_ + c], c < C_ - 1, r < R_ - 1 };
            layer_clear(&nxt);
            for (size_t d = 0; d < cur.cnt; d++) { int k = step_cell(cur.keys[d], &cx, outb); for (int q = 0; q < k; q++) layer_add(&nxt, outb[q], -1); }
            Layer t = cur; cur = nxt; nxt = t;
            if (cur.cnt == 0) { layer_free(&cur); layer_free(&nxt); return 0; }
        }
    }
    int ok = layer_find(&cur, 0) >= 0;
    layer_free(&cur); layer_free(&nxt);
    return ok;
}

static int feasible(const int *p, int *used_bfs) {
    for (int i = 0; i < N_; i++) term_color_grid[i] = -1;
    /* grid stored row-major with C_ columns; the DP sweeps columns, rows = R_ */
    int cols[4] = { 0, 0, 1, 1 };
    for (int i = 0; i < 4; i++) term_color_grid[p[i]] = cols[i];
    layer_clear(&dead); dfs_nodes = 0; dfs_abort = 0;
    int r = dfs(0, 0);
    *used_bfs = 0;
    if (r) return 1;
    if (!dfs_abort) return 0;
    *used_bfs = 1;
    return bfs_feasible();
}

static int check_mode(void) {
    int R, C, t[8]; long long n = 0, pass = 0, cex = 0;
    char line[512];
    while (fgets(line, sizeof line, stdin)) {
        if (sscanf(line, "%d %d %d %d %d %d %d %d %d %d", &R, &C, &t[0],&t[1],&t[2],&t[3],&t[4],&t[5],&t[6],&t[7]) != 10) continue;
        if (R > C) { int x = R; R = C; C = x; for (int i = 0; i < 4; i++) { x = t[2*i]; t[2*i] = t[2*i+1]; t[2*i+1] = x; } }
        R_ = R; C_ = C; N_ = R * C; dfs_mask = (((u64)1 << (3 * (R + 1))) - 1);
        int p[4]; for (int i = 0; i < 4; i++) p[i] = t[2*i] * C + t[2*i+1];
        n++;
        const char *why = !parity_ok(p) ? "parity" : !topo_ok(p) ? "topo" : !forced_ok(p) ? "forced" : NULL;
        if (why) { printf("REJECTED(%s) %s", why, line); continue; }
        pass++;
        int ub, f = feasible(p, &ub);
        if (!f) cex++;
        printf("%s %s", f ? "PASS-FEASIBLE" : "COUNTEREXAMPLE", line);
    }
    printf("CHECKED %lld: passed filters %lld, of which infeasible %lld\n", n, pass, cex);
    return 0;
}

int main(int argc, char **argv) {
    if (argc > 1 && !strcmp(argv[1], "check")) { dfs_cap = 2000000; layer_init(&dead, 1 << 16, 0); return check_mode(); }
    if (argc < 3) { fprintf(stderr, "usage: %s R C [shard count] [--soundness]\n", argv[0]); return 1; }
    int R = atoi(argv[1]), C = atoi(argv[2]);
    if (R > C) { int t = R; R = C; C = t; }  /* rows = shorter side */
    int shard = 0, nshard = 1, sound = 0;
    int ai = 3;
    if (argc > 4 && argv[3][0] != '-') { shard = atoi(argv[3]); nshard = atoi(argv[4]); ai = 5; }
    for (; ai < argc; ai++) if (!strcmp(argv[ai], "--soundness")) sound = 1;
    R_ = R; C_ = C; N_ = R * C;
    dfs_mask = (((u64)1 << (3 * (R + 1))) - 1);
    dfs_cap = 2000000;
    layer_init(&dead, 1 << 16, 0);

    long long total = 0, n_par = 0, n_topo = 0, n_forced = 0, n_ok = 0, n_bfs = 0, n_cex = 0, n_unsound = 0;
    long long idx = 0;
    clock_t t0 = clock();
    int p[4];
    for (int a = 0; a < N_; a++) for (int b = a + 1; b < N_; b++)
    for (int c = a + 1; c < N_; c++) for (int d = c + 1; d < N_; d++) {
        if (c == b || d == b) continue;
        p[0] = a; p[1] = b; p[2] = c; p[3] = d;   /* already normalized: a<b, c<d, a<c */
        if (!is_canonical(p)) continue;
        if ((idx++ % nshard) != shard) continue;
        total++;
        int reject = 0;
        if (!parity_ok(p)) { n_par++; reject = 1; }
        else if (!topo_ok(p)) { n_topo++; reject = 2; }
        else if (!forced_ok(p)) { n_forced++; reject = 3; }
        if (!reject) {
            n_ok++;
            int ub; int f = feasible(p, &ub); n_bfs += ub;
            if (!f) {
                n_cex++;
                printf("COUNTEREXAMPLE %dx%d s0=(%d,%d) t0=(%d,%d) s1=(%d,%d) t1=(%d,%d)\n", R, C,
                       a / C, a % C, b / C, b % C, c / C, c % C, d / C, d % C);
                fflush(stdout);
            }
        } else if (sound && reject != 1) {  /* parity is proven necessary; check the other two */
            int ub; if (feasible(p, &ub)) {
                n_unsound++;
                printf("UNSOUND(%s) %dx%d s0=(%d,%d) t0=(%d,%d) s1=(%d,%d) t1=(%d,%d)\n", reject == 2 ? "topo" : "forced", R, C,
                       a / C, a % C, b / C, b % C, c / C, c % C, d / C, d % C);
            }
        }
    }
    double dt = (double)(clock() - t0) / CLOCKS_PER_SEC;
    printf("SUMMARY %dx%d shard %d/%d: canonical=%lld parity_rej=%lld topo_rej=%lld forced_rej=%lld "
           "passed=%lld counterexamples=%lld bfs_fallbacks=%lld unsound=%lld time=%.1fs\n",
           R, C, shard, nshard, total, n_par, n_topo, n_forced, n_ok, n_cex, n_bfs, n_unsound, dt);
    return 0;
}
