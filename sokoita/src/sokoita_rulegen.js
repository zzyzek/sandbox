// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//     
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var fs = require("fs");
var getopt = require("posix-getopt");
var libpoms = require("./libpoms.js");
var jimp = require("jimp").Jimp;

var DEBUG_LEVEL = 0;

var SOKOITA_RULEGEN_VERSION = "0.1.0";

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

let CODE = [ 
  WALL, MOVE,
  GOAL,
  CRAT, GCRT,
  PLAY, GPLY
];

function construct_xy_neighbors(src_tile, tile_lib) {
  let T = [];

  let etile = EMPTY + EMPTY + EMPTY + EMPTY;

  let boundary_idir = [
    { "x": [1,1], "y": [0,1] },
    { "x": [0,0], "y": [0,1] },
    { "x": [0,1], "y": [0,0] },
    { "x": [0,1], "y": [1,1] },
  ];

  let oppo = [1,0, 3,2];

  for (let idir=0; idir<4; idir++) {
    let _x = boundary_idir[idir].x;
    let _y = boundary_idir[idir].y;

    if ((src_tile[_y[0]][_x[0]] == WALL) &&
        (src_tile[_y[1]][_x[1]] == WALL)) {
      T.push({ "key":etile, "idir": idir, "tile":[[EMPTY,EMPTY],[EMPTY,EMPTY]]});
    }
  }

  for (let key in tile_lib) {

    // .id, .goal, /trap, .tile, .key
    //
    let tst_info = tile_lib[key];
    let tst_tile = tst_info.tile;

    for (let idir=0; idir<4; idir++) {
      let ax = boundary_idir[idir].x;
      let ay = boundary_idir[idir].y;

      let bx = boundary_idir[oppo[idir]].x;
      let by = boundary_idir[oppo[idir]].y;

      if ( (src_tile[ay[0]][ax[0]] == tst_tile[by[0]][bx[0]]) &&
           (src_tile[ay[1]][ax[1]] == tst_tile[by[1]][bx[1]]) ) {
        T.push({
          "key": tst_info.key,
          "idir": idir,
          "tile":[[tst_tile[0][0], tst_tile[0][1]], [tst_tile[1][0], tst_tile[1][1]]]
        });
      }
    }

  }

  return T;
}

