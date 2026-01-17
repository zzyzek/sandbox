// LICENSE: CC0
//

var CANVAS_ID = 'ui_canvas';
var g_fig_ctx = {
  "show_frame": false
};

let njs = numeric;

function _dl() {
  var ele = document.getElementById(CANVAS_ID);
  var b = new Blob([ ele.innerHTML ]);
  saveAs(b, "fig.svg");
}

function makeTwoAnchor(_pnt) {
  let pnt = [];
  for (let ii=0; ii<_pnt.length; ii++) {
    pnt.push( new Two.Anchor(_pnt[ii][0], _pnt[ii][1]) );
  }
  return pnt;
}

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
  mask.firstChild.setAttribute("d", "M -4000 -4000 L 8000 -4000 L 4000 4000 L -4000 4000 Z");

  two.update();
}

function show_frame(show) {
  let two = g_fig_ctx.two;
  show = ((typeof show === "undefined") ? g_fig_ctx.show_frame : show );

  if (show) {
    let f = two.makeRectangle( two.width/2, two.height/2, two.width, two.height );
    f.noFill();
    f.stroke = "rgb(0,0,0)";
    f.linewidth = 4;

  }
}

function fig_lune2d() {
  let two = new Two({"fitted":true});
  g_fig_ctx["two"] = two;

  let ele = document.getElementById(CANVAS_ID);
  two.appendTo(ele);

  show_frame();

  let fs = 18;
  let font_style = {
    "size": fs,
    "family": "Libertine, Linux Libertine 0"
  };

  let cxy = [200,100];

  let lw = 2;
  let lw2 = lw/2;
  let p = [cxy[0]-50,cxy[1]+50];
  let q = [cxy[0]+100,cxy[1]+80];
  let v = [cxy[0]+150,cxy[1]+30];


  let d_qp = njs.sub(q,p);
  let l_qp = njs.norm2(d_qp);
  let theta = Math.atan2( d_qp[1], d_qp[0] );

  //let a_p = two.makeArcSegment( p[0],p[1], l_qp-lw2,l_qp+lw2, theta + Math.PI/3, theta-Math.PI/3);
  let a_p = two.makeArcSegment( p[0],p[1], 0,l_qp, theta + Math.PI/3, theta-Math.PI/3);
  a_p.fill = "rgb(210,210,210)";
  a_p.stroke = "rgb(210,210,210)";

  let ao_p = two.makeArcSegment( p[0],p[1], l_qp-lw2,l_qp+lw2, theta + Math.PI/3, theta-Math.PI/3);
  ao_p.fill = "rgb(180,180,180)";
  ao_p.noStroke();

  //a_p.opacity = 0.15;

  //let a_q = two.makeArcSegment( q[0],q[1], l_qp-lw2,l_qp+lw2, (theta + Math.PI/3) + Math.PI, (theta-Math.PI/3) + Math.PI);
  let a_q = two.makeArcSegment( q[0],q[1], 0,l_qp+lw2, (theta + Math.PI/3) + Math.PI, (theta-Math.PI/3) + Math.PI);
  a_q.fill = "rgb(210,210,210)";
  a_q.stroke = "rgb(210,210,210)";

  let ao_q = two.makeArcSegment( q[0],q[1], l_qp-lw2,l_qp+lw2, (theta + Math.PI/3) + Math.PI, (theta-Math.PI/3) + Math.PI);
  ao_q.fill = "rgb(180,180,180)";
  ao_q.noStroke();

  //a_q.opacity = 0.1;

  let line_pq = two.makeLine( p[0], p[1], q[0], q[1] );
  line_pq.dashes = [0,4,0];


  let txt_p = two.makeText( "p", p[0] - 10, p[1] - 5, font_style);
  let pnt_p = two.makeCircle(p[0],p[1], 2);
  pnt_p.noFill();
  pnt_p.stroke = "rgb(32,32,32)";

  let txt_q = two.makeText( "q", q[0] + 10, q[1] + 5, font_style);
  let pnt_q = two.makeCircle(q[0],q[1], 2);
  pnt_q.noFill();
  pnt_q.stroke = "rgb(32,32,32)";

  let txt_v = two.makeText( "v", v[0] + 10, v[1] + 5, font_style);
  let pnt_v = two.makeCircle(v[0],v[1], 2);
  pnt_v.noFill();
  pnt_v.stroke = "rgb(32,32,32)";

  let pq = njs.add(p,q);
  pq[0] /= 2;
  pq[1] /= 2;

  font_style.size = 23;
  let txt_R = two.makeText( "R", pq[0] + 20, pq[1] - 100, font_style );

  two.update();

  two.update();
  g_two = two;
  return two;
}

