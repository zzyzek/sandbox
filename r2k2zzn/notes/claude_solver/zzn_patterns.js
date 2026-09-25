/*
 * zzn_patterns.js — explicit forbidden-pattern tests for k = 2 Zig-Zag Numberlink on an R x C grid.
 *
 * Endpoints: s0, t0 (color 0) and s1, t1 (color 1), each [row, col]. A solution is two vertex-disjoint
 * paths s0-t0 and s1-t1 covering every cell.
 *
 * findForbiddenPattern(R, C, s0, t0, s1, t1) returns { id, where } for the first catalogue entry that
 * matches, or null. Every entry is a proof of infeasibility under its stated preconditions (see the
 * catalogue document). A null result does not mean the instance is feasible.
 *
 * Corner patterns are written for the top-left corner, cells (r, c) with (0, 0) the corner cell. They
 * are tested at all four corners and in both orientations (reflection across the corner's diagonal).
 * "A" and "B" are the two colors, in either assignment.
 */
'use strict';

/* ---------------- frames: map a corner to the top-left ---------------- */
function frames(R, C) {
  const out = [];
  for (const fr of [false, true]) for (const fc of [false, true]) for (const tr of [false, true]) {
    const H = tr ? C : R, W = tr ? R : C;         // frame dimensions
    const to = ([r, c]) => { let a = fr ? R - 1 - r : r, b = fc ? C - 1 - c : c; return tr ? [b, a] : [a, b]; };
    const back = ([a, b]) => { let r = tr ? b : a, c = tr ? a : b; return [fr ? R - 1 - r : r, fc ? C - 1 - c : c]; };
    out.push({ H, W, to, back, name: `${fr ? 'bottom' : 'top'}-${fc ? 'right' : 'left'}${tr ? ' (transposed)' : ''}` });
  }
  return out;
}

/* ---------------- helpers ---------------- */
const key = ([r, c]) => `${r},${c}`;
function makeView(frame, pts) {
  // pts: [[cell, color], ...] in grid coordinates -> lookup in frame coordinates
  const m = new Map();
  for (const [p, col] of pts) m.set(key(frame.to(p)), col);
  return {
    H: frame.H, W: frame.W,
    at: (r, c) => (m.has(`${r},${c}`) ? m.get(`${r},${c}`) : -1),   // -1: empty (not an endpoint)
    empty: (...cells) => cells.every(([r, c]) => !m.has(`${r},${c}`)),
  };
}

/* ---------------- global checks ---------------- */
function parityOk(R, C, pts) {
  const s = pts.reduce((acc, [[r, c]]) => acc + ((r + c) % 2 === 0 ? 1 : -1), 0);
  return 2 * ((R * C) % 2) === s;
}
function perimIndex(R, C, [r, c]) {
  if (r === 0) return c;
  if (c === C - 1) return (C - 1) + r;
  if (r === R - 1) return (C - 1) + (R - 1) + (C - 1 - c);
  if (c === 0) return 2 * (C - 1) + (R - 1) + (R - 1 - r);
  return -1;
}
const alternating = (cols) => cols[0] !== cols[1] && cols[1] !== cols[2] && cols[2] !== cols[3];

/* ---------------- local strongly forbidden patterns (corner frame) ---------------- */
// Each returns true when the pattern is present. Colors: X = v.at(...) of one endpoint, the other color is 1 - X.
const LOCAL = [
  {
    id: 'L2 corner block',
    // . A      (0,1) and (1,0) hold endpoints of different colors; the corner cell (0,0) is empty.
    // B .
    test: (v) => v.at(0, 1) >= 0 && v.at(1, 0) >= 0 && v.at(0, 1) !== v.at(1, 0) && v.empty([0, 0]),
  },
  {
    id: 'L3 corner wedge',
    // . . A    A at (0,2) and (1,1), B at (1,0); (0,0) and (0,1) empty.
    // B A .
    test: (v) => { const a = v.at(0, 2); return a >= 0 && v.at(1, 1) === a && v.at(1, 0) === 1 - a && v.empty([0, 0], [0, 1]); },
  },
  {
    id: 'L4 corner fork',
    // A . B    A at (0,0) and (1,1), B at (0,2); (0,1) and (1,0) empty.
    // . A .
    test: (v) => { const a = v.at(0, 0); return a >= 0 && v.at(1, 1) === a && v.at(0, 2) === 1 - a && v.H >= 3 && v.empty([0, 1], [1, 0]); },
  },
  {
    id: 'L5 corner trap',
    // B . A    B at (0,0), A at (0,2) and (2,0); (0,1), (1,0), (1,1) empty.
    // . . .
    // A . .
    test: (v) => { const b = v.at(0, 0); return b >= 0 && v.at(0, 2) === 1 - b && v.at(2, 0) === 1 - b && v.empty([0, 1], [1, 0], [1, 1]); },
  },
];

