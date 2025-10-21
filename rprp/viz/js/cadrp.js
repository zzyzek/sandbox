var g_ui = {
  "data" : {
    "grid_size": 20,
    "grid_snap_threshold" : 5,
    "end_snap_threshold" : 10,

    "orientation": 0,
    "orientation_description": [ "horizontal", "vertical" ],

    "cursor": [0,0],

    "pgn_state": "open",
    "pgn": [],

    "rprp_info_ready": false,
    "rprp_info": {}
  },

  "mode_bg_pattern" : {
    "draw": "pattern26",
    "grab": "pattern3",
    "grid": "pattern18",
    "cut": "pattern16",
    "region": "pattern38"
  },

  "historic_queue_id" : 0,

  "snap_to_grid": true,

  "mode": "draw",
  "mode_modifier" : "",

  "mode_data": {
    "grab": { "d_idx": -1, "p_idx": [-1,-1] },
    "cut" : { "dir_code" : "h", "update_dir_code" : false, "l_cut": [ [[0,0], [0,0]], [[0,0],[0,0]] ], "B_idx_cut": [-1,-1], "ready": false },
    "rect": { "G_idx_R" : [-1, -1], "pR": [ [0,0], [0,0], [0,0], [0,0] ], "ready": false }

  },

  "state": "idle",
  "state_description" : [ "drawing", "idle", "delete" ],

  "viz_opt" : {
    "show_ij": false,
    "show_Js": true,
    "show_Je": false,
    "show_B": true
  },

  "ready": false,
  "two" : new Two({"fitted":true})
};

function _vcmp(a,b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return 1; }
  if (a[1] < b[1]) { return -1; }
  if (a[1] > b[1]) { return 1; }
  return 0;
}

// polygon to array
// finds origin from lower left point,
// does y inversion from display to world/actual,
// rescales by grid size (pixel to world)
//
function pgn2a() {
  let orig_pgn = g_ui.data.pgn;
  let pgn = [];
  let res_pgn = [];
  let origin_xy = [0,0];

  if (orig_pgn.length == 0) { return []; }

  // start at lex min (y reversed for two, so revree here)
  // then walk the perimeter and remove colinear points.
  //
  let start_idx = 0;
  let start_xy = [ orig_pgn[0][0], -orig_pgn[0][1] ];
  for (let i=0; i<orig_pgn.length; i++) {
    let u = [ orig_pgn[i][0], -orig_pgn[i][1] ];
    if ( _vcmp(u, start_xy) < 0 ) {
      start_idx = i;
      start_xy[0] = orig_pgn[i][0];
      start_xy[1] = -orig_pgn[i][1];
    }
  }

  let orig_n = orig_pgn.length;
  for (let i=0; i<orig_pgn.length; i++) {
    let prv_idx = (start_idx+i+orig_n-1)%orig_n;
    let cur_idx = (start_idx+i+orig_n+0)%orig_n;
    let nxt_idx = (start_idx+i+orig_n+1)%orig_n;

    let p = orig_pgn[cur_idx];
    if ( ((orig_pgn[prv_idx][0] == p[0]) && (orig_pgn[nxt_idx][0] == p[0])) ||
         ((orig_pgn[prv_idx][1] == p[1]) && (orig_pgn[nxt_idx][1] == p[1])) ) {
      continue;
    }

    pgn.push( orig_pgn[cur_idx] );
  }

  // reverse y, remember min,
  // move relative to origin, and divide
  // by grid size to get nice integral
  // coordinates.
  //
  for (let i=0; i<pgn.length; i++) {

    let p = [ pgn[i][0], -pgn[i][1] ];
    res_pgn.push( p );
    if (i==0) {
      origin_xy[0] = res_pgn[i][0];
      origin_xy[1] = res_pgn[i][1];
    }

    if (res_pgn[i][0] < origin_xy[0]) { origin_xy[0] = res_pgn[i][0]; }
    if (res_pgn[i][1] < origin_xy[1]) { origin_xy[1] = res_pgn[i][1]; }
  }

  for (let i=0; i<pgn.length; i++) {
    res_pgn[i][0] -= origin_xy[0];
    res_pgn[i][1] -= origin_xy[1];

    res_pgn[i][0] /= g_ui.data.grid_size;
    res_pgn[i][1] /= g_ui.data.grid_size;
  }

  return res_pgn;
}

function pgnBBox(p) {
  let bb = [[p[0][0],p[0][1]], [p[0][0],p[0][1]]];

  for (let i=1; i<p.length; i++) {
    bb[0][0] = Math.min( bb[0][0], p[i][0] );
    bb[0][1] = Math.min( bb[0][1], p[i][1] );
    bb[1][0] = Math.max( bb[1][0], p[i][0] );
    bb[1][1] = Math.max( bb[1][1], p[i][1] );
  }

  return bb;
}

function a2pgn(p, _px_origin, _gs) {
  let two = g_ui.two;
  let gs = ((typeof _gs === "undefined") ? g_ui.data.grid_size : _gs );

  let bb = [[p[0][0],p[0][1]], [p[0][0],p[0][1]]];

  for (let i=1; i<p.length; i++) {
    bb[0][0] = Math.min( bb[0][0], p[i][0] );
    bb[0][1] = Math.min( bb[0][1], p[i][1] );
    bb[1][0] = Math.max( bb[1][0], p[i][0] );
    bb[1][1] = Math.max( bb[1][1], p[i][1] );
  }

  let idxy = [ bb[1][0] - bb[0][0], bb[1][1] - bb[0][1] ];

  let mid_px_xy = [ two.width / 2, two.height / 2 ];
  let _px_o = [
    Math.floor( (mid_px_xy[0]/gs) - (idxy[0]/2) ) * gs,
    Math.floor( (mid_px_xy[1]/gs) + (idxy[1]/2) ) * gs
  ];
  if (typeof _px_origin !== "undefined") { _px_o = _px_origin; }

  let px_xy = [];
  for (let i=0; i<p.length; i++) {
    px_xy.push([
       p[i][0]*gs + _px_o[0],
      -p[i][1]*gs + _px_o[1]
    ]);
  }

  return px_xy;

}

