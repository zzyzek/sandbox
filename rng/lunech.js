#!/usr/bin/node
// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


var njs = require("./numeric.js");
var cocha = require("./cocha.js");
var fasslib = require("./fasslib.js");

// convention?
// H : half plane
// s : sign
// P : plane
// L : line
// t : time
// 

// return sign of which side u is to half plane defined
// by Nxyzd.
//
// Nxyzd is 4x1 vector, where first three entries are
// normal and last entry is distance from origin to point
// on notrmal plane.
//
// Consider v as the point on the plane defined by Nxyzd.
//
// (u-v) is direction to u with v as origin.
// Nxyz . (u-v) gives the sign of which side u is on
// Nxyzd, with 0 being u on plane.
//
function _Hs(u, Nxyzd) {
  let d = Nxyzd[3];

  let _Nv = [
    Nxyzd[0],
    Nxyzd[1],
    Nxyzd[2]
  ];

  let v = [
    d*Nxyzd[0],
    d*Nxyzd[1],
    d*Nxyzd[2]
  ];

  return njs.dot( _Nv, njs.sub(u, v) );
}

// return "time" value of line to plane intersection
// line(t) = v0 + t v
// plane(u) = Np . ( u - p )
//
// -> Np . ( v0 + t v - p ) = 0
// -> t = ( (Np . p) - (Np . v0) ) / (Np . v)
//
function _PLt(Np, p, v0, v) {
  let _eps = 1/(1024*1024*1024);
  let _d = njs.dot(Np,v);
  if (Math.abs(_d) < _eps) { return NaN; }

  let t = (njs.dot(Np,p) - njs.dot(Np,v0)) / _d;
  return t;
}

// evaluate line: V(t) = v0 + t v
//
function _Lt( v0, v, t ) { return njs.add(v0, njs.mul(t, v)); }


// Three points to plane equation,
// returns 4x1 vector,
// where first three elemenst are normal,
// last is distance to plane from origin.
//
function _v3H(p0, p1, p2) {
  let _eps = 1/(1024*1024*1024);
  let p10 = njs.sub(p1,p0);
  let p20 = njs.sub(p2,p0);
  let Np = cross3(p10,p20);
  let Pk = -njs.dot(Np, p0);
  return [ Np[0], Np[1], Np[2], Pk ]
}



// 3d cross product.
//
function cross3(p,q) {
  let c0 = ((p[1]*q[2]) - (p[2]*q[1])),
      c1 = ((p[2]*q[0]) - (p[0]*q[2])),
      c2 = ((p[0]*q[1]) - (p[1]*q[0]));

  return [c0,c1,c2];
}

// tst_c in lune created by pnt_a, pnt_b?
//
function in_lune(pnt_a, pnt_b, tst_c) {
  let dist_ca = njs.norm2( njs.sub(tst_c, pnt_a) );
  let dist_cb = njs.norm2( njs.sub(tst_c, pnt_b) );
  let dist_ab = njs.norm2( njs.sub(pnt_a, pnt_b) );

  if ((dist_ca <= dist_ab) &&
      (dist_cb <= dist_ab)) {
    return 1;
  }

  return 0;
}



//----
//----
//----


function _clamp(a, l,u) {
  if (a <  l) { return l; }
  if (a >= u) { return u; }
  return a;
}

function ixyz2idx(ixyz,nxyz) {
  let nx = nxyz[0];
  let ny = ((typeof nxyz[1] === "undefined") ? nx : nxyz[1]);
  let nz = ((typeof nxyz[2] === "undefined") ? nx : nxyz[2]);

  return ixyz[0] + (ixyz[1]*nx) + (ixyz[2]*nx*ny);
}

function xyz2idx(xyz,nxyz) {
  let nx = nxyz[0];
  let ny = ((typeof nxyz[1] === "undefined") ? nx : nxyz[1]);
  let nz = ((typeof nxyz[2] === "undefined") ? nx : nxyz[2]);

  let ixyz = [
    Math.floor(xyz[0]*nx),
    Math.floor(xyz[1]*ny),
    Math.floor(xyz[2]*nz)
  ];

  return ixyz2idx(ixyz, nxyz);
}

