// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var fs = require("fs");

let FNS = [
  "Microban.txt",
  "Microban II.txt",
  "Microban II.txt",
  "Microban III.txt",
  "Microban IV.txt",

  "Sasquatch.txt",
  "Sasquatch II.txt",
  "Sasquatch III.txt",
  "Sasquatch IV.txt",
  "Sasquatch V.txt",
  "Sasquatch VI.txt",
  "Sasquatch VII.txt",
  "Sasquatch VIII.txt",
  "Sasquatch IX.txt",
  "Sasquatch X.txt",
  "Sasquatch XI.txt"
];

function process_file(fn, base_name) {
  base_name = ((typeof base_name === "undefined") ? "" : base_name);

  let json_data = {
    "_key": " . - oustside\n #/x - wall\n b - block\n' ' - (space) inside moveable\n @ - player\n _ - storage (destination)\n + - block on storage (block on destination)",
    "data": {}
  };

  let lines = fs.readFileSync(fn).toString().split("\n");

  let tmp = [];

  let lvl_lines = [];

  let L = [];
  for (let i=0; i<lines.length; i++) {
    let line = lines[i];
    line = line.replace( /\r|\n/g, '' );
    if (line[0] == ';') {
      if (L.length > 0) {
        lvl_lines.push(L);
        L = [];
      }
      continue;
    }

    if (line.length == 0) { continue; }
    L.push(line);
  }

  if (L.length > 0) {
    lvl_lines.push(L);
  }

  for (let idx=0; idx<lvl_lines.length; idx++) {

    let width = 0;
    let height = lvl_lines[idx].length;

    for (let i=0; i<lvl_lines[idx].length; i++) {
      lvl_lines[idx][i] = lvl_lines[idx][i].replace( /#/g, 'x' );
      lvl_lines[idx][i] = lvl_lines[idx][i].replace( /\./g, '_' );
      lvl_lines[idx][i] = lvl_lines[idx][i].replace( /\$/g, 'b' );
      lvl_lines[idx][i] = lvl_lines[idx][i].replace( /\+/g, '!' );
      lvl_lines[idx][i] = lvl_lines[idx][i].replace( /\*/g, '+' );

      if (lvl_lines[idx][i].length > width) {
        width = lvl_lines[idx][i].length;
      }
    }

    let lvl_a = [];
    for (let i=0; i<lvl_lines[idx].length; i++) {
      lvl_a.push( lvl_lines[idx][i].split("") );
    }

    for (let y=0; y<lvl_a.length; y++) {

      while (lvl_a[y].length < width) {
        lvl_a[y].push('x');
      }

      for (let x=0; x<lvl_a[y].length; x++) {
        if (lvl_a[y][x] == 'x') { break; }
        lvl_a[y][x] = 'x';
      }

      for (let x=0; x<lvl_a[y].length; x++) {
        if (lvl_a[y][x] == 'x') { break; }
        lvl_a[y][x] = 'x';
      }

      for (let x = (width-1); x >= 0; x--) {
        if (lvl_a[y][x] == 'x') { break; }
        lvl_a[y][x] = 'x';
      }

    }

    for (let x=0; x<width; x++) {
      for (let y=0; y<height; y++) {
        if (lvl_a[y][x] == 'x') { break; }
        lvl_a[y][x] = 'x';
      }

      for (let y=(height-1); y>=0; y--) {
        if (lvl_a[y][x] == 'x') { break; }
        lvl_a[y][x] = 'x';
      }
    }

    for (let y=0; y<lvl_a.length; y++) {
      lvl_lines[idx][y] = lvl_a[y].join("");
    }
  }


  for (let i=0; i<lvl_lines.length; i++) {
    json_data.data[ base_name + i.toString() ] = lvl_lines[i].join("\n");

  }

  return json_data;
}

var roman_lookup = {
  "i" : 1,
  "ii" : 2,
  "iii" : 3,
  "iv" : 4,
  "v" : 5,
  "vi" : 6,
  "vii" : 7,
  "viii" : 8,
  "ix" : 9,
  "x" : 10,
  "xi" : 11,
  "xii" : 12,

  "I" : 1,
  "II" : 2,
  "III" : 3,
  "IV" : 4,
  "V" : 5,
  "VI" : 6,
  "VII" : 7,
  "VII" : 7,
  "VIII" : 8,
  "IX" : 9,
  "X" : 10,
  "XI" : 11,
  "XII" : 12
};

var json_level = {
  "_key" :  " . - oustside\n #/x - wall\n b - block\n' ' - (space) inside moveable\n @ - player\n _ - storage (destination)\n + - block on storage (block on destination)",
  "data": {}
};

for (let fn_idx=0; fn_idx < FNS.length; fn_idx++) {
  let fn = FNS[fn_idx];

  let name = fn.toLowerCase().replace( / /g, '_').replace( /\.txt/, '' );

  let tok = name.split("_");

  if (tok.length == 2) {
    name = tok[0] + "_" + (roman_lookup[tok[1]]).toString() + "_";
  }
  else {
    name = tok[0] + "_1_";
  }

  let _dat = process_file(fn, name);

  for (let key in _dat.data) {
    json_level.data[key] = _dat.data[key];
  }

}

console.log( JSON.stringify(json_level, undefined, 2) );

