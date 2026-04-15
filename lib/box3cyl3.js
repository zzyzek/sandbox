// Javascript port of ported from https://www.geometrictools.com/GTE/Mathematics/IntrCanonicalBox3Cylinder3.h
//
// David Eberly, Geometric Tools, Redmond WA 98052
// Copyright (c) 1998-2026
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt
// https://www.geometrictools.com/License/Boost/LICENSE_1_0.txt
// File Version: 8.0.2025.12.31 (from)
//


var njs = require("./numeric.js");

function cross3(p,q) {
  let c0 = ((p[1]*q[2]) - (p[2]*q[1])),
      c1 = ((p[2]*q[0]) - (p[0]*q[2])),
      c2 = ((p[0]*q[1]) - (p[1]*q[0]));
  return [c0,c1,c2];
}

function Normalize(v, robust) {
  robust = ((typeof robust === "undefined") ? false : robust);
  let N = 3;

  if (robust) {
    let maxAbsComp = Math.abs(v[0]);
    for (let i = 1; i < N; ++i) {
      let absComp = Math.abs(v[i]);
      if (absComp > maxAbsComp) { maxAbsComp = absComp; }
    }

    let length = 0;
    if (maxAbsComp > 0) {
      //v /= maxAbsComp;
      v = njs.mul( 1/maxAbsComp, v )
      length = Math.sqrt(njs.dot(v, v));
      //v /= length;
      v = njs.mul( 1/length, v );
      length *= maxAbsComp;
    }

    else {
      length = 0;
      for (let i = 0; i < N; ++i) { v[i] = 0; }
    }
    return length;
  }

  let length = Math.sqrt(njs.dot(v, v));
  //if (length > 0) { v /= length; }
  if (length > 0) { v = njs.mul( 1/length, v ); }
  else {
    for (let i = 0; i < N; ++i) { v[i] = 0; }
  }
  return length;

}


function Orthonormalize(numInputs, v, robust) {
  robust = ((typeof robust === "undefined") ? false : robust);
  let N = 3;

  //if (v && 1 <= numInputs && numInputs <= N)
  if ((1 <= numInputs) && (numInputs <= N)) {
    let minLength = Normalize(v[0], robust);
    for (let i = 1; i < numInputs; ++i) {
      for (let j = 0; j < i; ++j) {
        let dot = njs.dot(v[i], v[j]);
        v[i] = njs.sub( v[i], njs.mul(dot, v[j]) );
        //v[i] -= v[j] * dot;
      }
      let length = Normalize(v[i], robust);
      if (length < minLength) { minLength = length; }
    }
    return minLength;
  }

  return 0;
}

function ComputeOrthogonalComplement(numInputs, v, robust) {
  robust = ((typeof robust === "undefined") ? false : robust);
  if (numInputs == 1) {
    if (Math.abs(v[0][0]) > Math.abs(v[0][1])) {
      v[1] = [ -v[0][2], 0, +v[0][0] ];
    }
    else {
      v[1] = [ 0, +v[0][2], -v[0][1] ];
    }
    numInputs = 2;
  }

  if (numInputs == 2) {
    v[2] = cross3(v[0], v[1]);
    return Orthonormalize(3, v, robust);
  }

  return 0;
}

function BoxIsOutsideCylinderSlab(box, cyl) {
  let C     = cyl.origin,
      D     = cyl.direction,
      absD  = [ Math.abs(D[0]), Math.abs(D[1]), Math.abs(D[2]) ],
      hDiv2 = cyl.height/2,
      E     = box.extent;

  let intervalCenter = -njs.dot(D,C);
  let intervalRadius = njs.dot(E, absD);
  if (Math.abs(intervalCenter) > (intervalRadius + hDiv2)) {
    return true;
  }
  return false;
}

function CylinderAxisIntersectsBox3D(C, D, hDiv2, E) {
  let negEmCDivD = [
    (-E[0] - C[0]) / D[0],
    (-E[1] - C[1]) / D[1],
    (-E[2] - C[2]) / D[2]
  ];

  let posEmCDivD = [
    (E[0] - C[0]) / D[0],
    (E[1] - C[1]) / D[1],
    (E[2] - C[2]) / D[2]
  ];

  let max01 = Math.max(negEmCDivD[0], negEmCDivD[1]);
  let max23 = Math.max(negEmCDivD[2], -hDiv2);
  let lower = Math.max(max01, max23);
  let min01 = Math.min(posEmCDivD[0], posEmCDivD[1]);
  let min23 = Math.min(posEmCDivD[2], hDiv2);
  let upper = Math.min(min01, min23);
  return lower <= upper;
}

