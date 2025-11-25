TODO
===

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
