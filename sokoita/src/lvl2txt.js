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
var jimp = require("jimp").Jimp;

var STRIDE = [40,40];

// _   - boundary condition (0 tile)
// #   - wall
// ' ' - inner moveable space
// $   - ball
// *   - ball on platform
// .   - platform
// @   - player
// +   - player on platform
//
var pxl_code = [
  {"rgba":[ 255, 255, 255, 255 ], "code":"_"},
  {"rgba":[ 124, 74, 49, 255 ], "code":"#"},
  {"rgba":[ 84, 84, 84, 255 ], "code":" "},
  {"rgba":[ 91, 89, 124, 255 ], "code":"$"},
  {"rgba":[ 56, 41, 120, 255 ], "code":"*"},
  {"rgba":[ 143, 143, 103, 255 ], "code":"."},
  {"rgba":[ 183, 137, 63, 255 ], "code":"@"}
];


function pxl_dist(a,b) {
  let d = 0;
  for (let i=0; i<4; i++) { d += Math.abs(a[i]-b[i]); }
  return d;
}

function pxl_lookup(lib, pxl) {
  for (let i=0; i<lib.length; i++) {
    if (pxl_dist(lib[i].rgba, pxl) < 10) { return lib[i]; }
  }
  return [];
}

function print_level(lvl) {
  for (let i=0; i<lvl.length; i++) {
    console.log(lvl[i].join(""));
  }
}

function json_pretty_str(data) {

  let lines = [];

  lines.push("{");
  for (let key in data) {
    let v = data[key];
  }
  lines.push("}");

  return lines.join("\n");
}

async function _main(base_dir) {
  base_dir = ((typeof base_dir === "undefined") ? "./" : base_dir);

  let lvl_json = { };

  for (let lvl_idx=1; lvl_idx <= 90; lvl_idx++) {

    let fn = base_dir + "/screen." + lvl_idx.toString() + ".jpg";

    let img = await jimp.read(fn);
    let tile_img = new jimp({"width":STRIDE[0], "height":STRIDE[1]});

    let img_size = [ img.bitmap.width, img.bitmap.height ];

    let cxy = [ Math.floor(STRIDE[0]/2), Math.floor(STRIDE[1]/2) ];

    var lvl = [];

    for (let h=0; h < img_size[1]; h += STRIDE[1]) {

      let lvl_row = [];
      for (let w=0; w < img_size[0]; w += STRIDE[0]) {
        tile_img.blit( {"src":img, "x":0, "y":0, "srcX":w, "srcY":h, "srcW":STRIDE[0], "srcH":STRIDE[1] } );

        let pxl = [
          tile_img.bitmap.data[ 4*(cxy[1]*STRIDE[0] + cxy[0]) + 0 ],
          tile_img.bitmap.data[ 4*(cxy[1]*STRIDE[0] + cxy[0]) + 1 ],
          tile_img.bitmap.data[ 4*(cxy[1]*STRIDE[0] + cxy[0]) + 2 ],
          tile_img.bitmap.data[ 4*(cxy[1]*STRIDE[0] + cxy[0]) + 3 ],
        ];

        let code = pxl_lookup(pxl_code,pxl).code;

        //console.log(w,h,pxl, code, pxl_lookup(pxl_code,pxl));

        lvl_row.push(code);

      }

      lvl.push(lvl_row);
    }

    let a = [];
    for (let i=0; i<lvl.length; i++) {

      // replace 'outside' with wall (normalize map)
      //
      let line = lvl[i].join("").replace( /_/g, '#' );

      a.push( line );
    }

    lvl_json[lvl_idx] = a.join("\n");

  }

  let fin_json = {
    "_key": [
      " _ - oustside",
      "# - wall",
      "$ - block",
      "' ' - (space) inside moveable",
      "@ - player",
      ". - storage (destination)",
      "* - block on storage (block on destination)",
      "+ - player on platform"
    ].join("\n"),
    "data": {}
  };
  fin_json.data = lvl_json;

  console.log( JSON.stringify(fin_json) );
}

let fn = "../img";
if (process.argv.length > 2) {
  fn = process.argv[2];
}

_main(fn);

