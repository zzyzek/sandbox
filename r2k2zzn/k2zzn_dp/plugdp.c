/*
 * Plug DP feasibility solver for k=2 zig-zag numberlink on an R-row strip,
 * for any R >= 1 (up to MAX_ROWS, a compile-time ceiling below).
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
 * A Profile is R Plugs, one per row. `fragment` is renumbered fresh every
 * column (canonicalize) and only ever needs to distinguish BRIDGE pairs
 * open at the same time -- at most floor(R/2) of them.
 *
 * COST: exponential in R (profile-state count grows like a weighted
 * Motzkin number, ~5^R), linear in the number of columns. That state
 * count is why this file uses a real hash table for the profile set
 * (open addressing, grows as needed) rather than the linear-scan
 * membership check that's fine for a fixed R=3.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#define MAX_ROWS 24   /* compile-time ceiling; raise if you need more rows */

typedef enum { EMPTY, ANCHOR, BRIDGE } Kind;

typedef struct {
    Kind kind;
    int color;     /* 0 or 1; meaningless if kind == EMPTY */
    int fragment;  /* meaningless unless kind == BRIDGE */
} Plug;

typedef struct {
    Plug row[MAX_ROWS];  /* only the first `rows` entries are meaningful */
} Profile;

typedef struct {
    int row, col, color;
} Terminal;

static const Plug PLUG_EMPTY = { EMPTY, -1, -1 };

static Plug make_anchor(int color) {
    Plug p = { ANCHOR, color, -1 };
    return p;
}
static Plug make_bridge(int color, int fragment) {
    Plug p = { BRIDGE, color, fragment };
    return p;
}
static int plug_is_empty(Plug p) { return p.kind == EMPTY; }
static int plug_equal(Plug a, Plug b) {
    if (a.kind != b.kind) return 0;
    if (a.kind == EMPTY) return 1;
    if (a.kind == ANCHOR) return a.color == b.color;
    return a.color == b.color && a.fragment == b.fragment;
}
static int profile_equal(const Profile *a, const Profile *b, int rows) {
    for (int i = 0; i < rows; i++) if (!plug_equal(a->row[i], b->row[i])) return 0;
    return 1;
}

/* Renumber BRIDGE fragment labels by order of first appearance, so
   equivalent connectivity patterns compare equal. */
static Profile canonicalize(Profile p, int rows) {
    int remap_color[MAX_ROWS], remap_frag[MAX_ROWS], remap_count = 0;
    Profile out;
    for (int i = 0; i < rows; i++) {
        Plug plug = p.row[i];
        if (plug.kind != BRIDGE) { out.row[i] = plug; continue; }
        int found = -1;
        for (int j = 0; j < remap_count; j++)
            if (remap_color[j] == plug.color && remap_frag[j] == plug.fragment) { found = j; break; }
        if (found == -1) {
            found = remap_count;
            remap_color[remap_count] = plug.color;
            remap_frag[remap_count] = plug.fragment;
            remap_count++;
        }
        out.row[i] = make_bridge(plug.color, found);
    }
    return out;
}

static int terminal_at(const Terminal *terms, int n, int row, int col) {
    for (int i = 0; i < n; i++)
        if (terms[i].row == row && terms[i].col == col) return terms[i].color;
    return -1;
}

static int find_bridge_partner(const Plug *working, int exclude_row, int rows, int color, int fragment) {
    for (int row = 0; row < rows; row++) {
        if (row == exclude_row) continue;
        Plug p = working[row];
        if (p.kind == BRIDGE && p.color == color && p.fragment == fragment) return row;
    }
    return -1;
}

/* ---------- a small open-addressing hash set of Profiles ---------- */

typedef struct {
    Profile *slots;
    char *occupied;
    int capacity;
    int count;
    int rows;
} ProfileSet;

static uint64_t plug_code(Plug p) {
    /* pack (kind, color, fragment) into one non-negative int; fragment is
       always < rows <= MAX_ROWS so (MAX_ROWS+2) is a safe stride */
    return (uint64_t)((p.kind * 4 + (p.color + 1)) * (MAX_ROWS + 2) + (p.fragment + 1));
}
static uint64_t profile_hash(const Profile *p, int rows) {
    uint64_t h = 1469598103934665603ULL; /* FNV-1a */
    for (int i = 0; i < rows; i++) {
        h ^= plug_code(p->row[i]);
        h *= 1099511628211ULL;
    }
    return h;
}

