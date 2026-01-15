#!/usr/bin/env node

// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// priority graph


var fs = require("fs");
var FN = "Focus.md";
var data = fs.readFileSync(FN, "utf8");

let read_state = 'init';

let g_data = [];

let lu = {
  '0':0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7,
  '8':8, '9':9, 'a':10, 'b':11, 'c':12, 'd':13, 'd':14, 'f':15,
  '8':8, '9':9, '10':10, '11':11, '12':12, '13':13, '14':14, '15':15
}

let b16 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

let lines = data.split("\n");
for (let line_no=0; line_no<lines.length; line_no++) {
  let line = lines[line_no];

  if (read_state == 'init') {
    let m = line.match( /^\| +Task +\|/);
    //console.log(".", m);
    if (m) {
      //console.log(">>", line_no, "===> HEADER");
      read_state = 'header';
    }
  }

  else if (read_state == 'header') {
    let m = line.match( /^\|\-\-\-\-*\|/ );
    //console.log("..", m);
    if (m) {
      //console.log(">>>", line_no, "===> BODY");
      read_state = 'body';
    }
  }

  else if (read_state == 'body') {
    let m = line.match( /^\|*([^|]*)\|([^|]*)\|([^\|]*)|/);
    //console.log("...", m);
    if (typeof m[1] !== "undefined") {

      let name = m[1];
      let effort = m[2];
      let priority = m[3];


      name = name.replace( /^ */, '' ).replace( / *$/, '');

      effort = effort.replace( /^ */, '').replace( / *$/, '' ).replace( /`/g, '');
      priority = priority.replace( /^ */, '').replace( / *$/, '' ).replace( /`/g, '');

      //console.log(":" + name + ":", effort, priority);
      //console.log(">>>>", line_no, m, "===> body");

      let i_eff = lu[effort];
      let i_pri = lu[priority];

      g_data.push( [ name, i_eff, i_pri ] );
    }
    else {
      //console.log(">>>>>", line_no, "===> END");
      read_state = 'end';
    }
  }

}

let M = [];
for (let j=0; j<16; j++) {
  M.push( [] );
  for (let i=0; i<16; i++) {
    M[j].push( [] );
  }
}

for (let i=0; i<g_data.length; i++) {
  M[ g_data[i][2] ][ g_data[i][1] ].push( b16[i] );
}


for (let j_pri=0; j_pri<16; j_pri++) {
  for (let i_eff=0; i_eff<16; i_eff++) {
    if ((((j_pri + i_eff)%4) == 0) &&
        (M[j_pri][i_eff].length == 0)) {
    }
  }
}


let pfx = "      ";
console.log("\n" + "priority");

console.log();
for (let j_pri=0; j_pri<16; j_pri++) {
  let _l = [ b16[j_pri] + " | " ];
  for (let i_eff=0; i_eff<16; i_eff++) {

    if (M[j_pri][i_eff].length == 0) {

      if (((j_pri + i_eff)%4)==0) {
        _l.push( '\\  ' );
      }
      else {
        _l.push( '   ' );
      }
    }
    else {
      let v = M[j_pri][i_eff].join(",");
      if (v.length == 1) { v = v + "  "; }
      else if (v.length == 2) { v = v + " "; }
      _l.push( v );
    }
  }
  console.log( pfx + _l.join(" "));
}

console.log(pfx + "  .--------------------------------------------------------------");
console.log(pfx + "    0   1   2   3   4   5   6   7   8   9   a   b   c   d   e   f");
console.log("");
console.log(pfx + " effort --->");
console.log("");

for (let i=0; i<g_data.length; i++) {
  console.log("[" + i.toString() + "]:", g_data[i][0], "(", g_data[i][1], ",", g_data[i][2], ")");
}
console.log("");

g_data.sort( function(a,b) {
  let u = a[1] + (15-a[2]);
  let v = b[1] + (15-b[2]);
  if (u < v) { return -1; }
  if (u > v) { return 1; }
  if (a[1] < b[1]) { return -1; }
  if (a[1] > b[1]) { return 1; }
  return 0;
});

console.log("suggested order");
console.log("---------------");
for (let i=0; i<g_data.length; i++) {
  console.log(g_data[i][0]);
}

console.log("");