//---
//---
//---

function ui_mode(_mode) {
  if (_mode == "save") {
    update_textarea(true);
    return;
  }

  g_ui.mode = _mode;
  g_ui.mode_modifier = "";

  if (g_ui.mode == "grab")  { g_ui.mode_modifier = "select"; }
  if (g_ui.mode == "grid")  { populate_grid(); }
  if (g_ui.mode == "cut")   { g_ui.mode_modifier = "select"; g_ui.mode_data.cut.ready = false; }
  if (g_ui.mode == "load")  { load_pgn(); }
  if (g_ui.mode == "rect")  { g_ui.mode_modifier = "select_begin"; g_ui.mode_data.rect.ready = false; }


  // button background pattern updates
  //

  let bg_patt_name = g_ui.mode_bg_pattern[ _mode ];

  let ele = document.getElementById("ui_mode");

  for (let _mt in g_ui.mode_bg_pattern) {
    ele.classList.remove( g_ui.mode_bg_pattern[_mt] );
  }
  ele.classList.add( bg_patt_name );

  redraw();
}

function load_historic(s) {

  // popluate current with historic
  //
  let ele = document.getElementById("ui_textarea");
  ele.value = s;

  // hacky way of getting out our array of data points
  //
  let a_str = s.replace(/\n/g, ' ').replace( /^.*= */, '' ).replace( / *; *$/, '' ).replace( /,[ \n]*\]$/, ']' );

  let ga_pgn = JSON.parse(a_str);

  px_pgn = a2pgn(ga_pgn);

  g_ui.data.pgn = px_pgn;
  g_ui.data.pgn_state = "closed";

  redraw();
}

function load_pgn() {
  let ele = document.getElementById("ui_textarea");

  load_historic( ele.value );

  //let pgn_txt = ele.value.replace(/^.*= */, '').replace(/;/g, '').replace( /\] *,[ \n]*\] *$/, ']]');
  //console.log(pgn_txt );
  //let v = JSON.parse(pgn_txt);
  //console.log(pgn_txt, v);

}

function update_textarea(add_to_queue) {
  add_to_queue = ((typeof add_to_queue === "undefined") ? false : add_to_queue);

  let a = pgn2a();
  let txt_lines = ["var pgn = ["];

  let txt_ele_a = [];
  for (let i=0; i<a.length; i++) {

    txt_ele_a.push( "[" + a[i][0].toString() + "," + a[i][1].toString() + "]," );
    if (txt_ele_a.length == 4) {
      txt_lines.push("  " + txt_ele_a.join(" "));
      txt_ele_a = [];
    }

  }

  if (txt_ele_a.length > 0) {
    txt_lines.push("  " + txt_ele_a.join(" "));
  }

  txt_lines.push("];");

  if (add_to_queue) {

    let ui_list = document.getElementById("ui_historic");

    let _r = document.createElement("div");

    ui_list.appendChild(_r);

    let _cb = document.createElement("div");
    _cb.classList.add("two");
    _cb.classList.add("columns");

    _r.appendChild(_cb);

    let _b = document.createElement("button");
    _b.onclick = (function(a) { return function() { load_historic(a); } })(txt_lines.join(""));
    _b.innerHTML = "load";

    _cb.appendChild(_b);


    let _ct = document.createElement("div");
    _ct.classList.add("ten");
    _ct.classList.add("columns");

    _r.appendChild(_ct);

    let _t = document.createElement("textarea");
    _t.style.width = '100%';
    _t.style.height = '50%';
    _t.value = txt_lines.join("");

    _ct.appendChild(_t);



  }

  let ele = document.getElementById("ui_textarea");
  ele.value = txt_lines.join("\n");
}

