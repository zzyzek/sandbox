// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var g_ui = {
  "ulhp": ulhp,
  "two": new Two({"fitted":true}),

  "data": {
    "grid_info": {}
  },
  
  "option": {
    "grid": true,
    "dual": true,
    "dep": true

  }
};

var idx2xy = ulhp.idx2xy;
var xy2idx = ulhp.xy2idx;

//------
//------
//------

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

/*
function ulhp_catalogueAlternatingStrip(grid_info) {

  let dualG = grid_info.dualG;

  let grid_code = dualG.grid_code;
  let grid_size = dualG.size;

  let typeI_start = [],
      typeII_start = [],
      typeIII_start = [],
      typeIV_start = [];

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
  let strip_start_code_idir = {
    ">" : [-1, 0], "<": [ 1, 0],
    "v" : [ 0, 1], "^": [ 0,-1]
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

  let typeiv_candidate_idir = {
    'c': 1, 'p': 0,
    'n': 2, 'u': 3
  };

  let oppo = [1,0, 3,2, 5,4];

  let idir_dxy  = [ [ 1, 0], [-1, 0], [ 0, 1], [ 0,-1] ];
  let oppo_dxy  = [ [-1, 0], [ 1, 0], [ 0,-1], [ 0, 1] ];

  let strip_seq = [];

  for (let i=0; i<typeI_start.length; i++) {
    let sx = typeI_start[i].x,
        sy = typeI_start[i].y,
        code = typeI_start[i].code;

    let dxy = strip_start_code_idir[code];
    let cur_x = sx,
        cur_y = sy,
        cur_n = 1;

    while ( (cur_x >= 0) && (cur_x < grid_size[0]) &&
            (cur_y >= 0) && (cur_y < grid_size[1]) ) {

      let cur_idx = cur_x + (cur_y*grid_size[0]);
      let cur_code = grid_code[cur_idx];

      if ( (cur_code == '|') || (cur_code == '-') ) {
        strip_seq.push( {"s": [sx,sy], "dxy": [dxy[0], dxy[1]], "n": cur_n, "type": "begin.i" } );
        break;
      }

      cur_x += dxy[0];
      cur_y += dxy[1];
      cur_n ++;
    }

  }

  for (let i=0; i<typeIII_start.length; i++) {
    let sx = typeIII_start[i].x,
        sy = typeIII_start[i].y,
        code = typeIII_start[i].code;

    strip_seq.push( {"s": [sx,sy], "dxy" : [0,0], "n": 1, "type": "begin.iii" } );

  }

  // idir_pair holds direction to look for the
  // strip,
  // so we need to do contortions to get the neighboring
  // cell in the *opposite* direction of the probe
  // to see if it's a type III neighbor
  //
  // This one is the most complex because we need to do
  // neighbor checking to make sure the shared edge cell
  // is of type III.
  //
  for (let i=0; i<typeII_start.length; i++) {
    let sx = typeII_start[i].x,
        sy = typeII_start[i].y,
        code = typeII_start[i].code;

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
          strip_seq.push( {"s": [sx,sy], "dxy": [dxy[0], dxy[1]], "n": cur_n, "type": "chain.ii" } );
          break;
        }

        cur_x += dxy[0];
        cur_y += dxy[1];
        cur_n ++;
      }

    }

  }

  for (let i=0; i<typeIV_start.length; i++) {
    let sx = typeIV_start[i].x,
        sy = typeIV_start[i].y,
        code = typeIV_start[i].code;

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
      strip_seq.push( {"s": [sx,sy], "dxy": [dxy[0], dxy[1]], "n": 1, "type": "chain.iv" } );
    }

  }


  return strip_seq;

}
*/

/*
function ulhp_dualRegionFlood(grid_info) {
  let dual_code_idir = {
    "." : [1,1,1,1],
    " " : [1,1,1,1],
    "'" : [1,1,1,1],

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
*/

