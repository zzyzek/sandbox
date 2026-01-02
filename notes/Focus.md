Current Focus
---

###### 2026-01-02

| Task | Priority | Effort | Notes |
|---|---|---|---|
| Gilbert paper | `f` | `9` | Vanilla algorithm only, try for bridges conference |
| Rectangular 2D $k=2$ zig-zag numberlink (R2K2-ZZN) | `b` | `d` | More general problem needed for st-Gilbert  |
| st-Gilbert | `a` | `9` | blocking on some type of R2K2-ZZN result |
| SWIFRNG | `a` | `a` | a.s. $O(n)$ relative neighborhood graph for random 3D points |
| MIRPRP Writeup | `9` | `b` | wait too long and we'll lose context |
| cloister and liminal interface method (POMS) | `8` | `c` | simple first, get some artifacts |
| Merrell Communication | `7` | `9` | |
| SGG HC and SGG s-t HP | `6` | `f` | Subsumed in this is SGG:HC writeup, RSGG:HP writeup and communication |
| Template optimizations (POMS) | `5` | `b` | Can't do larger models without it |
| West Hubbard | `3` | `a` | blocking on understanding external rays |


###### 2025-07-01

* ~Implement s-t Hamiltonian path on rectangular region by Itai, Szwarcfiter and Papadimitriou~
  - [paper](https://www.researchgate.net/publication/220616693_Hamilton_Paths_in_Grid_Graphs)
  - [rust implementation](https://github.com/whatsacomputertho/grid-solver/blob/main/doc/problem-specification.md)
* Try to use sthampath for (2d) Gilbert curve with arbitrary start/endpoints
* West Hubbard paper
* Space colonization algorithm (research and paper)

###### 2025-05-16

* Gilbert paper
  - ~submit PR of local gilbert copy with extenstions back to main repo~
    + ~get graphic of adaptive 3,5,4 for paper and PR~
    + ~move test script to appropriate location~
    + ~create readme with usage etc.~
  - ~add appendix graphics for eccentric split cases~
  - ~add corner case graphics~
  - ~edit~

###### 2025-01-14

* Block Path Consistency optimization
  - label regions as dirty
  - use the AC4Update to help
  - Sokoita is stalled on this optimization as
    it takes 4-5mins per choice on microban.6
* Add contradiction based weighting to cells
  - add a denominator to the cell/block region choice
    that gets incremented the more contradictions it encounters,
    maybe weighted by history
  - interesting to see if this helps Sokoita, simple path and/or
    Forest Micro
* Implement implied global constraint (IGC) additions
  - start with minesweeper (MS) for counts
    + consider using the binary representation to test
  - set inclusion and Sudoku (Su)
  - connectivity
    + start with 'simple' count and test out on small tile set
    + see if the binary representation works out
  - try to connect multiple for Drafts and Dragons (DnD)
* Start the warp weighting technique
* ~Gilbert curve~
  - ~understand the algorithm~
    - ~2d~, ~3d~
  - ~get at least the simple region flux, with directionality~


---

| Rating | Description |
|---|---|
| `0` | low |
| `1` | |
| `2` | |
| `3` | |
| `4` | |
| `5` | |
| `6` | |
| `7` | |
| `8` | |
| `9` | |
| `a` | |
| `b` | |
| `c` | |
| `d` | |
| `e` | |
| `f` | high |

