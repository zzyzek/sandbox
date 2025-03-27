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

var PAL = [
  'rgb(215,25,28)',
  'rgb(253,174,97)',
  //'rgb(235,235,191)',
  'rgb(255,255,159)',
  'rgb(171,221,164)',
  'rgb(43,131,186)'
];

var lPAL = [
  'rgb(120,25,28)',
  'rgb(203,134,37)',
  //'rgb(235,235,191)',
  'rgb(215,215,191)',
  'rgb(121,181,124)',
  'rgb(13,91,136)'
];

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
  var ele = document.getElementById("gilbert3d_case_canvas");

  let svg_txt = ele.innerHTML;

  var b = new Blob([ svg_txt ]);
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

function _Line1(x0,y0, x1,y1, lco, lw) {
  lw = ((typeof lw === "undefined") ? 2 : lw);

  let two = g_fig_ctx.two;

  let _l = two.makeLine(x0,y0, x1,y1);
  _l.linewidth = lw;
  _l.fill = "rgba(0,0,0,0)";
  _l.stroke = lco;
  _l.cap = 'round';
  _l.dashes = [8, 8];

  return _l;
}

function axis_fig(x0,y0,s) {
  let two = g_fig_ctx.two;

  let vr = [0,0,1];
  let theta = -Math.PI/16;

  let vxyz = njs.mul(s, rodrigues( [1,0,0], vr, theta ));
  let vxy = _project( vxyz[0], vxyz[1], vxyz[2] );

  let lw = 3;

  let v0xyz = [
    [0,1,0],
    [-1,0,0],
    [0,0,1]
  ];


  let co = [
    "rgba(255,0,0,0.7)",
    "rgba(0,255,0,0.7)",
    "rgba(0,0,255,0.7)"
  ];

  co = [
    "rgb(240,10,20)",
    "rgb(32,220,32)",
    "rgb(20,10,240)",
  ];

  let style = {
    "size": 12,
    "weight": "bold",
    "family": "Libertine, Linux Libertine O"
  };

  let _txt = ["x", "y", "z"];
  _txt = [ "X", "Y", "Z" ];

  let tdxyz = [
    [  0, 0.5,   0 ],
    [-0.5,   0,   0 ],
    [  0,   0, 0.5 ],
  ];

  let xyz0 = njs.mul(s, rodrigues( [0,0,0], vr, theta ));
  let xy0 = njs.add( [x0,y0], _project( xyz0[0], xyz0[1], xyz0[1] ) );

  for (let xyz=0; xyz<3; xyz++) {
    let vxyz = njs.mul(s, rodrigues( v0xyz[xyz], vr, theta ));
    let vxy = _project( vxyz[0], vxyz[1], vxyz[2] );


    let _l = two.makeLine( x0,y0, x0+vxy[0], y0+vxy[1], 10);
    _l.linewidth = lw;
    _l.fill = "rgba(0,0,0,0)";
    _l.cap = 'round';
    _l.stroke = co[xyz];

    let txyz = njs.mul(s, rodrigues( njs.add(v0xyz[xyz] , tdxyz[xyz]), vr, theta ));
    let txy = _project( txyz[0], txyz[1], txyz[2] );

    let label = new Two.Text(_txt[xyz], x0+txy[0], y0+txy[1], style);
    label.fill = "rgba(16,16,16,1)";
    two.add(label);

  }

  let c = two.makeCircle( xy0[0], xy0[1], 3);
  c.fill = "#000";
  c.linewidth = 0;

  two.update();
}



