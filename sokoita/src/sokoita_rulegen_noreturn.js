// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//     
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// WIP
// Create a 'cross' pattern for the supertile pattern library,
// with overlap of a single tile.
//
// Options for creating a POMS config file, creating a PNG tile set
// from a base, flat, tile set, a Tiled output for both the computed
// tile set and the flat tile set, along with various options for
// adding constraints for a specific level and solvability constraints
// to the POMS config file.
// 
// Using a 2x2 pattern doesn't work as the supertile needs to
// have players and crates appear out of the edge and there's no
// way to ensure a conservation of crates or players.
//

// The spatial dimensions are xy with the z being time.
// Supertiles are created in the spatial (xy) domain.
// Z (time) translations are treated specially.
//

// currently unwinding from the 2x2 supertile assumption and implementing
// the cross pattern supertile library and overlap.

var fs = require("fs");
var getopt = require("posix-getopt");
var libpoms = require("./libpoms.js");
var jimp = require("jimp").Jimp;

var DEBUG_LEVEL = 0;

var SOKOITA_RULEGEN_VERSION = "0.3.0";

// Inhereting from the XSB format. Added a '_' to indicate 'out of bounds'
//
// _    - out of bounds/empty
// #    - wall
// ' '  - (ascii space) moveable space
// .    - emptry storage location (goal)
// $    - box
// *    - box on strage (goal)
// @    - player
// +    - player on storage (goal) location
//

var EMPTY = '_',
    WALL = '#',
    MOVE = ' ',
    CRAT = '$',
    GOAL = '.',
    GCRT = '*',
    PLAY = '@',
    GPLY = '+',
    NRET = 'x',
    GNRT = 'X';

let CODE = [ 
  WALL, MOVE,
  GOAL,
  CRAT, GCRT,
  PLAY, GPLY,
  NRET, GNRT
];

// cross supertile schedule:
//
//    0
//  1 2 3
//    4
//
// for convenience, src_tile is 3x3 array with only
// the middle cross valid
//
function construct_xy_neighbors(src_tile, tile_lib) {
  let T = [];

  let etile =
            EMPTY +
    EMPTY + EMPTY + EMPTY +
            EMPTY;

  let boundary_idir = [
    { "x": 2, "y": 1 },
    { "x": 0, "y": 1 },
    { "x": 1, "y": 2 },
    { "x": 1, "y": 0 }
  ];

  // blech, y direction reversed?
  //
  let _boundary_idir = [
    { "x": [1,1], "y": [0,1] },
    { "x": [0,0], "y": [0,1] },
    { "x": [0,1], "y": [1,1] },
    { "x": [0,1], "y": [0,0] },
  ];

  let oppo = [1,0, 3,2, 5,4];

  // if two wall tiles are on a side, construct the 0 (boundary tile)
  // transition
  //
  for (let idir=0; idir<4; idir++) {
    let _x = boundary_idir[idir].x;
    let _y = boundary_idir[idir].y;

    if ( (src_tile[1][1] == WALL) &&
         (src_tile[_y][_x] == WALL) ) {
      let _e = [
        [EMPTY,EMPTY,EMPTY],
        [EMPTY,EMPTY,EMPTY],
        [EMPTY,EMPTY,EMPTY]
      ];
      T.push({ "key":etile, "idir": idir, "tile":_e});
    }
  }

  for (let key in tile_lib) {

    // .id, .goal, .trap, .tile, .key
    //
    let tst_info = tile_lib[key];
    let tst_tile = tst_info.tile;

    for (let idir=0; idir<4; idir++) {
      let ax = boundary_idir[idir].x;
      let ay = boundary_idir[idir].y;

      let bx = boundary_idir[oppo[idir]].x;
      let by = boundary_idir[oppo[idir]].y;

      if ( (src_tile[1][1] == tst_tile[by][bx]) &&
           (tst_tile[1][1] == src_tile[ay][ax]) ) {

        T.push({
          "key": tst_info.key,
          "idir": idir,
          "tile":[
            [tst_tile[0][0], tst_tile[0][1], tst_tile[0][2]],
            [tst_tile[1][0], tst_tile[1][1], tst_tile[1][2]],
            [tst_tile[2][0], tst_tile[2][1], tst_tile[2][2]]
          ]
        });
      }
    }

  }

  return T;
}

function cpy_tile(tile) {
  let r = [];
  for (let y=0; y<tile.length; y++) {
    r.push([]);
    for (let x=0; x<tile[y].length; x++) {
      r[y].push(tile[y][x]);
    }
  }
  return r;
}

// remove no return tile
//
function reduce_noret(tile) {
  let t = [];
  for (let y=0; y<tile.length; y++) {
    t.push([]);
    for (let x=0; x<tile[y].length; x++) {
      if      (tile[y][x] == NRET)  { t[y].push( MOVE ); }
      else if (tile[y][x] == GNRT)  { t[y].push( GOAL ); }
      else                          { t[y].push( tile[y][x] ); }
    }
  }
  return t;
}

