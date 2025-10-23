
var njs = require("./numeric.js");

function _drnd(a) { return Math.random()*a; }
function _trnd() { return _drnd(2*Math.PI); }
function _0pi_rnd() { return _drnd(Math.PI); }

function _rnd_sphere3() {
  let u = Math.random();
  let v = Math.random();

  let theta = 2 * Math.PI * u;
  let phi = Math.acos(2*v-1);

  let r = Math.cbrt(Math.random());

  let ct = Math.cos(theta);
  let st = Math.sin(theta);

  let cp = Math.cos(phi);
  let sp = Math.sin(phi);

  let x = r*sp*ct;
  let y = r*sp*st;
  let z = r*cp;

  return [x,y,z];
}

function _rnd_sphere2() {
  let _n3 = _rnd_sphere3();
  let _n2 = njs.mul( 1/njs.norm2(_n3), _n3 );
  return _n2;
}


function RodriguesMatrix( wx, wy, wz, theta ) {
  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let W = [
    [ 0, -wz, wy ],
    [ wz, 0, -wx ],
    [ -wy, wx, 0 ]
  ];

  let R = njs.add(
    njs.identity(3),
    njs.mul(s, W),
    njs.mul(1-c, njs.dot(W,W))
  );

  return R;
}

function _rndSO3(lambda) {
  lambda = ((typeof lambda === "undefined") ? 1 : lambda);
  let nxyz = _rnd_sphere2();
  let theta = lambda*Math.random()*Math.PI;
  return RodriguesMatrix( nxyz[0], nxyz[1], nxyz[2], theta );
}

function SO3_nw(R) {

  let _eps = (1/(1024*1024));

  let Tr = R[0][0] + R[1][1] + R[2][2];
  let theta = Math.acos( (Tr - 1)/2 );
  let _2st = 2*Math.sin(theta);

  let RmRt = njs.sub( R, njs.transpose(R) );

  let wx = 0,
      wy = 0,
      wz = 1;

  // redundant?
  //
  let s = 1;
  if (theta >= Math.PI) {
    theta = 2*Math.PI - theta;
    s = -1;
  }

  if ( Math.abs(_2st) > _eps ) {
    wz = -s*RmRt[0][1] / _2st;
    wy =  s*RmRt[0][2] / _2st;
    wx = -s*RmRt[1][2] / _2st;
  }
  
  return [wx,wy,wz, theta];
}
//function SO3_pnt(nxyz, w) { return [ nxyz[0]*w, nxyz[1]*w, nxyz[2]*w ]; }
function SO3_pnt(nxyzw) { let w = nxyzw[3]; return [ nxyzw[0]*w, nxyzw[1]*w, nxyzw[2]*w ]; }

function ok() {
  console.log("...");

  let _n3 = _rnd_sphere3();
  let _n2 = njs.mul( 1/njs.norm2(_n3), _n3 );
  let _theta = Math.PI*Math.random();

  let R = RodriguesMatrix(_n2[0], _n2[1], _n2[2], _theta);

  let wxyzt = SO3_nw(R);

  console.log(">>>>", _n2, _theta, "==?==", wxyzt);

}
//ok();

function SO3_walks(T, n_it) {

  let lambda = 1/128;

  n_it = 1;

  for (let it=0; it < n_it; it++) {

    let Rt = njs.identity(3);

    console.log("0 0 0");

    for (let t=0; t<T; t++) {
      let Rnxt = _rndSO3(lambda);

      Rt = njs.dot(Rnxt, Rt);


      let nxyzw = SO3_nw(Rt);
      let p = SO3_pnt(nxyzw);

      console.log(p[0], p[1], p[2]);


    }

    console.log("\n");

  }
}

SO3_walks(10000,1);


function yep() {
  console.log("...");

  let _n3 = _rnd_sphere3();
  let _n2 = njs.mul( 1/njs.norm2(_n3), _n3 );

  let _n = _n2;

  let _theta = _trnd();

  console.log("theta:", _theta);

  let _R = RodriguesMatrix(_n[0],_n[1],_n[2], _theta);
  let _Ri = RodriguesMatrix(_n[0],_n[1],_n[2], -_theta);

  let _ri = njs.inv(_R);

  //let _Ri = njs.inv( _R );

  console.log( njs.dot(_n, _n) );

  //console.log(_R, njs.dot(_R, njs.transpose(_R)));
  console.log(_Ri, "...", njs.dot(_R, _Ri) , njs.dot(_Ri, _R) );
  console.log(_ri, "...", njs.dot(_R, _ri) , njs.dot(_ri, _R) );
}

//yep();

function it_2sphere() {
  for (let it=0; it<10000; it++) {
    let v = _rnd_sphere2();
    console.log(v[0], v[1], v[2]);
  }
}