function block3d_fig(x0,y0,s0) {
  let two = g_fig_ctx.two;

  //let x0 = 190, y0 = 250, s0 = 40;
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

function curve3d_fig(x0,y0,s) {
  let two = g_fig_ctx.two;

  //let x0 = 15,
  //    y0 = 350;
  //let s = 20;

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

  let col = [
    PAL[0],
    PAL[1],

    //PAL[2],
    //"rgba()",
    //'rgb(235,235,191)',
    //'rgb(255,255,159)',
    '#aa9803',

    PAL[3],
    PAL[4],
  ];

  let prv_beg = [-1,-1],
      prv_end = [-1,-1];

  let order = [4,3,2,1,0];

  let join_points = [];
  let curve_points  = [];
  let endpoint = [];

  for (let _gidx=0; _gidx<idx_region_xy.length; _gidx++) {

    let gidx = order[_gidx];
    gidx = _gidx;

    let _beg = idx_region_xy[gidx][0];
    let _end = idx_region_xy[gidx][1];
    let dxy = idx_region_xy[gidx][2];

    let cur_beg = [-1,-1],
        cur_end = [-1,-1];


    let _p = [];
    for (let idx=_beg; idx<_end; idx++) {

      let _xyz = gilbert_d2xyz(idx, N,N,N);
      let xyz = rodrigues( [N-_xyz.y, _xyz.x, _xyz.z], rotaxis, rotangle );
      //let xyz = rodrigues( [_xyz.x, N-_xyz.y, _xyz.z], rotaxis, rotangle );

      let xy = njs.add(dxy, njs.add( _project(xyz[0], xyz[1], xyz[2],s), [x0,y0] ));
      _p.push(xy);

      if ((idx==0) || (idx==(N*N*N-1))) {
        //two.makeCircle(xy[0], xy[1], 4);
        endpoint.push( [xy[0], xy[1]] );
      }


      if      (idx == _beg)     { cur_beg = xy; }
      else if (idx == (_end-1)) { cur_end = xy; }
    }

    if (_gidx>0) {
      //_Line1( prv_end[0], prv_end[1], cur_beg[0], cur_beg[1], "rgba(0,0,0,0.8)", 4);
      join_points.push( [[prv_end[0],prv_end[1]], [cur_beg[0], cur_beg[1]]] );
    }
    prv_beg = cur_beg;
    prv_end = cur_end;

    curve_points.push(_p);

  }

  let jp = join_points[3];
  _Line1( jp[0][0], jp[0][1], jp[1][0], jp[1][1], "rgba(16,16,16,0.7)", 4);

  for (let _gidx=0; _gidx< curve_points.length; _gidx++) {

    let gidx = _gidx
    let _p = curve_points[gidx];

    let v = makeTwoVector(_p);
    let p = two.makePath(v);
    p.linewidth = 4;
    p.stroke = col[gidx];
    p.fill = "rgba(0,0,0,0)";
    p.join = "round";
    p.cap = "round";
    p.closed = false;

  }

  for (let i=0; i<endpoint.length; i++) {
    let c = two.makeCircle( endpoint[i][0], endpoint[i][1], 4 );
    c.linewidth = 1;
    c.stroke = '#000';
    c.fill = 'rgba(250,250,250,1.0)';
  }

  for (let gidx=0; gidx<join_points.length; gidx++) {
    let jp = join_points[gidx];
    if (gidx != 3) {
      _Line1( jp[0][0], jp[0][1], jp[1][0], jp[1][1], "rgba(16,16,16,0.7)", 4);
    }

    let _r = 3.5;

    let _c0 = two.makeCircle( jp[0][0], jp[0][1], _r);
    _c0.linewidth = 0;
    _c0.stroke = "#000"
    _c0.fill = "rgba(16,16,16,0.8)";

    let _c1 = two.makeCircle( jp[1][0], jp[1][1], _r);
    _c1.linewidth = 0;
    _c1.stroke = "#000"
    _c1.fill = "rgba(16,16,16,0.8)";
  }

  two.update();
}


// x0,y0 start position (in canvas pixels)
// s scale
// lco line color
// fco fill color
// lXYZ len[xyz]
// lw linewidth
// vr rotation axis
// theta rotation angle
//
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
      [0,0,0],
      [0,0,lXYZ[2]],
      [0,lXYZ[1], lXYZ[2]],
      [0,lXYZ[1],0]
    ],
    /*
    [
      [lXYZ[0],0,0],
      [lXYZ[0],0,lXYZ[2]],
      [lXYZ[0],lXYZ[1],lXYZ[2]],
      [lXYZ[0],lXYZ[1],0]
    ],
    */

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

