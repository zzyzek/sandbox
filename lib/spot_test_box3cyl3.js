
var _rnd = Math.random;

var bc3 = require("./box3cyl3.js");
var fasslib = require("./fasslib.js");
var njs = require("./numeric.js");

let cylinder_template = {
  "origin": [0,0,0],
  "direction": [0,0,0],
  "radius": 0,
  "height": 0
};

let aabox_template = {
  "extent": [0,0,0]
};



function gnuplot_cyl(cyl) {
  let h2 = cyl.height/2;
  let r = cyl.radius;

  let o = cyl.origin;
  let Np = njs.mul( 1/njs.norm2( cyl.direction ), cyl.direction );
  let p0 = njs.add( cyl.origin, njs.mul( h2, Np ) );
  let p0n = njs.add( cyl.origin, njs.mul( -h2, Np ) );

  let u = [ 0, Math.random(), Math.random() ];

  u[0] = ( -(Np[1]*(u[1] - p0[1])) - (Np[2]*(u[2] - p0[2])) + (Np[0]*p0[0]) ) / Np[0];

  //u = njs.mul( 1/njs.norm2(u), u );

  console.log(o[0], o[1], o[2]);
  console.log(p0[0], p0[1], p0[2]);
  console.log("\n\n");

  console.log(o[0], o[1], o[2]);
  console.log(p0n[0], p0n[1], p0n[2]);
  console.log("\n\n");

  /*
  console.log(p0[0], p0[1], p0[2]);
  console.log(p0[0] + Np[0], p0[1] + Np[1], p0[2] + Np[2]);
  console.log("\n\n");
  */

  console.log(p0[0], p0[1], p0[2]);
  console.log(u[0], u[1], u[2]);
  console.log("\n\n");

  let vvn_prv = [0,0,0],
      vvp_prv = [0,0,0];

  let vvp = [0,0,0],
      vvn = [0,0,0];

  let nseg = 32;
  for (let i=0; i<nseg; i++) {
    let du = njs.sub( u, p0 );

    let v = fasslib.rodrigues( du, Np, i*Math.PI*2/nseg );
    vvp = njs.add( v, p0 );
    console.log(p0[0], p0[1], p0[2]);
    console.log(vvp[0], vvp[1], vvp[2]);
    console.log("\n\n");

    v = fasslib.rodrigues( du, Np, i*Math.PI*2/nseg );
    vvn = njs.add( v, p0n );
    console.log(p0n[0], p0n[1], p0n[2]);
    console.log(vvn[0], vvn[1], vvn[2]);
    console.log("\n\n");

    console.log(vvn[0], vvn[1], vvn[2]);
    console.log(vvp[0], vvp[1], vvp[2]);
    console.log("\n\n");

    if (i>0) {
      console.log(vvn[0], vvn[1], vvn[2]);
      console.log(vvn_prv[0], vvn_prv[1], vvn_prv[2]);
      console.log("\n\n");

      console.log(vvp[0], vvp[1], vvp[2]);
      console.log(vvp_prv[0], vvp_prv[1], vvp_prv[2]);
      console.log("\n\n");

    }

    vvn_prv = vvn;
    vvp_prv = vvp;

  }

}

function gnuplot_aabox(box) {
  let E = box.extent;

  console.log( E[0], E[1], E[2]);
  console.log(-E[0], E[1], E[2]);
  console.log(-E[0],-E[1], E[2]);
  console.log( E[0],-E[1], E[2]);
  console.log( E[0], E[1], E[2]);

  console.log( E[0], E[1],-E[2]);
  console.log(-E[0], E[1],-E[2]);
  console.log(-E[0],-E[1],-E[2]);
  console.log( E[0],-E[1],-E[2]);
  console.log( E[0], E[1],-E[2]);
  console.log("\n\n");

  console.log( E[0],-E[1], E[2]);
  console.log( E[0],-E[1],-E[2]);
  console.log("\n\n");

  console.log(-E[0],-E[1], E[2]);
  console.log(-E[0],-E[1],-E[2]);
  console.log("\n\n");

  console.log(-E[0], E[1], E[2]);
  console.log(-E[0], E[1],-E[2]);
  console.log("\n\n");


}

let cyl = {
  "origin": [ _rnd(), _rnd(), _rnd() ],
  "direction": [ _rnd(), _rnd(), _rnd() ],
  "radius": _rnd(),
  "height": 2*(_rnd() + 0.25)
};

let box = {
  "extent": [ _rnd(), _rnd(), _rnd() ]
};


gnuplot_cyl( cyl);
gnuplot_aabox(box);
