// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// An attempt at (a Javascript) implementation of Umans and Lenhart's 1996
// polynomial time algorithm to find Hamiltonian cycles in 2d solid grid graphs.
//
// We'll see how complicated the algorithm gets but I suspect it's not so bad.
// Proofs of correctness are a different matter, thought.
//
// See:
//
// "An Algorithm for Finding Hamiltonian Cycles in Grid Graphs Without Holes" by Christopeher M. Umans (1996)
// https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=bcc9203a455e521dc9f592805f36346ed336f3f0
//
// "Hamiltonian cycles in solid grid graphs" by Christopher Umans and William Lenhart (1997)
// https://authors.library.caltech.edu/records/ayywg-bkr43
//
// Note that there's prior work by Bridgeman, Everett and Briggs but none of them are available online.
//
// My current understanding of the algorithm is as follows:
//
// * initially construct a 2-factor (add widgets and do perfect edge matching)
// * while (an odd alternating strip exists):
//   - find all simple and chained alternating strips, recording their length
//   - find alternating strips, $b$, whose start is on the shortest path from the adjecent end cells
//     in $G ^ { - } _ { F }$ of some other alternating strip, $a$, recording the $a$ to $b$ link
//   - flip the static alternating strip implied by the linking step above, weighting paths by alternating strip
//     length and giving weight 0 to $a \to b$ links
// * if giant component exists, Hamiltonian cycle found, otherwise, no Hamiltonian cycle exists
//   
// I suspect this presentation is more complicated than needed, but I'm still wading through it.
//
// The idea is that the alternating strip flip is the fundamental operation to try and make progress towards
// connecting disparite loops in the 2-factor to create a larger loop and, ultimately, a giant loop representing
// the Hamiltonian cycle.
//
// "Odd" alternating strip flips always connect two components whereas "even" alternating strips leave the component
// count unchanged.
// So the goal is to find the odd alternating strips to flip.
// The problem is that to get to an odd alternating strip, we might need to make a series of even alternating strip flips.
// The problem is further compounded in that if we make a bad schedule choice of even alternating strip flips, we might
// be making an exponential number of even strip flips.
//
// So the algorithm is essentially trying to find a "static" alternating strip sequence that doesn't extraneously flip
// alternating strips enough to provide polynomial time execution.
// The alternating strip sequence flips should end in an odd alternating strip flip to make progress in reducing the 2-factor
// copmonent count (goal is to create a single component 2-factor, aka a Hamiltonian cycle) but if we get into a situation
// where we have multiple components but only even alternating strips, this means a Hamiltonina cycle is not possilble and
// we can bail out.
//
// Some things I'm still confused about:
//
// * why the shortest path in $G ^ { - } _ F$ from endpoints in the alternating strip (why not any path? what happens if we
//   do exiestence rather than shortest?)
//   - This might be because you only want a single strip in the path (taken care of by shortest path requirement)
//     and shortest path is sufficient to ensure progress
// * all the proofs of correctness about what's present, why, and how it leads to correctness
//
// ---
//
// I'm going to try and implement the algorithm as it stands but some things to consider:
//
// * A simple alterteration to the initial widget addition will allow for a 2-factor creation with a path component
// * The even and odd alternating strip sequences are the fundamental unit of operation and I suspect the copmlexity
//   comes from using only them. Creating other units of operation, either replacing these or extending the library,
//   might lead to more intuitive proofs.
//


// We'll try it this way...
// grid is a one dimensinoal array that we reference appropriately
//   maybe grid has numeric value to determine which neighbors it has?
// Gm, Gp dual graphs
//
//


var fasslib = require("./fasslib.js");
var FF = require("./ff_prabod.js");
var fs = require("fs");
var dijkstra = require("./dijkstra.js");

var g_info = {
  "size" : [0,0],
  "grid": [],
  "Gm": [],
  "Gp": []
};

var v_add = fasslib.v_add;
var v_sub = fasslib.v_sub;
var abs_sum_v = fasslib.abs_sum_v;

function debugPrint(grid_info) {
  let size = grid_info.size;
  let grid = grid_info.grid;

  let line = [];

  console.log("#grid (bitmask)");
  for (let y=(size[1]-1); y>=0; y--) {
    line = [];
    for (let x=0; x<size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      line.push( (grid[idx] == 0) ? ' ' : '.' );
    }
    console.log(line.join(""));
  }

  console.log("");
}

function printGrid(grid_info) {
  let size = grid_info.size;
  let grid = grid_info.grid;

  let line = [];

  for (let y=0; y<size[1]; y++) {
    let line = [];
    for (let x=0; x<size[0]; x++) {
      let p = x + (size[0]*y);
      line.push( (grid[p] == 0) ? ' ' : '.' );
    }
    console.log(line.join(""));
  }
}

function dxy2idir(p,q) {
  let dxy = v_sub(q,p);

  let s = abs_sum_v(dxy);
  if (s != 1) { return -1; }

  if (dxy[0] ==  1) { return 0; }
  if (dxy[0] == -1) { return 1; }
  if (dxy[1] ==  1) { return 2; }
  if (dxy[1] == -1) { return 3; }

  return -1;
}

function idx2xy(idx, size) {
  return [ (idx % size[0]), Math.floor(idx / size[0]) ];
}

function xy2idx(p, size) {
  if ((p[0] < 0) || (p[0] >= size[0]) ||
      (p[1] < 0) || (p[1] >= size[1])) {
    return -1;
  }
  return p[0] + p[1]*size[0];
}

function inBounds(p, B) {
  if ((p[0] < B[0][0])) { return false; }
  if ((p[1] < B[0][1])) { return false; }
  if ((p[0] >= B[1][0])) { return false; }
  if ((p[1] >= B[1][1])) { return false; }
  return true;
}

function raise_island(grid_info, p) {
  let g = grid_info.grid;
  let size = grid_info.size;

  let n = size[0]*size[1];

  let flood_g = [];
  for (let i=0; i<n; i++) {
    flood_g.push( g[i] );
  }

  let bounds = [[0,0], [size[0], size[1]]];

  let idx = (p[1]*size[0]) + p[0];

  flood_g[idx] = -1;

  let stack = [
    [ p[0] + 1, p[1] ],
    [ p[0] - 1, p[1] ],
    [ p[0], p[1] + 1 ],
    [ p[0], p[1] - 1 ]
  ];

  while (stack.length > 0) {

    let cur_p = stack.pop();
    if (!inBounds( cur_p, bounds )) { continue; }

    let idx = xy2idx(cur_p, size);
    if (flood_g[idx] != 0) { continue; }

    flood_g[idx] = -1;
    
    stack.push( [ cur_p[0] + 1, cur_p[1] ] );
    stack.push( [ cur_p[0] - 1, cur_p[1] ] );
    stack.push( [ cur_p[0], cur_p[1] + 1 ] );
    stack.push( [ cur_p[0], cur_p[1] - 1 ] );
  }

  for (let i=0; i<n; i++) {
    if (flood_g[i] == 0) { g[i] = 2; }
  }

}