function _ComputeSqrDistance(P0,  P1, C, W0, W1) {
  let P0mC = njs.sub(P0 , C)
  let P1mC = njs.sub(P1 , C);
  let Q0 = [ njs.dot(W0, P0mC), njs.dot(W1, P0mC) ];
  let Q1 = [ njs.dot(W0, P1mC), njs.dot(W1, P1mC) ];

  let zero =  0;
  let direction = njs.sub(Q1 , Q0);

  let s = njs.dot(direction, Q1);
  if (s <= zero) { return njs.dot(Q1, Q1); }

  s = njs.dot(direction, Q0);
  if (s >= zero) { return njs.dot(Q0, Q0); }

  s /= njs.dot(direction, direction);
  let closest = njs.sub(Q0 , njs.mul(s , direction));
  return njs.dot(closest, closest);
}

// Compute the distance from (0,0) to the projection of the segment
// <P0,P1>. The projection plane has origin C and is spanned by the
// orthonormal vectors W0 and W1.
//
function ComputeSqrDistance(P0, P1, C, W0, W1) {   
  let P0mC = njs.sub(P0, C);
  let P1mC = njs.sub(P1, C);
  let Q0 = [ njs.dot(W0, P0mC), njs.dot(W1, P0mC) ];
  let Q1 = [ njs.dot(W0, P1mC), njs.dot(W1, P1mC) ];

  let zero = 0;
  let direction = njs.sub(Q1, Q0);
  let s = njs.dot(direction, Q1);
  if (s <= zero) { return njs.dot(Q1, Q1); }
  else {   
    s = njs.dot(direction, Q0);
    if (s >= zero) { return njs.dot(Q0, Q0); }
    else {   
      s /= njs.dot(direction, direction);
      let closest = njs.sub(Q0, njs.mul(s,direction));
      return njs.dot(closest, closest);
    }
  }
}


function DoQueryTwoZeros( i, C, r, E) {

  // The 2-tuple (C[i[1]], C[i[2]]) is the projected cylinder axis.
  // The 2-tuple (E[i[1]], E[i[2]]) is the extent of the projected
  // canonical box, which is an axis-aligned rectangle.
  //
  let absC1 = Math.abs(C[i[1]]),
      absC2 = Math.abs(C[i[2]]);
  let E1 = E[i[1]],
      E2 = E[i[2]];

  // Test whether the cylinder axis and canonical box intersect.
  //
  if ((absC1 <= E1) && (absC2 <= E2)) { return true; }

  // Compute the squared distance from the projected cylinder axis
  // to the projected canonical box.
  //
  let zero = 0;
  let sqrDistance = zero;
  let delta = absC1 - E1;
  if (delta > zero) { sqrDistance += delta * delta; }

  delta = absC2 - E2;
  if (delta > zero) { sqrDistance += delta * delta; }

  return sqrDistance <= (r * r);
}

