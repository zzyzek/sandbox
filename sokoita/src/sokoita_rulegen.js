// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//     
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var DEBUG_LEVEL = 0;

let LVL = [
  "....xxxxx..........",
  "....x   x..........",
  "....xb  x..........",
  "..xxx  bxx.........",
  "..x  b b x.........",
  "xxx x xx x...xxxxxx",
  "x   x xx xxxxx  __x",
  "x b  b          __x",
  "xxxxx xxx x@xx  __x",
  "....x     xxxxxxxxx",
  "....xxxxxxx........"
  ].join("\n");

LVL = LVL.replace( /\./g, 'x' )
LVL = LVL.replace( /#/g, 'x' )

if (DEBUG_LEVEL > 0) {
  console.log(LVL);
}

// x    - wall
// ' '  - (ascii space) moveable space
// _    - emptry storage location (destination)
// b    - box
// +    - box on strage (goal)
// @    - player
// !    - player on storage location
//

let CODE = [ 'x', ' ', '_', 'b', '+', '@', '!' ];

// * - x b + _ ' '

let dynamics = [

  // no change
  //
  [ "***", "***" ],

  // move
  //
  [ "*@ ", "* @" ],
  [ "* @", "*@ " ],

  [ "*@_", "* !" ],
  [ "* !", "*@_" ],

  [ "*_@", "*! " ],
  [ "*! ", "*_@" ],

  // push block
  //
  [ "@b ", " @b" ],
  [ "@b_", " @+" ],
  [ "@+ ", " !b" ],
  [ "@+_", " !+" ],

  [ "!b ", "_@b" ],
  [ "!b_", "_@+" ],
  [ "!+ ", "_!b" ],
  [ "!+_", "_!+" ],

  [ "*@b", "* @" ],
  [ "* b", "*b@" ],

  [ "*@+", "* !" ],
  [ "* +", "*b!" ],

  [ "*_b", "*+@" ],
  [ "*!b", "*_@" ],

  [ "*!+", "*_!" ],
  [ "*_+", "*+!" ],

  // transverse move
  //
  [ "* *", "*@*" ],
  [ "*@*", "* *" ],

  [ "* *", "*b*" ],
  [ "*b*", "*@*" ],

  [ "*_*", "*!*" ],
  [ "*!*", "*_*" ],

  [ "*_*", "*+*" ],
  [ "*+*", "*!*" ]

];

function construct_transition(tile) {

  let T = [];

  let dxy = [
    {"x":0, "y":0},
    {"x":1, "y":0},
    {"x":0, "y":1},
    {"x":1, "y":1}
  ];

  let type_count = {};
  for (let i=0; i<CODE.length; i++) {
    type_count[CODE[i]] = 0;
  }

  for (let i=0; i<dxy.length; i++) {
    let v = tile[dxy[i].y][dxy[i].x];
    type_count[v]++;
  }

  // nop transition.
  // player must move, so exlcude if agent present.
  //
  if ((type_count['@'] == 0) && (type_count['!'] == 0)) {
    let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
    T.push( {"tile": _t });
  }

  let sd = [
    [ {"x":0, "y":0 }, {"x":1, "y":0} ],
    [ {"x":0, "y":0 }, {"x":0, "y":1} ],

    [ {"x":1, "y":0 }, {"x":0, "y":0} ],
    [ {"x":1, "y":0 }, {"x":1, "y":1} ],

    [ {"x":0, "y":1 }, {"x":0, "y":0} ],
    [ {"x":0, "y":1 }, {"x":1, "y":1} ],

    [ {"x":1, "y":1 }, {"x":1, "y":0} ],
    [ {"x":1, "y":1 }, {"x":0, "y":1} ]
  ];

  for (let i=0; i<sd.length; i++) {
    let sx = sd[i][0].x;
    let sy = sd[i][0].y;

    let ex = sd[i][1].x;
    let ey = sd[i][1].y;

    let sv = tile[sy][sx];
    let ev = tile[ey][ex];

    // player move
    //
    if ((sv == '@') && (ev == ' ')) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = ' ';
      _t[ey][ex] = '@';
      T.push( {"tile": _t });
    }

    if ((sv == '@') && (ev == '_')) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = ' ';
      _t[ey][ex] = '!';
      T.push( {"tile": _t });
    }

    if ((sv == '!') && (ev == ' ')) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = '_';
      _t[ey][ex] = '@';
      T.push( {"tile": _t });
    }

    if ((sv == '!') && (ev == '_')) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = '_';
      _t[ey][ex] = '!';
      T.push( {"tile": _t });
    }

    // block push out
    //
    if ((sv == '@') && (ev == 'b')) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = ' ';
      _t[ey][ex] = '@';
      T.push( {"tile": _t });
    }

    if ((sv == '!') && (ev == 'b')) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = '_';
      _t[ey][ex] = '@';
      T.push( {"tile": _t });
    }

    if ((sv == '@') && (ev == '+')) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = ' ';
      _t[ey][ex] = '!';
      T.push( {"tile": _t });
    }

    if ((sv == '!') && (ev == '+')) {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[sy][sx] = '_';
      _t[ey][ex] = '!';
      T.push( {"tile": _t });
    }

    if ((type_count['@'] == 0) && (type_count['!'] == 0)) {

      if ((sv == 'b') && (ev == ' ')) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[sy][sx] = '@';
        _t[ey][ex] = 'b';
        T.push( {"tile": _t });
      }

      if ((sv == '+') && (ev == ' ')) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[sy][sx] = '!';
        _t[ey][ex] = 'b';
        T.push( {"tile": _t });
      }

      if ((sv == 'b') && (ev == '_')) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[sy][sx] = '@';
        _t[ey][ex] = '+';
        T.push( {"tile": _t });
      }

      if ((sv == '+') && (ev == '_')) {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[sy][sx] = '!';
        _t[ey][ex] = '+';
        T.push( {"tile": _t });
      }

    }


  }


  for (let i=0; i<dxy.length; i++) {
    let x = dxy[i].x;
    let y = dxy[i].y;

    let v = tile[y][x];

    if ((type_count['@'] == 0) && (type_count['!'] == 0)) {

      // block pushed in
      //
      if (tile[y][x] == ' ') {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[y][x] = 'b';
        T.push( {"tile": _t });
      }

      // block pushed in on platform
      //
      if (tile[y][x] == '_') {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[y][x] = '+';
        T.push( {"tile": _t });
      }

    }

    // player comes in
    //
    if ((type_count['@'] == 0) && (type_count['!'] == 0)) {
      if (tile[y][x] == ' ') {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[y][x] = '@';
        T.push( {"tile": _t });
      }

      if (tile[y][x] == '_') {
        let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
        _t[y][x] = '!';
        T.push( {"tile": _t });
      }
    }

    // player moves out
    //
    if (v == '@') {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[y][x] = ' ';
      T.push( {"tile": _t });
    }

    if (v == '!') {
      let _t = [ [ tile[0][0], tile[0][1] ], [ tile[1][0], tile[1][1] ] ];
      _t[y][x] = '_';
      T.push( {"tile": _t });
    }

  }

  for (let i=0; i<T.length; i++) {
    T[i]["key"] = T[i].tile[0].join("") + T[i].tile[1].join("");
  }

  //DEBUG
  //DEBUG
  if (DEBUG_LEVEL > 0) {
    console.log("-----");
    console.log(tile[0].join(""));
    console.log(tile[1].join(""));
    for (let i=0; i<T.length; i++) {
      console.log("  ===>", T[i].key);
      console.log( "  ", T[i].tile[0].join(""));
      console.log( "  ", T[i].tile[1].join(""));
      console.log("");
    }
  }
  //DEBUG
  //DEBUG

  return T;
}

