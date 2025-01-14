Current Focus
---

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
* Gilbert curve
  - understand the algorithm
  - get at least the simple region flux, with directionality
