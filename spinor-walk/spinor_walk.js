// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//   
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

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

function _gnuplot_sphere(_r,_dr) {
  _r = ((typeof _r === "undefined") ? Math.PI : _r);
  _dr = ((typeof _dr === "undefined") ? (1/16) : _dr);


  let nxyz = _rnd_sphere2();

  console.log(nxyz[0]*_r, nxyz[1]*_r, nxyz[2]*_r);
  console.log(nxyz[0]*(_r+_dr), nxyz[1]*(_r+_dr), nxyz[2]*(_r+_dr));
  console.log("");
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

function SO3_pnt(nxyzw) { let w = nxyzw[3]; return [ nxyzw[0]*w, nxyzw[1]*w, nxyzw[2]*w ]; }

//---
//---
//---

function pdf_walk(ds, T, n_it) {
  
  for (let it=0; it<n_it; it++) {
    let Rt = njs.identity(3);
    for (let t=0; t < T; t++) {
      let Rnxt = _rndSO3(ds);
      Rt = njs.dot(Rnxt, Rt);
    }

    let nxyzw = SO3_nw(Rt);
    let p = SO3_pnt(nxyzw);
    let rho = njs.norm2(p);

    console.log(rho, 1);
  }
}

function pdf_square_walk(ds, T, n_it) {
  for (let it=0; it<n_it; it++) {
    let Rt = njs.identity(3);
    for (let t=0; t < T; t++) {
      let Rnxt = _rndSO3(ds);
      Rt = njs.dot(Rnxt, Rt);
    }

    let Rt_sq = njs.dot(Rt, Rt);

    let nxyzw = SO3_nw(Rt_sq);
    let p = SO3_pnt(nxyzw);
    let rho = njs.norm2(p);

    console.log(rho, 1);
  }
}

function fig3(N, L) {
  N = ((typeof N === "undefined") ? 40 : N);
  L = ((typeof L === "undefined") ? [0,10,(1/128)] : L);

  let sched = [];
  for (let i=0; i<N; i++) {

    let nxyz = _rnd_sphere2();
    let theta = Math.random()*Math.PI;
    let nxyzw = [ nxyz[0], nxyz[1], nxyz[2], theta ];
    sched.push(nxyzw);
  }


  let idx_N = Math.floor( (L[1] - L[0]) / L[2]);

  for (let idx=0; idx<=idx_N; idx++) {
    let lambda = L[0] + ((L[1] - L[0])*idx / idx_N);

    let Rt = njs.identity(3);
    for (let t=0; t<sched.length; t++) {
      let Rnxt = RodriguesMatrix( sched[t][0], sched[t][1], sched[t][2], lambda*sched[t][3] );
      Rt = njs.dot(Rnxt, Rt);
    }

    let theta = Math.acos( (Rt[0][0] + Rt[1][1] + Rt[2][2] - 1)/2 );

    console.log(lambda, theta);
  }

  console.log("\n\n");

  for (let idx=0; idx<=idx_N; idx++) {
    let lambda = L[0] + ((L[1] - L[0])*idx / idx_N);

    let Rt = njs.identity(3);
    for (let t=0; t<sched.length; t++) {
      let Rnxt = RodriguesMatrix( sched[t][0], sched[t][1], sched[t][2], lambda*sched[t][3] );
      Rt = njs.dot(Rnxt, Rt);
    }

    Rt = njs.dot(Rt,Rt);

    let theta = Math.acos( (Rt[0][0] + Rt[1][1] + Rt[2][2] - 1)/2 );

    console.log(lambda, theta);
  }

}

function fig3_sched(N, L) {
  N = ((typeof N === "undefined") ? 40 : N);
  L = ((typeof L === "undefined") ? [0,10,(1/128)] : L);

  let sched = [];
  for (let i=0; i<N; i++) {

    let nxyz = _rnd_sphere2();
    let theta = Math.random()*Math.PI;
    let nxyzw = [ nxyz[0], nxyz[1], nxyz[2], theta ];
    sched.push(nxyzw);
  }

  return sched;
}

function fig3_single(sched, L) {
  L = ((typeof L === "undefined") ? [0,10,(1/128)] : L);

  let idx_N = Math.floor( (L[1] - L[0]) / L[2]);

  for (let idx=0; idx<=idx_N; idx++) {
    let lambda = L[0] + ((L[1] - L[0])*idx / idx_N);

    let Rt = njs.identity(3);
    for (let t=0; t<sched.length; t++) {
      let Rnxt = RodriguesMatrix( sched[t][0], sched[t][1], sched[t][2], lambda*sched[t][3] );
      Rt = njs.dot(Rnxt, Rt);
    }

    let theta = Math.acos( (Rt[0][0] + Rt[1][1] + Rt[2][2] - 1)/2 );

    console.log(lambda, theta);
  }

}

function fig3_double(sched, L, offset) {
  L = ((typeof L === "undefined") ? [0,10,(1/128)] : L);
  offset = ((typeof offset === "undefined") ? 0 : offset);

  let idx_N = Math.floor( (L[1] - L[0]) / L[2]);

  for (let idx=0; idx<=idx_N; idx++) {
    let lambda = L[0] + ((L[1] - L[0])*idx / idx_N);

    let Rt = njs.identity(3);
    for (let t=0; t<sched.length; t++) {
      let Rnxt = RodriguesMatrix( sched[t][0], sched[t][1], sched[t][2], lambda*sched[t][3] );
      Rt = njs.dot(Rnxt, Rt);
    }

    Rt = njs.dot(Rt,Rt);

    let theta = Math.acos( (Rt[0][0] + Rt[1][1] + Rt[2][2] - 1)/2 );

    console.log(lambda, theta + offset);
  }

}

//---
//---
//---

function SO3_walks(T, n_it) {

  let lambda = 1/32;

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

// aux spot tests...
//

function spot_test1() {
  console.log("...");

  let _n3 = _rnd_sphere3();
  let _n2 = njs.mul( 1/njs.norm2(_n3), _n3 );
  let _theta = Math.PI*Math.random();

  let R = RodriguesMatrix(_n2[0], _n2[1], _n2[2], _theta);

  let wxyzt = SO3_nw(R);

  console.log(">>>>", _n2, _theta, "==?==", wxyzt);

}

function spot_test() {
  console.log("...");

  let _n3 = _rnd_sphere3();
  let _n2 = njs.mul( 1/njs.norm2(_n3), _n3 );

  let _n = _n2;

  let _theta = _trnd();

  console.log("theta:", _theta);

  let _R = RodriguesMatrix(_n[0],_n[1],_n[2], _theta);
  let _Ri = RodriguesMatrix(_n[0],_n[1],_n[2], -_theta);

  let _ri = njs.inv(_R);


  console.log( njs.dot(_n, _n) );

  console.log(_Ri, "...", njs.dot(_R, _Ri) , njs.dot(_Ri, _R) );
  console.log(_ri, "...", njs.dot(_R, _ri) , njs.dot(_ri, _R) );
}

function it_2sphere() {
  for (let it=0; it<10000; it++) {
    let v = _rnd_sphere2();
    console.log(v[0], v[1], v[2]);
  }
}

//----
//----
//----

// take random points in 3d sphere
//
function shell_bin(n_it) {
  for (let it=0; it<n_it; it++) {
    let p = _rnd_sphere3();
    let r = njs.norm2(p);
    console.log(r, 1);
  }
}

function _main() {

  let op = 'walk^2';
  op = 'fig3';

  if (op == "walk") {
    pdf_walk(1/8, 1000, 1000000);
  }

  else if (op == "walk^2") {
    pdf_square_walk(1/8, 1000, 10000);
  }

  else if (op == 'r3bin') {
    shell_bin(100000);
  }

  else if (op == 'fig3') {
    let sched = fig3_sched();
    fig3_single(sched);
    console.log("\n\n");
    fig3_double(sched, undefined, 3.5);
  }

}

_main();