// WIP
function _draw_rprp_grid() {
  if (!("Gv" in g_ui.data.rprp_info)) { return; }
  let two = g_ui.two;

  let rprp_info = g_ui.data.rprp_info;

  let px_pgn = g_ui.data.pgn;
  let gs = g_ui.data.grid_size;

  let Gv = rprp_info.Gv;
  let Sx = rprp_info.Sx;
  let Sy = rprp_info.Sy;

  let Js = rprp_info.Js;
  let Je = rprp_info.Je;

  let B = rprp_info.B;

  let B2d = rprp_info.B_2d;

  let _dashes = [4,4];

  let _oxy = [px_pgn[0][0], px_pgn[0][1]];
  for (let i=1; i<px_pgn.length; i++) {
    _oxy[0] = Math.min( _oxy[0], px_pgn[i][0] );
    _oxy[1] = Math.max( _oxy[1], px_pgn[i][1] );
  }

  let grid_pnt = [];
  let grid_ij = [];

  for (let iy=1; iy < Gv.length; iy++) {
    for (let ix=1; ix < Gv[iy].length; ix++) {
      if (Gv[iy][ix].G_idx < 0) { continue; }

      let p_cur = Gv[iy][ix].xy;

      // Sx and Sy hold longest run in x or y direction
      // (from left to right, down to top)
      // so we can use it to know if we're inside the polygon.
      // If we're on a border, we don't want to trace out
      // the internal grid lines, so we check to see if
      // either grid point is *not* on the border and
      // in the case they both *are* on the border, we
      // check to make sure they're not right next to each other.
      //
      // display has y reversed, which is why we do the negation
      // when making the draw line
      //
      if ( (Sy[iy][ix] > 0) &&
           ((B2d[iy][ix] < 0) || (B2d[iy-1][ix] < 0) ||
           (Math.abs(B2d[iy][ix] - B2d[iy-1][ix]) > 1)) ) {
        let p_prv = Gv[iy-1][ix].xy;

        let lv = two.makeLine(
           p_cur[0]*gs + _oxy[0],
          -p_cur[1]*gs + _oxy[1],
           p_prv[0]*gs + _oxy[0],
          -p_prv[1]*gs + _oxy[1]
        );

        lv.dashes = _dashes;
        lv.linewidth = 2;

        if (Sy[iy-1][ix] == 0) {
          grid_pnt.push([
           p_prv[0]*gs + _oxy[0],
          -p_prv[1]*gs + _oxy[1]
          ]);

          grid_ij.push( [ix, iy-1] );
        }

        grid_pnt.push([
          p_cur[0]*gs + _oxy[0],
         -p_cur[1]*gs + _oxy[1]
        ]);

        grid_ij.push( [ix, iy] );

      }

      else {
        //console.log("skipping", ix, iy, "Sy:", Sy[iy][ix], "B2d[iy][ix]:", B2d[iy][ix], "B2d[iy-1][ix]:", B2d[iy-1][ix]);
      }

      if ( (Sx[iy][ix] > 0) &&
           ((B2d[iy][ix] < 0) || (B2d[iy][ix-1] < 0) ||
           (Math.abs(B2d[iy][ix] - B2d[iy][ix-1]) > 1)) ) {
        let p_prv = Gv[iy][ix-1].xy;

        let lh = two.makeLine(
           p_cur[0]*gs + _oxy[0],
          -p_cur[1]*gs + _oxy[1],
           p_prv[0]*gs + _oxy[0],
          -p_prv[1]*gs + _oxy[1]
        );

        lh.dashes = _dashes;
        lh.linewidth = 2;

        if (Sx[iy][ix-1] == 0) {
          grid_pnt.push([
            p_prv[0]*gs + _oxy[0],
           -p_prv[1]*gs + _oxy[1]
          ]);

          grid_ij.push( [ix-1, iy] );
        }

        grid_pnt.push([
          p_cur[0]*gs + _oxy[0],
         -p_cur[1]*gs + _oxy[1]
        ]);

        grid_ij.push( [ix, iy] );
      }

      else {
        //console.log("skipping", ix, iy, "Sx:", Sx[iy][ix], "B2d[iy][ix]:", B2d[iy][ix], "B2d[iy][ix-1]:", B2d[iy][ix-1]);
      }


    }
  }

  let _style = {
    "fill": "rgb(128,128,0)",
    "size": 7
  };

  let _style1 = {
    "fill": "rgb(128,64,0)",
    "size": 7
  };

  let idir_offset = [
    [12,-4, 0],
    [-12,6, 0],
    [-5, -10, -Math.PI/2 ],
    [6,  10,  Math.PI/2 ]
  ];

  for (let i=0; i<grid_pnt.length; i++) {
    let _c = two.makeCircle( grid_pnt[i][0], grid_pnt[i][1], 3 );

    let _txt = grid_ij[i][0].toString() + "," + grid_ij[i][1].toString();
    let _txy = [
      grid_pnt[i][0] + 12,
      grid_pnt[i][1] + 8
    ];

    let _b = [grid_pnt[i][0], grid_pnt[i][1]];

    if (g_ui.viz_opt.show_ij) {
      let _t = two.makeText( _txt, _txy[0], _txy[1], _style );
    }

  }

  for (let j=0; j<Gv.length; j++) {
    for (let i=0; i<Gv[j].length; i++) {

      let _b = [
        Gv[j][i].xy[0]*gs + _oxy[0],
       -Gv[j][i].xy[1]*gs + _oxy[1]
      ];

      if (g_ui.viz_opt.show_Js) {
        for (let idir=0; idir<4; idir++) {
          let v = Js[idir][j][i];
          if (v>=0) {
            let _tj = two.makeText( v.toString(), _b[0] + idir_offset[idir][0], _b[1] + idir_offset[idir][1], _style1 );
            _tj.rotation = idir_offset[idir][2];
          }
        }
      }

      if (g_ui.viz_opt.show_Je) {
        for (let idir=0; idir<4; idir++) {
          let v = Je[idir][j][i];
          if (v>=0) {
            let _tj = two.makeText( v.toString(), _b[0] + idir_offset[idir][0], _b[1] + idir_offset[idir][1], _style1 );
            _tj.rotation = idir_offset[idir][2];
          }
        }
      }

    }

  }

  if (g_ui.viz_opt.show_B) {
    for (let b_idx=0; b_idx < B.length; b_idx++) {
      let bxy = [
        B[b_idx].xy[0]*gs + _oxy[0],
       -B[b_idx].xy[1]*gs + _oxy[1]
      ];
      let _tb = two.makeText( b_idx.toString(), bxy[0] + 12, bxy[1] + 8, _style );
    }
  }


}

