// LICENSE: CC0
//

// inkscape doesn't respect rgba in fill or stroke,
// which is the main method of two.js to do it.
// As a hacky way to make sure it's inkscape compatible,
// the _dl() function will do a post processing step
// of going through each element and converting fill, stroke
// and linearGradient stop components with an rgba value
// to an rgb value with the appropriate 'opacity' portion
// set.
//

// Note on Libertine font,
// Chrome displays it, Inkscape displays it (using 'Linux Libertine O')
// but Firefox shits the bed for some reason.
// It looks like all font-family in `text` elements that have a space don't work.
// I'm tired of fighting with Firefox so I'm moving on as Inkscape works just fine.
//

var PIN_COLOR = "rgba(0,0,228,0.3)";
var PIN_COLOR = "rgba(0,0,255,0.3)";

var RESOLVED_BG = "rgb(210,255,210)";

//var RESOLVED_BG = "rgba(139,220,116,1)";
//var RESOLVED_BG = "rgba(159,250,136,1)";

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

  "block_edge_color" : "rgba(255, 62, 165,0.8)"

 //"rgba(100,185,106,0.9)"

};

//----
//----

function newID() {
  let id = g_fig_ctx.uniq_id_base + g_fig_ctx.uniq_id_idx.toString();
  g_fig_ctx.uniq_id_idx++;
  return id;
}

function appendPostProcess(_type, val) {
  g_fig_ctx.postprocess.push([_type, val]);
}

