#!/usr/bin/env node

var njs = require("../lib/numeric.js");

let _eps = (1.0/(1024.0*1024.0));

let z = 1;
let r = 1/5;

let N = 2048;
let F = 4;

let p0 = [-r,z];
let pv = [1,0];

for (let iy=0; iy<N; iy++) {
  for (let ix=0; ix<N; ix++) {
    let x = F*(ix - (N/2))/(N/2);
    let y = F*(iy - (N/2))/(N/2);

    let q0 = [x,y];
    let qv = [y,-x];

    let ql = njs.norm2(q0);

    if (ql < _eps) { continue; }
    njs.mul( 1/ql, qv );

    let M = [ [qv[0], -pv[0]],
              [qv[1], -pv[1]] ];
    let b = [ p0[0] - q0[0],
              p0[1] - q0[1] ];

    let st = njs.solve(M, b);

    if ((st[0] > 0) &&
        (st[1] > 0) &&
        (st[1] < (2*r))) {
      console.log(x,y, "\n\n");
    }



  }
}