function redraw() {
  let two = g_ui.two;
  let data = g_ui.data;

  let pgn = data.pgn;
  let cursor = data.cursor;

  two.clear();

  // draw underlying integral grid as dashed lines
  //
  if (data.grid_size >= 10) {
    let ds = data.grid_size;
    let W = g_ui.two.width;
    let H = g_ui.two.height;

    for (x=0; x<W; x+= ds) {
      let lx = two.makeLine(x,0, x,H);
      lx.dashes = [1,4];
      lx.opacity = 0.5;
      lx.linewidth = 1;
    }

    for (y=0; y<H; y += ds) {
      let ly = two.makeLine(0,y, W,y);
      ly.dashes = [1,4];
      ly.opacity = 0.5;
      ly.linewidth = 1;
    }
  }


  // draw little squares around polygon primitve vertices
  //
  for (let i=0; i<pgn.length; i++) {
    two.makeRectangle(pgn[i][0], pgn[i][1], 5,5);
  }

  // connect lines of rectilinear polygon
  //
  for (let i=1; i<pgn.length; i++) {
    two.makeLine( pgn[i-1][0], pgn[i-1][1], pgn[i][0], pgn[i][1] );
  }

  // close it off if we've ended drawing
  //
  if (data.pgn_state == "closed") {
    if (pgn.length > 2) {
      two.makeLine( pgn[pgn.length-1][0], pgn[pgn.length-1][1], pgn[0][0], pgn[0][1] );
    }
  }

  if (g_ui.mode == "draw") {
    if ((cursor[0] >= 0) &&
        (cursor[1] >= 0)) {

      if (g_ui.state == "idle") {
        two.makeRectangle(cursor[0],cursor[1], 10,10);
      }


      else if (g_ui.state == "drawing") {
        let prv_xy = pgn[ pgn.length-1 ];

        let e_xy = [
          ((data.orientation==0) ? prv_xy[0] : cursor[0] ),
          ((data.orientation==0) ? cursor[1] : prv_xy[1] )
        ];

        let L0 = two.makeLine( prv_xy[0], prv_xy[1], e_xy[0], e_xy[1] );
        let L1 = two.makeLine( e_xy[0], e_xy[1], cursor[0], cursor[1] );
        L1.dashes = [2,2];
      }

    }

  }

  else if (g_ui.mode == "grab") {
    if ((cursor[0] >= 0) &&
        (cursor[1] >= 0)) {
      if (g_ui.state == "idle") {
        two.makeRectangle(cursor[0],cursor[1], 10,10);
      }
    }
  }

  else if (g_ui.mode == "cut") {
    if ((cursor[0] >= 0) &&
        (cursor[1] >= 0)) {
      two.makeRectangle(cursor[0],cursor[1], 10,10);
    }

    if (g_ui.data.rprp_info_ready) {
      _draw_rprp_grid();
    }

    if (g_ui.mode_modifier == "select_endpoint") {

      let ui_data = g_ui.mode_data.cut;
      let l_cut = ui_data.l_cut;

      let cl0 = two.makeLine(
        l_cut[0][0][0], l_cut[0][0][1],
        l_cut[0][1][0], l_cut[0][1][1]
      );

      let cl1 = two.makeLine(
        l_cut[0][1][0], l_cut[0][1][1],
        cursor[0], cursor[1]
      );

      cl0.linewidth = 8;
      cl0.opacity = 0.5;
      cl0.stroke = "rgb(128,0,128)";

      cl1.linewidth = 8;
      cl1.opacity = 0.5;
      cl1.stroke = "rgb(128,0,128)";
    }

    else if (g_ui.mode_data.cut.ready) {
      let ui_data = g_ui.mode_data.cut;
      let l_cut = ui_data.l_cut;

      let cl0 = two.makeLine(
        l_cut[0][0][0], l_cut[0][0][1],
        l_cut[0][1][0], l_cut[0][1][1]
      );

      let cl1 = two.makeLine(
        l_cut[1][0][0], l_cut[1][0][1],
        l_cut[1][1][0], l_cut[1][1][1]
      );

      cl0.linewidth = 8;
      cl0.opacity = 0.5;
      cl0.stroke = "rgb(128,0,128)";

      cl1.linewidth = 8;
      cl1.opacity = 0.5;
      cl1.stroke = "rgb(128,0,128)";

    }

    if (g_ui.mode_data.rect.ready) {
      let pR = g_ui.mode_data.rect.pR;

      let x = Math.abs(pR[0][0] + pR[1][0])/2;
      let y = Math.abs(pR[0][1] + pR[3][1])/2;
      let dx = Math.abs(pR[1][0] - pR[0][0]);
      let dy = Math.abs(pR[3][1] - pR[0][1]);

      let _r = two.makeRectangle( x,y, dx, dy );
      _r.noFill();
      _r.linewidth = 6;
      _r.stroke = "rgb(255,0,0)";
      _r.opacity = 0.5;
    }



  }

  else if (g_ui.mode == "rect") {
    if ((cursor[0] >= 0) &&
        (cursor[1] >= 0)) {
      two.makeRectangle(cursor[0],cursor[1], 10,10);
    }

    if (g_ui.data.rprp_info_ready) {
      _draw_rprp_grid();
    }

    let ui_data = g_ui.mode_data.rect;

    if ((g_ui.mode_modifier == "select_endpoint") ||
        ((g_ui.mode_modifier == "select_begin") && ui_data.ready)) {
      let pR = ui_data.pR;

      let x = Math.abs(pR[0][0] + pR[1][0])/2;
      let y = Math.abs(pR[0][1] + pR[3][1])/2;
      let dx = Math.abs(pR[1][0] - pR[0][0]);
      let dy = Math.abs(pR[3][1] - pR[0][1]);

      let _r = two.makeRectangle( x,y, dx, dy );
      _r.noFill();
      _r.linewidth = 6;
      _r.stroke = "rgb(255,0,0)";
      _r.opacity = 0.5;
    }

    if (g_ui.mode_data.cut.ready) {
      let ui_data = g_ui.mode_data.cut;
      let l_cut = ui_data.l_cut;

      let cl0 = two.makeLine(
        l_cut[0][0][0], l_cut[0][0][1],
        l_cut[0][1][0], l_cut[0][1][1]
      );

      let cl1 = two.makeLine(
        l_cut[1][0][0], l_cut[1][0][1],
        l_cut[1][1][0], l_cut[1][1][1]
      );

      cl0.linewidth = 8;
      cl0.opacity = 0.5;
      cl0.stroke = "rgb(128,0,128)";

      cl1.linewidth = 8;
      cl1.opacity = 0.5;
      cl1.stroke = "rgb(128,0,128)";
    }


  }

  else if (g_ui.mode == "grid") {

    _draw_rprp_grid();

  }

  let mode_disp = document.getElementById("ui_mode");
  mode_disp.innerHTML = "mode: " + g_ui.mode + ( (g_ui.mode == "draw") ? " (" + g_ui.data.pgn_state + ")" : "" );

  two.update();
}