static void profile_set_init(ProfileSet *s, int rows, int capacity) {
    s->rows = rows;
    s->capacity = capacity < 8 ? 8 : capacity;
    s->count = 0;
    s->slots = calloc(s->capacity, sizeof(Profile));
    s->occupied = calloc(s->capacity, sizeof(char));
}
static void profile_set_free(ProfileSet *s) {
    free(s->slots);
    free(s->occupied);
}
static int profile_set_add(ProfileSet *s, Profile p); /* fwd decl */

static void profile_set_grow(ProfileSet *s) {
    int old_capacity = s->capacity;
    Profile *old_slots = s->slots;
    char *old_occupied = s->occupied;
    s->capacity *= 2;
    s->slots = calloc(s->capacity, sizeof(Profile));
    s->occupied = calloc(s->capacity, sizeof(char));
    s->count = 0;
    for (int i = 0; i < old_capacity; i++)
        if (old_occupied[i]) profile_set_add(s, old_slots[i]);
    free(old_slots);
    free(old_occupied);
}

/* Returns 1 if newly added, 0 if already present. */
static int profile_set_add(ProfileSet *s, Profile p) {
    if (s->count * 2 >= s->capacity) profile_set_grow(s);
    uint64_t h = profile_hash(&p, s->rows);
    int idx = (int)(h % (uint64_t)s->capacity);
    while (s->occupied[idx]) {
        if (profile_equal(&s->slots[idx], &p, s->rows)) return 0;
        idx = (idx + 1) % s->capacity;
    }
    s->slots[idx] = p;
    s->occupied[idx] = 1;
    s->count++;
    return 1;
}

/* ---------- a small growable array of Branches ---------- */

typedef struct {
    Plug working[MAX_ROWS];
    Plug pending;
    int next_id;
} Branch;

typedef struct {
    Branch *items;
    int count;
    int capacity;
} BranchList;

static void branch_list_init(BranchList *bl, int capacity) {
    bl->count = 0;
    bl->capacity = capacity < 8 ? 8 : capacity;
    bl->items = malloc(sizeof(Branch) * bl->capacity);
}
static void branch_list_free(BranchList *bl) { free(bl->items); }
static void branch_list_push(BranchList *bl, Branch b) {
    if (bl->count == bl->capacity) {
        bl->capacity *= 2;
        bl->items = realloc(bl->items, sizeof(Branch) * bl->capacity);
    }
    bl->items[bl->count++] = b;
}

