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
var libpoms = require("./libpoms.js");

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

  //DEBUG
  //
  //for (let key in dedup_base) { _print(dedup_base[key]); }

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

function main() {

  supertile_lib = gen_supertile(base_template);
  let rule = construct_rule(supertile_lib);

  console.log("; supertile.length:", supertile_lib.length, "rule.length", rule.length );

  //for (let idx=0; idx<supertile_lib.length; idx++) {
  //  _print(supertile_lib[idx].tile);
  //}

  let poms = {

    "rule": rule,

    "name": [],
    "weight": [],

    "boundaryCondition": {
      "x+" : {"type":"tile","value":0},
      "x-" : {"type":"tile","value":0},
      "y+" : {"type":"tile","value":0},
      "y-" : {"type":"tile","value":0},
      "z+" : {"type":"tile","value":0},
      "z-" : {"type":"tile","value":0}
    },

    "constraint": [
      {"type":"remove","range":{"tile":[0,1],"x":[], "y":[], "z":[]}}
    ],

    "objMap": [],
    "flatMap": [],
    "tileGroup": [],
    "tileset": {
      "image": "drafts_n_dragons_tileset.png",
      "tilecount": -1,
      "imagewidth": -1,
      "imageheight": -1,
      "tileheight": -1,
      "tilewidth": -1
    },

    "flatTileset": {
      "image": "drafts_n_dragons_flat_tileset.png",
      "tilecount": -1,
      "imagewidth": -1,
      "imageheight": -1,
      "tileheight": -1,
      "tilewidth": -1
    },

    "size": [8,8,1]

  };

  for (let idx=0; idx<supertile_lib.length; idx++) {
    poms.name.push( supertile_lib[idx].name );
    poms.weight.push(1);
    poms.flatMap.push(supertile_lib[idx].flatMap );
    poms.tileGroup.push(supertile_lib[idx].tileGroup );
  }

  console.log("# writing dnd.poms");

  fs.writeFileSync("dnd.poms", libpoms.configStringify(poms));
}

main();
