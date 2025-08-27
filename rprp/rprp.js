// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// The main structure is the graph_ctx:
//
// {
//   C : <array of boundary points in ccw order>
//   Ct : <array of types of boundary bounts>
//     'c' : convex (relative inward)
//     'r' : reflex (concave, relative inward)
//   G : <array of grid points>
//   Gt : <array of grid point types>
//     'c' : original boundary point
//     'b' : point on edge, on boundary but not in C
//     'i' : interior point
//   X : <array of x coordinates of grid points (domain)>
//   Y : <array of y coordinates of grid points (domain)>
//     note that some combinats of points from X,Y will not be a grid point
//   dualG: <2D array structures of simple rectangles, including inadmissible rectangles>
//     {
//       ixy : x,y index of point
//       G_idx: index of point in G array
//       id : rectangle identifier
//         >= 0 and unique of rectangle is admissible
//         -1 if rectangle is inadmissible
//       R : four x,y points that define the rectangle if rectangle is admissible
//     }
// }
//
// Some auxiliary structures:
//
// {
//   G_idx_bp : <map of xy actual point to grid index>
//   Gv : <2d array of xy indices to structure>
//    {
//      G_idx : <grid index>
//      xy    : <xy actual point>
//      t     : <type of grid point>
//    }
//   Gv_bp : <map xy actual point to xy index point in Gv>
//   G_dualG_map : <map of xy actual grid point to xy index point>
// }
//

var fasslib = require("./fasslib.js");

var norm2_v = fasslib.norm2_v;
var v_sub = fasslib.v_sub;
var v_mul = fasslib.v_mul;
var dot_v = fasslib.dot_v;
var cross3 = fasslib.cross3;
var v_delta = fasslib.v_delta;

var pgon = [
  [1,-1], [1,1], [0,1], [0,5], [2,5], [2,6],
  [4,6], [4,3], [5,3], [5,0], [3,0], [3,-1],
];

var pgon_fig1 = [
  [0,3], [0,9], [7,9], [7,10], [10,10],
  [10,8], [12,8],
  [12,4], [11,4],
  [11,1], [8,1], [8,5], [4,5],
  [4,7], [3,7], [3,3]
]

function _ifmt(v, s) {
  s = ((typeof s === "undefined") ? 0 : s);
  let t = v.toString();

  let a = [];

  for (let i=0; i<(s-t.length); i++) {
    a.push(' ');
  }
  a.push(t);

  return a.join("");
}

function _print_pgon(p, pt) {
  pt = ((typeof pt === "undefined") ? [] : pt);
  for (let i=0; i<p.length; i++) {

    if (i < pt.length) { console.log("#", i, pt[i]); }
    console.log(p[i][0], p[i][1]);
  }

  if (p.length > 0) {
    console.log(p[0][0], p[0][1]);
  }
}

function _print_dual(dualG, pfx) {
  pfx = ((typeof pfx === "undefined") ? "" : pfx);
  for (let j=(dualG.length-1); j>=0; j--) {
    let pl = [];
    for (let i=0; i<dualG[j].length; i++) {

      let v = dualG[j][i].id;
      if (v < 0) { v = '   .'; }
      else { v = _ifmt(v, 4); }

      pl.push( v );
    }
    console.log( pfx + pl.join(" ") );
  }
}

