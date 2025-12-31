#!/usr/bin/env node
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// st uv hampath
// experiment to enumerate two space filling paths (s-t, u-v) inside of a
// rectangle
//
// t,v are on the border
//
// color compatibility is:
//
// W*H odd  : exactly three of s,t,u,v are majority parity, one of non-majority parity
// W*H even : two are of 0 parity, two are of 1 parity of s,t,u,v
//


var fasslib = require("./fasslib.js");
var cmp_v = fasslib.cmp_v;
var v_add = fasslib.v_add;
var v_delta = fasslib.v_delta;

function _ifmt(v, s) {
  s = ((typeof s === "undefined") ? 0 : s);
  let t = v.toString();
  let a = [];
  for (let i=0; i<(s-t.length); i++) { a.push(' '); }
  a.push(t);
  return a.join("");
}



function print_grid(g) {
  let h = g.length;
  let w = g[0].length;

  for (let j=0; j<h; j++) {
    let a = [];
    for (let i=0; i<w; i++) {
      a.push( _ifmt(g[j][i], 2) );
    }

    console.log(a.join(" "));
  }
  console.log("");
}

function color_compatible(s,t,u,v, w,h) {
  let n = w*h;

  let p_s = (s[0]+s[1])%2;
  let p_t = (t[0]+t[1])%2;
  let p_u = (u[0]+u[1])%2;
  let p_v = (v[0]+v[1])%2;

  let tot = p_s + p_t + p_u + p_v;

  if      ( ((n%2)==1) && (tot == 1)) { return true; }
  else if ( ((n%2)==0) && (tot == 2)) { return true; }

  return false;
}

function stuv_solve_r(s, idx, g) {

  let h = g.length;
  let w = g[0].length;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  // oob
  //
  if ((s[0] < 0) || (s[0] >= w) ||
      (s[1] < 0) || (s[1] >= h)) {
    return -1;
  }

  // endpoint test, otherwise, trample
  //
  let v = g[ s[1] ][ s[0] ];
  if ( v >= 0 ) { return -1; }
  if ( v < -1 ) {

    // start cell of this path, ignore, 
    //
    if      (v == -2) { /* start cell, ok */ }

    // other start location, invalid
    //
    else if (v == -3) { return -1; }

    // one of the end location, success
    //
    else if (v == -4) {
      g[ s[1] ][ s[0] ] = idx;
      return idx;
    }

    // error?
    //
    else { return -1; }
  }

  // mark cell
  //
  g[s[1]][s[0]] = idx;

  // recur in each cardinal direction
  //
  for (let idir=0; idir<4; idir++) {
    let q = v_add(s, idir_dxy[idir]);
    let r = stuv_solve_r(q, idx+1, g);
    if (r>=0) { return r; }
  }

  // undo
  //
  g[s[1]][s[0]] = -1;

  return -1;
}

function stuv_solve(s0,s1, t0,t1, w,h) {
  let g = [];

  let s0_idx = 0;
  let s1_idx = w*h+1;

  for (let j=0; j<h; j++) {
    g.push([]);
    for (let i=0; i<w; i++) {
      g[j].push(-1);
    }
  }

  // special marker for start point
  //
  g[ s0[1] ][ s0[0] ] = -3;
  g[ s1[1] ][ s1[0] ] = -3;

  // special marker for endpoint
  //
  g[ t0[1] ][ t0[0] ] = -4;
  g[ t1[1] ][ t1[0] ] = -4;


  g[ s0[1] ][ s0[0] ] = -2;
  let r = stuv_solve_r(s0, s0_idx, g);
  if (r<0) { return -1; }

  g[ s1[1] ][ s1[0] ] = -2;
  r = stuv_solve_r(s1, s1_idx, g);
  if (r<0) { return -1; }

  print_grid(g);

  return 0;
}

let w = 5, h = 4;
let s0 = [0,0],
    s1 = [w-1,h-1],
    t0 = [1,1],
    t1 = [w-2,h-2];


let r = stuv_solve(s0,s1,t0,t1, w,h);

console.log("color_compatible:", color_compatible(s0,s1,t0,t1, w,h));
console.log("got:", r);

function _main() {

  let wh = [5,4];

  let perim = [];
  for (let i=0; i<wh[0]; i++) { perim.push( [i,0] ); }
  for (let j=1; j<wh[1]; j++) { perim.push( [wh[0]-1,j] ); }
  for (let i=(wh[0]-2); i>=0; i--) { perim.push( [i, wh[1]-1] ); }
  for (let j=(wh[1]-2); j>0; j--) { perim.push( [0, j] ); }

  let rect_p = [];
  for (let j=0; j<wh[1]; j++) {
    for (let i=0; i<wh[0]; i++) {
      rect_p.push( [i,j] );
    }
  }

  //for (let i=0; i<perim.length; i++) { console.log(perim[i][0], perim[i][1]); }

  for (let p0_idx=0; p0_idx < perim.length; p0_idx++) {
    for (let p1_idx=(p0_idx+1); p1_idx < perim.length; p1_idx++) {

      let p0 = perim[p0_idx];
      let p1 = perim[p1_idx];

      for (let r0_idx=0; r0_idx<rect_p.length; r0_idx++) {
        for (let r1_idx=(r0_idx+1); r1_idx < rect_p.length; r1_idx++) {
          let r0 = rect_p[r0_idx];
          let r1 = rect_p[r1_idx];

          if ( (cmp_v(p0,r0)==0) || (cmp_v(p0,r1)==0) ||
               (cmp_v(p1,r0)==0) || (cmp_v(p1,r1)==0) ) { continue; }

          if (!color_compatible(p0,p1,r0,r1, wh[0], wh[1])) { continue; }

          console.log(p0, p1, r0, r1, color_compatible(p0,p1,r0,r1, wh[0], wh[1]));

        }
      }

    }
  }

}
