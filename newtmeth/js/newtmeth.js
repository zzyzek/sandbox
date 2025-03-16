// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.


var njs = numeric;

const { abs, min, max, round } = Math;

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }

  return [round(r * 255), round(g * 255), round(b * 255)];
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

function _clamp(v, a,b) {
  if (v < a) { return a; }
  if (v > b) { return b; }
  return v;
}

var g_ctx = {
  //"two" : new Two({"fitted":true}),

  "width": 0,
  "height": 0,
  "scale": 0,

  // world to screen
  //
  "T": [
    [ 1,0,0 ],
    [ 0,1,0 ],
    [ 0,0,1 ]
  ],

  // screen to world
  //
  "t": [
    [ 1,0,0 ],
    [ 0,1,0 ],
    [ 0,0,1 ]
  ],

  "canvas": {},
  "ctx": {}

};

var _eps = 1/(1024*1024*1024);

function f_NM(xy) {

  let x = xy[0];
  let y = xy[1];

  let theta = Math.atan2(y,x);
  let r = Math.sqrt((x*x) + (y*y));

  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let _1 = [ [ 1, 0 ], [0, 1] ];
  let _m1 = [ [-1, 0 ], [0,-1] ];
  let z = [ [ r*c, r*s], [-r*s, r*c ] ];


  let p0 = njs.add( _1, z );
  let p1 = z;
  let p2 = njs.add( _m1, z );

  // derivative
  //
  let ppz = njs.add( _m1 , njs.mul( 3, njs.dot( z, z ) ) );

  let u = Math.sqrt(ppz[0][0]*ppz[0][0] + ppz[0][1]*ppz[0][1]);
  if (Math.abs(u) < _eps) { return [0,0]; }

  let ir = 1/u;
  let it = -Math.atan2(ppz[0][1], ppz[0][0]);

  let qc = Math.cos(it);
  let qs = Math.sin(it);

  // inverse
  //
  let qz = [[ ir*qc, ir*qs ], [ -ir*qs, ir*qc ] ];

  let pz = njs.dot( p0, njs.dot( p1, p2 ) );

  let z_nxt = njs.add(z, njs.mul(-1, njs.dot( pz, qz ) ) );

  return [ z_nxt[0][0], z_nxt[0][1] ];
}

function f(x,y) {

  let theta = Math.atan2(y,x);
  let r = Math.sqrt((x*x) + (y*y));

  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let t0 = [ [ r*c - 1,  r*s ], [ -r*s, r*c - 1 ] ];
  let t1 = [ [ r*c    ,  r*s ], [ -r*s, r*c     ] ];
  let t2 = [ [ r*c + 1,  r*s ], [ -r*s, r*c + 1 ] ];

  let z = njs.dot(t0, njs.dot(t1, t2));
  //let z = njs.dot( t1, t1 );

  return [ z[0][0], z[0][1] ];
}

function init() {
  g_ctx.canvas = document.getElementById("newtmeth_canvas");
  g_ctx.ctx = g_ctx.canvas.getContext("2d");

  g_ctx.width = g_ctx.canvas.width;
  g_ctx.height = g_ctx.canvas.height;

  let scale = 0.25;

  g_ctx.T[0][0] = scale*g_ctx.width;
  g_ctx.T[0][2] = g_ctx.width/2;
  g_ctx.T[1][1] = scale*g_ctx.width;
  g_ctx.T[1][2] = g_ctx.height/2;

  g_ctx.t = njs.inv(g_ctx.T);

  run(32);

}

function run(n_it) {

  n_it = ((typeof n_it === "undeifned") ? 4 : n_it);

  let imgdat = g_ctx.ctx.getImageData(0,0, g_ctx.width, g_ctx.height);
  let pxl = imgdat.data;

  let idx = 0;

  let _w = g_ctx.width;
  let _h = g_ctx.height;


  /*
  let _m = [0,0],
      _M = [0,0];
  for (let py=0; py < g_ctx.height; py++) {
    for (let px=0; px < g_ctx.width ; px++) {

      let wxy = njs.dot( g_ctx.t, [px,py,1] );
      let v = f(wxy[0], wxy[1]);

      if ((px==0) && (py==0)) {
        _m[0] = v[0];
        _m[1] = v[1];
        _M[0] = v[0];
        _M[1] = v[1];
        continue;
      }

      if ((_m[0] > v[0])) { _m[0] = v[0]; }
      if ((_m[1] > v[1])) { _m[1] = v[1]; }

      if ((_M[0] < v[0])) { _M[0] = v[0]; }
      if ((_M[1] < v[1])) { _M[1] = v[1]; }

    }
  }
  */

  let n_step = 16;
  n_step = 6;

  let thresh = 1/32;

  for (let py=0; py < g_ctx.height; py++) {
    for (let px=0; px < g_ctx.width ; px++) {

      let wxy = njs.dot( g_ctx.t, [px,py,1] );
      //let v = f(wxy[0], wxy[1]);

      //let v = f_NM(f_NM(f_NM(f_NM([wxy[0], wxy[1]]))));

      let it = 0;
      let v = [wxy[0], wxy[1]];
      while (it < n_it) {
        if ( Math.abs( v[0]*v[0] + v[1]*v[1] ) < thresh ) { break; }
        v = f_NM(v);
        it++;
      }



      //for (let it=0; it<n_it; it++) { v = f_NM(v); }
      //let v = f_NM(f_NM(f_NM(f_NM([wxy[0], wxy[1]]))));

      let v_theta = Math.atan2(v[1],v[0]);
      let v_r = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
      let vt_step = Math.floor( n_step * (v_theta + Math.PI) / (2*Math.PI) ) / n_step;


      //v_r *= 1/2;
      //v_r *= 32;

      //v_r = Math.abs( Math.log( Math.abs(v_r) ) )/32;
      v_r = 0.5;

      //!!!!
      vt_step = Math.floor( n_step * (it / n_it) ) / n_step;
      vt_step = (it % n_step) / n_step;
      //if (it > 0) { vt_step = Math.log( it / n_it ) / Math.log( 1 / n_it ); }


      //let rgb = hslToRgb( (v_theta + Math.PI) / (2*Math.PI), 0.8, _clamp(v_r, 0,1) );
      let rgb = hslToRgb( vt_step, 0.8, _clamp(v_r, 0,1) );

      idx = (py*_w*4) + (px*4);
      pxl[idx + 0] = rgb[0];
      pxl[idx + 1] = rgb[1];
      pxl[idx + 2] = rgb[2];
      pxl[idx + 3] = 255;
    }
  }

  g_ctx.ctx.putImageData(imgdat,0,0);


  // debug
  //g_ctx.ctx.fillRect(10,10,100,100);



}
