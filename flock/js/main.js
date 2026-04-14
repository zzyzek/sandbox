// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


var CANVAS_ID = 'twojs_canvas';

var _rnd = Math.random;

var g_ctx = {
  "T_prv": null,
  "two": null,
  "S": []
}

function _MoI() {
}

function updateS(s) {
  let pi2 = 2*Math.PI;
  s.theta += s.w;
  if (s.theta > pi2) { s.theta -= pi2; }
  if (s.theta < 0) { s.theta += pi2; }

  s.w *= 0.95;
  s.w += (_rnd() - 0.5)/32;
}

function dispS(s) {
  let two = g_ctx.two;

  let c = two.makeCircle(s.p[0], s.p[1], s.r);
  c.fill = "rgb(120,120,120)";

  let u = [ s.p[0] + s.r*Math.cos(s.theta), s.p[1] + s.r*Math.sin(s.theta) ]

  let l = two.makeLine(s.p[0], s.p[1], u[0], u[1] );
  l.noFill();
  l.stroke = "rgb(255,200,200)";
  l.linewidth = 3;
}

function initTwoJS() {
  let two = new Two({"fitted":true});

  let w = two.width;
  let h = two.height;

  g_ctx.two = two;

  let ele = document.getElementById(CANVAS_ID);
  two.appendTo(ele);

  let R = two.makeRectangle(w/2,h/2,w,h);
  R.noFill();
  R.linewidth = 4;
  R.stroke = "rgb(50,32,60)";

  let r = 20;
  let stride = 2.5*r;

  for (let y=0; y<8; y++) {
    for (let x = 0; x<10; x++) {
      g_ctx.S.push({
        "m": 1,
        "p": [ 2*r + x*stride, 2*r + y*stride],
        "r": r,
        "T_prv": 0,
        "T": 0,
        "w_prv" : 0,
        "w" : (_rnd()-0.5)*2/30,
        "theta": 2*Math.PI*_rnd()
      });

      dispS(g_ctx.S[ g_ctx.S.length-1 ]);
    }
  }

  g_ctx.T_prv = Date.now();
  two.update();
  requestAnimationFrame(anim);
  return two;
}

function update(dt) {
  for (let i=0; i<g_ctx.S.length; i++) {
    updateS( g_ctx.S[i] );
  }

}

function redraw() {
  let two = g_ctx.two;

  let w = two.width;
  let h = two.height;

  two.clear();

  let R = two.makeRectangle(w/2,h/2,w,h);
  R.noFill();
  R.linewidth = 4;
  R.stroke = "rgb(50,32,60)";

  for (let i=0; i<g_ctx.S.length; i++) {
    dispS( g_ctx.S[i] );
  }

  two.update();
}


function anim() {
  let two = g_ctx.two;

  let w = two.width;
  let h = two.height;

  let T = Date.now();
  let dt_s = (T - g_ctx.T_prv) / 1000;


  update(dt_s);
  redraw();

  g_ctx.T_prv = T;

  requestAnimationFrame(anim);
}
