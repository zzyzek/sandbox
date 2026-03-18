#!/usr/bin/env node

var njs = require("../lib/numeric.js");

let w = 1/5;

//let c = [0.25, 0.5];
//let r = 1/2;

let c = [w/2, 0.5];
let r = njs.norm2(c);

let n_it = 128;

function p2gp(pnt, _connect) {
  _connect = ((typeof _connect === "undefined") ? false : _connect);

  if (pnt.length == 0) { return; }

  for (let i=0; i<pnt.length; i++) {
    console.log(pnt[i][0], pnt[i][1]);
  }

  if (_connect) {
    console.log(pnt[0][0], pnt[0][1]);
  }

  console.log("\n\n");
}

function _circle(c, r, n_it) {
  n_it = ((typeof n_it === "undefined") ? 128 : n_it);

  let pnt = [];

  for (let it = 0; it<=n_it; it++) {
    let theta = 2 * Math.PI * (it/n_it);
    let ct = Math.cos(theta);
    let st = Math.sin(theta);
    let p = [ c[0] + r*ct, c[1] + r*st];
    pnt.push(p);
    //console.log(p[0], p[1]);
  }

  return pnt;

}

p2gp(_circle(c, r, 128), true);

p2gp(_circle([-w/2, 0.5], r, 128), true);
