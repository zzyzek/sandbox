

function d2e(v) {
  let v2 = Math.floor(v/2);
  if ((v2%2)==0) { return v2; }
  return v2+1;
}

function d2q(v) {
  let v2 = Math.floor(v/2);
  if ((v2%2)==1) { return v2; }
  return v2+1;
}

function _divq(v,q) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push( Math.floor(v[i] / q) );
  }
  return u;
}
function _div2(v) { return _divq(v,2); }

function _sgn(v) {
  if (v>0) { return  1; }
  if (v<0) { return -1; }
  return 0;
}

function _neg(v) {
  if (v.length==2) {
    return [-v[0], -v[1]];
  }
  return [ -v[0], -v[1], -v[2] ];
}

function _add(u,v) {
  if ((u.length == 2) || (v.length == 2)) {
    return [ u[0]+v[0], u[1]+v[1] ];
  }
  return [ u[0]+v[0], u[1]+v[1], u[2]+v[2] ];
}

function _abs(v) {
  let s = 0;
  for (let i=0; i<v.length; i++) {
    s += Math.abs(v[i]);
  }
  return s;
}

function _delta(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push( _sgn(v[i]) );
  }
  return u;
}

function _print(v) {
  if (v.length == 2)  { console.log(v[0], v[1]); }
  else                { console.log(v[0], v[1], v[2]); }
}

function _clone(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push(v[i]);
  }
  return u;
}

//-------------------
//         ___     __
//   ___ _|_  |___/ /
//  / _ `/ __// _  / 
//  \_, /____/\_,_/  
// /___/             
//-------------------


function g2d_p(p, alpha, beta) {
  let a = _abs(alpha);
  let b = _abs(beta);

  let d_alpha = _delta(alpha);
  let d_beta  = _delta(beta);

  if (b==1) {

    let u = _clone(p);
    for (let i=0; i<a; i++) {
      _print(u);
      u = _add(u, d_alpha);
    }
    return;
  }

  if (a==1) {
    let u = _clone(p);
    for (let i=0; i<b; i++) {
      _print(u);
      u = _add(u, d_beta);
    }
    return;
  }


  let alpha2 = _div2(alpha);
  let beta2  = _div2(beta);

  let a2 = _abs(alpha2);
  let b2 = _abs(beta2);

  if ( (2*a) > (3*b) ) {
    if ((a2%2) && (a>2)) { alpha2 = _add(alpha2, d_alpha); }


    g2d_p(p, alpha2, beta);
    g2d_p( _add(p, alpha2),
           _add(alpha, _neg(alpha2)),
           beta);

    return;
  }


  if ((b2%2) && (b>2)) { beta2 = _add(beta2, d_beta); }

  g2d_p( p,
         beta2,
         alpha2);
  g2d_p( _add(p, beta2),
         alpha,
         _add(beta, _neg(beta2)) );
  g2d_p( _add(p,
              _add( _add(alpha, _neg(d_alpha) ),
                    _add(beta2, _neg( d_beta) ) ) ),
         _neg(beta2),
         _add(alpha2, _neg(alpha)) );

}

//-------------------
//         ____    __
//   ___ _|_  /___/ /
//  / _ `//_ </ _  / 
//  \_, /____/\_,_/  
// /___/             
//-------------------


