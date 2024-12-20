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
// Create a 'half cross' pattern for the supertile pattern library,
// with overlap of a single tile.
//
// Half Cross:
//
//   (0,0) (1,0)
//   (0,1)
//
// (may need to fiddle with they coordinate)
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
// Using a 3x3 is completely intractable.
//
// Using a cross pattern alsmot works but adding the path tiles
// blows up the tile count to over 160k+.
//

// The spatial dimensions are xy with the z being time.
// Supertiles are created in the spatial (xy) domain.
// Z (time) translations are treated specially.
//

var fs = require("fs");
var getopt = require("posix-getopt");
var libpoms = require("./libpoms.js");
var jimp = require("jimp").Jimp;

var DEBUG_LEVEL = 1;

var SOKOITA_RULEGEN_VERSION = "0.4.0";

// XSB format. Added a '_' to indicate 'out of bounds'
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
    GPLY = '+';

let XSB_CODE = [ 
  WALL, MOVE,
  GOAL,
  CRAT, GCRT,
  PLAY, GPLY
];


//  '_',

// these tiles encode some of the game mechanics.
//
// wasd/WASD for player movement (+ on goal)
// ijkl/IJKL for crate movement (+ on goal)
// . goal
// x/X no return (+ on goal)
//
// ###nope### :/; path (+ on goal)
// ###nope###x/X path eater (+ on goal)
//
// player movement:
//           w (up)
//  a (left) s (downn) d (right)
//
//  crate movement:
//           i (up)
//  j (left) k (down) l (right)
//
//  The encoded position is what direction
//  it moved.
//
//  So:
//
//  ######       ######
//  # @$ #  -->  #  dl#
//  ######       ######
//

// 21
//
var SOKOITA_CODE = [
  '#',
  ' ',

  '.', // unadorned goal

  'l', 'j', 'i', 'k',  // crate moves
  'L', 'J', 'I', 'K',  // crate vmoes on goal

  'd', 'a', 'w', 's',  // player moves
  'D', 'A', 'W', 'S',  // player moves on goal


  'x',  // no return path (on space)
  'X',  // no return path (on goal)

  //':',  // no return path (on space)
  //';',  // no return path (on goal)

  //'x',  // path explode (space)
  //'X'   // path explode (goal)
];

var PLAY_UP = 'w',
    PLAY_DOWN = 's',
    PLAY_RIGHT = 'd',
    PLAY_LEFT = 'a';

var PLAY_UP_GOAL = 'W',
    PLAY_DOWN_GOAL = 'S',
    PLAY_RIGHT_GOAL = 'D',
    PLAY_LEFT_GOAL = 'A';

var CRATE_UP = 'i',
    CRATE_DOWN = 'k',
    CRATE_RIGHT = 'l',
    CRATE_LEFT = 'j';

var CRATE_UP_GOAL = 'I',
    CRATE_DOWN_GOAL = 'K',
    CRATE_RIGHT_GOAL = 'L',
    CRATE_LEFT_GOAL = 'J';


function is_player_code(ch) {
  let player_code = [
    'd', 'a', 'w', 's',
    'D', 'A', 'W', 'S'
  ];

  for (let i=0; i<player_code.length; i++) {
    if (ch == player_code[i]) { return 1; }
  }
  return 0;
}

function is_wall_code(ch) {
  if (ch == '#') { return 1; }
  return 0;
}

function is_goal_code(ch) {
  let goal_code = [
    'D', 'A', 'W', 'S',
    'L', 'J', 'I', 'K',
    '.',
    //';',
    'X'
  ];

  for (let i=0; i<goal_code.length; i++) {
    if (ch == goal_code[i]) { return 1; }
  }
  return 0;
}

function is_crate_code(ch) {
  let crate_code = [
    'l', 'j', 'i', 'k',  // crate moves
    'L', 'J', 'I', 'K'   // crate vmoes on goal
  ];

  for (let i=0; i<crate_code.length; i++) {
    if (ch == crate_code[i]) { return 1; }
  }

  return 0;
}

