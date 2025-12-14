TODO
===

###### 2025-12-13

* bower speedups
  - for a 2R cut, only consider off-diagonal rectangles
    and bound by boundary end (`Je`) of rectangle sides
  - for a 2C cut, only consider three rectangles:
    + one diagonal past `Jf` cliff
    + off diagonal bounded by `Je` ends
* adit speedups?
  - worst case is tooth configuration
  - seems like the logic gets complicated to know
    what points to exclude a-priori
* DP viz
  - show sub-region, cut, and implication DAG

###### 2025-12-12

* refactor
  - ~simplify all the complex logic about cleave cuts, bridges, floats, etc.~
  - ~unless its actually illegal, let it pass~

function checklist:

* `RPRP_valid_cleave` (done, lightly tested)
* `RPRP_cleave_enumerate` (done, lightly tested)
* `RPRPCleaveProfile` (done, lightly tested)
* `RPRP_cleave_border` (done, lightly tested)
* `RPRP_quarry_info`  (done, untested)
* `RPRP_quarry_edge_ranges`  (done, untested)
* `RPRP_valid_R` (done, untested)
* `RPRP_point_in_region` (done, untested)
* `RPRP_enumerate_one_cut_adit_points` (done, untested)
* `RPRP_enumerate_quarry_side_region` (done, untested)
* `RPRP_candidate_bower` (!) (wip)
* `RPRP_MIRP` (!)

refactor is done.


###### 2025-12-10

* some confidence of working algorithm
  - needs more test cases
  - needs test script
  - clean up return value
  - I'm still iffy about the float tests
  - ~random tests~
  - it'd be nice to see if there's a minimum cut
    with a floating edge
* bower speedups
  - currently, bower enumeration lists all grid points,
    this can be optimized a great deal
  - the general strategy is to snake out somewhow from the adit
    point. There might be ways of excluding whole quadrents but
    I think some amount of snaking is necessary as it might involve
    some visibility tests
* DP viz
  - show catalogue of partitions and digraph thereof

###### 2025-12-05

* still need DP viz but we need a working alg first
* ~currently `data/mirp_err.json` is failing~
  - whatever this was was fixed many iterations ago
  - I think it's due to imporoper checking of
    valid quarry rectangle side partition ranges
    being valid (I know there's an error there, and
    some edge cases that need to be handled)
  - The base dp key is failing, I believe, so it
    should be looked into more


###### 2025-11-25

* visualization of DP array
  - want enumeration of regions, with highlighted region,
    cut, and edges between them
  - it's a dag so layout might be easy-ish
  - islands?
* test suite
  - move to data
  - get better expect mechanics
* interactive webapp

###### 2025-11-11

* (done) refactor
  - (done) Once we get out of the base representation, we really only want to
    work on grid points
  - (done) consolidate to `Js` structure
    + remove `Sx`, `Sy`, `Lx`, `Ly` structure
  - (done) Remove complex `Gv` structure in favor of something simpler:
    + `Gij` (ij -> id), `Gt` (type), `G` (idx -> ij), `Gxy` (idx -> xy)
  - (done) `Bij` (ij -> idx), `B` (idx -> ij), `Bt` (type), `Bxy` (idx -> xy)
  - (done) might as well keep `X` and `Y` structures
  - (done) `C` original bas data structure (idx -> ij)
    + `Ct` for type, `Cxy` (idx -> xy)

*2025-11-25*: refactoring has been done.
I'm still a little unhappy about the naming convention.
`Bij` is grid point to index but `B` is index to grid point.
It seems like it'd be better to have the `B` be the 2d array
of grid points to index and `Bij` map index to grid points.

That is, `B` is the base structure (2d, grid to index) and
the others are what it maps to (`Bij` index -> grid, `Bxy` index -> xy).

It's still a little confusing.
Maybe `ijB` which maps grid points to index?
`Bt` index to type?

This is a minor quibble. I'm leaving it unchanged for now.


###### 2025-11-09

* example test suite
  - bridge (4x directions)
  - float (4x directions)
  - parallel (4x directions)
* ~function to identify subregions cut from quarry side~
  - ~`Js` structure to walk the quarry side efficently~
