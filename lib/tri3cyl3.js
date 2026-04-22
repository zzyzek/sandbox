// Javascript port of ported from https://www.geometrictools.com/GTE/Mathematics/IntrTriangle3Cylinder3.h
//
// David Eberly, Geometric Tools, Redmond WA 98052
// Copyright (c) 1998-2026
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt
// https://www.geometrictools.com/License/Boost/LICENSE_1_0.txt
// File Version: 8.0.2025.12.31 (from)
//
// See https://www.geometrictools.com/Documentation/IntersectionTriangleCylinder.pdf
//



var njs = require("./numeric.js");

function Cross(v0, v1) {
  let result = [0,0,0];
  result[0] = (v0[1] * v1[2]) - (v0[2] * v1[1]);
  result[1] = (v0[2] * v1[0]) - (v0[0] * v1[2]);
  result[2] = (v0[0] * v1[1]) - (v0[1] * v1[0]);
  return result;
}

function Normalize(v, robust) {
  robust = ((typeof robust === "undefined") ? false : robust);

  let N = v.length;

  if (robust) {   
    let maxAbsComp = Math.abs(v[0]);
    for (let i = 1; i < N; ++i) {   
      let absComp = Math.abs(v[i]);
      if (absComp > maxAbsComp) { maxAbsComp = absComp; }
    }

    let length;
    if (maxAbsComp > 0) {   
      v = njs.mul( 1/maxAbsComp, v );
      let length = Math.sqrt(njs.dot(v, v));
      v = njs.mul( 1/length, v );
      length *= maxAbsComp;
    }

    else {   
      length = 0;
      for (let i = 0; i < N; ++i) { v[i] = 0; }
    }
    return length;
  }

  else {   
    let length = Math.sqrt(njs.dot(v, v));
    if (length > 0) { v = njs.mul( 1/length, v ); }
    else {   
      for (let i = 0; i < N; ++i) { v[i] = 0; }
    }
    return length;
  }

}

function Orthonormalize(numInputs, v, robust) {   
  robust = ((typeof robust === "undefined") ? false : robust);
  let minLength = Normalize(v[0], robust);
  for (let i = 1; i < numInputs; ++i) {   
    for (let j = 0; j < i; ++j) {   
      let dot = njs.dot(v[i], v[j]);
      v[i] -= v[j] * dot;
    }
    let length = Normalize(v[i], robust);
    if (length < minLength) {   
      minLength = length;
    }
  }
  return minLength;
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
    v[2] = Cross(v[0], v[1]);
    return Orthonormalize(3, v, robust);
  }

  return 0;
}


function Perp(v) { return [v[1], -v[0]]; }
function DotPerp(v0, v1) { return njs.dot(v0, Perp(v1)); }


// triangle = { "v": [ [x0,y0,z0], [x1,y1,x1], [x2,y2,z2] ] }
// cylinder = { "axis": { "origin": [x,y,z], "direction" : [x,y,z] }, "radius": R, "height": H }
//