/* Appends every legal resolution of one cell to `out`. */
static void resolve_cell(const Plug *working, int rows, int row, const Plug *present, int have,
                          int is_terminal, int term_color,
                          int use_right, int use_down, int next_id,
                          BranchList *out) {
    if (have == 0) {
        if (is_terminal) {
            Plug value = make_anchor(term_color);
            Branch b;
            memcpy(b.working, working, sizeof(Plug) * rows);
            b.working[row] = use_right ? value : PLUG_EMPTY;
            b.pending = use_down ? value : PLUG_EMPTY;
            b.next_id = next_id;
            branch_list_push(out, b);
        } else {
            for (int color = 0; color <= 1; color++) {
                Plug frag = make_bridge(color, next_id);
                Branch b;
                memcpy(b.working, working, sizeof(Plug) * rows);
                b.working[row] = use_right ? frag : PLUG_EMPTY;
                b.pending = use_down ? frag : PLUG_EMPTY;
                b.next_id = next_id + 1;
                branch_list_push(out, b);
            }
        }
    } else if (have == 1) {
        Plug plug = present[0];
        if (!use_right && !use_down) {
            if (plug.color != term_color) return;
            Branch b;
            memcpy(b.working, working, sizeof(Plug) * rows);
            if (plug.kind == ANCHOR) {
                b.working[row] = PLUG_EMPTY;
            } else {
                int other = find_bridge_partner(working, row, rows, plug.color, plug.fragment);
                if (other == -1) return;
                b.working[other] = make_anchor(plug.color);
                b.working[row] = PLUG_EMPTY;
            }
            b.pending = PLUG_EMPTY; b.next_id = next_id;
            branch_list_push(out, b);
        } else {
            Branch b;
            memcpy(b.working, working, sizeof(Plug) * rows);
            b.working[row] = use_right ? plug : PLUG_EMPTY;
            b.pending = use_down ? plug : PLUG_EMPTY;
            b.next_id = next_id;
            branch_list_push(out, b);
        }
    } else { /* have == 2 */
        Plug p1 = present[0], p2 = present[1];
        if (p1.color != p2.color) return;
        int color = p1.color;
        Branch b;
        memcpy(b.working, working, sizeof(Plug) * rows);
        b.pending = PLUG_EMPTY;
        if (p1.kind == ANCHOR && p2.kind == ANCHOR) {
            b.working[row] = PLUG_EMPTY;
            b.next_id = next_id;
            branch_list_push(out, b);
        } else if (p1.kind == ANCHOR || p2.kind == ANCHOR) {
            Plug frag_plug = (p1.kind == ANCHOR) ? p2 : p1;
            int other = find_bridge_partner(working, row, rows, color, frag_plug.fragment);
            if (other == -1) return;
            b.working[other] = make_anchor(color);
            b.working[row] = PLUG_EMPTY;
            b.next_id = next_id;
            branch_list_push(out, b);
        } else {
            if (p1.fragment == p2.fragment) return; /* would close a loop touching no terminal */
            int row1 = find_bridge_partner(working, row, rows, color, p1.fragment);
            int row2 = find_bridge_partner(working, row, rows, color, p2.fragment);
            if (row1 == -1 || row2 == -1) return;
            int new_frag = next_id;
            b.working[row1] = make_bridge(color, new_frag);
            b.working[row2] = make_bridge(color, new_frag);
            b.working[row] = PLUG_EMPTY;
            b.next_id = next_id + 1;
            branch_list_push(out, b);
        }
    }
}

/* Processes one column's `rows` cells top to bottom. Adds every
   canonicalized profile reachable after finishing this column into
   `out_set` (already-present ones are silently skipped by the set). */
static void process_column(Profile profile_in, int rows, int col, int num_cols,
                            const Terminal *terms, int n_terms,
                            ProfileSet *out_set) {
    int fresh_id = 0;
    for (int i = 0; i < rows; i++)
        if (profile_in.row[i].kind == BRIDGE && profile_in.row[i].fragment + 1 > fresh_id)
            fresh_id = profile_in.row[i].fragment + 1;

    BranchList branches, next_branches;
    branch_list_init(&branches, 16);
    branch_list_init(&next_branches, 16);

    Branch start;
    memcpy(start.working, profile_in.row, sizeof(Plug) * rows);
    start.pending = PLUG_EMPTY;
    start.next_id = fresh_id;
    branch_list_push(&branches, start);

    for (int row = 0; row < rows; row++) {
        next_branches.count = 0;
        for (int bi = 0; bi < branches.count; bi++) {
            Branch *br = &branches.items[bi];
            int left_is_boundary = (col == 0);
            int up_is_boundary = (row == 0);
            Plug left = left_is_boundary ? PLUG_EMPTY : br->working[row];
            Plug up = up_is_boundary ? PLUG_EMPTY : br->pending;

            int can_right = col < num_cols - 1;
            int can_down = row < rows - 1;
            int term_color = terminal_at(terms, n_terms, row, col);
            int is_terminal = term_color != -1;
            int budget = is_terminal ? 1 : 2;

            Plug present[2]; int have = 0;
            if (!left_is_boundary && !plug_is_empty(left)) present[have++] = left;
            if (!up_is_boundary && !plug_is_empty(up)) present[have++] = up;
            if (have > budget) continue;
            int need = budget - have;

            int avail[2], n_avail = 0;
            if (can_right) avail[n_avail++] = 0;
            if (can_down) avail[n_avail++] = 1;
            if (need > n_avail) continue;

            int n_choices = 0;
            int choice_right[2], choice_down[2];
            if (need == 0) {
                choice_right[0] = 0; choice_down[0] = 0; n_choices = 1;
            } else if (need == 1) {
                for (int k = 0; k < n_avail; k++) {
                    choice_right[n_choices] = (avail[k] == 0);
                    choice_down[n_choices] = (avail[k] == 1);
                    n_choices++;
                }
            } else {
                choice_right[0] = 1; choice_down[0] = 1; n_choices = 1;
            }

            for (int c = 0; c < n_choices; c++) {
                resolve_cell(br->working, rows, row, present, have, is_terminal, term_color,
                             choice_right[c], choice_down[c], br->next_id, &next_branches);
            }
        }
        BranchList tmp = branches; branches = next_branches; next_branches = tmp;
    }

    for (int bi = 0; bi < branches.count; bi++) {
        Profile p;
        memcpy(p.row, branches.items[bi].working, sizeof(Plug) * rows);
        p = canonicalize(p, rows);
        profile_set_add(out_set, p);
    }

    branch_list_free(&branches);
    branch_list_free(&next_branches);
}