function DoQueryOneZero(i, C, D, r, hDiv2, E) {
  let c0 = C[i[0]];
  let c1 = C[i[1]];
  let c2 = C[i[2]];
  let d0 = D[i[0]];
  let d1 = D[i[1]];
  let e0 = E[i[0]];
  let e1 = E[i[1]];
  let e2 = E[i[2]];
  let e0pc0 = e0 + c0,
      e0mc0 = e0 - c0,
      e1pc1 = e1 + c1,
      e1mc1 = e1 - c1;

  // Test whether the cylinder axis and canonical box intersect.
  //
  let  absC2 = Math.abs(c2);
  if (absC2 <= e2) {
    let negEmCDivD = [ -e0pc0 / d0, -e1pc1 / d1 ];
    let posEmCDivD = [ e0mc0 / d0, e1mc1 / d1 ];
    let lower = Math.max(Math.max(negEmCDivD[0], negEmCDivD[1]), -hDiv2);
    let upper = Math.min(Math.min(posEmCDivD[0], posEmCDivD[1]), hDiv2);
    if (lower <= upper) { return true; }
  }

  // Compute the squared distance from the projected cylinder axis
  // (a point) to the projected convex polyhedron (a rectangle).
  //
  let zero = 0;
  let sMin = zero,
      tHat = (d1 * e1mc1) - (d0 * e0pc0);
  if (-hDiv2 <= tHat) {
    if (tHat <= hDiv2)  { sMin = -(d0 * e1mc1 + d1 * e0pc0); }
    else                { sMin = -(e0pc0 + d0 * hDiv2) / d1; }
  }

  // tHat < -h/2
  //
  else { sMin = -(e1mc1 + d1 * hDiv2) / d0; }

  let sMax = zero,
      tBar = (d0 * e0mc0) - (d1 * e1pc1);
  if (-hDiv2 <= tBar) {
    if (tBar <= hDiv2)  { sMax = d0 * e1pc1 + d1 * e0mc0; }
    else                { sMax = (e1pc1 + d1 * hDiv2) / d0; }
  }

  // tBar < -h/2
  //
  else { sMax = (e0mc0 + d0 * hDiv2) / d1; }

  //LogAssert( sMin < sMax, "The s-interval is invalid, which is unexpected.");
  if (sMin < sMax) { return false; }

  let sqrDistance = zero;
  if      (zero < sMin) { sqrDistance += sMin * sMin; }
  else if (sMax < zero) { sqrDistance += sMax * sMax; }

  let delta = absC2 - e2;
  if (delta > zero) { sqrDistance += delta * delta; }

  return sqrDistance <= (r * r);
}



