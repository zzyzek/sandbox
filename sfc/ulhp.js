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

var g_info = {
  "size" : [0,0],
  "grid": [],
  "Gm": [],
  "Gp": []
};

var v_add = fasslib.v_add;

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

function idx2xy(idx, size) {
  return [ (idx % size[0]), Math.floor(idx / size[0]) ];
}

function xy2idx(p, size) {
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

      let grid_parity = (x + y) % 2;

      let p = [x,y];

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

      let src_grid_parity = (x+y)%2;

      // who choose exge direction on parity
      // so we only consider half of the external vertices
      //
      if (src_grid_parity) { continue; }

      let p = [x,y];

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

// wip
//
for (let i=0; i<gadget_info.E.length; i++) {
  for (let j=0; j<gadget_info.E[i].length; j++) {
    ffE[i][ gadget_info.E[i][j] ] = 1;
    //ffE[ gadget_info.E[i][j] ][i] = 1;
  }
}


//console.log(gadget_info);
//gadget2dot(gadget_info);
//process.exit();

let resG = [];
let flow = FF(ffE, ffE.length-2, ffE.length-1, resG);

//console.log(flow);
//console.log(resG);


let gi = gadget_info;

for (let i=0; i<resG.length; i++) {
  for (let j=0; j<resG[i].length; j++) {
    if (resG[i][j] > 0) { console.log( gi.V[i], "-(", resG[i][j], ")->", gi.V[j] ); }
  }
}


function _main() {

  g_info.size = [24,24];

  g_info.grid = random_grid(g_info.size, 0.25, [[4,4],[20,20]]);

  cleanup_heuristic(g_info);

  raise_island(g_info, [0,0]);

  printGrid( g_info );

}