function idx2xyz(idx, nxyz) {
  let nx = nxyz[0];
  let ny = ((typeof nxyz[1] === "undefined") ? nx : nxyz[1]);
  let nz = ((typeof nxyz[2] === "undefined") ? nx : nxyz[2]);
  
  let xyz = [-1,-1,-1];

  xyz[0] = idx%nx;
  idx = Math.floor(idx / nx);
  xyz[1] = idx%ny;
  idx = Math.floor(idx / ny);
  xyz[2] = idx;

  return xyz;
}

function gnuplot_print_grid(ds, grid_n) {

  for (let iy=0; iy<=grid_n; iy++) {
    for (let ix=0; ix<=grid_n; ix++) {
      for (let iz=0; iz<=grid_n; iz++) {
        console.log(ix*ds, iy*ds, iz*ds);
      }
      console.log("\n");
    }
  }

  for (let iy=0; iy<=grid_n; iy++) {
    for (let iz=0; iz<=grid_n; iz++) {
      for (let ix=0; ix<=grid_n; ix++) {
        console.log(ix*ds, iy*ds, iz*ds);
      }
      console.log("\n");
    }
  }

  for (let ix=0; ix<=grid_n; ix++) {
    for (let iz=0; iz<=grid_n; iz++) {
      for (let iy=0; iy<=grid_n; iy++) {
        console.log(ix*ds, iy*ds, iz*ds);
      }
      console.log("\n");
    }
  }

}

function _p_inside_convex_hull_3d(p, Q, face_idx_list) {

  for (let face_idx=0; face_idx<face_idx_list.length; face_idx++) {
    let fv = face_idx_list[face_idx];

    let u = [ Q[fv[0]][0], Q[fv[0]][1], Q[fv[0]][2] ] ;
    let v = [ Q[fv[1]][0], Q[fv[1]][1], Q[fv[1]][2] ] ;
    let w = [ Q[fv[2]][0], Q[fv[2]][1], Q[fv[2]][2] ] ;

    let c3 = fasslib.cross3( njs.sub(v,u), njs.sub(w,u) );
    let s = njs.dot( c3, njs.sub(u,p) );
    if (s < 0) { return false; }

  }

  return true;
}