/* Returns 1 if valid, 0 and prints an error to stderr if not. An
   out-of-bounds terminal would otherwise be invisible to the sweep (see
   the matching comment in plugdp.py) and let the DP report "feasible"
   wrongly, using only the other color across the whole grid -- so this
   is rejected here rather than computed. */
static int validate_input(int rows, int num_cols, int s0r, int s0c, int t0r, int t0c,
                           int s1r, int s1c, int t1r, int t1c) {
    if (rows < 1 || num_cols < 1) {
        fprintf(stderr, "invalid: rows and num_cols must be >= 1, got rows=%d num_cols=%d\n", rows, num_cols);
        return 0;
    }
    int pts[4][3] = { {s0r, s0c, 0}, {t0r, t0c, 0}, {s1r, s1c, 1}, {t1r, t1c, 1} };
    const char *names[4] = { "s0", "t0", "s1", "t1" };
    for (int i = 0; i < 4; i++) {
        int r = pts[i][0], c = pts[i][1];
        if (!(r >= 0 && r < rows && c >= 0 && c < num_cols)) {
            fprintf(stderr, "invalid: %s=(%d,%d) is out of bounds for a %dx%d grid "
                            "(rows must be in 0..%d, cols in 0..%d)\n",
                    names[i], r, c, rows, num_cols, rows - 1, num_cols - 1);
            return 0;
        }
    }
    for (int i = 0; i < 4; i++)
        for (int j = i + 1; j < 4; j++)
            if (pts[i][0] == pts[j][0] && pts[i][1] == pts[j][1]) {
                fprintf(stderr, "invalid: %s and %s are the same cell (%d,%d); "
                                "s0,t0,s1,t1 must be four distinct cells\n",
                        names[i], names[j], pts[i][0], pts[i][1]);
                return 0;
            }
    return 1;
}

int is_feasible(int rows, int num_cols, int s0r, int s0c, int t0r, int t0c,
                 int s1r, int s1c, int t1r, int t1c) {
    if (!validate_input(rows, num_cols, s0r, s0c, t0r, t0c, s1r, s1c, t1r, t1c)) return -1;
    Terminal terms[4] = {
        { s0r, s0c, 0 }, { t0r, t0c, 0 }, { s1r, s1c, 1 }, { t1r, t1c, 1 }
    };

    ProfileSet cur, next;
    profile_set_init(&cur, rows, 16);
    profile_set_init(&next, rows, 16);

    Profile start;
    for (int i = 0; i < rows; i++) start.row[i] = PLUG_EMPTY;
    profile_set_add(&cur, start);

    int feasible = 0;
    for (int col = 0; col < num_cols; col++) {
        next.count = 0;
        memset(next.occupied, 0, next.capacity);
        for (int i = 0; i < cur.capacity; i++) {
            if (!cur.occupied[i]) continue;
            process_column(cur.slots[i], rows, col, num_cols, terms, 4, &next);
        }
        ProfileSet tmp = cur; cur = next; next = tmp;
        if (cur.count == 0) { feasible = 0; goto done; }
    }
    {
        Profile all_empty;
        for (int i = 0; i < rows; i++) all_empty.row[i] = PLUG_EMPTY;
        for (int i = 0; i < cur.capacity; i++)
            if (cur.occupied[i] && profile_equal(&cur.slots[i], &all_empty, rows)) { feasible = 1; break; }
    }
done:
    profile_set_free(&cur);
    profile_set_free(&next);
    return feasible;
}

