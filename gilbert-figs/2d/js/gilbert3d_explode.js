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

var njs = numeric;

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

// 3d cross product.
//
function cross3(p,q) {
  let c0 = ((p[1]*q[2]) - (p[2]*q[1])),
      c1 = ((p[2]*q[0]) - (p[0]*q[2])),
      c2 = ((p[0]*q[1]) - (p[1]*q[0]));

  return [c0,c1,c2];
}


// euler rotation or olinde rodrigues
// https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
//
function rodrigues(v0, _vr, theta) {
  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let v_r = njs.mul( 1 / njs.norm2(_vr), _vr );

  return njs.add(
    njs.mul(c, v0),
    njs.add(
      njs.mul( s, cross3(v_r,v0)),
      njs.mul( (1-c) * njs.dot(v_r, v0), v_r )
    )
  );
}


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

function _Line(x0,y0, x1,y1, lco, lw) {
  lw = ((typeof lw === "undefined") ? 2 : lw);

  let two = g_fig_ctx.two;

  let _l = two.makeLine(x0,y0, x1,y1);
  _l.linewidth = lw;
  _l.fill = "rgba(0,0,0,0)";
  _l.stroke = lco;
  //_l.cbp = 'round';
  _l.join = 'bevel';
  _l.cap = 'square';

  return _l;
}


function _mk_iso_cuboid(x0,y0,s, lco, fco, lXYZ, lw) {
  lXYZ = ((typeof lXYZ === "undefined") ? [1,1,1] : lXYZ);
  lw = ((typeof lw === "undefined") ? 2 : lw);
  let two = g_fig_ctx.two;

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
        p.stroke = "rgba(0,0,0,0)";
        p.fill = fco;
        p.cbp = 'round';
        p.join = 'round';

      }
    }
  }

  if (lw == 0) { return; }

  let dl = lw/2;
  let dL = lw*Math.sqrt(3)/4 - 0.2;

  let outline_anchor_xy = [
    _project(0,0,0,s),
    _project(0,0,lenZ-1,s),
    _project(0,lenY-1,lenZ-1,s),
    _project(lenX-1,lenY-1,lenZ-1,s),
    _project(lenX-1,lenY-1,0,s),
    _project(lenX-1,0,0,s)
  ];


  let _oa = outline_anchor_xy;

  let dx = lw*Math.sqrt(3)/4,
      dy = lw/4;
  let outline = [
    njs.add( _oa[0], [ -q+dx, +s/2-dy ] ),
    njs.add( _oa[1], [ -q+dx, -s/2+dy ] ),
    njs.add( _oa[2], [  0,      -s+2*dy ] ),
    njs.add( _oa[3], [ +q-dx, -s/2+dy ] ),
    njs.add( _oa[4], [ +q-dx, +s/2-dy ] ),
    njs.add( _oa[5], [  0,       s-2*dy ] )
  ];


  for (let i=0; i<outline.length; i++) {
    outline[i][0] += x0;
    outline[i][1] += y0;
  }

  let midp = njs.add( _project(lenX-1,0,lenZ-1,s), [x0,y0] );

  let v = makeTwoVector(outline);
  let p = two.makePath(v);
  p.linewidth = 2;
  p.stroke = lco;
  //p.stroke = "rgba(0,0,255,0.2)";
  p.fill = "rgba(0,0,0,0)";
  p.join = "miter";
  p.cap = "miter";


  let _l = _Line( outline[1][0] + dx/2, outline[1][1] + dy/2, midp[0] + 0, midp[1] - dy, lco);
  _l.stroke = lco;
  _l.fill = "rgba(0,0,0,0)";
  _l.cap = "round";

  _l = _Line( outline[3][0] - dx/2, outline[3][1] + dy/2, midp[0] + 0, midp[1] - dy, lco);
  _l.stroke = lco;
  _l.fill = "rgba(0,0,0,0)";
  _l.cap = "round";

  _l = _Line( outline[5][0], outline[5][1] - dy/2, midp[0] + 0, midp[1] + dy/2, lco);
  _l.stroke = lco;
  _l.fill = "rgba(0,0,0,0)";
  _l.cap = "round";

  two.update();
}