function toRGBAa(rgba) {
  let va = rgba.split(")")[0].split("(")[1].split(",");

  if (rgba.match( /^rgba\(/ )) {
    return va;
  }

  va.push(1);
  return va;
}

function postProcess() {

  let a = g_fig_ctx.postprocess;
  for (let idx=0; idx<a.length; idx++) {

    let toks = a[idx];

    let t = toks[0];
    let id = toks[1];


    let ele = document.getElementById(id);

    if ((ele.nodeName == "path") ||
        (ele.nodeName == "text")) {

      let fill = ele.getAttribute("fill");
      if ( fill.match( /^rgba/ ) ) {
        let rgb_a = toRGBAa(fill);
        ele.setAttribute( "fill", "rgb(" + rgb_a.slice(0,3).join(",") + ")" );
        ele.setAttribute( "fill-opacity", rgb_a[3] );
      }

      let stroke = ele.getAttribute("stroke");
      if ( stroke.match( /^rgba/ ) ) {
        let rgb_a = toRGBAa(stroke);
        ele.setAttribute( "stroke", "rgb(" + rgb_a.slice(0,3).join(",") + ")" );
        ele.setAttribute( "stroke-opacity", rgb_a[3] );
      }

    }
    else if (ele.nodeName == "linearGradient") {
      for (let c_idx=0; c_idx < ele.children.length; c_idx++) {
        let s = ele.children[c_idx];
        if (s.nodeName != "stop") { continue; }
        let c = s.getAttribute("stop-color");
        if ((c == null) || (c == "")) { continue; }

        let rgb_a = toRGBAa(c);

        s.setAttribute("stop-color", "rgb(" + rgb_a.slice(0,3).join(",") + ")")
        s.setAttribute("stop-opacity", rgb_a[3]);
      }
    }

  }

}

//----
//----

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


function mkblock_partial_res(ulx,uly, dx,dy) {
  let two = g_fig_ctx.two;

  let b0_w = dx,
      b0_h = dy;
  let b0_dx = ulx,
      b0_dy = uly;
  let b0_x = b0_w/2 + b0_dx;
  let b0_y = b0_h/2 + b0_dy;

  let block_info = {
    "x": b0_x, "y": b0_y,
    "w": b0_w, "h": b0_h,
    "dx": b0_dx, "dy": b0_dy
  };

  let b_back_info = {
    "x": b0_x, "y":b0_y, 
    "w": 1.1*b0_w, "h":1.1*b0_h
  };
  let b_back = two.makeRectangle(b_back_info.x, b_back_info.y,
                                 b_back_info.w, b_back_info.h);
  b_back.linewidth = 0;
  //b_back.stroke = "rgba(0,0,0,0)";
  b_back.stroke = "rgb(0,0,0)";
  b_back.fill = "#fff";

  let b_backl = two.makeRectangle(b_back_info.x, b_back_info.y,
                                 b_back_info.w, b_back_info.h);
  b_backl.linewidth = 0;
  //b_backl.stroke = "rgba(0,0,0,0)";
  b_backl.stroke = "rgb(0,0,0)";
  b_backl.noStroke();

  b_backl.fill = "url(#pattern-cgrid-big)";


  let _d = b_back_info.w - block_info.w;
  let b_backr_u = two.makeRectangle(b_back_info.x + _d/2, b_back_info.y,
                                 b_back_info.w - _d/2, b_back_info.h*1.01);
  b_backr_u.linewidth = 0;
  //b_backr_u.stroke = "rgba(0,0,0,0)";
  b_backr_u.stroke = "rgb(0,0,0)";
  b_backr_u.noStroke();

  b_backr_u.fill = "#fff";

  let b_backr = two.makeRectangle(b_back_info.x + _d/2, b_back_info.y,
                                 b_back_info.w - _d/2, b_back_info.h*1.01);
  b_backr.linewidth = 0;
  //b_backr.stroke = "rgba(0,0,0,0)";
  b_backr.stroke = "rgb(0,0,0)";
  b_backr.noStroke();

  b_backr.fill = "url(#pattern-Rdiag-big)";

  //---

  let backt_info = {
    "x": block_info.x - 10,
    "y": block_info.y - block_info.h/2,
    "w": -1,
    "h": _d
  };
  backt_info.w = 130;

  let b_backt_u = two.makeRectangle(backt_info.x, backt_info.y,
                                    backt_info.w, backt_info.h);
  b_backt_u.linewidth = 0;
  //b_backt_u.stroke = "rgba(0,0,0,0)";
  b_backt_u.stroke = "rgb(0,0,0)";
  b_backt_u.noStroke();

  //b_backt_u.fill = "#fff";
  b_backt_u.fill = "rgb(200,255,200)";
  b_backt_u.fill = RESOLVED_BG;


  let b_backt = two.makeRectangle(backt_info.x, backt_info.y,
                                  backt_info.w, backt_info.h);
  b_backt.linewidth = 1;
  b_backt.stroke = "rgb(0,0,0)";
  b_backt.fill = "url(#pattern-cannonball-big)";

  //--

  let backb_info = {
    "x": block_info.x - 50,
    "y": block_info.y + block_info.h/2,
    "w": -1,
    "h": _d
  };
  backb_info.w = 50;

  let b_backb_u = two.makeRectangle(backb_info.x, backb_info.y,
                                    backb_info.w, backb_info.h);
  b_backb_u.linewidth = 0;
  //b_backb_u.stroke = "rgba(0,0,0,0)";
  b_backb_u.stroke = "rgb(0,0,0)";
  b_backb_u.noStroke();

  b_backb_u.fill = "#fff";
  b_backb_u.fill = RESOLVED_BG;

  let b_backb = two.makeRectangle(backb_info.x, backb_info.y,
                                  backb_info.w, backb_info.h);
  b_backb.linewidth = 1;
  //b_backb.stroke = "rgba(0,0,0,1)";
  b_backb.stroke = "rgb(0,0,0)";

  b_backb.fill = "url(#pattern-cannonball-big)";

  //---

  // highlight edge corners
  //
  let b_block_rect_e = two.makeRectangle(b0_x,b0_y, b0_w,b0_h);
  b_block_rect_e.linewidth = 0;
  //b_block_rect_e.stroke = "rgba(0,0,0,0.0)";
  b_block_rect_e.stroke = "rgb(0,0,0)";
  b_block_rect_e.noStroke();

  b_block_rect_e.fill = PIN_COLOR;

  appendPostProcess( "color", b_block_rect_e.id );


  // backing 
  let _t = 8;
  //let b_block_rect_u = two.makeRectangle(b0_x,b0_y, b0_w,b0_h);
  let b_block_rect_u = two.makeRectangle(b0_x-_t/2,b0_y, b0_w-_t,b0_h-2*_t);
  b_block_rect_u.linewidth = 0;
  //b_block_rect_u.stroke = "rgba(1,0,0,0.0)";
  b_block_rect_u.stroke = "rgb(1,0,0)";
  b_block_rect_u.noStroke();

  b_block_rect_u.fill = "#fff";

  let b_block_rect = two.makeRectangle(b0_x,b0_y, b0_w,b0_h);
  b_block_rect.linewidth = 4;

  b_block_rect.stroke = g_fig_ctx.block_edge_color;

  appendPostProcess( "color", b_block_rect.id );

  b_block_rect.fill = "url(#pattern-ldiag-big)";
  g_fig_ctx.geom.push(b_block_rect);

  //--

  let _w = b0_w-_t;
  let _h = b0_h-2*_t;

  let _rzw = b0_w-_t;

  let res_pgn_pnt = [
    [0,0],

    [_rzw,0],
    [_rzw,50],
    [_rzw-20,50],
    [_rzw-20,70],
    [_rzw-40,70],
    [_rzw-40,80],

    /*
    [backt_info.w,0],
    [backt_info.w,50],
    [backt_info.w-20,50],
    [backt_info.w-20,70],
    [backt_info.w-40,70],
    [backt_info.w-40,80],
    */

    [backb_info.w-10,80],

    [backb_info.w-10,_h-50],
    [backb_info.w-10,_h-30],
    [backb_info.w,_h-30],
    [backb_info.w,_h],
    [0,_h],
  ];

  let _sx = b0_x-_t/2 - _w/2;
  let _sy = b0_y - _h/2;

  for (let ii=0; ii<res_pgn_pnt.length; ii++) {
    res_pgn_pnt[ii][0] += _sx;
    res_pgn_pnt[ii][1] += _sy;
  }

  // background for interior resolved area
  //
  let c_res_pgn_bg = makeTwoVector(res_pgn_pnt);
  let c_res_shape_bg = two.makePath(c_res_pgn_bg);
  c_res_shape_bg.linewidth = 0;
  //c_res_shape_bg.stroke = 'rgba(0,0,0,0)';
  c_res_shape_bg.stroke = 'rgb(0,0,0)';
  c_res_shape_bg.noStroke();

  c_res_shape_bg.fill = "#fff";
  c_res_shape_bg.fill = RESOLVED_BG;

  // resolved interior area
  //
  let c_res_pgn = makeTwoVector(res_pgn_pnt);
  let c_res_shape = two.makePath(c_res_pgn);
  c_res_shape.linewidth = 2;
  //c_res_shape.stroke = 'rgba(0,0,0,1)';
  //c_res_shape.stroke = "rgba(100,32,170,0.5)";
  c_res_shape.stroke = "rgba(235,69,95,0.5)";

  appendPostProcess( "color", c_res_shape.id );

  c_res_shape.fill = 'url(#pattern-cannonball-big)';

}



function mkblock(ulx,uly, dx,dy) {
  let two = g_fig_ctx.two;

  let b0_w = dx,
      b0_h = dy;
  let b0_dx = ulx,
      b0_dy = uly;
  let b0_x = b0_w/2 + b0_dx;
  let b0_y = b0_h/2 + b0_dy;

  let block_info = {
    "x": b0_x, "y": b0_y,
    "w": b0_w, "h": b0_h,
    "dx": b0_dx, "dy": b0_dy
  };

  // backings, so patterns don't fall through
  // left, right, top, back
  //

  let b_back_info = {
    "x": b0_x, "y":b0_y, 
    "w": 1.1*b0_w, "h":1.1*b0_h
  };

  // back left corner (boundary)
  //
  let b_back = two.makeRectangle(b_back_info.x, b_back_info.y,
                                 b_back_info.w, b_back_info.h);
  b_back.linewidth = 0;
  //b_back.stroke = "rgba(0,0,0,0)";
  b_back.stroke = "rgb(0,0,0)";
  b_back.noStroke();

  b_back.fill = "#fff";

  // back left for boundary pattern
  //
  let b_backl = two.makeRectangle(b_back_info.x, b_back_info.y,
                                 b_back_info.w, b_back_info.h);
  b_backl.linewidth = 0;
  //b_backl.stroke = "rgba(0,0,0,0)";
  b_backl.stroke = "rgb(0,0,0)";
  b_backl.noStroke();

  b_backl.fill = "url(#pattern-cgrid-big)";


  // right for grid hash pattern
  //
  let _d = b_back_info.w - block_info.w;
  let b_backr_u = two.makeRectangle(b_back_info.x + _d/2, b_back_info.y,
                                 b_back_info.w - _d/2, b_back_info.h*1.01);
  b_backr_u.linewidth = 0;
  //b_backr_u.stroke = "rgba(0,0,0,0)";
  b_backr_u.stroke = "rgb(0,0,0)";
  b_backr_u.noStroke();

  b_backr_u.fill = "#fff";

  let b_backr = two.makeRectangle(b_back_info.x + _d/2, b_back_info.y,
                                 b_back_info.w - _d/2, b_back_info.h*1.01);
  b_backr.linewidth = 0;
  //b_backr.stroke = "rgba(0,0,0,0)";
  b_backr.stroke = "rgb(0,0,0)";
  b_backr.noStroke();

  b_backr.fill = "url(#pattern-Rdiag-big)";

  //---

  // top pinned resolved pattern
  //
  let backt_info = {
    "x": block_info.x - 10,
    "y": block_info.y - block_info.h/2,
    "w": -1,
    "h": _d
  };
  backt_info.w = 130;

  let b_backt_u = two.makeRectangle(backt_info.x, backt_info.y,
                                    backt_info.w, backt_info.h);
  b_backt_u.linewidth = 0;
  //b_backt_u.stroke = "rgba(0,0,0,0)";
  b_backt_u.stroke = "rgb(0,0,0)";
  b_backt_u.noStroke();

  b_backt_u.fill = "#fff";
  b_backt_u.fill = RESOLVED_BG;

  let b_backt = two.makeRectangle(backt_info.x, backt_info.y,
                                  backt_info.w, backt_info.h);
  b_backt.linewidth = 1;
  //b_backt.stroke = "rgba(0,0,0,1)";
  b_backt.stroke = "rgb(0,0,0)";

  b_backt.fill = "url(#pattern-cannonball-big)";

  //--

  // bottom pinned resolved pattern
  //
  let backb_info = {
    "x": block_info.x - 50,
    "y": block_info.y + block_info.h/2,
    "w": -1,
    "h": _d
  };
  backb_info.w = 50;

  let b_backb_u = two.makeRectangle(backb_info.x, backb_info.y,
                                    backb_info.w, backb_info.h);
  b_backb_u.linewidth = 0;
  //b_backb_u.stroke = "rgba(0,0,0,0)";
  b_backb_u.stroke = "rgb(0,0,0)";
  b_backb_u.noStroke();

  b_backb_u.fill = "#fff";
  b_backb_u.fill = RESOLVED_BG;

  let b_backb = two.makeRectangle(backb_info.x, backb_info.y,
                                  backb_info.w, backb_info.h);
  b_backb.linewidth = 1;
  //b_backb.stroke = "rgba(0,0,0,1)";
  b_backb.stroke = "rgb(0,0,0)";

  b_backb.fill = "url(#pattern-cannonball-big)";

  //---

  // highlight edge corners (pin)
  //
  let b_block_rect_e = two.makeRectangle(b0_x,b0_y, b0_w,b0_h);
  b_block_rect_e.linewidth = 0;
  //b_block_rect_e.stroke = "rgba(0,0,0,0.0)";
  b_block_rect_e.stroke = "rgb(0,0,0)";
  b_block_rect_e.noStroke();

  //b_block_rect_e.fill = "rgba(255,0,0,0.2)";
  //b_block_rect_e.fill = "rgba(255,200,87,0.3)"; //yellow

  b_block_rect_e.fill = PIN_COLOR;

  appendPostProcess( "color", b_block_rect_e.id );


  // backing 
  let _t = 8;
  //let b_block_rect_u = two.makeRectangle(b0_x,b0_y, b0_w,b0_h);
  let b_block_rect_u = two.makeRectangle(b0_x-_t/2,b0_y, b0_w-_t,b0_h-2*_t);
  b_block_rect_u.linewidth = 0;
  //b_block_rect_u.stroke = "rgba(0,0,0,0.0)";
  b_block_rect_u.stroke = "rgb(0,0,0)";
  b_block_rect_u.noStroke();

  b_block_rect_u.noStroke();

  b_block_rect_u.fill = "#fff";

  //???
  //
  let b_block_rect = two.makeRectangle(b0_x,b0_y, b0_w,b0_h);
  b_block_rect.linewidth = 4;

  b_block_rect.stroke = g_fig_ctx.block_edge_color;

  appendPostProcess( "color", b_block_rect.id );

  b_block_rect.fill = "url(#pattern-ldiag-big)";
  g_fig_ctx.geom.push(b_block_rect);

}

function mkLegend(sx,sy) {
  let two = g_fig_ctx.two;

  let w = 20;
  let h = 20;

  let dx = 0;
  let dy = 40;

  let style = {
    "size": 15,
    //"weight": "normal",
    "family": "Libertine, Linux Libertine O"
  };

  let style_title = {
    "size": 15,
    "weight": "bold",
    "family": "Libertine, Linux Libertine O"
  };


  //let tx = 840,
  //    ty = 60;
  let tx = sx+20,
      ty = sy-35;
  let title_text0 = new Two.Text("Legend", tx,ty, style_title);
  two.add(title_text0);


  let legend_boundary = two.makeRectangle(sx,sy, w,h);
  legend_boundary.linewidth = 1;
  //legend_boundary.stroke = "rgba(0,0,0,1)";
  legend_boundary.stroke = "rgb(0,0,0)";

  legend_boundary.fill = "url(#pattern-cgrid)";

  let boundary_text = new Two.Text("boundary", sx+w+25,sy+1, style);
  two.add(boundary_text);


  sx += dx;
  sy += dy;
  let resolved_boundary_bg  = two.makeRectangle(sx,sy, w,h);
  resolved_boundary_bg.linewidth = 0;
  resolved_boundary_bg.stroke = RESOLVED_BG;
  resolved_boundary_bg.fill= RESOLVED_BG;

  let resolved_boundary = two.makeRectangle(sx,sy, w,h);
  resolved_boundary.linewidth = 1;
  //resolved_boundary.stroke = "rgba(0,0,0,1)";
  resolved_boundary.stroke = "rgb(0,0,0)";

  //resolved_boundary.stroke = "rgba(235,69,95,0.5)";

  resolved_boundary.fill = "url(#pattern-cannonball)";

  let resolved_text = new Two.Text("resolved", sx+w+22,sy+1, style);
  two.add(resolved_text);


  sx += dx;
  sy += dy;
  let indeterimate_boundary = two.makeRectangle(sx,sy, w,h);
  indeterimate_boundary.linewidth = 1;
  //indeterimate_boundary.stroke = "rgba(0,0,0,1)";
  indeterimate_boundary.stroke = "rgb(0,0,0)";

  indeterimate_boundary.fill = "url(#pattern-Rdiag)";

  let unresolved_text = new Two.Text("unresolved (grid)", sx+w+48,sy+1, style);
  two.add(unresolved_text);


  sx += dx;
  sy += dy;
  let indeterimate1_boundary = two.makeRectangle(sx,sy, w,h);
  indeterimate1_boundary.linewidth = 1;
  //indeterimate1_boundary.stroke = "rgba(0,0,0,1)";
  indeterimate1_boundary.stroke = "rgb(0,0,0)";

  indeterimate1_boundary.fill = "url(#pattern-ldiag)";

  let unresolved_block_text = new Two.Text("unresolved (block)", sx+w+52,sy+1, style);
  two.add(unresolved_block_text);


  sx += dx;
  sy += dy;
  let pin_boundary = two.makeRectangle(sx,sy, w,h);
  pin_boundary.linewidth = 1;
  //pin_boundary.stroke = "rgba(0,0,0,1)";
  pin_boundary.stroke = "rgb(0,0,0)";

  //pin_boundary.fill = "rgba(255,200,87,0.3)";
  pin_boundary.fill =  PIN_COLOR;

  appendPostProcess( "color", pin_boundary.id );

  let pin_text = new Two.Text("pinned", sx+w+16,sy+1, style);
  two.add(pin_text);


}

function mkText(sx, sy) {
  let two = g_fig_ctx.two;

  let style = {
    "size": 15,
    //"weight": "normal",
    "family": "Libertine, Linux Libertine O"
  };

  // orig 80, 50

  //let tx = sx + 200,
  //    ty = sy + 9;
  let tx = sx + 120,
      ty = sy + -40;
  let boundary_text0 = new Two.Text("a) Grid partially realized,", tx,ty, style);
  two.add(boundary_text0);
  let boundary_text1 = new Two.Text("choose block", tx-20,ty+20, style);
  two.add(boundary_text1);

  //tx = sx + 460;
  //ty = sy + 15;
  tx = sx + 380;
  ty = sy + -38;
  let block_init0 = new Two.Text("b) Initialize block, pinning", tx,ty, style);
  two.add(block_init0);
  let block_init1 = new Two.Text("overlapping boundaries", tx+5,ty+20, style);
  two.add(block_init1);

  //tx = sx + 685;
  //ty = sy + 15;
  tx = sx + 610;
  ty = sy + -38;
  //var block_fill0 = new Two.Text("c) Attempt to run block solver", tx,ty, style);
  var block_fill0 = new Two.Text("c) Attempt to run", tx,ty, style);
  var block_fill1 = new Two.Text("block solver", tx+0,ty+20, style);
  two.add(block_fill0);
  two.add(block_fill1);

  //tx = sx + 220;
  //ty = sy + 550;
  tx = sx + 135;
  ty = sy + 500;
  let grid_accept0 = new Two.Text("d)", tx-140, ty, style);
  grid_accept0.alignment = "left";
  let grid_accept1 = new Two.Text("Success", tx-123, ty, style);
  grid_accept1.alignment = "left";
  grid_accept1.fill= "rgba(0, 180, 0, 0.95)";
  grid_accept1.stroke = "rgba(0,0,0,0.15)";

  appendPostProcess( "color", grid_accept1.id );

  //var grid_accept0 = new Two.Text("d) Success,", tx-100,ty, style);
  two.add(grid_accept0);
  two.add(grid_accept1);
  var grid_accept2 = new Two.Text("incorporate resolved block into grid", tx-123,ty+20, style);
  grid_accept2.alignment = "left";
  two.add(grid_accept2);

  //tx = sx + 450;
  //ty = sy + 550;
  tx = sx + 360;
  ty = sy + 500;
  let grid_resfail0 = new Two.Text("e)", tx-65,ty, style);
  grid_resfail0.alignment = "left";
  let grid_resfail1 = new Two.Text("Resolution failure,", tx-48,ty, style);
  grid_resfail1.fill = "rgba(100,0,0,0.95)";
  grid_resfail1.alignment = "left";
  two.add(grid_resfail0);
  two.add(grid_resfail1);

  appendPostProcess( "color", grid_resfail1.id );


  let grid_resfail2 = new Two.Text("restore block and erode", tx-48,ty+20, style);
  grid_resfail2.alignment = "left";
  two.add(grid_resfail2);

  let grid_resfail3 = new Two.Text("resolved area boundaries", tx-48,ty+40, style);
  grid_resfail3.alignment = "left";
  two.add(grid_resfail3);

  //tx = sx + 730;
  //ty = sy + 550;
  tx = sx + 645;
  ty = sy + 500;
  let grid_setfail0 = new Two.Text("f)", tx-50,ty, style);
  grid_setfail0.alignment = "left";
  let grid_setfail1 = new Two.Text("Setup failure,", tx-35,ty, style);
  grid_setfail1.alignment = "left"
  grid_setfail1.fill = "rgba(200,0,0,0.95)";

  appendPostProcess( "color", grid_setfail1.id );

  two.add(grid_setfail0);
  two.add(grid_setfail1);
  var grid_setfail2 = new Two.Text("revert block area in grid to unresolved", tx-35,ty+20, style);
  grid_setfail2.alignment = "left"
  two.add(grid_setfail2);


}

function mkgrid(cx,cy) {
  let two = g_fig_ctx.two;

  //let cx = 50, cy = 50;

  let g0_w = 250;
  let g0_h = 190;
  let g0_x = g0_w/2 + cx;
  let g0_y = g0_h/2 + cy;

  let bg_ds = 16;
  let bg0_w = g0_w + bg_ds;
  let bg0_h = g0_h + bg_ds;
  let bg0_x = bg0_w/2+ cx - bg_ds/2;
  let bg0_y = bg0_h/2+ cy - bg_ds/2;

  // 
  let a_boundary_rect = two.makeRectangle(bg0_x,bg0_y, bg0_w,bg0_h);
  //a_boundary_rect.stroke="rgba(0,0,0,0)";
  a_boundary_rect.stroke="rgb(0,0,0)";
  a_boundary_rect.noStroke();

  a_boundary_rect.linewidth=0;
  a_boundary_rect.fill = 'url(#pattern-cgrid)';
  g_fig_ctx.geom.push(a_boundary_rect);

  let a_ind_fill_rect = two.makeRectangle(g0_x,g0_y,g0_w,g0_h,4);
  a_ind_fill_rect.stroke="#000";
  a_ind_fill_rect.linewidth=2;
  a_ind_fill_rect.fill = '#fff';
  g_fig_ctx.geom.push(a_ind_fill_rect);

  let a_ind_hatch_rect = two.makeRectangle(g0_x,g0_y,g0_w,g0_h,4);
  a_ind_hatch_rect.stroke="#000";
  a_ind_hatch_rect.linewidth=2;
  a_ind_hatch_rect.fill = 'url(#pattern-Rdiag)';
  g_fig_ctx.geom.push(a_ind_hatch_rect);

  let _pnt = [
    [0,170], [20,170],
    [20,100], [70,100],
    [70,13], [190,13],
    [190,0], [0,0]
  ];
          
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    _pnt[ii][0] += g0_x - g0_w/2;
    _pnt[ii][1] += g0_y - g0_h/2;
    pnt.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }

  let pnt1 = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt1.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }

  let a_det_fill_rect = two.makePath(pnt);
  a_det_fill_rect.linewidth = 1.0;
  //a_det_fill_rect.stroke = 'rgba(0,0,0,1)';
  a_det_fill_rect.stroke = 'rgb(0,0,0)';

  a_det_fill_rect.fill = '#fff';
  a_det_fill_rect.fill = RESOLVED_BG;
  g_fig_ctx.geom.push(a_det_fill_rect);

  let a_det_hatch_rect = two.makePath(pnt1);
  a_det_hatch_rect.linewidth = 2;
  //a_det_hatch_rect.stroke = 'rgba(0,0,0,1)';
  a_det_hatch_rect.stroke = 'rgb(0,0,0)';

  a_det_hatch_rect.fill = 'url(#pattern-cannonball)';
  g_fig_ctx.geom.push(a_det_hatch_rect);


  let b0_w = 90,
      b0_h = 90;
  let b0_dx = 0,
      b0_dy = 30;
  let b0_x = g0_x - g0_w/2 + b0_w/2 + b0_dx;
  let b0_y = g0_y - g0_h/2 + b0_h/2 + b0_dy;

  let block_info = {
    "x": b0_x, "y": b0_y,
    "w": b0_w, "h": b0_h,
    "dx": b0_dx, "dy": b0_dy
  };

  let a_block_rect = two.makeRectangle(b0_x,b0_y, b0_w,b0_h);

  a_block_rect.linewidth = 1;
  a_block_rect.linewidth = 3;

  //a_block_rect.stroke = "rgba(1,0,0,0.5)";
  a_block_rect.stroke = g_fig_ctx.block_edge_color;
  a_block_rect.fill = "url(#pattern-ldiag)";

  appendPostProcess( "color", a_block_rect.id );

  g_fig_ctx.geom.push(a_block_rect);


  let info = {
    "block": block_info
  };

  return info;

  //two.update();
}