function construct_z_transition(tile) {

  let T = [];

  let dxy = [
    {"x":1, "y":0},
    {"x":0, "y":1},
    {"x":1, "y":1},
    {"x":2, "y":1},
    {"x":1, "y":2}
  ];

  let type_count = {};
  type_count[EMPTY] = 0;
  for (let i=0; i<CODE.length; i++) {
    type_count[CODE[i]] = 0;
  }

  for (let i=0; i<dxy.length; i++) {
    let v = tile[dxy[i].y][dxy[i].x];
    type_count[v]++;
  }

  // all transition tiles are catalogues into a T array
  // so that T lists the valid transitions in the z (time)
  // direction.
  //

  if ((type_count[PLAY] == 0) && (type_count[GPLY] == 0)) {

    // 'nop' transition.
    // For a static segment of the scene, without a player,
    // provide a transition to itself.
    // We exclude static transitions if a player is present
    // as we're assuming a player must be able to move from
    // one state to another.
    //
    if ((type_count[NRET] == 0) && (type_count[GNRT] == 0)) {
      let _t = [
        [ tile[0][0], tile[0][1], tile[0][2] ],
        [ tile[1][0], tile[1][1], tile[1][2] ],
        [ tile[2][0], tile[2][1], tile[2][2] ]
      ];
      T.push( {"tile": _t, "type": "nop" });
    }

    // if no player is preset, we transition the no return tile
    // back to whatever it was before (move/space or goal)
    //
    if ((type_count[NRET] == 1) || (type_count[GNRT] == 1)) {
      let _t = reduce_noret([
        [ tile[0][0], tile[0][1], tile[0][2] ],
        [ tile[1][0], tile[1][1], tile[1][2] ],
        [ tile[2][0], tile[2][1], tile[2][2] ]
      ]);;
      T.push( {"tile": _t, "type": "nop_reduce" });
    }


  }

  // we classify moves into groups
  //
  // (CB) player center to boundary (move to outer, or push block out)
  // (BC) player outer to center
  // (BO) player outer to fall of edge
  // (OB) player from outer inwards
  // (LB) lateral boundary
  //

  //----
  // (CB) center to boundary
  //---
  //
  let boundary_xy = [
    {"x":2, "y":1},
    {"x":0, "y":1},
    {"x":1, "y":0},
    {"x":1, "y":2}
  ];

  let oppo_idir = [1,0, 3,2];

  // wall is invalid destination transition, so don't include
  // player push, exclude no return
  //
  let push_transition_ctb = {};

  push_transition_ctb[PLAY] = MOVE;
  push_transition_ctb[GPLY] = GOAL;

  push_transition_ctb[CRAT] = PLAY;
  push_transition_ctb[GCRT] = GPLY;

  push_transition_ctb[MOVE] = PLAY;
  push_transition_ctb[GOAL] = GPLY;


  // player move, include no return
  //
  let move_transition_ctb = {};

  move_transition_ctb[PLAY] = NRET;
  move_transition_ctb[GPLY] = GNRT;

  move_transition_ctb[CRAT] = PLAY;
  move_transition_ctb[GCRT] = GPLY;

  move_transition_ctb[MOVE] = PLAY;
  move_transition_ctb[GOAL] = GPLY;

  for (let i=0; i<boundary_xy.length; i++) {
    let sx = 1;
    let sy = 1;

    let ex = boundary_xy[i].x;
    let ey = boundary_xy[i].y;

    let src_val = tile[sy][sx];
    let end_val = tile[ey][ex];

    // If the player is not at the center, no move to be
    // done from center out, so punt
    //
    if ( (src_val != PLAY) &&
         (src_val != GPLY) ) {
      continue;
    }

    // can't move into walls or go immediately backwards
    //
    if (end_val == WALL) { continue; }
    if ((end_val == NRET) || (end_val == GNRT)) { continue; }

    let nei_tile = reduce_noret( tile );

    if ((end_val == CRAT) || (end_val == GCRT)) {
      nei_tile[sy][sx] = push_transition_ctb[src_val];
      nei_tile[ey][ex] = push_transition_ctb[end_val];
    }
    else {
      nei_tile[sy][sx] = move_transition_ctb[src_val];
      nei_tile[ey][ex] = move_transition_ctb[end_val];
    }

    T.push( {"tile": nei_tile, "type":"cb"} );
  }

  //---
  // (BO) boundary to fall of edge
  //---
  //
  for (let i=0; i<boundary_xy.length; i++) {

    let sx = boundary_xy[i].x;
    let sy = boundary_xy[i].y;

    let src_val = tile[sy][sx];

    if ( (src_val != PLAY) &&
         (src_val != GPLY) ) {
      continue;
    }

    // player can move out by pushing or moving, so include both
    //
    let nei_tile = reduce_noret( tile );
    if      (src_val == PLAY) { nei_tile[sy][sx] = MOVE; }
    else if (src_val == GPLY) { nei_tile[sy][sx] = GOAL; }
    T.push( {"tile": nei_tile, "type":"bo_push"} );

    nei_tile = reduce_noret( tile );
    if      (src_val == PLAY) { nei_tile[sy][sx] = NRET; }
    else if (src_val == GPLY) { nei_tile[sy][sx] = GNRT; }
    T.push( {"tile": nei_tile, "type":"bo_move"} );
  }

  //---
  // (LB) lateral boundary
  //---
  //
  // block on boundary, no player inside,
  // allow player to push block outside of
  // supertile (laterally) replacing block with player
  //
  if ((type_count[PLAY] == 0) &&
      (type_count[GPLY] == 0) &&
      (type_count[EMPTY] == 0)) {

    for (let i=0; i<boundary_xy.length; i++) {
      let sx = boundary_xy[i].x;
      let sy = boundary_xy[i].y;

      let ox = boundary_xy[ oppo_idir[i] ].x;
      let oy = boundary_xy[ oppo_idir[i] ].y;

      let src_val = tile[sy][sx];
      let opo_val = tile[oy][ox];

      // no crate on boundar location, nothing to do
      //
      if ((src_val != CRAT) &&
          (src_val != GCRT) &&
          (src_val != MOVE) &&
          (src_val != GOAL)) {
        continue;
      }

      // if there's a no return tile on the opposite end,
      // the player can't move fast enough to poush this
      // crate laterally, so exclude this condition.
      //
      if ((opo_val == NRET) ||
          (opo_val == GNRT)) {
        continue;
      }

      let descr = "_";

      let nei_tile = reduce_noret( tile );
      if      (src_val == CRAT) { nei_tile[sy][sx] = PLAY; descr+='movecrat';}
      else if (src_val == GCRT) { nei_tile[sy][sx] = GPLY; descr+='gcrtgply';}
      else if (src_val == MOVE) { nei_tile[sy][sx] = PLAY; descr+='moveplay';}
      else if (src_val == GOAL) { nei_tile[sy][sx] = GPLY; descr+='goalgply';}

      T.push( {"tile": nei_tile, "type":"lb"} );
    }

  }

  //---
  // (BC) boundary to center
  //---
  //
  let boundary_inwards_xy = [
    [ {"x":2, "y":1}, {"x":1, "y":1}, {"x":0, "y":1} ],
    [ {"x":0, "y":1}, {"x":1, "y":1}, {"x":2, "y":1} ],

    [ {"x":1, "y":2}, {"x":1, "y":1}, {"x":1, "y":0} ],
    [ {"x":1, "y":0}, {"x":1, "y":1}, {"x":1, "y":2} ]
  ];

  // what source tiles turn into to the destination
  // tile in either a push or move condition.
  //
  let push_transition = {};
  push_transition[PLAY] = MOVE;
  push_transition[GPLY] = GOAL;

  push_transition[CRAT] = PLAY;
  push_transition[GCRT] = GPLY;

  push_transition[MOVE] = CRAT;
  push_transition[GOAL] = GCRT;

  let move_transition = {};
  move_transition[PLAY] = NRET;
  move_transition[GPLY] = GNRT;

  move_transition[MOVE] = PLAY;
  move_transition[GOAL] = GPLY;

  for (let i=0; i<boundary_inwards_xy.length; i++) {
    sx = boundary_inwards_xy[i][0].x;
    sy = boundary_inwards_xy[i][0].y;

    mx = boundary_inwards_xy[i][1].x;
    my = boundary_inwards_xy[i][1].y;

    ex = boundary_inwards_xy[i][2].x;
    ey = boundary_inwards_xy[i][2].y;

    let src_tile = tile[sy][sx];
    let mid_tile = tile[my][mx];
    let end_tile = tile[ey][ex];

    if ( (src_tile != PLAY) &&
         (src_tile != GPLY) ) {
      continue;
    }

    // if there's an obstruction, player can't move inwards
    //
    if (mid_tile == WALL) { continue; }
    if ((mid_tile == NRET) || (mid_tile == GNRT)) { continue; }

    // if there's a crate in the middle and a crate or a wall at the end,
    // we can't move
    //
    if ( ((mid_tile == CRAT) || (mid_tile == GCRT)) &&
         ((end_tile == CRAT) || (end_tile == GCRT) || (end_tile == WALL)) ) {
      continue;
    }

    // by the time we get here, we should have a condition where
    // a move is possible because the player is on the boundary,
    // there's a crate or empty space in the middle, with no
    // obstruction at the end (in a push condition)
    //

    // reduce no return should be redundant (shouldn't happen)
    // kept here for no particular reason
    //
    let nei_tile = reduce_noret( tile );

    if ((mid_tile == CRAT) ||
        (mid_tile == GCRT)) {
      nei_tile[sy][sx] = push_transition[src_tile];
      nei_tile[my][mx] = push_transition[mid_tile];
      nei_tile[ey][ex] = push_transition[end_tile];
    }
    else {
      nei_tile[sy][sx] = move_transition[src_tile];
      nei_tile[my][mx] = move_transition[mid_tile];
    }
    T.push( {"tile": nei_tile, "type":"bc"} );
  }


  //---
  // (OB) from out of tile inwards
  //---
  //
  // This is the condition a player enters the supertile in line
  // with one of the tile cross extermities.
  // Only consider supertiles without a player already present.
  //
  // If no player is present, we can't move into a wall nor can
  // we move into the supertile if there are two non-empty
  // spaces in line with direction of movement.
  //
  // Since we're moving directly in line with the leaves of
  // the cross, the player can't move fast enough to get in,
  // so there shouldn't be any 'no return' tokens present.
  //
  if ((type_count[PLAY] == 0) &&
      (type_count[GPLY] == 0) &&
      (type_count[NRET] == 0) &&
      (type_count[GNRT] == 0) &&
      (type_count[EMPTY] == 0)) {
    for (let i=0; i<boundary_inwards_xy.length; i++) {
      let sx = boundary_inwards_xy[i][0].x;
      let sy = boundary_inwards_xy[i][0].y;

      let mx = boundary_inwards_xy[i][1].x;
      let my = boundary_inwards_xy[i][1].y;

      let ex = boundary_inwards_xy[i][2].x;
      let ey = boundary_inwards_xy[i][2].y;

      let beg_tile = tile[sy][sx];
      let mid_tile = tile[my][mx];
      let end_tile = tile[ey][ex];

      // an obstruction in terms of walls or no return, means
      // we can't enter from this direction.
      //
      if (beg_tile == WALL) { continue; }

      // if there's a crate-crate or crate-wall in line, we can't move
      // them, so can't move in.
      //
      if ( ((beg_tile == CRAT) || (beg_tile == GCRT)) &&
           ((mid_tile == CRAT) || (mid_tile == GCRT) || (mid_tile == WALL)) ) {
        continue;
      }

      // Player moves in.
      //
      // reduce no return left in for no particular reason.
      //
      let nei_tile = reduce_noret( tile );

      if      (beg_tile == MOVE) { nei_tile[sy][sx] = PLAY; }
      else if (beg_tile == GOAL) { nei_tile[sy][sx] = GPLY; }
      else if (beg_tile == CRAT) {
        nei_tile[sy][sx] = PLAY;
        if      (mid_tile == MOVE) { nei_tile[my][mx] = CRAT; }
        else if (mid_tile == GOAL) { nei_tile[my][mx] = GCRT; }
      }
      else if (beg_tile == GCRT) {
        nei_tile[sy][sx] = GPLY;
        if      (mid_tile == MOVE) { nei_tile[my][mx] = CRAT; }
        else if (mid_tile == GOAL) { nei_tile[my][mx] = GCRT; }
      }
      T.push({"tile": nei_tile, "type":"ob_player" });

      // block gets pushed in
      //
      if ((beg_tile != CRAT) &&
          (beg_tile != GCRT)) {
        nei_tile = reduce_noret( tile );
        if      (beg_tile == MOVE) { nei_tile[sy][sx] = CRAT; }
        else if (beg_tile == GOAL) { nei_tile[sy][sx] = GCRT; }
        T.push({"tile": nei_tile, "type":"ob_block" });
      }

    }

  }


  // go through and add key to all entries
  //
  for (let i=0; i<T.length; i++) {
    T[i]["key"] = tile_keystr(T[i].tile);
  }

  //DEBUG
  //DEBUG
  if (DEBUG_LEVEL > 1) {
    console.log("-----");
    console.log("z(time) src:", "{" + tile_keystr(tile) + "}");
    console.log(tile[0].join(""));
    console.log(tile[1].join(""));
    console.log(tile[2].join(""));
    for (let i=0; i<T.length; i++) {
      console.log("  ===>", "{"  + T[i].key + "}", "(type:", T[i].type, ")");
      console.log( "  ", T[i].tile[0].join(""));
      console.log( "  ", T[i].tile[1].join(""));
      console.log( "  ", T[i].tile[2].join(""));
      console.log("");
    }
  }
  //DEBUG
  //DEBUG


  return T;
}

