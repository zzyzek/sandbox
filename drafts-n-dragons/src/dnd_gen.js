// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// Super tiles are constructed from four base tiles, each with two numbers beside them.
// The first number is the column wall constraint and the secnod number is the row constraint.
// Walls decrement the constraint as soon as they appear, spaces keep the constraint constaint.
//
// Example:
//
//   w42 w61
//
//   s45 s65
//
// Or:
//
//   w      w
//     4      6
//     | 2----.--1
//     |      |
//   s |    s |
//     4      6
//       5-------5
//
// So w42 has a column constraint of 4, which gets passed down to s(4)5
//  and a row constraint of 2 which gets decremented when going to the right
//  to w61
// w61 has a column constraint of 6 which gets passed down to s65.
// s45 has a row constraint of 5 which gets passed to s65.
//
// There are 15 base permutations:
//
//  ww
//  ww
//
//  ws  sw  ww  ww
//  ww  ww  sw  ws
//
//  ww  ws  ss  sw
//  ss  ws  ww  sw
//
//  ws  sw
//  sw  ws
//
//  ws  ss  ss  sw
//  ss  ws  sw  ss
//
//  With ssss being taken out to force corridors.
//
//  As a rough estimate, there are 7 choices for each of the numbers, with
//  four independent choices representing the two column and row constraints.
//
//  So, an upper bounds on the number of tiles is:
//
//  15 * (7^4) = 36015
//
//  Because some values are restricted, namely w7 and something like s0....w.....,
//  the final tally comes to (I believve) 35107.
//  There's a special "0" tile that represents an out of bound tile
//

var DRAFTS_N_DRAGONS_TILEGEN_VERSION = "0.1.0"

var DEBUG_LEVEL = 0;

var fs = require("fs");
var libpoms = require("./libpoms.js");
var getopt = require("posix-getopt");
var jimp = require("jimp").Jimp;

var base_template = [
  [ [ 'w', 'w' ],
    [ 'w', 'w' ] ],

  [ [ 'w', 'w' ],
    [ 'w', 's' ] ],

  [ [ 'w', 'w' ],
    [ 's', 's' ] ],

  [ [ 'w', 's' ],
    [ 's', 'w' ] ],

  [ [ 'w', 's' ],
    [ 's', 's' ] ]

];

function rot90(T) {

  let _t = [ ['x', 'x'], ['x', 'x'] ];

  _t[0][0] = T[0][1];
  _t[0][1] = T[1][1];
  _t[1][0] = T[0][0];
  _t[1][1] = T[1][0];

  return _t;
}

function _cpy(T) {
  let _t = [ ['x', 'x'], ['x', 'x'] ];

  for (let y=0; y<2; y++) {
    for (let x=0; x<2; x++) {
      _t[y][x] = T[y][x];
    }
  }

  return _t;
}

function _print(p) {

  console.log("#:", p[0].join("") + p[1].join(""));
  console.log(" ", p[0].join(""));
  console.log(" ", p[1].join(""));
}

function _key(p) {
  return p[0].join("") + p[1].join("");
}

function gen_supertile(template) {

  dedup_base = {};

  for (let idx=0; idx<template.length; idx++) {

    let cur_pat = _cpy(template[idx]);

    for (let rot=0; rot<4; rot++) {
      let k = _key(cur_pat);
      if (!(k in dedup_base)) {
        dedup_base[k] = cur_pat;
      }

      cur_pat = rot90(cur_pat);
    }

  }

  let dedup_group = {};
  let dedup_group_idx = 1;
  dedup_group["####"] = 0;

  for (let key in dedup_base) {
    dedup_group[key] = dedup_group_idx;
    dedup_group_idx++;
  }

  let tile_lib = [ {"name": "#00#00#00#00", "tile": [ [ "#00", "#00"], ["#00", "#00" ] ], "orig_template":"####", "tileGroup": 0, "flatMap": 0 } ];

  let N = 7;

  for (let key in dedup_base) {
    let base_pat = dedup_base[key];

    for (col0=N; col0>=0; col0--) {
      for (col1=N; col1>=0; col1--) {

        for (row0=N; row0>=0; row0--) {
          for (row1=N; row1>=0 ; row1--) {

            let tile = _cpy(base_pat);


            let _c00 = col0;
            let _c10 = col0;

            if (base_pat[1][0] == 'w')  { _c10--; }
            if (_c10 < 0) { continue; }

            let _c01 = col1;
            let _c11 = col1;

            if (base_pat[1][1] == 'w') { _c11--; }
            if (_c11 < 0) { continue; }

            if ((base_pat[0][0] == 'w') && (_c00 == N)) { continue; }
            if ((base_pat[0][1] == 'w') && (_c01 == N)) { continue; }


            let _r00 = row0;
            let _r01 = row0;

            if (base_pat[0][1] == 'w') { _r01--; }
            if (_r01 < 0) { continue; }

            let _r10 = row1;
            let _r11 = row1;

            if (base_pat[1][1] == 'w') { _r11--; }
            if (_r11 < 0) { continue; }

            if ((base_pat[0][0] == 'w') && (_r00 == N)) { continue; }
            if ((base_pat[1][0] == 'w') && (_r10 == N)) { continue; }


            tile[0][0] = tile[0][0] + _c00.toString() + _r00.toString();
            tile[0][1] = tile[0][1] + _c01.toString() + _r01.toString();

            tile[1][0] = tile[1][0] + _c10.toString() + _r10.toString();
            tile[1][1] = tile[1][1] + _c11.toString() + _r11.toString();

            let tg = 1;
            //if ((_c00 == N) || (_c01 == N) ||
            //    (_r00 == N) || (_r10 == N)) { tg = 2; }

            let _k = _key(tile);
            tile_lib.push({ "name": _k, "tile": tile, "orig_tempate": _cpy(base_pat), "tileGroup": tg, "flatMap": dedup_group[key] });

          }
        }


      }
    }

  }

  return tile_lib;
}

