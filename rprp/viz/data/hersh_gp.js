
var fs = require("fs");

var hersh = JSON.parse( fs.readFileSync("./utf8_hershey_ascii.json") );

let bb_first = true;
let bb = [[0,0], [0,0]];

function draw_glyph( glyph, xy, sxy ) {
  xy = ((typeof xy === "undefined") ? [0,0] : xy);

  if      (typeof sxy === "undefined")  { sxy = [1,1]; }
  else if (typeof sxy === "number")     { sxy = [sxy, sxy]; }

  let art = glyph.art;

  for (let art_idx=0; art_idx < art.length; art_idx++) {
    for (let xy_idx=0; xy_idx < art[art_idx].length; xy_idx++) {
      let art_xy = art[art_idx][xy_idx];

      let disp_xy = [ art_xy.x*sxy[0] + xy[0], art_xy.y*sxy[1] + xy[1] ];

      console.log(disp_xy[0], disp_xy[1]);
    }
    console.log("");
  }
}

for (let u=0; u<128; u++) {
  let ustr = u.toString();
  if (!(ustr in hersh)) { continue; }

  let glyph = hersh[ustr];

  let xsta = glyph.xsta;
  let xsto = glyph.xsto;
  let art = glyph.art;

  for (let art_idx=0; art_idx < art.length; art_idx++) {
    for (let xy_idx=0; xy_idx < art[art_idx].length; xy_idx++) {

      let xy = [ art[art_idx][xy_idx].x, art[art_idx][xy_idx].y ];

      if (bb_first) {
        bb_first = false;
        bb[0][0] = xy[0] ;
        bb[0][1] = xy[1] ;
        bb[1][0] = xy[0] ;
        bb[1][1] = xy[1] ;
      }

      bb[0][0] = Math.min( bb[0][0], xy[0] );
      bb[0][1] = Math.min( bb[0][1], xy[1] );
      bb[1][0] = Math.max( bb[1][0], xy[0] );
      bb[1][1] = Math.max( bb[1][1], xy[1] );

    }
  }

  //console.log("#>>>", ustr);
}

let glyph_dxy = [ bb[1][0] - bb[0][0], bb[1][1] - bb[0][1] ];

for (let u=0; u<128; u++) {
  let ustr = u.toString();
  if (!(ustr in hersh)) { continue; }

  let ix = u%16;
  let iy = Math.floor(u/16);


  let base_xy = [ ix*glyph_dxy[0], iy*glyph_dxy[1] ];

  let glyph = hersh[ustr];

  console.log( "#", ix, iy, glyph_dxy, base_xy );
  draw_glyph(glyph, base_xy );



}



