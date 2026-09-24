"""
Plug DP feasibility solver for k=2 zig-zag numberlink on an R-row strip,
for any R >= 1.

THE DATA
--------
A `Plug` describes what crosses one row of a vertical cut between two
columns. There are three kinds:

    EMPTY    nothing crosses this row
    ANCHOR   a path fragment that has already touched ONE of its two
             terminals crosses here (it still needs to reach the other one)
    BRIDGE   a path fragment that has touched NEITHER terminal yet crosses
             here; it has exactly one other end, also a BRIDGE plug
             somewhere else in the same profile, carrying the same
             (color, fragment) pair

A `Profile` is a tuple of R Plugs, one per row -- the entire state of the
sweep at one vertical cut. `fragment` is not a stable identity: it is
renumbered fresh every column (see `canonicalize`) and only ever needs to
distinguish BRIDGE pairs that are open AT THE SAME TIME -- at most
floor(R/2) of them, by a simple packing argument (each pair occupies 2 of
the R rows). For R=3 that bound is 1, which is why a fixed-width-3 version
of this code never needs more than a single fragment label; for R>=4 it's
a real possibility and the code below handles it the same way regardless
of R, with no special-casing.

THE ALGORITHM
-------------
Sweep columns left to right. Within a column, process its R cells top to
bottom. At each cell, combine what arrives from the LEFT (previous column)
and from UP (the row above, within this same column) to decide what goes
RIGHT (next column) and DOWN (next row), according to the cell's budget:
1 open edge if it's one of the four given terminals, 2 otherwise.

COST
----
This is exponential in R (the profile-state count grows like a weighted
Motzkin number, roughly 5^R) but only LINEAR in the number of columns,
since the profile set is capped at that R-dependent constant no matter how
many columns are swept. Practical for R up to roughly a dozen; not a
substitute for a solution polynomial in both dimensions.
"""

from enum import Enum
from dataclasses import dataclass
from itertools import combinations


class Kind(Enum):
    EMPTY = "empty"
    ANCHOR = "anchor"
    BRIDGE = "bridge"


@dataclass(frozen=True)
class Plug:
    kind: Kind
    color: int = -1     # 0 or 1; meaningless when kind is EMPTY
    fragment: int = -1  # meaningless unless kind is BRIDGE (see module docstring)


EMPTY = Plug(Kind.EMPTY)


def anchor(color):
    return Plug(Kind.ANCHOR, color)


def bridge(color, fragment):
    return Plug(Kind.BRIDGE, color, fragment)


def canonicalize(profile):
    """Renumber BRIDGE fragment labels by order of first appearance, so
    equivalent connectivity patterns compare equal as dict/set keys."""
    remap = {}
    out = []
    for plug in profile:
        if plug.kind != Kind.BRIDGE:
            out.append(plug)
            continue
        key = (plug.color, plug.fragment)
        if key not in remap:
            remap[key] = len(remap)
        out.append(bridge(plug.color, remap[key]))
    return tuple(out)


@dataclass(frozen=True)
class Terminal:
    row: int
    col: int
    color: int


def find_bridge_partner(working, exclude_row, color, fragment):
    """The other row (not `exclude_row`) currently holding a BRIDGE plug
    with the same (color, fragment) -- i.e. this fragment's other end."""
    for row, plug in enumerate(working):
        if row == exclude_row:
            continue
        if plug.kind == Kind.BRIDGE and plug.color == color and plug.fragment == fragment:
            return row
    return None


def terminal_at(terminals, row, col):
    for t in terminals:
        if t.row == row and t.col == col:
            return t.color
    return None