function axis_fig() {
  let two = g_fig_ctx.two;

  let x0 = 50,
      y0 = 50;

  let s = 30;
  let q = s*Math.sqrt(3)/2;

  let lw = 3;

  let _l = two.makeLine( x0,y0, x0+q,y0+s/2, 10);
  _l.linewidth = lw;
  _l.fill = "rgba(0,0,0,0)";
  _l.stroke = "rgba(255,0,0,1)";
  _l.cap = 'round';

  _l = two.makeLine( x0,y0, x0+q,y0-s/2, 10);
  _l.linewidth = lw;
  _l.fill = "rgba(0,0,0,0)";
  _l.stroke = "rgba(0,255,0,1)";
  _l.cap = 'round';

  _l = two.makeLine( x0,y0, x0,y0-s, 10);
  _l.linewidth = lw;
  _l.fill = "rgba(0,0,0,0)";
  _l.stroke = "rgba(0,0,235,1)";
  _l.join = 'bevel';
  _l.cap = 'round';

  let _c = two.makeCircle( x0,y0, lw/2 + 2);
  _c.fill = "rgba(0,0,0,0.9)";
  _c.stroke = "rgba(0,0,0,0)";
  _c.linewidth = 0;

  let style = {
    "size": 18,
    "weight": "normal",
    "family": "Libertine, Linux Libertine O"
  };

  let xlabel = new Two.Text("x", x0 + q + 10,y0 + s - 10 , style);
  xlabel.fill = "rgba(16,16,16,1)";
  two.add(xlabel);

  let ylabel = new Two.Text("y", x0 + q + 10,y0 - s + 10 , style);
  ylabel.fill = "rgba(16,16,16,1)";
  two.add(ylabel);

  let zlabel = new Two.Text("z", x0,y0 - s - 10 , style);
  zlabel.fill = "rgba(16,16,16,1)";
  two.add(zlabel);

  two.update();
}



