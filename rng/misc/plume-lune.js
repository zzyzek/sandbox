// experiments for region that will
// close a side fence
//

var njs = require("../../lib/numeric.js");

var l = 1;
var L = 2;
var h = (L/2) - (l/2);

var ds = 1/128;

let E0 = [-L/2, h];
let E1 = [ L/2, h];

let p = [0,0];
p = [l/2, 0];

for (let x=-(L/2); x <= (L/2); x += ds) {
  for (let y=0; y <= (2*h); y += ds) {
    let q = [x,y];


    let Npq = njs.sub( q, p );
    Npq = njs.mul( 1.0 / njs.norm2( Npq ), Npq );

    let v0 = njs.dot( Npq, njs.sub( E0, q ) );
    let v1 = njs.dot( Npq, njs.sub( E1, q ) );


    if ((v0 > 0) && (v1 > 0)) {
      console.log(x,y);
    }




  }
}