function _print_grid_info(grid_info) {
  console.log("# C (countour) (", grid_info.C.length, "):");
  for (let i=0; i<grid_info.C.length; i++) {
    console.log("C[", i, "]:", grid_info.C[i], "(t:", grid_info.Ct[i], ")");
  }
  console.log("");

  console.log("# G (grid) (", grid_info.G.length, "):");
  for (let i=0; i<grid_info.G.length; i++) {
    console.log("G[", i, "]:", grid_info.G[i], "(t:", grid_info.Gt[i], ")");
  }
  console.log("");

  console.log("# X (", grid_info.X.length, "):");
  let xs = [];
  for (let i=0; i<grid_info.X.length; i++) {
    xs.push( _ifmt(grid_info.X[i], 3) );
  }
  console.log(xs.join(" "));
  console.log("");

  console.log("# Y (", grid_info.Y.length, "):");
  let ys = [];
  for (let i=0; i<grid_info.Y.length; i++) {
    ys.push( _ifmt(grid_info.Y[i], 3) );
  }
  console.log(ys.join(" "));
  console.log("");

  console.log("# dualG[iy][ix]:");
  _print_dual(grid_info.dualG);
  for (let j=0; j<grid_info.dualG.length; j++) {
    for (let i=0; i<grid_info.dualG[j].length; i++) {
      console.log("dualG[", j, "][", i, "]:", JSON.stringify(grid_info.dualG[j][i]));
    }
    console.log("");
  }
  console.log("");


}

function _icmp(a,b) {
  if (a < b) { return -1; }
  if (a > b) { return  1; }
  return 0;
}

// https://jeffe.cs.illinois.edu/teaching/comptop/2023/notes/02-winding-number.html
//
function winding(u, pgn) {
  let w = 0;
  let n = pgn.length;

  for (let i=0; i<n; i++) {
    let p = pgn[i];
    let q = pgn[(i+1)%n];

    let d = ((p[0] - u[0])*(q[1] - u[1])) - ((p[1] - u[1])*(q[0] - u[0]));

    if      ((p[0] <= u[0]) && (u[0] < q[0]) && (d > 0)) { w ++; }
    else if ((q[0] <= u[0]) && (u[0] < p[0]) && (d < 0)) { w --; }

  }

  return w;
}

// Returns true if p on boundary of pgn,
// false if not.
//
// slightly modified from:
// https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Vector_formulation
//
// take projection of p onto line segment made from (i,i+1) (ccw ordered)
// boundary points.
// If the the distance of the projected point is within eps and the point
// lies within the line segment (0 <= t <= dl), it's on the boundary.
//
//
function onBoundary(p, pgn) {
  let _eps = (1/1024);
  let n = pgn.length;

  for (let i=0; i<n; i++) {
    let a = [ pgn[i][0], pgn[i][1] ];
    let dn = [ pgn[(i+1)%n][0] - a[0], pgn[(i+1)%n][1] - a[1] ];
    let dl = norm2_v(dn);
    dn[0] /= dl;
    dn[1] /= dl;

    let p_m_a = v_sub(p,a);
    let t = dot_v( p_m_a , dn );
    let u = v_sub( p_m_a, v_mul(t, dn) );

    let dist = norm2_v( u );

    if ((t < (-_eps)) ||
        (t > (dl+_eps))) { continue; }

    if (dist < _eps) { return true; }
  }

  return false;
}

