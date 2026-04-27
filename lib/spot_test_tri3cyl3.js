
var _rnd = Math.random;

var tc3 = require("./tri3cyl3.js");
var fasslib = require("./fasslib.js");
var njs = require("./numeric.js");
var printf = require("./printf.js");
var fs = require("fs");

let cylinder_template = {
  "axis": {
    "origin": [0,0,0],
    "direction": [0,0,0]
  },
  "radius": 0,
  "height": 0
};

let aabox_template = {
  "extent": [0,0,0]
};

function gnuplot_cyl(cyl) {
  let h2 = cyl.height/2;
  let r = cyl.radius;

  let o = cyl.axis.origin;
  let Np = njs.mul( 1/njs.norm2( cyl.axis.direction ), cyl.axis.direction );
  let p0 = njs.add( cyl.axis.origin, njs.mul( h2, Np ) );
  let p0n = njs.add( cyl.axis.origin, njs.mul( -h2, Np ) );

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

  //console.log(p0[0], p0[1], p0[2]);
  //console.log(u[0], u[1], u[2]);
  //console.log("\n\n");

  let vvn_prv = [0,0,0],
      vvp_prv = [0,0,0];

  let vvp = [0,0,0],
      vvn = [0,0,0];

  let nseg = 32;
  for (let i=0; i<nseg; i++) {
    let du = njs.sub( u, p0 );

    du = njs.mul( r / njs.norm2(du), du );

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
  "axis": {
    "origin": [ _rnd(), _rnd(), _rnd() ],
    "direction": [ _rnd(), _rnd(), _rnd() ]
  },
  "radius": _rnd(),
  "height": 2*(_rnd() + 0.25)
};

//WIP!!
let tri = {
  "v": [
    [ _rnd(), _rnd(), _rnd() ],
    [ _rnd(), _rnd(), _rnd() ],
    [ _rnd(), _rnd(), _rnd() ]
  ]
};


// debuggin:

function xx0() {
  cyl = {
    "axis": {
      "origin":[0.6393496950159535,0.8273264439388542,0.7992980168077315],
      "direction":[0.31442705503130275,0.9703169337126332,0.5903317029721229]
    },
    "radius":0.21934334532056354,
    "height":1.8340997751603152
  }
  box = {
    "extent":[0.12914260659112098,0.712213902558396,0.407944440469886]
  }

}

// failure example:
//
cyl = {
  "axis": {
    "origin":[0.7631507940669574,0.09326847154694118,0.9520116034160175],
    "direction":[0.6335795253495434,0.6655676345831684,0.5881863379681979]
  },
  "radius":0.2862711500943965,
  "height":2.350012826817509
};

box = {"extent":[0.5390840990095296,0.9884131680096593,0.10233693440969227]}

function _box2tris(box) {
  let tris = [];

  let dx = box.extent[0];
  let dy = box.extent[1];
  let dz = box.extent[2];

  // top
  //
  tris.push({ "v": [
    [ -dx, -dy,  dz ],
    [ -dx,  dy,  dz ],
    [  dx,  dy,  dz ]
  ]});

  tris.push({ "v": [
    [  dx,  dy,  dz ],
    [ -dx, -dy,  dz ],
    [  dx, -dy,  dz ]
  ]});


  // left
  //
  tris.push({ "v": [
    [ -dx, -dy, -dz ],
    [ -dx,  dy, -dz ],
    [ -dx,  dy,  dz ]
  ]});

  tris.push({ "v": [
    [ -dx, -dy,  dz ],
    [ -dx,  dy,  dz ],
    [ -dx, -dy, -dz ]
  ]});

  // back
  //
  tris.push({ "v": [
    [ -dx,  dy, -dz ],
    [ -dx,  dy,  dz ],
    [  dx,  dy,  dz ]
  ]});

  tris.push({ "v": [
    [  dx,  dy,  dz ],
    [ -dx,  dy, -dz ],
    [  dx,  dy, -dz ]
  ]});

  // right
  //
  tris.push({ "v": [
    [  dx,  dy,  dz ],
    [  dx, -dy,  dz ],
    [  dx, -dy, -dz ]
  ]});

  tris.push({ "v": [
    [  dx,  dy,  dz ],
    [  dx, -dy, -dz ],
    [  dx,  dy, -dz ]
  ]});

  // front
  //
  tris.push({ "v": [
    [ -dx, -dy,  dz ],
    [  dx, -dy,  dz ],
    [ -dx, -dy, -dz ]
  ]});

  tris.push({ "v": [
    [  dx, -dy,  dz ],
    [ -dx, -dy, -dz ],
    [  dx, -dy, -dz ]
  ]});

  // bottom
  //
  tris.push({ "v": [
    [  dx,  dy, -dz ],
    [ -dx,  dy, -dz ],
    [ -dx, -dy, -dz ]
  ]});

  tris.push({ "v": [
    [  dx,  dy, -dz ],
    [ -dx, -dy, -dz ],
    [  dx, -dy, -dz ]
  ]});

  return tris;
}

function gnuplot_tris(ofn, tris) {

  let tris_lines = [];
  for (let i=0; i<tris.length; i++) {
    let v = tris[i].v;
    for (let j=0; j<v.length; j++) {
      tris_lines.push( printf("%f %f %f", v[j][0], v[j][1], v[j][2]) );
    }
    tris_lines.push( printf("%f %f %f\n\n", v[0][0], v[0][1], v[0][2]) );
  }

  fs.writeFileSync(ofn, tris_lines.join("\n"));
}

let tris = _box2tris(box);
gnuplot_tris( "tris.gp", tris);


console.log("#cyl");
//gnuplot_cyl("cyl.gp", cyl);
gnuplot_cyl(cyl);

//console.log("#box");
//gnuplot_aabox(box);

//console.log("#tris");
//gnuplot_tris(tris);

for (let i=0; i<tris.length; i++) {
  console.log("##intr", i, tc3.IntrTriangle3Cylinder3(tris[i], cyl));
}

console.log( "#", JSON.stringify(cyl));
console.log( "#", JSON.stringify(box));

