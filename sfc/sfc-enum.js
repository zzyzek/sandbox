
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

function _sgn(v) {
  if (v>0) { return  1; }
  if (v<0) { return -1; }
  return 0;
}

function v_neg(v) {
  if (v.length==2) { return [-v[0], -v[1]]; }
  return [ -v[0], -v[1], -v[2] ];
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

function in3x3x3(p) {
  return _inBounds(p, [0,0,0], [3,0,0], [0,3,0], [0,0,3]);
}


//---

function path_print(path, id) {
  let p = path[0];
  let q = path[ path.length-1 ];

  let m = path[ Math.floor(path.length/2) ];

  let dxyz = [0,0,0];
  for (let i=1; i<path.length; i++) {
    let u = path[i-1];
    let v = path[i];
    if ( Math.abs(u[0] - v[0]) > 0.5 ) { dxyz[0]++; }
    if ( Math.abs(u[1] - v[1]) > 0.5 ) { dxyz[1]++; }
    if ( Math.abs(u[2] - v[2]) > 0.5 ) { dxyz[2]++; }
  }

  let l_count = 0;
  for (let i=2; i<path.length; i++) {
    let u = path[i-2];
    let v = path[i-1];
    let w = path[i];
    if ( ( Math.abs(u[0] - v[0]) > 0.5 )  &&
         ( Math.abs(v[0] - w[0]) > 0.5 ) ) { l_count++; }

    if ( ( Math.abs(u[1] - v[1]) > 0.5 )  &&
         ( Math.abs(v[1] - w[1]) > 0.5 ) ) { l_count++; }

    if ( ( Math.abs(u[2] - v[2]) > 0.5 )  &&
         ( Math.abs(v[2] - w[2]) > 0.5 ) ) { l_count++; }
  }

  console.log("\n# id:", id, " p(", p[0], p[1], p[2], ") q(", q[0], q[1], q[2], ") xyz(", dxyz[0], dxyz[1], dxyz[2], ") m(", m[0], m[1], m[2], ") l:", l_count );

  for (let i=0; i<path.length; i++) {
    let u = path[i];
    console.log(u[0], u[1], u[2]);
  }

}

function path_clone(path) {
  let _p = [];
  for (let i=0; i<path.length; i++) {
    _p.push( v_clone(path[i]) );
  }
  return _p;
}

function path_enumerate(path, grid, paths) {

  let v_dir = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1]
  ];

  let p = [0,0,0];

  if (path.length == 0) {
    path.push(p);
    grid[0][0][0] = 0;
    return path_enumerate(path, grid, paths)
  }

  if (path.length == (3*3*3)) {
    path_print(path, paths.length);
    paths.push( path_clone(path) );
    return { "found": true, "path": path, "grid": grid };
  }

  let idx = path.length-1;
  p = path[idx];

  for (let idir=0; idir<6; idir++) {
    let q = v_add(p, v_dir[idir]);

    if (!in3x3x3(q)) { continue; }
    if (grid[q[2]][q[1]][q[0]] >= 0) { continue; }

    grid[ q[2] ][ q[1] ][ q[0] ] = idx+1;
    path.push(q);

    let res = path_enumerate(path, grid, paths);
    /*
    if (res.found) {
      paths.push( path_clone(path) );
      return res;
    }
    */

    path.pop(q);
    grid[ q[2] ][ q[1] ][ q[0] ] = -1;

  }

  return { "found": false, "path":[], "grid": [] };
}

let _p = [];
let _grid = [];
for (let z=0; z<3; z++) {
  _grid.push([]);
  for (let y=0; y<3; y++) {
    _grid[z].push([]);
    for (let x=0; x<3; x++) {
      _grid[z][y].push(-1);
    }
  }
}

let _paths = [];

let r = path_enumerate(_p, _grid, _paths)

console.log("#", _paths.length);