function tile_valid(tile) {
  let player_count = 0;
  for (let y=0; y<2; y++) {
    for (let x=0; x<2; x++) {
      if ((tile[y][x] == '@') || (tile[y][x] == '!')) { player_count++; }
    }
  }
  if (player_count > 1) { return 0; }

  //---

  if ((tile[0][0] == '.') &&
      ((tile[0][1] != '.') && (tile[0][1] != 'x') && (tile[0][1] != '#'))) {
    return 0;
  }

  if ((tile[0][0] == '.') &&
      ((tile[1][0] != '.') && (tile[1][0] != 'x') && (tile[1][0] != '#'))) {
    return 0;
  }


  if ((tile[1][0] == '.') &&
      ((tile[1][1] != '.') && (tile[1][1] != 'x') && (tile[1][1] != '#'))) {
    return 0;
  }

  if ((tile[1][0] == '.') &&
      ((tile[0][0] != '.') && (tile[0][0] != 'x') && (tile[0][0] != '#'))) {
    return 0;
  }


  if ((tile[0][1] == '.') &&
      ((tile[1][1] != '.') && (tile[1][1] != 'x') && (tile[1][1] != '#'))) {
    return 0;
  }

  if ((tile[0][1] == '.') &&
      ((tile[0][0] != '.') && (tile[0][0] != 'x') && (tile[0][0] != '#'))) {
    return 0;
  }


  if ((tile[1][1] == '.') &&
      ((tile[1][0] != '.') && (tile[1][0] != 'x') && (tile[1][0] != '#'))) {
    return 0;
  }

  if ((tile[1][1] == '.') &&
      ((tile[0][1] != '.') && (tile[0][1] != 'x') && (tile[0][1] != '#'))) {
    return 0;
  }

  return 1;
}