def process_column(profile_in, rows, col, num_cols, terminals):
    """Process one column's `rows` cells top to bottom. Returns the set of
    canonicalized profiles reachable after finishing this column."""
    # Any freshly-minted fragment id must not collide with one already in
    # use by the incoming profile, or two unrelated fragments could be
    # confused for one -- see module docstring on `fragment`.
    used = [p.fragment for p in profile_in if p.kind == Kind.BRIDGE]
    fresh_fragment_start = max(used, default=-1) + 1

    branches = [(list(profile_in), None, fresh_fragment_start)]

    for row in range(rows):
        next_branches = []
        for working, pending_in, next_id in branches:
            left = working[row] if col > 0 else "BOUNDARY"
            up = pending_in if row > 0 else "BOUNDARY"
            can_go_right = col < num_cols - 1
            can_go_down = row < rows - 1

            term_color = terminal_at(terminals, row, col)
            is_terminal = term_color is not None
            budget = 1 if is_terminal else 2

            present = [p for p in (left, up) if p not in ("BOUNDARY", EMPTY)]
            have = len(present)
            if have > budget:
                continue  # over budget already -- dead end
            need = budget - have

            available = (["right"] if can_go_right else []) + (["down"] if can_go_down else [])
            if need > len(available):
                continue  # not enough room to reach budget -- dead end

            for choice in combinations(available, need):
                use_right = "right" in choice
                use_down = "down" in choice
                for out_working, out_pending, out_id in _resolve_cell(
                    working, row, present, have, is_terminal, term_color,
                    use_right, use_down, next_id,
                ):
                    next_branches.append((out_working, out_pending, out_id))
        branches = next_branches

    return {canonicalize(tuple(working)) for working, _, _ in branches}


def _resolve_cell(working, row, present, have, is_terminal, term_color,
                   use_right, use_down, next_id):
    """Yields (new_working, new_pending, new_next_id) for every legal way
    to resolve one cell, given what's already decided about its LEFT/UP
    edges (`present`, `have`) and which of RIGHT/DOWN are newly activated."""

    def place(value):
        w = list(working)
        w[row] = value if use_right else EMPTY
        p = value if use_down else EMPTY
        return w, p, next_id

    if have == 0:
        if is_terminal:
            # A terminal with no incoming edge starts a brand new ANCHOR.
            yield place(anchor(term_color))
        else:
            # An ordinary cell with no incoming edge starts a brand new
            # BRIDGE fragment. Its color isn't determined by anything seen
            # so far -- try both.
            for color in (0, 1):
                frag = bridge(color, next_id)
                w = list(working)
                w[row] = frag if use_right else EMPTY
                p = frag if use_down else EMPTY
                yield w, p, next_id + 1

    elif have == 1:
        plug = present[0]
        if not use_right and not use_down:
            # Terminal consuming its one incoming edge -- must match color.
            if plug.color != term_color:
                return
            if plug.kind == Kind.ANCHOR:
                w = list(working)
                w[row] = EMPTY
                yield w, EMPTY, next_id  # CLOSES this color's path
            else:
                other = find_bridge_partner(working, row, plug.color, plug.fragment)
                if other is None:
                    return
                w = list(working)
                w[other] = anchor(plug.color)  # ANCHOR the fragment's other end
                w[row] = EMPTY
                yield w, EMPTY, next_id
        else:
            # Ordinary cell: the incoming plug just passes straight through.
            yield place(plug)

    else:  # have == 2
        if use_right or use_down:
            return  # budget already met by LEFT+UP alone
        p1, p2 = present
        if p1.color != p2.color:
            return  # one cell can't serve two different paths
        color = p1.color
        if p1.kind == Kind.ANCHOR and p2.kind == Kind.ANCHOR:
            w = list(working)
            w[row] = EMPTY
            yield w, EMPTY, next_id  # two tips of one path meet: CLOSES it
        elif p1.kind == Kind.ANCHOR or p2.kind == Kind.ANCHOR:
            frag_plug = p2 if p1.kind == Kind.ANCHOR else p1
            other = find_bridge_partner(working, row, color, frag_plug.fragment)
            if other is None:
                return
            w = list(working)
            w[other] = anchor(color)
            w[row] = EMPTY
            yield w, EMPTY, next_id
        else:
            if p1.fragment == p2.fragment:
                return  # would close a loop touching no terminal -- illegal
            row1 = find_bridge_partner(working, row, color, p1.fragment)
            row2 = find_bridge_partner(working, row, color, p2.fragment)
            if row1 is None or row2 is None:
                return
            w = list(working)
            new_frag = next_id
            w[row1] = bridge(color, new_frag)
            w[row2] = bridge(color, new_frag)
            w[row] = EMPTY
            yield w, EMPTY, next_id + 1


