// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var DATA = r2k2zzn_enum;

var CANVAS_ID = 'twojs_canvas';

var g_fig_ctx = {

  "uniq_id_base": "customid_",
  "uniq_id_idx": 0,
  "postprocess": [],

  "html_id":"fig",
  "two": new Two({fitted:true}),

  "pal" : [
    [47,55,55], // black
    [67,54,51], // brown

    [242,244,203], // beige
    [255,94,91], // red
    [197,40,61], // other red

    [255,200,87], // yellow
    [233,114,76], // orange

    [155,195,212], // dark blue
    [164,216,224], // mid blue
    [168,225,230], // light blue

    [100,185,106], // hot green

    [139,177,116], // dark green
    [147,182,126],  // mid green
    [167,196,151]  // light green
  ],

  "rgba_pal" : [
    ""
  ],

  "geom":[],

};


function _dl() {
  var ele = document.getElementById(CANVAS_ID);
  var b = new Blob([ ele.innerHTML ]);
  saveAs(b, "fig.svg");
}

function makeTwoVector(_pnt) {
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }
  return pnt;
}

function makeTwoAnchor(_pnt) {
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt.push( new Two.Anchor(_pnt[ii][0], _pnt[ii][1]) );
  }
  return pnt;
}

function mk_checkerboard_endpoints(opt) {
  let two = g_fig_ctx.two;

  let sx = opt.sx;
  let sy = opt.sy;

  let nx = opt.nx;
  let ny = opt.ny;

  let x_len = opt.x_len;
  let y_len = opt.y_len;

  let color_scheme = {
    "red-beige": [ [248,112,116], [248,235,187] ],
    "purple-light" : [[ 152,119,182], [228,220,242] ],
    "green-yellow": [  [85,149,100], [236,249, 179] ],
    "grey-light" : [ [142,162,172], [224,226,231] ]
  };

  let color = [
    "rgba(152,119,182,0.5)",
    "rgba(228,220,242,0.5)"
  ];

  color = [
    "rgb(152,119,182)",
    "rgb(228,220,242)"
  ];

  let fudge_parity = ((nx*ny)%2);
  if ("initial_parity" in opt) {
    fudge_parity = opt.initial_parity;
  }


  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {

      let parity = (ix+iy +fudge_parity)%2;

      let x = sx + ix*x_len;
      let y = sy + iy*y_len;
      let rect = new Two.Rectangle( x,y, x_len, y_len );
      rect.linewidth = 0.5;

      rect.stroke = "rgba(0,0,0,0.4)";
      rect.fill = "rgba(255, 200, 200, 1)";
      rect.fill = color[ parity ];

      rect.stroke = "rgb(0,0,0)";
      rect.fill = color[parity];
      rect.opacity = 0.5;

      two.add(rect);

    }
  }

  //let path_r = 8.5;
  let cr = (("c_rad" in opt) ? opt.c_rad : 8.5);
  let lw = (("l_width" in opt) ? opt.l_width : 10);

  let path_colors = [
    "rgb(80,80,140)",
    "rgb(200,60,50)"
  ];

  let paths = opt.paths;

  for (let s_idx=0; s_idx < opt.S.length; s_idx++) {

    let ep_color = path_colors[s_idx];

    let spos = opt.S[s_idx];
    let tpos = opt.T[s_idx];

    let s_p = [ sx + spos[0]*x_len, sy + spos[1]*y_len ];
    let t_p = [ sx + tpos[0]*x_len, sy + tpos[1]*y_len ];

    let start_circle = two.makeCircle( s_p[0], s_p[1], cr );
    start_circle.fill = ep_color;
    start_circle.linewidth = 0;
    start_circle.stroke = ep_color;

    let end_circle = two.makeCircle( t_p[0], t_p[1], cr );
    end_circle.fill = ep_color;
    end_circle.linewidth = 0;
    end_circle.stroke = ep_color;
  }

  if (("overlay" in opt) &&
      (typeof opt.overlay !== "undefined")) {
    let overlay_color = opt.overlay;
    let overlay_opacity = (("overlay_opacity" in opt) ? opt.overlay_opacity : 0.25);

    let sx2 = (nx*x_len/2) - (x_len/2);
    let sy2 = (ny*y_len/2) - (y_len/2);

    let r = two.makeRectangle( sx + sx2,sy + sy2, nx*x_len, ny*y_len );
    r.fill = overlay_color;
    r.opacity = overlay_opacity;
  }

  two.update();
}