// WIP!!
//
// - collect all points in window centered at grid point (done)
// - need to figure out what hapens at grid edges
// - need to do an initial convex hull
// - need to check window has enough points for convex hull
// - windowed convex hull test for center point inclusion
// - naive rng
//
function lunech3d(P) {
  let _debug = 1;

  CHA = cocha.hull3d;

  let n = P.length;


  let grid_s = Math.pow(n, 1/3);
  let grid_n = Math.ceil(grid_s);
  let ds = 1/ grid_n;
  let grid_cell_size = [ds,ds,ds];
  let nxyz = [grid_n, grid_n, grid_n];

  let M = grid_n*grid_n*grid_n;

  // we assume points within a 1x1x1 cube for now
  //
  let mx = 0,  Mx = 1,
      my = 0,  My = 1,
      mz = 0,  Mz = 1;

  let grid_idx = [];
  for (let i=0; i<M; i++) { grid_idx.push([]); }

  if (_debug) {
    console.log("# n:", n, "grid_s:", grid_s, "grid_n:", grid_n, "ds:", ds, "grid_cell_size:", grid_cell_size);
  }


  for (let i=0; i<(grid_n*grid_n*grid_n); i++) {
    grid_idx.push([]);
  }

  for (let i=0; i<n; i++) {
    let g_idx = xyz2idx(P[i], nxyz);
    grid_idx[g_idx].push(i);
  }

  let winFactor = 1.25;

  // for each anchor point, take the collection of grid cells
  // in an increasing radius until we've found a convex hull that
  // encompases the anchor point and whose dual does not exceed
  // winFactor * radius.
  // To make sure we have a chance of creating a convex hull for
  // anchor points near the edge, put a virtual 'mirror point'
  // on the edge face if the cell collection butts up against
  // the edge.
  //
  for (let anchor_idx=0; anchor_idx<P.length; anchor_idx++) {
    let anchor_grid_idx = xyz2idx(P[anchor_idx], nxyz);
    let anchor_ixyz = idx2xyz(g_idx, nxyz);

    let anchor_p = P[anchor_idx];

    for (let win_radius=1; win_radius<grid_n; win_radius++) {

      let _f = winFactor;
      let grid_mM = [
        [ Math.floor(anchor_ixyz[0] - (_f*win_radius)), Math.floor(anchor_ixyz[0] + (_f*win_radius)) ],
        [ Math.floor(anchor_ixyz[1] - (_f*win_radius)), Math.floor(anchor_ixyz[1] + (_f*win_radius)) ],
        [ Math.floor(anchor_ixyz[2] - (_f*win_radius)), Math.floor(anchor_ixyz[2] + (_f*win_radius)) ]
      ];

      let se_ixyz = [ [-1,-1], [-1,-1], [-1,-1] ];
      for (let d=0; d<3; d++) {
        se_ixyz[d][0] = _clamp(anchor_ixyz[d]-win_radius, 0, nxyz[d]);
        se_ixyz[d][1] = _clamp(anchor_ixyz[d]+win_radius, 0, nxyz[d]);
      }

      if (_debug) {
        console.log("#anchor_idx:", anchor_idx, "g_idx:", g_idx, "anchor_ixyz:", anchor_ixyz, "se_ixyz:", se_ixyz);
      }

      let pnt_list = [];
      let idx_list = [];

      let mirror_point = [ -1,-1, -1,-1, -1,-1 ];
      let mirror_base_idx = -1;

      for (let iz=se_ixyz[2][0]; iz<se_ixyz[2][1]; iz++) {
        for (let iy=se_ixyz[1][0]; iy<se_ixyz[1][1]; iy++) {
          for (let ix=se_ixyz[0][0]; ix<se_ixyz[0][1]; ix++) {

            if (ix == (nxyz[0]-1))  { mirror_point[0] = 1; }
            if (ix == 0)            { mirror_point[1] = 1; }

            if (iy == (nxyz[1]-1))  { mirror_point[2] = 1; }
            if (iy == 0)            { mirror_point[3] = 1; }

            if (iz == (nxyz[2]-1))  { mirror_point[4] = 1; }
            if (iz == 0)            { mirror_point[5] = 1; }

            let _t_ixyz = [ix,iy,iz];
            let _tg = ixyz2idx(_t_ixyz, nxyz);

            for (let i=0; i<grid_idx[_tg].length; i++) {
              let vidx = grid_idx[_tg][i];

              // ignore the current point we're considering from
              // convex hull calculation.
              //
              if (vidx == anchor_idx) { continue; }

              idx_list.push( vidx );
              pnt_list.push( P[vidx] );
            }

          }
        }
      }

      mirror_base_idx = pnt_list.length;

      // add in mirror points, with placeholder -1 for index
      //
      if (mirror_point[0] == 1) { pnt_list.push([mx, anchor_p[1], anchor_p[2]]); }
      if (mirror_point[1] == 1) { pnt_list.push([Mx, anchor_p[1], anchor_p[2]]); }
      if (mirror_point[2] == 1) { pnt_list.push([anchor_p[0], my, anchor_p[2]]); }
      if (mirror_point[3] == 1) { pnt_list.push([anchor_p[0], My, anchor_p[2]]); }
      if (mirror_point[4] == 1) { pnt_list.push([anchor_p[0], anchor_p[1], mz]); }
      if (mirror_point[5] == 1) { pnt_list.push([anchor_p[0], anchor_p[1], Mz]); }
      for (let idir=0; idir<6; idir++) { if (mirror_point[idir]==1) { idx_list.push(-1); } }

      if (pnt_list.length < 4) { continue; }

      // find convex hull
      //
      let face_vtx_idx_list = CHA(pnt_list);

      // if convex hull doesn't completely encompass our current point (anchor_p),
      // try again.
      //
      if (!_p_inside_convex_hull_3d(anchor_p, pnt_list, face_vtx_idx_list)) {
        continue;
      }

      // otherwise, take the dual of of the convex hull (intersection
      // of points taken as normals from anchor_p) then see if the dual
      // convex hull is within threshold grid distance
      //

      // WIP!!!
      let pnt_dual = _convex_hull_dual(anchor_p, pnt_list, face_vtx_idx_list);
      let bbox = boundingBox(pnt_dual);

      let ibbox = [
        [ Math.floor( grid_n * (bbox[0][0] + anchor_p[0] ) ), Math.floor( grid_n * (bbox[0][1] + anchor_p[0] ) ) ],
        [ Math.floor( grid_n * (bbox[1][1] + anchor_p[1] ) ), Math.floor( grid_n * (bbox[1][1] + anchor_p[1] ) ) ],
        [ Math.floor( grid_n * (bbox[2][2] + anchor_p[2] ) ), Math.floor( grid_n * (bbox[2][1] + anchor_p[2] ) ) ]
      ];

      let within_threshold = true;
      for (let i=0; i<3; i++) {
        if ((ibbox[i][0]  < grid_mM[0]) ||
            (ibbox[i][1] >= grid_mM[1])) { 
          within_threshold = false;
          break;
        }
      }

      if (!within_threshold) { continue; }

      // rng of threshold grid
      //



    }

  }


  if (_debug) {
    gnuplot_print_grid(ds, grid_n);
    for (let i=0; i<P.length; i++) {
      console.log(P[i][0], P[i][1], P[i][2]);
      console.log("\n");
    }
  }

}