// dilate each point with a 3x3 window
//
function cleanup_heuristic(grid_info) {
  let grid = grid_info.grid;
  let size = grid_info.size;

  let B = [[0,0], [size[0], size[1]]];

  let stack = [];

  let idir_dxy = [
    [ 1, 0 ], [ -1,  0 ],
    [ 0, 1 ], [  0, -1 ]
  ];

  let win_dxy = [
    [-1, -1], [0, -1], [1,-1],
    [-1, 0], [0, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];

  for (let y=0; y<size[1]; y++) {
    for (let x=0; x<size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      if (grid[idx] != 0) { stack.push([x,y]); }
    }
  }

  for (let i=0; i<stack.length; i++) {
    for (let idir=0; idir<win_dxy.length; idir++) {
      let nei_p = v_add( stack[i], win_dxy[idir] );
      if (!inBounds(nei_p, B)) { continue; }

      let idx = xy2idx(nei_p, size);
      grid[idx] = 2;
    }

  }

}

// add in points randomely with probability p_t
// restricted to bounding box B
//
function random_grid(sz, p_t, B) {
  p_t = ((typeof p_t === "undefined") ? 0.5 : p_t );
  B = ((typeof B === "undefined") ? [[0,0], [sz[0], sz[1]]] : B );
  let g = [];
  let n = sz[0]*sz[1];
  for (let i=0; i<n; i++) {
    let p = Math.random();

    let y = Math.floor( i / sz[0] );
    let x = (i % sz[0]);

    if ( (x < B[0][0]) || (y < B[0][1]) ||
         (x >= B[1][0]) || (y >= B[1][1]) ) {
      g.push(0);
      continue;
    }

    if (p < p_t) { g.push(1); }
    else { g.push(0); }
  }

  return g;
}

function random_dilated_solid_grid_graph(sz) {
  let g = [];
  let n = sz[0]*sz[1];
  for (let i=0; i<n; i++) {
    g.push(0);
  }

}

function two_factor_gadget(grid_info) {
  let grid = grid_info.grid;
  let size = grid_info.size;

  let B = [[0,0], [size[0], size[1]]];

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let oppo_idir = [ 1,0, 3,2 ];

  let vtx_map = {};
  let E = [];

  let v_idx = 0;

  let source_v = [],
      sink_v = [];

  let vtx_L = {},
      vtx_R = {};


  // The flow network goes from left (source) to right (sink).
  // The implied graph is bipartite.
  // Convention is that grid parity ( (x+y)%2 ):
  //
  // 0 - internal gadget vertices connect to source (L)
  //     external gadget vertices connect to sink (R)
  // 1 - internal gadget vertices connect to sink (R)
  //     external gadget vertices connect to source (L)
  //
  for (let y=0; y<size[1]; y++) {
    for (let x=0; x<size[0]; x++) {

      let p = [x,y];

      let cur_idx = xy2idx(p, size);
      if (grid[cur_idx] == 0) { continue; }

      let grid_parity = (x + y) % 2;
      let local_v = [];
      for (let idir=0; idir<idir_dxy.length; idir++) {

        let nei_p = v_add(p, idir_dxy[idir]);
        if (!inBounds(nei_p, B)) { continue; }

        let nei_idx = xy2idx(nei_p, size);
        if (grid[nei_idx] != 0) {
          local_v.push( x.toString() + "_" + y.toString() + "." + idir.toString() );
        }

      }

      let base_v_idx = v_idx;

      // what I'm calling external gadget vertices
      //
      for (let i=0; i < local_v.length; i++) {
        E.push([]);
        vtx_map[ local_v[i] ] = v_idx;

        if (grid_parity)  {
          source_v.push( v_idx );
          vtx_L[ local_v[i] ] = v_idx;
        }
        else {
          sink_v.push( v_idx );
          vtx_R[ local_v[i] ] = v_idx;
        }

        v_idx++;
      }

      // what I'm calling internal gadget vertices
      //
      let vtx_a_name = x.toString() + "_" + y.toString() + ".a";
      let vtx_b_name = x.toString() + "_" + y.toString() + ".b";

      E.push([]);
      let vtx_a_idx = v_idx; v_idx++;

      E.push([]);
      let vtx_b_idx = v_idx; v_idx++;

      if (grid_parity == 0)  {
        source_v.push( vtx_a_idx );
        source_v.push( vtx_b_idx );
        vtx_L[ vtx_a_name ] = vtx_a_idx;
        vtx_L[ vtx_b_name ] = vtx_b_idx;
      }
      else {
        sink_v.push( vtx_a_idx );
        sink_v.push( vtx_b_idx );
        vtx_R[ vtx_a_name ] = vtx_a_idx;
        vtx_R[ vtx_b_name ] = vtx_b_idx;
      }

      vtx_map[vtx_a_name] = vtx_a_idx;
      vtx_map[vtx_b_name] = vtx_b_idx;

      // connect internal to external
      // grid parity:
      //
      // 0 : internal -> external
      // 1 : external -> internal
      //
      for (let i=0; i < local_v.length; i++) {
        let t_idx = base_v_idx + i;

        if (grid_parity) {
          E[t_idx].push(vtx_a_idx);
          E[t_idx].push(vtx_b_idx);
        }
        else {
          E[vtx_a_idx].push(t_idx);
          E[vtx_b_idx].push(t_idx);
        }

      }

    }
  }

  // connect external vertices to each other
  //
  for (let y=0; y<size[1]; y++) {
    for (let x=0; x<size[0]; x++) {


      let p = [x,y];
      let cur_idx = xy2idx(p, size);
      if (grid[cur_idx] == 0) { continue; }

      // who choose direction on parity
      // so we only consider half of the external vertices
      //
      let src_grid_parity = (x+y)%2;
      if (src_grid_parity) { continue; }


      for (let idir=0; idir<idir_dxy.length; idir++) {
        let nei_p = v_add(p, idir_dxy[idir]);
        if (!inBounds(nei_p, B)) { continue; }

        let nei_idx = xy2idx(nei_p, size);
        if (grid[nei_idx] != 0) {

          let rdir = oppo_idir[idir];

          let src_key = x.toString() + "_" + y.toString() + "." + idir.toString();
          let dst_key = nei_p[0].toString() + "_" + nei_p[1].toString() + "." + rdir.toString();

          let src_v_idx = vtx_map[src_key];
          let dst_v_idx = vtx_map[dst_key];

          if (src_grid_parity) {
            E[src_v_idx].push(dst_v_idx);
          }
          else {
            E[dst_v_idx].push(src_v_idx);
          }
        }
      }

    }
  }

  let connect_source_sink = 1;

  if (connect_source_sink) {

    let src_v_idx = v_idx; v_idx++;
    let snk_v_idx = v_idx; v_idx++;

    vtx_map["source"] = src_v_idx;
    vtx_map["sink"]   = snk_v_idx;

    E.push([]);
    E.push([]);
    for (let i=0; i<source_v.length; i++) {
      E[src_v_idx].push( source_v[i] );
    }

    for (let i=0; i<sink_v.length; i++) {
      E[ sink_v[i] ].push( snk_v_idx );
    }

  }

  let V = [];
  for (let v=0; v<v_idx; v++) { V.push( "" ); }
  for (let key in vtx_map) {
    let v = vtx_map[key];
    V[v] = key;
  }

  return { "G": vtx_map, "E": E, "V": V };
}

function gadget2dot(gadget_info) {
  let G = gadget_info.G;
  let E = gadget_info.E;

  let v_name_map = {};
  for (let key in G) {
    v_name_map[ G[key] ] = key;
  }

  console.log("digraph G {");
  for (let i=0; i<E.length; i++) {
    for (let j=0; j<E[i].length; j++) {
      console.log( "  ", '"' + v_name_map[i] + '"', "->", '"' + v_name_map[ E[i][j] ] + '"', ";");
    }
  }
  
  console.log("}");
}

function gadget_print(gadget_info) {
  let G = gadget_info.G;
  let E = gadget_info.E;

  let v_name_map = {};
  for (let key in G) {
    v_name_map[ G[key] ] = key;
  }

  for (let i=0; i<E.length; i++) {
    for (let j=0; j<E[i].length; j++) {
      let v = E[i][j];
      console.log("[", i, "->", v, "]:", v_name_map[i], "->", v_name_map[ v ]);
    }
  }
}


function _t0() {
  g_info.size = [3,3];
  g_info.grid = [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1
  ];

  g_info.size = [4,4];
  g_info.grid = [
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1
  ];

  let gadget_info = two_factor_gadget(g_info);

  let n = gadget_info.E.length;

  let ffE = [];
  for (let i=0; i<n; i++) {
    ffE.push([]);
    for (let j=0; j<n; j++) {
      ffE[i].push(0);
    }
  }

  for (let i=0; i<gadget_info.E.length; i++) {
    for (let j=0; j<gadget_info.E[i].length; j++) {
      ffE[i][ gadget_info.E[i][j] ] = 1;
    }
  }


  //console.log(gadget_info);
  //gadget2dot(gadget_info);
  //process.exit();

  let resG = [], flowG = [];
  let flow = FF(ffE, ffE.length-2, ffE.length-1, resG, flowG);



  //console.log(flow);
  //console.log(resG);


  let gi = gadget_info;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  for (let i=0; i<flowG.length; i++) {
    for (let j=0; j<flowG[i].length; j++) {

      if (flowG[i][j] > 0) {

        let u_name = gi.V[i];
        let v_name = gi.V[j];

        if ((u_name == "source") || (u_name == "sink") ||
            (v_name == "source") || (v_name == "sink")) { continue; }

        let u_op = u_name.split(".")[1];
        let v_op = v_name.split(".")[1];

        let u_x = parseInt( u_name.split(".")[0].split("_")[0] );
        let u_y = parseInt( u_name.split(".")[0].split("_")[1] );

        let v_x = parseInt( v_name.split(".")[0].split("_")[0] );
        let v_y = parseInt( v_name.split(".")[0].split("_")[1] );

        if ((u_op == 'a') || (u_op == 'b')) {
          let idir = parseInt(v_op);
          console.log(u_x, u_y);
          console.log(u_x + idir_dxy[idir][0], u_y + idir_dxy[idir][1]);
          console.log("");
        }

        else if ((v_op == 'a') || (v_op == 'b')) {
          let idir = parseInt(u_op);
          console.log(v_x, v_y);
          console.log(v_x + idir_dxy[idir][0], v_y + idir_dxy[idir][1]);
          console.log("");
        }

      }

    }
  }

  process.exit();

  for (let i=0; i<resG.length; i++) {
    for (let j=0; j<resG[i].length; j++) {

      //if (resG[i][j] > 0) { console.log( gi.V[i], "-(", resG[i][j], ")->", gi.V[j] ); }

      if (ffE[i][j] > 0)  {
        let flow_edge = ffE[i][j] - resG[i][j];
        if (flow_edge > 0) {
          //console.log(gi.V[i], "-(", flow_edge, ")->", gi.V[j]);

          let u_name = gi.V[i];
          let v_name = gi.V[j];

          if ((u_name == "source") || (u_name == "sink") ||
              (v_name == "source") || (v_name == "sink")) { continue; }

          let u_op = u_name.split(".")[1];
          let v_op = v_name.split(".")[1];

          let u_x = parseInt( u_name.split(".")[0].split("_")[0] );
          let u_y = parseInt( u_name.split(".")[0].split("_")[1] );

          let v_x = parseInt( v_name.split(".")[0].split("_")[0] );
          let v_y = parseInt( v_name.split(".")[0].split("_")[1] );

          if ((u_op == 'a') || (u_op == 'b')) {
            let idir = parseInt(v_op);
            console.log(u_x, u_y);
            console.log(u_x + idir_dxy[idir][0], u_y + idir_dxy[idir][1]);
            console.log("");
          }

          else if ((v_op == 'a') || (v_op == 'b')) {
            let idir = parseInt(u_op);
            console.log(v_x, v_y);
            console.log(v_x + idir_dxy[idir][0], v_y + idir_dxy[idir][1]);
            console.log("");
          }

        }

      }

    }
  }

}

//----
//----
//----

function ulhp_dualAdjacencyGraph(grid_info) {
  let dual_code_idir = {
    "." : [1,1,1,1],
    " " : [1,1,1,1],
    "'" : [1,1,1,1],
    "o" : [1,1,1,1],

    "^" : [1,1,0,1],
    ">" : [0,1,1,1],
    "v" : [1,1,1,0],
    "<" : [1,0,1,1],

    "c" : [1,0,0,0],
    "n" : [0,0,0,1],
    "p" : [0,1,0,0],
    "u" : [0,0,1,0],

    "L" : [1,0,1,0],
    "F" : [1,0,0,1],
    "7" : [0,1,0,1],
    "J" : [0,1,1,0],

    "-" : [1,1,0,0],
    "|" : [0,0,1,1]
  };

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let oppo = [ 1,0, 3,2 ];

  let grid_code = grid_info.dualG.grid_code;
  let grid_size = grid_info.dualG.size;

  let Adj = {};

  for (let y=0; y<grid_size[1]; y++) {
    for (let x=0; x<grid_size[0]; x++) {
      let idx = x + (y*grid_size[0]);

      let cur_valid_idir = dual_code_idir[ grid_code[idx] ];

      let cur_node_name = x.toString() + "," + y.toString();

      let v_nei = {};

      for (let idir=0; idir<idir_dxy.length; idir++) {
        if (cur_valid_idir[idir] == 0) { continue; }

        let dxy = idir_dxy[idir];
        let nei_cell_xy = [ x + dxy[0], y + dxy[1] ];

        if ((nei_cell_xy[0] < 0) || (nei_cell_xy[0] >= grid_size[0]) ||
            (nei_cell_xy[1] < 0) || (nei_cell_xy[1] >= grid_size[1])) {
          continue;
        }

        let nei_cell_idx = xy2idx( nei_cell_xy, grid_size );
        let nei_code = grid_code[nei_cell_idx];

        let nei_valid_idir = dual_code_idir[ nei_code ];
        if (nei_valid_idir[ oppo[idir] ] == 0) {
          continue;
        }

        let nei_node_name = nei_cell_xy[0].toString() + "," + nei_cell_xy[1].toString();

        v_nei[ nei_node_name ] = 1;

      }

      Adj[ cur_node_name ] = v_nei;

    }
  }

  return Adj;
}


// grid_hook is pretty much ground truth, so we should apply the strip
// to that structure.
// Apply a single strip to grid_hook.
//
function ulhp_applyAlternatingStrip(grid_info, strip) {
  let grid_hook = grid_info.grid_hook;
  let grid_size = grid_info.size;

  let dual_beg = [ strip.s[0], strip.s[1] ];
  let dual_end = [ strip.s[0] + (strip.dxy[0]*(strip.n-1)), strip.s[1] + (strip.dxy[1]*(strip.n-1)) ];

  let xb = [
    Math.min( dual_beg[0]-1, dual_beg[0], dual_end[0]-1, dual_end[0] ),
    Math.max( dual_beg[0]-1, dual_beg[0], dual_end[0]-1, dual_end[0] )
  ];

  let yb = [
    Math.min( dual_beg[1]-1, dual_beg[1], dual_end[1]-1, dual_end[1] ),
    Math.max( dual_beg[1]-1, dual_beg[1], dual_end[1]-1, dual_end[1] )
  ]

  let x = xb[0];
  let y = yb[0];

  y = yb[0];
  for (x=xb[0]; x<xb[1]; x++) {
    let cur_idx = x + (y*grid_size[0]);
    let nxt_idx = (x+1) + (y*grid_size[0]);

    grid_hook[cur_idx] ^= (1 << 0);
    grid_hook[nxt_idx] ^= (1 << 1);
  }

  y = yb[1];
  for (x=xb[0]; x<xb[1]; x++) {
    let cur_idx = x + (y*grid_size[0]);
    let nxt_idx = (x+1) + (y*grid_size[0]);

    grid_hook[cur_idx] ^= (1 << 0);
    grid_hook[nxt_idx] ^= (1 << 1);
  }

  x = xb[0];
  for (y=yb[0]; y<yb[1]; y++) {
    let cur_idx = x + (y*grid_size[0]);
    let nxt_idx = x + ((y+1)*grid_size[0]);

    grid_hook[cur_idx] ^= (1 << 2);
    grid_hook[nxt_idx] ^= (1 << 3);
  }

  x = xb[1];
  for (y=yb[0]; y<yb[1]; y++) {
    let cur_idx = x + (y*grid_size[0]);
    let nxt_idx = x + ((y+1)*grid_size[0]);

    grid_hook[cur_idx] ^= (1 << 2);
    grid_hook[nxt_idx] ^= (1 << 3);
  }

}




// grid_hook is pretty much ground truth, so we should apply the strip
// squence to that structure.
// Apply the array of strips (strip sequence) to grid_hook.
//
function ulhp_applyAlternatingStripSequence(grid_info, strip_sequence) {

  for (let strip_idx=0; strip_idx < strip_sequence.length; strip_idx++) {
    ulhp_applyAlternatingStrip(grid_info, strip_sequence[strip_idx]);
  }

}


// we're in the process of development.
// We're going to assume the two-factor is given,
// the dual is created but we need to construct
// the strip sequence etc.
//
// WIP!!
function ulhp_staticAlternatingStripSequence(grid_info) {

  let idir_ortho_dxy = [
    [ [ 0,-1], [ 0, 1] ],
    [ [ 0, 1], [ 0,-1] ],
    [ [ 1, 0], [-1, 0] ],
    [ [-1, 0], [ 1, 0] ]
  ];

  let strip_info = ulhp_catalogueAlternatingStrip(grid_info);

  // Do a simple test for type III boundary cell.
  // If found, just return the first one.
  //
  for (let strip_idx=0; strip_idx < strip_info.length; strip_idx++) {
    let strip = strip_info[strip_idx];
    if (strip.boundaryCell && (strip.n == 1)) {
      return [ [ strip ] ];
    }
  }

  let adj = ulhp_dualAdjacencyGraph(grid_info);
  let apsp = dijkstra.all_pair_shortest_path(adj);

  // strip graph
  //
  let SG_V = {},
      SG_E = {};

  let start_boundary_strip = [];
  let end_boundary_strip = [];

  let v_begin = {};
  let v_chain = {};

  for (let strip_idx=0; strip_idx < strip_info.length; strip_idx++) {
    let strip = strip_info[strip_idx];
    let cell_key = strip.s[0].toString() + "," + strip.s[1].toString();

    if (strip.type.search('^begin') == 0) { v_begin[ cell_key ] = strip; }
    else                                  { v_chain[ cell_key ] = strip; }

    let node_name = strip.type + ":" + cell_key + ":n" + strip.n.toString() + ":d" + strip.idir.toString() + ":R" + strip.startRegion.toString();

    if (strip.boundaryCell) { start_boundary_strip.push( node_name ); }
    if ((strip.n%2) == 1) { end_boundary_strip.push( node_name ); }

    SG_V[node_name] = strip;
  }

  // link begin if chain lies directly on end dongle
  // link begin if another begin on min path between end dongles
  //
  for (let strip_idx=0; strip_idx < strip_info.length; strip_idx++) {
    let strip = strip_info[strip_idx];
    let cell_key = strip.s[0].toString() + "," + strip.s[1].toString();

    let node_name = strip.type + ":" + cell_key + ":n" + strip.n.toString() + ":d" + strip.idir.toString() + ":R" + strip.startRegion.toString();

    if (!(node_name in SG_E)) {
      SG_E[node_name] = {};
    }

    if ((strip.n%2) == 1) { continue; }

    let xy_e = [
      strip.s[0] + strip.dxy[0]*(strip.n-1),
      strip.s[1] + strip.dxy[1]*(strip.n-1)
    ];

    let xy_l = [
      xy_e[0] + idir_ortho_dxy[strip.idir][0][0],
      xy_e[1] + idir_ortho_dxy[strip.idir][0][1]
    ];

    let xy_r = [
      xy_e[0] + idir_ortho_dxy[strip.idir][1][0],
      xy_e[1] + idir_ortho_dxy[strip.idir][1][1]
    ];

    let l_key = xy_l[0].toString() + "," + xy_l[1].toString();
    let r_key = xy_r[0].toString() + "," + xy_r[1].toString();

    let path_info = dijkstra.all_pair_shortest_path_reconstruct( apsp, l_key, r_key );
    let min_path = path_info.path;
    for (let p_idx=0; p_idx < min_path.length; p_idx++) {

      let v_name = min_path[p_idx];

      if (v_name in v_begin) {

        let dst_strip = v_begin[v_name];
        let dst_node_name = dst_strip.type + ":" +
                            v_name + ":" +
                            "n" + dst_strip.n.toString() + ":" +
                            "d" + dst_strip.idir.toString() + ":" +
                            "R" + dst_strip.startRegion.toString();

        if (!(dst_node_name in SG_E[node_name])) {
          SG_E[node_name][dst_node_name] = strip.n;
        }
      }

      if ( ((p_idx == 0) || (p_idx == (min_path.length-1))) &&
           (v_name in v_chain) ) {

        let dst_strip = v_chain[v_name];
        let dst_node_name = dst_strip.type + ":" +
                            v_name + ":" +
                            "n" + dst_strip.n.toString() + ":" +
                            "d" + dst_strip.idir.toString() + ":" +
                            "R" + dst_strip.startRegion.toString();

        if (!(dst_node_name in SG_E[node_name])) {
          SG_E[node_name][dst_node_name] = strip.n;
        }

      }

    }

  }


  let SG_apsp = dijkstra.all_pair_shortest_path(SG_E);

  let SG_dist = SG_apsp.dist;

  let static_alternating_strip_nodes = [];
  let static_alternating_strips = [];

  for (let s_idx=0; s_idx < start_boundary_strip.length; s_idx++) {
    let s_name = start_boundary_strip[s_idx];

    for (let e_idx=0; e_idx < end_boundary_strip.length; e_idx++) {
      let e_name = end_boundary_strip[e_idx];

      if (e_name in SG_dist[s_name]) {
        let p_info = dijkstra.all_pair_shortest_path_reconstruct(SG_apsp, s_name, e_name);
        static_alternating_strip_nodes.push( p_info.path );

        let static_alternating_strip = [];
        for (let p_idx = 0; p_idx < p_info.path.length; p_idx++) {
          static_alternating_strip.push( SG_V[ p_info.path[p_idx] ] );
        }
        static_alternating_strips.push( static_alternating_strip );

      }
    }
  }

  return static_alternating_strips;
}



function ulhp_dualRegionFlood(grid_info) {
  let dual_code_idir = {
    "." : [1,1,1,1],
    " " : [1,1,1,1],
    "'" : [1,1,1,1],
    "o" : [1,1,1,1],

    "^" : [1,1,0,1],
    ">" : [0,1,1,1],
    "v" : [1,1,1,0],
    "<" : [1,0,1,1],

    "c" : [1,0,0,0],
    "n" : [0,0,0,1],
    "p" : [0,1,0,0],
    "u" : [0,0,1,0],

    "L" : [1,0,1,0],
    "F" : [1,0,0,1],
    "7" : [0,1,0,1],
    "J" : [0,1,1,0],

    "-" : [1,1,0,0],
    "|" : [0,0,1,1]
  };

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let oppo = [ 1,0, 3,2 ];

  let grid_region = [];
  let cell_queue = [];

  let grid_size = grid_info.dualG.size;
  let grid_code = grid_info.dualG.grid_code;

  for (let idx = 0; idx < grid_code.length; idx++) {
    grid_region.push(-1);
    cell_queue.push(idx);
  }
  let cur_region_id = 0;

  for (let _i=0; _i<cell_queue.length; _i++) {
    let cell_idx = cell_queue[_i];

    if (grid_region[cell_idx] >= 0) { continue; }

    let flood_stack = [ cell_idx ];

    while (flood_stack.length > 0) {

      // if it's in the stack, process it and
      // we mark it with the region
      //
      let flood_cell_idx = flood_stack.pop();
      grid_region[flood_cell_idx] = cur_region_id;

      let flood_cell_code = grid_code[flood_cell_idx];
      let flood_cell_xy = idx2xy( flood_cell_idx, grid_size );

      let is_open_cell = false;
      if ( (flood_cell_code == ".") ||
           (flood_cell_code == " ") ||
           (flood_cell_code == "'") ) {
        is_open_cell = true;
      }

      // traverse neighbors,
      // if they're within bounds and the region is unmarked,
      // put it in the stack for processing.
      //
      let cur_valid_idir = dual_code_idir[ flood_cell_code ];

      for (let idir=0; idir < cur_valid_idir.length; idir++) {
        if (cur_valid_idir[idir] == 0) { continue; }

        let dxy = idir_dxy[ idir ];

        let nei_cell_xy = [
          flood_cell_xy[0] + dxy[0],
          flood_cell_xy[1] + dxy[1]
        ];

        if ((nei_cell_xy[0] < 0) || (nei_cell_xy[0] >= grid_size[0]) ||
            (nei_cell_xy[1] < 0) || (nei_cell_xy[1] >= grid_size[1])) {
          continue;
        }

        let nei_cell_idx = xy2idx( nei_cell_xy, grid_size );
        let nei_code = grid_code[nei_cell_idx];

        // make sure we can 'dock' to neighbor
        //
        let nei_valid_idir = dual_code_idir[ nei_code ];
        if (nei_valid_idir[ oppo[idir] ] == 0) {
          continue;
        }

        // add if not already filled
        //
        if (grid_region[nei_cell_idx] < 0) {
          flood_stack.push(nei_cell_idx);
        }

      }
    }

    // one region processed, go onto the next
    //
    cur_region_id++;
  }

  return grid_region;
}


// Following the papers, the cells are labelled:
//
// type I:   *---*       type II:  *---*
//                                 |
//           *   *                 *   *
//
// type III: *---*
//
//           *---*
//
// with rotations allowed
//
// I've added a type IV cell for convenience:
//
// type IV:  *---*
//           |
//           *---*
//
// type doesn't change due to rotations.
//
// The code is, starting with the above representation
// and rotating counter clockwise:
//
// type I:    ^ < v >
// type II:   F L J 7
// type III:  - |
// type IV:   c u p n
//
// empty:     . ' ' (space)
//
//
function ulhp_catalogueAlternatingStrip(grid_info) {
  let dualG = grid_info.dualG;

  let grid_code = dualG.grid_code;
  let grid_size = dualG.size;

  let typeI_start = [],
      typeII_start = [],
      typeIII_start = [],
      typeIV_start = [];

  let dualBound = [ [0,0], [grid_size[0],grid_size[1]] ];

  let grid_region = ulhp_dualRegionFlood(grid_info);

  for (let y=0; y<grid_size[1]; y++) {
    for (let x=0; x<grid_size[0]; x++) {
      let idx = x + (y*grid_size[0]);

      if ((grid_code[idx] == '^') ||
          (grid_code[idx] == 'v') ||
          (grid_code[idx] == '>') ||
          (grid_code[idx] == '<')) {
        typeI_start.push( {"x":x, "y":y, "code": grid_code[idx] } );
      }

      if ((grid_code[idx] == 'F') ||
          (grid_code[idx] == '7') ||
          (grid_code[idx] == 'J') ||
          (grid_code[idx] == 'L')) {
        typeII_start.push( {"x":x, "y":y, "code": grid_code[idx] } );
      }

      if ((grid_code[idx] == '-') ||
          (grid_code[idx] == '|')) {
        typeIII_start.push( {"x":x, "y":y, "code": grid_code[idx] } );
      }


      if ((grid_code[idx] == 'c') ||
          (grid_code[idx] == 'n') ||
          (grid_code[idx] == 'p') ||
          (grid_code[idx] == 'u')) {
        typeIV_start.push( {"x":x, "y":y, "code": grid_code[idx] } );
      }

    }
  }

  // direction we want to find strip goes
  // in opposite direction of dark edge
  //
  let typei_start_code_dxy = {
    ">" : [-1, 0], "<": [ 1, 0],
    "v" : [ 0, 1], "^": [ 0,-1]
  };

  let typei_start_code_idir = {
    ">" : 1, "<": 0,
    "v" : 2, "^": 3
  };

  // direction of strip,
  // need to check other direction in opposite
  // direction to see if there's a strip next to it
  //
  let typeii_start_code_dxy = {
    "F": [ [ 1, 0], [ 0,-1] ],
    "7": [ [ 0,-1], [-1, 0] ],
    "J": [ [-1, 0], [ 0, 1] ],
    "L": [ [ 0, 1], [ 1, 0] ]
  }

  let typeii_start_code_idir = {
    "F": [ 0, 3 ],
    "7": [ 3, 1 ],
    "J": [ 1, 2 ],
    "L": [ 2, 0 ]
  }

  let typeiii_start_code_dxy = {
    "|" : [ [1,0], [-1,0] ],
    "-" : [ [0,1], [0,-1] ]
  };

  let typeiii_start_code_idir = {
    "|" : [0,1],
    "-": [2,3]
  };

  let typeiv_candidate_idir = {
    'c': 1, 'p': 0,
    'n': 2, 'u': 3
  };

  let oppo = [1,0, 3,2, 5,4];

  let idir_dxy  = [ [ 1, 0], [-1, 0], [ 0, 1], [ 0,-1] ];
  let oppo_dxy  = [ [-1, 0], [ 1, 0], [ 0,-1], [ 0, 1] ];

  let ortho_dxy = [
    [ [0,1], [0,-1] ],
    [ [0,-1], [0,1] ],
    [ [1,0], [-1,0] ],
    [ [-1,0], [1,0] ]
  ];

  let strip_seq = [];

  for (let i=0; i<typeI_start.length; i++) {
    let sx = typeI_start[i].x,
        sy = typeI_start[i].y,
        code = typeI_start[i].code;
    let s_idx = sx + (sy*grid_size[0]);

    let idir = typei_start_code_idir[code];

    let dxy = typei_start_code_dxy[code];
    let cur_x = sx,
        cur_y = sy,
        cur_n = 1;

    let boundaryCell = false;
    let sm_xy = [ sx + oppo_dxy[idir][0], sy + oppo_dxy[idir][1] ];
    let pl_xy = [ sx + dxy[0] + ortho_dxy[idir][0][0], sy + dxy[1] + ortho_dxy[idir][0][1] ];
    let pr_xy = [ sx + dxy[0] + ortho_dxy[idir][1][0], sy + dxy[1] + ortho_dxy[idir][1][1] ];

    if (inBounds([sx,sy], dualBound) && inBounds(sm_xy, dualBound) &&
        inBounds(pl_xy, dualBound) && inBounds(pr_xy, dualBound)) {
      let sm_idx = sm_xy[0] + (sm_xy[1]*grid_size[0]);
      let pl_idx = pl_xy[0] + (pl_xy[1]*grid_size[0]);
      let pr_idx = pr_xy[0] + (pr_xy[1]*grid_size[0]);
      if ( (grid_region[s_idx] == 0) &&
           ((grid_region[sm_idx] != grid_region[pl_idx]) ||
            (grid_region[sm_idx] != grid_region[pr_idx])) ) {
        boundaryCell = true;
      }
    }

    while ( (cur_x >= 0) && (cur_x < grid_size[0]) &&
            (cur_y >= 0) && (cur_y < grid_size[1]) ) {

      let cur_idx = cur_x + (cur_y*grid_size[0]);
      let cur_code = grid_code[cur_idx];

      if ( (cur_code == '|') || (cur_code == '-') ) {
        strip_seq.push({
          "s": [sx,sy],
          "dxy": [dxy[0], dxy[1]],
          "idir": idir,
          "n": cur_n,
          "type": "begin.i",
          "startRegion": grid_region[s_idx],
          "boundaryCell": boundaryCell
        });
        break;
      }

      cur_x += dxy[0];
      cur_y += dxy[1];
      cur_n ++;
    }

  }


  // These type III cells don't really have an idir, so the 0 is mostly a placeholder.
  //
  for (let i=0; i<typeIII_start.length; i++) {
    let sx = typeIII_start[i].x,
        sy = typeIII_start[i].y,
        code = typeIII_start[i].code;
    let s_idx = sx + (sy*grid_size[0]);

    let boundaryCell = false;

    let a_dxy = typeiii_start_code_dxy[code][0];
    let b_dxy = typeiii_start_code_dxy[code][1];

    let a_xy = [sx + a_dxy[0], sy + a_dxy[1] ];
    let b_xy = [sx + b_dxy[0], sy + b_dxy[1] ];

    if (inBounds(a_xy, dualBound) && inBounds(b_xy, dualBound)) {
      let a_idx = a_xy[0] + (a_xy[1]*grid_size[0]);
      let b_idx = b_xy[0] + (b_xy[1]*grid_size[0]);

      if ( (grid_region[s_idx] == 0) &&
           (grid_region[a_idx] != grid_region[b_idx]) ) {
        boundaryCell = true;
      }
    }

    strip_seq.push({
      "s": [sx,sy],
      "dxy" : [0,0],
      "idir": 0,
      "n": 1,
      "type": "begin.iii",
      "startRegion": grid_region[s_idx],
      "boundaryCell": boundaryCell
    });
  }

  // idir_pair holds direction to look for the strip,
  // so we need to do contortions to get the neighboring
  // cell in the *opposite* direction of the probe
  // to see if it's a type III neighbor
  //
  // This one is the most complex because we need to do
  // neighbor checking to make sure the shared edge cell
  // is of type III.
  //
  // We don't care about chain cells that are boundary cells
  // as we don't ever start an alternating stip sequence
  // with a chain.
  // The boundaryCell here is a placeholder and doesn't indicate
  // whether it actually is a boundary or not.
  //
  for (let i=0; i<typeII_start.length; i++) {
    let sx = typeII_start[i].x,
        sy = typeII_start[i].y,
        code = typeII_start[i].code;

    let s_idx = sx + (sy*grid_size[0]);

    let idir_pair = typeii_start_code_idir[code];

    for (let idir_pair_idx=0; idir_pair_idx < 2; idir_pair_idx++) {
      let idir_cur    = idir_pair[idir_pair_idx];
      let idir_ortho  = idir_pair[(idir_pair_idx+1)%2];

      let dxy       = idir_dxy[idir_cur];
      let ortho_dxy = idir_dxy[idir_ortho];

      let oppo_ortho_dxy = oppo_dxy[idir_ortho];

      let ortho_nei_x = sx + oppo_ortho_dxy[0];
      let ortho_nei_y = sy + oppo_ortho_dxy[1];

      let idir_ortho_oppo = oppo[idir_ortho];

      if ((ortho_nei_x < 0) || (ortho_nei_x >= grid_size[0]) ||
          (ortho_nei_y < 0) || (ortho_nei_y >= grid_size[1])) {
        continue;
      }

      let nei_idx = ortho_nei_x + (ortho_nei_y*grid_size[0]);
      let nei_code = grid_code[nei_idx];

      let valid_start_chain = false;

      if      ( ((idir_ortho_oppo == 0) || (idir_ortho_oppo == 1)) &&
                (nei_code == '|') ) {
        valid_start_chain = true;
      }

      else if ( ((idir_ortho_oppo == 2) || (idir_ortho_oppo == 3)) &&
                (nei_code == '-') ) {
        valid_start_chain = true;
      }

      if (!valid_start_chain) { continue; }

      let cur_x = sx;
      let cur_y = sy;

      let cur_n = 1;

      while ( (cur_x >= 0) && (cur_x < grid_size[0]) &&
              (cur_y >= 0) && (cur_y < grid_size[1]) ) {
        let cur_idx = cur_x + (cur_y*grid_size[0]);
        let cur_code = grid_code[cur_idx];
        if ( (cur_code == '|') || (cur_code == '-') ) {
          strip_seq.push({
            "s": [sx,sy],
            "dxy": [dxy[0], dxy[1]],
            "idir": idir_cur,
            "n": cur_n,
            "type": "chain.ii",
            "startRegion": grid_region[s_idx],
            "boundaryCell": false
          });
          break;
        }

        cur_x += dxy[0];
        cur_y += dxy[1];
        cur_n ++;
      }

    }

  }

  // "type IV" cells are cul-de-sacs.
  // We need to add these as single length
  // chain cells if their neighbor is an
  // alternating cell.
  //
  // These cells can't be boundary cells
  // as they're not bridgiing boundaries.
  // As above, we don't start alternating strip
  // sequences with a chain strip so the
  // boundaryCell value can be effectively ignored.
  //
  //
  for (let i=0; i<typeIV_start.length; i++) {
    let sx = typeIV_start[i].x,
        sy = typeIV_start[i].y,
        code = typeIV_start[i].code;

    let s_idx = sx + (sy*grid_size[0]);

    let idir = typeiv_candidate_idir[code];
    let dxy = idir_dxy[idir];

    let nei_x = sx + dxy[0];
    let nei_y = sy + dxy[1];

    if ((nei_x < 0) || (nei_x >= grid_size[0]) ||
        (nei_y < 0) || (nei_y >= grid_size[1])) {
      continue;
    }

    let nei_idx = nei_x + (nei_y*grid_size[0]);
    let nei_code = grid_code[nei_idx];

    if ((nei_code == '-') || (nei_code == '|')) {
      strip_seq.push({
        "s": [sx,sy],
        "dxy": [dxy[0], dxy[1]],
        "idir": idir,
        "n": 1,
        "type":"chain.iv",
        "startRegion": grid_region[s_idx],
        "boundaryCell": false
      });
    }

  }

  return strip_seq;
}



//----
//----
//----

function ulhp_initTwoFactor(grid_info) {

  let gadget_info = two_factor_gadget(grid_info);

  let n = gadget_info.E.length;

  // init flow graph adjacency matrix
  //
  let ffE = [];
  for (let i=0; i<n; i++) {
    ffE.push([]);
    for (let j=0; j<n; j++) {
      ffE[i].push(0);
    }
  }

  // populate
  //
  for (let i=0; i<gadget_info.E.length; i++) {
    for (let j=0; j<gadget_info.E[i].length; j++) {
      ffE[i][ gadget_info.E[i][j] ] = 1;
    }
  }

  // Ford-Fulkerson is pretty bad run-time (and memory)
  // I think Hopcroft-Karp is going to do much better,
  // at either $O(|E| \sqrt{V})$ or $O(|E| \log(V))$ since
  // it's sparse (?).
  // For now, I'm leaving this in, because the actual
  // algorithm is the priority but this is already way too
  // slow and we need to get to it in the future.
  //
  let resG = [], flowG = [];
  let flow = FF(ffE, ffE.length-2, ffE.length-1, resG, flowG);

  let gi = gadget_info;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let two_factor_idx_edge = [];


  for (let i=0; i<flowG.length; i++) {
    for (let j=0; j<flowG[i].length; j++) {

      if (flowG[i][j] > 0) {

        let u_name = gi.V[i];
        let v_name = gi.V[j];

        if ((u_name == "source") || (u_name == "sink") ||
            (v_name == "source") || (v_name == "sink")) { continue; }

        let u_op = u_name.split(".")[1];
        let v_op = v_name.split(".")[1];

        let u_x = parseInt( u_name.split(".")[0].split("_")[0] );
        let u_y = parseInt( u_name.split(".")[0].split("_")[1] );

        let v_x = parseInt( v_name.split(".")[0].split("_")[0] );
        let v_y = parseInt( v_name.split(".")[0].split("_")[1] );

        if ((u_op == 'a') || (u_op == 'b')) {
          let idir = parseInt(v_op);


          let _p = [u_x, u_y];
          let _q = [u_x + idir_dxy[idir][0], u_y + idir_dxy[idir][1]];

          let src_idx = xy2idx( _p, grid_info.size );
          let dst_idx = xy2idx( _q, grid_info.size );

          two_factor_idx_edge.push( [src_idx, dst_idx] );

        }

        else if ((v_op == 'a') || (v_op == 'b')) {
          let idir = parseInt(u_op);
          let _p = [v_x, v_y];
          let _q = [v_x + idir_dxy[idir][0], v_y + idir_dxy[idir][1]];

          let src_idx = xy2idx( _p, grid_info.size );
          let dst_idx = xy2idx( _q, grid_info.size );

          two_factor_idx_edge.push( [src_idx, dst_idx] );

        }

      }

    }
  }

  let debug = false;


  if (debug) {
    for (let i=0; i<two_factor_idx_edge.length; i++) {
      let edge_idx = two_factor_idx_edge[i];

      let p = idx2xy( edge_idx[0], grid_info.size );
      let q = idx2xy( edge_idx[1], grid_info.size );

      console.log(p[0], p[1]);
      console.log(q[0], q[1]);
      console.log("");
    }
  }

  // one hot encoding of which edges go out of each grid vertex
  //
  let two_deg_grid = [];
  for (let i=0; i<grid_info.grid.length; i++) { two_deg_grid.push(0); }

  let oppo = [ 1,0, 3,2, 5,4 ];

  for (let i=0; i<two_factor_idx_edge.length; i++) {
    let edge_idx = two_factor_idx_edge[i];

    let p_idx = edge_idx[0];
    let q_idx = edge_idx[1];

    let p = idx2xy( p_idx, grid_info.size );
    let q = idx2xy( q_idx, grid_info.size );

    let pq_idir = dxy2idir(p,q);
    let qp_idir = oppo[pq_idir];

    two_deg_grid[p_idx] = (two_deg_grid[p_idx] | (1 << pq_idir));
    two_deg_grid[q_idx] = (two_deg_grid[q_idx] | (1 << qp_idir));

    if (debug) {
      if ((p[0] == 6) && (p[1] == 1)) {
        console.log("#", p, "(", q, ")", pq_idir, "(", qp_idir, ")", two_deg_grid[p_idx], "(", two_deg_grid[q_idx], ")");
      }
    }

  }

  //grid_info["two_deg_grid"] = two_deg_grid;
  grid_info["grid_hook"] = two_deg_grid;

  return;
}

function ulhp_dependency(grid_info) {
  let two_deg_grid = grid_info.grid_hook;

  let depG_size = [ grid_info.size[0]+1, grid_info.size[1]+1 ];
  let depG_grid  = [];
  let depG_n = depG_size[0] * depG_size[1];
  for (let i=0; i<depG_n; i++) { depG_grid.push( 0 ); }

  for (let dep_idx=0; dep_idx < depG_n; dep_idx++) {
    let dep_xy = idx2xy( dep_idx, depG_size );

    let vtx_parity = (dep_xy[0] + dep_xy[1]) % 2;
    let vtx_hook = 0;

    let dep_type = 0;

    let grid_idx_pp = xy2idx( dep_xy, grid_info.size );
    let grid_idx_mp = xy2idx( [ dep_xy[0]-1, dep_xy[1] ], grid_info.size );
    let grid_idx_mm = xy2idx( [ dep_xy[0]-1, dep_xy[1]-1 ], grid_info.size );
    let grid_idx_pm = xy2idx( [ dep_xy[0], dep_xy[1]-1 ], grid_info.size );

    let edge_idir = [-1,-1,-1,-1];

    if ((grid_idx_pp >= 0) && (grid_idx_mp >= 0)) {
      if (grid_info.grid[grid_idx_pp] && grid_info.grid[grid_idx_mp]) {
        edge_idir[2] = 0;
      }
    }

    if ((grid_idx_mp >= 0) && (grid_idx_mm >= 0)) {
      if (grid_info.grid[grid_idx_mp] && grid_info.grid[grid_idx_mm]) {
        edge_idir[1] = 0;
      }
    }

    if ((grid_idx_mm >= 0) && (grid_idx_pm >= 0)) {
      if (grid_info.grid[grid_idx_mm] && grid_info.grid[grid_idx_pm]) {
        edge_idir[3] = 0;
      }
    }

    if ((grid_idx_pm >= 0) && (grid_idx_pp >= 0)) {
      if (grid_info.grid[grid_idx_pm] && grid_info.grid[grid_idx_pp]) {
        edge_idir[0] = 0;
      }
    }

    if (grid_idx_pp >= 0) {
      if (two_deg_grid[grid_idx_pp] & (1 << 1)) { edge_idir[2] = ((edge_idir[2] == -1) ? -1 : 1); }
      if (two_deg_grid[grid_idx_pp] & (1 << 3)) { edge_idir[0] = ((edge_idir[0] == -1) ? -1 : 1); }
    }

    if (grid_idx_mp >= 0) {
      if (two_deg_grid[grid_idx_mp] & (1 << 0)) { edge_idir[2] = ((edge_idir[2] == -1) ? -1 : 1); }
      if (two_deg_grid[grid_idx_mp] & (1 << 3)) { edge_idir[1] = ((edge_idir[1] == -1) ? -1 : 1); }
    }

    if (grid_idx_mm >= 0) {
      if (two_deg_grid[grid_idx_mm] & (1 << 0)) { edge_idir[3] = ((edge_idir[3] == -1) ? -1 : 1); }
      if (two_deg_grid[grid_idx_mm] & (1 << 2)) { edge_idir[1] = ((edge_idir[1] == -1) ? -1 : 1); }
    }

    if (grid_idx_pm >= 0) {
      if (two_deg_grid[grid_idx_pm] & (1 << 1)) { edge_idir[3] = ((edge_idir[3] == -1) ? -1 : 1); }
      if (two_deg_grid[grid_idx_pm] & (1 << 2)) { edge_idir[0] = ((edge_idir[0] == -1) ? -1 : 1); }
    }


    if (vtx_parity == 0) {
      if (edge_idir[0] == 0) { vtx_hook = (vtx_hook | (1 << 0)); }
      if (edge_idir[1] == 0) { vtx_hook = (vtx_hook | (1 << 1)); }

      if (edge_idir[2] == 1) { vtx_hook = (vtx_hook | (1 << 2)); }
      if (edge_idir[3] == 1) { vtx_hook = (vtx_hook | (1 << 3)); }
    }
    if (vtx_parity == 1) {
      if (edge_idir[0] == 1) { vtx_hook = (vtx_hook | (1 << 0)); }
      if (edge_idir[1] == 1) { vtx_hook = (vtx_hook | (1 << 1)); }

      if (edge_idir[2] == 0) { vtx_hook = (vtx_hook | (1 << 2)); }
      if (edge_idir[3] == 0) { vtx_hook = (vtx_hook | (1 << 3)); }
    }

    depG_grid[dep_idx] = vtx_hook;

  }

  grid_info.depG = {
    "size" : depG_size,
    "grid_hook" : depG_grid
  };

  return grid_info;
}

function ulhp_dual(grid_info) {
  let debug = false;

  //let two_deg_grid = grid_info.two_deg_grid;
  let two_deg_grid = grid_info.grid_hook;

  if (debug) {
    for (let y= (grid_info.size[1]-1); y>=0; y--) {
      let a = [];
      for (let x=0; x<grid_info.size[0]; x++) {
        a.push( two_deg_grid[ xy2idx( [x,y], grid_info.size ) ] );
      }
      console.log( "#", a.join(" ") );
    }
  }

  //let dualG_size = [ grid_info.size[0]+2, grid_info.size[1]+2 ];
  let dualG_size = [ grid_info.size[0]+1, grid_info.size[1]+1 ];
  let dualG_grid  = [];
  let dualG_n = dualG_size[0] * dualG_size[1];
  for (let i=0; i<dualG_n; i++) { dualG_grid.push( 0 ); }

  for (let dual_idx=0; dual_idx < dualG_n; dual_idx++) {
    let dual_xy = idx2xy( dual_idx, dualG_size );

    let dual_type = 0;

    let grid_idx_pp = xy2idx( dual_xy, grid_info.size );
    let grid_idx_mp = xy2idx( [ dual_xy[0]-1, dual_xy[1] ], grid_info.size );
    let grid_idx_mm = xy2idx( [ dual_xy[0]-1, dual_xy[1]-1 ], grid_info.size );
    let grid_idx_pm = xy2idx( [ dual_xy[0], dual_xy[1]-1 ], grid_info.size );

    let edge_idir = [-1,-1,-1,-1];

    if ((grid_idx_pp >= 0) && (grid_idx_mp >= 0)) {
      if (grid_info.grid[grid_idx_pp] && grid_info.grid[grid_idx_mp]) {
        edge_idir[2] = 0;
      }
    }

    if ((grid_idx_mp >= 0) && (grid_idx_mm >= 0)) {
      if (grid_info.grid[grid_idx_mp] && grid_info.grid[grid_idx_mm]) {
        edge_idir[1] = 0;
      }
    }

    if ((grid_idx_mm >= 0) && (grid_idx_pm >= 0)) {
      if (grid_info.grid[grid_idx_mm] && grid_info.grid[grid_idx_pm]) {
        edge_idir[3] = 0;
      }
    }

    if ((grid_idx_pm >= 0) && (grid_idx_pp >= 0)) {
      if (grid_info.grid[grid_idx_pm] && grid_info.grid[grid_idx_pp]) {
        edge_idir[0] = 0;
      }
    }

    if ((edge_idir[0] < 0) ||
        (edge_idir[1] < 0) ||
        (edge_idir[2] < 0) ||
        (edge_idir[3] < 0)) {
      dualG_grid[dual_idx] = dualCode(edge_idir);
      continue;
    }


    if (grid_idx_pp >= 0) {
      if (two_deg_grid[grid_idx_pp] & (1 << 1)) { edge_idir[2] = 1; }
      if (two_deg_grid[grid_idx_pp] & (1 << 3)) { edge_idir[0] = 1; }
    }

    if (grid_idx_mp >= 0) {
      if (two_deg_grid[grid_idx_mp] & (1 << 0)) { edge_idir[2] = 1; }
      if (two_deg_grid[grid_idx_mp] & (1 << 3)) { edge_idir[1] = 1; }
    }

    if (grid_idx_mm >= 0) {
      if (two_deg_grid[grid_idx_mm] & (1 << 0)) { edge_idir[3] = 1; }
      if (two_deg_grid[grid_idx_mm] & (1 << 2)) { edge_idir[1] = 1; }
    }

    if (grid_idx_pm >= 0) {
      if (two_deg_grid[grid_idx_pm] & (1 << 1)) { edge_idir[3] = 1; }
      if (two_deg_grid[grid_idx_pm] & (1 << 2)) { edge_idir[0] = 1; }
    }

    dualG_grid[dual_idx] = dualCode(edge_idir);

  }


  if (debug) {
    console.log("#dualG");
    for (let y= (dualG_size[1]-1); y>=0; y--) {
      let a = [];
      for (let x=0; x<dualG_size[0]; x++) {
        a.push( dualG_grid[ xy2idx( [x,y], dualG_size ) ] );
      }
      console.log( "#", a.join(" ") );
    }
  }

  grid_info.dualG = {
    "size" : dualG_size,
    "grid_code" : dualG_grid
  };

  return;
}

function dualCode(edge_idir) {
  // type IV
  //
  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 0)) {
    return 'o';
  }

  // type III
  //
  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 1)) {
    return '-';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 0)) {
    return '|';
  }

  // type II
  //
  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 0)) {
    return '7';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 0)) {
    return 'F';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 1)) {
    return 'L';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 1)) {
    return 'J';
  }

  // Type I
  //
  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 0)) {
    return '>';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 0)) {
    return '<';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 0)) {
    return '^';
  }

  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 1)) {
    return 'v';
  }

  // type "V" (not specified in paper)
  // cul-de-sac dead end
  //
  if ((edge_idir[0] == 0) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 1)) {
    return 'c';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 0) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 1)) {
    return 'p';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 0) &&
      (edge_idir[3] == 1)) {
    return 'u';
  }

  if ((edge_idir[0] == 1) &&
      (edge_idir[1] == 1) &&
      (edge_idir[2] == 1) &&
      (edge_idir[3] == 0)) {
    return 'n';
  }

  return '.';
}