function populate_grid() {
  let data = g_ui.data;
  let pgn = pgn2a(data.pgn);
  let rprp_info = rprp.rectilinearGridPoints( pgn );
  g_ui.data.rprp_info = rprp_info;

  g_ui.data.rprp_info_ready = true;

  redraw();
}


//      __               
//  ___/ /______ __    __
// / _  / __/ _ `/ |/|/ /
// \_,_/_/  \_,_/|__,__/ 
//                       

function mouse_click_draw(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;

  let pgn = data.pgn;

  if (g_ui.state == "idle") {
    data.pgn = [];
    g_ui.state = "drawing";
    data.pgn_state = "open";

    g_ui.data.orientation = 0;

    pgn = data.pgn;
  }

  if (g_ui.snap_to_grid) {
    x = Math.round( x / data.grid_size ) * data.grid_size;
    y = Math.round( y / data.grid_size ) * data.grid_size;
  }

  let prv_xy = [ x,y ];

  if (pgn.length > 0) {
    prv_xy[0] = pgn[ pgn.length-1 ][0];
    prv_xy[1] = pgn[ pgn.length-1 ][1];
  }

  let p_xy = [
    ((data.orientation==0) ? prv_xy[0] : x ),
    ((data.orientation==0) ? y : prv_xy[1] )
  ];
  data.orientation = ((data.orientation+1)%2);

  if (data.pgn.length > 0) {
    if (_vcmp(data.pgn[ data.pgn.length-1 ], p_xy) == 0) {

      console.log("!!!skip");

      redraw();
      return;
    }
  }

  data.pgn.push(p_xy);

  let snap = false;
  if (pgn.length > 2) {
    let snap_end = [-1,-1];
    snap_end[0] = pgn[0][0];
    snap_end[1] = pgn[0][1];

    let dx = snap_end[0] - x;
    let dy = snap_end[1] - y;

    let ds = Math.sqrt( dx*dx + dy*dy );

    if ( ds < data.end_snap_threshold ) {
      snap = true;
    }

    if (snap) {
      data.pgn = regularize_pgn( data.pgn );

      g_ui.state = "idle";
      g_ui.data.pgn_state = "closed";

      update_textarea(true);
    }

  }

}

