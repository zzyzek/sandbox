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

  let n = P.length;


  let grid_s = Math.pow(n, 1/3);
  let grid_n = Math.ceil(grid_s);
  let ds = 1/ grid_n;
  let grid_cell_size = [ds,ds,ds];
  let nxyz = [grid_n, grid_n, grid_n];

  let M = grid_n*grid_n*grid_n;

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

  for (let p_idx=0; p_idx<P.length; p_idx++) {
    let g_idx = xyz2idx(P[p_idx], nxyz);
    let ixyz = idx2xyz(g_idx, nxyz);

    for (let win_radius=1; win_radius<grid_n; win_radius++) {
      let se_ixyz = [ [-1,-1], [-1,-1], [-1,-1] ];

      for (let d=0; d<3; d++) {
        se_ixyz[d][0] = _clamp(ixyz[d]-win_radius, 0, nxyz[d]);
        se_ixyz[d][1] = _clamp(ixyz[d]+win_radius, 0, nxyz[d]);
      }

      if (_debug) {
        console.log("#p_idx:", p_idx, "g_idx:", g_idx, "ixyz:", ixyz, "se_ixyz:", se_ixyz);
      }

      let pnt_list = [];
      let idx_list = [];

      let mirror_point = [ -1,-1, -1,-1, -1,-1 ];

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
              idx_list.push( vidx );
              pnt_list.push( P[vidx] );
            }

          }
        }
      }

      // wip
      //
      for (let idir=0; idir<mirror_point.length; idir++) {
        if (mirror_point[idir] == 1) {
        }
      }

      if (pnt_list.length < 4) { continue; }

      let ch_idx = CHA(pnt_list);
      for (let i=0; i<ch_idx.length; i++) {

        let _u = njs.sub( pnt_list[ch_idx[0]], pnt_list[ch_idx[1]] );
        let _v = njs.sub( pnt_list[ch_idx[2]], pnt_list[ch_idx[1]] );

        //let _s = njs.dot

      }


      console.log("## g_idx:", g_idx, "winr:", win_radius, "idx_list[", idx_list.length, "]:", JSON.stringify(idx_list));

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

    let n = 200;
    let P = [];
    for (let i=0; i<n; i++) {
      P.push([Math.random(),Math.random(),Math.random()]);
    }
    lunech3d(P);
  }

  _main(process.argv.slice(2));
}