function mkgrid_res(cx,cy) {
  let two = g_fig_ctx.two;

  //let cx = 50, cy = 50;

  let g0_w = 250;
  let g0_h = 190;
  let g0_x = g0_w/2 + cx;
  let g0_y = g0_h/2 + cy;

  let bg_ds = 16;
  let bg0_w = g0_w + bg_ds;
  let bg0_h = g0_h + bg_ds;
  let bg0_x = bg0_w/2+ cx - bg_ds/2;
  let bg0_y = bg0_h/2+ cy - bg_ds/2;

  // 
  let a_boundary_rect = two.makeRectangle(bg0_x,bg0_y, bg0_w,bg0_h);
  //a_boundary_rect.stroke="rgba(0,0,0,0)";
  a_boundary_rect.stroke="rgb(0,0,0)";

  a_boundary_rect.linewidth=0;
  a_boundary_rect.fill = 'url(#pattern-cgrid)';
  g_fig_ctx.geom.push(a_boundary_rect);

  let a_ind_fill_rect = two.makeRectangle(g0_x,g0_y,g0_w,g0_h,4);
  a_ind_fill_rect.stroke="#000";
  a_ind_fill_rect.linewidth=2;
  a_ind_fill_rect.fill = '#fff';
  g_fig_ctx.geom.push(a_ind_fill_rect);

  let a_ind_hatch_rect = two.makeRectangle(g0_x,g0_y,g0_w,g0_h,4);
  a_ind_hatch_rect.stroke="#000";
  a_ind_hatch_rect.linewidth=2;
  a_ind_hatch_rect.fill = 'url(#pattern-Rdiag)';
  g_fig_ctx.geom.push(a_ind_hatch_rect);

  let b0_w = 90,
      b0_h = 90;
  let b0_dx = 0,
      b0_dy = 30;
  let b0_x = g0_x - g0_w/2 + b0_w/2 + b0_dx;
  let b0_y = g0_y - g0_h/2 + b0_h/2 + b0_dy;

  let _pnt = [
    [0,170], [20,170],

    [20,b0_dy+b0_h-0],
    [70,b0_dy+b0_h-0],

    [b0_dx+b0_w,b0_dy+b0_h-0],
    [b0_dx+b0_w,b0_dy],
    [70,b0_dy],

    [70,13], [190,13],
    [190,0], [0,0]
  ];
          
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    _pnt[ii][0] += g0_x - g0_w/2;
    _pnt[ii][1] += g0_y - g0_h/2;
    pnt.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }

  let pnt1 = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt1.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }

  let a_det_fill_rect = two.makePath(pnt);
  a_det_fill_rect.linewidth = 1.0;
  //a_det_fill_rect.stroke = 'rgba(0,0,0,1)';
  a_det_fill_rect.stroke = 'rgb(0,0,0)';

  a_det_fill_rect.fill = '#fff';
  a_det_fill_rect.fill = RESOLVED_BG;
  g_fig_ctx.geom.push(a_det_fill_rect);

  let a_det_hatch_rect = two.makePath(pnt1);
  a_det_hatch_rect.linewidth = 1;
  //a_det_hatch_rect.stroke = 'rgba(0,0,0,1)';
  a_det_hatch_rect.stroke = 'rgb(0,0,0)';

  a_det_hatch_rect.fill = 'url(#pattern-cannonball)';
  g_fig_ctx.geom.push(a_det_hatch_rect);


  let block_info = {
    "x": b0_x, "y": b0_y,
    "w": b0_w, "h": b0_h,
    "dx": b0_dx, "dy": b0_dy
  };

  let highlight_block_rect = two.makeRectangle( b0_x, b0_y, b0_w, b0_h );
  highlight_block_rect.fill = "rgba(0,255,0,0.215)";
  highlight_block_rect.stroke = "rgba(100,150,100,0.5)";
  appendPostProcess( "color", highlight_block_rect.id );
  g_fig_ctx.geom.push(highlight_block_rect);

  let info = {
    "block": block_info
  };

  return info;
}