//----
//----
//----

// grid_info is assume to hold size and grid bit mask
//
// input:
// grid_info = {
//   "size": [ <width>, <height> ]
//   "grid": [ <array of 1,0, 1 vertex, 0 no vertex> ]
// }
//
// output:
// {
//   "return" : <0 success, !0 error>,
//   "msg": <string message>,
//   "path" : <array of [x,y] points in path>
// }
//
function ulhp_HamiltonianCycleSolidGridGraph(grid_info) {
  let size = grid_info.size;
  let grid = grid_info.grid;

  let n_it = 0;

  let n_v = 0;
  let beg_xy = [-1,-1];
  for (let idx=0; idx<grid.length; idx++) {
    if (grid[idx]) {
      if (n_v == 0) { beg_xy = idx2xy( idx, size ); }
      n_v++;
    }
  }

  console.log("# ULHC:SGG: n_v:", n_v, "beg_xy:", beg_xy);

  ulhp_initTwoFactor(grid_info);
  ulhp_dual(grid_info);

  let static_strip_seq = ulhp_staticAlternatingStripSequence( grid_info );
  while (static_strip_seq.length > 0) {

    console.log("#  n_it:", n_it);
    n_it++;

    ulhp_applyAlternatingStripSequence( grid_info, static_strip_seq[0] );

    ulhp_dual( grid_info );

    static_strip_seq = ulhp_staticAlternatingStripSequence( grid_info );

  }

  let grid_hook = grid_info.grid_hook;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let path = [];

  let prv_idx = -1;
  let cur_idx = xy2idx( beg_xy, size );
  for (let i=0; i<n_v; i++) {

    let cur_xy = idx2xy( cur_idx, size );
    let nxt_idx = -1;

    path.push(cur_xy);

    for (let idir=0; idir<4; idir++) {
      if (grid_hook[cur_idx] & (1 << idir)) {
        let dxy = idir_dxy[idir];
        let nxt_xy = [ cur_xy[0] + dxy[0], cur_xy[1] + dxy[1] ];
        let t_idx = xy2idx( nxt_xy, size );

        if (t_idx == prv_idx) { continue; }

        nxt_idx = t_idx;
        break;
      }
    }

    prv_idx = cur_idx;
    cur_idx = nxt_idx;

  }

  return path;
}


