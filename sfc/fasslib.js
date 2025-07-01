// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var FASSLIB_VERSION = "0.2.0";
var FASSLIB_VERBOSE = 0;

// round to zero version
//
function d2e(_v) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let v2 = Math.floor(v/2);
  if (v==0) { return 0; }
  if ((v2%2)==0) { return m*v2; }
  return m*(v2+1);
}

// round to zero version
//
function d2u(_v) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let v2 = Math.floor(v/2);
  if (v==0) { return 0; }
  if ((v2%2)==1) { return m*v2; }
  return m*(v2+1);
}

// round to zero version
//
function dqe(_v,q) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let vq = Math.floor(v/q);
  if ((vq%2)==0) { return m*vq; }
  return m*(vq+1);
}


// round to zero
// divide by q, force odd
//
function dqu(_v,q) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let vq = Math.floor(v/q);
  if (v==0) { return 0; }
  if ((vq%2)==1) { return m*vq; }
  return m*(vq+1);
}

// round to zero version
//
function v_divq(v,q) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    let _v = Math.abs(v[i]);
    let m = ((v[i]<0) ? -1 : 1);
    u.push( m*Math.floor(_v / q) );
  }
  return u;
}

function v_div2(v) { return v_divq(v,2); }

function _sgn(v) {
  if (v>0) { return  1; }
  if (v<0) { return -1; }
  return 0;
}

function v_neg(v) {
  if (v.length==2) { return [-v[0], -v[1]]; }
  return [ -v[0], -v[1], -v[2] ];
}

function v_add() {
  if (arguments.length == 0) { return []; }
  let u = v_clone(arguments[0]);

  for (let i=1; i<arguments.length; i++) {
    let v = arguments[i];
    let m = Math.min( u.length, v.length );
    for (let j=0; j<m; j++) { u[j] += v[j]; }
  }

  return u;
}


function v_sub() {
  if (arguments.length == 0) { return []; }
  let u = v_clone(arguments[0]);

  for (let i=1; i<arguments.length; i++) {
    let v = arguments[i];
    let m = Math.min( u.length, v.length );
    for (let j=0; j<m; j++) { u[j] -= v[j]; }
  }

  return u;
}


function v_mul(c,v) {
  if (v.length == 2) {
    return [ c*v[0], c*v[1] ];
  }
  return [ c*v[0], c*v[1], c*v[2] ];
}

function dot_v(u,v) {
  if ((u.length == 2) || (v.length == 2)) {
    return  (u[0]*v[0]) + (u[1]*v[1]);
  }
  return (u[0]*v[0]) + (u[1]*v[1]) + (u[2]*v[2]);
}

function abs_sum_v(v) {
  let s = 0;
  for (let i=0; i<v.length; i++) {
    s += Math.abs(v[i]);
  }
  return s;
}

function v_delta(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push( _sgn(v[i]) );
  }
  return u;
}

function v_print(v) {
  if (v.length == 2)  { console.log(v[0], v[1]); }
  else                { console.log(v[0], v[1], v[2]); }
}

function v_clone(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push(v[i]);
  }
  return u;
}

// Test to see if q is within bounds of volume
// whose corner is at p and volume defined by a,b,g
//
// If volume coordinate is positive, the corresponding p
// coordinate is taken to be lower bound.
// Otherwise, if the volume coordinate is negative,
// corresponding p coordinate is taken to be the
// upper bound.
//
// Works in 2 and 3 dimensions.
// Assumes q,p,a,b,g are all simple arrays (of length 2 or 3)
//
// q - query point
// p - corner point
// a - width like dimension
// b - height like dimension
// g - depth like dimension
//
function _inBounds(q, p, a, b, g) {
  let _a = [0,0,0],
      _b = [0,0,0],
      _g = [0,0,0];

  let _p = [0,0,0],
      _q = [0,0,0];

  _a[0] = a[0];
  _a[1] = a[1];
  _a[2] = ((a.length > 2) ? a[2] : 0);

  _b[0] = b[0];
  _b[1] = b[1];
  _b[2] = ((b.length > 2) ? b[2] : 0);

  _q[0] = q[0];
  _q[1] = q[1];
  _q[2] = ((q.length > 2) ? q[2] : 0);

  _p[0] = p[0];
  _p[1] = p[1];
  _p[2] = ((p.length > 2) ? p[2] : 0);

  if (typeof g === "undefined") {
    if      ((_a[0] == 0) && (_b[0] == 0)) { _g[0] = 1; }
    else if ((_a[1] == 0) && (_b[1] == 0)) { _g[1] = 1; }
    else if ((_a[2] == 0) && (_b[2] == 0)) { _g[2] = 1; }
  }
  else { _g = g; }

  let _d = [
    _a[0] + _b[0] + _g[0],
    _a[1] + _b[1] + _g[1],
    _a[2] + _b[2] + _g[2]
  ];

  for (let xyz=0; xyz<3; xyz++) {
    if ( _d[xyz] < 0 ) {
      if ((q[xyz] >  p[xyz]) ||
          (q[xyz] <= (p[xyz] + _d[xyz]))) { return false; }
    }
    else {
      if ((q[xyz] <  p[xyz]) ||
          (q[xyz] >= (p[xyz] + _d[xyz]))) { return false; }
    }
  }

  return true;

}

