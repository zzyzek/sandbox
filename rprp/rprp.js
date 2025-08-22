// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


var pgon = [
  [1,0],
  [1,2],
  [0,2],
  [0,4],
  [2,4],
  [2,5],
  [4,5],
  [4,3],
  [5,3],
  [5,1],
  [3,1],
  [3,0],
];

function _print_pgon(p) {
  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1]);
  }
}

function _icmp(a,b) {
  if (a < b) { return -1; }
  if (a > b) { return  1; }
  return 0;
}

// https://jeffe.cs.illinois.edu/teaching/comptop/2023/notes/02-winding-number.html
//
function winding(u, pgn) {
  let w = 0;
  let n = pgn.length;

  for (let i=0; i<n; i++) {
    let p = pgn[i];
    let q = pgn[(i+1)%n];

    let d = ((p[0] - u[0])*(q[1] - u[1])) - ((p[1] - u[1])*(q[0] - u[0]));

    if      ((p[0] <= u[0]) && (u[0] < q[0]) && (d > 0)) { w ++; }
    else if ((q[0] <= u[0]) && (u[0] < p[0]) && (d < 0)) { w --; }

  }

  return w;
}

function rectilinearGridPoints(rl_pgon) {

  let x_dup = [],
      y_dup = [];

  if (rl_pgon.length == 0) { return []; }

  for (let i=0; i<rl_pgon.length; i++) {
    x_dup.push(rl_pgon[i][0]);
    y_dup.push(rl_pgon[i][1]);
  }

  x_dup.sort( _icmp );
  y_dup.sort( _icmp );

  let x_dedup = [ x_dup[0] ],
      y_dedup = [ y_dup[0] ];

  for (let i=1; i<x_dup.length; i++) {
    if (x_dup[i] == x_dup[i-1]) { continue; }
    x_dedup.push(x_dup[i]);
  }

  for (let i=1; i<y_dup.length; i++) {
    if (y_dup[i] == y_dup[i-1]) { continue; }
    y_dedup.push(y_dup[i]);
  }

  let grid_xy = [];

  for (let i=0; i<x_dedup.length; i++) {
    for (let j=0; j<y_dedup.length; j++) {
      grid_xy.push( [ x_dedup[i], y_dedup[j] ] );
    }
  }

  return grid_xy;
}

function _ok(P) {

  let all_x_pnt = [],
      all_y_pnt = [],
      x_pnt = [],
      y_pnt = [];

  for (let i=0; i<P.length; i++) {
    all_x_pnt.push(P[i][0]);
    all_y_pnt.push(P[i][1]);
  }

  all_x_pnt.sort( _icmp );
  all_y_pnt.sort( _icmp );

  x_pnt.push(all_x_pnt[0]);
  y_pnt.push(all_y_pnt[0]);

  for (let i=1; i<all_x_pnt.length; i++) {
    if (all_x_pnt[i] != all_x_pnt[i-1]) {
      x_pnt.push(all_x_pnt[i]);
    }
  }

  for (let i=1; i<all_y_pnt.length; i++) {
    if (all_y_pnt[i] != all_y_pnt[i-1]) {
      y_pnt.push(all_y_pnt[i]);
    }
  }

  for (let i=0; i<x_pnt.length; i++) {
    for (let j=0; j<y_pnt.length; j++) {
      console.log("\n\n", x_pnt[i], y_pnt[j]);
    }
  }

}

_print_pgon(pgon);

let grid_p = rectilinearGridPoints(pgon);

for (let i=0; i<grid_p.length; i++) {

  console.log("#winding:", winding(grid_p[i], pgon) );
  console.log(grid_p[i][0], grid_p[i][1], "\n");


}

//_ok(pgon);

