// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

if (typeof module === "undefined") {
  var g_ctx = {
    "two":  new Two({"fitted":true})
  };
}


function makeTwoAnchor(_pnt) {
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt.push( new Two.Anchor(_pnt[ii][0], _pnt[ii][1]) );
  }
  return pnt;
}

function init_two() {
  let two = g_ctx.two;
  let ele = document.getElementById("ui_canvas");
  two.appendTo(ele);
  two.clear();

  g_ctx.two = two;
}

function offset_path(p, offset) {
  offset = ((typeof offset === "undefined") ? 1/8 : offset);

  let outline = [];

  let seg_r = [],
      seg_l = [];


  if (p.length < 2) { return []; }

  let n = p.length;

  let s_dv = fasslib.v_delta( fasslib.v_sub(p[1], p[0]) );
  let e_dv = fasslib.v_delta( fasslib.v_sub(p[n-1], p[n-2]) );

  let cap_s = [
    [ p[0][0] - (offset*s_dv[1]) - (offset*s_dv[0]), p[0][1] + (offset*s_dv[0]) - (offset*s_dv[1]) ],
    [ p[0][0] + (offset*s_dv[1]) - (offset*s_dv[0]), p[0][1] - (offset*s_dv[0]) - (offset*s_dv[1]) ]
  ];

  let cap_e = [
    [ p[n-1][0] + (offset*e_dv[1]) + (offset*e_dv[0]), p[n-1][1] - (offset*e_dv[0]) - (offset*e_dv[1]) ],
    [ p[n-1][0] - (offset*e_dv[1]) + (offset*e_dv[0]), p[n-1][1] + (offset*e_dv[0]) - (offset*e_dv[1]) ]
  ];

  for (let i=1; i<p.length; i++) {
    let u = fasslib.v_delta( fasslib.v_sub( p[i], p[i-1] ) );
    let u_r = [ -u[1], u[0] ];
    let v_r = [ u[1], -u[0] ];

    let mp = fasslib.v_mul( 1/2, fasslib.v_add(p[i], p[i-1]) );

    if (i>1) {
      let t = fasslib.v_delta( fasslib.v_sub( p[i-1], p[i-2] ) );
      let tl_r = [ -offset*t[1], offset*t[0] ];
      let tr_r = [ offset*t[1], -offset*t[0] ];

      let mpp = fasslib.v_mul( 1/2, fasslib.v_add( p[i-1], p[i-2] ) );
      let c = fasslib.cross3( [u[0], u[1], 0], [t[0], t[1], 0] );

      if (c[2] < 0.5) {
        seg_l.push( fasslib.v_add( mpp, fasslib.v_add( tl_r, fasslib.v_mul( (1/2) - offset, t ) ) ) );
        seg_r.push( fasslib.v_add( mpp, fasslib.v_add( tr_r, fasslib.v_mul( (1/2) + offset, t ) ) ) );
      }
      else if (c[2] > 0.5) {
        seg_l.push( fasslib.v_add( mpp, fasslib.v_add( tl_r, fasslib.v_mul( (1/2) + offset, t ) ) ) );
        seg_r.push( fasslib.v_add( mpp, fasslib.v_add( tr_r, fasslib.v_mul( (1/2) - offset, t ) ) ) );
      }

    }

    //BUG!!!!
    /*
    if (i < (n-1)) {

      let s = fasslib.v_delta( fasslib.v_sub( p[n-i-3], p[n-i-1] ) );
      let sl_r = [ -offset*s[1], offset*s[0] ];
      let sr_r = [ offset*s[1], -offset*s[0] ];

      let mmm = fasslib.v_mul( 1/2, fasslib.v_add( p[n-i-2], p[n-i-1] ) );
      let _c = fasslib.cross3( [u[0], u[1], 0], [s[0], s[1], 0] );

      if (_c[2] > 0.5) {
        seg_l.push( fasslib.v_add( mmm, fasslib.v_add( sr_r, fasslib.v_mul( (1/2) + offset, s ) ) ) );
      }
      else if (_c[2] < 0.5) {
        seg_l.push( fasslib.v_add( mmm, fasslib.v_add( sr_r, fasslib.v_mul( (1/2) - offset, s ) ) ) );
      }

    }
    */

    seg_l.push( fasslib.v_add(mp, fasslib.v_mul( offset, u_r ) ) );
    seg_r.push( fasslib.v_add(mp, fasslib.v_mul( offset, v_r ) ) );
  }

  let po = [ cap_s[0], cap_s[1] ];
  for (let i=0; i<seg_r.length; i++) {
    po.push(seg_r[i]);
  }
  po.push( cap_e[0] );
  po.push( cap_e[1] );
  for (let i=(seg_l.length-1); i>=0; i--) {
    po.push( seg_l[i] );
  }

  return po;
}

var g_g = {};

function redraw() {
  let two = g_ctx.two;

  two.clear();

  let S = 15;
  let ox = 50;
  let oy = 50;
  let dx = 2,
      dy = 3;

  let w = 50, h = 10;
  w=4;
  h=2;
  let n = w*h;

  let path = [];
  for (let i=0; i<n; i++) {
    let xy = gilbert.d2xy(i, w,h);
    path.push( [xy.x, xy.y] );
  }



  let po = offset_path(path, 1/4);

  g_g["po"] = po;
  g_g["path"] = path;

  let spo = [];
  let spo_bd = [];
  for (let i=0; i<po.length; i++) {
    spo.push( [ S*po[i][0] + ox, S*po[i][1] + oy ] );
    spo_bd.push( [ S*po[i][0] + ox + dx, S*po[i][1] + oy  + dy ] );
  }
  let tpo = makeTwoAnchor(spo);
  let tpo_bd = makeTwoAnchor(spo_bd);

  let tp_bd = two.makePath(tpo_bd);
  tp_bd.close = true;
  tp_bd.fill = "rgb(200,200,210)";
  tp_bd.stroke = tp_bd.fill;
  tp_bd.opacity = 0.5;

  let tp = two.makePath(tpo);
  tp.close = true;
  tp.fill = "rgb(240,230,210)";
  tp.stroke = "rgb(230,220,200)";
  tp.stroke = "rgb(220,220,190)";
  tp.linewidth = 2;

  //tp.fill = "rgb(250,240,220)";
  //tp.stroke = "rgb(240,230,210)";

  //tp.opacity = 0.9;
  //tp.opacity = 0.9;

  two.update();
}



// svg download
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


function webinit() {
  init_two();
  redraw();
}

if (typeof module !== "undefined") {
  var fasslib = require("./fasslib.js");
  var gilbert = require("./gilbert.js");

  function _main() {

    let S = 20;
    let ox = 50;
    let oy = 50;
    let dx = 5,
        dy = 5;

    let w = 50, h = 10;
    w = 4;
    h = 2;
    let n = w*h;

    let path = [];
    for (let i=0; i<n; i++) {
      let xy = gilbert.d2xy(i, w,h);
      path.push( [xy.x, xy.y] );
    }


    //console.log(path);
    let po = offset_path( path );



    for (let i=0; i<po.length; i++) {
      console.log(po[i][0], po[i][1]);
    }

  }



  _main();
}