function construct_z_transition(tile) {

  let T = [];

  let dxy = [
    {"x":0, "y":0},
    {"x":1, "y":0},
    {"x":0, "y":1},
    {"x":1, "y":1}
  ];

  let type_count = {};
  for (let i=0; i<CODE.length; i++) {
    type_count[CODE[i]] = 0;
  }

  for (let i=0; i<dxy.length; i++) {
    let v = tile[dxy[i].y][dxy[i].x];
    type_count[v]++;
  }

  // nop transition.
  // player must move, so exlcude if agent present.
  //
  if ((type_count[PLAY] == 0) && (type_count[GPLY] == 0)) {
    let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
    T.push( {"tile": _t });
  }

  let sd = [
    [ {"x":0, "y":0 }, {"x":1, "y":0} ],
    [ {"x":0, "y":0 }, {"x":0, "y":1} ],

    [ {"x":1, "y":0 }, {"x":0, "y":0} ],
    [ {"x":1, "y":0 }, {"x":1, "y":1} ],

    [ {"x":0, "y":1 }, {"x":0, "y":0} ],
    [ {"x":0, "y":1 }, {"x":1, "y":1} ],

    [ {"x":1, "y":1 }, {"x":1, "y":0} ],
    [ {"x":1, "y":1 }, {"x":0, "y":1} ]
  ];

  for (let i=0; i<sd.length; i++) {
    let sx = sd[i][0].x;
    let sy = sd[i][0].y;

    let ex = sd[i][1].x;
    let ey = sd[i][1].y;

    let sv = tile[sy][sx];
    let ev = tile[ey][ex];

    // player move
    //
    if ((sv == PLAY) && (ev == MOVE)) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = MOVE;
      _t[ey][ex] = PLAY;
      T.push( {"tile": _t });
    }

    if ((sv == PLAY) && (ev == GOAL)) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = MOVE;
      _t[ey][ex] = GPLY;
      T.push( {"tile": _t });
    }

    if ((sv == GPLY) && (ev == MOVE)) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = GOAL;
      _t[ey][ex] = PLAY;
      T.push( {"tile": _t });
    }

    if ((sv == GPLY) && (ev == GOAL)) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = GOAL;
      _t[ey][ex] = GPLY;
      T.push( {"tile": _t });
    }

    // block push out
    //
    if ((sv == PLAY) && (ev == CRAT)) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = MOVE;
      _t[ey][ex] = PLAY;
      T.push( {"tile": _t });
    }

    if ((sv == GPLY) && (ev == CRAT)) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = GOAL;
      _t[ey][ex] = PLAY;
      T.push( {"tile": _t });
    }

    if ((sv == PLAY) && (ev == GCRT)) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = MOVE;
      _t[ey][ex] = GPLY;
      T.push( {"tile": _t });
    }

    if ((sv == GPLY) && (ev == GCRT)) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = GOAL;
      _t[ey][ex] = GPLY;
      T.push( {"tile": _t });
    }

    if ((type_count[PLAY] == 0) && (type_count[GPLY] == 0)) {

      if ((sv == CRAT) && (ev == MOVE)) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[sy][sx] = PLAY;
        _t[ey][ex] = CRAT;
        T.push( {"tile": _t });
      }

      if ((sv == GCRT) && (ev == MOVE)) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[sy][sx] = GPLY;
        _t[ey][ex] = CRAT;
        T.push( {"tile": _t });
      }

      if ((sv == CRAT) && (ev == GOAL)) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[sy][sx] = PLAY;
        _t[ey][ex] = GCRT;
        T.push( {"tile": _t });
      }

      if ((sv == GCRT) && (ev == GOAL)) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[sy][sx] = GPLY;
        _t[ey][ex] = GCRT;
        T.push( {"tile": _t });
      }

    }


  }


  for (let i=0; i<dxy.length; i++) {
    let x = dxy[i].x;
    let y = dxy[i].y;

    let v = tile[y][x];

    if ((type_count[PLAY] == 0) && (type_count[GPLY] == 0)) {

      // block pushed in
      //
      if (tile[y][x] == MOVE) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[y][x] = CRAT;
        T.push( {"tile": _t });
      }

      // block pushed in on platform
      //
      if (tile[y][x] == GOAL) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[y][x] = GCRT;
        T.push( {"tile": _t });
      }

    }

    // player comes in
    //
    if ((type_count[PLAY] == 0) && (type_count[GPLY] == 0)) {
      if (tile[y][x] == MOVE) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[y][x] = PLAY;
        T.push( {"tile": _t });
      }

      if (tile[y][x] == GOAL) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[y][x] = GPLY;
        T.push( {"tile": _t });
      }
    }

    // player moves out
    //
    if (v == PLAY) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[y][x] = MOVE;
      T.push( {"tile": _t });
    }

    if (v == GPLY) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[y][x] = GOAL;
      T.push( {"tile": _t });
    }

  }

  for (let i=0; i<T.length; i++) {
    T[i]["key"] = T[i].tile[0].join("") + T[i].tile[1].join("");
  }

  //DEBUG
  //DEBUG
  if (DEBUG_LEVEL > 0) {
    console.log("-----");
    console.log(tile[0].join(""));
    console.log(tile[1].join(""));
    for (let i=0; i<T.length; i++) {
      console.log("  ===>", T[i].key);
      console.log( "  ", T[i].tile[0].join(""));
      console.log( "  ", T[i].tile[1].join(""));
      console.log("");
    }
  }
  //DEBUG
  //DEBUG

  return T;
}

function tile_valid(tile) {
  let player_count = 0;
  for (let y=0; y<2; y++) {
    for (let x=0; x<2; x++) {
      if ((tile[y][x] == PLAY) || (tile[y][x] == GPLY)) { player_count++; }
    }
  }
  if (player_count > 1) { return 0; }

  //---

  if ((tile[0][0] == EMPTY) &&
      ((tile[0][1] != EMPTY) && (tile[0][1] != WALL)) ) {
    return 0;
  }

  if ((tile[0][0] == EMPTY) &&
      ((tile[1][0] != EMPTY) && (tile[1][0] != WALL)) ) {
    return 0;
  }


  if ((tile[1][0] == EMPTY) &&
      ((tile[1][1] != EMPTY) && (tile[1][1] != WALL)) ) {
    return 0;
  }

  if ((tile[1][0] == EMPTY) &&
      ((tile[0][0] != EMPTY) && (tile[0][0] != WALL)) ) {
    return 0;
  }


  if ((tile[0][1] == EMPTY) &&
      ((tile[1][1] != EMPTY) && (tile[1][1] != WALL)) ) {
    return 0;
  }

  if ((tile[0][1] == EMPTY) &&
      ((tile[0][0] != EMPTY) && (tile[0][0] != WALL)) ) {
    return 0;
  }


  if ((tile[1][1] == EMPTY) &&
      ((tile[1][0] != EMPTY) && (tile[1][0] != WALL)) ) {
    return 0;
  }

  if ((tile[1][1] == EMPTY) &&
      ((tile[0][1] != EMPTY) && (tile[0][1] != WALL)) ) {
    return 0;
  }

  return 1;
}