function rectilinearGridPoints(rl_pgon) {
  let _eps = (1/(1024));

  let x_dup = [],
      y_dup = [];

  let pnt_map = {};
  let corner_type = [];

  if (rl_pgon.length == 0) { return []; }

  let n = rl_pgon.length;

  for (let i=0; i<rl_pgon.length; i++) {
    x_dup.push(rl_pgon[i][0]);
    y_dup.push(rl_pgon[i][1]);

    let p_prv = [ rl_pgon[(i+n-1)%n][0], rl_pgon[(i+n-1)%n][1], 0 ];
    let p_cur = [ rl_pgon[i][0], rl_pgon[i][1], 0 ];
    let p_nxt = [ rl_pgon[(i+1)%n][0], rl_pgon[(i+1)%n][1], 0 ];

    let v0 = v_sub( p_prv, p_cur );
    let v1 = v_sub( p_nxt, p_cur );

    let _c = cross3( v0, v1 );

    let corner_code = 'X';

    if      (_c[2] < _eps) { corner_code = 'r'; }
    else if (_c[2] > _eps) { corner_code = 'c'; }

    corner_type.push(corner_code);

    let key = rl_pgon[i][0].toString() + "," + rl_pgon[i][1].toString();
    pnt_map[key] = corner_code;
  }

  x_dup.sort( _icmp );
  y_dup.sort( _icmp );

  let x_dedup = [ x_dup[0] ],
      y_dedup = [ y_dup[0] ];

  for (let i=1; i<x_dup.length; i++) {
    if (x_dup[i] == x_dup[i-1]) { continue; }
    x_dedup.push(x_dup[i]);
  }

  for (let i=1; i<y_dup.length; i++) {
    if (y_dup[i] == y_dup[i-1]) { continue; }
    y_dedup.push(y_dup[i]);
  }

  let grid_xy = [];
  let type_xy = [];

  let dualG = [];
  let g_id = 0;

  for (let j=0; j<y_dedup.length; j++) {
    dualG.push([]);
    for (let i=0; i<x_dedup.length; i++) {
      let g = [ x_dedup[i], y_dedup[j] ] ;

      let _type = 'i';
      let _key = g[0].toString() + "," + g[1].toString();

      if (_key in pnt_map) { _type = 'c'; }
      else if (onBoundary(g, rl_pgon)) { _type = 'b'; }
      else if ( Math.abs(winding(g, rl_pgon)) < _eps ) { _type = 'x'; }

      let g_idx = -1;
      if (_type != 'x') {

        g_idx = grid_xy.length;

        grid_xy.push( g );
        type_xy.push( _type );
      }

      dualG[j].push( {"ixy":[i,j], "G_idx": g_idx, "id": -1 } );
    }
  }


  let dualG_ele_idx = 0;

  for (let j=0; j<dualG.length; j++) {
    for (let i=0; i< dualG[j].length; i++) {
      let dg = dualG[j][i];

      let ixy = dg.ixy;

      if ((ixy[0] >= (x_dedup.length-1)) ||
          (ixy[1] >= (y_dedup.length-1))) { continue; }

      let R = [
        [ x_dedup[ixy[0]],      y_dedup[ixy[1]] ],
        [ x_dedup[ixy[0] + 1],  y_dedup[ixy[1]] ],
        [ x_dedup[ixy[0] + 1],  y_dedup[ixy[1] + 1] ],
        [ x_dedup[ixy[0]],      y_dedup[ixy[1] + 1] ]
      ];

      let mp = [0,0];
      for (let i=0; i<R.length; i++) {
        mp[0] += R[i][0];
        mp[1] += R[i][1];
      }
      mp[0] /= R.length;
      mp[1] /= R.length;

      if ( Math.abs(winding(mp, rl_pgon)) < _eps ) { continue; }

      dualG[j][i]["R"] = R;
      dualG[j][i]["id"] = dualG_ele_idx;
      dualG_ele_idx++;
    }
  }



  return { "C": rl_pgon, "Ct": corner_type, "G": grid_xy, "Gt": type_xy, "X": x_dedup, "Y": y_dedup, "dualG" : dualG };
}

