
var _EPS = 1e-9;
var _INF = 1e9;

var njs = require("../lib/numeric.js");
var _rnd = Math.random;


function gnuplot_aabox(box) {
  let E = box;

  console.log( E[0], E[1], E[2]);
  console.log(-E[0], E[1], E[2]);
  console.log(-E[0],-E[1], E[2]);
  console.log( E[0],-E[1], E[2]);
  console.log( E[0], E[1], E[2]);

  console.log( E[0], E[1],-E[2]);
  console.log(-E[0], E[1],-E[2]);
  console.log(-E[0],-E[1],-E[2]);
  console.log( E[0],-E[1],-E[2]);
  console.log( E[0], E[1],-E[2]);
  console.log("\n\n");

  console.log( E[0],-E[1], E[2]);
  console.log( E[0],-E[1],-E[2]);
  console.log("\n\n");

  console.log(-E[0],-E[1], E[2]);
  console.log(-E[0],-E[1],-E[2]);
  console.log("\n\n");

  console.log(-E[0], E[1], E[2]);
  console.log(-E[0], E[1],-E[2]);
  console.log("\n\n");


}


function intersect_ray_box(p, v, B, res_pt) {
  res_pt = ((typeof res_pt === "undefined") ? [0,0,0,0] : res_pt);
  let t = -_INF;
  let T =  _INF;

  for (let d=0; d<3; d++) {
    if (Math.abs(v[d]) < _EPS) {
      if ((p[d] < -B[d]) || (p[d] > B[d])) { return 0; }
    }
    else {
      let ood = 1 / v[d];
      let t0 = (-B[d] - p[d]) * ood;
      let t1 = ( B[d] - p[d]) * ood;
      if (t0 > t1) { let _t=t0; t0=t1; t1=_t; }
      if (t0 > t) { t = t0; }
      if (t1 < T) { T = t1; }
      if (t > T) { return 0; }
    }
  }

  if (typeof res_pt !== "undefined") {
    res_pt[0] = p[0] + v[0]*t;
    res_pt[1] = p[1] + v[1]*t;
    res_pt[2] = p[2] + v[2]*t;
    res_pt[3] = t;
  }

  return 1;
}

function box_corner(B, corner_indicator) {
  let ci = corner_indicator;
  let p = [0,0,0];
  for (let d=0; d<3; d++) {
    p[d] = (ci[id] ? B[d] : -B[d]);
  }
  return p;
}

function _clamp(a,m,M) {
  if (a<m) { return m; }
  if (a>M) { return M; }
  return a;
}

// line segements are bounded, so most of the logic
// below makes sure to choose points on the segment
// if the calculated closest point of the unbounded
// lines is off the end of the segment.
//

// lightly tested
function closest_segment(p0, q0, p1, q1, cs_pt0, cs_pt1) {
  cs_pt0 = ((typeof cs_pt0 === "undefined") ? [0,0,0,0] : cs_pt0);
  cs_pt1 = ((typeof cs_pt1 === "undefined") ? [0,0,0,0] : cs_pt1);

  let d0 = njs.sub(q0, p0);
  let d1 = njs.sub(q1, p1);

  let r = njs.sub(p0, p1);

  let L0 = njs.dot(d0,d0);
  let L1 = njs.dot(d1,d1);
  let _f = njs.dot(d1,r);

  if ((L0 <= _EPS) && (L1 <= _EPS)) {
    for (let i=0; i<3; i++) {
      cs_pt0[i] = p0[i];
      cs_pt1[i] = p1[i];
    }
    cs_pt0[3] = 0;
    cs_pt1[3] = 0;

    let dcs = [
      cs_pt0[0] - cs_pt1[0],
      cs_pt0[1] - cs_pt1[1],
      cs_pt0[2] - cs_pt1[2]
    ];
    return njs.dot(dcs,dcs);
  }

  if (L0 <= _EPS) {
    cs_pt0[3] = 0;
    cs_pt1[3] = _clamp(_f/L1, 0, 1);
  }
  else {
    let _c = njs.dot(d0, r);
    if (L1 <= _EPS) {
      cs_pt1[3] = 0;
      cs_pt0[3] = _clamp(-_c/L0, 0, 1);
    }
    else {
      let _b = njs.dot(d0,d1);
      let denom = (L0*L1) - (_b*_b);

      if (denom != 0) {
        cs_pt0[3] = _clamp( ((_b*_f) - (_c*L1)) / denom, 0, 1 );
      }
      else { cs_pt0[3] = 0; }

      cs_pt1[3] = ((_b*L0) + _f) / L1;

      if (cs_pt1[3] < 0) {
        cs_pt1[3] = 0;
        cs_pt0[3] = _clamp(-_c/L0, 0, 1);
      }
      else if (cs_pt1[3] > 1) {
        cs_pt1[3] = 1;
        cs_pt0[3] = _clamp( (_b - _c) / L0, 0, 1 );
      }

    }
  }

  for (let i=0; i<3; i++) {
    cs_pt0[i] = p0[i] + (d0[i]* cs_pt0[3]);
    cs_pt1[i] = p1[i] + (d1[i]* cs_pt1[3]);
  }

  let dcs = [
    cs_pt0[0] - cs_pt1[0],
    cs_pt0[1] - cs_pt1[1],
    cs_pt0[2] - cs_pt1[2]
  ];

  return njs.dot(dcs,dcs);
}