def _validate_input(rows, num_cols, s0, t0, s1, t1):
    """Raises ValueError for anything that would silently produce a wrong
    answer rather than a clean failure: out-of-bounds terminals, or
    terminals that aren't four distinct cells. (Reported bug: an
    out-of-bounds terminal is invisible to the sweep -- terminal_at never
    matches it -- so that whole color is silently never required to cover
    any cells, and the DP can report "feasible" using only the other
    color's path across the entire grid. That's wrong, not just unusual,
    so it must be rejected here rather than computed.)"""
    if rows < 1 or num_cols < 1:
        raise ValueError(f"rows and num_cols must be >= 1, got rows={rows}, num_cols={num_cols}")
    terminals = {"s0": s0, "t0": t0, "s1": s1, "t1": t1}
    for name, (r, c) in terminals.items():
        if not (0 <= r < rows and 0 <= c < num_cols):
            raise ValueError(
                f"{name}={(r, c)} is out of bounds for a {rows}x{num_cols} grid "
                f"(rows must be in 0..{rows - 1}, cols in 0..{num_cols - 1})"
            )
    if len({s0, t0, s1, t1}) != 4:
        raise ValueError(f"s0, t0, s1, t1 must be four distinct cells, got {terminals}")


def is_feasible(rows, num_cols, s0, t0, s1, t1):
    """rows >= 1. s0, t0, s1, t1 are (row, col) pairs, row in 0..rows-1."""
    _validate_input(rows, num_cols, s0, t0, s1, t1)
    terminals = [
        Terminal(s0[0], s0[1], 0), Terminal(t0[0], t0[1], 0),
        Terminal(s1[0], s1[1], 1), Terminal(t1[0], t1[1], 1),
    ]
    profiles = {(EMPTY,) * rows}
    for col in range(num_cols):
        next_profiles = set()
        for profile in profiles:
            next_profiles |= process_column(profile, rows, col, num_cols, terminals)
        profiles = next_profiles
        if not profiles:
            return False
    return (EMPTY,) * rows in profiles



# ---------------------------------------------------------------------------
# Path construction: not just "is it feasible" but "show me the two paths".
#
# The feasibility DP above deliberately throws away history -- profiles get
# deduplicated, so by design you can't tell which of several ways of
# reaching a profile actually happened. To reconstruct an explicit witness,
# we re-run the same sweep, but this time record, for every profile reached
# at every column, ONE (source profile, per-row edge choices) pair that
# produced it -- enough to walk backward afterward and recover the full set
# of grid edges used, then trace the two paths out of that edge set.
# ---------------------------------------------------------------------------

