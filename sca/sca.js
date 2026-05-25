

var srand = require("./seedrandom.js");
var RND = srand("sca");


function sca_auxin_rem(ctx, a_idx) {
  let ea_idx = ctx.n_a-1;
  if (ea_idx < 0) { return; }

  info.AV[ a_idx ][0] = info.AV[ ea_idx ][0];
  info.AV[ a_idx ][1] = info.AV[ ea_idx ][1];
  info.AV[ a_idx ][2] = info.AV[ ea_idx ][2];

  let ev_idx = ctx.AV.length-1;

  info.AV[ ea_idx ][0] = info.AV[ ev_idx ][0];
  info.AV[ ea_idx ][1] = info.AV[ ev_idx ][1];
  info.AV[ ea_idx ][2] = info.AV[ ev_idx ][2];
}

function sca_vein_add(ctx, v) {
  info.AV.push( [ v[0], v[1], v[2] ] );
  info.n_v++;
}


function sca_init(A, V) {

  let info = {
    "n_a": A.length,
    "n_v": V.length,
    "AV" : []
  };

  for (let i=0; i<A.length; i++) {
    info.AV.push( [ A[i][0], A[i][1], A[i][2] ] );
  }

  for (let i=0; i<V.length; i++) {
    info.AV.push( [ V[i][0], V[i][1], V[i][2] ] );
  }

  return info;
}

function sca_rand(n_a, n_v) {
  let A = [], V = [];
  for (let i=0; i<n_a; i++) { A.push( [ RND(), RND(), RND() ] ); }
  for (let i=0; i<n_v; i++) { V.push( [ RND(), RND(), RND() ] ); }
  return sca_init(A, V);
}