function tile_valid(tile) {
  let player_count = 0;
  let noreturn_count = 0;
  let crate_count = 0;
  let wall_count = 0;
  let open_count = 0;
  for (let y=0; y<tile.length; y++) {
    for (let x=0; x<tile[y].length; x++) {
      if ((tile[y][x] == PLAY) || (tile[y][x] == GPLY)) { player_count++; }
      if ((tile[y][x] == NRET) || (tile[y][x] == GNRT)) { noreturn_count++; }
      if ((tile[y][x] == CRAT) || (tile[y][x] == GCRT)) { crate_count++; }
      if ((tile[y][x] == WALL)) { wall_count++; }
      if ((tile[y][x] == MOVE) || (tile[y][x] == GOAL)) { open_count++; }
    }
  }
  if (player_count > 1) { return 0; }
  if (noreturn_count > 1) { return 0; }

  // Anything other than a wall surrounded by a wall is invalid.
  // We assume the level has been normalized.
  //
  if (tile[1][1] != WALL) {

    if ((tile[0][1] == WALL) &&

        (tile[1][0] == WALL) &&
        (tile[1][2] == WALL) &&

        (tile[2][1] == WALL)) {
      return 0;
    }

  }

  // No return tile has to have a player next to it
  //
  if ((tile[1][1] == NRET) ||
      (tile[1][1] == GNRT)) {
    if (player_count == 0) { return 0; }
  }

  // Player must have return tile next to it
  // but we keep player at center as we can be
  // in an arbitrary start state
  //
  if ((tile[1][1] == PLAY) ||
      (tile[1][1] == GPLY)) {

    //if ((noreturn_count == 0) &&
    //    (open_count != 1)) {
    //  return 0;
    //}

  }

  // no return not next to player
  //
  else if ((player_count > 0) &&
           (noreturn_count == 1) &&
           (tile[1][1] != NRET) &&
           (tile[1][1] != GNRT)) {
    return 0;
  }

  return 1;
}