function DoQueryNoZeros(C, D, r, hDiv2, E) {

  // Test whether the cylinder axis and canonical box intersect.
  //
  let negEmCDivD  = [
      (-E[0] - C[0]) / D[0],
      (-E[1] - C[1]) / D[1],
      (-E[2] - C[2]) / D[2]
  ];

  let posEmCDivD = [
      (E[0] - C[0]) / D[0],
      (E[1] - C[1]) / D[1],
      (E[2] - C[2]) / D[2]
  ];

  let max01 = Math.max(negEmCDivD[0], negEmCDivD[1]);
  let max23 = Math.max(negEmCDivD[2], -hDiv2);
  let lower = Math.max(max01, max23);
  let min01 = Math.min(posEmCDivD[0], posEmCDivD[1]);
  let min23 = Math.min(posEmCDivD[2], hDiv2);
  let upper = Math.min(min01, min23);
  if (lower <= upper) { return true; }

  // Compute t[i] = Dot(D, V[i] - C) for box vertices V[i]. These
  // are used in computing the intervals associated with extreme
  // edges.
  //
  let dotDC = njs.dot(D, C);
  let d0e0 = D[0] * E[0], d1e1 = D[1] * E[1], d2e2 = D[2] * E[2];
  let t1 = +d0e0 - d1e1 - d2e2 - dotDC, s1p = t1 + hDiv2, s1n = t1 - hDiv2;
  let t2 = -d0e0 + d1e1 - d2e2 - dotDC, s2p = t2 + hDiv2, s2n = t2 - hDiv2;
  let t3 = +d0e0 + d1e1 - d2e2 - dotDC, s3p = t3 + hDiv2, s3n = t3 - hDiv2;
  let t4 = -d0e0 - d1e1 + d2e2 - dotDC, s4p = t4 + hDiv2, s4n = t4 - hDiv2;
  let t5 = +d0e0 - d1e1 + d2e2 - dotDC, s5p = t5 + hDiv2, s5n = t5 - hDiv2;
  let t6 = -d0e0 + d1e1 + d2e2 - dotDC, s6p = t6 + hDiv2, s6n = t6 - hDiv2;

  // Compute an orthonormal basis containing D.
  let basis = [[0,0,0],[0,0,0],[0,0,0]];
  basis[0] = D;

  ComputeOrthogonalComplement(1, basis);

  console.log("#basis:", JSON.stringify(basis));

  let W0 = basis[1];
  let W1 = basis[2];

  let zero = 0;
  let sqrRadius = r * r;
  let sqrDistance = 0;
  let P0 = [0,0,0], P1 = [0,0,0];

  console.log("#dqnz.0");

  // (U0, -U1)
  //
  lower = ((s1p >= zero) ? -E[2] : (-E[2] - (s1p / D[2])));
  upper = ((s5n <= zero) ? +E[2] : (+E[2] - (s5n / D[2])));
  if (lower <= upper) {
    P0 = [ +E[0], -E[1], lower ];
    P1 = [ +E[0], -E[1], upper ];
    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("##dqnz.0:",
      JSON.stringify(P0),
      JSON.stringify(P1),
      sqrDistance, sqrRadius);

    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.1");

  // (U1, -U0)
  //
  lower = ((s2p >= zero) ? -E[2] : (-E[2] - (s2p / D[2])));
  upper = ((s6n <= zero) ? +E[2] : (+E[2] - (s6n / D[2])));
  if (lower <= upper) {

    P0 = [ -E[0], +E[1], lower ];
    P1 = [ -E[0], +E[1], upper ];
    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("#dqnz.1",
      JSON.stringify(P0),
      JSON.stringify(P1),
      sqrDistance,
      sqrRadius
    );

    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.2");

  // (U0, -U2)
  //
  lower = ((s1p >= zero) ? -E[1] : (-E[1] - (s1p / D[1])));
  upper = ((s3n <= zero) ? +E[1] : (+E[1] - (s3n / D[1])));
  if (lower <= upper) {
    P0 = [ +E[0], lower, -E[2] ];
    P1 = [ +E[0], upper, -E[2] ];
    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("#dqnz.2",
      JSON.stringify(P0),
      JSON.stringify(P1),
      sqrDistance,
      sqrRadius
    );


    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.3");

  // (U2, -U0)
  //
  lower = ((s4p >= zero) ? -E[1] : (-E[1] - (s4p / D[1])));
  upper = ((s6n <= zero) ? +E[1] : (+E[1] - (s6n / D[1])));
  if (lower <= upper) {
    P0 = [ -E[0], lower, +E[2] ];
    P1 = [ -E[0], upper, +E[2] ];
    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("#dqnz.3",
      JSON.stringify(P0),
      JSON.stringify(P1),
      sqrDistance,
      sqrRadius
    );


    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.4");

  // (U1, -U2)
  //
  lower = ((s2p >= zero) ? -E[0] : (-E[0] - (s2p / D[0])));
  upper = ((s3n <= zero) ? +E[0] : (+E[0] - (s3n / D[0])));
  if (lower <= upper) {
    P0 = [ lower, +E[1], -E[2] ];
    P1 = [ upper, +E[1], -E[2] ];
    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("#dqnz.4",
      JSON.stringify(P0),
      JSON.stringify(P1),
      sqrDistance,
      sqrRadius
    );


    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.5");

  // (U2, -U1)
  //
  lower = ((s4p >= zero) ? -E[0] : (-E[0] - (s4p / D[0])));
  upper = ((s5n <= zero) ? +E[0] : (+E[0] - (s5n / D[0])));
  if (lower <= upper) {
    P0 = [ lower, -E[1], +E[2] ];
    P1 = [ upper, -E[1], +E[2] ];
    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("#dqnz.5",
      JSON.stringify(P0),
      JSON.stringify(P1),
      sqrDistance,
      sqrRadius
    );


    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.6");

  // (U0, -D)
  //
  lower = ((s3p >= zero) ? -E[2] : (-E[2] - (s3p / D[2])));
  upper = ((s5p <= zero) ? +E[2] : (+E[2] - (s5p / D[2])));
  if (lower <= upper) {
    if (s3p >= zero)  { P0 = [ +E[0], +E[1] - (s3p / D[1]), -E[2] ]; }
    else              { P0 = [ +E[0], +E[1], -E[2] - (s3p / D[2]) ]; }

    if (s5p <= zero)  { P1 = [ +E[0], -E[1] - (s5p / D[1]), +E[2] ]; }
    else              { P1 = [ +E[0], -E[1], +E[2] - (s5p / D[2]) ]; }

    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);


    console.log("##dqnz.6", s3p, s5p, JSON.stringify(P0), JSON.stringify(P1), sqrDistance, sqrRadius);

    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.7");

  // (D, -U0)
  lower = ((s2n >= zero) ? -E[2] : (-E[2] - (s2n / D[2])));
  upper = ((s4n <= zero) ? +E[2] : (+E[2] - (s4n / D[2])));
  if (lower <= upper) {
    if (s2n >= zero)  { P0 = [ -E[0], +E[1] - (s2n / D[1]), -E[2] ]; }
    else              { P0 = [ -E[0], +E[1], -E[2] - (s2n / D[2]) ]; }

    if (s4n <= zero)  { P1 = [ -E[0], -E[1] - (s4n / D[1]), +E[2] ]; }
    else              { P1 = [ -E[0], -E[1], +E[2] - (s4n / D[2]) ]; }

    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("##dqnz.7", s2n, s4n, JSON.stringify(P0), JSON.stringify(P1), sqrDistance, sqrRadius);

    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.8");

  // (U1, -D)
  //
  lower = ((s6p >= zero) ? -E[0] : (-E[0] - (s6p / D[0])));
  upper = ((s3p <= zero) ? +E[0] : (+E[0] - (s3p / D[0])));
  if (lower <= upper) {
    if (s6p >= zero)  { P0 = [ -E[0], +E[1], +E[2] - (s6p / D[2]) ]; }
    else              { P0 = [ -E[0] - (s6p / D[0]), +E[1], +E[2] ]; }

    if (s3p <= zero)  { P1 = [ +E[0], +E[1], -E[2] - (s3p / D[2]) ]; }
    else              { P1 = [ +E[0] - (s3p / D[0]), -E[1], -E[2] ]; }

    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("##dqnz.8", s6p, s3p, JSON.stringify(P0), JSON.stringify(P1), sqrDistance, sqrRadius);

    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.9");

  // (D, -U1)
  //
  lower = ((s4n >= zero) ? -E[0] : (-E[0] - (s4n / D[0])));
  upper = ((s1n <= zero) ? +E[0] : (+E[0] - (s1n / D[0])));
  if (lower <= upper) {
    if (s4n >= zero)  { P0 = [ -E[0], -E[1], +E[2] - (s4n / D[2]) ]; }
    else              { P0 = [ -E[0] - (s4n / D[0]), -E[1], +E[2] ]; }

    if (s1n <= zero)  { P1 = [ +E[0], -E[1], -E[2] - (s1n / D[2]) ]; }
    else              { P1 = [ +E[0] - (s1n / D[0]), -E[1], -E[2] ]; }

    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("##dqnz.9", s4n, s1n, JSON.stringify(P0), JSON.stringify(P1), sqrDistance, sqrRadius);

    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.10");

  // (U2, -D)
  //
  lower = ((s5p >= zero) ? -E[1] : (-E[1] - (s5p/D[1])));
  upper = ((s6p <= zero) ? +E[1] : (+E[1] - (s6p/D[1])));
  if (lower <= upper) {
    if (s5p >= zero)  { P0 = [ +E[0] - (s5p/D[0]), -E[1], +E[2] ]; }
    else              { P0 = [ +E[0], -E[1] - (s5p/D[1]), +E[2] ]; }

    if (s6p <= zero)  { P1 = [ -E[0] - (s6p/D[0]), +E[1], +E[2] ]; }
    else              { P1 = [ -E[0], E[1] - (s6p/D[1]), +E[2] ]; }

    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("##dqnz.10", s5p, s6p, JSON.stringify(P0), JSON.stringify(P1), sqrDistance, sqrRadius);

    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.11");

  // (D, -U2)
  //
  lower = ((s1n >= zero) ? -E[1] : (-E[1] - (s1n / D[1])));
  upper = ((s2n <= zero) ? +E[1] : (+E[1] - (s2n / D[1])));
  if (lower <= upper) {
    if (s1n >= zero)  { P0 = [ +E[0] - (s1n/D[0]), -E[1], -E[2] ]; }
    else              { P0 = [ +E[0], -E[1] - (s1n/D[1]), -E[2] ]; }

    if (s2n <= zero)  { P1 = [ -E[0] - (s2n/D[0]), +E[1], -E[2] ]; }
    else              { P1 = [ -E[0], E[1] - (s2n/D[1]), -E[2] ]; }

    sqrDistance = ComputeSqrDistance(P0, P1, C, W0, W1);

    console.log("##dqnz.11", s1n, s2n, JSON.stringify(P0), JSON.stringify(P1), sqrDistance, sqrRadius);

    if (sqrDistance <= sqrRadius) { return true; }
  }

  console.log("#dqnz.12");

  return false;
}


function IntrCanonicalBox3Cylinder3(box, cylinder) {

  //LogAssert( cylinder.IsFinite(), "Infinite cylinders are not yet supported.");

  // The result.intersect is initially false.
  let result = {"intersect" : false };

  if (BoxIsOutsideCylinderSlab(box, cylinder)) {
    // The box does not intersect the slab, so it does not
    // intersect the cylinder.
    //
    result.intersect = false;
    return result;
  }

  // Apply reflections to obtain a cylinder whose axis direction is
  // in the first octant (positive- or zero-valued components). The
  // reflections applied to the canonical box do not require any
  // computational changes.
  let zero = 0;
  let C = cylinder.origin;
  let D = cylinder.direction;
  let r = cylinder.radius;
  let hDiv2 = cylinder.height / 2;
  let E = box.extent;
  for (let i = 0; i < 3; ++i) {
    if (D[i] < zero) {
      C[i] = -C[i];
      D[i] = -D[i];
    }
  }

  // D is now in the first octant. The box vertices are
  //   V[0] = (-E[0],-E[1],-E[2]), V[4] = (-E[0],-E[1],+E[2]) 
  //   V[1] = (+E[0],-E[1],-E[2]), V[5] = (+E[0],-E[1],+E[2])
  //   V[2] = (-E[0],+E[1],-E[2]), V[6] = (-E[0],+E[1],+E[2])
  //   V[3] = (+E[0],+E[1],-E[2]), V[7] = (+E[0],+E[1],+E[2])
  //
  if (D[0] > zero) {

    console.log("#cp.a");

    if (D[1] > zero) {

      console.log("#cp.a0");

      if (D[2] > zero)  {

        console.log("#cp.a00", C, D, r, hDiv2, E);

        result.intersect = DoQueryNoZeros(C, D, r, hDiv2, E);

      }
      else              {

        console.log("#cp.a01");

        result.intersect = DoQueryOneZero([ 0, 1, 2 ], C, D, r, hDiv2, E);

      }
    }

    else {

      console.log("#cp.a1");

      if (D[2] > zero)  { result.intersect = DoQueryOneZero([ 2, 0, 1 ], C, D, r, hDiv2, E); }
      else              { result.intersect = DoQueryTwoZeros([ 0, 1, 2 ], C, r, E); }
    }
  }

  else {

    console.log("#cp.b");

    if (D[1] > zero) {

      console.log("#cp.b0");

      if (D[2] > zero)  { result.intersect = DoQueryOneZero([ 1, 2, 0 ], C, D, r, hDiv2, E); }
      else              { result.intersect = DoQueryTwoZeros([ 1, 2, 0 ], C, r, E); }
    }

    else {

      console.log("#cp.b1");

      if (D[2] > zero)  { result.intersect = DoQueryTwoZeros([ 2, 0, 1 ], C, r, E); }
      else              { return { "insersect": false, "error": -1, "message": "The cylinder direction cannot be (0,0,0)."} }
    }
  }

  return result;
}


if (typeof module !== "undefined") {
  module.exports["Normalize"] = Normalize;
  module.exports["cross3"] = cross3;
  module.exports["Normalize"] = Normalize;
  module.exports["Orthonormalize"] = Orthonormalize;
  module.exports["ComputeOrthogonalComplement"] = ComputeOrthogonalComplement;
  module.exports["BoxIsOutsideCylinderSlab"] = BoxIsOutsideCylinderSlab;
  module.exports["ComputeSqrDistance"] = ComputeSqrDistance;
  module.exports["DoQueryTwoZeros"] = DoQueryTwoZeros;
  module.exports["DoQueryOneZero"] = DoQueryOneZero;
  module.exports["DoQueryNoZeros"] = DoQueryNoZeros;
  module.exports["IntrCanonicalBox3Cylinder3"] = IntrCanonicalBox3Cylinder3;
  module.exports["CylinderAxisIntersectsBox3D"] = CylinderAxisIntersectsBox3D;
}