#ifdef PLUGDP_TEST_MAIN
/* ------------------------------------------------------------------- */
/* Path construction: not just "is it feasible" but "show me the two   */
/* paths". See the matching comment in plugdp.py for why this needs a  */
/* second pass with backpointers rather than reusing is_feasible's     */
/* deduplicated profiles.                                              */
/* ------------------------------------------------------------------- */
#endif

typedef struct {
    int use_right;
    int use_down;
} EdgeChoice;

typedef struct {
    Plug working[MAX_ROWS];
    Plug pending;
    int next_id;
    EdgeChoice edges[MAX_ROWS];  /* entries [0, row) are meaningful mid-column */
} TrackedBranch;

typedef struct {
    TrackedBranch *items;
    int count;
    int capacity;
} TrackedBranchList;

static void tbranch_list_init(TrackedBranchList *bl, int capacity) {
    bl->count = 0;
    bl->capacity = capacity < 8 ? 8 : capacity;
    bl->items = malloc(sizeof(TrackedBranch) * bl->capacity);
}
static void tbranch_list_free(TrackedBranchList *bl) { free(bl->items); }
static void tbranch_list_push(TrackedBranchList *bl, TrackedBranch b) {
    if (bl->count == bl->capacity) {
        bl->capacity *= 2;
        bl->items = realloc(bl->items, sizeof(TrackedBranch) * bl->capacity);
    }
    bl->items[bl->count++] = b;
}

/* A HistEntry maps one profile (the key) to the source profile and the
   per-row edge choices that produced it in one column -- one witness per
   profile, not all of them (any one is enough to reconstruct a path). */
typedef struct {
    Profile profile;
    Profile source;
    EdgeChoice edges[MAX_ROWS];
} HistEntry;

typedef struct {
    HistEntry *slots;
    char *occupied;
    int capacity;
    int count;
    int rows;
} HistMap;

static void hist_map_init(HistMap *m, int rows, int capacity) {
    m->rows = rows;
    m->capacity = capacity < 8 ? 8 : capacity;
    m->count = 0;
    m->slots = calloc(m->capacity, sizeof(HistEntry));
    m->occupied = calloc(m->capacity, sizeof(char));
}
static void hist_map_free(HistMap *m) {
    free(m->slots);
    free(m->occupied);
}
static int hist_map_add(HistMap *m, Profile profile, Profile source, const EdgeChoice *edges);

static void hist_map_grow(HistMap *m) {
    int old_capacity = m->capacity;
    HistEntry *old_slots = m->slots;
    char *old_occupied = m->occupied;
    m->capacity *= 2;
    m->slots = calloc(m->capacity, sizeof(HistEntry));
    m->occupied = calloc(m->capacity, sizeof(char));
    m->count = 0;
    for (int i = 0; i < old_capacity; i++)
        if (old_occupied[i]) hist_map_add(m, old_slots[i].profile, old_slots[i].source, old_slots[i].edges);
    free(old_slots);
    free(old_occupied);
}

/* Returns 1 if newly inserted, 0 if this profile was already present
   (in which case the existing witness is kept -- any one witness will do). */
static int hist_map_add(HistMap *m, Profile profile, Profile source, const EdgeChoice *edges) {
    if (m->count * 2 >= m->capacity) hist_map_grow(m);
    uint64_t h = profile_hash(&profile, m->rows);
    int idx = (int)(h % (uint64_t)m->capacity);
    while (m->occupied[idx]) {
        if (profile_equal(&m->slots[idx].profile, &profile, m->rows)) return 0;
        idx = (idx + 1) % m->capacity;
    }
    m->slots[idx].profile = profile;
    m->slots[idx].source = source;
    memcpy(m->slots[idx].edges, edges, sizeof(EdgeChoice) * m->rows);
    m->occupied[idx] = 1;
    m->count++;
    return 1;
}

static HistEntry *hist_map_find(HistMap *m, Profile profile) {
    if (m->capacity == 0) return NULL;
    uint64_t h = profile_hash(&profile, m->rows);
    int idx = (int)(h % (uint64_t)m->capacity);
    int start = idx;
    while (m->occupied[idx]) {
        if (profile_equal(&m->slots[idx].profile, &profile, m->rows)) return &m->slots[idx];
        idx = (idx + 1) % m->capacity;
        if (idx == start) break;
    }
    return NULL;
}