function mkgrid_erode(cx,cy) {
  let two = g_fig_ctx.two;

  //let cx = 50, cy = 50;

  let g0_w = 250;
  let g0_h = 190;
  let g0_x = g0_w/2 + cx;
  let g0_y = g0_h/2 + cy;

  let bg_ds = 16;
  let bg0_w = g0_w + bg_ds;
  let bg0_h = g0_h + bg_ds;
  let bg0_x = bg0_w/2+ cx - bg_ds/2;
  let bg0_y = bg0_h/2+ cy - bg_ds/2;

  // 
  let a_boundary_rect = two.makeRectangle(bg0_x,bg0_y, bg0_w,bg0_h);
  //a_boundary_rect.stroke="rgba(0,0,0,0)";
  a_boundary_rect.stroke="rgb(0,0,0)";
  a_boundary_rect.noStroke();

  a_boundary_rect.linewidth=0;
  a_boundary_rect.fill = 'url(#pattern-cgrid)';
  g_fig_ctx.geom.push(a_boundary_rect);

  let a_ind_fill_rect = two.makeRectangle(g0_x,g0_y,g0_w,g0_h,4);
  a_ind_fill_rect.stroke="#000";
  a_ind_fill_rect.linewidth=2;
  a_ind_fill_rect.fill = '#fff';
  g_fig_ctx.geom.push(a_ind_fill_rect);

  let a_ind_hatch_rect = two.makeRectangle(g0_x,g0_y,g0_w,g0_h,4);
  a_ind_hatch_rect.stroke="#000";
  a_ind_hatch_rect.linewidth=2;
  a_ind_hatch_rect.fill = 'url(#pattern-Rdiag)';
  g_fig_ctx.geom.push(a_ind_hatch_rect);

  let b0_w = 90,
      b0_h = 90;
  let b0_dx = 0,
      b0_dy = 30;
  let b0_x = g0_x - g0_w/2 + b0_w/2 + b0_dx;
  let b0_y = g0_y - g0_h/2 + b0_h/2 + b0_dy;

  let _pnt = [
    [0,170],
      [10,170],
      [10,165],
      [15,165],
      [15,170],
    [20,170],

      [20,160],
      [15,160],
      [15,155],
      [20,155],

      [20,130],
      [15,130],
      [15,125],
      [20,125],

    [20,100],

      [20+30+0,100-0],
      [20+30+0,100-5],
      [20+30+5,100-5],
      [20+30+5,100-0],

    [70,100],

      [70-0,100-20-0],
      [70-5,100-20-0],
      [70-5,100-20-5],
      [70-0,100-20-5],

      [70-0,100-28-0],
      [70-5,100-28-0],
      [70-5,100-28-5],
      [70-0,100-28-5],

      [70-0,100-68-0],
      [70-5,100-68-0],
      [70-5,100-68-5],
      [70-0,100-68-5],

    [70,13],

      [70+20,13-0],
      [70+20,13-5],
      [70+20+5,13-5],
      [70+20+5,13-0],

      [70+33,13-0],
      [70+33,13-5],
      [70+33+5,13-5],
      [70+33+5,13-0],

      [70+41,13-0],
      [70+41,13-5],
      [70+41+5,13-5],
      [70+41+5,13-0],

      [70+72,13-0],
      [70+72,13-5],
      [70+72+5,13-5],
      [70+72+5,13-0],

      [70+81,13-0],
      [70+81,13-5],
      [70+81+5,13-5],
      [70+81+5,13-0],

      [70+110,13-0],
      [70+110,13-5],
      [70+110+5,13-5],
      [70+110+5,13-0],

    [190,13],
    [190,0], [0,0]
  ];
          
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    _pnt[ii][0] += g0_x - g0_w/2;
    _pnt[ii][1] += g0_y - g0_h/2;
    pnt.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }

  let pnt1 = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt1.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }

  let a_det_fill_rect = two.makePath(pnt);
  a_det_fill_rect.linewidth = 1.0;
  //a_det_fill_rect.stroke = 'rgba(0,0,0,1)';
  a_det_fill_rect.stroke = 'rgb(0,0,0)';

  a_det_fill_rect.fill = '#fff';
  a_det_fill_rect.fill = RESOLVED_BG;
  g_fig_ctx.geom.push(a_det_fill_rect);

  let a_det_hatch_rect = two.makePath(pnt1);
  a_det_hatch_rect.linewidth = 1;
  //a_det_hatch_rect.stroke = 'rgba(0,0,0,1)';
  a_det_hatch_rect.stroke = 'rgb(0,0,0)';

  a_det_hatch_rect.fill = 'url(#pattern-cannonball)';
  g_fig_ctx.geom.push(a_det_hatch_rect);


  let block_info = {
    "x": b0_x, "y": b0_y,
    "w": b0_w, "h": b0_h,
    "dx": b0_dx, "dy": b0_dy
  };

  let highlight_block_rect = two.makeRectangle( b0_x, b0_y, b0_w, b0_h );
  highlight_block_rect.fill = "rgba(100,50,0,0.1)";
  highlight_block_rect.stroke = "rgba(100,50,0,0.0125)";
  appendPostProcess( "color", highlight_block_rect.id );
  g_fig_ctx.geom.push(highlight_block_rect);


  let info = {
    "block": block_info
  };

  return info;
}


