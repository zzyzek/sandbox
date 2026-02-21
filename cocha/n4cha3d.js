#!/usr/bin/node
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// naive O(n^4) convex hull algorithm
//

var fasslib = require("./fasslib");
var fs = require("fs");

function icmp(a,b) {
  if (a<b) { return -1; }
  if (a>b) { return 1; }
  return 0;
}

function vec_cmp(a,b) {
  let n = Math.min(a.length, b.length);
  for (let i=0; i<n; i++) {
    if (a[i] < b[i]) { return -1; }
    if (a[i] > b[i]) { return  1; }
  }
  return 0;
}

function naive_convex_hull_3d(P) {

  let iidx = [0,0,0,0];

  let v_sub = fasslib.v_sub;
  let v_add = fasslib.v_add;
  let cross3 = fasslib.cross3;
  let dot_v = fasslib.dot_v;

  let vtx_list = [];

  let pos_count = 0;


  let n = P.length;
  for (let i0=0; i0<n; i0++) {
    for (let i1=0; i1<n; i1++) {

      if (i1 == i0) { continue; }

      for (let i2=0; i2<n; i2++) {

        if ((i2 == i1) || (i2 == i0)) { continue; }

        let found = true;
        for (let i3=0; i3<n; i3++) {

          if ((i0 == i1) ||
              (i0 == i2) ||
              (i0 == i3) ||
              (i1 == i2) ||
              (i1 == i3) ||
              (i2 == i3)) { continue; }


          let p = P[i0];
          let q = P[i1];
          let r = P[i2];
          let s = P[i3];

          let w = v_sub(p,s);
          let u = v_sub(p,q);
          let v = v_sub(p,r);

          let t = dot_v(w, cross3(u,v));
          if (t > 0) {
            found = false;
            break;
          }

        }

        if (found) {
          let v3 = [i0,i1,i2];
          v3.sort( icmp );
          vtx_list.push(v3);
          break;
        }
      }
    }
  }

  vtx_list.sort( vec_cmp );

  let _l = [ vtx_list[0] ];
  for (let i=1; i<vtx_list.length; i++) {
    if (vec_cmp(vtx_list[i], vtx_list[i-1])!=0) {
      _l.push( vtx_list[i] );
    }
  }

  return _l;
}

let P = [];

if (process.argv.length < 3) {
  console.log("provide filename");
  process.exit(-1);
}

let lines = fs.readFileSync(process.argv[2], "utf8").split("\n");
for (let line_no=0; line_no<lines.length; line_no++) {
  let line = lines[line_no].trim();

  if (line.length==0) { continue; }
  if (line_no==0){ continue; }

  let tok = line.split(" ");
  if (tok.length != 3) { continue; }
  let x = parseFloat(tok[0]);
  let y = parseFloat(tok[1]);
  let z = parseFloat(tok[2]);

  P.push([x,y,z]);
}

for (let i=0; i<P.length; i++) {
  console.log("#", P[i][0], P[i][1], P[i][2]);
}

let vvv = naive_convex_hull_3d(P);

for (let i=0; i<vvv.length; i++) {
  console.log(vvv[i][0], vvv[i][1], vvv[i][2]);
}