function IntrTriangle3Cylinder3(triangle, cylinder) {

  let result = {"intersect":-1 };

  // Get a right-handed orthonormal basis from the cylinder axis
  // direction.

  let basis = [ [0,0,0], [0,0,0], [0,0,0] ];
  basis[0] = cylinder.axis.direction;
  ComputeOrthogonalComplement(1, basis);

  // Compute coordinates of the triangle vertices in the coordinate
  // system {C;U0,U1,U2}, where C is the cylinder center and U2 is
  // the cylinder direction. The basis {U0,U1,U2} is orthonormal and
  // right-handed.
  let P = [ [0,0,0], [0,0,0], [0,0,0] ];
  for (let i = 0; i < 3; i++) {   
    let delta = njs.sub( triangle.v[i], cylinder.axis.origin );
    P[i][0] = njs.dot(basis[1], delta);  // x[i]
    P[i][1] = njs.dot(basis[2], delta);  // y[i]
    P[i][2] = njs.dot(basis[0], delta);  // z[i]
  }

  // Sort the triangle vertices so that z[0] <= z[1] <= z[2].
  let j0 = -1, j1 = -1, j2 = -1;
  if (P[0][2] < P[1][2]) {   
    if      (P[2][2] < P[0][2]) { j0 = 2; j1 = 0; j2 = 1; }
    else if (P[2][2] < P[1][2]) { j0 = 0; j1 = 2; j2 = 1; }
    else                        { j0 = 0; j1 = 1; j2 = 2; }
  }

  else {   
    if      (P[2][2] < P[1][2]) { j0 = 2; j1 = 1; j2 = 0; }
    else if (P[2][2] < P[0][2]) { j0 = 1; j1 = 2; j2 = 0; }
    else                        { j0 = 1; j1 = 0; j2 = 2; }
  }

  let z = [ P[j0][2], P[j1][2], P[j2][2] ];

  let hhalf = cylinder.height/2;
  if (z[2] < -hhalf) {   
    result.intersect = false;
    return result;
  }

  if (z[0] > hhalf) {   
    result.intersect = false;
    return result;
  }

  // Project the triangle vertices onto the xy-plane.
  let Q = [
    [ P[j0][0], P[j0][1] ],
    [ P[j1][0], P[j1][1] ],
    [ P[j2][0], P[j2][1] ]
  ];

  let radius = cylinder.radius;
  if ((-hhalf <= z[0]) && (z[2] <= hhalf)) {   
    result.intersect = DiskOverlapsPolygon(3, Q, radius);
    return result;
  }

  if (z[0] < -hhalf) {   
    if (z[2] > hhalf) {   
      if (z[1] >= hhalf) {   
        let numerNeg0 = -hhalf - z[0];
        let numerPos0 = +hhalf - z[0];
        let denom10 = z[1] - z[0];
        let denom20 = z[2] - z[0];
        let dir20 = njs.mul( 1/denom20, njs.sub(Q[2] , Q[0]) );
        let dir10 = njs.mul( 1/denom10, njs.sub(Q[1], Q[0]) );
        let polygon = [
          njs.add(Q[0] , njs.mul(numerNeg0 , dir20)),
          njs.add(Q[0] , njs.mul(numerNeg0 , dir10)),
          njs.add(Q[0] , njs.mul(numerPos0 , dir10)),
          njs.add(Q[0] , njs.mul(numerPos0 , dir20))
        ];
        result.intersect = DiskOverlapsPolygon(4, polygon, radius);
      }

      else if (z[1] <= -hhalf) {     
        let numerNeg2 = -hhalf - z[2];
        let  numerPos2 = +hhalf - z[2];
        let denom02 = z[0] - z[2];
        let denom12 = z[1] - z[2]; 
        let dir02 = njs.mul( 1/denom02, njs.sub(Q[0], Q[2] ) );
        let dir12 = njs.mul( 1/denom12, njs.sub(Q[1], Q[2] ) );
        let polygon = [
          njs.add(Q[2] , nsj.mul(numerNeg2 , dir02)),
          njs.add(Q[2] , njs.mul(numerNeg2 , dir12)),
          njs.add(Q[2] , njs.mul(numerPos2 , dir12)),
          njs.add(Q[2] , njs.mul(numerPos2 , dir02))
        ];
        result.intersect = DiskOverlapsPolygon(4, polygon, radius);
      }

      else {   
        let numerNeg0 = -hhalf - z[0];
        let numerPos0 = +hhalf - z[0];
        let numerNeg1 = -hhalf - z[1];
        let numerPos1 = +hhalf - z[1];
        let denom20 = z[2] - z[0];
        let denom01 = z[0] - z[1];
        let denom21 = z[2] - z[1];
        let dir20 = njs.mul( 1/denom20, njs.sub(Q[2] , Q[0]) );
        let dir01 = njs.mul( 1/denom01, njs.sub(Q[0] , Q[1]) );
        let dir21 = njs.mul( 1/denom21, njs.sub(Q[2] , Q[1]) );
        let polygon = [
          njs.add(Q[0] , njs.mul(numerNeg0 , dir20)),
          njs.add(Q[1] , njs.mul(numerNeg1 , dir01)),
          Q[1],
          njs.add(Q[1] , njs.mul(numerPos1 , dir21)),
          njs.add(Q[0] , njs.mul(numerPos0 , dir20))
        ];
        result.intersect = DiskOverlapsPolygon(5, polygon, radius);
      }
    }

    else if (z[2] > -hhalf) {   
      if (z[1] <= -hhalf) {   
        let numerNeg2 = -hhalf - z[2];
        let denom02 = z[0] - z[2];
        let denom12 = z[1] - z[2];
        let dir02 = njs.mul( 1/denom02, njs.sub(Q[0] , Q[2]) );
        let dir12 = njs.mul( 1/denom12, njs.sub(Q[1] , Q[2]) );
        let polygon = [
          Q[2],
          njs.add(Q[2] , njs.mul(numerNeg2 , dir02)),
          njs.add(Q[2] , njs.mul(numerNeg2 , dir12))
        ];
        result.intersect = DiskOverlapsPolygon(3, polygon, radius);
      }

      else {     
        let numerNeg0 = -hhalf - z[0];
        let denom10 = z[1] - z[0];
        let denom20 = z[2] - z[0]; 
        let dir20 = njs.mul( 1/denom20, njs.sub(Q[2] , Q[0]) );
        let dir10 = njs.mul( 1/denom10, njs.sub(Q[1] , Q[0]) );
        let polygon = [
          njs.add(Q[0] , njs.mul(numerNeg0 , dir20)),
          njs.add(Q[0] , njs.mul(numerNeg0 , dir10)),
          Q[1],
          Q[2]
        ];
        result.intersect = DiskOverlapsPolygon(4, polygon, radius);
      }
    }

    else {   
      if (z[1] < -hhalf)  { result.intersect = DiskOverlapsPoint(Q[2], radius); }
      else                { result.intersect = DiskOverlapsSegment(Q[1], Q[2], radius); }
    }
  }

  else if (z[0] < hhalf) {   
    if (z[1] >= hhalf) {     
      let numerPos0 = +hhalf - z[0];
      let denom10 = z[1] - z[0]; 
      let denom20 = z[2] - z[0]; 
      let dir10 = njs.mul( 1/denom10, njs.sub(Q[1] , Q[0]) );
      let dir20 = njs.mul( 1/denom20, njs.sub(Q[2] , Q[0]) );
      let polygon = [
        Q[0],
        njs.add(Q[0] , njs.mul(numerPos0 , dir10)),
        njs.add(Q[0] , njs.mul(numerPos0 , dir20))
      ];
      result.intersect = DiskOverlapsPolygon(3, polygon, radius);
    }

    else {     
      let numerPos2 = +hhalf - z[2];
      let denom02 = z[0] - z[2]; 
      let denom12 = z[1] - z[2]; 
      let dir02 = njs.mul( 1/denom02, njs.sub(Q[0] , Q[2]) );
      let dir12 = njs.mul( 1/denom12, njs.sub(Q[1] , Q[2]) );
      let polygon = [
        Q[0],
        Q[1],
        njs.add(Q[2] , njs.mul(numerPos2 , dir12)),
        njs.add(Q[2] , njs.mul(numerPos2 , dir02))
      ];
      result.intersect = DiskOverlapsPolygon(4, polygon, radius);
    }
  }

  else {   
    if (z[1] > hhalf) { result.intersect = DiskOverlapsPoint(Q[0], radius); }
    else              { result.intersect = DiskOverlapsSegment(Q[0], Q[1], radius); }
  }

  return result;
}