// return 0 if blocks can still be moved within super tile
// return 1 if the blcoks are trapped in the superblock
//
function is_trap(tile) {

  let tpos = [
    [ [1,0], [0,1] ],
    [ [0,1], [1,2] ],
    [ [1,2], [2,1] ],
    [ [2,1], [1,0] ]
  ];

  for (let i=0; i<tpos.length; i++) {
    let y0 = tpos[i][0][0];
    let x0 = tpos[i][0][1];

    let y1 = tpos[i][1][0];
    let x1 = tpos[i][1][1];

    if ((tile[y0][x0] == WALL) &&
        (tile[y1][x1] == WALL) &&
        (tile[1][1] == CRAT)) {
      return 1;
    }
  }

  return 0;
}

// probably a lot of work for little gain but
// indicate when a player gets trapped in a dead
// end.
//
function is_dead_end(tile) {

  // y,x
  let _dir = [
    [1,2], [1,0],
    [0,1], [2,1]
  ];

  if ((tile[1][1] != PLAY) &&
      (tile[1][1] != GPLY)) { return 0; }

  let nei_tile = "'";
  let wall_count = 0;
  for (let idir=0; idir<_dir.length; idir++) {
    let y = _dir[idir][0];
    let x = _dir[idir][1];

    if (tile[y][x] == WALL) { wall_count++; }
    else { nei_tile = tile[y][x]; }

  }

  if (wall_count < 3) { return 0; }

  if ((nei_tile == NRET) ||
      (nei_tile == GNRT)) {
    return 1;
  }

  return 0;
}

// returns 1 if all boxes are on pressure plates
// within super block
//
// returns 0 if there's pressure plate without a box
// or if there are no pressure plates in the super block
//
function is_goal(tile) {
  let n = 0,
      tot = 0,
      g_count = 0;
  for (let y=0; y<tile.length; y++) {
    for (let x=0; x<tile[y].length; x++) {
      n++;
      if ((tile[y][x] != CRAT) &&
          (tile[y][x] != GPLY) &&
          (tile[y][x] != GOAL)) { tot++; }
      if (tile[y][x] == GCRT) { g_count++; }
    }
  }
  if ((g_count>0) && (tot==n)) { return 1; }

  return 0;
}

// returns 1 if all boxes are on pressure plates
// within super block
//
// returns 0 if there's pressure plate without a box
// or if there are no pressure plates in the super block
//
function is_transitional(tile) {
  let tot = 0,
      pp_count = 0;
      s_count = 0;
      b_count = 0;
  for (let y=0; y<tile.length; y++) {
    for (let x=0; x<tile[y].length; x++) {
      if (tile[y][x] == CRAT) { b_count++; }
      if (tile[y][x] == GOAL) { s_count++; }
      if (tile[y][x] == GPLY) { pp_count++; }
    }
  }
  if ((b_count > 0) || (s_count > 0) || (pp_count > 0)) { return 1; }
  return 0;
}

function vsum(v) {
  let s = 0;
  for (let i=0; i<v.length; i++) { s += v[i]; }
  return s;
}

function vincr(v, base) {

  let carry = 1;
  for (i=0; i<v.length; i++) {
    carry = 0;
    v[i]++;
    if (v[i] >= base) {
      v[i] = 0; 
      carry = 1;
    }
    if (carry == 0) { break; }
  }

  return v;
}

function tile_keystr(tile) {
  return tile[0][1] + tile[1][0] + tile[1][1] + tile[1][2] + tile[2][1];
}

// return tile library:
//
// key : succinct represetnation of super tile state
//
//   .id : intenger id of tile
//   .key : succinct represenetation of super tile state
//   .tile : array representation of tile ([y][x])
//   .goal : indicator whether it's a goal state
//   .trap : indicator wehtehr it's a trapped state (deadlock)
//
function construct_tile_lib() {
  let tile_count = 0;

  let etile =
            EMPTY +
    EMPTY + EMPTY + EMPTY +
            EMPTY;

  let tile_lib = {}
  tile_lib[etile] = {
    "id": 0,
    "key": etile,
    "tile": [[EMPTY,EMPTY,EMPTY], [EMPTY,EMPTY,EMPTY], [EMPTY,EMPTY,EMPTY]],
    "transitional": 0,
    "goal":0,
    "trap":0
  }

  let code_vec = [
       0,
    0, 0, 0,
       0
  ];

  let ipos = [
              [ 1, 0 ],
    [ 0, 1 ], [ 1, 1 ], [ 2, 1 ],
              [ 1, 2 ]
  ];

  do {
    let tile = [
      ["'", "!", "'" ],
      ["!", "!", "!" ],
      ["'", "!", "'" ]
    ];

    for (let i=0; i<ipos.length; i++) {
      tile[ ipos[i][1] ][ ipos[i][0] ] = CODE[ code_vec[i] ];
    }
    vincr(code_vec, CODE.length);

    if (!tile_valid(tile)) {

      if (DEBUG_LEVEL > 0) {
        console.log(";skipping:", tile_keystr(tile) );
        console.log(";", tile[0].join(""));
        console.log(";", tile[1].join(""));
        console.log(";", tile[2].join(""));
      }
      continue;
    }

    tile_count++;

    let key = tile_keystr(tile);

    if (key in tile_lib) { console.log("DUP FOUND", key); }

    tile_lib[key] = {
      "id": tile_count,
      "goal": is_goal(tile),
      "transitional": is_transitional(tile),
      "trap": is_trap(tile),
      "dead_end": is_dead_end(tile),
      "key": key,
      "tile": tile
    };

    if (DEBUG_LEVEL > 1) {
      console.log( tile_keystr(tile) );
      console.log("trap:", is_trap(tile), "goal:", is_goal(tile), "transitional:", is_transitional(tile), "dead_end:", is_dead_end(tile));
      console.log("/---\\");
      console.log( "|" + tile[0].join("") + "|\n|" + tile[1].join("") + "|\n|" + tile[2].join("") + "|" );
      console.log("\\---/");
      console.log("--");
    }


  } while ( vsum(code_vec) != 0 );

  return tile_lib;
}