function mkgrid_revert(cx,cy) {
  let two = g_fig_ctx.two;

  //let cx = 50, cy = 50;

  let g0_w = 250;
  let g0_h = 190;
  let g0_x = g0_w/2 + cx;
  let g0_y = g0_h/2 + cy;

  let bg_ds = 16;
  let bg0_w = g0_w + bg_ds;
  let bg0_h = g0_h + bg_ds;
  let bg0_x = bg0_w/2+ cx - bg_ds/2;
  let bg0_y = bg0_h/2+ cy - bg_ds/2;

  // 
  let a_boundary_rect = two.makeRectangle(bg0_x,bg0_y, bg0_w,bg0_h);
  //a_boundary_rect.stroke="rgba(0,0,0,0)";
  a_boundary_rect.stroke="rgb(0,0,0)";
  a_boundary_rect.noStroke();

  a_boundary_rect.linewidth=0;
  a_boundary_rect.fill = 'url(#pattern-cgrid)';
  g_fig_ctx.geom.push(a_boundary_rect);

  let a_ind_fill_rect = two.makeRectangle(g0_x,g0_y,g0_w,g0_h,4);
  a_ind_fill_rect.stroke="#000";
  a_ind_fill_rect.linewidth=2;
  a_ind_fill_rect.fill = '#fff';
  g_fig_ctx.geom.push(a_ind_fill_rect);

  let a_ind_hatch_rect = two.makeRectangle(g0_x,g0_y,g0_w,g0_h,4);
  a_ind_hatch_rect.stroke="#000";
  a_ind_hatch_rect.linewidth=2;
  a_ind_hatch_rect.fill = 'url(#pattern-Rdiag)';
  g_fig_ctx.geom.push(a_ind_hatch_rect);

  let b0_w = 90,
      b0_h = 90;
  let b0_dx = 0,
      b0_dy = 30;
  let b0_x = g0_x - g0_w/2 + b0_w/2 + b0_dx;
  let b0_y = g0_y - g0_h/2 + b0_h/2 + b0_dy;

  let _pnt = [
    [0,170], [20,170],

    [20,b0_dy+b0_h],
    [0,b0_dy+b0_h],

    [0, b0_dy+b0_h],
    [0,b0_dy],
    [70,b0_dy],

    [70,13], [190,13],
    [190,0], [0,0]
  ];
          
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    _pnt[ii][0] += g0_x - g0_w/2;
    _pnt[ii][1] += g0_y - g0_h/2;
    pnt.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }

  let pnt1 = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt1.push( new Two.Vector(_pnt[ii][0], _pnt[ii][1]) );
  }

  let a_det_fill_rect = two.makePath(pnt);
  a_det_fill_rect.linewidth = 1.0;
  //a_det_fill_rect.stroke = 'rgba(0,0,0,1)';
  a_det_fill_rect.stroke = 'rgb(0,0,0)';

  a_det_fill_rect.fill = '#fff';
  a_det_fill_rect.fill = RESOLVED_BG;
  g_fig_ctx.geom.push(a_det_fill_rect);

  let a_det_hatch_rect = two.makePath(pnt1);
  a_det_hatch_rect.linewidth = 1;
  //a_det_hatch_rect.stroke = 'rgba(0,0,0,1)';
  a_det_hatch_rect.stroke = 'rgb(0,0,0)';

  a_det_hatch_rect.fill = 'url(#pattern-cannonball)';
  g_fig_ctx.geom.push(a_det_hatch_rect);


  let block_info = {
    "x": b0_x, "y": b0_y,
    "w": b0_w, "h": b0_h,
    "dx": b0_dx, "dy": b0_dy
  };

  let highlight_block_rect = two.makeRectangle( b0_x, b0_y, b0_w, b0_h );
  highlight_block_rect.fill = "rgba(255,0,0,0.05)";
  highlight_block_rect.stroke = "rgba(150,100,100,0.125)";
  appendPostProcess( "color", highlight_block_rect.id );
  g_fig_ctx.geom.push(highlight_block_rect);


  let info = {
    "block": block_info
  };

  return info;
}

