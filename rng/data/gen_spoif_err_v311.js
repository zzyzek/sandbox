

function print_square( p, ds ) {

  console.log( p[0], p[1] );
  console.log( p[0] + ds, p[1] );
  console.log("\n\n");

  console.log( p[0] + ds, p[1] );
  console.log( p[0] + ds, p[1] + ds );
  console.log("\n\n");

  console.log( p[0] + ds, p[1] + ds );
  console.log( p[0] , p[1] + ds);
  console.log("\n\n");

  console.log( p[0] , p[1] + ds );
  console.log( p[0] , p[1] );
  console.log("\n\n");
}

// a anchor
// to b
//
function print_perp_line( a, b, _len ) {

  let ba = [ b[0] - a[0], b[1] - a[1] ];

  let v = [ -ba[1], ba[0] ];

  let dv = Math.sqrt( v[0]*v[0] + v[1]*v[1] );
  v[0] /= dv;
  v[1] /= dv;

  console.log( a[0] + v[0]*_len, a[1] + v[1]*_len );
  console.log( a[0] - v[0]*_len, a[1] - v[1]*_len );
  console.log("\n\n");

}

let p311 = [0.659538,0.811543];
let p9697 = [0.638765,0.800436];
let p6954 = [0.655036,0.789833];
let p5075 = [0.661445,0.807216];

let n_grid = 100;
let ds = 1.0 / n_grid;

let cell_origin = [ ds * Math.floor( n_grid * p311[0]), ds * Math.floor( n_grid * p311[1] ) ];
let c = cell_origin;

console.log("#v311\n", p311[0], p311[1], "\n\n");
console.log("#v9697\n", p9697[0], p9697[1], "\n\n");
console.log("#v6954\n", p6954[0], p6954[1], "\n\n");
console.log("#v5075\n", p5075[0], p5075[1], "\n\n");

print_square( c, ds );
print_square( [ c[0] - ds, c[1] - ds ], 3*ds );
print_square( [ c[0] - 2*ds, c[1] - 2*ds ], 5*ds );

print_perp_line( p5075, p311, .05 );