function ulhp_dualAdjacencyGraph(grid_info) {
  let dual_code_idir = {
    "." : [1,1,1,1],
    " " : [1,1,1,1],
    "'" : [1,1,1,1],

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
}


// grid_hook is pretty much ground truth, so we should apply the strip
// squence to that structure.
// Apply the array of strips (strip sequence) to grid_hook.
//
function ulhp_applyAlternatingStripSequence(grid_info, strip_sequence) {
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

  let strip_info = ulhp.catalogueAlternatingStrip(grid_info);

  //DEBUG
  g_ui.data["strip_info"] = strip_info;
  //DEBUG

  let adj = ulhp_dualAdjacencyGraph(grid_info);
  let apsp = dijkstra.all_pair_shortest_path(adj);

  //DEBUG
  g_ui.data["apsp"] = apsp;
  g_ui.data["A"] = adj;
  //DEBUG

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

  //DEBUG
  g_ui.data["v_begin"] = v_begin;
  g_ui.data["v_chain"] = v_chain;
  //DEBUG


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
        //console.log(">>>BEG: beg vtx:", v_name, "in path of", l_key, "->", r_key, "(",cell_key,")", strip);
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

        //console.log(">>>CHAIN: chain vtx:", v_name, "in path of", l_key, "->", r_key, "(",cell_key,")", strip);
      }

    }

  }

  let SG_apsp = dijkstra.all_pair_shortest_path(SG_E);

  //console.log(SG_E);
  //console.log(SG_apsp);
  //console.log("start strips (start_boundary_strip):", start_boundary_strip);
  //console.log("end strips (end_boundary_strip):", end_boundary_strip);

  let SG_dist = SG_apsp.dist;

  //console.log(">>>", SG_dist);

  let static_alternating_strip_nodes = [];
  let static_alternating_strips = [];

  for (let s_idx=0; s_idx < start_boundary_strip.length; s_idx++) {
    let s_name = start_boundary_strip[s_idx];

    //console.log(s_name, SG_dist[s_name]);

    for (let e_idx=0; e_idx < end_boundary_strip.length; e_idx++) {
      let e_name = end_boundary_strip[e_idx];

      //console.log(s_name, e_name, e_name in SG_dist[s_name]);

      if (e_name in SG_dist[s_name]) {
        let p_info = dijkstra.all_pair_shortest_path_reconstruct(SG_apsp, s_name, e_name);
        //console.log("!!!", s_name, e_name, SG_dist[s_name][e_name], p_info.path);

        static_alternating_strip_nodes.push( p_info.path );

        let static_alternating_strip = [];
        for (let p_idx = 0; p_idx < p_info.path.length; p_idx++) {
          static_alternating_strip.push( SG_V[ p_info.path[p_idx] ] );
        }
        static_alternating_strips.push( static_alternating_strip );

      }
    }
  }

  //console.log(static_alternating_strip_nodes);

  return static_alternating_strips;
}

//------
//------
//------

function _Line(x0,y0, x1,y1, lco, lw, alpha) {
  lco = ((typeof lw === "undefined") ? "#111" : lco);
  lw = ((typeof lw === "undefined") ? 2 : lw);
  alpha = ((typeof alpha === "undefined") ? 1 : alpha);

  let two = g_ui.two;

  let _l = two.makeLine(x0,y0, x1,y1);
  _l.linewidth = lw;
  _l.fill = "rgb(0,0,0)";
  _l.stroke = lco;
  //_l.cbp = 'round';
  _l.join = 'bevel';
  _l.cap = 'square';

  _l.opacity = alpha;

  return _l;
}

function makeTwoVector(_pnt) {
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }
  return pnt;
}

function makeTwoAnchor(_pnt) {
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt.push( new Two.Anchor(_pnt[ii][0], _pnt[ii][1]) );
  }
  return pnt;
}


// just the arrow, not the line with the arrow
//
function mkarrow(px, py, dx, dy, w, h, lco, lw, alpha) {
  lco = ((typeof lw === "undefined") ? "#111" : lco);
  lw = ((typeof lw === "undefined") ? 3 : lw);
  alpha = ((typeof alpha === "undefined") ? 1 : alpha);

  let two = g_ui.two;

  let theta = Math.atan2(-dy,dx);
  theta += Math.PI/2;

  let ct = Math.cos(theta);
  let st = Math.sin(theta);

  let w2 = w/2;

  let q0 = [  ct*w2 - st*h, -st*w2 - ct*h ];
  let q1 = [ -ct*w2 - st*h,  st*w2 - ct*h ];

  let hh = h*0.95;

  let qm = [  ct*0  - st*hh, -st*0  - ct*hh ];

  q0[0] += px;
  q0[1] += py;

  q1[0] += px;
  q1[1] += py;
  
  qm[0] += px;
  qm[1] += py;

  let anch = makeTwoAnchor( [ [px,py], q0, qm, q1 ] );

  let _p = two.makePath( anch );

  _p.linewidth = lw;

  _p.stroke = lco;;
  _p.fill = lco;;
  _p.join = "round";
  _p.opacity = alpha;

  return _p;
}