function g3d_p(p, alpha, beta, gamma) {

  let alpha2  = _div2(alpha);
  let beta2   = _div2(beta);
  let gamma2  = _div2(gamma);

  // forced even axis
  //
  let alpha_2e = [ d2e(alpha[0]), d2e(alpha[1]), d2e(alpha[2]) ];
  let beta_2e  = [ d2e( beta[0]), d2e( beta[1]), d2e( beta[2]) ];
  let gamma_2e = [ d2e(gamma[0]), d2e(gamma[1]), d2e(gamma[2]) ];

  // remainder of even axis
  //
  let alpha_2s = [ alpha[0] - alpha_2e[0], alpha[1] - alpha_2e[1], alpha[2] - alpha_2e[2] ];
  let beta_2s  = [  beta[0] -  beta_2e[0],  beta[1] -  beta_2e[1],  beta[2] -  beta_2e[2]  ];
  let gamma_2s = [ gamma[0] - gamma_2e[0], gamma[1] - gamma_2e[1], gamma[2] - gamma_2e[2] ];

  // forced odd axis
  //
  let alpha_2q = [ d2q(alpha[0]), d2q(alpha[1]), d2q(alpha[2]) ];
  let beta_2q  = [ d2q( beta[0]), d2q( beta[1]), d2q( beta[2]) ];
  let gamma_2q = [ d2q(gamma[0]), d2q(gamma[1]), d2q(gamma[2]) ];

  // remainder of forced odd axis
  //
  let alpha_2qp = [ alpha[0] - alpha_2q[0], alpha[1] - alpha_2q[1], alpha[2] - alpha_2q[2] ];
  let beta_2qp  = [  beta[0] -  beta_2q[0],  beta[1] -  beta_2q[1],  beta[2] -  beta_2q[2] ];
  let gamma_2qp = [ gamma[0] - gamma_2q[0], gamma[1] - gamma_2q[1], gamma[2] - gamma_2q[2] ];

  // length of each axis
  //
  let a = _abs(alpha);
  let b = _abs(beta);
  let g = _abs(gamma);

  // (unit) direction of each axis
  //
  let d_alpha = _delta(alpha);
  let d_beta  = _delta(beta);
  let d_gamma = _delta(gamma);

  let xyz = [ p[0], p[1], p[2] ];

  // Two dimensions are 1, linear in the other,
  // so enumerate.
  //
  if ((a==1) && (b==1)) {
    for (let i=0; i<g; i++) {
      console.log(xyz[0], xyz[1], xyz[2]);
      xyz = _add( xyz, d_alpha );
    }
    return;
  }

  else if ((a==1) && (g==1)) {
    for (let i=0; i<b; i++) {
      console.log(xyz[0], xyz[1], xyz[2]);
      xyz = _add( xyz, d_beta );
    }
    return;
  }

  else if ((b==1) && (g==1)) {
    for (let i=0; i<g; i++) {
      console.log(xyz[0], xyz[1], xyz[2]);
      xyz = _add( xyz, d_gamma );
    }
    return;
  }

  // This is a pathological case.
  // If we have |alpha| = 1, it means
  // the start and end are the same point
  // but the region is non-trivial.
  //
  else if (a==1) {
    g2d_p( xyz, beta, gamma );
    return;
  }

  // Otherwse, we have a plane sheet,
  // so reduce to the 2d Gilbert case.
  //
  else if (b==1) {
    g2d_p( xyz, alpha, gamma );
    return;
  }

  else if (g==1) {
    g2d_p( xyz, alpha, beta );
    return;
  }

  //WIP!!!!
  // * need to check for end condition (a,b,g == 2)
  //   and act accordingly
  // * need to test
  //
  // note order is important:
  // - first test for w greater than both d,h (S_0, 1 case)
  // - test for h bigger then either w,d (S_2, 3 cases)
  // - test for d bigger than h (S_1, 2 cases)
  //

  // S_0
  //
  // width (\alpha) is larger than height/depth (\beta/\gamma)
  // (long skinny horizontal column)
  //
  // Split \alpha at halfway point.
  //
  if ( ((2*a) > (3*b)) &&
       ((2*a) > (3*g)) ) {
    g3d_p( xyz, alpha_2e, beta, gamma );
    g3d_p( _add(xyz, alpha_2e), alpha_2s, beta, gamma );
    return;
  }


  // S_2
  //
  // height (\beta) is too long
  // (long skinny height column or height/width sheet)
  //
  // Split by \rho = 2/3 in \beta axis
  //   and by 1/2 in \alpha axis
  //
  //
  else if ( ((2*b) > (3*g)) ||
            ((2*b) > (3*a)) ) {

    //TODO!!!
    // handle special case where |alpha| == 2 (or other dimensions)
    //

    let beta_13   = _divq(beta, 3);
    let beta_13e  = [ d2e(beta_13[0]), d2e(beta_13[1]), d2e(beta_13[2]) ];
    let beta_23s  = [ beta[0] - beta_13e[0], beta[1] - beta_13e[1], beta[2] - beta_13e[3] ];

    g3d_p( xyz, beta_13e, gamma, alpha_2e );

    g3d_p( _add(xyz, beta_13e),
          alpha,
          beta_23s,
          gamma);

    g3d_p(_add(xyz, _add(alpha, beta_13e)),
          _neg(beta_13e),
          gamma,
          _neg(alpha_2s));

    return;
  }

  // S_1
  //
  // depth (\gamma) too long
  //
  // Split by \rho = 2/3 in \gamma dimension
  // and then again by 1/2 in \alpha dimension
  //
  else if ( (2*g) > (3*b) ) {

    //TODO!!!
    // handle special case where |alpha| == 2 (or other dimensions)
    //

    let gamma_13   = _divq(gamma, 3);
    let gamma_13e  = [ d2e(gamma_13[0]), d2e(gamma_13[1]), d2e(gamma_13[2]) ];
    let gamma_23s  = [ gamma[0] - gamma_13e[0], gamma[1] - gamma_13e[1], gamma[2] - gamma_13e[3] ];

    g3d_p(xyz,
          gamma_13e,
          alpha_2e,
          beta);

    g3d_p(_add(xyz, gamma_13e),
          alpha,
          beta,
          gamma_23s);

    g3d_p(_add(xyz, _add(alpha, gamma_13e)),
          _neg(gamma_23s),
          _neg(alpha_2s),
          beta);

    return;

  }



  // bulk recursion
  //

  if ((g%2) == 0) {

    xyz = [ p[0], p[1], p[2] ];
    g3d_p( xyz, beta_2e, gamma_2e, alpha_2e );

    xyz = _add(p, beta_2e);
    g3d_p( xyz, gamma, alpha_2e, beta_2s );

    xyz = _add( _add(p, beta_2e), gamma );
    g3d_p( xyz, alpha, _neg(beta_2s), _neg(gamma_2s) );

    xyz = _add( _add( _add(p, beta_2e), alpha ), gamma);
    g3d_p( xyz, _neg(gamma), _neg(alpha_2s), beta_2s );

    xyz = _add( _add(p, beta_2e), alpha );
    g3d_p( xyz, _neg(beta_2e), gamma_2e, _neg(alpha_2s) );

    return;
  }

  // g == 1
  //
  else if ((b%2) == 0) {

    xyz = [ p[0], p[1], p[2] ];
    g3d_p( xyz, gamma_2e, alpha_2e, beta_2e );

    xyz = _add( p, gamma_2e );
    g3d_p( xyz, beta, gamma_2s, alpha_2e );

    xyz = _add( _add( p, gamma_2e ), beta );
    g3d_p( xyz, alpha, _neg(beta_2s), _neg(gamma_2s) );

    xyz = _add( _add( _add( p, gamma_2e ), beta ), alpha );
    g3d_p( xyz, _neg(beta), gamma_2s, _neg(alpha_2s) );

    xyz = _add( _add( p, alpha ), gamma_2e );
    g3d_p( xyz, _neg(gamma_2e), _neg(alpha_2s), beta_2e );

    return;
  }

  // g == 1
  // b == 1
  //
  else if ((a%2) == 0) {

    xyz = [ p[0], p[1], p[2] ];
    g3d_p( xyz, gamma_2e, alpha_2q, beta_2e );

    xyz = _add(p, gamma_2e);
    g3d_p( xyz, beta, gamma_2q, alpha_2q );

    xyz = _add( _add( p, gamma_2e ), beta );
    g3d_p( xyz, alpha, _neg(beta_2q), _neg(gamma_2q) );

    xyz = _add( _add( _add( p, gamma_2e ), beta ), alpha );
    g3d_p( xyz, _neg(beta), _neg(gamma_2q), alpha_2qp );

    xyz = _add( _add( p, alpha ), gamma_2e );
    g3d_p( xyz, _neg(gamma_2e), _neg(alpha_2qp), beta_2e );

    return;
  }

  // g == 1
  // b == 1
  // a == 1
  //

  xyz = [ p[0], p[1], p[2] ];
  g3d_p( xyz, beta_2e, gamma, alpha_2e );

  xyz = _add( p, beta_2e );
  g3d_p( xyz, gamma_2e, alpha, beta_2q );

  xyz = _add( _add( p, beta_2e ), gamma_2e );
  g3d_p( xyz, alpha, beta_2q, gamma_2q );

  xyz = _add( _add( _add( p, beta_2e ), gamma_2e ), alpha );
  g3d_p( xyz, _neg(beta_2q), gamma_2q, _neg(alpha_2q) );

  xyz = _add( _add( p, alpha_2q ), gamma_2e );
  g3d_p( xyz, _neg(gamma_2e), _neg(alpha_2q), beta_2e );

}

function gilbert3d_plus(w,h,d) {

  g3d_p( [0,0,0], [w,0,0], [0,h,0], [0,0,d] );

}

//gilbert3d_plus(2,2,2);
//


let w = 8;
let h = 8;

if (process.argv.length > 2) {
  w = parseInt(process.argv[2]);
  if (process.argv.length > 3) {
    h = parseInt(process.argv[3]);
  }
}


g2d_p( [0,0, 0], [w,0, 0], [0,h, 0] );
