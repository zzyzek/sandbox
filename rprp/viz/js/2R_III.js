// LICENSE: CC0
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

//---
//---
//---


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

  let two = g_fig_ctx.two;

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



//---
//---
//---


function _dl() {
  var ele = document.getElementById("2R_canvas");
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

  // rescale subscript HACK
  //
  if (_id.slice(0,2) == "m_") {

    if (true) {

    if (sgr.children.length > 0) {
    if (sgr.children[0].children.length > 0) {
    if (sgr.children[0].children[0].children.length > 1) {
    if (sgr.children[0].children[0].children[1].children.length > 1) {
        sgr.children[0].children[0].children[1].children[1].scale.x = s_sub;
        sgr.children[0].children[0].children[1].children[1].scale.y = s_sub;
    }
    }
    }
    }

    }
  }
  else {

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

  }

  //yep, needed, so we can then get the make element
  //
  two.update();

  let mask = document.getElementById(sgr.mask.id);
  mask.firstChild.setAttribute("d", "M -4000 -4000 L 4000 -4000 L 4000 4000 L -4000 4000 Z");

  two.update();
}


//---
//---
//---

function display_polygon(pgn) {
  let two = g_fig_ctx.two;

  for (let i=0; i<pgn.length; i++) {
    two.makeRectangle(pgn[i][0], pgn[i][1], 5,5);
  }

  for (let i=1; i<pgn.length; i++) {
    two.makeLine( pgn[i-1][0], pgn[i-1][1], pgn[i][0], pgn[i][1] );
  }

  if (pgn.length > 2) {
    two.makeLine( pgn[pgn.length-1][0], pgn[pgn.length-1][1], pgn[0][0], pgn[0][1] );
  }

}

function display_region(pgn) {
  let two = g_fig_ctx.two;

  let p = [];

  for (let i=0; i<pgn.length; i++) {
    p.push( new Two.Vector( pgn[i][0], pgn[i][1] ) );
  }

  let p_disp = two.makePath(p);
  p_disp.fill = 'url(#pattern-Rdiag-big1)';
  p_disp.noStroke();


}

function highlight_index_point(pgn, idx) {
  let two = g_fig_ctx.two;

  let c = two.makeCircle( pgn[idx][0], pgn[idx][1], 4);
  //c.noFill();
  //c.stroke = "#f22";
}

function mkInnerGrid(pgn) {
  let two = g_fig_ctx.two;

  let rp_info = rprp.init(pgn);

  let X = rp_info.X,
      Y = rp_info.Y,
      G = rp_info.G,
      Gij = rp_info.Gij,
      Gxy = rp_info.Gxy;


  for (let y_idx=0; y_idx<Y.length; y_idx++) {
    for (let x_idx=0; x_idx<X.length; x_idx++) {
      let v_idx = Gij[y_idx][x_idx];
      if (v_idx < 0) { continue; }

      let v_xy = Gxy[v_idx];

      let x_nxt_idx = x_idx+1;
      if (x_nxt_idx < X.length) {
        let u_idx = Gij[y_idx][x_nxt_idx];
        if (u_idx >= 0) {
          let u_xy = Gxy[u_idx];
          let l = two.makeLine( v_xy[0], v_xy[1], u_xy[0], u_xy[1] );
          l.dashes = [2,2];
          l.opacity = 0.5;
        }
      }

      let y_nxt_idx = y_idx+1;
      if (y_nxt_idx < Y.length) {
        let u_idx = Gij[y_nxt_idx][x_idx];
        if (u_idx >= 0) {
          let u_xy = Gxy[u_idx];
          let l = two.makeLine( v_xy[0], v_xy[1], u_xy[0], u_xy[1] );
          l.dashes = [2,2];
          l.opacity = 0.5;
        }
      }

      let c = two.makeCircle( v_xy[0], v_xy[1], 3 );
      c.opacity = 0.55;
    }
  }

}

function pgn2disp(_pgn, origin, grid_size) {
  origin = ((typeof origin === "undefined") ? [0,0] : origin);
  grid_size = ((typeof grid_size === "undefined") ? 15: grid_size );

  let pgn = [];

  for (let i=0; i<_pgn.length; i++) {
    pgn.push( [_pgn[i][0], _pgn[i][1]] );
  }


  let yY = [pgn[0][1], pgn[0][1]];
  for (let i=0; i<pgn.length; i++) {
    if (yY[0] > pgn[i][1]) { yY[0] = pgn[i][1]; }
    if (yY[1] < pgn[i][1]) { yY[1] = pgn[i][1]; }
  }

  let pgn_com = [0,0];

  for (let i=0; i<pgn.length; i++) {
    pgn[i][1] = yY[1] - pgn[i][1] + yY[0];

    pgn[i][0] *= grid_size;
    pgn[i][1] *= grid_size;

    pgn[i][0] += origin[0];
    pgn[i][1] += origin[1];

    pgn_com[0] += pgn[i][0];
    pgn_com[1] += pgn[i][1];
  }

  pgn_com[0] /= pgn.length;
  pgn_com[1] /= pgn.length;


  return pgn;
}

