TODO
===

###### 2025-11-11

* refactor
  - Once we get out of the base representation, we really only want to
    work on grid points
  - consolidate to `Js` structure
    + remove `Sx`, `Sy`, `Lx`, `Ly` structure
  - Remove complex `Gv` structure in favor of something simpler:
    + `Gij` (ij -> id), `Gt` (type), `G` (idx -> ij), `Gxy` (idx -> xy)
  - `Bij` (ij -> idx), `B` (idx -> ij), `Bt` (type), `Bxy` (idx -> xy)
  - might as well keep `X` and `Y` structures
  - `C` original bas data structure (idx -> ij)
    + `Ct` for type, `Cxy` (idx -> xy)


###### 2025-11-09

* example test suite
  - bridge (4x directions)
  - float (4x directions)
  - parallel (4x directions)
* ~function to identify subregions cut from quarry side~
  - ~`Js` structure to walk the quarry side efficently~