function mkfullblock(start_xy, opos, cuboid_size, disp_order, scale) {
  scale = ((typeof scale === "undefined") ? 25 : scale);
  let two = g_fig_ctx.two;

  let vr = [0,0,1];
  let theta = -Math.PI/16 + Math.PI/2;

  //let order = [3,4,1,0,2];

  for (let _i=0; _i<5; _i++) {
    let i = disp_order[_i];
    let jxyz = njs.mul(scale, rodrigues(opos[i], vr, theta));
    let jxy = njs.add( [start_xy[0], start_xy[1]], _project( jxyz[0], jxyz[1], jxyz[2]) );
    let lco = lPAL[i];
    let fco = PAL[i];
    let cs = njs.mul(scale, cuboid_size[i]);

    mk_iso_cuboid(jxy[0],jxy[1],1, lco, fco, cs, 2, vr, theta);
  }

  //two.update();
}

function gilbert3d_case() {
  let two = g_fig_ctx.two;

  let vr = [0,0,1];
  let theta = -Math.PI/16 + Math.PI/2;

  var ele = document.getElementById("gilbert3d_case_canvas");
  two.appendTo(ele);

  let scale = 25;
  let s0 = scale;

  let whd2pconfig = [0,1,0,1,0,1,0,2];

  let dw = 1/4;
  let js = s0*dw;

  let jx = (s0 - js)*Math.sqrt(3)/2,
      jy = (s0 - js)/2;

  let _D = 1/3;
  let _d = _D/2;

  let label_P0 = [
    {
      "x": { "t": "alpha2e", "xy": [10,5]  },
      "y": { "t": "beta2e", "xy": [-25,0]  },
      "z": { "t": "gamma2e", "xy": [-37,-20]  }
    },

    {
      "x": { "t": "alpha2e", "xy": [10,5]  },
      "y": { "t": "beta2s", "xy": [-25,0]  },
      "z": { "t": "gamma", "xy": [-30,-20]  }
    },

    {
      "x": { "t": "alpha", "xy": [10,5]  },
      "y": { "t": "beta2s", "xy": [-25,0]  },
      "z": { "t": "gamma2s", "xy": [-37,-20]  }
    },

    {
      "x": { "t": "alpha2s", "xy": [10,5]  },
      "y": { "t": "beta2s", "xy": [-25,0]  },
      "z": { "t": "gamma", "xy": [-30,-20]  }
    },

    {
      "x": { "t": "alpha2s", "xy": [10,5]  },
      "y": { "t": "beta2e", "xy": [-25,0]  },
      "z": { "t": "gamma2e", "xy": [-40,-20]  }
    }

  ];

  let label_P1 = [
    {
      "x": { "t": "alpha2e", "xy": [10,5]  },
      "y": { "t": "beta2e", "xy": [-25,0]  },
      "z": { "t": "gamma2e", "xy": [-37,-20]  }
    },

    {
      "x": { "t": "alpha2e", "xy": [10,5]  },
      "y": { "t": "beta", "xy": [-25,0]  },
      "z": { "t": "gamma2s", "xy": [-55,-35]  }
    },

    {
      "x": { "t": "alpha", "xy": [10,5]  },
      "y": { "t": "beta2s", "xy": [-25,0]  },
      "z": { "t": "gamma2s", "xy": [-37,-20]  }
    },

    {
      "x": { "t": "alpha2s", "xy": [10,5]  },
      "y": { "t": "beta", "xy": [-25,0]  },
      "z": { "t": "gamma2s", "xy": [-55,-40]  }
    },

    {
      "x": { "t": "alpha2s", "xy": [10,5]  },
      "y": { "t": "beta2e", "xy": [-25,0]  },
      "z": { "t": "gamma2e", "xy": [-40,-20]  }
    }

  ];

  let label_P1_011 = [
    {
      "x": { "t": "alpha2q", "xy": [10,5]  },
      "y": { "t": "beta2e", "xy": [-25,0]  },
      "z": { "t": "gamma2e", "xy": [-37,-20]  }
    },

    {
      "x": { "t": "alpha2q", "xy": [10,5]  },
      "y": { "t": "beta", "xy": [-25,0]  },
      "z": { "t": "gamma2q", "xy": [-55,-35]  }
    },

    {
      "x": { "t": "alpha", "xy": [10,5]  },
      "y": { "t": "beta2q", "xy": [-25,0]  },
      "z": { "t": "gamma2q", "xy": [-37,-20]  }
    },

    {
      "x": { "t": "alpha2qp", "xy": [10,5]  },
      "y": { "t": "beta", "xy": [-25,0]  },
      "z": { "t": "gamma2q", "xy": [-55,-40]  }
    },

    {
      "x": { "t": "alpha2qp", "xy": [10,5]  },
      "y": { "t": "beta2e", "xy": [-25,0]  },
      "z": { "t": "gamma2e", "xy": [-40,-20]  }
    }

  ];

  let label_P2 = [
    {
      "x": { "t": "alpha2e", "xy": [10,5]  },
      "y": { "t": "beta2e", "xy": [-25,0]  },
      "z": { "t": "gamma", "xy": [-30,-20]  }
    },

    {
      "x": { "t": "alpha", "xy": [10,5]  },
      "y": { "t": "beta2q", "xy": [-25,0]  },
      "z": { "t": "gamma2e", "xy": [-38,-25]  }
    },

    {
      "x": { "t": "alpha", "xy": [10,5]  },
      "y": { "t": "beta2q", "xy": [-25,0]  },
      "z": { "t": "gamma2q", "xy": [-37,-20]  }
    },

    {
      "x": { "t": "alpha2q", "xy": [10,5]  },
      "y": { "t": "beta2q", "xy": [-25,0]  },
      "z": { "t": "gamma2q", "xy": [-38,-25]  }
    },

    {
      "x": { "t": "alpha2q", "xy": [10,5]  },
      "y": { "t": "beta2e", "xy": [-25,0]  },
      "z": { "t": "gamma2e", "xy": [-38,-20]  }
    }

  ];

  let dock_P0 = [
    [ [0,0,0, _d,_d,_d], [0,1-_D,0, _d, 1-_d,_d] ],
    [ [0,0,0, _d,_d,_d], [0,0,2-_D, _d, _d, 2-_d] ],
    [ [0,1-_D,1-_D, _d, 1-_d,1-_d], [2-_D,1-_D,1-_D, 2-_d,1-_d,1-_d] ],
    [ [1-_D,0,2-_D, 1-_d,_d,2-_d], [1-_D,0,0, 1-_d,_d,_d] ],
    [ [1-_D,1-_D,0, 1-_d,1-_d,_d], [1-_D,0,0, 1-_d,_d,_d] ]
  ];

  let dock_P1 = [
    [ [0,0,0, _d,_d,_d], [0,0,1-_D, _d,_d,1-_d] ],
    [ [0,0,0, _d,_d,_d], [0,2-_D,0,  _d, 2-_d,_d] ],
    [ [0,1-_D,1-_D, _d, 1-_d,1-_d], [2-_D,1-_D,1-_D, 2-_d,1-_d,1-_d] ],
    [ [1-_D,2-_D,0, 1-_d,2-_d,_d], [1-_D,0,0, 1-_d,_d,_d] ],
    [ [1-_D,0,1-_D, 1-_d,_d,1-_d], [1-_D,0,0, 1-_d,_d,_d] ]
  ];

  let dock_P2 = [
    [ [0,0,0, _d,_d,_d], [0,1-_D,0, _d,1-_d,_d] ],
    [ [0,0,0, _d,_d,_d], [0,0,1-_D, _d,_d,1-_d] ],
    [ [0,0,0, _d,_d,_d], [2-_D,0,0, 2-_d,_d,_d] ], 
    [ [1-_D,1-_D,0, 1-_d,1-_d,_d], [1-_D,0,0, 1-_d,_d,_d] ],
    [ [1-_D,0,1-_D, 1-_d,_d,1-_d], [1-_D,0,0, 1-_d,_d,_d] ]
  ];

  let CXY_P0 = [ [70, 150], [140, 150], [197, 125], [280, 150], [350, 150] ];
  let CXY_P1 = [ [70, 150], [140, 150], [195,  125], [290, 150], [350, 150] ];
  let CXY_P2 = [ [70, 150], [130, 150], [210, 125], [290, 150], [350, 150] ];

  CXY_P0 = [ [70, 150], [140, 150], [210, 125], [290, 150], [360, 150] ];
  CXY_P1 = [ [75, 150], [160, 150], [225,  125], [335, 150], [410, 150] ];
  CXY_P2 = [ [75, 150], [150, 150], [245, 125], [335, 150], [410, 150] ];

  let PConfig = [
    {
      "xy": CXY_P0,
      "opos" : [ [0,0,0], [0,1,0], [0,0,1], [1,1,0], [1,0,0] ],
      "cuboid_size": [ [1,1,1], [1,1,2], [2,1,1], [1,1,2], [1,1,1] ],
      "disp_order" : [3,4,1,0,2],
      "label": label_P0,
      "endpoint": dock_P0
    },
    {
      "xy": CXY_P1,
      "opos" : [ [0,0,0], [0,0,1], [0,1,0], [1,0,1], [1,0,0] ],
      "cuboid_size": [ [1,1,1], [1,2,1], [2,1,1], [1,2,1], [1,1,1] ],
      "disp_order" : [2,4,3,0,1],
      "label": label_P1,
      "endpoint": dock_P1
    },
    {
      "xy": CXY_P2,
      "opos" : [ [0,0,0], [0,1,0], [0,1,1], [1,0,1], [1,0,0] ],
      "cuboid_size": [ [1,1,2], [2,1,1], [2,1,1], [1,1,1], [1,1,1] ],
      "disp_order": [1,2,4,3,0],
      "label": label_P2,
      "endpoint": dock_P2
    }
  ];

  for (let whd=0; whd<8; whd++) {

    let pc = PConfig[whd2pconfig[whd]];
    let cxya = pc.xy;
    let cuboid_size_a = pc.cuboid_size;

    //let start_xy = [ ((whd%2) ? (scale*18) : 0), Math.floor(whd/2)*150 ];
    //let start_xy = [ ((whd%2) ? (scale*18) : 0), Math.floor(whd/2)*105 ];
    let start_xy = [ ((whd%2) ? (scale*18) : 0), Math.floor(whd/2)*155 ];

    let sxy = [ start_xy[0] + 50, start_xy[1] + 150 ];

    mkfullblock(sxy, pc.opos, pc.cuboid_size, pc.disp_order, 18);

    let vord_pos = [-1,-1];
    for (let idx=0; idx<5; idx++) {
      //let cxy = njs.add( start_xy, cxya[idx]);
      let cxy = njs.add( [60,0], njs.add( start_xy, cxya[idx]) );
      let lco = lPAL[idx];
      let fco = PAL[idx];
      let cs = njs.mul(scale, cuboid_size_a[idx]);
      mk_iso_cuboid(cxy[0],cxy[1],1, lco, fco, cs, 2, vr, theta);

      let _lbl = pc.label[idx];
      if (whd == 3) { _lbl = label_P1_011[idx]; }

      mathjax2twojs(_lbl.x.t, cxy[0]+_lbl.x.xy[0],cxy[1]+_lbl.x.xy[1], 0.015);
      mathjax2twojs(_lbl.y.t, cxy[0]+_lbl.y.xy[0],cxy[1]+_lbl.y.xy[1], 0.015);
      mathjax2twojs(_lbl.z.t, cxy[0]+_lbl.z.xy[0],cxy[1]+_lbl.z.xy[1], 0.015);

      if (vord_pos[0] < 0) {
        vord_pos[0] = cxy[0];
        vord_pos[1] = cxy[1];
      }
      else {
        vord_pos[0] = cxy[0];
      }

      mathjax2twojs(_lbl.x.t, vord_pos[0]-30,vord_pos[1]+50, 0.0125);
      mathjax2twojs(_lbl.y.t, vord_pos[0]- 5,vord_pos[1]+50, 0.0125);
      mathjax2twojs(_lbl.z.t, vord_pos[0]+20,vord_pos[1]+50, 0.0125);

      let v_id = ["A", "B", "C", "D", "E"][idx];
      v_id += "_P" + whd2pconfig[whd].toString();
      console.log(">>", v_id, document.getElementById(v_id));

      //mathjax2twojs(v_id, cxy[0]-35, cxy[1]+50, 0.015);

      //mathjax2twojs("gamma2q", cxy[0]+10,cxy[1]+5, 0.015);
      //mathjax2twojs("alpha2s", cxy[0]-30,cxy[1]-0, 0.015);
      //mathjax2twojs("beta2e", cxy[0]-40,cxy[1]-20, 0.015);

      let dock_co = [ "rgba(0,0,0,0", "rgba(0,0,0,0.3)" ];

      for (let _di=0; _di<2; _di++) {
        let dock_pos = pc.endpoint[idx][_di];

        let _dd = 1/3;
        let jxyz = njs.mul(scale, rodrigues([ dock_pos[0],dock_pos[1],dock_pos[2]], vr, theta));
        let jxy = njs.add( [cxy[0], cxy[1]], _project( jxyz[0], jxyz[1], jxyz[2]) );
        mk_iso_cuboid(jxy[0],jxy[1],scale*_dd, dock_co[0], dock_co[1], [1,1,1], 2, vr, theta);

        let dc_xyz = njs.mul(scale, rodrigues([dock_pos[3],dock_pos[4],dock_pos[5]], vr, theta));
        let dc_xy = njs.add( [cxy[0], cxy[1]], _project( dc_xyz[0], dc_xyz[1], dc_xyz[2]) );

        let _c = two.makeCircle( dc_xy[0], dc_xy[1],  4 );
        _c.stroke = "rgba(0,0,0,0)";
        _c.linewidth = 0;
        if (_di==1) { _c.fill = "rgba(255,255,255,0.9)"; }
        else        { _c.fill = "rgba(0,0,0,0.9)"; }
      }

    }

  }

  if (false) {
    let pc0 = PConfig[0];
    let pc1 = PConfig[1];
    let pc2 = PConfig[2];

    let disp_order0 = [3,4,1,0,2];
    let disp_order1 = [2,4,3,0,1];
    let disp_order2 = [1,2,4,3,0];

    mkfullblock([150,100], pc0.opos, pc0.cuboid_size, disp_order0, 20);
    mkfullblock([250,100], pc1.opos, pc1.cuboid_size, disp_order1, 20);
    mkfullblock([200,200], pc2.opos, pc2.cuboid_size, disp_order2, 20);
  }

  axis_fig(50, 50, 20);
  //block3d_fig(50, 160, 40);
  //curve3d_fig(15, 300, 20);
}