function construct_rule(supertile) {

  let oppo = [1,0, 3,2];
  let idir_yx = [
    [ [0,1], [1,1] ],
    [ [0,0], [1,0] ],

    [ [0,0], [0,1] ],
    [ [1,0], [1,1] ]

  ];

  let nei_map = [ {}, {}, {}, {} ];

  let rule = [];

  for (let idx=0; idx<supertile.length; idx++) {
    for (idir=0; idir < 6; idir++) {
      rule.push( [ 0, idx, idir, 1 ] );

      if (idx > 0) {
        rule.push( [ idx, 0, idir, 1 ] );
      }
    }
  }


  for (let idx=1; idx<supertile.length; idx++) {

    let tile = supertile[idx].tile;

    for (idir=0; idir<4; idir++) {
      let y0 = idir_yx[idir][0][0];
      let x0 = idir_yx[idir][0][1];

      let y1 = idir_yx[idir][1][0];
      let x1 = idir_yx[idir][1][1];

      let _key = tile[y0][x0] + tile[y1][x1];
      if (!(_key in nei_map[idir])) { nei_map[idir][_key] = {}; }

      nei_map[idir][_key][idx] = 1;
    }
  }

  console.log("????", rule.length);

  for (idir=0; idir<4; idir++) {

    let rdir = oppo[idir];

    let iy0 = idir_yx[idir][0][0];
    let ix0 = idir_yx[idir][0][1];
    let iy1 = idir_yx[idir][1][0];
    let ix1 = idir_yx[idir][1][1];

    let ry0 = idir_yx[rdir][0][0];
    let rx0 = idir_yx[rdir][0][1];
    let ry1 = idir_yx[rdir][1][0];
    let rx1 = idir_yx[rdir][1][1];


    for (let idx=1; idx<supertile.length; idx++) {

      let tile = supertile[idx].tile;

      let src_key = tile[iy0][ix0] + tile[iy1][ix1];
      let dst_key = tile[ry0][rx0] + tile[ry1][rx1];

      for (let dst_idx in nei_map[rdir][src_key]) {

        if (rule.length == 421278) {
          console.log("??", tile, "idir:", idir, "src_key:", src_key, "dst_key:", dst_key, "dst_idx", dst_idx, "dst_tile:", supertile[dst_idx].tile);
        }

        rule.push( [ parseInt(idx), parseInt(dst_idx), idir, 1 ] );

      }

    }

  }

  return rule;
}

//               _
//   __ _  ___ _(_)__
//  /  ' \/ _ `/ / _ \
// /_/_/_/\_,_/_/_//_/
//


function main(opt) {

  supertile_lib = gen_supertile(base_template);
  let rule = construct_rule(supertile_lib);

  if (DEBUG_LEVEL > 0) {
    console.log("; supertile.length:", supertile_lib.length, "rule.length", rule.length );
  }


  let poms = libpoms.configTemplate();

  poms.rule = rule;

  // WIP
  // WIP
  // WIP
  //

  let image_wh = Math.ceil( Math.sqrt( poms.name.length ) );
  let stride = 16;

  poms.tileset.image        = opt.tileset_fn;
  poms.tileset.tilecount    = poms.name.length;
  poms.tileset.imagewidth   = image_wh * stride;
  poms.tileset.imageheight  = image_wh * stride;
  poms.tileset.tileheight   = stride;
  poms.tileset.tilewidth    = stride;

  poms.flatTileset = {};
  poms.flatTileset["image"]       = opt.flatTileset_fn;
  poms.flatTileset["tilecount"]   = poms.name.length;
  poms.flatTileset["imagewidth"]  = image_wh * stride;
  poms.flatTileset["imageheight"] = image_wh * stride;
  poms.flatTileset["tileheight"]  = stride;
  poms.flatTileset["tilewidth"]   = stride;

  for (let idx=0; idx<supertile_lib.length; idx++) {
    poms.name.push( supertile_lib[idx].name );
    poms.weight.push(1);
    poms.flatMap.push(supertile_lib[idx].flatMap );
    poms.tileGroup.push(supertile_lib[idx].tileGroup );
  }

  //
  // WIP
  // WIP
  // WIP


  if (opt.poms_fn.length > 0) {

    if (DEBUG_LEVEL > 0) {
      console.log("# writing", opt.poms_fn);
    }

    //fs.writeFileSync("dnd.poms", libpoms.configStringify(poms));
    fs.writeFileSync(opt.poms_fn, libpoms.configStringify(poms));
  }
}

//       ___
//  ____/ (_)
// / __/ / /
// \__/_/_/
//

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

  "setup constraint level (JSON)",

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
  fp.write( DRAFTS_N_DRAGONS_TILEGEN_VERSION + "\n" );
}

function show_help(fp) {
  fp.write("\ndnd_gen.js, version ");
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

var exec = -1;
let main_opt = {};
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


if (exec > 0) {
  main(main_opt);
}
else if (exec < 0) {
  show_help(process.stderr);
}