if (typeof module !== "undefined") {
}


if ((typeof require !== "undefined") &&
    (require.main === module)) {

  function _main(argv) {


    let op = 'lunech3d';
    op = 'inside_ch_test';

    if (op == 'inside_ch_test') {

      let n = 20;
      let pnt = [];
      for (let i=0; i<n; i++) {
        pnt.push( njs.sub( njs.random([3]), [0.5, 0.5, 0.5] ) );
      }

      let fv_idx = cocha.hull3d(pnt);

      // print out convex hull lines
      //
      for (let i=0; i<fv_idx.length; i++) {
        let vi = fv_idx[i];
        for (let j=0; j<vi.length; j++) {
          console.log( pnt[vi[0]][0], pnt[vi[0]][1], pnt[vi[0]][2] );
          console.log( pnt[vi[1]][0], pnt[vi[1]][1], pnt[vi[1]][2] );
          console.log( pnt[vi[2]][0], pnt[vi[2]][1], pnt[vi[2]][2] );
          console.log( pnt[vi[0]][0], pnt[vi[0]][1], pnt[vi[0]][2] );
          console.log("\n");
        }
      }

      let iN = 32;
      for (let iz=0; iz<iN; iz++) {
        for (let iy=0; iy<iN; iy++) {
          for (let ix=0; ix<iN; ix++) {

            let x = 2.0 * ((ix / iN) - 0.5);
            let y = 2.0 * ((iy / iN) - 0.5);
            let z = 2.0 * ((iz / iN) - 0.5);

            if (_p_inside_convex_hull_3d( [x,y,z], pnt, fv_idx )) {
              console.log(x,y,z);
              console.log("\n");
            }

          }
        }
      }


      //console.log(fv_idx);

    }

    else if (op == 'lunech3d') {
      let n = 200;
      let P = [];
      for (let i=0; i<n; i++) {
        P.push([Math.random(),Math.random(),Math.random()]);
      }
      lunech3d(P);
    }
  }

  _main(process.argv.slice(2));
}



