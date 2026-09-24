/*
 * zzn_infeasible.js — infeasibility test for k = 2 Zig-Zag Numberlink on an R x C rectangle.
 *
 * Problem: cells (r, c), 0 <= r < R, 0 <= c < C. Endpoints s0, t0 (color 0) and s1, t1 (color 1).
 * A solution is two vertex-disjoint paths, s0-t0 and s1-t1, that together cover every cell.
 *
 * checkInfeasible(R, C, s0, t0, s1, t1) runs, in order:
 *   1. parity            checkerboard counting argument
 *   2. topology (raw)     alternation of the endpoints around a face (outer boundary or unit square)
 *   3. propagation        colored constraint propagation to a fixed point, then the end-state check:
 *                         contract settled structure and test alternation on every face, with forced
 *                         path segments treated as obligations
 *   4. probing            try each undecided edge both ways; a value that leads to a contradiction is
 *                         impossible, so the other value is forced
 *   5. corner split       at each corner with an endpoint nearby, enumerate the edge choices of the
 *                         diagonal cell (1,1); combine the surviving choices across corners
 *                         (this is the widget deduction)
 * It returns { infeasible: true, reason } when it finds a contradiction. Every step is a valid
 * deduction, so an infeasible verdict is a proof of infeasibility. { infeasible: false } means no
 * contradiction was found; that is not a proof of feasibility.
 *
 * Usage (Node):
 *   node zzn_infeasible.js R C s0r s0c t0r t0c s1r s1c t1r t1c
 *   node zzn_infeasible.js < file     (one instance per line: R C s0r s0c t0r t0c s1r s1c t1r t1c)
 */
'use strict';

// Plug values are not used here; edges carry 1 (in), -1 (out), 0 (undecided).

function makeProblem(R, C, pts) {
  const N = R * C;
  const req = new Int8Array(N).fill(2), tcol = new Int8Array(N).fill(-1), isT = new Uint8Array(N);
  const p = pts.map(([r, c]) => r * C + c);
  const cols = [0, 0, 1, 1];
  p.forEach((a, i) => { req[a] = 1; tcol[a] = cols[i]; isT[a] = 1; });
  return { R, C, N, req, tcol, isT, p };
}

function newState(P) {
  const { R, C, N } = P;
  const H = new Int8Array(N), V = new Int8Array(N), dom = new Uint8Array(N).fill(3);
  for (let a = 0; a < N; a++) {
    if (a % C === C - 1) H[a] = -1;
    if (Math.floor(a / C) === R - 1) V[a] = -1;
  }
  const cols = [0, 0, 1, 1];
  P.p.forEach((a, i) => { dom[a] = 1 << cols[i]; });
  return { H, V, dom };
}
const cloneState = (S) => ({ H: S.H.slice(), V: S.V.slice(), dom: S.dom.slice() });

// directions: 0 up, 1 right, 2 down, 3 left
function eget(P, S, a, d) {
  const { C, N } = P;
  switch (d) {
    case 0: return a >= C ? S.V[a - C] : -1;
    case 1: return a % C < C - 1 ? S.H[a] : -1;
    case 2: return a < N - C ? S.V[a] : -1;
    default: return a % C > 0 ? S.H[a - 1] : -1;
  }
}
function eset(P, S, a, d, v) {
  const { C } = P;
  switch (d) {
    case 0: S.V[a - C] = v; break;
    case 1: S.H[a] = v; break;
    case 2: S.V[a] = v; break;
    default: S.H[a - 1] = v;
  }
}
const nbr = (P, a, d) => (d === 0 ? a - P.C : d === 1 ? a + 1 : d === 2 ? a + P.C : a - 1);
const popcount = (m) => { let k = 0; while (m) { k += m & 1; m >>= 1; } return k; };

function unionFind(N) {
  const uf = new Int32Array(N);
  for (let i = 0; i < N; i++) uf[i] = i;
  const find = (x) => { while (uf[x] !== x) { uf[x] = uf[uf[x]]; x = uf[x]; } return x; };
  return { uf, find };
}

