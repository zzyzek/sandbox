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

var _PROJECT_VEC = [
  [ Math.sqrt(3)/2, Math.sqrt(3)/2, 0 ],
  [ 1/2, -1/2, -1 ]
];

var PROJECT_VEC = [
  [ Math.sqrt(3)/2,-Math.sqrt(3)/2, 0 ],
  [ -1/2, -1/2,-1 ]
];

var njs = numeric;



var PAL5 = [
  'rgb(215,25,28)',
  'rgb(253,174,97)',
  'rgb(255,255,159)',
  'rgb(171,221,164)',
  'rgb(43,131,186)',
];

var PAL2 = [
  'rgb(215,25,28)',
  'rgb(43,131,186)',
];


var lPAL5 = [
  'rgb(120,25,28)',
  'rgb(203,134,37)',
  'rgb(215,215,191)',
  'rgb(121,181,124)',
  'rgb(13,91,136)',
];

var lPAL2 = [
  'rgb(120,25,28)',
  'rgb(13,91,136)',
];

var PAL8 = [ '#ce6f4f', '#e89e50', '#d4b247', '#b3c359', '#84d17e', '#41d9aa', '#00dad9', '#00d9ff' ];
PAL8 = [ '#ff3c24', '#96009a', '#006bb3', '#778500', '#ff5cb9', '#00d8ff', '#61ea92', '#ecb500', ];
PAL8 = [ '#f64842', '#6103b7', '#006b8d', '#7f8300', '#ff67b4', '#36cdff', '#6cea91', '#f3b200', ];
PAL8 = [ '#ed6a97', '#edaffc', '#97e4fe', '#2bf3d8', '#2fda80', '#5dbd43', '#879c16', '#be8651', ];

PAL8 = [ '#c96462', '#ce4906', '#859a2c', '#41ac73', '#4489d5', '#9a75b9', '#d8743f', '#e28271', ];

PAL8 = [ "#E6F1E9", "#EAF3E8", "#F0F4E6", "#F7F6E6", "#F5F2DF", "#F7E8D5", "#EDD5C5", "#DCBEB0", "#B59790", "#D6C2C0" ];
PAL8 = [ "#FDFCE8", "#F1F3E5", "#E4E9E2", "#D7DFDF", "#CAD5DB", "#BDCBD8", "#B1C2D5", "#A4B8D2", "#97AECF", "#8AA4CB" ];
PAL8 = [ '#777777', "#008042", "#6FA253", "#B7C370", "#FCE498", "#D78287", "#BF5688", "#7C1D6F", '#777777' ];
PAL8 = ['#777777', "#443F90", "#685BA7", "#A599CA", "#F5DDEB", "#F492A5", "#EA6E8A", "#D21C5E" ];
PAL8 = [ '#777777', "#045275", "#089099", "#7CCBA2", "#FCDE9C", "#F0746E", "#DC3977", "#7C1D6F" ];
PAL8 = [ '#777777', "#009392", "#39B185", "#9CCB86", "#E9E29C", "#EEB479", "#E88471", "#CF597E"];


var PAL12 = [ '#A80050', '#00B1BA', '#6278b1', '#C9BA92', '#A80050', '#00B1BA', '#6278b1', '#C9BA92', '#A80050', '#00B1BA', '#6278b1', '#C9BA92' ];

var lPAL8 = [];
for (let i=0; i<PAL8.length; i++) {
  let rgb = _hex2rgb(PAL8[i]);
  let hsv = RGBtoHSV(rgb.r, rgb.g, rgb.b);

  //hsv.s *= 0.8;
  //hsv.v *= 0.8;

  hsv.s *= 0.7;
  hsv.v *= 0.7;


  let dst_rgb = HSVtoRGB(hsv.h, hsv.s, hsv.v);
  let dst_rgb_str =  "rgb(" +
              Math.floor(dst_rgb.r).toString() + "," +
              Math.floor(dst_rgb.g).toString() + "," +
              Math.floor(dst_rgb.b).toString() + ")";
  lPAL8.push(dst_rgb_str);
}

var PAL = [
  'rgb(215,25,28)',
  'rgb(253,174,97)',
  //'rgb(235,235,191)',
  'rgb(255,255,159)',
  'rgb(171,221,164)',
  'rgb(43,131,186)',

  'rgb(100,100,100)',
  'rgb(120,120,120)',


  'rgb(140,140,140)'

];