def _process_column_tracked(profile_in, rows, col, num_cols, terminals):
    """Like process_column, but also returns, for each resulting profile,
    the per-row (use_right, use_down) choices for THIS column that produced
    it -- one witness per profile, not all of them."""
    used = [p.fragment for p in profile_in if p.kind == Kind.BRIDGE]
    fresh_fragment_start = max(used, default=-1) + 1

    # branch: (working, pending, next_id, edges-so-far for rows done in this column)
    branches = [(list(profile_in), None, fresh_fragment_start, [])]

    for row in range(rows):
        next_branches = []
        for working, pending_in, next_id, edges in branches:
            left = working[row] if col > 0 else "BOUNDARY"
            up = pending_in if row > 0 else "BOUNDARY"
            can_go_right = col < num_cols - 1
            can_go_down = row < rows - 1

            term_color = terminal_at(terminals, row, col)
            is_terminal = term_color is not None
            budget = 1 if is_terminal else 2

            present = [p for p in (left, up) if p not in ("BOUNDARY", EMPTY)]
            have = len(present)
            if have > budget:
                continue
            need = budget - have

            available = (["right"] if can_go_right else []) + (["down"] if can_go_down else [])
            if need > len(available):
                continue

            for choice in combinations(available, need):
                use_right = "right" in choice
                use_down = "down" in choice
                for out_working, out_pending, out_id in _resolve_cell(
                    working, row, present, have, is_terminal, term_color,
                    use_right, use_down, next_id,
                ):
                    next_branches.append((out_working, out_pending, out_id, edges + [(use_right, use_down)]))
        branches = next_branches

    result = {}
    for working, _, _, edges in branches:
        canon = canonicalize(tuple(working))
        if canon not in result:  # keep the first witness found; any one will do
            result[canon] = edges
    return result


def find_path(rows, num_cols, s0, t0, s1, t1):
    """Like is_feasible, but on success returns (path0, path1) -- each an
    explicit list of (row, col) cells from its start terminal to its end
    terminal, covering every cell of the grid between the two paths with
    no overlap. Returns None if infeasible."""
    _validate_input(rows, num_cols, s0, t0, s1, t1)
    terminals = [
        Terminal(s0[0], s0[1], 0), Terminal(t0[0], t0[1], 0),
        Terminal(s1[0], s1[1], 1), Terminal(t1[0], t1[1], 1),
    ]
    initial = (EMPTY,) * rows
    profiles = {initial}
    history = []  # history[col]: dest_profile -> (source_profile, edge_record)

    for col in range(num_cols):
        next_map = {}
        for profile in profiles:
            for dest, edges in _process_column_tracked(profile, rows, col, num_cols, terminals).items():
                if dest not in next_map:
                    next_map[dest] = (profile, edges)
        history.append(next_map)
        profiles = set(next_map.keys())
        if not profiles:
            return None

    final = (EMPTY,) * rows
    if final not in profiles:
        return None

    # Walk backward through the history to recover which edges were used
    # in every column of the actual accepted sweep.
    edge_grids = [None] * num_cols
    current = final
    for col in range(num_cols - 1, -1, -1):
        source, edges = history[col][current]
        edge_grids[col] = edges
        current = source

    right_used = set()  # (r, c) means edge (r, c) - (r, c+1) is used
    down_used = set()   # (r, c) means edge (r, c) - (r+1, c) is used
    for col in range(num_cols):
        for row in range(rows):
            use_right, use_down = edge_grids[col][row]
            if use_right:
                right_used.add((row, col))
            if use_down:
                down_used.add((row, col))

    def neighbors(cell):
        r, c = cell
        out = []
        if (r, c) in right_used:
            out.append((r, c + 1))
        if (r, c - 1) in right_used:
            out.append((r, c - 1))
        if (r, c) in down_used:
            out.append((r + 1, c))
        if (r - 1, c) in down_used:
            out.append((r - 1, c))
        return out

    def trace(start, end):
        path = [start]
        prev, cur = None, start
        while cur != end:
            options = [n for n in neighbors(cur) if n != prev]
            if not options:
                return None  # would indicate a reconstruction bug
            prev, cur = cur, options[0]
            path.append(cur)
        return path

    path0 = trace(s0, t0)
    path1 = trace(s1, t1)
    return path0, path1

if __name__ == "__main__":
    #print(is_feasible(3, 4, (0, 0), (1, 2), (0, 1), (2, 2)))   # True
    #print(is_feasible(5, 6, (0, 0), (4, 5), (0, 5), (4, 0)))   # R=5 example
    #print(find_path(3, 4, (0, 0), (1, 2), (0, 1), (2, 2)))     # explicit witness
    print(find_path(10, 10, (1, 1), (9, 9), (0, 9), (9, 0)))     # explicit witness