// all things that can't move and don't explode
//
function is_static_code(ch) {
  let static_code = [
    '#', ' ', '.',
    //':', ';',
    //'x', 'X',
    'l', 'j', 'i', 'k',  // crate moves
    'L', 'J', 'I', 'K'   // crate vmoes on goal
  ];

  for (let i=0; i<static_code.length; i++) {
    if (ch == static_code[i]) { return 1; }
  }

  return 0;
}

function is_open_code(ch) {
  let open_code = [
    ' ', '.'
    //,'x', 'X'
  ];

  for (let i=0; i<open_code.length; i++) {
    if (ch == open_code[i]) { return 1; }
  }

  return 0;
}

function is_noreturn_code(ch) {
  let path_code = [
    //';', ':'
    'x', 'X'
  ];

  for (let i=0; i<path_code.length; i++) {
    if (ch == path_code[i]) { return 1; }
  }

  return 0;
}

/*
function is_explode_code(ch) {
  let explode_code = [
    'x', 'X'
  ];

  for (let i=0; i<explode_code.length; i++) {
    if (ch == explode_code[i]) { return 1; }
  }

  return 0;
}
*/

//----
//----
//----

function construct_virtual_tile(ta, tb, dx, dy) {

  if (dx > 0) {
    return [
      [ ta[0][0], tb[0][0], tb[0][1] ],
      [ ta[1][0], tb[1][0], "'" ]
    ];
  }

  return [
    [ ta[0][0], ta[0][1] ],
    [ tb[0][0], tb[0][1] ],
    [ tb[1][0], "'" ]
  ];

}

function print_virtual_tile(tile) {
  let max_w = 0;

  for (let y=0; y<tile.length; y++) {
    if (max_w < tile[y].length) { max_w = tile[y].length; }
  }

  for (let y=0; y<tile.length; y++) {
    let a = [];

    for (let x=0; x<tile[y].length; x++) {
      a.push(tile[y][x]);
    }
    for (let x=tile[y].length; x<max_w; x++) {
      a.push("'");
    }

    console.log( a.join("") );
  }
}