//----
//----
//----

function export_grid(fn, grid_info) {
  fs.writeFileSync(fn, JSON.stringify(grid_info, undefined, 2));
}

function import_grid(fn) {
  return JSON.parse( fs.readFileSync(fn) );
}

function twofactor_code_print(grid_code, sz) {
  let print_grid_size = [ sz[0]*3, sz[1]*3 ];
  let print_grid = [];
  let print_grid_n = print_grid_size[0]*print_grid_size[1];
  for (let i=0; i< print_grid_n; i++) {
    print_grid.push(' ');
  }

  for (let y=0; y<sz[1]; y++) {
    for (let x=0; x<sz[0]; x++) {
      let code = grid_code[ xy2idx( [x,y], sz ) ];
      if (code == ' ') { continue; }

      let base_xy = [3*x+1, 3*y+1];
      print_grid[ xy2idx(base_xy, print_grid_size) ] = '*';

      let nei0_xy = [3*x+1, 3*y+1];
      let nei1_xy = [3*x+1, 3*y+1];

      let nei0_code = '-';
      let nei1_code = '|';

      if (code == 'L') { nei0_xy[0]++; nei1_xy[1]++; }
      if (code == '7') { nei0_xy[0]--; nei1_xy[1]--; }
      if (code == 'F') { nei0_xy[0]++; nei1_xy[1]--; }
      if (code == 'J') { nei0_xy[0]--; nei1_xy[1]++; }

      if (code == '|') { nei0_xy[1]--; nei1_xy[1]++; nei0_code = '|'; }
      if (code == '-') { nei0_xy[0]--; nei1_xy[0]++; nei1_code = '-'; }

      print_grid[ xy2idx(nei0_xy, print_grid_size) ] = nei0_code;
      print_grid[ xy2idx(nei1_xy, print_grid_size) ] = nei1_code;

    }
  }

  for (let y=(print_grid_size[1]-1); y>=0; y--) {

    if (((y+1)%3) == 0) { continue; }

    let pa = [];
    for (let x=0; x<print_grid_size[0]; x++) {
      pa.push(print_grid[ xy2idx( [x,y], print_grid_size ) ]);
    }
    console.log(pa.join(""));
  }
}