function pgnCoM(pgn) {
  let pgn_com = [0,0];
  for (let i=0; i<pgn.length; i++) {
    pgn_com[0] += pgn[i][0];
    pgn_com[1] += pgn[i][1];
  }
  pgn_com[0] /= pgn.length;
  pgn_com[1] /= pgn.length;
  return pgn_com;
}

function _2R_III_init() {
  let two = g_fig_ctx.two;

  let font_style = {
    "size": 18,
    "family": "Libertine, Linux Libertine 0"
  };

  var ele = document.getElementById("2R_canvas");
  two.appendTo(ele);

  //---

  let _pgn = [
    [0,8], [0,13], [3,13], [3,18],
    [5,18], [5,15], [9,15], [9,19],
    [18,19], [18,10], [13,10], [13,4],
    [7,4], [7,0], [3,0], [3,8],
  ];

  let pgn = pgn2disp(_pgn, [100,25], 20 );
  let pgn_com = pgnCoM( pgn );


  // l0, l1 points
  //

  //mathjax2twojs( "Q", pgn_com[0]-46, pgn_com[1] + 70, 0.018 );
  mathjax2twojs( "Q", pgn_com[0]-55, pgn_com[1] + 105, 0.025 );

  let tc_idx = [6,10];

  highlight_index_point( pgn, tc_idx[0] );
  highlight_index_point( pgn, tc_idx[1] );

  let a_pnt = pgn[tc_idx[0]];
  let b_pnt = pgn[tc_idx[1]];

  // alpha
  //

  let alpha_pnt = [ a_pnt[0], b_pnt[1] ];

  let l0 = two.makeLine( a_pnt[0], a_pnt[1], alpha_pnt[0], alpha_pnt[1] );
  let l1 = two.makeLine( alpha_pnt[0], alpha_pnt[1], b_pnt[0], b_pnt[1] );

  l0.dashes = [3,3];
  l1.dashes = [3,3];

  let alpha_disp = two.makeCircle( alpha_pnt[0], alpha_pnt[1], 4 );
  alpha_disp.noFill();
  alpha_disp.stroke = "#f22";

  mathjax2twojs( "alpha", alpha_pnt[0]+5, alpha_pnt[1]-5, 0.018 );

  //---

  let sub_pgn = [];
  for (let i=0; i<pgn.length; i++) {
    if ((i <= tc_idx[0]) || (i >= tc_idx[1])) {
      sub_pgn.push( pgn[i] );
    }
    if (i == tc_idx[0]) {
      sub_pgn.push(alpha_pnt);
    }
  }

  mkInnerGrid( sub_pgn );

  //console.log(pgn, sub_pgn);
  display_region( sub_pgn );

  // rectangle choice highlighting
  // ...inverted y apparently
  //

  let rp_info = rprp.init(pgn);

  let gp0_idx = rp_info.Gij[4][3];
  let gp1_idx = rp_info.Gij[5][3];
  let gp2_idx = rp_info.Gij[5][4];

  let gp0_xy = rp_info.Gxy[gp0_idx];
  let gp1_xy = rp_info.Gxy[gp1_idx];
  let gp2_xy = rp_info.Gxy[gp2_idx];

  let rect_l0_xy = [ (alpha_pnt[0] + gp0_xy[0])/2, (alpha_pnt[1] + gp0_xy[1])/2 ];
  let rect_l1_xy = [ (gp1_xy[0] + gp0_xy[0])/2, (gp1_xy[1] + gp0_xy[1])/2 ];
  let rect_l2_xy = [ (gp2_xy[0] + gp1_xy[0])/2, (gp2_xy[1] + gp1_xy[1])/2 ];
  let rect_l3_xy = [ (gp2_xy[0] + alpha_pnt[0])/2, (gp2_xy[1] + alpha_pnt[1])/2 ];

  let _rect_l0 = two.makeLine( alpha_pnt[0], alpha_pnt[1], gp0_xy[0], gp0_xy[1] );
  _rect_l0.dashes = [3,3];

  let _rect_l1 = two.makeLine( gp0_xy[0], gp0_xy[1], gp1_xy[0], gp1_xy[1] );
  _rect_l1.dashes = [3,3];

  let _rect_l2 = two.makeLine( gp1_xy[0], gp1_xy[1], gp2_xy[0], gp2_xy[1] );
  _rect_l2.dashes = [3,3];

  let _rect_l3 = two.makeLine( gp2_xy[0], gp2_xy[1], alpha_pnt[0], alpha_pnt[1] );
  _rect_l3.dashes = [3,3];

  let _rect_l0_txt = mathjax2twojs( "rect_l0", rect_l0_xy[0]-4, rect_l0_xy[1]-5, 0.018 );
  let _rect_l1_txt = mathjax2twojs( "rect_l1", rect_l1_xy[0] - 14, rect_l1_xy[1] + 4, 0.018 );
  let _rect_l2_txt = mathjax2twojs( "rect_l2", rect_l2_xy[0]-4, rect_l2_xy[1] + 15, 0.018 );
  let _rect_l3_txt = mathjax2twojs( "rect_l3", rect_l3_xy[0] + 5, rect_l3_xy[1] + 4, 0.018 );

  two.makeLine( gp0_xy[0], gp0_xy[1], gp0_xy[0], gp0_xy[1] - 30 );
  mkarrow( gp0_xy[0], gp0_xy[1] - 30, 0, -10, 5, 5 );
  mathjax2twojs( "rect_d0", gp0_xy[0]+3, gp0_xy[1]-33, 0.018 );

  two.makeLine( gp0_xy[0], gp0_xy[1], gp0_xy[0]-30, gp0_xy[1] );
  mkarrow( gp0_xy[0]- 30, gp0_xy[1] , -10, 0, 5, 5 );
  mathjax2twojs( "rect_d1", gp0_xy[0]-35, gp0_xy[1]-8, 0.018 );

  two.makeLine( gp1_xy[0], gp1_xy[1], gp1_xy[0]-30, gp1_xy[1] );
  mkarrow( gp1_xy[0]- 30, gp1_xy[1] , -10, 0, 5, 5 );
  mathjax2twojs( "rect_d2", gp1_xy[0]-35, gp1_xy[1]-8, 0.018 );

  two.makeLine( gp1_xy[0], gp1_xy[1], gp1_xy[0], gp1_xy[1] + 30 );
  mkarrow( gp1_xy[0], gp1_xy[1] + 30, 0, 10, 5, 5 );
  mathjax2twojs( "rect_d3", gp1_xy[0]+5, gp1_xy[1]+38, 0.018 );

  two.makeLine( gp2_xy[0], gp2_xy[1], gp2_xy[0], gp2_xy[1] + 30 );
  mkarrow( gp2_xy[0], gp2_xy[1] + 30, 0, 10, 5, 5 );
  mathjax2twojs( "rect_d4", gp2_xy[0]+5, gp2_xy[1]+38, 0.018 );

  two.makeLine( gp2_xy[0], gp2_xy[1], gp2_xy[0]+30, gp2_xy[1] );
  mkarrow( gp2_xy[0] + 30, gp2_xy[1] , 10, 0, 5, 5 );
  mathjax2twojs( "rect_d5", gp2_xy[0]+28, gp2_xy[1]-8, 0.018 );

  let _c_gp0 = two.makeCircle( gp0_xy[0], gp0_xy[1], 5 );
  let _c_gp1 = two.makeCircle( gp1_xy[0], gp1_xy[1], 5 );
  let _c_gp2 = two.makeCircle( gp2_xy[0], gp2_xy[1], 5 );


  // kappa
  //

  let k_pnt = [ b_pnt[0], a_pnt[1] ];
  let k_disp = two.makeCircle( k_pnt[0], k_pnt[1], 4 );
  k_disp.noFill();
  k_disp.stroke = "#00f";
  k_disp.opacity = 0.5;
  k_disp.linewidth = 1.5;

  let k_l0 = two.makeLine( a_pnt[0], a_pnt[1], k_pnt[0], k_pnt[1] );
  let k_l1 = two.makeLine( k_pnt[0], k_pnt[1], b_pnt[0], b_pnt[1] );

  k_l0.opacity = 0.5;
  k_l1.opacity = 0.5;
  k_l0.dashes = [3,3];
  k_l1.dashes = [3,3];

  mathjax2twojs( "kappa", k_pnt[0] + 5, k_pnt[1] - 5, 0.018 );


  display_polygon( pgn );

  two.update();
}