/* Same sweep as process_column, but building a HistMap (dest profile ->
   source profile + this column's edge choices) instead of a plain
   ProfileSet -- reuses resolve_cell unchanged and just carries the edge
   record alongside. */
static void process_column_tracked(Profile profile_in, int rows, int col, int num_cols,
                                    const Terminal *terms, int n_terms,
                                    HistMap *out_map) {
    int fresh_id = 0;
    for (int i = 0; i < rows; i++)
        if (profile_in.row[i].kind == BRIDGE && profile_in.row[i].fragment + 1 > fresh_id)
            fresh_id = profile_in.row[i].fragment + 1;

    TrackedBranchList branches, next_branches;
    tbranch_list_init(&branches, 16);
    tbranch_list_init(&next_branches, 16);

    TrackedBranch start;
    memcpy(start.working, profile_in.row, sizeof(Plug) * rows);
    start.pending = PLUG_EMPTY;
    start.next_id = fresh_id;
    tbranch_list_push(&branches, start);

    for (int row = 0; row < rows; row++) {
        next_branches.count = 0;
        for (int bi = 0; bi < branches.count; bi++) {
            TrackedBranch *tbr = &branches.items[bi];
            int left_is_boundary = (col == 0);
            int up_is_boundary = (row == 0);
            Plug left = left_is_boundary ? PLUG_EMPTY : tbr->working[row];
            Plug up = up_is_boundary ? PLUG_EMPTY : tbr->pending;

            int can_right = col < num_cols - 1;
            int can_down = row < rows - 1;
            int term_color = terminal_at(terms, n_terms, row, col);
            int is_terminal = term_color != -1;
            int budget = is_terminal ? 1 : 2;

            Plug present[2]; int have = 0;
            if (!left_is_boundary && !plug_is_empty(left)) present[have++] = left;
            if (!up_is_boundary && !plug_is_empty(up)) present[have++] = up;
            if (have > budget) continue;
            int need = budget - have;

            int avail[2], n_avail = 0;
            if (can_right) avail[n_avail++] = 0;
            if (can_down) avail[n_avail++] = 1;
            if (need > n_avail) continue;

            int n_choices = 0;
            int choice_right[2], choice_down[2];
            if (need == 0) {
                choice_right[0] = 0; choice_down[0] = 0; n_choices = 1;
            } else if (need == 1) {
                for (int k = 0; k < n_avail; k++) {
                    choice_right[n_choices] = (avail[k] == 0);
                    choice_down[n_choices] = (avail[k] == 1);
                    n_choices++;
                }
            } else {
                choice_right[0] = 1; choice_down[0] = 1; n_choices = 1;
            }

            for (int c = 0; c < n_choices; c++) {
                BranchList tmp_out;
                branch_list_init(&tmp_out, 4);
                resolve_cell(tbr->working, rows, row, present, have, is_terminal, term_color,
                             choice_right[c], choice_down[c], tbr->next_id, &tmp_out);
                for (int r = 0; r < tmp_out.count; r++) {
                    TrackedBranch nb;
                    memcpy(nb.working, tmp_out.items[r].working, sizeof(Plug) * rows);
                    nb.pending = tmp_out.items[r].pending;
                    nb.next_id = tmp_out.items[r].next_id;
                    memcpy(nb.edges, tbr->edges, sizeof(EdgeChoice) * row); /* rows done so far */
                    nb.edges[row].use_right = choice_right[c];
                    nb.edges[row].use_down = choice_down[c];
                    tbranch_list_push(&next_branches, nb);
                }
                branch_list_free(&tmp_out);
            }
        }
        TrackedBranchList t = branches; branches = next_branches; next_branches = t;
    }

    for (int bi = 0; bi < branches.count; bi++) {
        Profile p;
        memcpy(p.row, branches.items[bi].working, sizeof(Plug) * rows);
        p = canonicalize(p, rows);
        hist_map_add(out_map, p, profile_in, branches.items[bi].edges);
    }

    tbranch_list_free(&branches);
    tbranch_list_free(&next_branches);
}