//-------
//-------
//-------
function load_custom_C1(grid_info) {
  let debug = true;

  grid_info.size = [ 4, 5 ];
  grid_info.grid = [
    0, 1, 1, 1,
    0, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
  ];

  // for ease, y downwards, we'll reverse y after
  //
  let grid_code_rev = [
    'F', '-', '-', '7',
    '|', 'F', '-', 'J',
    'L', 'J', 'F', '7',
    ' ', 'F', 'J', '|',
    ' ', 'L', '-', 'J'
  ];

  let grid_code = [];

  // reverse
  //
  for (let y=0; y<grid_info.size[1]; y++) {
    let yr = grid_info.size[1] - y - 1;
    for (let x=0; x<grid_info.size[0]; x++) {
      let src_idx = xy2idx( [x, yr], grid_info.size );
      grid_code.push( grid_code_rev[src_idx] );
    }
  }

  if (debug) {
    // print debug
    //
    for (let y=0; y<grid_info.size[1]; y++) {
      let pa = [];
      for (let x=0; x<grid_info.size[0]; x++) {
        pa.push( grid_code[ xy2idx( [x,grid_info.size[1] - y - 1], grid_info.size ) ] );
      }
      console.log(pa.join(""));
    }
    twofactor_code_print(grid_code, grid_info.size);
  }



  // convert to two_deg_grid
  //
  let _c2i = {
    " " : -1,

    "-" : (1 << 0) | (1 << 1),
    "|" : (1 << 2) | (1 << 3),

    "F" : (1 << 0) | (1 << 3),
    "L" : (1 << 0) | (1 << 2),
    "J" : (1 << 1) | (1 << 2),
    "7" : (1 << 1) | (1 << 3)
  };

  let two_deg_grid = [];
  for (let idx=0; idx<grid_code.length; idx++) {
    two_deg_grid.push( _c2i[ grid_code[idx] ] );
  }

  //grid_info["two_deg_grid"] = two_deg_grid;
  grid_info["grid_hook"] = two_deg_grid;

  ulhp_dual(grid_info);
  ulhp_dependency(g_info);

  if (debug) {
    console.log("#######################");
    console.log("#######################");
    console.log("#######################");

    console.log(grid_info);
  }

  return grid_info;
}