// this got complicated...
// the input points can be a mess, so this cleans them up:
//
// * remove duplicate points
// * remove colinear points
// * (todo) counterclockwise direction
//
// returns cleaned up polygon
//
function regularize_pgn( _pgn ) {

  if (_pgn.length < 1) { return []; }

  // if there's a string of end vertices that
  // are the same as the starting vertex, walk back
  // until you reach the first non-equal vertex
  //
  let pgn = [ [_pgn[0][0], _pgn[0][1] ]];
  let end_idx = _pgn.length-1;
  while ( (end_idx >= 0) &&
          ( (_pgn[end_idx][0] == pgn[0][0]) &&
            (_pgn[end_idx][1] == pgn[0][1]) ) ) {
    end_idx--;
  }

  // walk forward, removing duplicate entries,
  // until the end index discovered above
  //
  for (let cur_i=1; cur_i<=end_idx; cur_i++) {
    let prv_i = (cur_i - 1 + _pgn.length) % _pgn.length;
    let nxt_i = (cur_i + 1) % _pgn.length;

    if ( (_pgn[prv_i][0] == _pgn[cur_i][0]) &&
         (_pgn[prv_i][1] == _pgn[cur_i][1]) ) {
      continue;
    }

    pgn.push( [ _pgn[cur_i][0], _pgn[cur_i][1] ] );
  }

  let n = pgn.length;

  // if the first point is co-linear, talk foward
  // until you find the first non-colinear point,
  // store index in s_idx
  //
  let s_idx = 0;
  for (let cur_i=0; cur_i < n; cur_i++) {
    let prv_i = (cur_i - 1 + n) % n;
    let nxt_i = (cur_i + 1) % n;

    let p_prv = pgn[prv_i];
    let p_cur = pgn[cur_i];
    let p_nxt = pgn[nxt_i];

    let dxy_p_c = [
      Math.abs( p_cur[0] - p_prv[0] ),
      Math.abs( p_cur[1] - p_prv[1] )
    ];

    let dxy_c_n = [
      Math.abs( p_cur[0] - p_nxt[0] ),
      Math.abs( p_cur[1] - p_nxt[1] )
    ];

    if ((dxy_p_c[0] == 0) &&
        (dxy_c_n[0] == 0)) {
      continue;
    }

    if ((dxy_p_c[1] == 0) &&
        (dxy_c_n[1] == 0)) {
      continue;
    }


    s_idx = cur_i;
    break;
  }

  // put the first vertex in the resulting polygon
  // and walk through each, removing duplicate vertices
  // (which there should be none of, but kept in for
  // redundancy)
  // and removing colinear points
  //
  let res_pgn = [ [pgn[s_idx][0], pgn[s_idx][1]] ];
  for (let idx=1; idx<n; idx++) {

    let cur_i = (s_idx + idx) % n;
    let prv_i = (cur_i - 1 + n) % n;
    let nxt_i = (cur_i + 1) % n;

    if ( (pgn[prv_i][0] == pgn[cur_i][0]) &&
         (pgn[prv_i][1] == pgn[cur_i][1]) ) {
      continue;
    }

    let p_prv = pgn[prv_i];
    let p_cur = pgn[cur_i];
    let p_nxt = pgn[nxt_i];

    // absolute value of cur and previous
    //
    let dxy_p_c = [
      Math.abs( p_cur[0] - p_prv[0] ),
      Math.abs( p_cur[1] - p_prv[1] )
    ];

    // absolute value of cur and next
    //
    let dxy_c_n = [
      Math.abs( p_cur[0] - p_nxt[0] ),
      Math.abs( p_cur[1] - p_nxt[1] )
    ];

    // if dx is 0 between current and both previous and next,
    // colinear, continue
    //
    if ((dxy_p_c[0] == 0) &&
        (dxy_c_n[0] == 0)) {
      continue;
    }

    // if dy is 0 between current and both previous and next,
    // colinear, continue
    //
    if ((dxy_p_c[1] == 0) &&
        (dxy_c_n[1] == 0)) {
      continue;
    }

    res_pgn.push( [ pgn[cur_i][0], pgn[cur_i][1] ] );
  }

  if ( rprp.windingA( res_pgn ) < 0 ) {
    res_pgn.reverse();
  }

  return res_pgn;
}

function mouse_move_draw(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  data.cursor[0] = x;
  data.cursor[1] = y;

  if (g_ui.snap_to_grid) {
    let snap_xy = [
      Math.round( x / data.grid_size ) * data.grid_size,
      Math.round( y / data.grid_size ) * data.grid_size
    ];

    data.cursor[0] = snap_xy[0];
    data.cursor[1] = snap_xy[1];
  }

  //redraw();
}


//                  __ 
//   ___ ________ _/ / 
//  / _ `/ __/ _ `/ _ \
//  \_, /_/  \_,_/_.__/
// /___/               

function mouse_click_grab(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  data.cursor[0] = x;
  data.cursor[1] = y;

  if (g_ui.snap_to_grid) {
    let snap_xy = [
      Math.round( x / data.grid_size ) * data.grid_size,
      Math.round( y / data.grid_size ) * data.grid_size
    ];

    data.cursor[0] = snap_xy[0];
    data.cursor[1] = snap_xy[1];
  }

  if (g_ui.mode_modifier == "select") {

    let seg = [];
    for (let cur_i=0; cur_i<pgn.length; cur_i++) {
      let nxt_i = (cur_i+1)%pgn.length;

      let dxy = [
        Math.abs( pgn[nxt_i][0] - pgn[cur_i][0] ),
        Math.abs( pgn[nxt_i][1] - pgn[cur_i][1] )
      ];

      if ((dxy[0] == 0) && (pgn[cur_i][0] != data.cursor[0])) { continue; }
      if ((dxy[1] == 0) && (pgn[cur_i][1] != data.cursor[1])) { continue; }

      // BUG!!
      // when two lines are colinear bu otherwise valid/seperated,
      // will pick on over the other...
      //
      let dcc = [
        Math.abs( data.cursor[0] - pgn[cur_i][0] ),
        Math.abs( data.cursor[1] - pgn[cur_i][1] )
      ];

      let dcn = [
        Math.abs( data.cursor[0] - pgn[nxt_i][0] ),
        Math.abs( data.cursor[1] - pgn[nxt_i][1] )
      ];

      if ((dxy[0] == 0) && (dcc[0] == 0)) {
        if ( (dcc[1] <= dxy[1]) && (dcn[1] <= dxy[1]) ) {
          seg.push( [cur_i, nxt_i] );

          g_ui.mode_data.grab.d_idx = ((dxy[0] == 0) ? 0 : 1);
          g_ui.mode_data.grab.p_idx = [ cur_i, nxt_i ];

        }
      }
      else if ((dxy[1] == 0) && (dcc[1] == 0)) {
        if ( (dcc[0] <= dxy[0]) && (dcn[0] <= dxy[0]) ) {

          //console.log("dxy:", dxy,
          //  "dcc:", dcc, "dcn:", dcn,
          //  "cursor:", data.cursor, "pgn[cur_i]:", pgn[cur_i], "pgn[nxt_i]:", pgn[nxt_i],
          //  "cur_i:", cur_i, "nxt_i:", nxt_i );

          seg.push( [cur_i, nxt_i] );

          g_ui.mode_data.grab.d_idx = ((dxy[0] == 0) ? 0 : 1);
          g_ui.mode_data.grab.p_idx = [ cur_i, nxt_i ];

        }
      }

    }

    if (seg.length == 1) {
      //console.log("GRAB:MOVE");
      g_ui.mode_modifier = "move";
    }

    return seg;
  }

  // unselect
  //

  g_ui.mode_modifier = "select";

}