/* ---------------- whole-configuration corner patterns (verified exactly) ---------------- */
// Four endpoints, A = one color's pair, B = the other's, in the corner frame. Verified infeasible by the
// exact solver on 10 x 10 and 12 x 12 (the three edge-closure instances are omitted: E1 covers them).
// Applied only on grids with both sides >= 10 and R*C even, where they were verified.
const CORNER4 = [
  [[[0, 1], [0, 3]], [[1, 1], [1, 3]]],
  [[[0, 1], [0, 6]], [[0, 7], [1, 1]]],
  [[[0, 1], [0, 6]], [[1, 1], [7, 0]]],
  [[[0, 1], [0, 6]], [[1, 2], [6, 0]]],
  [[[0, 1], [0, 7]], [[1, 1], [6, 0]]],
  [[[0, 1], [1, 3]], [[1, 1], [1, 2]]],
  [[[0, 1], [1, 3]], [[1, 2], [2, 2]]],
  [[[0, 1], [1, 3]], [[1, 2], [3, 1]]],
  [[[0, 1], [2, 2]], [[1, 1], [1, 2]]],
  [[[0, 1], [2, 2]], [[1, 2], [3, 1]]],
  [[[0, 1], [2, 2]], [[1, 3], [3, 0]]],
  [[[0, 1], [7, 0]], [[1, 1], [6, 0]]],
  [[[0, 2], [1, 1]], [[2, 1], [3, 0]]],
  [[[0, 2], [2, 0]], [[1, 2], [2, 1]]],
  [[[0, 3], [2, 1]], [[3, 1], [4, 0]]],
  [[[0, 6], [2, 1]], [[1, 2], [6, 0]]],
  [[[1, 2], [2, 2]], [[1, 3], [2, 1]]],
  [[[1, 2], [3, 1]], [[1, 3], [2, 1]]],
  [[[0, 1], [1, 2]], [[0, 4], [2, 2]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 2]], [[0, 4], [3, 1]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 2]], [[1, 3], [2, 0]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 2]], [[1, 3], [4, 0]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 2]], [[2, 0], [2, 2]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 2]], [[2, 2], [4, 0]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 2]], [[3, 1], [4, 0]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 3]], [[0, 3], [0, 4]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 3]], [[0, 3], [2, 0]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [1, 3]], [[0, 3], [4, 0]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [2, 1]], [[0, 2], [2, 2]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [2, 1]], [[0, 2], [3, 1]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [2, 1]], [[0, 4], [1, 3]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [2, 1]], [[0, 4], [2, 2]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [2, 1]], [[0, 4], [3, 1]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [2, 1]], [[1, 3], [4, 0]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [2, 1]], [[2, 2], [4, 0]]],   // multi-step; added after full 10x10 validation
  [[[0, 1], [2, 1]], [[3, 1], [4, 0]]],   // multi-step; added after full 10x10 validation
];

// Odd x odd grids: whole-configuration corner patterns, in the same format. These have three endpoints of
// the corner's color and one of the other, so they can occur only when R*C is odd. Found in the complete
// 11 x 11 coverage check and verified infeasible by the exact solver on 11 x 11 and 13 x 13.
// Applied only on grids with both sides >= 10 and R*C odd.
const CORNER4_ODD = [
  [[[0, 0], [0, 1]], [[1, 1], [2, 0]]],
  [[[0, 0], [1, 4]], [[0, 2], [1, 3]]],
  [[[0, 0], [2, 3]], [[0, 2], [1, 3]]],
];

/* ---------------- edge closure (on any edge) ---------------- */
// . . A . . B . .     A at (0,k) and (1,k+1), B at (0,k+3) and (1,k+2), on the top edge of the frame.
// . . . A B . . .     Cells (0,k+1) and (0,k+2) are empty by construction.
function edgeClosure(v) {
  for (let k = 0; k + 3 < v.W; k++) {
    const a = v.at(0, k);
    if (a >= 0 && v.at(1, k + 1) === a && v.at(0, k + 3) === 1 - a && v.at(1, k + 2) === 1 - a) return true;
  }
  return false;
}