typedef struct {
    int (*cells)[2];
    int length;
} Path;

void path_free(Path *p) { free(p->cells); }

/* Returns 1 if feasible (and fills *path0, *path1), 0 if infeasible,
   -1 if the input itself was invalid (see validate_input). */
int find_path(int rows, int num_cols, int s0r, int s0c, int t0r, int t0c,
              int s1r, int s1c, int t1r, int t1c, Path *path0, Path *path1) {
    if (!validate_input(rows, num_cols, s0r, s0c, t0r, t0c, s1r, s1c, t1r, t1c)) return -1;
    Terminal terms[4] = {
        { s0r, s0c, 0 }, { t0r, t0c, 0 }, { s1r, s1c, 1 }, { t1r, t1c, 1 }
    };

    HistMap *history = malloc(sizeof(HistMap) * num_cols);
    ProfileSet cur;
    profile_set_init(&cur, rows, 16);
    Profile start;
    for (int i = 0; i < rows; i++) start.row[i] = PLUG_EMPTY;
    profile_set_add(&cur, start);

    int feasible = 1;
    for (int col = 0; col < num_cols; col++) {
        hist_map_init(&history[col], rows, 16);
        for (int i = 0; i < cur.capacity; i++) {
            if (!cur.occupied[i]) continue;
            process_column_tracked(cur.slots[i], rows, col, num_cols, terms, 4, &history[col]);
        }
        ProfileSet next;
        profile_set_init(&next, rows, 16);
        for (int i = 0; i < history[col].capacity; i++)
            if (history[col].occupied[i]) profile_set_add(&next, history[col].slots[i].profile);
        profile_set_free(&cur);
        cur = next;
        if (cur.count == 0) { feasible = 0; for (int c2 = 0; c2 <= col; c2++) hist_map_free(&history[c2]); free(history); return 0; }
    }

    Profile all_empty;
    for (int i = 0; i < rows; i++) all_empty.row[i] = PLUG_EMPTY;
    int found_final = 0;
    for (int i = 0; i < cur.capacity; i++)
        if (cur.occupied[i] && profile_equal(&cur.slots[i], &all_empty, rows)) { found_final = 1; break; }
    profile_set_free(&cur);
    if (!found_final) {
        for (int c2 = 0; c2 < num_cols; c2++) hist_map_free(&history[c2]);
        free(history);
        return 0;
    }

    /* Walk backward to recover which edges were used in every column. */
    EdgeChoice (*edge_grid)[MAX_ROWS] = malloc(sizeof(EdgeChoice[MAX_ROWS]) * num_cols);
    Profile current = all_empty;
    for (int col = num_cols - 1; col >= 0; col--) {
        HistEntry *e = hist_map_find(&history[col], current);
        memcpy(edge_grid[col], e->edges, sizeof(EdgeChoice) * rows);
        current = e->source;
    }
    for (int c2 = 0; c2 < num_cols; c2++) hist_map_free(&history[c2]);
    free(history);

    /* right_flat[r*num_cols+c]: edge (r,c)-(r,c+1) used. down_flat: edge (r,c)-(r+1,c) used. */
    char *right_flat = calloc((size_t)rows * num_cols, 1);
    char *down_flat = calloc((size_t)rows * num_cols, 1);
    for (int col = 0; col < num_cols; col++) {
        for (int row = 0; row < rows; row++) {
            if (edge_grid[col][row].use_right) right_flat[row * num_cols + col] = 1;
            if (edge_grid[col][row].use_down) down_flat[row * num_cols + col] = 1;
        }
    }
    free(edge_grid);

    #define IDX(r, c) ((r) * num_cols + (c))
    int total_cells = rows * num_cols;

    Path *paths[2] = { path0, path1 };
    int starts[2][2] = { { s0r, s0c }, { s1r, s1c } };
    int ends[2][2] = { { t0r, t0c }, { t1r, t1c } };

    for (int which = 0; which < 2; which++) {
        int (*cells)[2] = malloc(sizeof(int[2]) * total_cells);
        int len = 0;
        int pr = -1, pc = -1;
        int cr = starts[which][0], cc = starts[which][1];
        cells[len][0] = cr; cells[len][1] = cc; len++;
        while (!(cr == ends[which][0] && cc == ends[which][1])) {
            int nr = -1, nc = -1;
            if (right_flat[IDX(cr, cc)] && !(cr == pr && cc + 1 == pc)) { nr = cr; nc = cc + 1; }
            else if (cc > 0 && right_flat[IDX(cr, cc - 1)] && !(cr == pr && cc - 1 == pc)) { nr = cr; nc = cc - 1; }
            else if (down_flat[IDX(cr, cc)] && !(cr + 1 == pr && cc == pc)) { nr = cr + 1; nc = cc; }
            else if (cr > 0 && down_flat[IDX(cr - 1, cc)] && !(cr - 1 == pr && cc == pc)) { nr = cr - 1; nc = cc; }
            if (nr == -1) { free(cells); free(right_flat); free(down_flat); return 0; } /* reconstruction bug */
            pr = cr; pc = cc; cr = nr; cc = nc;
            cells[len][0] = cr; cells[len][1] = cc; len++;
        }
        paths[which]->cells = cells;
        paths[which]->length = len;
    }
    #undef IDX

    free(right_flat);
    free(down_flat);
    return feasible;
}