// straight line guillotine cut
// provided indices are grid indices (G)
// since the guillotine cut can be on an edge boundary and not
// part of the original boundary.
//
// start grid point *should* be a reflex vertex
//
function addRegionGuillotine(grid_ctx, g_s_idx, g_e_idx) {

  let _debug = true;
  let _eps = (1/1024);

  let G = grid_ctx.G;
  let Gt = grid_ctx.Gt;
  let dualG = grid_ctx.dualG;

  let dual_regions = [ [], [] ];

  if (_debug) { console.log("#### guillotine g_se:", g_s_idx, g_e_idx, "(", G[g_s_idx], G[g_e_idx], ")"); }

  let s_xy  = G[g_s_idx];
  let s_t   = Gt[g_s_idx];

  let e_xy  = G[g_e_idx];
  let e_t   = Gt[g_e_idx];

  // todo, some sanity checks
  // have to do a contour lookup to get whether its a reflex or concave
  //if (s_t != 'r') {
  //  if (_debug) { console.log("SANITY addRegionGuillotine, g_s_idx:", g_s_idx, "not reflex (", s_xy, s_t, ")"); }
  //  return -1;
  //}


  let d_xy = v_delta( v_sub(e_xy, s_xy) );

  let proj_vec = [0,0],
      proj_val = 0;
  //if ( Math.abs(d_xy[0]) > _eps ) { proj_val = s_xy[1]; proj_vec = [0,d_xy[0]]; }
  //else                            { proj_val = s_xy[0]; proj_vec = [d_xy[1],0]; }

  if ( Math.abs(d_xy[0]) > _eps ) { proj_val = s_xy[1]; proj_vec = [0,1]; }
  else                            { proj_val = s_xy[0]; proj_vec = [1,0]; }

  console.log("proj_vec:", proj_vec, "proj_val:", proj_val, "d_xy:", d_xy);

  let regions_id = [ [], [] ];

  let iBB = [
    [ [0,0], [0,0] ],
    [ [0,0], [0,0] ]
  ];

  for (let j=0; j<dualG.length; j++) {
    for (let i=0; i<dualG[j].length; i++) {
      let r_id = dualG[j][i].id;
      if (r_id < 0) { continue; }

      let p_rep = dualG[j][i].R[0];

      let d = dot_v( p_rep, proj_vec );
      if (d < proj_val) {

        if (regions_id[0].length == 0) {
          iBB[0][0][0] = i;
          iBB[0][0][1] = j;
          iBB[0][1][0] = i;
          iBB[0][1][1] = j;
        }

        regions_id[0].push(r_id);

        if (i < iBB[0][0][0]) { iBB[0][0][0] = i; }
        if (j < iBB[0][0][1]) { iBB[0][0][1] = j; }
        if (i > iBB[0][1][0]) { iBB[0][1][0] = i; }
        if (j > iBB[0][1][1]) { iBB[0][1][1] = j; }
      }

      else {
        if (regions_id[1].length == 0) {
          iBB[1][0][0] = i;
          iBB[1][0][1] = j;
          iBB[1][1][0] = i;
          iBB[1][1][1] = j;
        }

        regions_id[1].push(r_id);

        if (i < iBB[1][0][0]) { iBB[1][0][0] = i; }
        if (j < iBB[1][0][1]) { iBB[1][0][1] = j; }
        if (i > iBB[1][1][0]) { iBB[1][1][0] = i; }
        if (j > iBB[1][1][1]) { iBB[1][1][1] = j; }
      }
    }
  }

  let a0 = ((iBB[0][1][0] - iBB[0][0][0] + 1)*(iBB[0][1][1] - iBB[0][0][1] + 1));
  let a1 = ((iBB[1][1][0] - iBB[1][0][0] + 1)*(iBB[1][1][1] - iBB[1][0][1] + 1));

  let shape = [
    (a0 == regions_id[0].length) ? 'U' : 'Z',
    (a1 == regions_id[1].length) ? 'U' : 'Z',
  ];

  regions_id[0].sort( _icmp );
  regions_id[1].sort( _icmp );

  let regions_key = [
    regions_id[0].map( function(_v) { return _v.toString(); } ).join(","),
    regions_id[1].map( function(_v) { return _v.toString(); } ).join(",")
  ];

  if (_debug) {
    console.log("#### [", regions_key[0], "], [", regions_key[1], "] (", shape, ")", "(", a0, a1, ")", JSON.stringify(iBB));
  }

  return { "region": regions_id, "region_key":regions_key, "shape": shape };
}