function load_custom_C0(grid_info) {
  let debug = true;

  grid_info.size = [ 4, 5 ];
  grid_info.grid = [
    0, 1, 1, 1,
    0, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 0,
    1, 1, 1, 0,
  ];

  // for ease, y downwards, we'll reverse y after
  //
  let grid_code_rev = [
    'F', '-', '7', ' ',
    '|', 'F', 'J', ' ',
    'L', 'J', 'F', '7',
    ' ', 'F', 'J', '|',
    ' ', 'L', '-', 'J'
  ];

  let grid_code = [];

  // reverse
  //
  for (let y=0; y<grid_info.size[1]; y++) {
    let yr = grid_info.size[1] - y - 1;
    for (let x=0; x<grid_info.size[0]; x++) {
      let src_idx = xy2idx( [x, yr], grid_info.size );
      grid_code.push( grid_code_rev[src_idx] );
    }
  }

  if (debug) {
    // print debug
    //
    for (let y=0; y<grid_info.size[1]; y++) {
      let pa = [];
      for (let x=0; x<grid_info.size[0]; x++) {
        pa.push( grid_code[ xy2idx( [x,grid_info.size[1] - y - 1], grid_info.size ) ] );
      }
      console.log(pa.join(""));
    }
    twofactor_code_print(grid_code, grid_info.size);
  }



  // convert to two_deg_grid
  //
  let _c2i = {
    " " : -1,

    "-" : (1 << 0) | (1 << 1),
    "|" : (1 << 2) | (1 << 3),

    "F" : (1 << 0) | (1 << 3),
    "L" : (1 << 0) | (1 << 2),
    "J" : (1 << 1) | (1 << 2),
    "7" : (1 << 1) | (1 << 3)
  };

  let two_deg_grid = [];
  for (let idx=0; idx<grid_code.length; idx++) {
    two_deg_grid.push( _c2i[ grid_code[idx] ] );
  }

  //grid_info["two_deg_grid"] = two_deg_grid;
  grid_info["grid_hook"] = two_deg_grid;

  ulhp_dual(grid_info);
  ulhp_dependency(g_info);

  if (debug) {
    console.log("#######################");
    console.log("#######################");
    console.log("#######################");

    console.log(grid_info);
  }

  return grid_info;
}