// half cross supertile schedule:
//
//    0 1
//    2
//
// for convenience, src_tile is 2x2 array with only
// the middle cross valid
//
function construct_xy_neighbors(src_tile, tile_lib) {
  let T = [];

  let etile = EMPTY + EMPTY +
              EMPTY;

  let idir_a = [0,2];
  let boundary_idir = [
    { "x": 1, "y": 0 },
    { "x": 0, "y": 1 }
  ];

  let oppo = [1,0, 3,2, 5,4];

  // if two wall tiles are on a side, construct the 0 (boundary tile)
  // transition
  //
  for (let b_idx=0; b_idx<boundary_idir.length; b_idx++) {
    let _x = boundary_idir[b_idx].x;
    let _y = boundary_idir[b_idx].y;

    if ( (src_tile[0][0] == WALL) &&
         (src_tile[_y][_x] == WALL) ) {
      let _e = [
        [EMPTY,EMPTY],
        [EMPTY,EMPTY]
      ];
      T.push({ "key":etile, "idir": idir_a[b_idx], "tile":_e});
    }
  }

  for (let key in tile_lib) {

    // .id, .goal, .trap, .tile, .key
    //
    let tst_info = tile_lib[key];
    let tst_tile = tst_info.tile;


    // x neighbor
    //
    if (src_tile[0][1] == tst_tile[0][0]) {
      let virt_tile = construct_virtual_tile(src_tile, tst_tile, 1, 0);
      if (tile_valid(virt_tile)) {
        T.push({
          "key": tst_info.key,
          "idir": 0,
          "tile":[
            [tst_tile[0][0], tst_tile[0][1] ],
            [tst_tile[1][0], tst_tile[1][1] ]
          ]
        });
      }

    }

    if (tst_tile[0][1] == src_tile[0][0]) {
      let virt_tile = construct_virtual_tile(tst_tile, src_tile, 1, 0);
      if (tile_valid(virt_tile)) {
        T.push({
          "key": tst_info.key,
          "idir": 1,
          "tile":[
            [tst_tile[0][0], tst_tile[0][1] ],
            [tst_tile[1][0], tst_tile[1][1] ]
          ]
        });
      }
    }

    // y neighbor
    //
    if (tst_tile[1][0] == src_tile[0][0]) {
      let virt_tile = construct_virtual_tile(src_tile, tst_tile, 0, 1);
      if (tile_valid(virt_tile)) {
        T.push({
          "key": tst_info.key,
          "idir": 2,
          "tile":[
            [tst_tile[0][0], tst_tile[0][1] ],
            [tst_tile[1][0], tst_tile[1][1] ]
          ]
        });
      }
    }

    if (src_tile[1][0] == tst_tile[0][0]) {
      let virt_tile = construct_virtual_tile(tst_tile, src_tile, 0, 1);
      if (tile_valid(virt_tile)) {
        T.push({
          "key": tst_info.key,
          "idir": 3,
          "tile":[
            [tst_tile[0][0], tst_tile[0][1] ],
            [tst_tile[1][0], tst_tile[1][1] ]
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

// WIP!!
//
// These encode the mechanics of sokoban.
//
// The assumption here is that super tiles are a 'half-corss'
// pattern, so:
//   x ->
// y 0 1
// | 2
// v
//
// (note, I might have screwed up on the y positioning, so we might
// still need to play with that)
//
// The crate and player moves encode some information about
// where they come from (the 'velocity' if you will),
// so the z transitions make sure that, local to the supertile,
// the state transition makes sense.
//
// The player leaves a 'path' token in their wake as they do non-crate
// moves. This is to avoid churn and embed the fact that repeated state
// is completely superfluous.
// The hope is that this will nudge the player move to a crate as the only admissible
// next implied position is to go next to a crate to make progress.
// (note for the future, given the proper conditions, this might be able to detect deadlock).
// The tokens don't prevent the player from getting in cul-de-sacs but they have
// the potential to avoid narrow passageway dead ends and push the player to a non-trivial
// position.
// It's experimental, so we'll see how well that works out, but that's the idea.
//
// The path tokens need to persist, so it's not good enough to look neighboring
// cells to see if there's an empty space, we need to encode when the path is reset,
// after a player makes a crate move.
//
// When a player moves a crate, an 'explosion' token is placed in the space the
// player moved from and to any path tiles next to the moved crate.
// z/time transition tiles then have a rule that any path with an explosion token
// next to them will explode, with the actual explosion token transition resolving to
// either a simple space or goal, depending (which is why we need path and explosion
// tokens for both empty and unoccupied goal positions).
//
// Single crate pushes might close off areas, but since an explosion token is being placed
// around the pushed crate, the explosion will still cascade to any reachable path.
// Paths are always connected unless closed off by crates, but again, crate moves start
// the chain reaction.
// The explosion will take time to work through all paths in the level but it moves at
// the "speed of light", so the player will never be able to catch up to the explosion
// wave front.
// Subsequent player paths will be behind/enclosed by the wavefront and won't be affected.
// (at least that's the idea, we'll see if I worked this out correctly).
//
// We'll see if it works out, but the idea is even though the half cross is spatially small,
// the overlapping x/y directions for the super tile coupled with the 'velocity' tokens
// for players and crates give us just enough information to encode correct sokoban dynamics.
// That is, we should have conservation of player and crate count and have enough information
// for valid moves.
//
// Before diving into the specific rules, a quick note is that only the player or explosions
// can cause state changes. Crates can only move if a player is present, explosions can only
// cascade and all other dynamics are static.
// With any luck, this means crates can't move spontaneously etc.
//
// Also, a quick reminder, the reason for doing half crosses is because there's a super tile
// count explosion that happens. In theory, using a cross pattern or a 3x3 pattern would work
// but this leads to 160k+ for the cross pattern (any even higher for 3x3), so becomes practically
// infeasible.
//
// With the half cross, the current super tile count is around 9k.
//
// So, for the specifics of the dynamics:
//
// Call T_0 the origin (input) supertile, and T_1 the destination
// supertile in the positive z (time) direction. That is:
//
// T_0: _______        T_1: _______
//     | 0 | 1 |  z+1      | 0 | 1 |
//     |---|---   ==>      |---|---
//     | 2 |               | 2 |
//      ---                 ---
//
// * if no player or explosion is prsent, allow a transition to itself (static transition, st)
// * allow entering player onto space/goal/explosion with appropriate direction (ep)
// * allow outgoing player with path or explosion (op)
// * allow entering crate with explosion (ec)
// * allow outgoing crate on T_0[1] or T_0[2] with player and/or appropriate explosion (oc)
// * allow internal player move onto space/explosion with path (ips)
// * allow internal player move onto crate with explosion (ipc)
// * allow internal crate move with player and explosion  (ic)
// * explode all path tiles (x)
//
//
// ok, this won't work...
//
// ############
// #::::x @$ .#
// #:#### #####
// #::::::#####
// ############
//
// whoops, now we can't go down.
// We can't make a simple flood fill with the explosions because it will go in everywhich
// direction without settling down.
// We can add directionality to the explosion but if we restrict to open spaces, this could
// wrap around and get into loops without ever settling down
// We can add directionality that only goes outwards and ghosts through all tiles but that
// inflates the simple tile count by a factor of 4 or more which translates to roughly a 4^3 = 64x
// factor.
// We can add red/blue paths and alternate, adding some state to the player, but again, this
// inflates tile count and only mitigates the problem without solving it.
// We can add a 'cooldown' for the player, counting down after every moved crate but this not
// only inflates tile count but wastes z moves for the superfluos wait states
// We can add a counter to the player state and add an incrementing counter to the path, allowing a move to
// a path if the player counter is less, but we need to add as many as the maximum z depth, both
// for the player and tile, yet again inflating the super tile count.
//
// We'll still have a valid path from where we came from but this is a lot of work for a suboptimal
// solution.
//
// I think it's better to just go with the literal no-return idea, not allowing an immediate backtrack
// for the player. This will get most of what we want in terms putting pressure on the player to do
// something non trivial and also keep the maze solving aspect intact.
//
// cruft:
//
// * if no player exists in the T_0 supertile, all assuming an empty space or goal
//   - a player or crate can come in from the left, moving right, on either T_0[0] or T_0[2]
//   - a player or crate can come in from the top, moving down, on either T_0[0] or T_0[1]
//   - a player or crate can come in from the right, moving left, on either T_0[1] or T_0[2]
//   - a player or crate can come in from the bottom , moving up, on either T_0[1] or T_0[2]
// * if a player does exist in the supertile, then
//   - T_0[0] == @
//     + move off to the left or up, leaving either a path or explosion
//     + move down or right if an empty space, leaving a path
//     + move down or right if a crate, leaving an explosion on T_1[0] and on any other positions in T_1 that had a path in T_0
//   - T_0[1] == @
//     + move off to the right, up or down, leaving either a path or an explosion
//     + move to the left if T_0[0] is an emapty space/goal, leaving a path
//     + move to the left if T_0[0] is a crate, leaving an explosion
//
//
function construct_z_transition(tile) {

  let T1_list = [];

  let p = [
    {"x":0,"y":0},
    {"x":1,"y":0},
    {"x":0,"y":1}
  ];

  let player_count = 0;
  let path_count = 0;
  let explode_count = 0;
  for (let i=0; i<p.length; i++) {
    let c = tile[p[i].y][p[i].x];
    if ( is_player_code(c) )  { player_count++; }
    if ( is_path_code(c) )    { path_count++; }
    if ( is_explode_code(c) ) { explode_count++; }
  }



  let T0 = [ tile[0][0], tile[0][1], tile[1][0] ];

  // st - static transition
  //
  if ( is_static_code(T0[0]) &&
       is_static_code(T0[1]) &&
       is_static_code(T0[2]) ) {
    let _t = [
      [ tile[0][0], tile[0][1] ],
      [ tile[1][0], tile[1][1] ]
    ];
    T1_list.push(_t);
  }

  // ep - entre player
  //
  if (player_count == 0) {
    if ( is_open_code(T[0]) ) {

      if ( (T0[0] == ' ') ||
           (T0[0] == 'x') ) {
        T1_list.push( [['d',T0[1]], [T0[2],"`"]] );
        T1_list.push( [['s',T0[1]], [T0[2],"`"]] );
      }

      if ( (T0[0] == '.') ||
           (T0[0] == 'X') ) {
        T1_list.push( [['D',T0[1]], [T0[2],"`"]] );
        T1_list.push( [['S',T0[1]], [T0[2],"`"]] );
      }

      if ( (T0[1] == ' ') ||
           (T0[1] == 'x') ) {
        T1_list.push( [[T0[0], 'a'], [T0[2],"`"]] );
        T1_list.push( [[T0[0], 's'], [T0[2],"`"]] );
        T1_list.push( [[T0[0], 'w'], [T0[2],"`"]] );
      }

      if ( (T0[1] == '.') ||
           (T0[1] == 'X') ) {
        T1_list.push( [[T0[0], 'A'], [T0[2],"`"]] );
        T1_list.push( [[T0[0], 'S'], [T0[2],"`"]] );
        T1_list.push( [[T0[0], 'W'], [T0[2],"`"]] );
      }

      if ( (T0[2] == ' ') ||
           (T0[2] == 'x') ) {
        T1_list.push( [[T0[0],T0[1]], ['d',"`"]] );
        T1_list.push( [[T0[0],T0[1]], ['w',"`"]] );
        T1_list.push( [[T0[0],T0[1]], ['s',"`"]] );
      }

      if ( (T0[2] == '.') ||
           (T0[2] == 'X') ) {
        T1_list.push( [[T0[0],T0[1]], ['d',"`"]] );
        T1_list.push( [[T0[0],T0[1]], [T0[2],"`"]] );
      }

    }
  }

  return T1_list;

  //------------
  //------------
  //------------
  //------------
  //------------
  //------------
  //------------
  //------------

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

  // 'nop' transition.
  // For a static segment of the scene, without a player,
  // provide a transition to itself.
  // We exclude static transitions if a player is present
  // as we're assuming a player must be able to move from
  // one state to another.
  //
  if ((type_count[PLAY] == 0) && (type_count[GPLY] == 0)) {
    let _t = [
      [ tile[0][0], tile[0][1], tile[0][2] ],
      [ tile[1][0], tile[1][1], tile[1][2] ],
      [ tile[2][0], tile[2][1], tile[2][2] ]
    ];
    T.push( {"tile": _t });
  }

  // we classify moves into groups
  //
  // (CB) player center to boundary (move to outer, or push block out)
  // (BC) player outer to center
  // (BO) player outer to fall of oedge
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

  // wall is invalid destination transition, so don't include
  //
  let tile_transition_ctb = {};

  // source from move
  //
  tile_transition_ctb[PLAY] = MOVE;
  tile_transition_ctb[GPLY] = GOAL;

  // player moving into
  //
  tile_transition_ctb[CRAT] = PLAY;
  tile_transition_ctb[GCRT] = GPLY;

  tile_transition_ctb[MOVE] = PLAY;
  tile_transition_ctb[GOAL] = GPLY;

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

    // can't move into walls
    //
    if (end_val == WALL) { continue; }

    let nei_tile = cpy_tile( tile );
    nei_tile[sy][sx] = tile_transition_ctb[src_val];
    nei_tile[ey][ex] = tile_transition_ctb[end_val];

    T.push( {"tile": nei_tile} );
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

    let nei_tile = cpy_tile( tile );
    if      (src_val == PLAY) { nei_tile[sy][sx] = MOVE; }
    else if (src_val == GPLY) { nei_tile[sy][sx] = GOAL; }

    T.push( {"tile": nei_tile} );
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

      let src_val = tile[sy][sx];

      if ((src_val != CRAT) &&
          (src_val != GCRT)) {
        continue;
      }

      let nei_tile = cpy_tile( tile );
      if      (src_val == CRAT) { nei_tile[sy][sx] = PLAY; }
      else if (src_val == GCRT) { nei_tile[sy][sx] = GPLY; }
      T.push( {"tile": nei_tile} );

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

    if (mid_tile == WALL) { continue; }
    if ( ((mid_tile == CRAT) || (mid_tile == GCRT)) &&
         ((end_tile == CRAT) || (end_tile == GCRT) || (end_tile == WALL)) ) {
      continue;
    }

    let nei_tile = cpy_tile( tile );

    if      (src_tile == PLAY) { nei_tile[sy][sx] = MOVE; }
    else if (src_tile == GPLY) { nei_tile[sy][sx] = GOAL; }

    if      (mid_tile == MOVE) {
      nei_tile[my][mx] = PLAY;
    }
    else if (mid_tile == CRAT) {
      nei_tile[my][mx] = PLAY;
      if      (end_tile == MOVE) { nei_tile[ey][ex] = CRAT; }
      else if (end_tile == GOAL) { nei_tile[ey][ex] = GCRT; }
    }
    else if (mid_tile == GCRT) {
      nei_tile[my][mx] = GPLY;
      if      (end_tile == MOVE) { nei_tile[ey][ex] = CRAT; }
      else if (end_tile == GOAL) { nei_tile[ey][ex] = GCRT; }
    }

    T.push( {"tile": nei_tile} );
  }


  //---
  // (OB) from out of tile inwards
  //---
  //
  // This is the condition a player enters the supertile,
  // so only consider supertiles without a player already present.
  //
  // If no player is present, we can't move into a wall nor can
  // we move into the supertile if there are two non-empty
  // spaces in line with direction of movement.
  //
  if ((type_count[PLAY] == 0) &&
      (type_count[GPLY] == 0) &&
      (type_count[EMPTY] == 0)) {
    for (let i=0; i<boundary_inwards_xy.length; i++) {
      mx = boundary_inwards_xy[i][0].x;
      my = boundary_inwards_xy[i][0].y;

      ex = boundary_inwards_xy[i][1].x;
      ey = boundary_inwards_xy[i][1].y;

      let mid_tile = tile[my][mx];
      let end_tile = tile[ey][ex];

      if (mid_tile == WALL) { continue; }
      if ( ((mid_tile == CRAT) || (mid_tile == GCRT)) &&
           ((end_tile == CRAT) || (end_tile == GCRT) || (end_tile == WALL)) ) {
        continue;
      }

      // player moves in
      //
      let nei_tile = cpy_tile( tile );
      if      (mid_tile == MOVE) { nei_tile[my][mx] = PLAY; }
      else if (mid_tile == GOAL) { nei_tile[my][mx] = GPLY; }
      else if (mid_tile == CRAT) {
        nei_tile[my][mx] = PLAY;
        if      (end_tile == MOVE) { nei_tile[ey][ex] = CRAT; }
        else if (end_tile == GOAL) { nei_tile[ey][ex] = GCRT; }
      }
      else if (mid_tile == GCRT) {
        nei_tile[my][mx] = GPLY;
        if      (end_tile == MOVE) { nei_tile[ey][ex] = CRAT; }
        else if (end_tile == GOAL) { nei_tile[ey][ex] = GCRT; }
      }
      T.push({"tile": nei_tile });

      // block gets pushed in
      //
      if ((mid_tile != CRAT) &&
          (mid_tile != GCRT)) {
        nei_tile = cpy_tile( tile );
        if      (mid_tile == MOVE) { nei_tile[my][mx] = CRAT; }
        else if (mid_tile == GOAL) { nei_tile[my][mx] = GCRT; }
        T.push({"tile": nei_tile });
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
      console.log("  ===>", "{"  + T[i].key + "}");
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

// generalize to larger "tiles"
// make sure all pairwise base tiles are valid
//
// - only 1 player
// - player and crates can't be in a state that mvoes
//   away from a wall that they're next to
//
function tile_valid(tile) {

  let player_count = 0;
  for (let y=0; y<tile.length; y++) {
    for (let x=0; x<tile[y].length; x++) {
      if (is_player_code(tile[y][x])) { player_count++; }
    }
  }
  if (player_count > 1) { return 0; }

  for (let sy=0; sy<tile.length; sy++) {
    for (let sx=0; sx<tile[sy].length; sx++) {

      if ((sy+1) < tile.length) {
        if (  is_wall_code(tile[sy+1][sx]) &&
             ((tile[sy][sx] == PLAY_UP) ||
              (tile[sy][sx] == PLAY_UP_GOAL) ||

              (tile[sy][sx] == CRATE_UP) ||
              (tile[sy][sx] == CRATE_UP_GOAL)) ) {
          return 0;
        }
      }

      if ((sx+1) < tile[sy].length) {
        if (   is_wall_code(tile[sy][sx+1]) &&
             ((tile[sy][sx] == PLAY_LEFT) ||
              (tile[sy][sx] == PLAY_LEFT_GOAL) ||

              (tile[sy][sx] == CRATE_LEFT) ||
              (tile[sy][sx] == CRATE_LEFT_GOAL)) ) {
          return 0;
        }

        if ((sy+1) < tile.length) {
          if ( is_wall_code(tile[sy][sx]) &&
              ((tile[sy][sx+1] == PLAY_RIGHT) ||
               (tile[sy][sx+1] == PLAY_RIGHT_GOAL) ||
               (tile[sy][sx+1] == CRATE_RIGHT) ||
               (tile[sy][sx+1] == CRATE_RIGHT_GOAL) ||

               (tile[sy+1][sx] == PLAY_DOWN) ||
               (tile[sy+1][sx] == PLAY_DOWN_GOAL) ||
               (tile[sy+1][sx] == CRATE_DOWN) ||
               (tile[sy+1][sx] == CRATE_DOWN_GOAL)) ) {
            return 0;
          }
        }

      }

    }
  }

  return 1;
}

// return 0 if blocks can still be moved within super tile
// return 1 if the blcoks are trapped in the superblock
//
function is_trap(tile) {

  if ( is_wall_code(tile[0][1]) &&
       is_wall_code(tile[1][0]) &&
       is_crate_code(tile[0][0]) &&
       (!is_goal_code(tile[0][0])) ) {
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
  let goal_count = 0;
  for (let y=0; y<tile.length; y++) {
    for (let x=0; x<tile[y].length; x++) {
      if ( is_goal_code(tile[y][x]) ) {
        if (!is_crate_code([y][x]) ) { return 0; }
        goal_count++;
      }
    }

  }
  if (goal_count>0) { return 1; }

  return 0;
}

// returns 1 if all boxes are on pressure plates
// within super block
//
// returns 0 if there's pressure plate without a box
// or if there are no pressure plates in the super block
//
function is_transitional(tile) {


  if (   is_goal_code(tile[0][0]) &&
       (!is_crate_code(tile[0][0])) ) {
    return 1;
  }

  if (   is_crate_code(tile[0][0]) &&
       (!is_goal_code(tile[0][0])) ) {
    return 1;
  }

  if (   is_goal_code(tile[0][1]) &&
       (!is_crate_code(tile[0][1])) ) {
    return 1;
  }
  if (   is_crate_code(tile[0][1]) &&
       (!is_goal_code(tile[0][1])) ) {
    return 1;
  }


  if (   is_goal_code(tile[1][0]) &&
       (!is_crate_code(tile[1][0])) ) {
    return 1;
  }
  if (   is_crate_code(tile[1][0]) &&
       (!is_goal_code(tile[1][0])) ) {
    return 1;
  }


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
  return tile[0][0] + tile[0][1] + tile[1][0];
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
// since there are crate and player transitions, we have to make
// sure we don't do invalid transitions.
//
function construct_tile_lib() {
  let tile_count = 0;

  let etile = EMPTY + EMPTY +
              EMPTY;

  let tile_lib = {}
  tile_lib[etile] = {
    "id": 0,
    "key": etile,
    "tile": [[EMPTY,EMPTY], [EMPTY,EMPTY]],
    "start": 0,
    "transitional": 0,
    "goal":0,
    "trap":0
  }

  let code_vec = [
    0, 0,
    0
  ];

  let ipos = [
    [0,0], [1,0],
    [0,1]
  ];

  do {
    let tile = [
      [ "!", "!" ],
      [ "!", "'" ]
    ];

    for (let i=0; i<ipos.length; i++) {
      tile[ ipos[i][1] ][ ipos[i][0] ] = SOKOITA_CODE[ code_vec[i] ];
    }
    vincr(code_vec, SOKOITA_CODE.length);

    if (!tile_valid(tile)) {

      if (DEBUG_LEVEL > 1) {
        console.log("#skipping:");
        console.log("#", tile[0].join(""));
        console.log("#", tile[1].join(""));
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
      "key": key,
      "tile": tile
    };

    if (DEBUG_LEVEL > 1) {
      console.log( tile_keystr(tile) );
      console.log("trap:", is_trap(tile), "goal:", is_goal(tile), "transitional:", is_transitional(tile));
      console.log("/---\\");
      console.log( "|" + tile[0].join("") + "|\n|" + tile[1].join("") + "|");
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
  ft_info.tilecount = 8;
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

  //DEBUG
  //DEBUG
  //DEBUG
  return;


  for (let src_key in tile_lib) {

    let src_tile = tile_lib[src_key];

    //let dst_z_tiles = construct_z_transition(tile_lib[src_key].tile);
    /*
    for (let i=0; i<dst_z_tiles.length; i++) {
      let dst_key = dst_z_tiles[i].key;

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

      if (DEBUG_LEVEL > 1) {
        console.log("---");
        console.log( src_key, "(", tile_lib[src_key].id, ")", "-{+-z}->", dst_key, "(", tile_lib[dst_key].id, ")" );
        console.log( tile_lib[src_key].tile[0].join(""), "", tile_lib[dst_key].tile[0].join("") );
        console.log( tile_lib[src_key].tile[1].join(""), "", tile_lib[dst_key].tile[1].join("") );
        console.log( tile_lib[src_key].tile[2].join(""), "", tile_lib[dst_key].tile[2].join("") );
        console.log("");
      }

    }
    */

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
        console.log("");
      }
    }

  }

  console.log(">>>", tile_rule.length);

  //DEBUG
  //DEBUG
  //DEBUG
  return;


  if (DEBUG_LEVEL > 0) {
    console.log(JSON.stringify(tile_lib, undefined, 2));
  }

  let poms_cfg = libpoms.configTemplate();
  poms_cfg["comment"] = [
    "_ - boundary condition (out of bounds simple tile)",
    "#",
    " ",
    ". - unadorned goal",
    "l, j, i, k - crate moves (ijkl)",
    "L, J, I, K - crate vmoes on goal (IKJL)",
    "d, a, w, s - player moves (wasd)",
    "D, A, W, S - player moves on goal (WASD)",
    ": - no return path (on space)",
    "; - no return path (on goal)",
    "x - path explode (space)",
    "X - path explode (goal)",

    "",

    "group 0 - default",
    "group 1 - transitional state (at least one non-stored block or unoccupied storage exists)",
    "group 2 - end condition (at least one storage exists and all storage occupied)",
    "group 3 - trap or deadlock state"
  ];

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
    poms_cfg.tileGroup.push(tile_group);
  }

  poms_cfg.constraint.push({ "type":"remove", "range": {"tile":[0,1], "x":[], "y":[], "z":[] } });

  for (let tile_id=0; tile_id < poms_cfg.tileGroup.length; tile_id++) {

    // remove deadlock states
    //
    if (poms_cfg.tileGroup[tile_id] == 3) {
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
    await create_tileset(opt, poms_cfg);

    if ("level" in opt) {
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
        await write_tiled_json(tiled_info, opt.tiled_fn);
      }

      if ("flat_tiled_fn" in opt) {

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

      poms_setup_initial_restriction(poms_cfg, level_info);
    }

  }

  if ("poms_fn" in opt) {
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