function is_trap(tile) {

  if ( (tile[0][0] == 'x') && (tile[1][1] == 'x') &&
      ((tile[0][1] == 'b') || (tile[1][0] == 'b'))) {
    return 1;
  }

  if ( (tile[0][1] == 'x') && (tile[1][0] == 'x') &&
      ((tile[0][0] == 'b') || (tile[1][1] == 'b'))) {
    return 1;
  }


  if ( (tile[0][0] == 'x') && (tile[0][1] == 'x') &&
       (tile[1][0] == 'b') && (tile[1][1] == 'b')) {
    return 1;
  }

  if ( (tile[1][0] == 'x') && (tile[1][1] == 'x') &&
       (tile[0][0] == 'b') && (tile[0][1] == 'b')) {
    return 1;
  }

  if ( (tile[0][0] == 'x') && (tile[1][0] == 'x') &&
       (tile[0][1] == 'b') && (tile[1][1] == 'b')) {
    return 1;
  }

  if ( (tile[0][1] == 'x') && (tile[1][1] == 'x') &&
       (tile[0][0] == 'b') && (tile[1][0] == 'b')) {
    return 1;
  }

  if ( (tile[0][1] == 'b') && (tile[1][1] == 'b') &&
       (tile[0][0] == 'b') && (tile[1][0] == 'b')) {
    return 1;
  }

  let tot = 0,
      b_count = 0;
  for (let y=0; y<2; y++) {
    for (let x=0; x<2; x++) {
      if ((tile[y][x] == 'x') ||
          (tile[y][x] == 'b') ||
          (tile[y][x] == '+')) {
        tot++;
      }
      if (tile[y][x] == 'b') { b_count++; }
    }
  }
  if ((b_count>0) && (tot==4)) { return 1; }

  return 0;
}

function is_goal(tile) {
  let tot = 0,
      g_count = 0;
  for (let y=0; y<2; y++) {
    for (let x=0; x<2; x++) {
      if ((tile[y][x] != 'b') &&
          (tile[y][x] != '!') &&
          (tile[y][x] != '_')) { tot++; }
      if (tile[y][x] == '+') { g_count++; }
    }
  }
  if ((g_count>0) && (tot==4)) { return 1; }

  return 0;
}

let tile_count = 0;


function construct_tile_lib() {

  let tile_lib = {
    "...." : { "id": 0, "key": "....", "tile": [[".", "."],[".","."]], "goal":0, "trap":0 }
  };

  for (let idx00=0; idx00<CODE.length; idx00++) {
    for (let idx01=0; idx01<CODE.length; idx01++) {
      for (let idx10=0; idx10<CODE.length; idx10++) {
        for (let idx11=0; idx11<CODE.length; idx11++) {

          // z y x
          //
          let tile = [ [ '0', '0' ], [ '0', '0' ] ];

          tile[0][0] = CODE[idx00];
          tile[0][1] = CODE[idx01];
          tile[1][0] = CODE[idx10];
          tile[1][1] = CODE[idx11];

          if (!tile_valid(tile)) {

            if (DEBUG_LEVEL > 0) {
              console.log("#skipping:");
              console.log("#", tile[0].join(""));
              console.log("#", tile[1].join(""));
            }
            continue;
          }

          tile_count++;

          let key = tile[0].join("") + tile[1].join("");

          if (key in tile_lib) { console.log("BANG"); }

          tile_lib[key] = {
            "id": tile_count,
            "goal": is_goal(tile),
            "trap": is_trap(tile),
            "key": key,
            "tile": tile
          };

          if (DEBUG_LEVEL > 0) {
            console.log( tile[0].join("") + tile[1].join("") );
            console.log("trap:", is_trap(tile), "goal:", is_goal(tile));
            console.log("/--\\");
            console.log( "|" + tile[0].join("") + "|\n|" + tile[1].join("") + "|" );
            console.log("\\--/");
            console.log("--");
          }
        }
      }
    }
  }

  if (DEBUG_LEVEL > 0) {
    console.log("tile_count:", tile_count);
  }

  return tile_lib;

}

function _eq(a,b) {

  if (a == '*') {
    if ((b == 'x') ||
        (b == 'b') ||
        (b == '+') ||
        (b == '_') ||
        (b == ' ')) {
      return true;
    }
  }
  else if (a == b) { return true; }

  return false;
}

function cval(CODE, src) {
  if (CODE == '*') {
    if ((src == 'x') ||
        (src == ' ') ||
        (src == '_') ||
        (src == 'b') ||
        (src == '+')) {
      return src;
    }
    return 'E';
  }
  return CODE;
}

function tile_str(t) {
  return t[0].join("") + t[1].join("");
}

var tile_lib = construct_tile_lib();

for (let src_key in tile_lib) {
  //console.log("(", key, ")");
  let to_tiles = construct_transition(tile_lib[src_key].tile);


  for (let i=0; i<to_tiles.length; i++) {
    let dst_key = to_tiles[i].key;

    if (!(dst_key in tile_lib)) {
      console.log("ERROR", src_key, dst_key);
    }

    let dst_tile = tile_lib[dst_key];

    if (DEBUG_LEVEL > 0) {
      console.log("---");
      console.log( src_key, "(", tile_lib[src_key].id, ")", "->", dst_key, "(", tile_lib[dst_key].id, ")" );
      console.log( tile_lib[src_key].tile[0].join(""), "", tile_lib[dst_key].tile[0].join("") );
      console.log( tile_lib[src_key].tile[1].join(""), "", tile_lib[dst_key].tile[1].join("") );
      console.log("");
    }

  }

}

//tile_adjacency(tile_lib, dynamics);

if (DEBUG_LEVEL > 0) {
  console.log(JSON.stringify(tile_lib, undefined, 2));
}