var lPAL = [
  'rgb(120,25,28)',
  'rgb(203,134,37)',
  //'rgb(235,235,191)',
  'rgb(215,215,191)',
  'rgb(121,181,124)',
  'rgb(13,91,136)',

  'rgb(100,100,100)',
  'rgb(120,120,120)',

  'rgb(140,140,140)',
  'rgb(12,12,12)'
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

function _hex2rgb(rgb) {
  let s = 0;
  let d = 2;
  if (rgb[0] == '#') {
    rgb = rgb.slice(1);
  }
  if (rgb.length==3) { d = 1; }
  let hxr = rgb.slice(s,s+d);
  if (hxr.length==1) { hxr += hxr; }
  s += d;

  let hxg = rgb.slice(s,s+d);
  if (hxg.length==1) { hxg += hxg; }
  s += d;

  let hxb = rgb.slice(s,s+d);
  if (hxb.length==1) { hxb += hxb; }
  s += d;

  let v = { "r": parseInt(hxr,16), "g": parseInt(hxg,16), "b": parseInt(hxb,16) };
  return v;
}



//  https://stackoverflow.com/a/17243070
// From user Paul S. (https://stackoverflow.com/users/1615483/paul-s)
//
/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
 * 0 <= h,s,v, <=1
*/
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) { s = h.s, v = h.v, h = h.h; }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR 
 * r, g, b
 *
 * 0 <= r,g,b <= 255
*/
function RGBtoHSV(r, g, b) {
  if (arguments.length === 1) { g = r.g, b = r.b, r = r.r; }
  var max = Math.max(r, g, b), min = Math.min(r, g, b),
    d = max - min,
    h,
    s = (max === 0 ? 0 : d / max),
    v = max / 255;

  switch (max) {
    case min: h = 0; break;
    case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
    case g: h = (b - r) + d * 2; h /= 6 * d; break;
    case b: h = (r - g) + d * 4; h /= 6 * d; break;
  }

  return { h: h, s: s, v: v };
}

function HSVtoHSL(h, s, v) {
  if (arguments.length === 1) { s = h.s, v = h.v, h = h.h; }
  var _h = h,
    _s = s * v, _l = (2 - s) * v;
  _s /= (_l <= 1) ? _l : 2 - _l;
  _l /= 2;
  return { h: _h, s: _s, l: _l };
}

function HSLtoHSV(h, s, l) {
  if (arguments.length === 1) { s = h.s, l = h.l, h = h.h; }
  var _h = h, _s, _v; l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  _v = (l + s) / 2;
  _s = (2 * s) / (l + s);
  return { h: _h, s: _s, v: _v };
}


function hsl_lerp(p) {
  let hue = Math.floor(360*p).toString();
  let sat = "95%";
  let lit = '35%';

  sat = '60%';
  lit = '55%';
  return "hsl(" + [ hue,sat,lit ].join(",") + ")";
}


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