function mouse_move_grab(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  data.cursor[0] = x;
  data.cursor[1] = y;

  if (g_ui.snap_to_grid) {
    let snap_xy = [
      Math.round( x / data.grid_size ) * data.grid_size,
      Math.round( y / data.grid_size ) * data.grid_size
    ];

    data.cursor[0] = snap_xy[0];
    data.cursor[1] = snap_xy[1];
  }

  if (g_ui.mode_modifier == "select") { return; }

  let grab_info = g_ui.mode_data["grab"];

  let d_idx = grab_info.d_idx;
  let idx0 = grab_info.p_idx[0];
  let idx1 = grab_info.p_idx[1];

  //console.log("d_idx:", d_idx, "idx01:", idx0, idx1);

  pgn[idx0][d_idx] = data.cursor[d_idx];
  pgn[idx1][d_idx] = data.cursor[d_idx];

}



//            __ 
//  ______ __/ /_
// / __/ // / __/
// \__/\_,_/\__/ 
//               

function mouse_click_cut(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  let rprp_info = {};
  if (data.rprp_info_ready) { rprp_info = data.rprp_info; }

  data.cursor = snap_to_grid( x, y, data.grid_size );

  if (!data.rprp_info_ready) {
    console.log("rprp_info not ready");
    return;
  }

  let border_idx = -1;

  let B = rprp_info.B;

  let Ba = [];
  for (let i=0; i<B.length; i++) {
    Ba.push( B[i].xy );
  }

  let tB = a2pgn(Ba);

  for (let i=0; i<tB.length; i++) {
    if ((tB[i][0] == data.cursor[0]) &&
        (tB[i][1] == data.cursor[1])) {
      border_idx = i;
      break;
    }
  }

  if (border_idx >= 0) {

    if (g_ui.mode_modifier == "select") {
      g_ui.mode_modifier = "select_endpoint";

      g_ui.mode_data.cut.dir_code = 'h';
      g_ui.mode_data.cut.l_cut[0][0] = [ tB[border_idx][0], tB[border_idx][1] ];
      g_ui.mode_data.cut.l_cut[0][1] = [ tB[border_idx][0], tB[border_idx][1] ];
      g_ui.mode_data.cut.l_cut[1][0] = [ 0,0 ];
      g_ui.mode_data.cut.l_cut[1][1] = [ 0,0 ];
      g_ui.mode_data.cut.B_idx_cut[0] = border_idx;
      g_ui.mode_data.cut.B_idx_cut[1] = -1;

    }
    else if (g_ui.mode_modifier == "select_endpoint") {
      g_ui.mode_modifier = "select";

      let lcut_beg = g_ui.mode_data.cut.l_cut[0];

      g_ui.mode_data.cut.l_cut[1][0] = [ lcut_beg[1][0], lcut_beg[1][1] ];
      g_ui.mode_data.cut.l_cut[1][1] = [ tB[border_idx][0], tB[border_idx][1] ];
      g_ui.mode_data.cut.B_idx_cut[1] = border_idx;

      g_ui.mode_data.cut.ready = true;

    }

  }

}

function mouse_move_cut(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  data.cursor = snap_to_grid( x, y, data.grid_size );

  let ui_data = g_ui.mode_data.cut;

  // 'sticky' direction
  // when cursor hovers over origin, how it leaves
  // the origin point determines whether the first cut
  // line is horizontal or vertical
  //
  if (g_ui.mode_modifier == "select_endpoint") {
    if ((data.cursor[0] == ui_data.l_cut[0][0][0]) &&
        (data.cursor[1] == ui_data.l_cut[0][0][1])) {
      ui_data.update_dir_code = true;
    }
    else if (ui_data.update_dir_code) {
      ui_data.update_dir_code = false;

      let dx = Math.abs( data.cursor[0] - ui_data.l_cut[0][0][0] );
      let dy = Math.abs( data.cursor[1] - ui_data.l_cut[0][0][1] );

      if (dx >= dy) { ui_data.dir_code = 'h'; }
      else { ui_data.dir_code = 'v'; }
    }

    if (ui_data.dir_code == 'h') {
      ui_data.l_cut[0][1][0] = data.cursor[0];
      ui_data.l_cut[0][1][1] = ui_data.l_cut[0][0][1];
    }

    else if (ui_data.dir_code == 'v') {
      ui_data.l_cut[0][1][0] = ui_data.l_cut[0][0][0];
      ui_data.l_cut[0][1][1] = data.cursor[1];
    }

  }

}

//                 _         
//   _______ ___ _(_)__  ___ 
//  / __/ -_) _ `/ / _ \/ _ \
// /_/  \__/\_, /_/\___/_//_/
//         /___/             

function mouse_click_region(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  data.cursor = snap_to_grid( x, y, data.grid_size );

  //let ui_data = g_ui.mode_data.region;

}

function mouse_move_region(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  data.cursor = snap_to_grid( x, y, data.grid_size );

  //let ui_data = g_ui.mode_data.region;

}

//                __ 
//   _______ ____/ /_
//  / __/ -_) __/ __/
// /_/  \__/\__/\__/ 
//                   

