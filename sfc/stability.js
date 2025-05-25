
var gilbert3dpp = require("./gilbert3dpp.js");

let g2d = gilbert3dpp.Gilbert2D;

function dist(p,q) {
  return Math.sqrt( (p[0] - q[0])*(p[0] - q[0]) + (p[1] - q[1])*(p[1] - q[1]) );
}

let nu_w = 1;

let multi_point = [];
let multi_wh = [];

for (let h=180; h<361; h*=2) {
  let w = Math.floor(nu_w * h);
  multi_point.push( g2d(w,h) );

  multi_wh.push( [w,h] );
}



for (let idx=(multi_point.length-1); idx > 0; idx--) {
  let wh_prv = multi_wh[idx-1];
  let wh_cur = multi_wh[idx];

  for (let p_idx=0; p_idx < multi_point[idx].length; p_idx++) {

    let x_cur = p_idx / multi_point[idx].length;

    let q_idx = Math.floor(x_cur * multi_wh[idx-1][0] * multi_wh[idx-1][1]);

    let pxy = [ multi_point[idx][p_idx][0] / wh_cur[0], multi_point[idx][p_idx][1] / wh_cur[1] ];
    let qxy = [ multi_point[idx-1][q_idx][0] / wh_prv[0], multi_point[idx-1][q_idx][1] / wh_prv[1] ];

    console.log(dist(pxy,qxy), 1);
    //console.log(pxy, qxy, dist(pxy,qxy));
  }
}

