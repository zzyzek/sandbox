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

function stuv_solve(s0,s1, t0,t1, w,h) {
  let g = [];
  for (let j=0; j<h; j++) {
    g.push([]);
    for (let i=0; i<w; i++) {
      g[j].push(-1);
    }
  }

  g[ s0[1] ][ s0[0] ] = 
}

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

