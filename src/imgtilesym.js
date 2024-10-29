// LICENSE: CC0
//
//


var jimp = require("jimp").Jimp;
var fs = require("fs");

/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    License: Public domain (or MIT if needed). Attribution appreciated.
    A fast and simple 53-bit string hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
*/
const cyrb53 = function(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

/*
    cyrb53a beta (c) 2023 bryc (github.com/bryc)
    License: Public domain (or MIT if needed). Attribution appreciated.
    This is a work-in-progress, and changes to the algorithm are expected.
    The original cyrb53 has a slight mixing bias in the low bits of h1.
    This doesn't affect collision rate, but I want to try to improve it.
    This new version has preliminary improvements in avalanche behavior.
*/
const cyrb53a_beta = function(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x85ebca77);
    h2 = Math.imul(h2 ^ ch, 0xc2b2ae3d);
  }
  h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97);
  h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xcaf649a9);
  h1 ^= h2 >>> 16; h2 ^= h1 >>> 16;
    return 2097152 * (h2 >>> 0) + (h1 >>> 11);
};

async function flatmap(opt) {

  let fn = opt.ifn;
  let stride = opt.stride;
  let ofn = opt.ofn;

  let tile_lib = {};
  let id_hash_a = [-1];

  let img = await jimp.read(fn);
  let tile_img = new jimp({ "width":stride[0], "height":stride[1] });

  let img_w = img.bitmap.width;
  let img_h = img.bitmap.height;

  let map_w = Math.floor(img_w / stride[0]);
  let map_h = Math.floor(img_h / stride[1]);

  let tilemap = new Array( map_w * map_h );
  for (let idx=0; idx<tilemap.length; idx++) { tilemap[idx] = -1; }

  let tot = map_w * map_h;

  let uniq_count=0, count=0;

  //console.log("wh:", img_w, img_h, stride[0], stride[1]);
  //console.log(img);

  let y_idx=0;
  let x_idx=0;
  for (let y=0; y<img_h; y+=stride[1]) {
    x_idx=0;
    for (let x=0; x<img_w; x+=stride[0]) {


      tile_img.blit( {"src":img, "x":0, "y":0, "srcX":x, "srcY":y, "srcW":stride[0], "srcH":stride[1] });

      //console.log(tile_img);
      //console.log(">>>");
      //console.log(tile_img.bitmap.data.toString());
      //console.log("<<<");

      //console.log(tile_img.bitmap.data.toString('hex'));

      let h = cyrb53( tile_img.bitmap.data.toString('hex') );

      console.log(x_idx, y_idx, h);

      if (!(h in tile_lib)) {
        uniq_count++;
        tile_lib[h] = {
          "img": new jimp({"width":stride[0],"height":stride[1]}),
          "hash": h,
          "count": 0,
          "id": uniq_count
        };

        tile_lib[h].img.blit( {"src":img, "x":0, "y":0, "srcX":x, "srcY":y, "srcW":stride[0], "srcH":stride[1] });

        id_hash_a.push(h);
      }
      tile_lib[h].count++;

      tilemap[(map_w*y_idx) + x_idx] = tile_lib[h].id;

      count++;
      x_idx++;

    }
    y_idx++;
  }
  uniq_count++;

  let ts_n = Math.ceil(Math.sqrt( uniq_count ));

  console.log("uniq_count:", uniq_count, "ts_n:", ts_n);

  let tileset = new jimp( {"width":ts_n*stride[0], "height":ts_n*stride[1] });

  let _id = 1;
  for (let _iy=0; _iy < ts_n; _iy++) {
    for (let _ix=0; _ix < ts_n; _ix++) {
      let h = id_hash_a[_id];
      tileset.blit({"src":tile_lib[h].img, "x":_ix*stride[0], "y":_iy*stride[1], "srcX":0, "srcY":0, "srcW":stride[0], "srcH":stride[1] });
      _id++;
      if (_id >= uniq_count) { break; }
    }
    if (_id >= uniq_count) { break; }
  }

  let tileset_obj = {
    "img": tileset,
    "tilecount": uniq_count,
    "tilewidth": opt.stride[0],
    "tileheight": opt.stride[1],
    "imagewidth": tileset.width,
    "imageheight": tileset.height,

    "lib": tile_lib
  };

  return tileset_obj;

  //tileset.write(opt.ofn);

}

async function group_map(ts) {
  let img = ts.img;
  let stride = [ts.tilewidth, ts.tileheight];

  let tile_lib = ts.lib;
  let tile_lib_a = [];

  let w = img.width;
  let h = img.height;

  let tile_se = [{}];

  let transform_tile = new jimp( {"width":stride[0], "height":stride[1] });

  for (let tile=0; tile < ts.tilecount; tile++) { tile_lib_a.push({}); }
  for (let h in tile_lib) {
    let id = tile_lib[h].id;
    tile_lib_a[id] = tile_lib[h];
  }

  let gmap = {};

  for (let tile=1; tile < ts.tilecount; tile++) {
    gmap[tile] = {};
  }

  for (let rot_idx=1; rot_idx<4; rot_idx++) {

    let rot = Math.floor(rot_idx*90);
    let rot_name = "r" + rot_idx.toString();

    for (let tile=1; tile < ts.tilecount; tile++) {

      transform_tile.blit( {"src": tile_lib_a[tile].img, "x":0, "y":0 } );
      transform_tile.rotate(rot);
      let h = cyrb53( transform_tile.bitmap.data.toString('hex') );
      if (h in tile_lib) {
        gmap[tile][rot_name] = tile_lib[h].id;
      }

      transform_tile.blit( {"src": tile_lib_a[tile].img, "x":0, "y":0 } );
      transform_tile.flip({"horizontal":true, "vertical":false});
      h = cyrb53( transform_tile.bitmap.data.toString('hex') );
      if (h in tile_lib) {
        gmap[tile]["fh"] = tile_lib[h].id;
      }

      transform_tile.blit( {"src": tile_lib_a[tile].img, "x":0, "y":0 } );
      transform_tile.flip({"horizontal":false, "vertical":true});
      h = cyrb53( transform_tile.bitmap.data.toString('hex') );
      if (h in tile_lib) {
        gmap[tile]["fv"] = tile_lib[h].id;
      }

    }

  }

  return gmap;
}

async function _main() {
  let opt = {
    "ifn": "../img/pill_mortal_map0.png",
    "stride": [8,8],
    "ofn": "./pm_flat_tileset.png"
  };

  let ts = await flatmap(opt);


  ts.img.write(opt.ofn);

  let g = await group_map(ts);

  console.log(g);

}


_main();