function mk_checkerboard_paths(opt) {
  let two = g_fig_ctx.two;

  let sx = opt.sx;
  let sy = opt.sy;

  let nx = opt.nx;
  let ny = opt.ny;

  let x_len = opt.x_len;
  let y_len = opt.y_len;

  let color_scheme = {
    "red-beige": [ [248,112,116], [248,235,187] ],
    "purple-light" : [[ 152,119,182], [228,220,242] ],
    "green-yellow": [  [85,149,100], [236,249, 179] ],
    "grey-light" : [ [142,162,172], [224,226,231] ]
  };

  let color = [
    "rgba(152,119,182,0.5)",
    "rgba(228,220,242,0.5)"
  ];

  color = [
    "rgb(152,119,182)",
    "rgb(228,220,242)"
  ];

  let fudge_parity = ((nx*ny)%2);
  if ("initial_parity" in opt) {
    fudge_parity = opt.initial_parity;
  }


  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {

      let parity = (ix+iy +fudge_parity)%2;

      let x = sx + ix*x_len;
      let y = sy + iy*y_len;
      let rect = new Two.Rectangle( x,y, x_len, y_len );
      rect.linewidth = 0.5;

      rect.stroke = "rgba(0,0,0,0.4)";
      rect.fill = "rgba(255, 200, 200, 1)";
      rect.fill = color[ parity ];

      rect.stroke = "rgb(0,0,0)";
      rect.fill = color[parity];
      rect.opacity = 0.5;

      two.add(rect);

    }
  }

  let lw = (("l_width" in opt) ? opt.l_width : 10);
  let cr = (("c_rad" in opt) ? opt.c_rad : 8.5);

  let path_color = "rgba(60,60,120,1)";

  path_color = "rgba(80,80,140,1)";
  path_color = "rgb(80,80,140)";

  let path_colors = [
    "rgb(80,80,140)",
    "rgb(200,60,50)"
  ];


  let paths = opt.paths;

  for (let path_idx=0; path_idx<paths.length; path_idx++) {
    let _p = paths[path_idx];
    let w_p = [];
    for (let idx = 0; idx < _p.length; idx++) {
      w_p.push( [ sx + _p[idx][0]*x_len, sy + _p[idx][1]*y_len ] );
    }

    path_color = path_colors[path_idx];

    let np_center = {};
    if (("nopath" in opt) &&
        (opt.nopath)) {
      np_center = w_p.pop();
    }

    let tv_path = makeTwoVector(w_p);
    let t_path = two.makePath(tv_path, true);

    t_path.noFill();
    t_path.linewidth = lw;
    t_path.stroke = path_color;
    t_path.cap = 'round';
    t_path.join = 'round';

    let start_circle = two.makeCircle( w_p[0][0], w_p[0][1], cr );
    start_circle.fill = path_color;
    start_circle.linewidth = 0;
    start_circle.stroke = path_color;

    if (("end_circle" in opt) &&
        (opt.end_circle)) {
      let n = w_p.length-1;
      let end_circle = two.makeCircle( w_p[n][0], w_p[n][1], cr );
      //end_circle.fill = "rgba(120,120,240,1)";
      end_circle.fill = path_color;
      end_circle.linewidth = 0;
      end_circle.stroke = path_color;
    }
  }

  two.update();
}

/*
function disp_r2k2zzn() {
  let two = g_fig_ctx.two;
  let fs = 18;
  let font_style = {
    "size": fs,
    "family": "Libertine, Linux Libertine 0"
  };

  // y+ is downwards
  //
  let square_size = 50;

  let sx = 50,
      sy = 50,
      cur_x = 50,
      cur_y = 50,
      dx = 200,
      dy = 200;

  cur_x = sx;
  let opt_2x2 = {
    "sx": cur_x, "sy": cur_y,
    "nx": 2, "ny": 2,
    "x_len": square_size, "y_len": square_size,
    "paths": [ [[0,0], [1,0]], [[0,1],[1,1]] ]
  };
  mk_checkerboard_paths(opt_2x2);
  cur_x += dx - (3*square_size/2);

}
*/

function disp_wh_r2k2zzn(wh_idx) {
  let square_size = 8;
  let sx = 50,
      sy = 50;

  let wh = DATA.WH[wh_idx];

  let dx = (wh[0]*square_size*6/5),
      dy = (wh[1]*square_size*6/5);

  let soln_a = DATA.s[wh_idx];

  let valid_count = 0,
      invalid_count = 0;

  let valid_ctx = [],
      invalid_ctx = [];

  for (let i=0; i<soln_a.length; i++) {
    if (soln_a[i].r < 0) {
      invalid_ctx.push( soln_a[i].ctx );
      invalid_count++;
    }
    else {
      valid_ctx.push( soln_a[i].ctx );
      valid_count++;
    }
  }

  let l_width = square_size / 3,
      c_rad = square_size * 17/60;

  let nside_valid = Math.ceil( Math.sqrt(valid_count) );
  let nside_invalid = Math.ceil( Math.sqrt(invalid_count) );

  let _osx = sx,
      _osy = sy;

  let show_valid = false;
  if (show_valid) {

    for (let j_disp=0; j_disp < nside_valid; j_disp++) {
      for (let i_disp=0; i_disp < nside_valid; i_disp++) {
        let _idx = (j_disp*nside_valid) + i_disp;
        if (_idx >= valid_ctx.length) { continue; }

        let ctx = valid_ctx[_idx];

        let cur_x = _osx + (i_disp*dx);
        let cur_y = _osy + (j_disp*dy);

        let _opt = {
          "l_width" : l_width,
          "c_rad": c_rad,
          "end_circle":true,
          "sx": cur_x, "sy": cur_y,
          "nx": wh[0], "ny": wh[1],
          "x_len": square_size, "y_len": square_size,
          "paths": ctx.path
        };

        mk_checkerboard_paths(_opt);
      }
    }

    _osx = sx + (nside_valid*dx) + (dx/4);
  }
  else {
    _osx = sx;
    _osy = sy;
  }


  let show_invalid = true;
  if (show_invalid) {
    for (let j_disp=0; j_disp < nside_invalid; j_disp++) {
      for (let i_disp=0; i_disp < nside_invalid; i_disp++) {
        let _idx = (j_disp*nside_invalid) + i_disp;
        if (_idx >= invalid_ctx.length) { continue; }

        let ctx = invalid_ctx[_idx];

        let cur_x = _osx + (i_disp*dx);
        let cur_y = _osy + (j_disp*dy);

        let overlay = _get_overlay( ctx );

        let _opt = {
          //"overlay": overlay,
          "overlay_opacity": 0.4,
          "l_width" : l_width,
          "c_rad": c_rad,
          "sx": cur_x, "sy": cur_y,
          "nx": wh[0], "ny": wh[1],
          "x_len": square_size, "y_len": square_size,
          "S" : ctx.s,
          "T" : ctx.t
        };

        mk_checkerboard_endpoints(_opt);
      }
    }
  }


}