function drawDep( grid_info, disp_opt ) {
  let xy_origin = (("origin" in disp_opt) ? disp_opt.origin : [0,0]);
  let scale = (("scale" in disp_opt) ? disp_opt.scale : 20 );
  let cell_s = (("cell_s" in disp_opt) ? disp_opt.cell_s: 20 );

  let two = g_ui.two;

  let grid_hook = grid_info.grid_hook;
  let size = grid_info.size;

  let idx2xy = ulhp.idx2xy;
  let xy2idx = ulhp.xy2idx;

  let dx = scale/2;
  let dy = scale/2;

  // inverted y
  //
  let dxy_idir = [
    [cell_s, 0], [-cell_s, 0],
    [0,-cell_s], [0,cell_s]
  ];

  let shrink = [ 1/8, 9/8 ];

  for (let y = (size[1]-1); y >= 0; y--) {
    for (let x = 0; x< size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      let screen_iy = size[1] - 1 - y;

      let vtx_hook = grid_hook[idx];

      if (vtx_hook == 0) { continue; }

      for (let idir=0; idir<4; idir++) {
        if ((vtx_hook & (1<<idir)) == 0) { continue; }

        let du = [ dxy_idir[idir][0] * shrink[0], dxy_idir[idir][1] * shrink[0] ];
        let dv = [ dxy_idir[idir][0] * shrink[1], dxy_idir[idir][1] * shrink[1] ];

        _Line( xy_origin[0] + (scale*x) + dx + du[0],
               xy_origin[1] + (scale*screen_iy) + dy + du[1],
               xy_origin[0] + (scale*x) + dx + dv[0],
               xy_origin[1] + (scale*screen_iy) + dy + dv[1],
               "#111", 1, 0.4 );

        mkarrow( xy_origin[0] + (scale*x) + dx + dv[0],
                 xy_origin[1] + (scale*screen_iy) + dy + dv[1],
                 dv[0], dv[1],
                 cell_s/3, cell_s/6, "#111", 1, 0.25 );
      }

    }
  }

  two.update();
}


function drawHighlightCell( cell_info, grid_info, disp_opt ) {
  let xy_origin = (("origin" in disp_opt) ? disp_opt.origin : [0,0]);
  let scale = (("scale" in disp_opt) ? disp_opt.scale : 20 );
  let cell_s = (("cell_s" in disp_opt) ? disp_opt.cell_s: 20 );

  let two = g_ui.two;

  let grid_code = grid_info.grid_code;
  let size = grid_info.size;

  let idx2xy = ulhp.idx2xy;
  let xy2idx = ulhp.xy2idx;

  let dx = scale/2;
  let dy = scale/2;

  let opacity = 0.35;

  let fill_lookup = {
    ".": "#fff", " ": "#fff",
    "-": "#b33", "|": "#b33",
    ">": "#11b", "<": "#11b", "^": "#11b", "v": "#11b",
    "F": "#1b1", "J": "#1b1", "7": "#1b1", "L": "#1b1",
    "c": "#aaa", "p": "#aaa", "n": "#aaa", "u": "#aaa"
  };

  let bg_point_size = 3;

  let x = cell_info.x;
  let screen_iy = size[1] - 1 - cell_info.y;

  let d = two.makeRectangle( xy_origin[0] + (scale*x) + dx,
                             xy_origin[1] + (scale*screen_iy) + dy,
                             cell_s, cell_s );
  d.fill = "#a0a";
  d.stroke = "#000";
  d.opacity = opacity;
  d.linewidth = 2;


  two.update();
}