async function create_tileset(opt, poms_cfg) {
  let N = poms_cfg.weight.length;
  let s = Math.floor(Math.sqrt(N));
  if ((s*s) < N) { s++; }

  let stride = opt.stride;

  let flatTileMap = {}
  flatTileMap[EMPTY] = 0;
  flatTileMap[WALL] = 1;
  flatTileMap[MOVE] = 2;
  flatTileMap[GOAL] = 3;
  flatTileMap[CRAT] = 4;
  flatTileMap[GCRT] = 5;
  flatTileMap[PLAY] = 6;
  flatTileMap[GPLY] = 7;
  flatTileMap[NRET] = 8;
  flatTileMap[GNRT] = 9;

  let flat_tileset_img = await jimp.read(opt.flat_tileset);
  let tileset_img = new jimp({"width":stride*s, "height":stride*s});

  // create tileset image (png)
  //
  for (let tile_id=1; tile_id < poms_cfg.name.length; tile_id++) {
    let tile_name = poms_cfg.name[tile_id];
    let idx = tile_id-1;

    let idx_y = Math.floor( idx / s );
    let idx_x = (idx % s);

    let sx = stride*idx_x;
    let sy = stride*idx_y;

    //let flat_idx = flatTileMap[ tile_name[0] ]-1;
    let flat_idx = flatTileMap[ tile_name[2] ]-1;

    if ((typeof flat_idx === "undefined") ||
        (flat_idx < 0)) {
      console.log("ERROR", tile_id, flat_idx, tile_name);
    }

    let flat_x = stride*flat_idx;
    let flat_y = 0;

    tileset_img.blit({"src":flat_tileset_img, "x":sx, "y":sy, "srcX":flat_x, "srcY":flat_y, "srcW":stride, "srcH":stride});
  }

  if (DEBUG_LEVEL > 0) {
    console.log("# writing", opt.tileset);
  }
  tileset_img.write( opt.tileset );

  let tileset_info = poms_cfg.tileset;
  tileset_info.image = opt.tileset;
  tileset_info.tilecount = N;
  tileset_info.imagewidth = tileset_img.width;
  tileset_info.imageheight = tileset_img.height;
  tileset_info.tilewidth = stride;
  tileset_info.tileheight = stride;

  let ft_info = poms_cfg.flatTileset;
  ft_info.image = opt.flat_tileset;
  ft_info.tilecount = 9;
  ft_info.imagewidth = flat_tileset_img.width;
  ft_info.imageheight = flat_tileset_img.height;
  ft_info.tilewidth = stride;
  ft_info.tileheight = stride;

  return poms_cfg;
}

function write_flat_tiled_json(info, out_fn) {

  //let stride = [ info.stride, info.stride ];
  let stride = info.stride;

  let template = {
    "backgroundcolor":"#ffffff",
    "height": -1,
    "width": -1,
    "layers": [
      {
        "data": [],
        "width":-1,
        "height":-1,
        "x":0,
        "y":0,
        "name": "main",
        "opacity": 1,
        "type":"tilelayer",
        "visible":true
      }
    ],
    "nextobjectid":1,
    "orientation": "orthogonal",
    "properties":[],
    "renderorder": "right-down",
    "tileheight": -1,
    "tilewidth": -1,
    "tilesets": [{
      "columns": -1,
      "image": "",
      "imageheight": -1, // ****
      "imagewidth": -1, // ****
      "tilecount": -1, // ****
      "tileheight": -1, // ****
      "tilewidth": -1, // ****
      "margin": 0,
      "spacing": 0,
      "name": "tileset",
      "firstgid": 1
    }],
    "version": 1
  };

  template.width = info.map_w;
  template.height = info.map_h;
  template.tileheight = stride[1];
  template.tilewidth = stride[0];

  template.layers[0].data = info.flat_map_array;
  template.layers[0].width = info.map_w;
  template.layers[0].height = info.map_h;

  //template.tilesets[0].image = ".out/tilemap.png";
  template.tilesets[0].image = info.flat_tileset_fn;
  template.tilesets[0].tileheight = stride[1];
  template.tilesets[0].tilewidth = stride[0];
  template.tilesets[0].tilecount = info.simpletile_count-1;
  template.tilesets[0].columns = info.map_w;
  template.tilesets[0].rows = info.map_w;

  let data = JSON.stringify(template, null, 2);
  fs.writeFileSync( out_fn, data );
}



function write_tiled_json(info, out_fn) {

  //let stride = [ info.stride, info.stride ];
  let stride = info.stride;

  let template = {
    "backgroundcolor":"#ffffff",
    "height": -1,
    "width": -1,
    "layers": [
      { 
        "data": [],
        "width":-1,
        "height":-1,
        "x":0,
        "y":0,
        "name": "main",
        "opacity": 1,
        "type":"tilelayer",
        "visible":true
      }
    ],
    "nextobjectid":1,
    "orientation": "orthogonal",
    "properties":[],
    "renderorder": "right-down",
    "tileheight": -1,
    "tilewidth": -1,
    "tilesets": [{
      "columns": -1,
      "image": "",
      "imageheight": -1, // ****
      "imagewidth": -1, // ****
      "tilecount": -1, // ****
      "tileheight": -1, // ****
      "tilewidth": -1, // ****
      "margin": 0,
      "spacing": 0,
      "name": "tileset",
      "firstgid": 1
    }],
    "version": 1
  };

  template.width = info.map_w;
  template.height = info.map_h;
  template.tileheight = stride[1];
  template.tilewidth = stride[0];

  template.layers[0].data = info.map_array;
  template.layers[0].width = info.map_w;
  template.layers[0].height = info.map_h;

  //template.tilesets[0].image = ".out/tilemap.png";
  template.tilesets[0].image = info.tileset_fn;
  template.tilesets[0].tileheight = stride[1];
  template.tilesets[0].tilewidth = stride[0];
  template.tilesets[0].tilecount = info.supertile_count-1;
  template.tilesets[0].columns = info.map_w;
  template.tilesets[0].rows = info.map_w;

  let data = JSON.stringify(template, null, 2);
  fs.writeFileSync( out_fn, data );
}


