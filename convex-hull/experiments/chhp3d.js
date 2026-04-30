// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// experiments with bounds on convex hull from 3d half plane representation
//

var sr = require("../../lib/seedrandom.js");
var njs = require("../../lib/numeric.js");
var printf = require("../../lib/printf.js");
var fs = require("fs");

var _EPS = (1/(1024*1024));

let _rnd = new sr(123);

function print_grid(g) {
  for (let iz=0; iz<g.length; iz++) {
    for (let iy=0; iy<g[iz].length; iy++) {
      for (let ix=0; ix<g[iz][iy].length; ix++) {
        console.log("# [", ix, iy, iz, "]:", JSON.stringify(g[iz][iy][ix]));
      }
    }
  }
}

function gnuplot_grid_lines(ofn, grid_s) {

  let _lines = [];
  for (let i=0; i<=grid_s; i++) {
    for (let j=0; j<=grid_s; j++) {

      _lines.push( printf("%i %i %i", i, 0, j) );
      _lines.push( printf("%i %i %i\n\n", i, grid_s, j) );

      _lines.push( printf("%i %i %i", 0, i, j) );
      _lines.push( printf("%i %i %i\n\n", grid_s, i, j) );

      _lines.push( printf("%i %i %i", i, j, 0) );
      _lines.push( printf("%i %i %i\n\n", i, j, grid_s) );
    }
  }

  fs.writeFileSync(ofn, _lines.join("\n"));
}

function print_P(p) {
  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1], p[i][2], "\n\n");
  }
}

//---
//---
//---

// HP list of halfplanes
// HP = [
//   { "p" : [ x_0,y_0,z_0 ], "v" : [ vx_0,vy_0,vz_0 ] },
//   { "p" : [ x_1,y_1,z_1 ], "v" : [ vx_1,vy_1,vz_1 ] },
//   ...
//   { "p" : [ x_{n-1},y_{n-1},z_{n-1} ], "v" : [ vx_{n-1},vy_{n-1},vz_{n-1} ] },
// ]
//
function naive_3d_halfplane_convex_hull_bounds(HP, B, p0) {
  p0 = ((typeof p0 === "undefined") ? [0,0,0] : p0);

  let candidate_point = [];

  for (let i0=0; i0<HP.length; i0++) {
    let np0 = njs.dot( HP[i0].v, HP[i0].p );
    for (let i1=(i0+1); i1<HP.length; i1++) {
      let np1 = njs.dot( HP[i1].v, HP[i1].p );
      for (let i2=(i1+1); i2<HP.length; i2++) {
        let np2 = njs.dot( HP[i2].v, HP[i2].p );
        let s = njs.solve( [ HP[i0].v, HP[i1].v, HP[i2].v ], [ np0, np1, np2 ] );

        if ((s[0] < B[0][0]) || (s[1] < B[1][0]) || (s[2] < B[2][0]) ||
            (s[0] > B[0][1]) || (s[1] > B[1][1]) || (s[2] > B[2][1])) { continue; }

        candidate_point.push(s);
      }
    }
  }

  console.log("####", candidate_point.length, HP.length);

  let sched = [];
  for (let hp_idx=0; hp_idx<HP.length; hp_idx++) {
    sched.push( [ njs.norm2(HP[hp_idx].p), hp_idx ] );
  }
  sched.sort( _dist_cmp );

  for (let sched_idx=0; sched_idx < sched.length; sched_idx++) {
    let hp_idx = sched[sched_idx][1];
    let hp = HP[hp_idx];

    for (let ci=0; ci<candidate_point.length; ci++) {
      let cp = candidate_point[ci];
      //if ( njs.dot( hp.v, njs.sub( cp, hp.p ) ) > 0.000001 ) {
      if ( njs.dot( hp.v, njs.sub( cp, hp.p ) ) > _EPS ) {
        candidate_point[ ci ] = candidate_point[ candidate_point.length-1 ];
        candidate_point.pop();
        ci--;
        continue;
      }
    }
  }

  return candidate_point;

  /*

  let _lines = [];
  _lines.push("#candidate_point: " +  candidate_point.length.toString());
  for (let i=0; i<candidate_point.length; i++) {
    let p = candidate_point[i];
    _lines.push( printf("%f %f %f\n\n", p[0]+p0[0], p[1]+p0[1], p[2] +p0[2]) );
  }
  _lines.push("\n\n");
  fs.writeFileSync("cand.gp", _lines.join("\n"));

  let fin_point = [];

  for (let i=0; i<candidate_point.length; i++) {
    let valid = true;
    for (let j=0; j<HP.length; j++) {
      let du = njs.sub( candidate_point[i], HP[j].p );
      let t = njs.dot( du, HP[j].v );

      if (t > 0) { valid = false; break; }
    }

    if (valid) { fin_point.push(njs.add(p0, candidate_point[i])); }
  }

  _lines = [];
  for (let i=0; i<fin_point.length; i++) {
    _lines.push( printf("%f %f %f\n\n", fin_point[i][0], fin_point[i][1], fin_point[i][2]) ) ;
  }
  _lines.push("\n\n");
  fs.writeFileSync("fin.gp", _lines.join("\n") );

  return fin_point;
  */
}