/* ---------------- 1. parity ---------------- */
function parityOk(P) {
  let s = 0;
  for (const a of P.p) { const r = Math.floor(a / P.C), c = a % P.C; s += (r + c) % 2 === 0 ? 1 : -1; }
  return 2 * ((P.R * P.C) % 2) === s;
}

/* ---------------- 2. raw topology ---------------- */
function perimIndex(P, a) {
  const { R, C } = P, r = Math.floor(a / C), c = a % C;
  if (r === 0) return c;
  if (c === C - 1) return (C - 1) + r;
  if (r === R - 1) return (C - 1) + (R - 1) + (C - 1 - c);
  if (c === 0) return 2 * (C - 1) + (R - 1) + (R - 1 - r);
  return -1;
}
function alternates(order) { return order[0] !== order[1] && order[1] !== order[2] && order[2] !== order[3]; }
function rawTopologyOk(P) {
  const { C, p } = P, cols = [0, 0, 1, 1];
  // unit-square face: four endpoints in a 2x2 block, each color on a diagonal
  const rs = p.map((a) => Math.floor(a / C)), cs = p.map((a) => a % C);
  if (Math.max(...rs) - Math.min(...rs) === 1 && Math.max(...cs) - Math.min(...cs) === 1 &&
      rs[0] !== rs[1] && cs[0] !== cs[1]) return false;
  // outer face
  const idx = p.map((a) => perimIndex(P, a));
  if (idx.every((x) => x >= 0)) {
    const order = [0, 1, 2, 3].sort((i, j) => idx[i] - idx[j]).map((i) => cols[i]);
    if (alternates(order)) return false;
  }
  return true;
}

/* ---------------- faces of the region graph ---------------- */
// Walk every face of the planar graph on cells not in `removed`, using edges that are not out.
function faceWalks(P, S, removed) {
  const N = P.N, used = new Uint8Array(4 * N), walks = [];
  for (let a0 = 0; a0 < N; a0++) for (let d0 = 0; d0 < 4; d0++) {
    if (removed[a0] || used[a0 * 4 + d0] || eget(P, S, a0, d0) === -1 || removed[nbr(P, a0, d0)]) continue;
    let a = a0, d = d0; const walk = [];
    do {
      used[a * 4 + d] = 1; walk.push(a);
      const v = nbr(P, a, d), rev = (d + 2) % 4; let nd = -1;
      for (let k = 1; k <= 4; k++) {
        const dd = (rev + k) % 4;
        if (eget(P, S, v, dd) !== -1 && !removed[nbr(P, v, dd)]) { nd = dd; break; }
      }
      a = v; d = nd;
    } while (!(a === a0 && d === d0) && walk.length < 8 * N);
    walks.push(walk);
  }
  return walks;
}
// Do connections (pairs of cells) that must be vertex-disjoint cross on some face?
function crossesOnSomeFace(walks, conns) {
  for (const walk of walks) {
    const pos = new Map();
    const ends = new Set(conns.flat());
    walk.forEach((a, i) => { if (ends.has(a)) pos.set(a, pos.has(a) ? -2 : i); });
    for (let i = 0; i < conns.length; i++) for (let j = i + 1; j < conns.length; j++) {
      let A = pos.get(conns[i][0]), B = pos.get(conns[i][1]);
      const Pp = pos.get(conns[j][0]), Q = pos.get(conns[j][1]);
      if ([A, B, Pp, Q].some((x) => x === undefined || x < 0)) continue;
      if (A > B) [A, B] = [B, A];
      const pin = Pp > A && Pp < B, qin = Q > A && Q < B;
      if (pin !== qin) return true;
    }
  }
  return false;
}

