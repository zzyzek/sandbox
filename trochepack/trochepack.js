// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


function irnd(a, b) {
  if (typeof a === "undefined") {
    a = 2;
    b = 0;

  }
  else if (typeof b === "undefined") {
    b = a;
    a = 0;
  }

  return a + Math.floor((b-a)*Math.random());
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

function v_neg(v) {
  if (v.length==2) { return [-v[0], -v[1]]; }
  return [ -v[0], -v[1], -v[2] ];
}

function dot_v(u,v) {
  if ((u.length == 2) || (v.length == 2)) {
    return  (u[0]*v[0]) + (u[1]*v[1]);
  }
  return (u[0]*v[0]) + (u[1]*v[1]) + (u[2]*v[2]);
}

function v_clone(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push(v[i]);
  }
  return u;
}


function _sgn(v) {
  if (v>0) { return  1; }
  if (v<0) { return -1; }
  return 0;
}

function v_delta(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push( _sgn(v[i]) );
  }
  return u;
}

function abs_sum_v(v) {
  let s = 0;
  for (let i=0; i<v.length; i++) {
    s += Math.abs(v[i]);
  }
  return s;
}

function strdig(val, d) {

  let s = val.toString();
  let n = s.length;

  let pfx_a = []
  for (let i=n; i<d; i++) {
    pfx_a.push(" ");
  }

  return pfx_a.join("") + s;
}

function point_oob(p, B) {
  if ( (p[0] < B[0][0]) ||
       (p[1] < B[0][1]) ||
       (p[2] < B[0][2]) ) {
    return 1;
  }

  if ( (p[0] > B[1][0]) ||
       (p[1] > B[1][1]) ||
       (p[2] > B[1][2]) ) {
    return 1;
  }

  return 0;
}

function grid_print2d(g) {
  let line = [];

  for (let y=0; y<g.length; y++) {
    line = [];
    for (let x=0; x<g[y].length; x++) {
      line.push( strdig(g[y][x], 2) );
    }
    console.log(line.join(" "));
  }

}

function grid_print(g) {
  let line = [];

  for (let z=0; z<g.length; z++) {
    console.log("\n#z:", z);
    for (let y=0; y<g[z].length; y++) {
      line = [];
      for (let x=0; x<g[z][y].length; x++) {
        line.push( strdig(g[z][y][x], 2) );
      }
      console.log(line.join(" "));
    }
  }

  console.log();

}

function countPlanarNeighbor( grid, B, troche, idir ) {

  let idir_idx_order = [
    [1, 2, 0], [1, 2, 0],
    [0, 2, 1], [0, 2, 1],
    [0, 1, 2], [0, 1, 2]
  ];

  let _lookup = [

  ];

  let idx0 = idir_idx_order[idir][0];
  let idx1 = idir_idx_order[idir][1];
  let idx2 = idir_idx_order[idir][2];

  let basis = [ troche.alpha, troche.beta, troche.gamma ];

  let p = troche.p;

  let alpha = basis[idx0];
  let beta = basis[idx1];
  let gamma = basis[idx2];

  let a_len = abs_sum_v(alpha);
  let b_len = abs_sum_v(beta);
  let g_len = abs_sum_v(gamma);

  let d_alpha = v_delta(alpha);
  let d_beta = v_delta(beta);
  let d_gamma = v_delta(gamma);

  let nei_map = {};
  let nei_list = [];

  let res = {
    "nei_count": 0,
    "open_count": 0,
    "type": "",
    "nei_map": {},
    "nei_list": []
  };

  for (let ia=0; ia<a_len; ia++) {
    for (let ib=0; ib<b_len; ib++) {
      let u = v_add( p, v_mul(ia, d_alpha), v_mul(ib, d_alpha), v_neg(d_gamma) );

      if (point_oob(u, B)) { return {"nei_count":0, "nei_map": {}, "nei_list":[], "type":"oob", "open_count": a_len*b_len }; }


      let nei_idx = grid[u[2]][u[1]][u[0]];

      if (nei_idx < 0) {
        res.open_count++;
        continue;
      }

      if (!(nei_idx in nei_map)) {
        res.nei_map[nei_idx] = 1;
        res.nei_list.push(nei_idx);
        res.nei_count ++;
      }

    }
  }


  return res;
}

function get_start_segments(grid) {

  let h = grid.length;
  let w = grid[0].length;

  let cur_id = grid[0][0];
  let cur_seg = {"p": [0,0], "len": 0, "id": cur_id};

  let w_seg = [];
  let h_seg = [];

  for (let x=0; x < w; x++) {
    if (grid[0][x] != cur_id) {
      w_seg.push(cur_seg);

      cur_id = grid[0][x];
      cur_seg = {"p":[x, 0], "len":0, "id":cur_id};
    }
    cur_seg.len++;
  }
  w_seg.push(cur_seg);

  cur_id = grid[0][0];
  cur_seg = {"p": [0,0], "len": 0, "id": cur_id};

  for (let y=0; y < h; y++) {
    if (grid[y][0] != cur_id) {
      h_seg.push(cur_seg);

      cur_id = grid[y][0];
      cur_seg = {"p":[0, y], "len":0, "id":cur_id};
    }
    cur_seg.len++;
  }
  h_seg.push(cur_seg);


  return {"w_seg": w_seg, "h_seg": h_seg} ;

}