function block3d_fig() {
  let two = g_fig_ctx.two;

  let PAL = [
    'rgb(215,25,28)',
    'rgb(253,174,97)',
    //'rgb(235,235,191)',
    'rgb(255,255,159)',
    'rgb(171,221,164)',
    'rgb(43,131,186)'
  ];

  let lPAL = [
    'rgb(120,25,28)',
    'rgb(203,134,37)',
    //'rgb(235,235,191)',
    'rgb(215,215,191)',
    'rgb(121,181,124)',
    'rgb(13,91,136)'
  ]

  let x0 = 190,
      y0 = 250,
      s0 = 40;
  let dxyz = 100;

  let qs = s0*Math.sqrt(3)/2;

  let dw = 1/4;
  let js = s0*dw;

  let jx = (s0 - js)*Math.sqrt(3)/2,
      jy = (s0 - js)/2;

  let cuboid_size = [
    [1,1,1],
    [1,1,2],
    [1,2,1],
    [1,1,2],
    [1,1,1]
  ];

  let D = 1.8;

  let cxyz = [
    [ D, 0, 0],
    [-D, 0, 0],
    [ D, 0, 1],
    [-D, 1, 0],
    [ D, 1, 0]
  ];


  let dock_xyz = [
    [ D + 1 - dw, 0, 0 ],

    [ D , 0, 0 ],
    [ -D + 1 - dw, 0, 0],

    [ -D + 1 - dw, 0, 2 - dw],
    [ D, 0, 2-dw],

    [ -D + 1 - dw, 2-dw, 2 - dw],
    [ D, 2-dw, 2-dw],

    [ -D + 1 - dw, 2-dw, 0],
    [ D, 2-dw, 0],

    [ D+1-dw, 2-dw, 0]
  ];

  let order = [3,1, 4,0,2];

  let vr = [0,0,1];
  let theta = -Math.PI/16;

  let proj_cxy = [];
  for (let i=0; i<dock_xyz.length; i++) {
    let cxyz = njs.mul(s0, rodrigues( njs.add([dw/2, dw/2, dw/2], dock_xyz[i]), vr, theta));
    let cxy = njs.add( [x0,y0], _project( cxyz[0], cxyz[1], cxyz[2]) );
    proj_cxy.push( cxy );
  }

  for (let _i=0; _i<cxyz.length; _i++) {
    let i = order[_i];
    let rxyz = njs.mul( s0, rodrigues( cxyz[i], vr, theta ) );
    let cxy = njs.add( [x0,y0], _project( rxyz[0], rxyz[1], rxyz[2]) );

    let lco = lPAL[i];
    let fco = PAL[i];

    let cs = njs.mul( s0, cuboid_size[i] );
    mk_iso_cuboid(cxy[0],cxy[1],1, lco, fco, cs, 2, vr, theta);

    // special case where we want the majority of the line to be occluded by subsequent draws
    //
    if (i == 3) {
      let li = proj_cxy.length-3;
      _Line( proj_cxy[li][0], proj_cxy[li][1], proj_cxy[li+1][0], proj_cxy[li+1][1], "rgba(0,0,0,0.9)", 2.8 );
    }


  }


  for (let i=0; i<dock_xyz.length; i++) {

    let jxyz = njs.mul(s0, rodrigues(dock_xyz[i], vr, theta));
    let jxy = njs.add( [x0,y0], _project( jxyz[0], jxyz[1], jxyz[2]) );

    let cxyz = njs.mul(s0, rodrigues( njs.add([dw/2, dw/2, dw/2], dock_xyz[i]), vr, theta));
    let cxy = njs.add( [x0,y0], _project( cxyz[0], cxyz[1], cxyz[2]) );

    if (i==(dock_xyz.length-2)) { continue; }

    mk_iso_cuboid( jxy[0],jxy[1],js, "rgba(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0, vr, theta);

    let _c = two.makeCircle( cxy[0], cxy[1],  4 );
    _c.stroke = "rgba(0,0,0,0)";
    _c.linewidth = 0;
    if ((i==0) || (i==(dock_xyz.length-1))) {
      _c.fill = "rgba(255,255,255,0.9)";
    }
    else {
      _c.fill = "rgba(0,0,0,0.9)";
    }

  }

  for (let i=1; i<(proj_cxy.length-1); i+=2) {
    if (i==(proj_cxy.length-3)) { continue; }
    _Line( proj_cxy[i][0], proj_cxy[i][1], proj_cxy[i+1][0], proj_cxy[i+1][1], "rgba(0,0,0,0.9)", 2.8);
  }



  //---

  let style = {
    "size": 18,
    "weight": "bold",
    "family": "Libertine, Linux Libertine O"
  };

  let text_dxyz = [
    [ 1.0, 0.5, 0.6 ],
    [ 1, 0.5, 1 ],
    [ 0.6, 0.9, 1 ],
    [ 1, 0.5, 1 ],
    [ 1.0, 0.4, 0.55 ]
  ];

  let text_co = [
    "rgba(255,255,255,1)",
    "rgba(16,16,16,1)",
    "rgba(16,16,16,1)",
    "rgba(16,16,16,1)",
    "rgba(255,255,255,1)"
  ];

  let text_ = [ "A", "B", "C", "D", "E" ];

  for (let i=0; i<text_dxyz.length; i++) {
    let rxyz = njs.mul( s0, rodrigues( njs.add(text_dxyz[i], cxyz[i]), vr, theta ) );
    let cxy = njs.add( [x0,y0], _project( rxyz[0], rxyz[1], rxyz[2]) );
    let txt = new Two.Text(text_[i], cxy[0], cxy[1], style);
    txt.fill = text_co[i];
    two.add(txt);
  }

  two.update();
}

function curve3d_fig() {
  let two = g_fig_ctx.two;

  let x0 = 15,
      y0 = 350;

  let s = 20;
  let q = s*Math.sqrt(3)/2;

  let rotaxis = [.5, 0.5, 1],
      rotangle = Math.PI/25;

  rotaxis = [-0.0,0.5,2.25];
  rotangle = -0.251;

  let pfac = 30;


  let idx_region_xy = [
    [0,8,  _project( 2,-1,-0.0, pfac)],
    [8,24, _project(-1,-1,-1, pfac)],
    [24,40,_project( 4, -3, 2, pfac)],
    [40,56,_project(-1, 1, 1, pfac)],
    [56,64,_project( 0.5, 3.5,-0, pfac)]
  ];

  idx_region_xy = [
    [0,8,  _project( 2, .5, -1, pfac)],
    [8,24, _project( 0, 0, 0, pfac)],
    [24,40,_project( 2, .5, -1, pfac)],
    [40,56,_project( 0, 0, 0, pfac)],
    [56,64,_project( 2, .5, -1, pfac)]
  ];

  let N = 4;

  let _p = [];
  for (let idx=0; idx<64; idx++) {
    let _xyz = gilbert_d2xyz(idx, N,N,N);

    let xyz = rodrigues( [N-_xyz.y, _xyz.x, _xyz.z], rotaxis, rotangle );

    let ridx = 0;
    for (ridx=0; ridx<idx_region_xy.length; ridx++) {
      if ((idx_region_xy[ridx][0] <= idx) &&
          (idx < idx_region_xy[ridx][1])) {
        break;
      }
    }

    let dxy = idx_region_xy[ridx][2];

    let xy = njs.add( _project(xyz[0], xyz[1], xyz[2], s), [x0,y0] );
    xy[0] += dxy[0];
    xy[1] += dxy[1];
    _p.push(xy);

  }

  let v = makeTwoVector(_p);
  let p = two.makePath(v);
  p.linewidth = 2;
  p.stroke = "rgba(0,0,255,0.9)";
  p.fill = "rgba(0,0,0,0)";
  p.join = "round";
  p.cap = "round";
  p.closed = false;



  two.update();

}

function mk_iso_cuboid( x0,y0,s, lco, fco, lXYZ, lw, vr, theta) {
  vr = ((typeof vr === "undefined") ? [0,0,1] : vr);
  theta = ((typeof theta === "undefined") ? (-Math.PI/16) : theta);


  let two = g_fig_ctx.two;

  let faces3d = [
    [
      [0,0,0],
      [0,0,lXYZ[2]],
      [lXYZ[0],0,lXYZ[2]],
      [lXYZ[0],0,0]
    ],
    [
      [lXYZ[0],0,0],
      [lXYZ[0],0,lXYZ[2]],
      [lXYZ[0],lXYZ[1],lXYZ[2]],
      [lXYZ[0],lXYZ[1],0]
    ],
    [
      [0,0,lXYZ[2]],
      [0,lXYZ[1],lXYZ[2]],
      [lXYZ[0],lXYZ[1],lXYZ[2]],
      [lXYZ[0],0,lXYZ[2]]
    ]
  ];


  let faces2d = [];
  let V = [],
      P = [];


  for (let fid=0; fid<faces3d.length; fid++) {
    faces2d.push([]);
    for (let i=0; i<faces3d[fid].length; i++) {
      let xyz = rodrigues( faces3d[fid][i], vr, theta );
      faces2d[fid].push( njs.add([x0,y0], _project(xyz[0], xyz[1], xyz[2], s)) );
    }

    V.push( makeTwoAnchor(faces2d[fid]) );

    let p = two.makePath(V[fid], true);
    P.push( p );

    p.fill = fco;
    p.closed = true;
    p.join = "round";

    p.stroke = lco;
    p.linewidth = lw;
  }


  two.update();
}

function gilbert3d_explode() {
  let two = g_fig_ctx.two;

  var ele = document.getElementById("gilbert3d_explode_canvas");
  two.appendTo(ele);


  axis_fig();
  block3d_fig();
  curve3d_fig();
}