/* ---------------- 3a. end-state check: settled chains and blobs ---------------- */
function settledFacesOk(P, S) {
  const { N, p, isT } = P, removed = new Uint8Array(N), eff = [0, 0, 0, 0];
  for (let col = 0; col < 2; col++) {
    const sc = p[2 * col], tc = p[2 * col + 1];
    // blob: closure of s_c over undecided edges; contract it if all its cells are color c,
    // it holds t_c, and exactly two in-edges leave it
    const inS = new Uint8Array(N), q = [sc]; inS[sc] = 1;
    for (let h = 0; h < q.length; h++) {
      const a = q[h];
      for (let d = 0; d < 4; d++) if (eget(P, S, a, d) === 0 && !inS[nbr(P, a, d)]) { inS[nbr(P, a, d)] = 1; q.push(nbr(P, a, d)); }
    }
    let blob = !!inS[tc], starts = [], prevs = [];
    if (blob) {
      for (const a of q) if (S.dom[a] !== (1 << col)) { blob = false; break; }
      if (blob) {
        for (const a of q) for (let d = 0; d < 4; d++)
          if (eget(P, S, a, d) === 1 && !inS[nbr(P, a, d)]) { starts.push(nbr(P, a, d)); prevs.push(a); }
        if (starts.length !== 2) blob = false;
      }
    }
    if (blob) q.forEach((a) => { removed[a] = 1; });
    else { starts = [sc, tc]; prevs = [-1, -1]; }
    for (let k = 0; k < 2; k++) {                 // follow forced chains outward
      let cur = starts[k], prev = prevs[k];
      for (;;) {
        let nxt = -1;
        for (let d = 0; d < 4; d++) {
          const b = nbr(P, cur, d);
          if (eget(P, S, cur, d) === 1 && b !== prev && !removed[b]) { nxt = b; break; }
        }
        if (nxt < 0) break;
        removed[cur] = 1; prev = cur; cur = nxt;
      }
      eff[2 * col + k] = cur;
    }
    if (eff[2 * col] === eff[2 * col + 1]) return true;                       // color fully settled
    if (!blob && isT[eff[2 * col]] && eff[2 * col] !== sc) return true;       // completed path
  }
  eff.forEach((a) => { removed[a] = 0; });
  return !crossesOnSomeFace(faceWalks(P, S, removed), [[eff[0], eff[1]], [eff[2], eff[3]]]);
}

/* ---------------- 3b. end-state check: forced segments as obligations ---------------- */
function* permutations(arr) {
  if (arr.length <= 1) { yield arr.slice(); return; }
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const q of permutations(rest)) yield [arr[i], ...q];
  }
}
function segmentsOk(P, S) {
  const { N, req, isT, tcol } = P;
  const indeg = new Int8Array(N);
  for (let a = 0; a < N; a++) for (let d = 0; d < 4; d++) if (eget(P, S, a, d) === 1) indeg[a]++;
  const removed = new Uint8Array(N), openEnd = new Uint8Array(N);
  for (let a = 0; a < N; a++) {
    removed[a] = indeg[a] >= 1 && indeg[a] === req[a] ? 1 : 0;
    openEnd[a] = (indeg[a] >= 1 && indeg[a] < req[a]) || (isT[a] && indeg[a] === 0) ? 1 : 0;
  }
  const { find, uf } = unionFind(N);
  for (let a = 0; a < N; a++) for (const d of [1, 2]) if (eget(P, S, a, d) === 1) { const x = find(a), y = find(nbr(P, a, d)); if (x !== y) uf[x] = y; }
  const comp = new Map();
  for (let a = 0; a < N; a++) {
    const x = find(a);
    if (!comp.has(x)) comp.set(x, { ends: [], t: [0, 0] });
    const c = comp.get(x);
    if (isT[a]) c.t[tcol[a]]++;
    if (openEnd[a]) c.ends.push(a);
  }
  const anchor = [[], []], frags = [];
  for (const c of comp.values()) {
    if (c.t[0] === 2 || c.t[1] === 2) return true;          // a completed path: skip
    if (c.t[0] + c.t[1] === 1) {
      const col = c.t[0] ? 0 : 1;
      if (c.ends.length !== 1) return true;
      anchor[col].push(c.ends[0]);
    } else if (c.ends.length === 2) {
      frags.push({ ends: c.ends, dom: S.dom[c.ends[0]] & S.dom[c.ends[1]] });
    }
  }
  if (anchor[0].length !== 2 || anchor[1].length !== 2 || frags.length > 4) return true;
  const walks = faceWalks(P, S, removed);
  // every assignment of segments to colors, and of order and orientation within each color
  for (let mask = 0; mask < (1 << frags.length); mask++) {
    const byCol = [[], []]; let ok = true;
    frags.forEach((f, i) => { const c = (mask >> i) & 1; if (!(f.dom & (1 << c))) ok = false; byCol[c].push(f); });
    if (!ok) continue;
    const orders = byCol.map((fl) => [...permutations(fl.map((_, i) => i))]);
    for (const o0 of orders[0]) for (let r0 = 0; r0 < (1 << byCol[0].length); r0++)
    for (const o1 of orders[1]) for (let r1 = 0; r1 < (1 << byCol[1].length); r1++) {
      const conns = [];
      [[o0, r0], [o1, r1]].forEach(([ord, rot], col) => {
        let prev = anchor[col][0];
        ord.forEach((fi, k) => {
          const f = byCol[col][fi], flip = (rot >> k) & 1;
          conns.push([prev, f.ends[flip]]); prev = f.ends[1 - flip];
        });
        conns.push([prev, anchor[col][1]]);
      });
      if (!crossesOnSomeFace(walks, conns)) return true;   // some assignment survives
    }
  }
  return false;
}

