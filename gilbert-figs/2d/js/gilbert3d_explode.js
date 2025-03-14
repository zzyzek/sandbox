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


function mk_iso_cuboid(x0,y0,s, lco, fco, lXYZ, lw) {
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

function gilbert3d_explode() {
  let two = g_fig_ctx.two;

  var ele = document.getElementById("gilbert3d_explode_canvas");
  two.appendTo(ele);

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

  //let lco0 = "rgba(80,80,140,1.0)";
  //let fco0 = "rgba(180,180,240,1.0)";
  let lco0 = lPAL[0];
  let fco0 = PAL[0];

  //let lco1 = "rgba(80,80,240,1.0)";
  //let fco1 = "rgba(120,120,240,1.0)";
  let lco1 = lPAL[1];
  let fco1 = PAL[1];

  //let lco2 = "rgba(80,250,140,1.0)";
  //let fco2 = "rgba(180,250,240,1.0)";
  let lco2 = lPAL[2];
  let fco2 = PAL[2];

  //let lco3 = "rgba(240,150,40,1.0)";
  //let fco3 = "rgba(250,150,80,1.0)";
  let lco3 = lPAL[3];
  let fco3 = PAL[3];

  //let lco4 = "rgba(250,80,140,1.0)";
  //let fco4 = "rgba(250,180,240,1.0)";
  let lco4 = lPAL[4];
  let fco4 = PAL[4];

  let x0 = 190,
      y0 = 250,
      s0 = 40;
  let dxyz = 100;

  let qs = s0*Math.sqrt(3)/2;

  let sep = [3,3];
  sep = [3.2,3.2];

  let x1 = x0 - sep[0]*qs,
      y1 = y0 - sep[1]*s0/2;

  let x2 = x0,
      y2 = y0 - s0;

  let x3 = x0 - (sep[0]-1)*qs,
      y3 = y0 - (sep[1]+1)*s0/2;

  let x4 = x0 + qs,
      y4 = y0 - s0/2;


  let js = s0/4;

  let jx = (s0 - js)*Math.sqrt(3)/2,
      jy = (s0 - js)/2;

  mk_iso_cuboid(x3,y3,s0, lco3, fco3, [1,1,2]);
  mk_iso_cuboid(x3+jx, y3-(3 + (2/3))*jy,   js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);
  mk_iso_cuboid(x3+jx, y3+jy,   js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);

  mk_iso_cuboid(x1,y1,s0, lco1, fco1, [1,1,2]);
  mk_iso_cuboid(x1,    y1+2*jy,     js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);
  mk_iso_cuboid(x1,    y1-s0,  js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);

  mk_iso_cuboid(x4,y4,s0, lco4, fco4, [1,1,1]);
  mk_iso_cuboid(x4+jx, y4+jy,  js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);

  mk_iso_cuboid(x0,y0,s0, lco0, fco0, [1,1,1]);
  mk_iso_cuboid(x0-jx, y0+jy,   js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);
  mk_iso_cuboid(x0,    y0+2*jy, js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);

  mk_iso_cuboid(x2,y2,s0, lco2, fco2, [1,2,1]);
  mk_iso_cuboid(x2-jx,    y2-jy,   js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);
  mk_iso_cuboid(x2+jx + (jx/3),  y2-3*jy - (jy/3), js, "rbga(0,0,0,0)", "rgba(0,0,0,0.3)", [1,1,1], 0);

  //---

  let c01_xy = [
    [x1, y1+(3*s0/4)],
    [x0-(3*qs/4), y0+(3*s0/8)]
  ];

  let _c10 = two.makeCircle( c01_xy[0][0], c01_xy[0][1], 4 );
  _c10.fill = "rgba(0,0,0,0.9)";
  _c10.stroke = "rgba(0,0,0,0)";
  _c10.linewidth = 0;

  let _c01 = two.makeCircle( c01_xy[1][0], c01_xy[1][1], 4 );
  _c01.fill = "rgba(0,0,0,0.9)";
  _c01.stroke = "rgba(0,0,0,0)";
  _c01.linewidth = 0;


  _Line( c01_xy[0][0], c01_xy[0][1], c01_xy[1][0], c01_xy[1][1], "rgba(0,0,0,0.9)", 2.8);

  //---

  let c12_xy = [
    [ x1, y1-s0 ],
    [ x2-jx, y2-jy ]
  ];

  let _c12 = two.makeCircle( c12_xy[0][0], c12_xy[0][1], 4 );
  _c12.fill = "rgba(0,0,0,0.9)";
  _c12.stroke = "rgba(0,0,0,0)";
  _c12.linewidth = 0;


  let _c21 = two.makeCircle( c12_xy[1][0], c12_xy[1][1], 4 );
  _c21.fill = "rgba(0,0,0,0.9)";
  _c21.stroke = "rgba(0,0,0,0)";
  _c21.linewidth = 0;

  _Line( c12_xy[0][0], c12_xy[0][1], c12_xy[1][0], c12_xy[1][1], "rgba(0,0,0,0.9)", 2.8);

  //---

  let c32_xy = [
    [ x3+jx,  y3-(3 + (2/3))*jy ],
    [ x2+jx + (jx/3),  y2-3*jy - (jy/3) ]
  ];


  let _c32 = two.makeCircle( c32_xy[0][0], c32_xy[0][1], 4 );
  _c32.fill = "rgba(0,0,0,0.9)";
  _c32.stroke = "rgba(0,0,0,0)";
  _c32.linewidth = 0;

  let _c23 = two.makeCircle( c32_xy[1][0], c32_xy[1][1], 4 );
  _c23.fill = "rgba(0,0,0,0.9)";
  _c23.stroke = "rgba(0,0,0,0)";
  _c23.linewidth = 0;

  _Line( c32_xy[0][0], c32_xy[0][1], c32_xy[1][0], c32_xy[1][1], "rgba(0,0,0,0.9)", 2.8);


  //---

  let _c3_ = two.makeCircle( x3+jx, y3+jy, 3);
  _c3_.fill = "rgba(0,0,0,0.4)";
  _c3_.stroke = "rgba(0,0,0,0)";
  _c3_.linewidth = 0;

  two.update();
}