function poms_setup_initial_restriction(poms_cfg, level_info) {
  let W = level_info.w;
  let H = level_info.H;
  let level = level_info.tile_level;

  let level_constraint = [];

  for (let cell=0; cell<level.length; cell++) {
    let x = (cell % W);
    let y = Math.floor(cell / W);

    let tile_id = level[ (y*W) + x ];

    level_constraint.push( {"type":"force", "range":{"tile":[tile_id,tile_id+1], "x":[x,x+1], "y":[y,y+1], "z":[0,1]}} );
  }

  for (let idx=0; idx<level_constraint.length; idx++) {
    poms_cfg.constraint.push( level_constraint[idx] );
  }

  return poms_cfg;
}


function normalize_map(map_str) {

}

function load_xsb_level(opt, poms_json) {
  let fn = opt.level;
  let data = fs.readFileSync(fn, "utf8");

  let level = [];

  let level_w = 0,
      level_h = 0;

  let lines = data.split("\n");
  for (let line_no=0; line_no<lines.length; line_no++) {
    let a = lines[line_no].split("");
    if (a.length == 0) { continue; }
    level.push(a);
    level_h++;
    level_w = lines[line_no].length;
  }

  let name_tileid_lookup = {};
  for (let tile_id = 0; tile_id < poms_json.name.length; tile_id++) {
    let name = poms_json.name[tile_id];
    name_tileid_lookup[ name ] = tile_id;
  }

  let tiled_data = [];

  let boundary_xy = [
    { "x":1, "y":0 },
    { "x":-1, "y":0 },
    { "x":0, "y":-1 },
    { "x":0, "y":1 }
  ];

  for (let y=0; y<level_h; y++) {
    for (let x=0; x<level_w; x++) {
      let supertile = [ ["'", "#", "'"], ["#", "#", "#"], ["'", "#", "'"] ];

      supertile[1][1] = level[y][x];
      for (let idir=0; idir<4; idir++) {
        let dx = boundary_xy[idir].x;
        let dy = boundary_xy[idir].y;
        if ( ((y+dy) < 0) ||
             ((y+dy) >= level_h) ||
             ((x+dx) < 0) ||
             ((x+dx) >= level_w) ) {
          continue;
        }
        supertile[dy+1][dx+1] = level[y+dy][x+dx];
      }


      let tile_name = tile_keystr(supertile);

      if (!(tile_name in name_tileid_lookup)) {
        console.log("ERROR! could not find", tile_name);
        tiled_data.push(-1);
        continue;
      }

      let tile_id = name_tileid_lookup[tile_name];

      tiled_data.push(tile_id);
    }
  }

  return {"tile_level":tiled_data, "w": level_w, "h": level_h, "level": level};
}