/* ---------------- 3. colored constraint propagation ---------------- */
// Mutates S to the propagation fixed point. Returns false on contradiction.
function propagate(P, S) {
  const { N, req, tcol, isT } = P;
  const dom = S.dom;
  for (let iter = 0; iter < 100000; iter++) {
    let edgeChanged = false, changed = false;
    // components of in-edges; a cycle is a contradiction
    const { find, uf } = unionFind(N);
    for (let a = 0; a < N && !edgeChanged; a++) for (const d of [1, 2]) if (eget(P, S, a, d) === 1) {
      const x = find(a), y = find(nbr(P, a, d));
      if (x === y) return false;
      uf[x] = y;
    }
    const cdom = new Uint8Array(N).fill(3), ct0 = new Int8Array(N), ct1 = new Int8Array(N);
    for (let a = 0; a < N; a++) { const x = find(a); cdom[x] &= dom[a]; if (isT[a]) (tcol[a] ? ct1 : ct0)[x]++; }
    for (let a = 0; a < N; a++) {
      const x = find(a);
      if (!cdom[x] || (ct0[x] && ct1[x])) return false;          // empty domain or colors joined
      if (dom[a] !== cdom[x]) { dom[a] = cdom[x]; changed = true; }
    }
    // completed path: no other cell may take that color
    for (let col = 0; col < 2; col++) {
      const ct = col ? ct1 : ct0; let done = -1;
      for (let a = 0; a < N; a++) if (ct[find(a)] === 2) { done = find(a); break; }
      if (done < 0) continue;
      for (let a = 0; a < N; a++) if (find(a) !== done && (dom[a] & (1 << col))) {
        dom[a] &= ~(1 << col); changed = true; if (!dom[a]) return false;
      }
    }
    // an edge between cells with no common color is out
    for (let a = 0; a < N && !edgeChanged; a++) for (const d of [1, 2]) {
      const e = eget(P, S, a, d); if (e === -1 && d === 1 && a % P.C === P.C - 1) continue;
      if (d === 2 && a >= N - P.C) continue;
      const b = nbr(P, a, d);
      if (!(dom[a] & dom[b])) {
        if (e === 1) return false;
        if (e === 0) { eset(P, S, a, d, -1); edgeChanged = true; break; }
      }
    }
    if (edgeChanged) continue;
    const need = new Int8Array(N), undec = [];
    for (let a = 0; a < N && !edgeChanged; a++) {
      // color support: a cell of color c needs req[a] non-out edges to cells that can be c
      for (let col = 0; col < 2; col++) if (dom[a] & (1 << col)) {
        let sup = 0;
        for (let d = 0; d < 4; d++) if (eget(P, S, a, d) !== -1 && (dom[nbr(P, a, d)] & (1 << col))) sup++;
        if (sup < req[a]) { dom[a] &= ~(1 << col); changed = true; }
      }
      if (!dom[a]) return false;
      let inn = 0; const ud = [];
      for (let d = 0; d < 4; d++) { const e = eget(P, S, a, d); if (e === 1) inn++; else if (e === 0) ud.push(d); }
      const k = req[a] - inn;
      if (k < 0 || k > ud.length) return false;
      need[a] = k; undec[a] = ud;
      if (ud.length === 0) continue;
      // combination rule: enumerate the ways to choose the k remaining edges
      let inAll = (1 << ud.length) - 1, inAny = 0, nAllowed = 0;
      const X = find(a);
      for (let m = 0; m < (1 << ud.length); m++) {
        if (popcount(m) !== k) continue;
        let ok = true, dm = cdom[X], t0 = ct0[X], t1 = ct1[X]; const ys = [];
        for (let i = 0; i < ud.length && ok; i++) if (m & (1 << i)) {
          const y = find(nbr(P, a, ud[i]));
          if (y === X || ys.includes(y)) ok = false;           // would close a cycle
          ys.push(y); dm &= cdom[y]; t0 += ct0[y]; t1 += ct1[y];
        }
        if (ok && !dm) ok = false;                              // no common color
        if (ok && t0 && t1) ok = false;                         // joins the colors
        for (let col = 0; col < 2 && ok; col++) {
          if ((col ? t1 : t0) !== 2) continue;                  // completes path col: premature if a
          for (let b = 0; b < N && ok; b++) {                   // cell forced to col is left outside
            if (dom[b] !== (1 << col)) continue;
            const fb = find(b);
            if (fb !== X && !ys.includes(fb)) ok = false;
          }
        }
        if (ok) { nAllowed++; inAll &= m; inAny |= m; }
      }
      if (!nAllowed) return false;
      for (let i = 0; i < ud.length; i++) {
        if (inAll & (1 << i)) { eset(P, S, a, ud[i], 1); edgeChanged = true; break; }
        if (!(inAny & (1 << i))) { eset(P, S, a, ud[i], -1); edgeChanged = true; break; }
      }
    }
    if (edgeChanged) continue;
    // counting rule: two cells each needing one edge from the same pair {a, b}, each of which can
    // take only one more edge, use up a and b
    for (let x = 0; x < N && !edgeChanged; x++) {
      if (need[x] !== 1 || !undec[x] || undec[x].length !== 2) continue;
      const a1 = nbr(P, x, undec[x][0]), b1 = nbr(P, x, undec[x][1]);
      for (let y = x + 1; y < N && !edgeChanged; y++) {
        if (need[y] !== 1 || !undec[y] || undec[y].length !== 2) continue;
        const a2 = nbr(P, y, undec[y][0]), b2 = nbr(P, y, undec[y][1]);
        if (!((a1 === a2 && b1 === b2) || (a1 === b2 && b1 === a2))) continue;
        if (need[a1] !== 1 || need[b1] !== 1) continue;
        for (const cap of [a1, b1]) for (let d = 0; d < 4 && !edgeChanged; d++) {
          const z = nbr(P, cap, d);
          if (eget(P, S, cap, d) === 0 && z !== x && z !== y) { eset(P, S, cap, d, -1); edgeChanged = true; }
        }
      }
    }
    if (edgeChanged) continue;
    if (!changed) break;
  }
  if (!settledFacesOk(P, S)) return false;
  return segmentsOk(P, S);
}