function __project(x,y,z, L) {
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

function _project(x,y,z, L) {
  L = ((typeof L === "undefined") ? 1 : L);
  let s = L*Math.sqrt(3)/2;

  let vx = [-s, -L/2 ],
      vy = [-s,  L/2 ],
      vz = [ 0,  L ];

  vx = [ PROJECT_VEC[0][0], PROJECT_VEC[1][0] ];
  vy = [ PROJECT_VEC[0][1], PROJECT_VEC[1][1] ];
  vz = [ PROJECT_VEC[0][2], PROJECT_VEC[1][2] ];

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
  var ele = document.getElementById("gilbert3d_hellebore");
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


function in_array(idx, a) {
  for (let i=0; i<a.length; i++) {
    if (a[i] == idx) { return true; }
  }
  return false;
}

function mk_colormap_f(_range, _pal) {
  return function(_t) {
    let _n = _range[ _range.length-1 ];
    let _tidx = Math.floor(_t*_n);

    for (let _i=1; _i<_range.length; _i++) {
      if ((_tidx >= _range[_i-1]) && (_tidx < _range[_i])) {
        return _pal[_i-1];
      }
    }
    return _pal[ _pal.length-1 ];
  };
}

//----
//----
//----


// There's some trickery here.
// The goals are to create a 3d gilbert curve figure that:
//
// - is rotated at a nice angle for good viewing
// - is orthographic (non-perspective)
// - has an outline for the edges to get a better sense of depth
// - has 'dots' at vertex points to give a sense for where the
//   verticies are
// - is an SVG image
//
// All these machinations (custom projection, custom rotations, etc.)
// are pretty much so we can save figures into SVG.
// two.js is a 2d library, so we need to do some 3d stuff ourselves.
//
// To acheive this we:
//
// - generate a 3d gilbert curve
// - rotate it in 3d appropriately
// - project down to 2d
// - keep the 3d, 2d and index points
// - sort by the rotated vectors, depth first (see the 'sort' function below
//   where we do the lazy projection, project onto the 'away' vector that's the
//   cross product of the lazy projection vectors)
// - draw the circle for the vertex and a white line, larger than the colored line,
//   halfway from each source vertex to the neighbor (making sure to use 'butt' cap
//   so no artifacts on the curve are seen)
// - finally, draw the colored line, again drawing from the source vertex to halfway
//   to each of it's neighboring verticies (rounded cap)
//
// The figure has alpha going up and to the right, beta going left and up and gamma
// going up, so we need to do an extra x/y and x-flip for the returned gilbert curve
// to be consistent with the displayed reference axis.
//
function mkg3curve(xy, whd, s, vr, theta, pnts, colormap_f ) {
  s = ((typeof s === "undefined") ? 1 : s);

  if (typeof colormap_f === "undefined") {
    console.log(">>> using default");
    colormap_f = function(_t) { return hsl_lerp(_t); }
  }

  let two = g_fig_ctx.two;

  //let N = whd[0]*whd[1]*whd[2];
  let N = pnts.length;

  let pnt3 = [];
  let pnt2 = [];
  let pnt32 = [];
  for (let idx=0; idx<N; idx++) {
    let p3 = pnts[idx];
    pnt3.push( p3 );

    let txyz = njs.mul(s, rodrigues(p3, vr, theta));
    let txy = njs.add(xy, _project( txyz[0], txyz[1], txyz[2] ));

    pnt2.push(txy);
    pnt32.push([txyz,txy,idx]);
  }

  pnt32.sort( function(a,b) {

    // inverse lazy projection
    //
    let _zz = cross3([s,s,0], [1/2, -1/2, -1]);
    let R = njs.norm2(_zz);

    let da = njs.dot(_zz,a[0]) / R;
    let db = njs.dot(_zz,b[0]) / R;

    if (da > db) { return -1; }
    if (da < db) { return  1; }
    return 0;
  });

  let idx_bp = [];

  let n = pnt32.length;
  for (let idx=0; idx<n; idx++) { idx_bp.push(0); }
  for (let idx=0; idx<n; idx++) {
    let p_idx = pnt32[idx][2];
    idx_bp[p_idx] = idx;
  }

  let bg_co = "rgb(255,255,255)";

  let fg_lw = 5;
  let bg_diam = 8;

  fg_lw = 3;
  bg_diam = 6;

  fg_lw = 2;
  bg_diam = 4;

  fg_lw = 1.75;
  bg_diam = 2*fg_lw;

  //fg_lw = 1.5;
  //bg_diam = 2;

  for (let idx=0; idx<n; idx++) {
  //for (let idx=0; idx<n; idx+=4) {

    if ((idx%1000)==0) { console.log("cp.1", idx, "/", n, "(", idx/n, ")"); }

    let p3 = pnt32[idx][0];
    let p2 = pnt32[idx][1];
    let p_idx = pnt32[idx][2];

    let draw_lines = [];

    if (p_idx > 0) {
      let nei_idx = p_idx-1;
      let q2 = pnt32[ idx_bp[nei_idx] ][1];
      draw_lines.push( [p2, q2] );
    }

    if (p_idx < (n-1)) {
      let nei_idx = p_idx+1;
      let q2 = pnt32[ idx_bp[nei_idx] ][1];
      draw_lines.push( [p2, q2] );
    }

    for (let ii=0; ii<draw_lines.length; ii++) {
      let p2 = draw_lines[ii][0];
      let q2 = draw_lines[ii][1];

      qm = [
        p2[0] + (q2[0] - p2[0])/2,
        p2[1] + (q2[1] - p2[1])/2,
      ];

      //let co = hsl_lerp( p_idx / n );
      let co = colormap_f( p_idx / n );

      let l_bg = two.makeLine( p2[0], p2[1], qm[0], qm[1] );
      l_bg.noFill();
      l_bg.stroke = bg_co;
      l_bg.linewidth = bg_diam;
      l_bg.cap = "butt";

      let _c = two.makeCircle( p2[0], p2[1], 3*bg_diam/5 );
      _c.noStroke();
      _c.fill = bg_co;
      _c.fill = "rgb(220,220,220)";
    }

    for (let ii=0; ii<draw_lines.length; ii++) {
      let p2 = draw_lines[ii][0];
      let q2 = draw_lines[ii][1];

      qm = [
        p2[0] + (q2[0] - p2[0])/2,
        p2[1] + (q2[1] - p2[1])/2,
      ];

      //let co = hsl_lerp( p_idx / n );
      let co = colormap_f( p_idx / n );

      let l = two.makeLine( p2[0], p2[1], qm[0], qm[1] );
      l.noFill();
      l.stroke = co;
      l.linewidth = fg_lw;
      l.cap = "round";
    }

  }

}



//----
//----
//----

function MAIN() {
  let two = g_fig_ctx.two;

  var ele = document.getElementById("canvas_id");
  two.appendTo(ele);

  let vr = [0,0,1];
  //vr = [-1.5,0.4,1];
  vr = [-0.3,0.25,1];
  let theta = Math.PI/4 + Math.PI/6;
  theta = -Math.PI/2 + Math.PI/9;
  theta = -Math.PI/2 + Math.PI/9 - 0.1;

  let pnts_all = bridges2026;

  let pnts = [];
  let pnts_idx = [];
  for (let i=0; i<8; i++) { pnts_idx.push(COLOR_IDX[i]); }
  for (let i=0; i<COLOR_IDX[7]; i++) {
    pnts.push(pnts_all[i]);
  }

  let mM = [ [0,0,0], [0,0,0] ];
  for (let i=0; i<COLOR_IDX[7]; i++) {
    if (i==0) {
      mM[0][0] = pnts[i][0];
      mM[0][1] = pnts[i][1];
      mM[0][2] = pnts[i][2];
      mM[1][0] = pnts[i][0];
      mM[1][1] = pnts[i][1];
      mM[1][2] = pnts[i][2];
    }

    for (let j=0; j<3; j++) {
      if (mM[0][j] > pnts[i][j]) { mM[0][j] = pnts[i][j]; }
      if (mM[1][j] < pnts[i][j]) { mM[1][j] = pnts[i][j]; }
    }
  }

  let WHD = [mM[1][0]+1, mM[1][1]+1, mM[1][2]+1];

  let xy0 = [40,350];

  let s = 7;

  let colormap_f = mk_colormap_f(pnts_idx, PAL12);
  mkg3curve(xy0, WHD, s, vr, theta, pnts, colormap_f);

  two.update();
}

function _MAIN() {
  let two = g_fig_ctx.two;

  var ele = document.getElementById("canvas_id");
  two.appendTo(ele);

  let vr = [0,0,1];
  //vr = [-1.5,0.4,1];
  vr = [-0.3,0.25,1];
  let theta = Math.PI/4 + Math.PI/6;

  theta = -Math.PI/2 + Math.PI/9;

  theta = -Math.PI/2 + Math.PI/9 - 0.1;

  let pnts = bridges2026;

  let mM = [ [0,0,0], [0,0,0] ];
  for (let i=0; i<pnts.length; i++) {
    if (i==0) {
      mM[0][0] = pnts[i][0];
      mM[0][1] = pnts[i][1];
      mM[0][2] = pnts[i][2];
      mM[1][0] = pnts[i][0];
      mM[1][1] = pnts[i][1];
      mM[1][2] = pnts[i][2];
    }

    for (let j=0; j<3; j++) {
      if (mM[0][j] > pnts[i][j]) { mM[0][j] = pnts[i][j]; }
      if (mM[1][j] < pnts[i][j]) { mM[1][j] = pnts[i][j]; }
    }
  }

  let WHD = [mM[1][0]+1, mM[1][1]+1, mM[1][2]+1];

  let xy0 = [40,350];

  let s = 7;

  let colormap_f = mk_colormap_f(COLOR_IDX, PAL12);
  mkg3curve(xy0, WHD, s, vr, theta, pnts, colormap_f);

  console.log("...");

  two.update();
}