/* ---------------- forced rewrites + effective alternation ---------------- */
// Each rewrite is a local pattern that forces part of a path through a corner. It returns the cells it
// settles (removed) and moves endpoints to effective positions. Proofs are in the catalogue document.
function rewritesAt(v) {
  // returns { removed: [[r,c]...], moves: [[from, to]...] } in frame coordinates, or null
  const e = (r, c) => v.at(r, c);
  // R3 widget: X at (1,2), Y at (2,1), different colors; these cells empty:
  //   (0,0) (0,1) (0,2) (0,3) (1,0) (1,1) (2,0) (3,0)
  if (e(1, 2) >= 0 && e(2, 1) >= 0 && e(1, 2) !== e(2, 1) && v.H >= 4 && v.W >= 4 &&
      v.empty([0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [2, 0], [3, 0]))
    return { removed: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [1, 2], [2, 1]], moves: [[[1, 2], [0, 3]], [[2, 1], [3, 0]]] };
  // R2 diagonal pair: A at (0,0) and (1,1); (0,1) (1,0) (0,2) (2,0) empty
  if (e(0, 0) >= 0 && e(1, 1) === e(0, 0) && v.H >= 3 && v.W >= 3 && v.empty([0, 1], [1, 0], [0, 2], [2, 0]))
    return { removed: [[0, 0], [0, 1], [1, 0], [1, 1]], moves: [[[0, 0], [0, 2]], [[1, 1], [2, 0]]] };
  // R1 corner hop: an endpoint at (0,1) with (0,0) and (1,0) empty moves to (1,0)
  if (e(0, 1) >= 0 && v.empty([0, 0], [1, 0]) && v.H >= 2)
    return { removed: [[0, 0], [0, 1]], moves: [[[0, 1], [1, 0]]] };
  return null;
}

function outerFaceOrder(R, C, removed) {
  // Face walks of the grid graph on the cells not removed. After corner rewrites the region has no holes,
  // so every inner face is a unit square and the outer face is the longest walk.
  // Returns Map cellKey -> positions of that cell along the outer face.
  const N = R * C, rem = new Uint8Array(N);
  removed.forEach(([r, c]) => { rem[r * C + c] = 1; });
  const dr = [-1, 0, 1, 0], dc = [0, 1, 0, -1];
  const ok = (r, c) => r >= 0 && r < R && c >= 0 && c < C && !rem[r * C + c];
  const used = new Uint8Array(4 * N);
  let best = [];
  for (let a0 = 0; a0 < N; a0++) for (let d0 = 0; d0 < 4; d0++) {
    const r0 = Math.floor(a0 / C), c0 = a0 % C;
    if (rem[a0] || used[a0 * 4 + d0] || !ok(r0 + dr[d0], c0 + dc[d0])) continue;
    let r = r0, c = c0, d = d0; const walk = [];
    do {
      used[(r * C + c) * 4 + d] = 1; walk.push(`${r},${c}`);
      const vr = r + dr[d], vc = c + dc[d], rev = (d + 2) % 4; let nd = -1;
      for (let k = 1; k <= 4; k++) { const dd = (rev + k) % 4; if (ok(vr + dr[dd], vc + dc[dd])) { nd = dd; break; } }
      r = vr; c = vc; d = nd;
    } while (!(r === r0 && c === c0 && d === d0) && walk.length < 8 * N);
    if (walk.length > best.length) best = walk;
  }
  const pos = new Map();
  best.forEach((k, i) => { if (!pos.has(k)) pos.set(k, []); pos.get(k).push(i); });
  return pos;
}