function mouse_click_rect(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  data.cursor = snap_to_grid( x, y, data.grid_size );

  let ui_data = g_ui.mode_data.rect;

  let rprp_info = {};
  if (data.rprp_info_ready) { rprp_info = data.rprp_info; }

  data.cursor = snap_to_grid( x, y, data.grid_size );

  if (!data.rprp_info_ready) {
    console.log("rprp_info not ready");
    return;
  }

  let grid_idx = -1;

  let G = rprp_info.G;
  let tG = a2pgn(G);

  for (let i=0; i<tG.length; i++) {
    if ((tG[i][0] == data.cursor[0]) &&
        (tG[i][1] == data.cursor[1])) {
      grid_idx = i;
      break;
    }
  }
  console.log(">>>", grid_idx, g_ui.mode_modifier);

  if (grid_idx >= 0) {

    if (g_ui.mode_modifier == "select_begin") {
      g_ui.mode_modifier = "select_endpoint";
      ui_data.G_idx_R[0] = grid_idx;

      ui_data.pR[0][0] = tG[grid_idx][0];
      ui_data.pR[0][1] = tG[grid_idx][1];

      ui_data.pR[1][0] = tG[grid_idx][0];
      ui_data.pR[1][1] = tG[grid_idx][1];

      ui_data.pR[2][0] = tG[grid_idx][0];
      ui_data.pR[2][1] = tG[grid_idx][1];

      ui_data.pR[3][0] = tG[grid_idx][0];
      ui_data.pR[3][1] = tG[grid_idx][1];

      ui_data.ready = false;

      console.log("ui_data.pR:", JSON.stringify(ui_data.pR));
    }

    else if (g_ui.mode_modifier == "select_endpoint") {
      g_ui.mode_modifier = "select_begin";
      ui_data.G_idx_R[1] = grid_idx;

      ui_data.pR[2][0] = tG[grid_idx][0];
      ui_data.pR[2][1] = tG[grid_idx][1];

      ui_data.ready = true;
    }

  }

}

function mouse_move_rect(x,y) {
  let two = g_ui.two;
  let data = g_ui.data;
  let pgn = data.pgn;

  data.cursor = snap_to_grid( x, y, data.grid_size );

  let ui_data = g_ui.mode_data.rect;


  if (g_ui.mode_modifier == "select_endpoint") {

    ui_data.pR[2][0] = data.cursor[0];
    ui_data.pR[2][1] = data.cursor[1];

    ui_data.pR[1][0] = ui_data.pR[2][0];
    ui_data.pR[1][1] = ui_data.pR[0][1];

    ui_data.pR[3][0] = ui_data.pR[0][0];
    ui_data.pR[3][1] = ui_data.pR[2][1];

  }


}

//---
//---
//---

function mouse_click(x,y) {
  let two = g_ui.two;
  if      (g_ui.mode == "draw")   { mouse_click_draw(x,y); }
  else if (g_ui.mode == "grab")   { mouse_click_grab(x,y); }
  else if (g_ui.mode == "grid")   {  }
  else if (g_ui.mode == "cut")    { mouse_click_cut(x,y); }
  else if (g_ui.mode == "region") { mouse_click_region(x,y); }
  else if (g_ui.mode == "rect")   { mouse_click_rect(x,y); }

  redraw();

}

function mouse_move(x,y) {
  let two = g_ui.two;
  if      (g_ui.mode == "draw")   { mouse_move_draw(x,y); }
  else if (g_ui.mode == "grab")   { mouse_move_grab(x,y); }
  else if (g_ui.mode == "grid")   { }
  else if (g_ui.mode == "cut")    { mouse_move_cut(x,y); }
  else if (g_ui.mode == "region") { mouse_move_region(x,y); }
  else if (g_ui.mode == "rect")   { mouse_move_rect(x,y); }

  redraw();
}


//----
//----


function snap_to_grid(x,y,gs) {
  gs = ((typeof gs === "undefined") ? g_ui.data.grid_size : gs );
  return [
    Math.round( x / gs ) * gs,
    Math.round( y / gs ) * gs
  ];
}

function init_two() {
  let two = g_ui.two;
  let ele = document.getElementById("ui_canvas");
  two.appendTo(ele);
  two.clear();

  ele.addEventListener("mouseup", (ev) => {
    let x = ev.offsetX;
    let y = ev.offsetY;
    mouse_click(x,y);
  });

  /*
  ele.addEventListener("click", (ev) => {
    let x = ev.offsetX;
    let y = ev.offsetY;
    mouse_click(x,y);
  });
  */

  ele.addEventListener("mousemove", (ev) => {
    let x = ev.offsetX;
    let y = ev.offsetY;

    mouse_move(x,y);
  });

  ele.addEventListener("keydown", (ev) => {
    if      (ev.key == 'd') { ui_mode("draw"); }
    else if (ev.key == 'g') { ui_mode("grab"); }
    else if (ev.key == 'z') { ui_mode("grid"); }
    else if (ev.key == 'c') { ui_mode("cut"); }
    else if (ev.key == 'r') { ui_mode("region"); }
    else if (ev.key == 's') { ui_mode("save"); }
  });

  ele.addEventListener("keyup", (ev) => {
  });

  g_ui.ready = true;
}

// basic functionality
//
function _dl() {
  var ele = document.getElementById("ui_canvas");
  let svg_txt = ele.innerHTML;
  let pos = 0;
  let fin_txt = svg_txt.slice(0,pos);
  fin_txt = svg_txt;
  var b = new Blob([ fin_txt ]);
  saveAs(b, "fig.svg");
}

function __dl() {
  var ele = document.getElementById("ui_canvas");
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


function webinit() {
  init_two();
  redraw();
}