// return 0 if blocks can still be moved within super tile
// return 1 if the blcoks are trapped in the superblock
//
function is_trap(tile) {

  if ( (tile[0][0] == WALL) && (tile[1][1] == WALL) &&
      ((tile[0][1] == CRAT) || (tile[1][0] == CRAT))) {
    return 1;
  }

  if ( (tile[0][1] == WALL) && (tile[1][0] == WALL) &&
      ((tile[0][0] == CRAT) || (tile[1][1] == CRAT))) {
    return 1;
  }


  if ( (tile[0][0] == WALL) && (tile[0][1] == WALL) &&
       (tile[1][0] == CRAT) && (tile[1][1] == CRAT)) {
    return 1;
  }

  if ( (tile[1][0] == WALL) && (tile[1][1] == WALL) &&
       (tile[0][0] == CRAT) && (tile[0][1] == CRAT)) {
    return 1;
  }

  if ( (tile[0][0] == WALL) && (tile[1][0] == WALL) &&
       (tile[0][1] == CRAT) && (tile[1][1] == CRAT)) {
    return 1;
  }

  if ( (tile[0][1] == WALL) && (tile[1][1] == WALL) &&
       (tile[0][0] == CRAT) && (tile[1][0] == CRAT)) {
    return 1;
  }

  if ( (tile[0][1] == CRAT) && (tile[1][1] == CRAT) &&
       (tile[0][0] == CRAT) && (tile[1][0] == CRAT)) {
    return 1;
  }

  let tot = 0,
      b_count = 0;
  for (let y=0; y<2; y++) {
    for (let x=0; x<2; x++) {
      if ((tile[y][x] == WALL) ||
          (tile[y][x] == CRAT) ||
          (tile[y][x] == GCRT)) {
        tot++;
      }
      if (tile[y][x] == CRAT) { b_count++; }
    }
  }
  if ((b_count>0) && (tot==4)) { return 1; }

  return 0;
}

// returns 1 if all boxes are on pressure plates
// within super block
//
// returns 0 if there's pressure plate without a box
// or if there are no pressure plates in the super block
//
function is_goal(tile) {
  let tot = 0,
      g_count = 0;
  for (let y=0; y<2; y++) {
    for (let x=0; x<2; x++) {
      if ((tile[y][x] != CRAT) &&
          (tile[y][x] != GPLY) &&
          (tile[y][x] != GOAL)) { tot++; }
      if (tile[y][x] == GCRT) { g_count++; }
    }
  }
  if ((g_count>0) && (tot==4)) { return 1; }

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
      s_count = 0;
      b_count = 0;
  for (let y=0; y<2; y++) {
    for (let x=0; x<2; x++) {
      if (tile[y][x] == CRAT) { b_count++; }
      if (tile[y][x] == GOAL) { s_count++; }
    }
  }
  if ((b_count > 0) || (s_count > 0)) { return 1; }
  return 0;
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

  let etile = EMPTY + EMPTY + EMPTY + EMPTY;

  let tile_lib = {}
  tile_lib[etile] = { "id": 0, "key": etile, "tile": [[EMPTY,EMPTY], [EMPTY,EMPTY]], "goal":0, "trap":0 }

  for (let idx00=0; idx00<CODE.length; idx00++) {
    for (let idx01=0; idx01<CODE.length; idx01++) {
      for (let idx10=0; idx10<CODE.length; idx10++) {
        for (let idx11=0; idx11<CODE.length; idx11++) {

          // z y x
          //
          let tile = [ [ '0', '0' ], [ '0', '0' ] ];

          tile[0][0] = CODE[idx00];
          tile[0][1] = CODE[idx01];
          tile[1][0] = CODE[idx10];
          tile[1][1] = CODE[idx11];

          if (!tile_valid(tile)) {

            if (DEBUG_LEVEL > 0) {
              console.log("#skipping:");
              console.log("#", tile[0].join(""));
              console.log("#", tile[1].join(""));
            }
            continue;
          }

          tile_count++;

          let key = tile[0].join("") + tile[1].join("");

          if (key in tile_lib) { console.log("BANG"); }

          tile_lib[key] = {
            "id": tile_count,
            "goal": is_goal(tile),
            "transitional": is_transitional(tile),
            "trap": is_trap(tile),
            "key": key,
            "tile": tile
          };

          if (DEBUG_LEVEL > 0) {
            console.log( tile[0].join("") + tile[1].join("") );
            console.log("trap:", is_trap(tile), "goal:", is_goal(tile), "transitional:", is_transitional(tile));
            console.log("/--\\");
            console.log( "|" + tile[0].join("") + "|\n|" + tile[1].join("") + "|" );
            console.log("\\--/");
            console.log("--");
          }
        }
      }
    }
  }

  if (DEBUG_LEVEL > 0) {
    console.log("tile_count:", tile_count);
  }

  return tile_lib;

}