function trochepack2d(width, height) {

  let pack = [];
  let grid = [];

  let cur_id = 0;

  let troche_list = [ { "id": cur_id, "p": [0,0], "size": [width, height] } ];

  for (let y=0; y<height; y++) {
    grid.push([]);
    for (let x=0; x<width; x++) {
      grid[y].push(cur_id);
    }
  }
  cur_id++;

  while (1) {

    let seg = get_start_segments(grid);

    console.log(seg);

    if ((seg.w_seg[0].len <= 1) &&
        (seg.h_seg[0].len <= 1)) {
      return pack;
    }

    let wh = irnd();
    if (seg.w_seg[0].len == 1) { wh = 1; }
    if (seg.h_seg[0].len == 1) { wh = 0; }


    let d_a = (wh ? [0,1] : [1,0]);
    let d_b = (wh ? [1,0] : [0,1]);
    let seg_a = (wh ? seg.h_seg : seg.w_seg);
    let seg_b = (wh ? seg.w_seg : seg.h_seg);

    let cur_seg = seg_a[0];

    let q = v_add( cur_seg.p, v_mul( cur_seg.len-1, d_a ) );
    q = v_add( q, seg_b[0].p, v_mul( seg_b[0].len, d_b ) );

    console.log("## adding", [0,0], "to", q, "id:", cur_id);

    let cur_v = [0,0];

    for (let ia=0; ia<q[0]; ia++) {
      for (let ib=0; ib<q[1]; ib++) {


        let v = v_add([0,0], v_mul(ia, d_a), v_mul(ib, d_b));

        console.log("a:", ia, d_a, "b:", ib, d_b, "v:", v);

        grid[v[1]][v[0]] = cur_id;

      }
    }

    /*
    for (let y=0; y<q[1]; y++) {
      let uniq_overwritten_id = {};
      for (let x=0; x<q[0]; x++) {
        uniq_overwritten_id
        grid[y][x] = cur_id;
      }
    }
    */

    cur_id++;

    console.log("#cur_id:", cur_id);
    grid_print2d(grid);

    if (cur_id >= 4) { break; }
  }

  //console.log(q, wh, d_a, d_b, seg_a, seg);

}

trochepack2d(5,7);
process.exit();

function troche_validate(troche_list, B) {

  let grid = [];

  for (let z=B[0][2]; z < B[1][2]; z++ ) {
    grid.push([]);
    for (let y=B[0][1]; y < B[1][1]; y++ ) {
      grid[z].push([]);
      for (let x=B[0][0]; x < B[1][0]; x++ ) {
        grid[z][y].push(-1);
      }
    }
  }

  for (let troche_idx=0; troche_idx<troche_list.length; troche_idx++) {
    let troche = troche_list[troche_idx];

    let p = troche.p;
    let a = troche.alpha;
    let b = troche.beta;
    let g = troche.gamma;

    let d_a = v_delta(a);
    let d_b = v_delta(b);
    let d_g = v_delta(g);

    let a_len = abs_sum_v(a);
    let b_len = abs_sum_v(b);
    let g_len = abs_sum_v(g);

    let q = v_add(p, a, b, g);

    if (point_oob(p, B) || point_oob(q, B)) { return 0; }

    for (let ia=0; ia < a_len; ia++) {
      for (let ib=0; ib < b_len; ib++) {
        for (let ig=0; ig < g_len; ig++) {
          let u = v_add(p, v_mul(ia, d_a), v_mul(ib, d_b), v_mul(ig, d_g));
          grid[u[2]][u[1]][u[0]] = troche_idx;
        }
      }
    }

    //countPlanarNeighbor( grid, B, troche, d_alpha, d_beta, d_gamma );
    //countPlanarNeighbor( grid, B, troche, d_alpha, d_gamma, d_beta );
    //countPlanarNeighbor( grid, B, troche, d_beta, d_gamma, d_alpha );

  }

  for (let troche_idx=0; troche_idx<troche_list.length; troche_idx++) {
    let troche = troche_list[troche_idx];

    let res = countPlanarNeighbor( grid, B, troche, 0,1,2);
    console.log(">>", troche, res);
  }


  grid_print(grid);
}

let B = [[0,0,0], [3,3,3]];

let troche_list = [
  { "p": [0,0,0], "alpha": [1,0,0], "beta": [0,1,0], "gamma": [0,0,2] },
  { "p": [1,0,0], "alpha": [2,0,0], "beta": [0,1,0], "gamma": [0,0,1] },
  { "p": [1,1,0], "alpha": [2,0,0], "beta": [0,1,0], "gamma": [0,0,1] }
];

troche_validate(troche_list, B);