function drawDualCell( grid_info, disp_opt ) {
  let xy_origin = (("origin" in disp_opt) ? disp_opt.origin : [0,0]);
  let scale = (("scale" in disp_opt) ? disp_opt.scale : 20 );
  let cell_s = (("cell_s" in disp_opt) ? disp_opt.cell_s: 20 );

  let two = g_ui.two;

  let grid_code = grid_info.grid_code;
  let size = grid_info.size;

  let idx2xy = ulhp.idx2xy;
  let xy2idx = ulhp.xy2idx;

  let dx = scale/2;
  let dy = scale/2;

  let opacity = 0.25;

  let fill_lookup = {
    ".": "#fff", " ": "#fff",
    "-": "#b33", "|": "#b33",
    ">": "#11b", "<": "#11b", "^": "#11b", "v": "#11b",
    "F": "#1b1", "J": "#1b1", "7": "#1b1", "L": "#1b1",
    "c": "#aaa", "p": "#aaa", "n": "#aaa", "u": "#aaa"
  };

  let type_lookup = {
    ".": " ", " ": " ",
    "-": "III", "|": "III",
    ">": "I", "<": "I", "^": "I", "v": "I",
    "F": "II", "J": "II", "7": "II", "L": "II",
    "c": "IV", "p": "IV", "n": "IV", "u": "IV"
  };

  let bg_point_size = 3;

  for (let y = (size[1]-1); y >= 0; y--) {
    for (let x = 0; x< size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      let screen_iy = size[1] - 1 - y;

      let cell_parity = (x+y)%2;

      // tiny dual cell points
      //
      if (cell_parity == 0) {
        let d = two.makeCircle( xy_origin[0] + (scale*x) + dx,
                                xy_origin[1] + (scale*screen_iy) + dy,
                                bg_point_size/2 );
        d.fill = "#b70";
        d.alpha = 0.6;
        d.noStroke();
      }
      else {
        let d = two.makeRectangle( xy_origin[0] + (scale*x) + dx,
                                   xy_origin[1] + (scale*screen_iy) + dy,
                                   bg_point_size, bg_point_size );
        d.fill = "#00a";
        d.alpha = 0.6;
        d.noStroke();
      }

      if (grid_code[idx] == '.') { continue; }

      let _x = xy_origin[0] + (scale*x) + dx;
      let _y = xy_origin[1] + (scale*screen_iy) + dy;

      let c = two.makeRectangle( _x, _y, cell_s, cell_s );
      c.fill = fill_lookup[ grid_code[idx] ];
      c.opacity = opacity;
      c.linewidth = 0;

      let txt_style = {
        "family": "Libertine",
        "size": 8
      };
      let _t = two.makeText( type_lookup[ grid_code[idx] ], _x + (scale/4), _y + (scale/4), txt_style );
    }
  }


  two.update();
}

function drawGridHook( grid_info, disp_opt ) {

  let xy_origin = (("origin" in disp_opt) ? disp_opt.origin : [0,0]);
  let scale = (("scale" in disp_opt) ? disp_opt.scale : 20 );
  let vertex_diam = (("vertex_diam" in disp_opt) ? disp_opt.vertex_diam : Math.floor(scale/4) );
  let lw = (("linewidth" in disp_opt) ? disp_opt.linewidth : Math.floor(2*scale/30));

  let two = g_ui.two;

  let grid = grid_info.grid_hook;
  let size = grid_info.size;

  let idx2xy = ulhp.idx2xy;
  let xy2idx = ulhp.xy2idx;

  let xy_idir = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let fudge_idir = [
    [-1/2,0], [1/2,0],
    [0,1/2], [0,-1/2]
  ];

  for (let y = (size[1]-1); y >= 0; y--) {
    for (let x = 0; x< size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      if (grid[idx] < 0) { continue; }

      let vtx_parity = (x+y)%2;
      let screen_iy = size[1] - 1 - y;

      // lines first to draw under vertex shapes
      //
      for (let idir=0; idir<4; idir++) {
        if (grid[idx] & (1<<idir)) {
          let nei_xy = [ x + xy_idir[idir][0]/2, y + xy_idir[idir][1]/2 ];

          let nei_xy_screen = [nei_xy[0], size[1]-1-nei_xy[1]];

          _Line( xy_origin[0] + (scale*x), xy_origin[1] + (scale*screen_iy),
                 xy_origin[0] + (scale*nei_xy_screen[0]) + fudge_idir[idir][0],
                 xy_origin[1] + (scale*nei_xy_screen[1]) + fudge_idir[idir][1],
                 "#111", lw );
        }
      }

      if (vtx_parity) {
        let c = two.makeCircle( xy_origin[0] + (scale*x),
                                xy_origin[1] + (scale*screen_iy),
                                vertex_diam/2 );
        c.fill = "#333";
        c.stroke = "#333";

        //c.fill = "#b33";
        //c.stroke = "#b33";
      }
      else {
        let c = two.makeRectangle( xy_origin[0] + (scale*x),
                                xy_origin[1] + (scale*screen_iy),
                                vertex_diam, vertex_diam );
        //c.fill = "#555";
        //c.stroke = "#555";
      }

    }
  }



  two.update();
  return;
}