function load_custom7_1(grid_info) {

  let debug = false;

  grid_info.size = [ 7, 15 ];
  grid_info.grid = [
    0, 0, 1, 1, 1, 1, 1,
    0, 0, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 0, 0,
    1, 1, 1, 1, 0, 0, 0,
    1, 1, 1, 1, 0, 0, 0
  ];

  // for ease, y downwards, we'll reverse y after
  //
  let grid_code_rev = [
    'F', '-', '-', '7', ' ', ' ', ' ',
    'L', '7', 'F', 'J', ' ', ' ', ' ',
    ' ', 'L', 'J', 'F', '7', ' ', ' ',
    'F', '7', 'F', 'J', 'L', '7', ' ',
    '|', 'L', 'J', 'F', '7', '|', ' ',
    'L', '7', 'F', 'J', '|', '|', ' ',
    ' ', 'L', 'J', 'F', 'J', 'L', '7',
    'F', '7', 'F', 'J', 'F', '7', '|',
    '|', 'L', 'J', 'F', 'J', 'L', 'J',
    'L', '7', 'F', 'J', 'F', '7', ' ',
    ' ', '|', '|', 'F', 'J', '|', ' ',
    ' ', '|', 'L', 'J', 'F', 'J', ' ',
    ' ', 'L', '7', 'F', 'J', 'F', '7',
    ' ', ' ', '|', 'L', '-', 'J', '|',
    ' ', ' ', 'L', '-', '-', '-', 'J'

  ];

  let grid_code = [];

  // reverse
  //
  for (let y=0; y<grid_info.size[1]; y++) {
    let yr = grid_info.size[1] - y - 1;
    for (let x=0; x<grid_info.size[0]; x++) {
      let src_idx = xy2idx( [x, yr], grid_info.size );
      grid_code.push( grid_code_rev[src_idx] );
    }
  }

  if (debug) {
    // print debug
    //
    for (let y=0; y<grid_info.size[1]; y++) {
      let pa = [];
      for (let x=0; x<grid_info.size[0]; x++) {
        pa.push( grid_code[ xy2idx( [x,grid_info.size[1] - y - 1], grid_info.size ) ] );
      }
      console.log(pa.join(""));
    }
    twofactor_code_print(grid_code, grid_info.size);
  }



  // convert to two_deg_grid
  //
  let _c2i = {
    " " : -1,

    "-" : (1 << 0) | (1 << 1),
    "|" : (1 << 2) | (1 << 3),

    "F" : (1 << 0) | (1 << 3),
    "L" : (1 << 0) | (1 << 2),
    "J" : (1 << 1) | (1 << 2),
    "7" : (1 << 1) | (1 << 3)
  };

  let two_deg_grid = [];
  for (let idx=0; idx<grid_code.length; idx++) {
    two_deg_grid.push( _c2i[ grid_code[idx] ] );
  }

  //grid_info["two_deg_grid"] = two_deg_grid;
  grid_info["grid_hook"] = two_deg_grid;

  ulhp_dual(grid_info);
  ulhp_dependency(g_info);

  if (debug) {
    console.log("#######################");
    console.log("#######################");
    console.log("#######################");

    console.log(grid_info);
  }

  return grid_info;
}

