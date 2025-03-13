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


// enumeration of paths for 2x2, 2x3, 3x2 and 3x3, along with
// a "no path" configuration
//

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

//----
//----

function _project(x,y,z, L) {
  L = ((typeof L === "undefined") ? 1 : L);
  let s = L*Math.sqrt(3)/2;

  let vx = [ s,  L/2 ],
      vy = [ s, -L/2 ],
      vz = [ 0, -L ];

  let xy2d = [
    x*vx[0] + y*vy[0] + z*vz[0],
    x*vx[1] + y*vy[1] + z*vz[1]
  ];

  return xy2d;
}

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

function _dl() {
  var ele = document.getElementById("gilbert3d_explode_canvas");
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
      1.15*Math.sqrt(2)*x_len/8,
      1.15*Math.sqrt(2)*y_len/8
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

    let lw = 4.5;

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

function mk_square_lozenge() {
  let two = g_fig_ctx.two;

  let x = 150,
      y = 150;

  let s = 40;
  let q = s*Math.sqrt(3)/2;

  let _p = [
    [x    , y-s   ],
    [x+q  , y-s/2 ],
    [x+q  , y+s/2 ],
    [x    , y+s ],
    [x-q  , y+s/2 ],
    [x-q  , y-s/2 ]
  ];

  let lco = "rgba(80,80,140,1.0)";
  let fco = "rgba(180,180,240,0.9)";

  let lw = 2;

  let v = makeTwoVector(_p);
  let p = two.makePath(v);
  p.linewidth = lw;
  p.stroke = lco;
  p.fill = fco;
  p.cbp = 'round';
  p.join = 'round';

  let dy = 3;
  dy = 0;
  let vy = dy*Math.sqrt(3)/2;

  let sdy = 1.75*dy;
  let svy = 1.75*dy*Math.sqrt(3)/2;

  let _v1 = makeTwoVector([ [x-q + svy, y-s/2 +sdy/2], [x-vy,y-dy/2] ]); //, [x+q, y-s/2] ]);
  let p_1 = two.makePath(_v1);
  p_1.linewidth = lw;
  p_1.fill = "rgba(0,0,0,0)";
  p_1.stroke = lco;
  p_1.cbp = 'round';
  p_1.join = 'round';
  p_1.cap = 'round';
  p_1.closed = false;

  let _v2 = makeTwoVector([ [x+vy,y-dy/2], [x+q-svy, y-s/2+sdy/2] ]);
  let p_2 = two.makePath(_v2);
  p_2.linewidth = lw;
  p_2.fill = "rgba(0,0,0,0)";
  p_2.stroke = lco;
  p_2.cbp = 'round';
  p_2.join = 'round';
  p_2.cap = 'round';
  p_2.closed = false;

  let _v3 = makeTwoVector([ [x,y+dy], [x,y+s-1.75*dy] ]);
  let p_3 = two.makePath(_v3);
  p_3.linewidth = lw;
  p_3.fill = "rgba(0,0,0,0)";
  p_3.stroke = lco;
  p_3.cbp = 'round';
  p_3.join = 'round';
  p_3.cap = 'round';
  p_3.closed = false;

  two.update();
}

function _Line(x0,y0, x1,y1, lco) {
  let two = g_fig_ctx.two;

  let lw = 2;
  //let lco = "rgba(80,80,140,1.0)";
  //let fco = "rgba(180,180,240,1.0)";


  let _l = two.makeLine(x0,y0, x1,y1);
  _l.linewidth = lw;
  _l.fill = "rgba(0,0,0,0)";
  _l.stroke = lco;
  _l.cbp = 'round';
  _l.join = 'round';
  _l.cap = 'round';

  return _l;
}


function mk_lozenge(x0,y0,s, lco, fco, lXYZ) {
  lXYZ = ((typeof lXYZ === "undefined") ? [1,1,1] : lXYZ);
  let two = g_fig_ctx.two;

  let lw = 2;
  let dy = 0;

  //let lco = "rgba(80,80,140,1.0)";
  //let fco = "rgba(180,180,240,1.0)";

  let q = s*Math.sqrt(3)/2;

  let lenX = lXYZ[0],
      lenY = lXYZ[1],
      lenZ = lXYZ[2];


  for (let _z=0; _z<lenZ; _z++) {
    for (let _y=0; _y<lenY; _y++) {
      for (let _x=0; _x<lenX; _x++) {

        let xy = _project(_x,_y,_z,s);
        let x = xy[0] + x0;
        let y = xy[1] + y0;

        let _p = [
          [x    , y-s   ],
          [x+q  , y-s/2 ],
          [x+q  , y+s/2 ],
          [x    , y+s ],
          [x-q  , y+s/2 ],
          [x-q  , y-s/2 ]
        ];

        let v = makeTwoVector(_p);
        let p = two.makePath(v);
        p.linewidth = lw;
        //p.stroke = lco;
        p.stroke = "rgba(0,0,0,0)";
        p.fill = fco;
        p.cbp = 'round';
        p.join = 'round';

      }
    }
  }


  // WIP
  for (let _z=0; _z<lenZ; _z++) {
    for (let _y=0; _y<lenY; _y++) {
      for (let _x=0; _x<lenX; _x++) {

        if ((_x!=0) && (_x!=(lenX-1)) &&
            (_y!=0) && (_y!=(lenY-1)) &&
            (_z!=0) && (_z!=(lenZ-1)) ) {
          continue;
        }

        let xy = _project(_x,_y,_z,s);
        let x = xy[0] + x0;
        let y = xy[1] + y0;

        if ((_x == 0) &&  (_y == 0))        { _Line(x-q, y+s/2, x-q, y-s/2, lco); }
        if ((_x == 0) && (_z == (lenZ-1)))  { _Line(x-q, y-s/2, x, y-s, lco); }
        if ((_y == 0) && (_z == 0))         { _Line(x-q, y+s/2, x, y+s, lco); }
        if ((_y == 0) && (_z == (lenZ-1)))  { _Line(x-q, y-s/2, x, y,lco); }
        if ((_x == (lenX-1)) && (_y == 0))  { _Line(x, y, x, y+s, lco); }
        if ((_x == (lenX-1)) && (_y == (lenY-1)))  { _Line(x+q, y-s/2, x+q, y+s/2,lco); }
        if ((_x == (lenX-1)) && (_z == 0))  { _Line(x, y+s, x+q, y+s/2, lco); }
        if ((_x == (lenX-1)) && (_z == (lenZ-1)))  { _Line(x, y, x+q, y-s/2,lco); }
        if ((_z == (lenZ-1)) && (_y == (lenY-1))) { _Line(x, y-s, x+q, y-s/2,lco); }

      }
    }
  }

  /*
  let _v3 = makeTwoVector([ [x,y+dy], [x,y+s-1.75*dy] ]);
  let p_3 = two.makePath(_v3);
  p_3.linewidth = lw;
  p_3.fill = "rgba(0,0,0,0)";
  p_3.stroke = lco;
  p_3.cbp = 'round';
  p_3.join = 'round';
  p_3.cap = 'round';
  p_3.closed = false;
*/

  two.update();

}

function __x() {

  let q = s*Math.sqrt(3)/2;

  let vz = [0,  s],
      vy = [q, -q],
      vx = [q,  q];


  let _p = [
    [x + vz[0]*lenZ, y + vz[1]*lenZ],
    [x + vy[0]*lenY, y + vy[1]*lenY],
    [x + vx[0]*lenX, y - vx[1]*lenX],
    [x+q  , y-s/2 ],
    [x+q  , y+s/2 ],
    [x    , y+s ],
    [x-q  , y+s/2 ],
    [x-q  , y-s/2 ]
  ];

  let lco = "rgba(80,80,140,1.0)";
  let fco = "rgba(180,180,240,1.0)";

  let lw = 2;

  let v = makeTwoVector(_p);

  let p = two.makePath(v);
  p.linewidth = lw;
  p.stroke = lco;
  p.fill = fco;
  p.cbp = 'round';
  p.join = 'round';

  let dy = 3;
  dy = 0;
  //let vy = dy*Math.sqrt(3)/2;

  let sdy = 1.75*dy;
  let svy = 1.75*dy*Math.sqrt(3)/2;

  top_connector = false;
  if (top_connector) {
    let _v1 = makeTwoVector([ [x-q + svy, y-s/2 +sdy/2], [x-vy,y-dy/2] ]); //, [x+q, y-s/2] ]);
    let p_1 = two.makePath(_v1);
    p_1.linewidth = lw;
    p_1.fill = "rgba(0,0,0,0)";
    p_1.stroke = lco;
    p_1.cbp = 'round';
    p_1.join = 'round';
    p_1.cap = 'round';
    p_1.closed = false;

    let _v2 = makeTwoVector([ [x+vy,y-dy/2], [x+q-svy, y-s/2+sdy/2] ]);
    let p_2 = two.makePath(_v2);
    p_2.linewidth = lw;
    p_2.fill = "rgba(0,0,0,0)";
    p_2.stroke = lco;
    p_2.cbp = 'round';
    p_2.join = 'round';
    p_2.cap = 'round';
    p_2.closed = false;
  }

  let _v3 = makeTwoVector([ [x,y+dy], [x,y+s-1.75*dy] ]);
  let p_3 = two.makePath(_v3);
  p_3.linewidth = lw;
  p_3.fill = "rgba(0,0,0,0)";
  p_3.stroke = lco;
  p_3.cbp = 'round';
  p_3.join = 'round';
  p_3.cap = 'round';
  p_3.closed = false;

  two.update();
}

function gilbert3d_explode() {
  let two = g_fig_ctx.two;

  var ele = document.getElementById("gilbert3d_explode_canvas");
  two.appendTo(ele);

  let lco0 = "rgba(80,80,140,1.0)";
  let fco0 = "rgba(180,180,240,1.0)";

  let lco1 = "rgba(80,80,240,1.0)";
  let fco1 = "rgba(120,120,240,1.0)";

  let lco2 = "rgba(80,250,140,1.0)";
  let fco2 = "rgba(180,250,240,1.0)";

  let lco3 = "rgba(240,150,40,1.0)";
  let fco3 = "rgba(250,150,80,1.0)";

  let lco4 = "rgba(250,80,140,1.0)";
  let fco4 = "rgba(250,180,240,1.0)";

  let x0 = 190,
      y0 = 250,
      s0 = 40;
  let dxyz = 100;

  let qs = s0*Math.sqrt(3)/2;

  let x1 = x0 - 3*qs,
      y1 = y0 - 3*s0/2;

  let x2 = x0,
      y2 = y0 - s0;

  let x3 = x0 - 2*qs,
      y3 = y0 - 4*s0/2;

  let x4 = x0 + qs,
      y4 = y0 - s0/2;

  mk_lozenge(x3,y3,s0, lco3, fco3, [1,1,2]);
  mk_lozenge(x1,y1,s0, lco1, fco1, [1,1,2]);

  mk_lozenge(x4,y4,s0, lco4, fco4, [1,1,1]);
  mk_lozenge(x0,y0,s0, lco0, fco0, [1,1,1]);
  mk_lozenge(x2,y2,s0, lco2, fco2, [1,2,1]);

  return;

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

  /*
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
  */


  cur_x = sx;
  cur_y += dy - (3*square_size/2);
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