/* ---------------- 4. probing ---------------- */
function probe(P, S) {
  let changed = true;
  while (changed) {
    changed = false;
    for (let a = 0; a < P.N && !changed; a++) for (const d of [1, 2]) {
      if (changed) break;
      if (eget(P, S, a, d) !== 0 || (d === 1 && a % P.C === P.C - 1) || (d === 2 && a >= P.N - P.C)) continue;
      for (const val of [1, -1]) {
        const T = cloneState(S); eset(P, T, a, d, val);
        if (!propagate(P, T)) {
          eset(P, S, a, d, -val);
          if (!propagate(P, S)) return false;
          changed = true; break;
        }
      }
    }
  }
  return true;
}

/* ---------------- 5. corner case split (widget deduction) ---------------- */
function cornerSplit(P, S) {
  const { R, C } = P;
  const corners = [[0, 0, 1, 1], [0, C - 1, 1, -1], [R - 1, 0, -1, 1], [R - 1, C - 1, -1, -1]];
  const options = [];
  for (const [r0, c0, dr, dc] of corners) {
    // only corners with an endpoint in their 3x3 window
    const near = P.p.some((a) => { const r = Math.floor(a / C), c = a % C; return Math.abs(r - r0) <= 2 && Math.abs(c - c0) <= 2; });
    if (!near) continue;
    const x = (r0 + dr) * C + (c0 + dc);                       // the diagonal cell (1,1)
    const ud = [], inn = [0, 1, 2, 3].filter((d) => eget(P, S, x, d) === 1).length;
    for (let d = 0; d < 4; d++) if (eget(P, S, x, d) === 0) ud.push(d);
    const k = P.req[x] - inn;
    if (ud.length === 0 || k <= 0) continue;
    const branches = [];
    for (let m = 0; m < (1 << ud.length); m++) {
      if (popcount(m) !== k) continue;
      const choice = ud.map((d, i) => [x, d, (m >> i) & 1 ? 1 : -1]);
      const T = cloneState(S); choice.forEach(([a, d, v]) => eset(P, T, a, d, v));
      if (propagate(P, T)) branches.push(choice);
    }
    if (branches.length === 0) return false;                  // every choice at this corner fails
    if (branches.length > 1) options.push(branches);
  }
  if (options.length < 2) return true;                          // single corners are covered by probing
  // combine the surviving choices across corners
  const idx = new Array(options.length).fill(0);
  for (;;) {
    const T = cloneState(S);
    options.forEach((br, i) => br[idx[i]].forEach(([a, d, v]) => eset(P, T, a, d, v)));
    if (propagate(P, T)) return true;
    let i = 0;
    while (i < options.length && ++idx[i] === options[i].length) { idx[i] = 0; i++; }
    if (i === options.length) return false;
  }
}

