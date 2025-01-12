// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// tile 0 is the special boundary tile
// tile 1 is the no mines and no neighbor mines
//
// _ : border token
// . : space (no mine)
// * : mine
//
// Names are the concaneation of the tile.
// For example:
//
//  tile 197: ..*...**
//  ..*
//  ...
//  **.
//
// tile group is as follows:
//
// -1     : boundary tile
//  0-8   : tile with no center mine, with G neighbor mines
//  9-18  : tile with center mine, with G-8 total mines (G-9 neighbor mines)
//
// for example (numbers below are groups, not tile ids):
//
// 0:    1:     13:   5:
// ___   ...    .*.   **.
// ___   ...    ***   *..
// ___   ...    ...   **.
//
// Neighbors are calculated by an overlapping 2x3 window, suitably rotated.
//
// Total 512 tiles, 18950 rules
//

var DEBUG_LEVEL = 0;

var fs = require("fs");
var libpoms = require("./libpoms.js");
var jimp = require("jimp").Jimp;

var MM_FLAT_TILESET_FN = "./mm_flatTileset.png";
var MM_FLAT_TILESET_W = 80;
var MM_FLAT_TILESET_H = 80;
var MM_FLAT_TILESET_STRIDE = 16;
var MM_FLAT_TILESET_TILECOUNT = 18;;

var MM_TILESET_FN = "./mm_tileset.png";

//---
//---
function print_tile(tile) {
  for (let i=0; i<tile.length; i++) {
    console.log(tile[i].join(""));
  }
}

function print_tile_list(tile_list) {

  for (let tile_id=0; tile_id < tile_list.length; tile_id++) {
    console.log("[", tile_id, "]:", tile_list[tile_id].name, "(g:", tile_list[tile_id].group, ", fm:", tile_list[tile_id].flatMap, ")");
    print_tile(tile_list[tile_id].tile);

  }
}

function print_tile_rule(tile_rule, tile_list) {

  for (let rule_idx = 0; rule_idx < tile_rule.length; rule_idx++) {
    console.log(";", tile_rule[rule_idx]);
    let src_tile_id = tile_rule[rule_idx][0];
    let dst_tile_id = tile_rule[rule_idx][1];

    let idir = tile_rule[rule_idx][2];

    //console.log( tile_list[src_tile_id].tile[0].join("") + "        " + tile_list[dst_tile_id].tile[0].join("") );
    //console.log( tile_list[src_tile_id].tile[1].join("") + " -(" + idir.toString() + ")-> " + tile_list[dst_tile_id].tile[1].join("") );
    //console.log( tile_list[src_tile_id].tile[2].join("") + "        " + tile_list[dst_tile_id].tile[2].join("") );

    // reverse y
    //
    console.log( tile_list[src_tile_id].tile[2].join("") + "        " + tile_list[dst_tile_id].tile[2].join("") );
    console.log( tile_list[src_tile_id].tile[1].join("") + " -(" + idir.toString() + ")-> " + tile_list[dst_tile_id].tile[1].join("") );
    console.log( tile_list[src_tile_id].tile[0].join("") + "        " + tile_list[dst_tile_id].tile[0].join("") );

    console.log("");
  }
}
//---
//---

function create_tiles() {

  let m = 3;
  let M = 9;
  let N = Math.floor(Math.pow(2,M));

  let tile_list = [
    {"name": "_________", "id": 0, "tile": [ ['_', '_', '_'], ['_', '_', '_'], ['_', '_', '_' ] ], "group": -1, "flatMap": 2 }
  ];

  for (let tile_idx=1; tile_idx <= N; tile_idx++) {

    let tile = [
      [ ' ', ' ', ' ' ],
      [ ' ', ' ', ' ' ],
      [ ' ', ' ', ' ' ]
    ];
    let s = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ];

    let v = tile_idx-1;

    let popcount = 0;
    for (let i=0; i<M; i++) {
      s[i] = ((v & (1<<i)) ? '*' : '.');
      let y = Math.floor(i/m);
      let x = (i%m);
      tile[y][x] = s[i];

      if (s[i] == '*') { popcount++; }
    }

    let g = popcount;
    if (tile[1][1] == '*') { g += M; }

    let fm = ((tile[1][1] == '*') ? 1 : 0);

    tile_list.push( {"name": s.join(""), "id": tile_idx, "tile": tile, "group": g, "flatMap": fm } );
  }

  return tile_list;
}