#ifdef PLUGDP_TEST_MAIN
int main(int argc, char **argv) {
    if (argc > 1 && strcmp(argv[1], "--selftest") == 0) {
        FILE *f = fopen(argv[2], "r");
        int n;
        if (fscanf(f, "%d", &n) != 1) return 1;
        int checked = 0, dis = 0;
        for (int i = 0; i < n; i++) {
            int R, C, s0r, s0c, t0r, t0c, s1r, s1c, t1r, t1c, expected;
            if (fscanf(f, "%d %d %d %d %d %d %d %d %d %d %d",
                       &R, &C, &s0r, &s0c, &t0r, &t0c, &s1r, &s1c, &t1r, &t1c, &expected) != 11) break;
            int got = is_feasible(R, C, s0r, s0c, t0r, t0c, s1r, s1c, t1r, t1c);
            checked++;
            if (got != expected) {
                dis++;
                printf("DISAGREE R=%d C=%d s0=(%d,%d) t0=(%d,%d) s1=(%d,%d) t1=(%d,%d) got=%d expected=%d\n",
                       R, C, s0r, s0c, t0r, t0c, s1r, s1c, t1r, t1c, got, expected);
            }
        }
        printf("checked %d, disagreements %d\n", checked, dis);
        fclose(f);
        return dis == 0 ? 0 : 1;
    }
    if (argc == 11) {
        int R = atoi(argv[1]), C = atoi(argv[2]);
        int v[8];
        for (int i = 0; i < 8; i++) v[i] = atoi(argv[3 + i]);
        Path p0, p1;
        int feas = find_path(R, C, v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], &p0, &p1);
        if (feas < 0) return 1; /* validate_input already printed why */
        printf("%d\n", feas);
        if (feas) {
            printf("path0:");
            for (int i = 0; i < p0.length; i++) printf(" (%d,%d)", p0.cells[i][0], p0.cells[i][1]);
            printf("\npath1:");
            for (int i = 0; i < p1.length; i++) printf(" (%d,%d)", p1.cells[i][0], p1.cells[i][1]);
            printf("\n");
            path_free(&p0); path_free(&p1);
        }
        return 0;
    }
    printf("Usage: %s rows num_cols s0r s0c t0r t0c s1r s1c t1r t1c\n", argv[0]);
    printf("Example: %s 3 4 0 0 1 2 0 1 2 2\n", argv[0]);
    {
        Path p0, p1;
        int feas = find_path(3, 4, 0, 0, 1, 2, 0, 1, 2, 2, &p0, &p1);
        printf("  feasible=%d\n", feas);
        if (feas) {
            printf("  path0:");
            for (int i = 0; i < p0.length; i++) printf(" (%d,%d)", p0.cells[i][0], p0.cells[i][1]);
            printf("\n  path1:");
            for (int i = 0; i < p1.length; i++) printf(" (%d,%d)", p1.cells[i][0], p1.cells[i][1]);
            printf("\n");
            path_free(&p0); path_free(&p1);
        }
    }
    return 0;
}
#endif
