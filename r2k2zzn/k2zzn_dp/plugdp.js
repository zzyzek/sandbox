"use strict";
/*
 * Plug DP feasibility solver for k=2 zig-zag numberlink on an R-row strip,
 * for any R >= 1.
 *
 * THE DATA
 * --------
 * A Plug describes what crosses one row of a vertical cut between two
 * columns. There are three kinds:
 *
 *   EMPTY    nothing crosses this row
 *   ANCHOR   a path fragment that has already touched ONE of its two
 *            terminals crosses here (it still needs to reach the other one)
 *   BRIDGE   a path fragment that has touched NEITHER terminal yet crosses
 *            here; it has exactly one other end, also a BRIDGE plug
 *            somewhere else in the same profile, carrying the same
 *            (color, fragment) pair
 *
 * A Profile is an array of R Plugs, one per row. `fragment` is renumbered
 * fresh every column (canonicalize) and only ever needs to distinguish
 * BRIDGE pairs open at the same time -- at most floor(R/2) of them.
 *
 * COST: exponential in R (profile-state count grows like a weighted
 * Motzkin number, ~5^R), linear in the number of columns.
 */

const EMPTY = { "kind": "EMPTY", "color": -1, "fragment": -1 };

function anchor(color) {
  return { "kind": "ANCHOR", "color": color, "fragment": -1 };
}
function bridge(color, fragment) {
  return { "kind": "BRIDGE", "color": color, "fragment": fragment };
}
function isEmpty(p) { return p.kind === "EMPTY"; }
function plugKey(p) {
  return p.kind + "," + p.color.toString() + "," + p.fragment.toString();
}
function profileKey(profile) {
  return profile.map(plugKey).join("|");
}

// Renumber BRIDGE fragment labels by order of first appearance.
//
function canonicalize(profile) {
  const remap = new Map();
  return profile.map((plug) => {
    if (plug.kind !== "BRIDGE") return plug;
    const key = plug.color + "," + plug.fragment;
    if (!remap.has(key)) { remap.set(key, remap.size); }
    return bridge(plug.color, remap.get(key));
  });
}

function terminalAt(terminals, row, col) {
  for (const t of terminals) {
    if ((t.row === row) && (t.col === col)) { return t.color; }
  }
  return null;
}

function findBridgePartner(working, excludeRow, color, fragment) {
  for (let row = 0; row < working.length; row++) {
    if (row === excludeRow) { continue; }
    const p = working[row];
    if ((p.kind === "BRIDGE") && (p.color === color) && (p.fragment === fragment)) { return row; }
  }
  return null;
}

function resolveCell(working, row, present, isTerminal, termColor, useRight, useDown, nextId) {
  const results = [];
  const place = (value) => {
    const w = working.slice();
    w[row] = useRight ? value : EMPTY;
    const p = useDown ? value : EMPTY;
    return [w, p, nextId];
  };

  if (present.length === 0) {
    if (isTerminal) {
      results.push(place(anchor(termColor)));
    } else {
      for (const color of [0, 1]) {
        const frag = bridge(color, nextId);
        const w = working.slice();
        w[row] = useRight ? frag : EMPTY;
        const p = useDown ? frag : EMPTY;
        results.push([w, p, nextId + 1]);
      }
    }
  } else if (present.length === 1) {
    const plug = present[0];
    if (!useRight && !useDown) {
      if (plug.color !== termColor) { return results; }
      if (plug.kind === "ANCHOR") {
        const w = working.slice();
        w[row] = EMPTY;
        results.push([w, EMPTY, nextId]);
      } else {
        const other = findBridgePartner(working, row, plug.color, plug.fragment);
        if (other === null) { return results; }
        const w = working.slice();
        w[other] = anchor(plug.color);
        w[row] = EMPTY;
        results.push([w, EMPTY, nextId]);
      }
    } else {
      results.push(place(plug));
    }
  } else {
    const [p1, p2] = present;
    if (p1.color !== p2.color) { return results; }
    const color = p1.color;
    if (p1.kind === "ANCHOR" && p2.kind === "ANCHOR") {
      const w = working.slice();
      w[row] = EMPTY;
      results.push([w, EMPTY, nextId]);
    } else if ((p1.kind === "ANCHOR") || (p2.kind === "ANCHOR")) {
      const fragPlug = ((p1.kind === "ANCHOR") ? p2 : p1);
      const other = findBridgePartner(working, row, color, fragPlug.fragment);
      if (other === null) { return results; }
      const w = working.slice();
      w[other] = anchor(color);
      w[row] = EMPTY;
      results.push([w, EMPTY, nextId]);
    } else {
      if (p1.fragment === p2.fragment) { return results; }
      const row1 = findBridgePartner(working, row, color, p1.fragment);
      const row2 = findBridgePartner(working, row, color, p2.fragment);
      if (row1 === null || row2 === null) { return results; }
      const w = working.slice();
      const newFrag = nextId;
      w[row1] = bridge(color, newFrag);
      w[row2] = bridge(color, newFrag);
      w[row] = EMPTY;
      results.push([w, EMPTY, nextId + 1]);
    }
  }
  return results;
}