function redrawGridInfo(grid_info, persist) {
  persist = ((typeof persist === "undefined") ? false : persist);

  let two = g_ui.two;

  if (!persist) { two.clear(); }

  let scale = 40;

  var ele = document.getElementById("ui_canvas");
  two.appendTo(ele);

  let disp_opt = {
    "origin" : [50,50],
    "scale": scale
  };

  if (g_ui.option.grid) {
    drawGridHook( grid_info, disp_opt );
  }

  //---

  let dual_disp_opt = {
    "scale": scale,
    "origin" : [50-scale, 50-scale],
    "cell_s": (3*scale/4)
  };

  ulhp.dual( grid_info );

  if (g_ui.option.dual) {
    drawDualCell( grid_info.dualG, dual_disp_opt );
  }

  //---

  let dep_disp_opt = {
    "scale": scale,
    "origin" : [50-scale, 50-scale],
    "cell_s": (3*scale/4)
  };

  if (g_ui.option.dep) {
    drawDep( grid_info.depG, dep_disp_opt );
  }

}

function redrawCustom() {
  ulhp.custom( ulhp.grid_info );

  g_ui.data.grid_info = ulhp.grid_info;

  //redrawGridInfo( ulhp.grid_info );
  redrawGridInfo( g_ui.data.grid_info );
}

//----
//----
//----

function _grid_rev(grid, size) {
  let rev_grid = [];
  for (let y=0; y<size[1]; y++) {
    let yr = size[1] - y - 1;
    for (let x=0; x<size[0]; x++) {
      let idx = size[0]*yr + x;
      rev_grid.push( grid[idx] );
    }
  }
  return rev_grid;
}

function _tfcode2tfb(grid_code) {
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

  return two_deg_grid;
}

function parseTextInput() {
  let ele = document.getElementById("ui_import");

  let lines = ele.value.split("\n");

  let grid_code = [];
  let grid_mask = [];

  let width = -1;
  let height = 0;

  let valid_code = {
    "F":1, "-":1, "7":1, "J":1, "|":1, "L":1
  };


  for (let line_idx=0; line_idx < lines.length; line_idx++) {
    //let tok = lines[line_idx].replace(/,/g, ' ').replace( /  */g, ' ').split(' ');
    let tok = lines[line_idx].split('');

    if (tok.length == 0) { continue; }
    height++;

    if (width < 0) { width = tok.length; }

    if (tok.length != width) {
      console.log("WARNING: tok.length:", tok.length, "!= width", width);
    }

    for (let i=0; i<tok.length; i++) {

      let inp_code = tok[i];

      let code = ' ';
      if (inp_code in valid_code) {
        code = inp_code;
      }

      grid_code.push(code);

      if ((tok[i] == "'") ||
          (tok[i] == ' ')) {
        grid_mask.push(0);
      }
      else {
        grid_mask.push(1);
      }
    }

  }

  let size = [width, height];


  let grid_code_rev = _grid_rev(grid_code, size);
  let grid_mask_rev = _grid_rev(grid_mask, size);

  let grid_hook = _tfcode2tfb(grid_code_rev);

  let grid_info = {
    "grid_hook": grid_hook,
    "grid": grid_mask_rev,
    "size": size
  };

  ulhp.dual(grid_info);
  ulhp.dependency(grid_info);

  g_ui.data.grid_info = grid_info;

  //g_ui.two.clear();
  redrawGridInfo(grid_info);
}

function ui_input(ui_id) {

  let opt_val = "";

  if (ui_id == "ui_btn_inp") { parseTextInput(); return; }

  if (ui_id == "ui_cb_grid") { opt_val = "grid"; }
  if (ui_id == "ui_cb_dual") { opt_val = "dual"; }
  if (ui_id == "ui_cb_dep") { opt_val = "dep"; }

  if (opt_val == "") { return; }

  let ele = document.getElementById(ui_id);
  if (ele.checked) { g_ui.option[opt_val] = true; }
  else if (!ele.checked) { g_ui.option[opt_val] = false; }

  g_ui.two.clear();
  //redrawCustom();
  redrawGridInfo(g_ui.data.grid_info);
}

function init_ui() {
  ui_input("ui_cb_grid");
  ui_input("ui_cb_dual");
  ui_input("ui_cb_dep");
}

function webinit() {

  redrawCustom();
  init_ui();

  g_ui.two.clear();
  redrawCustom();
}