function _init() {
  let two = g_fig_ctx.two;

  var ele = document.getElementById("fig");
  two.appendTo(ele);

  // origin of graphics (not text and legend
  //
  let sx = 15,
      sy = 50;


  // legend
  //

  //mkLegend(815,90);
  mkLegend(740,90);
  mkText(sx, sy);

  //---

  let grid_base = mkgrid(sx,sy);

  //---
  //---
  //---

  // microscope expander
  //

  let block_dx = 220;

  let s0_x = grid_base.block.x + grid_base.block.w/2;
  let s0_y = grid_base.block.y - grid_base.block.h/2;

  let e0_x = s0_x + block_dx;
  let e0_y = s0_y - 20;

  let s1_x = grid_base.block.x + grid_base.block.w/2;
  let s1_y = grid_base.block.y + grid_base.block.h/2;
  let e1_x = s1_x + block_dx;
  let e1_y = s1_y + 40;

  let cp_f_s = 120;
  let microscope_funnel = new Two.Path([
    new Two.Anchor(s0_x,s0_y,       0,0,   cp_f_s,0, Two.Commands.curve),
    new Two.Anchor(e0_x,e0_y, -cp_f_s,0,        0,0, Two.Commands.curve),
    new Two.Anchor(e1_x,e1_y,       0,0,  -cp_f_s,0, Two.Commands.curve),
    new Two.Anchor(s1_x,s1_y,  cp_f_s,0,        0,0, Two.Commands.curve)
  ], true, false, true);
  microscope_funnel.linewidth = 1;
  microscope_funnel.stroke = "rgba(0,0,0,0.5)";
  microscope_funnel.fill = "rgba(100,100,100,0.5)";
  microscope_funnel.fill = "rgba(47,55,55,0.2)"; // 100,100,100,0.5)";

  appendPostProcess( "color", microscope_funnel.id );

  let mf_grad0 = two.makeLinearGradient( 0,0,
                                         1,0,
                                         new Two.Stop(0, "rgba(47,55,55,0.025)"),
                                         new Two.Stop(1, "rgba(47,55,55,0.3)"));
                                         //new Two.Stop(1, "rgba(167,196,151,1.0)"));
  microscope_funnel.fill = mf_grad0;

  appendPostProcess( "color", mf_grad0.id );


  two.add(microscope_funnel);

  let ul_block = [e0_x, e0_y];


  let _db = e1_y - ul_block[1];

  // connecting funnel between two block solver sttes
  //
  let _mp1 = [
    [ ul_block[0] + _db, ul_block[1]],
    [ ul_block[0] + block_dx, ul_block[1] ],
    [ ul_block[0] + block_dx, ul_block[1] + _db],
    [ ul_block[0] + _db, ul_block[1]+_db]
  ];
  let microscope_funnel1 = new Two.Path([
    new Two.Anchor(_mp1[0][0],_mp1[0][1],       0,0,   cp_f_s,0, Two.Commands.curve),
    new Two.Anchor(_mp1[1][0],_mp1[1][1], -cp_f_s,0,        0,0, Two.Commands.curve),
    new Two.Anchor(_mp1[2][0],_mp1[2][1],       0,0,  -cp_f_s,0, Two.Commands.curve),
    new Two.Anchor(_mp1[3][0],_mp1[3][1],  cp_f_s,0,        0,0, Two.Commands.curve)
  ], true, false, true);
  microscope_funnel1.linewidth = 0.0;
  //microscope_funnel1.stroke = "rgba(0,0,0,0.0)";
  microscope_funnel1.stroke = "rgba(0,0,0)";
  microscope_funnel1.noStroke();

  // documentation lies?
  //
  //let mf_grad1 = two.makeLinearGradient( _mp1[0][0], (_mp1[0][1] + _mp1[3][1])/2,
  //                                       _mp1[1][0], (_mp1[0][1] + _mp1[3][1])/2,
  let mf_grad1 = two.makeLinearGradient( 0,0,
                                         1,0,
                                         new Two.Stop(0, "rgba(47,55,55,0.1)"),
                                         new Two.Stop(1, "rgba(47,55,55,0.3)"));
                                         //new Two.Stop(1, "rgba(167,196,151,1.0)"));

  appendPostProcess( "color", mf_grad1.id );

  microscope_funnel1.fill = "rgba(100,100,100,0.5)";
  microscope_funnel1.fill = "rgba(47,55,55,0.2)"; // 100,100,100,0.5)";
  microscope_funnel1.fill = mf_grad1;

  appendPostProcess( "color", microscope_funnel1.id );

  two.add(microscope_funnel1);


  // block solver states
  //
  mkblock(ul_block[0],ul_block[1], _db,_db);
  mkblock_partial_res(ul_block[0]+block_dx, ul_block[1], _db, _db);


  //---
  //---
  //---


  let grid_dy = 280;
  mkgrid_res(sx,sy+grid_dy);
  mkgrid_erode(sx+300,sy+grid_dy);
  mkgrid_revert(sx+600,sy+grid_dy);

  //---

  // funnels
  //
  //mkblock_partial_res(ul_block[0]+block_dx, ul_block[1], _db, _db);

  let bf_w = 150,
      bf_h = 30;
  //let bf_c = [670,210];
  let bf_c = [ul_block[0]+block_dx, ul_block[1]+_db];


  let bf = [
    [bf_c[0]+0,     bf_c[1]],
    [bf_c[0]+bf_w, bf_c[1]],
    [bf_c[0]+bf_w, bf_c[1]+bf_h],
    [bf_c[0], bf_c[1]+bf_h]
  ];

  let cp_bf = 10;
  let base_funnel = new Two.Path([
    new Two.Anchor(bf[0][0],bf[0][1], 0, cp_bf, 0,0, Two.Commands.curve),
    new Two.Anchor(bf[1][0],bf[1][1], 0,0,      0,0, Two.Commands.curve),
    new Two.Anchor(bf[2][0],bf[2][1], 0,0,      0,0, Two.Commands.curve),
    new Two.Anchor(bf[3][0],bf[3][1], 0,0, 0,-cp_bf, Two.Commands.curve)
  ], true, false, true);
  base_funnel.linewidth = 0;
  base_funnel.stroke = "rgba(0,0,0,0)";
  base_funnel.fill = "rgba(47,55,55,0.2)";

  appendPostProcess( "color", base_funnel.id );


  let basefun_grad = two.makeLinearGradient(0,0.1, 0,1,
                                             new Two.Stop(0, "rgba(47,55,55,0.025)"),
                                             new Two.Stop(1, "rgba(47,55,55,0.1)"));
  base_funnel.fill = basefun_grad;

  appendPostProcess( "color", basefun_grad.id );

  two.add(base_funnel);

  // left funnel
  //

  let fun_end = 80;

  let lf_w = bf_w/3;
  let lf_ul = [bf_c[0], bf_c[1]+bf_h];
  let lf_ep = [
    [lf_ul[0],      lf_ul[1]],
    [lf_ul[0]+lf_w, lf_ul[1]],
    [lf_ul[0]-440,    lf_ul[1]+fun_end+40],
    [lf_ul[0]-440-90, lf_ul[1]+fun_end+40]
  ];
  let cp_lf = 30;
  let left_funnel = new Two.Path([
    new Two.Anchor(lf_ep[0][0],lf_ep[0][1], 0, 40, 0,0, Two.Commands.curve),
    new Two.Anchor(lf_ep[1][0],lf_ep[1][1], 0, 0, 0,80, Two.Commands.curve),
    new Two.Anchor(lf_ep[2][0],lf_ep[2][1], 0,-100,      0,0, Two.Commands.curve),
    new Two.Anchor(lf_ep[3][0],lf_ep[3][1], 0,0, 0,-120, Two.Commands.curve)
  ], true, false, true);
  left_funnel.linewidth = 0;
  left_funnel.stroke = "rgba(0,0,0,0)";
  left_funnel.fill = "rgba(47,55,55,0.2)";
  two.add(left_funnel);

  appendPostProcess( "color", left_funnel.id );


  let leftfun_grad = two.makeLinearGradient(0,0.1, 0,1,
                                             new Two.Stop(0, "rgba(47,55,55,0.1)"),
                                             new Two.Stop(0.25, "rgba(167,196,151,0.3)"),
                                             new Two.Stop(0.75, "rgba(167,196,151,0.4)"),
                                             new Two.Stop(1, "rgba(167,196,151,0.1)"));
  left_funnel.fill = leftfun_grad;

  appendPostProcess( "color", leftfun_grad.id );


  // mid funnel
  //

  let mf_w = bf_w/3;
  let mf_ul = [bf_c[0]+mf_w, bf_c[1]+bf_h];
  let mf_ep = [
    [mf_ul[0],      mf_ul[1]],
    [mf_ul[0]+mf_w, mf_ul[1]],
    [mf_ul[0]-160,    mf_ul[1]+fun_end],
    [mf_ul[0]-160-10, mf_ul[1]+fun_end]
  ];
  let cp_mf = 30;
  let mid_funnel = new Two.Path([
    new Two.Anchor(mf_ep[0][0],mf_ep[0][1], 0, 80, 0,0, Two.Commands.curve),
    new Two.Anchor(mf_ep[1][0],mf_ep[1][1], 0, 0, 0,80, Two.Commands.curve),
    new Two.Anchor(mf_ep[2][0],mf_ep[2][1], 0,-45,      0,0, Two.Commands.curve),
    new Two.Anchor(mf_ep[3][0],mf_ep[3][1], 0,0, 0,-60, Two.Commands.curve)
  ], true, false, true);
  mid_funnel.linewidth = 0;
  mid_funnel.stroke = "rgba(0,0,0,0)";
  mid_funnel.fill = "rgba(47,55,55,0.2)";

  appendPostProcess( "color", mid_funnel.id );

  let midfun_grad = two.makeLinearGradient(0,0.1, 0,1,
                                             new Two.Stop(0, "rgba(47,55,55,0.1)"),
                                             new Two.Stop(1, "rgba(233,114,76,0.9)"));
  appendPostProcess( "color", midfun_grad.id );

  mid_funnel.fill = midfun_grad;
  two.add(mid_funnel);

  // right funnel
  //

  let rf_w = bf_w/3;
  let rf_ul = [bf_c[0]+2*rf_w, bf_c[1]+bf_h];
  let rf_ep = [
    [rf_ul[0],      rf_ul[1]],
    [rf_ul[0]+rf_w, rf_ul[1]],
    [rf_ul[0]+25,    rf_ul[1]+fun_end],
    [rf_ul[0]+25-3, rf_ul[1]+fun_end]
  ];
  let cp_rf = 30;
  let right_funnel = new Two.Path([
    new Two.Anchor(rf_ep[0][0],rf_ep[0][1], 0, 50, 0,0, Two.Commands.curve),
    new Two.Anchor(rf_ep[1][0],rf_ep[1][1], 0, 0, 0,50, Two.Commands.curve),
    new Two.Anchor(rf_ep[2][0],rf_ep[2][1], 0,-30,      0,0, Two.Commands.curve),
    new Two.Anchor(rf_ep[3][0],rf_ep[3][1], 0,0, 0,-30, Two.Commands.curve)
  ], true, false, true);
  right_funnel.linewidth = 0;
  right_funnel.stroke = "rgba(0,0,0,0)";
  right_funnel.fill = "rgba(47,55,55,0.2)";

  appendPostProcess( "color", right_funnel.id );

  let rightfun_grad = two.makeLinearGradient(0,0.1, 0,1,
                                             new Two.Stop(0, "rgba(47,55,55,0.1)"),
                                             new Two.Stop(1, "rgba(255,94,91,0.9)"));
  appendPostProcess( "color", rightfun_grad.id );

  right_funnel.fill = rightfun_grad;
  two.add(right_funnel);


  //---
  //---
  //---

  two.update();

  postProcess();
}