function create_tile_key_idir(tile, idir) {

  if (idir == 0) {
    return tile[0][1] + tile[0][2] + ";" +
           tile[1][1] + tile[1][2] + ";" +
           tile[2][1] + tile[2][2] ;
  }
  else if (idir == 1) {
    return tile[0][0] + tile[0][1] + ";" +
           tile[1][0] + tile[1][1] + ";" +
           tile[2][0] + tile[2][1] ;
  }

  // reverse y
  //
  else if (idir == 2) {
    return tile[1][0] + tile[1][1] + tile[1][2] + ";" +
           tile[2][0] + tile[2][1] + tile[2][2] ;
  }
  else if (idir == 3) {
    return tile[0][0] + tile[0][1] + tile[0][2] + ";" +
           tile[1][0] + tile[1][1] + tile[1][2] ;
  }

  return "";
}

function create_rule(tile_list) {
  let oppo = [1,0, 3,2, 5,4];

  let rule = [];
  for (let src_tile_id = 1; src_tile_id < tile_list.length; src_tile_id++) {
    for (let dst_tile_id = 1; dst_tile_id < tile_list.length; dst_tile_id++) {

      for (let idir = 0; idir < 4; idir++) {

        let rdir = oppo[idir];

        let src_key = create_tile_key_idir( tile_list[src_tile_id].tile, idir );
        let dst_key = create_tile_key_idir( tile_list[dst_tile_id].tile, rdir );

        if (src_key == dst_key) {
          rule.push( [ src_tile_id, dst_tile_id, idir, 1 ] );
        }

      }
      
    }
  }

  // border tile rules, match on a no tile edge
  //
  for (let idir = 0; idir < 6; idir++) {
    rule.push( [ 0, 0, idir, 1 ] );
  }

  for (let src_tile_id = 1; src_tile_id < tile_list.length; src_tile_id++) {

    // +-z
    //
    rule.push( [ 0, src_tile_id, 4, 1 ] );
    rule.push( [ 0, src_tile_id, 5, 1 ] );
    rule.push( [ src_tile_id, 0, 4, 1 ] );
    rule.push( [ src_tile_id, 0, 5, 1 ] );

    // right, left, up, down emptry row lets us
    // make it a boundary tile neighbor
    //
    let tile = tile_list[src_tile_id].tile;
    if ( (tile[0][2] == '.') &&
         (tile[1][2] == '.') &&
         (tile[2][2] == '.') ) {
      rule.push( [ src_tile_id, 0, 0, 1 ] );
      rule.push( [ 0, src_tile_id, 1, 1 ] );
    }

    if ( (tile[0][0] == '.') &&
         (tile[1][0] == '.') &&
         (tile[2][0] == '.') ) {
      rule.push( [ src_tile_id, 0, 1, 1 ] );
      rule.push( [ 0, src_tile_id, 0, 1 ] );
    }

    // reverse y
    //
    if ( (tile[0][0] == '.') &&
         (tile[0][1] == '.') &&
         (tile[0][2] == '.') ) {
      //rule.push( [ src_tile_id, 0, 2, 1 ] );
      //rule.push( [ 0, src_tile_id, 3, 1 ] );
      rule.push( [ src_tile_id, 0, 3, 1 ] );
      rule.push( [ 0, src_tile_id, 2, 1 ] );
    }

    if ( (tile[2][0] == '.') &&
         (tile[2][1] == '.') &&
         (tile[2][2] == '.') ) {
      //rule.push( [ src_tile_id, 0, 3, 1 ] );
      //rule.push( [ 0, src_tile_id, 2, 1 ] );
      rule.push( [ src_tile_id, 0, 2, 1 ] );
      rule.push( [ 0, src_tile_id, 3, 1 ] );
    }

  }

  return rule;
}

async function construct_tileset_img( poms, tileset_fn, flatTileset_fn ) {

  let N = poms.weight.length;
  let s = Math.floor(Math.sqrt(N));
  if ((s*s) < N) { s++; }

  let stride = 16;

  let flat_tileset_img = await jimp.read(flatTileset_fn);
  let tileset_img = new jimp({"width": stride*s, "height":stride*s});

  let flat_w = flat_tileset_img.width;
  let flat_h = flat_tileset_img.height;

  let flat_s_w = Math.floor(flat_w / stride);
  let flat_s_h = Math.floor(flat_h / stride);

  for (let tile_id = 1; tile_id < poms.name.length; tile_id++) {
    let idx = tile_id-1;

    let idx_y = Math.floor( idx / s );
    let idx_x = (idx % s);

    let sx = stride * idx_x;
    let sy = stride * idx_y;

    let flat_idx = poms.tileGroup[ tile_id ];

    let flat_idx_y = Math.floor( flat_idx / flat_s_w );
    let flat_idx_x = (flat_idx % flat_s_w);

    let flat_sx = flat_idx_x * stride;
    let flat_sy = flat_idx_y * stride;

    tileset_img.blit({"src":flat_tileset_img, "x":sx, "y":sy, "srcX":flat_sx, "srcY":flat_sy, "srcW":stride, "srcH":stride});
  }

  if (DEBUG_LEVEL > 0) {
    console.log("; writing tileset:", tileset_fn);
  }
  tileset_img.write( tileset_fn );

  poms.tileset.image = tileset_fn;
  poms.tileset.tilecount = poms.name.length;
  poms.tileset.imagewidth = stride*s,
  poms.tileset.imagewidth = stride*s,
  poms.tileset.tilewidth = stride;
  poms.tileset.tileheight = stride;


  return poms;
}