function cross3(p,q) {
  let c0 = ((p[1]*q[2]) - (p[2]*q[1])),
      c1 = ((p[2]*q[0]) - (p[0]*q[2])),
      c2 = ((p[0]*q[1]) - (p[1]*q[0]));

  return [c0,c1,c2];
}

// compare vectors a,b
//
// return:
//
//   -1 : a lex < b
//    1 : a lex > b
//    0 : a == b
//
function _cmp_v(a,b) {
  let n = ( (a.length < b.length) ? b.length : a.length );
  for (let i=0; i<n; i++) {
    if (a[i] < b[i]) { return -1; }
    if (a[i] > b[i]) { return  1; }
  }
  return 0;
}

// compare vectors a,b using direction axis d_alpha, d_beta, d_gamma
//
// lexigraphical ordering, ordered by the delta alpha, beta and gamma
// vectors.
//
// -1 : a lex < b
//  1 : a lex > b
//  0 : a == b
//
function _cmp_v_d(u,v, d_alpha, d_beta, d_gamma) {
  d_alpha = ((typeof d_alpha == "undefined") ? [1,0,0] : d_alpha);
  d_beta  = ((typeof d_beta  == "undefined") ? [0,1,0] : d_beta);
  d_gamma = ((typeof d_gamma == "undefined") ? [0,0,1] : d_gamma);
  let n = ( (u.length < v.length) ? v.length : u.length );

  let d_abg = [ d_alpha, d_beta, d_gamma ];

  for (let i=0; i<n; i++) {
    let u_val = dot_v(u, d_abg[i]);
    let v_val = dot_v(v, d_abg[i]);

    if (u_val < v_val) { return -1; }
    if (u_val > v_val) { return  1; }
  }

  return 0;
}

function v_lift(v, dim) {
  let u = v_clone(v);
  if (u.length == dim) { return u; }
  if (u.length > dim) { return u.slice(0,dim) }
  for (let i=v.length; i<dim; i++) { u.push(0); }
  return u;
}

function norm2_v(_v) {
  let _eps = (1.0 / (1024.0*1024.));
  let v = ((_v.length == 2) ? [_v[0], _v[1], 0] : _v );
  let s = (v[0]*v[0]) + (v[1]*v[1]) + (v[2]*v[2]);
  if (s < _eps) { return 0; }
  return Math.sqrt(s);
}


// euler rotation or olinde rodrigues
// https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
//
// rotate point v0 around vector vr by radian theta
//
function rodrigues(_v0, _vr, theta) {
  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let v0 = v_lift(_v0, 3);
  let v_r = v_mul( 1 / norm2_v(_vr), _vr );

  return v_add(
    v_mul(c, v0),
    v_add(
      v_mul( s, cross3(v_r,v0)),
      v_mul( (1-c) * dot_v(v_r, v0), v_r )
    )
  );
}



if (typeof module !== "undefined") {

  let func_name_map = {
    "d2e": d2e,
    "d2u": d2u,
    "dqe": dqe,
    "dqu": dqu,
    "v_divq": v_divq,
    "v_div2": v_div2,
    "sgn": _sgn,
    "v_neg": v_neg,
    "v_add": v_add,
    "v_add": v_add,
    "v_sub": v_sub,
    "v_sub": v_sub,
    "v_mul": v_mul,
    "dot_v": dot_v,
    "abs_sum_v": abs_sum_v,
    "v_delta": v_delta,
    "v_print": v_print,
    "v_clone": v_clone,
    "inBounds": _inBounds,
    "cross3": cross3,
    "cmp_v" : _cmp_v,
    "cmp_v_d" : _cmp_v_d,
    "v_lift" : v_lift,
    "norm2_v" : norm2_v,
		"rodrigues": rodrigues
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }
}