function tile_str(t) {
  return t[0].join("") + t[1].join("");
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

  for (let tile_id=1; tile_id < poms_cfg.name.length; tile_id++) {
    let tile_name = poms_cfg.name[tile_id];
    let idx = tile_id-1;

    let idx_y = Math.floor( idx / s );
    let idx_x = (idx % s);

    let sx = stride*idx_x;
    let sy = stride*idx_y;

    let flat_idx = flatTileMap[ tile_name[0] ]-1;

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

  for (let y=0; y<level_h; y++) {
    for (let x=0; x<level_w; x++) {
      let supertile = [ ['#', '#'], ['#', '#'] ];

      for (let dy=0; dy<2; dy++) {
        for (let dx=0; dx<2; dx++) {
          if (((y+dy) < level_h) &&
              ((x+dx) < level_w)) {
            supertile[dy][dx] = level[y+dy][x+dx];
          }
        }
      }

      let tile_name = supertile[0].join("") + supertile[1].join("");

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

  if (DEBUG_LEVEL > 0) {
    console.log("#opt:",opt);
  }

  let oppo = [1,0, 3,2, 5,4];
  let tile_rule = [];


  let tile_lib = construct_tile_lib();

  for (let src_key in tile_lib) {
    let dst_z_tiles = construct_z_transition(tile_lib[src_key].tile);

    let src_tile = tile_lib[src_key];

    for (let i=0; i<dst_z_tiles.length; i++) {
      let dst_key = dst_z_tiles[i].key;

      if (!(dst_key in tile_lib)) {
        console.log("ERROR", src_key, dst_key);
      }

      let dst_tile = tile_lib[dst_key];

      tile_rule.push( [src_tile.id, dst_tile.id, 4, 1] );
      tile_rule.push( [dst_tile.id, src_tile.id, 5, 1] );

      if (DEBUG_LEVEL > 0) {
        console.log("---");
        console.log( src_key, "(", tile_lib[src_key].id, ")", "->", dst_key, "(", tile_lib[dst_key].id, ")" );
        console.log( tile_lib[src_key].tile[0].join(""), "", tile_lib[dst_key].tile[0].join("") );
        console.log( tile_lib[src_key].tile[1].join(""), "", tile_lib[dst_key].tile[1].join("") );
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

      if (DEBUG_LEVEL > 0) {
        console.log("---");
        console.log( src_key, "(", tile_lib[src_key].id, ")", "-(", dst_info.idir, ")->", dst_key, "(", tile_lib[dst_key].id, ")" );
        console.log( tile_lib[src_key].tile[0].join(""), "", tile_lib[dst_key].tile[0].join("") );
        console.log( tile_lib[src_key].tile[1].join(""), "", tile_lib[dst_key].tile[1].join("") );
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
    "",
    "group 0 - default",
    "group 1 - transitional state (at least one non-stored block or unoccupied storage exists)",
    "group 2 - end condition (at least one storage exists and all storage occupied)",
    "group 3 - trap or deadlock state"
  ];

  poms_cfg.rule = tile_rule;

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

  let n_tile = 0;
  let max_id = -1;
  let id_tile_map = {};
  for (let key in tile_lib) {
    id_tile_map[ tile_lib[key].id ] = tile_lib[key];
    n_tile++;

    if (tile_lib[key].id > max_id) {
      max_id = tile_lib[key].id;
    }
  }

  if ((max_id+1) != n_tile) { console.log("ERROR n_tile != max_id:", n_tile, max_id); }

  for (let tile_id=0; tile_id<n_tile; tile_id++) {

    let tile_info = id_tile_map[tile_id];

    poms_cfg.weight.push(1);
    poms_cfg.name.push( tile_info.key )

    poms_cfg.flatMap.push( flatTileMap[ tile_info.key[0] ] );

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
  "z", ":(z)"
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

