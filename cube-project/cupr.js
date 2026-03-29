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


var njs = require("../lib/numeric.js");


let N = 100;
let sn = Math.ceil( Math.sqrt(N) );
let face_sn = Math.ceil( Math.sqrt( Math.ceil(N/6) ) );
let face_n_bin = face_sn*face_sn;

console.log("#N:", N, "6*face_sn*face_sn:", face_sn*face_sn*6, "(face_n_bin:", face_n_bin, ")");

function sgn(v) {
  if (v<0) { return -1; }
  if (v>0) { return  1; }
  return 0;
}

function p_idir(p) {
  let ax = Math.abs(p[0]),
      ay = Math.abs(p[1]),
      az = Math.abs(p[2]);

  if ((ax > ay) && (ax > az)) {
    if (p[0] > 0) { return 0; }
    return 1;
  }

  if ((ay > ax) && (ay > az)) {
    if (p[1] > 0) { return 2; }
    return 3;
  }

  if ((az > ax) && (az > ay)) {
    if (p[2] > 0) { return 4; }
    return 5;
  }

  return -1;
}

function ixy2idx(ixy, nxy) {
  return ixy[0] + (ixy[1]*nxy[0]);
}

function xy2idx(xy, nxy) {
  let a = 1, b = 0.5;
  let ixy = [
    Math.floor(nxy[0]*((xy[0] + a)*b)),
    Math.floor(nxy[1]*((xy[1] + a)*b)),
  ];
  return ixy2idx(ixy, nxy);
}

function idx2xy(idx, nxy, ds) {
  let iy = Math.floor(idx / nxy[0]);
  let ix = idx - (iy*nxy[0]);

  let x = (ix*ds) - 1;
  let y = (iy*ds) - 1;

  return [x,y];
}

function xyz2cubemap(p) {
  let idir = p_idir(p);
  let u = [0,0,0];
  let _s = ( ((idir%2)==0) ? 1 : -1);
  if      ((idir == 0) || (idir == 1)) { u = [ _s, _s*p[1]/p[0], _s*p[2]/p[0] ]; }
  else if ((idir == 2) || (idir == 3)) { u = [ _s*p[0]/p[1], _s, _s*p[2]/p[1] ]; }
  else if ((idir == 4) || (idir == 5)) { u = [ _s*p[0]/p[2], _s*p[1]/p[2], _s ]; }
  return u;
}

function xy2idir_plane(xy, idir) {
  let xyz = [0,0,0];

  if ((idir == 0) || (idir == 1)) {
    let _s = ( (idir == 0) ? 1 : -1 );
    xyz[0] = _s;
    xyz[1] = _s*xy[0];
    xyz[2] = _s*xy[1];
  }

  else if ((idir == 2) || (idir == 3)) {
    let _s = ((idir == 2) ? 1 : -1);
    xyz[0] = _s*xy[0];
    xyz[1] = _s;
    xyz[2] = _s*xy[1];
  }

  else if ((idir == 4) || (idir == 5)) {
    let _s = ((idir == 4) ? 1 : -1);
    xyz[0] = _s*xy[0];
    xyz[1] = _s*xy[1];
    xyz[2] = _s;
  }

  return xyz;
}

function _bin_p(p, grid_bin, nxy) {

  let idir = p_idir(p);
  let _idx = -1;

  let u = [0,0,0];
  if ((idir == 0) || (idir == 1)) {
    let _s = sgn(p[0]);
    u = [ _s, _s*p[1]/p[0], _s*p[2]/p[0] ];
    _idx = xy2idx( [u[1], u[2]], nxy );
  }

  else if ((idir == 2) || (idir == 3)) {
    let _s = sgn(p[1]);
    u = [ _s*p[0]/p[1], _s, _s*p[2]/p[1] ];
    _idx = xy2idx( [u[0], u[2]], nxy );
  }

  else if ((idir == 4) || (idir == 5)) {
    let _s = sgn(p[2]);
    u = [ _s*p[0]/p[2], _s*p[1]/p[2], _s ];
    _idx = xy2idx( [u[0], u[1]], nxy );
  }

  else { return -1; }

  grid_bin[idir][_idx].push(p);

  return 0;
}