//---
//---
//---

let grid_s = 5;
let grid = [];

let bounds = [ [0,grid_s], [0,grid_s], [0,grid_s]];

let N = grid_s * grid_s * grid_s;

for (let i=0; i<grid_s; i++) {
  grid.push([]);
  for (let j=0; j<grid_s; j++) {
    grid[i].push([]);
    for (let k=0; k<grid_s; k++) {
      grid[i][j].push([]);
    }
  }
}

let P = [];

let m = Math.floor(grid_s/2);
let p0 = njs.add( [m,m,m], [ _rnd(), _rnd(), _rnd() ] );
grid[m][m][m].push(0);
P.push(p0);

let bounds_relative = [
  [ bounds[0][0] - p0[0], bounds[0][1] - p0[0] ],
  [ bounds[1][0] - p0[1], bounds[1][1] - p0[1] ],
  [ bounds[2][0] - p0[2], bounds[2][1] - p0[2] ]
];

console.log("#p0:", printf("%f %f %f", p0[0], p0[1], p0[2]));

for (let i=1; i<N; i++) {
  let q = njs.mul( grid_s, [ _rnd(), _rnd(), _rnd() ] );
  let qi = [ Math.floor(q[0]), Math.floor(q[1]), Math.floor(q[2]) ];

  grid[qi[2]][qi[1]][qi[0]].push( i );
  P.push( q );
}



gnuplot_grid_lines("grid.gp", grid_s);
print_P(P);

//-----
//-----
//-----

let Q = [];
let HP = [];
for (let i=1; i<P.length; i++) {
  let u = njs.sub( P[i], P[0] );
  Q.push( u );

  HP.push( {"p": u, "v": njs.mul( 1 / njs.norm2(u), u ) } );
}

function _dist_cmp(a,b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return  1; }
  return 0;
}

function _cruft() {
  let _dist = [];
  for (let i=0; i<Q.length; i++) {
    _dist.push( [ njs.norm2( Q[i] ), i+1 ] );
  }
  _dist.sort( _dist_cmp );

  let HP_candidate = [];

  for (let i=0; i<_dist.length; i++) {
    let p_idx = _dist[i][1];
    let q_idx = p_idx-1;

    let q = Q[q_idx];

    let _out = false;

    for (let j=0; j<HP_candidate.length; j++) {
      let c = HP_candidate[j].p;
      let v = HP_candidate[j].v;

      let d = njs.dot(v, njs.sub( q, c ));
      if (d > 0) { _out = true; break; }
    }

    if (_out) { continue; }

    HP_candidate.push( { "p": q, "v": njs.mul( 1/njs.norm2(q), q ) } );
  }
}

let V = naive_3d_halfplane_convex_hull_bounds(HP, bounds_relative, p0);

let v_lines = [];
for (let i=0; i<V.length; i++) {
  let u = njs.add( V[i], P[0] );

  v_lines.push( printf("%f %f %f\n\n", u[0], u[1], u[2]) );
}
fs.writeFileSync("v.gp", v_lines.join("\n"));


fs.writeFileSync("p0.gp", printf("%f %f %f\n\n", p0[0], p0[1], p0[2]));

//console.log(HP_candidate);