function mk_checkerboard_path(opt) {
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

    // red beige
    //"rgba(248,112,116,0.4)",
    //"rgba(248,235,187,0.5)"

    "rgba(152,119,182,0.5)",
    "rgba(228,220,242,0.5)"

    //"rgba(200,255,200,0.7)",
    //"rgba(255,200,200,0.9)"
  ];

  let _p = opt.path;

  //let _p = [ [0,0], [0,1], [1,1], [1,0], [2,0], [2,1] ];

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
      //rect.fill = "rgba(255, 200, 200, 1)";
      rect.fill = "rgba(255, 200, 200, 1)";
      rect.fill = color[ parity ];
      two.add(rect);

    }
  }

  let path_r = 8.5;
  let path_color = "rgba(60,60,120,1)";


  //path_color = "rgba(180,170,239,1)";

  // this
  //path_color = "rgba(118,114,223,1)";
  path_color = "rgba(80,80,140,1)";

  //path_color = "rgba(159,226,235,1)";
  //path_color = "rgba(107,202,215,1)";

  //path_color = "rgba(166,197,237,1)";
  //path_color = "rgba(117,162,219,1)";

  let w_p = [];
  for (let idx = 0; idx < _p.length; idx++) {
    w_p.push( [ sx + _p[idx][0]*x_len, sy + _p[idx][1]*y_len ] );

    //let path_step = two.makeCircle( w_p[idx][0], w_p[idx][1], path_r) ;
    //path_step.fill = path_color;
    //path_step.linewidth = 0;
    //two.add( path_step );

  }

  let np_center = {};
  if (("nopath" in opt) &&
      (opt.nopath)) {
    np_center = w_p.pop();
  }

  let tv_path = makeTwoVector(w_p);
  let t_path = two.makePath(tv_path, true);
  t_path.fill = "rgba(0,0,0,0)";
  t_path.linewidth = 10;
  t_path.stroke = path_color;
  t_path.cap = 'round';
  t_path.join = 'round';

  //two.add(t_path);

  let start_circle = two.makeCircle( w_p[0][0], w_p[0][1], path_r );
  start_circle.fill = path_color;
  //start_circle.fill = "rgba(120,120,240,1)";
  //start_circle.fill = "rgba(180,240,180,1)";
  //start_circle.fill = "rgba(180,240,180,1)";
  start_circle.linewidth = 0;
  start_circle.stroke = path_color;

  if (("end_circle" in opt) &&
      (opt.end_circle)) {
    let n = w_p.length-1;
    let end_circle = two.makeCircle( w_p[n][0], w_p[n][1], path_r );
    //end_circle.fill = "rgba(120,120,240,1)";
    end_circle.fill = path_color;
    end_circle.linewidth = 0;
    end_circle.stroke = path_color;
  }

  if (("nopath" in opt) &&
      (opt.nopath)) {

    let alpha = [
      0.8*Math.sqrt(2)*x_len/8,
      0.8*Math.sqrt(2)*y_len/8
    ];

    let co = "rgba(255,81,53,1)";
    co = "rgba(255,110,88,1)";
    co = "rgba(241,3,31,1)";
    co = "rgba(245,52,74,1)";
    co = "rgba(252,74,3,1)";
    co = "rgba(252,41,3,1)";

    co  = "rgba(162,47,26,1)";
    co  = "rgba(255,40,0,1)";
    co  = "rgba(250,42,0,.9)";
    co  = "rgba(236,0,51,0.99)";
    co  = "rgba(190,0,41,1)";

    co = "rgba(252,37,3,0.95)"; //!

    let lw = 8;

    let pnt_cross_a = [
      [np_center[0] + alpha[0], np_center[1] + alpha[1]],
      [np_center[0] - alpha[0], np_center[1] - alpha[1]]
    ];
    let cross_a = makeTwoVector(pnt_cross_a);

    let ca = two.makePath(cross_a);
    ca.linewidth = lw;
    ca.stroke = co;
    ca.cap = 'round';
    ca.join = 'round';

    let pnt_cross_b = [
      [np_center[0] + alpha[0], np_center[1] - alpha[1]],
      [np_center[0] - alpha[0], np_center[1] + alpha[1]]
    ];
    let cross_b = makeTwoVector(pnt_cross_b);

    let cb = two.makePath(cross_b);
    cb.linewidth = lw;
    cb.stroke = co;
    cb.cbp = 'round';
    cb.join = 'round';

  }


  two.update();
}