// partition rectilinear polygon by 2-cut.
//
// g_s_idx start of cut (from reflex vertex) of 2-cut
// g_m_idx interior point, middle bend of cut
// g_e_idx end of cut, grid point on edge or reflex vertex of contour
//
function addRegionTwoCut(grid_ctx, g_s_idx, g_m_idx, g_e_idx) {

  let _debug = true;
  let _eps = (1/1024);

  let G = grid_ctx.G;
  let Gt = grid_ctx.Gt;
  let dualG = grid_ctx.dualG;

  let dual_regions = [ [], [] ];

  if (_debug) { console.log("#### 2-cut g_sme:", g_s_idx, g_m_idx, g_e_idx, "(", G[g_s_idx], G[g_m_idx], G[g_e_idx], ")"); }

  let s_xy  = G[g_s_idx];
  let s_t   = Gt[g_s_idx];

  let m_xy  = G[g_m_idx];
  let m_t   = Gt[g_m_idx];

  let e_xy  = G[g_e_idx];
  let e_t   = Gt[g_e_idx];


}

function cataloguePartitions( grid_ctx ) {
  let _eps = (1/1024);

  let debug = true;

  let C = grid_ctx.C;
  let Ct = grid_ctx.Ct;
  let G = grid_ctx.G;
  let Gt = grid_ctx.Gt;
  let X = grid_ctx.X;
  let Y = grid_ctx.Y;
  let dualG = grid_ctx.dualG;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  // grid point xy key to grid index map
  //
  let G_idx_bp = {};
  for (let i=0; i<G.length; i++) {
    let g = G[i];
    let key = g[0].toString() + "," + g[1].toString();
    G_idx_bp[key] = i;
  }
  grid_ctx["G_idx_bp"] = G_idx_bp;

  // grid point (actual) xy key to daul entry
  // dual entry is lower left hand corner point
  //
  let G_dualG_map = {};
  for (let j=0; j<dualG.length; j++) {
    for (let i=0; i<dualG[j].length; i++) {
      let g_idx = dualG[j][i].G_idx;
      if (g_idx < 0) { continue; }
      let key = G[g_idx][0].toString() + "," + G[g_idx][1].toString();
      G_dualG_map[key] = [i,j];
    }
  }
  grid_ctx["G_dualG_map"] = G_dualG_map;

  // grid index xy to information about grid poitn:
  // each entry contains:
  // {
  //   G_idx  : <grid index>
  //   xy     : <xy point (actual)>
  //   t      : <type [cbix], x being invalid>
  // }
  //
  // Gv_bp maps grid xy point (actual) to grid index
  //
  let Gv = [];
  let Gv_bp = {};
  for (let j=0; j<dualG.length; j++) {
    Gv.push([]);
    for (let i=0; i<dualG[j].length; i++) {
      let dg = dualG[j][i];

      let _xy = [-1,-1];
      let _type = "x";

      if (dg.G_idx >= 0) {
        _xy = G[dg.G_idx];
        _type = Gt[dg.G_idx];
      }

      Gv[j].push( { "G_idx": dg.G_idx, "xy": _xy, "t": _type } );
      Gv_bp[ _xy[0].toString() + "," + _xy[1].toString() ] = [i,j];
    }
  }

  grid_ctx["Gv"] = Gv;
  grid_ctx["Gv_bp"] = Gv_bp;

  // Go through each point on the boundary.
  //
  // If it's a reflex vertex (convex w.r.t. interior), cast a ray out
  // in the opposite direction if its two neighboring boundary points.
  //
  // The first ray is called the 'l' line segment.
  //
  // If l end hits a boundary, either another reflex or edge,
  // tie it off and add the two sub polygons to the region list.
  //
  // If the l end hits an interior point, cast an 's' ray out in the two
  // orthogonal directions.
  //
  // If the s end hits an interior point, ignore and continue
  // If the s end hits an edge, ignore and stop
  // If the s end hits a reflex vertex, add the two polygons
  // to the region list.
  //
  // If the single l line segment hits a boundary, since it's anchored
  // at a reflex vertex it could be part of the optimal solution, so
  // we add the polygon subdivisions to the catalgoue.
  //
  // If the second s line segment hits an edge of the boundary but
  // not a reflex vertex, this represents a potentially unachored
  // line segment and might not be part of an optimal solution.
  // For the case of an s line segments that does hit an edge (but
  // not a reflex) boundary that *is* part of the optimal solution,
  // this case will be handled by the straight l line segment
  // originating from a reflex, so we can safely ignore it
  // coming from s since its handled by the l ray casting.
  //
  // Whether we're partioning the polygon by a single l line
  // or by the two l,s lines, the partitioned rectangles both
  // have a contiguous portion of the original C rectilinear polygon
  // perimeter.
  // The contiguous portion of the perimeter alone does not provide
  // us enough information to reconstruct the polygon partition, as there
  // are multiple partitions that have the same perimeter sweep,
  // but the number of possibilities is small and bounded
  // (max of 2? worst case when there are two reflex vertices
  // with two choices for the partition?).
  //
  // The purpose of this function is to catalogue the polygon
  // partitions but this information will be used later
  // to recursively calculate the value of the polygon
  // partition by calculating the edge cost of simple
  // rectangles, then filling in more complex polygonal
  // regions as they turn into simple rectangles.
  //
  for (let c_idx=0; c_idx < C.length; c_idx++) {

    let c_xy = C[c_idx];
    let c_type = Ct[c_idx];

    if (debug) {
      console.log("...", c_xy, c_type);
    }

    if (c_type != 'r') { continue; }

    let _key = c_xy[0].toString() + "," + c_xy[1].toString();
    let src_ixy = Gv_bp[_key];

    if (debug) {
      console.log(">>> c_idx:", c_idx, c_type, "src_ixy:", src_ixy);
    }

    let l_dxy_choice = [
      v_delta( v_sub( C[c_idx], C[(c_idx+C.length-1)%C.length] ) ),
      v_delta( v_sub( C[c_idx], C[(c_idx+1)%C.length] ) )
    ];

    for (let l_dxy_choice_idx=0; l_dxy_choice_idx < l_dxy_choice.length; l_dxy_choice_idx++) {
      let l_dxy = l_dxy_choice[ l_dxy_choice_idx ];
      let l_ixy = [ src_ixy[0] + l_dxy[0], src_ixy[1] + l_dxy[1] ];

      let ls_g_idx = Gv[ src_ixy[1] ][ src_ixy[0] ].G_idx;

      let s_dxy_choice = [];
      for (let idir=0; idir < 4; idir++) {
        if ( Math.abs(dot_v( idir_dxy[idir], l_dxy )) > _eps ) { continue; }
        s_dxy_choice.push( idir_dxy[idir] );
      }

      if (debug) { console.log(" __ l_dxy:", l_dxy, "l_ixy", l_ixy); }

      while ((l_ixy[1] >= 0) && (l_ixy[1] < Gv.length) &&
             (l_ixy[0] >= 0) && (l_ixy[1] < Gv[ l_ixy[1] ].length)) {

        let l_gv = Gv[ l_ixy[1] ][ l_ixy[0] ];

        if (debug) { console.log("  l_gv:", l_gv, "l_ixy:", l_ixy); }

        let le_g_idx = l_gv.G_idx;
        if (le_g_idx < 0) { break; }

        let le_g_ixy   = G[ le_g_idx ];
        let le_g_type  = Gt[ le_g_idx ];

        if (le_g_type == 'b') {

          if (debug) { console.log("    l>>> edge"); }

          addRegionGuillotine(grid_ctx, ls_g_idx, le_g_idx);

          break;
        }

        if (le_g_type == 'c') {

          if (debug) { console.log("    l>>> src_reflex", src_ixy, "to dst_boundary", le_g_ixy); }

          let ce_idx = -1;

          addRegionGuillotine(grid_ctx, ls_g_idx, le_g_idx);

          break;

        }

        if (le_g_type == 'i') {

          if (debug) { console.log("    l>>> interior", s_dxy_choice); }

          for (let s_dxy_choice_idx=0; s_dxy_choice_idx < s_dxy_choice.length; s_dxy_choice_idx++) {
            let s_dxy = s_dxy_choice[ s_dxy_choice_idx ];
            let s_ixy = [ l_ixy[0] + s_dxy[0], l_ixy[1] + s_dxy[1] ];

            while ((s_ixy[1] >= 0) && (s_ixy[1] < Gv.length) &&
                   (s_ixy[0] >= 0) && (s_ixy[1] < Gv[ s_ixy[1] ].length)) {

              let s_gv = Gv[ s_ixy[1] ][ s_ixy[0] ];

              if (debug) { console.log("    s_gv:", s_gv, "s_ixy:", s_ixy); }

              let se_g_idx = s_gv.G_idx;
              if (se_g_idx < 0) { break; }

              let se_g_ixy   = G[ se_g_idx ];
              let se_g_type  = Gt[ se_g_idx ];

              if (se_g_type == 'b') {
                if (debug)  { console.log("      s>>> edge (skip,end)"); }
                break;
              }

              else if (se_g_type == 'i') {
                if (debug) { console.log("      s>>> interior (skip)"); }
              }

              if (se_g_type == 'c') {
                if (debug) { console.log("      s>>> reflex (partition)"); }

                let ce_idx = -1;

                addRegionTwoCut(grid_ctx, c_idx, ce_idx, le_g_idx);

                break;
              }

              s_ixy = [ s_ixy[0] + s_dxy[0], s_ixy[1] + s_dxy[1] ];
            }

          }

          // must keep goin because the l line could still find
          // a partition that hits an edge or reflex
          //

        }

        l_ixy = [ l_ixy[0] + l_dxy[0], l_ixy[1] + l_dxy[1] ];
      }


    }


  }

}