async function main(opt) {
  let default_opt = {
    "solve": true
  };
  opt = ((typeof opt === "undefined") ? default_opt : opt);
  for (let key in default_opt) {
    if (!(key in opt)) { opt[key] = default_opt[key]; }
  }

  let DIR_DESCR = [ "+x", "-x", "+y", "-y", "+z", "-z" ];

  if (DEBUG_LEVEL > 0) {
    console.log("#opt:",opt);
  }

  let oppo = [1,0, 3,2, 5,4];
  let tile_rule = [];

  let tile_lib = construct_tile_lib();

  //DEBUG
  if (DEBUG_LEVEL > 1) {
    for (let key in tile_lib) {
      let v = tile_lib[key];
      console.log("tile_lib[", key, "]: {", ".id:", v.id, ", .key:", v.key, ", .tile:", v.tile, ", .t:", v.transitional, ", .g:", v.goal, ", .T", v.trap, "}");
    }
  }


  let debug_counter = 0;
  let tot_counter = 0;

  for (let src_key in tile_lib) {
    tot_counter++;
  }

  console.log(";;; constructing rule transitions");

  for (let src_key in tile_lib) {

    debug_counter++;
    if ((debug_counter % 100)==0) {
      console.log(";;;", debug_counter, "/", tot_counter);
    }

    let dst_z_tiles = construct_z_transition(tile_lib[src_key].tile);

    let src_tile = tile_lib[src_key];

    for (let i=0; i<dst_z_tiles.length; i++) {
      let dst_key = dst_z_tiles[i].key;

      if (!(src_key in tile_lib)) {
        console.log("ERROR", src_key, dst_key);
      }

      if (!(dst_key in tile_lib)) {
        console.log("ERROR", src_key, dst_key);
      }

      let dst_tile = tile_lib[dst_key];

      tile_rule.push( [src_tile.id, dst_tile.id, 4, 1] );
      tile_rule.push( [dst_tile.id, src_tile.id, 5, 1] );

      // construct general 0 (boundary tile) neighbor to all
      // tiles for z transition
      //
      if (src_tile.id != 0)  {
        tile_rule.push( [src_tile.id, 0, 4, 1] );
        tile_rule.push( [src_tile.id, 0, 5, 1] );

        tile_rule.push( [0, src_tile.id, 4, 1] );
        tile_rule.push( [0, src_tile.id, 5, 1] );
      }

      if (dst_tile.id != 0) {
        tile_rule.push( [dst_tile.id, 0, 4, 1] );
        tile_rule.push( [dst_tile.id, 0, 5, 1] );

        tile_rule.push( [0, dst_tile.id, 4, 1] );
        tile_rule.push( [0, dst_tile.id, 5, 1] );
      }

      if (DEBUG_LEVEL > 0) {
        console.log("---");
        console.log( src_key, "(", tile_lib[src_key].id, ")", "-{+-z}->", dst_key, "(", tile_lib[dst_key].id, ")", "(type:", dst_z_tiles[i].type, ")" );
        console.log( tile_lib[src_key].tile[0].join(""), "", tile_lib[dst_key].tile[0].join("") );
        console.log( tile_lib[src_key].tile[1].join(""), "", tile_lib[dst_key].tile[1].join("") );
        console.log( tile_lib[src_key].tile[2].join(""), "", tile_lib[dst_key].tile[2].join("") );
        console.log("");
      }

    }

    let dst_xy_tiles = construct_xy_neighbors(tile_lib[src_key].tile, tile_lib);

    for (let i=0; i<dst_xy_tiles.length; i++) {

      let dst_info = dst_xy_tiles[i];
      let dst_key = dst_xy_tiles[i].key;

      if (!(dst_key in tile_lib)) {
        console.log("ERROR (xy)", src_key, dst_key);
      }

      let dst_tile = tile_lib[dst_key];

      tile_rule.push( [src_tile.id, dst_tile.id, dst_info.idir, 1] );
      tile_rule.push( [dst_tile.id, src_tile.id, oppo[dst_info.idir], 1] );

      if (DEBUG_LEVEL > 1) {
        console.log("===");
        console.log( src_key, "(", tile_lib[src_key].id, ")", "-(", DIR_DESCR[dst_info.idir], "{", dst_info.idir, "}", ")->", dst_key, "(", tile_lib[dst_key].id, ")" );
        console.log( tile_lib[src_key].tile[0].join(""), "", tile_lib[dst_key].tile[0].join("") );
        console.log( tile_lib[src_key].tile[1].join(""), "", tile_lib[dst_key].tile[1].join("") );
        console.log( tile_lib[src_key].tile[2].join(""), "", tile_lib[dst_key].tile[2].join("") );
        console.log("");
      }
    }

  }

  if (DEBUG_LEVEL > 0) {
    console.log(JSON.stringify(tile_lib, undefined, 2));
  }

  let poms_cfg = libpoms.configTemplate();
  poms_cfg["comment"] = [
    "_ - boundary condition (out of bounds simple tile)",
    "# - wall",
    "  - (space) moveable region",
    ". - storage (unoccupied)",
    "$ - crate",
    "* - crate on storage",
    "@ - player",
    "+ - player on storage",
    "x - noreturn (space)",
    "X - noreturn (goal)",
    "",
    "group 0 - default",
    "group 1 - transitional state (at least one non-stored block or unoccupied storage exists)",
    "group 2 - end condition (at least one storage exists and all storage occupied)",
    "group 3 - trap or deadlock state",
    "group 4 - dead end (player locked)"
  ];

  console.log(";;; deduplicating rules (tile_rule:", tile_rule.length, ")");

  // dedup tile rules
  //
  let _dedup_tile_rule = [];
  tile_rule.sort( function(a,b) {
    if (a[0] < b[0]) { return -1; }
    if (a[0] > b[0]) { return 1; }
    if (a[1] < b[1]) { return -1; }
    if (a[1] > b[1]) { return 1; }
    if (a[2] < b[2]) { return -1; }
    if (a[2] > b[2]) { return 1; }
    return 0;
  });
  _dedup_tile_rule.push( tile_rule[0] );
  for (let i=1; i<tile_rule.length; i++) {
    if ( (tile_rule[i-1][0] == tile_rule[i][0]) &&
         (tile_rule[i-1][1] == tile_rule[i][1]) &&
         (tile_rule[i-1][2] == tile_rule[i][2]) ) {
      continue;
    }
    _dedup_tile_rule.push( tile_rule[i] );
  }

  console.log(";;; deduplicating done (dedup:", _dedup_tile_rule.length, ")");

  poms_cfg.rule = _dedup_tile_rule;

  if ("x" in opt) { poms_cfg.size[0] = opt.x; }
  if ("y" in opt) { poms_cfg.size[1] = opt.y; }
  if ("z" in opt) { poms_cfg.size[2] = opt.z; }

  let flatTileMap = {}
  flatTileMap[EMPTY] = 0;
  flatTileMap[WALL] = 1;
  flatTileMap[MOVE] = 2;
  flatTileMap[GOAL] = 3;
  flatTileMap[CRAT] = 4;
  flatTileMap[GCRT] = 5;
  flatTileMap[PLAY] = 6;
  flatTileMap[GPLY] = 7;
  flatTileMap[NRET] = 8;
  flatTileMap[GNRT] = 9;

  poms_cfg["flatMap"] = [];
  poms_cfg["tileGroup"] = [];

  poms_cfg["flatTileset"] = {};

  let flatTileFreq = {};
  for (let key in flatTileMap) { flatTileFreq[key] = 1; }

  let customTileFreq = {};
  for (let key in flatTileMap) { customTileFreq[key] = 1; }

  let n_tile = 0;
  let max_id = -1;
  let id_tile_map = {};
  for (let key in tile_lib) {
    id_tile_map[ tile_lib[key].id ] = tile_lib[key];
    n_tile++;

    if (tile_lib[key].id > max_id) {
      max_id = tile_lib[key].id;
    }

    let tile_info = tile_lib[key];
    flatTileFreq[ tile_info.key[2] ]++;
    customTileFreq[ tile_info.key[2] ]++;

  }

  let weight_type = opt["w"];

  if (weight_type == "custom") {
    customTileFreq[ PLAY ] = 50;
    customTileFreq[ GPLY ] = 50;
  }
  else if (weight_type == "custom.1") {
    customTileFreq[ PLAY ] = 1;
    customTileFreq[ GPLY ] = 1;
  }


  if ((max_id+1) != n_tile) { console.log("ERROR n_tile != max_id:", n_tile, max_id); }

  for (let tile_id=0; tile_id<n_tile; tile_id++) {

    let tile_info = id_tile_map[tile_id];

    if (weight_type == 'uniform') { poms_cfg.weight.push(1); }
    if (weight_type == 'flat')    { poms_cfg.weight.push( flatTileFreq[ tile_info.key[2] ] ); }
    if (weight_type == 'custom')  { poms_cfg.weight.push( customTileFreq[ tile_info.key[2] ] ); }
    if (weight_type == 'custom.1'){ poms_cfg.weight.push( customTileFreq[ tile_info.key[2] ] ); }
    else                          { poms_cfg.weight.push(1); }
    poms_cfg.name.push( tile_info.key )

    //poms_cfg.flatMap.push( flatTileMap[ tile_info.key[0] ] );
    poms_cfg.flatMap.push( flatTileMap[ tile_info.key[2] ] );

    let tile_group = 0;
    if (tile_info.transitional) { tile_group = 1; }
    if (tile_info.goal)         { tile_group = 2; }
    if (tile_info.trap)         { tile_group = 3; }
    if (tile_info.dead_end)     { tile_group = 4; }
    poms_cfg.tileGroup.push(tile_group);
  }

  // remove virtual boundary tile
  //
  poms_cfg.constraint.push({ "type":"remove", "range": {"tile":[0,1], "x":[], "y":[], "z":[] } });

  for (let tile_id=0; tile_id < poms_cfg.tileGroup.length; tile_id++) {

    // remove deadlock states
    //
    if (poms_cfg.tileGroup[tile_id] == 3) {
      poms_cfg.constraint.push({ "type":"remove", "range": {"tile":[tile_id,tile_id+1], "x":[], "y":[], "z":[] } });
    }

    // remove dead end states
    //
    if (poms_cfg.tileGroup[tile_id] == 4) {
      poms_cfg.constraint.push({ "type":"remove", "range": {"tile":[tile_id,tile_id+1], "x":[], "y":[], "z":[] } });
    }

    // force solution by removing transitional states
    //
    if (opt.solve) {
      if (poms_cfg.tileGroup[tile_id] == 1) {
        poms_cfg.constraint.push({ "type":"remove", "range": {"tile":[tile_id,tile_id+1], "x":[], "y":[], "z":[-1] } });
      }
    }

  }


  if (("tileset" in opt) &&
      ("flat_tileset" in opt) &&
      ("stride" in opt)) {

    console.log(";;; creating PNG tileset");

    await create_tileset(opt, poms_cfg);

    if ("level" in opt) {

      console.log(";;; loading xsb");

      let level_info = await load_xsb_level(opt, poms_cfg);

      let tiled_info = {
        "stride": [ opt.stride, opt.stride ],
        "map_w" : level_info.w,
        "map_h" : level_info.h,
        "map_array": level_info.tile_level,
        "tileset_fn" : opt.tileset,
        "supertile_count": poms_cfg.name.length
      };


      if ("tiled_fn" in opt) {

        console.log(";;; writing tiled json");

        await write_tiled_json(tiled_info, opt.tiled_fn);
      }

      if ("flat_tiled_fn" in opt) {

        console.log(";;; writing flat tiled json");

        let flat_data = [];

        //DEBUG
        //DEBUG
        //DEBUG
        console.log("trying to construct flat tile map:");
        console.log(level_info.tile_level);

        let max_flat_id = 0;
        let _lvl = level_info.tile_level;
        for (let i=0; i<_lvl.length; i++) {
          let flat_tile_id = poms_cfg.flatMap[ _lvl[i] ];
          flat_data.push( flat_tile_id );
          if (max_flat_id  < flat_tile_id) { max_flat_id = flat_tile_id; }
        }
        max_flat_id++;

        let flat_tiled_info = {
          "stride": [ opt.stride, opt.stride ],
          "map_w" : level_info.w,
          "map_h" : level_info.h,
          "map_array": flat_data,
          "tileset_fn" : opt.flat_tileset,
          "supertile_count": max_flat_id
        };

        await write_tiled_json(flat_tiled_info, opt.flat_tiled_fn);
      }


      // if there's a level specified, setup constraints to try and solve
      //

      poms_cfg.size[0] = level_info.w;
      poms_cfg.size[1] = level_info.h;

      console.log(";;; setting up initial restrictions");

      poms_setup_initial_restriction(poms_cfg, level_info);
    }

  }

  if ("poms_fn" in opt) {

    console.log(";;; writing POMS config file");

    fs.writeFileSync( opt.poms_fn, libpoms.configStringify(poms_cfg) );
  }
  else {
    console.log( libpoms.configStringify(poms_cfg) );
  }

  return 0;
}

