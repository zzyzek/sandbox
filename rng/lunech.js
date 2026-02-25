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

      let p_list = [];
      let i_list = [];

      for (let iz=se_ixyz[2][0]; iz<se_ixyz[2][1]; iz++) {
        for (let iy=se_ixyz[1][0]; iy<se_ixyz[1][1]; iy++) {
          for (let ix=se_ixyz[0][0]; ix<se_ixyz[0][1]; ix++) {

            let _t_ixyz = [ix,iy,iz];
            let _tg = ixyz2idx(_t_ixyz, nxyz);

            for (let i=0; i<grid_idx[_tg].length; i++) {
              let vidx = grid_idx[_tg][i];
              i_list.push( vidx );
              p_list.push( P[vidx] );
            }

          }
        }
      }

      console.log("## g_idx:", g_idx, "winr:", win_radius, "i_list[", i_list.length, "]:", JSON.stringify(i_list));

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