function DiskOverlapsPoint(Q, radius) { return njs.dot(Q, Q) <= (radius * radius); }

function DiskOverlapsSegment(Q0,  Q1, radius) {   
  let sqrRadius = radius * radius;
  let direction = njs.sub(Q0 , Q1);
  let dot = njs.dot(Q0, direction);
  if (dot <= 0) { return njs.dot(Q0, Q0) <= sqrRadius; }

  let sqrLength = njs.dot(direction, direction);
  if (dot >= sqrLength) { return njs.dot(Q1, Q1) <= sqrRadius; }

  dot = DotPerp(direction, Q0);
  return (dot * dot) <= (sqrLength * sqrRadius);
}

function DiskOverlapsPolygon(numVertices, Q, radius) {   
  let zero = 0;
  let positive = 0, negative = 0;
  let i0, i1;
  for (i0 = numVertices - 1, i1 = 0; i1 < numVertices; i0 = i1++) {   
    let dot = DotPerp(Q[i0], njs.sub(Q[i0] , Q[i1]));
    if      (dot > zero) { ++positive; }
    else if (dot < zero) { ++negative; }
  }

  if ((positive == 0) || (negative == 0)) { return true; }

  for (i0 = numVertices - 1, i1 = 0; i1 < numVertices; i0 = i1++) {   
    if (DiskOverlapsSegment(Q[i0], Q[i1], radius)) {   return true; }
  }

  return false;
}

if (typeof module !== "undefined") {
  module.exports["Cross"] = Cross;
  module.exports["Normalize"] = Normalize;
  module.exports["Orthonormalize"] = Orthonormalize;
  module.exports["ComputeOrthogonalComplement"] = ComputeOrthogonalComplement;
  module.exports["Perp"] = Perp;
  module.exports["DotPerp"] = DotPerp;
  module.exports["IntrTriangle3Cylinder3"] = IntrTriangle3Cylinder3;
  module.exports["DiskOverlapsPoint"] = DiskOverlapsPoint;
  module.exports["DiskOverlapsSegment"] = DiskOverlapsSegment;
  module.exports["DiskOverlapsPolygon"] = DiskOverlapsPolygon;
}
