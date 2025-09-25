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



//---
//---
//---


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

  let rp_info = rprp.rectilinearGridPoints(pgn);

  let Gv = rp_info.Gv;

  for (let y_idx=0; y_idx<Gv.length; y_idx++) {
    for (let x_idx=0; x_idx<Gv[y_idx].length; x_idx++) {
      let v = Gv[y_idx][x_idx];
      if (v.G_idx < 0) { continue; }

      let x_nxt_idx = x_idx+1;
      if (x_nxt_idx < Gv[y_idx].length) {
        let u = Gv[y_idx][x_nxt_idx];
        if (u.G_idx >= 0) {
          let l = two.makeLine( v.xy[0], v.xy[1], u.xy[0], u.xy[1] );
          l.dashes = [2,2];
          l.opacity = 0.5;
        }
      }

      let y_nxt_idx = y_idx+1;
      if (y_nxt_idx < Gv.length) {
        let u = Gv[y_nxt_idx][x_idx];
        if (u.G_idx >= 0) {
          let l = two.makeLine( v.xy[0], v.xy[1], u.xy[0], u.xy[1] );
          l.dashes = [2,2];
          l.opacity = 0.5;
        }
      }

      let c = two.makeCircle( v.xy[0], v.xy[1], 4 );
    }
  }


  for (let y_idx=0; y_idx<Gv.length; y_idx++) {
    for (let x_idx=0; x_idx<Gv[y_idx].length; x_idx++) {
      let v = Gv[y_idx][x_idx];
      if (v.G_idx < 0) { continue; }
      if (v.t != 'i') { continue; }

      let xy = v.xy;

      let c = two.makeCircle( xy[0], xy[1], 4 );
    }
  }

  console.log(rp_info);

}

function template_case(x,y) {
  let two = g_fig_ctx.two;

  let r = two.makeRectangle( 100, 150, 30, 30 );
  r.fill = 'url(#pattern-Rdiag-big)';

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

function _2R_init() {
  let two = g_fig_ctx.two;

  let font_style = {
    "size": 18,
    "family": "Libertine, Linux Libertine 0"
  };

  var ele = document.getElementById("2R_canvas");
  two.appendTo(ele);

  //---

  //template_case();

  let _pgn = [
    [0,9], [0,13], [3,13], [3,18],
    [6,18], [6,15], [9,15], [9,19],
    [18,19], [18,10], [13,10], [13,4],
    [7,4], [7,0], [3,0], [3,9],
  ];

  let pgn = pgn2disp(_pgn, [100,100], 15 );
  let pgn_com = pgnCoM( pgn );


  // l0, l1 points
  //

  mathjax2twojs( "Q", pgn_com[0]-46, pgn_com[1] + 70, 0.018 );

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