function effectiveAlternation(R, C, pts, fr) {
  // apply every applicable rewrite (at most one per corner, disjoint cells), then test alternation of the
  // effective endpoints around the outer face of the remaining region
  const eff = pts.map(([p, col]) => [p.slice(), col]);
  const removed = [], used = new Set();
  let any = false;
  for (const frame of fr) {
    const v = makeView(frame, eff);
    const rw = rewritesAt(v);
    if (!rw) continue;
    const cells = rw.removed.map((q) => frame.back(q));
    if (cells.some((q) => used.has(key(q)))) continue;
    // the destination cells must not be removed by another rewrite
    const moves = rw.moves.map(([f, t]) => [frame.back(f), frame.back(t)]);
    if (moves.some(([, t]) => used.has(key(t)))) continue;
    cells.forEach((q) => { used.add(key(q)); removed.push(q); });
    for (const [f, t] of moves) {
      const e = eff.find(([p]) => key(p) === key(f));
      e[0] = t;
    }
    any = true;
  }
  if (!any) return false;
  if (eff.some(([p]) => used.has(key(p)))) return false;
  if (new Set(eff.map(([p]) => key(p))).size !== 4) return false;
  const pos = outerFaceOrder(R, C, removed);
  const places = eff.map(([p, col]) => [pos.get(key(p)), col]);
  if (places.some(([ps]) => !ps || ps.length !== 1)) return false;   // each must appear exactly once
  const order = places.map(([ps, col]) => [ps[0], col]).sort((a, b) => a[0] - b[0]).map(([, col]) => col);
  return alternating(order);
}


/* ---------------- contextual: boundary-only corner patterns ---------------- */
// Three endpoints in the corner frame: A pair [a1, a2] and a lone B endpoint b. Infeasible when B's partner
// (the fourth endpoint) is on the perimeter OUTSIDE the 6 x 6 corner window (frame rows/cols 0..5), and
// no other endpoint is inside that window. Found by exact solving with the fourth endpoint at the far
// corner on 10 x 10, 10 x 11 (EVEN list) and 11 x 11 (ODD list).
const BOUNDARY3_EVEN = [
  [[[0, 0], [1, 1]], [1, 2]],
  [[[0, 1], [0, 2]], [1, 1]],
  [[[0, 1], [0, 2]], [1, 2]],
  [[[0, 1], [0, 3]], [1, 1]],
  [[[0, 1], [0, 4]], [1, 1]],
  [[[0, 1], [0, 4]], [1, 2]],
  [[[0, 1], [0, 5]], [1, 1]],
  [[[0, 1], [1, 2]], [1, 1]],
  [[[0, 1], [1, 2]], [1, 3]],
  [[[0, 1], [1, 2]], [2, 2]],
  [[[0, 1], [1, 2]], [3, 1]],
  [[[0, 1], [1, 3]], [0, 3]],
  [[[0, 1], [2, 1]], [1, 3]],
  [[[0, 1], [2, 1]], [2, 2]],
  [[[0, 1], [2, 1]], [3, 1]],
  [[[0, 2], [2, 1]], [1, 0]],
  [[[0, 3], [1, 1]], [1, 0]],
  [[[0, 4], [1, 1]], [1, 0]],
  [[[0, 4], [2, 1]], [1, 0]],
  [[[0, 4], [2, 1]], [1, 2]],
  [[[0, 5], [1, 1]], [1, 0]],
];
const BOUNDARY3_ODD = [
  [[[0, 0], [1, 1]], [1, 2]],
  [[[0, 0], [1, 1]], [2, 2]],
  [[[0, 1], [0, 2]], [1, 1]],
  [[[0, 1], [0, 4]], [1, 1]],
  [[[0, 4], [1, 1]], [1, 0]],
];
function boundaryOnly(v, pts, frame, R, C) {
  const list = (R % 2 === 1 && C % 2 === 1) ? BOUNDARY3_ODD : BOUNDARY3_EVEN;
  const inWin = ([r, c]) => r < 6 && c < 6;
  const fp = pts.map(([p, col]) => [frame.to(p), col]);
  for (const [[a1, a2], b] of list) for (const A of [0, 1]) {
    const isA = (q) => fp.some(([p, col]) => col === A && p[0] === q[0] && p[1] === q[1]);
    const bb = fp.find(([p, col]) => col === 1 - A && p[0] === b[0] && p[1] === b[1]);
    if (!isA(a1) || !isA(a2) || !bb) continue;
    const fourth = fp.find(([p, col]) => col === 1 - A && !(p[0] === b[0] && p[1] === b[1]))[0];
    const onPerim = fourth[0] === 0 || fourth[1] === 0 || fourth[0] === frame.H - 1 || fourth[1] === frame.W - 1;
    if (onPerim && !inWin(fourth)) return true;
  }
  return false;
}