function CM_flood_step(cm_ctx, cixy) {

  let ns = cm_ctx.Ns;

  Nxy = [ns,ns];

  if (typeof cixy !== "undefined") {
    cm_ctx.Q = [ [ cixy[0], cixy[1], cixy[2] ] ];

    //brute force unwind for now...
    //
    cm_ctx.B = [ [], [], [], [], [], [] ];
    for (let idir=0; idir<6; idir++) {
      for (let i=0; i<cm_ctx.Nf; i++) {
        cm_ctx.B[idir].push(-1);
      }
    }

    let idx = ixy2idx([cixy[0], cixy[1]], Nxy);
    cm_ctx.B[cixy[2]][idx] = 0;

  }

  let nei_dxy = [
    [ 1, 0], [ 1, 1], [ 0, 1], [-1, 1],
    [-1, 0], [-1,-1], [ 0,-1], [ 1,-1]
  ];

  let dstQ = [];
  for (let qi=0; qi<cm_ctx.Q.length; qi++) {

    let qele = cm_ctx.Q[qi];
    let ix = qele[0];
    let iy = qele[1];
    let face_idx = qele[2];

    let cell_idx = ixy2idx([ix,iy], Nxy);

    //console.log(qi, cm_ctx.Q);
    //console.log("...", cell_idx, ix, iy, face_idx, Nxy);

    let v = cm_ctx.B[face_idx][cell_idx];

    for (let _ni=0; _ni<nei_dxy.length; _ni++) {
      let dxy = nei_dxy[_ni];

      let nei_ix = ix + dxy[0];
      let nei_iy = iy + dxy[1];

      if ((nei_ix < 0) || (nei_iy < 0) ||
          (nei_ix >= ns) || (nei_iy >= ns)) { continue; }

      let nei_idx = ixy2idx([nei_ix,nei_iy], Nxy);

      if (cm_ctx.B[face_idx][nei_idx] < 0) {
        cm_ctx.B[face_idx][nei_idx] = v+1;
        dstQ.push( [nei_ix, nei_iy, face_idx ] );
      }
    }

  }

  cm_ctx.Q = dstQ;

}

function CM_debug_print(cm_ctx) {

  var printf = require("../lib/printf");

  let ns = cm_ctx.Ns;
  for (let idir=0; idir<6; idir++) {

    console.log("#idir:", idir);
    for (let iy=0; iy<ns; iy++) {
      let s_line = [];
      for (let ix=0; ix<ns; ix++) {
        let idx = ixy2idx([ix,iy], [ns,ns]);

        s_line.push( (cm_ctx.B[idir][idx] < 0) ? ' .' : printf("%2i", cm_ctx.B[idir][idx]) );

      }
      console.log(s_line.join(" "));
    }
    console.log("\n\n");

  }
}

function cm_debug() {

  let cm_ctx = {
    "B": [ [], [], [], [], [], [] ],
    "Q": [],
    "H": [],
    "Ns": -1,
    "Nf": -1
  };

  cm_ctx.Ns = face_sn;
  cm_ctx.Nf = face_sn*face_sn;
  for (let idir=0; idir<6; idir++) {
    for (let i=0; i<cm_ctx.Nf; i++) {
      cm_ctx.B[idir].push(-1);
    }
  }


  CM_debug_print(cm_ctx);

  CM_flood_step(cm_ctx, [1,3,0]);
  CM_debug_print(cm_ctx);

  CM_flood_step(cm_ctx);
  CM_debug_print(cm_ctx);

  //CM_flood_step(cm_ctx);
  //CM_debug_print(cm_ctx);

}



//cm_debug();


function enum_spiral(ixy, nxy) {

  let _di = [1,0];
  let r = 1;

  let n_it = 100;

  let ixy_cur = [ixy[0], ixy[1]];
  let ixy_nxt = [ixy[0], ixy[1]];
  let ixy_c   = [ixy[0], ixy[1]];

  let dir_idx = 0;
  let dir_dxy = [ [1,0], [0,1], [-1,0], [0,-1] ];

  for (let it=0; it<n_it; it++) {

    console.log(ixy_cur[0], ixy_cur[1]);

    ixy_nxt[0] = ixy_cur[0] + dir_dxy[dir_idx][0];
    ixy_nxt[1] = ixy_cur[1] + dir_dxy[dir_idx][1];

    let dxy = [
      Math.abs(ixy_nxt[0]-ixy_c[0]),
      Math.abs(ixy_nxt[1]-ixy_c[1])
    ];


    if ((dxy[0] > r) ||
        (dxy[1] > r)) {
      dir_idx++;

      if (dir_idx==4) {


        r++;
        dir_idx=0;

        console.log("#bang", r, dir_idx);
      }

      ixy_nxt[0] = ixy_cur[0] + dir_dxy[dir_idx][0];
      ixy_nxt[1] = ixy_cur[1] + dir_dxy[dir_idx][1];

    }

    ixy_cur[0] = ixy_nxt[0];
    ixy_cur[1] = ixy_nxt[1];


  }
}