var debug = [];

// so very hacky
// somehow we managed to shoehorn
// mathjax notation into svg so that it
// can be used by two.js.
// We need to contort ourselves to get the mask
// right so that it gets all the element
//
function mathjax2twojs(_id,x,y,s,s_sub) {
  s = ((typeof s === "undefined") ? 0.02 : s);
  s_sub = ((typeof s_sub === "undefined") ? 0.7 : s_sub);

  let two = g_fig_ctx.two;

  let ele = document.querySelector("#" + _id + " svg");
  let ser = new XMLSerializer();
  let str = ser.serializeToString(ele);

  let parser = new DOMParser();
  let sge = parser.parseFromString(str, "image/svg+xml").documentElement;

  let sgr = two.interpret(sge);

  sgr.position.x = x;
  sgr.position.y = y;
  sgr.scale.x =  s;
  sgr.scale.y = -s;

  //debug.push(sgr);

  if (sgr.children.length > 0) {
    if (sgr.children[0].children.length > 0) {
      if (sgr.children[0].children[0].children.length > 0) {
        if (sgr.children[0].children[0].children[0].children.length > 1) {
          sgr.children[0].children[0].children[0].children[1].scale.x = s_sub;
          sgr.children[0].children[0].children[0].children[1].scale.y = s_sub;
        }
      }
    }
  }

  //yep, needed, so we can then get the make element
  //
  two.update();

  let mask = document.getElementById(sgr.mask.id);
  //mask.firstChild.setAttribute("d", "M -10000 -10000 L 10000 -10000 L 10000 10000 L -10000 10000 Z");
  mask.firstChild.setAttribute("d", "M -4000 -4000 L 4000 -4000 L 4000 4000 L -4000 4000 Z");

  two.update();
}


/*
var debug = [];
function okok() {
  let two = g_fig_ctx.two;
  let s = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /></svg>';
  const div = document.createElement('div');
  div.innerHTML = s;
  let fc = div.firstChild;
  let g = two.interpret(fc);
  console.log(s,div, g);
  two.update();
}
*/
