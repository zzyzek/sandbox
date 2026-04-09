#!/usr/bin/env node

// vector runs COUNTERCLOCKWISE
//
// Halfplanes are defined as:
//
//   p + vt
//
// where the included space is to
// the left of the v vector.
//

let N = 20;

if (process.argv.length > 2) {
  N = parseInt(process.argv[2]);
}

console.log("#N:", N);

for (let i=0; i<N; i++) {
  let p = [
    (Math.random() - 0.5)*2,
    (Math.random() - 0.5)*2
  ];

  let dv = [ -p[1], p[0] ];

  console.log(p[0], p[1]);
  console.log(p[0] + dv[0], p[1] + dv[1]);
  console.log("\n\n");
}