var main_opt = {};

var long_opt = [
  "h", "(help)",
  "v", "(version)",
  "V", ":(verbose)",

  "L", ":(level)",

  "T", ":(tileset)",
  "t", ":(flat-tileset)",

  "M", ":(tiled-fn)",
  "m", ":(flat-tiled-fn)",

  "s", ":(stride)",

  "P", ":(poms)",

  "x", ":(x)",
  "y", ":(y)",
  "z", ":(z)",

  "w", ":(weight-type)"
];

var long_opt_desc = [
  "help (this screen)",
  "version",
  "verbosity level",
  "setup level (normalized sokoban xsb format)",
  "output tileset to generate (png)",
  "input flat tileset to generate (png, required for tileset generation)",
  "output tiled file (json)",
  "output flat tiled file (json)",
  "stride, in pixels (required for tileset generation)",
  "POMS config file to write to (default, stdout)",

  "x coordinate size",
  "y coordinate size",
  "z (time) coordinate size",

  "weight type {uniform|flat} (uniform default)",
  ""
];

function show_version(fp) {
  fp.write( SOKOITA_RULEGEN_VERSION + "\n");
}

function show_help(fp) {
  fp.write("\nsokoita_rulegen.js, version ");
  show_version(fp);
  fp.write("\n");

  for (let i=0; i<long_opt.length; i+=2) {
    let s = "  -" + long_opt[i] + ",--" + long_opt[i+1].replace( /:?\(/, '').replace( /\)$/, '' );
    fp.write( s );

    for (let space=0; space < (24-s.length); space++) { fp.write(" "); }
    fp.write( long_opt_desc[Math.floor(i/2)] + "\n");
  }
  fp.write("\n");
}

var exec = 1;

let arg_opt = {};


var parser = new getopt.BasicParser(long_opt.join(""), process.argv);

while ((arg_opt = parser.getopt()) !== undefined) {
  switch (arg_opt.option) {
    case 'h':
      show_help(process.stdout);
      exec = 0;
      break;
    case 'v':
      show_version(process.stdout);
      exec = 0;
      break;

    case 'V':
      DEBUG_LEVEL = parseInt(arg_opt.optarg);
      break;

    case 'L':
      main_opt["level"] = arg_opt.optarg;
      break;

    case 'T':
      main_opt["tileset"] = arg_opt.optarg;
      break;
    case 't':
      main_opt["flat_tileset"] = arg_opt.optarg;
      break;

    case 'M':
      main_opt["tiled_fn"] = arg_opt.optarg;
      break;
    case 'm':
      main_opt["flat_tiled_fn"] = arg_opt.optarg;
      break;

    case 's':
      main_opt["stride"] = parseInt(arg_opt.optarg);
      break;

    case 'P':
      main_opt["poms_fn"] = arg_opt.optarg;
      break;

    case 'x':
      main_opt["x"] = parseInt(arg_opt.optarg);
      break;
    case 'y':
      main_opt["y"] = parseInt(arg_opt.optarg);
      break;
    case 'z':
      main_opt["z"] = parseInt(arg_opt.optarg);
      break;

    case 'w':
      main_opt["w"] = arg_opt.optarg;
      break;

    default:
      show_help(process.stderr);
      exec = 0;
      break;
  }

  if (exec == 0) { break; }
}

if (exec != 0) {

  main(main_opt);

}

