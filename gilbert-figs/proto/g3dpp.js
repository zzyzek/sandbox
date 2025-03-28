

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

function _sgn(v) {
  if (v>0) { return  1; }
  if (v<0) { return -1; }
  return 0;
}

function _neg(v) {
  return [ -v[0], -v[1], -v[2] ];
}

function _add(u,v) {
  return [ u[0]+v[0], u[1]+v[1], u[2]+v[2] ];
}

function g3d_p(p, alpha, beta, gamma) {

  let alpha_2e = [ d2e(alpha[0]), d2e(alpha[1]), d2e(alpha[2]) ];
  let beta_2e  = [ d2e( beta[0]), d2e( beta[1]), d2e( beta[2]) ];
  let gamma_2e = [ d2e(gamma[0]), d2e(gamma[1]), d2e(gamma[2]) ];

  let alpha_2s = [ alpha[0] - alpha_2e[0], alpha[1] - alpha_2e[1], alpha[2] - alpha_2e[2] ];
  let beta_2s  = [  beta[0] -  beta_2e[0],  beta[1] -  beta_2e[1],  beta[2] -  beta_2e[2]  ];
  let gamma_2s = [ gamma[0] - gamma_2e[0], gamma[1] - gamma_2e[1], gamma[2] - gamma_2e[2] ];

  let alpha_2q = [ d2q(alpha[0]), d2q(alpha[1]), d2q(alpha[2]) ];
  let beta_2q  = [ d2q( beta[0]), d2q( beta[1]), d2q( beta[2]) ];
  let gamma_2q = [ d2q(gamma[0]), d2q(gamma[1]), d2q(gamma[2]) ];

  let alpha_2qp = [ alpha[0] - alpha_2q[0], alpha[1] - alpha_2q[1], alpha[2] - alpha_2q[2] ];
  let beta_2qp  = [  beta[0] -  beta_2q[0],  beta[1] -  beta_2q[1],  beta[2] -  beta_2q[2] ];
  let gamma_2qp = [ gamma[0] - gamma_2q[0], gamma[1] - gamma_2q[1], gamma[2] - gamma_2q[2] ];


  let a = Math.abs( alpha[0] + alpha[1] + alpha[2] );
  let b = Math.abs(  beta[0] +  beta[1] +  beta[2] );
  let g = Math.abs( gamma[0] + gamma[1] + gamma[2] );

  console.log(p, a,b,g);

  let d_alpha = [ _sgn(alpha[0]), _sgn(alpha[1]), _sgn(alpha[2]) ];
  let d_beta  = [ _sgn( beta[0]), _sgn( beta[1]), _sgn( beta[2]) ];
  let d_gamma = [ _sgn(gamma[0]), _sgn(gamma[1]), _sgn(gamma[2]) ];

  let xyz = [ p[0], p[1], p[2] ];

  if ((a==1) && (b==1)) {

    for (let i=0; i<g; i++) {
      console.log(xyz[0], xyz[1], xyz[2]);
      xyz[0] += d_alpha[0];
      xyz[1] += d_alpha[1];
      xyz[2] += d_alpha[2];
    }
    return;
  }

  else if ((a==1) && (g==1)) {
    for (let i=0; i<b; i++) {
      console.log(xyz[0], xyz[1], xyz[2]);
      xyz[0] += d_beta[0];
      xyz[1] += d_beta[1];
      xyz[2] += d_beta[2];
    }
    return;
  }

  else if ((b==1) && (g==1)) {
    for (let i=0; i<g; i++) {
      console.log(xyz[0], xyz[1], xyz[2]);
      xyz[0] += d_gamma[0];
      xyz[1] += d_gamma[1];
      xyz[2] += d_gamma[2];
    }
    return;
  }



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

gilbert3d_plus(2,2,2);
