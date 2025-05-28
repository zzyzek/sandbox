// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//





var gilbert3dpp = require("./gilbert3dpp.js");
var jimp = require("jimp").Jimp;
var fs = require("fs");

let g2d = gilbert3dpp.Gilbert2D;

function dist(p,q) {
  return Math.sqrt( (p[0] - q[0])*(p[0] - q[0]) + (p[1] - q[1])*(p[1] - q[1]) );
}


function experiment0() {
  let nu_w = 1;

  let multi_point = [];
  let multi_wh = [];

  for (let h=180; h<361; h*=2) {
    let w = Math.floor(nu_w * h);
    multi_point.push( g2d(w,h) );

    multi_wh.push( [w,h] );
  }



  for (let idx=(multi_point.length-1); idx > 0; idx--) {
    let wh_prv = multi_wh[idx-1];
    let wh_cur = multi_wh[idx];

    for (let p_idx=0; p_idx < multi_point[idx].length; p_idx++) {

      let x_cur = p_idx / multi_point[idx].length;

      let q_idx = Math.floor(x_cur * multi_wh[idx-1][0] * multi_wh[idx-1][1]);

      let pxy = [ multi_point[idx][p_idx][0] / wh_cur[0], multi_point[idx][p_idx][1] / wh_cur[1] ];
      let qxy = [ multi_point[idx-1][q_idx][0] / wh_prv[0], multi_point[idx-1][q_idx][1] / wh_prv[1] ];

      console.log(dist(pxy,qxy), 1);
      //console.log(pxy, qxy, dist(pxy,qxy));
    }
  }
}

function stable_diff_2d( wh0, wh1 ) {

  let pnt0 = g2d(wh0[0], wh0[1]);
  let pnt1 = g2d(wh1[0], wh1[1]);

  let fin = [];

  for (let i=0; i<pnt0.length; i++) {
    pnt0[i][0] /= wh0[0];
    pnt0[i][1] /= wh0[1];
    pnt0[i][0] += 1/(2*wh0[0]);
    pnt0[i][1] += 1/(2*wh0[1]);
  }

  for (let i=0; i<pnt1.length; i++) {
    pnt1[i][0] /= wh1[0];
    pnt1[i][1] /= wh1[1];

    pnt1[i][0] += 1/(2*wh1[0]);
    pnt1[i][1] += 1/(2*wh1[1]);
  }

  let ref_reference = 0;

  if (ref_reference) {
    for (let idx0=0; idx0<pnt0.length; idx0++) {
      let idx1 = Math.floor( idx0 * pnt1.length / pnt0.length );
      fin.push( [pnt0[idx0][0], pnt0[idx0][1], dist(pnt0[idx0],pnt1[idx1]) ] );
      //let p = [ pnt0[idx0][0] / wh0[0], pnt0[idx0][1] / wh0[1] ];
      //let q = [ pnt1[idx1][0] / wh1[0], pnt1[idx1][1] / wh1[1] ];
      //fin.push( [p[0], p[1], dist(p,q) ] );
    }
  }
  else {
    for (let idx1=0; idx1<pnt1.length; idx1++) {
      let idx0 = Math.floor( idx1 * pnt0.length / pnt1.length );
      fin.push( [pnt1[idx1][0], pnt1[idx1][1], dist(pnt0[idx0],pnt1[idx1]) ] );
      //let p = [ pnt0[idx0][0] / wh0[0], pnt0[idx0][1] / wh0[1] ];
      //let q = [ pnt1[idx1][0] / wh1[0], pnt1[idx1][1] / wh1[1] ];
      //fin.push( [p[0], p[1], dist(p,q) ] );
    }
  }

  return fin;
}


function spot_test_hilbert() {
  let p = stable_diff_2d( [128,128], [256,256] );
  write_data(p, "ok256.gp");
  p = stable_diff_2d( [256,256], [512,512] );
  write_data(p, "ok512.gp");
}

function write_data(data, fn) {
  let lines = [];

  console.log(fn);

  for (let i=0; i<data.length; i++) {
    lines.push( data[i].join(" ") );
  }

  fs.writeFileSync(fn, lines.join("\n"));
}

function output_diff_data_w100h100_dwh1() {
  let wh = [100,100];
  for (let h_1=101; h_1<200; h_1++) {
    let w_1 = h_1;
    let p = stable_diff_2d(wh, [w_1,h_1]);
    write_data(p, "data/d2d_w" + wh[0].toString() + "h" + wh[1].toString() + "_w" + w_1.toString() + "h" + h_1.toString() + ".gp");
  }
}

function output_diff_data() {
  let wh = [128,128];
  let dwh = 1;
  let H = 1025;

  let wh_prv  = wh;
  for (let h_1=(wh[1]+dwh); h_1<H; h_1+=dwh) {
    let w_1 = h_1;
    let p = stable_diff_2d(wh_prv, [w_1,h_1]);
    write_data(p, "data/d2d_w" + wh_prv[0].toString() + "h" + wh_prv[1].toString() + "_w" + w_1.toString() + "h" + h_1.toString() + ".gp");

    wh_prv = [w_1,h_1];
  }
}

function output_diff_data_nu(nu_0, nu_1, out_dir) {
  out_dir = ((typeof out_dir === "undefined") ? "data/" : out_dir );

  let wh = [128,128];
  wh[0] = Math.floor(wh[1]*nu_0)
  let dwh = 1;
  let H = 1024;

  let wh_prv  = wh;
  for (let h_0=(wh[1]+dwh); h_0<H; h_0+=dwh) {
    let w_0 = Math.floor(nu_0 * h_0);
    let h_1 = h_0;
    let w_1 = Math.floor(nu_1 * h_1);

    let p = stable_diff_2d([w_0,h_0], [w_1,h_1]);
    //write_data(p, "data/d2d_w" + w_0.toString() + "h" + h_0.toString() + "_w" + w_1.toString() + "h" + h_1.toString() + ".gp");
    write_data(p, out_dir + "/d2d_w" + w_0.toString() + "h" + h_0.toString() + "_w" + w_1.toString() + "h" + h_1.toString() + ".gp");
  }
}

function nu_nu_experiment() {

  let nu_s = 0.75;
  let nu_e = 1.5;
  let nu_d = 0.05;

  let nu_N = Math.round( (nu_e-nu_s)/nu_d );

  for (let idx0=0; idx0 < nu_N; idx0++) {
    for (let idx1=0; idx1 < nu_N; idx1++) {

      if (idx0 == idx1) { continue; }

      let nu_0 = nu_s + ((nu_e-nu_s)*idx0 / nu_N);
      let nu_1 = nu_s + ((nu_e-nu_s)*idx1 / nu_N);

      let data_dir = "data/nu_nu_" + idx0.toString() + "_" + idx1.toString();
      fs.mkdirSync(data_dir, {"recursive":true});

      console.log("##", data_dir);

      output_diff_data_nu(nu_0, nu_1, data_dir);

    }
  }
}

//output_diff_data();
//output_diff_data_nu(1,1.1);
//output_diff_data_nu(0.9,1.4, "data_9_14");
nu_nu_experiment();


if (0) {
  console.log(jimp);
  async function main() {
    let img = new jimp({"width":256, "height":256, "color":0xffffffff});
    await img.write("out.png");
  }
  main();
}



//stable_diff_2d( [ 100,100 ], [105, 105] );