/* ---------------- the test ---------------- */
function checkInfeasible(R, C, s0, t0, s1, t1) {
  const pts = [s0, t0, s1, t1];
  for (const [r, c] of pts) if (r < 0 || r >= R || c < 0 || c >= C) throw new Error(`endpoint (${r},${c}) outside the grid`);
  if (new Set(pts.map(([r, c]) => r * C + c)).size !== 4) throw new Error('endpoints must be four distinct cells');
  const P = makeProblem(R, C, pts);
  if (!parityOk(P)) return { infeasible: true, reason: 'parity' };
  if (!rawTopologyOk(P)) return { infeasible: true, reason: 'topology' };
  const S = newState(P);
  if (!propagate(P, S)) return { infeasible: true, reason: 'propagation' };
  if (!probe(P, S)) return { infeasible: true, reason: 'probing' };
  if (!cornerSplit(P, S)) return { infeasible: true, reason: 'corner split' };
  return { infeasible: false, reason: null };
}

module.exports = { checkInfeasible };

/* ---------------- command line ---------------- */
if (require.main === module) {
  const run = (v) => {
    const [R, C, a, b, c, d, e, f, g, h] = v;
    const res = checkInfeasible(R, C, [a, b], [c, d], [e, f], [g, h]);
    return res.infeasible ? `INFEASIBLE ${res.reason}` : 'NO-CONTRADICTION';
  };
  const args = process.argv.slice(2).map(Number);
  if (args.length === 10) console.log(run(args));
  else {
    const lines = require('fs').readFileSync(0, 'utf8').split('\n').filter((l) => l.trim());
    for (const l of lines) console.log(run(l.trim().split(/\s+/).map(Number)));
  }
}
