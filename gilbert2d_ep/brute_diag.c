// brute_diag.c
//
// Independent check: for every (s,t) pair on a w x h grid, does a path exist
// that visits every cell once, with unit steps except for exactly the number
// of diagonal steps required by color compatibility (0 or 1)?
//
// Prints one line per pair: "w h x0 y0 x1 y1 feasible|infeasible".
//
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

static int W, H, N, T, need;
static uint64_t full;

static int reach_ok(uint64_t vis, int cur) {
  uint64_t seen = (1ULL << cur), frontier = seen, unv = full & ~vis;
  while (frontier) {
    int c = __builtin_ctzll(frontier);
    frontier &= frontier - 1;
    int x = c % W, y = c / W;
    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      if (dx && dy && !need) continue;
      int nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      int n = ny * W + nx;
      uint64_t b = 1ULL << n;
      if ((unv & b) && !(seen & b)) { seen |= b; frontier |= b; }
    }
  }
  return ((seen & unv) == unv);
}

static int dfs(uint64_t vis, int cur, int cnt, int dused) {
  if (cnt == N) return (cur == T) && (dused == need);
  if (cur == T) return 0;
  if (!reach_ok(vis, cur)) return 0;
  if (!(vis & (1ULL << T)) == 0) return 0;
  int x = cur % W, y = cur / W;
  for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    int dg = (dx && dy);
    if (dg && (dused || !need)) continue;
    int nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
    int n = ny * W + nx;
    if (vis & (1ULL << n)) continue;
    if (dfs(vis | (1ULL << n), n, cnt + 1, dused + dg)) return 1;
  }
  return 0;
}

int main(int argc, char **argv) {
  W = atoi(argv[1]); H = atoi(argv[2]); N = W * H;
  full = (N == 64) ? ~0ULL : ((1ULL << N) - 1);
  for (int s = 0; s < N; s++) for (int t = 0; t < N; t++) {
    if (s == t) continue;
    int cs = (s % W + s / W) & 1, ct = (t % W + t / W) & 1, compat;
    compat = (N % 2 == 0) ? (cs != ct) : (cs == 0 && ct == 0);
    need = !compat;
    T = t;
    int ok = (N == 1) || dfs(1ULL << s, s, 1, 0);
    printf("%d %d %d %d %d %d %s\n", W, H, s % W, s / W, t % W, t / W, ok ? "feasible" : "infeasible");
  }
  return 0;
}