//enum_spiral([0,0], [5,5]);
//process.exit();


function __debug() {
  //DEBUG
  for (let i=0; i<face_sn; i++) {
    for (let j=0; j<face_sn; j++) {
      let idx = ixy2idx([j,i], [face_sn,face_sn] );
      console.log("#idx:", idx);
      let xy = idx2xy( idx, [face_sn,face_sn], 2/face_sn );
      console.log(xy[0], xy[1]);
    }
  }
  process.exit();
}

function _debug1() {
  let P = [];
  let Fi = [];

  let B = [ [], [], [], [], [], [] ];

  for (let idir=0; idir<6; idir++) {
    for (let i=0; i<face_n_bin; i++) { B[idir].push([]); }
  }

  for (let i=0; i<N; i++) {
    let p = njs.mul(2, njs.sub( njs.random([3]), [0.5,0.5,0.5]) ) ;
    P.push(p);
    Fi.push(p_idir(p));
  }

  for (let i=0; i<P.length; i++) {
    _bin_p(P[i], B, [face_sn,face_sn]);
  }

  let _count = 0;
  let _max = -1;
  for (let idir=0; idir<6; idir++) {
    for (let i=0; i<B[idir].length; i++) {
      if (B[idir][i].length > _max) { _max = B[idir][i].length; }
      _count += B[idir][i].length;
    }
  }

  console.log("#P:", P.length, "_count:", _count, "(max:", _max, ")");

  let nxy = [face_sn, face_sn];
  let ds = 2/face_sn;

  for (let idir=0; idir<6; idir++) {

    for (let iy=0; iy<face_sn; iy++) {
      for (let ix=0; ix<face_sn; ix++) {
        let idx = ixy2idx([ix,iy], nxy );
        let xy = idx2xy(idx, nxy, ds);
        let xyz = xy2idir_plane(xy, idir);
        console.log(xyz[0], xyz[1], xyz[2]);
      }
      console.log("\n\n");
    }

    for (let ix=0; ix<face_sn; ix++) {
      for (let iy=0; iy<face_sn; iy++) {
        let idx = ixy2idx([ix,iy], nxy );
        let xy = idx2xy(idx, nxy, ds);
        let xyz = xy2idir_plane(xy, idir);
        console.log(xyz[0], xyz[1], xyz[2]);
      }
      console.log("\n\n");
    }

    for (let i=0; i<B[idir].length; i++) {

      for (let j=0; j<B[idir][i].length; j++) {
        let p = B[idir][i][j];

        let xy = idx2xy(i, nxy, ds);
        let xyz = xy2idir_plane(xy, idir);

        let pxyz = xyz2cubemap(p);

        console.log(p[0], p[1], p[2]);
        console.log(pxyz[0], pxyz[1], pxyz[2], "\n\n");
        //console.log(xyz[0], xyz[1], xyz[2], "\n\n");

      }
    }
  }

}

//_debug1();


function _main() {

  let P = [];
  let Fi = [];

  let B = [ [], [], [], [], [], [] ];

  for (let idir=0; idir<6; idir++) {
    for (let i=0; i<face_n_bin; i++) { B[idir].push([]); }
  }

  for (let i=0; i<N; i++) {
    let p = njs.mul(2, njs.sub( njs.random([3]), [0.5,0.5,0.5]) ) ;
    P.push(p);
    Fi.push(p_idir(p));

    let u = [0,0,0];

    if ((Fi[i] == 0) || (Fi[i] == 1)) {
      u = [ sgn(p[0]), p[1]/p[0], p[2]/p[0] ];
    }

    else if ((Fi[i] == 2) || (Fi[i] == 3)) {
      u = [ p[0]/p[1], sgn(p[1]), p[2]/p[1] ];
    }

    else if ((Fi[i] == 4) || (Fi[i] == 5)) {
      u = [ p[0]/p[2], p[1]/p[2], sgn(p[2]) ];
    }

    console.log(u[0], u[1], u[2], "\n\n");
  }

  //for (let i=0; i<N; i++) { console.log(P[i][0], P[i][1], P[i][2], "\n\n"); }

}






