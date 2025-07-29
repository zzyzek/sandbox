
var g_ui = {
  "ulhp": ulhp,
  "two": new Two({"fitted":true}),
  
  "option": {
    "grid": true,
    "dual": true,
    "dep": true

  }
};

function _Line(x0,y0, x1,y1, lco, lw, alpha) {
  lco = ((typeof lw === "undefined") ? "#111" : lco);
  lw = ((typeof lw === "undefined") ? 2 : lw);
  alpha = ((typeof alpha === "undefined") ? 1 : alpha);

  let two = g_ui.two;

  let _l = two.makeLine(x0,y0, x1,y1);
  _l.linewidth = lw;
  _l.fill = "rgb(0,0,0)";
  _l.stroke = lco;
  //_l.cbp = 'round';
  _l.join = 'bevel';
  _l.cap = 'square';

  _l.opacity = alpha;

  return _l;
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


// just the arrow, not the line with the arrow
//
function mkarrow(px, py, dx, dy, w, h, lco, lw, alpha) {
  lco = ((typeof lw === "undefined") ? "#111" : lco);
  lw = ((typeof lw === "undefined") ? 3 : lw);
  alpha = ((typeof alpha === "undefined") ? 1 : alpha);

  let two = g_ui.two;

  let theta = Math.atan2(-dy,dx);
  theta += Math.PI/2;

  let ct = Math.cos(theta);
  let st = Math.sin(theta);

  let w2 = w/2;

  let q0 = [  ct*w2 - st*h, -st*w2 - ct*h ];
  let q1 = [ -ct*w2 - st*h,  st*w2 - ct*h ];

  let hh = h*0.95;

  let qm = [  ct*0  - st*hh, -st*0  - ct*hh ];

  q0[0] += px;
  q0[1] += py;

  q1[0] += px;
  q1[1] += py;
  
  qm[0] += px;
  qm[1] += py;

  let anch = makeTwoAnchor( [ [px,py], q0, qm, q1 ] );

  let _p = two.makePath( anch );

  _p.linewidth = lw;

  _p.stroke = lco;;
  _p.fill = lco;;
  _p.join = "round";
  _p.opacity = alpha;

  return _p;
}


function drawDep( grid_info, disp_opt ) {
  let xy_origin = (("origin" in disp_opt) ? disp_opt.origin : [0,0]);
  let scale = (("scale" in disp_opt) ? disp_opt.scale : 20 );
  let cell_s = (("cell_s" in disp_opt) ? disp_opt.cell_s: 20 );

  let two = g_ui.two;

  let grid_hook = grid_info.grid_hook;
  let size = grid_info.size;

  let idx2xy = ulhp.idx2xy;
  let xy2idx = ulhp.xy2idx;

  let dx = scale/2;
  let dy = scale/2;

  // inverted y
  //
  let dxy_idir = [
    [cell_s, 0], [-cell_s, 0],
    [0,-cell_s], [0,cell_s]
  ];

  let shrink = [ 1/8, 9/8 ];

  for (let y = (size[1]-1); y >= 0; y--) {
    for (let x = 0; x< size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      let screen_iy = size[1] - 1 - y;

      let vtx_hook = grid_hook[idx];

      if (vtx_hook == 0) { continue; }

      for (let idir=0; idir<4; idir++) {
        if ((vtx_hook & (1<<idir)) == 0) { continue; }

        let du = [ dxy_idir[idir][0] * shrink[0], dxy_idir[idir][1] * shrink[0] ];
        let dv = [ dxy_idir[idir][0] * shrink[1], dxy_idir[idir][1] * shrink[1] ];

        _Line( xy_origin[0] + (scale*x) + dx + du[0],
               xy_origin[1] + (scale*screen_iy) + dy + du[1],
               xy_origin[0] + (scale*x) + dx + dv[0],
               xy_origin[1] + (scale*screen_iy) + dy + dv[1],
               "#111", 1, 0.4 );

        mkarrow( xy_origin[0] + (scale*x) + dx + dv[0],
                 xy_origin[1] + (scale*screen_iy) + dy + dv[1],
                 dv[0], dv[1],
                 cell_s/3, cell_s/6, "#111", 1, 0.25 );
      }

    }
  }

  two.update();
}

function drawDualCell( grid_info, disp_opt ) {
  let xy_origin = (("origin" in disp_opt) ? disp_opt.origin : [0,0]);
  let scale = (("scale" in disp_opt) ? disp_opt.scale : 20 );
  let cell_s = (("cell_s" in disp_opt) ? disp_opt.cell_s: 20 );

  let two = g_ui.two;

  let grid_code = grid_info.grid_code;
  let size = grid_info.size;

  let idx2xy = ulhp.idx2xy;
  let xy2idx = ulhp.xy2idx;

  let dx = scale/2;
  let dy = scale/2;

  let opacity = 0.25;

  let fill_lookup = {
    "-": "#b33", "|": "#b33",
    ">": "#11b", "<": "#11b", "^": "#11b", "v": "#11b",
    "F": "#1b1", "J": "#1b1", "7": "#1b1", "L": "#1b1",
    "c": "#aaa", "p": "#aaa", "n": "#aaa", "u": "#aaa"
  };

  for (let y = (size[1]-1); y >= 0; y--) {
    for (let x = 0; x< size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      let screen_iy = size[1] - 1 - y;

      let d = two.makeCircle( xy_origin[0] + (scale*x) + dx,
                              xy_origin[1] + (scale*screen_iy) + dy,
                              0.25 );
      d.fill = "#000";

      if (grid_code[idx] == '.') { continue; }

      let c = two.makeRectangle( xy_origin[0] + (scale*x) + dx,
                                 xy_origin[1] + (scale*screen_iy) + dy,
                                 cell_s, cell_s );
      c.fill = fill_lookup[ grid_code[idx] ];
      c.opacity = opacity;
      c.linewidth = 0;

    }
  }


  two.update();
}

function drawGridHook( grid_info, disp_opt ) {

  let xy_origin = (("origin" in disp_opt) ? disp_opt.origin : [0,0]);
  let scale = (("scale" in disp_opt) ? disp_opt.scale : 20 );
  let vertex_diam = (("vertex_diam" in disp_opt) ? disp_opt.vertex_diam: 5 );

  let two = g_ui.two;

  let grid = grid_info.grid;
  let size = grid_info.size;

  let idx2xy = ulhp.idx2xy;
  let xy2idx = ulhp.xy2idx;

  let xy_idir = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  let fudge_idir = [
    [-1/2,0], [1/2,0],
    [0,1/2], [0,-1/2]
  ];

  for (let y = (size[1]-1); y >= 0; y--) {
    for (let x = 0; x< size[0]; x++) {
      let idx = xy2idx( [x,y], size );
      if (grid[idx] < 0) { continue; }

      let vtx_parity = (x+y)%2;
      let screen_iy = size[1] - 1 - y;

      // lines first to draw under vertex shapes
      //
      for (let idir=0; idir<4; idir++) {
        if (grid[idx] & (1<<idir)) {
          let nei_xy = [ x + xy_idir[idir][0]/2, y + xy_idir[idir][1]/2 ];

          let nei_xy_screen = [nei_xy[0], size[1]-1-nei_xy[1]];

          _Line( xy_origin[0] + (scale*x), xy_origin[1] + (scale*screen_iy),
                 xy_origin[0] + (scale*nei_xy_screen[0]) + fudge_idir[idir][0],
                 xy_origin[1] + (scale*nei_xy_screen[1]) + fudge_idir[idir][1],
                 "#111", 1 );
        }
      }

      if (vtx_parity) {
        let c = two.makeCircle( xy_origin[0] + (scale*x),
                                xy_origin[1] + (scale*screen_iy),
                                vertex_diam/2 );
        c.fill = "#333";
        c.stroke = "#333";

        //c.fill = "#b33";
        //c.stroke = "#b33";
      }
      else {
        let c = two.makeRectangle( xy_origin[0] + (scale*x),
                                xy_origin[1] + (scale*screen_iy),
                                vertex_diam, vertex_diam );
        //c.fill = "#555";
        //c.stroke = "#555";
      }

    }
  }



  two.update();
  return;
}

function redrawCustom() {
  let two = g_ui.two;

  let scale = 30;

  var ele = document.getElementById("ui_canvas");
  two.appendTo(ele);

  ulhp.custom( ulhp.grid_info );

  let grid_hook = {
    "grid" : ulhp.grid_info.grid_deg2,
    "size": ulhp.grid_info.size
  };

  let disp_opt = {
    "origin" : [50,50],
    "scale": scale
  };

  drawGridHook( grid_hook, disp_opt );

  //---

  let dual_disp_opt = {
    "scale": scale,
    "origin" : [50-scale, 50-scale],
    "cell_s": (3*scale/4)
  };

  ulhp.dual( ulhp.grid_info );

  console.log( ulhp.grid_info.dualG );

  drawDualCell( ulhp.grid_info.dualG, dual_disp_opt );

  //---

  let dep_disp_opt = {
    "scale": scale,
    "origin" : [50-scale, 50-scale],
    "cell_s": (3*scale/4)
  };


  drawDep( ulhp.grid_info.depG, dep_disp_opt );

}

function ui_input(ui_id) {

  let opt_val = "";

  if (ui_id == "ui_cb_grid") { opt_val = "grid"; }
  if (ui_id == "ui_cb_dual") { opt_val = "dual"; }
  if (ui_id == "ui_cb_dep") { opt_val = "dep"; }

  if (opt_val == "") { return; }

  let ele = document.getElementById(ui_id);
  if (ele.checked) { g_ui.option[opt_val] = true; }
  else if (!ele.checked) { g_ui.option[opt_val] = false; }
}

function webinit() {
  redrawCustom();
}