function _main(argv) {
  let debug = true;

  let export_import = 'import';

  export_import = "example7.1_grid";
  export_import = "example7.1_two-factor";

  export_import = "custom7.1";

  if (argv.length > 1)  {
    export_import = argv[1];
  }

  //----
  //----


  if (export_import == 'import') {
    g_info = import_grid("./test_grid0.json");
  }

  else if (export_import == 'test') {

    g_info.size = [3,3];
    g_info.grid = [ 1,1,1, 1,1,1, 1,1,1 ];

  }

  // No ham cycle possible
  //
  else if (export_import == "custom_C0") {

    load_custom_C0( g_info );

    debugPrint(g_info);
    return;
  }

  // No ham cycle possible
  //
  else if (export_import == "custom_C1") {
    load_custom_C1( g_info );

    debugPrint(g_info);
    return;
  }

  // Custom 7.1
  //
  else if (export_import == "custom7.1") {
    load_custom7_1( g_info );
    return;
  }

  // Figure 7.1 example graph
  // with initial two-factor already provided
  //
  else if (export_import == "example7.1_two-factor") {

    g_info.size = [ 7, 15 ];
    g_info.grid = [
      0, 0, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 0, 0,
      1, 1, 1, 1, 0, 0, 0,
      1, 1, 1, 1, 0, 0, 0
    ];

    // for ease, y downwards, we'll reverse y after
    //
    let grid_code_rev = [
      'F', '-', '-', '7', ' ', ' ', ' ',
      'L', '7', 'F', 'J', ' ', ' ', ' ',
      ' ', 'L', 'J', 'F', '7', ' ', ' ',
      'F', '7', 'F', 'J', 'L', '7', ' ',
      '|', 'L', 'J', 'F', '7', '|', ' ',
      'L', '7', 'F', 'J', '|', '|', ' ',
      ' ', 'L', 'J', 'F', 'J', 'L', '7',
      'F', '7', 'F', 'J', 'F', '7', '|',
      '|', 'L', 'J', 'F', 'J', 'L', 'J',
      'L', '7', 'F', 'J', 'F', '7', ' ',
      ' ', '|', '|', 'F', 'J', 'L', '7',
      ' ', '|', 'L', 'J', 'F', '-', 'J',
      ' ', 'L', '7', 'F', 'J', 'F', '7',
      ' ', ' ', '|', 'L', '-', 'J', '|',
      ' ', ' ', 'L', '-', '-', '-', 'J'

    ];

    let grid_code = [];

    // reverse
    //
    for (let y=0; y<g_info.size[1]; y++) {
      let yr = g_info.size[1] - y - 1;
      for (let x=0; x<g_info.size[0]; x++) {
        let src_idx = xy2idx( [x, yr], g_info.size );
        grid_code.push( grid_code_rev[src_idx] );
      }
    }

    if (debug) {
      // print debug
      //
      for (let y=0; y<g_info.size[1]; y++) {
        let pa = [];
        for (let x=0; x<g_info.size[0]; x++) {
          pa.push( grid_code[ xy2idx( [x,g_info.size[1] - y - 1], g_info.size ) ] );
        }
        console.log(pa.join(""));
      }
      twofactor_code_print(grid_code, g_info.size);
    }



    // convert to two_deg_grid
    //
    let _c2i = {
      " " : -1,

      "-" : (1 << 0) | (1 << 1),
      "|" : (1 << 2) | (1 << 3),

      "F" : (1 << 0) | (1 << 3),
      "L" : (1 << 0) | (1 << 2),
      "J" : (1 << 1) | (1 << 2),
      "7" : (1 << 1) | (1 << 3)
    };

    let two_deg_grid = [];
    for (let idx=0; idx<grid_code.length; idx++) {
      two_deg_grid.push( _c2i[ grid_code[idx] ] );
    }

    //g_info["two_deg_grid"] = two_deg_grid;
    g_info["grid_hook"] = two_deg_grid;

    ulhp_dual(g_info);

    if (debug) {
      console.log("#dualG", g_info.dualG.size);
      for (let y=0; y<g_info.dualG.size[1]; y++) {
        let ca = [];
        let yr = g_info.dualG.size[1]-1-y;
        for (let x=0; x<g_info.dualG.size[0]; x++) {
          let idx = xy2idx([x,yr], g_info.dualG.size);
          ca.push(g_info.dualG.grid_code[idx]);
        }
        console.log(ca.join(""));
      }
    }

    console.log("#######################");
    console.log("#######################");
    console.log("#######################");

    console.log(g_info);

    return;
  }

  // Figure 7.1 from Uman's thesis,
  // just the grid
  //
  else if (export_import == "example7.1_grid") {

    g_info.size = [ 7, 15 ];
    g_info.grid = [
      0, 0, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 0, 0,
      1, 1, 1, 1, 0, 0, 0,
      1, 1, 1, 1, 0, 0, 0,

      /*
      1, 1, 1, 1, 0, 0, 0,
      1, 1, 1, 1, 0, 0, 0,
      0, 1, 1, 1, 1, 0, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1
      */
    ];

    ulhp_initTwoFactor(g_info);

    ulhp_dual(g_info);

    return;
  }

  else if (export_import == "ok") {

    g_info.size = [ 7, 15 ];
    g_info.grid = [
      0, 0, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 0, 0,
      1, 1, 1, 1, 0, 0, 0,
      1, 1, 1, 1, 0, 0, 0,
    ];

    let path = ulhp_HamiltonianCycleSolidGridGraph( g_info );
    console.log("#got:", path.length);
    for (let i=0; i<path.length; i++) {
      console.log( path[i][0], path[i][1] );
    }
    if (path.length > 0) {
      console.log( path[0][0], path[0][1] );
    }

    return;

  }

  else if (export_import == "hm") {

    g_info.size = [24,24];
    g_info.grid = random_grid(g_info.size, 0.25, [[4,4],[20,20]]);
    cleanup_heuristic(g_info);
    raise_island(g_info, [0,0]);
    export_grid("grid_info.json", g_info)
  }

  else {
    ulhp_initTwoFactor(g_info);
  }


  return;
}

function __cruft() {



  let nv = 0;
  for (let i=0; i<g_info.grid.length; i++) {
    if (g_info.grid[i] > 0) { nv++; }
  }
  console.log("# num1:", nv);

  let gadget_info = two_factor_gadget(g_info);

  let n = gadget_info.E.length;

  let ffE = [];
  for (let i=0; i<n; i++) {
    ffE.push([]);
    for (let j=0; j<n; j++) {
      ffE[i].push(0);
    }
  }

  for (let i=0; i<gadget_info.E.length; i++) {
    for (let j=0; j<gadget_info.E[i].length; j++) {
      ffE[i][ gadget_info.E[i][j] ] = 1;
    }
  }

  // Ford-Fulkerson is pretty bad run-time (and memory)
  // I think Hopcroft-Karp is going to do much better,
  // at either $O(|E| \sqrt{V})$ or $O(|E| \log(V))$ since
  // it's sparse (?).
  // For now, I'm leaving this in, because the actual
  // algorithm is the priority but this is already way too
  // slow and we need to get to it in the future.
  //
  let resG = [], flowG = [];
  let flow = FF(ffE, ffE.length-2, ffE.length-1, resG, flowG);

  let gi = gadget_info;

  let idir_dxy = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  if (export_import == 'test') {
    for (let i=0; i<flowG.length; i++) {
      for (let j=0; j<flowG[i].length; j++) {

        if (flowG[i][j] > 0) {

          let u_name = gi.V[i];
          let v_name = gi.V[j];

          console.log(u_name, "-(", flowG[i][j], ")->", v_name);

        }

      }
    }

    return;
  }


  for (let i=0; i<flowG.length; i++) {
    for (let j=0; j<flowG[i].length; j++) {

      if (flowG[i][j] > 0) {

        let u_name = gi.V[i];
        let v_name = gi.V[j];

        if ((u_name == "source") || (u_name == "sink") ||
            (v_name == "source") || (v_name == "sink")) { continue; }

        let u_op = u_name.split(".")[1];
        let v_op = v_name.split(".")[1];

        let u_x = parseInt( u_name.split(".")[0].split("_")[0] );
        let u_y = parseInt( u_name.split(".")[0].split("_")[1] );

        let v_x = parseInt( v_name.split(".")[0].split("_")[0] );
        let v_y = parseInt( v_name.split(".")[0].split("_")[1] );

        if ((u_op == 'a') || (u_op == 'b')) {
          let idir = parseInt(v_op);
          console.log(u_x, u_y);
          console.log(u_x + idir_dxy[idir][0], u_y + idir_dxy[idir][1]);
          console.log("");
        }

        else if ((v_op == 'a') || (v_op == 'b')) {
          let idir = parseInt(u_op);
          console.log(v_x, v_y);
          console.log(v_x + idir_dxy[idir][0], v_y + idir_dxy[idir][1]);
          console.log("");
        }

      }

    }
  }


  //printGrid( g_info );

}

if (typeof module !== "undefined") {
  module.exports["fasslib"] = fasslib;
  module.exports["FF"] = FF;

  module.exports["idx2xy"] = idx2xy;
  module.exports["xy2idx"] = xy2idx;
  module.exports["dxy2idir"] = dxy2idir;
  module.exports["inBounds"] = inBounds;
  module.exports["dualCode"] = dualCode;

  module.exports["two_factor_gadget"] = two_factor_gadget;
  module.exports["grid_info"] = g_info;

  module.exports["dual"] = ulhp_dual;
  module.exports["dependency"] = ulhp_dependency;
  module.exports["catalogueAlternatingStrip"] = ulhp_catalogueAlternatingStrip;
  module.exports["dualRegionFlood"] = ulhp_dualRegionFlood;

  module.exports["applyAlternatingStripSequence"] = ulhp_applyAlternatingStripSequence;
  module.exports["applyAlternatingStrip"] = ulhp_applyAlternatingStrip;
  module.exports["staticAlternatingStripSequence"] = ulhp_staticAlternatingStripSequence;
  module.exports["dualAdjacencyGraph"] = ulhp_dualAdjacencyGraph;

  module.exports["HamiltonianCycleSolidGridGraph"] = ulhp_HamiltonianCycleSolidGridGraph;


  module.exports["custom"] = load_custom7_1;
  module.exports["custom_C0"] = load_custom_C0;
  module.exports["custom_C1"] = load_custom_C1;

}

if ((typeof require !== "undefined") &&
    (require.main === module)) {
  _main(process.argv.slice(1));
}
