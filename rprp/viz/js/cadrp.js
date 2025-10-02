var g_ui = {
  "data" : {
    "grid_size": 20,
    "grid_snap_threshold" : 5,
    "end_snap_threshold" : 10,

    "orientation": 0,
    "orientation_description": [ "horizontal", "vertical" ],

    "cursor": [0,0],

    "pgn_state": "open",
    "pgn": []
  },

  "historic_queue_id" : 0,

  "snap_to_grid": true,

  "mode": "draw",

  "state": "idle",
  "state_description" : [ "drawing", "idle", "delete" ],

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
  g_ui.mode = _mode;

  redraw();
}

function load_historic(s) {

  // popluate current with historic
  //
  let ele = document.getElementById("ui_textarea");
  ele.value = s;

  // hacky way of getting out our array of data points
  //
  let a_str = s.replace( /^.*= */, '' ).replace( / *; *$/, '' ).replace( /, *\]$/, ']' );
  let ga_pgn = JSON.parse(a_str);


  px_pgn = a2pgn(ga_pgn);

  g_ui.data.pgn = px_pgn;
  g_ui.data.pgn_state = "closed";

  redraw();
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

  let mode_disp = document.getElementById("ui_mode");
  mode_disp.innerHTML = "mode: " + g_ui.mode + ( (g_ui.mode == "draw") ? " (" + g_ui.data.pgn_state + ")" : "" );

  two.update();
}

function mouse_click(x,y) {
  let two = g_ui.two;
  if      (g_ui.mode == "draw")   { mouse_click_draw(x,y); }
  else if (g_ui.mode == "grab")   { mouse_click_grab(x,y); }
  else if (g_ui.mode == "grid")   { }
  else if (g_ui.mode == "cut")    { mouse_click_cut(x,y); }
  else if (g_ui.mode == "region") { mouse_click_region(x,y); }

  redraw();

}

function mouse_move(x,y) {
  let two = g_ui.two;
  if      (g_ui.mode == "draw")   { mouse_move_draw(x,y); }
  else if (g_ui.mode == "grab")   { mouse_move_grab(x,y); }
  else if (g_ui.mode == "grid")   { }
  else if (g_ui.mode == "cut")    { mouse_move_cut(x,y); }
  else if (g_ui.mode == "region") { mouse_move_region(x,y); }

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
      g_ui.state = "idle";
      g_ui.data.pgn_state = "closed";

      update_textarea(true);
    }

  }

  //redraw();
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

  console.log("grabby");
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

  //wip
  let pgn = data.pgn;

  for (let i=0; i<pgn.length; i++) {


  }

}

//            __ 
//  ______ __/ /_
// / __/ // / __/
// \__/\_,_/\__/ 
//               

function mouse_click_cut(x,y) {
}

function mouse_move_cut(x,y) {
}

//                 _         
//   _______ ___ _(_)__  ___ 
//  / __/ -_) _ `/ / _ \/ _ \
// /_/  \__/\_, /_/\___/_//_/
//         /___/             

function mouse_click_region(x,y) {
}

function mouse_move_region(x,y) {
}

//----
//----


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

  g_ui.ready = true;
}

function webinit() {
  init_two();
  redraw();
}