function _get_overlay(ctx) {

  let stst = [];
  let grid = [];

  let CUTOFF_OVERLAY = "rgb(20,40,80)";
  let CORNER_OVERLAY = "rgb(80,40,20)";
  let SQUARE_OVERLAY = "rgb(40,20,80)";

  //---
  // grid for easy access

  let wh = ctx.size;
  for (let j=0; j<wh[1]; j++) {
    grid.push([]);
    for (let i=0; i<wh[0]; i++) {
      grid[j].push(-1);
    }
  }

  for (let i=0; i<ctx.s.length; i++) {
    let s = ctx.s[i];
    let t = ctx.t[i];

    grid[ s[1] ][ s[0] ] = i;
    grid[ t[1] ][ t[0] ] = i;
  }


  // perimieter cutoff test
  //

  let p = [1,0];

  for (let i=1; i<wh[0]; i++) {
    let v = grid[ p[1] ][ p[0] ];
    if (v >= 0) { stst.push( v ); }
    p[0] += 1;
  }

  p = [wh[0]-1, 1];
  for (let i=1; i<wh[1]; i++) {
    let v = grid[ p[1] ][ p[0] ];
    if (v >= 0) { stst.push( v ); }
    p[1] += 1;
  }

  p = [wh[0]-2, wh[1]-1];
  for (let i=1; i<wh[0]; i++) {
    let v = grid[ p[1] ][ p[0] ];
    if (v >= 0) { stst.push( v ); }
    p[0] -= 1;
  }

  p = [0, wh[1]-2];
  for (let i=1; i<wh[1]; i++) {
    let v = grid[ p[1] ][ p[0] ];
    if (v >= 0) { stst.push( v ); }
    p[1] -= 1;
  }

  if (stst.length == 4) {
    let found = true;
    for (let i=0; i<4; i++) {
      if (stst[(i+1)%4] == stst[i]) { found=false; break; }
    }
    if (found) { return CUTOFF_OVERLAY; }
  }

  //---
  //---

  let u = grid[0][0],
      v = grid[0][1],
      w = grid[1][0];


  if ( (u<0) && (v>=0) && (w>=0) && (v!=w) ) { return CORNER_OVERLAY; }

  u = grid[wh[1]-1][0];
  v = grid[wh[1]-1][1];
  w = grid[wh[1]-2][0];

  if ( (u<0) && (v>=0) && (w>=0) && (v!=w) ) { return CORNER_OVERLAY; }

  u = grid[wh[1]-1][wh[0]-1];
  v = grid[wh[1]-1][wh[0]-2];
  w = grid[wh[1]-2][wh[0]-1];

  if ( (u<0) && (v>=0) && (w>=0) && (v!=w) ) { return CORNER_OVERLAY; }

  u = grid[0][wh[0]-1];
  v = grid[0][wh[0]-2];
  w = grid[1][wh[0]-1];

  if ( (u<0) && (v>=0) && (w>=0) && (v!=w) ) { return CORNER_OVERLAY; }

  //--

  for (let j=0; j<(wh[1]-1); j++) {
    for (let i=0; i<(wh[0]-1); i++) {
      let u00 = grid[j][i];
      let u10 = grid[j][i+1];
      let u01 = grid[j+1][i];
      let u11 = grid[j+1][i+1];

      if ((u00 < 0) || (u10 < 0) ||
          (u01 < 0) || (u11 < 0)) { continue; }

      if ((u00 == u11) && (u10 == u01)) {
        return SQUARE_OVERLAY;
      }
    }
  }

  return undefined;
}

function web_init() {
  let two = g_fig_ctx.two;

  var ele = document.getElementById(CANVAS_ID);
  two.appendTo(ele);

  disp_wh_r2k2zzn(1);
  //disp_r2k2zzn();
}
