
var g_ui = {
  "ulhp": ulhp,
  "two": new Two({"fitted":true})
};

function _Line(x0,y0, x1,y1, lco, lw, alpha) {
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
      if (grid_code[idx] == '.') { continue; }

      let screen_iy = size[1] - 1 - y;

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
                 xy_origin[0] + (scale*nei_xy_screen[0]), xy_origin[1] + (scale*nei_xy_screen[1]),
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

function webinit() {
  let two = g_ui.two;

  var ele = document.getElementById("ui_canvas");
  two.appendTo(ele);

  ulhp.custom( ulhp.grid_info );

  let grid_hook = {
    "grid" : ulhp.grid_info.grid_deg2,
    "size": ulhp.grid_info.size
  };

  let disp_opt = {
    "origin" : [50,50],
    "scale": 20
  };

  drawGridHook( grid_hook, disp_opt );

  let dual_disp_opt = {
    "scale": 20,
    "origin" : [50-20, 50-40],
    "cell_s": 15
  };

  ulhp.dual( ulhp.grid_info );

  drawDualCell( ulhp.grid_info.dualG, dual_disp_opt );

}