function processColumn(profileIn, rows, col, numCols, terminals) {
  let freshId = 0;
  for (const p of profileIn) if (p.kind === "BRIDGE") freshId = Math.max(freshId, p.fragment + 1);

  let branches = [[profileIn.slice(), null, freshId]];

  for (let row = 0; row < rows; row++) {
    const nextBranches = [];
    for (const [working, pendingIn, nextId] of branches) {
      const left = col > 0 ? working[row] : "BOUNDARY";
      const up = row > 0 ? pendingIn : "BOUNDARY";
      const canRight = col < numCols - 1;
      const canDown = row < rows - 1;

      const termColor = terminalAt(terminals, row, col);
      const isTerminal = termColor !== null;
      const budget = isTerminal ? 1 : 2;

      const present = [left, up].filter((p) => p !== "BOUNDARY" && !isEmpty(p));
      const have = present.length;
      if (have > budget) { continue; }
      const need = budget - have;

      const available = [];
      if (canRight) available.push("right");
      if (canDown) available.push("down");
      if (need > available.length) continue;

      for (const choice of combinations(available, need)) {
        const useRight = choice.includes("right");
        const useDown = choice.includes("down");
        for (const out of resolveCell(working, row, present, isTerminal, termColor, useRight, useDown, nextId)) {
          nextBranches.push(out);
        }
      }
    }
    branches = nextBranches;
  }

  const seen = new Map();
  for (const [working] of branches) {
    const canon = canonicalize(working);
    seen.set(profileKey(canon), canon);
  }
  return [...seen.values()];
}

function combinations(arr, k) {

  //console.log(Array(k).fill("  ").join(""), "combo:", k, arr);

  if (k === 0) { return [[]]; }
  if (arr.length === 0) { return []; }
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return withFirst.concat(withoutFirst);
}

function validateInput(rows, numCols, s0, t0, s1, t1) {
  // See the matching comment in plugdp.py: an out-of-bounds terminal is
  // invisible to the sweep, so that color is silently never required to
  // cover any cells, and the DP can wrongly report "feasible". Reject
  // this at the door rather than compute a misleading answer.
  if (rows < 1 || numCols < 1) {
    throw new Error(`rows and numCols must be >= 1, got rows=${rows}, numCols=${numCols}`);
  }
  const terminals = { s0, t0, s1, t1 };
  for (const [name, [r, c]] of Object.entries(terminals)) {
    if (!(r >= 0 && r < rows && c >= 0 && c < numCols)) {
      throw new Error(
        `${name}=(${r},${c}) is out of bounds for a ${rows}x${numCols} grid ` +
        `(rows must be in 0..${rows - 1}, cols in 0..${numCols - 1})`
      );
    }
  }
  const keys = new Set(Object.values(terminals).map(([r, c]) => r + "," + c));
  if (keys.size !== 4) {
    throw new Error(`s0, t0, s1, t1 must be four distinct cells, got ${JSON.stringify(terminals)}`);
  }
}