/* ---------------- the test ---------------- */
function findForbiddenPattern(R, C, s0, t0, s1, t1) {
  const pts = [[s0, 0], [t0, 0], [s1, 1], [t1, 1]];
  const cells = pts.map(([p]) => p);
  if (new Set(cells.map(key)).size !== 4) throw new Error('endpoints must be four distinct cells');
  for (const [r, c] of cells) if (r < 0 || r >= R || c < 0 || c >= C) throw new Error(`endpoint (${r},${c}) outside the grid`);
  if (!parityOk(R, C, pts)) return { id: 'P parity', where: 'grid' };
  // T1 perimeter alternation
  const idx = cells.map((p) => perimIndex(R, C, p));
  if (idx.every((x) => x >= 0)) {
    const order = [0, 1, 2, 3].sort((i, j) => idx[i] - idx[j]).map((i) => pts[i][1]);
    if (alternating(order)) return { id: 'T1 perimeter alternation', where: 'boundary' };
  }
  // T2 unit-square alternation
  const rs = cells.map(([r]) => r), cs = cells.map(([, c]) => c);
  if (Math.max(...rs) - Math.min(...rs) === 1 && Math.max(...cs) - Math.min(...cs) === 1 &&
      rs[0] !== rs[1] && cs[0] !== cs[1]) return { id: 'T2 unit-square alternation', where: 'interior' };
  // L1 isolated endpoint: every neighbour is an endpoint of the other color
  for (const [[r, c], col] of pts) {
    const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && a < R && b >= 0 && b < C);
    if (nb.every((q) => pts.some(([p, k]) => key(p) === key(q) && k !== col))) return { id: 'L1 isolated endpoint', where: `(${r},${c})` };
  }
  // L6 double corner closure: each color has both endpoints on the two neighbours of an empty corner cell
  // (so each path is exactly three cells) and the grid has more than six cells
  const closures = [];
  for (const [cr, cc, dr, dc] of [[0, 0, 1, 1], [0, C - 1, 1, -1], [R - 1, 0, -1, 1], [R - 1, C - 1, -1, -1]]) {
    const n1 = [cr, cc + dc], n2 = [cr + dr, cc];
    const e1 = pts.find(([p]) => key(p) === key(n1)), e2 = pts.find(([p]) => key(p) === key(n2));
    const cornerEmpty = !pts.some(([p]) => key(p) === key([cr, cc]));
    if (e1 && e2 && e1[1] === e2[1] && cornerEmpty) closures.push(e1[1]);
  }
  if (closures.includes(0) && closures.includes(1) && R * C > 6) return { id: 'L6 double corner closure', where: 'two corners' };
  const fr = frames(R, C);
  for (const frame of fr) {
    const v = makeView(frame, pts);
    for (const L of LOCAL) if (L.test(v)) return { id: L.id, where: frame.name };
    if (edgeClosure(v)) return { id: 'E1 edge closure', where: frame.name };
    if (boundaryOnly(v, pts, frame, R, C)) return { id: 'B boundary-only corner pattern', where: frame.name };
    if (R >= 10 && C >= 10) {
      const A0 = new Set(), A1 = new Set();
      pts.forEach(([p, col]) => (col ? A1 : A0).add(key(frame.to(p))));
      const list = (R * C) % 2 === 0 ? CORNER4 : CORNER4_ODD;
      for (const [A, B] of list) {
        const a = new Set(A.map(key)), b = new Set(B.map(key));
        const eq = (x, y) => x.size === y.size && [...x].every((k) => y.has(k));
        if ((eq(a, A0) && eq(b, A1)) || (eq(a, A1) && eq(b, A0))) return { id: 'C4 corner configuration', where: frame.name };
      }
    }
  }
  if (effectiveAlternation(R, C, pts, fr)) return { id: 'R effective alternation', where: 'boundary after rewrites' };
  return null;
}

module.exports = { findForbiddenPattern };

if (require.main === module) {
  const run = (v) => {
    const res = findForbiddenPattern(v[0], v[1], [v[2], v[3]], [v[4], v[5]], [v[6], v[7]], [v[8], v[9]]);
    return res ? `FORBIDDEN ${res.id} @ ${res.where}` : 'NONE';
  };
  const args = process.argv.slice(2).map(Number);
  if (args.length === 10) console.log(run(args));
  else {
    const lines = require('fs').readFileSync(0, 'utf8').split('\n').filter((l) => l.trim());
    for (const l of lines) console.log(run(l.trim().split(/\s+/).map(Number)));
  }
}
