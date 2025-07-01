Current Focus
---

###### 2025-07-01

* Implement s-t Hamiltonian path on rectangular region by Itai, Szwarcfiter and Papadimitriou
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