function isFeasible(rows, numCols, s0, t0, s1, t1) {
  validateInput(rows, numCols, s0, t0, s1, t1);
  const terminals = [
    { row: s0[0], col: s0[1], color: 0 },
    { row: t0[0], col: t0[1], color: 0 },
    { row: s1[0], col: s1[1], color: 1 },
    { row: t1[0], col: t1[1], color: 1 },
  ];
  let profiles = [Array(rows).fill(EMPTY)];
  for (let col = 0; col < numCols; col++) {
    const seen = new Map();
    for (const profile of profiles) {
      for (const next of processColumn(profile, rows, col, numCols, terminals)) {
        seen.set(profileKey(next), next);
      }
    }
    profiles = [...seen.values()];
    if (profiles.length === 0) return false;
  }
  const emptyKey = profileKey(Array(rows).fill(EMPTY));
  return profiles.some((p) => profileKey(p) === emptyKey);
}

// ---------------------------------------------------------------------------
// Path construction: not just "is it feasible" but "show me the two paths".
// See the matching comment in plugdp.py for why this needs a second pass
// with backpointers rather than reusing isFeasible's deduplicated profiles.
// ---------------------------------------------------------------------------

function processColumnTracked(profileIn, rows, col, numCols, terminals) {
  let freshId = 0;
  for (const p of profileIn) {
    if (p.kind === "BRIDGE") {
      freshId = Math.max(freshId, p.fragment + 1);
    }
  }

  let branches = [[profileIn.slice(), null, freshId, []]];

  for (let row = 0; row < rows; row++) {
    const nextBranches = [];
    for (const [working, pendingIn, nextId, edges] of branches) {
      const left = ((col > 0) ? working[row] : "BOUNDARY");
      const up = ((row > 0) ? pendingIn : "BOUNDARY");
      const canRight = (col < (numCols - 1));
      const canDown = (row < (rows - 1));

      const termColor = terminalAt(terminals, row, col);
      const isTerminal = (termColor !== null);
      const budget = (isTerminal ? 1 : 2);

      const present = [left, up].filter((p) => { return (p !== "BOUNDARY") && (!isEmpty(p)) });
      const have = present.length;
      if (have > budget) { continue; }
      const need = budget - have;

      const available = [];
      if (canRight) { available.push("right"); }
      if (canDown) { available.push("down"); }
      if (need > available.length) { continue; }

      let combos = combinations(available, need);
      console.log("combos[r=", row,"]{avail:", available,",need:", need,"}:", combos);

      //for (const choice of combinations(available, need)) {
      for (const choice of combos) {
        const useRight = choice.includes("right");
        const useDown = choice.includes("down");
        for (const out of resolveCell(working, row, present, isTerminal, termColor, useRight, useDown, nextId)) {
          const [w, p, id] = out;
          nextBranches.push([w, p, id, edges.concat([[useRight, useDown]])]);
        }
      }
    }
    branches = nextBranches;
  }

  // profileKey -> {profile, edges}
  //
  const result = new Map();
  for (const [working, , , edges] of branches) {
    const canon = canonicalize(working);
    const key = profileKey(canon);
    if (!result.has(key)) { result.set(key, { profile: canon, edges }); }
  }
  return result;
}