function intersect_segment_capsule(seg, c0, c1, r, isc_pt) {
  isc_pt = ((typeof isc_pt === "undefined") ? [0,0,0,0] : isc_pt);



}

// Sp : sphere origin ([0,0,0])
// Sr : sphere radius
// Sv : sphere directional vector ([1,1,0])
// v : directional vector of sphere
// B : box, half extent (e.g. [1,2,3] would represent 2,4,6 axis aligned box)
//
function intersect_moving_sphere_box(Sp, Sr, Sv, B, imsb_pt) {
  imsb_pt = ((typeof imsb_pt === "undefined") ? [0,0,0,0] : imsb_pt);

  let p = [ Sp[0], Sp[1], Sp[2] ];
  let r = Sr;
  let SNv = njs.mul( 1 / njs.norm2(Sv), Sv );

  let BS = [
    B[0] + r,
    B[1] + r,
    B[2] + r
  ];

  let _s = intersect_ray_box(p, v, BS, imsb_pt);
  if ((_s == 0) || (imsb_pt[3] > 1)) { return 0; }


  let u = [0, 0, 0],
      v = [0, 0, 0];

  let s_uv = 0;
  for (let d=0; d<3; d++) {
    if (p[d] < -B[d]) { u[d]=1; }
    if (p[d] >  B[d]) { v[d]=1; }

    if (u[d] || v[d]) { s_uv++; }
  }

  let seg = [p, njs.add(p,Sv)];

  if (s_uv == 3) {
    let t = _INF;

    if (intersect_segment_capsule(seg, box_corner(B,v), box_corner(B,[1-v[0],v[1],v[2]]), Sr, imsb_pt)) {
      t = Math.min(t, imsb_pt[3]);
    }

    if (intersect_segment_capsule(seg, box_corner(B,v), box_corner(B,[v[0],1-v[1],v[2]]), Sr, imsb_pt)) {
      t = Math.min(t, imsb_pt[3]);
    }

    if (intersect_segment_capsule(seg, box_corner(B,v), box_corner(B,[v[0],v[1],1-v[2]]), Sr, imsb_pt)) {
      t = Math.min(t, imsb_pt[3]);
    }

    if (t == _INF) { return 0; }
    imsb_pt[3] = t;
    return 1;
  }

  if (s_uv == 1) { return 1; }

  let bc0 = box_corner(B, [1-u[0], 1-u[1], 1-u[2]]);
  let bc1 = box_corner(B, v);

  return intersect_segment_capsule(seg, bc0, bc1, Sr, imsb_pt);
}



function spot_test_irb() {

  let p = [ _rnd(), _rnd(), _rnd() ];
  let v = [ _rnd(), _rnd(), _rnd() ];

  let B = [ _rnd(), _rnd(), _rnd() ];

  gnuplot_aabox(B);

  console.log(p[0], p[1], p[2]);
  console.log(p[0]+v[0], p[1]+v[1], p[2]+v[2]);
  console.log("\n\n");

  console.log("#irb:", intersect_ray_box(p,v,B));

}
//spot_test_irb();

function spot_test_closest_segment() {

  let p0 = [ _rnd(), _rnd(), _rnd() ];
  let p1 = [ _rnd(), _rnd(), _rnd() ];

  let q0 = [ _rnd(), _rnd(), _rnd() ];
  let q1 = [ _rnd(), _rnd(), _rnd() ];

  let u0 = [0,0,0,0];
  let u1 = [0,0,0,0];

  let res = closest_segment(p0,q0, p1,q1, u0, u1);

  console.log(p0[0], p0[1], p0[2]);
  console.log(q0[0], q0[1], q0[2]);
  console.log("\n\n");

  console.log(p1[0], p1[1], p1[2]);
  console.log(q1[0], q1[1], q1[2]);
  console.log("\n\n");

  console.log("#", res);
  console.log(u0[0], u0[1], u0[2]);
  console.log(u1[0], u1[1], u1[2]);
  console.log("\n\n");

}

spot_test_closest_segment();

