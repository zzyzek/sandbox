// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// simple base tile validation
//

var fs = require("fs");
var jimp = require("jimp");
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

  let poms = libpoms.configTemplate();

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

  poms.name = [ '####' ];
  poms.weight = [ 1 ];
  poms.tileGroup = [ 0 ];
  poms.flatMap = [ 0 ];
  poms.size = [8,8,1];
  poms.constraint = [
    {"type":"remove","range":{"tile":[0,1],"x":[], "y":[], "z":[]}}
  ];

  let tile2flat = {
    's' : 0,
    'w' : 1
  };

  for (let key in dedup_base) {
    poms.name.push( key );
    poms.weight.push(1);
    poms.tileGroup.push(1)
    poms.flatMap.push( tile2flat[ key[0] ] );

    dedup_group[key] = dedup_group_idx;
    dedup_group_idx++;
  }

  let oppo = [1,0, 3,2];
  let idir_idx = [ [1,3], [0,2], [0,1], [2,3] ];

  // boundary tile rules
  //
  for (let tile=0; tile<poms.name.length; tile++) {
    for (idir=0; idir<6; idir++) {
      poms.rule.push( [0, tile, idir, 1] );
      if (tile > 0) {
        poms.rule.push( [tile, 0, idir, 1] );
      }
    }
  }


  for (let tile_src = 1; tile_src < poms.name.length; tile_src++) {
    for (let tile_dst = 1; tile_dst < poms.name.length; tile_dst++) {

      for (idir=0; idir<4; idir++) {
        let rdir = oppo[idir];

        let src_name = poms.name[tile_src];
        let dst_name = poms.name[tile_dst];

        let src_pat = src_name[ idir_idx[idir][0] ] + src_name[ idir_idx[idir][1] ];
        let dst_pat = dst_name[ idir_idx[rdir][0] ] + dst_name[ idir_idx[rdir][1] ];

        if (src_pat == dst_pat) {
          poms.rule.push([ tile_src, tile_dst, idir, 1 ]);
        }

      }

    }
  }

  poms.tileset.image        = "img/dnd_validation_tileset.png";
  poms.tileset.tilecount    = 16;
  poms.tileset.imagewidth   = 64;
  poms.tileset.imageheight  = 64;
  poms.tileset.tileheight   = 16;
  poms.tileset.tilewidth    = 16;

  poms.flatTileset = {
    "image": "img/dnd_validation_flat_tileset.png",
    "tilecount": 2,
    "imagewidth": 32,
    "imageheight": 16,
    "tileheight": 16,
    "tilewidth": 16
  };

  console.log( libpoms.configStringify(poms) );

}

gen_supertile(base_template);