function findPath(rows, numCols, s0, t0, s1, t1) {
  validateInput(rows, numCols, s0, t0, s1, t1);
  const terminals = [
    { row: s0[0], col: s0[1], color: 0 },
    { row: t0[0], col: t0[1], color: 0 },
    { row: s1[0], col: s1[1], color: 1 },
    { row: t1[0], col: t1[1], color: 1 },
  ];
  const initial = Array(rows).fill(EMPTY);


  let profiles = new Map([[profileKey(initial), initial]]);

  // history[col]: Map destKey -> {sourceProfile, edges}
  //
  const history = [];

  for (let col = 0; col < numCols; col++) {

    console.log("\n\n---\ncol:", col);
    console.log(profiles);

    const nextMap = new Map();
    for (const profile of profiles.values()) {
      let CT = processColumnTracked(profile, rows, col, numCols, terminals);

      console.log("  ct:");
      console.log("  ", CT);

      //for (const [destKey, { profile: dest, edges }] of processColumnTracked(profile, rows, col, numCols, terminals)) {
      for (const [destKey, { "profile": dest, "edges": edges }] of CT) {

        console.log("    ", destKey, profile, edges, dest);

        if (!nextMap.has(destKey)) {
          nextMap.set(destKey, { "sourceProfile": profile, "edges": edges, "profile": dest });
        }

      }
    }

    history.push(nextMap);
    profiles = new Map([...nextMap.entries()].map(([k, v]) => [k, v.profile]));
    if (profiles.size === 0) return null;
  }

  console.log("colN:");
  console.log(profiles);

  const finalKey = profileKey(Array(rows).fill(EMPTY));
  if (!profiles.has(finalKey)) return null;

  const edgeGrids = new Array(numCols);
  let currentKey = finalKey;
  for (let col = numCols - 1; col >= 0; col--) {
    const entry = history[col].get(currentKey);
    edgeGrids[col] = entry.edges;
    currentKey = profileKey(entry.sourceProfile);
  }

  const rightUsed = new Set();
  const downUsed = new Set();
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < rows; row++) {
      const [useRight, useDown] = edgeGrids[col][row];
      if (useRight) rightUsed.add(row + "," + col);
      if (useDown) downUsed.add(row + "," + col);
    }
  }

  function neighbors([r, c]) {
    const out = [];
    if (rightUsed.has(r + "," + c)) out.push([r, c + 1]);
    if (rightUsed.has(r + "," + (c - 1))) out.push([r, c - 1]);
    if (downUsed.has(r + "," + c)) out.push([r + 1, c]);
    if (downUsed.has((r - 1) + "," + c)) out.push([r - 1, c]);
    return out;
  }

  function trace(start, end) {
    const path = [start];
    let prev = null, cur = start;
    while (cur[0] !== end[0] || cur[1] !== end[1]) {
      const options = neighbors(cur).filter((n) => !prev || n[0] !== prev[0] || n[1] !== prev[1]);
      if (options.length === 0) return null; // would indicate a reconstruction bug
      prev = cur;
      cur = options[0];
      path.push(cur);
    }
    return path;
  }

  const path0 = trace(s0, t0);
  const path1 = trace(s1, t1);
  return [path0, path1];
}

function _print_instance(_row, _col, s0, t0, s1, t1) {
  let grid = [];
  for (let r=0; r<_row; r++) {
    let a = [];
    for (let c=0; c<_col; c++) {
      let ch = '.';
      if ((r == s0[0]) && (c == s0[1])) { ch='a'; }
      if ((r == t0[0]) && (c == t0[1])) { ch='A'; }
      if ((r == s1[0]) && (c == s1[1])) { ch='b'; }
      if ((r == t1[0]) && (c == t1[1])) { ch='B'; }
      a.push(ch);
    }
    grid.push(a);
  }

  for (let r=0; r<_row; r++) {
    console.log( grid[r].join("") );
  }
}

module.exports.findPath = findPath;
module.exports = { isFeasible, processColumn, EMPTY, canonicalize, profileKey };

if (require.main === module) {
  //console.log(isFeasible(3, 4, [0, 0], [1, 2], [0, 1], [2, 2]));
  //console.log(isFeasible(5, 6, [0, 0], [4, 5], [0, 5], [4, 0]));

  _print_instance(3, 4, [0, 0], [1, 2], [0, 1], [2, 2]);
  console.log(JSON.stringify(findPath(3, 4, [0, 0], [1, 2], [0, 1], [2, 2])));

  //_print_instance(3, 8, [0, 2], [2, 2], [0, 5], [2, 5]);
  //console.log(JSON.stringify(findPath(3, 8, [0, 2], [2, 2], [0, 5], [2, 5])));

}