async function gen_poms(tile_list, tile_rule) {
  let poms_cfg = libpoms.configTemplate();
  poms_cfg["comment"] = [
    "group:",
    " -1      boundary tile",
    " 0-8     no center mine, number of neighbor mines",
    " 9-18    center mine, number of total mines + 9"
  ];

  poms_cfg["flatMap"] = [];
  poms_cfg["tileGroup"] = [];
  for (let tile_id = 0; tile_id < tile_list.length; tile_id++) {
    poms_cfg.flatMap.push( tile_list[tile_id].flatMap );
    poms_cfg.weight.push( 1.0 );
    poms_cfg.tileGroup.push( tile_list[tile_id].group );
    poms_cfg.name.push( tile_list[tile_id].name );
  }

  poms_cfg.constraint.push({ "type":"remove", "range": { "tile":[0,1], "x":[], "y":[], "z":[] } });

  poms_cfg["flatTileset"] = {
    "image": "",
    "tilecount": -1,
    "imagewidth": -1,
    "imageheight": -1,
    "tilewidth": -1,
    "tileheight": -1
  };

  await construct_tileset_img( poms_cfg, MM_TILESET_FN, MM_FLAT_TILESET_FN );

  poms_cfg.flatTileset.image = MM_FLAT_TILESET_FN;
  poms_cfg.flatTileset.tilecount = MM_FLAT_TILESET_TILECOUNT;
  poms_cfg.flatTileset.imagewidth = MM_FLAT_TILESET_W;
  poms_cfg.flatTileset.imageheight = MM_FLAT_TILESET_H;
  poms_cfg.flatTileset.tilewidth = MM_FLAT_TILESET_STRIDE;
  poms_cfg.flatTileset.tileheight = MM_FLAT_TILESET_STRIDE;

  poms_cfg.rule = tile_rule;

  poms_cfg.size = [30,16,1];

  if (DEBUG_LEVEL > 0) {
    console.log("; writing POMS config file: mm.pms");
  }
  fs.writeFileSync( "mm.poms", libpoms.configStringify(poms_cfg));

  return poms_cfg;
}

// https://q4.github.io/mines/index.html
//
function mine_mini_puzzles(poms) {
  let puzzle = [

    [ " 2   ",
      "  32 ",
      "3  2 ",
      " 2  1",
      "  12 " ],

    [ "1  1 ",
      "    1",
      "1 2 1",
      " 22 3",
      "     " ],

    [ " 1 2 ",
      " 3   ",
      " 2  4",
      "   3 ",
      " 1   " ],

    [ "1 12 ",
      "   2 ",
      "1 2  ",
      "  4 1",
      "2    " ]
  ];

  let constraint = [
    {"type":"remove","range":{"tile":[0,1],"x":[],"y":[],"z":[]}}
  ];

  let pz = puzzle[0];

  let pzg = [];
  for (let row = 0; row < pz.length; row++) {
    pzg.push([]);

    poms.size[0] = pz[row].length;
    poms.size[1] = pz.length;

    for (let col = 0; col < pz[row].length; col++) {
      let tok = pz[row][col];
      let v = ( (tok == ' ') ? 0 : parseInt(tok) );
      pzg[row].push(v);
    }
  }


  console.log(pzg);

  for (let row = 0; row < pzg.length; row++) {
    for (let col = 0; col < pzg[row].length; col++) {
      if (pzg[row][col] == 0) { continue; }

      constraint.push({"type":"remove", "range":{"tile":[], "x":[col,col+1], "y":[row,row+1], "z":[]}});

      for (let tile_id = 0; tile_id < poms.tileGroup.length; tile_id++) {
        if (poms.tileGroup[tile_id] == pzg[row][col]) {
          constraint.push({"type":"add", "range":{"tile":[tile_id,tile_id+1],  "x":[col,col+1], "y":[row,row+1], "z":[]}});
        }
      }
    }
  }

  poms.constraint = constraint;

  let fn = "mm_mini.0.poms";
  fs.writeFileSync( fn, libpoms.configStringify(poms));

}

async function main() {

  let tl = create_tiles();
  let rule = create_rule(tl);

  if (DEBUG_LEVEL > 0) {
    console.log("; rule:", rule.length);
  }

  if (DEBUG_LEVEL > 1) {
    print_tile_list(tl);
    print_tile_rule(rule, tl);
  }

  let poms = await gen_poms(tl, rule);

  mine_mini_puzzles(poms);
}

main();