function init() {
  let two = g_fig_ctx.two;

  var ele = document.getElementById("fig");
  two.appendTo(ele);

  //two.update();

  let square_size = 50;


  // y+ is downwards
  //
  let sx = 50,
      sy = 50,
      cur_x = 50,
      cur_y = 50,
      dx = 200,
      dy = 200;

  // path creep fudge
  let pcf = 0.35;
  pcf = 0.45;

  //cur_x += dx;
  cur_x = sx;
  let opt_2x2_ul = {
    "sx": cur_x, "sy": cur_y,
    "nx": 2, "ny": 2,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,1], [1,1], [1,0], [0,0] ]
  };
  mk_checkerboard_path(opt_2x2_ul);
  cur_x += dx - (3*square_size/2);

  let opt_2x2_lr = {
    "sx": cur_x, "sy": cur_y,
    "nx": 2, "ny": 2,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,1], [0,0], [1,0], [1,1] ]
  };
  mk_checkerboard_path(opt_2x2_lr);
  cur_x += dx - (3*square_size/2);

  let opt_2x2_np = {
    "sx": cur_x, "sy": cur_y,
    "nx": 2, "ny": 2,
    "nopath": true,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,1], [0,pcf],  [1,0] ]
    //"path": [ [0,1], [0,0], [1,0], [1,1] ]
  };
  mk_checkerboard_path(opt_2x2_np);
  //cur_x += dx - square_size;

  cur_x = sx;
  cur_y += dy - (3*square_size/2);
  let opt_2x3_ur = {
    "sx": cur_x, "sy": cur_y,
    "nx": 2, "ny": 3,
    "initial_parity": 1,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,2], [1,2], [1,1], [0,1], [0,0], [1,0] ]
  };
  mk_checkerboard_path(opt_2x3_ur);
  cur_x += dx - (3*square_size/2);

  let opt_2x3_lr= {
    "sx": cur_x, "sy": cur_y,
    "nx": 2, "ny": 3,
    "initial_parity": 1,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,2], [0,1], [0,0], [1,0], [1,1], [1,2] ]
  };
  mk_checkerboard_path(opt_2x3_lr);
  cur_x += dx - (3*square_size/2);

  let opt_2x3_np = {
    "sx": cur_x, "sy": cur_y,
    "nx": 2, "ny": 3,
    "nopath": true,
    "initial_parity": 1,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,2], [1,2], [1,1+pcf], [0,0] ]
    //"path": [ [0,2], [0,1], [0,0], [1,0], [1,1], [1,2] ]
  };
  mk_checkerboard_path(opt_2x3_np);
  cur_x += dx;


  cur_x = sx;
  cur_y += dy - (1*square_size/2);
  let opt_3x2_ur = {
    "sx": cur_x, "sy": cur_y,
    "nx": 3, "ny": 2,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,1], [0,0], [1,0], [1,1], [2,1], [2,0] ]
  };
  mk_checkerboard_path(opt_3x2_ur);
  cur_x += dx - (square_size/2);

  let opt_3x2_ul = {
    "sx": cur_x, "sy": cur_y,
    "nx": 3, "ny": 2,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,1], [1,1], [2,1], [2,0], [1,0], [0,0] ]
  };
  mk_checkerboard_path(opt_3x2_ul);
  cur_x += dx - (square_size/2);

  let opt_3x2_np = {
    "sx": cur_x, "sy": cur_y,
    "nx": 3, "ny": 2,
    "nopath": true,
    "x_len": square_size, "y_len": square_size,
    "path": [ [0,1], [0,0], [1-pcf,0], [2,1] ]
    //"path": [ [0,1], [1,1], [2,1], [2,0], [1,0], [0,0] ]
  };
  mk_checkerboard_path(opt_3x2_np);
  cur_x += dx;



  cur_x = sx;
  cur_y += dy - (3*square_size/2);
  let opt_3x3_ur = {
    "sx": cur_x, "sy": cur_y,
    "nx": 3, "ny": 3,
    "x_len": square_size, "y_len": square_size,
    "path": [
      [0,2], [0,1], [0,0],
      [1,0], [1,1], [1,2],
      [2,2], [2,1], [2,0]
      ]
  };
  mk_checkerboard_path(opt_3x3_ur);
  cur_x += dx - (square_size/2);

  let opt_3x3_ul = {
    "sx": cur_x, "sy": cur_y,
    "nx": 3, "ny": 3,
    "x_len": square_size, "y_len": square_size,
    "path": [
      [0,2], [0,1], [1,1], [1,2],
      [2,2], [2,1], [2,0], [1,0], [0,0]
      ]
  };
  mk_checkerboard_path(opt_3x3_ul);
  cur_x += dx - (square_size/2);

  let opt_3x3_lr = {
    "sx": cur_x, "sy": cur_y,
    "nx": 3, "ny": 3,
    "x_len": square_size, "y_len": square_size,
    "path": [
      [0,2], [1,2], [1,1], [0,1],
      [0,0], [1,0], [2,0], [2,1], [2,2]
      ]
  };
  mk_checkerboard_path(opt_3x3_lr);


}

function _dl() {
  var ele = document.getElementById("fig");
  let defs = document.getElementById("custom_defs");

  // very hacky, find the defs definition, take the defs
  // from the html and insert them here.
  // Probably should define the patterns in this file and
  // use two.js to append them...
  //
  let _defs = "<defs>";
  let svg_txt = ele.innerHTML;
  let pos = svg_txt.search("<defs>");

  let fin_txt = svg_txt.slice(0,pos);
  fin_txt +=  "<defs>";
  fin_txt += defs.innerHTML;
  fin_txt += svg_txt.slice(pos + _defs.length);

  var b = new Blob([ fin_txt ]);
  saveAs(b, "fig.svg");


}