function _ok(P) {

  let all_x_pnt = [],
      all_y_pnt = [],
      x_pnt = [],
      y_pnt = [];

  for (let i=0; i<P.length; i++) {
    all_x_pnt.push(P[i][0]);
    all_y_pnt.push(P[i][1]);
  }

  all_x_pnt.sort( _icmp );
  all_y_pnt.sort( _icmp );

  x_pnt.push(all_x_pnt[0]);
  y_pnt.push(all_y_pnt[0]);

  for (let i=1; i<all_x_pnt.length; i++) {
    if (all_x_pnt[i] != all_x_pnt[i-1]) {
      x_pnt.push(all_x_pnt[i]);
    }
  }

  for (let i=1; i<all_y_pnt.length; i++) {
    if (all_y_pnt[i] != all_y_pnt[i-1]) {
      y_pnt.push(all_y_pnt[i]);
    }
  }

  for (let i=0; i<x_pnt.length; i++) {
    for (let j=0; j<y_pnt.length; j++) {
      console.log("\n\n", x_pnt[i], y_pnt[j]);
    }
  }

}

function _main1() {

  let grid_info = rectilinearGridPoints(pgon);

  _print_dual(grid_info.dualG, '#');
  console.log("");

  _print_grid_info(grid_info);

  cataloguePartitions(grid_info);
  return;
}

function _main() {
  let grid_info = rectilinearGridPoints(pgon);

  _print_pgon(pgon, grid_info.Ct);

  let grid_p = grid_info.G;
  let grid_pt = grid_info.Gt;

  for (let i=0; i<grid_p.length; i++) {
    console.log("\n#winding:", winding(grid_p[i], pgon), grid_pt[i] );
    console.log(grid_p[i][0], grid_p[i][1], "\n");
  }


  //console.log(grid_info);
  //console.log(grid_info.dualG);

  //_ok(pgon);
}


_main1();
